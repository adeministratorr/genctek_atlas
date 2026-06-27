> **Dil notu:**
> Bu rehber lise öğrencilerinin anlayabileceği sade Türkçe ile hazırlanmıştır.

# GençTek Atlas Sıfırdan Vibe Coding Promptları

Bu rehber, **GençTek Atlas** uygulamasını hiç repo yokmuş gibi, yapay zeka yardımıyla sıfırdan yaptırmak için hazırlanmıştır.

Öğrencinin dosya adı, klasör yapısı veya teknik proje düzeni bilmesi gerekmez. Promptlarda yapay zekadan gerekli dosya ve klasörleri kendisinin oluşturması istenir.

## Nasıl Kullanılır?

1. Promptları sırayla kullan.
2. Her prompttan sonra uygulamayı çalıştırıp kontrol et.
3. Bir şey bozulursa hata mesajını kopyalayıp "Hata Ayıklama" promptunu kullan.
4. Kodları anlamadığın zaman "Kodu Anlat" promptunu kullan.
5. Yayına almadan önce güvenlik ve test promptlarını mutlaka kullan.

## Her Promptta Geçerli Ana Kural

Bir yapay zeka aracına prompt verirken aşağıdaki cümleyi promptun başına ekleyebilirsin:

```text
Ben lise öğrencisiyim ve bu projeye sıfırdan başlıyorum. Dosya adlarını veya klasör yapısını bilmiyorum. Gerekli dosya ve klasörleri sen oluştur. Her adımda ne yaptığını kısa ve anlaşılır şekilde açıkla.
```

---

## 1. Proje Fikrini Netleştirme

**Açıklama:**
Bu prompt kod yazdırmaz. Önce uygulamanın ne yapacağını, kimlerin kullanacağını ve hangi sırayla geliştirileceğini anlamanı sağlar.

**Prompt:**

```text
Ben GençTek Atlas adında bir web uygulaması yapmak istiyorum.

Uygulama şunları yapacak:
- Türkiye haritası üzerinde teknoloji etkinliklerini gösterecek.
- Öğrenci projelerini listeleyecek.
- Öğrenciler proje ve etkinlik kaydı gönderebilecek.
- Öğretmenler kendi öğrencilerini ve başvuruları takip edebilecek.
- Okul müdürleri okulun genel durumunu görebilecek.
- Adminler gelen kayıtları onaylayabilecek, reddedebilecek veya öne çıkarabilecek.
- Çalışma grupları, görev panosu, mesajlaşma, bildirimler ve analiz ekranı olacak.

Ben lise öğrencisiyim. Lütfen bu uygulamayı çok sade bir dille anlat.

Bana şunları hazırla:
1. Uygulamanın amacı
2. Kullanıcı rolleri
3. Ana ekranlar
4. Hangi özellikleri önce yapmam gerektiği
5. Bu proje için kullanılacak teknolojiler

Şimdilik kod yazma. Önce anlaşılır bir yol haritası çıkar.
```

---

## 2. Teknoloji Seçimi ve Kurulum

**Açıklama:**
Bu prompt projeyi kurdurmak için kullanılır. Öğrenci dosya yapısını bilmez; yapay zeka gerekli proje yapısını oluşturur.

**Prompt:**

```text
GençTek Atlas uygulamasını sıfırdan kurmak istiyorum.

Şu teknolojileri kullan:
- React
- Vite
- Firebase
- React Router
- Vanilla CSS
- Lucide React ikonları
- Harita için SVG veya Leaflet
- Test için Vitest ve React Testing Library

Lütfen:
1. Terminalde çalıştırmam gereken komutları sırayla yaz.
2. Her komutun ne işe yaradığını tek cümleyle açıkla.
3. Proje için gerekli dosya ve klasörleri sen planla.
4. Oluşturduğun her parçanın ne işe yaradığını sade şekilde anlat.
5. En sonunda uygulamayı nasıl çalıştıracağımı göster.

Ben dosya yapısını bilmiyorum; bu yüzden dosya adlarını sen seç ve düzeni sen kur.
```

---

## 3. İlk Çalışan Ana Sayfa

