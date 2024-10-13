import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { firestore } from '../firebaseConfig'; // Firebase 설정 파일
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'; // Firestore 메서드 가져오기
import { Picker } from '@react-native-picker/picker'; // Picker 임포트
import DateTimePicker from '@react-native-community/datetimepicker'; // 날짜 선택을 위한 DateTimePicker 임포트
import OrderDetailModal from '../components/OrderDetailModal'; // 모달 컴포넌트 임포트

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false); // 모달 상태
  const [selectedOrder, setSelectedOrder] = useState(null); // 선택된 주문
  const [filter, setFilter] = useState('조리 전'); // 드롭다운 필터 상태
  const [sortOrder, setSortOrder] = useState('내림차순'); // 정렬 기준 상태
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택된 날짜 상태
  const [showDatePicker, setShowDatePicker] = useState(false); // 날짜 선택기 표시 여부

  const formatDate = (date) => {
    const year = date.getFullYear().toString().slice(-2); // 마지막 두 자리 연도
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 월
    const day = date.getDate().toString().padStart(2, '0'); // 일
    return `${year}${month}${day}`; // 형식: YYMMDD
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const dateString = formatDate(selectedDate); // 선택된 날짜를 형식에 맞게 변환
      try {
        const ordersSnapshot = await getDocs(
          collection(firestore, 'orders', dateString, 'orders') // 날짜 기반 컬렉션
        );
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 필터링 로직
        const filteredOrders = ordersData.filter((order) => {
          if (filter === '조리 전') {
            return !order.isStarted && !order.isCompleted;
          } else if (filter === '조리 시작') {
            return order.isStarted && !order.isCompleted;
          } else if (filter === '조리 완료') {
            return order.isStarted && order.isCompleted;
          }
          return true; // 기본값
        });

        // 정렬 로직
        const sortedOrders = filteredOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);

          return sortOrder === '내림차순' ? dateB - dateA : dateA - dateB;
        });

        setOrders(sortedOrders);
      } catch (error) {
        console.error('주문 정보를 가져오는 중 오류 발생:', error);
        Alert.alert('오류', '주문 정보를 가져오는 중 오류가 발생했습니다.');
      }
    };

    fetchOrders();
  }, [filter, sortOrder, selectedDate]); // filter, sortOrder, selectedDate가 변경될 때마다 주문을 다시 가져옴

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === '상세 보기') {
      const orderToView = orders.find((order) => order.id === orderId);
      setSelectedOrder(orderToView); // 선택된 주문 설정
      setModalVisible(true); // 모달 열기
      return; // 상태 업데이트는 하지 않음
    }

    const orderRef = doc(
      firestore,
      'orders',
      formatDate(selectedDate),
      'orders',
      orderId
    );
    let isStarted = false;
    let isCompleted = false;

    if (newStatus === '조리 시작') {
      isStarted = true;
    } else if (newStatus === '조리 완료') {
      isStarted = true;
      isCompleted = true;
    }

    try {
      await updateDoc(orderRef, { isStarted, isCompleted });

      // 상태 업데이트 후 주문 목록 다시 가져오기
      const updatedOrdersSnapshot = await getDocs(
        collection(firestore, 'orders', formatDate(selectedDate), 'orders')
      );
      const updatedOrdersData = updatedOrdersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 필터링 로직
      const filteredOrders = updatedOrdersData.filter((order) => {
        if (filter === '조리 전') {
          return !order.isStarted && !order.isCompleted;
        } else if (filter === '조리 시작') {
          return order.isStarted && !order.isCompleted;
        } else if (filter === '조리 완료') {
          return order.isStarted && order.isCompleted;
        }
        return true; // 기본값
      });

      // 정렬 로직
      const sortedOrders = filteredOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);

        return sortOrder === '내림차순' ? dateB - dateA : dateA - dateB;
      });

      setOrders(sortedOrders);
    } catch (error) {
      console.error('주문 상태 업데이트 중 오류 발생:', error);
      Alert.alert('오류', '주문 상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: 10,
        }}
      >
        <Text>주문 ID: {item.id}</Text>
        <Picker
          selectedValue={
            item.isCompleted
              ? '조리 완료'
              : item.isStarted
              ? '조리 시작'
              : '조리 전'
          }
          style={{ height: 50, width: 150 }}
          onValueChange={(itemValue) => handleStatusChange(item.id, itemValue)}
        >
          <Picker.Item label="조리 전" value="조리 전" />
          <Picker.Item label="조리 시작" value="조리 시작" />
          <Picker.Item label="조리 완료" value="조리 완료" />
          <Picker.Item label="상세 보기" value="상세 보기" />
        </Picker>
      </View>
    );
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text onPress={showDatePickerModal} style={{ marginBottom: 20 }}>
        선택된 날짜:{' '}
        {`${selectedDate.getFullYear().toString()}년 ${(
          selectedDate.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}월 ${selectedDate
          .getDate()
          .toString()
          .padStart(2, '0')}일`}{' '}
        (클릭하여 변경)
      </Text>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Picker
        selectedValue={filter}
        style={{ height: 50, width: 150, marginBottom: 20 }}
        onValueChange={(itemValue) => setFilter(itemValue)}
      >
        <Picker.Item label="조리 전" value="조리 전" />
        <Picker.Item label="조리 시작" value="조리 시작" />
        <Picker.Item label="조리 완료" value="조리 완료" />
      </Picker>

      <Picker
        selectedValue={sortOrder}
        style={{ height: 50, width: 150, marginBottom: 20 }}
        onValueChange={(itemValue) => setSortOrder(itemValue)}
      >
        <Picker.Item label="내림차순" value="내림차순" />
        <Picker.Item label="오름차순" value="오름차순" />
      </Picker>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* 모달 추가 */}
      <OrderDetailModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        order={selectedOrder}
      />
    </View>
  );
};

export default OrderManagement;
