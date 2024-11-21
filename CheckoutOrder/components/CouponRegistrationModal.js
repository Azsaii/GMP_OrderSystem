// CheckoutOrder/components/CouponRegistrationModal.js

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Dialog, Button, Divider } from 'react-native-paper';
import { UserContext } from '../contexts/UserContext';
import { firestore, auth } from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import moment from 'moment';

const CouponRegistrationModal = ({ visible, onDismiss }) => {
  const [activeTab, setActiveTab] = useState('public'); // 'public' or 'promo'
  const [publicCoupons, setPublicCoupons] = useState([]);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [loadingPromo, setLoadingPromo] = useState(false);

  const { unusedCoupons, usedCoupons } = useContext(UserContext); // 수정된 부분: unusedCoupons와 usedCoupons를 가져옵니다.

  useEffect(() => {
    if (visible) {
      fetchPublicCoupons();
    }
  }, [visible]);

  const fetchPublicCoupons = async () => {
    setLoadingPublic(true);
    try {
      const couponsCollection = collection(firestore, 'coupon');

      // isPublic이 true인 쿠폰만 조회
      const q = query(couponsCollection, where('isPublic', '==', true));
      const querySnapshot = await getDocs(q);

      const allPublicCoupons = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        console.log(
          `Document ID: ${docSnap.id}, isPublic: ${data.isPublic}, available: ${data.available}, startDate: ${data.startDate}, endDate: ${data.endDate}`
        );
        allPublicCoupons.push({ id: docSnap.id, ...data });
      });

      console.log('전체 공개 쿠폰:', allPublicCoupons);

      // 현재 날짜를 기준으로 필터링 (YYMMDD 형식)
      const now = moment().format('YYMMDD');
      console.log('현재 날짜:', now);
      const validCoupons = allPublicCoupons.filter((coupon) => {
        const isAvailable = coupon.available === true;
        const isWithinDate =
          coupon.startDate <= now && coupon.endDate >= now;
        console.log(
          `쿠폰 ID: ${coupon.id}, isAvailable: ${isAvailable}, isWithinDate: ${isWithinDate}`
        );
        return isAvailable && isWithinDate;
      });

      console.log('유효한 공개 쿠폰:', validCoupons);

      setPublicCoupons(validCoupons);
    } catch (error) {
      console.error('공개 쿠폰 조회 오류:', error);
      Alert.alert('오류', `쿠폰을 조회하는 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoadingPublic(false);
    }
  };

  const handleRegisterPublicCoupon = async (coupon) => {
    try {
      // 이미 등록된 쿠폰인지 확인
      const isAlreadyRegistered = unusedCoupons.includes(coupon.id) || usedCoupons.includes(coupon.id);
      if (isAlreadyRegistered) {
        Alert.alert('알림', '이미 등록된 쿠폰입니다.');
        return;
      }

      // 사용자 계정에 쿠폰 ID 추가
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('오류', '사용자가 인증되지 않았습니다.');
        return;
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        unusedCoupons: arrayUnion(coupon.id),
      });

      console.log(`쿠폰 등록 성공: ${coupon.id}`);
      Alert.alert('성공', '쿠폰이 성공적으로 등록되었습니다.');
      onDismiss();
    } catch (error) {
      console.error('쿠폰 등록 오류:', error);
      Alert.alert('오류', `쿠폰을 등록하는 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleRegisterPromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('알림', '프로모션 코드를 입력해주세요.');
      return;
    }

    setLoadingPromo(true);
    try {
      const promoCodeTrimmed = promoCode.trim();
      console.log(`입력된 프로모션 코드: ${promoCodeTrimmed}`);

      const promoDocRef = doc(firestore, 'coupon', promoCodeTrimmed);
      const promoDocSnapshot = await getDoc(promoDocRef);

      if (!promoDocSnapshot.exists()) {
        console.log('프로모션 코드가 존재하지 않습니다.');
        Alert.alert('알림', '유효한 프로모션 코드가 아닙니다.');
        return;
      }

      const coupon = { id: promoDocSnapshot.id, ...promoDocSnapshot.data() };
      console.log('조회된 프로모션 쿠폰:', coupon);

      // isPublic이 false인지 확인
      if (coupon.isPublic) {
        Alert.alert(
          '알림',
          '이 프로모션 코드는 공개 쿠폰입니다. 공개 쿠폰 목록에서 등록해주세요.'
        );
        return;
      }

      // 유효성 검사 (available 및 날짜)
      const now = moment().format('YYMMDD');
      const isAvailable = coupon.available === true;
      const isWithinDate = coupon.startDate <= now && coupon.endDate >= now;

      console.log(
        `쿠폰 ID: ${coupon.id}, isAvailable: ${isAvailable}, isWithinDate: ${isWithinDate}`
      );

      if (!isAvailable || !isWithinDate) {
        Alert.alert('알림', '해당 쿠폰은 현재 사용할 수 없습니다.');
        return;
      }

      // 이미 등록된 쿠폰인지 확인
      const isAlreadyRegistered = unusedCoupons.includes(coupon.id) || usedCoupons.includes(coupon.id);
      if (isAlreadyRegistered) {
        Alert.alert('알림', '이미 등록된 쿠폰입니다.');
        return;
      }

      // 사용자 계정에 쿠폰 ID 추가
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('오류', '사용자가 인증되지 않았습니다.');
        return;
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        unusedCoupons: arrayUnion(coupon.id),
      });

      console.log(`프로모션 쿠폰 등록 성공: ${coupon.id}`);
      Alert.alert('성공', '프로모션 코드가 성공적으로 등록되었습니다.');
      setPromoCode('');
      onDismiss();
    } catch (error) {
      console.error('프로모션 코드 등록 오류:', error);
      Alert.alert('오류', `프로모션 코드를 등록하는 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoadingPromo(false);
    }
  };

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
      <Dialog.Title>쿠폰 등록</Dialog.Title>
      <Dialog.Content>
        {/* 탭 네비게이션 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'public' && styles.activeTab]}
            onPress={() => setActiveTab('public')}
          >
            <Text style={styles.tabText}>쿠폰 조회</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'promo' && styles.activeTab]}
            onPress={() => setActiveTab('promo')}
          >
            <Text style={styles.tabText}>프로모션 코드 입력</Text>
          </TouchableOpacity>
        </View>
        <Divider style={{ marginVertical: 10 }} />

        {/* 탭 내용 */}
        {activeTab === 'public' ? (
          loadingPublic ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : publicCoupons.length === 0 ? (
            <Text style={styles.noCouponsText}>사용 가능한 쿠폰이 없습니다.</Text>
          ) : (
            <View style={{ maxHeight: 400 }}>
            <FlatList
              data={publicCoupons}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.couponItemContainer}>
                  <View style={styles.couponInfo}>
                    <Text style={styles.couponName}>{item.name}</Text>
                    <Text style={styles.couponDescription}>{item.description}</Text>
                    <Text style={styles.couponDetails}>
                      최소 주문 금액: {formatNumber(item.minOrderValue)}원
                    </Text>
                    <Text style={styles.couponDetails}>
                      할인:{' '}
                      {item.discountType === '원'
                        ? `${formatNumber(item.discountValue)}원`
                        : `${item.discountValue}%`}
                    </Text>
                    {item.discountType === '%' && (
                      <Text style={styles.couponDetails}>
                        최대 할인 금액: {formatNumber(item.maxDiscountValue)}원
                      </Text>
                    )}
                    <Text style={styles.couponDetails}>
                      유효 기간: {item.startDate} ~ {item.endDate}
                    </Text>
                    <Text style={styles.couponDetails}>
                      결합 가능 여부: {item.canBeCombined ? '결합 가능' : '결합 불가'}
                    </Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={() => handleRegisterPublicCoupon(item)}
                    disabled={!item.available}
                    style={styles.registerButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                  >
                    등록
                  </Button>
                </View>
              )}
              nestedScrollEnabled
            />
            </View>
          )
        ) : (
          // 프로모션 코드 입력 페이지
          <View>
            <TextInput
              style={styles.promoInput}
              placeholder="프로모션 코드 입력"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <Button
              mode="contained"
              onPress={handleRegisterPromoCode}
              loading={loadingPromo}
              disabled={loadingPromo}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              등록
            </Button>
          </View>
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>닫기</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

// 숫자를 천 단위로 콤마로 구분해주는 함수
const formatNumber = (num) =>
  num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'blue',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noCouponsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  couponItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  couponInfo: {
    flex: 1,
    marginRight: 10,
  },
  couponName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  couponDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  couponDetails: {
    fontSize: 12,
    color: '#6c757d',
  },
  registerButton: {
    backgroundColor: '#007BFF',
    margin: 10,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    marginVertical: 10,
  },
  buttonContent: {
    paddingVertical: 5,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  promoInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default CouponRegistrationModal;
