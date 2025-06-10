
import { Match } from "@/types/squash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COUNTRIES } from "@/utils/countries";

interface RecentResultsProps {
  matches: Match[];
  title?: string;
  maxResults?: number;
}

export const RecentResults = ({ matches, title = "Recent Results", maxResults = 10 }: RecentResultsProps) => {
  const recentMatches = matches
    .filter(m => m.completed && m.winner)
    .slice(-maxResults)
    .reverse();

  if (recentMatches.length === 0) {
    return (
      <Card className="tech-card">
        <CardHeader>
          <CardTitle className="text-cyan-400">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No matches completed yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="tech-card">
      <CardHeader>
        <CardTitle className="text-cyan-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentMatches.map((match) => {
            const winner = match.winner!;
            const loser = winner.id === match.player1.id ? match.player2 : match.player1;
            const winnerCountry = COUNTRIES.find(c => c.name === winner.nationality);
            const loserCountry = COUNTRIES.find(c => c.name === loser.nationality);
            
            // Calculate winner and loser sets
            const winnerSets = match.sets.filter(setWinner => {
              return (setWinner === 1 && winner.id === match.player1.id) ||
                     (setWinner === 2 && winner.id === match.player2.id);
            }).length;
            const loserSets = match.sets.length - winnerSets;
            
            return (
              <div key={match.id} className="flex items-center justify-between p-3 bg-card/50 rounded border border-cyan-400/20">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">🏆</span>
                    {winnerCountry?.flag && (
                      <img 
                        src={winnerCountry.flag} 
                        alt={`${winner.nationality} flag`}
                        className="tech-flag w-5 h-3"
                      />
                    )}
                    <span className="font-bold text-white">{winner.name}</span>
                  </div>
                  <span className="text-muted-foreground">vs</span>
                  <div className="flex items-center space-x-2">
                    {loserCountry?.flag && (
                      <img 
                        src={loserCountry.flag} 
                        alt={`${loser.nationality} flag`}
                        className="tech-flag w-5 h-3"
                      />
                    )}
                    <span className="text-white">{loser.name}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-mono text-sm text-cyan-400">
                      {winnerSets}–{loserSets}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {match.matchType === 'league' ? 'League' : 
                       match.matchType === 'cup-final' ? 'Cup Final' :
                       match.matchType === 'cup-semi' ? 'Cup Semi' :
                       match.matchType === 'cup-3rd' ? '3rd Place' : 'Cup'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
