import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "./api";
import { useApiCall } from "./useApiCall";

export default function Login({ onSuccess }: { onSuccess: () => Promise<void> }) {
  const navigate = useNavigate();
  const { busy, error, run } = useApiCall();
  
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("1234");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const ok = await run(async () => {
      await api<void>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await onSuccess();
      navigate("/users", { replace: true });
      return true;
    });

    if (!ok) return;
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 420 }}>
      <h2>로그인</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <div>이메일</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div>비밀번호</div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 8 }} />
        </div>
        <button type="submit" style={{ padding: "8px 12px" }}>
        {busy ? "로그인중..." : "로그인"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <hr style={{ margin: "16px 0" }} />
        <button
        type="button"
        onClick={() => navigate("/signup")}
        style={{ background: "transparent", color: "#3366ff" }}
      >
        아직 계정이 없으신가요? 회원가입
      </button>

      </form>
    </div>
  );
}
