import { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, Upload, Check, Shield } from "lucide-react";

const ProjectForm = () => {
  const { themes, allEventsRaw, addProject, uploadFile, setModalType } =
    useApp();

  const [formData, setFormData] = useState({
    ad: "",
    etkinlikId: "",
    tema: "",
    parkur: "",
    takimAdi: "",
    katilimciIllerStr: "", // Will be parsed to array
    aciklama: "",
    githubLink: "",
    demoLink: "",
    etikKontrol: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [promptFile, setPromptFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get only approved events to link projects
  const approvedEvents = allEventsRaw.filter((e) => e.onaylandi);

  const validate = () => {
    const tempErrors = {};
    if (!formData.ad.trim()) tempErrors.ad = "Proje adı zorunludur.";
    if (!formData.tema) tempErrors.tema = "Tema seçimi zorunludur.";
    if (!formData.takimAdi.trim())
      tempErrors.takimAdi = "Takım adı zorunludur.";
    if (!formData.katilimciIllerStr.trim())
      tempErrors.katilimciIller = "En az bir katılımcı il yazılmalıdır.";

    if (!formData.aciklama.trim()) {
      tempErrors.aciklama = "Açıklama zorunludur.";
    } else if (formData.aciklama.length > 1000) {
      tempErrors.aciklama = "Açıklama en fazla 1000 karakter olabilir.";
    }

    // GitHub Link Validation
    if (!formData.githubLink.trim()) {
      tempErrors.githubLink = "GitHub bağlantısı zorunludur.";
    } else if (!formData.githubLink.trim().startsWith("https://github.com/")) {
      tempErrors.githubLink =
        "GitHub bağlantısı 'https://github.com/' ile başlamalıdır.";
    }

    // Demo Link Validation (optional but must be valid if exists)
    if (formData.demoLink.trim()) {
      const urlPattern =
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(formData.demoLink)) {
        tempErrors.demoLink = "Geçerli bir HTTP/HTTPS bağlantısı giriniz.";
      }
    }

    // Ethics Check Rule: Mandatory if Vibe Coding theme is selected
    if (formData.tema === "vibe-coding" && !formData.etikKontrol) {
      tempErrors.etikKontrol =
        "Vibe Coding teması seçildiğinde Etik Kontrol beyanı zorunludur.";
    }

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

  const handleFileChange = (e, fileType) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (fileType === "image") {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(selectedFile.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Sadece JPG, PNG, GIF veya WEBP formatı kabul edilir.",
        }));
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Ekran görüntüsü 5 MB'tan büyük olamaz.",
        }));
        return;
      }
      setErrors((prev) => {
        const c = { ...prev };
        delete c.image;
        return c;
      });
      setImageFile(selectedFile);
    } else if (fileType === "prompt") {
      // Allow markdown or text files for prompt archives
      const fileName = selectedFile.name.toLowerCase();
      if (!fileName.endsWith(".md") && !fileName.endsWith(".txt")) {
        setErrors((prev) => ({
          ...prev,
          prompt: "Prompt dosyası sadece .md veya .txt formatında olabilir.",
        }));
        return;
      }
      if (selectedFile.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          prompt: "Prompt dosyası 2 MB'tan büyük olamaz.",
        }));
        return;
      }
      setErrors((prev) => {
        const c = { ...prev };
        delete c.prompt;
        return c;
      });
      setPromptFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // 1. Process files
      let gorselUrl = "";
      let promptDosyaUrl = "";

      if (imageFile) {
        gorselUrl = await uploadFile(imageFile, "projects");
      }
      if (promptFile) {
        promptDosyaUrl = await uploadFile(promptFile, "prompts");
      }

      // 2. Parse cities
      const katilimciIller = formData.katilimciIllerStr
        .split(",")
        .map((city) => city.trim())
        .filter((city) => city.length > 0);

      // 3. Destructure and upload
      const cleanData = { ...formData };
      delete cleanData.katilimciIllerStr;

      await addProject({
        ...cleanData,
        katilimciIller,
        gorselUrl,
        promptDosyaUrl,
      });

      setSuccess(true);
      setTimeout(() => {
        setModalType(null);
      }, 2500);
    } catch (error) {
      console.error("Proje Kayıt Hatası:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Kayıt gönderilirken hata oluştu: " + error.message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setModalType(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Yeni Proje Kaydet</h3>
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
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={24} />
                </div>
              </div>
              <h4>Başvurunuz Alındı!</h4>
              <p style={{ marginTop: "8px", fontSize: "14px" }}>
                Projeniz moderatör onayına gönderildi. Onaylandıktan sonra
                haritada ve listelerde görüntülenecektir.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div
                  className="form-error"
                  style={{ marginBottom: "16px", fontSize: "14px" }}
                >
                  {errors.submit}
                </div>
              )}

              {/* Project Name */}
              <div className="form-group">
                <label className="form-label">
                  Proje Adı <span>*</span>
                </label>
                <input
                  type="text"
                  name="ad"
                  className="form-control"
                  value={formData.ad}
                  onChange={handleInputChange}
                  placeholder="Örn: GençTek Akıllı Sulama Projesi"
                />
                {errors.ad && <span className="form-error">{errors.ad}</span>}
              </div>

              {/* Connected Event & Theme */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Bağlı Olduğu Etkinlik</label>
                  <select
                    name="etkinlikId"
                    className="form-control"
                    value={formData.etkinlikId}
                    onChange={handleInputChange}
                  >
                    <option value="">Seçim Yapılmadı</option>
                    {approvedEvents.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.ad}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Tema <span>*</span>
                  </label>
                  <select
                    name="tema"
                    className="form-control"
                    value={formData.tema}
                    onChange={handleInputChange}
                  >
                    <option value="">Tema Seçin</option>
                    {themes.map((t) => (
                      <option key={t.kisaKod} value={t.kisaKod}>
                        {t.ad}
                      </option>
                    ))}
                  </select>
                  {errors.tema && (
                    <span className="form-error">{errors.tema}</span>
                  )}
                </div>
              </div>

              {/* Parkur & Team Name & Participant Cities */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Parkur / Kategori</label>
                  <input
                    type="text"
                    name="parkur"
                    className="form-control"
                    value={formData.parkur}
                    onChange={handleInputChange}
                    placeholder="Örn: Web Geliştirme, Robotik"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Takım Adı <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="takimAdi"
                    className="form-control"
                    value={formData.takimAdi}
                    onChange={handleInputChange}
                    placeholder="Örn: GençTek Yıldızları"
                  />
                  {errors.takimAdi && (
                    <span className="form-error">{errors.takimAdi}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Katılımcı İller <span>*</span>
                </label>
                <input
                  type="text"
                  name="katilimciIllerStr"
                  className="form-control"
                  value={formData.katilimciIllerStr}
                  onChange={handleInputChange}
                  placeholder="Virgülle ayırarak yazın. Örn: İstanbul, Ankara, İzmir"
                />
                <span className="form-hint">
                  Projedeki öğrencilerin bulunduğu tüm illeri giriniz.
                </span>
                {errors.katilimciIller && (
                  <span className="form-error">{errors.katilimciIller}</span>
                )}
              </div>

              {/* Project Description */}
              <div className="form-group">
                <label className="form-label">
                  Proje Açıklaması <span>*</span>
                </label>
                <textarea
                  name="aciklama"
                  className="form-control"
                  rows="3"
                  value={formData.aciklama}
                  onChange={handleInputChange}
                  placeholder="Projenin amacı ve işlevleri..."
                ></textarea>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "4px",
                  }}
                >
                  <span className="form-hint">En fazla 1000 karakter</span>
                  <span
                    className="form-hint"
                    style={{
                      color:
                        formData.aciklama.length > 1000
                          ? "var(--danger)"
                          : undefined,
                    }}
                  >
                    {formData.aciklama.length}/1000
                  </span>
                </div>
                {errors.aciklama && (
                  <span className="form-error">{errors.aciklama}</span>
                )}
              </div>

              {/* GitHub and Demo Links */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label className="form-label">
                    GitHub Bağlantısı <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="githubLink"
                    className="form-control"
                    value={formData.githubLink}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username/project"
                  />
                  {errors.githubLink && (
                    <span className="form-error">{errors.githubLink}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Demo Bağlantısı</label>
                  <input
                    type="text"
                    name="demoLink"
                    className="form-control"
                    value={formData.demoLink}
                    onChange={handleInputChange}
                    placeholder="https://project-demo.web.app"
                  />
                  {errors.demoLink && (
                    <span className="form-error">{errors.demoLink}</span>
                  )}
                </div>
              </div>

              {/* Screen capture & Prompt Archive Upload */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Ekran Görüntüsü Yükle</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      className="file-upload-input"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "image")}
                    />
                    <div
                      className="file-upload-btn"
                      style={{ padding: "16px 8px" }}
                    >
                      <Upload
                        size={18}
                        style={{ color: "var(--text-muted)" }}
                      />
                      <span style={{ fontSize: "12px", fontWeight: "500" }}>
                        {imageFile
                          ? imageFile.name.substring(0, 20) + "..."
                          : "Görsel Seç"}
                      </span>
                    </div>
                  </div>
                  {errors.image && (
                    <span className="form-error">{errors.image}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Prompt Dosyası (.md/.txt)
                  </label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      className="file-upload-input"
                      accept=".md,.txt"
                      onChange={(e) => handleFileChange(e, "prompt")}
                    />
                    <div
                      className="file-upload-btn"
                      style={{ padding: "16px 8px" }}
                    >
                      <Upload
                        size={18}
                        style={{ color: "var(--text-muted)" }}
                      />
                      <span style={{ fontSize: "12px", fontWeight: "500" }}>
                        {promptFile
                          ? promptFile.name.substring(0, 20) + "..."
                          : "Prompt Belgesi Seç"}
                      </span>
                    </div>
                  </div>
                  {errors.prompt && (
                    <span className="form-error">{errors.prompt}</span>
                  )}
                </div>
              </div>

              {/* Ethics Check Checkbox */}
              <div
                className="form-checkbox-group"
                style={{
                  border: "1px solid var(--border-color)",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor:
                    formData.tema === "vibe-coding"
                      ? "var(--primary-light)"
                      : "#fafbfc",
                }}
              >
                <input
                  type="checkbox"
                  name="etikKontrol"
                  id="ethics-check"
                  checked={formData.etikKontrol}
                  onChange={handleInputChange}
                />
                <label
                  htmlFor="ethics-check"
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: "700",
                      color: "var(--secondary)",
                      marginBottom: "4px",
                    }}
                  >
                    <Shield
                      size={14}
                      className="text-primary"
                      style={{ color: "var(--primary)" }}
                    />
                    Etik ve AI Kullanım Kontrol Listesini onaylıyorum.
                    {formData.tema === "vibe-coding" && (
                      <span style={{ color: "var(--danger)" }}>*</span>
                    )}
                  </span>
                  <br />
                  Yapay zeka çıktılarının doğruluğunu kontrol ettiğimi, kodları
                  test ettiğimi, promptları arşivlediğimi ve telif haklarına
                  uyduğumu beyan ederim.
                </label>
              </div>
              {errors.etikKontrol && (
                <span
                  className="form-error"
                  style={{ display: "block", marginTop: "6px" }}
                >
                  {errors.etikKontrol}
                </span>
              )}

              {/* Form Actions */}
              <div className="form-actions">
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

export default ProjectForm;
