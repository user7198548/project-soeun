import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { useApiCall } from "./useApiCall";
import UserDetailModal from "./UserDetailPage";

type MeResponse = { id: number; email: string; name: string; role: string };

type UserListItemResponse = {
  id: number;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

function buildQuery(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") qs.set(k, v);
  });
  return qs.toString();
}

export default function UsersPage({ me }: { me: MeResponse }) {
  const { busy, error, setError, run } = useApiCall();
  const [busyId, setBusyId] = useState<number | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // filters
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState(""); // "", "ADMIN", "USER"
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState("");

  // paging
  const [page, setPage] = useState(0);
  const size = 10;

  const [data, setData] = useState<Page<UserListItemResponse> | null>(null);

  const queryString = useMemo(
    () =>
      buildQuery({
        page: String(page),
        size: String(size),
        email,
        name,
        role,
        from,
        to,
      }),
    [page, size, email, name, role, from, to]
  );

  const load = async () => {
    const res = await run(async () => {
      return await api<Page<UserListItemResponse>>(`/api/users?${queryString}`);
    });
    if (res) setData(res);
  };

  useEffect(() => {
    // ADMIN만 조회 가능
    if (me.role !== "ADMIN") return;
    load();
  }, [page]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); 
    await load();
  };

  const onReset = async () => {
    setEmail("");
    setName("");
    setRole("");
    setFrom("");
    setTo("");
    setPage(0);
    await load();
  };

  const setActive = async (id: number, active: boolean) => {
    setBusyId(id);
    setError("");

    const ok = await run(async () => {
      await api<void>(`/api/users/${id}/active`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      return true;
    });

    setBusyId(null);

    if (!ok) return;
    await load();
  };

  const openDetail = (id: number) => {
    setSelectedUserId(id);
    setDetailOpen(true);
  };


  if (me.role !== "ADMIN") {
    return (
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h2>Users</h2>
        <p style={{ color: "red" }}>관리자만 접근 가능합니다.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2 style={{ marginTop: 0 }}>Users</h2>

      {/* 검색 필터 */}
      <form
        onSubmit={onSearch}
        style={{
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 180px", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>role</div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            >
              <option value="">ALL</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 220px 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>from</div>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>to</div>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
            <button type="submit" disabled={busy}>
              {busy ? "검색중..." : "검색"}
            </button>
            <button type="button" onClick={onReset} disabled={busy}>
              초기화
            </button>
            <button type="button" onClick={load} disabled={busy}>
              새로고침
            </button>
          </div>
        </div>
      </form>

      {error && (
        <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 8, whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}

      {!data ? (
        <p>{busy ? "로딩중..." : "데이터가 없습니다."}</p>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>Total: {data.totalElements}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={busy || page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                이전
              </button>
              <span>
                {data.number + 1} / {data.totalPages || 1}
              </span>
              <button
                disabled={busy || data.totalPages === 0 || page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {data.content.map((u) => (
              <div
                key={u.id}
                onClick={() => openDetail(u.id)}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>
                    
                      #{u.id} {u.name} ({u.role})
                    
                  </div>
                  <div style={{ fontSize: 14, color: "#555" }}>{u.email}</div>
                  <div style={{ fontSize: 12, color: "#777" }}>
                    active: <b>{String(u.active)}</b>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {u.active ? (
                    <button
                      disabled={busy || busyId === u.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive(u.id, false)
                      }}
                    >
                      {busyId === u.id ? "처리중..." : "비활성화"}
                    </button>
                  ) : (
                    <button
                      disabled={busy || busyId === u.id}
                      onClick={() => setActive(u.id, true)}
                    >
                      {busyId === u.id ? "처리중..." : "활성화"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedUserId !== null && (
        <UserDetailModal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          me={me}
          userId={selectedUserId}
          onUpdated={async () => {
            await load();
          }}
        />
      )}      
    </div>
  );
}