**Açıklama:**
Bu prompt uygulamanın ilk görünen ekranını yaptırır. Henüz Firebase gerekmez; amaç öğrencinin ekranda çalışan bir şey görmesidir.

**Prompt:**

```text
GençTek Atlas için ilk çalışan ana sayfayı oluştur.

Ana sayfada şunlar olsun:
- Üst menü
- Proje adı ve kısa açıklama
- Türkiye haritası için ayrılmış büyük bir alan
- Etkinlikler ve projeler için iki ayrı liste alanı
- Arama ve filtreleme bölümü
- "Etkinlik Ekle" ve "Proje Ekle" butonları

Şimdilik gerçek veritabanı kullanma. Örnek etkinlik ve proje verileriyle ekranda çalışan bir demo hazırla.

Tasarım:
- Kırmızı, beyaz ve açık gri renkler kullan.
- Mobil ekranda düzgün görünsün.
- Yazılar lise öğrencisinin anlayacağı kadar sade olsun.

Gerekli dosya ve klasörleri sen oluştur. Koddan sonra hangi parçanın ne işe yaradığını açıkla.
```

---

## 4. Sayfalar ve Gezinme

**Açıklama:**
Bu prompt farklı ekranlara geçiş yapmayı sağlar. Kullanıcı haritadan mesajlara, gruplara veya analiz ekranına gidebilir.

**Prompt:**

```text
GençTek Atlas uygulamasına sayfa geçişleri ekle.

Şu ekranlar olsun:
- Ana sayfa: Harita, filtreler, etkinlikler ve projeler
- Mesajlar: Kullanıcıların mesajlaşacağı alan
- Çalışma Grupları: Grup listesi ve görevler
- Analiz: Etkinlik ve proje istatistikleri
- Yönetim: Adminin kayıtları kontrol edeceği alan

İstediğim davranış:
- Üst menüden bu ekranlara gidilebilsin.
- Kullanıcı hangi ekranda olduğunu anlayabilsin.
- Giriş yapılması gereken ekranlarda uyarı gösterilsin.
- Mobilde menü taşmasın.

Ben dosya adlarını bilmiyorum. Gerekli yapıyı sen kur ve her ekranı kısa kısa açıkla.
```

---

## 5. Harita ve Filtreleme

**Açıklama:**
Bu prompt Türkiye haritasını ve filtreleme mantığını kurdurur. İlk sürümde sade bir harita yeterlidir; sonra gelişmiş haritaya geçilebilir.

**Prompt:**

```text
GençTek Atlas için interaktif Türkiye haritası yap.

Şunları istiyorum:
- Türkiye'nin illerini temsil eden bir harita göster.
- Bir ile tıklayınca sadece o ile ait etkinlik ve projeler listelensin.
- Arama kutusu ile etkinlik veya proje adı aranabilsin.
- Tema filtresi olsun. Örnek temalar: Yapay Zeka, Robotik, Oyun Tasarımı, Siber Güvenlik, Vibe Coding.
- Etkinlik sayısı fazla olan iller daha dikkat çekici görünsün.
- Haritanın üzerinde veya yanında seçilen ilin adı görünsün.

Eğer tam Türkiye haritası verisi gerekiyorsa:
- Önce basit bir demo harita ile çalışır hale getir.
- Sonra gelişmiş harita için hangi açık veri veya GeoJSON gerektiğini açıkla.

Gerekli dosya ve bileşenleri sen oluştur. Koddan sonra bu sistemin nasıl çalıştığını sade şekilde anlat.
```

---

## 6. Etkinlik ve Proje Kayıt Formları

**Açıklama:**
Bu prompt öğrencilerin etkinlik veya proje gönderebileceği formları yaptırır. İlk aşamada demo veri kullanılabilir, sonra Firebase'e bağlanır.

**Prompt:**

