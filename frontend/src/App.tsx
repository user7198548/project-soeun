import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import Login from "./Login";
import UsersPage from "./UsersPage";
import UserDetailPage from "./UserDetailPage";
import { api } from "./api";
import Signup from "./Signup";

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
    } catch {
      setMe(null);
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
    navigate("/login");
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
        <Route
          path="/login"
          element={<Login onSuccess={refreshMe} />}
        />

        <Route
          path="/users"
          element={me ? <UsersPage me={me} /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/users/:id"
          element={me ? <UserDetailPage me={me} /> : <Navigate to="/login" replace />}
        />

        <Route path="*" element={<Navigate to={me ? "/users" : "/login"} replace />} />

        <Route path="/signup" element={<Signup />} />

      </Routes>
    </div>
  );
}
