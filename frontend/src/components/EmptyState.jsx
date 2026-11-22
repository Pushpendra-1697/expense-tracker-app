export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-900/15 bg-white/40 px-6 py-12 text-center">
      <h3 className="font-display text-xl text-ink-900">{title}</h3>
      {description && <p className="max-w-md text-sm text-ink-700/70">{description}</p>}
      {action}
    </div>
  );
}
