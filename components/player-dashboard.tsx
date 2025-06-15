"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth-provider';
import { Trophy, Target, Coins, TrendingUp, Calendar, Award } from 'lucide-react';

export function PlayerDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const winRate = user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0;
  const level = Math.floor(user.gamesWon / 5) + 1;
  const nextLevelProgress = ((user.gamesWon % 5) / 5) * 100;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Player Dashboard</h2>
        <p className="text-muted-foreground">Track your progress and game statistics</p>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Coins</CardTitle>
            <Coins className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{user.coins}</div>
            <p className="text-xs text-muted-foreground">
              Available balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Won</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.gamesWon}</div>
            <p className="text-xs text-muted-foreground">
              Out of {user.gamesPlayed} games
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
            <p className="text-xs text-muted-foreground">
              Success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{user.totalEarnings}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Player Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Player Level
            </CardTitle>
            <CardDescription>
              Your current level and progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Level {level}</h3>
                <p className="text-sm text-muted-foreground">
                  {level < 10 ? 'Beginner' : level < 25 ? 'Intermediate' : 'Expert'} Player
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {5 - (user.gamesWon % 5)} wins to next level
                </Badge>
              </div>
            </div>
            <Progress value={nextLevelProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Keep winning games to level up and unlock new features!
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest game results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.gamesPlayed > 0 ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Practice Game</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                    <Badge variant="default">Won</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Quick Match</p>
                      <p className="text-sm text-muted-foreground">1 day ago</p>
                    </div>
                    <Badge variant="secondary">Lost</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Tournament</p>
                      <p className="text-sm text-muted-foreground">3 days ago</p>
                    </div>
                    <Badge variant="default">Won</Badge>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No games played yet</p>
                  <p className="text-sm text-muted-foreground">Start playing to see your activity here!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            Your gaming milestones and accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 border rounded-lg ${user.gamesPlayed >= 1 ? 'bg-primary/10 border-primary' : 'bg-muted/50'}`}>
              <div className="flex items-center gap-3">
                <Trophy className={`w-8 h-8 ${user.gamesPlayed >= 1 ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <h4 className="font-semibold">First Game</h4>
                  <p className="text-sm text-muted-foreground">Play your first game</p>
                </div>
              </div>
            </div>

            <div className={`p-4 border rounded-lg ${user.gamesWon >= 1 ? 'bg-primary/10 border-primary' : 'bg-muted/50'}`}>
              <div className="flex items-center gap-3">
                <Award className={`w-8 h-8 ${user.gamesWon >= 1 ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <h4 className="font-semibold">First Victory</h4>
                  <p className="text-sm text-muted-foreground">Win your first game</p>
                </div>
              </div>
            </div>

            <div className={`p-4 border rounded-lg ${user.gamesWon >= 10 ? 'bg-accent/10 border-accent' : 'bg-muted/50'}`}>
              <div className="flex items-center gap-3">
                <Target className={`w-8 h-8 ${user.gamesWon >= 10 ? 'text-accent' : 'text-muted-foreground'}`} />
                <div>
                  <h4 className="font-semibold">Winning Streak</h4>
                  <p className="text-sm text-muted-foreground">Win 10 games</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}