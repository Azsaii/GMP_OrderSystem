import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  ToastAndroid,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Card, Divider, Portal, TextInput as PaperTextInput } from 'react-native-paper';
import CartItem from './CartItem'; // 장바구니의 개별 아이템을 표시하는 컴포넌트
import CouponModal from './CouponModal'; // 쿠폰 선택 모달
import PaymentMethodModal from './PaymentMethodModal'; // 결제 수단을 선택할 수 있는 모달
import styles from '../styles/CheckoutStyles'; // 스타일을 가져옴
import { UserContext } from '../contexts/UserContext';
import { ScrollView } from 'react-native-gesture-handler';

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
    addPoints,
  } = useContext(UserContext);

  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [usedPoints, setUsedPoints] = useState(0);
  const [pointInput, setPointInput] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);

  // 장바구니 총 금액 계산
  const getSubtotal = () => cartItems.reduce((sum, item) => sum + item.price, 0);

  // 쿠폰에 따른 할인 금액 계산
  const getDiscountAmount = (subtotal, coupon) => {
    if (!coupon) return 0;
    if (coupon.minAmount <= subtotal) {
      if (coupon.discount) {
        return coupon.discount;
      } else if (coupon.discountRate) {
        return subtotal * coupon.discountRate;
      }
    }
    return 0;
  };

  // 최종 결제 금액 계산 (할인과 포인트 적용된 금액)
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
    (coupon) => !coupon.used && getSubtotal() >= coupon.minAmount
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
  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      showToast('결제 수단을 선택해주세요.');
      return;
    }

    const totalAmount = getTotal();
    const earnedPoints = Math.ceil(totalAmount * 0.02);

    if (selectedCoupon) {
      markCouponAsUsed(selectedCoupon.id);
      setSelectedCoupon(null);
    }
    if (usedPoints > 0) {
      updatePoints(availablePoints - usedPoints);
      resetPoints();
    }

    if (earnedPoints > 0) {
      addPoints(earnedPoints);
    }

    Alert.alert('결제 완료', `결제가 완료되었습니다. 적립되는 포인트: ${formatNumber(earnedPoints)}점`, [
      {
        text: '확인',
        onPress: () => {
          onClearCart(); // 결제 완료 후 장바구니 비우기
          navigation.navigate('Home');
        },
      },
    ]);
  };

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
                <Text style={styles.orderButtonText}>쿠폰 선택</Text>
              </View>
            </TouchableOpacity>
            <Divider />
            {hasAvailableCoupons && !selectedCoupon && (
              <Text style={styles.availableCouponText}>사용 가능한 쿠폰이 있습니다.</Text>
            )}
            {selectedCoupon && (
              <>
                <Text style={styles.selectedCoupon}>
                  적용된 쿠폰: {selectedCoupon.name} (-{formatNumber(getDiscountAmount(getSubtotal(), selectedCoupon))}원 할인)
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
            <FlatList
              data={paymentMethods}
              keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }} // 각 열이 좌우로 공간을 가지도록
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
          </Card.Content>
        </Card>
      </View>

      {/* 총 결제 금액 */}
      <Card style={[styles.totalCard, { backgroundColor: '#f0f0f0' }]}>
        <Card.Content>
          <Text style={styles.totalText}>총 결제 금액: {formatNumber(getTotal())}원</Text>
          {selectedCoupon && (
            <Text style={styles.discountText}>
              쿠폰 할인: -{formatNumber(getDiscountAmount(getSubtotal(), selectedCoupon))}원
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
      <TouchableOpacity onPress={handlePayment}>
        <View style={styles.orderButton}>
          <Text style={styles.orderButtonText}>
            결제하기 ({formatNumber(getTotal())}원)
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
