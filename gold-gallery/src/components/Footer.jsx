function Footer() {

  return (

    <footer className="mt-20 border-t bg-white">

      <div className="mx-auto max-w-[1126px] px-4 py-10">

        <div className="grid gap-8 md:grid-cols-3">

          <div>

            <h3 className="mb-4 text-xl font-bold">

              دیجی‌جواهر

            </h3>

            <p className="text-gray-500">

              بازار آنلاین خرید و فروش طلا و جواهر

            </p>

          </div>

          <div>

            <h3 className="mb-4 font-bold">

              دسترسی سریع

            </h3>

            <ul className="space-y-2 text-gray-500">

              <li>

                صفحه اصلی

              </li>

              <li>

                دسته بندی ها

              </li>

              <li>

                فروشگاه ها

              </li>

            </ul>

          </div>

          <div>

            <h3 className="mb-4 font-bold">

              پشتیبانی

            </h3>

            <p className="text-gray-500">

              هفت روز هفته پاسخگوی شما هستیم.

            </p>

          </div>

        </div>

      </div>

    </footer>

  );
}

export default Footer;