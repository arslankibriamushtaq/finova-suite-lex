export let sideBarUtils = {};
export function setSideBarUtils(data: any) {
  sideBarUtils = data;
}
export let filterUtils = "";
export function setFilterUtils(data: any) {
  filterUtils = data;
}
export const NumberFormatter = (value: any) => {
  const formattedNumber = new Intl.NumberFormat("en-US").format(value);
  return formattedNumber;
};
let navigator: any;

export const setNavigator = (navFn: any) => {
  navigator = navFn;
};

export const navigate = (...args: any) => {
  if (navigator) {
    navigator(...args);
  }
};
