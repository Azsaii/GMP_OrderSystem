// components/CartItem.js

import React from 'react';
import { Text } from 'react-native';
import { List, Avatar, Divider } from 'react-native-paper';
import styles from '../styles/CheckoutStyles';

// 숫자를 천 단위로 콤마로 구분하는 함수
const formatNumber = (num) => (num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0');

// 개별 장바구니 아이템을 표시하는 컴포넌트
const CartItem = ({ item }) => {
  const quantity = item.quantity || 1; // 기본값을 1로 설정
  const unitPrice = item.unitPrice || 0; // 기본값을 0으로 설정
  const totalPrice = unitPrice * quantity;

  return (
    <>
      <List.Item
        title={item.name}
        description={`${quantity}개`}
        right={() => <Text style={styles.itemPrice}>{formatNumber(totalPrice)}원</Text>}
        left={() =>
          item.image ? (
            <Avatar.Image size={40} source={{ uri: item.image }} />
          ) : (
            <Avatar.Icon size={40} icon="coffee" />
          )
        }
        titleStyle={styles.titleStyle}
        descriptionStyle={styles.descriptionText}
      />
      <Divider style={styles.divider} />
    </>
  );
};

export default CartItem;
