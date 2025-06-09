
import { Player } from "@/types/squash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { COUNTRIES } from "@/utils/countries";

interface PlayerProfileProps {
  player: Player;
  onBack: () => void;
}

export const PlayerProfile = ({ player, onBack }: PlayerProfileProps) => {
  const country = COUNTRIES.find(c => c.name === player.nationality);
  const winPercentage = player.gamesPlayed > 0 ? (player.gamesWon / player.gamesPlayed * 100).toFixed(1) : '0.0';

  return (
    <div className="p-4">
      <Button onClick={onBack} variant="ghost" className="mb-4 text-cyan-400 hover:text-cyan-300">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Player Header */}
      <Card className="tech-card mb-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            {country?.flag && (
              <img 
                src={country.flag} 
                alt={`${player.nationality} flag`}
                className="tech-flag w-8 h-5"
              />
            )}
            <div>
              <div className="text-2xl text-white">{player.name}</div>
              <div className="text-lg text-muted-foreground">{player.nationality}</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xl font-bold text-cyan-400">{player.rating.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Current Rating</div>
            </div>
            <div>
              <div className="text-xl font-bold text-cyan-400">{player.careerHighRating.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Career High</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{player.age}</div>
              <div className="text-sm text-muted-foreground">Age</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{player.seasonsPlayed}</div>
              <div className="text-sm text-muted-foreground">Seasons</div>
            </div>
          </div>
          
          {player.isDeclined && (
            <div className="mt-4 p-3 bg-orange-500/10 rounded border border-orange-400/30">
              <div className="text-sm text-orange-400">🔻 This player is in career decline</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="career" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border-cyan-400/20">
          <TabsTrigger value="career" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Career
          </TabsTrigger>
          <TabsTrigger value="head-to-head" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Head-to-Head
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="career">
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">🎯 Career Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">{player.gamesWon}-{player.gamesLost}</div>
                  <div className="text-sm text-muted-foreground">Matches ({winPercentage}%)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{player.setsWon}-{player.setsLost}</div>
                  <div className="text-sm text-muted-foreground">Sets W-L</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{player.championshipsWon}</div>
                  <div className="text-sm text-muted-foreground">Championships</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{player.cupsWon}</div>
                  <div className="text-sm text-muted-foreground">Cups Won</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">{player.podiums}</div>
                  <div className="text-sm text-muted-foreground">Podium Finishes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{player.cupsPlayed}</div>
                  <div className="text-sm text-muted-foreground">Cups Played</div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-cyan-400/20">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Points Scored:</span>
                    <span className="ml-2 text-white font-mono">{player.pointsScored}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Points Conceded:</span>
                    <span className="ml-2 text-white font-mono">{player.pointsConceded}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="head-to-head">
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">🤝 Head-to-Head Records</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(player.headToHead).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No head-to-head records yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(player.headToHead)
                    .sort(([,a], [,b]) => (b.wins + b.losses) - (a.wins + a.losses))
                    .map(([opponentId, record]) => {
                      const opponentCountry = COUNTRIES.find(c => c.name === record.opponentNationality);
                      return (
                        <div key={opponentId} className="flex items-center justify-between p-3 bg-card/50 rounded border border-cyan-400/20">
                          <div className="flex items-center space-x-3 flex-1">
                            {opponentCountry?.flag && (
                              <img 
                                src={opponentCountry.flag} 
                                alt={`${record.opponentNationality} flag`}
                                className="tech-flag w-5 h-3"
                              />
                            )}
                            <div>
                              <div className="font-medium text-white">{record.opponentName}</div>
                              <div className="text-xs text-muted-foreground">{record.opponentNationality}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm text-cyan-400">{record.wins}W-{record.losses}L</div>
                            <div className="font-mono text-xs text-muted-foreground">
                              Sets: {record.setsWon}-{record.setsLost}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">📜 Season History</CardTitle>
            </CardHeader>
            <CardContent>
              {player.seasonHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No season history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {player.seasonHistory.slice().reverse().map((record) => (
                    <div key={record.season} className="flex items-center justify-between p-3 bg-card/50 rounded border border-cyan-400/20">
                      <div className="flex-1">
                        <span className="font-semibold text-white">Season {record.season}</span>
                        <div className="text-sm text-muted-foreground">
                          {record.position <= 5 ? `Division 1, ${getOrdinal(record.position)}` : `Division 2, ${getOrdinal(record.position - 5)}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Rating: {record.endRating.toFixed(0)} • Points: {record.leaguePoints}
                        </div>
                      </div>
                      {record.cupResult && record.cupResult !== 'Did Not Qualify' && (
                        <div className="text-sm bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded border border-yellow-400/30">
                          🏆 {record.cupResult}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const getOrdinal = (n: number): string => {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
};
