import React, { useState, useEffect } from 'react';
import { 
  Wrench, Calendar, FileText, Bell, Plus, CheckCircle, Clock, AlertTriangle, 
  Trash2, Phone, User, Building, ExternalLink, Printer, ChevronLeft, ChevronRight, Camera, Search, ArrowRight, RefreshCw 
} from 'lucide-react';
import { Asset, PMContract, PMSchedule, PMNotification, RepairCase, UserAccount } from '../utils/mockData';
import { uploadImage } from '../services/dbService';
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

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState(() => {
    return currentUser?.role === 'user' ? currentUser.department : 'all';
  });

  // Modal Dialog states
  const [selectedSchedule, setSelectedSchedule] = useState<PMSchedule | null>(null);
  const [isPMFormOpen, setIsPMFormOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

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
  const [pmFrequency, setPmFrequency] = useState<PMContract['pmFrequency']>('quarterly');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [vendorContact, setVendorContact] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [submittingContract, setSubmittingContract] = useState(false);
  const [editingContract, setEditingContract] = useState<PMContract | null>(null);
  const [customDates, setCustomDates] = useState<string[]>([]);
  const [newCustomDate, setNewCustomDate] = useState('');

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
    setPmDetails(sched.details || getPresetChecklist(sched.assetName));
    setPmNotes(sched.notes || '');
    setPmStatus((sched.status === 'pending' ? 'completed' : sched.status) as any);
    setNextPMNotes(sched.nextPMNotes || '');
    setShouldCreateCM(false);
    setCmSymptom('');
    setProofFile(null);
    setProofPreview(sched.proofImageUrl || null);
    setIsPMFormOpen(true);
  };

  const handleProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
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

      if (editingContract) {
        // --- EDIT MODE ---
        const updates: Partial<PMContract> = {
          contractNumber: finalContractNumber,
          title: contractTitle,
          vendorName: finalVendorName,
          startDate: contractStart,
          endDate: contractEnd,
          pmFrequency,
          assetIds: selectedAssetIds,
          contactPerson: finalContactPerson,
          contactPhone: finalContactPhone
        };

        // 1. Update contract in db
        await onUpdateContract(editingContract.id, updates);

        // 2. Synchronize schedule entries dynamically based on new settings
        let targetDates: string[] = [];
        if (pmFrequency === 'custom') {
          if (customDates.length === 0) {
            alert('กรุณาเลือกวันนัดหมายบำรุงรักษาอย่างน้อย 1 วัน สำหรับแผนแบบกำหนดเอง');
            setSubmittingContract(false);
            return;
          }
          targetDates = [...customDates];
        } else {
          const start = new Date(contractStart);
          const end = new Date(contractEnd);
          let intervalMonths = 3;
          if (pmFrequency === 'monthly') intervalMonths = 1;
          else if (pmFrequency === 'semi-annually') intervalMonths = 6;
          else if (pmFrequency === 'annually') intervalMonths = 12;

          let currentDate = new Date(start);
          currentDate.setMonth(currentDate.getMonth() + intervalMonths);
          while (currentDate <= end) {
            targetDates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setMonth(currentDate.getMonth() + intervalMonths);
          }
        }

        const existingSchedules = schedules.filter(s => s.contractId === editingContract.id);

        // A. Update/Sync selected assets
        for (const assetId of selectedAssetIds) {
          const asset = assets.find(a => a.id === assetId);
          if (!asset) continue;

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
          details: `แก้ไขข้อมูลแผน/สัญญา PM รหัส ${finalContractNumber}`
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
          endDate: contractEnd,
          pmFrequency,
          assetIds: selectedAssetIds,
          contactPerson: finalContactPerson,
          contactPhone: finalContactPhone
        };

        // 1. Save Contract to db
        await onAddContract(newContract);

        // 2. Generate PMSchedule entries dynamically
        if (pmFrequency === 'custom') {
          if (customDates.length === 0) {
            alert('กรุณาเลือกวันนัดหมายบำรุงรักษาอย่างน้อย 1 วัน สำหรับแผนแบบกำหนดเอง');
            setSubmittingContract(false);
            return;
          }
          for (const assetId of selectedAssetIds) {
            const asset = assets.find(a => a.id === assetId);
            if (!asset) continue;
            let count = 1;
            for (const dateStr of customDates) {
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
        } else {
          // Standard periodic frequency logic
          const start = new Date(contractStart);
          const end = new Date(contractEnd);
          
          let intervalMonths = 3; // default quarterly
          if (pmFrequency === 'monthly') intervalMonths = 1;
          else if (pmFrequency === 'semi-annually') intervalMonths = 6;
          else if (pmFrequency === 'annually') intervalMonths = 12;

          for (const assetId of selectedAssetIds) {
            const asset = assets.find(a => a.id === assetId);
            if (!asset) continue;

            let currentDate = new Date(start);
            // Move first PM check forward
            currentDate.setMonth(currentDate.getMonth() + intervalMonths);

            let count = 1;
            while (currentDate <= end) {
              const schedId = `sched-${Date.now()}-${assetId}-${count}`;
              const plannedDateStr = currentDate.toISOString().split('T')[0];

              await onAddPMSchedule({
                id: schedId,
                contractId: contractId,
                assetId: assetId,
                assetName: asset.name,
                plannedDate: plannedDateStr,
                status: 'pending'
              });

              // Move to next interval
              currentDate.setMonth(currentDate.getMonth() + intervalMonths);
              count++;
            }
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
            ? `สร้างแผนงาน PM ภายในชื่อ "${contractTitle}" รหัส ${finalContractNumber} และกำหนดวันเข้าตรวจเช็คตามรอบความถี่อัตโนมัติ`
            : `สร้างสัญญา PM เลขที่ ${finalContractNumber} บริษัทคู่สัญญา: ${finalVendorName} และสร้างกำหนดการตรวจเช็คอัตโนมัติ`
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
    setContractEnd(contract.endDate);
    setPmFrequency(contract.pmFrequency);
    setSelectedAssetIds(contract.assetIds);
    setVendorContact(contract.contactPerson);
    setVendorPhone(contract.contactPhone);
    
    // Load custom dates if frequency is custom
    if (contract.pmFrequency === 'custom') {
      const contractSchedules = schedules.filter(s => s.contractId === contract.id);
      const uniqueDates = Array.from(new Set(contractSchedules.map(s => s.plannedDate))).sort();
      setCustomDates(uniqueDates);
    } else {
      setCustomDates([]);
    }
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

  const handleSendProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSendProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSendProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleReceiveProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiveProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiveProofPreview(reader.result as string);
      reader.readAsDataURL(file);
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
          📝 การจัดการสัญญาบำรุงรักษา (Contracts)
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
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>{sched.assetName}</h4>
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
              <button className="btn btn-ghost btn-sm" onClick={handlePrevMonth} style={{ padding: '0.25rem', height: 'auto', border: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
                <ChevronLeft size={16} />
              </button>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, minWidth: '130px', textAlign: 'center', margin: 0 }}>
                {monthNames[currentMonth]} {currentYear + 543}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={handleNextMonth} style={{ padding: '0.25rem', height: 'auto', border: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
                <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building size={16} color="var(--text-muted)" />
              <select 
                className="form-select filter-select"
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                disabled={currentUser?.role === 'user'}
                style={{ minWidth: '180px' }}
              >
                {currentUser?.role !== 'user' && <option value="all">ทุกแผนก</option>}
                {currentUser?.role === 'user' ? (
                  <option value={currentUser.department}>{currentUser.department}</option>
                ) : (
                  Array.from(new Set(assets.map(a => a.department).filter(Boolean))).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Interactive Month Calendar Grid */}
          <div className="calendar-grid-wrapper glass-panel" style={{ padding: '1.25rem' }}>
            <div className="calendar-weekday-header" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <div style={{ color: 'var(--danger)' }}>อา.</div>
              <div>จ.</div>
              <div>อ.</div>
              <div>พ.</div>
              <div>พฤ.</div>
              <div>ศ.</div>
              <div style={{ color: 'var(--primary)' }}>ส.</div>
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
                        
                        return (
                          <button 
                            key={sched.id} 
                            draggable={isDraggable}
                            onDragStart={(e) => {
                              if (!isDraggable) { e.preventDefault(); return; }
                              setDraggedSchedule(sched);
                              e.dataTransfer.effectAllowed = 'move';
                              // Make ghost slightly transparent
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
                              width: '100%',
                              textAlign: 'left',
                              fontSize: '0.675rem',
                              padding: '0.15rem 0.35rem',
                              borderRadius: '4px',
                              backgroundColor: bgColor,
                              color: statusColor,
                              border: `1.25px solid ${statusColor}`,
                              cursor: isDraggable ? 'grab' : 'pointer',
                              fontWeight: 650,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              outline: 'none',
                              transition: 'opacity 0.2s ease'
                            }}
                            title={isDraggable ? `${sched.assetName} — ลากเพื่อเลื่อนวันนัด` : `${sched.assetName} (${sched.status})`}
                          >
                            {labelPrefix} {sched.assetName}
                          </button>
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

      {/* Tab 3: Contract Manager */}
      {activeTab === 'contracts' && (
        <div className="contracts-pm-tab animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Contracts Manager Header */}
          {/* Contracts Manager Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>รายการแผนงานและสัญญาบำรุงรักษาครุภัณฑ์</h3>
            {currentUser?.role !== 'user' && (
              <button className="btn btn-primary" onClick={() => { setIsContractFormOpen(true); setEditingContract(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plus size={16} /> สร้างแผน/สัญญาบำรุงรักษาใหม่
              </button>
            )}
          </div>

          {/* Contracts List Grid */}
          <div className="contracts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {contracts.length === 0 ? (
              <div className="glass-panel text-center" style={{ gridColumn: 'span 12', padding: '3rem' }}>
                ไม่มีรายการแผนงานหรือสัญญาบำรุงรักษาในขณะนี้
              </div>
            ) : (
              contracts.map(contract => {
                // Filter assets belonging to this contract
                const contractAssets = assets.filter(a => contract.assetIds.includes(a.id));
                const isInternal = contract.contractNumber.startsWith('INT-PM-');
                
                return (
                  <div key={contract.id} className="contract-card glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
                    
                    {currentUser?.role !== 'user' && (
                      <button 
                        onClick={() => handleEditContractClick(contract)} 
                        className="btn btn-ghost btn-sm" 
                        style={{ position: 'absolute', top: '0.75rem', right: currentUser?.role === 'admin' ? '2.5rem' : '0.75rem', color: 'var(--primary)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', height: 'auto', padding: '0.25rem' }}
                        title="แก้ไขแผน/สัญญานี้"
                      >
                        <Wrench size={14} />
                      </button>
                    )}

                    {currentUser?.role === 'admin' && (
                      <button 
                        onClick={() => handleDeleteContract(contract.id)} 
                        className="btn btn-ghost btn-sm" 
                        style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--danger)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', height: 'auto', padding: '0.25rem' }}
                        title="ลบสัญญานี้"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    {isInternal ? (
                      <span className="badge badge-success" style={{ fontFamily: 'monospace', fontSize: '0.725rem', marginBottom: '0.5rem' }}>
                        📌 แผนภายใน: {contract.contractNumber}
                      </span>
                    ) : (
                      <span className="badge badge-primary" style={{ fontFamily: 'monospace', fontSize: '0.725rem', marginBottom: '0.5rem' }}>
                        🧾 เลขที่สัญญา: {contract.contractNumber}
                      </span>
                    )}

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0.15rem 0 0.5rem 0', color: 'var(--text-primary)', lineHeight: 1.4, paddingRight: '3.5rem' }}>
                      {contract.title}
                    </h4>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.5rem 0 1rem 0' }}>
                      {isInternal ? (
                        <>
                          <div>🛠️ <strong>ลักษณะแผน:</strong> บำรุงรักษาภายในโดยฝ่ายพัสดุเอง (Self-Maintenance)</div>
                          <div>📅 <strong>ระยะเวลารอบแผนงาน:</strong> {getThaiDateFormatted(contract.startDate)} ถึง {getThaiDateFormatted(contract.endDate)}</div>
                          <div>🔄 <strong>ความถี่รอบตรวจเช็ค PM:</strong> {
                            contract.pmFrequency === 'monthly' ? 'รายเดือน' : 
                            (contract.pmFrequency === 'quarterly' ? 'รายไตรมาส (3 เดือน)' : 
                            (contract.pmFrequency === 'semi-annually' ? 'รายครึ่งปี (6 เดือน)' : 
                            (contract.pmFrequency === 'custom' ? 'กำหนดเอง / เลือกวันนัดเอง' : 'รายปี')))
                          }</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><User size={13} /> <strong>ผู้รับผิดชอบแผน:</strong> {contract.contactPerson}</div>
                        </>
                      ) : (
                        <>
                          <div>🏢 <strong>บริษัทผู้รับจ้าง:</strong> {contract.vendorName}</div>
                          <div>📅 <strong>ระยะเวลารอบสัญญา:</strong> {getThaiDateFormatted(contract.startDate)} ถึง {getThaiDateFormatted(contract.endDate)}</div>
                          <div>🔄 <strong>ความถี่รอบตรวจเช็ค PM:</strong> {
                            contract.pmFrequency === 'monthly' ? 'รายเดือน' : 
                            (contract.pmFrequency === 'quarterly' ? 'รายไตรมาส (3 เดือน)' : 
                            (contract.pmFrequency === 'semi-annually' ? 'รายครึ่งปี (6 เดือน)' : 
                            (contract.pmFrequency === 'custom' ? 'กำหนดเอง / เลือกวันนัดเอง' : 'รายปี')))
                          }</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><User size={13} /> <strong>ผู้ประสานงาน:</strong> {contract.contactPerson}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={13} /> <strong>ติดต่อโทรศัพท์:</strong> <code>{contract.contactPhone}</code></div>
                        </>
                      )}
                    </div>

                    <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>📦 ครุภัณฑ์ควบคุม ({contractAssets.length} ชิ้น):</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {contractAssets.map(asset => (
                          <span key={asset.id} className="badge badge-muted" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', border: '1px solid var(--border)' }}>
                            {asset.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* PM Schedule Timeline for this specific Contract/Plan */}
                    {(() => {
                      const contractSchedules = schedules
                        .filter(s => s.contractId === contract.id)
                        .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
                      
                      return (
                        <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                            📅 กำหนดรอบตรวจเช็ค PM ({contractSchedules.length} รอบ):
                          </span>
                          
                          {contractSchedules.length === 0 ? (
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              ยังไม่มีรอบกำหนดการบำรุงรักษา
                            </span>
                          ) : (
                            <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                              {contractSchedules.map(sched => {
                                const todayStr = new Date().toISOString().split('T')[0];
                                const isOverdue = sched.status === 'pending' && sched.plannedDate < todayStr;
                                
                                let statusColor = 'var(--warning)';
                                let label = 'รอดำเนินการ';
                                if (sched.status === 'completed') {
                                  statusColor = 'var(--success)';
                                  label = 'เสร็จสมบูรณ์';
                                } else if (sched.status === 'postponed') {
                                  statusColor = '#d97706';
                                  label = 'เลื่อนการตรวจ';
                                } else if (sched.status === 'awaiting_repair') {
                                  statusColor = 'var(--danger)';
                                  label = 'พบปัญหา/รอส่งซ่อม';
                                } else if (isOverdue) {
                                  statusColor = 'var(--danger)';
                                  label = 'เลยกำหนดตรวจ';
                                }

                                return (
                                  <div key={sched.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.45rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.725rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0, flex: 1, marginRight: '0.5rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{getThaiDateFormatted(sched.plannedDate)}</span>
                                        <span style={{ fontSize: '0.675rem', color: statusColor, fontWeight: 600 }}>({label})</span>
                                      </div>
                                      <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                                        <code>{sched.assetId}</code> - {sched.assetName}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                                      {sched.status === 'pending' || isOverdue ? (
                                        <>
                                          <button 
                                            onClick={() => handleOpenReschedule(sched)}
                                            className="btn btn-ghost btn-xs"
                                            style={{ padding: '0.15rem 0.4rem', fontSize: '0.675rem', height: 'auto', border: '1px solid var(--border)' }}
                                            title="เลื่อนวันนัดบำรุงรักษา"
                                          >
                                            📅 เลื่อนวัน
                                          </button>
                                          <button 
                                            onClick={() => handleOpenPMForm(sched)}
                                            className="btn btn-primary btn-xs"
                                            style={{ padding: '0.15rem 0.4rem', fontSize: '0.675rem', height: 'auto' }}
                                          >
                                            🔧 บันทึกผล
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button 
                                            onClick={() => {
                                              setSelectedSchedule(sched);
                                              setIsPrintReportOpen(true);
                                            }}
                                            className="btn btn-secondary btn-xs"
                                            style={{ padding: '0.15rem 0.4rem', fontSize: '0.675rem', height: 'auto', border: '1px solid var(--border)' }}
                                            title="พิมพ์เอกสาร A4"
                                          >
                                            🖨️ พิมพ์
                                          </button>
                                          <button 
                                            onClick={() => handleOpenPMForm(sched)}
                                            className="btn btn-ghost btn-xs"
                                            style={{ padding: '0.15rem 0.4rem', fontSize: '0.675rem', height: 'auto', border: '1px solid var(--border)' }}
                                            title="แก้ไขข้อมูลผลการบำรุงรักษา"
                                          >
                                            ✏️ แก้ไข
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}

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

          {/* Search box */}
          <div className="filter-panel glass-panel" style={{ padding: '0.75rem 1rem' }}>
            <div className="search-box" style={{ minWidth: '100%' }}>
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="สืบค้นรหัสครุภัณฑ์ หรืออาการเสียใน CM Logs..." 
                className="form-input search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* CM Logs Table */}
          <div className="table-container glass-panel">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>วันที่แจ้งชำรุด</th>
                  <th style={{ width: '120px' }}>รหัสครุภัณฑ์</th>
                  <th>ชื่อรายการครุภัณฑ์</th>
                  <th>อาการเสีย (CM Details)</th>
                  <th style={{ width: '130px' }}>ผู้ทำเรื่องส่งซ่อม</th>
                  <th style={{ width: '110px' }}>สถานะการซ่อม</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>การจัดการเคส</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredCM = repairs.filter(r => {
                    const matchesSearch = r.assetId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                          r.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          r.symptom.toLowerCase().includes(searchTerm.toLowerCase());
                    
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
                      <td>{getThaiDateFormatted(r.dateOpened)}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.assetId}</td>
                      <td><strong>{r.assetName}</strong></td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span>{r.symptom}</span>
                          {r.symptomImageUrl && (
                            <a href={r.symptomImageUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.725rem', color: 'var(--primary)', textDecoration: 'underline', fontWeight: 550 }}>
                              🖼️ ดูรูปถ่ายอาการเสีย
                            </a>
                          )}
                          {r.dateSent && (
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                              🚚 ร้านซ่อม: {r.repairCompany} (โทร: {r.contactPerson})
                            </span>
                          )}
                        </div>
                      </td>
                      <td>👤 {r.operator}</td>
                      <td>
                        <span className={`badge ${
                          r.status === 'completed' ? 'badge-success' : 
                          (r.status === 'sent' ? 'badge-warning' : 'badge-danger')
                        }`} style={{ fontSize: '0.725rem' }}>
                          {r.status === 'completed' ? '🟢 ซ่อมสำเร็จ' : (r.status === 'sent' ? '🟡 นำส่งช่าง' : '🔴 รอช่างตรวจ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.45rem' }}>
                          {currentUser?.role !== 'manager' ? (
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
                                  style={{ padding: '0.2rem 0.5rem', height: 'auto', fontSize: '0.725rem' }}
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
                                  style={{ padding: '0.2rem 0.5rem', height: 'auto', fontSize: '0.725rem' }}
                                >
                                  ✅ รับของคืน
                                </button>
                              )}
                              {r.status === 'completed' && (
                                <span style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--text-muted)' }}>🔒 ปิดเคส</span>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {r.status === 'completed' ? '🔒 ปิดเคส' : '👀 ดูอย่างเดียว'}
                            </span>
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

      {/* --- MODAL: RESCHEDULE DATE PICKER --- */}
      {isRescheduleOpen && rescheduleTarget && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-scale-up" style={{ maxWidth: '420px', width: '100%', padding: '1.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>📅 เลื่อนวันนัดบำรุงรักษา</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setIsRescheduleOpen(false); setRescheduleTarget(null); }} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>รหัสครุภัณฑ์: <code>{rescheduleTarget.assetId}</code></div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.15rem 0' }}>{rescheduleTarget.assetName}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 650 }}>📅 วันที่เดิม: {getThaiDateFormatted(rescheduleTarget.plannedDate)}</span>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>📅 เลือกวันที่ใหม่</label>
              <input 
                type="date" 
                className="form-input"
                value={rescheduleNewDate}
                onChange={(e) => setRescheduleNewDate(e.target.value)}
                required
              />
              {rescheduleNewDate && rescheduleNewDate !== rescheduleTarget.plannedDate && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                  ➡️ จะเลื่อนเป็น: <strong>{getThaiDateFormatted(rescheduleNewDate)}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => { setIsRescheduleOpen(false); setRescheduleTarget(null); }}
                style={{ border: '1px solid var(--border)' }}
              >
                ยกเลิก
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleRescheduleSubmit}
                disabled={!rescheduleNewDate || rescheduleNewDate === rescheduleTarget.plannedDate}
              >
                💾 บันทึกวันนัดใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: PM RECORDING FORM --- */}
      {isPMFormOpen && selectedSchedule && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handlePMSubmit} className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}><Wrench size={18} style={{ display: 'inline', marginRight: '0.35rem', color: 'var(--primary)' }} /> บันทึกผลการบำรุงรักษา PM</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsPMFormOpen(false)} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1rem', flexShrink: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>รหัสครุภัณฑ์: <code>{selectedSchedule.assetId}</code></div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.15rem 0' }}>{selectedSchedule.assetName}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 650 }}>📅 วันที่ตามแผนบำรุงรักษา: {getThaiDateFormatted(selectedSchedule.plannedDate)}</span>
            </div>

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
                <label className="form-label">📋 เช็คลิสต์รายละเอียดดำเนินการ PM (เช็คลิสต์ตรวจสภาพ)</label>
                <textarea 
                  className="form-input"
                  rows={4}
                  value={pmDetails}
                  onChange={(e) => setPmDetails(e.target.value)}
                  placeholder="ระบุสิ่งที่เช็คและทำไป เช่น ปัดฝุ่น ทำความสะอาดเครื่อง..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">📷 ถ่ายรูปแนบหลักฐาน (สภาพหลังบำรุงรักษา)</label>
                <div className="image-dropzone" style={{ minHeight: '120px', padding: '0.75rem' }}>
                  <input 
                    type="file" 
                    id="pm-proof-uploader" 
                    accept="image/*"
                    onChange={handleProofImageChange}
                    className="file-hidden-input"
                  />
                  <label htmlFor="pm-proof-uploader" className="dropzone-label">
                    {proofPreview ? (
                      <div style={{ maxWidth: '100px', margin: '0 auto' }}>
                        <img src={proofPreview} alt="PM proof preview" style={{ width: '100%', borderRadius: '4px' }} />
                      </div>
                    ) : (
                      <>
                        <Camera size={24} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.75rem' }}>คลิกเพื่ออัปโหลดภาพหลักฐานการทำ PM</span>
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
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '800px', width: '100%', margin: '0 auto 1.5rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10000 }}>
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
                      <div><strong>ชื่อรายการครุภัณฑ์:</strong> {selectedSchedule.assetName}</div>
                      <div><strong>วันที่ทำจริง (Completed):</strong> {getThaiDateFormatted(selectedSchedule.completedDate || selectedSchedule.plannedDate)}</div>
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

                  {/* Proof of image */}
                  {selectedSchedule.proofImageUrl && (
                    <div style={{ marginBottom: '2rem' }}>
                      <strong>📸 ภาพถ่ายสภาพหลังดำเนินการบำรุงรักษา (Proof of Work):</strong>
                      <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                        <img 
                          src={selectedSchedule.proofImageUrl} 
                          alt="PM proof" 
                          style={{ maxWidth: '380px', maxHeight: '200px', border: '2px solid #dddddd', borderRadius: '4px' }} 
                        />
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
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
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
                <label className="form-label">📅 วันสิ้นสุดแผน/สัญญา</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={contractEnd}
                  onChange={(e) => setContractEnd(e.target.value)}
                  required
                />
              </div>
            </div>

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

            {/* Custom Dates Input Section (Visible only when custom frequency is selected) */}
            {pmFrequency === 'custom' && (
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>📅 เลือกวันนัดหมายเข้าบำรุงรักษา PM (กำหนดเอง)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={newCustomDate} 
                    onChange={(e) => setNewCustomDate(e.target.value)} 
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={() => {
                      if (!newCustomDate) return;
                      if (customDates.includes(newCustomDate)) {
                        alert('วันที่นี้อยู่ในรายการเรียบร้อยแล้ว');
                        return;
                      }
                      setCustomDates(prev => [...prev, newCustomDate].sort());
                      setNewCustomDate('');
                    }}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    + เพิ่มวันนัด
                  </button>
                </div>
                
                <span style={{ fontSize: '0.725rem', fontWeight: 650, color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  รายการนัดหมายที่เพิ่มแล้ว ({customDates.length} วัน):
                </span>
                {customDates.length === 0 ? (
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>ยังไม่มีการระบุวันนัดหมาย</span>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '110px', overflowY: 'auto', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)' }}>
                    {customDates.map(d => (
                      <span key={d} className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.725rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
                        {getThaiDateFormatted(d)}
                        <button 
                          type="button" 
                          onClick={() => setCustomDates(prev => prev.filter(x => x !== d))}
                          style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem', padding: 0, display: 'flex', alignItems: 'center' }}
                          title="ลบวันนัดนี้"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Checkbox selector for assets */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="form-label">🔒 เลือกครุภัณฑ์ที่เข้าควบคุมในสัญญานี้ (เลือกได้หลายรายการ)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)' }}>
                {assets.filter(a => a.status !== 'รอจำหน่าย').map(asset => (
                  <label key={asset.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={selectedAssetIds.includes(asset.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssetIds(prev => [...prev, asset.id]);
                        } else {
                          setSelectedAssetIds(prev => prev.filter(id => id !== asset.id));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span><strong>{asset.id}</strong> - {asset.name} (📍 {asset.location})</span>
                  </label>
                ))}
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
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleRepairSubmit} className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '520px', width: '100%', background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>🚨 เปิดเคสแจ้งซ่อมด่วนเป็นครั้งคราว (Corrective Maintenance)</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsRepairFormOpen(false)} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>
                ✕
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">🔍 เลือกครุภัณฑ์ที่จะส่งซ่อม</label>
              <select 
                className="form-select"
                value={repairAssetId}
                onChange={(e) => setRepairAssetId(e.target.value)}
                required
              >
                <option value="">-- โปรดเลือกครุภัณฑ์ --</option>
                {assets.filter(a => a.status !== 'รอจำหน่าย' && (currentUser?.role !== 'user' || a.department === currentUser.department)).map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.id} - {asset.name}
                  </option>
                ))}
              </select>
            </div>

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
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
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
              <label className="form-label">📷 ถ่ายรูปหลักฐานการเซ็นส่งของ / ใบรับเคลม (ตัวเลือก)</label>
              <div className="image-dropzone" style={{ minHeight: '120px', padding: '0.75rem' }}>
                <input 
                  type="file" 
                  id="send-proof-picker"
                  accept="image/*"
                  onChange={handleSendProofImageChange}
                  className="file-hidden-input"
                />
                <label htmlFor="send-proof-picker" className="dropzone-label">
                  {sendProofPreview ? (
                    <div style={{ maxWidth: '100px', margin: '0 auto' }}>
                      <img src={sendProofPreview} alt="Send proof preview" style={{ width: '100%', borderRadius: '4px' }} />
                    </div>
                  ) : (
                    <>
                      <Camera size={24} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.75rem' }}>ถ่ายใบนำส่งเคลมเก็บเป็นหลักฐานคลาวด์</span>
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
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
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
              <label className="form-label">📷 ถ่ายรูปทรัพย์สินสภาพหลังเสร็จสมบูรณ์ / ใบเสร็จปิดงาน (ตัวเลือก)</label>
              <div className="image-dropzone" style={{ minHeight: '120px', padding: '0.75rem' }}>
                <input 
                  type="file" 
                  id="receive-proof-picker"
                  accept="image/*"
                  onChange={handleReceiveProofImageChange}
                  className="file-hidden-input"
                />
                <label htmlFor="receive-proof-picker" className="dropzone-label">
                  {receiveProofPreview ? (
                    <div style={{ maxWidth: '100px', margin: '0 auto' }}>
                      <img src={receiveProofPreview} alt="Receive proof preview" style={{ width: '100%', borderRadius: '4px' }} />
                    </div>
                  ) : (
                    <>
                      <Camera size={24} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.75rem' }}>ถ่ายสภาพของที่รับคืนเพื่อปิดเคส</span>
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

    </div>
  );
};
