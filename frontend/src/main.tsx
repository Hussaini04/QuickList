// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./global.css";

import { Provider } from "react-redux";
import { store } from "./app/store.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        {/* We wrap our App component with the Provider to give it access to the Redux store. */}
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);
