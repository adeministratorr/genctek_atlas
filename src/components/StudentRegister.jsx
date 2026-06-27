import { useState } from "react";
import { useApp } from "../context/AppContext";
import { X } from "lucide-react";

const StudentRegister = () => {
  const { registerStudent, setModalType } = useApp();

  const [formData, setFormData] = useState({
    adSoyad: "",
    eposta: "",
    sifre: "",
    veliTelefon: "",
    sinifSeviyesi: "",
    isStudentRep: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!formData.adSoyad.trim()) tempErrors.adSoyad = "Öğrenci Ad Soyadı zorunludur.";
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
    if (!formData.sinifSeviyesi) tempErrors.sinifSeviyesi = "Sınıf seviyesi zorunludur.";
    if (!formData.veliTelefon.trim()) tempErrors.veliTelefon = "Veli telefonu zorunludur.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await registerStudent(formData.eposta, formData.sifre, {
        adSoyad: formData.adSoyad,
        veliTelefon: formData.veliTelefon,
        sinifSeviyesi: formData.sinifSeviyesi,
        isStudentRep: formData.isStudentRep,
      });
      setSuccess(true);
      setTimeout(() => {
        setModalType("teacher-dashboard"); // Return to dashboard
      }, 1500);
    } catch (error) {
      console.error("Student Register Error:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Kayıt sırasında hata oluştu: " + error.message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setModalType("teacher-dashboard")}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "500px", width: "90%" }}
      >
        <div className="modal-header">
          <h3>Yeni Öğrenci Ekle</h3>
          <button className="close-btn" onClick={() => setModalType("teacher-dashboard")}>
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
              <h4>Öğrenci Başarıyla Eklendi!</h4>
              <p style={{ marginTop: "8px", fontSize: "14px" }}>
                Öğrenci hesabı oluşturuldu ve listenize eklendi.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div className="form-error" style={{ marginBottom: "16px" }}>
                  {errors.submit}
                </div>
              )}

              {/* Name & Grade Level */}
              <div className="form-group">
                <label className="form-label">Öğrenci Adı Soyadı *</label>
                <input
                  type="text"
                  name="adSoyad"
                  className="form-control"
                  value={formData.adSoyad}
                  onChange={handleInputChange}
                  placeholder="Öğrencinin Adı Soyadı"
                />
                {errors.adSoyad && <span className="form-error">{errors.adSoyad}</span>}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Sınıf Seviyesi *</label>
                  <select
                    name="sinifSeviyesi"
                    className="form-control"
                    value={formData.sinifSeviyesi}
                    onChange={handleInputChange}
                  >
                    <option value="">Seçin</option>
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
                  {errors.sinifSeviyesi && (
                    <span className="form-error">{errors.sinifSeviyesi}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Veli Telefonu *</label>
                  <input
                    type="text"
                    name="veliTelefon"
                    className="form-control"
                    value={formData.veliTelefon}
                    onChange={handleInputChange}
                    placeholder="05xx xxx xx xx"
                  />
                  {errors.veliTelefon && (
                    <span className="form-error">{errors.veliTelefon}</span>
                  )}
                </div>
              </div>

              {/* Email & Password */}
              <div className="form-group">
                <label className="form-label">Öğrenci E-posta *</label>
                <input
                  type="email"
                  name="eposta"
                  className="form-control"
                  value={formData.eposta}
                  onChange={handleInputChange}
                  placeholder="ogrenci@okul.k12.tr"
                />
                {errors.eposta && <span className="form-error">{errors.eposta}</span>}
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
                {errors.sifre && <span className="form-error">{errors.sifre}</span>}
              </div>

              {/* Student Representative Checkbox */}
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                <input
                  type="checkbox"
                  id="isStudentRep"
                  name="isStudentRep"
                  checked={formData.isStudentRep}
                  onChange={handleInputChange}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="isStudentRep" className="form-label" style={{ margin: 0, cursor: "pointer", fontWeight: "600" }}>
                  Okul Öğrenci Temsilcisi Olarak Belirle
                </label>
              </div>

              <div
                className="form-actions"
                style={{
                  marginTop: "24px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  className="card-btn secondary"
                  onClick={() => setModalType("teacher-dashboard")}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="card-btn primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Kaydediliyor..." : "Öğrenciyi Kaydet"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
