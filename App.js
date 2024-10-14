// 기존의 인우님 App.js
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { Provider } from 'react-redux';
// import store from './state';
// import Main from './Main';
// import Login from './Login';
// import SignUp from './SignUp';
// const Stack = createNativeStackNavigator();

// const App = () => {
//   return (
//     <Provider store={store}>
//       <NavigationContainer>
//         <Stack.Navigator initialRouteName="Main">
//           <Stack.Screen name="Main" component={Main} />
//           <Stack.Screen name="Login" component={Login} />
//           <Stack.Screen name="SignUp" component={SignUp} />
//         </Stack.Navigator>
//       </NavigationContainer>
//     </Provider>
//   );
// };

// export default App;


// 건우 코드 병합 App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import store from './state';
import Main from './Main';
import Login from './Login';
import SignUp from './SignUp';
import MenuTab from './MenuOrder/MenuTab';
import CartScreen from './MenuOrder/CartScreen';
import DrinkDetailScreen from './MenuOrder/DrinkDetailScreen';
import DessertDetailScreen from './MenuOrder/DessertDetailScreen';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Button } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

const App = () => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems([...cartItems, item]);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          {/* 탭 화면 오른쪽에 로그인 버튼 추가 */}
          <Stack.Screen name="Home" options={({ navigation }) => ({
            headerShown: true,
            title: "키오스크",
            headerRight: () => (
              <Button
                title="MyPage"
                onPress={() => navigation.navigate('Main')}
              />
            ),
          })}>
            {() => (
              <Tab.Navigator>
                <Tab.Screen name="음료">
                  {(props) => (
                    <MenuTab {...props} category="beverage" />
                  )}
                </Tab.Screen>
                <Tab.Screen name="디저트">
                  {(props) => (
                    <MenuTab {...props} category="dessert" />
                  )}
                </Tab.Screen>
              </Tab.Navigator>
            )}
          </Stack.Screen>
          <Stack.Screen name="DrinkDetail" options={{ title: '음료 상세보기' }}>
            {(props) => (
              <DrinkDetailScreen {...props} addToCart={addToCart} />
            )}
          </Stack.Screen>
          <Stack.Screen name="DessertDetail" options={{ title: '디저트 상세보기' }}>
            {(props) => (
              <DessertDetailScreen {...props} addToCart={addToCart} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Cart">
            {(props) => (
              <CartScreen {...props} cartItems={cartItems} clearCart={clearCart} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Main" component={Main} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;