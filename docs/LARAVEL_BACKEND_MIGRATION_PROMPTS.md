# GençTek Atlas Laravel Backend ve Firebase'den Dönüşüm Promptları

> **Dil notu:**
> Bu rehber lise öğrencilerinin anlayabileceği sade Türkçe ile hazırlanmıştır.

Bu doküman, GençTek Atlas için **Laravel backend** oluşturmak ve mevcut istemcileri bu backend'e bağlamak isteyenler için hazırlanmıştır.

Önemli not: **GençTek Atlas normalde Firebase tabanlı bir uygulamadır.** Mevcut varsayılan mimari; React/Vite frontend, Firebase Authentication, Cloud Firestore, Firebase Storage ve Firebase Hosting üzerine kuruludur. Bu dokümandaki Laravel akışı, Firebase yerine kendi API sunucunuzu ve SQL veritabanınızı kullanmak istediğiniz durumlar için alternatif bir dönüşüm rehberidir.

Bu dönüşüm küçük bir değişiklik değildir. Firebase'de istemci doğrudan Auth, Firestore ve Storage ile konuşur. Laravel mimarisinde ise React frontend ve Android uygulama, Laravel API'ye istek atar; Laravel de veritabanı, dosya yükleme, roller ve güvenlik kontrollerini yönetir.

## Ne Zaman Laravel Backend Mantıklı?

Laravel backend şu durumlarda mantıklı olabilir:

- Verileri SQL tablolarında tutmak istiyorsan.
- Çok detaylı admin paneli ve raporlama gerekiyorsa.
- Kendi sunucunda API, kuyruk, e-posta ve dosya işleme yapmak istiyorsan.
- Web frontend ve Android uygulamanın aynı REST API'yi kullanmasını istiyorsan.
- Firebase maliyeti, kuralları veya vendor lock-in seni zorlamaya başladıysa.

Firebase mimarisi şu durumlarda daha basit kalır:

- Hızlı MVP yapmak istiyorsan.
- Gerçek zamanlı Firestore özellikleri yeterliyse.
- Sunucu yönetmek istemiyorsan.
- Öğrencilerle daha az backend karmaşıklığı olan bir akış izlemek istiyorsan.

## Hedef Laravel Mimarisi

Önerilen alternatif mimari:

- **Frontend:** React + Vite
- **Mobil:** Android + Kotlin + Jetpack Compose
- **Backend:** Laravel API
- **Kimlik doğrulama:** Laravel Sanctum veya güvenli token tabanlı API girişi
- **Veritabanı:** MySQL veya PostgreSQL
- **Dosya yükleme:** Laravel Storage, yerel disk veya S3 uyumlu depolama
- **Bildirimler:** Laravel notifications, e-posta, ileride push notification entegrasyonu
- **Test:** Laravel feature/unit testleri, frontend ve Android istemci testleri

---

## 1. Dönüşüm Kararı ve Yol Haritası

**Açıklama:**
Bu prompt kod yazdırmaz. Firebase'den Laravel'e geçmenin doğru karar olup olmadığını ve hangi sırayla ilerlemen gerektiğini netleştirir.

**Prompt:**

```text
GençTek Atlas normalde Firebase tabanlı bir uygulama.

Mevcut yapı:
- React/Vite frontend
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Hosting
- Demo Modu

Ben bu projeye alternatif olarak Laravel backend eklemek veya projeyi Laravel API mimarisine dönüştürmek istiyorum.

Ben lise öğrencisiyim. Lütfen bana sade bir karar ve yol haritası hazırla.

Bana şunları açıkla:
1. Firebase mimarisi ile Laravel backend mimarisi arasındaki fark
2. Laravel'e geçmenin avantajları
3. Laravel'e geçmenin zorlukları
4. Hangi özellikleri önce taşımam gerektiği
5. React frontend ve Android uygulamanın nasıl değişeceği
6. Firebase'i tamamen kaldırmadan önce hangi kontrolleri yapmam gerektiği

Şimdilik kod yazma. Önce dönüşüm planı çıkar.
```

---

## 2. Laravel Backend Projesi Kurulumu

**Açıklama:**
Bu prompt Laravel API projesini sıfırdan kurdurur. Öğrencinin dosya yapısını bilmediği varsayılır.

**Prompt:**

