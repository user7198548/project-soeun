// src/components/layout/ButtonStack.tsx
import styled from 'styled-components';
import React from 'react';

interface ButtonStackProps {
  /**
   * The space between children elements. Defaults to '8px'.
   */
  gap?: string;
  /**
   * Defines how items are aligned along the cross axis (vertical in a row-direction flex container).
   * Corresponds to `align-items` CSS property. Defaults to 'flex-start'.
   */
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  /**
   * Defines how items are distributed along the main axis (horizontal in a row-direction flex container).
   * Corresponds to `justify-content` CSS property. Defaults to 'flex-start'.
   */
   justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  /**
   * The child elements to be stacked.
   */
  children: React.ReactNode;
}

const StyledButtonStack = styled.div<ButtonStackProps>`
  display: flex;
  gap: ${({ gap }) => gap || '8px'};
  align-items: ${({ align = 'flex-start' }) => align};
  justify-content: ${({ justify = 'flex-start' }) => justify};
`;

const ButtonStack: React.FC<ButtonStackProps> = ({ children, ...props }) => {
  return <StyledButtonStack {...props}>{children}</StyledButtonStack>;
};

export default ButtonStack;
