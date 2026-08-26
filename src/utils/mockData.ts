import { FirebaseConfig } from '../firebase';
import { BLOOD_BAG_ASSETS } from './bloodBagAssetsData';

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
  createdBy?: string;
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
  roundId: string; // Link to active survey round
  status: string;
  imageUrl?: string;
  operator: string;
  timestamp: string;
}

export interface DepartmentSignoff {
  department: string;
  signedBy: string;
  signedAt: string;
  status: 'pending' | 'signed';
  surveyedAssets: number;
  totalAssets: number;
}

export interface SurveyRound {
  id: string;
  name: string;
  dateCreated: string;
  dateClosed?: string;
  status: 'active' | 'closed';
  totalAssets: number;
  surveyedAssets: number;
  completionRate: number;
  statusBreakdown: {
    'ใช้งานได้': number;
    'ชำรุด': number;
    'รอจำหน่าย': number;
    'ขอป้ายรหัสใหม่': number;
    'รอโอน': number;
    'อื่นๆ': number;
  };
  operator: string;
  departmentSignoffs?: Record<string, DepartmentSignoff>;
  reopenHistory?: Array<{
    reopenedBy: string;
    reopenedAt: string;
    reason?: string;
  }>;
}

export interface DepartmentLocationConfig {
  id: string;
  name: string;
  locations: string[];
}

export interface SparePartTransaction {
  id: string;
  partId: string;
  assetId: string;
  date: string;
  type: 'in' | 'out' | 'adjust'; // 'in' = รับเข้าสต็อก, 'out' = เบิกใช้งาน, 'adjust' = ปรับยอด
  quantity: number; // + or -
  balanceAfter: number;
  unitPrice?: number;
  totalPrice?: number;
  referenceDoc?: string; // e.g. "PO-6908-01", "PM รอบ ส.ค. 69", "ใบเบิกพัสดุ 102/69"
  operator: string;
  note?: string;
  createdAt: string;
}

export interface SparePart {
  id: string;
  assetId: string; // Foreign key to Asset ID
  partCode: string; // e.g. "SP-PUMP-001"
  name: string; // e.g. "ไส้กรองอากาศ (Air Filter)"
  specification?: string; // e.g. "Atlas Copco Part No. 1613-8720-00"
  brand?: string; // e.g. "Atlas Copco"
  storageLocation?: string; // e.g. "ตู้เก็บอะไหล่ ช่างบำรุงรักษา ชั้น 2 (BR 43)"
  quantity: number; // Current quantity on hand
  minQuantity: number; // Safety stock / reorder alert point
  unit: string; // e.g. "ชิ้น", "ชุด", "ลิตร", "แกลลอน", "กล่อง"
  unitPrice?: number; // Cost per unit (THB)
  supplier?: string; // e.g. "บริษัท แอตลาส คอปโก้ (ประเทศไทย) จำกัด"
  supplierContact?: string; // e.g. "02-XXX-XXXX"
  notes?: string;
  imageUrl?: string;
  updatedAt: string;
  transactions?: SparePartTransaction[];
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
  repairCost?: number | string;
  notes?: string;
  additionalNotes?: string;
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
  },
  ...BLOOD_BAG_ASSETS
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

