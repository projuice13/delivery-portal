'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatPostcode } from '@/lib/formatPostcode';

interface DriverNote {
  id: string;
  driverName: string;
  postcode: string;
  what3words: string;
  notes: string;
  fileUrl: string;
  status: string;
  createdAt: string;
}

interface AdminApprovalListProps {
  onLogout: () => void;
}

export function AdminApprovalList({ onLogout }: AdminApprovalListProps) {
  const queryClient = useQueryClient();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, { companyName: string; notes: string; what3words: string }>>({});
  const [actioning, setActioning] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery<{ notes: DriverNote[] }>({
    queryKey: ['admin-pending-notes'],
    queryFn: () => fetch('/api/admin/notes/pending', { credentials: 'include' }).then(r => r.json()),
  });

  const notes = data?.notes ?? [];

  function getEdit(note: DriverNote) {
    return (
      editing[note.id] ?? {
        companyName: '',
        notes: note.notes,
        what3words: note.what3words,
      }
    );
  }

  function updateEdit(noteId: string, field: 'companyName' | 'notes' | 'what3words', value: string, note: DriverNote) {
    setEditing(prev => ({
      ...prev,
      [noteId]: { ...getEdit(note), ...prev[noteId], [field]: value },
    }));
  }

  async function handleApprove(note: DriverNote) {
    setActioning(note.id);
    setError('');
    const edit = getEdit(note);
    try {
      const res = await fetch(`/api/admin/notes/${note.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(edit),
      });
      if (!res.ok) {
        setError('Failed to approve. Please try again.');
        return;
      }
      queryClient.setQueryData<{ notes: DriverNote[] }>(['admin-pending-notes'], old =>
        old ? { notes: old.notes.filter(n => n.id !== note.id) } : old
      );
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setActioning(null);
    }
  }

  async function handleReject(note: DriverNote) {
    setActioning(note.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/notes/${note.id}/reject`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        setError('Failed to reject. Please try again.');
        return;
      }
      queryClient.setQueryData<{ notes: DriverNote[] }>(['admin-pending-notes'], old =>
        old ? { notes: old.notes.filter(n => n.id !== note.id) } : old
      );
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setActioning(null);
    }
  }

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

      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Image src="/pj.png" alt="ProJuice" width={40} height={40} className="object-contain" />
        <button
          onClick={onLogout}
          className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          title="Log out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-4">
          <h1 className="text-xl font-semibold text-gray-900">Awaiting Approval</h1>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-[5px] px-3 py-2">{error}</p>}

          {isLoading && <p className="text-sm text-gray-400">Loading…</p>}

          {!isLoading && notes.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-[5px] p-6 text-center">
              <p className="text-sm text-gray-500">No notes awaiting approval.</p>
            </div>
          )}

          {notes.map(note => {
            const edit = getEdit(note);
            return (
              <div key={note.id} className="bg-gray-50 border border-gray-200 rounded-[5px] overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{formatPostcode(note.postcode)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {note.driverName} &middot; {new Date(note.createdAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                  <span className="text-xs font-medium bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full">Pending</span>
                </div>

                <div className="px-5 py-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Company name <span className="text-gray-400 font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={edit.companyName}
                      onChange={e => updateEdit(note.id, 'companyName', e.target.value, note)}
                      placeholder="Leave blank for a general postcode note"
                      className="w-full h-10 rounded-[5px] border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      What3Words
                    </label>
                    <input
                      type="text"
                      value={edit.what3words}
                      onChange={e => updateEdit(note.id, 'what3words', e.target.value, note)}
                      className="w-full h-10 rounded-[5px] border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Notes
                    </label>
                    <textarea
                      rows={4}
                      value={edit.notes}
                      onChange={e => updateEdit(note.id, 'notes', e.target.value, note)}
                      className="w-full rounded-[5px] border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
                    />
                  </div>

                  {note.fileUrl && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Photo
                      </label>
                      <button onClick={() => setLightboxUrl(note.fileUrl)} className="focus:outline-none cursor-pointer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={note.fileUrl}
                          alt="Driver photo"
                          className="h-24 w-24 object-cover rounded-[5px] border border-gray-200 hover:opacity-80 transition"
                        />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleApprove(note)}
                      disabled={actioning === note.id}
                      className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-[5px] transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      {actioning === note.id ? 'Working…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(note)}
                      disabled={actioning === note.id}
                      className="flex-1 h-10 border border-gray-200 text-gray-600 bg-transparent hover:bg-gray-100 text-sm font-medium rounded-[5px] transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
