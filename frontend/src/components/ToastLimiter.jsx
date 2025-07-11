import { useEffect } from "react";
import toast, { Toaster, useToasterStore } from "react-hot-toast";

/**
 * Shows at most `limit` toasts at any moment.
 * Oldest visible toast is dismissed the instant a new one would exceed the limit.
 */
export default function ToastLimiter({ limit = 4, ...toasterProps }) {
  const { toasts } = useToasterStore(); // live list from react‑hot‑toast

  useEffect(() => {
    const visible = toasts.filter((t) => t.visible); // only those currently on‑screen

    if (visible.length > limit) {
      // Dismiss the oldest extras so that only the newest `limit` remain
      visible
        .slice(0, visible.length - limit) // earliest visible toasts
        .forEach((t) => toast.dismiss(t.id)); // use toast.remove(t.id) for instant removal
    }
  }, [toasts, limit]);

  return <Toaster {...toasterProps} />; // position, duration, theme, etc.
}
