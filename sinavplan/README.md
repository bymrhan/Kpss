# SinavPlan - Sınav Hazırlık LMS

KPSS, YKS, ALES ve diğer sınavlara hazırlık için geliştirilmiş modern bir öğrenme yönetim sistemi.

## 🚀 Özellikler

- **Kullanıcı Yönetimi**: Email/şifre ile kayıt olma ve giriş yapma
- **Sınav Yönetimi**: KPSS, YKS, ALES gibi sınavları yönetme
- **Kategori ve Konu Yapısı**: Hiyerarşik içerik organizasyonu
- **İçerik Yönetimi**: Video, quiz, test ve tekrar videoları
- **İlerleme Takibi**: Kullanıcıların konu ilerlemesini takip etme
- **Admin Paneli**: Kapsamlı yönetim arayüzü
- **Toplu İçe Aktarma**: CSV ile konu yükleme

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Veritabanı**: SQLite + Prisma ORM
- **Kimlik Doğrulama**: Lucia Auth (Argon2 hash)
- **Form Yönetimi**: React Hook Form + Zod validation
- **CSV İşleme**: PapaParse (client) + csv-parse (server)

## 📋 Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya pnpm

### Adımlar

1. **Projeyi klonlayın**
   ```bash
   git clone <repository-url>
   cd sinavplan
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   # veya
   pnpm install
   ```

3. **Environment variables ayarlayın**
   ```bash
   cp .env.example .env
   ```
   
   `.env` dosyasını düzenleyin:
   ```env
   DATABASE_URL="file:./prisma/app.db"
   AUTH_SECRET="your-32-character-secret-key-here"
   INITIAL_ADMIN_EMAIL="admin@example.com"
   ```

4. **Veritabanını oluşturun**
   ```bash
   npx prisma migrate dev
   ```

5. **Test verilerini yükleyin (opsiyonel)**
   ```bash
   npm run db:seed
   ```

6. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```

7. **Tarayıcıda açın**
   ```
   http://localhost:3000
   ```

## 👤 İlk Kullanım

1. **Admin Hesabı Oluşturma**
   - `.env` dosyasındaki `INITIAL_ADMIN_EMAIL` ile kayıt olun
   - Bu email ile kayıt olan ilk kullanıcı otomatik olarak admin olur

2. **Sınav Ekleme**
   - Admin paneline gidin (`/admin`)
   - "Sınavlar" bölümünden yeni sınav ekleyin

3. **Kategori ve Konu Ekleme**
   - Kategoriler oluşturun
   - Her kategoriye konular ekleyin
   - Toplu yükleme ile CSV'den konu ekleyebilirsiniz

4. **İçerik Ekleme**
   - Konulara video, quiz, test ekleyin
   - YouTube videolarını embed edin

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Kimlik doğrulama sayfaları
│   ├── admin/             # Admin paneli
│   ├── dashboard/         # Kullanıcı dashboard'u
│   ├── catalog/           # Katalog sayfası
│   └── topic/             # Konu detay sayfaları
├── components/            # React bileşenleri
│   ├── layouts/           # Layout bileşenleri
│   └── ui/                # shadcn/ui bileşenleri
├── lib/                   # Yardımcı fonksiyonlar
│   ├── actions/           # Server actions
│   ├── auth.ts            # Lucia auth konfigürasyonu
│   ├── hash.ts            # Şifre hash fonksiyonları
│   └── prisma.ts          # Prisma client
└── prisma/
    ├── schema.prisma      # Veritabanı şeması
    └── seed.ts            # Test verileri
```

## 🔐 Güvenlik

- **Şifre Hashleme**: Argon2 algoritması
- **Session Yönetimi**: Güvenli cookie tabanlı oturumlar
- **Admin Yetkilendirme**: Role-based access control
- **Input Validation**: Zod ile güçlü doğrulama
- **CSRF Koruması**: Next.js built-in koruması

## 📊 Veritabanı Şeması

### Ana Tablolar

- **User**: Kullanıcı bilgileri ve roller
- **Session**: Oturum yönetimi
- **Exam**: Sınavlar (KPSS, YKS, vb.)
- **Category**: Sınav kategorileri
- **Topic**: Konular
- **Content**: İçerikler (video, quiz, test)
- **Question**: Sorular
- **Choice**: Seçenekler
- **Test**: Testler
- **UserPref**: Kullanıcı tercihleri
- **UserTopicStatus**: Konu ilerleme durumu

## 🚀 Deployment

### Vercel (Önerilen)

1. Projeyi GitHub'a push edin
2. Vercel'e bağlayın
3. Environment variables ekleyin
4. Deploy edin

### Diğer Platformlar

- **Railway**: SQLite + Node.js desteği
- **Render**: PostgreSQL + Node.js
- **DigitalOcean**: App Platform

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Sorunlar için GitHub Issues kullanın veya iletişime geçin.

---

**SinavPlan** - Sınav hazırlığınızı kolaylaştırın! 🎓