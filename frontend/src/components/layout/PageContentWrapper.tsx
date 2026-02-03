// src/components/layout/PageContentWrapper.tsx
import styled from 'styled-components';
import React from 'react';

interface PageContentWrapperProps {
  /**
   * The maximum width of the content area. Defaults to '1200px'.
   */
  maxWidth?: string;
  /**
   * The padding around the content. Defaults to '24px'.
   */
  padding?: string;
  /**
   * The top margin of the wrapper. Defaults to '0'.
   */
  marginTop?: string;
  /**
   * The content to be rendered inside the wrapper.
   */
  children: React.ReactNode;
}

const StyledPageContentWrapper = styled.div<PageContentWrapperProps>`
  margin-top: ${({ marginTop }) => marginTop || '0'};
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0; /* Default bottom margin to 0 */
  max-width: ${({ maxWidth }) => maxWidth || '1200px'};
  padding: ${({ padding }) => padding || '24px'};
`;

const PageContentWrapper: React.FC<PageContentWrapperProps> = ({
  children,
  ...props
}) => {
  return <StyledPageContentWrapper {...props}>{children}</StyledPageContentWrapper>;
};

export default PageContentWrapper;
