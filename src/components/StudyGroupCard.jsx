import { useState } from "react";
import { Users, ArrowRight, Copy, Check } from "lucide-react";
import { useApp } from "../context/AppContext";

const StudyGroupCard = ({ group, onSelect }) => {
  const { user, joinStudyGroupById } = useApp();
  const { id, ad, aciklama, tema, members = [], inviteCode } = group;
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);

  const isMember = user ? members.includes(user.uid) : false;

  const handleJoin = async (e) => {
    e.stopPropagation();
    if (joining) return;
    setJoining(true);
    try {
      await joinStudyGroupById(id);
      alert("Gruba başarıyla katıldınız!");
    } catch (err) {
      alert(err.message || "Katılım hatası");
    } finally {
      setJoining(false);
    }
  };

  // Format theme names nicely
  const formatTheme = (themeStr) => {
    if (!themeStr) return "";
    return themeStr
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="premium-card" 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between", 
        height: "100%",
        padding: "24px"
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
          <span 
            className="badge glow-badge-primary" 
            style={{ 
              fontSize: "11px", 
              fontWeight: "700",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              padding: "4px 10px",
              borderRadius: "50px"
            }}
          >
            {formatTheme(tema)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
            <Users size={15} style={{ color: "var(--primary)" }} />
            <span>{members.length} Üye</span>
          </div>
        </div>

        <h3 className="card-title" style={{ fontSize: "19px", fontWeight: "800", marginBottom: "10px", color: "var(--secondary)" }}>
          {ad}
        </h3>
        <p className="card-text" style={{ fontSize: "13.5px", color: "var(--text-muted)", WebkitLineClamp: 3, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "20px", lineHeight: "1.5" }}>
          {aciklama || "Grup açıklaması belirtilmemiş."}
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Kod:</span>
          <button
            onClick={handleCopy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(217, 4, 41, 0.05)",
              border: "1px dashed rgba(217, 4, 41, 0.2)",
              borderRadius: "var(--radius-sm)",
              padding: "4px 8px",
              cursor: "pointer",
              transition: "var(--transition-fast)",
            }}
            title="Kodu Kopyala"
          >
            <code style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary)", fontFamily: "monospace" }}>{inviteCode}</code>
            {copied ? <Check size={12} style={{ color: "green" }} /> : <Copy size={12} style={{ color: "var(--text-muted)" }} />}
          </button>
        </div>
        
        {isMember ? (
          <button
            onClick={() => onSelect(group.id)}
            className="btn btn-primary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px", borderRadius: "50px", fontWeight: "700" }}
          >
            Gruba Git <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="btn btn-outline btn-sm"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px", 
              padding: "8px 14px", 
              fontSize: "12px", 
              borderRadius: "50px", 
              fontWeight: "700",
              borderColor: "var(--primary)",
              color: "var(--primary)"
            }}
          >
            {joining ? "Katılınıyor..." : "Katıl"} <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyGroupCard;
