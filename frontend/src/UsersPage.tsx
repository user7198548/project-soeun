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
import ButtonStack from "./components/layout/ButtonStack"; // New import
import ActionButton from "./components/ui/ActionButton"; // New import
import SectionSpacer from "./components/layout/SectionSpacer"; // New import

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

  // sorting
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // multi-selection
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    new Set(),
  );
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // paging
  const [page, setPage] = useState(0);
  const size = 20;

  const [data, setData] = useState<Page<UserListItemResponse> | null>(null);

  const { hasActiveSelected, hasInactiveSelected } = useMemo(() => {
    const selectedUsers =
      data?.content?.filter((user) => selectedUserIds.has(user.id)) || [];
    const activeUsersCount = selectedUsers.filter((user) => user.active).length;
    const inactiveUsersCount = selectedUsers.filter(
      (user) => !user.active,
    ).length;

    return {
      hasActiveSelected: activeUsersCount > 0,
      hasInactiveSelected: inactiveUsersCount > 0,
    };
  }, [selectedUserIds, data?.content]);
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
        sort: `${sortKey},${sortDir}`,
      }),
    [page, size, email, name, role, from, to, sortKey, sortDir],
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

  const handleSort = useCallback(
    (key: string) => {
      setPage(0); // Reset page on sort change
      if (sortKey === key) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir(key === "createdAt" ? "desc" : "asc"); // Default desc for createdAt, asc for others
      }
    },
    [sortKey],
  );

  const handleSelectUser = useCallback((userId: number, checked: boolean) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAllUsers = useCallback(
    (checked: boolean) => {
      setSelectedUserIds((prev) => {
        if (checked && data?.content) {
          return new Set(data.content.map((user) => user.id));
        } else {
          return new Set();
        }
      });
    },
    [data?.content],
  );

  const handleBulkDeactivate = useCallback(async () => {
    if (selectedUserIds.size === 0) return;
    setError("");
    setBulkProcessing(true); // Set bulk processing state

    try {
      const usersToDeactivate = Array.from(selectedUserIds).filter((userId) => {
        const user = data?.content?.find((u) => u.id === userId);
        return user && user.active === true; // Only deactivate if currently active
      });

      if (usersToDeactivate.length === 0) {
        setError("선택된 사용자 중 비활성화할 대상이 없습니다.");
        setSelectedUserIds(new Set());
        return;
      }

      const promises = usersToDeactivate.map((userId) =>
        api<void>(`/api/users/${userId}/active`, {
          method: "PATCH",
          body: JSON.stringify({ active: false }),
        }),
      );

      const results = await run(() => Promise.allSettled(promises));

      let failedIds: number[] = [];
      if (results) {
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            failedIds.push(usersToDeactivate[index]);
          }
        });
      }

      if (failedIds.length > 0) {
        const failedIdsPreview = failedIds.slice(0, 5).join(", ");
        setError(
          `일부 비활성화 처리 실패 (${failedIds.length}건): ${failedIdsPreview}`,
        );
      } else {
        setError(""); // Clear error on success
      }
      setSelectedUserIds(new Set()); // Clear selection
      await load(); // Reload data
    } finally {
      setBulkProcessing(false); // Reset bulk processing state
    }
  }, [selectedUserIds, setError, setBulkProcessing, run, load, data?.content]);

  const handleBulkActivate = useCallback(async () => {
    if (selectedUserIds.size === 0) return;
    setError("");
    setBulkProcessing(true); // Set bulk processing state

    try {
      const usersToActivate = Array.from(selectedUserIds).filter((userId) => {
        const user = data?.content?.find((u) => u.id === userId);
        return user && user.active === false; // Only activate if currently inactive
      });

      if (usersToActivate.length === 0) {
        setError("선택된 사용자 중 활성화할 대상이 없습니다.");
        setSelectedUserIds(new Set());
        return;
      }

      const promises = usersToActivate.map((userId) =>
        api<void>(`/api/users/${userId}/active`, {
          method: "PATCH",
          body: JSON.stringify({ active: true }),
        }),
      );

      const results = await run(() => Promise.allSettled(promises));

      let failedIds: number[] = [];
      if (results) {
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            failedIds.push(usersToActivate[index]);
          }
        });
      }

      if (failedIds.length > 0) {
        const failedIdsPreview = failedIds.slice(0, 5).join(", ");
        setError(
          `일부 활성화 처리 실패 (${failedIds.length}건): ${failedIdsPreview}`,
        );
      } else {
        setError(""); // Clear error on success
      }
      setSelectedUserIds(new Set()); // Clear selection
      await load(); // Reload data
    } finally {
      setBulkProcessing(false); // Reset bulk processing state
    }
  }, [selectedUserIds, setError, setBulkProcessing, run, load, data?.content]);

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
    setSelectedUserIds(new Set()); // Clear selection on search
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
    setSelectedUserIds(new Set()); // Clear selection on reset
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
          errorMessage={error}
        />
        <SectionSpacer size="md" />

        <ButtonStack gap="8px">
          {hasActiveSelected && (
            <ActionButton
              variant="secondary"
              onClick={handleBulkDeactivate}
              disabled={busy || bulkProcessing}
            >
              {bulkProcessing
                ? "처리중..."
                : `선택 비활성화 (${selectedUserIds.size})`}
            </ActionButton>
          )}
          {hasInactiveSelected && (
            <ActionButton
              variant="secondary"
              onClick={handleBulkActivate}
              disabled={busy || bulkProcessing}
            >
              {bulkProcessing
                ? "처리중..."
                : `선택 활성화 (${selectedUserIds.size})`}
            </ActionButton>
          )}
          {selectedUserIds.size > 0 && ( // Always show clear selection if anything is selected
            <ActionButton
              variant="secondary"
              onClick={() => setSelectedUserIds(new Set())}
              disabled={busy || bulkProcessing}
            >
              선택 해제
            </ActionButton>
          )}
        </ButtonStack>
        <SectionSpacer size="md" />

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
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              // New props for selection
              selectedUserIds={selectedUserIds}
              onSelectUser={handleSelectUser}
              onSelectAllUsers={handleSelectAllUsers}
              allUsersOnPageSelected={
                data.content.length > 0 &&
                data.content.every((u) => selectedUserIds.has(u.id))
              }
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
