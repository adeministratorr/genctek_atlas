# GençTek Atlas Android Vibe Design & Coding Promptları

> **Dil notu:**
> Bu rehber lise öğrencilerinin anlayabileceği sade Türkçe ile hazırlanmıştır.

Bu rehber, **GençTek Atlas** uygulamasının Android sürümünü tasarlamak ve kodlatmak için hazırlanmıştır. Amaç iki parçayı düzenli ilerletmektir:

1. **Vibe Design:** Stitch gibi bir tasarım aracında mobil ekranları tasarlamak.
2. **Vibe Coding:** AI Studio veya Android kod yazabilen bir yapay zeka aracıyla Jetpack Compose kodlarını üretmek.

Bu doküman gerçek bir Android projesi varmış gibi dosya adı ezberletmez. Öğrenci sıfırdan başlayabilir. Promptlarda yapay zekadan gerekli dosya ve klasörleri kendisinin oluşturması istenir.

## Nasıl Kullanılır?

1. Önce tasarım promptlarını sırayla kullan.
2. Her ekran için çıktı aldıktan sonra ekran görüntüsü veya dışa aktarma dosyası oluştur.
3. Sonra kodlama promptlarına geç.
4. Her kodlama adımından sonra uygulamayı çalıştır.
5. Hata çıkarsa en sondaki hata ayıklama promptlarını kullan.

## Her Promptta Geçerli Ana Kural

Bir yapay zeka aracına prompt verirken aşağıdaki cümleyi promptun başına ekleyebilirsin:

```text
Ben lise öğrencisiyim ve Android uygulama geliştirmeye yeni başlıyorum. Dosya adlarını veya klasör yapısını bilmiyorum. Gerekli dosya ve klasörleri sen oluştur. Her adımda ne yaptığını kısa ve anlaşılır şekilde açıkla.
```

---

## 1. Android Uygulama Fikrini Netleştirme

**Açıklama:**
Bu prompt kod yazdırmaz. Uygulamanın Android sürümünde hangi ekranların olacağını, kimlerin kullanacağını ve hangi sırayla geliştirileceğini netleştirir.

**Prompt:**

```text
GençTek Atlas'ın Android uygulamasını yapmak istiyorum.

Uygulama şunları yapacak:
- Türkiye'deki teknoloji etkinliklerini ve öğrenci projelerini gösterecek.
- Şehir, tema, format ve arama filtreleri olacak.
- Öğrenciler etkinlik veya proje gönderebilecek.
- Öğretmenler kendi öğrencilerini ve başvuruları takip edebilecek.
- Okul müdürleri okulun genel durumunu görebilecek.
- Koordinatörler şehir veya bölge düzeyinde verileri inceleyebilecek.
- Adminler gelen kayıtları onaylayabilecek, reddedebilecek veya öne çıkarabilecek.
- Çalışma grupları, görevler, duyurular, mesajlaşma, bildirimler, XP ve rozetler olacak.

Ben lise öğrencisiyim. Lütfen bana sade bir Android geliştirme yol haritası hazırla.

Bana şunları ver:
1. Android uygulamasının amacı
2. Kullanıcı rolleri
3. Ana ekranlar
4. İlk sürümde yapılacak en küçük çalışan uygulama
5. Daha sonra eklenecek gelişmiş özellikler

Şimdilik kod yazma. Önce planı anlaşılır şekilde çıkar.
```

---

## 2. Vibe Design Yol Haritası

**Açıklama:**
Bu bölüm Stitch veya benzeri bir tasarım aracında ekranları üretmek içindir. Kod yazdırmaz. Tasarımda amaç, ekranların mobilde anlaşılır, sade ve güvenli bir kullanıcı akışına sahip olmasıdır.

**Prompt:**

```text
GençTek Atlas Android uygulaması için mobil tasarım sistemi oluştur.

Tasarım dili:
- Öğrenciler için sade, güven veren ve modern olsun.
- Kırmızı, beyaz ve açık gri ana renkler olsun.
- Başarı, uyarı ve bilgi durumları için destek renkleri ekle.
- Mobil ekranda metinler taşmasın.
- Butonlar ve formlar dokunması kolay büyüklükte olsun.
- Kartlar 8px veya daha az yuvarlak köşeli olsun.
- Gereksiz süsleme yerine okunabilirlik ve hızlı kullanım öncelikli olsun.

Bana şu tasarım kararlarını hazırla:
1. Renk paleti
2. Yazı boyutları
3. Buton stilleri
4. Form alanı stilleri
5. Kart ve liste stilleri
6. Boş durum, hata durumu ve yükleniyor durumu örnekleri
7. Alt navigasyon yapısı

Kod yazma. Sadece mobil tasarım rehberi hazırla.
```

