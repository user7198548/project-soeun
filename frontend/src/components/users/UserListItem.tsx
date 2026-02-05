// src/components/users/UserListItem.tsx

import React from "react";
import type { UserListItemResponse } from "./types";

interface UserListItemProps {
  user: UserListItemResponse;
  isProcessing: boolean; // 해당 항목의 활성화/비활성화 버튼 로딩 상태
  onClick: (userId: number) => void; // 항목 클릭 시 상세 보기
  onToggleActive: (userId: number, active: boolean) => void; // 활성화/비활성화 버튼 클릭
  isSelected: boolean;
  onSelect: (userId: number, isSelected: boolean) => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({
  user,
  isProcessing,
  onClick,
  onToggleActive,
  isSelected,
  onSelect,
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
        alignItems: "center", // Align all items (checkbox, content) vertically
        cursor: "pointer",
        background: "white",
        gap: 8, // Add gap between checkbox and content
      }}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onClick={(e) => e.stopPropagation()} // Prevent row click
        onChange={(e) => onSelect(user.id, e.target.checked)}
        style={{ cursor: "pointer", flexShrink: 0 }} // Ensure checkbox doesn't shrink
      />

      {/* User Info and Action Buttons - now wrapped to maintain layout */}
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700 }}>
            #{user.id} {user.name}
            {blocked && (
              <span
                style={{
                  fontSize: 10,
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
    </div>
  );
};
