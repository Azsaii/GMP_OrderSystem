// contexts/UserContext.js

import React, { createContext, useState } from 'react';

const initialUserData = {
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

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [points, setPoints] = useState(initialUserData.points);
  const [coupons, setCoupons] = useState(initialUserData.coupons);
  const [paymentMethods, setPaymentMethods] = useState(initialUserData.paymentMethods);

  const updatePoints = (newPoints) => setPoints(newPoints);
  const markCouponAsUsed = (couponId) =>
    setCoupons((prev) => prev.map((c) => (c.id === couponId ? { ...c, used: true } : c)));
  const addPoints = (earnedPoints) => setPoints((prev) => prev + earnedPoints);

  const addPaymentMethod = (method) =>
    setPaymentMethods((prev) =>
      prev.map((m) => (m.id === method.id ? { ...m, isRegistered: true } : m))
    );

  return (
    <UserContext.Provider
      value={{ points, coupons, paymentMethods, updatePoints, markCouponAsUsed, addPoints, addPaymentMethod }}
    >
      {children}
    </UserContext.Provider>
  );
};
