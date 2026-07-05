function SectionTitle({
  children,
  level = "h1",
  margin = "",
  className = "",
}) {
  const Tag = level;

  const styles = {
    h1: "text-3xl font-bold",
    h2: "text-2xl font-bold",
    h3: "text-lg font-bold border-r-4 border-pink-500 pr-3",
  };

  const margins = {
    h1: "mb-8",
    h2: "mb-6",
    h3: "mb-4",
  };

  return (
    <Tag
      className={`${styles[level]} ${margin || margins[level]} ${className}`}
    >
      {children}
    </Tag>
  );
}

export default SectionTitle;