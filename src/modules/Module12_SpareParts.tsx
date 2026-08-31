import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Package, 
  Box, 
  AlertTriangle, 
  Printer, 
  Trash2, 
  Edit3, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  ClipboardList, 
  Info, 
  Download, 
  Phone, 
  MapPin, 
  Building,
  Image as ImageIcon
} from 'lucide-react';
import { Asset, UserAccount, SparePart, SparePartTransaction } from '../utils/mockData';
import { compressFileOrPdf, uploadImage } from '../services/dbService';

interface Module12SparePartsProps {
  assets: Asset[];
  spareParts: SparePart[];
  onAddSparePart: (part: SparePart) => Promise<void>;
  onUpdateSparePart: (part: SparePart) => Promise<void>;
  onDeleteSparePart: (id: string) => Promise<void>;
  onLogAudit: (audit: any) => Promise<void>;
  currentUser: UserAccount | null;
}

export const Module12_SpareParts: React.FC<Module12SparePartsProps> = ({
  assets,
  spareParts,
  onAddSparePart,
  onUpdateSparePart,
  onDeleteSparePart,
  onLogAudit,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out'>('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Selected entities for modals
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isCutOpen, setIsCutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Form states for Add/Edit
  const [formPartCode, setFormPartCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formSpec, setFormSpec] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formMinQty, setFormMinQty] = useState(5);
  const [formUnit, setFormUnit] = useState('ชิ้น');
  const [formUnitPrice, setFormUnitPrice] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formSupplierContact, setFormSupplierContact] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formRelatedAssetIds, setFormRelatedAssetIds] = useState<string[]>([]);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Transaction form states
  const [txQty, setTxQty] = useState(1);
  const [txUnitPrice, setTxUnitPrice] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txRefDoc, setTxRefDoc] = useState('');
  const [txSupplier, setTxSupplier] = useState('');
  const [txSupplierContact, setTxSupplierContact] = useState('');
  const [txAssetId, setTxAssetId] = useState('');
  const [txNote, setTxNote] = useState('');
  const [txSubmitting, setTxSubmitting] = useState(false);

  // Lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // Role permissions
  const isOrgWide = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const userDept = currentUser?.department || '';

  // Filter lists automatically if Operator/Head
  useEffect(() => {
    if (!isOrgWide && userDept) {
      setDeptFilter(userDept);
    }
  }, [currentUser, isOrgWide, userDept]);

  // Handle access permission check for management (Edit/Delete)
  const canManagePart = (part: SparePart) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'manager') return true;
    if (currentUser.role === 'head') {
      return part.department === currentUser.department;
    }
    // Operator
    return part.createdBy === currentUser.username || part.createdBy === currentUser.name;
  };

  // Filter logic
  const filteredParts = useMemo(() => {
    return spareParts.filter(part => {
      // 1. Text Search
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        part.name.toLowerCase().includes(search) ||
        part.partCode.toLowerCase().includes(search) ||
        (part.specification || '').toLowerCase().includes(search) ||
        (part.brand || '').toLowerCase().includes(search) ||
        (part.storageLocation || '').toLowerCase().includes(search) ||
        (part.supplier || '').toLowerCase().includes(search);

      // 2. Department filter
      let matchesDept = true;
      if (deptFilter !== 'all') {
        matchesDept = part.department === deptFilter;
      }

      // 3. Status filter
      let matchesStatus = true;
      if (statusFilter === 'low') {
        matchesStatus = part.quantity <= part.minQuantity && part.quantity > 0;
      } else if (statusFilter === 'out') {
        matchesStatus = part.quantity <= 0;
      }

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [spareParts, searchTerm, deptFilter, statusFilter]);

  // Statistics calculations
  const stats = useMemo(() => {
    const activeList = spareParts.filter(p => deptFilter === 'all' || p.department === deptFilter);
    const totalItems = activeList.length;
    const totalQty = activeList.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockCount = activeList.filter(p => p.quantity <= p.minQuantity && p.quantity > 0).length;
    const outOfStockCount = activeList.filter(p => p.quantity <= 0).length;
    const totalValue = activeList.reduce((sum, p) => sum + (p.quantity * (p.unitPrice || 0)), 0);

    return { totalItems, totalQty, lowStockCount, outOfStockCount, totalValue };
  }, [spareParts, deptFilter]);

  // Add / Edit Handlers
  const handleOpenAdd = () => {
    setSelectedPart(null);
    setFormPartCode(`SP-${Date.now().toString().slice(-6)}`);
    setFormName('');
    setFormSpec('');
    setFormBrand('');
    setFormLocation('');
    setFormMinQty(5);
    setFormUnit('ชิ้น');
    setFormUnitPrice('');
    setFormSupplier('');
    setFormSupplierContact('');
    setFormNotes('');
    setFormImageUrl('');
    setFormRelatedAssetIds([]);
    setAssetSearchQuery('');
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (part: SparePart) => {
    setSelectedPart(part);
    setFormPartCode(part.partCode);
    setFormName(part.name);
    setFormSpec(part.specification || '');
    setFormBrand(part.brand || '');
    setFormLocation(part.storageLocation || '');
    setFormMinQty(part.minQuantity);
    setFormUnit(part.unit);
    setFormUnitPrice(part.unitPrice ? String(part.unitPrice) : '');
    setFormSupplier(part.supplier || '');
    setFormSupplierContact(part.supplierContact || '');
    setFormNotes(part.notes || '');
    setFormImageUrl(part.imageUrl || '');
    setFormRelatedAssetIds(part.relatedAssetIds || (part.assetId ? [part.assetId] : []));
    setAssetSearchQuery('');
    setIsAddEditOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingImage(true);
      try {
        const compressed = await compressFileOrPdf(file, 800, 800, 0.75);
        const url = await uploadImage(compressed, 'spare_parts');
        setFormImageUrl(url);
      } catch (err) {
        console.error('Image compression failed:', err);
        alert('ไม่สามารถอัปโหลดรูปภาพได้');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleAddEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPartCode.trim()) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    const operatorName = currentUser?.name || 'พนักงาน';
    const dept = currentUser?.department || 'พัสดุกลาง';

    const partData: SparePart = {
      id: selectedPart ? selectedPart.id : `sp-${Date.now()}`,
      assetId: formRelatedAssetIds[0] || '', // Backwards compatibility
      partCode: formPartCode,
      name: formName,
      specification: formSpec,
      brand: formBrand,
      storageLocation: formLocation,
      quantity: selectedPart ? selectedPart.quantity : 0,
      minQuantity: formMinQty,
      unit: formUnit,
      unitPrice: formUnitPrice ? Number(formUnitPrice) : undefined,
      supplier: formSupplier,
      supplierContact: formSupplierContact,
      notes: formNotes,
      imageUrl: formImageUrl,
      updatedAt: new Date().toISOString(),
      createdBy: selectedPart ? (selectedPart.createdBy || operatorName) : operatorName,
      department: selectedPart ? (selectedPart.department || dept) : dept,
      relatedAssetIds: formRelatedAssetIds,
      transactions: selectedPart ? (selectedPart.transactions || []) : []
    };

    try {
      if (selectedPart) {
        await onUpdateSparePart(partData);
        await onLogAudit({
          assetId: 'SPARE_PART',
          assetName: `แก้ไขอะไหล่: ${partData.name}`,
          action: 'edit',
          operator: operatorName,
          details: `แก้ไขข้อมูลอะไหล่รหัส ${partData.partCode} (${partData.name})`
        });
      } else {
        await onAddSparePart(partData);
        await onLogAudit({
          assetId: 'SPARE_PART',
          assetName: `ลงทะเบียนอะไหล่ใหม่: ${partData.name}`,
          action: 'create',
          operator: operatorName,
          details: `ลงทะเบียนอะไหล่ชิ้นใหม่ รหัส ${partData.partCode} คลังจัดเก็บ ${partData.storageLocation || 'ไม่ระบุ'}`
        });
      }
      setIsAddEditOpen(false);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDeleteClick = async (part: SparePart) => {
    if (window.confirm(`⚠️ คุณต้องการลบอะไหล่ "${part.name}" (${part.partCode}) ใช่หรือไม่? การลบนี้จะรวมถึงประวัติการรับเข้า-จ่ายออกทั้งหมด`)) {
      try {
        await onDeleteSparePart(part.id);
        await onLogAudit({
          assetId: 'SPARE_PART',
          assetName: `ลบอะไหล่: ${part.name}`,
          action: 'delete',
          operator: currentUser?.name || 'พนักงาน',
          details: `ลบข้อมูลทะเบียนอะไหล่ รหัส ${part.partCode}`
        });
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  // Receive stock operation
  const handleOpenReceive = (part: SparePart) => {
    setSelectedPart(part);
    setTxQty(5);
    setTxUnitPrice(part.unitPrice ? String(part.unitPrice) : '');
    setTxDate(new Date().toISOString().split('T')[0]);
    setTxRefDoc('');
    setTxSupplier(part.supplier || '');
    setTxSupplierContact(part.supplierContact || '');
    setTxNote('');
    setIsReceiveOpen(true);
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart || txQty <= 0) return;

    setTxSubmitting(true);
    const price = txUnitPrice ? Number(txUnitPrice) : 0;
    const total = txQty * price;

    const newTx: SparePartTransaction = {
      id: `tx-${Date.now()}`,
      partId: selectedPart.id,
      assetId: '',
      date: txDate,
      type: 'in',
      quantity: txQty,
      balanceAfter: selectedPart.quantity + txQty,
      unitPrice: price,
      totalPrice: total,
      referenceDoc: txRefDoc,
      operator: currentUser?.name || 'เจ้าหน้าที่',
      note: txNote,
      createdAt: new Date().toISOString()
    };

    const updatedPart: SparePart = {
      ...selectedPart,
      quantity: selectedPart.quantity + txQty,
      unitPrice: price > 0 ? price : selectedPart.unitPrice,
      supplier: txSupplier || selectedPart.supplier,
      supplierContact: txSupplierContact || selectedPart.supplierContact,
      updatedAt: new Date().toISOString(),
      transactions: [...(selectedPart.transactions || []), newTx]
    };

    try {
      await onUpdateSparePart(updatedPart);
      await onLogAudit({
        assetId: 'SPARE_PART',
        assetName: `รับเข้าอะไหล่: ${selectedPart.name}`,
        action: 'edit',
        operator: currentUser?.name || 'เจ้าหน้าที่',
        details: `นำเข้าจำนวน +${txQty} ${selectedPart.unit} ราคาหน่วยละ ฿${price.toLocaleString()} (เอกสารอ้างอิง: ${txRefDoc || '-'}) ยอดคงเหลือหลังรับ: ${newTx.balanceAfter}`
      });
      setIsReceiveOpen(false);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการรับเข้าสต็อก');
    } finally {
      setTxSubmitting(false);
    }
  };

  // Cut stock operation
  const handleOpenCut = (part: SparePart) => {
    if (part.quantity <= 0) {
      alert('⚠️ อะไหล่ชิ้นนี้ไม่มีคงเหลือในคลัง ไม่สามารถทำรายการตัดออกได้');
      return;
    }
    setSelectedPart(part);
    setTxQty(1);
    setTxDate(new Date().toISOString().split('T')[0]);
    setTxRefDoc('');
    setTxAssetId('');
    setTxNote('');
    setIsCutOpen(true);
  };

  const handleCutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart || txQty <= 0) return;

    if (txQty > selectedPart.quantity) {
      alert(`⚠️ จำนวนที่ต้องการเบิกจ่าย (${txQty}) มีมากกว่าอะไหล่คงคลังที่มีอยู่จริง (${selectedPart.quantity})`);
      return;
    }

    setTxSubmitting(true);
    const balanceAfter = selectedPart.quantity - txQty;
    const targetAsset = assets.find(a => a.id === txAssetId);

    const newTx: SparePartTransaction = {
      id: `tx-${Date.now()}`,
      partId: selectedPart.id,
      assetId: txAssetId,
      date: txDate,
      type: 'out',
      quantity: -txQty,
      balanceAfter: balanceAfter,
      unitPrice: selectedPart.unitPrice,
      totalPrice: txQty * (selectedPart.unitPrice || 0),
      referenceDoc: txRefDoc,
      operator: currentUser?.name || 'เจ้าหน้าที่',
      note: txNote,
      createdAt: new Date().toISOString()
    };

    const updatedPart: SparePart = {
      ...selectedPart,
      quantity: balanceAfter,
      updatedAt: new Date().toISOString(),
      transactions: [...(selectedPart.transactions || []), newTx]
    };

    try {
      await onUpdateSparePart(updatedPart);
      await onLogAudit({
        assetId: txAssetId || 'SPARE_PART',
        assetName: targetAsset ? `ตัดเบิกอะไหล่ใส่ครุภัณฑ์: ${targetAsset.name}` : `ตัดจ่ายอะไหล่: ${selectedPart.name}`,
        action: 'edit',
        operator: currentUser?.name || 'เจ้าหน้าที่',
        details: `ตัดจ่ายจำนวน -${txQty} ${selectedPart.unit} เพื่อใช้กับครุภัณฑ์รหัส ${txAssetId || 'ทั่วไป'} (เหตุผล: ${txRefDoc || '-'}) ยอดคงคลังคงเหลือ: ${balanceAfter}`
      });
      setIsCutOpen(false);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการตัดจ่ายสต็อก');
    } finally {
      setTxSubmitting(false);
    }
  };

  const handleOpenHistory = (part: SparePart) => {
    setSelectedPart(part);
    setIsHistoryOpen(true);
  };

  const getThaiDateFormatted = (dateStr: string) => {
    if (!dateStr) return '-';
    const cleanStr = dateStr.split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0]) + 543;
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const month = months[parseInt(parts[1]) - 1];
    const day = parseInt(parts[2]);
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="module-container animate-fade-in">
      
      {/* Module Title Header */}
      <div className="module-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📦 คลังอะไหล่และสต็อกบำรุงรักษา (Spare Parts Center)
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            คลังอะไหล่ศูนย์กลาง บัญชีคุมเบิกจ่ายพัสดุ ตรวจนับอะไหล่สำรอง และเตือนสั่งซื้อล่วงหน้าสำหรับแผน PM/CM
          </p>
        </div>
        <button 
          className="btn btn-primary btn-sm"
          onClick={handleOpenAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
        >
          <Plus size={16} /> ลงทะเบียนอะไหล่ใหม่
        </button>
      </div>

      {/* Warning purchasing Banner Alert */}
      {stats.lowStockCount > 0 && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1.5px solid rgba(239, 68, 68, 0.35)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle color="var(--danger)" size={20} className="glow-icon" />
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>⚠️ มีอะไหล่ขาดแคลนและใกล้หมดสต็อก ({stats.lowStockCount} รายการ)</strong>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ตรวจพบอะไหล่จำนวนรวมถึงหรือต่ำกว่าจุดแจ้งเตือน ควรจัดซื้อเพื่อสำรองไว้รองรับการ PM รอบถัดไป</p>
            </div>
          </div>
          <button 
            onClick={() => { setStatusFilter('low'); setShowPrintModal(true); }}
            className="btn btn-ghost btn-sm text-danger"
            style={{ fontSize: '0.75rem', border: '1px solid rgba(239,68,68,0.25)', padding: '0.25rem 0.5rem', background: 'transparent' }}
          >
            📋 ออกรายงานใบเตือนซื้อ
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>จำนวนชนิดอะไหล่</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats.totalItems} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>รายการ</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Box size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>จำนวนอะไหล่ในคลังรวม</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>
              {stats.totalQty.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>ชิ้น/หน่วย</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', border: stats.lowStockCount > 0 ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border)' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>ต้องสั่งซื้อเพิ่ม (ใกล้หมด)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: stats.lowStockCount > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
              {stats.lowStockCount} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>รายการ</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>฿</span>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>มูลค่าเงินคลังรวม</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats.totalValue.toLocaleString('th-TH')} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>บาท</span>
            </div>
          </div>
        </div>

      </div>

      {/* Control Filter Bar */}
      <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input"
            placeholder="ค้นหาชื่อ, รหัสอะไหล่, ยี่ห้อ, ตู้เก็บ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.1rem', height: '35px', fontSize: '0.8rem' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          
          {/* Status buttons */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.15rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <button 
              className={`btn btn-xs ${statusFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter('all')}
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: statusFilter === 'all' ? 'var(--primary)' : 'transparent' }}
            >
              ทั้งหมด
            </button>
            <button 
              className={`btn btn-xs ${statusFilter === 'low' ? 'btn-ghost' : 'btn-ghost'}`}
              onClick={() => setStatusFilter('low')}
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: statusFilter === 'low' ? '#fff' : 'var(--warning)', background: statusFilter === 'low' ? 'var(--warning)' : 'transparent' }}
            >
              ⚠️ ต่ำกว่าเกณฑ์ ({stats.lowStockCount})
            </button>
            <button 
              className={`btn btn-xs ${statusFilter === 'out' ? 'btn-ghost' : 'btn-ghost'}`}
              onClick={() => setStatusFilter('out')}
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: statusFilter === 'out' ? '#fff' : 'var(--danger)', background: statusFilter === 'out' ? 'var(--danger)' : 'transparent' }}
            >
              🚨 หมดสต็อก ({stats.outOfStockCount})
            </button>
          </div>

          {/* Department filter */}
          {isOrgWide ? (
            <select
              className="form-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ height: '35px', padding: '0 1.5rem 0 0.5rem', fontSize: '0.8rem', minWidth: '150px' }}
            >
              <option value="all">ทุกฝ่าย / แผนก</option>
              {Array.from(new Set(spareParts.map(p => p.department).filter(Boolean))).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          ) : (
            <div style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              ฝ่าย: <strong>{userDept}</strong>
            </div>
          )}

          {/* Print Button */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPrintModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', height: '35px', padding: '0 0.75rem' }}
          >
            <Printer size={15} /> สรุปสต็อก
          </button>
        </div>

      </div>

      {/* Spare Parts Cards Grid */}
      {filteredParts.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
          🔍 ไม่พบรายการอะไหล่ในคลังตามเงื่อนไขที่ระบุ
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {filteredParts.map(part => {
            const isOutOfStock = part.quantity <= 0;
            const isLowStock = part.quantity <= part.minQuantity && part.quantity > 0;
            const hasManagePermission = canManagePart(part);

            return (
              <div 
                key={part.id}
                className="glass-panel"
                style={{ 
                  padding: '1.15rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: isOutOfStock 
                    ? '1.5px solid rgba(239, 68, 68, 0.5)' 
                    : isLowStock 
                    ? '1.5px solid rgba(245, 158, 11, 0.5)' 
                    : '1px solid var(--border)' 
                }}
              >
                <div>
                  {/* Card Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary" style={{ fontFamily: 'monospace', fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}>
                        {part.partCode}
                      </span>
                      <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
                        🏢 {(part.department || 'พัสดุกลาง').replace('ฝ่าย', '').replace('กลุ่มงาน', '').slice(0, 12)}
                      </span>
                    </div>

                    {/* Stock Alert Badge */}
                    {isOutOfStock ? (
                      <span className="badge badge-danger" style={{ fontSize: '0.65rem', fontWeight: 800 }}>🚨 สินค้าหมด</span>
                    ) : isLowStock ? (
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem', fontWeight: 800 }}>⚠️ ต้องจัดซื้อด่วน</span>
                    ) : (
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>✓ สต็อกปกติ</span>
                    )}
                  </div>

                  {/* Main Title & Image Container */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', marginBottom: '0.75rem' }}>
                    {part.imageUrl ? (
                      <img 
                        src={part.imageUrl} 
                        alt={part.name}
                        onClick={() => { setLightboxUrl(part.imageUrl!); setLightboxTitle(part.name); }}
                        style={{ width: '56px', height: '56px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border)', cursor: 'pointer' }}
                        title="คลิกเพื่อพรีวิวรูปภาพ"
                      />
                    ) : (
                      <div style={{ width: '56px', height: '56px', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <ImageIcon size={20} />
                      </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ fontSize: '0.925rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {part.name}
                      </h4>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        สเปค: {part.specification || 'ไม่มีข้อมูลเพิ่มเติม'}
                      </p>
                    </div>
                  </div>

                  {/* Detail Table */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>📍 <strong>ตู้จัดเก็บ:</strong> {part.storageLocation || 'ไม่ระบุ'}</div>
                    <div>🏷️ <strong>ยี่ห้อ:</strong> {part.brand || '-'}</div>
                    <div>📦 <strong>คงเหลือ:</strong> <span style={{ fontWeight: 800, color: isOutOfStock ? 'var(--danger)' : isLowStock ? 'var(--warning)' : 'var(--success)', fontSize: '0.85rem' }}>{part.quantity}</span> / {part.unit}</div>
                    <div>📌 <strong>เกณฑ์ขั้นต่ำ:</strong> {part.minQuantity} {part.unit}</div>
                    <div style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.3rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>ราคาล่าสุด: ฿{part.unitPrice?.toLocaleString() || '-'}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={part.supplier}>ร้าน: {part.supplier || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', gap: '0.35rem' }}>
                  
                  {/* Left Side: Receipt & Cut Transactions */}
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenReceive(part)}
                      className="btn btn-ghost btn-xs text-success"
                      style={{ border: '1px solid rgba(16,185,129,0.2)', padding: '0.2rem 0.45rem', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'transparent' }}
                    >
                      <ArrowUpRight size={13} /> รับเข้า
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCut(part)}
                      className="btn btn-ghost btn-xs text-warning"
                      style={{ border: '1px solid rgba(245,158,11,0.2)', padding: '0.2rem 0.45rem', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'transparent' }}
                      disabled={isOutOfStock}
                    >
                      <ArrowDownRight size={13} /> ตัดจ่าย
                    </button>
                  </div>

                  {/* Right Side: Log, Edit, Delete */}
                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenHistory(part)}
                      className="btn btn-ghost btn-xs"
                      style={{ border: '1px solid var(--border)', padding: '0.2rem 0.35rem' }}
                      title="ดูประวัติบัญชีคุม Stock Card อะไหล่นี้"
                    >
                      <ClipboardList size={13} />
                    </button>

                    {hasManagePermission && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(part)}
                          className="btn btn-ghost btn-xs text-primary"
                          style={{ border: '1px solid var(--border)', padding: '0.2rem 0.35rem' }}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(part)}
                          className="btn btn-ghost btn-xs text-danger"
                          style={{ border: '1px solid var(--border)', padding: '0.2rem 0.35rem' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL 1: ADD / EDIT SPARE PART --- */}
      {isAddEditOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 99999, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
          <form onSubmit={handleAddEditSubmit} className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem', marginBottom: '1rem', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                {selectedPart ? '✏️ แก้ไขทะเบียนอะไหล่บำรุงรักษา' : '📦 ลงทะเบียนชนิดอะไหล่ใหม่'}
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsAddEditOpen(false)} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div className="form-group flex-1" style={{ minWidth: '180px' }}>
                  <label className="form-label">🔑 รหัสอะไหล่ (SKU / Part Code) *</label>
                  <input 
                    type="text"
                    className="form-input monospace-input"
                    value={formPartCode}
                    onChange={(e) => setFormPartCode(e.target.value)}
                    required
                    placeholder="เช่น SP-PUMP-001"
                  />
                </div>

                <div className="form-group flex-1" style={{ minWidth: '180px' }}>
                  <label className="form-label">🏷️ ยี่ห้อ / Brand</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="เช่น Purolite, Dell, Shimano"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">📦 ชื่ออะไหล่พัสดุอุปกรณ์ *</label>
                <input 
                  type="text"
                  className="form-input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="เช่น ไส้กรองเมมเบรนกรองน้ำ RO Membrane"
                />
              </div>

              <div className="form-group">
                <label className="form-label">🔧 รายละเอียด / Specification / เบอร์พาร์ท</label>
                <textarea 
                  className="form-input"
                  value={formSpec}
                  onChange={(e) => setFormSpec(e.target.value)}
                  placeholder="เช่น Dow Filmtec BW30-400 (High Rejection 99.5%)"
                  rows={2}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div className="form-group flex-1" style={{ minWidth: '110px' }}>
                  <label className="form-label">หน่วยนับ</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    required
                    placeholder="เช่น ชิ้น, ถุง, ท่อน"
                  />
                </div>

                <div className="form-group flex-1" style={{ minWidth: '110px' }}>
                  <label className="form-label">⚠️ เกณฑ์เตือนซื้อขั้นต่ำ</label>
                  <input 
                    type="number"
                    className="form-input"
                    value={formMinQty}
                    onChange={(e) => setFormMinQty(Number(e.target.value))}
                    min={0}
                    required
                  />
                </div>

                <div className="form-group flex-1" style={{ minWidth: '110px' }}>
                  <label className="form-label">ราคาต่อหน่วยประมาณการ</label>
                  <input 
                    type="number"
                    className="form-input"
                    value={formUnitPrice}
                    onChange={(e) => setFormUnitPrice(e.target.value)}
                    placeholder="บาท"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">📍 สถานที่จัดเก็บจริง (Storage Shelf/Location)</label>
                <input 
                  type="text"
                  className="form-input"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="เช่น ห้องเก็บอะไหล่ ตู้เหล็กชั้น 2 ฝั่งซ้าย"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div className="form-group flex-1" style={{ minWidth: '180px' }}>
                  <label className="form-label">🛒 ร้านค้า / แหล่งซื้อล่าสุด (Supplier)</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="เช่น บริษัท วอเตอร์ทรีทเม้นท์ จำกัด"
                  />
                </div>

                <div className="form-group flex-1" style={{ minWidth: '180px' }}>
                  <label className="form-label">📞 ช่องทางติดต่อร้านค้า</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={formSupplierContact}
                    onChange={(e) => setFormSupplierContact(e.target.value)}
                    placeholder="เช่น เบอร์โทรศัพท์, อีเมล, ไอดีไลน์"
                  />
                </div>
              </div>

              {/* Related Assets Multiselect with Custom Search & Multichoice Dropdown */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🔗 เชื่อมโยงเข้ากับครุภัณฑ์ที่เกี่ยวข้อง (Related Assets)</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    เลือกแล้ว {formRelatedAssetIds.length} รายการ
                  </span>
                </label>

                {/* Selected Assets Badge List */}
                {formRelatedAssetIds.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    {formRelatedAssetIds.map(id => {
                      const ast = assets.find(a => a.id === id);
                      return (
                        <div 
                          key={id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem', 
                            background: 'rgba(59, 130, 246, 0.15)', 
                            color: 'var(--primary)', 
                            padding: '0.15rem 0.45rem', 
                            borderRadius: '10px', 
                            fontSize: '0.72rem', 
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            fontWeight: 600
                          }}
                        >
                          <span>[{id.slice(-6)}] {ast ? ast.name : id}</span>
                          <button 
                            type="button" 
                            onClick={() => setFormRelatedAssetIds(formRelatedAssetIds.filter(x => x !== id))}
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              color: 'var(--danger)', 
                              cursor: 'pointer', 
                              padding: 0,
                              fontWeight: 800,
                              fontSize: '0.7rem',
                              marginLeft: '2px',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Search Box */}
                <div style={{ position: 'relative', marginBottom: '0.4rem' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="ค้นหาตามรหัสครุภัณฑ์ หรือชื่อครุภัณฑ์..."
                    value={assetSearchQuery}
                    onChange={(e) => setAssetSearchQuery(e.target.value)}
                    style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.78rem' }}
                  />
                </div>

                {/* Asset Scrollable Checkbox List */}
                <div 
                  className="custom-scrollbar"
                  style={{ 
                    maxHeight: '160px', 
                    overflowY: 'auto', 
                    border: '1px solid var(--border)', 
                    borderRadius: '4px', 
                    background: 'var(--bg-primary)',
                    padding: '0.35rem'
                  }}
                >
                  {assets
                    .filter(a => {
                      if (!assetSearchQuery) return true;
                      const q = assetSearchQuery.toLowerCase();
                      return a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
                    })
                    .map(a => {
                      const isChecked = formRelatedAssetIds.includes(a.id);
                      return (
                        <label 
                          key={a.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            padding: '0.3rem 0.45rem', 
                            borderRadius: '3px', 
                            cursor: 'pointer',
                            fontSize: '0.76rem',
                            background: isChecked ? 'rgba(255,255,255,0.03)' : 'transparent',
                            transition: 'background 0.15s ease'
                          }}
                          className="hover-bg-secondary"
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormRelatedAssetIds([...formRelatedAssetIds, a.id]);
                              } else {
                                setFormRelatedAssetIds(formRelatedAssetIds.filter(x => x !== a.id));
                              }
                            }}
                            style={{ width: '14px', height: '14px', margin: 0, cursor: 'pointer' }}
                          />
                          <span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>[{a.id.slice(-6)}]</span>
                          <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{a.department}</span>
                        </label>
                      );
                    })}
                  {assets.filter(a => {
                    if (!assetSearchQuery) return true;
                    const q = assetSearchQuery.toLowerCase();
                    return a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
                  }).length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem', fontSize: '0.75rem' }}>
                      ไม่พบครุภัณฑ์ที่ตรงกับเงื่อนไขค้นหา
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Upload with auto HD compression */}
              <div className="form-group" style={{ border: '1px dashed var(--border)', padding: '0.75rem', borderRadius: '4px' }}>
                <label className="form-label">📷 รูปภาพอะไหล่ (Photo upload)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="spare-part-image"
                    disabled={uploadingImage}
                  />
                  <label 
                    htmlFor="spare-part-image"
                    className="btn btn-ghost btn-sm"
                    style={{ border: '1px solid var(--border)', cursor: 'pointer', margin: 0, padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    {uploadingImage ? 'กำลังประมวลผล HD...' : '📤 เลือกรูปภาพ...'}
                  </label>

                  {formImageUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
                      <img src={formImageUrl} alt="Preview" style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '2px' }} />
                      <span>อัปโหลดเรียบร้อย</span>
                      <button type="button" onClick={() => setFormImageUrl('')} className="btn btn-ghost btn-xs text-danger" style={{ padding: '0.1rem', height: 'auto', border: 'none', background: 'transparent' }}>✕</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">📝 หมายเหตุเพิ่มเติม</label>
                <input 
                  type="text"
                  className="form-input"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="เช่น เก็บสำรองไว้เฉพาะเคสเร่งด่วนเท่านั้น"
                />
              </div>

            </div>

            {/* Actions */}
            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.75rem', flexShrink: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddEditOpen(false)}>ยกเลิก</button>
              <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>💾 บันทึกทะเบียนอะไหล่</button>
            </div>

          </form>
        </div>
      )}

      {/* --- MODAL 2: STOCK RECEIVE (รับเข้าพัสดุ) --- */}
      {isReceiveOpen && selectedPart && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 99999, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
          <form onSubmit={handleReceiveSubmit} className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowUpRight size={18} /> รับเข้าสต็อกพัสดุอะไหล่
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsReceiveOpen(false)} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.6rem 0.85rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '0.85rem' }}>
              <div>อะไหล่: <strong>{selectedPart.name}</strong></div>
              <div>รหัส: <code style={{ color: 'var(--primary)' }}>{selectedPart.partCode}</code> | คงคลังปัจจุบัน: <strong>{selectedPart.quantity}</strong> {selectedPart.unit}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <div className="form-group flex-1">
                <label className="form-label">จำนวนที่นำเข้า *</label>
                <input 
                  type="number"
                  className="form-input"
                  value={txQty}
                  onChange={(e) => setTxQty(Math.max(1, Number(e.target.value)))}
                  min={1}
                  required
                />
              </div>

              <div className="form-group flex-1">
                <label className="form-label">ราคาซื้อต่อหน่วย (฿)</label>
                <input 
                  type="number"
                  className="form-input"
                  value={txUnitPrice}
                  onChange={(e) => setTxUnitPrice(e.target.value)}
                  placeholder="เช่น 1950"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">📅 วันที่รับเข้า</label>
              <input 
                type="date"
                className="form-input"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">🧾 เลขที่ใบสั่งซื้อ / เอกสารอ้างอิง</label>
              <input 
                type="text"
                className="form-input"
                value={txRefDoc}
                onChange={(e) => setTxRefDoc(e.target.value)}
                placeholder="เช่น PO-6908-01 หรือ ใบนำส่งเลขที่..."
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <div className="form-group flex-1">
                <label className="form-label">ร้านค้าคู่ค้า</label>
                <input 
                  type="text"
                  className="form-input"
                  value={txSupplier}
                  onChange={(e) => setTxSupplier(e.target.value)}
                  placeholder="ชื่อร้านค้า"
                />
              </div>

              <div className="form-group flex-1">
                <label className="form-label">ช่องทางติดต่อร้าน</label>
                <input 
                  type="text"
                  className="form-input"
                  value={txSupplierContact}
                  onChange={(e) => setTxSupplierContact(e.target.value)}
                  placeholder="เบอร์โทร/ไลน์"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">📝 หมายเหตุเพิ่มเติม</label>
              <input 
                type="text"
                className="form-input"
                value={txNote}
                onChange={(e) => setTxNote(e.target.value)}
                placeholder="เช่น นำเข้าเก็บคลังพัสดุทดแทนของเดิมที่เบิก"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsReceiveOpen(false)}>ยกเลิก</button>
              <button type="submit" className="btn btn-success btn-sm" style={{ fontWeight: 700 }} disabled={txSubmitting}>
                {txSubmitting ? 'กำลังบันทึก...' : '✓ ยืนยันรับเข้าสต็อก'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- MODAL 3: STOCK CUT (ตัดจ่ายพัสดุ) --- */}
      {isCutOpen && selectedPart && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 99999, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
          <form onSubmit={handleCutSubmit} className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowDownRight size={18} /> ตัดเบิกพัสดุอะไหล่ (ตัดสต็อก)
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsCutOpen(false)} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.6rem 0.85rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '0.85rem' }}>
              <div>อะไหล่: <strong>{selectedPart.name}</strong></div>
              <div>รหัส: <code style={{ color: 'var(--primary)' }}>{selectedPart.partCode}</code> | คงคลังจริง: <strong style={{ color: 'var(--success)' }}>{selectedPart.quantity}</strong> {selectedPart.unit}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <div className="form-group flex-1">
                <label className="form-label">จำนวนที่เบิกจ่าย *</label>
                <input 
                  type="number"
                  className="form-input"
                  value={txQty}
                  onChange={(e) => setTxQty(Math.min(selectedPart.quantity, Math.max(1, Number(e.target.value))))}
                  min={1}
                  max={selectedPart.quantity}
                  required
                />
              </div>

              <div className="form-group flex-1">
                <label className="form-label">📅 วันที่เบิกจ่าย</label>
                <input 
                  type="date"
                  className="form-input"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Target Asset Selection */}
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">🔗 เบิกใช้สำหรับเครื่องมือครุภัณฑ์หลักตัวใด? *</label>
              <select
                className="form-select"
                value={txAssetId}
                onChange={(e) => setTxAssetId(e.target.value)}
                required
                style={{ fontSize: '0.8rem' }}
              >
                <option value="">-- กรุณาเลือกเครื่องครุภัณฑ์ --</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    [{a.id.slice(-6)}] {a.name} ({a.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">🧾 อ้างอิงใบงาน / เหตุผลเบิกจ่าย *</label>
              <input 
                type="text"
                className="form-input"
                value={txRefDoc}
                onChange={(e) => setTxRefDoc(e.target.value)}
                required
                placeholder="เช่น เบิกประกอบใบงาน PM ประจำเดือน ส.ค. 69"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">📝 หมายเหตุอื่น</label>
              <input 
                type="text"
                className="form-input"
                value={txNote}
                onChange={(e) => setTxNote(e.target.value)}
                placeholder="เช่น เปลี่ยนทดแทนอะไหล่ที่หมดอายุขัยการใช้งาน"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsCutOpen(false)}>ยกเลิก</button>
              <button type="submit" className="btn btn-warning btn-sm" style={{ fontWeight: 700 }} disabled={txSubmitting}>
                {txSubmitting ? 'กำลังตัดสต็อก...' : '✕ ตัดจ่ายพัสดุ'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- MODAL 4: TRANSACTION HISTORY (STOCK CARD VIEW) --- */}
      {isHistoryOpen && selectedPart && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 99999, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
          <div className="survey-form-panel glass-panel animate-scale-up" style={{ maxWidth: '820px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem', marginBottom: '1rem', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ClipboardList size={18} color="var(--primary)" /> บัญชีคุมคลังและประวัติการเคลื่อนไหว (Stock Card)
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsHistoryOpen(false)} style={{ padding: '0.25rem', height: 'auto', outline: 'none' }}>✕</button>
            </div>

            {/* Header info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1rem', flexShrink: 0 }}>
              <div>ชื่อพัสดุ: <strong>{selectedPart.name}</strong></div>
              <div>รหัสอ้างอิง: <code>{selectedPart.partCode}</code></div>
              <div>คงคลังปัจจุบัน: <strong>{selectedPart.quantity}</strong> {selectedPart.unit}</div>
              <div>สถานที่จัดเก็บ: <strong>{selectedPart.storageLocation || '-'}</strong></div>
            </div>

            {/* Table */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 1, borderBottom: '2px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '0.5rem', width: '90px' }}>วันที่ทำรายการ</th>
                    <th style={{ padding: '0.5rem', width: '80px', textAlign: 'center' }}>ประเภท</th>
                    <th style={{ padding: '0.5rem', width: '70px', textAlign: 'right' }}>จำนวน</th>
                    <th style={{ padding: '0.5rem', width: '80px', textAlign: 'right' }}>คงเหลือสุทธิ</th>
                    <th style={{ padding: '0.5rem', width: '100px' }}>เอกสารอ้างอิง</th>
                    <th style={{ padding: '0.5rem', width: '100px' }}>ผู้ทำรายการ</th>
                    <th style={{ padding: '0.5rem' }}>รายละเอียด/หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {(!selectedPart.transactions || selectedPart.transactions.length === 0) ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        ยังไม่มีประวัติการเบิกจ่าย/รับเข้าของอะไหล่รายการนี้
                      </td>
                    </tr>
                  ) : (
                    [...selectedPart.transactions]
                      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                      .map(tx => {
                        const targetAsset = assets.find(as => as.id === tx.assetId);
                        return (
                          <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)', background: tx.type === 'in' ? 'rgba(16,185,129,0.02)' : 'rgba(239,68,68,0.02)' }}>
                            <td style={{ padding: '0.5rem' }}>{getThaiDateFormatted(tx.date)}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              <span className={`badge ${tx.type === 'in' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                                {tx.type === 'in' ? '📥 รับเข้า' : '📤 จ่ายออก'}
                              </span>
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, color: tx.type === 'in' ? 'var(--success)' : 'var(--warning)' }}>
                              {tx.type === 'in' ? `+${tx.quantity}` : tx.quantity}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700 }}>
                              {tx.balanceAfter}
                            </td>
                            <td style={{ padding: '0.5rem', fontFamily: 'monospace' }} title={tx.referenceDoc}>
                              {tx.referenceDoc || '-'}
                            </td>
                            <td style={{ padding: '0.5rem' }}>{tx.operator}</td>
                            <td style={{ padding: '0.5rem', fontSize: '0.72rem' }}>
                              {tx.note}
                              {targetAsset && (
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                  🔗 ครุภัณฑ์: [{targetAsset.id.slice(-6)}] {targetAsset.name}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', flexShrink: 0 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsHistoryOpen(false)}>ปิดประวัติ</button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 5: A4 REPORT PRINT PREVIEW --- */}
      {showPrintModal && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 99999, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '1000px', width: '100%', margin: '0 auto 1.5rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10060 }}>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--primary)' }}>🖨️ สั่งพิมพ์เอกสารรายงานคลังอะไหล่ (A4 Stock Balance Report)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>รายงานยอดคงเหลือ บัญชีคุมคลังสะสม และใบสั่งซื้อเตือนสต็อกต่ำกว่าเกณฑ์</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowPrintModal(false)}
              >
                ย้อนกลับ
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                🖨️ สั่งพิมพ์ / PDF
              </button>
            </div>
          </div>

          <div className="print-paper-a4 printable-a4-document" style={{ background: '#ffffff', color: '#000000', maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '2.5rem 3rem', minHeight: '11.28in', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif", fontSize: '13px', lineHeight: '1.6', colorScheme: 'light', borderRadius: '4px' }}>
            <div style={{ textAlign: 'center', position: 'relative', marginBottom: '2rem' }}>
              <div style={{ fontSize: '28px', color: '#000000', marginBottom: '0.5rem' }}>🇹🇭</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#000000', margin: '0.2rem 0' }}>
                รายงานตรวจสอบพัสดุและรายการอะไหล่คงคลัง (Spare Parts Inventory Audit Report)
              </h1>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#333333', margin: '0.2rem 0' }}>
                ระบบจัดการครุภัณฑ์ AMIS (Asset Management Information System)
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#666666', marginTop: '0.25rem' }}>
                ข้อมูล ณ วันที่ {getThaiDateFormatted(new Date().toISOString().split('T')[0])} | 
                ตัวกรองสถานะ: {statusFilter === 'all' ? 'รายการอะไหล่ทั้งหมด' : statusFilter === 'low' ? 'ใบเสนอสั่งซื้ออะไหล่ขาดแคลน (ใกล้หมดคลัง)' : 'รายการอะไหล่ขาดแคลน (สินค้าหมด)'}
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '2px double #333333', margin: '1rem 0 1.5rem 0' }} />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #374151' }}>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db', width: '45px' }}>ลำดับ</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'left', border: '1px solid #d1d5db', width: '110px' }}>รหัสพัสดุอะไหล่</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'left', border: '1px solid #d1d5db' }}>รายการอะไหล่</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'left', border: '1px solid #d1d5db' }}>ตู้จัดเก็บพัสดุ</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db', width: '80px' }}>คงเหลือ</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db', width: '80px' }}>ขั้นต่ำเกณฑ์</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'right', border: '1px solid #d1d5db', width: '90px' }}>ราคาหน่วยละ</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'left', border: '1px solid #d1d5db', width: '160px' }}>ร้านคู่สัญญา / ติดต่อ</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db', width: '85px' }}>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#666666', border: '1px solid #d1d5db' }}>
                      ไม่มีข้อมูลสำหรับออกรายงานตามเงื่อนไขที่กำหนด
                    </td>
                  </tr>
                ) : (
                  filteredParts.map((part, index) => {
                    const isOutOfStock = part.quantity <= 0;
                    const isLowStock = part.quantity <= part.minQuantity && part.quantity > 0;
                    return (
                      <tr key={part.id} style={{ borderBottom: '1px solid #e5e7eb', background: isOutOfStock ? '#fef2f2' : isLowStock ? '#fffbeb' : '#ffffff' }}>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db' }}>{index + 1}</td>
                        <td style={{ padding: '0.5rem 0.4rem', fontFamily: 'monospace', border: '1px solid #d1d5db' }}>{part.partCode}</td>
                        <td style={{ padding: '0.5rem 0.4rem', border: '1px solid #d1d5db' }}>
                          <strong style={{ display: 'block', fontSize: '12px' }}>{part.name}</strong>
                          {part.brand && <span style={{ fontSize: '10px', color: '#666666' }}>แบรนด์: {part.brand} {part.specification && `(${part.specification})`}</span>}
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', border: '1px solid #d1d5db' }}>{part.storageLocation || '-'}</td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db', fontWeight: 800, color: isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#10b981' }}>{part.quantity} {part.unit}</td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db' }}>{part.minQuantity} {part.unit}</td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right', border: '1px solid #d1d5db' }}>{part.unitPrice ? `฿${part.unitPrice.toLocaleString()}` : '-'}</td>
                        <td style={{ padding: '0.5rem 0.4rem', border: '1px solid #d1d5db', fontSize: '11px' }}>
                          <strong>{part.supplier || '-'}</strong>
                          {part.supplierContact && <span style={{ display: 'block', color: '#666666' }}>โทร/ติดต่อ: {part.supplierContact}</span>}
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', border: '1px solid #d1d5db', fontWeight: 700 }}>
                          {isOutOfStock ? (
                            <span style={{ color: '#ef4444' }}>🔴 ขาดแคลน</span>
                          ) : isLowStock ? (
                            <span style={{ color: '#f59e0b' }}>🟡 สั่งด่วน</span>
                          ) : (
                            <span style={{ color: '#10b981' }}>🟢 ปกติ</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Document Verification Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '4rem', fontSize: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '3.5rem' }}>เจ้าหน้าที่ตรวจสอบพัสดุและคลังอะไหล่</p>
                <div style={{ borderBottom: '1px dashed #666666', width: '220px', margin: '0 auto' }}></div>
                <p style={{ marginTop: '0.4rem' }}>((ลงชื่อ) ......................................................)</p>
                <p style={{ color: '#555555', fontSize: '11px', marginTop: '0.1rem' }}>ตำแหน่ง เจ้าหน้าที่บริหารงานพัสดุ</p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '3.5rem' }}>หัวหน้าส่วนงานส่งซ่อมบำรุงพัสดุและอนุมัติใบสั่งซื้อ</p>
                <div style={{ borderBottom: '1px dashed #666666', width: '220px', margin: '0 auto' }}></div>
                <p style={{ marginTop: '0.4rem' }}>((ลงชื่อ) ......................................................)</p>
                <p style={{ color: '#555555', fontSize: '11px', marginTop: '0.1rem' }}>ตำแหน่ง ผู้อำนวยการส่วนบริการ/หัวหน้าวิศวกรโรงพยาบาล</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- UNIVERSAL MEDIA LIGHTBOX VIEWER --- */}
      {lightboxUrl && (
        <div 
          className="print-preview-overlay animate-fade-in" 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.94)', zIndex: 100050, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setLightboxUrl(null)}
        >
          <div 
            style={{ 
              position: 'absolute', 
              top: '1rem', 
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '650px',
              display: 'flex', 
              flexDirection: 'column',
              background: 'rgba(20, 24, 33, 0.95)', 
              backdropFilter: 'blur(16px)', 
              border: '1px solid rgba(255, 255, 255, 0.18)', 
              padding: '0.75rem 1.25rem', 
              borderRadius: 'var(--radius-md)', 
              zIndex: 10, 
              color: '#fff', 
              gap: '0.6rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem', width: '100%' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', wordBreak: 'break-all' }}>
                🔍 {lightboxTitle || 'รูปภาพพรีวิวหลักฐานอะไหล่'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', width: '100%' }}>
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = lightboxUrl;
                  link.download = `AMIS_SparePart_${lightboxTitle.replace(/\s+/g, '_')}.jpg`;
                  link.click();
                }}
                style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.55rem', height: 'auto' }}
              >
                ⬇️ ดาวน์โหลด
              </button>
              <button 
                type="button" 
                className="btn btn-danger btn-sm"
                onClick={() => setLightboxUrl(null)}
                style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.55rem', height: 'auto', background: 'var(--danger)' }}
              >
                ✕ ปิดหน้าต่าง
              </button>
            </div>
          </div>

          <div 
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '7.5rem 1rem 1rem 1rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={lightboxUrl} 
              alt={lightboxTitle}
              style={{ maxWidth: '90vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }} 
            />
          </div>
        </div>
      )}

    </div>
  );
};
