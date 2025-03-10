import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userInfo/userSlice";

export const store = configureStore({
    reducer: {
        counter: userReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

// https://redux-toolkit.js.org/
