"use client";

import { useState } from "react";
import { CommentWithUser } from "@/types/comment";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send } from "lucide-react";

interface TaskCommentsSectionProps {
  comments: CommentWithUser[];
  onAdd?: (content: string) => void;
  canComment?: boolean;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

export function TaskCommentsSection({ comments, onAdd, canComment = false }: TaskCommentsSectionProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim() || !onAdd) return;
    onAdd(newComment.trim());
    setNewComment("");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">
        Comentários ({comments.length})
      </h3>

      {/* Lista de comentários */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-teal-600 to-slate-700 text-white text-xs">
                {getInitials(comment.user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{comment.user.full_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              <div className="text-sm text-foreground whitespace-pre-wrap">
                {comment.content}
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum comentário ainda
          </p>
        )}
      </div>

      {/* Adicionar comentário */}
      {canComment && (
        <div className="space-y-2 pt-2 border-t border-border">
          <Textarea
            placeholder="Escrever um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="min-h-20 resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Ctrl+Enter para enviar
            </span>
            <Button onClick={handleSubmit} size="sm" disabled={!newComment.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Comentar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
