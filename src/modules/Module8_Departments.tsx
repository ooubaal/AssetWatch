import React, { useState } from 'react';
import { Building, MapPin, PlusCircle, Trash2, AlertCircle, CheckCircle, Plus, Edit2, ArrowUp, ArrowDown, ChevronsUp, Check, X } from 'lucide-react';
import { DepartmentLocationConfig } from '../utils/mockData';

interface Module8DepartmentsProps {
  departments: DepartmentLocationConfig[];
  onAddDept: (name: string, locations: string[]) => Promise<void>;
  onUpdateDept: (id: string, name: string, locations: string[]) => Promise<void>;
  onDeleteDept: (id: string) => Promise<void>;
}

export const Module8_Departments: React.FC<Module8DepartmentsProps> = ({
  departments,
  onAddDept,
  onUpdateDept,
  onDeleteDept
}) => {
  const [newDeptName, setNewDeptName] = useState('');
  const [newRoomNames, setNewRoomNames] = useState<Record<string, string>>({}); // departmentId -> roomName
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state for Department Name
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingDeptName, setEditingDeptName] = useState<string>('');

  // Editing state for Room Name
  const [editingRoom, setEditingRoom] = useState<{ deptId: string; oldName: string } | null>(null);
  const [editingRoomName, setEditingRoomName] = useState<string>('');

  const handleCreateDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    // Check if name already exists
    if (departments.some(d => d.name.toLowerCase() === newDeptName.trim().toLowerCase())) {
      setErrorMsg('มีหน่วยงาน/ฝ่ายนี้อยู่ในระบบแล้ว');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await onAddDept(newDeptName, []);
      setNewDeptName('');
      setSuccessMsg('เพิ่มหน่วยงานใหม่สำเร็จแล้ว!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('ไม่สามารถเพิ่มหน่วยงานได้');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditDept = (dept: DepartmentLocationConfig) => {
    setEditingDeptId(dept.id);
    setEditingDeptName(dept.name);
  };

  const handleSaveEditDept = async (deptId: string) => {
    if (!editingDeptName.trim()) return;
    const name = editingDeptName.trim();
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;

    if (name !== dept.name && departments.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      alert(`มีหน่วยงานชื่อ "${name}" อยู่ในระบบแล้ว`);
      return;
    }

    try {
      await onUpdateDept(deptId, name, dept.locations);
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

    if (dept.locations.includes(roomName.trim())) {
      setErrorMsg('มีห้อง/บริเวณนี้ในหน่วยงานนี้แล้ว');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const updatedRooms = [...dept.locations, roomName.trim()];
    try {
      await onUpdateDept(deptId, dept.name, updatedRooms);
      setNewRoomNames({ ...newRoomNames, [deptId]: '' });
      setSuccessMsg(`เพิ่มห้อง "${roomName}" สำเร็จ!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('ไม่สามารถเพิ่มห้องจัดเก็บได้');
    }
  };

  const handleStartEditRoom = (deptId: string, roomName: string) => {
    setEditingRoom({ deptId, oldName: roomName });
    setEditingRoomName(roomName);
  };

  const handleSaveEditRoom = async () => {
    if (!editingRoom || !editingRoomName.trim()) return;
    const { deptId, oldName } = editingRoom;
    const newName = editingRoomName.trim();

    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;

    if (newName !== oldName && dept.locations.includes(newName)) {
      alert(`มีห้องชื่อ "${newName}" อยู่ในหน่วยงานนี้แล้ว`);
      return;
    }

    const updatedRooms = dept.locations.map(r => (r === oldName ? newName : r));
    try {
      await onUpdateDept(deptId, dept.name, updatedRooms);
      setEditingRoom(null);
      setEditingRoomName('');
      setSuccessMsg(`แก้ไขชื่อห้องเป็น "${newName}" สำเร็จ`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('ไม่สามารถแก้ไขชื่อห้องได้');
    }
  };

  const handleMoveRoom = async (deptId: string, roomIndex: number, direction: 'top' | 'up' | 'down') => {
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;

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
      await onUpdateDept(deptId, dept.name, newLocs);
    } catch (err) {
      alert('ไม่สามารถย้ายลำดับห้องได้');
    }
  };

  const handleDeleteRoom = async (deptId: string, roomToDelete: string) => {
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;

    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบห้อง/บริเวณ "${roomToDelete}" ออกจากระบบ?`)) {
      return;
    }

    const updatedRooms = dept.locations.filter(r => r !== roomToDelete);
    try {
      await onUpdateDept(deptId, dept.name, updatedRooms);
      setSuccessMsg('ลบห้องจัดเก็บออกสำเร็จ');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('ไม่สามารถลบห้องจัดเก็บได้');
    }
  };

  const handleDeleteDeptSubmit = async (id: string, name: string) => {
    if (!window.confirm(`⚠️ คำเตือนขั้นเด็ดขาด: คุณแน่ใจที่จะลบแผนก "${name}" และสถานที่ย่อยทั้งหมดออกใช่หรือไม่?\n\nข้อมูลครุภัณฑ์ที่ผูกกับแผนกนี้จะไม่ได้รับผลกระทบกับข้อมูลหลัก แต่อินเตอร์เฟสกล่องตัวเลือก Dropdown จะไม่แสดงผลเชื่อมต่อของแผนกนี้อีกต่อไป`)) {
      return;
    }

    try {
      await onDeleteDept(id);
      setSuccessMsg(`ลบหน่วยงาน "${name}" สำเร็จ`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('ไม่สามารถลบแผนกได้');
    }
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>จัดการหน่วยงาน & สถานที่ตั้ง (Module 8)</h2>
        <p>ตั้งค่าแผนผังโครงสร้างขององค์กร กำหนดชื่อแผนก และห้องย่อย เพื่อเพิ่มความแม่นยำในการระบุตำแหน่งครุภัณฑ์</p>
      </div>

      {/* SECTION 1: Add New Department */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building size={20} className="text-primary" /> ➕ เพิ่มฝ่าย / แผนก / หน่วยงานใหม่
        </h3>
        
        <form onSubmit={handleCreateDeptSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
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
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}
          >
            <PlusCircle size={16} /> {saving ? 'กำลังบันทึก...' : 'เพิ่มหน่วยงาน'}
          </button>
        </form>

        {successMsg && (
          <div className="alert alert-success animate-fade-in" style={{ marginTop: '0.75rem', padding: '0.5rem 1rem' }}>
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger animate-fade-in" style={{ marginTop: '0.75rem', padding: '0.5rem 1rem' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* SECTION 2: Grid list of departments */}
      <div className="depts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {departments.length === 0 ? (
          <div className="glass-panel text-center" style={{ gridColumn: '1/-1', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <Building size={48} style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
            <p>ยังไม่มีข้อมูลหน่วยงานลงทะเบียนในระบบ</p>
          </div>
        ) : (
          departments.map(dept => (
            <div key={dept.id} className="dept-card glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '440px', transition: 'all 0.2s', border: '1px solid var(--border)' }}>
              
              {/* Card Header */}
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
                    <button type="button" className="btn btn-primary btn-xs" onClick={() => handleSaveEditDept(dept.id)} title="บันทึกชื่อหน่วยงาน" style={{ padding: '0.25rem 0.4rem', height: '32px' }}>
                      <Check size={14} />
                    </button>
                    <button type="button" className="btn btn-ghost btn-xs" onClick={() => setEditingDeptId(null)} title="ยกเลิก" style={{ padding: '0.25rem 0.4rem', height: '32px' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
                      <Building size={18} className="text-blue" style={{ flexShrink: 0 }} />
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={dept.name}>
                        {dept.name}
                      </h4>
                      <button 
                        type="button" 
                        className="btn-action-icon edit" 
                        onClick={() => handleStartEditDept(dept)} 
                        title="แก้ไขชื่อหน่วยงาน"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>

                    <button 
                      type="button" 
                      className="btn-action-icon delete"
                      onClick={() => handleDeleteDeptSubmit(dept.id, dept.name)}
                      title="ลบหน่วยงานนี้"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>

              {/* Card Body - Scrollable Rooms list */}
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 650 }}>
                    🏢 ห้อง / บริเวณจัดเก็บภายใน ({dept.locations.length})
                  </span>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                    💡 เลื่อนเพื่อดูลำดับห้อง
                  </span>
                </div>
                
                {dept.locations.length === 0 ? (
                  <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    ไม่มีห้องพักหรือชั้นจัดเก็บย่อยระบุไว้
                  </div>
                ) : (
                  <div className="room-pills-list" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '0.35rem' }}>
                    {dept.locations.map((room, index) => (
                      <div 
                        key={`${room}-${index}`} 
                        className="room-item-row"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.775rem' }}
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
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: '0.35rem' }} title={room}>
                              <MapPin size={13} color="var(--primary)" style={{ flexShrink: 0 }} /> 
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room}</span>
                            </span>

                            <div className="room-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', flexShrink: 0 }}>
                              <button 
                                type="button" 
                                className="btn-action-icon"
                                onClick={() => handleMoveRoom(dept.id, index, 'top')}
                                disabled={index === 0}
                                title="ย้ายไปบนสุด"
                              >
                                <ChevronsUp size={13} />
                              </button>
                              
                              <button 
                                type="button" 
                                className="btn-action-icon"
                                onClick={() => handleMoveRoom(dept.id, index, 'up')}
                                disabled={index === 0}
                                title="เลื่อนขึ้น 1 ตำแหน่ง"
                              >
                                <ArrowUp size={13} />
                              </button>

                              <button 
                                type="button" 
                                className="btn-action-icon"
                                onClick={() => handleMoveRoom(dept.id, index, 'down')}
                                disabled={index === dept.locations.length - 1}
                                title="เลื่อนลง 1 ตำแหน่ง"
                              >
                                <ArrowDown size={13} />
                              </button>

                              <button 
                                type="button" 
                                className="btn-action-icon edit"
                                onClick={() => handleStartEditRoom(dept.id, room)}
                                title="แก้ไขชื่อห้องนี้"
                              >
                                <Edit2 size={12} />
                              </button>

                              <button 
                                type="button" 
                                className="btn-action-icon delete"
                                onClick={() => handleDeleteRoom(dept.id, room)}
                                title="ลบห้องนี้"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Room input inside card */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', gap: '0.35rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="เพิ่มห้องย่อย..." 
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
                  style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.5rem' }}
                  title="เพิ่มห้องย่อย"
                >
                  <Plus size={15} />
                </button>
              </div>

            </div>
          ))
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
