  import { useEffect, useState } from "react";
  import { CartContext } from "./contexts";

  export const CartProvider = ({ children }) => {
    const [cartMessage, setCartMessage] = useState(null);

    const [cart, setCart] = useState(() => {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
      localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
      setCart((prev) => {
        const existIndex = prev.findIndex((i) => i.id === product.id);

        // اگر محصول وجود دارد → فقط quantity زیاد شود
        if (existIndex !== -1) {
          const updated = [...prev];

          updated[existIndex] = {
            ...updated[existIndex],
            quantity: updated[existIndex].quantity + 1,
          };

          return updated;
        }

        // اگر وجود ندارد → اضافه شود
        return [...prev, { ...product, quantity: 1 }];
      });
      
      setCartMessage("محصول به سبد اضافه شد");
      setTimeout(() => setCartMessage(null), 1500);
    };

    const removeFromCart = (id) => {
      setCart((prev) => prev.filter((i) => i.id !== id));
    };

    const increase = (id) => {
      setCart((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
      );
    };

    const decrease = (id) => {
      setCart((prev) =>
        prev
          .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
          .filter((i) => i.quantity > 0),
      );
    };

    const clearCart = () => {
      setCart([]);
    };

    return (
      <CartContext.Provider
        value={{
          cart,
          addToCart,
          removeFromCart,
          increase,
          decrease,
          clearCart,
          cartMessage,
        }}
      >
        {children}
      </CartContext.Provider>
    );
  };
