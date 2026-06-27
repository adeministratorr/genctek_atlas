# GençTek Atlas - Etik İnceleme ve Yapay Zeka Kullanım Kontrolü

Bu belge, GençTek Atlas projesinin etik, KVKK farkındalığı, öğrenci güvenliği, yapay zeka kullanımı ve telif hakları açısından düzenli olarak kontrol edilmesi için hazırlanmıştır.

> Not: Bu belge hukuki danışmanlık yerine geçmez. Canlı kullanım öncesinde KVKK, veli/onay süreçleri ve veri saklama politikası yetkili kişilerce ayrıca gözden geçirilmelidir.

---

## 1. Etik İnceleme Özeti

| Alan                      | Durum           | Değerlendirme                                                                                      | Aksiyon                                                                              |
| :------------------------ | :-------------- | :------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| Yapay zeka kullanımı      | Uygun           | Kod, prompt ve doküman üretiminde AI destekli geliştirme açıkça belirtilmiş.                       | AI çıktıları insan tarafından kontrol edilmeye devam etmeli.                         |
| Kişisel veri farkındalığı | Aksiyon gerekli | Uygulama e-posta, telefon, veli telefonu, öğrenci profili, mesaj ve bildirim verileri işleyebilir. | Canlı kullanım öncesi aydınlatma metni ve açık rıza/onay akışı eklenmeli.            |
| Öğrenci güvenliği         | Kısmi           | Rol bazlı erişim, onay bekleyen kayıtlar ve özel mesaj rules kontrolleri var.                      | Mesajlaşma için şikayet/engelleme ve kötüye kullanım süreci tanımlanmalı.            |
| Veri minimizasyonu        | Kısmi           | T.C. kimlik numarası gibi yüksek riskli veri alanı yok.                                            | Telefon ve veli telefonu gibi alanların zorunluluğu tekrar değerlendirilmeli.        |
| Şeffaflık                 | Kısmi           | README ve sunumda AI/Firebase kullanımı anlatılıyor.                                               | Kullanıcıya hangi verinin neden istendiği form ekranlarında sade dille belirtilmeli. |
| Telif ve lisans           | Uygun           | Açık kaynak paketler ve lisanslı/yerel varlıklar kullanılıyor.                                     | Yüklenen proje görselleri ve prompt dosyaları için kaynak/izin kontrolü yapılmalı.   |
| Güvenlik doğrulama        | Uygun           | `npm run test:security`, Firestore/Storage rules ve güvenlik test planı var.                       | Deploy öncesi manuel QA tablosu doldurulmalı.                                        |

---

## 2. Kişisel Veri Envanteri

| Veri                       | Nerede Kullanılır                            | Amaç                               | Risk        | Mevcut Kontrol                        | Üretim Öncesi Gereken                       |
| :------------------------- | :------------------------------------------- | :--------------------------------- | :---------- | :------------------------------------ | :------------------------------------------ |
| Ad soyad                   | Kullanıcı, öğrenci, başvuru, mesaj ekranları | Profil ve başvuru takibi           | Orta        | Rol bazlı ekranlar ve Firestore rules | Aydınlatma metni                            |
| E-posta                    | Firebase Auth, kullanıcı profili, iletişim   | Giriş ve hesap yönetimi            | Orta        | Firebase Auth ve kullanıcı onayı      | Veri saklama süresi                         |
| Telefon                    | Öğretmen, koordinatör, veli alanları         | İletişim ve doğrulama              | Yüksek      | Rol bazlı erişim                      | Zorunluluk tekrar değerlendirilmeli         |
| Veli telefonu              | Öğrenci yönetimi                             | Öğrenci güvenliği ve iletişim      | Yüksek      | Öğretmen/admin ekranları              | Veli bilgilendirme/onay süreci              |
| İl, ilçe, okul             | Harita, dashboard ve yetkilendirme           | Bölgesel analiz ve görev dağılımı  | Orta        | Komisyon/rol kuralları                | Toplu raporlarda anonimleştirme             |
| Direkt mesaj içeriği       | Mesajlaşma modülü                            | Öğrenci/öğretmen iletişimi         | Yüksek      | Gönderici/alıcı erişim kuralları      | Şikayet, engelleme ve denetim politikası    |
| Bildirimler                | Bildirim paneli                              | Kullanıcıyı bilgilendirme          | Düşük/Orta  | Kullanıcıya özel okuma/silme rules    | Gereksiz bildirimlerden kaçınma             |
| Proje GitHub/demo linkleri | Proje kartları ve moderasyon                 | Proje kanıtı ve paylaşım           | Orta        | GitHub URL validasyonu                | Öğrencilere kişisel veri paylaşmama uyarısı |
| Görsel/prompt dosyaları    | Firebase Storage                             | Proje tanıtımı ve AI süreci kanıtı | Orta/Yüksek | Dosya türü ve boyut kuralları         | Telif ve kişisel veri kontrolü              |

---

## 3. Yapay Zeka Kullanım Kontrol Listesi

