
import { useState } from "react";
import { Player } from "@/types/squash";
import { useSquashLeague } from "@/hooks/useSquashLeague";
import { StandingsView } from "@/components/StandingsView";
import { MatchCenter } from "@/components/MatchCenter";
import { PlayerProfile } from "@/components/PlayerProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const {
    players,
    currentSeason,
    seasons,
    retiredPlayers,
    simulateNextMatch,
    simulateCupMatch,
    endSeason
  } = useSquashLeague();

  if (selectedPlayer) {
    return (
      <PlayerProfile 
        player={selectedPlayer} 
        onBack={() => setSelectedPlayer(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground p-4">
        <h1 className="text-2xl font-bold text-center">Artificial Squash League</h1>
        <p className="text-center text-sm opacity-90">
          Season {currentSeason?.number || 1} • {players.length} Active Players
        </p>
      </div>

      <Tabs defaultValue="standings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="hall-of-fame">Hall of Fame</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standings" className="mt-0">
          <StandingsView 
            players={players}
            currentSeason={currentSeason}
            onPlayerClick={setSelectedPlayer}
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
            <h2 className="text-xl font-bold mb-4">Hall of Fame</h2>
            {retiredPlayers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No retired players yet. Keep playing to see legends emerge!
              </p>
            ) : (
              <div className="space-y-2">
                {retiredPlayers
                  .sort((a, b) => b.championshipsWon - a.championshipsWon || b.careerHighRating - a.careerHighRating)
                  .map((player) => (
                    <div
                      key={player.id}
                      className="p-4 bg-card border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{player.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {player.nationality} • {player.seasonsPlayed} seasons
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">
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
