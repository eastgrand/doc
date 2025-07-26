import React, { memo } from 'react';
import { Target, Car, PersonStanding } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BufferTools = memo(({ 
  bufferType, 
  handleBufferTypeChange,
}: { 
  bufferType: string | null; 
  handleBufferTypeChange: (mode: 'radius' | 'drivetime' | 'walktime') => void; 
}) => {
  return (
    <TooltipProvider>
      <div className="w-full bg-gray-100 rounded-lg p-1">
        <div className="grid grid-cols-3 gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                type="button"
                className={`h-12 w-full rounded-md flex items-center justify-center transition-colors
                  ${bufferType === 'radius' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200'}`}
                onClick={() => handleBufferTypeChange('radius')}
              >
                <Target className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center" className="bg-black text-white rounded px-3 py-1.5 text-sm">
              Radius Buffer
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={`h-12 w-full rounded-md flex items-center justify-center transition-colors
                  ${bufferType === 'drivetime' 
                    ? 'bg-green-50 text-green-600 border border-green-200 shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200'}`}
                onClick={() => handleBufferTypeChange('drivetime')}
              >
                <Car className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center" className="bg-black text-white rounded px-3 py-1.5 text-sm">
              Drive Time Buffer
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={`h-12 w-full rounded-md flex items-center justify-center transition-colors
                  ${bufferType === 'walktime' 
                    ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200'}`}
                onClick={() => handleBufferTypeChange('walktime')}
              >
                <PersonStanding className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center" className="bg-black text-white rounded px-3 py-1.5 text-sm">
              Walk Time Buffer
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
});

BufferTools.displayName = 'BufferTools';

export default BufferTools; 