// redux 로그인 상태 관리 파일입니다.
import { createSlice, configureStore } from '@reduxjs/toolkit';

// 초기 상태 정의
const initialState = {
  isLoggedIn: false,
  userEmail: '',
  userName: '',
  serverPath: 'http://localhost:8080/',
};

// 슬라이스 생성
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoggedIn(state, action) {
      state.isLoggedIn = action.payload;
    },
    setUserEmail(state, action) {
      state.userEmail = action.payload;
    },
    setUserName(state, action) {
      state.userName = action.payload;
    },
  },
});

// 액션 및 리듀서 추출
export const { setLoggedIn, setUserEmail, setUserName } = authSlice.actions;
const authReducer = authSlice.reducer;

// 스토어 생성
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
