import { combineReducers } from "redux";
import persistReducer from "redux-persist/es/persistReducer";
import storageSession from "redux-persist/lib/storage/session";
// import localStorage from "redux-persist/es/storage";
import blockReducer from "./apis/apisSlice";

const persistBlock = {
  key: "auth",
  storage: storageSession,
  whitelist: ["isError", "isSuccess", "isLoading", "message", "theme", "prodId", "cities", "countries", "languages","payInvoices", "token", "refreshToken"],
};
const rootReducer: any = combineReducers({

  block: persistReducer(persistBlock, blockReducer),
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
