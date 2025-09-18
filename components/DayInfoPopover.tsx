import React from 'react';
import type { Reminder } from '../types';

interface DayInfoPopoverProps {
  date: Date;
  reminders: Reminder[];
  // position style might be passed as props
  style?: React.CSSProperties;
}

export const DayInfoPopover: React.FC<DayInfoPopoverProps> = ({ date, reminders, style }) => {
  const formattedDate = date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div
      className="absolute z-20 w-64 p-3 bg-slate-700 text-white rounded-lg shadow-xl border border-slate-600"
      style={style}
    >
      <p className="font-bold text-amber-400">{formattedDate}</p>
      <hr className="border-slate-500 my-2" />
      {reminders.length > 0 ? (
        <ul className="space-y-1">
          {reminders.map(reminder => (
            <li key={reminder.id} className="text-sm flex items-center gap-2">
              <span className="text-cyan-400">{reminder.time}</span>
              <span className="truncate">{reminder.description}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400 italic">Không có lời nhắc.</p>
      )}
    </div>
  );
};
