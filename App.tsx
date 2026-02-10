
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Anchor, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Plus
} from 'lucide-react';
import { User, Role, OperationLog, Ship, TelegramConfig } from './types';
import { INITIAL_USERS, generateMockLogs } from './mockData';
import { SHIPS, ROLES } from './constants';
import { getStorageItem, setStorageItem } from './utils/storage';

// Pages
import Dashboard from './components/Dashboard';
import MemberManagement from './components/MemberManagement';
import ShipManagement from './components/ShipManagement';
import LogEntry from './components/LogEntry';
import LogManagement from './components/LogManagement';
import TelegramSettings from './components/TelegramSettings';

const App: React.FC = () => {
  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => getStorageItem('naminara_users', INITIAL_USERS));
  const [ships, setShips] = useState<Ship[]>(() => getStorageItem('naminara_ships', SHIPS));
  const [logs, setLogs] = useState<OperationLog[]>(() => getStorageItem('naminara_logs', generateMockLogs(20)));
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => getStorageItem('naminara_telegram', { botToken: '', selectedRecipientIds: [] }));
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persistence
  useEffect(() => { setStorageItem('naminara_users', users); }, [users]);
  useEffect(() => { setStorageItem('naminara_ships', ships); }, [ships]);
  useEffect(() => { setStorageItem('naminara_logs', logs); }, [logs]);
  useEffect(() => { setStorageItem('naminara_telegram', telegramConfig); }, [telegramConfig]);

  // Auth Simulation (Auto-login for demo)
  useEffect(() => {
    if (!currentUser) setCurrentUser(users[0]);
  }, []);

  // Filter menu based on role
  const menuItems = useMemo(() => {
    const allItems = [
      { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, roles: ['관리자'] },
      { id: 'log-entry', label: '운항일지 작성', icon: ClipboardList, roles: ['관리자', '선장', '기관장'] },
      { id: 'log-management', label: '운항일지 관리', icon: ClipboardList, roles: ['관리자', '선장'] },
      { id: 'members', label: '회원 관리', icon: Users, roles: ['관리자'] },
      { id: 'ships', label: '선박 정보 관리', icon: Anchor, roles: ['관리자'] },
      { id: 'telegram', label: 'Telegram 설정', icon: Settings, roles: ['관리자'] },
    ];

    if (!currentUser) return [];
    
    // Phase 5: Captain only sees log-entry and their own logs
    const filtered = allItems.filter(item => item.roles.includes(currentUser.role));
    
    return filtered;
  }, [currentUser]);

  // Handle Log Out
  const handleLogout = () => {
    // For demo, just switch to the next user
    const currentIndex = users.findIndex(u => u.id === currentUser?.id);
    const nextIndex = (currentIndex + 1) % users.length;
    setCurrentUser(users[nextIndex]);
    setActiveTab(users[nextIndex].role === '선장' ? 'log-entry' : 'dashboard');
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard logs={logs} ships={ships} setActiveTab={setActiveTab} />;
      case 'log-entry':
        return <LogEntry 
          currentUser={currentUser} 
          users={users} 
          ships={ships} 
          onSave={(log) => setLogs(prev => [log, ...prev])} 
        />;
      case 'log-management':
        return <LogManagement 
          logs={currentUser.role === '선장' ? logs.filter(l => l.captainId === currentUser.id) : logs} 
          users={users}
          ships={ships}
        />;
      case 'members':
        return <MemberManagement users={users} setUsers={setUsers} />;
      case 'ships':
        return <ShipManagement ships={ships} setShips={setShips} />;
      case 'telegram':
        return <TelegramSettings config={telegramConfig} setConfig={setTelegramConfig} users={users} />;
      default:
        return <Dashboard logs={logs} ships={ships} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Anchor className="text-sky-500" size={24} />
              <span className="text-lg font-bold">남이섬 Ferry</span>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors
                  ${activeTab === item.id ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-lg bg-slate-800/50">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-500/20 text-sky-400">
                <UserIcon size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{currentUser?.name}</p>
                <p className="text-xs text-slate-400">{currentUser?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center w-full gap-3 px-4 py-2 text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">역할 전환 (로그아웃)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 lg:px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-900">
              {menuItems.find(i => i.id === activeTab)?.label || '시스템'}
            </h1>
          </div>
          <div className="text-xs font-medium text-slate-500 hidden sm:block">
            나미나라공화국 운항 관리 시스템 (v1.2)
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
