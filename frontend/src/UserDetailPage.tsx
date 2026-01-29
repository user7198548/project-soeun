import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
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

export default function UserDetailModal({
  open,
  onClose,
  me,
  userId,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  me: MeResponse;
  userId: number; // useParams 대신 props로
  onUpdated?: (updated: UserDetailResponse) => void; // 저장/활성변경 후 부모에게 알림(옵션)
}) {
  const { busy, error, setError, run } = useApiCall();

  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const canEditName = useMemo(() => {
    if (!data) return false;
    return me.role === "ADMIN" || me.id === data.id;
  }, [me, data]);
  
  const toDateOnly = (v: string) => v.slice(0, 10);

  const load = async () => {
    setError("");

    const res = await run(async () => {
      return await api<UserDetailResponse>(`/api/users/${userId}`);
    });

    if (!res) return;
    setData(res);
    setName(res.name);
  };

  // 모달이 열릴 때만 로드
  useEffect(() => {
    if (!open) return;
    if (!Number.isFinite(userId)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  // 모달 닫을 때 상태 리셋(원하면 유지해도 됨)
  useEffect(() => {
    if (open) return;
    setData(null);
    setEditing(false);
    setName("");
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

    // 최신 data를 부모로 전달하고 싶으면: load() 후에 전달해야 해서 아래처럼 처리
    // (간단히는 load()가 setData를 하니, 부모로는 다시 fetch해서 전달)
    const updated = await api<UserDetailResponse>(`/api/users/${data.id}`);
    setData(updated);
    onUpdated?.(updated);
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

    const updated = await api<UserDetailResponse>(`/api/users/${data.id}`);
    setData(updated);
    setName(updated.name);
    onUpdated?.(updated);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        // 편집중이면 닫기 전에 취소처리도 가능(선택)
        setEditing(false);
        onClose();
      }}
      title="User Detail"
    >
      {error && (
        <pre
          style={{
            background: "#f7f7f7",
            padding: 12,
            borderRadius: 8,
            whiteSpace: "pre-wrap",
            marginTop: 0,
          }}
        >
          {error}
        </pre>
      )}

      {!data ? (
        <p style={{ margin: 0 }}>{busy ? "로딩중..." : "데이터가 없습니다."}</p>
      ) : (
        <div style={{ 
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 16,
          width: 490,

          maxHeight: "70vh",
          overflowX: "hidden",
          boxSizing: "border-box",
        }}>
           
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

          <div style={{ marginBottom: 6 }}>
            <b>Email</b>: {data.email}
          </div>
          <div style={{ marginBottom: 6 }}>
            <b>Role</b>: {data.role}
          </div>
          <div style={{ marginBottom: 6 }}>
            <b>Active</b>: {String(data.active)}
          </div>
          
          {me.role === "ADMIN" && (
              <>
                <div style={{ marginBottom: 6 }}>
                  <b>Created</b>: {toDateOnly(data.createdAt)}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <b>Updated</b>: {toDateOnly(data.updatedAt)}
                </div>
              </>
            )}

          {me.role === "ADMIN" && (
            <div style={{ display: "flex", gap: 12 }}>
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
            </div>
          )}


          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onClose} disabled={busy}>
              닫기
            </button>
          </div>

        </div>
      )}
    </Modal>
  );
}
