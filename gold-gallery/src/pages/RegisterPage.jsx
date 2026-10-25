
import { useState, useContext } from "react";
import { AuthContext } from "../context/contexts";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("لطفاً تمام فیلدها را تکمیل کنید.");
      return;
    }

    try {
      setIsSubmitting(true);

      await register(name.trim(), email.trim(), password);

      navigate("/", { replace: true });
    } catch (error) {
      setError(
        error.message || "ثبت‌نام ناموفق بود. دوباره تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="mx-auto max-w-[500px] px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">ثبت نام</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="نام"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
          className="w-full rounded-lg border p-3"
        />

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
          placeholder="رمز عبور (حداقل ۸ کاراکتر)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
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
          {isSubmitting ? "در حال ساخت حساب..." : "ساخت حساب"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
