import { ReactNode } from 'react';

interface HeaderNavAttr {
  children: ReactNode;
}

export const HeaderNav = ({ children }: HeaderNavAttr): JSX.Element => {
  return <ul>{children}</ul>;
};
