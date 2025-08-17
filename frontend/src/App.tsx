// frontend/src/App.tsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
// Add `type` to the import for RootState and AppDispatch
import type { RootState, AppDispatch } from "./app/store";
import { setToken, clearToken } from "./features/auth/authSlice";

import Login from "./Login";
import Register from "./Register";
import Todos from "./Todos";
import "./global.css";

function App() {
    // Use `useSelector` to get the token from the Redux store's state.
    const token = useSelector((state: RootState) => state.auth.token);
    // Use `useDispatch` to get the dispatch function to send actions to the store.
    const dispatch = useDispatch<AppDispatch>();

    // State to track which form to display.
    const [showForm, setShowForm] = useState<"login" | "register">("login");

    const handleAuthSuccess = (newToken: string) => {
        dispatch(setToken(newToken));
    };

    const handleLogout = () => {
        dispatch(clearToken());
    };

    return (
        <div className="container">
            {token ? (
                <>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginBottom: "20px",
                        }}
                    >
                        <button onClick={handleLogout}>Log Out</button>
                    </div>
                    <Todos />
                </>
            ) : (
                <>
                    {showForm === "login" ? (
                        <Login
                            onLoginSuccess={handleAuthSuccess}
                            onShowRegister={() => setShowForm("register")}
                        />
                    ) : (
                        <Register
                            onRegisterSuccess={handleAuthSuccess}
                            onShowLogin={() => setShowForm("login")}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default App;
