import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import UsersPage from "./UsersPage";
import { api } from "./api";
import MainPage from "./MainPage";

type MeResponse = {
  id: number;
  email: string;
  name: string;
  role: string; // "ADMIN" | "USER" 같은 값이라고 가정
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

  if (checking) return <div style={{ padding: 24 }}>로딩중...</div>;

  return (
    <div>
      {me && (
        <div
          style={{
            padding: 16,
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <b>Admin Console</b>
            <Link to="/users">Users</Link>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ color: "#555" }}>
              {me.email} ({me.role})
            </span>
            <button onClick={logout}>로그아웃</button>
          </div>
        </div>
      )}

      <Routes>
        {/* ✅ 메인(홈) */}
        <Route path="/" element={<MainPage me={me} refreshMe={refreshMe} />} />

        {/* ✅ 보호 라우트 */}
        <Route
          path="/users"
          element={me ? <UsersPage me={me} /> : <Navigate to="/" replace />}
        />

        {/* (선택) 직접 /login, /signup 들어오면 홈으로 보내기 */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />

        {/* 나머지는 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
