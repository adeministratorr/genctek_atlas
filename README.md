# GençTek Atlas 🗺️

> Türkiye genelindeki GençTek etkinliklerini, öğrenci projelerini ve okul çalışmalarını güvenli, harita tabanlı bir platformda görünür kılar.

**GençTek Atlas**, GençTek ekosisteminde Türkiye genelinde yapılan etkinlikleri, projeleri ve öğrenci çalışmalarını interaktif Türkiye haritası üzerinde gösteren web tabanlı bir platformdur.

Bu proje, **Vibe Coding** kış kampı kapsamında sıfırdan istemci taraflı (client-side) olarak ve tamamen **Firebase** serverless mimarisiyle geliştirilmiştir.

---

## 📌 Proje Nedir?

GençTek Atlas; öğrencilerin, öğretmenlerin, okul yöneticilerinin ve koordinasyon ekiplerinin teknoloji etkinliklerini, başvuruları, projeleri ve çalışma gruplarını tek bir harita ve dashboard deneyimi üzerinden takip etmesini sağlar.

Platform, herkese açık onaylı etkinlik/proje görünürlüğü ile rol bazlı özel çalışma alanlarını birbirinden ayırır. Böylece ziyaretçiler Türkiye genelindeki üretimi keşfedebilirken; öğretmenler, müdürler, koordinatörler ve adminler kendi sorumluluk alanlarını güvenli şekilde yönetebilir.

### Temel Hedefler

- Türkiye genelindeki GençTek etkinliklerini şehir, okul, tema ve format bazında görünür kılmak.
- Öğrenci projelerini GitHub, demo, görsel ve prompt arşiviyle keşfedilebilir hale getirmek.
- Öğretmen, müdür, koordinatör, komisyon ve admin rollerini ayrı dashboard yetkileriyle yönetmek.
- Çalışma grupları, görevler, duyurular, bildirimler ve direkt mesajlaşma ile ekip çalışmasını desteklemek.
- Vibe Coding sürecinde etik, güvenlik, test ve Firebase rules kültürünü örneklemek.

---

## 🚀 Özellikler

| Özellik                         | Açıklama                                                                                                   |
| :------------------------------ | :--------------------------------------------------------------------------------------------------------- |
| İnteraktif Türkiye haritası     | 81 ili destekleyen SVG/Leaflet tabanlı harita ile şehir bazlı etkinlik ve proje yoğunluğu gösterilir.      |
| Tema, şehir ve metin filtreleri | Etkinlikler ve projeler tema, format, şehir, ilçe, okul ve arama metnine göre süzülür.                     |
| Etkinlik ve proje kayıtları     | Kullanıcılar validasyonlu formlarla kayıt gönderir; yeni kayıtlar önce moderasyon onayı bekler.            |
| Rol bazlı dashboardlar          | Öğretmen, müdür, koordinatör, komisyon ve admin kullanıcıları farklı yetkilerle çalışır.                   |
| Çalışma grupları ve görevler    | Grup üyeleri duyuru, görev ve ilerleme takibiyle okul içi ekip çalışmasını sürdürebilir.                   |
| Direkt mesajlaşma               | Mesajlar yalnızca gönderici ve alıcı tarafından okunabilecek şekilde Firestore rules ile korunur.          |
| Bildirim, XP ve rozetler        | Kullanıcı hareketleri bildirim, deneyim puanı ve rozetlerle takip edilir.                                  |
| Analitik ekranları              | Etkinlik, proje, okul, şehir, tema ve bekleyen kayıtlar için özet analizler sunulur.                       |
| Siber güvenlik ve etik kontrol  | XSS, GitHub URL doğrulaması, dosya türü/boyutu, güvenlik başlıkları ve etik inceleme süreçleri belgelenir. |
| Demo modu                       | Firebase yapılandırması yoksa uygulama yerel demo verileriyle çalışmaya devam eder.                        |

---

## 🛠️ Teknoloji Yığını

| Katman         | Teknoloji                                                                    |
| :------------- | :--------------------------------------------------------------------------- |
| Frontend       | React 19, Vite 8, React Router 7                                             |
| Tasarım        | Vanilla CSS, responsive layout, kurumsal kırmızı-beyaz tema                  |
| Harita         | SVG Türkiye haritası, Leaflet, React Leaflet, GeoJSON                        |
| Backend / BaaS | Firebase Authentication, Cloud Firestore, Firebase Storage, Firebase Hosting |
| Firebase SDK   | Firebase Web SDK 12                                                          |
| İkonlar        | Lucide React                                                                 |
| Test           | Vitest, React Testing Library, jsdom                                         |
| Kalite         | ESLint, güvenlik doğrulama testleri, Firebase rules dokümantasyonu           |

