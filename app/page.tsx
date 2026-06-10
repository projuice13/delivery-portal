'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoginForm } from '@/components/LoginForm';
import { PostcodeLookup } from '@/components/PostcodeLookup';
import { DeliveryInstructions } from '@/components/DeliveryInstructions';
import { MultipleDeliveryResults } from '@/components/MultipleDeliveryResults';
import { NoResultsView } from '@/components/NoResultsView';
import { AdminApprovalList } from '@/components/AdminApprovalList';
import { VersionBanner } from '@/components/VersionBanner';
import type { DeliveryData, DeliveryResult } from '@/lib/types';

type View =
  | 'login'
  | 'driver-lookup'
  | 'driver-instructions'
  | 'multiple-results'
  | 'no-results'
  | 'admin-approval';

export default function Home() {
  const [view, setView] = useState<View>('login');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [multipleResults, setMultipleResults] = useState<DeliveryResult[]>([]);
  const [noResultPostcode, setNoResultPostcode] = useState('');

  const queryClient = useQueryClient();

  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/user', { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (!authLoading && user && view === 'login') {
      setView(user.role === 'office' ? 'admin-approval' : 'driver-lookup');
    }
  }, [authLoading, user, view]);

  function handleLogout() {
    // Clear cached user immediately so the auth effect can't bounce back to driver-lookup
    queryClient.setQueryData(['auth-user'], null);
    setView('login');
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
  }

  async function handleLookup(postcodes: string[]) {
    setLookupLoading(true);
    try {
      if (postcodes.length === 1) {
        const res = await fetch('/api/postcode/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ postcode: postcodes[0] }),
        });
        if (res.status === 404) {
          setNoResultPostcode(postcodes[0]);
          setView('no-results');
          return;
        }
        const data: DeliveryData = await res.json();
        setDeliveryData(data);
        setView('driver-instructions');
      } else {
        const res = await fetch('/api/postcode/lookup-multiple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ postcodes }),
        });
        const { results } = await res.json();
        setMultipleResults(results);
        setView('multiple-results');
      }
    } finally {
      setLookupLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <>
      {view === 'login' && (
        <LoginForm
          onSuccess={(role) => {
            setView(role === 'office' ? 'admin-approval' : 'driver-lookup');
          }}
        />
      )}

      {view === 'admin-approval' && (
        <AdminApprovalList onLogout={handleLogout} />
      )}

      {view === 'driver-lookup' && (
        <PostcodeLookup
          onLookup={handleLookup}
          onLogout={handleLogout}
          loading={lookupLoading}
        />
      )}

      {view === 'driver-instructions' && deliveryData && (
        <DeliveryInstructions
          data={deliveryData}
          onBack={() => setView('driver-lookup')}
        />
      )}

      {view === 'multiple-results' && (
        <MultipleDeliveryResults
          results={multipleResults}
          onBack={() => setView('driver-lookup')}
        />
      )}

      {view === 'no-results' && (
        <NoResultsView
          postcode={noResultPostcode}
          onBack={() => setView('driver-lookup')}
        />
      )}

      <VersionBanner />
    </>
  );
}
