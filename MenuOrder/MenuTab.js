import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { firestore, auth } from '../firebaseConfig';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { useSelector } from 'react-redux'; // Redux의 useSelector 가져오기
import { onAuthStateChanged } from 'firebase/auth';
import { format } from 'date-fns';

const MenuTab = ({ navigation, category }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loadingStates, setLoadingStates] = useState({}); // 각 이미지의 로딩 상태를 저장할 객체
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // 로그인 상태 가져오기

  // 추천 메뉴를 위한 주문 내역 불러오기에 필요한 필드들
  const [userId, setUserId] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState([]);

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


  // 추천 메뉴 관련 주문 내역 불러오기
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        Alert.alert('오류', '로그인된 사용자가 없습니다.');
      }
    });
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1); // 한 달 전 날짜 설정
    
    setStartDate(oneMonthAgo);
    setEndDate(today);
  }, []);


useEffect(() => {
  if (!userId) return;
  setLoading(true);

  const formattedStartDate = format(startDate, 'yyMMdd');
  const formattedEndDate = format(endDate, 'yyMMdd');
  let unsubscribeList = [];

  for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
    const dateString = format(d, 'yyMMdd');
    const ordersCollectionRef = collection(firestore, 'orders', dateString, 'orders');
    const q = query(ordersCollectionRef, where('customerId', '==', userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrderDetails((prevOrders) => {
        const updatedOrderMap = new Map();

        updatedOrders.forEach(order => {
          order.menuList.forEach(menuItem => {
            const key = `${menuItem.menuName}-${menuItem.options.join(',')}`; // 메뉴 이름과 옵션을 키로 사용
            if (!updatedOrderMap.has(key)) {
              updatedOrderMap.set(key, { menuName: menuItem.menuName, options: menuItem.options });
            }
          });
        });

        // Map을 배열로 변환
        const uniqueOrderItems = Array.from(updatedOrderMap.values());
        return uniqueOrderItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
    });

    unsubscribeList.push(unsubscribe);
  }

  setLoading(false);

  return () => unsubscribeList.forEach(unsub => unsub());
}, [userId, startDate, endDate]);


  
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


      {/* 추천 탭일 때만 주문 내역 표시 */}
      {category === 'recommend' && orderDetails.length > 0 && (
        
        <View style={styles.recommendItemView}>
          <Text style={styles.recommendTitle}>추천 메뉴 및 옵션</Text>
          {orderDetails.map((order, orderIndex) => (
            <View key={orderIndex} style={styles.recommendItem}>
              <Text style={styles.menuNameText}>{order.menuName}</Text>
              <Text style={styles.menuOptionsText}>{order.options.join(', ')}</Text>
            </View>
          ))}
        </View>
      )}



      {/* 음료와 디저트 탭일 때만 검색 기능 표시 */}
      {category === 'dessert' || category === 'beverage' &&(
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
      )}



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
    recommendItemView: {
      padding: 20,
    },
    recommendItem: {
      margin: 10,
    },
    recommendTitle: {
      fontSize: 30,
      fontWeight: 'bold',
      margin: 20,
    },
    menuNameText: {
      fontSize: 24,
      fontWeight: 'bold', // 메뉴 이름을 강조하기 위해 굵게 설정
      marginBottom: 5,
      color: '#333', // 원하는 색상으로 설정
    },
    menuOptionsText: {
      fontSize: 16,
      color: '#666', // 옵션의 색상은 약간 연하게 설정
    }
});

export default MenuTab;
