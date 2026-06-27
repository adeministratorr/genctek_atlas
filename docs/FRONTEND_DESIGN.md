> **Note on Language / Dil Notu:**
> This document is prepared in both English and Turkish. The English version is provided to comply with the project's strict global rule stating that "all documentation must be strictly in English". The Turkish version is provided per the creator's request to make the project accessible and understandable for young developers in Turkey.
>
> _Bu belge hem İngilizce hem de Türkçe olarak hazırlanmıştır. İngilizce sürümü, projenin "tüm dokümantasyon mutlak suretle İngilizce olmalıdır" şeklindeki katı global kuralına uymak amacıyla eklenmiştir. Türkçe sürümü ise, projenin Türkiye'deki genç geliştiriciler için erişilebilir ve anlaşılır olması amacıyla proje sahibinin isteği üzerine eklenmiştir._

---

# Frontend & Design Document

## 1. Design System (UI/UX)

- **Color Palette:**
  - Primary: Corporate Red (`#e60000`, `#cc0000`)
  - Secondary/Backgrounds: White (`#ffffff`), Light Grays (`#f8f9fa`, `#e9ecef`)
  - Text: Dark Gray/Black (`#212529`)
- **Typography:** Modern Sans-Serif fonts (e.g., Inter, Roboto).
- **Aesthetics:**
  - Implementation of "Glassmorphism" for modals and overlaid elements.
  - Smooth micro-animations (`transition: 0.3s ease-in-out`) for interactive elements like cards, buttons, and map regions.

## 2. Interactive Maps (SVG & Leaflet Integration)

The project supports two mapping layers depending on complexity needs:

### A. Native SVG Map

- The map relies on a highly responsive SVG architecture for fast, lightweight rendering.
- **Hover States:** Provinces change color dynamically based on activity density.

### B. Leaflet & GeoJSON Map

- For advanced geo-visualizations, the map is powered by **React-Leaflet** using **GeoJSON** data for precise rendering of Turkey's 81 provinces.
- **Dynamic Polygons:** Hovering over a province dynamically alters the polygon fill color.
- **Marker Clustering:** `leaflet.markercluster` groups multiple events into visually appealing clusters to prevent UI clutter.

### Common Map Features

- **Tooltips:** Display province name and summary stats on cursor hover.
- **Click Actions:** Instantly update the main dashboard's filter state to show data for the clicked province.

## 3. Component Architecture

- **Header & Hero:** Introductory sections with clear Call-to-Actions.
- **Map & Filters:** The core interactive visual area.
- **Cards (EventCard, ProjectCard):** Standardized, reusable components displaying grid-based content.
- **Forms (EventForm, ProjectForm):** Controlled React forms featuring live validation, error boundaries, and loading states.
- **Moderation Dashboard:** Protected route/view utilizing data-tables with actionable buttons (Approve, Reject, Highlight).

## 4. Responsive Layout

- Mobile-first approach scaling up to ultra-wide desktop views.
- CSS Grid and Flexbox utilized for robust multi-dimensional layouts.

---

# Frontend ve Tasarım Belgesi (Frontend & Design)

## 1. Tasarım Sistemi (UI/UX)

- **Renk Paleti:**
  - Ana Renk: Kurumsal Kırmızı (`#e60000`, `#cc0000`)
  - Arka Planlar: Beyaz (`#ffffff`), Açık Griler (`#f8f9fa`, `#e9ecef`)
  - Metin: Koyu Gri/Siyah (`#212529`)
- **Tipografi (Yazı Tipi):** Modern Sans-Serif fontlar (örneğin Inter, Roboto).
- **Estetik Anlayış:**
  - Modal ve üzerine binen panellerde "Cam Efekti" (Glassmorphism) kullanımı.
  - Kartlar, butonlar ve harita illeri üzerinde pürüzsüz mikro animasyonlar (`transition: 0.3s ease-in-out`).

## 2. İnteraktif Haritalar (SVG & Leaflet Entegrasyonu)

Proje, ihtiyaca ve karmaşıklığa göre iki farklı haritalama katmanı destekler:

### A. Yerel SVG Harita

- Yüksek performanslı ve hafif bir reaktif SVG mimarisi üzerine kuruludur.
- **Hover (Üzerine Gelme):** İller, içerik yoğunluğuna göre dinamik olarak renk değiştirir.

### B. Leaflet & GeoJSON Harita

- Gelişmiş coğrafi görselleştirmeler için **React-Leaflet** ve **GeoJSON** veri formatı kullanılır.
- **Dinamik Poligonlar:** İl sınırları GeoJSON koordinatlarıyla çizilir ve üzerine gelindiğinde renk değiştirir.
- **İşaretçi Gruplama (Marker Clustering):** Aynı şehirdeki birden fazla etkinlik `leaflet.markercluster` kullanılarak gruplanır.

### Ortak Harita Özellikleri

- **Araç İpuçları (Tooltips):** İmleç ilin üzerine geldiğinde il adını ve özet istatistikleri gösterir.
- **Tıklama İşlemleri:** Tıklanan ilin verilerini göstermek üzere ana filtreleme sistemini anında günceller.

## 3. Bileşen (Component) Mimarisi

- **Header & Hero:** Kullanıcıyı yönlendiren (Call-to-Action) tanıtım bölümü ve üst menü.
- **Map & Filters (Harita ve Filtreler):** Temel interaktif görselleştirme alanı.
- **Cards (Etkinlik ve Proje Kartları):** Verileri ızgara (grid) düzeninde sunan, tekrar kullanılabilir standart bileşenler.
- **Forms (Kayıt Formları):** Anlık validasyon, hata yönetimi ve yüklenme durumları (loading states) içeren kontrollü React formları.
- **Moderasyon Paneli:** Korumalı bir rota üzerinden ulaşılan, tablolar ve aksiyon butonları (Onayla, Reddet, Öne Çıkar) içeren yönetim arayüzü.

## 4. Duyarlı (Responsive) Yerleşim

- Mobil öncelikli (mobile-first) tasarım anlayışıyla geliştirilmiş, geniş ekranlara kusursuz uyum sağlar.
- Esnek yapılar için yoğun CSS Grid ve Flexbox kullanımı.
