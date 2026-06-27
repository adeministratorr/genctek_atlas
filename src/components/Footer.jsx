import { Globe, Shield } from "lucide-react";

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
