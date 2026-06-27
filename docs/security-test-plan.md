# GençTek Atlas - Siber Güvenlik Test Planı (Security Test Plan)

Bu belge, GençTek Atlas platformunun Firebase altyapısının ve istemci tarafının güvenlik dayanıklılığını doğrulamak üzere siber güvenlik ekibi tarafından yürütülecek test senaryolarını içerir.

---

## 0. Otomatik Güvenlik Doğrulama Komutları

Bu kontroller gerçek Firebase proje bilgisi istemez. Kod, Firestore/Storage rules ve Firebase Hosting güvenlik başlıklarının temel güvenlik sözleşmelerini koruduğunu denetler.

```bash
npm run test:security
```

`test:rules` aynı güvenlik doğrulama setini çalıştıran kısa addır:

```bash
npm run test:rules
```

---

## 1. Firebase API Anahtarı ve İstemci Güvenliği Açıklaması

> [!NOTE]
> **API Anahtarı Yanlış Anlaşılması:**
> Firebase API anahtarının (`apiKey`) JavaScript kodlarında açıkça görünmesi bir güvenlik açığı **değildir**. Firebase mimarisinde API anahtarı bir şifre (secret) değil, istemcinin Firebase projesini bulmasını sağlayan bir kimlik belirleyicidir (identifier).
>
> **Asıl Güvenlik Duvarı:**
> Veritabanının ve dosyaların güvenliği tamamen Firebase sunucularında çalışan **Firestore Security Rules** ve **Storage Security Rules** kurallarına bağlıdır. API anahtarı çalınsa dahi, güvenlik kuralları ihlal edilemez.

---

## 2. Test Senaryoları

### Test 1: XSS (Cross-Site Scripting) Testi

- **Amaç:** Kullanıcı girdilerinin arayüzde doğrudan çalıştırılıp çalıştırılamayacağını test etmek.
- **Adımlar:**
  1.  Etkinlik veya Proje kayıt formunu açın.
  2.  Ad alanına `<script>alert('XSS')</script>` veya `<img src=x onerror=alert(1)>` yazın.
  3.  Açıklama alanına da benzer payload'lar yerleştirip formu gönderin (moderasyon panelinden onaylayın veya local state'de inceleyin).
- **Beklenen Sonuç:** React girdileri otomatik olarak escape ettiği (arındırdığı) için script çalışmamalı, ekranda düz metin olarak görünmelidir.

### Test 2: Yetkisiz Firestore Okuma Testi (Onaylanmamış Kayıtlar)

- **Amaç:** Kimliği doğrulanmamış bir kullanıcının, henüz onaylanmamış (`onaylandi == false`) kayıtları okumasını engellemek.
- **Adımlar:**
  1.  Tarayıcı konsolunu açın.
  2.  Firebase SDK'ini kullanarak doğrudan Firestore'dan `onaylandi: false` olan kayıtları çekmeye çalışın:
      ```javascript
      import { db } from "./src/firebase/config";
      import { collection, query, where, getDocs } from "firebase/firestore";
      const q = query(
        collection(db, "events"),
        where("onaylandi", "==", false),
      );
      await getDocs(q);
      ```
- **Beklenen Sonuç:** Firebase SDK, güvenlik kuralları (`firestore.rules`) gereği `Error: Permission denied` (Erişim Engellendi) hatası döndürmelidir.

### Test 3: Yetkisiz Firestore Yazma Testi (`onaylandi: true` ile Sahte Kayıt)

- **Amaç:** Bir kullanıcının doğrudan API çağrısı ile kendini onaylanmış gösteren (`onaylandi: true`) sahte bir kayıt eklemesini veya mevcut bir kaydı güncellemesini engellemek.
- **Adımlar:**
  1.  Tarayıcı konsolundan Firestore API'sini kullanarak onaylı bir kayıt eklemeyi deneyin:
      ```javascript
      import { db } from "./src/firebase/config";
      import { collection, addDoc } from "firebase/firestore";
      await addDoc(collection(db, "events"), {
        ad: "Sızma Testi Etkinliği",
        onaylandi: true, // Saldırgan doğrudan onaylamak istiyor
        tema: "vibe-coding",
        format: "Yüz Yüze",
        il: "Ankara",
      });
      ```
- **Beklenen Sonuç:** Firestore güvenlik kuralları yazmayı reddetmeli ve işlem başarısız olmalıdır.

### Test 4: Geçersiz Tema Kodu Testi

- **Amaç:** Güvenlik kurallarının veya validasyonların eksik tema kodu içeren kayıtları engellediğini doğrulamak.
- **Adımlar:**
  1.  Firestore'a `tema: "gecersiz-tema-kodu"` içeren bir etkinlik eklemeyi deneyin.
- **Beklenen Sonuç:** Form validasyonu veya Firestore rules girdiyi reddetmelidir.

### Test 5: Geçersiz GitHub URL Testi

- **Amaç:** Proje kayıtlarında GitHub URL'sinin güvenilir ve kurallara uygun biçimde girildiğini doğrulamak.
- **Adımlar:**
  1.  Proje kayıt formunda GitHub alanına `https://evil-site.com/github` veya sadece `my-github-profile` yazıp kaydetmeyi deneyin.
- **Beklenen Sonuç:** İstemci tarafındaki validasyon ve Firestore rules yazma isteğini engellemelidir (`githubLink.startsWith("https://github.com/")`).

