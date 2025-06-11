
import { Player } from "@/types/squash";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlagImage } from "./FlagImage";
import { COUNTRIES } from "@/utils/countries";
import { ArrowRight } from "lucide-react";

interface RetirementPopupProps {
  isOpen: boolean;
  retiringPlayers: Player[];
  newPlayers: Player[];
  onStartNextSeason: () => void;
}

export const RetirementPopup = ({
  isOpen,
  retiringPlayers,
  newPlayers,
  onStartNextSeason
}: RetirementPopupProps) => {
  if (retiringPlayers.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-400 text-center">
            Season Transitions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">
              {retiringPlayers.length} Player{retiringPlayers.length > 1 ? 's' : ''} Retiring
            </h3>
          </div>
          
          <div className="space-y-4">
            {retiringPlayers.map((retiringPlayer, index) => {
              const newPlayer = newPlayers[index];
              const retiringCountry = COUNTRIES.find(c => c.name === retiringPlayer.nationality);
              const newCountry = COUNTRIES.find(c => c.name === newPlayer?.nationality);
              
              return (
                <div key={retiringPlayer.id} className="flex items-center justify-between p-4 bg-card/50 rounded border border-cyan-400/20">
                  {/* Retiring Player */}
                  <Card className="flex-1 p-4 bg-red-500/10 border-red-400/30">
                    <div className="flex items-center space-x-3">
                      <FlagImage 
                        src={retiringCountry?.flag || ''}
                        alt={`${retiringPlayer.nationality} flag`}
                        className="w-6 h-4"
                        nationality={retiringPlayer.nationality}
                      />
                      <div>
                        <h4 className="font-bold text-white">{retiringPlayer.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Age {retiringPlayer.age} • {retiringPlayer.seasonsPlayed} seasons
                        </p>
                        <p className="text-sm text-red-400">
                          🏆 {retiringPlayer.championshipsWon} Championships • 🏅 {retiringPlayer.cupsWon} Cups
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Arrow */}
                  <div className="px-4">
                    <ArrowRight className="w-8 h-8 text-cyan-400" />
                  </div>
                  
                  {/* New Player */}
                  {newPlayer && (
                    <Card className="flex-1 p-4 bg-green-500/10 border-green-400/30">
                      <div className="flex items-center space-x-3">
                        <FlagImage 
                          src={newCountry?.flag || ''}
                          alt={`${newPlayer.nationality} flag`}
                          className="w-6 h-4"
                          nationality={newPlayer.nationality}
                        />
                        <div>
                          <h4 className="font-bold text-white">{newPlayer.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Age {newPlayer.age} • Division {newPlayer.division}
                          </p>
                          <p className="text-sm text-green-400">
                            Rating {newPlayer.rating.toFixed(0)} • New Professional
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-center pt-4">
            <Button 
              onClick={onStartNextSeason}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 text-lg"
            >
              Start Next Season
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
