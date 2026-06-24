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
  const [showNewEntry, setShowNewEntry] = useState(false);

  // Does any entry on this postcode come from the library DB?
  const hasLibraryEntries = data.entries.some(e => e.libraryEntryId);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxUrl} alt="Full size" className="max-w-full max-h-full object-contain rounded-[5px]" />
        </div>
      )}

      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between print:hidden">
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
          Print
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-4">
          {data.entries.map((entry, i) => (
            <EntryCard key={i} entry={entry} postcode={data.postcode} onImageClick={setLightboxUrl} />
          ))}

          {/* Add new entry — shown below all cards when there are existing library entries */}
          {hasLibraryEntries && (
            <div className="bg-gray-50 border border-gray-200 rounded-[5px] overflow-hidden">
              <div className="px-5 py-4">
                <button
                  onClick={() => setShowNewEntry(v => !v)}
                  className={`w-full h-10 rounded-[5px] border text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2 ${
                    showNewEntry
                      ? 'border-gray-200 text-gray-600 bg-transparent hover:bg-gray-100'
                      : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showNewEntry ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {showNewEntry ? 'Hide form' : 'Add a new entry for this postcode'}
                </button>

                {showNewEntry && (
                  <div className="mt-4">
                    <DriverNotesForm postcode={data.postcode} onClose={() => setShowNewEntry(false)} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
  const [showEdit, setShowEdit] = useState(false);
  const isLibraryEntry = Boolean(entry.libraryEntryId);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-[5px] overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-200">
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
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-[5px] mb-1.5 border bg-transparent ${
                    inst.source === 'import'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-purple-600 border-purple-600'
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
                    className="h-24 w-24 object-cover rounded-[5px] border border-gray-200 hover:opacity-80 transition"
                  />
                </button>
              ))}
            </div>
          </Section>
        )}

        <div className="pt-0 space-y-2">
          {/* Import-only entries keep "Add a note" */}
          {!isLibraryEntry && (
            <>
              <button
                onClick={() => setShowNotes(v => !v)}
                className={`w-full h-10 rounded-[5px] border text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2 ${
                  showNotes
                    ? 'border-gray-200 text-gray-600 bg-transparent hover:bg-gray-100'
                    : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                }`}
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
            </>
          )}

          {/* Library entries get "Suggest an edit" only */}
          {isLibraryEntry && (
            <>
              <button
                onClick={() => setShowEdit(v => !v)}
                className={`w-full h-10 rounded-[5px] border text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2 ${
                  showEdit
                    ? 'border-gray-200 text-gray-600 bg-transparent hover:bg-gray-100'
                    : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {showEdit ? 'Hide edit form' : 'Suggest an edit'}
              </button>

              {showEdit && (
                <div className="mt-4">
                  <DriverNotesForm
                    postcode={postcode}
                    onClose={() => setShowEdit(false)}
                    targetLibraryEntryId={entry.libraryEntryId}
                    initialBusinessName={entry.companyName}
                    initialWhat3words={entry.libraryWhat3words ?? ''}
                    initialNotes={entry.libraryNotes ?? ''}
                  />
                </div>
              )}
            </>
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
