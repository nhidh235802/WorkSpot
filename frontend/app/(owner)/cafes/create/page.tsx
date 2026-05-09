"use client";
import { useState } from "react";

export default function CreateCafeForm() {
  const [address, setAddress] = useState("");
  // ... các state khác như name, description...
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. GỌI API OPENSTREETMAP (NOMINATIM) ĐỂ LẤY TỌA ĐỘ
      const searchAddress = `${address}, Hà Nội, Việt Nam`; 
      const geocodeRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`
      );
      const geocodeData = await geocodeRes.json();

      if (geocodeData.length === 0) {
        alert("Không thể xác định tọa độ từ địa chỉ này. Vui lòng nhập rõ hơn (VD: Số nhà, Tên đường).");
        setIsSubmitting(false);
        return; // Chặn không cho gửi xuống Backend nếu không tìm thấy
      }

      // Lấy kết quả tốt nhất đầu tiên
      const lat = parseFloat(geocodeData[0].lat);
      const lng = parseFloat(geocodeData[0].lon);

      // 2. ĐÓNG GÓI DỮ LIỆU CÙNG TỌA ĐỘ ĐỂ GỬI XUỐNG BACKEND (NESTJS)
      const payload = {
        name: "Tên quán...",
        address: address, // Vẫn gửi chữ để lưu DB hiển thị
        latitude: lat,    // Gửi kèm tọa độ vừa lấy được
        longitude: lng
      };

      const backendRes = await fetch("/api/cafes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (backendRes.ok) {
        alert("Đăng ký quán thành công!");
        // Chuyển hướng về trang Dashboard...
      }

    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... các ô input ... */}
      <input 
        type="text" 
        value={address} 
        onChange={(e) => setAddress(e.target.value)} 
        placeholder="Nhập địa chỉ quán..." 
      />
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang xử lý tọa độ & Lưu..." : "Đăng ký quán"}
      </button>
    </form>
  );
}