import { useState, useMemo, useEffect } from 'react';
import { RankingItem } from '@/types/dashboard';
import { client } from '@/lib/hono';

const INITIAL_DISPLAY_COUNT = 8;
const SECOND_STEP_COUNT = 20;
const INCREMENT_STEP = 10;

export function useRankingPagination(initialItems: RankingItem[], mapName: string) {
  const [rankingItems, setRankingItems] = useState<RankingItem[]>(initialItems);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [isLoading, setIsLoading] = useState(false);
  const [serverHasMore, setServerHasMore] = useState(initialItems.length >= SECOND_STEP_COUNT);

  useEffect(() => {
    setRankingItems((prev) => {
      // If we have loaded more items than the initial batch,
      // update the top portion while preserving the extra items.
      if (prev.length > initialItems.length) {
        return [...initialItems, ...prev.slice(initialItems.length)];
      }
      return initialItems;
    });
  }, [initialItems]);

  const displayedItems = useMemo(() => {
    return rankingItems.slice(0, displayCount);
  }, [displayCount, rankingItems]);

  const canShowMore = displayCount < rankingItems.length || serverHasMore;
  const isExpanded = displayCount > INITIAL_DISPLAY_COUNT;

  const showMore = async () => {
    // Calculate next target count
    let nextCount;
    if (displayCount === INITIAL_DISPLAY_COUNT) {
      nextCount = SECOND_STEP_COUNT;
    } else {
      nextCount = displayCount + INCREMENT_STEP;
    }

    // If we have enough data locally, just expand
    if (rankingItems.length >= nextCount) {
      setDisplayCount(nextCount);
      return;
    }

    // Otherwise fetch from server
    setIsLoading(true);
    try {
      // Use displayCount as offset to ensure we fetch the next block correctly
      const offset = displayCount;
      
      const res = await client.api.stats.ranking.more.$get({
        query: {
          mapName,
          offset: offset.toString(),
          limit: INCREMENT_STEP.toString(),
        },
      });

      if (res.ok) {
        const newItems = await res.json();
        
        if (newItems.length < INCREMENT_STEP) {
          setServerHasMore(false);
        }

        if (newItems.length > 0) {
          setRankingItems((prev) => {
            const keptItems = prev.slice(0, offset);
            return [...keptItems, ...newItems];
          });
          
          setDisplayCount(offset + newItems.length);
        }
      }
    } catch (error) {
      console.error('Failed to fetch more rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const collapse = () => {
    setDisplayCount(INITIAL_DISPLAY_COUNT);
  };

  return {
    displayedItems,
    canShowMore,
    isExpanded,
    isLoading,
    showMore,
    collapse,
  };
}
