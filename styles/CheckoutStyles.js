// styles/CheckoutStyles.js

import { StyleSheet } from 'react-native';

const CheckoutStyles = StyleSheet.create({
  // 메인 레이아웃의 컨테이너로 화면을 가득 채우고 배경색을 흰색으로 설정
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // 카드 스타일, 배경색을 밝은 회색으로 설정하고 여백과 그림자 추가
  card: {
    backgroundColor: '#f0f0f0',
    margin: 10,
    elevation: 3,
  },

  // 아이템 가격 텍스트 스타일, 글씨 크기를 16으로 설정하고 중앙에 정렬
  itemPrice: {
    fontSize: 16,
    alignSelf: 'center',
  },

  // 설명 텍스트 스타일, 글자 색상을 검은색으로 설정
  descriptionText: {
    color: 'black',
  },

  // 제목 텍스트 스타일, 글자 색상을 검은색으로 설정
  titleStyle: {
    color: 'black',
  },

  // 소계 텍스트 스타일, 굵은 글씨와 오른쪽 정렬, 여백을 추가
  subtotal: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
  },

  // 사용 가능한 쿠폰 텍스트 스타일, 초록색 텍스트와 위쪽 여백 추가
  availableCouponText: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
  },

  // 선택된 쿠폰 텍스트 스타일, 초록색 텍스트와 위쪽 여백 추가
  selectedCoupon: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
  },

  // 취소 버튼 스타일을 clearButton으로 변경
  clearButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 10,
  },

  // 취소 버튼의 텍스트 스타일을 clearButtonText로 변경
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 라벨 스타일, 굵은 검은색 텍스트와 아래쪽 여백 추가
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },

  // 입력 필드 스타일, 아래쪽 여백 추가
  input: {
    marginBottom: 10,
  },

  // 행 스타일, 아이템을 가로로 배치하고 공간을 균등하게 배분
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // 카드 입력 필드 스타일, 필드의 너비를 22%로 설정
  cardInput: {
    width: '22%',
  },

  // 사용한 포인트 텍스트 스타일, 초록색 텍스트와 위쪽 여백 추가
  usedPoints: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
  },

  // 결제 방법 아이템 스타일, 중앙 정렬된 배경과 둥근 모서리, 여백 추가
  paymentMethodItem: {
    flex: 1,
    margin: 5,
    padding: 20,
    backgroundColor: '#d0d0d0',
    alignItems: 'center',
    borderRadius: 10,
  },

  // 선택된 결제 방법 아이템 스타일, 더 어두운 회색 배경으로 설정
  selectedPaymentMethodItem: {
    backgroundColor: '#b0b0b0',
  },

  // 결제 방법 텍스트 스타일, 글씨 크기를 16으로 설정
  paymentMethodText: {
    fontSize: 16,
  },

  // 등록 필요 텍스트 스타일, 빨간색 텍스트와 위쪽 여백 추가
  registerText: {
    color: 'red',
    marginTop: 5,
  },

  // 등록 완료 텍스트 스타일, 초록색 텍스트와 위쪽 여백 추가
  registeredText: {
    color: 'green',
    marginTop: 5,
  },

  // 총 결제 카드 스타일, 여백을 추가
  totalCard: {
    margin: 10,
  },

  // 총 결제 금액 텍스트 스타일, 굵고 큰 글씨로 오른쪽 정렬
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },

  // 할인 금액 텍스트 스타일, 빨간색 텍스트로 오른쪽 정렬
  discountText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'right',
  },

  // 적립 포인트 텍스트 스타일, 파란색 텍스트로 오른쪽 정렬
  earnedPointsText: {
    fontSize: 16,
    color: 'blue',
    textAlign: 'right',
  },

  // 결제 버튼 스타일을 orderButton으로 변경
  orderButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 10,
  },

  // 결제 버튼 텍스트 스타일을 orderButtonText로 변경
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 쿠폰 아이템 스타일, 테두리와 여백을 추가하고 둥근 모서리 적용
  couponItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  // 쿠폰 아이템 터치 영역 스타일, 아이템을 가로로 배치하고 양 끝을 띄움
  couponTouchable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // 비활성화된 쿠폰 스타일, 배경색을 회색으로 설정
  disabledCoupon: {
    backgroundColor: '#e0e0e0',
  },

  // 비활성화된 텍스트 스타일, 글자 색을 빨간색으로 설정
  disabledText: {
    color: 'red',
  },

  // 활성화된 텍스트 스타일, 글자 색을 초록색으로 설정
  enabledText: {
    color: 'green',
  },

  // 섹션 컨테이너 스타일, 여백과 둥근 모서리 및 배경색 추가
  sectionContainer: {
    margin: 10,
    backgroundColor: '#aaa',
    borderRadius: 10,
  },

  // 섹션 제목 스타일, 굵은 큰 글씨와 아래쪽 테두리, 여백 추가
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },

  // 닫기 버튼 스타일, 오른쪽 위에 배치
  closeIconButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },

  // 둥근 카드 스타일, 둥근 모서리와 테두리 추가
  roundedCard: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  // 사용된 쿠폰 텍스트 스타일, 회색과 굵은 글씨로 설정
  usedText: {
    color: '#808080',
    fontWeight: 'bold',
  },

  // 주문 내역 - 메뉴 구분선 스타일,
  divider: {
    backgroundColor: '#d3d3d3',
    height: 2,
  },
});

export default CheckoutStyles;
