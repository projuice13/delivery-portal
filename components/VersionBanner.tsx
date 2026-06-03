'use client';

import { useEffect, useRef, useState } from 'react';

export function VersionBanner() {
  const [outdated, setOutdated] = useState(false);
  const initialVersion = useRef<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function check() {
      try {
        const res = await fetch('/api/version', { credentials: 'include' });
        const data = await res.json();
        if (!initialVersion.current) {
          initialVersion.current = data.version;
        } else if (data.version !== initialVersion.current) {
          setOutdated(true);
          clearInterval(interval);
        }
      } catch {}
    }

    check();
    interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!outdated) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-amber-500 text-white text-sm text-center py-2 px-4 flex items-center justify-center gap-3">
      <span>A new version is available.</span>
      <button
        onClick={() => window.location.reload()}
        className="underline font-semibold hover:no-underline"
      >
        Refresh now
      </button>
    </div>
  );
}
