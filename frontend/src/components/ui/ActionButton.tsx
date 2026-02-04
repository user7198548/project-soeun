// src/components/ui/ActionButton.tsx
import styled, { css } from "styled-components";
import React from "react";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Defines the visual style of the button.
   * 'primary' for main actions, 'secondary' for less prominent actions, 'link' for text-based actions.
   * Defaults to 'primary'.
   */
  variant?: "primary" | "secondary" | "link";
}

// Common styles applied to all button variants
const commonButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500; /* Semi-bold */
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  white-space: nowrap; /* Prevent text wrapping */
  text-decoration: none; /* Default for buttons */

  &:focus-visible {
    outline: 2px solid currentColor; /* Accessibility outline */
    outline-offset: 2px;
  }
`;

// Styles specific to the 'primary' variant
const primaryStyles = css`
  background-color: #b3c1eb; /* Brand blue */
  color: #fff;
  padding: 10px 14px;
  margin: 2px;
  border-radius: 6px;
  border: none;

  &:hover:not(:disabled) {
    background-color: #2a5dd9; /* Slightly darker blue on hover */
  }

  &:disabled {
    background-color: #ccc; /* Desaturated gray for disabled */
    color: #666;
    cursor: not-allowed;
  }
`;

// Styles specific to the 'secondary' variant
const secondaryStyles = css`
  background-color: #fff; /* White background */
  color: #333; /* Dark neutral text */
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #e5e6eb; /* Light gray border */

  &:hover:not(:disabled) {
    background-color: #f8f9fc; /* Very light gray background on hover */
    border-color: #d1d2d6; /* Slightly darker border on hover */
  }

  &:disabled {
    background-color: #ccc; /* Desaturated gray for disabled */
    color: #666;
    border-color: #ddd;
    cursor: not-allowed;
  }
`;

// Styles specific to the 'link' variant
const linkStyles = css`
  background-color: transparent;
  color: #3366ff; /* Brand blue for link text */
  padding: 0;
  border: none;
  font-weight: 400; /* Normal weight for link text */

  &:hover:not(:disabled) {
    text-decoration: underline;
  }

  &:disabled {
    color: #999; /* Lighter gray for disabled link */
    cursor: not-allowed;
  }
`;

// Styled component that applies variant-specific styles
const StyledActionButton = styled.button<ActionButtonProps>`
  ${commonButtonStyles}

  ${({ variant = "primary" }) => {
    switch (variant) {
      case "secondary":
        return secondaryStyles;
      case "link":
        return linkStyles;
      case "primary":
      default:
        return primaryStyles;
    }
  }}
`;

const ActionButton: React.FC<ActionButtonProps> = ({ children, ...props }) => {
  return <StyledActionButton {...props}>{children}</StyledActionButton>;
};

export default ActionButton;
