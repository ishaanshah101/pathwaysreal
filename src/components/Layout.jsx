import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import DeletedNotice from '@/components/DeletedNotice';

// The frame for every public page. Pages lay themselves out in full-width
// bands and bring their own .wrap, so a section can run edge to edge when it
// wants to.
export default function Layout() {
  return (
    <div className="site">
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      <div className="road" aria-hidden="true" />
      <DeletedNotice />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
