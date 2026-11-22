export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-ink-700/70" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-mint-500/30 border-t-mint-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
