# jovepay-react-checkout

React hook for [JOVEpay](https://www.jovepay.com) in-page checkout.

Loads the JOVEpay Webpay browser SDK from jsDelivr, then lets you open payment
or donation widgets with a single `useJovepay` call — no manual script tags
required.

Works with React 16.8+ (hooks) in Create React App, Next.js, Vite, Remix, and
other React setups.

---

## Install

```bash
npm install jovepay-react-checkout
# or
pnpm add jovepay-react-checkout
# or
yarn add jovepay-react-checkout
```

**Peer dependency:** `react` ≥ 16.8.0

---

## Quick start

```tsx
import { useJovepay } from 'jovepay-react-checkout';

export function PayButton({ invoiceId }: { invoiceId: string }) {
  const { open, isReady, error } = useJovepay({
    mode: 'payment',
    invoiceId,
    theme: 'light',
    locale: 'en',
    onSuccess: (payload) => console.log('Payment succeeded', payload),
    onError: (payload) => console.error('Payment failed', payload),
    onClose: (reason) => console.log('Closed:', reason),
  });

  if (error) {
    return <p>Unable to load JOVEpay checkout</p>;
  }

  return (
    <button type="button" disabled={!isReady} onClick={() => open()}>
      Pay with JOVEpay
    </button>
  );
}
```

On first use, the hook injects:

```text
https://cdn.jsdelivr.net/gh/livialink/jovepay-webpay@main/index.min.js
```

After load, `window.JovePayCheckout` is available and `isReady` becomes `true`.

---

## Payment modes

### Invoice checkout

Use when you already created an invoice in JOVEpay (dashboard / API).

```tsx
const { open, isReady } = useJovepay({
  mode: 'payment',
  invoiceId: '1598462043',
  theme: 'light',
  locale: 'en',
  isTestnet: false,
  onSuccess: (payload) => console.log(payload),
});
```

### CMS / order checkout

Use from a storefront when you have an order total and merchant API key.

**Required:** `apiKey`, `orderId`, `priceAmount`, `priceCurrency`  
**Optional:** `successUrl`, `cancelUrl`, customer + line-item metadata  
**Not allowed:** `ipnCallbackUrl` (configure IPN on the server / dashboard)

```tsx
const { open, isReady } = useJovepay({
  mode: 'payment',
  apiKey: 'YOUR_PUBLISHABLE_API_KEY',
  orderId: '1001',
  priceAmount: '49.99',
  priceCurrency: 'USD',
  successUrl: 'https://merchant.example/checkout/success',
  cancelUrl: 'https://merchant.example/checkout/cancel',
  customerName: 'Ada Lovelace',
  customerEmail: 'ada@example.com',
  products: [{ name: 'Widget', quantity: 1, price: '49.99' }],
  dataSource: 'custom',
  theme: 'dark',
  locale: 'en',
  onSuccess: () => {
    window.location.href = '/thanks';
  },
});
```

### Donation widget

```tsx
const { open, isReady } = useJovepay({
  mode: 'donation',
  apiKey: 'YOUR_PUBLISHABLE_API_KEY',
  theme: 'light',
  locale: 'en',
});
```

---

## Inline embed

Mount into a page slot instead of a fullscreen modal:

```tsx
import { useEffect, useRef } from 'react';
import { useJovepay } from 'jovepay-react-checkout';

export function InlineCheckout({ invoiceId }: { invoiceId: string }) {
  const slotRef = useRef<HTMLDivElement>(null);
  const { mount, isReady } = useJovepay({
    mode: 'payment',
    invoiceId,
    display: 'inline',
  });

  useEffect(() => {
    if (isReady && slotRef.current) {
      mount(slotRef.current);
    }
  }, [isReady, mount]);

  return <div ref={slotRef} style={{ minHeight: 640 }} />;
}
```

---

## Hook API

```ts
const {
  open,    // () => JovePayCheckoutInstance — open modal overlay
  mount,   // (el | selector) => JovePayCheckoutInstance — inline mount
  close,   // (reason?) => void — close active instance
  loaded,  // CDN script finished loading
  error,   // script failed to load
  isReady, // loaded && !error — safe to call open / mount
} = useJovepay(options);
```

| Method / field | Description |
| --- | --- |
| `open()` | Opens checkout as a fullscreen modal. Throws if the script is not ready or failed to load. |
| `mount(container)` | Mounts an inline embed into an element or CSS selector. |
| `close(reason?)` | Closes the active instance. Reason defaults to `'api'`. |
| `loaded` | `true` after the CDN script loads. |
| `error` | `true` if script injection failed. |
| `isReady` | Shortcut for `loaded && !error`. Disable your pay button until this is `true`. |

The active checkout instance is destroyed automatically when the component
that called `useJovepay` unmounts.

---

## Options reference

### Shared

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `'payment' \| 'donation'` | — | **Required** |
| `theme` | `'light' \| 'dark'` | `'light'` | Widget theme |
| `locale` | `string` | `'en'` | Widget locale (`en`, `es`, `fr`, …) |
| `isTestnet` | `boolean` | `false` | Use testnet networks |
| `paymentId` | `string` | — | Resume an in-flight payment (`pid`) |
| `display` | `'modal' \| 'inline'` | `'modal'` | Overlay vs mount target |
| `autoCloseOnSuccess` | `boolean` | `true` (modal) | Close after success |
| `autoCloseOnError` | `boolean` | `false` | Close after failure |
| `closeOnBackdrop` | `boolean` | `true` | Click dimmed backdrop to close |
| `closeOnEscape` | `boolean` | `true` | Escape key closes modal |
| `query` | `object` | `{}` | Extra query params |

### Callbacks

| Callback | Signature | When |
| --- | --- | --- |
| `onReady` | `() => void` | Widget signaled ready |
| `onInit` | `(payload) => void` | Payment initialized |
| `onSuccess` | `(payload) => void` | Payment succeeded / confirmed |
| `onError` | `(payload) => void` | Payment failed / expired |
| `onClose` | `(reason, payload?) => void` | Widget torn down |
| `onEvent` | `(event) => void` | Every typed widget event |

`onClose` reasons: `'user' | 'success' | 'error' | 'api' | 'destroy' | 'superseded'`.

### Mode-specific fields

| Mode | Required fields |
| --- | --- |
| Invoice payment | `mode: 'payment'`, `invoiceId` |
| CMS / order payment | `mode: 'payment'`, `apiKey`, `orderId`, `priceAmount`, `priceCurrency` |
| Donation | `mode: 'donation'`, `apiKey` |

---

## Lower-level script loader

If you need the script status without opening checkout, or want to override the
CDN URL (pinned commit, self-hosted build):

```ts
import { useJovePayScript, JOVEPAY_WEBPAY_CDN } from 'jovepay-react-checkout';

const [loaded, error] = useJovePayScript();

// Custom script URL
const [loaded, error] = useJovePayScript({
  src: 'https://cdn.jsdelivr.net/gh/livialink/jovepay-webpay@<commit>/index.min.js',
  id: 'jovepay-webpay-sdk', // optional DOM id
});
```

`JOVEPAY_WEBPAY_CDN` is the default public script URL.

---

## TypeScript

The package ships TypeScript types. You can import option and result types:

```ts
import type {
  UseJovepayOptions,
  UseJovepayResult,
  JovePayCheckoutOptions,
  JovePayCheckoutInstance,
  CloseReason,
} from 'jovepay-react-checkout';
```

---

## Framework notes

### Next.js (App Router)

Call the hook only in **Client Components** (`'use client'`). The SDK needs
`window` and `document`.

```tsx
'use client';

import { useJovepay } from 'jovepay-react-checkout';
// ...
```

### Server-side rendering

Do not call `open()` / `mount()` during SSR. Gate on `isReady` (always `false`
until the client has loaded the script).

---

## Security

- Never put secret API credentials that can mutate payouts into client-side
  config. The `apiKey` used by widgets is the merchant **publishable** key.
- Do not pass `ipnCallbackUrl` through the SDK — configure IPN server-side in
  the JOVEpay dashboard.
- The underlying Webpay SDK verifies `postMessage` origins against the
  configured portal host before dispatching callbacks.

---

## Related

- [JOVEpay](https://www.jovepay.com) — merchant dashboard and docs
- [jovepay-webpay](https://github.com/livialink/jovepay-webpay) — vanilla JS / CDN checkout SDK

---

## License

See the repository `LICENSE` file for details.
