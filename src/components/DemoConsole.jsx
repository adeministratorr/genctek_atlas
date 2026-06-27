import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  X,
  Shield,
  User,
  GraduationCap,
  Award,
  Zap,
  RefreshCw,
  Plus,
} from "lucide-react";

const DemoConsole = ({ isOpen, onClose }) => {
  const {
    user,
    userRole,
    userProfile,
    isUsingMockData,
    loginModerator,
    setUser,
    setUserRole,
    setUserProfile,
    setTeacherProfile,
    fetchStudents,
    fetchData,
    fetchApplications,
    fetchGroups,
    createNotification,
    awardXpToUser,
    students,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState("Kaşif");
  const [selectedStudentUid, setSelectedStudentUid] = useState("");

  if (!isOpen) return null;

  let availableStudents = [];
  if (isUsingMockData) {
    const localStudents = localStorage.getItem("mock_students");
    if (localStudents) {
      availableStudents = JSON.parse(localStudents);
    }
  } else {
    availableStudents = students || [];
  }

  // Handle Quick Login/Switch Role
  const handleQuickLogin = async (email, password, role, profile = null) => {
    setLoading(true);
    try {
      if (isUsingMockData || !password) {
        // Direct mock login bypass
        const targetProfile = profile || {
          uid: `mock-${role}-uid`,
          adSoyad: `Demo ${role.toUpperCase()}`,
          eposta: email,
          role: role,
          il: "Konya",
          ilce: "SELÇUKLU",
          okul: "Selçuklu Mesleki ve Teknik Anadolu Lisesi",
          xp: 85,
          onaylandi: true,
          badges: ["Kaşif"],
        };

        setUser({ email, uid: targetProfile.uid });
        setUserRole(role);
        setUserProfile(targetProfile);

        if (role === "teacher" || role === "principal") {
          setTeacherProfile(targetProfile);
          fetchStudents(targetProfile.uid);
          fetchData(false);
          fetchApplications(false, targetProfile.uid);
          fetchGroups(
            targetProfile.uid,
            role,
            targetProfile.il,
            targetProfile.okul,
          );
        } else if (role === "coordinator" || role === "commission") {
          setTeacherProfile(targetProfile);
          fetchData(true);
          fetchApplications(
            false,
            targetProfile.uid,
            role === "coordinator",
            targetProfile.il,
            role === "commission",
          );
          fetchGroups(
            targetProfile.uid,
            role,
            targetProfile.il,
            targetProfile.okul,
          );
        } else if (role === "student") {
          fetchData(false);
          fetchApplications(
            false,
            targetProfile.studentProfile?.teacherId || null,
            false,
          );
          fetchGroups(
            targetProfile.uid,
            role,
            targetProfile.il,
            targetProfile.schoolId || targetProfile.okul,
          );
        } else if (role === "admin") {
          fetchData(true);
          fetchApplications(true);
          fetchGroups(targetProfile.uid, role);
        }

        // Trigger local notification
        createNotification(
          targetProfile.uid,
          `⚡ Demo: '${targetProfile.adSoyad}' (${role.toUpperCase()}) olarak hızlı giriş yapıldı.`,
          "info",
        );
      } else {
        // Real Firebase Auth login
        await loginModerator(email, password);
      }
    } catch (err) {
      console.error("Quick Login Error:", err);
      alert("Quick Login Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simulate Awarding XP
  const handleAwardXp = (amount) => {
    if (!user) return;
    const targetUid = userRole === "student" ? user.uid : selectedStudentUid;
    if (!targetUid) {
      alert("Lütfen XP verilecek bir öğrenci seçin.");
      return;
    }
    awardXpToUser(targetUid, amount);
  };

  // Simulate Awarding Badge
  const handleAwardBadge = () => {
    const targetUid = userRole === "student" ? user.uid : selectedStudentUid;
    if (!targetUid) {
      alert("Lütfen rozet verilecek bir öğrenci seçin.");
      return;
    }

    if (targetUid === user.uid) {
      if (!userProfile) return;
      const currentBadges = userProfile.badges || [];
      if (currentBadges.includes(selectedBadge)) {
        alert(`Kullanıcı zaten '${selectedBadge}' rozetine sahip.`);
        return;
      }

      const updatedProfile = {
        ...userProfile,
        badges: [...currentBadges, selectedBadge],
      };
      setUserProfile(updatedProfile);

      if (isUsingMockData) {
        const localUsers = localStorage.getItem("mock_users");
        if (localUsers) {
          const parsed = JSON.parse(localUsers);
          const idx = parsed.findIndex((u) => u.uid === targetUid);
          if (idx !== -1) {
            parsed[idx] = updatedProfile;
            localStorage.setItem("mock_users", JSON.stringify(parsed));
          }
        }
      }
    } else {
      if (isUsingMockData) {
        const localStudents = localStorage.getItem("mock_students");
        if (localStudents) {
          const parsed = JSON.parse(localStudents);
          const idx = parsed.findIndex(
            (s) => (s.uid || s.studentUid || s.id) === targetUid,
          );
          if (idx !== -1) {
            const currentBadges = parsed[idx].badges || [];
            if (currentBadges.includes(selectedBadge)) {
              alert(`Öğrenci zaten '${selectedBadge}' rozetine sahip.`);
              return;
            }
            parsed[idx].badges = [...currentBadges, selectedBadge];
            localStorage.setItem("mock_students", JSON.stringify(parsed));
            alert(
              `'${parsed[idx].adSoyad}' öğrencisine '${selectedBadge}' rozeti verildi.`,
            );
          }
        }
      }
    }

    createNotification(
      targetUid,
      `🎉 Tebrikler! '${selectedBadge}' rozetini kazandınız.`,
      "success",
    );
  };

  // Reset Mock Data
  const handleResetData = () => {
    if (userRole !== "admin") {
      alert(
        "Bu işlemi gerçekleştirmek için yönetici (admin) yetkiniz olmalıdır.",
      );
      return;
    }
    if (
      window.confirm(
        "Tüm yerel verileri sıfırlayıp fabrika ayarlarına dönmek istiyor musunuz?",
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div
      className="demo-console-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        className="demo-console-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "380px",
          height: "100%",
          backgroundColor: "var(--bg-card, #fff)",
          borderLeft: "1px solid var(--border-color, #e2e8f0)",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={20} style={{ color: "var(--primary)" }} />
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "800",
                color: "var(--secondary)",
              }}
            >
              ⚡ Jüri Demo Paneli
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flexGrow: 1, overflowY: "auto", paddingRight: "4px" }}>
          {/* Quick Access Roles */}
          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                margin: "0 0 12px 0",
                fontSize: "13px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                fontWeight: "700",
              }}
            >
              👥 Hızlı Rol Geçişi
            </h4>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {/* Admin */}
              <button
                className="card-btn secondary"
                disabled={loading}
                onClick={() =>
                  handleQuickLogin("admin@genctek.org", "demo123", "admin")
                }
                style={{
                  justifyContent: "flex-start",
                  gap: "12px",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                }}
              >
                <Shield size={16} style={{ color: "var(--primary)" }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "700", fontSize: "13px" }}>
                    Sistem Admini
                  </span>
                  <span
                    style={{ fontSize: "10px", color: "var(--text-muted)" }}
                  >
                    admin@genctek.org
                  </span>
                </div>
              </button>

              {/* Coordinator */}
              <button
                className="card-btn secondary"
                disabled={loading}
                onClick={() =>
                  handleQuickLogin(
                    "koordinator@genctek.org",
                    "demo123",
                    "coordinator",
                  )
                }
                style={{
                  justifyContent: "flex-start",
                  gap: "12px",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                }}
              >
                <Zap size={16} style={{ color: "#f59e0b" }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "700", fontSize: "13px" }}>
                    İl Koordinatörü
                  </span>
                  <span
                    style={{ fontSize: "10px", color: "var(--text-muted)" }}
                  >
                    koordinator@genctek.org
                  </span>
                </div>
              </button>

              {/* School Principal */}
              <button
                className="card-btn secondary"
                disabled={loading}
                onClick={() =>
                  handleQuickLogin("mudur@genctek.org", "demo123", "principal")
                }
                style={{
                  justifyContent: "flex-start",
                  gap: "12px",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                }}
              >
                <GraduationCap size={16} style={{ color: "#1d6fe8" }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "700", fontSize: "13px" }}>
                    Okul Müdürü
                  </span>
                  <span
                    style={{ fontSize: "10px", color: "var(--text-muted)" }}
                  >
                    mudur@genctek.org
                  </span>
                </div>
              </button>

              {/* Advisor Teacher */}
              <button
                className="card-btn secondary"
                disabled={loading}
                onClick={() =>
                  handleQuickLogin("ogretmen@genctek.org", "demo123", "teacher")
                }
                style={{
                  justifyContent: "flex-start",
                  gap: "12px",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                }}
              >
                <User size={16} style={{ color: "#10b981" }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "700", fontSize: "13px" }}>
                    Danışman Öğretmen
                  </span>
                  <span
                    style={{ fontSize: "10px", color: "var(--text-muted)" }}
                  >
                    ogretmen@genctek.org
                  </span>
                </div>
              </button>

              {/* Student Representative */}
              <button
                className="card-btn secondary"
                disabled={loading}
                onClick={() =>
                  handleQuickLogin(
                    "temsilci@genctek.org",
                    "demo123",
                    "student",
                    {
                      uid: "mock-student-rep-uid",
                      adSoyad: "Mert Yılmaz",
                      eposta: "temsilci@genctek.org",
                      role: "student",
                      il: "Konya",
                      ilce: "SELÇUKLU",
                      okul: "Selçuklu Mesleki ve Teknik Anadolu Lisesi",
                      xp: 120,
                      onaylandi: true,
                      badges: ["Kaşif"],
                      studentProfile: {
                        sinif: "11. Sınıf",
                        isStudentRep: true,
                        teacherId: "mock-teacher-uid",
                      },
                    },
                  )
                }
                style={{
                  justifyContent: "flex-start",
                  gap: "12px",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                }}
              >
                <Award size={16} style={{ color: "var(--warning)" }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "700", fontSize: "13px" }}>
                    Öğrenci Temsilcisi
                  </span>
                  <span
                    style={{ fontSize: "10px", color: "var(--text-muted)" }}
                  >
                    temsilci@genctek.org
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Action Simulators */}
          {user && (
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "rgba(217, 4, 41, 0.03)",
                borderRadius: "12px",
                border: "1px dashed var(--primary-light)",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "13px",
                  color: "var(--primary)",
                  textTransform: "uppercase",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Zap size={14} /> Aktif Simülasyon ({userRole?.toUpperCase()})
              </h4>

              {userRole !== "student" && (
                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      fontWeight: "600",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    İşlem Yapılacak Öğrenci
                  </span>
                  <select
                    value={selectedStudentUid}
                    onChange={(e) => setSelectedStudentUid(e.target.value)}
                    className="form-control"
                    style={{
                      width: "100%",
                      padding: "4px 8px",
                      fontSize: "12px",
                      height: "32px",
                      borderRadius: "var(--radius-sm, 4px)",
                    }}
                  >
                    <option value="">-- Öğrenci Seçin --</option>
                    {availableStudents.map((student) => (
                      <option
                        key={student.uid || student.studentUid || student.id}
                        value={student.uid || student.studentUid || student.id}
                      >
                        {student.adSoyad || student.ad} (
                        {student.okul || student.schoolId || "GençTek"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* XP Sim */}
              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  XP Kazanma Simülasyonu
                </span>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={() => handleAwardXp(25)}
                    className="card-btn secondary"
                    style={{ fontSize: "12px", padding: "6px" }}
                  >
                    <Plus size={12} /> 25 XP
                  </button>
                  <button
                    onClick={() => handleAwardXp(100)}
                    className="card-btn secondary"
                    style={{ fontSize: "12px", padding: "6px" }}
                  >
                    <Plus size={12} /> 100 XP
                  </button>
                </div>
              </div>

              {/* Badge Sim */}
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Rozet Kazanma Simülasyonu
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select
                    value={selectedBadge}
                    onChange={(e) => setSelectedBadge(e.target.value)}
                    className="form-control"
                    style={{
                      flexGrow: 1,
                      padding: "4px 8px",
                      fontSize: "12px",
                      height: "32px",
                    }}
                  >
                    <option value="Kaşif">Kaşif</option>
                    <option value="Aktif Katılımcı">Aktif Katılımcı</option>
                    <option value="Ekip Oyuncusu">Ekip Oyuncusu</option>
                    <option value="Görev Canavarı">Görev Canavarı</option>
                    <option value="Girişimci">Girişimci</option>
                    <option value="İletişimci">İletişimci</option>
                  </select>
                  <button
                    onClick={handleAwardBadge}
                    className="card-btn primary"
                    style={{
                      fontSize: "12px",
                      padding: "0 12px",
                      height: "32px",
                    }}
                  >
                    Rozeti Ver
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Seeding & Reset */}
          {userRole === "admin" && (
            <div
              style={{
                marginTop: "30px",
                borderTop: "1px solid var(--border-color)",
                paddingTop: "20px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  fontWeight: "700",
                }}
              >
                ⚙️ Veritabanı Yönetimi
              </h4>

              <button
                onClick={handleResetData}
                className="card-btn secondary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  gap: "8px",
                  border: "1px solid #fee2e2",
                  color: "var(--primary)",
                  backgroundColor: "#fef2f2",
                }}
              >
                <RefreshCw size={14} /> Tüm Verileri Sıfırla
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoConsole;
