import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

function HomeSection({ 
    title, 
    products, 
    carouselRef, 
    scrollCarousel, 
    addToCart,
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="border-r-4 border-pink-500 pr-3 text-base font-bold text-gray-800 sm:text-lg">
          {title}
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollCarousel(carouselRef, "left")}
            className="rounded-xl border bg-white px-3 py-2 text-lg shadow transition hover:shadow-md sm:px-6 sm:text-xl"
          >
            ←
          </button>

          <button
            onClick={() => scrollCarousel(carouselRef, "right")}
            className="rounded-xl border bg-white px-3 py-2 text-lg shadow transition hover:shadow-md sm:px-6 sm:text-xl"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex w-[220px] min-w-[220px] flex-col overflow-hidden rounded-xl bg-white shadow-sm sm:w-[258px] sm:min-w-[258px]"
          >
            <Link to={`/product/${product.id}/${product.slug}`}>
              <ProductCard product={product} />
            </Link>

            <button
              onClick={() => addToCart(product)}
              className="mt-auto w-full bg-pink-500 px-4 py-3 text-white cursor-pointer"
            >
              افزودن به سبد
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomeSection;