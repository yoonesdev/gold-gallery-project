function PageContainer({
  children,
  className = "",
  maxWidth = "max-w-[1126px]",
}) {
  return (
    <div
      dir="rtl"
      className={`mx-auto ${maxWidth} px-4 py-10 ${className}`}
    >
      {children}
    </div>
  );
}

export default PageContainer;