import { useApp } from "../context/AppContext";
import { Calendar, MapPin, Users, Info, X, ExternalLink, GraduationCap, Image as ImageIcon, ShieldAlert, Award } from "lucide-react";

const EventDetailsModal = () => {
  const {
    selectedDetailEvent,
    setSelectedDetailEvent,
    themes,
    getApprovedStudentCount,
    setModalType,
    allEventsRaw,
  } = useApp();

  if (!selectedDetailEvent) return null;

  const event = selectedDetailEvent;

  // Find theme metadata
  const themeObj = themes.find((t) => t.kisaKod === event.tema) || {
    ad: event.tema,
    renk: "#d90429",
    ikon: "terminal",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString("tr-TR", options);
  };

  // Find linked announcement if this is a report (gerceklesti)
  const linkedAnnouncement = event.duyuruEtkinlikId
    ? allEventsRaw.find((e) => e.id === event.duyuruEtkinlikId)
    : null;

  // Calculate capacity
  const approvedStudents = getApprovedStudentCount(event.id);
  const totalLimit = event.ogrenciSiniri;
  const isFull = totalLimit ? approvedStudents >= totalLimit : false;

  const isCollaborative = event.duzenleyenIller && event.duzenleyenIller.length > 1;

  // Format Location Text
  const getLocationText = () => {
    if (event.kapsam === "turkiye") {
      return `Türkiye Geneli`;
    }
    if (isCollaborative) {
      return `Ortaklaşa`;
    }
    return event.ilce ? `${event.il} / ${event.ilce}` : event.il;
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedDetailEvent(null)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "750px",
          width: "95%",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: `1px solid var(--border-color)`,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
          height: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Banner Image / Header */}
        <div
          style={{
            position: "relative",
            height: event.gorselUrl ? "240px" : "150px",
            background: event.gorselUrl
              ? `url(${event.gorselUrl}) center/cover no-repeat`
              : `linear-gradient(135deg, ${themeObj.renk}10 0%, ${themeObj.renk}30 100%)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "24px",
            color: event.gorselUrl ? "#ffffff" : "var(--secondary)",
            flexShrink: 0,
          }}
        >
          {event.gorselUrl && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 100%)",
                zIndex: 1,
              }}
            />
          )}

          {/* Close Button */}
          <button
            onClick={() => setSelectedDetailEvent(null)}
            className="close-btn"
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#000000",
              border: "none",
              padding: "8px",
              cursor: "pointer",
              zIndex: 10,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
            }}
          >
            <X size={18} />
          </button>

          {/* Title and Badges inside Hero Banner */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "12px",
                flexWrap: "wrap",
              }}
            >
              <span
                className="card-badge"
                style={{
                  backgroundColor: `${themeObj.renk}`,
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "11px",
                  padding: "4px 12px",
                  borderRadius: "50px",
                }}
              >
                {themeObj.ad.split(" — ")[0]}
              </span>
              <span
                className="card-badge"
                style={{
                  backgroundColor: "var(--primary-light)",
                  color: "var(--primary)",
                  fontWeight: "700",
                  fontSize: "11px",
                  padding: "4px 12px",
                  borderRadius: "50px",
                }}
              >
                {event.kapsam === "turkiye"
                  ? "Türkiye Geneli"
                  : event.kapsam === "okul"
                  ? "Okul Etkinliği"
                  : event.kapsam === "ilce"
                  ? "İlçe Etkinliği"
                  : "İl Etkinliği"}
              </span>
              <span
                className="card-badge"
                style={{
                  backgroundColor: event.durum === "duyuru" ? "var(--warning)" : "var(--success)",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "11px",
                  padding: "4px 12px",
                  borderRadius: "50px",
                }}
              >
                {event.durum === "duyuru" ? "Duyuru / Başvuru Açık" : "Tamamlandı"}
              </span>
            </div>
            <h3
              style={{
                fontSize: "24px",
                lineHeight: "1.2",
                fontWeight: "800",
                color: event.gorselUrl ? "#ffffff" : "var(--secondary)",
                textShadow: event.gorselUrl ? "0 2px 4px rgba(0,0,0,0.5)" : "none",
              }}
            >
              {event.ad}
            </h3>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          className="modal-body"
          style={{ padding: "30px", backgroundColor: "#ffffff", flexGrow: 1, overflowY: "auto" }}
        >
          {/* Linked announcement alert */}
          {linkedAnnouncement && (
            <div
              style={{
                backgroundColor: "var(--primary-light)",
                border: "1px solid rgba(217, 4, 41, 0.15)",
                color: "var(--primary)",
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              ℹ️ Bu etkinlik, daha önce duyurulmuş olan <strong>{linkedAnnouncement.ad}</strong> etkinliğinin sonuç raporudur.
            </div>
          )}

          {/* Grid Metadata */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                backgroundColor: "var(--bg-main)",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--primary)",
                  fontWeight: "700",
                  fontSize: "12px",
                }}
              >
                <Calendar size={14} /> Tarih
              </div>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--secondary)" }}>
                {formatDate(event.tarih)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                backgroundColor: "var(--bg-main)",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--primary)",
                  fontWeight: "700",
                  fontSize: "12px",
                }}
              >
                <MapPin size={14} /> Kapsam / Konum
              </div>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--secondary)" }}>
                {getLocationText()}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                backgroundColor: "var(--bg-main)",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--primary)",
                  fontWeight: "700",
                  fontSize: "12px",
                }}
              >
                <Users size={14} /> Katılımcı / Limit
              </div>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--secondary)" }}>
                {event.durum === "duyuru"
                  ? `${approvedStudents} / ${totalLimit || "Sınırsız"} Öğrenci`
                  : `${event.katilimciSayisi || "Belirtilmemiş"} Katılımcı`}
              </span>
            </div>
          </div>

          {/* Collaborative Organizer Cities Detail */}
          {event.duzenleyenIller && event.duzenleyenIller.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#f8fafc",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                marginBottom: "24px",
              }}
            >
              <Award size={20} style={{ color: "var(--primary)" }} />
              <div>
                <p className="form-hint" style={{ fontSize: "12px", margin: 0 }}>
                  {isCollaborative ? "Ortaklaşa Düzenleyen İller" : "Düzenleyen İl"}
                </p>
                <h4 style={{ color: "var(--secondary)", margin: "4px 0 0 0" }}>
                  {event.duzenleyenIller.join(", ")}
                </h4>
              </div>
            </div>
          )}

          {/* School Level Detail */}
          {event.kapsam === "okul" && event.okul && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#f8fafc",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <GraduationCap size={20} style={{ color: "var(--primary)" }} />
                <div>
                  <p className="form-hint" style={{ fontSize: "12px" }}>Düzenleyen Okul</p>
                  <h4 style={{ color: "var(--secondary)", margin: 0 }}>{event.okul.ad}</h4>
                </div>
              </div>
              {event.okul.website && (
                <a
                  href={event.okul.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-btn secondary"
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", fontSize: "13px" }}
                >
                  Okul Web Sitesi <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}

          {/* About Summary */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Info size={16} /> Özet Açıklama
            </h4>
            <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--secondary)", opacity: 0.85 }}>
              {event.aciklama}
            </p>
          </div>

          {/* Rich Content Details (Markdown-like) */}
          {event.detay && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--secondary)", marginBottom: "8px" }}>
                Etkinlik Detayları
              </h4>
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "var(--secondary)",
                  opacity: 0.9,
                  backgroundColor: "#fafafa",
                  padding: "16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  whiteSpace: "pre-line",
                }}
              >
                {event.detay}
              </div>
            </div>
          )}

          {/* Participating school list */}
          {event.katilanOkullar && event.katilanOkullar.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <GraduationCap size={16} /> Katılan Okullar ve Katılımcı Sayıları
              </h4>
              <div className="mod-table-container" style={{ margin: 0, border: "1px solid var(--border-color)" }}>
                <table className="mod-table">
                  <thead>
                    <tr>
                      <th>Okul Adı</th>
                      <th style={{ textAlign: "right" }}>Katılımcı Sayısı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.katilanOkullar.map((o, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: "600" }}>{o.okulAdi}</td>
                        <td style={{ textAlign: "right", fontWeight: "700", color: "var(--primary)" }}>{o.katilimciSayisi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gallery Images */}
          {event.galeri && event.galeri.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <ImageIcon size={16} /> Etkinlik Galerisi
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" }}>
                {event.galeri.map((imgUrl, idx) => (
                  <a href={imgUrl} target="_blank" rel="noopener noreferrer" key={idx} style={{ height: "100px", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                    <img src={imgUrl} alt={`Galeri ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Application constraints warning for users */}
          {event.durum === "duyuru" && (event.basvuruKisitlama?.ilKisitlama || event.basvuruKisitlama?.ilceKisitlama) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#fff7ed",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid #ffedd5",
                color: "#c2410c",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              <ShieldAlert size={16} />
              <span>
                Bu etkinliğe sadece <strong>{event.basvuruKisitlama.ilceKisitlama ? `"${event.il} - ${event.ilce}"` : `"${event.il}"`}</strong> okulları başvurabilir.
              </span>
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              borderTop: "1px solid var(--border-color)",
              paddingTop: "20px",
              marginTop: "20px",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setSelectedDetailEvent(null)}
              className="card-btn secondary"
              style={{ border: "1px solid var(--border-color)", padding: "10px 20px" }}
            >
              Kapat
            </button>

            {event.durum === "duyuru" ? (
              <button
                className="card-btn primary"
                disabled={isFull}
                onClick={() => {
                  setModalType("apply-event");
                }}
                style={{ padding: "10px 20px" }}
              >
                {isFull ? "Kontenjan Doldu" : "Başvur"}
              </button>
            ) : (
              event.baglanti && (
                <a
                  href={event.baglanti}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-btn primary"
                  style={{ padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: "8px", color: "#ffffff" }}
                >
                  Etkinlik Raporu / Detay <ExternalLink size={14} />
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
