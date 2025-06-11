
import { Player, Season } from "@/types/squash";
import { PlayerCard } from "./PlayerCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StandingsViewProps {
  players: Player[];
  currentSeason: Season | null;
  onPlayerClick: (player: Player) => void;
  selectedDivision: string;
  onDivisionChange: (division: string) => void;
}

export const StandingsView = ({ 
  players, 
  currentSeason, 
  onPlayerClick,
  selectedDivision,
  onDivisionChange
}: StandingsViewProps) => {
  const div1Players = players.filter(p => p.division === 1);
  const div2Players = players.filter(p => p.division === 2);

  const getStandings = (divisionPlayers: Player[], division: 1 | 2) => {
    return divisionPlayers.sort((a, b) => {
      if (!currentSeason) return 0;
      
      // Primary: Games won (not league points)
      const aWins = a.gamesWon;
      const bWins = b.gamesWon;
      if (aWins !== bWins) return bWins - aWins;
      
      // Tie-breaker 1: Games played (fewer is better if same wins)
      if (a.gamesPlayed !== b.gamesPlayed) return a.gamesPlayed - b.gamesPlayed;
      
      // Tie-breaker 2: Set difference
      const aSetDiff = a.setsWon - a.setsLost;
      const bSetDiff = b.setsWon - b.setsLost;
      if (aSetDiff !== bSetDiff) return bSetDiff - aSetDiff;
      
      // Tie-breaker 3: Total points scored
      if (a.pointsScored !== b.pointsScored) return b.pointsScored - a.pointsScored;
      
      // Tie-breaker 4: Head to head
      const headToHead = a.headToHead[b.id];
      if (headToHead) {
        return headToHead.wins - headToHead.losses;
      }
      
      // Final: Rating
      return b.rating - a.rating;
    });
  };

  const div1Standings = getStandings(div1Players, 1);
  const div2Standings = getStandings(div2Players, 2);

  return (
    <div className="p-4">
      <Tabs value={selectedDivision} onValueChange={onDivisionChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm border-cyan-400/20">
          <TabsTrigger 
            value="division1" 
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Division 1
          </TabsTrigger>
          <TabsTrigger 
            value="division2"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Division 2
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="division1">
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-cyan-400">
                <span>Division 1 Standings</span>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ranked by: 1) Games won 2) Games played 3) Set difference 4) Points scored 5) Head-to-head</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-sm text-muted-foreground">Season {currentSeason?.number}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {div1Standings.map((player, index) => (
                  <div key={player.id} className="relative pr-20">
                    <PlayerCard 
                      player={player} 
                      position={index + 1}
                      onClick={() => onPlayerClick(player)}
                      showCareerStats={false}
                      currentSeason={currentSeason}
                    />
                    {index < 4 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs px-2 py-1 rounded border border-yellow-400 shadow-lg whitespace-nowrap">
                        🏆 Cup
                      </div>
                    )}
                    {index === 4 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded border border-red-400 shadow-lg whitespace-nowrap">
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
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-cyan-400">
                <span>Division 2 Standings</span>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ranked by: 1) Games won 2) Games played 3) Set difference 4) Points scored 5) Head-to-head</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-sm text-muted-foreground">Season {currentSeason?.number}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {div2Standings.map((player, index) => (
                  <div key={player.id} className="relative pr-20">
                    <PlayerCard 
                      player={player} 
                      position={index + 6}
                      onClick={() => onPlayerClick(player)}
                      showCareerStats={false}
                      currentSeason={currentSeason}
                    />
                    {index === 0 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-2 py-1 rounded border border-blue-400 shadow-lg whitespace-nowrap">
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
