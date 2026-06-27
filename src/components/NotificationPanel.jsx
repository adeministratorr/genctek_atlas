import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { 
  MessageSquare, 
  Award, 
  Calendar, 
  Users, 
  Trash2, 
  CheckCheck,
  Bell,
  X,
  Volume2
} from "lucide-react";

export default function NotificationPanel({ onClose }) {
  const {
    notifications,
    announcements,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    setActiveTab
  } = useApp();

  const [activeTabName, setActiveTabName] = useState("notifications"); // 'notifications' | 'announcements'
  const [readAnnouncements, setReadAnnouncements] = useState([]);
  const panelRef = useRef(null);

  // Load read announcements from LocalStorage
  useEffect(() => {
    const local = localStorage.getItem("read_announcements");
    if (local) {
      setTimeout(() => {
        setReadAnnouncements(JSON.parse(local));
      }, 0);
    }
  }, []);

  // Handle click outside to close the panel
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // Prevent closing if we clicked on the bell icon (handled by Header)
        if (!event.target.closest(".notification-bell-container")) {
          onClose();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleMarkAnnouncementAsRead = (annId) => {
    if (readAnnouncements.includes(annId)) return;
    const updated = [...readAnnouncements, annId];
    setReadAnnouncements(updated);
    localStorage.setItem("read_announcements", JSON.stringify(updated));
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
    }
    if (notif.link) {
      setActiveTab(notif.link);
    }
    onClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageSquare size={16} className="text-blue-500" />;
      case "project":
        return <Award size={16} className="text-green-500" />;
      case "event":
        return <Calendar size={16} className="text-red-500" />;
      case "group":
        return <Users size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="notification-popover" ref={panelRef} data-testid="notification-popover">
      <div className="notification-header">
        <h3>Bildirim Merkezi</h3>
        <div className="flex items-center gap-2">
          {activeTabName === "notifications" && notifications.some(n => !n.read) && (
            <button 
              onClick={markAllNotificationsAsRead}
              className="notification-footer-btn flex items-center gap-1"
              title="Tümünü Okundu İşaretle"
              data-testid="mark-all-read-btn"
            >
              <CheckCheck size={14} />
              Tümünü Oku
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="notification-tabs">
        <button
          onClick={() => setActiveTabName("notifications")}
          className={`notification-tab-btn ${activeTabName === "notifications" ? "active" : ""}`}
          data-testid="tab-notifications"
        >
          Bildirimler ({notifications.filter(n => !n.read).length})
        </button>
        <button
          onClick={() => setActiveTabName("announcements")}
          className={`notification-tab-btn ${activeTabName === "announcements" ? "active" : ""}`}
          data-testid="tab-announcements"
        >
          Duyurular ({announcements.filter(a => !readAnnouncements.includes(a.id)).length})
        </button>
      </div>

      <div className="notification-list">
        {activeTabName === "notifications" ? (
          notifications.length === 0 ? (
            <div className="notification-empty" data-testid="notifications-empty">
              <Bell size={24} className="text-gray-400" />
              <p>Yeni bir bildiriminiz bulunmuyor.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`notification-item ${!notif.read ? "unread" : ""}`}
                data-testid={`notification-item-${notif.id}`}
              >
                <div className="notification-icon-wrapper">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notif.title}</div>
                  <div className="notification-text">{notif.icerik}</div>
                  <div className="notification-time">{formatDate(notif.date)}</div>
                </div>
                <div className="notification-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="notification-delete-btn"
                    title="Bildirimi Sil"
                    aria-label="Bildirimi Sil"
                    data-testid={`delete-notif-${notif.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          announcements.length === 0 ? (
            <div className="notification-empty" data-testid="announcements-empty">
              <Volume2 size={24} className="text-gray-400" />
              <p>Yayınlanmış bir genel duyuru bulunmuyor.</p>
            </div>
          ) : (
            announcements.map((ann) => {
              const isUnread = !readAnnouncements.includes(ann.id);
              return (
                <div
                  key={ann.id}
                  onClick={() => handleMarkAnnouncementAsRead(ann.id)}
                  className={`notification-item ${isUnread ? "unread" : ""}`}
                  data-testid={`announcement-item-${ann.id}`}
                >
                  <div className="notification-icon-wrapper">
                    <Volume2 size={16} className="text-red-500" />
                  </div>
                  <div className="notification-content">
                    <div className="notification-title flex items-center gap-2">
                      {ann.baslik}
                      {isUnread && (
                        <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">
                          YENİ
                        </span>
                      )}
                    </div>
                    <div className="notification-text">{ann.icerik}</div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {ann.authorName} ({ann.authorRole === "admin" ? "Yönetici" : ann.authorRole})
                      </span>
                      <div className="notification-time">{formatDate(ann.date)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}