```text
GençTek Atlas için Laravel backend API projesi oluşturmak istiyorum.

Bu backend şu istemcilere hizmet verecek:
- React/Vite web frontend
- Android Jetpack Compose uygulaması

Lütfen:
1. Laravel projesini kurmak için terminal komutlarını sırayla yaz.
2. Her komutun ne işe yaradığını tek cümleyle açıkla.
3. API odaklı klasör yapısını planla.
4. Ortam değişkenleri için güvenli `.env.example` örneği hazırla.
5. Gerçek şifre, API anahtarı veya gizli bilgi yazma.
6. İlk çalışan `/api/health` endpoint'ini oluştur.
7. Bu endpoint'in nasıl test edileceğini göster.

Ben dosya yapısını bilmiyorum. Gerekli dosya ve klasörleri sen oluştur.
```

---

## 3. Firebase Koleksiyonlarını SQL Modeline Çevirme

**Açıklama:**
Firestore belge yapısı ile SQL tablo yapısı aynı değildir. Bu prompt veri modelini Laravel migration ve model yapısına çevirmek için kullanılır.

**Prompt:**

```text
GençTek Atlas şu Firebase koleksiyonlarını kullanıyor:
- users
- events
- projects
- groups
- group_announcements
- group_tasks
- direct_messages
- announcements
- notifications
- badges
- analyticsSummaries

Bu yapıyı Laravel ve SQL veritabanı için tablo modeline çevirmek istiyorum.

Lütfen her tablo için şunları hazırla:
1. Tablo adı
2. Alanlar ve veri tipleri
3. İlişkiler
4. İndeksler
5. Zorunlu alanlar
6. Varsayılan değerler
7. Laravel migration taslağı
8. Laravel model ilişkileri

Kurallar:
- Yeni etkinlik ve proje kayıtları `pending` durumunda başlasın.
- Public kullanıcılar sadece `approved` etkinlik ve projeleri görebilsin.
- Admin onayı gereken alanları normal kullanıcı değiştiremesin.
- Mesajlar sadece konuşma katılımcılarına açık olsun.
- Grup verileri sadece grup üyeleri ve yetkili kişiler tarafından görülsün.

Şimdilik controller yazma. Önce doğru veritabanı modelini kur.
```

---

## 4. Laravel Auth ve Rol Sistemi

**Açıklama:**
Firebase Auth yerine Laravel tarafında API token tabanlı giriş yapılır. Admin, müdür ve koordinatör rolleri kayıt formundan seçilmemelidir.

**Prompt:**

```text
GençTek Atlas Laravel backend için kimlik doğrulama ve rol sistemi kur.

İstediğim davranış:
- Kullanıcı e-posta ve şifre ile kayıt olabilsin.
- Kullanıcı e-posta ve şifre ile giriş yapabilsin.
- API token dönebilsin.
- Kullanıcı çıkış yapabilsin.
- Kayıt formunda sadece Öğrenci ve Öğretmen rolleri seçilebilsin.
- Admin, okul müdürü ve koordinatör rolleri kayıt formunda seçilemesin.
- Bu yüksek yetkili roller sadece admin tarafından atanabilsin.

Roller:
- student
- teacher
- principal
- coordinator
- commission
- admin

Lütfen:
1. Gerekli migration alanlarını yaz.
2. Auth controller oluştur.
3. Register, login, me ve logout endpoint'lerini oluştur.
4. Role middleware veya policy yapısını hazırla.
5. Hataları sade JSON mesajlarıyla döndür.
6. Feature testleri yaz.

Gerçek gizli anahtar yazma. Gerekli dosya ve klasörleri sen oluştur.
```

---

## 5. API Route Planı

**Açıklama:**
Bu prompt React ve Android'in kullanacağı REST API sözleşmesini oluşturur. Koddan önce endpoint listesi netleşmelidir.

**Prompt:**

```text
GençTek Atlas Laravel backend için REST API route planı hazırla.

Şu özellikler için endpoint listesi oluştur:
- Auth
- Kullanıcı profili
- Etkinlikler
- Projeler
- Etkinlik/proje gönderme
- Admin onay, ret ve öne çıkarma işlemleri
- Şehir, tema ve format filtreleri
- Çalışma grupları
- Grup görevleri
- Grup duyuruları
- Direkt mesajlaşma
- Bildirimler
- XP ve rozetler
- Analiz özetleri

Her endpoint için şunları yaz:
1. HTTP metodu
2. URL
3. Kim erişebilir?
4. Request örneği
5. Response örneği
6. Olası hata durumları

Kod yazma. Önce API sözleşmesini sade bir tablo olarak hazırla.
```

