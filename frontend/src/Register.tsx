// frontend/src/Register.tsx
import React, { useState } from "react";

// Define the props for our Register component.
interface RegisterProps {
    onRegisterSuccess: (token: string) => void;
    onShowLogin: () => void;
}

const API_URL = "http://localhost:8000";

const Register: React.FC<RegisterProps> = ({
    onRegisterSuccess,
    onShowLogin,
}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const requestBody = {
            email: email,
            password: password,
        };

        try {
            const response = await fetch(`${API_URL}/users/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Registration failed.");
            }

            const data = await response.json();
            // Pass the access token up to the parent component
            onRegisterSuccess(data.access_token);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="card">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Sign Up</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
            <br />
            <p>
                Already have an account?{" "}
                <a href="#" onClick={onShowLogin}>
                    Log in here.
                </a>
            </p>
        </div>
    );
};

export default Register;
