> **Note on Language / Dil Notu:**
> This document is prepared in both English and Turkish. The English version is provided to comply with the project's strict global rule stating that "all documentation must be strictly in English". The Turkish version is provided per the creator's request to make the project accessible and understandable for young developers in Turkey.
>
> _Bu belge hem İngilizce hem de Türkçe olarak hazırlanmıştır. İngilizce sürümü, projenin "tüm dokümantasyon mutlak suretle İngilizce olmalıdır" şeklindeki katı global kuralına uymak amacıyla eklenmiştir. Türkçe sürümü ise, projenin Türkiye'deki genç geliştiriciler için erişilebilir ve anlaşılır olması amacıyla proje sahibinin isteği üzerine eklenmiştir._

---

# 🚀 Deployment & Setup Guide

Welcome to the **GençTek Atlas & Portal** project! This guide will walk you through downloading the project, configuring your own Firebase environment, and running it locally or deploying it. We will also provide instructions on how to automate this setup using **Google AI Studio / Antigravity**.

## 1. Prerequisites

Before you start, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- A Google/Firebase account

## 2. Setting Up Your Firebase Project

Since this project relies on Firebase (Firestore, Auth, Storage), you need to create your own Firebase project to get the API keys.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and give it a name (e.g., `my-genctek-atlas`).
3. Once the project is created, click the **Web icon (</>)** to register your app.
4. Copy the `firebaseConfig` object provided by Firebase. It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-app.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcde",
     measurementId: "G-ABCDE",
   };
   ```
5. Enable **Firestore**, **Authentication** (Email/Password), and **Storage** from the Firebase Console sidebar.

## 3. Local Project Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Genctek_Atlas.git
   cd Genctek_Atlas
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Rename the `.env.example` file to `.env` in the root directory and fill it with the values you copied from Firebase in Step 2:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcde
   VITE_FIREBASE_MEASUREMENT_ID=G-ABCDE
   ```
4. **Run the local development server:**
   ```bash
   npm run dev
   ```

## 4. Deploying to Firebase Hosting

To deploy your app to the public web (like `https://your-app.web.app`):

1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to your Firebase account:
   ```bash
   firebase login
   ```
3. Link your local project to your Firebase project:
   ```bash
   firebase use --add
   ```
   Select the project you created.
4. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

> [!CAUTION]
> **Security Warning:** When cloning this project to deploy your own production version, you must completely remove the local demo console (`src/components/DemoConsole.jsx`), reset all default administrator credentials and passwords in `src/context/AppContext.jsx`, and ensure Firebase security rules are set up correctly. Leaving the demo console active exposes your admin dashboard to unauthorized access!

---

## 🤖 Automating Setup with Antigravity / Google AI Studio

If you have access to Google AI Studio or **Antigravity**, you can ask the AI agent to set up the project, inject your API keys, and even deploy the app for you!

**Copy and paste the following prompt to your Antigravity agent:**

> _"I have just downloaded the GençTek Atlas project. I want you to configure it with my Firebase credentials and prepare it for deployment._
>
> _Here is my Firebase config object:_
> _[PASTE YOUR FIREBASE CONFIG JSON HERE]_
>
> _Please do the following:_
> _1. Create a `.env` file in the root directory and map my Firebase config values to the corresponding `VITE_FIREBASE_*` variables._
> _2. Update the `.firebaserc` file to use my `projectId` as the default project._
> _3. Run `npm install` to install all dependencies._
> _4. Run `npm run build` to ensure the project compiles correctly._
> _5. Finally, use the `firebase-basics` and `firebase-hosting-basics` skills to deploy the project to Firebase Hosting. If you need me to login, please let me know."_

---

---

# 🚀 Kurulum ve Yayınlama (Deployment) Rehberi

**GençTek Atlas ve Portalı** projesine hoş geldiniz! Bu rehber, projeyi bilgisayarınıza indirip kurmanız, kendi Firebase ortamınızı bağlamanız ve projeyi internette yayınlamanız (deploy etmeniz) için gereken adımları içerir. Ayrıca bu sürecin **Google AI Studio / Antigravity** ile nasıl otomatikleştirileceği de anlatılmıştır.

## 1. Ön Gereksinimler

Başlamadan önce bilgisayarınızda şunların kurulu olduğundan emin olun:

