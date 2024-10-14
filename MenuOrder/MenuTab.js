import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

// 메뉴 데이터
const menuData = {
  음료: [
    { id: 1, name: '아메리카노', category: 'drink', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/Image_coffee%2FAmericano.jpg?alt=media&token=2784b1ba-80cf-40bb-87e3-c45024631321', description: '진한 커피 맛의 아메리카노' },
    { id: 2, name: '카페라떼', category: 'drink', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/Image_coffee%2FCafeLatte.png?alt=media&token=c2dc503b-0839-4edd-b907-35cdcd15575d', description: '부드러운 우유와 커피의 조화' },
    { id: 3, name: '모카', category: 'drink', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/Image_coffee%2FCaffeMoca.jpg?alt=media&token=438edb8d-19d7-4399-bc1d-5cd0ccec33b7', description: '초콜릿과 커피의 환상적인 조화' },
    { id: 4, name: '헤이즐넛 아메리카노', category: 'drink', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/Image_coffee%2FHazelnutAmericano.png?alt=media&token=9a7a5c63-df32-466c-b00c-ca15ccb3a03d', description: '헤이즐넛 향이 가득한 아메리카노' },
    { id: 5, name: '아포카토', category: 'drink', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/Image_coffee%2FAffogato.jpg?alt=media&token=b0b9731a-f925-48b9-ba1b-89b03ee8e870', description: '아이스크림 위에 에스프레소' },
    { id: 6, name: '아인슈페너', category: 'drink', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/Image_coffee%2FEinspenner.jpg?alt=media&token=10d01796-248e-4e29-a181-f5b4fc67d50e', description: '부드러운 크림과 에스프레소' },
    { id: 7, name: '말차라떼', category: 'drink', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/Image_coffee%2FMatchaLatte.jpg?alt=media&token=8e799bbd-44e1-4c32-b117-7c72e0288850', description: '신선한 말차와 우유의 조화' },
    { id: 8, name: '자바칩 프라푸치노', category: 'drink', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/Image_coffee%2FJavaChipFrappuccino.webp?alt=media&token=f5eb6949-6ddc-4564-ab3a-0907b1328394', description: '자바칩과 우유의 시원한 음료' },
    { id: 9, name: '고구마라떼', category: 'drink', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/Image_coffee%2FSweetPotatoLatte.jpg?alt=media&token=1d200d1a-a485-4475-a2f5-fdb647bd0f92', description: '달콤한 고구마로 만든 라떼' },
    { id: 10, name: '아이스티', category: 'drink', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/Image_coffee%2FIcedTea.jpg?alt=media&token=9a1cb0bf-c8f3-466f-8f6d-ce678084e33a', description: '상큼한 아이스티' },
    { id: 11, name: '초코라떼', category: 'drink', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/Image_coffee%2FEspresso.jpg?alt=media&token=ebefcff0-dfe0-41a8-99b4-4d8b9ae39bf5', description: '진한 초콜릿 맛의 라떼' },
  ],
  디저트: [
    { id: 1, name: '케이크', category: 'dessert', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/image_desert%2FCake.jpg?alt=media&token=c62d5bfd-d609-4bbf-ab44-7b7b5fd1e542', description: '부드럽고 촉촉한 케이크' },
    { id: 2, name: '쿠키', category: 'dessert', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/image_desert%2FCookie.jpg?alt=media&token=64ea286e-4b97-4c2e-901e-d34a714e5ae1', description: '바삭한 쿠키' },
    { id: 3, name: '머핀', category: 'dessert', image: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/image_desert%2FMuffin.jpg?alt=media&token=8e0502a9-2fc9-4463-b50c-914c1ecdf825', description: '다양한 맛의 머핀' },
  ],
};


const MenuTab = ({ navigation, category, addToCart }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.menuContainer}>
        {menuData[category].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
              const detailScreen = category === '음료' ? 'DrinkDetail' : 'DessertDetail';
              navigation.navigate(detailScreen, { item });
            }}
          >
            <Image 
              source={{ uri: item.image }} 
              style={styles.menuImage} 
            />
            <Text style={styles.menuText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.orderButton} onPress={() => navigation.navigate('Cart')}>
        <Text style={styles.orderButtonText}>장바구니로 이동</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
    menuContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: 10,
    },
    menuItem: {
      width: '48%', // 한 행에 메뉴 두개씩 출력npm
      alignItems: 'center',
      marginBottom: 10,
    },
    menuImage: {
      width: '100%',
      height: 200,
      borderRadius: 10,
    },
    menuText: {
      textAlign: 'center',
      marginTop: 5,
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
    detailContainer: {
      flex: 1,
      alignItems: 'center',
      padding: 20,
    },
    detailImage: {
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
    picker: {
      height: 50,
      width: 150,
      marginVertical: 10,
    },
    radioGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
    },
    radioItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20, // 간격 조정
    },
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
  });
export default MenuTab;
