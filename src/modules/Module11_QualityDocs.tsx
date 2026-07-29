
export interface MonthDef {
  name: string;
  monthNum: number;
  weeks: string[];
}

export const BWI_021_003_UPPER_MONTHS: MonthDef[] = [
  { name: 'ม.ค.', monthNum: 1, weeks: ['1-5', '6-12', '13-19', '20-26', '27-31'] },
  { name: 'ก.พ.', monthNum: 2, weeks: ['1-9', '10-16', '17-23', '24-28'] },
  { name: 'มี.ค.', monthNum: 3, weeks: ['1-9', '10-16', '17-23', '24-31'] },
  { name: 'เม.ย.', monthNum: 4, weeks: ['1-6', '7-13', '14-20', '21-27', '28-30'] },
  { name: 'พ.ค.', monthNum: 5, weeks: ['1-4', '5-11', '12-18', '19-25', '26-31'] },
  { name: 'มิ.ย.', monthNum: 6, weeks: ['1-8', '9-15', '16-22', '23-30'] }
];

export const BWI_021_003_LOWER_MONTHS: MonthDef[] = [
  { name: 'ก.ค.', monthNum: 7, weeks: ['1-6', '7-13', '14-20', '21-27', '28-31'] },
  { name: 'ส.ค.', monthNum: 8, weeks: ['1-10', '11-17', '18-24', '25-31'] },
  { name: 'ก.ย.', monthNum: 9, weeks: ['1-7', '8-14', '15-21', '22-30'] },
  { name: 'ต.ค.', monthNum: 10, weeks: ['1-5', '6-12', '13-19', '20-26', '27-31'] },
  { name: 'พ.ย.', monthNum: 11, weeks: ['1-9', '10-16', '17-23', '24-30'] },
  { name: 'ธ.ค.', monthNum: 12, weeks: ['1-7', '8-14', '15-21', '22-28', '29-31'] }
];

import React, { useState, useMemo } from 'react';
import { Asset, UserAccount, PMContract } from '../utils/mockData';
import { FileText, Printer, Plus, Edit, Trash2, CheckCircle, Calendar, ShieldCheck, Filter, Search, Building2, Wrench, ChevronRight, Bookmark } from 'lucide-react';

export interface QualityProcedure {
  id: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  location: string;
  department: string;
  procedure: string;
  frequency: string; // e.g. "วันที่ใช้งาน", "1 สัปดาห์", "1 เดือน", "3 เดือน", "1 ปี"
  frequencyType: 'daily' | 'period'; // daily = BWI 021/002, period = BWI 021/003
  responsiblePerson: string; // e.g. "ชาตินีย์", "เจ้าหน้าที่ที่ใช้งาน", "บริษัท Getinge"
  linkedContractId?: string; // Optional link to Module 10 contract
}

export interface QualityLogMatrixCell {
  procedureId: string;
  periodKey: string; // "month-day" e.g. "7-15" or "month-week" e.g. "7-w2"
  isPlanned: boolean;
  isCompleted: boolean;
  completedDate?: string;
  disinfectantType?: string; // "1" (Chlorhex-C) or "2" (Benz Cl)
}

interface Module11Props {
  assets: Asset[];
  contracts: PMContract[];
  currentUser: UserAccount | null;
}

// Custom Searchable Asset Select Component
interface SearchableAssetSelectProps {
  assets: Asset[];
  selectedAssetId: string;
  onSelectAsset: (assetId: string) => void;
  label?: string;
  placeholder?: string;
  width?: string;
}

