
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Season, Player } from '@/types/squash';

interface SeasonViewProps {
  currentSeason: Season;
  players: Player[];
  onBack: () => void;
}

export const SeasonView = ({ currentSeason, players, onBack }: SeasonViewProps) => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Season {currentSeason.number}</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Season Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold">{currentSeason.matches.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{currentSeason.matches.filter(m => m.completed).length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">League Phase</p>
                <p className="text-2xl font-bold">{currentSeason.leaguePhaseComplete ? 'Complete' : 'In Progress'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cup Participants</p>
                <p className="text-2xl font-bold">{currentSeason.cupParticipants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
