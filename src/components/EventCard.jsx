import { useApp } from "../context/AppContext";
import { Calendar, MapPin, Users, ExternalLink, GraduationCap } from "lucide-react";

const EventCard = ({ event }) => {
  const { themes, setSelectedDetailEvent, getApprovedStudentCount } = useApp();

  // Find theme metadata
  const themeObj = themes.find((t) => t.kisaKod === event.tema) || {
    ad: event.tema,
    renk: "#d90429",
    ikon: "terminal",
  };

  // Format Date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString("tr-TR", options);
  };

  // Approved student count for dynamic announcements
  const approvedStudents = getApprovedStudentCount(event.id);
  const totalLimit = event.ogrenciSiniri;
  const isFull = totalLimit ? approvedStudents >= totalLimit : false;

  const isCollaborative = event.duzenleyenIller && event.duzenleyenIller.length > 1;

  // Format Location Text
  const getLocationText = () => {
    if (event.kapsam === "turkiye") {
      return `Türkiye Geneli (${event.duzenleyenIller ? event.duzenleyenIller.join(", ") : event.il})`;
    }
    if (isCollaborative) {
      return `Ortak: ${event.duzenleyenIller.join(", ")}`;
    }
    return event.ilce ? `${event.il} - ${event.ilce}` : event.il;
  };

  return (
    <div
      className="item-card"
      id={`event-card-${event.id}`}
      style={{ borderLeft: `4px solid ${themeObj.renk}` }}
    >
      {/* Badge Row */}
      <div className="card-badge-row">
        <span
          className="card-badge theme"
          style={{
            backgroundColor: `${themeObj.renk}15`,
            color: themeObj.renk,
          }}
        >
          {themeObj.ad.split(" — ")[0]}
        </span>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <span className="card-badge city">
            {event.kapsam === "turkiye" ? "Türkiye Geneli" : isCollaborative ? "Ortaklaşa" : event.il}
          </span>
          <span
            className="card-badge format"
            style={{
              backgroundColor: event.durum === "duyuru" ? (isFull ? "#ef4444" : "var(--warning)") : undefined,
              color: event.durum === "duyuru" ? "#ffffff" : undefined,
            }}
          >
            {event.durum === "duyuru" ? (isFull ? "Kontenjan Doldu" : "Başvuru Açık") : event.format}
          </span>
        </div>
      </div>

      {/* Main Info */}
      <h4 className="card-title">{event.ad}</h4>
      <p className="card-desc">{event.aciklama}</p>

      {/* School details if it is a school scope event */}
      {event.kapsam === "okul" && event.okul && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: "600",
            color: "var(--primary)",
            marginBottom: "12px",
            backgroundColor: "var(--bg-main)",
            padding: "6px 10px",
            borderRadius: "var(--radius-sm)",
            width: "fit-content",
          }}
        >
          <GraduationCap size={14} />
          <span>{event.okul.ad}</span>
        </div>
      )}

      {/* Meta Row */}
      <div className="card-meta-row" style={{ display: "flex", flexWrap: "wrap", gap: "12px 16px" }}>
        <div className="card-meta-item">
          <Calendar size={14} />
          <span>{formatDate(event.tarih)}</span>
        </div>
        <div className="card-meta-item">
          <MapPin size={14} />
          <span>{getLocationText()}</span>
        </div>
        <div className="card-meta-item">
          <Users size={14} />
          {event.durum === "duyuru" ? (
            <span>
              {approvedStudents} / {totalLimit || "Sınırsız"} Öğrenci
            </span>
          ) : (
            <span>{event.katilimciSayisi} Katılımcı</span>
          )}
        </div>
      </div>

      {/* Links / Action Button */}
      <div className="card-links">
        <button
          onClick={() => setSelectedDetailEvent(event)}
          className="card-btn primary"
          style={{ width: "fit-content", border: "none", cursor: "pointer" }}
        >
          Detaylar & {event.durum === "duyuru" ? "Başvur" : "Sonuç"} <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
};

export default EventCard;
