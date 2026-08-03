"use client";

import { useState } from "react";
import { Attachment } from "@/types/attachment";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, X, Upload } from "lucide-react";

interface TaskAttachmentsSectionProps {
  attachments: Attachment[];
  onUpload?: (file: File) => void;
  onDelete?: (attachmentId: string) => void;
  canEdit?: boolean;
}

export function TaskAttachmentsSection({ attachments, onUpload, onDelete, canEdit = false }: TaskAttachmentsSectionProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎥";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("zip") || mimeType.includes("rar")) return "🗜️";
    return "📎";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">
        Anexos ({attachments.length})
      </h3>

      {/* Lista de anexos */}
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="group flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
          >
            <span className="text-2xl">{getFileIcon(attachment.file_type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.file_name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(attachment.file_size)}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(attachment.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Baixar"
                aria-label={`Baixar ${attachment.file_name}`}
                onClick={() => {
                  if (attachment.storage_path) {
                    // Demo: sem URL real assinada — download do blob fake não é
                    // possível; mantém o botão para o futuro link do Storage.
                    return;
                  }
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(attachment.id)}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                  title="Remover"
                  aria-label={`Remover ${attachment.file_name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {attachments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum anexo
          </p>
        )}
      </div>

      {/* Upload de arquivo */}
      {canEdit && (
        <div
          className={`relative rounded-lg border-2 border-dashed transition-colors ${
            isDragging
              ? "border-primary bg-primary/5 dark:bg-primary/10"
              : "border-border hover:border-foreground/40"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <label className="flex flex-col items-center justify-center gap-2 p-6 cursor-pointer">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Clique para selecionar ou arraste um arquivo
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, imagens, documentos, planilhas (até 10MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.zip,.rar"
            />
          </label>
        </div>
      )}
    </div>
  );
}
