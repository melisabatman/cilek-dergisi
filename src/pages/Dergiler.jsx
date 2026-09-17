import React from 'react'
import Layout from '../components/Layout'
import MagazineGrid from '../components/MagazineGrid'

export default function Dergiler({ user, isAdmin }) {
  return (
    <Layout user={user} isAdmin={isAdmin}>
      <div className="magazine-archive" role="main">
        <div className="archive-top">
          <h1>Sayılarımız</h1>
          <p>Şimdiye kadar yayımladığımız tüm sayılar, tüm hikâyeler.</p>
        </div>

        <MagazineGrid user={user} />
      </div>
    </Layout>
  )
}
