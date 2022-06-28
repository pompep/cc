import * as React from "react";
import styled from "styled-components";

export const Title = styled.h1`
  margin: 0;
  line-height: 1.15;
  font-size: 2.5rem;
  text-align: center;
  text-decoration: none;

  a {
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: none;
    &:hover,
    :focus,
    :active {
      text-decoration: underline;
    }
  }
`;
