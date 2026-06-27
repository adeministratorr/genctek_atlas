# GençTek Atlas - Teknik Karar Belgesi (Technical Decisions)

Bu belge, GençTek Atlas projesinde benimsenen teknolojik seçimlerin gerekçelerini ve mimari kararlarını içerir.

---

## 1. Frontend Teknolojisi: React + Vite

### Karar Gerekçesi:

- **Vibe Coding Verimliliği:** React'in modüler bileşen (component) yapısı, yapay zekanın kodu daha küçük parçalarda, daha az bağlam (context) karmaşasıyla ve yüksek doğrulukla üretmesini sağlamıştır.
- **Firebase Entegrasyonu:** Firebase Web SDK v9+ modüler API'si, React'in state ve hook (`useState`, `useEffect`, `useContext`) yapısıyla kusursuz bir şekilde eşleşerek sunucusuz reaktif akışı hızlandırmıştır.
- **Vite Derleme Hızı:** Çok hızlı HMR (Hot Module Replacement) sunması sayesinde geliştirme sürecinde anlık geri bildirim alınmış ve kış kampı süresince zaman kaybı önlenmiştir.

---

## 2. Harita Teknolojisi: İnteraktif SVG Harita (Önerilen & Seçilen)

### Karar Gerekçesi:

- **Sıfır Dış Bağımlılık (No Dependency):** Harita gösterimi için harici bir harita motoru (Leaflet.js, OpenLayers veya Google Maps API) yüklenmemiştir. Bu sayede bundle boyutu küçültülmüş ve API anahtarı sınırlandırmaları aşılmıştır.
- **Esnek CSS Tasarımı:** Türkiye'nin 81 iline ait sınırlar SVG vektör yolları (`path`) olarak yerel düzeyde işlenmiştir. İllerin hover (üzerine gelme), selected (seçilme) ve active (etkinlik/proje barındırma) durumları tamamen Vanilla CSS ile dinamik olarak kontrol edilebilmektedir.
- **Responsive Performans:** SVG doğası gereği her ekran boyutunda (mobil, tablet, masaüstü) netliğini kaybetmeden ve CPU/GPU'yu yormadan responsive olarak ölçeklenmektedir.
- **Metadataya Erişim:** Her il `data-plakakodu` ve `data-iladi` niteliklerini taşır. Bu sayede harita ile Firestore veri tabanı arasındaki ilişki, plaka veya il ismi üzerinden 1-1 reaktif olarak kurulmuştur.
