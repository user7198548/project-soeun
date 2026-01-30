import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import UsersPage from "./UsersPage";
import { api } from "./api";
import MainPage from "./MainPage";

type MeResponse = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export default function App() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  const refreshMe = async () => {
    try {
      const res = await api<MeResponse>("/api/me");
      setMe(res);
      return res;
    } catch {
      setMe(null);
      return null;
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    await api<void>("/api/auth/logout", { method: "POST" });
    setMe(null);
    navigate("/", { replace: true });
  };

  if (checking) return <div style={styles.page}>로딩중...</div>;

  const isAdmin = !!me && String(me.role).toUpperCase().includes("ADMIN");

  return (
    <div style={styles.app}>
      {/* 전역 헤더: 중첩 없이 한 번만 */}
      <header style={styles.header}>
        {/* <div style={styles.headerInner}> */}
            {/* Left */}
            <button
              type="button"
              onClick={() => navigate("/")}
              style={styles.homeBtn}
            >
              Home
            </button>

            {/* Center */}
            {/* <div style={styles.brand}>
              {isAdmin && <span style={styles.badge}>ADMIN</span>}
            </div> */}

            {/* Right */}
            <div style={styles.right}>
              {me ? (
                <>
                  {/* <span style={styles.meText}>
                    {me.email} <span style={styles.muted}>({me.role})</span>
                  </span> */}
                  <button type="button" onClick={logout} style={styles.logoutBtn}>
                    로그아웃
                  </button>
                </>
              ) : (
                <span style={styles.muted}>로그인되지 않음</span>
              )}
            </div>
        {/* </div> */}
      </header>

      {/* 페이지 영역 */}
      <main style={styles.page}>
        <Routes>
          <Route path="/" element={<MainPage me={me} refreshMe={refreshMe} />} />

          <Route
            path="/users"
            element={me ? <UsersPage me={me} /> : <Navigate to="/" replace />}
          />

          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      </div>
  );
}

/** 스타일을 아래로 내려서 한 곳에서 관리 */
const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: "100vh",
    background: "#fafafa", 
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "white",
    borderBottom: "1px solid #eee",
    padding: "12px 16px",
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: 12,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  headerInner: {
    maxWidth: 1200,              // ⭐ 원하는 폭
    margin: "0 auto",            // ⭐ 가운데 정렬 핵심
    padding: "12px 16px",
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: 12,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  homeBtn: {
    background: "transparent",
    border: "1px solid #ddd",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    fontWeight: 800,
    color: "#111",
  },
  badge: {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    background: "#eef3ff",
    border: "1px solid #d7e2ff",
    color: "#2a55ff",
    fontWeight: 800,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-end",
  },
  meText: {
    fontSize: 13,
    color: "#111",
    maxWidth: 360,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  muted: {
    color: "#666",
  },
  logoutBtn: {
    background: "#111",
    color: "white",
    border: "1px solid #111",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  page: {
    padding: "16px 24px",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    maxWidth: 1400,      // 1200~1600 취향
    margin: "0 auto",
    width: "100%"
  },
  container: {
  maxWidth: 1200,          // ← 여기서 폭 조절 (1200~1440 추천)
  margin: "0 auto",        // ← 가운데 정렬
  },
};
