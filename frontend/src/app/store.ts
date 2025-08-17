// frontend/src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

// The Redux store is created with `configureStore` from Redux Toolkit.
export const store = configureStore({
    // `reducer` combines all slice reducers into a single root reducer.
    reducer: {
        // We'll add our authentication slice reducer here.
        auth: authReducer,
    },
    // Middleware and other configurations can be added here.
});

// These types are for TypeScript, to ensure we have correct type inference
// for our store's state and the `dispatch` function.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