| Madde                                               | Kontrol Kriteri | Durum         | Açıklama                                                                                             |
| :-------------------------------------------------- | :-------------- | :------------ | :--------------------------------------------------------------------------------------------------- |
| AI çıktıları insan tarafından kontrol edildi mi?    | Evet            | Uygun         | Kod, güvenlik kuralları ve dokümanlar testlerle doğrulanıyor.                                        |
| AI kullanımı açıkça belirtildi mi?                  | Evet            | Uygun         | README, sunum ve prompt rehberi Vibe Coding yaklaşımını anlatıyor.                                   |
| Promptlar arşivlendi mi?                            | Evet            | Uygun         | `prompts.md` ve `docs/VIBE_CODING_PROMPTS.md` mevcut.                                                |
| AI'ya gizli anahtar verildi mi?                     | Hayır           | Uygun         | `.env` ve `.env.*` dosyaları `.gitignore` içinde.                                                    |
| AI çıktısı telif riski açısından kontrol edildi mi? | Kısmi           | Takip gerekli | Kod paketleri açık kaynak; kullanıcıların yüklediği görsel/prompt dosyaları ayrıca kontrol edilmeli. |
| Öğrenciye yönelik metinler sade mi?                 | Evet            | Uygun         | Prompt rehberleri lise öğrencilerine uygun sade Türkçe ile yazılıyor.                                |

---

## 4. Öğrenci Güvenliği ve Moderasyon

| Kontrol                                           | Durum | Not                                                                          |
| :------------------------------------------------ | :---- | :--------------------------------------------------------------------------- |
| Yeni etkinlik/proje kayıtları önce onay bekliyor  | Uygun | Kayıtlar varsayılan olarak `onaylandi: false` başlıyor.                      |
| Yetkisiz rol atama engelleniyor                   | Uygun | Genel kayıt akışı `admin`, `coordinator`, `commission` rollerini engelliyor. |
| Direkt mesajlar sadece taraflarca okunabiliyor    | Uygun | Firestore rules gönderici/alıcı kontrolü içeriyor.                           |
| Öğretmen ve öğrenci ekranları rol bazlı ayrılıyor | Kısmi | Uygulama tarafında ayrım var; deploy öncesi manuel test yapılmalı.           |
| Mesaj şikayet/engelleme akışı var                 | Eksik | Üretim öncesi eklenmesi önerilir.                                            |
| Öğrenci içeriklerinde kişisel veri uyarısı var    | Eksik | Proje/prompt yükleme ekranlarına sade uyarı eklenmeli.                       |

---

## 5. Üretim Öncesi Etik Aksiyon Listesi

| Öncelik | Aksiyon                                                                                 | Sorumlu                      | Durum    |
| :------ | :-------------------------------------------------------------------------------------- | :--------------------------- | :------- |
| Yüksek  | Aydınlatma metni: hangi veri, neden, ne kadar süre saklanır, kimler görür               | Proje sahibi / hukuk         | Bekliyor |
| Yüksek  | Öğrenci ve veli onay süreci: özellikle veli telefonu, öğrenci hesabı ve mesajlaşma için | Proje sahibi / okul yönetimi | Bekliyor |
| Yüksek  | Mesajlaşma güvenliği: şikayet et, engelle, kötüye kullanım inceleme süreci              | Ürün / geliştirme            | Bekliyor |
| Orta    | Veri silme/düzeltme talebi süreci                                                       | Proje sahibi                 | Bekliyor |
| Orta    | Telefon alanlarının gerçekten zorunlu olup olmadığını tekrar değerlendirme              | Ürün / okul yönetimi         | Bekliyor |
| Orta    | Proje görseli ve prompt dosyası için telif/kişisel veri uyarısı                         | Geliştirme                   | Bekliyor |
| Düşük   | Analiz ekranlarında mümkün olduğunda toplu ve anonim gösterim                           | Geliştirme                   | Bekliyor |

---

## 6. Doğrulama Komutları

Kod değişikliklerinden sonra:

```bash
npm run test:security
npm run lint
npm run test
npm run build
```

Sadece etik/dokümantasyon güncellendiyse:

- Bu dosyadaki tabloların güncel uygulama davranışıyla çelişmediğini kontrol edin.
- `docs/security-test-plan.md` içindeki QA tablosunda ilgili manuel testleri işaretleyin.
- Canlı deploy öncesi aydınlatma/onay metinlerinin gerçekten kullanıcıya gösterildiğini doğrulayın.

---

## 7. Etik Taahhüt Beyanı

> Bu projede yapay zeka bir öğrenme ve geliştirme aracı olarak kullanılmıştır. AI çıktıları doğrudan kabul edilmemeli; kod, güvenlik kuralları, kullanıcı verisi ve öğrenci güvenliği insan sorumluluğunda gözden geçirilmelidir. GençTek Atlas, öğrencilerin üretimini görünür kılarken kişisel verileri gereksiz toplamamayı, özel iletişimi korumayı ve kullanıcıya açık bilgi vermeyi temel ilke kabul eder.
