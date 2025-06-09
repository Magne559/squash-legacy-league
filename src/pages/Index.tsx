
import { useState, useEffect } from "react";
import { Player } from "@/types/squash";
import { useSquashLeague } from "@/hooks/useSquashLeague";
import { StandingsView } from "@/components/StandingsView";
import { MatchCenter } from "@/components/MatchCenter";
import { PlayerProfile } from "@/components/PlayerProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface NavigationState {
  activeTab: string;
  standingsTab: string;
  scrollPosition: number;
}

const Index = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    activeTab: 'standings',
    standingsTab: 'division1',
    scrollPosition: 0
  });

  const {
    players,
    currentSeason,
    seasons,
    retiredPlayers,
    simulateNextMatch,
    simulateCupMatch,
    endSeason,
    resetLeague
  } = useSquashLeague();

  // Load navigation state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('navigationState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setNavigationState(parsed);
      } catch (error) {
        console.error('Failed to parse navigation state:', error);
      }
    }
  }, []);

  // Save navigation state to localStorage
  const saveNavigationState = (newState: Partial<NavigationState>) => {
    const updatedState = { ...navigationState, ...newState };
    setNavigationState(updatedState);
    localStorage.setItem('navigationState', JSON.stringify(updatedState));
  };

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    // Save current scroll position before changing tabs
    const currentScrollPosition = window.scrollY;
    saveNavigationState({ 
      activeTab: tab,
      scrollPosition: currentScrollPosition
    });
  };

  // Handle player selection with state preservation
  const handlePlayerClick = (player: Player) => {
    // Save current state before navigating to player profile
    const currentScrollPosition = window.scrollY;
    saveNavigationState({ scrollPosition: currentScrollPosition });
    setSelectedPlayer(player);
  };

  // Handle back navigation with state restoration
  const handleBackFromPlayer = () => {
    setSelectedPlayer(null);
    // Restore scroll position after a brief delay to allow DOM to update
    setTimeout(() => {
      window.scrollTo(0, navigationState.scrollPosition);
    }, 100);
  };

  const handleResetLeague = () => {
    if (confirm('Are you sure you want to reset the entire league? This will delete all progress and cannot be undone.')) {
      resetLeague();
      // Clear navigation state on reset
      localStorage.removeItem('navigationState');
      setNavigationState({
        activeTab: 'standings',
        standingsTab: 'division1',
        scrollPosition: 0
      });
    }
  };

  if (selectedPlayer) {
    return (
      <PlayerProfile 
        player={selectedPlayer} 
        onBack={handleBackFromPlayer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="tech-header p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Artificial Squash League
          </h1>
          <Button
            onClick={handleResetLeague}
            variant="destructive"
            size="sm"
            className="text-xs"
          >
            Reset League
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Season {currentSeason?.number || 1} • {players.length} Active Players
        </p>
        <div className="mt-3 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30"></div>
      </div>

      <Tabs value={navigationState.activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border-cyan-400/20">
          <TabsTrigger value="standings" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Standings
          </TabsTrigger>
          <TabsTrigger value="matches" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Matches
          </TabsTrigger>
          <TabsTrigger value="hall-of-fame" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Hall of Fame
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="standings" className="mt-0">
          <StandingsView 
            players={players}
            currentSeason={currentSeason}
            onPlayerClick={handlePlayerClick}
            activeTab={navigationState.standingsTab}
            onTabChange={(tab) => saveNavigationState({ standingsTab: tab })}
          />
        </TabsContent>
        
        <TabsContent value="matches" className="mt-0">
          <MatchCenter
            currentSeason={currentSeason}
            onSimulateMatch={simulateNextMatch}
            onSimulateCup={simulateCupMatch}
            onEndSeason={endSeason}
          />
        </TabsContent>
        
        <TabsContent value="hall-of-fame" className="mt-0">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">Hall of Fame</h2>
            {retiredPlayers.length === 0 ? (
              <div className="tech-card p-8 text-center">
                <p className="text-muted-foreground">
                  No retired players yet. Keep playing to see legends emerge!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {retiredPlayers
                  .sort((a, b) => b.championshipsWon - a.championshipsWon || b.careerHighRating - a.careerHighRating)
                  .map((player) => (
                    <div
                      key={player.id}
                      className="tech-card p-4 cursor-pointer"
                      onClick={() => handlePlayerClick(player)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{player.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {player.nationality} • {player.seasonsPlayed} seasons
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-cyan-400">
                            🏆 {player.championshipsWon} • 🏅 {player.cupsWon}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {player.gamesWon}W-{player.gamesLost}L
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
