// app/punchcards/page.tsx
import { Metadata } from 'next';
import PunchCardClient from './PunchCardClient';

export const metadata: Metadata = {
  title: 'DARTS Punch Card Maker',
  description: 'DARTS punchcard maker! Use one of our templates or upload your own!',
};

export default function PunchCardsPage() {
  return <PunchCardClient />;
}