
export type Role = '부분장' | '선장' | '기관장' | '승무원';

export interface User {
  id: string;
  name: string;
  role: Role;
  phone: string;
  telegramChatId: string;
  joinedDate: string;
}

export interface Ship {
  id: string;
  name: string;
  capacity: number;
}

export interface OperationLog {
  id: string;
  shipName: string;
  captainId: string;
  captainName: string;
  engineerId: string;
  engineerName: string;
  crewIds: string[];
  crewNames: string[];
  departureTime: string; // ISO string
  arrivalTime?: string; // ISO string
  passengerCount: number;
  fuelStatus: number;
  notes: string;
  status: '임시저장' | '완료';
}

export interface TelegramConfig {
  botToken: string;
  selectedRecipientIds: string[];
}