### Test 6: İzin Verilmeyen Dosya Türü Yükleme Testi

- **Amaç:** Firebase Storage'a zararlı dosyaların (.exe, .bat, .zip, .js vb.) yüklenmesini engellemek.
- **Adımlar:**
  1.  Görsel yükleme alanına `malware.exe` veya prompt yükleme alanına `script.js` yüklemeyi deneyin.
- **Beklenen Sonuç:** Firebase Storage kuralları (`storage.rules`) dosya tipi eşleşmediği (`isValidImageType()` veya `isValidPromptType()`) için yüklemeyi reddetmelidir.

### Test 7: 5 MB Üzeri Dosya Yükleme Testi

- **Amaç:** Storage depolama alanını doldurmaya yönelik DDoS/dosya yükleme saldırılarını engellemek.
- **Adımlar:**
  1.  Görsel yükleme alanına 6 MB boyutunda bir görsel yüklemeyi deneyin.
- **Beklenen Sonuç:** `storage.rules` içindeki size limiti (`size < 5 * 1024 * 1024`) nedeniyle yükleme engellenmelidir.

### Test 8: Depoda Hassas Bilgi Taraması (Secret Scanning)

- **Amaç:** GitHub deposuna yanlışlıkla yüklenebilecek hassas verileri (gerçek Firebase şifreleri, admin şifreleri vb.) tespit etmek.
- **Adımlar:**
  1.  Proje dizininde `gitleaks detect --verbose` çalıştırarak commit geçmişinde API secret/credential taranması.
- **Beklenen Sonuç:** Hiçbir şifre veya hassas veri kod tabanında açıkça yer almamalıdır (çevre değişkenleri `.env` dosyası kullanılmalı ve `.gitignore` altında olmalıdır).

---

## 3. QA / Güvenlik Test Sonuç Takip Tablosu

Bu tablo manuel veya otomatik testlerden sonra doldurulur. Durum için `Geçti`, `Kaldı`, `Bekliyor` veya `Uygulanamaz` yazın.

| Test ID | Kontrol Alanı                 | Test Türü         | Beklenen Sonuç                                    | Gerçek Sonuç                  | Risk   | Durum    | Test Eden / Tarih  | Not                                              |
| :------ | :---------------------------- | :---------------- | :------------------------------------------------ | :---------------------------- | :----- | :------- | :----------------- | :----------------------------------------------- |
| T1      | XSS payload'ları              | Manuel            | Script çalışmaz, metin olarak görünür             |                               | Orta   | Bekliyor |                    |                                                  |
| T2      | Onaylanmamış kayıt okuma      | Manuel / Rules    | Yetkisiz kullanıcı `permission denied` alır       |                               | Yüksek | Bekliyor |                    |                                                  |
| T3      | `onaylandi: true` sahte yazma | Manuel / Rules    | İstek reddedilir                                  |                               | Yüksek | Bekliyor |                    |                                                  |
| T4      | Geçersiz tema kodu            | Manuel            | Form veya rules reddeder                          |                               | Orta   | Bekliyor |                    |                                                  |
| T5      | Geçersiz GitHub URL           | Otomatik / Manuel | `https://github.com/` dışı link reddedilir        | `npm run test:security` geçti | Orta   | Geçti    | Codex / 27.06.2026 | Manuel form testi ayrıca yapılabilir.            |
| T6      | Geçersiz dosya türü           | Otomatik / Manuel | Storage rules dosyayı reddeder                    | `npm run test:security` geçti | Yüksek | Geçti    | Codex / 27.06.2026 | Manuel yükleme testi ayrıca yapılabilir.         |
| T7      | Dosya boyutu limiti           | Otomatik / Manuel | 5 MB görsel ve 2 MB prompt limitleri uygulanır    | `npm run test:security` geçti | Orta   | Geçti    | Codex / 27.06.2026 | Manuel yükleme testi ayrıca yapılabilir.         |
| T8      | Secret scanning               | Manuel            | Hassas bilgi bulunmaz                             |                               | Yüksek | Bekliyor |                    |                                                  |
| T9      | Hosting güvenlik başlıkları   | Otomatik          | CSP, `nosniff`, referrer ve frame koruması vardır | `npm run test:security` geçti | Orta   | Geçti    | Codex / 27.06.2026 | Deploy sonrası gerçek header kontrolü yapılmalı. |

---

## 4. Otomatik Kontrollerin Kapsamı

`src/__tests__/securityVerification.test.js` şu sözleşmeleri kontrol eder:

- Genel kayıt akışı `admin`, `coordinator` ve `commission` rollerini doğrudan oluşturamaz.
- Direkt mesaj okuma/yazma kuralları sadece gönderici ve alıcıya izin verir.
- Bildirim okuma/silme sadece ilgili kullanıcıya açıktır.
- Etkinlik, proje ve etkinlik başvuruları varsayılan olarak `onaylandi: false` ile başlar.
- Normal kullanıcı verisi sadece `onaylandi == true` kayıtlar üzerinden sorgulanır.
- GitHub linki, dosya türü ve dosya boyutu validasyonları istemci ve Storage rules tarafında korunur.
- Firebase Hosting güvenlik başlıkları `firebase.json` içinde tanımlıdır.
