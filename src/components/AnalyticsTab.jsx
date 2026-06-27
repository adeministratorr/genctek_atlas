import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { BarChart3, TrendingUp, Award, Layers, AlertTriangle } from "lucide-react";
import ExportButton from "./ExportButton";

/**
 * AnalyticsTab component visualizing system-wide activities.
 * Displays dynamic statistics, thematic distributions using CSS bars,
 * time-series trends using custom responsive SVG charts, and a city leaderboard.
 * 
 * @returns {JSX.Element} The rendered Analytics Tab
 */
const AnalyticsTab = () => {
  const { 
    allEventsRaw = [], 
    allProjectsRaw = [], 
    themes = [], 
    cities = [],
    userRole,
    user
  } = useApp();

  const [sortConfig, setSortConfig] = useState({ key: "eventsCount", direction: "desc" });

  // 1. Calculate General High-level Metrics
  const metrics = useMemo(() => {
    const totalEvents = allEventsRaw.length;
    const totalProjects = allProjectsRaw.length;
    
    // Sum XP (mock calculation based on events/projects approved XP value)
    const totalXp = allEventsRaw.reduce((sum, e) => sum + (e.xpAwarded || 10), 0) +
                    allProjectsRaw.reduce((sum, p) => sum + (p.xpAwarded || 20), 0);

    // Active Cities (cities with at least one event or project)
    const activeCitiesSet = new Set([
      ...allEventsRaw.map(e => e.il),
      ...allProjectsRaw.map(p => p.il)
    ].filter(Boolean));

    return {
      totalEvents,
      totalProjects,
      totalXp,
      activeCities: activeCitiesSet.size
    };
  }, [allEventsRaw, allProjectsRaw]);

  // 2. Theme Distribution Data (For Horizontal Bar Progress Charts)
  const themeData = useMemo(() => {
    const counts = {};
    
    // Count themes in events
    allEventsRaw.forEach(event => {
      if (event.tema) {
        counts[event.tema] = (counts[event.tema] || 0) + 1;
      }
    });

    // Count themes in projects
    allProjectsRaw.forEach(project => {
      if (project.tema) {
        counts[project.tema] = (counts[project.tema] || 0) + 1;
      }
    });

    // Map themes and sort by total occurrences
    const data = themes.map(t => ({
      name: t.ad || t.name || t,
      count: counts[t.ad || t.name || t] || 0,
      color: t.renk || "var(--primary)"
    }));

    // Return sorted themes, filter out 0 counts to keep UI clean, limit to top 8
    return data
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [allEventsRaw, allProjectsRaw, themes]);

  // 3. Time Series Data (For SVG Area Chart)
  // Group activities by month over the last 6 months
  const monthlyData = useMemo(() => {
    const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const now = new Date();
    const last6Months = [];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        label: `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
        count: 0
      });
    }

    const parseDateAndIncrement = (dateString) => {
      if (!dateString) return;
      // Handle Firebase Timestamp or standard Date string
      const date = dateString.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString);
      if (isNaN(date.getTime())) return;

      last6Months.forEach(m => {
        if (date.getFullYear() === m.year && date.getMonth() === m.monthIndex) {
          m.count++;
        }
      });
    };

    allEventsRaw.forEach(e => parseDateAndIncrement(e.tarih || e.createdAt));
    allProjectsRaw.forEach(p => parseDateAndIncrement(p.createdAt));

    return last6Months;
  }, [allEventsRaw, allProjectsRaw]);

  // 4. Leaderboard Statistics by City
  const cityLeaderboard = useMemo(() => {
    const stats = {};

    // Map of city values
    cities.forEach(c => {
      stats[c.ad] = {
        cityName: c.ad,
        plaka: c.plaka,
        eventsCount: 0,
        projectsCount: 0,
        totalXp: 0
      };
    });

    // Accumulate events
    allEventsRaw.forEach(e => {
      if (e.il && stats[e.il]) {
        stats[e.il].eventsCount++;
        stats[e.il].totalXp += e.xpAwarded || 10;
      }
    });

    // Accumulate projects
    allProjectsRaw.forEach(p => {
      if (p.il && stats[p.il]) {
        stats[p.il].projectsCount++;
        stats[p.il].totalXp += p.xpAwarded || 20;
      }
    });

    // Convert to array and filter out inactive ones (unless all are zero)
    let list = Object.values(stats);
    
    // Sort table dynamically
    list.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (sortConfig.direction === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return list;
  }, [allEventsRaw, allProjectsRaw, cities, sortConfig]);

  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  // Determine maximum count for theme progress bar scale
  const maxThemeCount = themeData.length > 0 ? Math.max(...themeData.map(t => t.count)) : 1;
  
  // Calculate SVG chart coordinates dynamically
  const svgChart = useMemo(() => {
    const width = 500;
    const height = 150;
    const padding = 30;
    const maxVal = Math.max(...monthlyData.map(m => m.count), 5); // Fallback to 5 to avoid flat charts

    const points = monthlyData.map((m, index) => {
      const x = padding + (index * (width - 2 * padding)) / (monthlyData.length - 1);
      const y = height - padding - (m.count * (height - 2 * padding)) / maxVal;
      return { x, y, label: m.label, count: m.count };
    });

    // Build the SVG path string
    let pathD = "";
    let areaD = "";
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
      areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    }

    return { points, pathD, areaD, width, height, padding, maxVal };
  }, [monthlyData]);

  // Determine export permissions
  const canExport = user && ["admin", "coordinator", "principal", "commission"].includes(userRole);

  return (
    <div className="analytics-container" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      {/* Top Header Card */}
      <div 
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          backgroundColor: "var(--bg-card)",
          padding: "24px",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-md)"
        }}
      >
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
            <BarChart3 style={{ color: "var(--primary)" }} /> Platform Analiz ve Raporlama Paneli
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px", marginBottom: 0 }}>
            GençTek ekosisteminin Türkiye genelindeki aktivite, proje dağılımı ve başarı grafiklerini anlık inceleyin.
          </p>
        </div>

        {/* Data Export Button Container */}
        <div>
          {canExport ? (
            <div style={{ display: "flex", gap: "12px" }}>
              <ExportButton type="events" label="Etkinlik Raporu (CSV)" />
              <ExportButton type="projects" label="Proje Raporu (CSV)" />
            </div>
          ) : (
            <div 
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "8px", 
                fontSize: "12px", 
                backgroundColor: "rgba(245, 158, 11, 0.08)", 
                border: "1px solid rgba(245, 158, 11, 0.2)",
                color: "rgb(180, 83, 9)", 
                padding: "8px 14px", 
                borderRadius: "50px" 
              }}
              title="CSV raporlarını sadece İl Koordinatörleri, Okul Müdürleri ve Adminler indirebilir."
            >
              <AlertTriangle size={14} /> <span>CSV İhracatı için yetkili hesapla giriş yapın</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px"
        }}
      >
        <div className="stat-card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "rgba(217, 4, 41, 0.08)", color: "var(--primary)" }}>
            <Layers size={24} />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Toplam Etkinlik</span>
            <strong style={{ fontSize: "24px", color: "var(--secondary)", fontWeight: "800" }}>{metrics.totalEvents}</strong>
          </div>
        </div>

        <div className="stat-card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "rgba(59, 130, 246, 0.08)", color: "#3b82f6" }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Toplam Proje</span>
            <strong style={{ fontSize: "24px", color: "var(--secondary)", fontWeight: "800" }}>{metrics.totalProjects}</strong>
          </div>
        </div>

        <div className="stat-card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "rgba(16, 185, 129, 0.08)", color: "#10b981" }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Kazanılan Toplam XP</span>
            <strong style={{ fontSize: "24px", color: "var(--secondary)", fontWeight: "800" }}>{metrics.totalXp} XP</strong>
          </div>
        </div>

        <div className="stat-card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "rgba(139, 92, 246, 0.08)", color: "#8b5cf6" }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Aktif Çalışan İl</span>
            <strong style={{ fontSize: "24px", color: "var(--secondary)", fontWeight: "800" }}>{metrics.activeCities} / 81</strong>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "24px"
        }}
      >
        {/* Left: Theme Distribution Bar Charts */}
        <div 
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            padding: "24px",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-sm)"
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--secondary)", margin: "0 0 20px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={16} /> Temalara Göre Yoğunluk (En Aktif 8 Tema)
          </h3>

          {themeData.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "14px", padding: "40px 0", textAlign: "center" }}>
              Henüz temalandırılmış etkinlik veya proje bulunamadı.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {themeData.map((t, idx) => {
                const percentage = (t.count / maxThemeCount) * 100;
                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600" }}>
                      <span style={{ color: "var(--secondary)" }}>{t.name}</span>
                      <span style={{ color: "var(--text-muted)" }}>{t.count} Kayıt</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", backgroundColor: "var(--primary-light)", borderRadius: "10px", overflow: "hidden" }}>
                      <div 
                        style={{ 
                          width: `${percentage}%`, 
                          height: "100%", 
                          backgroundColor: t.color, 
                          borderRadius: "10px",
                          transition: "width 1s ease-in-out" 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Time-Series Area Chart (SVG) */}
        <div 
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            padding: "24px",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--secondary)", margin: "0 0 20px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={16} /> Son 6 Aylık Aktivite Eğilimi (Toplam Girişler)
          </h3>

          <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* SVG Responsive Area Chart */}
            <svg 
              viewBox={`0 0 ${svgChart.width} ${svgChart.height}`} 
              style={{ width: "100%", height: "auto", overflow: "visible" }}
            >
              {/* Grid Lines */}
              <line 
                x1={svgChart.padding} 
                y1={svgChart.height - svgChart.padding} 
                x2={svgChart.width - svgChart.padding} 
                y2={svgChart.height - svgChart.padding} 
                stroke="var(--border-color)" 
                strokeWidth="1.5"
              />
              <line 
                x1={svgChart.padding} 
                y1={svgChart.padding} 
                x2={svgChart.width - svgChart.padding} 
                y2={svgChart.padding} 
                stroke="var(--border-color)" 
                strokeDasharray="4"
                strokeWidth="1"
              />

              {/* Shaded Area */}
              {svgChart.areaD && (
                <path 
                  d={svgChart.areaD} 
                  fill="rgba(217, 4, 41, 0.08)"
                  stroke="none"
                />
              )}

              {/* Trend Line */}
              {svgChart.pathD && (
                <path 
                  d={svgChart.pathD} 
                  fill="none" 
                  stroke="var(--primary)" 
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Data Points and Labels */}
              {svgChart.points.map((p, idx) => (
                <g key={idx}>
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="4" 
                    fill="var(--bg-card)" 
                    stroke="var(--primary)" 
                    strokeWidth="2.5" 
                  />
                  {/* Count Value Badge above Point */}
                  <text 
                    x={p.x} 
                    y={p.y - 8} 
                    fontSize="10" 
                    fontWeight="800" 
                    fill="var(--secondary)" 
                    textAnchor="middle"
                  >
                    {p.count}
                  </text>
                  {/* Month Label below Chart Line */}
                  <text 
                    x={p.x} 
                    y={svgChart.height - svgChart.padding + 16} 
                    fontSize="10" 
                    fontWeight="600" 
                    fill="var(--text-muted)" 
                    textAnchor="middle"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* City Leaderboard Table */}
      <div 
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          padding: "24px",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--secondary)", margin: "0 0 20px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Award size={16} /> İl Başarı ve Aktivite Liderlik Sıralaması (Leaderboard)
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table className="moderation-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border-color)" }}>
                <th style={{ padding: "12px 8px", fontSize: "13px", fontWeight: "800", color: "var(--text-muted)" }}>Plaka</th>
                <th style={{ padding: "12px 8px", fontSize: "13px", fontWeight: "800", color: "var(--text-muted)" }}>Şehir</th>
                <th 
                  onClick={() => requestSort("eventsCount")} 
                  style={{ padding: "12px 8px", fontSize: "13px", fontWeight: "800", color: "var(--secondary)", cursor: "pointer", userSelect: "none" }}
                >
                  Etkinlikler {sortConfig.key === "eventsCount" && (sortConfig.direction === "desc" ? "▼" : "▲")}
                </th>
                <th 
                  onClick={() => requestSort("projectsCount")} 
                  style={{ padding: "12px 8px", fontSize: "13px", fontWeight: "800", color: "var(--secondary)", cursor: "pointer", userSelect: "none" }}
                >
                  Projeler {sortConfig.key === "projectsCount" && (sortConfig.direction === "desc" ? "▼" : "▲")}
                </th>
                <th 
                  onClick={() => requestSort("totalXp")} 
                  style={{ padding: "12px 8px", fontSize: "13px", fontWeight: "800", color: "var(--secondary)", cursor: "pointer", userSelect: "none" }}
                >
                  Toplam Skor {sortConfig.key === "totalXp" && (sortConfig.direction === "desc" ? "▼" : "▲")}
                </th>
              </tr>
            </thead>
            <tbody>
              {cityLeaderboard.map((city, index) => {
                // Determine highlight classes for top 3 cities
                let highlightStyle = {};
                if (index === 0 && city.totalXp > 0) {
                  highlightStyle = { backgroundColor: "rgba(245, 158, 11, 0.05)", fontWeight: "700" };
                } else if (index === 1 && city.totalXp > 0) {
                  highlightStyle = { backgroundColor: "rgba(156, 163, 175, 0.05)" };
                } else if (index === 2 && city.totalXp > 0) {
                  highlightStyle = { backgroundColor: "rgba(180, 83, 9, 0.03)" };
                }

                return (
                  <tr 
                    key={city.plaka} 
                    style={{ 
                      borderBottom: "1px solid var(--border-color)",
                      transition: "background 0.2s",
                      ...highlightStyle
                    }}
                    className="leaderboard-row"
                  >
                    <td style={{ padding: "12px 8px", fontSize: "14px", color: "var(--text-muted)" }}>
                      {city.plaka.toString().padStart(2, "0")}
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: "14px", color: "var(--secondary)", fontWeight: "600" }}>
                      {city.cityName}
                      {index === 0 && city.totalXp > 0 && " 👑"}
                      {index === 1 && city.totalXp > 0 && " 🥈"}
                      {index === 2 && city.totalXp > 0 && " 🥉"}
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: "14px", color: "var(--secondary)" }}>
                      {city.eventsCount}
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: "14px", color: "var(--secondary)" }}>
                      {city.projectsCount}
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: "14px", color: "var(--primary)", fontWeight: "700" }}>
                      {city.totalXp} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