---

## 3. Giriş, Kayıt ve Demo Modu Tasarımı

**Açıklama:**
Bu prompt giriş ekranlarını tasarlatır. Güvenlik için admin, müdür ve koordinatör rolleri kayıt formundan seçilmez. Bu roller daha sonra yetkili kişiler tarafından atanır.

**Prompt:**

```text
GençTek Atlas Android uygulaması için Giriş Yap, Kayıt Ol ve Demo Modu ekranlarını tasarla.

Giriş ekranında şunlar olsun:
- Uygulama adı ve kısa açıklama
- E-posta alanı
- Şifre alanı
- Giriş Yap butonu
- Şifremi unuttum bağlantısı
- Demo Modu ile Dene butonu

Kayıt ekranında şunlar olsun:
- Ad soyad
- E-posta
- Şifre
- Okul adı
- Şehir
- Rol seçimi olarak sadece Öğrenci ve Öğretmen olsun.

Güvenlik notu:
- Admin, okul müdürü ve koordinatör rolleri kayıt formundan seçilmesin.
- Bu roller daha sonra yetkili panelinden atanacak şekilde düşünülür.

Tasarım:
- Kırmızı-beyaz kurumsal renkleri kullan.
- Hata mesajlarını sade Türkçe göster.
- Çevrimdışı veya Firebase hatası olursa Demo Modu seçeneği görünür olsun.
- Mobil ekranda tek elle kullanılabilecek sade bir yerleşim yap.
```

---

## 4. Keşfet, Harita ve Filtre Tasarımı

**Açıklama:**
Bu prompt ana keşfet ekranını tasarlatır. İlk tasarımda tam çalışan harita şart değildir; Türkiye haritası yer tutucusu veya basit şehir seçimi yeterlidir.

**Prompt:**

```text
GençTek Atlas Android uygulaması için Keşfet ekranını tasarla.

Ekranda şunlar olsun:
- Üstte arama kutusu
- Şehir filtresi
- Tema filtresi
- Format filtresi
- Türkiye haritası alanı veya şehir seçimi alanı
- Seçilen şehre ait etkinlik ve proje kartları
- Etkinlik Ekle ve Proje Ekle için görünür ama rahatsız etmeyen aksiyon butonları

Kartlarda şunlar görünsün:
- Başlık
- Şehir
- Tema
- Tarih veya proje durumu
- Onay durumu rozeti: Onaylandı, Beklemede veya Reddedildi

Tasarım:
- İlk bakışta arama ve filtreler anlaşılır olsun.
- Liste çok uzarsa dikey kaydırma rahat olsun.
- Harita yüklenemezse anlaşılır bir boş durum tasarla.
- Mobilde kartlar sıkışmasın.
```

---

## 5. Etkinlik ve Proje Gönderme Tasarımı

**Açıklama:**
Bu prompt öğrenci gönderim formlarını tasarlatır. Yeni gönderiler doğrudan yayına çıkmaz; önce onay bekler.

**Prompt:**

```text
GençTek Atlas Android uygulaması için Etkinlik Ekle ve Proje Ekle ekranlarını tasarla.

Etkinlik formunda şunlar olsun:
- Etkinlik adı
- Şehir
- Okul veya kurum
- Tarih
- Tema
- Format: Yüz yüze, çevrim içi veya hibrit
- Kısa açıklama
- Başvuru veya detay bağlantısı

Proje formunda şunlar olsun:
- Proje adı
- Şehir
- Okul
- Takım veya öğrenci adı
- Tema
- Kısa açıklama
- GitHub veya proje bağlantısı
- Görsel yükleme alanı

Davranış:
- Zorunlu alanlar açıkça işaretlensin.
- Hatalar sade Türkçe ile gösterilsin.
- Gönderimden sonra "Kaydın onay için gönderildi" mesajı görünsün.
- Yeni kayıtların durumu varsayılan olarak "Beklemede" olsun.
```

