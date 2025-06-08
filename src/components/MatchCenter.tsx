
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

  const leagueMatches = currentSeason.matches.filter(m => m.matchType === 'league');
  const cupMatches = currentSeason.matches.filter(m => m.matchType.includes('cup'));
  
  const completedLeague = leagueMatches.filter(m => m.completed).length;
  const totalLeague = leagueMatches.length;
  const completedCup = cupMatches.filter(m => m.completed).length;
  const totalCup = cupMatches.length;

  const nextMatch = currentSeason.matches.find(m => !m.completed);
  const recentMatches = currentSeason.matches.filter(m => m.completed).slice(-5).reverse();

  const allMatchesComplete = currentSeason.matches.every(m => m.completed);
  const cupInProgress = cupMatches.length > 0;

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Season {currentSeason.number} - Match Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{completedLeague}/{totalLeague}</div>
              <div className="text-sm text-muted-foreground">League Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{completedCup}/{totalCup || 0}</div>
              <div className="text-sm text-muted-foreground">Cup Matches</div>
            </div>
          </div>

          {nextMatch && (
            <Card className="mb-4 bg-blue-50">
              <CardContent className="p-4">
                <div className="text-center mb-3">
                  <div className="text-sm text-muted-foreground mb-2">
                    {nextMatch.matchType === 'league' ? `Division ${nextMatch.division}` : 'Cup Tournament'}
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg">{getPlayerFlag(nextMatch.player1.name, nextMatch.player1.nationality)}</div>
                      <div className="font-semibold">{nextMatch.player1.name}</div>
                      <div className="text-sm text-muted-foreground">Rating: {nextMatch.player1.rating.toFixed(0)}</div>
                    </div>
                    <div className="text-2xl font-bold">VS</div>
                    <div className="text-center">
                      <div className="text-lg">{getPlayerFlag(nextMatch.player2.name, nextMatch.player2.nationality)}</div>
                      <div className="font-semibold">{nextMatch.player2.name}</div>
                      <div className="text-sm text-muted-foreground">Rating: {nextMatch.player2.rating.toFixed(0)}</div>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={nextMatch.matchType.includes('cup') ? onSimulateCup : onSimulateMatch}
                  className="w-full"
                >
                  Simulate Match
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2 text-sm">
                        <span>{getPlayerFlag(match.player1.name, match.player1.nationality)}</span>
                        <span className={match.winner?.id === match.player1.id ? 'font-bold' : ''}>
                          {match.player1.name}
                        </span>
                        <span>vs</span>
                        <span>{getPlayerFlag(match.player2.name, match.player2.nationality)}</span>
                        <span className={match.winner?.id === match.player2.id ? 'font-bold' : ''}>
                          {match.player2.name}
                        </span>
                      </div>
                      <div className="text-sm font-mono">
                        {match.sets.filter(s => s === 1).length}-{match.sets.filter(s => s === 2).length}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
