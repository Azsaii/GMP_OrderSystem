// CheckoutOrder/components/CheckoutScreen.js

import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ToastAndroid,
  Alert,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Card, Divider, Portal, TextInput as PaperTextInput } from 'react-native-paper';
import CartItem from './CartItem';
import CouponModal from './CouponModal';
import PaymentMethodModal from './PaymentMethodModal';
import styles from '../styles/CheckoutStyles';
import { UserContext } from '../contexts/UserContext';
import { firestore, auth } from '../../firebaseConfig';
import { doc, collection, runTransaction } from 'firebase/firestore';
import moment from 'moment';

// 숫자를 천 단위로 콤마로 구분해주는 함수
const formatNumber = (num) => (num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0');

const CheckoutScreen = ({ route, navigation, onClearCart }) => {
  const { cartItems } = route.params;

  const {
    points: availablePoints,
    coupons,
    paymentMethods,
    updatePoints,
    markCouponAsUsed,
    userName,
    addPaymentMethod,
  } = useContext(UserContext);

  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [usedPoints, setUsedPoints] = useState(0);
  const [pointInput, setPointInput] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 장바구니 총 금액 계산
  const getSubtotal = () =>
    cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // 쿠폰에 따른 할인 금액 계산
  const getDiscountAmount = (subtotal, coupon) => {
    if (!coupon) return 0;
    if (coupon.minOrderValue <= subtotal) {
      if (coupon.discountType === '원') {
        return coupon.discountValue;
      } else if (coupon.discountType === '%') {
        return Math.floor(subtotal * (coupon.discountValue / 100));
      }
    }
    return 0;
  };

  // 최종 결제 금액 계산
  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = getDiscountAmount(subtotal, selectedCoupon);
    const total = subtotal - discount - usedPoints;
    return total > 0 ? total : 0;
  };

  // 결제 수단을 선택하는 함수
  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentType(method.type);
    if (!method.isRegistered) {
      setPaymentModalVisible(true);
    } else {
      setSelectedPaymentMethod(method);
    }
  };

  // 사용 가능한 쿠폰이 있는지 여부를 확인
  const hasAvailableCoupons = coupons.some(
    (coupon) => !coupon.used && getSubtotal() >= coupon.minOrderValue && coupon.available
  );

  // 포인트 입력값을 초기화하는 함수
  const resetPoints = () => {
    setPointInput('');
    setUsedPoints(0);
  };

  // 입력된 포인트 적용
  const applyPoints = (value) => {
    const points = parseInt(value, 10);

    if (isNaN(points) || points <= 0) {
      showToast('사용할 포인트를 정확히 입력하세요.');
      resetPoints();
      return;
    }

    if (points > availablePoints) {
      showToast('보유한 포인트보다 많이 사용할 수 없습니다.');
      resetPoints();
    } else {
      setUsedPoints(points);
    }
  };

  // Toast 알림을 표시하는 함수
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('알림', message);
    }
  };

  // 사용 가능한 포인트 모두 적용
  const handleFullPointsUsage = () => {
    setPointInput(availablePoints.toString());
    setUsedPoints(availablePoints);
  };

  // 포인트 사용 취소
  const cancelPoints = () => {
    resetPoints();
  };

  // 쿠폰 사용 취소
  const cancelCoupon = () => {
    setSelectedCoupon(null);
  };

  // 결제 처리 함수
  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      showToast('결제 수단을 선택해주세요.');
      return;
    }

    const subtotal = getSubtotal();
    const discount = getDiscountAmount(subtotal, selectedCoupon);
    const totalAmount = subtotal - discount - usedPoints;

    if (totalAmount < 0) {
      showToast('포인트 사용 금액이 총 금액을 초과했습니다.');
      return;
    }

    const earnedPoints = Math.ceil(totalAmount * 0.02);

    setIsProcessing(true);

    try {
      // 쿠폰 사용 처리
      if (selectedCoupon) {
        await markCouponAsUsed(selectedCoupon.id);
        setSelectedCoupon(null);
      }

      // 포인트 차감 및 적립 계산
      const newPoints = availablePoints - usedPoints + earnedPoints;
      await updatePoints(newPoints);

      // 주문 정보 Firestore에 저장
      await saveOrderToFirestore({
        customerId: auth.currentUser.uid,
        customerName: userName || 'Unknown',
        menuList: cartItems.map((item) => ({
          menuId: item.id.toString(),
          menuName: item.name,
          options: [
            item.size || '사이즈 설정 X',
            item.temperature || '온도 설정 X',
            item.extraShot ? '샷 추가 O' : '샷 추가 X',
          ].filter(Boolean),
          quantity: item.quantity.toString(),
        })),
        total: getTotal().toString(), // total을 전체 주문 금액으로 변경
        createdAt: moment().unix().toString(),
        updatedAt: moment().unix().toString(),
        isCompleted: false,
        isStarted: false,
      });

      // 결제 완료 후 알림
      Alert.alert('결제 완료', `결제가 완료되었습니다.\n적립된 포인트: ${earnedPoints}점`, [
        {
          text: '확인',
          onPress: () => {
            onClearCart();
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (error) {
      console.error('결제 처리 중 오류:', error);
      Alert.alert('결제 실패', '결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 주문 정보를 Firestore에 저장하는 함수
  const saveOrderToFirestore = async (orderData) => {
    try {
      const dateString = moment().format('YYMMDD');
      const dateDocRef = doc(firestore, 'orders', dateString);

      await runTransaction(firestore, async (transaction) => {
        const dateDoc = await transaction.get(dateDocRef);

        let orderCount;

        if (!dateDoc.exists()) {
          // 날짜 문서가 없으면 생성하고 orderCount를 0으로 설정
          orderCount = 0;
          transaction.set(dateDocRef, { orderCount: 1 });
        } else {
          // 날짜 문서가 존재하면 orderCount를 가져옴
          orderCount = dateDoc.data().orderCount || 0;
          transaction.update(dateDocRef, { orderCount: orderCount + 1 });
        }

        const ordersCollectionRef = collection(dateDocRef, 'orders');
        const orderDocRef = doc(ordersCollectionRef, orderCount.toString());

        transaction.set(orderDocRef, orderData);
      });
    } catch (error) {
      console.error('주문 정보 저장 중 오류 발생:', error);
      throw error;
    }
  };

  // 결제 수단 업데이트를 위한 useEffect 추가
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethods[0]); // 기본 결제 수단 설정 (첫 번째)
    }
  }, [paymentMethods]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* 주문 내역 표시 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}> 주문 상품</Text>
        <Card style={[styles.card, styles.roundedCard]}>
          <Card.Content>
            <FlatList
              data={cartItems}
              keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <CartItem item={item} />
                </View>
              )}
              scrollEnabled={false}
            />
            <Text style={styles.subtotal}>합계: {formatNumber(getSubtotal())}원</Text>
          </Card.Content>
        </Card>
      </View>

      {/* 쿠폰 모달 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}> 쿠폰 적용</Text>
        <Card style={[styles.card, styles.roundedCard]}>
          <Card.Content>
            <TouchableOpacity onPress={() => setCouponModalVisible(true)}>
              <View style={styles.orderButton}>
                <Text style={styles.orderButtonText}> 쿠폰 선택</Text>
              </View>
            </TouchableOpacity>
            <Divider />
            {hasAvailableCoupons && !selectedCoupon && (
              <Text style={styles.availableCouponText}>사용 가능한 쿠폰이 있습니다.</Text>
            )}
            {selectedCoupon && (
              <>
                <Text style={styles.selectedCoupon}>
                  적용된 쿠폰: {selectedCoupon.name} (
                  {selectedCoupon.discountType === '원'
                    ? `-${formatNumber(selectedCoupon.discountValue)}원 할인`
                    : `-${formatNumber(getDiscountAmount(getSubtotal(), selectedCoupon))}% 할인`}
                  )
                </Text>
                <TouchableOpacity onPress={cancelCoupon}>
                  <View style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>쿠폰 적용 취소</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* 포인트 사용 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}> 포인트 사용</Text>
        <Card style={[styles.card, styles.roundedCard]}>
          <Card.Content>
            <Text style={styles.label}>보유 포인트: {formatNumber(availablePoints)}점</Text>
            <PaperTextInput
              label="사용할 포인트 입력"
              value={pointInput}
              onChangeText={(value) => {
                setPointInput(value);
                applyPoints(value);
              }}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: 'white', color: 'black' }]}
            />
            <TouchableOpacity onPress={handleFullPointsUsage}>
              <View style={styles.orderButton}>
                <Text style={styles.orderButtonText}>포인트 모두 사용</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelPoints}>
              <View style={styles.clearButton}>
                <Text style={styles.clearButtonText}>포인트 사용 취소</Text>
              </View>
            </TouchableOpacity>
            {usedPoints > 0 && (
              <Text style={styles.usedPoints}>사용한 포인트: {formatNumber(usedPoints)}원</Text>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* 결제 수단 선택 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}> 결제 수단 선택</Text>
        <Card style={[styles.card, styles.roundedCard]} mode="outlined">
          <Card.Content>
            {paymentMethods.length === 0 ? (
              <Text style={{ textAlign: 'center', marginVertical: 20 }}>등록된 결제 수단이 없습니다.</Text>
            ) : (
              <FlatList
                data={paymentMethods}
                keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handlePaymentMethodSelect(item)}>
                    <View
                      style={[
                        styles.paymentMethodItem,
                        selectedPaymentMethod?.id === item.id && styles.selectedPaymentMethodItem,
                        { width: 160, height: 90 },
                      ]}
                    >
                      <Text style={styles.paymentMethodText}>{item.name}</Text>
                      {!['KakaoPay', 'TossPay'].includes(item.type) && item.isRegistered && (
                        <Text style={styles.registeredText}>등록 완료</Text>
                      )}
                      {!['KakaoPay', 'TossPay'].includes(item.type) && !item.isRegistered && (
                        <Text style={styles.registerText}>등록 필요</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            )}
          </Card.Content>
        </Card>
      </View>

      {/* 총 결제 금액 */}
      <Card style={[styles.totalCard, { backgroundColor: '#f0f0f0' }]}>
        <Card.Content>
          <Text style={styles.totalText}>총 결제 금액: {formatNumber(getTotal())}원</Text>
          {selectedCoupon && (
            <Text style={styles.discountText}>
              쿠폰 할인: -{formatNumber(getDiscountAmount(getSubtotal(), selectedCoupon))}{selectedCoupon.discountType === '원' ? '원' : '%'}
            </Text>
          )}
          {usedPoints > 0 && (
            <Text style={styles.discountText}>포인트 사용: -{formatNumber(usedPoints)}원</Text>
          )}
          <Text style={styles.earnedPointsText}>
            포인트 적립: +{formatNumber(Math.ceil(getTotal() * 0.02))}점
          </Text>
        </Card.Content>
      </Card>

      {/* 결제 버튼 */}
      <TouchableOpacity onPress={handlePayment} disabled={isProcessing}>
        <View style={[styles.orderButton, isProcessing && { opacity: 0.5 }]}>
          <Text style={styles.orderButtonText}>
            {isProcessing ? '결제 처리 중...' : `결제하기 (${formatNumber(getTotal())}원)`}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 모달들 */}
      <Portal>
        <CouponModal
          visible={couponModalVisible}
          onDismiss={() => setCouponModalVisible(false)}
          coupons={coupons}
          getSubtotal={getSubtotal}
          setSelectedCoupon={setSelectedCoupon}
          getDiscountAmount={getDiscountAmount}
        />
        <PaymentMethodModal
          visible={paymentModalVisible}
          onDismiss={() => setPaymentModalVisible(false)}
          selectedPaymentType={selectedPaymentType}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          setPaymentModalVisible={setPaymentModalVisible}
        />
      </Portal>
    </ScrollView>
  );
};

export default CheckoutScreen;