```text
GençTek Atlas için etkinlik ve proje kayıt formları oluştur.

Etkinlik formunda şunlar olsun:
- Etkinlik adı
- İl
- İlçe
- Okul veya kurum adı
- Tema
- Tarih
- Açıklama
- Başvuru linki

Proje formunda şunlar olsun:
- Proje adı
- Öğrenci veya ekip adı
- İl
- Okul
- Tema
- Proje açıklaması
- GitHub linki
- Görsel yükleme alanı

Kurallar:
- Zorunlu alanlar boş geçilemesin.
- GitHub linki varsa doğru formatta olsun.
- Kullanıcı gönderdiği kayıtların önce onay beklediğini görsün.
- Hata mesajları sade ve anlaşılır olsun.

Şimdilik istersen demo veriyle çalıştır. Daha sonra Firebase bağlantısı için hazır olacak şekilde kur.
Gerekli dosya ve yapıyı sen oluştur.
```

---

## 7. Firebase Bağlantısı

**Açıklama:**
Bu prompt uygulamayı Firebase'e bağlatır. Firebase; giriş, veritabanı ve dosya yükleme için kullanılır.

**Prompt:**

```text
GençTek Atlas uygulamasını Firebase'e bağla.

Kullanılacak Firebase servisleri:
- Authentication: Kullanıcı girişi için
- Firestore: Etkinlik, proje, kullanıcı, grup, mesaj ve bildirim verileri için
- Storage: Görsel veya dosya yükleme için

Lütfen:
1. Firebase projesi oluşturmak için ne yapmam gerektiğini açıkla.
2. Web uygulama ayarlarını nereye eklemem gerektiğini göster.
3. Gizli anahtarların GitHub'a gönderilmemesi gerektiğini anlat.
4. Gerçek Firebase ayarları yoksa uygulamanın demo modda çalışmasını sağla.
5. Etkinlik ve proje formlarını Firestore'a kayıt gönderecek hale getir.

Ben dosya adlarını bilmiyorum. Gerekli bağlantı dosyalarını ve veri işlemlerini sen oluştur.
```

---

## 8. Veritabanı Modeli

**Açıklama:**
Bu prompt Firestore'da hangi verinin nasıl tutulacağını planlatır. Koddan önce veri düzenini anlamak önemlidir.

**Prompt:**

```text
GençTek Atlas için Firestore veritabanı modelini tasarla.

Şu veriler tutulacak:
- Kullanıcılar
- Öğrenciler
- Öğretmenler
- Okullar
- Etkinlikler
- Projeler
- Etkinlik başvuruları
- Çalışma grupları
- Grup görevleri
- Grup duyuruları
- Direkt mesajlar
- Genel duyurular
- Bildirimler
- XP ve rozet bilgileri

Her veri türü için şunları açıkla:
1. Ne işe yarıyor?
2. Hangi bilgiler tutulmalı?
3. Örnek bir kayıt nasıl görünür?
4. Kimler okuyabilir?
5. Kimler değiştirebilir?

Kod yazma. Önce sade ve anlaşılır bir veritabanı planı hazırla.
```

---

## 9. Kullanıcı Girişi ve Roller

**Açıklama:**
Bu prompt öğrenci, öğretmen, müdür ve admin rollerini kurdurur. Her kullanıcının yetkisi farklı olmalıdır.

**Prompt:**

```text
GençTek Atlas için kullanıcı girişi ve rol sistemi oluştur.

Roller:
- Öğrenci
- Öğretmen
- Okul müdürü
- Koordinatör
- Admin

İstediğim özellikler:
- Kullanıcı e-posta ve şifreyle giriş yapabilsin.
- Yeni öğrenci kayıt olabilsin.
- Yeni öğretmen kayıt olabilsin.
- Giriş yapan kullanıcının rolü sisteme kaydedilsin.
- Her rol kendi yetkisine uygun ekranları görsün.
- Giriş yapmayan kullanıcı özel ekranlara girince uyarı görsün.

Örnek:
- Öğrenci proje gönderebilir.
- Öğretmen öğrencilerini takip edebilir.
- Müdür okul özetini görebilir.
- Admin kayıtları onaylayabilir veya reddedebilir.

Gerekli dosyaları ve ekranları sen oluştur. Her rolün ne yapabildiğini sade bir tabloyla açıkla.
```

---

## 10. Yönetim Panelleri

**Açıklama:**
Bu prompt öğretmen, müdür ve admin ekranlarını yaptırır.

**Prompt:**

