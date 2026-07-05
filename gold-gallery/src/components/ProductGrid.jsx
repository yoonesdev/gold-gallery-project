import ProductCard from "./ProductCard";
import Card from "../components/ui/Card";

function ProductGrid({
  products,
  emptyMessage = "محصولی پیدا نشد.",
  columns = "lg:grid-cols-4",
}) {
  if (products.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">{emptyMessage}</div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 ${columns}`}
    >
      {products.map((product) => (
        <Card key={product.id}>
          <ProductCard product={product} />
        </Card>
      ))}
    </div>
  );
}

export default ProductGrid;
