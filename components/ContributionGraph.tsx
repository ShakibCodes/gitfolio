export default function ContributionGraph({ weeks }: { weeks: any[] }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-5xl mt-8 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Contribution Activity</h2>

      <div className="flex gap-1">
        {weeks.map((week: any[], i: number) => (
          <div key={i} className="flex flex-col gap-1">
            {week.map((day: any, j: number) => (
              <div
                key={j}
                title={`${day.date}: ${day.count} contributions`}
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor:
                    day.count === 0
                      ? "#ebedf0"
                      : day.count < 3
                      ? "#9be9a8"
                      : day.count < 6
                      ? "#40c463"
                      : day.count < 10
                      ? "#30a14e"
                      : "#216e39",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}