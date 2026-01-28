import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api<void>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, name, password }),
      });

      // 회원가입 후 로그인 화면으로
      navigate("/login");
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 420 }}>
      <h2>회원가입</h2>

      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <div>이메일</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div>이름</div>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div>비밀번호</div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button type="submit">회원가입</button>

        {error && <p style={{ color: "red" }}>{error}</p>}
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
