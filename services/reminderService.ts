
import type { Reminder } from '../types';

const STORAGE_KEY = 'aiCalendarReminders';

const getReminders = (): Reminder[] => {
  try {
    const remindersJSON = localStorage.getItem(STORAGE_KEY);
    return remindersJSON ? JSON.parse(remindersJSON) : [];
  } catch (error) {
    console.error("Error reading reminders from localStorage", error);
    return [];
  }
};

const saveReminders = (reminders: Reminder[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error("Error saving reminders to localStorage", error);
  }
};

export const loadReminders = (): Reminder[] => {
    return getReminders();
}

export const addReminder = (newReminderData: Omit<Reminder, 'id'>): Reminder[] => {
  const reminders = getReminders();
  const newReminder: Reminder = {
    ...newReminderData,
    id: Date.now().toString(),
  };
  const updatedReminders = [...reminders, newReminder];
  saveReminders(updatedReminders);
  return updatedReminders;
};

export const deleteReminder = (reminderId: string): Reminder[] => {
  const reminders = getReminders();
  const updatedReminders = reminders.filter(r => r.id !== reminderId);
  saveReminders(updatedReminders);
  return updatedReminders;
};
