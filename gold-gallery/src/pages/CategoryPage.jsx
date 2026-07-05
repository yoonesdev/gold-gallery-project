import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductsByCategory } from "../services/ProductService";
import categories from "../constants/categories";
import ProductCard from "../components/ProductCard";
import PageContainer from "../components/layout/PageContainer";
import SectionTitle from "../components/ui/SectionTitle";
import Card from "../components/ui/Card";

function CategoryPage() {
  const { categoryName } = useParams();

  const categoryTitle =
    categories.find((c) => c.value === categoryName)?.label || categoryName;

  const categoryProducts = useMemo(() => {
    return getProductsByCategory(categoryName);
  }, [categoryName]);

  return (
    <PageContainer className="py-8">
      <SectionTitle>{categoryTitle}</SectionTitle>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categoryProducts.map((product) => (
          <Card
            key={product.id}
            padding="p-5"
            className="transition hover:shadow-lg"
          >
            <Link to={`/product/${product.id}/${product.slug}`}>
              <ProductCard product={product} />
            </Link>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

export default CategoryPage;
