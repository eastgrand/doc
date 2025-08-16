import React from 'react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

// Define stat explanations and formulas
interface StatDefinition {
  title: string;
  description: string;
  formula?: string;
  example?: string;
}

const statDefinitions: Record<string, StatDefinition> = {
  'Markets analyzed': {
    title: 'Markets Analyzed',
    description: 'The total number of geographic areas (ZIP codes, counties, etc.) included in this analysis.',
    example: '984 ZIP codes analyzed across Florida'
  },
  'Areas analyzed': {
    title: 'Areas Analyzed',
    description: 'The total number of geographic areas included in this analysis.',
    example: '500 areas analyzed'
  },
  'Average difference': {
    title: 'Average Difference',
    description: 'The mean difference in market share between the two brands across all markets. Positive values indicate first brand advantage, negative values indicate second brand advantage.',
    formula: 'Σ(brand1_share - brand2_share) / n',
    example: '-8.37% means competitor has 8.37% higher average market share'
  },
  'Median difference': {
    title: 'Median Difference',
    description: 'The middle value when all market share differences are sorted. Less affected by extreme outliers than the average.',
    formula: 'Middle value of sorted differences',
    example: '-8.22% is the middle value of all differences'
  },
  'Average score': {
    title: 'Average Score',
    description: 'The arithmetic mean of all scores in the dataset. Provides a central tendency measure.',
    formula: 'Σ(scores) / n',
    example: '7.5/10 average across all markets'
  },
  'Median score': {
    title: 'Median Score',
    description: 'The middle value when all scores are sorted. More robust to outliers than the mean.',
    formula: 'Middle value of sorted scores',
    example: '7.8/10 is the middle score'
  },
  'Standard deviation': {
    title: 'Standard Deviation',
    description: 'Measures the spread or dispersion of values from the mean. Higher values indicate more variability.',
    formula: '√(Σ(x - μ)² / n)',
    example: '1.31% means most values are within ±1.31% of the average'
  },
  'Difference range': {
    title: 'Difference Range',
    description: 'The minimum and maximum values in the dataset, showing the full spread of differences.',
    example: '-16.7% to 0.0% shows competitor advantages ranging from 0% to 16.7%'
  },
  'Score range': {
    title: 'Score Range',
    description: 'The minimum and maximum scores in the dataset, showing the full spread of values.',
    example: '3.2 to 9.8 shows the full range of scores'
  },
  'Total population': {
    title: 'Total Population',
    description: 'The combined population across all analyzed areas.',
    formula: 'Σ(population per area)',
    example: '15.3M people across all markets'
  },
  'Total area': {
    title: 'Total Area',
    description: 'The combined geographic area in square miles across all analyzed regions.',
    formula: 'Σ(area in sq mi)',
    example: '12,450 sq mi total coverage'
  }
};

interface StatsWithInfoProps {
  content: string;
  className?: string;
  onZipCodeClick?: (zipCode: string) => void;
}