---

## 6. Gruplar, Görevler ve Duyurular Tasarımı

**Açıklama:**
Bu prompt çalışma grupları ekranını tasarlatır. Grup verileri sadece ilgili üyeler ve yetkili kişiler tarafından görülmelidir.

**Prompt:**

```text
GençTek Atlas Android uygulaması için Çalışma Grupları ekranını tasarla.

Ekranda şunlar olsun:
- Grup listesi
- Yeni Grup Oluştur butonu
- Davet Kodu ile Katıl alanı
- Grup detay ekranı
- Duyurular sekmesi
- Görev Panosu sekmesi

Görev panosunda şu kolonlar olsun:
- Yapılacak
- Yapılıyor
- Tamamlandı

Görev kartlarında şunlar görünsün:
- Görev başlığı
- Sorumlu kişi
- Son tarih
- Durum

Tasarım:
- Kanban panosu mobilde yatay kaydırılabilir olsun.
- Duyurular ve görevler birbirine karışmasın.
- Boş grup durumunda kullanıcıya sade bir yönlendirme göster.
```

---

## 7. Mesajlaşma, Bildirim, XP ve Profil Tasarımı

**Açıklama:**
Bu prompt kullanıcıya yakın ekranları tasarlatır. Mesajlaşmada sadece konuşma katılımcıları mesajları görebilmelidir.

**Prompt:**

```text
GençTek Atlas Android uygulaması için Mesajlar, Bildirimler ve Profil ekranlarını tasarla.

Mesajlar ekranında şunlar olsun:
- Konuşma listesi
- Okunmamış mesaj rozeti
- Mesaj detay ekranı
- Balonlu mesaj görünümü
- Mesaj yazma alanı

Bildirimlerde şunlar olsun:
- Onaylanan veya reddedilen kayıt bildirimi
- Yeni görev bildirimi
- Yeni duyuru bildirimi
- Yeni mesaj bildirimi

Profil ekranında şunlar olsun:
- Ad soyad
- Rol
- Okul ve şehir
- XP göstergesi
- Rozetler
- Gönderilen etkinlik ve proje sayısı

Tasarım:
- Mesaj ekranı temiz ve okunabilir olsun.
- Bildirimler önem sırasına göre anlaşılır görünsün.
- Profil ekranı öğrenciyi motive etsin ama gereksiz süsleme kullanmasın.
```

---

## 8. Yönetim Panelleri ve Analiz Tasarımı

**Açıklama:**
Bu prompt öğretmen, müdür, koordinatör ve admin panellerini tasarlatır. Her rol sadece kendi yetkisine uygun verileri görmelidir.

**Prompt:**

```text
GençTek Atlas Android uygulaması için rol bazlı paneller tasarla.

Öğretmen panelinde şunlar olsun:
- Kendi öğrencilerinin gönderileri
- Bekleyen başvurular
- Grup ve görev özeti

Okul müdürü panelinde şunlar olsun:
- Okulun etkinlik ve proje sayıları
- Öğrenci katılım özeti
- Onay bekleyen okul kayıtları

Koordinatör panelinde şunlar olsun:
- Şehir veya bölge özeti
- Tema dağılımı
- Öne çıkan etkinlik ve projeler

Admin panelinde şunlar olsun:
- Bekleyen kayıtlar
- Onayla, Reddet ve Öne Çıkar aksiyonları
- Kullanıcı rol yönetimi
- Güvenlik ve rapor özeti

Analiz ekranında şunlar olsun:
- Şehirlere göre etkinlik sayısı
- Temalara göre proje sayısı
- Bekleyen kayıt sayısı
- En aktif okullar

Tasarım:
- Paneller yoğun bilgi gösterse bile okunabilir olsun.
- Tehlikeli aksiyonlarda onay penceresi kullan.
- Rol yetkileri ekranda karışmasın.
```

---

## 9. Tasarımları Kodlama Aracına Aktarma

**Açıklama:**
Bu adım tasarımdan koda geçiştir. Stitch veya kullandığın tasarım aracı farklı dışa aktarma seçenekleri sunabilir; bu yüzden tek bir dosya formatına bağlı kalma.

