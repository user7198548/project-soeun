// src/components/users/UserPagination.tsx

import React from "react";

interface UserPaginationProps {
  currentPage: number; // 0-based
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  busy: boolean; // 버튼 비활성화용
}

export const UserPagination: React.FC<UserPaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  busy,
}) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <div>Total: {totalElements}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          disabled={busy || currentPage <= 0}
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        >
          이전
        </button>
        <span>
          {currentPage + 1} / {totalPages || 1}
        </span>
        <button
          disabled={busy || totalPages === 0 || currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
};