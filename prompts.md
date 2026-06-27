# GençTek Atlas - Prompt Arşivi (Prompt Library)

Bu belge, GençTek Atlas projesinin Vibe Coding (Yapay Zeka Destekli Hızlı Geliştirme) yaklaşımıyla geliştirilmesinde kullanılan ve öğrencilerin yapay zekaya verip benzer projeler üretebileceği örnek prompt kütüphanesidir.

---

## 1. Proje Fikri Geliştirme Promptları

- **Prompt:**
  > "Türkiye genelindeki GençTek etkinliklerini ve öğrenci projelerini haritada gösterecek bir platform geliştirmek istiyorum. Platformun sunucu tarafı olmayacak, tamamen Firebase kullanılacak. Bu sistem için bana ürün özellikleri ve kullanıcı deneyimi (UX) akışı tasarlar mısın?"

---

## 3. Harita Geliştirme Promptları

- **Prompt:**
  > "React projemde harici bir harita API'si (Leaflet vb.) kullanmadan, performanslı ve responsive çalışan bir Türkiye haritası yapmak istiyorum. SVG tabanlı dilsiz Türkiye haritası path'lerini React bileşeninde nasıl kullanabilirim? Hover yapınca il isminin görünmesi ve tıklayınca filtreleme yapması için gerekli event listener mimarisini kurgular mısın?"

---

## 4. Firebase Veri Modeli Promptları

- **Prompt:**
  > "Cloud Firestore üzerinde `events` (etkinlikler), `projects` (projeler) ve `themes` (temalar) koleksiyonları tasarlayacağım. İlişkisel verileri (etkinliğin teması, projenin bağlı olduğu etkinlik vb.) NoSQL yapısında nasıl modellemeliyim? Bana örnek JSON şemaları oluştur."

---

## 5. Form Geliştirme Promptları

- **Prompt:**
  > "React üzerinde validasyonlu bir Proje Kayıt Formu oluşturmak istiyorum. GitHub bağlantısının zorunlu olması ve 'https://github.com/' ile başlaması gerekiyor. Vibe Coding teması seçildiğinde ise 'Etik Kontrol Onaylandı' kutusunun işaretlenmesi zorunlu olmalı. Form hatalarını ekranda gösteren ve veriyi Firestore'a gönderen kodu yazar mısın?"

---

## 6. Güvenlik Kuralları Promptları

- **Prompt:**
  > "Firebase Firestore ve Storage için güvenlik kuralları (rules) yazmam gerekiyor. Kurallar şunları sağlamalı:
  >
  > 1. Herkes onaylanmış (onaylandi == true) verileri okuyabilsin.
  > 2. Kimliği doğrulanmamış kullanıcılar sadece 'onaylandi: false' olarak yeni kayıt ekleyebilsin.
  > 3. Sadece moderatörler (request.auth != null) verileri güncelleyebilsin veya silebilsin.
  > 4. Storage'a sadece görsel (max 5MB) ve prompt (.txt/.md - max 2MB) yüklenebilsin.
  >    Bu senaryoya uygun `firestore.rules` ve `storage.rules` kodunu yazar mısın?"

---

## 7. Hata Ayıklama (Debugging) Promptları

- **Prompt:**
  > "React uygulamasında Firebase verileri çekerken 'FirebaseError: Missing or insufficient permissions' hatası alıyorum. Bu hatanın neden kaynaklandığını, kuralları ve kodları karşılaştırarak nasıl çözebileceğimi açıklar mısın?"

---

## 8. UI/UX İyileştirme Promptları

- **Prompt:**
  > "GençTek'in kurumsal kimliğine uygun olarak kırmızı ve beyaz tonlarında, modern ve responsive bir CSS tasarımı istiyorum. Haritada illerin hover durumları, listelerdeki kartların tasarımı ve form modallarının arka planındaki cam efekti (glassmorphism) için modern Vanilla CSS kodlarını yazar mısın?"

---

## 9. Sunum Hazırlama Promptları

- **Prompt:**
  > "Vibe Coding kampı sonunda jüriye sunum yapacağım. Geliştirdiğim GençTek Atlas projesini (serverless, Firebase, interaktif harita, siber güvenlik kuralları ve etik kontrol listesi) 3 dakikada etkileyici bir şekilde anlatacak, yapay zeka katkısını dürüstçe vurgulayan örnek bir sunum metni hazırlar mısın?"
