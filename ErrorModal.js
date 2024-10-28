import React from 'react';
import { Modal, Text, StyleSheet, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  width: 80%;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  align-items: center;
`;

const CloseButton = styled(TouchableOpacity)`
  background-color: black; /* 버튼 배경색 검정 */
  padding: 10px 20px;
  border-radius: 5px;
  margin-top: 10px;
`;

const CloseButtonText = styled(Text)`
  color: white; /* 버튼 텍스트 색상 흰색 */
  font-size: 16px;
`;

const ErrorModal = ({ visible, message, onClose }) => {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <ModalContainer>
        <ModalContent>
          <Icon
            name="warning"
            size={40}
            color="red"
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.errorText}>{message}</Text>
          <CloseButton onPress={onClose}>
            <CloseButtonText>닫기</CloseButtonText>
          </CloseButton>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  errorText: {
    marginBottom: 20,
    textAlign: 'center',
    margin: 10,
  },
});

export default ErrorModal;
