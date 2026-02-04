// src/components/users/UserListTable.tsx

import React from "react";
import type { UserListItemResponse, SortDir, OnSortFunction } from "./types";
import { UserListItem } from "./UserListItem";

interface UserListTableProps {
  users: UserListItemResponse[];
  busyId: number | null; // 특정 사용자 액션 로딩 상태
  onUserClick: (userId: number) => void;
  onToggleActive: (userId: number, active: boolean) => void;
  sortKey: string;
  sortDir: SortDir;
  onSort: OnSortFunction;
}

export const UserListTable: React.FC<UserListTableProps> = ({
  users,
  busyId,
  onUserClick,
  onToggleActive,
  sortKey,
  sortDir,
  onSort,
}) => {
  const getSortIndicator = (key: string) => {
    if (sortKey === key) {
      return sortDir === "asc" ? " ▲" : " ▼";
    }
    return "";
  };

  return (
    <div
      style={{
        maxHeight: "calc(100vh - 260px)",
        //overflowY: "auto", //스크롤 겹침
        paddingRight: 6,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1.5fr 0.5fr", // Email, Name, Role, Active, Created At, Actions
          gap: 8,
          padding: "8px 0",
          fontWeight: "bold",
          borderBottom: "1px solid #eee",
          marginBottom: "8px",
        }}
      >
        <div onClick={() => onSort("email")} style={{ cursor: "pointer" }}>
          Email{getSortIndicator("email")}
        </div>
        <div onClick={() => onSort("name")} style={{ cursor: "pointer" }}>
          Name{getSortIndicator("name")}
        </div>
        <div onClick={() => onSort("role")} style={{ cursor: "pointer" }}>
          Role{getSortIndicator("role")}
        </div>
        <div onClick={() => onSort("isActive")} style={{ cursor: "pointer" }}>
          Active{getSortIndicator("isActive")}
        </div>
        <div onClick={() => onSort("createdAt")} style={{ cursor: "pointer" }}>
          Created At{getSortIndicator("createdAt")}
        </div>
        <div></div> {/* For actions column */}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {users.map((u) => (
          <UserListItem
            key={u.id}
            user={u}
            isProcessing={busyId === u.id}
            onClick={onUserClick}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>
    </div>
  );
};
