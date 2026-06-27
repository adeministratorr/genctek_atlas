> Note on Language / Dil Notu:
> This document is prepared in both English and Turkish. The English version is provided to comply with the project's strict global rule stating that "all documentation must be strictly in English". The Turkish version is provided per the creator's request to make the project accessible and understandable for young developers in Turkey.
>
> Bu belge hem İngilizce hem de Türkçe olarak hazırlanmıştır. İngilizce sürümü, projenin "tüm dokümantasyon mutlak suretle İngilizce olmalıdır" şeklindeki katı global kuralına uymak amacıyla eklenmiştir. Türkçe sürümü ise, projenin Türkiye'deki genç geliştiriciler için erişilebilir ve anlaşılır olması amacıyla proje sahibinin isteği üzerine eklenmiştir.

--------------------------------------------------------------------------------

GençTek Atlas
=============

GençTek Atlas is a web-based platform that visualizes GençTek events, student projects, and tech initiatives across Turkey on an interactive SVG map. It is built as a fully client-side application utilizing Firebase Serverless architecture, created during a Vibe Coding winter camp.

Technology Stack:
- Frontend: React (Vite)
- Styling: Vanilla CSS
- Backend & DB: Firebase (Firestore, Storage, Auth, Hosting)
- Icons: Lucide React

Vibe Coding Guides:
- Web app prompt guide: `docs/VIBE_CODING_PROMPTS.md`
- Android design and coding prompt guide: `docs/ANDROID_VIBE_CODING_PROMPTS.md`

The Android guide covers both sides of the mobile workflow:
- Vibe Design prompts for Stitch or a similar mobile design tool
- Vibe Coding prompts for Android Studio, Kotlin, Jetpack Compose, Firebase, role-based screens, security rules, tests, and APK build checks

How to Run Locally:
1. Ensure Node.js (v16+) is installed.
2. Clone this repository and run `npm install`.
3. Create a `.env` file in the root directory and add your Firebase credentials (VITE_FIREBASE_API_KEY, etc.).
4. Run `npm run dev` to start the local server.
5. Open http://localhost:5173 in your browser.

For full details, please refer to the README.md and the files in the docs/ folder.

--------------------------------------------------------------------------------

GençTek Atlas (Türkçe Çeviri)
=============

GençTek Atlas, Türkiye genelindeki GençTek etkinliklerini, öğrenci projelerini ve teknoloji girişimlerini interaktif bir SVG haritası üzerinde görselleştiren web tabanlı bir platformdur. Vibe Coding kış kampı sırasında, tamamen Firebase Serverless mimarisi kullanılarak istemci tarafında (client-side) çalışacak şekilde geliştirilmiştir.

Teknoloji Yığını:
- Frontend: React (Vite)
- Tasarım/Stil: Vanilla CSS
- Backend & Veritabanı: Firebase (Firestore, Storage, Auth, Hosting)
- İkonlar: Lucide React

Vibe Coding Rehberleri:
- Web uygulaması prompt rehberi: `docs/VIBE_CODING_PROMPTS.md`
- Android tasarım ve kodlama prompt rehberi: `docs/ANDROID_VIBE_CODING_PROMPTS.md`

Android rehberi mobil geliştirme akışının iki tarafını kapsar:
- Stitch veya benzeri bir mobil tasarım aracı için Vibe Design promptları
- Android Studio, Kotlin, Jetpack Compose, Firebase, rol bazlı ekranlar, güvenlik kuralları, testler ve APK derleme kontrolleri için Vibe Coding promptları

Yerel Kurulum ve Çalıştırma:
1. Sisteminizde Node.js (v16+) yüklü olduğundan emin olun.
2. Bu depoyu (repository) klonlayın ve `npm install` komutunu çalıştırın.
3. Ana dizinde bir `.env` dosyası oluşturun ve Firebase kimlik bilgilerinizi (VITE_FIREBASE_API_KEY, vb.) ekleyin.
4. Yerel sunucuyu başlatmak için `npm run dev` komutunu çalıştırın.
5. Tarayıcınızda http://localhost:5173 adresini açın.

Tüm detaylar için lütfen README.md dosyasına ve docs/ klasöründeki belgelere göz atın.
