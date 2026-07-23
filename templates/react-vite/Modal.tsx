// Modal.tsx — Modal reutilizável com focus trap
// Copiar e adaptar conteúdo e tamanho

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={`${sizeClasses[size]} rounded-lg border border-border bg-background shadow-lg p-0`}
      onClose={onClose}
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 id="modal-title" className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  )
}