**Prompt:**

```text
Sana GençTek Atlas Android uygulaması için hazırladığım mobil tasarımları ekledim.

Ekler şunlardan biri veya birkaçı olabilir:
- Ekran görüntüleri
- Tasarım notları
- Dışa aktarılan tasarım dosyası
- Renk ve yazı tipi notları

Lütfen önce tasarımları incele ve bana şu özeti çıkar:
1. Ekran listesi
2. Ortak tasarım sistemi
3. Navigasyon akışı
4. Tekrar kullanılacak bileşenler
5. Kodlamaya başlamadan önce eksik gördüğün bilgiler

Şimdilik tam uygulama kodu yazma. Önce tasarımı Android Jetpack Compose'a nasıl çevireceğini planla.
```

---

## 10. Android Proje Kurulumu

**Açıklama:**
Bu prompt Android projesini sıfırdan başlatır. Jetpack Compose, Kotlin ve Firebase için temel yapı hazırlanır.

**Prompt:**

```text
GençTek Atlas Android uygulamasını sıfırdan kurmak istiyorum.

Şu teknolojileri kullan:
- Kotlin
- Jetpack Compose
- Material 3
- Navigation Compose
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Messaging
- Coil veya benzeri hafif bir görsel yükleme kütüphanesi
- Test için JUnit ve Compose UI testleri

Lütfen:
1. Android Studio'da hangi proje türünü seçmem gerektiğini söyle.
2. Paket adını öner.
3. Gradle bağımlılıklarını hazırla.
4. Gerekli klasör yapısını sen planla.
5. İlk çalışan boş Compose ekranını oluştur.
6. Uygulamayı nasıl çalıştıracağımı açıkla.

Ben dosya yapısını bilmiyorum. Gerekli dosya ve klasörleri sen oluştur.
```

---

## 11. Tema, Bileşenler ve Navigasyon Kodlama

**Açıklama:**
Bu prompt tasarım sistemini Compose koduna taşır. Tekrar kullanılan buton, kart ve form bileşenleri bu aşamada kurulur.

**Prompt:**

```text
GençTek Atlas Android uygulaması için tasarım sistemini Jetpack Compose ile kodla.

Şunları oluştur:
- Renk paleti
- Yazı stilleri
- Genel tema
- Ana buton bileşeni
- Form alanı bileşeni
- Bilgi kartı bileşeni
- Boş durum bileşeni
- Hata mesajı bileşeni
- Yükleniyor göstergesi

Sonra şu ekranlar için Navigation Compose yapısı kur:
- Giriş
- Kayıt
- Keşfet
- Etkinlik Ekle
- Proje Ekle
- Gruplar
- Mesajlar
- Profil
- Panel

Alt navigasyon sadece giriş yaptıktan sonra görünsün.

Gerekli dosya ve klasörleri sen oluştur. Koddan sonra hangi parçanın ne işe yaradığını sade şekilde açıkla.
```

---

## 12. Firebase Bağlantısı ve Demo Modu

**Açıklama:**
Bu prompt Firebase bağlantısını ve demo modu davranışını kurdurur. Firebase çalışmazsa uygulama tamamen bozulmamalıdır.

**Prompt:**

```text
GençTek Atlas Android uygulamasına Firebase bağlantısı ekle.

Şunları kur:
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Messaging için hazırlık

Davranış:
- Firebase yapılandırması eksikse uygulama çökmesin.
- Demo Modu çalışsın ve örnek veriler göstersin.
- Gerçek Firebase verisi ile demo verisi birbirine karışmasın.
- Hata mesajları sade Türkçe olsun.

Güvenlik:
- Gerçek gizli anahtar veya özel dosya içeriği yazma.
- Açık kaynak repoya konmaması gereken dosyalar varsa örnek dosya kullan.
- Firebase güvenliğinin sadece uygulama koduyla sağlanamayacağını, Firestore ve Storage kurallarının da gerektiğini not olarak açıkla.

Gerekli dosya ve klasörleri sen oluştur.
```

---

## 13. Veritabanı Modeli

**Açıklama:**
Bu prompt Firestore koleksiyonlarını planlatır. İyi model, güvenlik kurallarını ve ekranları daha kolay yapar.

