import { useEffect, useState } from 'react';
import { JOVEPAY_WEBPAY_CDN, type UseJovePayScriptOptions } from './types';

type ScriptStatus = {
  loaded: boolean;
  error: boolean;
};

const DEFAULT_SCRIPT_ID = 'jovepay-webpay-sdk';

/**
 * Injects the JOVEpay Webpay CDN script once and reports load status.
 * Mirrors the Konnadex `useScript` pattern used by cryptoPay.
 */
export function useJovePayScript(
  options: UseJovePayScriptOptions = {},
): [boolean, boolean] {
  const src = options.src ?? JOVEPAY_WEBPAY_CDN;
  const id = options.id ?? DEFAULT_SCRIPT_ID;

  const [state, setState] = useState<ScriptStatus>({
    loaded: false,
    error: false,
  });

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const existing = document.getElementById(id);
    const existingSrc = existing?.getAttribute('src');

    if (existing && existingSrc === src) {
      if (typeof window !== 'undefined' && window.JovePayCheckout) {
        setState({ loaded: true, error: false });
        return;
      }

      const onExistingLoad = () => setState({ loaded: true, error: false });
      const onExistingError = () => setState({ loaded: false, error: true });

      existing.addEventListener('load', onExistingLoad);
      existing.addEventListener('error', onExistingError);

      return () => {
        existing.removeEventListener('load', onExistingLoad);
        existing.removeEventListener('error', onExistingError);
      };
    }

    if (existing && existingSrc !== src) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';

    const onScriptLoad = () => {
      setState({ loaded: true, error: false });
    };

    const onScriptError = () => {
      script.remove();
      setState({ loaded: false, error: true });
    };

    script.addEventListener('load', onScriptLoad);
    script.addEventListener('error', onScriptError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', onScriptLoad);
      script.removeEventListener('error', onScriptError);
    };
  }, [id, src]);

  return [state.loaded, state.error];
}
