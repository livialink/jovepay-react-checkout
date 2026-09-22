import { useCallback, useEffect, useRef } from 'react';
import type {
  CloseReason,
  JovePayCheckoutInstance,
  JovePayCheckoutOptions,
  UseJovepayOptions,
  UseJovepayResult,
} from './types';
import { useJovePayScript } from './useJovePayScript';

function splitOptions(options: UseJovepayOptions): {
  checkout: JovePayCheckoutOptions;
} {
  return { checkout: options as JovePayCheckoutOptions };
}

/**
 * Loads the JOVEpay Webpay SDK from jsDelivr and returns helpers to open checkout.
 *
 * @example
 * ```tsx
 * const { open, isReady } = useJovepay({
 *   mode: 'payment',
 *   invoiceId: '1598462043',
 *   theme: 'light',
 *   onSuccess: (payload) => console.log(payload),
 * });
 *
 * return (
 *   <button disabled={!isReady} onClick={() => open()}>
 *     Pay now
 *   </button>
 * );
 * ```
 */
export function useJovepay(options: UseJovepayOptions): UseJovepayResult {
  const { checkout } = splitOptions(options);
  const [loaded, error] = useJovePayScript();

  const optionsRef = useRef(checkout);
  optionsRef.current = checkout;

  const instanceRef = useRef<JovePayCheckoutInstance | null>(null);

  useEffect(() => {
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, []);

  const createInstance = useCallback((): JovePayCheckoutInstance => {
    if (error) {
      throw new Error('Unable to load JOVEpay Webpay script');
    }
    if (!loaded || typeof window === 'undefined' || !window.JovePayCheckout) {
      throw new Error('JOVEpay Webpay script is not ready yet');
    }

    instanceRef.current?.close('superseded');
    const checkoutInstance = new window.JovePayCheckout(optionsRef.current);
    instanceRef.current = checkoutInstance;
    return checkoutInstance;
  }, [error, loaded]);

  const open = useCallback((): JovePayCheckoutInstance => {
    return createInstance().open();
  }, [createInstance]);

  const mount = useCallback(
    (container: HTMLElement | string): JovePayCheckoutInstance => {
      return createInstance().mount(container);
    },
    [createInstance],
  );

  const close = useCallback((reason: CloseReason = 'api') => {
    instanceRef.current?.close(reason);
    instanceRef.current = null;
  }, []);

  return {
    open,
    mount,
    close,
    loaded,
    error,
    isReady: loaded && !error,
  };
}

export default useJovepay;
