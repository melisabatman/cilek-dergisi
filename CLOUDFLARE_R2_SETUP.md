# ☁️ Cloudflare R2 Depolama (Storage) Kurulum Kılavuzu

Çilek Dergisi projesinde PDF ve kapak görselleri depolaması **Cloudflare R2** (S3 uyumlu depolama) üzerine taşınmıştır. Veritabanı ve kullanıcı işlemleri Supabase üzerinde kalırken, tüm büyük medya dosyaları Cloudflare R2 üzerinde barındırılır.

---

## 1. Cloudflare Dashboard'dan R2 Bucket Oluşturma

1. [dash.cloudflare.com](https://dash.cloudflare.com) adresine gidin.
2. Sol menüden **R2 Object Storage** bölümünü açın.
3. **Create bucket** (Kova Oluştur) butonuna tıklayın.
4. Bucket ismini girin (Örn: `cilek-dergisi`) ve **Create bucket** butonuna basın.
   - Bu isim `.env` dosyanızdaki `R2_BUCKET_NAME` olacaktır.

---

## 2. Public URL (Genel Erişim) Açma

Yüklenen kapakların ve PDF dosyalarının sitede görüntülenebilmesi için bucket'ın genel erişime açık olması gerekir:

1. Oluşturduğunuz bucket'a tıklayın ve **Settings** sekmesine gidin.
2. **Public access** bölümünü bulun.
3. **R2.dev subdomain** alanındaki **Allow Access** butonuna tıklayın.
4. Size verilen genel URL'i kopyalayın (Örn: `https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev`).
   - Bu URL `.env` dosyanızdaki `R2_PUBLIC_URL` olacaktır (veya kendi özel alan adınızı bağlayabilirsiniz).

---

## 3. R2 API Token (Access Key & Secret Key) Oluşturma

Admin panelinden tarayıcı üzerinden dosya yükleyebilmek için S3 API anahtarları gereklidir:

1. Sol menüden **R2 Object Storage > Manage R2 API Tokens** bölümüne gidin.
2. **Create API token** butonuna tıklayın.
3. İzinler bölümünde **Object Read & Write** (veya Admin Read & Write) seçeneğini işaretleyin.
4. **Create API Token** butonuna tıklayın.
5. Açılan ekranda şu bilgileri hemen kopyalayın:
   - **Account ID**: Cloudflare R2 sayfasında sağ üstte veya token sayfasında yer alan 32 karakterlik hesap ID'niz (`R2_ACCOUNT_ID`).
   - **Access Key ID**: `R2_ACCESS_KEY_ID`
   - **Secret Access Key**: `R2_SECRET_ACCESS_KEY`

---

## 4. CORS (Cross-Origin Resource Sharing) İzni Verme (Önemli!)

Admin panelinden ve PDF okuyucudan dosyalara erişebilmek için bucket'a CORS kuralı eklenmelidir:

1. Bucket'ınızın **Settings** sekmesine gidin.
2. **CORS Policy** bölümünü bulun ve **Add rule** butonuna tıklayın.
3. Şu JSON kuralını yapıştırın:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://cilek-dergisi-jne4.vercel.app",
      "https://cilekdergisi.com",
      "https://*.cilekdergisi.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 5. `.env.local` veya `.env` Dosyasına Değerleri Ekleme

Aldığınız bilgileri bilgisayarınızdaki `.env.local` (veya `.env`) dosyasına yapıştırın:

```env
# Cloudflare R2 (Güvenlik: Bu anahtarlar VITE_ öneki almaz, sadece backend API'de okunur)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=cilek-dergisi
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
```

---

## Güvenli Mimari ve Nasıl Çalışır?

1. **Güvenlik (Secret Key Koruması):** `R2_SECRET_ACCESS_KEY` ve `R2_ACCESS_KEY_ID` asla tarayıcı/client bundle'ına aktarılmaz. Yalnızca sunucu ortamında (`process.env`) bulunur.
2. **Backend API Route (`/api/upload`):** Tarayıcı (Admin paneli), dosyaları doğrudan `/api/upload` backend rotasına iletir. Bu rota sunucu tarafında S3Client (`forcePathStyle: true`) ile R2 kovanına yüklemeyi yapar.
3. **Supabase Veritabanı:** Yüklenen dosyanın genel R2 bağlantısı (`https://pub-xxx.r2.dev/covers/...`) `magazines` tablosunun `cover_image_url` ve `pdf_url` sütunlarına kaydedilir.
4. **Okuyucu ve Site:** PDF okuyucu, dergi listesi ve indirme butonları bu public URL üzerinden dosyaları doğrudan Cloudflare CDN hızıyla okuyuculara sunar.

