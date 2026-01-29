import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import Login from "./Login";
import Signup from "./Signup";
import UserDetailModal from "./UserDetailPage";


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

  const [myDetailOpen, setMyDetailOpen] = useState(false);
  
  const close = () => setAuthModal("closed");

    const openMyPage = () => {
    if (!me) return;

    // const role = (me.role || "").toUpperCase();

    // // 정책: ADMIN이면 /users로 이동, USER면 내 디테일 모달
    // if (role === "ADMIN") {
    //   navigate("/users", { replace: true });
    // } else {
      setMyDetailOpen(true); // 모달 열기
    // }
  };

  const title = useMemo(() => {
    if (authModal === "login") return "로그인";
    if (authModal === "signup") return "회원가입";
    return "";
  }, [authModal]);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", 
        maxWidth: 1200, margin: "0 auto"}}>
      <h1>메인 화면</h1>
      {me && String(me.role).toUpperCase().includes("ADMIN") && (
        <button
          type="button"
          onClick={() => navigate("/users")}
          style={{ padding: "10px 14px" }}
        >
          유저목록(/users)
        </button>
      )}
      {me ? (
        <>
          {/* <p>
            현재 로그인: <b>{me.email}</b> ({me.role})
          </p> */}
          <button
            onClick={openMyPage}
            style={{ padding: "10px 14px" }}
          >
            마이페이지
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
              const newMe = await refreshMe(); // /api/me 호출
              if (!newMe) return;

              const role = (newMe.role || "").toUpperCase();

              if (role === "ADMIN") {
                navigate("/users", { replace: true });
              } else {
                // 로그인 성공하면 "내 상세 모달" 바로 띄우기
                setMyDetailOpen(true);
              }

              // (선택) 로그인 모달 닫기
              close();
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

      {me && (
        <UserDetailModal
          open={myDetailOpen}
          onClose={() => setMyDetailOpen(false)}
          me={me}
          userId={me.id}
          onUpdated={async () => {
            // (선택) 내 정보 바뀌면 헤더/메인 표시 갱신
            await refreshMe();
          }}
        />
      )}
    </div>
  );
}
