// src/components/users/UserListTable.tsx

import React, { useRef, useEffect } from "react";
import type {
  UserListItemResponse,
  SortDir,
  OnSortFunction,
  SelectedUserIds,
  OnSelectUserFunction,
} from "./types";
import { UserListItem } from "./UserListItem";

interface UserListTableProps {
  users: UserListItemResponse[];
  busyId: number | null; // 특정 사용자 액션 로딩 상태
  onUserClick: (userId: number) => void;
  onToggleActive: (userId: number, active: boolean) => void;
  sortKey: string;
  sortDir: SortDir;
  onSort: OnSortFunction;
  // New props for multi-selection
  selectedUserIds: SelectedUserIds;
  onSelectUser: OnSelectUserFunction;
  allUsersOnPageSelected: boolean;
  onSelectAllUsers: (checked: boolean) => void;
}

export const UserListTable: React.FC<UserListTableProps> = ({
  users,
  busyId,
  onUserClick,
  onToggleActive,
  sortKey,
  sortDir,
  onSort,
  // New props for multi-selection
  selectedUserIds,
  onSelectUser,
  allUsersOnPageSelected,
  onSelectAllUsers,
}) => {
  const getSortIndicator = (key: string) => {
    if (sortKey === key) {
      return sortDir === "asc" ? " ▲" : " ▼";
    }
    return "";
  };

  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      const isAnySelected = users.some((u) => selectedUserIds.has(u.id));
      checkboxRef.current.indeterminate =
        isAnySelected && !allUsersOnPageSelected;
    }
  }, [selectedUserIds, allUsersOnPageSelected, users]);

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
          gridTemplateColumns: "40px 1.5fr 1.5fr 1fr 1fr 1.5fr 0.5fr", // Added 40px for checkbox
          gap: 8,
          padding: "8px 0",
          fontWeight: "bold",
          borderBottom: "1px solid #eee",
          marginBottom: "8px",
        }}
      >
        <div style={{ paddingLeft: "8px" }}>
          {" "}
          {/* Checkbox column header */}
          <input
            type="checkbox"
            checked={allUsersOnPageSelected}
            onChange={(e) => onSelectAllUsers(e.target.checked)}
            ref={checkboxRef}
          />
        </div>
        <div onClick={() => onSort("email")} style={{ cursor: "pointer" }}>
          Email{getSortIndicator("email")}
        </div>
        <div onClick={() => onSort("name")} style={{ cursor: "pointer" }}>
          Name{getSortIndicator("name")}
        </div>
        <div onClick={() => onSort("role")} style={{ cursor: "pointer" }}>
          Role{getSortIndicator("role")}
        </div>
        <div onClick={() => onSort("active")} style={{ cursor: "pointer" }}>
          {" "}
          {/* Corrected to 'active' */}
          Active{getSortIndicator("active")}
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
            // New props for selection
            isSelected={selectedUserIds.has(u.id)}
            onSelect={onSelectUser}
          />
        ))}
      </div>
    </div>
  );
};
