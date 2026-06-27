import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Plus, X, Calendar, Award, User, Clock, AlertCircle } from "lucide-react";

const TaskBoard = ({ groupMembers }) => {
  const {
    activeGroup,
    groupTasks,
    createGroupTask,
    updateGroupTaskStatus,
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assignedTo: [],
    xpReward: 50,
  });
  const [loading, setLoading] = useState(false);
  const [dragOverCol, setDragOverCol] = useState(null);

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, colStatus) => {
    e.preventDefault();
    setDragOverCol(colStatus);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      await updateGroupTaskStatus(taskId, targetStatus, activeGroup.id);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    setLoading(true);
    try {
      await createGroupTask(activeGroup.id, taskForm);
      setTaskForm({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        assignedTo: [],
        xpReward: 50,
      });
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssigneeToggle = (memberUid) => {
    const current = [...taskForm.assignedTo];
    const idx = current.indexOf(memberUid);
    if (idx === -1) {
      current.push(memberUid);
    } else {
      current.splice(idx, 1);
    }
    setTaskForm({ ...taskForm, assignedTo: current });
  };

  // Helper to resolve assignee names
  const getAssigneeNames = (assignedUids) => {
    if (!assignedUids || assignedUids.length === 0) return "Atanmamış";
    return assignedUids
      .map((uid) => {
        const match = groupMembers.find((m) => m.uid === uid);
        return match ? match.adSoyad : "Bilinmeyen Üye";
      })
      .join(", ");
  };

  // Priority color and styling helper
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return <span className="badge glow-badge-primary" style={{ backgroundColor: "#fee2e2", color: "#ef4444", fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "50px" }}>Kritik</span>;
      case "medium":
        return <span className="badge glow-badge-warning" style={{ backgroundColor: "#fef3c7", color: "#d97706", fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "50px" }}>Orta</span>;
      case "low":
      default:
        return <span className="badge glow-badge-success" style={{ backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "50px" }}>Düşük</span>;
    }
  };

  // Left border color according to priority
  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low":
      default: return "#10b981";
    }
  };

  const columns = [
    { id: "todo", title: "Yapılacak", color: "#64748b", icon: <Clock size={16} /> },
    { id: "inprogress", title: "Devam Ediyor", color: "var(--primary)", icon: <AlertCircle size={16} /> },
    { id: "done", title: "Tamamlandı", color: "#16a34a", icon: <Award size={16} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* Kanban Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--secondary)", margin: 0 }}>
            Görev Tahtası (Kanban)
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
            Kartları sürükleyip bırakarak durumlarını güncelleyebilirsiniz.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "50px", fontWeight: "700" }}
        >
          <Plus size={16} /> Yeni Görev Ekle
        </button>
      </div>

      {/* Kanban Sütunları */}
      <div
        className="kanban-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          minHeight: "480px",
        }}
      >
        {columns.map((col) => {
          const colTasks = groupTasks.filter((t) => t.status === col.id);
          const isDraggingOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{
                background: "rgba(248, 250, 252, 0.65)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: "var(--radius-lg)",
                border: isDraggingOver ? "2px dashed var(--primary)" : "1px solid rgba(255, 255, 255, 0.5)",
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: isDraggingOver 
                  ? "0 10px 30px rgba(217, 4, 41, 0.08)" 
                  : "0 8px 32px 0 rgba(31, 38, 135, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
              }}
            >
              {/* Sütun Başlığı */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: `3px solid ${col.color}`,
                  paddingBottom: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: col.color }}>
                  {col.icon}
                  <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--secondary)", margin: 0 }}>
                    {col.title}
                  </h4>
                </div>
                <span
                  style={{
                    backgroundColor: "rgba(0,0,0,0.05)",
                    color: "var(--secondary)",
                    fontSize: "12px",
                    fontWeight: "800",
                    padding: "3px 10px",
                    borderRadius: "50px",
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Sütun Kart Listesi */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  flexGrow: 1,
                  overflowY: "auto",
                  maxHeight: "520px",
                  padding: "4px",
                }}
              >
                {colTasks.length === 0 ? (
                  <div
                    style={{
                      border: "2px dashed rgba(0,0,0,0.05)",
                      borderRadius: "var(--radius-md)",
                      padding: "30px 12px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "12.5px",
                      margin: "auto 0",
                      backgroundColor: "rgba(255, 255, 255, 0.3)"
                    }}
                  >
                    Görev bulunmuyor
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid rgba(255, 255, 255, 0.6)",
                        borderLeft: `4px solid ${getPriorityBorderColor(task.priority)}`,
                        borderRadius: "var(--radius-md)",
                        padding: "16px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                        cursor: "grab",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        position: "relative",
                        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.7)";
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
                        e.currentTarget.style.borderColor = "rgba(217, 4, 41, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5)";
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.6)";
                      }}
                    >
                      {/* Kart Üst Kısım */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px" }}>
                        <h5 style={{ fontSize: "14px", fontWeight: "800", color: "var(--secondary)", margin: 0, lineHeight: 1.4 }}>
                          {task.title}
                        </h5>
                        {getPriorityBadge(task.priority)}
                      </div>

                      {/* Açıklama */}
                      {task.description && (
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: 1.5, WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {task.description}
                        </p>
                      )}

                      {/* Alt Bilgiler: Son Tarih & XP */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={12} />
                          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString("tr-TR") : "Tarih yok"}</span>
                        </div>
                        
                        <span 
                          style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: "3px", 
                            fontWeight: "800", 
                            color: "#d97706",
                            backgroundColor: "#fef3c7",
                            padding: "2px 8px",
                            borderRadius: "50px"
                          }}
                        >
                          <Award size={12} fill="#d97706" />
                          <span>+{task.xpReward} XP</span>
                        </span>
                      </div>

                      {/* Atanan Kişiler */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--text-muted)", backgroundColor: "#f8fafc", padding: "6px 10px", borderRadius: "var(--radius-sm)" }}>
                        <User size={12} style={{ color: "var(--primary)" }} />
                        <span style={{ fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--secondary)" }}>
                          {getAssigneeNames(task.assignedTo)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" style={{ background: "rgba(43, 45, 66, 0.4)", backdropFilter: "blur(5px)" }}>
          <div className="modal-content glass-panel" style={{ maxWidth: "520px", padding: "30px", border: "1px solid rgba(255, 255, 255, 0.5)", borderRadius: "var(--radius-lg)" }}>
            <div className="modal-header" style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "19px", fontWeight: "800", color: "var(--secondary)", margin: 0 }}>Yeni Görev Ekle</h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="close-btn"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Görev Başlığı *</label>
                <input
                  type="text"
                  placeholder="Yapılacak iş..."
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="form-control"
                  style={{ borderRadius: "var(--radius-md)" }}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>Açıklama</label>
                <textarea
                  placeholder="Görev detayları..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="form-control"
                  style={{ borderRadius: "var(--radius-md)" }}
                  rows="2"
                  disabled={loading}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontWeight: "700" }}>Öncelik</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="form-control"
                    style={{ borderRadius: "var(--radius-md)", fontWeight: "600" }}
                    disabled={loading}
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek (Kritik)</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontWeight: "700" }}>Son Tarih</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="form-control"
                    style={{ borderRadius: "var(--radius-md)" }}
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontWeight: "700" }}>XP Ödülü (Örn: 50)</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      value={taskForm.xpReward}
                      onChange={(e) => setTaskForm({ ...taskForm, xpReward: parseInt(e.target.value) || 0 })}
                      className="form-control"
                      style={{ paddingLeft: "34px", borderRadius: "var(--radius-md)" }}
                      min="0"
                      required
                      disabled={loading}
                    />
                    <Award size={16} style={{ position: "absolute", left: "12px", top: "13px", color: "#d97706" }} />
                  </div>
                </div>
              </div>

              {/* Members Selection */}
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "700" }}>
                  Görevi Ata * <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: "normal" }}>(En az 1 kişi seçilmelidir)</span>
                </label>
                <div
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    maxHeight: "130px",
                    overflowY: "auto",
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    backgroundColor: "white"
                  }}
                >
                  {groupMembers.length === 0 ? (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>Grupta üye bulunmuyor.</div>
                  ) : (
                    groupMembers.map((member) => {
                      const isChecked = taskForm.assignedTo.includes(member.uid);
                      return (
                        <label
                          key={member.uid}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "13.5px",
                            cursor: "pointer",
                            fontWeight: isChecked ? "700" : "normal",
                            color: isChecked ? "var(--secondary)" : "var(--text-main)",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleAssigneeToggle(member.uid)}
                            disabled={loading}
                          />
                          <span>{member.adSoyad}</span>
                          <span className="badge" style={{ fontSize: "10px", padding: "2px 8px", textTransform: "capitalize", backgroundColor: member.role === "teacher" ? "#eff6ff" : "#f1f5f9", color: member.role === "teacher" ? "#3b82f6" : "#64748b", fontWeight: "700", borderRadius: "50px" }}>
                            {member.role === "teacher" ? "Danışman" : "Öğrenci"}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline"
                  style={{ borderRadius: "50px", padding: "10px 20px" }}
                  disabled={loading}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ borderRadius: "50px", padding: "10px 24px", fontWeight: "700" }}
                  disabled={loading || taskForm.assignedTo.length === 0}
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
