import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { apiSlice } from './slices/apiSlice'; // This handles all API calls including reviews

const sessionListener=createListenerMiddleware();
sessionListener.startListening({predicate:(action,current,previous)=>current.auth.userInfo?._id!==previous.auth.userInfo?._id,effect:(_,api)=>api.dispatch(apiSlice.util.resetApiState())});
const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer, // This line enables the API (Reviews, Users, etc)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(sessionListener.middleware).concat(apiSlice.middleware),
  devTools: true,
});

export default store;