import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Filter, Eye, Edit3, Grid, List, ShieldAlert, Printer, X, FileSpreadsheet, 
  QrCode, Camera, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal, RotateCcw, CheckCircle2,
  AlertTriangle, Wrench, Calendar, MapPin, Building2, Layers, Sparkles
} from 'lucide-react';
import { Asset, AuditTrail, SurveyRecord, RepairCase, UserAccount, PMSchedule, SparePart } from '../utils/mockData';
import { AssetModal } from '../components/AssetModal';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { SearchableSelect } from '../components/SearchableSelect';

const FALLBACK_ASSET_IMG = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';

export type SortField = 'id' | 'name' | 'receivedDate' | 'location' | 'department' | 'status' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

interface Module1DatabaseProps {
  assets: Asset[];
  audits: AuditTrail[];
  repairs: RepairCase[];
  surveys: SurveyRecord[];
  schedules: PMSchedule[];
  onAssetEdit: (asset: Asset) => void;
  currentUser: UserAccount | null;
  onRefreshData?: () => void;
  spareParts?: SparePart[];
  onAddSparePart?: (part: SparePart) => Promise<void>;
  onUpdateSparePart?: (part: SparePart) => Promise<void>;
  onDeleteSparePart?: (id: string) => Promise<void>;
}

