import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { X, Check, Trash } from "lucide-react";
import { db, auth } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getCityCoords, getSchoolCoords } from "../utils/mapUtils";

const EventForm = () => {
  const {
    themes,
    cities,
    allEventsRaw,
    schoolsData,
    schoolsLoading,
    loadSchoolsForCity,
    addEvent,
    updateEvent,
    editingEvent,
    setEditingEvent,
    uploadFile,
    setModalType,
  } = useApp();

  const [formData, setFormData] = useState({
    ad: "",
    tema: "",
    format: "",
    il: "",
    ilce: "",
    kapsam: "il", // il | ilce | okul | turkiye
    durum: "gerceklesti", // gerceklesti | duyuru
    duyuruEtkinlikId: "",
    ogrenciSiniri: "",
    ilKisitlama: false,
    ilceKisitlama: false,
    detay: "",
    tarih: "",
    katilimciSayisi: "",
    aciklama: "",
    baglanti: "",
    enlem: "",
    boylam: "",
  });

  const [selectedSchoolName, setSelectedSchoolName] = useState("");
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [isSchoolListOpen, setIsSchoolListOpen] = useState(false);
  const [selectedOrganizerCity, setSelectedOrganizerCity] = useState("");
  const [organizerCities, setOrganizerCities] = useState([]); // Array of additional organizer cities
  const [file, setFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [participatingSchools, setParticipatingSchools] = useState([]); // [{ okulAdi: "", katilimciSayisi: "" }]
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [allCitiesSchools, setAllCitiesSchools] = useState([]);
  const [isAllSchoolsLoading, setIsAllSchoolsLoading] = useState(false);
  const [activeParticipatingSearchIdx, setActiveParticipatingSearchIdx] = useState(null);
  const [participatingSearchQuery, setParticipatingSearchQuery] = useState("");
  const [LLib, setLLib] = useState(null);
  const formMapRef = useRef(null);
  const formMarkerRef = useRef(null);

  // Load schools for all selected cities (main city + collaborative cities)
  useEffect(() => {
    const loadAllSchools = async () => {
      const citiesToLoad = Array.from(new Set([formData.il, ...organizerCities])).filter(Boolean);
      if (citiesToLoad.length === 0) {
        setAllCitiesSchools([]);
        return;
      }
      setIsAllSchoolsLoading(true);
      try {
        let tempSchools = [];
        for (const cityAd of citiesToLoad) {
          const matchedCity = cities.find(
            (c) => c.ad.toLowerCase() === cityAd.toLowerCase()
          );
          if (!matchedCity) continue;

          // 1. Fetch static schools
          let staticData = {};
          try {
            const response = await fetch(`/data/schools/${matchedCity.plaka}.json`);
            if (response.ok) {
              staticData = await response.json();
            }
          } catch (e) {
            console.error(`${cityAd} okulları fetch edilemedi:`, e);
          }

          // 2. Fetch custom schools
          let customSchoolsList = [];
          if (auth && auth.config && !auth.config.apiKey.includes("DummyKey")) {
            try {
              const q = query(
                collection(db, "custom_schools"),
                where("il", "==", cityAd)
              );
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach((doc) => {
                customSchoolsList.push({ id: doc.id, ...doc.data() });
              });
            } catch (e) {
              console.error(`${cityAd} custom okulları yüklenemedi:`, e);
            }
          } else {
            const localSchools = localStorage.getItem("mock_custom_schools");
            if (localSchools) {
              customSchoolsList = JSON.parse(localSchools).filter(
                (s) => s.il.toLowerCase() === cityAd.toLowerCase()
              );
            }
          }

          // Merge static and custom
          const mergedData = JSON.parse(JSON.stringify(staticData));
          customSchoolsList.forEach((customSchool) => {
            const district = customSchool.ilce.toUpperCase();
            if (!mergedData[district]) {
              mergedData[district] = [];
            }
            if (customSchool.originalId) {
              const idx = mergedData[district].findIndex(
                (s) => s.id === customSchool.originalId || s.ad === customSchool.originalAd
              );
              if (idx !== -1) {
                mergedData[district][idx] = {
                  id: customSchool.id,
                  ad: customSchool.ad,
                  website: customSchool.website,
                };
                return;
              }
            }
            const exists = mergedData[district].some((s) => s.ad === customSchool.ad);
            if (!exists) {
              mergedData[district].push({
                id: customSchool.id,
                ad: customSchool.ad,
                website: customSchool.website,
              });
            }
          });

          // Add to tempSchools
          Object.keys(mergedData).forEach((dist) => {
            mergedData[dist].forEach((school, index) => {
              tempSchools.push({
                id: school.id || `static-${matchedCity.plaka}-${dist.toLowerCase()}-${index}`,
                ad: school.ad,
                il: cityAd,
                ilce: dist,
              });
            });
          });
        }
        setAllCitiesSchools(tempSchools.sort((a, b) => a.ad.localeCompare(b.ad)));
      } catch (err) {
        console.error("Okul yükleme hatası:", err);
      } finally {
        setIsAllSchoolsLoading(false);
      }
    };

    loadAllSchools();
  }, [formData.il, organizerCities, cities]);

  // 1. Load Leaflet library dynamically (avoids SSR issues)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        if (!cancelled) setLLib(L);
      } catch (err) {
        console.error("Form harita kütüphanesi yüklenemedi:", err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 2. Initialise form map
  useEffect(() => {
    if (!LLib || formMapRef.current) return;

    // Check if form-map element exists
    const mapElement = document.getElementById("form-map");
    if (!mapElement) return;

    // Default center
    const center = [39.1, 35.0];
    const map = LLib.map("form-map", {
      center: center,
      zoom: 5,
      zoomControl: true,
    });

    LLib.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    // Click handler to place marker
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      setFormData((prev) => ({
        ...prev,
        enlem: lat.toFixed(6),
        boylam: lng.toFixed(6),
      }));

      if (formMarkerRef.current) {
        formMarkerRef.current.setLatLng(e.latlng);
      } else {
        const marker = LLib.marker(e.latlng, {
          icon: LLib.divIcon({
            html: `<div style="background-color: #d90429; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
            className: "",
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })
        }).addTo(map);
        formMarkerRef.current = marker;
      }
    });

    formMapRef.current = map;

    return () => {
      if (formMapRef.current) {
        formMapRef.current.remove();
        formMapRef.current = null;
      }
      formMarkerRef.current = null;
    };
  }, [LLib, formData.il]);

  // 3. Fly to selected city and place default pin if none exists
  useEffect(() => {
    if (!formMapRef.current || !formData.il || !LLib) return;

    const { lat, lng } = getCityCoords(formData.il);
    formMapRef.current.flyTo([lat, lng], 10, { duration: 1.0 });

    // Set default coordinates if not already set
    if (!formData.enlem && !formData.boylam) {
      setFormData((prev) => ({
        ...prev,
        enlem: lat.toFixed(6),
        boylam: lng.toFixed(6),
      }));

      const latlng = [lat, lng];
      if (formMarkerRef.current) {
        formMarkerRef.current.setLatLng(latlng);
      } else {
        const marker = LLib.marker(latlng, {
          icon: LLib.divIcon({
            html: `<div style="background-color: #d90429; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
            className: "",
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })
        }).addTo(formMapRef.current);
        formMarkerRef.current = marker;
      }
    }
  }, [formData.il, LLib]); // eslint-disable-line react-hooks/exhaustive-deps

  // 4. Initialise existing coordinates marker if editing
  useEffect(() => {
    if (!formMapRef.current || !LLib) return;
    if (formData.enlem && formData.boylam) {
      const latlng = [Number(formData.enlem), Number(formData.boylam)];
      formMapRef.current.setView(latlng, 10);
      if (formMarkerRef.current) {
        formMarkerRef.current.setLatLng(latlng);
      } else {
        const marker = LLib.marker(latlng, {
          icon: LLib.divIcon({
            html: `<div style="background-color: #d90429; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
            className: "",
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })
        }).addTo(formMapRef.current);
        formMarkerRef.current = marker;
      }
    }
  }, [LLib, formData.enlem, formData.boylam]);

  // 4b. Set default coordinates for selected school if none are set
  useEffect(() => {
    if (formData.kapsam === "okul" && selectedSchoolName && schools.length > 0 && !formData.enlem && !formData.boylam && LLib && formMapRef.current) {
      const schoolObj = schools.find((s) => s.ad === selectedSchoolName);
      if (schoolObj) {
        const { lat, lng } = getSchoolCoords(schoolObj, formData.il);
        
        setFormData((prev) => ({
          ...prev,
          enlem: lat.toFixed(6),
          boylam: lng.toFixed(6),
        }));

        const latlng = [lat, lng];
        formMapRef.current.setView(latlng, 12);

        if (formMarkerRef.current) {
          formMarkerRef.current.setLatLng(latlng);
        } else {
          const marker = LLib.marker(latlng, {
            icon: LLib.divIcon({
              html: `<div style="background-color: #d90429; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
              className: "",
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            })
          }).addTo(formMapRef.current);
          formMarkerRef.current = marker;
        }
      }
    }
  }, [formData.kapsam, selectedSchoolName, schools, formData.enlem, formData.boylam, formData.il, LLib]);


  // Sync search query when school name changes
  useEffect(() => {
    if (selectedSchoolName) {
      setSchoolSearchQuery(selectedSchoolName);
    } else {
      setSchoolSearchQuery("");
    }
  }, [selectedSchoolName]);

  // Filtered schools based on search query with Turkish character support
  const filteredSchools = schools.filter((s) =>
    s.ad.toLowerCase()
      .replace(/i/g, "i").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g")
      .includes(
        schoolSearchQuery.toLowerCase()
          .replace(/i/g, "i").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g")
      )
  );

  // Load districts and schools when city changes
  useEffect(() => {
    if (formData.il) {
      loadSchoolsForCity(formData.il);
      setFormData((prev) => ({ ...prev, ilce: "", okul: null }));
      setSelectedSchoolName("");
    } else {
      setDistricts([]);
      setSchools([]);
    }
  }, [formData.il, loadSchoolsForCity]);

  // Extract districts when schoolsData changes
  useEffect(() => {
    if (schoolsData && Object.keys(schoolsData).length > 0) {
      setDistricts(Object.keys(schoolsData).sort());
    } else {
      setDistricts([]);
    }
  }, [schoolsData]);

  // Extract schools when district changes
  useEffect(() => {
    if (formData.ilce && schoolsData[formData.ilce]) {
      setSchools(schoolsData[formData.ilce].sort((a, b) => a.ad.localeCompare(b.ad)));
      setSelectedSchoolName("");
    } else {
      setSchools([]);
    }
  }, [formData.ilce, schoolsData]);

  // On city or district constraint change
  useEffect(() => {
    if (formData.durum !== "duyuru") {
      setFormData((prev) => ({ ...prev, ilKisitlama: false, ilceKisitlama: false }));
    }
  }, [formData.durum]);

  // Load existing event data if in editing mode
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        ad: editingEvent.ad || "",
        tema: editingEvent.tema || "",
        format: editingEvent.format || "",
        il: editingEvent.il || "",
        ilce: editingEvent.ilce || "",
        kapsam: editingEvent.kapsam || "il",
        durum: editingEvent.durum || "gerceklesti",
        duyuruEtkinlikId: editingEvent.duyuruEtkinlikId || "",
        ogrenciSiniri: editingEvent.ogrenciSiniri || "",
        ilKisitlama: editingEvent.basvuruKisitlama?.ilKisitlama || false,
        ilceKisitlama: editingEvent.basvuruKisitlama?.ilceKisitlama || false,
        detay: editingEvent.detay || "",
        tarih: editingEvent.tarih || "",
        katilimciSayisi: editingEvent.katilimciSayisi || "",
        aciklama: editingEvent.aciklama || "",
        baglanti: editingEvent.baglanti || "",
        enlem: editingEvent.enlem || "",
        boylam: editingEvent.boylam || "",
      });

      if (editingEvent.kapsam === "okul" && editingEvent.okul) {
        setSelectedSchoolName(editingEvent.okul.ad || "");
      }

      if (editingEvent.duzenleyenIller) {
        const others = editingEvent.duzenleyenIller.filter((c) => c !== editingEvent.il);
        setOrganizerCities(others);
      }

      if (editingEvent.katilanOkullar) {
        setParticipatingSchools(editingEvent.katilanOkullar);
      }
    }
  }, [editingEvent]);

  const addOrganizerCity = () => {
    if (selectedOrganizerCity && !organizerCities.includes(selectedOrganizerCity) && selectedOrganizerCity !== formData.il) {
      setOrganizerCities((prev) => [...prev, selectedOrganizerCity]);
      setSelectedOrganizerCity("");
    }
  };

  const removeOrganizerCity = (city) => {
    setOrganizerCities((prev) => prev.filter((c) => c !== city));
  };

  const handleClose = () => {
    setEditingEvent(null);
    setModalType(null);
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.ad.trim()) tempErrors.ad = "Etkinlik adı zorunludur.";
    if (!formData.tema) tempErrors.tema = "Tema seçimi zorunludur.";
    if (!formData.format) tempErrors.format = "Format seçimi zorunludur.";
    if (!formData.il) tempErrors.il = "Ana düzenleyici il seçimi zorunludur.";

    if (formData.kapsam === "ilce" || formData.kapsam === "okul") {
      if (!formData.ilce) tempErrors.ilce = "İlçe seçimi zorunludur.";
    }

    if (formData.kapsam === "okul") {
      if (!selectedSchoolName) tempErrors.okul = "Okul seçimi zorunludur.";
    }

    if (formData.durum === "duyuru" && formData.ogrenciSiniri) {
      const limit = Number(formData.ogrenciSiniri);
      if (isNaN(limit) || limit <= 0) {
        tempErrors.ogrenciSiniri = "Öğrenci sınırı pozitif bir sayı olmalıdır.";
      }
    }

    if (!formData.tarih) tempErrors.tarih = "Tarih zorunludur.";

    const count = Number(formData.katilimciSayisi);
    if (formData.durum === "gerceklesti") {
      if (!formData.katilimciSayisi) {
        tempErrors.katilimciSayisi = "Katılımcı sayısı zorunludur.";
      } else if (isNaN(count) || count < 0 || count > 50000) {
        tempErrors.katilimciSayisi = "Katılımcı sayısı 0 ile 50000 arasında olmalıdır.";
      }
    }

    if (!formData.aciklama.trim()) {
      tempErrors.aciklama = "Özet açıklama zorunludur.";
    } else if (formData.aciklama.length > 500) {
      tempErrors.aciklama = "Özet açıklama en fazla 500 karakter olabilir.";
    }

    if (formData.baglanti.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(formData.baglanti)) {
        tempErrors.baglanti = "Geçerli bir URL giriniz.";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchoolName(school.ad);
    setSchoolSearchQuery(school.ad);
    setIsSchoolListOpen(false);

    if (LLib && formMapRef.current) {
      const { lat, lng } = getSchoolCoords(school, formData.il);
      
      setFormData((prev) => ({
        ...prev,
        enlem: lat.toFixed(6),
        boylam: lng.toFixed(6),
      }));

      const latlng = [lat, lng];
      formMapRef.current.flyTo(latlng, 12, { duration: 1.0 });

      if (formMarkerRef.current) {
        formMarkerRef.current.setLatLng(latlng);
      } else {
        const marker = LLib.marker(latlng, {
          icon: LLib.divIcon({
            html: `<div style="background-color: #d90429; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
            className: "",
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })
        }).addTo(formMapRef.current);
        formMarkerRef.current = marker;
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles((prev) => [...prev, ...files]);
  };

  const removeGalleryFile = (idx) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddSchoolRow = () => {
    setParticipatingSchools((prev) => [...prev, { okulAdi: "", katilimciSayisi: "" }]);
  };

  const handleSchoolRowChange = (idx, field, value) => {
    const updated = [...participatingSchools];
    updated[idx][field] = value;
    setParticipatingSchools(updated);
  };

  const handleRemoveSchoolRow = (idx) => {
    setParticipatingSchools((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let gorselUrl = "";
      if (file) {
        gorselUrl = await uploadFile(file);
      }

      const galeri = [];
      for (const galleryFile of galleryFiles) {
        const url = await uploadFile(galleryFile);
        galeri.push(url);
      }

      // Map school object if scope is school
      let schoolObj = null;
      if (formData.kapsam === "okul" && selectedSchoolName) {
        const found = schools.find((s) => s.ad === selectedSchoolName);
        schoolObj = {
          ad: selectedSchoolName,
          website: found ? found.website : "",
        };
      }

      // Merge main city and collaborative organizer cities into duzenleyenIller array
      const allOrganizerCities = Array.from(
        new Set([formData.il, ...organizerCities])
      ).filter(Boolean);

      const eventPayload = {
        ad: formData.ad,
        tema: formData.tema,
        format: formData.format,
        il: formData.il,
        ilce: formData.ilce,
        kapsam: formData.kapsam,
        durum: formData.durum,
        duyuruEtkinlikId: formData.durum === "gerceklesti" ? formData.duyuruEtkinlikId : "",
        ogrenciSiniri: formData.durum === "duyuru" && formData.ogrenciSiniri ? Number(formData.ogrenciSiniri) : null,
        basvuruKisitlama: formData.durum === "duyuru" ? {
          ilKisitlama: formData.ilKisitlama,
          ilceKisitlama: formData.ilceKisitlama,
        } : null,
        detay: formData.detay,
        tarih: formData.tarih,
        katilimciSayisi: formData.durum === "gerceklesti" ? Number(formData.katilimciSayisi) : 0,
        aciklama: formData.aciklama,
        baglanti: formData.baglanti,
        katilanOkullar: formData.durum === "gerceklesti" && participatingSchools.length > 0
          ? participatingSchools.map((s) => ({ okulAdi: s.okulAdi, katilimciSayisi: Number(s.katilimciSayisi) || 0 }))
          : null,
        okul: schoolObj,
        duzenleyenIller: allOrganizerCities,
        enlem: formData.enlem ? Number(formData.enlem) : null,
        boylam: formData.boylam ? Number(formData.boylam) : null,
      };

      if (editingEvent) {
        const finalPayload = {
          ...eventPayload,
          gorselUrl: gorselUrl || editingEvent.gorselUrl || "",
          galeri: galeri.length > 0 ? galeri : (editingEvent.galeri || []),
        };
        await updateEvent(editingEvent.id, finalPayload);
        setEditingEvent(null);
      } else {
        const finalPayload = {
          ...eventPayload,
          gorselUrl: gorselUrl || "",
          galeri: galeri,
        };
        await addEvent(finalPayload);
      }

      setSuccess(true);
      setTimeout(() => {
        setModalType(null);
      }, 2500);
    } catch (error) {
      console.error("Etkinlik Kayıt Hatası:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Kayıt gönderilirken hata oluştu: " + error.message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter approved announcements to link with a new event report
  const approvedAnnouncements = allEventsRaw.filter(
    (e) => e.durum === "duyuru" && e.onaylandi
  );

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "800px", width: "95%", height: "85vh", display: "flex", flexDirection: "column" }}
      >
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <h3>{editingEvent ? "Etkinliği Düzenle" : "Yeni Etkinlik Kaydı"}</h3>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ flexGrow: 1, overflowY: "auto", padding: "24px" }}>
          {success ? (
            <div className="empty-state" style={{ borderColor: "var(--success)", color: "var(--secondary)", padding: "40px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Check size={24} />
              </div>
              <h4>{editingEvent ? "Etkinlik Güncellendi!" : "Başvurunuz Alındı!"}</h4>
              <p style={{ marginTop: "8px", fontSize: "14px" }}>
                {editingEvent
                  ? "Etkinlik başarıyla güncellenmiştir."
                  : "Etkinlik kaydı başarıyla onaylanmak üzere moderatör onayına gönderilmiştir."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {errors.submit && <div className="form-error">{errors.submit}</div>}

              {/* Event Name */}
              <div className="form-group">
                <label className="form-label">Etkinlik Adı *</label>
                <input
                  type="text"
                  name="ad"
                  className="form-control"
                  value={formData.ad}
                  onChange={handleInputChange}
                  placeholder="Örn: GençTek Vibe Coding Geliştirme Kampı"
                />
                {errors.ad && <span className="form-error">{errors.ad}</span>}
              </div>

              {/* Scope & Status & Themes Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Kapsam *</label>
                  <select name="kapsam" className="form-control" value={formData.kapsam} onChange={handleInputChange}>
                    <option value="il">İl Etkinliği</option>
                    <option value="ilce">İlçe Etkinliği</option>
                    <option value="okul">Okul Etkinliği</option>
                    <option value="turkiye">Türkiye Geneli</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Durum *</label>
                  <select name="durum" className="form-control" value={formData.durum} onChange={handleInputChange}>
                    <option value="gerceklesti">Gerçekleşti (Haber / Rapor)</option>
                    <option value="duyuru">Ön Duyuru (Katılım Başvurusu Aç)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tema *</label>
                  <select name="tema" className="form-control" value={formData.tema} onChange={handleInputChange}>
                    <option value="">Tema Seçin</option>
                    {themes.map((t) => (
                      <option key={t.kisaKod} value={t.kisaKod}>{t.ad}</option>
                    ))}
                  </select>
                  {errors.tema && <span className="form-error">{errors.tema}</span>}
                </div>
              </div>

              {/* Linkage to previous announcement */}
              {formData.durum === "gerceklesti" && approvedAnnouncements.length > 0 && (
                <div className="form-group">
                  <label className="form-label">İlişkili Etkinlik Duyurusu (İsteğe Bağlı)</label>
                  <select
                    name="duyuruEtkinlikId"
                    className="form-control"
                    value={formData.duyuruEtkinlikId}
                    onChange={handleInputChange}
                  >
                    <option value="">Seçilmedi (Yeni Bağımsız Etkinlik)</option>
                    {approvedAnnouncements.map((e) => (
                      <option key={e.id} value={e.id}>{e.ad} ({e.il})</option>
                    ))}
                  </select>
                  <span className="form-hint">Duyuru aşamasında başvuruları alınan etkinlik tamamlandığında, burası seçilerek ilişki kurulmalıdır.</span>
                </div>
              )}

              {/* Student limits and application restrictions */}
              {formData.durum === "duyuru" && (
                <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Öğrenci Kontenjan Sınırı (Opsiyonel)</label>
                    <input
                      type="number"
                      name="ogrenciSiniri"
                      className="form-control"
                      value={formData.ogrenciSiniri}
                      onChange={handleInputChange}
                      placeholder="Maksimum katılabilecek öğrenci sayısı (Örn: 50)"
                    />
                    {errors.ogrenciSiniri && <span className="form-error">{errors.ogrenciSiniri}</span>}
                  </div>

                  <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        name="ilKisitlama"
                        checked={formData.ilKisitlama}
                        onChange={handleInputChange}
                      />
                      Başvuruları Sadece Bu İl İle Kısıtla
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        name="ilceKisitlama"
                        checked={formData.ilceKisitlama}
                        disabled={formData.kapsam === "il" || formData.kapsam === "turkiye"}
                        onChange={handleInputChange}
                      />
                      Başvuruları Sadece Bu İlçe İle Kısıtla
                    </label>
                  </div>
                </div>
              )}

              {/* Primary organizer city and dynamic collaborative cities */}
              <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Ana Düzenleyici İl *</label>
                    <select name="il" className="form-control" value={formData.il} onChange={handleInputChange}>
                      <option value="">İl Seçin</option>
                      {cities.map((c) => (
                        <option key={c.plaka} value={c.ad}>{c.ad}</option>
                      ))}
                    </select>
                    {errors.il && <span className="form-error">{errors.il}</span>}
                  </div>

                  {/* Collaborative Organizer City Selection */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Ortak Düzenleyen İl Ekle (İsteğe Bağlı)</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <select
                        className="form-control"
                        value={selectedOrganizerCity}
                        onChange={(e) => setSelectedOrganizerCity(e.target.value)}
                        style={{ margin: 0 }}
                      >
                        <option value="">İl Seçin</option>
                        {cities
                          .filter((c) => c.ad !== formData.il && !organizerCities.includes(c.ad))
                          .map((c) => (
                            <option key={c.plaka} value={c.ad}>{c.ad}</option>
                          ))}
                      </select>
                      <button
                        type="button"
                        className="card-btn secondary"
                        onClick={addOrganizerCity}
                        style={{ padding: "8px 16px" }}
                      >
                        Ekle
                      </button>
                    </div>
                  </div>
                </div>

                {/* Organizer Cities Tags/Chips Display */}
                {organizerCities.length > 0 && (
                  <div>
                    <span className="form-hint" style={{ display: "block", marginBottom: "6px" }}>Ortak Düzenleyen İller:</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {organizerCities.map((city) => (
                        <span
                          key={city}
                          className="card-badge"
                          style={{
                            backgroundColor: "var(--primary-light)",
                            color: "var(--primary)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "50px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {city}
                          <button
                            type="button"
                            onClick={() => removeOrganizerCity(city)}
                            style={{
                              border: "none",
                              background: "none",
                              color: "var(--primary)",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "bold",
                              padding: 0,
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Event Location Map Selector */}
              {formData.il && (
                <div className="form-group" style={{ marginTop: "12px" }}>
                  <label className="form-label">Haritadan Etkinlik Konumu Seçin</label>
                  <span className="form-hint" style={{ display: "block", marginBottom: "8px" }}>
                    Haritada etkinlik yerinin üzerine tıklayarak kırmızı pin (konum işareti) bırakabilirsiniz.
                  </span>
                  <div 
                    id="form-map" 
                    style={{ 
                      height: "220px", 
                      width: "100%", 
                      borderRadius: "var(--radius-md)", 
                      border: "1px solid var(--border-color)",
                      zIndex: 10
                    }} 
                  />
                  {(formData.enlem || formData.boylam) && (
                    <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <span><strong>Enlem:</strong> {formData.enlem}</span>
                      <span><strong>Boylam:</strong> {formData.boylam}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Location selectors based on scope */}
              {(formData.kapsam === "ilce" || formData.kapsam === "okul") && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">İlçe *</label>
                    <select
                      name="ilce"
                      className="form-control"
                      value={formData.ilce}
                      onChange={handleInputChange}
                      disabled={!formData.il || schoolsLoading}
                    >
                      <option value="">{schoolsLoading ? "Yükleniyor..." : "İlçe Seçin"}</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {errors.ilce && <span className="form-error">{errors.ilce}</span>}
                  </div>
                </div>
              )}

              {formData.kapsam === "okul" && formData.ilce && (
                <div className="form-group">
                  <label className="form-label">Okul *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={schoolsLoading ? "Okullar yükleniyor..." : "Okul adı ile arayın veya listeden seçin..."}
                      value={schoolSearchQuery}
                      onChange={(e) => {
                        setSchoolSearchQuery(e.target.value);
                        setIsSchoolListOpen(true);
                        if (!e.target.value.trim()) {
                          setSelectedSchoolName("");
                        }
                      }}
                      onFocus={() => setIsSchoolListOpen(true)}
                      onBlur={() => setTimeout(() => setIsSchoolListOpen(false), 200)}
                      disabled={schoolsLoading}
                      style={{ marginBottom: 0 }}
                    />
                    
                    {/* Açılır Arama Listesi */}
                    {isSchoolListOpen && !schoolsLoading && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 100,
                          backgroundColor: "#fff",
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-sm)",
                          boxShadow: "var(--shadow-md)",
                          maxHeight: "200px",
                          overflowY: "auto",
                          marginTop: "4px",
                        }}
                      >
                        {filteredSchools.length === 0 ? (
                          <div style={{ padding: "10px 12px", color: "var(--text-muted)", fontSize: "13px" }}>
                            Eşleşen okul bulunamadı.
                          </div>
                        ) : (
                          filteredSchools.map((s) => (
                            <div
                              key={s.id || s.ad}
                              style={{
                                padding: "10px 12px",
                                cursor: "pointer",
                                fontSize: "13px",
                                borderBottom: "1px solid var(--border-color)",
                                backgroundColor: selectedSchoolName === s.ad ? "var(--primary-light)" : "transparent",
                                color: selectedSchoolName === s.ad ? "var(--primary)" : "var(--text-main)",
                              }}
                              onMouseDown={() => {
                                handleSchoolSelect(s);
                              }}
                            >
                              {s.ad}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {errors.okul && <span className="form-error">{errors.okul}</span>}
                </div>
              )}

              {/* General format & Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Format *</label>
                  <select name="format" className="form-control" value={formData.format} onChange={handleInputChange}>
                    <option value="">Seçin</option>
                    <option value="Yüz Yüze">Yüz Yüze</option>
                    <option value="Çevrimiçi">Çevrimiçi</option>
                    <option value="Hibrit">Hibrit</option>
                  </select>
                  {errors.format && <span className="form-error">{errors.format}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Tarih *</label>
                  <input type="date" name="tarih" className="form-control" value={formData.tarih} onChange={handleInputChange} />
                  {errors.tarih && <span className="form-error">{errors.tarih}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Katılımcı / İzleyici Sayısı {formData.durum === "gerceklesti" && "*"}</label>
                  <input
                    type="number"
                    name="katilimciSayisi"
                    className="form-control"
                    value={formData.katilimciSayisi}
                    disabled={formData.durum === "duyuru"}
                    onChange={handleInputChange}
                    placeholder="Duyurularda 0 giriniz"
                  />
                  {errors.katilimciSayisi && <span className="form-error">{errors.katilimciSayisi}</span>}
                </div>
              </div>

              {/* Summarized desc & Detailed markdown desc */}
              <div className="form-group">
                <label className="form-label">Özet Açıklama *</label>
                <input
                  type="text"
                  name="aciklama"
                  className="form-control"
                  value={formData.aciklama}
                  onChange={handleInputChange}
                  placeholder="Etkinliğin bir cümlelik özeti (Max 500 karakter)"
                />
                {errors.aciklama && <span className="form-error">{errors.aciklama}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Detaylı İçerik (Markdown Destekli)</label>
                <textarea
                  name="detay"
                  className="form-control"
                  rows="4"
                  value={formData.detay}
                  onChange={handleInputChange}
                  placeholder="Etkinliğin detaylı programı, konuşmacılar ve içerik detayları..."
                ></textarea>
              </div>

              {/* Participating school listings (for city/district events) */}
              {formData.durum === "gerceklesti" && (formData.kapsam === "il" || formData.kapsam === "ilce" || formData.kapsam === "turkiye") && (
                <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h5 style={{ margin: 0 }}>
                      Katılan Okul Listesi (Raporlama / İstatistiki Bilgi) {isAllSchoolsLoading && <span style={{ fontSize: "11px", fontWeight: "normal", color: "#666" }}>(Yükleniyor...)</span>}
                    </h5>
                    <button type="button" className="card-btn secondary" onClick={handleAddSchoolRow} style={{ padding: "4px 8px", fontSize: "12px" }}>
                      Okul Ekle
                    </button>
                  </div>

                  {participatingSchools.map((s, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: "10px", alignItems: "center", marginBottom: "8px", position: "relative" }}>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          placeholder="Okul Adı"
                          className="form-control"
                          value={s.okulAdi}
                          onChange={(e) => {
                            handleSchoolRowChange(idx, "okulAdi", e.target.value);
                            setParticipatingSearchQuery(e.target.value);
                          }}
                          onFocus={() => {
                            setActiveParticipatingSearchIdx(idx);
                            setParticipatingSearchQuery(s.okulAdi || "");
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              setActiveParticipatingSearchIdx(null);
                            }, 200);
                          }}
                          style={{ margin: 0, width: "100%" }}
                        />
                        {activeParticipatingSearchIdx === idx && (
                          <div 
                            style={{ 
                              position: "absolute", 
                              zIndex: 1000, 
                              background: "white", 
                              border: "1px solid #ccc", 
                              borderRadius: "4px",
                              width: "100%", 
                              maxHeight: "150px", 
                              overflowY: "auto",
                              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              top: "100%"
                            }}
                          >
                            {allCitiesSchools
                              .filter((school) =>
                                school.ad.toLowerCase()
                                  .replace(/i/g, "i").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g")
                                  .includes((participatingSearchQuery || "").toLowerCase()
                                    .replace(/i/g, "i").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g")
                                  )
                              )
                              .slice(0, 15)
                              .map((school, sIdx) => (
                                <div
                                  key={sIdx}
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // Click olayından önce blur'u engeller
                                  }}
                                  onClick={() => {
                                    handleSchoolRowChange(idx, "okulAdi", school.ad);
                                    setActiveParticipatingSearchIdx(null);
                                  }}
                                  style={{ 
                                    padding: "8px 12px", 
                                    cursor: "pointer", 
                                    borderBottom: "1px solid #eee",
                                    fontSize: "12px",
                                    color: "#333",
                                    textAlign: "left"
                                  }}
                                >
                                  <strong>{school.ad}</strong> <span style={{ color: "#777" }}>({school.il} - {school.ilce})</span>
                                </div>
                              ))}
                            {allCitiesSchools.filter((school) =>
                              school.ad.toLowerCase()
                                .replace(/i/g, "i").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g")
                                .includes((participatingSearchQuery || "").toLowerCase()
                                  .replace(/i/g, "i").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g")
                                )
                            ).length === 0 && (
                              <div style={{ padding: "8px 12px", fontSize: "12px", color: "#999" }}>Okul bulunamadı</div>
                            )}
                          </div>
                        )}
                      </div>
                      <input
                        type="number"
                        placeholder="Katılımcı"
                        className="form-control"
                        value={s.katilimciSayisi}
                        onChange={(e) => handleSchoolRowChange(idx, "katilimciSayisi", e.target.value)}
                        style={{ margin: 0 }}
                      />
                      <button type="button" className="mod-btn reject" onClick={() => handleRemoveSchoolRow(idx)} style={{ padding: "8px" }}>
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Image Upload */}
              <div className="form-group">
                <label className="form-label">Ana Görsel Yükle</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </div>

              {/* Multi-Image Gallery Upload */}
              {formData.durum === "gerceklesti" && (
                <div className="form-group">
                  <label className="form-label">Etkinlik Galeri Resimleri</label>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
                  {galleryFiles.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                      {galleryFiles.map((galleryFile, idx) => (
                        <div key={idx} style={{ position: "relative", width: "80px", height: "80px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                          <img src={URL.createObjectURL(galleryFile)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button
                            type="button"
                            onClick={() => removeGalleryFile(idx)}
                            style={{ position: "absolute", right: "2px", top: "2px", backgroundColor: "rgba(217,4,41,0.8)", border: "none", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "10px" }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Rapor / Web Bağlantısı (URL)</label>
                <input
                  type="text"
                  name="baglanti"
                  className="form-control"
                  value={formData.baglanti}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
                {errors.baglanti && <span className="form-error">{errors.baglanti}</span>}
              </div>

              <div className="form-actions" style={{ flexShrink: 0, marginTop: "16px" }}>
                <button type="button" className="card-btn secondary" onClick={handleClose}>İptal</button>
                <button type="submit" className="card-btn primary" disabled={isSubmitting}>
                  {isSubmitting ? "Kaydet..." : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventForm;
