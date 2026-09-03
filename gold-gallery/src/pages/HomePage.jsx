import { useRef, useMemo, useContext } from "react";
import { CartContext } from "../context/contexts";
import { getProducts } from "../services/ProductService";
import HomeSection from "../components/HomeSection";

function HomePage() {
  const { addToCart } = useContext(CartContext);

  const latestRef = useRef(null);
  const discountRef = useRef(null);
  const bestSellerRef = useRef(null);
  const popularRef = useRef(null);

  const products = getProducts();

  const latestProducts = useMemo(
    () => products.filter(({ isNew }) => isNew),
    [products],
  );

  const discountedProducts = useMemo(
    () => products.filter((p) => p.discountPercentage > 0),
    [products],
  );

  const bestSellerProducts = useMemo(
    () =>
      [...products]
        .filter((p) => p.isBestSeller)
        .sort((a, b) => b.salesCount - a.salesCount),
    [products],
  );

  const popularProducts = useMemo(
    () => [...products].sort((a, b) => b.popularity - a.popularity),
    [products],
  );

  // scroll carousel
  const scrollCarousel = (ref, direction) => {
    if (!ref.current) return;

    const SCROLL_AMOUNT = 276;

    ref.current.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 font-sans">
      <main className="mx-auto max-w-[1126px] px-4 py-6">
        <HomeSection
          title="تازه‌ها ✨"
          products={latestProducts}
          carouselRef={latestRef}
          scrollCarousel={scrollCarousel}
          addToCart={addToCart}
        />

        <HomeSection
          title="تخفیف‌دارها"
          products={discountedProducts}
          carouselRef={discountRef}
          scrollCarousel={scrollCarousel}
          addToCart={addToCart}
        />

        <HomeSection
          title="پرفروش‌ها"
          products={bestSellerProducts}
          carouselRef={bestSellerRef}
          scrollCarousel={scrollCarousel}
          addToCart={addToCart}
        />

        <HomeSection
          title="محبوب‌ترین‌ها"
          products={popularProducts}
          carouselRef={popularRef}
          scrollCarousel={scrollCarousel}
          addToCart={addToCart}
        />
      </main>
    </div>
  );
}

export default HomePage;
