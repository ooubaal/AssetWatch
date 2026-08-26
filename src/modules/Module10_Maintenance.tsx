import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, Calendar, FileText, Bell, Plus, CheckCircle, Clock, AlertTriangle, 
  Trash2, Phone, User, Building, ExternalLink, Printer, ChevronLeft, ChevronRight, Camera, Search, ArrowRight, RefreshCw 
} from 'lucide-react';
import { Asset, PMContract, PMSchedule, PMNotification, RepairCase, UserAccount } from '../utils/mockData';
import { uploadImage, compressFileOrPdf } from '../services/dbService';
import { SearchableSelect } from '../components/SearchableSelect';
import confetti from 'canvas-confetti';

interface Module10MaintenanceProps {
  assets: Asset[];
  repairs: RepairCase[];
  contracts: PMContract[];
  schedules: PMSchedule[];
  notifications: PMNotification[];
  onAddContract: (contract: PMContract) => Promise<void>;
  onUpdateContract: (id: string, updates: Partial<PMContract>) => Promise<void>;
  onDeleteContract: (id: string) => Promise<void>;
  onAddPMSchedule: (schedule: PMSchedule) => Promise<void>;
  onUpdatePMSchedule: (id: string, updates: Partial<PMSchedule>) => Promise<void>;
  onDeletePMSchedule: (id: string) => Promise<void>;
  onAddRepair: (repair: Omit<RepairCase, 'id'>) => Promise<string>;
  onUpdateRepair: (id: string, updates: Partial<RepairCase>) => Promise<void>;
  onUpdateAssetStatus: (id: string, status: Asset['status']) => Promise<void>;
  onLogAudit: (trail: { assetId: string; assetName: string; action: any; operator: string; details: string }) => Promise<void>;
  currentUser: UserAccount | null;
  onRefreshData: () => Promise<void>;
}

