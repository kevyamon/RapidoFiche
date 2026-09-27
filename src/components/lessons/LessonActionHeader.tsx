import React from 'react';
import { HardDriveDownload, Bookmark } from 'lucide-react';
import { Button } from '../ui/Button';

export interface LessonActionHeaderProps {
  title: string;
  isFavorite: boolean;
  isOfflineSaved: boolean;
  isSubscriptionActive: boolean;
  onToggleFavorite: () => void;
  onToggleOffline: () => void;
}

export const LessonActionHeader: React.FC<LessonActionHeaderProps> = ({
  title,
  isFavorite,
  isOfflineSaved,
  isSubscriptionActive,
  onToggleFavorite,
  onToggleOffline,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 bg-background-card p-4 rounded-xl border border-border-default shadow-subtle">
      <h1 className="text-base sm:text-lg font-bold text-text-primary truncate">
        {title}
      </h1>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFavorite}
          leftIcon={
            <Bookmark
              className={`w-4 h-4 ${isFavorite ? 'fill-current text-secondary-600' : ''}`}
            />
          }
        >
          <span className="hidden sm:inline">
            {isFavorite ? 'Enregistrée' : 'Favoris'}
          </span>
        </Button>

        {isSubscriptionActive && (
          <Button
            variant={isOfflineSaved ? 'outline' : 'primary'}
            size="sm"
            onClick={onToggleOffline}
            leftIcon={<HardDriveDownload className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">
              {isOfflineSaved ? 'Sauvegardée' : 'Sauvegarder'}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};
