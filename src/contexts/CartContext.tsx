
import { createContext, useContext, useReducer, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

// Product interface
export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
  code?: string;
  description?: string;
  user_id?: string;
  is_public?: boolean;
}

// Cart item interface
export interface CartItem {
  product: Product;
  quantity: number;
}

// Cart state interface
interface CartState {
  items: CartItem[];
  user: User | null;
  isOpen: boolean;
}

// Cart actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

// Cart context interface
interface CartContextType {
  state: CartState;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  openCart: () => void;
  closeCart: () => void;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Reducer function
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === action.payload.id
      );

      if (existingItemIndex !== -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
        return { ...state, items: updatedItems };
      } else {
        return {
          ...state,
          items: [...state.items, { product: action.payload, quantity: 1 }],
        };
      }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.product.id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };
      
    case 'OPEN_CART':
      return { ...state, isOpen: true };
      
    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

// Provider component
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // Get user from auth context
  const { user } = useAuth();
  
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    user: user,
    isOpen: false
  });

  // Add item to cart
  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  // Open cart
  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };
  
  // Close cart
  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  // Calculate total price
  const getTotalPrice = (): number => {
    return state.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  // Calculate total items
  const getTotalItems = (): number => {
    return state.items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
  };

  const value = useMemo(() => ({
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    openCart,
    closeCart,
  }), [state]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for using cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
