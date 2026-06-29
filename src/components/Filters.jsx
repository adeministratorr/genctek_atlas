import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

const Filters = ({ activeListTab }) => {
  const {
    themes,
    cities,
    selectedCity,
    setSelectedCity,
    selectedDistrict,
    setSelectedDistrict,
    selectedSchool,
    setSelectedSchool,
    loadSchoolsDataForCity,
    filters,
    setFilters,
  } = useApp();
  const [filterSchoolsData, setFilterSchoolsData] = useState({});
  const [filterSchoolsLoading, setFilterSchoolsLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (!selectedCity) {
      Promise.resolve().then(() => {
        if (!isCancelled) {
          setFilterSchoolsData({});
          setFilterSchoolsLoading(false);
        }
      });
      return () => {
        isCancelled = true;
      };
    }

    Promise.resolve().then(() => {
      if (!isCancelled) {
        setFilterSchoolsLoading(true);
      }
    });
    loadSchoolsDataForCity(selectedCity)
      .then((citySchoolsData) => {
        if (!isCancelled) {
          setFilterSchoolsData(citySchoolsData);
        }
      })
      .catch((error) => {
        console.error("Filtre ilce verileri yuklenirken hata:", error);
        if (!isCancelled) {
          setFilterSchoolsData({});
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setFilterSchoolsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCity, loadSchoolsDataForCity]);

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleSelectChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const toggleThemeChip = (themeKisaKod) => {
    setFilters((prev) => ({
      ...prev,
      theme: prev.theme === themeKisaKod ? "" : themeKisaKod,
    }));
  };

  return (
    <div className="filters-section" id="filters-section">
      {/* Search and Dropdowns Row */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Search Bar */}
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder={
              activeListTab === "events"
                ? "Etkinlik adı veya açıklama ara..."
                : "Proje, takım adı veya açıklama ara..."
            }
            value={filters.search}
            onChange={handleSearchChange}
            id="search-box"
          />
          <Search className="search-icon-svg" size={20} />
        </div>

        {/* Dropdown Filters */}
        <div className="filter-selects" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {/* City Select */}
          <select
            className="filter-select"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            id="city-filter"
            style={{ flex: "1 1 150px" }}
          >
            <option value="">Tüm İller</option>
            {cities.map((city) => (
              <option key={city.plaka} value={city.ad}>
                {city.plaka} - {city.ad}
              </option>
            ))}
          </select>

          {/* District Select */}
          {selectedCity && (
            <select
              className="filter-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={filterSchoolsLoading}
              id="district-filter"
              style={{ flex: "1 1 150px" }}
            >
              <option value="">{filterSchoolsLoading ? "Yükleniyor..." : "Tüm İlçeler"}</option>
              {Object.keys(filterSchoolsData).sort().map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          )}

          {/* School Select */}
          {selectedCity && selectedDistrict && (
            <select
              className="filter-select"
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              id="school-filter"
              style={{ flex: "1 1 200px" }}
            >
              <option value="">Tüm Okullar</option>
              {filterSchoolsData[selectedDistrict] &&
                filterSchoolsData[selectedDistrict].map((s) => s.ad).sort().map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
            </select>
          )}

          {/* Theme Select */}
          <select
            className="filter-select"
            value={filters.theme}
            onChange={(e) => handleSelectChange("theme", e.target.value)}
            id="theme-filter"
          >
            <option value="">Tüm Temalar</option>
            {themes.map((theme) => (
              <option key={theme.kisaKod} value={theme.kisaKod}>
                {theme.ad}
              </option>
            ))}
          </select>

          {/* Format Select (Only for Events) */}
          {activeListTab === "events" ? (
            <select
              className="filter-select"
              value={filters.format}
              onChange={(e) => handleSelectChange("format", e.target.value)}
              id="format-filter"
            >
              <option value="">Tüm Formatlar</option>
              <option value="Yüz Yüze">Yüz Yüze</option>
              <option value="Çevrimiçi">Çevrimiçi</option>
              <option value="Hibrit">Hibrit</option>
            </select>
          ) : (
            <div
              className="filter-select"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: 0.6,
                cursor: "not-allowed",
                backgroundColor: "#f1f2f6",
              }}
            >
              <SlidersHorizontal size={16} /> Format (Sadece Etkinlik)
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Themes Carousel */}
      <div style={{ marginTop: "8px" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "var(--text-muted)",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Filter size={14} /> Temaya Göre Hızlı Filtrele
        </p>
        <div className="themes-filter-bar">
          <button
            className={`theme-chip ${!filters.theme ? "active" : ""}`}
            onClick={() => handleSelectChange("theme", "")}
          >
            Hepsi
          </button>
          {themes.map((theme) => (
            <button
              key={theme.kisaKod}
              className={`theme-chip ${filters.theme === theme.kisaKod ? "active" : ""}`}
              onClick={() => toggleThemeChip(theme.kisaKod)}
              style={{
                borderLeft:
                  filters.theme !== theme.kisaKod
                    ? `3px solid ${theme.renk}`
                    : undefined,
              }}
            >
              <span
                className="theme-chip-dot"
                style={{
                  backgroundColor: theme.renk,
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  display:
                    filters.theme === theme.kisaKod ? "none" : "inline-block",
                }}
              ></span>
              {theme.ad.split(" — ")[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filters;
