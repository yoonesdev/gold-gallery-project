import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-20 border-t bg-white">
      <div className="mx-auto max-w-[1126px] px-4 py-10">
        <div className="grid gap-8 text-center md:grid-cols-3 md:text-right">
          <div>
            <h3 className="mb-4 text-xl font-bold">دیجی‌جواهر</h3>

            <p className="text-gray-500">
              بازار آنلاین خرید و فروش طلا و جواهر
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-bold">دسترسی سریع</h3>

            <ul className="space-y-2 text-gray-500">
              <li>
                <Link to="/" className="hover:text-pink-500">
                  صفحه اصلی
                </Link>
              </li>

              <li>
                <Link to="/category/rings" className="hover:text-pink-500">
                  دسته بندی ها
                </Link>
              </li>

              <li>
                <Link to="/" className="hover:text-pink-500">
                  فروشگاه ها
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold">پشتیبانی</h3>

            <p className="text-gray-500">هفت روز هفته پاسخگوی شما هستیم.</p>
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-sm text-gray-500">
        © 2026 دیجی‌جواهر. تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}

export default Footer;
