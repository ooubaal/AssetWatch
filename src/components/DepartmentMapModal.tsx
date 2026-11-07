import React, { useState, useRef, useEffect } from 'react';
import { 
  Map, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Upload, 
  Trash2, 
  AlertCircle, 
  Search, 
  Check, 
  Copy, 
  MapPin, 
  FileText,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { DepartmentLocationConfig } from '../utils/mockData';
import { compressFileOrPdf, uploadImage } from '../services/dbService';

export interface DepartmentMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: DepartmentLocationConfig | null;
  canManageMap?: boolean;
  onUpdateMap?: (deptId: string, mapUrl: string, mapName?: string) => Promise<void>;
  onSelectRoom?: (roomName: string) => void;
}

export const DepartmentMapModal: React.FC<DepartmentMapModalProps> = ({
  isOpen,
  onClose,
  department,
  canManageMap = false,
  onUpdateMap,
  onSelectRoom
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [roomSearch, setRoomSearch] = useState<string>('');
  const [copiedRoom, setCopiedRoom] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset zoom & search on open or dept change
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setRotation(0);
      setUploadError('');
      setRoomSearch('');
      setCopiedRoom(null);
    }
  }, [isOpen, department?.id]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !department) return null;

  const mapUrl = department.mapUrl || '';
  const hasMap = Boolean(mapUrl.trim());

  // Filter department rooms by search
  const filteredRooms = (department.locations || []).filter(room => 
    room.toLowerCase().includes(roomSearch.toLowerCase().trim())
  );

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Handle map file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      // Compress image/PDF document to readable high-res document with small payload
      const compressed = await compressFileOrPdf(file, 1600, 1600, 0.82);
      const uploadedUrl = await uploadImage(compressed, 'department_maps');

      if (onUpdateMap) {
        await onUpdateMap(department.id, uploadedUrl, file.name);
      }
      setZoomLevel(1);
      setRotation(0);
    } catch (err: any) {
      console.error('Failed to upload department map:', err);
      setUploadError(err?.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพแผนที่');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle map deletion
  const handleDeleteMap = async () => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรูปภาพแผนที่ของ "${department.name}"?`)) {
      return;
    }

    setIsUploading(true);
    try {
      if (onUpdateMap) {
        await onUpdateMap(department.id, '', '');
      }
    } catch (err: any) {
      console.error('Failed to delete department map:', err);
      alert('ไม่สามารถลบรูปภาพแผนที่ได้: ' + (err?.message || ''));
    } finally {
      setIsUploading(false);
    }
  };

  // Copy room name or select room
  const handleRoomClick = (room: string) => {
    if (onSelectRoom) {
      onSelectRoom(room);
      onClose();
      return;
    }

    try {
      navigator.clipboard.writeText(room);
      setCopiedRoom(room);
      setTimeout(() => setCopiedRoom(null), 2000);
    } catch {}
  };

  return (
    <div 
      className="modal-backdrop animate-fade-in" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div 
        className="modal-card glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95vw',
          maxWidth: '1100px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--border)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <Map size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  แผนผัง / แผนที่ตำแหน่งจัดเก็บ
                </h3>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', fontWeight: 650 }}>
                  {department.name}
                </span>
              </div>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                ใช้ตรวจสอบผังห้องและตำแหน่งที่ตั้งจริง เพื่อความถูกต้องในการระบุสถานที่จัดเก็บครุภัณฑ์
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {canManageMap && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  title="อัปโหลดหรือเปลี่ยนรูปภาพแผนที่ของฝ่ายนี้"
                >
                  <Upload size={13} />
                  <span>{hasMap ? 'เปลี่ยนรูปแผนที่' : 'อัปโหลดแผนที่'}</span>
                </button>

                {hasMap && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleDeleteMap}
                    disabled={isUploading}
                    style={{ color: 'var(--danger)', padding: '0.35rem 0.55rem' }}
                    title="ลบรูปภาพแผนที่"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
              title="ปิดหน้าต่าง (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Hidden File Input for Map Upload */}
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="alert alert-danger" style={{ margin: '0.75rem 1.25rem 0', padding: '0.5rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={15} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Main Body */}
        <div style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}>
          {/* Map Viewer Viewport Area (Left / Main) */}
          <div style={{
            flex: '1 1 65%',
            minWidth: '320px',
            minHeight: '340px',
            backgroundColor: '#0f172a',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Toolbar overlay for Map Zoom & Actions */}
            {hasMap && (
              <div style={{
                position: 'absolute',
                top: '0.75rem',
                left: '0.75rem',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(6px)',
                padding: '0.3rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff'
              }}>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="map-tool-btn"
                  title="ซูมเข้า (+)"
                  disabled={zoomLevel >= 3.5}
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="map-tool-btn"
                  title="ซูมออก (-)"
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut size={15} />
                </button>
                <span style={{ fontSize: '0.7rem', padding: '0 0.35rem', fontFamily: 'monospace', minWidth: '40px', textAlign: 'center' }}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="map-tool-btn"
                  title="รีเซ็ตขนาด 100%"
                >
                  <Maximize2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="map-tool-btn"
                  title="หมุนรูปภาพ 90 องศา"
                >
                  <RotateCw size={14} />
                </button>

                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="map-tool-btn"
                  title="เปิดดูรูปต้นฉบับเต็มจอในแท็บใหม่"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            )}

            {/* Map Canvas / Viewer Content */}
            <div style={{
              flex: 1,
              width: '100%',
              height: '100%',
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              position: 'relative'
            }}>
              {isUploading ? (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <RefreshCw size={36} className="animate-spin text-primary" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>กำลังประมวลผลและอัปโหลดรูปภาพแผนที่...</p>
                </div>
              ) : hasMap ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out'
                }}>
                  <img 
                    src={mapUrl} 
                    alt={`แผนผัง ${department.name}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '75vh',
                      objectFit: 'contain',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      pointerEvents: 'auto',
                      userSelect: 'none'
                    }}
                  />
                </div>
              ) : (
                /* Empty state when department has no map image */
                <div style={{
                  textAlign: 'center',
                  padding: '2.5rem 1.5rem',
                  maxWidth: '420px',
                  color: '#94a3b8'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    color: 'var(--primary)'
                  }}>
                    <Map size={32} />
                  </div>
                  <h4 style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.05rem', margin: '0 0 0.5rem 0' }}>
                    ยังไม่มีรูปภาพแผนผังของฝ่ายนี้
                  </h4>
                  <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#94a3b8', margin: '0 0 1.25rem 0' }}>
                    คุณสามารถอัปโหลดไฟล์ภาพแปลนอาคาร แผนผังห้อง หรือแผนที่ระบุตำแหน่ง เพื่อให้เจ้าหน้าที่ใช้เปิดเทียบหาชื่อห้องและตำแหน่งที่ตั้งจริงได้สะดวก
                  </p>

                  {canManageMap ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.85rem',
                        padding: '0.6rem 1.25rem',
                        fontWeight: 700
                      }}
                    >
                      <Upload size={16} /> ➕ อัปโหลดรูปภาพแผนที่ / ผังห้อง
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                      (เฉพาะหัวหน้าฝ่าย {department.name} หรือผู้ดูแลระบบ Admin/Manager ที่มีสิทธิ์อัปโหลดแผนผัง)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Room Directory Reference Panel (Right / Sidebar) */}
          <div style={{
            flex: '1 1 35%',
            minWidth: '280px',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-secondary)',
            maxHeight: '75vh'
          }}>
            {/* Room Directory Header */}
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 750, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} className="text-primary" />
                  รายชื่อห้อง / ตำแหน่งจัดเก็บ ({department.locations?.length || 0})
                </span>
                {onSelectRoom && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600 }}>
                    💡 คลิกเพื่อเลือกห้อง
                  </span>
                )}
              </div>

              {/* Room search filter */}
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  className="form-input"
                  placeholder="ค้นหาชื่อห้อง..."
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.5rem 0.3rem 1.7rem',
                    height: '30px',
                    marginBottom: 0,
                    width: '100%',
                    background: 'var(--bg-primary)'
                  }}
                />
              </div>
            </div>

            {/* Room Directory List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}>
              {filteredRooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {roomSearch ? `ไม่พบห้องที่ตรงกับ "${roomSearch}"` : 'ยังไม่มีห้องในหน่วยงานนี้'}
                </div>
              ) : (
                filteredRooms.map((room, idx) => {
                  const isCopied = copiedRoom === room;
                  return (
                    <button
                      key={`${room}-${idx}`}
                      type="button"
                      onClick={() => handleRoomClick(room)}
                      title={onSelectRoom ? `คลิกเพื่อเลือก "${room}"` : `คลิกเพื่อคัดลอกชื่อห้อง "${room}"`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-primary)',
                        border: isCopied ? '1px solid var(--success)' : '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        fontSize: '0.775rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                      className="room-ref-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontFamily: 'monospace', minWidth: '20px' }}>
                          {idx + 1}.
                        </span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 550 }}>
                          {room}
                        </span>
                      </div>

                      <div style={{ flexShrink: 0, marginLeft: '0.5rem', color: isCopied ? 'var(--success)' : 'var(--text-muted)' }}>
                        {isCopied ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.65rem', color: 'var(--success)' }}>
                            <Check size={12} /> คัดลอกแล้ว
                          </span>
                        ) : onSelectRoom ? (
                          <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600 }}>
                            เลือก
                          </span>
                        ) : (
                          <Copy size={12} className="copy-icon" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick helper tip footer */}
            <div style={{ padding: '0.6rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--bg-primary)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileText size={13} className="text-primary" style={{ flexShrink: 0 }} />
              <span>คลิกชื่อห้องเพื่อคัดลอกข้อความไปใช้งานได้ทันที</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .map-tool-btn {
          background: transparent;
          border: none;
          color: #e2e8f0;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .map-tool-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }
        .map-tool-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .room-ref-item:hover {
          border-color: var(--primary) !important;
          background: var(--bg-secondary) !important;
        }
        .room-ref-item:hover .copy-icon {
          color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
};
