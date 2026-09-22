import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { CartContext } from "../context/contexts";
import {
  getProductById,
  getRelatedProducts,
} from "../services/ProductService";
import { getProductPrice, formatToman } from "../services/PricingService";
import { getGoldPrice } from "../services/GoldPriceService";

import sellersData from "../data/sellers.json";

import ProductGrid from "../components/ProductGrid";
import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";

function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  const [added, setAdded] = useState(false);
  const [imageSelection, setImageSelection] = useState(null);

  const [goldPrice, setGoldPrice] = useState(null);
  const [goldPriceError, setGoldPriceError] = useState(false);

  const product = useMemo(() => {
    return getProductById(id);
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const fetchGoldPrice = async () => {
      try {
        const data = await getGoldPrice();

        if (isMounted) {
          setGoldPrice(data);
          setGoldPriceError(false);
        }
      } catch {
        if (isMounted) {
          setGoldPriceError(true);
        }
      }
    };

    fetchGoldPrice();

    const intervalId = setInterval(fetchGoldPrice, 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const seller = useMemo(() => {
    if (!product) return null;

    return sellersData.find(
      (item) => item.id === product.sellerId
    );
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return getRelatedProducts(
      product.id,
      product.category
    );
  }, [product]);

  if (!product) {
    return (
      <div
        dir="rtl"
        className="mx-auto max-w-[1126px] px-4 py-10"
      >
        محصول پیدا نشد.
      </div>
    );
  }

  const currentImage =
    imageSelection?.productId === product.id
      ? imageSelection.image
      : product.image;

  let productPrice = null;

  if (goldPrice && !goldPriceError) {
    productPrice = getProductPrice(product, goldPrice);
  } else {
    productPrice = {
      priceToman: product.price,
      mode: "fixed",
    };
  }

  return (
    <PageContainer className="grid gap-8 py-8 lg:grid-cols-2 lg:gap-10 lg:py-10">
      <div>
        <img
          src={currentImage}
          alt={product.title}
          className="mb-4 w-full rounded-xl"
        />

        {product.gallery && (
          <div className="flex flex-wrap gap-3">
            {product.gallery.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() =>
                  setImageSelection({
                    productId: product.id,
                    image,
                  })
                }
                className="overflow-hidden rounded-lg border"
              >
                <img
                  src={image}
                  alt={product.title}
                  className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionTitle margin="mb-6">
          {product.title}
        </SectionTitle>

        <div className="space-y-3">
          <p>
            قیمت:{" "}
            <strong>
              {formatToman(productPrice.priceToman)}
            </strong>
          </p>

          {productPrice.mode === "live" && (
            <p className="text-sm text-green-600">
              قیمت بر اساس نرخ لحظه‌ای طلای ۱۸ عیار
            </p>
          )}

          {goldPriceError && (
            <p className="text-sm text-orange-500">
              قیمت لحظه‌ای در دسترس نیست؛ قیمت پایه نمایش داده شد.
            </p>
          )}

          <p>امتیاز: ⭐{product.rating}</p>

          <p>
            وزن:{" "}
            {typeof product.weight === "number"
              ? `${product.weight} گرم`
              : "ثبت نشده"}
          </p>

          <p>
            عیار: {product.karat ?? "ثبت نشده"}
          </p>

          <p>
            توضیحات: {product.description}
          </p>
        </div>

        {seller && (
          <div className="mt-8 rounded-xl border p-4 sm:p-5">
            <p className="mb-4 font-bold">
              فروشنده: {seller.name}
            </p>

            <Link
              to={`/shop/${seller.id}`}
              className="text-pink-500"
            >
              مشاهده فروشگاه
            </Link>
          </div>
        )}

        <button
          className="mt-8 w-full rounded-lg bg-pink-500 px-6 py-3 text-white hover:bg-pink-600 sm:w-auto"
          onClick={() => {
            addToCart({
              ...product,
              price: productPrice.priceToman,
            });

            setAdded(true);

            setTimeout(() => setAdded(false), 1000);
          }}
        >
          {added ? "✔ اضافه شد" : "افزودن به سبد خرید"}
        </button>
      </div>

      <div className="col-span-full mt-16">
        <h2 className="mb-6 text-2xl font-bold">
          محصولات مرتبط
        </h2>

        <ProductGrid products={relatedProducts} />
      </div>
    </PageContainer>
  );
}

export default ProductPage;