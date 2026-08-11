import React from 'react';
import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import Quotes from '@/components/home/Quotes';
import FinalCta from '@/components/home/FinalCta';

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Quotes />
      <FinalCta />
    </>
  );
}