import { useApp } from "../context/AppContext";
import { Globe, FileCode, Users, ShieldCheck, ShieldAlert } from "lucide-react";

const ProjectCard = ({ project }) => {
  const { themes } = useApp();

  // Find theme metadata
  const themeObj = themes.find((t) => t.kisaKod === project.tema) || {
    ad: project.tema,
    renk: "#d90429",
    ikon: "terminal",
  };

  return (
    <div
      className="item-card"
      id={`project-card-${project.id}`}
      style={{ borderLeft: `4px solid ${themeObj.renk}` }}
    >
      {/* Badge Row */}
      <div className="card-badge-row">
        <span
          className="card-badge theme"
          style={{
            backgroundColor: `${themeObj.renk}15`,
            color: themeObj.renk,
          }}
        >
          {themeObj.ad.split(" — ")[0]}
        </span>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {/* Ethics Check Indicator */}
          {project.etikKontrol ? (
            <span
              className="card-badge"
              style={{
                backgroundColor: "#e6fdf5",
                color: "#10b981",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                border: "1px solid #a7f3d0",
              }}
            >
              <ShieldCheck size={12} /> Etik Onaylı
            </span>
          ) : (
            project.tema === "vibe-coding" && (
              <span
                className="card-badge"
                style={{
                  backgroundColor: "#fef2f2",
                  color: "#ef4444",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  border: "1px solid #fecaca",
                }}
              >
                <ShieldAlert size={12} /> Etik Eksik
              </span>
            )
          )}

          {project.parkur && (
            <span className="card-badge format">{project.parkur}</span>
          )}
        </div>
      </div>

      {/* Main Info */}
      <h4 className="card-title">{project.ad}</h4>
      <p
        style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary)" }}
      >
        Takım: {project.takimAdi}
      </p>
      <p className="card-desc">{project.aciklama}</p>

      {/* Meta Row */}
      <div className="card-meta-row">
        <div className="card-meta-item">
          <Users size={14} />
          <span>{project.katilimciIller?.join(", ")}</span>
        </div>
      </div>

      {/* Links Row */}
      <div className="card-links" style={{ flexWrap: "wrap" }}>
        {project.githubLink && (
          <a
            href={project.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="card-btn secondary"
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-github"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>{" "}
            GitHub
          </a>
        )}

        {project.demoLink && (
          <a
            href={project.demoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="card-btn secondary"
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            <Globe size={14} /> Canlı Demo
          </a>
        )}

        {project.promptDosyaUrl && (
          <a
            href={project.promptDosyaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-btn secondary"
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              color: "var(--primary)",
              borderColor: "var(--primary)",
            }}
          >
            <FileCode size={14} /> Prompt Arşivi
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
