# UI/UX Geliştirme Önerisi ve Uygulama Planı

Tarih: 10 Haziran 2026  
Canlı ortam: https://genctekatlas.web.app  
Kapsam: GençTek Atlas ana atlas ekranı, harita/filtre deneyimi, kayıt formları, mesajlaşma, mobil kullanım ve tasarım sistemi.

## Amaç

Bu plan, GençTek Atlas arayüzünü daha erişilebilir, mobil uyumlu, hızlı ve sürdürülebilir hale getirmek için önerilen geliştirme adımlarını sıralar. Öncelik, kullanıcıların harita, filtre, başvuru ve iletişim akışlarına mobil ve masaüstünde sorunsuz erişebilmesidir.

## Mevcut Durum Özeti

- Uygulama React/Vite ile çalışıyor ve Firebase Hosting üzerinde yayında.
- Canlı URL erişilebilir durumda.
- Lokal üretim derlemesi başarılı tamamlandı.
- Ana ekran, harita + filtre + etkinlik/proje listesi ekseninde güçlü bir ürün omurgasına sahip.
- Mobil görünümde bazı alanlar yatay taşma üretiyor.
- Kayıt formları küçük ekranlarda fazla sıkışıyor.
- Bazı etkileşimler görsel olarak çalışsa da klavye ve ekran okuyucu tarafında güçlendirilmeli.
- Ana JS paketi büyümüş durumda; bazı paneller ve özellikler lazy loading için uygun.

## Geliştirme Öncelikleri

| Öncelik | Geliştirme Alanı | Hedef |
| --- | --- | --- |
| P1 | Mobil navigasyon | 390 px ve altı ekranlarda yatay taşmayı kaldırmak |
| P1 | Mobil form düzeni | Kayıt formlarını tek kolon, okunabilir ve adımlı hale getirmek |
| P1 | Erişilebilir etkileşimler | Sekme, harita, liste ve modal kontrollerini klavye ile kullanılabilir yapmak |
| P2 | Filtre deneyimi | Mobilde filtre alanını daha kompakt ve hızlı kullanılabilir hale getirmek |
| P2 | Mesajlaşma mobil deneyimi | Mesaj ekranlarını tek kolon veya tam ekran sheet düzenine taşımak |
| P2 | Performans | İlk yüklenen JS miktarını azaltmak |
| P3 | Tasarım sistemi | Inline stilleri azaltıp reusable UI kalıpları oluşturmak |

## Faz 1: Mobil Kullanılabilirlik

### 1.1 Header ve Navigasyon

Sorun:

- Mobilde header menüsü tek satırda kalıyor ve ekran dışına taşıyor.
- Ana aksiyonlar dar ekranda güvenilir biçimde erişilemiyor.

Önerilen geliştirme:

- 768 px altında header yapısını sadeleştirin.
- Logo + menü butonu kalıbına geçin.
- `Atlas`, `Analiz`, `Giriş` gibi birincil hedefleri görünür tutun.
- `Etkinlik Ekle`, `Proje Ekle`, rol panelleri, bildirimler ve profil işlemlerini drawer içine alın.
- Aktif sayfa durumunu drawer içinde de belirgin gösterin.

Kod alanları:

- `src/components/Header.jsx`
- `src/assets/style.css`

Kabul kriterleri:

- 360, 390, 768 ve 1280 px genişliklerde yatay scroll oluşmamalı.
- Menü sadece dokunmatik değil, klavye ile de açılıp kapanmalı.
- Drawer açıkken focus içeride kalmalı ve Escape ile kapanmalı.

### 1.2 İstatistik ve Hero Alanı

Sorun:

- Mobilde hero ve istatistikler harita deneyimini aşağı itiyor.
- İstatistik kartları dar ekranda taşmaya katkı verebiliyor.

Önerilen geliştirme:

- Mobilde hero metnini kısaltılmış kompakt varyanta alın.
- İstatistikleri büyük kartlar yerine kompakt sayaç şeridine dönüştürün.
- 480 px altında istatistikleri tek kolon veya iki satırlı, taşmayan bir düzenle gösterin.
- Ana keşif akışını ilk ekranlara yaklaştırın: arama, harita, filtre.

Kod alanları:

- `src/components/Hero.jsx`
- `src/components/Stats.jsx`
- `src/assets/style.css`