export const INITIAL_DEPARTMENTS: DepartmentLocationConfig[] = [
  {
    id: "dept-1",
    name: "ฝ่ายเทคโนโลยีสารสนเทศ",
    locations: ["ห้องทำงานไอที ชั้น 3", "ห้องเซิร์ฟเวอร์ ชั้น 3", "ห้องเก็บของไอที ชั้น 3"]
  },
  {
    id: "dept-2",
    name: "ฝ่ายบริหารทั่วไป",
    locations: ["ห้องประชุมใหญ่ ชั้น 4", "ห้องผู้อำนวยการ ชั้น 5", "ห้องธุรการ ชั้น 2", "ห้องเก็บของ ชั้น 1"]
  },
  {
    id: "dept-3",
    name: "ฝ่ายธุรการและสารบรรณ",
    locations: ["ห้องธุรการ ชั้น 2", "ห้องเก็บเอกสาร ชั้น 2"]
  },
  {
    id: "dept-4",
    name: "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา",
    locations: [
      "BR 00 Cleanroom",
      "BR 1 Air lock 1",
      "BR 2 Changing room 1 (women)",
      "BR 3 Changing room 2 (women)",
      "BR 4 Changing room 1 (men)",
      "BR 5 Changing room 2 (men)",
      "BR 6 Air lock 2",
      "BR 7 Air shower",
      "BR 8 Corridor 1",
      "BR 9 Raw material entrance 1",
      "BR 10 Raw material entrance 2",
      "BR 11 Tube printing and cutting room",
      "BR 12 Raw material storage",
      "BR 13 Welding room",
      "BR 14 Tube assembly room",
      "BR 15 Completed empty set storage",
      "BR 16 Air lock 3",
      "BR 17 Corridor 2",
      "BR 18 Laundry 1",
      "BR 19 Laundry 2",
      "BR 20 Equipment sterilizing room",
      "BR 21 Equipment cleaning room",
      "BR 22 Chemical storage",
      "BR 23 Weighing room",
      "BR 24 Mixing room",
      "BR 25 Air lock 4",
      "BR 26 Filling room",
      "BR 27 Pre-sterilization room",
      "BR 28 Air lock 5",
      "BR 29 Air lock 6",
      "BR 30 Changing room (men)",
      "BR 31 Changing room (women)",
      "BR 32 Autoclave room",
      "BR 33 Inspection room",
      "BR 34 Packaging room",
      "BR 35 Label printing room",
      "BR 36 Pasteurization room",
      "BR 37 Air lock 7",
      "BR 38 Air lock 8",
      "BR 40 Corridor 3",
      "BR 41 Final packing room",
      "BR 42 Equipment maintenance storage room",
      "BR 43 Air compressor room",
      "BR 44 Pharmacist room",
      "BR 45 Chief's room",
      "BR 46 Office",
      "BR 47 Staff room",
      "BR 48 Cleanroom surrounding",
      "BR 49 AHU-F room",
      "BR 50 Raw material storage 2",
      "BR 51 Storage area 1",
      "BR 52 Female restroom 1",
      "BR 53 Staff room 2",
      "BR 54 Male restroom 1",
      "BR 55 Electric room",
      "BR 56 Corridor 4",
      "BR 57 Front department 1",
      "BR 58 Entrance",
      "BR 59 Maintenance floor",
      "BR 60 Corridor 6",
      "BR 61 Entrance 2",
      "BR 62 Raw Material Storage 3",
      "BR 63 Equipment Cleaning Room",
      "BR 64 Equipment Preparation Room 1",
      "BR 65 Equipment Preparation Room 2",
      "BR 66 AHU Room",
      "BR 67 Repair & Maintenance Room",
      "BR 68 Water Distillation Room",
      "BR 69 Autoclave Room",
      "BR 70 Corridor 7",
      "BR 71 Finished Product Room 1",
      "BR 72 Solution Preparation Room",
      "BR 73 Finished Product Room 2",
      "BR 74 Retain, Reject, and Recall Product Room",
      "BR 75 Staff room 3",
      "BR 76 Storage area 2",
      "BR 77 Female restroom 2",
      "BR 78 Staff room 4",
      "BR 79 Male restroom 2",
      "BR 80 Corridor 8",
      "BR 81 Front Department 2",
      "BR 90 Water Treatment floor",
      "BR 91 Plasma Building Storage Room",
      "BR 98 Cleanroom C",
      "BR 99 Cleanroom D"
    ]
  }
];

export type UserRole = 'admin' | 'manager' | 'head' | 'operator' | 'user';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  department: string; // empty string for admin/manager, or specific department name for head/operator
  isBlocked: boolean;
  createdAt: string;
}

