> **Note on Language / Dil Notu:**
> This document is prepared in both English and Turkish. The English version is provided to comply with the project's strict global rule stating that "all documentation must be strictly in English". The Turkish version is provided per the creator's request to make the project accessible and understandable for young developers in Turkey.
>
> _Bu belge hem İngilizce hem de Türkçe olarak hazırlanmıştır. İngilizce sürümü, projenin "tüm dokümantasyon mutlak suretle İngilizce olmalıdır" şeklindeki katı global kuralına uymak amacıyla eklenmiştir. Türkçe sürümü ise, projenin Türkiye'deki genç geliştiriciler için erişilebilir ve anlaşılır olması amacıyla proje sahibinin isteği üzerine eklenmiştir._

---

# Technology Stack (Tech-Stack)

## 1. Core Technologies

- **Frontend Framework:** React 19 (Initialized via Vite)
- **Routing:** React Router v6 (`react-router-dom`)
- **Styling:** Vanilla CSS (Zero-dependency custom design system)
- **Icons:** Lucide React
- **Mapping & Geo-Data:**
  - **Leaflet & React-Leaflet:** Used for the core interactive map, rendering dynamic layers, tooltips, and markers.
  - **Leaflet MarkerCluster:** Handles clustering for dense project/event areas.
  - **GeoJSON:** The standard format used to define province boundaries (polygons) and coordinate data, ensuring accurate geographic rendering.

## 2. Backend & Infrastructure (Serverless)

- **Provider:** Firebase (Google Cloud)
- **Database:** Cloud Firestore (NoSQL Document database)
  - Collections:
    - `users`: Core profile data for students, teachers, admins, principals.
    - `teachers`: Legacy/Specific teacher profile extensions.
    - `students`: Legacy/Specific student profile extensions.
    - `events`: Approved and pending events.
    - `projects`: Approved and pending projects.
    - `event_applications`: Student applications to specific events.
    - `custom_schools`: School entries added by users when not found in static data.
    - `groups`: Study groups created by users/teachers.
    - `group_announcements`: Announcements within specific study groups.
    - `group_tasks`: Collaborative tasks within study groups.
    - `direct_messages`: Real-time chat messages between users.
    - `announcements`: Global announcements broadcasted by admins.
    - `notifications`: Push-like notifications for users (XP, Badges, etc.).
- **File Storage:** Firebase Storage (For image and markdown file uploads)
- **Authentication:** Firebase Authentication (Email/Password for moderation access)
- **Hosting:** Firebase Hosting (Planned for production deployment)

## 3. Tooling & Quality Assurance

- **Build Tool:** Vite
- **Linting:** ESLint with React plugin
- **Testing:** Vitest & React Testing Library (for unit/component tests)
- **Package Manager:** NPM

## 4. Security

- Role-Based Access Control (RBAC) enforced tightly through `firestore.rules`.
- Firestore Rules enforcing read-only access for public data (`onaylandi: true`), and restricted reads for private groups/messages.
- Storage rules strictly limiting file types and sizes (e.g. 5MB for images).

---

# Teknoloji Yığını (Tech-Stack)

## 1. Temel Teknolojiler

- **Frontend Framework:** React 19 (Vite kullanılarak oluşturulmuştur)
- **Sayfa Yönlendirme (Routing):** React Router v6 (`react-router-dom`)
- **Stil / Tasarım (Styling):** Vanilla CSS (Dışa bağımlılığı olmayan özel tasarım sistemi)
- **İkonlar:** Lucide React
- **Haritalama ve Coğrafi Veri (Mapping & Geo-Data):**
  - **Leaflet & React-Leaflet:** Ana interaktif haritanın oluşturulması, dinamik katmanlar, araç ipuçları ve işaretçiler (marker) için kullanılır.
  - **Leaflet MarkerCluster:** Çok sayıda etkinliğin olduğu illerde işaretçileri gruplamak (cluster) için kullanılır.
  - **GeoJSON:** İl sınırlarının (poligon) ve koordinat verilerinin tanımlanmasında kullanılan, doğru coğrafi çizimleri sağlayan standart veri formatıdır.

## 2. Backend & Altyapı (Sunucusuz / Serverless)

- **Sağlayıcı:** Firebase (Google Cloud)
- **Veritabanı:** Cloud Firestore (NoSQL Belge tabanlı veritabanı)
  - Koleksiyonlar (Tablolar):
    - `users`: Öğrenci, öğretmen, müdür ve admin profil verileri.
    - `teachers`: Öğretmen ek profil detayları.
    - `students`: Öğrenci ek profil detayları.
    - `events`: Onaylanmış ve bekleyen etkinlikler.
    - `projects`: Onaylanmış ve bekleyen projeler.
    - `event_applications`: Öğrencilerin etkinlik başvuruları.
    - `custom_schools`: Statik listede bulunamayıp kullanıcılar tarafından eklenen okullar.
    - `groups`: Çalışma grupları.
    - `group_announcements`: Çalışma gruplarındaki duyurular.
    - `group_tasks`: Gruplardaki görev dağılımları.
    - `direct_messages`: Kullanıcılar arası gerçek zamanlı sohbet mesajları.
    - `announcements`: Adminler tarafından yapılan genel duyurular.
    - `notifications`: Kullanıcılara giden bildirimler (XP, Rozet vb.).
- **Dosya Depolama:** Firebase Storage (Görsel ve markdown dosyası yüklemeleri için)
- **Kimlik Doğrulama:** Firebase Authentication (Tüm roller için E-posta/Şifre)
- **Barındırma:** Firebase Hosting (Canlı ortam için)

## 3. Araçlar & Kalite Güvencesi (QA)

- **Derleme Aracı (Build Tool):** Vite
- **Kod Standartları (Linting):** ESLint (React eklentisiyle birlikte)
- **Test:** Vitest & React Testing Library (Birim ve bileşen testleri için)
- **Paket Yöneticisi:** NPM

## 4. Güvenlik ve Mimari

- `firestore.rules` üzerinden son derece sıkı bir Rol Bazlı Erişim Kontrolü (RBAC) mekanizması.
- Ortak verilerin okunabilmesi ve özel verilerin (mesajlar, çalışma grupları) sadece yetkili kişilere gösterilmesini sağlayan Firestore kuralları.
- Dosya boyutu (ör. 5MB görsel) ve format sınırları belirleyen Storage güvenlik kuralları.
