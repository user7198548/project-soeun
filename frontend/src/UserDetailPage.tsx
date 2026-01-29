import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "./api";
import { useApiCall } from "./useApiCall";

type MeResponse = {
  id: number;
  email: string;
  name: string;
  role: string;
};

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

  // ✅ 공통 API 호출 상태/에러 통일
  const { busy, error, setError, run } = useApiCall();

  const [data, setData] = useState<UserDetailResponse | null>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const canEditName = useMemo(() => {
    if (!data) return false;
    return me.role === "ADMIN" || me.id === data.id;
  }, [me, data]);

  const load = async () => {
    // run()이 내부에서 error 초기화도 해주지만,
    // “새로고침”/“취소 후 다시 불러오기” 흐름에서 명확히 하고 싶으면 setError("") 해도 됨
    setError("");

    const res = await run(async () => {
      return await api<UserDetailResponse>(`/api/users/${userId}`);
    });

    if (!res) return;
    setData(res);
    setName(res.name);
  };

  useEffect(() => {
    if (!Number.isFinite(userId)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const saveName = async () => {
    if (!data) return;
    if (!canEditName) return;

    const ok = await run(async () => {
      await api<void>(`/api/users/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      return true;
    });

    if (!ok) return;
    await load();
    setEditing(false);
  };

  const setActive = async (active: boolean) => {
    if (!data) return;
    if (me.role !== "ADMIN") return;

    const ok = await run(async () => {
      await api<void>(`/api/users/${data.id}/active`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      return true;
    });

    if (!ok) return;
    await load();
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <button onClick={() => nav(-1)}>← 뒤로</button>
        <h2 style={{ margin: 0 }}>User Detail</h2>
      </div>

      {error && (
        <pre
          style={{
            background: "#f7f7f7",
            padding: 12,
            borderRadius: 8,
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </pre>
      )}

      {!data ? (
        <p>{busy ? "로딩중..." : "데이터가 없습니다."}</p>
      ) : (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16, maxWidth: 560 }}>
          {/* NAME */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Name</div>

            {!editing ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div>{data.name}</div>
                {canEditName && <button onClick={() => setEditing(true)}>수정</button>}
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
                    setError("");
                  }}
                  disabled={busy}
                >
                  취소
                </button>
              </div>
            )}
          </div>

          {/* STATIC FIELDS */}
          <div style={{ marginBottom: 6 }}>
            <b>Email</b>: {data.email}
          </div>
          <div style={{ marginBottom: 6 }}>
            <b>Role</b>: {data.role}
          </div>
          <div style={{ marginBottom: 6 }}>
            <b>Active</b>: {String(data.active)}
          </div>
          <div style={{ marginBottom: 6 }}>
            <b>Created</b>: {data.createdAt}
          </div>
          <div style={{ marginBottom: 12 }}>
            <b>Updated</b>: {data.updatedAt}
          </div>

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
