
import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";
const REFRESH_INTERVAL = 60 * 1000;

export function useCartPricePreview(cart) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cart.length === 0) {
      setPrices({});
      setLoading(false);
      setError("");
      return;
    }

    let isMounted = true;

    async function fetchPrices() {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.all(
          cart.map(async (item) => {
            const response = await fetch(
              `${API_BASE_URL}/api/products/${item.productId}/price`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
              throw new Error(
                result.message ||
                  `Unable to fetch price for product ${item.productId}`
              );
            }

            return {
              productId: item.productId,
              ...result.data,
            };
          })
        );

        if (!isMounted) return;

        const priceMap = {};

        for (const result of results) {
          priceMap[result.productId] = result;
        }

        setPrices(priceMap);
      } catch (err) {
        if (!isMounted) return;

        setError(
          err.message ||
            "Unable to fetch product prices."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPrices();

    const intervalId = setInterval(
      fetchPrices,
      REFRESH_INTERVAL
    );

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [cart]);

  const allPricesAvailable =
    cart.length > 0 &&
    cart.every(
      (item) =>
        prices[item.productId] &&
        Number.isFinite(
          prices[item.productId].priceToman
        )
    );

  const totalPrice = allPricesAvailable
    ? cart.reduce(
        (total, item) =>
          total +
          prices[item.productId].priceToman *
            item.quantity,
        0
      )
    : null;

  return {
    prices,
    loading,
    error,
    allPricesAvailable,
    totalPrice,
  };
}