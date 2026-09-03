import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { getProductsBySeller } from "../services/ProductService";
import { getSellerById } from "../services/SellerService";
import FilterBar from "../components/FilterBar";
import useShopFilters from "../hooks/useShopFilters";
import categories from "../constants/categories";
import ProductGrid from "../components/ProductGrid";
import { categoryMap, sortMap } from "../constants/categories";
import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";

function ShopPage() {
  const { sellerId } = useParams();
  const {
    sort,
    category,
    setSort,
    setCategory,
    clearFilters,
  } = useShopFilters();

  const seller = useMemo(() => {
    return getSellerById(sellerId);
  }, [sellerId]);

  const sellerProducts = useMemo(() => {
    let products = getProductsBySeller(sellerId);

    // CATEGORY FILTER
    if (category) {
      products = products.filter((p) => p.category === category);
    }

    // SORT
    switch (sort) {
      case "price-low":
        products = [...products].sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        products = [...products].sort((a, b) => b.price - a.price);
        break;

      case "popular":
        products = [...products].sort((a, b) => b.popularity - a.popularity);
        break;

      case "new":
        products = [...products].sort((a, b) => b.isNew - a.isNew);
        break;
    }

    return products;
  }, [sellerId, sort, category]);

  if (!seller) {
    return (
      <div dir="rtl" className="mx-auto max-w-[1126px] px-4 py-10">
        فروشنده پیدا نشد.
      </div>
    );
  }

  return (
    <PageContainer>
      <SectionTitle>{seller.name}</SectionTitle>

      <div className="mb-8 space-y-2">
        <p>شهر: {seller.city}</p>

        <p>امتیاز: ⭐{seller.rate}</p>
      </div>

      <h2 className="mb-6 text-xl font-bold sm:text-2xl">محصولات فروشگاه</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        {category && (
          <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm">
            {categoryMap[category]}
            <button
              className="ml-2 text-red-500"
              onClick={() => setCategory("")}
            >
              ×
            </button>
          </span>
        )}

        {sort && (
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
            {sortMap[sort]}
            <button
              className="ml-2 text-red-500"
              onClick={() => setSort("")}
            >
              ×
            </button>
          </span>
        )}
      </div>
      <button
        onClick={() => clearFilters()}
        className="text-sm text-blue-500 underline"
      >
        پاک کردن همه فیلترها
      </button>

      <FilterBar
        sort={sort}
        setSort={setSort}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("")}
          className={`rounded border px-3 py-1 ${
            category === "" ? "bg-pink-500 text-white" : ""
          }`}
        >
          همه
        </button>

        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`rounded border px-3 py-1 ${
              category === cat.value ? "bg-pink-500 text-white" : ""
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <ProductGrid products={sellerProducts} />
    </PageContainer>
  );
}

export default ShopPage;
