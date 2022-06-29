import * as React from "react";
import styled from "styled-components";

interface Props {
  children: React.ReactNode;
}

export const Alert = (p: Props) => {
  return <StyledAlert data-cy="alert">{p.children}</StyledAlert>;
};

const StyledAlert = styled.div`
  color: ${({ theme }) => theme.colors.error}; ;
`;
