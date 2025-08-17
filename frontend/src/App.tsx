// frontend/src/App.tsx
import React, { useState, useEffect } from "react";
import Login from "./Login";
import Todos from "./Todos"; // Import the new Todos component
import "./global.css";

function App() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const handleLoginSuccess = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem("token", newToken);
    };

    return (
        <div className="container">
            {token ? (
                // If we have a token, render the Todos component
                <Todos token={token} />
            ) : (
                // If no token, render the login component
                <Login onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    );
}

export default App;
