// src/components/form/TextInput.tsx
import styled, { css } from 'styled-components';
import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * If true, applies error styling (red border) to the input.
   */
  error?: boolean;
}

const StyledInput = styled.input<TextInputProps>`
  width: 100%;
  padding: 8px;
  border: 1px solid ${({ error }) => (error ? '#ff4d4f' : '#e5e6eb')}; /* Red border for error, otherwise default gray */
  border-radius: 6px;
  box-sizing: border-box; /* Ensure padding and border are included in the element's total width and height */
  font-size: 14px; /* Standard font size for text inputs */
  line-height: 1.5; /* Standard line height */

  &:focus {
    outline: none; /* Remove default browser outline */
    border-color: #3366ff; /* Primary blue for focus border */
    box-shadow: 0 0 0 2px rgba(51, 102, 255, 0.2); /* Subtle blue shadow on focus */
  }

  &:disabled {
    background-color: #f2f3f5; /* Light gray background for disabled */
    cursor: not-allowed;
    border-color: #dcdcdc; /* Slightly darker border for disabled */
    color: #a0a0a0; /* Gray out text for disabled */
  }

  /* Placeholder text styling */
  &::placeholder {
    color: #b0b0b0;
  }

  /* Specific styling for date inputs if necessary to override user agent styles */
  ${({ type }) => (type === 'date' || type === 'time' || type === 'datetime-local') && css`
    /* Add any specific overrides for date/time inputs here if required */
    // Example: -webkit-appearance: none; to hide default calendar icon on WebKit browsers
  `}
`;

const TextInput: React.FC<TextInputProps> = (props) => {
  return <StyledInput {...props} />;
};

export default TextInput;
