import { useCallback, useState } from "react";
import { getErrorMessage } from "./useApiError";

export function useApiCall() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setBusy(true);
      setError("");
      try {
        return await fn();
      } catch (e) {
        setError(getErrorMessage(e));
        return null;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return { busy, error, setError, run };
}