```text
GençTek Atlas için rol bazlı yönetim panelleri oluştur.

Öğretmen panelinde:
- Kendi öğrencilerini görebilsin.
- Öğrencilerin etkinlik başvurularını takip edebilsin.
- Çalışma gruplarını izleyebilsin.

Müdür panelinde:
- Okuldaki öğrenci, etkinlik ve proje sayılarını görebilsin.
- Okulun aktif çalışma gruplarını görebilsin.
- Okul için kısa liderlik veya başarı özeti görebilsin.

Admin panelinde:
- Onay bekleyen etkinlik ve projeler listelensin.
- Admin onaylama, reddetme ve öne çıkarma yapabilsin.
- Genel duyuru gönderebilsin.
- Kullanıcı ve okul kayıtlarını kontrol edebilsin.

Her panel sade, anlaşılır ve mobil uyumlu olsun.
Gerekli ekranları ve veri bağlantılarını sen oluştur.
```

---

## 11. Çalışma Grupları ve Görevler

**Açıklama:**
Bu prompt öğrencilerin ekip olarak çalışabileceği grup sistemi ve görev panosu oluşturur.

**Prompt:**

```text
GençTek Atlas için çalışma grupları ve görev panosu oluştur.

İstediğim özellikler:
- Kullanıcı yeni çalışma grubu oluşturabilsin.
- Kullanıcı gruplara katılabilsin.
- Grup içinde üyeler görünsün.
- Grup duyuruları paylaşılabilsin.
- Görev panosu olsun.
- Görevler "Yapılacak", "Devam ediyor" ve "Tamamlandı" olarak takip edilsin.
- Görev bir üyeye atanabilsin.
- Görev tamamlanınca öğrencinin XP kazanması için altyapı hazır olsun.

Veriler gerçek zamanlı güncellensin. Bir kullanıcı görev eklediğinde diğer üyeler de görebilsin.

Gerekli yapıyı sen kur. Önce sistemin nasıl çalışacağını açıkla, sonra kodu oluştur.
```

---

## 12. Direkt Mesajlaşma

**Açıklama:**
Bu prompt kullanıcılar arasında gerçek zamanlı mesajlaşma sistemi kurar. Güvenlik çok önemlidir.

**Prompt:**

```text
GençTek Atlas için direkt mesajlaşma sistemi oluştur.

İstediğim özellikler:
- Kullanıcı konuşma listesini görebilsin.
- Bir konuşmaya tıklayınca mesajlar açılsın.
- Yeni mesaj gönderilince ekran anında güncellensin.
- Mesajlarda gönderen, alıcı, tarih ve okunma bilgisi tutulsun.
- Herkes herkesle mesajlaşamasın.
- Öğrenci ve öğretmen iletişimi güvenli şekilde sınırlandırılsın.
- Admin özel mesaj içeriklerini gereksiz yere görmesin.

Önce mesajlaşma güvenlik mantığını açıkla.
Sonra gerçek zamanlı çalışan mesajlaşma ekranını oluştur.
Gerekli dosya ve veri yapısını sen belirle.
```

---

## 13. Bildirim, Duyuru, XP ve Rozet

**Açıklama:**
Bu prompt uygulamayı daha canlı hale getirir. Öğrenciler başarı kazandığında bildirim ve rozet alır.

**Prompt:**

```text
GençTek Atlas için bildirim, duyuru, XP ve rozet sistemi oluştur.

Şunları istiyorum:
- Admin genel duyuru gönderebilsin.
- Kullanıcılar bildirim panelinden duyuruları görebilsin.
- Okunmamış bildirim sayısı menüde görünsün.
- Öğrenci görev tamamlayınca XP kazansın.
- Öğrencinin projesi onaylanınca XP veya rozet verilsin.
- Kullanıcı kendi profilinde XP ve rozetlerini görebilsin.

Önce hangi olayda hangi bildirim oluşacağını açıkla.
Sonra bu sistemi uygulamaya ekle.
Tasarımı sade ve öğrenciler için anlaşılır yap.
```

---

## 14. Analiz ve İstatistikler

