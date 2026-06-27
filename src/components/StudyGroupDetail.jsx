import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import TaskBoard from "./TaskBoard";
import { ArrowLeft, Megaphone, CheckSquare, Users, Pin, Trash2, X, Plus, Mail, Award, Copy, Check } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";

const StudyGroupDetail = ({ onBack }) => {
  const {
    user,
    userRole,
    activeGroup,
    groupAnnouncements,
    createGroupAnnouncement,
    deleteGroupAnnouncement,
    togglePinAnnouncement,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState("tasks"); // tasks | announcements | members
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annForm, setAnnForm] = useState({ title: "", content: "" });
  const [annError, setAnnError] = useState("");
  const [loadingAnn, setLoadingAnn] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load detailed profiles for group members
  useEffect(() => {
    let active = true;
    const loadMembers = async () => {
      if (!activeGroup || !activeGroup.members) return;
      setLoadingMembers(true);
      try {
        if (!auth.config.apiKey.includes("DummyKey")) {
          const membersList = [];
          for (const uid of activeGroup.members) {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              membersList.push({ uid, ...userSnap.data() });
            } else {
              membersList.push({ uid, adSoyad: "Katılımcı", role: "student", xp: 0 });
            }
          }
          if (active) setGroupMembers(membersList);
        } else {
          const local = localStorage.getItem("mock_users");
          const allUsers = local ? JSON.parse(local) : [];
          const membersList = activeGroup.members.map((uid) => {
            const match = allUsers.find((u) => u.uid === uid);
            return match || { uid, adSoyad: "Katılımcı (Mock)", role: "student", xp: 0 };
          });
          if (active) setGroupMembers(membersList);
        }
      } catch (err) {
        console.error("Error loading group members:", err);
      } finally {
        if (active) setLoadingMembers(false);
      }
    };
    loadMembers();
    return () => {
      active = false;
    };
  }, [activeGroup]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.content.trim()) return;

    setLoadingAnn(true);
    setAnnError("");
    try {
      await createGroupAnnouncement(activeGroup.id, annForm);
      setAnnForm({ title: "", content: "" });
      setShowAnnModal(false);
    } catch (err) {
      setAnnError(err.message || "Duyuru yayınlanırken hata oluştu.");
    } finally {
      setLoadingAnn(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeGroup.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTeacherOrCreator = 
    userRole === "admin" || 
    userRole === "teacher" || 
    userRole === "principal" || 
    activeGroup?.creatorId === user?.uid;

  // Format theme names nicely
  const formatTheme = (themeStr) => {
    if (!themeStr) return "";
    return themeStr
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Group Detail Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          padding: "30px 24px",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", zIndex: 2 }}>
          <button
            onClick={onBack}
            className="btn btn-outline btn-sm"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px",
              padding: "8px 16px",
              borderColor: "rgba(255, 255, 255, 0.15)",
              color: "white",
              borderRadius: "50px",
              fontSize: "12.5px"
            }}
          >
            <ArrowLeft size={16} /> Geri Dön
          </button>
          
          <span 
            className="badge glow-badge-primary" 
            style={{ 
              textTransform: "capitalize",
              backgroundColor: "rgba(217, 4, 41, 0.15)",
              color: "#ff4d6d",
              padding: "4px 12px",
              borderRadius: "50px",
              fontSize: "12px",
              fontWeight: "700"
            }}
          >
            {formatTheme(activeGroup.tema)}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "16px", zIndex: 2 }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "white", margin: 0 }}>
              {activeGroup.ad}
            </h2>
            {activeGroup.aciklama && (
              <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", margin: "6px 0 0 0", maxWidth: "550px", lineHeight: 1.4 }}>
                {activeGroup.aciklama}
              </p>
            )}
          </div>

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              padding: "12px 18px",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "13.5px",
              color: "white",
              textAlign: "right",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "end" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Davet Kodu:</span>
              <button
                onClick={handleCopyCode}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "rgba(217, 4, 41, 0.2)",
                  border: "1px dashed rgba(217, 4, 41, 0.4)",
                  borderRadius: "var(--radius-sm)",
                  padding: "2px 8px",
                  cursor: "pointer",
                  color: "white"
                }}
                title="Kodu Kopyala"
              >
                <code style={{ fontSize: "14px", fontWeight: "800", color: "#ffa6c9", fontFamily: "monospace" }}>{activeGroup.inviteCode}</code>
                {copied ? <Check size={12} style={{ color: "#10b981" }} /> : <Copy size={12} style={{ color: "rgba(255,255,255,0.7)" }} />}
              </button>
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px", fontWeight: "normal" }}>
              Bu kodla takım üyelerini gruba dahil edebilirsiniz.
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Switcher */}
      <div className="list-tabs" style={{ marginBottom: "0", borderBottom: "1px solid var(--border-color)", paddingBottom: "1px" }}>
        <div
          className={`list-tab ${activeSubTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveSubTab("tasks")}
          style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}
        >
          <CheckSquare size={18} /> Görevler
        </div>
        <div
          className={`list-tab ${activeSubTab === "announcements" ? "active" : ""}`}
          onClick={() => setActiveSubTab("announcements")}
          style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}
        >
          <Megaphone size={18} /> Duyurular ({groupAnnouncements.length})
        </div>
        <div
          className={`list-tab ${activeSubTab === "members" ? "active" : ""}`}
          onClick={() => setActiveSubTab("members")}
          style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}
        >
          <Users size={18} /> Üyeler ({groupMembers.length})
        </div>
      </div>

      {/* Tab Contents */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          padding: "24px",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          minHeight: "350px",
        }}
      >
        {activeSubTab === "tasks" && (
          <TaskBoard groupMembers={groupMembers} />
        )}

        {activeSubTab === "announcements" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--secondary)", margin: 0 }}>
                  Grup Duyuruları
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                  Grup kurucusu veya danışman öğretmen tarafından paylaşılan duyurular.
                </p>
              </div>
              {isTeacherOrCreator && (
                <button
                  onClick={() => setShowAnnModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "6px", borderRadius: "50px", padding: "8px 16px", fontWeight: "700" }}
                >
                  <Plus size={16} /> Yeni Duyuru Paylaş
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {groupAnnouncements.length === 0 ? (
                <div className="empty-state" style={{ padding: "50px 20px" }}>
                  <Megaphone size={40} style={{ color: "var(--text-muted)", marginBottom: "14px", opacity: 0.5 }} />
                  <p style={{ color: "var(--text-muted)", fontSize: "13.5px" }}>Henüz bu grupta paylaşılmış bir duyuru bulunmuyor.</p>
                </div>
              ) : (
                groupAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    style={{
                      border: "1px solid var(--border-color)",
                      borderLeft: ann.isPinned ? "4px solid #eab308" : "4px solid var(--primary)",
                      borderRadius: "var(--radius-md)",
                      padding: "20px",
                      position: "relative",
                      backgroundColor: ann.isPinned ? "#fffdf5" : "#ffffff",
                      borderColor: ann.isPinned ? "#fde047" : "var(--border-color)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                    }}
                  >
                    {/* Announcement Top Bar */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--secondary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                          {ann.isPinned && <Pin size={15} fill="#eab308" style={{ color: "#eab308" }} />}
                          {ann.title}
                        </h4>
                        <span style={{ fontSize: "11.5px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                          Yazar: <strong style={{ color: "var(--secondary)" }}>{ann.authorName}</strong> • {new Date(ann.olusturmaTarihi).toLocaleString("tr-TR")}
                        </span>
                      </div>

                      {/* Moderator / Writer controls */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        {isTeacherOrCreator && (
                          <button
                            onClick={() => togglePinAnnouncement(ann.id, !ann.isPinned, activeGroup.id)}
                            className="btn btn-outline btn-sm"
                            style={{
                              padding: "4px 10px",
                              fontSize: "11px",
                              color: ann.isPinned ? "#d97706" : "var(--text-muted)",
                              backgroundColor: ann.isPinned ? "#fef3c7" : "transparent",
                              borderColor: ann.isPinned ? "#fde047" : "var(--border-color)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              borderRadius: "50px",
                              fontWeight: "700"
                            }}
                            title={ann.isPinned ? "Duyuruyu Sabitlemeyi Kaldır" : "Duyuruyu Sabitle"}
                          >
                            <Pin size={12} fill={ann.isPinned ? "#d97706" : "none"} /> {ann.isPinned ? "Sabitlenmiş" : "Sabitle"}
                          </button>
                        )}
                        {(isTeacherOrCreator || ann.authorId === user?.uid) && (
                          <button
                            onClick={() => {
                              if (window.confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) {
                                deleteGroupAnnouncement(ann.id, activeGroup.id);
                              }
                            }}
                            style={{
                              background: "rgba(217, 4, 41, 0.05)",
                              border: "none",
                              color: "var(--primary)",
                              cursor: "pointer",
                              padding: "6px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                            title="Duyuruyu Sil"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Announcement Content */}
                    <p style={{ fontSize: "13.5px", color: "#374151", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {ann.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSubTab === "members" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--secondary)", margin: 0 }}>
                Grup Üyeleri Listesi
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                Gruptaki aktif danışman öğretmenler, öğrenciler ve temsilciler.
              </p>
            </div>

            {loadingMembers ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Üye listesi yükleniyor...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {groupMembers.map((member) => (
                  <div
                    key={member.uid}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.01)"
                    }}
                  >
                    {/* User basic details */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: member.role === "teacher" || member.role === "principal" 
                            ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" 
                            : "linear-gradient(135deg, #ef233c 0%, #d90429 100%)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "15px",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
                        }}
                      >
                        {member.adSoyad ? member.adSoyad.charAt(0).toUpperCase() : "?"}
                      </div>

                      <div>
                        <div style={{ fontSize: "14.5px", fontWeight: "800", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                          {member.adSoyad}
                          {member.uid === activeGroup.creatorId && (
                            <span className="badge glow-badge-primary" style={{ backgroundColor: "#eff6ff", color: "#2563eb", fontSize: "10px", padding: "2px 8px", fontWeight: "800", borderRadius: "50px" }}>Kurucu</span>
                          )}
                          {member.studentProfile?.isStudentRep && (
                            <span className="badge glow-badge-warning" style={{ backgroundColor: "#fef3c7", color: "#d97706", fontSize: "10px", padding: "2px 8px", fontWeight: "800", borderRadius: "50px" }}>Temsilci</span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {member.role === "teacher" || member.role === "principal" ? "Danışman Öğretmen" : "Öğrenci"}
                          {member.studentProfile?.sinif && ` • ${member.studentProfile.sinif}`}
                          {member.il && ` • ${member.il}`}
                        </div>
                      </div>
                    </div>

                    {/* Member stats / contact */}
                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                      {/* XP Showcase for students */}
                      {(member.role === "student" || member.xp !== undefined) && (
                        <span 
                          style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: "4px", 
                            fontSize: "13px", 
                            fontWeight: "800", 
                            color: "#d97706",
                            backgroundColor: "#fef3c7",
                            padding: "3px 10px",
                            borderRadius: "50px"
                          }}
                        >
                          <Award size={14} fill="#d97706" />
                          <span>{member.xp || 0} XP</span>
                        </span>
                      )}

                      <div style={{ display: "flex", gap: "8px" }}>
                        {member.eposta && (
                          <a
                            href={`mailto:${member.eposta}`}
                            className="btn btn-outline"
                            style={{ 
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%", 
                              display: "inline-flex", 
                              alignItems: "center", 
                              justifyContent: "center",
                              padding: 0
                            }}
                            title="E-posta Gönder"
                          >
                            <Mail size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Announcement Modal */}
      {showAnnModal && (
        <div className="modal-backdrop" style={{ background: "rgba(43, 45, 66, 0.4)", backdropFilter: "blur(5px)" }}>
          <div className="modal-content glass-panel" style={{ maxWidth: "520px", padding: "30px", border: "1px solid rgba(255, 255, 255, 0.5)", borderRadius: "var(--radius-lg)" }}>
            <div className="modal-header" style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "19px", fontWeight: "800", color: "var(--secondary)", margin: 0 }}>Yeni Duyuru Paylaş</h3>
              <button 
                onClick={() => setShowAnnModal(false)} 
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

            <form onSubmit={handleCreateAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Duyuru Başlığı *</label>
                <input
                  type="text"
                  placeholder="Başlık girin..."
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="form-control"
                  style={{ borderRadius: "var(--radius-md)" }}
                  required
                  disabled={loadingAnn}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Duyuru İçeriği *</label>
                <textarea
                  placeholder="Duyurulacak önemli bilgiyi buraya yazın..."
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  className="form-control"
                  style={{ borderRadius: "var(--radius-md)" }}
                  rows="4"
                  required
                  disabled={loadingAnn}
                />
              </div>

              {annError && <div style={{ color: "var(--primary)", fontSize: "13.5px", fontWeight: "700" }}>⚠️ {annError}</div>}

              <div style={{ display: "flex", justifyContent: "end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="btn btn-outline"
                  style={{ borderRadius: "50px", padding: "10px 20px" }}
                  disabled={loadingAnn}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ borderRadius: "50px", padding: "10px 24px", fontWeight: "700" }}
                  disabled={loadingAnn}
                >
                  {loadingAnn ? "Yayınlanıyor..." : "Yayınla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroupDetail;
