// src/components/layout/SectionSpacer.tsx
import styled from "styled-components";

interface SectionSpacerProps {
  /**
   * The size of the vertical space.
   * 'sm' (8px), 'md' (16px), 'lg' (24px). Defaults to 'md'.
   */
  size?: "sm" | "md" | "lg";
}

const getSpacing = (size: "sm" | "md" | "lg" | undefined) => {
  switch (size) {
    case "sm":
      return "8px";
    case "md":
      return "16px";
    case "lg":
      return "24px";
    default:
      return "16px"; // Default spacing for 'md'
  }
};

const SectionSpacer = styled.div<SectionSpacerProps>`
  display: block;
  height: ${({ size }) => getSpacing(size)};
  width: 100%;
  flex-shrink: 0;
`;

export default SectionSpacer;
