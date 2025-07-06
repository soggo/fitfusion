import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { LOCAL_STORAGE_KEYS } from '../utils/constants.js';

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isOpen: false,
      
      // Actions
      addItem: (product, selectedSize, selectedColor, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => 
              item.product.id === product.id && 
              item.selectedSize === selectedSize && 
              item.selectedColor.name === selectedColor.name
          );
          
          if (existingItemIndex > -1) {
            // Update quantity if item exists
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += quantity;
            return { items: updatedItems };
          } else {
            // Add new item
            const newItem = {
              id: `${product.id}-${selectedSize}-${selectedColor.name}`,
              product,
              selectedSize,
              selectedColor,
              quantity,
              addedAt: new Date().toISOString()
            };
            return { items: [...state.items, newItem] };
          }
        });
      },
      
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId)
        }));
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      openCart: () => {
        set({ isOpen: true });
      },
      
      closeCart: () => {
        set({ isOpen: false });
      },
      
      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },
      
      // Computed values
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },
      
      getItemCount: () => {
        const { items } = get();
        return items.length;
      },
      
      isProductInCart: (productId, size, color) => {
        const { items } = get();
        return items.some(
          (item) => 
            item.product.id === productId && 
            item.selectedSize === size && 
            item.selectedColor.name === color
        );
      },
      
      getCartItem: (productId, size, color) => {
        const { items } = get();
        return items.find(
          (item) => 
            item.product.id === productId && 
            item.selectedSize === size && 
            item.selectedColor.name === color
        );
      }
    }),
    {
      name: LOCAL_STORAGE_KEYS.CART,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore; 