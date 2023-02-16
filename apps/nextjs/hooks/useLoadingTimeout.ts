import { useState, useEffect } from 'react';

export function useLoadingTimeout(fetching: boolean, timeout = 1000) {
  const [loading, setLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);

  useEffect(() => {
    if (!fetching) {
      setLoading(false);
      return;
    }
    setManualLoading(true);
    setLoading(true);
    const timeoutId = setTimeout(() => setManualLoading(false), timeout);
    return () => clearTimeout(timeoutId);
  }, [fetching]);

  return [loading && manualLoading, setLoading];
}