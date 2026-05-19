import Axios from 'axios';
import { store } from '../redux/store';

const getBaseUrl = () =>
  import.meta.env.VITE_NOTIFICATION_SERVICE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000';

const HMAC_PATH = '/notification-service/api/v1/notifications/hmac';

/**
 * Fetches the Novu HMAC hash for a given subscriber from the backend.
 * Returns null on 404 (dev fallback: non-HMAC mode) or on any network error.
 * The JWT is read from the Redux store at call time so it's always current.
 */
export async function fetchSubscriberHmac(subscriberId: string): Promise<string | null> {
  const token = (store.getState() as any).block?.token;

  try {
    const res = await Axios.get(`${getBaseUrl()}${HMAC_PATH}/${subscriberId}`, {
      headers: token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
    });

    // Support both { hash: '...' } and { hmac: '...' } response shapes
    return res.data?.hash ?? res.data?.hmac ?? null;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404) {
      // Backend has no HMAC endpoint — acceptable in development
      return null;
    }
    console.error('[Novu] HMAC fetch error:', err?.message ?? err);
    return null;
  }
}

/**
 * Triggers a test notification via the backend notification service.
 * Useful for manual smoke-testing from the browser console.
 */
export async function triggerTestNotification(payload: {
  eventType: string;
  tenantId: string;
  customerId: string;
  reason: string;
}): Promise<void> {
  const token = (store.getState() as any).block?.token;

  await Axios.post(
    `${getBaseUrl()}/notification-service/api/v1/notifications/trigger-test`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
}
