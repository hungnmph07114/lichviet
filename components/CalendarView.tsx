import React, { useState, useMemo, useCallback, useRef } from 'react';
import type { Reminder } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, BellIcon } from './icons';
import { getLunarDateString } from '../utils/lunarCalculator';
import { DayInfoPopover } from './DayInfoPopover';

interface CalendarViewProps {
  onDayClick: (date: Date) => void;
  reminders: Reminder[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onDayClick, reminders }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  
  const remindersByDate = useMemo(() => {
    const map = new Map<string, number>();
    reminders.forEach(reminder => {
      const dateKey = reminder.date; // reminders are already in YYYY-MM-DD
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
    });
    return map;
  }, [reminders]);

  const calendarGrid = useMemo(() => {
    const days = [];
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const handleDayHover = useCallback((e: React.MouseEvent, day: Date) => {
    const dateStr = day.toISOString().split('T')[0];
    if (!remindersByDate.has(dateStr)) return;

    const target = e.currentTarget as HTMLElement;
    const container = containerRef.current;
    if (!container) return;

    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const top = targetRect.top - containerRect.top - 10;
    const left = targetRect.left - containerRect.left + targetRect.width / 2;

    setHoveredDate(day);
    setPopoverStyle({
      top: `${top}px`,
      left: `${left}px`,
      transform: 'translate(-50%, -100%)',
      pointerEvents: 'none',
    });
  }, [remindersByDate]);

  const handleDayLeave = useCallback(() => {
    setHoveredDate(null);
  }, []);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date
  const todayStr = today.toISOString().split('T')[0];

  const remindersForHoveredDate = hoveredDate
    ? reminders.filter(r => r.date === hoveredDate.toISOString().split('T')[0])
    : [];

  return (
    <div ref={containerRef} className="relative bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
          <ChevronLeftIcon />
        </button>
        <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-amber-400 capitalize">
            {currentDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
            </h2>
        </div>
        <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
          <ChevronRightIcon />
        </button>
      </div>

      <div className="h-12 flex items-center justify-center">
        {/* Error and loading section removed as it's no longer needed */}
      </div>
      
      <>
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-slate-400 mb-2">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
              <div key={day}>{day}</div>
              ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarGrid.map((day, index) => {
              day.setHours(0,0,0,0);
              const dateStr = day.toISOString().split('T')[0];
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = dateStr === todayStr;
              const hasReminder = remindersByDate.has(dateStr);
              const lunarDate = getLunarDateString(day); // Calculate directly
              const isFirstLunarDay = lunarDate?.includes('/') || lunarDate === '1';

              return (
                  <div key={index} className="relative aspect-square">
                  <button
                      onClick={() => onDayClick(day)}
                      onMouseEnter={(e) => handleDayHover(e, day)}
                      onMouseLeave={handleDayLeave}
                      className={`w-full h-full flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1
                      ${isCurrentMonth ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-700/50'}
                      ${isToday ? 'bg-amber-500/30 text-amber-300 font-bold ring-1 ring-amber-500' : ''}
                      `}
                  >
                      <span className="text-base">{day.getDate()}</span>
                      <span className={`text-xs h-4 flex items-center justify-center ${isFirstLunarDay ? 'text-amber-500 font-semibold' : 'text-slate-400'}`}>
                          {lunarDate}
                      </span>
                  </button>
                  {hasReminder && (
                      <BellIcon className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-cyan-400 pointer-events-none" />
                  )}
                  </div>
              );
              })}
          </div>
      </>
      
      {hoveredDate && remindersForHoveredDate.length > 0 && (
          <DayInfoPopover
            date={hoveredDate}
            reminders={remindersForHoveredDate}
            style={popoverStyle}
          />
        )}
    </div>
  );
};