import axiosWalletLms from "../../utils/axiosWalletLms";

export function fetchOverPayments(body: any) {
  const params = new URLSearchParams();
  if (body.pageNo != null) params.append("pageNo", body.pageNo);
  if (body.pageSize != null) params.append("pageSize", body.pageSize);
  if (body.from) params.append("FromDate", body.from);
  if (body.to) params.append("ToDate", body.to);
  return axiosWalletLms.get(`/api/OverPayment/GetAll?${params.toString()}`);
}
const randomUUID =
  (typeof globalThis !== 'undefined' && (globalThis as any)?.crypto?.randomUUID)
    ? (globalThis as any).crypto.randomUUID.bind((globalThis as any).crypto)
    : () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
export interface UpdateWalletBalanceData {
  userId: string;
  amount: number;
  [key: string]: any;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export async function updateWalletBalance(data: UpdateWalletBalanceData): Promise<ApiResponse> {
  try {
    const response = await axiosWalletLms.put('/api/UserWallet/UpdateWalletBalance', data, {
      headers: {
        'Request-Id':randomUUID,
        'Authorization': `Bearer ${import.meta.env.VITE_REACT_APP_WALLET_TOKEN}`
      }
    });
    
    const responseData = response.data;
    // Check if the API response indicates failure
    if (responseData.success === false) {
      return {
        success: false,
        error: responseData.notificationMessage || 'Failed to update wallet balance'
      };
    }
    
    // If successful
    return {
      success: true,
      data: responseData,
      message: responseData.notificationMessage || 'Wallet balance updated successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.notificationMessage || error.message || 'Failed to update wallet balance'
    };
  }
}
