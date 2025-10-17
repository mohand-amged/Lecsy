interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700/50 hover:bg-gray-800/70 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className="text-blue-400 group-hover:text-blue-300 transition-colors group-hover:scale-110 transform duration-200">
          {icon}
        </div>
      </div>
    </div>
  );
}