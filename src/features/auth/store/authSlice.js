import { createSlice } from '@reduxjs/toolkit';

const tokenKey = 'hireiq_token';
const userKey = 'hireiq_user';

const initialState = {
  token: localStorage.getItem(tokenKey) || null,
  user: (() => {
    try { return JSON.parse(localStorage.getItem(userKey) || 'null'); }
    catch { return null; }
  })(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload }) {
      state.token = payload.token;
      state.user = { name: payload.name, email: payload.email, role: payload.role };
      localStorage.setItem(tokenKey, payload.token);
      localStorage.setItem(userKey, JSON.stringify(state.user));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const selectToken = (s) => s.auth.token;
export const selectUser = (s) => s.auth.user;
export const selectIsAuthenticated = (s) => Boolean(s.auth.token);
export const selectRole = (s) => s.auth.user?.role;

export default authSlice.reducer;
