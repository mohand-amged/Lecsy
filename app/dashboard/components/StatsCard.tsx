'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="relative overflow-hidden bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700 hover:border-gray-500 transition-all duration-500 group hover:scale-105 hover:shadow-xl">
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-400 group-hover:text-gray-200 transition-colors duration-300 mb-2">{title}</p>
          <p className="text-4xl font-black text-white transition-all duration-300">{value}</p>
        </div>
        <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transform transition-all duration-300">
          <div className="text-black">
            {icon}
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </div>
  );
}
