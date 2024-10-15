// CheckoutOrder/components/PaymentMethodModal.js

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
import { UserContext } from '../contexts/UserContext';
import { firestore, auth } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const PaymentMethodModal = ({
  visible,
  onDismiss,
  selectedPaymentType,
  setSelectedPaymentMethod,
  setPaymentModalVisible,
}) => {
  const { addPaymentMethod } = useContext(UserContext);

  // 카드 정보 상태
  const [cardInfo, setCardInfo] = useState({
    cardNumber: ['', '', '', ''],
    expiryDate: '',
    cvc: '',
    password: '',
    birthdate: '',
    nickname: '',
  });

  // 계좌 정보 상태
  const [accountInfo, setAccountInfo] = useState({
    bankName: '',
    accountNumber: '',
    password: '',
    nickname: '',
  });

  const [bankMenuVisible, setBankMenuVisible] = useState(false);

  const refs = {
    cardInput0: useRef(null),
    cardInput1: useRef(null),
    cardInput2: useRef(null),
    cardInput3: useRef(null),
  };

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('알림', message);
    }
  };

  // 결제 수단 등록 함수
  const registerPaymentMethod = async () => {
    if (selectedPaymentType === 'Card' && validateCardRegistration()) {
      const newCardMethod = {
        id: '1',
        type: 'Card',
        name: cardInfo.nickname || '등록된 카드',
        details: {
          cardNumber: cardInfo.cardNumber.join(''),
          expiryDate: cardInfo.expiryDate,
          cvc: cardInfo.cvc,
          password: cardInfo.password,
          birthdate: cardInfo.birthdate,
          nickname: cardInfo.nickname,
        },
        isRegistered: true,
      };

      await savePaymentMethodToFirestore(newCardMethod);

      addPaymentMethod(newCardMethod);
      setSelectedPaymentMethod(newCardMethod);
      setPaymentModalVisible(false);
    } else if (selectedPaymentType === 'Account' && validateAccountRegistration()) {
      const newAccountMethod = {
        id: '2',
        type: 'Account',
        name: accountInfo.nickname || '등록된 계좌',
        details: {
          bankName: accountInfo.bankName,
          accountNumber: accountInfo.accountNumber,
          password: accountInfo.password,
          nickname: accountInfo.nickname,
        },
        isRegistered: true,
      };

      await savePaymentMethodToFirestore(newAccountMethod);

      addPaymentMethod(newAccountMethod);
      setSelectedPaymentMethod(newAccountMethod);
      setPaymentModalVisible(false);
    } else {
      showToast('모든 필드를 채워주세요.');
    }
  };

  // Firestore에 결제 수단 저장 함수
  const savePaymentMethodToFirestore = async (paymentMethod) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);

        // 현재 사용자의 paymentMethods를 가져옵니다.
        const userDoc = await getDoc(userDocRef);
        let paymentMethods = [];
        if (userDoc.exists()) {
          paymentMethods = userDoc.data().paymentMethods || [];
        }

        // 결제 수단을 업데이트합니다.
        const index = paymentMethods.findIndex((method) => method.id === paymentMethod.id);
        if (index !== -1) {
          paymentMethods[index] = paymentMethod;
        } else {
          paymentMethods.push(paymentMethod);
        }

        // Firestore에 업데이트된 paymentMethods를 저장합니다.
        await updateDoc(userDocRef, {
          paymentMethods: paymentMethods,
        });
      }
    } catch (error) {
      console.error('결제 수단 저장 중 오류 발생:', error);
    }
  };

  // 카드 등록 유효성 검사 함수
  const validateCardRegistration = () => {
    const { cardNumber, expiryDate, cvc, password, birthdate, nickname } = cardInfo;
    return (
      cardNumber.every((number) => number.length === 4) &&
      expiryDate.length === 5 &&
      cvc.length === 3 &&
      password.length === 2 &&
      birthdate.length === 6 &&
      nickname.length > 0
    );
  };

  // 계좌 등록 유효성 검사 함수
  const validateAccountRegistration = () => {
    const { bankName, accountNumber, password, nickname } = accountInfo;
    return (
      bankName.length > 0 &&
      accountNumber.length > 0 &&
      password.length === 2 &&
      nickname.length > 0
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
              {cardInfo.cardNumber.map((value, index) => (
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
                }
              >
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
