// src/components/users/UserSearchForm.tsx

import React, { useEffect, useState } from "react";
import type { UserFilters } from "./types";

interface UserSearchFormProps {
  initialFilters: UserFilters;
  onSearch: (filters: UserFilters) => void;
  onReset: () => void;
  onRefresh: () => void;
  busy: boolean;
  errorMessage?: string;
}

export const UserSearchForm: React.FC<UserSearchFormProps> = ({
  initialFilters,
  onSearch,
  onReset,
  onRefresh,
  busy,
  errorMessage,
}) => {
  const [email, setEmail] = useState(initialFilters.email);
  const [name, setName] = useState(initialFilters.name);
  const [role, setRole] = useState(initialFilters.role);
  const [from, setFrom] = useState(initialFilters.from);
  const [to, setTo] = useState(initialFilters.to);

  // initialFilters가 변경될 때 내부 상태를 동기화
  useEffect(() => {
    setEmail(initialFilters.email);
    setName(initialFilters.name);
    setRole(initialFilters.role);
    setFrom(initialFilters.from);
    setTo(initialFilters.to);
  }, [initialFilters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ email, name, role, from, to });
  };

  const handleReset = () => {
    onReset();
    // 부모 컴포넌트에서 initialFilters가 업데이트될 것이므로, useEffect를 통해 내부 상태가 동기화됨
  };

  const handleRefresh = () => {
    onRefresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        display: "grid",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 180px",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "#555" }}>email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#555" }}>name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#555" }}>role</div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">ALL</option>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 220px 1fr",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "#555" }}>from</div>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#555" }}>to</div>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
          <button type="submit" disabled={busy}>
            {busy ? "검색중..." : "검색"}
          </button>
          <button type="button" onClick={handleReset} disabled={busy}>
            초기화
          </button>
          <button type="button" onClick={handleRefresh} disabled={busy}>
            새로고침
          </button>
        </div>
      </div>
      {errorMessage && (
        <pre
          style={{
            background: "#f7f7f7",
            padding: 12,
            borderRadius: 8,
            whiteSpace: "pre-wrap",
            color: "red",
          }}
        >
          {errorMessage}
        </pre>
      )}
    </form>
  );
};
