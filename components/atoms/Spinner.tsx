import styled, { keyframes } from "styled-components";

export const Spinner = () => <StyledSpinner data-cy="spinner" />;

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledSpinner = styled.div`
  animation: ${rotate360} 1s linear infinite;
  transform: translateZ(0);
  border-top: ${({ theme }) => `2px solid ${theme.colors.secondary}`};
  border-right: ${({ theme }) => `2px solid ${theme.colors.secondary}`};
  border-bottom: ${({ theme }) => `2px solid ${theme.colors.secondary}`};
  border-left: ${({ theme }) => `2px solid ${theme.colors.primary}`};
  background: transparent;
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;