---

## 6. Etkinlik ve Proje API'leri

**Açıklama:**
Bu prompt public listeleme, kullanıcı gönderimi ve admin moderasyonunu kodlatır.

**Prompt:**

```text
GençTek Atlas Laravel backend için etkinlik ve proje API'lerini kodla.

İstediğim davranış:
- Herkes sadece approved etkinlik ve projeleri listeleyebilsin.
- Giriş yapan kullanıcı etkinlik veya proje gönderebilsin.
- Yeni gönderiler `pending` durumunda kaydedilsin.
- Admin pending kayıtları görebilsin.
- Admin kayıtları onaylayabilsin, reddedebilsin veya öne çıkarabilsin.
- Kullanıcı sadece kendi gönderilerini görebilsin ve izin verilen alanları düzenleyebilsin.

Validasyon:
- Başlık zorunlu olsun.
- Şehir zorunlu olsun.
- Tema zorunlu olsun.
- GitHub veya detay bağlantısı URL formatında olsun.
- Açıklama çok uzun olmasın.

Lütfen:
1. Controller'ları oluştur.
2. Form Request validasyon sınıflarını oluştur.
3. API Resource response sınıflarını oluştur.
4. Policy veya middleware kontrollerini ekle.
5. Feature testleri yaz.

Gerekli dosya ve klasörleri sen oluştur.
```

---

## 7. Dosya Yükleme ve Storage API'si

**Açıklama:**
Firebase Storage yerine Laravel Storage kullanılır. Dosya türü ve boyutu sınırlandırılmalıdır.

**Prompt:**

```text
GençTek Atlas Laravel backend için güvenli dosya yükleme API'si oluştur.

Kullanım alanları:
- Proje görseli
- Profil görseli
- Etkinlik afişi

Güvenlik kuralları:
- Sadece izin verilen görsel türleri yüklensin.
- Dosya boyutu sınırı olsun.
- Dosya adı güvenli şekilde yeniden üretisin.
- Kullanıcı sadece kendi yüklediği dosyaları yönetebilsin.
- Public gösterilecek dosyalar ile özel dosyalar ayrışsın.

Lütfen:
1. Upload endpoint'i oluştur.
2. Dosya validasyonunu yaz.
3. Storage disk kullanımını göster.
4. Response olarak dosya URL'si veya dosya kimliği döndür.
5. Hata mesajlarını sade JSON ile ver.
6. Testlerini yaz.

Gerçek sunucu anahtarı veya gizli bilgi yazma.
```

---

## 8. Gruplar, Görevler ve Duyurular API'si

**Açıklama:**
Bu prompt grup üyeliği ve görev yönetimini Laravel backend'e taşır.

**Prompt:**

```text
GençTek Atlas Laravel backend için çalışma grupları, görevler ve duyurular API'sini kodla.

Özellikler:
- Grup oluşturma
- Davet kodu ile gruba katılma
- Grup üyelerini listeleme
- Grup duyurusu oluşturma
- Grup görevleri oluşturma
- Görev durumunu değiştirme: todo, doing, done

Yetki kuralları:
- Grup verilerini sadece grup üyeleri ve yetkili kişiler görebilsin.
- Duyuru oluşturma yetkisi öğretmen, koordinatör veya admin gibi rollerde olsun.
- Öğrenci kendi görev durumunu güncelleyebilsin.
- Admin tüm grup verilerini yönetebilsin.

Lütfen:
1. Migration ve model ilişkilerini tamamla.
2. Controller ve route'ları oluştur.
3. Policy kontrollerini yaz.
4. Request validasyonlarını yaz.
5. Feature testleri ekle.

Gerekli dosya ve klasörleri sen oluştur.
```

---

## 9. Direkt Mesajlaşma ve Bildirim API'si

**Açıklama:**
Firestore gerçek zamanlı dinleme yerine Laravel API kullanılacaktır. İleride WebSocket veya polling eklenebilir.

**Prompt:**

