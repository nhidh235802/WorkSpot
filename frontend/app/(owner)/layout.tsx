export default function SubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="sub-layout-container">
      {/* Nơi chèn các linh kiện dùng chung. Ví dụ: <Navbar /> */}
      
      {children}
      
      {/* Nơi chèn các linh kiện dùng chung. Ví dụ: <Footer /> */}
    </div>
  )
}