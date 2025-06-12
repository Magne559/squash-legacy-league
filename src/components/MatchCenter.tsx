
import { useState } from "react";
import { Season, Match } from "@/types/squash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Calendar, BarChart3 } from "lucide-react";
import { RecentResults } from "./RecentResults";
import { COUNTRIES } from "@/utils/countries";
import { FlagImage } from "./FlagImage";

interface MatchCenterProps {
  currentSeason: Season | null;
  onSimulateMatch: () => void;
  onSimulateCup: () => void;
  onEndSeason: () => void;
}

export const MatchCenter = ({ 
  currentSeason, 
  onSimulateMatch, 
  onSimulateCup,
  onEndSeason 
}: MatchCenterProps) => {
  const [selectedTab, setSelectedTab] = useState("simulate");

  if (!currentSeason) {
    return (
      <div className="p-4">
        <Card className="tech-card">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No active season</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatMatchResult = (match: Match) => {
    if (!match.winner) return null;
    
    const winnerSets = match.sets.filter(s => 
      (s === 1 && match.winner?.id === match.player1.id) || 
      (s === 2 && match.winner?.id === match.player2.id)
    ).length;
    
    const loserSets = match.sets.length - winnerSets;
    
    const winner = match.winner;
    const loser = match.winner.id === match.player1.id ? match.player2 : match.player1;
    
    return {
      winner,
      loser,
      score: `${winnerSets}–${loserSets}`
    };
  };

  const leagueMatches = currentSeason.matches.filter(m => m.matchType === 'league');
  const cupMatches = currentSeason.matches.filter(m => m.matchType.includes('cup'));
  
  const completedLeague = leagueMatches.filter(m => m.completed).length;
  const totalLeague = leagueMatches.length;
  const completedCup = cupMatches.filter(m => m.completed).length;
  const totalCup = cupMatches.length;

  const leaguePhaseComplete = completedLeague === totalLeague;
  const nextMatch = currentSeason.matches.find(m => !m.completed);
  const recentMatches = currentSeason.matches.filter(m => m.completed).slice(-5).reverse();

  const allMatchesComplete = currentSeason.matches.every(m => m.completed);

  const getUpcomingMatches = () => {
    const upcoming = currentSeason.matches
      .filter(m => !m.completed)
      .slice(0, 10);
    return upcoming;
  };

  const upcomingMatches = getUpcomingMatches();
  const completedMatches = currentSeason.matches.filter(m => m.completed);

  return (
    <div className="p-4 space-y-4">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border-cyan-400/20">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="simulate" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Play className="w-4 h-4 mr-2" />
            Simulate
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <BarChart3 className="w-4 h-4 mr-2" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">📅 Upcoming Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingMatches.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  All matches completed! Ready to end season.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingMatches.map((match, index) => {
                    const player1Country = COUNTRIES.find(c => c.name === match.player1.nationality);
                    const player2Country = COUNTRIES.find(c => c.name === match.player2.nationality);
                    
                    return (
                      <div key={match.id} className={`p-4 rounded border transition-all ${
                        index === 0 ? 'bg-cyan-500/10 border-cyan-400/40' : 'bg-card/50 border-cyan-400/20'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="text-sm text-muted-foreground min-w-0">
                              Round {match.round}
                            </div>
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="flex items-center space-x-2 min-w-0">
                                <FlagImage 
                                  src={player1Country?.flag || ''}
                                  alt={`${match.player1.nationality} flag`}
                                  className="w-5 h-3 flex-shrink-0"
                                  nationality={match.player1.nationality}
                                />
                                <span className="font-medium text-white truncate">{match.player1.name}</span>
                              </div>
                              <span className="text-muted-foreground flex-shrink-0">vs</span>
                              <div className="flex items-center space-x-2 min-w-0">
                                <FlagImage 
                                  src={player2Country?.flag || ''}
                                  alt={`${match.player2.nationality} flag`}
                                  className="w-5 h-3 flex-shrink-0"
                                  nationality={match.player2.nationality}
                                />
                                <span className="font-medium text-white truncate">{match.player2.name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className="text-sm text-cyan-400 font-medium">
                              {match.matchType === 'league' ? `Div ${match.division}` : 
                               match.matchType === 'cup-final' ? 'Cup Final' :
                               match.matchType === 'cup-semi' ? 'Cup Semi' :
                               match.matchType === 'cup-3rd' ? '3rd Place' : 'Cup'}
                            </div>
                            {index === 0 && (
                              <div className="text-xs text-yellow-400 mt-1">Next Up</div>
                            )}
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

        <TabsContent value="simulate" className="mt-4">
          <Card className="tech-card border-cyan-400/30">
            <CardHeader>
              <CardTitle className="text-cyan-400">
                Season {currentSeason.number} - {leaguePhaseComplete ? 'Cup Phase' : 'League Phase'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{completedLeague}/{totalLeague}</div>
                  <div className="text-sm text-muted-foreground">League Matches</div>
                  {leaguePhaseComplete && (
                    <div className="text-xs text-green-400 mt-1">✓ Complete</div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{completedCup}/{totalCup || 0}</div>
                  <div className="text-sm text-muted-foreground">Cup Matches</div>
                  {!leaguePhaseComplete && (
                    <div className="text-xs text-muted-foreground mt-1">Awaiting league</div>
                  )}
                </div>
              </div>

              {nextMatch && (
                <Card className="bg-card/70 border-cyan-400/40">
                  <CardContent className="p-4">
                    <div className="text-center space-y-4">
                      <div className="text-sm text-muted-foreground">
                        {nextMatch.matchType === 'league' ? (
                          `Division ${nextMatch.division} League - Round ${nextMatch.round}`
                        ) : nextMatch.matchType === 'cup-semi' ? (
                          'Cup Semifinal'
                        ) : nextMatch.matchType === 'cup-3rd' ? (
                          'Cup 3rd Place Final'
                        ) : nextMatch.matchType === 'cup-final' ? (
                          'Cup Final'
                        ) : 'Cup Tournament'}
                      </div>
                      <div className="flex items-center justify-center space-x-6">
                        <div className="text-center flex-1">
                          <div className="mb-2 flex justify-center">
                            <FlagImage 
                              src={COUNTRIES.find(c => c.name === nextMatch.player1.nationality)?.flag || ''}
                              alt={`${nextMatch.player1.nationality} flag`}
                              className="w-8 h-5"
                              nationality={nextMatch.player1.nationality}
                            />
                          </div>
                          <div className="font-semibold text-white text-base">{nextMatch.player1.name}</div>
                          <div className="text-sm text-cyan-400">Rating: {nextMatch.player1.rating.toFixed(0)}</div>
                        </div>
                        <div className="text-2xl font-bold text-cyan-400 px-4">VS</div>
                        <div className="text-center flex-1">
                          <div className="mb-2 flex justify-center">
                            <FlagImage 
                              src={COUNTRIES.find(c => c.name === nextMatch.player2.nationality)?.flag || ''}
                              alt={`${nextMatch.player2.nationality} flag`}
                              className="w-8 h-5"
                              nationality={nextMatch.player2.nationality}
                            />
                          </div>
                          <div className="font-semibold text-white text-base">{nextMatch.player2.name}</div>
                          <div className="text-sm text-cyan-400">Rating: {nextMatch.player2.rating.toFixed(0)}</div>
                        </div>
                      </div>
                      <Button 
                        onClick={nextMatch.matchType.includes('cup') ? onSimulateCup : onSimulateMatch}
                        className="w-full"
                      >
                        Simulate {nextMatch.matchType.includes('cup') ? 'Cup Match' : 'Match'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {allMatchesComplete && (
                <Button onClick={onEndSeason} className="w-full" variant="default">
                  End Season & Start New Season
                </Button>
              )}

              {recentMatches.length > 0 && (
                <Card className="tech-card border-cyan-400/30">
                  <CardHeader>
                    <CardTitle className="text-lg text-cyan-400">Recent Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recentMatches.map((match) => {
                        const result = formatMatchResult(match);
                        if (!result) return null;
                        
                        const winnerCountry = COUNTRIES.find(c => c.name === result.winner.nationality);
                        const loserCountry = COUNTRIES.find(c => c.name === result.loser.nationality);
                        
                        return (
                          <div key={match.id} className="flex items-center justify-between p-3 bg-card/50 rounded border border-cyan-400/20">
                            <div className="flex items-center space-x-3 text-sm flex-1 min-w-0">
                              <FlagImage 
                                src={winnerCountry?.flag || ''}
                                alt={`${result.winner.nationality} flag`}
                                className="w-5 h-3 flex-shrink-0"
                                nationality={result.winner.nationality}
                              />
                              <span className="text-yellow-400 text-xs flex-shrink-0">🏆</span>
                              <span className="font-bold text-white truncate">
                                {result.winner.name}
                              </span>
                              <span className="text-muted-foreground flex-shrink-0">vs</span>
                              <FlagImage 
                                src={loserCountry?.flag || ''}
                                alt={`${result.loser.nationality} flag`}
                                className="w-5 h-3 flex-shrink-0"
                                nationality={result.loser.nationality}
                              />
                              <span className="text-muted-foreground truncate">
                                {result.loser.name}
                              </span>
                              {match.matchType !== 'league' && (
                                <span className="text-xs text-cyan-400 flex-shrink-0">
                                  {match.matchType === 'cup-semi' ? 'SF' : 
                                   match.matchType === 'cup-final' ? 'F' : 
                                   match.matchType === 'cup-3rd' ? '3rd' : 'Cup'}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-mono text-cyan-400 font-bold flex-shrink-0 ml-2">
                              {result.score}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-4">
          <RecentResults 
            matches={completedMatches}
            title="📊 Season Results"
            maxResults={15}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
