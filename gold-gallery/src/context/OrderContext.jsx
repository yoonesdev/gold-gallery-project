
import { useState, useEffect, useContext } from "react";

import { OrderContext, AuthContext } from "./contexts";

const API_BASE_URL = "http://localhost:5000";

export const OrderProvider = ({ children }) => {
  const { token } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchOrders() {
      if (!token) {
        setOrders([]);
        setError("");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to fetch orders.",
          );
        }

        if (active) {
          setOrders(result.data);
        }
      } catch (err) {
        if (active) {
          console.error("Fetch orders error:", err.message);
          setOrders([]);
          setError(err.message || "Unable to fetch orders.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      active = false;
    };
  }, [token]);

  const addOrder = (order) => {
    setOrders((prev) => [order, ...prev]);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        loading,
        error,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
