import { create } from "zustand";

interface AddFeaturedProductModalState {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useAddFeaturedProductModal = create<AddFeaturedProductModalState>(
  (set) => ({
    open: false,
    openModal: () => set({ open: true }),
    closeModal: () => set({ open: false }),
  })
);
