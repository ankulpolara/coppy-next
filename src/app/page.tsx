"use client"
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR for components that use browser APIs
const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  ssr: false,
});

export default function Home() {
  return <Dashboard />;
}
