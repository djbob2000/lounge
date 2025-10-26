export default function LoadingSkeleton() {
  return (
    <div className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
        </div>

        <div className="h-8 bg-muted rounded w-64 mb-4 animate-pulse" />
        <div className="h-4 bg-muted rounded w-96 mb-8 animate-pulse" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            'placeholder-1',
            'placeholder-2',
            'placeholder-3',
            'placeholder-4',
            'placeholder-5',
            'placeholder-6',
            'placeholder-7',
            'placeholder-8',
          ].map((key) => (
            <div key={key} className="aspect-square bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
