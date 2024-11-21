// CheckoutOrder/contexts/UserContext.js

import React, { createContext, useState, useEffect } from 'react';
import { auth, firestore } from '../../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [points, setPoints] = useState(0);

  // 기존의 coupons 상태를 unusedCoupons와 usedCoupons로 분리하고, 각각 쿠폰 ID의 배열로 저장합니다.
  const [unusedCoupons, setUnusedCoupons] = useState([]);
  const [usedCoupons, setUsedCoupons] = useState([]);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Unknown');

  // 실시간으로 사용자 데이터 감지
  const fetchUserData = (uid) => {
    const userDocRef = doc(firestore, 'users', uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPoints(data.points || 0);

          // unusedCoupons와 usedCoupons를 Firestore에서 가져와 상태로 설정합니다.
          setUnusedCoupons(data.unusedCoupons || []);
          setUsedCoupons(data.usedCoupons || []);

          setPaymentMethods(data.paymentMethods || []);
          setUserName(data.name || 'Unknown');
        } else {
          console.error('사용자 문서가 존재하지 않습니다.');
        }
      },
      (error) => {
        console.error('실시간 사용자 데이터 감지 오류:', error);
      }
    );

    return unsubscribe;
  };

  useEffect(() => {
    let unsubscribe;
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        unsubscribe = fetchUserData(user.uid);
      } else {
        setUserId(null);
        setPoints(0);
        setUnusedCoupons([]);
        setUsedCoupons([]);
        setPaymentMethods([]);
        setUserName('Unknown');
        if (unsubscribe) unsubscribe();
      }
    });
    return () => {
      authUnsubscribe();
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 포인트 업데이트 함수
  const updatePoints = async (newPoints) => {
    setPoints(newPoints);
    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      try {
        await updateDoc(userDocRef, { points: newPoints });
      } catch (error) {
        console.error('포인트 업데이트 오류:', error);
      }
    }
  };

  // 쿠폰 사용 처리 함수
  const markCouponsAsUsed = async (couponIds) => {
    // unusedCoupons에서 사용된 쿠폰 ID를 제거하고 usedCoupons에 추가합니다.
    const updatedUnusedCoupons = unusedCoupons.filter((id) => !couponIds.includes(id));
    const updatedUsedCoupons = [...usedCoupons, ...couponIds];

    setUnusedCoupons(updatedUnusedCoupons);
    setUsedCoupons(updatedUsedCoupons);

    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      try {
        await updateDoc(userDocRef, {
          unusedCoupons: updatedUnusedCoupons,
          usedCoupons: updatedUsedCoupons,
        });
      } catch (error) {
        console.error('쿠폰 사용 처리 오류:', error);
      }
    }
  };

  // 포인트 적립 함수
  const addPoints = async (earnedPoints) => {
    const newPoints = points + earnedPoints;
    setPoints(newPoints);
    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      try {
        await updateDoc(userDocRef, { points: newPoints });
      } catch (error) {
        console.error('포인트 적립 오류:', error);
      }
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
      try {
        await updateDoc(userDocRef, { paymentMethods: updatedMethods });
      } catch (error) {
        console.error('결제 수단 추가 오류:', error);
      }
    }
  };

  // 결제 수단을 삭제하는 함수 (isRegistered를 false로 설정)
  const unregisterPaymentMethod = async (methodId) => {
    const typeToKoreanName = {
      Card: '카드',
      Account: '계좌',
    };

    const updatedMethods = paymentMethods.map((method) =>
      method.id === methodId
        ? { 
            ...method, 
            isRegistered: false,
            name: typeToKoreanName[method.type] || method.type
          } 
        : method
    );
    setPaymentMethods(updatedMethods);

    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      try {
        await updateDoc(userDocRef, { paymentMethods: updatedMethods });
      } catch (error) {
        console.error('결제 수단 삭제 오류:', error);
      }
    }
  };
  

  return (
    <UserContext.Provider
      value={{
        points,
        unusedCoupons,
        usedCoupons,
        paymentMethods,
        userName,
        updatePoints,
        markCouponsAsUsed,
        addPoints,
        addPaymentMethod,
        unregisterPaymentMethod,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
