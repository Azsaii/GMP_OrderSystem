import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore'; 
import { firestore, auth } from '../firebaseConfig'; // Firebase 설정 파일
import { onAuthStateChanged } from 'firebase/auth';
import { format } from 'date-fns'; // 날짜 형식을 위한 라이브러리

export default function UserScreen() {
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // 로그인된 사용자 정보 가져오기
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // 사용자 UID 설정
      } else {
        setUserId(null);
        Alert.alert('오류', '로그인된 사용자가 없습니다.');
      }
    });

    return () => unsubscribe();
  }, []);

  // Firestore에서 일주일 간의 주문 데이터 가져오기
  const fetchOrderData = async () => {
    if (!userId) return;

    try {
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7); // 오늘로부터 7일 전

      // 오늘부터 일주일간의 날짜 리스트 생성 (YYMMDD 형식)
      const dateStrings = [];
      for (let d = oneWeekAgo; d <= today; d.setDate(d.getDate() + 1)) {
        const formattedDate = format(d, 'yyMMdd'); // YYMMDD 형식으로 변환
        dateStrings.push(formattedDate);
      }

      let allOrders = [];

      // 각 날짜별로 Firestore에서 주문 데이터를 가져오기
      for (const dateString of dateStrings) {
        const ordersCollectionRef = collection(firestore, 'orders', dateString, 'orders');
        const q = query(ordersCollectionRef, where('customerId', '==', userId)); // customerId 필터링
        const ordersSnapshot = await getDocs(q);

        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        allOrders = [...allOrders, ...ordersData];
      }

      // 최신순으로 정렬 (createdAt 필드 기준)
      allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrderDetails(allOrders);
    } catch (error) {
      console.error('주문 데이터를 가져오는 중 오류 발생:', error);
      Alert.alert('오류', '주문 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 주문 데이터 가져오기 실행
  useEffect(() => {
    if (userId) {
      fetchOrderData();
    }
  }, [userId]);

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
      <View style={styles.orderDetails}>
        {orderDetails.map((order) => (
          <View key={order.id} style={styles.orderItem}>
            <Text style={styles.orderTitle}>주문 ID: {order.id}</Text>
            <Text>고객 ID: {order.customerId || 'Unknown'}</Text>
            <Text>완료 여부: {order.isCompleted ? '완료' : '미완료'}</Text>

            {/* 메뉴 리스트 렌더링 */}
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
});
