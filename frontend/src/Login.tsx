import { useState } from "react";
import { api } from "./api";
import { useApiCall } from "./useApiCall";
import PageContentWrapper from "./components/layout/PageContentWrapper";
import SectionSpacer from "./components/layout/SectionSpacer";
import ActionButton from "./components/ui/ActionButton";
import TextInput from "./components/form/TextInput";

type Errors = {
  email?: string;
  password?: string;
};

export default function Login({
  onSuccess,
  onGoSignup,
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

  const onEmailChange = (v: string) => {
    setEmail(v);
  };

  const onPasswordChange = (v: string) => {
    setPassword(v);
  };

  const isFormValid = email.trim() && password;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setErrors({
        email: !email.trim() ? "이메일을 입력해주세요." : undefined,
        password: !password ? "비밀번호를 입력해주세요." : undefined,
      });
      return;
    }

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
      <SectionSpacer size="md" />

      <form onSubmit={submit}>
        <div>
          <TextInput
            value={email}
            placeholder="이메일"
            onChange={(e) => onEmailChange(e.target.value)}
            // error={!!errors.email}
          />
          {errors.email && (
            <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {errors.email}
            </div>
          )}
        </div>
        <SectionSpacer size="md" />

        <div>
          <TextInput
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            // error={!!errors.password}
          />
          {/* {errors.password && (
            <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {errors.password}
            </div>
          )} */}
        </div>
        <SectionSpacer size="md" />

        <ActionButton
          type="submit"
          disabled={!isFormValid || busy}
          variant="primary"
        >
          {busy ? "로그인중..." : "로그인"}
        </ActionButton>

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
        <ActionButton
          type="button"
          onClick={() => onGoSignup?.()}
          variant="link"
        >
          아직 계정이 없으신가요? 회원가입
        </ActionButton>
      </form>
    </PageContentWrapper>
  );
}
