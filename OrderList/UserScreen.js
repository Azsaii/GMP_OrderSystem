import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Button, Alert, Animated, Easing } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { format } from 'date-fns';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export default function UserScreen() {
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // 시작 날짜 변경 핸들러
  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false); // DateTimePicker 닫기
    if (selectedDate) {
      setStartDate(selectedDate); // 선택된 날짜를 시작 날짜로 설정
    }
  };

  // 종료 날짜 변경 핸들러
  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false); // DateTimePicker 닫기
    if (selectedDate) {
      setEndDate(selectedDate); // 선택된 날짜를 종료 날짜로 설정
    }
  };

  const progressBarColor = useState(new Animated.Value(0))[0];
  const checkmarkOpacity = useState(new Animated.Value(0))[0];
  const spinValue = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        const token = await registerForPushNotificationsAsync();
        if (token) {
          await savePushTokenToFirestore(user.uid, token);
        }
      } else {
        setUserId(null);
        Alert.alert('오류', '로그인된 사용자가 없습니다.');
      }
    });

    return () => unsubscribe();
  }, []);

  
  

  useEffect(() => {
    if (!userId) return;
  
    const fetchFilteredOrders = async () => {
      setLoading(true); // 로딩 상태 활성화
      setOrderDetails([]); // 이전 데이터 초기화
  
      const unsubscribeList = [];
      try {
        // 날짜 범위 순회
        for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
          const dateString = format(d, 'yyMMdd');
          const ordersCollectionRef = collection(firestore, 'orders', dateString, 'orders');
          const q = query(ordersCollectionRef, where('customerId', '==', userId));
  
          // 날짜별로 구독 생성
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const updatedOrders = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
  
            // 상태 업데이트 (이전 데이터와 합쳐 중복 제거 및 정렬)
            setOrderDetails((prevOrders) => {
              const updatedOrderMap = new Map(prevOrders.map((order) => [order.id, order]));
              updatedOrders.forEach((order) => {
                updatedOrderMap.set(order.id, order);
                sendNotification(order); // 여기서 호출
              });
              return Array.from(updatedOrderMap.values()).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );
            });
          });
  
          unsubscribeList.push(unsubscribe);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false); // 로딩 상태 비활성화
      }
  
      // 컴포넌트가 언마운트되거나 의존성이 변경될 때 구독 해제
      return () => unsubscribeList.forEach((unsub) => unsub());
    };
  
    fetchFilteredOrders(); // 데이터 가져오기
  }, [userId, startDate, endDate]); // 의존성 배열에 userId, startDate, endDate 추가
  
  

  const savePushTokenToFirestore = async (userId, token) => {
    try {
      const userRef = doc(firestore, 'users', userId);
      await setDoc(userRef, { expoPushToken: token }, { merge: true });
      console.log('푸시 토큰 저장 성공:', token);
    } catch (error) {
      console.error('푸시 토큰 저장 실패:', error);
    }
  };
  
  // 푸시 알림 권한 요청 및 토큰 가져오기
  const registerForPushNotificationsAsync = async () => {
    // if (!Device.isDevice) {
    //   console.warn('푸시 알림은 실제 기기에서만 작동합니다.');
    //   return null;
    // }
  
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
  
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
  
    if (finalStatus !== 'granted') {
      Alert.alert('권한 거부됨', '푸시 알림 권한이 필요합니다.');
      return null;
    }
  
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('푸시 알림 토큰:', token);
      return token;
    } catch (error) {
      console.error('푸시 알림 토큰 생성 실패:', error);
      return null;
    }
  };
  
  // 푸시 알림 보내기
  const sendNotification = async (order) => {
    const orderStatus = getOrderStatus(order);
    console.log('주문 상태 확인:', orderStatus);
  
    if (orderStatus === '준비 완료') {
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '준비 완료 알림',
            body: `[주문번호 ${order.id}] 주문하신 메뉴가 준비되었습니다!`,
            sound: true,
          },
          trigger: null,
        });
        console.log('푸시 알림 전송 성공:', notificationId);
      } catch (error) {
        console.error('푸시 알림 전송 실패:', error);
      }
    } else {
      console.log('알림 전송 조건 불일치: 상태가 "준비 완료"가 아닙니다.');
    }
  };

  const getOrderStatus = (order) => {
    if (!order.isStarted && !order.isCompleted) return '주문 완료';
    if (order.isStarted && !order.isCompleted) return '준비 중';
    if (order.isStarted && order.isCompleted) return '준비 완료';
    return '알 수 없음';
  };

  const getProgressBarWidth = (order) => {
    if (!order.isStarted && !order.isCompleted) return '0%';
    if (order.isStarted && !order.isCompleted) return '50%';
    if (order.isStarted && order.isCompleted) return '100%';
    return '0%';
  };

  const startLoadingAnimation = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopLoadingAnimation = () => {
    spinValue.setValue(0);
  };

  const triggerCompletionAnimation = () => {
    Animated.parallel([
      Animated.timing(progressBarColor, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(checkmarkOpacity, {
        toValue: 1,
        duration: 500,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const interpolatedColor = progressBarColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#76c7c0', '#FFD700'] 
  });

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>주문 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  
  if (!orderDetails.length) {
    // 주문 데이터가 없을 경우
    return (
      <View style={styles.container}>
        
        <View style={styles.datePickerContainer}>
          <Button title="시작 날짜 선택" onPress={() => setShowStartDatePicker(true)} />
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
            />
          )}

          <Button title="종료 날짜 선택" onPress={() => setShowEndDatePicker(true)} />
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
            />
          )}

          <Text style={styles.selectedPeriod}>
            선택된 기간: {format(startDate, 'yyyy-MM-dd')} ~ {format(endDate, 'yyyy-MM-dd')}
          </Text>
        </View>
        <Text style={styles.noOrdersText}>일치하는 주문이 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.datePickerContainer}>
        <Button title="시작 날짜 선택" onPress={() => setShowStartDatePicker(true)} />
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}

        <Button title="종료 날짜 선택" onPress={() => setShowEndDatePicker(true)} />
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}

        <Text>선택된 기간: {format(startDate, 'yyyy-MM-dd')} ~ {format(endDate, 'yyyy-MM-dd')}</Text>
      </View>

      <View style={styles.orderDetails}>
        {orderDetails.map((order) => (
          <View key={order.id} style={styles.orderItem}>
            <Text style={styles.orderTitle}>주문 ID: {order.id}</Text>
            <Text>고객 ID: {order.customerId || 'Unknown'}</Text>
            
            <Text>상태: {getOrderStatus(order)}</Text>

            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progress,
                  {
                    width: getProgressBarWidth(order),
                    backgroundColor: interpolatedColor,
                  },
                ]}
              />
            </View>

            {getOrderStatus(order) === '주문 완료' && (
              <Animated.View style={[styles.loadingSpinner, { transform: [{ rotate: spin }] }]} />
            )}

            {getOrderStatus(order) === '준비 중' && (
              <Animated.Text style={[styles.checkmark, { opacity: checkmarkOpacity }]}>✔️</Animated.Text>
            )}

            {getOrderStatus(order) === '준비 중' ? startLoadingAnimation() : stopLoadingAnimation()}
            {getOrderStatus(order) === '준비 완료' && triggerCompletionAnimation()}

            {order.menuList && order.menuList.map((item, index) => (
              <View key={index} style={styles.menuItem}>
                <Text>메뉴 이름: {item.menuName}</Text>
                <Text>옵션: {item.options.join(', ')}</Text>
                <Text>수량: {item.quantity}</Text>
                <Text>가격: {item.price*item.quantity}원</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  noOrdersText: {
    fontSize: 16,            // 글씨 크기
    color: '#a9a9a9',        // 회색 글씨
    textAlign: 'center',     // 텍스트 중앙 정렬
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  orderDetails: {
    marginVertical: 20,
  },
  orderItem: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 5,
    marginBottom: 10,
  },
  progress: {
    height: '100%',
    borderRadius: 5,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#76c7c0',
    borderRadius: 10,
    borderTopColor: 'transparent',
    alignSelf: 'center',
    marginTop: 5,
  },
  checkmark: {
    fontSize: 24,
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 5,
  },
});
