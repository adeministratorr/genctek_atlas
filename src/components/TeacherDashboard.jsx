import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { X, Plus, Trash2, Edit2, Check, GraduationCap, Calendar, User, Phone, Mail, Award } from "lucide-react";

const TeacherDashboard = () => {
  const {
    teacherProfile,
    students,
    applications,
    allEventsRaw,
    addStudent,
    updateStudent,
    deleteStudent,
    logoutModerator,
    setModalType,
    cities,
    schoolsData,
    loadSchoolsForCity,
    schoolsLoading,
    addCustomSchool,
    updateCustomSchool,
    toggleStudentRepStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState("students"); // 'students' | 'applications' | 'schools'
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);

  const [studentForm, setStudentForm] = useState({
    adSoyad: "",
    sinifSeviyesi: "",
    veliTelefon: "",
  });

  const [errors, setErrors] = useState({});

  // Okul Yonetimi State
  const [selectedSchoolDistrict, setSelectedSchoolDistrict] = useState("");
  const [schoolForm, setSchoolForm] = useState({ ad: "", website: "" });
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [schoolError, setSchoolError] = useState("");
  const [schoolSuccess, setSchoolSuccess] = useState("");

  useEffect(() => {
    if (teacherProfile?.il) {
      loadSchoolsForCity(teacherProfile.il);
    }
  }, [teacherProfile?.il, loadSchoolsForCity]);

  useEffect(() => {
    if (teacherProfile?.ilçe && !selectedSchoolDistrict) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSchoolDistrict(teacherProfile.ilçe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherProfile?.ilçe]);

  const validate = () => {
    const tempErrors = {};
    if (!studentForm.adSoyad.trim()) tempErrors.adSoyad = "Ad Soyad zorunludur.";
    if (!studentForm.sinifSeviyesi) tempErrors.sinifSeviyesi = "Sınıf seviyesi zorunludur.";
    if (!studentForm.veliTelefon.trim()) tempErrors.veliTelefon = "Veli telefonu zorunludur.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addStudent(studentForm);
      setStudentForm({ adSoyad: "", sinifSeviyesi: "", veliTelefon: "" });
      setIsAddingStudent(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateStudent(id, studentForm);
      setStudentForm({ adSoyad: "", sinifSeviyesi: "", veliTelefon: "" });
      setEditingStudentId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (student) => {
    setStudentForm({
      adSoyad: student.adSoyad,
      sinifSeviyesi: student.sinifSeviyesi,
      veliTelefon: student.veliTelefon,
    });
    setEditingStudentId(student.id);
    setIsAddingStudent(false);
  };

  const cancelEdit = () => {
    setStudentForm({ adSoyad: "", sinifSeviyesi: "", veliTelefon: "" });
    setEditingSchoolId(null);
  };

  const handleSchoolSubmit = async (e) => {
    e.preventDefault();
    setSchoolError("");
    setSchoolSuccess("");

    if (!teacherProfile?.il) {
      setSchoolError("Öğretmen il bilgisi bulunamadı.");
      return;
    }
    if (!selectedSchoolDistrict) {
      setSchoolError("Lütfen bir ilçe seçin.");
      return;
    }
    if (!schoolForm.ad.trim()) {
      setSchoolError("Okul adı boş olamaz.");
      return;
    }

    try {
      const payload = {
        il: teacherProfile.il,
        ilce: selectedSchoolDistrict,
        ad: schoolForm.ad.trim(),
        website: schoolForm.website.trim(),
      };

      if (editingSchoolId) {
        let originalAd = "";
        if (editingSchoolId.startsWith("static-")) {
          const districtSchools = schoolsData[selectedSchoolDistrict.toUpperCase()] || [];
          const originalSchool = districtSchools.find((s) => s.id === editingSchoolId);
          if (originalSchool) originalAd = originalSchool.ad;
        }
        await updateCustomSchool(editingSchoolId, { ...payload, originalAd });
        setSchoolSuccess("Okul başarıyla güncellendi!");
      } else {
        await addCustomSchool(payload);
        setSchoolSuccess("Yeni okul başarıyla eklendi!");
      }

      setSchoolForm({ ad: "", website: "" });
      setEditingSchoolId(null);
    } catch (err) {
      console.error(err);
      setSchoolError("İşlem sırasında hata oluştu: " + err.message);
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
            <h3>Danışman Öğretmen Paneli</h3>
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
          {/* Advisor Info Bar */}
          {teacherProfile && (
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
                <p className="form-hint" style={{ display: "flex", alignItems: "center", gap: "6px" }}><User size={13} /> Danışman</p>
                <h4 style={{ color: "var(--secondary)", marginTop: "4px" }}>{teacherProfile.adSoyad}</h4>
              </div>
              <div>
                <p className="form-hint" style={{ display: "flex", alignItems: "center", gap: "6px" }}><Phone size={13} /> İletişim</p>
                <p style={{ fontSize: "14px", fontWeight: "600", marginTop: "4px" }}>{teacherProfile.telefon}</p>
                <p className="form-hint" style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}><Mail size={11} /> {teacherProfile.eposta}</p>
              </div>
              <div>
                <p className="form-hint" style={{ display: "flex", alignItems: "center", gap: "6px" }}><Award size={13} /> Görev Yaptığı Okul</p>
                <h5 style={{ color: "var(--primary)", marginTop: "4px", fontWeight: "700" }}>{teacherProfile.okul}</h5>
                <p className="form-hint" style={{ fontSize: "12px" }}>{teacherProfile.ilçe} / {teacherProfile.il}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <button
                  className="card-btn secondary"
                  onClick={() => {
                    logoutModerator();
                    setModalType(null);
                  }}
                  style={{ height: "fit-content" }}
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
              className={`list-tab ${activeTab === "students" ? "active" : ""}`}
              onClick={() => setActiveTab("students")}
              style={{ paddingBottom: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <GraduationCap size={18} /> Öğrencilerim ({students.length})
            </div>
            <div
              className={`list-tab ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => setActiveTab("applications")}
              style={{ paddingBottom: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Calendar size={18} /> Başvurularım ({applications.length})
            </div>
            <div
              className={`list-tab ${activeTab === "schools" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("schools");
                if (teacherProfile?.il) {
                  loadSchoolsForCity(teacherProfile.il);
                }
              }}
              style={{ paddingBottom: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Plus size={18} /> Okul Ekle / Düzenle
            </div>
          </div>

          {/* TAB CONTENT: Students Management */}
          {activeTab === "students" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Add / Edit Student Form */}
              {(isAddingStudent || editingStudentId) && (
                <form
                  onSubmit={editingStudentId ? (e) => handleEditSubmit(e, editingStudentId) : handleAddSubmit}
                  style={{
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--primary-light)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr auto",
                    gap: "16px",
                    alignItems: "end",
                  }}
                >
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Öğrenci Adı Soyadı *</label>
                    <input
                      type="text"
                      name="adSoyad"
                      className="form-control"
                      value={studentForm.adSoyad}
                      onChange={handleInputChange}
                      placeholder="Adı Soyadı"
                    />
                    {errors.adSoyad && <span className="form-error">{errors.adSoyad}</span>}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Sınıf Seviyesi *</label>
                    <select
                      name="sinifSeviyesi"
                      className="form-control"
                      value={studentForm.sinifSeviyesi}
                      onChange={handleInputChange}
                    >
                      <option value="">Sınıf Seçin</option>
                      <option value="İlkokul">İlkokul</option>
                      <option value="Ortaokul">Ortaokul</option>
                      <option value="5. Sınıf">5. Sınıf</option>
                      <option value="6. Sınıf">6. Sınıf</option>
                      <option value="7. Sınıf">7. Sınıf</option>
                      <option value="8. Sınıf">8. Sınıf</option>
                      <option value="9. Sınıf">9. Sınıf</option>
                      <option value="10. Sınıf">10. Sınıf</option>
                      <option value="11. Sınıf">11. Sınıf</option>
                      <option value="12. Sınıf">12. Sınıf</option>
                      <option value="Mezun">Mezun</option>
                    </select>
                    {errors.sinifSeviyesi && <span className="form-error">{errors.sinifSeviyesi}</span>}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Veli Telefon Numarası *</label>
                    <input
                      type="text"
                      name="veliTelefon"
                      className="form-control"
                      value={studentForm.veliTelefon}
                      onChange={handleInputChange}
                      placeholder="05xx xxx xx xx"
                    />
                    {errors.veliTelefon && <span className="form-error">{errors.veliTelefon}</span>}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="submit" className="card-btn primary">
                      {editingStudentId ? "Güncelle" : "Ekle"}
                    </button>
                    <button
                      type="button"
                      className="card-btn secondary"
                      onClick={editingStudentId ? cancelEdit : () => setIsAddingStudent(false)}
                    >
                      İptal
                    </button>
                  </div>
                </form>
              )}

              {/* Add Student Trigger Button */}
              {!isAddingStudent && !editingStudentId && (
                <button
                  className="card-btn primary"
                  onClick={() => setModalType("student-register")}
                  style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Plus size={16} /> Yeni Öğrenci Ekle
                </button>
              )}

              {/* Students Table */}
              <div className="mod-table-container" style={{ margin: 0 }}>
                {students.length === 0 ? (
                  <div className="empty-state" style={{ padding: "40px", border: "none" }}>
                    <GraduationCap size={40} style={{ color: "var(--text-muted)", marginBottom: "12px", opacity: 0.5 }} />
                    <h4>Kayıtlı Öğrenciniz Bulunmuyor</h4>
                    <p className="form-hint" style={{ marginTop: "6px" }}>
                      Etkinliklere başvurmak için önce öğrencilerinizi bu listeden ekleyin.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="mod-table">
                      <thead>
                        <tr>
                          <th>Öğrenci Adı Soyadı</th>
                          <th>Sınıf Seviyesi</th>
                          <th>Veli Telefonu</th>
                          <th style={{ textAlign: "right" }}>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td style={{ fontWeight: "600" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                {student.adSoyad}
                                {student.isStudentRep && (
                                  <span
                                    className="card-badge"
                                    style={{
                                      backgroundColor: "#fff7ed",
                                      color: "var(--warning)",
                                      border: "1px solid #ffedd5",
                                      fontSize: "11px",
                                      padding: "2px 6px",
                                      fontWeight: "700"
                                    }}
                                  >
                                    Temsilci
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span
                                className="card-badge"
                                style={{
                                  backgroundColor: "var(--primary-light)",
                                  color: "var(--primary)",
                                }}
                              >
                                {student.sinifSeviyesi}
                              </span>
                            </td>
                            <td>{student.veliTelefon}</td>
                            <td className="mod-actions" style={{ justifyContent: "flex-end" }}>
                              <button
                                className="mod-btn approve"
                                onClick={() => toggleStudentRepStatus(student.id, !student.isStudentRep)}
                                title={student.isStudentRep ? "Temsilciliği Kaldır" : "Temsilci Yap"}
                                style={{
                                  backgroundColor: student.isStudentRep ? "rgba(245, 158, 11, 0.15)" : "#f1f2f6",
                                  color: student.isStudentRep ? "var(--warning)" : "var(--secondary)"
                                }}
                              >
                                <Award size={12} />
                              </button>
                              <button
                                className="mod-btn approve"
                                onClick={() => startEdit(student)}
                                title="Düzenle"
                                style={{ backgroundColor: "#f1f2f6", color: "var(--secondary)" }}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                className="mod-btn reject"
                                onClick={() => {
                                  if (window.confirm(`${student.adSoyad} isimli öğrenciyi silmek istediğinize emin misiniz?`)) {
                                    deleteStudent(student.id);
                                  }
                                }}
                                title="Sil"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: Applications List */}
          {activeTab === "applications" && (
            <div className="mod-table-container" style={{ margin: 0 }}>
              {applications.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px", border: "none" }}>
                  <Calendar size={40} style={{ color: "var(--text-muted)", marginBottom: "12px", opacity: 0.5 }} />
                  <h4>Henüz Bir Başvurunuz Yok</h4>
                  <p className="form-hint" style={{ marginTop: "6px" }}>
                    Duyuru aşamasındaki etkinliklere detay sayfalarından başvuru yapabilirsiniz.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="mod-table">
                    <thead>
                      <tr>
                        <th>Etkinlik Adı</th>
                        <th>Kayıt Tarihi</th>
                        <th>Katılan Öğrenciler</th>
                        <th>Onay Durumu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => {
                        const eventObj = allEventsRaw.find((e) => e.id === app.etkinlikId) || {
                          ad: "Bilinmeyen Etkinlik",
                        };
                        return (
                          <tr key={app.id}>
                            <td style={{ fontWeight: "600" }}>{eventObj.ad}</td>
                            <td>{new Date(app.olusturmaTarihi).toLocaleDateString("tr-TR")}</td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <span style={{ fontWeight: "bold" }}>{app.ogrenciler?.length || 0} Öğrenci</span>
                                <span className="form-hint" style={{ fontSize: "11px" }}>
                                  {app.ogrenciler?.map((s) => s.adSoyad).join(", ")}
                                </span>
                              </div>
                            </td>
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

          {/* TAB CONTENT: School Management */}
          {activeTab === "schools" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Sol: Ekleme Formu */}
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                <h5 style={{ marginBottom: "16px", fontWeight: "600" }}>
                  {editingSchoolId ? "Okul Bilgisini Düzenle" : "Yeni Okul Ekle"}
                </h5>
                <p className="form-hint" style={{ marginBottom: "12px" }}>
                  Kendi okulunuz listede yoksa buradan ekleyebilirsiniz.
                </p>
                <form onSubmit={handleSchoolSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>İlçe</label>
                    <select
                      className="form-control"
                      value={selectedSchoolDistrict}
                      onChange={(e) => setSelectedSchoolDistrict(e.target.value)}
                      required
                    >
                      <option value="">İlçe Seçin...</option>
                      {teacherProfile?.il &&
                        (cities.find((c) => c.ad.toLowerCase() === teacherProfile.il.toLowerCase())?.ilceleri || []).map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Okul Adı</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Okul adını giriniz..."
                      value={schoolForm.ad}
                      onChange={(e) => setSchoolForm({ ...schoolForm, ad: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Web Sitesi (Opsiyonel)</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://okul.meb.k12.tr..."
                      value={schoolForm.website}
                      onChange={(e) => setSchoolForm({ ...schoolForm, website: e.target.value })}
                    />
                  </div>

                  {schoolError && <div style={{ color: "var(--danger)", fontSize: "13px" }}>{schoolError}</div>}
                  {schoolSuccess && <div style={{ color: "var(--success)", fontSize: "13px" }}>{schoolSuccess}</div>}

                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button type="submit" className="card-btn primary" style={{ flex: 1, height: "40px" }}>
                      {editingSchoolId ? "Güncelle" : "Ekle"}
                    </button>
                    {editingSchoolId && (
                      <button
                        type="button"
                        className="card-btn secondary"
                        style={{ flex: 1, height: "40px" }}
                        onClick={() => {
                          setEditingSchoolId(null);
                          setSchoolForm({ ad: "", website: "" });
                        }}
                      >
                        Vazgeç
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Sağ: Seçili İlçedeki Okul Listesi */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h5 style={{ fontWeight: "600" }}>
                  {selectedSchoolDistrict ? `${selectedSchoolDistrict} İlçesindeki Okullar` : "Okullar"}
                </h5>
                {!selectedSchoolDistrict ? (
                  <div className="empty-state" style={{ padding: "40px", border: "1px dashed var(--border-color)" }}>
                    Okulları listelemek için lütfen İlçe seçin.
                  </div>
                ) : schoolsLoading ? (
                  <div className="empty-state" style={{ padding: "40px" }}>
                    Okullar yükleniyor...
                  </div>
                ) : (schoolsData[selectedSchoolDistrict.toUpperCase()] || []).length === 0 ? (
                  <div className="empty-state" style={{ padding: "40px" }}>
                    Bu ilçeye ait okul bulunamadı. Yeni bir tane ekleyebilirsiniz.
                  </div>
                ) : (
                  <div style={{ overflowY: "auto", maxHeight: "400px", border: "1px solid var(--border-color)", borderRadius: "8px", backgroundColor: "#fff" }}>
                    <table className="mod-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Okul Adı</th>
                          <th>Web Sitesi</th>
                          <th>Kaynak</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(schoolsData[selectedSchoolDistrict.toUpperCase()] || []).map((school) => {
                          const isStatic = school.id?.startsWith("static-");
                          return (
                            <tr key={school.id}>
                              <td style={{ fontWeight: "600", fontSize: "13px" }}>{school.ad}</td>
                              <td>
                                {school.website ? (
                                  <a href={school.website} target="_blank" rel="noopener noreferrer" className="form-hint" style={{ color: "var(--primary)", textDecoration: "underline" }}>
                                    Git
                                  </a>
                                ) : (
                                  <span className="form-hint">-</span>
                                )}
                              </td>
                              <td>
                                <span
                                  className="card-badge"
                                  style={{
                                    backgroundColor: isStatic ? "#f1f2f6" : "rgba(46,204,113,0.15)",
                                    color: isStatic ? "var(--text-muted)" : "var(--success)",
                                    fontSize: "11px",
                                  }}
                                >
                                  {isStatic ? "Sistem" : "Dinamik"}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="mod-btn approve"
                                  style={{ backgroundColor: "#f1f2f6", color: "var(--secondary)", padding: "4px 8px" }}
                                  onClick={() => {
                                    setEditingSchoolId(school.id);
                                    setSchoolForm({ ad: school.ad, website: school.website || "" });
                                  }}
                                  title="Düzenle"
                                >
                                  <Edit2 size={12} />
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
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
