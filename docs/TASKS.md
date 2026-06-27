> **Note on Language / Dil Notu:**
> This document is prepared in both English and Turkish. The English version is provided to comply with the project's strict global rule stating that "all documentation must be strictly in English". The Turkish version is provided per the creator's request to make the project accessible and understandable for young developers in Turkey.
>
> _Bu belge hem İngilizce hem de Türkçe olarak hazırlanmıştır. İngilizce sürümü, projenin "tüm dokümantasyon mutlak suretle İngilizce olmalıdır" şeklindeki katı global kuralına uymak amacıyla eklenmiştir. Türkçe sürümü ise, projenin Türkiye'deki genç geliştiriciler için erişilebilir ve anlaşılır olması amacıyla proje sahibinin isteği üzerine eklenmiştir._

---

# Tasks & Roadmap

## Phase 1: Planning and Architecture

- [x] Define Product Requirements (PRD).
- [x] Select tech stack and outline system architecture.
- [x] Design Firestore NoSQL data schemas (`events`, `projects`, `users`, `groups`, `messages`, etc.).

## Phase 2: Core Frontend Development & Routing

- [x] Scaffold React application using Vite.
- [x] Implement global CSS and corporate design tokens.
- [x] Build the static SVG map component and wire up hover states.
- [x] Implement React Router for clean URL navigation (`/`, `/messages`, `/groups`, `/analytics`).

## Phase 3: Firebase Integration & Security

- [x] Initialize Firebase App and configure Web SDK.
- [x] Implement Authentication logic for multi-roles (Admin, Principal, Teacher, Student).
- [x] Write rigorous Firestore and Storage Security Rules (RBAC).

## Phase 4: Feature Implementation (V1 -> V2)

- [x] Build interactive filtering system (Map clicks + Text + Select inputs).
- [x] Develop Event and Project submission forms with validation.
- [x] Create the Admin Moderation Dashboard.
- [x] Build Teacher and Principal Dashboards.
- [x] Implement Study Group Hub and Task tracking.
- [x] Implement Direct Messaging and real-time chat.
- [x] Develop Notification and Global Announcement systems.

## Phase 5: Security & Final Polish

- [x] Perform security audits (XSS prevention, GitHub URL validation).
- [x] Ensure cross-device responsiveness.
- [ ] Add extensive Unit/Integration tests with Vitest.
- [ ] Deploy to Firebase Hosting.

---

# Görevler & Yol Haritası (Tasks)

## Aşama 1: Planlama ve Mimari

- [x] Ürün Gereksinimleri Belgesini (PRD) tanımla.
- [x] Teknoloji yığınını (Tech-Stack) seç ve sistem mimarisini oluştur.
- [x] Firestore NoSQL veri şemalarını tasarla (Kullanıcılar, Gruplar, Mesajlar dahil).

## Aşama 2: Temel Frontend Geliştirme & Routing

- [x] Vite kullanarak React uygulamasının temel iskeletini kur.
- [x] Global CSS ve kurumsal tasarım token'larını (renk/font) uygula.
- [x] Statik SVG Türkiye haritasını oluştur ve hover/etkileşim durumlarını bağla.
- [x] Temiz URL yapısı için React Router entegrasyonunu tamamla (`/`, `/messages`, `/groups`, `/analytics`).

## Aşama 3: Firebase Entegrasyonu ve Güvenlik

- [x] Firebase uygulamasını başlat (Init) ve Web SDK ayarlarını yap.
- [x] Çoklu roller (Öğretmen, Müdür, Öğrenci, Admin) için Kimlik Doğrulama (Auth) sistemini kur.
- [x] Kapsamlı Firestore ve Storage Güvenlik Kurallarını (RBAC) yaz.

## Aşama 4: Özelliklerin Geliştirilmesi (V1 -> V2)

- [x] İnteraktif filtreleme sistemini kur (Harita tıklamaları + Metin arama).
- [x] Etkinlik ve Proje kayıt formlarını geliştir.
- [x] Admin Moderasyon Panelini oluştur.
- [x] Öğretmen ve Okul Müdürü panellerini (Dashboard) geliştir.
- [x] Çalışma Grupları ve Görev (Task) takip sistemini kur.
- [x] Gerçek zamanlı Direkt Mesajlaşma (Chat) modülünü ekle.
- [x] Bildirim ve Genel Duyuru sistemlerini entegre et.

## Aşama 5: Güvenlik ve Son Rötuşlar

- [x] Güvenlik denetimlerini yap (XSS koruması, GitHub URL doğrulaması).
- [x] Tüm cihazlarda (mobil/masaüstü) kusursuz responsive tasarımı sağla.
- [ ] Vitest ile kapsamlı Birim (Unit) testleri yaz.
- [x] Uygulamayı Firebase Hosting üzerinde canlıya al (Deploy).
