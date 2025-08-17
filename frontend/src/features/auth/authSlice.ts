// frontend/src/features/auth/authSlice.ts
import { createSlice,type PayloadAction } from "@reduxjs/toolkit";

// Define the shape of our authentication state.
interface AuthState {
    token: string | null;
}

// Define the initial state of the slice.
const initialState: AuthState = {
    token: localStorage.getItem("token") || null,
};

// `createSlice` automatically generates action creators and action types.
export const authSlice = createSlice({
    // The name of the slice, used to generate action types.
    name: "auth",
    initialState,
    // `reducers` contain the functions to handle state changes.
    reducers: {
        // `setToken` will be an action that sets the token in the state and local storage.
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            localStorage.setItem("token", action.payload);
        },
        // `clearToken` will be an action to log the user out.
        clearToken: (state) => {
            state.token = null;
            localStorage.removeItem("token");
        },
    },
});

// `authSlice.actions` contains the generated action creators.
export const { setToken, clearToken } = authSlice.actions;

// `authSlice.reducer` is the reducer function, which we'll add to our store.
export default authSlice.reducer;
