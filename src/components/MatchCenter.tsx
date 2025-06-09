import { Season, Match } from "@/types/squash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COUNTRIES } from "@/utils/countries";

interface MatchCenterProps {
  currentSeason: Season | null;
  onSimulateMatch: () => void;
  onSimulateCup: () => void;
  onEndSeason: () => void;
}

export const MatchCenter = ({ currentSeason, onSimulateMatch, onSimulateCup, onEndSeason }: MatchCenterProps) => {
  if (!currentSeason) return <div>No active season</div>;

  const getPlayerFlag = (playerName: string, nationality: string) => {
    const country = COUNTRIES.find(c => c.name === nationality);
    return country?.flag || "🏴";
  };

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

  return (
    <div className="p-4 space-y-4">
      <Card className="tech-card border-cyan-400/30">
        <CardHeader>
          <CardTitle className="text-cyan-400">
            Season {currentSeason.number} - {leaguePhaseComplete ? 'Cup Phase' : 'League Phase'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
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
            <Card className="mb-4 bg-card/70 border-cyan-400/40">
              <CardContent className="p-4">
                <div className="text-center mb-3">
                  <div className="text-sm text-muted-foreground mb-2">
                    {nextMatch.matchType === 'league' ? (
                      `Division ${nextMatch.division} League`
                    ) : nextMatch.matchType === 'cup-semi' ? (
                      'Cup Semifinal'
                    ) : nextMatch.matchType === 'cup-3rd' ? (
                      'Cup 3rd Place Final'
                    ) : nextMatch.matchType === 'cup-final' ? (
                      'Cup Final'
                    ) : 'Cup Tournament'}
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center flex-1">
                      <div className="text-2xl mb-2">{getPlayerFlag(nextMatch.player1.name, nextMatch.player1.nationality)}</div>
                      <div className="font-semibold text-white text-base">{nextMatch.player1.name}</div>
                      <div className="text-sm text-cyan-400">Rating: {nextMatch.player1.rating.toFixed(0)}</div>
                    </div>
                    <div className="text-2xl font-bold text-cyan-400 px-4">VS</div>
                    <div className="text-center flex-1">
                      <div className="text-2xl mb-2">{getPlayerFlag(nextMatch.player2.name, nextMatch.player2.nationality)}</div>
                      <div className="font-semibold text-white text-base">{nextMatch.player2.name}</div>
                      <div className="text-sm text-cyan-400">Rating: {nextMatch.player2.rating.toFixed(0)}</div>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={nextMatch.matchType.includes('cup') ? onSimulateCup : onSimulateMatch}
                  className="w-full"
                >
                  Simulate {nextMatch.matchType.includes('cup') ? 'Cup Match' : 'Match'}
                </Button>
              </CardContent>
            </Card>
          )}

          {allMatchesComplete && (
            <Button onClick={onEndSeason} className="w-full mb-4" variant="default">
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
                    
                    return (
                      <div key={match.id} className="flex items-center justify-between p-3 bg-card/50 rounded border border-cyan-400/20">
                        <div className="flex items-center space-x-3 text-sm flex-1">
                          <span className="text-lg">{getPlayerFlag(result.winner.name, result.winner.nationality)}</span>
                          <span className="text-yellow-400 text-xs">🏆</span>
                          <span className="font-bold text-white">
                            {result.winner.name}
                          </span>
                          <span className="text-muted-foreground">vs</span>
                          <span className="text-lg">{getPlayerFlag(result.loser.name, result.loser.nationality)}</span>
                          <span className="text-muted-foreground">
                            {result.loser.name}
                          </span>
                          {match.matchType !== 'league' && (
                            <span className="text-xs text-cyan-400 ml-2">
                              {match.matchType === 'cup-semi' ? 'SF' : 
                               match.matchType === 'cup-final' ? 'F' : 
                               match.matchType === 'cup-3rd' ? '3rd' : 'Cup'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-mono text-cyan-400 font-bold">
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
    </div>
  );
};
