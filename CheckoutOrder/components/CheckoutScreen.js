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
  StyleSheet,
} from 'react-native';
import { Card, Divider, Portal, TextInput as PaperTextInput, IconButton } from 'react-native-paper';
import CartItem from './CartItem';
import CouponModal from './CouponModal';
import PaymentMethodModal from './PaymentMethodModal';
import CouponRegistrationModal from './CouponRegistrationModal';
import styles from '../styles/CheckoutStyles';
import { UserContext } from '../contexts/UserContext';
import { firestore, auth } from '../../firebaseConfig';
import { doc, collection, runTransaction, getDoc } from 'firebase/firestore'; // 수정된 부분: getDoc 추가
import moment from 'moment';

const formatNumber = (num) => (num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0');

const CheckoutScreen = ({ route, navigation, onClearCart }) => {
  const { cartItems } = route.params;

  const {
    points: availablePoints,
    unusedCoupons,
    paymentMethods,
    updatePoints,
    markCouponsAsUsed,
    unregisterPaymentMethod,
    userName,
    addPaymentMethod,
  } = useContext(UserContext);

  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [couponRegistrationModalVisible, setCouponRegistrationModalVisible] = useState(false);
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [usedPoints, setUsedPoints] = useState(0);
  const [pointInput, setPointInput] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [unusedCouponDetails, setUnusedCouponDetails] = useState([]);

  // 장바구니 총 금액 계산
  const getSubtotal = () =>
    cartItems.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);

  // 쿠폰 정보를 Firestore에서 가져오는 함수
  const [couponDetails, setCouponDetails] = useState([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (selectedCoupons.length > 0) {
        try {
          const couponPromises = selectedCoupons.map(async (couponId) => {
            const couponDocRef = doc(firestore, 'coupon', couponId);
            const couponDoc = await getDoc(couponDocRef);
            if (couponDoc.exists()) {
              return { id: couponDoc.id, ...couponDoc.data() };
            } else {
              return null;
            }
          });

          const couponsData = await Promise.all(couponPromises);
          setCouponDetails(couponsData.filter((coupon) => coupon !== null));
        } catch (error) {
          console.error('쿠폰 정보 가져오기 오류:', error);
        }
      } else {
        setCouponDetails([]);
      }
    };

    fetchCoupons();
  }, [selectedCoupons]);

  // unusedCoupons의 상세 정보를 Firestore에서 가져오는 함수
  useEffect(() => {
    const fetchUnusedCoupons = async () => {
      if (unusedCoupons.length > 0) {
        try {
          const couponPromises = unusedCoupons.map(async (couponId) => {
            const couponDocRef = doc(firestore, 'coupon', couponId);
            const couponDoc = await getDoc(couponDocRef);
            if (couponDoc.exists()) {
              return { id: couponDoc.id, ...couponDoc.data() };
            } else {
              return null;
            }
          });
  
          const couponsData = await Promise.all(couponPromises);
          setUnusedCouponDetails(couponsData.filter(coupon => coupon !== null));
        } catch (error) {
          console.error('Unused coupons fetch error:', error);
        }
      } else {
        setUnusedCouponDetails([]);
      }
    };
  
    fetchUnusedCoupons();
  }, [unusedCoupons]);

  // 쿠폰에 따른 할인 금액 계산

  const getTotalDiscount = () => {
    let totalDiscount = 0;
    const subtotal = getSubtotal();
    let remainingSubtotal = subtotal;

    // 고정 금액 할인 먼저 적용
    const fixedCoupons = couponDetails.filter(coupon => coupon.discountType === '원');
    fixedCoupons.forEach(coupon => {
      if (remainingSubtotal < coupon.minOrderValue) return;
      const discountValue = Number(coupon.discountValue);
      if (isNaN(discountValue) || discountValue <= 0) {
        console.warn(`유효하지 않은 discountValue for coupon ${coupon.id}: ${coupon.discountValue}`);
        return;
      }

      // 고정 금액 할인에서는 maxDiscountValue를 무시하고 discountValue만 사용
      const discount = discountValue;
      totalDiscount += discount;
      remainingSubtotal -= discount;
    });

    // 퍼센트 할인 나중에 적용
    const percentCoupons = couponDetails.filter(coupon => coupon.discountType === '%');
    percentCoupons.forEach(coupon => {
      if (remainingSubtotal < coupon.minOrderValue) return;

      const discountValue = Number(coupon.discountValue);
      if (isNaN(discountValue) || discountValue <= 0) {
        console.warn(`유효하지 않은 discountValue for coupon ${coupon.id}: ${coupon.discountValue}`);
        return;
      }

      const calculatedDiscount = Math.floor((remainingSubtotal * discountValue) / 100);
      let discount = calculatedDiscount;

      if (coupon.maxDiscountValue && Number(coupon.maxDiscountValue) > 0) {
        const maxDiscountValue = Number(coupon.maxDiscountValue);
        if (!isNaN(maxDiscountValue)) {
          discount = Math.min(calculatedDiscount, maxDiscountValue);
        }
      }

      totalDiscount += discount;
      remainingSubtotal -= discount;
    });

    // 최종 할인 금액이 subtotal을 초과하지 않도록 조정
    if (totalDiscount > subtotal) {
      totalDiscount = subtotal;
    }

    return totalDiscount;
  };


  // 최종 결제 금액 계산
  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = getTotalDiscount();
    const total = subtotal - discount - usedPoints;
    console.log(`Subtotal: ${subtotal}, Discount: ${discount}, Used Points: ${usedPoints}, Total: ${total}`);
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

  // 결제 수단 삭제 함수
  const handleDeletePaymentMethod = (methodId) => {
    Alert.alert(
      '결제 수단 삭제',
      '해당 결제 수단을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            unregisterPaymentMethod(methodId);
            if (selectedPaymentMethod?.id === methodId) {
              setSelectedPaymentMethod(null);
            }
            showToast('결제 수단이 삭제되었습니다.');
          },
        },
      ]
    );
  };

  // 사용 가능한 쿠폰이 있는지 여부를 확인
  const hasAvailableCoupons = unusedCouponDetails.some(
    (coupon) => getSubtotal() >= coupon.minOrderValue
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
  const cancelCoupons = () => {
    setSelectedCoupons([]);
  };

  // 결제 처리 함수
  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      showToast('결제 수단을 선택해주세요.');
      return;
    }

    const subtotal = getSubtotal();
    const discount = getTotalDiscount();
    const total = subtotal - discount - usedPoints;

    if (total < 0) {
      showToast('포인트 사용 금액이 총 금액을 초과했습니다.');
      return;
    }

    Alert.alert(
      '결제 확인',
      `결제하시겠습니까?\n결제 금액: ${formatNumber(total)}원`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '확인', 
          onPress: async () => {
            setIsProcessing(true);

            try {
              // 쿠폰 사용 처리
              if (selectedCoupons.length > 0) {
                await markCouponsAsUsed(selectedCoupons);
                setSelectedCoupons([]);
              }

              // 포인트 차감 및 적립 계산
              const earnedPoints = Math.ceil(total * 0.02);
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
                  price: item.totalPrice.toString(),
                })),
                total: total.toString(),
                createdAt: moment().unix(),
                updatedAt: moment().unix(),
                isCompleted: false,
                isStarted: false,
              });

              // 결제 완료 후 알림
              Alert.alert(
                '결제 완료',
                `결제가 완료되었습니다.\n적립된 포인트: ${earnedPoints}점`,
                [
                  {
                    text: '확인',
                    onPress: () => {
                      onClearCart();
                      navigation.navigate('Home');
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('결제 처리 중 오류:', error);
              Alert.alert('결제 실패', '결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ],
      { cancelable: false }
    );
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

  // 각 쿠폰별 할인 금액을 계산하는 로직
  const calculateAppliedCoupons = () => {
    let subtotal = getSubtotal();
    let remainingSubtotal = subtotal;
    let totalDiscount = 0;
    const appliedCoupons = [];

    // 선택된 쿠폰의 상세 정보를 사용하여 할인 계산
    // 고정 금액 할인 먼저 적용
    const fixedCoupons = couponDetails.filter(coupon => coupon.discountType === '원');
    fixedCoupons.forEach(coupon => {
      if (remainingSubtotal >= coupon.minOrderValue) {
        const discountValue = Number(coupon.discountValue);
        const maxDiscountValue = coupon.maxDiscountValue !== undefined ? Number(coupon.maxDiscountValue) : discountValue;
        const discount = Math.min(discountValue, maxDiscountValue);
        appliedCoupons.push({ coupon, discount });
        totalDiscount += discount;
        remainingSubtotal -= discount;
      }
    });

    // 퍼센트 할인 나중에 적용
    const percentCoupons = couponDetails.filter(coupon => coupon.discountType === '%');
    percentCoupons.forEach(coupon => {
      if (remainingSubtotal >= coupon.minOrderValue) {
        const discountValue = Number(coupon.discountValue);
        const maxDiscountValue = coupon.maxDiscountValue !== undefined ? Number(coupon.maxDiscountValue) : calculatedDiscount;
        const calculatedDiscount = Math.floor((remainingSubtotal * discountValue) / 100);
        const discount = Math.min(calculatedDiscount, maxDiscountValue);
        appliedCoupons.push({ coupon, discount });
        totalDiscount += discount;
        remainingSubtotal -= discount;
      }
    });

    // 최종 할인 금액이 subtotal을 초과하지 않도록 조정
    if (totalDiscount > subtotal) {
      totalDiscount = subtotal;
    }

    return appliedCoupons;
  };

  const appliedCoupons = calculateAppliedCoupons();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* 주문 내역 표시 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>  주문 상품</Text>
        </View>
        <Card style={[styles.card, styles.roundedCard]}>
          <Card.Content>
            <FlatList
              data={cartItems}
              keyExtractor={(item, index) => `${item.id}_${index}`} // 고유 키 수정
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

      {/* 쿠폰 적용 */}
      <View style={styles.sectionContainer}>
        <View style={styles.couponHeader}>
          <Text style={styles.sectionTitle}>  쿠폰 적용</Text>
          <TouchableOpacity onPress={() => setCouponRegistrationModalVisible(true)}>
            <View style={styles.CouponButton}>
              <Text style={styles.CouponButtonText}>쿠폰 등록</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Card style={[styles.card, styles.roundedCard]}>
          <Card.Content>
            <TouchableOpacity onPress={() => setCouponModalVisible(true)}>
              <View style={styles.orderButton}>
                <Text style={styles.orderButtonText}>쿠폰 선택</Text>
              </View>
            </TouchableOpacity>
            <Divider />
            {hasAvailableCoupons && selectedCoupons.length === 0 && (
              <Text style={styles.availableCouponText}>사용 가능한 쿠폰이 있습니다.</Text>
            )}
            {couponDetails.length > 0 && (
              <>
                {couponDetails.map((coupon) => (
                  <View key={`${coupon.name}_${coupon.discountType}`} style={{ marginTop: 10 }}>
                    <Text style={styles.selectedCoupon}>
                      적용된 쿠폰: {coupon.name} (
                      {coupon.discountType === '원'
                        ? `-${formatNumber(coupon.discountValue)}원 할인`
                        : `-${formatNumber(coupon.discountValue)}% 할인`}
                    )
                    </Text>
                  </View>
                ))}
                <TouchableOpacity onPress={cancelCoupons}>
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>  포인트 사용</Text>
        </View>
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>  결제 수단 선택</Text>
        </View>
        <Card style={[styles.card, styles.roundedCard]} mode="outlined">
          <Card.Content>
            {paymentMethods.length === 0 ? (
              <Text style={{ textAlign: 'center', marginVertical: 20 }}>등록된 결제 수단이 없습니다.</Text>
            ) : (
              <FlatList
                data={paymentMethods}
                keyExtractor={(item, index) => `${item.id}_${index}`} // 고유 키 수정
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => (
                  <View style={{ position: 'relative', marginBottom: 10 }}>
                    <TouchableOpacity onPress={() => handlePaymentMethodSelect(item)}>
                      <View
                        style={[
                          styles.paymentMethodItem,
                          selectedPaymentMethod?.id === item.id && styles.selectedPaymentMethodItem,
                          { width: 160, height: 90 },
                        ]}
                      >
                        <Text style={styles.paymentMethodText}>{item.name}</Text>
                        {item.isRegistered ? (
                          <Text style={styles.registeredText}>등록 완료</Text>
                        ) : (
                          <Text style={styles.registerText}>등록 필요</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                    {item.isRegistered && (
                      <TouchableOpacity
                        onPress={() => handleDeletePaymentMethod(item.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>X</Text>
                      </TouchableOpacity>
                    )}
                  </View>
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
          {appliedCoupons.length > 0 && (
            appliedCoupons.map(({ coupon, discount }) => (
              <Text key={`${coupon.name}_${coupon.discountType}`} style={styles.discountText}>
                쿠폰 할인: -
                {coupon.discountType === '%' 
                  ? `${coupon.discountValue}%` 
                  : `${formatNumber(coupon.discountValue)}원`}
                {coupon.discountType === '%' &&  `(-${formatNumber(discount)}원)`}
              </Text>
            ))
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
          unusedCoupons={unusedCoupons}
          getSubtotal={getSubtotal}
          setSelectedCoupons={setSelectedCoupons}
          getDiscountAmount={getTotalDiscount}
        />
        <PaymentMethodModal
          visible={paymentModalVisible}
          onDismiss={() => setPaymentModalVisible(false)}
          selectedPaymentType={selectedPaymentType}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          setPaymentModalVisible={setPaymentModalVisible}
        />
        <CouponRegistrationModal
          visible={couponRegistrationModalVisible}
          onDismiss={() => setCouponRegistrationModalVisible(false)}
        />
      </Portal>
    </ScrollView>
  );
};

export default CheckoutScreen;
