import { useState, useEffect } from 'react';

interface DashboardStats {
  totalAudios: number;
  totalMinutes: number;
  lastUpload?: string;
  recentRecordings: Array<{
    id: string;
    originalName: string;
    transcriptionStatus: 'pending' | 'processing' | 'completed' | 'error';
    createdAt: string;
    duration?: number;
  }>;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}