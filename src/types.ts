/** Default CDN entry for the JOVEpay Webpay browser bundle. */
export const JOVEPAY_WEBPAY_CDN =
  'https://cdn.jsdelivr.net/gh/livialink/jovepay-webpay@main/index.min.js';

export type JovePayTheme = 'light' | 'dark';
export type JovePayLocale =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'ja'
  | 'ko'
  | 'ru'
  | 'sw'
  | 'hi'
  | 'zh'
  | 'ar'
  | 'cn'
  | 'fa'
  | (string & {});

export type CloseReason =
  | 'user'
  | 'success'
  | 'error'
  | 'api'
  | 'destroy'
  | 'superseded';

export type CheckoutState = 'idle' | 'opening' | 'open' | 'closing' | 'closed';

export type WidgetEventPayload = Record<string, unknown> | undefined;

export type WidgetEvent = {
  name: string;
  payload?: WidgetEventPayload;
};

/**
 * CMS / hosted checkout payload.
 * `ipnCallbackUrl` is intentionally excluded — IPN is configured server-side.
 */
export type CheckoutPaymentData = {
  apiKey: string;
  orderId: string | number;
  priceAmount: string | number;
  priceCurrency: string;
  successUrl?: string;
  cancelUrl?: string;
  customerName?: string;
  customerEmail?: string;
  products?: unknown;
  shipping?: unknown;
  tax?: unknown;
  subtotal?: unknown;
  dataSource?: string;
  isTestnet?: boolean;
  ipnCallbackUrl?: never;
};

type SharedOptions = {
  theme?: JovePayTheme;
  locale?: JovePayLocale;
  isTestnet?: boolean;
  paymentId?: string;
  display?: 'modal' | 'inline';
  autoCloseOnSuccess?: boolean;
  autoCloseOnError?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
  onReady?: () => void;
  onInit?: (payload: WidgetEventPayload) => void;
  onSuccess?: (payload: WidgetEventPayload) => void;
  onError?: (payload: WidgetEventPayload) => void;
  onClose?: (reason: CloseReason, payload?: WidgetEventPayload) => void;
  onEvent?: (event: WidgetEvent) => void;
};

export type InvoicePaymentOptions = SharedOptions & {
  mode: 'payment';
  invoiceId: string;
  apiKey?: never;
  orderId?: never;
  priceAmount?: never;
  priceCurrency?: never;
  successUrl?: never;
  cancelUrl?: never;
  ipnCallbackUrl?: never;
};

export type CmsPaymentOptions = SharedOptions &
  CheckoutPaymentData & {
    mode: 'payment';
    invoiceId?: never;
    ipnCallbackUrl?: never;
  };

export type PaymentCheckoutOptions = InvoicePaymentOptions | CmsPaymentOptions;

export type DonationCheckoutOptions = SharedOptions & {
  mode: 'donation';
  apiKey: string;
  invoiceId?: never;
  orderId?: never;
  ipnCallbackUrl?: never;
};

export type JovePayCheckoutOptions =
  | PaymentCheckoutOptions
  | DonationCheckoutOptions;

/** Instance surface exposed by the CDN `window.JovePayCheckout` constructor. */
export type JovePayCheckoutInstance = {
  open: () => JovePayCheckoutInstance;
  mount: (container: HTMLElement | string) => JovePayCheckoutInstance;
  close: (reason?: CloseReason) => JovePayCheckoutInstance;
  destroy: () => void;
  getStatus: () => CheckoutState;
  getEmbedUrl: () => string;
};

export type JovePayCheckoutConstructor = {
  new (options: JovePayCheckoutOptions): JovePayCheckoutInstance;
  create: (options: JovePayCheckoutOptions) => JovePayCheckoutInstance;
  EVENTS: Record<string, string>;
};

export type UseJovePayScriptOptions = {
  /** Override the CDN script URL (local build, pinned commit, etc.). */
  src?: string;
  /** DOM id for the injected `<script>` tag. */
  id?: string;
};

export type UseJovepayOptions = JovePayCheckoutOptions;

export type UseJovepayResult = {
  /** Open checkout as a modal overlay. */
  open: () => JovePayCheckoutInstance;
  /** Mount checkout into a host element (inline embed). */
  mount: (container: HTMLElement | string) => JovePayCheckoutInstance;
  /** Close the active checkout instance, if any. */
  close: (reason?: CloseReason) => void;
  /** True once the CDN script has loaded successfully. */
  loaded: boolean;
  /** True if script injection failed. */
  error: boolean;
  /** `loaded && !error` — safe to call `open` / `mount`. */
  isReady: boolean;
};

declare global {
  interface Window {
    JovePayCheckout?: JovePayCheckoutConstructor;
  }
}
