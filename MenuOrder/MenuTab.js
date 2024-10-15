import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { firestore } from './../firebaseConfig'; // firebase.js 파일의 경로에 맞게 수정
import { collection, getDocs } from 'firebase/firestore';

const MenuTab = ({ navigation, category }) => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        // category에 따라 적절한 컬렉션을 가져옴
        const querySnapshot = await getDocs(collection(firestore, category));
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMenuItems(items);
      } catch (error) {
        console.error("데이터 가져오는 중 오류 발생:", error);
      }
    };

    fetchMenuData();
  }, [category]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                const detailScreen = category === 'beverage' ? 'DrinkDetail' : 'DessertDetail';
                navigation.navigate(detailScreen, { item });
              }}
            >
              <Image 
                source={{ uri: item.image_url }} 
                style={styles.menuImage} 
              />
              <Text style={styles.menuText}>{item.name}</Text>
              <Text style={styles.menuPrice}>{item.price} 원</Text>
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
      width: '48%',
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