export const StatsWithInfo: React.FC<StatsWithInfoProps> = ({ content, className = '', onZipCodeClick }) => {
  // Parse the content to identify stats
  const lines = content.split('\n');
  
  return (
    <div className={className}>
      {lines.map((line, index) => {
        // Check for section headers (includes both old and new icon formats)
        if (line.includes('📊') || line.includes('📈') || line.includes('🎯') || 
            line.includes('🔍') || line.includes('✨') || line.includes('⚡')) {
          return (
            <div key={index} className="font-bold text-sm mt-3 mb-2 first:mt-0">
              <span dangerouslySetInnerHTML={{ __html: formatLine(line) }} />
            </div>
          );
        }
        
        // Check if this line contains a stat
        let statKey: string | null = null;
        
        // Check each stat definition
        for (const [key, def] of Object.entries(statDefinitions)) {
          if (line.includes(key + ':')) {
            statKey = key;
            break;
          }
        }
        
        if (statKey && statDefinitions[statKey]) {
          const statDef = statDefinitions[statKey];
          
          // Parse the line to extract the label and value
          const match = line.match(/•\s*([^:]+):\s*(.+)/);
          if (match) {
            const [, label, rawValue] = match;
            
            // Process the value for ZIP codes and formatting
            const processValue = (text: string) => {
              // Check for ZIP codes
              const zipParts = text.split(/(\b\d{5}\b)/);
              return zipParts.map((part, i) => {
                if (/^\d{5}$/.test(part) && onZipCodeClick) {
                  return (
                    <button
                      key={i}
                      className="inline-flex items-center px-1 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors cursor-pointer mx-0.5"
                      onClick={() => onZipCodeClick(part)}
                      title={`Click to zoom to ZIP code ${part}`}
                    >
                      {part}
                    </button>
                  );
                }
                // Process bold text
                const boldParts = part.split(/\*\*([^*]+)\*\*/);
                return boldParts.map((boldPart, j) => {
                  if (j % 2 === 1) {
                    return <strong key={`${i}-${j}`}>{boldPart}</strong>;
                  }
                  return <span key={`${i}-${j}`}>{boldPart}</span>;
                });
              });
            };
            
            return (
              <div key={index} className="flex items-start py-1 ml-4">
                <span className="text-sm flex items-center">
                  <span className="mr-1">•</span>
                  <span className="font-medium">{label}:</span>
                  <span className="ml-1 font-semibold">{processValue(rawValue)}</span>
                  <InfoTooltip
                    title={statDef.title}
                    description={statDef.description}
                    formula={statDef.formula}
                    example={statDef.example}
                  />
                </span>
              </div>
            );
          }
        }
        
        // Handle special formatting for headers and lists
        const isBullet = line.trim().startsWith('•');
        const isNumbered = /^\d+\.\s/.test(line.trim());
        const isBold = line.includes('**');
        
        if (isBullet || isNumbered) {
          return (
            <div key={index} className={`py-1 ${isBullet ? 'ml-4' : 'font-semibold mt-2'}`}>
              {renderLineWithZipCodes(line, onZipCodeClick)}
            </div>
          );
        }
        
        // Regular line without info icon
        if (line.trim()) {
          return (
            <div key={index} className="py-1">
              {renderLineWithZipCodes(line, onZipCodeClick)}
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
};

// Helper function to render lines with ZIP code support
function renderLineWithZipCodes(text: string, onZipCodeClick?: (zipCode: string) => void) {
  const zipParts = text.split(/(\b\d{5}\b)/);
  
  return zipParts.map((part, i) => {
    if (/^\d{5}$/.test(part) && onZipCodeClick) {
      return (
        <button
          key={i}
          className="inline-flex items-center px-1 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors cursor-pointer mx-0.5"
          onClick={() => onZipCodeClick(part)}
          title={`Click to zoom to ZIP code ${part}`}
        >
          {part}
        </button>
      );
    }
    
    // Process bold text
    const boldParts = part.split(/\*\*([^*]+)\*\*/);
    return boldParts.map((boldPart, j) => {
      if (j % 2 === 1) {
        return <strong key={`${i}-${j}`}>{boldPart}</strong>;
      }
      return <span key={`${i}-${j}`}>{boldPart}</span>;
    });
  });
}

// Helper function to format markdown-like text
function formatLine(text: string): string {
  // Convert **text** to bold
  let formatted = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert markdown headers
  formatted = formatted.replace(/^###\s+(.+)/, '<h3 class="font-semibold text-base mt-2">$1</h3>');
  formatted = formatted.replace(/^##\s+(.+)/, '<h2 class="font-semibold text-lg mt-3">$1</h2>');
  formatted = formatted.replace(/^#\s+(.+)/, '<h1 class="font-bold text-xl mt-4">$1</h1>');
  
  return formatted;
}