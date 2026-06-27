import { Globe, Shield, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="app-footer" id="app-footer">
      <div className="container">
        <div className="footer-grid">
          {/* About Column */}
          <div className="footer-about">
            <h3>GençTek Atlas</h3>
            <p>
              Türkiye genelindeki 81 ilde yapılan tüm GençTek etkinliklerini, 18
              yenilikçi temadaki çalışmaları ve öğrencilerin ürettiği projeleri
              interaktif harita üzerinde gösteren açık kaynaklı topluluk
              platformudur.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="footer-links">
            <h4>Hızlı Bağlantılar</h4>
            <ul>
              <li>
                <a href="#hero-section">Ana Sayfa</a>
              </li>
              <li>
                <a href="#map-section">İnteraktif Harita</a>
              </li>
              <li>
                <a href="#filters-section">Filtreler</a>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="footer-links">
            <h4>GençTek Portalı</h4>
            <ul>
              <li>
                <a
                  href="http://genctek.eba.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Globe size={14} /> GençTek Web Sitesi
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Globe size={14} /> GitHub Deposu
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div
          className="footer-disclaimer"
          style={{
            marginTop: "30px",
            marginBottom: "20px",
            padding: "20px",
            backgroundColor: "rgba(230, 0, 0, 0.04)",
            border: "1px solid rgba(230, 0, 0, 0.15)",
            borderRadius: "8px",
            fontSize: "13px",
            lineHeight: "1.6",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 10px 0",
              fontWeight: "600",
              color: "var(--primary)",
            }}
          >
            GençTek Atlas, öğrencilerin Vibe Coding sürecini uygulamalı olarak
            inceleyebilmesi için hazırlanmış açık kaynaklı bir örnek projedir.
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            Bu uygulama nihai ve resmî bir ürün değildir; arayüzü, özellikleri
            ve teknik yapısı geliştirilmeye açıktır. Dileyen herkes projeyi
            GitHub reposundan klonlayabilir, kendi bilgisayarında
            çalıştırabilir, düzenleyebilir, yeni özellikler ekleyebilir ve
            Firebase üzerinden kendi sürümünü yayına alabilir.
          </p>
          <p
            style={{
              margin: "0 0 12px 0",
              fontWeight: "700",
              color: "var(--secondary)",
              letterSpacing: "1px",
            }}
          >
            İncele · Klonla · Geliştir · Yayınla
          </p>
          <a
            href="https://github.com/adeministratorr/genctek_atlas"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--primary)",
              fontWeight: "700",
              textDecoration: "underline",
            }}
          >
            <Github size={14} /> GitHub:
            https://github.com/adeministratorr/genctek_atlas
          </a>
        </div>

        {/* Footer Bottom Row */}
        <div className="footer-bottom">
          <p>
            &copy; 2026 GençTek Atlas. Tüm Hakları Saklıdır. MIT Lisansı ile
            açık kaynak olarak geliştirilmiştir.
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Shield size={14} /> Vibe Coding Kış Kampı Projesi
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
