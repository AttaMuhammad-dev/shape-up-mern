import { createSlice } from '@reduxjs/toolkit';

let savedUser=null;
try{const value=JSON.parse(localStorage.getItem('userInfo')||'null');if(value&&typeof value._id==='string'&&typeof value.name==='string')savedUser=value;}catch{localStorage.removeItem('userInfo');}
const initialState={userInfo:savedUser};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    // 👇 YEH HAI MAIN FIX
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo'); // Permanent Storage Clear
      for(const key of ['mealPlan','waterIntake','lastDailyGoalNotification'])localStorage.removeItem(key);
      sessionStorage.clear(); // Temporary Session Clear (Zaroori hai!)
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;