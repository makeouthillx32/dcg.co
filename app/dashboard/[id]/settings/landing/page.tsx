'use client';

import { useState } from 'react';
import { HeroCarouselManager } from './_components/HeroCarouselManager';
import { StaticPagesManager } from './_components/StaticPagesManager';

type TabView = 'hero' | 'pages';

export default function LandingPageCMS() {
  const [activeTab, setActiveTab] = useState<TabView>('hero');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Landing Page Manager</h1>
        <p className="text-gray-600">
          Manage your homepage hero carousel and static content pages
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'hero'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('hero')}
          >
            Hero Carousel
          </button>

          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'pages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('pages')}
          >
            Static Pages
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'hero' && <HeroCarouselManager />}
        {activeTab === 'pages' && <StaticPagesManager />}
      </div>
    </div>
  );
}