// Login.js
import React, { useState } from 'react';
import { Button, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { setLoggedIn, setUserEmail, setUserName } from '../state';

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

// 로그인 화면
const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 로그인 성공 시 Redux 상태 업데이트
            dispatch(setLoggedIn(true));
            dispatch(setUserEmail(user.email));
            dispatch(setUserName(user.displayName || ''));

            console.log('로그인 성공:', user);
            navigation.navigate('Main');
        } catch (error) {
            console.error('로그인 실패:', error);
            Alert.alert('로그인 실패', error.message);
        }
    };

    return (
        <Container>
            <Title>로그인 화면</Title>
            <Input
                placeholder="아이디 입력"
                value={email}
                onChangeText={setEmail}
            />
            <Input
                placeholder="비밀번호 입력"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Button title="로그인" onPress={handleLogin} />
            <Button title="회원가입" onPress={() => navigation.navigate('SignUp')} />
        </Container>

    );
};

export default Login;
