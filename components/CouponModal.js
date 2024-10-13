// components/CouponModal.js

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
          const isDisabled = getSubtotal() < coupon.minAmount || coupon.used;

          return (
            <View
              key={coupon.id}
              style={[
                styles.couponItem,
                isDisabled
                  ? { backgroundColor: '#e0e0e0' }
                  : { backgroundColor: '#f0f0f0' },
              ]}>
              <TouchableWithoutFeedback
                onPress={() => {
                  if (!isDisabled && !coupon.used) {
                    handleCouponSelect(coupon); // 쿠폰 선택
                  }
                }}>
                <View style={styles.couponTouchable}>
                  <List.Item
                    title={
                      coupon.used ? ( // 사용된 쿠폰은 "사용 완료"로 표시
                        <Text style={styles.usedText}>사용 완료</Text>
                      ) : isDisabled ? (
                        <Text style={styles.disabledText}>사용 불가</Text>
                      ) : (
                        <Text style={styles.enabledText}>사용 가능</Text>
                      )
                    }
                    description={
                      <View>
                        <Text style={{ color: 'black' }}>{coupon.name}</Text>
                        {/* 쿠폰의 최소 주문 금액 표시 */}
                        <Text style={{ color: 'black' }}>
                          최소 주문 금액: {coupon.minAmount}원
                        </Text>
                        {/* 실제 할인 금액 표시 */}
                        <Text style={{ color: 'black' }}>
                          실제 할인 금액: {getDiscountAmount(getSubtotal(), coupon)}원
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
