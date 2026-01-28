import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "./api";

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
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

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
    setError("");
    try {
      const res = await api<Page<UserListItemResponse>>(`/api/users?${queryString}`);
      setData(res);
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  };

  useEffect(() => {
    // 최초 로드 + 페이지 바뀔 때 자동 조회
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // 검색하면 0페이지로
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
    try {
      await api(`/api/users/${id}/active`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      await load();
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setBusyId(null);
    }
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
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 8 }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: 8 }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>role</div>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: 8 }}>
              <option value="">ALL</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 220px 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>from</div>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: "100%", padding: 8 }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#555" }}>to</div>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: "100%", padding: 8 }} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
            <button type="submit">검색</button>
            <button type="button" onClick={onReset}>초기화</button>
            <button type="button" onClick={load}>새로고침</button>
          </div>
        </div>
      </form>

      {error && (
        <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 8, whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}

      {!data ? (
        <p>로딩중...</p>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>Total: {data.totalElements}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                이전
              </button>
              <span>
                {data.number + 1} / {data.totalPages || 1}
              </span>
              <button
                disabled={data.totalPages === 0 || page >= data.totalPages - 1}
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
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* 카드 클릭 -> 상세 이동 */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>
                    <Link to={`/users/${u.id}`} style={{ textDecoration: "none" }}>
                      #{u.id} {u.name} ({u.role})
                    </Link>
                  </div>
                  <div style={{ fontSize: 14, color: "#555" }}>{u.email}</div>
                  <div style={{ fontSize: 12, color: "#777" }}>
                    active: <b>{String(u.active)}</b>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {u.active ? (
                    <button disabled={busyId === u.id} onClick={() => setActive(u.id, false)}>
                      {busyId === u.id ? "처리중..." : "비활성화"}
                    </button>
                  ) : (
                    <button disabled={busyId === u.id} onClick={() => setActive(u.id, true)}>
                      {busyId === u.id ? "처리중..." : "활성화"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
