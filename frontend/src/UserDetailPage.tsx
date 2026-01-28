import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "./api";

type MeResponse = { id: number; email: string; name: string; role: string };

type UserDetailResponse = {
  id: number;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function UserDetailPage({ me }: { me: MeResponse }) {
  const { id } = useParams();
  const userId = Number(id);
  const nav = useNavigate();

  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const canEditName = useMemo(() => {
    if (!data) return false;
    return me.role === "ADMIN" || me.id === data.id;
  }, [me, data]);  

  const load = async () => {
    setError("");
    try {
      const res = await api<UserDetailResponse>(`/api/users/${userId}`);
      setData(res);
      setName(res.name);
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  };

  useEffect(() => {
    if (!Number.isFinite(userId)) return;
    load();
  }, [userId]);

    const saveName = async () => {
    if (!data) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/users/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      await load();  
      setEditing(false);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };

  const setActive = async (active: boolean) => {
    setBusy(true);
    setError("");
    try {
      if (!data) return;
      await api(`/api/users/${data.id}/active`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      await load();
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <button onClick={() => nav(-1)}>← 뒤로</button>
        <h2 style={{ margin: 0 }}>User Detail</h2>
      </div>

      {error && (
        <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 8, whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}

      {!data ? (
        <p>로딩중...</p>
      ) : (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16, maxWidth: 560 }}>
          {/* NAME */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Name</div>

            {!editing ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div>{data.name}</div>
                {canEditName && (
                  <button onClick={() => setEditing(true)}>수정</button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ padding: 8, width: 240 }}
                  disabled={busy}
                />
                <button onClick={saveName} disabled={busy || name.trim() === ""}>
                  {busy ? "저장중..." : "저장"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setName(data.name);
                    setEditing(false);
                  }}
                  disabled={busy}
                >
                  취소
                </button>
              </div>
            )}
          </div>

          {/* STATIC FIELDS */}
          <div style={{ marginBottom: 6 }}><b>Email</b>: {data.email}</div>
          <div style={{ marginBottom: 6 }}><b>Role</b>: {data.role}</div>
          <div style={{ marginBottom: 6 }}><b>Active</b>: {String(data.active)}</div>
          <div style={{ marginBottom: 6 }}><b>Created</b>: {data.createdAt}</div>
          <div style={{ marginBottom: 12 }}><b>Updated</b>: {data.updatedAt}</div>

          {/* ACTIVE TOGGLE (ADMIN ONLY) */}
          {me.role === "ADMIN" && (
            <div style={{ display: "flex", gap: 8 }}>
              {data.active ? (
                <button disabled={busy} onClick={() => setActive(false)}>
                  {busy ? "처리중..." : "비활성화"}
                </button>
              ) : (
                <button disabled={busy} onClick={() => setActive(true)}>
                  {busy ? "처리중..." : "활성화"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
