'use client'

import React from 'react'

export default function AdminDashboard() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#14422D', marginBottom: '24px' }}>
        Admin Dashboard
      </h1>
      <div style={{ 
        background: 'white', 
        padding: '32px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E3E3DE'
      }}>
        <p style={{ fontSize: '18px', color: '#414943' }}>
          Hệ thống quản trị WorkSpot.
          Tại đây bạn có thể duyệt các quán cà phê mới và quản lý người dùng.
        </p>
        <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#F0F9F4', padding: '24px', borderRadius: '12px', border: '1px solid #BCEECF' }}>
            <h3 style={{ fontWeight: '600', color: '#14422D' }}>Chờ duyệt</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>0</p>
          </div>
          <div style={{ background: '#F2F2FF', padding: '24px', borderRadius: '12px', border: '1px solid #D7D7FF' }}>
            <h3 style={{ fontWeight: '600', color: '#1A1A5E' }}>Tổng người dùng</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>0</p>
          </div>
        </div>
      </div>
    </div>
  )
}