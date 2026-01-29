import { useState } from "react";
import { api } from "./api";
import { useApiCall } from "./useApiCall";
import Modal from "./Modal";


type Errors = {
  email?: string;
  name?: string;
  password?: string;
};

export default function Signup({
  onSuccess,
  onGoLogin,
  onGoHome,
  
  }: {
  onSuccess: () => void;
  onGoLogin: () => void;
  onGoHome?: () => void;
}) {
  const { busy, error, run } = useApiCall();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [emailChecking, setEmailChecking] = useState(false); // 중복 체크 중 표시용(선택)
  const [successOpen, setSuccessOpen] = useState(false);

  // -----------------------
  // 1) Sync validations (onChange용)
  // -----------------------
  const validateEmailSync = (v: string) => {
    if (!v) return "이메일은 필수 입력 항목입니다.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(v)) return "유효하지 않은 이메일 형식입니다.";
    return undefined;
  };

  const validateNameSync = (v: string) => {
    if (!v) return "이름은 필수 입력 항목입니다.";
    const nameRegex = /^[가-힣a-zA-Z]+$/;
    if (!nameRegex.test(v)) return "유효하지 않은 이름입니다.";
    return undefined;
  };

  const validatePasswordSync = (v: string) => {
    if (!v) return "비밀번호는 필수 입력 항목입니다.";
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!pwRegex.test(v)) return "영문과 숫자를 포함해 8자 이상이어야 합니다.";
    return undefined;
  };

  // -----------------------
  // 2) Email duplicate check (onBlur용)
  //    서버 응답 형태는 프로젝트에 맞게 수정하세요.
  // -----------------------
  const checkEmailDuplicate = async (v: string): Promise<boolean> => {
    // 예시: { duplicated: true/false }
    const res = await api<{ duplicated: boolean }>(
      `/api/auth/check-email?email=${encodeURIComponent(v)}`,
      { method: "GET" }
    );
    return res.duplicated;
  };

  // -----------------------
  // 3) Handlers
  // -----------------------
  const onEmailChange = (v: string) => {
    setEmail(v);

    const msg = validateEmailSync(v);

    setErrors((prev) => ({ ...prev, email: msg }));

    // 중복 체크는 blur에서만 하므로 여기서는 emailChecking 끔
    setEmailChecking(false);
  };

  const onEmailBlur = async () => {
    const v = email.trim();

    // blur 전에 최신 email 기준으로 동기 검증 한 번 더
    const syncMsg = validateEmailSync(v);
    setErrors((prev) => ({ ...prev, email: syncMsg }));
    if (syncMsg) return;

    // 레이스 컨디션 방지: blur 시점 email 스냅샷 저장
    const snapshot = v;

    setEmailChecking(true);
    try {
      const duplicated = await checkEmailDuplicate(snapshot);

      // 응답이 돌아왔는데 사용자가 그 사이 email을 바꿨으면 무시
      if (snapshot !== email.trim()) return;

      setErrors((prev) => ({
        ...prev,
        email: duplicated ? "이미 사용 중인 이메일입니다." : undefined,
      }));
    } catch (e) {
      // 네트워크/서버 문제는 UX상 “확인 실패” 정도로만
      console.error(e);
      setErrors((prev) => ({
        ...prev,
        email: "이메일 중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.",
      }));
    } finally {
        setEmailChecking(false);
    }
  };

  const onNameChange = (v: string) => {
    setName(v);
    setErrors((prev) => ({ ...prev, name: validateNameSync(v) }));
  };

  const onPasswordChange = (v: string) => {
    setPassword(v);
    setErrors((prev) => ({ ...prev, password: validatePasswordSync(v) }));
  };

  // -----------------------
  // 4) 버튼 활성화 조건
  // -----------------------
  const isFormValid =
    email.trim() &&
    name.trim() &&
    password &&
    !errors.email &&
    !errors.name &&
    !errors.password &&
    !emailChecking;

  // -----------------------
  // 5) Submit: 최종 방어
  // -----------------------
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Errors = {
      email: validateEmailSync(email.trim()),
      name: validateNameSync(name.trim()),
      password: validatePasswordSync(password),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    // submit 직전에 중복 체크를 한번 더 하기도 함(선택)
    /*
    setEmailChecking(true);
    const duplicated = await checkEmailDuplicate(email.trim());
    setEmailChecking(false);
    if (duplicated) {
      setErrors((prev) => ({ ...prev, email: "이미 사용 중인 이메일입니다." }));
      return;
    }
    */

    const ok = await run(async () => {
      await api<void>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), name: name.trim(), password }),
      });
      return true;
    });

    if (!ok) return;
    setEmail("");
    setName("");
    setPassword("");
    setErrors({});
    setSuccessOpen(true);

  };

  return (
    <>
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 420 }}>
      
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => onGoHome?.()}
          style={{
            background: "transparent",
            border: "none",
            color: "#3366ff",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Home
        </button>
      </div>
      
      <h2>회원가입</h2>

      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <div>이메일</div>
          <input
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={onEmailBlur}
            style={{ width: "100%", padding: 8 }}
            placeholder="이메일"
          />
          {emailChecking && (
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
              이메일 중복 확인 중...
            </div>
          )}
          {errors.email && (
            <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {errors.email}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div>이름</div>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            placeholder="이름"
          />
          {errors.name && (
            <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {errors.name}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div>비밀번호</div>
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            placeholder="영문+숫자 포함 8자 이상"
          />
          {errors.password && (
            <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {errors.password}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid || busy}
          style={{
            padding: "8px 12px",
            backgroundColor: !isFormValid || busy ? "#ccc" : "#3366ff",
            color: !isFormValid || busy ? "#666" : "#fff",
            cursor: !isFormValid || busy ? "not-allowed" : "pointer",
          }}
        >
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
        onClick={onGoLogin}
        style={{ background: "transparent", color: "#3366ff" }}
      >
        이미 계정이 있으신가요? 로그인
      </button>
    </div>
    <Modal
      open={successOpen}
      onClose={() => {
        setSuccessOpen(false);
        onSuccess(); // 👉 확인 누르면 로그인 화면으로
      }}
      title="회원가입 완료 🎉"
    >
      <div style={{ fontFamily: "sans-serif" }}>
        <p style={{ marginBottom: 16 }}>
          회원가입을 축하드립니다!<br />
          로그인 후 서비스를 이용해 주세요 😊
        </p>

        <button
          onClick={() => {
            setSuccessOpen(false);
            onSuccess();
          }}
          style={{
            padding: "8px 14px",
            background: "#3366ff",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          로그인 하러 가기
        </button>
      </div>
    </Modal>
</>
    
  );
  
}
