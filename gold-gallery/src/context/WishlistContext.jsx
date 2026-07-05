import { createContext, useEffect, useState } from "react";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");

    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "wishlist",

      JSON.stringify(wishlist),
    );
  }, [wishlist]);

  const toggleWishlist = (product) => {
    const exist = wishlist.find(
      (item) => item.id === product.id,
    );

    if (exist) {
      setWishlist((prev) =>
        prev.filter(
          (item) => item.id !== product.id,
        ),
      );

      return;
    }

    setWishlist((prev) => [
      ...prev,

      product,
    ]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,

        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};