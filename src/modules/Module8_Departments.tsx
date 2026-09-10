import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  PlusCircle, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Edit2, 
  ArrowUp, 
  ArrowDown, 
  ChevronsUp, 
  Check, 
  X, 
  Shield, 
  Lock, 
  UserCheck, 
  Search,
  Sparkles,
  Info
} from 'lucide-react';
import { DepartmentLocationConfig, UserAccount } from '../utils/mockData';

interface Module8DepartmentsProps {
  departments: DepartmentLocationConfig[];
  onAddDept: (name: string, locations: string[], createdBy?: string) => Promise<void>;
  onUpdateDept: (id: string, name: string, locations: string[], locationCreators?: Record<string, string>) => Promise<void>;
  onDeleteDept: (id: string) => Promise<void>;
  currentUser: UserAccount | null;
}

export const Module8_Departments: React.FC<Module8DepartmentsProps> = ({
  departments,
  onAddDept,
  onUpdateDept,
  onDeleteDept,
  currentUser
}) => {
  // Role & Scope Definitions
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const isHead = currentUser?.role === 'head';
  const isUser = currentUser?.role === 'user' || currentUser?.role === 'operator';
  const userDept = currentUser?.department || '';
  const currentUsername = currentUser?.username || currentUser?.name || 'anonymous';
  const isOrgWide = isAdmin || isManager;

  const [newDeptName, setNewDeptName] = useState('');
  const [newRoomNames, setNewRoomNames] = useState<Record<string, string>>({}); // departmentId -> roomName
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filtering & Search states
  const [deptFilterTab, setDeptFilterTab] = useState<'my' | 'all'>((isHead || isUser) ? 'my' : 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state for Department Name
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingDeptName, setEditingDeptName] = useState<string>('');

  // Editing state for Room Name
  const [editingRoom, setEditingRoom] = useState<{ deptId: string; oldName: string } | null>(null);
  const [editingRoomName, setEditingRoomName] = useState<string>('');

  // --- PERMISSION HELPERS ---
  const canAddDepartment = isOrgWide || (isHead && !departments.some(d => d.name.toLowerCase() === userDept.toLowerCase()));
  
  const canEditDeptName = (dept: DepartmentLocationConfig): boolean => {
    if (isOrgWide) return true;
    if (isHead && dept.name.toLowerCase() === userDept.toLowerCase()) return true;
    return false;
  };

  const canDeleteDepartment = (dept: DepartmentLocationConfig): boolean => {
    if (isOrgWide) return true;
    return false;
  };

  const canAddRoomToDept = (dept: DepartmentLocationConfig): boolean => {
    if (isOrgWide) return true;
    if ((isHead || isUser) && dept.name.toLowerCase() === userDept.toLowerCase()) return true;
    return false;
  };

  const canManageRoom = (dept: DepartmentLocationConfig, roomName: string): boolean => {
    if (isOrgWide) return true;
    if (isHead && dept.name.toLowerCase() === userDept.toLowerCase()) return true;
    if (isUser && dept.name.toLowerCase() === userDept.toLowerCase()) {
      const creator = dept.locationCreators?.[roomName];
      return creator === currentUser?.username || creator === currentUser?.name;
    }
    return false;
  };

  const isMyCreatedRoom = (dept: DepartmentLocationConfig, roomName: string): boolean => {
    const creator = dept.locationCreators?.[roomName];
    return creator === currentUser?.username || creator === currentUser?.name;
  };

  const getRoomCreatorName = (dept: DepartmentLocationConfig, roomName: string): string => {
    const creator = dept.locationCreators?.[roomName];
    if (!creator) return 'ระบบ / ผู้ดูแล';
    if (creator === currentUser?.username || creator === currentUser?.name) return 'คุณ (เจ้าของ)';
    return creator;
  };

  // --- ACTION HANDLERS ---
  const handleCreateDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    if (!canAddDepartment) {
      setErrorMsg('คุณไม่มีสิทธิ์ในการเพิ่มหน่วยงานใหม่');
      return;
    }

    // Check if name already exists
    if (departments.some(d => d.name.toLowerCase() === newDeptName.trim().toLowerCase())) {
      setErrorMsg('มีหน่วยงาน/ฝ่ายนี้อยู่ในระบบแล้ว');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await onAddDept(newDeptName, [], currentUsername);
      setNewDeptName('');
      setSuccessMsg(`เพิ่มหน่วยงาน "${newDeptName}" สำเร็จแล้ว!`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      setErrorMsg('ไม่สามารถเพิ่มหน่วยงานได้');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditDept = (dept: DepartmentLocationConfig) => {
    if (!canEditDeptName(dept)) {
      alert('คุณไม่มีสิทธิ์ในการแก้ไขชื่อหน่วยงานนี้');
      return;
    }
    setEditingDeptId(dept.id);
    setEditingDeptName(dept.name);
  };

  const handleSaveEditDept = async (deptId: string) => {
    if (!editingDeptName.trim()) return;
    const name = editingDeptName.trim();
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;

    if (!canEditDeptName(dept)) {
      alert('คุณไม่มีสิทธิ์ในการแก้ไขชื่อหน่วยงานนี้');
      return;
    }

    if (name !== dept.name && departments.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      alert(`มีหน่วยงานชื่อ "${name}" อยู่ในระบบแล้ว`);
      return;
    }

    try {
      await onUpdateDept(deptId, name, dept.locations, dept.locationCreators);
      setEditingDeptId(null);
      setSuccessMsg(`แก้ไขชื่อหน่วยงานเป็น "${name}" สำเร็จ`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('ไม่สามารถแก้ไขชื่อหน่วยงานได้');
    }
  };

  const handleAddRoom = async (deptId: string) => {
    const roomName = newRoomNames[deptId] || '';
    if (!roomName.trim()) return;

    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;

    if (!canAddRoomToDept(dept)) {
      alert('คุณไม่มีสิทธิ์ในการเพิ่มห้องในหน่วยงานนี้');
      return;
    }

    const trimmedRoom = roomName.trim();
    if (dept.locations.includes(trimmedRoom)) {
      setErrorMsg(`มีห้อง "${trimmedRoom}" ในหน่วยงานนี้แล้ว`);
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const updatedRooms = [...dept.locations, trimmedRoom];
    const updatedCreators = {
      ...(dept.locationCreators || {}),
      [trimmedRoom]: currentUsername
    };

    try {
      await onUpdateDept(deptId, dept.name, updatedRooms, updatedCreators);
      setNewRoomNames({ ...newRoomNames, [deptId]: '' });
      setSuccessMsg(`เพิ่มห้อง "${trimmedRoom}" สำเร็จ!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('ไม่สามารถเพิ่มห้องจัดเก็บได้');
    }
  };

  const handleStartEditRoom = (dept: DepartmentLocationConfig, roomName: string) => {
    if (!canManageRoom(dept, roomName)) {
      alert(`คุณไม่มีสิทธิ์แก้ไขห้องนี้ (สร้างโดย: ${getRoomCreatorName(dept, roomName)})`);
      return;
    }
    setEditingRoom({ deptId: dept.id, oldName: roomName });
    setEditingRoomName(roomName);
  };

  const handleSaveEditRoom = async () => {
    if (!editingRoom || !editingRoomName.trim()) return;
    const { deptId, oldName } = editingRoom;
    const newName = editingRoomName.trim();

    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;

    if (!canManageRoom(dept, oldName)) {
      alert('คุณไม่มีสิทธิ์แก้ไขห้องนี้');
      return;
    }

    if (newName !== oldName && dept.locations.includes(newName)) {
      alert(`มีห้องชื่อ "${newName}" อยู่ในหน่วยงานนี้แล้ว`);
      return;
    }

    const updatedRooms = dept.locations.map(r => (r === oldName ? newName : r));
    const creator = dept.locationCreators?.[oldName] || currentUsername;
    const updatedCreators = { ...(dept.locationCreators || {}) };
    delete updatedCreators[oldName];
    updatedCreators[newName] = creator;

    try {
      await onUpdateDept(deptId, dept.name, updatedRooms, updatedCreators);
      setEditingRoom(null);
      setEditingRoomName('');
      setSuccessMsg(`แก้ไขชื่อห้องเป็น "${newName}" สำเร็จ`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('ไม่สามารถแก้ไขชื่อห้องได้');
    }
  };

  const handleMoveRoom = async (dept: DepartmentLocationConfig, roomIndex: number, direction: 'top' | 'up' | 'down') => {
    const room = dept.locations[roomIndex];
    if (!canManageRoom(dept, room)) {
      alert('คุณไม่มีสิทธิ์ย้ายลำดับห้องนี้');
      return;
    }

    const newLocs = [...dept.locations];
    if (direction === 'top') {
      if (roomIndex <= 0) return;
      const [item] = newLocs.splice(roomIndex, 1);
      newLocs.unshift(item);
    } else if (direction === 'up') {
      if (roomIndex <= 0) return;
      const temp = newLocs[roomIndex];
      newLocs[roomIndex] = newLocs[roomIndex - 1];
      newLocs[roomIndex - 1] = temp;
    } else if (direction === 'down') {
      if (roomIndex >= newLocs.length - 1) return;
      const temp = newLocs[roomIndex];
      newLocs[roomIndex] = newLocs[roomIndex + 1];
      newLocs[roomIndex + 1] = temp;
    }

    try {
      await onUpdateDept(dept.id, dept.name, newLocs, dept.locationCreators);
    } catch (err) {
      alert('ไม่สามารถย้ายลำดับห้องได้');
    }
  };

  const handleDeleteRoom = async (dept: DepartmentLocationConfig, roomToDelete: string) => {
    if (!canManageRoom(dept, roomToDelete)) {
      alert(`คุณไม่มีสิทธิ์ลบห้องนี้ (สร้างโดย: ${getRoomCreatorName(dept, roomToDelete)})`);
      return;
    }

    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบห้อง/บริเวณ "${roomToDelete}" ออกจากระบบ?`)) {
      return;
    }

    const updatedRooms = dept.locations.filter(r => r !== roomToDelete);
    const updatedCreators = { ...(dept.locationCreators || {}) };
    delete updatedCreators[roomToDelete];

    try {
      await onUpdateDept(dept.id, dept.name, updatedRooms, updatedCreators);
      setSuccessMsg(`ลบห้อง "${roomToDelete}" ออกสำเร็จ`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('ไม่สามารถลบห้องจัดเก็บได้');
    }
  };

  const handleDeleteDeptSubmit = async (dept: DepartmentLocationConfig) => {
    if (!canDeleteDepartment(dept)) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) หรือผู้บริหาร (Manager) เท่านั้นที่มีสิทธิ์ลบหน่วยงาน');
      return;
    }

    if (!window.confirm(`⚠️ คำเตือนขั้นเด็ดขาด: คุณแน่ใจที่จะลบแผนก "${dept.name}" และสถานที่ย่อยทั้งหมดออกใช่หรือไม่?\n\nข้อมูลครุภัณฑ์ที่ผูกกับแผนกนี้จะไม่ได้รับผลกระทบกับข้อมูลหลัก แต่อินเตอร์เฟสกล่องตัวเลือก Dropdown จะไม่แสดงผลเชื่อมต่อของแผนกนี้อีกต่อไป`)) {
      return;
    }

    try {
      await onDeleteDept(dept.id);
      setSuccessMsg(`ลบหน่วยงาน "${dept.name}" สำเร็จ`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('ไม่สามารถลบแผนกได้');
    }
  };

  // --- FILTERED DEPARTMENTS ---
  const displayedDepartments = departments.filter(dept => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = dept.name.toLowerCase().includes(q);
      const matchRoom = dept.locations.some(l => l.toLowerCase().includes(q));
      if (!matchName && !matchRoom) return false;
    }

    // Tab filter for Head / User
    if (isHead || isUser) {
      if (deptFilterTab === 'my') {
        return dept.name.toLowerCase() === userDept.toLowerCase();
      } else {
        return dept.name.toLowerCase() !== userDept.toLowerCase();
      }
    }

    return true;
  });

  const myDeptConfig = departments.find(d => d.name.toLowerCase() === userDept.toLowerCase());
  const otherDeptsCount = departments.filter(d => d.name.toLowerCase() !== userDept.toLowerCase()).length;

  return (
    <div className="module-container animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Module Title Section */}
      <div className="module-title-section" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
              <Building className="text-primary" size={28} />
              จัดการหน่วยงาน & สถานที่ตั้ง (Module 8)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem', marginBottom: 0 }}>
              ตั้งค่าแผนผังโครงสร้างขององค์กร กำหนดชื่อแผนก และห้องย่อย เพื่อระบุตำแหน่งจัดเก็บครุภัณฑ์
            </p>
          </div>

          {/* Role Status Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            background: isOrgWide ? 'rgba(59, 130, 246, 0.12)' : isHead ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${isOrgWide ? 'rgba(59, 130, 246, 0.3)' : isHead ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            fontSize: '0.8rem',
            fontWeight: 700,
            color: isOrgWide ? '#3b82f6' : isHead ? '#10b981' : '#f59e0b'
          }}>
            {isOrgWide ? <Shield size={16} /> : isHead ? <UserCheck size={16} /> : <Sparkles size={16} />}
            <span>
              {isOrgWide 
                ? `สิทธิ์องค์กร (${isAdmin ? 'ผู้ดูแลระบบ Admin' : 'ผู้บริหาร Manager'})`
                : isHead 
                ? `สิทธิ์หัวหน้าฝ่าย (${userDept || 'ไม่ระบุ'})`
                : `สิทธิ์ผู้ใช้งาน (${userDept || 'ไม่ระบุ'})`}
            </span>
          </div>
        </div>
      </div>

      {/* Role Permission Scope Info Banner */}
      <div style={{
        background: isOrgWide 
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)'
          : isHead 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)'
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)',
        border: `1px solid ${isOrgWide ? 'rgba(59, 130, 246, 0.2)' : isHead ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '0.9rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        fontSize: '0.85rem',
        lineHeight: 1.5,
        color: 'var(--text-secondary)'
      }}>
        <Info size={20} style={{ flexShrink: 0, marginTop: '2px', color: isOrgWide ? '#3b82f6' : isHead ? '#10b981' : '#f59e0b' }} />
        <div>
          {isOrgWide && (
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>ขอบเขตสิทธิ์ผู้ดูแลระบบ/ผู้บริหาร:</strong> สามารถเพิ่มหน่วยงานใหม่, แก้ไขชื่อหน่วยงาน, ลบหน่วยงาน และเพิ่ม/แก้ไข/ลบ/จัดลำดับห้องได้ทุกหน่วยงานในองค์กร
            </div>
          )}
          {isHead && (
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>ขอบเขตสิทธิ์หัวหน้าฝ่าย ({userDept}):</strong> สามารถจัดการทุกอย่างในฝ่าย <strong>"{userDept}"</strong> ของตนเองได้เต็มรูปแบบ (แก้ไขชื่อฝ่าย, เพิ่มห้อง, แก้ไขห้อง, ลบห้อง, จัดลำดับห้อง) สำหรับฝ่ายอื่นๆ จะสามารถดูข้อมูลได้เท่านั้น
            </div>
          )}
          {isUser && (
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>ขอบเขตสิทธิ์ผู้ใช้งานทั่วไป:</strong> สามารถเพิ่มห้องใหม่ในฝ่าย <strong>"{userDept}"</strong> ของตนเอง และสามารถแก้ไข / ลบ / จัดลำดับได้ <strong>เฉพาะห้องที่ท่านเป็นผู้สร้างเท่านั้น</strong> (ห้องที่ผู้อื่นสร้างจะแสดงเป็นแบบอ่านอย่างเดียว)
            </div>
          )}
        </div>
      </div>

      {/* Global Notifications */}
      {successMsg && (
        <div className="alert alert-success animate-fade-in" style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-md)' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger animate-fade-in" style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-md)' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: Add Department (Controlled by Permission) */}
      {canAddDepartment && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Building size={18} className="text-primary" /> ➕ เพิ่มฝ่าย / แผนก / หน่วยงานใหม่
          </h3>
          
          <form onSubmit={handleCreateDeptSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="เช่น ฝ่ายการตลาด, สำนักงานผู้อำนวยการ, แผนกบัญชี..." 
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                required
                style={{ marginBottom: 0 }}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving || !newDeptName.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap', fontWeight: 700 }}
            >
              <PlusCircle size={16} /> {saving ? 'กำลังบันทึก...' : 'เพิ่มหน่วยงาน'}
            </button>
          </form>
        </div>
      )}

      {/* SECTION 2: Filter Toolbar (Search + Tabs for Head/User) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Filter Tabs for Head / User */}
        {(isHead || isUser) ? (
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setDeptFilterTab('my')}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: deptFilterTab === 'my' ? 'var(--primary)' : 'transparent',
                color: deptFilterTab === 'my' ? '#fff' : 'var(--text-secondary)',
                fontWeight: deptFilterTab === 'my' ? 700 : 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Building size={14} />
              ฝ่ายของฉัน ({userDept || 'ไม่ระบุ'})
            </button>
            <button
              type="button"
              onClick={() => setDeptFilterTab('all')}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: deptFilterTab === 'all' ? 'var(--primary)' : 'transparent',
                color: deptFilterTab === 'all' ? '#fff' : 'var(--text-secondary)',
                fontWeight: deptFilterTab === 'all' ? 700 : 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <MapPin size={14} />
              หน่วยงานอื่นๆ ทั้งหมด ({otherDeptsCount})
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>รายชื่อหน่วยงานทั้งหมด ({departments.length})</span>
          </div>
        )}

        {/* Search Box */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input"
            placeholder="ค้นหาชื่อหน่วยงาน หรือห้องย่อย..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px', marginBottom: 0, fontSize: '0.85rem', height: '38px' }}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* SECTION 3: Grid of Department Cards */}
      <div className="depts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
        {displayedDepartments.length === 0 ? (
          <div className="glass-panel text-center" style={{ gridColumn: '1/-1', padding: '3.5rem 1.5rem', color: 'var(--text-muted)', borderRadius: 'var(--radius-lg)' }}>
            <Building size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>ไม่พบข้อมูลหน่วยงาน</h4>
            <p style={{ fontSize: '0.85rem' }}>
              {searchQuery ? `ไม่พบหน่วยงานหรือห้องที่ตรงกับ "${searchQuery}"` : (deptFilterTab === 'my' && !myDeptConfig ? `ยังไม่มีการลงทะเบียนฝ่าย "${userDept}" ในระบบ` : 'ยังไม่มีข้อมูลหน่วยงาน')}
            </p>
          </div>
        ) : (
          displayedDepartments.map(dept => {
            const isUserOwnDept = dept.name.toLowerCase() === userDept.toLowerCase();
            const allowEditDeptName = canEditDeptName(dept);
            const allowDeleteDept = canDeleteDepartment(dept);
            const allowAddRoom = canAddRoomToDept(dept);

            return (
              <div 
                key={dept.id} 
                className="dept-card glass-panel" 
                style={{ 
                  padding: '1.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '460px', 
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.2s', 
                  border: isUserOwnDept ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  background: isUserOwnDept ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  position: 'relative'
                }}
              >
                {/* Department Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem', gap: '0.5rem' }}>
                  {editingDeptId === dept.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editingDeptName}
                        onChange={(e) => setEditingDeptName(e.target.value)}
                        style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', height: '32px', marginBottom: 0, fontWeight: 700, flex: 1 }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEditDept(dept.id);
                          if (e.key === 'Escape') setEditingDeptId(null);
                        }}
                      />
                      <button type="button" className="btn btn-primary btn-xs" onClick={() => handleSaveEditDept(dept.id)} title="บันทึกชื่อหน่วยงาน" style={{ padding: '0.25rem 0.5rem', height: '32px' }}>
                        <Check size={14} />
                      </button>
                      <button type="button" className="btn btn-ghost btn-xs" onClick={() => setEditingDeptId(null)} title="ยกเลิก" style={{ padding: '0.25rem 0.5rem', height: '32px' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
                        <Building size={18} style={{ color: isUserOwnDept ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }} title={dept.name}>
                              {dept.name}
                            </h4>
                            {isUserOwnDept && (
                              <span style={{ 
                                fontSize: '0.65rem', 
                                background: 'rgba(59, 130, 246, 0.15)', 
                                color: 'var(--primary)', 
                                padding: '2px 6px', 
                                borderRadius: '10px', 
                                fontWeight: 700,
                                flexShrink: 0
                              }}>
                                ฝ่ายของคุณ
                              </span>
                            )}
                          </div>
                        </div>

                        {allowEditDeptName && (
                          <button 
                            type="button" 
                            className="btn-action-icon edit" 
                            onClick={() => handleStartEditDept(dept)} 
                            title="แก้ไขชื่อหน่วยงาน"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                      </div>

                      {allowDeleteDept && (
                        <button 
                          type="button" 
                          className="btn-action-icon delete"
                          onClick={() => handleDeleteDeptSubmit(dept)}
                          title="ลบหน่วยงานนี้ (เฉพาะ Admin/ผู้บริหาร)"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}

                      {!allowEditDeptName && !allowDeleteDept && (
                        <div title="สิทธิ์ดูอย่างเดียว" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                          <Lock size={14} />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Department Card Body - Rooms list */}
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      🏢 ห้อง / สถานที่จัดเก็บ ({dept.locations.length})
                    </span>
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                      {allowAddRoom ? '💡 เลื่อน/แก้ไข/จัดการห้อง' : '🔒 อ่านอย่างเดียว'}
                    </span>
                  </div>
                  
                  {dept.locations.length === 0 ? (
                    <div style={{ padding: '1.5rem 1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={24} style={{ opacity: 0.3, marginBottom: '0.4rem' }} />
                      <span>ยังไม่มีห้องย่อยในหน่วยงานนี้</span>
                    </div>
                  ) : (
                    <div className="room-pills-list" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '0.35rem' }}>
                      {dept.locations.map((room, index) => {
                        const allowManage = canManageRoom(dept, room);
                        const isMine = isMyCreatedRoom(dept, room);
                        const creatorName = getRoomCreatorName(dept, room);

                        return (
                          <div 
                            key={`${room}-${index}`} 
                            className="room-item-row"
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              background: 'var(--bg-primary)', 
                              padding: '0.4rem 0.55rem', 
                              borderRadius: 'var(--radius-sm)', 
                              border: isMine ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--border)', 
                              fontSize: '0.775rem' 
                            }}
                          >
                            {editingRoom && editingRoom.deptId === dept.id && editingRoom.oldName === room ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1 }}>
                                <input 
                                  type="text" 
                                  className="form-input" 
                                  value={editingRoomName}
                                  onChange={(e) => setEditingRoomName(e.target.value)}
                                  style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', height: '26px', marginBottom: 0, flex: 1 }}
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEditRoom();
                                    if (e.key === 'Escape') setEditingRoom(null);
                                  }}
                                />
                                <button type="button" className="btn btn-primary btn-xs" onClick={handleSaveEditRoom} style={{ padding: '0.15rem 0.4rem', height: '26px' }} title="บันทึก">
                                  <Check size={12} />
                                </button>
                                <button type="button" className="btn btn-ghost btn-xs" onClick={() => setEditingRoom(null)} style={{ padding: '0.15rem 0.4rem', height: '26px' }} title="ยกเลิก">
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', overflow: 'hidden', flex: 1, paddingRight: '0.35rem' }} title={`ห้อง: ${room} (สร้างโดย: ${creatorName})`}>
                                  <MapPin size={13} color={isMine ? 'var(--primary)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} /> 
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isMine ? 650 : 400, color: isMine ? 'var(--text-primary)' : 'inherit' }}>
                                    {room}
                                  </span>
                                  {isMine && (
                                    <span style={{ fontSize: '0.625rem', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--primary)', padding: '1px 5px', borderRadius: '8px', fontWeight: 700, flexShrink: 0 }}>
                                      คุณสร้าง
                                    </span>
                                  )}
                                </div>

                                <div className="room-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', flexShrink: 0 }}>
                                  {allowManage ? (
                                    <>
                                      <button 
                                        type="button" 
                                        className="btn-action-icon"
                                        onClick={() => handleMoveRoom(dept, index, 'top')}
                                        disabled={index === 0}
                                        title="ย้ายไปบนสุด"
                                      >
                                        <ChevronsUp size={13} />
                                      </button>
                                      
                                      <button 
                                        type="button" 
                                        className="btn-action-icon"
                                        onClick={() => handleMoveRoom(dept, index, 'up')}
                                        disabled={index === 0}
                                        title="เลื่อนขึ้น 1 ตำแหน่ง"
                                      >
                                        <ArrowUp size={13} />
                                      </button>

                                      <button 
                                        type="button" 
                                        className="btn-action-icon"
                                        onClick={() => handleMoveRoom(dept, index, 'down')}
                                        disabled={index === dept.locations.length - 1}
                                        title="เลื่อนลง 1 ตำแหน่ง"
                                      >
                                        <ArrowDown size={13} />
                                      </button>

                                      <button 
                                        type="button" 
                                        className="btn-action-icon edit" 
                                        onClick={() => handleStartEditRoom(dept, room)}
                                        title="แก้ไขชื่อห้องนี้"
                                      >
                                        <Edit2 size={12} />
                                      </button>

                                      <button 
                                        type="button" 
                                        className="btn-action-icon delete"
                                        onClick={() => handleDeleteRoom(dept, room)}
                                        title="ลบห้องนี้"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </>
                                  ) : (
                                    <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', paddingRight: '4px', opacity: 0.7 }} title={`สร้างโดย: ${creatorName}`}>
                                      {creatorName}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add Room Form inside card (Permission Scoped) */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', gap: '0.35rem' }}>
                  {allowAddRoom ? (
                    <>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="➕ เพิ่มห้องย่อยใหม่..." 
                        value={newRoomNames[dept.id] || ''}
                        onChange={(e) => setNewRoomNames({ ...newRoomNames, [dept.id]: e.target.value })}
                        style={{ flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: '32px', marginBottom: 0 }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddRoom(dept.id);
                          }
                        }}
                      />
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddRoom(dept.id)}
                        disabled={!newRoomNames[dept.id]?.trim()}
                        style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.6rem', fontWeight: 600 }}
                        title="เพิ่มห้องย่อย"
                      >
                        <Plus size={15} />
                      </button>
                    </>
                  ) : (
                    <div style={{ flex: 1, padding: '0.35rem 0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.725rem', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      <Lock size={12} />
                      <span>สิทธิ์อ่านอย่างเดียว (เฉพาะสังกัดฝ่ายนี้)</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      <style>{`
        .dept-card:hover {
          border-color: var(--primary) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }

        .btn-action-icon {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.2rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          opacity: 0.65;
        }

        .btn-action-icon:hover:not(:disabled) {
          opacity: 1;
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .btn-action-icon.edit:hover:not(:disabled) {
          color: var(--primary) !important;
        }

        .btn-action-icon.delete:hover:not(:disabled) {
          color: var(--danger) !important;
        }

        .btn-action-icon:disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }

        .room-pills-list::-webkit-scrollbar {
          width: 5px;
        }
        .room-pills-list::-webkit-scrollbar-track {
          background: var(--bg-primary);
          border-radius: 4px;
        }
        .room-pills-list::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        .room-pills-list::-webkit-scrollbar-thumb:hover {
          background: var(--primary);
        }
      `}</style>
    </div>
  );
};

