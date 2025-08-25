
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, X } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

interface ChatInputProps {
  onSendMessage: (text: string, attachmentUrl?: string, attachmentType?: string, attachmentName?: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useFileUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && !selectedFile) || disabled || uploading) return;

    let attachmentUrl = '';
    let attachmentType = '';
    let attachmentName = '';

    if (selectedFile) {
      const uploadedUrl = await uploadFile(selectedFile);
      if (!uploadedUrl) return; // Upload failed
      
      attachmentUrl = uploadedUrl;
      attachmentType = selectedFile.type;
      attachmentName = selectedFile.name;
    }

    onSendMessage(message, attachmentUrl, attachmentType, attachmentName);
    setMessage('');
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande. Limite de 10MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 border-t bg-background">
      {selectedFile && (
        <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
          <span className="text-sm truncate">{selectedFile.name}</span>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={removeSelectedFile}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua pergunta para a Tudinha..."
          className="flex-1 rounded-xl border-2 border-primary/20 focus:border-primary"
          disabled={disabled || uploading}
        />
        
        <Button 
          type="submit" 
          size="icon"
          variant="default"
          disabled={(!message.trim() && !selectedFile) || disabled || uploading}
          className="rounded-xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
