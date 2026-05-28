import { FirebaseConfig } from '../firebase';

export interface Asset {
  id: string;
  name: string;
  imageUrl: string;
  receivedDate: string;
  source: string;
  location: string;
  department: string;
  responsiblePerson: string;
  note: string;
  status: 'ใช้งานได้' | 'รอจำหน่าย' | 'ชำรุด' | 'ขอป้ายรหัสใหม่' | 'รอโอน' | 'อื่นๆ';
  createdAt: string;
  updatedAt: string;
}

export interface AuditTrail {
  id: string;
  assetId: string;
  assetName: string;
  action: 'create' | 'edit' | 'dispose' | 'transfer' | 'repair_open' | 'repair_send' | 'repair_receive' | 'survey';
  operator: string;
  timestamp: string;
  changes?: {
    [field: string]: { old: any; new: any };
  };
  details: string;
}

export interface SurveyRecord {
  id: string;
  assetId: string;
  status: string;
  imageUrl?: string;
  operator: string;
  timestamp: string;
}

export interface RepairCase {
  id: string;
  assetId: string;
  assetName: string;
  symptom: string;
  symptomImageUrl?: string;
  dateOpened: string;
  dateSent?: string;
  sentProofUrl?: string;
  repairCompany?: string;
  contactPerson?: string;
  dateReceived?: string;
  receivedProofUrl?: string;
  status: 'open' | 'sent' | 'completed';
  operator: string;
  updatedAt: string;
}

export const INITIAL_ASSETS: Asset[] = [
  {
    id: "6901-001-0001",
    name: "คอมพิวเตอร์ All-in-One Dell Inspiron 5415",
    imageUrl: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=60",
    receivedDate: "2024-05-10",
    source: "เงินงบประมาณแผ่นดินปี 2567",
    location: "ห้องทำงานไอที ชั้น 3",
    department: "ฝ่ายเทคโนโลยีสารสนเทศ",
    responsiblePerson: "นายสมชาย ใจดี",
    note: "ใช้งานทั่วไปในสำนักงาน รหัสครุภัณฑ์หลักของกลุ่มงานพัฒนาเว็บบอร์ด",
    status: "ใช้งานได้",
    createdAt: "2024-05-10T09:00:00.000Z",
    updatedAt: "2024-05-10T09:00:00.000Z"
  },
  {
    id: "6901-001-0002",
    name: "เครื่องปรับอากาศ Daikin Inverter 18,000 BTU",
    imageUrl: "https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=600&auto=format&fit=crop&q=60",
    receivedDate: "2023-03-15",
    source: "เงินงบประมาณแผ่นดินปี 2566",
    location: "ห้องประชุมใหญ่ ชั้น 4",
    department: "ฝ่ายบริหารทั่วไป",
    responsiblePerson: "นางสาวศิริพร บุญพรม",
    note: "บำรุงรักษาล่าสุดเมื่อวันที่ 12 ธ.ค. 2568",
    status: "ใช้งานได้",
    createdAt: "2023-03-15T10:30:00.000Z",
    updatedAt: "2023-03-15T10:30:00.000Z"
  },
  {
    id: "6901-002-0015",
    name: "เก้าอี้ทำงานเพื่อสุขภาพ Ergonomic Steelcase Gesture",
    imageUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=60",
    receivedDate: "2025-01-20",
    source: "เงินรายได้สะสมหน่วยงาน",
    location: "ห้องผู้อำนวยการ ชั้น 5",
    department: "ฝ่ายบริหารทั่วไป",
    responsiblePerson: "ดร.วิชัย รักษ์ดี",
    note: "เบาะหุ้มผ้าสีเทา โครงพลาสติกดำ ปรับระดับได้ทุกทิศทาง",
    status: "ใช้งานได้",
    createdAt: "2025-01-20T08:15:00.000Z",
    updatedAt: "2025-01-20T08:15:00.000Z"
  },
  {
    id: "6901-003-0044",
    name: "เครื่องพิมพ์เลเซอร์มัลติฟังก์ชัน HP LaserJet Enterprise",
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=60",
    receivedDate: "2022-11-05",
    source: "เงินงบประมาณแผ่นดินปี 2565",
    location: "ห้องธุรการ ชั้น 2",
    department: "ฝ่ายธุรการและสารบรรณ",
    responsiblePerson: "นางมณีรัตน์ เรียนรู้",
    note: "มีอาการกระดาษติดบ่อยครั้ง รอการตรวจซ่อมอย่างเป็นทางการ",
    status: "ชำรุด",
    createdAt: "2022-11-05T14:20:00.000Z",
    updatedAt: "2022-11-05T14:20:00.000Z"
  },
  {
    id: "6901-004-0010",
    name: "โต๊ะทำงานไม้สักทอง 4 ลิ้นชัก",
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=60",
    receivedDate: "2018-06-01",
    source: "บริจาคโดย ศิษย์เก่าสมาคม",
    location: "ห้องเก็บของ ชั้น 1",
    department: "ฝ่ายบริหารทั่วไป",
    responsiblePerson: "นายสมชาย ใจดี",
    note: "สภาพเก่ามาก กุญแจลิ้นชักหาย ขาโต๊ะชำรุดผุพัง รอเสนอจำหน่ายออกจากคลัง",
    status: "รอจำหน่าย",
    createdAt: "2018-06-01T09:00:00.000Z",
    updatedAt: "2026-05-28T09:00:00.000Z"
  }
];

export const INITIAL_AUDITS: AuditTrail[] = [
  {
    id: "audit-1",
    assetId: "6901-001-0001",
    assetName: "คอมพิวเตอร์ All-in-One Dell Inspiron 5415",
    action: "create",
    operator: "แอดมิน สมชาย",
    timestamp: "2024-05-10T09:00:00.000Z",
    details: "ลงทะเบียนครุภัณฑ์ใหม่เข้าสู่ฐานข้อมูล"
  },
  {
    id: "audit-2",
    assetId: "6901-004-0010",
    assetName: "โต๊ะทำงานไม้สักทอง 4 ลิ้นชัก",
    action: "edit",
    operator: "หัวหน้าฝ่าย บริหาร",
    timestamp: "2026-05-28T09:00:00.000Z",
    changes: {
      status: { old: "ใช้งานได้", new: "รอจำหน่าย" },
      location: { old: "ห้องธุรการ ชั้น 2", new: "ห้องเก็บของ ชั้น 1" }
    },
    details: "เปลี่ยนสถานะครุภัณฑ์เป็น รอจำหน่าย และย้ายสถานที่จัดเก็บไปยังห้องเก็บของเนื่องจากโครงสร้างเสื่อมสภาพ"
  }
];

export const INITIAL_REPAIRS: RepairCase[] = [
  {
    id: "rep-20260528-001",
    assetId: "6901-003-0044",
    assetName: "เครื่องพิมพ์เลเซอร์มัลติฟังก์ชัน HP LaserJet Enterprise",
    symptom: "ลูกยางดึงกระดาษเสื่อมสภาพ ดึงกระดาษเบี้ยวและกระดาษติดเกือบทุกครั้งที่สั่งพิมพ์มากกว่า 5 แผ่น",
    symptomImageUrl: "https://images.unsplash.com/photo-1563168817-21a415a774b7?w=600&auto=format&fit=crop&q=60",
    dateOpened: "2026-05-28",
    status: "open",
    operator: "สมชาย ผู้แจ้ง",
    updatedAt: "2026-05-28T15:00:00.000Z"
  }
];
export const INITIAL_SURVEYS: SurveyRecord[] = [];