**Açıklama:**
Bu prompt etkinlik ve proje sayılarını özetleyen analiz ekranı oluşturur.

**Prompt:**

```text
GençTek Atlas için analiz ve istatistik ekranı oluştur.

Şu bilgileri göstermek istiyorum:
- Toplam etkinlik sayısı
- Toplam proje sayısı
- En aktif iller
- En aktif okullar
- En çok kullanılan temalar
- Yaklaşan etkinlikler
- Onay bekleyen kayıtlar
- Öğrencilerin XP ve rozet özeti

Grafik kütüphanesi kullanmak zorunda değilsin. Sade kartlar, tablolar ve basit çubuk göstergeler yeterli.

Analiz ekranı hem masaüstünde hem telefonda düzgün görünsün.
Gerekli hesaplamaları ve ekranı sen oluştur.
```

---

## 15. Tasarım ve Mobil Uyum

**Açıklama:**
Bu prompt uygulamanın daha profesyonel ve okunabilir görünmesini sağlar.

**Prompt:**

```text
GençTek Atlas uygulamasının tasarımını geliştir.

Tasarım kuralları:
- Ana renk kırmızı olsun.
- Beyaz ve açık gri arka planlar kullan.
- Yazılar kolay okunsun.
- Butonlar, kartlar ve formlar tutarlı görünsün.
- Mobilde hiçbir yazı veya buton taşmasın.
- Harita, filtreler ve listeler telefonda alt alta gelsin.
- Gereksiz süsleme kullanma.
- Uygulama eğitim platformu gibi ciddi, temiz ve anlaşılır görünsün.

Lütfen:
1. Tasarım sistemini oluştur.
2. Renkleri ve boşlukları tutarlı yap.
3. Mobil uyumu kontrol et.
4. Kullanıcı deneyimini sadeleştir.

Gerekli stil dosyalarını ve bileşen düzenlemelerini sen oluştur.
```

---

## 16. Firebase Güvenlik Kuralları

**Açıklama:**
Bu prompt veri güvenliği için kullanılır. Yanlış güvenlik kuralı özel verileri açığa çıkarabilir.

**Prompt:**

```text
GençTek Atlas için Firebase güvenlik kurallarını oluştur.

Kurallar şunları sağlamalı:
- Herkes sadece onaylanmış herkese açık etkinlikleri ve projeleri okuyabilsin.
- Yeni gönderilen etkinlik ve projeler önce onay beklesin.
- Sadece admin kayıtları onaylayabilsin, reddedebilsin veya silebilsin.
- Öğrenci sadece kendi özel bilgilerini düzenleyebilsin.
- Öğretmen sadece kendi öğrencileriyle ilgili verileri görebilsin.
- Müdür sadece kendi okulunun özet verilerini görebilsin.
- Mesajları sadece konuşmaya dahil kişiler okuyabilsin.
- Çalışma gruplarını sadece grup üyeleri ve yetkili kişiler görebilsin.
- Dosya yüklemede tür ve boyut sınırı olsun.
- Görsel yüklemeleri güvenli olsun.

Önce güvenlik mantığını lise öğrencisinin anlayacağı şekilde açıkla.
Sonra gerekli Firebase güvenlik kurallarını oluştur.
En sonda bu kuralları nasıl test edeceğimi yaz.
```

---

## 17. Güvenlik Kontrolü

**Açıklama:**
Bu prompt uygulama tamamlandıktan sonra güvenlik açığı var mı diye kontrol ettirir. Kod yazdırmadan önce rapor ister.

**Prompt:**

```text
GençTek Atlas uygulamam için güvenlik kontrolü yapmak istiyorum.

Önce kod değiştirme. Sadece güvenlik raporu hazırla.

Şunları kontrol et:
1. Özel mesajlar başkaları tarafından okunabilir mi?
2. Giriş yapmamış kullanıcı admin işlemi yapabilir mi?
3. Öğrenci başka öğrencinin özel bilgilerini görebilir mi?
4. Öğretmen sadece kendi öğrencilerini mi görebiliyor?
5. Onay bekleyen kayıtlar yanlışlıkla herkese açık görünüyor mu?
6. Dosya yüklemede tür ve boyut sınırı var mı?
7. Kullanıcı metinleri XSS gibi saldırılara karşı güvenli mi?
8. GitHub linki ve başvuru linkleri doğru kontrol ediliyor mu?
9. Gizli Firebase ayarları yanlışlıkla paylaşılabilir mi?
10. Bağımlılık güvenliği için kontrol yapılmalı mı?

Rapor formatı:
- Risk seviyesi: Kritik / Yüksek / Orta / Düşük
- Sorun ne?
- Neden riskli?
- Nasıl düzeltilmeli?
- Düzelttiğimi nasıl test ederim?

Rapor bitince benden onay almadan kod değiştirme.
```