export const INITIAL_USERS: UserAccount[] = [
  {
    id: "user-admin",
    username: "admin",
    password: "admin",
    name: "แอดมินสูงสุด (System Admin)",
    role: "admin",
    department: "",
    isBlocked: false,
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "user-manager",
    username: "manager",
    password: "123",
    name: "ผู้อำนวยการศูนย์ฯ (Manager Executive)",
    role: "manager",
    department: "",
    isBlocked: false,
    createdAt: "2026-02-01T00:00:00.000Z"
  },
  {
    id: "user-head-blood",
    username: "head_blood",
    password: "123",
    name: "หัวหน้าฝ่ายผลิตผลิตภัณฑ์เลือด (Head)",
    role: "head",
    department: "ฝ่ายผลิตผลิตภัณฑ์เลือด",
    isBlocked: false,
    createdAt: "2026-02-10T00:00:00.000Z"
  },
  {
    id: "user-op-blood",
    username: "op_blood",
    password: "123",
    name: "เจ้าหน้าที่ปฏิบัติงานฝ่ายผลิตเลือด (Operator)",
    role: "operator",
    department: "ฝ่ายผลิตผลิตภัณฑ์เลือด",
    isBlocked: false,
    createdAt: "2026-02-15T00:00:00.000Z"
  },
  {
    id: "user-head-qa",
    username: "head_qa",
    password: "123",
    name: "หัวหน้าฝ่ายประกันคุณภาพ (Head QA)",
    role: "head",
    department: "ฝ่ายตรวจตราและประกันคุณภาพ",
    isBlocked: false,
    createdAt: "2026-03-01T00:00:00.000Z"
  },
  {
    id: "user-op-qa",
    username: "op_qa",
    password: "123",
    name: "เจ้าหน้าที่ฝ่ายประกันคุณภาพ (Operator QA)",
    role: "operator",
    department: "ฝ่ายตรวจตราและประกันคุณภาพ",
    isBlocked: false,
    createdAt: "2026-03-05T00:00:00.000Z"
  },
  {
    id: "user-blocked",
    username: "blocked",
    password: "123",
    name: "ผู้ใช้ที่ถูกระงับสิทธิ์",
    role: "operator",
    department: "ฝ่ายบริหารทั่วไป",
    isBlocked: true,
    createdAt: "2026-04-10T00:00:00.000Z"
  }
];

export interface PMContract {
  id: string;
  contractNumber: string;
  title: string;
  vendorName: string;
  startDate: string;
  endDate: string;
  hasNoEndDate?: boolean;
  pmFrequency: 'monthly' | 'quarterly' | 'semi-annually' | 'annually' | 'custom';
  assetIds: string[];
  contactPerson: string;
  contactPhone: string;
  createdBy?: string;
  department?: string;
}

export interface PMSchedule {
  id: string;
  contractId: string;
  assetId: string;
  assetName: string;
  plannedDate: string;
  status: 'pending' | 'completed' | 'postponed' | 'awaiting_repair' | 'overdue';
  completedDate?: string;
  details?: string;
  operator?: string;
  proofImageUrl?: string;
  notes?: string;
  nextPMNotes?: string;
  cmCaseCreatedId?: string;
}

export interface PMNotification {
  id: string;
  title: string;
  message: string;
  targetDate: string;
  isRead: boolean;
  type: 'pm_upcoming' | 'pm_overdue' | 'repair_alert' | 'contract_expiring';
  linkTo: string;
}

