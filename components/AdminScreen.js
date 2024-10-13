import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useOrder } from './../App';

export default function AdminScreen({ navigation }) {
  const { orderStatus, setOrderStatus, estimatedTime, setEstimatedTime, waitingCustomers, setWaitingCustomers } = useOrder();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>관리자 화면</Text>


      <View style={styles.statusControl}>
        <Text style={styles.label}>현재 주문 상태: {orderStatus}</Text>
        <Button title="주문이 접수되었습니다." onPress={() => setOrderStatus('주문이 접수되었습니다.')}/>
        <Button title="음료 제작 중..." onPress={() => setOrderStatus('음료 제작 중...')}/>
        <Button title="음료 준비 완료!" onPress={() => setOrderStatus('음료 준비 완료!')}/>
      </View>


      <View style={styles.infoControl}>
        <Text style={styles.label}>예상 대기 시간: {estimatedTime}분</Text>
        <Button title="대기 시간 5분으로 설정" onPress={() => setEstimatedTime(5)}/>
        <Button title="대기 시간 15분으로 설정" onPress={() => setEstimatedTime(15)}/>
        <Text style={styles.label}>현재 대기 중인 손님 수: {waitingCustomers}명</Text>
        <Button title="대기 손님 3명으로 설정" onPress={() => setWaitingCustomers(3)}/>
        <Button title="대기 손님 7명으로 설정" onPress={() => setWaitingCustomers(7)}/>
      </View>


      <Button title="사용자 화면으로 돌아가기" onPress={() => navigation.navigate('User')}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusControl: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  infoControl: {
    marginBottom: 20,
  },
});
