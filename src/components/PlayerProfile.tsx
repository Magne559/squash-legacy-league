import { useState, useEffect } from "react";
import { Player, Match } from "@/types/squash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { COUNTRIES } from "@/utils/countries";

interface PlayerProfileProps {
  player: Player;
  onBack: () => void;
  recentMatches?: Match[];
}

export const PlayerProfile = ({ player, onBack, recentMatches = [] }: PlayerProfileProps) => {
  const [activeTab, setActiveTab] = useState("career");
  const country = COUNTRIES.find(c => c.name === player.nationality);

  // Load tab state from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem(`playerProfile_${player.id}_tab`);
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [player.id]);

  // Save tab state to localStorage
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem(`playerProfile_${player.id}_tab`, tab);
  };

  const formatMatchResult = (match: Match, playerPerspective: Player) => {
    if (!match.completed || !match.winner) {
      return {
        opponent: match.player1.id === playerPerspective.id ? match.player2 : match.player1,
        result: "Result pending",
        isWin: false,
        score: "",
        winnerName: "",
        loserName: ""
      };
    }

    const opponent = match.player1.id === playerPerspective.id ? match.player2 : match.player1;
    const isWin = match.winner.id === playerPerspective.id;
    
    // Count sets won by each player
    const player1Sets = match.sets.filter(set => set === 1).length;
    const player2Sets = match.sets.filter(set => set === 2).length;
    
    // Determine winner and loser names
    const winnerName = match.winner.name;
    const loserName = match.winner.id === match.player1.id ? match.player2.name : match.player1.name;
    
    // Format score as winner-loser (always)
    const winnerSets = match.winner.id === match.player1.id ? player1Sets : player2Sets;
    const loserSets = match.winner.id === match.player1.id ? player2Sets : player1Sets;
    const scoreDisplay = `${winnerSets}–${loserSets}`;

    return {
      opponent,
      result: isWin ? "Won" : "Lost",
      isWin,
      score: scoreDisplay,
      winnerName,
      loserName
    };
  };

  // Get recent matches (last 10) - filter matches where this player participated
  const playerRecentMatches = recentMatches
    .filter(match => match.player1.id === player.id || match.player2.id === player.id)
    .slice(-10)
    .reverse();

  // Get head-to-head data sorted by most played
  const headToHeadData = Object.entries(player.headToHead)
    .map(([opponentId, record]) => ({
      opponentId,
      record,
      totalMatches: record.wins + record.losses
    }))
    .sort((a, b) => b.totalMatches - a.totalMatches);

  return (
    <div className="min-h-screen bg-background">
      <div className="tech-header p-4">
        <div className="flex items-center space-x-4 mb-4">
          <Button 
            onClick={onBack} 
            variant="ghost" 
            size="sm"
            className="text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 mb-4">
          {country?.flag && (
            <img 
              src={country.flag} 
              alt={`${player.nationality} flag`}
              className="tech-flag w-8 h-6"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{player.name}</h1>
            <p className="text-muted-foreground">
              {player.nationality} • Age {player.age} • Division {player.division}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="tech-card p-3">
            <div className="text-xl font-bold text-cyan-400">{player.rating.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">Rating</div>
          </div>
          <div className="tech-card p-3">
            <div className="text-xl font-bold text-green-400">{player.gamesWon}W</div>
            <div className="text-sm text-muted-foreground">Career Wins</div>
          </div>
          <div className="tech-card p-3">
            <div className="text-xl font-bold text-red-400">{player.gamesLost}L</div>
            <div className="text-sm text-muted-foreground">Career Losses</div>
          </div>
          <div className="tech-card p-3">
            <div className="text-xl font-bold text-yellow-400">
              {player.gamesPlayed > 0 ? (player.gamesWon / player.gamesPlayed * 100).toFixed(1) : '0.0'}%
            </div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border-cyan-400/20 mx-4">
          <TabsTrigger value="career" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Career
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Recent
          </TabsTrigger>
          <TabsTrigger value="head-to-head" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            H2H
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="career" className="mt-4 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="tech-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">Career Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Matches Played:</span>
                  <span className="font-bold">{player.gamesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wins / Losses:</span>
                  <span className="font-bold">{player.gamesWon}W - {player.gamesLost}L</span>
                </div>
                <div className="flex justify-between">
                  <span>Sets Won / Lost:</span>
                  <span className="font-bold">{player.setsWon} - {player.setsLost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Points Scored:</span>
                  <span className="font-bold">{player.pointsScored.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Rating:</span>
                  <span className="font-bold text-cyan-400">{player.rating.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Career High:</span>
                  <span className="font-bold text-yellow-400">{player.careerHighRating.toFixed(0)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="tech-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Championships:</span>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-yellow-400">{player.championshipsWon}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Podiums (Top 3):</span>
                  <div className="flex items-center space-x-2">
                    <Medal className="w-4 h-4 text-orange-400" />
                    <span className="font-bold text-orange-400">{player.podiums}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Cups Won:</span>
                  <span className="font-bold text-cyan-400">{player.cupsWon}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cups Played:</span>
                  <span className="font-bold">{player.cupsPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Seasons Played:</span>
                  <span className="font-bold">{player.seasonsPlayed}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recent" className="mt-4 px-4">
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {playerRecentMatches.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No matches played yet</p>
                ) : (
                  playerRecentMatches.map((match, index) => {
                    const matchResult = formatMatchResult(match, player);
                    const opponentCountry = COUNTRIES.find(c => c.name === matchResult.opponent.nationality);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-card/30 rounded border border-cyan-400/20">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-yellow-400">🏆</span>
                            <span className="font-bold text-green-400">
                              {matchResult.winnerName}
                            </span>
                          </div>
                          <span className="text-muted-foreground">vs</span>
                          <div className="flex items-center space-x-2">
                            {opponentCountry?.flag && (
                              <img 
                                src={opponentCountry.flag} 
                                alt={`${matchResult.opponent.nationality} flag`}
                                className="tech-flag w-4 h-3"
                              />
                            )}
                            <span className="text-muted-foreground">
                              {matchResult.loserName}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{matchResult.score}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {match.matchType} • S{match.season}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="head-to-head" className="mt-4 px-4">
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">Head-to-Head Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {headToHeadData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No head-to-head data available</p>
                ) : (
                  headToHeadData.map(({ opponentId, record }) => {
                    const opponentName = record.opponentName || `Player ${opponentId}`;
                    
                    return (
                      <div key={opponentId} className="flex items-center justify-between p-3 bg-card/30 rounded border border-cyan-400/20">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-white">{opponentName}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {record.wins}W - {record.losses}L
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Sets: {record.setsWon}-{record.setsLost}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4 px-4">
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">Season History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {player.seasonHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No season history available</p>
                ) : (
                  player.seasonHistory.slice().reverse().map((season, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-card/30 rounded border border-cyan-400/20">
                      <div>
                        <div className="font-medium text-white">Season {season.season}</div>
                        <div className="text-sm text-muted-foreground">
                          Division {season.division} • Position {season.position}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {season.cupResult !== 'Did Not Qualify' && (
                            <span className="text-yellow-400">{season.cupResult}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {season.leaguePoints} pts • {season.endRating.toFixed(0)} rating
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
