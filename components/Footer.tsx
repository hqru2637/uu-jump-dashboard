'use client';

import { Github } from 'lucide-react';
import { useLastUpdated } from '@/components/providers/LastUpdatedProvider';
import { useEffect, useState } from 'react';

export function Footer() {
  const { lastUpdated } = useLastUpdated();
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastUpdated) {
      setTimeAgo('');
      return;
    }

    const updateTimeAgo = () => {
      const now = new Date();
      const diffInSeconds = Math.max(0, Math.floor((now.getTime() - lastUpdated.getTime()) / 1000));

      if (diffInSeconds < 60) {
        setTimeAgo(`${diffInSeconds}秒前`);
      } else {
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        setTimeAgo(`${diffInMinutes}分前`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <footer className="border-t py-6 mt-auto bg-gray-50">
      <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <a
            href="https://github.com/hqru2637/uu-jump-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-gray-900 transition-colors"
          >
            <Github className="w-5 h-5 mr-2" />
            <span>View on GitHub</span>
          </a>
        </div>
        <div>
          {lastUpdated && <span>最終更新: {timeAgo}</span>}
        </div>
      </div>
    </footer>
  );
}
