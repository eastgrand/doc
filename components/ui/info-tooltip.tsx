import React from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InfoTooltipProps {
  title: string;
  description: string;
  formula?: string;
  example?: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  description,
  formula,
  example,
  className = ''
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`inline-flex items-center justify-center w-4 h-4 ml-1 transition-colors ${className}`}
            style={{ 
              color: 'var(--theme-text-muted)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-muted)'}
            aria-label={`Info about ${title}`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-3 space-y-2 theme-tooltip">
          <div className="font-semibold text-sm" style={{ color: 'var(--theme-text-primary)' }}>{title}</div>
          <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{description}</div>
          {formula && (
            <div className="text-xs">
              <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>Formula: </span>
              <code className="theme-code text-[11px]">{formula}</code>
            </div>
          )}
          {example && (
            <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>Example: </span>
              {example}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};