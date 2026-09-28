import { useEffect, useState } from "react";
import { CartContext } from "./contexts";

export const CartProvider = ({ children }) => {
  const [cartMessage, setCartMessage] = useState(null);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");

    if (!saved) {
      return [];
    }

    try {
      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((item) => {
          // Support the old cart format during migration.
          if (
            typeof item.productId === "number" &&
            typeof item.quantity === "number"
          ) {
            return {
              productId: item.productId,
              quantity: item.quantity,
            };
          }

          if (
            typeof item.id === "number" &&
            typeof item.quantity === "number"
          ) {
            return {
              productId: item.id,
              quantity: item.quantity,
            };
          }

          return null;
        })
        .filter(
          (item) =>
            item &&
            item.quantity > 0
        );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existIndex = prev.findIndex(
        (item) =>
          item.productId === product.id
      );

      if (existIndex !== -1) {
        const updated = [...prev];

        updated[existIndex] = {
          ...updated[existIndex],
          quantity:
            updated[existIndex].quantity + 1,
        };

        return updated;
      }

      return [
        ...prev,
        {
          productId: product.id,
          quantity: 1,
        },
      ];
    });

    setCartMessage("محصول به سبد اضافه شد");

    setTimeout(
      () => setCartMessage(null),
      1500
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          item.productId !== productId
      )
    );
  };

  const increase = (productId) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  };

  const decrease = (productId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
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