// src/components/users/UserListItem.tsx

import React from "react";
import type { UserListItemResponse } from "./types";

interface UserListItemProps {
  user: UserListItemResponse;
  isProcessing: boolean; // 해당 항목의 활성화/비활성화 버튼 로딩 상태
  onClick: (userId: number) => void; // 항목 클릭 시 상세 보기
  onToggleActive: (userId: number, active: boolean) => void; // 활성화/비활성화 버튼 클릭
}

export const UserListItem: React.FC<UserListItemProps> = ({
  user,
  isProcessing,
  onClick,
  onToggleActive,
}) => {
  const blocked = !user.active;

  return (
    <div
      key={user.id}
      onClick={() => onClick(user.id)}
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 6,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        background: "white",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700 }}>
          #{user.id} {user.name} ({user.role})
          {blocked && (
            <span
              style={{
                fontSize: 12,
                padding: "2px 6px",
                borderRadius: 6,
                backgroundColor: "#ffecec",
                color: "#d32f2f",
                fontWeight: 700,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              차단
            </span>
          )}
        </div>
        {/* <div style={{ fontSize: 14, color: "#555" }}>{user.email}</div> */}
        {/* active: <b>{String(user.active)}</b> */}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {user.active ? (
          <button
            disabled={isProcessing}
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(user.id, false);
            }}
          >
            {isProcessing ? "처리중..." : "비활성화"}
          </button>
        ) : (
          <button
            disabled={isProcessing}
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(user.id, true);
            }}
          >
            {isProcessing ? "처리중..." : "활성화"}
          </button>
        )}
      </div>
    </div>
  );
};