**Prompt:**

```text
GençTek Atlas Android uygulaması için Firestore veritabanı modelini hazırla.

Şu koleksiyonları planla:
- users
- events
- projects
- groups
- groupTasks
- announcements
- conversations
- messages
- notifications
- badges
- analyticsSummaries

Her koleksiyon için şunları yaz:
1. Alan adları
2. Alan türleri
3. Örnek belge
4. Hangi rolün okuyabileceği
5. Hangi rolün yazabileceği

Kurallar:
- Yeni etkinlik ve proje kayıtları varsayılan olarak pending durumunda başlasın.
- Public kullanıcılar sadece approved etkinlik ve projeleri okuyabilsin.
- Mesajları sadece konuşma katılımcıları okuyup yazabilsin.
- Grup verilerini sadece grup üyeleri ve yetkili kişiler görebilsin.
- Admin onayı gerektiren alanları normal kullanıcı değiştiremesin.

Şimdilik kod yazma. Önce veri modelini sade tablo gibi açıkla.
```

---

## 14. Giriş, Kayıt ve Rol Kontrolü Kodlama

**Açıklama:**
Bu prompt kimlik doğrulama ekranlarını kodlatır. Kayıtta güvenli rol modeli korunur.

**Prompt:**

```text
GençTek Atlas Android uygulaması için giriş, kayıt ve rol kontrolü kodlarını yaz.

İstediğim davranış:
- Kullanıcı e-posta ve şifre ile giriş yapabilsin.
- Yeni kullanıcı kayıt olabilsin.
- Kayıt formunda sadece Öğrenci ve Öğretmen rolleri seçilebilsin.
- Admin, okul müdürü ve koordinatör rolleri kayıt formunda seçilemesin.
- Bu yüksek yetkili roller daha sonra admin panelinden atanacak şekilde veri modeli hazır olsun.
- Giriş yapan kullanıcının rolü Firestore users koleksiyonundan okunsun.
- Role göre panel ekranı değişsin.
- Çıkış yapma çalışsın.
- Demo Modu Firebase olmadan örnek kullanıcılarla çalışsın.

Form hataları:
- Boş e-posta
- Geçersiz e-posta
- Kısa şifre
- Bağlantı hatası
- Yetkisiz işlem

Gerekli dosya ve klasörleri sen oluştur. Koddan sonra akışı sade şekilde açıkla.
```

---

## 15. Keşfet, Harita ve Filtre Kodlama

**Açıklama:**
Bu prompt ana ekranı kodlatır. İlk sürümde basit ve güvenilir bir harita/şehir seçimi yapılır; Google Maps ayrı geliştirme adımıdır.

**Prompt:**

```text
GençTek Atlas Android uygulaması için Keşfet ekranını Jetpack Compose ile kodla.

İlk sürümde şunları yap:
- Arama kutusu
- Şehir filtresi
- Tema filtresi
- Format filtresi
- Basit Türkiye haritası yer tutucusu veya şehir seçimi alanı
- Etkinlik kartları
- Proje kartları
- Boş durum ve yükleniyor durumu

Veri davranışı:
- Firebase varsa approved etkinlik ve projeleri Firestore'dan oku.
- Firebase yoksa Demo Modu örnek verilerini göster.
- Arama ve filtreler yerel olarak çalışsın.

Google Maps notu:
- İlk sürümü Google Maps'e bağlı yapma.
- Google Maps gerekiyorsa bunu ayrı bir geliştirme adımı olarak öner.
- API anahtarı ve kota/billing konularını kısa not olarak açıkla.

Gerekli dosya ve klasörleri sen oluştur. Koddan sonra nasıl test edeceğimi yaz.
```

---

## 16. Etkinlik ve Proje Formları Kodlama

**Açıklama:**
Bu prompt gönderim formlarını kodlatır. Kullanıcı girdileri doğrulanmalı ve güvenli kaydedilmelidir.

**Prompt:**

