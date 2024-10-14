// Main.js
import React from 'react';
import { Button } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { setLoggedIn } from './state';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Main = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // Redux에서 로그인 상태 가져오기

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase 로그아웃
      dispatch(setLoggedIn(false)); // Redux 상태 업데이트
      console.log('로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <Container>
      <Title>메인 화면</Title>
      {isLoggedIn ? (
        <>
          <Button title="로그아웃" onPress={handleLogout} />
          <Button title="메뉴 고르기" onPress={() => navigation.navigate('Home')} />
        </>
      ) : (
        <Button title="로그인" onPress={() => navigation.navigate('Login')} /> // 로그인 상태가 아닐 때 로그인 버튼 표시
      )}
    </Container>
  );
};

export default Main;
