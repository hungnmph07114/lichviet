import React, { useState, useCallback, useEffect } from 'react';
import { CalendarView } from './components/CalendarView';
import { BaziAnalysis } from './components/BaziAnalysis';
import { IChingDivination } from './components/IChingDivination';
import { AIChat } from './components/AIChat';
import { Header } from './components/Header';
import { DayDetailModal } from './components/DayDetailModal';
import { ProfileView } from './components/ProfileView';
import type { View, Reminder, UserProfile, ChatMessage } from './types';
import { CalendarIcon, SparklesIcon, BookOpenIcon, ChatBubbleIcon, UserCircleIcon } from './components/icons';
import { loadReminders, addReminder, deleteReminder } from './services/reminderService';
import { loadUserProfile, saveUserProfile } from './services/profileService';
import { resetChatSession } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('CALENDAR');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Xin chào! Bạn muốn hỏi gì về lịch, tử vi, hay văn hoá Việt Nam hôm nay?' }
  ]);


  useEffect(() => {
    setReminders(loadReminders());
    setUserProfile(loadUserProfile());
  }, []);
  
  const handleAddReminder = useCallback((newReminderData: Omit<Reminder, 'id'>) => {
    const updatedReminders = addReminder(newReminderData);
    setReminders(updatedReminders);
  }, []);

  const handleDeleteReminder = useCallback((reminderId: string) => {
    const updatedReminders = deleteReminder(reminderId);
    setReminders(updatedReminders);
  }, []);

  const handleSaveProfile = useCallback((profile: UserProfile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
    resetChatSession(); // Reset chat to apply new user context
    // Reset chat history when profile changes
    setChatMessages([
        { role: 'model', text: `Chào ${profile.name}, thông tin của bạn đã được cập nhật. Bạn muốn hỏi gì tiếp theo?` }
    ]);
  }, []);
  
  const handleDayClick = useCallback((day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDate(null);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'BAZI':
        return <BaziAnalysis userProfile={userProfile} />;
      case 'ICHING':
        return <IChingDivination />;
      case 'CHAT':
        return <AIChat userProfile={userProfile} messages={chatMessages} setMessages={setChatMessages} />;
      case 'PROFILE':
        return <ProfileView userProfile={userProfile} onSaveProfile={handleSaveProfile} />;
      case 'CALENDAR':
      default:
        return <CalendarView onDayClick={handleDayClick} reminders={reminders} />;
    }
  };
  
  const navItems = [
      { id: 'CALENDAR', label: 'Lịch Vạn Niên', icon: <CalendarIcon /> },
      { id: 'BAZI', label: 'Tử Vi Bát Tự', icon: <SparklesIcon /> },
      { id: 'ICHING', label: 'Kinh Dịch', icon: <BookOpenIcon /> },
      { id: 'CHAT', label: 'Hỏi Đáp AI', icon: <ChatBubbleIcon /> },
      { id: 'PROFILE', label: 'Cá Nhân', icon: <UserCircleIcon className="w-6 h-6" /> },
  ] as const;

  const remindersForSelectedDate = selectedDate 
    ? reminders.filter(r => r.date === selectedDate.toISOString().split('T')[0])
    : [];

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 flex flex-col">
      <Header 
        navItems={navItems}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
      {isModalOpen && selectedDate && (
        <DayDetailModal 
            date={selectedDate} 
            onClose={closeModal}
            reminders={remindersForSelectedDate}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
        />
      )}
    </div>
  );
};

export default App;