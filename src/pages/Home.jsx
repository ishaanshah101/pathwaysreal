import React from 'react';
import Seo from '@/components/Seo';
import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import Quotes from '@/components/home/Quotes';
import Testimonials from '@/components/home/Testimonials';
import FinalCta from '@/components/home/FinalCta';

export default function Home() {
  return (
    <>
      <Seo
        title="Pathways — Free College & Career Guidance for High School Students"
        /* Keep under 160 characters; the previous 186-character version was
           truncated mid-sentence in search results. */
        description="Free college and career guidance for high school students, from real college students, professors, and admissions counselors who have been there."
        path="/"
      />
      <Hero />
      <Stats />
      <Quotes />
      <Testimonials />
      <FinalCta />
    </>
  );
}