
import React from 'react';
import { Ship, OperationLog } from '../types';
import { Anchor, ClipboardList, Fuel, Users as UsersIcon, ArrowRight } from 'lucide-react';

interface DashboardProps {
  logs: OperationLog[];
  ships: Ship[];
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, ships, setActiveTab }) => {
  // Phase 3.6: Logic for "Currently Operating"
  const operatingLogs = logs.filter(log => log.departureTime && !log.arrivalTime);
  
  const stats = [
    { label: '전체 선박', value: ships.length, icon: Anchor, color: 'text-sky-600', bg: 'bg-sky-100' },
    { label: '운항 중', value: operatingLogs.length, icon: Fuel, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '금일 운항 횟수', value: logs.filter(l => new Date(l.departureTime).toDateString() === new Date().toDateString()).length, icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: '총 승선 인원', value: logs.reduce((acc, curr) => acc + curr.passengerCount, 0).toLocaleString(), icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Operating Ships */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">실시간 운항 현황</h2>
          <span className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full animate-pulse">LIVE</span>
        </div>
        
        {operatingLogs.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-xl">
            <Anchor className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-500">현재 운항 중인 선박이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {operatingLogs.map((log) => (
              <div 
                key={log.id} 
                className="group p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-sky-500 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setActiveTab('log-management')}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{log.shipName}</h3>
                    <p className="text-sm text-slate-500">선장: {log.captainName}</p>
                  </div>
                  <div className="px-3 py-1 text-xs font-bold text-white bg-sky-600 rounded-full">운항 중</div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">출발 시각</span>
                    <span className="font-medium">{new Date(log.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">승선 인원</span>
                    <span className="font-medium">{log.passengerCount}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">잔여 유류</span>
                    <span className="font-medium">{log.fuelStatus}%</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center text-sky-600 font-medium group-hover:gap-2 transition-all">
                  운항일지로 이동 <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
