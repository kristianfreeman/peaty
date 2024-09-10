import { create } from 'zustand';

interface Entry {
  id: number;
  date: string;
  time: string;
  temperature: number;
}

interface TemperatureStore {
  entries: Entry[];
  date: string;
  time: string;
  temperature: string;
  setEntries: (entries: Entry[]) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setTemperature: (temperature: string) => void;
  addEntry: (newEntry: Entry) => void;
  deleteEntry: (id: number) => void;
  resetForm: () => void;
}

const useStore = create<TemperatureStore>((set) => ({
  entries: [],
  date: new Date().toISOString().split('T')[0],
  time: '',
  temperature: '',

  setEntries: (entries) => set({ entries }),
  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),
  setTemperature: (temperature) => set({ temperature }),

  addEntry: (newEntry) => set((state) => ({ entries: [...state.entries, newEntry] })),
  deleteEntry: (id) => set((state) => ({ entries: state.entries.filter(entry => entry.id !== id) })),

  resetForm: () => set((_state) => ({
    date: new Date().toISOString().split('T')[0],
    time: '',
    temperature: '',
  })),
}));

export default useStore;

