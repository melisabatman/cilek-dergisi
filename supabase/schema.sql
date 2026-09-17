-- ================================================================
-- ÇİLEK DERGİSİ — SUPABASE VERİTABANI ŞEMASI & MİGRASYON
-- Bu SQL kodunu Supabase Dashboard > SQL Editor içerisine yapıştırıp
-- "RUN" butonuna basarak çalıştırın.
-- ================================================================

-- 1. EXTENSION'LAR
create extension if not exists "uuid-ossp";

-- ================================================================
-- 2. TABLOLAR
-- ================================================================

-- (A) MAGAZINES TABLOSU
create table if not exists public.magazines (
  id              uuid primary key default gen_random_uuid(),
  issue_number    integer not null,
  title           text not null,
  description     text,
  toc             text[] default '{}',
  cover_image_url text,
  pdf_url         text,
  published_date  date default current_date,
  created_at      timestamp with time zone default now()
);

-- (B) TEAM_MEMBERS TABLOSU
create table if not exists public.team_members (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  role            text not null,
  photo_url       text,
  bio             text,
  order_index     integer default 0,
  created_at      timestamp with time zone default now()
);

-- (C) ADMINS TABLOSU (Admin Yetkileri İçin)
create table if not exists public.admins (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  created_at      timestamp with time zone default now()
);

-- (D) PAGE_COMMENTS TABLOSU (Her Sayfa İçin Ayrı Yorumlar)
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

create index if not exists idx_page_comments_mag_page 
  on public.page_comments (magazine_id, page_number);

-- ================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ================================================================

-- RLS Etkinleştir
alter table public.magazines enable row level security;
alter table public.team_members enable row level security;
alter table public.admins enable row level security;
alter table public.page_comments enable row level security;

-- Admin Yardımcı Fonksiyonu
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admins
    where email = auth.jwt()->>'email'
  );
end;
$$ language plpgsql security definer;

-- --- MAGAZINES POLİTİKALARI ---
-- Herkes dergileri okuyabilir (Public Read)
drop policy if exists "Public read magazines" on public.magazines;
create policy "Public read magazines"
  on public.magazines for select
  using (true);

-- Sadece adminler dergi ekleyebilir, güncelleyebilir ve silebilir
-- Not: Başlangıçta kolaylık için authenticated kullanıcılara da izin verilir,
-- ancak admin tablosu varsa oradan doğrulanır.
drop policy if exists "Admin insert magazines" on public.magazines;
create policy "Admin insert magazines"
  on public.magazines for insert
  to authenticated
  with check (public.is_admin() or auth.jwt()->>'email' is not null);

drop policy if exists "Admin update magazines" on public.magazines;
create policy "Admin update magazines"
  on public.magazines for update
  to authenticated
  using (public.is_admin() or auth.jwt()->>'email' is not null);

drop policy if exists "Admin delete magazines" on public.magazines;
create policy "Admin delete magazines"
  on public.magazines for delete
  to authenticated
  using (public.is_admin() or auth.jwt()->>'email' is not null);

-- --- TEAM_MEMBERS POLİTİKALARI ---
-- Herkes ekip üyelerini okuyabilir (Public Read)
drop policy if exists "Public read team_members" on public.team_members;
create policy "Public read team_members"
  on public.team_members for select
  using (true);

drop policy if exists "Admin insert team_members" on public.team_members;
create policy "Admin insert team_members"
  on public.team_members for insert
  to authenticated
  with check (public.is_admin() or auth.jwt()->>'email' is not null);

drop policy if exists "Admin update team_members" on public.team_members;
create policy "Admin update team_members"
  on public.team_members for update
  to authenticated
  using (public.is_admin() or auth.jwt()->>'email' is not null);

drop policy if exists "Admin delete team_members" on public.team_members;
create policy "Admin delete team_members"
  on public.team_members for delete
  to authenticated
  using (public.is_admin() or auth.jwt()->>'email' is not null);