```text
GençTek Atlas Laravel backend için direkt mesajlaşma ve bildirim API'si oluştur.

Mesajlaşma:
- Konuşma listesi
- Yeni konuşma başlatma
- Mesaj gönderme
- Mesajları listeleme
- Okundu bilgisini güncelleme
- Sadece konuşma katılımcıları erişebilsin

Bildirimler:
- Bildirim listesi
- Okundu olarak işaretleme
- Yeni görev bildirimi
- Yeni duyuru bildirimi
- Onaylanan veya reddedilen kayıt bildirimi

Lütfen:
1. Gerekli tabloları ve ilişkileri oluştur.
2. Controller ve route'ları yaz.
3. Policy kontrollerini ekle.
4. JSON response formatını tutarlı yap.
5. Feature testleri yaz.

Not:
- Gerçek zamanlı deneyim gerekiyorsa WebSocket veya kısa aralıklı yenileme seçeneklerini ayrıca açıkla.
```

---

## 10. Analiz ve Dashboard API'leri

**Açıklama:**
Bu prompt rol bazlı panel verilerini Laravel'de üretir.

**Prompt:**

```text
GençTek Atlas Laravel backend için analiz ve dashboard API'leri oluştur.

Rollere göre özetler:
- Öğrenci: kendi gönderileri, görevleri, XP ve rozetleri
- Öğretmen: kendi öğrencileri, başvurular, gruplar
- Okul müdürü: okul düzeyi etkinlik, proje ve öğrenci özetleri
- Koordinatör: şehir veya bölge özetleri
- Komisyon: yetki alanındaki başvuru ve grup özetleri
- Admin: bekleyen kayıtlar, tüm sistem özeti, güvenlik ve moderasyon verileri

Analizler:
- Şehirlere göre etkinlik sayısı
- Temalara göre proje sayısı
- Bekleyen kayıt sayısı
- En aktif okullar

Lütfen:
1. Endpoint'leri oluştur.
2. Role göre filtreleme yap.
3. Gereksiz kişisel veri döndürme.
4. Performans için indeks veya cache öner.
5. Feature testleri yaz.

Gerekli dosya ve klasörleri sen oluştur.
```

---

## 11. Laravel Güvenlik Kontrolü

**Açıklama:**
Firebase rules yerine Laravel'de güvenlik; validation, policy, middleware, rate limit, CORS ve güvenli dosya yükleme ile sağlanır.

**Prompt:**

```text
GençTek Atlas Laravel backend için güvenlik kontrolü yap.

Şunları kontrol et:
- Public kullanıcılar sadece approved etkinlik ve projeleri okuyabiliyor mu?
- Yeni gönderiler pending durumunda başlıyor mu?
- Sadece admin onay, ret, silme ve öne çıkarma yapabiliyor mu?
- Öğrenci sadece kendi özel profil verisini düzenleyebiliyor mu?
- Öğretmen sadece kendi öğrencileri ve ilişkili başvurulara erişebiliyor mu?
- Müdür sadece kendi okul özetini görebiliyor mu?
- Koordinatör sadece yetkili olduğu şehir veya bölge verilerini görebiliyor mu?
- Mesajları sadece konuşma katılımcıları okuyup yazabiliyor mu?
- Grup verileri sadece üyeler ve yetkili kişiler tarafından görülebiliyor mu?
- Dosya yükleme tür ve boyut sınırı var mı?
- URL alanları doğrulanıyor mu?
- Kullanıcı metni XSS riski oluşturmadan gösteriliyor mu?
- Rate limit uygulanıyor mu?
- CORS ayarları gereğinden fazla açık mı?

Bana:
1. Risk listesi
2. Gerekli düzeltmeler
3. Test senaryoları
4. Öncelik sırası
hazırla.
```

---

## 12. React Frontend'i Firebase'den Laravel API'ye Taşıma

**Açıklama:**
Bu prompt mevcut React frontend'i doğrudan Firebase SDK kullanmak yerine Laravel API'yi kullanacak hale getirir. Demo Modu korunmalıdır.

**Prompt:**

