import { RouterProvider } from "react-router-dom";

import { router } from "./Routes/path";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { theme } from "antd";
import toast, { Toaster } from "react-hot-toast";
import { I18nextProvider } from "react-i18next";
import i18n from "./components/i18n";
import { themeStyle } from "./components/Config/Theme";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { allState, getAllCountries, getAllRealations, getCities, getLanguage, getProducts } from "./redux/apis/apisCrudLms";
import { setCities, setCountries, setLanguages, setProdId, setRefreshToken, setRelations, setStates, setToken } from "./redux/apis/apisSlice";
const App = () => {
  // dispatch(authSlice.actions.setTheme( {themeStyle} ));
  const dispatch = useDispatch();
  localStorage.setItem("tenantId", "980fb848-9a36-425e-4632-08dc7fb833c6");
  const GlobalStyle = createGlobalStyle`
  .application-btn{
  background: ${themeStyle.secondary} !important;
  }
  .theme-btn-next{
  background: ${themeStyle.tertiary} !important;
  }
  .invoice-btn{
  background: ${themeStyle.otherActionsColor} !important;
  }
  .revert-btn{
  background: ${themeStyle.revertActionColor} !important;
  }

  .nav-tabs .nav-link{
  background: ${themeStyle.inaActiveTab} !important;
  }
  .gradient-btn{
  background: ${themeStyle.gradientBackgroundColor} !important;
  width: 69px;
  height: 29px;
  font-size:12px;
  color:#fff !important;
  }
  .subheader_layout{
  background: ${themeStyle?.headerColor.subHeaderBgColor} !important;
  color: ${themeStyle?.headerColor.subheaderTextColor} !important;
  }
  .css-vj11vy.ps-menu-root {
  background: ${themeStyle?.dashboardSibeBarFlow.flowDashboardSideBarBg} !important;
  }
  .ps-submenu-content ul {
  background: ${themeStyle?.dashboardSibeBarFlow.subMenuSideBarBg} !important;
  color: ${themeStyle?.dashboardSibeBarFlow.subMenuSideBarBg} !important;
  }
  span.ps-menu-label.ps-active.css-12w9als {
  // background: ${themeStyle?.dashboardSibeBarFlow.activeColorBg} !important;
  color: ${themeStyle?.dashboardSibeBarFlow.activeTextColor} !important;

  }

li.ps-menuitem-root.ps-active.css-1654oxy  > .ps-menu-button ,.menu-items > a:hover .ps-menu-button{
 background-color: ${themeStyle?.dashboardSibeBarFlow.activeColorBg} !important;
  color: ${themeStyle?.dashboardSibeBarFlow.activeTextColor} !important;
      margin-left: 20px;
      width: -webkit-fill-available;
      border-radius:0px 0px 0px 0px;
}
li.ps-menuitem-root.ps-active.css-1654oxy>.ps-menu-button:first-child:before {
   content: '';
    position: absolute;
    left: 20px;
    background:  #1963b9;
    width: 4px;
    height: 100%;
    top: 0px;
}

 .css-12w9als {
  color:  ${themeStyle?.dashboardSibeBarFlow.inActiveTextColor} !important ;
}
  .menu-items > li a:hover span , .menu-items > a:hover span {
  color: #fffff !important ;
}
  .ps-submenu-content ul {
    background: transparent !important;
    color: #fff !important;
}
    span.ps-submenu-expand-icon.ps-open.css-1cuxlhl span:after {
    width: 2px;
    height: 100%;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
}
    span.ps-submenu-expand-icon.ps-open.css-1cuxlhl span:before {
    display:none !important;
}
   
    span.ps-submenu-expand-icon.ps-open.css-1cuxlhl span:after {
    width: 15px;
    height: 2px;
    left: -10px;
    top: 0px;
    transform: translateX(0);
    transform: rotate(315deg) !important;
}

   nav.ps-menu-root.css-vj11vy .ps-submenu-content ul a.ps-menu-button {
    margin-left: 0px !important;
    margin-top:0px !important;
    padding-left: 10px !important;
}
    .ps-submenu-content.ps-open , .ps-submenu-content {
    background: transparent !important;
}
    .ps-submenu-content ul {
    // background: #D7D7D7 !important;
    color: #000000 !important;
    margin-left: 34px;
    margin-top: 10px;
}
   .ps-submenu-content .css-1wc703o {
    margin-right: 10px !important;
}
    .ps-submenu-content a.ps-menu-button {
    text-transform: capitalize !important;
}
    .ps-submenu-content.ps-open ul a li a {
    width: 100% !important;
}
  /* Remove separators from sidebar menu items */
  .ps-menu-root .ps-menuitem-root {
    border-bottom: none !important;
  }
  .ps-menu-root .ps-menu-button {
    border-bottom: none !important;
  }
  .menu-items {
    border-bottom: none !important;
  }
  .menu-items > div {
    border-bottom: none !important;
  }
  /* Active state styling */
  li.ps-menuitem-root.ps-active.css-1654oxy > .ps-menu-button {
    background-color: ${themeStyle?.dashboardSibeBarFlow.activeColorBg} !important;
    color: ${themeStyle?.dashboardSibeBarFlow.activeTextColor} !important;
  }
}
  
`;
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
        {/* <Provider store={store}> */}
        <ThemeProvider theme={theme}>
          {/* <PersistGate persistor={persistor}> */}
          <GlobalStyle />
          <RouterProvider router={router} />
          {/* </PersistGate> */}
        </ThemeProvider>
        {/* </Provider> */}
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
