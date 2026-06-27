> **Note on Language / Dil Notu:**
> This document is prepared in both English and Turkish. The English version is provided to comply with the project's strict global rule stating that "all documentation must be strictly in English". The Turkish version is provided per the creator's request to make the project accessible and understandable for young developers in Turkey.
>
> _Bu belge hem İngilizce hem de Türkçe olarak hazırlanmıştır. İngilizce sürümü, projenin "tüm dokümantasyon mutlak suretle İngilizce olmalıdır" şeklindeki katı global kuralına uymak amacıyla eklenmiştir. Türkçe sürümü ise, projenin Türkiye'deki genç geliştiriciler için erişilebilir ve anlaşılır olması amacıyla proje sahibinin isteği üzerine eklenmiştir._

---

# Product Requirements Document (PRD)

## 1. Project Overview

**GençTek Atlas & Portal** is a comprehensive educational platform and social network that visualizes GençTek events and tech initiatives across Turkey. Beyond a simple interactive map, it functions as a full-fledged ecosystem featuring Study Groups, Direct Messaging, Role-Based Dashboards, and Event Applications. It is built as a robust client-side application utilizing Firebase Serverless architecture (React, Firestore, Auth, Storage).

## 2. Target Audience & Roles

- **Students & Youth:** To discover events, join study groups, chat with peers, and submit tech projects.
- **Teachers (Danışmanlar):** To manage their students, track event applications, and oversee study groups via a dedicated Teacher Dashboard.
- **School Principals (Müdürler):** To monitor school-wide activities, student performance, and announcements via a dedicated Principal Dashboard.
- **Coordinators & Commission:** To manage events and applications at a regional (provincial) level.
- **Admin/Moderator:** To oversee the entire platform, approve projects, manage users, and broadcast global announcements.

## 3. Key Features

1. **Interactive Atlas:** An SVG map of Turkey featuring 81 provinces with dynamic filtering (Search, Theme, Format, City/District/School).
2. **Study Groups & Tasks:** Users can create and join study groups, share announcements, and assign/track tasks collaboratively.
3. **Direct Messaging:** Real-time chat system allowing students and teachers to communicate.
4. **Role-Based Dashboards:** Specialized interfaces for Teachers, Principals, and Admins to manage their specific domains.
5. **Event Applications & Moderation:** A complete pipeline for applying to events, and a moderation panel for evaluating applications and projects.
6. **Gamification & Notifications:** Real-time push notifications, XP systems, and badges for active students.

## 4. User Stories

- As a student, I want to join a Study Group for my school so I can collaborate on AI projects.
- As a teacher, I want to use my dashboard to view which of my students applied to the upcoming hackathon.
- As a principal, I want to monitor my school's leaderboard and see active study groups.
- As an admin, I want to broadcast a global announcement that reaches all registered users' notification panels.

---

# Ürün Gereksinimleri Belgesi (PRD)

## 1. Projeye Genel Bakış

**GençTek Atlas ve Portalı**, Türkiye genelindeki GençTek etkinliklerini ve teknoloji girişimlerini görselleştiren kapsamlı bir eğitim platformu ve sosyal ağdır. Sadece interaktif bir harita olmanın ötesinde; Çalışma Grupları, Direkt Mesajlaşma, Rol Bazlı Yönetim Panelleri (Dashboard) ve Etkinlik Başvuru süreçlerini içeren devasa bir ekosistemdir. Firebase Serverless mimarisi (React, Firestore, Auth, Storage) kullanılarak geliştirilmiştir.

## 2. Hedef Kitle ve Roller

- **Öğrenciler ve Gençler:** Etkinlikleri keşfetmek, çalışma gruplarına katılmak, akranlarıyla mesajlaşmak ve proje yüklemek için.
- **Öğretmenler / Danışmanlar:** Kendi öğrencilerini yönetmek, etkinlik başvurularını takip etmek ve grupları denetlemek için özel Öğretmen Paneli (Dashboard).
- **Okul Müdürleri:** Okul çapındaki aktiviteleri, öğrenci başarı sıralamalarını ve duyuruları izlemek için Müdür Paneli.
- **Koordinatörler ve Komisyon:** İl/Bölge bazında etkinlikleri ve başvuruları yönetmek için.
- **Admin / Moderatör:** Tüm platformu denetlemek, projeleri onaylamak, kullanıcıları yönetmek ve genel duyurular yapmak için.

## 3. Temel Özellikler

1. **İnteraktif Atlas:** İl, ilçe, okul, tema ve formata göre dinamik filtreleme yapabilen interaktif SVG Türkiye haritası.
2. **Çalışma Grupları ve Görevler:** Kullanıcıların grup kurabilmesi, duyuru yapabilmesi ve görev (task) ataması yapabilmesi.
3. **Direkt Mesajlaşma:** Öğrencilerin ve öğretmenlerin birebir iletişim kurmasını sağlayan gerçek zamanlı sohbet (chat) sistemi.
4. **Rol Bazlı Paneller (Dashboards):** Öğretmen, Müdür ve Adminlerin kendi yetki alanlarını yönetebilecekleri özelleştirilmiş arayüzler.
5. **Etkinlik Başvuruları ve Moderasyon:** Etkinliklere başvuru süreçlerinin uçtan uca yönetimi ve projelerin onaylanma sistemi.
6. **Oyunlaştırma ve Bildirimler:** Aktif öğrenciler için XP (deneyim puanı) ve rozet (badge) kazanımı ile gerçek zamanlı bildirim (notification) sistemi.

## 4. Kullanıcı Hikayeleri (User Stories)

- Bir öğrenci olarak, okulumdaki "Yapay Zeka Çalışma Grubu"na katılıp arkadaşlarımla görev dağılımı yapmak istiyorum.
- Bir öğretmen olarak, panelime girip hangi öğrencilerimin hackathon'a başvurduğunu görmek istiyorum.
- Bir okul müdürü olarak, okulumun liderlik tablosunu (leaderboard) ve aktif çalışma gruplarını takip etmek istiyorum.
- Bir admin olarak, tüm kullanıcılara ulaşacak acil bir duyuruyu bildirim paneline göndermek istiyorum.
