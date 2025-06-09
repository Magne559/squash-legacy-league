
import { Player } from "@/types/squash";
import { Card } from "@/components/ui/card";
import { COUNTRIES } from "@/utils/countries";

interface PlayerCardProps {
  player: Player;
  position?: number;
  showPosition?: boolean;
  showCareerStats?: boolean;
  onClick?: () => void;
}

export const PlayerCard = ({ 
  player, 
  position, 
  showPosition = true, 
  showCareerStats = false,
  onClick 
}: PlayerCardProps) => {
  const country = COUNTRIES.find(c => c.name === player.nationality);
  const winPercentage = player.gamesPlayed > 0 ? (player.gamesWon / player.gamesPlayed * 100).toFixed(1) : '0.0';

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
              {country?.flag && (
                <img 
                  src={country.flag} 
                  alt={`${player.nationality} flag`}
                  className="tech-flag w-6 h-4 flex-shrink-0"
                />
              )}
              <h3 className="font-bold text-lg text-white truncate">{player.name}</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {player.nationality} • Age {player.age} • <span className="tech-stat">Rating {player.rating.toFixed(0)}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-cyan-400">{player.gamesWon}W-{player.gamesLost}L</div>
          <div className="text-sm text-muted-foreground">{winPercentage}%</div>
          {showCareerStats && (
            <div className="text-xs text-muted-foreground mt-1">
              Sets: {player.setsWon}-{player.setsLost}
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