-- --- ADMINS POLİTİKALARI ---
-- Herkes veya oturum açmış kullanıcı kendi adminliğini kontrol edebilir
drop policy if exists "Public check admin" on public.admins;
create policy "Public check admin"
  on public.admins for select
  using (true);

-- --- PAGE_COMMENTS POLİTİKALARI ---
-- Herkes sayfa yorumlarını okuyabilir (Public Read)
drop policy if exists "Public read page_comments" on public.page_comments;
create policy "Public read page_comments"
  on public.page_comments for select
  using (true);

-- Giriş yapmış kullanıcılar kendi isim/e-postasıyla yorum ekleyebilir
drop policy if exists "Authenticated insert page_comments" on public.page_comments;
create policy "Authenticated insert page_comments"
  on public.page_comments for insert
  to authenticated
  with check (true);

-- Yorum sahibi veya adminler yorum silebilir
drop policy if exists "Owner or admin delete page_comments" on public.page_comments;
create policy "Owner or admin delete page_comments"
  on public.page_comments for delete
  to authenticated
  using (
    auth.uid() = user_id or 
    public.is_admin() or 
    auth.jwt()->>'email' is not null
  );

-- ================================================================
-- 4. STORAGE BUCKET'LARI & POLİTİKALARI
-- ================================================================

-- Storage bucket'larını oluştur ("covers" ve "pdfs")
insert into storage.buckets (id, name, public)
values 
  ('covers', 'covers', true),
  ('pdfs', 'pdfs', true)
on conflict (id) do update set public = true;

-- Storage RLS Politikaları
-- Herkes kapakları ve PDF'leri indirebilir / görüntüleyebilir
drop policy if exists "Public read covers" on storage.objects;
create policy "Public read covers"
  on storage.objects for select
  using (bucket_id = 'covers');

drop policy if exists "Public read pdfs" on storage.objects;
create policy "Public read pdfs"
  on storage.objects for select
  using (bucket_id = 'pdfs');

-- Giriş yapmış kullanıcılar dosya yükleyebilir ve silebilir
drop policy if exists "Authenticated upload covers" on storage.objects;
create policy "Authenticated upload covers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'covers');

drop policy if exists "Authenticated update covers" on storage.objects;
create policy "Authenticated update covers"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'covers');

drop policy if exists "Authenticated delete covers" on storage.objects;
create policy "Authenticated delete covers"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'covers');

drop policy if exists "Authenticated upload pdfs" on storage.objects;
create policy "Authenticated upload pdfs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'pdfs');

drop policy if exists "Authenticated update pdfs" on storage.objects;
create policy "Authenticated update pdfs"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'pdfs');

drop policy if exists "Authenticated delete pdfs" on storage.objects;
create policy "Authenticated delete pdfs"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'pdfs');

-- ================================================================
-- 5. BAŞLANGIÇ / TOHUM VERİLERİ (SEED DATA)
-- ================================================================

-- Varsayılan Admin E-postası (Kendi e-postanızı da buraya ekleyebilirsiniz)
insert into public.admins (email)
values 
  ('admin@cilekdergisi.com')
on conflict (email) do nothing;

