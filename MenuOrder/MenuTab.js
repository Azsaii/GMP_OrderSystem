import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { firestore, auth } from '../firebaseConfig';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { format } from 'date-fns';

const MenuTab = ({ navigation, category }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const [userId, setUserId] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, category));
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMenuItems(items);
        setFilteredItems(items);
      } catch (error) {
        console.error("데이터 가져오는 중 오류 발생:", error);
      }
    };

    fetchMenuData();
  }, [category]);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    setStartDate(oneMonthAgo);
    setEndDate(today);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setLoadingOrders(true);

    const fetchOrderDetails = async () => {
      const formattedStartDate = format(startDate, 'yyMMdd');
      const formattedEndDate = format(endDate, 'yyMMdd');
      let allOrderDetails = [];

      for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
        const dateString = format(d, 'yyMMdd');
        const ordersCollectionRef = collection(firestore, 'orders', dateString, 'orders');
        const q = query(ordersCollectionRef, where('customerId', '==', userId));

        const querySnapshot = await getDocs(q); // 비동기 호출을 동기처럼 사용
        const updatedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        updatedOrders.forEach(order => {
          order.menuList.forEach(menuItem => {
            const key = `${menuItem.menuName}-${menuItem.options.join(',')}`;
            if (!allOrderDetails.some(detail => detail.menuName === menuItem.menuName && detail.options.join(',') === menuItem.options.join(','))) {
              allOrderDetails.push({ menuName: menuItem.menuName, options: menuItem.options });
            }
          });
        });
      }

      setOrderDetails(allOrderDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
      setLoadingOrders(false);
    };

    fetchOrderDetails();
  }, [userId, startDate, endDate]);
  

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

  const handleOrderNow = async (order) => {
    console.log('Before finding menu item:', menuItems);
  
    // Firestore에서 beverage와 dessert 아이템을 가져옵니다.
    const fetchMenuData = async () => {
      const beverageItems = await getDocs(collection(firestore, 'beverage'));
      const dessertItems = await getDocs(collection(firestore, 'dessert'));
  
      // 아이템들을 배열로 변환합니다.
      const beverageData = beverageItems.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const dessertData = dessertItems.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      return [...beverageData, ...dessertData]; // 두 카테고리의 아이템을 합칩니다.
    };
  
    // 메뉴 아이템을 가져옵니다.
    const allMenuItems = await fetchMenuData();
  
    // 선택한 메뉴 이름으로 필터링합니다.
    const menuItem = allMenuItems.filter(item =>
      item.name.toLowerCase().includes(order.menuName.toLowerCase())
    );
  
    console.log('Found Menu Item:', menuItem);
  
    if (menuItem.length > 0) {
      const detailScreen = menuItem[0].category === 'coffee' ? 'DrinkDetail' : 'DessertDetail';
      navigation.navigate(detailScreen, { item: menuItem[0] });
    } else {
      Alert.alert('오류', '해당 메뉴를 찾을 수 없습니다.');
    }
  };
  



  const handleCartNavigation = () => {
    if (isLoggedIn) {
      navigation.navigate('Cart');
    } else {
      Alert.alert(
        '로그인 필요',
        '로그인을 먼저 해주세요.',
        [
          { text: '확인', onPress: () => navigation.navigate('Login') }
        ]
      );
    }
  };

  const handleOrderDetailsNavigation = () => {
    if (isLoggedIn) {
      navigation.navigate('UserScreen');
    } else {
      Alert.alert(
        '로그인 필요',
        '로그인을 먼저 해주세요.',
        [
          { text: '확인', onPress: () => navigation.navigate('Login') }
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

      {(category === 'dessert' || category === 'beverage') && (
        <View style={styles.searchContainer}>

          <TextInput
            style={styles.searchInput}
            placeholder="메뉴 검색..."
            value={searchTerm}
            onChangeText={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(searchTerm)}>
            <Image
              source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/image_logo%2Freading_glasses.png?alt=media&token=97a4b8fc-9117-4254-8d50-0d506cca39c4' }} // 여기에 새로운 이미지 URL을 입력하세요.
              style={styles.searchIcon} // 새로운 스타일을 추가하여 아이콘 크기를 조정합니다.
            />
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

        {category === 'recommend' && userId && loadingOrders ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
          ) : (
            category === 'recommend' && (
              <View style={styles.recommendItemView}>
                {userId ? (
                  orderDetails.length > 0 ? (
                    orderDetails.map((order, orderIndex) => (
                      <View key={orderIndex} style={styles.recommendItem}>
                        <Text style={styles.menuNameText}>{order.menuName}</Text>
                        {/* 옵션이 "사이즈 설정 X"를 포함하는지 확인 */}
                        {order.options && order.options.includes("사이즈 설정 X") ? null : (
                          <Text style={styles.menuOptionsText}>{order.options.join(', ')}</Text>
                        )}
                        <TouchableOpacity 
                          style={styles.orderNowButton}
                          onPress={() => handleOrderNow(order)}
                        >
                          <Text style={styles.orderNowButtonText}>주문하러 가기</Text>
                        </TouchableOpacity>
                        <Text>____________________________</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noMenuText}>추천 메뉴가 없습니다.</Text>
                  )
                ) : (
                  <Text style={styles.noMenuText}>로그인 후 추천 메뉴를 볼 수 있습니다.</Text>
                )}
              </View>
            )
          )}
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
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  menuOptionsText: {
    fontSize: 16,
    color: '#666',
  },
  noMenuText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  orderNowButton: {
    backgroundColor: '#000000',
    width: 100,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  orderNowButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default MenuTab;

