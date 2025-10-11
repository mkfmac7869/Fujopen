import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('hotelCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('hotelCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (booking) => {
    const newItem = {
      ...booking,
      cartId: Date.now().toString(),
      addedAt: new Date().toISOString(),
    };
    setCartItems([...cartItems, newItem]);
    return true;
  };

  const removeFromCart = (cartId) => {
    setCartItems(cartItems.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    cartCount: cartItems.length,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