Kabul kriterleri:

- Mobilde harita ve arama alanı ilk kaydırmadan sonra hızlıca görünmeli.
- İstatistik kartları sayfa genişliğini aşmamalı.

## Faz 2: Form Deneyimi

### 2.1 Kayıt Formlarının Mobil Düzeni

Sorun:

- Etkinlik kayıt formundaki üç kolonlu satırlar mobil modal içinde çok daralıyor.
- Select/input metinleri küçük ekranlarda okunması zor hale geliyor.

Önerilen geliştirme:

- Form gridleri için reusable sınıflar oluşturun:
  - `.form-grid-2`
  - `.form-grid-3`
  - `.form-grid-stack-sm`
- 640 px altında tüm form gridlerini tek kolona düşürün.
- Uzun formları adımlı yapıya bölün:
  - Temel Bilgi
  - Konum
  - Katılım
  - Medya
  - Önizleme ve Gönder
- Modal alt aksiyonlarını sticky footer olarak sabitleyin.

Kod alanları:

- `src/components/EventForm.jsx`
- `src/components/ProjectForm.jsx`
- `src/components/TeacherRegister.jsx`
- `src/components/StudentRegister.jsx`
- `src/components/ApplicationForm.jsx`
- `src/assets/style.css`

Kabul kriterleri:

- 390 px genişlikte hiçbir form alanı okunamayacak kadar daralmamalı.
- Form aksiyonları uzun içerikte kaybolmamalı.
- Hata mesajları ilgili alanın hemen altında görünmeli.

### 2.2 Label ve Yardım Metni Standardı

Sorun:

- Bazı form alanları görünür label taşısa da `htmlFor`/`id` bağlantısı eksik.
- Placeholder metni bazı alanlarda label gibi kullanılıyor.

Önerilen geliştirme:

- Tüm input/select/textarea alanlarına benzersiz `id` verin.
- Tüm label elemanlarında `htmlFor` kullanın.
- Placeholder'ı sadece örnek değer için kullanın.
- Zorunlu alan işaretini metinle de destekleyin.
- Hata mesajlarını `aria-describedby` ile alana bağlayın.

Kabul kriterleri:

- Tüm form alanları ekran okuyucuda doğru isimle okunmalı.
- Form sadece klavye ile doldurulup gönderilebilmeli.

## Faz 3: Erişilebilir Etkileşimler

### 3.1 Sekme Yapıları

Sorun:

- Etkinlik/Proje sekmeleri görsel olarak sekme gibi, ancak `div onClick` ile çalışıyor.

Önerilen geliştirme:

- Sekme kapsayıcısında `role="tablist"` kullanın.
- Her sekmede `role="tab"`, `aria-selected`, `aria-controls` ve `tabIndex` tanımlayın.
- İçerik panellerinde `role="tabpanel"` kullanın.
- Sağ/sol ok tuşlarıyla sekme değiştirme ekleyin.

Kod alanları:

- `src/App.jsx`
- `src/components/SchoolProfileModal.jsx`
- `src/components/StudyGroupDetail.jsx`
- Benzer `list-tabs` kullanan bileşenler

Kabul kriterleri:

- Sekmeler mouse olmadan kullanılabilmeli.
- Aktif sekme ekran okuyucuda anlaşılmalı.

### 3.2 SVG Harita Erişilebilirliği

Sorun:

- SVG harita mouse hover/click odaklı çalışıyor.
- İller klavye ile seçilemiyor.

Önerilen geliştirme:

- İl path'lerine `tabIndex="0"` ve `role="button"` ekleyin.
- Her il için anlamlı `aria-label` üretin.
- Enter ve Space ile il seçimi yapılabilmeli.
- Hover tooltip bilgisini klavye focus durumunda da gösterin.
- Haritanın yanında klavye ile kullanılabilir il listesi alternatifi sunun.

Kod alanları:

- `src/components/Map.jsx`
- `public/assets/map/turkey.svg`
- `src/assets/style.css`

Kabul kriterleri:

- Haritada il seçimi mouse, keyboard ve alternatif il listesiyle yapılabilmeli.
- Focus stili hover kadar belirgin olmalı.

### 3.3 Modal ve Liste Kontrolleri

Sorun:

- Logo, profil tetikleyicisi, konuşma satırları gibi bazı tıklanabilir alanlar `div` olarak uygulanmış.

Önerilen geliştirme:

- Tıklanabilir `div` elemanlarını `button` veya `a` ile değiştirin.
- Modal açıldığında focus ilk anlamlı elemana taşınmalı.
- Modal içinde focus trap uygulanmalı.
- Escape ile kapanma standardı eklenmeli.
- Kapatma butonları en az 44x44 px hedef alanına sahip olmalı.

Kod alanları:

- `src/components/Header.jsx`
- `src/components/MessagingHub.jsx`
- `src/components/EventDetailsModal.jsx`
- Tüm modal bileşenleri

Kabul kriterleri:

- Kullanıcı modalı yalnızca klavye ile açıp kapatabilmeli.
- Tıklanabilir tüm kontroller semantik HTML taşımalı.

## Faz 4: Filtre ve Harita Deneyimi

### 4.1 Mobil Filtre Alanı

Sorun:

- Tema çipleri mobilde çok yüksek bir alan kaplıyor.
- Kullanıcı sonuçlara gelmeden uzun filtre bölümünü geçmek zorunda kalıyor.

Önerilen geliştirme:

- Mobilde filtre panelini collapsible hale getirin.
- İlk görünümde sadece arama + aktif filtre sayısı gösterin.
- Tema seçimini aramalı popover, bottom sheet veya yatay kaydırılabilir kısa listeye taşıyın.
- Aktif filtreleri kompakt token olarak gösterin.

Kod alanları:

- `src/components/Filters.jsx`
- `src/assets/style.css`

Kabul kriterleri:

- Mobilde filtre alanı sonuçlara erişimi geciktirmemeli.
- Aktif filtreler tek bakışta anlaşılmalı.
- Tüm filtreler tek tuşla temizlenebilmeli.

### 4.2 Kart Listesi Scroll Davranışı

Sorun:

- Kart listesi kendi içinde `max-height` ve scroll kullanıyor.
- Sayfa scroll'u ve liste scroll'u birbiriyle çakışabiliyor.

Önerilen geliştirme:

- Listeyi doğal sayfa akışına bırakmayı değerlendirin.
- Harita/filtre kolonunu masaüstünde sticky yapın.
- Çok uzun listelerde sayfalama veya sanallaştırma kullanın.
- Kart durumlarını daha net standartlaştırın: Başvuru Açık, Kontenjan Doldu, Rapor, Öne Çıkan.

Kod alanları:

- `src/App.jsx`
- `src/components/EventCard.jsx`
- `src/components/ProjectCard.jsx`
- `src/assets/style.css`

Kabul kriterleri:

- Kullanıcı hangi scroll alanında olduğunu şaşırmamalı.
- Kart statüleri görsel olarak tutarlı olmalı.

## Faz 5: Mesajlaşma ve Rol Panelleri

### 5.1 Mesajlaşma Mobil Düzeni

Sorun:

- Mesajlaşma grid'i masaüstü için uygun, mobilde sabit kolon genişliği riskli.
- Öğrenci chat paneli sabit genişlik taşıyor.

Önerilen geliştirme:

- 768 px altında mesajlaşmayı tek kolon yapın.
- Önce konuşma listesi gösterilsin, konuşma seçildiğinde thread tam ekran açılsın.
- Öğrenci chat widget mobilde bottom sheet veya tam ekran panel olarak açılsın.
- Konuşma satırları button/listbox semantiği taşısın.

Kod alanları:

- `src/components/MessagingHub.jsx`
- `src/components/StudentChatWidget.jsx`
- `src/components/NewConversationModal.jsx`

Kabul kriterleri:

- 390 px genişlikte chat paneli taşmamalı.
- Konuşma seçimi ve mesaj gönderimi klavye ile yapılabilmeli.

### 5.2 Rol Bazlı Dashboard Yoğunluğu

Önerilen geliştirme:

- Yönetim, öğretmen, müdür ve komisyon panellerinde ortak panel layout'u oluşturun.
- Tablo ekranlarında mobil için kart liste alternatifi sunun.
- Aksiyon butonlarını ikon + tooltip veya overflow menu ile sadeleştirin.
- Kritik işlemler için onay diyaloğu standardı belirleyin.

Kod alanları:

