import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store/index.js";

import { getUser } from "./store/features/auth/authActions";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>
);

if (store.getState().auth?.isAuthenticated) {
  store.dispatch(getUser());
}
