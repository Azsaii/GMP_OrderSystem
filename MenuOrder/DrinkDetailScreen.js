import React, { useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useSelector } from 'react-redux'; // Redux의 useSelector 가져오기

const DrinkDetailScreen = ({ route, navigation, addToCart }) => {
  const { item } = route.params;
  const [temperature, setTemperature] = useState('HOT');
  const [size, setSize] = useState('톨');
  const [extraShot, setExtraShot] = useState(false);
  const [quantity, setQuantity] = useState(1); // 수량 상태 추가
  const [imageLoading, setImageLoading] = useState(true); // 이미지 로딩 상태 추가

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // 로그인 상태 가져오기

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

    addToCart({
      id: item.id,
      name: item.name,
      image: item.image_url,
      temperature,
      size,
      extraShot,
      quantity, // 수량 추가
      unitPrice, // 가격 추가
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
    alignSelf: 'center',
    padding: 20,
    width: '90%',
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