```text
GençTek Atlas mevcut React/Vite frontend'i normalde Firebase kullanıyor.

Şimdi frontend'i Laravel backend API kullanacak şekilde dönüştürmek istiyorum.

Mevcut Firebase kullanımları:
- Firebase Authentication
- Cloud Firestore veri okuma/yazma
- Firebase Storage dosya yükleme
- Demo Modu

Hedef:
- Frontend Laravel API'ye HTTP istekleri atsın.
- API base URL `.env` içinden gelsin.
- Token tabanlı giriş çalışsın.
- Demo Modu bozulmasın.
- Firebase kodu hemen silinmesin; önce API katmanı soyutlansın.

Lütfen:
1. Frontend için `apiClient` yapısı oluştur.
2. Auth işlemlerini Laravel endpoint'lerine bağla.
3. Etkinlik ve proje listeleme/gönderme işlemlerini API'ye taşı.
4. Grup, mesaj, bildirim ve panel verileri için servis dosyaları oluştur.
5. Hata mesajlarını sade Türkçe göster.
6. Rol bazlı ekran korumasını API'den gelen kullanıcı rolüne göre yap.
7. Demo Modu'nun Firebase ve Laravel olmadan çalışmaya devam etmesini sağla.

Gerekli dosya ve klasörleri sen oluştur. Büyük refactor yerine adım adım güvenli dönüşüm yap.
```

---

## 13. React Frontend İçin API Sözleşmesi Testi

**Açıklama:**
Bu prompt frontend'in Laravel API response formatına uyup uymadığını kontrol eder.

**Prompt:**

```text
GençTek Atlas React frontend'i Laravel API'ye bağlandı.

Şimdi API sözleşmesi testi yapmak istiyorum.

Kontrol edilecek endpoint'ler:
- /api/health
- /api/auth/register
- /api/auth/login
- /api/auth/me
- /api/events
- /api/projects
- /api/groups
- /api/conversations
- /api/notifications
- /api/dashboard

Lütfen:
1. Frontend servislerinin beklediği response formatını çıkar.
2. Laravel API'nin döndürdüğü response formatıyla karşılaştır.
3. Uyuşmazlık varsa küçük düzeltme öner.
4. Frontend testleri için örnek mock response hazırla.
5. Hata durumları için kullanıcıya gösterilecek Türkçe mesajları yaz.

Kod gerekiyorsa sadece ilgili servis ve test dosyalarını değiştir.
```

---

## 14. Android Uygulamayı Firebase'den Laravel API'ye Taşıma

**Açıklama:**
Bu prompt Android tarafındaki Firebase Auth, Firestore ve Storage kullanımını Laravel API istemcisine dönüştürür.

**Prompt:**

```text
GençTek Atlas Android uygulaması normalde Firebase kullanacak şekilde planlandı.

Şimdi Android uygulamayı Laravel backend API kullanacak hale getirmek istiyorum.

Mevcut Firebase kullanımları:
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Messaging hazırlığı

Hedef:
- Android uygulama Laravel API'ye HTTP istekleri atsın.
- API base URL güvenli yapılandırmadan gelsin.
- Kullanıcı giriş yapınca token güvenli şekilde saklansın.
- Token sonraki API isteklerinde gönderilsin.
- Demo Modu Firebase ve Laravel olmadan örnek verilerle çalışmaya devam etsin.

Lütfen:
1. Android için API client yapısını oluştur.
2. AuthRepository'yi Laravel login/register/me/logout endpoint'lerine bağla.
3. Explore, events, projects, groups, messages, notifications ve dashboard repository'lerini API'ye taşı.
4. Dosya yükleme için multipart request yapısını kur.
5. Hata mesajlarını sade Türkçe göster.
6. Rol bazlı ekranları API'den gelen kullanıcı rolüne göre yönet.
7. Firebase kodunu hemen tamamen silme; önce repository katmanında soyutlama yap.

Gerekli dosya ve klasörleri sen oluştur. Koddan sonra hangi parçanın ne işe yaradığını açıkla.
```

---

## 15. Android İçin Çevrimdışı ve Hata Durumu

**Açıklama:**
Laravel API internet gerektirir. Android uygulamada bağlantı hataları anlaşılır gösterilmelidir.

**Prompt:**

