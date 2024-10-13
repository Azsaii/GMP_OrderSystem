import React, { useState, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // 추가
import store from './state';
import MenuTab from './components/MenuTab';
import DrinkDetailScreen from './components/DrinkDetailScreen';
import DessertDetailScreen from './components/DessertDetailScreen';
import CartScreen from './components/CartScreen';
import CheckoutScreen from './components/CheckoutScreen';
import MainScreen from './components/Main';
import LoginScreen from './components/Login';
import SignUpScreen from './components/SignUp';
import UserScreen from './components/UserScreen';
import AdminScreen from './components/AdminScreen';
import { UserProvider } from './contexts/UserContext';

// 주문 상태 관리를 위한 Context 생성
const OrderContext = createContext();
const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [orderStatus, setOrderStatus] = useState('주문이 접수되었습니다.');
  const [estimatedTime, setEstimatedTime] = useState(10);
  const [waitingCustomers, setWaitingCustomers] = useState(5);

  const addToCart = (item) => {
    setCartItems([...cartItems, item]);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <Provider store={store}>
      <UserProvider>
        <PaperProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <OrderContext.Provider
              value={{ orderStatus, setOrderStatus, estimatedTime, setEstimatedTime, waitingCustomers, setWaitingCustomers }}
            >
              <NavigationContainer>
                <Stack.Navigator>
                  <Stack.Screen name="Main" component={MainScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="SignUp" component={SignUpScreen} />
                  <Stack.Screen name="Home" options={{ title: '키오스크' }}>
                    {() => (
                      <Tab.Navigator>
                        <Tab.Screen name="음료">
                          {(props) => <MenuTab {...props} category="음료" addToCart={addToCart} />}
                        </Tab.Screen>
                        <Tab.Screen name="디저트">
                          {(props) => <MenuTab {...props} category="디저트" addToCart={addToCart} />}
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
                    {(props) => <CartScreen {...props} cartItems={cartItems} clearCart={clearCart} />}
                  </Stack.Screen>
                  <Stack.Screen name="Checkout">
                    {(props) => (
                      <CheckoutScreen {...props} cartItems={cartItems} onClearCart={clearCart} />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="User" component={UserScreen} options={{ title: '사용자 화면' }}/>
                  <Stack.Screen name="Admin" component={AdminScreen} options={{ title: '관리자 화면' }}/>
                </Stack.Navigator>
              </NavigationContainer>
            </OrderContext.Provider>
          </GestureHandlerRootView>
        </PaperProvider>
      </UserProvider>
    </Provider>
  );
}

// Context를 가져오는 custom hook
export function useOrder() {
  return useContext(OrderContext);
}
