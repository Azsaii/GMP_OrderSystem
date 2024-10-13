// components/DessertDetailScreen.js

import React, { useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const DessertDetailScreen = ({ route, navigation, addToCart }) => {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const unitPrice = item.price;
    const totalPrice = unitPrice * quantity;

    addToCart({
      name: item.name,
      image: item.image,
      quantity, // 수량
      unitPrice, // 단가 
      price: totalPrice, // 총 가격 = 수량 * 단가
    });
    alert('장바구니에 담았습니다!');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.detailContainer}>
      <Image source={{ uri: item.image }} style={styles.menuImage} />
      <Text style={styles.detailText}>{item.name}</Text>
      <Text style={styles.detailDescription}>{item.description}</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        {/* 수량 선택 */}
        <Text>수량:</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))} // 수량 감소
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(quantity + 1)}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.orderButton} onPress={handleAddToCart}>
        <Text style={styles.orderButtonText}>장바구니에 담기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  detailContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  menuImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  detailText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  detailDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  quantityButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  quantityText: {
    fontSize: 20,
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

export default DessertDetailScreen;
