# GençTek Atlas - Final Sunum Metni (Presentation Script)

Bu belge, GençTek Vibe Coding Kampı sonunda jüriye yapılacak 3 dakikalık sunumun taslak metnini ve olası jüri sorularına yönelik hazırlıkları içerir.

---

## 🎙️ 3 Dakikalık Sunum Akışı

### 1. Giriş ve Problem Tanımı (0:00 - 0:30)

> _"Değerli jüri üyeleri ve katılımcılar, merhaba. Bugün sizlere Türkiye genelindeki GençTek ekosistemini bir araya getiren interaktif platformumuz **GençTek Atlas**'ı sunmaktan gurur duyuyorum._
>
> _Bildiğiniz gibi, Türkiye genelinde onlarca farklı ilde çok sayıda etkinlik ve öğrenci projesi üretiliyor. Ancak bu dinamik çalışmaları tek bir merkezden takip etmek, filtrelemek ve sergilemek zordu. GençTek Atlas, bu ihtiyacı tamamen interaktif, görsel ve modern bir Türkiye haritası üzerinden çözüyor."_

### 2. Ürün Özellikleri ve Canlı Demo (0:30 - 1:30)

> _"Platformumuz, jüriyi ve kullanıcıları karşılayan modern, kurumsal kırmızı-beyaz GençTek kimliğiyle ve premium buzlu cam (glassmorphism) efektleriyle tasarlanmış bir arayüze sahip._
>
> _Kullanıcılarımız için çift katmanlı bir harita deneyimi sunduk. İl bazında hızlı ve hafif gezinme için yerel **SVG Haritasını** kullanırken, gelişmiş coğrafi analizler için tek bir tıklamayla **Leaflet + OpenStreetMap İnteraktif Haritasına** geçiş yapabiliyoruz._
>
> _Leaflet modunda etkinlikler **MarkerCluster** ile kümelenirken, yoğunluğu görmek için **Isı Haritası (Heatmap)** katmanını aktif edebiliyoruz. Ayrıca filtreleme panelimiz ve 18 farklı temamız sayesinde kullanıcılar istedikleri kategorideki çalışmalara saniyeler içinde ulaşabiliyorlar."_

### 3. Serverless Firebase Mimarisi ve Güvenlik (1:30 - 2:15)

> _"En büyük teknik başarımız, arkada hiçbir özel sunucu tarafı barındırmayan **%100 Serverless Firebase** mimarisidir. Verilerimiz Cloud Firestore'da saklanırken, görsel ve prompt dosyaları Firebase Storage'da depolanıyor._
>
> _Güvenliği en üst düzeyde tutmak adına sunucu tarafında sıkı **Güvenlik Kuralları (rules)** tanımladık. Komisyon üyelerinin sadece kendi illerindeki etkinlik ve çalışma gruplarına salt okunur erişebilmesini sağladık. Genel kayıt aşamasında dışarıdan yetkisiz rol (`admin`, `coordinator`, `commission`) atamasını hem JS düzeyinde hem de sunucu kurallarında engelledik. Ayrıca 1-1 mesajlaşma sistemimizi gönderici/alıcı bazlı kurallarla tamamen izole ettik."_

### 4. Vibe Coding ve Etik Kontrol (2:15 - 3:00)

> _"Bu projeyi **Vibe Coding** yaklaşımıyla, yapay zekâyı bir kod kopyalama aracı olarak değil, bir eş programlama ortağı ve güvenlik danışmanı olarak kullanarak geliştirdik. prompts.md dosyamızda tüm prompt sürecimizi şeffafça paylaştık._
>
> _Proje bütününde 36 adet Vitest entegrasyon testini, ESLint kontrollerini ve yama doğrulama testlerini başarıyla uyguladık. Öğrencilerin yapay zekâ çıktılarını doğrulamalarını, telif haklarına uymalarını ve KVKK kurallarına sadık kalmalarını teşvik eden bir 'ethics-check.md' mekanizmasını platforma entegre ettik. Teşekkür ederiz!"_

---

## ❓ Olası Jüri Soruları ve Cevapları (SSS)

### S1: Neden SVG haritasını Leaflet yerine tercih etmek yerine her ikisini birden sundunuz?

- **Cevap:** _"SVG haritası hafif, responsive ve API anahtarı sınırlandırması olmadan il bazlı hızlı filtreleme için mükemmeldir. Ancak detaylı coğrafi konumlandırma, MarkerCluster kümelemesi, okul lokasyonları ve yoğunluk analizi (ısı haritası) için Leaflet ve OpenStreetMap entegrasyonu gerekiyordu. Biz her iki dünyanın da en iyi yanlarını bir araya getiren dinamik bir harita geçiş (toggle) mekanizması kurduk."_

### S2: Firebase API anahtarınız kodun içinde açıkça görünüyor. Bu bir güvenlik riski değil mi?

- **Cevap:** _"Firebase Web mimarisinde API anahtarı bir şifre değil, projenin kimliğidir. Güvenliğimizi `firestore.rules` ve `storage.rules` ile sağladık. Kurallarımız gereği, yetkisiz bir kullanıcı API anahtarını alıp veritabanını bozamaz, başkalarının verilerine erişemez veya yetkisiz roller atayamaz. Ayrıca `.env` sızıntılarını önlemek için `.gitignore` süzgeçlerimizi de güçlendirdik."_

### S3: Komisyon üyeleri ve koordinatörler için getirdiğiniz yetki hiyerarşisi nedir?

- **Cevap:** _"Koordinatör ve komisyon üyeleri sadece adminler/moderatörler tarafından sisteme eklenebilir. Komisyon üyeleri sadece kendi illerine kayıtlı okul etkinliklerini, başvuruları ve çalışma gruplarını listeleyebilirler ve bu bilgilere salt okunur olarak erişebilirler. Böylece yetki aşımı ve il dışı veri sızıntısı tamamen engellenmiştir."_
