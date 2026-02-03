import { useState } from "react";
import { api } from "./api";
import { useApiCall } from "./useApiCall";
import PageContentWrapper from "./components/layout/PageContentWrapper";
import SectionSpacer from "./components/layout/SectionSpacer";

type Errors = {
  email?: string;
  password?: string;
};

export default function Login({
  onSuccess,
  onGoSignup,
  onGoHome,
}: {
  onSuccess: () => Promise<void>;
  onGoSignup?: () => void;
  onGoHome?: () => void;
}) {
  const { busy, error, run } = useApiCall();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const needEmailVerify = error?.includes("이메일 인증");

  const validateEmail = (v: string) => {
    if (!v) return "이메일은 필수 입력 항목입니다.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(v)) return "유효하지 않은 이메일 형식입니다.";
    return undefined;
  };

  const validatePassword = (v: string) => {
    if (!v) return "비밀번호는 필수 입력 항목입니다.";
    return undefined;
  };

  const onEmailChange = (v: string) => {
    setEmail(v);
    setErrors((prev) => ({ ...prev, email: validateEmail(v.trim()) }));
  };

  const onPasswordChange = (v: string) => {
    setPassword(v);
    setErrors((prev) => ({ ...prev, password: validatePassword(v) }));
  };

  const isFormValid =
    email.trim() && password && !errors.email && !errors.password;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email.trim());
    const pwErr = validatePassword(password);

    setErrors({ email: emailErr, password: pwErr });
    if (emailErr || pwErr) return;

    const nextErrors: Errors = {
      email: validateEmail(email.trim()),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const ok = await run(async () => {
      await api<void>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      await onSuccess();
      return true;
    });

    if (!ok) return;
  };

  return (
    <PageContentWrapper maxWidth="420px">
      <div>
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
      <SectionSpacer size="md" />

      <h2>로그인</h2>
      <form onSubmit={submit}>
        <div>
          <div>이메일</div>
          <input
            value={email}
            placeholder="이메일"
            onChange={(e) => onEmailChange(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
          {/* {errors.email && (
            <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {errors.email}
            </div>
          )} */}
        </div>
        <SectionSpacer size="md" />

        <div>
          <div>비밀번호</div>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
          {/* {errors.password && (
            <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {errors.password}
            </div>
          )} */}
        </div>
        <SectionSpacer size="md" />

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
          {busy ? "로그인중..." : "로그인"}
        </button>

        {error && (
          <>
            <SectionSpacer size="md" />
            <p>
              <p style={{ color: "red", margin: 0 }}>{error}</p>

              {needEmailVerify && (
                <>
                  <SectionSpacer size="sm" />
                  <div>
                    <p style={{ color: "#666", margin: "6px 0 10px" }}>
                      가입한 이메일로 발송된 인증 링크를 클릭한 후 다시
                      로그인해주세요. 메일을 못 받으셨다면 아래 버튼으로
                      재전송할 수 있어요.
                    </p>

                    <button
                      type="button"
                      //onClick={resendVerification}
                      disabled={busy || !email.trim()}
                      style={{
                        padding: "8px 12px",
                        backgroundColor:
                          busy || !email.trim() ? "#ccc" : "#111827",
                        color: busy || !email.trim() ? "#666" : "#fff",
                        cursor:
                          busy || !email.trim() ? "not-allowed" : "pointer",
                      }}
                    >
                      {busy ? "전송 중..." : "인증 메일 재전송"}
                    </button>
                  </div>
                </>
              )}
            </p>
          </>
        )}

        <hr style={{ margin: "16px 0" }} />
        <button
          type="button"
          onClick={() => onGoSignup?.()}
          style={{ background: "transparent", color: "#3366ff" }}
        >
          아직 계정이 없으신가요? 회원가입
        </button>
      </form>
    </PageContentWrapper>
  );
}
