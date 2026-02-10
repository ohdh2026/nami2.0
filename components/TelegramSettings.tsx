
import React, { useState } from 'react';
import { TelegramConfig, User } from '../types';
import { Bot, Send, ShieldCheck, Users as UsersIcon, CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react';

interface TelegramSettingsProps {
  config: TelegramConfig;
  setConfig: React.Dispatch<React.SetStateAction<TelegramConfig>>;
  users: User[];
}

const TelegramSettings: React.FC<TelegramSettingsProps> = ({ config, setConfig, users }) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const telegramUsers = users.filter(u => !!u.telegramChatId);

  const handleTestConnection = () => {
    if (!config.botToken) {
      alert('먼저 봇 토큰을 입력해주세요.');
      return;
    }
    setTestStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    }, 1500);
  };

  const toggleRecipient = (userId: string) => {
    const next = [...config.selectedRecipientIds];
    const index = next.indexOf(userId);
    if (index > -1) next.splice(index, 1);
    else next.push(userId);
    setConfig(p => ({ ...p, selectedRecipientIds: next }));
  };

  const handleBroadcast = () => {
    if (!broadcastMessage) return;
    if (config.selectedRecipientIds.length === 0) {
      alert('메시지를 받을 수신자를 최소 한 명 선택해주세요.');
      return;
    }
    setIsSending(true);
    // Simulate sending broadcast
    setTimeout(() => {
      setIsSending(false);
      alert(`성공: ${config.selectedRecipientIds.length}명에게 메시지를 전송했습니다.`);
      setBroadcastMessage('');
    }, 2000);
  };

  const quickTemplates = [
    "운항 주의 바랍니다.",
   /* "기상 악화로 인한 대기 필요.",
      "즉시 보고 바랍니다.", */
    "가평나루 호출입니다.",
    "남이나루 이동하십시요.",
    "오늘 업무 종료입니다. 수고하셨습니다."
  ];

  return (
    <div className="space-y-8">
      {/* Bot Config Section */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <Bot className="text-sky-600" size={24} />
          <h2 className="text-lg font-bold text-slate-900">봇 API 관리</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Bot Token (API Key)</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                placeholder="712345678:AAF-..."
                className="flex-1 p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                value={config.botToken}
                onChange={e => setConfig(p => ({ ...p, botToken: e.target.value }))}
              />
              <button 
                onClick={handleTestConnection}
                className={`
                  px-6 py-2 text-sm font-bold rounded-xl transition-all border
                  ${testStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                    testStatus === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                    'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}
                `}
              >
                {testStatus === 'loading' ? '연결 중...' : 
                 testStatus === 'success' ? '연결 성공' : 
                 '연결 테스트'}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">BotFather로부터 발급받은 봇 토큰을 입력하세요.</p>
          </div>
        </div>
      </section>

      {/* Recipient Selection */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UsersIcon className="text-sky-600" size={24} />
            <h2 className="text-lg font-bold text-slate-900">수신자 선택</h2>
          </div>
          <span className="text-xs font-bold text-slate-400">Telegram 등록 회원 전용</span>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 sticky top-0 border-b">
              <tr>
                <th className="px-6 py-3 w-10">선택</th>
                <th className="px-6 py-3">이름</th>
                <th className="px-6 py-3">직책</th>
                <th className="px-6 py-3">ChatID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {telegramUsers.map(user => (
                <tr 
                  key={user.id} 
                  className={`hover:bg-sky-50 cursor-pointer transition-colors ${config.selectedRecipientIds.includes(user.id) ? 'bg-sky-50' : ''}`}
                  onClick={() => toggleRecipient(user.id)}
                >
                  <td className="px-6 py-4">
                    {config.selectedRecipientIds.includes(user.id) ? <CheckCircle2 className="text-sky-600" size={18} /> : <div className="w-[18px] h-[18px] border-2 rounded-full border-slate-200" />}
                  </td>
                  <td className="px-6 py-4 font-bold">{user.name}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{user.telegramChatId}</td>
                </tr>
              ))}
              {telegramUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    등록된 Telegram ChatID가 있는 회원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mass Messaging Section */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-sky-600" size={24} />
            <h2 className="text-lg font-bold text-slate-900">단체 메시지 발송</h2>
          </div>
          <p className="text-sm font-bold text-sky-600">수신 대상: {config.selectedRecipientIds.length}명</p>
        </div>

        <div className="space-y-4">
          <textarea 
            rows={4}
            placeholder="메시지 내용을 입력하세요..."
            className="w-full p-4 text-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-sky-500"
            value={broadcastMessage}
            onChange={e => setBroadcastMessage(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {quickTemplates.map((tmp, i) => (
              <button 
                key={i}
                onClick={() => setBroadcastMessage(tmp)}
                className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-sky-100 hover:text-sky-600 transition-colors"
              >
                {tmp}
              </button>
            ))}
          </div>

          <button 
            disabled={isSending || !broadcastMessage || config.selectedRecipientIds.length === 0}
            onClick={handleBroadcast}
            className={`
              w-full py-4 flex items-center justify-center gap-2 text-white font-bold rounded-2xl transition-all
              ${!isSending && broadcastMessage && config.selectedRecipientIds.length > 0 ? 'bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-600/20' : 'bg-slate-300 cursor-not-allowed'}
            `}
          >
            {isSending ? '전송 중...' : <><Send size={18} /> 선택된 인원에게 일괄 전송</>}
          </button>
        </div>
      </section>
    </div>
  );
};

export default TelegramSettings;
