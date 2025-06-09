
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { SeasonArchive, Player } from '@/types/squash';

interface ArchiveViewProps {
  seasonArchive: SeasonArchive[];
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
          seasonArchive.map((archive) => (
            <Card key={archive.season}>
              <CardHeader>
                <CardTitle>Season {archive.season}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Division 1 Winner</p>
                    <p className="text-lg font-semibold">
                      {archive.division1FinalStandings[0]?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Division 2 Winner</p>
                    <p className="text-lg font-semibold">
                      {archive.division2FinalStandings[0]?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cup Winner</p>
                    <p className="text-lg font-semibold">
                      {archive.cupResults.winner?.name || 'N/A'}
                    </p>
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
