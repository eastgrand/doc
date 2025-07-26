import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChatMessage } from '@/lib/analytics/types';

type LocalChatMessage = ChatMessage & {
  role: 'user' | 'assistant' | 'system';
  metadata?: {
    analysisResult?: any;
    context?: string;
    totalFeatures?: number;
    visualizationResult?: any;
    debugInfo?: any;
    error?: string;
  };
};

interface MessageDialogProps {
  message: LocalChatMessage | null;
  onClose: () => void;
}

const MessageDialog: React.FC<MessageDialogProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <Dialog open={!!message} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Details</DialogTitle>
          <p className="text-sm text-gray-600"></p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Content:</h4>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          {message.metadata?.totalFeatures !== undefined && (
            <div>
              <h4 className="font-semibold">Results:</h4>
              <p>{message.metadata.totalFeatures} features found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog; 