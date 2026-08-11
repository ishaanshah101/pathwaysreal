import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function Layout() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }}>
      <Nav />
      <Outlet />
      <Footer />
    </div>
  );
}