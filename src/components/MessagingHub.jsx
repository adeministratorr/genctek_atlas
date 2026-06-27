import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { MessageSquare, Send, User, Search, MessageCircle, Check, CheckCheck } from "lucide-react";
import NewConversationModal from "./NewConversationModal";

const MessagingHub = () => {
  const {
    user,
    userRole,
    directMessages,
    sendDirectMessage,
    markMessagesAsRead,
    fetchDirectMessages,
  } = useApp();

  const [activeContact, setActiveContact] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom when active conversation changes or new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [directMessages, activeContact]);

  // Mark messages as read when active contact is opened or new unread messages arrive for this contact
  useEffect(() => {
    if (user && activeContact) {
      markMessagesAsRead(activeContact.uid);
    }
  }, [user, activeContact, directMessages, markMessagesAsRead]);

  if (!user) {
    return (
      <div className="glass-panel" style={{ padding: "40px", textAlign: "center", marginTop: "40px" }}>
        <h3>Giriş Yapılması Gerekli</h3>
        <p>Mesajlaşma özelliğini kullanabilmek için lütfen giriş yapın.</p>
      </div>
    );
  }

  // Extract unique active chat contacts from directMessages
  const activeChats = [];
  const trackedUids = new Set();

  directMessages.forEach((msg) => {
    const isSentByMe = msg.senderId === user.uid;
    const partnerId = isSentByMe ? msg.receiverId : msg.senderId;
    const partnerName = isSentByMe ? msg.receiverName : msg.senderName;
    const partnerRole = isSentByMe ? msg.receiverRole : msg.senderRole;

    if (!partnerId || partnerId === user.uid) return;

    if (!trackedUids.has(partnerId)) {
      trackedUids.add(partnerId);
      
      // Calculate unread count from this partner to me
      const partnerUnreads = directMessages.filter(
        (m) => m.senderId === partnerId && m.receiverId === user.uid && !m.okundu
      );

      // Find the last message in this conversation
      const conversationMessages = directMessages.filter(
        (m) =>
          (m.senderId === user.uid && m.receiverId === partnerId) ||
          (m.senderId === partnerId && m.receiverId === user.uid)
      );
      const lastMsg = conversationMessages[conversationMessages.length - 1];

      activeChats.push({
        uid: partnerId,
        adSoyad: partnerName,
        role: partnerRole,
        il: msg.il || "",
        lastMessage: lastMsg ? lastMsg.mesaj : "",
        lastMessageTime: lastMsg ? lastMsg.tarih : "",
        unreadCount: partnerUnreads.length,
      });
    }
  });

  // Filter contacts by search query
  const filteredChats = activeChats.filter((chat) => {
    return chat.adSoyad?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter messages for active chat
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
      
      // Auto-simulate a response in mock mode
      if (localStorage.getItem("mock_users")) {
        const text = messageText.toLowerCase();
        setTimeout(() => {
          let replyText = "Mesajınız iletildi. En kısa sürede geri dönüş yapılacaktır.";
          if (text.includes("siber") || text.includes("güvenlik") || text.includes("ctf")) {
            replyText = "Siber güvenlik alanındaki heyecanınız harika! Sorularınız için koordinatörlüğümüz her zaman hazır.";
          } else if (text.includes("merhaba") || text.includes("selam")) {
            replyText = `Merhaba! Size nasıl yardımcı olabilirim? GençTek Atlas ile ilgili tüm sorularınızı yanıtlamaktan memnuniyet duyarım.`;
          }
          
          const localMsgs = localStorage.getItem("mock_direct_messages");
          const list = localMsgs ? JSON.parse(localMsgs) : [];
          list.push({
            id: "mock-reply-" + Date.now(),
            senderId: activeContact.uid,
            senderName: activeContact.adSoyad,
            senderRole: activeContact.role,
            receiverId: user.uid,
            receiverName: user.email,
            receiverRole: userRole,
            il: activeContact.il || "",
            mesaj: replyText,
            tarih: new Date().toISOString(),
            okundu: false
          });
          localStorage.setItem("mock_direct_messages", JSON.stringify(list));
          
          if (typeof fetchDirectMessages === "function") {
            fetchDirectMessages(user.uid);
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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

  const handleStartChat = (contact) => {
    setActiveContact(contact);
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        height: "calc(100vh - 280px)",
        minHeight: "450px",
        maxHeight: "750px",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        boxShadow: "var(--shadow-lg)",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Left Conversations Panel */}
      <div
        style={{
          borderRight: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "rgba(248, 250, 252, 0.45)",
          backdropFilter: "blur(10px)"
        }}
      >
        {/* Panel Header */}
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageCircle size={20} className="color-primary" /> Mesajlar
            </h3>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="btn btn-primary btn-sm"
              style={{ padding: "6px 12px", borderRadius: "50px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
            >
              Yeni Sohbet
            </button>
          </div>
          
          {/* Search bar */}
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Konuşmalarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px 8px 36px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                backgroundColor: "rgba(255, 255, 255, 0.65)",
                fontSize: "13px",
                outline: "none"
              }}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => {
              const isActive = activeContact?.uid === chat.uid;
              return (
                <div
                  key={chat.uid}
                  onClick={() => setActiveContact(chat)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px 20px",
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(43, 45, 66, 0.05)",
                    backgroundColor: isActive ? "rgba(217, 4, 41, 0.08)" : "transparent",
                    transition: "background-color 0.2s ease",
                  }}
                  className="chat-list-item"
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: chat.role === "coordinator" ? "var(--primary-light)" : "rgba(43, 45, 66, 0.08)",
                      color: chat.role === "coordinator" ? "var(--primary)" : "var(--secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <User size={22} />
                  </div>
                  <div style={{ flexGrow: 1, overflow: "hidden", textAlign: "left" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                      <span style={{ fontWeight: "600", fontSize: "14px", color: "var(--secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {chat.adSoyad}
                      </span>
                      {chat.lastMessageTime && (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexGrow: 1, paddingRight: "8px" }}>
                        {chat.lastMessage}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span
                          style={{
                            backgroundColor: "var(--primary)",
                            color: "white",
                            fontSize: "10px",
                            fontWeight: "700",
                            borderRadius: "50%",
                            minWidth: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "2px",
                            flexShrink: 0,
                          }}
                        >
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "40px 20px", color: "var(--text-muted)", fontSize: "14px", textAlign: "center" }}>
              Henüz bir sohbet geçmişiniz yok. "Yeni Sohbet" butonunu kullanarak mesajlaşmaya başlayabilirsiniz.
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Window Panel */}
      <div style={{ display: "flex", flexDirection: "column", backgroundColor: "rgba(255, 255, 255, 0.45)" }}>
        {activeContact ? (
          <>
            {/* Active Contact Header */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "rgba(255, 255, 255, 0.65)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: activeContact.role === "coordinator" ? "var(--primary-light)" : "rgba(43, 45, 66, 0.08)",
                    color: activeContact.role === "coordinator" ? "var(--primary)" : "var(--secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "15px", color: "var(--secondary)" }}>{activeContact.adSoyad}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", gap: "6px", alignItems: "center" }}>
                    <span style={{ fontWeight: "600", color: activeContact.role === "coordinator" ? "var(--primary)" : "var(--secondary)" }}>
                      {getContactRoleName(activeContact.role)}
                    </span>
                    {activeContact.il && <span>• {activeContact.il}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Message History */}
            <div
              style={{
                flexGrow: 1,
                padding: "24px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                backgroundColor: "rgba(240, 242, 245, 0.3)"
              }}
            >
              {activeChatMessages.map((msg) => {
                const isMyMessage = msg.senderId === user.uid;
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMyMessage ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMyMessage ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 16px",
                        borderRadius: "16px",
                        borderBottomRightRadius: isMyMessage ? "4px" : "16px",
                        borderBottomLeftRadius: isMyMessage ? "16px" : "4px",
                        backgroundColor: isMyMessage ? "var(--primary)" : "white",
                        color: isMyMessage ? "white" : "var(--secondary)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        fontSize: "14px",
                        lineHeight: "1.4",
                        textAlign: "left",
                        border: isMyMessage ? "none" : "1px solid rgba(0,0,0,0.05)"
                      }}
                    >
                      {msg.mesaj}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "4px",
                        fontSize: "11px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <span>{formatTime(msg.tarih)}</span>
                      {isMyMessage && (
                        msg.okundu ? (
                          <CheckCheck size={14} style={{ color: "var(--primary)" }} />
                        ) : (
                          <Check size={14} />
                        )
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Footer */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--border-color)",
                display: "flex",
                gap: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.65)"
              }}
            >
              <input
                type="text"
                placeholder="Mesajınızı yazın..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={isSending}
                style={{
                  flexGrow: 1,
                  padding: "12px 16px",
                  borderRadius: "50px",
                  border: "1px solid var(--border-color)",
                  outline: "none",
                  fontSize: "14px",
                  backgroundColor: "white"
                }}
              />
              <button
                type="submit"
                disabled={!messageText.trim() || isSending}
                className="btn btn-primary"
                style={{
                  borderRadius: "50%",
                  width: "44px",
                  height: "44px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", gap: "12px" }}>
            <MessageSquare size={48} style={{ color: "rgba(217, 4, 41, 0.15)" }} />
            <div style={{ fontSize: "16px", fontWeight: "600" }}>Sohbet Seçilmedi</div>
            <p style={{ margin: 0, fontSize: "14px" }}>Bir konuşmaya tıklayarak veya yeni sohbet başlatarak mesajlaşmaya başlayın.</p>
          </div>
        )}
      </div>

      {/* New Conversation Modal pop-up */}
      {showNewChatModal && (
        <NewConversationModal
          onClose={() => setShowNewChatModal(false)}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
};

export default MessagingHub;
