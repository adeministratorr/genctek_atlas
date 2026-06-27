> **Note on Language / Dil Notu:**
> This document is prepared in both English and Turkish. The English version is provided to comply with the project's strict global rule stating that "all documentation must be strictly in English". The Turkish version is provided per the creator's request to make the project accessible and understandable for young developers in Turkey.
>
> _Bu belge hem İngilizce hem de Türkçe olarak hazırlanmıştır. İngilizce sürümü, projenin "tüm dokümantasyon mutlak suretle İngilizce olmalıdır" şeklindeki katı global kuralına uymak amacıyla eklenmiştir. Türkçe sürümü ise, projenin Türkiye'deki genç geliştiriciler için erişilebilir ve anlaşılır olması amacıyla proje sahibinin isteği üzerine eklenmiştir._

---

# Vibe Coding Guide for Youth (How to Build This)

Welcome, future developers! This guide is designed to help you recreate the **GençTek Atlas** project from scratch using AI tools like **Google AI Studio** or preferably **Google Antigravity**. For the best Vibe Coding experience, we strongly recommend selecting the **Gemini 3.5 Flash** model. This approach is called **Vibe Coding**—where you guide the AI with clear instructions ("prompts") to write the code for you.

## Step 1: Ideation & Setup

You need to tell the AI what you want to build and the technologies you want to use.

> **Prompt 1 (Setup):**
> "I want to build a web application using React, Vite, and Firebase. The app will be an interactive map of Turkey showing student tech projects. Act as an expert frontend developer and guide me through the terminal commands to create the Vite project and install Firebase and Lucide-React."

## Step 2: The Interactive Map (SVG & GeoJSON Options)

Depending on your preference, you can ask the AI to build a fast SVG map or a complex Leaflet map.

> **Prompt 2A (Simple SVG Map):**
> "I need a React component that renders a blank SVG map of Turkey with all 81 provinces as clickable `<path>` elements. When I hover over a province, it should turn red. Write the complete `Map.jsx` file and the necessary CSS."
>
> **Prompt 2B (Advanced Leaflet & GeoJSON Map):**
> "I need a React component that renders an interactive map of Turkey using `react-leaflet`. I have a GeoJSON file from an open-source GitHub repo containing the polygon coordinates for all 81 provinces. Please write a `Map.jsx` file that maps over the GeoJSON data, renders the province polygons, and adds a hover effect. Also, add `leaflet.markercluster` to group multiple map pins together."

## Step 3: Database & Firebase

Tell the AI to set up your backend.

> **Prompt 3 (Database):**
> "Write the Firebase configuration and setup code for Cloud Firestore. Create a form component (`ProjectForm.jsx`) that asks for 'Project Name', 'City', and 'GitHub Link'. The form must validate that the GitHub link starts with 'https://github.com/'. When submitted, save this data to a 'projects' collection in Firestore."

## Step 4: Security

AI can write the complex security rules.

> **Prompt 4 (Security):**
> "Write Firebase Firestore security rules for this project. Public users can only read documents where `onaylandi == true`. Anyone can create a document as long as `onaylandi` is forced to `false`. Only authenticated moderators can update or delete documents."

## Step 5: Design & Polish

Give the AI instructions about your brand colors.

> **Prompt 5 (Design):**
> "Update the CSS of my application. Use a corporate red and white theme. Apply a modern 'Glassmorphism' effect to the forms and add smooth micro-animations when hovering over buttons and map regions."

---

# Gençler İçin Vibe Coding Rehberi (Bunu Nasıl Yaparsın?)

Hoş geldin geleceğin yazılımcısı! Bu rehber, **GençTek Atlas** projesini **Google AI Studio** veya tercihen **Google Antigravity** kullanarak sıfırdan nasıl geliştirebileceğini göstermek için hazırlandı. Bu platformlarda en akıcı ve hızlı deneyimi yaşamak için model olarak **Gemini 3.5 Flash**'ı seçmeni öneriyoruz. Bu yaklaşıma **Vibe Coding** diyoruz; yani sen yapay zekaya ne istediğini net bir şekilde söylüyorsun ("prompt" veriyorsun), o da senin için kodu yazıyor.

