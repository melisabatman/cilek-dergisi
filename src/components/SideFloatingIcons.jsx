import React from 'react'

export default function SideFloatingIcons() {
  return (
    <div className="page-side-floating-container" aria-hidden="true">
      {/* Sol Kenardaki Sade Dekoratif Çıkartma */}
      <div className="side-float-item float-left-subtle">
        <img
          src="/icons/icon1.png"
          alt=""
          className="side-float-img"
        />
      </div>

      {/* Sağ Kenardaki Sade Dekoratif Çıkartma */}
      <div className="side-float-item float-right-subtle">
        <img
          src="/icons/icon2.png"
          alt=""
          className="side-float-img"
        />
      </div>
    </div>
  )
}
