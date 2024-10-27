import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

// 장바구니 아이템을 그룹화하는 함수
const groupCartItems = (cartItems) => {
  const groupedItems = {};

  cartItems.forEach(item => {
    const key = `${item.name}-${item.temperature}-${item.size}-${item.extraShot}-${item.syrup}`;
    if (groupedItems[key]) {
      groupedItems[key].quantity += item.quantity; // 수량 합산
    } else {
      groupedItems[key] = { ...item }; // 새로 추가
    }
  });

  return Object.values(groupedItems);
};

const CartScreen = ({ cartItems, navigation }) => {
  const groupedCartItems = groupCartItems(cartItems); // 그룹화된 장바구니 아이템

  return (
    <SafeAreaView style={styles.cartContainer}>
      <Text style={styles.cartTitle}>장바구니</Text>
      <ScrollView>
        {groupedCartItems.length === 0 ? (
          <Text style={styles.emptyCart}>장바구니가 비어 있습니다.</Text>
        ) : (
          groupedCartItems.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.cartImage} />
              <View style={styles.cartDetails}>
                <Text>{item.name}</Text>
                {item.temperature ? ( // 온도 옵션이 있으면 drink, 없으면 dessert로 표시
                  <>
                    <Text>온도: {item.temperature}</Text>
                    <Text>사이즈: {item.size}</Text>
                    <Text>샷 추가: {item.extraShot ? '예' : '아니요'}</Text>
                    <Text>수량: {item.quantity}</Text>
                    <Text>가격: {item.unitPrice * item.quantity}</Text>
                  </>
                ) : (
                  <>
                    <Text>수량: {item.quantity}</Text>
                    <Text>가격: {item.unitPrice * item.quantity}</Text>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <TouchableOpacity 
        style={styles.orderButton} 
        onPress={() => {
          if (groupedCartItems.length === 0) {
            alert('장바구니에 담긴 상품이 없습니다.');
            return;
          }
          navigation.navigate('Checkout', { cartItems: groupedCartItems }); // CheckoutScreen으로 이동
        }}
      >
        <Text style={styles.orderButtonText}>주문하기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  cartContainer: {
    flex: 1,
    padding: 20,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyCart: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  cartItem: {
    flexDirection: 'row', // 이미지와 텍스트를 나란히 배치
    alignItems: 'center', // 세로 정렬
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  cartImage: {
    width: 50, // 이미지 크기 조정
    height: 50, // 이미지 크기 조정
    borderRadius: 5,
    marginRight: 10, // 이미지와 텍스트 간격 조정
  },
  cartDetails: {
    flex: 1, // 텍스트가 남은 공간을 차지하도록 설정
  },
  orderButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 10,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
