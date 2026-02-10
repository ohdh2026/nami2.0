
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User as UserIcon, 
  Anchor, 
  Fuel, 
  Users as UsersIcon, 
  MessageSquare,
  Save,
  FileText
} from 'lucide-react';
import { User, Role, Ship, OperationLog } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';

interface LogEntryProps {
  currentUser: User;
  users: User[];
  ships: Ship[];
  onSave: (log: OperationLog) => void;
}

const LogEntry: React.FC<LogEntryProps> = ({ currentUser, users, ships, onSave }) => {
  const [formData, setFormData] = useState<Partial<OperationLog>>(() => getStorageItem('naminara_log_draft', {
    captainId: currentUser.id,
    captainName: currentUser.name,
    status: '임시저장',
    crewIds: [],
    crewNames: [],
  }));

  const engineers = users.filter(u => u.role === '기관장');
  const crews = users.filter(u => u.role === '승무원');

  useEffect(() => {
    setStorageItem('naminara_log_draft', formData);
  }, [formData]);

  const handleSetNow = (field: 'departureTime' | 'arrivalTime') => {
    setFormData(prev => ({ ...prev, [field]: new Date().toISOString() }));
  };

  const isFormComplete = !!(
    formData.shipName &&
    formData.departureTime &&
    formData.engineerId &&
    formData.passengerCount !== undefined &&
    formData.fuelStatus !== undefined &&
    formData.status === '완료' || (formData.status === '임시저장' && formData.shipName)
  );

  const canSubmit = !!(
    formData.shipName &&
    formData.departureTime &&
    formData.arrivalTime &&
    formData.engineerId &&
    formData.passengerCount !== undefined &&
    formData.fuelStatus !== undefined
  );

  const handleSubmit = (status: '임시저장' | '완료') => {
    const engineer = users.find(u => u.id === formData.engineerId);
    
    const finalLog: OperationLog = {
      id: formData.id || `log-${Date.now()}`,
      shipName: formData.shipName!,
      captainId: currentUser.id,
      captainName: currentUser.name,
      engineerId: formData.engineerId!,
      engineerName: engineer?.name || '미지정',
      crewIds: formData.crewIds || [],
      crewNames: formData.crewNames || [],
      departureTime: formData.departureTime!,
      arrivalTime: formData.arrivalTime,
      passengerCount: formData.passengerCount || 0,
      fuelStatus: formData.fuelStatus || 0,
      notes: formData.notes || '',
      status
    };

    onSave(finalLog);
    if (status === '완료') {
      alert('운항일지가 성공적으로 저장되었습니다!');
      localStorage.removeItem('naminara_log_draft');
      setFormData({
        captainId: currentUser.id,
        captainName: currentUser.name,
        status: '임시저장',
        crewIds: [],
        crewNames: [],
      });
    } else {
      alert('임시 저장되었습니다.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-6">
        
        {/* Ship Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Anchor size={16} className="text-sky-600" /> 선박 선택
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ships.map(ship => (
              <button
                key={ship.id}
                onClick={() => setFormData(p => ({ ...p, shipName: ship.name }))}
                className={`p-3 text-sm font-medium rounded-lg border transition-all ${
                  formData.shipName === ship.name 
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                }`}
              >
                {ship.name}
              </button>
            ))}
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Clock size={16} className="text-sky-600" /> 출발 날짜/시간
            </label>
            <div className="flex gap-2">
              <input 
                type="datetime-local" 
                className="flex-1 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
                value={formData.departureTime ? new Date(formData.departureTime).toISOString().slice(0, 16) : ''}
                onChange={e => setFormData(p => ({ ...p, departureTime: new Date(e.target.value).toISOString() }))}
              />
              <button 
                onClick={() => handleSetNow('departureTime')}
                className="px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg border border-sky-200 hover:bg-sky-100"
              >
                지금
              </button>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Clock size={16} className="text-sky-600" /> 도착 날짜/시간
            </label>
            <div className="flex gap-2">
              <input 
                type="datetime-local" 
                className="flex-1 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
                value={formData.arrivalTime ? new Date(formData.arrivalTime).toISOString().slice(0, 16) : ''}
                onChange={e => setFormData(p => ({ ...p, arrivalTime: new Date(e.target.value).toISOString() }))}
              />
              <button 
                onClick={() => handleSetNow('arrivalTime')}
                className="px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg border border-sky-200 hover:bg-sky-100"
              >
                지금
              </button>
            </div>
          </div>
        </div>

        {/* Personnel */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <UserIcon size={16} className="text-sky-600" /> 기관장 선택
            </label>
            <select 
              className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              value={formData.engineerId || ''}
              onChange={e => setFormData(p => ({ ...p, engineerId: e.target.value }))}
            >
              <option value="">기관장을 선택하세요</option>
              {engineers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <UserIcon size={16} className="text-sky-600" /> 승무원 선택
            </label>
            <select 
              className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              multiple
              value={formData.crewIds || []}
              onChange={e => {
                // Fixed: Typed the option parameter as HTMLOptionElement to resolve TypeScript 'unknown' type error
                const selectedIds = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                const selectedNames = crews.filter(u => selectedIds.includes(u.id)).map(u => u.name);
                setFormData(p => ({ ...p, crewIds: selectedIds, crewNames: selectedNames }));
              }}
            >
              {crews.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <p className="mt-1 text-xs text-slate-400">Ctrl/Cmd 누르고 다중 선택 가능</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <UsersIcon size={16} className="text-sky-600" /> 승선 인원 (명)
            </label>
            <input 
              type="number" 
              placeholder="0"
              className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              value={formData.passengerCount || ''}
              onChange={e => setFormData(p => ({ ...p, passengerCount: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Fuel size={16} className="text-sky-600" /> 잔여 유류 (%)
            </label>
            <input 
              type="number" 
              placeholder="0"
              className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              value={formData.fuelStatus || ''}
              onChange={e => setFormData(p => ({ ...p, fuelStatus: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <MessageSquare size={16} className="text-sky-600" /> 기타 특이사항 (메모)
          </label>
          <textarea 
            rows={3}
            placeholder="운항 중 특이사항을 입력하세요..."
            className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            value={formData.notes || ''}
            onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <button 
            onClick={() => handleSubmit('임시저장')}
            className="flex items-center justify-center gap-2 p-4 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
          >
            <FileText size={18} /> 임시 저장
          </button>
          <button 
            disabled={!canSubmit}
            onClick={() => handleSubmit('완료')}
            className={`
              flex items-center justify-center gap-2 p-4 text-sm font-bold text-white rounded-xl transition-all
              ${canSubmit ? 'bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-600/20' : 'bg-slate-300 cursor-not-allowed'}
            `}
          >
            <Save size={18} /> 최종 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogEntry;