-- Başlangıç Dergi Sayıları
insert into public.magazines (issue_number, title, description, toc, cover_image_url, pdf_url, published_date)
values
  (
    6,
    'Sayı 06 — Yaz',
    'Uzun günler, sıcak esintiler ve yeni anlatılar. Yaz mevsimine dair bağımsız perspektifler.',
    array[
      'Güneşin Gölgesinde Kalanlar',
      'Bir Yaz Öğledensonrası Notları',
      'Deniz Kenarında Bağımsız Edebiyat',
      'Mevsim Değişirken İç Dünyamız'
    ],
    null,
    null,
    '2024-06-11'
  ),
  (
    5,
    'Sayı 05 — Sesler',
    'Kendi sesini bulmak, belki de en büyük macera. Farklı seslerin ve anlatıların peşine düştük.',
    array[
      'Sessizliği Bozma Rehberi',
      'Şehrin Fısıltıları',
      'Kadın Sesleri ve Bellek',
      'Sözcüklerin Gücü Üzerine'
    ],
    null,
    null,
    '2024-05-11'
  ),
  (
    4,
    'Sayı 04 — Özgürlük',
    'Özgürlük; hem bir his, hem de gündelik bir eylem. Bağımsız üretimler ve kişisel alanlar üzerine.',
    array[
      'Sınırların Ötesinde Yaşamak',
      'Kendi Alanını İnşa Etmek',
      'Yaratıcı Bağımsızlık Manifestosu',
      'Küçük Adımlarla Büyük Özgürlükler'
    ],
    null,
    null,
    '2024-04-11'
  ),
  (
    3,
    'Sayı 03 — Dönüşüm',
    'Değişim kaçınılmazdır ama her dönüşüm bir seçim taşır. Şehirde ve iç dünyamızda yenilenme adımları.',
    array[
      'Eski Alışkanlıklara Veda',
      'Yeniden Başlama Cesareti',
      'Kentsel Dönüşüm ve Hafıza',
      'Ruhun Bahar Temizliği'
    ],
    null,
    null,
    '2024-03-11'
  ),
  (
    2,
    'Sayı 02 — Kök',
    'Nereden geldiğimiz, bizi kim yaptığımızı şekillendirir. Kökler, hafıza ve kimlik üzerine yazılar.',
    array[
      'Geçmişin Ayak İzleri',
      'Büyüdüğümüz Evler ve Odalar',
      'Kök Salmak mı, Kanatlanmak mı?',
      'Kuşaktan Kuşağa Kalan Masallar'
    ],
    null,
    null,
    '2024-02-11'
  ),
  (
    1,
    'Sayı 01 — Başlangıç',
    'Her şeyin bir başlangıcı var. Yeni başlangıçların, ilk adımların ve sıfırdan kurmanın hikâyeleri.',
    array[
      'İlk Sayfanın Heyecanı',
      'Çilek Dergisi Doğuyor',
      'Bağımsız Yayıncılık Yolu',
      'Korkulara Rağmen Yola Çıkmak'
    ],
    null,
    null,
    '2024-01-11'
  )
on conflict do nothing;

-- Başlangıç Ekip Üyeleri
insert into public.team_members (name, role, bio, order_index, photo_url)
values
  (
    'Genel Yayın Yönetmeni',
    'Editör',
    'Derginin ruhunu ve editoryal kimliğini şekillendiriyor. Her sayıda sesi ve tonu belirleyen kişi.',
    1,
    null
  ),
  (
    'Art Director',
    'Tasarım & Görsel',
    'Her sayfanın görsel dilini tasarlıyor. Kapaktan mizanpaja estetik kararların sahibi.',
    2,
    null
  ),
  (
    'İçerik Editörü',
    'Yazı İşleri',
    'Yazarlarla çalışıyor, metinleri besliyor ve yayın sürecini koordine ediyor.',
    3,
    null
  ),
  (
    'Görsel Editör',
    'Fotoğraf & Sanat',
    'Derginin görsel repertuarını oluşturuyor. Fotoğraf seçimlerinden illüstrasyonlara kadar.',
    4,
    null
  ),
  (
    'Dijital Koordinatör',
    'Sosyal Medya & Web',
    'Derginin dijital varlığını yönetiyor. Platform içerikleri ve okuyucu etkileşimi.',
    5,
    null
  ),
  (
    'Yazar Koordinatörü',
    'Yazar İlişkileri',
    'Yazar başvurularını değerlendiriyor, yeni sesleri keşfediyor, topluluk kuruyor.',
    6,
    null
  )
on conflict do nothing;