- `src/components/Moderation.jsx`
- `src/components/TeacherDashboard.jsx`
- `src/components/PrincipalDashboard.jsx`

Kabul kriterleri:

- Tablolar mobilde yatay taşmadan okunabilmeli.
- Rol panellerindeki aksiyonlar aynı görsel dile sahip olmalı.

## Faz 6: Tasarım Sistemi ve Performans

### 6.1 Tasarım Sistemi Temizliği

Sorun:

- Aktif stil sistemi `src/assets/style.css` içinde; kullanılmayan `src/index.css` ve `src/App.css` dosyaları repoda duruyor.
- Inline stiller yaygın olduğu için bakım maliyeti artıyor.

Önerilen geliştirme:

- Kullanılmayan Vite şablon CSS dosyalarını kaldırın veya neden tutulduklarını belgeleyin.
- Şu reusable UI primitive'lerini oluşturun:
  - Button
  - IconButton
  - Tab
  - Modal
  - FormGrid
  - Badge
  - EmptyState
  - Toolbar
- Inline stilleri kademeli olarak sınıflara taşıyın.
- `:focus-visible` ve `prefers-reduced-motion` kurallarını global sisteme ekleyin.

Kod alanları:

- `src/assets/style.css`
- Tüm yoğun inline stil taşıyan bileşenler

Kabul kriterleri:

- Yeni ekranlar aynı button, modal, form ve badge kalıplarını kullanmalı.
- Hareket azaltma tercihi olan kullanıcılar için animasyonlar azaltılmalı.

### 6.2 İlk Yükleme Performansı

Sorun:

- Üretim derlemesinde ana JS paketi büyük.
- Birçok ağır özellik ilk paket içinde taşınıyor.

Önerilen geliştirme:

- Route bazlı lazy loading ekleyin:
  - `Moderation`
  - `TeacherDashboard`
  - `PrincipalDashboard`
  - `AnalyticsTab`
  - `MessagingHub`
  - Büyük form modalları
- Leaflet ve markercluster sadece OSM modu açıldığında yüklensin.
- Form içi harita yalnızca konum bölümü açıldığında yüklensin.
- Okul JSON verileri şehir seçimine göre yüklenmeye devam etmeli; bu davranış korunmalı ve loading durumları netleştirilmeli.

Kabul kriterleri:

- Ana bundle boyutu düşmeli veya bilinçli bütçe istisnası belgelenmeli.
- İlk ekran yükleme süresi ve etkileşime hazır olma süresi iyileşmeli.

## Önerilen İş Sırası

1. Mobil yatay taşmayı giderin.
2. EventForm ve diğer büyük formları mobil tek kolon hale getirin.
3. Sekmeleri, tıklanabilir div'leri ve modal davranışlarını erişilebilir yapın.
4. SVG haritaya klavye desteği ekleyin.
5. Mobil filtre deneyimini sadeleştirin.
6. Mesajlaşma ekranını mobil tek kolon/bottom sheet düzenine alın.
7. Tasarım sistemi primitive'lerini çıkarın.
8. Lazy loading ve bundle iyileştirmelerini uygulayın.

## Test Planı

- `npm run build`
- `npm run test`
- 360, 390, 768, 1024 ve 1280 px responsive kontrol
- Klavye ile gezinme kontrolü:
  - Header
  - Sekmeler
  - Harita
  - Formlar
  - Modallar
  - Mesajlaşma
- Erişilebilirlik kontrolü:
  - Form label bağlantıları
  - Focus görünürlüğü
  - Modal focus trap
  - Buton ve link semantiği
- Canlı ortam smoke test:
  - https://genctekatlas.web.app
  - Ana sayfa yükleniyor
  - Harita ve filtreler çalışıyor
  - Etkinlik/proje detay akışları açılıyor

## Tamamlanma Tanımı

Bu plan tamamlandığında:

- Mobilde yatay scroll kalmamalı.
- Ana ekran, filtre, harita ve formlar küçük ekranlarda okunabilir olmalı.
- Ana aksiyonlar klavye ile erişilebilir olmalı.
- Tüm form alanları doğru label bağlantısına sahip olmalı.
- Modal ve sekme davranışları standartlaşmalı.
- Büyük ekran ve mobil ekran aynı ürün hissini korumalı.
- İlk yükleme performansı için ağır paneller kademeli yüklenmeli.
