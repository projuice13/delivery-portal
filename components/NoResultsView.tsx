'use client';

import { formatPostcode } from '@/lib/formatPostcode';
import { DriverNotesForm } from './DriverNotesForm';

interface NoResultsViewProps {
  postcode: string;
  onBack: () => void;
}

export function NoResultsView({ postcode, onBack }: NoResultsViewProps) {
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-medium text-gray-400 mb-0.5">{formatPostcode(postcode)}</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No results found</h2>
          <p className="text-sm text-gray-500 mb-6">
            No delivery instructions were found for this postcode. You can still submit a driver note below.
          </p>
          <DriverNotesForm postcode={postcode} onClose={onBack} />
        </div>
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
