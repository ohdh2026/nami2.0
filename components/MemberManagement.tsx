
import React, { useState } from 'react';
import { 
  UserPlus, 
  Trash2, 
  Edit, 
  Search, 
  Shield, 
  Anchor, 
  Wrench, 
  User as UserIcon,
  MessageCircle,
  HelpCircle,
  X,
  Save
} from 'lucide-react';
import { User, Role } from '../types';
import { ROLES } from '../constants';

interface MemberManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const MemberManagement: React.FC<MemberManagementProps> = ({ users, setUsers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getRoleIcon = (role: Role) => {
    switch(role) {
      case '관리자': return <Shield className="text-rose-500" size={16} />;
      case '선장': return <Anchor className="text-sky-500" size={16} />;
      case '기관장': return <Wrench className="text-amber-500" size={16} />;
      default: return <UserIcon className="text-slate-400" size={16} />;
    }
  };

  const handleSaveUser = () => {
    if (!editingUser?.name || !editingUser?.role) {
      alert('이름과 직책을 입력해주세요.');
      return;
    }

    if (editingUser.id) {
      // Edit
      setUsers(prev => prev.map(u => u.id === editingUser.id ? (editingUser as User) : u));
    } else {
      // Create
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: editingUser.name!,
        role: editingUser.role as Role,
        phone: editingUser.phone || '',
        telegramChatId: editingUser.telegramChatId || '',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const filteredUsers = users.filter(u => 
    u.name.includes(searchTerm) || u.role.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="회원 이름 또는 직책 검색..." 
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setEditingUser({ role: '승무원' }); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-all shadow-md shadow-sky-600/20"
        >
          <UserPlus size={18} /> 신규 회원 추가
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">이름</th>
              <th className="px-6 py-4">직책</th>
              <th className="px-6 py-4">연락처</th>
              <th className="px-6 py-4">Telegram ID</th>
              <th className="px-6 py-4">가입일</th>
              <th className="px-6 py-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <span className="font-medium">{user.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{user.phone}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sky-600">
                    <MessageCircle size={14} />
                    <span className="font-mono text-xs">{user.telegramChatId || '-'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{user.joinedDate}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                      className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => { if(confirm('정말 삭제하시겠습니까?')) setUsers(prev => prev.filter(u => u.id !== user.id)); }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingUser?.id ? '회원 정보 수정' : '신규 회원 등록'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">이름</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-sky-500"
                  value={editingUser?.name || ''}
                  onChange={e => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">직책 (권한)</label>
                <select 
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-sky-500 bg-white"
                  value={editingUser?.role || ''}
                  onChange={e => setEditingUser(prev => ({ ...prev, role: e.target.value as Role }))}
                >
                  {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">연락처</label>
                <input 
                  type="tel" 
                  placeholder="010-0000-0000"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-sky-500"
                  value={editingUser?.phone || ''}
                  onChange={e => setEditingUser(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-700 block">Telegram ChatID</label>
                  <div className="group relative">
                    <HelpCircle size={14} className="text-slate-400 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded hidden group-hover:block z-10">
                      Telegram에서 @userinfobot을 통해 확인 가능합니다. (숫자 형태)
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <MessageCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="숫자만 입력"
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500"
                    value={editingUser?.telegramChatId || ''}
                    onChange={e => setEditingUser(prev => ({ ...prev, telegramChatId: e.target.value.replace(/[^0-9]/g, '') }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 p-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  취소
                </button>
                <button 
                  onClick={handleSaveUser}
                  className="flex-1 p-3 font-bold text-white bg-sky-600 rounded-xl hover:bg-sky-700 shadow-lg shadow-sky-600/20"
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

export default MemberManagement;
