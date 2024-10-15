// CheckoutOrder/contexts/UserContext.js

import React, { createContext, useState, useEffect } from 'react';
import { auth, firestore } from '../../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [points, setPoints] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Unknown'); // 사용자 이름 상태 추가

  // 사용자 데이터 가져오기
  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setPoints(data.points || 0);
        setCoupons(data.coupons || []);
        setPaymentMethods(data.paymentMethods || []);
        setUserName(data.name || 'Unknown'); // 사용자 이름 설정
      } else {
        // 사용자 문서가 없을 경우 초기 데이터 생성
        const initialData = {
          name: '사용자이름', // 실제 사용자 이름으로 대체
          points: 5000,
          coupons: [
            { id: 'c1', name: '10,000원 이상 3,000원 할인', discount: 3000, minAmount: 10000, used: false },
            { id: 'c2', name: '20,000원 이상 50% 할인', discountRate: 0.5, minAmount: 20000, used: false },
          ],
          paymentMethods: [
            { id: '1', type: 'Card', name: '카드', isRegistered: false },
            { id: '2', type: 'Account', name: '계좌', isRegistered: false },
            { id: '3', type: 'KakaoPay', name: '카카오페이', isRegistered: true },
            { id: '4', type: 'TossPay', name: '토스페이', isRegistered: true },
          ],
        };
        await setDoc(userDocRef, initialData);
        setPoints(initialData.points);
        setCoupons(initialData.coupons);
        setPaymentMethods(initialData.paymentMethods);
        setUserName(initialData.name); // 사용자 이름 설정
      }
    } catch (error) {
      console.error('사용자 데이터 가져오기 오류:', error);
    }
  };

  // 인증 상태 변화 감지
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserData(user.uid);
      } else {
        setUserId(null);
        setPoints(0);
        setCoupons([]);
        setPaymentMethods([]);
        setUserName('Unknown');
      }
    });
    return () => unsubscribe();
  }, []);

  // 포인트 업데이트 함수
  const updatePoints = async (newPoints) => {
    setPoints(newPoints);
    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, { points: newPoints });
    }
  };

  // 쿠폰 사용 처리 함수
  const markCouponAsUsed = async (couponId) => {
    const updatedCoupons = coupons.map((coupon) =>
      coupon.id === couponId ? { ...coupon, used: true } : coupon
    );
    setCoupons(updatedCoupons);
    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, { coupons: updatedCoupons });
    }
  };

  // 포인트 적립 함수
  const addPoints = async (earnedPoints) => {
    const newPoints = points + earnedPoints;
    setPoints(newPoints);
    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, { points: newPoints });
    }
  };

  // 결제 수단 추가 함수
  const addPaymentMethod = async (method) => {
    const updatedMethods = paymentMethods.map((m) =>
      m.id === method.id ? method : m
    );

    // 새로운 결제 수단이면 추가
    if (!updatedMethods.some((m) => m.id === method.id)) {
      updatedMethods.push(method);
    }

    setPaymentMethods(updatedMethods);

    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, { paymentMethods: updatedMethods });
    }
  };

  return (
    <UserContext.Provider
      value={{
        points,
        coupons,
        paymentMethods,
        userName, // 사용자 이름 제공
        updatePoints,
        markCouponAsUsed,
        addPoints,
        addPaymentMethod,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
