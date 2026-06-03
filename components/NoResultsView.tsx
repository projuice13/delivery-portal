'use client';

import Image from 'next/image';
import { formatPostcode } from '@/lib/formatPostcode';
import { DriverNotesForm } from './DriverNotesForm';

interface NoResultsViewProps {
  postcode: string;
  onBack: () => void;
}

export function NoResultsView({ postcode, onBack }: NoResultsViewProps) {
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
        <div className="w-24" />
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-gray-50 border border-gray-200 rounded-[5px] p-6">
          <p className="text-2xl font-bold text-gray-900 mb-2">{formatPostcode(postcode)}</p>
          <p className="text-base font-medium text-gray-600 mb-1">No results found</p>
          <p className="text-sm text-gray-500 mb-6">
            No delivery instructions were found for this postcode. You can still submit a driver note below.
          </p>
          <DriverNotesForm postcode={postcode} onClose={onBack} />
        </div>
      </main>
    </div>
  );
}
