import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import Cookie from 'js-cookie';

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  // access_token: 
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      console.log(action.payload);
      console.log(action.payload.msg)
      state.userInfo = action.payload.user;
      localStorage.setItem("userInfo", JSON.stringify(action.payload.user));
      Cookie.set('access_token', action.payload.token.access, { expires: 7, secure: true });
      Cookie.set('refresh_token', action.payload.token.refresh, { expires: 7, secure: true });

      const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days
      localStorage.setItem("expirationTime", expirationTime);
    },
    setAccessToken: (state, action) => {
      console.log(action.payload)
      Cookie.set('access_token', action.payload.access, { expires: 7, secure: true });
    },
    logout: (state, action) => {
      state.userInfo = null;
      localStorage.clear();
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
    },
  },
});

export const { setCredentials, setAccessToken, logout } = authSlice.actions;

export default authSlice.reducer;