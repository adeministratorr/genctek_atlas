import { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, Award, Shield, Compass, Landmark, Phone, Mail, Star } from "lucide-react";

const UserProfileModal = () => {
  const { userProfile, updateUserProfileData, setModalType } = useApp();

  const [formData, setFormData] = useState({
    adSoyad: userProfile?.adSoyad || "",
    telefon: userProfile?.telefon || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    if (!formData.adSoyad.trim()) {
      setErrorMsg("Ad Soyad zorunludur.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserProfileData(userProfile.uid, {
        adSoyad: formData.adSoyad.trim(),
        telefon: formData.telefon.trim(),
      });
      setSuccessMsg("Profiliniz başarıyla güncellendi!");
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMsg("");
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Profil güncellenirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Sistem Yöneticisi";
      case "coordinator":
        return "İl STEM Koordinatörü";
      case "principal":
        return "Okul Müdürü";
      case "teacher":
        return "Danışman Öğretmen";
      case "student":
        return "Öğrenci";
      default:
        return "Kullanıcı";
    }
  };

  // Safe defaults for XP and Badges
  const userXP = userProfile?.xp || 0;
  const userLevel = Math.floor(userXP / 100) + 1;
  const xpInLevel = userXP % 100;
  const userBadges = userProfile?.badges || [];

  const getBadgeDetails = (badgeName) => {
    switch (badgeName) {
      case "Kaşif":
        return { icon: "🧭", bg: "rgba(37, 99, 235, 0.05)", border: "rgba(37, 99, 235, 0.15)", text: "#2563eb", desc: "Profilini güncelleyen ilk adımları atan kaşif." };
      case "Aktif Katılımcı":
        return { icon: "🔥", bg: "rgba(220, 38, 38, 0.05)", border: "rgba(220, 38, 38, 0.15)", text: "#dc2626", desc: "Etkinliklere aktif katılım sağlayan üye." };
      case "Girişimci":
        return { icon: "💡", bg: "rgba(168, 85, 247, 0.05)", border: "rgba(168, 85, 247, 0.15)", text: "#a855f7", desc: "Projesi onaylanan genç girişimci." };
      case "Ekip Oyuncusu":
        return { icon: "🤝", bg: "rgba(22, 163, 74, 0.05)", border: "rgba(22, 163, 74, 0.15)", text: "#16a34a", desc: "Çalışma gruplarında uyumla çalışan takım lideri." };
      case "Görev Canavarı":
        return { icon: "⚡", bg: "rgba(234, 88, 12, 0.05)", border: "rgba(234, 88, 12, 0.15)", text: "#ea580c", desc: "Verilen görevleri başarıyla tamamlayan kahraman." };
      case "İletişimci":
        return { icon: "💬", bg: "rgba(13, 148, 136, 0.05)", border: "rgba(13, 148, 136, 0.15)", text: "#0d9488", desc: "İlk mesajı göndererek iletişimi başlatan üye." };
      default:
        return { icon: "🏆", bg: "rgba(75, 85, 99, 0.05)", border: "rgba(75, 85, 99, 0.15)", text: "#4b5563", desc: "Başarılarıyla öne çıkan üyemiz." };
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setModalType(null)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "600px", width: "90%", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Shield size={22} style={{ color: "var(--primary)" }} />
            <h3>Kullanıcı Profili</h3>
          </div>
          <button className="close-btn" onClick={() => setModalType(null)}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px" }}>
          
          {/* Avatar and Main Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
            <div style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: "800",
              boxShadow: "var(--shadow-sm)"
            }}>
              {userProfile?.adSoyad?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h4 style={{ margin: 0, color: "var(--secondary)", fontWeight: "800" }}>{userProfile?.adSoyad}</h4>
              <span className="card-badge" style={{
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                marginTop: "6px",
                display: "inline-block",
                fontWeight: "700"
              }}>
                {getRoleLabel(userProfile?.role)}
              </span>
            </div>
          </div>

          {/* Seviye ve İlerleme Durumu */}
          <div style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.15)",
            borderRadius: "12px",
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.03)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "800", color: "var(--primary)", display: "flex", alignItems: "center", gap: "6px", fontSize: "15px" }}>
                <Star size={18} fill="var(--primary)" style={{ filter: "drop-shadow(0 2px 4px rgba(99, 102, 241, 0.2))" }} /> Seviye {userLevel}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                {xpInLevel} / 100 XP (Toplam: {userXP} XP)
              </span>
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              borderRadius: "10px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${xpInLevel}%`,
                height: "100%",
                background: "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                borderRadius: "10px",
                transition: "width 0.4s ease-out"
              }}></div>
            </div>
          </div>

          {/* Edit / View Profile Section */}
          {!isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Mail size={16} style={{ color: "var(--text-muted)" }} />
                  <div>
                    <p className="form-hint" style={{ fontSize: "11px", margin: 0 }}>E-posta</p>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600" }}>{userProfile?.eposta}</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Phone size={16} style={{ color: "var(--text-muted)" }} />
                  <div>
                    <p className="form-hint" style={{ fontSize: "11px", margin: 0 }}>Telefon</p>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600" }}>{userProfile?.telefon || "-"}</p>
                  </div>
                </div>

                {userProfile?.il && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Compass size={16} style={{ color: "var(--text-muted)" }} />
                    <div>
                      <p className="form-hint" style={{ fontSize: "11px", margin: 0 }}>Bölge / İl</p>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "600" }}>{userProfile?.ilce ? `${userProfile.ilce} / ` : ""}{userProfile.il}</p>
                    </div>
                  </div>
                )}

                {userProfile?.schoolId && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Landmark size={16} style={{ color: "var(--text-muted)" }} />
                    <div>
                      <p className="form-hint" style={{ fontSize: "11px", margin: 0 }}>Kurum / Okul</p>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "600" }}>{userProfile.schoolId}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Kazanılan Rozetler Kabini */}
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
                <h5 style={{ fontWeight: "800", color: "var(--secondary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "15px" }}>
                  <Award size={20} style={{ color: "var(--primary)" }} /> Kazanılan Rozetler ({userBadges.length})
                </h5>
                {userBadges.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    padding: "24px",
                    backgroundColor: "var(--bg-light)",
                    borderRadius: "12px",
                    border: "1px dashed var(--border-color)"
                  }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
                      Henüz bir rozet kazanılmadı.
                    </p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "var(--text-muted)" }}>
                      Sitedeki etkinliklere başvurarak veya çalışma gruplarına katılarak ilk rozetlerinizi toplayın!
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                    gap: "12px"
                  }}>
                    {userBadges.map((badge, idx) => {
                      const details = getBadgeDetails(badge);
                      return (
                        <div
                          key={idx}
                          title={details.desc}
                          style={{
                            backgroundColor: details.bg,
                            border: `1px solid ${details.border}`,
                            borderRadius: "12px",
                            padding: "12px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            gap: "6px",
                            transition: "all 0.2s ease",
                            cursor: "help",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.04)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
                          }}
                        >
                          <span style={{ fontSize: "24px" }}>{details.icon}</span>
                          <span style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: details.text,
                            lineHeight: "1.2"
                          }}>
                            {badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                <button className="card-btn primary" onClick={() => setIsEditing(true)}>Profili Düzenle</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {errorMsg && <div className="form-error">{errorMsg}</div>}
              {successMsg && <div style={{ color: "var(--success)", fontWeight: "600", fontSize: "14px" }}>{successMsg}</div>}

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ad Soyad *</label>
                <input
                  type="text"
                  name="adSoyad"
                  className="form-control"
                  value={formData.adSoyad}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Telefon Numarası</label>
                <input
                  type="text"
                  name="telefon"
                  className="form-control"
                  value={formData.telefon}
                  onChange={handleInputChange}
                  placeholder="05xx xxx xx xx"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="button" className="card-btn secondary" onClick={() => setIsEditing(false)}>İptal</button>
                <button type="submit" className="card-btn primary" disabled={isSubmitting}>
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