export const INITIAL_CONTRACTS: PMContract[] = [
  {
    id: "contract-1",
    contractNumber: "PM-IT-2569-01",
    title: "สัญญาจ้างบริการซ่อมบำรุงรักษาคอมพิวเตอร์และเครื่องพิมพ์ประจำปี",
    vendorName: "บริษัท ซิสเต็มส์เซอร์วิส แอนด์ โซลูชัน จำกัด",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    pmFrequency: "quarterly",
    assetIds: ["6901-001-0001", "6901-003-0044"],
    contactPerson: "คุณอนุรักษ์ ไอทีแมน",
    contactPhone: "089-123-4567"
  },
  {
    id: "contract-2",
    contractNumber: "PM-AC-2569-02",
    title: "สัญญาจ้างบริการบำรุงรักษาและล้างเครื่องปรับอากาศประจำปี",
    vendorName: "บริษัท ไทยคูลลิ่ง เซอร์วิส จำกัด",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    pmFrequency: "semi-annually",
    assetIds: ["6901-001-0002"],
    contactPerson: "ช่างสมยศ ลมเย็น",
    contactPhone: "081-987-6543"
  }
];

export const INITIAL_SCHEDULES: PMSchedule[] = [
  {
    id: "sched-1",
    contractId: "contract-1",
    assetId: "6901-001-0001",
    assetName: "คอมพิวเตอร์ All-in-One Dell Inspiron 5415",
    plannedDate: "2026-03-15",
    status: "completed",
    completedDate: "2026-03-14",
    details: "1. เป่าฝุ่นทำความสะอาดอุปกรณ์ฮาร์ดแวร์ภายนอก\n2. ตรวจสอบสถานะการเชื่อมต่อเครือข่าย\n3. อัปเดตแพตช์ความปลอดภัยระบบปฏิบัติการ Windows ล่าสุด",
    operator: "เจ้าหน้าที่ไอที",
    proofImageUrl: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=60",
    notes: "เครื่องทำงานได้ปกติดี พัดลมระบายความร้อนเสียงไม่ดัง"
  },
  {
    id: "sched-2",
    contractId: "contract-1",
    assetId: "6901-001-0001",
    assetName: "คอมพิวเตอร์ All-in-One Dell Inspiron 5415",
    plannedDate: "2026-06-15",
    status: "completed",
    completedDate: "2026-06-12",
    details: "1. สแกนตรวจสอบมัลแวร์และไวรัสในระบบ\n2. ตรวจเช็คพื้นที่จัดเก็บ SSD\n3. ล้างทำความสะอาดแผงคีย์บอร์ดและหน้าจอ",
    operator: "เจ้าหน้าที่ไอที",
    proofImageUrl: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=60",
    notes: "ลบไฟล์ขยะเพิ่มพื้นที่ได้ 45GB"
  },
  {
    id: "sched-3",
    contractId: "contract-1",
    assetId: "6901-001-0001",
    assetName: "คอมพิวเตอร์ All-in-One Dell Inspiron 5415",
    plannedDate: "2026-09-15",
    status: "pending"
  },
  {
    id: "sched-4",
    contractId: "contract-2",
    assetId: "6901-001-0002",
    assetName: "เครื่องปรับอากาศ Daikin Inverter 18,000 BTU",
    plannedDate: "2026-05-10",
    status: "completed",
    completedDate: "2026-05-09",
    details: "1. ล้างแผ่นกรองอากาศ (Filter)\n2. วัดระดับน้ำยาแอร์ (R32) และเติมส่วนขาด\n3. ล้างคอยล์ร้อนคอยล์เย็น",
    operator: "เจ้าหน้าที่บริหารทั่วไป",
    proofImageUrl: "https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=600&auto=format&fit=crop&q=60",
    notes: "กระแสไฟและน้ำยาอยู่ในเกณฑ์ปกติ ลมเย็นฉ่ำดี"
  },
  {
    id: "sched-5",
    contractId: "contract-2",
    assetId: "6901-001-0002",
    assetName: "เครื่องปรับอากาศ Daikin Inverter 18,000 BTU",
    plannedDate: "2026-11-10",
    status: "pending"
  }
];