### Firestore Koleksiyonları

| Koleksiyon            | Açıklama                                                                        |
| :-------------------- | :------------------------------------------------------------------------------ |
| `users`               | Öğrenci, öğretmen, müdür, koordinatör, komisyon ve admin profilleri.            |
| `teachers`            | Eski uyumluluk için öğretmen/müdür profil kayıtları.                            |
| `students`            | Öğretmenlere bağlı öğrenci bilgileri ve temsilci durumları.                     |
| `custom_schools`      | Kullanıcıların önerdiği veya düzenlediği okul kayıtları.                        |
| `events`              | Etkinlik ve duyuru kayıtları; public görünüm için onay süreci kullanılır.       |
| `projects`            | Öğrenci/takım proje kayıtları, GitHub/demo linkleri ve görsel/prompt dosyaları. |
| `event_applications`  | Etkinlik başvuruları, öğrenci listeleri ve onay durumu.                         |
| `groups`              | Çalışma grupları, üyeler, okul/şehir bağlantısı ve davet kodları.               |
| `group_announcements` | Çalışma gruplarına özel duyurular.                                              |
| `group_tasks`         | Grup görevleri ve durum takibi.                                                 |
| `direct_messages`     | Kullanıcılar arası özel mesajlar.                                               |
| `announcements`       | Genel duyurular.                                                                |
| `notifications`       | Kullanıcıya özel bildirimler ve okunma durumları.                               |

### Roller ve Sorumluluklar

| Rol         | Ne Yapar?                                                                  |
| :---------- | :------------------------------------------------------------------------- |
| Ziyaretçi   | Onaylanmış etkinlikleri, projeleri ve harita görünümünü inceler.           |
| Öğrenci     | Proje üretir, çalışma grubuna katılır, bildirim ve mesajlarını takip eder. |
| Öğretmen    | Öğrencilerini, başvuruları ve çalışma gruplarını yönetir.                  |
| Müdür       | Okul düzeyindeki öğrenci, etkinlik ve grup özetlerini takip eder.          |
| Koordinatör | İl/organizasyon düzeyinde etkinlik, duyuru ve saha verilerini yönetir.     |
| Komisyon    | Kendi yetki alanındaki başvuru ve grup verilerini inceler.                 |
| Admin       | Kullanıcı, kayıt, moderasyon, öne çıkarma ve güvenlik süreçlerini yönetir. |

---

## 💻 Yerel Kurulum ve Çalıştırma

### Gereksinimler

