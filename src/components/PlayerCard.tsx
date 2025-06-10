
import { Player, Season } from "@/types/squash";
import { Card } from "@/components/ui/card";
import { COUNTRIES } from "@/utils/countries";
import { FlagImage } from "./FlagImage";

interface PlayerCardProps {
  player: Player;
  position?: number;
  showPosition?: boolean;
  showCareerStats?: boolean;
  onClick?: () => void;
  currentSeason?: Season | null;
}

export const PlayerCard = ({ 
  player, 
  position, 
  showPosition = true, 
  showCareerStats = false,
  onClick,
  currentSeason
}: PlayerCardProps) => {
  const country = COUNTRIES.find(c => c.name === player.nationality);
  
  // Calculate season league stats if currentSeason is provided and showCareerStats is false
  const getSeasonLeagueStats = () => {
    if (!currentSeason || showCareerStats) {
      return {
        wins: player.gamesWon,
        losses: player.gamesLost,
        setsWon: player.setsWon,
        setsLost: player.setsLost,
        winPercentage: player.gamesPlayed > 0 ? (player.gamesWon / player.gamesPlayed * 100).toFixed(1) : '0.0'
      };
    }
    
    // Count only league matches from current season
    const seasonLeagueMatches = currentSeason.matches.filter(m => 
      m.matchType === 'league' && 
      m.completed && 
      (m.player1.id === player.id || m.player2.id === player.id)
    );
    
    let seasonWins = 0;
    let seasonLosses = 0;
    let seasonSetsWon = 0;
    let seasonSetsLost = 0;
    
    seasonLeagueMatches.forEach(match => {
      if (match.winner?.id === player.id) {
        seasonWins++;
      } else {
        seasonLosses++;
      }
      
      // Calculate sets for this player in this match
      const playerSets = match.sets.filter((setWinner, index) => {
        if (setWinner === 1 && match.player1.id === player.id) return true;
        if (setWinner === 2 && match.player2.id === player.id) return true;
        return false;
      }).length;
      
      const opponentSets = match.sets.length - playerSets;
      seasonSetsWon += playerSets;
      seasonSetsLost += opponentSets;
    });
    
    const seasonGamesPlayed = seasonWins + seasonLosses;
    const winPercentage = seasonGamesPlayed > 0 ? (seasonWins / seasonGamesPlayed * 100).toFixed(1) : '0.0';
    
    return {
      wins: seasonWins,
      losses: seasonLosses,
      setsWon: seasonSetsWon,
      setsLost: seasonSetsLost,
      winPercentage
    };
  };
  
  const stats = getSeasonLeagueStats();

  return (
    <Card 
      className="tech-card p-4 mb-3 cursor-pointer hover:border-cyan-400/40 transition-all"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {showPosition && (
            <div className="position-indicator flex-shrink-0">
              {position}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <FlagImage 
                src={country?.flag || ''}
                alt={`${player.nationality} flag`}
                className="w-6 h-4 flex-shrink-0"
                nationality={player.nationality}
              />
              <h3 className="font-bold text-lg text-white truncate">{player.name}</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {player.nationality} • Age {player.age} • <span className="tech-stat">Rating {player.rating.toFixed(0)}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-cyan-400">{stats.wins}W-{stats.losses}L</div>
          <div className="text-sm text-muted-foreground">{stats.winPercentage}%</div>
          {showCareerStats && (
            <div className="text-xs text-muted-foreground mt-1">
              Sets: {stats.setsWon}-{stats.setsLost}
            </div>
          )}
        </div>
      </div>
      
      {player.isDeclined && (
        <div className="mt-3 text-sm text-orange-400 flex items-center bg-orange-500/10 px-3 py-1 rounded border border-orange-400/30">
          🔻 Career decline
        </div>
      )}
      
      {(player.championshipsWon > 0 || player.cupsWon > 0) && (
        <div className="mt-3 flex items-center space-x-4 text-sm flex-wrap">
          {player.championshipsWon > 0 && (
            <span className="text-yellow-400">🏆 {player.championshipsWon} Championships</span>
          )}
          {player.cupsWon > 0 && (
            <span className="text-cyan-400">🏅 {player.cupsWon} Cups</span>
          )}
        </div>
      )}
    </Card>
  );
};