```text
GençTek Atlas Android uygulaması için Etkinlik Ekle ve Proje Ekle ekranlarını kodla.

İstediğim davranış:
- Kullanıcı giriş yapmamışsa forma giremesin.
- Zorunlu alanlar kontrol edilsin.
- GitHub veya bağlantı alanı geçerli URL değilse hata gösterilsin.
- Görsel yükleme varsa dosya türü ve boyutu kontrol edilsin.
- Yeni kayıtlar Firestore'a status = "pending" olarak kaydedilsin.
- Kullanıcıya "Kaydın onay için gönderildi" mesajı gösterilsin.
- Demo Modu'nda kayıtlar geçici listeye eklensin.

Güvenlik:
- Kullanıcı HTML veya zararlı metin yazsa bile uygulama bunu güvenli metin olarak göstersin.
- Admin onayı gereken alanları normal kullanıcı değiştiremesin.

Gerekli dosya ve klasörleri sen oluştur. Koddan sonra hangi validasyonları yaptığını açıkla.
```

---

## 17. Gruplar, Görevler ve Duyurular Kodlama

**Açıklama:**
Bu prompt çalışma grubu özelliklerini kodlatır.

**Prompt:**

```text
GençTek Atlas Android uygulaması için Çalışma Grupları, Görevler ve Duyurular özelliklerini kodla.

Şunları yap:
- Grup listesi ekranı
- Yeni grup oluşturma
- Davet kodu ile gruba katılma
- Grup detay ekranı
- Duyurular sekmesi
- Görev panosu sekmesi
- Görev durumu değiştirme: Yapılacak, Yapılıyor, Tamamlandı

Yetki davranışı:
- Grup içeriğini sadece grup üyeleri ve yetkili öğretmen/admin görebilsin.
- Duyuru oluşturma yetkisi öğretmen veya admin gibi yetkili rollerde olsun.
- Öğrenci kendi görev durumunu güncelleyebilsin.

Demo Modu'nda örnek grup, duyuru ve görev verileri göster.

Gerekli dosya ve klasörleri sen oluştur. Koddan sonra bu yetki kontrolünü sade şekilde açıkla.
```

---

## 18. Mesajlaşma, Bildirim ve Profil Kodlama

**Açıklama:**
Bu prompt kullanıcı etkileşimi ekranlarını kodlatır.

**Prompt:**

```text
GençTek Atlas Android uygulaması için Mesajlaşma, Bildirimler ve Profil ekranlarını kodla.

Mesajlaşma:
- Konuşma listesi olsun.
- Mesaj detay ekranı olsun.
- Firestore'da gerçek zamanlı mesaj akışı kullan.
- Sadece konuşma katılımcıları mesajları okuyup yazabilsin.
- Okunmamış mesaj sayısı göster.

Bildirimler:
- Onaylanan veya reddedilen kayıt bildirimi
- Yeni görev bildirimi
- Yeni duyuru bildirimi
- Yeni mesaj bildirimi

Profil:
- Kullanıcı bilgileri
- Rol
- Okul ve şehir
- XP
- Rozetler
- Gönderi özetleri

Demo Modu'nda örnek mesaj, bildirim ve profil verileri göster.

Gerekli dosya ve klasörleri sen oluştur. Koddan sonra hangi verilerin gerçek zamanlı dinlendiğini açıkla.
```

---

## 19. Paneller ve Analiz Kodlama

**Açıklama:**
Bu prompt rol bazlı yönetim ekranlarını kodlatır.

**Prompt:**

```text
GençTek Atlas Android uygulaması için rol bazlı panelleri kodla.

Roller:
- Öğrenci
- Öğretmen
- Okul müdürü
- Koordinatör
- Admin

Davranış:
- Kullanıcı rolüne göre doğru paneli görsün.
- Öğretmen sadece kendi öğrencileri ve ilişkili başvuruları görsün.
- Okul müdürü sadece kendi okul özetini görsün.
- Koordinatör şehir veya bölge özetini görsün.
- Admin bekleyen kayıtları onaylayabilsin, reddedebilsin ve öne çıkarabilsin.
- Admin kullanıcı rolleri için güvenli rol atama ekranı görebilsin.

Analiz:
- Şehirlere göre etkinlik sayısı
- Temalara göre proje sayısı
- Bekleyen kayıtlar
- En aktif okullar

Tehlikeli işlemler:
- Onay, ret, silme ve rol değiştirme işlemlerinde onay penceresi göster.

Gerekli dosya ve klasörleri sen oluştur. Koddan sonra rol kontrolü akışını sade şekilde açıkla.
```

