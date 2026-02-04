import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "./api";
import { useApiCall } from "./useApiCall";
import PageContentWrapper from "./components/layout/PageContentWrapper";
import SectionSpacer from "./components/layout/SectionSpacer";
import ButtonStack from "./components/layout/ButtonStack";
import ActionButton from "./components/ui/ActionButton";

type VerifyResponse = { message: string };

export default function VerifyPage() {
  const loc = useLocation();
  const nav = useNavigate();
  const { busy, error, run } = useApiCall();

  const token = useMemo(() => {
    const sp = new URLSearchParams(loc.search);
    return sp.get("token") ?? "";
  }, [loc.search]);

  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setMsg("인증 토큰이 없습니다. 메일의 인증 링크를 다시 확인해주세요.");
      return;
    }

    run(async () => {
      const res = await api<VerifyResponse>(
        `/api/auth/verify?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
        },
      );
      setMsg(res?.message ?? "이메일 인증이 완료되었습니다.");
      return res;
    });
  }, [token]);

  return (
    <PageContentWrapper maxWidth="520px" marginTop="40px" padding="16px">
      <h2>이메일 인증</h2>
      <SectionSpacer size="md" />

      {busy && <p>인증 처리 중입니다...</p>}

      {!busy && error && (
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <p style={{ margin: 0 }}>인증에 실패했습니다.</p>
          <SectionSpacer size="sm" />
          <p style={{ whiteSpace: "pre-wrap" }}>{error}</p>
          <SectionSpacer size="sm" />
          <p style={{ color: "#666" }}>
            링크가 만료되었거나 이미 사용된 링크일 수 있습니다.
          </p>
        </div>
      )}

      {!busy && !error && msg && (
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg}</p>
        </div>
      )}

      <SectionSpacer size="md" />
      <ButtonStack>
        <ActionButton type="button" onClick={() => nav("/", { replace: true })} variant="link">
          로그인 하러 가기
        </ActionButton>
      </ButtonStack>
    </PageContentWrapper>
  );
}
