import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { X, GraduationCap, Users, Calendar, Award, Send, Check, Plus } from "lucide-react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";

const PrincipalDashboard = () => {
  const {
    user,
    userProfile,
    applications,
    allEventsRaw,
    logoutModerator,
    setModalType,
    registerStudent,
    toggleStudentRepStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState("teachers"); // 'teachers' | 'students' | 'rep' | 'announcements' | 'applications'
  const [teachersList, setTeachersList] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [schoolStudentsList, setSchoolStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Student Add Form states
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState({
    adSoyad: "",
    eposta: "",
    sifre: "",
    veliTelefon: "",
    sinifSeviyesi: "",
    teacherId: ""
  });
  const [studentFormError, setStudentFormError] = useState("");
  const [studentFormSuccess, setStudentFormSuccess] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Fetch school students
  const fetchSchoolStudents = useCallback(async () => {
    if (!userProfile?.schoolId || !userProfile?.il) return;
    await Promise.resolve();
    setLoadingStudents(true);
    try {
      if (!auth.config.apiKey.includes("DummyKey")) {
        const q = query(
          collection(db, "users"),
          where("schoolId", "==", userProfile.schoolId),
          where("il", "==", userProfile.il),
          where("role", "==", "student")
        );
        const snap = await getDocs(q);
        const list = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setSchoolStudentsList(list);
      } else {
        // Mock data
        const localUsers = localStorage.getItem("mock_users");
        if (localUsers) {
          const list = JSON.parse(localUsers).filter(
            (u) =>
              u.schoolId === userProfile.schoolId &&
              u.il === userProfile.il &&
              u.role === "student"
          );
          setSchoolStudentsList(list);
        }
      }
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoadingStudents(false);
    }
  }, [userProfile]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSchoolStudents();
  }, [fetchSchoolStudents, activeTab]);

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setStudentFormError("");
    setStudentFormSuccess("");

    const { adSoyad, eposta, sifre, veliTelefon, sinifSeviyesi, teacherId } = studentForm;

    if (!adSoyad.trim() || !eposta.trim() || !sifre || !sinifSeviyesi || !teacherId) {
      setStudentFormError("Lütfen gerekli tüm alanları doldurun.");
      return;
    }

    if (sifre.length < 6) {
      setStudentFormError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setIsAddingStudent(true);
    try {
      await registerStudent(eposta, sifre, {
        adSoyad,
        veliTelefon,
        sinifSeviyesi,
        teacherId,
        schoolId: userProfile.schoolId,
        il: userProfile.il,
        ilce: userProfile.ilce
      });

      setStudentFormSuccess("Öğrenci başarıyla eklendi (Onay bekliyor).");
      setStudentForm({
        adSoyad: "",
        eposta: "",
        sifre: "",
        veliTelefon: "",
        sinifSeviyesi: "",
        teacherId: ""
      });
      setShowAddStudentForm(false);
      fetchSchoolStudents();
    } catch (err) {
      console.error(err);
      setStudentFormError("Öğrenci eklenirken hata oluştu: " + err.message);
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleToggleRep = async (studentUid, currentStatus) => {
    try {
      await toggleStudentRepStatus(studentUid, !currentStatus);
      fetchSchoolStudents();
    } catch (err) {
      console.error("Error toggling rep status:", err);
    }
  };

  // Announcement state
  const [announcementForm, setAnnouncementForm] = useState({ baslik: "", icerik: "" });
  const [annSuccess, setAnnSuccess] = useState("");
  const [annError, setAnnError] = useState("");
  const [isSendingAnn, setIsSendingAnn] = useState(false);

  // Load school teachers
  useEffect(() => {
    const fetchSchoolTeachers = async () => {
      if (!userProfile?.schoolId || !userProfile?.il) return;
      setLoadingTeachers(true);
      try {
        if (!auth.config.apiKey.includes("DummyKey")) {
          const q = query(
            collection(db, "users"),
            where("schoolId", "==", userProfile.schoolId),
            where("il", "==", userProfile.il),
            where("role", "==", "teacher")
          );
          const snap = await getDocs(q);
          const list = [];
          snap.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setTeachersList(list);
        } else {
          // Mock data
          const localUsers = localStorage.getItem("mock_users");
          if (localUsers) {
            const list = JSON.parse(localUsers).filter(
              (u) =>
                u.schoolId === userProfile.schoolId &&
                u.il === userProfile.il &&
                u.role === "teacher"
            );
            setTeachersList(list);
          }
        }
      } catch (err) {
        console.error("Error loading teachers:", err);
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchSchoolTeachers();
  }, [userProfile]);

  // Filter applications belonging to this school
  const schoolApps = applications.filter(
    (app) =>
      app.ogretmenBilgi?.okul === userProfile?.schoolId &&
      app.ogretmenBilgi?.il === userProfile?.il
  );

  const handleAnnounceSubmit = async (e) => {
    e.preventDefault();
    setAnnSuccess("");
    setAnnError("");
    if (!announcementForm.baslik.trim() || !announcementForm.icerik.trim()) {
      setAnnError("Lütfen tüm alanları doldurun.");
      return;
    }

    setIsSendingAnn(true);
    try {
      const newAnn = {
        baslik: announcementForm.baslik.trim(),
        icerik: announcementForm.icerik.trim(),
        scope: "school",
        schoolId: userProfile.schoolId,
        il: userProfile.il,
        authorId: user.uid,
        authorName: userProfile.adSoyad,
        olusturmaTarihi: new Date().toISOString(),
      };

      if (!auth.config.apiKey.includes("DummyKey")) {
        await addDoc(collection(db, "announcements"), newAnn);
      } else {
        const localAnn = localStorage.getItem("mock_announcements");
        const currentList = localAnn ? JSON.parse(localAnn) : [];
        localStorage.setItem("mock_announcements", JSON.stringify([newAnn, ...currentList]));
      }

      setAnnSuccess("Duyurunuz başarıyla yayınlandı!");
      setAnnouncementForm({ baslik: "", icerik: "" });
    } catch (err) {
      console.error(err);
      setAnnError("Duyuru yayınlanırken hata oluştu.");
    } finally {
      setIsSendingAnn(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setModalType(null)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "900px", width: "95%", height: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <GraduationCap size={24} style={{ color: "var(--primary)" }} />
            <h3>Okul Müdürü Paneli</h3>
          </div>
          <button className="close-btn" onClick={() => setModalType(null)}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          className="modal-body"
          style={{
            backgroundColor: "var(--bg-main)",
            flexGrow: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            padding: "24px",
          }}
        >
          {/* Principal Info Bar */}
          {userProfile && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div>
                <p className="form-hint">Müdür / Yönetici</p>
                <h4 style={{ color: "var(--secondary)", marginTop: "4px" }}>{userProfile.adSoyad}</h4>
                <p className="form-hint" style={{ fontSize: "12px" }}>{userProfile.eposta}</p>
              </div>
              <div>
                <p className="form-hint">Okul Bilgisi</p>
                <h5 style={{ color: "var(--primary)", marginTop: "4px", fontWeight: "700" }}>{userProfile.schoolId}</h5>
                <p className="form-hint" style={{ fontSize: "12px" }}>{userProfile.ilce} / {userProfile.il}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <button
                  className="card-btn secondary"
                  onClick={() => {
                    logoutModerator();
                    setModalType(null);
                  }}
                >
                  Oturumu Kapat
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div
            className="list-tabs"
            style={{
              flexShrink: 0,
              borderBottom: "2px solid var(--border-color)",
              margin: "0",
              padding: "0",
              gap: "8px",
            }}
          >
            <div
              className={`list-tab ${activeTab === "teachers" ? "active" : ""}`}
              onClick={() => setActiveTab("teachers")}
              style={{ paddingBottom: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Users size={18} /> Okul Öğretmenleri ({teachersList.length})
            </div>
            <div
              className={`list-tab ${activeTab === "students" ? "active" : ""}`}
              onClick={() => setActiveTab("students")}
              style={{ paddingBottom: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <GraduationCap size={18} /> Okul Öğrencileri ({schoolStudentsList.length})
            </div>
            <div
              className={`list-tab ${activeTab === "rep" ? "active" : ""}`}
              onClick={() => setActiveTab("rep")}
              style={{ paddingBottom: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Award size={18} /> Öğrenci Temsilcisi
            </div>
            <div
              className={`list-tab ${activeTab === "announcements" ? "active" : ""}`}
              onClick={() => setActiveTab("announcements")}
              style={{ paddingBottom: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Send size={18} /> Okul Duyurusu Gönder
            </div>
            <div
              className={`list-tab ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => setActiveTab("applications")}
              style={{ paddingBottom: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Calendar size={18} /> Okul Başvuruları ({schoolApps.length})
            </div>
          </div>

          {/* TAB 1: Teachers List */}
          {activeTab === "teachers" && (
            <div className="mod-table-container" style={{ margin: 0 }}>
              {loadingTeachers ? (
                <div className="empty-state" style={{ padding: "40px" }}>Öğretmen listesi yükleniyor...</div>
              ) : teachersList.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px", border: "none" }}>
                  <Users size={40} style={{ color: "var(--text-muted)", marginBottom: "12px", opacity: 0.5 }} />
                  <h4>Okula Kayıtlı Öğretmen Bulunmuyor</h4>
                  <p className="form-hint">Okulunuzun danışman öğretmenleri kaydolduğunda burada listelenecektir.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="mod-table">
                    <thead>
                      <tr>
                        <th>Öğretmen Adı Soyadı</th>
                        <th>E-posta</th>
                        <th>Telefon</th>
                        <th>Kayıt Tarihi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachersList.map((teacher) => (
                        <tr key={teacher.uid}>
                          <td style={{ fontWeight: "600" }}>{teacher.adSoyad}</td>
                          <td>{teacher.eposta}</td>
                          <td>{teacher.telefon || "-"}</td>
                          <td>{new Date(teacher.olusturmaTarihi).toLocaleDateString("tr-TR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 1.5: School Students */}
          {activeTab === "students" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ color: "var(--secondary)", fontWeight: "700", margin: 0 }}>Okul Öğrencileri Yönetimi</h4>
                <button
                  className="card-btn primary"
                  onClick={() => setShowAddStudentForm(!showAddStudentForm)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", width: "auto" }}
                >
                  <Plus size={16} /> {showAddStudentForm ? "Formu Kapat" : "Yeni Öğrenci Ekle"}
                </button>
              </div>

              {showAddStudentForm && (
                <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
                  <h5 style={{ color: "var(--primary)", fontWeight: "700", marginBottom: "16px", marginTop: 0 }}>Yeni Öğrenci Kayıt Formu</h5>
                  
                  {studentFormError && <div className="form-error" style={{ marginBottom: "16px" }}>{studentFormError}</div>}
                  {studentFormSuccess && <div style={{ color: "var(--success)", fontWeight: "600", marginBottom: "16px" }}>{studentFormSuccess}</div>}

                  <form onSubmit={handleStudentSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Ad Soyad *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Öğrencinin Adı Soyadı"
                          value={studentForm.adSoyad}
                          onChange={(e) => setStudentForm({ ...studentForm, adSoyad: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Sınıf Seviyesi *</label>
                        <select
                          className="form-control"
                          value={studentForm.sinifSeviyesi}
                          onChange={(e) => setStudentForm({ ...studentForm, sinifSeviyesi: e.target.value })}
                          required
                        >
                          <option value="">Sınıf Seçin</option>
                          <option value="5">5. Sınıf</option>
                          <option value="6">6. Sınıf</option>
                          <option value="7">7. Sınıf</option>
                          <option value="8">8. Sınıf</option>
                          <option value="9">9. Sınıf</option>
                          <option value="10">10. Sınıf</option>
                          <option value="11">11. Sınıf</option>
                          <option value="12">12. Sınıf</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">E-posta Adresi *</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="ogrenci@okul.k12.tr"
                          value={studentForm.eposta}
                          onChange={(e) => setStudentForm({ ...studentForm, eposta: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Şifre *</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="En az 6 karakter"
                          value={studentForm.sifre}
                          onChange={(e) => setStudentForm({ ...studentForm, sifre: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Veli Telefonu</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="05xx xxx xx xx"
                          value={studentForm.veliTelefon}
                          onChange={(e) => setStudentForm({ ...studentForm, veliTelefon: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Danışman Öğretmen *</label>
                        <select
                          className="form-control"
                          value={studentForm.teacherId}
                          onChange={(e) => setStudentForm({ ...studentForm, teacherId: e.target.value })}
                          required
                        >
                          <option value="">Öğretmen Seçin</option>
                          {teachersList.map((t) => (
                            <option key={t.uid} value={t.uid}>{t.adSoyad}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button type="button" className="card-btn secondary" onClick={() => setShowAddStudentForm(false)}>İptal</button>
                      <button type="submit" className="card-btn primary" disabled={isAddingStudent}>
                        {isAddingStudent ? "Ekleniyor..." : "Öğrenciyi Kaydet"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="mod-table-container" style={{ margin: 0 }}>
                {loadingStudents ? (
                  <div className="empty-state" style={{ padding: "40px" }}>Öğrenci listesi yükleniyor...</div>
                ) : schoolStudentsList.length === 0 ? (
                  <div className="empty-state" style={{ padding: "40px", border: "none" }}>
                    <GraduationCap size={40} style={{ color: "var(--text-muted)", marginBottom: "12px", opacity: 0.5 }} />
                    <h4>Okula Kayıtlı Öğrenci Bulunmuyor</h4>
                    <p className="form-hint">Ekle butonunu kullanarak veya danışman öğretmenler vasıtasıyla öğrenci ekleyebilirsiniz.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="mod-table">
                      <thead>
                        <tr>
                          <th>Öğrenci Adı Soyadı</th>
                          <th>E-posta</th>
                          <th>Sınıf</th>
                          <th>Danışman Öğretmen</th>
                          <th>Onay Durumu</th>
                          <th>Temsilci mi?</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schoolStudentsList.map((student) => {
                          const isRep = student.isStudentRep || student.studentProfile?.isStudentRep;
                          const assignedTeacher = teachersList.find(t => t.uid === (student.studentProfile?.teacherId || student.teacherId))?.adSoyad || "-";
                          return (
                            <tr key={student.uid}>
                              <td style={{ fontWeight: "600" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  {student.adSoyad}
                                  {isRep && <Award size={14} style={{ color: "var(--warning)" }} />}
                                </div>
                              </td>
                              <td>{student.eposta}</td>
                              <td>{student.studentProfile?.sinif || student.sinifSeviyesi || "-"}</td>
                              <td>{assignedTeacher}</td>
                              <td>
                                {student.onaylandi ? (
                                  <span className="card-badge" style={{ backgroundColor: "rgba(46, 204, 113, 0.15)", color: "var(--success)" }}>
                                    Onaylı
                                  </span>
                                ) : (
                                  <span className="card-badge" style={{ backgroundColor: "#f1f2f6", color: "var(--text-muted)" }}>
                                    Onay Bekliyor
                                  </span>
                                )}
                              </td>
                              <td>{isRep ? "Evet" : "Hayır"}</td>
                              <td>
                                <button
                                  className={`card-btn ${isRep ? "secondary" : "primary"}`}
                                  style={{ padding: "4px 8px", fontSize: "12px", width: "auto" }}
                                  onClick={() => handleToggleRep(student.uid, isRep)}
                                >
                                  {isRep ? "Temsilcilikten Çıkar" : "Okul Temsilcisi Yap"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Student Representative */}
          {activeTab === "rep" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                <h4 style={{ color: "var(--secondary)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontWeight: "700" }}>
                  <Award size={20} style={{ color: "var(--warning)" }} /> Okul Öğrenci Temsilcisi Bilgisi
                </h4>
                
                {(userProfile?.studentRepInfo || userProfile?.principalProfile?.studentRepInfo) ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div style={{ borderRight: "1px solid var(--border-color)", paddingRight: "20px" }}>
                      <p className="form-hint" style={{ fontSize: "12px" }}>Temsilci Ad Soyad</p>
                      <h5 style={{ fontWeight: "700", marginTop: "4px" }}>
                        {(userProfile?.studentRepInfo?.adSoyad || userProfile?.principalProfile?.studentRepInfo?.adSoyad)}
                      </h5>
                      
                      <p className="form-hint" style={{ fontSize: "12px", marginTop: "16px" }}>E-posta Adresi</p>
                      <p style={{ fontWeight: "600", marginTop: "4px" }}>
                        {(userProfile?.studentRepInfo?.eposta || userProfile?.principalProfile?.studentRepInfo?.eposta)}
                      </p>
                    </div>
                    <div>
                      <p className="form-hint" style={{ fontSize: "12px" }}>Telefon Numarası</p>
                      <p style={{ fontWeight: "600", marginTop: "4px" }}>
                        {(userProfile?.studentRepInfo?.telefon || userProfile?.principalProfile?.studentRepInfo?.telefon)}
                      </p>

                      <p className="form-hint" style={{ fontSize: "12px", marginTop: "16px" }}>Rol Tanımı</p>
                      <p style={{ fontSize: "13px", marginTop: "4px", color: "var(--text-muted)" }}>
                        Okul Öğrenci Temsilcisi, okul içi koordinasyonu sağlamak ve öğrencileri STEM etkinliklerine yönlendirmekle görevlidir.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: "24px" }}>
                    Temsilci bilgileri tanımlanmamış. Okul Öğrencileri sekmesinden bir öğrenciyi okul temsilcisi olarak atayabilirsiniz.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Scoped Announcement Form */}
          {activeTab === "announcements" && (
            <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <h4 style={{ color: "var(--secondary)", marginBottom: "16px", fontWeight: "700" }}>Okul Geneli Duyuru Oluştur</h4>
              <p className="form-hint" style={{ marginBottom: "20px" }}>
                Bu duyuru sadece okulunuzdaki öğretmen ve öğrencilerin panellerinde görünür olacaktır.
              </p>
              
              <form onSubmit={handleAnnounceSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {annError && <div className="form-error">{annError}</div>}
                {annSuccess && <div style={{ color: "var(--success)", fontWeight: "600" }}>{annSuccess}</div>}
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Duyuru Başlığı *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Örn: Robotik Takımı Seçmeleri Başlıyor"
                    value={announcementForm.baslik}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, baslik: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Duyuru İçeriği *</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Duyuru detaylarını buraya yazın..."
                    value={announcementForm.icerik}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, icerik: e.target.value })}
                    style={{ resize: "vertical" }}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="card-btn primary"
                  disabled={isSendingAnn}
                  style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Send size={16} /> {isSendingAnn ? "Gönderiliyor..." : "Duyuruyu Yayınla"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: School Applications Summary */}
          {activeTab === "applications" && (
            <div className="mod-table-container" style={{ margin: 0 }}>
              {schoolApps.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px", border: "none" }}>
                  <Calendar size={40} style={{ color: "var(--text-muted)", marginBottom: "12px", opacity: 0.5 }} />
                  <h4>Okulunuzdan Yapılmış Başvuru Bulunmuyor</h4>
                  <p className="form-hint">Öğretmenlerinizin öğrencileri adına yaptığı STEM başvuruları burada listelenir.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="mod-table">
                    <thead>
                      <tr>
                        <th>Etkinlik Adı</th>
                        <th>Danışman Öğretmen</th>
                        <th>Katılan Öğrenciler</th>
                        <th>Kayıt Tarihi</th>
                        <th>Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schoolApps.map((app) => {
                        const eventObj = allEventsRaw.find((e) => e.id === app.etkinlikId) || {
                          ad: "Bilinmeyen Etkinlik",
                        };
                        return (
                          <tr key={app.id}>
                            <td style={{ fontWeight: "600" }}>{eventObj.ad}</td>
                            <td>{app.ogretmenBilgi?.adSoyad || "Bilinmeyen"}</td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{ fontWeight: "bold" }}>{app.ogrenciler?.length || 0} Öğrenci</span>
                                <span className="form-hint" style={{ fontSize: "11px" }}>
                                  {app.ogrenciler?.map((s) => s.adSoyad).join(", ")}
                                </span>
                              </div>
                            </td>
                            <td>{new Date(app.olusturmaTarihi).toLocaleDateString("tr-TR")}</td>
                            <td>
                              {app.onaylandi ? (
                                <span
                                  className="card-badge"
                                  style={{
                                    backgroundColor: "rgba(46, 204, 113, 0.15)",
                                    color: "var(--success)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <Check size={12} /> Onaylandı
                                </span>
                              ) : (
                                <span
                                  className="card-badge"
                                  style={{
                                    backgroundColor: "#f1f2f6",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  Beklemede
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