---

## 20. Firestore ve Storage Güvenlik Kuralları

**Açıklama:**
Bu prompt güvenlik kurallarını yazdırır. Android uygulama kodu tek başına güvenlik sağlamaz; asıl sınırlandırma Firebase kurallarında yapılmalıdır.

**Prompt:**

```text
GençTek Atlas için Firestore ve Firebase Storage güvenlik kuralları hazırla.

Güvenlik hedefleri:
- Public kullanıcılar sadece approved etkinlik ve projeleri okuyabilsin.
- Yeni etkinlik ve proje gönderileri pending olarak başlasın.
- Sadece admin onaylayabilsin, reddedebilsin, silebilsin veya öne çıkarabilsin.
- Öğrenciler sadece kendi özel profil verilerini düzenleyebilsin.
- Öğretmenler sadece kendi öğrencileri ve ilişkili başvurulara erişebilsin.
- Okul müdürleri sadece kendi okul özetini görebilsin.
- Koordinatörler sadece yetkili oldukları şehir veya bölge verilerini görebilsin.
- Mesajları sadece konuşma katılımcıları okuyup yazabilsin.
- Grup verilerini sadece grup üyeleri ve yetkili kişiler görebilsin.
- Storage dosya türü ve dosya boyutu sınırı koysun.

Bana şunları ver:
1. Firestore rules taslağı
2. Storage rules taslağı
3. Hangi varsayımlarla yazdığını açıkla
4. Bu kuralları test etmek için manuel test listesi hazırla

Kuralları yazarken sade açıklamalar ekle.
```

---

## 21. Manuel Test Planı

**Açıklama:**
Bu prompt uygulamayı elle test etmek için kontrol listesi oluşturur.

**Prompt:**

```text
GençTek Atlas Android uygulaması için manuel test planı hazırla.

Şu alanları test etmek istiyorum:
- Giriş ve kayıt
- Demo Modu
- Rol bazlı ekranlar
- Keşfet ekranı
- Arama ve filtreleme
- Etkinlik gönderme
- Proje gönderme
- Admin onay ve ret işlemleri
- Grup oluşturma ve davet kodu
- Görev durumu değiştirme
- Mesajlaşma erişim kontrolü
- Bildirimler
- Profil, XP ve rozetler
- Çevrimdışı veya Firebase hata durumu

Bana tablo halinde şunları ver:
1. Test adı
2. Test adımları
3. Beklenen sonuç
4. Hata olursa kontrol edilecek yer

Kod yazma. Sadece test planı hazırla.
```

---

## 22. Otomatik Test Yazma

**Açıklama:**
Bu prompt temel otomatik testleri yazdırır.

**Prompt:**

```text
GençTek Atlas Android uygulaması için otomatik testler yaz.

Test etmek istediğim alanlar:
- Form validasyonları
- GitHub veya URL kontrolü
- Arama ve filtreleme
- Rol bazlı ekran seçimi
- Giriş yapılmadan korumalı ekrana erişim
- Demo Modu veri akışı
- Görev durumu değiştirme

Şunları kullan:
- JUnit
- Kotlin test araçları
- Compose UI testleri

Lütfen:
1. Test dosyalarını oluştur.
2. Her testin neyi kontrol ettiğini sade Türkçe açıkla.
3. Testleri nasıl çalıştıracağımı yaz.
4. Test başarısız olursa nasıl okuyacağımı anlat.

Gerekli dosya ve klasörleri sen oluştur.
```

---

## 23. Derleme, APK ve Yayına Hazırlık

**Açıklama:**
Bu prompt Android uygulamasını derleme ve yayın öncesi kontrol için kullanılır.

**Prompt:**

```text
GençTek Atlas Android uygulamasını yayın öncesi kontrol etmek istiyorum.

Bana şu kontrolleri hazırla:
- Gradle derleme kontrolü
- Lint kontrolü
- Unit test kontrolü
- Compose UI test kontrolü
- Debug APK üretimi
- Release build için genel hazırlık
- Firebase proje ayarları kontrolü
- Firestore ve Storage rules kontrolü
- Demo verilerin production veri gibi kullanılmadığını kontrol etme

Terminal komutlarını sırayla yaz.
Her komutun ne işe yaradığını tek cümleyle açıkla.
Hata çıkarsa hangi hata ayıklama promptunu kullanacağımı da belirt.
```

