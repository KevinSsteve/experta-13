
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';

// Definindo tipos
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  code?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

interface CartContextType {
  state: CartState;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// Criando o contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Definindo o estado inicial
const initialState: CartState = {
  items: [],
  isOpen: false,
};

// Criando o reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === action.payload.id
      );

      if (existingItemIndex > -1) {
        // Se o item já existe, atualize a quantidade
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        return { ...state, items: updatedItems };
      } else {
        // Se o item não existe, adicione-o
        return {
          ...state,
          items: [...state.items, { product: action.payload, quantity: 1 }],
        };
      }
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.product.id !== action.payload),
      };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.product.id !== action.payload.id),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
      };
    }
    case 'OPEN_CART': {
      return {
        ...state,
        isOpen: true,
      };
    }
    case 'CLOSE_CART': {
      return {
        ...state,
        isOpen: false,
      };
    }
    default:
      return state;
  }
}

// Provider Component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    // Recuperar o carrinho do localStorage ao inicializar
    const savedCart = localStorage.getItem('moloja-cart');
    return savedCart ? { ...initialState, items: JSON.parse(savedCart) } : initialState;
  });

  // Salvar o carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('moloja-cart', JSON.stringify(state.items));
  }, [state.items]);

  // Métodos do carrinho
  const addItem = (product: Product) => {
    if (product.stock > 0) {
      dispatch({ type: 'ADD_ITEM', payload: product });
      toast.success(`${product.name} adicionado ao carrinho`);
    } else {
      toast.error(`${product.name} está fora de estoque`);
    }
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    toast.info('Item removido do carrinho');
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.info('Carrinho limpo');
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const getTotalItems = (): number => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = (): number => {
    return state.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook para usar o contexto
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }

  return context;
};
