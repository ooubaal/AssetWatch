import{r as e}from"./rolldown-runtime-BHe-jwch.js";import{F as t,It as n,Ot as r,St as i,X as a,Y as o,i as s,k as c,l,m as u,s as d,u as f,v as p,x as m,y as h}from"./vendor-icons-BqLhoM6m.js";import{n as g}from"./vendor-react-dDs_0d6G.js";var _=e(n(),1),v=g(),y=({departments:e,users:n,onAddUser:g,onUpdateUser:y,onDeleteUser:b,currentUser:x})=>{let[S,C]=(0,_.useState)(``),[w,T]=(0,_.useState)(`all`),[E,D]=(0,_.useState)(`all`),[O,k]=(0,_.useState)(!1),[A,j]=(0,_.useState)(null),[M,N]=(0,_.useState)(``),[P,F]=(0,_.useState)(``),[I,L]=(0,_.useState)(``),[R,z]=(0,_.useState)(`operator`),[B,V]=(0,_.useState)(``),[H,U]=(0,_.useState)(!1),[W,G]=(0,_.useState)(null),[K,q]=(0,_.useState)(!1),J=n.length,Y=n.filter(e=>e.role===`admin`).length,X=n.filter(e=>e.role===`manager`).length;n.filter(e=>e.role===`head`).length;let Z=n.filter(e=>e.role===`operator`||e.role===`user`).length,Q=n.filter(e=>e.isBlocked).length,$=n.filter(e=>{let t=S.toLowerCase().trim(),n=!t||(e.name||``).toLowerCase().includes(t)||(e.username||``).toLowerCase().includes(t)||(e.department||``).toLowerCase().includes(t),r=w===`all`?!0:e.role===w,i=E===`all`?!0:E===`blocked`?e.isBlocked:!e.isBlocked;return n&&r&&i});if(x?.role!==`admin`)return(0,v.jsx)(`div`,{className:`module-container animate-fade-in`,style:{padding:`2rem`,textAlign:`center`},children:(0,v.jsxs)(`div`,{className:`glass-panel`,style:{padding:`3rem 2rem`,maxWidth:`520px`,margin:`2rem auto`},children:[(0,v.jsx)(t,{size:48,color:`var(--danger)`,style:{marginBottom:`1rem`}}),(0,v.jsx)(`h3`,{children:`การเข้าถึงถูกจำกัด (Access Restricted)`}),(0,v.jsx)(`p`,{style:{color:`var(--text-secondary)`,marginTop:`0.75rem`,fontSize:`0.9rem`,lineHeight:1.5},children:`โมดูลบริหารจัดการสิทธิ์และการเข้าถึง (Module 9) สงวนสิทธิ์เฉพาะผู้ดูแลระบบระดับสูง (Admin) เท่านั้น เพื่อความปลอดภัยของข้อมูลบัญชีผู้ใช้งาน`})]})});let ee=()=>{j(null),N(``),F(``),L(``),z(`user`),V(e[0]?.name||``),G(null),q(!1),k(!0)},te=e=>{j(e),N(e.username),F(e.password||``),L(e.name),z(e.role),V(e.department),G(null),q(!1),k(!0)},ne=async e=>{if(e.preventDefault(),!M.trim()||!I.trim()){G(`กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน`);return}U(!0),G(null);try{if(A){let e={username:M.trim(),name:I.trim(),role:R,department:R===`admin`?``:B};P.trim()&&(e.password=P),await y(A.id,e)}else{if(n.some(e=>e.username.toLowerCase()===M.trim().toLowerCase())){G(`ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`),U(!1);return}await g({id:`user-${Date.now()}`,username:M.trim().toLowerCase(),password:P.trim()||`123456`,name:I.trim(),role:R,department:R===`admin`?``:B,isBlocked:!1,createdAt:new Date().toISOString()})}k(!1)}catch(e){console.error(e),G(e.message||`เกิดข้อผิดพลาดในการประมวลผลข้อมูลผู้ใช้`)}finally{U(!1)}},re=async e=>{if(e.id===x?.id){alert(`ไม่สามารถระงับสิทธิ์การใช้งานบัญชีที่คุณกำลังเข้าสู่ระบบอยู่ได้`);return}let t=e.isBlocked?`ต้องการยกเลิกการบล็อกบัญชีผู้ใช้ "${e.name}" หรือไม่?`:`คุณแน่ใจหรือไม่ว่าต้องการระงับการใช้งานบัญชีผู้ใช้ "${e.name}"?\nผู้ใช้นี้จะไม่สามารถเข้าระบบพัสดุได้หลังจากโดนระงับสิทธิ์`;if(window.confirm(t))try{await y(e.id,{isBlocked:!e.isBlocked})}catch(e){console.error(e),alert(`ไม่สามารถปรับปรุงสถานะการระงับสิทธิ์ได้`)}},ie=async e=>{if(e.id===x?.id){alert(`ไม่สามารถลบบัญชีของคุณเองที่กำลังเข้าใช้งานอยู่ได้`);return}if(window.confirm(`⚠️ คำเตือน: คุณต้องการลบบัญชีผู้ใช้ "${e.name}" ออกจากระบบถาวรหรือไม่?\nการกระทำนี้ไม่สามารถย้อนกลับได้`))try{await b(e.id)}catch(e){console.error(e),alert(`เกิดข้อผิดพลาดในการลบบัญชีผู้ใช้`)}};return(0,v.jsxs)(`div`,{className:`module-container animate-fade-in`,children:[(0,v.jsxs)(`div`,{className:`module-title-section`,children:[(0,v.jsx)(`h2`,{children:`ระบบบริหารจัดการสิทธิ์และการเข้าถึง (Module 9)`}),(0,v.jsx)(`p`,{children:`สร้างบัญชีเจ้าหน้าที่ กำหนดการดูแลครุภัณฑ์แยกเฉพาะรายหน่วยงาน และควบคุมความปลอดภัยฐานข้อมูล`})]}),(0,v.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(180px, 1fr))`,gap:`1rem`,marginBottom:`1.5rem`},children:[(0,v.jsxs)(`div`,{className:`stat-card-simple glass-panel`,children:[(0,v.jsx)(`div`,{className:`stat-icon-wrapper`,style:{backgroundColor:`rgba(59, 130, 246, 0.1)`,color:`var(--primary)`},children:(0,v.jsx)(d,{size:20})}),(0,v.jsxs)(`div`,{className:`stat-data`,children:[(0,v.jsx)(`span`,{className:`stat-num`,children:J}),(0,v.jsx)(`span`,{className:`stat-label`,children:`บัญชีทั้งหมด`})]})]}),(0,v.jsxs)(`div`,{className:`stat-card-simple glass-panel`,children:[(0,v.jsx)(`div`,{className:`stat-icon-wrapper`,style:{backgroundColor:`rgba(99, 102, 241, 0.1)`,color:`#6366f1`},children:(0,v.jsx)(p,{size:20})}),(0,v.jsxs)(`div`,{className:`stat-data`,children:[(0,v.jsx)(`span`,{className:`stat-num`,children:Y}),(0,v.jsx)(`span`,{className:`stat-label`,children:`ผู้ดูแลระบบ (Admin)`})]})]}),(0,v.jsxs)(`div`,{className:`stat-card-simple glass-panel`,children:[(0,v.jsx)(`div`,{className:`stat-icon-wrapper`,style:{backgroundColor:`rgba(139, 92, 246, 0.1)`,color:`#8b5cf6`},children:(0,v.jsx)(o,{size:20})}),(0,v.jsxs)(`div`,{className:`stat-data`,children:[(0,v.jsx)(`span`,{className:`stat-num`,children:X}),(0,v.jsx)(`span`,{className:`stat-label`,children:`ผู้จัดการ (Manager)`})]})]}),(0,v.jsxs)(`div`,{className:`stat-card-simple glass-panel`,children:[(0,v.jsx)(`div`,{className:`stat-icon-wrapper`,style:{backgroundColor:`rgba(6, 182, 212, 0.1)`,color:`var(--cyan)`},children:(0,v.jsx)(i,{size:20})}),(0,v.jsxs)(`div`,{className:`stat-data`,children:[(0,v.jsx)(`span`,{className:`stat-num`,children:Z}),(0,v.jsx)(`span`,{className:`stat-label`,children:`ผู้ปฏิบัติงาน (Operator)`})]})]}),(0,v.jsxs)(`div`,{className:`stat-card-simple glass-panel`,children:[(0,v.jsx)(`div`,{className:`stat-icon-wrapper`,style:{backgroundColor:`rgba(239, 68, 68, 0.1)`,color:`var(--danger)`},children:(0,v.jsx)(h,{size:20})}),(0,v.jsxs)(`div`,{className:`stat-data`,children:[(0,v.jsx)(`span`,{className:`stat-num`,children:Q}),(0,v.jsx)(`span`,{className:`stat-label`,children:`โดนระงับสิทธิ์`})]})]})]}),(0,v.jsx)(`div`,{className:`control-bar-panel glass-panel`,style:{marginTop:`1.5rem`,marginBottom:`1.5rem`,padding:`1.25rem`},children:(0,v.jsxs)(`div`,{className:`filter-row flex-row-between gap-md`,style:{flexWrap:`wrap`},children:[(0,v.jsxs)(`div`,{className:`search-box flex-1 min-w-300`,children:[(0,v.jsx)(m,{size:16,className:`search-icon`}),(0,v.jsx)(`input`,{type:`text`,className:`form-input search-input`,placeholder:`ค้นหาชื่อผู้ใช้, ชื่อบัญชี หรือแผนก...`,value:S,onChange:e=>C(e.target.value)})]}),(0,v.jsxs)(`div`,{className:`filter-dropdowns flex-row-end gap-sm`,style:{flexWrap:`wrap`},children:[(0,v.jsxs)(`select`,{className:`form-select select-sm`,value:w,onChange:e=>T(e.target.value),style:{width:`160px`},children:[(0,v.jsx)(`option`,{value:`all`,children:`ระดับสิทธิ์ทั้งหมด`}),(0,v.jsx)(`option`,{value:`admin`,children:`ผู้ดูแล (Admin)`}),(0,v.jsx)(`option`,{value:`manager`,children:`ผู้จัดการ (Manager)`}),(0,v.jsx)(`option`,{value:`user`,children:`ผู้ปฏิบัติงาน (Operator)`})]}),(0,v.jsxs)(`select`,{className:`form-select select-sm`,value:E,onChange:e=>D(e.target.value),style:{width:`140px`},children:[(0,v.jsx)(`option`,{value:`all`,children:`สถานะทั้งหมด`}),(0,v.jsx)(`option`,{value:`active`,children:`ปกติ (Active)`}),(0,v.jsx)(`option`,{value:`blocked`,children:`โดนระงับ (Blocked)`})]}),(0,v.jsxs)(`button`,{className:`btn btn-primary`,onClick:ee,style:{height:`38px`,whiteSpace:`nowrap`},children:[(0,v.jsx)(l,{size:16}),` `,(0,v.jsx)(`span`,{children:`เพิ่มผู้ใช้งานใหม่`})]})]})]})}),(0,v.jsx)(`div`,{className:`users-cards-grid`,children:$.length===0?(0,v.jsxs)(`div`,{className:`survey-wait-card glass-panel`,style:{gridColumn:`1 / -1`,minHeight:`260px`},children:[(0,v.jsx)(d,{size:36,color:`var(--text-muted)`}),(0,v.jsx)(`h3`,{children:`ไม่พบรายชื่อผู้ใช้งาน`}),(0,v.jsx)(`p`,{children:`กรุณาลองปรับเปลี่ยนคำค้นหา หรือระดับสิทธิ์ตัวกรองใหม่อีกครั้ง`})]}):$.map(e=>{let t=e.name.slice(0,2),n=`linear-gradient(135deg, #3b82f6, #6366f1)`;return e.role===`admin`&&(n=`linear-gradient(135deg, #6366f1, #8b5cf6)`),e.role===`manager`&&(n=`linear-gradient(135deg, #8b5cf6, #ec4899)`),e.isBlocked&&(n=`linear-gradient(135deg, #ef4444, #991b1b)`),(0,v.jsxs)(`div`,{className:`user-glass-card glass-panel ${e.isBlocked?`card-blocked-gray`:``}`,children:[(0,v.jsxs)(`div`,{className:`user-card-header`,children:[e.isBlocked?(0,v.jsxs)(`span`,{className:`role-badge badge-red`,children:[(0,v.jsx)(r,{size:12}),` ถูกบล็อก`]}):e.role===`admin`?(0,v.jsxs)(`span`,{className:`role-badge badge-blue`,children:[(0,v.jsx)(p,{size:12}),` ผู้ดูแลระบบ`]}):e.role===`manager`?(0,v.jsxs)(`span`,{className:`role-badge badge-purple`,style:{backgroundColor:`rgba(139, 92, 246, 0.12)`,color:`#8b5cf6`,border:`1px solid rgba(139, 92, 246, 0.2)`},children:[(0,v.jsx)(o,{size:12}),` ผู้จัดการ (Manager)`]}):(0,v.jsxs)(`span`,{className:`role-badge badge-cyan`,children:[(0,v.jsx)(i,{size:12}),` ผู้ปฏิบัติงาน (Operator)`]}),e.id===x?.id&&(0,v.jsx)(`span`,{className:`current-user-tag`,children:`บัญชีของคุณ`})]}),(0,v.jsxs)(`div`,{className:`user-profile-brief`,children:[(0,v.jsx)(`div`,{className:`user-avatar`,style:{background:n},children:t}),(0,v.jsxs)(`div`,{className:`user-info`,children:[(0,v.jsx)(`h4`,{children:e.name}),(0,v.jsxs)(`span`,{className:`username-sub`,children:[`@`,e.username]})]})]}),(0,v.jsxs)(`div`,{className:`user-dept-row`,children:[(0,v.jsx)(i,{size:14,className:`icon-dept`}),(0,v.jsx)(`span`,{className:`dept-text`,children:e.role===`admin`?`ดูแลภาพรวมทุกแผนก (Full)`:e.role===`manager`?`ดูรายงานภาพรวมทุกแผนก (Read-Only)`:e.department||`ไม่ระบุฝ่าย`})]}),(0,v.jsx)(`div`,{className:`user-created-date`,children:(0,v.jsxs)(`span`,{children:[`ลงทะเบียน: `,new Date(e.createdAt).toLocaleDateString(`th-TH`,{day:`numeric`,month:`short`,year:`numeric`})]})}),(0,v.jsxs)(`div`,{className:`user-card-actions`,children:[(0,v.jsxs)(`button`,{className:`btn btn-ghost btn-sm btn-icon-text`,onClick:()=>te(e),title:`แก้ไขข้อมูลโปรไฟล์`,children:[(0,v.jsx)(c,{size:14}),` แก้ไข`]}),(0,v.jsx)(`button`,{className:`btn btn-ghost btn-sm btn-icon-text ${e.isBlocked?`btn-unblock`:`btn-block`}`,onClick:()=>re(e),disabled:e.id===x?.id,title:e.isBlocked?`ปลดบล็อกบัญชี`:`ระงับสิทธิ์การใช้งาน`,children:e.isBlocked?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(f,{size:14,color:`var(--success)`}),` ปลดบล็อก`]}):(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(r,{size:14,color:`var(--danger)`}),` ระงับสิทธิ์`]})}),(0,v.jsxs)(`button`,{className:`btn btn-ghost btn-sm btn-icon-text btn-delete-red`,onClick:()=>ie(e),disabled:e.id===x?.id,title:`ลบบัญชีผู้ใช้งานถาวร`,children:[(0,v.jsx)(u,{size:14}),` ลบ`]})]})]},e.id)})}),O&&(0,v.jsx)(`div`,{className:`modal-backdrop`,children:(0,v.jsxs)(`div`,{className:`modal-content glass-panel animate-scale-up`,style:{maxWidth:`500px`,width:`90%`},children:[(0,v.jsxs)(`div`,{className:`modal-header`,children:[(0,v.jsx)(`h3`,{children:A?`📝 แก้ไขข้อมูลบัญชีผู้ใช้งาน`:`➕ เพิ่มบัญชีผู้ใช้งานใหม่`}),(0,v.jsx)(`button`,{className:`btn btn-ghost btn-icon-only`,onClick:()=>k(!1),children:(0,v.jsx)(s,{size:18})})]}),(0,v.jsxs)(`form`,{onSubmit:ne,className:`modal-form`,children:[(0,v.jsxs)(`div`,{className:`form-group`,children:[(0,v.jsx)(`label`,{className:`form-label`,children:`👤 ชื่อ-นามสกุลจริงเจ้าหน้าที่`}),(0,v.jsx)(`input`,{type:`text`,className:`form-input`,placeholder:`เช่น นายพัสดุ พาสแกน`,value:I,onChange:e=>L(e.target.value),required:!0})]}),(0,v.jsxs)(`div`,{className:`form-group`,children:[(0,v.jsx)(`label`,{className:`form-label`,children:`🏷️ ชื่อผู้ใช้งานในระบบ (Username - ภาษาอังกฤษไม่มีเว้นวรรค)`}),(0,v.jsx)(`input`,{type:`text`,className:`form-input monospace-input`,placeholder:`เช่น pass_scanner`,value:M,onChange:e=>N(e.target.value),disabled:!!A,required:!0})]}),(0,v.jsxs)(`div`,{className:`form-group`,children:[(0,v.jsxs)(`label`,{className:`form-label`,children:[`🔑 `,A?`เปลี่ยนรหัสผ่านใหม่ (ปล่อยว่างหากต้องการใช้รหัสผ่านเดิม)`:`รหัสผ่านเข้าใช้งานเริ่มต้น`]}),(0,v.jsxs)(`div`,{style:{position:`relative`,display:`flex`,alignItems:`center`},children:[(0,v.jsx)(`input`,{type:K?`text`:`password`,className:`form-input`,placeholder:A?`ป้อนรหัสผ่านใหม่...`:`เช่น 123456 (ค่าดีฟอลต์หากว่าง)`,value:P,onChange:e=>F(e.target.value),required:!A,style:{paddingRight:`2.5rem`}}),(0,v.jsx)(`button`,{type:`button`,onClick:()=>q(!K),style:{position:`absolute`,right:`0.75rem`,background:`none`,border:`none`,color:`var(--text-muted)`,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`0.25rem`,height:`auto`},title:K?`ซ่อนรหัสผ่าน`:`แสดงรหัสผ่าน`,children:K?(0,v.jsx)(a,{size:16}):(0,v.jsx)(o,{size:16})})]})]}),(0,v.jsxs)(`div`,{className:`form-group`,children:[(0,v.jsx)(`label`,{className:`form-label`,children:`🛡️ ระดับสิทธิ์ควบคุม (Role)`}),(0,v.jsxs)(`select`,{className:`form-select`,value:R,onChange:e=>z(e.target.value),required:!0,children:[(0,v.jsx)(`option`,{value:`operator`,children:`🔧 4. Operator (เจ้าหน้าที่ปฏิบัติงาน — ลงรายการ/สแกนเฉพาะของตนเอง)`}),(0,v.jsx)(`option`,{value:`head`,children:`👔 3. Head (หัวหน้าฝ่าย/งาน — สิทธิ์เต็มในฝ่าย & จัดการคนในฝ่าย & ปิดรอบฝ่าย)`}),(0,v.jsx)(`option`,{value:`manager`,children:`💼 2. Manager (ผู้บริหาร/ผู้อำนวยการ — ดูได้ทุกฝ่าย & อนุมัติระดับองค์กร)`}),(0,v.jsx)(`option`,{value:`admin`,children:`👑 1. Admin (แอดมินสูงสุด — สิทธิ์เต็มทุกอย่างทั้งองค์กร)`})]})]}),(R===`head`||R===`operator`||R===`user`)&&(0,v.jsxs)(`div`,{className:`form-group animate-fade-in`,children:[(0,v.jsx)(`label`,{className:`form-label`,children:`🏢 ฝ่าย/หน่วยงานที่สังกัด (เพื่อใช้ควบคุมขอบเขตข้อมูล)`}),(0,v.jsx)(`select`,{className:`form-select`,value:B,onChange:e=>V(e.target.value),required:!0,children:e.map(e=>(0,v.jsx)(`option`,{value:e.name,children:e.name},e.id))})]}),W&&(0,v.jsxs)(`div`,{className:`alert alert-danger`,style:{marginTop:`1rem`,padding:`0.75rem`},children:[(0,v.jsx)(h,{size:16}),` `,(0,v.jsx)(`span`,{children:W})]}),(0,v.jsxs)(`div`,{className:`modal-actions`,style:{marginTop:`1.5rem`},children:[(0,v.jsx)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:()=>k(!1),children:`ยกเลิก`}),(0,v.jsx)(`button`,{type:`submit`,className:`btn btn-primary`,disabled:H,children:H?`กำลังบันทึกบัญชี...`:`💾 บันทึกข้อมูลสิทธิ์`})]})]})]})}),(0,v.jsx)(`style`,{children:`
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
      `})]})};export{y as Module9_AccessControl};