export const INITIAL_SPARE_PARTS: SparePart[] = [
  // Spare parts for 0725634310001030003 (เครื่องผลิตอากาศอัด (pump) BAG)
  {
    id: "sp-pump-01",
    assetId: "0725634310001030003",
    partCode: "SP-PUMP-FLT01",
    name: "ไส้กรองอากาศและแผ่นกรองฝุ่นไอดี (Air Intake Filter)",
    specification: "Atlas Copco OEM No. 1613-8720-00 (Grade High-Efficiency)",
    brand: "Atlas Copco",
    storageLocation: "ตู้เก็บอะไหล่ ช่างบำรุงรักษา ชั้น 2 (BR 43 Air Compressor Room)",
    quantity: 6,
    minQuantity: 2,
    unit: "ชิ้น",
    unitPrice: 1450,
    supplier: "บริษัท โอซาร่า วิศวกรรม จำกัด / Atlas Copco Thailand",
    supplierContact: "02-762-8000",
    notes: "เปลี่ยนทุกๆ 2,000 ชั่วโมงการทำงาน หรือทุกรอบ PM 6 เดือน",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60",
    updatedAt: "2026-06-15T10:00:00.000Z",
    transactions: [
      {
        id: "tx-pump-01",
        partId: "sp-pump-01",
        assetId: "0725634310001030003",
        date: "2026-01-15",
        type: "in",
        quantity: 8,
        balanceAfter: 8,
        unitPrice: 1450,
        totalPrice: 11600,
        referenceDoc: "PO-6901-14 / ใบรับพัสดุ 014/69",
        operator: "นายช่างสมชาย",
        note: "สั่งซื้ออะไหล่สต็อกสำรองประจำปีงบประมาณ 2569",
        createdAt: "2026-01-15T09:30:00.000Z"
      },
      {
        id: "tx-pump-02",
        partId: "sp-pump-01",
        assetId: "0725634310001030003",
        date: "2026-06-15",
        type: "out",
        quantity: -2,
        balanceAfter: 6,
        referenceDoc: "PM รอบที่ 1 (มิ.ย. 69)",
        operator: "ประเสริฐพงษ์",
        note: "เบิกเปลี่ยนไส้กรองรอบบำรุงรักษาเชิงป้องกันประจำปี",
        createdAt: "2026-06-15T14:20:00.000Z"
      }
    ]
  },
  {
    id: "sp-pump-02",
    assetId: "0725634310001030003",
    partCode: "SP-PUMP-OIL46",
    name: "น้ำมันหล่อลื่นคอมเพรสเซอร์ Roto-Inject Fluid (5L)",
    specification: "Atlas Copco Synthetic Lubricant ISO VG 46 (High Temp 100°C)",
    brand: "Atlas Copco Genuine Fluid",
    storageLocation: "ห้องสโตร์สารหล่อลื่น ชั้น 1 อาคารบำรุงรักษา",
    quantity: 4,
    minQuantity: 2,
    unit: "แกลลอน",
    unitPrice: 2850,
    supplier: "บริษัท โอซาร่า วิศวกรรม จำกัด",
    supplierContact: "081-987-6543",
    notes: "ใช้สำหรับถ่ายเปลี่ยนน้ำมันเครื่องปั๊มลมหล่อเย็น",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=60",
    updatedAt: "2026-06-20T11:00:00.000Z",
    transactions: [
      {
        id: "tx-pump-03",
        partId: "sp-pump-02",
        assetId: "0725634310001030003",
        date: "2026-02-20",
        type: "in",
        quantity: 5,
        balanceAfter: 5,
        unitPrice: 2850,
        totalPrice: 14250,
        referenceDoc: "PO-6902-09",
        operator: "เจ้าหน้าที่พัสดุ",
        note: "รับเข้าสต็อกสำรอง 5 แกลลอน",
        createdAt: "2026-02-20T10:00:00.000Z"
      },
      {
        id: "tx-pump-04",
        partId: "sp-pump-02",
        assetId: "0725634310001030003",
        date: "2026-06-20",
        type: "out",
        quantity: -1,
        balanceAfter: 4,
        referenceDoc: "PM รอบเปลี่ยนถ่ายน้ำมันหล่อลื่น",
        operator: "ประเสริฐพงษ์",
        note: "เบิกเติม 1 แกลลอน ระดับน้ำมันเต็มเกจ์วัดปกติ",
        createdAt: "2026-06-20T11:00:00.000Z"
      }
    ]
  },
  {
    id: "sp-pump-03",
    assetId: "0725634310001030003",
    partCode: "SP-PUMP-SEAL02",
    name: "ชุดซีลโอริงและปะเก็นฝาครอบ (Gasket & O-Ring Kit)",
    specification: "Viton High-Temp Resistance Set (Kit 2901-0999-00)",
    brand: "Atlas Copco",
    storageLocation: "ตู้เก็บอะไหล่ ช่างบำรุงรักษา ชั้น 2 (BR 43)",
    quantity: 3,
    minQuantity: 1,
    unit: "ชุด",
    unitPrice: 1850,
    supplier: "Atlas Copco Thailand",
    supplierContact: "02-762-8000",
    notes: "ชุดซ่อมกันรั่วซึมฝาครอบวาล์วไอดี/ไอเสีย",
    imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=60",
    updatedAt: "2026-03-01T09:00:00.000Z",
    transactions: [
      {
        id: "tx-pump-05",
        partId: "sp-pump-03",
        assetId: "0725634310001030003",
        date: "2026-03-01",
        type: "in",
        quantity: 3,
        balanceAfter: 3,
        unitPrice: 1850,
        totalPrice: 5550,
        referenceDoc: "PO-6903-12",
        operator: "เจ้าหน้าที่พัสดุ",
        note: "สั่งซื้อชุดซีลสำรอง 3 ชุด",
        createdAt: "2026-03-01T09:00:00.000Z"
      }
    ]
  },
  {
    id: "sp-pump-04",
    assetId: "0725634310001030003",
    partCode: "SP-PUMP-VLV04",
    name: "โซลินอยด์วาล์วระบายแรงดัน (Solenoid Blow-off Valve 24V)",
    specification: "24VDC 0.8 MPa Brass Body (NC Type)",
    brand: "SMC Pneumatics",
    storageLocation: "ชั้นวางอะไหล่ระบบนิวเมติกส์ ตู้ A-04",
    quantity: 2,
    minQuantity: 1,
    unit: "ชิ้น",
    unitPrice: 3200,
    supplier: "SMC Thailand",
    supplierContact: "02-019-5656",
    notes: "สำหรับควบคุมการคายแรงดันตกค้างช่วง Unload",
    imageUrl: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&auto=format&fit=crop&q=60",
    updatedAt: "2026-04-12T14:00:00.000Z",
    transactions: [
      {
        id: "tx-pump-06",
        partId: "sp-pump-04",
        assetId: "0725634310001030003",
        date: "2026-04-12",
        type: "in",
        quantity: 2,
        balanceAfter: 2,
        unitPrice: 3200,
        totalPrice: 6400,
        referenceDoc: "PO-6904-05",
        operator: "นายช่างสมชาย",
        note: "รับเข้าสต็อก 2 ชิ้น",
        createdAt: "2026-04-12T14:00:00.000Z"
      }
    ]
  },

  // Spare parts for 0725499999001990002 (ระบบผลิตน้ำกลั่นและระบบผลิตน้ำอ่อน)
  {
    id: "sp-water-01",
    assetId: "0725499999001990002",
    partCode: "SP-WATER-RO01",
    name: "ไส้กรองเมมเบรนกรองน้ำ RO Membrane 8040 (Filmtec)",
    specification: "Dow Filmtec BW30-400 (High Rejection 99.5%)",
    brand: "DuPont / Filmtec",
    storageLocation: "ห้องเก็บไส้กรองระบบบำบัดน้ำ ชั้น 1",
    quantity: 4,
    minQuantity: 2,
    unit: "ท่อน",
    unitPrice: 8500,
    supplier: "บริษัท วอเตอร์ทรีทเม้นท์ เอ็นจิเนียริ่ง จำกัด",
    supplierContact: "02-555-1234",
    notes: "เปลี่ยนทุก 2 ปี หรือเมื่อค่า TDS หลังกรองสูงเกิน 15 ppm",
    updatedAt: "2026-05-01T09:00:00.000Z",
    transactions: [
      {
        id: "tx-water-01",
        partId: "sp-water-01",
        assetId: "0725499999001990002",
        date: "2026-05-01",
        type: "in",
        quantity: 4,
        balanceAfter: 4,
        unitPrice: 8500,
        totalPrice: 34000,
        referenceDoc: "PO-6905-20",
        operator: "เจ้าหน้าที่พัสดุ",
        note: "รับเข้าสต็อกสำรอง 4 ท่อน",
        createdAt: "2026-05-01T09:00:00.000Z"
      }
    ]
  },
  {
    id: "sp-water-02",
    assetId: "0725499999001990002",
    partCode: "SP-WATER-RESIN",
    name: "สารกรองเรซินแลกเปลี่ยนไอออน Cation Resin (25L)",
    specification: "Strong Acid Cation Exchange Resin (Food Grade Na+ form)",
    brand: "Purolite C100E",
    storageLocation: "คลังเก็บสารเคมีและสารกรองน้ำ",
    quantity: 8,
    minQuantity: 3,
    unit: "ถุง",
    unitPrice: 1950,
    supplier: "บริษัท วอเตอร์ทรีทเม้นท์ เอ็นจิเนียริ่ง จำกัด",
    supplierContact: "02-555-1234",
    notes: "ใช้สำหรับฟื้นฟูและเปลี่ยนสารกรองถัง Softener",
    updatedAt: "2026-05-10T10:00:00.000Z",
    transactions: [
      {
        id: "tx-water-02",
        partId: "sp-water-02",
        assetId: "0725499999001990002",
        date: "2026-05-10",
        type: "in",
        quantity: 10,
        balanceAfter: 10,
        unitPrice: 1950,
        totalPrice: 19500,
        referenceDoc: "PO-6905-22",
        operator: "เจ้าหน้าที่พัสดุ",
        note: "รับเข้าสต็อก 10 ถุง",
        createdAt: "2026-05-10T10:00:00.000Z"
      },
      {
        id: "tx-water-03",
        partId: "sp-water-02",
        assetId: "0725499999001990002",
        date: "2026-07-01",
        type: "out",
        quantity: -2,
        balanceAfter: 8,
        referenceDoc: "PM ล้างถัง Softener",
        operator: "ประเสริฐพงษ์",
        note: "เติมสารกรอง Softener ถัง A",
        createdAt: "2026-07-01T15:00:00.000Z"
      }
    ]
  }
];

export const loadSpareParts = (): SparePart[] => {
  try {
    const data = localStorage.getItem('assetwatch_spare_parts');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load spare parts from storage:', e);
  }
  return INITIAL_SPARE_PARTS;
};

export const saveSpareParts = (parts: SparePart[]): void => {
  try {
    localStorage.setItem('assetwatch_spare_parts', JSON.stringify(parts));
  } catch (e) {
    console.error('Failed to save spare parts to storage:', e);
  }
};

export const INITIAL_NOTIFICATIONS: PMNotification[] = [
  {
    id: "notif-1",
    title: "📅 มีกำหนดการบำรุงรักษาคอมพิวเตอร์ (Dell AIO)",
    message: "ครุภัณฑ์รหัส 6901-001-0001 มีแผนกำหนดเข้าทำ PM ไตรมาสที่ 3 ในวันที่ 2026-09-15 โปรดนัดหมายบริษัทช่างรับจ้างเข้าดำเนินการ",
    targetDate: "2026-09-08",
    isRead: false,
    type: "pm_upcoming",
    linkTo: "pm_cm"
  }
];





