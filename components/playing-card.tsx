"use client";

import { cn } from '@/lib/utils';

interface PlayingCardProps {
  card: {
    suit: string;
    rank: string;
    id: string;
  };
  isSelected?: boolean;
  isHidden?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PlayingCard({ 
  card, 
  isSelected = false,
  isHidden = false,
  onClick,
  disabled = false,
  size = 'md',
  className 
}: PlayingCardProps) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  
  const sizeClasses = {
    sm: 'w-12 h-16 text-xs',
    md: 'w-16 h-24 text-sm',
    lg: 'w-20 h-28 text-base'
  };

  if (isHidden) {
    return (
      <div className={cn(
        'bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-700 shadow-md',
        'flex items-center justify-center cursor-default select-none',
        'transition-all duration-200',
        sizeClasses[size],
        className
      )}>
        <div className="text-white font-bold text-lg">?</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg border-2 shadow-md cursor-pointer select-none',
        'flex flex-col items-center justify-center font-bold',
        'transition-all duration-200 hover:scale-105 hover:shadow-lg',
        isSelected && 'ring-2 ring-primary ring-offset-2 scale-105',
        disabled && 'opacity-50 cursor-not-allowed',
        isRed ? 'text-red-600 border-red-200' : 'text-black border-gray-200',
        sizeClasses[size],
        className
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="text-center leading-tight">
        <div className="font-bold">{card.rank}</div>
        <div className="text-lg">{card.suit}</div>
      </div>
    </div>
  );
}