export const SearchableAssetSelect: React.FC<SearchableAssetSelectProps> = ({
  assets,
  selectedAssetId,
  onSelectAsset,
  label = "📌 เลือกรายการครุภัณฑ์ / ห้องสะอาด",
  placeholder = "พิมพ์ค้นหาชื่อเครื่องมือ, รหัสพัสดุ, หรือห้อง...",
  width = "100%"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedAsset = useMemo(() => {
    return assets.find(a => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  const filteredAssets = useMemo(() => {
    if (!searchTerm.trim()) return assets.slice(0, 100);
    const q = searchTerm.toLowerCase().trim();
    return assets.filter(a => 
      a.name.toLowerCase().includes(q) || 
      a.id.toLowerCase().includes(q) || 
      (a.location && a.location.toLowerCase().includes(q))
    ).slice(0, 100);
  }, [assets, searchTerm]);

  return (
    <div className="form-group" style={{ position: 'relative', width }}>
      {label && <label className="form-label" style={{ marginBottom: '0.35rem', display: 'block' }}>{label}</label>}
      
      {/* Trigger Input Box */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="form-input"
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          background: 'var(--bg-secondary)',
          borderColor: isOpen ? 'var(--primary)' : 'var(--border)',
          padding: '0.6rem 0.85rem',
          borderRadius: 'var(--radius-sm)'
        }}
      >
        {selectedAsset ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
            <span style={{ fontWeight: 650, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {selectedAsset.name}
            </span>
            <code style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', flexShrink: 0 }}>
              {selectedAsset.id}
            </code>
            {selectedAsset.location && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                📍 {selectedAsset.location}
              </span>
            )}
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>-- เลือกรายการครุภัณฑ์ --</span>
        )}
        <Search size={16} color="var(--primary)" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
      </div>

      {/* Dropdown Search Panel */}
      {isOpen && (
        <>
          {/* Overlay backdrop to close dropdown */}
          <div 
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10080 }} 
          />

          <div 
            className="glass-panel animate-fade-in"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 10090,
              marginTop: '0.35rem',
              padding: '0.6rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              maxHeight: '320px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Search Box Input */}
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-input"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                style={{ paddingLeft: '2rem', fontSize: '0.8rem', padding: '0.45rem 0.5rem 0.45rem 2rem' }}
              />
            </div>

            {/* List Options */}
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {filteredAssets.length === 0 ? (
                <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ไม่พบรายการครุภัณฑ์ที่ค้นหา
                </div>
              ) : (
                filteredAssets.map(a => {
                  const isSelected = a.id === selectedAssetId;
                  return (
                    <div
                      key={a.id}
                      onClick={() => {
                        onSelectAsset(a.id);
                        setIsOpen(false);
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div>
                        <div style={{ fontWeight: 650, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {a.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                          <span>🆔 {a.id}</span>
                          {a.location && <span>📍 {a.location}</span>}
                        </div>
                      </div>
                      {isSelected && <CheckCircle size={14} color="var(--primary)" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const INITIAL_QUALITY_PROCEDURES: QualityProcedure[] = [
  {
    id: "qproc-1",
    assetId: "07254465159999990005",
    assetName: "เครื่องพิมพ์-ตัดสายอัตโนมัติ 128.1",
    assetCode: "SUP 44-6515-127-1",
    location: "ห้องพิมพ์-ตัดสาย",
    department: "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา",
    procedure: "เช็ดทำความสะอาดเครื่องด้วย alcohol 95%",
    frequency: "วันที่ใช้งาน",
    frequencyType: "daily",
    responsiblePerson: "ชาตินีย์"
  },
  {
    id: "qproc-2",
    assetId: "07254465159999990005",
    assetName: "เครื่องพิมพ์-ตัดสายอัตโนมัติ 128.2",
    assetCode: "SUP 44-6515-127-2",
    location: "ห้องพิมพ์-ตัดสาย",
    department: "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา",
    procedure: "ล้างทำความสะอาดชุดแม่พิมพ์ตัวเลข",
    frequency: "1 ปี",
    frequencyType: "period",
    responsiblePerson: "ชาตินีย์"
  },
  {
    id: "qproc-3",
    assetId: "07254465159999990005",
    assetName: "เครื่องพิมพ์-ตัดสายอัตโนมัติ 128.2",
    assetCode: "SUP 44-6515-127-2",
    location: "ห้องพิมพ์-ตัดสาย",
    department: "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา",
    procedure: "เปลี่ยนแบตเตอรี่หน้าจอ",
    frequency: "1 ปี",
    frequencyType: "period",
    responsiblePerson: "ชาตินีย์"
  },
  {
    id: "qproc-4",
    assetId: "07254465159999990005",
    assetName: "เครื่องพิมพ์-ตัดสายอัตโนมัติ 128.2",
    assetCode: "SUP 44-6515-127-2",
    location: "ห้องพิมพ์-ตัดสาย",
    department: "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา",
    procedure: "หยอดน้ำมัน WD40 หยอดน้ำมันจาระบี",
    frequency: "1 เดือน",
    frequencyType: "period",
    responsiblePerson: "ชาตินีย์"
  },
  {
    id: "qproc-5",
    assetId: "0725636515047250001",
    assetName: "เครื่องบรรจุน้ำยา Plumatex 2",
    assetCode: "0725636515047250001",
    location: "ห้องบรรจุน้ำยา",
    department: "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา",
    procedure: "เช็ดทำความสะอาดเครื่องด้วย alcohol 70% ชนิดกรอง",
    frequency: "วันที่ใช้งาน",
    frequencyType: "daily",
    responsiblePerson: "เจ้าหน้าที่ที่ใช้งาน"
  },
  {
    id: "qproc-6",
    assetId: "0725656515047250001",
    assetName: "เครื่องบรรจุน้ำยา Plumatex 3",
    assetCode: "0725656515047250001",
    location: "ห้องบรรจุน้ำยา",
    department: "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา",
    procedure: "ล้าง CIP ด้วยน้ำ WFI / Drain น้ำที่ค้างใน filling line",
    frequency: "วันที่ใช้งาน",
    frequencyType: "daily",
    responsiblePerson: "เครือวัลย์ เปรมฤดี"
  },
  {
    id: "qproc-7",
    assetId: "0725656515047250001",
    assetName: "เครื่องบรรจุน้ำยา Plumatex 3",
    assetCode: "0725656515047250001",
    location: "ห้องบรรจุน้ำยา",
    department: "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา",
    procedure: "ฆ่าเชื้อด้วย SIP",
    frequency: "1 สัปดาห์",
    frequencyType: "daily",
    responsiblePerson: "เครือวัลย์ เปรมฤดี"
  },
  {
    id: "qproc-8",
    assetId: "0725686530021040001",
    assetName: "เครื่อง Overwrap (Swentech)",
    assetCode: "0725686530021040001",
    location: "ห้อง Pasteurization",
    department: "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา",
    procedure: "เช็ดทำความสะอาดเครื่องด้วย alcohol 95%",
    frequency: "วันที่ใช้งาน",
    frequencyType: "daily",
    responsiblePerson: "เจ้าหน้าที่ที่ใช้งาน"
  },
  {
    id: "qproc-9",
    assetId: "0725646530003010001",
    assetName: "เครื่องนึ่งฆ่าเชื้อ G6",
    assetCode: "0725646530003010001",
    location: "ห้องนึ่งฆ่าเชื้อ ชั้น 6",
    department: "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา",
    procedure: "บำรุงรักษาโดยบริษัท Getinge (Outsource Contract)",
    frequency: "3 เดือน",
    frequencyType: "period",
    responsiblePerson: "บริษัท Getinge"
  }
];

export const Module11_QualityDocs: React.FC<Module11Props> = ({
  assets,
  contracts,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'master' | 'daily_log' | 'period_log'>('master');
  const [procedures, setProcedures] = useState<QualityProcedure[]>(() => {
    const saved = localStorage.getItem('assetwatch_quality_procedures');
    return saved ? JSON.parse(saved) : INITIAL_QUALITY_PROCEDURES;
  });

  const [matrixData, setMatrixData] = useState<Record<string, QualityLogMatrixCell>>(() => {
    const saved = localStorage.getItem('assetwatch_quality_matrix');
    return saved ? JSON.parse(saved) : {
      "qproc-6_7-7": { procedureId: "qproc-6", periodKey: "7-7", isPlanned: true, isCompleted: true, disinfectantType: "1" },
      "qproc-6_7-8": { procedureId: "qproc-6", periodKey: "7-8", isPlanned: true, isCompleted: true, disinfectantType: "1" },
      "qproc-6_7-9": { procedureId: "qproc-6", periodKey: "7-9", isPlanned: true, isCompleted: true, disinfectantType: "1" },
      "qproc-7_7-6": { procedureId: "qproc-7", periodKey: "7-6", isPlanned: true, isCompleted: true },
      "qproc-2_7-w3": { procedureId: "qproc-2", periodKey: "7-w3", isPlanned: true, isCompleted: true, completedDate: "18/07/2569" },
      "qproc-3_7-w1": { procedureId: "qproc-3", periodKey: "7-w1", isPlanned: true, isCompleted: true, completedDate: "03/07/2569" },
      "qproc-4_7-w2": { procedureId: "qproc-4", periodKey: "7-w2", isPlanned: true, isCompleted: true, completedDate: "12/07/2569" }
    };
  });

  // Filter States
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('0725656515047250001'); // Default Plumatex 3
  const [selectedYear, setSelectedYear] = useState<string>('2569');

  // Print Preview Modals
  const [isPrintMasterOpen, setIsPrintMasterOpen] = useState(false);
  const [isPrintDailyOpen, setIsPrintDailyOpen] = useState(false);
  const [isPrintPeriodOpen, setIsPrintPeriodOpen] = useState(false);

  // Add / Edit Procedure Modal
  const [isProcModalOpen, setIsProcModalOpen] = useState(false);
  const [editingProc, setEditingProc] = useState<QualityProcedure | null>(null);
  const [formAssetId, setFormAssetId] = useState('');
  const [formProcedure, setFormProcedure] = useState('');
  const [formFrequency, setFormFrequency] = useState('วันที่ใช้งาน');
  const [formFreqType, setFormFreqType] = useState<'daily' | 'period'>('daily');
  const [formPerson, setFormPerson] = useState('');
  const [formContractId, setFormContractId] = useState('');

  // Save procedure changes
  const saveProceduresToStorage = (newProcs: QualityProcedure[]) => {
    setProcedures(newProcs);
    localStorage.setItem('assetwatch_quality_procedures', JSON.stringify(newProcs));
  };

  const saveMatrixToStorage = (newMatrix: Record<string, QualityLogMatrixCell>) => {
    setMatrixData(newMatrix);
    localStorage.setItem('assetwatch_quality_matrix', JSON.stringify(newMatrix));
  };

  // Handle Add/Edit Procedure Submit
  const handleSaveProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    const assetObj = assets.find(a => a.id === formAssetId);
    if (!assetObj) {
      alert('กรุณาเลือกรายการครุภัณฑ์');
      return;
    }

    const targetDept = assetObj.department || currentUser?.department || 'ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา';
    setSelectedAssetId(assetObj.id);

    if (editingProc) {
      const updated = procedures.map(p => p.id === editingProc.id ? {
        ...p,
        assetId: assetObj.id,
        assetName: assetObj.name,
        assetCode: assetObj.id,
        location: assetObj.location || targetDept,
        department: targetDept,
        procedure: formProcedure,
        frequency: formFrequency,
        frequencyType: formFreqType,
        responsiblePerson: formPerson || assetObj.responsiblePerson || 'เจ้าหน้าที่ที่ใช้งาน',
        linkedContractId: formContractId || undefined
      } : p);
      saveProceduresToStorage(updated);
    } else {
      const newProc: QualityProcedure = {
        id: `qproc-${Date.now()}`,
        assetId: assetObj.id,
        assetName: assetObj.name,
        assetCode: assetObj.id,
        location: assetObj.location || targetDept,
        department: targetDept,
        procedure: formProcedure,
        frequency: formFrequency,
        frequencyType: formFreqType,
        responsiblePerson: formPerson || assetObj.responsiblePerson || 'เจ้าหน้าที่ที่ใช้งาน',
        linkedContractId: formContractId || undefined
      };
      saveProceduresToStorage([...procedures, newProc]);

      // Ensure newly added procedure is immediately visible
      if (deptFilter !== 'all' && deptFilter !== targetDept) {
        setDeptFilter('all');
      }
      setSearchQuery('');
    }
    setIsProcModalOpen(false);
  };

  const handleDeleteProcedure = (procId: string) => {
    if (!window.confirm('คุณต้องการลบข้อกำหนดวิธีบำรุงรักษานี้ใช่หรือไม่?')) return;
    const updated = procedures.filter(p => p.id !== procId);
    saveProceduresToStorage(updated);
  };

  // Toggle Cell Matrix State (Plan O vs Completed /)
  const toggleMatrixCell = (procId: string, periodKey: string) => {
    const key = `${procId}_${periodKey}`;
    const current = matrixData[key];

    let updatedCell: QualityLogMatrixCell;
    if (!current) {
      // Step 1: Set Plan (O)
      updatedCell = { procedureId: procId, periodKey, isPlanned: true, isCompleted: false };
    } else if (current.isPlanned && !current.isCompleted) {
      // Step 2: Set Completed (/)
      updatedCell = { ...current, isCompleted: true, completedDate: new Date().toLocaleDateString('th-TH') };
    } else {
      // Step 3: Clear cell
      const newMatrix = { ...matrixData };
      delete newMatrix[key];
      saveMatrixToStorage(newMatrix);
      return;
    }

    saveMatrixToStorage({ ...matrixData, [key]: updatedCell });
  };

  // Filtered Procedures
  const filteredProcedures = useMemo(() => {
    return procedures.filter(p => {
      if (deptFilter !== 'all' && p.department !== deptFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.assetName.toLowerCase().includes(q) || p.assetCode.toLowerCase().includes(q) || p.procedure.toLowerCase().includes(q) || p.responsiblePerson.toLowerCase().includes(q);
      }
      return true;
    });
  }, [procedures, deptFilter, searchQuery]);

  // Selected Asset for Daily/Period Forms
  const selectedAsset = useMemo(() => {
    return assets.find(a => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  return (
    <div className="module-container animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Header Title Section */}
      <div className="module-title-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem' }}>
            <FileText color="var(--primary)" size={26} /> เอกสารคุณภาพและแผนบำรุงรักษาเครื่องมือ/ห้องสะอาด (Module 11)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            ควบคุมบัญชีมาตรฐานเครื่องมือและห้องสะอาด (Form BWI 021/001) พร้อมออกรายงานตารางแผนบันทึกบำรุงรักษาประจำวัน (BWI 021/002) และประจำสัปดาห์/เดือน/ปี (BWI 021/003)
          </p>
        </div>

        {/* Tab Switcher Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveTab('master')}
            className={`btn btn-sm ${activeTab === 'master' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
          >
            📋 บัญชีรายชื่อ (BWI 021/001)
          </button>
          <button 
            onClick={() => setActiveTab('daily_log')}
            className={`btn btn-sm ${activeTab === 'daily_log' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
          >
            📅 บันทึกประจำวัน (BWI 021/002)
          </button>
          <button 
            onClick={() => setActiveTab('period_log')}
            className={`btn btn-sm ${activeTab === 'period_log' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
          >
            🗓️ บันทึกสัปดาห์/เดือน/ปี (BWI 021/003)
          </button>
        </div>
      </div>

      {/* --- TAB 1: MASTER LIST (BWI 021/001) --- */}
      {activeTab === 'master' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Action Filter Bar */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="ค้นชื่อเครื่องมือ, รหัส, วิธีบำรุงรักษา, หรือผู้รับผิดชอบ..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={() => {
                  setEditingProc(null);
                  setFormAssetId(assets[0]?.id || '');
                  setFormProcedure('');
                  setFormFrequency('');
                  setFormFreqType('daily');
                  setFormPerson('');
                  setFormContractId('');
                  setIsProcModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.8rem' }}
              >
                <Plus size={15} /> เพิ่มกำหนดวิธีบำรุงรักษา
              </button>

              <button 
                onClick={() => setIsPrintMasterOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', border: '1px solid var(--border)' }}
              >
                <Printer size={15} /> 🖨️ พิมพ์แบบฟอร์ม BWI 021/001 (A4)
              </button>
            </div>
          </div>

          {/* Master Table View */}
          <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center', width: '50px' }}>ลำดับ</th>
                  <th style={{ padding: '0.6rem 0.5rem', width: '220px' }}>ชื่อเครื่องมือ / ห้องสะอาด</th>
                  <th style={{ padding: '0.6rem 0.5rem', width: '160px' }}>รหัสเครื่อง</th>
                  <th style={{ padding: '0.6rem 0.5rem', width: '150px' }}>สถานที่ใช้งาน</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>วิธีบำรุงรักษา</th>
                  <th style={{ padding: '0.6rem 0.5rem', width: '110px', textAlign: 'center' }}>ความถี่</th>
                  <th style={{ padding: '0.6rem 0.5rem', width: '150px' }}>ผู้รับผิดชอบ</th>
                  <th style={{ padding: '0.6rem 0.5rem', width: '90px', textAlign: 'center' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcedures.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      ไม่พบข้อมูลกำหนดวิธีบำรุงรักษาเครื่องมือตามเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  filteredProcedures.map((proc, idx) => {
                    const isOutsource = proc.procedure.includes('บริษัท') || proc.responsiblePerson.includes('บริษัท');
                    return (
                      <tr key={proc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: isOutsource ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                        <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ padding: '0.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>{proc.assetName}</td>
                        <td style={{ padding: '0.5rem', fontFamily: 'monospace', color: 'var(--primary)' }}>{proc.assetCode}</td>
                        <td style={{ padding: '0.5rem' }}>📍 {proc.location}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <div>{proc.procedure}</div>
                          {isOutsource && (
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>
                              🧾 สัญญา Outsource (ผูกกับ PM Module 10)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                            {proc.frequency}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem', fontWeight: 600 }}>{proc.responsiblePerson}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                            <button 
                              onClick={() => {
                                setEditingProc(proc);
                                setFormAssetId(proc.assetId);
                                setFormProcedure(proc.procedure);
                                setFormFrequency(proc.frequency);
                                setFormFreqType(proc.frequencyType);
                                setFormPerson(proc.responsiblePerson);
                                setFormContractId(proc.linkedContractId || '');
                                setIsProcModalOpen(true);
                              }}
                              className="btn btn-ghost btn-xs" 
                              style={{ padding: '0.15rem 0.35rem', border: '1px solid var(--border)' }}
                              title="แก้ไขวิธีบำรุงรักษา"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteProcedure(proc.id)}
                              className="btn btn-ghost btn-xs text-danger" 
                              style={{ padding: '0.15rem 0.35rem', border: '1px solid var(--border)' }}
                              title="ลบ"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: DAILY LOG MATRIX (BWI 021/002) --- */}
      {activeTab === 'daily_log' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Asset Selector & Controls */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', flex: 1, maxWidth: '600px' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <SearchableAssetSelect 
                  assets={assets.filter(a => a.department === deptFilter || deptFilter === 'all')}
                  selectedAssetId={selectedAssetId}
                  onSelectAsset={(id) => setSelectedAssetId(id)}
                  label="🔍 เลือกเครื่องมือ / ห้องสะอาด (ค้นหาได้):"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>เลือกปี พ.ศ.:</label>
                <select 
                  className="form-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{ width: '100px', fontSize: '0.85rem' }}
                >
                  <option value="2569">2569</option>
                  <option value="2570">2570</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => setIsPrintDailyOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              <Printer size={15} /> 🖨️ พิมพ์ใบบันทึกประจำวัน BWI 021/002 (A4)
            </button>
          </div>

          {/* Asset Summary Details */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', background: 'var(--bg-secondary)' }}>
            <div>📌 <strong>เครื่องมือ:</strong> {selectedAsset.name}</div>
            <div>🔢 <strong>รหัสเครื่อง:</strong> <code style={{ color: 'var(--primary)' }}>{selectedAsset.id}</code></div>
            <div>📍 <strong>สถานที่:</strong> {selectedAsset.location || selectedAsset.department}</div>
            <div>👤 <strong>ผู้รับผิดชอบ:</strong> {selectedAsset.responsiblePerson || 'เจ้าหน้าที่ที่ใช้งาน'}</div>
          </div>

          {/* Interactive Daily Matrix Table for July / August */}
          <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)' }}>
              📅 ตารางบันทึกประจำวัน (คลิกที่ช่องเพื่อตั้งค่า แผน [O] -&gt; ปฏิบัติสำเร็จ [/] -&gt; เคลียร์)
            </h4>

            {(() => {
              const dailyProcs = procedures.filter(p => {
                if (p.assetId !== selectedAssetId) return false;
                if (p.frequencyType === 'period') return false; // Strictly exclude period items
                if (p.frequencyType === 'daily') return true;
                const f = (p.frequency || '').toLowerCase();
                return f.includes('วัน') || f.includes('ใช้');
              });

              if (dailyProcs.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    ยังไม่มีข้อกำหนดวิธีบำรุงรักษาประจำวันสำหรับเครื่องมือนี้ (ข้อกำหนดที่ตั้งไว้เป็นประจำสัปดาห์/เดือน/ปี จะแสดงในแถบ BWI 021/003)
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Month 7: July */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      🗓️ เดือน กรกฎาคม {selectedYear}
                    </div>
                    <table style={{ width: '100%', fontSize: '0.725rem', borderCollapse: 'collapse', textAlign: 'center' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                          <th style={{ width: '220px', textAlign: 'left', padding: '0.4rem' }}>รายการวิธีบำรุงรักษา</th>
                          <th style={{ width: '50px', padding: '0.4rem' }}>ประเภท</th>
                          {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                            <th key={day} style={{ padding: '0.2rem', minWidth: '24px' }}>{day}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dailyProcs.map(proc => (
                          <React.Fragment key={proc.id}>
                            {/* Plan Row (O) */}
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td rowSpan={2} style={{ textAlign: 'left', padding: '0.4rem', fontWeight: 600, borderRight: '1px solid var(--border)' }}>
                                {proc.procedure} <span style={{ color: 'var(--warning)', fontSize: '0.65rem' }}>({proc.frequency})</span>
                              </td>
                              <td style={{ background: 'rgba(59, 130, 246, 0.05)', fontWeight: 700, color: 'var(--primary)' }}>แผน</td>
                              {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                                const cellKey = `${proc.id}_7-${day}`;
                                const cell = matrixData[cellKey];
                                return (
                                  <td 
                                    key={day}
                                    onClick={() => toggleMatrixCell(proc.id, `7-${day}`)}
                                    style={{ cursor: 'pointer', background: cell?.isPlanned ? 'rgba(234, 179, 8, 0.15)' : 'transparent', fontWeight: 700 }}
                                  >
                                    {cell?.isPlanned ? 'O' : ''}
                                  </td>
                                );
                              })}
                            </tr>
                            {/* Execute Row (/) */}
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ background: 'rgba(34, 197, 94, 0.05)', fontWeight: 700, color: 'var(--success)' }}>ผู้ปฏิบัติ</td>
                              {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                                const cellKey = `${proc.id}_7-${day}`;
                                const cell = matrixData[cellKey];
                                return (
                                  <td 
                                    key={day}
                                    onClick={() => toggleMatrixCell(proc.id, `7-${day}`)}
                                    style={{ cursor: 'pointer', background: cell?.isCompleted ? 'rgba(34, 197, 94, 0.2)' : 'transparent', fontWeight: 800, color: 'var(--success)' }}
                                  >
                                    {cell?.isCompleted ? '✓' : ''}
                                  </td>
                                );
                              })}
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- TAB 3: PERIOD LOG MATRIX (BWI 021/003) --- */}
      {activeTab === 'period_log' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Asset Selector & Controls */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', flex: 1, maxWidth: '600px' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <SearchableAssetSelect 
                  assets={assets.filter(a => a.department === deptFilter || deptFilter === 'all')}
                  selectedAssetId={selectedAssetId}
                  onSelectAsset={(id) => setSelectedAssetId(id)}
                  label="🔍 เลือกเครื่องมือ / ห้องสะอาด (ค้นหาได้):"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>เลือกปี พ.ศ.:</label>
                <select 
                  className="form-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{ width: '100px', fontSize: '0.85rem' }}
                >
                  <option value="2569">2569</option>
                  <option value="2570">2570</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => setIsPrintPeriodOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              <Printer size={15} /> 🖨️ พิมพ์ใบบันทึกสัปดาห์/เดือน/ปี BWI 021/003 (A4)
            </button>
          </div>

          {/* Interactive Period Matrix Table */}
          <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)' }}>
              🗓️ ตารางบันทึกประจำสัปดาห์/เดือน/ปี (ม.ค. - ธ.ค. {selectedYear})
            </h4>

            {(() => {
              const rawPeriodProcs = procedures.filter(p => {
                if (p.assetId !== selectedAssetId) return false;
                if (p.frequencyType === 'daily') return false;
                if (p.frequencyType === 'period') return true;
                const f = (p.frequency || '').toLowerCase();
                return f.includes('สัปดาห์') || f.includes('เดือน') || f.includes('ปี');
              });

              if (rawPeriodProcs.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    ยังไม่มีข้อกำหนดวิธีบำรุงรักษาประจำสัปดาห์/เดือน/ปีสำหรับเครื่องมือนี้ (ข้อกำหนดที่ตั้งไว้เป็นประจำวัน จะแสดงในแถบ BWI 021/002)
                  </div>
                );
              }

              const periodSlots = [0, 1, 2].map(i => rawPeriodProcs[i] || null);

              const renderInteractiveHalf = (monthsList: MonthDef[], title: string) => (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--primary)' }}>
                    {title}
                  </div>
                  <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ width: '200px', textAlign: 'left', padding: '0.4rem' }}>รายการวิธีบำรุงรักษา</th>
                        <th style={{ width: '50px', padding: '0.4rem' }}>ประเภท</th>
                        {monthsList.map(m => (
                          <th key={m.name} colSpan={m.weeks.length} style={{ padding: '0.3rem', borderLeft: '1px solid var(--border)' }}>{m.name}</th>
                        ))}
                      </tr>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.625rem' }}>
                        <th></th>
                        <th>วันที่</th>
                        {monthsList.map(m => (
                          m.weeks.map((w, wIdx) => (
                            <th key={`${m.name}-${w}`} style={{ borderLeft: wIdx === 0 ? '1px solid var(--border)' : 'none', padding: '0.2rem' }}>{w}</th>
                          ))
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {periodSlots.map((proc, slotIdx) => (
                        <React.Fragment key={proc?.id || `empty-${slotIdx}`}>
                          {/* Plan Row */}
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td rowSpan={3} style={{ textAlign: 'left', padding: '0.4rem', fontWeight: 650, borderRight: '1px solid var(--border)' }}>
                              {proc ? `${proc.procedure} (${proc.frequency})` : '-'}
                            </td>
                            <td style={{ background: 'rgba(59, 130, 246, 0.05)', fontWeight: 700, color: 'var(--primary)' }}>แผน</td>
                            {monthsList.map(m => (
                              m.weeks.map((w, wIdx) => {
                                if (!proc) return <td key={`${m.monthNum}-${wIdx}`} style={{ borderLeft: wIdx === 0 ? '1px solid var(--border)' : 'none' }}></td>;
                                const cellKey = `${proc.id}_${m.monthNum}-w${wIdx + 1}`;
                                const cell = matrixData[cellKey];
                                return (
                                  <td 
                                    key={`${m.monthNum}-${wIdx}`}
                                    onClick={() => toggleMatrixCell(proc.id, `${m.monthNum}-w${wIdx + 1}`)}
                                    style={{ cursor: 'pointer', borderLeft: wIdx === 0 ? '1px solid var(--border)' : 'none', background: cell?.isPlanned ? 'rgba(234, 179, 8, 0.15)' : 'transparent', fontWeight: 700 }}
                                  >
                                    {cell?.isPlanned ? 'O' : ''}
                                  </td>
                                );
                              })
                            ))}
                          </tr>
                          {/* Execute Row */}
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ background: 'rgba(34, 197, 94, 0.05)', fontWeight: 700, color: 'var(--success)' }}>ผู้ปฏิบัติ</td>
                            {monthsList.map(m => (
                              m.weeks.map((w, wIdx) => {
                                if (!proc) return <td key={`${m.monthNum}-${wIdx}`} style={{ borderLeft: wIdx === 0 ? '1px solid var(--border)' : 'none' }}></td>;
                                const cellKey = `${proc.id}_${m.monthNum}-w${wIdx + 1}`;
                                const cell = matrixData[cellKey];
                                return (
                                  <td 
                                    key={`${m.monthNum}-${wIdx}`}
                                    onClick={() => toggleMatrixCell(proc.id, `${m.monthNum}-w${wIdx + 1}`)}
                                    style={{ cursor: 'pointer', borderLeft: wIdx === 0 ? '1px solid var(--border)' : 'none', background: cell?.isCompleted ? 'rgba(34, 197, 94, 0.2)' : 'transparent', fontWeight: 800, color: 'var(--success)' }}
                                  >
                                    {cell?.isCompleted ? '✓' : ''}
                                  </td>
                                );
                              })
                            ))}
                          </tr>
                          {/* Date Row */}
                          <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                            <td style={{ background: 'var(--bg-secondary)', fontSize: '0.625rem' }}>วันที่ทำ</td>
                            {monthsList.map(m => (
                              m.weeks.map((w, wIdx) => {
                                if (!proc) return <td key={`${m.monthNum}-${wIdx}`} style={{ borderLeft: wIdx === 0 ? '1px solid var(--border)' : 'none' }}></td>;
                                const cellKey = `${proc.id}_${m.monthNum}-w${wIdx + 1}`;
                                const cell = matrixData[cellKey];
                                return (
                                  <td key={`${m.monthNum}-${wIdx}`} style={{ fontSize: '0.55rem', borderLeft: wIdx === 0 ? '1px solid var(--border)' : 'none' }}>
                                    {cell?.completedDate ? cell.completedDate.slice(0, 5) : ''}
                                  </td>
                                );
                              })
                            ))}
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              );

              return (
                <div>
                  {renderInteractiveHalf(BWI_021_003_UPPER_MONTHS, '📅 ครึ่งปีแรก (มกราคม - มิถุนายน)')}
                  {renderInteractiveHalf(BWI_021_003_LOWER_MONTHS, '📅 ครึ่งปีหลัง (กรกฎาคม - ธันวาคม)')}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- MODAL: ADD / EDIT PROCEDURE --- */}
      {isProcModalOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10050, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
          <form onSubmit={handleSaveProcedure} className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '580px', width: '100%', background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                {editingProc ? '✏️ แก้ไขข้อกำหนดวิธีบำรุงรักษา' : '➕ เพิ่มข้อกำหนดวิธีบำรุงรักษาใหม่'}
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsProcModalOpen(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              
              {/* SEARCHABLE ASSET SELECTOR */}
              <SearchableAssetSelect 
                assets={assets}
                selectedAssetId={formAssetId}
                onSelectAsset={(id) => setFormAssetId(id)}
                label="📌 เลือกรายการครุภัณฑ์ / ห้องสะอาด (พิมพ์ค้นหาได้ง่าย):"
                placeholder="พิมพ์ค้นหาชื่อเครื่องมือ, รหัสพัสดุ (เช่น TERUMO, Plumatex, 0725...), หรือชื่อห้อง..."
              />

              <div className="form-group">
                <label className="form-label">🛠️ ข้อกำหนด / วิธีบำรุงรักษา</label>
                <textarea 
                  className="form-input"
                  rows={3}
                  placeholder="ป้อนวิธีบำรุงรักษา..."
                  value={formProcedure}
                  onChange={(e) => setFormProcedure(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">🔄 ข้อความความถี่</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="เช่น วันที่ใช้งาน, 1 สัปดาห์, 3 เดือน, 1 ปี"
                    value={formFrequency}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormFrequency(val);
                      const lower = val.toLowerCase();
                      if (lower.includes('สัปดาห์') || lower.includes('เดือน') || lower.includes('ปี')) {
                        setFormFreqType('period');
                      } else if (lower.includes('วัน') || lower.includes('ใช้')) {
                        setFormFreqType('daily');
                      }
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">📋 ตารางบันทึกที่สังกัด</label>
                  <select 
                    className="form-select"
                    value={formFreqType}
                    onChange={(e) => setFormFreqType(e.target.value as 'daily' | 'period')}
                  >
                    <option value="daily">ประจำวัน (Form BWI 021/002)</option>
                    <option value="period">ประจำสัปดาห์/เดือน/ปี (Form BWI 021/003)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">👤 ผู้รับผิดชอบ / บริษัท Outsource ผู้รับจ้าง</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="เช่น ชาตินีย์, เจ้าหน้าที่ที่ใช้งาน, หรือ บริษัท Getinge"
                  value={formPerson}
                  onChange={(e) => setFormPerson(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">🧾 เชื่อมโยงกับสัญญา Outsource (Module 10 - ตัวเลือก)</label>
                <select 
                  className="form-select"
                  value={formContractId}
                  onChange={(e) => setFormContractId(e.target.value)}
                >
                  <option value="">-- ไม่เชื่อมโยง (การทำบำรุงรักษาภายใน) --</option>
                  {contracts.map(c => (
                    <option key={c.id} value={c.id}>{c.contractNumber} - {c.title} ({c.vendorName})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsProcModalOpen(false)}>ยกเลิก</button>
              <button type="submit" className="btn btn-primary">💾 บันทึกข้อมูล</button>
            </div>
          </form>
        </div>
      )}

      {/* --- PRINT A4 MODAL 1: FORM BWI 021/001 (EXACT MATCH IMAGE 1) --- */}
      {isPrintMasterOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10050, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          
          {/* Action Bar */}
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '900px', width: '100%', margin: '0 auto 1rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10060 }}>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--primary)' }}>🖨️ พิมพ์แบบฟอร์ม BWI 021/001 (A4)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>บัญชีรายชื่อเครื่องมือและห้องสะอาดที่ต้องบำรุงรักษา</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={() => window.print()}>🖨️ สั่งพิมพ์เอกสาร (Print)</button>
              <button className="btn btn-secondary" onClick={() => setIsPrintMasterOpen(false)}>ปิดหน้าต่าง</button>
            </div>
          </div>

          {/* Printable A4 Sheet */}
          <div className="a4-page-preview" style={{ background: '#fff', color: '#000', fontFamily: "'Sarabun', 'TH Sarabun PSK', sans-serif", width: '210mm', minHeight: '297mm', padding: '15mm', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontSize: '13px', lineHeight: 1.3 }}>
            
            {/* Header Right */}
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#333' }}>หน้า 1 / 1</div>

            {/* Document Title */}
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', margin: '10px 0 15px 0' }}>
              บัญชีรายชื่อเครื่องมือและห้องสะอาดที่ต้องบำรุงรักษา
            </div>

            {/* Department Header */}
            <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
              ฝ่าย &nbsp;&nbsp;&nbsp;ผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', textAlign: 'center' }}>
                  <th style={{ border: '1px solid #000', padding: '6px 4px', width: '5%' }}>ลำดับที่</th>
                  <th style={{ border: '1px solid #000', padding: '6px 4px', width: '25%' }}>ชื่อเครื่องมือ</th>
                  <th style={{ border: '1px solid #000', padding: '6px 4px', width: '18%' }}>รหัสเครื่อง</th>
                  <th style={{ border: '1px solid #000', padding: '6px 4px', width: '17%' }}>สถานที่ใช้งาน</th>
                  <th style={{ border: '1px solid #000', padding: '6px 4px', width: '25%' }}>วิธีบำรุงรักษา</th>
                  <th style={{ border: '1px solid #000', padding: '6px 4px', width: '10%' }}>ความถี่บำรุงรักษา</th>
                  <th style={{ border: '1px solid #000', padding: '6px 4px', width: '15%' }}>ผู้รับผิดชอบ</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcedures.map((proc, idx) => (
                  <tr key={proc.id}>
                    <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>{proc.assetName}</td>
                    <td style={{ border: '1px solid #000', padding: '5px', fontFamily: 'monospace' }}>{proc.assetCode}</td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>{proc.location}</td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>- {proc.procedure}</td>
                    <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{proc.frequency}</td>
                    <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{proc.responsiblePerson}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Signatures */}
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '13px' }}>
              <div>
                <div>ลงชื่อ ________________________________________</div>
                <div style={{ marginTop: '5px' }}>หัวหน้าฝ่าย &nbsp;&nbsp;ผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>วันที่ &nbsp;20 / 05 / 2569</div>
              </div>
            </div>

            {/* Form Code Footer */}
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555', borderTop: '1px solid #ccc', paddingTop: '5px' }}>
              <div>แบบฟอร์มเลขที่ BWI 021/001</div>
              <div>แก้ไขครั้งที่ 01/0150</div>
            </div>

          </div>
        </div>
      )}

      {/* --- PRINT A4 MODAL 2: FORM BWI 021/002 (EXACT MATCH IMAGE 2) --- */}
      {isPrintDailyOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10050, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '1050px', width: '100%', margin: '0 auto 1rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10060 }}>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--primary)' }}>🖨️ พิมพ์ใบบันทึกประจำวัน BWI 021/002 (A4 Landscape)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>แผน/บันทึกการบำรุงรักษาเครื่องมือและห้องสะอาด (วัน)</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={() => window.print()}>🖨️ สั่งพิมพ์เอกสาร (Print)</button>
              <button className="btn btn-secondary" onClick={() => setIsPrintDailyOpen(false)}>ปิดหน้าต่าง</button>
            </div>
          </div>

          <div className="a4-page-preview" style={{ background: '#fff', color: '#000', fontFamily: "'Sarabun', 'TH Sarabun PSK', sans-serif", width: '297mm', minHeight: '210mm', padding: '10mm', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontSize: '11px', lineHeight: 1.2 }}>
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15px', marginBottom: '10px' }}>
              แผน/บันทึกการบำรุงรักษาเครื่องมือและห้องสะอาด (วัน)
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px', fontWeight: 'bold' }}>
              <div>ชื่อเครื่องมือ: {selectedAsset.name}</div>
              <div>รหัส: {selectedAsset.id}</div>
              <div>สถานที่: {selectedAsset.location || selectedAsset.department}</div>
              <div>ปี: {selectedYear}</div>
              <div>ผู้รับผิดชอบ: {selectedAsset.responsiblePerson || 'เครือวัลย์ เปรมฤดี'}</div>
            </div>

            {/* July Table */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>เดือน กรกฎาคม</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10px', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #000', width: '180px', textAlign: 'left', padding: '3px' }}>รายการ (ความถี่)</th>
                    <th style={{ border: '1px solid #000', width: '40px' }}>เดือน</th>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                      <th key={d} style={{ border: '1px solid #000', width: '20px' }}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #000', textAlign: 'left', padding: '3px' }}></td>
                    <td style={{ border: '1px solid #000' }}>น้ำยาฆ่าเชื้อ</td>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                      <td key={d} style={{ border: '1px solid #000' }}>{d <= 5 || (d >= 13 && d <= 17) || d >= 27 ? '1' : '2'}</td>
                    ))}
                  </tr>
                  {procedures.filter(p => p.assetId === selectedAssetId && p.frequencyType === 'daily').map(proc => (
                    <React.Fragment key={proc.id}>
                      <tr>
                        <td rowSpan={2} style={{ border: '1px solid #000', textAlign: 'left', padding: '3px' }}>{proc.procedure} ({proc.frequency})</td>
                        <td style={{ border: '1px solid #000' }}>แผน</td>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                          <td key={d} style={{ border: '1px solid #000' }}>{matrixData[`${proc.id}_7-${d}`]?.isPlanned ? 'O' : ''}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000' }}>ผู้ปฏิบัติ</td>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                          <td key={d} style={{ border: '1px solid #000' }}>{matrixData[`${proc.id}_7-${d}`]?.isCompleted ? '/' : ''}</td>
                        ))}
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <div>หมายเหตุ วงกลม (O) หมายถึง วันที่ต้องทำการบำรุงรักษา เมื่อดำเนินการแล้ว ให้ทำเครื่องหมายถูก (/) ในวงกลมที่ระบุ</div>
              <div>น้ำยาฆ่าเชื้อ (1) Chlorhex - C &nbsp;&nbsp;(2) Benz Cl</div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <div>จัดทำโดย: ____________________ (ทิวัตถ์)</div>
              <div>อนุมัติโดย: ____________________ (วรพงศ์)</div>
              <div>วันที่: 1/7/2026</div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#555', borderTop: '1px solid #ccc', paddingTop: '4px' }}>
              <div>แบบฟอร์มเลขที่ BWI 021/002</div>
              <div>แก้ไขครั้งที่ 01/0150</div>
            </div>
          </div>
        </div>
      )}

      {/* --- PRINT A4 MODAL 3: FORM BWI 021/003 (EXACT MATCH IMAGE 2) --- */}
      {isPrintPeriodOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10050, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '1050px', width: '100%', margin: '0 auto 1rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10060 }}>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--primary)' }}>🖨️ พิมพ์ใบบันทึกสัปดาห์/เดือน/ปี BWI 021/003 (A4 Landscape)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>แผน/บันทึกการบำรุงรักษาเครื่องมือและห้องสะอาด (สัปดาห์/เดือน/ปี)</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={() => window.print()}>🖨️ สั่งพิมพ์เอกสาร (Print)</button>
              <button className="btn btn-secondary" onClick={() => setIsPrintPeriodOpen(false)}>ปิดหน้าต่าง</button>
            </div>
          </div>

          <div className="a4-page-preview" style={{ background: '#fff', color: '#000', fontFamily: "'Sarabun', 'TH Sarabun PSK', sans-serif", width: '297mm', minHeight: '210mm', padding: '8mm 10mm', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontSize: '10px', lineHeight: 1.2 }}>
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
              แผน/บันทึกการบำรุงรักษาเครื่องมือและห้องสะอาด (สัปดาห์/เดือน/ปี)
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', fontWeight: 'bold' }}>
              <div>ชื่อเครื่องมือ &nbsp;&nbsp;&nbsp;&nbsp;{selectedAsset.name}</div>
              <div>รหัส &nbsp;{selectedAsset.id}</div>
              <div>สถานที่ &nbsp;&nbsp;{selectedAsset.location || selectedAsset.department}</div>
              <div>ปี &nbsp;&nbsp;{selectedYear}</div>
              <div>ผู้รับผิดชอบ &nbsp;&nbsp;{selectedAsset.responsiblePerson || 'ชาตินีย์'}</div>
            </div>

            {(() => {
              const rawPeriodProcs = procedures.filter(p => {
                if (p.assetId !== selectedAssetId) return false;
                if (p.frequencyType === 'daily') return false;
                if (p.frequencyType === 'period') return true;
                const f = (p.frequency || '').toLowerCase();
                return f.includes('สัปดาห์') || f.includes('เดือน') || f.includes('ปี');
              });

              // Pad to exactly 3 slots for official form layout
              const periodSlots = [0, 1, 2].map(i => rawPeriodProcs[i] || null);

              const renderPrintHalfTable = (monthsList: MonthDef[]) => (
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '9px', textAlign: 'center', marginBottom: '10px' }}>
                  <thead>
                    <tr style={{ background: '#ffffff' }}>
                      <th style={{ border: '1px solid #000', width: '140px', padding: '2px' }}>รายการ</th>
                      <th style={{ border: '1px solid #000', width: '35px' }}>เดือน</th>
                      {monthsList.map(m => (
                        <th key={m.name} colSpan={m.weeks.length} style={{ border: '1px solid #000', padding: '2px' }}>{m.name}</th>
                      ))}
                    </tr>
                    <tr style={{ background: '#ffffff', fontSize: '8px' }}>
                      <th style={{ border: '1px solid #000' }}>(ความถี่)</th>
                      <th style={{ border: '1px solid #000' }}>วันที่</th>
                      {monthsList.map(m => (
                        m.weeks.map((w) => (
                          <th key={`${m.name}-${w}`} style={{ border: '1px solid #000', padding: '1px' }}>{w}</th>
                        ))
                      ))}
                    </tr>
                    <tr style={{ background: '#ffffff', fontSize: '7.5px' }}>
                      <th style={{ border: '1px solid #000' }}></th>
                      <th style={{ border: '1px solid #000' }}>น้ำยาฆ่าเชื้อ</th>
                      {monthsList.map(m => (
                        m.weeks.map((w, idx) => (
                          <th key={`dis-${m.name}-${idx}`} style={{ border: '1px solid #000', fontWeight: 'normal' }}>-</th>
                        ))
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periodSlots.map((proc, slotIdx) => (
                      <React.Fragment key={proc?.id || `print-empty-${slotIdx}`}>
                        <tr>
                          <td rowSpan={3} style={{ border: '1px solid #000', textAlign: 'left', padding: '3px 4px', fontSize: '8.5px', verticalAlign: 'middle', width: '140px' }}>
                            {proc ? `${proc.procedure} (${proc.frequency})` : ''}
                          </td>
                          <td style={{ border: '1px solid #000', padding: '1px' }}>แผน</td>
                          {monthsList.map(m => (
                            m.weeks.map((w, wIdx) => {
                              if (!proc) return <td key={`p-${m.monthNum}-${wIdx}`} style={{ border: '1px solid #000' }}></td>;
                              const cellKey = `${proc.id}_${m.monthNum}-w${wIdx + 1}`;
                              const cell = matrixData[cellKey];
                              return (
                                <td key={`p-${m.monthNum}-${wIdx}`} style={{ border: '1px solid #000', fontSize: '8.5px', fontWeight: 'bold' }}>
                                  {cell?.isPlanned ? 'O' : ''}
                                </td>
                              );
                            })
                          ))}
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #000', padding: '1px' }}>ผู้ปฏิบัติ</td>
                          {monthsList.map(m => (
                            m.weeks.map((w, wIdx) => {
                              if (!proc) return <td key={`e-${m.monthNum}-${wIdx}`} style={{ border: '1px solid #000' }}></td>;
                              const cellKey = `${proc.id}_${m.monthNum}-w${wIdx + 1}`;
                              const cell = matrixData[cellKey];
                              return (
                                <td key={`e-${m.monthNum}-${wIdx}`} style={{ border: '1px solid #000', fontSize: '8.5px', fontWeight: 'bold' }}>
                                  {cell?.isCompleted ? '/' : ''}
                                </td>
                              );
                            })
                          ))}
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #000', padding: '1px', fontSize: '7.5px' }}>วันที่</td>
                          {monthsList.map(m => (
                            m.weeks.map((w, wIdx) => {
                              if (!proc) return <td key={`d-${m.monthNum}-${wIdx}`} style={{ border: '1px solid #000' }}></td>;
                              const cellKey = `${proc.id}_${m.monthNum}-w${wIdx + 1}`;
                              const cell = matrixData[cellKey];
                              return (
                                <td key={`d-${m.monthNum}-${wIdx}`} style={{ border: '1px solid #000', fontSize: '6.5px' }}>
                                  {cell?.completedDate ? cell.completedDate.slice(0, 5) : ''}
                                </td>
                              );
                            })
                          ))}
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              );

              return (
                <div>
                  {/* Upper Half: Jan - Jun */}
                  {renderPrintHalfTable(BWI_021_003_UPPER_MONTHS)}

                  {/* Lower Half: Jul - Dec */}
                  {renderPrintHalfTable(BWI_021_003_LOWER_MONTHS)}
                </div>
              );
            })()}

            {/* Official Form Footer */}
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '8.5px' }}>
              <div>หมายเหตุ วงกลม (O) หมายถึง สัปดาห์ที่ต้องทำการบำรุงรักษาเครื่องมือหรือห้องสะอาด เมื่อดำเนินการตามแผนแล้ว ให้ทำเครื่องหมายถูก (/) ในวงกลมที่ระบุ</div>
              <div style={{ fontWeight: 'bold' }}>น้ำยาฆ่าเชื้อ (1) Chlorhex-C (2) Benz Cl</div>
            </div>

            <div style={{ marginTop: '4px', fontSize: '8.5px', fontStyle: 'normal' }}>
              เปลี่ยนแบตเตอรี่ (1 ปี) ครั้งล่าสุด 1/7/2568 ใช้แบต Mitsubishi 3.6V และตอนเปลี่ยนให้เปิดเครื่องไว้
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '30px', fontSize: '9.5px' }}>
              <div>จัดทำโดย &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____________________ (ทิวัตถ์)</div>
              <div>อนุมัติโดย &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____________________ (วรพงศ์)</div>
              <div>วันที่ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;30/12/2025</div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#333', borderTop: '1px solid #aaa', paddingTop: '4px' }}>
              <div>แบบฟอร์มเลขที่ BWI 021/003</div>
              <div>แก้ไขครั้งที่ 01/0150</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
