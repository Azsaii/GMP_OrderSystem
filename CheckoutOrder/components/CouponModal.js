// CheckoutOrder/components/CouponModal.js

import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { Dialog, List, Button, Divider } from 'react-native-paper';
import styles from '../styles/CheckoutStyles';

const CouponModal = ({
  visible,
  onDismiss,
  coupons,
  getSubtotal,
  setSelectedCoupon,
  getDiscountAmount,
}) => {
  const handleCouponSelect = (coupon) => {
    setSelectedCoupon(coupon);
    onDismiss();
  };

  // 필터링된 쿠폰 목록: 사용되지 않았고, 최소 주문 금액을 만족하며, 사용 가능 상태
  const availableCoupons = coupons.filter(
    (coupon) =>
      !coupon.used &&
      getSubtotal() >= coupon.minOrderValue &&
      coupon.available
  );

  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>쿠폰 선택</Dialog.Title>
      <Dialog.Content>
        {availableCoupons.length === 0 ? (
          <Text style={{ textAlign: 'center', marginVertical: 20 }}>
            사용 가능한 쿠폰이 없습니다.
          </Text>
        ) : (
          availableCoupons.map((coupon) => (
            <View
              key={coupon.id}
              style={[
                styles.couponItem,
                { backgroundColor: '#f0f0f0' },
              ]}
            >
              <TouchableWithoutFeedback
                onPress={() => handleCouponSelect(coupon)}
              >
                <View style={styles.couponTouchable}>
                  <List.Item
                    title={
                      <Text style={{ color: 'black', fontWeight: 'bold' }}>
                        {coupon.name}
                      </Text>
                    }
                    description={
                      <View>
                        <Text style={{ color: 'black' }}>{coupon.description}</Text>
                        <Text style={{ color: 'black' }}>
                          최소 주문 금액: {coupon.minOrderValue}원
                        </Text>
                        <Text style={{ color: 'black' }}>
                          할인 유형: {coupon.discountType === '%' ? '% 할인' : '고정 금액 할인'}
                        </Text>
                        <Text style={{ color: 'black' }}>
                          할인 금액: {coupon.discountValue}{coupon.discountType}
                        </Text>
                        {coupon.discountType === '%' && (
                          <Text style={{ color: 'black' }}>
                            최대 할인 금액: {coupon.maxDiscountValue}원
                          </Text>
                        )}
                        <Text style={{ color: 'black' }}>
                          유효 기간: {coupon.startDate} ~ {coupon.endDate}
                        </Text>
                        <Text style={{ color: 'black' }}>
                          결합 가능 여부: {coupon.canBeCombined ? '결합 가능' : '결합 불가'}
                        </Text>
                      </View>
                    }
                    titleStyle={{ color: 'black' }}
                    descriptionStyle={{ color: 'black' }}
                  />
                </View>
              </TouchableWithoutFeedback>
              <Divider />
            </View>
          ))
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>닫기</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default CouponModal;
