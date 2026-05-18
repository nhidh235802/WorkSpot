'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AdminService, AdminUser } from '@/services/admin.service'
import { Loader2, Search } from 'lucide-react'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  owner: 'Chủ quán',
  customer: 'Khách hàng',
}

const STATUS_CLASS: Record<string, string> = {
  admin: 'badge-gray',
  owner: 'badge-blue',
  customer: 'badge-green',
}

export default function AdminAccountPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [searchName, setSearchName] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    AdminService.getUsers({ name: undefined, role: undefined, limit: 100 })
      .then((data) => setUsers(data.items))
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Không thể tải danh sách tài khoản')
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchName = user.fullName.toLowerCase().includes(searchName.toLowerCase())
      const matchEmail = user.email.toLowerCase().includes(searchEmail.toLowerCase())
      const matchRole = role ? user.role === role : true
      return matchName && matchEmail && matchRole
    })
  }, [users, searchName, searchEmail, role])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Quản lý tài khoản</div>
          <div className="page-sub">Xem và giám sát quyền hạn người dùng trong hệ thống.</div>
        </div>
      </div>

      <div className="kpi4 grid gap-4 xl:grid-cols-4 mb-5">
        <div className="kpi-card">
          <div className="kpi-label">Tổng tài khoản</div>
          <div className="kpi-value">{filteredUsers.length.toLocaleString('vi-VN')}</div>
        </div>
        <div className="kpi-card bg-[#EAF3DE]">
          <div className="kpi-label">Admin / Chủ quán</div>
          <div className="kpi-value green">{filteredUsers.filter((u) => u.role === 'admin' || u.role === 'owner').length}</div>
        </div>
        <div className="kpi-card bg-[#FAEEDA]">
          <div className="kpi-label">Khách hàng</div>
          <div className="kpi-value orange">{filteredUsers.filter((u) => u.role === 'customer').length}</div>
        </div>
        <div className="kpi-card bg-[#FCEBEB]">
          <div className="kpi-label">Tài khoản mới</div>
          <div className="kpi-value">{Math.max(0, filteredUsers.length - 10)}</div>
        </div>
      </div>

      <div className="search-form mb-6 bg-white border border-[#E8E5DF] rounded-3xl p-5">
        <div className="form-row grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr]">
          <div className="form-group">
            <label>Tên</label>
            <input value={searchName} onChange={(event) => setSearchName(event.target.value)} placeholder="Tìm theo tên" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={searchEmail} onChange={(event) => setSearchEmail(event.target.value)} placeholder="Tìm theo email" />
          </div>
          <div className="form-group">
            <label>Vai trò</label>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="owner">Chủ quán</option>
              <option value="customer">Khách hàng</option>
            </select>
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="stopped">Đã dừng</option>
            </select>
          </div>
          <div className="form-group">
            <label className="opacity-0">Tìm kiếm</label>
            <button type="button" className="btn btn-primary w-full">Tìm kiếm</button>
          </div>
        </div>
      </div>

      <div className="cafe-table bg-white border border-[#E8E5DF] rounded-3xl overflow-hidden">
        <div className="acct-table-header grid grid-cols-[3fr_1.5fr_1.2fr_2fr_1.5fr] px-4 py-3 text-xs uppercase text-[#888780] bg-[#FAFAF8]">
          <span>Thông tin tài khoản</span>
          <span>Vai trò</span>
          <span>Ngày tạo</span>
          <span>Email</span>
          <span>Hành động</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-[#888780]">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-sm text-[#B91C1C]">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-sm text-[#5F5E5A]">Không có tài khoản phù hợp.</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="acct-row grid grid-cols-[3fr_1.5fr_1.2fr_2fr_1.5fr] items-center px-4 py-4 border-b border-[#F1EFE8] hover:bg-[#FAFAF8]">
              <div className="flex items-center gap-3">
                <div className="acct-avatar" style={{ background: '#E0DDD6', color: '#5F5E5A' }}>
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-[#2C2C2A]">{user.fullName}</div>
                </div>
              </div>
              <div>
                <span className={`badge ${STATUS_CLASS[user.role] || 'badge-gray'}`}>{ROLE_LABEL[user.role] || user.role}</span>
              </div>
              <div className="text-sm text-[#5F5E5A]">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</div>
              <div className="text-sm text-[#888780]">{user.email}</div>
              <div className="btn-actions flex flex-wrap gap-2">
                <button className="btn btn-primary text-xs">Chi tiết</button>
                <button className="btn btn-ghost text-xs">Khóa</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
