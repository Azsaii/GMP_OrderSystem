import React, { useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { RadioButton } from 'react-native-paper';

const DrinkDetailScreen = ({ route, navigation, addToCart }) => {
  const { item } = route.params;
  const [temperature, setTemperature] = useState('HOT');
  const [size, setSize] = useState('톨');
  const [extraShot, setExtraShot] = useState(false);
  const [syrup, setSyrup] = useState(false);
  const [quantity, setQuantity] = useState(1); // 수량 상태 추가

  const handleAddToCart = () => {
    addToCart({
      name: item.name,
      image: item.image,
      temperature,
      size,
      extraShot,
      syrup,
      quantity, // 수량 추가
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
        {/* 온도 선택 */}
        <Text>온도 선택:</Text>
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
        <Text>사이즈 선택:</Text>
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
        <Text>샷 추가:</Text>
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

        {/* 시럽 추가 */}
        <Text>시럽 추가:</Text>
        <RadioButton.Group onValueChange={(value) => setSyrup(value === '추가')} value={syrup ? '추가' : '없음'}>
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
        <Text>수량:</Text>
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
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
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

export default DrinkDetailScreen;
