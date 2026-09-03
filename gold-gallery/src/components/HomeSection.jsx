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
            className="flex h-11 w-11 items-center justify-center rounded-xl border bg-white text-lg shadow transition hover:shadow-md sm:h-12 sm:w-12 sm:text-xl cursor-pointer"
          >
            ←
          </button>

          <button
            onClick={() => scrollCarousel(carouselRef, "right")}
            className="flex h-11 w-11 items-center justify-center rounded-xl border bg-white text-lg shadow transition hover:shadow-md sm:h-12 sm:w-12 sm:text-xl cursor-pointer"
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
            className="flex w-[220px] shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-sm sm:w-[258px]"
          >
            <ProductCard product={product} />

            <button
              onClick={() => addToCart(product)}
              className="mt-auto w-full cursor-pointer bg-pink-500 px-4 py-3 text-white transition-colors hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
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
