import { useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useApp } from "./context/AppContext";

// Components
import Header from "./components/Header";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Map from "./components/Map";
import Filters from "./components/Filters";
import EventCard from "./components/EventCard";
import ProjectCard from "./components/ProjectCard";
import EventForm from "./components/EventForm";
import ProjectForm from "./components/ProjectForm";
import Moderation from "./components/Moderation";
import TeacherRegister from "./components/TeacherRegister";
import TeacherDashboard from "./components/TeacherDashboard";
import PrincipalDashboard from "./components/PrincipalDashboard";
import StudentRegister from "./components/StudentRegister";
import UserProfileModal from "./components/UserProfileModal";
import ApplicationForm from "./components/ApplicationForm";
import Footer from "./components/Footer";
import StudyGroupHub from "./components/StudyGroupHub";
import EventDetailsModal from "./components/EventDetailsModal";
import StudentChatWidget from "./components/StudentChatWidget";
import MessagingHub from "./components/MessagingHub";
import SchoolProfileModal from "./components/SchoolProfileModal";
import DemoConsole from "./components/DemoConsole";
import OfflineIndicator from "./components/OfflineIndicator";
import AnalyticsTab from "./components/AnalyticsTab";

// Icons
import { Calendar, FolderGit2, Star } from "lucide-react";

