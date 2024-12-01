import React, { useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useSelector } from 'react-redux';

const DrinkDetailScreen = ({ route, navigation, addToCart }) => {
  const { item } = route.params;
  const [temperature, setTemperature] = useState('HOT');
  const [size, setSize] = useState('톨');
  const [extraShot, setExtraShot] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageLoading, setImageLoading] = useState(true);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  // 총 가격 계산 함수 (수량은 고려하지 않음)
  const calculateTotalPrice = () => {
    const unitPrice = parseInt(item.price, 10) || 0;
    let extraCost = 0;

    // 샷 추가 비용
    if (extraShot) {
      extraCost += 500; // 샷 추가 가격
    }

    // 사이즈에 따른 추가 가격
    if (size === '그란데') {
      extraCost += 500;
    } else if (size === '벤티') {
      extraCost += 1000;
    }

    // 최종 가격 계산 (수량은 고려하지 않음)
    return unitPrice + extraCost;
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

    const totalPrice = calculateTotalPrice(); // 최종 가격 계산

    addToCart({
      id: item.id,
      name: item.name,
      image: item.image_url,
      temperature,
      size,
      extraShot,
      quantity, // 수량 추가
      unitPrice: parseInt(item.price, 10) || 0,
      totalPrice // totalPrice 추가
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

        {/* 온도 선택 */}
        <Text style={styles.detailSelect}>온도 선택:</Text>
        <RadioButton.Group onValueChange={setTemperature} value={temperature}>
          <View style={styles.radioGroup}>
            <View style={styles.radioItem}>
              <RadioButton value="HOT" />
              <Text>HOT</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="ICE" />
              <Text>ICE</Text>
            </View>
          </View>
        </RadioButton.Group>

        {/* 사이즈 선택 */}
        <Text style={styles.detailSelect}>사이즈 선택:</Text>
        <RadioButton.Group onValueChange={setSize} value={size}>
          <View style={styles.radioGroup}>
            <View style={styles.radioItem}>
              <RadioButton value="톨" />
              <Text>톨</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="그란데" />
              <Text>그란데</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="벤티" />
              <Text>벤티</Text>
            </View>
          </View>
        </RadioButton.Group>

        {/* 샷 추가 */}
        <Text style={styles.detailSelect}>샷 추가:</Text>
        <RadioButton.Group onValueChange={(value) => setExtraShot(value === '추가')} value={extraShot ? '추가' : '없음'}>
          <View style={styles.radioGroup}>
            <View style={styles.radioItem}>
              <RadioButton value="없음" />
              <Text>없음</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="추가" />
              <Text>추가</Text>
            </View>
          </View>
        </RadioButton.Group>

        {/* 수량 선택 */}
        <Text style={styles.detailSelect}>수량:</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View>
        {/* 금액 표시 */}
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
    alignSelf: 'center',
    width: '100%',
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
    margin: 10,
    textAlign: 'center',
  },
  detailSelect: {
    fontSize: 17,
    fontWeight: 'bold',
    margin: 10,
  },
  detailDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'left',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  quantityButton: {
    backgroundColor: '#000000',
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
    backgroundColor: '#000000',
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

export default DrinkDetailScreen;
