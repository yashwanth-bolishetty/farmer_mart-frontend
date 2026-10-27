import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'farmers-mart-cart';

function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const save = (next) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo(() => ({
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    total: items.reduce((total, item) => total + item.price * item.quantity, 0),
    add(product) {
      const existing = items.find((item) => item.product_id === product.product_id);
      if (existing) {
        save(items.map((item) => item.product_id === product.product_id
          ? { ...item, quantity: Math.min(item.quantity + 1, item.quantity_available) }
          : item));
      } else {
        save([...items, { ...product, quantity_available: Number(product.quantity), quantity: 1 }]);
      }
    },
    setQuantity(productId, quantity) {
      if (quantity <= 0) {
        save(items.filter((item) => item.product_id !== productId));
      } else {
        save(items.map((item) => item.product_id === productId
          ? { ...item, quantity: Math.min(quantity, item.quantity_available) }
          : item));
      }
    },
    remove(productId) {
      save(items.filter((item) => item.product_id !== productId));
    },
    clear() {
      save([]);
    },
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
