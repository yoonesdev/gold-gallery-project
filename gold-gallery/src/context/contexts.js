import { createContext } from "react";

// Context objects live in their own module so provider files export components
// only. That keeps React Fast Refresh and ESLint happy during development.
export const AuthContext = createContext(null);
export const CartContext = createContext(null);
export const OrderContext = createContext(null);
export const WishlistContext = createContext(null);
