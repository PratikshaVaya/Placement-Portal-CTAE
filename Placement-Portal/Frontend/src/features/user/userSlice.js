import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const getUserFromLocalStorage = () => {
  const user = localStorage.getItem('user');
  if (user && user !== 'undefined') {
    try {
      return JSON.parse(user);
    } catch (error) {
      return null;
    }
  }
  return null;
};

initialState.user = getUserFromLocalStorage();

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user } = action.payload;
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem('user');
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;

export default userSlice.reducer;
