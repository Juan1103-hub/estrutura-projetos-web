// error.tsx — Error boundary
// Copiar para qualquer pasta de rota

'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-error/10 mb-4">
        <span className="text-2xl" role="img" aria-hidden="true">
          ⚠️
        </span>
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">
        Algo deu errado
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 min-h-[44px]"
      >
        Tentar novamente
      </button>
    </div>
  )
}
