import React from 'react';
import Seo from '@/components/Seo';
import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import Quotes from '@/components/home/Quotes';
import FinalCta from '@/components/home/FinalCta';

export default function Home() {
  return (
    <>
      <Seo
        title="Pathways — Free College & Career Guidance for High School Students"
        description="Pathways is a free platform where high school students get firsthand college and career guidance from real students, professors, and admissions counselors. No private counselor required."
        path="/"
      />
      <Hero />
      <Stats />
      <Quotes />
      <FinalCta />
    </>
  );
}