---

## 18. Manuel Test Planı

**Açıklama:**
Bu prompt uygulamayı kullanıcı gibi elle denemek için test listesi hazırlar.

**Prompt:**

```text
GençTek Atlas için manuel test planı hazırla.

Uygulamayı tarayıcıda kendim deneyeceğim.

Şu kullanıcı türleri için test senaryosu yaz:
- Giriş yapmamış ziyaretçi
- Öğrenci
- Öğretmen
- Okul müdürü
- Admin

Test edilecek alanlar:
- Ana sayfa
- Türkiye haritası
- Arama ve filtreleme
- Etkinlik ekleme
- Proje ekleme
- Başvuru yapma
- Öğretmen paneli
- Müdür paneli
- Admin paneli
- Çalışma grupları
- Görev panosu
- Direkt mesajlaşma
- Bildirimler
- Analiz ekranı
- Mobil görünüm

Her test için şu formatı kullan:
1. Test adı
2. Hangi kullanıcı ile yapılacak?
3. Test adımları
4. Beklenen sonuç
5. Hata olursa ne kontrol edilmeli?

En sonda yayına almadan önce işaretlenecek kısa bir kontrol listesi oluştur.
```

---

## 19. Otomatik Test Yazma

**Açıklama:**
Bu prompt uygulamanın bozulmaması için otomatik testler yazdırır.

**Prompt:**

```text
GençTek Atlas için otomatik testler yaz.

Test etmek istediğim şeyler:
- Haritada il seçilince liste filtreleniyor mu?
- Arama kutusu doğru sonuç getiriyor mu?
- Proje formu boş alanları yakalıyor mu?
- GitHub linki yanlışsa hata gösteriliyor mu?
- Giriş yapmayan kullanıcı özel ekranlara giremiyor mu?
- Öğrenci sadece kendi bilgilerini görebiliyor mu?
- Admin onaylama ve reddetme işlemi yapabiliyor mu?
- Mesaj gönderme akışı çalışıyor mu?
- Bildirim sayısı doğru görünüyor mu?
- Görev tamamlanınca durum değişiyor mu?

Lütfen:
1. Hangi test aracını kullanacağını söyle.
2. Testleri sade ve anlaşılır yaz.
3. Her testin neyi kontrol ettiğini bir cümleyle açıkla.
4. Testleri nasıl çalıştıracağımı göster.
5. Test başarısız olursa nasıl okuyacağımı anlat.

Gerekli test dosyalarını sen oluştur.
```

---

## 20. Test Hatası Düzeltme

**Açıklama:**
Testler hata verdiğinde bu prompt kullanılır. Yapay zekanın rastgele büyük değişiklik yapmasını engeller.

**Prompt:**

```text
GençTek Atlas uygulamasında test hatası aldım.

Çalıştırdığım komut:
BURAYA KOMUTU YAZ

Hata çıktısı:
BURAYA HATAYI YAPIŞTIR

Lütfen:
1. Hatanın ne anlama geldiğini sade dille açıkla.
2. Test mi yanlış, uygulama kodu mu yanlış, bunu değerlendir.
3. En küçük düzeltmeyi öner.
4. Büyük refactor yapma.
5. Düzeltmeden sonra hangi komutu çalıştırmam gerektiğini söyle.

Benden onay almadan büyük değişiklik yapma.
```

---

## 21. Yayına Alma

**Açıklama:**
Bu prompt uygulamayı internette yayınlamak için kullanılır.

**Prompt:**

