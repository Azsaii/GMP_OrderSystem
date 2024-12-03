// CheckoutOrder/styles/CheckoutStyles.js

import { StyleSheet } from 'react-native';

const CheckoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#f0f0f0',
    margin: 10,
    elevation: 3,
  },
  itemPrice: {
    fontSize: 16,
    alignSelf: 'center',
  },
  descriptionText: {
    color: 'black',
  },
  titleStyle: {
    color: 'black',
  },
  subtotal: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
  },
  availableCouponText: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
  },
  selectedCoupon: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
  },
  clearButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 10,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInput: {
    width: '22%',
  },
  usedPoints: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
  },
  paymentMethodItem: {
    flex: 1,
    margin: 5,
    padding: 30,
    backgroundColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  selectedPaymentMethodItem: {
    backgroundColor: '#b0b0b0',
  },
  paymentMethodText: {
    fontSize: 16,
  },
  registerText: {
    color: 'red',
    marginTop: 5,
  },
  registeredText: {
    color: 'green',
    marginTop: 5,
  },
  totalCard: {
    margin: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  discountText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'right',
  },
  earnedPointsText: {
    fontSize: 16,
    color: 'blue',
    textAlign: 'right',
  },
  orderButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 10,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  CouponButton: {
    backgroundColor: '#007BFF',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    margin: 10,
  },
  CouponButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  couponItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  couponTouchable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disabledCoupon: {
    backgroundColor: '#e0e0e0',
  },
  disabledText: {
    color: 'red',
  },
  enabledText: {
    color: 'green',
  },
  sectionContainer: {
    margin: 10,
    backgroundColor: '#aaa',
    borderRadius: 10,
  },
  closeIconButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  roundedCard: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  usedText: {
    color: '#808080',
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: '#d3d3d3',
    height: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5, 
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 20,
  },

});

export default CheckoutStyles;
