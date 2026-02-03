import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "./api";
import { useApiCall } from "./useApiCall";
import UserDetailModal from "./UserDetailPage";
import { UserSearchForm } from "./components/users/UserSearchForm";
import type {
  UserFilters,
  MeResponse,
  UserListItemResponse,
  Page,
} from "./components/users/types";
import { UserListTable } from "./components/users/UserListTable";
import { UserPagination } from "./components/users/UserPagination";
import {
  UsersPageContainer,
  UsersPageHeader,
} from "./pages/UsersPage/UsersPage.styles";

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
  // const navigate = useNavigate();

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
    [page, size, email, name, role, from, to],
  );

  const validateDateRange = useCallback(() => {
    if (!from && !to) {
      return true;
    }

    if ((from && !to) || (!from && to)) {
      setError(
        "기간은 from/to를 모두 입력해주세요. 기간을 다시 설정해 주세요.",
      );
      return false;
    }
    if (from > to) {
      setError(
        "기간이 올바르지 않습니다. from 날짜가 to 날짜보다 늦습니다. 기간을 다시 설정해 주세요.",
      );
      return false;
    }
    return true;
  }, [from, to, setError]);

  const load = useCallback(async () => {
    setError("");
    if (!validateDateRange()) return;

    const res = await run(async () => {
      return await api<Page<UserListItemResponse>>(`/api/users?${queryString}`);
    });
    if (res) setData(res);
  }, [setError, validateDateRange, run, queryString, setData]);

  useEffect(() => {
    //console.log("effect fired", { page });
    // ADMIN만 조회 가능
    if (me.role !== "ADMIN") return;
    load();
  }, [page, load, me.role]);

  const handleSearch = async (filters: UserFilters) => {
    setError(""); // 기존 에러 초기화

    // 필터 상태 업데이트
    setEmail(filters.email);
    setName(filters.name);
    setRole(filters.role);
    setFrom(filters.from);
    setTo(filters.to);

    if (!validateDateRange()) return;

    setPage(0);
    //await load();
  };
  const handleReset = async () => {
    setError("");
    setEmail("");
    setName("");
    setRole("");
    setFrom("");
    setTo("");
    setPage(0);
    //await load();
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
      <UsersPageContainer>
        <h2>Users</h2>
        <p style={{ color: "red" }}>관리자만 접근 가능합니다.</p>
      </UsersPageContainer>
    );
  }

  return (
    <>
      <UsersPageContainer>
        <UsersPageHeader>회원 목록</UsersPageHeader>

        <UserSearchForm
          initialFilters={{ email, name, role, from, to }}
          onSearch={handleSearch}
          onReset={handleReset}
          onRefresh={load}
          busy={busy}
          errorMessage={error} // UserSearchForm에서 자체적으로 에러 메시지를 표시하도록 변경
        />

        {!data ? (
          <p>{busy ? "로딩중..." : "데이터가 없습니다."}</p>
        ) : (
          <>
            <UserPagination
              currentPage={data.number}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={setPage}
              busy={busy}
            />
            <UserListTable
              users={data.content}
              busyId={busyId}
              onUserClick={openDetail}
              onToggleActive={setActive}
            />
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
      </UsersPageContainer>
    </>
  );
}
