import { useContext } from "react";
import { Link } from "react-router-dom";
import { WishlistContext } from "../context/contexts";
import { categoryMap } from "../constants/categories";

function ProductCard({ product }) {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const isFavorite = wishlist.some((item) => item.id === product.id);

  return (
    <article className="w-full p-3">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          className="cursor-pointer text-2xl transition-transform hover:scale-110"
          aria-label={
            isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
          }
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      <Link to={`/product/${product.id}/${product.slug}`} className="block">
        {product.image && (
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="mb-3 h-40 w-full rounded-lg object-cover sm:h-[180px]"
          />
        )}

        <h3 className="mb-2 min-h-[48px] text-base font-bold leading-6 text-gray-800 sm:min-h-[56px] sm:text-[18px] sm:leading-7">
          {product.title}
        </h3>

        {product.category && (
          <p className="mb-2 text-sm text-gray-500">
            دسته: {categoryMap[product.category] ?? product.category}
          </p>
        )}

        <div className="mt-auto space-y-1">
          <p className="font-bold text-gray-700">
            {product.price.toLocaleString("fa-IR")} تومان
          </p>

          {product.discountPercentage > 0 && (
            <p className="text-sm text-pink-500">
              {product.discountPercentage}٪ تخفیف
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
