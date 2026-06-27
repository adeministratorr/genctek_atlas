import { useApp } from "../context/AppContext";
import { Download } from "lucide-react";

/**
 * ExportButton component that filters events or projects based on user roles
 * and exports the cleaned records to a native browser CSV download.
 * 
 * @param {Object} props
 * @param {"events" | "projects"} props.type - The entity type to export
 * @param {string} props.label - Button display label
 * @returns {JSX.Element} The rendered Export Button
 */
const ExportButton = ({ type, label }) => {
  const { 
    allEventsRaw = [], 
    allProjectsRaw = [], 
    userRole, 
    userProfile,
    teacherProfile
  } = useApp();

  const handleExport = () => {
    // 1. Gather raw data source
    const rawData = type === "events" ? allEventsRaw : allProjectsRaw;
    
    // 2. Filter data according to user roles
    let filteredData = [...rawData];

    if (userRole === "coordinator") {
      // Coordinators can only export data from their assigned city
      const coordinatorCity = userProfile?.il;
      if (coordinatorCity) {
        filteredData = filteredData.filter(item => item.il === coordinatorCity);
      }
    } else if (userRole === "principal") {
      // Principals can only export data from their specific school
      const principalSchool = userProfile?.okul;
      if (principalSchool) {
        filteredData = filteredData.filter(item => item.okul === principalSchool);
      }
    } else if (userRole === "teacher") {
      // Teachers can only export data from their own school
      const teacherSchool = teacherProfile?.okul || userProfile?.okul;
      if (teacherSchool) {
        filteredData = filteredData.filter(item => item.okul === teacherSchool);
      }
    }

    if (filteredData.length === 0) {
      alert("Dışa aktarılacak uygun veri bulunamadı.");
      return;
    }

    // 3. Define headers based on entity type
    const headers = type === "events" 
      ? ["Etkinlik ID", "Etkinlik Adı", "İl", "İlçe", "Okul", "Tema", "Format", "Tarih", "Açıklama", "Onay Durumu", "Öne Çıkarıldı", "XP Değeri"]
      : ["Proje ID", "Proje Adı", "İl", "İlçe", "Okul", "Tema", "GitHub Linki", "Açıklama", "Onay Durumu", "Öne Çıkarıldı", "XP Değeri"];

    // 4. Convert objects to CSV rows
    const escapeCsv = (val) => {
      if (val === undefined || val === null) return "";
      let str = val.toString();
      // Replace double quotes with escaped quotes
      str = str.replace(/"/g, '""');
      // If it contains comma, double-quote, or newline, wrap in double quotes
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str}"`;
      }
      return str;
    };

    const rows = filteredData.map(item => {
      const isApprovedStr = item.onaylandi ? "Onaylandı" : "Beklemede";
      const isFeaturedStr = item.oneCikar ? "Evet" : "Hayır";
      
      let dateStr = "";
      if (item.tarih) {
        dateStr = item.tarih.seconds ? new Date(item.tarih.seconds * 1000).toLocaleDateString("tr-TR") : new Date(item.tarih).toLocaleDateString("tr-TR");
      }

      if (type === "events") {
        return [
          item.id || "",
          item.baslik || item.ad || "",
          item.il || "",
          item.ilce || "",
          item.okul || "",
          item.tema || "",
          item.format || "",
          dateStr,
          item.aciklama || "",
          isApprovedStr,
          isFeaturedStr,
          item.xpAwarded || 10
        ];
      } else {
        return [
          item.id || "",
          item.baslik || item.ad || "",
          item.il || "",
          item.ilce || "",
          item.okul || "",
          item.tema || "",
          item.githubLink || "",
          item.aciklama || "",
          isApprovedStr,
          isFeaturedStr,
          item.xpAwarded || 20
        ];
      }
    });

    // Combine headers and rows
    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map(row => row.map(escapeCsv).join(","))
    ].join("\n");

    // 5. Trigger download using Blob & URL.createObjectURL
    // Adding BOM characters so Excel reads Turkish characters correctly
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `genctek_${type}_report_${dateStamp}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="btn btn-outline"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        borderRadius: "50px",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.2s"
      }}
    >
      <Download size={14} /> {label}
    </button>
  );
};

export default ExportButton;
