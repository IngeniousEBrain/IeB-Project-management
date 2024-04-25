import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  customFilters: localStorage.getItem("customFilters")
    ? JSON.parse(localStorage.getItem("customFilters"))
    : null,
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setCustomFilters: (state, action) => {
      console.log(JSON.stringify(action.payload));
      localStorage.setItem("customFilters", JSON.stringify(action.payload));
      state.customFilters = action.payload;
    },
    clearFilters: (state, action) => {
      state.customFilters = null;
      localStorage.removeItem("customFilters");
    },
  },
});

export const { setCustomFilters, clearFilters } = filterSlice.actions;

export default filterSlice.reducer;
