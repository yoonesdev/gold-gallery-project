import { useContext } from "react";
import { AuthContext } from "../context/contexts";
import { Link } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";

function AccountPage() {
  const { user } = useContext(AuthContext);
  return (
    <PageContainer>
      <SectionTitle>حساب کاربری</SectionTitle>

      {user ? (
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
          <p>👤 نام: {user.name}</p>
          <p>📧 ایمیل: {user.email}</p>
        </div>
      ) : (
        <div className="mb-6 rounded-xl bg-white p-4 text-red-500 shadow-sm sm:p-6">
          کاربر وارد نشده است
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/orders">
          <div className="rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer sm:p-6">
            📦 سفارش‌های من
          </div>
        </Link>

        <div className="rounded-xl bg-white p-4 shadow-sm cursor-not-allowed transition opacity-60 sm:p-6">
          ❤️ علاقه‌مندی‌ها
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm cursor-not-allowed transition opacity-60 sm:p-6">
          👤 اطلاعات حساب
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm cursor-not-allowed transition opacity-60 sm:p-6">
          ⚙️ تنظیمات
        </div>
      </div>
    </PageContainer>
  );
}

export default AccountPage;
