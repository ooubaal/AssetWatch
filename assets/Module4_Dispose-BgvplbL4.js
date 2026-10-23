import{r as e}from"./rolldown-runtime-BHe-jwch.js";import{At as t,E as n,F as r,Pt as i,f as a,m as o,x as s}from"./vendor-icons-CAVFr7QK.js";import{n as c}from"./vendor-react-r06hgyff.js";var l=e(i(),1),u=c(),d=({assets:e,audits:i,onUpdateAssetStatus:c,onLogAudit:d,currentUser:f})=>{let[p,m]=(0,l.useState)(``),[h,g]=(0,l.useState)(null),[_,v]=(0,l.useState)(()=>new Date().toISOString().split(`T`)[0]),[y,b]=(0,l.useState)(`ชำรุดเสื่อมสภาพผุพังไม่สามารถใช้งานได้`),[x,S]=(0,l.useState)(``),[C,w]=(0,l.useState)(!1),[T,E]=(0,l.useState)(!1),[D,O]=(0,l.useState)(()=>f?.role===`admin`?`single`:`report`),[k,A]=(0,l.useState)(()=>f?.role===`head`||f?.role===`operator`||f?.role===`user`?f.department:`all`),[j,M]=(0,l.useState)(()=>{let e=new Date;return e.setDate(e.getDate()-30),e.toISOString().split(`T`)[0]}),[N,P]=(0,l.useState)(()=>new Date().toISOString().split(`T`)[0]),[F,I]=(0,l.useState)(!1);(0,l.useEffect)(()=>{(f?.role===`head`||f?.role===`operator`||f?.role===`user`)&&A(f.department)},[f]);let L=e.filter(e=>{let t=e.status!==`รอจำหน่าย`&&e.status!==`อื่นๆ`;return f?.role===`head`||f?.role===`operator`||f?.role===`user`?t&&e.department===f.department:t}).filter(e=>(e.name||``).toLowerCase().includes(p.toLowerCase())||(e.id||``).toLowerCase().includes(p.toLowerCase())),R=e=>{g(e),E(!1)},z=async e=>{if(e.preventDefault(),f?.role!==`admin`){alert(`เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่มีสิทธิ์ตัดจำหน่ายพัสดุ`);return}if(h){w(!0);try{let e=localStorage.getItem(`assetwatch_operator`)||`แอดมินพัสดุ`,t=`ทำแทงจำหน่ายครุภัณฑ์ออกจากทะเบียนพัสดุ เมื่อวันที่ ${_} อ้างอิงเอกสารที่: ${x||`ไม่มี`} เนื่องจาก: ${y}`;await c(h.id,`รอจำหน่าย`),await d({assetId:h.id,assetName:h.name,action:`dispose`,operator:e,details:t}),E(!0)}catch(e){console.error(e),alert(`เกิดข้อผิดพลาดในการทำรายการจำหน่ายครุภัณฑ์`)}finally{w(!1)}}},B=()=>{g(null),S(``),E(!1)},V=e=>{let t=e.match(/อ้างอิงเอกสารที่:\s*([^\s]+)/),n=e.match(/เนื่องจาก:\s*(.+)$/);return{docRef:t?t[1]:`ไม่ระบุ`,reason:n?n[1]:`ชำรุดเสื่อมสภาพ`}},H=i.filter(t=>{if(t.action!==`dispose`)return!1;let n=t.timestamp.split(`T`)[0];if(!(n>=j&&n<=N))return!1;if(k!==`all`){let n=e.find(e=>e.id===t.assetId);if(n){if(n.department!==k)return!1}else if(!t.details.includes(k))return!1}return!0});return(0,u.jsxs)(`div`,{className:`module-container animate-fade-in`,children:[(0,u.jsxs)(`div`,{className:`module-title-section`,children:[(0,u.jsx)(`h2`,{children:`จำหน่ายพัสดุชำรุดออกจากบัญชีคุม (Module 4)`}),(0,u.jsx)(`p`,{children:`บันทึกประวัติการตัดทรัพย์สิน แทงบัญชีจำหน่าย อ้างอิงคำขอและคณะกรรมการพิจารณาเพื่อการตรวจสอบย้อนหลัง`})]}),(0,u.jsxs)(`div`,{className:`sub-tabs-container`,children:[f?.role===`admin`&&(0,u.jsx)(`button`,{type:`button`,className:`sub-tab ${D===`single`?`active`:``}`,onClick:()=>{O(`single`),E(!1),g(null)},children:`✍️ บันทึกตัดจำหน่ายครุภัณฑ์ (Single Disposal)`}),(0,u.jsx)(`button`,{type:`button`,className:`sub-tab ${D===`report`?`active`:``}`,onClick:()=>{O(`report`)},children:`🖨️ ออกรายงานการจำหน่ายพัสดุ (Disposal Report)`})]}),D===`single`?f?.role===`admin`?T&&h?(0,u.jsxs)(`div`,{className:`success-wizard-card glass-panel text-center`,children:[(0,u.jsx)(`div`,{className:`success-checkmark-wrapper`,style:{backgroundColor:`var(--warning-light)`,boxShadow:`0 4px 15px rgba(245,158,11,0.2)`},children:(0,u.jsx)(o,{size:40,color:`var(--warning)`})}),(0,u.jsx)(`h2`,{children:`ตัดบัญชีจำหน่ายพัสดุสำเร็จ!`}),(0,u.jsxs)(`p`,{children:[`ครุภัณฑ์รหัส `,(0,u.jsx)(`code`,{children:h.id}),` ได้รับการลงบันทึก `,(0,u.jsx)(`strong`,{children:`"รอจำหน่าย"`}),` ในประวัติพัสดุอย่างเป็นทางการแล้ว`]}),(0,u.jsxs)(`div`,{className:`success-intake-details`,children:[(0,u.jsxs)(`div`,{className:`intake-detail-line`,children:[(0,u.jsx)(`span`,{children:`ชื่อเครื่องที่จำหน่าย:`}),` `,(0,u.jsx)(`strong`,{children:h.name})]}),(0,u.jsxs)(`div`,{className:`intake-detail-line`,children:[(0,u.jsx)(`span`,{children:`วันที่แทงจำหน่าย:`}),` `,(0,u.jsx)(`span`,{children:_})]}),(0,u.jsxs)(`div`,{className:`intake-detail-line`,children:[(0,u.jsx)(`span`,{children:`เลขที่เอกสารอ้างอิง:`}),` `,(0,u.jsx)(`code`,{children:x||`ไม่ได้ระบุ`})]})]}),(0,u.jsx)(`div`,{className:`success-card-actions`,children:(0,u.jsx)(`button`,{className:`btn btn-primary`,onClick:B,children:`ทำรายการชิ้นอื่นต่อ`})})]}):(0,u.jsxs)(`div`,{className:`survey-layout-grid`,children:[(0,u.jsx)(`div`,{className:`scanner-column`,children:(0,u.jsxs)(`div`,{className:`selection-list-panel glass-panel`,children:[(0,u.jsxs)(`div`,{className:`card-header`,style:{marginBottom:`1rem`,paddingBottom:`0.5rem`},children:[(0,u.jsx)(`h3`,{children:`เลือกครุภัณฑ์ที่ชำรุด/หมดสภาพ`}),(0,u.jsx)(`span`,{className:`card-header-sub`,children:`ค้นหาพัสดุเพื่อกรอกแบบฟอร์มตัดบัญชีจำหน่าย`})]}),(0,u.jsxs)(`div`,{className:`search-box`,style:{marginBottom:`1rem`,minWidth:`100%`},children:[(0,u.jsx)(s,{size:16,className:`search-icon`}),(0,u.jsx)(`input`,{type:`text`,className:`form-input search-input`,placeholder:`ป้อนรหัส หรือ ชื่ออุปกรณ์...`,value:p,onChange:e=>m(e.target.value)})]}),(0,u.jsx)(`div`,{className:`assets-selection-scroll`,children:L.length===0?(0,u.jsx)(`p`,{className:`empty-scroll-text`,children:`ไม่พบรายการครุภัณฑ์ที่เข้าเกณฑ์`}):L.map(e=>(0,u.jsxs)(`button`,{className:`select-asset-row ${h?.id===e.id?`row-selected`:``}`,onClick:()=>R(e),children:[(0,u.jsxs)(`div`,{className:`select-asset-brief`,children:[(0,u.jsx)(`span`,{className:`brief-id`,children:e.id}),(0,u.jsx)(`h4`,{children:e.name}),(0,u.jsxs)(`div`,{className:`brief-meta-line`,children:[(0,u.jsxs)(`span`,{children:[`📍 `,e.location]}),(0,u.jsx)(`span`,{className:`badge ${e.status===`ชำรุด`?`badge-danger`:`badge-muted`}`,children:e.status})]})]}),(0,u.jsx)(t,{size:16,className:`chevron-icon`})]},e.id))})]})}),(0,u.jsx)(`div`,{className:`form-column`,children:h?(0,u.jsxs)(`form`,{onSubmit:z,className:`survey-form-panel glass-panel`,children:[(0,u.jsxs)(`div`,{className:`survey-asset-brief`,children:[(0,u.jsx)(`img`,{src:h.imageUrl,alt:h.name,onError:e=>{let t=e.currentTarget;t.onerror=null,t.src=`https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60`}}),(0,u.jsxs)(`div`,{className:`brief-details`,children:[(0,u.jsx)(`span`,{className:`brief-id`,children:h.id}),(0,u.jsx)(`h3`,{children:h.name}),(0,u.jsxs)(`span`,{children:[`📍 `,h.location]})]})]}),(0,u.jsxs)(`div`,{className:`alert alert-danger`,style:{marginBottom:0,padding:`0.75rem`},children:[(0,u.jsx)(a,{size:18}),(0,u.jsxs)(`span`,{style:{fontSize:`0.8rem`},children:[(0,u.jsx)(`strong`,{children:`คำเตือน:`}),` การจำหน่ายจะทำการโอนทรัพย์สินนี้ไปเก็บอยู่ในประเภท รอจำหน่าย และเปิดเป็น Audit Logs ตลอดชีพ`]})]}),(0,u.jsxs)(`div`,{className:`form-row-double`,children:[(0,u.jsxs)(`div`,{className:`form-group flex-1`,children:[(0,u.jsx)(`label`,{className:`form-label`,children:`📅 วันที่คณะกรรมการอนุมัติจำหน่าย`}),(0,u.jsx)(`input`,{type:`date`,className:`form-input`,value:_,onChange:e=>v(e.target.value),required:!0})]}),(0,u.jsxs)(`div`,{className:`form-group flex-1`,children:[(0,u.jsx)(`label`,{className:`form-label`,children:`🧾 เลขที่เอกสาร/หนังสือนำส่งคำขอ`}),(0,u.jsx)(`input`,{type:`text`,className:`form-input`,placeholder:`เช่น อว 6901/105`,value:x,onChange:e=>S(e.target.value),required:!0})]})]}),(0,u.jsxs)(`div`,{className:`form-group`,children:[(0,u.jsx)(`label`,{className:`form-label`,children:`⚠️ สาเหตุแห่งการจำหน่ายครุภัณฑ์ออกจากทะเบียน`}),(0,u.jsxs)(`select`,{className:`form-select`,value:y,onChange:e=>b(e.target.value),required:!0,children:[(0,u.jsx)(`option`,{value:`ชำรุดเสื่อมสภาพผุพังไม่สามารถใช้งานได้`,children:`ชำรุดเสื่อมสภาพผุพังใช้งานไม่ได้ (ซ่อมไม่คุ้มทุน)`}),(0,u.jsx)(`option`,{value:`สูญหายรอดำเนินการทางละเมิด`,children:`สูญหาย (รอดำเนินการทางละเมิด)`}),(0,u.jsx)(`option`,{value:`หมดความจำเป็น/เก่าล้าสมัยมาก`,children:`เก่าและเทคโนโลยีล้าสมัย (ยกเลิกการใช้งานระบบ)`}),(0,u.jsx)(`option`,{value:`อื่นๆ`,children:`อื่นๆ`})]})]}),(0,u.jsxs)(`div`,{className:`form-actions`,children:[(0,u.jsx)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:()=>g(null),children:`ยกเลิก`}),(0,u.jsx)(`button`,{type:`submit`,className:`btn btn-danger`,disabled:C,children:C?`กำลังประมวลผล...`:`🚨 ยืนยันการตัดจำหน่ายคลัง`})]})]}):(0,u.jsxs)(`div`,{className:`survey-wait-card glass-panel`,style:{minHeight:`380px`},children:[(0,u.jsx)(o,{size:48,color:`var(--text-muted)`}),(0,u.jsx)(`h3`,{children:`ยังไม่ได้เลือกครุภัณฑ์`}),(0,u.jsx)(`p`,{children:`เลือกรายการครุภัณฑ์จากแถบซ้ายมือเพื่อกรอกข้อมูลหนังสือแทงบัญชีจำหน่าย`})]})})]}):(0,u.jsxs)(`div`,{className:`glass-panel text-center`,style:{padding:`3rem 2rem`,maxWidth:`540px`,margin:`2rem auto`},children:[(0,u.jsx)(r,{size:44,color:`var(--danger)`,style:{marginBottom:`1rem`}}),(0,u.jsx)(`h3`,{children:`การเข้าถึงถูกจำกัด (Admin Only)`}),(0,u.jsxs)(`p`,{style:{color:`var(--text-secondary)`,marginTop:`0.75rem`,fontSize:`0.9rem`,lineHeight:1.5},children:[`การแทงจำหน่ายพัสดุสงวนสิทธิ์เฉพาะผู้ดูแลระบบระดับสูง (Admin) เท่านั้น`,(0,u.jsx)(`br`,{}),`หากต้องการส่งพิจารณาจำหน่าย กรุณาเปลี่ยนสถานะพัสดุเป็น `,(0,u.jsx)(`strong`,{children:`"รอจำหน่าย"`}),` ผ่านหน้าสแกนสำรวจ (Module 2) หรือแจ้งซ่อม (Module 10)`]})]}):(0,u.jsxs)(`div`,{className:`report-config-panel intake-form glass-panel animate-fade-in`,style:{padding:`2rem`},children:[(0,u.jsx)(`h3`,{style:{fontSize:`1.15rem`,fontWeight:800,marginBottom:`1rem`,borderBottom:`1px solid var(--border)`,paddingBottom:`0.5rem`},children:`ออกรายงานประวัติครุภัณฑ์จำหน่ายสะสมออกจากคลัง`}),(0,u.jsxs)(`div`,{className:`grid-cols-3`,children:[(0,u.jsxs)(`div`,{className:`form-group`,children:[(0,u.jsxs)(`label`,{className:`form-label`,children:[`🏢 ฝ่าย/หน่วยงานผู้ดูแลเดิม `,f?.role===`user`&&`(ล็อคสิทธิ์ตามสังกัด)`]}),(0,u.jsxs)(`select`,{className:`form-select`,value:k,onChange:e=>A(e.target.value),disabled:f?.role===`head`||f?.role===`operator`||f?.role===`user`,children:[(f?.role===`admin`||f?.role===`manager`)&&(0,u.jsx)(`option`,{value:`all`,children:`ทุกหน่วยงาน`}),f?.role===`user`?(0,u.jsx)(`option`,{value:f.department,children:f.department}):Array.from(new Set(e.map(e=>e.department).filter(Boolean))).map(e=>(0,u.jsx)(`option`,{value:e,children:e},e))]})]}),(0,u.jsxs)(`div`,{className:`form-group`,children:[(0,u.jsx)(`label`,{className:`form-label`,children:`📅 เริ่มต้นตั้งแต่วันที่`}),(0,u.jsx)(`input`,{type:`date`,className:`form-input`,value:j,onChange:e=>M(e.target.value)})]}),(0,u.jsxs)(`div`,{className:`form-group`,children:[(0,u.jsx)(`label`,{className:`form-label`,children:`📅 จนถึงวันที่`}),(0,u.jsx)(`input`,{type:`date`,className:`form-input`,value:N,onChange:e=>P(e.target.value)})]})]}),(0,u.jsx)(`div`,{className:`form-actions`,style:{display:`flex`,justifyContent:`flex-end`,borderTop:`1px solid var(--border)`,paddingTop:`1.5rem`,marginTop:`1rem`},children:(0,u.jsxs)(`button`,{type:`button`,className:`btn btn-primary`,onClick:()=>I(!0),style:{display:`flex`,alignItems:`center`,gap:`0.45rem`},children:[(0,u.jsx)(n,{size:16}),` 🖨️ แสดงตัวอย่างรายงานและจัดพิมพ์`]})})]}),F&&(0,u.jsxs)(`div`,{className:`print-preview-overlay animate-fade-in`,style:{position:`fixed`,top:0,left:0,width:`100%`,height:`100%`,background:`rgba(0,0,0,0.85)`,zIndex:9999,overflowY:`auto`,display:`flex`,flexDirection:`column`,padding:`2rem 1rem`},children:[(0,u.jsxs)(`div`,{className:`print-actions-bar glass-panel`,style:{maxWidth:`800px`,width:`100%`,margin:`0 auto 1.5rem auto`,padding:`1rem`,display:`flex`,justifyContent:`space-between`,alignItems:`center`,zIndex:1e4},children:[(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`h4`,{style:{fontWeight:800,color:`var(--primary)`},children:`🖨️ ตัวอย่างก่อนพิมพ์รายงานจำหน่ายพัสดุชำรุด (A4 Preview)`}),(0,u.jsx)(`p`,{style:{fontSize:`0.75rem`,color:`var(--text-secondary)`},children:`รายงานบัญชีจำหน่ายพัสดุจัดรูปแบบสำหรับพิมพ์ลงกระดาษ A4`})]}),(0,u.jsxs)(`div`,{style:{display:`flex`,gap:`0.5rem`},children:[(0,u.jsx)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:()=>I(!1),children:`ย้อนกลับ`}),(0,u.jsxs)(`button`,{type:`button`,className:`btn btn-primary`,onClick:()=>window.print(),style:{display:`flex`,alignItems:`center`,gap:`0.4rem`},children:[(0,u.jsx)(n,{size:16}),` สั่งพิมพ์ / PDF`]})]})]}),(0,u.jsxs)(`div`,{className:`print-paper-a4 printable-a4-document`,style:{background:`#ffffff`,color:`#000000`,maxWidth:`800px`,width:`100%`,margin:`0 auto`,padding:`2.5rem 3rem`,minHeight:`11.28in`,boxShadow:`0 10px 30px rgba(0,0,0,0.5)`,fontFamily:`'Sarabun', 'Noto Sans Thai', sans-serif`,fontSize:`13px`,lineHeight:`1.6`,colorScheme:`light`,borderRadius:`4px`},children:[(0,u.jsxs)(`div`,{style:{textAlign:`center`,position:`relative`,marginBottom:`2.5rem`},children:[(0,u.jsx)(`div`,{style:{fontSize:`28px`,color:`#000000`,marginBottom:`0.5rem`},children:`🇹🇭`}),(0,u.jsx)(`h1`,{style:{fontSize:`1.65rem`,fontWeight:800,color:`#000000`,margin:`0.2rem 0`},children:`รายงานบัญชีครุภัณฑ์และพัสดุที่ชำรุดตัดจำหน่ายคลัง`}),(0,u.jsxs)(`h2`,{style:{fontSize:`1.1rem`,fontWeight:700,color:`#333333`,margin:`0.2rem 0`},children:[`ประจำวันที่ `,new Date(j).toLocaleDateString(`th-TH`),` ถึงวันที่ `,new Date(N).toLocaleDateString(`th-TH`)]}),k!==`all`&&(0,u.jsxs)(`div`,{style:{fontSize:`1rem`,fontWeight:600,marginTop:`0.25rem`},children:[`หน่วยงาน/ฝ่าย: `,k]}),(0,u.jsx)(`div`,{style:{fontSize:`0.85rem`,color:`#666666`,marginTop:`0.5rem`},children:`ระบบคลังข้อมูลครุภัณฑ์ AssetWatch`})]}),(0,u.jsx)(`hr`,{style:{border:`0`,borderTop:`2px double #333333`,margin:`1rem 0 1.5rem 0`}}),(0,u.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`1rem`,marginBottom:`1.5rem`,background:`#f8f9fa`,padding:`1rem`,border:`1px solid #dddddd`,borderRadius:`4px`},children:[(0,u.jsxs)(`div`,{children:[(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`strong`,{children:`👤 ผู้ออกรายงาน:`}),` `,f?.name||`ไม่ได้ระบุ`]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`strong`,{children:`🏢 บทบาทหน้าที่:`}),` `,f?.role===`admin`?`แอดมินสูงสุด`:f?.role===`manager`?`ผู้จัดการ`:`ผู้ปฏิบัติงาน`]})]}),(0,u.jsxs)(`div`,{style:{borderLeft:`1px solid #dddddd`,paddingLeft:`1rem`},children:[(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`strong`,{children:`📦 ครุภัณฑ์ที่จำหน่ายจำแนกได้:`}),` `,H.length,` รายการ`]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`strong`,{children:`📅 วันเวลาที่ออกเอกสาร:`}),` `,new Date().toLocaleDateString(`th-TH`),` `,new Date().toLocaleTimeString(`th-TH`),` น.`]})]})]}),(0,u.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,marginBottom:`2rem`,fontSize:`12px`},children:[(0,u.jsx)(`thead`,{children:(0,u.jsxs)(`tr`,{style:{background:`#f2f2f2`,borderBottom:`1.5px solid #000000`,borderTop:`1px solid #dddddd`},children:[(0,u.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`center`,border:`1px solid #dddddd`,width:`40px`},children:`ลำดับ`}),(0,u.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`,width:`90px`},children:`วันที่จำหน่าย`}),(0,u.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`,width:`110px`},children:`รหัสครุภัณฑ์`}),(0,u.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`},children:`ชื่อรายการครุภัณฑ์`}),(0,u.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`,width:`100px`},children:`ฝ่ายที่ดูแลเดิม`}),(0,u.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`,width:`100px`},children:`เลขที่หนังสืออนุมัติ`}),(0,u.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`,width:`150px`},children:`สาเหตุ/เหตุผลการจำหน่าย`})]})}),(0,u.jsx)(`tbody`,{children:H.length===0?(0,u.jsx)(`tr`,{children:(0,u.jsx)(`td`,{colSpan:7,style:{padding:`1.5rem`,textAlign:`center`,border:`1px solid #dddddd`,color:`#666666`},children:`ไม่พบประวัติพัสดุชำรุดตัดบัญชีจำหน่ายในช่วงเวลาหรือหน่วยงานที่เลือก`})}):H.map((t,n)=>{let{docRef:r,reason:i}=V(t.details),a=e.find(e=>e.id===t.assetId)?.department||t.details.match(/ฝ่าย:\s*([^\s]+)/)?.[1]||`ไม่ระบุ`;return(0,u.jsxs)(`tr`,{style:{borderBottom:`1px solid #dddddd`},children:[(0,u.jsx)(`td`,{style:{padding:`0.5rem`,textAlign:`center`,border:`1px solid #dddddd`},children:n+1}),(0,u.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`},children:new Date(t.timestamp).toLocaleDateString(`th-TH`)}),(0,u.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`,fontFamily:`monospace`,fontWeight:`bold`},children:t.assetId}),(0,u.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`},children:t.assetName}),(0,u.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`},children:a}),(0,u.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`},children:r}),(0,u.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`},children:i})]},t.id)})})]}),(0,u.jsxs)(`div`,{style:{marginTop:`5rem`,display:`flex`,justifyContent:`space-between`},children:[(0,u.jsxs)(`div`,{style:{textAlign:`center`,width:`280px`},children:[(0,u.jsx)(`div`,{style:{marginBottom:`3.5rem`},children:`ลงชื่อ.................................................................. ผู้รายงาน`}),(0,u.jsxs)(`div`,{children:[`( `,f?.name||`..............................................`,` )`]}),(0,u.jsx)(`div`,{style:{fontSize:`0.85rem`,color:`#666666`,marginTop:`0.35rem`},children:`ตำแหน่ง: เจ้าหน้าที่ทะเบียนพัสดุ`})]}),(0,u.jsxs)(`div`,{style:{textAlign:`center`,width:`280px`},children:[(0,u.jsx)(`div`,{style:{marginBottom:`3.5rem`},children:`ลงชื่อ.................................................................. ผู้อนุมัติจำหน่าย`}),(0,u.jsx)(`div`,{children:`( .............................................................. )`}),(0,u.jsx)(`div`,{style:{fontSize:`0.85rem`,color:`#666666`,marginTop:`0.35rem`},children:`ตำแหน่ง: คณะกรรมการ/ผู้มีอำนาจลงนาม`})]})]})]})]}),(0,u.jsx)(`style`,{children:`
        /* Sub-tabs premium styles */
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
        .report-config-panel {
          max-width: 800px;
          margin: 0 auto;
        }

        .selection-list-panel {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          max-height: 480px;
        }

        .assets-selection-scroll {
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-right: 0.25rem;
        }

        .select-asset-row {
          width: 100%;
          text-align: left;
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .select-asset-row:hover {
          border-color: var(--primary);
          background-color: var(--bg-secondary);
        }

        .row-selected {
          border-color: var(--primary);
          background-color: var(--primary-light);
        }

        .select-asset-brief h4 {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0.1rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        .brief-meta-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .chevron-icon {
          color: var(--text-muted);
        }

        .empty-scroll-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
          padding: 2rem 0;
        }

        @media (max-width: 768px) {
          .assets-selection-scroll {
            max-height: 250px;
          }
        }
      `})]})};export{d as Module4_Dispose};