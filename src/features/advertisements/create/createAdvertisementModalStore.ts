import { create } from "zustand";

interface State {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useCreateAdvertisementModal = create<State>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));
