export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="rounded-2xl border border-coral-500/20 bg-coral-500/5 p-6 text-center">
      <p className="text-sm font-medium text-coral-500">{message}</p>
      {onRetry && (
        <button type="button" className="btn-ghost mt-3" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
