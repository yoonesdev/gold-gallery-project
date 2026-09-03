import { Link } from "react-router-dom";
import categories from "../constants/categories";

function MobileMenu({ isOpen, user, logout, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="border-t bg-white md:hidden">
      <div className="flex flex-col p-4">
        {/* Categories */}
        <div className="mb-4 flex flex-col gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={`/category/${cat.value}`}
              onClick={onClose}
              className="font-medium text-gray-700 hover:text-pink-500"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        <hr className="my-2" />

        {/* Account */}
        <div className="mt-2 flex flex-col gap-3">
          {user ? (
            <>
              <Link
                className="font-medium text-pink-600"
                to="/account"
                onClick={onClose}
              >
                👤 {user.name}
              </Link>

              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-right text-red-500"
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={onClose}>
                ورود
              </Link>

              <Link to="/register" onClick={onClose}>
                ثبت نام
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
