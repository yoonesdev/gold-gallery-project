import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById, getRelatedProducts } from "../services/ProductService";
import sellersData from "../data/sellers.json";
import ProductGrid from "../components/ProductGrid";
import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";

function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  const [added, setAdded] = useState(false);

  const product = useMemo(() => {
    return getProductById(id);
  }, [id]);

  useEffect(() => {
    setSelectedImage(null);
  }, [id]);

  const [selectedImage, setSelectedImage] = useState(null);

  const seller = useMemo(() => {
    if (!product) return null;

    return sellersData.find((item) => item.id === product.sellerId);
  }, [product]);

  if (!product) {
    return (
      <div dir="rtl" className="mx-auto max-w-[1126px] px-4 py-10">
        محصول پیدا نشد.
      </div>
    );
  }

  const currentImage = selectedImage || product.image;
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return getRelatedProducts(product.id, product.category);
  }, [product]);

  return (
    <PageContainer className="grid gap-8 lg:grid-cols-2 lg:gap-10 py-8 lg:py-10">
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
                onClick={() => setSelectedImage(image)}
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
        <SectionTitle margin="mb-6">{product.title}</SectionTitle>

        <div className="space-y-3">
          <p>
            قیمت: {product.price.toLocaleString("fa-IR")}
            تومان
          </p>

          <p>امتیاز: ⭐{product.rating}</p>

          <p>
            وزن: {product.weight}
            گرم
          </p>

          <p>عیار: {product.karat}</p>

          <p>توضیحات: {product.description}</p>
        </div>

        {seller && (
          <div className="mt-8 rounded-xl border p-4 sm:p-5">
            <p className="mb-4 font-bold">فروشنده: {seller.name}</p>

            <Link to={`/shop/${seller.id}`} className="text-pink-500">
              مشاهده فروشگاه
            </Link>
          </div>
        )}

        <button
          className="mt-8 w-full rounded-lg bg-pink-500 px-6 py-3 text-white hover:bg-pink-600 sm:w-auto"
          onClick={() => {
            addToCart(product);
            setAdded(true);

            setTimeout(() => setAdded(false), 1000);
          }}
        >
          {added ? "✔ اضافه شد" : "افزودن به سبد خرید"}
        </button>
      </div>

      <div className="col-span-full mt-16">
        <h2 className="mb-6 text-2xl font-bold">محصولات مرتبط</h2>

        <ProductGrid products={relatedProducts} />
      </div>
    </PageContainer>
  );
}

export default ProductPage;
