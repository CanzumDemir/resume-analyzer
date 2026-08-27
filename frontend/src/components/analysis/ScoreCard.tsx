type ScoreCardProps = {
  title: string;
  score: number;
};

export default function ScoreCard({
  title,
  score,
}: ScoreCardProps) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-400">
          {title}
        </h2>

        <span className="text-3xl font-bold text-white">
          {score}
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{
            width: `${score}%`,
          }}
        />
      </div>

      <p className="mt-2 text-right text-xs text-gray-500">
        {score} / 100
      </p>
    </div>
  );
}