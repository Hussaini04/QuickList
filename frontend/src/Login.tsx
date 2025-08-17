// frontend/src/Login.tsx
import React, { useState } from "react";

// Define the props for our Login component.
// `onLoginSuccess` is a callback function that the parent component (App)
// provides to handle a successful authentication and receive the JWT token.
// `onShowRegister` is a callback to switch the view to the registration form.
interface LoginProps {
    onLoginSuccess: (token: string) => void;
    onShowRegister: () => void;
}

// The base URL for our FastAPI backend.
const API_URL = "http://localhost:8000";

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onShowRegister }) => {
    // `useState` hooks to manage the form's state (email, password)
    // and any error messages from the API.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Handles the form submission event.
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevents the default form submission behavior (page reload).
        setError(""); // Clear any previous errors.

        // `URLSearchParams` is used to format the data for a
        // `application/x-www-form-urlencoded` request, which our `/token` endpoint expects.
        const formData = new URLSearchParams();
        formData.append("username", email); // The backend expects 'username' for the email.
        formData.append("password", password);

        try {
            // Make the POST request to the backend's /token endpoint.
            const response = await fetch(`${API_URL}/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
            });

            // Check if the response was successful (status code 200-299).
            if (!response.ok) {
                // If the response is not okay, parse the error message from the backend.
                const errorData = await response.json();
                // The `detail` field is where FastAPI puts its error messages.
                throw new Error(
                    errorData.detail ||
                        "Login failed. Please check your credentials."
                );
            }

            // If successful, parse the JSON response.
            const data = await response.json();
            // Call the `onLoginSuccess` prop with the received access token.
            // This allows the parent component (App) to update its state and show the Todos page.
            onLoginSuccess(data.access_token);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            // Catch any network or API errors and set the error state.
            setError(err.message);
        }
    };

    return (
        // The `card` class is for a simple, styled container from our global CSS.
        <div className="card">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Update state on every keystroke.
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Log In</button>
                {/* Conditionally render the error message if the `error` state is not empty. */}
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
            <br />
            <p>
                Don't have an account?{" "}
                {/* The link to switch to the registration form. */}
                <a href="#" onClick={onShowRegister}>
                    Sign up here.
                </a>
            </p>
        </div>
    );
};

export default Login;
