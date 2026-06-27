import { useApp } from "../context/AppContext";
import { WifiOff } from "lucide-react";

const OfflineIndicator = () => {
  const { isOffline } = useApp();

  if (!isOffline) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#d90429",
        color: "#ffffff",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontSize: "13px",
        fontWeight: "700",
        zIndex: 9999,
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        textAlign: "center"
      }}
      role="alert"
    >
      <WifiOff size={16} />
      <span>İnternet bağlantısı kesildi. Çevrimdışı modda çalışılıyor (Veriler önbellekten sunuluyor).</span>
    </div>
  );
};

export default OfflineIndicator;
