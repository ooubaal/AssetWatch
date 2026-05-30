import React, { useState } from 'react';
import { Building, MapPin, PlusCircle, Trash2, AlertCircle, CheckCircle, Plus } from 'lucide-react';
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
      <div className="depts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {departments.length === 0 ? (
          <div className="glass-panel text-center" style={{ gridColumn: '1/-1', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <Building size={48} style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
            <p>ยังไม่มีข้อมูลหน่วยงานลงทะเบียนในระบบ</p>
          </div>
        ) : (
          departments.map(dept => (
            <div key={dept.id} className="dept-card glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.2s', border: '1px solid var(--border)' }}>
              
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building size={18} className="text-blue" />
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{dept.name}</h4>
                </div>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs"
                  onClick={() => handleDeleteDeptSubmit(dept.id, dept.name)}
                  title="ลบหน่วยงานนี้"
                  style={{ color: 'var(--danger)', padding: '0.2rem' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Card Body - Rooms list */}
              <div style={{ flex: 1, marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 650, display: 'block', marginBottom: '0.5rem' }}>
                  🏢 ห้อง / บริเวณจัดเก็บภายใน ({dept.locations.length})
                </span>
                
                {dept.locations.length === 0 ? (
                  <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
                    ไม่มีห้องพักหรือชั้นจัดเก็บย่อยระบุไว้
                  </div>
                ) : (
                  <div className="room-pills-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {dept.locations.map(room => (
                      <div 
                        key={room} 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8rem' }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                          <MapPin size={13} color="var(--primary)" /> {room}
                        </span>
                        <button 
                          type="button" 
                          className="btn-close-mini"
                          onClick={() => handleDeleteRoom(dept.id, room)}
                          title="ลบสถานที่ย่อย"
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
                        >
                          <Trash2 size={12} className="hover-red" style={{ transition: 'color 0.15s' }} />
                        </button>
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
                >
                  <Plus size={15} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      <style>{`
        .hover-red:hover {
          color: var(--danger) !important;
        }

        .dept-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
          border-color: var(--primary) !important;
        }

        .btn-close-mini {
          opacity: 0.5;
          transition: opacity 0.15s;
        }

        .btn-close-mini:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
