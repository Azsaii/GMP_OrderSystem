// App.js

import React, { useState } from 'react';
import { Provider as ReduxProvider, useSelector, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import store, { setLoggedIn } from './state';
import Login from './Login';
import SignUp from './SignUp';
import MenuTab from './MenuOrder/MenuTab';
import CartScreen from './MenuOrder/CartScreen';
import DrinkDetailScreen from './MenuOrder/DrinkDetailScreen';
import DessertDetailScreen from './MenuOrder/DessertDetailScreen';
import CheckoutScreen from './CheckoutOrder/components/CheckoutScreen';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Button } from 'react-native';
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

  const clearCart = () => {
    setCartItems([]);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase 로그아웃
      dispatch(setLoggedIn(false)); // Redux 상태 업데이트
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <Stack.Navigator initialRouteName="Home">
      {/* 탭 화면 오른쪽에 로그인 또는 로그아웃 버튼 추가 */}
      <Stack.Screen
        name="Home"
        options={({ navigation }) => ({
          headerRight: () =>
            isLoggedIn ? (
              <Button title="로그아웃" onPress={handleLogout} />
            ) : (
              <Button
                title="로그인"
                onPress={() => navigation.navigate('Login')}
              />
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
          </Tab.Navigator>
        )}
      </Stack.Screen>
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
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Checkout">
        {(props) => (
          <CheckoutScreen
            {...props}
            onClearCart={clearCart} // clearCart 함수 전달
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <ReduxProvider store={store}>
      {/* UserProvider 추가 */}
      <UserProvider>
        {/* PaperProvider 추가 */}
        <PaperProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </UserProvider>
    </ReduxProvider>
  );
};

export default App;
