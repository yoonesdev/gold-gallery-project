function FilterBar({ sort, setSort }) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="w-full rounded-lg border px-4 py-2 sm:w-auto"
      >
        <option value="">مرتب سازی</option>
        <option value="price-low">ارزان ترین</option>
        <option value="price-high">گران ترین</option>
        <option value="popular">محبوب ترین</option>
        <option value="new">جدید ترین</option>
      </select>
    </div>
  );
}

export default FilterBar;