export const Module10_Maintenance: React.FC<Module10MaintenanceProps> = ({
  assets,
  repairs,
  contracts,
  schedules,
  notifications,
  onAddContract,
  onUpdateContract,
  onDeleteContract,
  onAddPMSchedule,
  onUpdatePMSchedule,
  onDeletePMSchedule,
  onAddRepair,
  onUpdateRepair,
  onUpdateAssetStatus,
  onLogAudit,
  currentUser,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'contracts' | 'repairs'>('dashboard');
  
  // Year and Month state for Calendar
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth()); // 0-indexed

  // Role permission helpers
  const isOrgWideUser = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const [selectedDeptFilter, setSelectedDeptFilter] = useState(() => {
    return isOrgWideUser ? 'all' : (currentUser?.department || 'all');
  });

  // Lock department filter for Head and Operator roles
  useEffect(() => {
    if (!isOrgWideUser && currentUser?.department) {
      setSelectedDeptFilter(currentUser.department);
    }
  }, [currentUser, isOrgWideUser]);

  // Modal Dialog states
  const [selectedSchedule, setSelectedSchedule] = useState<PMSchedule | null>(null);
  const [isPMFormOpen, setIsPMFormOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [isPrintPlansSummaryOpen, setIsPrintPlansSummaryOpen] = useState(false);
  const [isPrintHistorySummaryOpen, setIsPrintHistorySummaryOpen] = useState(false);

  // PM Recording Form States
  const [completedDate, setCompletedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pmDetails, setPmDetails] = useState('');
  const [pmNotes, setPmNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submittingPM, setSubmittingPM] = useState(false);
  const [pmStatus, setPmStatus] = useState<'completed' | 'postponed' | 'awaiting_repair'>('completed');
  const [nextPMNotes, setNextPMNotes] = useState('');
  const [shouldCreateCM, setShouldCreateCM] = useState(false);
  const [cmSymptom, setCmSymptom] = useState('');

  // Add Contract Form States
  const [isContractFormOpen, setIsContractFormOpen] = useState(false);
  const [contractType, setContractType] = useState<'outsource' | 'internal'>('outsource');
  const [contractNumber, setContractNumber] = useState('');
  const [contractTitle, setContractTitle] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [contractStart, setContractStart] = useState(() => new Date().toISOString().split('T')[0]);
  const [contractEnd, setContractEnd] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [hasNoEndDate, setHasNoEndDate] = useState(false);
  const [modalAssetSearch, setModalAssetSearch] = useState('');
  const [pmFrequency, setPmFrequency] = useState<PMContract['pmFrequency']>('quarterly');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [vendorContact, setVendorContact] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [submittingContract, setSubmittingContract] = useState(false);
  const [editingContract, setEditingContract] = useState<PMContract | null>(null);
  const [customDates, setCustomDates] = useState<string[]>([]);
  const [newCustomDate, setNewCustomDate] = useState('');
  const [assetPMDates, setAssetPMDates] = useState<Record<string, string[]>>({});
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

  // Filtered asset list for Contract modal search
  const filteredModalAssets = useMemo(() => {
    return assets.filter(a => {
      if (a.status === 'รอจำหน่าย') return false;
      if ((currentUser?.role === 'head' || currentUser?.role === 'operator' || currentUser?.role === 'user') && a.department !== currentUser.department) return false;
      if (!modalAssetSearch.trim()) return true;
      const term = modalAssetSearch.toLowerCase().trim();
      return (
        a.id.toLowerCase().includes(term) ||
        a.name.toLowerCase().includes(term) ||
        (a.location && a.location.toLowerCase().includes(term)) ||
        (a.department && a.department.toLowerCase().includes(term))
      );
    });
  }, [assets, currentUser, modalAssetSearch]);

  // Asset-Based PM Tab States
  const [assetPMSearch, setAssetPMSearch] = useState('');
  const [cmRepairSearch, setCmRepairSearch] = useState('');
  const [assetPMTypeFilter, setAssetPMTypeFilter] = useState<'all' | 'has_plan' | 'no_plan' | 'outsource' | 'internal'>('all');
  
  // Logbook Modal States
  const [selectedLogbookAsset, setSelectedLogbookAsset] = useState<Asset | null>(null);
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);

  // Filtered asset list for Tab 3 (Asset-Based Maintenance & Logbook)
  const filteredAssetPMList = useMemo(() => {
    return assets.filter(asset => {
      if (asset.status === 'รอจำหน่าย') return false;
      
      // Dept filter
      if (selectedDeptFilter !== 'all' && asset.department !== selectedDeptFilter) {
        return false;
      }

      // Asset PM plan check
      const assetContracts = contracts.filter(c => c.assetIds.includes(asset.id));
      const hasPlan = assetContracts.length > 0;
      const latestContract = hasPlan ? assetContracts[assetContracts.length - 1] : null;
      const isInternal = latestContract ? latestContract.contractNumber.startsWith('INT-PM-') : false;

      if (assetPMTypeFilter === 'has_plan' && !hasPlan) return false;
      if (assetPMTypeFilter === 'no_plan' && hasPlan) return false;
      if (assetPMTypeFilter === 'outsource' && (!hasPlan || isInternal)) return false;
      if (assetPMTypeFilter === 'internal' && (!hasPlan || !isInternal)) return false;

      if (!assetPMSearch.trim()) return true;
      const term = assetPMSearch.toLowerCase().trim();
      const vendor = latestContract ? latestContract.vendorName.toLowerCase() : '';
      const contractNo = latestContract ? latestContract.contractNumber.toLowerCase() : '';
      const contractTitle = latestContract ? latestContract.title.toLowerCase() : '';

      return (
        asset.id.toLowerCase().includes(term) ||
        asset.name.toLowerCase().includes(term) ||
        (asset.location && asset.location.toLowerCase().includes(term)) ||
        (asset.department && asset.department.toLowerCase().includes(term)) ||
        vendor.includes(term) ||
        contractNo.includes(term) ||
        contractTitle.includes(term)
      );
    });
  }, [assets, contracts, selectedDeptFilter, assetPMTypeFilter, assetPMSearch]);

  // Add Ad-hoc Repair Modal States
  const [isRepairFormOpen, setIsRepairFormOpen] = useState(false);
  const [repairAssetId, setRepairAssetId] = useState('');
  const [repairSymptom, setRepairSymptom] = useState('');
  const [submittingRepair, setSubmittingRepair] = useState(false);

  // CM Repair Workflow States
  const [workflowCase, setWorkflowCase] = useState<RepairCase | null>(null);
  const [workflowAction, setWorkflowAction] = useState<'send' | 'receive' | null>(null);
  
  // Sent form states
  const [repairVendorName, setRepairVendorName] = useState('');
  const [repairContactPhone, setRepairContactPhone] = useState('');
  const [sendProofFile, setSendProofFile] = useState<File | null>(null);
  const [sendProofPreview, setSendProofPreview] = useState<string | null>(null);
  const [submittingSend, setSubmittingSend] = useState(false);

  // Receive form states
  const [receiveDate, setReceiveDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receiveProofFile, setReceiveProofFile] = useState<File | null>(null);
  const [receiveProofPreview, setReceiveProofPreview] = useState<string | null>(null);
  const [submittingReceive, setSubmittingReceive] = useState(false);

  // File Attachment & HD Compression Metadata States
  const [proofInfo, setProofInfo] = useState<{ name: string; size: string; isPdf: boolean } | null>(null);
  const [sendProofInfo, setSendProofInfo] = useState<{ name: string; size: string; isPdf: boolean } | null>(null);
  const [receiveProofInfo, setReceiveProofInfo] = useState<{ name: string; size: string; isPdf: boolean } | null>(null);
  const [compressingProof, setCompressingProof] = useState<boolean>(false);
  const [compressingSendProof, setCompressingSendProof] = useState<boolean>(false);
  const [compressingReceiveProof, setCompressingReceiveProof] = useState<boolean>(false);

  // CM Case Details & Edit States
  const [selectedCMDetailCase, setSelectedCMDetailCase] = useState<RepairCase | null>(null);
  const [isCMDetailOpen, setIsCMDetailOpen] = useState(false);
  const [cmEditNotes, setCmEditNotes] = useState('');
  const [cmEditCost, setCmEditCost] = useState('');
  const [cmEditRepairCompany, setCmEditRepairCompany] = useState('');
  const [cmEditContactPerson, setCmEditContactPerson] = useState('');
  const [cmEditDateReceived, setCmEditDateReceived] = useState('');
  const [cmEditProofFile, setCmEditProofFile] = useState<File | null>(null);
  const [cmEditProofPreview, setCmEditProofPreview] = useState<string | null>(null);
  const [cmEditProofInfo, setCmEditProofInfo] = useState<{ name: string; size: string; isPdf: boolean } | null>(null);
  const [compressingCMEditProof, setCompressingCMEditProof] = useState<boolean>(false);
  const [cmSavingDetail, setCmSavingDetail] = useState<boolean>(false);
  const [isCMPrintReportOpen, setIsCMPrintReportOpen] = useState(false);

  // Universal Media / PDF Fullscreen Lightbox Viewer States
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  // Reschedule (change planned date) states
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<PMSchedule | null>(null);
  const [rescheduleNewDate, setRescheduleNewDate] = useState('');

  // Drag-and-Drop calendar state
  const [draggedSchedule, setDraggedSchedule] = useState<PMSchedule | null>(null);

  // Sync Operator department
  useEffect(() => {
    if (currentUser?.role === 'user') {
      setSelectedDeptFilter(currentUser.department);
    }
  }, [currentUser]);

  // Calendar setup helpers
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate calendar days
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, ...
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const calendarCells: (number | null)[] = [];

  // Pad empty days at start
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  // Fill month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(i);
  }

  // Filter schedules based on current month/year and department
  const getFilteredSchedules = () => {
    return schedules.filter(s => {
      // Parse plannedDate (YYYY-MM-DD)
      const parts = s.plannedDate.split('-');
      if (parts.length !== 3) return false;
      const yr = parseInt(parts[0], 10);
      const mo = parseInt(parts[1], 10) - 1; // 0-indexed
      
      const isCorrectMonth = yr === currentYear && mo === currentMonth;
      if (!isCorrectMonth) return false;

      // Filter by department
      if (selectedDeptFilter !== 'all') {
        const asset = assets.find(a => a.id === s.assetId);
        if (asset && asset.department !== selectedDeptFilter) return false;
      }

      return true;
    });
  };

  const monthSchedules = getFilteredSchedules();

  // Helper for schedule preset check-list
  const getPresetChecklist = (assetName: string) => {
    const name = assetName.toLowerCase();
    if (name.includes('คอมพิวเตอร์') || name.includes('computer') || name.includes('server')) {
      return "1. ทำความสะอาดสิ่งสกปรกและเป่าฝุ่นพัดลมระบายความร้อน\n2. ตรวจสอบการอัปเดตระบบปฏิบัติการและแอนตี้ไวรัส\n3. สแกนตรวจสอบความสมบูรณ์ของดิสก์ SSD/HDD\n4. สำรองข้อมูลระบบ (System Backup)";
    } else if (name.includes('แอร์') || name.includes('ปรับอากาศ') || name.includes('air conditioning')) {
      return "1. ถอดล้างทำความสะอาดแผ่นกรองอากาศคอยล์เย็น\n2. เป่าล้างทำความสะอาดแผงรังผึ้งคอยล์ร้อน\n3. ตรวจเช็คกระแสไฟและวัดแรงดันน้ำยาแอร์\n4. ตรวจสอบท่อน้ำทิ้งป้องกันน้ำแอร์รั่วซึม";
    } else if (name.includes('เครื่องพิมพ์') || name.includes('printer')) {
      return "1. ทำความสะอาดภายในเครื่องและตลับลูกกลิ้งป้อนกระดาษ\n2. ตรวจเช็คระดับหมึกพิมพ์คงเหลือ\n3. ทดสอบการพิมพ์หัวสีและระนาบกระดาษ\n4. อัปเดตไดรเวอร์และเฟิร์มแวร์ระบบพิมพ์";
    }
    return "1. ตรวจสอบความสมบูรณ์โครงสร้างภายนอกอุปกรณ์\n2. ทำความสะอาดคราบฝุ่นละอองสะสม\n3. ทดสอบการเปิด/ปิดสวิตช์และการเชื่อมต่อระบบไฟฟ้า\n4. บันทึกผลสภาพความสมบูรณ์ในการทำงาน";
  };

  // Open PM form
  const handleOpenPMForm = (sched: PMSchedule) => {
    setSelectedSchedule(sched);
    setCompletedDate(sched.completedDate || new Date().toISOString().split('T')[0]);
    // Blank by default as requested by user
    setPmDetails(sched.details || '');
    setPmNotes(sched.notes || '');
    setPmStatus((sched.status === 'pending' ? 'completed' : sched.status) as any);
    setNextPMNotes(sched.nextPMNotes || '');
    setShouldCreateCM(false);
    setCmSymptom('');
    setProofFile(null);
    setProofPreview(sched.proofImageUrl || null);
    setProofInfo(null);
    setIsPMFormOpen(true);
  };

  const handleProofImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      setCompressingProof(true);
      try {
        const compressed = await compressFileOrPdf(file, 1400, 1400, 0.80);
        setProofFile(compressed);
        setProofInfo({
          name: file.name,
          size: `${Math.round(compressed.size / 1024)} KB`,
          isPdf
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setProofPreview(reader.result as string);
          setCompressingProof(false);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        console.error('Proof file compression failed:', err);
        setProofFile(file);
        setProofInfo({
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`,
          isPdf
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setProofPreview(reader.result as string);
          setCompressingProof(false);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Submit PM Record
  const handlePMSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    setSubmittingPM(true);
    try {
      let finalImgUrl = '';
      if (proofFile) {
        finalImgUrl = await uploadImage(proofFile, 'pm_proofs');
      } else {
        finalImgUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60';
      }

      const operatorName = localStorage.getItem('assetwatch_operator') || 'เจ้าหน้าที่พัสดุ';
      let spawnedRepairId: string | undefined = undefined;

      // Check if CM should be opened automatically
      if (shouldCreateCM && cmSymptom.trim()) {
        spawnedRepairId = await onAddRepair({
          assetId: selectedSchedule.assetId,
          assetName: selectedSchedule.assetName,
          symptom: `[สืบเนื่องจากแผน PM: ${selectedSchedule.id}] ${cmSymptom}`,
          dateOpened: completedDate,
          status: 'open',
          operator: operatorName,
          updatedAt: new Date().toISOString()
        });

        // Update Asset status to 'ชำรุด'
        await onUpdateAssetStatus(selectedSchedule.assetId, 'ชำรุด');

        // Log CM Audit Trail
        await onLogAudit({
          assetId: selectedSchedule.assetId,
          assetName: selectedSchedule.assetName,
          action: 'repair_open',
          operator: operatorName,
          details: `เปิดเคส CM แจ้งซ่อมต่อเนื่องจากแผนตรวจเช็คบำรุงรักษา PM รหัสแจ้งซ่อม: ${spawnedRepairId} อาการเสีย: ${cmSymptom}`
        });
      }

      // Translate status label
      let statusLabel = 'เสร็จสมบูรณ์';
      if (pmStatus === 'postponed') statusLabel = 'เลื่อนการตรวจเช็ค';
      else if (pmStatus === 'awaiting_repair') statusLabel = 'ตรวจพบอาการชำรุด/รอซ่อมต่อ';

      // 1. Update Schedule status and details
      // Build update object without undefined values (Firestore rejects undefined)
      const scheduleUpdates: Record<string, any> = {
        status: pmStatus,
        completedDate,
        details: pmDetails,
        operator: operatorName,
        proofImageUrl: finalImgUrl,
        notes: pmNotes,
      };
      if (nextPMNotes) scheduleUpdates.nextPMNotes = nextPMNotes;
      if (spawnedRepairId) scheduleUpdates.cmCaseCreatedId = spawnedRepairId;

      await onUpdatePMSchedule(selectedSchedule.id, scheduleUpdates);

      // Auto-recalculate & update next pending schedule for this contract & asset
      if (pmStatus === 'completed') {
        const contract = contracts.find(c => c.id === selectedSchedule.contractId);
        if (contract && contract.pmFrequency !== 'custom') {
          let intervalMonths = 12;
          if (contract.pmFrequency === 'monthly') intervalMonths = 1;
          else if (contract.pmFrequency === 'quarterly') intervalMonths = 3;
          else if (contract.pmFrequency === 'semi-annually') intervalMonths = 6;
          else if (contract.pmFrequency === 'annually') intervalMonths = 12;

          const baseDateStr = completedDate || selectedSchedule.plannedDate;
          const baseDate = new Date(baseDateStr);
          if (!isNaN(baseDate.getTime())) {
            baseDate.setMonth(baseDate.getMonth() + intervalMonths);
            const nextPlannedDate = baseDate.toISOString().split('T')[0];

            // Find existing next pending schedule for this asset & contract
            const otherPending = schedules
              .filter(s => s.assetId === selectedSchedule.assetId && s.contractId === selectedSchedule.contractId && s.id !== selectedSchedule.id && s.status === 'pending')
              .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))[0];

            if (otherPending) {
              await onUpdatePMSchedule(otherPending.id, { plannedDate: nextPlannedDate });
            } else {
              await onAddPMSchedule({
                id: `SCHED-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                contractId: selectedSchedule.contractId,
                assetId: selectedSchedule.assetId,
                assetName: selectedSchedule.assetName,
                plannedDate: nextPlannedDate,
                status: 'pending'
              });
            }
          }
        }
      }

      // 2. Log in Audit Trails
      await onLogAudit({
        assetId: selectedSchedule.assetId,
        assetName: selectedSchedule.assetName,
        action: 'survey', // PM is mapped under inspection/survey action
        operator: operatorName,
        details: `ทำรายการบันทึก Preventive Maintenance (PM) เรียบร้อย เมื่อวันที่ ${completedDate} ผลลัพธ์: ${statusLabel}${nextPMNotes ? ` (โน๊ตเตือนรอบถัดไป: ${nextPMNotes})` : ''}`
      });

      // Confetti!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setIsPMFormOpen(false);
      setSelectedSchedule(null);
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล PM: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmittingPM(false);
    }
  };

  // Helper to calculate default PM target dates from frequency and range
  const calculateDefaultPMDates = (startStr: string, endStr: string, noEnd: boolean, freq: PMContract['pmFrequency']): string[] => {
    if (!startStr) return [];
    const start = new Date(startStr);
    if (isNaN(start.getTime())) return [];

    let end = endStr ? new Date(endStr) : new Date(start);
    if (noEnd || isNaN(end.getTime()) || end <= start) {
      end = new Date(start);
      end.setFullYear(end.getFullYear() + (freq === 'monthly' ? 1 : 3));
    }

    let intervalMonths = 3; // quarterly
    if (freq === 'monthly') intervalMonths = 1;
    else if (freq === 'semi-annually') intervalMonths = 6;
    else if (freq === 'annually') intervalMonths = 12;
    else if (freq === 'custom') return [];

    const dates: string[] = [];
    const current = new Date(start);
    current.setMonth(current.getMonth() + intervalMonths);

    while (current <= end && dates.length < 36) {
      dates.push(current.toISOString().split('T')[0]);
      current.setMonth(current.getMonth() + intervalMonths);
    }
    return dates;
  };

  const handleOpenNewContract = (initialAssetId?: string, initialTitle?: string) => {
    setEditingContract(null);
    setHasNoEndDate(false);
    setModalAssetSearch('');
    const today = new Date().toISOString().split('T')[0];
    setContractStart(today);
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const endStr = d.toISOString().split('T')[0];
    setContractEnd(endStr);
    setContractTitle(initialTitle || '');
    setContractNumber('');
    setVendorName('');
    setVendorContact('');
    setVendorPhone('');
    setPmFrequency('quarterly');
    setSelectedAssetIds(initialAssetId ? [initialAssetId] : []);
    
    // Auto-populate initial schedule dates (Quarterly 4 dates)
    const initialDates = calculateDefaultPMDates(today, endStr, false, 'quarterly');
    setCustomDates(initialDates);
    setNewCustomDate('');
    setIsContractFormOpen(true);
  };

  // Generate automated PM schedules based on contract metadata
  const handleContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssetIds.length === 0) {
      alert('กรุณาเลือกครุภัณฑ์อย่างน้อย 1 รายการเพื่อผูกเข้ากับสัญญานี้');
      return;
    }

    setSubmittingContract(true);
    try {
      const finalContractNumber = contractType === 'internal' ? (editingContract ? editingContract.contractNumber : `INT-PM-${Date.now().toString().slice(-6)}`) : contractNumber;
      const finalVendorName = contractType === 'internal' ? 'บำรุงรักษาภายในโดยฝ่ายพัสดุ' : vendorName;
      const finalContactPerson = contractType === 'internal' ? 'เจ้าหน้าที่พัสดุประจำแผนก' : vendorContact;
      const finalContactPhone = contractType === 'internal' ? '-' : vendorPhone;
      const finalEndDate = hasNoEndDate ? '' : contractEnd;

      // Determine target planned dates per asset
      const finalDatesMap: Record<string, string[]> = {};
      let totalRoundsCount = 0;
      for (const assetId of selectedAssetIds) {
        let targetDates: string[] = [...(assetPMDates[assetId] || [])].sort();
        if (targetDates.length === 0) {
          targetDates = calculateDefaultPMDates(contractStart, finalEndDate, hasNoEndDate, pmFrequency);
        }
        finalDatesMap[assetId] = targetDates;
        totalRoundsCount += targetDates.length;
      }

      if (totalRoundsCount === 0) {
        alert('กรุณาระบุหรือคำนวณวันนัดหมาย PM อย่างน้อย 1 วัน สำหรับแผนนี้');
        setSubmittingContract(false);
        return;
      }

      if (editingContract) {
        // --- EDIT MODE ---
        const updates: Partial<PMContract> = {
          contractNumber: finalContractNumber,
          title: contractTitle,
          vendorName: finalVendorName,
          startDate: contractStart,
          endDate: finalEndDate,
          hasNoEndDate,
          pmFrequency,
          assetIds: selectedAssetIds,
          contactPerson: finalContactPerson,
          contactPhone: finalContactPhone
        };

        // 1. Update contract in db
        await onUpdateContract(editingContract.id, updates);

        const existingSchedules = schedules.filter(s => s.contractId === editingContract.id);

        // A. Update/Sync selected assets
        for (const assetId of selectedAssetIds) {
          const asset = assets.find(a => a.id === assetId);
          if (!asset) continue;

          const targetDates = finalDatesMap[assetId] || [];
          const assetScheds = existingSchedules.filter(s => s.assetId === assetId);

          // Delete pending schedules that are no longer in targetDates
          const pendingToUpdateOrDelete = assetScheds.filter(s => s.status === 'pending');
          for (const sched of pendingToUpdateOrDelete) {
            if (!targetDates.includes(sched.plannedDate)) {
              await onDeletePMSchedule(sched.id);
            }
          }

          // Add new pending schedules for new targetDates
          let count = 1;
          for (const dateStr of targetDates) {
            const hasSchedule = assetScheds.some(s => s.plannedDate === dateStr);
            if (!hasSchedule) {
              const schedId = `sched-${Date.now()}-${assetId}-${count}`;
              await onAddPMSchedule({
                id: schedId,
                contractId: editingContract.id,
                assetId: assetId,
                assetName: asset.name,
                plannedDate: dateStr,
                status: 'pending'
              });
              count++;
            }
          }
        }

        // B. Handle deleted assets: delete pending schedules for assets removed from the contract
        const removedAssetIds = editingContract.assetIds.filter(id => !selectedAssetIds.includes(id));
        for (const assetId of removedAssetIds) {
          const assetScheds = existingSchedules.filter(s => s.assetId === assetId && s.status === 'pending');
          for (const sched of assetScheds) {
            await onDeletePMSchedule(sched.id);
          }
        }

        // Log in Audit Trail
        const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินพัสดุ';
        await onLogAudit({
          assetId: 'SYSTEM',
          assetName: `แก้ไขสัญญาบำรุงรักษา: ${finalContractNumber}`,
          action: 'update',
          operator: operatorName,
          details: `แก้ไขข้อมูลแผน/สัญญา PM รหัส ${finalContractNumber} พร้อมปรับแต่งวันนัดหมายรายเครื่อง (${totalRoundsCount} รอบรวม)`
        });

      } else {
        // --- CREATE MODE ---
        const contractId = `contract-${Date.now()}`;
        const newContract: PMContract = {
          id: contractId,
          contractNumber: finalContractNumber,
          title: contractTitle,
          vendorName: finalVendorName,
          startDate: contractStart,
          endDate: finalEndDate,
          hasNoEndDate,
          pmFrequency,
          assetIds: selectedAssetIds,
          contactPerson: finalContactPerson,
          contactPhone: finalContactPhone
        };

        // 1. Save Contract to db
        await onAddContract(newContract);

        // 2. Generate PMSchedule entries using targetDates
        for (const assetId of selectedAssetIds) {
          const asset = assets.find(a => a.id === assetId);
          if (!asset) continue;
          const targetDates = finalDatesMap[assetId] || [];
          let count = 1;
          for (const dateStr of targetDates) {
            const schedId = `sched-${Date.now()}-${assetId}-${count}`;
            await onAddPMSchedule({
              id: schedId,
              contractId: contractId,
              assetId: assetId,
              assetName: asset.name,
              plannedDate: dateStr,
              status: 'pending'
            });
            count++;
          }
        }

        // Log in Audit Trail
        const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินพัสดุ';
        await onLogAudit({
          assetId: 'SYSTEM',
          assetName: `สร้างสัญญาบำรุงรักษา: ${finalContractNumber}`,
          action: 'create',
          operator: operatorName,
          details: contractType === 'internal' 
            ? `สร้างแผนงาน PM ภายในชื่อ "${contractTitle}" รหัส ${finalContractNumber} พร้อมกำหนดวันนัดหมายรายเครื่อง (${totalRoundsCount} รอบรวม)`
            : `สร้างสัญญา PM เลขที่ ${finalContractNumber} บริษัทคู่สัญญา: ${finalVendorName} พร้อมกำหนดวันนัดหมายรายเครื่อง (${totalRoundsCount} รอบรวม)`
        });
      }

      confetti({
        particleCount: 100,
        spread: 60
      });

      setIsContractFormOpen(false);
      setEditingContract(null);
      setCustomDates([]);
      setNewCustomDate('');
      setAssetPMDates({});
      setExpandedAssetId(null);
      // Reset form
      setContractNumber('');
      setContractTitle('');
      setVendorName('');
      setPmFrequency('quarterly');
      setSelectedAssetIds([]);
      setVendorContact('');
      setVendorPhone('');
      
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการสร้าง/แก้ไขแผนบำรุงรักษา: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmittingContract(false);
    }
  };

  // Populate form states to edit contract
  const handleEditContractClick = (contract: PMContract) => {
    setEditingContract(contract);
    
    // Check if contract is internal
    const isInternal = contract.contractNumber.startsWith('INT-PM-');
    setContractType(isInternal ? 'internal' : 'outsource');
    
    setContractNumber(contract.contractNumber);
    setContractTitle(contract.title);
    setVendorName(contract.vendorName);
    setContractStart(contract.startDate);
    setContractEnd(contract.endDate || '');
    setHasNoEndDate(!!contract.hasNoEndDate || !contract.endDate);
    setModalAssetSearch('');
    setPmFrequency(contract.pmFrequency);
    setSelectedAssetIds(contract.assetIds);
    setVendorContact(contract.contactPerson);
    setVendorPhone(contract.contactPhone);
    
    // Load scheduled dates from existing pending schedules or calculate per asset
    const contractSchedules = schedules.filter(s => s.contractId === contract.id);
    const initialDatesMap: Record<string, string[]> = {};
    for (const assetId of contract.assetIds) {
      const assetScheds = contractSchedules.filter(s => s.assetId === assetId);
      if (assetScheds.length > 0) {
        initialDatesMap[assetId] = assetScheds.map(s => s.plannedDate).sort();
      } else {
        const autoDates = calculateDefaultPMDates(contract.startDate, contract.endDate || '', !!contract.hasNoEndDate, contract.pmFrequency);
        initialDatesMap[assetId] = autoDates;
      }
    }
    setAssetPMDates(initialDatesMap);
    setExpandedAssetId(contract.assetIds[0] || null);
    setNewCustomDate('');
    
    setIsContractFormOpen(true);
  };

  // Submit ad-hoc repair
  const handleRepairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairAssetId) return;

    setSubmittingRepair(true);
    try {
      const asset = assets.find(a => a.id === repairAssetId);
      if (!asset) return;

      const operatorName = localStorage.getItem('assetwatch_operator') || 'เจ้าหน้าที่พัสดุ';

      // 1. Create repair case (CM)
      const repairId = await onAddRepair({
        assetId: repairAssetId,
        assetName: asset.name,
        symptom: repairSymptom,
        dateOpened: new Date().toISOString().split('T')[0],
        status: 'open',
        operator: operatorName,
        updatedAt: new Date().toISOString()
      });

      // 2. Change Asset status to 'ชำรุด'
      await onUpdateAssetStatus(repairAssetId, 'ชำรุด');

      // 3. Log Audit Trail
      await onLogAudit({
        assetId: repairAssetId,
        assetName: asset.name,
        action: 'repair_open',
        operator: operatorName,
        details: `เปิดใบสั่งแจ้งชำรุดเร่งด่วน (Corrective Maintenance) รหัสใบแจ้งซ่อม: ${repairId} อาการเสีย: ${repairSymptom}`
      });

      confetti({
        particleCount: 60,
        spread: 50
      });

      setIsRepairFormOpen(false);
      setRepairAssetId('');
      setRepairSymptom('');
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลงบันทึกการแจ้งซ่อมครั้งคราว: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmittingRepair(false);
    }
  };

  const handleSendProofImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      setCompressingSendProof(true);
      try {
        const compressed = await compressFileOrPdf(file, 1400, 1400, 0.80);
        setSendProofFile(compressed);
        setSendProofInfo({
          name: file.name,
          size: `${Math.round(compressed.size / 1024)} KB`,
          isPdf
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setSendProofPreview(reader.result as string);
          setCompressingSendProof(false);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        setSendProofFile(file);
        setSendProofInfo({
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`,
          isPdf
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setSendProofPreview(reader.result as string);
          setCompressingSendProof(false);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleReceiveProofImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      setCompressingReceiveProof(true);
      try {
        const compressed = await compressFileOrPdf(file, 1400, 1400, 0.80);
        setReceiveProofFile(compressed);
        setReceiveProofInfo({
          name: file.name,
          size: `${Math.round(compressed.size / 1024)} KB`,
          isPdf
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiveProofPreview(reader.result as string);
          setCompressingReceiveProof(false);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        setReceiveProofFile(file);
        setReceiveProofInfo({
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`,
          isPdf
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiveProofPreview(reader.result as string);
          setCompressingReceiveProof(false);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Dispatch CM case to shop
  const handleSentToVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowCase) return;

    setSubmittingSend(true);
    try {
      let proofUrl = '';
      if (sendProofFile) {
        proofUrl = await uploadImage(sendProofFile, 'repairs');
      }

      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินส่งซ่อม';

      await onUpdateRepair(workflowCase.id, {
        status: 'sent',
        dateSent: new Date().toISOString().split('T')[0],
        repairCompany: repairVendorName,
        contactPerson: repairContactPhone,
        sentProofUrl: proofUrl || undefined,
        updatedAt: new Date().toISOString()
      });

      await onLogAudit({
        assetId: workflowCase.assetId,
        assetName: workflowCase.assetName,
        action: 'repair_send',
        operator: operatorName,
        details: `นำส่งครุภัณฑ์ไปยังช่างซ่อม บริษัท: ${repairVendorName} เบอร์โทร: ${repairContactPhone}`
      });

      setWorkflowCase(null);
      setWorkflowAction(null);
      setRepairVendorName('');
      setRepairContactPhone('');
      setSendProofFile(null);
      setSendProofPreview(null);
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการส่งร้านซ่อม: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmittingSend(false);
    }
  };

  // Receive completed CM repair back
  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowCase) return;

    setSubmittingReceive(true);
    try {
      let returnedProofUrl = '';
      if (receiveProofFile) {
        returnedProofUrl = await uploadImage(receiveProofFile, 'repairs');
      }

      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินรับคืน';

      await onUpdateRepair(workflowCase.id, {
        status: 'completed',
        dateReceived: receiveDate,
        receivedProofUrl: returnedProofUrl || undefined,
        updatedAt: new Date().toISOString()
      });

      await onUpdateAssetStatus(workflowCase.assetId, 'ใช้งานได้');

      await onLogAudit({
        assetId: workflowCase.assetId,
        assetName: workflowCase.assetName,
        action: 'repair_receive',
        operator: operatorName,
        details: `ตรวจรับครุภัณฑ์พัสดุส่งซ่อมคืนคลังสำเร็จ ตรวจเช็คเครื่องแล้วสามารถนำกลับมา "ใช้งานได้" ตามปกติ`
      });

      confetti({
        particleCount: 100,
        spread: 80
      });

      setWorkflowCase(null);
      setWorkflowAction(null);
      setReceiveProofFile(null);
      setReceiveProofPreview(null);
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการตรวจรับพัสดุคืนคลัง: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmittingReceive(false);
    }
  };

  // Universal Lightbox Open & Download Helpers
  const handleOpenLightbox = (url: string, title?: string) => {
    if (!url) return;
    setLightboxUrl(url);
    setLightboxTitle(title || 'ไฟล์เอกสาร / รูปภาพหลักฐาน');
    setLightboxZoom(1);
  };

  const handleDownloadLightbox = () => {
    if (!lightboxUrl) return;
    const a = document.createElement('a');
    a.href = lightboxUrl;
    const isPdf = lightboxUrl.toLowerCase().includes('application/pdf') || lightboxUrl.toLowerCase().endsWith('.pdf') || lightboxUrl.startsWith('data:application/pdf');
    a.download = `AssetWatch_${(lightboxTitle || 'file').replace(/[^a-zA-Z0-9_\u0E00-\u0E7F]/g, '_')}_${new Date().toISOString().split('T')[0]}.${isPdf ? 'pdf' : 'jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Open CM Details & Edit modal
  const handleOpenCMDetails = (r: RepairCase) => {
    setSelectedCMDetailCase(r);
    setCmEditNotes(r.notes || r.additionalNotes || '');
    setCmEditCost(r.repairCost ? String(r.repairCost) : '');
    setCmEditRepairCompany(r.repairCompany || '');
    setCmEditContactPerson(r.contactPerson || '');
    setCmEditDateReceived(r.dateReceived || '');
    setCmEditProofPreview(r.receivedProofUrl || r.sentProofUrl || r.symptomImageUrl || null);
    setCmEditProofFile(null);
    setCmEditProofInfo(null);
    setIsCMDetailOpen(true);
  };

  // Save additional notes / edit data in CM Case
  const handleSaveCMDetails = async () => {
    if (!selectedCMDetailCase) return;
    setCmSavingDetail(true);
    try {
      let extraProofUrl = selectedCMDetailCase.receivedProofUrl;
      if (cmEditProofFile) {
        extraProofUrl = await uploadImage(cmEditProofFile, 'repairs');
      }

      const updates: Partial<RepairCase> = {
        notes: cmEditNotes,
        additionalNotes: cmEditNotes,
        repairCost: cmEditCost,
        repairCompany: cmEditRepairCompany,
        contactPerson: cmEditContactPerson,
        dateReceived: cmEditDateReceived || selectedCMDetailCase.dateReceived,
        receivedProofUrl: extraProofUrl || selectedCMDetailCase.receivedProofUrl,
        updatedAt: new Date().toISOString()
      };

      await onUpdateRepair(selectedCMDetailCase.id, updates);

      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินส่งซ่อม';
      await onLogAudit({
        assetId: selectedCMDetailCase.assetId,
        assetName: selectedCMDetailCase.assetName,
        action: 'repair_send',
        operator: operatorName,
        details: `อัปเดตบันทึกข้อมูลเพิ่มเติมในเคส CM รหัสครุภัณฑ์ ${selectedCMDetailCase.assetId}: ${cmEditNotes ? `ข้อสังเกต: ${cmEditNotes}` : ''} ${cmEditCost ? `ค่าซ่อม: ${cmEditCost} บาท` : ''}`
      });

      setSelectedCMDetailCase({ ...selectedCMDetailCase, ...updates });
      await onRefreshData();
      alert('บันทึกข้อมูลเพิ่มเติมเรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล CM: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setCmSavingDetail(false);
    }
  };

  // Reopen a closed CM Case
  const handleReopenCMCase = async (r: RepairCase) => {
    if (!window.confirm(`คุณต้องการขอเปิดเคสส่งซ่อมนี้ใหม่สำหรับครุภัณฑ์ "${r.assetName}" ใช่หรือไม่?`)) return;
    try {
      await onUpdateRepair(r.id, {
        status: 'sent',
        updatedAt: new Date().toISOString()
      });
      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินส่งซ่อม';
      await onLogAudit({
        assetId: r.assetId,
        assetName: r.assetName,
        action: 'repair_send',
        operator: operatorName,
        details: `ขอเปิดเคสส่งซ่อม CM ใหม่ (Reopen Case) เพื่อแก้ไขหรือตรวจรับอีกครั้ง`
      });
      if (selectedCMDetailCase && selectedCMDetailCase.id === r.id) {
        setSelectedCMDetailCase({ ...selectedCMDetailCase, status: 'sent' });
      }
      await onRefreshData();
      alert('เปิดเคสส่งซ่อมใหม่เรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเปิดเคสใหม่: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // HD Compression for CM Detail extra image/file
  const handleCMEditProofImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      setCompressingCMEditProof(true);
      try {
        const compressed = await compressFileOrPdf(file, 1400, 1400, 0.80);
        setCmEditProofFile(compressed);
        setCmEditProofInfo({
          name: file.name,
          size: `${Math.round(compressed.size / 1024)} KB`,
          isPdf
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setCmEditProofPreview(reader.result as string);
          setCompressingCMEditProof(false);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        setCmEditProofFile(file);
        setCmEditProofInfo({
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`,
          isPdf
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setCmEditProofPreview(reader.result as string);
          setCompressingCMEditProof(false);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Delete contract
  const handleDeleteContract = async (id: string) => {
    if (!window.confirm('คุณต้องการลบสัญญาบำรุงรักษาโครงการนี้รวมถึงกำหนดการตรวจเช็คที่ผูกอยู่ทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถกู้คืนได้')) return;
    try {
      await onDeleteContract(id);
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบสัญญาบำรุงรักษา: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const resolveAssetName = (assetId: string, fallbackName?: string) => {
    const found = assets.find(a => a.id === assetId);
    return found ? found.name : (fallbackName || assetId);
  };

  const handleDeleteSchedule = async (schedId: string) => {
    if (!window.confirm('คุณต้องการลบรายการบันทึกผลการบำรุงรักษานี้ใช่หรือไม่? (เมื่อลบแล้วรายการจะถูกลบออกจากระบบ)')) return;
    try {
      await onDeletePMSchedule(schedId);
      alert('ลบรายการบันทึกเรียบร้อยแล้ว');
      await onRefreshData();
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการลบรายการบันทึก');
    }
  };

  // Date formatted helper
  const getThaiDateFormatted = (dateStr: string) => {
    const testDate = new Date(dateStr);
    if (isNaN(testDate.getTime())) return dateStr;
    return testDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Reschedule handler: change planned date of a pending schedule
  const handleOpenReschedule = (sched: PMSchedule) => {
    setRescheduleTarget(sched);
    setRescheduleNewDate(sched.plannedDate);
    setIsRescheduleOpen(true);
  };

  const handleShiftRescheduleMonth = (monthsToAdd: number) => {
    if (!rescheduleTarget) return;
    const baseStr = rescheduleNewDate || rescheduleTarget.plannedDate;
    const d = new Date(baseStr);
    if (!isNaN(d.getTime())) {
      d.setMonth(d.getMonth() + monthsToAdd);
      setRescheduleNewDate(d.toISOString().split('T')[0]);
    }
  };

  const handleSetRescheduleYearMonth = (yearAD: number, monthIdx: number) => {
    if (!rescheduleTarget) return;
    const baseStr = rescheduleNewDate || rescheduleTarget.plannedDate;
    const d = new Date(baseStr);
    const day = isNaN(d.getTime()) ? 1 : Math.min(d.getDate(), 28);
    const newD = new Date(yearAD, monthIdx, day);
    setRescheduleNewDate(newD.toISOString().split('T')[0]);
  };

  const getRescheduleDiffText = () => {
    if (!rescheduleTarget || !rescheduleNewDate || rescheduleNewDate === rescheduleTarget.plannedDate) return null;
    const d1 = new Date(rescheduleTarget.plannedDate);
    const d2 = new Date(rescheduleNewDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
    const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    const monthDiff = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    if (monthDiff !== 0) {
      const sign = monthDiff > 0 ? '+' : '';
      return `${sign}${monthDiff} เดือน (${diffDays > 0 ? `+${diffDays}` : diffDays} วัน)`;
    }
    return `${diffDays > 0 ? `+${diffDays}` : diffDays} วัน`;
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleTarget || !rescheduleNewDate) return;
    try {
      await onUpdatePMSchedule(rescheduleTarget.id, { plannedDate: rescheduleNewDate });
      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินพัสดุ';
      await onLogAudit({
        assetId: rescheduleTarget.assetId,
        assetName: rescheduleTarget.assetName,
        action: 'update',
        operator: operatorName,
        details: `เลื่อนวันนัด PM จาก ${getThaiDateFormatted(rescheduleTarget.plannedDate)} เป็น ${getThaiDateFormatted(rescheduleNewDate)}`
      });
      setIsRescheduleOpen(false);
      setRescheduleTarget(null);
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเลื่อนวันนัดบำรุงรักษา: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Calendar drag-and-drop handler
  const handleCalendarDrop = async (sched: PMSchedule, newDateStr: string) => {
    if (sched.status !== 'pending' || sched.plannedDate === newDateStr) return;
    try {
      await onUpdatePMSchedule(sched.id, { plannedDate: newDateStr });
      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินพัสดุ';
      await onLogAudit({
        assetId: sched.assetId,
        assetName: sched.assetName,
        action: 'update',
        operator: operatorName,
        details: `ย้ายวันนัด PM (ลากจากปฏิทิน) จาก ${getThaiDateFormatted(sched.plannedDate)} เป็น ${getThaiDateFormatted(newDateStr)}`
      });
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการย้ายวันนัด PM: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>ระบบบำรุงรักษาเชิงป้องกันและซ่อมแซมครุภัณฑ์ (PM & CM - Module 10)</h2>
        <p>วางแผนรอบการเข้าบำรุงรักษาตามสัญญา คาดการณ์ปัญหาผ่านปฏิทินอัจฉริยะ และบันทึกเคส CM แจ้งชำรุดครั้งคราวเพื่อลดอัตราความล้มเหลวพัสดุ</p>
      </div>

      {/* Sub-tabs menu */}
      <div className="sub-tabs-container">
        <button 
          className={`sub-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 แดชบอร์ด (Dashboard)
        </button>
        <button 
          className={`sub-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 ปฏิทินกำหนดการ PM (Calendar)
        </button>
        <button 
          className={`sub-tab ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          📦 แผนบำรุงรักษาและ Logbook ครุภัณฑ์ (Asset PM & Logbook)
        </button>
        <button 
          className={`sub-tab ${activeTab === 'repairs' ? 'active' : ''}`}
          onClick={() => setActiveTab('repairs')}
        >
          🛠️ บันทึกงานซ่อมแซมครั้งคราว (CM Repairs)
        </button>
      </div>

      {/* Tab 1: Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-pm-tab animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stats Bar */}
          <div className="grid-cols-3">
            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="stat-card-title">📝 โครงการสัญญา PM ที่คุมอยู่</div>
              <div className="stat-card-value" style={{ color: 'var(--primary)' }}>{contracts.length} <span className="stat-unit">สัญญา</span></div>
              <div className="stat-card-desc">คู่สัญญากลุ่มซ่อมไอทีและแอร์ระบบ</div>
            </div>

            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
              <div className="stat-card-title">🟢 บำรุงรักษาเสร็จสิ้นปีนี้</div>
              <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                {schedules.filter(s => s.status === 'completed' && s.completedDate?.startsWith(new Date().getFullYear().toString())).length}
                <span className="stat-unit"> รอบงาน</span>
              </div>
              <div className="stat-card-desc">ตรวจสอบประวัติผ่านตารางครบถ้วน</div>
            </div>

            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--danger)' }}>
              <div className="stat-card-title">🔴 ตรวจสภาพเลยกำหนด (Overdue)</div>
              <div className="stat-card-value" style={{ color: 'var(--danger)' }}>
                {schedules.filter(s => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  return s.status === 'pending' && s.plannedDate < todayStr;
                }).length}
                <span className="stat-unit"> เครื่อง</span>
              </div>
              <div className="stat-card-desc">ต้องเร่งนัดหมายบริษัทคู่สัญญาด่วน</div>
            </div>
          </div>

          <div className="survey-layout-grid">
            {/* Left Panel: Recent PM Notifications */}
            <div className="scanner-column" style={{ flex: 1.2 }}>
              <div className="selection-list-panel glass-panel" style={{ maxHeight: '450px' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}><Bell size={16} style={{ display: 'inline', marginRight: '0.25rem', color: 'var(--warning)' }} /> แจ้งเตือนบำรุงรักษาระบบ (Alert Timeline)</h3>
                </div>

                <div className="notifications-timeline-scroll" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                      ไม่มีการแจ้งเตือนบำรุงรักษาครุภัณฑ์ในขณะนี้
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="notification-card-item" style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', borderLeft: `4.5px solid ${notif.type === 'pm_overdue' ? 'var(--danger)' : 'var(--warning)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{notif.title}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📅 {notif.targetDate}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>{notif.message}</p>
                        <button 
                          onClick={() => setActiveTab('calendar')} 
                          className="btn btn-ghost btn-xs" 
                          style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.2,', padding: '0.15rem 0.4rem', border: '1px solid var(--border)', height: 'auto', fontSize: '0.725rem' }}
                        >
                          เปิดตารางปฏิทินตรวจ PM <ArrowRight size={10} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel: Upcoming PMs this month */}
            <div className="form-column" style={{ flex: 1 }}>
              <div className="survey-form-panel glass-panel" style={{ minHeight: '400px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>📅 รายการแผน PM ในเดือนนี้นัดหมาย</h3>
                </div>

                <div className="upcoming-pm-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {schedules.filter(s => {
                    const today = new Date();
                    const yearStr = today.getFullYear().toString();
                    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
                    return s.status === 'pending' && s.plannedDate.startsWith(`${yearStr}-${monthStr}`);
                  }).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                      ไม่มีแผนเข้าตรวจบำรุงรักษา PM ในเดือนนี้เพิ่มเติม
                    </div>
                  ) : (
                    schedules.filter(s => {
                      const today = new Date();
                      const yearStr = today.getFullYear().toString();
                      const monthStr = String(today.getMonth() + 1).padStart(2, '0');
                      return s.status === 'pending' && s.plannedDate.startsWith(`${yearStr}-${monthStr}`);
                    }).map(sched => (
                      <div key={sched.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>{resolveAssetName(sched.assetId, sched.assetName)}</h4>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>รหัสครุภัณฑ์: <code>{sched.assetId}</code></span>
                          <div style={{ display: 'block', fontSize: '0.725rem', color: 'var(--primary)', fontWeight: 650, marginTop: '0.15rem' }}>📅 แผนตรวจ: {getThaiDateFormatted(sched.plannedDate)}</div>
                        </div>
                        <button className="btn btn-primary btn-xs" onClick={() => { setActiveTab('calendar'); handleOpenPMForm(sched); }}>
                          บันทึก PM
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PM Calendar */}
      {activeTab === 'calendar' && (
        <div className="calendar-pm-tab animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Calendar Controller & Filter Header */}
          <div className="filter-panel glass-panel" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={handlePrevMonth} 
                onDragOver={(e) => { e.preventDefault(); handlePrevMonth(); }}
                style={{ padding: '0.25rem', height: 'auto', border: '1px solid var(--border)', background: 'var(--bg-primary)' }}
                title="เดือนก่อนหน้า (ลากมาวางเพื่อสลับเดือน)"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Quick Month & Year Dropdowns */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <select
                  className="form-select"
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
                  style={{ fontWeight: 800, fontSize: '1rem', height: '36px', minWidth: '130px' }}
                >
                  {monthNames.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>

                <select
                  className="form-select"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                  style={{ fontWeight: 800, fontSize: '1rem', height: '36px', minWidth: '110px' }}
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y}>พ.ศ. {y + 543}</option>
                  ))}
                </select>
              </div>

              <button 
                className="btn btn-ghost btn-sm" 
                onClick={handleNextMonth} 
                onDragOver={(e) => { e.preventDefault(); handleNextMonth(); }}
                style={{ padding: '0.25rem', height: 'auto', border: '1px solid var(--border)', background: 'var(--bg-primary)' }}
                title="เดือนถัดไป (ลากมาวางเพื่อสลับเดือน)"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building size={16} color="var(--text-muted)" />
              <select 
                className="form-select filter-select"
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                disabled={!isOrgWideUser}
                style={{ minWidth: '200px' }}
              >
                {isOrgWideUser ? (
                  <>
                    <option value="all">🌐 ทุกหน่วยงาน (ภาพรวมทั้งองค์กร)</option>
                    {Array.from(new Set(assets.map(a => a.department).filter(Boolean))).map(dept => (
                      <option key={dept} value={dept}>🏢 ฝ่าย: {dept}</option>
                    ))}
                  </>
                ) : (
                  <option value={currentUser?.department}>🏢 เฉพาะหน่วยงาน: {currentUser?.department}</option>
                )}
              </select>
            </div>
          </div>

          {/* Cross-Month Drag and Drop Target Bar */}
          {draggedSchedule && (
            <div 
              className="animate-scale-up" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 185, 129, 0.12))', 
                border: '2px dashed var(--primary)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.85rem 1rem', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="var(--primary)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  🚀 กำลังลาก: <span style={{ color: 'var(--primary)' }}>{draggedSchedule.assetName}</span> (ลากมาวางที่ปุ่มลัดเพื่อย้ายข้ามเดือน)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Prev Month Drop Zone */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                  onDragLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'inherit'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const d = new Date(draggedSchedule.plannedDate);
                    d.setMonth(d.getMonth() - 1);
                    handleCalendarDrop(draggedSchedule, d.toISOString().split('T')[0]);
                    setDraggedSchedule(null);
                  }}
                  style={{ padding: '0.4rem 0.85rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 650, cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  👈 วางย้ายไปเดือนก่อนหน้า (-1 เดือน)
                </div>

                {/* Next Month Drop Zone */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                  onDragLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'inherit'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const d = new Date(draggedSchedule.plannedDate);
                    d.setMonth(d.getMonth() + 1);
                    handleCalendarDrop(draggedSchedule, d.toISOString().split('T')[0]);
                    setDraggedSchedule(null);
                  }}
                  style={{ padding: '0.4rem 0.85rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 650, cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  👉 วางย้ายไปเดือนถัดไป (+1 เดือน)
                </div>

                {/* +3 Months */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                  onDragLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'inherit'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const d = new Date(draggedSchedule.plannedDate);
                    d.setMonth(d.getMonth() + 3);
                    handleCalendarDrop(draggedSchedule, d.toISOString().split('T')[0]);
                    setDraggedSchedule(null);
                  }}
                  style={{ padding: '0.4rem 0.85rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 650, cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  ⏩ วางย้ายไปอีก 3 เดือน (+3 เดือน)
                </div>

                {/* Open Full Reschedule Modal Drop */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onDragLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleOpenReschedule(draggedSchedule);
                    setDraggedSchedule(null);
                  }}
                  style={{ padding: '0.4rem 0.85rem', background: 'var(--warning)', color: '#000', border: '1px solid var(--warning)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  📅 วางเพื่อเปิดเลือกเดือน/ปีอิสระ
                </div>
              </div>
            </div>
          )}

          {/* Interactive Month Calendar Grid */}
          <div className="calendar-grid-wrapper glass-panel" style={{ padding: '1.25rem' }}>
            <div className="calendar-weekday-header" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <div style={{ color: 'var(--danger)' }}>อา.</div>
              <div>จ.</div>
              <div>อ.</div>
              <div>พ.</div>
              <div>พฤ.</div>
              <div>ศ.</div>
              <div>ส.</div>
            </div>

            <div className="calendar-days-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
              {calendarCells.map((dayNum, index) => {
                const isToday = dayNum !== null && 
                                new Date().getDate() === dayNum && 
                                new Date().getMonth() === currentMonth && 
                                new Date().getFullYear() === currentYear;

                // Find schedules for this specific day
                const daySchedules = dayNum === null ? [] : monthSchedules.filter(s => {
                  const dayStr = String(dayNum).padStart(2, '0');
                  const targetPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${dayStr}`;
                  return s.plannedDate === targetPrefix;
                });

                return (
                  <div 
                    key={`cell-${index}`} 
                    className={`calendar-day-cell ${dayNum === null ? 'empty' : ''} ${isToday ? 'today' : ''}`}
                    onDragOver={(e) => { if (dayNum !== null) { e.preventDefault(); e.currentTarget.style.outline = '2px dashed var(--primary)'; } }}
                    onDragLeave={(e) => { e.currentTarget.style.outline = 'none'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.outline = 'none';
                      if (dayNum === null || !draggedSchedule) return;
                      const dayStr = String(dayNum).padStart(2, '0');
                      const newDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${dayStr}`;
                      handleCalendarDrop(draggedSchedule, newDateStr);
                      setDraggedSchedule(null);
                    }}
                    style={{
                      minHeight: '100px',
                      background: dayNum === null ? 'transparent' : 'var(--bg-primary)',
                      border: dayNum === null ? 'none' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.35rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      position: 'relative',
                      boxShadow: isToday ? '0 0 0 2px var(--primary)' : 'none',
                      transition: 'outline 0.15s ease'
                    }}
                  >
                    {dayNum && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isToday ? 'var(--primary)' : 'var(--text-secondary)', alignSelf: 'flex-start' }}>
                        {dayNum}
                      </span>
                    )}

                    <div className="day-schedules-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'hidden', flex: 1 }}>
                      {daySchedules.map(sched => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const isOverdue = sched.status === 'pending' && sched.plannedDate < todayStr;
                        const isDraggable = sched.status === 'pending';
                        
                        let statusColor = 'var(--warning)';
                        let bgColor = 'var(--warning-light)';
                        let labelPrefix = '🔧 ';
                        
                        if (sched.status === 'completed') {
                          statusColor = 'var(--success)';
                          bgColor = 'var(--success-light)';
                          labelPrefix = '🟢 ';
                        } else if (sched.status === 'postponed') {
                          statusColor = '#d97706';
                          bgColor = '#fef3c7';
                          labelPrefix = '🟡 ';
                        } else if (sched.status === 'awaiting_repair') {
                          statusColor = '#b91c1c';
                          bgColor = '#fee2e2';
                          labelPrefix = '🔴 ';
                        } else if (isOverdue) {
                          statusColor = 'var(--danger)';
                          bgColor = 'var(--danger-light)';
                          labelPrefix = '⏰ ';
                        }
                        
                        const contract = contracts.find(c => c.id === sched.contractId);
                        const planTitle = contract ? contract.title : 'แผนบำรุงรักษาทั่วไป';
                        const displayPlanTitle = planTitle.length > 20 ? planTitle.slice(0, 20) + '...' : planTitle;

                        const assetScheds = schedules
                          .filter(s => s.contractId === sched.contractId && s.assetId === sched.assetId)
                          .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
                        const roundIndex = assetScheds.findIndex(s => s.id === sched.id) + 1;
                        const totalRounds = assetScheds.length;

                        const prevRoundSched = roundIndex > 1 ? assetScheds[roundIndex - 2] : null;
                        const prevNextPMNotes = prevRoundSched?.nextPMNotes || '';

                        const hoverTitle = `📋 แผนงาน/สัญญา: ${planTitle}
📦 ครุภัณฑ์: ${sched.assetName} (รหัส: ${sched.assetId})
📅 รอบบำรุงรักษา: รอบที่ ${roundIndex} จากทั้งหมด ${totalRounds} รอบ
📅 วันที่วางแผน: ${getThaiDateFormatted(sched.plannedDate)}
${prevNextPMNotes ? `⚠️ ข้อพึงระวังจากรอบก่อนหน้า:\n   👉 "${prevNextPMNotes}"\n` : ''}${sched.notes ? `📝 หมายเหตุ PM รอบนี้:\n   👉 "${sched.notes}"` : ''}`;

                        return (
                          <div 
                            key={sched.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '2px', width: '100%' }}
                          >
                            <button 
                              draggable={isDraggable}
                              onDragStart={(e) => {
                                if (!isDraggable) { e.preventDefault(); return; }
                                setDraggedSchedule(sched);
                                e.dataTransfer.effectAllowed = 'move';
                                if (e.currentTarget) {
                                  setTimeout(() => { (e.target as HTMLElement).style.opacity = '0.4'; }, 0);
                                }
                              }}
                              onDragEnd={(e) => {
                                (e.target as HTMLElement).style.opacity = '1';
                                setDraggedSchedule(null);
                              }}
                              onClick={() => {
                                setSelectedSchedule(sched);
                                if (sched.status !== 'pending') {
                                  setIsPrintReportOpen(true);
                                } else {
                                  handleOpenPMForm(sched);
                                }
                              }}
                              className="calendar-schedule-tag"
                              style={{
                                flex: 1,
                                textAlign: 'left',
                                fontSize: '0.65rem',
                                padding: '0.25rem 0.45rem',
                                borderRadius: '4px',
                                backgroundColor: bgColor,
                                color: statusColor,
                                border: `1.25px solid ${statusColor}`,
                                cursor: isDraggable ? 'grab' : 'pointer',
                                outline: 'none',
                                transition: 'opacity 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: '1px',
                                minHeight: '34px',
                                overflow: 'hidden'
                              }}
                              title={hoverTitle}
                            >
                              <div style={{ fontWeight: 750, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', lineHeight: '1.2' }}>
                                {labelPrefix} {displayPlanTitle}
                              </div>
                              <div style={{ fontSize: '0.575rem', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', lineHeight: '1.1' }}>
                                {sched.assetName} (รอบ {roundIndex}/{totalRounds})
                              </div>
                            </button>

                            {isDraggable && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReschedule(sched);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '1px 3px',
                                  borderRadius: '3px',
                                  fontSize: '0.65rem',
                                  color: 'var(--text-muted)',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="📅 เลื่อนวันนัด / ย้ายข้ามเดือน"
                              >
                                📅
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Asset-Based Maintenance & Logbook (ครุภัณฑ์ Base) */}
      {activeTab === 'contracts' && (
        <div className="contracts-pm-tab animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Header & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📦 รายการแผนบำรุงรักษาและ Logbook สัญญาแยกตามรายครุภัณฑ์ (Asset-Based PM & Logbook)
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  เลือกครุภัณฑ์เพื่อตั้งค่าความถี่ในการดูแล (ทุกกี่เดือน) กำหนดรูปแบบบำรุงรักษาเองหรือจ้าง Outsource พร้อมดู Logbook ประวัติย้อนหลัง
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsPrintPlansSummaryOpen(true)}
                  style={{ border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-primary)', whiteSpace: 'nowrap', height: '36px', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                >
                  <Printer size={15} /> สรุปแผน PM
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsPrintHistorySummaryOpen(true)}
                  style={{ border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-primary)', whiteSpace: 'nowrap', height: '36px', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                >
                  <Printer size={15} /> สรุปประวัติ PM
                </button>

                {currentUser?.role !== 'user' && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleOpenNewContract()} 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', height: '36px', fontSize: '0.8rem' }}
                  >
                    <Plus size={16} /> + วางกำหนดบำรุงรักษา / สัญญาใหม่
                  </button>
                )}
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
              {/* Search Box */}
              <div style={{ flex: '1 1 280px', position: 'relative' }}>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="🔍 ค้นหารหัสครุภัณฑ์, ชื่อ, ห้องจัดเก็บ, เลขสัญญา, บริษัทผู้รับจ้าง..."
                  value={assetPMSearch}
                  onChange={(e) => setAssetPMSearch(e.target.value)}
                  style={{ paddingLeft: '2.2rem', fontSize: '0.85rem', height: '38px' }}
                />
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, pointerEvents: 'none' }}>🔍</span>
                {assetPMSearch && (
                  <button 
                    type="button" 
                    onClick={() => setAssetPMSearch('')}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Department Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building size={16} color="var(--text-muted)" />
                <select 
                  className="form-select filter-select"
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  disabled={!isOrgWideUser}
                  style={{ height: '38px', fontSize: '0.85rem', minWidth: '180px' }}
                >
                  {isOrgWideUser ? (
                    <>
                      <option value="all">🌐 ทุกหน่วยงาน (ภาพรวมทั้งองค์กร)</option>
                      {Array.from(new Set(assets.map(a => a.department).filter(Boolean))).map(dept => (
                        <option key={dept} value={dept}>🏢 ฝ่าย: {dept}</option>
                      ))}
                    </>
                  ) : (
                    <option value={currentUser?.department}>🏢 เฉพาะหน่วยงาน: {currentUser?.department}</option>
                  )}
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>กรองครุภัณฑ์:</span>
                <button 
                  onClick={() => setAssetPMTypeFilter('all')} 
                  className={`btn btn-xs ${assetPMTypeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ border: '1px solid var(--border)', fontSize: '0.75rem' }}
                >
                  ทั้งหมด ({assets.filter(a => a.status !== 'รอจำหน่าย' && (selectedDeptFilter === 'all' || a.department === selectedDeptFilter)).length})
                </button>
                <button 
                  onClick={() => setAssetPMTypeFilter('has_plan')} 
                  className={`btn btn-xs ${assetPMTypeFilter === 'has_plan' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ border: '1px solid var(--border)', fontSize: '0.75rem' }}
                >
                  ☑️ มีแผน PM แล้ว
                </button>
                <button 
                  onClick={() => setAssetPMTypeFilter('no_plan')} 
                  className={`btn btn-xs ${assetPMTypeFilter === 'no_plan' ? 'btn-warning' : 'btn-ghost'}`}
                  style={{ border: '1px solid var(--border)', fontSize: '0.75rem' }}
                >
                  ⚠️ ยังไม่มีแผน PM
                </button>
                <button 
                  onClick={() => setAssetPMTypeFilter('outsource')} 
                  className={`btn btn-xs ${assetPMTypeFilter === 'outsource' ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ border: '1px solid var(--border)', fontSize: '0.75rem' }}
                >
                  🧾 จ้าง Outsource
                </button>
                <button 
                  onClick={() => setAssetPMTypeFilter('internal')} 
                  className={`btn btn-xs ${assetPMTypeFilter === 'internal' ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ border: '1px solid var(--border)', fontSize: '0.75rem' }}
                >
                  📌 บำรุงรักษาเอง
                </button>
              </div>
            </div>
          </div>

          {/* Asset PM Cards Grid */}
          <div className="contracts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
            {filteredAssetPMList.length === 0 ? (
              <div className="glass-panel text-center" style={{ gridColumn: 'span 12', padding: '3rem', color: 'var(--text-muted)' }}>
                🔍 ไม่พบข้อมูลครุภัณฑ์ตามเงื่อนไขการค้นหาที่ระบุ
              </div>
            ) : (
              filteredAssetPMList.map(asset => {
                const assetContracts = contracts.filter(c => c.assetIds.includes(asset.id));
                const hasPlan = assetContracts.length > 0;
                const assetSchedules = schedules
                  .filter(s => s.assetId === asset.id)
                  .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
                
                const completedCount = assetSchedules.filter(s => s.status === 'completed').length;
                const assetRepairs = repairs.filter(r => r.assetId === asset.id);

                return (
                  <div key={asset.id} className="contract-card glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: hasPlan ? '1px solid var(--border)' : '1px dashed var(--warning)' }}>
                    <div>
                      {/* Top Header Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-primary" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {asset.id}
                          </span>
                          <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>
                            📍 {asset.location || asset.department}
                          </span>
                        </div>

                        {/* Status Pointers / Plans Count */}
                        {hasPlan ? (
                          <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>
                            📋 {assetContracts.length} แผนงาน PM ({assetContracts.some(c => c.contractNumber.startsWith('INT-PM-')) ? 'มีแผนภายใน' : ''}{assetContracts.some(c => !c.contractNumber.startsWith('INT-PM-')) ? (assetContracts.some(c => c.contractNumber.startsWith('INT-PM-')) ? ' / Outsource' : 'Outsource') : ''})
                          </span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: '0.675rem' }}>⚠️ ยังไม่ตั้งค่า PM</span>
                        )}
                      </div>

                      {/* Asset Title */}
                      <h4 style={{ fontSize: '0.975rem', fontWeight: 800, margin: '0.2rem 0 0.5rem 0', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {asset.name}
                      </h4>

                      {/* Maintenance Plans List for this Asset */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.5rem 0' }}>
                        {assetContracts.length === 0 ? (
                          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', fontSize: '0.775rem' }}>
                            ยังไม่มีการกำหนดความถี่หรือผูกเข้ากับสัญญาบำรุงรักษา
                          </div>
                        ) : (
                          assetContracts.map((contract, planIdx) => {
                            const isInternal = contract.contractNumber.startsWith('INT-PM-');
                            const planPendingSched = schedules
                              .filter(s => s.assetId === asset.id && s.contractId === contract.id && s.status === 'pending')
                              .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))[0];

                            const planCompletedScheds = schedules
                              .filter(s => s.assetId === asset.id && s.contractId === contract.id && s.status === 'completed')
                              .sort((a, b) => (b.completedDate || b.plannedDate).localeCompare(a.completedDate || a.plannedDate));
                            const latestCompleted = planCompletedScheds[0];

                            let displayNextDate = planPendingSched ? planPendingSched.plannedDate : '';
                            if (latestCompleted && contract.pmFrequency !== 'custom') {
                              let intervalMonths = 12;
                              if (contract.pmFrequency === 'monthly') intervalMonths = 1;
                              else if (contract.pmFrequency === 'quarterly') intervalMonths = 3;
                              else if (contract.pmFrequency === 'semi-annually') intervalMonths = 6;
                              else if (contract.pmFrequency === 'annually') intervalMonths = 12;

                              const lastDateStr = latestCompleted.completedDate || latestCompleted.plannedDate;
                              const lastDate = new Date(lastDateStr);
                              if (!isNaN(lastDate.getTime())) {
                                lastDate.setMonth(lastDate.getMonth() + intervalMonths);
                                const expectedNext = lastDate.toISOString().split('T')[0];
                                if (!displayNextDate || displayNextDate > expectedNext) {
                                  displayNextDate = expectedNext;
                                }
                              }
                            }

                            return (
                              <div key={contract.id} style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.775rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {/* Plan Title & Actions Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                                    {assetContracts.length > 1 ? `แผนที่ ${planIdx + 1}: ` : ''}{contract.title}
                                  </div>
                                  {currentUser?.role !== 'user' && (
                                    <button 
                                      onClick={() => handleEditContractClick(contract)}
                                      className="btn btn-ghost btn-xs"
                                      style={{ padding: '0.1rem 0.35rem', fontSize: '0.675rem', border: '1px solid var(--border)' }}
                                      title="แก้ไขแผนนี้"
                                    >
                                      ✏️ แก้ไข
                                    </button>
                                  )}
                                </div>

                                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                  {isInternal ? (
                                    <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.05rem 0.3rem' }}>📌 บำรุงรักษาเอง ({contract.contractNumber})</span>
                                  ) : (
                                    <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.05rem 0.3rem' }}>🧾 Outsource: {contract.vendorName} ({contract.contractNumber})</span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                                  <div>
                                    🔄 <strong>ความถี่:</strong> <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                      {contract.pmFrequency === 'monthly' ? 'ทุกๆ 1 เดือน (รายเดือน)' :
                                       contract.pmFrequency === 'quarterly' ? 'ทุกๆ 3 เดือน (รายไตรมาส)' :
                                       contract.pmFrequency === 'semi-annually' ? 'ทุกๆ 6 เดือน (รายครึ่งปี)' :
                                       contract.pmFrequency === 'custom' ? 'กำหนดวันนัดเอง' : 'ทุกๆ 12 เดือน (รายปี)'}
                                    </span>
                                  </div>
                                  <div>
                                    📅 {contract.hasNoEndDate || !contract.endDate ? 'ไม่มีกำหนดสิ้นสุด (ถาวร ♾️)' : `ถึง ${getThaiDateFormatted(contract.endDate)}`}
                                  </div>
                                </div>

                                {/* Next PM for this plan */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border)', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                                  <div>
                                    📅 <strong>PM ถัดไป:</strong>{' '}
                                    {displayNextDate ? (
                                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                        {getThaiDateFormatted(displayNextDate)}
                                      </span>
                                    ) : (
                                      <span style={{ color: 'var(--success)', fontWeight: 650 }}>✅ ครบทุกรอบ</span>
                                    )}
                                  </div>
                                  {planPendingSched && (
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                      <button 
                                        onClick={() => handleOpenReschedule(planPendingSched)}
                                        className="btn btn-ghost btn-xs"
                                        style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', border: '1px solid var(--border)' }}
                                        title="เลื่อนวันนัด PM"
                                      >
                                        📅 เลื่อนวัน
                                      </button>
                                      <button 
                                        onClick={() => handleOpenPMForm(planPendingSched)}
                                        className="btn btn-success btn-xs"
                                        style={{ padding: '0.15rem 0.45rem', fontSize: '0.675rem' }}
                                      >
                                        🔧 บันทึก PM
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Latest Completed PM for this plan if exists */}
                                {(() => {
                                  const planCompletedScheds = schedules
                                    .filter(s => s.assetId === asset.id && s.contractId === contract.id && s.status === 'completed')
                                    .sort((a, b) => (b.completedDate || b.plannedDate).localeCompare(a.completedDate || a.plannedDate));
                                  
                                  const latestCompleted = planCompletedScheds[0];
                                  if (!latestCompleted) return null;

                                  return (
                                    <div style={{ background: 'var(--bg-secondary)', padding: '0.4rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem', marginTop: '0.35rem' }}>
                                      <div>
                                        <span style={{ color: 'var(--success)', fontWeight: 700 }}>🟢 PM ล่าสุด:</span> {getThaiDateFormatted(latestCompleted.completedDate || latestCompleted.plannedDate)} {latestCompleted.operator ? `(${latestCompleted.operator})` : ''}
                                      </div>
                                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                                        <button 
                                          onClick={() => { setSelectedSchedule(latestCompleted); setIsPrintReportOpen(true); }}
                                          className="btn btn-ghost btn-xs"
                                          style={{ padding: '0.1rem 0.3rem', fontSize: '0.65rem', border: '1px solid var(--border)' }}
                                          title="ดู / พิมพ์ใบรายงาน A4"
                                        >
                                          🖨️ พิมพ์
                                        </button>
                                        {currentUser?.role !== 'user' && (
                                          <button 
                                            onClick={() => handleOpenPMForm(latestCompleted)}
                                            className="btn btn-ghost btn-xs"
                                            style={{ padding: '0.1rem 0.3rem', fontSize: '0.65rem', border: '1px solid var(--border)' }}
                                            title="แก้ไขข้อมูลผลการบำรุงรักษา"
                                          >
                                            ✏️ แก้ไข
                                          </button>
                                        )}
                                        {currentUser?.role === 'admin' && (
                                          <button 
                                            onClick={() => handleDeleteSchedule(latestCompleted.id)}
                                            className="btn btn-ghost btn-xs text-danger"
                                            style={{ padding: '0.1rem 0.3rem', fontSize: '0.65rem', border: '1px solid var(--border)' }}
                                            title="ลบบันทึกนี้"
                                          >
                                            🗑️ ลบ
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Schedule Summary Bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', margin: '0.4rem 0 0.25rem 0', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <span className="badge badge-muted" style={{ fontSize: '0.675rem' }}>PM รวมแล้ว: {completedCount} รอบ</span>
                          {assetRepairs.length > 0 && (
                            <span className="badge badge-danger" style={{ fontSize: '0.675rem' }}>ซ่อม CM: {assetRepairs.length} ครั้ง</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Asset Card Actions Bar */}
                    <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                      {/* Button 1: Open Logbook */}
                      <button 
                        onClick={() => {
                          setSelectedLogbookAsset(asset);
                          setIsLogbookOpen(true);
                        }}
                        className="btn btn-secondary btn-xs flex-1"
                        style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                        title="ดูประวัติสัญญา การบำรุงรักษา PM และเคสส่งซ่อม CM ทั้งหมดของครุภัณฑ์นี้"
                      >
                        📖 Logbook ประวัติเต็ม
                      </button>

                      {/* Button 2: Add Additional PM Plan */}
                      {currentUser?.role !== 'user' && (
                        <button 
                          onClick={() => handleOpenNewContract(asset.id, hasPlan ? `แผนงานบำรุงรักษาเพิ่มเติม - ${asset.name}` : `แผนงานบำรุงรักษา - ${asset.name}`)}
                          className="btn btn-primary btn-xs flex-1"
                          style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                          title="เพิ่มแผนการดูแลหรือทำสัญญาเพิ่มอีก 1 รายการให้ครุภัณฑ์ชิ้นนี้"
                        >
                          <Plus size={13} /> {hasPlan ? '+ เพิ่มแผน PM อีกรายการ' : '+ ตั้งค่าแผน PM แรก'}
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 4: CM Occasional Repairs */}
      {activeTab === 'repairs' && (
        <div className="repairs-cm-tab animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>บันทึกงานซ่อมแซมครั้งคราว (Corrective Maintenance - CM)</h3>
            <button className="btn btn-danger" onClick={() => setIsRepairFormOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={16} /> แจ้งเสียชำรุดด่วน (CM)
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="filter-panel glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{ flex: '1 1 300px' }}>
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="สืบค้นรหัสครุภัณฑ์ หรืออาการเสียใน CM Logs..." 
                className="form-input search-input"
                value={cmRepairSearch}
                onChange={(e) => setCmRepairSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={16} color="var(--text-muted)" />
              <select 
                className="form-select filter-select"
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                disabled={!isOrgWideUser}
                style={{ height: '38px', fontSize: '0.85rem', minWidth: '200px' }}
              >
                {isOrgWideUser ? (
                  <>
                    <option value="all">🌐 ทุกหน่วยงาน (ภาพรวมทั้งองค์กร)</option>
                    {Array.from(new Set(assets.map(a => a.department).filter(Boolean))).map(dept => (
                      <option key={dept} value={dept}>🏢 ฝ่าย: {dept}</option>
                    ))}
                  </>
                ) : (
                  <option value={currentUser?.department}>🏢 เฉพาะหน่วยงาน: {currentUser?.department}</option>
                )}
              </select>
            </div>
          </div>

          {/* CM Logs Table */}
          <div className="table-container glass-panel">
            <table className="custom-table" style={{ width: '100%', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  <th style={{ width: '105px' }}>วันที่แจ้งชำรุด</th>
                  <th style={{ width: '115px' }}>รหัสครุภัณฑ์</th>
                  <th style={{ minWidth: '150px' }}>ชื่อรายการครุภัณฑ์</th>
                  <th style={{ minWidth: '220px' }}>อาการเสีย (CM Details)</th>
                  <th style={{ width: '120px' }}>ผู้ทำเรื่องส่งซ่อม</th>
                  <th style={{ width: '110px' }}>สถานะการซ่อม</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>การจัดการเคส</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredCM = repairs.filter(r => {
                    const q = cmRepairSearch.toLowerCase().trim();
                    const matchesSearch = !q || 
                                          r.assetId.toLowerCase().includes(q) || 
                                          r.assetName.toLowerCase().includes(q) ||
                                          r.symptom.toLowerCase().includes(q) ||
                                          (r.notes && r.notes.toLowerCase().includes(q)) ||
                                          (r.repairCompany && r.repairCompany.toLowerCase().includes(q));
                    
                    const asset = assets.find(a => a.id === r.assetId);
                    const matchesDept = selectedDeptFilter === 'all' || (asset && asset.department === selectedDeptFilter);

                    return matchesSearch && matchesDept;
                  });

                  if (filteredCM.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          ไม่พบประวัติการแจ้งซ่อม CM ครั้งคราว
                        </td>
                      </tr>
                    );
                  }

                  return filteredCM.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontSize: '0.75rem', fontWeight: 650 }}>{getThaiDateFormatted(r.dateOpened)}</td>
                      <td style={{ 
                        fontFamily: 'monospace', 
                        fontWeight: 700, 
                        fontSize: '0.75rem', 
                        maxWidth: '115px', 
                        wordBreak: 'break-all', 
                        whiteSpace: 'normal', 
                        lineHeight: '1.25',
                        letterSpacing: '-0.2px' 
                      }}>
                        {r.assetId}
                      </td>
                      <td style={{ fontWeight: 750, color: 'var(--text-primary)' }}>
                        <div style={{ wordBreak: 'break-word' }}>{r.assetName}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ lineHeight: '1.35', fontSize: '0.775rem' }}>{r.symptom}</span>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                            {r.symptomImageUrl && (
                              <button
                                type="button"
                                onClick={() => handleOpenLightbox(r.symptomImageUrl!, `รูปถ่ายอาการเสีย - ${r.assetName}`)}
                                style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '3px', padding: '0.15rem 0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}
                                title="คลิกเพื่อเปิดดูรูปถ่ายอาการเสียขนาดเต็ม HD"
                              >
                                🖼️ รูปอาการเสีย (HD)
                              </button>
                            )}
                            {r.sentProofUrl && (
                              <button
                                type="button"
                                onClick={() => handleOpenLightbox(r.sentProofUrl!, `หลักฐานการนำส่งช่าง - ${r.assetName}`)}
                                style={{ fontSize: '0.7rem', color: 'var(--warning)', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '3px', padding: '0.15rem 0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}
                                title="คลิกเพื่อเปิดดูหลักฐานนำส่งช่าง"
                              >
                                🚚 รูปส่งช่าง (HD)
                              </button>
                            )}
                            {r.receivedProofUrl && (
                              <button
                                type="button"
                                onClick={() => handleOpenLightbox(r.receivedProofUrl!, `หลักฐานการตรวจรับของคืน - ${r.assetName}`)}
                                style={{ fontSize: '0.7rem', color: 'var(--success)', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '3px', padding: '0.15rem 0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}
                                title="คลิกเพื่อเปิดดูหลักฐานตรวจรับของคืน"
                              >
                                ✅ รูปตรวจรับคืน (HD)
                              </button>
                            )}
                          </div>
                          {r.dateSent && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              🚚 ร้านซ่อม: {r.repairCompany} {r.contactPerson ? `(โทร: ${r.contactPerson})` : ''}
                            </span>
                          )}
                          {r.notes && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--warning)', fontStyle: 'italic' }}>
                              📝 โน๊ตเพิ่มเติม: {r.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>👤 {r.operator}</td>
                      <td>
                        <span className={`badge ${
                          r.status === 'completed' ? 'badge-success' : 
                          (r.status === 'sent' ? 'badge-warning' : 'badge-danger')
                        }`} style={{ fontSize: '0.725rem' }}>
                          {r.status === 'completed' ? '🟢 ซ่อมสำเร็จ' : (r.status === 'sent' ? '🟡 นำส่งช่าง' : '🔴 รอช่างตรวจ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {/* Always Available: View & Edit Details / Add Notes */}
                          <button 
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleOpenCMDetails(r)}
                            style={{ padding: '0.2rem 0.45rem', height: 'auto', fontSize: '0.725rem', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                            title="ดูรายละเอียดเคส / บันทึกข้อมูลและข้อสังเกตเพิ่มเติม"
                          >
                            👁️ ดู / ✏️ บันทึกเพิ่ม
                          </button>

                          {currentUser?.role !== 'manager' && (
                            <>
                              {r.status === 'open' && (
                                <button 
                                  className="btn btn-warning btn-xs"
                                  onClick={() => {
                                    setWorkflowCase(r);
                                    setWorkflowAction('send');
                                    setRepairVendorName('');
                                    setRepairContactPhone('');
                                    setSendProofFile(null);
                                    setSendProofPreview(null);
                                  }}
                                  style={{ padding: '0.2rem 0.45rem', height: 'auto', fontSize: '0.725rem' }}
                                >
                                  🚚 นำส่งช่าง
                                </button>
                              )}
                              {r.status === 'sent' && (
                                <button 
                                  className="btn btn-success btn-xs"
                                  onClick={() => {
                                    setWorkflowCase(r);
                                    setWorkflowAction('receive');
                                    setReceiveProofFile(null);
                                    setReceiveProofPreview(null);
                                  }}
                                  style={{ padding: '0.2rem 0.45rem', height: 'auto', fontSize: '0.725rem' }}
                                >
                                  ✅ รับของคืน
                                </button>
                              )}
                              {r.status === 'completed' && (
                                <span className="badge badge-muted" style={{ fontSize: '0.675rem' }}>
                                  🔒 ปิดเคสแล้ว
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL: RESCHEDULE DATE PICKER (MOVE ACROSS MONTHS/YEARS) --- */}
      {isRescheduleOpen && rescheduleTarget && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10050, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
          <div className="glass-panel animate-scale-up" style={{ maxWidth: '480px', width: '100%', padding: '1.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={18} color="var(--primary)" /> 📅 เลื่อนวันนัด / ย้ายกำหนดการข้ามเดือน
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setIsRescheduleOpen(false); setRescheduleTarget(null); }} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>รหัสครุภัณฑ์: <code>{rescheduleTarget.assetId}</code></div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.15rem 0' }}>{resolveAssetName(rescheduleTarget.assetId, rescheduleTarget.assetName)}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 650 }}>📅 วันที่ตามแผนเดิม: {getThaiDateFormatted(rescheduleTarget.plannedDate)}</span>
            </div>

            {/* Quick Month Shift Shortcuts */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                ⚡ ปุ่มลัดเลื่อนข้ามเดือนด่วน (Quick Month Jump):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs" 
                  onClick={() => handleShiftRescheduleMonth(1)} 
                  style={{ border: '1px solid var(--border)', fontSize: '0.72rem', background: 'var(--bg-primary)' }}
                >
                  ⏩ +1 เดือน (เดือนหน้า)
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs" 
                  onClick={() => handleShiftRescheduleMonth(2)} 
                  style={{ border: '1px solid var(--border)', fontSize: '0.72rem', background: 'var(--bg-primary)' }}
                >
                  ⏩ +2 เดือน
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs" 
                  onClick={() => handleShiftRescheduleMonth(3)} 
                  style={{ border: '1px solid var(--border)', fontSize: '0.72rem', background: 'var(--bg-primary)' }}
                >
                  ⏩ +3 เดือน (ไตรมาส)
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs" 
                  onClick={() => handleShiftRescheduleMonth(6)} 
                  style={{ border: '1px solid var(--border)', fontSize: '0.72rem', background: 'var(--bg-primary)' }}
                >
                  ⏩ +6 เดือน (ครึ่งปี)
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs" 
                  onClick={() => handleShiftRescheduleMonth(12)} 
                  style={{ border: '1px solid var(--border)', fontSize: '0.72rem', background: 'var(--bg-primary)' }}
                >
                  ⏩ +1 ปี (ปีถัดไป)
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs" 
                  onClick={() => handleShiftRescheduleMonth(-1)} 
                  style={{ border: '1px solid var(--border)', fontSize: '0.72rem', background: 'var(--bg-primary)' }}
                >
                  ⏪ -1 เดือน (ย้อนกลับ)
                </button>
              </div>
            </div>

            {/* Quick Month & Year Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 650, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>🗓️ เลือกเดือนเป้าหมาย</label>
                <select 
                  className="form-select"
                  value={(() => {
                    const d = new Date(rescheduleNewDate || rescheduleTarget.plannedDate);
                    return isNaN(d.getTime()) ? 0 : d.getMonth();
                  })()}
                  onChange={(e) => {
                    const d = new Date(rescheduleNewDate || rescheduleTarget.plannedDate);
                    const y = isNaN(d.getTime()) ? currentYear : d.getFullYear();
                    handleSetRescheduleYearMonth(y, parseInt(e.target.value, 10));
                  }}
                  style={{ fontSize: '0.8rem', height: '36px' }}
                >
                  {monthNames.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 650, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>📅 เลือกปี พ.ศ.</label>
                <select 
                  className="form-select"
                  value={(() => {
                    const d = new Date(rescheduleNewDate || rescheduleTarget.plannedDate);
                    return isNaN(d.getTime()) ? currentYear : d.getFullYear();
                  })()}
                  onChange={(e) => {
                    const d = new Date(rescheduleNewDate || rescheduleTarget.plannedDate);
                    const m = isNaN(d.getTime()) ? currentMonth : d.getMonth();
                    handleSetRescheduleYearMonth(parseInt(e.target.value, 10), m);
                  }}
                  style={{ fontSize: '0.8rem', height: '36px' }}
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                    <option key={y} value={y}>พ.ศ. {y + 543} ({y})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exact Date Picker Input */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>📅 หรือระบุวันที่ใหม่อย่างละเอียด</label>
              <input 
                type="date" 
                className="form-input"
                value={rescheduleNewDate}
                onChange={(e) => setRescheduleNewDate(e.target.value)}
                required
              />
              {rescheduleNewDate && rescheduleNewDate !== rescheduleTarget.plannedDate && (
                <div style={{ marginTop: '0.65rem', padding: '0.5rem 0.75rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 650, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>➡️ ย้ายเป็น: <strong>{getThaiDateFormatted(rescheduleNewDate)}</strong></span>
                  <span style={{ fontSize: '0.72rem', background: 'var(--primary)', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
                    {getRescheduleDiffText()}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button 
                type="button"
                className="btn btn-ghost" 
                onClick={() => { setIsRescheduleOpen(false); setRescheduleTarget(null); }}
                style={{ border: '1px solid var(--border)' }}
              >
                ยกเลิก
              </button>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={handleRescheduleSubmit}
                disabled={!rescheduleNewDate || rescheduleNewDate === rescheduleTarget.plannedDate}
              >
                💾 บันทึกการย้ายกำหนดการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: PM RECORDING FORM --- */}
      {isPMFormOpen && selectedSchedule && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 99999, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
          <form onSubmit={handlePMSubmit} className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}><Wrench size={18} style={{ display: 'inline', marginRight: '0.35rem', color: 'var(--primary)' }} /> บันทึกผลการบำรุงรักษา PM</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => { 
                    setIsPMFormOpen(false); 
                    handleOpenReschedule(selectedSchedule); 
                  }} 
                  style={{ fontSize: '0.75rem', color: 'var(--warning)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.5rem' }}
                  title="เลื่อนวันนัด PM ไปเดือนอื่น"
                >
                  <Calendar size={14} /> 📅 ย้ายแผน/เลื่อนวัน
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsPMFormOpen(false)} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>
                  ✕
                </button>
              </div>
            </div>

            {(() => {
              if (!selectedSchedule) return null;
              const contract = contracts.find(c => c.id === selectedSchedule.contractId);
              const planTitle = contract ? contract.title : 'แผนบำรุงรักษาทั่วไป';
              
              const assetScheds = schedules
                .filter(s => s.contractId === selectedSchedule.contractId && s.assetId === selectedSchedule.assetId)
                .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
              const roundIndex = assetScheds.findIndex(s => s.id === selectedSchedule.id) + 1;
              const totalRounds = assetScheds.length;
              
              const prevRoundSched = roundIndex > 1 ? assetScheds[roundIndex - 2] : null;
              const prevNextPMNotes = prevRoundSched?.nextPMNotes || '';
              
              return (
                <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>รหัสครุภัณฑ์: <code>{selectedSchedule.assetId}</code></span>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>รอบ PM ที่ {roundIndex}/{totalRounds}</span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.1rem 0' }}>{resolveAssetName(selectedSchedule.assetId, selectedSchedule.assetName)}</h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 650 }}>
                    📋 แผนงาน/สัญญา: {planTitle}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    📅 วันที่ตามแผนบำรุงรักษา: {getThaiDateFormatted(selectedSchedule.plannedDate)}
                  </div>
                  {prevNextPMNotes && (
                    <div style={{ marginTop: '0.4rem', padding: '0.45rem 0.65rem', background: 'rgba(217, 119, 6, 0.08)', borderLeft: '3px solid var(--warning)', borderRadius: '0 4px 4px 0', fontSize: '0.72rem', color: '#d97706', fontWeight: 600 }}>
                      ⚠️ คำเตือน/ข้อพึงระวังจาก PM รอบก่อนหน้า: "{prevNextPMNotes}"
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Scrollable Form Fields */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group">
                <label className="form-label">📅 วันที่ดำเนินการตรวจ PM จริง</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>📋 เช็คลิสต์รายละเอียดดำเนินการ PM (เช็คลิสต์ตรวจสภาพ)</label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => setPmDetails(getPresetChecklist(selectedSchedule.assetName))}
                    style={{ fontSize: '0.72rem', color: 'var(--primary)', border: '1px solid var(--border)', padding: '0.15rem 0.45rem', background: 'var(--bg-primary)' }}
                    title="คลิกเพื่อดึงข้อความตัวอย่างเทมเพลตมาตรฐานตามประเภทครุภัณฑ์"
                  >
                    ✨ ใส่เทมเพลตตัวอย่าง
                  </button>
                </div>
                <textarea 
                  className="form-input"
                  rows={4}
                  value={pmDetails}
                  onChange={(e) => setPmDetails(e.target.value)}
                  placeholder="ระบุสิ่งที่เช็คและทำไป เช่น ตรวจสอบสภาพภายนอก, ปัดฝุ่น ทำความสะอาดเครื่อง..."
                  style={{ fontSize: '0.8rem', resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">📷 แนบรูปภาพ หรือ เอกสาร PDF หลักฐาน (สภาพหลังบำรุงรักษา)</label>
                <div className="image-dropzone" style={{ minHeight: '120px', padding: '0.85rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
                  <input 
                    type="file" 
                    id="pm-proof-uploader" 
                    accept="image/*,application/pdf,.pdf"
                    onChange={handleProofImageChange}
                    className="file-hidden-input"
                  />
                  <label htmlFor="pm-proof-uploader" className="dropzone-label" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
                    {compressingProof ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', padding: '1rem' }}>
                        <RefreshCw size={20} className="spin-animate" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>กำลังบีบอัดไฟล์ให้อยู่ในระดับ HD เพื่อประหยัดพื้นที่...</span>
                      </div>
                    ) : proofPreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem', width: '100%' }}>
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenLightbox(proofPreview, `ไฟล์หลักฐานการบำรุงรักษา PM - ${selectedSchedule?.assetName || 'พรีวิว'}`);
                          }}
                          style={{ position: 'relative', maxWidth: '160px', borderRadius: '6px', overflow: 'hidden', border: '2px solid var(--primary)', boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)', cursor: 'pointer', background: '#000' }}
                          title="คลิกเพื่อขยายดูรูปภาพขนาดเต็ม HD / ดาวน์โหลด"
                        >
                          <img src={proofPreview} alt="PM proof preview" style={{ width: '100%', display: 'block', maxHeight: '130px', objectFit: 'cover' }} />
                          {(proofInfo?.isPdf || (typeof proofPreview === 'string' && (proofPreview.toLowerCase().includes('.pdf') || proofPreview.startsWith('data:application/pdf')))) && (
                            <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
                              PDF HD
                            </span>
                          )}
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '3px 0', fontWeight: 650 }}>
                            🔍 คลิกดูเต็ม / โหลด
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{proofInfo?.name || 'ไฟล์หลักฐาน PM'}</span>
                          {proofInfo?.size && <span style={{ color: 'var(--success)', marginLeft: '0.35rem', fontWeight: 700 }}>({proofInfo.size} - บีบอัด HD คมชัด)</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOpenLightbox(proofPreview, `ไฟล์หลักฐานการบำรุงรักษา PM - ${selectedSchedule?.assetName || 'พรีวิว'}`);
                            }}
                            style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem' }}
                          >
                            🔍 เปิดดูขนาดเต็ม / ดาวน์โหลด
                          </button>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>หากต้องการอัปโหลดใหม่ ให้กดปุ่มอัปโหลดหรือลากไฟล์มาวางแทน</span>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                          <Camera size={26} color="var(--primary)" />
                          <FileText size={26} color="#ef4444" />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>คลิกเพื่ออัปโหลดเอกสาร PDF หรือ ถ่ายรูปภาพหลักฐาน</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                          ⚡ บีบอัดอัตโนมัติความคมชัดระดับ HD (อ่านเอกสาร/ตารางได้ชัดเจน ขนาดไฟล์เล็ก ~50-90 KB ประหยัดพื้นที่)
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>🚦 สถานะการดำเนินการ PM รอบนี้</label>
                <select
                  className="form-select"
                  value={pmStatus}
                  onChange={(e) => setPmStatus(e.target.value as any)}
                  required
                >
                  <option value="completed">เสร็จสมบูรณ์ตามแผน (Completed)</option>
                  <option value="postponed">เลื่อนการบำรุงรักษา (Postponed)</option>
                  <option value="awaiting_repair">ตรวจพบปัญหา/รอส่งซ่อมต่อ (Awaiting Repair)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">📝 โน๊ตแจ้งเตือน/ข้อพึงระวังสำหรับ PM รอบถัดไป</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={nextPMNotes}
                  onChange={(e) => setNextPMNotes(e.target.value)}
                  placeholder="เช่น รอบหน้าต้องเปลี่ยนไส้กรองพัดลมระบายอากาศ..."
                />
              </div>

              <div className="form-group" style={{ border: '1px solid var(--border)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.03)', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 650, fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox"
                    checked={shouldCreateCM}
                    onChange={(e) => {
                      setShouldCreateCM(e.target.checked);
                      if (e.target.checked) {
                        setPmStatus('awaiting_repair');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: 'var(--danger)' }}>🚨 ตรวจพบปัญหาและต้องการแจ้งซ่อม CM ต่อเนื่องทันที</span>
                </label>
                
                {shouldCreateCM && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.775rem' }}>🚨 อาการเสีย/ชำรุดที่พบ (จะสร้างใบแจ้งซ่อม CM อัตโนมัติ)</label>
                    <textarea 
                      className="form-input"
                      rows={2}
                      value={cmSymptom}
                      onChange={(e) => setCmSymptom(e.target.value)}
                      placeholder="เช่น มอเตอร์เริ่มส่งเสียงดังผิดปกติ ลมไม่เย็น..."
                      required={shouldCreateCM}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">📝 หมายเหตุเพิ่มเติม (Notes)</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={pmNotes}
                  onChange={(e) => setPmNotes(e.target.value)}
                  placeholder="เช่น การทำงานปกติดี อุณหภูมิเครื่องลดลง..."
                />
              </div>
            </div>

            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem', flexShrink: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsPMFormOpen(false)}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary" disabled={submittingPM}>
                {submittingPM ? 'กำลังประมวลผล...' : '💾 บันทึกเสร็จสมบูรณ์ (Complete)'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- MODAL 2: A4 PM REPORT PRINT PREVIEW --- */}
      {isPrintReportOpen && selectedSchedule && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 99999, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '800px', width: '100%', margin: '0 auto 1.5rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10060 }}>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--primary)' }}>🖨️ พิมพ์ใบรายงานผลบำรุงรักษาครุภัณฑ์ (PM Service Report)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>รายงานประวัติการเข้าตรวจบำรุงรักษาตามสัญญาเชิงวิศวกรรม</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setIsPrintReportOpen(false);
                  setSelectedSchedule(null);
                }}
              >
                ย้อนกลับ
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={16} /> สั่งพิมพ์ / PDF
              </button>
            </div>
          </div>

          <div className="print-paper-a4 printable-a4-document" style={{ background: '#ffffff', color: '#000000', maxWidth: '800px', width: '100%', margin: '0 auto', padding: '2.5rem 3rem', minHeight: '11.28in', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif", fontSize: '13px', lineHeight: '1.6', colorScheme: 'light', borderRadius: '4px' }}>
            
            {(() => {
              // Find related contract
              const contract = contracts.find(c => c.id === selectedSchedule.contractId);
              return (
                <>
                  <div style={{ textAlign: 'center', position: 'relative', marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '28px', color: '#000000', marginBottom: '0.5rem' }}>🇹🇭</div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#000000', margin: '0.2rem 0' }}>
                      ใบรายงานการบำรุงรักษาเชิงป้องกัน (Preventive Maintenance Report)
                    </h1>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#333333', margin: '0.2rem 0' }}>
                      ระบบคลังทรัพย์สินและบำรุงรักษาพัสดุ AssetWatch
                    </h2>
                  </div>

                  <hr style={{ border: '0', borderTop: '2px double #333333', margin: '1rem 0 1.5rem 0' }} />

                  {/* Main Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', background: '#f8f9fa', padding: '1.25rem', border: '1px solid #dddddd', borderRadius: '4px' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#000000' }}>📋 ข้อมูลสัญญาบำรุงรักษา</h3>
                      <div><strong>เลขที่โครงการ/สัญญา:</strong> <code>{contract?.contractNumber || 'ไม่ผูกสัญญา'}</code></div>
                      <div><strong>ชื่อโครงการสัญญา:</strong> {contract?.title || 'ไม่ได้ระบุ'}</div>
                      <div><strong>บริษัทคู่สัญญาผู้รับจ้าง:</strong> {contract?.vendorName || 'บริษัทดูแลทั่วไป'}</div>
                      <div><strong>ผู้ประสานงานช่าง:</strong> {contract?.contactPerson || 'ช่างประจำระบบ'} (โทร: {contract?.contactPhone || '-'})</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #dddddd', paddingLeft: '1.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#000000' }}>📦 ข้อมูลทรัพย์สินและรอบ PM</h3>
                      <div><strong>รหัสครุภัณฑ์พัสดุ:</strong> <code>{selectedSchedule.assetId}</code></div>
                      <div><strong>ชื่อรายการครุภัณฑ์:</strong> {resolveAssetName(selectedSchedule.assetId, selectedSchedule.assetName)}</div>
                      <div><strong>วันที่ทำจริง (Completed):</strong> {getThaiDateFormatted(selectedSchedule.completedDate || selectedSchedule.plannedDate)}</div>
                      {(() => {
                        const assetScheds = schedules
                          .filter(s => s.contractId === selectedSchedule.contractId && s.assetId === selectedSchedule.assetId)
                          .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
                        const roundIndex = assetScheds.findIndex(s => s.id === selectedSchedule.id) + 1;
                        const totalRounds = assetScheds.length;
                        return (
                          <div><strong>รอบการ PM:</strong> รอบที่ {roundIndex} จากทั้งหมด {totalRounds} รอบ</div>
                        );
                      })()}
                      <div><strong>เจ้าหน้าที่ผู้ตรวจสอบพัสดุ:</strong> 👤 {selectedSchedule.operator || 'เจ้าหน้าที่ตรวจเช็ค'}</div>
                    </div>
                  </div>

                  {/* Checklist Result Box */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '1.5rem 0 0.5rem 0', borderBottom: '1.5px solid #000000', paddingBottom: '0.25rem' }}>🔍 รายละเอียดการเข้าดำเนินการและผลการเช็คลิสต์</h3>
                  <div style={{ whiteSpace: 'pre-line', padding: '1rem', background: '#fcfcfc', border: '1px solid #eeeeee', borderRadius: '4px', minHeight: '120px', marginBottom: '1.5rem', fontSize: '12.5px' }}>
                    {selectedSchedule.details}
                  </div>

                  {selectedSchedule.notes && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <strong>📝 หมายเหตุข้อสังเกตความจำพิเศษ:</strong>
                      <div style={{ fontStyle: 'italic', color: '#555555', marginTop: '0.25rem' }}>"{selectedSchedule.notes}"</div>
                    </div>
                  )}

                  {(() => {
                    const assetScheds = schedules
                      .filter(s => s.contractId === selectedSchedule.contractId && s.assetId === selectedSchedule.assetId)
                      .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
                    const roundIndex = assetScheds.findIndex(s => s.id === selectedSchedule.id) + 1;
                    const prevRoundSched = roundIndex > 1 ? assetScheds[roundIndex - 2] : null;
                    const prevNextPMNotes = prevRoundSched?.nextPMNotes || '';
                    if (!prevNextPMNotes) return null;
                    return (
                      <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '4px', fontSize: '12.5px' }}>
                        <strong style={{ color: '#b45309' }}>⚠️ ข้อพึงระวัง/สิ่งที่ฝากเตือนจาก PM รอบก่อนหน้า (Previous Warning):</strong>
                        <div style={{ color: '#78350f', fontStyle: 'italic', marginTop: '0.25rem', paddingLeft: '0.5rem' }}>"{prevNextPMNotes}"</div>
                      </div>
                    );
                  })()}

                  {/* Proof of image */}
                  {selectedSchedule.proofImageUrl && (
                    <div style={{ marginBottom: '2rem' }}>
                      <strong>📸 ภาพถ่ายสภาพหลังดำเนินการบำรุงรักษา (Proof of Work):</strong>
                      <div style={{ marginTop: '0.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <img 
                          src={selectedSchedule.proofImageUrl} 
                          alt="PM proof" 
                          style={{ maxWidth: '380px', maxHeight: '200px', border: '2px solid #dddddd', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleOpenLightbox(selectedSchedule.proofImageUrl!, `ภาพถ่ายหลักฐาน PM - ${selectedSchedule.assetName}`)}
                          title="คลิกเพื่อขยายดูรูปภาพขนาดเต็ม HD / ดาวน์โหลด"
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs hide-on-print"
                          onClick={() => handleOpenLightbox(selectedSchedule.proofImageUrl!, `ภาพถ่ายหลักฐาน PM - ${selectedSchedule.assetName}`)}
                          style={{ border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}
                        >
                          🔍 เปิดดูขนาดเต็ม / ดาวน์โหลดไฟล์หลักฐาน
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Signature Zone */}
                  <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ textAlign: 'center', width: '280px' }}>
                      <div style={{ marginBottom: '3.5rem' }}>ลงชื่อ.................................................................. ช่างผู้บำรุงรักษา</div>
                      <div>( {contract?.contactPerson || '..............................................'} )</div>
                      <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.35rem' }}>ตัวแทนบริษัทผู้รับจ้าง</div>
                    </div>
                    <div style={{ textAlign: 'center', width: '280px' }}>
                      <div style={{ marginBottom: '3.5rem' }}>ลงชื่อ.................................................................. ผู้ตรวจสอบรับมอบ</div>
                      <div>( {selectedSchedule.operator || '..............................................'} )</div>
                      <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.35rem' }}>ตำแหน่ง: เจ้าหน้าที่ทะเบียนพัสดุ</div>
                    </div>
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      )}

      {/* --- MODAL 3: CONTRACT ENTRY FORM --- */}
      {isContractFormOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10050, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
          <form onSubmit={handleContractSubmit} className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                {editingContract ? '✏️ แก้ไขรายละเอียดแผน/สัญญาบำรุงรักษา' : '📝 ทำสัญญาและวางกำหนดบำรุงรักษาใหม่'}
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setIsContractFormOpen(false); setEditingContract(null); }} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>
                ✕
              </button>
            </div>

            {/* Scrollable Form Fields */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Plan Type Selection */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>🛠️ ลักษณะแผนบำรุงรักษา</label>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="contractType" 
                    checked={contractType === 'outsource'} 
                    onChange={() => setContractType('outsource')} 
                    style={{ cursor: 'pointer' }}
                  />
                  <span>จ้างเหมาคู่สัญญาภายนอก (Outsource Contract)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="contractType" 
                    checked={contractType === 'internal'} 
                    onChange={() => setContractType('internal')} 
                    style={{ cursor: 'pointer' }}
                  />
                  <span>บำรุงรักษาภายในโดยฝ่ายพัสดุเอง (Self-Maintenance)</span>
                </label>
              </div>
            </div>

            {contractType === 'outsource' ? (
              <>
                <div className="form-row-double">
                  <div className="form-group flex-1">
                    <label className="form-label">🧾 เลขที่สัญญา/โครงการอ้างอิง</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="เช่น PM-AC-2569-01"
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                      required={contractType === 'outsource'}
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">ชื่อโครงการจ้างบำรุงรักษา</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="เช่น สัญญาดูแลรักษาเครื่องปรับอากาศ 2569"
                      value={contractTitle}
                      onChange={(e) => setContractTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-double">
                  <div className="form-group flex-1">
                    <label className="form-label">🏢 บริษัทผู้รับสัญญา/บจก.</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="เช่น บริษัท ลมดีบริการแอร์ จำกัด"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      required={contractType === 'outsource'}
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">🔄 ความถี่รอบเข้าบำรุงรักษา (Frequency)</label>
                    <select 
                      className="form-select"
                      value={pmFrequency}
                      onChange={(e) => setPmFrequency(e.target.value as PMContract['pmFrequency'])}
                      required
                    >
                      <option value="monthly">รายเดือน (Monthly)</option>
                      <option value="quarterly">รายไตรมาส (Quarterly - 3 เดือน)</option>
                      <option value="semi-annually">รายครึ่งปี (Semi-annually - 6 เดือน)</option>
                      <option value="annually">รายปี (Annually)</option>
                      <option value="custom">กำหนดเอง / เลือกวันนัดหมายเอง (Custom)</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div className="form-row-double">
                <div className="form-group flex-1">
                  <label className="form-label">📝 ชื่อแผนงานบำรุงรักษาภายใน</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="เช่น แผนตรวจเช็คสภาพเครื่องพิมพ์สำนักงานประจำปี"
                    value={contractTitle}
                    onChange={(e) => setContractTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">🔄 ความถี่รอบเข้าบำรุงรักษา (Frequency)</label>
                  <select 
                    className="form-select"
                    value={pmFrequency}
                    onChange={(e) => setPmFrequency(e.target.value as PMContract['pmFrequency'])}
                    required
                  >
                    <option value="monthly">รายเดือน (Monthly)</option>
                    <option value="quarterly">รายไตรมาส (Quarterly - 3 เดือน)</option>
                    <option value="semi-annually">รายครึ่งปี (Semi-annually - 6 เดือน)</option>
                    <option value="annually">รายปี (Annually)</option>
                    <option value="custom">กำหนดเอง / เลือกวันนัดหมายเอง (Custom)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="form-row-double">
              <div className="form-group flex-1">
                <label className="form-label">📅 วันเริ่มต้นแผน/สัญญา</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={contractStart}
                  onChange={(e) => setContractStart(e.target.value)}
                  required
                />
              </div>

              <div className="form-group flex-1">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>📅 วันสิ้นสุดแผน/สัญญา</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--primary)', fontWeight: 650 }}>
                    <input 
                      type="checkbox"
                      checked={hasNoEndDate}
                      onChange={(e) => {
                        setHasNoEndDate(e.target.checked);
                        if (e.target.checked) setContractEnd('');
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>♾️ ไม่มีกำหนดสิ้นสุด</span>
                  </label>
                </div>
                <input 
                  type="date" 
                  className="form-input"
                  value={contractEnd}
                  onChange={(e) => setContractEnd(e.target.value)}
                  disabled={hasNoEndDate}
                  required={!hasNoEndDate}
                  style={{ opacity: hasNoEndDate ? 0.45 : 1 }}
                />
              </div>
            </div>

            {hasNoEndDate && (
              <div style={{ fontSize: '0.725rem', color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.08)', border: '1px dashed var(--primary)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '-0.4rem' }}>
                ℹ️ <strong>แผนบำรุงรักษาต่อเนื่องถาวร:</strong> (เช่น การเปลี่ยนแบตเตอรี่ หรือตรวจเช็คสภาพสม่ำเสมอ) ระบบจะสร้างรอบนัดหมายอัตโนมัติตามความถี่ที่เลือกอย่างต่อเนื่อง
              </div>
            )}

            {contractType === 'outsource' && (
              <div className="form-row-double">
                <div className="form-group flex-1">
                  <label className="form-label">👤 ผู้ประสานงาน/ช่างประจำสัญญา</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="เช่น ช่างสมเจตน์"
                    value={vendorContact}
                    onChange={(e) => setVendorContact(e.target.value)}
                    required={contractType === 'outsource'}
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">📞 เบอร์โทรศัพท์โทรด่วนช่าง</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="เช่น 081-XXX-XXXX"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    required={contractType === 'outsource'}
                  />
                </div>
              </div>
            )}

            {/* --- INDIVIDUAL PM SCHEDULE DATES EDITOR PER ASSET (ACCORDION) --- */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border)', padding: '1.15rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 800, margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={16} color="var(--primary)" /> 📅 วางกำหนดการบำรุงรักษาแยกรายเครื่อง ({selectedAssetIds.length} เครื่อง)
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    ท่านสามารถระบุ/แก้ไขรอบวันนัดหมาย PM แยกอิสระสำหรับครุภัณฑ์แต่ละเครื่องได้
                  </span>
                </div>
                
                {selectedAssetIds.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => {
                      const autoDates = calculateDefaultPMDates(contractStart, contractEnd, hasNoEndDate, pmFrequency);
                      setAssetPMDates(prev => {
                        const next = { ...prev };
                        for (const id of selectedAssetIds) {
                          next[id] = autoDates;
                        }
                        return next;
                      });
                    }}
                    style={{ border: '1px solid var(--border)', fontSize: '0.72rem', background: 'var(--bg-secondary)', color: 'var(--primary)', fontWeight: 700 }}
                    title="คำนวณและตั้งรอบ PM อัตโนมัติตามวันเริ่มต้น-สิ้นสุดของสัญญาให้ทุกเครื่องพร้อมกัน"
                  >
                    🔄 คำนวณรอบอัตโนมัติให้ทุกเครื่อง
                  </button>
                )}
              </div>

              {selectedAssetIds.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  💡 กรุณาเลือกครุภัณฑ์ในรายการด้านล่าง เพื่อเปิดการตั้งค่ารอบบำรุงรักษา
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto', padding: '0.25rem' }}>
                  {selectedAssetIds.map((assetId) => {
                    const asset = assets.find(a => a.id === assetId);
                    if (!asset) return null;
                    const dates = assetPMDates[assetId] || [];
                    const isExpanded = expandedAssetId === assetId;
                    
                    return (
                      <div key={assetId} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                        {/* Accordion Header */}
                        <div 
                          onClick={() => setExpandedAssetId(isExpanded ? null : assetId)}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: isExpanded ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-primary)', cursor: 'pointer', borderBottom: isExpanded ? '1px solid var(--border)' : 'none', userSelect: 'none' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 750, color: 'var(--primary)', fontFamily: 'monospace', flexShrink: 0 }}>
                              {assetId}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              - {asset.name}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={`badge ${dates.length > 0 ? 'badge-primary' : 'badge-danger'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                              {dates.length} รอบ PM
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {isExpanded ? '▼' : '►'}
                            </span>
                          </div>
                        </div>

                        {/* Accordion Content */}
                        {isExpanded && (
                          <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
                              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                กำหนดวันนัดหมาย PM สำหรับเครื่องนี้:
                              </span>
                              <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => {
                                    const autoDates = calculateDefaultPMDates(contractStart, contractEnd, hasNoEndDate, pmFrequency);
                                    setAssetPMDates(prev => ({ ...prev, [assetId]: autoDates }));
                                  }}
                                  style={{ border: '1px solid var(--border)', fontSize: '0.65rem', padding: '1px 4px', background: 'var(--bg-secondary)' }}
                                >
                                  🔄 ตั้งอัตโนมัติ
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => {
                                    setAssetPMDates(prev => ({
                                      ...prev,
                                      [assetId]: (prev[assetId] || []).map(dateStr => {
                                        const d = new Date(dateStr);
                                        if (isNaN(d.getTime())) return dateStr;
                                        d.setMonth(d.getMonth() + 1);
                                        return d.toISOString().split('T')[0];
                                      }).sort()
                                    }));
                                  }}
                                  style={{ border: '1px solid var(--border)', fontSize: '0.65rem', padding: '1px 4px', background: 'var(--bg-secondary)' }}
                                >
                                  ⏩ +1 ด.
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => {
                                    setAssetPMDates(prev => ({
                                      ...prev,
                                      [assetId]: (prev[assetId] || []).map(dateStr => {
                                        const d = new Date(dateStr);
                                        if (isNaN(d.getTime())) return dateStr;
                                        d.setMonth(d.getMonth() - 1);
                                        return d.toISOString().split('T')[0];
                                      }).sort()
                                    }));
                                  }}
                                  style={{ border: '1px solid var(--border)', fontSize: '0.65rem', padding: '1px 4px', background: 'var(--bg-secondary)' }}
                                >
                                  ⏪ -1 ด.
                                </button>
                              </div>
                            </div>

                            {/* Add date for this specific asset */}
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <input 
                                type="date" 
                                className="form-input" 
                                id={`new-date-${assetId}`}
                                style={{ height: '30px', padding: '0.15rem 0.4rem', fontSize: '0.75rem', flex: 1 }}
                              />
                              <button
                                type="button"
                                className="btn btn-primary btn-xs"
                                onClick={() => {
                                  const inputEl = document.getElementById(`new-date-${assetId}`) as HTMLInputElement;
                                  const dateVal = inputEl?.value;
                                  if (!dateVal) return;
                                  if (dates.includes(dateVal)) {
                                    alert('วันที่นี้อยู่ในรายการนัดหมายแล้ว');
                                    return;
                                  }
                                  setAssetPMDates(prev => ({
                                    ...prev,
                                    [assetId]: [...(prev[assetId] || []), dateVal].sort()
                                  }));
                                  if (inputEl) inputEl.value = '';
                                }}
                                style={{ padding: '0.2rem 0.65rem', fontSize: '0.7rem', height: '30px', whiteSpace: 'nowrap' }}
                              >
                                + เพิ่มวัน
                              </button>
                            </div>

                            {/* Date List for this asset */}
                            {dates.length === 0 ? (
                              <div style={{ padding: '0.5rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed var(--danger)', borderRadius: '4px', color: 'var(--danger)', fontSize: '0.72rem' }}>
                                ⚠️ ยังไม่มีวันนัดหมาย PM สำหรับเครื่องนี้
                              </div>
                            ) : (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '0.35rem', maxHeight: '120px', overflowY: 'auto', padding: '0.2rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-secondary)' }}>
                                {dates.map((dateStr, idx) => {
                                  const [y, m, d] = dateStr.split('-');
                                  const thaiCompact = y && m && d ? `${d}/${m}/${parseInt(y) + 543}` : dateStr;
                                  
                                  return (
                                    <div 
                                      key={`${dateStr}-${idx}`} 
                                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.2rem 0.35rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '0.7rem' }}
                                    >
                                      <span style={{ fontWeight: 600 }}>{idx + 1}: {thaiCompact}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAssetPMDates(prev => ({
                                            ...prev,
                                            [assetId]: (prev[assetId] || []).filter((_, i) => i !== idx)
                                          }));
                                        }}
                                        style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0 2px', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Checkbox selector for assets (Searchable + Quick Select) */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                  🔒 เลือกครุภัณฑ์ที่เข้าควบคุมในสัญญานี้ (เลือกแล้ว <span style={{ color: 'var(--primary)' }}>{selectedAssetIds.length}</span> รายการ)
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-xs" 
                    onClick={() => {
                      const filteredIds = filteredModalAssets.map(a => a.id);
                      setSelectedAssetIds(prev => Array.from(new Set([...prev, ...filteredIds])));
                      setAssetPMDates(prev => {
                        const next = { ...prev };
                        const autoDates = calculateDefaultPMDates(contractStart, contractEnd, hasNoEndDate, pmFrequency);
                        for (const id of filteredIds) {
                          if (!next[id] || next[id].length === 0) {
                            next[id] = autoDates;
                          }
                        }
                        return next;
                      });
                      if (filteredIds.length > 0) {
                        setExpandedAssetId(filteredIds[0]);
                      }
                    }}
                    style={{ fontSize: '0.725rem', padding: '0.15rem 0.45rem', color: 'var(--primary)', border: '1px solid var(--border)' }}
                    title="เลือกครุภัณฑ์ทั้งหมดที่ค้นพบขณะนี้"
                  >
                    ☑️ เลือกผลลัพธ์ทั้งหมด
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-xs" 
                    onClick={() => {
                      setSelectedAssetIds([]);
                      setAssetPMDates({});
                      setExpandedAssetId(null);
                    }}
                    style={{ fontSize: '0.725rem', padding: '0.15rem 0.45rem', color: 'var(--danger)', border: '1px solid var(--border)' }}
                    title="ยกเลิกการเลือกครุภัณฑ์ทั้งหมด"
                  >
                    ✕ ยกเลิกทั้งหมด
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="🔍 ค้นหาครุภัณฑ์ตามรหัส (ID), ชื่อครุภัณฑ์, ห้องจัดเก็บ, ฝ่าย..." 
                  value={modalAssetSearch}
                  onChange={(e) => setModalAssetSearch(e.target.value)}
                  style={{ paddingLeft: '2.2rem', fontSize: '0.825rem', height: '36px' }}
                />
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, pointerEvents: 'none', fontSize: '0.85rem' }}>🔍</span>
                {modalAssetSearch && (
                  <button 
                    type="button" 
                    onClick={() => setModalAssetSearch('')}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border)', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)' }}>
                {filteredModalAssets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.825rem', fontStyle: 'italic' }}>
                    🔍 ไม่พบครุภัณฑ์ที่ตรงกับคำค้นหา "{modalAssetSearch}"
                  </div>
                ) : (
                  filteredModalAssets.map(asset => {
                    const isChecked = selectedAssetIds.includes(asset.id);
                    return (
                      <label key={asset.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', padding: '0.2rem 0.25rem', borderRadius: '4px', background: isChecked ? 'rgba(59, 130, 246, 0.08)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAssetIds(prev => [...prev, asset.id]);
                              setAssetPMDates(prev => {
                                if (prev[asset.id] && prev[asset.id].length > 0) return prev;
                                const autoDates = calculateDefaultPMDates(contractStart, contractEnd, hasNoEndDate, pmFrequency);
                                return { ...prev, [asset.id]: autoDates };
                              });
                              setExpandedAssetId(asset.id);
                            } else {
                              setSelectedAssetIds(prev => prev.filter(id => id !== asset.id));
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{asset.id}</strong> - {asset.name}
                        </span>
                        <span className="badge badge-muted" style={{ fontSize: '0.675rem', padding: '0.1rem 0.4rem', flexShrink: 0 }}>📍 {asset.location}</span>
                      </label>
                    );
                  })
                )}
              </div>
              
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                แสดง {filteredModalAssets.length} จากทั้งหมด {assets.filter(a => a.status !== 'รอจำหน่าย').length} รายการ
              </div>
            </div>

          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem', flexShrink: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setIsContractFormOpen(false); setEditingContract(null); }}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary" disabled={submittingContract}>
                {submittingContract ? 'กำลังบันทึก...' : (editingContract ? '💾 บันทึกการแก้ไขแผน/สัญญา' : '💾 สร้างสัญญากลุ่มและแผนบำรุงรักษา')}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- MODAL 4: AD-HOC REPAIR (CM) --- */}
      {isRepairFormOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10050, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
          <form onSubmit={handleRepairSubmit} className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '520px', width: '100%', background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>🚨 เปิดเคสแจ้งซ่อมด่วนเป็นครั้งคราว (Corrective Maintenance)</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsRepairFormOpen(false)} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>
                ✕
              </button>
            </div>

            <SearchableSelect
              label="🔍 เลือกครุภัณฑ์ที่จะส่งซ่อม"
              options={assets
                .filter(a => a.status !== 'รอจำหน่าย' && (currentUser?.role !== 'user' || a.department === currentUser.department))
                .map(asset => ({
                  value: asset.id,
                  label: `${asset.id} - ${asset.name}${asset.department ? ` (${asset.department})` : ''}${asset.location ? ` [${asset.location}]` : ''}`
                }))}
              value={repairAssetId}
              onChange={(val) => setRepairAssetId(val)}
              placeholder="-- พิมพ์เพื่อค้นหา / เลือกครุภัณฑ์ --"
              required
            />

            <div className="form-group">
              <label className="form-label">⚠️ ระบุอาการชำรุดเสียหายที่พบ</label>
              <textarea 
                className="form-input"
                rows={3}
                value={repairSymptom}
                onChange={(e) => setRepairSymptom(e.target.value)}
                placeholder="เช่น เครื่องพิมพ์กระดาษติดบ่อย, เครื่องปรับอากาศไม่มีลมเย็นออก..."
                required
              />
            </div>

            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsRepairFormOpen(false)}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-danger" disabled={submittingRepair}>
                {submittingRepair ? 'กำลังประมวลผลบันทึก...' : '🚨 ยืนยันเปิดใบแจ้งซ่อมด่วน'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- MODAL 5: CM REPAIR DISPATCH (SEND TO VENDOR) --- */}
      {workflowAction === 'send' && workflowCase && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10050, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
          <form onSubmit={handleSentToVendorSubmit} className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '520px', width: '100%', background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>🚚 นำส่งครุภัณฑ์ไปยังช่างซ่อม</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setWorkflowAction(null)} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>หมายเลขเคส: <code>{workflowCase.id}</code></div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.15rem 0' }}>{workflowCase.assetName}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 650 }}>⚠️ อาการชำรุด: {workflowCase.symptom}</span>
            </div>

            <div className="form-group">
              <label className="form-label">🏢 บริษัทร้านค้าช่างผู้ดูแลซ่อมแซม</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="เช่น บริษัทแอดไวซ์ ไอที สาขากรุงเทพ, ช่างชาติซ่อมแอร์..."
                value={repairVendorName}
                onChange={(e) => setRepairVendorName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">📞 เบอร์โทรศัพท์ช่องทางติดต่อช่างซ่อม</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="เช่น 081-XXXXXXX"
                value={repairContactPhone}
                onChange={(e) => setRepairContactPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">📷 ถ่ายรูปหรือแนบเอกสาร PDF การเซ็นส่งของ / ใบรับเคลม (ตัวเลือก)</label>
              <div className="image-dropzone" style={{ minHeight: '120px', padding: '0.85rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
                <input 
                  type="file" 
                  id="send-proof-picker"
                  accept="image/*,application/pdf,.pdf"
                  onChange={handleSendProofImageChange}
                  className="file-hidden-input"
                />
                <label htmlFor="send-proof-picker" className="dropzone-label" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
                  {compressingSendProof ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', padding: '1rem' }}>
                      <RefreshCw size={20} className="spin-animate" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>กำลังบีบอัดไฟล์ให้อยู่ในระดับ HD...</span>
                    </div>
                  ) : sendProofPreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                      <div 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenLightbox(sendProofPreview, `หลักฐานการนำส่งช่าง - ${workflowCase.assetName}`);
                        }}
                        style={{ position: 'relative', maxWidth: '180px', borderRadius: '6px', overflow: 'hidden', border: '2px solid var(--warning)', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)', cursor: 'pointer', background: '#000' }}
                        title="คลิกเพื่อขยายดูรูปภาพขนาดเต็ม HD"
                      >
                        <img src={sendProofPreview} alt="Send proof preview" style={{ width: '100%', display: 'block', maxHeight: '140px', objectFit: 'cover' }} />
                        {sendProofInfo?.isPdf && (
                          <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
                            PDF HD
                          </span>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '3px 0', fontWeight: 650 }}>
                          🔍 คลิกซูมดูรูปเต็ม
                        </div>
                      </div>

                      <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sendProofInfo?.name || 'ใบนำส่งเคลม'}</span>
                        {sendProofInfo?.size && <span style={{ color: 'var(--success)', marginLeft: '0.35rem', fontWeight: 700 }}>({sendProofInfo.size} - บีบอัด HD)</span>}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-warning btn-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenLightbox(sendProofPreview, `หลักฐานการนำส่งช่าง - ${workflowCase.assetName}`);
                          }}
                          style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem' }}
                        >
                          🔍 เปิดดูรูปภาพ/PDF ขนาดเต็ม (HD)
                        </button>

                        <label
                          htmlFor="send-proof-picker"
                          style={{ fontSize: '0.72rem', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', padding: '0.25rem' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          🔄 คลิกเพื่อเปลี่ยนไฟล์
                        </label>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <Camera size={26} color="var(--primary)" />
                        <FileText size={26} color="#ef4444" />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>คลิกเพื่อแนบเอกสาร PDF หรือ รูปภาพใบนำส่ง</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⚡ บีบอัด HD อัตโนมัติ ประหยัดพื้นที่จัดเก็บบนคลาวด์</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setWorkflowAction(null)}>ยกเลิก</button>
              <button type="submit" className="btn btn-warning" disabled={submittingSend}>
                {submittingSend ? 'กำลังอัปเดต...' : '🚚 อัปเดตสถานะขนส่งแล้ว'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- MODAL 6: CM REPAIR RECEIVE (RECEIVE BACK FROM VENDOR) --- */}
      {workflowAction === 'receive' && workflowCase && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10050, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
          <form onSubmit={handleReceiveSubmit} className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '520px', width: '100%', background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>✅ ตรวจรับของคืนคลังและปิดงานซ่อม</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setWorkflowAction(null)} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>หมายเลขเคส: <code>{workflowCase.id}</code></div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.15rem 0' }}>{workflowCase.assetName}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 650 }}>🏢 ร้านซ่อม: {workflowCase.repairCompany} (โทร: {workflowCase.contactPerson})</span>
            </div>

            <div className="form-group">
              <label className="form-label">📅 วันที่ตรวจรับของส่งกลับคืนคลังสำเร็จ</label>
              <input 
                type="date" 
                className="form-input" 
                value={receiveDate}
                onChange={(e) => setReceiveDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">📷 ถ่ายรูปหรือแนบเอกสาร PDF ใบเสร็จปิดงาน / สภาพของรับคืน (ตัวเลือก)</label>
              <div className="image-dropzone" style={{ minHeight: '120px', padding: '0.85rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
                <input 
                  type="file" 
                  id="receive-proof-picker"
                  accept="image/*,application/pdf,.pdf"
                  onChange={handleReceiveProofImageChange}
                  className="file-hidden-input"
                />
                <label htmlFor="receive-proof-picker" className="dropzone-label" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
                  {compressingReceiveProof ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', padding: '1rem' }}>
                      <RefreshCw size={20} className="spin-animate" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>กำลังบีบอัดไฟล์ให้อยู่ในระดับ HD...</span>
                    </div>
                  ) : receiveProofPreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                      <div 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenLightbox(receiveProofPreview, `หลักฐานการตรวจรับของคืน - ${workflowCase.assetName}`);
                        }}
                        style={{ position: 'relative', maxWidth: '180px', borderRadius: '6px', overflow: 'hidden', border: '2px solid var(--success)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)', cursor: 'pointer', background: '#000' }}
                        title="คลิกเพื่อขยายดูรูปภาพขนาดเต็ม HD"
                      >
                        <img src={receiveProofPreview} alt="Receive proof preview" style={{ width: '100%', display: 'block', maxHeight: '140px', objectFit: 'cover' }} />
                        {receiveProofInfo?.isPdf && (
                          <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
                            PDF HD
                          </span>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '3px 0', fontWeight: 650 }}>
                          🔍 คลิกซูมดูรูปเต็ม
                        </div>
                      </div>

                      <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{receiveProofInfo?.name || 'หลักฐานตรวจรับของ'}</span>
                        {receiveProofInfo?.size && <span style={{ color: 'var(--success)', marginLeft: '0.35rem', fontWeight: 700 }}>({receiveProofInfo.size} - บีบอัด HD)</span>}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-success btn-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenLightbox(receiveProofPreview, `หลักฐานการตรวจรับของคืน - ${workflowCase.assetName}`);
                          }}
                          style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem' }}
                        >
                          🔍 เปิดดูรูปภาพ/PDF ขนาดเต็ม (HD)
                        </button>

                        <label
                          htmlFor="receive-proof-picker"
                          style={{ fontSize: '0.72rem', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', padding: '0.25rem' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          🔄 คลิกเพื่อเปลี่ยนไฟล์
                        </label>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <Camera size={26} color="var(--primary)" />
                        <FileText size={26} color="#ef4444" />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>คลิกเพื่อแนบเอกสาร PDF หรือ รูปภาพตรวจรับของ</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⚡ บีบอัด HD อัตโนมัติ ประหยัดพื้นที่จัดเก็บบนคลาวด์</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setWorkflowAction(null)}>ยกเลิก</button>
              <button type="submit" className="btn btn-success" disabled={submittingReceive}>
                {submittingReceive ? 'กำลังตรวจรับของ...' : '✅ ตรวจรับ & ปิดเคสสำเร็จ'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- MODAL 5: ASSET LOGBOOK VIEWER --- */}
      {isLogbookOpen && selectedLogbookAsset && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9990, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
          <div className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '920px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📖 Maintenance Logbook — สมุดประวัติครุภัณฑ์
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  <code style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedLogbookAsset.id}</code> — {selectedLogbookAsset.name}
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setIsLogbookOpen(false); setSelectedLogbookAsset(null); }} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Asset Info Card Summary */}
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div>📍 <strong>สถานที่จัดเก็บ:</strong> {selectedLogbookAsset.location || '-'}</div>
                <div>🏢 <strong>หน่วยงาน/ฝ่าย:</strong> {selectedLogbookAsset.department}</div>
                <div>👤 <strong>ผู้รับผิดชอบ:</strong> {selectedLogbookAsset.responsiblePerson || '-'}</div>
                <div>🟢 <strong>สถานะปัจจุบัน:</strong> <span className={`badge ${selectedLogbookAsset.status === 'ใช้งานได้' ? 'badge-success' : 'badge-danger'}`}>{selectedLogbookAsset.status}</span></div>
                <div>💰 <strong>ที่มา/งบประมาณ:</strong> {selectedLogbookAsset.source || '-'}</div>
                <div>📝 <strong>หมายเหตุ:</strong> {selectedLogbookAsset.note || '-'}</div>
              </div>

              {/* SECTION 1: CONTRACT HISTORY */}
              {(() => {
                const assetContracts = contracts.filter(c => c.assetIds.includes(selectedLogbookAsset.id));
                return (
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>
                        📜 ประวัติสัญญาและการจัดทำแผนบำรุงรักษา ({assetContracts.length} ฉบับ)
                      </h4>
                      {currentUser?.role !== 'user' && (
                        <button 
                          type="button"
                          className="btn btn-primary btn-xs"
                          onClick={() => {
                            setIsLogbookOpen(false);
                            handleOpenNewContract(selectedLogbookAsset.id, `ต่อสัญญาบำรุงรักษา - ${selectedLogbookAsset.name}`);
                          }}
                          style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
                        >
                          + ต่อสัญญาใหม่ / ทำสัญญาฉบับใหม่
                        </button>
                      )}
                    </div>

                    {assetContracts.length === 0 ? (
                      <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '0.75rem' }}>
                        ยังไม่มีประวัติการทำสัญญาหรือตั้งค่าแผนบำรุงรักษาสำหรับครุภัณฑ์นี้
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {assetContracts.map((c, idx) => {
                          const isInternal = c.contractNumber.startsWith('INT-PM-');
                          const isLatest = idx === assetContracts.length - 1;
                          return (
                            <div key={c.id} style={{ border: '1px solid var(--border)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: isLatest ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                  {isInternal ? '📌 [แผนภายใน]' : '🧾 [สัญญา Outsource]'} {c.title}
                                </div>
                                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                  {isLatest ? (
                                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>สัญญาปัจจุบัน</span>
                                  ) : (
                                    <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>สัญญาในอดีต (หมดอายุแล้ว)</span>
                                  )}
                                  {currentUser?.role !== 'user' && (
                                    <button 
                                      onClick={() => { setIsLogbookOpen(false); handleEditContractClick(c); }}
                                      className="btn btn-ghost btn-xs"
                                      style={{ padding: '0.1rem 0.35rem', fontSize: '0.65rem', border: '1px solid var(--border)' }}
                                    >
                                      ✏️ แก้ไข
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div style={{ color: 'var(--text-secondary)' }}>
                                <strong>เลขที่สัญญา:</strong> <code>{c.contractNumber}</code> | <strong>บริษัท:</strong> {c.vendorName} | <strong>ติดต่อ:</strong> {c.contactPerson} ({c.contactPhone})
                              </div>
                              <div style={{ color: 'var(--text-secondary)' }}>
                                📅 <strong>ระยะเวลา:</strong> {getThaiDateFormatted(c.startDate)} ถึง {c.hasNoEndDate || !c.endDate ? 'ไม่มีกำหนดสิ้นสุด (ถาวร ♾️)' : getThaiDateFormatted(c.endDate)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* SECTION 2: PM EXECUTION LOGBOOK */}
              {(() => {
                const assetSchedules = schedules
                  .filter(s => s.assetId === selectedLogbookAsset.id)
                  .sort((a, b) => b.plannedDate.localeCompare(a.plannedDate));

                return (
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      🛠️ ประวัติการเข้าตรวจบำรุงรักษา PM ทั้งหมด ({assetSchedules.length} รอบ)
                    </h4>

                    {assetSchedules.length === 0 ? (
                      <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '0.75rem' }}>
                        ยังไม่มีประวัติรอบการเข้าตรวจบำรุงรักษา PM
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '0.775rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '0.4rem' }}>วันที่นัด (Planned)</th>
                              <th style={{ padding: '0.4rem' }}>วันที่ทำจริง (Completed)</th>
                              <th style={{ padding: '0.4rem' }}>สถานะ</th>
                              <th style={{ padding: '0.4rem' }}>ผู้ตรวจ/ช่าง</th>
                              <th style={{ padding: '0.4rem' }}>รายละเอียด / หมายเหตุ</th>
                              <th style={{ padding: '0.4rem' }}>หลักฐาน (Proof)</th>
                              <th style={{ padding: '0.4rem', textAlign: 'center' }}>จัดการ (Actions)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assetSchedules.map(sched => (
                              <tr key={sched.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.4rem', fontWeight: 650 }}>{getThaiDateFormatted(sched.plannedDate)}</td>
                                <td style={{ padding: '0.4rem' }}>{sched.completedDate ? getThaiDateFormatted(sched.completedDate) : '-'}</td>
                                <td style={{ padding: '0.4rem' }}>
                                  <span className={`badge ${sched.status === 'completed' ? 'badge-success' : sched.status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.675rem' }}>
                                    {sched.status === 'completed' ? 'เสร็จสมบูรณ์' : sched.status === 'pending' ? 'รอดำเนินการ' : 'พบอาการชำรุด/เลื่อน'}
                                  </span>
                                </td>
                                <td style={{ padding: '0.4rem' }}>{sched.operator || '-'}</td>
                                <td style={{ padding: '0.4rem', maxWidth: '180px' }}>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sched.details || sched.notes || '-'}</div>
                                </td>
                                <td style={{ padding: '0.4rem' }}>
                                  {sched.proofImageUrl ? (
                                    <button 
                                      type="button"
                                      onClick={() => handleOpenLightbox(sched.proofImageUrl!, `รูปภาพหลักฐาน PM - ${selectedLogbookAsset?.name || sched.assetName}`)}
                                      className="btn btn-ghost btn-xs"
                                      style={{ color: 'var(--primary)', border: '1px solid var(--border)', padding: '0.15rem 0.4rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', background: 'var(--bg-primary)' }}
                                      title="คลิกเพื่อเปิดดูรูปภาพหรือไฟล์ PDF ขนาดเต็ม HD"
                                    >
                                      📷 ดูรูปภาพ / PDF
                                    </button>
                                  ) : '-'}
                                </td>
                                <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center' }}>
                                    <button 
                                      onClick={() => { setSelectedSchedule(sched); setIsPrintReportOpen(true); }}
                                      className="btn btn-ghost btn-xs"
                                      style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', border: '1px solid var(--border)' }}
                                      title="ดู / พิมพ์ใบรายงาน A4"
                                    >
                                      🖨️ พิมพ์
                                    </button>
                                    <button 
                                      onClick={() => handleOpenPMForm(sched)}
                                      className="btn btn-ghost btn-xs"
                                      style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', border: '1px solid var(--border)' }}
                                      title="แก้ไขบันทึก PM นี้"
                                    >
                                      ✏️ แก้ไข
                                    </button>
                                    {currentUser?.role === 'admin' && (
                                      <button 
                                        onClick={() => handleDeleteSchedule(sched.id)}
                                        className="btn btn-ghost btn-xs text-danger"
                                        style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', border: '1px solid var(--border)' }}
                                        title="ลบบันทึกนี้"
                                      >
                                        🗑️ ลบ
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* SECTION 3: CM REPAIR LOGBOOK */}
              {(() => {
                const assetRepairs = repairs
                  .filter(r => r.assetId === selectedLogbookAsset.id)
                  .sort((a, b) => b.dateOpened.localeCompare(a.dateOpened));

                return (
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: 'var(--danger)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      🚨 ประวัติการแจ้งซ่อมแซม CM ทั้งหมด ({assetRepairs.length} ครั้ง)
                    </h4>

                    {assetRepairs.length === 0 ? (
                      <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '0.75rem' }}>
                        ไม่มีประวัติการส่งซ่อมแซมครั้งคราว (ไม่เคยชำรุด)
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '0.775rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '0.4rem' }}>วันที่แจ้งซ่อม</th>
                              <th style={{ padding: '0.4rem' }}>อาการเสีย / ปัญหา</th>
                              <th style={{ padding: '0.4rem' }}>บริษัทผู้รับซ่อม</th>
                              <th style={{ padding: '0.4rem' }}>วันส่งซ่อม</th>
                              <th style={{ padding: '0.4rem' }}>วันรับคืน</th>
                              <th style={{ padding: '0.4rem' }}>สถานะ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assetRepairs.map(rep => (
                              <tr key={rep.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.4rem', fontWeight: 650 }}>{getThaiDateFormatted(rep.dateOpened)}</td>
                                <td style={{ padding: '0.4rem' }}>{rep.symptom}</td>
                                <td style={{ padding: '0.4rem' }}>{rep.repairCompany || '-'}</td>
                                <td style={{ padding: '0.4rem' }}>{rep.dateSent ? getThaiDateFormatted(rep.dateSent) : '-'}</td>
                                <td style={{ padding: '0.4rem' }}>{rep.dateReceived ? getThaiDateFormatted(rep.dateReceived) : '-'}</td>
                                <td style={{ padding: '0.4rem' }}>
                                  <span className={`badge ${rep.status === 'completed' ? 'badge-success' : rep.status === 'sent' ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.675rem' }}>
                                    {rep.status === 'completed' ? 'ซ่อมเสร็จสิ้น' : rep.status === 'sent' ? 'ส่งซ่อมภายนอก' : 'รอดำเนินการ'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem', flexShrink: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setIsLogbookOpen(false); setSelectedLogbookAsset(null); }}>
                ปิดหน้าต่าง Logbook
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL: CM CASE FULL DETAILS & EDIT ADDITIONAL LOG --- */}
      {isCMDetailOpen && selectedCMDetailCase && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10050, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
          <div className="glass-panel animate-scale-up" style={{ maxWidth: '680px', width: '100%', padding: '1.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className={`badge ${selectedCMDetailCase.status === 'completed' ? 'badge-success' : selectedCMDetailCase.status === 'sent' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                    {selectedCMDetailCase.status === 'completed' ? '🟢 ซ่อมสำเร็จแล้ว (ปิดเคส)' : selectedCMDetailCase.status === 'sent' ? '🟡 กำลังส่งช่างซ่อม' : '🔴 รอช่างเข้าตรวจ'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    เลขที่เคส: <code>{selectedCMDetailCase.id}</code>
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  🔧 รายละเอียดและบันทึกข้อมูล CM: {selectedCMDetailCase.assetName}
                </h3>
              </div>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={() => { setIsCMDetailOpen(false); setSelectedCMDetailCase(null); }} 
                style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}
              >
                ✕
              </button>
            </div>

            {/* Asset Summary Info */}
            <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>รหัสครุภัณฑ์:</span> <code style={{ fontWeight: 700 }}>{selectedCMDetailCase.assetId}</code>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>วันที่แจ้งชำรุด:</span> <strong>{getThaiDateFormatted(selectedCMDetailCase.dateOpened)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>ผู้แจ้งส่งซ่อม:</span> <strong>{selectedCMDetailCase.operator}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>อัปเดตล่าสุด:</span> {new Date(selectedCMDetailCase.updatedAt).toLocaleString('th-TH')}
              </div>
            </div>

            {/* Timeline Progress Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              {/* Step 1: Symptom */}
              <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--danger)', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  🚨 1. อาการชำรุด/ปัญหาที่พบ (Symptom)
                </h4>
                <p style={{ margin: 0, fontSize: '0.825rem', lineHeight: '1.45' }}>{selectedCMDetailCase.symptom}</p>
                {selectedCMDetailCase.symptomImageUrl && (
                  <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div 
                      onClick={() => handleOpenLightbox(selectedCMDetailCase.symptomImageUrl!, `รูปถ่ายอาการชำรุด - ${selectedCMDetailCase.assetName}`)}
                      style={{ cursor: 'pointer', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', background: '#000' }}
                      title="คลิกเพื่อขยายดูรูปภาพขนาดเต็ม (HD Lightbox)"
                    >
                      <img src={selectedCMDetailCase.symptomImageUrl} alt="Symptom" style={{ height: '70px', maxWidth: '120px', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '1px 0' }}>
                        🔍 ซูมดูรูป
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleOpenLightbox(selectedCMDetailCase.symptomImageUrl!, `รูปถ่ายอาการชำรุด - ${selectedCMDetailCase.assetName}`)}
                      style={{ fontSize: '0.75rem', color: 'var(--primary)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem' }}
                    >
                      🖼️ ดูรูปถ่ายอาการชำรุด (HD)
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Vendor / Dispatch */}
              {(selectedCMDetailCase.status === 'sent' || selectedCMDetailCase.status === 'completed' || selectedCMDetailCase.repairCompany) && (
                <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--warning)', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    🚚 2. ข้อมูลการส่งซ่อม / ช่างผู้รับผิดชอบ
                  </h4>
                  <div style={{ fontSize: '0.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                    <div>ร้าน/บริษัทซ่อม: <strong>{selectedCMDetailCase.repairCompany || '-'}</strong></div>
                    <div>เบอร์ติดต่อช่าง: <strong>{selectedCMDetailCase.contactPerson || '-'}</strong></div>
                    <div>วันที่ส่งซ่อม: <strong>{selectedCMDetailCase.dateSent ? getThaiDateFormatted(selectedCMDetailCase.dateSent) : '-'}</strong></div>
                  </div>
                  {selectedCMDetailCase.sentProofUrl && (
                    <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div 
                        onClick={() => handleOpenLightbox(selectedCMDetailCase.sentProofUrl!, `หลักฐานการนำส่งช่าง - ${selectedCMDetailCase.assetName}`)}
                        style={{ cursor: 'pointer', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', background: '#000' }}
                        title="คลิกเพื่อขยายดูรูปภาพขนาดเต็ม (HD Lightbox)"
                      >
                        <img src={selectedCMDetailCase.sentProofUrl} alt="Sent Proof" style={{ height: '70px', maxWidth: '120px', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '1px 0' }}>
                          🔍 ซูมดูรูป
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleOpenLightbox(selectedCMDetailCase.sentProofUrl!, `หลักฐานการนำส่งช่าง - ${selectedCMDetailCase.assetName}`)}
                        style={{ fontSize: '0.75rem', color: 'var(--warning)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem' }}
                      >
                        🚚 ดูหลักฐานการนำส่งช่าง (HD)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Completed / Return */}
              {selectedCMDetailCase.status === 'completed' && (
                <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--success)', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    ✅ 3. ตรวจรับของคืนคลังและปิดเคสเรียบร้อย
                  </h4>
                  <div style={{ fontSize: '0.8rem' }}>
                    วันที่รับของคืน: <strong>{selectedCMDetailCase.dateReceived ? getThaiDateFormatted(selectedCMDetailCase.dateReceived) : '-'}</strong>
                  </div>
                  {selectedCMDetailCase.receivedProofUrl && (
                    <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div 
                        onClick={() => handleOpenLightbox(selectedCMDetailCase.receivedProofUrl!, `หลักฐานการตรวจรับของคืน - ${selectedCMDetailCase.assetName}`)}
                        style={{ cursor: 'pointer', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', background: '#000' }}
                        title="คลิกเพื่อขยายดูรูปภาพขนาดเต็ม (HD Lightbox)"
                      >
                        <img src={selectedCMDetailCase.receivedProofUrl} alt="Return Proof" style={{ height: '70px', maxWidth: '120px', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '1px 0' }}>
                          🔍 ซูมดูรูป
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleOpenLightbox(selectedCMDetailCase.receivedProofUrl!, `หลักฐานการตรวจรับของคืน - ${selectedCMDetailCase.assetName}`)}
                        style={{ fontSize: '0.75rem', color: 'var(--success)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem' }}
                      >
                        ✅ ดูหลักฐานการตรวจรับของคืน (HD)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Editable Additional Information & Notes Section */}
            <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                ✏️ บันทึกข้อมูลและข้อสังเกตเพิ่มเติม (Edit Logbook / Additional Notes)
              </h4>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                ท่านสามารถบันทึกข้อสังเกต ผลการทดสอบหลังรับเครื่อง คำแนะนำการใช้งาน หรือค่าใช้จ่ายจริงได้ตลอดเวลาแม้ปิดเคสไปแล้ว
              </span>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>📝 รายละเอียด/ข้อสังเกตเพิ่มเติม (Notes & Remarks)</label>
                <textarea 
                  className="form-input"
                  rows={3}
                  value={cmEditNotes}
                  onChange={(e) => setCmEditNotes(e.target.value)}
                  placeholder="เช่น ตรวจสอบความเรียบร้อยแล้ว ช่างได้เปลี่ยนใบพัดลมใหม่ พร้อมล้างแผงวงจร ใช้งานได้ตามปกติ รับประกันงานซ่อม 3 เดือน..."
                  style={{ fontSize: '0.8rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.72rem' }}>💰 ค่าใช้จ่ายในการซ่อม (บาท)</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={cmEditCost}
                    onChange={(e) => setCmEditCost(e.target.value)}
                    placeholder="เช่น 0 (อยู่ในประกัน) หรือ 2,500"
                    style={{ fontSize: '0.8rem', height: '34px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.72rem' }}>🏢 ร้านซ่อม / บริษัท</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={cmEditRepairCompany}
                    onChange={(e) => setCmEditRepairCompany(e.target.value)}
                    placeholder="เช่น บริษัท โอซาร่า วิศวกรรม จำกัด"
                    style={{ fontSize: '0.8rem', height: '34px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.72rem' }}>📞 เบอร์โทรช่าง</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={cmEditContactPerson}
                    onChange={(e) => setCmEditContactPerson(e.target.value)}
                    placeholder="เช่น 081-XXX-XXXX"
                    style={{ fontSize: '0.8rem', height: '34px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.72rem' }}>📅 วันที่ตรวจรับคืน</label>
                  <input 
                    type="date"
                    className="form-input"
                    value={cmEditDateReceived}
                    onChange={(e) => setCmEditDateReceived(e.target.value)}
                    style={{ fontSize: '0.8rem', height: '34px' }}
                  />
                </div>
              </div>

              {/* Extra File Attachment with HD Compression & Interactive Preview */}
              <div style={{ marginTop: '0.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.72rem' }}>
                  📎 แนบเอกสาร/ใบเสร็จ/รูปภาพผลงานซ่อมเพิ่มเติม (รองรับ PDF และภาพคมชัดระดับ HD พร้อมบีบอัดอัตโนมัติ):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={handleCMEditProofImageChange}
                    className="form-input"
                    style={{ fontSize: '0.75rem', padding: '0.35rem' }}
                  />
                  {compressingCMEditProof && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary)', whiteSpace: 'nowrap' }}>⚡ กำลังบีบอัด HD...</span>
                  )}
                </div>
                {cmEditProofInfo && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.725rem', color: 'var(--success)', fontWeight: 600 }}>
                    {cmEditProofInfo.isPdf ? '📄 แนบไฟล์ PDF:' : '📷 ภาพ HD บีบอัดแล้ว:'} {cmEditProofInfo.name} ({cmEditProofInfo.size})
                  </div>
                )}
                {cmEditProofPreview && (
                  <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div 
                      onClick={() => handleOpenLightbox(cmEditProofPreview, `รูปภาพ/เอกสารแนบ - ${selectedCMDetailCase.assetName}`)}
                      style={{ cursor: 'pointer', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '2px solid var(--primary)', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)', background: '#000' }}
                      title="คลิกเพื่อขยายดูรูปภาพขนาดเต็ม (HD Lightbox)"
                    >
                      <img src={cmEditProofPreview} alt="Preview" style={{ height: '80px', maxWidth: '140px', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '2px 0' }}>
                        🔍 คลิกซูมดูรูป
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-primary btn-xs"
                      onClick={() => handleOpenLightbox(cmEditProofPreview, `รูปภาพ/เอกสารแนบ - ${selectedCMDetailCase.assetName}`)}
                      style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem' }}
                    >
                      🔍 เปิดดูภาพขยาย / ตรวจสอบเอกสาร (HD)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsCMPrintReportOpen(true)}
                  style={{ border: '1px solid var(--border)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  🖨️ พิมพ์ใบรายงาน CM
                </button>

                {selectedCMDetailCase.status === 'completed' && currentUser?.role !== 'user' && (
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-sm text-warning"
                    onClick={() => handleReopenCMCase(selectedCMDetailCase)}
                    style={{ border: '1px solid var(--warning)', fontSize: '0.8rem' }}
                    title="ขอเปิดเคสใหม่เพื่อส่งช่างแก้ไขหรือตรวจรับใหม่"
                  >
                    🔓 ขอเปิดเคสใหม่
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={() => { setIsCMDetailOpen(false); setSelectedCMDetailCase(null); }}
                  style={{ border: '1px solid var(--border)' }}
                >
                  ปิด
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveCMDetails}
                  disabled={cmSavingDetail}
                >
                  {cmSavingDetail ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลเพิ่มเติม'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL: CM PRINTABLE SERVICE REPORT --- */}
      {isCMPrintReportOpen && selectedCMDetailCase && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10060, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
          <div className="glass-panel animate-scale-up" style={{ maxWidth: '780px', width: '100%', padding: '2rem', borderRadius: 'var(--radius-md)', background: '#fff', color: '#111827', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Header & Print toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.75rem' }} className="no-print">
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>🖨️ ตัวอย่างใบรายงานส่งซ่อม CM (A4 Official Printable Format)</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  🖨️ สั่งพิมพ์เอกสาร
                </button>
                <button 
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsCMPrintReportOpen(false)}
                  style={{ border: '1px solid #d1d5db', color: '#374151' }}
                >
                  ✕ ปิด
                </button>
              </div>
            </div>

            {/* Document Content (Printable Area) */}
            <div id="printable-cm-report" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: '#111827', fontFamily: 'Sarabun, sans-serif' }}>
              
              {/* Document Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '0.75rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>ใบรายงานผลการแจ้งซ่อมแซมและบำรุงรักษาครุภัณฑ์</h2>
                <h4 style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontWeight: 600, color: '#4b5563' }}>Corrective Maintenance (CM) Service Report</h4>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                  <span>เลขที่รายงาน: <strong>{selectedCMDetailCase.id}</strong></span>
                  <span>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Asset & Case Details Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, width: '25%', background: '#f9fafb' }}>รหัสครุภัณฑ์</td>
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontWeight: 700, width: '25%' }}>{selectedCMDetailCase.assetId}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 700, width: '25%', background: '#f9fafb' }}>ชื่อรายการครุภัณฑ์</td>
                    <td style={{ padding: '0.5rem', fontWeight: 700, width: '25%' }}>{selectedCMDetailCase.assetName}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, background: '#f9fafb' }}>วันที่แจ้งชำรุด</td>
                    <td style={{ padding: '0.5rem' }}>{getThaiDateFormatted(selectedCMDetailCase.dateOpened)}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 700, background: '#f9fafb' }}>ผู้แจ้งส่งซ่อม</td>
                    <td style={{ padding: '0.5rem' }}>{selectedCMDetailCase.operator}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, background: '#f9fafb' }}>ร้านซ่อม/บริษัทผู้รับจ้าง</td>
                    <td style={{ padding: '0.5rem' }}>{selectedCMDetailCase.repairCompany || '-'}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 700, background: '#f9fafb' }}>เบอร์โทรติดต่อช่าง</td>
                    <td style={{ padding: '0.5rem' }}>{selectedCMDetailCase.contactPerson || '-'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, background: '#f9fafb' }}>วันที่ส่งซ่อม</td>
                    <td style={{ padding: '0.5rem' }}>{selectedCMDetailCase.dateSent ? getThaiDateFormatted(selectedCMDetailCase.dateSent) : '-'}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 700, background: '#f9fafb' }}>วันที่รับของคืน</td>
                    <td style={{ padding: '0.5rem' }}>{selectedCMDetailCase.dateReceived ? getThaiDateFormatted(selectedCMDetailCase.dateReceived) : '-'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, background: '#f9fafb' }}>สถานะการซ่อม</td>
                    <td style={{ padding: '0.5rem' }}>
                      <strong>{selectedCMDetailCase.status === 'completed' ? '✅ ซ่อมเสร็จสมบูรณ์ / ใช้งานได้ปกติ' : selectedCMDetailCase.status === 'sent' ? '🟡 อยู่ระหว่างการส่งซ่อม' : '🔴 รอช่างเข้าตรวจ'}</strong>
                    </td>
                    <td style={{ padding: '0.5rem', fontWeight: 700, background: '#f9fafb' }}>ค่าใช้จ่ายรวม</td>
                    <td style={{ padding: '0.5rem' }}><strong>{selectedCMDetailCase.repairCost ? `${selectedCMDetailCase.repairCost} บาท` : '0 (อยู่ในประกัน)'}</strong></td>
                  </tr>
                </tbody>
              </table>

              {/* Problem & Notes description */}
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '0.85rem', background: '#f9fafb' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>🚨 อาการเสีย / ปัญหาที่ได้รับแจ้ง:</div>
                <div style={{ fontSize: '0.825rem', lineHeight: '1.5' }}>{selectedCMDetailCase.symptom}</div>
                {selectedCMDetailCase.notes && (
                  <div style={{ marginTop: '0.5rem', borderTop: '1px dashed #d1d5db', paddingTop: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>📝 บันทึกผลการซ่อมและข้อสังเกตเพิ่มเติม:</div>
                    <div style={{ fontSize: '0.825rem', lineHeight: '1.5' }}>{selectedCMDetailCase.notes}</div>
                  </div>
                )}
              </div>

              {/* Photo Proofs if any */}
              {(selectedCMDetailCase.symptomImageUrl || selectedCMDetailCase.sentProofUrl || selectedCMDetailCase.receivedProofUrl) && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>📷 หลักฐานรูปถ่ายประกอบการซ่อมบำรุง:</div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {selectedCMDetailCase.symptomImageUrl && (
                      <div style={{ textAlign: 'center', border: '1px solid #e5e7eb', padding: '0.5rem', borderRadius: '4px' }}>
                        <img src={selectedCMDetailCase.symptomImageUrl} alt="Symptom" style={{ maxHeight: '120px', maxWidth: '180px', objectFit: 'contain' }} />
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>รูปถ่ายอาการชำรุด</div>
                      </div>
                    )}
                    {selectedCMDetailCase.sentProofUrl && (
                      <div style={{ textAlign: 'center', border: '1px solid #e5e7eb', padding: '0.5rem', borderRadius: '4px' }}>
                        <img src={selectedCMDetailCase.sentProofUrl} alt="Sent" style={{ maxHeight: '120px', maxWidth: '180px', objectFit: 'contain' }} />
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>รูปหลักฐานนำส่งช่าง</div>
                      </div>
                    )}
                    {selectedCMDetailCase.receivedProofUrl && (
                      <div style={{ textAlign: 'center', border: '1px solid #e5e7eb', padding: '0.5rem', borderRadius: '4px' }}>
                        <img src={selectedCMDetailCase.receivedProofUrl} alt="Received" style={{ maxHeight: '120px', maxWidth: '180px', objectFit: 'contain' }} />
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>รูปหลักฐานตรวจรับคืน</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem' }}>
                <div style={{ borderTop: '1px dotted #9ca3af', paddingTop: '0.5rem' }}>
                  <div>(ลงชื่อ).....................................................</div>
                  <div style={{ marginTop: '0.25rem' }}>({selectedCMDetailCase.operator})</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>ผู้แจ้งส่งซ่อม / ผู้ประสานงาน</div>
                </div>
                <div style={{ borderTop: '1px dotted #9ca3af', paddingTop: '0.5rem' }}>
                  <div>(ลงชื่อ).....................................................</div>
                  <div style={{ marginTop: '0.25rem' }}>({selectedCMDetailCase.contactPerson || '...........................................'})</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>ช่างผู้ดำเนินการซ่อมแซม</div>
                </div>
                <div style={{ borderTop: '1px dotted #9ca3af', paddingTop: '0.5rem' }}>
                  <div>(ลงชื่อ).....................................................</div>
                  <div style={{ marginTop: '0.25rem' }}>(........................................................)</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>หัวหน้างานพัสดุ / ผู้ตรวจรับคืน</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- UNIVERSAL MEDIA / PDF FULLSCREEN LIGHTBOX VIEWER --- */}
      {lightboxUrl && (
        <div 
          className="print-preview-overlay animate-fade-in" 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.94)', zIndex: 100050, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setLightboxUrl(null)}
        >
          {/* Floating Close Button */}
          <button
            type="button"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.95)',
              color: '#fff',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '1.4rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
              zIndex: 100100,
              transition: 'all 0.2s',
              lineHeight: 1
            }}
            title="ปิด (Close)"
            onClick={(e) => { e.stopPropagation(); setLightboxUrl(null); }}
          >
            ✕
          </button>

          {/* Lightbox Toolbar */}
          <div 
            style={{ position: 'absolute', top: '1rem', left: '1rem', right: '4.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(20, 24, 33, 0.88)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '0.6rem 1.15rem', borderRadius: 'var(--radius-md)', zIndex: 10, color: '#fff', gap: '0.5rem', flexWrap: 'wrap' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 200px', minWidth: 0 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                🔍 {lightboxTitle || 'ไฟล์เอกสาร / รูปภาพหลักฐาน (HD)'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm"
                onClick={() => setLightboxZoom(prev => Math.min(prev + 0.25, 3))}
                style={{ color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.72rem', padding: '0.2rem 0.45rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                title="ซูมขยายภาพ"
              >
                ➕ ซูมเข้า
              </button>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm"
                onClick={() => setLightboxZoom(prev => Math.max(prev - 0.25, 0.5))}
                style={{ color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.72rem', padding: '0.2rem 0.45rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                title="ย่อขนาดภาพ"
              >
                ➖ ซูมออก
              </button>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm"
                onClick={() => setLightboxZoom(1)}
                style={{ color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                title="รีเซ็ตขนาดเท่าเดิม"
              >
                🔄 {Math.round(lightboxZoom * 100)}%
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={handleDownloadLightbox}
                style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.55rem', height: 'auto' }}
                title="บันทึกไฟล์ลงเครื่องคอมพิวเตอร์"
              >
                ⬇️ ดาวน์โหลด
              </button>
            </div>
          </div>

          {/* Lightbox Content Viewer */}
          <div 
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '4.5rem 1rem 1rem 1rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxUrl.startsWith('data:application/pdf') || lightboxUrl.toLowerCase().includes('.pdf') ? (
              <div style={{ width: '90vw', height: '82vh', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
                <iframe 
                  src={lightboxUrl} 
                  title="PDF Viewer" 
                  style={{ width: '100%', height: '100%', border: 'none' }} 
                />
              </div>
            ) : (
              <div 
                style={{ 
                  transform: `scale(${lightboxZoom})`, 
                  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  maxHeight: '82vh',
                  maxWidth: '92vw'
                }}
              >
                <img 
                  src={lightboxUrl} 
                  alt="Lightbox Preview" 
                  style={{ 
                    maxHeight: '82vh', 
                    maxWidth: '92vw', 
                    objectFit: 'contain', 
                    borderRadius: '8px', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    cursor: lightboxZoom > 1 ? 'grab' : 'zoom-in'
                  }}
                  onClick={() => setLightboxZoom(prev => (prev === 1 ? 1.75 : 1))}
                  title="คลิกที่รูปเพื่อซูมเข้า/ซูมออกทันที"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 4: PRINT PM PLANS SUMMARY --- */}
      {isPrintPlansSummaryOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 99999, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '1000px', width: '100%', margin: '0 auto 1.5rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10060 }}>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--primary)' }}>🖨️ พิมพ์รายงานสรุปแผนงานบำรุงรักษาเชิงป้องกัน</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>รายงานตารางแผนบำรุงรักษาของครุภัณฑ์แยกตามรหัสพัสดุและรอบสัญญา</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsPrintPlansSummaryOpen(false)}>ย้อนกลับ</button>
              <button type="button" className="btn btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Printer size={16} /> สั่งพิมพ์ / PDF
              </button>
            </div>
          </div>

          <div className="print-paper-a4 printable-a4-document" style={{ background: '#ffffff', color: '#000000', maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '2.5rem 3rem', minHeight: '11.28in', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif", fontSize: '13px', lineHeight: '1.6', colorScheme: 'light', borderRadius: '4px' }}>
            <div style={{ textAlign: 'center', position: 'relative', marginBottom: '2rem' }}>
              <div style={{ fontSize: '28px', color: '#000000', marginBottom: '0.5rem' }}>🇹🇭</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#000000', margin: '0.2rem 0' }}>
                รายงานสรุปแผนงานบำรุงรักษาเชิงป้องกันครุภัณฑ์ (PM Plan Summary)
              </h1>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#333333', margin: '0.2rem 0' }}>
                ระบบคลังทรัพย์สินและบำรุงรักษาพัสดุ AssetWatch
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#666666', marginTop: '0.25rem' }}>
                หน่วยงาน: {selectedDeptFilter === 'all' ? 'ทุกหน่วยงาน (ภาพรวมองค์กร)' : `ฝ่าย: ${selectedDeptFilter}`} | ข้อมูล ณ วันที่ {getThaiDateFormatted(new Date().toISOString().split('T')[0])}
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '2px double #333333', margin: '1rem 0 1.5rem 0' }} />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #374151' }}>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db', width: '45px' }}>ลำดับ</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'left', border: '1px solid #d1d5db', width: '110px' }}>รหัสครุภัณฑ์</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'left', border: '1px solid #d1d5db' }}>ชื่อรายการครุภัณฑ์</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'left', border: '1px solid #d1d5db' }}>แผนงาน / เลขที่สัญญา</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db', width: '95px' }}>ประเภทแผน</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db', width: '75px' }}>ความถี่</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db', width: '100px' }}>วันนัดถัดไป</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db', width: '60px' }}>ทำแล้ว</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssetPMList.map((asset, idx) => {
                  const assetContracts = contracts.filter(c => c.assetIds.includes(asset.id));
                  const assetSchedules = schedules.filter(s => s.assetId === asset.id);

                  if (assetContracts.length === 0) {
                    return (
                      <tr key={asset.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>{idx + 1}</td>
                        <td style={{ padding: '0.5rem 0.4rem', fontFamily: 'monospace', border: '1px solid #e5e7eb' }}>{asset.id}</td>
                        <td style={{ padding: '0.5rem 0.4rem', border: '1px solid #e5e7eb' }}>{asset.name}</td>
                        <td style={{ padding: '0.5rem 0.4rem', color: '#dc2626', fontStyle: 'italic', border: '1px solid #e5e7eb' }}>⚠️ ยังไม่ได้กำหนดแผนบำรุงรักษา</td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', color: '#6b7280', border: '1px solid #e5e7eb' }}>-</td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', color: '#6b7280', border: '1px solid #e5e7eb' }}>-</td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', color: '#6b7280', border: '1px solid #e5e7eb' }}>-</td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>0</td>
                      </tr>
                    );
                  }

                  return assetContracts.map((contract, cIdx) => {
                    const nextSched = assetSchedules.find(s => s.contractId === contract.id && s.status === 'pending');
                    const completedCount = assetSchedules.filter(s => s.contractId === contract.id && s.status === 'completed').length;
                    const isInternal = contract.contractNumber.startsWith('INT-PM');

                    return (
                      <tr key={`${asset.id}-${contract.id}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>{cIdx === 0 ? idx + 1 : ''}</td>
                        <td style={{ padding: '0.5rem 0.4rem', fontFamily: 'monospace', border: '1px solid #e5e7eb' }}>{cIdx === 0 ? asset.id : ''}</td>
                        <td style={{ padding: '0.5rem 0.4rem', border: '1px solid #e5e7eb' }}>{cIdx === 0 ? asset.name : ''}</td>
                        <td style={{ padding: '0.5rem 0.4rem', border: '1px solid #e5e7eb' }}>
                          <strong>{contract.title}</strong> <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>({contract.contractNumber})</span>
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                          <span style={{ color: isInternal ? '#2563eb' : '#059669', fontWeight: 600 }}>
                            {isInternal ? 'บำรุงรักษาเอง' : 'จ้าง Outsource'}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                          {contract.pmFrequency === 'monthly' ? 'รายเดือน' :
                           contract.pmFrequency === 'quarterly' ? 'ราย 3 เดือน' :
                           contract.pmFrequency === 'semi-annually' ? 'ราย 6 เดือน' :
                           contract.pmFrequency === 'annually' ? 'รายปี' : 'กำหนดเอง'}
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', fontWeight: 650, color: nextSched ? 'var(--primary)' : '#6b7280', border: '1px solid #e5e7eb' }}>
                          {nextSched ? getThaiDateFormatted(nextSched.plannedDate) : 'เสร็จสิ้นทุกรอบ'}
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', fontWeight: 600, border: '1px solid #e5e7eb' }}>{completedCount}</td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>

            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', fontSize: '0.85rem' }}>
              <div style={{ textAlign: 'center', width: '250px' }}>
                <div style={{ marginBottom: '3rem' }}>ลงชื่อ............................................................ ผู้จัดทำรายงาน</div>
                <div>( ............................................................ )</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>เจ้าหน้าที่ทะเบียนควบคุมพัสดุ</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: PRINT PM HISTORY SUMMARY --- */}
      {isPrintHistorySummaryOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 99999, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '1000px', width: '100%', margin: '0 auto 1.5rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10060 }}>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--primary)' }}>🖨️ พิมพ์รายงานประวัติการบำรุงรักษาเชิงป้องกัน (Completed Log)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>รายงานประวัติการเข้าตรวจบำรุงรักษาตามกำหนดการพัสดุครุภัณฑ์สะสม</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsPrintHistorySummaryOpen(false)}>ย้อนกลับ</button>
              <button type="button" className="btn btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Printer size={16} /> สั่งพิมพ์ / PDF
              </button>
            </div>
          </div>

          <div className="print-paper-a4 printable-a4-document" style={{ background: '#ffffff', color: '#000000', maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '2.5rem 3rem', minHeight: '11.28in', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif", fontSize: '13px', lineHeight: '1.6', colorScheme: 'light', borderRadius: '4px' }}>
            <div style={{ textAlign: 'center', position: 'relative', marginBottom: '2rem' }}>
              <div style={{ fontSize: '28px', color: '#000000', marginBottom: '0.5rem' }}>🇹🇭</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#000000', margin: '0.2rem 0' }}>
                รายงานประวัติการบำรุงรักษาพัสดุครุภัณฑ์เชิงป้องกันสะสม (PM Service History Log)
              </h1>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#333333', margin: '0.2rem 0' }}>
                ระบบคลังทรัพย์สินและบำรุงรักษาพัสดุ AssetWatch
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#666666', marginTop: '0.25rem' }}>
                หน่วยงาน: {selectedDeptFilter === 'all' ? 'ทุกหน่วยงาน (ภาพรวมองค์กร)' : `ฝ่าย: ${selectedDeptFilter}`} | ข้อมูล ณ วันที่ {getThaiDateFormatted(new Date().toISOString().split('T')[0])}
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '2px double #333333', margin: '1rem 0 1.5rem 0' }} />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #374151' }}>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'center', border: '1px solid #d1d5db', width: '40px' }}>ลำดับ</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'center', border: '1px solid #d1d5db', width: '85px' }}>วันที่เข้าทำ</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'left', border: '1px solid #d1d5db', width: '90px' }}>รหัสครุภัณฑ์</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'left', border: '1px solid #d1d5db' }}>ชื่อครุภัณฑ์</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'left', border: '1px solid #d1d5db' }}>แผนงาน / สัญญา</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'center', border: '1px solid #d1d5db', width: '60px' }}>รอบ PM</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'center', border: '1px solid #d1d5db', width: '85px' }}>ผลการตรวจ</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'left', border: '1px solid #d1d5db', width: '90px' }}>ผู้ทำรายการ</th>
                  <th style={{ padding: '0.5rem 0.3rem', textAlign: 'left', border: '1px solid #d1d5db' }}>โน้ตเตือนใจ / หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const historySchedules = schedules.filter(s => {
                    return filteredAssetPMList.some(f => f.id === s.assetId) && s.status !== 'pending';
                  }).sort((a, b) => (b.completedDate || b.plannedDate).localeCompare(a.completedDate || a.plannedDate));

                  if (historySchedules.length === 0) {
                    return (
                      <tr>
                        <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', border: '1px solid #e5e7eb', color: '#6b7280', fontStyle: 'italic' }}>
                          ยังไม่มีประวัติการเข้าบำรุงรักษา PM สำเร็จสำหรับพัสดุในระบบที่เลือก
                        </td>
                      </tr>
                    );
                  }

                  return historySchedules.map((sched, idx) => {
                    const contract = contracts.find(c => c.id === sched.contractId);
                    const assetScheds = schedules
                      .filter(s => s.contractId === sched.contractId && s.assetId === sched.assetId)
                      .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
                    const roundIndex = assetScheds.findIndex(s => s.id === sched.id) + 1;
                    const totalRounds = assetScheds.length;

                    let statusText = 'ปกติ (Completed)';
                    let statusColor = '#059669';
                    if (sched.status === 'postponed') {
                      statusText = 'เลื่อนแผน';
                      statusColor = '#d97706';
                    } else if (sched.status === 'awaiting_repair') {
                      statusText = 'ส่งช่างซ่อม CM';
                      statusColor = '#dc2626';
                    }

                    return (
                      <tr key={sched.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.4rem 0.3rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>{idx + 1}</td>
                        <td style={{ padding: '0.4rem 0.3rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>{getThaiDateFormatted(sched.completedDate || sched.plannedDate)}</td>
                        <td style={{ padding: '0.4rem 0.3rem', fontFamily: 'monospace', border: '1px solid #e5e7eb' }}>{sched.assetId}</td>
                        <td style={{ padding: '0.4rem 0.3rem', border: '1px solid #e5e7eb' }}>{sched.assetName}</td>
                        <td style={{ padding: '0.4rem 0.3rem', border: '1px solid #e5e7eb' }}>{contract ? contract.title : 'แผนบำรุงรักษาทั่วไป'}</td>
                        <td style={{ padding: '0.4rem 0.3rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>{roundIndex}/{totalRounds}</td>
                        <td style={{ padding: '0.4rem 0.3rem', textAlign: 'center', color: statusColor, fontWeight: 700, border: '1px solid #e5e7eb' }}>{statusText}</td>
                        <td style={{ padding: '0.4rem 0.3rem', border: '1px solid #e5e7eb' }}>{sched.operator || '-'}</td>
                        <td style={{ padding: '0.4rem 0.3rem', border: '1px solid #e5e7eb', fontSize: '10px' }}>
                          {sched.notes && <div style={{ color: '#374151' }}>📝 {sched.notes}</div>}
                          {sched.nextPMNotes && <div style={{ color: '#d97706', fontWeight: 600 }}>⏰ เตือนรอบหน้า: {sched.nextPMNotes}</div>}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>

            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', fontSize: '0.85rem' }}>
              <div style={{ textAlign: 'center', width: '250px' }}>
                <div style={{ marginBottom: '3rem' }}>ลงชื่อ............................................................ ผู้ตรวจสอบประวัติ</div>
                <div>( ............................................................ )</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>หัวหน้าส่วนวิศวกรรมบำรุงรักษา</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
