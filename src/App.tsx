import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";

import { router } from "./Routes/path";
import toast, { Toaster } from "react-hot-toast";
import { I18nextProvider } from "react-i18next";
import i18n from "./components/i18n";
import { useDispatch } from "react-redux";
import { allState, getAllCountries, getAllRealations, getCities, getLanguage, getProducts } from "./redux/apis/apisCrudLms";
import { setCities, setCountries, setLanguages, setProdId, setRefreshToken, setRelations, setStates, setToken } from "./redux/apis/apisSlice";
const App = () => {
  // dispatch(authSlice.actions.setTheme( {themeStyle} ));
  const dispatch = useDispatch();
  localStorage.setItem("tenantId", "980fb848-9a36-425e-4632-08dc7fb833c6");

  const getProductId = async () => {
  try {
    const res = await getProducts();
    if (res) {
      const data = res.data.data;

      dispatch(setProdId({ prodId: data }));
    }
  } catch (error: any) {
    //toast.error(error?.message);
  }
};

const getCity = async () => {
  try {
    const res = await getCities();
    if (res) {
      const data = res.data.data;
      dispatch(setCities({ cities: data }));
    }
  } catch (error: any) {
    //toast.error(error?.message);
  }
};
const getCountry = async () => {
  try {
    const res = await getAllCountries();
    if (res) {
      const data = res.data.data;
      dispatch(setCountries({ countries: data }));
    }
  } catch (error: any) {
    //toast.error(error?.message);
  }
};

const getLanguages = async () => {
  try {
    const res = await getLanguage();
    if (res) {
      const data = res.data.data;
      dispatch(setLanguages({ languages: data }));
    }
  } catch (error: any) {
    //toast.error(error?.message);
  }
};

const getRelations = async () => {
  try {
    const res = await getAllRealations(1, 1000);
    if (res) {
      const data = res.data.data;
      dispatch(setRelations({ relations: data }));
    }
  } catch (error: any) {
    //toast.error(error?.message);
  }
};

const getStates = async () => {
  try {
    const res = await allState();
    if (res) {
      const data = res.data.data;
      dispatch(setStates({ states: data }));
    }
  } catch (error: any) {
    //toast.error(error?.message);
  }
};
// useEffect(() => {
//   dispatch(setToken({ token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjA3NkI2RDkzNDlEQkZDNTREQTExRTE1NTcxQUEwRTJCIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE3Njc2Mzc1MzcsImV4cCI6MTc2NzYzNzgzNywiaXNzIjoiaHR0cDovLzEwLjAuMTUuMTE6NTAwNS8iLCJhdWQiOiJodHRwOi8vMTAuMC4xNS4xMTo1MDA1L3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjhmZTY5MzA2LTQ4MDctNDczYS05NTNlLWVmNjQ1YThjMTVhNSIsInN1YiI6IjMyZmU4NTNjLTgxYjMtNGFmNS04ZDRjLTc4OWE2M2Q1M2I5YSIsImF1dGhfdGltZSI6MTc2NzYzNzUzNywiaWRwIjoibG9jYWwiLCJyb2xlIjoiU3VwZXIgQWRtaW4iLCJ1c2VyTmFtZSI6InN1cGVyYWRtaW5AYXduLmNvbSIsIlRlbmFudElkIjoiMTExMTExMTEtMjIyMi0zMzMzLTQ0NDQtNTU1NTU1NTU1NTU1IiwiQ29tcGFueU5hbWUiOiJBd24iLCJDSUYiOiJBd24wMjIwMjUxMTI3MTMzMDUzMDIiLCJqdGkiOiIxNzQ4RDhFMUVCMEI3MTEwN0NBNjk4NkQ2RTIwM0IyNCIsImlhdCI6MTc2NzYzNzUzNywic2NvcGUiOlsiYXduIiwib3BlbmlkIiwicHJvZmlsZSIsInJvbGUiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicHdkIl19.NvLrAMw64fbRUuAGSeqr-O7tjvo2p2IuNIeXMcmZlFPK1VZQJrHmdTWo4KltOeKecg3t7Rbw9dDJVTKHSIfw1Q0brMiCCdqgRYAnLEl9Zaq6221Yqxr6sD02VjUwE-TOj6TNYVXvYAGg1S5yerxvLCsZj7LNiSJh5ArB0ftB_zynFhCQdPTwpDsnGlQ-PSN8QLj3GUK4QrrmPzNSOHVsGvyH8R8PZbBx9hVVO7YaiMWz4wgAOWM0Va7jG9gIjLKLi96TNCeTLuWHoyWh_qjU6HEpq0tLT66OCFPqFlPn6ojw5sMZsWjSi8ODbmVLacb0DtaSytZ5uyBTKYR46PfIzw" }));
//   // getProductId();
//   // getCity();
//   // getCountry();
//   // getLanguages();
//   // getRelations();
//   // getStates();
// }, []);
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <I18nextProvider i18n={i18n}>
        {/* Brand emerald (Sullis) for all antd controls — datepicker, select,
            switch, checkbox, radio, tabs, etc. */}
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#10b981",
              colorInfo: "#10b981",
              colorLink: "#059669",
              colorLinkHover: "#10b981",
              borderRadius: 2,
            },
            components: {
              Select: {
                // Dropdown option states — emerald-tinted hover/selected
                optionActiveBg: "#ecfdf5",
                optionSelectedBg: "#d1fae5",
                optionSelectedColor: "#065f46",
              },
            },
          }}
        >
          {/* <Provider store={store}> */}
          {/* <PersistGate persistor={persistor}> */}
          <RouterProvider router={router} />
          {/* </PersistGate> */}
          {/* </Provider> */}
        </ConfigProvider>
      </I18nextProvider>
    </>
  );
};

export default App;
export const NumberFormatter = ({ value }: { value: number }) => {
  const formattedNumber = new Intl.NumberFormat("en-US").format(value);

  return <div className="formatted-number">{formattedNumber}</div>;
};
export function formatDate(dateString: string | number | Date | null) {
  if (!dateString) return null; // Return null if date is not provided
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null; // Ensure it's a valid date
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JS
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}
