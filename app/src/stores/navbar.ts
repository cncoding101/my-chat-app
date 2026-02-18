import { create } from 'zustand';

const STORAGE_KEY = 'userPreferences';

interface NavbarState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const getStoredSidebarState = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const prefs = JSON.parse(stored);
      return prefs?.sidebar?.isOpen ?? true;
    }
  } catch {
    // Ignore parse errors
  }
  return true;
};

const persistSidebarState = (isOpen: boolean) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefs = stored ? JSON.parse(stored) : { sidebar: {}, chat: {} };
    prefs.sidebar = { isOpen };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
};

export const useNavbarStore = create<NavbarState>((set) => ({
  isOpen: getStoredSidebarState(),

  toggle: () =>
    set((state) => {
      const next = !state.isOpen;
      persistSidebarState(next);
      return { isOpen: next };
    }),

  open: () =>
    set(() => {
      persistSidebarState(true);
      return { isOpen: true };
    }),

  close: () =>
    set(() => {
      persistSidebarState(false);
      return { isOpen: false };
    }),
}));
