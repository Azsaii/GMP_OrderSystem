import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import styled from 'styled-components/native';
import { auth, firestore } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { setLoggedIn, setUserEmail, setUserName } from '../state';
import ErrorModal from '../ErrorModal';

const Container = styled.View`
  flex: 1;
  background-color: #f8f9fa; /* 배경색을 연한 회색으로 변경 */
  padding: 20px;
  justify-content: center; /* 컨텐츠를 세로 중앙 정렬 */
`;

const Input = styled.TextInput`
  width: 100%;
  padding: 15px;
  border-width: 1px;
  border-color: #ced4da;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: #ffffff; /* 입력창 배경색 흰색 */
  font-size: 16px; /* 폰트 크기 조정 */
`;

const ErrorText = styled.Text`
  color: red;
  margin-bottom: 5px;
  font-size: 14px; /* 에러 메시지 폰트 크기 조정 */
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 20px;
`;

const StyledButton = styled.TouchableOpacity`
  padding: 15px;
  background-color: black;
  border-radius: 8px;
  align-items: center;
  margin: 0 5px;
  flex: 1; /* 버튼을 가득 채우기 */
`;

const ButtonText = styled.Text`
  color: #ffffff;
  font-size: 18px; /* 버튼 텍스트 폰트 크기 조정 */
`;

const SignUp = ({ navigation }) => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessages, setErrorMessages] = useState({});
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();

  const handleSignUp = async () => {
    // 각 입력창에 대해 조건에 맞지 않으면 에러메시지를 표시
    const newErrorMessages = {};
    if (!nickname) newErrorMessages.nickname = '닉네임은 최대 10자입니다.';
    if (nickname.length > 10)
      newErrorMessages.nickname = '닉네임은 최대 10자입니다.';
    if (!email) newErrorMessages.email = '아이디는 이메일 형식입니다.';
    if (!/\S+@\S+\.\S+/.test(email))
      newErrorMessages.email = '아이디는 이메일 형식입니다.';
    if (!password || password.length < 6 || password.length > 20) {
      newErrorMessages.password = '비밀번호는 6 ~ 20자입니다.';
    }
    if (password !== confirmPassword)
      newErrorMessages.confirmPassword = '비밀번호가 다릅니다.';

    setErrorMessages(newErrorMessages);

    if (Object.keys(newErrorMessages).length > 0) {
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userRef = doc(firestore, 'users', user.uid);
      const initialData = {
        name: nickname,
        email: email,
        points: 5000,
      };
      await setDoc(userRef, initialData);

      dispatch(setLoggedIn(true));
      dispatch(setUserEmail(user.email));
      dispatch(setUserName(nickname));

      Alert.alert('회원가입 성공', '회원가입이 완료되었습니다.');
      navigation.navigate('Home');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('이미 가입된 이메일입니다.');
        setErrorModalVisible(true);
      } else {
        setErrorMessage('회원가입 실패. 다시 시도하세요.');
        setErrorModalVisible(true);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Container>
          <ErrorText>{errorMessages.nickname}</ErrorText>
          <Input
            placeholder="닉네임 입력"
            value={nickname}
            onChangeText={setNickname}
          />

          <ErrorText>{errorMessages.email}</ErrorText>
          <Input
            placeholder="이메일 입력"
            value={email}
            onChangeText={setEmail}
          />

          <ErrorText>{errorMessages.password}</ErrorText>
          <Input
            placeholder="비밀번호 입력"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <ErrorText>{errorMessages.confirmPassword}</ErrorText>
          <Input
            placeholder="비밀번호 확인"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <ButtonContainer>
            <StyledButton onPress={handleSignUp}>
              <ButtonText>회원가입</ButtonText>
            </StyledButton>
          </ButtonContainer>
          <ErrorModal
            visible={errorModalVisible}
            message={errorMessage}
            onClose={() => setErrorModalVisible(false)}
          />
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
