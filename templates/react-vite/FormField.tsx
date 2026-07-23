// FormField.tsx — Campo de formulário com validação
// Copiar e adaptar tipo, label e validação

interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'textarea'
  placeholder?: string
  error?: string
  required?: boolean
  value?: string
  onChange?: (value: string) => void
  rows?: number
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  required = false,
  value,
  onChange,
  rows,
}: FormFieldProps) {
  const id = `field-${name}`
  const errorId = `${id}-error`

  const baseClasses = `
    w-full px-3 py-2 text-sm rounded-md border bg-background text-foreground
    placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-error' : 'border-border'}
  `

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="text-error ml-1" aria-hidden="true">*</span>
        )}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          className={`${baseClasses} resize-y min-h-[80px]`}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          className={baseClasses}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
      )}

      {error && (
        <p id={errorId} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
