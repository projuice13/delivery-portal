'use client';

import { useState } from 'react';
import Image from 'next/image';
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
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Search
        </button>
        <Image src="/pj.png" alt="ProJuice" width={40} height={40} className="object-contain" />
        <button
          onClick={() => window.print()}
          className="text-sm text-gray-500 hover:text-gray-800 transition cursor-pointer"
        >
          Print all
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {results.length} postcode{results.length !== 1 ? 's' : ''}
          </h1>

          {results.map(result => (
            <div key={result.postcode} className="bg-gray-50 border border-gray-200 rounded-[5px] overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200">
                <div>
                  <p className="text-xl font-bold text-gray-900">{formatPostcode(result.postcode)}</p>
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
                      {entry.phone.length > 0 && (
                        <div className="flex gap-2 mt-0.5">
                          {entry.phone.map((p, j) => (
                            <a key={j} href={`tel:${p.canonical}`} className="text-xs text-blue-600 hover:underline cursor-pointer">{p.display}</a>
                          ))}
                        </div>
                      )}
                      {entry.instructions.map((inst, j) => (
                        <p key={j} className="text-xs text-gray-500 mt-1 pl-3 border-l-2 border-gray-200">
                          {inst.text}
                        </p>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No delivery instructions found.</p>
                )}

                <div className="pt-2 print:hidden">
                  <button
                    onClick={() => setOpenNotes(openNotes === result.postcode ? null : result.postcode)}
                    className={`w-full h-10 rounded-[5px] border text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2 ${
                      openNotes === result.postcode
                        ? 'border-gray-200 text-gray-600 bg-transparent hover:bg-gray-100'
                        : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${openNotes === result.postcode ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {openNotes === result.postcode ? 'Hide note' : 'Add a note'}
                  </button>

                  {openNotes === result.postcode && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <DriverNotesForm postcode={result.postcode} onClose={() => setOpenNotes(null)} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
