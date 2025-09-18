import React, { useState, useCallback } from 'react';
import type { Reminder, DayDetails } from '../types';
import { getAstrologicalDetails } from '../utils/astrologyCalculator';
import { getLunarDateString } from '../utils/lunarCalculator';
import { XIcon, TrashIcon, ClockIcon, StarIcon, ShieldExclamationIcon, PlusCircleIcon } from './icons';

interface DayDetailModalProps {
  date: Date;
  onClose: () => void;
  reminders: Reminder[];
  onAddReminder: (newReminder: Omit<Reminder, 'id'>) => void;
  onDeleteReminder: (reminderId: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  date,
  onClose,
  reminders,
  onAddReminder,
  onDeleteReminder
}) => {
  const [newReminderTime, setNewReminderTime] = useState('12:00');
  const [newReminderDesc, setNewReminderDesc] = useState('');

  // Get details synchronously from the local calculator instead of fetching from an API.
  const details: DayDetails = getAstrologicalDetails(date);

  const handleAddReminder = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderDesc.trim()) return;
    onAddReminder({
      date: date.toISOString().split('T')[0],
      time: newReminderTime,
      description: newReminderDesc,
    });
    setNewReminderDesc('');
  }, [onAddReminder, date, newReminderTime, newReminderDesc]);

  const formattedDate = date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const localLunarDate = getLunarDateString(date);

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-fast"
        onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-amber-400">{formattedDate}</h2>
            <p className="text-slate-400">{`Âm lịch: ${localLunarDate}`}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700">
            <XIcon />
          </button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto space-y-6">
          {/* No more loading or error states needed */}
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <p className="text-lg text-center font-semibold">{details.dayCanChi}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h3 className="font-semibold text-slate-300 flex items-center gap-2"><ClockIcon /> Giờ Hoàng Đạo</h3>
                    <p className="text-sm text-slate-400 bg-slate-700/50 p-2 rounded-md">{details.goodHours.join(', ')}</p>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold text-slate-300 flex items-center gap-2"><ClockIcon /> Giờ Hắc Đạo</h3>
                    <p className="text-sm text-slate-400 bg-slate-700/50 p-2 rounded-md">{details.badHours.join(', ')}</p>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold text-slate-300 flex items-center gap-2"><StarIcon /> Sao Tốt</h3>
                    <ul className="text-sm text-slate-400 space-y-1">{details.goodStars.map(s => <li key={s.name}>{s.name}: {s.meaning}</li>)}</ul>
                </div>
                 <div className="space-y-2">
                    <h3 className="font-semibold text-slate-300 flex items-center gap-2"><ShieldExclamationIcon /> Sao Xấu</h3>
                    <ul className="text-sm text-slate-400 space-y-1">{details.badStars.map(s => <li key={s.name}>{s.name}: {s.meaning}</li>)}</ul>
                </div>
            </div>
          </div>
          
          {/* Reminders Section */}
          <div>
            <h3 className="font-semibold text-slate-300 mb-2">Lời Nhắc</h3>
            <div className="space-y-2">
              {reminders.length > 0 ? (
                reminders.sort((a, b) => a.time.localeCompare(b.time)).map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-cyan-400">{r.time}</span>
                      <p>{r.description}</p>
                    </div>
                    <button onClick={() => onDeleteReminder(r.id)} className="p-1 text-slate-400 hover:text-red-400 rounded-full">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">Không có lời nhắc cho ngày này.</p>
              )}
            </div>
            {/* Add reminder form */}
            <form onSubmit={handleAddReminder} className="mt-4 flex items-center gap-2 border-t border-slate-700 pt-3">
               <input 
                 type="time"
                 value={newReminderTime}
                 onChange={(e) => setNewReminderTime(e.target.value)}
                 className="bg-slate-700 border border-slate-600 rounded-md p-2 w-28"
               />
               <input
                 type="text"
                 value={newReminderDesc}
                 onChange={(e) => setNewReminderDesc(e.target.value)}
                 placeholder="Thêm lời nhắc mới..."
                 className="flex-grow bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-amber-500 focus:border-amber-500"
               />
               <button type="submit" className="p-2 text-amber-400 hover:text-amber-300 disabled:text-slate-600" disabled={!newReminderDesc.trim()}>
                 <PlusCircleIcon />
               </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};
