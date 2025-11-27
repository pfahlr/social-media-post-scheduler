import React from 'react';
import { NavBar } from './NavBar';

interface Props {
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div>
      <NavBar />
      <main style={{ padding: '1rem' }}>{children}</main>
    </div>
  );
};