- [Node.js](https://nodejs.org/) (v18 veya üzeri)
- [Git](https://git-scm.com/)
- Bir Google/Firebase hesabı

## 2. Kendi Firebase Projenizi Oluşturma

Bu proje veritabanı, üyelik sistemi ve dosya depolama için Firebase kullanır. Bu yüzden kendi API anahtarlarınızı (keys) almalısınız.

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin.
2. **Add Project (Proje Ekle)** butonuna tıklayın ve bir isim verin (örn. `benim-genctek-atlas`).
3. Proje oluştuktan sonra, **Web ikonuna (</>)** tıklayarak bir web uygulaması kaydedin.
4. Firebase'in size verdiği `firebaseConfig` objesini kopyalayın. Şuna benzer:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "senin-uygulaman.firebaseapp.com",
     projectId: "proje-id-isim",
     storageBucket: "senin-uygulaman.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcde",
     measurementId: "G-ABCDE",
   };
   ```
5. Firebase panelinden (sol menüden) **Firestore**, **Authentication** (E-posta/Şifre) ve **Storage** servislerini aktifleştirin.

## 3. Projenin Bilgisayara Kurulumu

1. **Projeyi indirin (Clone):**
   ```bash
   git clone https://github.com/senin-kullanici-adin/Genctek_Atlas.git
   cd Genctek_Atlas
   ```
2. **Gerekli paketleri (kütüphaneleri) yükleyin:**
   ```bash
   npm install
   ```
3. **Çevre Değişkenlerini (Environment Variables) Ayarlayın:**
   Ana dizindeki `.env.example` dosyasının adını `.env` olarak değiştirin ve içini 2. adımda Firebase'den kopyaladığınız bilgilerle doldurun:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=senin-uygulaman.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=proje-id-isim
   VITE_FIREBASE_STORAGE_BUCKET=senin-uygulaman.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcde
   VITE_FIREBASE_MEASUREMENT_ID=G-ABCDE
   ```
4. **Geliştirici sunucusunu başlatın:**
   ```bash
   npm run dev
   ```
   Artık projeyi `http://localhost:5173` adresinde görebilirsiniz!

## 4. İnternette Yayınlama (Firebase Hosting)

Uygulamanızı herkesin girebileceği bir web sitesi (`https://senin-uygulaman.web.app`) haline getirmek için:

1. Firebase komut satırı aracını (CLI) yükleyin:
   ```bash
   npm install -g firebase-tools
   ```
2. Firebase hesabınıza giriş yapın:
   ```bash
   firebase login
   ```
3. Bilgisayarınızdaki projeyi, internetteki Firebase projenizle eşleştirin:
   ```bash
   firebase use --add
   ```
   Çıkan listeden oluşturduğunuz projeyi seçin.
4. Projeyi derleyip (build) canlıya alın (deploy):
   ```bash
   npm run build
   firebase deploy
   ```

> [!CAUTION]
> **Siber Güvenlik Uyarısı:** Projeyi klonlayıp kendi siteniz olarak canlıya alırken, yerel demo konsolunu (`src/components/DemoConsole.jsx`) ve ilgili sahte kullanıcı kodlarını uygulamadan tamamen kaldırmanız, varsayılan giriş bilgilerini ve parolaları sıfırlamanız gerekmektedir. Aksi takdirde yetkisiz kişiler yönetici panelinize erişebilir!

---

## 🤖 Antigravity / AI Studio ile Kurulumu Otomatikleştirme

Eğer Google AI Studio veya **Antigravity** kullanıyorsanız, yapay zeka ajanından tüm bu kurulum ve yayınlama işlemlerini sizin yerinize yapmasını isteyebilirsiniz!

**Seçenek 1: Tam Otomatik Kurulum (Firebase MCP ile - ÖNERİLEN)**
Hiç Firebase paneline girmeden yapay zekanın tüm süreci sizin adınıza halletmesi için aşağıdaki prompt'u verin:

> _"GençTek Atlas projesini indirdim. Bu projeyi Firebase'de tamamen sıfırdan benim için yapılandırmanı istiyorum. Lütfen **Firebase MCP** araçlarını kullanarak hesabımda uygun bir proje seç (veya oluştur), içine bir web uygulaması (app) kaydet ve `firebase_get_sdk_config` ile API anahtarlarını çek. Elde ettiğin bilgileri `.env.example` şablonunu kullanarak `.env` dosyasına yaz. Ardından `.firebaserc` dosyasını bu projeye göre ayarla, kütüphaneleri kur (npm install), projeyi derle (npm run build) ve son olarak Firebase Hosting'e deploy et."_

**Seçenek 2: Manuel Bilgilerle Kurulum**
Eğer kendi oluşturduğunuz config objeniz hazırsa aşağıdaki prompt'u kullanabilirsiniz:

> _"GençTek Atlas projesini indirdim. Bu projeyi kendi Firebase API anahtarlarımla yapılandırmanı ve internette canlıya almanı (deploy etmeni) istiyorum._
>
> _İşte benim Firebase ayar objem (config):_
> _[BURAYA FIREBASE CONFIG JSON BİLGİNİZİ YAPIŞTIRIN]_
>
> _Lütfen şu adımları benim için yap:_
> _1. Ana dizinde bir `.env` dosyası oluştur ve yukarıdaki Firebase config bilgilerimi `VITE_FIREBASE_*` değişkenleri ile eşleştir._
> _2. `.firebaserc` dosyasını güncelleyerek benim `projectId` bilgisini 'default' olarak ayarla._
> _3. Gerekli tüm kütüphaneleri kurmak için `npm install` komutunu çalıştır._
> _4. Projenin hatasız derlendiğinden emin olmak için `npm run build` komutunu çalıştır._
> _5. Son olarak, projeyi Firebase Hosting üzerinde canlıya al (deploy). Eğer terminalde 'firebase login' yapmam gerekirse lütfen beni yönlendir."_
