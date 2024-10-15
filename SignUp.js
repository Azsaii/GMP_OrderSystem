// SignUp.js

import React, { useState } from 'react';
import { Button, Alert } from 'react-native';
import styled from 'styled-components/native';
import { auth, firestore } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { setLoggedIn, setUserEmail, setUserName } from './state';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Input = styled.TextInput`
  width: 100%;
  padding: 12px;
  border-width: 1px;
  border-color: #ccc;
  border-radius: 4px;
  margin-bottom: 12px;
`;

// 회원가입 화면
const SignUp = ({ navigation }) => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useDispatch();

  // 회원가입 핸들러
  const handleSignUp = async () => {
    // 입력 유효성 검사
    if (!nickname || !email || !password || !confirmPassword) {
      Alert.alert('입력 오류', '모든 필드를 입력하세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('입력 오류', '유효한 이메일 주소를 입력하세요.');
      return;
    }

    try {
      // Firebase를 통한 회원가입
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Firestore에 사용자 정보 저장 (쿠폰, 포인트, 결제 정보 데이터 추가)
      const userRef = doc(firestore, 'users', user.uid);
      const initialData = {
        name: nickname,
        email: email,
        points: 5000,
        coupons: [
          {
            id: 'c1',
            name: '10,000원 이상 3,000원 할인',
            discount: 3000,
            minAmount: 10000,
            used: false,
          },
          {
            id: 'c2',
            name: '20,000원 이상 50% 할인',
            discountRate: 0.5,
            minAmount: 20000,
            used: false,
          },
        ],
        paymentMethods: [
          { id: 'p1', type: 'Card', name: '카드', isRegistered: false },
          { id: 'p2', type: 'Account', name: '계좌', isRegistered: false },
          { id: 'p3', type: 'KakaoPay', name: '카카오페이', isRegistered: true },
          { id: 'p4', type: 'TossPay', name: '토스페이', isRegistered: true },
        ],
      };
      await setDoc(userRef, initialData);

      // Redux 상태 업데이트
      dispatch(setLoggedIn(true));
      dispatch(setUserEmail(user.email));
      dispatch(setUserName(nickname));

      Alert.alert('회원가입 성공', '회원가입이 완료되었습니다.');
      navigation.navigate('Home'); // 회원가입 후 자동 로그인 및 Home 화면으로 이동
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('입력 오류', '이미 사용 중인 이메일 주소입니다.');
      } else {
        Alert.alert('회원가입 실패', '다시 시도하세요.');
        console.error(error.message);
      }
    }
  };

  return (
    <Container>
      <Title>회원가입 화면</Title>
      <Input
        placeholder="닉네임 입력"
        value={nickname}
        onChangeText={setNickname}
      />
      <Input
        placeholder="이메일 입력"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        placeholder="비밀번호 입력"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Input
        placeholder="비밀번호 확인"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="회원가입" onPress={handleSignUp} />
    </Container>
  );
};

export default SignUp;