function App() {
  const {
    events,
    projects,
    selectedCity,
    setSelectedCity,
    modalType,
    setModalType,
    selectedDetailEvent,
    loading,
    user,
  } = useApp();

  const [activeListTab, setActiveListTab] = useState("events"); // Local state for events vs projects

  // Separate events by state: upcoming (duyuru) vs past/completed (gerceklesti)
  // Inside each, sort starred (featured) first
  const upcomingEvents = events
    .filter((e) => e.durum === "duyuru" || e.yaklasan === true)
    .sort((a, b) => (b.oneCikar ? 1 : 0) - (a.oneCikar ? 1 : 0));
  
  const pastEvents = events
    .filter((e) => e.durum === "gerceklesti" || (e.durum !== "duyuru" && e.yaklasan !== true))
    .sort((a, b) => (b.oneCikar ? 1 : 0) - (a.oneCikar ? 1 : 0));

  const starredProjects = projects.filter((p) => p.oneCikar);
  const regularProjects = projects.filter((p) => !p.oneCikar);

  const loginPrompt = (
    <div className="empty-state" style={{ padding: "40px 20px" }}>
      <h3 style={{ fontWeight: "700", color: "var(--secondary)" }}>🔒 Giriş Yapılması Gerekli</h3>
      <p style={{ margin: "12px 0 20px 0", color: "var(--text-muted)", fontSize: "14px" }}>
        Bu alanı görüntülemek için giriş yapmalısınız.
      </p>
      <button 
        onClick={() => setModalType("login")}
        className="btn btn-primary"
        style={{ padding: "10px 24px" }}
      >
        Giriş Yap
      </button>
    </div>
  );

  const atlasDashboard = (
    <div className="dashboard-grid">
      {/* Left Column: Interactive Map & Filters */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "30px",
          alignSelf: "start",
          width: "100%",
        }}
      >
        <Map />

        <div
          style={{
            backgroundColor: "var(--bg-card)",
            padding: "24px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h3 className="section-title" style={{ marginBottom: "20px" }}>
            Arama ve Filtreler
          </h3>
          <Filters activeListTab={activeListTab} />
        </div>
      </div>

      {/* Right Column: Dynamic Tabs & Cards List */}
      <div className="content-list-section">
        {/* Tab Selection Headers */}
        <div className="list-tabs">
          <div
            className={`list-tab ${activeListTab === "events" ? "active" : ""}`}
            onClick={() => setActiveListTab("events")}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Calendar size={18} /> Etkinlikler ({events.length})
          </div>
          <div
            className={`list-tab ${activeListTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveListTab("projects")}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <FolderGit2 size={18} /> Projeler ({projects.length})
          </div>
        </div>

        {/* Selected City Info Tag */}
        {selectedCity && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              backgroundColor: "var(--primary-light)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(217, 4, 41, 0.15)",
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--primary)",
            }}
          >
            <span>{selectedCity} ili için sonuçlar listeleniyor</span>
            <button
              onClick={() => setSelectedCity("")}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                fontWeight: "800",
              }}
            >
              Temizle
            </button>
          </div>
        )}

        {/* Cards List Container */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {loading ? (
            <div className="empty-state">Veriler yükleniyor...</div>
          ) : activeListTab === "events" ? (
            /* EVENTS LIST */
            events.length === 0 ? (
              <div className="empty-state">
                Sonuç bulunamadı. Yeni bir etkinlik kaydederek haritaya
                ekleyebilirsiniz!
              </div>
            ) : (
              <>
                {/* Upcoming Events Section */}
                {upcomingEvents.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: "16px", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid var(--primary-light)", paddingBottom: "8px", fontWeight: "700" }}>
                      <Calendar size={18} style={{ color: "var(--primary)" }} /> Yaklaşan Etkinlikler (Ön Duyuru & Başvuru)
                    </h4>
                    <div className="cards-grid">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} style={{ position: "relative" }}>
                          {event.oneCikar && (
                            <div
                              style={{
                                position: "absolute",
                                right: "16px",
                                top: "16px",
                                zIndex: 5,
                                color: "var(--warning)",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                fontWeight: "800",
                                backgroundColor: "#fff7ed",
                                padding: "4px 8px",
                                borderRadius: "50px",
                                border: "1px solid #ffedd5",
                              }}
                            >
                              <Star size={12} fill="var(--warning)" /> ÖNE ÇIKAN
                            </div>
                          )}
                          <EventCard event={event} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past/Resulted Events Section */}
                {pastEvents.length > 0 && (
                  <div style={{ marginTop: upcomingEvents.length > 0 ? "20px" : "0" }}>
                    <h4 style={{ marginBottom: "16px", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid var(--border-color)", paddingBottom: "8px", fontWeight: "700" }}>
                      <Calendar size={18} style={{ color: "var(--text-muted)" }} /> Son Etkinlikler (Haber ve Raporlar)
                    </h4>
                    <div className="cards-grid">
                      {pastEvents.map((event) => (
                        <div key={event.id} style={{ position: "relative" }}>
                          {event.oneCikar && (
                            <div
                              style={{
                                position: "absolute",
                                right: "16px",
                                top: "16px",
                                zIndex: 5,
                                color: "var(--warning)",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                fontWeight: "800",
                                backgroundColor: "#fff7ed",
                                padding: "4px 8px",
                                borderRadius: "50px",
                                border: "1px solid #ffedd5",
                              }}
                            >
                              <Star size={12} fill="var(--warning)" /> ÖNE ÇIKAN
                            </div>
                          )}
                          <EventCard event={event} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )
          ) : (
            /* PROJECTS LIST */
            projects.length === 0 ? (
              <div className="empty-state">
                Sonuç bulunamadı. Yeni bir proje kaydederek haritaya
                ekleyebilirsiniz!
              </div>
            ) : (
              <div className="cards-grid">
                {/* Starred / Featured Projects First */}
                {starredProjects.map((project) => (
                  <div key={project.id} style={{ position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        right: "16px",
                        top: "16px",
                        zIndex: 5,
                        color: "var(--warning)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: "800",
                        backgroundColor: "#fff7ed",
                        padding: "4px 8px",
                        borderRadius: "50px",
                        border: "1px solid #ffedd5",
                      }}
                    >
                      <Star size={12} fill="var(--warning)" /> ÖNE ÇIKAN
                    </div>
                    <ProjectCard project={project} />
                  </div>
                ))}

                {/* Regular Projects */}
                {regularProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="app-wrapper"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <OfflineIndicator />
      {/* Header */}
      <Header />

      {/* Hero */}
      <Hero />

      {/* Stats */}
      <Stats />

      {/* Main Content Area */}
      <main className="container" style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={atlasDashboard} />
          
          <Route path="/messages" element={
            <div className="full-width-section" style={{ padding: "20px 0" }}>
              <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-start" }}>
                <Link to="/" className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "50px", fontSize: "14px", fontWeight: "600" }}>
                  ← Haritaya ve Etkinliklere Dön
                </Link>
              </div>
              {!user ? loginPrompt : <MessagingHub />}
            </div>
          } />

          <Route path="/groups" element={
            <div className="full-width-section" style={{ padding: "20px 0" }}>
              <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-start" }}>
                <Link to="/" className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "50px", fontSize: "14px", fontWeight: "600" }}>
                  ← Haritaya ve Etkinliklere Dön
                </Link>
              </div>
              {!user ? loginPrompt : <StudyGroupHub />}
            </div>
          } />

          <Route path="/analytics" element={
            <div className="full-width-section" style={{ padding: "20px 0" }}>
              <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-start" }}>
                <Link to="/" className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "50px", fontSize: "14px", fontWeight: "600" }}>
                  ← Haritaya ve Etkinliklere Dön
                </Link>
              </div>
              <AnalyticsTab />
            </div>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Forms & Auth Modals */}
      {modalType === "event-register" && <EventForm />}
      {modalType === "project-register" && <ProjectForm />}
      {(modalType === "login" || modalType === "moderation") && <Moderation />}
      {modalType === "teacher-register" && <TeacherRegister />}
      {modalType === "teacher-dashboard" && <TeacherDashboard />}
      {modalType === "principal-dashboard" && <PrincipalDashboard />}
      {modalType === "student-register" && <StudentRegister />}
      {modalType === "user-profile" && <UserProfileModal />}
      {modalType === "school-profile" && <SchoolProfileModal />}
      <DemoConsole isOpen={modalType === "demo-console"} onClose={() => setModalType(null)} />
      {modalType === "apply-event" && selectedDetailEvent && (
        <ApplicationForm event={selectedDetailEvent} />
      )}
      {modalType !== "apply-event" && modalType !== "user-profile" && modalType !== "school-profile" && modalType !== "demo-console" && <EventDetailsModal />}
      
      {/* Floating Direct Messaging widget for students */}
      <StudentChatWidget />
    </div>
  );
}

export default App;
