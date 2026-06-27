import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { MessageSquare, Send, X, ChevronLeft, User, Clock, Sparkles } from "lucide-react";

const StudentChatWidget = () => {
  const {
    user,
    userRole,
    userProfile,
    directMessages,
    chatContacts,
    sendDirectMessage,
    fetchDirectMessages,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [activeContact, setActiveContact] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Poll for messages in mock mode every 5 seconds to simulate real-time replies
  useEffect(() => {
    if (!user || !isOpen) return;
    
    // Initial fetch
    fetchDirectMessages(user.uid);
    
    const interval = setInterval(() => {
      fetchDirectMessages(user.uid);
    }, 5000);

    return () => clearInterval(interval);
  }, [user, isOpen, fetchDirectMessages]);

  // Scroll to bottom when messages list updates or chat opens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [directMessages, activeContact]);

  if (!user || userRole !== "student") return null;

  // Calculate unread count for current student
  const receivedUnreads = directMessages.filter(
    (msg) => msg.receiverId === user.uid && !msg.okundu
  );

  const activeChatMessages = directMessages.filter(
    (msg) =>
      (msg.senderId === user.uid && msg.receiverId === activeContact?.uid) ||
      (msg.senderId === activeContact?.uid && msg.receiverId === user.uid)
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeContact || isSending) return;

    setIsSending(true);
    try {
      await sendDirectMessage(
        activeContact.uid,
        activeContact.adSoyad,
        activeContact.role,
        messageText
      );
      setMessageText("");
      
      // Auto-simulate a response in mock mode after 2 seconds
      if (localStorage.getItem("mock_users")) {
        const text = messageText.toLowerCase();
        setTimeout(() => {
          let replyText = "Mesajınız alındı, en kısa sürede il koordinatörlüğü veya komisyon üyelerimizce incelenip size geri dönülecektir. Çalışmalarınızda başarılar dileriz!";
          if (text.includes("siber") || text.includes("güvenlik") || text.includes("ctf")) {
            replyText = "Siber güvenlik kulübü ve CTF hazırlıklarınız harika! Projenizi sistemde 'Proje Ekle' diyerek haritaya eklerseniz komisyonumuz daha hızlı onaylayacaktır.";
          } else if (text.includes("yapay") || text.includes("zeka") || text.includes("ai")) {
            replyText = "Yapay zekâ ve Vibe Coding temalı grupları çok önemsiyoruz. Çalışma grubunuzdaki görevleri Kanban tahtasında güncel tutarak ekstra XP kazanabilirsiniz.";
          }
          
          const localMsgs = localStorage.getItem("mock_direct_messages");
          const list = localMsgs ? JSON.parse(localMsgs) : [];
          list.push({
            id: "mock-reply-" + Date.now(),
            senderId: activeContact.uid,
            senderName: activeContact.adSoyad,
            senderRole: activeContact.role,
            receiverId: user.uid,
            receiverName: userProfile?.adSoyad || user.email,
            receiverRole: "student",
            il: userProfile?.il || "",
            mesaj: replyText,
            tarih: new Date().toISOString(),
            okundu: false
          });
          localStorage.setItem("mock_direct_messages", JSON.stringify(list));
          fetchDirectMessages(user.uid);
        }, 2500);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const getContactRoleName = (role) => {
    return role === "coordinator" ? "İl Koordinatörü" : "İl Komisyon Üyesi";
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000, fontFamily: "'Inter', sans-serif" }}>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pulse-glow-btn"
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "var(--primary)",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 25px rgba(217, 4, 41, 0.4)",
          transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          position: "relative"
        }}
        title="Koordinasyon & Komisyon İletişim"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        
        {receivedUnreads.length > 0 && (
          <span style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            backgroundColor: "var(--warning)",
            color: "var(--secondary)",
            borderRadius: "50%",
            width: "22px",
            height: "22px",
            fontSize: "11px",
            fontWeight: "800",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 10px rgba(255, 183, 3, 0.6)",
            border: "2px solid white"
          }}>
            {receivedUnreads.length}
          </span>
        )}
      </button>

      {/* Slide-out Chat Panel */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: "absolute",
            bottom: "75px",
            right: "0",
            width: "370px",
            height: "480px",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 12px 35px rgba(43, 45, 66, 0.15)",
            animation: "slideInUp 0.3s ease-out"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, var(--secondary) 0%, #1e2030 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            {activeContact ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={() => setActiveContact(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h4 style={{ color: "white", margin: 0, fontSize: "14px", fontWeight: "700" }}>
                    {activeContact.adSoyad}
                  </h4>
                  <p style={{ margin: 0, fontSize: "11px", color: "rgba(255, 255, 255, 0.7)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#2ec4b6", display: "inline-block" }}></span>
                    {getContactRoleName(activeContact.role)}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h4 style={{ color: "white", margin: 0, fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={16} style={{ color: "var(--warning)" }} /> İl İletişim & Destek
                </h4>
                <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
                  {userProfile?.il || "İl Belirtilmemiş"} GençTek Koordinasyon Ekibi
                </p>
              </div>
            )}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255, 255, 255, 0.7)",
                cursor: "pointer",
                padding: "4px"
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Contact List View */}
          {!activeContact ? (
            <div style={{ flexGrow: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "0 0 4px 0", lineHeight: 1.4 }}>
                Aşağıdaki koordinasyon yetkililerinden birini seçerek doğrudan mesaj gönderebilir, projeleriniz ve kulüp başvurularınız hakkında bilgi alabilirsiniz:
              </p>
              
              {chatContacts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-muted)", fontSize: "13px" }}>
                  İlinizde kayıtlı koordinatör veya komisyon üyesi bulunmamaktadır.
                </div>
              ) : (
                chatContacts.map((contact) => {
                  const lastMsg = directMessages
                    .filter((m) => m.senderId === contact.uid || m.receiverId === contact.uid)
                    .pop();

                  const unreadCount = directMessages.filter(
                    (m) => m.senderId === contact.uid && m.receiverId === user.uid && !m.okundu
                  ).length;

                  return (
                    <div
                      key={contact.uid}
                      onClick={() => setActiveContact(contact)}
                      className="glass-panel"
                      style={{
                        padding: "14px",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.2s ease",
                        border: "1px solid var(--border-color)",
                        position: "relative"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.borderColor = "rgba(217, 4, 41, 0.2)";
                        e.currentTarget.style.boxShadow = "var(--shadow-md)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "var(--border-color)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "var(--primary-light)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "14px",
                        flexShrink: 0
                      }}>
                        {contact.adSoyad?.charAt(0).toUpperCase() || <User size={18} />}
                      </div>

                      {/* Info */}
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <h5 style={{ margin: 0, fontSize: "13.5px", fontWeight: "700", color: "var(--secondary)" }}>
                            {contact.adSoyad}
                          </h5>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                            {lastMsg && new Date(lastMsg.tarih).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <p style={{ margin: "2px 0 0 0", fontSize: "11px", fontWeight: "600", color: contact.role === "coordinator" ? "#0284c7" : "#0d9488" }}>
                          {getContactRoleName(contact.role)}
                        </p>
                        
                        {lastMsg && (
                          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {lastMsg.mesaj}
                          </p>
                        )}
                      </div>

                      {/* Online dot & unread badge */}
                      <span style={{
                        position: "absolute",
                        top: "14px",
                        left: "44px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#2ec4b6",
                        border: "2px solid white",
                        boxShadow: "0 0 8px #2ec4b6"
                      }}></span>

                      {unreadCount > 0 && (
                        <span style={{
                          backgroundColor: "var(--primary)",
                          color: "white",
                          borderRadius: "50%",
                          minWidth: "18px",
                          height: "18px",
                          fontSize: "10px",
                          fontWeight: "800",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "2px"
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Active Chat Thread View */
            <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "calc(100% - 53px)" }}>
              {/* Messages Area */}
              <div style={{ flexGrow: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#fcfdfe" }}>
                {activeChatMessages.length === 0 ? (
                  <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)", fontSize: "12px", padding: "20px", maxWidth: "240px", lineHeight: 1.4 }}>
                    <MessageSquare size={32} style={{ margin: "0 auto 10px auto", opacity: 0.3, color: "var(--primary)" }} />
                    Sohbeti başlatmak için ilk mesajınızı gönderin! Sorularınız en kısa sürede yanıtlanacaktır.
                  </div>
                ) : (
                  activeChatMessages.map((msg) => {
                    const isSelf = msg.senderId === user.uid;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isSelf ? "flex-end" : "flex-start",
                          maxWidth: "80%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isSelf ? "flex-end" : "flex-start"
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: isSelf ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                            backgroundColor: isSelf ? "var(--primary)" : "var(--bg-main)",
                            color: isSelf ? "white" : "var(--text-main)",
                            fontSize: "12.5px",
                            fontWeight: "500",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                            lineHeight: 1.45,
                            border: isSelf ? "none" : "1px solid var(--border-color)"
                          }}
                        >
                          {msg.mesaj}
                        </div>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginTop: "3px",
                          fontSize: "9.5px",
                          color: "var(--text-muted)"
                        }}>
                          <Clock size={10} />
                          <span>{new Date(msg.tarih).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid var(--border-color)",
                  backgroundColor: "white",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center"
                }}
              >
                <input
                  type="text"
                  placeholder="Mesajınızı yazın..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="form-control"
                  style={{
                    padding: "10px 14px",
                    borderRadius: "50px",
                    fontSize: "13px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "#f8f9fa",
                    margin: 0
                  }}
                  disabled={isSending}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    flexShrink: 0,
                    boxShadow: "0 4px 10px rgba(217, 4, 41, 0.2)"
                  }}
                  disabled={!messageText.trim() || isSending}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentChatWidget;
