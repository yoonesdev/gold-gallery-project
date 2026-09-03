import { useContext, useMemo, useState } from "react";
import { CartContext, AuthContext } from "../context/contexts";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import categories from "../constants/categories";
import MobileMenu from "./MobileMenu";

function Header() {
  const { cart, cartMessage } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="relative z-50 mx-auto flex max-w-[1126px] items-center justify-between gap-4 px-4 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-2xl md:hidden"
            aria-label={isMenuOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={isMenuOpen}
          >
            ☰
          </button>

          <Link to="/" className="text-2xl font-bold text-red-600">
            دیجی‌جواهر
          </Link>
        </div>

        {cartMessage && (
          <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 z-[9999] rounded-lg bg-green-500 px-4 py-2 text-white shadow animate-pulse">
            {cartMessage}
          </div>
        )}

        {/* Category Menu */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-bold text-gray-600">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={`/category/${cat.value}`}
              className="hover:text-pink-500"
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 px-6">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 text-sm font-bold text-gray-700">
          <Link to="/cart" className="whitespace-nowrap">
            🛒 سبد خرید ({totalItems})
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link className="text-pink-600" to="/account">
                  👤 {user.name}
                </Link>

                <button type="button" onClick={logout} className="text-red-500">
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link to="/login">ورود</Link>
                <Link to="/register">ثبت نام</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 md:hidden">
        <SearchBar />
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        user={user}
        logout={logout}
        onClose={() => setIsMenuOpen(false)}
      />
    </header>
  );
}

export default Header;
