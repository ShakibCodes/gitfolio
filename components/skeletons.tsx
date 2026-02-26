export function CardSkeleton() {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
    </div>
  );
}

export function RepoSkeleton() {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-3 bg-gray-200 rounded w-full" />
        </div>
      ))}
    </div>
  );
}

export function HeatmapSkeleton() {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
      <div className="flex gap-1">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="w-3 h-3 bg-gray-200 rounded-sm" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}