import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import Login from "./Login";
import Signup from "./Signup";

type MeResponse = {
  id: number;
  email: string;
  name: string;
  role: string;
};

type AuthModal = "closed" | "login" | "signup";

export default function MainPage({
  me,
  refreshMe,
}: {
  me: MeResponse | null;
  refreshMe: () => Promise<MeResponse | null>;
}) {
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState<AuthModal>("closed");

  const close = () => setAuthModal("closed");

  const goAfterLogin = (m: MeResponse) => {
    const role = (m.role || "").toUpperCase();
    if (role === "ADMIN") navigate("/users", { replace: true });
    else navigate(`/users/${m.id}`, { replace: true });
  };

  const title = useMemo(() => {
    if (authModal === "login") return "로그인";
    if (authModal === "signup") return "회원가입";
    return "";
  }, [authModal]);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>메인 화면</h1>

      {me ? (
        <>
          <p>
            현재 로그인: <b>{me.email}</b> ({me.role})
          </p>
          <button
            onClick={() => goAfterLogin(me)}
            style={{ padding: "10px 14px" }}
          >
            내 페이지로 이동
          </button>
        </>
      ) : (
        <>
          <p>로그인 또는 회원가입을 진행해주세요.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setAuthModal("login")} style={{ padding: "10px 14px" }}>
              로그인
            </button>
            <button onClick={() => setAuthModal("signup")} style={{ padding: "10px 14px" }}>
              회원가입
            </button>
          </div>
        </>
      )}

      <Modal open={authModal !== "closed"} onClose={close} title={title}>
        {authModal === "login" ? (
          <Login
            onSuccess={async () => {
                const me = await refreshMe(); // 👈 /api/me 호출
                if (!me) return;

                    if (me.role === "ADMIN") {
                    navigate("/users", { replace: true });
                    } else { // USER 포함 나머지
                    navigate(`/users/${me.id}`, { replace: true });
                    }                
            }}
            onGoSignup={() => setAuthModal("signup")}
            onGoHome={close}
          />
        ) : (
          <Signup
            onSuccess={() => setAuthModal("login")}
            onGoLogin={() => setAuthModal("login")}
            onGoHome={close}
          />
        )}
      </Modal>
    </div>
  );
}
