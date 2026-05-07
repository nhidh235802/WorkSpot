import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="layout-container">
      {}
      
      <main>{children}</main>

      {}
    </section>
  )
}