```text
GençTek Atlas uygulamasını Firebase Hosting ile yayına almak istiyorum.

Bana şu adımları sade şekilde anlat:
1. Firebase projesi oluşturma
2. Web uygulaması ekleme
3. Firebase ayarlarını projeye ekleme
4. Uygulamayı derleme
5. Güvenlik kurallarını yayınlama
6. Hosting ayarlarını yapma
7. Uygulamayı internete yayınlama

Her adım için:
- Ne yapacağımı söyle.
- Hangi komutu çalıştıracağımı söyle.
- Komutun ne işe yaradığını açıkla.

Yayına almadan önce güvenlik ve test kontrol listesi de ver.
```

---

## 22. Hata Ayıklama

**Açıklama:**
Kod yazarken hata almak normaldir. Hata mesajını doğru verirsen yapay zeka daha iyi yardım eder.

**Prompt:**

```text
GençTek Atlas uygulamamda hata aldım.

Hata mesajı:
BURAYA HATA MESAJINI YAPIŞTIR

Ben şunu yapmaya çalışıyordum:
BURAYA NE YAPTIĞINI YAZ

Ekranda gördüğüm sorun:
BURAYA SORUNU YAZ

Lütfen:
1. Hatanın ne anlama geldiğini sade dille açıkla.
2. En olası nedenleri yaz.
3. Sorunu çözmek için adım adım ne yapmam gerektiğini söyle.
4. Kod değişikliği gerekiyorsa sadece gerekli kısmı değiştir.
5. Düzeltmeden sonra nasıl test edeceğimi anlat.
```

---

## Kısa Yardımcı Promptlar

### Kodu Anlat

**Açıklama:**
Anlamadığın bir kod parçasını açıklatmak için kullan.

**Prompt:**

```text
Bu kodu lise öğrencisinin anlayacağı şekilde açıkla.

Şunları özellikle anlat:
- Bu kod ne işe yarıyor?
- En önemli değişkenler hangileri?
- Hangi bölüm kullanıcıya ekranda bir şey gösteriyor?
- Hangi bölüm veritabanı veya Firebase ile konuşuyor?
- Bu kodda hata çıkarsa ilk nereye bakmalıyım?

Kod:
BURAYA KODU YAPIŞTIR
```

### Küçük Özellik Ekle

**Açıklama:**
Uygulamaya küçük bir özellik eklemek için kullan.

**Prompt:**

```text
GençTek Atlas uygulamasına küçük bir özellik eklemek istiyorum.

Eklemek istediğim özellik:
BURAYA ÖZELLİĞİ YAZ

Lütfen:
1. Önce bu özelliğin uygulamada nereye ekleneceğini açıkla.
2. Çalışan yerleri bozma.
3. Gereken en küçük kod değişikliğini yap.
4. Değişiklikten sonra nasıl test edeceğimi anlat.
```

### Kod Temizle

**Açıklama:**
Kod çalışıyor ama karışık görünüyorsa kullan.

**Prompt:**

```text
Bu kodu davranışını değiştirmeden daha temiz ve okunabilir hale getir.

Kurallar:
- Çalışan özelliği bozma.
- Büyük refactor yapma.
- Gereksiz tekrarları azalt.
- Değişken adlarını daha anlaşılır yapabilirsin.
- Yaptığın değişiklikleri kısa kısa açıkla.

Kod:
BURAYA KODU YAPIŞTIR
```

### Sunum Metni Hazırla

**Açıklama:**
Projeyi jüriye, öğretmene veya sınıfa anlatmak için kullan.

**Prompt:**

```text
GençTek Atlas projesi için 3 dakikalık sunum metni hazırla.

Sunumda şunlar geçsin:
- Proje hangi problemi çözüyor?
- Türkiye haritası nasıl kullanılıyor?
- Öğrenciler ne yapabiliyor?
- Öğretmenler ve müdürler ne yapabiliyor?
- Admin paneli ne işe yarıyor?
- Firebase neden kullanıldı?
- Güvenlik için neler yapıldı?
- Yapay zekadan nasıl yardım aldım?

Dil sade, doğal ve lise öğrencisinin sunabileceği gibi olsun.
```
