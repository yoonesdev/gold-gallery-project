import { useSearchParams } from "react-router-dom";

function useShopFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = searchParams.get("sort") || "";
  const category = searchParams.get("category") || "";

  const setSort = (value) => {
    const params = {};

    if (value) params.sort = value;
    if (category) params.category = category;

    setSearchParams(params);
  };

  const setCategory = (value) => {
    const params = {};

    if (sort) params.sort = sort;
    if (value) params.category = value;

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return {
    sort,
    category,
    setSort,
    setCategory,
    clearFilters,
  };
}

export default useShopFilters;