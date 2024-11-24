import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { firestore } from './../firebaseConfig'; // firebase.js 파일의 경로에 맞게 수정
import { collection, getDocs } from 'firebase/firestore';
import { useSelector } from 'react-redux'; // Redux의 useSelector 가져오기

const MenuTab = ({ navigation, category }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loadingStates, setLoadingStates] = useState({}); // 각 이미지의 로딩 상태를 저장할 객체
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // 로그인 상태 가져오기

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, category));
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMenuItems(items);
        setFilteredItems(items); // 초기 필터링된 항목을 모든 항목으로 설정
      } catch (error) {
        console.error("데이터 가져오는 중 오류 발생:", error);
      }
    };

    fetchMenuData();
  }, [category]);

  // 검색 기능
  const handleSearch = (text) => {
    setSearchTerm(text);
    if (text) {
      const filtered = menuItems.filter(item => 
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(menuItems);
    }
  };

  // 장바구니 버튼 클릭 시 실행되는 함수
  const handleCartNavigation = () => {
    if (isLoggedIn) {
      navigation.navigate('Cart'); // 로그인 상태일 때 장바구니로 이동
    } else {
      Alert.alert(
        '로그인 필요',
        '로그인을 먼저 해주세요.',
        [
          { text: '확인', onPress: () => navigation.navigate('Login') } // 로그인 화면으로 이동
        ]
      );
    }
  };

  // 주문내역 버튼 클릭 시 실행되는 함수
  const handleOrderDetailsNavigation = () => {
    if (isLoggedIn) {
      navigation.navigate('UserScreen'); // 로그인 상태일 때 주문 내역 화면으로 이동
    } else {
      Alert.alert(
        '로그인 필요',
        '로그인을 먼저 해주세요.',
        [
          { text: '확인', onPress: () => navigation.navigate('Login') } // 로그인 화면으로 이동
        ]
      );
    }
  };

  const handleImageLoadStart = (id) => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }));
  };

  const handleImageLoadEnd = (id) => {
    setLoadingStates((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="메뉴 검색..." 
          value={searchTerm} 
          onChangeText={handleSearch} 
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(searchTerm)}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.menuContainer}>
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                const detailScreen = category === 'beverage' ? 'DrinkDetail' : 'DessertDetail';
                navigation.navigate(detailScreen, { item });
              }}
            >
              <View style={styles.imageContainer}>
                {loadingStates[item.id] && (
                  <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
                )}
                <Image 
                  source={{ uri: item.image_url }} 
                  style={styles.menuImage} 
                  onLoadStart={() => handleImageLoadStart(item.id)}
                  onLoadEnd={() => handleImageLoadEnd(item.id)}
                />
              </View>
              <Text style={styles.menuText}>{item.name}</Text>
              <Text style={styles.menuPrice}>{item.price} 원</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.RowContainer}>
        <TouchableOpacity style={styles.orderButton} onPress={handleCartNavigation}>
          <Text style={styles.orderButtonText}>장바구니</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.orderButton} onPress={handleOrderDetailsNavigation}>
          <Text style={styles.orderButtonText}>주문내역</Text>
        </TouchableOpacity>
      </View>
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
      backgroundColor: 'white',
    },
    RowContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: 10,
      backgroundColor: 'white',
    },
    menuItem: {
      width: '48%',
      alignItems: 'center',
      marginBottom: 10,
    },
    imageContainer: {
      width: '100%',
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuImage: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      position: 'absolute',
    },
    spinner: {
      position: 'absolute',
    },
    menuText: {
      textAlign: 'center',
      marginTop: 5,
    },
    menuPrice: {
      textAlign: 'center',
      color: '#888',
    },
    orderButton: {
      backgroundColor: '#000000',
      width: '43%',
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
    searchContainer: {
      flexDirection: 'row',
      padding: 10,
      alignItems: 'center',
      backgroundColor: 'white',
    },
    searchInput: {
      flex: 1,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      padding: 10,
    },
    searchButton: {
      marginLeft: 10,
      padding: 10,
    },
    searchButtonText: {
      fontSize: 18,
    },
});

export default MenuTab;