export const Module1_Database: React.FC<Module1DatabaseProps> = ({
  assets,
  audits,
  repairs,
  surveys,
  schedules,
  onAssetEdit,
  currentUser,
  onRefreshData,
  spareParts = [],
  onAddSparePart,
  onUpdateSparePart,
  onDeleteSparePart
}) => {
  // Search and basic filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Advanced filter states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [surveyFilter, setSurveyFilter] = useState<'' | 'surveyed' | 'unsurveyed'>('');
  const [repairFilter, setRepairFilter] = useState<'' | 'in_repair' | 'has_history'>('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Sorting states
  const [sortBy, setSortBy] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortDirection>('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(24);
  
  // Selected asset for viewing details in modal
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // State for Report Print Modal & Scanner Modal
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Role permissions check
  const isOrgWide = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const userDept = currentUser?.department || '';

  // Force department filter for Head / Operator
  useEffect(() => {
    if (!isOrgWide && userDept) {
      setDeptFilter(userDept);
    }
  }, [currentUser, isOrgWide, userDept]);

  // Reset to page 1 whenever filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, deptFilter, locationFilter, surveyFilter, repairFilter, dateStart, dateEnd, sortBy, sortOrder, pageSize]);

  // Lookup Sets for quick O(1) survey and repair checking
  const surveyedAssetIds = useMemo(() => {
    return new Set(surveys.map(s => s.assetId));
  }, [surveys]);

  const repairAssetIds = useMemo(() => {
    return new Set(repairs.map(r => r.assetId));
  }, [repairs]);

  const activeRepairAssetIds = useMemo(() => {
    return new Set(repairs.filter(r => r.status !== 'completed').map(r => r.assetId));
  }, [repairs]);

  // Extract unique departments & locations for filter dropdowns safely
  const uniqueDepts = useMemo(() => {
    return Array.from(new Set(assets.map(a => a.department).filter((d): d is string => Boolean(d)))).sort((a, b) => a.localeCompare(b, 'th'));
  }, [assets]);

  const uniqueLocations = useMemo(() => {
    const pool = deptFilter ? assets.filter(a => a.department === deptFilter) : assets;
    return Array.from(new Set(pool.map(a => a.location).filter((l): l is string => Boolean(l)))).sort((a, b) => a.localeCompare(b, 'th'));
  }, [assets, deptFilter]);

  // Reset location filter if it's no longer present in selected dept
  useEffect(() => {
    if (locationFilter && !uniqueLocations.includes(locationFilter)) {
      setLocationFilter('');
    }
  }, [deptFilter, uniqueLocations, locationFilter]);

  // Scoped pool for analytics KPIs
  const scopedAssetsPool = useMemo(() => {
    return isOrgWide 
      ? (deptFilter ? assets.filter(a => a.department === deptFilter) : assets)
      : assets.filter(a => a.department === userDept);
  }, [assets, isOrgWide, deptFilter, userDept]);

  // Analytics Metrics Calculation
  const analyticsStats = useMemo(() => {
    const total = scopedAssetsPool.length;
    const ready = scopedAssetsPool.filter(a => a.status === 'ใช้งานได้').length;
    const broken = scopedAssetsPool.filter(a => a.status === 'ชำรุด').length;
    const dispose = scopedAssetsPool.filter(a => a.status === 'รอจำหน่าย').length;
    const surveyed = scopedAssetsPool.filter(a => surveyedAssetIds.has(a.id) || Boolean(a.note && a.note.includes('สำรวจ'))).length;
    const inRepair = scopedAssetsPool.filter(a => activeRepairAssetIds.has(a.id) || a.status === 'ชำรุด').length;
    const surveyPct = total > 0 ? Math.round((surveyed / total) * 100) : 0;

    return { total, ready, broken, dispose, surveyed, inRepair, surveyPct };
  }, [scopedAssetsPool, surveyedAssetIds, activeRepairAssetIds]);

  // Filter computation (safely guarded against null/undefined)
  const filteredAssets = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return assets.filter((asset) => {
      if (!asset) return false;
      // Role-based department restriction: Head and Operator see ONLY their department
      if (!isOrgWide && userDept && asset.department !== userDept) {
        return false;
      }

      const assetId = (asset.id || '').toLowerCase();
      const assetName = (asset.name || '').toLowerCase();
      const assetNote = (asset.note || '').toLowerCase();
      const assetLoc = (asset.location || '').toLowerCase();
      const assetDept = (asset.department || '').toLowerCase();
      const assetResp = (asset.responsiblePerson || '').toLowerCase();
      const assetSrc = (asset.source || '').toLowerCase();

      const matchesSearch = !term || 
        assetId.includes(term) ||
        assetName.includes(term) ||
        assetNote.includes(term) ||
        assetLoc.includes(term) ||
        assetDept.includes(term) ||
        assetResp.includes(term) ||
        assetSrc.includes(term);
        
      const matchesStatus = statusFilter ? asset.status === statusFilter : true;
      const matchesDept = deptFilter ? asset.department === deptFilter : true;
      const matchesLocation = locationFilter ? asset.location === locationFilter : true;

      // Survey filter
      let matchesSurvey = true;
      if (surveyFilter === 'surveyed') {
        matchesSurvey = surveyedAssetIds.has(asset.id) || Boolean(asset.note && asset.note.includes('สำรวจ'));
      } else if (surveyFilter === 'unsurveyed') {
        matchesSurvey = !surveyedAssetIds.has(asset.id) && Boolean(!asset.note || !asset.note.includes('สำรวจ'));
      }

      // Repair filter
      let matchesRepair = true;
      if (repairFilter === 'in_repair') {
        matchesRepair = activeRepairAssetIds.has(asset.id) || asset.status === 'ชำรุด';
      } else if (repairFilter === 'has_history') {
        matchesRepair = repairAssetIds.has(asset.id);
      }

      // Date range filter
      let matchesDate = true;
      if (dateStart && asset.receivedDate) {
        matchesDate = matchesDate && (asset.receivedDate >= dateStart);
      }
      if (dateEnd && asset.receivedDate) {
        matchesDate = matchesDate && (asset.receivedDate <= dateEnd);
      }

      return matchesSearch && matchesStatus && matchesDept && matchesLocation && matchesSurvey && matchesRepair && matchesDate;
    });
  }, [assets, searchTerm, statusFilter, deptFilter, locationFilter, surveyFilter, repairFilter, dateStart, dateEnd, isOrgWide, userDept, surveyedAssetIds, repairAssetIds, activeRepairAssetIds]);

  // Natural Sorting Computation (Supports Thai & Numbers accurately)
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      let valA = '';
      let valB = '';

      switch (sortBy) {
        case 'id':
          valA = a.id || '';
          valB = b.id || '';
          break;
        case 'name':
          valA = a.name || '';
          valB = b.name || '';
          break;
        case 'receivedDate':
          valA = a.receivedDate || '';
          valB = b.receivedDate || '';
          break;
        case 'location':
          valA = a.location || '';
          valB = b.location || '';
          break;
        case 'department':
          valA = a.department || '';
          valB = b.department || '';
          break;
        case 'status':
          valA = a.status || '';
          valB = b.status || '';
          break;
        case 'updatedAt':
          valA = a.updatedAt || a.createdAt || '';
          valB = b.updatedAt || b.createdAt || '';
          break;
        default:
          valA = a.id || '';
          valB = b.id || '';
      }

      const comparison = valA.localeCompare(valB, 'th', { numeric: true, sensitivity: 'base' });
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredAssets, sortBy, sortOrder]);

  // Sorting toggle helper for table headers
  const handleToggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Active filters check & reset helper
  const hasActiveFilters = Boolean(
    searchTerm || statusFilter || (isOrgWide && deptFilter) || locationFilter || surveyFilter || repairFilter || dateStart || dateEnd
  );

  const activeFilterCount = [
    Boolean(searchTerm),
    Boolean(statusFilter),
    Boolean(isOrgWide && deptFilter),
    Boolean(locationFilter),
    Boolean(surveyFilter),
    Boolean(repairFilter),
    Boolean(dateStart || dateEnd)
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    if (isOrgWide) setDeptFilter('');
    setLocationFilter('');
    setSurveyFilter('');
    setRepairFilter('');
    setDateStart('');
    setDateEnd('');
  };

  // Pagination calculation
  const totalItems = sortedAssets.length;
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAssets = useMemo(() => {
    if (pageSize === 'all') return sortedAssets;
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedAssets.slice(startIndex, startIndex + pageSize);
  }, [sortedAssets, safeCurrentPage, pageSize]);

  // Export to Excel / CSV (supports UTF-8 with BOM for Excel & Google Sheets)
  const handleExportExcel = () => {
    if (sortedAssets.length === 0) {
      alert('ไม่พบข้อมูลครุภัณฑ์สำหรับส่งออกรายงาน');
      return;
    }

    const headers = [
      'ลำดับ',
      'รหัสครุภัณฑ์',
      'ชื่อรายการครุภัณฑ์',
      'สถานะ',
      'หน่วยงาน/ฝ่าย',
      'สถานที่จัดเก็บ/ห้อง',
      'ผู้รับผิดชอบ',
      'ที่มา/งบประมาณ',
      'วันที่รับเข้า',
      'หมายเหตุ',
      'ผู้ลงทะเบียน'
    ];

    const rows = sortedAssets.map((asset, idx) => [
      idx + 1,
      `"${(asset.id || '').replace(/"/g, '""')}"`,
      `"${(asset.name || '').replace(/"/g, '""')}"`,
      `"${(asset.status || '').replace(/"/g, '""')}"`,
      `"${(asset.department || '').replace(/"/g, '""')}"`,
      `"${(asset.location || '').replace(/"/g, '""')}"`,
      `"${(asset.responsiblePerson || '').replace(/"/g, '""')}"`,
      `"${(asset.source || '').replace(/"/g, '""')}"`,
      `"${(asset.receivedDate || '').replace(/"/g, '""')}"`,
      `"${(asset.note || '').replace(/"/g, '""')}"`,
      `"${(asset.createdBy || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\r\n');

    // UTF-8 BOM byte sequence (\uFEFF) ensures Thai characters render properly in Excel & Google Sheets
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const scopeLabel = isOrgWide ? (deptFilter ? deptFilter : 'ทั้งองค์กร') : userDept;
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `รายงานบัญชีครุภัณฑ์_${scopeLabel}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statusColors: Record<string, string> = {
    'ใช้งานได้': 'badge-success',
    'ชำรุด': 'badge-danger',
    'รอจำหน่าย': 'badge-warning',
    'ขอป้ายรหัสใหม่': 'badge-info',
    'รอโอน': 'badge-primary',
    'อื่นๆ': 'badge-muted'
  };

  const isAllowedToEdit = (asset: Asset) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager') return false; // Manager is Read-Only Executive
    if (currentUser.role === 'head') return asset.department === currentUser.department; // Head can edit all in department
    // Operator can edit items in department created by themselves
    return asset.department === currentUser.department && (asset.createdBy === currentUser.id || asset.createdBy === currentUser.username || !asset.createdBy);
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>ค้นหาและบัญชีครุภัณฑ์ทั้งหมด (Module 1)</h2>
        <p>บัญชีควบคุมทรัพย์สินหลักของทางราชการ ค้นหาสืบค้นข้อมูล พร้อมประวัติย้อนหลังเชิงลึก</p>
      </div>

      {/* Interactive Analytics KPI Summary Chips */}
      <div className="analytics-chips-bar glass-panel animate-fade-in" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.25rem' }}>
          <Sparkles size={16} color="var(--primary)" /> สรุปข้อมูล:
        </div>

        {/* All Assets Chip */}
        <button
          type="button"
          className={`analytics-chip ${!statusFilter && !surveyFilter && !repairFilter ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('');
            setSurveyFilter('');
            setRepairFilter('');
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '20px',
            fontSize: '0.775rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: '1px solid var(--border)',
            background: !statusFilter && !surveyFilter && !repairFilter ? 'var(--primary)' : 'var(--bg-secondary)',
            color: !statusFilter && !surveyFilter && !repairFilter ? '#fff' : 'var(--text-primary)',
            transition: 'all 0.15s ease'
          }}
        >
          📦 ทั้งหมด: <span style={{ opacity: 0.9 }}>{analyticsStats.total}</span>
        </button>

        {/* Ready Chip */}
        <button
          type="button"
          className={`analytics-chip ${statusFilter === 'ใช้งานได้' ? 'active' : ''}`}
          onClick={() => setStatusFilter(prev => prev === 'ใช้งานได้' ? '' : 'ใช้งานได้')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '20px',
            fontSize: '0.775rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            background: statusFilter === 'ใช้งานได้' ? '#10b981' : 'rgba(16, 185, 129, 0.12)',
            color: statusFilter === 'ใช้งานได้' ? '#fff' : '#10b981',
            transition: 'all 0.15s ease'
          }}
        >
          🟢 พร้อมใช้งาน: <span>{analyticsStats.ready}</span>
        </button>

        {/* Broken Chip */}
        <button
          type="button"
          className={`analytics-chip ${statusFilter === 'ชำรุด' ? 'active' : ''}`}
          onClick={() => setStatusFilter(prev => prev === 'ชำรุด' ? '' : 'ชำรุด')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '20px',
            fontSize: '0.775rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: statusFilter === 'ชำรุด' ? '#ef4444' : 'rgba(239, 68, 68, 0.12)',
            color: statusFilter === 'ชำรุด' ? '#fff' : '#ef4444',
            transition: 'all 0.15s ease'
          }}
        >
          🔴 ชำรุด: <span>{analyticsStats.broken}</span>
        </button>

        {/* Dispose Chip */}
        <button
          type="button"
          className={`analytics-chip ${statusFilter === 'รอจำหน่าย' ? 'active' : ''}`}
          onClick={() => setStatusFilter(prev => prev === 'รอจำหน่าย' ? '' : 'รอจำหน่าย')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '20px',
            fontSize: '0.775rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            background: statusFilter === 'รอจำหน่าย' ? '#f59e0b' : 'rgba(245, 158, 11, 0.12)',
            color: statusFilter === 'รอจำหน่าย' ? '#fff' : '#f59e0b',
            transition: 'all 0.15s ease'
          }}
        >
          🟡 รอจำหน่าย: <span>{analyticsStats.dispose}</span>
        </button>

        {/* Surveyed Chip */}
        <button
          type="button"
          className={`analytics-chip ${surveyFilter === 'surveyed' ? 'active' : ''}`}
          onClick={() => setSurveyFilter(prev => prev === 'surveyed' ? '' : 'surveyed')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '20px',
            fontSize: '0.775rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            background: surveyFilter === 'surveyed' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.12)',
            color: surveyFilter === 'surveyed' ? '#fff' : '#8b5cf6',
            transition: 'all 0.15s ease'
          }}
        >
          🔍 สำรวจแล้ว: <span>{analyticsStats.surveyed} ({analyticsStats.surveyPct}%)</span>
        </button>

        {/* In Repair / Broken Chip */}
        <button
          type="button"
          className={`analytics-chip ${repairFilter === 'in_repair' ? 'active' : ''}`}
          onClick={() => setRepairFilter(prev => prev === 'in_repair' ? '' : 'in_repair')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '20px',
            fontSize: '0.775rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: '1px solid rgba(234, 88, 12, 0.4)',
            background: repairFilter === 'in_repair' ? '#ea580c' : 'rgba(234, 88, 12, 0.12)',
            color: repairFilter === 'in_repair' ? '#fff' : '#ea580c',
            transition: 'all 0.15s ease'
          }}
        >
          🛠️ อยู่ระหว่างซ่อม: <span>{analyticsStats.inRepair}</span>
        </button>

        {/* Clear Filters button if any active */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={handleResetFilters}
            style={{ marginLeft: 'auto', color: 'var(--danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <RotateCcw size={13} /> ล้างตัวกรอง ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Main Filter, Search and Sorting Toolbar */}
      <div className="filter-panel glass-panel">
        <div className="search-box" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="ค้นหารหัส, ชื่อ, หมายเหตุ, สถานที่, ผู้รับผิดชอบ..." 
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setIsScannerOpen(true)}
            title="เปิดกล้องสแกนบาร์โค้ด/QR Code รหัสครุภัณฑ์"
            style={{
              position: 'absolute',
              right: '0.35rem',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '0.35rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <QrCode size={15} /> สแกน
          </button>
        </div>

        <div className="filter-dropdowns">
          {/* Status Dropdown */}
          <div className="filter-item">
            <Filter size={14} />
            <select 
              className="form-select filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">ทุกสถานะ</option>
              <option value="ใช้งานได้">ใช้งานได้</option>
              <option value="ชำรุด">ชำรุด</option>
              <option value="รอจำหน่าย">รอจำหน่าย</option>
              <option value="ขอป้ายรหัสใหม่">ขอป้ายรหัสใหม่</option>
              <option value="รอโอน">รอโอน</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          {/* Department Dropdown */}
          <div className="filter-item">
            <Building2 size={14} />
            <select 
              className="form-select filter-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              disabled={!isOrgWide}
            >
              {isOrgWide ? (
                <>
                  <option value="">ทุกหน่วยงาน (ทั้งองค์กร)</option>
                  {uniqueDepts.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </>
              ) : (
                <option value={userDept}>เฉพาะหน่วยงาน: {userDept}</option>
              )}
            </select>
          </div>

          {/* Location / Room Searchable Dropdown */}
          <div className="filter-item" style={{ minWidth: '180px', maxWidth: '230px' }}>
            <SearchableSelect
              options={[
                { value: '', label: 'ทุกสถานที่ / ห้อง' },
                ...uniqueLocations.map(loc => ({ value: loc, label: loc }))
              ]}
              value={locationFilter}
              onChange={(val) => setLocationFilter(val)}
              placeholder="ทุกสถานที่ / ห้อง"
              compact={true}
              clearable={true}
              icon={<MapPin size={14} color="var(--text-muted)" />}
              dropdownWidth="260px"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="filter-item">
            <ArrowUpDown size={14} />
            <select
              className="form-select filter-select"
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                setSortBy(field as SortField);
                setSortOrder(order as SortDirection);
              }}
              title="เลือกการเรียงลำดับข้อมูล"
            >
              <option value="id_asc">🏷️ รหัสครุภัณฑ์ (A ➔ Z / น้อย ➔ มาก)</option>
              <option value="id_desc">🏷️ รหัสครุภัณฑ์ (Z ➔ A / มาก ➔ น้อย)</option>
              <option value="name_asc">📝 ชื่อครุภัณฑ์ (ก ➔ ฮ / A ➔ Z)</option>
              <option value="name_desc">📝 ชื่อครุภัณฑ์ (ฮ ➔ ก / Z ➔ A)</option>
              <option value="receivedDate_desc">📅 วันที่ตรวจรับ (ล่าสุดก่อน ➔ เก่า)</option>
              <option value="receivedDate_asc">📅 วันที่ตรวจรับ (เก่าก่อน ➔ ล่าสุด)</option>
              <option value="location_asc">📍 สถานที่จัดเก็บ (ก ➔ ฮ)</option>
              <option value="department_asc">🏢 ฝ่าย/หน่วยงาน (ก ➔ ฮ)</option>
              <option value="status_asc">🚦 สถานะ (ก ➔ ฮ)</option>
              <option value="updatedAt_desc">⏱️ บันทึกล่าสุด (ใหม่ ➔ เก่า)</option>
            </select>
          </div>

          {/* Advanced Filters Toggle Button */}
          <button
            type="button"
            className={`btn ${showAdvancedFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowAdvancedFilters(prev => !prev)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.75rem', position: 'relative' }}
            title="เปิด/ปิด แผงตัวกรองเชิงลึก"
          >
            <SlidersHorizontal size={14} />
            <span>ตัวกรองละเอียด</span>
            {(surveyFilter || repairFilter || dateStart || dateEnd) && (
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#ef4444', 
                position: 'absolute', 
                top: '4px', 
                right: '4px' 
              }} />
            )}
          </button>

          {/* Export to Excel */}
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleExportExcel}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', color: '#10b981', borderColor: '#10b981' }}
            title="ส่งออกรายงานเป็นไฟล์ Excel / Spreadsheet (CSV)"
          >
            <FileSpreadsheet size={15} /> Export Excel / Sheet
          </button>

          {/* Print Report */}
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setShowPrintModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem' }}
          >
            <Printer size={15} /> พิมพ์รายงาน / ออกรายการ
          </button>

          {/* View Mode Toggle (Grid / Table) */}
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active-toggle' : ''}`}
              onClick={() => setViewMode('grid')}
              title="แสดงแบบการ์ด (Card View)"
            >
              <Grid size={16} />
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'table' ? 'active-toggle' : ''}`}
              onClick={() => setViewMode('table')}
              title="แสดงแบบตาราง (Table View)"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Advanced Filters Drawer */}
      {showAdvancedFilters && (
        <div className="advanced-filters-panel glass-panel animate-fade-in" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <SlidersHorizontal size={16} /> ตัวกรองละเอียดเพื่อการวิเคราะห์ข้อมูล (Advanced Analysis Filters)
            </h4>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={handleResetFilters}
                style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <RotateCcw size={12} /> รีเซ็ตตัวกรองทั้งหมด
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Survey Status Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>🔍 สถานะการสำรวจตรวจนับ</label>
              <select
                className="form-select"
                value={surveyFilter}
                onChange={(e) => setSurveyFilter(e.target.value as any)}
                style={{ fontSize: '0.85rem' }}
              >
                <option value="">ทุกสถานะการสำรวจ (ทั้งหมด)</option>
                <option value="surveyed">🟢 เคยสำรวจตรวจนับแล้ว</option>
                <option value="unsurveyed">⚪ ยังไม่เคยสำรวจตรวจนับ</option>
              </select>
            </div>

            {/* Repair / Maintenance Status Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>🛠️ ประวัติการส่งซ่อมบำรุง</label>
              <select
                className="form-select"
                value={repairFilter}
                onChange={(e) => setRepairFilter(e.target.value as any)}
                style={{ fontSize: '0.85rem' }}
              >
                <option value="">ทั้งหมด (ทุกประวัติ)</option>
                <option value="in_repair">⚠️ อยู่ระหว่างส่งซ่อม / ชำรุด</option>
                <option value="has_history">📋 มีประวัติส่งซ่อมในระบบ</option>
              </select>
            </div>

            {/* Date Start Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>📅 ตรวจรับเข้าตั้งแต่วันที่</label>
              <input
                type="date"
                className="form-input"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {/* Date End Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>📅 จนถึงวันที่</label>
              <input
                type="date"
                className="form-input"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Item count & Pagination Header */}
      {sortedAssets.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div>
            พบข้อมูลทั้งหมด <strong>{totalItems}</strong> รายการ 
            {hasActiveFilters && (
              <span style={{ color: 'var(--primary)', marginLeft: '0.5rem', fontWeight: 600 }}>
                (กรองจากทั้งหมด {scopedAssetsPool.length} รายการ)
              </span>
            )}
            {pageSize !== 'all' && totalItems > pageSize && (
              <span> (แสดงหน้า {safeCurrentPage} / {totalPages})</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              เรียงโดย: <strong>
                {sortBy === 'id' ? 'รหัสครุภัณฑ์' : sortBy === 'name' ? 'ชื่อ' : sortBy === 'receivedDate' ? 'วันที่รับเข้า' : sortBy === 'location' ? 'สถานที่' : sortBy === 'department' ? 'หน่วยงาน' : sortBy === 'status' ? 'สถานะ' : 'บันทึกล่าสุด'}
              </strong> ({sortOrder === 'asc' ? 'น้อย➔มาก' : 'มาก➔น้อย'})
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>แสดง:</span>
              <select
                className="form-select"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                style={{ fontSize: '0.8rem', padding: '0.2rem 1.8rem 0.2rem 0.5rem', height: '30px' }}
              >
                <option value={24}>24 รายการ</option>
                <option value={48}>48 รายการ</option>
                <option value={96}>96 รายการ</option>
                <option value="all">แสดงทั้งหมด</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Display */}
      {sortedAssets.length === 0 ? (
        <div className="empty-results glass-panel">
          <ShieldAlert size={40} color="var(--text-muted)" />
          <h3>ไม่พบข้อมูลครุภัณฑ์ที่ค้นหา</h3>
          <p>ลองปรับคำค้นหา หรือเอาฟิลเตอร์ตัวกรองออกเพื่อแสดงผลใหม่อีกครั้ง</p>
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
              style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={14} /> ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="asset-grid">
          {paginatedAssets.map((asset) => (
            <div key={asset.id} className="asset-card glass-panel" onClick={() => setSelectedAsset(asset)}>
              <div className="asset-card-image-box">
                <img 
                  src={asset.imageUrl || FALLBACK_ASSET_IMG} 
                  alt={asset.name || 'ครุภัณฑ์'}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = FALLBACK_ASSET_IMG;
                  }}
                />
                <span className={`badge ${statusColors[asset.status] || 'badge-muted'} asset-status-badge`}>
                  {asset.status || 'ใช้งานได้'}
                </span>
              </div>
              <div className="asset-card-body">
                <span className="asset-card-id">{asset.id}</span>
                <h3 className="asset-card-title">{asset.name}</h3>
                {asset.note && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '0.15rem 0.4rem', borderRadius: '4px', margin: '0.2rem 0 0.35rem 0', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', maxWidth: '100%' }}>
                    <span>🏷️</span>
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.note}</span>
                  </div>
                )}
                <div className="asset-card-meta">
                  <span className="meta-loc">📍 {asset.location || '-'}</span>
                  <span className="meta-dept">🏢 {asset.department || '-'}</span>
                </div>
              </div>
              <div className="asset-card-actions">
                <button className="btn btn-secondary btn-xs" onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAsset(asset);
                }}>
                  <Eye size={12} /> รายละเอียด
                </button>
                <button 
                  className="btn btn-primary btn-xs" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAllowedToEdit(asset)) {
                      onAssetEdit(asset);
                    }
                  }}
                  disabled={!isAllowedToEdit(asset)}
                  style={!isAllowedToEdit(asset) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  title={!isAllowedToEdit(asset) ? "สงวนสิทธิ์แก้ไขเฉพาะผู้ดูแล หรือฝ่ายที่ครอบครองพัสดุนี้" : "แก้ไขรายละเอียดครุภัณฑ์"}
                >
                  <Edit3 size={12} /> แก้ไข
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container glass-panel">
          <table className="custom-table">
            <thead>
              <tr>
                <th onClick={() => handleToggleSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }} title="คลิกเพื่อเรียงตามรหัส">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    รหัสครุภัณฑ์
                    {sortBy === 'id' ? (sortOrder === 'asc' ? <ArrowUp size={14} color="var(--primary)" /> : <ArrowDown size={14} color="var(--primary)" />) : <ArrowUpDown size={12} color="var(--text-muted)" />}
                  </div>
                </th>
                <th onClick={() => handleToggleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }} title="คลิกเพื่อเรียงตามชื่อ">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    ชื่อครุภัณฑ์
                    {sortBy === 'name' ? (sortOrder === 'asc' ? <ArrowUp size={14} color="var(--primary)" /> : <ArrowDown size={14} color="var(--primary)" />) : <ArrowUpDown size={12} color="var(--text-muted)" />}
                  </div>
                </th>
                <th onClick={() => handleToggleSort('location')} style={{ cursor: 'pointer', userSelect: 'none' }} title="คลิกเพื่อเรียงตามสถานที่">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    สถานที่
                    {sortBy === 'location' ? (sortOrder === 'asc' ? <ArrowUp size={14} color="var(--primary)" /> : <ArrowDown size={14} color="var(--primary)" />) : <ArrowUpDown size={12} color="var(--text-muted)" />}
                  </div>
                </th>
                <th onClick={() => handleToggleSort('department')} style={{ cursor: 'pointer', userSelect: 'none' }} title="คลิกเพื่อเรียงตามหน่วยงาน">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    หน่วยงานรับผิดชอบ
                    {sortBy === 'department' ? (sortOrder === 'asc' ? <ArrowUp size={14} color="var(--primary)" /> : <ArrowDown size={14} color="var(--primary)" />) : <ArrowUpDown size={12} color="var(--text-muted)" />}
                  </div>
                </th>
                <th onClick={() => handleToggleSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }} title="คลิกเพื่อเรียงตามสถานะ">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    สถานะ
                    {sortBy === 'status' ? (sortOrder === 'asc' ? <ArrowUp size={14} color="var(--primary)" /> : <ArrowDown size={14} color="var(--primary)" />) : <ArrowUpDown size={12} color="var(--text-muted)" />}
                  </div>
                </th>
                <th onClick={() => handleToggleSort('receivedDate')} style={{ cursor: 'pointer', userSelect: 'none' }} title="คลิกเพื่อเรียงตามวันที่รับเข้า">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    วันที่รับเข้า
                    {sortBy === 'receivedDate' ? (sortOrder === 'asc' ? <ArrowUp size={14} color="var(--primary)" /> : <ArrowDown size={14} color="var(--primary)" />) : <ArrowUpDown size={12} color="var(--text-muted)" />}
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>เครื่องมือ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.map((asset) => (
                <tr key={asset.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedAsset(asset)}>
                  <td><code>{asset.id}</code></td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{asset.name}</strong>
                    {asset.note && (
                      <div style={{ fontSize: '0.725rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
                        🏷️ {asset.note}
                      </div>
                    )}
                  </td>
                  <td>{asset.location || '-'}</td>
                  <td>{asset.department || '-'}</td>
                  <td>
                    <span className={`badge ${statusColors[asset.status] || 'badge-muted'}`}>
                      {asset.status || 'ใช้งานได้'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {asset.receivedDate || '-'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-xs" onClick={() => setSelectedAsset(asset)}>
                        <Eye size={12} />
                      </button>
                      <button 
                        className="btn btn-primary btn-xs" 
                        onClick={() => {
                          if (isAllowedToEdit(asset)) {
                            onAssetEdit(asset);
                          }
                        }}
                        disabled={!isAllowedToEdit(asset)}
                        style={!isAllowedToEdit(asset) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        title={!isAllowedToEdit(asset) ? "สงวนสิทธิ์แก้ไขเฉพาะผู้ดูแล หรือฝ่ายที่ครอบครองพัสดุนี้" : "แก้ไขครุภัณฑ์"}
                      >
                        <Edit3 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls Footer */}
      {pageSize !== 'all' && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setCurrentPage(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={safeCurrentPage <= 1}
            title="หน้าแรกสุด"
            style={{ padding: '0.35rem 0.55rem' }}
          >
            <ChevronsLeft size={16} />
          </button>
          
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setCurrentPage(prev => Math.max(1, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={safeCurrentPage <= 1}
            title="หน้าก่อนหน้า"
            style={{ padding: '0.35rem 0.55rem' }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          {(() => {
            const pages: (number | string)[] = [];
            const delta = 2;
            const left = safeCurrentPage - delta;
            const right = safeCurrentPage + delta;

            for (let i = 1; i <= totalPages; i++) {
              if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                pages.push(i);
              } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
              }
            }

            return pages.map((p, idx) => {
              if (p === '...') {
                return <span key={`ellipsis-${idx}`} style={{ padding: '0.2rem 0.4rem', color: 'var(--text-muted)' }}>...</span>;
              }
              const isCurrent = p === safeCurrentPage;
              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  className={isCurrent ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                  onClick={() => {
                    setCurrentPage(Number(p));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ minWidth: '34px', padding: '0.35rem 0.5rem', fontWeight: isCurrent ? 800 : 500 }}
                >
                  {p}
                </button>
              );
            });
          })()}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setCurrentPage(prev => Math.min(totalPages, prev + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={safeCurrentPage >= totalPages}
            title="หน้าถัดไป"
            style={{ padding: '0.35rem 0.55rem' }}
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setCurrentPage(totalPages);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={safeCurrentPage >= totalPages}
            title="หน้าท้ายสุด"
            style={{ padding: '0.35rem 0.55rem' }}
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      )}

      {/* Asset Lifecycle Drawer Modal */}
      {selectedAsset && createPortal(
        <AssetModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onEditClick={(asset) => {
            if (isAllowedToEdit(asset)) {
              setSelectedAsset(null);
              onAssetEdit(asset);
            } else {
              alert('สงวนสิทธิ์การแก้ไขเฉพาะผู้ดูแลระบบ หรือฝ่ายที่ดูแลครุภัณฑ์ชิ้นนี้เท่านั้น');
            }
          }}
          audits={audits}
          repairs={repairs}
          surveys={surveys}
          schedules={schedules}
          currentUser={currentUser}
          onRefreshData={onRefreshData}
          spareParts={spareParts}
          onAddSparePart={onAddSparePart}
          onUpdateSparePart={onUpdateSparePart}
          onDeleteSparePart={onDeleteSparePart}
        />,
        document.body
      )}

      <style>{`
        .module-title-section {
          margin-bottom: 1.5rem;
        }

        .module-title-section h2 {
          font-size: 1.45rem;
          font-weight: 800;
        }

        .module-title-section p {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .filter-panel {
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 2.75rem;
        }

        .filter-dropdowns {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--text-secondary);
        }

        .filter-select {
          padding: 0.5rem 2rem 0.5rem 0.75rem;
          font-size: 0.85rem;
          border-radius: var(--radius-sm);
          width: auto;
          min-width: 140px;
        }

        .view-toggle {
          display: flex;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          background-color: var(--bg-tertiary);
        }

        .toggle-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .active-toggle {
          background-color: var(--bg-secondary);
          color: var(--primary);
        }

        /* Asset Grid */
        .asset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        .asset-card {
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .asset-card-image-box {
          width: 100%;
          aspect-ratio: 16/10;
          overflow: hidden;
          position: relative;
          background-color: var(--bg-tertiary);
          border-bottom: 1px solid var(--border);
        }

        .asset-card-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .asset-card:hover .asset-card-image-box img {
          transform: scale(1.05);
        }

        .asset-status-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        .asset-card-body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
        }

        .asset-card-id {
          font-size: 0.725rem;
          font-family: monospace;
          color: var(--text-muted);
          font-weight: 550;
        }

        .asset-card-title {
          font-size: 0.95rem;
          font-weight: 750;
          line-height: 1.35;
          color: var(--text-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 2.7rem;
        }

        .asset-card-meta {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.775rem;
          color: var(--text-secondary);
          margin-top: auto;
        }

        .asset-card-actions {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          background-color: rgba(0, 0, 0, 0.01);
        }

        .empty-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem;
          text-align: center;
          gap: 0.75rem;
        }

        .empty-results p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          max-width: 320px;
        }

        @media (max-width: 576px) {
          .filter-panel {
            gap: 1rem;
          }
          .search-box {
            min-width: 100%;
          }
          .filter-dropdowns {
            width: 100%;
            justify-content: space-between;
          }
          .filter-select {
            min-width: 120px;
          }
        }
      `}</style>
      {/* REPORT PRINT MODAL OVERLAY */}
      {showPrintModal && createPortal(
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '900px', width: '100%', margin: '0 auto 1.5rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100000 }}>
            <div>
              <h4 style={{ fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>📑 พิมพ์รายงานบัญชีครุภัณฑ์</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {isOrgWide ? (deptFilter ? `หน่วยงาน: ${deptFilter}` : 'ทุกหน่วยงาน (ทั้งองค์กร)') : `เฉพาะหน่วยงาน: ${userDept}`} — รวม {filteredAssets.length} รายการ
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-success"
                onClick={handleExportExcel}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#10b981', borderColor: '#10b981', color: '#fff' }}
              >
                <FileSpreadsheet size={16} /> ส่งออก Excel / Sheet
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={16} /> สั่งพิมพ์ / บันทึก PDF
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowPrintModal(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <X size={16} /> ปิดหน้าต่าง
              </button>
            </div>
          </div>

          <div className="print-sheet-paper" style={{ background: '#ffffff', color: '#000000', maxWidth: '900px', width: '100%', margin: '0 auto', padding: '2rem', borderRadius: '4px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontFamily: 'Sarabun, TH Sarabun New, sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 0.25rem 0' }}>รายงานบัญชีควบคุมครุภัณฑ์พัสดุ</h2>
              <p style={{ fontSize: '0.95rem', margin: 0 }}>
                {isOrgWide ? (deptFilter ? `หน่วยงาน: ${deptFilter}` : 'ข้อมูลครุภัณฑ์ทุกหน่วยงาน (ภาพรวมองค์กร)') : `เฉพาะหน่วยงาน: ${userDept}`}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#555', margin: '0.25rem 0 0 0' }}>
                วันที่พิมพ์รายงาน: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น. | ผู้พิมพ์: {currentUser?.name || 'แอดมินพัสดุ'}
              </p>
            </div>

            {/* Summary Statistics */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.85rem', background: '#f8fafc', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
              <div><strong>รายการทั้งหมด:</strong> {filteredAssets.length} ชิ้น</div>
              <div><strong>ใช้งานได้:</strong> {filteredAssets.filter(a => a.status === 'ใช้งานได้').length} ชิ้น</div>
              <div><strong>ชำรุด:</strong> {filteredAssets.filter(a => a.status === 'ชำรุด').length} ชิ้น</div>
              <div><strong>รอจำหน่าย:</strong> {filteredAssets.filter(a => a.status === 'รอจำหน่าย').length} ชิ้น</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #000', borderBottom: '2px solid #000' }}>
                  <th style={{ padding: '0.5rem', width: '5%' }}>ลำดับ</th>
                  <th style={{ padding: '0.5rem', width: '22%' }}>รหัสครุภัณฑ์</th>
                  <th style={{ padding: '0.5rem', width: '28%' }}>รายการ / ชื่อเครื่องมือ</th>
                  <th style={{ padding: '0.5rem', width: '18%' }}>หน่วยงาน / แผนก</th>
                  <th style={{ padding: '0.5rem', width: '17%' }}>สถานที่จัดเก็บ</th>
                  <th style={{ padding: '0.5rem', width: '10%', textAlign: 'center' }}>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset, idx) => (
                  <tr key={asset.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ padding: '0.45rem 0.5rem', fontWeight: 'bold' }}>{asset.id}</td>
                    <td style={{ padding: '0.45rem 0.5rem' }}>{asset.name}</td>
                    <td style={{ padding: '0.45rem 0.5rem' }}>{asset.department || '-'}</td>
                    <td style={{ padding: '0.45rem 0.5rem' }}>{asset.location || '-'}</td>
                    <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                      {asset.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Footer */}
            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', pageBreakInside: 'avoid' }}>
              <div style={{ textAlign: 'center', width: '40%' }}>
                <p>ลงชื่อ......................................................................</p>
                <p style={{ marginTop: '0.25rem' }}>({currentUser?.name || '....................................................'})</p>
                <p style={{ color: '#555', fontSize: '0.8rem' }}>ตำแหน่ง {currentUser?.role?.toUpperCase() || 'เจ้าหน้าที่ผู้รายงาน'}</p>
              </div>

              <div style={{ textAlign: 'center', width: '40%' }}>
                <p>ลงชื่อ......................................................................</p>
                <p style={{ marginTop: '0.25rem' }}>(....................................................)</p>
                <p style={{ color: '#555', fontSize: '0.8rem' }}>หัวหน้างาน / ผู้รับรองรายงาน</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CAMERA BARCODE / QR SCANNER MODAL */}
      {isScannerOpen && createPortal(
        <div 
          className="modal-overlay animate-fade-in" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0,
            bottom: 0,
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0,0,0,0.85)', 
            zIndex: 99999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem' 
          }}
        >
          <div 
            className="glass-panel animate-scale-up" 
            style={{ 
              maxWidth: '500px', 
              width: '100%', 
              padding: '1.25rem', 
              borderRadius: 'var(--radius-lg)', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <Camera size={18} color="var(--primary)" /> สแกนป้ายรหัสครุภัณฑ์
              </h4>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={() => setIsScannerOpen(false)}
                style={{ padding: '0.25rem 0.5rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <BarcodeScanner 
                onScanSuccess={(decodedText) => {
                  const cleanedCode = decodedText.trim();
                  setSearchTerm(cleanedCode);
                  setIsScannerOpen(false);

                  // If exact asset match found, auto open asset detail modal
                  const matchedAsset = assets.find(a => (a.id || '').toLowerCase() === cleanedCode.toLowerCase());
                  if (matchedAsset) {
                    setSelectedAsset(matchedAsset);
                  }
                }}
                onCloseCamera={() => setIsScannerOpen(false)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>📷 ส่องกล้องไปที่ป้ายบาร์โค้ด หรือ QR Code</span>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setIsScannerOpen(false)}
              >
                ปิดกล้อง
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Printable CSS Media Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-preview-overlay, .print-preview-overlay * {
            visibility: visible;
          }
          .print-preview-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important;
          }
          .print-actions-bar {
            display: none !important;
          }
          .print-sheet-paper {
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