```text
GençTek Atlas Android uygulaması Laravel API'ye bağlanıyor.

Çevrimdışı ve hata durumlarını düzgün yönetmek istiyorum.

Şunları yap:
- İnternet yoksa kullanıcıya sade Türkçe mesaj göster.
- API sunucusu cevap vermiyorsa tekrar dene seçeneği göster.
- Token süresi dolduysa kullanıcıyı tekrar girişe yönlendir.
- 403 yetkisiz işlem hatasında rol uyarısı göster.
- 422 validasyon hatalarında alan bazlı hata göster.
- Demo Modu'na geçiş seçeneği sun.

Lütfen:
1. Ortak hata modelini oluştur.
2. Repository katmanında hata dönüşümünü yap.
3. Compose ekranlarında hata durumlarını göster.
4. Küçük test senaryoları yaz.
```

---

## 16. Firebase'den SQL'e Veri Taşıma Planı

**Açıklama:**
Gerçek veriler varsa doğrudan silinmemelidir. Önce veri dışa aktarma, dönüştürme ve test ortamına aktarma planı yapılmalıdır.

**Prompt:**

```text
GençTek Atlas verilerini Firebase Firestore'dan Laravel SQL veritabanına taşımak istiyorum.

Lütfen bana güvenli veri taşıma planı hazırla.

Plan şunları içersin:
1. Hangi koleksiyonların taşınacağı
2. Firestore belge yapısının SQL tablolara nasıl eşleneceği
3. Kullanıcı kimliklerinin nasıl korunacağı
4. Dosyaların Firebase Storage'dan Laravel Storage'a nasıl taşınacağı
5. Test ortamında deneme aktarımı
6. Veri doğrulama kontrolleri
7. Geri dönüş planı
8. Production geçişinde yapılacak son kontroller

Şimdilik kod yazma. Önce riskleri ve adımları açıkla.
```

---

## 17. Laravel Backend Test Planı

**Açıklama:**
Bu prompt Laravel API için manuel ve otomatik test planı oluşturur.

**Prompt:**

```text
GençTek Atlas Laravel backend için test planı hazırla.

Test edilecek alanlar:
- Register, login, me, logout
- Rol bazlı erişim
- Public etkinlik/proje listeleme
- Pending gönderi oluşturma
- Admin onay ve ret işlemleri
- URL validasyonu
- Dosya yükleme tür ve boyut kontrolü
- Grup üyelik erişimi
- Mesajlaşma katılımcı kontrolü
- Bildirim okundu bilgisi
- Dashboard ve analiz endpoint'leri
- Rate limit
- CORS

Bana tablo halinde şunları ver:
1. Test adı
2. Test türü: manuel, feature test veya unit test
3. Test adımları
4. Beklenen sonuç
5. Hata olursa kontrol edilecek yer

Sonra Laravel test dosyalarını oluşturmak için hangi komutları çalıştıracağımı yaz.
```

Kullanılabilecek temel komutlar:

```text
php artisan test
php artisan test --filter=Auth
php artisan test --filter=Event
php artisan route:list
php artisan migrate:fresh --seed
```

---

## 18. Laravel Backend Yayına Alma Planı

**Açıklama:**
Bu prompt backend yayına alınmadan önce yapılacak kontrolleri listeler.

**Prompt:**

```text
GençTek Atlas Laravel backend'i yayına almak istiyorum.

Bana yayın öncesi kontrol listesi hazırla.

Kontroller:
- `.env` gerçek değerleri repoda yok mu?
- APP_KEY üretildi mi?
- APP_DEBUG production ortamında kapalı mı?
- Veritabanı bağlantısı çalışıyor mu?
- Migration'lar production için hazır mı?
- Storage link veya cloud storage ayarı doğru mu?
- CORS sadece gerekli domainlere açık mı?
- Rate limit aktif mi?
- Queue gerekiyorsa worker ayarı yapıldı mı?
- Log ve hata izleme planı var mı?
- React frontend API base URL production adresine dönmüş mü?
- Android uygulama production API adresini kullanıyor mu?

Lütfen:
1. Komutları sırayla yaz.
2. Her komutun ne yaptığını açıkla.
3. Yayın sonrası duman testi listesi ver.
4. Geri dönüş planını açıkla.
```

---

## 19. Laravel Hata Ayıklama Promptları

### API 401 veya 403 Hatası

**Açıklama:**
Bu prompt token, giriş veya rol hatalarını çözmek için kullanılır.

**Prompt:**

