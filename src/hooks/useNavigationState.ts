
import { useState, useCallback } from 'react';

interface NavigationState {
  selectedTab: string;
  selectedDivision: string;
  scrollPosition: number;
}

const defaultState: NavigationState = {
  selectedTab: 'standings',
  selectedDivision: 'division1',
  scrollPosition: 0
};

export const useNavigationState = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>(defaultState);

  const updateState = useCallback((updates: Partial<NavigationState>) => {
    setNavigationState(prev => ({ ...prev, ...updates }));
  }, []);

  const saveScrollPosition = useCallback(() => {
    const scrollPosition = window.scrollY;
    updateState({ scrollPosition });
  }, [updateState]);

  const restoreScrollPosition = useCallback(() => {
    setTimeout(() => {
      window.scrollTo(0, navigationState.scrollPosition);
    }, 50);
  }, [navigationState.scrollPosition]);

  return {
    navigationState,
    updateState,
    saveScrollPosition,
    restoreScrollPosition
  };
};
