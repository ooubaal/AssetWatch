import{r as e}from"./rolldown-runtime-BHe-jwch.js";import{Nt as t,Q as n,St as r,X as i,Z as a,b as ee,d as o,gt as s,i as c,kt as te,lt as l,m as u,q as d,st as f,tt as p}from"./vendor-icons-qVqAK2Qz.js";import{n as m,t as h}from"./vendor-react-BkSsXNgQ.js";import{_ as g,a as _,o as ne,s as re,v as ie}from"./index-DSmaGlM8.js";var v=e(t(),1),y=m(),b=({onClearConfig:e,onImportSuccess:t,assets:m,audits:b,repairs:x,surveys:S,rounds:C,departments:w,users:T,currentUser:E})=>{let[D,O]=(0,v.useState)(`config`),[k,A]=(0,v.useState)(!1),[j,M]=(0,v.useState)(!1),[N,P]=(0,v.useState)(null),[F,I]=(0,v.useState)(localStorage.getItem(`assetwatch_hide_demo_bypass`)===`true`),[L,R]=(0,v.useState)(localStorage.getItem(`assetwatch_force_base64_images`)!==`false`),z=(0,v.useRef)(null),[B,V]=(0,v.useState)(null),[H,U]=(0,v.useState)(!1),[W,G]=(0,v.useState)(!1),[K,q]=(0,v.useState)(``),[J,Y]=(0,v.useState)(!1),[X,Z]=(0,v.useState)(``);(0,v.useEffect)(()=>{U(!0),fetch(`https://api.github.com/repos/ooubaal/AssetWatch`).then(e=>{if(!e.ok)throw Error(`Not found or private repository`);return e.json()}).then(e=>{e&&typeof e.size==`number`&&V(e.size)}).catch(e=>{console.error(`Failed to fetch GitHub repo size:`,e),V(480)}).finally(()=>U(!1))},[]);let Q=()=>{try{let e=JSON.stringify({assets:m,audits:b,repairs:x,surveys:S,rounds:C,departments:w,users:T});return new Blob([e]).size}catch{return 0}},$=ie(),ae=e=>{localStorage.setItem(`assetwatch_hide_demo_bypass`,e?`true`:`false`),I(e)},oe=e=>{localStorage.setItem(`assetwatch_force_base64_images`,e?`true`:`false`),R(e)};return(0,y.jsxs)(`div`,{className:`module-container animate-fade-in`,children:[(0,y.jsxs)(`div`,{className:`module-title-section`,children:[(0,y.jsx)(`h2`,{children:`แผงตั้งค่า แบคอัพข้อมูล และคู่มือโปรแกรม (Module 7)`}),(0,y.jsx)(`p`,{children:`ตั้งค่าคลาวด์แชร์ทีมงาน สำรอง/กู้คืนฐานข้อมูลครุภัณฑ์ และคู่มือการใช้งานระบบสำหรับฝ่ายพัสดุ`})]}),(0,y.jsxs)(`div`,{className:`settings-layout`,children:[(0,y.jsxs)(`aside`,{className:`settings-sidebar glass-panel`,children:[(0,y.jsxs)(`button`,{className:`settings-tab-btn ${D===`config`?`active-sub-tab`:``}`,onClick:()=>O(`config`),children:[(0,y.jsx)(ee,{size:18}),` ตั้งค่าฐานข้อมูลคลาวด์`]}),(0,y.jsxs)(`button`,{className:`settings-tab-btn ${D===`backup`?`active-sub-tab`:``}`,onClick:()=>O(`backup`),children:[(0,y.jsx)(a,{size:18}),` สำรอง & กู้คืนข้อมูล (Backup)`]}),(0,y.jsxs)(`button`,{className:`settings-tab-btn ${D===`guide`?`active-sub-tab`:``}`,onClick:()=>O(`guide`),children:[(0,y.jsx)(r,{size:18}),` คู่มือการใช้งานระบบ`]})]}),(0,y.jsxs)(`main`,{className:`settings-content-pane glass-panel`,children:[D===`config`&&(0,y.jsxs)(`div`,{className:`setting-view-box animate-fade-in`,children:[(0,y.jsxs)(`div`,{className:`card-header`,style:{marginBottom:`1.5rem`,paddingBottom:`0.5rem`},children:[(0,y.jsx)(`h3`,{children:`ตั้งค่าคลาวด์ออนไลน์ (Firebase Config)`}),(0,y.jsx)(`span`,{className:`card-header-sub`,children:`แชร์การเข้าถึงเชื่อมต่อในโครงการเดียวกับทีมงานของคุณ`})]}),$?(0,y.jsx)(`div`,{className:`configured-box`,children:(0,y.jsxs)(`div`,{className:`config-grid-layout`,children:[(0,y.jsxs)(`div`,{className:`config-share-qr-card`,children:[(0,y.jsx)(`div`,{className:`qr-box-outline`,children:(0,y.jsx)(h,{value:JSON.stringify($),size:180,level:`L`})}),(0,y.jsx)(`h4`,{children:`QR Code สิทธิ์เข้าถึงฐานข้อมูล`}),(0,y.jsx)(`p`,{children:`ให้เพื่อนร่วมงานเปิดเว็บโปรแกรมผ่านมือถือ กด "เข้าร่วมผ่าน QR Code" แล้วสแกนหน้านี้เพื่อเชื่อมต่อทันที`}),(0,y.jsx)(`div`,{className:`qr-action-buttons`,children:(0,y.jsxs)(`button`,{className:`btn btn-secondary btn-xs`,onClick:()=>{$&&(navigator.clipboard.writeText(JSON.stringify($,null,2)),A(!0),setTimeout(()=>A(!1),2e3))},children:[k?(0,y.jsx)(s,{size:12,color:`var(--success)`}):(0,y.jsx)(n,{size:12}),k?` คัดลอกแล้ว`:` คัดลอกข้อมูล Config`]})})]}),(0,y.jsxs)(`div`,{className:`config-data-details`,children:[(0,y.jsx)(`h4`,{className:`section-small-title`,children:`📍 พารามิเตอร์การเชื่อมต่อปัจจุบัน`}),(0,y.jsxs)(`div`,{className:`meta-info-list`,children:[(0,y.jsxs)(`div`,{className:`meta-line`,children:[(0,y.jsx)(`span`,{children:`Project ID:`}),` `,(0,y.jsx)(`code`,{children:$.projectId})]}),(0,y.jsxs)(`div`,{className:`meta-line`,children:[(0,y.jsx)(`span`,{children:`Auth Domain:`}),` `,(0,y.jsx)(`code`,{children:$.authDomain})]}),(0,y.jsxs)(`div`,{className:`meta-line`,children:[(0,y.jsx)(`span`,{children:`Storage Bucket:`}),` `,(0,y.jsx)(`code`,{children:$.storageBucket})]}),(0,y.jsxs)(`div`,{className:`meta-line`,children:[(0,y.jsx)(`span`,{children:`API Key:`}),` `,(0,y.jsxs)(`code`,{children:[$.apiKey.substring(0,10),`...`]})]})]}),(0,y.jsxs)(`div`,{className:`standalone-production-settings-box`,style:{padding:`1.25rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius-md)`,backgroundColor:`rgba(59, 130, 246, 0.03)`,marginTop:`1rem`},children:[(0,y.jsx)(`h4`,{style:{fontSize:`0.875rem`,fontWeight:750,color:`var(--primary)`,marginBottom:`0.35rem`,display:`flex`,alignItems:`center`,gap:`0.35rem`},children:`⚡ โหมดใช้งานรูปถ่ายฟรี 100% (Free Cloud Photo Mode)`}),(0,y.jsxs)(`p`,{style:{fontSize:`0.75rem`,color:`var(--text-secondary)`,lineHeight:1.4,marginBottom:`0.85rem`},children:[`หากคุณใช้งานโปรเจกต์คลาวด์ฟรีและไม่ได้อัปเกรดแผนกชำระเงิน (Blaze Plan) การถ่ายรูปพัสดุจะค้างและช้ามาก ให้เปิดระบบนี้เพื่อ`,(0,y.jsx)(`strong`,{children:`บังคับข้าม Firebase Storage`}),` และสลับมาใช้ระบบแปลงรูปภาพแบบ Base64 ซึ่งทำงานเสร็จใน 0.1 วินาที และบันทึกผ่านฐานข้อมูลออนไลน์ฟรีทันที!`]}),(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`0.6rem 0.85rem`,backgroundColor:`var(--bg-secondary)`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`},children:[(0,y.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:650,color:`var(--text-primary)`},children:`🚀 บังคับข้ามคลาวด์ Storage (Base64 Fast Mode)`}),(0,y.jsx)(`input`,{type:`checkbox`,id:`force-base64-toggle`,checked:L,onChange:e=>oe(e.target.checked),style:{cursor:`pointer`,width:`18px`,height:`18px`}})]})]}),E?.role===`admin`&&(0,y.jsxs)(`div`,{className:`danger-zone-settings`,children:[(0,y.jsx)(`h4`,{children:`🚨 พื้นที่อันตราย (Danger Zone)`}),(0,y.jsx)(`p`,{children:`การตัดการเชื่อมต่อจะยุติการอ่านข้อมูลออนไลน์ และให้คุณสลับไปเปลี่ยน Firebase Project อื่นหรือสลับไปทดสอบออฟไลน์`}),(0,y.jsxs)(`button`,{className:`btn btn-danger btn-sm`,onClick:()=>{window.confirm(`คุณต้องการตัดการเชื่อมต่อกับ Firebase Cloud หรือไม่? (ข้อมูลที่เซฟในระบบเดโมออฟไลน์จะไม่ได้รับผลกระทบ)`)&&(g(),e())},style:{marginTop:`0.75rem`},children:[(0,y.jsx)(u,{size:14}),` ตัดการเชื่อมต่อฐานข้อมูลคลาวด์นี้`]})]})]})]})}):(0,y.jsxs)(y.Fragment,{children:[(0,y.jsxs)(`div`,{className:`no-config-warning-box`,children:[(0,y.jsx)(p,{size:36,color:`var(--warning)`}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`h4`,{children:`ปัจจุบันระบบกำลังทำงานบน "โหมดตัวอย่างออฟไลน์" (Demo Mode)`}),(0,y.jsx)(`p`,{children:`ข้อมูลทั้งหมดถูกบันทึกชั่วคราวอยู่ในเว็บบราวเซอร์ของคุณ (LocalStorage) หากปิดบราวเซอร์หรือล้างคุ้กกี้ข้อมูลจะหายไป เพื่อการใช้งานจริงร่วมกันหลายคน โปรดกดติดตั้ง Firebase`})]}),E?.role===`admin`&&(0,y.jsx)(`button`,{className:`btn btn-warning btn-sm`,onClick:e,style:{marginLeft:`auto`,flexShrink:0},children:`ตั้งค่าเชื่อมต่อคลาวด์`})]}),(0,y.jsxs)(`div`,{className:`standalone-production-settings-box glass-panel`,style:{marginTop:`1.5rem`,padding:`1.5rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius-md)`},children:[(0,y.jsx)(`h4`,{style:{fontSize:`0.95rem`,fontWeight:750,color:`var(--primary)`,marginBottom:`0.5rem`,display:`flex`,alignItems:`center`,gap:`0.5rem`},children:`⚙️ โหมดใช้งานจริงแบบเก็บข้อมูลในเครื่อง (Standalone Production Settings)`}),(0,y.jsxs)(`p`,{style:{fontSize:`0.825rem`,color:`var(--text-secondary)`,lineHeight:1.45,marginBottom:`1.25rem`},children:[`หากคุณต้องการนำระบบนี้ไปใช้งานจริงในแบบ `,(0,y.jsx)(`strong`,{children:`Standalone (บันทึกข้อมูลแบบออฟไลน์ในเครื่องนี้เครื่องเดียวอย่างปลอดภัย)`}),` คุณสามารถสั่งซ่อนปุ่มบัญชีทดสอบด่วน (Demo Bypass) ที่หน้าแรกได้ เพื่อความปลอดภัยและให้หน้าจอลงชื่อเข้าใช้งานมีความเป็นทางการ`]}),(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`0.85rem 1.25rem`,backgroundColor:`var(--bg-secondary)`,borderRadius:`var(--radius-md)`,border:`1px solid var(--border)`},children:[(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`span`,{style:{fontSize:`0.875rem`,fontWeight:650,display:`block`,color:`var(--text-primary)`},children:`🔒 ซ่อนปุ่มบัญชีทดสอบด่วนบนหน้าแรก (Hide Demo Bypass Buttons)`}),(0,y.jsx)(`span`,{style:{fontSize:`0.75rem`,color:`var(--text-muted)`},children:`เมื่อเปิดใช้งาน จะต้องป้อนชื่อผู้ใช้งานและรหัสผ่านจริงเท่านั้นเพื่อเข้าระบบ`})]}),(0,y.jsx)(`div`,{className:`toggle-switch-wrapper`,children:(0,y.jsx)(`input`,{type:`checkbox`,id:`hide-demo-toggle`,checked:F,onChange:e=>ae(e.target.checked),style:{cursor:`pointer`,width:`20px`,height:`20px`}})})]}),F&&(0,y.jsxs)(`div`,{className:`alert alert-info animate-fade-in`,style:{marginTop:`1.25rem`,fontSize:`0.8rem`,padding:`1rem`,backgroundColor:`var(--primary-light)`,border:`1px solid var(--primary)`,borderRadius:`var(--radius-md)`,display:`block`},children:[(0,y.jsx)(`span`,{style:{display:`block`,fontWeight:750,color:`var(--primary)`,marginBottom:`0.5rem`},children:`💡 ข้อมูลการล็อคอินเริ่มต้นหลังจากซ่อนปุ่มเดโม:`}),(0,y.jsx)(`span`,{style:{display:`block`,color:`var(--text-secondary)`,marginBottom:`0.5rem`},children:`คุณยังคงสามารถล็อคอินเข้าสู่ระบบด้วยบัญชีผู้ใช้เริ่มต้นที่มีอยู่ในระบบได้ดังนี้:`}),(0,y.jsxs)(`ul`,{style:{paddingLeft:`1.25rem`,margin:`0.5rem 0`,listStyleType:`disc`,color:`var(--text-secondary)`,display:`flex`,flexDirection:`column`,gap:`0.25rem`},children:[(0,y.jsxs)(`li`,{children:[`👑 `,(0,y.jsx)(`strong`,{children:`สิทธิ์แอดมินสูงสุด (Admin):`}),` ชื่อผู้ใช้ `,(0,y.jsx)(`code`,{children:`admin`}),` | รหัสผ่าน `,(0,y.jsx)(`code`,{children:`admin`}),` (จัดการระบบและสิทธิ์ผู้ใช้อื่น)`]}),(0,y.jsxs)(`li`,{children:[`💻 `,(0,y.jsx)(`strong`,{children:`สิทธิ์ฝ่ายเทคโนโลยี (IT User):`}),` ชื่อผู้ใช้ `,(0,y.jsx)(`code`,{children:`it_user`}),` | รหัสผ่าน `,(0,y.jsx)(`code`,{children:`123`}),` (จัดการครุภัณฑ์แผนก IT)`]}),(0,y.jsxs)(`li`,{children:[`💼 `,(0,y.jsx)(`strong`,{children:`สิทธิ์ฝ่ายบริหารทั่วไป (General Admin):`}),` ชื่อผู้ใช้ `,(0,y.jsx)(`code`,{children:`admin_general`}),` | รหัสผ่าน `,(0,y.jsx)(`code`,{children:`123`}),` (จัดการครุภัณฑ์แผนกบริหาร)`]})]}),(0,y.jsxs)(`span`,{style:{display:`block`,color:`var(--text-muted)`,fontSize:`0.75rem`,marginTop:`0.5rem`},children:[`*คุณสามารถเพิ่มบัญชี ลบรหัส หรือเปลี่ยนเป็นชื่อและรหัสผ่านจริงของคุณเองได้ตลอดเวลาใน `,(0,y.jsx)(`strong`,{children:`"โมดูล 9: สิทธิ์และการเข้าถึง"`})]})]})]})]}),(0,y.jsxs)(`div`,{className:`capacity-dashboard-box glass-panel`,style:{marginTop:`2rem`,padding:`1.5rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius-md)`,backgroundColor:`var(--bg-secondary)`},children:[(0,y.jsx)(`h4`,{style:{fontSize:`1rem`,fontWeight:750,color:`var(--text-primary)`,marginBottom:`1rem`,display:`flex`,alignItems:`center`,gap:`0.5rem`,borderBottom:`1px solid var(--border)`,paddingBottom:`0.5rem`},children:`📊 สถิติความจุและคลังเก็บข้อมูล (Storage & Repository Capacity)`}),(0,y.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(280px, 1fr))`,gap:`1.5rem`},children:[(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.75rem`},children:[(0,y.jsxs)(`span`,{style:{fontSize:`0.85rem`,fontWeight:700,color:`var(--primary)`,display:`flex`,alignItems:`center`,gap:`0.35rem`},children:[(0,y.jsx)(a,{size:16}),` ฐานข้อมูล `,$?`Cloud Firestore`:`LocalStorage (บราวเซอร์)`]}),(0,y.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,fontSize:`0.75rem`,color:`var(--text-secondary)`},children:[(0,y.jsx)(`span`,{children:`ปริมาณการใช้งานปัจจุบัน:`}),(0,y.jsxs)(`strong`,{style:{color:`var(--text-primary)`},children:[(Q()/1024).toFixed(2),` KB / `,$?`1,048,576 KB (1 GB)`:`5,120 KB (5 MB)`]})]}),(0,y.jsx)(`div`,{style:{width:`100%`,height:`8px`,backgroundColor:`var(--border)`,borderRadius:`999px`,overflow:`hidden`},children:(0,y.jsx)(`div`,{style:{width:`${Math.min(100,Q()/($?1024*1024*1024:5*1024*1024)*100)}%`,height:`100%`,backgroundColor:`var(--primary)`,borderRadius:`999px`,transition:`width 0.5s ease-in-out`}})}),(0,y.jsx)(`div`,{style:{fontSize:`0.7rem`,color:`var(--text-muted)`,lineHeight:`1.4`},children:$?(0,y.jsx)(`span`,{children:`*คำนวณจากปริมาณตัวอักษรของข้อมูลพัสดุและไฟล์รูปภาพ Base64 ทั้งหมด โดยอิงตามข้อจำกัดโควตาฟรี (Free Tier 1GB) ของ Google Cloud Firestore`}):(0,y.jsx)(`span`,{children:`*ข้อมูลกำลังบันทึกเก็บไว้ใน LocalStorage ของเว็บบราวเซอร์นี้ ซึ่งมีขีดจำกัดมาตรฐานของบราวเซอร์อยู่ที่ประมาณ 5MB`})}),(0,y.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(2, 1fr)`,gap:`0.35rem`,marginTop:`0.5rem`,padding:`0.5rem`,backgroundColor:`var(--bg-primary)`,borderRadius:`var(--radius-sm)`,border:`1px dashed var(--border)`},children:[(0,y.jsxs)(`div`,{style:{fontSize:`0.725rem`,color:`var(--text-secondary)`},children:[`📦 พัสดุ: `,(0,y.jsx)(`strong`,{children:m.length}),` รายการ`]}),(0,y.jsxs)(`div`,{style:{fontSize:`0.725rem`,color:`var(--text-secondary)`},children:[`📝 บันทึกตรวจ: `,(0,y.jsx)(`strong`,{children:S.length}),` รายการ`]}),(0,y.jsxs)(`div`,{style:{fontSize:`0.725rem`,color:`var(--text-secondary)`},children:[`🔧 แจ้งซ่อม: `,(0,y.jsx)(`strong`,{children:x.length}),` เคส`]}),(0,y.jsxs)(`div`,{style:{fontSize:`0.725rem`,color:`var(--text-secondary)`},children:[`👤 ผู้ใช้: `,(0,y.jsx)(`strong`,{children:T.length}),` บัญชี`]})]})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.75rem`},children:[(0,y.jsxs)(`span`,{style:{fontSize:`0.85rem`,fontWeight:700,color:`var(--success)`,display:`flex`,alignItems:`center`,gap:`0.35rem`},children:[(0,y.jsx)(d,{size:16}),` พื้นที่จัดเก็บบน GitHub Repository`]}),(0,y.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,fontSize:`0.75rem`,color:`var(--text-secondary)`},children:[(0,y.jsx)(`span`,{children:`ขนาดโปรเจกต์ (Code & Assets):`}),(0,y.jsxs)(`strong`,{style:{color:`var(--text-primary)`},children:[H?`กำลังคำนวณ...`:B?`${B.toLocaleString()} KB`:`480 KB`,`/ 1,048,576 KB (1 GB)`]})]}),(0,y.jsx)(`div`,{style:{width:`100%`,height:`8px`,backgroundColor:`var(--border)`,borderRadius:`999px`,overflow:`hidden`},children:(0,y.jsx)(`div`,{style:{width:`${Math.min(100,(B||480)/(1024*1024)*100)}%`,height:`100%`,backgroundColor:`var(--success)`,borderRadius:`999px`,transition:`width 0.5s ease-in-out`}})}),(0,y.jsxs)(`div`,{style:{fontSize:`0.7rem`,color:`var(--text-muted)`,lineHeight:`1.4`},children:[`*ดึงข้อมูลขนาดเนื้อที่โดยตรงจาก GitHub API สำหรับโปรเจกต์ `,(0,y.jsx)(`code`,{children:`ooubaal/AssetWatch`}),` (ขีดจำกัดแนะนำคือ 1GB ต่อ Repository)`]}),(0,y.jsx)(`div`,{style:{marginTop:`auto`,paddingTop:`0.5rem`},children:(0,y.jsxs)(`a`,{href:`https://github.com/ooubaal/AssetWatch`,target:`_blank`,rel:`noreferrer`,style:{fontSize:`0.75rem`,color:`var(--success)`,fontWeight:650,display:`flex`,alignItems:`center`,gap:`0.25rem`,textDecoration:`underline`},children:[`🌐 ไปที่หน้าคลัง GitHub Repository ของคุณ `,(0,y.jsx)(te,{size:12})]})})]})]})]})]}),D===`backup`&&(0,y.jsxs)(`div`,{className:`setting-view-box animate-fade-in`,children:[(0,y.jsxs)(`div`,{className:`card-header`,style:{marginBottom:`1.5rem`,paddingBottom:`0.5rem`},children:[(0,y.jsx)(`h3`,{children:`สำรองและกู้คืนฐานข้อมูลครุภัณฑ์ (Backup & Restore)`}),(0,y.jsx)(`span`,{className:`card-header-sub`,children:`ส่งออกข้อมูลเก็บไว้ในเครื่องคอมพิวเตอร์ของคุณเพื่อความปลอดภัยสูงสุด`})]}),(0,y.jsxs)(`div`,{className:`backup-actions-grid`,children:[(0,y.jsxs)(`div`,{className:`backup-action-card`,children:[(0,y.jsx)(i,{size:32,color:`var(--primary)`}),(0,y.jsx)(`h4`,{children:`สำรองข้อมูลระบบ (Export JSON Backup)`}),(0,y.jsx)(`p`,{children:`ดาวน์โหลดไฟล์ข้อมูลพัสดุ ประวัติกิจกรรม เคสแจ้งซ่อม และผลการสแกนทั้งหมดเก็บไว้ในเครื่องอย่างปลอดภัย`}),(0,y.jsxs)(`button`,{className:`btn btn-primary w-full`,onClick:async()=>{try{let e=await _(),t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`AssetWatch_Backup_${new Date().toISOString().split(`T`)[0]}.json`,document.body.appendChild(r),r.click(),document.body.removeChild(r)}catch{alert(`เกิดข้อผิดพลาดในการส่งออกไฟล์แบคอัพ`)}},style:{marginTop:`auto`},children:[(0,y.jsx)(i,{size:14}),` ส่งออกข้อมูลแบคอัพทั้งหมด`]})]}),(0,y.jsxs)(`div`,{className:`backup-action-card`,children:[(0,y.jsx)(o,{size:32,color:`var(--success)`}),(0,y.jsx)(`h4`,{children:`กู้คืนระบบจากไฟล์แบคอัพ (Import Restore)`}),(0,y.jsx)(`p`,{children:`อัปโหลดไฟล์สำรองข้อมูล JSON กลับเข้าสู่คลาวด์และหน่วยความจำเพื่อกู้ข้อมูลพัสดุเดิมของคุณ`}),E?.role===`admin`?(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(`input`,{type:`file`,ref:z,accept:`.json`,onChange:async e=>{if(e.target.files&&e.target.files[0]){let n=e.target.files[0];M(!0),P(null);let r=new FileReader;r.onload=async e=>{let n=e.target?.result;try{let e=await re(n);P(e),e.success&&t()}catch(e){P({success:!1,message:`การอ่านไฟล์ล้มเหลว: ${e.message}`})}finally{M(!1)}},r.readAsText(n)}},style:{display:`none`}}),(0,y.jsxs)(`button`,{className:`btn btn-success w-full`,onClick:()=>{z.current&&z.current.click()},disabled:j,style:{marginTop:`auto`},children:[(0,y.jsx)(o,{size:14}),` `,j?`กำลังนำเข้าข้อมูล...`:`กู้คืนฐานข้อมูลจากไฟล์ JSON`]})]}):(0,y.jsx)(`button`,{className:`btn btn-muted w-full`,disabled:!0,style:{marginTop:`auto`,cursor:`not-allowed`,opacity:.6},children:`🔒 สงวนสิทธิ์สำหรับผู้ดูแลระบบ (Admin)`})]})]}),E?.role===`admin`?(0,y.jsxs)(`div`,{className:`factory-reset-section glass-panel`,style:{marginTop:`2rem`,padding:`1.5rem`,border:`1px solid var(--danger)`,borderRadius:`var(--radius-md)`,backgroundColor:`rgba(239, 68, 68, 0.02)`},children:[(0,y.jsxs)(`h4`,{style:{fontSize:`1rem`,fontWeight:750,color:`var(--danger)`,marginBottom:`0.5rem`,display:`flex`,alignItems:`center`,gap:`0.5rem`},children:[(0,y.jsx)(u,{size:18}),` 🚨 รีเซ็ตระบบทั้งหมดเป็นค่าเริ่มต้น (Factory Reset)`]}),(0,y.jsx)(`p`,{style:{fontSize:`0.825rem`,color:`var(--text-secondary)`,lineHeight:1.45,marginBottom:`1rem`},children:`การรีเซ็ตระบบจะทำการลบข้อมูลครุภัณฑ์พัสดุ เคสส่งซ่อม ประวัติการสำรวจ และข้อมูลการตั้งค่าทั้งหมดออกจากระบบอย่างถาวร (ทั้งบนคลาวด์และหน่วยความจำเครื่อง) และย้อนกลับไปใช้ค่าเริ่มต้นจากโรงงาน`}),(0,y.jsxs)(`div`,{className:`alert alert-warning`,style:{display:`flex`,alignItems:`flex-start`,gap:`0.5rem`,padding:`0.85rem`,backgroundColor:`rgba(245, 158, 11, 0.08)`,border:`1px solid var(--warning)`,borderRadius:`var(--radius-sm)`,marginBottom:`1.25rem`,fontSize:`0.8rem`,color:`var(--warning-dark)`},children:[(0,y.jsx)(l,{size:16,style:{flexShrink:0,marginTop:`0.1rem`}}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`strong`,{children:`คำเตือนสำคัญ:`}),` เพื่อความปลอดภัย กรุณากดปุ่ม `,(0,y.jsx)(`strong`,{children:`"ส่งออกข้อมูลแบคอัพทั้งหมด"`}),` ด้านบนเพื่อสำรองข้อมูลเก็บไว้เป็นไฟล์สำรองก่อนทำการรีเซ็ตทุกครั้ง`]})]}),(0,y.jsxs)(`button`,{className:`btn btn-danger`,onClick:()=>{q(``),Z(``),G(!0)},style:{fontWeight:650},children:[(0,y.jsx)(u,{size:14}),` ล้างข้อมูลและรีเซ็ตระบบทั้งหมด (Factory Reset)`]})]}):(0,y.jsxs)(`div`,{className:`factory-reset-section glass-panel`,style:{marginTop:`2rem`,padding:`1.5rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius-md)`,backgroundColor:`var(--bg-secondary)`,opacity:.8},children:[(0,y.jsxs)(`h4`,{style:{fontSize:`1rem`,fontWeight:750,color:`var(--text-muted)`,marginBottom:`0.5rem`,display:`flex`,alignItems:`center`,gap:`0.5rem`},children:[(0,y.jsx)(u,{size:18}),` 🔒 รีเซ็ตระบบทั้งหมดเป็นค่าเริ่มต้น (Factory Reset)`]}),(0,y.jsx)(`p`,{style:{fontSize:`0.825rem`,color:`var(--text-muted)`,lineHeight:1.45,marginBottom:0},children:`ฟังก์ชันรีเซ็ตระบบทั้งหมดถูกจำกัดสิทธิ์ไว้สำหรับผู้ดูแลระบบสูงสุด (Admin) เท่านั้น บัญชีระดับสิทธิ์ของคุณไม่สามารถดำเนินการนี้ได้`})]}),N&&(0,y.jsxs)(`div`,{className:`alert ${N.success?`alert-success`:`alert-danger`} animate-fade-in`,style:{marginTop:`1.5rem`},children:[N.success?(0,y.jsx)(f,{size:20}):(0,y.jsx)(l,{size:20}),(0,y.jsx)(`span`,{children:N.message})]})]}),D===`guide`&&(0,y.jsxs)(`div`,{className:`setting-view-box animate-fade-in user-guide-panel`,children:[(0,y.jsxs)(`div`,{className:`card-header`,style:{marginBottom:`1.5rem`,paddingBottom:`0.5rem`},children:[(0,y.jsx)(`h3`,{children:`คู่มือการใช้งานระบบ AssetWatch (User Manual)`}),(0,y.jsx)(`span`,{className:`card-header-sub`,children:`คำแนะนำและวิธีการทำงานสำหรับเจ้าหน้าที่พัสดุและฝ่ายสำรวจ`})]}),(0,y.jsxs)(`div`,{className:`guide-section`,children:[(0,y.jsx)(`h4`,{children:`1. 📸 วิธีสแกนสำรวจครุภัณฑ์ผ่านมือถือ (โมดูล 2)`}),(0,y.jsxs)(`div`,{className:`guide-steps-list`,children:[(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`1`}),(0,y.jsxs)(`p`,{children:[`เปิดโปรแกรม `,(0,y.jsx)(`strong`,{children:`AssetWatch`}),` ผ่านเบราว์เซอร์ของมือถือ โดยให้แอดมินเปิดสิทธิ์กล้อง`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`2`}),(0,y.jsx)(`p`,{children:`หันกล้องมือถือไปที่ **ฉลากบาร์โค้ด** หรือ **QR Code** บนตัวครุภัณฑ์ ระบบจะทำการดึงข้อมูลมาแสดงผลใน 0.5 วินาที`})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`3`}),(0,y.jsx)(`p`,{children:`ตรวจสอบความถูกต้องของสถานที่ตั้ง หากเจอชำรุด สามารถอัปเดตสถานะและกดถ่ายรูปบันทึกหลักฐานสภาพเครื่องเสียหายได้ทันที`})]})]})]}),(0,y.jsxs)(`div`,{className:`guide-section`,children:[(0,y.jsx)(`h4`,{children:`2. ➕ วิธีลงทะเบียนทรัพย์สินใหม่และสั่งพิมพ์บาร์โค้ด (โมดูล 3)`}),(0,y.jsxs)(`div`,{className:`guide-steps-list`,children:[(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`1`}),(0,y.jsx)(`p`,{children:`เปิดไปที่หน้า **"ลงทะเบียนใหม่"** ป้อนรายละเอียด ถ่ายรูปอุปกรณ์แนบประวัติการรับ`})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`2`}),(0,y.jsx)(`p`,{children:`กรณีไม่มีเลขบาร์โค้ดเดิม ให้กด **"สุ่มสร้างรหัส"** เพื่อให้ระบบออกรหัสควบคุมให้เองแบบเป็นระเบียบ`})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`3`}),(0,y.jsx)(`p`,{children:`เมื่อลงทะเบียนสำเร็จ ให้ไปที่หน้ารายละเอียดครุภัณฑ์ชิ้นนั้น และคลิก **"ดาวน์โหลดฉลาก"** เพื่อเซฟภาพบาร์โค้ดและพิมพ์ไปติดบนทรัพย์สิน`})]})]})]}),(0,y.jsxs)(`div`,{className:`guide-section`,children:[(0,y.jsx)(`h4`,{children:`3. 🔧 การติดตามความคืบหน้านำซ่อม (โมดูล 5)`}),(0,y.jsxs)(`div`,{className:`guide-steps-list`,children:[(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`1`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`เปิดเคสแจ้งชำรุด`}),`: ค้นหาพัสดุ ระบุอาการ ถ่ายรูปอาการขัดข้องเพื่อเก็บประวัติและแจ้งเตือนให้เจ้าหน้าที่อื่นรับทราบ`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`2`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ส่งไปร้านซ่อม`}),`: เมื่อส่งเครื่องให้ร้านค้าซ่อมแซม ให้กดปุ่ม **"นำส่งช่างซ่อม"** เพื่อระบุบริษัทและแนบรูปใบรับเครื่อง`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`3`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`รับกลับพัสดุคืน`}),`: เมื่อร้านซ่อมเสร็จส่งคืน ให้กดปุ่ม **"ตรวจรับคืน"** เพื่อตรวจสอบความถูกต้อง ถ่ายรูปยืนยันสภาพพร้อมใช้งาน และเปลี่ยนสถานะกลับเป็นปกติโดยอัตโนมัติ`]})]})]})]}),(0,y.jsxs)(`div`,{className:`guide-section`,children:[(0,y.jsx)(`h4`,{children:`4. 🔄 วิธีการย้ายฐานข้อมูลคลาวด์ ไปยังบัญชี Firebase ใหม่ (Data Migration)`}),(0,y.jsxs)(`div`,{className:`guide-steps-list`,children:[(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`1`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ส่งออกข้อมูลเดิม (Export JSON)`}),`: ไปที่หัวข้อ **"สำรอง & กู้คืนข้อมูล (Backup)"** บนแท็บด้านซ้าย แล้วกดปุ่ม **"ส่งออกข้อมูลแบคอัพทั้งหมด"** เพื่อเซฟไฟล์ `,(0,y.jsx)(`code`,{children:`.json`}),` ลงในเครื่องคอมพิวเตอร์`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`2`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`เชื่อมต่อบัญชีใหม่`}),`: ไปที่หัวข้อ **"ตั้งค่าฐานข้อมูลคลาวด์"** เลื่อนลงไปล่างสุดตรง Danger Zone แล้วกด **"ตัดการเชื่อมต่อฐานข้อมูลคลาวด์นี้"** จากนั้นป้อนรหัสคลาวด์ (Firebase Config) ตัวใหม่ที่ต้องการย้ายไป`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`3`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`นำเข้าข้อมูลสำเร็จรูป (Import Restore)`}),`: เข้าสู่ระบบฐานข้อมูลใหม่ ไปที่หัวข้อ **"สำรอง & กู้คืนข้อมูล (Backup)"** อีกครั้ง อัปโหลดไฟล์ `,(0,y.jsx)(`code`,{children:`.json`}),` ที่สำรองไว้ในขั้นแรก แล้วกด **"กู้คืนฐานข้อมูลจากไฟล์ JSON"** ข้อมูลและบัญชีทั้งหมดจะถูกกู้คืนออนไลน์ทันที`]})]})]})]}),(0,y.jsxs)(`div`,{className:`guide-section`,style:{borderBottom:`none`},children:[(0,y.jsx)(`h4`,{children:`5. 🛡️ ความปลอดภัยของระบบและการป้องกันข้อมูล (System Security & Data Protection)`}),(0,y.jsxs)(`div`,{className:`guide-steps-list`,children:[(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`1`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`การเข้ารหัสข้อมูลขณะส่ง (HTTPS/SSL)`}),`: ข้อมูลและรูปภาพทั้งหมดที่วิ่งระหว่างระบบกับคลาวด์ Firebase จะถูกส่งผ่านโปรโตคอล HTTPS เสมอ ป้องกันการดักจับหรือดักฟังข้อมูลระหว่างทาง`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`2`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`กฎการเข้าถึงข้อมูล (Firestore Rules)`}),`: มีระบบตั้งค่าสิทธิ์ให้เฉพาะผู้ใช้ที่ผ่านการเข้าสู่ระบบอย่างถูกต้องเท่านั้นที่จะสามารถเข้าถึงหรือแก้ไขข้อมูลครุภัณฑ์ออนไลน์ได้ ป้องกันบุคคลภายนอกเดาคีย์แล้วเขียนข้อมูลทับ`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`3`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ความปลอดภัยบน GitHub`}),`: ตัวโปรแกรมหลักเป็นเว็บแอปพลิเคชันฝั่งเครื่องผู้ใช้ (Client-side) ที่อยู่บน GitHub โดยจะไม่มีการเก็บประวัติ รหัสผ่าน หรือไฟล์ข้อมูลครุภัณฑ์ใดๆ ขององค์กรไว้บน GitHub ทั้งหมดจะเก็บอยู่ในคลาวด์ Firebase และเครื่องคอมพิวเตอร์ของคุณเท่านั้น จึงไม่เสี่ยงต่อการรั่วไหลผ่านซอร์สโค้ด`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`4`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ความปลอดภัยของรหัสผ่าน`}),`: รหัสผ่านของบัญชีผู้ใช้งานทั้งหมดที่เพิ่มในระบบ จะถูกตรวจสอบผ่านการเช็กสิทธิ์ระดับฐานข้อมูลและไม่สามารถดูเป็นข้อความรหัสผ่านตรงๆ ได้เพื่อรักษาความปลอดภัยขั้นสูงสุด`]})]}),(0,y.jsxs)(`div`,{className:`guide-step-row`,children:[(0,y.jsx)(`span`,{className:`step-num`,children:`5`}),(0,y.jsxs)(`p`,{children:[(0,y.jsx)(`strong`,{children:`ระดับสิทธิ์การเข้าถึง 3 ระดับ (RBAC)`}),`: ระบบแบ่งขอบเขตหน้าที่อย่างชัดเจน: (1) **Admin** มีสิทธิ์สูงสุด จัดการระบบและทำเรื่องจำหน่ายได้, (2) **Manager** สำหรับผู้บริหารดูรายงานสถิติได้ทุกแผนกแบบอ่านอย่างเดียว (Read-Only), และ (3) **Operator** เจ้าหน้าที่ฝ่ายพัสดุ ลงทะเบียน/แก้ไขครุภัณฑ์ได้เฉพาะแผนกของตนเอง และห้ามกดจำหน่ายหรือลบข้อมูลออกเอง`]})]})]})]})]})]})]}),W&&(0,y.jsx)(`div`,{className:`modal-backdrop`,style:{zIndex:99999},children:(0,y.jsxs)(`div`,{className:`modal-content glass-panel animate-scale-up`,style:{maxWidth:`480px`,width:`90%`,padding:`1.75rem`},children:[(0,y.jsxs)(`div`,{className:`modal-header`,style:{marginBottom:`1.25rem`,paddingBottom:`0.75rem`,borderBottom:`1px solid var(--border)`},children:[(0,y.jsxs)(`h3`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,color:`var(--danger)`,fontSize:`1.15rem`,fontWeight:800},children:[(0,y.jsx)(u,{size:20}),` ยืนยันการรีเซ็ตระบบทั้งหมด`]}),(0,y.jsx)(`button`,{className:`btn btn-ghost btn-icon-only`,onClick:()=>G(!1),disabled:J,children:(0,y.jsx)(c,{size:18})})]}),(0,y.jsxs)(`div`,{className:`modal-body`,style:{display:`flex`,flexDirection:`column`,gap:`1rem`},children:[(0,y.jsx)(`p`,{style:{fontSize:`0.875rem`,color:`var(--text-primary)`,lineHeight:1.5},children:`คุณกำลังจะทำการรีเซ็ตข้อมูลครุภัณฑ์พัสดุ เคสแจ้งซ่อม และผลการสำรวจสภาพทั้งหมดในระบบให้ย้อนกลับเป็นค่าเริ่มต้นจากโรงงาน (Factory Reset)`}),(0,y.jsxs)(`div`,{className:`alert alert-danger`,style:{display:`flex`,alignItems:`flex-start`,gap:`0.5rem`,padding:`0.85rem`,backgroundColor:`rgba(239, 68, 68, 0.08)`,border:`1px solid var(--danger)`,borderRadius:`var(--radius-sm)`,fontSize:`0.775rem`,color:`#dc2626`},children:[(0,y.jsx)(l,{size:16,style:{flexShrink:0,marginTop:`0.1rem`}}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`strong`,{children:`⚠️ คำเตือน:`}),` ข้อมูลทั้งหมดที่ถูกลบไปแล้วจะไม่สามารถกู้คืนกลับมาได้อีก โปรดตรวจสอบให้แน่ใจว่าคุณได้สำรองข้อมูล (Backup) เรียบร้อยแล้วก่อนทำการรีเซ็ต`]})]}),(0,y.jsxs)(`div`,{className:`form-group`,style:{display:`flex`,flexDirection:`column`,gap:`0.5rem`},children:[(0,y.jsx)(`label`,{className:`form-label`,style:{fontSize:`0.825rem`,fontWeight:650,color:`var(--text-secondary)`},children:`🔑 กรุณากรอกรหัสผ่านบัญชีผู้ใช้ปัจจุบันเพื่อยืนยัน (Confirm Password)`}),(0,y.jsx)(`input`,{type:`password`,className:`form-input`,placeholder:`ป้อนรหัสผ่านปัจจุบันของคุณ`,value:K,onChange:e=>{q(e.target.value),Z(``)},disabled:J,style:{width:`100%`,padding:`0.65rem 0.85rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`,backgroundColor:`var(--bg-primary)`},required:!0})]}),X&&(0,y.jsxs)(`div`,{className:`alert alert-danger animate-fade-in`,style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,padding:`0.75rem`,fontSize:`0.775rem`,backgroundColor:`rgba(239, 68, 68, 0.08)`,border:`1px solid var(--danger)`,borderRadius:`var(--radius-sm)`,color:`#dc2626`},children:[(0,y.jsx)(l,{size:14,style:{flexShrink:0}}),(0,y.jsx)(`span`,{children:X})]})]}),(0,y.jsxs)(`div`,{className:`modal-actions`,style:{display:`flex`,justifyContent:`flex-end`,gap:`0.75rem`,marginTop:`1.75rem`,borderTop:`1px solid var(--border)`,paddingTop:`1rem`},children:[(0,y.jsx)(`button`,{className:`btn btn-secondary`,onClick:()=>G(!1),disabled:J,style:{minWidth:`80px`},children:`ยกเลิก`}),(0,y.jsx)(`button`,{className:`btn btn-danger`,onClick:async()=>{if(!E||E.role!==`admin`){Z(`คุณไม่มีสิทธิ์ในการดำเนินการนี้`);return}if(K!==E.password){Z(`รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง`);return}Y(!0),Z(``);try{await ne(),G(!1),q(``),t(),alert(`รีเซ็ตฐานข้อมูลทั้งหมดเป็นค่าเริ่มต้นสำเร็จเรียบร้อยแล้ว`)}catch(e){Z(`เกิดข้อผิดพลาดในการรีเซ็ตระบบ: ${e.message}`)}finally{Y(!1)}},disabled:J||!K,style:{display:`flex`,alignItems:`center`,gap:`0.35rem`,minWidth:`140px`,justifyContent:`center`},children:J?(0,y.jsx)(y.Fragment,{children:`กำลังรีเซ็ตระบบ...`}):(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(u,{size:14}),` ยืนยันการรีเซ็ตระบบ`]})})]})]})}),(0,y.jsx)(`style`,{children:`
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