"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/components/auth-provider';
import { PlayingCard } from '@/components/playing-card';
import { Shuffle, RotateCcw, Trophy, Coins, Timer, Users } from 'lucide-react';
import { toast } from 'sonner';

// Define Card interface for TypeScript
interface GameCard {
  suit: string;
  rank: string;
  id: string;
}

// Rummy game logic
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const createDeck = (): GameCard[] => {
  const deck: GameCard[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({ suit, rank, id: `${suit}-${rank}` });
    });
  });
  return deck;
};

const shuffleDeck = (deck: GameCard[]): GameCard[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function GameBoard() {
  const { user, updateUserCoins, updateUserStats } = useAuth();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'ended'>('waiting');
  const [playerCards, setPlayerCards] = useState<GameCard[]>([]);
  const [opponentCards, setOpponentCards] = useState<GameCard[]>([]);
  const [deck, setDeck] = useState<GameCard[]>([]);
  const [discardPile, setDiscardPile] = useState<GameCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<GameCard[]>([]);
  const [gameResult, setGameResult] = useState<{
    won: boolean;
    winnings: number;
    message: string;
  } | null>(null);
  const [timer, setTimer] = useState(30);
  const [currentPlayer, setCurrentPlayer] = useState<'player' | 'opponent'>('player');
  const [entryFee] = useState(50);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            handleEndTurn();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timer]);

  const startNewGame = () => {
    if (user.coins < entryFee) {
      toast.error('Insufficient coins to start game');
      return;
    }

    const newDeck = shuffleDeck(createDeck());
    const playerHand = newDeck.slice(0, 13);
    const opponentHand = newDeck.slice(13, 26);
    const remainingDeck = newDeck.slice(26);
    const firstDiscard = remainingDeck.pop();

    setPlayerCards(playerHand);
    setOpponentCards(Array(13).fill({ suit: '?', rank: '?', id: 'hidden' }));
    setDeck(remainingDeck);
    setDiscardPile(firstDiscard ? [firstDiscard] : []);
    setSelectedCards([]);
    setGameState('playing');
    setCurrentPlayer('player');
    setTimer(30);
    setGameResult(null);

    // Deduct entry fee
    updateUserCoins(user.id, user.coins - entryFee);
    toast.success(`Game started! Entry fee: ${entryFee} coins`);
  };

  const handleCardSelect = (card: GameCard) => {
    if (gameState !== 'playing' || currentPlayer !== 'player') return;

    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.id === card.id);
      if (isSelected) {
        return prev.filter(c => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
  };

  const handleDrawCard = () => {
    if (gameState !== 'playing' || currentPlayer !== 'player' || deck.length === 0) return;

    const newCard = deck[0];
    const newDeck = deck.slice(1);
    
    setPlayerCards(prev => [...prev, newCard]);
    setDeck(newDeck);
    setSelectedCards([]);
  };

  const handleDiscardCard = () => {
    if (selectedCards.length !== 1) {
      toast.error('Select exactly one card to discard');
      return;
    }

    const cardToDiscard = selectedCards[0];
    setPlayerCards(prev => prev.filter(c => c.id !== cardToDiscard.id));
    setDiscardPile(prev => [cardToDiscard, ...prev]);
    setSelectedCards([]);
    
    // Check for win condition (simplified - just need to have 13 cards in valid sets)
    if (playerCards.length === 14) { // Will be 13 after discard
      handleGameEnd(true);
    } else {
      handleEndTurn();
    }
  };

  const handleEndTurn = () => {
    setCurrentPlayer(prev => prev === 'player' ? 'opponent' : 'player');
    setTimer(30);
    
    // Simple AI opponent move
    if (currentPlayer === 'player') {
      setTimeout(() => {
        // AI draws and discards randomly
        if (Math.random() > 0.5) {
          handleGameEnd(false); // AI wins sometimes
        } else {
          setCurrentPlayer('player');
          setTimer(30);
        }
      }, 2000);
    }
  };

  const handleGameEnd = (playerWon: boolean) => {
    setGameState('ended');
    const winnings = playerWon ? entryFee * 1.8 : 0; // 80% return on win
    const newCoins = Math.floor(user.coins + winnings);
    
    setGameResult({
      won: playerWon,
      winnings: Math.floor(winnings),
      message: playerWon ? 'Congratulations! You won!' : 'Better luck next time!'
    });

    // Update user stats
    updateUserCoins(user.id, newCoins);
    updateUserStats(user.id, {
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (playerWon ? 1 : 0),
      totalEarnings: user.totalEarnings + Math.floor(winnings)
    });

    if (playerWon) {
      toast.success(`You won ${Math.floor(winnings)} coins!`);
    } else {
      toast.error('You lost this round!');
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setPlayerCards([]);
    setOpponentCards([]);
    setDeck([]);
    setDiscardPile([]);
    setSelectedCards([]);
    setGameResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Points Rummy
              </CardTitle>
              <CardDescription>
                Form valid sets and sequences to win
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Coins className="w-4 h-4" />
                  Entry Fee
                </div>
                <div className="font-bold text-accent">{entryFee}</div>
              </div>
              {gameState === 'playing' && (
                <div className="text-center">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Timer className="w-4 h-4" />
                    Time Left
                  </div>
                  <div className="font-bold text-primary">{timer}s</div>
                </div>
              )}
              <div className="text-center">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  Players
                </div>
                <div className="font-bold">2/2</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {gameState === 'waiting' && (
        <div className="text-center py-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Ready to Play?</h3>
            <p className="text-muted-foreground">
              Entry fee: {entryFee} coins | Potential winnings: {Math.floor(entryFee * 1.8)} coins
            </p>
            <Button 
              onClick={startNewGame} 
              size="lg" 
              className="min-w-[200px]"
              disabled={user.coins < entryFee}
            >
              {user.coins < entryFee ? 'Insufficient Coins' : 'Start Game'}
            </Button>
            {user.coins < entryFee && (
              <p className="text-sm text-muted-foreground">
                You need at least {entryFee} coins to play
              </p>
            )}
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="space-y-6">
          {/* Opponent's Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Opponent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {opponentCards.map((card, index) => (
                  <PlayingCard
                    key={index}
                    card={{ suit: '?', rank: '?', id: `opp-${index}` }}
                    isHidden={true}
                    size="sm"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deck</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleDrawCard}
                  disabled={currentPlayer !== 'player' || deck.length === 0}
                  className="w-full"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Draw Card ({deck.length} left)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Discard Pile</CardTitle>
              </CardHeader>
              <CardContent>
                {discardPile.length > 0 && (
                  <PlayingCard card={discardPile[0]} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Player's Cards */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Cards</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleDiscardCard}
                    disabled={currentPlayer !== 'player' || selectedCards.length !== 1}
                    variant="outline"
                  >
                    Discard Selected
                  </Button>
                  <Badge variant={currentPlayer === 'player' ? 'default' : 'secondary'}>
                    {currentPlayer === 'player' ? 'Your Turn' : 'Opponent\'s Turn'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {playerCards.map((card) => (
                  <PlayingCard
                    key={card.id}
                    card={card}
                    isSelected={selectedCards.some(c => c.id === card.id)}
                    onClick={() => handleCardSelect(card)}
                    disabled={currentPlayer !== 'player'}
                  />
                ))}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Select cards to form valid sets (3-4 cards of same rank) or sequences (3+ consecutive cards of same suit)</p>
                <p className="mt-1">Selected: {selectedCards.length} card(s)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Result Dialog */}
      <Dialog open={gameState === 'ended'} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              {gameResult?.won ? 'Congratulations!' : 'Game Over'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {gameResult?.message}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <div className="text-2xl font-bold">
              {gameResult?.won ? '+' : '-'}{gameResult?.winnings || entryFee} coins
            </div>
            <div className="space-y-2">
              <Button onClick={startNewGame} className="w-full" disabled={user.coins < entryFee}>
                Play Again
              </Button>
              <Button onClick={resetGame} variant="outline" className="w-full">
                Back to Menu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}