import { useState } from "react";
import { useApp } from "../context/AppContext";
import StudyGroupCard from "./StudyGroupCard";
import StudyGroupDetail from "./StudyGroupDetail";
import { Plus, Users, UserPlus, X, RefreshCw } from "lucide-react";

const StudyGroupHub = () => {
  const {
    user,
    userRole,
    userProfile,
    groups,
    activeGroup,
    fetchGroups,
    fetchGroupDetails,
    createStudyGroup,
    joinStudyGroupWithCode,
    setSelectedDetailEvent, // Reset event details if active
    setActiveGroup,
  } = useApp();

  const [inviteCode, setInviteCode] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupForm, setGroupForm] = useState({ ad: "", aciklama: "", tema: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await joinStudyGroupWithCode(inviteCode);
      setSuccess("Gruba başarıyla katıldınız!");
      setInviteCode("");
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.message || "Gruba katılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.ad.trim() || !groupForm.tema) {
      setError("Grup adı ve tema alanları zorunludur.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createStudyGroup(groupForm);
      setSuccess("Çalışma grubu başarıyla oluşturuldu!");
      setGroupForm({ ad: "", aciklama: "", tema: "" });
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.message || "Grup oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    const schoolId = userProfile?.schoolId || userProfile?.okul || "";
    await fetchGroups(user.uid, userRole, userProfile?.il, schoolId);
    setLoading(false);
  };

  // If a group is active, render group detail view
  if (activeGroup) {
    return <StudyGroupDetail onBack={() => setActiveGroup(null)} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header and Actions banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          background: "linear-gradient(135deg, var(--secondary) 0%, #1e2030 100%)",
          padding: "30px 24px",
          borderRadius: "var(--radius-lg)",
          color: "white",
          boxShadow: "0 10px 25px rgba(43, 45, 66, 0.15)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div 
          style={{ 
            position: "absolute", 
            right: "-20px", 
            bottom: "-20px", 
            opacity: 0.08, 
            color: "white",
            transform: "rotate(-15deg)"
          }}
        >
          <Users size={160} />
        </div>

        <div style={{ zIndex: 2 }}>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "white", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
            <Users style={{ color: "var(--primary-hover)" }} /> Çalışma Gruplarım
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", margin: "6px 0 0 0", maxWidth: "450px", lineHeight: 1.4 }}>
            Takımınızla ortak projeler geliştirin, Kanban görev tahtasını yönetin, duyuruları anlık paylaşarak XP kazanın.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", zIndex: 2 }}>
          <button
            onClick={handleRefresh}
            className="btn btn-outline"
            style={{ 
              padding: "10px 14px", 
              display: "flex", 
              alignItems: "center", 
              gap: "6px",
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              borderRadius: "50px"
            }}
            title="Grupları Yenile"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
          </button>

          {userRole !== "student" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary pulse-glow-btn"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                padding: "12px 24px",
                borderRadius: "50px",
                fontWeight: "700",
                boxShadow: "0 4px 15px rgba(217, 4, 41, 0.4)"
              }}
            >
              <Plus size={18} /> Grup Oluştur
            </button>
          )}
        </div>
      </div>

      {/* Join with Invite Code Form */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          padding: "24px",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--secondary)", margin: 0 }}>
          Davet Koduyla Bir Gruba Katıl
        </h3>
        <form onSubmit={handleJoinGroup} style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          <div style={{ flexGrow: 1, minWidth: "220px", position: "relative" }}>
            <input
              type="text"
              placeholder="6 Haneli Kodu Girin (Örn: XF3A9R)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="form-control"
              style={{ 
                textTransform: "uppercase", 
                fontWeight: "700", 
                letterSpacing: "2px", 
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: "2px solid var(--border-color)",
                textAlign: "center"
              }}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              padding: "12px 28px",
              borderRadius: "50px",
              fontWeight: "700"
            }}
            disabled={loading || !inviteCode.trim()}
          >
            <UserPlus size={18} /> Gruba Katıl
          </button>
        </form>

        {error && <div style={{ color: "var(--primary)", fontSize: "13.5px", marginTop: "4px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>⚠️ {error}</div>}
        {success && <div style={{ color: "var(--success)", fontSize: "13.5px", marginTop: "4px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>✅ {success}</div>}
      </div>

      {/* Groups List */}
      <div>
        {groups.length === 0 ? (
          <div 
            className="empty-state" 
            style={{ 
              padding: "80px 20px", 
              backgroundColor: "var(--bg-card)", 
              borderRadius: "var(--radius-lg)", 
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <Users size={56} style={{ color: "var(--text-muted)", marginBottom: "16px", opacity: 0.5 }} />
            <h4 style={{ color: "var(--secondary)", fontWeight: "800", fontSize: "18px" }}>Henüz Bir Gruba Üye Değilsiniz</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "8px", maxWidth: "420px", margin: "8px auto 0 auto", lineHeight: 1.5 }}>
              {userRole === "student"
                ? "Öğretmeninizden aldığınız 6 haneli davet koduyla mevcut bir çalışma grubuna dahil olabilirsiniz."
                : "Yeni bir çalışma grubu kurarak öğrencilerinizi ekleyebilir ya da öğretmeninizden aldığınız 6 haneli davet koduyla mevcut bir gruba dahil olabilirsiniz."}
            </p>
          </div>
        ) : (
          <div className="cards-grid">
            {groups.map((group) => (
              <StudyGroupCard
                key={group.id}
                group={group}
                onSelect={(id) => {
                  setSelectedDetailEvent(null); // Close event details if open
                  fetchGroupDetails(id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" style={{ background: "rgba(43, 45, 66, 0.4)", backdropFilter: "blur(5px)" }}>
          <div className="modal-content glass-panel" style={{ maxWidth: "520px", padding: "30px", border: "1px solid rgba(255, 255, 255, 0.5)", borderRadius: "var(--radius-lg)" }}>
            <div className="modal-header" style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--secondary)", margin: 0 }}>Yeni Çalışma Grubu Oluştur</h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="close-btn"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Grup Adı *</label>
                <input
                  type="text"
                  placeholder="Grup adını yazın..."
                  value={groupForm.ad}
                  onChange={(e) => setGroupForm({ ...groupForm, ad: e.target.value })}
                  className="form-control"
                  style={{ borderRadius: "var(--radius-md)" }}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Açıklama</label>
                <textarea
                  placeholder="Grubun hedefleri, etkinlik hazırlıkları..."
                  value={groupForm.aciklama}
                  onChange={(e) => setGroupForm({ ...groupForm, aciklama: e.target.value })}
                  className="form-control"
                  style={{ borderRadius: "var(--radius-md)" }}
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Grup Teması *</label>
                <select
                  value={groupForm.tema}
                  onChange={(e) => setGroupForm({ ...groupForm, tema: e.target.value })}
                  className="form-control"
                  style={{ borderRadius: "var(--radius-md)", fontWeight: "600" }}
                  required
                  disabled={loading}
                >
                  <option value="">Tema Seçin...</option>
                  <option value="yapay-zeka">Yapay Zekâ</option>
                  <option value="robotik">Robotik</option>
                  <option value="oyun-tasarimi">Oyun Tasarımı</option>
                  <option value="siber-guvenlik">Siber Güvenlik</option>
                  <option value="insansiz-hava-araclari">İnsansız Hava Araçları (İHA)</option>
                  <option value="stem">STEM</option>
                  <option value="vibe-coding">Vibe Coding</option>
                  <option value="mobil-uygulama">Mobil Uygulama Geliştirme</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>

              {error && <div style={{ color: "var(--primary)", fontSize: "13.5px", fontWeight: "700" }}>⚠️ {error}</div>}
              {success && <div style={{ color: "var(--success)", fontSize: "13.5px", fontWeight: "700" }}>✅ {success}</div>}

              <div style={{ display: "flex", justifyContent: "end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline"
                  style={{ borderRadius: "50px", padding: "10px 20px" }}
                  disabled={loading}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ borderRadius: "50px", padding: "10px 24px", fontWeight: "700" }}
                  disabled={loading}
                >
                  {loading ? "Oluşturuluyor..." : "Grup Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroupHub;
