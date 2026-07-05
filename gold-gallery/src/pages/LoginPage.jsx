import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  console.log(location);
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("ایمیل و رمز عبور را وارد کنید");
      return;
    }

    login(email, password);
    navigate(from, { replace: true });
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
          className="w-full rounded-lg border p-3"
        />

        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-pink-500 py-3 text-white"
        >
          ورود
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
