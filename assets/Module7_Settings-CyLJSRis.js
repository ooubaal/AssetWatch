import{r as e}from"./rolldown-runtime-BHe-jwch.js";import{$ as t,I as n,It as r,J as i,K as a,Mt as o,Q as s,Tt as c,b as l,d as u,dt as d,et as f,i as p,lt as ee,m,rt as te,vt as ne}from"./vendor-icons-BqLhoM6m.js";import{n as h,t as re}from"./vendor-react-dDs_0d6G.js";import{a as g,b as ie,c as ae,o as _,y as oe}from"./index-CaW_WifV.js";var v=e(r(),1),y=h(),b=({onClearConfig:e,onImportSuccess:r,assets:h,audits:b,repairs:x,surveys:S,rounds:se,departments:ce,users:C,currentUser:w})=>{let[T,E]=(0,v.useState)(`config`),[D,O]=(0,v.useState)(!1),[k,A]=(0,v.useState)(!1),[j,M]=(0,v.useState)(null),[N,P]=(0,v.useState)(null),[F,I]=(0,v.useState)(null),[L,R]=(0,v.useState)(!1),[z,le]=(0,v.useState)(localStorage.getItem(`assetwatch_hide_demo_bypass`)===`true`),[ue,de]=(0,v.useState)(localStorage.getItem(`assetwatch_force_base64_images`)!==`false`),B=(0,v.useRef)(null),[V,H]=(0,v.useState)(null),[fe,U]=(0,v.useState)(!1),[pe,W]=(0,v.useState)(!1),[G,K]=(0,v.useState)(``),[q,J]=(0,v.useState)(!1),[Y,X]=(0,v.useState)(``);(0,v.useEffect)(()=>{U(!0),fetch(`https://api.github.com/repos/ooubaal/AssetWatch`).then(e=>{if(!e.ok)throw Error(`Not found or private repository`);return e.json()}).then(e=>{e&&typeof e.size==`number`&&H(e.size)}).catch(e=>{console.error(`Failed to fetch GitHub repo size:`,e),H(480)}).finally(()=>U(!1))},[]);let Z=()=>{try{let e=JSON.stringify({assets:h,audits:b,repairs:x,surveys:S,rounds:se,departments:ce,users:C});return new Blob([e]).size}catch{return 0}},Q=ie(),me=e=>{localStorage.setItem(`assetwatch_hide_demo_bypass`,e?`true`:`false`),le(e)},he=e=>{localStorage.setItem(`assetwatch_force_base64_images`,e?`true`:`false`),de(e)},ge=()=>{Q&&(navigator.clipboard.writeText(JSON.stringify(Q,null,2)),O(!0),setTimeout(()=>O(!1),2e3))},_e=()=>{window.confirm(`คุณต้องการตัดการเชื่อมต่อกับ Firebase Cloud หรือไม่? (ข้อมูลที่เซฟในระบบเดโมออฟไลน์จะไม่ได้รับผลกระทบ)`)&&(oe(),e())},ve=async()=>{try{let e=await g(),t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`AssetWatch_Backup_${new Date().toISOString().split(`T`)[0]}.json`,document.body.appendChild(r),r.click(),document.body.removeChild(r)}catch{alert(`เกิดข้อผิดพลาดในการส่งออกไฟล์แบคอัพ`)}},ye=()=>{B.current&&B.current.click()},be=async e=>{if(e.target.files&&e.target.files[0]){let t=e.target.files[0];R(!0),M(null),I(null);let n=t.size>1024*1024?`${(t.size/(1024*1024)).toFixed(1)} MB`:`${(t.size/1024).toFixed(0)} KB`,r=new FileReader;r.onload=async e=>{R(!1);let r=e.target?.result;try{let e=JSON.parse(r);if(!e.assets||!Array.isArray(e.assets)){M({success:!1,message:`ไฟล์ที่เลือกไม่ใช่ไฟล์สำรองข้อมูลที่ถูกต้องของระบบ AssetWatch (ไม่พบโครงสร้างข้อมูลครุภัณฑ์)`}),P(null);return}let i=e.assets?.length||0,a=e.surveys?.length||0,o=e.repairs?.length||0,s=e.audits?.length||0,c=e.departments?.length||0,l=e.users?.length||0,u=e.rounds?.length||0,d=i+a+o+s+c+l+u;P({fileName:t.name,fileSizeFormatted:n,jsonText:r,counts:{assets:i,surveys:a,repairs:o,audits:s,departments:c,users:l,rounds:u,total:d}})}catch(e){M({success:!1,message:`ไฟล์ JSON เสียหายหรือไม่ถูกต้อง: ${e.message}`}),P(null)}},r.onerror=()=>{R(!1),M({success:!1,message:`เกิดข้อผิดพลาดในการอ่านไฟล์จากอุปกรณ์`}),P(null)},r.readAsText(t)}},xe=async()=>{if(N){A(!0),M(null),I({current:0,total:N.counts.total,percent:0,currentStep:`เริ่มต้นการกู้คืนข้อมูล...`,detail:`กำลังเตรียมนำเข้า ${N.counts.total.toLocaleString()} รายการ`});try{let e=await ae(N.jsonText,e=>{I(e)});M(e),e.success&&(r(),setTimeout(()=>{P(null),I(null)},1500))}catch(e){M({success:!1,message:`การกู้คืนข้อมูลล้มเหลว: ${e.message}`})}finally{A(!1),B.current&&(B.current.value=``)}}},$=()=>{P(null),M(null),I(null),B.current&&(B.current.value=``)};return(0,y.jsxs)(`div`,{className:`module-container animate-fade-in`,children:[(0,y.jsxs)(`div`,{className:`module-title-section`,children:[(0,y.jsx)(`h2`,{children:`แผงตั้งค่า แบคอัพข้อมูล และคู่มือโปรแกรม (Module 7)`}),(0,y.jsx)(`p`,{children:`ตั้งค่าคลาวด์แชร์ทีมงาน สำรอง/กู้คืนฐานข้อมูลครุภัณฑ์ และคู่มือการใช้งานระบบสำหรับฝ่ายพัสดุ`})]}),(0,y.jsxs)(`div`,{className:`settings-layout`,children:[(0,y.jsxs)(`aside`,{className:`settings-sidebar glass-panel`,children:[(0,y.jsxs)(`button`,{className:`settings-tab-btn ${T===`config`?`active-sub-tab`:``}`,onClick:()=>E(`config`),children:[(0,y.jsx)(l,{size:18}),` ตั้งค่าฐานข้อมูลคลาวด์`]}),(0,y.jsxs)(`button`,{className:`settings-tab-btn ${T===`backup`?`active-sub-tab`:``}`,onClick:()=>E(`backup`),children:[(0,y.jsx)(t,{size:18}),` สำรอง & กู้คืนข้อมูล (Backup)`]}),(0,y.jsxs)(`button`,{className:`settings-tab-btn ${T===`guide`?`active-sub-tab`:``}`,onClick:()=>E(`guide`),children:[(0,y.jsx)(c,{size:18}),` คู่มือการใช้งานระบบ`]})]}),(0,y.jsxs)(`main`,{className:`settings-content-pane glass-panel`,children:[T===`config`&&(0,y.jsxs)(`div`,{className:`setting-view-box animate-fade-in`,children:[(0,y.jsxs)(`div`,{className:`card-header`,style:{marginBottom:`1.5rem`,paddingBottom:`0.5rem`},children:[(0,y.jsx)(`h3`,{children:`ตั้งค่าคลาวด์ออนไลน์ (Firebase Config)`}),(0,y.jsx)(`span`,{className:`card-header-sub`,children:`แชร์การเข้าถึงเชื่อมต่อในโครงการเดียวกับทีมงานของคุณ`})]}),Q?(0,y.jsx)(`div`,{className:`configured-box`,children:(0,y.jsxs)(`div`,{className:`config-grid-layout`,children:[(0,y.jsxs)(`div`,{className:`config-share-qr-card`,children:[(0,y.jsx)(`div`,{className:`qr-box-outline`,children:(0,y.jsx)(re,{value:JSON.stringify(Q),size:180,level:`L`})}),(0,y.jsx)(`h4`,{children:`QR Code สิทธิ์เข้าถึงฐานข้อมูล`}),(0,y.jsx)(`p`,{children:`ให้เพื่อนร่วมงานเปิดเว็บโปรแกรมผ่านมือถือ กด "เข้าร่วมผ่าน QR Code" แล้วสแกนหน้านี้เพื่อเชื่อมต่อทันที`}),(0,y.jsx)(`div`,{className:`qr-action-buttons`,children:(0,y.jsxs)(`button`,{className:`btn btn-secondary btn-xs`,onClick:ge,children:[D?(0,y.jsx)(ne,{size:12,color:`var(--success)`}):(0,y.jsx)(f,{size:12}),D?` คัดลอกแล้ว`:` คัดลอกข้อมูล Config`]})})]}),(0,y.jsxs)(`div`,{className:`config-data-details`,children:[(0,y.jsx)(`h4`,{className:`section-small-title`,children:`📍 พารามิเตอร์การเชื่อมต่อปัจจุบัน`}),(0,y.jsxs)(`div`,{className:`meta-info-list`,children:[(0,y.jsxs)(`div`,{className:`meta-line`,children:[(0,y.jsx)(`span`,{children:`Project ID:`}),` `,(0,y.jsx)(`code`,{children:Q.projectId})]}),(0,y.jsxs)(`div`,{className:`meta-line`,children:[(0,y.jsx)(`span`,{children:`Auth Domain:`}),` `,(0,y.jsx)(`code`,{children:Q.authDomain})]}),(0,y.jsxs)(`div`,{className:`meta-line`,children:[(0,y.jsx)(`span`,{children:`Storage Bucket:`}),` `,(0,y.jsx)(`code`,{children:Q.storageBucket})]}),(0,y.jsxs)(`div`,{className:`meta-line`,children:[(0,y.jsx)(`span`,{children:`API Key:`}),` `,(0,y.jsxs)(`code`,{children:[Q.apiKey.substring(0,10),`...`]})]})]}),(0,y.jsxs)(`div`,{className:`standalone-production-settings-box`,style:{padding:`1.25rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius-md)`,backgroundColor:`rgba(59, 130, 246, 0.03)`,marginTop:`1rem`},children:[(0,y.jsx)(`h4`,{style:{fontSize:`0.875rem`,fontWeight:750,color:`var(--primary)`,marginBottom:`0.35rem`,display:`flex`,alignItems:`center`,gap:`0.35rem`},children:`⚡ โหมดใช้งานรูปถ่ายฟรี 100% (Free Cloud Photo Mode)`}),(0,y.jsxs)(`p`,{style:{fontSize:`0.75rem`,color:`var(--text-secondary)`,lineHeight:1.4,marginBottom:`0.85rem`},children:[`หากคุณใช้งานโปรเจกต์คลาวด์ฟรีและไม่ได้อัปเกรดแผนกชำระเงิน (Blaze Plan) การถ่ายรูปพัสดุจะค้างและช้ามาก ให้เปิดระบบนี้เพื่อ`,(0,y.jsx)(`strong`,{children:`บังคับข้าม Firebase Storage`}),` และสลับมาใช้ระบบแปลงรูปภาพแบบ Base64 ซึ่งทำงานเสร็จใน 0.1 วินาที และบันทึกผ่านฐานข้อมูลออนไลน์ฟรีทันที!`]}),(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`0.6rem 0.85rem`,backgroundColor:`var(--bg-secondary)`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`},children:[(0,y.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:650,color:`var(--text-primary)`},children:`🚀 บังคับข้ามคลาวด์ Storage (Base64 Fast Mode)`}),(0,y.jsx)(`input`,{type:`checkbox`,id:`force-base64-toggle`,checked:ue,onChange:e=>he(e.target.checked),style:{cursor:`pointer`,width:`18px`,height:`18px`}})]})]}),w?.role===`admin`&&(0,y.jsxs)(`div`,{className:`danger-zone-settings`,children:[(0,y.jsx)(`h4`,{children:`🚨 พื้นที่อันตราย (Danger Zone)`}),(0,y.jsx)(`p`,{children:`การตัดการเชื่อมต่อจะยุติการอ่านข้อมูลออนไลน์ และให้คุณสลับไปเปลี่ยน Firebase Project อื่นหรือสลับไปทดสอบออฟไลน์`}),(0,y.jsxs)(`button`,{className:`btn btn-danger btn-sm`,onClick:_e,style:{marginTop:`0.75rem`},children:[(0,y.jsx)(m,{size:14}),` ตัดการเชื่อมต่อฐานข้อมูลคลาวด์นี้`]})]})]})]})}):(0,y.jsxs)(y.Fragment,{children:[(0,y.jsxs)(`div`,{className:`no-config-warning-box`,children:[(0,y.jsx)(te,{size:36,color:`var(--warning)`}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`h4`,{children:`ปัจจุบันระบบกำลังทำงานบน "โหมดตัวอย่างออฟไลน์" (Demo Mode)`}),(0,y.jsx)(`p`,{children:`ข้อมูลทั้งหมดถูกบันทึกชั่วคราวอยู่ในเว็บบราวเซอร์ของคุณ (LocalStorage) หากปิดบราวเซอร์หรือล้างคุ้กกี้ข้อมูลจะหายไป เพื่อการใช้งานจริงร่วมกันหลายคน โปรดกดติดตั้ง Firebase`})]}),w?.role===`admin`&&(0,y.jsx)(`button`,{className:`btn btn-warning btn-sm`,onClick:e,style:{marginLeft:`auto`,flexShrink:0},children:`ตั้งค่าเชื่อมต่อคลาวด์`})]}),(0,y.jsxs)(`div`,{className:`standalone-production-settings-box glass-panel`,style:{marginTop:`1.5rem`,padding:`1.5rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius-md)`},children:[(0,y.jsx)(`h4`,{style:{fontSize:`0.95rem`,fontWeight:750,color:`var(--primary)`,marginBottom:`0.5rem`,display:`flex`,alignItems:`center`,gap:`0.5rem`},children:`⚙️ โหมดใช้งานจริงแบบเก็บข้อมูลในเครื่อง (Standalone Production Settings)`}),(0,y.jsxs)(`p`,{style:{fontSize:`0.825rem`,color:`var(--text-secondary)`,lineHeight:1.45,marginBottom:`1.25rem`},children:[`หากคุณต้องการนำระบบนี้ไปใช้งานจริงในแบบ `,(0,y.jsx)(`strong`,{children:`Standalone (บันทึกข้อมูลแบบออฟไลน์ในเครื่องนี้เครื่องเดียวอย่างปลอดภัย)`}),` คุณสามารถสั่งซ่อนปุ่มบัญชีทดสอบด่วน (Demo Bypass) ที่หน้าแรกได้ เพื่อความปลอดภัยและให้หน้าจอลงชื่อเข้าใช้งานมีความเป็นทางการ`]}),(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`0.85rem 1.25rem`,backgroundColor:`var(--bg-secondary)`,borderRadius:`var(--radius-md)`,border:`1px solid var(--border)`},children:[(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`span`,{style:{fontSize:`0.875rem`,fontWeight:650,display:`block`,color:`var(--text-primary)`},children:`🔒 ซ่อนปุ่มบัญชีทดสอบด่วนบนหน้าแรก (Hide Demo Bypass Buttons)`}),(0,y.jsx)(`span`,{style:{fontSize:`0.75rem`,color:`var(--text-muted)`},children:`เมื่อเปิดใช้งาน จะต้องป้อนชื่อผู้ใช้งานและรหัสผ่านจริงเท่านั้นเพื่อเข้าระบบ`})]}),(0,y.jsx)(`div`,{className:`toggle-switch-wrapper`,children:(0,y.jsx)(`input`,{type:`checkbox`,id:`hide-demo-toggle`,checked:z,onChange:e=>me(e.target.checked),style:{cursor:`pointer`,width:`20px`,height:`20px`}})})]}),z&&(0,y.jsxs)(`div`,{className:`alert alert-info animate-fade-in`,style:{marginTop:`1.25rem`,fontSize:`0.8rem`,padding:`1rem`,backgroundColor:`var(--primary-light)`,border:`1px solid var(--primary)`,borderRadius:`var(--radius-md)`,display:`block`},children:[(0,y.jsx)(`span`,{style:{display:`block`,fontWeight:750,color:`var(--primary)`,marginBottom:`0.5rem`},children:`💡 ข้อมูลการล็อคอินเริ่มต้นหลังจากซ่อนปุ่มเดโม:`}),(0,y.jsx)(`span`,{style:{display:`block`,color:`var(--text-secondary)`,marginBottom:`0.5rem`},children:`คุณยังคงสามารถล็อคอินเข้าสู่ระบบด้วยบัญชีผู้ใช้เริ่มต้นที่มีอยู่ในระบบได้ดังนี้:`}),(0,y.jsxs)(`ul`,{style:{paddingLeft:`1.25rem`,margin:`0.5rem 0`,listStyleType:`disc`,color:`var(--text-secondary)`,display:`flex`,flexDirection:`column`,gap:`0.25rem`},children:[(0,y.jsxs)(`li`,{children:[`👑 `,(0,y.jsx)(`strong`,{children:`สิทธิ์แอดมินสูงสุด (Admin):`}),` ชื่อผู้ใช้ `,(0,y.jsx)(`code`,{children:`admin`}),` | รหัสผ่าน `,(0,y.jsx)(`code`,{children:`admin`}),` (จัดการระบบและสิทธิ์ผู้ใช้อื่น)`]}),(0,y.jsxs)(`li`,{children:[`💻 `,(0,y.jsx)(`strong`,{children:`สิทธิ์ฝ่ายเทคโนโลยี (IT User):`}),` ชื่อผู้ใช้ `,(0,y.jsx)(`code`,{children:`it_user`}),` | รหัสผ่าน `,(0,y.jsx)(`code`,{children:`123`}),` (จัดการครุภัณฑ์แผนก IT)`]}),(0,y.jsxs)(`li`,{children:[`💼 `,(0,y.jsx)(`strong`,{children:`สิทธิ์ฝ่ายบริหารทั่วไป (General Admin):`}),` ชื่อผู้ใช้ `,(0,y.jsx)(`code`,{children:`admin_general`}),` | รหัสผ่าน `,(0,y.jsx)(`code`,{children:`123`}),` (จัดการครุภัณฑ์แผนกบริหาร)`]})]}),(0,y.jsxs)(`span`,{style:{display:`block`,color:`var(--text-muted)`,fontSize:`0.75rem`,marginTop:`0.5rem`},children:[`*คุณสามารถเพิ่มบัญชี ลบรหัส หรือเปลี่ยนเป็นชื่อและรหัสผ่านจริงของคุณเองได้ตลอดเวลาใน `,(0,y.jsx)(`strong`,{children:`"โมดูล 9: สิทธิ์และการเข้าถึง"`})]})]})]})]}),(0,y.jsxs)(`div`,{className:`capacity-dashboard-box glass-panel`,style:{marginTop:`2rem`,padding:`1.5rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius-md)`,backgroundColor:`var(--bg-secondary)`},children:[(0,y.jsx)(`h4`,{style:{fontSize:`1rem`,fontWeight:750,color:`var(--text-primary)`,marginBottom:`1rem`,display:`flex`,alignItems:`center`,gap:`0.5rem`,borderBottom:`1px solid var(--border)`,paddingBottom:`0.5rem`},children:`📊 สถิติความจุและคลังเก็บข้อมูล (Storage & Repository Capacity)`}),(0,y.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(280px, 1fr))`,gap:`1.5rem`},children:[(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.75rem`},children:[(0,y.jsxs)(`span`,{style:{fontSize:`0.85rem`,fontWeight:700,color:`var(--primary)`,display:`flex`,alignItems:`center`,gap:`0.35rem`},children:[(0,y.jsx)(t,{size:16}),` ฐานข้อมูล `,Q?`Cloud Firestore`:`LocalStorage (บราวเซอร์)`]}),(0,y.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,fontSize:`0.75rem`,color:`var(--text-secondary)`},children:[(0,y.jsx)(`span`,{children:`ปริมาณการใช้งานปัจจุบัน:`}),(0,y.jsxs)(`strong`,{style:{color:`var(--text-primary)`},children:[(Z()/1024).toFixed(2),` KB / `,Q?`1,048,576 KB (1 GB)`:`5,120 KB (5 MB)`]})]}),(0,y.jsx)(`div`,{style:{width:`100%`,height:`8px`,backgroundColor:`var(--border)`,borderRadius:`999px`,overflow:`hidden`},children:(0,y.jsx)(`div`,{style:{width:`${Math.min(100,Z()/(Q?1024*1024*1024:5*1024*1024)*100)}%`,height:`100%`,backgroundColor:`var(--primary)`,borderRadius:`999px`,transition:`width 0.5s ease-in-out`}})}),(0,y.jsx)(`div`,{style:{fontSize:`0.7rem`,color:`var(--text-muted)`,lineHeight:`1.4`},children:Q?(0,y.jsx)(`span`,{children:`*คำนวณจากปริมาณตัวอักษรของข้อมูลพัสดุและไฟล์รูปภาพ Base64 ทั้งหมด โดยอิงตามข้อจำกัดโควตาฟรี (Free Tier 1GB) ของ Google Cloud Firestore`}):(0,y.jsx)(`span`,{children:`*ข้อมูลกำลังบันทึกเก็บไว้ใน LocalStorage ของเว็บบราวเซอร์นี้ ซึ่งมีขีดจำกัดมาตรฐานของบราวเซอร์อยู่ที่ประมาณ 5MB`})}),(0,y.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(2, 1fr)`,gap:`0.35rem`,marginTop:`0.5rem`,padding:`0.5rem`,backgroundColor:`var(--bg-primary)`,borderRadius:`var(--radius-sm)`,border:`1px dashed var(--border)`},children:[(0,y.jsxs)(`div`,{style:{fontSize:`0.725rem`,color:`var(--text-secondary)`},children:[`📦 พัสดุ: `,(0,y.jsx)(`strong`,{children:h.length}),` รายการ`]}),(0,y.jsxs)(`div`,{style:{fontSize:`0.725rem`,color:`var(--text-secondary)`},children:[`📝 บันทึกตรวจ: `,(0,y.jsx)(`strong`,{children:S.length}),` รายการ`]}),(0,y.jsxs)(`div`,{style:{fontSize:`0.725rem`,color:`var(--text-secondary)`},children:[`🔧 แจ้งซ่อม: `,(0,y.jsx)(`strong`,{children:x.length}),` เคส`]}),(0,y.jsxs)(`div`,{style:{fontSize:`0.725rem`,color:`var(--text-secondary)`},children:[`👤 ผู้ใช้: `,(0,y.jsx)(`strong`,{children:C.length}),` บัญชี`]})]})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.75rem`},children:[(0,y.jsxs)(`span`,{style:{fontSize:`0.85rem`,fontWeight:700,color:`var(--success)`,display:`flex`,alignItems:`center`,gap:`0.35rem`},children:[(0,y.jsx)(i,{size:16}),` พื้นที่จัดเก็บบน GitHub Repository`]}),(0,y.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,fontSize:`0.75rem`,color:`var(--text-secondary)`},children:[(0,y.jsx)(`span`,{children:`ขนาดโปรเจกต์ (Code & Assets):`}),(0,y.jsxs)(`strong`,{style:{color:`var(--text-primary)`},children:[fe?`กำลังคำนวณ...`:V?`${V.toLocaleString()} KB`:`480 KB`,`/ 1,048,576 KB (1 GB)`]})]}),(0,y.jsx)(`div`,{style:{width:`100%`,height:`8px`,backgroundColor:`var(--border)`,borderRadius:`999px`,overflow:`hidden`},children:(0,y.jsx)(`div`,{style:{width:`${Math.min(100,(V||480)/(1024*1024)*100)}%`,height:`100%`,backgroundColor:`var(--success)`,borderRadius:`999px`,transition:`width 0.5s ease-in-out`}})}),(0,y.jsxs)(`div`,{style:{fontSize:`0.7rem`,color:`var(--text-muted)`,lineHeight:`1.4`},children:[`*ดึงข้อมูลขนาดเนื้อที่โดยตรงจาก GitHub API สำหรับโปรเจกต์ `,(0,y.jsx)(`code`,{children:`ooubaal/AssetWatch`}),` (ขีดจำกัดแนะนำคือ 1GB ต่อ Repository)`]}),(0,y.jsx)(`div`,{style:{marginTop:`auto`,paddingTop:`0.5rem`},children:(0,y.jsxs)(`a`,{href:`https://github.com/ooubaal/AssetWatch`,target:`_blank`,rel:`noreferrer`,style:{fontSize:`0.75rem`,color:`var(--success)`,fontWeight:650,display:`flex`,alignItems:`center`,gap:`0.25rem`,textDecoration:`underline`},children:[`🌐 ไปที่หน้าคลัง GitHub Repository ของคุณ `,(0,y.jsx)(o,{size:12})]})})]})]})]})]}),T===`backup`&&(0,y.jsxs)(`div`,{className:`setting-view-box animate-fade-in`,children:[(0,y.jsxs)(`div`,{className:`card-header`,style:{marginBottom:`1.5rem`,paddingBottom:`0.5rem`},children:[(0,y.jsx)(`h3`,{children:`สำรองและกู้คืนฐานข้อมูลครุภัณฑ์ (Backup & Restore)`}),(0,y.jsx)(`span`,{className:`card-header-sub`,children:`ส่งออกข้อมูลเก็บไว้ในเครื่องคอมพิวเตอร์ของคุณเพื่อความปลอดภัยสูงสุด`})]}),(0,y.jsxs)(`div`,{className:`backup-actions-grid`,children:[(0,y.jsxs)(`div`,{className:`backup-action-card`,children:[(0,y.jsx)(s,{size:32,color:`var(--primary)`}),(0,y.jsx)(`h4`,{children:`สำรองข้อมูลระบบ (Export JSON Backup)`}),(0,y.jsx)(`p`,{children:`ดาวน์โหลดไฟล์ข้อมูลพัสดุ ประวัติกิจกรรม เคสแจ้งซ่อม และผลการสแกนทั้งหมดเก็บไว้ในเครื่องอย่างปลอดภัย`}),(0,y.jsxs)(`button`,{className:`btn btn-primary w-full`,onClick:ve,style:{marginTop:`auto`},children:[(0,y.jsx)(s,{size:14}),` ส่งออกข้อมูลแบคอัพทั้งหมด`]})]}),(0,y.jsxs)(`div`,{className:`backup-action-card`,style:{display:`flex`,flexDirection:`column`},children:[(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.75rem`,marginBottom:`0.75rem`},children:[(0,y.jsx)(`div`,{style:{width:`42px`,height:`42px`,borderRadius:`var(--radius-md)`,backgroundColor:`var(--success-light)`,display:`flex`,alignItems:`center`,justifyContent:`center`,flexShrink:0},children:(0,y.jsx)(u,{size:24,color:`var(--success)`})}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`h4`,{style:{margin:0,fontSize:`1.05rem`,fontWeight:700},children:`กู้คืนระบบจากไฟล์แบคอัพ (Import Restore)`}),(0,y.jsx)(`span`,{style:{fontSize:`0.8rem`,color:`var(--text-muted)`},children:`นำเข้าไฟล์ JSON เพื่อกู้คืนฐานข้อมูลครุภัณฑ์และผลการสำรวจ`})]})]}),(0,y.jsx)(`p`,{style:{fontSize:`0.825rem`,color:`var(--text-secondary)`,marginBottom:`0.75rem`},children:`อัปโหลดไฟล์สำรองข้อมูล JSON กลับเข้าสู่ระบบ ระบบจะกู้คืนข้อมูลครุภัณฑ์ ผลการสำรวจ และข้อมูลการตั้งค่าเดิมของคุณอย่างครบถ้วน`}),w?.role===`admin`?(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(`input`,{type:`file`,ref:B,accept:`.json`,onChange:be,style:{display:`none`}}),L&&(0,y.jsxs)(`div`,{style:{padding:`1.25rem`,borderRadius:`var(--radius-md)`,backgroundColor:`var(--bg-tertiary)`,textAlign:`center`,margin:`0.75rem 0`},children:[(0,y.jsx)(n,{className:`animate-spin`,size:24,color:`var(--primary)`,style:{margin:`0 auto 0.5rem`}}),(0,y.jsx)(`div`,{style:{fontSize:`0.875rem`,fontWeight:650},children:`กำลังโหลดและตรวจสอบไฟล์...`})]}),N&&!L&&(0,y.jsxs)(`div`,{className:`staged-restore-box animate-fade-in`,style:{margin:`0.5rem 0 1rem`,padding:`1rem`,borderRadius:`var(--radius-md)`,border:`1.5px solid rgba(16, 185, 129, 0.35)`,backgroundColor:`rgba(16, 185, 129, 0.04)`},children:[(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`flex-start`,justifyContent:`space-between`,gap:`0.5rem`,marginBottom:`0.75rem`},children:[(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,minWidth:0},children:[(0,y.jsx)(a,{size:20,color:`var(--success)`,style:{flexShrink:0}}),(0,y.jsxs)(`div`,{style:{minWidth:0},children:[(0,y.jsx)(`div`,{style:{fontSize:`0.875rem`,fontWeight:700,color:`var(--text-primary)`,wordBreak:`break-all`},children:N.fileName}),(0,y.jsxs)(`div`,{style:{fontSize:`0.75rem`,color:`var(--text-muted)`},children:[`ขนาดไฟล์: `,N.fileSizeFormatted]})]})]}),!k&&(0,y.jsx)(`button`,{onClick:$,title:`ยกเลิก / เลือกไฟล์ใหม่`,style:{background:`none`,border:`none`,cursor:`pointer`,color:`var(--text-muted)`,padding:`0.2rem`,borderRadius:`var(--radius-sm)`},children:(0,y.jsx)(p,{size:16})})]}),(0,y.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(2, 1fr)`,gap:`0.4rem`,fontSize:`0.775rem`,backgroundColor:`var(--bg-secondary)`,padding:`0.65rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`,marginBottom:`0.85rem`},children:[(0,y.jsxs)(`div`,{children:[`📦 ครุภัณฑ์: `,(0,y.jsx)(`strong`,{style:{color:`var(--primary)`},children:N.counts.assets.toLocaleString()}),` รายการ`]}),(0,y.jsxs)(`div`,{children:[`📸 ผลสำรวจ: `,(0,y.jsx)(`strong`,{style:{color:`var(--success)`},children:N.counts.surveys.toLocaleString()}),` รายการ`]}),(0,y.jsxs)(`div`,{children:[`🔧 เคสซ่อม: `,(0,y.jsx)(`strong`,{children:N.counts.repairs.toLocaleString()}),` รายการ`]}),(0,y.jsxs)(`div`,{children:[`🏢 หน่วยงาน: `,(0,y.jsx)(`strong`,{children:N.counts.departments}),` แห่ง`]}),(0,y.jsxs)(`div`,{style:{gridColumn:`span 2`,borderTop:`1px dashed var(--border)`,paddingTop:`0.35rem`,marginTop:`0.15rem`},children:[`รวมข้อมูลที่จะกู้คืน: `,(0,y.jsx)(`strong`,{style:{color:`var(--text-primary)`},children:N.counts.total.toLocaleString()}),` รายการ`]})]}),k&&(0,y.jsxs)(`div`,{className:`restore-progress-section animate-fade-in`,style:{marginBottom:`0.85rem`},children:[(0,y.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`0.45rem`},children:[(0,y.jsxs)(`span`,{style:{fontSize:`0.825rem`,fontWeight:650,color:`var(--primary)`,display:`flex`,alignItems:`center`,gap:`0.4rem`},children:[(0,y.jsx)(n,{className:`animate-spin`,size:15}),F?.currentStep||`กำลังกู้คืนข้อมูล...`]}),(0,y.jsxs)(`span`,{style:{fontSize:`1.25rem`,fontWeight:800,color:`var(--success)`,letterSpacing:`-0.5px`},children:[F?.percent||0,`%`]})]}),(0,y.jsx)(`div`,{style:{width:`100%`,height:`14px`,backgroundColor:`var(--border)`,borderRadius:`999px`,overflow:`hidden`,boxShadow:`inset 0 1px 3px rgba(0,0,0,0.1)`},children:(0,y.jsx)(`div`,{className:`restore-progress-bar-fill`,style:{width:`${F?.percent||0}%`,height:`100%`,transition:`width 0.25s cubic-bezier(0.4, 0, 0.2, 1)`}})}),(0,y.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginTop:`0.4rem`,fontSize:`0.725rem`,color:`var(--text-muted)`},children:[(0,y.jsx)(`span`,{children:F?.detail||`${F?.current||0} / ${F?.total||0} รายการ`}),(0,y.jsx)(`span`,{style:{color:`var(--primary)`,fontWeight:600},children:`⏳ กำลังดำเนินการ กรุณารอสักครู่...`})]})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,gap:`0.5rem`,marginTop:`0.25rem`},children:[(0,y.jsx)(`button`,{className:`btn btn-success`,onClick:xe,disabled:k,style:{flex:1,fontWeight:700,fontSize:`0.875rem`,padding:`0.65rem 1rem`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`0.5rem`},children:k?(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(n,{className:`animate-spin`,size:16}),`กำลังกู้คืนข้อมูล (`,F?.percent||0,`%)...`]}):(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(u,{size:16}),`กู้คืนข้อมูลเข้าสู่ระบบทันที`]})}),!k&&(0,y.jsx)(`button`,{className:`btn btn-muted`,onClick:$,style:{padding:`0.65rem 0.85rem`},children:`ยกเลิก`})]})]}),!N&&!L&&(0,y.jsxs)(`button`,{className:`btn btn-success w-full`,onClick:ye,disabled:k,style:{marginTop:`auto`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`0.5rem`,fontWeight:650},children:[(0,y.jsx)(u,{size:16}),` เลือกไฟล์แบคอัพ JSON เพื่อกู้คืน`]})]}):(0,y.jsx)(`button`,{className:`btn btn-muted w-full`,disabled:!0,style:{marginTop:`auto`,cursor:`not-allowed`,opacity:.6},children:`🔒 สงวนสิทธิ์สำหรับผู้ดูแลระบบ (Admin)`})]})]}),w?.role===`admin`?(0,y.jsxs)(`div`,{className:`factory-reset-section glass-panel`,style:{marginTop:`2rem`,padding:`1.5rem`,border:`1px solid var(--danger)`,borderRadius:`var(--radius-md)`,backgroundColor:`rgba(239, 68, 68, 0.02)`},children:[(0,y.jsxs)(`h4`,{style:{fontSize:`1rem`,fontWeight:750,color:`var(--danger)`,marginBottom:`0.5rem`,display:`flex`,alignItems:`center`,gap:`0.5rem`},children:[(0,y.jsx)(m,{size:18}),` 🚨 รีเซ็ตระบบทั้งหมดเป็นค่าเริ่มต้น (Factory Reset)`]}),(0,y.jsx)(`p`,{style:{fontSize:`0.825rem`,color:`var(--text-secondary)`,lineHeight:1.45,marginBottom:`1rem`},children:`การรีเซ็ตระบบจะทำการลบข้อมูลครุภัณฑ์พัสดุ เคสส่งซ่อม ประวัติการสำรวจ และข้อมูลการตั้งค่าทั้งหมดออกจากระบบอย่างถาวร (ทั้งบนคลาวด์และหน่วยความจำเครื่อง) และย้อนกลับไปใช้ค่าเริ่มต้นจากโรงงาน`}),(0,y.jsxs)(`div`,{className:`alert alert-warning`,style:{display:`flex`,alignItems:`flex-start`,gap:`0.5rem`,padding:`0.85rem`,backgroundColor:`rgba(245, 158, 11, 0.08)`,border:`1px solid var(--warning)`,borderRadius:`var(--radius-sm)`,marginBottom:`1.25rem`,fontSize:`0.8rem`,color:`var(--warning-dark)`},children:[(0,y.jsx)(d,{size:16,style:{flexShrink:0,marginTop:`0.1rem`}}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`strong`,{children:`คำเตือนสำคัญ:`}),` เพื่อความปลอดภัย กรุณากดปุ่ม `,(0,y.jsx)(`strong`,{children:`"ส่งออกข้อมูลแบคอัพทั้งหมด"`}),` ด้านบนเพื่อสำรองข้อมูลเก็บไว้เป็นไฟล์สำรองก่อนทำการรีเซ็ตทุกครั้ง`]})]}),(0,y.jsxs)(`button`,{className:`btn btn-danger`,onClick:()=>{K(``),X(``),W(!0)},style:{fontWeight:650},children:[(0,y.jsx)(m,{size:14}),` ล้างข้อมูลและรีเซ็ตระบบทั้งหมด (Factory Reset)`]})]}):(0,y.jsxs)(`div`,{className:`factory-reset-section glass-panel`,style:{marginTop:`2rem`,padding:`1.5rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius-md)`,backgroundColor:`var(--bg-secondary)`,opacity:.8},children:[(0,y.jsxs)(`h4`,{style:{fontSize:`1rem`,fontWeight:750,color:`var(--text-muted)`,marginBottom:`0.5rem`,display:`flex`,alignItems:`center`,gap:`0.5rem`},children:[(0,y.jsx)(m,{size:18}),` 🔒 รีเซ็ตระบบทั้งหมดเป็นค่าเริ่มต้น (Factory Reset)`]}),(0,y.jsx)(`p`,{style:{fontSize:`0.825rem`,color:`var(--text-muted)`,lineHeight:1.45,marginBottom:0},children:`ฟังก์ชันรีเซ็ตระบบทั้งหมดถูกจำกัดสิทธิ์ไว้สำหรับผู้ดูแลระบบสูงสุด (Admin) เท่านั้น บัญชีระดับสิทธิ์ของคุณไม่สามารถดำเนินการนี้ได้`})]}),j&&(0,y.jsxs)(`div`,{className:`alert ${j.success?`alert-success`:`alert-danger`} animate-fade-in`,style:{marginTop:`1.5rem`},children:[j.success?(0,y.jsx)(ee,{size:20}):(0,y.jsx)(d,{size:20}),(0,y.jsx)(`span`,{children:j.message})]})]}),T===`guide`&&(0,y.jsxs)(`div`,{className:`setting-view-box animate-fade-in user-guide-panel`,children:[(0,y.jsxs)(`div`,{className:`card-header`,style:{marginBottom:`1.5rem`,paddingBottom:`0.5rem`},children:[(0,y.jsx)(`h3`,{children:`คู่มือการใช้งานระบบ AssetWatch (User Manual v2.0)`}),(0,y.jsx)(`span`,{className:`card-header-sub`,children:`คำแนะนำและคู่มือการปฏิบัติงานฉบับสมบูรณ์สำหรับเจ้าหน้าที่พัสดุ ผู้ตรวจนับ และผู้ดูแลระบบ`})]}),(0,y.jsxs)(`div`,{className:`guide-section`,children:[(0,y.jsx)(`h4`,{children:`1. 📸 วิธีสแกนสำรวจตรวจนับครุภัณฑ์ (โมดูล 2: Scan Survey)`}),(0,y.jsxs)(`div`,{className:`guide-steps-list`,children:[(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`1`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`เปิดกล้องสแกน`}),`: ใช้งานผ่านมือถือหรือแท็บเล็ต อนุญาตการเข้าถึงกล้อง แล้วส่องไปที่ **QR Code** หรือ **บาร์โค้ด** บนตัวครุภัณฑ์ ระบบจะดึงข้อมูลพัสดุขึ้นมาแสดงผลทันที`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`2`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`เลือกห้องที่ตั้งพัสดุ (Searchable Room)`}),`: มีช่องค้นหาห้องที่ตั้ง สามารถพิมพ์ค้นหาชื่อห้อง เช่น `,(0,y.jsx)(`em`,{children:`"BR 46"`}),` หรือ `,(0,y.jsx)(`em`,{children:`"ห้องหัวหน้า"`}),` ได้สะดวกรวดเร็ว`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`3`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ระบุสถานะและถ่ายรูป`}),`: ตรวจสอบสถานะ (ใช้งานได้, ชำรุด, รอจำหน่าย ฯลฯ) ซึ่งมีแถบสีเน้นข้อความชัดเจน สามารถกดถ่ายภาพสภาพจริงของครุภัณฑ์เพื่อแนบเป็นหลักฐานการสำรวจได้`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`4`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ตรวจสอบรายการ "ตรวจแล้ว" (เรียงล่าสุด)`}),`: สลับไปที่แถบ `,(0,y.jsx)(`strong`,{children:`"ตรวจแล้ว"`}),` เพื่อดูรายการที่สำรวจไปแล้ว โดยมีตัวเลือกจัดเรียงแบบ `,(0,y.jsx)(`strong`,{children:`"เรียงล่าสุด (Recently Scanned)"`}),` เพื่อให้รายการที่เพิ่งสแกนเสร็จแสดงอยู่บนสุดเสมอ`]})]})]})]}),(0,y.jsxs)(`div`,{className:`guide-section`,children:[(0,y.jsx)(`h4`,{children:`2. ➕ วิธีลงทะเบียนทรัพย์สินใหม่และพิมพ์ฉลาก (โมดูล 3: Add Asset)`}),(0,y.jsxs)(`div`,{className:`guide-steps-list`,children:[(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`1`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ลงทะเบียนครุภัณฑ์เดี่ยว`}),`: กรอกรหัสครุภัณฑ์, ชื่อพัสดุ, หมายเลขซีเรียล (S/N), หมวดหมู่, หน่วยงาน/ห้อง และแนบรูปภาพ จากนั้นกดบันทึกเข้าสู่ฐานข้อมูล`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`2`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`นำเข้าแบบกลุ่มจาก Excel`}),`: สลับไปที่แท็บ `,(0,y.jsx)(`strong`,{children:`"นำเข้าจากไฟล์ Excel"`}),` ดาวน์โหลดเทมเพลต กรอกข้อมูลแล้วอัปโหลดเข้าระบบพร้อมกันหลายร้อยรายการได้ในคลิกเดียว`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`3`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`พิมพ์ฉลากบาร์โค้ด / QR Code`}),`: ไปที่หน้ารายละเอียดครุภัณฑ์ในโมดูล 1 หรือ 3 เพื่อกดสั่งพิมพ์สติกเกอร์บาร์โค้ดนำไปติดบนตัวพัสดุ`]})]})]})]}),(0,y.jsxs)(`div`,{className:`guide-section`,children:[(0,y.jsx)(`h4`,{children:`3. 🔧 การแจ้งซ่อมและงานบำรุงรักษาเชิงป้องกัน (โมดูล 10: Maintenance & PM)`}),(0,y.jsxs)(`div`,{className:`guide-steps-list`,children:[(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`1`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`เปิดเคสแจ้งชำรุด`}),`: ค้นหาพัสดุที่เสีย ระบุอาการขัดข้อง ถ่ายรูปแนบ และระบุระดับความเร่งด่วนเพื่อส่งเรื่องเข้าสู่กระบวนการซ่อมแซม`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`2`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ติดตามสถานะงานซ่อม`}),`: อัปเดตสถานะ เช่น ส่งช่างซ่อมภายนอก, รออะไหล่ พร้อมแนบใบรับเครื่องหรือใบเสนอราคา`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`3`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ตรวจรับเครื่องคืน`}),`: เมื่อซ่อมเสร็จ ให้กดตรวจรับคืน ระบุค่าใช้จ่าย และถ่ายรูปสภาพพร้อมใช้งาน ระบบจะปรับสถานะครุภัณฑ์กลับเป็น "ใช้งานได้" ให้อัตโนมัติ`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`4`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`แผนบำรุงรักษา PM & อะไหล่ (โมดูล 10 & 12)`}),`: จัดทำสัญญาบำรุงรักษา วางรอบตรวจเช็ค PM ล่วงหน้า โดยระบบจะแจ้งเตือนอัตโนมัติเมื่อใกล้ถึงกำหนดตรวจเช็ค และสามารถบันทึกเบิกจ่ายอะไหล่สำรองได้ในคลังอะไหล่`]})]})]})]}),(0,y.jsxs)(`div`,{className:`guide-section`,children:[(0,y.jsx)(`h4`,{children:`4. 💾 การสำรองและกู้คืนฐานข้อมูล (โมดูล 7: Backup & Restore)`}),(0,y.jsxs)(`div`,{className:`guide-steps-list`,children:[(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`1`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`สำรองข้อมูล (Export JSON Backup)`}),`: ไปที่แท็บ `,(0,y.jsx)(`strong`,{children:`"สำรอง & กู้คืน"`}),` แล้วกด `,(0,y.jsx)(`strong`,{children:`"ส่งออกข้อมูลแบคอัพทั้งหมด"`}),` เพื่อดาวน์โหลดไฟล์สำรอง `,(0,y.jsx)(`code`,{children:`.json`}),` เก็บไว้ในคอมพิวเตอร์อย่างปลอดภัย`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`2`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`เลือกไฟล์กู้คืน (Staged Preview)`}),`: กด `,(0,y.jsx)(`strong`,{children:`"เลือกไฟล์แบคอัพ JSON เพื่อกู้คืน"`}),` ระบบจะตรวจสอบโครงสร้างไฟล์และแสดงยอดสรุปจำนวนครุภัณฑ์, ผลการสำรวจ, เคสซ่อม ฯลฯ ให้ตรวจสอบความถูกต้องก่อนเริ่มกู้คืน`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`3`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`แถบเปอร์เซ็นต์ความคืบหน้า (Progress Bar)`}),`: เมื่อกด `,(0,y.jsx)(`strong`,{children:`"กู้คืนข้อมูลเข้าสู่ระบบทันที"`}),` หน้าจอจะแสดงแถบเปอร์เซ็นต์ (0% - 100%) พร้อมชื่อขั้นตอนและจำนวนรายการที่กำลังนำเข้าแบบ Real-time จนเสร็จสมบูรณ์`]})]})]})]}),(0,y.jsxs)(`div`,{className:`guide-section`,children:[(0,y.jsx)(`h4`,{children:`5. ⚡ การประหยัดโควตาคลาวด์และระบบแจ้งเตือน (Cloud Quota & Offline Sync)`}),(0,y.jsxs)(`div`,{className:`guide-steps-list`,children:[(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`1`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`เทคโนโลยี Smart Delta Sync`}),`: ระบบจะอ่านเฉพาะข้อมูลที่ถูกแก้ไขใหม่บนคลาวด์เท่านั้น ทำให้การเปิดโปรแกรมในแต่ละวันกินโควตา Read เพียง `,(0,y.jsx)(`strong`,{children:`~45 – 80 ครั้ง`}),` (จากโควตาฟรีวันละ 50,000 ครั้ง)`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`2`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`การค้นหาและกรองข้อมูลไม่เสียโควตา`}),`: การพิมพ์ค้นหาชื่อ, กรองห้อง, ดูรายละเอียด หรือพิมพ์สติกเกอร์ ทำงานบนหน่วยความจำของเครื่อง (0 Read / 0 Write)`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`3`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ระบบแจ้งเตือนเมื่อโควตาคลาวด์เต็ม (Quota Sentinel)`}),`: หากโควตาคลาวด์ Firebase เต็ม ระบบจะแสดงป้ายเตือนสีส้มด้านบนพร้อมคำแนะนำที่เข้าใจง่าย โดยผู้ใช้ยังคงทำงานและสำรวจต่อผ่านหน่วยความจำของเครื่องได้โดยข้อมูลไม่สูญหาย`]})]})]})]}),(0,y.jsxs)(`div`,{className:`guide-section`,style:{borderBottom:`none`},children:[(0,y.jsx)(`h4`,{children:`6. 🛡️ ความปลอดภัยของระบบและการแบ่งสิทธิ์ (Security & Access Control)`}),(0,y.jsxs)(`div`,{className:`guide-steps-list`,children:[(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`1`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ระดับสิทธิ์ 3 ระดับ (RBAC)`}),`:`,(0,y.jsx)(`br`,{}),`• `,(0,y.jsx)(`strong`,{children:`Admin (ผู้ดูแลระบบ)`}),`: มีสิทธิ์สูงสุด จัดการระบบ กู้คืนข้อมูล นำเข้าไฟล์ และตัดจำหน่ายพัสดุ`,(0,y.jsx)(`br`,{}),`• `,(0,y.jsx)(`strong`,{children:`Manager (ผู้บริหาร)`}),`: ดูรายงาน สถิติ ผลการสำรวจ และข้อมูลพัสดุทุกแผนกแบบอ่านอย่างเดียว (Read-Only)`,(0,y.jsx)(`br`,{}),`• `,(0,y.jsx)(`strong`,{children:`Operator (เจ้าหน้าที่สำรวจ)`}),`: สแกนสำรวจ ตรวจนับ บันทึกรูปถ่าย และแจ้งซ่อมพัสดุในแผนกที่รับผิดชอบ`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`2`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ความปลอดภัยของข้อมูล`}),`: ข้อมูลและภาพถ่ายส่งผ่านระบบความปลอดภัย HTTPS เสมอ และไม่มีการบันทึกข้อมูลครุภัณฑ์หรือรหัสผ่านไว้บน GitHub ข้อมูลทั้งหมดจะถูกเก็บอยู่ใน Firebase Cloud และคอมพิวเตอร์ของคุณเท่านั้น`]})]})]})]})]})]})]}),pe&&(0,y.jsx)(`div`,{className:`modal-backdrop`,style:{zIndex:99999},children:(0,y.jsxs)(`div`,{className:`modal-content glass-panel animate-scale-up`,style:{maxWidth:`480px`,width:`90%`,padding:`1.75rem`},children:[(0,y.jsxs)(`div`,{className:`modal-header`,style:{marginBottom:`1.25rem`,paddingBottom:`0.75rem`,borderBottom:`1px solid var(--border)`},children:[(0,y.jsxs)(`h3`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,color:`var(--danger)`,fontSize:`1.15rem`,fontWeight:800},children:[(0,y.jsx)(m,{size:20}),` ยืนยันการรีเซ็ตระบบทั้งหมด`]}),(0,y.jsx)(`button`,{className:`btn btn-ghost btn-icon-only`,onClick:()=>W(!1),disabled:q,children:(0,y.jsx)(p,{size:18})})]}),(0,y.jsxs)(`div`,{className:`modal-body`,style:{display:`flex`,flexDirection:`column`,gap:`1rem`},children:[(0,y.jsx)(`p`,{style:{fontSize:`0.875rem`,color:`var(--text-primary)`,lineHeight:1.5},children:`คุณกำลังจะทำการรีเซ็ตข้อมูลครุภัณฑ์พัสดุ เคสแจ้งซ่อม และผลการสำรวจสภาพทั้งหมดในระบบให้ย้อนกลับเป็นค่าเริ่มต้นจากโรงงาน (Factory Reset)`}),(0,y.jsxs)(`div`,{className:`alert alert-danger`,style:{display:`flex`,alignItems:`flex-start`,gap:`0.5rem`,padding:`0.85rem`,backgroundColor:`rgba(239, 68, 68, 0.08)`,border:`1px solid var(--danger)`,borderRadius:`var(--radius-sm)`,fontSize:`0.775rem`,color:`#dc2626`},children:[(0,y.jsx)(d,{size:16,style:{flexShrink:0,marginTop:`0.1rem`}}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`strong`,{children:`⚠️ คำเตือน:`}),` ข้อมูลทั้งหมดที่ถูกลบไปแล้วจะไม่สามารถกู้คืนกลับมาได้อีก โปรดตรวจสอบให้แน่ใจว่าคุณได้สำรองข้อมูล (Backup) เรียบร้อยแล้วก่อนทำการรีเซ็ต`]})]}),(0,y.jsxs)(`div`,{className:`form-group`,style:{display:`flex`,flexDirection:`column`,gap:`0.5rem`},children:[(0,y.jsx)(`label`,{className:`form-label`,style:{fontSize:`0.825rem`,fontWeight:650,color:`var(--text-secondary)`},children:`🔑 กรุณากรอกรหัสผ่านบัญชีผู้ใช้ปัจจุบันเพื่อยืนยัน (Confirm Password)`}),(0,y.jsx)(`input`,{type:`password`,className:`form-input`,placeholder:`ป้อนรหัสผ่านปัจจุบันของคุณ`,value:G,onChange:e=>{K(e.target.value),X(``)},disabled:q,style:{width:`100%`,padding:`0.65rem 0.85rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`,backgroundColor:`var(--bg-primary)`},required:!0})]}),Y&&(0,y.jsxs)(`div`,{className:`alert alert-danger animate-fade-in`,style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,padding:`0.75rem`,fontSize:`0.775rem`,backgroundColor:`rgba(239, 68, 68, 0.08)`,border:`1px solid var(--danger)`,borderRadius:`var(--radius-sm)`,color:`#dc2626`},children:[(0,y.jsx)(d,{size:14,style:{flexShrink:0}}),(0,y.jsx)(`span`,{children:Y})]})]}),(0,y.jsxs)(`div`,{className:`modal-actions`,style:{display:`flex`,justifyContent:`flex-end`,gap:`0.75rem`,marginTop:`1.75rem`,borderTop:`1px solid var(--border)`,paddingTop:`1rem`},children:[(0,y.jsx)(`button`,{className:`btn btn-secondary`,onClick:()=>W(!1),disabled:q,style:{minWidth:`80px`},children:`ยกเลิก`}),(0,y.jsx)(`button`,{className:`btn btn-danger`,onClick:async()=>{if(!w||w.role!==`admin`){X(`คุณไม่มีสิทธิ์ในการดำเนินการนี้`);return}if(G!==w.password){X(`รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง`);return}J(!0),X(``);try{await _(),W(!1),K(``),r(),alert(`รีเซ็ตฐานข้อมูลทั้งหมดเป็นค่าเริ่มต้นสำเร็จเรียบร้อยแล้ว`)}catch(e){X(`เกิดข้อผิดพลาดในการรีเซ็ตระบบ: ${e.message}`)}finally{J(!1)}},disabled:q||!G,style:{display:`flex`,alignItems:`center`,gap:`0.35rem`,minWidth:`140px`,justifyContent:`center`},children:q?(0,y.jsx)(y.Fragment,{children:`กำลังรีเซ็ตระบบ...`}):(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(m,{size:14}),` ยืนยันการรีเซ็ตระบบ`]})})]})]})}),(0,y.jsx)(`style`,{children:`
        .settings-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .settings-sidebar {
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .settings-tab-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-family);
          font-size: 0.9rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .settings-tab-btn:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .active-sub-tab {
          background-color: var(--primary-light);
          color: var(--primary);
        }

        .settings-content-pane {
          padding: 2rem;
          min-height: 480px;
        }

        /* Firebase configurations box */
        .no-config-warning-box {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
          background-color: var(--warning-light);
          border: 1px solid var(--warning);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .no-config-warning-box h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--warning-hover);
          margin-bottom: 0.25rem;
        }

        .no-config-warning-box p {
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .config-grid-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 2rem;
          align-items: start;
        }

        .config-share-qr-card {
          padding: 1.25rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .qr-box-outline {
          padding: 0.5rem;
          background-color: #ffffff;
          border-radius: var(--radius-sm);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          margin-bottom: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .config-share-qr-card h4 {
          font-size: 0.85rem;
          font-weight: 750;
          margin-bottom: 0.25rem;
        }

        .config-share-qr-card p {
          font-size: 0.725rem;
          color: var(--text-muted);
          line-height: 1.45;
          margin-bottom: 1rem;
        }

        .qr-action-buttons {
          width: 100%;
        }

        .config-data-details {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .section-small-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .meta-info-list {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1rem;
          font-size: 0.825rem;
        }

        .meta-line {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed var(--border);
          padding: 0.45rem 0;
        }

        .meta-line:last-child {
          border-bottom: none;
        }

        .meta-line span {
          color: var(--text-secondary);
          font-weight: 550;
        }

        .meta-line code {
          font-weight: 600;
          color: var(--text-primary);
        }

        .danger-zone-settings {
          border: 1px solid var(--danger);
          background-color: var(--danger-light);
          padding: 1.25rem;
          border-radius: var(--radius-md);
        }

        .danger-zone-settings h4 {
          color: var(--danger);
          font-size: 0.9rem;
          font-weight: 750;
          margin-bottom: 0.25rem;
        }

        .danger-zone-settings p {
          font-size: 0.775rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Backup view cards */
        .backup-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .backup-action-card {
          padding: 1.5rem;
          background-color: var(--bg-primary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
          min-height: 260px;
        }

        .backup-action-card h4 {
          font-size: 1rem;
          font-weight: 750;
        }

        .backup-action-card p {
          font-size: 0.825rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Alert notifications */
        .alert-success {
          background-color: var(--success-light);
          color: var(--success);
          border: 1px solid var(--success);
        }

        /* User Guide */
        .user-guide-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .guide-section {
          border-bottom: 1px solid var(--border);
          padding-bottom: 1.25rem;
        }

        .guide-section h4 {
          font-size: 0.95rem;
          font-weight: 750;
          color: var(--primary);
          margin-bottom: 0.75rem;
        }

        .guide-steps-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .guide-step-row {
          display: flex;
          gap: 0.85rem;
          align-items: flex-start;
        }

        .step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-color: var(--primary-light);
          border: 1.5px solid var(--primary);
          color: var(--primary);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .guide-step-row p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 992px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }
          .settings-sidebar {
            flex-direction: row;
            overflow-x: auto;
            gap: 0.5rem;
          }
          .settings-tab-btn {
            white-space: nowrap;
            width: auto;
          }
          .config-grid-layout {
            grid-template-columns: 1fr;
            justify-items: center;
          }
          .config-share-qr-card {
            width: 100%;
            max-width: 320px;
          }
        }

        @media (max-width: 576px) {
          .backup-actions-grid {
            grid-template-columns: 1fr;
          }
          .backup-action-card {
            min-height: auto;
          }
        }
      `})]})};export{b as Module7_Settings};