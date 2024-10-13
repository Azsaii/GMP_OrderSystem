import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

const CartScreen = ({ cartItems, clearCart }) => {
  const navigation = useNavigation();

  // 숫자를 천 단위로 콤마로 구분하는 함수
  const formatNumber = (num) => (num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0');

  // 결제하기 버튼 눌렀을 때 처리 함수
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('알림', '담은 상품이 없습니다.'); // 경고 메시지 띄우기
      return; // 장바구니가 비어 있으면 결제 화면으로 이동하지 않음
    }
    navigation.navigate('Checkout', { cartItems });
  };

  return (
    <SafeAreaView style={styles.cartContainer}>
      <Text style={styles.cartTitle}>장바구니</Text>
      <ScrollView>
        {cartItems.length === 0 ? (
          <Text style={styles.emptyCart}>장바구니가 비어 있습니다.</Text>
        ) : (
          cartItems.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              {item.image && <Image source={{ uri: item.image }} style={styles.cartImage} />}
              <View style={styles.cartDetails}>
                <Text>{item.name || '상품 이름 없음'}</Text>
                <Text>{`가격: ${item.unitPrice ? `${formatNumber(item.unitPrice)}원` : '가격 정보 없음'}`}</Text>
                <Text>{`수량: ${item.quantity}개`}</Text>
                {item.temperature && <Text>{`온도: ${item.temperature}`}</Text>}
                {item.size && <Text>{`사이즈: ${item.size}`}</Text>}
                {item.extraShot !== undefined && (
                  <Text>{`샷 추가: ${item.extraShot ? '예' : '아니요'}`}</Text>
                )}
                {item.syrup !== undefined && (
                  <Text>{`시럽 추가: ${item.syrup ? '예' : '아니요'}`}</Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <TouchableOpacity style={styles.orderButton} onPress={handleCheckout}>
        <Text style={styles.orderButtonText}>결제하기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
        <Text style={styles.clearButtonText}>장바구니 비우기</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  cartImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  cartDetails: {
    flex: 1,
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
  clearButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 10,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
