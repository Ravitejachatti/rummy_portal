"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth, User } from '@/components/auth-provider';
import { Users, Coins, TrendingUp, Gift, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { users, updateUserCoins } = useAuth();
  const [coinAmount, setCoinAmount] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalUsers = users.filter(u => u.role === 'player').length;
  const totalCoins = users.reduce((sum, u) => sum + u.coins, 0);
  const activeGames = 3; // Mock data

  const handleGiveCoins = (user: User, amount: number) => {
    const newCoins = user.coins + amount;
    updateUserCoins(user.id, newCoins);
    toast.success(`Gave ${amount} coins to ${user.name}`, {
      description: `New balance: ${newCoins} coins`,
    });
    setIsDialogOpen(false);
    setCoinAmount('');
  };

  const handleTakeCoins = (user: User, amount: number) => {
    const newCoins = Math.max(0, user.coins - amount);
    updateUserCoins(user.id, newCoins);
    toast.success(`Removed ${amount} coins from ${user.name}`, {
      description: `New balance: ${newCoins} coins`,
    });
    setIsDialogOpen(false);
    setCoinAmount('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage users, coins, and monitor game activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCoins.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              In circulation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Games</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGames}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹12,450</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage player accounts and coin balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Games</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.filter(u => u.role === 'player').map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-accent" />
                      <span className="font-semibold">{user.coins}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.gamesPlayed}</TableCell>
                  <TableCell>
                    <Badge variant={user.gamesPlayed > 0 ? "default" : "secondary"}>
                      {user.gamesPlayed > 0 ? `${Math.round((user.gamesWon / user.gamesPlayed) * 100)}%` : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (open) setSelectedUser(user);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Manage Coins
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Coins - {user.name}</DialogTitle>
                          <DialogDescription>
                            Current balance: {user.coins} coins
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="coinAmount">Amount</Label>
                            <Input
                              id="coinAmount"
                              type="number"
                              value={coinAmount}
                              onChange={(e) => setCoinAmount(e.target.value)}
                              placeholder="Enter coin amount"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleGiveCoins(user, parseInt(coinAmount) || 0)}
                              className="flex-1"
                              disabled={!coinAmount || parseInt(coinAmount) <= 0}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Give Coins
                            </Button>
                            <Button
                              onClick={() => handleTakeCoins(user, parseInt(coinAmount) || 0)}
                              variant="destructive"
                              className="flex-1"
                              disabled={!coinAmount || parseInt(coinAmount) <= 0}
                            >
                              <Minus className="w-4 h-4 mr-2" />
                              Take Coins
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}