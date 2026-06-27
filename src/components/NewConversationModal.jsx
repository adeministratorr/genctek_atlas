import { useState } from "react";
import { X, Search, User } from "lucide-react";
import { useApp } from "../context/AppContext";

const NewConversationModal = ({ onClose, onStartChat }) => {
  const { chatContacts, user } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = (chatContacts || []).filter((contact) => {
    // Prevent starting chat with self
    if (contact.uid === user?.uid) return false;

    const nameMatches = contact.adSoyad?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatches = contact.eposta?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatches || emailMatches;
  });

  const getContactRoleName = (role) => {
    switch (role) {
      case "coordinator":
        return "İl Koordinatörü";
      case "commission":
        return "Komisyon Üyesi";
      case "teacher":
        return "Öğretmen";
      case "student":
        return "Öğrenci";
      default:
        return role;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "450px",
          width: "90%",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 16px 40px rgba(31, 38, 135, 0.08)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>Yeni Sohbet Başlat</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search input */}
        <div
          style={{
            position: "relative",
            marginBottom: "16px",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="İsim veya e-posta ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              outline: "none",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Contacts list */}
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxHeight: "350px",
            paddingRight: "4px",
          }}
        >
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div
                key={contact.uid}
                onClick={() => {
                  onStartChat(contact);
                  onClose();
                }}
                className="item-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  cursor: "pointer",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  margin: 0,
                  boxShadow: "none",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: contact.role === "coordinator" ? "var(--primary-light)" : "rgba(43, 45, 66, 0.08)",
                    color: contact.role === "coordinator" ? "var(--primary)" : "var(--secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User size={20} />
                </div>
                <div style={{ flexGrow: 1, textAlign: "left" }}>
                  <div style={{ fontWeight: "600", fontSize: "14px" }}>{contact.adSoyad || contact.eposta}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", gap: "6px", alignItems: "center" }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "10px",
                        backgroundColor:
                          contact.role === "coordinator"
                            ? "var(--primary-light)"
                            : contact.role === "commission"
                            ? "rgba(255, 183, 3, 0.15)"
                            : "rgba(43, 45, 66, 0.08)",
                        color:
                          contact.role === "coordinator"
                            ? "var(--primary)"
                            : contact.role === "commission"
                            ? "var(--warning)"
                            : "var(--secondary)",
                        fontWeight: "600",
                        fontSize: "10px",
                      }}
                    >
                      {getContactRoleName(contact.role)}
                    </span>
                    {contact.il && <span style={{ fontSize: "11px" }}>• {contact.il}</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "20px 0", color: "var(--text-muted)", fontSize: "14px", textAlign: "center" }}>
              Arama kriterlerine uygun kişi bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
