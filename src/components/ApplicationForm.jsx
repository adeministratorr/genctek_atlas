import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { X, Plus, Trash2, CheckCircle2 } from "lucide-react";

const ApplicationForm = ({ event }) => {
  const {
    user,
    userRole,
    teacherProfile,
    students,
    cities,
    schoolsData,
    schoolsLoading,
    loadSchoolsForCity,
    addEventApplication,
    getApprovedStudentCount,
    setModalType,
  } = useApp();

  const [formData, setFormData] = useState({
    adSoyad: "",
    eposta: "",
    telefon: "",
    il: "",
    ilce: "",
    okul: "",
  });

  const [guestStudents, setGuestStudents] = useState([
    { adSoyad: "", sinifSeviyesi: "", veliTelefon: "" },
  ]);

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Remaining capacity calculation
  const approvedCount = getApprovedStudentCount(event.id);
  const limit = event.ogrenciSiniri || 99999;
  const remainingCapacity = Math.max(0, limit - approvedCount);

  // If teacher is logged in, autofill advisor info
  useEffect(() => {
    if (userRole === "teacher" && teacherProfile) {
      setFormData({
        adSoyad: teacherProfile.adSoyad,
        eposta: teacherProfile.eposta,
        telefon: teacherProfile.telefon,
        il: teacherProfile.il,
        ilce: teacherProfile.ilce,
        okul: teacherProfile.okul,
      });
    }
  }, [userRole, teacherProfile]);

  // Handle guest location mapping
  useEffect(() => {
    if (userRole !== "teacher" && formData.il) {
      loadSchoolsForCity(formData.il);
      setFormData((prev) => ({ ...prev, ilce: "", okul: "" }));
    }
  }, [formData.il, userRole, loadSchoolsForCity]);


  useEffect(() => {
    if (userRole !== "teacher" && schoolsData && Object.keys(schoolsData).length > 0) {
      setDistricts(Object.keys(schoolsData).sort());
    } else {
      setDistricts([]);
    }
  }, [schoolsData, userRole]);

  useEffect(() => {
    if (userRole !== "teacher" && formData.ilce && schoolsData[formData.ilce]) {
      setSchools(schoolsData[formData.ilce].map((s) => s.ad).sort());
      setFormData((prev) => ({ ...prev, okul: "" }));
    } else {
      setSchools([]);
    }
  }, [formData.ilce, schoolsData, userRole]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Guest students dynamic list helpers
  const handleGuestStudentChange = (idx, field, value) => {
    const updated = [...guestStudents];
    updated[idx][field] = value;
    setGuestStudents(updated);
  };

  const addGuestStudentRow = () => {
    setGuestStudents((prev) => [
      ...prev,
      { adSoyad: "", sinifSeviyesi: "", veliTelefon: "" },
    ]);
  };

  const removeGuestStudentRow = (idx) => {
    setGuestStudents((prev) => prev.filter((_, i) => i !== idx));
  };

  // Checkbox select for logged-in teacher's students
  const handleCheckboxChange = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const validate = () => {
    const tempErrors = {};

    // 1. Advisor Validation (only if guest)
    if (userRole !== "teacher") {
      if (!formData.adSoyad.trim()) tempErrors.adSoyad = "Danışman öğretmen adı zorunludur.";
      if (!formData.eposta.trim()) {
        tempErrors.eposta = "E-posta zorunludur.";
      } else if (!/\S+@\S+\.\S+/.test(formData.eposta)) {
        tempErrors.eposta = "Geçerli bir e-posta giriniz.";
      }
      if (!formData.telefon.trim()) tempErrors.telefon = "Telefon zorunludur.";
      if (!formData.il) tempErrors.il = "İl seçimi zorunludur.";
      if (!formData.ilce) tempErrors.ilce = "İlçe seçimi zorunludur.";
      if (!formData.okul) tempErrors.okul = "Okul seçimi zorunludur.";
    }

    // 2. Application Constraints Checking
    const applicantIl = userRole === "teacher" ? teacherProfile?.il : formData.il;
    const applicantIlce = userRole === "teacher" ? teacherProfile?.ilce : formData.ilce;

    if (event.basvuruKisitlama?.ilKisitlama && applicantIl !== event.il) {
      tempErrors.constraint = `Bu etkinliğe sadece "${event.il}" ilinden başvuru kabul edilmektedir.`;
    }
    if (event.basvuruKisitlama?.ilceKisitlama && applicantIlce !== event.ilce) {
      tempErrors.constraint = `Bu etkinliğe sadece "${event.il} - ${event.ilce}" ilçesinden başvuru kabul edilmektedir.`;
    }

    // 3. Students Validation
    const studentCount = userRole === "teacher" ? selectedStudentIds.length : guestStudents.length;
    if (userRole === "teacher") {
      if (studentCount === 0) {
        tempErrors.students = "En az 1 öğrenci seçmelisiniz.";
      }
    } else {
      const validStudents = guestStudents.filter((s) => s.adSoyad.trim() && s.sinifSeviyesi && s.veliTelefon.trim());
      if (validStudents.length !== guestStudents.length) {
        tempErrors.students = "Lütfen tüm öğrenci bilgilerini eksiksiz doldurun veya eksik satırları silin.";
      }
    }

    // 4. Capacity Check
    if (studentCount > remainingCapacity) {
      tempErrors.capacity = `Kontenjan yetersiz. Kalan Kontenjan: ${remainingCapacity} öğrenci. Seçilen/Eklenen: ${studentCount} öğrenci.`;
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let finalStudentsList = [];
      if (userRole === "teacher") {
        finalStudentsList = students
          .filter((s) => selectedStudentIds.includes(s.id))
          .map((s) => ({
            adSoyad: s.adSoyad,
            sinifSeviyesi: s.sinifSeviyesi,
            veliTelefon: s.veliTelefon,
          }));
      } else {
        finalStudentsList = [...guestStudents];
      }

      const applicationData = {
        etkinlikId: event.id,
        ogretmenId: userRole === "teacher" ? user.uid : "guest",
        ogretmenBilgi: {
          adSoyad: formData.adSoyad,
          eposta: formData.eposta,
          telefon: formData.telefon,
          il: formData.il,
          ilce: formData.ilce,
          okul: formData.okul,
        },
        ogrenciler: finalStudentsList,
      };

      await addEventApplication(applicationData);
      setSuccess(true);
      setTimeout(() => {
        setModalType(null);
      }, 2500);
    } catch (error) {
      console.error(error);
      setErrors((prev) => ({
        ...prev,
        submit: "Başvuru gönderilirken hata oluştu: " + error.message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setModalType(null)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "700px", width: "95%", height: "85vh", display: "flex", flexDirection: "column" }}
      >
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div>
            <h3>Etkinlik Katılım Başvurusu</h3>
            <p className="form-hint" style={{ marginTop: "4px" }}>{event.ad}</p>
          </div>
          <button className="close-btn" onClick={() => setModalType(null)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ flexGrow: 1, overflowY: "auto", padding: "24px" }}>
          {success ? (
            <div className="empty-state" style={{ borderColor: "var(--success)", color: "var(--secondary)", padding: "40px" }}>
              <CheckCircle2 size={48} style={{ color: "var(--success)", marginBottom: "16px" }} />
              <h4>Başvurunuz Başarıyla Gönderildi!</h4>
              <p style={{ marginTop: "8px", fontSize: "14px" }}>
                Başvurunuz moderatör onayına gönderilmiştir. Onay durumunu panelinizden takip edebilirsiniz.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Error messages */}
              {errors.submit && <div className="form-error">{errors.submit}</div>}
              {errors.constraint && <div className="form-error">{errors.constraint}</div>}
              {errors.capacity && <div className="form-error">{errors.capacity}</div>}

              {/* Event capacity stats */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  backgroundColor: "var(--primary-light)",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--primary)",
                }}
              >
                <span>Kontenjan Sınırı: {event.ogrenciSiniri ? `${event.ogrenciSiniri} Öğrenci` : "Sınırsız"}</span>
                <span>Onaylanan: {approvedCount} | Kalan Kontenjan: {remainingCapacity}</span>
              </div>

              {/* Constraints Warning Alert */}
              {(event.basvuruKisitlama?.ilKisitlama || event.basvuruKisitlama?.ilceKisitlama) && (
                <div
                  style={{
                    backgroundColor: "#fff7ed",
                    border: "1px solid #ffedd5",
                    color: "#c2410c",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "13px",
                  }}
                >
                  <strong>⚠️ Başvuru Kısıtlaması Mevcut:</strong> Bu etkinliğe sadece{" "}
                  {event.basvuruKisitlama.ilceKisitlama ? `"${event.il} - ${event.ilce}"` : `"${event.il}"`} okullarından
                  başvuru yapılabilir.
                </div>
              )}

              {/* Section 1: Advisor Teacher Information */}
              <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <h4 style={{ marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                  Danışman Öğretmen Bilgileri
                </h4>

                {userRole === "teacher" ? (
                  /* Logged-in Teacher Mode */
                  <div style={{ fontSize: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <p><strong>Ad Soyad:</strong> {formData.adSoyad}</p>
                    <p><strong>Okul:</strong> {formData.okul}</p>
                    <p><strong>Telefon:</strong> {formData.telefon}</p>
                    <p><strong>İl/İlçe:</strong> {formData.ilce} / {formData.il}</p>
                  </div>
                ) : (
                  /* Guest Mode */
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Ad Soyad *</label>
                        <input
                          type="text"
                          name="adSoyad"
                          className="form-control"
                          value={formData.adSoyad}
                          onChange={handleInputChange}
                        />
                        {errors.adSoyad && <span className="form-error">{errors.adSoyad}</span>}
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Telefon *</label>
                        <input
                          type="text"
                          name="telefon"
                          className="form-control"
                          value={formData.telefon}
                          onChange={handleInputChange}
                        />
                        {errors.telefon && <span className="form-error">{errors.telefon}</span>}
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">E-posta Adresi *</label>
                      <input
                        type="email"
                        name="eposta"
                        className="form-control"
                        value={formData.eposta}
                        onChange={handleInputChange}
                      />
                      {errors.eposta && <span className="form-error">{errors.eposta}</span>}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">İl *</label>
                        <select name="il" className="form-control" value={formData.il} onChange={handleInputChange}>
                          <option value="">İl Seçin</option>
                          {cities.map((c) => (
                            <option key={c.plaka} value={c.ad}>{c.ad}</option>
                          ))}
                        </select>
                        {errors.il && <span className="form-error">{errors.il}</span>}
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">İlçe *</label>
                        <select
                          name="ilce"
                          className="form-control"
                          value={formData.ilce}
                          onChange={handleInputChange}
                          disabled={!formData.il || schoolsLoading}
                        >
                          <option value="">İlçe Seçin</option>
                          {districts.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        {errors.ilce && <span className="form-error">{errors.ilce}</span>}
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Okul *</label>
                      <select
                        name="okul"
                        className="form-control"
                        value={formData.okul}
                        onChange={handleInputChange}
                        disabled={!formData.ilce || schoolsLoading}
                      >
                        <option value="">Okul Seçin</option>
                        {schools.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.okul && <span className="form-error">{errors.okul}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Students Selection / Input */}
              <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <h4 style={{ marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                  Katılacak Öğrenci Bilgileri
                </h4>
                {errors.students && <div className="form-error" style={{ marginBottom: "12px" }}>{errors.students}</div>}

                {userRole === "teacher" ? (
                  /* Logged-in Teacher: Checklist of their students */
                  students.length === 0 ? (
                    <div style={{ padding: "16px", textAlign: "center" }} className="form-hint">
                      Paneline kayıtlı öğrenciniz bulunmuyor. Lütfen önce "Öğretmen Paneli" üzerinden öğrencilerinizi ekleyin.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
                      {students.map((s) => (
                        <label
                          key={s.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px",
                            border: "1px solid var(--border-color)",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(s.id)}
                            onChange={() => handleCheckboxChange(s.id)}
                          />
                          <div style={{ fontSize: "14px" }}>
                            <strong>{s.adSoyad}</strong> - {s.sinifSeviyesi} (Veli Tel: {s.veliTelefon})
                          </div>
                        </label>
                      ))}
                    </div>
                  )
                ) : (
                  /* Guest Mode: Add student rows dynamically */
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {guestStudents.map((student, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.5fr 1fr 1fr auto",
                          gap: "10px",
                          alignItems: "center",
                          paddingBottom: "12px",
                          borderBottom: idx !== guestStudents.length - 1 ? "1px dashed var(--border-color)" : "none",
                        }}
                      >
                        <div className="form-group" style={{ margin: 0 }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Öğrenci Adı Soyadı"
                            value={student.adSoyad}
                            onChange={(e) => handleGuestStudentChange(idx, "adSoyad", e.target.value)}
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <select
                            className="form-control"
                            value={student.sinifSeviyesi}
                            onChange={(e) => handleGuestStudentChange(idx, "sinifSeviyesi", e.target.value)}
                          >
                            <option value="">Sınıf</option>
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
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Veli Tel (05xx)"
                            value={student.veliTelefon}
                            onChange={(e) => handleGuestStudentChange(idx, "veliTelefon", e.target.value)}
                          />
                        </div>

                        {guestStudents.length > 1 && (
                          <button
                            type="button"
                            className="mod-btn reject"
                            onClick={() => removeGuestStudentRow(idx)}
                            style={{ padding: "8px", height: "fit-content" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      className="card-btn secondary"
                      onClick={addGuestStudentRow}
                      style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <Plus size={14} /> Öğrenci Ekle
                    </button>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="form-actions" style={{ flexShrink: 0, marginTop: "12px" }}>
                <button type="button" className="card-btn secondary" onClick={() => setModalType(null)}>
                  İptal
                </button>
                <button type="submit" className="card-btn primary" disabled={isSubmitting || remainingCapacity === 0}>
                  {isSubmitting ? "Gönderiliyor..." : "Başvuruyu Tamamla"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