Kullanılabilecek temel komutlar:

```text
./gradlew lint
./gradlew test
./gradlew connectedAndroidTest
./gradlew assembleDebug
./gradlew assembleRelease
```

---

## 24. Hata Ayıklama Promptları

### Gradle veya Derleme Hatası

**Açıklama:**
Bu prompt derleme hatalarını çözmek için kullanılır.

**Prompt:**

```text
GençTek Atlas Android uygulamasında şu Gradle veya derleme hatasını alıyorum:

[HATA MESAJINI BURAYA YAPIŞTIR]

Ben lise öğrencisiyim. Lütfen:
1. Hatanın ne anlama geldiğini sade Türkçe açıkla.
2. Hangi dosyalara bakmam gerektiğini söyle.
3. Düzeltmem gereken kodu veya ayarı göster.
4. Düzeltmeden sonra hangi komutu çalıştıracağımı yaz.

Gereksiz büyük refactor yapma. Sadece bu hatayı çöz.
```

### Firebase Hatası

**Açıklama:**
Bu prompt Firebase bağlantı, yetki veya kural hatalarını çözmek için kullanılır.

**Prompt:**

```text
GençTek Atlas Android uygulamasında şu Firebase hatasını alıyorum:

[HATA MESAJINI BURAYA YAPIŞTIR]

Lütfen:
1. Bu hatanın Authentication, Firestore, Storage veya güvenlik kuralı ile ilgili olup olmadığını söyle.
2. Olası nedenleri sade Türkçe açıkla.
3. Uygulama kodunda kontrol edilecek yerleri yaz.
4. Firebase güvenlik kurallarında kontrol edilecek yerleri yaz.
5. Sorunu çözmek için küçük ve güvenli bir düzeltme öner.

Gerçek gizli anahtar veya özel dosya içeriği isteme.
```

### Tasarım Uyuşmazlığı

**Açıklama:**
Bu prompt kodlanan ekran tasarıma benzemediğinde kullanılır.

**Prompt:**

```text
GençTek Atlas Android uygulamasında kodlanan ekran tasarıma benzemiyor.

Tasarımda beklediğim:
[BEKLENEN TASARIMI YAZ]

Uygulamada görünen:
[GERÇEK DURUMU YAZ]

Lütfen:
1. Jetpack Compose tarafında hangi bileşenleri kontrol etmem gerektiğini söyle.
2. Renk, boşluk, yazı boyutu ve hizalama için düzeltme öner.
3. Mobil ekranda taşma veya üst üste binme varsa nasıl düzelteceğimi göster.
4. Sadece ilgili ekranı düzelt, başka özellikleri değiştirme.
```

---

## Kısa Yardımcı Promptlar

### Kodu Anlat

```text
Bu Android kodunu lise öğrencisinin anlayacağı şekilde açıkla.

Lütfen:
1. Bu dosyanın ne işe yaradığını söyle.
2. Önemli fonksiyonları sade Türkçe anlat.
3. Firebase veya Compose ile ilgili teknik kelimeleri kısa açıkla.
4. Bu kodda değişiklik yaparsam nelere dikkat etmem gerektiğini yaz.
```

### Küçük Özellik Ekle

```text
GençTek Atlas Android uygulamasına küçük bir özellik eklemek istiyorum:

[ÖZELLİĞİ BURAYA YAZ]

Lütfen:
1. Hangi dosyalara dokunacağını söyle.
2. Gerekiyorsa küçük ve güvenli kod değişikliği yap.
3. Demo Modu'nu bozma.
4. Rol kontrollerini bozma.
5. Değişiklikten sonra nasıl test edeceğimi yaz.
```

### Kod Temizle

```text
GençTek Atlas Android uygulamasında şu kodu daha düzenli hale getir:

[KODU VEYA DOSYA ADINI BURAYA YAZ]

Lütfen:
1. Davranışı değiştirme.
2. Gereksiz karmaşıklığı azalt.
3. İsimleri anlaşılır yap.
4. Kısa açıklama ekle.
5. Değişiklikten sonra hangi testi çalıştıracağımı yaz.
```
