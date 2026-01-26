import { useEffect, useState } from "react";

function App() {
  const [msg, setMsg] = useState<string>("(loading...)");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hello") // ✅ 프록시 덕분에 8080으로 자동 전달
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => setMsg(text))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome 👋</h1>
      <p>서버 응답: <b>{msg}</b></p>
      {error && <p style={{ color: "red" }}>에러: {error}</p>}
    </div>
  );
}

export default App;
