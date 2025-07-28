import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface QueryDialogProps {
  onQuestionSelect: (question: string) => void;
  title: string;
  description: string;
  categories: Record<string, string[]>;
  disabledCategories?: Record<string, string[]>;
}

const QueryDialog: React.FC<QueryDialogProps> = ({
  onQuestionSelect,
  title,
  description,
  categories,
  disabledCategories = {},
}) => {
  return (
    <>
      <DialogHeader className="border-b pb-4">
        <div className="flex items-center gap-3">
          <Image
            src="/mpiq_pin2.png"
            alt={title}
            width={32}
            height={32}
            className="object-contain"
          />
          <DialogTitle className="text-lg font-bold">
            {title.split('IQ')[0]}
            <span className="text-lg font-bold text-[#33a852]">IQ</span>
          </DialogTitle>
        </div>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      </DialogHeader>
      <div className="grid gap-6 py-6 px-4 bg-gray-50/50">
        {/* Enabled Categories */}
        {Object.entries(categories).map(([category, questions]) => (
          <div
            key={category}
            className="space-y-3 bg-white p-4 rounded-xl shadow-sm"
          >
            <h3 className="font-semibold text-sm text-gray-800">
              {category}
            </h3>
            <div className="grid gap-1">
              {questions.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start text-left text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-auto py-2 px-3 whitespace-normal"
                  onClick={() => {
                    onQuestionSelect(question);
                  }}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        ))}
        
        {/* Disabled Categories */}
        {Object.entries(disabledCategories).map(([category, questions]) => (
          <div
            key={`disabled-${category}`}
            className="space-y-3 bg-gray-100 p-4 rounded-xl shadow-sm opacity-60"
          >
            <h3 className="font-semibold text-sm text-gray-500 flex items-center gap-2">
              {category}
              <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </h3>
            <div className="grid gap-1">
              {questions.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  disabled
                  className="justify-start text-left text-xs text-gray-400 cursor-not-allowed h-auto py-2 px-3 whitespace-normal"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default QueryDialog; 