// CheckoutOrder/components/CouponModal.js

import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, FlatList, Alert } from 'react-native';
import { Dialog, List, Button, Divider } from 'react-native-paper';
import styles from '../styles/CheckoutStyles';

const CouponModal = ({
  visible,
  onDismiss,
  coupons,
  getSubtotal,
  setSelectedCoupons, // 다중 쿠폰 선택
  getDiscountAmount,
}) => {
  const [tempSelectedCoupons, setTempSelectedCoupons] = useState([]);

  const handleCouponSelect = (coupon) => {
    if (coupon.canBeCombined) {
      // 결합 가능한 쿠폰 선택 시
      // 결합 불가인 쿠폰이 선택되어 있다면 해제
      const hasNonCombinable = tempSelectedCoupons.some((c) => !c.canBeCombined);
      if (hasNonCombinable) {
        setTempSelectedCoupons([coupon]);
      } else {
        // 이미 선택된 쿠폰인지 확인
        const isSelected = tempSelectedCoupons.some(
          (c) => c.name === coupon.name && c.discountType === coupon.discountType
        );
        if (isSelected) {
          // 해제
          setTempSelectedCoupons(
            tempSelectedCoupons.filter(
              (c) => c.name !== coupon.name || c.discountType !== coupon.discountType
            )
          );
        } else {
          // 추가
          setTempSelectedCoupons([...tempSelectedCoupons, coupon]);
        }
      }
    } else {
      // 결합 불가인 쿠폰 선택 시
      // 모든 기존 선택을 해제하고 해당 쿠폰만 선택
      const isSelected = tempSelectedCoupons.some(
        (c) => c.name === coupon.name && c.discountType === coupon.discountType
      );
      if (isSelected) {
        // 해제
        setTempSelectedCoupons([]);
      } else {
        // 선택
        setTempSelectedCoupons([coupon]);
      }
    }
  };

  const handleApplyCoupons = () => {
    setSelectedCoupons(tempSelectedCoupons);
    onDismiss();
  };

  const renderCouponItem = ({ item }) => {
    const isSelected = tempSelectedCoupons.some(
      (c) => c.name === item.name && c.discountType === item.discountType
    );
    return (
      <TouchableWithoutFeedback onPress={() => handleCouponSelect(item)}>
        <View
          style={[
            styles.couponItem,
            { backgroundColor: isSelected ? '#d0f0c0' : '#f0f0f0' },
          ]}
        >
          <List.Item
            title={
              <Text style={{ color: 'black', fontWeight: 'bold' }}>{item.name}</Text>
            }
            description={
              <View>
                <Text style={{ color: 'black' }}>{item.description}</Text>
                <Text style={{ color: 'black' }}>
                  최소 주문 금액: {item.minOrderValue}원
                </Text>
                <Text style={{ color: 'black' }}>
                  할인 유형: {item.discountType === '%' ? '% 할인' : '고정 금액 할인'}
                </Text>
                <Text style={{ color: 'black' }}>
                  할인 금액: {item.discountValue}
                  {item.discountType === '%' ? '%' : '원'}
                </Text>
                {item.discountType === '%' && (
                  <Text style={{ color: 'black' }}>
                    최대 할인 금액: {item.maxDiscountValue}원
                  </Text>
                )}
                <Text style={{ color: 'black' }}>
                  유효 기간: {item.startDate} ~ {item.endDate}
                </Text>
                <Text style={{ color: 'black' }}>
                  결합 가능 여부: {item.canBeCombined ? '결합 가능' : '결합 불가'}
                </Text>
              </View>
            }
            left={() => (
              <List.Icon
                icon={isSelected ? 'check-circle' : 'checkbox-blank-circle-outline'}
                color={isSelected ? 'green' : 'grey'}
              />
            )}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  // 필터링된 쿠폰 목록: 사용되지 않았고, 최소 주문 금액을 만족하며, 사용 가능 상태
  const availableCoupons = coupons.filter(
    (coupon) =>
      !coupon.isUsed &&
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
          <FlatList
            data={availableCoupons}
            keyExtractor={(item) => `${item.name}_${item.discountType}`} // 고유 키 설정
            renderItem={renderCouponItem}
            style={{ maxHeight: 400 }} // 스크롤 가능하도록 최대 높이 설정
          />
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>취소</Button>
        <Button onPress={handleApplyCoupons} disabled={tempSelectedCoupons.length === 0}>
          확인
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default CouponModal;