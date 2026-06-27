import { useApp } from "../context/AppContext";
import { Map, Calendar, FolderGit2, Users } from "lucide-react";

const Stats = () => {
  const { allEventsRaw, allProjectsRaw, activeCitiesList } = useApp();

  // Calculate statistics for approved items
  const approvedEvents = allEventsRaw.filter((e) => e.onaylandi);
  const approvedProjects = allProjectsRaw.filter((p) => p.onaylandi);

  const totalEvents = approvedEvents.length;
  const totalProjects = approvedProjects.length;
  const totalCities = activeCitiesList.length;

  const totalParticipants = approvedEvents.reduce(
    (sum, event) => sum + (Number(event.katilimciSayisi) || 0),
    0,
  );

  return (
    <div
      className="container"
      style={{ transform: "translateY(-24px)", marginBottom: "-10px" }}
    >
      <div className="stats-container" id="stats-container">
        {/* Active Cities */}
        <div className="stat-card">
          <div className="stat-icon">
            <Map size={24} />
          </div>
          <div className="stat-info">
            <h3>{totalCities}</h3>
            <p>Aktif İl</p>
          </div>
        </div>

        {/* Total Events */}
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{totalEvents}</h3>
            <p>Toplam Etkinlik</p>
          </div>
        </div>

        {/* Total Projects */}
        <div className="stat-card">
          <div className="stat-icon">
            <FolderGit2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{totalProjects}</h3>
            <p>Üretilen Proje</p>
          </div>
        </div>

        {/* Total Participants */}
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{totalParticipants.toLocaleString("tr-TR")}</h3>
            <p>Toplam Katılımcı</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
