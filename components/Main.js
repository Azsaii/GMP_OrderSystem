import React from 'react';
import { Button } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { setLoggedIn } from '../state';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  margin-bottom: 20px;
`;

// 로그인 성공시 화면
const LoggedIn = ({ onLogout, onNavigateHome, onNavigateAdmin, onNavigateUser }) => (
  <>  
    <Button title="주문하러 가기" onPress={onNavigateHome} />
    <Button title="주문 내역" onPress={onNavigateUser} />
    <Button title="관리자 모드" onPress={onNavigateAdmin} />
    <Button title="로그아웃" onPress={onLogout} />
  </>
);

// 로그인 전 화면
const LoggedOut = ({ onNavigateLogin }) => (
  <Button title="로그인" onPress={onNavigateLogin} /> 
);

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
        <LoggedIn 
          onLogout={handleLogout} 
          onNavigateHome={() => navigation.navigate('Home')} 
          onNavigateAdmin={() => navigation.navigate('Admin')}
          onNavigateUser={() => navigation.navigate('User')}
        />
      ) : (
        <LoggedOut onNavigateLogin={() => navigation.navigate('Login')} />
      )}
    </Container>
  );
};

export default Main;
