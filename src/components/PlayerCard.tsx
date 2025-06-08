
import { Player } from "@/types/squash";
import { Card } from "@/components/ui/card";
import { COUNTRIES } from "@/utils/countries";

interface PlayerCardProps {
  player: Player;
  position?: number;
  showPosition?: boolean;
  onClick?: () => void;
}

export const PlayerCard = ({ player, position, showPosition = true, onClick }: PlayerCardProps) => {
  const country = COUNTRIES.find(c => c.name === player.nationality);
  const winPercentage = player.gamesPlayed > 0 ? (player.gamesWon / player.gamesPlayed * 100).toFixed(1) : '0.0';

  return (
    <Card 
      className="p-4 mb-2 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showPosition && (
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              {position}
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{country?.flag}</span>
              <h3 className="font-semibold text-lg">{player.name}</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {player.nationality} • Age {player.age} • Rating {player.rating.toFixed(0)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{player.gamesWon}W-{player.gamesLost}L</div>
          <div className="text-sm text-muted-foreground">{winPercentage}%</div>
        </div>
      </div>
      
      {player.isDeclined && (
        <div className="mt-2 text-sm text-orange-600 flex items-center">
          🔻 Career decline
        </div>
      )}
      
      {player.championshipsWon > 0 && (
        <div className="mt-2 flex items-center space-x-2 text-sm">
          <span>🏆 {player.championshipsWon} Championships</span>
          {player.cupsWon > 0 && <span>🏅 {player.cupsWon} Cups</span>}
        </div>
      )}
    </Card>
  );
};
