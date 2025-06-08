
import { Player } from "@/types/squash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">{country?.flag}</span>
            <div>
              <div>{player.name}</div>
              <div className="text-sm text-muted-foreground">{player.nationality}</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-bold">{player.rating.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Current Rating</div>
            </div>
            <div>
              <div className="text-lg font-bold">{player.careerHighRating.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Career High</div>
            </div>
            <div>
              <div className="text-lg font-bold">{player.age}</div>
              <div className="text-sm text-muted-foreground">Age</div>
            </div>
            <div>
              <div className="text-lg font-bold">{player.seasonsPlayed}</div>
              <div className="text-sm text-muted-foreground">Seasons</div>
            </div>
          </div>
          
          {player.isDeclined && (
            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <div className="text-sm">🔻 This player is in career decline</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Career Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xl font-bold">{player.gamesWon}-{player.gamesLost}</div>
              <div className="text-sm text-muted-foreground">W-L Record ({winPercentage}%)</div>
            </div>
            <div>
              <div className="text-xl font-bold">{player.setsWon}-{player.setsLost}</div>
              <div className="text-sm text-muted-foreground">Sets W-L</div>
            </div>
            <div>
              <div className="text-xl font-bold">{player.championshipsWon}</div>
              <div className="text-sm text-muted-foreground">Championships</div>
            </div>
            <div>
              <div className="text-xl font-bold">{player.cupsWon}</div>
              <div className="text-sm text-muted-foreground">Cups Won</div>
            </div>
            <div>
              <div className="text-xl font-bold">{player.podiums}</div>
              <div className="text-sm text-muted-foreground">Podium Finishes</div>
            </div>
            <div>
              <div className="text-xl font-bold">{player.cupPodiums}</div>
              <div className="text-sm text-muted-foreground">Cup Podiums</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {player.seasonHistory.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Season History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {player.seasonHistory.slice().reverse().map((record) => (
                <div key={record.season} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-semibold">Season {record.season}</span>
                    <span className="ml-2 text-sm">
                      {record.position <= 5 ? `Division 1, ${getOrdinal(record.position)}` : `Division 2, ${getOrdinal(record.position - 5)}`}
                    </span>
                  </div>
                  {record.cupResult && (
                    <div className="text-sm bg-yellow-100 px-2 py-1 rounded">
                      🏆 {record.cupResult}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(player.headToHead).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Head-to-Head Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(player.headToHead).map(([opponentId, record]) => (
                <div key={opponentId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="text-sm">vs Opponent</div>
                  <div className="text-sm font-mono">{record.wins}W-{record.losses}L</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const getOrdinal = (n: number): string => {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
};
