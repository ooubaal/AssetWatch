import{r as e}from"./rolldown-runtime-BHe-jwch.js";import{G as t,Lt as n,Nt as r,x as i,y as a}from"./vendor-icons-BvpqiY4w.js";import{n as o}from"./vendor-react-BSpb0AAM.js";var s=e(n(),1),c=o(),l=({audits:e})=>{let[n,o]=(0,s.useState)(``),[l,u]=(0,s.useState)(``),d=e.filter(e=>{if(!e)return!1;let t=n.toLowerCase().trim(),r=!t||(e.operator||``).toLowerCase().includes(t)||(e.assetName||``).toLowerCase().includes(t)||(e.assetId||``).toLowerCase().includes(t)||(e.details||``).toLowerCase().includes(t),i=l?e.action===l:!0;return r&&i}),f={create:`ขึ้นทะเบียนใหม่`,edit:`แก้ไขฐานข้อมูล`,dispose:`จำหน่ายคลัง`,transfer:`โอนย้ายสถานที่`,repair_open:`เปิดแจ้งซ่อม`,repair_send:`นำส่งช่างซ่อม`,repair_receive:`ตรวจรับซ่อมคืน`,survey:`แสกนตรวจนับ`},p={create:`badge-success`,edit:`badge-primary`,dispose:`badge-danger`,transfer:`badge-info`,repair_open:`badge-danger`,repair_send:`badge-warning`,repair_receive:`badge-success`,survey:`badge-success`},m={name:`ชื่อครุภัณฑ์`,location:`สถานที่ติดตั้ง`,department:`หน่วยงานผู้ดูแล`,responsiblePerson:`ผู้ดูแลรักษาสิ่งของ`,status:`สถานะพัสดุ`,note:`หมายเหตุ`,source:`แหล่งงบประมาณ/สัญญา`,receivedDate:`วันที่จัดซื้อจัดจ้าง`,imageUrl:`ภาพถ่ายครุภัณฑ์`};return(0,c.jsxs)(`div`,{className:`module-container animate-fade-in`,children:[(0,c.jsxs)(`div`,{className:`module-title-section`,children:[(0,c.jsx)(`h2`,{children:`บันทึกประวัติการใช้ความโปร่งใส (Audit Trails - Module 6)`}),(0,c.jsx)(`p`,{children:`ประวัติกิจกรรมแบบย้อนกลับไม่ได้ (Immutable timeline) ตรวจสอบการทุจริต การโยกย้ายพัสดุ และบันทึกประวัติการจำหน่าย`})]}),(0,c.jsxs)(`div`,{className:`filter-panel glass-panel`,children:[(0,c.jsxs)(`div`,{className:`search-box`,children:[(0,c.jsx)(i,{size:18,className:`search-icon`}),(0,c.jsx)(`input`,{type:`text`,placeholder:`สืบค้นประวัติด้วยชื่อพนักงาน, รหัสครุภัณฑ์ หรือ คำอธิบาย...`,className:`form-input search-input`,value:n,onChange:e=>o(e.target.value)})]}),(0,c.jsx)(`div`,{className:`filter-dropdowns`,children:(0,c.jsxs)(`div`,{className:`filter-item`,children:[(0,c.jsx)(t,{size:14}),(0,c.jsxs)(`select`,{className:`form-select filter-select`,value:l,onChange:e=>u(e.target.value),style:{minWidth:`180px`},children:[(0,c.jsx)(`option`,{value:``,children:`ทุกประเภทการบันทึก`}),(0,c.jsx)(`option`,{value:`create`,children:`ขึ้นทะเบียนใหม่ (Create)`}),(0,c.jsx)(`option`,{value:`edit`,children:`แก้ไขข้อมูล (Edit)`}),(0,c.jsx)(`option`,{value:`survey`,children:`แสกนตรวจนับ (Survey)`}),(0,c.jsx)(`option`,{value:`transfer`,children:`โอนย้ายฝ่าย (Transfer)`}),(0,c.jsx)(`option`,{value:`dispose`,children:`ตัดจำหน่ายออกจากบัญชี (Dispose)`}),(0,c.jsx)(`option`,{value:`repair_open`,children:`แจ้งชำรุด (Repair Opened)`}),(0,c.jsx)(`option`,{value:`repair_receive`,children:`รับกลับคืนคลัง (Repair Closed)`})]})]})})]}),d.length===0?(0,c.jsxs)(`div`,{className:`empty-results glass-panel`,children:[(0,c.jsx)(a,{size:40,color:`var(--text-muted)`}),(0,c.jsx)(`h3`,{children:`ไม่พบข้อมูลประวัติบันทึกการกระทำที่ค้นหา`}),(0,c.jsx)(`p`,{children:`ลองขยายขอบเขตการค้นหาหรือนำตัวกรองประเภทการดำเนินการออก`})]}):(0,c.jsx)(`div`,{className:`table-container glass-panel`,children:(0,c.jsxs)(`table`,{className:`custom-table`,children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`th`,{style:{width:`170px`},children:`วันเวลาที่ดำเนินการ`}),(0,c.jsx)(`th`,{style:{width:`130px`},children:`ประเภทการทำ`}),(0,c.jsx)(`th`,{children:`ข้อมูลพัสดุ`}),(0,c.jsx)(`th`,{children:`รายละเอียดของรายการ`}),(0,c.jsx)(`th`,{style:{width:`140px`},children:`ผู้ทำรายการ`})]})}),(0,c.jsx)(`tbody`,{children:d.map(e=>(0,c.jsxs)(`tr`,{className:`audit-table-row animate-fade-in`,children:[(0,c.jsx)(`td`,{children:(0,c.jsxs)(`div`,{className:`audit-date-cell`,children:[(0,c.jsx)(`strong`,{children:new Date(e.timestamp).toLocaleDateString(`th-TH`)}),(0,c.jsx)(`span`,{children:new Date(e.timestamp).toLocaleTimeString(`th-TH`)})]})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(`span`,{className:`badge ${p[e.action]||`badge-muted`}`,children:f[e.action]||e.action})}),(0,c.jsx)(`td`,{children:(0,c.jsxs)(`div`,{className:`board-asset-cell`,children:[(0,c.jsx)(`strong`,{children:e.assetName}),(0,c.jsxs)(`span`,{children:[`รหัส: `,(0,c.jsx)(`code`,{children:e.assetId})]})]})}),(0,c.jsx)(`td`,{children:(0,c.jsxs)(`div`,{className:`audit-details-cell`,children:[(0,c.jsx)(`p`,{children:e.details}),e.changes&&Object.keys(e.changes).length>0&&(0,c.jsx)(`div`,{className:`audit-diff-box`,children:Object.keys(e.changes).map(t=>{let n=e.changes?.[t];return(0,c.jsxs)(`div`,{className:`diff-item-line`,children:[(0,c.jsxs)(`strong`,{children:[m[t]||t,`:`]}),(0,c.jsx)(`span`,{className:`diff-old`,children:String(n?.old??`ไม่มี`)}),(0,c.jsx)(r,{size:12,style:{margin:`0 0.25rem`,color:`var(--text-muted)`}}),(0,c.jsx)(`span`,{className:`diff-new`,children:String(n?.new??`ไม่มี`)})]},t)})})]})}),(0,c.jsx)(`td`,{children:(0,c.jsxs)(`div`,{className:`audit-operator-cell`,children:[`👤 `,e.operator]})})]},e.id))})]})}),(0,c.jsx)(`style`,{children:`
        .audit-date-cell {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .audit-date-cell span {
          font-size: 0.725rem;
          color: var(--text-muted);
          font-weight: 550;
        }

        .audit-details-cell {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .audit-diff-box {
          margin-top: 0.5rem;
          padding: 0.65rem 0.85rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.775rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .diff-item-line {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }

        .diff-item-line strong {
          color: var(--text-secondary);
          margin-right: 0.5rem;
        }

        .diff-old {
          color: var(--danger);
          text-decoration: line-through;
          background-color: var(--danger-light);
          padding: 0.05rem 0.25rem;
          border-radius: 2px;
        }

        .diff-new {
          color: var(--success);
          font-weight: 600;
          background-color: var(--success-light);
          padding: 0.05rem 0.25rem;
          border-radius: 2px;
        }

        .audit-operator-cell {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .audit-table-row:hover td {
          background-color: rgba(0, 0, 0, 0.005);
        }
      `})]})};export{l as Module6_AuditTrail};