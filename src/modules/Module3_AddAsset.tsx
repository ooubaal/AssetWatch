import React, { useState, useEffect } from 'react';
import { PlusCircle, QrCode, FileText, Camera, AlertCircle, CheckCircle, Download, UploadCloud, Clipboard, Trash2, HelpCircle, Printer, Image as ImageIcon, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { Asset, DepartmentLocationConfig, UserAccount } from '../utils/mockData';
import { uploadImage, compressFileOrPdf } from '../services/dbService';
import confetti from 'canvas-confetti';
import { SearchableSelect } from '../components/SearchableSelect';

interface Module3AddAssetProps {
  assets: Asset[];
  onAddAsset: (asset: Asset) => Promise<void>;
  onBulkAddAssets: (newAssets: Asset[]) => Promise<void>;
  onLogAudit: (trail: { assetId: string; assetName: string; action: any; operator: string; details: string }) => Promise<void>;
  prefilledAssetId: string | null;
  clearPrefilledAssetId: () => void;
  setCurrentTab: (tab: string) => void;
  departments: DepartmentLocationConfig[];
  currentUser: UserAccount | null;
}

export const Module3_AddAsset: React.FC<Module3AddAssetProps> = ({
  assets,
  onAddAsset,
  onBulkAddAssets,
  onLogAudit,
  prefilledAssetId,
  clearPrefilledAssetId,
  setCurrentTab,
  departments,
  currentUser
}) => {
  // Form states
  const [assetId, setAssetId] = useState('');
  const [name, setName] = useState('');
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState(''); // Represent Seller / Supplier / Donor
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<Asset['status']>('ใช้งานได้');
  const [isCustomInput, setIsCustomInput] = useState(false);
  
  // Image Upload States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sub-tab selection state
  const isAdmin = currentUser?.role === 'admin';
  const [activeSubTab, setActiveSubTab] = useState<'single' | 'mass' | 'report'>('single');

  // Report states
  const [selectedReportDept, setSelectedReportDept] = useState(() => {
    return (currentUser?.role === 'head' || currentUser?.role === 'operator' || currentUser?.role === 'user') ? currentUser.department : 'all';
  });
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isReportPrintOpen, setIsReportPrintOpen] = useState(false);

  // Sync operator user's department restriction
  useEffect(() => {
    if (currentUser?.role === 'head' || currentUser?.role === 'operator' || currentUser?.role === 'user') {
      setSelectedReportDept(currentUser.department);
    }
  }, [currentUser]);

  // Mass Import states
  const [pasteData, setPasteData] = useState('');
  const [fileData, setFileData] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  
  // Batch & Single Row Photos state for Mass Import
  const [batchImageFiles, setBatchImageFiles] = useState<Map<string, { file: File; previewUrl: string }>>(new Map());
  const [rowCustomImages, setRowCustomImages] = useState<Map<number, { file: File; previewUrl: string }>>(new Map());
  const [savingProgress, setSavingProgress] = useState<{ current: number; total: number } | null>(null);
  
  interface ParsedAssetRow {
    rowNum: number;
    id: string;
    name: string;
    receivedDate: string;
    source: string;
    location: string;
    department: string;
    responsiblePerson: string;
    note: string;
    status: Asset['status'];
    imageUrl?: string;
    errors: string[];
    warnings: string[];
    isValid: boolean;
  }
  
  const [parsedRows, setParsedRows] = useState<ParsedAssetRow[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'valid' | 'invalid'>('all');
  const [massSuccess, setMassSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  // Normalize ID for flexible matching (e.g. 6901-001-0001 -> 69010010001)
  const normalizeId = (str: string) => str.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  const handleBatchImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newMap = new Map(batchImageFiles);
    Array.from(e.target.files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const norm = normalizeId(baseName);
      if (norm) {
        newMap.set(norm, {
          file,
          previewUrl: URL.createObjectURL(file)
        });
      }
    });
    setBatchImageFiles(newMap);
  };

  const handleRowImageChange = (rowNum: number, file: File) => {
    const newMap = new Map(rowCustomImages);
    newMap.set(rowNum, {
      file,
      previewUrl: URL.createObjectURL(file)
    });
    setRowCustomImages(newMap);
  };

  const getRowImage = (row: ParsedAssetRow) => {
    if (rowCustomImages.has(row.rowNum)) {
      return {
        previewUrl: rowCustomImages.get(row.rowNum)!.previewUrl,
        file: rowCustomImages.get(row.rowNum)!.file,
        source: 'manual' as const
      };
    }
    const norm = normalizeId(row.id);
    if (norm && batchImageFiles.has(norm)) {
      return {
        previewUrl: batchImageFiles.get(norm)!.previewUrl,
        file: batchImageFiles.get(norm)!.file,
        source: 'matched' as const
      };
    }
    if (row.imageUrl) {
      return {
        previewUrl: row.imageUrl,
        file: null,
        source: 'url' as const
      };
    }
    return null;
  };

  // Download template CSV file
  const handleDownloadTemplate = () => {
    const headers = ['id', 'name', 'receivedDate', 'source', 'location', 'department', 'responsiblePerson', 'note', 'status', 'imageUrl'];
    const exampleRow = ['6901-001-0001', 'คอมพิวเตอร์ All-in-One Dell', '2026-06-03', 'บริษัท เอ บี ซี จำกัด', 'ห้อง IT', 'ฝ่ายไอที', 'นายสมจิต รอดพ้น', 'สเปค Core i7 RAM 16GB', 'ใช้งานได้', ''];
    
    // Add UTF-8 BOM so Excel opens Thai characters correctly
    const csvContent = "\uFEFF" + [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'AssetWatch_Import_Template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-detect delimiter and split CSV line handling quoted values
  const parseCSVLine = (text: string, delimiter: string): string[] => {
    const result: string[] = [];
    let curVal = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(curVal.trim().replace(/^"|"$/g, ''));
        curVal = '';
      } else {
        curVal += char;
      }
    }
    result.push(curVal.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const parseImportData = (rawText: string, isPaste: boolean) => {
    if (!rawText.trim()) return [];
    
    const lines = rawText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    // Auto-detect delimiter
    let delimiter = ',';
    delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(';') ? ';' : ',');
    
    let startIndex = 0;
    const firstLine = lines[0].toLowerCase();
    
    // Skip headers if the first line looks like a header line
    const hasHeaders = firstLine.includes('id') || firstLine.includes('name') || 
                       firstLine.includes('รหัส') || firstLine.includes('ชื่อ') ||
                       firstLine.includes('received') || firstLine.includes('date');
                       
    if (hasHeaders) {
      startIndex = 1;
    }
    
    const parsedRows = [];
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const values = parseCSVLine(line, delimiter);
      // Only process lines that have at least some data
      if (values.length > 0 && values.some(v => v.trim() !== '')) {
        parsedRows.push({
          index: i + 1,
          values
        });
      }
    }
    return parsedRows;
  };

  const validateRow = (
    rowNum: number, 
    values: string[], 
    existingAssets: Asset[], 
    systemDepts: DepartmentLocationConfig[], 
    seenIds: Set<string>
  ): ParsedAssetRow => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const rawId = (values[0] || '').trim();
    const rawName = (values[1] || '').trim();
    const rawReceivedDate = (values[2] || '').trim();
    const rawSource = (values[3] || '').trim();
    const rawLocation = (values[4] || '').trim();
    const rawDepartment = (values[5] || '').trim();
    const rawResponsible = (values[6] || '').trim();
    const rawNote = (values[7] || '').trim();
    const rawStatus = (values[8] || '').trim();
    const rawImageUrl = (values[9] || '').trim();
    
    // 1. ID Validation
    let id = rawId.toUpperCase();
    if (!id) {
      errors.push('รหัสครุภัณฑ์ต้องไม่ว่าง');
    } else {
      if (seenIds.has(id)) {
        errors.push(`รหัสครุภัณฑ์ซ้ำกันในข้อมูลชุดนี้ (${id})`);
      } else {
        seenIds.add(id);
      }
      
      const isDuplicateInDb = existingAssets.some(a => a.id === id);
      if (isDuplicateInDb) {
        errors.push(`รหัสครุภัณฑ์นี้ถูกลงทะเบียนไว้ในระบบแล้ว (${id})`);
      }
    }
    
    // 2. Name Validation
    let name = rawName;
    if (!name) {
      errors.push('ชื่อครุภัณฑ์ต้องไม่ว่าง');
    }
    
    // 3. Date Validation/Fallback
    let receivedDate = rawReceivedDate;
    if (!receivedDate) {
      receivedDate = new Date().toISOString().split('T')[0];
      warnings.push(`ไม่ได้ระบุวันที่ตรวจรับ (ระบบจะใช้วันนี้: ${receivedDate})`);
    } else {
      const testDate = new Date(receivedDate);
      if (isNaN(testDate.getTime())) {
        receivedDate = new Date().toISOString().split('T')[0];
        warnings.push(`รูปแบบวันที่ไม่ถูกต้อง (ระบบจะใช้วันนี้: ${receivedDate})`);
      }
    }
    
    // 4. Source
    let source = rawSource || 'ไม่ระบุ/บริจาค';
    if (!rawSource) {
      warnings.push("ไม่ได้ระบุผู้จำหน่าย (ตั้งค่าเป็น: 'ไม่ระบุ/บริจาค')");
    }
    
    // 5. Department Validation/Fallback
    let department = rawDepartment;
    if (!department) {
      department = 'ฝ่ายพัสดุหลัก';
      warnings.push("ไม่ได้ระบุฝ่ายที่ดูแล (ตั้งค่าเป็น: 'ฝ่ายพัสดุหลัก')");
    } else {
      const deptExists = systemDepts.some(d => d.name.toLowerCase() === department.toLowerCase());
      if (!deptExists && systemDepts.length > 0) {
        warnings.push(`ฝ่าย '${department}' ไม่พบในระบบ (จะสร้างเป็นแผนกใหม่)`);
      }
    }
    
    // 6. Location Validation/Fallback
    let location = rawLocation;
    if (!location) {
      location = 'คลังพัสดุกลาง';
      warnings.push("ไม่ได้ระบุสถานที่ตั้ง (ตั้งค่าเป็น: 'คลังพัสดุกลาง')");
    } else {
      const currentDeptObj = systemDepts.find(d => d.name.toLowerCase() === department.toLowerCase());
      if (currentDeptObj) {
        const locExists = currentDeptObj.locations.some(l => l.toLowerCase() === location.toLowerCase());
        if (!locExists && currentDeptObj.locations.length > 0) {
          warnings.push(`ไม่พบห้อง '${location}' ในฝ่าย '${department}' ของระบบ (จะบันทึกเป็นห้องใหม่)`);
        }
      }
    }
    
    // 7. Responsible Person
    let responsiblePerson = rawResponsible || 'ไม่มี';
    if (!rawResponsible) {
      warnings.push("ไม่ได้ระบุผู้รับผิดชอบ (ตั้งค่าเป็น: 'ไม่มี')");
    }
    
    // 8. Note
    let note = rawNote || '-';
    
    // 9. Status Validation
    const validStatuses: Asset['status'][] = ['ใช้งานได้', 'รอจำหน่าย', 'ชำรุด', 'ขอป้ายรหัสใหม่', 'รอโอน', 'อื่นๆ'];
    let status: Asset['status'] = 'ใช้งานได้';
    if (rawStatus) {
      if (validStatuses.includes(rawStatus as any)) {
        status = rawStatus as Asset['status'];
      } else {
        warnings.push(`สถานะ '${rawStatus}' ไม่ถูกต้องในระบบ (ปรับเป็น: 'ใช้งานได้')`);
      }
    } else {
      warnings.push("ไม่ได้ระบุสถานะ (ตั้งค่าเป็น: 'ใช้งานได้')");
    }
    
    return {
      rowNum,
      id,
      name,
      receivedDate,
      source,
      location,
      department,
      responsiblePerson,
      note,
      status,
      imageUrl: rawImageUrl || undefined,
      errors,
      warnings,
      isValid: errors.length === 0
    };
  };

  // Mass Import parsing logic triggered live on pasteData change
  useEffect(() => {
    if (pasteData) {
      const parsed = parseImportData(pasteData, true);
      const seenIds = new Set<string>();
      const validated = parsed.map(r => validateRow(r.index, r.values, assets, departments, seenIds));
      setParsedRows(validated);
    }
  }, [pasteData, assets, departments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setPasteData(''); // Clear paste data
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setFileData(text);
      
      const parsed = parseImportData(text, false);
      const seenIds = new Set<string>();
      const validated = parsed.map(r => validateRow(r.index, r.values, assets, departments, seenIds));
      setParsedRows(validated);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleResetImport = () => {
    setPasteData('');
    setFileData('');
    setFileName('');
    setParsedRows([]);
    setBatchImageFiles(new Map());
    setRowCustomImages(new Map());
    setMassSuccess(false);
    setImportedCount(0);
  };

  const handleMassImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;
    
    setSaving(true);
    setError(null);
    setSavingProgress({ current: 0, total: validRows.length });

    try {
      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินพัสดุ';
      const assetsToAdd: Asset[] = [];
      
      for (let i = 0; i < validRows.length; i++) {
        const r = validRows[i];
        setSavingProgress({ current: i + 1, total: validRows.length });
        
        const rowImg = getRowImage(r);
        let finalImageUrl = r.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
        
        if (rowImg && rowImg.file) {
          try {
            // uploadImage automatically compresses image to 1024px @ 0.7 quality (~30-80KB)
            finalImageUrl = await uploadImage(rowImg.file, 'assets');
          } catch (imgErr) {
            console.error(`Compression/Upload failed for row ${r.rowNum}:`, imgErr);
          }
        }
        
        assetsToAdd.push({
          id: r.id,
          name: r.name,
          imageUrl: finalImageUrl,
          receivedDate: r.receivedDate,
          source: r.source,
          location: r.location,
          department: r.department,
          responsiblePerson: r.responsiblePerson,
          note: r.note,
          status: r.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Save all in bulk
      await onBulkAddAssets(assetsToAdd);
      
      // Log Audit Trail
      await onLogAudit({
        assetId: 'SYSTEM',
        assetName: `นำเข้าแบบกลุ่ม: ${assetsToAdd.length} รายการ`,
        action: 'create',
        operator: operatorName,
        details: `แอดมินทำการนำเข้าข้อมูลครุภัณฑ์แบบกลุ่มสำเร็จ จำนวน ${assetsToAdd.length} รายการ (พร้อมประมวลผลและบีบอัดรูปภาพพัสดุ)`
      });
      
      // Confetti!
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.6 }
      });
      
      setImportedCount(assetsToAdd.length);
      setMassSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'เกิดข้อผิดพลาดระหว่างนำเข้าข้อมูลแบบกลุ่ม');
    } finally {
      setSaving(false);
      setSavingProgress(null);
    }
  };

  // If there's a prefilled ID from Module 2 (Scanned but unregistered), prefill it
  useEffect(() => {
    if (prefilledAssetId) {
      setAssetId(prefilledAssetId);
    }
  }, [prefilledAssetId]);

  // Prefill department and location from system configuration if available
  useEffect(() => {
    if (currentUser?.role === 'head' || currentUser?.role === 'operator' || currentUser?.role === 'user') {
      setIsCustomInput(false);
      setDepartment(currentUser.department);
      
      const foundDept = departments.find(d => d.name === currentUser.department);
      if (foundDept && foundDept.locations.length > 0) {
        if (!location || !foundDept.locations.includes(location)) {
          setLocation(foundDept.locations[0]);
        }
      }
    } else if (departments.length > 0 && !isCustomInput) {
      if (!department) {
        setDepartment(departments[0].name);
        if (departments[0].locations.length > 0) {
          setLocation(departments[0].locations[0]);
        }
      }
    }
  }, [departments, isCustomInput, department, currentUser, location]);

  const handleDepartmentSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptName = e.target.value;
    setDepartment(deptName);
    const found = departments.find(d => d.name === deptName);
    if (found && found.locations.length > 0) {
      setLocation(found.locations[0]);
    } else {
      setLocation('');
    }
  };

  const handleGenerateId = () => {
    // Generate unique standard format ID: YYMM-XXX-XXXX
    const thaiYear = String(new Date().getFullYear() + 543).slice(-2);
    const randomDept = Math.floor(100 + Math.random() * 900); // 3 digits
    const randomSeq = Math.floor(1000 + Math.random() * 9000); // 4 digits
    const generated = `${thaiYear}01-${randomDept}-${randomSeq}`;
    setAssetId(generated);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressFileOrPdf(file, 1400, 1400, 0.80);
        setImageFile(compressed);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(compressed);
      } catch {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // 1. Process image upload
      let finalImageUrl = '';
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, 'assets');
      } else {
        // Fallback default image placeholder
        finalImageUrl = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
      }

      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินพัสดุ';

      const newAsset: Asset = {
        id: assetId.trim().toUpperCase(),
        name: name.trim(),
        imageUrl: finalImageUrl,
        receivedDate,
        source: source.trim(),
        location: location.trim() || 'คลังพัสดุกลาง',
        department: department.trim() || 'ฝ่ายพัสดุหลัก',
        responsiblePerson: responsiblePerson.trim() || 'ไม่มี',
        note: note.trim(),
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 2. Add to database
      await onAddAsset(newAsset);

      // 3. Log Audit Trail
      await onLogAudit({
        assetId: newAsset.id,
        assetName: newAsset.name,
        action: 'create',
        operator: operatorName,
        details: `ขึ้นทะเบียนครุภัณฑ์รหัสใหม่ ผู้ขาย/ผู้บริจาค: ${newAsset.source} ตั้งที่: ${newAsset.location}`
      });

      // Show confetti for premium feeling!
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });

      setSuccess(true);
      clearPrefilledAssetId();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'รหัสครุภัณฑ์ซ้ำหรือเซิร์ฟเวอร์เกิดปัญหา โปรดกรอกข้อมูลให้ครบถ้วน');
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    setAssetId('');
    setName('');
    setImageFile(null);
    setImagePreview(null);
    setLocation('');
    setDepartment('');
    setResponsiblePerson('');
    setNote('');
    setSuccess(false);
    setError(null);
  };

  if (massSuccess) {
    return (
      <div className="module-container animate-fade-in">
        <div className="success-wizard-card glass-panel text-center">
          <div className="success-checkmark-wrapper">
            <CheckCircle size={44} color="var(--success)" />
          </div>
          <h2>นำเข้าข้อมูลแบบกลุ่มสำเร็จ!</h2>
          <p>
            ระบบได้ทำการลงทะเบียนและบันทึกครุภัณฑ์จำนวน <strong style={{ color: 'var(--success)', fontSize: '1.2rem' }}>{importedCount}</strong> รายการ เรียบร้อยแล้ว
          </p>

          <div className="success-card-actions">
            <button className="btn btn-secondary" onClick={() => setCurrentTab('module1')}>
              เปิดดูบัญชีคลัง (Module 1)
            </button>
            <button className="btn btn-primary" onClick={handleResetImport}>
              นำเข้าข้อมูลชุดอื่นเพิ่มเติม
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="module-container animate-fade-in">
        <div className="success-wizard-card glass-panel text-center">
          <div className="success-checkmark-wrapper">
            <CheckCircle size={44} color="var(--success)" />
          </div>
          <h2>ขึ้นทะเบียนครุภัณฑ์สำเร็จ!</h2>
          <p>
            ทรัพย์สินรหัส <code>{assetId}</code> ได้รับการขึ้นทะเบียนบัญชีควบคุมและบันทึกลงในคลาวด์เรียบร้อยแล้ว
          </p>

          <div className="success-intake-details">
            <div className="intake-detail-line"><span>ชื่ออุปกรณ์:</span> <strong>{name}</strong></div>
            <div className="intake-detail-line"><span>รหัสครุภัณฑ์:</span> <code>{assetId}</code></div>
            <div className="intake-detail-line"><span>สถานที่ติดตั้ง:</span> <span>📍 {location || 'คลังพัสดุกลาง'}</span></div>
          </div>

          <div className="success-card-actions">
            <button className="btn btn-secondary" onClick={() => setCurrentTab('module1')}>
              เปิดดูบัญชีคลัง (Module 1)
            </button>
            <button className="btn btn-primary" onClick={handleResetForm}>
              ลงทะเบียนเครื่องอื่นถัดไป
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>ขึ้นทะเบียนรับครุภัณฑ์ใหม่เข้าคลัง (Module 3)</h2>
        <p>บันทึกประวัติการรับมอบ ค้นหาภาพถ่าย อ้างอิงสัญญาสั่งซื้อพร้อมออกรหัสคุมบาร์โค้ด</p>
      </div>

      {/* Sub-tabs for Single, Mass (Admin), and Report */}
      <div className="sub-tabs-container">
        <button 
          type="button" 
          className={`sub-tab ${activeSubTab === 'single' ? 'active' : ''}`}
          onClick={() => {
            setActiveSubTab('single');
            handleResetForm();
            handleResetImport();
          }}
        >
          ✍️ ลงทะเบียนทีละชิ้น (Single Registration)
        </button>
        {isAdmin && (
          <button 
            type="button" 
            className={`sub-tab ${activeSubTab === 'mass' ? 'active' : ''}`}
            onClick={() => {
              setActiveSubTab('mass');
              handleResetForm();
              handleResetImport();
            }}
          >
            📋 นำเข้าข้อมูลแบบกลุ่ม (Admin Mass Import)
          </button>
        )}
        <button 
          type="button" 
          className={`sub-tab ${activeSubTab === 'report' ? 'active' : ''}`}
          onClick={() => {
            setActiveSubTab('report');
            handleResetForm();
            handleResetImport();
          }}
        >
          🖨️ รายงานครุภัณฑ์ลงทะเบียนใหม่ (Report)
        </button>
      </div>

      {activeSubTab === 'single' ? (
        <form onSubmit={handleSubmit} className="intake-form glass-panel">
          
          {/* Row 1: Asset ID & Name */}
          <div className="form-row-double">
            <div className="form-group flex-1">
              <label className="form-label">🏷️ รหัสครุภัณฑ์ (สแกนจากบาร์โค้ด หรือ กดสุ่มสร้าง)</label>
              <div className="input-with-action">
                <input 
                  type="text" 
                  className="form-input code-input-field" 
                  placeholder="เช่น 6901-001-0001"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm-action" 
                  onClick={handleGenerateId}
                  title="สุ่มสร้างรหัสบาร์โค้ด"
                >
                  <QrCode size={16} /> สุ่มสร้างรหัส
                </button>
              </div>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">🖥️ ชื่อครุภัณฑ์ (ภาษาไทยหรืออังกฤษ)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="เช่น คอมพิวเตอร์ All-in-One Dell Inspiron..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 2: Visual Upload Drawer */}
          <div className="form-group">
            <label className="form-label">📷 ถ่ายรูป หรือ อัปโหลดเอกสาร PDF/รูปภาพครุภัณฑ์ (บีบอัด HD อัตโนมัติ)</label>
            <div className="image-dropzone">
              <input 
                type="file" 
                id="asset-image-picker"
                accept="image/*,application/pdf,.pdf"
                className="file-hidden-input"
                onChange={handleImageChange}
              />
              <label htmlFor="asset-image-picker" className="dropzone-label">
                {imagePreview ? (
                  <div className="intake-preview-wrapper">
                    <img src={imagePreview} alt="Intake asset preview" />
                    <span className="change-pic-badge"><Camera size={12} /> เปลี่ยนรูป</span>
                  </div>
                ) : (
                  <>
                    <Camera size={32} color="var(--text-muted)" className="camera-bounce" />
                    <span>ลากไฟล์รูปภาพมาวางที่นี่ หรือ กดคลิกเพื่ออัปโหลด</span>
                    <span className="subtitle-help">รองรับไฟล์ JPG, PNG และการถ่ายภาพด่วนผ่านมือถือ</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Row 3: Dates & Source */}
          <div className="form-row-double">
            <div className="form-group flex-1">
              <label className="form-label">📅 วันที่เซ็นเอกสารตรวจรับ</label>
              <input 
                type="date" 
                className="form-input"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group flex-1">
              <label className="form-label">🧾 ผู้จำหน่าย / ผู้ขาย / ผู้บริจาค</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="เช่น บริษัท เอ บี ซี จำกัด, บริจาคโดยสมาคม..."
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 4: Location, Dept, Responsible */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--text-muted)' }}>📍 ฝ่ายจัดวางพัสดุและห้องติดตั้ง</span>
            {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
              <button 
                type="button" 
                className="btn btn-ghost btn-xs"
                onClick={() => {
                  const nextVal = !isCustomInput;
                  setIsCustomInput(nextVal);
                  if (nextVal) {
                    setDepartment('');
                    setLocation('');
                  } else {
                    if (departments.length > 0) {
                      setDepartment(departments[0].name);
                      setLocation(departments[0].locations[0] || '');
                    }
                  }
                }}
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', height: 'auto', outline: 'none' }}
              >
                {isCustomInput ? '🏢 ใช้รายการระบบ' : '✍️ พิมพ์กรอกข้อมูลเอง'}
              </button>
            )}
          </div>

          <div className="grid-cols-3">
            {isCustomInput ? (
              <>
                <div className="form-group">
                  <label className="form-label">🏢 ฝ่าย/หน่วยงานที่ดูแลทรัพย์สิน</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="พิมพ์ฝ่าย/แผนกใหม่..."
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">📍 สถานที่จัดเก็บ/ติดตั้งเริ่มต้น</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="พิมพ์ห้องติดตั้งใหม่..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <SearchableSelect
                  label={`🏢 ฝ่าย/หน่วยงานที่ดูแลทรัพย์สิน ${currentUser?.role === 'user' ? '(ล็อคสิทธิ์ตามหน่วยงานของคุณ)' : ''}`}
                  options={departments.map(d => d.name)}
                  value={department}
                  onChange={(val) => {
                    setDepartment(val);
                    const found = departments.find(d => d.name === val);
                    if (found && found.locations.length > 0) {
                      setLocation(found.locations[0]);
                    } else {
                      setLocation('');
                    }
                  }}
                  disabled={currentUser?.role === 'head' || currentUser?.role === 'operator' || currentUser?.role === 'user'}
                  required
                  placeholder="เลือกหน่วยงาน..."
                />

                <SearchableSelect
                  label="📍 สถานที่จัดเก็บ/ติดตั้งเริ่มต้น"
                  options={(() => {
                    const currentDeptObj = departments.find(d => d.name === department);
                    return currentDeptObj ? currentDeptObj.locations : [];
                  })()}
                  value={location}
                  onChange={(val) => setLocation(val)}
                  required
                  placeholder="เลือกสถานที่ติดตั้ง..."
                />
              </>
            )}

            <div className="form-group">
              <label className="form-label">👤 ผู้ดูแล / เจ้าหน้าที่ผู้รับผิดชอบ</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="เช่น นายสมจิต รอดพ้น"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 5: Notes & Status */}
          <div className="form-row-double">
            <div className="form-group flex-1">
              <label className="form-label">🔍 สถานะเริ่มต้นครุภัณฑ์</label>
              <select 
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as Asset['status'])}
                required
              >
                <option value="ใช้งานได้">ใช้งานได้ (ปกติ)</option>
                <option value="ชำรุด">ชำรุด (มีปัญหา)</option>
                <option value="ขอป้ายรหัสใหม่">ขอป้ายรหัสใหม่</option>
                <option value="รอโอน">รอโอน</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">📝 โน้ตบันทึกข้อมูล / ชื่อเล่นเครื่องมือ (Note / Nickname)</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="เช่น เครื่องเป่าอัด 1, ตู้นึ่ง AR-2, ปั๊มหลักตึก 5, สเปคเฉพาะ..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger animate-fade-in">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-actions-bar">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'กำลังอัปโหลดและลงทะเบียน...' : '➕ ลงทะเบียนประวัติรับของใหม่'}
            </button>
          </div>

        </form>
      ) : activeSubTab === 'mass' && isAdmin ? (
        <div className="intake-form glass-panel">
          <div className="mass-import-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Instruction Banner for Batch Import & Photos */}
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.04)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem' }}>
                <Sparkles size={18} />
                💡 คำแนะนำสั้นๆ: การนำเข้าข้อมูลพร้อมรูปถ่ายพัสดุแบบกลุ่ม (Batch Photo Matching)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <strong>1. เตรียมไฟล์ข้อมูล:</strong> กรอกข้อมูลใน CSV หรือก๊อปปี้ตารางจาก Excel
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <strong>2. ตั้งชื่อไฟล์รูปให้ตรงรหัส:</strong> เช่น <code>6901-001-0001.jpg</code> หรือ <code>69010010001.png</code>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <strong>3. เลือกรูปหลายไฟล์พร้อมกัน:</strong> กดปุ่ม <em>"📷 อัปโหลดรูปถ่ายพัสดุแบบกลุ่ม"</em> ระบบจะจับคู่รูปกับรหัสครุภัณฑ์ให้อัตโนมัติทันที!
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} /> ⚡ ระบบบีบอัดรูปภาพให้อัตโนมัติ (Fast Optimization): รูปภาพทุกรูปจะถูกย่อให้อ่านฉลากชัดเจนและมีขนาดไฟล์เล็กจิ๋ว (~30-80KB) ก่อนบันทึกลงคลาวด์เพื่อประหยัดพื้นที่จัดเก็บ 100%
              </div>
            </div>

            {/* Template Download Section */}
            <div className="template-card">
              <div className="template-info">
                <h4>📥 เทมเพลตสำหรับกรอกข้อมูลนำเข้า (CSV Template File)</h4>
                <p>ดาวน์โหลดไฟล์ตัวอย่างและนำไปเปิดกรอกใน Excel / Google Sheets เพื่อป้อนข้อมูลให้ถูกช่องความกว้างและฟิลด์ที่กำหนด</p>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleDownloadTemplate}
                style={{ gap: '0.35rem', height: '40px' }}
              >
                <FileText size={16} /> ดาวน์โหลดไฟล์ตัวอย่าง .csv
              </button>
            </div>

            {/* Input Options (Paste, CSV Upload, or Batch Photos) */}
            <div className="import-grids">
              
              {/* Paste Box */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="import-box-header">
                  <Clipboard size={16} /> 📋 วางข้อมูลตรงจาก Excel (Copy-Paste)
                </label>
                <textarea
                  className="paste-textarea"
                  placeholder="ก๊อปปี้ข้อมูลตารางใน Excel (เฉพาะแถวเนื้อหา ไม่ต้องเอาแถวหัวเรื่อง) แล้วกด Ctrl+V วางตรงนี้ได้เลย..."
                  value={pasteData}
                  onChange={(e) => {
                    setFileData('');
                    setFileName('');
                    setPasteData(e.target.value);
                  }}
                />
                <span className="subtitle-help" style={{ marginTop: '0.25rem', display: 'block' }}>
                  * ข้อมูลแต่ละคอลัมน์จะถูกคั่นด้วย Tab (TSV) โดยการกดวางจะประมวลผลให้เรียลไทม์
                </span>
              </div>

              {/* File Upload Box */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="import-box-header">
                  <UploadCloud size={16} /> 📂 เลือกอัปโหลดไฟล์ (.csv)
                </label>
                <input
                  type="file"
                  id="csv-file-picker"
                  accept=".csv"
                  className="file-hidden-input"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="csv-file-picker" className="file-upload-box">
                  <UploadCloud size={28} color={fileName ? "var(--primary)" : "var(--text-muted)"} />
                  {fileName ? (
                    <>
                      <span className="selected-file-badge">{fileName}</span>
                      <span className="subtitle-help">คลิกเพื่อเปลี่ยนไฟล์ CSV ใหม่</span>
                    </>
                  ) : (
                    <>
                      <span>คลิกเพื่อค้นหาไฟล์ .csv ในเครื่อง</span>
                      <span className="subtitle-help">รองรับไฟล์รูปแบบ Comma-Separated (.csv) เข้ารหัส UTF-8</span>
                    </>
                  )}
                </label>
                {fileName && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={handleResetImport}
                    style={{ marginTop: '0.5rem', color: 'var(--danger)', fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', width: 'fit-content' }}
                  >
                    <Trash2 size={12} /> ล้างข้อมูลไฟล์
                  </button>
                )}
              </div>

              {/* Batch Photo Picker Box */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="import-box-header">
                  <Camera size={16} /> 📷 อัปโหลดรูปถ่ายพัสดุแบบกลุ่ม (Batch Photos)
                </label>
                <input
                  type="file"
                  id="batch-images-picker"
                  accept="image/*,application/pdf,.pdf"
                  multiple
                  className="file-hidden-input"
                  onChange={handleBatchImagesChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="batch-images-picker" className="file-upload-box" style={{ borderColor: batchImageFiles.size > 0 ? 'var(--success)' : 'var(--border)' }}>
                  <ImageIcon size={28} color={batchImageFiles.size > 0 ? "var(--success)" : "var(--text-muted)"} />
                  {batchImageFiles.size > 0 ? (
                    <>
                      <span className="selected-file-badge" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)' }}>
                        📸 เลือกรูปถ่ายแล้ว {batchImageFiles.size} ไฟล์
                      </span>
                      <span className="subtitle-help">คลิกเพื่อเลือกเพิ่มรูปถ่ายอีก</span>
                    </>
                  ) : (
                    <>
                      <span>คลิกเพื่อเลือกไฟล์รูปหลายๆ รูปพร้อมกัน</span>
                      <span className="subtitle-help">ระบบจับคู่รูปภาพเข้ากับรหัส ID ให้อัตโนมัติ</span>
                    </>
                  )}
                </label>
                {batchImageFiles.size > 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => setBatchImageFiles(new Map())}
                    style={{ marginTop: '0.5rem', color: 'var(--danger)', fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', width: 'fit-content' }}
                  >
                    <Trash2 size={12} /> ล้างรูปถ่ายแบบกลุ่ม ({batchImageFiles.size} รูป)
                  </button>
                )}
              </div>

            </div>

            {/* Live Validation & Preview Table */}
            {parsedRows.length > 0 && (
              <div className="validation-preview-section animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                <div className="preview-stats-bar" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>🔍 ตารางตรวจสอบความถูกต้องสด (Live Preview):</span>
                    {parsedRows.length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 650, background: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                        📸 จับคู่รูปถ่ายได้แล้ว: {parsedRows.filter(r => getRowImage(r) !== null).length} / {parsedRows.length} แถว
                      </span>
                    )}
                  </div>
                  
                  <div className="stats-group">
                    <button 
                      type="button" 
                      className={`stat-badge all ${filterType === 'all' ? 'active' : ''}`}
                      onClick={() => setFilterType('all')}
                    >
                      ทั้งหมด ({parsedRows.length} แถว)
                    </button>
                    <button 
                      type="button" 
                      className={`stat-badge success ${filterType === 'valid' ? 'active' : ''}`}
                      onClick={() => setFilterType('valid')}
                    >
                      🟢 พร้อมนำเข้า ({parsedRows.filter(r => r.isValid).length} แถว)
                    </button>
                    <button 
                      type="button" 
                      className={`stat-badge danger ${filterType === 'invalid' ? 'active' : ''}`}
                      onClick={() => setFilterType('invalid')}
                    >
                      🔴 ติดปัญหา ({parsedRows.filter(r => !r.isValid).length} แถว)
                    </button>
                  </div>
                </div>

                <div className="preview-table-container">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>แถวที่</th>
                        <th style={{ width: '90px' }}>รูปถ่ายพัสดุ</th>
                        <th style={{ width: '130px' }}>รหัสครุภัณฑ์</th>
                        <th style={{ width: '150px' }}>ชื่อครุภัณฑ์</th>
                        <th style={{ width: '100px' }}>ฝ่ายที่ดูแล</th>
                        <th style={{ width: '100px' }}>สถานที่ตั้ง</th>
                        <th style={{ width: '100px' }}>วันที่ตรวจรับ</th>
                        <th style={{ width: '120px' }}>ผู้จำหน่าย / ที่มา</th>
                        <th style={{ width: '120px' }}>ผู้ดูแลรับผิดชอบ</th>
                        <th style={{ width: '80px' }}>สถานะ</th>
                        <th style={{ width: '160px' }}>ผลการตรวจเช็ค</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.filter(row => {
                        if (filterType === 'valid') return row.isValid;
                        if (filterType === 'invalid') return !row.isValid;
                        return true;
                      }).length === 0 ? (
                        <tr>
                          <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            ไม่มีแถวข้อมูลตามตัวเลือกตัวกรอง
                          </td>
                        </tr>
                      ) : (
                        parsedRows.filter(row => {
                          if (filterType === 'valid') return row.isValid;
                          if (filterType === 'invalid') return !row.isValid;
                          return true;
                        }).map((row) => (
                          <tr key={row.rowNum} className={row.isValid ? 'row-valid' : 'row-invalid'}>
                            <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{row.rowNum}</td>
                            
                            {/* Photo Thumbnail & Manual Selection Cell */}
                            <td>
                              {(() => {
                                const rowImg = getRowImage(row);
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0' }}>
                                    {rowImg ? (
                                      <div style={{ position: 'relative', width: '38px', height: '38px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                        <img src={rowImg.previewUrl} alt="Asset preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      </div>
                                    ) : (
                                      <div style={{ width: '38px', height: '38px', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                        <Camera size={14} />
                                      </div>
                                    )}
                                    <label style={{ fontSize: '0.625rem', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
                                      {rowImg ? (rowImg.source === 'matched' ? '🟢 ตรง ID' : '📸 รูปกำหนดเอง') : '📷 +รูป'}
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files[0]) {
                                            handleRowImageChange(row.rowNum, e.target.files[0]);
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                );
                              })()}
                            </td>

                            <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{row.id || '-'}</td>
                            <td>{row.name || <span style={{ color: 'var(--danger)', fontStyle: 'italic' }}>[ไม่มีชื่อ]</span>}</td>
                            <td>{row.department}</td>
                            <td>{row.location}</td>
                            <td>{row.receivedDate}</td>
                            <td>{row.source}</td>
                            <td>{row.responsiblePerson}</td>
                            <td>
                              <span className="badge" style={{ 
                                fontSize: '0.7rem', 
                                padding: '0.1rem 0.4rem',
                                backgroundColor: row.status === 'ใช้งานได้' ? 'var(--success-light)' : (row.status === 'ชำรุด' ? 'var(--danger-light)' : 'var(--warning-light)'),
                                color: row.status === 'ใช้งานได้' ? 'var(--success)' : (row.status === 'ชำรุด' ? 'var(--danger)' : 'var(--warning)')
                              }}>
                                {row.status}
                              </span>
                            </td>
                            <td>
                              <div className="validation-messages">
                                {row.isValid ? (
                                  <span className="row-status-badge valid">🟢 ข้อมูลถูกต้อง</span>
                                ) : (
                                  <span className="row-status-badge invalid">🔴 ไม่สามารถนำเข้าได้</span>
                                )}
                                
                                {row.errors.map((err, idx) => (
                                  <span key={`err-${idx}`} className="val-msg error">❌ {err}</span>
                                ))}
                                
                                {row.warnings.map((warn, idx) => (
                                  <span key={`warn-${idx}`} className="val-msg warning">⚠️ {warn}</span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Action Bar for import */}
                <div className="form-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    แถวที่พร้อมนำเข้า: <strong style={{ color: 'var(--success)', fontSize: '0.9rem' }}>{parsedRows.filter(r => r.isValid).length}</strong> แถว (แถวที่ติดปัญหา <strong style={{ color: 'var(--danger)' }}>{parsedRows.filter(r => !r.isValid).length}</strong> แถวจะไม่ถูกนำเข้า)
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleResetImport}
                    >
                      ล้างทั้งหมด
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      disabled={parsedRows.filter(r => r.isValid).length === 0 || saving}
                      onClick={handleMassImportSubmit}
                    >
                      {saving ? (
                        savingProgress ? `⚡ กำลังบีบอัดรูปภาพและนำเข้า (${savingProgress.current}/${savingProgress.total})...` : 'กำลังประมวลผลนำเข้า...'
                      ) : `💾 ยืนยันนำเข้าข้อมูล (${parsedRows.filter(r => r.isValid).length} แถว) ลงระบบ`}
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="report-config-panel intake-form glass-panel animate-fade-in" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
             ออกรายงานประวัติครุภัณฑ์ขึ้นทะเบียนใหม่
          </h3>
           
          <div className="grid-cols-3">
            <div className="form-group">
              <label className="form-label">🏢 ฝ่าย/หน่วยงานผู้ดูแล</label>
              <select 
                className="form-select"
                value={selectedReportDept}
                onChange={(e) => setSelectedReportDept(e.target.value)}
                disabled={currentUser?.role === 'head' || currentUser?.role === 'operator' || currentUser?.role === 'user'}
              >
                {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && <option value="all">ทุกหน่วยงาน</option>}
                {currentUser?.role === 'user' ? (
                  <option value={currentUser.department}>{currentUser.department}</option>
                ) : (
                  Array.from(new Set(assets.map(a => a.department).filter(Boolean))).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))
                )}
              </select>
            </div>
             
            <div className="form-group">
              <label className="form-label">📅 เริ่มต้นตั้งแต่วันที่</label>
               <input 
                 type="date" 
                 className="form-input"
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
               />
             </div>
             
             <div className="form-group">
               <label className="form-label">📅 จนถึงวันที่</label>
               <input 
                 type="date" 
                 className="form-input"
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
               />
             </div>
          </div>
           
          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => setIsReportPrintOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Printer size={16} /> 🖨️ แสดงตัวอย่างรายงานและจัดพิมพ์
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN PRINT PREVIEW OVERLAY */}
      {isReportPrintOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '800px', width: '100%', margin: '0 auto 1.5rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10000 }}>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--primary)' }}>🖨️ ตัวอย่างก่อนพิมพ์รายงานครุภัณฑ์ใหม่ (A4 Preview)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>รายงานพัสดุรับใหม่จัดรูปแบบสำหรับพิมพ์ลงกระดาษ A4</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsReportPrintOpen(false)}
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
              // Filter new assets based on selected dates and department
              const reportAssets = assets.filter(a => {
                const dateOk = a.receivedDate >= startDate && a.receivedDate <= endDate;
                const deptOk = selectedReportDept === 'all' || a.department === selectedReportDept;
                return dateOk && deptOk;
              });

              return (
                <>
                  <div style={{ textAlign: 'center', position: 'relative', marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '28px', color: '#000000', marginBottom: '0.5rem' }}>🇹🇭</div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#000000', margin: '0.2rem 0' }}>
                      รายงานประวัติครุภัณฑ์ขึ้นทะเบียนรับใหม่เข้าคลัง
                    </h1>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#333333', margin: '0.2rem 0' }}>
                      ประจำวันที่ {new Date(startDate).toLocaleDateString('th-TH')} ถึงวันที่ {new Date(endDate).toLocaleDateString('th-TH')}
                    </h2>
                    {selectedReportDept !== 'all' && (
                      <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>หน่วยงาน: {selectedReportDept}</div>
                    )}
                    <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.5rem' }}>
                      ผู้ดูแลรับผิดชอบ: ระบบคลังข้อมูลครุภัณฑ์ AssetWatch
                    </div>
                  </div>

                  <hr style={{ border: '0', borderTop: '2px double #333333', margin: '1rem 0 1.5rem 0' }} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#f8f9fa', padding: '1rem', border: '1px solid #dddddd', borderRadius: '4px' }}>
                    <div>
                      <div><strong>👤 ผู้ออกรายงาน:</strong> {currentUser?.name || 'ไม่ได้ระบุ'}</div>
                      <div><strong>🏢 บทบาทหน้าที่:</strong> {currentUser?.role === 'admin' ? 'แอดมินสูงสุด' : (currentUser?.role === 'manager' ? 'ผู้จัดการ' : 'ผู้ปฏิบัติงาน')}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #dddddd', paddingLeft: '1rem' }}>
                      <div><strong>📦 ครุภัณฑ์ขึ้นทะเบียนใหม่:</strong> {reportAssets.length} รายการ</div>
                      <div><strong>📅 วันเวลาที่ออกเอกสาร:</strong> {new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString('th-TH')} น.</div>
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f2f2f2', borderBottom: '1.5px solid #000000', borderTop: '1px solid #dddddd' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'center', border: '1px solid #dddddd', width: '50px' }}>ลำดับ</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '100px' }}>วันที่ตรวจรับ</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '120px' }}>รหัสครุภัณฑ์</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd' }}>ชื่อรายการครุภัณฑ์</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '120px' }}>แหล่งที่มา</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '100px' }}>ฝ่ายที่ดูแล</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '100px' }}>สถานที่ตั้ง</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportAssets.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid #dddddd', color: '#666666' }}>
                            ไม่พบข้อมูลการขึ้นทะเบียนครุภัณฑ์ใหม่ในช่วงเวลานี้
                          </td>
                        </tr>
                      ) : (
                        reportAssets.map((asset, idx) => (
                          <tr key={asset.id} style={{ borderBottom: '1px solid #dddddd' }}>
                            <td style={{ padding: '0.5rem', textAlign: 'center', border: '1px solid #dddddd' }}>{idx + 1}</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{new Date(asset.receivedDate).toLocaleDateString('th-TH')}</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #dddddd', fontFamily: 'monospace', fontWeight: 'bold' }}>{asset.id}</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{asset.name}</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{asset.source}</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{asset.department}</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{asset.location}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'center', width: '280px' }}>
                      <div style={{ marginBottom: '3rem' }}>ลงชื่อ.................................................................. ผู้รายงานผล</div>
                      <div>( {currentUser?.name || '..............................................'} )</div>
                      <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.35rem' }}>ตำแหน่ง: เจ้าหน้าที่ทะเบียนพัสดุ</div>
                      <div style={{ fontSize: '0.85rem', color: '#666666' }}>วันที่ {new Date().toLocaleDateString('th-TH')}</div>
                    </div>
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      )}

      <style>{`
        .intake-form {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row-double {
          display: flex;
          gap: 1.5rem;
          width: 100%;
        }

        .flex-1 {
          flex: 1;
        }

        .input-with-action {
          display: flex;
          gap: 0.5rem;
        }

        .code-input-field {
          font-family: monospace;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .btn-sm-action {
          padding: 0 1rem;
          white-space: nowrap;
          font-size: 0.85rem;
        }

        /* Image dropzone */
        .image-dropzone {
          width: 100%;
        }

        .dropzone-label {
          width: 100%;
          border: 2px dashed var(--border);
          background-color: var(--bg-primary);
          border-radius: var(--radius-md);
          padding: 2.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
        }

        .dropzone-label:hover {
          border-color: var(--primary);
          background-color: rgba(59, 130, 246, 0.01);
        }

        .camera-bounce {
          animation: camera-float 3s infinite alternate ease-in-out;
        }

        @keyframes camera-float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }

        .intake-preview-wrapper {
          position: relative;
          width: 100%;
          max-width: 380px;
          aspect-ratio: 16/10;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .intake-preview-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .change-pic-badge {
          position: absolute;
          bottom: 0.75rem;
          right: 0.75rem;
          background-color: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(2px);
          color: #ffffff;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .subtitle-help {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .grid-cols-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .form-actions-bar {
          margin-top: 1rem;
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
          display: flex;
          justify-content: flex-end;
        }

        /* Success Card layout */
        .success-wizard-card {
          padding: 4rem 2rem;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: var(--glass-shadow);
        }

        .text-center {
          text-align: center;
        }

        .success-checkmark-wrapper {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background-color: var(--success-light);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
          margin-bottom: 1.5rem;
        }

        .success-intake-details {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          max-width: 440px;
          margin: 1.5rem auto;
          text-align: left;
        }

        .intake-detail-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          border-bottom: 1px dashed var(--border);
          padding: 0.5rem 0;
        }

        .intake-detail-line:last-child {
          border-bottom: none;
        }

        .intake-detail-line span {
          color: var(--text-secondary);
        }

        .success-card-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        /* Mass Import Premium Styles */
        .sub-tabs-container {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.25rem;
        }
        .sub-tab {
          padding: 0.75rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: none;
          border: none;
          border-bottom: 2.5px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          outline: none;
        }
        .sub-tab:hover {
          color: var(--primary);
        }
        .sub-tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        
        .mass-import-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .template-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          gap: 1rem;
        }
        .template-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .template-info p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        .import-grids {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
        }
        
        .import-box-header {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 0.65rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .paste-textarea {
          width: 100%;
          min-height: 140px;
          font-family: monospace;
          font-size: 0.8rem;
          padding: 0.85rem;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border);
          background: var(--bg-primary);
          color: var(--text-primary);
          resize: vertical;
          outline: none;
          transition: border-color var(--transition-fast);
        }
        .paste-textarea:focus {
          border-color: var(--border-focus);
        }
        .file-upload-box {
          border: 2px dashed var(--border);
          background: var(--bg-primary);
          border-radius: var(--radius-md);
          padding: 1.75rem 1rem;
          text-align: center;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all var(--transition-fast);
          min-height: 140px;
        }
        .file-upload-box:hover {
          border-color: var(--primary);
          background: rgba(59, 130, 246, 0.02);
        }
        .selected-file-badge {
          background: var(--primary-light);
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          margin-top: 0.25rem;
        }
        
        .preview-stats-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0.85rem 1.25rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .stats-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .stat-badge {
          font-size: 0.775rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .stat-badge:hover {
          transform: translateY(-1px);
        }
        .stat-badge.all.active {
          border-color: var(--text-primary);
          background: var(--text-primary);
          color: var(--bg-secondary);
        }
        .stat-badge.success:hover, .stat-badge.success.active {
          background: var(--success);
          color: #ffffff;
          border-color: var(--success);
        }
        .stat-badge.danger:hover, .stat-badge.danger.active {
          background: var(--danger);
          color: #ffffff;
          border-color: var(--danger);
        }
        
        .preview-table-container {
          max-height: 380px;
          overflow: auto;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
        }
        .preview-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.825rem;
          text-align: left;
          min-width: 900px;
        }
        .preview-table th {
          background: var(--bg-tertiary);
          padding: 0.85rem 1rem;
          font-weight: 700;
          color: var(--text-secondary);
          border-bottom: 1.5px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 5;
        }
        .preview-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }
        .preview-table tr:last-child td {
          border-bottom: none;
        }
        .preview-table tr.row-invalid {
          background: rgba(239, 68, 68, 0.015);
        }
        .preview-table tr:hover {
          background-color: rgba(59, 130, 246, 0.01);
        }
        
        .row-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.725rem;
        }
        .row-status-badge.valid {
          background: var(--success-light);
          color: var(--success);
        }
        .row-status-badge.invalid {
          background: var(--danger-light);
          color: var(--danger);
        }
        
        .validation-messages {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 0.25rem;
        }
        .val-msg {
          font-size: 0.725rem;
          display: block;
        }
        .val-msg.error {
          color: var(--danger);
        }
        .val-msg.warning {
          color: var(--warning-hover);
        }

        @media (max-width: 768px) {
          .form-row-double {
            flex-direction: column;
            gap: 0;
          }
          .grid-cols-3 {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .intake-form {
            padding: 1.25rem;
          }
          .success-card-actions {
            flex-direction: column;
            gap: 0.75rem;
          }
          .import-grids {
            grid-template-columns: 1fr;
          }
          .template-card {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};
