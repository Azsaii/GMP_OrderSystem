import React, { useState } from 'react';
import styled from 'styled-components/native';
import {
  Provider as ReduxProvider,
  useSelector,
  useDispatch,
} from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import store, { setLoggedIn } from './state';
import Login from './Auth/Login';
import SignUp from './Auth/SignUp';
import MenuTab from './MenuOrder/MenuTab';
import CartScreen from './MenuOrder/CartScreen';
import DrinkDetailScreen from './MenuOrder/DrinkDetailScreen';
import DessertDetailScreen from './MenuOrder/DessertDetailScreen';
import CheckoutScreen from './CheckoutOrder/components/CheckoutScreen';
import UserScreen from './OrderList/UserScreen';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Button, View, Text, ImageBackground, Image } from 'react-native';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { UserProvider } from './CheckoutOrder/contexts/UserContext';
import { Provider as PaperProvider } from 'react-native-paper';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

const AppNavigator = () => {
  const [cartItems, setCartItems] = useState([]);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  const addToCart = (item) => {
    setCartItems([...cartItems, item]);
  };

  const removeFromCart = (itemToRemove) => {
    setCartItems(
      cartItems.filter(
        (item) =>
          item.name !== itemToRemove.name ||
          item.temperature !== itemToRemove.temperature ||
          item.size !== itemToRemove.size ||
          item.extraShot !== itemToRemove.extraShot ||
          item.syrup !== itemToRemove.syrup
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(setLoggedIn(false));
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 커스텀 헤더 타이틀 컴포넌트
  const HeaderTitle = () => (
    <Image
      source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/image_logo%2Fstarbucks_logo.png?alt=media&token=2a81283e-6e3c-43be-9cc8-59cf3e8f9dfb' }} // 여기에 이미지 URL을 입력하세요.
      style={{ width: 100, height: 40 }} // 원하는 크기로 조정하세요.
      resizeMode="contain" // 이미지가 비율에 맞게 조정되도록 설정
    />
  );

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        options={({ navigation }) => ({
          headerTitle: () => <HeaderTitle />, // 커스텀 헤더 타이틀 설정
          headerRight: () =>
            isLoggedIn ? (
              <StyledButton onPress={handleLogout}>
                <ButtonText>로그아웃</ButtonText>
              </StyledButton>
            ) : (
              <StyledButton onPress={() => navigation.navigate('Login')}>
                <ButtonText>로그인</ButtonText>
              </StyledButton>
            ),
        })}
      >
        {() => (
          <Tab.Navigator>
            <Tab.Screen name="음료">
              {(props) => <MenuTab {...props} category="beverage" />}
            </Tab.Screen>
            <Tab.Screen name="디저트">
              {(props) => <MenuTab {...props} category="dessert" />}
            </Tab.Screen>
            <Tab.Screen name="추천 메뉴">
              {(props) => <MenuTab {...props} category="recommend" />}
            </Tab.Screen>
          </Tab.Navigator>
        )}
      </Stack.Screen>

      {/* 상세 화면들 */}
      <Stack.Screen name="DrinkDetail" options={{ title: '음료 상세보기' }}>
        {(props) => <DrinkDetailScreen {...props} addToCart={addToCart} />}
      </Stack.Screen>
      <Stack.Screen name="DessertDetail" options={{ title: '디저트 상세보기' }}>
        {(props) => <DessertDetailScreen {...props} addToCart={addToCart} />}
      </Stack.Screen>
      <Stack.Screen name="Cart">
        {(props) => (
          <CartScreen
            {...props}
            cartItems={cartItems}
            clearCart={clearCart}
            removeFromCart={removeFromCart}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Checkout">
        {(props) => (
          <CheckoutScreen
            {...props}
            onClearCart={clearCart}
          />
        )}
      </Stack.Screen>

      {/* 인증 화면들 */}
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ title: '로그인' }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{ title: '회원 가입' }}
      />

      {/* UserScreen 추가 */}
      <Stack.Screen
        name="UserScreen"
        component={UserScreen}
        options={{ title: '주문 내역' }}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <ReduxProvider store={store}>
      <UserProvider>
        <PaperProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </UserProvider>
    </ReduxProvider>
  );
};

const StyledButton = styled.TouchableOpacity`
  background-color: black;
  padding: 10px;
  border-radius: 5px;
`;

const ButtonText = styled.Text`
  color: white;
`;

export default App;
