// components/PaymentMethodModal.js

import React, { useState, useRef, useContext } from 'react';
import { View, Platform, ToastAndroid } from 'react-native';
import {
  Dialog,
  Button,
  IconButton,
  TextInput as PaperTextInput,
  Menu,
} from 'react-native-paper';
import styles from '../styles/CheckoutStyles';
import { UserContext } from '../contexts/UserContext'; // 사용자 컨텍스트를 가져옴

// 결제 수단 모달 컴포넌트
const PaymentMethodModal = ({
  visible, // 모달 표시 여부
  onDismiss, // 모달을 닫는 함수
  selectedPaymentType, // 선택된 결제 수단 유형 (카드 또는 계좌)
  setSelectedPaymentMethod, // 선택된 결제 수단을 설정하는 함수
  setPaymentModalVisible, // 결제 모달의 표시 여부를 설정하는 함수
}) => {
  // 사용자 컨텍스트에서 결제 수단 관리 함수를 가져옴
  const { addPaymentMethod } = useContext(UserContext);

  // 카드 정보 상태
  const [cardInfo, setCardInfo] = useState({
    cardNumber: ['', '', '', ''], // 카드 번호를 4개 배열로 관리
    expiryDate: '', // 유효기간
    cvc: '', // CVC 번호
    password: '', // 비밀번호 앞 두 자리
    birthdate: '', // 생년월일
    nickname: '', // 카드 별명
  });

  // 계좌 정보 상태
  const [accountInfo, setAccountInfo] = useState({
    bankName: '', // 은행 이름
    accountNumber: '', // 계좌 번호
    password: '', // 비밀번호 앞 두 자리
    nickname: '', // 계좌 별명
  });

  // 은행 메뉴 표시 여부
  const [bankMenuVisible, setBankMenuVisible] = useState(false);

  // 카드 입력 필드에 대한 참조
  const refs = {
    cardInput0: useRef(null),
    cardInput1: useRef(null),
    cardInput2: useRef(null),
    cardInput3: useRef(null),
  };

  // Toast 메시지를 표시하는 함수
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      console.log(message);
    }
  };

  // 결제 수단 등록 함수
  const registerPaymentMethod = () => {
    // 카드 결제 방식 선택 시
    if (selectedPaymentType === 'Card' && validateCardRegistration()) {
      const newCardMethod = {
        id: '1', // 카드의 ID는 '1'로 고정 (UserContext에서 동일한 ID 사용)
        type: 'Card',
        name: cardInfo.nickname || '등록된 카드',
        details: cardInfo, // 카드 상세 정보 저장 (보안상 실제 앱에서는 민감 정보는 저장하지 않음)
        isRegistered: true,
      };
      addPaymentMethod(newCardMethod); // 결제 수단 업데이트
      setSelectedPaymentMethod(newCardMethod); // 선택된 결제 수단 설정
      setPaymentModalVisible(false); // 모달 닫기
    }
    // 계좌 결제 방식 선택 시
    else if (selectedPaymentType === 'Account' && validateAccountRegistration()) {
      const newAccountMethod = {
        id: '2', // 계좌의 ID는 '2'로 고정 (UserContext에서 동일한 ID 사용)
        type: 'Account',
        name: accountInfo.nickname || '등록된 계좌',
        details: accountInfo, // 계좌 상세 정보 저장 (보안상 실제 앱에서는 민감 정보는 저장하지 않음)
        isRegistered: true,
      };
      addPaymentMethod(newAccountMethod); // 결제 수단 업데이트
      setSelectedPaymentMethod(newAccountMethod); // 선택된 결제 수단 설정
      setPaymentModalVisible(false); // 모달 닫기
    }
    // 필드가 모두 채워지지 않은 경우
    else {
      // Alert 대신 Toast 알림으로 대체
      showToast('모든 필드를 채워주세요.');
    }
  };

  // 카드 등록 유효성 검사 함수
  const validateCardRegistration = () => {
    const { cardNumber, expiryDate, cvc, password, birthdate, nickname } = cardInfo;
    return (
      cardNumber.every((number) => number.length === 4) && // 카드 번호가 4자리씩 입력되었는지 확인
      expiryDate.length === 5 && // 유효기간이 5자리(MM/YY)인지 확인
      cvc.length === 3 && // CVC가 3자리인지 확인
      password.length === 2 && // 비밀번호가 2자리인지 확인
      birthdate.length === 6 && // 생년월일이 6자리인지 확인
      nickname.length > 0 // 카드 별명이 입력되었는지 확인
    );
  };

  // 계좌 등록 유효성 검사 함수
  const validateAccountRegistration = () => {
    const { bankName, accountNumber, password, nickname } = accountInfo;
    return (
      bankName.length > 0 && // 은행 이름이 입력되었는지 확인
      accountNumber.length > 0 && // 계좌 번호가 입력되었는지 확인
      password.length === 2 && // 비밀번호가 2자리인지 확인
      nickname.length > 0 // 계좌 별명이 입력되었는지 확인
    );
  };

  // 유효기간 입력 시 자동으로 MM/YY 형식으로 포맷하는 함수
  const handleExpiryDateChange = (value) => {
    const formattedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    const formattedExpiry =
      formattedValue.length > 2
        ? `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`
        : formattedValue;
    setCardInfo({ ...cardInfo, expiryDate: formattedExpiry });
  };

  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>결제 수단 등록</Dialog.Title>
      {/* 모달 닫기 버튼 */}
      <IconButton
        icon="close"
        onPress={onDismiss}
        style={styles.closeIconButton}
      />
      <Dialog.Content>
        {selectedPaymentType === 'Card' ? (
          <>
            {/* 카드 등록 UI */}
            <View style={styles.row}>
              {cardInfo.cardNumber.map((_, index) => (
                <PaperTextInput
                  key={index}
                  ref={refs[`cardInput${index}`]}
                  label="카드"
                  value={cardInfo.cardNumber[index]}
                  onChangeText={(value) => {
                    const newCardNumber = [...cardInfo.cardNumber];
                    newCardNumber[index] = value;
                    setCardInfo({ ...cardInfo, cardNumber: newCardNumber });
                    if (value.length === 4 && index < 3) {
                      refs[`cardInput${index + 1}`].current.focus();
                    }
                  }}
                  keyboardType="numeric"
                  style={[styles.input, styles.cardInput]}
                  maxLength={4}
                />
              ))}
            </View>
            <PaperTextInput
              label="유효기간 (MM/YY)"
              value={cardInfo.expiryDate}
              onChangeText={handleExpiryDateChange}
              keyboardType="numeric"
              style={styles.input}
              maxLength={5}
              placeholder="MM/YY"
            />
            <PaperTextInput
              label="CVC"
              value={cardInfo.cvc}
              onChangeText={(text) => setCardInfo({ ...cardInfo, cvc: text })}
              keyboardType="numeric"
              style={styles.input}
              maxLength={3}
            />
            <PaperTextInput
              label="비밀번호 앞 두자리"
              value={cardInfo.password}
              onChangeText={(text) =>
                setCardInfo({ ...cardInfo, password: text })
              }
              keyboardType="numeric"
              style={styles.input}
              maxLength={2}
            />
            <PaperTextInput
              label="생년월일 (예시 : 001006)"
              value={cardInfo.birthdate}
              onChangeText={(text) =>
                setCardInfo({ ...cardInfo, birthdate: text })
              }
              keyboardType="numeric"
              style={styles.input}
              maxLength={6}
            />
            <PaperTextInput
              label="카드 별명 (최대 20자리)"
              value={cardInfo.nickname}
              onChangeText={(text) =>
                setCardInfo({ ...cardInfo, nickname: text })
              }
              style={styles.input}
              maxLength={20}
            />
          </>
        ) : (
          <>
            {/* 은행 선택 드롭다운 */}
            <View style={{ alignSelf: 'flex-start' }}>
              <Menu
                visible={bankMenuVisible}
                onDismiss={() => setBankMenuVisible(false)}
                anchor={
                  <Button onPress={() => setBankMenuVisible(true)}>
                    {accountInfo.bankName || '은행 선택'}
                  </Button>
                }>
                {['국민은행', '하나은행', '토마토저축은행', '한성은행'].map((bank) => (
                  <Menu.Item
                    key={bank}
                    onPress={() => {
                      setAccountInfo({ ...accountInfo, bankName: bank });
                      setBankMenuVisible(false);
                    }}
                    title={bank}
                  />
                ))}
              </Menu>
            </View>
            <PaperTextInput
              label="계좌 번호"
              value={accountInfo.accountNumber}
              onChangeText={(text) =>
                setAccountInfo({ ...accountInfo, accountNumber: text })
              }
              keyboardType="numeric"
              style={styles.input}
              maxLength={25}
            />
            <PaperTextInput
              label="비밀번호 앞 두자리"
              value={accountInfo.password}
              onChangeText={(text) =>
                setAccountInfo({ ...accountInfo, password: text })
              }
              keyboardType="numeric"
              style={styles.input}
              maxLength={2}
            />
            <PaperTextInput
              label="계좌 별명 (최대 20자리)"
              value={accountInfo.nickname}
              onChangeText={(text) =>
                setAccountInfo({ ...accountInfo, nickname: text })
              }
              style={styles.input}
              maxLength={20}
            />
          </>
        )}
      </Dialog.Content>
      {/* 등록하기 버튼 */}
      <Dialog.Actions>
        <Button onPress={registerPaymentMethod}>등록하기</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default PaymentMethodModal;
