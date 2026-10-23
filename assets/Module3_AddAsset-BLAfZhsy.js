import{r as e}from"./rolldown-runtime-BHe-jwch.js";import{B as t,E as n,G as r,K as i,Nt as a,T as o,_t as s,ct as c,et as l,g as u,lt as d,m as f,rt as p,st as ee}from"./vendor-icons-qVqAK2Qz.js";import{n as m}from"./vendor-react-BkSsXNgQ.js";import{f as te,h,r as ne}from"./index-_8aBPxCd.js";import{t as g}from"./vendor-excel-DH20LHZs.js";var _=e(a(),1),v=e(g(),1),y=m(),b=({assets:e,onAddAsset:a,onBulkAddAssets:m,onLogAudit:g,prefilledAssetId:b,clearPrefilledAssetId:x,setCurrentTab:re,departments:S,currentUser:C})=>{let[w,T]=(0,_.useState)(``),[ie,ae]=(0,_.useState)(``),[oe,se]=(0,_.useState)(()=>new Date().toISOString().split(`T`)[0]),[ce,le]=(0,_.useState)(``),[E,D]=(0,_.useState)(``),[O,k]=(0,_.useState)(``),[ue,de]=(0,_.useState)(``),[fe,pe]=(0,_.useState)(``),[me,he]=(0,_.useState)(`ใช้งานได้`),[A,ge]=(0,_.useState)(!1),[_e,j]=(0,_.useState)(null),[ve,M]=(0,_.useState)(null),N=(0,_.useRef)(null),P=(0,_.useRef)(null),[F,I]=(0,_.useState)(!1),[ye,L]=(0,_.useState)(null),[be,xe]=(0,_.useState)(!1),Se=C?.role===`admin`||C?.role===`head`||C?.role===`operator`;C?.role;let[R,z]=(0,_.useState)(()=>C?.role===`manager`?`report`:`single`),[B,Ce]=(0,_.useState)(()=>C?.role===`head`||C?.role===`operator`||C?.role===`user`?C.department:`all`),[V,we]=(0,_.useState)(()=>{let e=new Date;return e.setDate(e.getDate()-30),e.toISOString().split(`T`)[0]}),[H,Te]=(0,_.useState)(()=>new Date().toISOString().split(`T`)[0]),[Ee,De]=(0,_.useState)(!1);(0,_.useEffect)(()=>{(C?.role===`head`||C?.role===`operator`||C?.role===`user`)&&Ce(C.department)},[C]);let[U,W]=(0,_.useState)(``),[Oe,G]=(0,_.useState)(``),[K,ke]=(0,_.useState)(``),[q,Ae]=(0,_.useState)(new Map),[J,je]=(0,_.useState)(new Map),[Me,Ne]=(0,_.useState)(null),Pe={id:0,name:1,receivedDate:2,source:3,location:4,department:5,responsiblePerson:6,note:7,status:8,imageUrl:9},Fe=e=>{let t={...Pe};return e.forEach((e,n)=>{let r=e.trim().toLowerCase();r&&(/รหัส|id|code|asset_id|assetid|หมายเลขครุภัณฑ์/i.test(r)?t.id=n:/ชื่อ|name|asset_name|assetname|รายการครุภัณฑ์|รายการ/i.test(r)?t.name=n:/วันที่|date|receive|ตรวจรับ|รับเข้า/i.test(r)?t.receivedDate=n:/ผู้จำหน่าย|ที่มา|source|vendor|supplier|ผู้ขาย|บริจาค/i.test(r)?t.source=n:/สถานที่|ห้อง|location|room|place|อาคาร/i.test(r)?t.location=n:/ฝ่าย|หน่วยงาน|department|dept|แผนก/i.test(r)?t.department=n:/ผู้รับผิดชอบ|ผู้ดูแล|responsible|owner|officer|ผู้ครอบครอง/i.test(r)?t.responsiblePerson=n:/หมายเหตุ|รายละเอียด|note|remark|description|detail|spec|สเปค/i.test(r)?t.note=n:/สถานะ|status|state/i.test(r)?t.status=n:/รูป|image|photo|pic|url|ภาพถ่าย/i.test(r)&&(t.imageUrl=n))}),t},[Y,X]=(0,_.useState)([]),[Z,Ie]=(0,_.useState)(`all`),[Le,Re]=(0,_.useState)(!1),[ze,Be]=(0,_.useState)(0),Ve=e=>e.trim().toUpperCase().replace(/[^A-Z0-9]/g,``),He=e=>{if(!e.target.files||e.target.files.length===0)return;let t=new Map(q);Array.from(e.target.files).forEach(e=>{if(!e.type.startsWith(`image/`))return;let n=Ve(e.name.substring(0,e.name.lastIndexOf(`.`))||e.name);n&&t.set(n,{file:e,previewUrl:URL.createObjectURL(e)})}),Ae(t)},Ue=(e,t)=>{let n=new Map(J);n.set(e,{file:t,previewUrl:URL.createObjectURL(t)}),je(n)},We=e=>{if(J.has(e.rowNum))return{previewUrl:J.get(e.rowNum).previewUrl,file:J.get(e.rowNum).file,source:`manual`};let t=Ve(e.id);return t&&q.has(t)?{previewUrl:q.get(t).previewUrl,file:q.get(t).file,source:`matched`}:e.imageUrl?{previewUrl:e.imageUrl,file:null,source:`url`}:null},Ge=e=>{if(!e)return new Date().toISOString().split(`T`)[0];if(e instanceof Date&&!isNaN(e.getTime()))return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`;let t=String(e).trim();if(!t)return new Date().toISOString().split(`T`)[0];let n=t.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);if(n){let e=parseInt(n[1],10),t=parseInt(n[2],10),r=parseInt(n[3],10);r>2400&&(r-=543);let i=String(e).padStart(2,`0`),a=String(t).padStart(2,`0`);return`${r}-${a}-${i}`}let r=t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);if(r){let e=parseInt(r[1],10),t=parseInt(r[2],10),n=parseInt(r[3],10);e>2400&&(e-=543);let i=String(n).padStart(2,`0`),a=String(t).padStart(2,`0`);return`${e}-${a}-${i}`}if(!isNaN(Number(t))&&Number(t)>3e4&&Number(t)<6e4){let e=new Date(new Date(1899,11,30).getTime()+Number(t)*864e5);if(!isNaN(e.getTime()))return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}let i=new Date(t);return isNaN(i.getTime())?new Date().toISOString().split(`T`)[0]:`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,`0`)}-${String(i.getDate()).padStart(2,`0`)}`},Ke=async()=>{try{let e=new v.default.Workbook;e.creator=`AssetWatch`,e.created=new Date;let t=e.addWorksheet(`Asset_Template`,{views:[{state:`frozen`,ySplit:1}]}),n=e.addWorksheet(`Lists`);n.state=`hidden`;let r=S&&S.length>0?S.map(e=>e.name):[`ฝ่ายบริหารทั่วไป`,`ฝ่ายไอที`,`ฝ่ายพัสดุและคลัง`],i=new Set;(S||[]).forEach(e=>{(e.locations||[]).forEach(e=>{e&&e.trim()&&i.add(e.trim())})});let a=i.size>0?Array.from(i):[`ห้องสำนักงาน 101`,`ห้องธุรการ`,`ห้องเซิร์ฟเวอร์`,`ห้องประชุมใหญ่`],o=[`ใช้งานได้`,`ชำรุด`,`รอจำหน่าย`,`ขอป้ายรหัสใหม่`,`รอโอน`,`อื่นๆ`];r.forEach((e,t)=>{n.getCell(`A${t+1}`).value=e}),a.forEach((e,t)=>{n.getCell(`B${t+1}`).value=e}),o.forEach((e,t)=>{n.getCell(`C${t+1}`).value=e}),t.columns=[{header:`รหัสครุภัณฑ์ (id)`,key:`id`,width:22},{header:`ชื่อครุภัณฑ์ (name)`,key:`name`,width:40},{header:`วันที่ตรวจรับ (receivedDate DD-MM-YYYY)`,key:`receivedDate`,width:34},{header:`ผู้จำหน่าย/ที่มา (source)`,key:`source`,width:32},{header:`สถานที่จัดเก็บ (location)`,key:`location`,width:28},{header:`ฝ่าย/หน่วยงาน (department)`,key:`department`,width:28},{header:`ผู้รับผิดชอบ (responsiblePerson)`,key:`responsiblePerson`,width:24},{header:`หมายเหตุ/สเปค (note)`,key:`note`,width:35},{header:`สถานะ (status)`,key:`status`,width:18},{header:`URLรูปภาพ (imageUrl)`,key:`imageUrl`,width:30}];let s=t.getRow(1);s.height=28,s.eachCell(e=>{e.font={bold:!0,color:{argb:`FFFFFFFF`},size:11},e.fill={type:`pattern`,pattern:`solid`,fgColor:{argb:`FF1E40AF`}},e.alignment={vertical:`middle`,horizontal:`center`},e.border={top:{style:`thin`,color:{argb:`FFCBD5E1`}},left:{style:`thin`,color:{argb:`FFCBD5E1`}},bottom:{style:`medium`,color:{argb:`FF1E3A8A`}},right:{style:`thin`,color:{argb:`FFCBD5E1`}}}});let c=C?.department||r[0]||`ฝ่ายบริหารทั่วไป`,l=a[0]||`ห้องสำนักงาน 101`;[{id:`6901-001-0001`,name:`คอมพิวเตอร์ All-in-One Dell OptiPlex`,receivedDate:`03-06-2026`,source:`บริษัท เอ บี ซี คอมพิวเตอร์ จำกัด`,location:l,department:c,responsiblePerson:`นายสมจิต รอดพ้น`,note:`Intel Core i7 RAM 16GB SSD 512GB`,status:`ใช้งานได้`,imageUrl:``},{id:`6901-001-0002`,name:`เครื่องพิมพ์ Laser Multifunction HP`,receivedDate:`05-06-2026`,source:`หจก. พีเจ เซอร์วิส แอนด์ ซัพพลาย`,location:a[1]||l,department:c,responsiblePerson:`นางสาวสุนิสา ใจดี`,note:`รองรับ Wi-Fi และพิมพ์สองหน้าอัตโนมัติ`,status:`ใช้งานได้`,imageUrl:``},{id:`6901-002-0001`,name:`เก้าอี้สำนักงานเพื่อสุขภาพ Ergonomic`,receivedDate:`10-06-2026`,source:`บริษัท ออฟฟิศ ดีไซน์ จำกัด`,location:a[2]||l,department:c,responsiblePerson:`นายประดิษฐ์ มั่นคง`,note:`พนักพิงตาข่าย ปรับระดับได้ สีดำ`,status:`ใช้งานได้`,imageUrl:``}].forEach(e=>t.addRow(e));for(let e=2;e<=500;e++){let n=t.getRow(e),i=n.getCell(3);i.numFmt=`@`,i.alignment={horizontal:`center`,vertical:`middle`},i.dataValidation={type:`custom`,allowBlank:!0,formulae:[`ISNUMBER(VALUE(SUBSTITUTE(C`+e+`,"-","/")))`],showErrorMessage:!1,showInputMessage:!0,promptTitle:`📅 วันที่ตรวจรับ (DD-MM-YYYY)`,prompt:`ป้อนวันที่ในรูปแบบ วัน-เดือน-ปี ค.ศ. เช่น 03-06-2026 หรือ 25-12-2025`};let s=n.getCell(5);s.dataValidation={type:`list`,allowBlank:!0,formulae:[`Lists!$B$1:$B$${a.length}`],showErrorMessage:!0,errorTitle:`สถานที่จัดเก็บไม่ถูกต้อง`,error:`กรุณาเลือกสถานที่จัดเก็บจากรายการ Dropdown หรือระบุชื่อห้องให้ถูกต้อง`,showInputMessage:!0,promptTitle:`📍 เลือกสถานที่จัดเก็บ (Location)`,prompt:`คลิกลูกศร Dropdown เพื่อเลือกห้อง/สถานที่ตั้งจากโมดูลจัดการหน่วยงาน (Module 8)`};let c=n.getCell(6);c.dataValidation={type:`list`,allowBlank:!0,formulae:[`Lists!$A$1:$A$${r.length}`],showErrorMessage:!0,errorTitle:`ฝ่าย/หน่วยงานไม่ถูกต้อง`,error:`กรุณาเลือกฝ่าย/หน่วยงานจากรายการ Dropdown หรือระบุชื่อฝ่ายให้ถูกต้อง`,showInputMessage:!0,promptTitle:`🏢 เลือกฝ่าย/หน่วยงาน (Department)`,prompt:`คลิกลูกศร Dropdown เพื่อเลือกฝ่าย/หน่วยงานจากโมดูลจัดการหน่วยงาน (Module 8)`};let l=n.getCell(9);l.dataValidation={type:`list`,allowBlank:!0,formulae:[`Lists!$C$1:$C$${o.length}`],showErrorMessage:!0,errorTitle:`สถานะไม่ถูกต้อง`,error:`กรุณาเลือกสถานะจากรายการ Dropdown เช่น ใช้งานได้, ชำรุด, รอจำหน่าย`,showInputMessage:!0,promptTitle:`🏷️ สถานะครุภัณฑ์ (Status)`,prompt:`คลิกลูกศร Dropdown เพื่อเลือกสถานะ`}}let u=await e.xlsx.writeBuffer(),d=new Blob([u],{type:`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`}),f=URL.createObjectURL(d),p=document.createElement(`a`);p.setAttribute(`href`,f),p.setAttribute(`download`,`AssetWatch_Import_Template.xlsx`),p.style.visibility=`hidden`,document.body.appendChild(p),p.click(),document.body.removeChild(p),URL.revokeObjectURL(f)}catch(e){console.error(`Error generating Excel template:`,e),alert(`เกิดข้อผิดพลาดในการสร้างไฟล์ Excel เทมเพลต`)}},qe=()=>{let e=[`รหัสครุภัณฑ์ (id)`,`ชื่อครุภัณฑ์ (name)`,`วันที่ตรวจรับ (receivedDate DD-MM-YYYY)`,`ผู้จำหน่าย/ที่มา (source)`,`สถานที่จัดเก็บ (location)`,`ฝ่าย/หน่วยงาน (department)`,`ผู้รับผิดชอบ (responsiblePerson)`,`หมายเหตุ/สเปค (note)`,`สถานะ (status)`,`URLรูปภาพ (imageUrl)`],t=C?.department||S[0]?.name||`ฝ่ายไอที`,n=S[0]?.locations[0]||`ห้องสำนักงาน 201`,r=[[`6901-001-0001`,`คอมพิวเตอร์ All-in-One Dell OptiPlex`,`03-06-2026`,`บริษัท เอ บี ซี คอมพิวเตอร์ จำกัด`,n,t,`นายสมจิต รอดพ้น`,`Intel Core i7 RAM 16GB SSD 512GB`,`ใช้งานได้`,``],[`6901-001-0002`,`เครื่องพิมพ์ Laser Multifunction HP`,`05-06-2026`,`หจก. พีเจ เซอร์วิส แอนด์ ซัพพลาย`,n,t,`นางสาวสุนิสา ใจดี`,`รองรับ Wi-Fi และพิมพ์สองหน้าอัตโนมัติ`,`ใช้งานได้`,``],[`6901-002-0001`,`เก้าอี้สำนักงานเพื่อสุขภาพ Ergonomic`,`10-06-2026`,`บริษัท ออฟฟิศ ดีไซน์ จำกัด`,n,t,`นายประดิษฐ์ มั่นคง`,`พนักพิงตาข่าย ปรับระดับได้ สีดำ`,`ใช้งานได้`,``]],i=e=>e.includes(`,`)||e.includes(`"`)||e.includes(`
`)?`"${e.replace(/"/g,`""`)}"`:e,a=`﻿`+[e.map(i).join(`,`),...r.map(e=>e.map(i).join(`,`))].join(`\r
`),o=new Blob([a],{type:`text/csv;charset=utf-8;`}),s=URL.createObjectURL(o),c=document.createElement(`a`);c.setAttribute(`href`,s),c.setAttribute(`download`,`AssetWatch_Import_Template.csv`),c.style.visibility=`hidden`,document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(s)},Je=(e,t)=>{let n=[],r=``,i=!1;for(let a=0;a<e.length;a++){let o=e[a];o===`"`?i=!i:o===t&&!i?(n.push(r.trim().replace(/^"|"$/g,``)),r=``):r+=o}return n.push(r.trim().replace(/^"|"$/g,``)),n},Ye=(e,t)=>{if(!e.trim())return[];let n=e.split(/\r?\n/).filter(e=>e.trim()!==``);if(n.length===0)return[];let r=`,`;r=n[0].includes(`	`)?`	`:n[0].includes(`;`)?`;`:`,`;let i=0,a=Je(n[0],r),o=n[0].toLowerCase(),s=o.includes(`id`)||o.includes(`name`)||o.includes(`รหัส`)||o.includes(`ชื่อ`)||o.includes(`received`)||o.includes(`date`)||o.includes(`ฝ่าย`)||o.includes(`สถานที่`),c=Pe;s&&(i=1,c=Fe(a));let l=[];for(let e=i;e<n.length;e++){let t=n[e],i=Je(t,r);if(i.length>0&&i.some(e=>e.trim()!==``)){let t=[i[c.id]||``,i[c.name]||``,i[c.receivedDate]||``,i[c.source]||``,i[c.location]||``,i[c.department]||``,i[c.responsiblePerson]||``,i[c.note]||``,i[c.status]||``,i[c.imageUrl]||``];l.push({index:e+1,values:t})}}return l},Xe=(e,t,n,r,i)=>{let a=[],o=[],s=(t[0]||``).trim(),c=(t[1]||``).trim(),l=(t[2]||``).trim(),u=(t[3]||``).trim(),d=(t[4]||``).trim(),f=(t[5]||``).trim(),p=(t[6]||``).trim(),ee=(t[7]||``).trim(),m=(t[8]||``).trim(),te=(t[9]||``).trim(),h=s.toUpperCase();h?(i.has(h)?a.push(`รหัสครุภัณฑ์ซ้ำกันในข้อมูลชุดนี้ (${h})`):i.add(h),n.some(e=>e.id===h)&&a.push(`รหัสครุภัณฑ์นี้ถูกลงทะเบียนไว้ในระบบแล้ว (${h})`)):a.push(`รหัสครุภัณฑ์ต้องไม่ว่าง`);let ne=c;ne||a.push(`ชื่อครุภัณฑ์ต้องไม่ว่าง`);let g=``;if(!l)g=new Date().toISOString().split(`T`)[0],o.push(`ไม่ได้ระบุวันที่ตรวจรับ (ระบบจะใช้วันนี้: ${g})`);else{g=Ge(l);let e=new Date(g);isNaN(e.getTime())&&(g=new Date().toISOString().split(`T`)[0],o.push(`รูปแบบวันที่ไม่ถูกต้อง (ระบบจะใช้วันนี้: ${g})`))}let _=u||`ไม่ระบุ/บริจาค`;u||o.push(`ไม่ได้ระบุผู้จำหน่าย (ตั้งค่าเป็น: 'ไม่ระบุ/บริจาค')`);let v=f,y=C?.role===`head`||C?.role===`operator`||C?.role===`user`,b=C?.department;y&&b?v?(v||``).toLowerCase()!==(b||``).toLowerCase()&&(v=b,o.push(`ปรับฝ่ายเป็น '${b}' อัตโนมัติ (ท่านมีสิทธิ์ขึ้นทะเบียนเฉพาะฝ่ายตนเอง)`)):(v=b,o.push(`กำหนดฝ่ายเป็น '${b}' อัตโนมัติตามสิทธิ์ของท่าน`)):v?!r.some(e=>(e.name||``).toLowerCase()===(v||``).toLowerCase())&&r.length>0&&o.push(`ฝ่าย '${v}' ไม่พบในโมดูลจัดการหน่วยงาน (จะบันทึกเป็นฝ่ายใหม่)`):(v=r[0]?.name||`ฝ่ายบริหารทั่วไป`,o.push(`ไม่ได้ระบุฝ่ายที่ดูแล (ตั้งค่าเป็น: '${v}')`));let x=d;if(!x)x=`คลังพัสดุกลาง`,o.push(`ไม่ได้ระบุสถานที่ตั้ง (ตั้งค่าเป็น: 'คลังพัสดุกลาง')`);else{let e=r.find(e=>(e.name||``).toLowerCase()===(v||``).toLowerCase());e&&!(e.locations||[]).some(e=>(e||``).toLowerCase()===(x||``).toLowerCase())&&e.locations.length>0&&o.push(`ไม่พบห้อง '${x}' ในฝ่าย '${v}' ของระบบ (จะบันทึกเป็นห้องใหม่)`)}let re=p||`ไม่มี`;p||o.push(`ไม่ได้ระบุผู้รับผิดชอบ (ตั้งค่าเป็น: 'ไม่มี')`);let S=ee||`-`,w=[`ใช้งานได้`,`รอจำหน่าย`,`ชำรุด`,`ขอป้ายรหัสใหม่`,`รอโอน`,`อื่นๆ`],T=`ใช้งานได้`;return m?w.includes(m)?T=m:o.push(`สถานะ '${m}' ไม่ถูกต้องในระบบ (ปรับเป็น: 'ใช้งานได้')`):o.push(`ไม่ได้ระบุสถานะ (ตั้งค่าเป็น: 'ใช้งานได้')`),{rowNum:e,id:h,name:ne,receivedDate:g,source:_,location:x,department:v,responsiblePerson:re,note:S,status:T,imageUrl:te||void 0,errors:a,warnings:o,isValid:a.length===0}};(0,_.useEffect)(()=>{if(U){let t=Ye(U,!0),n=new Set;X(t.map(t=>Xe(t.index,t.values,e,S,n)))}},[U,e,S]);let Ze=async t=>{let n=t.target.files?.[0];if(!n)return;if(ke(n.name),W(``),n.name.endsWith(`.xlsx`)||n.name.endsWith(`.xls`)){try{let t=await n.arrayBuffer(),r=new v.default.Workbook;await r.xlsx.load(t);let i=r.worksheets[0],a=[];if(i.eachRow({includeEmpty:!1},e=>{let t=[];e.eachCell({includeEmpty:!0},(e,n)=>{let r=``;e.value!==null&&e.value!==void 0&&(r=e.value instanceof Date?Ge(e.value):typeof e.value==`object`&&`result`in e.value?String(e.value.result||``):typeof e.value==`object`&&`text`in e.value?String(e.value.text||``):String(e.value)),t[n-1]=r.trim()}),a.push(t)}),a.length===0){X([]);return}let o=0,s=a[0],c=s.join(` `).toLowerCase(),l=c.includes(`id`)||c.includes(`name`)||c.includes(`รหัส`)||c.includes(`ชื่อ`)||c.includes(`received`)||c.includes(`date`)||c.includes(`ฝ่าย`)||c.includes(`สถานที่`),u=Pe;l&&(o=1,u=Fe(s));let d=[];for(let e=o;e<a.length;e++){let t=a[e];if(t.length>0&&t.some(e=>e&&e.trim()!==``)){let n=[t[u.id]||``,t[u.name]||``,t[u.receivedDate]||``,t[u.source]||``,t[u.location]||``,t[u.department]||``,t[u.responsiblePerson]||``,t[u.note]||``,t[u.status]||``,t[u.imageUrl]||``];d.push({index:e+1,values:n})}}let f=new Set,p=d.map(t=>Xe(t.index,t.values,e,S,f));X(p),G(`[นำเข้าจากไฟล์ Excel: ${n.name} จำนวน ${p.length} รายการ]`)}catch(e){console.error(`Error reading Excel file:`,e),alert(`เกิดข้อผิดพลาดในการอ่านไฟล์ Excel กรุณาตรวจสอบไฟล์`)}return}let r=new FileReader;r.onload=t=>{let n=t.target?.result;G(n);let r=Ye(n,!1),i=new Set;X(r.map(t=>Xe(t.index,t.values,e,S,i)))},r.readAsText(n,`UTF-8`)},Q=()=>{W(``),G(``),ke(``),X([]),Ae(new Map),je(new Map),Re(!1),Be(0)},Qe=async e=>{if(e.preventDefault(),C?.role===`manager`){alert(`ผู้บริหาร (Manager) มีสิทธิ์เฉพาะการดูข้อมูลและรายงาน ไม่สามารถนำเข้าข้อมูลพัสดุได้`);return}let t=Y.filter(e=>e.isValid);if(t.length!==0){I(!0),L(null),Ne({current:0,total:t.length});try{let e=C?`${C.name} (${C.role===`admin`?`แอดมิน`:C.role===`head`?`หัวหน้าฝ่าย`:`เจ้าหน้าที่`})`:localStorage.getItem(`assetwatch_operator`)||`เจ้าหน้าที่`,n=[];for(let r=0;r<t.length;r++){let i=t[r];Ne({current:r+1,total:t.length});let a=We(i),o=i.imageUrl||`https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60`;if(a&&a.file)try{o=await te(a.file,`assets`)}catch(e){console.error(`Compression/Upload failed for row ${i.rowNum}:`,e)}n.push({id:i.id,name:i.name,imageUrl:o,receivedDate:i.receivedDate,source:i.source,location:i.location,department:i.department,responsiblePerson:i.responsiblePerson,note:i.note,status:i.status,createdBy:C?.username||C?.name||e,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})}await m(n),await g({assetId:`SYSTEM`,assetName:`นำเข้าแบบกลุ่ม: ${n.length} รายการ`,action:`create`,operator:e,details:`${e} ทำการนำเข้าข้อมูลครุภัณฑ์แบบกลุ่มสำเร็จ จำนวน ${n.length} รายการ (พร้อมประมวลผลและบีบอัดรูปภาพพัสดุ)`}),Be(n.length),Re(!0)}catch(e){console.error(e),L(e.message||`เกิดข้อผิดพลาดระหว่างนำเข้าข้อมูลแบบกลุ่ม`)}finally{I(!1),Ne(null)}}};(0,_.useEffect)(()=>{b&&T(b)},[b]),(0,_.useEffect)(()=>{if(C?.role===`head`||C?.role===`operator`||C?.role===`user`){ge(!1),k(C.department);let e=S.find(e=>e.name===C.department);e&&e.locations.length>0&&(!E||!e.locations.includes(E))&&D(e.locations[0])}else S.length>0&&!A&&(O||(k(S[0].name),S[0].locations.length>0&&D(S[0].locations[0])))},[S,A,O,C,E]);let $e=()=>{T(`${String(new Date().getFullYear()+543).slice(-2)}01-${Math.floor(100+Math.random()*900)}-${Math.floor(1e3+Math.random()*9e3)}`)},et=async e=>{if(e.target.files&&e.target.files[0]){let t=e.target.files[0];try{let e=await ne(t,1400,1400,.8);j(e);let n=new FileReader;n.onloadend=()=>{M(n.result)},n.readAsDataURL(e)}catch{j(t);let e=new FileReader;e.onloadend=()=>{M(e.result)},e.readAsDataURL(t)}}},tt=async e=>{if(e.preventDefault(),C?.role===`manager`){alert(`ผู้บริหาร (Manager) มีสิทธิ์เฉพาะการดูข้อมูลและรายงาน ไม่สามารถลงทะเบียนพัสดุใหม่ได้`);return}L(null),I(!0);try{let e=``;e=_e?await te(_e,`assets`):`https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60`;let t=localStorage.getItem(`assetwatch_operator`)||`แอดมินพัสดุ`,n={id:w.trim().toUpperCase(),name:ie.trim(),imageUrl:e,receivedDate:oe,source:ce.trim(),location:E.trim()||`คลังพัสดุกลาง`,department:O.trim()||`ฝ่ายพัสดุหลัก`,responsiblePerson:ue.trim()||`ไม่มี`,note:fe.trim(),status:me,createdBy:C?.username||C?.name||t,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};await a(n),await g({assetId:n.id,assetName:n.name,action:`create`,operator:t,details:`ขึ้นทะเบียนครุภัณฑ์รหัสใหม่ ผู้ขาย/ผู้บริจาค: ${n.source} ตั้งที่: ${n.location}`}),xe(!0),x()}catch(e){console.error(e),L(e.message||`รหัสครุภัณฑ์ซ้ำหรือเซิร์ฟเวอร์เกิดปัญหา โปรดกรอกข้อมูลให้ครบถ้วน`)}finally{I(!1)}},$=()=>{T(``),ae(``),j(null),M(null),D(``),k(``),de(``),pe(``),xe(!1),L(null)};return Le?(0,y.jsx)(`div`,{className:`module-container animate-fade-in`,children:(0,y.jsxs)(`div`,{className:`success-wizard-card glass-panel text-center`,children:[(0,y.jsx)(`div`,{className:`success-checkmark-wrapper`,children:(0,y.jsx)(c,{size:44,color:`var(--success)`})}),(0,y.jsx)(`h2`,{children:`นำเข้าข้อมูลแบบกลุ่มสำเร็จ!`}),(0,y.jsxs)(`p`,{children:[`ระบบได้ทำการลงทะเบียนและบันทึกครุภัณฑ์จำนวน `,(0,y.jsx)(`strong`,{style:{color:`var(--success)`,fontSize:`1.2rem`},children:ze}),` รายการ เรียบร้อยแล้ว`]}),(0,y.jsxs)(`div`,{className:`success-card-actions`,children:[(0,y.jsx)(`button`,{className:`btn btn-secondary`,onClick:()=>re(`module1`),children:`เปิดดูบัญชีคลัง (Module 1)`}),(0,y.jsx)(`button`,{className:`btn btn-primary`,onClick:Q,children:`นำเข้าข้อมูลชุดอื่นเพิ่มเติม`})]})]})}):be?(0,y.jsx)(`div`,{className:`module-container animate-fade-in`,children:(0,y.jsxs)(`div`,{className:`success-wizard-card glass-panel text-center`,children:[(0,y.jsx)(`div`,{className:`success-checkmark-wrapper`,children:(0,y.jsx)(c,{size:44,color:`var(--success)`})}),(0,y.jsx)(`h2`,{children:`ขึ้นทะเบียนครุภัณฑ์สำเร็จ!`}),(0,y.jsxs)(`p`,{children:[`ทรัพย์สินรหัส `,(0,y.jsx)(`code`,{children:w}),` ได้รับการขึ้นทะเบียนบัญชีควบคุมและบันทึกลงในคลาวด์เรียบร้อยแล้ว`]}),(0,y.jsxs)(`div`,{className:`success-intake-details`,children:[(0,y.jsxs)(`div`,{className:`intake-detail-line`,children:[(0,y.jsx)(`span`,{children:`ชื่ออุปกรณ์:`}),` `,(0,y.jsx)(`strong`,{children:ie})]}),(0,y.jsxs)(`div`,{className:`intake-detail-line`,children:[(0,y.jsx)(`span`,{children:`รหัสครุภัณฑ์:`}),` `,(0,y.jsx)(`code`,{children:w})]}),(0,y.jsxs)(`div`,{className:`intake-detail-line`,children:[(0,y.jsx)(`span`,{children:`สถานที่ติดตั้ง:`}),` `,(0,y.jsxs)(`span`,{children:[`📍 `,E||`คลังพัสดุกลาง`]})]})]}),(0,y.jsxs)(`div`,{className:`success-card-actions`,children:[(0,y.jsx)(`button`,{className:`btn btn-secondary`,onClick:()=>re(`module1`),children:`เปิดดูบัญชีคลัง (Module 1)`}),(0,y.jsx)(`button`,{className:`btn btn-primary`,onClick:$,children:`ลงทะเบียนเครื่องอื่นถัดไป`})]})]})}):(0,y.jsxs)(`div`,{className:`module-container animate-fade-in`,children:[(0,y.jsxs)(`div`,{className:`module-title-section`,children:[(0,y.jsx)(`h2`,{children:`ขึ้นทะเบียนรับครุภัณฑ์ใหม่เข้าคลัง (Module 3)`}),(0,y.jsx)(`p`,{children:`บันทึกประวัติการรับมอบ ค้นหาภาพถ่าย อ้างอิงสัญญาสั่งซื้อพร้อมออกรหัสคุมบาร์โค้ด`})]}),(0,y.jsxs)(`div`,{className:`sub-tabs-container`,children:[(0,y.jsx)(`button`,{type:`button`,className:`sub-tab ${R===`single`?`active`:``}`,onClick:()=>{z(`single`),$(),Q()},children:`✍️ ลงทะเบียนทีละชิ้น (Single Registration)`}),Se&&(0,y.jsx)(`button`,{type:`button`,className:`sub-tab ${R===`mass`?`active`:``}`,onClick:()=>{z(`mass`),$(),Q()},children:`📥 ขึ้นทะเบียนแบบกลุ่ม (Mass / Batch Import)`}),(0,y.jsx)(`button`,{type:`button`,className:`sub-tab ${R===`report`?`active`:``}`,onClick:()=>{z(`report`),$(),Q()},children:`🖨️ รายงานครุภัณฑ์ลงทะเบียนใหม่ (Report)`})]}),R===`single`?(0,y.jsxs)(`form`,{onSubmit:tt,className:`intake-form glass-panel`,children:[(0,y.jsxs)(`div`,{className:`form-row-double`,children:[(0,y.jsxs)(`div`,{className:`form-group flex-1`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`🏷️ รหัสครุภัณฑ์ (สแกนจากบาร์โค้ด หรือ กดสุ่มสร้าง)`}),(0,y.jsxs)(`div`,{className:`input-with-action`,children:[(0,y.jsx)(`input`,{type:`text`,className:`form-input code-input-field`,placeholder:`เช่น 6901-001-0001`,value:w,onChange:e=>T(e.target.value),required:!0}),(0,y.jsxs)(`button`,{type:`button`,className:`btn btn-secondary btn-sm-action`,onClick:$e,title:`สุ่มสร้างรหัสบาร์โค้ด`,children:[(0,y.jsx)(o,{size:16}),` สุ่มสร้างรหัส`]})]})]}),(0,y.jsxs)(`div`,{className:`form-group flex-1`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`🖥️ ชื่อครุภัณฑ์ (ภาษาไทยหรืออังกฤษ)`}),(0,y.jsx)(`input`,{type:`text`,className:`form-input`,placeholder:`เช่น คอมพิวเตอร์ All-in-One Dell Inspiron...`,value:ie,onChange:e=>ae(e.target.value),required:!0})]})]}),(0,y.jsxs)(`div`,{className:`form-group`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`📸 ถ่ายรูป หรือ แนบเอกสาร PDF/รูปภาพครุภัณฑ์ (บีบอัด HD อัตโนมัติ)`}),(0,y.jsxs)(`div`,{className:`survey-upload-trigger`,children:[(0,y.jsx)(`input`,{ref:N,type:`file`,id:`asset-camera-picker`,accept:`image/*`,capture:`environment`,className:`file-hidden-input`,onChange:et}),(0,y.jsx)(`input`,{ref:P,type:`file`,id:`asset-doc-picker`,accept:`image/*,application/pdf,.pdf`,className:`file-hidden-input`,onChange:et}),ve?(0,y.jsxs)(`div`,{className:`preview-image-card`,children:[(0,y.jsx)(`div`,{className:`preview-image-box`,children:(0,y.jsx)(`img`,{src:ve,alt:`Intake asset preview`})}),(0,y.jsxs)(`div`,{className:`preview-action-row`,children:[(0,y.jsxs)(`button`,{type:`button`,className:`btn-preview-action`,onClick:()=>N.current?.click(),title:`ถ่ายใหม่ด้วยกล้องหลัง`,children:[(0,y.jsx)(s,{size:13,color:`#10b981`}),` ถ่ายใหม่ (กล้อง)`]}),(0,y.jsxs)(`button`,{type:`button`,className:`btn-preview-action`,onClick:()=>P.current?.click(),title:`เลือกเอกสารหรือรูปภาพใหม่`,children:[(0,y.jsx)(r,{size:13,color:`#3b82f6`}),` เปลี่ยนไฟล์ (เอกสาร)`]}),(0,y.jsxs)(`button`,{type:`button`,className:`btn-preview-action btn-preview-delete`,onClick:()=>{j(null),M(null),N.current&&(N.current.value=``),P.current&&(P.current.value=``)},title:`ลบรูปภาพ`,children:[(0,y.jsx)(f,{size:13}),` ลบไฟล์`]})]})]}):(0,y.jsxs)(`div`,{className:`upload-choice-grid`,children:[(0,y.jsxs)(`button`,{type:`button`,className:`upload-choice-card`,onClick:()=>N.current?.click(),children:[(0,y.jsx)(`div`,{className:`upload-choice-icon-bubble camera-bubble`,children:(0,y.jsx)(s,{size:26})}),(0,y.jsxs)(`div`,{className:`upload-choice-info`,children:[(0,y.jsx)(`span`,{className:`upload-choice-main`,children:`ถ่ายภาพทันที`}),(0,y.jsx)(`span`,{className:`upload-choice-sub`,children:`เปิดกล้องหลัง`})]})]}),(0,y.jsxs)(`button`,{type:`button`,className:`upload-choice-card`,onClick:()=>P.current?.click(),children:[(0,y.jsx)(`div`,{className:`upload-choice-icon-bubble doc-bubble`,children:(0,y.jsx)(r,{size:26})}),(0,y.jsxs)(`div`,{className:`upload-choice-info`,children:[(0,y.jsx)(`span`,{className:`upload-choice-main`,children:`แนบเอกสาร / ไฟล์`}),(0,y.jsx)(`span`,{className:`upload-choice-sub`,children:`PDF หรือ คลังภาพ`})]})]})]})]})]}),(0,y.jsxs)(`div`,{className:`form-row-double`,children:[(0,y.jsxs)(`div`,{className:`form-group flex-1`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`📅 วันที่เซ็นเอกสารตรวจรับ`}),(0,y.jsx)(`input`,{type:`date`,className:`form-input`,value:oe,onChange:e=>se(e.target.value),required:!0})]}),(0,y.jsxs)(`div`,{className:`form-group flex-1`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`🧾 ผู้จำหน่าย / ผู้ขาย / ผู้บริจาค`}),(0,y.jsx)(`input`,{type:`text`,className:`form-input`,placeholder:`เช่น บริษัท เอ บี ซี จำกัด, บริจาคโดยสมาคม...`,value:ce,onChange:e=>le(e.target.value),required:!0})]})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`0.35rem`,marginTop:`0.25rem`},children:[(0,y.jsx)(`span`,{style:{fontSize:`0.75rem`,fontWeight:650,color:`var(--text-muted)`},children:`📍 ฝ่ายจัดวางพัสดุและห้องติดตั้ง`}),(C?.role===`admin`||C?.role===`manager`)&&(0,y.jsx)(`button`,{type:`button`,className:`btn btn-ghost btn-xs`,onClick:()=>{let e=!A;ge(e),e?(k(``),D(``)):S.length>0&&(k(S[0].name),D(S[0].locations[0]||``))},style:{fontSize:`0.7rem`,padding:`0.25rem 0.5rem`,border:`1px solid var(--border)`,background:`var(--bg-secondary)`,height:`auto`,outline:`none`},children:A?`🏢 ใช้รายการระบบ`:`✍️ พิมพ์กรอกข้อมูลเอง`})]}),(0,y.jsxs)(`div`,{className:`grid-cols-3`,children:[A?(0,y.jsxs)(y.Fragment,{children:[(0,y.jsxs)(`div`,{className:`form-group`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`🏢 ฝ่าย/หน่วยงานที่ดูแลทรัพย์สิน`}),(0,y.jsx)(`input`,{type:`text`,className:`form-input`,placeholder:`พิมพ์ฝ่าย/แผนกใหม่...`,value:O,onChange:e=>k(e.target.value),required:!0})]}),(0,y.jsxs)(`div`,{className:`form-group`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`📍 สถานที่จัดเก็บ/ติดตั้งเริ่มต้น`}),(0,y.jsx)(`input`,{type:`text`,className:`form-input`,placeholder:`พิมพ์ห้องติดตั้งใหม่...`,value:E,onChange:e=>D(e.target.value),required:!0})]})]}):(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(h,{label:`🏢 ฝ่าย/หน่วยงานที่ดูแลทรัพย์สิน ${C?.role===`user`?`(ล็อคสิทธิ์ตามหน่วยงานของคุณ)`:``}`,options:S.map(e=>e.name),value:O,onChange:e=>{k(e);let t=S.find(t=>t.name===e);t&&t.locations.length>0?D(t.locations[0]):D(``)},disabled:C?.role===`head`||C?.role===`operator`||C?.role===`user`,required:!0,placeholder:`เลือกหน่วยงาน...`}),(0,y.jsx)(h,{label:`📍 สถานที่จัดเก็บ/ติดตั้งเริ่มต้น`,options:(()=>{let e=S.find(e=>e.name===O);return e?e.locations:[]})(),value:E,onChange:e=>D(e),required:!0,placeholder:`เลือกสถานที่ติดตั้ง...`})]}),(0,y.jsxs)(`div`,{className:`form-group`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`👤 ผู้ดูแล / เจ้าหน้าที่ผู้รับผิดชอบ`}),(0,y.jsx)(`input`,{type:`text`,className:`form-input`,placeholder:`เช่น นายสมจิต รอดพ้น`,value:ue,onChange:e=>de(e.target.value),required:!0})]})]}),(0,y.jsxs)(`div`,{className:`form-row-double`,children:[(0,y.jsxs)(`div`,{className:`form-group flex-1`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`🔍 สถานะเริ่มต้นครุภัณฑ์`}),(0,y.jsxs)(`select`,{className:`form-select`,value:me,onChange:e=>he(e.target.value),required:!0,children:[(0,y.jsx)(`option`,{value:`ใช้งานได้`,children:`ใช้งานได้ (ปกติ)`}),(0,y.jsx)(`option`,{value:`ชำรุด`,children:`ชำรุด (มีปัญหา)`}),(0,y.jsx)(`option`,{value:`ขอป้ายรหัสใหม่`,children:`ขอป้ายรหัสใหม่`}),(0,y.jsx)(`option`,{value:`รอโอน`,children:`รอโอน`})]})]}),(0,y.jsxs)(`div`,{className:`form-group flex-1`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`📝 โน้ตบันทึกข้อมูล / ชื่อเล่นเครื่องมือ (Note / Nickname)`}),(0,y.jsx)(`input`,{type:`text`,className:`form-input`,placeholder:`เช่น เครื่องเป่าอัด 1, ตู้นึ่ง AR-2, ปั๊มหลักตึก 5, สเปคเฉพาะ...`,value:fe,onChange:e=>pe(e.target.value)})]})]}),ye&&(0,y.jsxs)(`div`,{className:`alert alert-danger animate-fade-in`,children:[(0,y.jsx)(d,{size:20}),(0,y.jsx)(`span`,{children:ye})]}),(0,y.jsx)(`div`,{className:`form-actions-bar`,children:(0,y.jsx)(`button`,{type:`submit`,className:`btn btn-primary`,disabled:F,children:F?`กำลังอัปโหลดและลงทะเบียน...`:`➕ ลงทะเบียนประวัติรับของใหม่`})})]}):R===`mass`&&Se?(0,y.jsx)(`div`,{className:`intake-form glass-panel`,children:(0,y.jsxs)(`div`,{className:`mass-import-container animate-fade-in`,style:{display:`flex`,flexDirection:`column`,gap:`1.25rem`},children:[(0,y.jsxs)(`div`,{className:`glass-panel`,style:{padding:`1rem 1.25rem`,border:`1px solid var(--primary-light)`,borderRadius:`var(--radius-md)`,background:`rgba(59, 130, 246, 0.04)`,display:`flex`,flexDirection:`column`,gap:`0.6rem`},children:[(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,color:`var(--primary)`,fontWeight:800,fontSize:`0.9rem`},children:[(0,y.jsx)(u,{size:18}),`💡 คำแนะนำสั้นๆ: การนำเข้าข้อมูลพร้อมรูปถ่ายพัสดุแบบกลุ่ม (Batch Photo Matching)`]}),(0,y.jsxs)(`div`,{style:{fontSize:`0.8rem`,color:`var(--text-secondary)`,lineHeight:1.5,display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(240px, 1fr))`,gap:`0.75rem`},children:[(0,y.jsxs)(`div`,{style:{background:`var(--bg-secondary)`,padding:`0.6rem 0.85rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`},children:[(0,y.jsx)(`strong`,{children:`1. เตรียมไฟล์ข้อมูล:`}),` กรอกข้อมูลใน CSV หรือก๊อปปี้ตารางจาก Excel`]}),(0,y.jsxs)(`div`,{style:{background:`var(--bg-secondary)`,padding:`0.6rem 0.85rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`},children:[(0,y.jsx)(`strong`,{children:`2. ตั้งชื่อไฟล์รูปให้ตรงรหัส:`}),` เช่น `,(0,y.jsx)(`code`,{children:`6901-001-0001.jpg`}),` หรือ `,(0,y.jsx)(`code`,{children:`69010010001.png`})]}),(0,y.jsxs)(`div`,{style:{background:`var(--bg-secondary)`,padding:`0.6rem 0.85rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`},children:[(0,y.jsx)(`strong`,{children:`3. เลือกรูปหลายไฟล์พร้อมกัน:`}),` กดปุ่ม `,(0,y.jsx)(`em`,{children:`"📷 อัปโหลดรูปถ่ายพัสดุแบบกลุ่ม"`}),` ระบบจะจับคู่รูปกับรหัสครุภัณฑ์ให้อัตโนมัติทันที!`]})]}),(0,y.jsxs)(`div`,{style:{fontSize:`0.75rem`,color:`var(--success)`,fontWeight:600,display:`flex`,alignItems:`center`,gap:`0.35rem`},children:[(0,y.jsx)(ee,{size:14}),` ⚡ ระบบบีบอัดรูปภาพให้อัตโนมัติ (Fast Optimization): รูปภาพทุกรูปจะถูกย่อให้อ่านฉลากชัดเจนและมีขนาดไฟล์เล็กจิ๋ว (~30-80KB) ก่อนบันทึกลงคลาวด์เพื่อประหยัดพื้นที่จัดเก็บ 100%`]})]}),(0,y.jsxs)(`div`,{className:`template-card`,children:[(0,y.jsxs)(`div`,{className:`template-info`,children:[(0,y.jsx)(`h4`,{children:`📥 เทมเพลตสำหรับกรอกข้อมูลนำเข้า (Excel & CSV Template)`}),(0,y.jsxs)(`p`,{children:[`ดาวน์โหลดไฟล์ตัวอย่างนำไปกรอกข้อมูล — ไฟล์ `,(0,y.jsx)(`strong`,{children:`Excel (.xlsx)`}),` จะมี Dropdown ให้คลิกเลือกฝ่ายและสถานที่ตั้งจากโมดูล 8 พร้อมรูปแบบวันที่ `,(0,y.jsx)(`strong`,{children:`DD-MM-YYYY`})]})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,gap:`0.5rem`,flexWrap:`wrap`},children:[(0,y.jsxs)(`button`,{type:`button`,className:`btn btn-primary`,onClick:Ke,style:{gap:`0.4rem`,height:`40px`,fontWeight:650},title:`ดาวน์โหลดไฟล์ Excel พร้อม Dropdown เลือกฝ่าย/สถานที่จากระบบ และฟอร์แมตวันที่ DD-MM-YYYY`,children:[(0,y.jsx)(i,{size:16}),` 📊 ดาวน์โหลดไฟล์ตัวอย่าง .xlsx (แนะนำ)`]}),(0,y.jsxs)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:qe,style:{gap:`0.35rem`,height:`40px`},title:`ดาวน์โหลดไฟล์เทมเพลต CSV แบบข้อความ UTF-8`,children:[(0,y.jsx)(r,{size:16}),` ดาวน์โหลดไฟล์ .csv`]})]})]}),(0,y.jsxs)(`div`,{className:`import-grids`,children:[(0,y.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,y.jsxs)(`label`,{className:`import-box-header`,children:[(0,y.jsx)(p,{size:16}),` 📋 วางข้อมูลตรงจาก Excel (Copy-Paste)`]}),(0,y.jsx)(`textarea`,{className:`paste-textarea`,placeholder:`ก๊อปปี้ข้อมูลตารางใน Excel (เฉพาะแถวเนื้อหา ไม่ต้องเอาแถวหัวเรื่อง) แล้วกด Ctrl+V วางตรงนี้ได้เลย...`,value:U,onChange:e=>{G(``),ke(``),W(e.target.value)}}),(0,y.jsx)(`span`,{className:`subtitle-help`,style:{marginTop:`0.25rem`,display:`block`},children:`* ข้อมูลแต่ละคอลัมน์จะถูกคั่นด้วย Tab (TSV) โดยการกดวางจะประมวลผลให้เรียลไทม์`})]}),(0,y.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,y.jsxs)(`label`,{className:`import-box-header`,children:[(0,y.jsx)(l,{size:16}),` 📂 เลือกอัปโหลดไฟล์ (.xlsx, .csv)`]}),(0,y.jsx)(`input`,{type:`file`,id:`csv-file-picker`,accept:`.xlsx,.xls,.csv`,className:`file-hidden-input`,onChange:Ze,style:{display:`none`}}),(0,y.jsxs)(`label`,{htmlFor:`csv-file-picker`,className:`file-upload-box`,children:[(0,y.jsx)(l,{size:28,color:K?`var(--primary)`:`var(--text-muted)`}),K?(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(`span`,{className:`selected-file-badge`,children:K}),(0,y.jsx)(`span`,{className:`subtitle-help`,children:`คลิกเพื่อเปลี่ยนไฟล์ใหม่`})]}):(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(`span`,{children:`คลิกเพื่อค้นหาไฟล์ .xlsx หรือ .csv ในเครื่อง`}),(0,y.jsx)(`span`,{className:`subtitle-help`,children:`รองรับไฟล์ Excel (.xlsx) และ CSV UTF-8`})]})]}),K&&(0,y.jsxs)(`button`,{type:`button`,className:`btn btn-ghost btn-xs`,onClick:Q,style:{marginTop:`0.5rem`,color:`var(--danger)`,fontSize:`0.75rem`,padding:`0.25rem 0.5rem`,border:`1px solid var(--border)`,background:`var(--bg-secondary)`,width:`fit-content`},children:[(0,y.jsx)(f,{size:12}),` ล้างข้อมูลไฟล์`]})]}),(0,y.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,y.jsxs)(`label`,{className:`import-box-header`,children:[(0,y.jsx)(s,{size:16}),` 📷 อัปโหลดรูปถ่ายพัสดุแบบกลุ่ม (Batch Photos)`]}),(0,y.jsx)(`input`,{type:`file`,id:`batch-images-picker`,accept:`image/*,application/pdf,.pdf`,multiple:!0,className:`file-hidden-input`,onChange:He,style:{display:`none`}}),(0,y.jsxs)(`label`,{htmlFor:`batch-images-picker`,className:`file-upload-box`,style:{borderColor:q.size>0?`var(--success)`:`var(--border)`},children:[(0,y.jsx)(t,{size:28,color:q.size>0?`var(--success)`:`var(--text-muted)`}),q.size>0?(0,y.jsxs)(y.Fragment,{children:[(0,y.jsxs)(`span`,{className:`selected-file-badge`,style:{backgroundColor:`var(--success-light)`,color:`var(--success)`,border:`1px solid var(--success)`},children:[`📸 เลือกรูปถ่ายแล้ว `,q.size,` ไฟล์`]}),(0,y.jsx)(`span`,{className:`subtitle-help`,children:`คลิกเพื่อเลือกเพิ่มรูปถ่ายอีก`})]}):(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(`span`,{children:`คลิกเพื่อเลือกไฟล์รูปหลายๆ รูปพร้อมกัน`}),(0,y.jsx)(`span`,{className:`subtitle-help`,children:`ระบบจับคู่รูปภาพเข้ากับรหัส ID ให้อัตโนมัติ`})]})]}),q.size>0&&(0,y.jsxs)(`button`,{type:`button`,className:`btn btn-ghost btn-xs`,onClick:()=>Ae(new Map),style:{marginTop:`0.5rem`,color:`var(--danger)`,fontSize:`0.75rem`,padding:`0.25rem 0.5rem`,border:`1px solid var(--border)`,background:`var(--bg-secondary)`,width:`fit-content`},children:[(0,y.jsx)(f,{size:12}),` ล้างรูปถ่ายแบบกลุ่ม (`,q.size,` รูป)`]})]})]}),Y.length>0&&(0,y.jsxs)(`div`,{className:`validation-preview-section animate-fade-in`,style:{display:`flex`,flexDirection:`column`,gap:`0.75rem`},children:[(0,y.jsxs)(`div`,{className:`preview-stats-bar`,style:{flexWrap:`wrap`,gap:`0.5rem`},children:[(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`},children:[(0,y.jsx)(`span`,{style:{fontSize:`0.85rem`,fontWeight:700},children:`🔍 ตารางตรวจสอบความถูกต้องสด (Live Preview):`}),Y.length>0&&(0,y.jsxs)(`span`,{style:{fontSize:`0.75rem`,color:`var(--primary)`,fontWeight:650,background:`rgba(59, 130, 246, 0.1)`,padding:`0.2rem 0.5rem`,borderRadius:`12px`},children:[`📸 จับคู่รูปถ่ายได้แล้ว: `,Y.filter(e=>We(e)!==null).length,` / `,Y.length,` แถว`]})]}),(0,y.jsxs)(`div`,{className:`stats-group`,children:[(0,y.jsxs)(`button`,{type:`button`,className:`stat-badge all ${Z===`all`?`active`:``}`,onClick:()=>Ie(`all`),children:[`ทั้งหมด (`,Y.length,` แถว)`]}),(0,y.jsxs)(`button`,{type:`button`,className:`stat-badge success ${Z===`valid`?`active`:``}`,onClick:()=>Ie(`valid`),children:[`🟢 พร้อมนำเข้า (`,Y.filter(e=>e.isValid).length,` แถว)`]}),(0,y.jsxs)(`button`,{type:`button`,className:`stat-badge danger ${Z===`invalid`?`active`:``}`,onClick:()=>Ie(`invalid`),children:[`🔴 ติดปัญหา (`,Y.filter(e=>!e.isValid).length,` แถว)`]})]})]}),(0,y.jsx)(`div`,{className:`preview-table-container`,children:(0,y.jsxs)(`table`,{className:`preview-table`,children:[(0,y.jsx)(`thead`,{children:(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`th`,{style:{width:`50px`},children:`แถวที่`}),(0,y.jsx)(`th`,{style:{width:`90px`},children:`รูปถ่ายพัสดุ`}),(0,y.jsx)(`th`,{style:{width:`130px`},children:`รหัสครุภัณฑ์`}),(0,y.jsx)(`th`,{style:{width:`150px`},children:`ชื่อครุภัณฑ์`}),(0,y.jsx)(`th`,{style:{width:`100px`},children:`ฝ่ายที่ดูแล`}),(0,y.jsx)(`th`,{style:{width:`100px`},children:`สถานที่ตั้ง`}),(0,y.jsx)(`th`,{style:{width:`100px`},children:`วันที่ตรวจรับ`}),(0,y.jsx)(`th`,{style:{width:`120px`},children:`ผู้จำหน่าย / ที่มา`}),(0,y.jsx)(`th`,{style:{width:`120px`},children:`ผู้ดูแลรับผิดชอบ`}),(0,y.jsx)(`th`,{style:{width:`80px`},children:`สถานะ`}),(0,y.jsx)(`th`,{style:{width:`160px`},children:`ผลการตรวจเช็ค`})]})}),(0,y.jsx)(`tbody`,{children:Y.filter(e=>Z===`valid`?e.isValid:Z===`invalid`?!e.isValid:!0).length===0?(0,y.jsx)(`tr`,{children:(0,y.jsx)(`td`,{colSpan:11,style:{textAlign:`center`,padding:`2rem`,color:`var(--text-muted)`},children:`ไม่มีแถวข้อมูลตามตัวเลือกตัวกรอง`})}):Y.filter(e=>Z===`valid`?e.isValid:Z===`invalid`?!e.isValid:!0).map(e=>(0,y.jsxs)(`tr`,{className:e.isValid?`row-valid`:`row-invalid`,children:[(0,y.jsx)(`td`,{style:{fontWeight:600,color:`var(--text-muted)`},children:e.rowNum}),(0,y.jsx)(`td`,{children:(()=>{let t=We(e);return(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`0.25rem`,padding:`0.2rem 0`},children:[t?(0,y.jsx)(`div`,{style:{position:`relative`,width:`38px`,height:`38px`,borderRadius:`4px`,overflow:`hidden`,border:`1px solid var(--border)`,boxShadow:`0 2px 4px rgba(0,0,0,0.1)`},children:(0,y.jsx)(`img`,{src:t.previewUrl,alt:`Asset preview`,style:{width:`100%`,height:`100%`,objectFit:`cover`}})}):(0,y.jsx)(`div`,{style:{width:`38px`,height:`38px`,borderRadius:`4px`,background:`var(--bg-secondary)`,border:`1px dashed var(--border)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`var(--text-muted)`},children:(0,y.jsx)(s,{size:14})}),(0,y.jsxs)(`label`,{style:{fontSize:`0.625rem`,cursor:`pointer`,color:`var(--primary)`,fontWeight:600,textDecoration:`underline`},children:[t?t.source===`matched`?`🟢 ตรง ID`:`📸 รูปกำหนดเอง`:`📷 +รูป`,(0,y.jsx)(`input`,{type:`file`,accept:`image/*`,style:{display:`none`},onChange:t=>{t.target.files&&t.target.files[0]&&Ue(e.rowNum,t.target.files[0])}})]})]})})()}),(0,y.jsx)(`td`,{style:{fontFamily:`monospace`,fontWeight:700},children:e.id||`-`}),(0,y.jsx)(`td`,{children:e.name||(0,y.jsx)(`span`,{style:{color:`var(--danger)`,fontStyle:`italic`},children:`[ไม่มีชื่อ]`})}),(0,y.jsx)(`td`,{children:e.department}),(0,y.jsx)(`td`,{children:e.location}),(0,y.jsx)(`td`,{children:e.receivedDate}),(0,y.jsx)(`td`,{children:e.source}),(0,y.jsx)(`td`,{children:e.responsiblePerson}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`badge`,style:{fontSize:`0.7rem`,padding:`0.1rem 0.4rem`,backgroundColor:e.status===`ใช้งานได้`?`var(--success-light)`:e.status===`ชำรุด`?`var(--danger-light)`:`var(--warning-light)`,color:e.status===`ใช้งานได้`?`var(--success)`:e.status===`ชำรุด`?`var(--danger)`:`var(--warning)`},children:e.status})}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`div`,{className:`validation-messages`,children:[e.isValid?(0,y.jsx)(`span`,{className:`row-status-badge valid`,children:`🟢 ข้อมูลถูกต้อง`}):(0,y.jsx)(`span`,{className:`row-status-badge invalid`,children:`🔴 ไม่สามารถนำเข้าได้`}),e.errors.map((e,t)=>(0,y.jsxs)(`span`,{className:`val-msg error`,children:[`❌ `,e]},`err-${t}`)),e.warnings.map((e,t)=>(0,y.jsxs)(`span`,{className:`val-msg warning`,children:[`⚠️ `,e]},`warn-${t}`))]})})]},e.rowNum))})]})}),(0,y.jsxs)(`div`,{className:`form-actions-bar`,style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(0,y.jsxs)(`div`,{style:{fontSize:`0.8rem`,color:`var(--text-secondary)`},children:[`แถวที่พร้อมนำเข้า: `,(0,y.jsx)(`strong`,{style:{color:`var(--success)`,fontSize:`0.9rem`},children:Y.filter(e=>e.isValid).length}),` แถว (แถวที่ติดปัญหา `,(0,y.jsx)(`strong`,{style:{color:`var(--danger)`},children:Y.filter(e=>!e.isValid).length}),` แถวจะไม่ถูกนำเข้า)`]}),(0,y.jsxs)(`div`,{style:{display:`flex`,gap:`0.5rem`},children:[(0,y.jsx)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:Q,children:`ล้างทั้งหมด`}),(0,y.jsx)(`button`,{type:`button`,className:`btn btn-primary`,disabled:Y.filter(e=>e.isValid).length===0||F,onClick:Qe,children:F?Me?`⚡ กำลังบีบอัดรูปภาพและนำเข้า (${Me.current}/${Me.total})...`:`กำลังประมวลผลนำเข้า...`:`💾 ยืนยันนำเข้าข้อมูล (${Y.filter(e=>e.isValid).length} แถว) ลงระบบ`})]})]})]})]})}):(0,y.jsxs)(`div`,{className:`report-config-panel intake-form glass-panel animate-fade-in`,style:{padding:`2rem`},children:[(0,y.jsx)(`h3`,{style:{fontSize:`1.15rem`,fontWeight:800,marginBottom:`1rem`,borderBottom:`1px solid var(--border)`,paddingBottom:`0.5rem`},children:`ออกรายงานประวัติครุภัณฑ์ขึ้นทะเบียนใหม่`}),(0,y.jsxs)(`div`,{className:`grid-cols-3`,children:[(0,y.jsxs)(`div`,{className:`form-group`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`🏢 ฝ่าย/หน่วยงานผู้ดูแล`}),(0,y.jsxs)(`select`,{className:`form-select`,value:B,onChange:e=>Ce(e.target.value),disabled:C?.role===`head`||C?.role===`operator`||C?.role===`user`,children:[(C?.role===`admin`||C?.role===`manager`)&&(0,y.jsx)(`option`,{value:`all`,children:`ทุกหน่วยงาน`}),C?.role===`user`?(0,y.jsx)(`option`,{value:C.department,children:C.department}):Array.from(new Set(e.map(e=>e.department).filter(Boolean))).map(e=>(0,y.jsx)(`option`,{value:e,children:e},e))]})]}),(0,y.jsxs)(`div`,{className:`form-group`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`📅 เริ่มต้นตั้งแต่วันที่`}),(0,y.jsx)(`input`,{type:`date`,className:`form-input`,value:V,onChange:e=>we(e.target.value)})]}),(0,y.jsxs)(`div`,{className:`form-group`,children:[(0,y.jsx)(`label`,{className:`form-label`,children:`📅 จนถึงวันที่`}),(0,y.jsx)(`input`,{type:`date`,className:`form-input`,value:H,onChange:e=>Te(e.target.value)})]})]}),(0,y.jsx)(`div`,{className:`form-actions`,style:{display:`flex`,justifyContent:`flex-end`,borderTop:`1px solid var(--border)`,paddingTop:`1.5rem`,marginTop:`1rem`},children:(0,y.jsxs)(`button`,{type:`button`,className:`btn btn-primary`,onClick:()=>De(!0),style:{display:`flex`,alignItems:`center`,gap:`0.45rem`},children:[(0,y.jsx)(n,{size:16}),` 🖨️ แสดงตัวอย่างรายงานและจัดพิมพ์`]})})]}),Ee&&(0,y.jsxs)(`div`,{className:`print-preview-overlay animate-fade-in`,style:{position:`fixed`,top:0,left:0,width:`100%`,height:`100%`,background:`rgba(0,0,0,0.85)`,zIndex:9999,overflowY:`auto`,display:`flex`,flexDirection:`column`,padding:`2rem 1rem`},children:[(0,y.jsxs)(`div`,{className:`print-actions-bar glass-panel`,style:{maxWidth:`800px`,width:`100%`,margin:`0 auto 1.5rem auto`,padding:`1rem`,display:`flex`,justifyContent:`space-between`,alignItems:`center`,zIndex:1e4},children:[(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`h4`,{style:{fontWeight:800,color:`var(--primary)`},children:`🖨️ ตัวอย่างก่อนพิมพ์รายงานครุภัณฑ์ใหม่ (A4 Preview)`}),(0,y.jsx)(`p`,{style:{fontSize:`0.75rem`,color:`var(--text-secondary)`},children:`รายงานพัสดุรับใหม่จัดรูปแบบสำหรับพิมพ์ลงกระดาษ A4`})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,gap:`0.5rem`},children:[(0,y.jsx)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:()=>De(!1),children:`ย้อนกลับ`}),(0,y.jsxs)(`button`,{type:`button`,className:`btn btn-primary`,onClick:()=>window.print(),style:{display:`flex`,alignItems:`center`,gap:`0.4rem`},children:[(0,y.jsx)(n,{size:16}),` สั่งพิมพ์ / PDF`]})]})]}),(0,y.jsx)(`div`,{className:`print-paper-a4 printable-a4-document`,style:{background:`#ffffff`,color:`#000000`,maxWidth:`800px`,width:`100%`,margin:`0 auto`,padding:`2.5rem 3rem`,minHeight:`11.28in`,boxShadow:`0 10px 30px rgba(0,0,0,0.5)`,fontFamily:`'Sarabun', 'Noto Sans Thai', sans-serif`,fontSize:`13px`,lineHeight:`1.6`,colorScheme:`light`,borderRadius:`4px`},children:(()=>{let t=e.filter(e=>{let t=e.receivedDate>=V&&e.receivedDate<=H,n=B===`all`||e.department===B;return t&&n});return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsxs)(`div`,{style:{textAlign:`center`,position:`relative`,marginBottom:`2.5rem`},children:[(0,y.jsx)(`div`,{style:{fontSize:`28px`,color:`#000000`,marginBottom:`0.5rem`},children:`🇹🇭`}),(0,y.jsx)(`h1`,{style:{fontSize:`1.65rem`,fontWeight:800,color:`#000000`,margin:`0.2rem 0`},children:`รายงานประวัติครุภัณฑ์ขึ้นทะเบียนรับใหม่เข้าคลัง`}),(0,y.jsxs)(`h2`,{style:{fontSize:`1.1rem`,fontWeight:700,color:`#333333`,margin:`0.2rem 0`},children:[`ประจำวันที่ `,new Date(V).toLocaleDateString(`th-TH`),` ถึงวันที่ `,new Date(H).toLocaleDateString(`th-TH`)]}),B!==`all`&&(0,y.jsxs)(`div`,{style:{fontSize:`1rem`,fontWeight:600,marginTop:`0.25rem`},children:[`หน่วยงาน: `,B]}),(0,y.jsx)(`div`,{style:{fontSize:`0.85rem`,color:`#666666`,marginTop:`0.5rem`},children:`ผู้ดูแลรับผิดชอบ: ระบบคลังข้อมูลครุภัณฑ์ AssetWatch`})]}),(0,y.jsx)(`hr`,{style:{border:`0`,borderTop:`2px double #333333`,margin:`1rem 0 1.5rem 0`}}),(0,y.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`1rem`,marginBottom:`1.5rem`,background:`#f8f9fa`,padding:`1rem`,border:`1px solid #dddddd`,borderRadius:`4px`},children:[(0,y.jsxs)(`div`,{children:[(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`strong`,{children:`👤 ผู้ออกรายงาน:`}),` `,C?.name||`ไม่ได้ระบุ`]}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`strong`,{children:`🏢 บทบาทหน้าที่:`}),` `,C?.role===`admin`?`แอดมินสูงสุด`:C?.role===`manager`?`ผู้จัดการ`:`ผู้ปฏิบัติงาน`]})]}),(0,y.jsxs)(`div`,{style:{borderLeft:`1px solid #dddddd`,paddingLeft:`1rem`},children:[(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`strong`,{children:`📦 ครุภัณฑ์ขึ้นทะเบียนใหม่:`}),` `,t.length,` รายการ`]}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`strong`,{children:`📅 วันเวลาที่ออกเอกสาร:`}),` `,new Date().toLocaleDateString(`th-TH`),` `,new Date().toLocaleTimeString(`th-TH`),` น.`]})]})]}),(0,y.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,marginBottom:`2rem`,fontSize:`12px`},children:[(0,y.jsx)(`thead`,{children:(0,y.jsxs)(`tr`,{style:{background:`#f2f2f2`,borderBottom:`1.5px solid #000000`,borderTop:`1px solid #dddddd`},children:[(0,y.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`center`,border:`1px solid #dddddd`,width:`50px`},children:`ลำดับ`}),(0,y.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`,width:`100px`},children:`วันที่ตรวจรับ`}),(0,y.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`,width:`120px`},children:`รหัสครุภัณฑ์`}),(0,y.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`},children:`ชื่อรายการครุภัณฑ์`}),(0,y.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`,width:`120px`},children:`แหล่งที่มา`}),(0,y.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`,width:`100px`},children:`ฝ่ายที่ดูแล`}),(0,y.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`,width:`100px`},children:`สถานที่ตั้ง`})]})}),(0,y.jsx)(`tbody`,{children:t.length===0?(0,y.jsx)(`tr`,{children:(0,y.jsx)(`td`,{colSpan:7,style:{padding:`1.5rem`,textAlign:`center`,border:`1px solid #dddddd`,color:`#666666`},children:`ไม่พบข้อมูลการขึ้นทะเบียนครุภัณฑ์ใหม่ในช่วงเวลานี้`})}):t.map((e,t)=>(0,y.jsxs)(`tr`,{style:{borderBottom:`1px solid #dddddd`},children:[(0,y.jsx)(`td`,{style:{padding:`0.5rem`,textAlign:`center`,border:`1px solid #dddddd`},children:t+1}),(0,y.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`},children:new Date(e.receivedDate).toLocaleDateString(`th-TH`)}),(0,y.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`,fontFamily:`monospace`,fontWeight:`bold`},children:e.id}),(0,y.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`},children:e.name}),(0,y.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`},children:e.source}),(0,y.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`},children:e.department}),(0,y.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`},children:e.location})]},e.id))})]}),(0,y.jsx)(`div`,{style:{marginTop:`5rem`,display:`flex`,justifyContent:`flex-end`},children:(0,y.jsxs)(`div`,{style:{textAlign:`center`,width:`280px`},children:[(0,y.jsx)(`div`,{style:{marginBottom:`3rem`},children:`ลงชื่อ.................................................................. ผู้รายงานผล`}),(0,y.jsxs)(`div`,{children:[`( `,C?.name||`..............................................`,` )`]}),(0,y.jsx)(`div`,{style:{fontSize:`0.85rem`,color:`#666666`,marginTop:`0.35rem`},children:`ตำแหน่ง: เจ้าหน้าที่ทะเบียนพัสดุ`}),(0,y.jsxs)(`div`,{style:{fontSize:`0.85rem`,color:`#666666`},children:[`วันที่ `,new Date().toLocaleDateString(`th-TH`)]})]})})]})})()})]}),(0,y.jsx)(`style`,{children:`
        .intake-form {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row-double {
          display: flex;
          gap: 1.5rem;
          width: 100%;
        }

        .flex-1 {
          flex: 1;
        }

        .input-with-action {
          display: flex;
          gap: 0.5rem;
        }

        .code-input-field {
          font-family: monospace;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .btn-sm-action {
          padding: 0 1rem;
          white-space: nowrap;
          font-size: 0.85rem;
        }

        /* Image dropzone */
        .image-dropzone {
          width: 100%;
        }

        .dropzone-label {
          width: 100%;
          border: 2px dashed var(--border);
          background-color: var(--bg-primary);
          border-radius: var(--radius-md);
          padding: 2.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
        }

        .dropzone-label:hover {
          border-color: var(--primary);
          background-color: rgba(59, 130, 246, 0.01);
        }

        .camera-bounce {
          animation: camera-float 3s infinite alternate ease-in-out;
        }

        @keyframes camera-float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }

        .intake-preview-wrapper {
          position: relative;
          width: 100%;
          max-width: 380px;
          aspect-ratio: 16/10;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .intake-preview-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .change-pic-badge {
          position: absolute;
          bottom: 0.75rem;
          right: 0.75rem;
          background-color: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(2px);
          color: #ffffff;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .subtitle-help {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Upload Choice Cards (Camera vs Document) */
        .upload-choice-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
          width: 100%;
          box-sizing: border-box;
        }

        .upload-choice-card {
          background: var(--bg-primary);
          border: 1.5px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 1.15rem 0.65rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
          width: 100%;
          color: inherit;
          box-sizing: border-box;
        }

        .upload-choice-card:hover {
          border-color: var(--primary);
          background: rgba(59, 130, 246, 0.04);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .upload-choice-card:active {
          transform: translateY(0);
        }

        .upload-choice-icon-bubble {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-fast);
        }

        .camera-bubble {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .doc-bubble {
          background: rgba(59, 130, 246, 0.12);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .upload-choice-card:hover .upload-choice-icon-bubble {
          transform: scale(1.08);
        }

        .upload-choice-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .upload-choice-main {
          font-size: 0.825rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .upload-choice-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* Preview Image Card with actions */
        .preview-image-card {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          box-sizing: border-box;
        }

        .preview-image-box {
          position: relative;
          width: 100%;
          max-width: 260px;
          aspect-ratio: 4/3;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }

        .preview-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-action-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          justify-content: center;
          width: 100%;
        }

        .btn-preview-action {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.725rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-preview-action:hover {
          background: var(--bg-card);
          border-color: var(--primary);
        }

        .btn-preview-delete {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.08);
        }

        .btn-preview-delete:hover {
          background: rgba(239, 68, 68, 0.16);
          border-color: #ef4444;
        }

        .grid-cols-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .form-actions-bar {
          margin-top: 1rem;
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
          display: flex;
          justify-content: flex-end;
        }

        /* Success Card layout */
        .success-wizard-card {
          padding: 4rem 2rem;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: var(--glass-shadow);
        }

        .text-center {
          text-align: center;
        }

        .success-checkmark-wrapper {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background-color: var(--success-light);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
          margin-bottom: 1.5rem;
        }

        .success-intake-details {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          max-width: 440px;
          margin: 1.5rem auto;
          text-align: left;
        }

        .intake-detail-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          border-bottom: 1px dashed var(--border);
          padding: 0.5rem 0;
        }

        .intake-detail-line:last-child {
          border-bottom: none;
        }

        .intake-detail-line span {
          color: var(--text-secondary);
        }

        .success-card-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        /* Mass Import Premium Styles */
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
        
        .mass-import-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .template-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          gap: 1rem;
        }
        .template-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .template-info p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        .import-grids {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
        }
        
        .import-box-header {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 0.65rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .paste-textarea {
          width: 100%;
          min-height: 140px;
          font-family: monospace;
          font-size: 0.8rem;
          padding: 0.85rem;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border);
          background: var(--bg-primary);
          color: var(--text-primary);
          resize: vertical;
          outline: none;
          transition: border-color var(--transition-fast);
        }
        .paste-textarea:focus {
          border-color: var(--border-focus);
        }
        .file-upload-box {
          border: 2px dashed var(--border);
          background: var(--bg-primary);
          border-radius: var(--radius-md);
          padding: 1.75rem 1rem;
          text-align: center;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all var(--transition-fast);
          min-height: 140px;
        }
        .file-upload-box:hover {
          border-color: var(--primary);
          background: rgba(59, 130, 246, 0.02);
        }
        .selected-file-badge {
          background: var(--primary-light);
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          margin-top: 0.25rem;
        }
        
        .preview-stats-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0.85rem 1.25rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .stats-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .stat-badge {
          font-size: 0.775rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .stat-badge:hover {
          transform: translateY(-1px);
        }
        .stat-badge.all.active {
          border-color: var(--text-primary);
          background: var(--text-primary);
          color: var(--bg-secondary);
        }
        .stat-badge.success:hover, .stat-badge.success.active {
          background: var(--success);
          color: #ffffff;
          border-color: var(--success);
        }
        .stat-badge.danger:hover, .stat-badge.danger.active {
          background: var(--danger);
          color: #ffffff;
          border-color: var(--danger);
        }
        
        .preview-table-container {
          max-height: 380px;
          overflow: auto;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
        }
        .preview-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.825rem;
          text-align: left;
          min-width: 900px;
        }
        .preview-table th {
          background: var(--bg-tertiary);
          padding: 0.85rem 1rem;
          font-weight: 700;
          color: var(--text-secondary);
          border-bottom: 1.5px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 5;
        }
        .preview-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }
        .preview-table tr:last-child td {
          border-bottom: none;
        }
        .preview-table tr.row-invalid {
          background: rgba(239, 68, 68, 0.015);
        }
        .preview-table tr:hover {
          background-color: rgba(59, 130, 246, 0.01);
        }
        
        .row-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.725rem;
        }
        .row-status-badge.valid {
          background: var(--success-light);
          color: var(--success);
        }
        .row-status-badge.invalid {
          background: var(--danger-light);
          color: var(--danger);
        }
        
        .validation-messages {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 0.25rem;
        }
        .val-msg {
          font-size: 0.725rem;
          display: block;
        }
        .val-msg.error {
          color: var(--danger);
        }
        .val-msg.warning {
          color: var(--warning-hover);
        }

        @media (max-width: 768px) {
          .form-row-double {
            flex-direction: column;
            gap: 0;
          }
          .grid-cols-3 {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .intake-form {
            padding: 1.25rem;
          }
          .success-card-actions {
            flex-direction: column;
            gap: 0.75rem;
          }
          .import-grids {
            grid-template-columns: 1fr;
          }
          .template-card {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
        }
      `})]})};export{b as Module3_AddAsset};