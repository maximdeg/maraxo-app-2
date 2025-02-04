import { configureStore } from '@reduxjs/toolkit';

interface DataState {
  data: string | null;
}

const initialState: DataState = {
  data: null,
};

const dataSlice = {
  name: 'data',
  initialState,
  reducers: {
    setData(state, action: { payload: string }) {
      state.data = action.payload;
    },
  },
};

const store = configureStore({
  reducer: {
    data: dataSlice.reducer,
  },
});

export default store;