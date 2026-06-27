import { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, Trophy, Users, Calendar, Award, ExternalLink } from "lucide-react";

const SchoolProfileModal = () => {
  const {
    selectedSchool,
    setSelectedSchool,
    setModalType,
    schoolStudents,
    schoolGroups,
    schoolDataLoading,
    allEventsRaw,
  } = useApp();

  const [activeTab, setActiveTab] = useState("leaderboard");

  // Handle closing modal
  const handleClose = () => {
    setSelectedSchool("");
    setModalType(null);
  };

  // Filter approved events related to this school
  const schoolEvents = allEventsRaw.filter(
    (e) => e.okul?.ad === selectedSchool && e.onaylandi
  );

  // Compute school stats
  const totalStudents = schoolStudents.length;
  const totalGroups = schoolGroups.length;
  const totalEvents = schoolEvents.length;
  const totalXp = schoolStudents.reduce((acc, s) => acc + (s.xp || 0), 0);

  // Get school website from first found school data or event info
  const website = schoolEvents[0]?.okul?.website || "";

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content school-profile-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "700px", width: "95%", padding: "24px" }}
      >
        <div className="modal-header" style={{ marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--secondary)", margin: 0 }}>
              🏫 {selectedSchool}
            </h3>
            {schoolStudents[0] && (
              <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
                📍 {schoolStudents[0].il}, {schoolStudents[0].ilce}
              </span>
            )}
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          {/* Stats Bar */}
          <div className="school-stats-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "16px",
            marginBottom: "24px"
          }}>
            <div className="stat-card" style={{
              background: "linear-gradient(135deg, rgba(217, 4, 41, 0.05) 0%, rgba(217, 4, 41, 0.01) 100%)",
              border: "1px solid rgba(217, 4, 41, 0.1)",
              padding: "16px",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <Trophy size={22} style={{ color: "var(--warning)", margin: "0 auto 8px" }} />
              <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--secondary)" }}>{totalXp}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>Toplam XP</div>
            </div>

            <div className="stat-card" style={{
              background: "linear-gradient(135deg, rgba(29, 111, 232, 0.05) 0%, rgba(29, 111, 232, 0.01) 100%)",
              border: "1px solid rgba(29, 111, 232, 0.1)",
              padding: "16px",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <Users size={22} style={{ color: "#1d6fe8", margin: "0 auto 8px" }} />
              <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--secondary)" }}>{totalStudents}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>Öğrenciler</div>
            </div>

            <div className="stat-card" style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.01) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.1)",
              padding: "16px",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <Award size={22} style={{ color: "#10b981", margin: "0 auto 8px" }} />
              <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--secondary)" }}>{totalGroups}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>Çalışma Grupları</div>
            </div>

            <div className="stat-card" style={{
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.01) 100%)",
              border: "1px solid rgba(245, 158, 11, 0.1)",
              padding: "16px",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <Calendar size={22} style={{ color: "#f59e0b", margin: "0 auto 8px" }} />
              <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--secondary)" }}>{totalEvents}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>Etkinlikler</div>
            </div>
          </div>

          {website && (
            <div style={{ marginBottom: "20px", textAlign: "right" }}>
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: "#1d6fe8",
                  fontWeight: "600",
                  textDecoration: "none"
                }}
              >
                Okul Web Sitesini Ziyaret Et <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Tab Selection */}
          <div className="list-tabs" style={{ marginBottom: "20px" }}>
            <div
              className={`list-tab ${activeTab === "leaderboard" ? "active" : ""}`}
              onClick={() => setActiveTab("leaderboard")}
              style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            >
              <Trophy size={16} /> Liderlik Tablosu
            </div>
            <div
              className={`list-tab ${activeTab === "groups" ? "active" : ""}`}
              onClick={() => setActiveTab("groups")}
              style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            >
              <Users size={16} /> Çalışma Grupları ({totalGroups})
            </div>
            <div
              className={`list-tab ${activeTab === "events" ? "active" : ""}`}
              onClick={() => setActiveTab("events")}
              style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            >
              <Calendar size={16} /> Etkinlikler ({totalEvents})
            </div>
          </div>

          {/* Loading and Content */}
          {schoolDataLoading ? (
            <div className="empty-state" style={{ padding: "40px" }}>Veriler yükleniyor...</div>
          ) : (
            <div className="tab-content" style={{ minHeight: "200px" }}>
              
              {/* LEADERBOARD TAB */}
              {activeTab === "leaderboard" && (
                schoolStudents.length === 0 ? (
                  <div className="empty-state">Bu okula kayıtlı öğrenci bulunamadı.</div>
                ) : (
                  <div className="leaderboard-table-container" style={{
                    maxHeight: "350px",
                    overflowY: "auto",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)"
                  }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ backgroundColor: "var(--bg-body)", borderBottom: "2px solid var(--border-color)" }}>
                          <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>Sıra</th>
                          <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>Öğrenci</th>
                          <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>Sınıf</th>
                          <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textAlign: "right" }}>XP Puanı</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schoolStudents.map((student, index) => {
                          const rank = index + 1;
                          let medal = "";
                          if (rank === 1) medal = "🥇";
                          else if (rank === 2) medal = "🥈";
                          else if (rank === 3) medal = "🥉";

                          const level = Math.floor((student.xp || 0) / 100) + 1;

                          return (
                            <tr key={student.id} style={{ borderBottom: "1px solid var(--border-color)" }} className="leaderboard-row">
                              <td style={{ padding: "12px 16px", fontWeight: "700", color: rank <= 3 ? "var(--secondary)" : "var(--text-muted)" }}>
                                {medal || rank}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontWeight: "700", color: "var(--secondary)" }}>
                                    {student.adSoyad}
                                    {student.studentProfile?.isStudentRep && (
                                      <span style={{
                                        marginLeft: "8px",
                                        fontSize: "10px",
                                        backgroundColor: "rgba(217, 4, 41, 0.08)",
                                        color: "var(--primary)",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontWeight: "800"
                                      }}>TEMSİLCİ</span>
                                    )}
                                  </span>
                                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>Seviye {level}</span>
                                </div>
                              </td>
                              <td style={{ padding: "12px 16px", fontWeight: "600", color: "var(--text-muted)" }}>
                                {student.studentProfile?.sinif || "Belirtilmemiş"}
                              </td>
                              <td style={{ padding: "12px 16px", fontWeight: "800", color: "var(--primary)", textAlign: "right" }}>
                                {student.xp || 0} XP
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* STUDY GROUPS TAB */}
              {activeTab === "groups" && (
                schoolGroups.length === 0 ? (
                  <div className="empty-state">Bu okula ait aktif çalışma grubu bulunmuyor.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "350px", overflowY: "auto", paddingRight: "4px" }}>
                    {schoolGroups.map((group) => (
                      <div key={group.id} style={{
                        padding: "16px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--bg-card)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div>
                          <h4 style={{ margin: 0, fontWeight: "700", color: "var(--secondary)" }}>
                            👥 {group.ad}
                          </h4>
                          <span style={{
                            display: "inline-block",
                            marginTop: "6px",
                            fontSize: "11px",
                            backgroundColor: "var(--primary-light)",
                            color: "var(--primary)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: "700"
                          }}>
                            {group.temaAd || group.tema || "Genel"}
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
                          👥 {group.members?.length || 0} Üye
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* EVENTS TAB */}
              {activeTab === "events" && (
                schoolEvents.length === 0 ? (
                  <div className="empty-state">Bu okula ait gerçekleştirilmiş etkinlik bulunmuyor.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "350px", overflowY: "auto", paddingRight: "4px" }}>
                    {schoolEvents.map((event) => {
                      const dateStr = event.tarih
                        ? new Date(event.tarih).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })
                        : "";

                      return (
                        <div key={event.id} style={{
                          padding: "16px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-color)",
                          backgroundColor: "var(--bg-card)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div style={{ flex: 1, paddingRight: "16px" }}>
                            <h4 style={{ margin: 0, fontWeight: "700", color: "var(--secondary)", fontSize: "14px" }}>
                              🗓 {event.ad || event.baslik}
                            </h4>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>
                                {dateStr}
                              </span>
                              <span style={{
                                fontSize: "10px",
                                backgroundColor: "var(--bg-body)",
                                border: "1px solid var(--border-color)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                color: "var(--text-muted)",
                                fontWeight: "700"
                              }}>
                                {event.format || "Etkinlik"}
                              </span>
                            </div>
                          </div>
                          {event.katilimciSayisi && (
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "700", whiteSpace: "nowrap" }}>
                              👥 {event.katilimciSayisi} Katılımcı
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolProfileModal;
