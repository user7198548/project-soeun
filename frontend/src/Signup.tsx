import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";
import { useApiCall } from "./useApiCall";

export default function Signup() {
  const navigate = useNavigate();
  const { busy, error, run } = useApiCall();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const ok = await run(async () => {
      await api<void>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, name, password }),
      });
      return true;
    });
    // 회원가입 후 로그인 화면으로
    navigate("/login");
    
    if (!ok) return;
    navigate("/login");
      
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 420 }}>
      <h2>회원가입</h2>

      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <div>이메일</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} 
            style={{ width: "100%", padding: 8 }}
            placeholder="email@example.com"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div>이름</div>
          <input value={name} onChange={(e) => setName(e.target.value)} 
            style={{ width: "100%", padding: 8 }}
            placeholder="홍길동"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div>비밀번호</div>
          <input type="password" value={password} 
          onChange={(e) => setPassword(e.target.value)} 
            style={{ width: "100%", padding: 8 }}
            placeholder="영문+숫자 포함 8자 이상"
          />
        </div>

        <button type="submit"  disabled={busy} style={{ padding: "8px 12px" }}>
          {busy ? "가입중..." : "회원가입"}
        </button>

        {error && (
          <p style={{ color: "red", whiteSpace: "pre-wrap", marginTop: 12 }}>
            {error}
          </p>
        )}
      </form>

      <hr style={{ margin: "16px 0" }} />

      <button
        type="button"
        onClick={() => navigate("/login")}
        style={{ background: "transparent", color: "#3366ff" }}
      >
        이미 계정이 있으신가요? 로그인
      </button>
    </div>
  );
}
