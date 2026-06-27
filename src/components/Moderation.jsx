import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import {
  Check,
  Trash2,
  Star,
  LogOut,
  Lock,
  X,
  Database,
  FileSpreadsheet,
  Printer,
  Edit2,
  Users as UsersIcon,
  MessageSquare,
  Send,
  Clock,
  User,
  Sparkles,
} from "lucide-react";
import { seedEvents, seedProjects } from "../data/seedData";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import ExportButton from "./ExportButton";

const Moderation = () => {
  const {
    user,
    userRole,
    userProfile,
    loginModerator,
    logoutModerator,
    allEventsRaw,
    allProjectsRaw,
    applications,
    approveItem,
    rejectItem,
    starItem,
    approveApplication,
    rejectApplication,
    setModalType,
    refreshData,
    isUsingMockData,
    cities,
    schoolsData,
    loadSchoolsForCity,
    schoolsLoading,
    addCustomSchool,
    updateCustomSchool,
    deleteEvent,
    setEditingEvent,
    addCoordinator,
    addCommissionMember,
    directMessages,
    chatContacts,
    fetchDirectMessages,
    sendDirectMessage,
    updateUserRole,
    updateModeratorOrCommission,
    deleteModeratorOrCommission,
  } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState("");

  const [activeTab, setActiveTab] = useState("approvals"); // approvals | applications | features | schools | coordinators

  // Custom School Management State
  const [modSelectedCity, setModSelectedCity] = useState("");
  const [modSelectedDistrict, setModSelectedDistrict] = useState("");
  const [schoolForm, setSchoolForm] = useState({ ad: "", website: "" });
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [schoolError, setSchoolError] = useState("");
  const [schoolSuccess, setSchoolSuccess] = useState("");

  // Coordinator Management State
  const [coordForm, setCoordForm] = useState({
    adSoyad: "",
    eposta: "",
    telefon: "",
    il: "",
  });
  const [coordSuccess, setCoordSuccess] = useState("");
  const [coordError, setCoordError] = useState("");

  const [addUserRole, setAddUserRole] = useState(
    userRole === "admin" ? "coordinator" : "commission",
  );
  const [replyText, setReplyText] = useState("");
  const [searchContactQuery, setSearchContactQuery] = useState("");
  const [selectedStudentContact, setSelectedStudentContact] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    adSoyad: "",
    eposta: "",
    telefon: "",
    il: "",
    role: "",
  });

  const [eventIlFilter, setEventIlFilter] = useState("");
  const [eventIlceFilter, setEventIlceFilter] = useState("");
  const [eventDistricts, setEventDistricts] = useState([]);

  useEffect(() => {
    if (eventIlFilter) {
      loadSchoolsForCity(eventIlFilter);
      setTimeout(() => setEventIlceFilter(""), 0);
    } else {
      setTimeout(() => {
        setEventDistricts([]);
        setEventIlceFilter("");
      }, 0);
    }
  }, [eventIlFilter, loadSchoolsForCity]);

  useEffect(() => {
    if (eventIlFilter && schoolsData && Object.keys(schoolsData).length > 0) {
      setTimeout(() => setEventDistricts(Object.keys(schoolsData).sort()), 0);
    } else {
      setTimeout(() => setEventDistricts([]), 0);
    }
  }, [schoolsData, eventIlFilter]);

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userCityFilter, setUserCityFilter] = useState("");

  // Load unified users
  const fetchAllUsers = useCallback(async () => {
    if (!user) return;
    setLoadingUsers(true);
    try {
      if (!auth.config.apiKey.includes("DummyKey")) {
        const usersRef = collection(db, "users");
        let q = usersRef;
        if (userRole === "coordinator" && userProfile?.il) {
          q = query(usersRef, where("il", "==", userProfile.il));
        }
        const snap = await getDocs(q);
        const list = [];
        snap.forEach((doc) => {
          list.push({ uid: doc.id, ...doc.data() });
        });
        setUsersList(list);
      } else {
        const local = localStorage.getItem("mock_users");
        let list = local ? JSON.parse(local) : [];
        if (userRole === "coordinator" && userProfile?.il) {
          list = list.filter((u) => u.il === userProfile.il);
        }
        setUsersList(list);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [user, userRole, userProfile]);

  useEffect(() => {
    if (activeTab === "approvals") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAllUsers();
    }
  }, [activeTab, fetchAllUsers]);

  const filteredChatContacts = (chatContacts || []).filter((c) => {
    if (c.uid === user?.uid) return false;
    const queryLower = searchContactQuery.toLowerCase();
    const matchesName = c.adSoyad?.toLowerCase().includes(queryLower);
    const matchesEmail = c.eposta?.toLowerCase().includes(queryLower);
    const matchesSchool = c.studentProfile?.okulAdi
      ?.toLowerCase()
      .includes(queryLower);
    return matchesName || matchesEmail || matchesSchool;
  });

  const handleRoleChange = async (targetUid, newRole) => {
    if (
      window.confirm(
        "Bu kullanıcının rolünü değiştirmek istediğinize emin misiniz?",
      )
    ) {
      try {
        await updateUserRole(targetUid, newRole);
        setUsersList((prev) =>
          prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u)),
        );
      } catch (err) {
        alert("Rol güncellenirken hata oluştu: " + err.message);
      }
    }
  };

  const handleApproveUser = async (targetUid) => {
    if (
      window.confirm(
        "Bu kullanıcının kaydını onaylamak istediğinize emin misiniz?",
      )
    ) {
      try {
        if (!auth.config.apiKey.includes("DummyKey")) {
          await updateDoc(doc(db, "users", targetUid), { onaylandi: true });
        } else {
          const local = localStorage.getItem("mock_users");
          if (local) {
            const list = JSON.parse(local);
            const idx = list.findIndex((u) => u.uid === targetUid);
            if (idx !== -1) {
              list[idx].onaylandi = true;
              localStorage.setItem("mock_users", JSON.stringify(list));
            }
          }
        }
        setUsersList((prev) =>
          prev.map((u) =>
            u.uid === targetUid || u.id === targetUid
              ? { ...u, onaylandi: true }
              : u,
          ),
        );
        alert("Kullanıcı kaydı başarıyla onaylandı.");
      } catch (err) {
        alert("Onaylanırken hata oluştu: " + err.message);
      }
    }
  };

  const handleRejectUser = async (targetUid) => {
    if (
      window.confirm(
        "Bu kullanıcının kaydını reddetmek ve silmek istediğinize emin misiniz?",
      )
    ) {
      try {
        if (!auth.config.apiKey.includes("DummyKey")) {
          await deleteDoc(doc(db, "users", targetUid));
        } else {
          const local = localStorage.getItem("mock_users");
          if (local) {
            const list = JSON.parse(local);
            const updated = list.filter((u) => u.uid !== targetUid);
            localStorage.setItem("mock_users", JSON.stringify(updated));
          }
        }
        setUsersList((prev) =>
          prev.filter((u) => u.uid !== targetUid && u.id !== targetUid),
        );
        alert("Kullanıcı kaydı reddedildi ve silindi.");
      } catch (err) {
        alert("İşlem sırasında hata oluştu: " + err.message);
      }
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setCoordError("");
    setCoordSuccess("");

    if (!coordForm.adSoyad.trim()) return setCoordError("Ad Soyad zorunludur.");
    if (!coordForm.eposta.trim()) return setCoordError("E-posta zorunludur.");

    const targetIl =
      userRole === "coordinator" ? userProfile?.il : coordForm.il;
    if (!targetIl) return setCoordError("İl seçimi zorunludur.");

    try {
      const finalForm = { ...coordForm, il: targetIl };
      if (addUserRole === "coordinator") {
        await addCoordinator(finalForm);
        setCoordSuccess(
          "İl koordinatörü başarıyla oluşturuldu! Giriş Şifresi: coord123",
        );
      } else {
        await addCommissionMember(finalForm);
        setCoordSuccess(
          "Komisyon üyesi başarıyla oluşturuldu! Giriş Şifresi: commission123",
        );
      }
      setCoordForm({ adSoyad: "", eposta: "", telefon: "", il: "" });
    } catch (err) {
      console.error(err);
      setCoordError("Kullanıcı eklenirken hata: " + err.message);
    }
  };

  const handleEditSubmit = async () => {
    if (!editForm.adSoyad.trim()) return alert("Ad Soyad zorunludur.");
    if (!editForm.eposta.trim()) return alert("E-posta zorunludur.");
    if (!editForm.il) return alert("İl seçimi zorunludur.");

    try {
      await updateModeratorOrCommission(
        editingUser.uid,
        editingUser.role,
        editForm,
      );
      setEditingUser(null);
      fetchAllUsers();
      alert("Kullanıcı başarıyla güncellendi!");
    } catch (err) {
      console.error(err);
      alert("Güncelleme hatası: " + err.message);
    }
  };

  const handleDeleteClick = async (targetUser) => {
    if (
      window.confirm(
        `${targetUser.adSoyad} isimli kullanıcıyı silmek istediğinize emin misiniz?`,
      )
    ) {
      try {
        await deleteModeratorOrCommission(targetUser.uid, targetUser.role);
        fetchAllUsers();
        alert("Kullanıcı başarıyla silindi!");
      } catch (err) {
        console.error(err);
        alert("Silme hatası: " + err.message);
      }
    }
  };

  const getCoordinatorsAndCommissionList = () => {
    return usersList.filter(
      (u) => u.role === "coordinator" || u.role === "commission",
    );
  };

  // Trigger loading of users when tab is active
  useState(() => {
    if (activeTab === "coordinators") {
      fetchAllUsers();
    }
  });

  const getFilteredUsers = () => {
    return usersList.filter((u) => {
      const matchesSearch = userSearch
        ? u.adSoyad.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.eposta.toLowerCase().includes(userSearch.toLowerCase()) ||
          (u.schoolId &&
            u.schoolId.toLowerCase().includes(userSearch.toLowerCase()))
        : true;
      const matchesRole = userRoleFilter ? u.role === userRoleFilter : true;
      const matchesCity =
        userRole === "admin" && userCityFilter ? u.il === userCityFilter : true;
      return matchesSearch && matchesRole && matchesCity;
    });
  };

  const handleSeedData = async () => {
    if (
      !window.confirm(
        "genctek.eba.gov.tr'den çekilen 44 etkinlik ve 3 projeyi veritabanına eklemek istediğinize emin misiniz?",
      )
    ) {
      return;
    }
    setIsSeeding(true);
    setSeedProgress("Başlatılıyor...");

    try {
      const addedEvents = [];
      let count = 0;

      // Events Seeding
      for (const event of seedEvents) {
        // Check if event already exists in allEventsRaw
        const exists = allEventsRaw.some(
          (e) => e.ad.toLowerCase() === event.ad.toLowerCase(),
        );
        if (exists) {
          const existingEvent = allEventsRaw.find(
            (e) => e.ad.toLowerCase() === event.ad.toLowerCase(),
          );
          addedEvents.push({ ad: event.ad, id: existingEvent.id });
          continue;
        }

        setSeedProgress(
          `Etkinlik (${++count}/${seedEvents.length}): ${event.ad}`,
        );
        const docRef = await addDoc(collection(db, "events"), event);
        addedEvents.push({ ad: event.ad, id: docRef.id });
      }

      // Projects Seeding
      count = 0;
      for (const project of seedProjects) {
        // Check if project already exists in allProjectsRaw
        const exists = allProjectsRaw.some(
          (p) => p.ad.toLowerCase() === project.ad.toLowerCase(),
        );
        if (exists) continue;

        setSeedProgress(
          `Proje (${++count}/${seedProjects.length}): ${project.ad}`,
        );
        const matchedEvent = addedEvents.find(
          (e) => e.ad.toLowerCase() === project.etkinlikAd?.toLowerCase(),
        );
        const projectToSave = { ...project };
        delete projectToSave.etkinlikAd;
        projectToSave.etkinlikId = matchedEvent ? matchedEvent.id : "";

        await addDoc(collection(db, "projects"), projectToSave);
      }

      setSeedProgress("Tamamlandı!");
      alert(
        "Veritabanı başarıyla tohumlandı! 44 Etkinlik ve 3 Proje sisteme eklendi.",
      );
      refreshData();
    } catch (error) {
      console.error(error);
      alert("Tohumlama sırasında bir hata oluştu: " + error.message);
    } finally {
      setIsSeeding(false);
      setSeedProgress("");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      await loginModerator(email, password);
      // Close modal and redirect teacher to dashboard if role is teacher
      // If it is admin, keep moderation open
      setTimeout(() => {
        const savedRole = localStorage.getItem("mock_teacher_profile")
          ? JSON.parse(localStorage.getItem("mock_teacher_profile")).rol
          : null;

        // Check current role in auth
        if (
          email !== "admin@genctek.org" &&
          (savedRole === "teacher" || email.includes("teacher"))
        ) {
          setModalType("teacher-dashboard");
        }
      }, 300);
    } catch (err) {
      console.error(err);
      setLoginError(
        err.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCityChangeForSchools = (city) => {
    setModSelectedCity(city);
    setModSelectedDistrict("");
    setEditingSchoolId(null);
    setSchoolForm({ ad: "", website: "" });
    loadSchoolsForCity(city);
  };

  const handleSchoolSubmit = async (e) => {
    e.preventDefault();
    setSchoolError("");
    setSchoolSuccess("");

    if (!modSelectedCity) {
      setSchoolError("Lütfen bir il seçin.");
      return;
    }
    if (!modSelectedDistrict) {
      setSchoolError("Lütfen bir ilçe seçin.");
      return;
    }
    if (!schoolForm.ad.trim()) {
      setSchoolError("Okul adı boş olamaz.");
      return;
    }

    try {
      const payload = {
        il: modSelectedCity,
        ilce: modSelectedDistrict,
        ad: schoolForm.ad.trim(),
        website: schoolForm.website.trim(),
      };

      if (editingSchoolId) {
        let originalAd = "";
        if (editingSchoolId.startsWith("static-")) {
          const districtSchools = schoolsData[modSelectedDistrict] || [];
          const originalSchool = districtSchools.find(
            (s) => s.id === editingSchoolId,
          );
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

  // Export to CSV
  const exportToCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM for Turkish character support in Excel
    csvContent +=
      "Etkinlik Adı;Danışman Öğretmen;E-posta;Telefon;İl;İlçe;Okul;Öğrenci Adı;Sınıf Seviyesi;Veli Telefonu;Onay Durumu;Başvuru Tarihi\n";

    applications.forEach((app) => {
      const eventObj = allEventsRaw.find((e) => e.id === app.etkinlikId) || {
        ad: "Bilinmeyen Etkinlik",
      };
      const statusText = app.onaylandi ? "Onaylandı" : "Beklemede";
      const dateText = new Date(app.olusturmaTarihi).toLocaleDateString(
        "tr-TR",
      );

      app.ogrenciler?.forEach((s) => {
        const row = [
          eventObj.ad,
          app.ogretmenBilgi?.adSoyad || "",
          app.ogretmenBilgi?.eposta || "",
          app.ogretmenBilgi?.telefon || "",
          app.ogretmenBilgi?.il || "",
          app.ogretmenBilgi?.ilce || "",
          app.ogretmenBilgi?.okul || "",
          s.adSoyad,
          s.sinifSeviyesi,
          s.veliTelefon,
          statusText,
          dateText,
        ]
          .map((val) => `"${val.toString().replace(/"/g, '""')}"`)
          .join(";");
        csvContent += row + "\n";
      });
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Genctek_Atlas_Etkinlik_Basvurulari_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF Function
  const printPDF = () => {
    const printWindow = window.open("", "_blank");
    let html = `
      <html>
      <head>
        <title>Etkinlik Katılım Başvuruları</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h2 { text-align: center; color: #d90429; margin-bottom: 5px; }
          p.date { text-align: center; font-size: 12px; color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f1f2f6; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .badge { padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; display: inline-block; }
          .badge-approved { background-color: #dcfce7; color: #15803d; }
          .badge-pending { background-color: #f1f5f9; color: #475569; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h2>GençTek Atlas - Etkinlik Başvuru Raporu</h2>
        <p class="date">Rapor Tarihi: ${new Date().toLocaleDateString("tr-TR")} ${new Date().toLocaleTimeString("tr-TR")}</p>
        <table>
          <thead>
            <tr>
              <th>Etkinlik Adı</th>
              <th>Danışman Öğretmen</th>
              <th>Okul / İl / İlçe</th>
              <th>Katılan Öğrenciler</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
    `;

    applications.forEach((app) => {
      const eventObj = allEventsRaw.find((e) => e.id === app.etkinlikId) || {
        ad: "Bilinmeyen Etkinlik",
      };
      const statusClass = app.onaylandi
        ? "badge badge-approved"
        : "badge badge-pending";
      const statusText = app.onaylandi ? "Onaylandı" : "Beklemede";
      const studentsList =
        app.ogrenciler
          ?.map((s, i) => `${i + 1}. ${s.adSoyad} (${s.sinifSeviyesi})`)
          .join("<br/>") || "";

      html += `
        <tr>
          <td><strong>${eventObj.ad}</strong></td>
          <td>${app.ogretmenBilgi?.adSoyad || ""}<br/><small>${app.ogretmenBilgi?.eposta || ""}</small></td>
          <td>${app.ogretmenBilgi?.okul || ""}<br/><small>${app.ogretmenBilgi?.ilce || ""} / ${app.ogretmenBilgi?.il || ""}</small></td>
          <td>${studentsList}</td>
          <td><span class="${statusClass}">${statusText}</span></td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Filter pending items
  const pendingEvents = allEventsRaw.filter((e) => !e.onaylandi);
  const pendingProjects = allProjectsRaw.filter((p) => !p.onaylandi);
  const pendingStaff = usersList.filter(
    (u) => (u.role === "principal" || u.role === "teacher") && !u.onaylandi,
  );
  const pendingStudents = usersList.filter(
    (u) => u.role === "student" && !u.onaylandi,
  );

  // Filter approved items to show star status change option and filter by city/district
  const approvedEvents = allEventsRaw.filter((e) => {
    if (!e.onaylandi) return false;
    const matchesIl = eventIlFilter ? e.il === eventIlFilter : true;
    const matchesIlce = eventIlceFilter ? e.ilce === eventIlceFilter : true;
    return matchesIl && matchesIlce;
  });

  return (
    <div className="modal-overlay" onClick={() => setModalType(null)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "1000px",
          width: "95%",
          height: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <h3>Atlas Giriş & Moderasyon</h3>
          <button className="close-btn" onClick={() => setModalType(null)}>
            <X size={20} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{
            backgroundColor: "var(--bg-main)",
            flexGrow: 1,
            overflowY: "auto",
            padding: "24px",
          }}
        >
          {!user ? (
            /* Login Form */
            <div
              className="auth-container"
              style={{ margin: "20px auto", boxShadow: "none" }}
            >
              <div className="auth-header">
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
                    <Lock size={20} />
                  </div>
                </div>
                <h2>Giriş Yap</h2>
                <p className="form-hint">
                  Danışman öğretmen veya moderatör hesabınızla oturum açın.
                </p>
              </div>

              {loginError && (
                <div
                  className="form-error"
                  style={{ marginBottom: "16px", textAlign: "center" }}
                >
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">E-posta</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Şifre</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="card-btn primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "16px",
                  }}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Giriş Yapılıyor..." : "Giriş Yap"}
                </button>
              </form>

              <div
                style={{
                  marginTop: "20px",
                  textAlign: "center",
                }}
              >
                <button
                  className="nav-link"
                  onClick={() => setModalType("teacher-register")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--primary)",
                  }}
                >
                  Danışman Öğretmen misiniz? Şimdi Kaydolun
                </button>
              </div>

              {isUsingMockData && (
                <div
                  style={{
                    marginTop: "24px",
                    paddingTop: "16px",
                    borderTop: "1px dashed var(--border-color)",
                    textAlign: "center",
                  }}
                >
                  <p
                    className="form-hint"
                    style={{ marginBottom: "12px", fontSize: "11px" }}
                  >
                    Mock/Yerel modda admin girişi:{" "}
                    <strong>
                      admin@genctek.org / (en az 6 karakterli herhangi bir
                      şifre)
                    </strong>
                  </p>
                  <button
                    className="card-btn primary"
                    onClick={handleSeedData}
                    disabled={isSeeding}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Database size={16} />
                    {isSeeding
                      ? `Tohumlanıyor (${seedProgress})`
                      : "Mock Veritabanını Tohumla (EBA Verileri)"}
                  </button>
                </div>
              )}
            </div>
          ) : userRole === "admin" ? (
            /* Moderation Panel Dashboard (Admin Mode) */
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Mod Header Info */}
              <div
                className="mod-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  padding: "16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  flexShrink: 0,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-muted)",
                    }}
                  >
                    Yönetici Oturumu
                  </p>
                  <h4 style={{ color: "var(--secondary)" }}>{user.email}</h4>
                </div>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <ExportButton type="events" label="Etkinlik Raporu (CSV)" />
                  <ExportButton type="projects" label="Proje Raporu (CSV)" />
                  {isUsingMockData && (
                    <button
                      className="card-btn primary"
                      onClick={handleSeedData}
                      disabled={isSeeding}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Database size={16} />
                      {isSeeding
                        ? `Tohumlanıyor (${seedProgress})`
                        : "Veritabanını Tohumla"}
                    </button>
                  )}
                  <button
                    className="card-btn secondary"
                    onClick={logoutModerator}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <LogOut size={16} /> Oturumu Kapat
                  </button>
                </div>
              </div>

              {/* Admin Panel Tabs */}
              <div
                className="list-tabs"
                style={{
                  borderBottom: "2px solid var(--border-color)",
                  margin: "0",
                  padding: "0",
                  gap: "8px",
                  flexShrink: 0,
                }}
              >
                <div
                  className={`list-tab ${activeTab === "approvals" ? "active" : ""}`}
                  onClick={() => setActiveTab("approvals")}
                  style={{ paddingBottom: "12px", cursor: "pointer" }}
                >
                  {userRole === "commission"
                    ? "Etkinlikler & Projeler"
                    : `Onay Bekleyenler (${pendingEvents.length + pendingProjects.length + pendingStaff.length + pendingStudents.length})`}
                </div>
                <div
                  className={`list-tab ${activeTab === "applications" ? "active" : ""}`}
                  onClick={() => setActiveTab("applications")}
                  style={{
                    paddingBottom: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <UsersIcon size={16} /> Başvurular ({applications.length})
                </div>
                {userRole !== "commission" && (
                  <>
                    <div
                      className={`list-tab ${activeTab === "features" ? "active" : ""}`}
                      onClick={() => setActiveTab("features")}
                      style={{ paddingBottom: "12px", cursor: "pointer" }}
                    >
                      Etkinlik Yönetimi
                    </div>
                    <div
                      className={`list-tab ${activeTab === "schools" ? "active" : ""}`}
                      onClick={() => setActiveTab("schools")}
                      style={{ paddingBottom: "12px", cursor: "pointer" }}
                    >
                      Okul Yönetimi
                    </div>
                  </>
                )}
                {userRole !== "commission" && (
                  <div
                    className={`list-tab ${activeTab === "coordinators" ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab("coordinators");
                      fetchAllUsers();
                    }}
                    style={{ paddingBottom: "12px", cursor: "pointer" }}
                  >
                    {userRole === "admin"
                      ? "İl Koordinatörleri & Komisyon"
                      : "İl Komisyon Üyeleri"}
                  </div>
                )}

                {/* TAB CONTENT 6: messages */}
                {activeTab === "messages" && (
                  <div
                    className="glass-panel"
                    style={{
                      margin: 0,
                      padding: 0,
                      display: "grid",
                      gridTemplateColumns: "320px 1fr",
                      height: "700px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      overflow: "hidden",
                      backgroundColor: "white",
                    }}
                  >
                    {/* Left Column: Student Contacts */}
                    <div
                      style={{
                        borderRight: "1px solid var(--border-color)",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <div
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Kişi veya okul ara..."
                          value={searchContactQuery}
                          onChange={(e) =>
                            setSearchContactQuery(e.target.value)
                          }
                          style={{
                            margin: 0,
                            padding: "8px 12px",
                            fontSize: "13px",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          flexGrow: 1,
                          overflowY: "auto",
                          padding: "8px",
                        }}
                      >
                        {filteredChatContacts.length === 0 ? (
                          <div
                            style={{
                              textAlign: "center",
                              padding: "20px 10px",
                              fontSize: "12px",
                              color: "var(--text-muted)",
                            }}
                          >
                            Kişi bulunamadı.
                          </div>
                        ) : (
                          filteredChatContacts.map((contact) => {
                            const isSelected =
                              selectedStudentContact?.uid === contact.uid;
                            const contactMsgs = directMessages.filter(
                              (m) =>
                                m.senderId === contact.uid ||
                                m.receiverId === contact.uid,
                            );
                            const lastMsg = contactMsgs.pop();
                            const unreadCount = directMessages.filter(
                              (m) =>
                                m.senderId === contact.uid &&
                                m.receiverId === user.uid &&
                                !m.okundu,
                            ).length;

                            return (
                              <div
                                key={contact.uid}
                                onClick={() => {
                                  setSelectedStudentContact(contact);
                                  if (user) fetchDirectMessages(user.uid);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "10px 12px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  transition: "background 0.2s",
                                  backgroundColor: isSelected
                                    ? "var(--primary-light)"
                                    : "transparent",
                                  marginBottom: "4px",
                                  border: isSelected
                                    ? "1px solid rgba(217,4,41,0.15)"
                                    : "1px solid transparent",
                                }}
                              >
                                <div
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    backgroundColor: "var(--secondary)",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "700",
                                    fontSize: "12px",
                                    flexShrink: 0,
                                  }}
                                >
                                  {contact.adSoyad?.charAt(0).toUpperCase() || (
                                    <User size={14} />
                                  )}
                                </div>
                                <div style={{ flexGrow: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "baseline",
                                    }}
                                  >
                                    <h6
                                      style={{
                                        margin: 0,
                                        fontSize: "12.5px",
                                        fontWeight: "700",
                                        color: isSelected
                                          ? "var(--primary)"
                                          : "var(--secondary)",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {contact.adSoyad}
                                    </h6>
                                  </div>
                                  <p
                                    style={{
                                      margin: "2px 0 0 0",
                                      fontSize: "10px",
                                      color: "var(--text-muted)",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {contact.role === "student"
                                      ? `${contact.studentProfile?.sinif || "Öğrenci"} | ${contact.il || ""}`
                                      : contact.role === "coordinator"
                                        ? "Koordinatör"
                                        : "Komisyon Üyesi"}
                                  </p>
                                  {lastMsg && (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        fontSize: "9px",
                                        color: "var(--text-muted)",
                                        marginTop: "2px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                          flexGrow: 1,
                                        }}
                                      >
                                        {lastMsg.mesaj}
                                      </span>
                                      <span
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "2px",
                                          flexShrink: 0,
                                        }}
                                      >
                                        <Clock size={8} />
                                        {new Date(
                                          lastMsg.tarih,
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {unreadCount > 0 && (
                                  <span
                                    style={{
                                      backgroundColor: "var(--primary)",
                                      color: "white",
                                      borderRadius: "50%",
                                      width: "16px",
                                      height: "16px",
                                      fontSize: "9px",
                                      fontWeight: "800",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {unreadCount}
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Right Column: Chat view */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minWidth: 0,
                        flexGrow: 1,
                      }}
                    >
                      {selectedStudentContact ? (
                        <>
                          {/* Header */}
                          <div
                            style={{
                              padding: "16px 20px",
                              borderBottom: "1px solid var(--border-color)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              backgroundColor: "#f8f9fa",
                            }}
                          >
                            <div>
                              <h5
                                style={{
                                  margin: 0,
                                  fontSize: "14px",
                                  fontWeight: "700",
                                }}
                              >
                                {selectedStudentContact.adSoyad}
                              </h5>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "11px",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {selectedStudentContact.role === "student"
                                  ? `${selectedStudentContact.studentProfile?.sinif || "Öğrenci"} - ${selectedStudentContact.il}`
                                  : selectedStudentContact.role ===
                                      "coordinator"
                                    ? "Koordinatör"
                                    : "Komisyon Üyesi"}
                              </p>
                            </div>
                          </div>

                          {/* Thread Messages */}
                          <div
                            style={{
                              flexGrow: 1,
                              overflowY: "auto",
                              padding: "20px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px",
                              backgroundColor: "#fafbfc",
                            }}
                          >
                            {directMessages
                              .filter(
                                (m) =>
                                  (m.senderId === user.uid &&
                                    m.receiverId ===
                                      selectedStudentContact.uid) ||
                                  (m.senderId === selectedStudentContact.uid &&
                                    m.receiverId === user.uid),
                              )
                              .map((msg) => {
                                const isSelf = msg.senderId === user.uid;
                                return (
                                  <div
                                    key={msg.id}
                                    style={{
                                      alignSelf: isSelf
                                        ? "flex-end"
                                        : "flex-start",
                                      maxWidth: "70%",
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: isSelf
                                        ? "flex-end"
                                        : "flex-start",
                                    }}
                                  >
                                    <div
                                      style={{
                                        padding: "10px 14px",
                                        borderRadius: isSelf
                                          ? "14px 14px 2px 14px"
                                          : "14px 14px 14px 2px",
                                        backgroundColor: isSelf
                                          ? "var(--primary)"
                                          : "#f1f2f6",
                                        color: isSelf
                                          ? "white"
                                          : "var(--text-main)",
                                        fontSize: "13px",
                                        lineHeight: 1.45,
                                        border: isSelf
                                          ? "none"
                                          : "1px solid #e9ecef",
                                      }}
                                    >
                                      {msg.mesaj}
                                    </div>
                                    <span
                                      style={{
                                        fontSize: "9px",
                                        color: "var(--text-muted)",
                                        marginTop: "4px",
                                      }}
                                    >
                                      {new Date(msg.tarih).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" },
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>

                          {/* Input Area */}
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!replyText.trim()) return;
                              await sendDirectMessage(
                                selectedStudentContact.uid,
                                selectedStudentContact.adSoyad,
                                selectedStudentContact.role,
                                replyText,
                              );
                              setReplyText("");
                            }}
                            style={{
                              padding: "16px",
                              borderTop: "1px solid var(--border-color)",
                              display: "flex",
                              gap: "10px",
                              backgroundColor: "white",
                            }}
                          >
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Yanıtınızı yazın..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              style={{ margin: 0 }}
                            />
                            <button
                              type="submit"
                              className="card-btn primary"
                              style={{
                                width: "95px",
                                height: "40px",
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                              }}
                            >
                              <Send size={14} /> Gönder
                            </button>
                          </form>
                        </>
                      ) : (
                        <div
                          style={{
                            margin: "auto",
                            textAlign: "center",
                            color: "var(--text-muted)",
                            fontSize: "14px",
                          }}
                        >
                          <MessageSquare
                            size={48}
                            style={{
                              margin: "0 auto 16px auto",
                              opacity: 0.2,
                              color: "var(--primary)",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              fontWeight: "600",
                            }}
                          >
                            <Sparkles
                              size={16}
                              style={{ color: "var(--primary)" }}
                            />
                            <span>
                              Sohbet akışını görüntülemek için soldan bir
                              kullanıcı seçin.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div
                  className={`list-tab ${activeTab === "messages" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("messages");
                    if (user) fetchDirectMessages(user.uid);
                  }}
                  style={{
                    paddingBottom: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Sohbet & Destek
                  {directMessages.filter(
                    (m) => m.receiverId === user.uid && !m.okundu,
                  ).length > 0 && (
                    <span
                      style={{
                        backgroundColor: "var(--primary)",
                        color: "white",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        fontSize: "10px",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {
                        directMessages.filter(
                          (m) => m.receiverId === user.uid && !m.okundu,
                        ).length
                      }
                    </span>
                  )}
                </div>
              </div>

              {/* TAB CONTENT 1: approvals */}
              {activeTab === "approvals" && (
                <>
                  {/* Pending Events Table */}
                  <div className="mod-table-container" style={{ margin: 0 }}>
                    <div className="mod-table-title">
                      <h4>
                        Onay Bekleyen Etkinlikler ({pendingEvents.length})
                      </h4>
                    </div>
                    {pendingEvents.length === 0 ? (
                      <div
                        className="empty-state"
                        style={{ padding: "24px", border: "none" }}
                      >
                        Onay bekleyen etkinlik bulunmamaktadır.
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="mod-table">
                          <thead>
                            <tr>
                              <th>Etkinlik Adı</th>
                              <th>Tema</th>
                              <th>İl / İlçe</th>
                              <th>Tarih</th>
                              <th>Kapsam / Durum</th>
                              <th>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingEvents.map((event) => (
                              <tr key={event.id}>
                                <td style={{ fontWeight: "600" }}>
                                  {event.ad}
                                </td>
                                <td>{event.tema.split("-")[0]}</td>
                                <td>
                                  {event.ilce
                                    ? `${event.il} - ${event.ilce}`
                                    : event.il}
                                </td>
                                <td>{event.tarih}</td>
                                <td>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: "700",
                                    }}
                                  >
                                    {event.kapsam.toUpperCase()} /{" "}
                                    {event.durum.toUpperCase()}
                                  </span>
                                </td>
                                <td className="mod-actions">
                                  {userRole !== "commission" ? (
                                    <>
                                      <button
                                        className="mod-btn approve"
                                        onClick={() =>
                                          approveItem("events", event.id)
                                        }
                                        title="Onayla"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        className="mod-btn approve"
                                        style={{
                                          backgroundColor: "#f1f2f6",
                                          color: "var(--secondary)",
                                        }}
                                        onClick={() => {
                                          setEditingEvent(event);
                                          setModalType("event-register");
                                        }}
                                        title="Düzenle"
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button
                                        className="mod-btn reject"
                                        onClick={() => {
                                          if (
                                            window.confirm(
                                              `"${event.ad}" etkinliğini reddedip silmek istediğinize emin misiniz?`,
                                            )
                                          ) {
                                            rejectItem("events", event.id);
                                          }
                                        }}
                                        title="Reddet/Sil"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "var(--text-muted)",
                                        fontWeight: "600",
                                      }}
                                    >
                                      Salt Okunur
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Pending Projects Table */}
                  <div className="mod-table-container" style={{ margin: 0 }}>
                    <div className="mod-table-title">
                      <h4>Onay Bekleyen Projeler ({pendingProjects.length})</h4>
                    </div>
                    {pendingProjects.length === 0 ? (
                      <div
                        className="empty-state"
                        style={{ padding: "24px", border: "none" }}
                      >
                        Onay bekleyen proje bulunmamaktadır.
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="mod-table">
                          <thead>
                            <tr>
                              <th>Proje Adı</th>
                              <th>Tema</th>
                              <th>Takım Adı</th>
                              <th>İller</th>
                              <th>Etik Kontrol</th>
                              <th>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingProjects.map((project) => (
                              <tr key={project.id}>
                                <td style={{ fontWeight: "600" }}>
                                  {project.ad}
                                </td>
                                <td>{project.tema.split("-")[0]}</td>
                                <td>{project.takimAdi}</td>
                                <td>{project.katilimciIller?.join(", ")}</td>
                                <td>
                                  <span
                                    style={{
                                      color: project.etikKontrol
                                        ? "var(--success)"
                                        : "var(--danger)",
                                      fontWeight: "700",
                                    }}
                                  >
                                    {project.etikKontrol ? "Evet" : "Hayır"}
                                  </span>
                                </td>
                                <td className="mod-actions">
                                  {userRole !== "commission" ? (
                                    <>
                                      <button
                                        className="mod-btn approve"
                                        onClick={() =>
                                          approveItem("projects", project.id)
                                        }
                                        title="Onayla"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        className="mod-btn reject"
                                        onClick={() => {
                                          if (
                                            window.confirm(
                                              `"${project.ad}" projesini reddedip silmek istediğinize emin misiniz?`,
                                            )
                                          ) {
                                            rejectItem("projects", project.id);
                                          }
                                        }}
                                        title="Reddet/Sil"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "var(--text-muted)",
                                        fontWeight: "600",
                                      }}
                                    >
                                      Salt Okunur
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Pending Staff (Principals & Teachers) Table */}
                  <div
                    className="mod-table-container"
                    style={{ margin: "24px 0 0 0" }}
                  >
                    <div
                      className="mod-table-title"
                      style={{ marginBottom: "12px" }}
                    >
                      <h4>
                        Onay Bekleyen Müdürler & Öğretmenler (
                        {pendingStaff.length})
                      </h4>
                    </div>
                    {pendingStaff.length === 0 ? (
                      <div
                        className="empty-state"
                        style={{ padding: "24px", border: "none" }}
                      >
                        Onay bekleyen okul müdürü veya danışman öğretmen
                        bulunmamaktadır.
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="mod-table">
                          <thead>
                            <tr>
                              <th>Ad Soyad</th>
                              <th>Rol</th>
                              <th>İl / İlçe</th>
                              <th>Okul</th>
                              <th>E-posta / Telefon</th>
                              <th>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingStaff.map((staff) => (
                              <tr key={staff.uid || staff.id}>
                                <td style={{ fontWeight: "600" }}>
                                  {staff.adSoyad}
                                </td>
                                <td>
                                  {staff.role === "principal"
                                    ? "Okul Müdürü"
                                    : "Danışman Öğretmen"}
                                </td>
                                <td>
                                  {staff.ilce
                                    ? `${staff.il} - ${staff.ilce}`
                                    : staff.il}
                                </td>
                                <td>{staff.schoolId || staff.okul || "-"}</td>
                                <td>
                                  {staff.eposta} <br />
                                  <small style={{ color: "var(--text-muted)" }}>
                                    {staff.telefon || "-"}
                                  </small>
                                </td>
                                <td className="mod-actions">
                                  {userRole !== "commission" ? (
                                    <>
                                      <button
                                        className="mod-btn approve"
                                        onClick={() =>
                                          handleApproveUser(
                                            staff.uid || staff.id,
                                          )
                                        }
                                        title="Onayla"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        className="mod-btn reject"
                                        onClick={() =>
                                          handleRejectUser(
                                            staff.uid || staff.id,
                                          )
                                        }
                                        title="Reddet/Sil"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "var(--text-muted)",
                                        fontWeight: "600",
                                      }}
                                    >
                                      Salt Okunur
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Pending Students Table */}
                  <div
                    className="mod-table-container"
                    style={{ margin: "24px 0 0 0" }}
                  >
                    <div
                      className="mod-table-title"
                      style={{ marginBottom: "12px" }}
                    >
                      <h4>
                        Onay Bekleyen Öğrenciler ({pendingStudents.length})
                      </h4>
                    </div>
                    {pendingStudents.length === 0 ? (
                      <div
                        className="empty-state"
                        style={{ padding: "24px", border: "none" }}
                      >
                        Onay bekleyen öğrenci bulunmamaktadır.
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="mod-table">
                          <thead>
                            <tr>
                              <th>Ad Soyad</th>
                              <th>İl / İlçe</th>
                              <th>Okul</th>
                              <th>E-posta</th>
                              <th>Kayıt Tarihi</th>
                              <th>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingStudents.map((student) => (
                              <tr key={student.uid || student.id}>
                                <td style={{ fontWeight: "600" }}>
                                  {student.adSoyad}
                                </td>
                                <td>
                                  {student.ilce
                                    ? `${student.il} - ${student.ilce}`
                                    : student.il}
                                </td>
                                <td>
                                  {student.schoolId || student.okul || "-"}
                                </td>
                                <td>{student.eposta}</td>
                                <td>
                                  {student.olusturmaTarihi
                                    ? new Date(
                                        student.olusturmaTarihi,
                                      ).toLocaleDateString("tr-TR")
                                    : "-"}
                                </td>
                                <td className="mod-actions">
                                  {userRole !== "commission" ? (
                                    <>
                                      <button
                                        className="mod-btn approve"
                                        onClick={() =>
                                          handleApproveUser(
                                            student.uid || student.id,
                                          )
                                        }
                                        title="Onayla"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        className="mod-btn reject"
                                        onClick={() =>
                                          handleRejectUser(
                                            student.uid || student.id,
                                          )
                                        }
                                        title="Reddet/Sil"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "var(--text-muted)",
                                        fontWeight: "600",
                                      }}
                                    >
                                      Salt Okunur
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB CONTENT 2: event applications */}
              {activeTab === "applications" && (
                <div className="mod-table-container" style={{ margin: 0 }}>
                  <div
                    className="mod-table-title"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h4>Öğrenci Başvuru Listesi ({applications.length})</h4>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="card-btn secondary"
                        onClick={exportToCSV}
                        style={{
                          padding: "6px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                        }}
                      >
                        <FileSpreadsheet size={14} /> Excel (CSV)
                      </button>
                      <button
                        className="card-btn secondary"
                        onClick={printPDF}
                        style={{
                          padding: "6px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                        }}
                      >
                        <Printer size={14} /> Yazdır / PDF
                      </button>
                    </div>
                  </div>

                  {applications.length === 0 ? (
                    <div
                      className="empty-state"
                      style={{ padding: "24px", border: "none" }}
                    >
                      Kayıtlı etkinlik katılım başvurusu bulunmamaktadır.
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table className="mod-table">
                        <thead>
                          <tr>
                            <th>Etkinlik Adı</th>
                            <th>Danışman Öğretmen</th>
                            <th>Okul Bilgisi</th>
                            <th>Katılan Öğrenciler</th>
                            <th>Onay</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications.map((app) => {
                            const eventObj = allEventsRaw.find(
                              (e) => e.id === app.etkinlikId,
                            ) || { ad: "Bilinmeyen Etkinlik" };
                            return (
                              <tr key={app.id}>
                                <td style={{ fontWeight: "600" }}>
                                  {eventObj.ad}
                                </td>
                                <td>
                                  <div>
                                    <strong>
                                      {app.ogretmenBilgi?.adSoyad ||
                                        "Ziyaretçi"}
                                    </strong>
                                    <div
                                      className="form-hint"
                                      style={{ fontSize: "11px" }}
                                    >
                                      {app.ogretmenBilgi?.eposta}
                                      <br />
                                      {app.ogretmenBilgi?.telefon}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    {app.ogretmenBilgi?.okul}
                                    <div
                                      className="form-hint"
                                      style={{ fontSize: "11px" }}
                                    >
                                      {app.ogretmenBilgi?.ilce} /{" "}
                                      {app.ogretmenBilgi?.il}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "4px",
                                    }}
                                  >
                                    <strong>
                                      {app.ogrenciler?.length || 0} Öğrenci
                                    </strong>
                                    <ol
                                      style={{
                                        paddingLeft: "14px",
                                        margin: 0,
                                        fontSize: "11px",
                                      }}
                                      className="form-hint"
                                    >
                                      {app.ogrenciler?.map((s, idx) => (
                                        <li key={idx}>
                                          {s.adSoyad} ({s.sinifSeviyesi})
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                </td>
                                <td>
                                  {app.onaylandi ? (
                                    <span
                                      className="card-badge"
                                      style={{
                                        backgroundColor:
                                          "rgba(46,204,113,0.15)",
                                        color: "var(--success)",
                                      }}
                                    >
                                      Onaylandı
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
                                <td className="mod-actions">
                                  {userRole !== "commission" ? (
                                    <>
                                      {!app.onaylandi && (
                                        <button
                                          className="mod-btn approve"
                                          onClick={() =>
                                            approveApplication(app.id)
                                          }
                                          title="Başvuruyu Onayla"
                                        >
                                          <Check size={14} />
                                        </button>
                                      )}
                                      <button
                                        className="mod-btn reject"
                                        onClick={() => {
                                          if (
                                            window.confirm(
                                              "Bu başvuruyu kalıcı olarak silmek istediğinize emin misiniz?",
                                            )
                                          ) {
                                            rejectApplication(app.id);
                                          }
                                        }}
                                        title="Başvuruyu Sil"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "var(--text-muted)",
                                        fontWeight: "600",
                                      }}
                                    >
                                      Salt Okunur
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

              {/* TAB CONTENT 3: features */}
              {activeTab === "features" && (
                <div className="mod-table-container" style={{ margin: 0 }}>
                  <div className="mod-table-title">
                    <h4>Etkinlik Yönetimi (Onaylı Kayıtlar)</h4>
                  </div>

                  {/* Filters Bar */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                      backgroundColor: "#f8f9fa",
                      padding: "16px",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <div>
                      <label
                        className="form-label"
                        style={{
                          fontWeight: "600",
                          fontSize: "13px",
                          marginBottom: "6px",
                        }}
                      >
                        İl Filtresi
                      </label>
                      <select
                        className="form-input"
                        value={eventIlFilter}
                        onChange={(e) => setEventIlFilter(e.target.value)}
                        style={{ margin: 0 }}
                      >
                        <option value="">Tüm İller</option>
                        {cities.map((c) => (
                          <option key={c.plaka} value={c.ad}>
                            {c.ad}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="form-label"
                        style={{
                          fontWeight: "600",
                          fontSize: "13px",
                          marginBottom: "6px",
                        }}
                      >
                        İlçe Filtresi
                      </label>
                      <select
                        className="form-input"
                        value={eventIlceFilter}
                        onChange={(e) => setEventIlceFilter(e.target.value)}
                        disabled={!eventIlFilter}
                        style={{ margin: 0 }}
                      >
                        <option value="">Tüm İlçeler</option>
                        {eventDistricts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ padding: "20px", overflowX: "auto" }}>
                    {approvedEvents.length === 0 ? (
                      <div className="empty-state" style={{ padding: "40px" }}>
                        Kriterlere uygun onaylanmış etkinlik bulunamadı.
                      </div>
                    ) : (
                      <table className="mod-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th>Etkinlik Adı</th>
                            <th>Kapsam</th>
                            <th>İl / İlçe</th>
                            <th>Format</th>
                            <th style={{ textAlign: "center" }}>Öne Çıkarma</th>
                            <th style={{ textAlign: "right" }}>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {approvedEvents.map((e) => (
                            <tr key={e.id}>
                              <td
                                style={{ fontWeight: "600", fontSize: "13px" }}
                              >
                                {e.ad}
                              </td>
                              <td>
                                <span
                                  className="card-badge"
                                  style={{
                                    backgroundColor: "#f1f2f6",
                                    color: "var(--secondary)",
                                  }}
                                >
                                  {e.kapsam === "turkiye"
                                    ? "Türkiye"
                                    : e.kapsam === "okul"
                                      ? "Okul"
                                      : "İl"}
                                </span>
                              </td>
                              <td>{e.ilce ? `${e.il} / ${e.ilce}` : e.il}</td>
                              <td>{e.format}</td>
                              <td style={{ textAlign: "center" }}>
                                <button
                                  className="mod-btn star"
                                  style={{
                                    backgroundColor: e.oneCikar
                                      ? "var(--warning)"
                                      : "#e4e6eb",
                                    color: e.oneCikar
                                      ? "#fff"
                                      : "var(--text-muted)",
                                    padding: "4px 8px",
                                    fontSize: "11px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    margin: "0 auto",
                                  }}
                                  onClick={() =>
                                    starItem("events", e.id, !e.oneCikar)
                                  }
                                >
                                  <Star
                                    size={12}
                                    fill={e.oneCikar ? "#fff" : "none"}
                                  />
                                  {e.oneCikar ? "Öne Çıkarıldı" : "Öne Çıkar"}
                                </button>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <div
                                  style={{
                                    display: "inline-flex",
                                    gap: "8px",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <button
                                    className="btn-icon"
                                    style={{
                                      border: "none",
                                      background: "none",
                                      color: "var(--text-muted)",
                                      cursor: "pointer",
                                      padding: "4px",
                                    }}
                                    onClick={() => {
                                      setEditingEvent(e);
                                      setModalType("event-register");
                                    }}
                                    title="Düzenle"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    className="btn-icon"
                                    style={{
                                      border: "none",
                                      background: "none",
                                      color: "var(--danger)",
                                      cursor: "pointer",
                                      padding: "4px",
                                    }}
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `"${e.ad}" onaylı etkinliğini tamamen silmek istediğinize emin misiniz?`,
                                        )
                                      ) {
                                        deleteEvent(e.id);
                                      }
                                    }}
                                    title="Sil"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT 4: schools */}
              {activeTab === "schools" && (
                <div
                  className="mod-table-container"
                  style={{ margin: 0, padding: "20px" }}
                >
                  <div
                    className="mod-table-title"
                    style={{ marginBottom: "20px" }}
                  >
                    <h4>Dinamik Okul Yönetimi</h4>
                    <p className="form-hint" style={{ marginTop: "4px" }}>
                      Sisteme yeni okul ekleyebilir veya mevcut statik/dinamik
                      okulları güncelleyebilirsiniz.
                    </p>
                  </div>

                  {/* Konum Seçimi */}
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      marginBottom: "20px",
                      backgroundColor: "#f8f9fa",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label
                        className="form-label"
                        style={{ fontWeight: "600", fontSize: "13px" }}
                      >
                        İl Seçiniz
                      </label>
                      <select
                        className="form-input"
                        value={modSelectedCity}
                        onChange={(e) =>
                          handleCityChangeForSchools(e.target.value)
                        }
                        style={{ margin: 0 }}
                      >
                        <option value="">İl Seçin...</option>
                        {cities.map((city) => (
                          <option key={city.plaka} value={city.ad}>
                            {city.ad}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        className="form-label"
                        style={{ fontWeight: "600", fontSize: "13px" }}
                      >
                        İlçe Seçiniz
                      </label>
                      <select
                        className="form-input"
                        value={modSelectedDistrict}
                        onChange={(e) => setModSelectedDistrict(e.target.value)}
                        disabled={!modSelectedCity}
                        style={{ margin: 0 }}
                      >
                        <option value="">İlçe Seçin...</option>
                        {modSelectedCity &&
                          Object.keys(schoolsData || {})
                            .sort()
                            .map((dist) => (
                              <option key={dist} value={dist}>
                                {dist}
                              </option>
                            ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "24px",
                    }}
                  >
                    {/* Sol taraf: Okul Formu */}
                    <div
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "20px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <h5 style={{ marginBottom: "16px", fontWeight: "600" }}>
                        {editingSchoolId ? "Okulu Düzenle" : "Yeni Okul Ekle"}
                      </h5>
                      {!modSelectedCity || !modSelectedDistrict ? (
                        <div
                          className="form-hint"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          Okul işlemleri için lütfen yukarıdan İl ve İlçe
                          seçiniz.
                        </div>
                      ) : (
                        <form
                          onSubmit={handleSchoolSubmit}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#fff",
                              borderRadius: "6px",
                              border: "1px solid var(--border-color)",
                              fontSize: "12px",
                              color: "var(--text-muted)",
                              marginBottom: "4px",
                            }}
                          >
                            Konum:{" "}
                            <strong>
                              {modSelectedCity} / {modSelectedDistrict}
                            </strong>
                          </div>
                          <div>
                            <label
                              className="form-label"
                              style={{ fontWeight: "600", fontSize: "13px" }}
                            >
                              Okul Adı
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Okul adını giriniz..."
                              value={schoolForm.ad}
                              onChange={(e) =>
                                setSchoolForm({
                                  ...schoolForm,
                                  ad: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div>
                            <label
                              className="form-label"
                              style={{ fontWeight: "600", fontSize: "13px" }}
                            >
                              Web Sitesi (Opsiyonel)
                            </label>
                            <input
                              type="url"
                              className="form-input"
                              placeholder="https://okul.meb.k12.tr..."
                              value={schoolForm.website}
                              onChange={(e) =>
                                setSchoolForm({
                                  ...schoolForm,
                                  website: e.target.value,
                                })
                              }
                            />
                          </div>

                          {schoolError && (
                            <div
                              style={{
                                color: "var(--danger)",
                                fontSize: "13px",
                              }}
                            >
                              {schoolError}
                            </div>
                          )}
                          {schoolSuccess && (
                            <div
                              style={{
                                color: "var(--success)",
                                fontSize: "13px",
                              }}
                            >
                              {schoolSuccess}
                            </div>
                          )}

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              marginTop: "8px",
                            }}
                          >
                            <button
                              type="submit"
                              className="card-btn primary"
                              style={{ flex: 1, height: "40px" }}
                            >
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
                      )}
                    </div>

                    {/* Sağ taraf: Okul Listesi */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <h5 style={{ fontWeight: "600" }}>Okul Listesi</h5>
                      {!modSelectedCity || !modSelectedDistrict ? (
                        <div
                          className="empty-state"
                          style={{
                            padding: "40px",
                            border: "1px dashed var(--border-color)",
                          }}
                        >
                          Okulları listelemek için lütfen İl ve İlçe seçin.
                        </div>
                      ) : schoolsLoading ? (
                        <div
                          className="empty-state"
                          style={{ padding: "40px" }}
                        >
                          Okullar yükleniyor...
                        </div>
                      ) : (schoolsData[modSelectedDistrict.toUpperCase()] || [])
                          .length === 0 ? (
                        <div
                          className="empty-state"
                          style={{ padding: "40px" }}
                        >
                          Bu ilçeye ait kayıtlı okul bulunamadı. Yeni bir tane
                          ekleyebilirsiniz.
                        </div>
                      ) : (
                        <div
                          style={{
                            overflowY: "auto",
                            maxHeight: "400px",
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                          }}
                        >
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
                              {(
                                schoolsData[
                                  modSelectedDistrict.toUpperCase()
                                ] || []
                              ).map((school) => {
                                const isStatic =
                                  school.id?.startsWith("static-");
                                return (
                                  <tr key={school.id}>
                                    <td
                                      style={{
                                        fontWeight: "600",
                                        fontSize: "13px",
                                      }}
                                    >
                                      {school.ad}
                                    </td>
                                    <td>
                                      {school.website ? (
                                        <a
                                          href={school.website}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="form-hint"
                                          style={{
                                            color: "var(--primary)",
                                            textDecoration: "underline",
                                          }}
                                        >
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
                                          backgroundColor: isStatic
                                            ? "#f1f2f6"
                                            : "rgba(46,204,113,0.15)",
                                          color: isStatic
                                            ? "var(--text-muted)"
                                            : "var(--success)",
                                          fontSize: "11px",
                                        }}
                                      >
                                        {isStatic ? "Sistem" : "Dinamik"}
                                      </span>
                                    </td>
                                    <td>
                                      <button
                                        className="mod-btn approve"
                                        style={{
                                          backgroundColor: "#f1f2f6",
                                          color: "var(--secondary)",
                                          padding: "4px 8px",
                                        }}
                                        onClick={() => {
                                          setEditingSchoolId(school.id);
                                          setSchoolForm({
                                            ad: school.ad,
                                            website: school.website || "",
                                          });
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
                </div>
              )}

              {/* TAB CONTENT 5: coordinators */}
              {activeTab === "coordinators" && (
                <div
                  className="mod-table-container"
                  style={{
                    margin: 0,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                  }}
                >
                  {/* Row 1: Add Coordinator Form & Coordinators List */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1.5fr",
                      gap: "24px",
                      borderBottom: "1px solid var(--border-color)",
                      paddingBottom: "24px",
                    }}
                  >
                    {/* Left: Form */}
                    <div
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "20px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <h5 style={{ marginBottom: "16px", fontWeight: "600" }}>
                        {addUserRole === "coordinator"
                          ? "Yeni İl Koordinatörü Oluştur"
                          : "Yeni Komisyon Üyesi Oluştur"}
                      </h5>
                      <form
                        onSubmit={async (e) => {
                          await handleAddUserSubmit(e);
                          fetchAllUsers();
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {userRole === "admin" && (
                          <div>
                            <label
                              className="form-label"
                              style={{ fontWeight: "600", fontSize: "13px" }}
                            >
                              Kullanıcı Rolü *
                            </label>
                            <select
                              className="form-input"
                              value={addUserRole}
                              onChange={(e) => setAddUserRole(e.target.value)}
                              required
                            >
                              <option value="coordinator">
                                İl Koordinatörü
                              </option>
                              <option value="commission">
                                İl Komisyon Üyesi
                              </option>
                            </select>
                          </div>
                        )}
                        <div>
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", fontSize: "13px" }}
                          >
                            Ad Soyad *
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Koordinatörün adını giriniz..."
                            value={coordForm.adSoyad}
                            onChange={(e) =>
                              setCoordForm({
                                ...coordForm,
                                adSoyad: e.target.value,
                              })
                            }
                            required
                          />
                        </div>

                        <div>
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", fontSize: "13px" }}
                          >
                            E-posta Adresi *
                          </label>
                          <input
                            type="email"
                            className="form-input"
                            placeholder="eposta@genctek.org..."
                            value={coordForm.eposta}
                            onChange={(e) =>
                              setCoordForm({
                                ...coordForm,
                                eposta: e.target.value,
                              })
                            }
                            required
                          />
                        </div>

                        <div>
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", fontSize: "13px" }}
                          >
                            Telefon Numarası
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="05xx xxx xx xx"
                            value={coordForm.telefon}
                            onChange={(e) =>
                              setCoordForm({
                                ...coordForm,
                                telefon: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", fontSize: "13px" }}
                          >
                            Sorumlu Olduğu İl *
                          </label>
                          <select
                            className="form-input"
                            value={
                              userRole === "coordinator"
                                ? userProfile?.il
                                : coordForm.il
                            }
                            onChange={(e) =>
                              setCoordForm({ ...coordForm, il: e.target.value })
                            }
                            required
                            disabled={userRole === "coordinator"}
                          >
                            <option value="">İl Seçin...</option>
                            {cities.map((city) => (
                              <option key={city.plaka} value={city.ad}>
                                {city.ad}
                              </option>
                            ))}
                          </select>
                        </div>

                        {coordError && (
                          <div
                            style={{ color: "var(--danger)", fontSize: "13px" }}
                          >
                            {coordError}
                          </div>
                        )}
                        {coordSuccess && (
                          <div
                            style={{
                              color: "var(--success)",
                              fontSize: "13px",
                              backgroundColor: "rgba(46,204,113,0.1)",
                              padding: "10px",
                              borderRadius: "4px",
                            }}
                          >
                            {coordSuccess}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="card-btn primary"
                          style={{ height: "40px", marginTop: "8px" }}
                        >
                          Hesap Oluştur
                        </button>
                      </form>
                    </div>

                    {/* Right: Coordinators & Commission members list */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <h5 style={{ fontWeight: "600" }}>
                        Kayıtlı Koordinatör & Komisyon Üyeleri (
                        {getCoordinatorsAndCommissionList().length})
                      </h5>
                      {getCoordinatorsAndCommissionList().length === 0 ? (
                        <div
                          className="empty-state"
                          style={{ padding: "40px" }}
                        >
                          Kayıtlı koordinatör veya komisyon üyesi
                          bulunmamaktadır.
                        </div>
                      ) : (
                        <div
                          style={{
                            overflowY: "auto",
                            maxHeight: "300px",
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                          }}
                        >
                          <table className="mod-table" style={{ margin: 0 }}>
                            <thead>
                              <tr>
                                <th>Ad Soyad</th>
                                <th>E-posta</th>
                                <th>Rol</th>
                                <th>İl</th>
                                <th style={{ textAlign: "right" }}>İşlemler</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getCoordinatorsAndCommissionList().map((u) => (
                                <tr key={u.uid}>
                                  <td
                                    style={{
                                      fontWeight: "600",
                                      fontSize: "13px",
                                    }}
                                  >
                                    {u.adSoyad}
                                  </td>
                                  <td>{u.eposta}</td>
                                  <td>
                                    <span
                                      className="card-badge"
                                      style={{
                                        backgroundColor:
                                          u.role === "coordinator"
                                            ? "#e0f2fe"
                                            : "#f3e8ff",
                                        color:
                                          u.role === "coordinator"
                                            ? "#075985"
                                            : "#6b21a8",
                                        fontWeight: "700",
                                        fontSize: "11px",
                                      }}
                                    >
                                      {u.role === "coordinator"
                                        ? "Koordinatör"
                                        : "Komisyon Üyesi"}
                                    </span>
                                  </td>
                                  <td>
                                    <span
                                      className="card-badge"
                                      style={{
                                        backgroundColor: "var(--primary-light)",
                                        color: "var(--primary)",
                                      }}
                                    >
                                      {u.il}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: "right" }}>
                                    {userRole === "admin" ||
                                    (userRole === "coordinator" &&
                                      u.role === "commission") ? (
                                      <div
                                        style={{
                                          display: "inline-flex",
                                          gap: "8px",
                                          justifyContent: "flex-end",
                                        }}
                                      >
                                        <button
                                          onClick={() => {
                                            setEditingUser(u);
                                            setEditForm({
                                              adSoyad: u.adSoyad,
                                              eposta: u.eposta,
                                              telefon: u.telefon || "",
                                              il: u.il,
                                              role: u.role,
                                            });
                                          }}
                                          className="btn-icon"
                                          title="Düzenle"
                                          style={{
                                            border: "none",
                                            background: "none",
                                            color: "var(--text-muted)",
                                            cursor: "pointer",
                                            padding: "4px",
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Edit2 size={14} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteClick(u)}
                                          className="btn-icon"
                                          title="Sil"
                                          style={{
                                            border: "none",
                                            background: "none",
                                            color: "var(--danger)",
                                            cursor: "pointer",
                                            padding: "4px",
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: "var(--text-muted)",
                                          fontStyle: "italic",
                                        }}
                                      >
                                        Kısıtlı
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: User List & Role Management */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0, fontWeight: "700" }}>
                          Sistem Kullanıcıları & Rol Yönetimi
                        </h4>
                        <p className="form-hint" style={{ marginTop: "4px" }}>
                          {userRole === "admin"
                            ? "Sistemdeki tüm kayıtlı kullanıcıların rollerini değiştirebilir veya arama yapabilirsiniz."
                            : `${userProfile?.il} ilindeki kayıtlı kullanıcıların listesi.`}
                        </p>
                      </div>

                      <button
                        className="card-btn secondary"
                        onClick={fetchAllUsers}
                        style={{
                          height: "fit-content",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        Yenile
                      </button>
                    </div>

                    {/* Filter Bar */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          userRole === "admin" ? "2fr 1fr 1fr" : "3fr 1fr",
                        gap: "12px",
                        backgroundColor: "#f8f9fa",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <input
                        type="text"
                        className="form-input"
                        placeholder="İsim, e-posta veya okul ara..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        style={{ margin: 0 }}
                      />

                      <select
                        className="form-input"
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        style={{ margin: 0 }}
                      >
                        <option value="">Tüm Roller</option>
                        <option value="student">Öğrenci</option>
                        <option value="teacher">Danışman Öğretmen</option>
                        <option value="principal">Okul Müdürü</option>
                        <option value="coordinator">İl Koordinatörü</option>
                        <option value="commission">İl Komisyon Üyesi</option>
                      </select>

                      {userRole === "admin" && (
                        <select
                          className="form-input"
                          value={userCityFilter}
                          onChange={(e) => setUserCityFilter(e.target.value)}
                          style={{ margin: 0 }}
                        >
                          <option value="">Tüm İller</option>
                          {cities.map((c) => (
                            <option key={c.plaka} value={c.ad}>
                              {c.ad}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Users Table */}
                    <div className="mod-table-container" style={{ margin: 0 }}>
                      {loadingUsers ? (
                        <div
                          className="empty-state"
                          style={{ padding: "40px" }}
                        >
                          Kullanıcılar yükleniyor...
                        </div>
                      ) : getFilteredUsers().length === 0 ? (
                        <div
                          className="empty-state"
                          style={{ padding: "40px" }}
                        >
                          Kriterlere uygun kullanıcı bulunamadı.
                        </div>
                      ) : (
                        <div style={{ overflowX: "auto", maxHeight: "400px" }}>
                          <table className="mod-table" style={{ margin: 0 }}>
                            <thead>
                              <tr>
                                <th>Ad Soyad</th>
                                <th>E-posta</th>
                                <th>Rol</th>
                                <th>İl / İlçe</th>
                                <th>Okul / Kurum</th>
                                {userRole === "admin" && (
                                  <th style={{ textAlign: "right" }}>İşlem</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {getFilteredUsers().map((u) => (
                                <tr key={u.uid}>
                                  <td style={{ fontWeight: "600" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                      }}
                                    >
                                      {u.adSoyad}
                                      {u.studentProfile?.isStudentRep && (
                                        <span
                                          className="card-badge"
                                          style={{
                                            backgroundColor: "#fff7ed",
                                            color: "var(--warning)",
                                            border: "1px solid #ffedd5",
                                            fontSize: "10px",
                                            padding: "1px 4px",
                                          }}
                                        >
                                          Temsilci
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td>{u.eposta}</td>
                                  <td>
                                    <span
                                      className="card-badge"
                                      style={{
                                        backgroundColor:
                                          u.role === "admin"
                                            ? "#fee2e2"
                                            : u.role === "coordinator"
                                              ? "#e0f2fe"
                                              : u.role === "commission"
                                                ? "#f3e8ff"
                                                : u.role === "principal"
                                                  ? "#fef3c7"
                                                  : u.role === "teacher"
                                                    ? "#dcfce7"
                                                    : "#f1f2f6",
                                        color:
                                          u.role === "admin"
                                            ? "#991b1b"
                                            : u.role === "coordinator"
                                              ? "#075985"
                                              : u.role === "commission"
                                                ? "#6b21a8"
                                                : u.role === "principal"
                                                  ? "#92400e"
                                                  : u.role === "teacher"
                                                    ? "#166534"
                                                    : "var(--text-muted)",
                                        fontWeight: "700",
                                      }}
                                    >
                                      {u.role === "admin"
                                        ? "Admin"
                                        : u.role === "coordinator"
                                          ? "Koordinatör"
                                          : u.role === "commission"
                                            ? "Komisyon Üyesi"
                                            : u.role === "principal"
                                              ? "Müdür"
                                              : u.role === "teacher"
                                                ? "Öğretmen"
                                                : "Öğrenci"}
                                    </span>
                                  </td>
                                  <td>
                                    {u.ilce ? `${u.ilce} / ` : ""}
                                    {u.il}
                                  </td>
                                  <td>{u.schoolId || "-"}</td>
                                  {userRole === "admin" && (
                                    <td
                                      className="mod-actions"
                                      style={{ justifyContent: "flex-end" }}
                                    >
                                      <select
                                        className="form-input"
                                        value={u.role}
                                        onChange={(e) =>
                                          handleRoleChange(
                                            u.uid,
                                            e.target.value,
                                          )
                                        }
                                        style={{
                                          fontSize: "12px",
                                          padding: "4px 8px",
                                          width: "auto",
                                          margin: 0,
                                          height: "30px",
                                        }}
                                      >
                                        <option value="student">Öğrenci</option>
                                        <option value="teacher">
                                          Öğretmen
                                        </option>
                                        <option value="principal">Müdür</option>
                                        <option value="coordinator">
                                          Koordinatör
                                        </option>
                                        <option value="commission">
                                          Komisyon Üyesi
                                        </option>
                                      </select>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Teacher Session fallback (should not hit here because of redirection) */
            <div style={{ textAlign: "center", padding: "20px" }}>
              <h4>Öğretmen Girişi Başarılı!</h4>
              <p className="form-hint">
                Lütfen Öğretmen Paneline yönlendirilmeyi bekleyin.
              </p>
              <button
                className="card-btn primary"
                onClick={() => setModalType("teacher-dashboard")}
                style={{ margin: "16px auto 0" }}
              >
                Öğretmen Paneline Git
              </button>
            </div>
          )}
        </div>
      </div>

      {editingUser && (
        <div
          className="modal-overlay"
          onClick={() => setEditingUser(null)}
          style={{ zIndex: 1100 }}
        >
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "450px",
              width: "90%",
              border: "1px solid var(--border-color)",
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
            }}
          >
            <div
              className="modal-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <h4 style={{ margin: 0, fontWeight: "700" }}>
                Kullanıcı Bilgilerini Düzenle
              </h4>
              <button
                className="close-btn"
                onClick={() => setEditingUser(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div
              className="modal-body"
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label
                  className="form-label"
                  style={{ fontWeight: "600", fontSize: "13px" }}
                >
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.adSoyad}
                  onChange={(e) =>
                    setEditForm({ ...editForm, adSoyad: e.target.value })
                  }
                  style={{ margin: 0 }}
                  required
                />
              </div>
              <div>
                <label
                  className="form-label"
                  style={{ fontWeight: "600", fontSize: "13px" }}
                >
                  E-posta Adresi *
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={editForm.eposta}
                  onChange={(e) =>
                    setEditForm({ ...editForm, eposta: e.target.value })
                  }
                  style={{ margin: 0 }}
                  required
                />
              </div>
              <div>
                <label
                  className="form-label"
                  style={{ fontWeight: "600", fontSize: "13px" }}
                >
                  Telefon Numarası
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.telefon}
                  onChange={(e) =>
                    setEditForm({ ...editForm, telefon: e.target.value })
                  }
                  style={{ margin: 0 }}
                />
              </div>
              <div>
                <label
                  className="form-label"
                  style={{ fontWeight: "600", fontSize: "13px" }}
                >
                  Sorumlu Olduğu İl *
                </label>
                <select
                  className="form-input"
                  value={editForm.il}
                  onChange={(e) =>
                    setEditForm({ ...editForm, il: e.target.value })
                  }
                  disabled={userRole !== "admin"} // Coordinator cannot change province
                  style={{ margin: 0 }}
                  required
                >
                  <option value="">İl Seçin...</option>
                  {cities.map((city) => (
                    <option key={city.plaka} value={city.ad}>
                      {city.ad}
                    </option>
                  ))}
                </select>
              </div>
              {userRole === "admin" && (
                <div>
                  <label
                    className="form-label"
                    style={{ fontWeight: "600", fontSize: "13px" }}
                  >
                    Kullanıcı Rolü *
                  </label>
                  <select
                    className="form-input"
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    style={{ margin: 0 }}
                    required
                  >
                    <option value="coordinator">İl Koordinatörü</option>
                    <option value="commission">İl Komisyon Üyesi</option>
                  </select>
                </div>
              )}
            </div>
            <div
              className="modal-footer"
              style={{
                borderTop: "1px solid var(--border-color)",
                paddingTop: "12px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                className="card-btn secondary"
                onClick={() => setEditingUser(null)}
                style={{ margin: 0 }}
              >
                Vazgeç
              </button>
              <button
                className="card-btn primary"
                onClick={handleEditSubmit}
                style={{ margin: 0 }}
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Moderation;
