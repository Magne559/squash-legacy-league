
import { useState } from "react";
import { Player } from "@/types/squash";
import { useSquashLeague } from "@/hooks/useSquashLeague";
import { useNavigationState } from "@/hooks/useNavigationState";
import { StandingsView } from "@/components/StandingsView";
import { MatchCenter } from "@/components/MatchCenter";
import { PlayerProfile } from "@/components/PlayerProfile";
import { RetirementPopup } from "@/components/RetirementPopup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const { navigationState, updateState, saveScrollPosition, restoreScrollPosition } = useNavigationState();
  const {
    players,
    currentSeason,
    seasons,
    retiredPlayers,
    simulateNextMatch,
    simulateCupMatch,
    endSeason,
    resetLeague,
    showRetirementPopup,
    pendingRetirements,
    pendingNewPlayers,
    onStartNextSeason
  } = useSquashLeague();

  const handleResetLeague = () => {
    if (confirm('Are you sure you want to reset the entire league? This will delete all progress and cannot be undone.')) {
      resetLeague();
    }
  };

  const handlePlayerClick = (player: Player) => {
    saveScrollPosition();
    setSelectedPlayer(player);
  };

  const handleBackFromPlayer = () => {
    setSelectedPlayer(null);
    restoreScrollPosition();
  };

  const handleTabChange = (tab: string) => {
    updateState({ selectedTab: tab });
  };

  const handleDivisionChange = (division: string) => {
    updateState({ selectedDivision: division });
  };

  if (selectedPlayer) {
    return (
      <PlayerProfile 
        player={selectedPlayer} 
        onBack={handleBackFromPlayer}
        recentMatches={currentSeason?.matches.filter(m => 
          m.completed && (m.player1.id === selectedPlayer.id || m.player2.id === selectedPlayer.id)
        ).slice(-10) || []}
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

      <Tabs value={navigationState.selectedTab} onValueChange={handleTabChange} className="w-full">
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
            selectedDivision={navigationState.selectedDivision}
            onDivisionChange={handleDivisionChange}
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

      <RetirementPopup
        isOpen={showRetirementPopup}
        retiringPlayers={pendingRetirements}
        newPlayers={pendingNewPlayers}
        onStartNextSeason={onStartNextSeason}
      />
    </div>
  );
};

export default Index;
