'use client';
import React, { useEffect, useRef } from 'react';
import { withBasePath } from '../utils/withBasePath';

interface HeroImageProps {
  title: string;
  tags: string[];
  collection: string;               // e.g. "short_form", "long_form", "muses"
  backgroundImage: string;
  mobileBackgroundImage: string;
  positionX?: string;
  positionY?: string;
  alt: string;
}

export default function HeroImage({
    title,
    tags,
    collection,
    backgroundImage,
    mobileBackgroundImage,
    positionX = '30%',
    positionY = '50%',
    alt,
  }: HeroImageProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  // derive slug and display form once
  const collSlug = collection.replace(/^\/+|\/+$/g, ''); // "long_form"
  const collName = collSlug.replace(/_/g, ' ');          // "long form"

  useEffect(() => {
    const heroEl = heroRef.current;
    const parallaxEl = parallaxRef.current;
    if (!heroEl || !parallaxEl) return;

    function updateParallax() {
      const scrollPosition = window.pageYOffset;
      const parallaxFactor = 0.3;
      parallaxEl.style.transform = `translate3d(0, ${scrollPosition * parallaxFactor}px, 0)`;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            parallaxEl.style.willChange = 'transform';
            window.addEventListener('scroll', updateParallax);
          } else {
            parallaxEl.style.willChange = 'auto';
            window.removeEventListener('scroll', updateParallax);
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(heroEl);
    return () => {
      window.removeEventListener('scroll', updateParallax);
      observer.disconnect();
    };
  }, []);

  // Build URLs with base prefix reliably
  const collectionHomeHref = withBasePath(`/${collSlug}/`);
  const tagHref = (t: string) => withBasePath(`/${collSlug}/tags/${encodeURIComponent(t)}/`);

  // Hide the collection name from the tag chips
  const visibleTags = (tags ?? []).filter(
    (t) => t.toLowerCase() !== collName.toLowerCase()
  );

  return (
    <div
      ref={heroRef}
      className="relative flex flex-col justify-center items-center text-center h-screen mb-8 md:-mx-16 -mx-8 overflow-hidden"
      data-pagefind-body
    >
      <div
        ref={parallaxRef}
        className="absolute inset-0"
        style={{ willChange: 'transform' }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-no-repeat md:hidden"
          style={{
            backgroundImage: `url(${mobileBackgroundImage})`,
            backgroundPosition: `${positionX} ${positionY}`,
            top: '-20%',
            height: '120%',
          }}
        />
        <div
          className="absolute inset-0 bg-cover bg-no-repeat hidden md:block"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: `${positionX} ${positionY}`,
            top: '-20%',
            height: '120%',
          }}
        />
      </div>

      <div className="relative">
        <h1 className="prose prose-slate uppercase font-overpass-mono text-[rgb(245,245,245)] text-4xl fade-in-up delay-150">
          {title}
        </h1>

        <div className="flex gap-2 mt-2 fade-in-up delay-300 justify-center">
          {/* Collection chip → collection home */}
          <p className="font-overpass-mono text-xl">
            <a
              className="bg-slate-600 text-[rgb(245,245,245)] bg-opacity-50 px-2 py-1 rounded-sm no-underline"
              href={collectionHomeHref}
            >
              {collName}
            </a>
          </p>

          {/* Real tag chips → /<collection>/tags/<tag>/ */}
          {visibleTags.map((tag) => (
            <p key={tag} className="font-overpass-mono text-xl">
              <a
                className="bg-slate-600 text-[rgb(245,245,245)] bg-opacity-50 px-2 py-1 rounded-sm no-underline"
                href={tagHref(tag)}
              >
                {tag}
              </a>
            </p>
          ))}
        </div>
      </div>

      {/* ensure image is discoverable for crawlers/accessibility */}
      <img src={backgroundImage} alt={alt} className="sr-only" />
    </div>
  );
}
