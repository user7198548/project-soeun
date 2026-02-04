// src/components/form/FormField.tsx
import styled from "styled-components";
import React from "react";

interface FormFieldProps {
  /**
   * The label text for the form field.
   */
  label?: string;
  /**
   * The actual input or select element to be rendered within the form field.
   */
  children: React.ReactNode;
  /**
   * Optional bottom margin for spacing between form fields. Defaults to '12px'.
   */
  marginBottom?: string;

  flex?: number | string;
  width?: string;
  minWidth?: string;
  shrink?: number;
}

const StyledFormFieldWrapper = styled.div<{
  $marginBottom?: string;
  $flex?: number | string;
  $width?: string;
  $minWidth?: string;
  $shrink?: number;
}>`
  /* This wrapper handles the overall spacing for the form field unit */
  margin-bottom: ${({ $marginBottom }) => $marginBottom || "12px"};

  /* flex 컨테이너 안에서 동작하도록 */
  flex: ${({ $flex }) => ($flex !== undefined ? $flex : "0 1 auto")};
  width: ${({ $width }) => $width || "auto"};
  min-width: ${({ $minWidth }) => $minWidth || "auto"};
  flex-shrink: ${({ $shrink }) => ($shrink !== undefined ? $shrink : 1)};
`;

const StyledLabel = styled.label`
  display: block; /* Ensures the label appears above the input */
  margin-bottom: 4px; /* Small space between the label and the input/control */
  font-size: 12px;
  color: #555;
`;

const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  marginBottom,
  flex,
  width,
  minWidth,
  shrink,
}) => {
  return (
    <StyledFormFieldWrapper
      $marginBottom={marginBottom}
      $flex={flex}
      $width={width}
      $minWidth={minWidth}
      $shrink={shrink}
    >
      {label && <StyledLabel>{label}</StyledLabel>}
      {children}
    </StyledFormFieldWrapper>
  );
};

export default FormField;
