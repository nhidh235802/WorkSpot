'use client'

import React from 'react'

export default function OwnerDashboard() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#14422D', marginBottom: '24px' }}>
        Owner Dashboard
      </h1>
      <div style={{ 
        background: 'white', 
        padding: '32px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E3E3DE'
      }}>
        <p style={{ fontSize: '18px', color: '#414943' }}>
          Chào mừng bạn đến với trang quản lý quán cà phê. 
          Tại đây bạn có thể quản lý các quán của mình, xem thống kê và phản hồi từ khách hàng.
        </p>
        <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#F0F9F4', padding: '24px', borderRadius: '12px', border: '1px solid #BCEECF' }}>
            <h3 style={{ fontWeight: '600', color: '#14422D' }}>Tổng số quán</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>0</p>
          </div>
          <div style={{ background: '#FFF7F2', padding: '24px', borderRadius: '12px', border: '1px solid #FFDBC7' }}>
            <h3 style={{ fontWeight: '600', color: '#904C18' }}>Đánh giá mới</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
