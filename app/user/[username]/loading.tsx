export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-neutral-50 p-6 animate-pulse">
      
      {/* Profile Skeleton */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md text-center mb-8">
        <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200" />
        <div className="h-6 bg-gray-200 rounded w-40 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-4" />
        <div className="flex justify-center gap-6 mt-4">
          <div className="h-8 w-12 bg-gray-200 rounded" />
          <div className="h-8 w-12 bg-gray-200 rounded" />
          <div className="h-8 w-12 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Stats + Repo Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white shadow-md rounded-2xl p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        ))}
      </div>

      {/* Heatmap Skeleton */}
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-5xl mt-8">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="flex gap-1 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="w-3 h-3 bg-gray-200 rounded-sm" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}