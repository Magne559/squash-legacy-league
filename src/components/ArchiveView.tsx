
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Season, Player } from '@/types/squash';

interface ArchiveViewProps {
  seasonArchive: Season[];
  players: Player[];
  onBack: () => void;
}

export const ArchiveView = ({ seasonArchive, players, onBack }: ArchiveViewProps) => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Season Archive</h2>
      </div>

      <div className="grid gap-4">
        {seasonArchive.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No archived seasons yet.</p>
            </CardContent>
          </Card>
        ) : (
          seasonArchive.map((season) => (
            <Card key={season.number}>
              <CardHeader>
                <CardTitle>Season {season.number}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Matches</p>
                    <p className="text-lg font-semibold">{season.matches.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-lg font-semibold">{season.matches.filter(m => m.completed).length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cup Winner</p>
                    <p className="text-lg font-semibold">{season.cupWinner || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-semibold">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
