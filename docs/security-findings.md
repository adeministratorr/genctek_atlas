# GençTek Atlas - Güvenlik Bulguları Raporu (Security Findings Report)

Bu belge, GençTek Atlas projesinde gerçekleştirilen siber güvenlik testleri sonucunda tespit edilen açıkların, risk derecelerinin ve çözüm önerilerinin belgelenmesi için hazırlanmıştır.

---

## 1. Tespit Edilen Bulgular Tablosu

| ID         | Bulgu Tanımı                                                | Etkilenen Bileşen                               | Risk Derecesi (Kritik/Yüksek/Orta/Düşük) | Durum (Açık/Kapatıldı) |
| :--------- | :---------------------------------------------------------- | :---------------------------------------------- | :--------------------------------------- | :--------------------- |
| **SEC-01** | Yetkisiz Rol Atama (Role Privilege Escalation)              | `src/context/AppContext.jsx`, `firestore.rules` | Kritik                                   | Kapatıldı              |
| **SEC-02** | İl Bazlı Yetkisiz Erişim (Provincial Data Exposure)         | `firestore.rules`                               | Yüksek                                   | Kapatıldı              |
| **SEC-03** | Mesajlaşma Sistemi Erişim Eksikliği (Direct Messages Leaks) | `firestore.rules`                               | Yüksek                                   | Kapatıldı              |

---

## 2. Bulgu Detayları ve Çözüm Önerileri

### 🔴 SEC-01: Yetkisiz Rol Atama (Role Privilege Escalation)

- **Risk Derecesi:** Kritik
- **Açıklama:** Kayıt formlarında genel kullanıcıların (`student`, `teacher` vb.) istemci tarafında veya doğrudan veritabanı istekleriyle `role` alanını `admin`, `coordinator` or `commission` olarak belirleyip kaydolabilmesi riski bulunuyordu.
- **Kanıt (Proof of Concept - PoC):**
  İstemciden gönderilen kayıt isteğinde veri manipülasyonu:
  ```json
  {
    "uid": "attacker_uid",
    "adSoyad": "Attacker",
    "role": "admin"
  }
  ```
- **Etki Derecesi:** Saldırganlar moderasyon panelini ele geçirebilir, tüm etkinlikleri silebilir veya sahte etkinlikler onaylayabilirdi.
- **Çözüm Önerisi (Remediation):**
  1. İstemci tarafında `registerUser` metoduna rol korumaları eklendi.
  2. `firestore.rules` dosyasında `users` koleksiyonu `create` izninde engelli roller tanımlandı:
     ```javascript
     allow create: if isSignedIn() && request.auth.uid == userId
                   && !(request.resource.data.role in ['admin', 'coordinator', 'commission']);
     ```

---

### 🔴 SEC-02: İl Bazlı Yetkisiz Erişim (Provincial Data Exposure)

- **Risk Derecesi:** Yüksek
- **Açıklama:** Komisyon üyelerinin (`commission`) sadece kendi illerindeki etkinlik başvurularını (`event_applications`) ve çalışma gruplarını (`groups`) okuması gerekirken, kısıtlama olmaması durumunda tüm Türkiye genelindeki verileri sızdırabilmesi riski mevcuttu.
- **Kanıt (Proof of Concept - PoC):**
  Bir komisyon üyesinin tüm `groups` dokümanlarını çekmek için yaptığı sorgunun kısıtlanmaması.
- **Etki Derecesi:** Farklı illerdeki öğrencilerin ve öğretmenlerin kişisel çalışma verilerinin ve başvurularının ifşası.
- **Çözüm Önerisi (Remediation):**
  `firestore.rules` dosyasında komisyon rolü için il eşleşmesi kontrolü eklendi:
  ```javascript
  isCommission() &&
    "il" in resource.data &&
    getUserData().il == resource.data.il;
  ```

---

### 🔴 SEC-03: Mesajlaşma Sistemi Erişim Eksikliği (Direct Messages Leaks)

- **Risk Derecesi:** Yüksek
- **Açıklama:** Eklenen anlık mesajlaşma (`direct_messages`) modülünde, tarafların kimlik doğrulaması ve gönderici/alıcı filtrelemesi kurallarla korunmadığı takdirde üçüncü şahısların tüm yazışmaları okuyabilme riski bulunuyordu.
- **Kanıt (Proof of Concept - PoC):**
  Herhangi bir doğrulanmış kullanıcının `direct_messages` koleksiyonundaki tüm mesajları sorgulayabilmesi.
- **Etki Derecesi:** Kullanıcılar arasındaki özel yazışmaların ve kişisel bilgilerin sızdırılması.
- **Çözüm Önerisi (Remediation):**
  `direct_messages` koleksiyonuna sadece ilgili gönderici ve alıcının okuma/yazma yapabilmesini sağlayan kurallar eklendi:
  ```javascript
  match /direct_messages/{messageId} {
    allow read: if isSignedIn() && (request.auth.uid == resource.data.senderId || request.auth.uid == resource.data.receiverId);
    allow create: if isSignedIn() && request.auth.uid == request.resource.data.senderId;
    allow update: if isSignedIn() && request.auth.uid == resource.data.receiverId && request.resource.data.okundu == true;
  }
  ```

---

## 3. Genel Değerlendirme

Siber güvenlik testlerinde tespit edilen tüm kritik ve yüksek dereceli açıklar hem istemci hem de Firestore sunucu kuralları düzeyinde yamalanmıştır. Sistem şu anki haliyle rol tabanlı yetkilendirme ve veri gizliliği açısından güvenlidir.
