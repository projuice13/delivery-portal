'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DriverNotesForm } from './DriverNotesForm';
import { formatPostcode } from '@/lib/formatPostcode';
import type { DeliveryData, DeliveryEntry } from '@/lib/types';

interface DeliveryInstructionsProps {
  data: DeliveryData;
  onBack: () => void;
}

export function DeliveryInstructions({ data, onBack }: DeliveryInstructionsProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxUrl} alt="Full size" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}

      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Search
        </button>
        <Image src="/logo.png" alt="ProJuice" width={120} height={40} className="object-contain" />
        <button
          onClick={() => window.print()}
          className="text-sm text-gray-500 hover:text-gray-800 transition cursor-pointer"
        >
          Print
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {data.entries.map((entry, i) => (
          <EntryCard key={i} entry={entry} postcode={data.postcode} onImageClick={setLightboxUrl} />
        ))}
      </main>
    </div>
  );
}

function EntryCard({
  entry,
  postcode,
  onImageClick,
}: {
  entry: DeliveryEntry;
  postcode: string;
  onImageClick: (url: string) => void;
}) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <p className="text-2xl font-bold text-gray-900 mb-2">{formatPostcode(postcode)}</p>
        <p className="text-base font-medium text-gray-600">{entry.companyName}</p>
      </div>

      <div className="px-6 py-5 space-y-5">
        {entry.phone.length > 0 && (
          <Section label="Phone">
            <div className="flex flex-wrap gap-3">
              {entry.phone.map((p, i) => (
                <a key={i} href={`tel:${p.canonical}`} className="text-sm text-blue-600 hover:underline cursor-pointer">
                  {p.display}
                </a>
              ))}
            </div>
          </Section>
        )}

        {entry.what3words.length > 0 && (
          <Section label="What3Words">
            <div className="flex flex-wrap gap-2">
              {entry.what3words.map((w, i) => (
                <a
                  key={i}
                  href={`https://what3words.com/${w}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline font-mono cursor-pointer"
                >
                  ///{w}
                </a>
              ))}
            </div>
          </Section>
        )}

        {entry.instructions.length > 0 && (
          <Section label="Delivery Instructions">
            <div className="space-y-3">
              {entry.instructions.map((inst, i) => (
                <div key={i}>
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded mb-1.5 ${
                    inst.source === 'import'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-purple-50 text-purple-700'
                  }`}>
                    {inst.label}
                  </span>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{inst.text}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {(entry.image1Url || entry.image2Url) && (
          <Section label="Photos">
            <div className="flex gap-2 flex-wrap">
              {[entry.image1Url, entry.image2Url].filter(Boolean).map((url, i) => (
                <button key={i} onClick={() => onImageClick(url!)} className="focus:outline-none cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="h-24 w-24 object-cover rounded-lg border border-gray-100 hover:opacity-80 transition"
                  />
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Toggle driver note — full width button */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowNotes(v => !v)}
            className="w-full h-10 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showNotes ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showNotes ? 'Hide note' : 'Add a note'}
          </button>

          {showNotes && (
            <div className="mt-4">
              <DriverNotesForm postcode={postcode} onClose={() => setShowNotes(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  );
}
