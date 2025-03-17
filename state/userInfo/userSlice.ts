import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface userInfoState {
    first_name: string;
    last_name: string;
    phone_number: string;
    visit_type: string;
    appointment_date: string;
    consult_type: string;
    appointment_time: string;
}

const initialState: userInfoState = {
    first_name: "",
    last_name: "",
    phone_number: "",
    visit_type: "",
    appointment_date: "",
    consult_type: "",
    appointment_time: "",
};

const counterSlice = createSlice({
    name: "'counter",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(incrementAsync.pending, () => {
            console.log("incrementAsync.pending");
        });
        // .addCase(incrementAsync.fulfilled, (state, action: PayloadAction<number>) => {
        //     state.value += action.payload;
        // });
    },
});

export const incrementAsync = createAsyncThunk("counter/incrementAsync", async (amount: number) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return amount;
});

// export const { invert, restart, increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
