import React, { useState, useEffect } from 'react';
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
import { Button, View, Text, Image } from 'react-native';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { UserProvider } from './CheckoutOrder/contexts/UserContext';
import { Provider as PaperProvider } from 'react-native-paper';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

const SplashScreen = () => (
  <SplashContainer>
    <Image
      source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/image_logo%2Fstartbucks_logo_first.jpg?alt=media&token=ced4218f-2fee-486b-afcc-aad2afd75317' }}
      style={{ width: 250, height: 130 }} // 로고 크기 조정
      resizeMode="contain"
    />
  </SplashContainer>
);

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2초 후에 스플래시 화면을 숨깁니다.

    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, []);

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
      source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/mobile8-b37a5.appspot.com/o/image_logo%2Fstarbucks_logo.png?alt=media&token=2a81283e-6e3c-43be-9cc8-59cf3e8f9dfb' }}
      style={{ width: 100, height: 40 }} // 원하는 크기로 조정하세요.
      resizeMode="contain" // 이미지가 비율에 맞게 조정되도록 설정
    />
  );

  return (
    <>
      {isLoading ? (
        <SplashScreen />
      ) : (
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
          <Stack.Screen
            name="UserScreen"
            component={UserScreen}
            options={{ title: '주문 내역' }}
          />
        </Stack.Navigator>
      )}
    </>
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

const SplashContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #02110A;
`;

export default App;