## 1. Adım: Fikir ve Kurulum

Yapay zekaya ne yapmak istediğini ve hangi teknolojileri kullanacağını söylemelisin.

> **Prompt 1 (Kurulum):**
> "React, Vite ve Firebase kullanarak bir web uygulaması geliştirmek istiyorum. Uygulama, öğrenci teknoloji projelerini gösteren interaktif bir Türkiye haritası olacak. Uzman bir frontend geliştiricisi gibi davran ve Vite projesini kurmam, Firebase ve Lucide-React paketlerini yüklemem için terminal komutlarını adım adım göster."

## 2. Adım: İnteraktif Harita (SVG ve GeoJSON Seçenekleri)

Tercihine bağlı olarak yapay zekadan hızlı bir SVG haritası veya daha gelişmiş bir Leaflet haritası isteyebilirsin.

> **Prompt 2A (Basit SVG Haritası):**
> "81 ilin tıklanabilir `<path>` (yol) elementleri olarak çizildiği, dilsiz bir SVG Türkiye haritası render eden bir React bileşeni (component) istiyorum. Fareyle bir ilin üzerine geldiğimde (hover) rengi kırmızı olmalı. Bana eksiksiz `Map.jsx` dosyasını ve gerekli CSS kodlarını yaz."
>
> **Prompt 2B (Gelişmiş Leaflet & GeoJSON Haritası):**
> "`react-leaflet` kullanarak Türkiye'nin interaktif bir haritasını çizen bir React bileşeni istiyorum. Elimde açık kaynaklı bir GitHub reposundan (örn. alpers) aldığım 81 ilin poligon koordinatlarını içeren bir GeoJSON dosyası var. Lütfen bu GeoJSON verisini döngüye sokup il sınırlarını çizen ve fareyle üzerine gelindiğinde rengini kırmızı yapan bir `Map.jsx` dosyası yaz. Ayrıca, haritadaki iğneleri gruplamak için `leaflet.markercluster` entegrasyonunu koda ekle."

## 3. Adım: Veritabanı ve Firebase

Yapay zekaya arka plan (backend) sistemini kurdur.

> **Prompt 3 (Veritabanı):**
> "Cloud Firestore için Firebase yapılandırma (config) kodlarını yaz. Benden 'Proje Adı', 'Şehir' ve 'GitHub Linki' isteyen bir form bileşeni (`ProjectForm.jsx`) oluştur. Form, GitHub linkinin mutlaka 'https://github.com/' ile başladığını kontrol etmeli (validasyon). Form gönderildiğinde veriyi Firestore'daki 'projects' koleksiyonuna kaydet."

## 4. Adım: Güvenlik

Karmaşık güvenlik kurallarını yapay zeka senin için yazabilir.

> **Prompt 4 (Güvenlik):**
> "Bu proje için Firebase Firestore güvenlik kurallarını (rules) yaz. Herhangi bir kullanıcı sadece `onaylandi == true` olan belgeleri okuyabilsin. Sisteme giriş yapmamış anonim kişiler, sadece `onaylandi` değerini `false` olarak göndermek şartıyla yeni kayıt oluşturabilsin. Sadece kimliği doğrulanmış moderatörler belgeleri güncelleyebilsin veya silebilsin."

## 5. Adım: Tasarım ve İyileştirme

Yapay zekaya marka renklerin ve tasarım zevkin hakkında bilgi ver.

> **Prompt 5 (Tasarım):**
> "Uygulamamın CSS kodlarını güncelle. Kurumsal kırmızı ve beyaz tonlarında bir tema kullan. Formların arka planına modern 'Cam Efekti' (Glassmorphism) uygula. Ayrıca butonların ve haritadaki illerin üzerine gelindiğinde yumuşak mikro-animasyonlar (transition) eklensin."
