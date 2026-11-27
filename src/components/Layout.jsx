import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import DeletedNotice from '@/components/DeletedNotice';

// The frame for every public page: the desk, the page on it, and the inside
// back cover at the bottom. Pages lay themselves out in full-width bands and
// bring their own .wrap.
export default function Layout() {
  return (
    <div className="site">
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      <DeletedNotice />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
