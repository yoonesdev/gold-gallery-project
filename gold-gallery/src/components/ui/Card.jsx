function Card({
  children,
  className = "",
  padding = "p-4",
}) {
  return (
    <div
      className={`rounded-xl bg-white shadow-sm ${padding} ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;