import React, { useState } from 'react';
import { Button, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { setLoggedIn, setUserEmail, setUserName } from '../state';
import ErrorModal from '../ErrorModal';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
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

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const StyledButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  background-color: #000; /* 버튼 배경색을 검정으로 설정 */
  border-radius: 4px;
  align-items: center;
  margin: 0 5px; /* 버튼 사이 간격 조정 */
`;

const ButtonText = styled.Text`
  color: #fff; /* 버튼 텍스트 색상을 흰색으로 설정 */
  font-size: 16px;
`;

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      dispatch(setLoggedIn(true));
      dispatch(setUserEmail(user.email));
      dispatch(setUserName(user.displayName || ''));

      navigation.navigate('Home');
    } catch (error) {
      console.error('로그인 실패:', error);
      setErrorMessage('아이디나 비밀번호가 틀렸습니다.');
      setErrorModalVisible(true);
    }
  };

  return (
    <Container>
      <Title>로그인</Title>
      <Input placeholder="아이디" value={email} onChangeText={setEmail} />
      <Input
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <ButtonContainer>
        <StyledButton onPress={handleLogin}>
          <ButtonText>로그인</ButtonText>
        </StyledButton>
        <StyledButton onPress={() => navigation.navigate('SignUp')}>
          <ButtonText>회원가입</ButtonText>
        </StyledButton>
      </ButtonContainer>
      <ErrorModal
        visible={errorModalVisible}
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </Container>
  );
};

export default Login;
