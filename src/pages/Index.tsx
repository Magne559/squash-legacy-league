import { useState, useEffect } from 'react';
import { Player } from '@/types/squash';
import { StandingsView } from '@/components/StandingsView';
import { PlayerProfile } from '@/components/PlayerProfile';
import { useSquashLeague } from '@/hooks/useSquashLeague';
import { Button } from '@/components/ui/button';
import { SeasonView } from '@/components/SeasonView';
import { ArchiveView } from '@/components/ArchiveView';
import { ResetDialog } from '@/components/ResetDialog';

type MainView = 'standings' | 'player-profile' | 'season' | 'archive';

interface NavigationState {
  mainView: MainView;
  standingsTab: string;
  scrollPosition: number;
}

const IndexPage = () => {
  const { 
    players, 
    currentSeason, 
    seasons, 
    seasonArchive, 
    retiredPlayers,
    simulateNextMatch, 
    simulateCupMatch,
    endSeason,
    resetLeague
  } = useSquashLeague();
  
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [mainView, setMainView] = useState<MainView>('standings');
  const [activeStandingsTab, setActiveStandingsTab] = useState<string>("division1");
  const [navigationState, setNavigationState] = useState<NavigationState | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handlePlayerClick = (player: Player) => {
    // Save current navigation state
    const currentState = {
      mainView,
      standingsTab: activeStandingsTab,
      scrollPosition: window.scrollY
    };
    setNavigationState(currentState);
    
    setSelectedPlayer(player);
    setMainView('player-profile');
  };

  const handleBackFromPlayer = () => {
    setSelectedPlayer(null);
    
    // Restore previous navigation state
    if (navigationState) {
      setMainView(navigationState.mainView);
      setActiveStandingsTab(navigationState.standingsTab);
      
      // Restore scroll position after a brief delay to ensure DOM is updated
      setTimeout(() => {
        window.scrollTo(0, navigationState.scrollPosition);
      }, 100);
    } else {
      setMainView('standings');
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveStandingsTab(tab);
  };

  const handleSeasonClick = () => {
    setMainView('season');
  };

  const handleArchiveClick = () => {
    setMainView('archive');
  };

  const handleBackFromSeason = () => {
    setMainView('standings');
  };

  const handleBackFromArchive = () => {
    setMainView('standings');
  };

  const getRecentMatches = () => {
    if (!currentSeason) return [];
    return currentSeason.matches.filter(match => match.completed);
  };

  return (
    <div className="min-h-screen tech-background">
      <div className="tech-header p-4">
        <h1 className="text-3xl font-bold text-white mb-4">
          Squash League Simulator
        </h1>
        <div className="flex space-x-4">
          {mainView === 'standings' && (
            <>
              <Button onClick={simulateNextMatch} variant="outline" className="text-cyan-400 hover:text-cyan-300">
                Simulate Next Match
              </Button>
              {currentSeason?.cupParticipants.length > 0 && (
                <Button onClick={simulateCupMatch} variant="outline" className="text-yellow-400 hover:text-yellow-300">
                  Simulate Cup Match
                </Button>
              )}
              {currentSeason?.leaguePhaseComplete && (
                <Button onClick={endSeason} variant="destructive" className="text-red-400 hover:text-red-300">
                  End Season
                </Button>
              )}
              <Button onClick={handleSeasonClick} variant="secondary" className="text-white hover:text-gray-100">
                View Season
              </Button>
              <Button onClick={handleArchiveClick} variant="secondary" className="text-white hover:text-gray-100">
                View Archive
              </Button>
              <Button onClick={() => setIsResetOpen(true)} variant="destructive" className="text-red-400 hover:text-red-300">
                Reset League
              </Button>
            </>
          )}
        </div>
      </div>

      <ResetDialog 
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={resetLeague}
      />
      
      {mainView === 'player-profile' && selectedPlayer && (
        <PlayerProfile 
          player={selectedPlayer} 
          onBack={handleBackFromPlayer}
          recentMatches={getRecentMatches()}
        />
      )}
      
      {mainView === 'standings' && currentSeason && (
        <StandingsView
          players={players}
          currentSeason={currentSeason}
          onPlayerClick={handlePlayerClick}
          activeTab={activeStandingsTab}
          onTabChange={handleTabChange}
        />
      )}
      
      {mainView === 'season' && currentSeason && (
        <SeasonView
          currentSeason={currentSeason}
          players={players}
          onBack={handleBackFromSeason}
        />
      )}

      {mainView === 'archive' && (
        <ArchiveView
          seasonArchive={seasonArchive}
          players={players}
          onBack={handleBackFromArchive}
        />
      )}
    </div>
  );
};

export default IndexPage;
