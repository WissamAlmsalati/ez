import { create } from "zustand";

type State = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useCreateModalStore = create<State>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));
