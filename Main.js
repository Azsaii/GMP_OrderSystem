// Main.js
import React from 'react';
import { Button } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

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

    return (
        <Container>
            <Title>메인 화면</Title>
            <Button title="로그인" onPress={() => navigation.navigate('Login')} />
        </Container>
    );
};

export default Main;
