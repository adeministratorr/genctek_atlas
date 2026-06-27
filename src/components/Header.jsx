import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LogIn, LogOut, PlusCircle, LayoutDashboard, GraduationCap, User, MessageSquare, Bell, Users, Map, BarChart3 } from "lucide-react";
import logoImg from "../assets/logo.png";
import NotificationPanel from "./NotificationPanel";

const Header = () => {
  const { 
    user, 
    userRole, 
    userProfile, 
    logoutModerator, 
    setModalType,
    directMessages,
    notifications,
    announcements
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);

  const getDashboardButton = () => {
    switch (userRole) {
      case "admin":
        return (
          <button
            className="nav-link active"
            onClick={() => setModalType("moderation")}
            style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", background: "none", cursor: "pointer" }}
          >
            <LayoutDashboard size={16} /> Yönetim Paneli
          </button>
        );
      case "coordinator":
        return (
          <button
            className="nav-link active"
            onClick={() => setModalType("moderation")}
            style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", background: "none", cursor: "pointer" }}
          >
            <LayoutDashboard size={16} /> Koordinatör Paneli
          </button>
        );
      case "commission":
        return (
          <button
            className="nav-link active"
            onClick={() => setModalType("moderation")}
            style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", background: "none", cursor: "pointer" }}
          >
            <LayoutDashboard size={16} /> Komisyon Paneli
          </button>
        );
      case "principal":
        return (
          <button
            className="nav-link active"
            onClick={() => setModalType("principal-dashboard")}
            style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", background: "none", cursor: "pointer" }}
          >
            <GraduationCap size={16} /> Müdür Paneli
          </button>
        );
      case "teacher":
        return (
          <button
            className="nav-link active"
            onClick={() => setModalType("teacher-dashboard")}
            style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", background: "none", cursor: "pointer" }}
          >
            <GraduationCap size={16} /> Danışman Paneli
          </button>
        );
      default:
        return null;
    }
  };

  const readAnnouncementsLocal = JSON.parse(localStorage.getItem("read_announcements") || "[]");
  const unreadNotifCount = (notifications || []).filter(n => !n.read).length;
  const unreadAnnCount = (announcements || []).filter(a => !readAnnouncementsLocal.includes(a.id)).length;
  const totalUnreadCount = unreadNotifCount + unreadAnnCount;

  return (
    <header className="app-header" id="app-header">
      <div className="container header-container">
        {/* Logo Section */}
        <div 
          className="logo-section"
          onClick={() => {
            navigate("/");
            setModalType(null);
          }}
          style={{ cursor: "pointer" }}
        >
          <img src={logoImg} alt="GençTek Atlas" className="logo-img" />
        </div>

        {/* Navigation / Actions */}
        <nav className="nav-menu" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            className="nav-link demo-btn"
            onClick={() => setModalType("demo-console")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "none",
              background: "rgba(217, 4, 41, 0.08)",
              color: "var(--primary)",
              cursor: "pointer",
              padding: "6px 12px",
              borderRadius: "50px",
              fontWeight: "800",
              animation: "pulse 2s infinite"
            }}
            title="Jüri Demo Paneli"
          >
            ⚡ Demo
          </button>
          <button
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => {
              navigate("/");
              setModalType(null);
            }}
            style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", background: "none", cursor: "pointer" }}
            title="Harita ve Etkinlikler"
          >
            <Map size={16} /> Atlas
          </button>
          <button
            className={`nav-link ${location.pathname === "/analytics" ? "active" : ""}`}
            onClick={() => {
              navigate("/analytics");
              setModalType(null);
            }}
            style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", background: "none", cursor: "pointer" }}
            title="Gelişmiş Analiz ve Raporlama"
          >
            <BarChart3 size={16} /> Analiz
          </button>
          {/* Only allow adding events/projects if user is not a student */}
          {userRole !== "student" && (
            <>
              <button
                className="nav-link"
                onClick={() => setModalType("event-register")}
                style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", background: "none", cursor: "pointer" }}
              >
                <PlusCircle size={16} /> Etkinlik Ekle
              </button>

              <button
                className="nav-link"
                onClick={() => setModalType("project-register")}
                style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", background: "none", cursor: "pointer" }}
              >
                <PlusCircle size={16} /> Proje Ekle
              </button>
            </>
          )}

          {user ? (
            <>
              {getDashboardButton()}

              {/* Study Groups Button */}
              <button
                className={`nav-link ${location.pathname === "/groups" ? "active" : ""}`}
                onClick={() => {
                  navigate("/groups");
                  setModalType(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: "6px"
                }}
                title="Gruplarım"
              >
                <Users size={18} />
                <span style={{ fontSize: "14px", fontWeight: "600" }}>Gruplarım</span>
              </button>

              {/* Message Bell / Square Icon */}
              {(() => {
                const unreadCount = (directMessages || []).filter(
                  (msg) => msg.receiverId === user.uid && !msg.okundu
                ).length;
                return (
                  <button
                    className={`nav-link ${location.pathname === "/messages" ? "active" : ""}`}
                    onClick={() => {
                      navigate("/messages");
                      setModalType(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      position: "relative",
                      padding: "6px"
                    }}
                    title="Mesajlar"
                  >
                    <MessageSquare size={18} />
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>Mesajlarım</span>
                    {unreadCount > 0 && (
                      <span style={{
                        position: "absolute",
                        top: "-2px",
                        right: "-2px",
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
                        border: "1.5px solid white"
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })()}

              {/* Notification Bell Icon */}
              <div style={{ position: "relative" }}>
                <button
                  className="nav-link"
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "6px"
                  }}
                  title="Bildirimler"
                  data-testid="notification-bell-btn"
                >
                  <Bell size={18} />
                  {totalUnreadCount > 0 && (
                    <span style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
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
                      border: "1.5px solid white"
                    }}
                    data-testid="notification-badge"
                    >
                      {totalUnreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                )}
              </div>

              {/* User Avatar + Name (UserProfile Modal Trigger) */}
              <div 
                onClick={() => setModalType("user-profile")}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px", 
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  transition: "background 0.2s",
                }}
                className="nav-link-avatar-container"
              >
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-light)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  fontSize: "12px"
                }}>
                  {userProfile?.adSoyad?.charAt(0).toUpperCase() || <User size={12} />}
                </div>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--secondary)" }}>
                  {userProfile?.adSoyad?.split(" ")[0]}
                </span>
              </div>

              <button
                className="nav-link nav-btn"
                onClick={logoutModerator}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <LogOut size={16} /> Çıkış
              </button>
            </>
          ) : (
            <button
              className="nav-link nav-btn"
              onClick={() => setModalType("login")}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <LogIn size={16} /> Giriş Yap
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
