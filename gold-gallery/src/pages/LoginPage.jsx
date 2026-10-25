
import { useState, useContext } from "react";
import { AuthContext } from "../context/contexts";
import { useNavigate, useLocation } from "react-router-dom";

function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("ایمیل و رمز عبور را وارد کنید");
      return;
    }

    try {
      setIsSubmitting(true);

      await login(email.trim(), password);

      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message || "ورود ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="mx-auto max-w-[500px] px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">ورود</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="ایمیل"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className="w-full rounded-lg border p-3"
        />

        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full rounded-lg border p-3"
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-pink-500 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
