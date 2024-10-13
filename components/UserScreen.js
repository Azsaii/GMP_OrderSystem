import React from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView } from 'react-native';
import { useOrder } from './../App';

export default function UserScreen({ navigation }) {
  const { orderStatus, estimatedTime, waitingCustomers } = useOrder();

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.logo}>앱 로고</Text>
        <Text style={styles.time}>{new Date().toLocaleTimeString()}</Text>
      </View>


      <View style={styles.orderDetails}>
        <Text style={styles.orderNumber}>주문 번호: #12345</Text>
        <Image source={{ uri: 'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[126197]_20210415154609863.jpg' }} style={styles.drinkImage} />
        <Text style={styles.drinkName}>카라멜 마끼아또</Text>
        <Text style={styles.menuFeatures}>핫/아이스, 스위트, 비건 옵션</Text>
        <Text style={styles.estimatedTime}>예상 대기 시간: {estimatedTime}분</Text>
        <Text style={styles.customersWaiting}>현재 대기 중인 손님 수: {waitingCustomers}명</Text>
      </View>


      <View style={styles.statusContainer}>
        <Text style={styles.orderStatus}>{orderStatus}</Text>
      </View>


      <Button title="관리자 화면으로 이동" onPress={() => navigation.navigate('Admin')}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 16,
  },
  orderDetails: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  drinkImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  drinkName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  menuFeatures: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  estimatedTime: {
    fontSize: 16,
    marginBottom: 5,
  },
  customersWaiting: {
    fontSize: 16,
    marginBottom: 5,
  },
  statusContainer: {
    marginVertical: 20,
  },
  orderStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
