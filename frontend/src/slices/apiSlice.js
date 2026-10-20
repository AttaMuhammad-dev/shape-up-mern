import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const query=fetchBaseQuery({baseUrl:'',credentials:'same-origin'});
const baseQuery=async(args,api,extra)=>{const result=await query(args,api,extra);if(result.error?.status===401&&api.getState().auth.userInfo)api.dispatch({type:'auth/logout'});return result;};

export const apiSlice = createApi({
  baseQuery,
  // We include 'DailyLog' here to ensure caching works for all features
  tagTypes: ["User", "Workout", "DailyLog"], 
  endpoints: (builder) => ({}),
});