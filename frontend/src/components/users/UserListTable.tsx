// src/components/users/UserListTable.tsx

import React from "react";
import type { UserListItemResponse } from "./types";
import { UserListItem } from "./UserListItem";

interface UserListTableProps {
  users: UserListItemResponse[];
  busyId: number | null; // 특정 사용자 액션 로딩 상태
  onUserClick: (userId: number) => void;
  onToggleActive: (userId: number, active: boolean) => void;
}

export const UserListTable: React.FC<UserListTableProps> = ({
  users,
  busyId,
  onUserClick,
  onToggleActive,
}) => {
  return (
    <div
      style={{
        maxHeight: "calc(100vh - 260px)", // 기존 UsersPage의 스타일 유지
        overflowY: "auto",
        paddingRight: 6,
      }}
    >
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
