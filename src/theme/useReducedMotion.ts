import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return undefined;
    let mounted = true;
    const apply = (value: boolean) => {
      if (mounted) setReduced(value);
    };

    AccessibilityInfo.isReduceMotionEnabled().then(apply).catch(() => apply(false));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', apply);

    let media: MediaQueryList | null = null;
    const onMedia = (event: MediaQueryListEvent) => apply(event.matches);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia) {
      media = window.matchMedia('(prefers-reduced-motion: reduce)');
      apply(media.matches);
      media.addEventListener('change', onMedia);
    }

    return () => {
      mounted = false;
      subscription.remove();
      media?.removeEventListener('change', onMedia);
    };
  }, []);

  return reduced;
}
