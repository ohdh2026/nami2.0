
import { User, OperationLog } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: '홍길동', role: '관리자', phone: '010-1234-5678', telegramChatId: '12345678', joinedDate: '2023-01-01' },
  { id: 'u2', name: '김선장', role: '선장', phone: '010-2222-3333', telegramChatId: '87654321', joinedDate: '2023-02-15' },
  { id: 'u3', name: '이기관', role: '기관장', phone: '010-4444-5555', telegramChatId: '11223344', joinedDate: '2023-03-10' },
  { id: 'u4', name: '박승무', role: '승무원', phone: '010-6666-7777', telegramChatId: '44332211', joinedDate: '2023-04-05' },
  { id: 'u5', name: '최선장', role: '선장', phone: '010-8888-9999', telegramChatId: '99887766', joinedDate: '2023-05-20' },
  { id: 'u6', name: '정기관', role: '기관장', phone: '010-1111-2222', telegramChatId: '55667788', joinedDate: '2023-06-15' },
];

export const generateMockLogs = (count: number): OperationLog[] => {
  const logs: OperationLog[] = [];
  const ships = ["탐나라호", "아일래나호", "가우디호", "인어공주호"];
  
  for (let i = 0; i < count; i++) {
    const isCompleted = Math.random() > 0.2;
    const departure = new Date();
    departure.setDate(departure.getDate() - Math.floor(Math.random() * 30));
    departure.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
    
    const arrival = new Date(departure);
    arrival.setMinutes(45 + Math.floor(Math.random() * 30));

    logs.push({
      id: `log-${i}`,
      shipName: ships[Math.floor(Math.random() * ships.length)],
      captainId: 'u2',
      captainName: '김선장',
      engineerId: 'u3',
      engineerName: '이기관',
      crewIds: ['u4'],
      crewNames: ['박승무'],
      departureTime: departure.toISOString(),
      arrivalTime: isCompleted ? arrival.toISOString() : undefined,
      passengerCount: Math.floor(Math.random() * 100) + 10,
      fuelStatus: Math.floor(Math.random() * 100),
      notes: i % 5 === 0 ? "특이사항 없음" : "정상 운항",
      status: isCompleted ? '완료' : '임시저장'
    });
  }
  return logs;
};
