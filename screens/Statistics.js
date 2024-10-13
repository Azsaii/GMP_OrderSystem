import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, Button } from 'react-native';
import { firestore } from '../firebaseConfig'; // Firebase 설정 파일
import { collection, getDocs } from 'firebase/firestore'; // Firestore 메서드 가져오기
import DateTimePicker from '@react-native-community/datetimepicker'; // 날짜 선택을 위한 DateTimePicker 임포트

const Statistics = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [ordersList, setOrdersList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택된 날짜 상태
  const [showDatePicker, setShowDatePicker] = useState(false); // 날짜 선택기 표시 여부

  // 오늘 날짜를 YYMMDD 형식으로 변환하는 함수
  const getFormattedDate = (date) => {
    const year = date.getFullYear().toString().slice(-2); // 마지막 두 자리 연도
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 월
    const day = date.getDate().toString().padStart(2, '0'); // 일
    return `${year}${month}${day}`; // 형식: YYMMDD
  };

  const fetchOrders = async (date) => {
    const dateString = getFormattedDate(date); // 선택된 날짜를 가져옴
    try {
      const ordersSnapshot = await getDocs(
        collection(firestore, 'orders', dateString, 'orders')
      );
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 총 매출 계산 (문자열에서 숫자로 변환)
      const total = ordersData.reduce(
        (sum, order) => sum + (parseFloat(order.total) || 0),
        0
      );
      setTotalSales(total);

      // 주문 리스트 설정
      setOrdersList(ordersData);
    } catch (error) {
      console.error('주문 정보를 가져오는 중 오류 발생:', error);
      Alert.alert('오류', '주문 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchOrders(selectedDate); // 컴포넌트가 마운트될 때 오늘 날짜의 주문을 가져옴
  }, []);

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      fetchOrders(date); // 날짜가 변경될 때 해당 날짜의 주문을 가져옴
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
      }}
    >
      <Text>주문 ID: {item.id}</Text>
      <Text>총 가격: {parseFloat(item.total).toLocaleString()} 원</Text>
    </View>
  );

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        총 매출: {totalSales.toLocaleString()} 원
      </Text>
      <Button
        title={`선택된 날짜: ${getFormattedDate(selectedDate)}`}
        onPress={() => setShowDatePicker(true)}
      />

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <FlatList
        data={ordersList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default Statistics;
