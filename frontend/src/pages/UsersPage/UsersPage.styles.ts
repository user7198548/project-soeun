// src/pages/UsersPage/UsersPage.styles.ts
import styled from "styled-components";

const PAGE_PADDING = "24px";
const SECTION_MARGIN_BOTTOM = "24px";
const PAGINATION_MARGIN_BOTTOM = "16px";

export const UsersPageContainer = styled.div`
  padding: ${PAGE_PADDING};
`;

export const UsersPageHeader = styled.h2`
  margin-top: 0;
`;

export const SearchSection = styled.div`
  margin-bottom: ${SECTION_MARGIN_BOTTOM}; /* Provides spacing below the search form */
`;

export const PaginationWrapper = styled.div`
  margin-bottom: ${PAGINATION_MARGIN_BOTTOM}; /* Provides spacing between pagination and table */
`;

export const TableWrapper = styled.div`
  /* No specific layout styles identified yet to extract for a wrapper around the table. */
`;
