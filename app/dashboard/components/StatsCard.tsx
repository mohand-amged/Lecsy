interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="bg-black rounded-xl shadow-xl p-6 border border-gray-700 hover:bg-gray-900 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className="text-gray-400 group-hover:text-white transition-colors group-hover:scale-110 transform duration-200">
          {icon}
        </div>
      </div>
    </div>
  );
}