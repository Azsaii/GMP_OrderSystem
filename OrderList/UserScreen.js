import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Button, Alert, Animated, Easing } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; 
import { firestore, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { format } from 'date-fns';

export default function UserScreen() {
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const progressBarColor = useState(new Animated.Value(0))[0];
  const checkmarkOpacity = useState(new Animated.Value(0))[0];
  const spinValue = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        Alert.alert('오류', '로그인된 사용자가 없습니다.');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    const formattedStartDate = format(startDate, 'yyMMdd');
    const formattedEndDate = format(endDate, 'yyMMdd');
    let unsubscribeList = [];

    for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
      const dateString = format(d, 'yyMMdd');
      const ordersCollectionRef = collection(firestore, 'orders', dateString, 'orders');
      const q = query(ordersCollectionRef, where('customerId', '==', userId));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrderDetails((prevOrders) => {
          const updatedOrderMap = new Map(prevOrders.map(order => [order.id, order]));
          updatedOrders.forEach(order => updatedOrderMap.set(order.id, order));
          return Array.from(updatedOrderMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
      });

      unsubscribeList.push(unsubscribe);
    }

    setLoading(false);

    return () => unsubscribeList.forEach(unsub => unsub());
  }, [userId, startDate, endDate]);

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const getOrderStatus = (order) => {
    if (!order.isStarted && !order.isCompleted) return '조리 전';
    if (order.isStarted && !order.isCompleted) return '조리 중';
    if (order.isStarted && order.isCompleted) return '조리 완료';
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
    return (
      <View style={styles.loadingContainer}>
        <Text>일치하는 주문이 없습니다.</Text>
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

            {getOrderStatus(order) === '조리 중' && (
              <Animated.View style={[styles.loadingSpinner, { transform: [{ rotate: spin }] }]} />
            )}

            {getOrderStatus(order) === '조리 완료' && (
              <Animated.Text style={[styles.checkmark, { opacity: checkmarkOpacity }]}>✔️</Animated.Text>
            )}

            {getOrderStatus(order) === '조리 중' ? startLoadingAnimation() : stopLoadingAnimation()}
            {getOrderStatus(order) === '조리 완료' && triggerCompletionAnimation()}

            {order.menuList && order.menuList.map((item, index) => (
              <View key={index} style={styles.menuItem}>
                <Text>메뉴 이름: {item.menuName}</Text>
                <Text>옵션: {item.options.join(', ')}</Text>
                <Text>수량: {item.quantity}</Text>
                <Text>가격: {item.total}원</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  menuItem: {
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
