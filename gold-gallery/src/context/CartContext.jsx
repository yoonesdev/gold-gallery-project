import { useEffect, useRef, useState } from "react";
import { CartContext } from "./contexts";

const MAX_QUANTITY = 99;

function loadCart() {
  try {
    const saved = localStorage.getItem("cart");

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalizedCart = new Map();

    for (const item of parsed) {
      const productId = item?.productId ?? item?.id;
      const quantity = item?.quantity;

      if (
        !Number.isSafeInteger(productId) ||
        productId <= 0 ||
        !Number.isSafeInteger(quantity) ||
        quantity <= 0
      ) {
        continue;
      }

      const existingQuantity =
        normalizedCart.get(productId) ?? 0;

      normalizedCart.set(
        productId,
        Math.min(
          existingQuantity + quantity,
          MAX_QUANTITY,
        ),
      );
    }

    return Array.from(
      normalizedCart,
      ([productId, quantity]) => ({
        productId,
        quantity,
      }),
    );
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }) => {
  const [cartMessage, setCartMessage] = useState(null);
  const [cart, setCart] = useState(loadCart);

  const messageTimeoutRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch {
      // The cart still works in memory if storage is unavailable.
    }
  }, [cart]);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const showCartMessage = (message) => {
    setCartMessage(message);

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = setTimeout(() => {
      setCartMessage(null);
      messageTimeoutRef.current = null;
    }, 1500);
  };

  const addToCart = (product) => {
    const productId = product?.id;

    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0
    ) {
      return;
    }

    const existingItem = cart.find(
      (item) => item.productId === productId,
    );

    if (existingItem?.quantity >= MAX_QUANTITY) {
      showCartMessage("حداکثر تعداد مجاز این محصول ثبت شده است");
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === productId,
      );

      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  MAX_QUANTITY,
                ),
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          productId,
          quantity: 1,
        },
      ];
    });

    showCartMessage("محصول به سبد اضافه شد");
  };

  const removeFromCart = (productId) => {
    setCart((prev) =>
      prev.filter(
        (item) => item.productId !== productId,
      ),
    );
  };

  const increase = (productId) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                MAX_QUANTITY,
              ),
            }
          : item,
      ),
    );
  };

  const decrease = (productId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
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