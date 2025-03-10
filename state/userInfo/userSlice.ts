import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface userInfoState {
    first_name: "";
    last_name: "";
    phone_number: "";
    visit_type: "";
    appointment_date: "";
    consult_type: "";
    appointment_time: "";
}

// const initialState: userInfoState = {
//     value: 0,
// };

// const counterSlice = createSlice({
//     name: "'counter",
//     initialState,
//     reducers: {
//         increment: (state) => {
//             state.value += 1;
//         },
//         decrement: (state) => {
//             state.value -= 1;
//         },
//         incrementByAmount: (state, action: PayloadAction<number>) => {
//             state.value += action.payload;
//         },
//         restart: (state) => {
//             state.value = 0;
//         },
//         invert: (state) => {
//             state.value = state.value * -1;
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(incrementAsync.pending, () => {
//                 console.log("incrementAsync.pending");
//             })
//             .addCase(incrementAsync.fulfilled, (state, action: PayloadAction<number>) => {
//                 state.value += action.payload;
//             });
//     },
// });

// export const incrementAsync = createAsyncThunk("counter/incrementAsync", async (amount: number) => {
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     return amount;
// });

// export const { invert, restart, increment, decrement, incrementByAmount } = counterSlice.actions;

// export default counterSlice.reducer;
