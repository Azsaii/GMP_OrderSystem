import React, { useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux'; // Redux의 useSelector 가져오기

const DessertDetailScreen = ({ route, navigation, addToCart }) => {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1); // 수량 상태 추가
  const [imageLoading, setImageLoading] = useState(true); // 이미지 로딩 상태 추가

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // 로그인 상태 가져오기

  // 총 가격 계산 함수
  const calculateTotalPrice = () => {
    const unitPrice = parseInt(item.price, 10) || 0;
    return unitPrice; // 총 가격 계산
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      Alert.alert(
        '로그인 필요',
        '로그인을 먼저 해주세요.',
        [
          { text: '확인', onPress: () => navigation.navigate('Login') } // 로그인 화면으로 이동
        ]
      );
      return;
    }

    const unitPrice = parseInt(item.price, 10) || 0;
    const totalPrice = calculateTotalPrice(); // 총 가격 계산

    addToCart({
      id: item.id,
      name: item.name,
      image: item.image_url,
      quantity, // 수량 추가
      unitPrice, // 가격 추가
      totalPrice, // 총 가격 추가
    });
    Alert.alert(
      '장바구니에 담기',
      '장바구니에 담았습니다!',
    );
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.detailContainer}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        
        <View style={styles.imageContainer}>
          {imageLoading && (
            <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
          )}
          <Image
            source={{ uri: item.image_url }}
            style={styles.menuImage}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />
        </View>

        <Text style={styles.detailText}>{item.name}</Text>
        <Text style={styles.detailDescription}>{item.description}</Text>

        

        {/* 수량 선택 */}
        <Text style={styles.detailSelect}>수량:</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => setQuantity(Math.max(1, quantity - 1))} // 수량 감소
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => setQuantity(quantity + 1)} // 수량 증가
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View>
        {/* 가격 표시 */}
        <Text style={styles.priceText}>가격: {calculateTotalPrice() * quantity} 원</Text>
      <TouchableOpacity style={styles.orderButton} onPress={handleAddToCart}>
        <Text style={styles.orderButtonText}>장바구니에 담기</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  detailContainer: {
    flex: 1,
    padding: 20,
    width: '100%', // 가로폭 90%로 설정
    alignSelf: 'center', // 중앙 정렬
    backgroundColor: 'white',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  spinner: {
    position: 'absolute',
  },
  detailText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center', // 텍스트 센터 정렬
  },
  detailSelect: {
    fontSize: 17,
    fontWeight: 'bold',
    margin: 10,
  },
  detailDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20, // 설명과 수량 선택 사이의 간격 추가
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'left', // 가격 센터 정렬
  },
  quantityContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-between', // 버튼 간의 공간을 균등하게
    width: '40%', // 가로폭을 100% 사용
    marginVertical: 10,
  },
  quantityButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
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
