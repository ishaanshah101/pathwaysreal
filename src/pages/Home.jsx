import React from 'react';
import Seo from '@/components/Seo';
import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import MapIndex from '@/components/home/MapIndex';
import WhoIsBehind from '@/components/home/WhoIsBehind';
import FinalCta from '@/components/home/FinalCta';

export default function Home() {
  return (
    <>
      {/* Meta descriptions stay under 160 characters. Google truncates past
          roughly that. */}
      <Seo
        title="Pathways — Free College & Career Guidance for High School Students"
        description="Free college and career guidance for high school students, from real college students, professors, and admissions counselors who have been there."
        path="/"
      />
      <Hero />
      <Stats />
      <MapIndex />
      <WhoIsBehind />
      <FinalCta />
    </>
  );
}
