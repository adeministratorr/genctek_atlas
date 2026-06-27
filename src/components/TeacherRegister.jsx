import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { X } from "lucide-react";

const TeacherRegister = () => {
  const {
    cities,
    schoolsData,
    schoolsLoading,
    loadSchoolsForCity,
    registerUser,
    setModalType,
  } = useApp();

  const [formData, setFormData] = useState({
    adSoyad: "",
    eposta: "",
    sifre: "",
    telefon: "",
    il: "",
    ilce: "",
    okul: "",
    role: "teacher",
    repAdSoyad: "",
    repEposta: "",
    repTelefon: "",
  });

  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // When city changes, load districts and fetch schools JSON
  useEffect(() => {
    if (formData.il) {
      loadSchoolsForCity(formData.il);
      setFormData((prev) => ({ ...prev, ilce: "", okul: "" }));
    } else {
      setDistricts([]);
      setSchools([]);
    }
  }, [formData.il, loadSchoolsForCity]);

  // When schoolsData is fetched, extract district list
  useEffect(() => {
    if (schoolsData && Object.keys(schoolsData).length > 0) {
      setDistricts(Object.keys(schoolsData).sort());
    } else {
      setDistricts([]);
    }
  }, [schoolsData]);

  // When district changes, load matching schools
  useEffect(() => {
    if (formData.ilce && schoolsData[formData.ilce]) {
      setSchools(schoolsData[formData.ilce].map((s) => s.ad).sort());
      setFormData((prev) => ({ ...prev, okul: "" }));
    } else {
      setSchools([]);
    }
  }, [formData.ilce, schoolsData]);

  const validate = () => {
    const tempErrors = {};
    if (!formData.adSoyad.trim()) tempErrors.adSoyad = "Ad Soyad zorunludur.";
    if (!formData.eposta.trim()) {
      tempErrors.eposta = "E-posta zorunludur.";
    } else if (!/\S+@\S+\.\S+/.test(formData.eposta)) {
      tempErrors.eposta = "Geçerli bir e-posta adresi giriniz.";
    }
    if (!formData.sifre) {
      tempErrors.sifre = "Şifre zorunludur.";
    } else if (formData.sifre.length < 6) {
      tempErrors.sifre = "Şifre en az 6 karakter olmalıdır.";
    }
    if (!formData.telefon.trim()) tempErrors.telefon = "Telefon zorunludur.";
    if (!formData.il) tempErrors.il = "İl seçimi zorunludur.";
    if (!formData.ilce) tempErrors.ilce = "İlçe seçimi zorunludur.";
    if (!formData.okul) tempErrors.okul = "Okul seçimi zorunludur.";

    // Temsilci bilgileri artık opsiyoneldir. Girilmişse e-posta formatını kontrol ederiz.
    if (formData.repEposta.trim() && !/\S+@\S+\.\S+/.test(formData.repEposta)) {
      tempErrors.repEposta = "Geçerli bir temsilci e-postası giriniz.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const profileData = {
        adSoyad: formData.adSoyad,
        telefon: formData.telefon,
        il: formData.il,
        ilce: formData.ilce,
        okul: formData.okul,
        ...((formData.role === "principal" || formData.role === "teacher") && {
          studentRepInfo: {
            adSoyad: formData.repAdSoyad,
            eposta: formData.repEposta,
            telefon: formData.repTelefon
          }
        })
      };
      await registerUser(formData.eposta, formData.sifre, profileData, formData.role);
      setSuccess(true);
      setTimeout(() => {
        setModalType(null);
      }, 2000);
    } catch (error) {
      console.error("User Register Error:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Kayıt sırasında hata oluştu: " + error.message,
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
        style={{ maxWidth: "500px", width: "90%" }}
      >
        <div className="modal-header">
          <h3>Danışman Öğretmen Kayıt Formu</h3>
          <button className="close-btn" onClick={() => setModalType(null)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div
              className="empty-state"
              style={{
                borderColor: "var(--success)",
                color: "var(--secondary)",
                padding: "24px",
              }}
            >
              <h4>Kayıt Başarılı!</h4>
              <p style={{ marginTop: "8px", fontSize: "14px" }}>
                Hesabınız başarıyla oluşturuldu. Giriş yapılıyor...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div className="form-error" style={{ marginBottom: "16px" }}>
                  {errors.submit}
                </div>
              )}

              {/* Role Selector */}
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Sistem Rolünüz *</label>
                <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={formData.role === "teacher"}
                      onChange={handleInputChange}
                      style={{ width: "16px", height: "16px" }}
                    />
                    Danışman Öğretmen
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                    <input
                      type="radio"
                      name="role"
                      value="principal"
                      checked={formData.role === "principal"}
                      onChange={handleInputChange}
                      style={{ width: "16px", height: "16px" }}
                    />
                    Okul Müdürü
                  </label>
                </div>
              </div>

              {/* Name & Phone Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Ad Soyad *</label>
                  <input
                    type="text"
                    name="adSoyad"
                    className="form-control"
                    value={formData.adSoyad}
                    onChange={handleInputChange}
                    placeholder="Adınız Soyadınız"
                  />
                  {errors.adSoyad && (
                    <span className="form-error">{errors.adSoyad}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Telefon *</label>
                  <input
                    type="text"
                    name="telefon"
                    className="form-control"
                    value={formData.telefon}
                    onChange={handleInputChange}
                    placeholder="05xx xxx xx xx"
                  />
                  {errors.telefon && (
                    <span className="form-error">{errors.telefon}</span>
                  )}
                </div>
              </div>

              {/* Email & Password */}
              <div className="form-group">
                <label className="form-label">E-posta Adresi *</label>
                <input
                  type="email"
                  name="eposta"
                  className="form-control"
                  value={formData.eposta}
                  onChange={handleInputChange}
                  placeholder="name@school.k12.tr"
                />
                {errors.eposta && (
                  <span className="form-error">{errors.eposta}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Şifre *</label>
                <input
                  type="password"
                  name="sifre"
                  className="form-control"
                  value={formData.sifre}
                  onChange={handleInputChange}
                  placeholder="En az 6 karakter"
                />
                {errors.sifre && (
                  <span className="form-error">{errors.sifre}</span>
                )}
              </div>

              {/* Dynamic Location Selection */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label className="form-label">İl *</label>
                  <select
                    name="il"
                    className="form-control"
                    value={formData.il}
                    onChange={handleInputChange}
                  >
                    <option value="">İl Seçin</option>
                    {cities.map((c) => (
                      <option key={c.plaka} value={c.ad}>
                        {c.ad}
                      </option>
                    ))}
                  </select>
                  {errors.il && <span className="form-error">{errors.il}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">İlçe *</label>
                  <select
                    name="ilce"
                    className="form-control"
                    value={formData.ilce}
                    onChange={handleInputChange}
                    disabled={!formData.il || schoolsLoading}
                  >
                    <option value="">
                      {schoolsLoading ? "Yükleniyor..." : "İlçe Seçin"}
                    </option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.ilce && (
                    <span className="form-error">{errors.ilce}</span>
                  )}
                </div>
              </div>

              {/* School Select */}
              <div className="form-group">
                <label className="form-label">Okul *</label>
                <select
                  name="okul"
                  className="form-control"
                  value={formData.okul}
                  onChange={handleInputChange}
                  disabled={!formData.ilce || schoolsLoading}
                >
                  <option value="">İlçe Seçtikten Sonra Okul Seçin</option>
                  {schools.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.okul && (
                  <span className="form-error">{errors.okul}</span>
                )}
              </div>

              {/* Student Representative Information (Only for Principal or Teacher) */}
              {(formData.role === "principal" || formData.role === "teacher") && (
                <div style={{
                  marginTop: "20px",
                  padding: "16px",
                  backgroundColor: "rgba(217, 4, 41, 0.03)",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--primary-light)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginBottom: "16px"
                }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--primary-light)", paddingBottom: "6px", margin: 0 }}>
                    Okul Öğrenci Temsilcisi Bilgileri
                  </h4>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Temsilci Ad Soyad (Opsiyonel)</label>
                    <input
                      type="text"
                      name="repAdSoyad"
                      className="form-control"
                      value={formData.repAdSoyad}
                      onChange={handleInputChange}
                      placeholder="Öğrencinin Adı Soyadı"
                    />
                    {errors.repAdSoyad && <span className="form-error">{errors.repAdSoyad}</span>}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Temsilci E-posta (Opsiyonel)</label>
                      <input
                        type="email"
                        name="repEposta"
                        className="form-control"
                        value={formData.repEposta}
                        onChange={handleInputChange}
                        placeholder="rep@okul.k12.tr"
                      />
                      {errors.repEposta && <span className="form-error">{errors.repEposta}</span>}
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Temsilci Telefon (Opsiyonel)</label>
                      <input
                        type="text"
                        name="repTelefon"
                        className="form-control"
                        value={formData.repTelefon}
                        onChange={handleInputChange}
                        placeholder="05xx xxx xx xx"
                      />
                      {errors.repTelefon && <span className="form-error">{errors.repTelefon}</span>}
                    </div>
                  </div>
                </div>
              )}

              <div
                className="form-actions"
                style={{
                  marginTop: "24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  className="nav-link"
                  onClick={() => setModalType("login")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--primary)",
                  }}
                >
                  Zaten üye misiniz? Giriş Yapın
                </button>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="card-btn secondary"
                    onClick={() => setModalType(null)}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="card-btn primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherRegister;
