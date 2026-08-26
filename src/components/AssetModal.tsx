import React, { useState, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { 
  X, 
  Calendar, 
  MapPin, 
  Building, 
  User, 
  FileText, 
  Info, 
  History, 
  Wrench, 
  QrCode,
  Download,
  AlertCircle,
  Package,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Search,
  Box,
  Trash2,
  Edit3,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ZoomIn,
  Eye,
  Barcode
} from 'lucide-react';
import { 
  Asset, 
  AuditTrail, 
  SurveyRecord, 
  RepairCase, 
  PMSchedule, 
  UserAccount, 
  SparePart, 
  SparePartTransaction,
  loadSpareParts,
  saveSpareParts
} from '../utils/mockData';
import { updateAsset, addAuditTrail } from '../services/dbService';

interface AssetModalProps {
  asset: Asset;
  onClose: () => void;
  onEditClick: (asset: Asset) => void;
  audits: AuditTrail[];
  repairs: RepairCase[];
  surveys: SurveyRecord[];
  schedules?: PMSchedule[];
  currentUser?: UserAccount | null;
  onRefreshData?: () => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  asset,
  onClose,
  onEditClick,
  audits,
  repairs,
  surveys,
  schedules = [],
  currentUser = null,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'repairs' | 'surveys' | 'barcode' | 'spare_parts'>('info');
  const [noteText, setNoteText] = useState(asset.note || '');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Spare Parts & Stock Card State
  const [allSpareParts, setAllSpareParts] = useState<SparePart[]>(() => loadSpareParts());
  const [partSearchQuery, setPartSearchQuery] = useState('');
  const [partFilterStatus, setPartFilterStatus] = useState<'all' | 'normal' | 'low' | 'out'>('all');
  
  // Modals for Spare Parts
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  
  // Add/Edit Form Fields
  const [formPartCode, setFormPartCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formSpec, setFormSpec] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formQty, setFormQty] = useState<number>(1);
  const [formMinQty, setFormMinQty] = useState<number>(1);
  const [formUnit, setFormUnit] = useState('ชิ้น');
  const [formUnitPrice, setFormUnitPrice] = useState<number | string>('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formSupplierContact, setFormSupplierContact] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Stock In / Out Modals
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [selectedPartForIn, setSelectedPartForIn] = useState<SparePart | null>(null);
  const [inQty, setInQty] = useState<number>(1);
  const [inRef, setInRef] = useState('');
  const [inPrice, setInPrice] = useState<string>('');
  const [inOperator, setInOperator] = useState(currentUser?.name || 'เจ้าหน้าที่พัสดุ');
  const [inNote, setInNote] = useState('');

  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [selectedPartForOut, setSelectedPartForOut] = useState<SparePart | null>(null);
  const [outQty, setOutQty] = useState<number>(1);
  const [outRef, setOutRef] = useState('');
  const [outOperator, setOutOperator] = useState(currentUser?.name || 'ช่างซ่อมบำรุง');
  const [outNote, setOutNote] = useState('');

  // Stock Card History & Print Modal
  const [viewingStockCardPart, setViewingStockCardPart] = useState<SparePart | null>(null);
  const [isPrintStockCardOpen, setIsPrintStockCardOpen] = useState(false);
  const [printCardTargetPart, setPrintCardTargetPart] = useState<SparePart | null>(null);

  // Lightbox for Spare Part Images
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  // Filter lists for this specific asset
  const assetAudits = audits.filter(a => a.assetId === asset.id);
  const assetRepairs = repairs.filter(r => r.assetId === asset.id);
  const assetSurveys = surveys.filter(s => s.assetId === asset.id);
  const assetPMSchedules = schedules.filter(s => s.assetId === asset.id);
  const assetSpareParts = allSpareParts.filter(p => p.assetId === asset.id);

  // Filtered spare parts by search query & stock status
  const filteredSpareParts = assetSpareParts.filter(p => {
    const matchesSearch = 
      p.partCode.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
      (p.specification && p.specification.toLowerCase().includes(partSearchQuery.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(partSearchQuery.toLowerCase())) ||
      (p.storageLocation && p.storageLocation.toLowerCase().includes(partSearchQuery.toLowerCase())) ||
      (p.supplier && p.supplier.toLowerCase().includes(partSearchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (partFilterStatus === 'normal') return p.quantity > p.minQuantity;
    if (partFilterStatus === 'low') return p.quantity > 0 && p.quantity <= p.minQuantity;
    if (partFilterStatus === 'out') return p.quantity <= 0;
    return true;
  });

  // Calculate spare parts statistics
  const totalSparePartItems = assetSpareParts.reduce((acc, p) => acc + p.quantity, 0);
  const lowStockSpareParts = assetSpareParts.filter(p => p.quantity <= p.minQuantity);
  const totalSparePartsValue = assetSpareParts.reduce((acc, p) => acc + (p.quantity * (p.unitPrice || 0)), 0);

  // Handlers for Spare Parts
  const handleOpenAddPart = () => {
    setEditingPart(null);
    setFormPartCode(`SP-${asset.id.slice(-4)}-${String(assetSpareParts.length + 1).padStart(2, '0')}`);
    setFormName('');
    setFormSpec('');
    setFormBrand('');
    setFormLocation(`ตู้เก็บอะไหล่ ${asset.location || 'อาคารซ่อมบำรุง'}`);
    setFormQty(1);
    setFormMinQty(1);
    setFormUnit('ชิ้น');
    setFormUnitPrice('');
    setFormSupplier(asset.source || '');
    setFormSupplierContact('');
    setFormNotes('');
    setFormImageUrl('');
    setIsAddPartOpen(true);
  };

  const handleOpenEditPart = (p: SparePart) => {
    setEditingPart(p);
    setFormPartCode(p.partCode);
    setFormName(p.name);
    setFormSpec(p.specification || '');
    setFormBrand(p.brand || '');
    setFormLocation(p.storageLocation || '');
    setFormQty(p.quantity);
    setFormMinQty(p.minQuantity);
    setFormUnit(p.unit);
    setFormUnitPrice(p.unitPrice !== undefined ? p.unitPrice : '');
    setFormSupplier(p.supplier || '');
    setFormSupplierContact(p.supplierContact || '');
    setFormNotes(p.notes || '');
    setFormImageUrl(p.imageUrl || '');
    setIsAddPartOpen(true);
  };

  const handleSavePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPartCode.trim() || !formName.trim()) {
      alert('กรุณากรอกรหัสอะไหล่และชื่ออะไหล่');
      return;
    }

    const priceNum = formUnitPrice ? Number(formUnitPrice) : undefined;
    const nowISO = new Date().toISOString();

    if (editingPart) {
      // Update existing part
      const updated = allSpareParts.map(p => {
        if (p.id === editingPart.id) {
          return {
            ...p,
            partCode: formPartCode.trim(),
            name: formName.trim(),
            specification: formSpec.trim() || undefined,
            brand: formBrand.trim() || undefined,
            storageLocation: formLocation.trim() || undefined,
            quantity: Number(formQty) || 0,
            minQuantity: Number(formMinQty) || 1,
            unit: formUnit.trim() || 'ชิ้น',
            unitPrice: priceNum,
            supplier: formSupplier.trim() || undefined,
            supplierContact: formSupplierContact.trim() || undefined,
            notes: formNotes.trim() || undefined,
            imageUrl: formImageUrl.trim() || undefined,
            updatedAt: nowISO
          };
        }
        return p;
      });
      setAllSpareParts(updated);
      saveSpareParts(updated);
    } else {
      // Create new part with initial Stock In transaction
      const newPartId = `sp-${Date.now()}`;
      const initQty = Number(formQty) || 0;
      const initialTx: SparePartTransaction[] = initQty > 0 ? [
        {
          id: `tx-${Date.now()}`,
          partId: newPartId,
          assetId: asset.id,
          date: new Date().toISOString().split('T')[0],
          type: 'in',
          quantity: initQty,
          balanceAfter: initQty,
          unitPrice: priceNum,
          totalPrice: priceNum ? priceNum * initQty : undefined,
          referenceDoc: 'ยอดยกมาเริ่มต้น / รับเข้าบันทึกข้อมูล',
          operator: currentUser?.name || 'เจ้าหน้าที่พัสดุ',
          note: 'ลงทะเบียนอะไหล่สำรองเข้าสู่ระบบ',
          createdAt: nowISO
        }
      ] : [];

      const newPart: SparePart = {
        id: newPartId,
        assetId: asset.id,
        partCode: formPartCode.trim(),
        name: formName.trim(),
        specification: formSpec.trim() || undefined,
        brand: formBrand.trim() || undefined,
        storageLocation: formLocation.trim() || undefined,
        quantity: initQty,
        minQuantity: Number(formMinQty) || 1,
        unit: formUnit.trim() || 'ชิ้น',
        unitPrice: priceNum,
        supplier: formSupplier.trim() || undefined,
        supplierContact: formSupplierContact.trim() || undefined,
        notes: formNotes.trim() || undefined,
        imageUrl: formImageUrl.trim() || undefined,
        updatedAt: nowISO,
        transactions: initialTx
      };

      const updated = [newPart, ...allSpareParts];
      setAllSpareParts(updated);
      saveSpareParts(updated);
    }

    setIsAddPartOpen(false);
  };

  const handleDeletePart = (partId: string) => {
    const part = allSpareParts.find(p => p.id === partId);
    if (!part) return;
    if (confirm(`คุณต้องการลบรายการอะไหล่ "${part.name}" (${part.partCode}) ใช่หรือไม่?`)) {
      const updated = allSpareParts.filter(p => p.id !== partId);
      setAllSpareParts(updated);
      saveSpareParts(updated);
      if (viewingStockCardPart?.id === partId) {
        setViewingStockCardPart(null);
      }
    }
  };

  // Open Stock In
  const handleOpenStockIn = (p: SparePart) => {
    setSelectedPartForIn(p);
    setInQty(1);
    setInRef(`PO-${new Date().getFullYear() + 543}-01`);
    setInPrice(p.unitPrice ? String(p.unitPrice) : '');
    setInOperator(currentUser?.name || 'เจ้าหน้าที่พัสดุ');
    setInNote('');
    setIsStockInOpen(true);
  };

  const handleSaveStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartForIn || inQty <= 0) {
      alert('กรุณาระบุจำนวนที่รับเข้ามากกว่า 0');
      return;
    }

    const priceNum = inPrice ? Number(inPrice) : selectedPartForIn.unitPrice;
    const newQty = selectedPartForIn.quantity + inQty;
    const nowISO = new Date().toISOString();

    const newTx: SparePartTransaction = {
      id: `tx-${Date.now()}`,
      partId: selectedPartForIn.id,
      assetId: asset.id,
      date: new Date().toISOString().split('T')[0],
      type: 'in',
      quantity: inQty,
      balanceAfter: newQty,
      unitPrice: priceNum,
      totalPrice: priceNum ? priceNum * inQty : undefined,
      referenceDoc: inRef.trim() || 'ใบสั่งซื้อ/รับเข้าสต็อก',
      operator: inOperator.trim() || 'เจ้าหน้าที่พัสดุ',
      note: inNote.trim() || 'รับอะไหล่เข้าคลัง',
      createdAt: nowISO
    };

    const updated = allSpareParts.map(p => {
      if (p.id === selectedPartForIn.id) {
        const txList = p.transactions || [];
        return {
          ...p,
          quantity: newQty,
          unitPrice: priceNum || p.unitPrice,
          updatedAt: nowISO,
          transactions: [newTx, ...txList]
        };
      }
      return p;
    });

    setAllSpareParts(updated);
    saveSpareParts(updated);
    setIsStockInOpen(false);

    if (viewingStockCardPart?.id === selectedPartForIn.id) {
      const upPart = updated.find(p => p.id === selectedPartForIn.id);
      if (upPart) setViewingStockCardPart(upPart);
    }
  };

  // Open Stock Out
  const handleOpenStockOut = (p: SparePart) => {
    if (p.quantity <= 0) {
      alert(`อะไหล่ "${p.name}" หมดสต็อกแล้ว ไม่สามารถเบิกจ่ายได้ กรุณารับเข้าสต็อกก่อน`);
      return;
    }
    setSelectedPartForOut(p);
    setOutQty(1);
    setOutRef(`PM ประจำรอบ ${new Date().toLocaleDateString('th-TH', { month: 'short', year: '2-digit' })}`);
    setOutOperator(currentUser?.name || 'ช่างซ่อมบำรุง');
    setOutNote('');
    setIsStockOutOpen(true);
  };

  const handleSaveStockOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartForOut || outQty <= 0) {
      alert('กรุณาระบุจำนวนที่เบิกใช้มากกว่า 0');
      return;
    }

    if (outQty > selectedPartForOut.quantity) {
      alert(`จำนวนที่ขอเบิก (${outQty} ${selectedPartForOut.unit}) เกินกว่ายอดคงเหลือในคลัง (${selectedPartForOut.quantity} ${selectedPartForOut.unit})`);
      return;
    }

    const newQty = selectedPartForOut.quantity - outQty;
    const nowISO = new Date().toISOString();

    const newTx: SparePartTransaction = {
      id: `tx-${Date.now()}`,
      partId: selectedPartForOut.id,
      assetId: asset.id,
      date: new Date().toISOString().split('T')[0],
      type: 'out',
      quantity: -outQty,
      balanceAfter: newQty,
      unitPrice: selectedPartForOut.unitPrice,
      totalPrice: selectedPartForOut.unitPrice ? selectedPartForOut.unitPrice * outQty : undefined,
      referenceDoc: outRef.trim() || 'เบิกใช้งานซ่อมบำรุง',
      operator: outOperator.trim() || 'ช่างซ่อมบำรุง',
      note: outNote.trim() || 'เบิกใช้อะไหล่กับครุภัณฑ์',
      createdAt: nowISO
    };

    const updated = allSpareParts.map(p => {
      if (p.id === selectedPartForOut.id) {
        const txList = p.transactions || [];
        return {
          ...p,
          quantity: newQty,
          updatedAt: nowISO,
          transactions: [newTx, ...txList]
        };
      }
      return p;
    });

    setAllSpareParts(updated);
    saveSpareParts(updated);
    setIsStockOutOpen(false);

    if (viewingStockCardPart?.id === selectedPartForOut.id) {
      const upPart = updated.find(p => p.id === selectedPartForOut.id);
      if (upPart) setViewingStockCardPart(upPart);
    }
  };

  // Open Lightbox
  const handleOpenPartLightbox = (url: string, title?: string) => {
    if (!url) return;
    setLightboxUrl(url);
    setLightboxTitle(title || 'รูปภาพอะไหล่สำรอง (HD)');
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

  // Open Print Stock Card
  const handleOpenPrintStockCard = (targetPart?: SparePart) => {
    setPrintCardTargetPart(targetPart || null);
    setIsPrintStockCardOpen(true);
  };

  // Status badging styles
  const statusColors: Record<string, string> = {
    'ใช้งานได้': 'badge-success',
    'ชำรุด': 'badge-danger',
    'รอจำหน่าย': 'badge-warning',
    'ขอป้ายรหัสใหม่': 'badge-info',
    'รอโอน': 'badge-primary',
    'อื่นๆ': 'badge-muted'
  };

  const handleDownloadBarcode = () => {
    const svg = document.getElementById(`barcode-svg-${asset.id}`);
    if (svg) {
      const svgString = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 450;
        canvas.height = 200;
        const context = canvas.getContext('2d');
        
        if (context) {
          // Draw white card background
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, 450, 200);
          
          // Draw border
          context.strokeStyle = '#cbd5e1';
          context.lineWidth = 4;
          context.strokeRect(4, 4, 442, 192);

          // Draw plus sign (+) and asset name
          context.fillStyle = '#0f172a';
          context.font = 'bold 24px "Inter", "Noto Sans Thai", sans-serif';
          context.textAlign = 'left';
          context.fillText('+', 20, 40);

          context.font = 'bold 16px "Inter", "Noto Sans Thai", sans-serif';
          const maxNameWidth = 380;
          let displayName = asset.name;
          if (context.measureText(displayName).width > maxNameWidth) {
            while (context.measureText(displayName + '...').width > maxNameWidth && displayName.length > 0) {
              displayName = displayName.substring(0, displayName.length - 1);
            }
            displayName += '...';
          }
          context.fillText(displayName, 45, 38);

          // Draw dotted separator line
          context.strokeStyle = '#94a3b8';
          context.lineWidth = 1;
          context.setLineDash([4, 4]);
          context.beginPath();
          context.moveTo(20, 52);
          context.lineTo(430, 52);
          context.stroke();
          context.setLineDash([]); // Reset line dash

          // Draw Barcode Image (centered)
          context.drawImage(image, 35, 65, 380, 85);
          
          // Draw Asset ID under barcode (centered)
          context.fillStyle = '#0f172a';
          context.font = 'bold 18px monospace';
          context.textAlign = 'center';
          context.fillText(asset.id, 225, 175);

          // Trigger Download
          const pngURL = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngURL;
          downloadLink.download = `BarcodeLabel_${asset.id}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    }
  };

  useEffect(() => {
    if (activeTab === 'barcode') {
      const svgEl = document.getElementById(`barcode-svg-${asset.id}`);
      if (svgEl) {
        try {
          JsBarcode(svgEl, asset.id, {
            format: 'CODE128',
            displayValue: false,
            height: 45,
            width: 1.6,
            margin: 5,
            background: '#ffffff',
            lineColor: '#000000'
          });
        } catch (err) {
          console.error('Barcode generation failed:', err);
        }
      }
    }
  }, [asset.id, activeTab]);

  useEffect(() => {
    setNoteText(asset.note || '');
  }, [asset.note, asset.id]);

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    try {
      await updateAsset(asset.id, { note: noteText });
      await addAuditTrail({
        assetId: asset.id,
        assetName: asset.name,
        action: 'edit',
        operator: currentUser?.name || 'เจ้าหน้าที่พัสดุ',
        details: `บันทึกหมายเหตุ/โน้ตพิเศษ: "${noteText}"`,
        timestamp: new Date().toISOString()
      });
      alert('บันทึกโน้ตพัสดุเรียบร้อยแล้ว');
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Failed to save note:', err);
      alert('บันทึกโน้ตไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSavingNote(false);
    }
  };



  return (
    <div className="modal-backdrop">
      <div className="modal-card glass-panel animate-fade-in">
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className={`badge ${statusColors[asset.status] || 'badge-muted'}`}>
              {asset.status}
            </span>
            <h2>{asset.name}</h2>
            <span className="modal-asset-id">รหัส: <code>{asset.id}</code></span>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close details">
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab-btn ${activeTab === 'info' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <Info size={16} /> รายละเอียดครุภัณฑ์
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'history' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} /> ประวัติกิจกรรม ({assetAudits.length})
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'repairs' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('repairs')}
          >
            <Wrench size={16} /> ประวัติซ่อมบำรุง ({assetRepairs.length + assetPMSchedules.length})
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'surveys' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('surveys')}
          >
            <QrCode size={16} /> ผลการตรวจนับ ({assetSurveys.length})
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'barcode' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('barcode')}
          >
            <Barcode size={16} /> บาร์โค้ด & QR
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'spare_parts' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('spare_parts')}
            style={{ position: 'relative' }}
          >
            <Package size={16} /> อะไหล่สำรอง (Stock Card) ({assetSpareParts.length})
            {lowStockSpareParts.length > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.35rem', borderRadius: '10px', marginLeft: '0.25rem' }}>
                {lowStockSpareParts.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Dynamic Content Body */}
        <div className="modal-body">
          
          {/* TAB 1: General Details */}
          {activeTab === 'info' && (
            <div className="tab-info-layout">
              {/* Asset Picture & QR Label Card */}
              <div className="info-visuals-panel">
                <div className="info-image-container">
                  <img 
                    src={asset.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60'} 
                    alt={asset.name} 
                    className="info-asset-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
                    }}
                  />
                </div>
                
                {/* Area for saving misc info / notes */}
                <div style={{ marginTop: '0.85rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    📝 บันทึกข้อมูลโน้ต / หมายเหตุพัสดุ:
                  </label>
                  <textarea
                    className="form-input"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="พิมพ์โน้ตส่วนตัว ข้อควรระวัง หรือรายละเอียดเพิ่มเติมของครุภัณฑ์ชิ้นนี้..."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      fontSize: '0.75rem',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      resize: 'vertical',
                      lineHeight: '1.4'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-xs"
                    onClick={handleSaveNote}
                    disabled={isSavingNote}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.72rem',
                      height: 'auto'
                    }}
                  >
                    {isSavingNote ? '⏳ กำลังบันทึก...' : '💾 บันทึกโน้ตพัสดุ'}
                  </button>
                </div>
              </div>

              {/* Data Properties List */}
              <div className="info-fields-panel">
                <div className="detail-row">
                  <div className="detail-icon"><Calendar size={18} /></div>
                  <div className="detail-content">
                    <span className="detail-label">วันที่ตรวจรับเข้ามา</span>
                    <span className="detail-value">{asset.receivedDate || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-icon"><FileText size={18} /></div>
                  <div className="detail-content">
                    <span className="detail-label">ผู้จำหน่าย / ผู้จัดซื้อ / ผู้บริจาค</span>
                    <span className="detail-value">{asset.source || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-icon"><MapPin size={18} /></div>
                  <div className="detail-content">
                    <span className="detail-label">สถานที่ติดตั้งใช้งาน</span>
                    <span className="detail-value">{asset.location || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-icon"><Building size={18} /></div>
                  <div className="detail-content">
                    <span className="detail-label">หน่วยงานจัดซื้อจัดจ้าง</span>
                    <span className="detail-value">{asset.department || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-icon"><User size={18} /></div>
                  <div className="detail-content">
                    <span className="detail-label">ผู้รับผิดชอบการดูแลรักษา</span>
                    <span className="detail-value">{asset.responsiblePerson || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                {asset.note && (
                  <div className="detail-note-box">
                    <h4>📝 หมายเหตุคำอธิบาย:</h4>
                    <p>{asset.note}</p>
                  </div>
                )}

                <div className="modal-actions-footer">
                  <button className="btn btn-secondary w-full" onClick={() => onEditClick(asset)}>
                    แก้ไขฐานข้อมูลครุภัณฑ์นี้ (Module 6)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Specific Audit Trail of logs */}
          {activeTab === 'history' && (
            <div className="modal-logs-list">
              {assetAudits.length === 0 ? (
                <div className="empty-tab-state">
                  <AlertCircle size={28} />
                  <p>ไม่มีประวัติกิจกรรมของครุภัณฑ์นี้ในระบบ</p>
                </div>
              ) : (
                assetAudits.map((item) => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-meta">
                        <span className="timeline-operator">{item.operator}</span>
                        <span className="timeline-time">
                          {new Date(item.timestamp).toLocaleString('th-TH')}
                        </span>
                      </div>
                      <h4 className="timeline-title">
                        {item.action === 'create' ? 'เพิ่มทรัพย์สินเข้าใหม่' :
                         item.action === 'edit' ? 'แก้ไขข้อมูล' :
                         item.action === 'dispose' ? 'ทำแทงจำหน่าย' :
                         item.action === 'transfer' ? 'โอนย้ายสถานที่' :
                         item.action === 'survey' ? 'แสกนสำรวจตรวจนับ' : 'อื่น ๆ'}
                      </h4>
                      <p className="timeline-desc">{item.details}</p>
                      
                      {item.changes && (
                        <div className="timeline-changes">
                          {Object.keys(item.changes).map(field => (
                            <div key={field} className="change-field-row">
                              <code>{field}</code>: 
                              <span className="old-val">{String(item.changes?.[field].old || 'ไม่มี')}</span> 
                              ➜ 
                              <span className="new-val">{String(item.changes?.[field].new || 'ไม่มี')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Repair & Maintenance cases list */}
          {activeTab === 'repairs' && (
            <div className="modal-repairs-layout" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              
              {/* SECTION A: Preventive Maintenance (PM) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} /> 🔧 ประวัติการบำรุงรักษาเชิงป้องกัน (PM)
                </h4>
                
                {assetPMSchedules.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.25rem 0 0.75rem 0.5rem' }}>
                    ไม่มีประวัติการบำรุงรักษาเชิงป้องกัน (PM)
                  </p>
                ) : (
                  assetPMSchedules.map((item) => {
                    let statusColor = 'var(--warning)';
                    let statusLabel = 'รอดำเนินการ';
                    if (item.status === 'completed') {
                      statusColor = 'var(--success)';
                      statusLabel = 'เสร็จสมบูรณ์';
                    } else if (item.status === 'postponed') {
                      statusColor = '#d97706';
                      statusLabel = 'เลื่อนการตรวจ';
                    } else if (item.status === 'awaiting_repair') {
                      statusColor = 'var(--danger)';
                      statusLabel = 'พบปัญหา/รอซ่อม';
                    }

                    const formatThaiDate = (dateStr: string) => {
                      if (!dateStr) return '';
                      const parts = dateStr.split('-');
                      if (parts.length !== 3) return dateStr;
                      const year = parseInt(parts[0]) + 543;
                      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                      const month = months[parseInt(parts[1]) - 1];
                      const day = parseInt(parts[2]);
                      return `${day} ${month} ${year}`;
                    };

                    return (
                      <div key={item.id} className="repair-log-card" style={{ padding: '0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span className="badge" style={{ background: statusColor, color: '#fff', fontSize: '0.675rem', padding: '0.15rem 0.4rem' }}>
                            {statusLabel}
                          </span>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            รอบกำหนด PM: {formatThaiDate(item.plannedDate)}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {item.completedDate && <div>📅 <strong>วันที่ดำเนินการจริง:</strong> {formatThaiDate(item.completedDate)}</div>}
                          {item.operator && <div>👤 <strong>ผู้ปฏิบัติงาน:</strong> {item.operator}</div>}
                          {item.details && <div>📝 <strong>รายละเอียดตรวจเช็ค:</strong> <span style={{ whiteSpace: 'pre-line' }}>{item.details}</span></div>}
                          {item.notes && <div>💬 <strong>หมายเหตุเพิ่มเติม:</strong> {item.notes}</div>}
                          {item.nextPMNotes && <div style={{ color: '#d97706' }}>⏰ <strong>โน๊ตฝากถึงรอบถัดไป:</strong> {item.nextPMNotes}</div>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* SECTION B: Corrective Maintenance (CM) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Wrench size={14} /> 🛠️ ประวัติการแจ้งซ่อมครุภัณฑ์ (CM)
                </h4>
                
                {assetRepairs.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.25rem 0 0 0.5rem' }}>
                    ไม่มีประวัติการส่งซ่อมครุภัณฑ์ (CM)
                  </p>
                ) : (
                  assetRepairs.map((item) => (
                    <div key={item.id} className="repair-log-card" style={{ padding: '0.8rem' }}>
                      <div className="repair-log-header" style={{ marginBottom: '0.4rem' }}>
                        <span className={`badge ${
                          item.status === 'open' ? 'badge-danger' : 
                          item.status === 'sent' ? 'badge-warning' : 'badge-success'
                        }`} style={{ fontSize: '0.675rem', padding: '0.15rem 0.4rem' }}>
                          {item.status === 'open' ? 'เคสใหม่' : 
                           item.status === 'sent' ? 'ส่งช่างซ่อม' : 'ปิดงานสำเร็จ'}
                        </span>
                        <span className="repair-log-id">รหัสซ่อม: <code>{item.id}</code></span>
                      </div>
                      
                      <div className="repair-log-desc" style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div><strong>อาการชำรุด:</strong> {item.symptom}</div>
                        <div><strong>ผู้แจ้งซ่อม:</strong> {item.operator} ({item.dateOpened})</div>
                        
                        {item.repairCompany && (
                          <div><strong>ร้านที่ส่งซ่อม:</strong> {item.repairCompany} ({item.contactPerson || '-'})</div>
                        )}
                        
                        {item.dateReceived && (
                          <div className="return-note" style={{ marginTop: '0.15rem' }}>
                            ✅ <strong>รับของคืนเมื่อ:</strong> {item.dateReceived}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 4: Surveys and scanning logs */}
          {activeTab === 'surveys' && (
            <div className="modal-surveys-layout">
              {assetSurveys.length === 0 ? (
                <div className="empty-tab-state">
                  <AlertCircle size={28} />
                  <p>ยังไม่มีการตรวจนับครุภัณฑ์นี้ผ่านระบบมือถือ</p>
                </div>
              ) : (
                assetSurveys.map((item) => (
                  <div key={item.id} className="survey-log-row">
                    <div className="survey-log-bullet"></div>
                    <div className="survey-log-text">
                      <div className="survey-log-header-info">
                        <span className="survey-log-op">สำรวจพบโดย {item.operator}</span>
                        <span className="survey-log-time">
                          {new Date(item.timestamp).toLocaleString('th-TH')}
                        </span>
                      </div>
                      <p className="survey-log-status">
                        ตรวจพบสถานะคือ 
                        <span className={`badge ${
                          item.status === 'ใช้งานได้' ? 'badge-success' : 'badge-danger'
                        }`} style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}>
                          {item.status}
                        </span>
                      </p>
                      
                      {item.imageUrl && (
                        <div className="survey-attached-pic">
                          <span>รูปแนบการตรวจสอบสภาพ:</span>
                          <img src={item.imageUrl} alt="attached survey proof" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: Barcode & QR */}
          {activeTab === 'barcode' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem 1rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>🏷️ ป้ายสติกเกอร์รหัสบาร์โค้ดครุภัณฑ์</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ท่านสามารถดาวน์โหลดไฟล์รูปภาพป้ายบาร์โค้ดนี้ เพื่อนำไปสั่งพิมพ์และติดที่ตัวเครื่องครุภัณฑ์จริงสำหรับการใช้งานกับระบบสแกนตรวจสอบสภาพพัสดุ
                </p>
              </div>

              <div className="barcode-badge-card" style={{ background: '#ffffff', color: '#000000', padding: '1.5rem', border: '2px solid #cbd5e1', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', maxWidth: '340px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                {/* Top: Plus sign and asset name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderBottom: '1.5px dashed #cbd5e1', paddingBottom: '0.5rem', width: '100%' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>+</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' }} title={asset.name}>
                    {asset.name}
                  </span>
                </div>

                {/* Middle: Barcode SVG rendered by JsBarcode */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#ffffff', padding: '0.5rem 0' }}>
                  <svg id={`barcode-svg-${asset.id}`} style={{ maxHeight: '70px', width: '100%' }}></svg>
                </div>

                {/* Bottom: Asset ID */}
                <div style={{ textAlign: 'center', fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a', letterSpacing: '0.05em' }}>
                  {asset.id}
                </div>

                {/* Download Button */}
                <button 
                  className="btn btn-primary" 
                  onClick={handleDownloadBarcode} 
                  style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', width: '100%', fontSize: '0.8rem' }}
                >
                  <Download size={14} /> ดาวน์โหลดภาพป้ายบาร์โค้ด
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Spare Parts & Stock Card (อะไหล่สำรองและบัญชีคุมสต็อก) */}
          {activeTab === 'spare_parts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Top Statistics KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>รายการอะไหล่ทั้งหมด</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{assetSpareParts.length} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>รายการ</span></div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Box size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>ยอดคงคลังรวม</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>{totalSparePartItems} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>ชิ้น/หน่วย</span></div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', border: lowStockSpareParts.length > 0 ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: lowStockSpareParts.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.12)', color: lowStockSpareParts.length > 0 ? 'var(--danger)' : 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: lowStockSpareParts.length > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 700 }}>
                      {lowStockSpareParts.length > 0 ? '⚠️ อะไหล่ใกล้หมดสต็อก' : 'สถานะสต็อกขั้นต่ำ'}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: lowStockSpareParts.length > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                      {lowStockSpareParts.length} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>รายการ</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>฿</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>มูลค่าอะไหล่คงคลัง</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {totalSparePartsValue.toLocaleString('th-TH')} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>บาท</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar & Search Filters */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                {/* Search & Status Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="ค้นหารหัสอะไหล่, ชื่อ, สเปค, ตู้จัดเก็บ หรือร้านค้า..." 
                      value={partSearchQuery}
                      onChange={(e) => setPartSearchQuery(e.target.value)}
                      style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button 
                      type="button" 
                      className={`btn btn-xs ${partFilterStatus === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setPartFilterStatus('all')}
                      style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                    >
                      ทั้งหมด ({assetSpareParts.length})
                    </button>
                    <button 
                      type="button" 
                      className={`btn btn-xs ${partFilterStatus === 'low' ? 'btn-danger' : 'btn-ghost'}`}
                      onClick={() => setPartFilterStatus('low')}
                      style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', color: partFilterStatus === 'low' ? '#fff' : 'var(--danger)' }}
                      title="แสดงเฉพาะอะไหล่ที่สต็อกเหลือน้อยกว่าหรือเท่ากับจุดเตือน"
                    >
                      ⚠️ ใกล้หมด ({lowStockSpareParts.length})
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenPrintStockCard()}
                    style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem' }}
                    title="พิมพ์รายงาน Stock Card บัญชีคุมอะไหล่อุปกรณ์นี้ลงกระดาษ A4"
                  >
                    <Printer size={14} /> 🖨️ พิมพ์ Stock Card
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={handleOpenAddPart}
                    style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', fontWeight: 700 }}
                  >
                    <Plus size={15} /> + เพิ่มอะไหล่ใหม่
                  </button>
                </div>
              </div>

              {/* Spare Parts Grid / Cards */}
              {filteredSpareParts.length === 0 ? (
                <div className="empty-tab-state" style={{ padding: '3rem 1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                  <Package size={44} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>ยังไม่มีข้อมูลอะไหล่สำรองสำหรับครุภัณฑ์ชิ้นนี้</p>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {partSearchQuery ? 'ไม่พบรายการที่ตรงกับคำค้นหา' : 'ท่านสามารถกดปุ่ม "+ เพิ่มอะไหล่ใหม่" ด้านบน เพื่อเริ่มลงทะเบียนอะไหล่และเก็บบัญชีคุม Stock Card'}
                  </span>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm" 
                    onClick={handleOpenAddPart}
                    style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
                  >
                    + เพิ่มอะไหล่ชิ้นแรก
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
                  {filteredSpareParts.map(part => {
                    const isLowStock = part.quantity <= part.minQuantity && part.quantity > 0;
                    const isOutOfStock = part.quantity <= 0;
                    const txCount = part.transactions?.length || 0;

                    return (
                      <div 
                        key={part.id} 
                        style={{ 
                          background: 'var(--bg-primary)', 
                          borderRadius: 'var(--radius-md)', 
                          border: isOutOfStock 
                            ? '1.5px solid rgba(239, 68, 68, 0.6)' 
                            : isLowStock 
                            ? '1.5px solid rgba(245, 158, 11, 0.6)' 
                            : '1px solid var(--border)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        {/* Card Header & Status */}
                        <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', background: 'var(--bg-secondary)' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, fontFamily: 'monospace', background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--primary)' }}>
                                {part.partCode}
                              </span>
                              {part.brand && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                  แบรนด์: <strong>{part.brand}</strong>
                                </span>
                              )}
                            </div>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, margin: '0.25rem 0 0 0', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                              {part.name}
                            </h4>
                          </div>

                          {/* Stock Level Badge */}
                          <div>
                            {isOutOfStock ? (
                              <span className="badge badge-danger" style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem' }}>
                                🔴 หมดสต็อก (0 {part.unit})
                              </span>
                            ) : isLowStock ? (
                              <span className="badge badge-warning" style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem' }}>
                                🟡 ใกล้หมด ({part.quantity} {part.unit})
                              </span>
                            ) : (
                              <span className="badge badge-success" style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem' }}>
                                🟢 คงเหลือ: {part.quantity} {part.unit}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.775rem', flex: 1 }}>
                          {part.specification && (
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              ⚙️ <strong>สเปค/รุ่น:</strong> {part.specification}
                            </div>
                          )}

                          {part.storageLocation && (
                            <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <MapPin size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                              <span>{part.storageLocation}</span>
                            </div>
                          )}

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', background: 'var(--bg-secondary)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', marginTop: '0.25rem' }}>
                            <div>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>จุดเตือนสั่งซื้อขั้นต่ำ:</span>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{part.minQuantity} {part.unit}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ราคาต่อหน่วย / รวม:</span>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                {part.unitPrice ? `${part.unitPrice.toLocaleString()} ฿` : '-'}
                              </div>
                            </div>
                          </div>

                          {part.supplier && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              🏢 ผู้จัดจำหน่าย: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{part.supplier}</span>
                              {part.supplierContact && ` (โทร: ${part.supplierContact})`}
                            </div>
                          )}

                          {part.notes && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(0,0,0,0.03)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                              📝 {part.notes}
                            </div>
                          )}

                          {part.imageUrl && (
                            <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <img 
                                src={part.imageUrl} 
                                alt={part.name} 
                                style={{ height: '38px', width: '55px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)', cursor: 'pointer' }}
                                onClick={() => handleOpenPartLightbox(part.imageUrl!, `${part.partCode} - ${part.name}`)}
                                title="คลิกเพื่อดูรูปภาพอะไหล่ขนาดเต็ม HD"
                              />
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                onClick={() => handleOpenPartLightbox(part.imageUrl!, `${part.partCode} - ${part.name}`)}
                                style={{ fontSize: '0.7rem', color: 'var(--primary)' }}
                              >
                                🔍 ดูรูปภาพ HD
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Card Action Buttons (Stock In / Out / Stock Card / Edit / Delete) */}
                        <div style={{ padding: '0.65rem 1rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              type="button"
                              className="btn btn-success btn-xs"
                              onClick={() => handleOpenStockIn(part)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', padding: '0.25rem 0.55rem', fontWeight: 700 }}
                              title="บันทึกรับเข้าสต็อก (+ Stock In)"
                            >
                              <ArrowDownLeft size={13} /> 📥 รับเข้า
                            </button>

                            <button
                              type="button"
                              className="btn btn-warning btn-xs"
                              onClick={() => handleOpenStockOut(part)}
                              disabled={part.quantity <= 0}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', padding: '0.25rem 0.55rem', fontWeight: 700, opacity: part.quantity <= 0 ? 0.5 : 1 }}
                              title="บันทึกเบิกใช้งานซ่อมบำรุง (- Stock Out)"
                            >
                              <ArrowUpRight size={13} /> 📤 เบิกใช้
                            </button>

                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() => setViewingStockCardPart(viewingStockCardPart?.id === part.id ? null : part)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', padding: '0.25rem 0.5rem', color: 'var(--primary)', border: '1px solid var(--border)' }}
                              title="เปิดดูประวัติการเคลื่อนไหว Stock Card ของอะไหล่ชิ้นนี้"
                            >
                              <History size={13} /> 📜 Stock Card ({txCount})
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleOpenEditPart(part)}
                              style={{ padding: '0.25rem 0.4rem', color: 'var(--text-secondary)' }}
                              title="แก้ไขข้อมูลอะไหล่"
                            >
                              <Edit3 size={13} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleDeletePart(part.id)}
                              style={{ padding: '0.25rem 0.4rem', color: 'var(--danger)' }}
                              title="ลบรายการอะไหล่"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Inline Stock Card Ledger Expansion for This Part */}
                        {viewingStockCardPart?.id === part.id && (
                          <div style={{ background: 'var(--bg-tertiary)', borderTop: '2px solid var(--primary)', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h5 style={{ fontSize: '0.8rem', fontWeight: 800, margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                📜 บัญชีคุมการเคลื่อนไหวสต็อก (Stock Card): {part.partCode}
                              </h5>
                              <button 
                                type="button" 
                                className="btn btn-ghost btn-xs"
                                onClick={() => handleOpenPrintStockCard(part)}
                                style={{ fontSize: '0.7rem', color: 'var(--primary)' }}
                              >
                                🖨️ พิมพ์ใบคุม
                              </button>
                            </div>

                            {(!part.transactions || part.transactions.length === 0) ? (
                              <div style={{ textAlign: 'center', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                ยังไม่มีประวัติการรับเข้าหรือเบิกจ่ายสำหรับอะไหล่ชิ้นนี้
                              </div>
                            ) : (
                              <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', fontSize: '0.725rem', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr style={{ background: 'var(--bg-primary)', borderBottom: '1.5px solid var(--border)', textAlign: 'left' }}>
                                      <th style={{ padding: '0.35rem 0.5rem' }}>วันที่</th>
                                      <th style={{ padding: '0.35rem 0.5rem' }}>ประเภท</th>
                                      <th style={{ padding: '0.35rem 0.5rem' }}>เอกสารอ้างอิง/เคส</th>
                                      <th style={{ padding: '0.35rem 0.5rem', textAlign: 'right' }}>รับเข้า (+)</th>
                                      <th style={{ padding: '0.35rem 0.5rem', textAlign: 'right' }}>จ่ายออก (-)</th>
                                      <th style={{ padding: '0.35rem 0.5rem', textAlign: 'right' }}>คงเหลือ</th>
                                      <th style={{ padding: '0.35rem 0.5rem' }}>ผู้ทำรายการ</th>
                                      <th style={{ padding: '0.35rem 0.5rem' }}>หมายเหตุ</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {part.transactions.map((tx, idx) => (
                                      <tr key={tx.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.35rem 0.5rem', whiteSpace: 'nowrap' }}>{tx.date}</td>
                                        <td style={{ padding: '0.35rem 0.5rem' }}>
                                          {tx.type === 'in' ? (
                                            <span style={{ color: 'var(--success)', fontWeight: 700 }}>📥 รับเข้า</span>
                                          ) : tx.type === 'out' ? (
                                            <span style={{ color: 'var(--warning)', fontWeight: 700 }}>📤 เบิกใช้</span>
                                          ) : (
                                            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>🔄 ปรับยอด</span>
                                          )}
                                        </td>
                                        <td style={{ padding: '0.35rem 0.5rem', fontWeight: 600 }}>{tx.referenceDoc || '-'}</td>
                                        <td style={{ padding: '0.35rem 0.5rem', textAlign: 'right', color: 'var(--success)', fontWeight: 700 }}>
                                          {tx.quantity > 0 ? `+${tx.quantity}` : '-'}
                                        </td>
                                        <td style={{ padding: '0.35rem 0.5rem', textAlign: 'right', color: 'var(--warning)', fontWeight: 700 }}>
                                          {tx.quantity < 0 ? tx.quantity : '-'}
                                        </td>
                                        <td style={{ padding: '0.35rem 0.5rem', textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)' }}>
                                          {tx.balanceAfter} {part.unit}
                                        </td>
                                        <td style={{ padding: '0.35rem 0.5rem' }}>{tx.operator}</td>
                                        <td style={{ padding: '0.35rem 0.5rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {tx.note || '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Comprehensive Master Stock Card Ledger Table for this Equipment */}
              {assetSpareParts.length > 0 && (
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        📊 ทะเบียนประวัติการเคลื่อนไหวสต็อกรวม (Master Stock Card Movement Log)
                      </h4>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        ประวัติการรับเข้าและเบิกใช้อะไหล่ทุกรายการของ {asset.name}
                      </span>
                    </div>

                    <button 
                      type="button" 
                      className="btn btn-secondary btn-xs"
                      onClick={() => handleOpenPrintStockCard()}
                      style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Printer size={13} /> พิมพ์ Stock Card รวม
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                          <th style={{ padding: '0.45rem 0.6rem' }}>วันที่</th>
                          <th style={{ padding: '0.45rem 0.6rem' }}>รหัสอะไหล่</th>
                          <th style={{ padding: '0.45rem 0.6rem' }}>ชื่ออะไหล่</th>
                          <th style={{ padding: '0.45rem 0.6rem' }}>ประเภท</th>
                          <th style={{ padding: '0.45rem 0.6rem' }}>เอกสารอ้างอิง / เคส PM-CM</th>
                          <th style={{ padding: '0.45rem 0.6rem', textAlign: 'right' }}>รับเข้า (+)</th>
                          <th style={{ padding: '0.45rem 0.6rem', textAlign: 'right' }}>จ่ายออก (-)</th>
                          <th style={{ padding: '0.45rem 0.6rem', textAlign: 'right' }}>คงเหลือ</th>
                          <th style={{ padding: '0.45rem 0.6rem' }}>ผู้ทำรายการ</th>
                          <th style={{ padding: '0.45rem 0.6rem' }}>หมายเหตุ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assetSpareParts.flatMap(p => (p.transactions || []).map(tx => ({ ...tx, partInfo: p })))
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((tx, idx) => (
                            <tr key={tx.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>{tx.date}</td>
                              <td style={{ padding: '0.45rem 0.6rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                                {tx.partInfo.partCode}
                              </td>
                              <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600 }}>{tx.partInfo.name}</td>
                              <td style={{ padding: '0.45rem 0.6rem' }}>
                                {tx.type === 'in' ? (
                                  <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>📥 รับเข้า</span>
                                ) : tx.type === 'out' ? (
                                  <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>📤 เบิกใช้</span>
                                ) : (
                                  <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>🔄 ปรับยอด</span>
                                )}
                              </td>
                              <td style={{ padding: '0.45rem 0.6rem' }}>{tx.referenceDoc || '-'}</td>
                              <td style={{ padding: '0.45rem 0.6rem', textAlign: 'right', color: 'var(--success)', fontWeight: 700 }}>
                                {tx.quantity > 0 ? `+${tx.quantity}` : '-'}
                              </td>
                              <td style={{ padding: '0.45rem 0.6rem', textAlign: 'right', color: 'var(--warning)', fontWeight: 700 }}>
                                {tx.quantity < 0 ? tx.quantity : '-'}
                              </td>
                              <td style={{ padding: '0.45rem 0.6rem', textAlign: 'right', fontWeight: 800 }}>
                                {tx.balanceAfter} {tx.partInfo.unit}
                              </td>
                              <td style={{ padding: '0.45rem 0.6rem' }}>{tx.operator}</td>
                              <td style={{ padding: '0.45rem 0.6rem', color: 'var(--text-muted)' }}>{tx.note || '-'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* --- SUB-MODAL 1: ADD / EDIT SPARE PART MODAL --- */}
      {isAddPartOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 100020, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleSavePart} className="glass-panel animate-scale-up" style={{ maxWidth: '560px', width: '100%', background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Package size={20} /> {editingPart ? '✏️ แก้ไขข้อมูลอะไหล่สำรอง' : '➕ เพิ่มรายการอะไหล่สำรอง (Spare Part)'}
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsAddPartOpen(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>รหัสอะไหล่ (Part Code) *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formPartCode} 
                    onChange={(e) => setFormPartCode(e.target.value)} 
                    placeholder="เช่น SP-PUMP-01" 
                    required 
                    style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>ชื่ออะไหล่ / ชิ้นส่วน *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)} 
                    placeholder="เช่น ไส้กรองอากาศ (Air Intake Filter)" 
                    required 
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>สเปค / รุ่น / หมายเลขชิ้นส่วน OEM (Specification / Part No.)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formSpec} 
                  onChange={(e) => setFormSpec(e.target.value)} 
                  placeholder="เช่น Atlas Copco Genuine Part 1613-8720-00" 
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>ยี่ห้อ / แบรนด์ (Brand)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formBrand} 
                    onChange={(e) => setFormBrand(e.target.value)} 
                    placeholder="เช่น Atlas Copco / SMC / Festo" 
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>สถานที่จัดเก็บ (Storage Location)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formLocation} 
                    onChange={(e) => setFormLocation(e.target.value)} 
                    placeholder="เช่น ตู้เก็บอะไหล่ ช่างบำรุงรักษา ชั้น 2" 
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>ยอดคงเหลือ *</label>
                  <input 
                    type="number" 
                    min="0" 
                    className="form-input" 
                    value={formQty} 
                    onChange={(e) => setFormQty(Number(e.target.value))} 
                    required 
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>จุดเตือนขั้นต่ำ *</label>
                  <input 
                    type="number" 
                    min="0" 
                    className="form-input" 
                    value={formMinQty} 
                    onChange={(e) => setFormMinQty(Number(e.target.value))} 
                    required 
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>หน่วยนับ *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formUnit} 
                    onChange={(e) => setFormUnit(e.target.value)} 
                    placeholder="ชิ้น / ชุด / ลิตร" 
                    required 
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>ราคา/หน่วย (บาท)</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="any"
                    className="form-input" 
                    value={formUnitPrice} 
                    onChange={(e) => setFormUnitPrice(e.target.value)} 
                    placeholder="เช่น 1450" 
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>บริษัท/ร้านค้าผู้จัดจำหน่าย</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formSupplier} 
                    onChange={(e) => setFormSupplier(e.target.value)} 
                    placeholder="เช่น บริษัท โอซาร่า วิศวกรรม จำกัด" 
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>เบอร์ติดต่อร้านค้า</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formSupplierContact} 
                    onChange={(e) => setFormSupplierContact(e.target.value)} 
                    placeholder="เช่น 02-XXX-XXXX" 
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>หมายเหตุ / รอบการเปลี่ยน</label>
                <textarea 
                  className="form-input" 
                  rows={2} 
                  value={formNotes} 
                  onChange={(e) => setFormNotes(e.target.value)} 
                  placeholder="เช่น เปลี่ยนทุกๆ 2,000 ชั่วโมงการทำงาน หรือทุกรอบ PM 6 เดือน" 
                  style={{ fontSize: '0.8rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>ลิงก์รูปภาพอะไหล่ (URL รูปภาพ)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={formImageUrl} 
                  onChange={(e) => setFormImageUrl(e.target.value)} 
                  placeholder="https://..." 
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddPartOpen(false)}>ยกเลิก</button>
              <button type="submit" className="btn btn-primary">
                💾 {editingPart ? 'บันทึกการแก้ไข' : 'บันทึกรายการอะไหล่'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- SUB-MODAL 2: STOCK IN (รับอะไหล่เข้าคลัง) --- */}
      {isStockInOpen && selectedPartForIn && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 100020, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleSaveStockIn} className="glass-panel animate-scale-up" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowDownLeft size={20} /> 📥 บันทึกรับอะไหล่เข้าสต็อก (Stock In)
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsStockInOpen(false)}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 700 }}>{selectedPartForIn.partCode}</div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.15rem 0' }}>{selectedPartForIn.name}</h4>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ยอดคงเหลือปัจจุบัน: <strong>{selectedPartForIn.quantity} {selectedPartForIn.unit}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>จำนวนที่รับเข้า (+) *</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="form-input" 
                    value={inQty} 
                    onChange={(e) => setInQty(Number(e.target.value))} 
                    required 
                    style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>ราคาต่อหน่วย (บาท)</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="any"
                    className="form-input" 
                    value={inPrice} 
                    onChange={(e) => setInPrice(e.target.value)} 
                    placeholder="เช่น 1450" 
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>เลขที่ใบสั่งซื้อ / ใบเสร็จรับเงิน (PO / Invoice Ref)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={inRef} 
                  onChange={(e) => setInRef(e.target.value)} 
                  placeholder="เช่น PO-6908-01 หรือ ใบส่งของ 1234/69" 
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>ผู้ตรวจรับ / ผู้ทำรายการ *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={inOperator} 
                  onChange={(e) => setInOperator(e.target.value)} 
                  required 
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>หมายเหตุการรับเข้า</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={inNote} 
                  onChange={(e) => setInNote(e.target.value)} 
                  placeholder="เช่น สั่งซื้อสต็อกสำรองประจำไตรมาส 3" 
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsStockInOpen(false)}>ยกเลิก</button>
              <button type="submit" className="btn btn-success" style={{ fontWeight: 700 }}>
                📥 ยืนยันรับเข้า ({inQty} {selectedPartForIn.unit})
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- SUB-MODAL 3: STOCK OUT (เบิกอะไหล่ไปใช้งาน) --- */}
      {isStockOutOpen && selectedPartForOut && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 100020, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleSaveStockOut} className="glass-panel animate-scale-up" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowUpRight size={20} /> 📤 บันทึกเบิกใช้อะไหล่ (Stock Out)
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsStockOutOpen(false)}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 700 }}>{selectedPartForOut.partCode}</div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.15rem 0' }}>{selectedPartForOut.name}</h4>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ยอดคงเหลือในคลังปัจจุบัน: <strong style={{ color: 'var(--success)' }}>{selectedPartForOut.quantity} {selectedPartForOut.unit}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>จำนวนที่เบิกใช้ (-) *</label>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedPartForOut.quantity}
                  className="form-input" 
                  value={outQty} 
                  onChange={(e) => setOutQty(Number(e.target.value))} 
                  required 
                  style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--warning)' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  (เบิกได้สูงสุดไม่เกิน {selectedPartForOut.quantity} {selectedPartForOut.unit})
                </span>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>อ้างอิงงาน / รอบ PM / เคสซ่อม CM *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={outRef} 
                  onChange={(e) => setOutRef(e.target.value)} 
                  placeholder="เช่น PM ประจำรอบ ส.ค. 2569 หรือ เคส CM-0725-01" 
                  required
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>ผู้เบิก / ช่างผู้ดำเนินการ *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={outOperator} 
                  onChange={(e) => setOutOperator(e.target.value)} 
                  required 
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>หมายเหตุ / รายละเอียดงานที่นำไปใช้</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={outNote} 
                  onChange={(e) => setOutNote(e.target.value)} 
                  placeholder="เช่น เปลี่ยนไส้กรองรอบบำรุงรักษาประจำปี อาการเครื่องทำงานราบรื่นดี" 
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsStockOutOpen(false)}>ยกเลิก</button>
              <button type="submit" className="btn btn-warning" style={{ fontWeight: 700 }}>
                📤 ยืนยันการเบิกจ่าย ({outQty} {selectedPartForOut.unit})
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- SUB-MODAL 4: PRINTABLE OFFICIAL STOCK CARD REPORT --- */}
      {isPrintStockCardOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 100030, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
          <div className="printable-cm-document" style={{ maxWidth: '820px', width: '100%', background: '#ffffff', color: '#000000', padding: '2.5rem', borderRadius: '4px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', fontFamily: 'sans-serif' }}>
            
            {/* Action Bar (Not printed) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} color="#2563eb" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                  ตัวอย่างก่อนพิมพ์: บัญชีคุมพัสดุอะไหล่ (Stock Card Ledger)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={() => window.print()}
                  style={{ background: '#2563eb', color: '#ffffff', fontWeight: 700, padding: '0.35rem 0.85rem' }}
                >
                  🖨️ สั่งพิมพ์เอกสาร
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsPrintStockCardOpen(false)}
                >
                  ✕ ปิดหน้าต่าง
                </button>
              </div>
            </div>

            {/* Official Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.3rem', fontWeight: 800 }}>
                บัญชีคุมพัสดุและอะไหล่สำรอง (STOCK CARD)
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155' }}>
                ระบบบริหารจัดการครุภัณฑ์และบำรุงรักษาเชิงป้องกัน (AssetWatch Maintenance Module)
              </p>
            </div>

            {/* Target Asset Information */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <div>ครุภัณฑ์หลัก: <strong>{asset.name}</strong></div>
                <div>รหัสครุภัณฑ์: <strong style={{ fontFamily: 'monospace' }}>{asset.id}</strong></div>
                <div>สถานที่ติดตั้ง: <strong>{asset.location || '-'}</strong></div>
                <div>หน่วยงานผู้รับผิดชอบ: <strong>{asset.department || '-'}</strong></div>
              </div>
            </div>

            {/* Target Spare Part Info if filtering single part */}
            {printCardTargetPart && (
              <div style={{ border: '1.5px solid #2563eb', borderRadius: '4px', padding: '0.75rem 1rem', marginBottom: '1.25rem', background: '#eff6ff', fontSize: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '0.5rem' }}>
                  <div>รหัสอะไหล่: <strong>{printCardTargetPart.partCode}</strong></div>
                  <div>ชื่ออะไหล่: <strong>{printCardTargetPart.name}</strong></div>
                  <div>ยอดคงเหลือ: <strong>{printCardTargetPart.quantity} {printCardTargetPart.unit}</strong></div>
                  <div>สเปค/รุ่น: <strong>{printCardTargetPart.specification || '-'}</strong></div>
                  <div>สถานที่จัดเก็บ: <strong>{printCardTargetPart.storageLocation || '-'}</strong></div>
                  <div>ราคาต่อหน่วย: <strong>{printCardTargetPart.unitPrice ? `${printCardTargetPart.unitPrice.toLocaleString()} บาท` : '-'}</strong></div>
                </div>
              </div>
            )}

            {/* Spare Parts Inventory Table */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.5rem 0', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
                1. บัญชีรายการอะไหล่และยอดคงคลัง (Spare Parts List)
              </h4>
              <table style={{ width: '100%', fontSize: '0.775rem', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>รหัสอะไหล่</th>
                    <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>ชื่ออะไหล่ / สเปค</th>
                    <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>ตู้/สถานที่จัดเก็บ</th>
                    <th style={{ padding: '0.45rem', textAlign: 'right', border: '1px solid #cbd5e1' }}>ยอดคงเหลือ</th>
                    <th style={{ padding: '0.45rem', textAlign: 'right', border: '1px solid #cbd5e1' }}>จุดเตือนขั้นต่ำ</th>
                    <th style={{ padding: '0.45rem', textAlign: 'right', border: '1px solid #cbd5e1' }}>ราคา/หน่วย</th>
                  </tr>
                </thead>
                <tbody>
                  {(printCardTargetPart ? [printCardTargetPart] : assetSpareParts).map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '0.45rem', fontFamily: 'monospace', fontWeight: 700, border: '1px solid #cbd5e1' }}>{p.partCode}</td>
                      <td style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>
                        <strong>{p.name}</strong>
                        {p.specification && <div style={{ fontSize: '0.7rem', color: '#475569' }}>{p.specification}</div>}
                      </td>
                      <td style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>{p.storageLocation || '-'}</td>
                      <td style={{ padding: '0.45rem', textAlign: 'right', fontWeight: 800, border: '1px solid #cbd5e1' }}>{p.quantity} {p.unit}</td>
                      <td style={{ padding: '0.45rem', textAlign: 'right', border: '1px solid #cbd5e1' }}>{p.minQuantity} {p.unit}</td>
                      <td style={{ padding: '0.45rem', textAlign: 'right', border: '1px solid #cbd5e1' }}>{p.unitPrice ? `${p.unitPrice.toLocaleString()} ฿` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stock Card Movement Ledger */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.5rem 0', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
                2. ทะเบียนการรับเข้าและเบิกจ่ายอะไหล่ (Stock Card Movement Ledger)
              </h4>
              <table style={{ width: '100%', fontSize: '0.775rem', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>วันที่</th>
                    <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>รหัสอะไหล่</th>
                    <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>รายการ / เอกสารอ้างอิง</th>
                    <th style={{ padding: '0.45rem', textAlign: 'right', border: '1px solid #cbd5e1' }}>รับเข้า (+)</th>
                    <th style={{ padding: '0.45rem', textAlign: 'right', border: '1px solid #cbd5e1' }}>จ่ายออก (-)</th>
                    <th style={{ padding: '0.45rem', textAlign: 'right', border: '1px solid #cbd5e1' }}>คงเหลือ</th>
                    <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>ผู้เบิก/ผู้รับ</th>
                    <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {(printCardTargetPart ? [printCardTargetPart] : assetSpareParts)
                    .flatMap(p => (p.transactions || []).map(tx => ({ ...tx, partInfo: p })))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((tx, idx) => (
                      <tr key={tx.id || idx} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '0.45rem', border: '1px solid #cbd5e1', whiteSpace: 'nowrap' }}>{tx.date}</td>
                        <td style={{ padding: '0.45rem', fontFamily: 'monospace', fontWeight: 700, border: '1px solid #cbd5e1' }}>{tx.partInfo.partCode}</td>
                        <td style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>
                          <div>{tx.type === 'in' ? '📥 รับเข้าสต็อก' : '📤 เบิกใช้งาน'} ({tx.referenceDoc || '-'})</div>
                        </td>
                        <td style={{ padding: '0.45rem', textAlign: 'right', fontWeight: 700, border: '1px solid #cbd5e1' }}>
                          {tx.quantity > 0 ? `+${tx.quantity}` : '-'}
                        </td>
                        <td style={{ padding: '0.45rem', textAlign: 'right', fontWeight: 700, border: '1px solid #cbd5e1' }}>
                          {tx.quantity < 0 ? tx.quantity : '-'}
                        </td>
                        <td style={{ padding: '0.45rem', textAlign: 'right', fontWeight: 800, border: '1px solid #cbd5e1' }}>
                          {tx.balanceAfter} {tx.partInfo.unit}
                        </td>
                        <td style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>{tx.operator}</td>
                        <td style={{ padding: '0.45rem', border: '1px solid #cbd5e1', color: '#475569' }}>{tx.note || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Official Sign-off Signature Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1', textAlign: 'center', fontSize: '0.85rem' }}>
              <div>
                <div style={{ marginBottom: '3rem' }}>ลงชื่อ ..............................................................</div>
                <div>( .............................................................. )</div>
                <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.25rem' }}>เจ้าหน้าที่พัสดุ / ผู้ควบคุมสต็อก</div>
                <div style={{ color: '#64748b', fontSize: '0.72rem' }}>วันที่ ..... / ..... / .........</div>
              </div>

              <div>
                <div style={{ marginBottom: '3rem' }}>ลงชื่อ ..............................................................</div>
                <div>( .............................................................. )</div>
                <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.25rem' }}>หัวหน้างานซ่อมบำรุง / ผู้ตรวจรับรอง</div>
                <div style={{ color: '#64748b', fontSize: '0.72rem' }}>วันที่ ..... / ..... / .........</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- SUB-MODAL 5: FULLSCREEN LIGHTBOX FOR SPARE PART IMAGES --- */}
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
                🔍 {lightboxTitle || 'รูปภาพอะไหล่สำรอง (HD)'}
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

          <div 
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '4.5rem 1rem 1rem 1rem' }}
            onClick={(e) => e.stopPropagation()}
          >
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
                alt="Spare Part Preview" 
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
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .modal-card {
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background-color: var(--bg-secondary);
          position: sticky;
          top: 0;
          z-index: 10;
          flex-shrink: 0;
        }

        .modal-title-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-width: 90%;
        }

        .modal-title-group h2 {
          font-size: 1.35rem;
          font-weight: 800;
        }

        .modal-asset-id {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .btn-close {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: background-color var(--transition-fast);
        }

        .btn-close:hover {
          background-color: var(--border);
          color: var(--text-primary);
        }

        .modal-tabs {
          display: flex;
          background-color: var(--bg-tertiary);
          border-bottom: 1px solid var(--border);
          padding: 0 1rem;
          overflow-x: auto;
          gap: 0.5rem;
          position: sticky;
          top: 0;
          z-index: 9;
          flex-shrink: 0;
        }

        .modal-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.25rem;
          border: none;
          background: transparent;
          font-family: var(--font-family);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          border-bottom: 2.5px solid transparent;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .modal-tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
          background-color: var(--bg-secondary);
        }

        /* TAB 1 Layout */
        .tab-info-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.75rem;
        }

        .info-visuals-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-image-container {
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border);
          background-color: var(--bg-primary);
        }

        .info-asset-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .qr-badge-card {
          padding: 1rem;
          background-color: var(--bg-primary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .visible-qr {
          padding: 0.25rem;
          background-color: #ffffff;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .qr-card-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .qr-card-details span {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .qr-card-details h4 {
          font-size: 0.875rem;
          font-family: monospace;
          color: var(--text-primary);
        }

        .btn-xs {
          padding: 0.35rem 0.65rem;
          font-size: 0.75rem;
          border-radius: var(--radius-sm);
        }

        .info-fields-panel {
          display: flex;
          flex-direction: column;
          gap: 0.95rem;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .detail-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.725rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .detail-value {
          font-size: 0.95rem;
          font-weight: 550;
          color: var(--text-primary);
        }

        .detail-note-box {
          background-color: var(--bg-primary);
          border: 1px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          font-size: 0.85rem;
        }

        .detail-note-box h4 {
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .detail-note-box p {
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .modal-actions-footer {
          margin-top: auto;
          padding-top: 1rem;
        }

        /* TAB 2 Timeline Logs */
        .modal-logs-list {
          display: flex;
          flex-direction: column;
          padding-left: 0.75rem;
          border-left: 2px solid var(--border);
          margin-left: 0.5rem;
          gap: 1.5rem;
        }

        .timeline-item {
          position: relative;
        }

        .timeline-dot {
          position: absolute;
          left: -17px;
          top: 6px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--primary);
          border: 2px solid var(--bg-secondary);
        }

        .timeline-content {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .timeline-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .timeline-operator {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .timeline-title {
          font-size: 0.95rem;
          font-weight: 750;
        }

        .timeline-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .timeline-changes {
          margin-top: 0.35rem;
          padding: 0.5rem;
          background-color: var(--bg-primary);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          border: 1px solid var(--border);
        }

        .change-field-row {
          margin-bottom: 0.15rem;
        }
        
        .old-val { color: var(--danger); text-decoration: line-through; margin: 0 0.25rem; }
        .new-val { color: var(--success); font-weight: 600; }

        /* TAB 3 Repairs Layout */
        .modal-repairs-layout {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .repair-log-card {
          padding: 1rem;
          background-color: var(--bg-primary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
        }

        .repair-log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .repair-log-id {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .repair-log-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .return-note {
          color: var(--success);
        }

        /* TAB 4 Surveys Layout */
        .modal-surveys-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .survey-log-row {
          display: flex;
          gap: 1rem;
        }

        .survey-log-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--success);
          margin-top: 0.5rem;
          flex-shrink: 0;
        }

        .survey-log-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .survey-log-header-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .survey-log-op {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .survey-log-status {
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .survey-attached-pic {
          margin-top: 0.5rem;
          font-size: 0.775rem;
          color: var(--text-secondary);
        }

        .survey-attached-pic img {
          display: block;
          margin-top: 0.25rem;
          max-width: 180px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }

        .empty-tab-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
          gap: 0.75rem;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .modal-card {
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
          .tab-info-layout {
            grid-template-columns: 1fr;
          }
          .info-visuals-panel {
            align-items: center;
          }
          .info-image-container {
            max-width: 320px;
          }
          .qr-badge-card {
            width: 100%;
            max-width: 320px;
          }
        }
      `}</style>
    </div>
  );
};
