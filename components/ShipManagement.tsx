
import React, { useState } from 'react';
import { Ship } from '../types';
import { Anchor, Plus, Edit, Trash2, X } from 'lucide-react';

interface ShipManagementProps {
  ships: Ship[];
  setShips: React.Dispatch<React.SetStateAction<Ship[]>>;
}

const ShipManagement: React.FC<ShipManagementProps> = ({ ships, setShips }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShip, setEditingShip] = useState<Partial<Ship> | null>(null);

  const handleSaveShip = () => {
    if (!editingShip?.name || !editingShip?.capacity) {
      alert('선박명과 정원을 입력해주세요.');
      return;
    }

    if (editingShip.id) {
      setShips(prev => prev.map(s => s.id === editingShip.id ? (editingShip as Ship) : s));
    } else {
      const newShip: Ship = {
        id: `ship-${Date.now()}`,
        name: editingShip.name!,
        capacity: Number(editingShip.capacity)
      };
      setShips(prev => [...prev, newShip]);
    }
    setIsModalOpen(false);
    setEditingShip(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => { setEditingShip({}); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-all shadow-md shadow-sky-600/20"
        >
          <Plus size={18} /> 신규 선박 추가
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {ships.map(ship => (
          <div key={ship.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Anchor className="text-sky-600" size={20} />
                <h3 className="font-bold text-slate-900">{ship.name}</h3>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => { setEditingShip(ship); setIsModalOpen(true); }}
                  className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => { if(confirm('정말 삭제하시겠습니까?')) setShips(prev => prev.filter(s => s.id !== ship.id)); }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 flex-1">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">최대 정원</p>
                <p className="text-3xl font-bold text-slate-900">{ship.capacity}<span className="text-sm font-normal text-slate-500 ml-1">명</span></p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">운영 안정성</span>
                  <span className="text-emerald-600 font-bold">정상 (초록)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[60%]" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button className="w-full py-2 text-sm font-bold text-sky-600 hover:bg-sky-50 rounded-lg transition-all">
                인력 배정 현황 확인
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ship Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingShip?.id ? '선박 정보 수정' : '신규 선박 등록'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">선박명</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-sky-500"
                  value={editingShip?.name || ''}
                  onChange={e => setEditingShip(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">최대 정원 (명)</label>
                <input 
                  type="number" 
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-sky-500"
                  value={editingShip?.capacity || ''}
                  onChange={e => setEditingShip(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 p-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  취소
                </button>
                <button 
                  onClick={handleSaveShip}
                  className="flex-1 p-3 font-bold text-white bg-sky-600 rounded-xl hover:bg-sky-700"
                >
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipManagement;
