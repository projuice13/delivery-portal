'use client';

import { useState } from 'react';
import { DriverNotesForm } from './DriverNotesForm';
import { formatPostcode } from '@/lib/formatPostcode';
import type { DeliveryResult } from '@/lib/types';

interface MultipleDeliveryResultsProps {
  results: DeliveryResult[];
  onBack: () => void;
}

export function MultipleDeliveryResults({ results, onBack }: MultipleDeliveryResultsProps) {
  const [openNotes, setOpenNotes] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Search
        </button>
        <ProJuiceLogo />
        <div className="w-16" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">
          {results.length} postcode{results.length !== 1 ? 's' : ''}
        </h1>

        {results.map(result => (
          <div key={result.postcode} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
              <div>
                <p className="font-semibold text-gray-900">{formatPostcode(result.postcode)}</p>
                {result.data && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {result.data.entries.length} {result.data.entries.length === 1 ? 'entry' : 'entries'}
                  </p>
                )}
              </div>
              {result.data ? (
                <span className="text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">Found</span>
              ) : (
                <span className="text-xs font-medium bg-red-50 text-red-600 px-2.5 py-1 rounded-full">Not found</span>
              )}
            </div>

            <div className="px-5 py-4 space-y-3">
              {result.data ? (
                result.data.entries.map((entry, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-gray-800">{entry.companyName}</p>
                    {entry.instructions.map((inst, j) => (
                      <p key={j} className="text-xs text-gray-500 mt-0.5 pl-3 border-l-2 border-gray-100">
                        {inst.text}
                      </p>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No delivery instructions found.</p>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setOpenNotes(openNotes === result.postcode ? null : result.postcode)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  {openNotes === result.postcode ? 'Hide note form' : '+ Add driver note'}
                </button>

                {openNotes === result.postcode && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <DriverNotesForm postcode={result.postcode} onClose={() => setOpenNotes(null)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

function ProJuiceLogo() {
  return (
    <div className="inline-flex items-center gap-0.5">
      <span className="text-xl font-bold text-gray-900">Pro</span>
      <span className="text-xl font-bold text-orange-500">Juice</span>
    </div>
  );
}
