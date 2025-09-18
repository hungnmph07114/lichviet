import type { UserProfile } from '../types';

const STORAGE_KEY = 'aiCalendarUserProfile';

export const loadUserProfile = (): UserProfile | null => {
  try {
    const profileJSON = localStorage.getItem(STORAGE_KEY);
    return profileJSON ? JSON.parse(profileJSON) : null;
  } catch (error) {
    console.error("Error reading user profile from localStorage", error);
    return null;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    // Fix: Added curly braces to the catch block to correctly scope the error variable and fix a syntax error.
  } catch (error) {
    console.error("Error saving user profile to localStorage", error);
  }
};
