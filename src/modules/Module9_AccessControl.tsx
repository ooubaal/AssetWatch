import React, { useState } from 'react';
import { UserAccount, DepartmentLocationConfig } from '../utils/mockData';
import { Users, UserPlus, Ban, Trash2, Edit3, ShieldAlert, UserCheck, Search, Shield, Building, X, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';

interface Module9AccessControlProps {
  departments: DepartmentLocationConfig[];
  users: UserAccount[];
  onAddUser: (user: UserAccount) => Promise<void>;
  onUpdateUser: (id: string, updates: Partial<UserAccount>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  currentUser: UserAccount | null;
}

export const Module9_AccessControl: React.FC<Module9AccessControlProps> = ({
  departments,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [department, setDepartment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Stats calculation
  const totalCount = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;
  const blockedCount = users.filter(u => u.isBlocked).length;

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ? true : 
                          statusFilter === 'blocked' ? u.isBlocked : !u.isBlocked;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setName('');
    setRole('user');
    setDepartment(departments[0]?.name || '');
    setError(null);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword(user.password || '');
    setName(user.name);
    setRole(user.role);
    setDepartment(user.department);
    setError(null);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingUser) {
        // Edit User
        const updates: Partial<UserAccount> = {
          username: username.trim(),
          name: name.trim(),
          role,
          department: role === 'admin' ? '' : department
        };
        if (password.trim()) {
          updates.password = password;
        }
        await onUpdateUser(editingUser.id, updates);
      } else {
        // Add User
        // Check duplication
        const duplicate = users.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
        if (duplicate) {
          setError('ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น');
          setSaving(false);
          return;
        }

        const newUser: UserAccount = {
          id: `user-${Date.now()}`,
          username: username.trim().toLowerCase(),
          password: password.trim() || '123456',
          name: name.trim(),
          role,
          department: role === 'admin' ? '' : department,
          isBlocked: false,
          createdAt: new Date().toISOString()
        };
        await onAddUser(newUser);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'เกิดข้อผิดพลาดในการประมวลผลข้อมูลผู้ใช้');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBlock = async (user: UserAccount) => {
    if (user.id === currentUser?.id) {
      alert('ไม่สามารถระงับสิทธิ์การใช้งานบัญชีที่คุณกำลังเข้าสู่ระบบอยู่ได้');
      return;
    }
    
    const confirmMsg = user.isBlocked 
      ? `ต้องการยกเลิกการบล็อกบัญชีผู้ใช้ "${user.name}" หรือไม่?`
      : `คุณแน่ใจหรือไม่ว่าต้องการระงับการใช้งานบัญชีผู้ใช้ "${user.name}"?\nผู้ใช้นี้จะไม่สามารถเข้าระบบพัสดุได้หลังจากโดนระงับสิทธิ์`;

    if (window.confirm(confirmMsg)) {
      try {
        await onUpdateUser(user.id, { isBlocked: !user.isBlocked });
      } catch (err) {
        console.error(err);
        alert('ไม่สามารถปรับปรุงสถานะการระงับสิทธิ์ได้');
      }
    }
  };

  const handleDeleteClick = async (user: UserAccount) => {
    if (user.id === currentUser?.id) {
      alert('ไม่สามารถลบบัญชีของคุณเองที่กำลังเข้าใช้งานอยู่ได้');
      return;
    }

    if (window.confirm(`⚠️ คำเตือน: คุณต้องการลบบัญชีผู้ใช้ "${user.name}" ออกจากระบบถาวรหรือไม่?\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      try {
        await onDeleteUser(user.id);
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการลบบัญชีผู้ใช้');
      }
    }
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>ระบบบริหารจัดการสิทธิ์และการเข้าถึง (Module 9)</h2>
        <p>สร้างบัญชีเจ้าหน้าที่ กำหนดการดูแลครุภัณฑ์แยกเฉพาะรายหน่วยงาน และควบคุมความปลอดภัยฐานข้อมูล</p>
      </div>

      {/* Stats row */}
      <div className="stats-row-simple grid-cols-4">
        <div className="stat-card-simple glass-panel">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <Users size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-num">{totalCount}</span>
            <span className="stat-label">บัญชีผู้ใช้งานทั้งหมด</span>
          </div>
        </div>

        <div className="stat-card-simple glass-panel">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            <Shield size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-num">{adminCount}</span>
            <span className="stat-label">ผู้ดูแลระบบ (Admin)</span>
          </div>
        </div>

        <div className="stat-card-simple glass-panel">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan)' }}>
            <Building size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-num">{userCount}</span>
            <span className="stat-label">เจ้าหน้าที่พัสดุฝ่าย</span>
          </div>
        </div>

        <div className="stat-card-simple glass-panel">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <ShieldAlert size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-num">{blockedCount}</span>
            <span className="stat-label">บัญชีที่ถูกระงับสิทธิ์</span>
          </div>
        </div>
      </div>

      {/* Control panel & Filter bar */}
      <div className="control-bar-panel glass-panel" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="filter-row flex-row-between gap-md" style={{ flexWrap: 'wrap' }}>
          
          <div className="search-box flex-1 min-w-300">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              className="form-input search-input" 
              placeholder="ค้นหาชื่อผู้ใช้, ชื่อบัญชี หรือแผนก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdowns flex-row-end gap-sm" style={{ flexWrap: 'wrap' }}>
            <select 
              className="form-select select-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: '140px' }}
            >
              <option value="all">ระดับสิทธิ์ทั้งหมด</option>
              <option value="admin">ผู้ดูแล (Admin)</option>
              <option value="user">เจ้าหน้าที่ฝ่าย (User)</option>
            </select>

            <select 
              className="form-select select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '140px' }}
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">ปกติ (Active)</option>
              <option value="blocked">โดนระงับ (Blocked)</option>
            </select>

            <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ height: '38px', whiteSpace: 'nowrap' }}>
              <UserPlus size={16} /> <span>เพิ่มผู้ใช้งานใหม่</span>
            </button>
          </div>

        </div>
      </div>

      {/* Users grid layout */}
      <div className="users-cards-grid">
        {filteredUsers.length === 0 ? (
          <div className="survey-wait-card glass-panel" style={{ gridColumn: '1 / -1', minHeight: '260px' }}>
            <Users size={36} color="var(--text-muted)" />
            <h3>ไม่พบรายชื่อผู้ใช้งาน</h3>
            <p>กรุณาลองปรับเปลี่ยนคำค้นหา หรือระดับสิทธิ์ตัวกรองใหม่อีกครั้ง</p>
          </div>
        ) : (
          filteredUsers.map(user => {
            const initials = user.name.slice(0, 2);
            // Dynamic avatar gradient depending on role and status
            let avatarBg = 'linear-gradient(135deg, #3b82f6, #6366f1)';
            if (user.role === 'admin') avatarBg = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
            if (user.isBlocked) avatarBg = 'linear-gradient(135deg, #ef4444, #991b1b)';

            return (
              <div key={user.id} className={`user-glass-card glass-panel ${user.isBlocked ? 'card-blocked-gray' : ''}`}>
                
                {/* Header status indicators */}
                <div className="user-card-header">
                  {user.isBlocked ? (
                    <span className="role-badge badge-red"><Ban size={12} /> ถูกบล็อก</span>
                  ) : user.role === 'admin' ? (
                    <span className="role-badge badge-blue"><Shield size={12} /> ผู้ดูแลระบบ</span>
                  ) : (
                    <span className="role-badge badge-cyan"><Building size={12} /> เจ้าหน้าที่ฝ่าย</span>
                  )}
                  
                  {user.id === currentUser?.id && (
                    <span className="current-user-tag">บัญชีของคุณ</span>
                  )}
                </div>

                {/* Avatar and Profile Brief */}
                <div className="user-profile-brief">
                  <div className="user-avatar" style={{ background: avatarBg }}>
                    {initials}
                  </div>
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <span className="username-sub">@{user.username}</span>
                  </div>
                </div>

                {/* User Department */}
                <div className="user-dept-row">
                  <Building size={14} className="icon-dept" />
                  <span className="dept-text">
                    {user.role === 'admin' ? 'ดูแลภาพรวมทุกแผนก' : (user.department || 'ไม่ระบุฝ่าย')}
                  </span>
                </div>

                {/* Date Created */}
                <div className="user-created-date">
                  <span>ลงทะเบียน: {new Date(user.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>

                {/* Action Buttons */}
                <div className="user-card-actions">
                  <button 
                    className="btn btn-ghost btn-sm btn-icon-text" 
                    onClick={() => handleOpenEditModal(user)}
                    title="แก้ไขข้อมูลโปรไฟล์"
                  >
                    <Edit3 size={14} /> แก้ไข
                  </button>

                  <button 
                    className={`btn btn-ghost btn-sm btn-icon-text ${user.isBlocked ? 'btn-unblock' : 'btn-block'}`}
                    onClick={() => handleToggleBlock(user)}
                    disabled={user.id === currentUser?.id}
                    title={user.isBlocked ? 'ปลดบล็อกบัญชี' : 'ระงับสิทธิ์การใช้งาน'}
                  >
                    {user.isBlocked ? (
                      <><UserCheck size={14} color="var(--success)" /> ปลดบล็อก</>
                    ) : (
                      <><Ban size={14} color="var(--danger)" /> ระงับสิทธิ์</>
                    )}
                  </button>

                  <button 
                    className="btn btn-ghost btn-sm btn-icon-text btn-delete-red"
                    onClick={() => handleDeleteClick(user)}
                    disabled={user.id === currentUser?.id}
                    title="ลบบัญชีผู้ใช้งานถาวร"
                  >
                    <Trash2 size={14} /> ลบ
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* FORM OVERLAY MODAL: Add / Edit User */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel animate-scale-up" style={{ maxWidth: '500px', width: '90%' }}>
            
            <div className="modal-header">
              <h3>{editingUser ? '📝 แก้ไขข้อมูลบัญชีผู้ใช้งาน' : '➕ เพิ่มบัญชีผู้ใช้งานใหม่'}</h3>
              <button className="btn btn-ghost btn-icon-only" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form">
              
              <div className="form-group">
                <label className="form-label">👤 ชื่อ-นามสกุลจริงเจ้าหน้าที่</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="เช่น นายพัสดุ พาสแกน"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">🏷️ ชื่อผู้ใช้งานในระบบ (Username - ภาษาอังกฤษไม่มีเว้นวรรค)</label>
                <input 
                  type="text" 
                  className="form-input monospace-input" 
                  placeholder="เช่น pass_scanner"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!!editingUser} // Cannot change username after creation
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  🔑 {editingUser ? 'เปลี่ยนรหัสผ่านใหม่ (ปล่อยว่างหากต้องการใช้รหัสผ่านเดิม)' : 'รหัสผ่านเข้าใช้งานเริ่มต้น'}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input" 
                    placeholder={editingUser ? 'ป้อนรหัสผ่านใหม่...' : 'เช่น 123456 (ค่าดีฟอลต์หากว่าง)'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!editingUser}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      position: 'absolute', 
                      right: '0.75rem', 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--text-muted)', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.25rem',
                      height: 'auto'
                    }}
                    title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">🛡️ ระดับสิทธิ์ควบคุม</label>
                <select 
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                  required
                >
                  <option value="user">เจ้าหน้าที่ปฏิบัติการฝ่ายพัสดุ (User Operation)</option>
                  <option value="admin">ผู้ดูแลระบบสูงสุด (Admin)</option>
                </select>
              </div>

              {role === 'user' && (
                <div className="form-group animate-fade-in">
                  <label className="form-label">🏢 ฝ่าย/หน่วยงานพัสดุที่สังกัด (เพื่อใช้ควบคุมการดูแลทรัพย์สิน)</label>
                  <select 
                    className="form-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required={role === 'user'}
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {error && (
                <div className="alert alert-danger" style={{ marginTop: '1rem', padding: '0.75rem' }}>
                  <ShieldAlert size={16} /> <span>{error}</span>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'กำลังบันทึกบัญชี...' : '💾 บันทึกข้อมูลสิทธิ์'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      <style>{`
        .users-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .user-glass-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform var(--transition-medium), box-shadow var(--transition-medium);
        }

        .user-glass-card:hover {
          transform: translateY(-4px);
        }

        .card-blocked-gray {
          opacity: 0.8;
          border-color: rgba(239, 68, 68, 0.3) !important;
          background: rgba(15, 11, 11, 0.25) !important;
        }

        .user-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          font-weight: 650;
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
        }

        .badge-blue {
          background-color: rgba(59, 130, 246, 0.12);
          color: var(--primary);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .badge-cyan {
          background-color: rgba(6, 182, 212, 0.12);
          color: var(--cyan);
          border: 1px solid rgba(6, 182, 212, 0.2);
        }

        .badge-red {
          background-color: rgba(239, 68, 68, 0.12);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .current-user-tag {
          font-size: 0.65rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
        }

        .user-profile-brief {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-family: var(--font-primary);
          font-weight: 700;
          font-size: 1rem;
          text-transform: uppercase;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        .user-info h4 {
          font-size: 1rem;
          font-weight: 650;
          margin: 0;
          color: var(--text-primary);
        }

        .username-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: monospace;
        }

        .user-dept-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .icon-dept {
          color: var(--text-muted);
        }

        .dept-text {
          font-weight: 550;
        }

        .user-created-date {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
          border-top: 1px dashed var(--border);
          padding-top: 0.75rem;
        }

        .user-card-actions {
          display: flex;
          gap: 0.35rem;
          margin-top: auto;
        }

        .btn-icon-text {
          font-size: 0.75rem;
          padding: 0.35rem 0.5rem;
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          height: auto;
        }

        .btn-icon-text:hover {
          background-color: var(--border);
        }

        .btn-unblock:hover {
          border-color: var(--success);
          color: var(--success);
        }

        .btn-block:hover {
          border-color: var(--danger);
          color: var(--danger);
        }

        .btn-delete-red:hover {
          background-color: rgba(239, 68, 68, 0.1) !important;
          border-color: var(--danger) !important;
          color: var(--danger) !important;
        }

        .monospace-input {
          font-family: monospace;
          font-weight: 600;
        }
      `}</style>

    </div>
  );
};
