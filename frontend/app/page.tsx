'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '../components/landing/LandingPage';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage (e.g. user logged in)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('smartfin_token') : null;
    if (token) {
      setIsAuthenticated(true);
      router.push('/dashboard');
    } else {
      setIsAuthenticated(false);
    }
  }, [router]);

  if (isAuthenticated === true) {
    return null; // Will redirect to /dashboard
  }

  return <LandingPage />;
}
