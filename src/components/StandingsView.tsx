
import { Player, Season } from "@/types/squash";
import { PlayerCard } from "./PlayerCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StandingsViewProps {
  players: Player[];
  currentSeason: Season | null;
  onPlayerClick: (player: Player) => void;
}

export const StandingsView = ({ players, currentSeason, onPlayerClick }: StandingsViewProps) => {
  const div1Players = players.filter(p => p.division === 1);
  const div2Players = players.filter(p => p.division === 2);

  const getStandings = (divisionPlayers: Player[], division: 1 | 2) => {
    return divisionPlayers.sort((a, b) => {
      if (!currentSeason) return 0;
      
      const aWins = currentSeason.matches.filter(m => 
        m.completed && m.winner?.id === a.id && m.division === division && m.matchType === 'league'
      ).length;
      const bWins = currentSeason.matches.filter(m => 
        m.completed && m.winner?.id === b.id && m.division === division && m.matchType === 'league'
      ).length;
      
      if (aWins !== bWins) return bWins - aWins;
      
      // Tiebreaker: head to head
      const headToHead = a.headToHead[b.id];
      if (headToHead) {
        return headToHead.wins - headToHead.losses;
      }
      
      return b.rating - a.rating;
    });
  };

  const div1Standings = getStandings(div1Players, 1);
  const div2Standings = getStandings(div2Players, 2);

  return (
    <div className="p-4">
      <Tabs defaultValue="division1" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="division1">Division 1</TabsTrigger>
          <TabsTrigger value="division2">Division 2</TabsTrigger>
        </TabsList>
        
        <TabsContent value="division1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Division 1 Standings</span>
                <span className="text-sm text-muted-foreground">Season {currentSeason?.number}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {div1Standings.map((player, index) => (
                  <div key={player.id} className="relative">
                    <PlayerCard 
                      player={player} 
                      position={index + 1}
                      onClick={() => onPlayerClick(player)}
                    />
                    {index < 4 && (
                      <div className="absolute -right-2 top-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        🏆 Cup
                      </div>
                    )}
                    {index === 4 && (
                      <div className="absolute -right-2 top-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        🔻 Rel
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="division2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Division 2 Standings</span>
                <span className="text-sm text-muted-foreground">Season {currentSeason?.number}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {div2Standings.map((player, index) => (
                  <div key={player.id} className="relative">
                    <PlayerCard 
                      player={player} 
                      position={index + 6}
                      onClick={() => onPlayerClick(player)}
                    />
                    {index === 0 && (
                      <div className="absolute -right-2 top-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        🔼 Pro
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
