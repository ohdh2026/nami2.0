
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Printer, 
  ChevronRight, 
  CheckSquare, 
  Square,
  X,
  Calendar
} from 'lucide-react';
import { OperationLog, User, Ship } from '../types';
import * as XLSX from 'xlsx';

interface LogManagementProps {
  logs: OperationLog[];
  users: User[];
  ships: Ship[];
}

const LogManagement: React.FC<LogManagementProps> = ({ logs, users, ships }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShip, setSelectedShip] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [detailLog, setDetailLog] = useState<OperationLog | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDate, setPrintDate] = useState(new Date().toISOString().split('T')[0]);

  // Filtering
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.captainName.includes(searchTerm) || log.shipName.includes(searchTerm);
      const matchesShip = selectedShip ? log.shipName === selectedShip : true;
      const matchesDate = selectedDate ? new Date(log.departureTime).toDateString() === new Date(selectedDate).toDateString() : true;
      return matchesSearch && matchesShip && matchesDate;
    });
  }, [logs, searchTerm, selectedShip, selectedDate]);

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedLogs.size === filteredLogs.length) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(filteredLogs.map(l => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedLogs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLogs(next);
  };

  // Excel Export
  const exportToExcel = () => {
    const dataToExport = logs.filter(l => selectedLogs.has(l.id)).map(l => ({
      '운항날짜': new Date(l.departureTime).toLocaleDateString(),
      '페리명': l.ferryName,
      '선장': l.captainName,
      '기관장': l.engineerName,
      '승무원': l.crewNames.join(', '),
      '출발시간': new Date(l.departureTime).toLocaleTimeString(),
      '도착시간': l.arrivalTime ? new Date(l.arrivalTime).toLocaleTimeString() : '운항중',
      '승선인원': l.passengerCount,
      '유류현황': `${l.fuelStatus}%`,
      '특이사항': l.notes,
      '상태': l.status
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "운항일지");
    XLSX.writeFile(wb, `운항일지추출_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Print Logic
  const handlePrint = () => {
    const logsToPrint = logs.filter(l => new Date(l.departureTime).toDateString() === new Date(printDate).toDateString());
    if (logsToPrint.length === 0) {
      alert('선택한 날짜의 운항 기록이 없습니다.');
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 p-4 bg-white border border-slate-200 rounded-xl lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="선장 또는 선박명 검색..." 
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="p-2 text-sm border border-slate-200 rounded-lg bg-white"
          value={selectedShip}
          onChange={e => setSelectedShip(e.target.value)}
        >
          <option value="">모든 선박</option>
          {ships.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
        <input 
          type="date" 
          className="p-2 text-sm border border-slate-200 rounded-lg"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
        <div className="flex gap-2">
          <button 
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            <Printer size={18} /> 운항일지 출력
          </button>
          <button 
            disabled={selectedLogs.size === 0}
            onClick={exportToExcel}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg transition-all
              ${selectedLogs.size > 0 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 cursor-not-allowed'}
            `}
          >
            <FileSpreadsheet size={18} /> Excel 추출 {selectedLogs.size > 0 && `(${selectedLogs.size})`}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">
                <button onClick={toggleSelectAll}>
                  {selectedLogs.size === filteredLogs.length && filteredLogs.length > 0 ? <CheckSquare className="text-sky-600" size={18} /> : <Square size={18} />}
                </button>
              </th>
              <th className="px-6 py-4">운항 일자</th>
              <th className="px-6 py-4">선박</th>
              <th className="px-6 py-4">선장</th>
              <th className="px-6 py-4">인원</th>
              <th className="px-6 py-4">시간 (출/도)</th>
              <th className="px-6 py-4">상태</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map(log => (
              <tr 
                key={log.id} 
                className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedLogs.has(log.id) ? 'bg-sky-50' : ''}`}
                onClick={() => setDetailLog(log)}
              >
                <td className="px-6 py-4" onClick={(e) => { e.stopPropagation(); toggleSelect(log.id); }}>
                  {selectedLogs.has(log.id) ? <CheckSquare className="text-sky-600" size={18} /> : <Square size={18} />}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(log.departureTime).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-bold">{log.shipName}</td>
                <td className="px-6 py-4">{log.captainName}</td>
                <td className="px-6 py-4">{log.passengerCount}명</td>
                <td className="px-6 py-4 text-xs">
                  {new Date(log.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ~ <br/>
                  {log.arrivalTime ? new Date(log.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-sky-600 font-bold">운항중</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.status === '완료' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <ChevronRight size={18} className="text-slate-300" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Slide-over Modal */}
      {detailLog && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDetailLog(null)} />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl animate-slide-in p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              <h2 className="text-xl font-bold">운항일지 상세 정보</h2>
              <button onClick={() => setDetailLog(null)} className="p-2 rounded-full hover:bg-slate-100">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">운항 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">선박명</p>
                    <p className="font-bold">{detailLog.shipName}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">운항 상태</p>
                    <p className={`font-bold ${detailLog.status === '완료' ? 'text-emerald-600' : 'text-amber-600'}`}>{detailLog.status}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">일시 및 시간</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 border border-slate-100 rounded-lg">
                    <span className="text-slate-500">출발 시각</span>
                    <span className="font-medium">{new Date(detailLog.departureTime).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 border border-slate-100 rounded-lg">
                    <span className="text-slate-500">도착 시각</span>
                    <span className="font-medium">{detailLog.arrivalTime ? new Date(detailLog.arrivalTime).toLocaleString() : '운항중'}</span>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">인력 구성</h3>
                <div className="divide-y border border-slate-100 rounded-lg">
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-500">선장</span>
                    <span className="font-bold">{detailLog.captainName}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-500">기관장</span>
                    <span className="font-bold">{detailLog.engineerName}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-500">승무원</span>
                    <span className="font-medium">{detailLog.crewNames.join(', ') || '없음'}</span>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">운항 상세</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-sky-50 text-sky-700 rounded-lg">
                    <p className="text-xs">승선 인원</p>
                    <p className="text-lg font-bold">{detailLog.passengerCount}명</p>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-lg">
                    <p className="text-xs">잔여 유류</p>
                    <p className="text-lg font-bold">{detailLog.fuelStatus}%</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">특이사항 (메모)</h3>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm min-h-[100px]">
                  {detailLog.notes || '입력된 메모가 없습니다.'}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Print Date Selection Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsPrintModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-sky-600" /> 출력 날짜 선택
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-500 block mb-1">보고서 날짜</label>
                <input 
                  type="date" 
                  className="w-full p-3 border rounded-xl"
                  value={printDate}
                  onChange={e => setPrintDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setIsPrintModalOpen(false)}
                  className="flex-1 p-3 text-sm font-bold bg-slate-100 rounded-xl"
                >
                  취소
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex-1 p-3 text-sm font-bold bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-600/20"
                >
                  출력하기 (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print View Component (Hidden in screen, shown in print) */}
      <div className="print-only p-8 bg-white text-black min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">운항 일계표 (나미나라공화국)</h1>
          <p className="text-slate-600">보고 일자: {printDate}</p>
        </div>
        
        <table className="w-full border-collapse border border-slate-800 text-sm mb-12">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-800 p-2">선박명</th>
              <th className="border border-slate-800 p-2">선장/기관장</th>
              <th className="border border-slate-800 p-2">출발/도착 시간</th>
              <th className="border border-slate-800 p-2">인원</th>
              <th className="border border-slate-800 p-2">유류</th>
              <th className="border border-slate-800 p-2">특이사항</th>
            </tr>
          </thead>
          <tbody>
            {logs.filter(l => new Date(l.departureTime).toDateString() === new Date(printDate).toDateString()).map(l => (
              <tr key={l.id}>
                <td className="border border-slate-800 p-2 font-bold">{l.shipName}</td>
                <td className="border border-slate-800 p-2">{l.captainName} / {l.engineerName}</td>
                <td className="border border-slate-800 p-2">
                  {new Date(l.departureTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ~ <br/>
                  {l.arrivalTime ? new Date(l.arrivalTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '운항중'}
                </td>
                <td className="border border-slate-800 p-2 text-center">{l.passengerCount}명</td>
                <td className="border border-slate-800 p-2 text-center">{l.fuelStatus}%</td>
                <td className="border border-slate-800 p-2">{l.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end gap-12 mt-12 px-8">
          <div className="text-center w-24">
            <div className="h-20 border border-slate-800 mb-2"></div>
            <span className="text-xs font-bold">담당</span>
          </div>
          <div className="text-center w-24">
            <div className="h-20 border border-slate-800 mb-2"></div>
            <span className="text-xs font-bold">승인</span>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-slate-200 text-center text-xs text-slate-500">
          (주)남이섬 나미나라공화국 운항 관리 시스템 공식 리포트
        </div>
      </div>
    </div>
  );
};

export default LogManagement;
