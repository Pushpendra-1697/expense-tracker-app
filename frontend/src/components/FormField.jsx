export default function FormField({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  children,
  className = '',
}) {
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={`field ${className}`.trim()}>
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
          {required && (
            <span className="text-coral-500" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
