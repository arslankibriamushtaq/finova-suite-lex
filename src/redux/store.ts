import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import rootReducer from "./rootReducer";

// The store used to be wrapped in a second, un-whitelisted persistReducer
// (key "root", localStorage). That defeated the tight sessionStorage whitelist
// in rootReducer.ts: every field in the slice — national IDs, dates of birth,
// CR numbers, tokens — was serialised to localStorage and survived the browser
// closing. `block` is already persisted correctly one level down, so the outer
// wrapper is removed rather than re-whitelisted. persistStore still drives the
// nested persistReducer, so PersistGate is unaffected.
//
// Users' machines still hold the blob written by earlier builds, so drop it on
// startup. Safe to delete this once the fix has been live long enough that
// every active client has loaded it at least once.
try {
  window.localStorage.removeItem("persist:root");
} catch {
  // Storage can be unavailable (Safari private mode, blocked cookies). The
  // purge is best-effort — never let it stop the app from booting.
}

export const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
      thunk: true,
    }).concat(),
  // Vite does not define `import.meta.env.NODE_ENV`; the old check read
  // `undefined !== "production"` and left DevTools — and with it the whole
  // state tree — open in production builds. `PROD` is the Vite-provided flag.
  devTools: !import.meta.env.PROD,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
