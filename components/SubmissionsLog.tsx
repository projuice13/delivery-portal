'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { formatPostcode } from '@/lib/formatPostcode';

interface LogEntry {
  id: string;
  driverName: string;
  businessName: string;
  postcode: string;
  status: string;
  createdAt: string;
  targetLibraryEntryId: string | null;
}

interface SubmissionsLogProps {
  onBack: () => void;
  onLogout: () => void;
  role: 'driver' | 'office';
}

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-50 text-yellow-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending:  'Awaiting Approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function SubmissionsLog({ onBack, onLogout, role }: SubmissionsLogProps) {
  const { data, isLoading } = useQuery<{ notes: LogEntry[] }>({
    queryKey: ['submissions-log'],
    queryFn: () => fetch('/api/submissions-log', { credentials: 'include' }).then(r => r.json()),
  });

  const notes = data?.notes ?? [];

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
          Back
        </button>
        <Image src="/pj.png" alt="ProJuice" width={40} height={40} className="object-contain" />
        <button
          onClick={onLogout}
          className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          title="Log out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Submissions Log</h1>

          {isLoading && <p className="text-sm text-gray-400">Loading…</p>}

          {!isLoading && notes.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-[5px] p-6 text-center">
              <p className="text-sm text-gray-500">No submissions yet.</p>
            </div>
          )}

          {!isLoading && notes.length > 0 && (
            <div className="border border-gray-200 rounded-[5px] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Postcode</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Business Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Driver</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {notes.map(note => (
                    <tr key={note.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {formatPostcode(note.postcode)}
                        {note.targetLibraryEntryId && (
                          <span className="ml-1.5 text-xs text-blue-500">edit</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{note.businessName || <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{note.driverName}</td>
                      <td className="px-4 py-3 text-gray-400 hidden sm:table-cell whitespace-nowrap">
                        {new Date(note.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[note.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[note.status] ?? note.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
