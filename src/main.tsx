import ReactDOM from "react-dom/client";
import Axios from "axios";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import { LanguageProvider } from "./hooks/use-language";
import { attachAcceptLanguage } from "./utils/acceptLanguage";
import Loader from "./components/Loader/Loader";

// Stamp `Accept-Language` on the default axios singleton used by direct
// `import Axios from "axios"` callers (login, OTP, some components/pages).
// Dedicated instances in `src/utils/*` attach this in their own modules.
attachAcceptLanguage(Axios);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
    <Provider store={store}>
      <PersistGate loading={<Loader />} persistor={persistor}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </PersistGate>
    </Provider>
);
