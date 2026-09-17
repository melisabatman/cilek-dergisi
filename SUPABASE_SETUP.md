# 🍓 Çilek Dergisi — Supabase Kurulum ve Bağlantı Kılavuzu

Bu kılavuz, Çilek Dergisi web sitesinin veritabanını, dosya depolamasını (Storage), kullanıcı kimlik doğrulamasını (Auth) ve Admin panelini 5 dakikada kurmanızı sağlar.

---

## 1. Adım: Veritabanı Tablolarını ve Politikaları Oluşturma

1. [supabase.com](https://supabase.com) adresinden projenize girin.
2. Sol menüden **SQL Editor** sekmesine tıklayın.
3. **New Query** butonuna basın.
4. Projenizin `supabase/schema.sql` dosyasındaki tüm içeriği kopyalayıp SQL Editor penceresine yapıştırın.
5. Sağ alttaki **Run** (veya `Ctrl + Enter`) butonuna tıklayarak çalıştırın.

Bu işlem şunları otomatik olarak kurar:
- `magazines` tablosu (sayı no, başlık, açıklama, içindekiler listesi (toc), kapak URL, PDF URL, tarih)
- `team_members` tablosu (isim, rol, fotoğraf URL, biyografi, sıralama)
- `admins` tablosu (yetkili admin e-postaları)
- Storage bucket'ları: `"covers"` (kapaklar ve fotoğraflar) ve `"pdfs"` (dergi PDF dosyaları)
- Güvenlik ve RLS (Row Level Security) kuralları
- 6 adet başlangıç sayısı ve ekip üyeleri örnek verileri

---

## 2. Adım: API Anahtarlarını `.env.local` Dosyasına Ekleme

1. Supabase Dashboard'da sol alttaki dişli çarka (**Project Settings**) tıklayın.
2. **Configuration > API** menüsüne gidin.
3. Buradan şu iki değeri kopyalayın:
   - **Project URL** (Örn: `https://xxxx.supabase.co` — *Sonuna `/rest/v1` eklemeyin, kök URL olmalıdır*)
   - **anon / public key**
4. Bilgisayarınızdaki `.env.local` dosyasını açıp değerleri yapıştırın:

```env
VITE_SUPABASE_URL=https://projeniz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...
VITE_ADMIN_EMAIL=admin@cilekdergisi.com
VITE_PDF_REQUIRE_LOGIN=true
```

---

## 3. Adım: Admin Kullanıcısı Belirleme

Admin paneline (`/admin`) erişebilmek için iki yöntemden birini kullanabilirsiniz:

### Yöntem A (En Kolayı): `.env.local` ile
`.env.local` dosyasındaki `VITE_ADMIN_EMAIL` değerini kendi e-posta adresiniz yapın (örn: `seninadin@gmail.com`). Sitede bu e-posta ile kayıt olup giriş yaptığınızda doğrudan admin olursunuz!

### Yöntem B: `admins` Veritabanı Tablosu ile
Supabase Dashboard > **Table Editor** > `admins` tablosuna gidin ve e-posta adresinizi satır olarak ekleyin:
```sql
insert into public.admins (email) values ('seninadin@gmail.com');
```

---

## 4. Adım: Storage (Depolama) Kontrolü

SQL şeması `"covers"` ve `"pdfs"` bucket'larını otomatik olarak **Public** olarak açmıştır.
Kontrol etmek için:
- Supabase Dashboard > **Storage** sekmesine gidin.
- `covers` ve `pdfs` bucket'larının göründüğünden ve yanlarında **Public** rozetinin olduğundan emin olun.
*(Gerekirse "New Bucket" diyerek elle de `covers` ve `pdfs` adında 2 adet Public bucket açabilirsiniz).*

---

## 5. Adım: Sayfa Yorumları Tablosu (Opsiyonel / Ekstra)

Kullanıcıların dergi sayfalarına özel yorum bırakabilmesi için `supabase/schema.sql` içerisine `page_comments` tablosu eklenmiştir. Eğer ilk kurulumu daha önce yaptıysanız, sadece şu SQL komutunu SQL Editor'de çalıştırmanız yeterlidir:

```sql
create table if not exists public.page_comments (
  id            uuid primary key default gen_random_uuid(),
  magazine_id   uuid not null references public.magazines(id) on delete cascade,
  page_number   integer not null,
  user_id       uuid references auth.users(id) on delete set null,
  user_name     text not null,
  user_email    text not null,
  content       text not null,
  created_at    timestamp with time zone default now()
);

alter table public.page_comments enable row level security;

create policy "Public read page_comments"
  on public.page_comments for select using (true);

create policy "Authenticated insert page_comments"
  on public.page_comments for insert to authenticated with check (true);

create policy "Owner or admin delete page_comments"
  on public.page_comments for delete to authenticated
  using (auth.uid() = user_id or public.is_admin() or auth.jwt()->>'email' is not null);
```

---

## 6. Tebrikler! 🎉

Artık:
- Sitede `/auth` sayfasından kayıt olup giriş yapabilirsiniz.
- Admin kullanıcısıyla giriş yaptığınızda Navbar'da **Admin** butonu görünür ve `/admin` paneline erişebilirsiniz.
- `/admin` panelinden yeni sayılar ekleyebilir, içindekileri dinamik girebilir, kapak ve PDF yükleyebilir, ekip üyelerini düzenleyebilirsiniz.
- Dergiler hem PDF indirilebilir hem de sitede **kitap gibi sayfaları çevrilerek** okunabilir!
- Kullanıcılar **her sayfa için ayrı ayrı yorum** bırakabilir!

