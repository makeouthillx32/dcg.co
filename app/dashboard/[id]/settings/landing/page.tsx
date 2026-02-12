'use client';

import { useState } from 'react';
import { HeroCarouselManager } from './_components/HeroCarouselManager';
import { StaticPagesManager } from './_components/StaticPagesManager';
import './styles/landing.scss';

type TabView = 'hero' | 'pages';

export default function LandingPageCMS() {
  const [activeTab, setActiveTab] = useState<TabView>('hero');

  return (
    <div className="landing-cms">
      <div className="landing-cms__header">
        <h1>Landing Page Manager</h1>
        <p className="landing-cms__subtitle">
          Manage your homepage hero carousel and static content pages
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="landing-cms__tabs">
        <button
          className={`landing-cms__tab ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          Hero Carousel
          <span className="landing-cms__tab-badge">Slideshow</span>
        </button>

        <button
          className={`landing-cms__tab ${activeTab === 'pages' ? 'active' : ''}`}
          onClick={() => setActiveTab('pages')}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Static Pages
          <span className="landing-cms__tab-badge">Privacy, Terms, About</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="landing-cms__content">
        {activeTab === 'hero' && <HeroCarouselManager />}
        {activeTab === 'pages' && <StaticPagesManager />}
      </div>
    </div>
  );
}