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
            className={`inline-flex items-center justify-center w-4 h-4 ml-1 text-gray-400 hover:text-gray-600 transition-colors ${className}`}
            aria-label={`Info about ${title}`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-3 space-y-2 bg-white border border-gray-200 shadow-lg">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs text-gray-600">{description}</div>
          {formula && (
            <div className="text-xs">
              <span className="font-semibold">Formula: </span>
              <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">{formula}</code>
            </div>
          )}
          {example && (
            <div className="text-xs text-gray-500">
              <span className="font-semibold">Example: </span>
              {example}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};