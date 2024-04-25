import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import authSliceReducer from "./slices/authSlice";
import filterSliceReducer from "./slices/filterSlice";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSliceReducer,
    filters: filterSliceReducer,
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(apiSlice.middleware),
    // getDefaultMiddleware().concat(authMiddleware),
  devTools: true,
});

export default store;