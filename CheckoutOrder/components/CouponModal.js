// CheckoutOrder/components/CouponModal.js

import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { Dialog, List, Button, Divider } from 'react-native-paper';
import styles from '../styles/CheckoutStyles';

// 쿠폰 모달 컴포넌트
const CouponModal = ({
  visible,
  onDismiss,
  coupons,
  getSubtotal,
  setSelectedCoupon,
  getDiscountAmount,
}) => {
  // 쿠폰 선택 처리 함수
  const handleCouponSelect = (coupon) => {
    setSelectedCoupon(coupon); // 쿠폰 선택
    onDismiss(); // 모달 닫기
  };

  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>쿠폰 선택</Dialog.Title>
      <Dialog.Content>
        {coupons.map((coupon) => {
          // 쿠폰이 사용되었거나 최소 주문 금액을 넘지 못하면 비활성화
          const isDisabled = getSubtotal() < coupon.minOrderValue || coupon.used;

          return (
            <View
              key={coupon.id}
              style={[
                styles.couponItem,
                isDisabled
                  ? { backgroundColor: '#e0e0e0' }
                  : { backgroundColor: '#f0f0f0' },
              ]}
            >
              <TouchableWithoutFeedback
                onPress={() => {
                  if (!isDisabled && !coupon.used) {
                    handleCouponSelect(coupon); // 쿠폰 선택
                  }
                }}
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
                          시작일: {coupon.startDate}
                        </Text>
                        <Text style={{ color: 'black' }}>
                          종료일: {coupon.endDate}
                        </Text>
                        <Text style={{ color: 'black' }}>
                          사용 가능 여부: {coupon.available ? '사용 가능' : '사용 불가'}
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
          );
        })}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>닫기</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default CouponModal;
