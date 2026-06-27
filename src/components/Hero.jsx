const Hero = () => {
  return (
    <section className="hero-section" id="hero-section">
      <div className="container hero-content">
        <span className="hero-tag">GençTek Vibe Coding Kampı</span>
        <h2 className="hero-title">
          Türkiye'nin GençTek <span>Atlası</span>
        </h2>
        <p className="hero-desc">
          81 ildeki tüm GençTek etkinliklerini, öğrenci projelerini ve yenilikçi
          çalışmaları interaktif Türkiye haritası üzerinden keşfedin ve
          ekosistemin bir parçası olun.
        </p>

        {/* Open Source & Vibe Coding Disclaimer */}
        <div
          className="hero-disclaimer"
          style={{
            marginTop: "24px",
            padding: "16px 20px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            fontSize: "13px",
            lineHeight: "1.6",
            color: "rgba(255, 255, 255, 0.85)",
            textAlign: "left",
            backdropFilter: "blur(8px)",
            maxWidth: "800px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px 0",
              fontWeight: "700",
              color: "#ffffff",
              fontSize: "14px",
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              borderTop: "1px solid rgba(255, 255, 255, 0.15)",
              paddingTop: "10px",
              marginTop: "10px",
            }}
          >
            <span
              style={{
                fontWeight: "800",
                color: "#ffffff",
                letterSpacing: "1px",
                fontSize: "11px",
                textTransform: "uppercase",
              }}
            >
              İncele · Klonla · Geliştir · Yayınla
            </span>
            <a
              href="https://github.com/adeministratorr/genctek_atlas"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#ffffff",
                fontWeight: "700",
                textDecoration: "underline",
                fontSize: "12px",
              }}
            >
              <svg
                height="14"
                width="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                style={{ verticalAlign: "middle" }}
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub Deposu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