```text
GençTek Atlas Laravel API'de 401 veya 403 hatası alıyorum.

Hata:
[HATA MESAJINI BURAYA YAPIŞTIR]

İstek:
[METHOD VE URL YAZ]

Kullanıcı rolü:
[ROLÜ YAZ]

Lütfen:
1. 401 ve 403 farkını sade Türkçe açıkla.
2. Token, middleware, policy ve rol kontrollerinde bakmam gereken yerleri söyle.
3. Küçük ve güvenli düzeltme öner.
4. Düzeltmeden sonra hangi testi çalıştıracağımı yaz.
```

### API 422 Validasyon Hatası

**Açıklama:**
Bu prompt form validasyon hatalarını çözmek için kullanılır.

**Prompt:**

```text
GençTek Atlas Laravel API'de 422 validasyon hatası alıyorum.

Hata:
[HATA MESAJINI BURAYA YAPIŞTIR]

Gönderdiğim veri:
[REQUEST BODY YAZ]

Lütfen:
1. Hangi alanın neden hatalı olduğunu açıkla.
2. Laravel Form Request tarafında kontrol edilecek yeri söyle.
3. React veya Android tarafında gönderilen veri yanlışsa düzeltme öner.
4. Kullanıcıya gösterilecek sade Türkçe hata mesajını yaz.
```

### Frontend API Bağlantı Hatası

**Açıklama:**
Bu prompt React frontend Laravel API'ye bağlanamadığında kullanılır.

**Prompt:**

```text
GençTek Atlas React frontend Laravel API'ye bağlanamıyor.

Hata:
[HATA MESAJINI BURAYA YAPIŞTIR]

Frontend API base URL:
[API URL YAZ]

Lütfen:
1. CORS, API URL, token ve network olasılıklarını kontrol et.
2. Frontend servis dosyalarında bakmam gereken yerleri söyle.
3. Laravel route ve middleware tarafında bakmam gereken yerleri söyle.
4. Sorunu izole etmek için küçük test istekleri öner.
```

### Android API Bağlantı Hatası

**Açıklama:**
Bu prompt Android uygulama Laravel API'ye bağlanamadığında kullanılır.

**Prompt:**

```text
GençTek Atlas Android uygulaması Laravel API'ye bağlanamıyor.

Hata:
[HATA MESAJINI BURAYA YAPIŞTIR]

API base URL:
[API URL YAZ]

Lütfen:
1. Android emulator veya gerçek cihazdan API adresine erişim durumunu açıkla.
2. HTTP/HTTPS, base URL, token ve internet izni kontrollerini listele.
3. API client veya repository tarafında bakmam gereken yerleri söyle.
4. Kullanıcıya gösterilecek sade hata mesajını öner.
```

---

## Kısa Yardımcı Promptlar

### Laravel Kodunu Anlat

```text
Bu Laravel kodunu lise öğrencisinin anlayacağı şekilde açıkla.

Lütfen:
1. Bu dosyanın ne işe yaradığını söyle.
2. Controller, model, migration, policy veya request sınıfıysa görevini açıkla.
3. Güvenlik açısından dikkat edilmesi gereken yerleri yaz.
4. Bu kodu değiştirirsem hangi testi çalıştırmam gerektiğini söyle.
```

### Küçük Backend Özelliği Ekle

```text
GençTek Atlas Laravel backend'e küçük bir özellik eklemek istiyorum:

[ÖZELLİĞİ BURAYA YAZ]

Lütfen:
1. Hangi route, controller, model veya migration dosyalarına dokunacağını söyle.
2. Rol ve yetki kontrolünü bozma.
3. Validasyon ekle.
4. Test yaz veya mevcut testi güncelle.
5. React frontend ve Android tarafında değişiklik gerekiyorsa ayrıca belirt.
```

### Firebase ve Laravel Karşılaştır

```text
GençTek Atlas'ta şu özelliği Firebase ile mi Laravel backend ile mi yapmalıyım?

Özellik:
[ÖZELLİĞİ BURAYA YAZ]

Lütfen:
1. Firebase ile yapmanın avantaj ve zorluklarını yaz.
2. Laravel ile yapmanın avantaj ve zorluklarını yaz.
3. Öğrenci projesi için daha pratik seçimi öner.
4. Güvenlik ve test açısından dikkat edilecekleri açıkla.
```