- [Node.js](https://nodejs.org/) 20.19+ veya 22.12+
- Firebase kullanacaksanız Firestore, Storage ve Auth etkinleştirilmiş bir Firebase projesi
- Yayınlama ve rules deploy için Firebase CLI

> [!NOTE]
> Firebase projesi olmadan da uygulama yerel demo modu ile açılır.

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/your-username/genctek-atlas.git
cd genctek-atlas
```

### 2. Bağımlılıkları Kurun

```bash
npm install
```

### 3. Firebase CLI Kurun

Firebase Hosting, Firestore rules ve Storage rules dağıtımı için Firebase CLI gerekir:

```bash
npm install -g firebase-tools
firebase --version
```

Global kurulum yapmak istemiyorsanız aynı komutları `npx firebase-tools` ile de çalıştırabilirsiniz:

```bash
npx firebase-tools --version
```

### 4. Firebase Projesi ve Web App Oluşturun

Mevcut bir Firebase projeniz yoksa Firebase CLI ile proje oluşturabilirsiniz. `PROJECT_ID` benzersiz ve küçük harfli olmalıdır; örnek: `genctek-atlas-okul-adi`.

```bash
firebase login
firebase projects:create PROJECT_ID --display-name "GençTek Atlas"
firebase use PROJECT_ID --alias default
```

Ardından aynı Firebase projesi içinde web uygulamasını oluşturun:

```bash
firebase apps:create web "GençTek Atlas Web" --project PROJECT_ID
```

Bu komut size bir `App ID` verir. Bu değeri aşağıdaki komutta kullanarak web SDK config çıktısını alın:

```bash
firebase apps:sdkconfig web APP_ID --project PROJECT_ID
```

Global Firebase CLI kurmadıysanız aynı akış `npx firebase-tools` ile çalışır:

```bash
npx firebase-tools login
npx firebase-tools projects:create PROJECT_ID --display-name "GençTek Atlas"
npx firebase-tools use PROJECT_ID --alias default
npx firebase-tools apps:create web "GençTek Atlas Web" --project PROJECT_ID
npx firebase-tools apps:sdkconfig web APP_ID --project PROJECT_ID
```

> [!IMPORTANT]
> Firebase `apiKey` istemci tarafında görülebilen bir proje tanımlayıcısıdır; yine de gerçek `.env` dosyasını repoya eklemeyin. `.env` ve `.env.*` dosyaları `.gitignore` içindedir.

### 5. Firebase Çevre Değişkenlerini Tanımlayın

Projenin kök dizininde `.env` adında bir dosya oluşturun ve kendi Firebase kimlik bilgilerinizi girin:

```env
VITE_FIREBASE_API_KEY=kendi_api_anahtariniz
VITE_FIREBASE_AUTH_DOMAIN=proje-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=proje-id
VITE_FIREBASE_STORAGE_BUCKET=proje-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=mesaj-gonderici-id
VITE_FIREBASE_APP_ID=uygulama-id
```

Firebase CLI çıktısındaki alanları şöyle eşleştirin:

| SDK config alanı    | `.env` değişkeni                    |
| :------------------ | :---------------------------------- |
| `apiKey`            | `VITE_FIREBASE_API_KEY`             |
| `authDomain`        | `VITE_FIREBASE_AUTH_DOMAIN`         |
| `projectId`         | `VITE_FIREBASE_PROJECT_ID`          |
| `storageBucket`     | `VITE_FIREBASE_STORAGE_BUCKET`      |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId`             | `VITE_FIREBASE_APP_ID`              |

> [!TIP]
> `.env` dosyası yapılandırılmadığı takdirde uygulama otomatik olarak **Yerel Demo Modu** ile başlar. Local demo modunda moderatör girişi için e-posta `admin@genctek.org` ve şifre `GT_admin_2026!` kullanılabilir.
>
> [!CAUTION]
> **Siber Güvenlik Uyarısı (Security Warning):** Projeyi klonlayıp kendi siteniz olarak canlıya alırken, yerel demo konsolunu (`src/components/DemoConsole.jsx`) ve ilgili sahte kullanıcı kodlarını uygulamadan tamamen kaldırmanız, varsayılan giriş bilgilerini ve parolaları sıfırlamanız gerekmektedir. Aksi takdirde yetkisiz kişiler yönetici panelinize erişebilir!

### 6. Uygulamayı Yerel Sunucuda Başlatın

```bash
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açarak uygulamayı test edebilirsiniz.

---

## ✅ Kalite ve Güvenlik Kontrolleri

Kod değişikliklerinden sonra en ilgili kontrolleri çalıştırın:

```bash
npm run lint
npm run test
npm run build
```

Firebase bilgisi gerektirmeyen QA/güvenlik doğrulaması:

```bash
npm run test:security
```

`test:rules` aynı güvenlik doğrulama setini çalıştıran kısa addır:

```bash
npm run test:rules
```

Güvenlik ve etik takip belgeleri:

- [Siber Güvenlik Test Planı](docs/security-test-plan.md)
- [Yama Doğrulama Raporu](docs/patch-verification.md)
- [Etik İnceleme ve Yapay Zeka Kullanım Kontrolü](ethics-check.md)
- [Güvenlik Bulguları](docs/security-findings.md)

---

### 🤖 Antigravity / AI Studio Kurulum Promptu (Tam Otomatik - Önerilen)

Eğer **Antigravity** veya **Google AI Studio** kullanıyorsanız, projeyi indirir indirmez Firebase paneline bile girmeden tüm işlemleri (API anahtarlarını çekme, ayarlama, yayınlama) **Firebase MCP** yetenekleriyle yapay zekaya yaptırabilirsiniz! Aşağıdaki prompt'u kopyalayıp kullanın:

> _"GençTek Atlas projesini indirdim. Bu projeyi Firebase'de tamamen sıfırdan benim için yapılandırmanı istiyorum. Lütfen **Firebase MCP** araçlarını kullanarak hesabımda uygun bir proje seç (veya oluştur), içine bir web uygulaması (app) kaydet ve `firebase_get_sdk_config` ile API anahtarlarını çek. Elde ettiğin bilgileri `.env.example` şablonunu kullanarak `.env` dosyasına yaz. Ardından `.firebaserc` dosyasını bu projeye göre ayarla, kütüphaneleri kur (npm install), projeyi derle (npm run build) ve son olarak Firebase Hosting'e deploy et."_

---

## 🤖 Vibe Coding Prompt Rehberi

Hiç repo yokmuş gibi, GençTek Atlas uygulamasını yapay zeka yardımıyla **sıfırdan yazdırmak** isteyen öğrenciler için **[GençTek Atlas Sıfırdan Vibe Coding Promptları](docs/VIBE_CODING_PROMPTS.md)** dosyasını kullanabilirsiniz.

Bu rehber dosya adı veya klasör yapısı bilmeyen lise öğrencileri için hazırlanmıştır. Promptlar, yapay zekadan gerekli proje yapısını kendisinin oluşturmasını ister.

Rehberde özellikle şu sıfırdan geliştirme promptları bulunur:

- Proje fikrini netleştirme, teknoloji seçimi ve ilk kurulum
- İlk çalışan ana sayfa, sayfalar, harita, filtreleme ve formlar
- Firebase bağlantısı, veritabanı modeli, kullanıcı girişi ve rol sistemi
- Öğretmen, müdür ve admin panelleri
- Çalışma grupları, görev panosu, direkt mesajlaşma, bildirimler, XP ve rozet sistemi
- **Firebase güvenlik kuralları** yazdırma ve **güvenlik kontrolü** yaptırma
- Manuel test planı, otomatik test yazma ve test hatası düzeltme
- Yayına alma, hata ayıklama, kod açıklatma ve sunum metni hazırlama

Yayına almadan önce rehberdeki **güvenlik kontrolü**, **manuel test** ve **otomatik test** promptlarının kullanılması önerilir.

### Antigravity Proje Skill'i

Antigravity veya benzer AI kod editörleriyle bu proje üzerinde çalışırken proje kökündeki **[AGENTS.md](AGENTS.md)** dosyası okunmalıdır. Bu dosya ajanı proje skill'ine yönlendirir:

```text
.antigravity/skills/genctek-atlas/SKILL.md
```

Bu skill; GençTek Atlas kapsamını, varsayılan teknoloji seçimlerini, öğrenci dostu dokümantasyon dilini, Firebase güvenlik kurallarını, test politikasını ve yayına alma kontrol listesini özetler.

#### AI Agent Talimatları

Antigravity veya başka bir AI kod ajanı bu proje üzerinde çalışırken şu kurallara uymalıdır:

- GençTek Atlas'ı; Türkiye haritası, etkinlikler, öğrenci projeleri, roller, çalışma grupları, mesajlaşma, bildirimler, XP/rozet sistemi ve analiz ekranı olan bir eğitim platformu olarak ele al.
- Varsayılan teknoloji yığını olarak React, Vite, React Router, Vanilla CSS, Firebase Authentication, Firestore, Storage ve Hosting kullan.
- Harita için önce sade SVG yaklaşımını tercih et; daha gelişmiş coğrafi ihtiyaç varsa Leaflet ve GeoJSON kullan.
- Öğrenciye yönelik doküman, rehber ve prompt yazarken sade Türkçe kullan.
- Prompt rehberlerinde öğrencinin dosya adı veya klasör yapısı bilmediğini varsay; "gerekli dosya ve klasörleri sen oluştur" yaklaşımını koru.
- Gerçek uygulama kodunda mevcut React/Firebase/Vanilla CSS yapısına sadık kal.
- `.env.local` veya Firebase gizli bilgilerini asla dokümana veya repoya ekleme.
- Demo modunun Firebase ayarları eksikken çalışmaya devam etmesine dikkat et.
- Formlarda zorunlu alan kontrolü, GitHub link doğrulaması ve anlaşılır Türkçe hata mesajları kullan.
- Kullanıcıdan gelen metinleri güvenli göster; XSS riski oluşturacak güvensiz HTML kullanımından kaçın.
- Rol bazlı erişimde öğrenci, öğretmen, müdür, koordinatör ve admin yetkilerini ayrı düşün.
- Firestore ve Storage kurallarında özel mesajlar, grup verileri, öğrenci bilgileri ve onay bekleyen kayıtlar korunmalı.
- Kod değişikliğinden sonra uygun olduğunda `npm run lint`, `npm run test` ve `npm run build` komutlarıyla kontrol yapılmalı.
- Sadece dokümantasyon veya prompt değiştiyse uygulama testleri yerine Markdown yapısı, başlıklar ve hedef kitle uygunluğu kontrol edilmeli.

---

### Manuel Kurulum (Eğer AI Kullanmıyorsanız)

Manuel kurulum için kendi `.env` dosyanızı oluşturup API anahtarlarınızı girmeniz gerekmektedir. Kendi uygulamanızı internette nasıl yayınlayacağınızın detaylarını adım adım öğrenmek için **[Kurulum ve Yayınlama Rehberi'ni (DEPLOYMENT_GUIDE.md)](docs/DEPLOYMENT_GUIDE.md)** okuyun!

---

## 🔒 Firebase Kuralları Dağıtımı

Uygulamanın güvenlik kurallarını Firebase projenize dağıtmak için Firebase CLI kullanarak aşağıdaki komutları çalıştırabilirsiniz:

```bash
# Firebase oturumu açın
firebase login

# Projenizi seçin
firebase use --add

# Güvenlik kurallarını dağıtın
firebase deploy --only firestore:rules,storage
```

Firebase CLI'ı global kurmadıysanız aynı işlemleri şu şekilde yapabilirsiniz:

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules,storage
```

---

## 🤝 Katkı ve Geliştirme Kuralları

Bu proje eğitim odaklı olduğu için değişikliklerin küçük, anlaşılır ve test edilebilir olması beklenir.

1. Yeni özellik veya düzeltme için ayrı bir dal açın.
2. Kod değişikliklerini küçük parçalara bölün ve açıklayıcı Türkçe commit mesajları kullanın.
3. Öğrenciye görünen metinleri sade Türkçe yazın.
4. Firebase, güvenlik, rol veya mesajlaşma değişikliğinde `npm run test:security` çalıştırın.
5. Genel kod değişikliğinde `npm run lint`, `npm run test` ve `npm run build` kontrollerini çalıştırın.
6. Yeni özellik eklerken ilgili README, teknik doküman veya test planını güncelleyin.
7. `.env`, `.env.local` veya gerçek Firebase proje bilgilerini repoya eklemeyin.

---

## 📄 Klasör Yapısı

```
genctek-atlas/
├── public/
│   ├── assets/
│   │   └── map/
│   │       └── turkey.svg         # Türkiye SVG Haritası
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── style.css              # Global Vanilla CSS (Kırmızı-Beyaz)
│   ├── components/
│   │   ├── Header.jsx             # Gezinti Barı
│   │   ├── Hero.jsx               # Tanıtım Alanı
│   │   ├── Stats.jsx              # İstatistik Kartları
│   │   ├── Map.jsx                # SVG Harita İşleme
│   │   ├── Filters.jsx            # Filtreleme ve Arama
│   │   ├── EventCard.jsx          # Etkinlik Kartı
│   │   ├── ProjectCard.jsx        # Proje Kartı
│   │   ├── EventForm.jsx          # Etkinlik Kayıt Formu
│   │   ├── ProjectForm.jsx        # Proje Kayıt Formu
│   │   ├── Moderation.jsx         # Yönetim Paneli (Auth & Tablolar)
│   │   └── Footer.jsx             # Taban Alanı
│   ├── context/
│   │   └── AppContext.jsx         # Global State & Firebase Servisleri
│   ├── firebase/
│   │   └── config.js              # Firebase SDK Yapılandırması
│   ├── data/
│   │   ├── themes.json            # 18 GençTek Teması
│   │   └── cities.json            # 81 İl Bilgisi
│   ├── __tests__/                 # Vitest ve güvenlik doğrulama testleri
│   ├── App.jsx
│   └── main.jsx
├── firestore.rules                # Firestore Güvenlik Kuralları
├── storage.rules                  # Storage Güvenlik Kuralları
├── docs/                          # Ürün, güvenlik, test, deploy ve prompt dokümanları
├── ethics-check.md                # Etik inceleme ve AI kullanım kontrolü
├── README.md
├── LICENSE
└── .gitignore
```

---

## 📜 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakabilirsiniz.
