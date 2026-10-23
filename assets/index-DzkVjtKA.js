const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./Module1_Database-DoC6Hg5O.js","./rolldown-runtime-BHe-jwch.js","./vendor-icons-qVqAK2Qz.js","./vendor-react-BkSsXNgQ.js","./Module2_ScanSurvey-wP_FkjLN.js","./Module3_AddAsset-BqmrD1OZ.js","./vendor-excel-DH20LHZs.js","./Module4_Dispose-BbnnklxR.js","./Module5_Transfer-DZ95z4AJ.js","./Module6_AuditTrail-Dnafv2qs.js","./Module7_Settings-1Vx8Nmgx.js","./Module8_Departments-DZYM9Hy_.js","./Module9_AccessControl-CdSZaip3.js","./Module10_Maintenance-OAbqJiEk.js","./Module11_QualityDocs-BhehzmbI.js","./Module12_SpareParts-RNq89-Ri.js"])))=>i.map(i=>d[i]);
import{r as e}from"./rolldown-runtime-BHe-jwch.js";import{$ as t,A as n,Ct as r,D as i,F as a,G as o,L as s,M as c,N as l,Nt as u,P as d,R as f,S as p,T as m,V as h,W as g,Z as _,_t as v,a as y,at as b,b as x,ct as S,f as C,g as w,h as T,ht as ee,i as te,j as E,lt as ne,m as re,n as ie,o as ae,ot as oe,p as se,r as ce,st as le,t as D,vt as ue,w as de,x as fe,yt as pe}from"./vendor-icons-qVqAK2Qz.js";import{n as me,r as O}from"./vendor-react-BkSsXNgQ.js";import{_ as k,a as A,c as he,d as ge,f as j,g as _e,h as M,i as N,l as P,m as F,n as I,o as L,p as R,r as ve,s as z,t as B,u as V,v as ye}from"./vendor-firebase-Dt97CG0R.js";import{a as be,c as xe,i as Se,l as H,n as U,o as Ce,r as we,s as Te,t as Ee}from"./vendor-scanner-Bltl6Akg.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var W=e(u(),1),De=O(),G=me(),Oe=({currentTab:e,setCurrentTab:t,theme:r,setTheme:i,isFirebaseConfigured:u,currentUser:d,onLogout:f,onRefreshDevice:g,isRefreshing:v=!1})=>{let[S,C]=W.useState(!1),w=[{id:`dashboard`,label:`แผงควบคุม (Dashboard)`,icon:s},{id:`module1`,label:`ฐานข้อมูลครุภัณฑ์`,icon:_},{id:`module2`,label:`แสกนตรวจนับครุภัณฑ์`,icon:m}];d?.role!==`manager`&&w.push({id:`module3`,label:`ลงทะเบียนใหม่`,icon:b}),d?.role===`admin`&&w.push({id:`module4`,label:`จำหน่ายครุภัณฑ์`,icon:re}),d?.role!==`manager`&&w.push({id:`module5_transfer`,label:`โอนย้ายครุภัณฑ์`,icon:E}),w.push({id:`module10_pm`,label:`บำรุงรักษา (PM/CM)`,icon:ue},{id:`module11_quality`,label:`เอกสารคุณภาพ`,icon:o},{id:`module12_spareparts`,label:`คลังอะไหล่`,icon:n},{id:`module6`,label:`ประวัติกิจกรรม (Audit)`,icon:h},{id:`module8`,label:`ตั้งค่าหน่วยงาน & ห้อง`,icon:pe}),d?.role===`admin`&&w.push({id:`module9`,label:`สิทธิ์การเข้าถึง (RBAC)`,icon:a}),w.push({id:`module7`,label:`ตั้งค่า & คู่มือการใช้งาน`,icon:x});let ee=()=>{i(r===`light`?`dark`:`light`)};return(0,G.jsxs)(G.Fragment,{children:[(0,G.jsxs)(`header`,{className:`mobile-header`,children:[(0,G.jsxs)(`div`,{className:`logo-container`,children:[(0,G.jsx)(`div`,{className:`logo-icon-pulse`}),(0,G.jsx)(`span`,{className:`logo-text`,children:`AMIS`})]}),(0,G.jsxs)(`div`,{className:`mobile-header-actions`,children:[g&&(0,G.jsx)(`button`,{className:`theme-toggle-btn`,onClick:()=>g(),title:`รีเฟรชและซิงค์ข้อมูลเครื่องนี้`,"aria-label":`Refresh and sync device`,style:{color:`var(--primary)`},children:(0,G.jsx)(p,{size:18,className:v?`animate-spin`:``})}),(0,G.jsx)(`button`,{className:`theme-toggle-btn`,onClick:ee,"aria-label":`Toggle theme`,children:r===`light`?(0,G.jsx)(c,{size:20}):(0,G.jsx)(T,{size:20})}),(0,G.jsx)(`button`,{className:`menu-btn`,onClick:()=>C(!S),"aria-label":`Open menu`,children:S?(0,G.jsx)(te,{size:24}):(0,G.jsx)(l,{size:24})})]})]}),(0,G.jsxs)(`aside`,{className:`sidebar-container ${S?`sidebar-open`:``}`,children:[(0,G.jsxs)(`div`,{className:`sidebar-logo`,children:[(0,G.jsx)(`div`,{className:`logo-symbol`,children:(0,G.jsx)(m,{size:24,color:`#ffffff`})}),(0,G.jsxs)(`div`,{children:[(0,G.jsx)(`h2`,{className:`logo-title`,children:`AMIS`}),(0,G.jsx)(`span`,{className:`logo-subtitle`,children:`ระบบจัดการครุภัณฑ์`})]})]}),(0,G.jsxs)(`div`,{className:`firebase-badge-container`,children:[(0,G.jsx)(`div`,{className:`firebase-status-dot ${u?`status-online`:`status-demo`}`}),(0,G.jsx)(`span`,{className:`firebase-status-text`,children:u?`เชื่อมต่อ Cloud`:`ทดสอบออฟไลน์ (Demo)`})]}),d&&(0,G.jsxs)(`div`,{className:`sidebar-user-profile glass-panel`,children:[(0,G.jsx)(`div`,{className:`user-profile-avatar`,style:{background:d.role===`admin`?`linear-gradient(135deg, #6366f1, #8b5cf6)`:d.role===`manager`?`linear-gradient(135deg, #8b5cf6, #ec4899)`:d.role===`head`?`linear-gradient(135deg, #f59e0b, #ef4444)`:`linear-gradient(135deg, #3b82f6, #06b6d4)`},children:d.name.slice(0,2).toUpperCase()}),(0,G.jsxs)(`div`,{className:`user-profile-info`,children:[(0,G.jsx)(`span`,{className:`profile-name`,children:d.name}),(0,G.jsxs)(`div`,{className:`profile-badges`,children:[(0,G.jsx)(`span`,{className:`profile-role-badge ${d.role===`admin`?`badge-admin`:d.role===`manager`?`badge-manager`:d.role===`head`?`badge-warning`:`badge-user`}`,children:d.role===`admin`?`👑 แอดมินสูงสุด`:d.role===`manager`?`💼 ผู้บริหาร`:d.role===`head`?`👔 หัวหน้าฝ่าย`:`🔧 ผู้ปฏิบัติงาน`}),d.department&&(0,G.jsx)(`span`,{className:`profile-dept-badge`,title:d.department,children:d.department.replace(`ฝ่าย`,``).replace(`กลุ่มงาน`,``).slice(0,10)})]})]})]}),(0,G.jsx)(`nav`,{className:`sidebar-nav`,children:(0,G.jsx)(`ul`,{children:w.map(n=>{let r=n.icon,i=e===n.id;return(0,G.jsx)(`li`,{children:(0,G.jsxs)(`button`,{className:`nav-link ${i?`nav-link-active`:``}`,onClick:()=>{t(n.id),C(!1)},children:[(0,G.jsx)(r,{size:20,className:`nav-icon ${i?`nav-icon-active`:``}`}),(0,G.jsx)(`span`,{className:`nav-label`,children:n.label})]})},n.id)})})}),(0,G.jsxs)(`div`,{className:`sidebar-footer`,children:[g&&(0,G.jsxs)(`button`,{className:`theme-switch`,onClick:()=>g(),disabled:v,style:{marginBottom:`0.4rem`,borderColor:`var(--primary)`,color:`var(--primary)`},children:[(0,G.jsx)(p,{size:16,className:v?`animate-spin`:``}),(0,G.jsx)(`span`,{children:v?`กำลังซิงค์เครื่องนี้...`:`🔄 ซิงค์ข้อมูลเครื่องนี้`})]}),(0,G.jsx)(`button`,{className:`theme-switch`,onClick:ee,children:r===`light`?(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(c,{size:18}),(0,G.jsx)(`span`,{children:`โหมดกลางคืน (Dark)`})]}):(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(T,{size:18}),(0,G.jsx)(`span`,{children:`โหมดกลางวัน (Light)`})]})}),d&&(0,G.jsx)(`button`,{className:`theme-switch btn-logout-footer`,onClick:f,style:{marginTop:`0.4rem`,borderColor:`rgba(239, 68, 68, 0.25)`,color:`var(--danger)`,background:`rgba(239, 68, 68, 0.03)`},children:`🚪 ออกจากระบบ (Logout)`}),(0,G.jsx)(`div`,{className:`footer-copyright`,children:`v1.7.0 © ooubaal / AMIS`})]})]}),S&&(0,G.jsx)(`div`,{className:`sidebar-overlay`,onClick:()=>C(!1)}),(0,G.jsxs)(`nav`,{className:`mobile-bottom-nav`,children:[(0,G.jsxs)(`button`,{className:`bottom-nav-item ${e===`dashboard`?`bottom-nav-active`:``}`,onClick:()=>t(`dashboard`),children:[(0,G.jsx)(s,{size:20}),(0,G.jsx)(`span`,{children:`แผงควบคุม`})]}),(0,G.jsxs)(`button`,{className:`bottom-nav-item ${e===`module1`?`bottom-nav-active`:``}`,onClick:()=>t(`module1`),children:[(0,G.jsx)(_,{size:20}),(0,G.jsx)(`span`,{children:`ครุภัณฑ์`})]}),(0,G.jsx)(`button`,{className:`bottom-nav-item scanner-fab`,onClick:()=>t(`module2`),children:(0,G.jsx)(`div`,{className:`fab-inner`,children:(0,G.jsx)(m,{size:24,color:`#ffffff`})})}),(0,G.jsxs)(`button`,{className:`bottom-nav-item ${e===`module5_repair`?`bottom-nav-active`:``}`,onClick:()=>t(`module5_repair`),children:[(0,G.jsx)(y,{size:20}),(0,G.jsx)(`span`,{children:`งานซ่อม`})]}),(0,G.jsxs)(`button`,{className:`bottom-nav-item ${e===`module7`?`bottom-nav-active`:``}`,onClick:()=>t(`module7`),children:[(0,G.jsx)(x,{size:20}),(0,G.jsx)(`span`,{children:`ตั้งค่า`})]})]}),(0,G.jsx)(`style`,{children:`
        /* Sidebar styles */
        .sidebar-container {
          width: 260px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background-color: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: transform var(--transition-normal);
        }

        .sidebar-logo {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          border-bottom: 1px solid var(--border);
        }

        .logo-symbol {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, var(--primary), var(--info));
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
        }

        .logo-title {
          font-size: 1.2rem;
          font-weight: 800;
          line-height: 1.1;
          background: linear-gradient(120deg, var(--primary), var(--info));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .firebase-badge-container {
          margin: 1rem 1.25rem 0.5rem 1.25rem;
          padding: 0.5rem 0.75rem;
          background-color: var(--bg-primary);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .firebase-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-online {
          background-color: var(--success);
          box-shadow: 0 0 8px var(--success);
        }

        .status-demo {
          background-color: var(--warning);
          box-shadow: 0 0 8px var(--warning);
        }

        .firebase-status-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.25rem;
          overflow-y: auto;
        }

        .sidebar-nav ul {
          list-style: none;
        }

        .sidebar-nav li {
          margin-bottom: 0.35rem;
        }

        .nav-link {
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
          font-size: 0.925rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .nav-link:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .nav-link-active {
          background-color: var(--primary-light);
          color: var(--primary);
          font-weight: 600;
        }

        .nav-icon {
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .nav-icon-active {
          color: var(--primary);
        }

        .sidebar-footer {
          padding: 1.25rem;
          border-top: 1px solid var(--border);
          background-color: var(--bg-secondary);
        }

        .theme-switch {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem;
          border-radius: var(--radius-sm);
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-family: var(--font-family);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .theme-switch:hover {
          background-color: var(--border);
          color: var(--text-primary);
        }

        .footer-copyright {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 0.75rem;
          font-weight: 500;
        }

        /* Mobile top bar and bottom nav styles */
        .mobile-header {
          display: none;
          height: 60px;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: 0 1.25rem;
          align-items: center;
          justify-content: space-between;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 100;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-icon-pulse {
          width: 10px;
          height: 10px;
          background-color: var(--primary);
          border-radius: 50%;
          position: relative;
        }

        .logo-icon-pulse::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: var(--primary);
          animation: pulse 2s infinite;
          left: 0;
          top: 0;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        .logo-text {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .mobile-header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .theme-toggle-btn, .menu-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
        }

        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 64px;
          background-color: var(--bg-secondary);
          border-top: 1px solid var(--border);
          z-index: 100;
          justify-content: space-around;
          align-items: center;
          padding: 0 0.5rem;
          box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.05);
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.7rem;
          font-family: var(--font-family);
          gap: 0.2rem;
          cursor: pointer;
          flex: 1;
        }

        .bottom-nav-active {
          color: var(--primary);
          font-weight: 600;
        }

        /* Scanner Floating Action Button */
        .scanner-fab {
          position: relative;
          top: -15px;
          z-index: 101;
        }

        .fab-inner {
          width: 54px;
          height: 54px;
          background: linear-gradient(135deg, var(--primary), var(--info));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
          border: 4px solid var(--bg-secondary);
          transition: transform 0.2s;
        }

        .fab-inner:active {
          transform: scale(0.9);
        }

        @media (max-width: 768px) {
          .sidebar-container {
            transform: translateX(-100%);
          }
          
          .sidebar-open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            z-index: 99;
          }

          .mobile-header {
            display: flex;
          }

          .mobile-bottom-nav {
            display: flex;
          }
          
          body {
            padding-top: 60px; /* Offset for top bar */
          }
        }

        /* Profile Card premium CSS styling */
        .sidebar-user-profile {
          margin: 0.75rem 1.25rem 0.25rem 1.25rem;
          padding: 0.65rem;
          background-color: var(--bg-primary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .user-profile-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.8rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
          font-family: monospace;
        }

        .user-profile-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          overflow: hidden;
        }

        .profile-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-badges {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }

        .profile-role-badge {
          font-size: 0.58rem;
          font-weight: 650;
          padding: 0.02rem 0.3rem;
          border-radius: var(--radius-sm);
        }

        .badge-admin {
          background-color: rgba(99, 102, 241, 0.12);
          color: #6366f1;
        }

        .badge-manager {
          background-color: rgba(139, 92, 246, 0.12);
          color: #8b5cf6;
        }

        .badge-user {
          background-color: rgba(6, 182, 212, 0.12);
          color: var(--cyan);
        }

        .profile-dept-badge {
          font-size: 0.55rem;
          font-weight: 500;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 0.02rem 0.25rem;
          border-radius: var(--radius-sm);
        }

        .btn-logout-footer:hover {
          background-color: rgba(239, 68, 68, 0.08) !important;
          border-color: var(--danger) !important;
        }
      `})]})},ke=null,Ae=null,je=null,Me=()=>{let e=localStorage.getItem(`assetwatch_firebase_config`);if(!e)return null;try{let t=JSON.parse(e);if(t&&t.apiKey&&t.projectId)return t}catch(e){console.error(`Error parsing stored Firebase config:`,e)}return null},Ne=e=>{try{return localStorage.setItem(`assetwatch_firebase_config`,JSON.stringify(e)),localStorage.setItem(`assetwatch_force_base64_images`,`true`),Fe(e)}catch(e){return console.error(`Error saving Firebase config:`,e),!1}},Pe=()=>{localStorage.removeItem(`assetwatch_firebase_config`),localStorage.removeItem(`assetwatch_force_base64_images`),ke=null,Ae=null,je=null},Fe=e=>{try{return k().length>0&&(ke=_e()),ke=ye(e,`AssetWatchApp`),Ae=M(ke),je=I(ke),!0}catch(e){return console.error(`Firebase initialization failed:`,e),!1}},Ie=Me();Ie&&(localStorage.getItem(`assetwatch_force_base64_images`)===null&&localStorage.setItem(`assetwatch_force_base64_images`,`true`),Fe(Ie));var Le=()=>({isConfigured:!!Ae,db:Ae,storage:je,app:ke}),K=null,Re=(e=!0)=>{try{let t=window.AudioContext||window.webkitAudioContext;if(!t)return;let n=new t,r=n.createOscillator(),i=n.createGain();r.type=`sine`,e?(r.frequency.setValueAtTime(2050,n.currentTime),i.gain.setValueAtTime(.18,n.currentTime),i.gain.exponentialRampToValueAtTime(.001,n.currentTime+.08),r.connect(i),i.connect(n.destination),r.start(),r.stop(n.currentTime+.08)):(r.frequency.setValueAtTime(350,n.currentTime),i.gain.setValueAtTime(.2,n.currentTime),i.gain.exponentialRampToValueAtTime(.001,n.currentTime+.2),r.connect(i),i.connect(n.destination),r.start(),r.stop(n.currentTime+.2))}catch{}},ze=({onScanSuccess:e,onScanFailure:t,onCloseCamera:n,isPaused:r=!1})=>{let[i,a]=(0,W.useState)(null),[o,s]=(0,W.useState)(!1),[c,l]=(0,W.useState)(``),[u,d]=(0,W.useState)(null),[p,m]=(0,W.useState)(!0),[h,_]=(0,W.useState)(0),[y,b]=(0,W.useState)(1),[x,S]=(0,W.useState)(!1),[T,ee]=(0,W.useState)(!1),[,te]=(0,W.useState)(!1),[E,ne]=(0,W.useState)(null),[re,se]=(0,W.useState)(!0),[ue,fe]=(0,W.useState)(null),[pe,me]=(0,W.useState)(!1),O=(0,W.useRef)(null),k=(0,W.useRef)(null),A=(0,W.useRef)(null),he=(0,W.useRef)(0),ge=(0,W.useRef)(!1),j=(0,W.useRef)(!0),_e=(0,W.useRef)(r);(0,W.useEffect)(()=>{_e.current=r},[r]);let M=(0,W.useRef)(`assetwatch-qr-reader-${Math.random().toString(36).slice(2,7)}`).current,N=(0,W.useCallback)((e,t)=>({width:Math.min(Math.floor(e*.84),480),height:Math.min(Math.floor(t*.48),240)}),[]),P=(0,W.useCallback)(t=>{if(!(_e.current||ge.current)){ge.current=!0,fe(t),Re(!0);try{typeof navigator<`u`&&navigator.vibrate&&navigator.vibrate([45,30,45])}catch{}e(t),setTimeout(()=>{j.current&&(ge.current=!1,fe(null))},1200)}},[e]),F=(0,W.useCallback)(async(e,t)=>{try{let n=document.querySelector(`#${M} video`);if(!n||!n.srcObject)return;let r=n.srcObject.getVideoTracks()[0];if(!r)return;k.current=r;let i=r.getCapabilities?r.getCapabilities():{};i.torch!==void 0&&te(!0),i.zoom&&S(!0);let a={};if(i.focusMode&&Array.isArray(i.focusMode)&&i.focusMode.includes(`continuous`)&&(a.focusMode=`continuous`),i.exposureMode&&Array.isArray(i.exposureMode)&&i.exposureMode.includes(`continuous`)&&(a.exposureMode=`continuous`),i.whiteBalanceMode&&Array.isArray(i.whiteBalanceMode)&&i.whiteBalanceMode.includes(`continuous`)&&(a.whiteBalanceMode=`continuous`),i.zoom){let t=i.zoom.min||1,n=i.zoom.max||5;a.zoom=Math.min(Math.max(e,t),n)}i.torch!==void 0&&(a.torch=t),Object.keys(a).length>0&&await r.applyConstraints({advanced:[a]})}catch(e){console.warn(`Hardware track constraints adjustment:`,e)}},[M]),I=async e=>{b(e),await F(e,T)},L=async()=>{let e=!T;ee(e),await F(y,e)},R=async e=>{let t=e.currentTarget.getBoundingClientRect();ne({x:e.clientX-t.left,y:e.clientY-t.top}),setTimeout(()=>{j.current&&ne(null)},1e3);try{if(k.current){let e=k.current,t=e.getCapabilities?e.getCapabilities():{};t.focusMode&&t.focusMode.includes(`continuous`)&&await e.applyConstraints({advanced:[{focusMode:`continuous`}]})}}catch(e){console.warn(`Tap-to-focus trigger:`,e)}},ve=e=>{let t=e.videoWidth,n=e.videoHeight;if(!t||!n)return null;let r=e.closest(`.video-container`),i=r&&r.offsetWidth>0?r.offsetWidth:360,a=r&&r.offsetHeight>0?r.offsetHeight:360,o=Math.max(i/t,a/n),s=t*o,c=n*o,l=(s-i)/2,u=(c-a)/2,d=Math.min(i*.84,480),f=Math.min(a*.48,240),p=(i-d)/2,m=(a-f)/2,h=Math.max(0,Math.floor((p+l)/o)),g=Math.max(0,Math.floor((m+u)/o));return{cropX:h,cropY:g,cropW:Math.min(t-h,Math.floor(d/o)),cropH:Math.min(n-g,Math.floor(f/o))}},z=(0,W.useCallback)(async e=>{let t=null,n=!1;if(typeof window<`u`&&`BarcodeDetector`in window)try{let e=window.BarcodeDetector,r=[`code_128`,`code_39`,`qr_code`,`ean_13`,`ean_8`];if(typeof e.getSupportedFormats==`function`){let t=await e.getSupportedFormats();r=r.filter(e=>t.includes(e)),n=t.includes(`code_128`)}r.length>0&&(t=new e({formats:r}))}catch{t=null}let r=new Map;r.set(Ce.POSSIBLE_FORMATS,[U.CODE_128,U.CODE_39,U.QR_CODE,U.EAN_13,U.EAN_8]),r.set(Ce.TRY_HARDER,!0);let i=new Ee;i.setHints(r);let a=document.createElement(`canvas`);a.width=720,a.height=360;let o=a.getContext(`2d`,{willReadFrequently:!0});me(!0);let s=!1,c=async r=>{if(j.current){if(!e||e.paused||e.ended||_e.current||ge.current){A.current=requestAnimationFrame(c);return}if(r-he.current>=75&&(he.current=r,!s&&e.readyState>=2)){s=!0;try{if(o){let r=ve(e);if(r&&r.cropW>0&&r.cropH>0){if(o.drawImage(e,r.cropX,r.cropY,r.cropW,r.cropH,0,0,720,360),t&&n)try{let e=await t.detect(a);if(e&&e.length>0&&e[0].rawValue){P(e[0].rawValue),s=!1,A.current=requestAnimationFrame(c);return}}catch{}try{let e=new Te(new Se(new we(a))),t=i.decode(e);if(t&&t.getText()){P(t.getText()),s=!1,A.current=requestAnimationFrame(c);return}}catch{try{let e=new Te(new be(new we(a))),t=i.decode(e);if(t&&t.getText()){P(t.getText()),s=!1,A.current=requestAnimationFrame(c);return}}catch{}}if(t&&!n)try{let e=await t.detect(a);if(e&&e.length>0&&e[0].rawValue){P(e[0].rawValue),s=!1,A.current=requestAnimationFrame(c);return}}catch{}}}}catch{}finally{s=!1}}A.current=requestAnimationFrame(c)}};A.current=requestAnimationFrame(c)},[P]),B=(0,W.useCallback)(async()=>{A.current&&=(cancelAnimationFrame(A.current),null);let e=O.current;if(O.current=null,e)try{e.isScanning&&await e.stop(),await e.clear()}catch{}try{k.current&&=(k.current.stop(),null);let e=document.querySelector(`#${M} video`);e&&(e.pause(),e.srcObject&&=(e.srcObject.getTracks().forEach(e=>{try{e.stop()}catch{}}),null))}catch(e){console.warn(`Error releasing media tracks:`,e)}let t=document.getElementById(M);t&&(t.innerHTML=``)},[M]);return(0,W.useEffect)(()=>{j.current=!0;let e=!1,n=async(r=0)=>{if(!(e||!j.current)){if(m(!0),_(r),K)try{await K}catch{}try{let n={facingMode:`environment`};try{let e=await xe.getCameras();if(e&&e.length>0){let t=e.find(e=>e.label.toLowerCase().includes(`back`)||e.label.toLowerCase().includes(`environment`)||e.label.toLowerCase().includes(`rear`)||e.label.toLowerCase().includes(`0, facing back`)||e.label.toLowerCase().includes(`main`));t&&(n=t.id,d(t.id))}}catch{n={facingMode:`environment`}}if(e||!j.current)return;a(!0);let i=new xe(M,{verbose:!1,formatsToSupport:[H.CODE_128,H.CODE_39,H.QR_CODE,H.EAN_13,H.EAN_8],experimentalFeatures:{useBarCodeDetectorIfSupported:!1}});O.current=i;let o=r===0?{facingMode:`environment`,width:{ideal:1920},height:{ideal:1080}}:r===1?{facingMode:`environment`,width:{ideal:1280},height:{ideal:720}}:{facingMode:`environment`};if(await i.start(n,{fps:12,qrbox:N,videoConstraints:o},e=>{P(e)},e=>{t&&t(e)}),e||!j.current){await B();return}m(!1),setTimeout(()=>{if(!j.current||e)return;F(1,!1);let t=document.querySelector(`#${M} video`);t&&z(t)},350)}catch(t){if(console.warn(`Camera startup error (attempt ${r+1}):`,t),r<3&&t?.name!==`NotAllowedError`&&(await new Promise(e=>setTimeout(e,400*(r+1))),!e&&j.current))return n(r+1);!e&&j.current&&(a(!1),s(!0),m(!1))}}},r=async()=>{if(document.visibilityState===`visible`&&j.current&&!o){let e=document.querySelector(`#${M} video`);if(e&&e.paused)try{await e.play()}catch{O.current&&!O.current.isScanning&&n(0)}}};if(document.addEventListener(`visibilitychange`,r),!o){let t=setTimeout(()=>{n(0)},150);return()=>{e=!0,j.current=!1,clearTimeout(t),document.removeEventListener(`visibilitychange`,r),K=B().then(()=>new Promise(e=>setTimeout(e,150)))}}return()=>{e=!0,j.current=!1,document.removeEventListener(`visibilitychange`,r),K=B()}},[o,F,P,z,B,M]),o?(0,G.jsxs)(`div`,{className:`scanner-fallback-container`,children:[(0,G.jsx)(f,{size:32,className:`fallback-icon`}),(0,G.jsx)(`h4`,{children:`โหมดป้อนรหัสด้วยตัวเอง`}),(0,G.jsx)(`p`,{className:`fallback-desc`,children:`กล้องไม่พร้อมใช้งานชั่วคราว หรืออุปกรณ์ไม่อนุญาตการเปิดกล้องผ่านเบราว์เซอร์ โปรดป้อนรหัสครุภัณฑ์เพื่อตรวจงาน`}),(0,G.jsxs)(`form`,{onSubmit:e=>{e.preventDefault(),c.trim()&&(P(c.trim()),l(``))},className:`manual-scan-form`,children:[(0,G.jsx)(`input`,{type:`text`,className:`form-input manual-scan-input`,placeholder:`เช่น 6901-001-0001`,value:c,onChange:e=>l(e.target.value),autoFocus:!0,required:!0}),(0,G.jsx)(`button`,{type:`submit`,className:`btn btn-primary manual-scan-btn`,children:`ค้นหาและตรวจงาน`})]}),(0,G.jsxs)(`button`,{type:`button`,className:`btn-retry-camera`,onClick:()=>{s(!1),a(null)},children:[(0,G.jsx)(v,{size:14}),` 🔄 ลองเปิดกล้องอีกครั้ง`]})]}):(0,G.jsxs)(`div`,{className:`scanner-wrapper ${r?`scanner-is-paused`:``}`,children:[(0,G.jsxs)(`div`,{className:`scanner-header-bar`,children:[(0,G.jsx)(`div`,{className:`scanner-title-group`,children:r?(0,G.jsxs)(`span`,{style:{fontSize:`0.78rem`,color:`#fbbf24`,display:`flex`,alignItems:`center`,gap:`5px`},children:[(0,G.jsx)(oe,{size:13}),` พักกล้องชั่วคราว (สแตนด์บาย)`]}):(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`div`,{className:`live-dot-pulse`}),(0,G.jsx)(`span`,{style:{fontSize:`0.78rem`},children:`กล้องสแกนพร้อมทำงาน`}),pe&&(0,G.jsxs)(`span`,{className:`badge-ai-engine`,title:`ระบบใช้ Neural Engine ตรวจจับบาร์โค้ดระดับฮาร์ดแวร์ความเร็วสูง`,children:[(0,G.jsx)(w,{size:11}),` AI Hardware Mode`]})]})}),(0,G.jsxs)(`div`,{className:`scanner-controls`,children:[(0,G.jsx)(`button`,{type:`button`,className:`scanner-control-btn ${T?`active-torch`:``}`,onClick:L,title:T?`ปิดไฟฉาย`:`เปิดไฟฉายช่วยสแกนในที่มืด`,style:{background:T?`rgba(234, 179, 8, 0.35)`:`rgba(255, 255, 255, 0.1)`},children:T?(0,G.jsx)(ie,{size:15,color:`#eab308`}):(0,G.jsx)(ce,{size:15,color:`#ffffff`})}),(0,G.jsx)(`button`,{type:`button`,className:`scanner-control-btn`,onClick:async()=>{if(O.current)try{let e=await xe.getCameras();if(e&&e.length>1){await B();let n=e[(e.findIndex(e=>e.id===u)+1)%e.length].id;d(n);let r=new xe(M,{verbose:!1,formatsToSupport:[H.CODE_128,H.CODE_39,H.QR_CODE,H.EAN_13,H.EAN_8],experimentalFeatures:{useBarCodeDetectorIfSupported:!1}});O.current=r,await r.start(n,{fps:12,qrbox:N,videoConstraints:{width:{ideal:1920},height:{ideal:1080}}},e=>P(e),t),setTimeout(()=>{F(y,T);let e=document.querySelector(`#${M} video`);e&&z(e)},350)}}catch(e){console.error(`Error switching camera:`,e)}},title:`สลับกล้อง / เลนส์`,children:(0,G.jsx)(de,{size:15,color:`#ffffff`})}),(0,G.jsx)(`button`,{type:`button`,className:`scanner-control-btn`,onClick:()=>{B(),s(!0)},title:`ป้อนรหัสด้วยมือ`,children:(0,G.jsx)(f,{size:15,color:`#ffffff`})}),n&&(0,G.jsx)(`button`,{type:`button`,className:`scanner-control-btn btn-close-cam`,onClick:n,title:`ปิดกล้องสแกนเนอร์`,style:{background:`rgba(239, 68, 68, 0.2)`},children:(0,G.jsx)(ae,{size:15,color:`#ef4444`})})]})]}),(0,G.jsxs)(`div`,{className:`video-container`,onClick:R,children:[(0,G.jsx)(`div`,{id:M,className:`scanner-view`}),p&&(0,G.jsxs)(`div`,{className:`scanner-connecting-overlay`,children:[(0,G.jsx)(de,{size:24,className:`animate-spin text-primary`}),(0,G.jsx)(`span`,{children:h>0?`กำลังเชื่อมต่อกล้องใหม่... (ครั้งที่ ${h+1}/3)`:`กำลังเริ่มการทำงานกล้อง...`})]}),r&&(0,G.jsxs)(`div`,{className:`scanner-paused-overlay`,children:[(0,G.jsx)(oe,{size:36,color:`#fbbf24`,style:{opacity:.8}}),(0,G.jsx)(`span`,{children:`สแตนด์บาย — ระบบพร้อมสแกนทันทีเมื่อกดชิ้นถัดไป`})]}),!r&&(0,G.jsxs)(`div`,{className:`scanner-overlay-aim`,children:[(0,G.jsx)(`div`,{className:`aim-corner top-left`}),(0,G.jsx)(`div`,{className:`aim-corner top-right`}),(0,G.jsx)(`div`,{className:`aim-corner bottom-left`}),(0,G.jsx)(`div`,{className:`aim-corner bottom-right`}),(0,G.jsx)(`div`,{className:`scan-laser-line`}),ue&&(0,G.jsxs)(`div`,{className:`scan-locked-badge animate-fade-in`,children:[(0,G.jsx)(le,{size:18,color:`#10b981`}),(0,G.jsxs)(`span`,{children:[`ตรวจพบ: `,ue]})]})]}),E&&(0,G.jsx)(`div`,{className:`focus-ring-pulse`,style:{left:E.x,top:E.y},children:(0,G.jsx)(g,{size:32,color:`#fbbf24`})}),!r&&x&&(0,G.jsxs)(`div`,{className:`zoom-selector-pill`,onClick:e=>e.stopPropagation(),children:[(0,G.jsxs)(`div`,{className:`zoom-label`,children:[(0,G.jsx)(D,{size:12}),` ซูม`]}),[1,1.5,2,2.5,3].map(e=>(0,G.jsxs)(`button`,{type:`button`,className:`zoom-opt-btn ${y===e?`active`:``}`,onClick:()=>I(e),children:[e,`x`]},e))]})]}),re&&!r&&(0,G.jsxs)(`div`,{className:`scanner-focus-tip`,children:[(0,G.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.45rem`,flex:1},children:[(0,G.jsx)(`span`,{style:{fontSize:`1rem`},children:`💡`}),(0,G.jsxs)(`span`,{children:[(0,G.jsx)(`strong`,{children:`คำแนะนำการสแกน:`}),` วางบาร์โค้ดให้อยู่ใน `,(0,G.jsx)(`strong`,{children:`กรอบสีฟ้าตรงกลาง`}),` เท่านั้น (ระบบจะตัดส่วนรอบนอกออกเพื่อป้องกันการสแกนผิดตัว) ระยะห่าง 15–20 ซม. หากเบลอแตะหน้าจอ 1 ครั้งเพื่อโฟกัส`]})]}),(0,G.jsx)(`button`,{type:`button`,onClick:()=>se(!1),style:{background:`none`,border:`none`,color:`rgba(255,255,255,0.6)`,cursor:`pointer`,fontSize:`0.75rem`,padding:`2px`},children:`✕`})]}),i===!1&&(0,G.jsxs)(`div`,{className:`scanner-permission-alert`,children:[(0,G.jsx)(C,{size:18}),(0,G.jsx)(`span`,{children:`ไม่ได้รับอนุญาตให้เข้าถึงกล้อง โปรดตั้งค่าอนุญาตเบราว์เซอร์ของคุณ`})]}),(0,G.jsx)(`style`,{children:`
        .scanner-wrapper {
          width: 100%;
          background-color: #0b0f19;
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        }

        .scanner-header-bar {
          background-color: rgba(17, 24, 39, 0.95);
          padding: 0.65rem 0.9rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .scanner-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #ffffff;
          font-weight: 600;
          flex-wrap: wrap;
        }

        .badge-ai-engine {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.4);
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 0.65rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .live-dot-pulse {
          width: 6px;
          height: 6px;
          background-color: var(--danger);
          border-radius: 50%;
          animation: scanner-dot-pulse 1.2s infinite;
        }

        @keyframes scanner-dot-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.4; }
          100% { transform: scale(1); opacity: 1; }
        }

        .scanner-controls {
          display: flex;
          gap: 0.4rem;
        }

        .scanner-control-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .scanner-control-btn:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .video-container {
          position: relative;
          width: 100%;
          background-color: #000000;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: crosshair;
          overflow: hidden;
        }

        .scanner-connecting-overlay,
        .scanner-paused-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11, 15, 25, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          z-index: 20;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
          padding: 1rem;
        }

        .scanner-view {
          width: 100% !important;
          height: 100% !important;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .scanner-view > div {
          width: 100% !important;
          height: 100% !important;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .scanner-view video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          will-change: transform;
        }

        /* Target Reticle Styles */
        .scanner-overlay-aim {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 84%;
          height: 48%;
          max-width: 480px;
          max-height: 240px;
          border: 1.5px solid rgba(59, 130, 246, 0.65);
          border-radius: var(--radius-sm);
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.52);
        }

        #qr-shaded-region {
          display: none !important;
        }

        .aim-corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border-color: #3b82f6;
          border-style: solid;
          pointer-events: none;
        }

        .top-left { top: -2px; left: -2px; border-width: 4px 0 0 4px; border-top-left-radius: 6px; }
        .top-right { top: -2px; right: -2px; border-width: 4px 4px 0 0; border-top-right-radius: 6px; }
        .bottom-left { bottom: -2px; left: -2px; border-width: 0 0 4px 4px; border-bottom-left-radius: 6px; }
        .bottom-right { bottom: -2px; right: -2px; border-width: 0 4px 4px 0; border-bottom-right-radius: 6px; }

        .scan-laser-line {
          position: absolute;
          width: 96%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #38bdf8, transparent);
          box-shadow: 0 0 12px #38bdf8;
          animation: scan-laser 1.8s ease-in-out infinite;
        }

        @keyframes scan-laser {
          0% { top: 8%; }
          50% { top: 90%; }
          100% { top: 8%; }
        }

        .scan-locked-badge {
          background: rgba(16, 185, 129, 0.9);
          color: #ffffff;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
        }

        /* Tap to Focus Ring */
        .focus-ring-pulse {
          position: absolute;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 15;
          animation: focus-ring-anim 0.8s ease-out forwards;
        }

        @keyframes focus-ring-anim {
          0% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
          40% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          80% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }

        /* Zoom Selector Pill Overlaid */
        .zoom-selector-pill {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 22px;
          padding: 3px 6px;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 12;
          box-shadow: 0 4px 14px rgba(0,0,0,0.45);
        }

        .zoom-label {
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.75);
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 0 4px;
          font-weight: 600;
        }

        .zoom-opt-btn {
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 0.725rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .zoom-opt-btn.active {
          background: #3b82f6;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.6);
        }

        .zoom-opt-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.18);
        }

        /* Focus Tip Banner */
        .scanner-focus-tip {
          background: rgba(15, 23, 42, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.55rem 0.85rem;
          font-size: 0.75rem;
          line-height: 1.45;
          color: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .scanner-focus-tip strong {
          color: #fbbf24;
        }

        .scanner-permission-alert {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 0.75rem;
          background-color: rgba(239, 68, 68, 0.95);
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.775rem;
          font-weight: 600;
          justify-content: center;
          z-index: 12;
        }

        /* Fallback Styles */
        .scanner-fallback-container {
          padding: 2.5rem 1.5rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: var(--glass-shadow);
        }

        .fallback-icon {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .fallback-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0.25rem 0 1.5rem 0;
          max-width: 320px;
          line-height: 1.5;
        }

        .manual-scan-form {
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .manual-scan-input {
          text-align: center;
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .manual-scan-btn {
          width: 100%;
        }

        .btn-retry-camera {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          text-decoration: underline;
        }
      `})]})},Be=({onSetupComplete:e})=>{let[n,r]=(0,W.useState)(`welcome`),[i,a]=(0,W.useState)(``),[o,s]=(0,W.useState)(null),[c,l]=(0,W.useState)(!1);return(0,G.jsxs)(`div`,{className:`wizard-backdrop`,children:[(0,G.jsxs)(`div`,{className:`wizard-card glass-panel animate-fade-in`,children:[n===`welcome`&&(0,G.jsxs)(`div`,{className:`wizard-content`,children:[(0,G.jsx)(`div`,{className:`wizard-hero-icon`,children:(0,G.jsx)(w,{size:40,className:`glow-icon`})}),(0,G.jsx)(`h1`,{className:`wizard-title`,children:`ยินดีต้อนรับสู่ระบบจัดการครุภัณฑ์ AMIS`}),(0,G.jsx)(`p`,{className:`wizard-desc`,children:`ระบบสแกนตรวจนับและจัดการครุภัณฑ์ผ่านเว็บแอปพลิเคชัน ช่วยอำนวยความสะดวกให้ฝ่ายพัสดุตรวจนับครุภัณฑ์ผ่านมือถือได้พร้อมกันหลายคน`}),(0,G.jsxs)(`div`,{className:`wizard-choices`,children:[(0,G.jsxs)(`button`,{className:`choice-card`,onClick:()=>r(`firebase`),children:[(0,G.jsx)(`div`,{className:`choice-icon primary-gradient`,children:(0,G.jsx)(t,{size:24,color:`#ffffff`})}),(0,G.jsxs)(`div`,{className:`choice-text`,children:[(0,G.jsx)(`h3`,{children:`เชื่อมต่อ Firebase Cloud Database`}),(0,G.jsx)(`p`,{children:`เก็บข้อมูลออนไลน์ร่วมกันแบบเรียลไทม์ เหมาะสำหรับการใช้งานจริงแบบกลุ่ม`})]})]}),(0,G.jsxs)(`button`,{className:`choice-card`,onClick:()=>r(`qr`),children:[(0,G.jsx)(`div`,{className:`choice-icon success-gradient`,children:(0,G.jsx)(m,{size:24,color:`#ffffff`})}),(0,G.jsxs)(`div`,{className:`choice-text`,children:[(0,G.jsx)(`h3`,{children:`สแกนเข้าร่วมฐานข้อมูลด้วย QR Code`}),(0,G.jsx)(`p`,{children:`สำหรับโทรศัพท์มือถือของทีมงาน สแกน QR Code จากหน้าจอแอดมินเพื่อเชื่อมต่อทันที`})]})]}),(0,G.jsxs)(`button`,{className:`choice-card choice-demo`,onClick:()=>{e()},children:[(0,G.jsx)(`div`,{className:`choice-icon warning-gradient`,children:(0,G.jsx)(_,{size:24,color:`#ffffff`})}),(0,G.jsxs)(`div`,{className:`choice-text`,children:[(0,G.jsx)(`h3`,{children:`ทดลองใช้งานออฟไลน์ (Demo Mode)`}),(0,G.jsx)(`p`,{children:`เล่นได้ทันทีแบบไม่มีค่าใช้จ่าย ข้อมูลจะบันทึกชั่วคราวในบราวเซอร์นี้เท่านั้น`})]})]})]}),(0,G.jsx)(`div`,{className:`wizard-footer-note`,children:`พัฒนาเพื่อติดตั้งและโฮสต์ผ่าน GitHub Pages ได้อย่างปลอดภัย 100%`})]}),n===`firebase`&&(0,G.jsxs)(`div`,{className:`wizard-content`,children:[(0,G.jsx)(`h2`,{className:`wizard-title`,children:`ตั้งค่าการเชื่อมต่อ Firebase`}),(0,G.jsx)(`p`,{className:`wizard-desc`,children:`วางข้อมูลการตั้งค่า **Firebase SDK Configuration** เพื่อเปิดใช้งานฐานข้อมูลแบบออนไลน์ร่วมกัน`}),(0,G.jsxs)(`form`,{onSubmit:t=>{t.preventDefault(),s(null),l(!0);try{let t=i.trim();if(t.includes(`const firebaseConfig =`)){let e=t.match(/const firebaseConfig = ({[\s\S]+?});/);e&&e[1]&&(t=e[1])}let n=(e=>Function(`return ${e};`)())(t);n&&n.apiKey&&n.projectId?Ne({apiKey:n.apiKey,authDomain:n.authDomain||`${n.projectId}.firebaseapp.com`,projectId:n.projectId,storageBucket:n.storageBucket||`${n.projectId}.appspot.com`,messagingSenderId:n.messagingSenderId||``,appId:n.appId||``})?e():s(`การตั้งค่าล้มเหลว โปรดตรวจสอบสิทธิ์การอ่านเขียนของ Firebase Credentials`):s(`รูปแบบข้อมูลไม่ถูกต้อง โปรดตรวจสอบว่ามีช่อง "apiKey" และ "projectId"`)}catch(e){console.error(e),s(`ไม่สามารถอ่านข้อมูล Config ได้: ${e.message||`โปรดตรวจสอบความถูกต้องของวงเล็บปีกกาและเครื่องหมายจุลภาค`}`)}finally{l(!1)}},className:`wizard-form`,children:[(0,G.jsxs)(`div`,{className:`form-group`,children:[(0,G.jsx)(`label`,{className:`form-label`,children:`Firebase Config Snippet (JS หรือ JSON)`}),(0,G.jsx)(`textarea`,{className:`form-textarea config-textarea`,placeholder:`{
  apiKey: "AIzaSy...",
  authDomain: "...",
  projectId: "assetwatch-...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}`,value:i,onChange:e=>a(e.target.value),required:!0})]}),o&&(0,G.jsxs)(`div`,{className:`alert alert-danger animate-fade-in`,children:[(0,G.jsx)(ne,{size:20}),(0,G.jsx)(`span`,{children:o})]}),(0,G.jsxs)(`div`,{className:`wizard-helper-box`,children:[(0,G.jsx)(`h4`,{children:`💡 วิธีเปิดใช้งาน Firebase ของตัวเอง:`}),(0,G.jsxs)(`ol`,{children:[(0,G.jsxs)(`li`,{children:[`สร้างโปรเจกต์ใหม่ใน `,(0,G.jsx)(`a`,{href:`https://console.firebase.google.com/`,target:`_blank`,rel:`noreferrer`,children:`Firebase Console`})]}),(0,G.jsxs)(`li`,{children:[`สร้าง `,(0,G.jsx)(`strong`,{children:`Web App`}),` ในโปรเจกต์ของคุณ`]}),(0,G.jsxs)(`li`,{children:[`คัดลอกส่วน `,(0,G.jsx)(`code`,{children:`firebaseConfig`}),` มาวางลงในกล่องด้านบน`]}),(0,G.jsxs)(`li`,{children:[`เปิดบริการ `,(0,G.jsx)(`strong`,{children:`Cloud Firestore`}),` และ `,(0,G.jsx)(`strong`,{children:`Cloud Storage`}),` ในคอนโซล`]})]})]}),(0,G.jsxs)(`div`,{className:`form-actions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:()=>r(`welcome`),children:`ย้อนกลับ`}),(0,G.jsx)(`button`,{type:`submit`,className:`btn btn-primary`,disabled:c,children:c?`กำลังเชื่อมต่อ...`:`บันทึกและเชื่อมต่อ Cloud`})]})]})]}),n===`qr`&&(0,G.jsxs)(`div`,{className:`wizard-content`,children:[(0,G.jsx)(`h2`,{className:`wizard-title`,children:`สแกนเชื่อมต่อ`}),(0,G.jsxs)(`p`,{className:`wizard-desc`,children:[`อนุญาตให้ใช้กล้องมือถือแล้วสแกน `,(0,G.jsx)(`strong`,{children:`QR Code การตั้งค่าคลาวด์`}),` จากหน้าจอคอมพิวเตอร์ของหัวหน้างาน`]}),(0,G.jsx)(`div`,{className:`qr-scanner-box`,children:(0,G.jsx)(ze,{onScanSuccess:t=>{s(null);try{let n=JSON.parse(t);n&&n.apiKey&&n.projectId?Ne(n)?e():s(`การเชื่อมต่อผ่าน QR Code ล้มเหลว โปรดสแกน QR Code ที่ถูกต้อง`):s(`QR Code นี้ไม่ใช่การตั้งค่าของ AMIS`)}catch{s(`ไม่สามารถถอดรหัส QR Code ได้ โปรดสแกนการแชร์ข้อมูลจากหน้าตั้งค่าของเครื่องอื่น`)}}})}),o&&(0,G.jsxs)(`div`,{className:`alert alert-danger animate-fade-in`,style:{marginTop:`1rem`},children:[(0,G.jsx)(ne,{size:20}),(0,G.jsx)(`span`,{children:o})]}),(0,G.jsx)(`div`,{className:`form-actions`,style:{marginTop:`1.5rem`},children:(0,G.jsx)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:()=>r(`welcome`),children:`ย้อนกลับ`})})]})]}),(0,G.jsx)(`style`,{children:`
        .wizard-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle at top right, rgba(59,130,246,0.1), transparent 40%),
                      radial-gradient(circle at bottom left, rgba(6,182,212,0.1), transparent 40%),
                      var(--bg-primary);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .wizard-card {
          width: 100%;
          max-width: 600px;
          padding: 2.5rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
        }

        .wizard-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .wizard-hero-icon {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, var(--primary-light), var(--info-light));
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
          border: 1px solid var(--border);
        }

        .glow-icon {
          color: var(--primary);
          animation: logo-glow 3s infinite alternate;
        }

        @keyframes logo-glow {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px var(--primary)); }
          100% { transform: scale(1.15); filter: drop-shadow(0 0 12px var(--info)); }
        }

        .wizard-title {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
        }

        .wizard-desc {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          max-width: 480px;
          line-height: 1.6;
        }

        .wizard-choices {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .choice-card {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
          background-color: var(--bg-secondary);
          border: 1.5px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .choice-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.05);
        }

        .choice-demo:hover {
          border-color: var(--warning);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.05);
        }

        .choice-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .primary-gradient { background: linear-gradient(135deg, var(--primary), #2563eb); }
        .success-gradient { background: linear-gradient(135deg, var(--success), #059669); }
        .warning-gradient { background: linear-gradient(135deg, var(--warning), #d97706); }

        .choice-text h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.15rem;
        }

        .choice-text p {
          font-size: 0.825rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .wizard-footer-note {
          font-size: 0.775rem;
          color: var(--text-muted);
          margin-top: 1rem;
        }

        .wizard-form {
          width: 100%;
          text-align: left;
        }

        .config-textarea {
          font-family: monospace;
          font-size: 0.85rem;
          min-height: 180px;
          background-color: var(--bg-primary);
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 550;
          margin-bottom: 1.5rem;
        }

        .alert-danger {
          background-color: var(--danger-light);
          color: var(--danger);
          border: 1px solid var(--danger);
        }

        .wizard-helper-box {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
        }

        .wizard-helper-box h4 {
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .wizard-helper-box ol {
          padding-left: 1.25rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .wizard-helper-box a {
          color: var(--primary);
          text-decoration: underline;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          width: 100%;
        }

        .qr-scanner-box {
          width: 100%;
          max-width: 380px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 2px solid var(--border);
          background-color: #000000;
        }

        @media (max-width: 576px) {
          .wizard-card {
            padding: 1.5rem;
          }
          .wizard-title {
            font-size: 1.4rem;
          }
          .choice-card {
            gap: 0.75rem;
            padding: 0.75rem;
          }
          .choice-icon {
            width: 40px;
            height: 40px;
          }
        }
      `})]})},Ve=({assets:e,repairs:t,surveys:n,setCurrentTab:r,currentUser:a})=>{let o=a?.role===`admin`||a?.role===`manager`,s=a?.department,c=o?e:e.filter(e=>e.department===s),l=o?t:t.filter(t=>e.find(e=>e.id===t.assetId)?.department===s),u=o?n:n.filter(t=>e.find(e=>e.id===t.assetId)?.department===s),d=c.length,f=l.filter(e=>e.status!==`completed`).length,p=new Date().toISOString().split(`T`)[0],h=u.filter(e=>{try{return new Date(e.timestamp).toISOString().split(`T`)[0]===p}catch{return!1}}).length,g=new Set(u.map(e=>e.assetId)).size,v=d>0?Math.round(g/d*100):0,b=c.reduce((e,t)=>(e[t.status]=(e[t.status]||0)+1,e),{}),x={ใช้งานได้:`success`,ชำรุด:`danger`,รอจำหน่าย:`warning`,ขอป้ายรหัสใหม่:`info`,รอโอน:`primary`,อื่นๆ:`muted`},C=l.slice(0,3);return(0,G.jsxs)(`div`,{className:`dashboard-wrapper animate-fade-in`,children:[(0,G.jsxs)(`div`,{className:`dashboard-header`,children:[(0,G.jsxs)(`div`,{children:[(0,G.jsx)(`h1`,{children:`แผงควบคุมหลัก (Dashboard)`}),(0,G.jsx)(`p`,{className:`subtitle`,children:o?`ภาพรวมสถิติมูลค่าและการสำรวจครุภัณฑ์ขององค์กรในปัจจุบัน`:`ข้อมูลเฉพาะฝ่าย: ${s||`ไม่ระบุ`}`})]}),(0,G.jsx)(`div`,{className:`dashboard-header-actions`,children:(0,G.jsxs)(`button`,{className:`btn btn-primary btn-sm`,onClick:()=>r(`module3`),children:[(0,G.jsx)(i,{size:16}),` เพิ่มครุภัณฑ์ใหม่`]})})]}),(0,G.jsxs)(`div`,{className:`stats-grid`,children:[(0,G.jsxs)(`div`,{className:`stat-card glass-panel`,children:[(0,G.jsx)(`div`,{className:`stat-icon-wrapper bg-blue-light`,children:(0,G.jsx)(_,{size:24,className:`text-blue`})}),(0,G.jsxs)(`div`,{className:`stat-info`,children:[(0,G.jsx)(`span`,{className:`stat-label`,children:`ครุภัณฑ์ในระบบทั้งหมด`}),(0,G.jsxs)(`h3`,{className:`stat-value`,children:[d,` `,(0,G.jsx)(`span`,{className:`stat-unit`,children:`รายการ`})]})]})]}),(0,G.jsxs)(`div`,{className:`stat-card glass-panel`,children:[(0,G.jsx)(`div`,{className:`stat-icon-wrapper bg-red-light`,children:(0,G.jsx)(y,{size:24,className:`text-red`})}),(0,G.jsxs)(`div`,{className:`stat-info`,children:[(0,G.jsx)(`span`,{className:`stat-label`,children:`อยู่ระหว่างการส่งซ่อม`}),(0,G.jsxs)(`h3`,{className:`stat-value`,children:[f,` `,(0,G.jsx)(`span`,{className:`stat-unit`,children:`รายการ`})]})]})]}),(0,G.jsxs)(`div`,{className:`stat-card glass-panel`,children:[(0,G.jsx)(`div`,{className:`stat-icon-wrapper bg-emerald-light`,children:(0,G.jsx)(m,{size:24,className:`text-emerald`})}),(0,G.jsxs)(`div`,{className:`stat-info`,children:[(0,G.jsx)(`span`,{className:`stat-label`,children:`แสกนสำรวจพบแล้ววันนี้`}),(0,G.jsxs)(`h3`,{className:`stat-value`,children:[h,` `,(0,G.jsx)(`span`,{className:`stat-unit`,children:`ครั้ง`})]})]})]}),(0,G.jsxs)(`div`,{className:`stat-card glass-panel`,children:[(0,G.jsx)(`div`,{className:`stat-icon-wrapper bg-cyan-light`,children:(0,G.jsx)(se,{size:24,className:`text-cyan`})}),(0,G.jsxs)(`div`,{className:`stat-info`,children:[(0,G.jsx)(`span`,{className:`stat-label`,children:`ความคืบหน้าการสำรวจปีนี้`}),(0,G.jsxs)(`h3`,{className:`stat-value`,children:[v,`% `,(0,G.jsxs)(`span`,{className:`stat-unit`,children:[`(`,g,`/`,d,`)`]})]})]})]})]}),(0,G.jsxs)(`div`,{className:`dashboard-content-grid`,children:[(0,G.jsxs)(`div`,{className:`grid-card glass-panel col-span-7`,children:[(0,G.jsxs)(`div`,{className:`card-header`,children:[(0,G.jsx)(`h3`,{children:`สัดส่วนสถานะครุภัณฑ์ปัจจุบัน`}),(0,G.jsx)(`span`,{className:`card-header-sub`,children:`สถิติแบ่งตามประเภทความพร้อมการใช้งาน`})]}),(0,G.jsx)(`div`,{className:`status-bars-container`,children:Object.keys(x).map(e=>{let t=b[e]||0,n=d>0?Math.round(t/d*100):0,r=x[e];return(0,G.jsxs)(`div`,{className:`status-bar-row`,children:[(0,G.jsxs)(`div`,{className:`status-bar-label-group`,children:[(0,G.jsxs)(`span`,{className:`status-bar-name`,children:[(0,G.jsx)(`span`,{className:`status-dot dot-${r}`}),e]}),(0,G.jsxs)(`span`,{className:`status-bar-values`,children:[(0,G.jsx)(`strong`,{children:t}),` รายการ (`,n,`%)`]})]}),(0,G.jsx)(`div`,{className:`progress-bar-bg`,children:(0,G.jsx)(`div`,{className:`progress-bar-fill fill-${r}`,style:{width:`${n}%`}})})]},e)})}),(0,G.jsxs)(`div`,{className:`survey-progress-box`,children:[(0,G.jsxs)(`div`,{className:`survey-progress-text`,children:[(0,G.jsx)(`h4`,{children:`🎯 การสำรวจครุภัณฑ์พร้อมกันแบบกลุ่ม (Multi-user Survey)`}),(0,G.jsx)(`p`,{children:`ระบบอนุญาตให้เปิดเว็บโปรแกรมผ่านโทรศัพท์มือถือหลายเครื่องพร้อมกันเพื่อสแกนบาร์โค้ดตรวจนับได้แบบเรียลไทม์`})]}),(0,G.jsxs)(`button`,{className:`btn btn-secondary`,onClick:()=>r(`module2`),children:[(0,G.jsx)(m,{size:16}),` เริ่มแสกนสำรวจพัสดุ`]})]})]}),(0,G.jsxs)(`div`,{className:`grid-card glass-panel col-span-5`,children:[(0,G.jsxs)(`div`,{className:`card-header`,children:[(0,G.jsx)(`h3`,{children:`ประวัติการแจ้งซ่อมล่าสุด`}),(0,G.jsx)(`span`,{className:`card-header-sub`,children:`เคสซ่อมแซมที่ต้องการการติดตาม`})]}),(0,G.jsx)(`div`,{className:`recent-repairs-list`,children:C.length===0?(0,G.jsxs)(`div`,{className:`empty-repairs-state`,children:[(0,G.jsx)(S,{size:32,color:`var(--success)`}),(0,G.jsx)(`p`,{children:`ไม่มีรายการแจ้งซ่อมค้างในขณะนี้`})]}):C.map(e=>(0,G.jsxs)(`div`,{className:`mini-repair-card`,children:[(0,G.jsxs)(`div`,{className:`mini-repair-meta`,children:[(0,G.jsx)(`span`,{className:`badge ${e.status===`open`?`badge-danger`:e.status===`sent`?`badge-warning`:`badge-success`}`,children:e.status===`open`?`แจ้งซ่อมใหม่`:e.status===`sent`?`ส่งร้านซ่อมแล้ว`:`ซ่อมเสร็จแล้ว`}),(0,G.jsx)(`span`,{className:`mini-repair-date`,children:e.dateOpened})]}),(0,G.jsx)(`h4`,{className:`mini-repair-title`,children:e.assetName}),(0,G.jsx)(`p`,{className:`mini-repair-desc`,children:e.symptom})]},e.id))}),(0,G.jsx)(`button`,{className:`btn btn-secondary w-full`,style:{marginTop:`1.25rem`},onClick:()=>r(`module5_repair`),children:`ดูรายการส่งซ่อมทั้งหมด`})]})]}),(0,G.jsx)(`style`,{children:`
        .dashboard-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dashboard-header h1 {
          font-size: 1.6rem;
          font-weight: 800;
        }

        .dashboard-header .subtitle {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .stat-card {
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Color classes */
        .bg-blue-light { background-color: var(--primary-light); }
        .text-blue { color: var(--primary); }
        
        .bg-red-light { background-color: var(--danger-light); }
        .text-red { color: var(--danger); }
        
        .bg-emerald-light { background-color: var(--success-light); }
        .text-emerald { color: var(--success); }
        
        .bg-cyan-light { background-color: var(--info-light); }
        .text-cyan { color: var(--info); }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.775rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .stat-value {
          font-size: 1.35rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .stat-unit {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .dashboard-content-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1.5rem;
        }

        .col-span-7 { grid-column: span 7; }
        .col-span-5 { grid-column: span 5; }

        .grid-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.75rem;
        }

        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 750;
        }

        .card-header-sub {
          font-size: 0.775rem;
          color: var(--text-muted);
        }

        /* Status Bars */
        .status-bars-container {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          flex: 1;
        }

        .status-bar-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .status-bar-label-group {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .status-bar-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 550;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot-success { background-color: var(--success); }
        .dot-danger { background-color: var(--danger); }
        .dot-warning { background-color: var(--warning); }
        .dot-info { background-color: var(--info); }
        .dot-primary { background-color: var(--primary); }
        .dot-muted { background-color: var(--text-muted); }

        .progress-bar-bg {
          width: 100%;
          height: 8px;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.8s ease-out;
        }

        .fill-success { background-color: var(--success); }
        .fill-danger { background-color: var(--danger); }
        .fill-warning { background-color: var(--warning); }
        .fill-info { background-color: var(--info); }
        .fill-primary { background-color: var(--primary); }
        .fill-muted { background-color: var(--text-muted); }

        .survey-progress-box {
          margin-top: 1.5rem;
          padding: 1rem 1.25rem;
          background-color: var(--primary-light);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .survey-progress-text h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--primary);
        }

        .survey-progress-text p {
          font-size: 0.775rem;
          color: var(--text-secondary);
          margin-top: 0.15rem;
          line-height: 1.4;
        }

        /* Recent repairs list */
        .recent-repairs-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          flex: 1;
        }

        .empty-repairs-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          gap: 0.75rem;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .mini-repair-card {
          padding: 0.85rem 1rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mini-repair-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mini-repair-date {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .mini-repair-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .mini-repair-desc {
          font-size: 0.775rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .w-full {
          width: 100%;
        }

        @media (max-width: 992px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-content-grid {
            grid-template-columns: 1fr;
          }
          .col-span-7, .col-span-5 {
            grid-column: span 12;
          }
        }

        @media (max-width: 576px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .dashboard-header-actions {
            width: 100%;
          }
          .dashboard-header-actions button {
            width: 100%;
          }
          .survey-progress-box {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .survey-progress-box button {
            width: 100%;
          }
        }
      `})]})},He=class extends W.Component{state={hasError:!1,error:null};static getDerivedStateFromError(e){return{hasError:!0,error:e}}componentDidCatch(e,t){console.error(`Uncaught error in component:`,e,t)}handleReset=()=>{this.setState({hasError:!1,error:null}),window.location.reload()};render(){return this.state.hasError?(0,G.jsxs)(`div`,{style:{padding:`2.5rem 1.5rem`,maxWidth:`560px`,margin:`2rem auto`,background:`var(--bg-secondary, #1e293b)`,border:`1px solid var(--border, rgba(255,255,255,0.1))`,borderRadius:`12px`,textAlign:`center`,boxShadow:`0 10px 25px rgba(0,0,0,0.3)`,color:`var(--text-primary, #ffffff)`},children:[(0,G.jsx)(`div`,{style:{display:`inline-flex`,padding:`0.75rem`,background:`rgba(239, 68, 68, 0.15)`,borderRadius:`50%`,marginBottom:`1rem`,color:`#ef4444`},children:(0,G.jsx)(C,{size:36})}),(0,G.jsx)(`h3`,{style:{fontSize:`1.25rem`,fontWeight:800,margin:`0 0 0.5rem 0`},children:this.props.fallbackTitle||`เกิดข้อผิดพลาดในการแสดงผล`}),(0,G.jsx)(`p`,{style:{fontSize:`0.85rem`,color:`var(--text-secondary, #94a3b8)`,margin:`0 0 1.5rem 0`,lineHeight:1.5},children:this.state.error?.message||`ระบบพบปัญหาชั่วคราวในการประมวลผลข้อมูลหน้านี้`}),(0,G.jsxs)(`div`,{style:{display:`flex`,justifyContent:`center`,gap:`0.75rem`},children:[(0,G.jsx)(`button`,{type:`button`,className:`btn btn-primary`,onClick:()=>this.setState({hasError:!1,error:null}),style:{display:`inline-flex`,alignItems:`center`,gap:`0.4rem`,padding:`0.5rem 1.25rem`},children:`ลองใหม่อีกครั้ง`}),(0,G.jsxs)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:this.handleReset,style:{display:`inline-flex`,alignItems:`center`,gap:`0.4rem`,padding:`0.5rem 1.25rem`},children:[(0,G.jsx)(de,{size:15}),` รีโหลดหน้าเว็บ`]})]})]}):this.props.children}},Ue=({options:e,value:t,onChange:n,placeholder:r=`พิมพ์เพื่อค้นหาหรือเลือก...`,disabled:a=!1,label:o,icon:s,required:c=!1,compact:l=!1,clearable:u=!1,allowCustom:d=!0,containerStyle:f,triggerStyle:p,className:m=``,dropdownWidth:h})=>{let[g,_]=(0,W.useState)(!1),[v,y]=(0,W.useState)(``),b=(0,W.useRef)(null),x=(0,W.useRef)(null),S=(0,W.useMemo)(()=>e.map(e=>typeof e==`string`?{value:e,label:e}:e),[e]),C=(0,W.useMemo)(()=>S.find(e=>e.value===t)||(t&&t.trim()?{value:t,label:t}:null),[S,t]),w=(0,W.useMemo)(()=>{let e=v.toLowerCase().trim();return e?S.filter(t=>t.label.toLowerCase().includes(e)||t.value.toLowerCase().includes(e)):S},[S,v]),T=(0,W.useMemo)(()=>{let e=v.toLowerCase().trim();return e?S.some(t=>t.value.toLowerCase()===e||t.label.toLowerCase()===e):!0},[S,v]);(0,W.useEffect)(()=>{let e=e=>{b.current&&!b.current.contains(e.target)&&_(!1)};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[]),(0,W.useEffect)(()=>{g?setTimeout(()=>{x.current?.focus()},50):y(``)},[g]);let E=e=>{n(e),_(!1)},ne=e=>{e.stopPropagation(),n(``)};return(0,G.jsxs)(`div`,{className:`searchable-select-container ${l?``:`form-group`} ${m}`,style:{position:`relative`,marginBottom:l?0:void 0,...f},ref:b,children:[o&&(0,G.jsxs)(`label`,{className:`form-label`,style:{display:`block`,marginBottom:`0.35rem`},children:[o,` `,c&&(0,G.jsx)(`span`,{style:{color:`var(--danger)`},children:`*`})]}),(0,G.jsxs)(`div`,{onClick:()=>!a&&_(!g),className:`form-input`,style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,cursor:a?`not-allowed`:`pointer`,background:a?`var(--bg-tertiary)`:`var(--bg-secondary)`,borderColor:g?`var(--primary)`:`var(--border)`,opacity:a?.65:1,padding:l?`0.35rem 0.65rem`:`0.65rem 0.85rem`,height:l?`36px`:void 0,borderRadius:`var(--radius-sm)`,userSelect:`none`,fontSize:l?`0.825rem`:void 0,...p},children:[(0,G.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.45rem`,overflow:`hidden`,flex:1},children:[s&&(0,G.jsx)(`span`,{style:{display:`flex`,alignItems:`center`,flexShrink:0},children:s}),(0,G.jsx)(`span`,{style:{color:C&&C.value!==``?`var(--text-primary)`:`var(--text-muted)`,fontWeight:C&&C.value!==``?600:400,textOverflow:`ellipsis`,overflow:`hidden`,whiteSpace:`nowrap`},children:C?C.label:r})]}),(0,G.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.25rem`,flexShrink:0,marginLeft:`0.35rem`},children:[u&&t&&!a&&(0,G.jsx)(`span`,{onClick:ne,title:`ล้างค่าที่เลือก`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`0.15rem`,borderRadius:`50%`,color:`var(--text-muted)`,cursor:`pointer`},onMouseEnter:e=>{e.currentTarget.style.color=`var(--danger)`},onMouseLeave:e=>{e.currentTarget.style.color=`var(--text-muted)`},children:(0,G.jsx)(te,{size:13})}),(0,G.jsx)(ee,{size:14,color:`var(--text-muted)`,style:{transition:`transform 0.2s`,transform:g?`rotate(180deg)`:`none`}})]})]}),g&&(0,G.jsxs)(`div`,{className:`glass-panel`,style:{position:`absolute`,top:`100%`,left:0,right:h?void 0:0,width:h||`100%`,minWidth:`220px`,marginTop:`0.35rem`,maxHeight:`260px`,overflowY:`auto`,zIndex:1e3,padding:`0.4rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`,boxShadow:`var(--shadow-lg)`,background:`var(--bg-secondary)`},children:[(0,G.jsxs)(`div`,{style:{position:`relative`,marginBottom:`0.4rem`},children:[(0,G.jsx)(fe,{size:13,color:`var(--text-muted)`,style:{position:`absolute`,left:`0.6rem`,top:`50%`,transform:`translateY(-50%)`}}),(0,G.jsx)(`input`,{ref:x,type:`text`,className:`form-input`,style:{width:`100%`,padding:`0.35rem 0.65rem 0.35rem 1.7rem`,fontSize:`0.785rem`,borderRadius:`var(--radius-sm)`,height:`30px`},placeholder:`พิมพ์เพื่อค้นหา หรือพิมพ์ชื่อใหม่...`,value:v,onChange:e=>y(e.target.value),onKeyDown:e=>{e.key===`Enter`?(e.preventDefault(),w.length>0?E(w[0].value):d&&v.trim()&&E(v.trim())):e.key===`Escape`&&_(!1)},onClick:e=>e.stopPropagation()})]}),d&&v.trim()&&!T&&(0,G.jsxs)(`div`,{onClick:()=>E(v.trim()),style:{padding:`0.45rem 0.65rem`,fontSize:`0.8rem`,borderRadius:`var(--radius-sm)`,cursor:`pointer`,background:`rgba(59, 130, 246, 0.12)`,color:`var(--primary)`,fontWeight:700,display:`flex`,alignItems:`center`,gap:`0.35rem`,border:`1px dashed var(--primary)`,marginBottom:`0.35rem`,transition:`all 0.15s ease`},onMouseEnter:e=>{e.currentTarget.style.background=`rgba(59, 130, 246, 0.2)`},onMouseLeave:e=>{e.currentTarget.style.background=`rgba(59, 130, 246, 0.12)`},children:[(0,G.jsx)(i,{size:14}),(0,G.jsxs)(`span`,{children:[`ใช้ค่าที่พิมพ์: "`,(0,G.jsx)(`strong`,{children:v.trim()}),`"`]})]}),(0,G.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.15rem`},children:w.length===0&&(!d||!v.trim())?(0,G.jsx)(`div`,{style:{fontSize:`0.8rem`,color:`var(--text-muted)`,textAlign:`center`,padding:`0.85rem`},children:`❌ ไม่พบตัวเลือกที่ตรงกัน`}):w.map(e=>{let n=e.value===t;return(0,G.jsxs)(`div`,{onClick:()=>E(e.value),style:{padding:`0.4rem 0.65rem`,fontSize:`0.8rem`,borderRadius:`var(--radius-sm)`,cursor:`pointer`,background:n?`rgba(59, 130, 246, 0.15)`:`transparent`,color:n?`var(--primary)`:`var(--text-secondary)`,fontWeight:n?700:500,transition:`all 0.15s ease`,display:`flex`,alignItems:`center`,justifyContent:`space-between`},onMouseEnter:e=>{n||(e.currentTarget.style.background=`var(--bg-tertiary)`,e.currentTarget.style.color=`var(--text-primary)`)},onMouseLeave:e=>{n||(e.currentTarget.style.background=`transparent`,e.currentTarget.style.color=`var(--text-secondary)`)},children:[(0,G.jsx)(`span`,{children:e.label}),n&&(0,G.jsx)(`span`,{style:{fontSize:`0.75rem`,color:`var(--primary)`},children:`✓`})]},e.value)})})]})]})},We=[{id:`6901-001-0001`,name:`คอมพิวเตอร์ All-in-One Dell Inspiron 5415`,imageUrl:`https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=60`,receivedDate:`2024-05-10`,source:`เงินงบประมาณแผ่นดินปี 2567`,location:`ห้องทำงานไอที ชั้น 3`,department:`ฝ่ายเทคโนโลยีสารสนเทศ`,responsiblePerson:`นายสมชาย ใจดี`,note:`ใช้งานทั่วไปในสำนักงาน รหัสครุภัณฑ์หลักของกลุ่มงานพัฒนาเว็บบอร์ด`,status:`ใช้งานได้`,createdAt:`2024-05-10T09:00:00.000Z`,updatedAt:`2024-05-10T09:00:00.000Z`},{id:`6901-001-0002`,name:`เครื่องปรับอากาศ Daikin Inverter 18,000 BTU`,imageUrl:`https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=600&auto=format&fit=crop&q=60`,receivedDate:`2023-03-15`,source:`เงินงบประมาณแผ่นดินปี 2566`,location:`ห้องประชุมใหญ่ ชั้น 4`,department:`ฝ่ายบริหารทั่วไป`,responsiblePerson:`นางสาวศิริพร บุญพรม`,note:`บำรุงรักษาล่าสุดเมื่อวันที่ 12 ธ.ค. 2568`,status:`ใช้งานได้`,createdAt:`2023-03-15T10:30:00.000Z`,updatedAt:`2023-03-15T10:30:00.000Z`},{id:`6901-002-0015`,name:`เก้าอี้ทำงานเพื่อสุขภาพ Ergonomic Steelcase Gesture`,imageUrl:`https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=60`,receivedDate:`2025-01-20`,source:`เงินรายได้สะสมหน่วยงาน`,location:`ห้องผู้อำนวยการ ชั้น 5`,department:`ฝ่ายบริหารทั่วไป`,responsiblePerson:`ดร.วิชัย รักษ์ดี`,note:`เบาะหุ้มผ้าสีเทา โครงพลาสติกดำ ปรับระดับได้ทุกทิศทาง`,status:`ใช้งานได้`,createdAt:`2025-01-20T08:15:00.000Z`,updatedAt:`2025-01-20T08:15:00.000Z`},{id:`6901-003-0044`,name:`เครื่องพิมพ์เลเซอร์มัลติฟังก์ชัน HP LaserJet Enterprise`,imageUrl:`https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=60`,receivedDate:`2022-11-05`,source:`เงินงบประมาณแผ่นดินปี 2565`,location:`ห้องธุรการ ชั้น 2`,department:`ฝ่ายธุรการและสารบรรณ`,responsiblePerson:`นางมณีรัตน์ เรียนรู้`,note:`มีอาการกระดาษติดบ่อยครั้ง รอการตรวจซ่อมอย่างเป็นทางการ`,status:`ชำรุด`,createdAt:`2022-11-05T14:20:00.000Z`,updatedAt:`2022-11-05T14:20:00.000Z`},{id:`6901-004-0010`,name:`โต๊ะทำงานไม้สักทอง 4 ลิ้นชัก`,imageUrl:`https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=60`,receivedDate:`2018-06-01`,source:`บริจาคโดย ศิษย์เก่าสมาคม`,location:`ห้องเก็บของ ชั้น 1`,department:`ฝ่ายบริหารทั่วไป`,responsiblePerson:`นายสมชาย ใจดี`,note:`สภาพเก่ามาก กุญแจลิ้นชักหาย ขาโต๊ะชำรุดผุพัง รอเสนอจำหน่ายออกจากคลัง`,status:`รอจำหน่าย`,createdAt:`2018-06-01T09:00:00.000Z`,updatedAt:`2026-05-28T09:00:00.000Z`}],Ge=[{id:`audit-1`,assetId:`6901-001-0001`,assetName:`คอมพิวเตอร์ All-in-One Dell Inspiron 5415`,action:`create`,operator:`แอดมิน สมชาย`,timestamp:`2024-05-10T09:00:00.000Z`,details:`ลงทะเบียนครุภัณฑ์ใหม่เข้าสู่ฐานข้อมูล`},{id:`audit-2`,assetId:`6901-004-0010`,assetName:`โต๊ะทำงานไม้สักทอง 4 ลิ้นชัก`,action:`edit`,operator:`หัวหน้าฝ่าย บริหาร`,timestamp:`2026-05-28T09:00:00.000Z`,changes:{status:{old:`ใช้งานได้`,new:`รอจำหน่าย`},location:{old:`ห้องธุรการ ชั้น 2`,new:`ห้องเก็บของ ชั้น 1`}},details:`เปลี่ยนสถานะครุภัณฑ์เป็น รอจำหน่าย และย้ายสถานที่จัดเก็บไปยังห้องเก็บของเนื่องจากโครงสร้างเสื่อมสภาพ`}],Ke=[{id:`rep-20260528-001`,assetId:`6901-003-0044`,assetName:`เครื่องพิมพ์เลเซอร์มัลติฟังก์ชัน HP LaserJet Enterprise`,symptom:`ลูกยางดึงกระดาษเสื่อมสภาพ ดึงกระดาษเบี้ยวและกระดาษติดเกือบทุกครั้งที่สั่งพิมพ์มากกว่า 5 แผ่น`,symptomImageUrl:`https://images.unsplash.com/photo-1563168817-21a415a774b7?w=600&auto=format&fit=crop&q=60`,dateOpened:`2026-05-28`,status:`open`,operator:`สมชาย ผู้แจ้ง`,updatedAt:`2026-05-28T15:00:00.000Z`}],qe=[{id:`dept-1`,name:`ฝ่ายเทคโนโลยีสารสนเทศ`,locations:[`ห้องทำงานไอที ชั้น 3`,`ห้องเซิร์ฟเวอร์ ชั้น 3`,`ห้องเก็บของไอที ชั้น 3`]},{id:`dept-2`,name:`ฝ่ายบริหารทั่วไป`,locations:[`ห้องประชุมใหญ่ ชั้น 4`,`ห้องผู้อำนวยการ ชั้น 5`,`ห้องธุรการ ชั้น 2`,`ห้องเก็บของ ชั้น 1`]},{id:`dept-3`,name:`ฝ่ายธุรการและสารบรรณ`,locations:[`ห้องธุรการ ชั้น 2`,`ห้องเก็บเอกสาร ชั้น 2`]},{id:`dept-4`,name:`ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา`,locations:`BR 00 Cleanroom.BR 1 Air lock 1.BR 2 Changing room 1 (women).BR 3 Changing room 2 (women).BR 4 Changing room 1 (men).BR 5 Changing room 2 (men).BR 6 Air lock 2.BR 7 Air shower.BR 8 Corridor 1.BR 9 Raw material entrance 1.BR 10 Raw material entrance 2.BR 11 Tube printing and cutting room.BR 12 Raw material storage.BR 13 Welding room.BR 14 Tube assembly room.BR 15 Completed empty set storage.BR 16 Air lock 3.BR 17 Corridor 2.BR 18 Laundry 1.BR 19 Laundry 2.BR 20 Equipment sterilizing room.BR 21 Equipment cleaning room.BR 22 Chemical storage.BR 23 Weighing room.BR 24 Mixing room.BR 25 Air lock 4.BR 26 Filling room.BR 27 Pre-sterilization room.BR 28 Air lock 5.BR 29 Air lock 6.BR 30 Changing room (men).BR 31 Changing room (women).BR 32 Autoclave room.BR 33 Inspection room.BR 34 Packaging room.BR 35 Label printing room.BR 36 Pasteurization room.BR 37 Air lock 7.BR 38 Air lock 8.BR 40 Corridor 3.BR 41 Final packing room.BR 42 Equipment maintenance storage room.BR 43 Air compressor room.BR 44 Pharmacist room.BR 45 Chief's room.BR 46 Office.BR 47 Staff room.BR 48 Cleanroom surrounding.BR 49 AHU-F room.BR 50 Raw material storage 2.BR 51 Storage area 1.BR 52 Female restroom 1.BR 53 Staff room 2.BR 54 Male restroom 1.BR 55 Electric room.BR 56 Corridor 4.BR 57 Front department 1.BR 58 Entrance.BR 59 Maintenance floor.BR 60 Corridor 6.BR 61 Entrance 2.BR 62 Raw Material Storage 3.BR 63 Equipment Cleaning Room.BR 64 Equipment Preparation Room 1.BR 65 Equipment Preparation Room 2.BR 66 AHU Room.BR 67 Repair & Maintenance Room.BR 68 Water Distillation Room.BR 69 Autoclave Room.BR 70 Corridor 7.BR 71 Finished Product Room 1.BR 72 Solution Preparation Room.BR 73 Finished Product Room 2.BR 74 Retain, Reject, and Recall Product Room.BR 75 Staff room 3.BR 76 Storage area 2.BR 77 Female restroom 2.BR 78 Staff room 4.BR 79 Male restroom 2.BR 80 Corridor 8.BR 81 Front Department 2.BR 90 Water Treatment floor.BR 91 Plasma Building Storage Room.BR 98 Cleanroom C.BR 99 Cleanroom D`.split(`.`)}],q=[{id:`user-admin`,username:`admin`,password:`admin`,name:`แอดมินสูงสุด (System Admin)`,role:`admin`,department:``,isBlocked:!1,createdAt:`2026-01-01T00:00:00.000Z`},{id:`user-manager`,username:`manager`,password:`123`,name:`ผู้อำนวยการศูนย์ฯ (Manager Executive)`,role:`manager`,department:``,isBlocked:!1,createdAt:`2026-02-01T00:00:00.000Z`},{id:`user-head-blood`,username:`head_blood`,password:`123`,name:`หัวหน้าฝ่ายผลิตผลิตภัณฑ์เลือด (Head)`,role:`head`,department:`ฝ่ายผลิตผลิตภัณฑ์เลือด`,isBlocked:!1,createdAt:`2026-02-10T00:00:00.000Z`},{id:`user-op-blood`,username:`op_blood`,password:`123`,name:`เจ้าหน้าที่ปฏิบัติงานฝ่ายผลิตเลือด (Operator)`,role:`operator`,department:`ฝ่ายผลิตผลิตภัณฑ์เลือด`,isBlocked:!1,createdAt:`2026-02-15T00:00:00.000Z`},{id:`user-head-qa`,username:`head_qa`,password:`123`,name:`หัวหน้าฝ่ายประกันคุณภาพ (Head QA)`,role:`head`,department:`ฝ่ายตรวจตราและประกันคุณภาพ`,isBlocked:!1,createdAt:`2026-03-01T00:00:00.000Z`},{id:`user-op-qa`,username:`op_qa`,password:`123`,name:`เจ้าหน้าที่ฝ่ายประกันคุณภาพ (Operator QA)`,role:`operator`,department:`ฝ่ายตรวจตราและประกันคุณภาพ`,isBlocked:!1,createdAt:`2026-03-05T00:00:00.000Z`},{id:`user-blocked`,username:`blocked`,password:`123`,name:`ผู้ใช้ที่ถูกระงับสิทธิ์`,role:`operator`,department:`ฝ่ายบริหารทั่วไป`,isBlocked:!0,createdAt:`2026-04-10T00:00:00.000Z`}],Je=[{id:`contract-1`,contractNumber:`PM-IT-2569-01`,title:`สัญญาจ้างบริการซ่อมบำรุงรักษาคอมพิวเตอร์และเครื่องพิมพ์ประจำปี`,vendorName:`บริษัท ซิสเต็มส์เซอร์วิส แอนด์ โซลูชัน จำกัด`,startDate:`2026-01-01`,endDate:`2026-12-31`,pmFrequency:`quarterly`,assetIds:[`6901-001-0001`,`6901-003-0044`],contactPerson:`คุณอนุรักษ์ ไอทีแมน`,contactPhone:`089-123-4567`},{id:`contract-2`,contractNumber:`PM-AC-2569-02`,title:`สัญญาจ้างบริการบำรุงรักษาและล้างเครื่องปรับอากาศประจำปี`,vendorName:`บริษัท ไทยคูลลิ่ง เซอร์วิส จำกัด`,startDate:`2026-01-01`,endDate:`2026-12-31`,pmFrequency:`semi-annually`,assetIds:[`6901-001-0002`],contactPerson:`ช่างสมยศ ลมเย็น`,contactPhone:`081-987-6543`}],Ye=[{id:`sched-1`,contractId:`contract-1`,assetId:`6901-001-0001`,assetName:`คอมพิวเตอร์ All-in-One Dell Inspiron 5415`,plannedDate:`2026-03-15`,status:`completed`,completedDate:`2026-03-14`,details:`1. เป่าฝุ่นทำความสะอาดอุปกรณ์ฮาร์ดแวร์ภายนอก
2. ตรวจสอบสถานะการเชื่อมต่อเครือข่าย
3. อัปเดตแพตช์ความปลอดภัยระบบปฏิบัติการ Windows ล่าสุด`,operator:`เจ้าหน้าที่ไอที`,proofImageUrl:`https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=60`,notes:`เครื่องทำงานได้ปกติดี พัดลมระบายความร้อนเสียงไม่ดัง`},{id:`sched-2`,contractId:`contract-1`,assetId:`6901-001-0001`,assetName:`คอมพิวเตอร์ All-in-One Dell Inspiron 5415`,plannedDate:`2026-06-15`,status:`completed`,completedDate:`2026-06-12`,details:`1. สแกนตรวจสอบมัลแวร์และไวรัสในระบบ
2. ตรวจเช็คพื้นที่จัดเก็บ SSD
3. ล้างทำความสะอาดแผงคีย์บอร์ดและหน้าจอ`,operator:`เจ้าหน้าที่ไอที`,proofImageUrl:`https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=60`,notes:`ลบไฟล์ขยะเพิ่มพื้นที่ได้ 45GB`},{id:`sched-3`,contractId:`contract-1`,assetId:`6901-001-0001`,assetName:`คอมพิวเตอร์ All-in-One Dell Inspiron 5415`,plannedDate:`2026-09-15`,status:`pending`},{id:`sched-4`,contractId:`contract-2`,assetId:`6901-001-0002`,assetName:`เครื่องปรับอากาศ Daikin Inverter 18,000 BTU`,plannedDate:`2026-05-10`,status:`completed`,completedDate:`2026-05-09`,details:`1. ล้างแผ่นกรองอากาศ (Filter)
2. วัดระดับน้ำยาแอร์ (R32) และเติมส่วนขาด
3. ล้างคอยล์ร้อนคอยล์เย็น`,operator:`เจ้าหน้าที่บริหารทั่วไป`,proofImageUrl:`https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=600&auto=format&fit=crop&q=60`,notes:`กระแสไฟและน้ำยาอยู่ในเกณฑ์ปกติ ลมเย็นฉ่ำดี`},{id:`sched-5`,contractId:`contract-2`,assetId:`6901-001-0002`,assetName:`เครื่องปรับอากาศ Daikin Inverter 18,000 BTU`,plannedDate:`2026-11-10`,status:`pending`}],Xe=[{id:`sp-pump-01`,assetId:`0725634310001030003`,partCode:`SP-PUMP-FLT01`,name:`ไส้กรองอากาศและแผ่นกรองฝุ่นไอดี (Air Intake Filter)`,specification:`Atlas Copco OEM No. 1613-8720-00 (Grade High-Efficiency)`,brand:`Atlas Copco`,storageLocation:`ตู้เก็บอะไหล่ ช่างบำรุงรักษา ชั้น 2 (BR 43 Air Compressor Room)`,quantity:6,minQuantity:2,unit:`ชิ้น`,unitPrice:1450,supplier:`บริษัท โอซาร่า วิศวกรรม จำกัด / Atlas Copco Thailand`,supplierContact:`02-762-8000`,notes:`เปลี่ยนทุกๆ 2,000 ชั่วโมงการทำงาน หรือทุกรอบ PM 6 เดือน`,imageUrl:`https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60`,updatedAt:`2026-06-15T10:00:00.000Z`,transactions:[{id:`tx-pump-01`,partId:`sp-pump-01`,assetId:`0725634310001030003`,date:`2026-01-15`,type:`in`,quantity:8,balanceAfter:8,unitPrice:1450,totalPrice:11600,referenceDoc:`PO-6901-14 / ใบรับพัสดุ 014/69`,operator:`นายช่างสมชาย`,note:`สั่งซื้ออะไหล่สต็อกสำรองประจำปีงบประมาณ 2569`,createdAt:`2026-01-15T09:30:00.000Z`},{id:`tx-pump-02`,partId:`sp-pump-01`,assetId:`0725634310001030003`,date:`2026-06-15`,type:`out`,quantity:-2,balanceAfter:6,referenceDoc:`PM รอบที่ 1 (มิ.ย. 69)`,operator:`ประเสริฐพงษ์`,note:`เบิกเปลี่ยนไส้กรองรอบบำรุงรักษาเชิงป้องกันประจำปี`,createdAt:`2026-06-15T14:20:00.000Z`}]},{id:`sp-pump-02`,assetId:`0725634310001030003`,partCode:`SP-PUMP-OIL46`,name:`น้ำมันหล่อลื่นคอมเพรสเซอร์ Roto-Inject Fluid (5L)`,specification:`Atlas Copco Synthetic Lubricant ISO VG 46 (High Temp 100°C)`,brand:`Atlas Copco Genuine Fluid`,storageLocation:`ห้องสโตร์สารหล่อลื่น ชั้น 1 อาคารบำรุงรักษา`,quantity:4,minQuantity:2,unit:`แกลลอน`,unitPrice:2850,supplier:`บริษัท โอซาร่า วิศวกรรม จำกัด`,supplierContact:`081-987-6543`,notes:`ใช้สำหรับถ่ายเปลี่ยนน้ำมันเครื่องปั๊มลมหล่อเย็น`,imageUrl:`https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=60`,updatedAt:`2026-06-20T11:00:00.000Z`,transactions:[{id:`tx-pump-03`,partId:`sp-pump-02`,assetId:`0725634310001030003`,date:`2026-02-20`,type:`in`,quantity:5,balanceAfter:5,unitPrice:2850,totalPrice:14250,referenceDoc:`PO-6902-09`,operator:`เจ้าหน้าที่พัสดุ`,note:`รับเข้าสต็อกสำรอง 5 แกลลอน`,createdAt:`2026-02-20T10:00:00.000Z`},{id:`tx-pump-04`,partId:`sp-pump-02`,assetId:`0725634310001030003`,date:`2026-06-20`,type:`out`,quantity:-1,balanceAfter:4,referenceDoc:`PM รอบเปลี่ยนถ่ายน้ำมันหล่อลื่น`,operator:`ประเสริฐพงษ์`,note:`เบิกเติม 1 แกลลอน ระดับน้ำมันเต็มเกจ์วัดปกติ`,createdAt:`2026-06-20T11:00:00.000Z`}]},{id:`sp-pump-03`,assetId:`0725634310001030003`,partCode:`SP-PUMP-SEAL02`,name:`ชุดซีลโอริงและปะเก็นฝาครอบ (Gasket & O-Ring Kit)`,specification:`Viton High-Temp Resistance Set (Kit 2901-0999-00)`,brand:`Atlas Copco`,storageLocation:`ตู้เก็บอะไหล่ ช่างบำรุงรักษา ชั้น 2 (BR 43)`,quantity:3,minQuantity:1,unit:`ชุด`,unitPrice:1850,supplier:`Atlas Copco Thailand`,supplierContact:`02-762-8000`,notes:`ชุดซ่อมกันรั่วซึมฝาครอบวาล์วไอดี/ไอเสีย`,imageUrl:`https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=60`,updatedAt:`2026-03-01T09:00:00.000Z`,transactions:[{id:`tx-pump-05`,partId:`sp-pump-03`,assetId:`0725634310001030003`,date:`2026-03-01`,type:`in`,quantity:3,balanceAfter:3,unitPrice:1850,totalPrice:5550,referenceDoc:`PO-6903-12`,operator:`เจ้าหน้าที่พัสดุ`,note:`สั่งซื้อชุดซีลสำรอง 3 ชุด`,createdAt:`2026-03-01T09:00:00.000Z`}]},{id:`sp-pump-04`,assetId:`0725634310001030003`,partCode:`SP-PUMP-VLV04`,name:`โซลินอยด์วาล์วระบายแรงดัน (Solenoid Blow-off Valve 24V)`,specification:`24VDC 0.8 MPa Brass Body (NC Type)`,brand:`SMC Pneumatics`,storageLocation:`ชั้นวางอะไหล่ระบบนิวเมติกส์ ตู้ A-04`,quantity:2,minQuantity:1,unit:`ชิ้น`,unitPrice:3200,supplier:`SMC Thailand`,supplierContact:`02-019-5656`,notes:`สำหรับควบคุมการคายแรงดันตกค้างช่วง Unload`,imageUrl:`https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&auto=format&fit=crop&q=60`,updatedAt:`2026-04-12T14:00:00.000Z`,transactions:[{id:`tx-pump-06`,partId:`sp-pump-04`,assetId:`0725634310001030003`,date:`2026-04-12`,type:`in`,quantity:2,balanceAfter:2,unitPrice:3200,totalPrice:6400,referenceDoc:`PO-6904-05`,operator:`นายช่างสมชาย`,note:`รับเข้าสต็อก 2 ชิ้น`,createdAt:`2026-04-12T14:00:00.000Z`}]},{id:`sp-water-01`,assetId:`0725499999001990002`,partCode:`SP-WATER-RO01`,name:`ไส้กรองเมมเบรนกรองน้ำ RO Membrane 8040 (Filmtec)`,specification:`Dow Filmtec BW30-400 (High Rejection 99.5%)`,brand:`DuPont / Filmtec`,storageLocation:`ห้องเก็บไส้กรองระบบบำบัดน้ำ ชั้น 1`,quantity:4,minQuantity:2,unit:`ท่อน`,unitPrice:8500,supplier:`บริษัท วอเตอร์ทรีทเม้นท์ เอ็นจิเนียริ่ง จำกัด`,supplierContact:`02-555-1234`,notes:`เปลี่ยนทุก 2 ปี หรือเมื่อค่า TDS หลังกรองสูงเกิน 15 ppm`,updatedAt:`2026-05-01T09:00:00.000Z`,transactions:[{id:`tx-water-01`,partId:`sp-water-01`,assetId:`0725499999001990002`,date:`2026-05-01`,type:`in`,quantity:4,balanceAfter:4,unitPrice:8500,totalPrice:34e3,referenceDoc:`PO-6905-20`,operator:`เจ้าหน้าที่พัสดุ`,note:`รับเข้าสต็อกสำรอง 4 ท่อน`,createdAt:`2026-05-01T09:00:00.000Z`}]},{id:`sp-water-02`,assetId:`0725499999001990002`,partCode:`SP-WATER-RESIN`,name:`สารกรองเรซินแลกเปลี่ยนไอออน Cation Resin (25L)`,specification:`Strong Acid Cation Exchange Resin (Food Grade Na+ form)`,brand:`Purolite C100E`,storageLocation:`คลังเก็บสารเคมีและสารกรองน้ำ`,quantity:8,minQuantity:3,unit:`ถุง`,unitPrice:1950,supplier:`บริษัท วอเตอร์ทรีทเม้นท์ เอ็นจิเนียริ่ง จำกัด`,supplierContact:`02-555-1234`,notes:`ใช้สำหรับฟื้นฟูและเปลี่ยนสารกรองถัง Softener`,updatedAt:`2026-05-10T10:00:00.000Z`,transactions:[{id:`tx-water-02`,partId:`sp-water-02`,assetId:`0725499999001990002`,date:`2026-05-10`,type:`in`,quantity:10,balanceAfter:10,unitPrice:1950,totalPrice:19500,referenceDoc:`PO-6905-22`,operator:`เจ้าหน้าที่พัสดุ`,note:`รับเข้าสต็อก 10 ถุง`,createdAt:`2026-05-10T10:00:00.000Z`},{id:`tx-water-03`,partId:`sp-water-02`,assetId:`0725499999001990002`,date:`2026-07-01`,type:`out`,quantity:-2,balanceAfter:8,referenceDoc:`PM ล้างถัง Softener`,operator:`ประเสริฐพงษ์`,note:`เติมสารกรอง Softener ถัง A`,createdAt:`2026-07-01T15:00:00.000Z`}]}],Ze=()=>{try{let e=localStorage.getItem(`assetwatch_spare_parts`);if(e){let t=JSON.parse(e);if(Array.isArray(t)&&t.length>0)return t}}catch(e){console.error(`Failed to load spare parts from storage:`,e)}return Xe},Qe=e=>{try{localStorage.setItem(`assetwatch_spare_parts`,JSON.stringify(e))}catch(e){console.error(`Failed to save spare parts to storage:`,e)}},$e=[{id:`notif-1`,title:`📅 มีกำหนดการบำรุงรักษาคอมพิวเตอร์ (Dell AIO)`,message:`ครุภัณฑ์รหัส 6901-001-0001 มีแผนกำหนดเข้าทำ PM ไตรมาสที่ 3 ในวันที่ 2026-09-15 โปรดนัดหมายบริษัทช่างรับจ้างเข้าดำเนินการ`,targetDate:`2026-09-08`,isRead:!1,type:`pm_upcoming`,linkTo:`pm_cm`}],et=`modulepreload`,tt=function(e,t){return new URL(e,t).href},nt={},J=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=tt(t,n),t in nt)return;nt[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:et,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Y=()=>{let e=Le();return e.isConfigured&&e.db?{isFirebase:!0,db:e.db,storage:e.storage}:{isFirebase:!1,db:null,storage:null}},X=e=>{if(e==null)return null;if(Array.isArray(e))return e.filter(e=>e!==void 0).map(e=>typeof e==`object`&&e?X(e):e);if(typeof e==`object`){let t={};for(let[n,r]of Object.entries(e))r!==void 0&&(t[n]=typeof r==`object`&&r?X(r):r);return t}return e},rt=e=>{if(!e)return!1;let t=String(e.code||``).toLowerCase(),n=String(e.message||``).toLowerCase();return t.includes(`resource-exhausted`)||t.includes(`quota`)||n.includes(`resource_exhausted`)||n.includes(`quota exceeded`)||n.includes(`exceeded its quota`)||n.includes(`quota metric`)||n.includes(`quota limit`)},it=e=>{try{sessionStorage.setItem(`assetwatch_quota_exceeded`,`true`),typeof window<`u`&&window.dispatchEvent(new CustomEvent(`assetwatch-quota-exceeded`,{detail:{operation:e,timestamp:new Date().toISOString()}}))}catch{}},at=()=>{try{sessionStorage.removeItem(`assetwatch_quota_exceeded`),typeof window<`u`&&window.dispatchEvent(new CustomEvent(`assetwatch-quota-resolved`))}catch{}},ot=(e,t)=>e&&rt(e)?(console.warn(`[AssetWatch Quota Sentinel] Cloud quota exceeded during operation: ${t||`unknown`}`),it(t),!0):!1;typeof window<`u`&&window.addEventListener(`unhandledrejection`,e=>{e.reason&&ot(e.reason,`unhandled_rejection`)&&e.preventDefault()});var Z=()=>{if(localStorage.getItem(`assetwatch_assets`)||localStorage.setItem(`assetwatch_assets`,JSON.stringify(We)),localStorage.getItem(`assetwatch_audits`)||localStorage.setItem(`assetwatch_audits`,JSON.stringify(Ge)),localStorage.getItem(`assetwatch_users`)||localStorage.setItem(`assetwatch_users`,JSON.stringify(q)),localStorage.getItem(`assetwatch_repairs`)||localStorage.setItem(`assetwatch_repairs`,JSON.stringify(Ke)),localStorage.getItem(`assetwatch_surveys`)||localStorage.setItem(`assetwatch_surveys`,JSON.stringify([])),localStorage.getItem(`assetwatch_departments`)||localStorage.setItem(`assetwatch_departments`,JSON.stringify(qe)),localStorage.getItem(`assetwatch_contracts`)||localStorage.setItem(`assetwatch_contracts`,JSON.stringify(Je)),localStorage.getItem(`assetwatch_schedules`)||localStorage.setItem(`assetwatch_schedules`,JSON.stringify(Ye)),localStorage.getItem(`assetwatch_pm_notifications`)||localStorage.setItem(`assetwatch_pm_notifications`,JSON.stringify($e)),!localStorage.getItem(`assetwatch_survey_rounds`)){let e={id:`round-default`,name:`รอบสำรวจประจำปีงบประมาณ 2569 (ปีปัจจุบัน)`,dateCreated:new Date().toISOString(),status:`active`,totalAssets:5,surveyedAssets:0,completionRate:0,statusBreakdown:{ใช้งานได้:0,ชำรุด:0,รอจำหน่าย:0,ขอป้ายรหัสใหม่:0,รอโอน:0,อื่นๆ:0},operator:`ระบบอัตโนมัติ`};localStorage.setItem(`assetwatch_survey_rounds`,JSON.stringify([e]))}localStorage.getItem(`assetwatch_spare_parts`)||localStorage.setItem(`assetwatch_spare_parts`,JSON.stringify(Xe))};Z();var Q=(e,t)=>{try{localStorage.setItem(e,t)}catch(n){if(n?.name===`QuotaExceededError`||n?.code===22||n?.name===`NS_ERROR_DOM_QUOTA_REACHED`||n?.number===-2147024882){console.warn(`LocalStorage quota exceeded while writing "${e}". Auto-cleaning older Base64 images to free cache...`);try{let n=localStorage.getItem(`assetwatch_surveys`);if(n){let e=JSON.parse(n),t=e.map((t,n)=>n<e.length-10&&t.imageUrl&&t.imageUrl.startsWith(`data:image/`)?{...t,imageUrl:``}:t);localStorage.setItem(`assetwatch_surveys`,JSON.stringify(t))}let r=localStorage.getItem(`assetwatch_repairs`);if(r){let e=JSON.parse(r),t=e.map((t,n)=>{if(n<e.length-10){if(t.imageUrl&&typeof t.imageUrl==`string`&&t.imageUrl.startsWith(`data:image/`))return{...t,imageUrl:``};if(t.photo&&typeof t.photo==`string`&&t.photo.startsWith(`data:image/`))return{...t,photo:``}}return t});localStorage.setItem(`assetwatch_repairs`,JSON.stringify(t))}let i=localStorage.getItem(`assetwatch_audits`);if(i){let e=JSON.parse(i);Array.isArray(e)&&e.length>100&&localStorage.setItem(`assetwatch_audits`,JSON.stringify(e.slice(0,100)))}localStorage.setItem(e,t)}catch(t){console.warn(`Could not set "${e}" in LocalStorage even after auto-cleanup:`,t)}}else console.warn(`LocalStorage error for "${e}":`,n)}},st=async e=>new Promise(async t=>{try{window.pdfjsLib||await new Promise((e,t)=>{let n=document.createElement(`script`);n.src=`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js`,n.onload=()=>{try{window.pdfjsLib.GlobalWorkerOptions.workerSrc=`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`}catch{}e()},n.onerror=()=>t(Error(`Cannot load PDF library`)),document.head.appendChild(n)});let n=window.pdfjsLib,r=await e.arrayBuffer(),i=await(await n.getDocument({data:r}).promise).getPage(1),a=i.getViewport({scale:2}),o=document.createElement(`canvas`);o.width=a.width,o.height=a.height;let s=o.getContext(`2d`);if(!s){t(e);return}s.fillStyle=`#ffffff`,s.fillRect(0,0,o.width,o.height),await i.render({canvasContext:s,viewport:a}).promise;let c=o,l=1400;if(o.width>l){let e=l/o.width,t=document.createElement(`canvas`);t.width=l,t.height=Math.round(o.height*e);let n=t.getContext(`2d`);n&&(n.fillStyle=`#ffffff`,n.fillRect(0,0,t.width,t.height),n.imageSmoothingEnabled=!0,n.imageSmoothingQuality=`high`,n.drawImage(o,0,0,t.width,t.height),c=t)}c.toBlob(n=>{if(n){let r=e.name.replace(/\.[^/.]+$/,``);t(new File([n],`${r}_HD.jpg`,{type:`image/jpeg`,lastModified:Date.now()}))}else t(e)},`image/jpeg`,.8)}catch(n){console.warn(`PDF to HD Image conversion fallback, using original file:`,n),t(e)}}),ct=(e,t=1200,n=1200,r=.75)=>new Promise(async i=>{if(!e||!e.type.startsWith(`image/`)){i(e);return}try{if(typeof createImageBitmap==`function`)try{let a;try{a=await createImageBitmap(e,{resizeWidth:t,resizeQuality:`medium`})}catch{a=await createImageBitmap(e)}let o=a.width,s=a.height;o>s?o>t&&(s=Math.round(s*t/o),o=t):s>n&&(o=Math.round(o*n/s),s=n);let c=document.createElement(`canvas`);c.width=o,c.height=s;let l=c.getContext(`2d`);if(l){l.fillStyle=`#ffffff`,l.fillRect(0,0,o,s),l.imageSmoothingEnabled=!0,l.imageSmoothingQuality=`medium`,l.drawImage(a,0,0,o,s),a.close();let t=await new Promise(e=>c.toBlob(e,`image/jpeg`,r));if(c.width=0,c.height=0,t){let n=e.name.replace(/\.[^/.]+$/,``);i(new File([t],`${n}_compressed.jpg`,{type:`image/jpeg`,lastModified:Date.now()}));return}}}catch(e){console.warn(`createImageBitmap failed, falling back to standard Image loader:`,e)}let a=new Image,o=URL.createObjectURL(e);a.src=o,a.onload=()=>{URL.revokeObjectURL(o);let s=document.createElement(`canvas`),c=a.width,l=a.height;c>l?c>t&&(l=Math.round(l*t/c),c=t):l>n&&(c=Math.round(c*n/l),l=n),s.width=c,s.height=l;let u=s.getContext(`2d`);if(!u){i(e);return}u.fillStyle=`#ffffff`,u.fillRect(0,0,c,l),u.imageSmoothingEnabled=!0,u.imageSmoothingQuality=`medium`,u.drawImage(a,0,0,c,l),s.toBlob(t=>{if(s.width=0,s.height=0,a.src=``,t){let n=e.name.replace(/\.[^/.]+$/,``);i(new File([t],`${n}_compressed.jpg`,{type:`image/jpeg`,lastModified:Date.now()}))}else i(e)},`image/jpeg`,r)},a.onerror=()=>{URL.revokeObjectURL(o),a.src=``,i(e)}}catch(t){console.warn(`Image compression exception:`,t),i(e)}}),lt=async(e,t=1400,n=1400,r=.78)=>e&&(e.type===`application/pdf`||e.name.toLowerCase().endsWith(`.pdf`)?await st(e):e.type.startsWith(`image/`)?await ct(e,t,n,r):e),ut=async(e,t=`assets`)=>{let{isFirebase:n,storage:r}=Y(),i=e;try{let n=e.type===`application/pdf`||e.name.toLowerCase().endsWith(`.pdf`),r=n?1400:t===`surveys`?800:t===`pm_proofs`?1200:1400;i=await lt(e,r,r,n?.8:t===`surveys`?.65:.78)}catch(e){console.error(`File compression failed, using original file:`,e)}let a=localStorage.getItem(`assetwatch_force_base64_images`)!==`false`;if(n&&r&&!a)try{let e=ve(r,`${t}/${Date.now()}_${i.name}`),n=new Promise((e,t)=>setTimeout(()=>t(Error(`Firebase Storage upload timed out after 8s`)),8e3));return await B((await Promise.race([N(e,i),n])).ref)}catch(e){console.error(`Firebase Storage upload failed or timed out, falling back to base64:`,e)}return new Promise((e,t)=>{let n=new FileReader;n.onloadend=()=>{e(n.result)},n.onerror=t,n.readAsDataURL(i)})},dt=e=>!e||typeof e!=`string`||!e.trim()?!0:e.includes(`images.unsplash.com`)||e.includes(`photo-1531403009284-440f080d1e12`)||e.includes(`photo-1518455027359-f3f8164ba6bd`)||e.includes(`placeholder`)||e===`-`,ft=e=>!e||typeof e!=`string`?``:e.replace(/\s*\([^)]*สำรวจ[^)]*\)\s*/g,``).trim(),pt=async(e,t,n)=>{let r=!1,i=e.map(e=>{let t=!1,n=e.department,i=e.responsiblePerson,a=e.note;if((n===`ฝ่ายผลิตถุงบรรจุโลหิต`||n===`ฝ่ายผลิตถุงบรรจุโลหิต `)&&(n=`ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา`,t=!0),(i===`ฝ่ายผลิตถุงบรรจุโลหิต`||i===`ฝ่ายผลิตถุงบรรจุโลหิต `)&&(i=`ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา`,t=!0),a&&(a.includes(`สำรวจ`)||a.includes(`สำรวจล่าสุด`))){let e=ft(a);e!==a&&(a=e,t=!0)}return t?(r=!0,{...e,department:n,responsiblePerson:i,note:a}):e}),a=new Set(i.map(e=>e.id)),{BLOOD_BAG_ASSETS:o}=await J(async()=>{let{BLOOD_BAG_ASSETS:e}=await import(`./bloodBagAssetsData-PI1_KBP4.js`);return{BLOOD_BAG_ASSETS:e}},[],import.meta.url),s=o.filter(e=>!a.has(e.id)),c=i;if(s.length>0&&(console.log(`Syncing ${s.length} missing Blood Bag assets...`),c=[...i,...s],r=!0,t&&n))try{for(let e of s)await V(F(n,`assets`,e.id),X(e))}catch(e){console.warn(`Failed to sync missing assets to Firestore:`,e)}return r&&localStorage.setItem(`assetwatch_assets`,JSON.stringify(c)),c},mt=async(e=!1)=>{Z();let t=JSON.parse(localStorage.getItem(`assetwatch_assets`)||`[]`),{isFirebase:n,db:r}=Y();if(n&&r)try{if(!e&&t.length>=500){let e=``;for(let n of t)n.updatedAt&&n.updatedAt>e&&(e=n.updatedAt);if(e){let i=await L(P(R(r,`assets`),j(`updatedAt`,`>`,e)));if(i.empty)return await pt(t,!1,null);let a=new Map;t.forEach(e=>a.set(e.id,e)),i.forEach(e=>{a.set(e.id,{id:e.id,...e.data()})});let o=await pt(Array.from(a.values()),n,r);return Q(`assetwatch_assets`,JSON.stringify(o)),o}}let i=await L(P(R(r,`assets`))),a=[];if(i.forEach(e=>{a.push({id:e.id,...e.data()})}),a.length===0){let{BLOOD_BAG_ASSETS:e}=await J(async()=>{let{BLOOD_BAG_ASSETS:e}=await import(`./bloodBagAssetsData-PI1_KBP4.js`);return{BLOOD_BAG_ASSETS:e}},[],import.meta.url),n=t.length>0?t:[...We,...e];for(let e of n)await V(F(r,`assets`,e.id),X(e));return Q(`assetwatch_assets`,JSON.stringify(n)),n}let o=await pt(a,n,r);return Q(`assetwatch_assets`,JSON.stringify(o)),o}catch(e){ot(e,`getAssets`),console.error(`Firebase getAssets failed, falling back to localStorage:`,e)}return await pt(t,!1,null)},ht=async(e,t)=>{if(!e.length||!t.length)return{syncedAssets:e,updatedCount:0};let n=new Map,r=[...t].sort((e,t)=>new Date(e.timestamp).getTime()-new Date(t.timestamp).getTime());for(let e of r)e.assetId&&e.imageUrl&&e.imageUrl.trim()&&!dt(e.imageUrl)&&n.set(e.assetId,e.imageUrl);if(n.size===0)return{syncedAssets:e,updatedCount:0};let i=[],a=e.map(e=>{let t=n.get(e.id);if(t&&dt(e.imageUrl)){let n={...e,imageUrl:t};return i.push(n),n}return e});if(i.length===0)return{syncedAssets:e,updatedCount:0};console.log(`Auto-syncing ${i.length} asset photos from survey records...`);try{Q(`assetwatch_assets`,JSON.stringify(a))}catch(e){console.warn(`Failed to update localStorage with synced photos:`,e)}return{syncedAssets:a,updatedCount:i.length}},gt=async e=>{Z();let t=JSON.parse(localStorage.getItem(`assetwatch_assets`)||`[]`);if(t.some(t=>t.id===e.id))throw Error(`รหัสครุภัณฑ์นี้มีอยู่แล้วในระบบ`);t.push(e),Q(`assetwatch_assets`,JSON.stringify(t));let{isFirebase:n,db:r}=Y();if(n&&r)try{await V(F(r,`assets`,e.id),X(e));return}catch(e){ot(e,`addAsset`),console.error(`Firebase addAsset failed, saved to localStorage:`,e)}},_t=async e=>{Z();let t=JSON.parse(localStorage.getItem(`assetwatch_assets`)||`[]`),n=new Set(t.map(e=>e.id)),r=e.filter(e=>!n.has(e.id));t.push(...r),Q(`assetwatch_assets`,JSON.stringify(t));let{isFirebase:i,db:a}=Y();if(i&&a)try{await Promise.all(e.map(async e=>{await V(F(a,`assets`,e.id),X(e))}));return}catch(e){console.error(`Firebase addAssetsBulk failed, saved to localStorage:`,e)}},vt=async(e,t)=>{let n={...t};n.note&&n.note.includes(`สำรวจล่าสุด:`)&&(n.note=ft(n.note)),Z();let r=JSON.parse(localStorage.getItem(`assetwatch_assets`)||`[]`),i=r.findIndex(t=>t.id===e);if(i!==-1)r[i]={...r[i],...n,updatedAt:new Date().toISOString()},Q(`assetwatch_assets`,JSON.stringify(r));else{let t={id:e,...n,updatedAt:new Date().toISOString()};r.push(t),Q(`assetwatch_assets`,JSON.stringify(r))}if(t.name){let n=t.name;try{let t=JSON.parse(localStorage.getItem(`assetwatch_pm_schedules`)||`[]`),r=!1;t.forEach(t=>{t.assetId===e&&(t.assetName=n,r=!0)}),r&&localStorage.setItem(`assetwatch_pm_schedules`,JSON.stringify(t));let i=JSON.parse(localStorage.getItem(`assetwatch_repairs`)||`[]`),a=!1;i.forEach(t=>{t.assetId===e&&(t.assetName=n,a=!0)}),a&&localStorage.setItem(`assetwatch_repairs`,JSON.stringify(i))}catch(e){console.error(`Error syncing assetName to schedules/repairs:`,e)}}let{isFirebase:a,db:o}=Y();if(a&&o)try{let t=new Date().toISOString(),r=X({...n,updatedAt:n.updatedAt||t});await V(F(o,`assets`,e),r,{merge:!0})}catch(e){throw ot(e,`updateAsset`),console.error(`Firebase updateAsset failed:`,e),e}},yt=async e=>{let{isFirebase:t,db:n}=Y();if(t&&n)try{await A(F(n,`assets`,e));return}catch(e){console.error(`Firebase deleteAsset failed, falling back to localStorage:`,e)}Z();let r=JSON.parse(localStorage.getItem(`assetwatch_assets`)||`[]`).filter(t=>t.id!==e);localStorage.setItem(`assetwatch_assets`,JSON.stringify(r))},bt=async()=>{let{isFirebase:e,db:t}=Y();if(e&&t)try{let e=await L(P(R(t,`audit_trails`),he(`timestamp`,`desc`),z(100))),n=[];if(e.forEach(e=>{n.push({id:e.id,...e.data()})}),n.length===0){Z();let e=JSON.parse(localStorage.getItem(`assetwatch_audits`)||`[]`);for(let n of e)await V(F(t,`audit_trails`,n.id),n);return e.slice(0,100).sort((e,t)=>new Date(t.timestamp).getTime()-new Date(e.timestamp).getTime())}return Q(`assetwatch_audits`,JSON.stringify(n)),n}catch(e){ot(e,`getAuditTrails`),console.error(`Firebase getAuditTrails failed, falling back to localStorage:`,e)}return Z(),JSON.parse(localStorage.getItem(`assetwatch_audits`)||`[]`).slice(0,100).sort((e,t)=>new Date(t.timestamp).getTime()-new Date(e.timestamp).getTime())},xt=async e=>{let t=`audit-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,n={id:t,...e};Z();try{let e=JSON.parse(localStorage.getItem(`assetwatch_audits`)||`[]`);e.unshift(n),Q(`assetwatch_audits`,JSON.stringify(e.slice(0,200)))}catch(e){console.warn(`LocalStorage audit cache update failed:`,e)}let{isFirebase:r,db:i}=Y();if(r&&i)try{await V(F(i,`audit_trails`,t),X(n));return}catch(e){ot(e,`addAuditTrail`),console.error(`Firebase addAuditTrail failed, saved to localStorage:`,e)}},St=e=>{let t=new Map,n=[...e].sort((e,t)=>new Date(e.timestamp).getTime()-new Date(t.timestamp).getTime());for(let e of n){let n=`${e.assetId}__${e.roundId}`;t.set(n,e)}return Array.from(t.values())},Ct=async(e=!1)=>{Z();let t=JSON.parse(localStorage.getItem(`assetwatch_surveys`)||`[]`),{isFirebase:n,db:r}=Y();if(n&&r)try{let n=[];if(!e&&t.length>0){let e=``;for(let n of t)n.timestamp&&n.timestamp>e&&(e=n.timestamp);if(e&&((await L(P(R(r,`surveys`),j(`timestamp`,`>`,e)))).forEach(e=>{n.push({id:e.id,...e.data()})}),n.length===0))return St(t).sort((e,t)=>new Date(t.timestamp).getTime()-new Date(e.timestamp).getTime())}n.length===0&&(e||t.length===0)&&(await L(P(R(r,`surveys`)))).forEach(e=>{n.push({id:e.id,...e.data()})});let i=new Map;t.forEach(e=>i.set(e.id,e)),n.forEach(e=>i.set(e.id,e));let a=St(Array.from(i.values()));return Q(`assetwatch_surveys`,JSON.stringify(a)),a.sort((e,t)=>new Date(t.timestamp).getTime()-new Date(e.timestamp).getTime())}catch(e){ot(e,`getSurveys`),console.error(`Firebase getSurveys failed, returning local cache:`,e)}let i=St(t);return Q(`assetwatch_surveys`,JSON.stringify(i)),i.sort((e,t)=>new Date(t.timestamp).getTime()-new Date(e.timestamp).getTime())},wt=async e=>{let t=`survey-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,n={id:t,...e};Z();try{let e=JSON.parse(localStorage.getItem(`assetwatch_surveys`)||`[]`);e.push(n);let t=St(e);Q(`assetwatch_surveys`,JSON.stringify(t))}catch(e){console.warn(`LocalStorage survey cache update failed:`,e)}let{isFirebase:r,db:i}=Y();if(r&&i)try{await V(F(i,`surveys`,t),X(n))}catch(e){ot(e,`addSurvey`),console.error(`Firebase addSurvey failed, but saved locally:`,e)}if(e.imageUrl&&e.imageUrl.trim()&&!dt(e.imageUrl))try{await vt(e.assetId,{imageUrl:e.imageUrl})}catch(e){console.warn(`Failed to auto-update asset image from survey:`,e)}},Tt=async(e,t)=>{Z();let n=JSON.parse(localStorage.getItem(`assetwatch_surveys`)||`[]`),r=n.findIndex(t=>t.id===e);r!==-1&&(n[r]={...n[r],...t},Q(`assetwatch_surveys`,JSON.stringify(n)));let{isFirebase:i,db:a}=Y();if(i&&a)try{await V(F(a,`surveys`,e),X(t),{merge:!0})}catch(e){console.error(`Firebase updateSurvey failed:`,e)}},Et=async(e=!1)=>{Z();let t=JSON.parse(localStorage.getItem(`assetwatch_repairs`)||`[]`),{isFirebase:n,db:r}=Y();if(n&&r)try{let n=[];if(!e&&t.length>0){let e=``;for(let n of t)n.updatedAt&&n.updatedAt>e&&(e=n.updatedAt);if(e&&((await L(P(R(r,`repairs`),j(`updatedAt`,`>`,e)))).forEach(e=>{n.push({id:e.id,...e.data()})}),n.length===0))return t.sort((e,t)=>new Date(t.updatedAt||0).getTime()-new Date(e.updatedAt||0).getTime())}n.length===0&&(e||t.length===0)&&(await L(P(R(r,`repairs`),he(`updatedAt`,`desc`)))).forEach(e=>{n.push({id:e.id,...e.data()})});let i=new Map;t.forEach(e=>i.set(e.id,e)),n.forEach(e=>i.set(e.id,e));let a=Array.from(i.values()).sort((e,t)=>new Date(t.updatedAt||0).getTime()-new Date(e.updatedAt||0).getTime());return Q(`assetwatch_repairs`,JSON.stringify(a)),a}catch(e){console.error(`Firebase getRepairs failed, falling back to localStorage:`,e)}return t.sort((e,t)=>new Date(t.updatedAt||0).getTime()-new Date(e.updatedAt||0).getTime())},Dt=async e=>{let t=`rep-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,n={id:t,...e};Z();try{let e=JSON.parse(localStorage.getItem(`assetwatch_repairs`)||`[]`),r=e.findIndex(e=>e.id===t);r===-1?e.push(n):e[r]=n,Q(`assetwatch_repairs`,JSON.stringify(e))}catch(e){console.warn(`LocalStorage addRepair cache failed:`,e)}let{isFirebase:r,db:i}=Y();if(r&&i)try{return await V(F(i,`repairs`,t),X(n)),t}catch(e){console.error(`Firebase addRepair failed, saved to localStorage:`,e)}return t},Ot=async(e,t)=>{Z();try{let n=JSON.parse(localStorage.getItem(`assetwatch_repairs`)||`[]`),r=n.findIndex(t=>t.id===e);if(r!==-1)n[r]={...n[r],...t,updatedAt:new Date().toISOString()},Q(`assetwatch_repairs`,JSON.stringify(n));else{let r={id:e,...t,updatedAt:new Date().toISOString()};n.push(r),Q(`assetwatch_repairs`,JSON.stringify(n))}}catch(e){console.warn(`LocalStorage updateRepair cache failed:`,e)}let{isFirebase:n,db:r}=Y();if(n&&r)try{await V(F(r,`repairs`,e),X(t),{merge:!0})}catch(e){throw console.error(`Firebase updateRepair failed:`,e),e}},kt=async e=>{Z();try{let t=JSON.parse(localStorage.getItem(`assetwatch_repairs`)||`[]`).filter(t=>t.id!==e);Q(`assetwatch_repairs`,JSON.stringify(t))}catch(e){console.warn(`LocalStorage deleteRepair cache failed:`,e)}let{isFirebase:t,db:n}=Y();if(t&&n)try{await A(F(n,`repairs`,e))}catch(e){throw console.error(`Firebase deleteRepair failed:`,e),e}},At=async()=>{Z();let e=JSON.parse(localStorage.getItem(`assetwatch_survey_rounds`)||`[]`),{isFirebase:t,db:n}=Y();if(t&&n)try{let t=await L(P(R(n,`survey_rounds`))),r=[];if(t.forEach(e=>{r.push({id:e.id,...e.data()})}),r.length===0&&e.length>0){for(let t of e)await V(F(n,`survey_rounds`,t.id),X(t));return e.sort((e,t)=>new Date(t.dateCreated).getTime()-new Date(e.dateCreated).getTime())}let i=new Map;e.forEach(e=>i.set(e.id,e)),r.forEach(e=>i.set(e.id,e));let a=Array.from(i.values());return localStorage.setItem(`assetwatch_survey_rounds`,JSON.stringify(a)),a.sort((e,t)=>new Date(t.dateCreated).getTime()-new Date(e.dateCreated).getTime())}catch(e){console.error(`Firebase getSurveyRounds failed, returning local cache:`,e)}return e.sort((e,t)=>new Date(t.dateCreated).getTime()-new Date(e.dateCreated).getTime())},jt=async e=>{Z();let t=JSON.parse(localStorage.getItem(`assetwatch_survey_rounds`)||`[]`);t.push(e),localStorage.setItem(`assetwatch_survey_rounds`,JSON.stringify(t));let{isFirebase:n,db:r}=Y();if(n&&r)try{await V(F(r,`survey_rounds`,e.id),X(e))}catch(e){console.error(`Firebase addSurveyRound failed, but saved locally:`,e)}},Mt=async(e,t)=>{Z();let n=JSON.parse(localStorage.getItem(`assetwatch_survey_rounds`)||`[]`),r=n.findIndex(t=>t.id===e);if(r!==-1)n[r]={...n[r],...t},localStorage.setItem(`assetwatch_survey_rounds`,JSON.stringify(n));else{let r={id:e,...t};n.push(r),localStorage.setItem(`assetwatch_survey_rounds`,JSON.stringify(n))}let{isFirebase:i,db:a}=Y();if(i&&a)try{await V(F(a,`survey_rounds`,e),X(t),{merge:!0})}catch(e){throw console.error(`Firebase updateSurveyRound failed:`,e),e}},Nt=async(e,t,n)=>{let r=e.findIndex(e=>e.name===`ฝ่ายผลิตถุงบรรจุโลหิต`);if(r!==-1){let t=e[r],n=e.findIndex(e=>e.name===`ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา`);n===-1?e[r].name=`ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา`:(e[n].locations=Array.from(new Set([...e[n].locations,...t.locations])),e.splice(r,1)),localStorage.setItem(`assetwatch_departments`,JSON.stringify(e));try{let e=JSON.parse(localStorage.getItem(`assetwatch_assets`)||`[]`),t=!1;e.forEach(e=>{e.department===`ฝ่ายผลิตถุงบรรจุโลหิต`&&(e.department=`ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา`,t=!0),e.responsiblePerson===`ฝ่ายผลิตถุงบรรจุโลหิต`&&(e.responsiblePerson=`ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา`,t=!0)}),t&&localStorage.setItem(`assetwatch_assets`,JSON.stringify(e));let n=JSON.parse(localStorage.getItem(`assetwatch_users`)||`[]`),r=!1;n.forEach(e=>{e.department===`ฝ่ายผลิตถุงบรรจุโลหิต`&&(e.department=`ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา`,r=!0)}),r&&localStorage.setItem(`assetwatch_users`,JSON.stringify(n))}catch(e){console.error(`Error migrating local storage for department merge:`,e)}}let i=`ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา`,a=qe.find(e=>e.name===i);if(!a)return e;let o=e.findIndex(e=>e.name===i),s=!1;if(o===-1){if(e.push(a),s=!0,t&&n)try{await V(F(n,`departments`,a.id),a)}catch(e){console.error(`Failed to sync new Blood Bag Dept to Firestore:`,e)}}else{let r=new Set(e[o].locations);if(a.locations.filter(e=>!r.has(e)).length>0){let r=Array.from(new Set([...e[o].locations,...a.locations]));if(e[o].locations=r,s=!0,t&&n)try{await ge(F(n,`departments`,e[o].id),{locations:r})}catch(e){console.error(`Failed to update Blood Bag Dept locations in Firestore:`,e)}}}return s&&localStorage.setItem(`assetwatch_departments`,JSON.stringify(e)),e},Pt=async()=>{let{isFirebase:e,db:t}=Y();if(e&&t)try{let n=await L(P(R(t,`departments`),he(`name`,`asc`))),r=[];if(n.forEach(e=>{r.push({id:e.id,...e.data()})}),r.length===0){Z();let n=JSON.parse(localStorage.getItem(`assetwatch_departments`)||`[]`),r=n.length>0?n:qe;for(let e of r)await V(F(t,`departments`,e.id),X(e));return(await Nt(r,e,t)).sort((e,t)=>e.name.localeCompare(t.name,`th`))}return(await Nt(r,e,t)).sort((e,t)=>e.name.localeCompare(t.name,`th`))}catch(e){console.error(`Firebase getDepartments failed, falling back to localStorage:`,e)}return Z(),(await Nt(JSON.parse(localStorage.getItem(`assetwatch_departments`)||`[]`),!1,null)).sort((e,t)=>e.name.localeCompare(t.name,`th`))},Ft=async e=>{Z();let t=JSON.parse(localStorage.getItem(`assetwatch_departments`)||`[]`);t.push(e),localStorage.setItem(`assetwatch_departments`,JSON.stringify(t));let{isFirebase:n,db:r}=Y();if(n&&r)try{await V(F(r,`departments`,e.id),X(e));return}catch(e){console.error(`Firebase addDepartment failed, saved to localStorage:`,e)}},It=async(e,t)=>{Z();let n=JSON.parse(localStorage.getItem(`assetwatch_departments`)||`[]`),r=n.findIndex(t=>t.id===e);r!==-1&&(n[r]={...n[r],...t},localStorage.setItem(`assetwatch_departments`,JSON.stringify(n)));let{isFirebase:i,db:a}=Y();if(i&&a)try{await V(F(a,`departments`,e),X(t),{merge:!0})}catch(e){console.error(`Firebase updateDepartment failed:`,e)}},Lt=async e=>{let{isFirebase:t,db:n}=Y();if(t&&n)try{await A(F(n,`departments`,e));return}catch(e){console.error(`Firebase deleteDepartment failed, falling back to localStorage:`,e)}Z();let r=JSON.parse(localStorage.getItem(`assetwatch_departments`)||`[]`).filter(t=>t.id!==e);localStorage.setItem(`assetwatch_departments`,JSON.stringify(r))},Rt=async()=>{let e=await mt(),t=await bt(),n=await Et(),r=await Ct(),i=await At(),a=await Pt(),o=await Bt(),s={version:`1.1.0`,exportedAt:new Date().toISOString(),assets:e,audits:t,repairs:n,surveys:r,rounds:i,departments:a,users:o};return JSON.stringify(s,null,2)},zt=async e=>{try{let t=JSON.parse(e);if(!t.assets||!Array.isArray(t.assets))return{success:!1,message:`โครงสร้างไฟล์สำรองข้อมูลไม่ถูกต้อง`};let{isFirebase:n,db:r}=Y();if(n&&r){for(let e of t.assets)await V(F(r,`assets`,e.id),e);if(t.audits)for(let e of t.audits)await V(F(r,`audit_trails`,e.id),e);if(t.repairs)for(let e of t.repairs)await V(F(r,`repairs`,e.id),e);if(t.surveys)for(let e of t.surveys)await V(F(r,`surveys`,e.id),e);if(t.rounds)for(let e of t.rounds)await V(F(r,`survey_rounds`,e.id),e);if(t.departments)for(let e of t.departments)await V(F(r,`departments`,e.id),e);if(t.users)for(let e of t.users)await V(F(r,`users`,e.id),e)}return localStorage.setItem(`assetwatch_assets`,JSON.stringify(t.assets)),localStorage.setItem(`assetwatch_audits`,JSON.stringify(t.audits||[])),localStorage.setItem(`assetwatch_repairs`,JSON.stringify(t.repairs||[])),localStorage.setItem(`assetwatch_surveys`,JSON.stringify(t.surveys||[])),localStorage.setItem(`assetwatch_survey_rounds`,JSON.stringify(t.rounds||[])),localStorage.setItem(`assetwatch_departments`,JSON.stringify(t.departments||qe)),t.users&&localStorage.setItem(`assetwatch_users`,JSON.stringify(t.users)),{success:!0,message:`นำเข้าข้อมูลครุภัณฑ์สำเร็จทั้งหมด ${t.assets.length} รายการ`}}catch(e){return{success:!1,message:`การนำเข้าข้อมูลล้มเหลว: ${e.message}`}}},Bt=async()=>{let{isFirebase:e,db:t}=Y();if(e&&t)try{let e=await L(P(R(t,`users`))),n=[];if(e.forEach(e=>{n.push({id:e.id,...e.data()})}),n.length===0){Z();let e=JSON.parse(localStorage.getItem(`assetwatch_users`)||`[]`),n=e.length>0?e:q;for(let e of n)await V(F(t,`users`,e.id),e);return n.sort((e,t)=>t.createdAt.localeCompare(e.createdAt))}return n}catch(e){console.error(`Firebase getUsers failed, falling back to localStorage:`,e)}return Z(),JSON.parse(localStorage.getItem(`assetwatch_users`)||`[]`).sort((e,t)=>t.createdAt.localeCompare(e.createdAt))},Vt=async e=>{Z();let t=JSON.parse(localStorage.getItem(`assetwatch_users`)||`[]`),n=t.findIndex(t=>t.id===e.id);n===-1?t.push(e):t[n]=e,localStorage.setItem(`assetwatch_users`,JSON.stringify(t));let{isFirebase:r,db:i}=Y();if(r&&i)try{await V(F(i,`users`,e.id),X(e));return}catch(e){console.error(`Firebase addOrUpdateUser failed, saved to localStorage:`,e)}},Ht=async e=>{let{isFirebase:t,db:n}=Y();if(t&&n)try{await A(F(n,`users`,e));return}catch(e){console.error(`Firebase deleteUser failed, falling back to localStorage:`,e)}Z();let r=JSON.parse(localStorage.getItem(`assetwatch_users`)||`[]`).filter(t=>t.id!==e);localStorage.setItem(`assetwatch_users`,JSON.stringify(r))},Ut=async()=>{let{isFirebase:e,db:t}=Y();if(e&&t)try{let e=await L(P(R(t,`pm_contracts`))),n=[];if(e.forEach(e=>{n.push({id:e.id,...e.data()})}),n.length===0){Z();let e=JSON.parse(localStorage.getItem(`assetwatch_contracts`)||`[]`);for(let n of e)await V(F(t,`pm_contracts`,n.id),n);return e}return n}catch(e){console.error(`Firebase getPMContracts failed, falling back to localStorage:`,e)}return Z(),JSON.parse(localStorage.getItem(`assetwatch_contracts`)||`[]`)},Wt=async e=>{Z();let t=JSON.parse(localStorage.getItem(`assetwatch_contracts`)||`[]`);t.push(e),localStorage.setItem(`assetwatch_contracts`,JSON.stringify(t));let{isFirebase:n,db:r}=Y();if(n&&r)try{await V(F(r,`pm_contracts`,e.id),X(e));return}catch(e){console.error(`Firebase addPMContract failed, saved to localStorage:`,e)}},Gt=async(e,t)=>{Z();let n=JSON.parse(localStorage.getItem(`assetwatch_contracts`)||`[]`),r=n.findIndex(t=>t.id===e);if(r!==-1)n[r]={...n[r],...t},localStorage.setItem(`assetwatch_contracts`,JSON.stringify(n));else{let r={id:e,...t};n.push(r),localStorage.setItem(`assetwatch_contracts`,JSON.stringify(n))}let{isFirebase:i,db:a}=Y();if(i&&a)try{await V(F(a,`pm_contracts`,e),X(t),{merge:!0})}catch(e){throw console.error(`Firebase updatePMContract failed:`,e),e}},Kt=async e=>{let{isFirebase:t,db:n}=Y();if(t&&n)try{await A(F(n,`pm_contracts`,e));return}catch(e){console.error(`Firebase deletePMContract failed, falling back to localStorage:`,e)}Z();let r=JSON.parse(localStorage.getItem(`assetwatch_contracts`)||`[]`).filter(t=>t.id!==e);localStorage.setItem(`assetwatch_contracts`,JSON.stringify(r))},qt=async()=>{let{isFirebase:e,db:t}=Y();if(e&&t)try{let e=await L(P(R(t,`pm_schedules`))),n=[];if(e.forEach(e=>{n.push({id:e.id,...e.data()})}),n.length===0){Z();let e=JSON.parse(localStorage.getItem(`assetwatch_schedules`)||`[]`);for(let n of e)await V(F(t,`pm_schedules`,n.id),X(n));return e}return n}catch(e){console.error(`Firebase getPMSchedules failed, falling back to localStorage:`,e)}return Z(),JSON.parse(localStorage.getItem(`assetwatch_schedules`)||`[]`)},Jt=async e=>{Z();let t=JSON.parse(localStorage.getItem(`assetwatch_schedules`)||`[]`);t.push(e),localStorage.setItem(`assetwatch_schedules`,JSON.stringify(t));let{isFirebase:n,db:r}=Y();if(n&&r)try{await V(F(r,`pm_schedules`,e.id),X(e));return}catch(e){console.error(`Firebase addPMSchedule failed, saved to localStorage:`,e)}},Yt=async(e,t)=>{Z();let n=JSON.parse(localStorage.getItem(`assetwatch_schedules`)||`[]`),r=n.findIndex(t=>t.id===e);if(r!==-1)n[r]={...n[r],...t},localStorage.setItem(`assetwatch_schedules`,JSON.stringify(n));else{let r={id:e,...t};n.push(r),localStorage.setItem(`assetwatch_schedules`,JSON.stringify(n))}let{isFirebase:i,db:a}=Y();if(i&&a)try{await V(F(a,`pm_schedules`,e),X(t),{merge:!0})}catch(e){throw console.error(`Firebase updatePMSchedule failed:`,e),e}},Xt=async()=>{let{isFirebase:e,db:t}=Y();if(e&&t)try{let e=await L(P(R(t,`pm_notifications`),z(100))),n=[];if(e.forEach(e=>{n.push({id:e.id,...e.data()})}),n.length===0){Z();let e=JSON.parse(localStorage.getItem(`assetwatch_pm_notifications`)||`[]`);for(let n of e)await V(F(t,`pm_notifications`,n.id),X(n));return e}return n}catch(e){console.error(`Firebase getPMNotifications failed, falling back to localStorage:`,e)}return Z(),JSON.parse(localStorage.getItem(`assetwatch_pm_notifications`)||`[]`)},Zt=async e=>{Z();let t=JSON.parse(localStorage.getItem(`assetwatch_pm_notifications`)||`[]`);t.push(e),localStorage.setItem(`assetwatch_pm_notifications`,JSON.stringify(t));let{isFirebase:n,db:r}=Y();if(n&&r)try{await V(F(r,`pm_notifications`,e.id),X(e));return}catch(e){console.error(`Firebase addPMNotification failed, saved to localStorage:`,e)}},Qt=async(e,t)=>{Z();let n=JSON.parse(localStorage.getItem(`assetwatch_pm_notifications`)||`[]`),r=n.findIndex(t=>t.id===e);if(r!==-1)n[r]={...n[r],...t},localStorage.setItem(`assetwatch_pm_notifications`,JSON.stringify(n));else{let r={id:e,...t};n.push(r),localStorage.setItem(`assetwatch_pm_notifications`,JSON.stringify(n))}let{isFirebase:i,db:a}=Y();if(i&&a)try{await V(F(a,`pm_notifications`,e),X(t),{merge:!0})}catch(e){throw console.error(`Firebase updatePMNotification failed:`,e),e}},$t=async e=>{let{isFirebase:t,db:n}=Y();if(t&&n)try{await A(F(n,`pm_schedules`,e))}catch(e){console.error(`Firebase deletePMSchedule failed, falling back to localStorage:`,e)}Z();let r=JSON.parse(localStorage.getItem(`assetwatch_schedules`)||`[]`).filter(t=>t.id!==e);localStorage.setItem(`assetwatch_schedules`,JSON.stringify(r))},en=async(e=!1)=>{Z();let t=JSON.parse(localStorage.getItem(`assetwatch_spare_parts`)||`[]`),{isFirebase:n,db:r}=Y();if(n&&r)try{let n=[];if(!e&&t.length>0){let e=``;for(let n of t)n.updatedAt&&n.updatedAt>e&&(e=n.updatedAt);if(e&&((await L(P(R(r,`spare_parts`),j(`updatedAt`,`>`,e)))).forEach(e=>{n.push(e.data())}),n.length===0))return t}if(n.length===0&&(e||t.length===0)&&(await L(P(R(r,`spare_parts`)))).forEach(e=>{n.push(e.data())}),n.length===0&&t.length===0)return t;let i=new Map;t.forEach(e=>i.set(e.id,e)),n.forEach(e=>i.set(e.id,e));let a=Array.from(i.values());return Q(`assetwatch_spare_parts`,JSON.stringify(a)),a}catch(e){console.error(`Failed to fetch spare parts from Firestore, falling back to LocalStorage:`,e)}return t},tn=async e=>{let t={...e,updatedAt:e.updatedAt||new Date().toISOString()},{isFirebase:n,db:r}=Y();if(n&&r)try{await V(F(r,`spare_parts`,e.id),X(t))}catch(e){console.error(`Failed to save spare part to Firestore, falling back to LocalStorage:`,e)}let i=JSON.parse(localStorage.getItem(`assetwatch_spare_parts`)||`[]`),a=i.findIndex(t=>t.id===e.id);a===-1?i.push(t):i[a]=t,Q(`assetwatch_spare_parts`,JSON.stringify(i))},nn=async e=>{let{isFirebase:t,db:n}=Y();if(t&&n)try{await A(F(n,`spare_parts`,e))}catch(e){console.error(`Failed to delete spare part from Firestore, falling back to LocalStorage:`,e)}let r=JSON.parse(localStorage.getItem(`assetwatch_spare_parts`)||`[]`).filter(t=>t.id!==e);localStorage.setItem(`assetwatch_spare_parts`,JSON.stringify(r))},rn=async()=>{[`assetwatch_assets`,`assetwatch_audits`,`assetwatch_users`,`assetwatch_repairs`,`assetwatch_surveys`,`assetwatch_departments`,`assetwatch_contracts`,`assetwatch_schedules`,`assetwatch_pm_notifications`,`assetwatch_survey_rounds`,`assetwatch_spare_parts`].forEach(e=>localStorage.removeItem(e));let{isFirebase:e,db:t}=Y();if(e&&t){for(let e of[`assets`,`audit_trails`,`repairs`,`surveys`,`survey_rounds`,`departments`,`users`,`pm_contracts`,`pm_schedules`,`pm_notifications`,`spare_parts`])try{let n=await L(P(R(t,e))),r=[];n.forEach(n=>{r.push(A(F(t,e,n.id)))}),await Promise.all(r)}catch(t){console.error(`Failed to clear Firestore collection ${e}:`,t)}try{let{BLOOD_BAG_ASSETS:e}=await J(async()=>{let{BLOOD_BAG_ASSETS:e}=await import(`./bloodBagAssetsData-PI1_KBP4.js`);return{BLOOD_BAG_ASSETS:e}},[],import.meta.url),n=[...We,...e];for(let e of n)await V(F(t,`assets`,e.id),X(e));for(let e of Ge)await V(F(t,`audit_trails`,e.id),X(e));for(let e of q)await V(F(t,`users`,e.id),X(e));for(let e of Ke)await V(F(t,`repairs`,e.id),X(e));for(let e of qe)await V(F(t,`departments`,e.id),X(e));for(let e of Je)await V(F(t,`pm_contracts`,e.id),X(e));for(let e of Ye)await V(F(t,`pm_schedules`,e.id),X(e));for(let e of $e)await V(F(t,`pm_notifications`,e.id),X(e));for(let e of Xe)await V(F(t,`spare_parts`,e.id),X(e));let r={id:`round-default`,name:`รอบสำรวจประจำปีงบประมาณ 2569 (ปีปัจจุบัน)`,dateCreated:new Date().toISOString(),status:`active`,totalAssets:n.length,surveyedAssets:0,completionRate:0,statusBreakdown:{ใช้งานได้:0,ชำรุด:0,รอจำหน่าย:0,ขอป้ายรหัสใหม่:0,รอโอน:0,อื่นๆ:0},operator:`ระบบอัตโนมัติ`};await V(F(t,`survey_rounds`,r.id),X(r))}catch(e){throw console.error(`Failed to seed Firestore initial data after clear:`,e),e}}Z()},an=(0,W.lazy)(()=>J(()=>import(`./Module1_Database-DoC6Hg5O.js`).then(e=>({default:e.Module1_Database})),__vite__mapDeps([0,1,2,3]),import.meta.url)),on=(0,W.lazy)(()=>J(()=>import(`./Module2_ScanSurvey-wP_FkjLN.js`).then(e=>({default:e.Module2_ScanSurvey})),__vite__mapDeps([4,1,2,3]),import.meta.url)),sn=(0,W.lazy)(()=>J(()=>import(`./Module3_AddAsset-BqmrD1OZ.js`).then(e=>({default:e.Module3_AddAsset})),__vite__mapDeps([5,1,6,2,3]),import.meta.url)),cn=(0,W.lazy)(()=>J(()=>import(`./Module4_Dispose-BbnnklxR.js`).then(e=>({default:e.Module4_Dispose})),__vite__mapDeps([7,1,2,3]),import.meta.url)),ln=(0,W.lazy)(()=>J(()=>import(`./Module5_Transfer-DZ95z4AJ.js`).then(e=>({default:e.Module5_Transfer})),__vite__mapDeps([8,1,2,3]),import.meta.url)),un=(0,W.lazy)(()=>J(()=>import(`./Module6_AuditTrail-Dnafv2qs.js`).then(e=>({default:e.Module6_AuditTrail})),__vite__mapDeps([9,1,2,3]),import.meta.url)),dn=(0,W.lazy)(()=>J(()=>import(`./Module7_Settings-1Vx8Nmgx.js`).then(e=>({default:e.Module7_Settings})),__vite__mapDeps([10,1,2,3]),import.meta.url)),fn=(0,W.lazy)(()=>J(()=>import(`./Module8_Departments-DZYM9Hy_.js`).then(e=>({default:e.Module8_Departments})),__vite__mapDeps([11,1,2,3]),import.meta.url)),pn=(0,W.lazy)(()=>J(()=>import(`./Module9_AccessControl-CdSZaip3.js`).then(e=>({default:e.Module9_AccessControl})),__vite__mapDeps([12,1,2,3]),import.meta.url)),mn=(0,W.lazy)(()=>J(()=>import(`./Module10_Maintenance-OAbqJiEk.js`).then(e=>({default:e.Module10_Maintenance})),__vite__mapDeps([13,1,2,3]),import.meta.url)),hn=(0,W.lazy)(()=>J(()=>import(`./Module11_QualityDocs-BhehzmbI.js`).then(e=>({default:e.Module11_QualityDocs})),__vite__mapDeps([14,1,2,3]),import.meta.url)),gn=(0,W.lazy)(()=>J(()=>import(`./Module12_SpareParts-RNq89-Ri.js`).then(e=>({default:e.Module12_SpareParts})),__vite__mapDeps([15,1,2,3]),import.meta.url)),_n=()=>(0,G.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,minHeight:`50vh`,gap:`1rem`,color:`#64748b`},children:[(0,G.jsx)(`div`,{style:{width:`36px`,height:`36px`,border:`3px solid #e2e8f0`,borderTopColor:`#2563eb`,borderRadius:`50%`,animation:`spin 0.8s linear infinite`}}),(0,G.jsx)(`span`,{style:{fontSize:`0.95rem`,fontWeight:500},children:`กำลังโหลดข้อมูลโมดูล...`})]});function vn(){let[e,t]=(0,W.useState)(()=>{let e=Le(),t=localStorage.getItem(`assetwatch_demo_bypass`);return!e.isConfigured&&t!==`true`}),[n,i]=(0,W.useState)(()=>localStorage.getItem(`assetwatch_active_tab`)||`dashboard`),o=e=>{i(e),localStorage.setItem(`assetwatch_active_tab`,e)},[s,c]=(0,W.useState)(()=>{let e=localStorage.getItem(`assetwatch_theme`);return e===`dark`||e===`light`?e:window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`}),[l,u]=(0,W.useState)([]),[f,m]=(0,W.useState)([]),[h,g]=(0,W.useState)([]),[_,y]=(0,W.useState)([]),[b,x]=(0,W.useState)([]),[S,w]=(0,W.useState)(null),[T,ee]=(0,W.useState)([]),[E,ie]=(0,W.useState)([]),[ae,oe]=(0,W.useState)([]),[se,ce]=(0,W.useState)([]),[D,ue]=(0,W.useState)([]),[de,fe]=(0,W.useState)([]),[me,O]=(0,W.useState)(!1),[k,A]=(0,W.useState)(()=>{let e=localStorage.getItem(`assetwatch_session`);if(e)try{return JSON.parse(e)}catch(e){console.error(`Failed to parse active user session:`,e)}return null}),[he,ge]=(0,W.useState)(``),[j,_e]=(0,W.useState)(``),[M,N]=(0,W.useState)(null),[P,F]=(0,W.useState)(null),[I,L]=(0,W.useState)(null),[R,ve]=(0,W.useState)(``),[z,B]=(0,W.useState)(``),[V,ye]=(0,W.useState)(``),[be,xe]=(0,W.useState)(``),[Se,H]=(0,W.useState)(`ใช้งานได้`),[U,Ce]=(0,W.useState)(``),[we,Te]=(0,W.useState)(null),[Ee,De]=(0,W.useState)(null),[ke,Ae]=(0,W.useState)(!1),je=(0,W.useMemo)(()=>{let e=new Set;z&&z.trim()&&e.add(z.trim());let t=T.find(e=>e.name.toLowerCase()===V.trim().toLowerCase());return t&&Array.isArray(t.locations)&&t.locations.forEach(t=>{t&&t.trim()&&e.add(t.trim())}),T.forEach(t=>{Array.isArray(t.locations)&&t.locations.forEach(t=>{t&&t.trim()&&e.add(t.trim())})}),l.forEach(t=>{t.department===V&&t.location&&t.location.trim()&&e.add(t.location.trim())}),l.forEach(t=>{t.location&&t.location.trim()&&e.add(t.location.trim())}),Array.from(e)},[V,z,T,l]),Me=(0,W.useMemo)(()=>{let e=new Set;return V&&V.trim()&&e.add(V.trim()),T.forEach(t=>{t.name&&t.name.trim()&&e.add(t.name.trim())}),l.forEach(t=>{t.department&&t.department.trim()&&e.add(t.department.trim())}),Array.from(e)},[V,T,l]);(0,W.useEffect)(()=>{document.documentElement.setAttribute(`data-theme`,s),localStorage.setItem(`assetwatch_theme`,s)},[s]);let Ne=async(e,t,n)=>{let r=new Date().toISOString().split(`T`)[0],i=new Date;i.setDate(i.getDate()+7);let a=i.toISOString().split(`T`)[0];for(let n of e)if(n.status===`pending`){let e=n.plannedDate<r,i=n.plannedDate>=r&&n.plannedDate<=a;if(e||i){let i=e?`pm_overdue`:`pm_upcoming`;t.some(e=>e.type===i&&e.message.includes(n.assetId))||await Zt({id:`notif-${Date.now()}-${n.id}`,title:e?`🔴 แผน PM เลยกำหนดตรวจเช็ค (${n.assetId})`:`📅 ใกล้ถึงกำหนดบำรุงรักษา PM (${n.assetId})`,message:e?`ครุภัณฑ์ ${n.assetName} รหัส ${n.assetId} เลยกำหนดเข้าตรวจบำรุงรักษา PM เมื่อวันที่ ${n.plannedDate}`:`ครุภัณฑ์ ${n.assetName} รหัส ${n.assetId} มีแผนเข้าตรวจบำรุงรักษา PM ในวันที่ ${n.plannedDate}`,targetDate:r,isRead:!1,type:i,linkTo:`module10_pm`})}}let o=new Date;o.setDate(o.getDate()+90);let s=o.toISOString().split(`T`)[0];for(let e of n)e.endDate>=r&&e.endDate<=s&&(t.some(t=>t.type===`contract_expiring`&&t.message.includes(e.contractNumber))||await Zt({id:`notif-${Date.now()}-${e.id}`,title:`⚠️ สัญญา PM ใกล้หมดอายุ (${e.contractNumber})`,message:`สัญญาบำรุงรักษาโครงการ "${e.title}" เลขที่ ${e.contractNumber} กำลังจะหมดอายุในวันที่ ${e.endDate} (กรุณาดำเนินการจัดทำสัญญาใหม่ล่วงหน้า 3 เดือน)`,targetDate:r,isRead:!1,type:`contract_expiring`,linkTo:`module10_pm`}))},Pe=(0,W.useRef)(0),Fe=(0,W.useRef)(null),Ie=async(e=!1,t=!1)=>{if(Fe.current)return Fe.current;let n=(async()=>{try{let n=async(e,t)=>{try{return await e()}catch(e){return console.warn(`Dataset fetch fallback to local:`,e),t}},[r,i,a,o,s,c,d,p,v,S,C]=await Promise.all([n(()=>mt(t),l.length>0?l:[]),n(bt,f),n(()=>Et(t),h),n(()=>Ct(t),_),n(At,b),n(Pt,T),n(Bt,E),n(Ut,ae),n(qt,se),n(Xt,D),n(()=>en(t),de)]),{syncedAssets:te}=await ht(r,o);u(te),m(i),g(a),y(o),x(s),ee(c),ie(d),oe(p),ce(v),ue(S),fe(C);let ne=Date.now();(e||ne-Pe.current>600*1e3)&&(Pe.current=ne,await Ne(v,S,p),ue(await Xt())),w(s.find(e=>e.status===`active`)||null)}catch(e){console.error(`Error fetching datasets:`,e)}finally{Fe.current=null}})();return Fe.current=n,n},[K,Re]=(0,W.useState)(!1),[ze,We]=(0,W.useState)(!0),[Ge,Ke]=(0,W.useState)(!1),[qe,q]=(0,W.useState)(null),Je=(0,W.useRef)(0),Ye=async(e=!1)=>{let t=typeof e==`boolean`?e:!1,n=Date.now();if(!(K||n-Je.current<4e3)){Je.current=n,Re(!0),Ke(!1),q(`กำลังดึงข้อมูลอัปเดตและซิงค์เฉพาะเครื่องนี้...`);try{try{sessionStorage.removeItem(`assetwatch_draft_survey_id`)}catch{}await Ie(!0,t),Ke(!0),q(`✓ รีเฟรชและซิงค์ข้อมูลเครื่องนี้สำเร็จ (${new Date().toLocaleTimeString(`th-TH`,{hour:`2-digit`,minute:`2-digit`,second:`2-digit`})} น.)`),setTimeout(()=>{Re(!1),Ke(!1)},1200),setTimeout(()=>{q(null)},3500)}catch(e){console.error(`Device refresh error:`,e),Re(!1),q(`⚠️ ซิงค์ข้อมูลไม่สำเร็จ: `+(e?.message||`กรุณาลองใหม่อีกครั้ง`)),setTimeout(()=>{q(null)},4e3)}}};(0,W.useEffect)(()=>{e||(We(!0),Ke(!1),Ie(!0,!1).then(()=>{Ke(!0),setTimeout(()=>{We(!1),Ke(!1)},1200)}).catch(()=>{We(!1)}))},[e]);let[Xe,Ze]=(0,W.useState)(()=>typeof window<`u`&&sessionStorage.getItem(`assetwatch_quota_exceeded`)===`true`),[Qe,$e]=(0,W.useState)(()=>typeof window<`u`&&sessionStorage.getItem(`assetwatch_quota_exceeded`)===`true`);(0,W.useEffect)(()=>{let e=()=>{Ze(!0),$e(!0)},t=()=>{Ze(!1),$e(!1)};return window.addEventListener(`assetwatch-quota-exceeded`,e),window.addEventListener(`assetwatch-quota-resolved`,t),()=>{window.removeEventListener(`assetwatch-quota-exceeded`,e),window.removeEventListener(`assetwatch-quota-resolved`,t)}},[]);let et=async()=>{try{at(),await Ie(!0,!1),Ze(!1),$e(!1),q(`✓ ตรวจสอบการเชื่อมต่อสำเร็จ โควตาพร้อมใช้งานแล้ว`),setTimeout(()=>q(null),3e3)}catch(e){ot(e,`retryQuotaCheck`)&&(Ze(!0),$e(!0))}};(0,W.useEffect)(()=>{!k&&!e&&Bt().then(e=>{ie(e)}).catch(e=>console.error(`Failed to sync users on mount:`,e))},[k,e]),(0,W.useEffect)(()=>{if(!k)return;let e,t=()=>{Tt(),alert(`🔒 ระบบได้นำคุณออกจากระบบโดยอัตโนมัติ เนื่องจากไม่มีการเคลื่อนไหวหรือใช้งานติดต่อกันเกิน 30 นาที เพื่อความปลอดภัยของข้อมูลพัสดุ`)},n=()=>{e&&clearTimeout(e),e=setTimeout(t,18e5)},r=[`mousemove`,`keydown`,`mousedown`,`click`,`scroll`,`touchstart`];return r.forEach(e=>{window.addEventListener(e,n)}),n(),()=>{e&&clearTimeout(e),r.forEach(e=>{window.removeEventListener(e,n)})}},[k]);let tt=()=>{localStorage.setItem(`assetwatch_demo_bypass`,`true`),t(!1),A(null),localStorage.removeItem(`assetwatch_session`),localStorage.removeItem(`assetwatch_operator`)},nt=()=>{localStorage.removeItem(`assetwatch_demo_bypass`),t(!0),o(`dashboard`),A(null),localStorage.removeItem(`assetwatch_session`),localStorage.removeItem(`assetwatch_operator`)},J=async e=>{await Vt(e),ie(t=>[...t.filter(t=>t.id!==e.id),e])},Y=async(e,t)=>{let n=E.find(t=>t.id===e);if(n){let r={...n,...t};await Vt(r),ie(t=>t.map(t=>t.id===e?r:t)),k&&k.id===e&&(A(r),localStorage.setItem(`assetwatch_session`,JSON.stringify(r)))}},X=async e=>{await Ht(e),ie(t=>t.filter(t=>t.id!==e))},rt=async e=>{await Wt(e),oe(t=>[...t.filter(t=>t.id!==e.id),e])},it=async(e,t)=>{await Gt(e,t),oe(n=>n.map(n=>n.id===e?{...n,...t}:n))},Z=async e=>{let t=se.filter(t=>t.contractId===e);for(let e of t)await $t(e.id);await Kt(e),oe(t=>t.filter(t=>t.id!==e)),ce(t=>t.filter(t=>t.contractId!==e))},Q=async e=>{await Jt(e),ce(t=>[...t.filter(t=>t.id!==e.id),e])},st=async(e,t)=>{await Yt(e,t),ce(n=>n.map(n=>n.id===e?{...n,...t}:n))},ct=async e=>{await $t(e),ce(t=>t.filter(t=>t.id!==e))},lt=async(e,t)=>{await Qt(e,t),ue(n=>n.map(n=>n.id===e?{...n,...t}:n))},ft=async e=>{await tn(e),fe(t=>[...t.filter(t=>t.id!==e.id),e])},pt=async e=>{await tn(e),fe(t=>t.map(t=>t.id===e.id?e:t))},St=async e=>{await nn(e),fe(t=>t.filter(t=>t.id!==e))},Tt=()=>{A(null),localStorage.removeItem(`assetwatch_session`),o(`dashboard`)},Nt=async e=>{e.preventDefault(),N(null);let t=E;try{t=await Bt(),ie(t)}catch(e){console.error(`Failed to sync users before login:`,e)}let n=t.find(e=>e.username.toLowerCase()===he.trim().toLowerCase());if(!n){N(`ไม่พบชื่อผู้ใช้งานนี้ในระบบ`);return}if(n.password!==j){N(`รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง`);return}if(n.isBlocked){N(`🚫 บัญชีนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบ`);return}A(n),localStorage.setItem(`assetwatch_session`,JSON.stringify(n)),localStorage.setItem(`assetwatch_operator`,n.name),ge(``),_e(``)},Rt=e=>{N(null);let t=E.find(t=>t.username===e);if(t){if(t.isBlocked){N(`🚫 บัญชีนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบ`);return}A(t),localStorage.setItem(`assetwatch_session`,JSON.stringify(t)),localStorage.setItem(`assetwatch_operator`,t.name),ge(``),_e(``)}},zt=async e=>{await gt(e),u(t=>[e,...t.filter(t=>t.id!==e.id)])},rn=async e=>{await _t(e);let t=new Set(e.map(e=>e.id));u(n=>[...e,...n.filter(e=>!t.has(e.id))])},vn=async(e,t,n)=>{await vt(e,{status:t,...n}),u(r=>r.map(r=>r.id===e?{...r,status:t,...n}:r))},yn=async(e,t)=>{await vt(e,t),u(n=>n.map(n=>n.id===e?{...n,...t}:n))},$=async e=>{let t={...e,id:`audit-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,timestamp:new Date().toISOString()};await xt(t),m(e=>[t,...e])},bn=async e=>{let t={...e,id:`survey-${Date.now()}-${Math.random().toString(36).slice(2,6)}`};await wt(t);let n=[t,..._.filter(e=>e.id!==t.id)];if(y(n),e.imageUrl&&e.imageUrl.trim()&&!dt(e.imageUrl)){let t=e.imageUrl;u(n=>n.map(n=>n.id===e.assetId?{...n,imageUrl:t}:n))}if(S){let e=n.filter(e=>e.roundId===S.id),t=l.length,r=e.length,i=t>0?Math.round(r/t*100):0,a={ใช้งานได้:0,ชำรุด:0,รอจำหน่าย:0,ขอป้ายรหัสใหม่:0,รอโอน:0,อื่นๆ:0};e.forEach(e=>{let t=e.status;a[t]===void 0?a.อื่นๆ++:a[t]++});let o={surveyedAssets:r,completionRate:i,statusBreakdown:a};await Mt(S.id,o),w(e=>e?{...e,...o}:null),x(e=>e.map(e=>e.id===S.id?{...e,...o}:e))}},xn=async(e,t)=>{if(b.find(e=>e.status===`active`)){alert(`มีรอบการสำรวจที่กำลังดำเนินการอยู่แล้ว กรุณาปิดรอบการสำรวจเดิมก่อน`);return}let n={id:`round-${Date.now()}`,name:e.trim(),dateCreated:new Date().toISOString(),status:`active`,totalAssets:l.length,surveyedAssets:0,completionRate:0,statusBreakdown:{ใช้งานได้:0,ชำรุด:0,รอจำหน่าย:0,ขอป้ายรหัสใหม่:0,รอโอน:0,อื่นๆ:0},operator:t||`แอดมินพัสดุ`};await jt(n),x(e=>[n,...e]),w(n)},Sn=async e=>{if(!S)return;let t=_.filter(e=>e.roundId===S.id),n=l.length,r=t.length,i=n>0?Math.round(r/n*100):0,a={ใช้งานได้:0,ชำรุด:0,รอจำหน่าย:0,ขอป้ายรหัสใหม่:0,รอโอน:0,อื่นๆ:0};t.forEach(e=>{let t=e.status;t in a?a[t]++:a.อื่นๆ++});let o={status:`closed`,dateClosed:new Date().toISOString(),totalAssets:n,surveyedAssets:r,completionRate:i,statusBreakdown:a,operator:e||S.operator};await Mt(S.id,o);let s={...S,...o};x(e=>e.map(e=>e.id===S.id?s:e)),w(null),await $({assetId:`SYSTEM`,assetName:`รอบการสำรวจ: ${S.name}`,action:`survey`,operator:e||`แอดมินพัสดุ`,details:`ปิดรอบการสำรวจประจำปีสำเร็จ อัตราการตรวจสอบ ${i}% (ตรวจสอบแล้ว ${r}/${n} รายการ)`})},Cn=async(e,t)=>{if(!S)return;let n=_,r=l.filter(t=>t.department===e),i=n.filter(t=>t.roundId===S.id?l.find(e=>e.id===t.assetId)?.department===e:!1),a={departmentSignoffs:{...S.departmentSignoffs||{},[e]:{department:e,signedBy:t,signedAt:new Date().toISOString(),status:`signed`,surveyedAssets:i.length,totalAssets:r.length}}};await Mt(S.id,a),w(e=>e?{...e,...a}:null),x(e=>e.map(e=>e.id===S.id?{...e,...a}:e)),await $({assetId:`SYSTEM`,assetName:`รอบการสำรวจ: ${S.name}`,action:`survey`,operator:t,details:`หัวหน้าฝ่าย/หน่วยงาน ${e} ยืนยันปิดรอบระดับฝ่ายเรียบร้อยแล้ว (${i.length}/${r.length} ชิ้น)`})},wn=async(e,t,n)=>{let r=b.find(t=>t.id===e);if(!r)return;let i={status:`active`,dateClosed:void 0,reopenHistory:[...r.reopenHistory||[],{reopenedBy:t,reopenedAt:new Date().toISOString(),reason:n||`ดึงรอบกลับมาแก้ไขตรวจนับเพิ่ม`}]};await Mt(e,i),x(t=>t.map(t=>t.id===e?{...t,...i}:t)),w({...r,...i}),await $({assetId:`SYSTEM`,assetName:`รอบการสำรวจ: ${r.name}`,action:`survey`,operator:t,details:`ผู้บริหาร/แอดมินดึงรอบการสำรวจกลับมาแก้ไขตรวจนับเพิ่ม (เหตุผล: ${n||`ดึงรอบกลับมาแก้ไข`})`})},Tn=async(e,t,n)=>{let r={id:`dept-${Date.now()}`,name:e.trim(),locations:t.map(e=>e.trim()).filter(Boolean),createdBy:n||k?.username||k?.name||`admin`,createdAt:new Date().toISOString(),locationCreators:{}};await Ft(r),ee(e=>[...e.filter(e=>e.id!==r.id),r])},En=async(e,t,n,r)=>{let i={name:t.trim(),locations:n.map(e=>e.trim()).filter(Boolean)};r!==void 0&&(i.locationCreators=r),await It(e,i),ee(t=>t.map(t=>t.id===e?{...t,...i}:t))},Dn=async e=>{await Lt(e),ee(t=>t.filter(t=>t.id!==e))},On=async e=>{let t=await Dt(e),n={...e,id:t};return g(e=>[n,...e.filter(e=>e.id!==t)]),t},kn=async(e,t)=>{await Ot(e,t),g(n=>n.map(n=>n.id===e?{...n,...t}:n))},An=async e=>{await kt(e),g(t=>t.filter(t=>t.id!==e))},jn=e=>!e||!k?!1:k.role===`admin`||k.role===`manager`?!0:k.role===`head`?!!(e.department&&k.department&&e.department.trim().toLowerCase()===k.department.trim().toLowerCase()):k.role===`user`||k.role===`operator`?!!(e.createdBy&&(e.createdBy===k.username||e.createdBy===k.name||e.createdBy===k.id)):!1,Mn=e=>{L(e),ve(e.name),B(e.location),ye(e.department),xe(e.responsiblePerson),H(e.status),Ce(e.note),De(e.imageUrl),Te(null)},Nn=async e=>{if(e.preventDefault(),I){Ae(!0);try{let e=k?.name||`แอดมินพัสดุ`,t=Ee||``;we&&(t=await ut(we,`assets`));let n={};if([`name`,`location`,`department`,`responsiblePerson`,`status`,`note`].forEach(e=>{let t=``;e===`name`?t=R:e===`location`?t=z:e===`department`?t=V:e===`responsiblePerson`?t=be:e===`status`?t=Se:e===`note`&&(t=U),I[e]!==t&&(n[e]={old:I[e],new:t})}),I.imageUrl!==t&&(!t&&I.imageUrl?n.imageUrl={old:`[รูปภาพเดิม]`,new:`[ลบรูปภาพแล้ว]`}:t&&!I.imageUrl?n.imageUrl={old:`[ไม่มีรูป]`,new:`[อัปโหลดรูปภาพใหม่]`}:n.imageUrl={old:`[รูปถ่ายเดิม]`,new:`[รูปถ่ายใหม่]`}),Object.keys(n).length===0){L(null),Ae(!1);return}await vt(I.id,{name:R.trim(),location:z.trim(),department:V.trim(),responsiblePerson:be.trim(),status:Se,note:U.trim(),imageUrl:t}),await $({assetId:I.id,assetName:R.trim(),action:`edit`,operator:e,details:`แก้ไขรายละเอียดครุภัณฑ์ในระบบโดยฝ่ายทะเบียน`,changes:n});let r={...I,name:R.trim(),location:z.trim(),department:V.trim(),responsiblePerson:be.trim(),status:Se,note:U.trim(),imageUrl:t,updatedAt:new Date().toISOString()};u(e=>e.map(e=>e.id===I.id?r:e)),L(null)}catch(e){console.error(e),alert(`ไม่สามารถอัปเดตข้อมูลครุภัณฑ์ได้`)}finally{Ae(!1)}}},Pn=async e=>{let t=l.find(t=>t.id===e);if(!t)return;let n=k?.role===`admin`||k?.role===`manager`,r=k?.role===`head`&&t.department?.trim().toLowerCase()===k?.department?.trim().toLowerCase(),i=(k?.role===`user`||k?.role===`operator`)&&!!(t.createdBy&&(t.createdBy===k.username||t.createdBy===k.name||t.createdBy===k.id));if(!n&&!r&&!i){alert(`คุณไม่มีสิทธิ์ในการลบครุภัณฑ์ชิ้นนี้`);return}try{await yt(e),await $({assetId:t.id,assetName:t.name,action:`dispose`,operator:k?.name||`ผู้ดูแลระบบ`,details:`ลบข้อมูลครุภัณฑ์ถาวรออกจากระบบ (รหัส: ${t.id}) โดย ${k?.name||`ผู้ใช้งาน`}`}),u(t=>t.filter(t=>t.id!==e))}catch(e){console.error(`Failed to delete asset:`,e),alert(`ไม่สามารถลบข้อมูลครุภัณฑ์ได้`)}},Fn=e=>{F(e),o(`module3`)},In=Le();return e?(0,G.jsx)(Be,{onSetupComplete:tt}):(0,G.jsxs)(`div`,{className:`app-container`,children:[k?(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(Oe,{currentTab:n,setCurrentTab:o,theme:s,setTheme:c,isFirebaseConfigured:In.isConfigured,currentUser:k,onLogout:Tt,onRefreshDevice:Ye,isRefreshing:K}),(0,G.jsxs)(`main`,{className:`main-content`,children:[(0,G.jsxs)(`div`,{className:`top-header-bar glass-panel`,style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,padding:`0.45rem 1rem`,borderRadius:`var(--radius-md)`,marginBottom:`1.25rem`,border:`1px solid var(--border)`,background:`var(--bg-secondary)`,position:`relative`},children:[(0,G.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,fontSize:`0.8rem`},children:qe?(0,G.jsxs)(`span`,{className:`animate-fade-in`,style:{color:qe.startsWith(`✓`)?`var(--success)`:`var(--primary)`,fontWeight:650,display:`inline-flex`,alignItems:`center`,gap:`5px`},children:[qe.startsWith(`✓`)&&(0,G.jsx)(le,{size:16,color:`var(--success)`}),qe]}):(0,G.jsxs)(`span`,{style:{color:`var(--text-muted)`,fontSize:`0.75rem`,display:`inline-flex`,alignItems:`center`,gap:`6px`},children:[(0,G.jsx)(`span`,{style:{width:`8px`,height:`8px`,borderRadius:`50%`,background:In.isConfigured?`var(--success)`:`var(--warning)`,display:`inline-block`}}),In.isConfigured?`เชื่อมต่อ Cloud ส่วนกลางแบบเรียลไทม์`:`โหมดทดสอบออฟไลน์ (Local Cache)`]})}),(0,G.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.75rem`},children:[(0,G.jsxs)(`button`,{type:`button`,className:`btn btn-secondary btn-sm`,onClick:Ye,disabled:K,title:`รีเฟรชและซิงค์ข้อมูลเครื่องนี้กับระบบกลาง`,style:{display:`inline-flex`,alignItems:`center`,gap:`0.4rem`,fontSize:`0.8rem`,padding:`0.35rem 0.75rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`,background:`var(--bg-primary)`,color:`var(--primary)`,cursor:K?`wait`:`pointer`},children:[(0,G.jsx)(p,{size:14,className:K?`animate-spin`:``}),(0,G.jsx)(`span`,{children:K?`กำลังซิงค์...`:`🔄 ซิงค์เครื่องนี้`})]}),(0,G.jsxs)(`button`,{onClick:()=>O(!me),className:`btn btn-ghost`,style:{position:`relative`,padding:`0.4rem`,height:`auto`,border:`1px solid var(--border)`,background:`var(--bg-primary)`,borderRadius:`50%`},title:`การแจ้งเตือนบำรุงรักษา`,children:[(0,G.jsx)(r,{size:16}),D.filter(e=>!e.isRead).length>0&&(0,G.jsx)(`span`,{style:{position:`absolute`,top:`-4px`,right:`-4px`,background:`var(--danger)`,color:`white`,fontSize:`9px`,fontWeight:700,borderRadius:`50%`,width:`16px`,height:`16px`,display:`flex`,alignItems:`center`,justifyContent:`center`,boxShadow:`0 0 0 2px var(--bg-secondary)`},children:D.filter(e=>!e.isRead).length})]}),me&&(0,G.jsxs)(`div`,{className:`notifications-dropdown-menu glass-panel`,style:{position:`absolute`,top:`100%`,right:`0`,marginTop:`0.5rem`,width:`320px`,maxHeight:`400px`,overflowY:`auto`,zIndex:999,padding:`1rem`,display:`flex`,flexDirection:`column`,gap:`0.75rem`,border:`1px solid var(--border)`,boxShadow:`var(--shadow-lg)`},children:[(0,G.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,borderBottom:`1px solid var(--border)`,paddingBottom:`0.35rem`},children:[(0,G.jsxs)(`h4`,{style:{fontSize:`0.85rem`,fontWeight:800,margin:0},children:[`🔔 การแจ้งเตือนบำรุงรักษา (`,D.filter(e=>!e.isRead).length,`)`]}),D.filter(e=>!e.isRead).length>0&&(0,G.jsx)(`button`,{className:`btn btn-ghost btn-xs`,onClick:async()=>{for(let e of D)e.isRead||await lt(e.id,{isRead:!0})},style:{fontSize:`0.7rem`,padding:`0 0.25rem`},children:`อ่านทั้งหมด`})]}),(0,G.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.5rem`},children:D.length===0?(0,G.jsx)(`div`,{style:{fontSize:`0.8rem`,color:`var(--text-muted)`,textAlign:`center`,padding:`1.5rem 0`},children:`ไม่มีแจ้งเตือนบำรุงรักษา`}):D.map(e=>(0,G.jsxs)(`div`,{onClick:async()=>{e.isRead||await lt(e.id,{isRead:!0}),o(`module10_pm`),O(!1)},style:{background:e.isRead?`transparent`:`rgba(59, 130, 246, 0.05)`,border:`1px solid var(--border)`,padding:`0.6rem 0.75rem`,borderRadius:`var(--radius-sm)`,cursor:`pointer`,fontSize:`0.75rem`},children:[(0,G.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,marginBottom:`0.15rem`,fontWeight:700},children:[(0,G.jsx)(`span`,{children:e.title}),!e.isRead&&(0,G.jsx)(`span`,{style:{width:`6px`,height:`6px`,background:`var(--primary)`,borderRadius:`50%`}})]}),(0,G.jsx)(`p`,{style:{margin:0,color:`var(--text-secondary)`,lineHeight:1.35},children:e.message})]},e.id))})]})]})]}),Xe&&(0,G.jsxs)(`div`,{className:`animate-fade-in`,style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:`0.75rem`,padding:`0.75rem 1rem`,marginBottom:`1.25rem`,borderRadius:`var(--radius-md)`,background:`#fef2f2`,border:`1.5px solid #f87171`,color:`#991b1b`,fontSize:`0.85rem`,boxShadow:`0 4px 6px -1px rgba(239, 68, 68, 0.1)`},children:[(0,G.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.6rem`,fontWeight:650},children:[(0,G.jsx)(C,{size:18,color:`#dc2626`,style:{flexShrink:0}}),(0,G.jsx)(`span`,{children:`⚠️ ระบบคลาวด์ติด Limit โควตาประจำวันชั่วคราว — ข้อมูลจะทำงานในโหมดออฟไลน์ กรุณาพักการสแกน/บันทึกไว้ก่อน`})]}),(0,G.jsx)(`button`,{type:`button`,className:`btn btn-secondary btn-sm`,onClick:()=>$e(!0),style:{flexShrink:0,padding:`0.3rem 0.75rem`,fontSize:`0.8rem`,fontWeight:700,borderRadius:`6px`,background:`#ffffff`,color:`#dc2626`,borderColor:`#fca5a5`,cursor:`pointer`},children:`ดูคำแนะนำ ℹ️`})]}),(0,G.jsx)(He,{fallbackTitle:`เกิดข้อผิดพลาดในการแสดงผลหน้านี้`,children:(0,G.jsxs)(W.Suspense,{fallback:(0,G.jsx)(_n,{}),children:[n===`dashboard`&&(0,G.jsx)(Ve,{assets:l,repairs:h,surveys:_,setCurrentTab:o,currentUser:k}),n===`module1`&&(0,G.jsx)(an,{assets:l,audits:f,repairs:h,surveys:_,schedules:se,onAssetEdit:Mn,onAssetDelete:Pn,currentUser:k,onRefreshData:Ie,spareParts:de,onAddSparePart:ft,onUpdateSparePart:pt,onDeleteSparePart:St}),n===`module2`&&(0,G.jsx)(on,{assets:l,surveys:_,rounds:b,activeRound:S,onAddSurvey:bn,onUpdateAssetStatus:vn,onLogAudit:$,onRedirectToAdd:Fn,onCreateSurveyRound:xn,onCloseActiveRound:Sn,onDepartmentSignoff:Cn,onReopenSurveyRound:wn,currentUser:k,onRefreshDevice:Ye,isRefreshing:K||ze}),n===`module3`&&(0,G.jsx)(sn,{assets:l,onAddAsset:zt,onBulkAddAssets:rn,onLogAudit:$,prefilledAssetId:P,clearPrefilledAssetId:()=>F(null),setCurrentTab:o,departments:T,currentUser:k}),n===`module4`&&(0,G.jsx)(cn,{assets:l,audits:f,onUpdateAssetStatus:vn,onLogAudit:$,currentUser:k}),n===`module5_transfer`&&(0,G.jsx)(ln,{assets:l,audits:f,onUpdateAssetTransfer:yn,onLogAudit:$,departments:T,currentUser:k}),n===`module10_pm`&&(0,G.jsx)(mn,{assets:l,repairs:h,contracts:ae,schedules:se,notifications:D,onAddContract:rt,onUpdateContract:it,onDeleteContract:Z,onAddPMSchedule:Q,onUpdatePMSchedule:st,onDeletePMSchedule:ct,onAddRepair:On,onUpdateRepair:kn,onDeleteRepair:An,onUpdateAssetStatus:vn,onLogAudit:$,currentUser:k,onRefreshData:Ie}),n===`module11_quality`&&(0,G.jsx)(hn,{assets:l,contracts:ae,currentUser:k}),n===`module12_spareparts`&&(0,G.jsx)(gn,{assets:l,spareParts:de,onAddSparePart:ft,onUpdateSparePart:pt,onDeleteSparePart:St,onLogAudit:$,currentUser:k}),n===`module6`&&(0,G.jsx)(un,{audits:f}),n===`module7`&&(0,G.jsx)(dn,{onClearConfig:nt,onImportSuccess:Ie,assets:l,audits:f,repairs:h,surveys:_,rounds:b,departments:T,users:E,currentUser:k}),n===`module8`&&(0,G.jsx)(fn,{departments:T,onAddDept:Tn,onUpdateDept:En,onDeleteDept:Dn,currentUser:k}),n===`module9`&&k?.role===`admin`&&(0,G.jsx)(pn,{departments:T,users:E,onAddUser:J,onUpdateUser:Y,onDeleteUser:X,currentUser:k})]})})]})]}):(0,G.jsxs)(`div`,{className:`login-overlay-container`,"data-theme":s,children:[(0,G.jsxs)(`div`,{className:`login-glass-card glass-panel animate-scale-up`,children:[(0,G.jsxs)(`div`,{className:`login-logo-header`,children:[(0,G.jsx)(`div`,{className:`logo-symbol`,style:{width:`48px`,height:`48px`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,G.jsx)(a,{size:26,color:`#ffffff`,className:`logo-lock-icon`})}),(0,G.jsx)(`h2`,{children:`AMIS Login`}),(0,G.jsx)(`p`,{children:`ระบบควบคุมสิทธิ์และจัดการครุภัณฑ์ภาครัฐ (Asset Management Information System)`})]}),(0,G.jsxs)(`form`,{onSubmit:Nt,className:`login-form-fields`,children:[(0,G.jsxs)(`div`,{className:`form-group`,children:[(0,G.jsx)(`label`,{className:`form-label`,children:`👤 ชื่อผู้ใช้งาน (Username)`}),(0,G.jsxs)(`select`,{className:`form-select monospace-input`,value:he,onChange:e=>ge(e.target.value),required:!0,style:{cursor:`pointer`},children:[(0,G.jsx)(`option`,{value:``,children:`-- เลือกชื่อผู้ใช้งาน (Select User) --`}),E.map(e=>(0,G.jsxs)(`option`,{value:e.username,children:[e.name,` (`,e.username,`) — `,e.role===`admin`?`👑 แอดมินสูงสุด`:e.role===`manager`?`💼 ผู้บริหาร`:e.role===`head`?`👔 หัวหน้า (${e.department})`:`🔧 ปฏิบัติงาน (${e.department})`,` `,e.isBlocked?`🚫 [ถูกระงับสิทธิ์]`:``]},e.id))]})]}),(0,G.jsxs)(`div`,{className:`form-group`,style:{marginTop:`0.85rem`},children:[(0,G.jsx)(`label`,{className:`form-label`,children:`🔑 รหัสผ่าน (Password)`}),(0,G.jsx)(`input`,{type:`password`,className:`form-input`,placeholder:`ป้อนรหัสผ่าน...`,value:j,onChange:e=>_e(e.target.value),required:!0})]}),M&&(0,G.jsxs)(`div`,{className:`alert alert-danger animate-shake`,style:{marginTop:`1rem`,padding:`0.75rem`,fontSize:`0.85rem`},children:[(0,G.jsx)(ne,{size:16}),` `,(0,G.jsx)(`span`,{children:M})]}),(0,G.jsx)(`button`,{type:`submit`,className:`btn btn-primary w-full`,style:{marginTop:`1.25rem`,height:`42px`,fontSize:`0.95rem`},children:`🚀 ลงชื่อเข้าใช้งานระบบ`})]}),!In.isConfigured&&localStorage.getItem(`assetwatch_hide_demo_bypass`)!==`true`&&(0,G.jsxs)(`div`,{className:`quick-demo-accounts`,children:[(0,G.jsx)(`span`,{className:`demo-title`,children:`⚡ ปุ่มล็อคอินบัญชีทดสอบระดับสิทธิ์ (Demo Bypass)`}),(0,G.jsxs)(`div`,{className:`demo-badges-grid`,children:[(0,G.jsx)(`button`,{className:`demo-badge badge-admin`,onClick:()=>Rt(`admin`),children:`👑 แอดมินสูงสุด (Admin)`}),(0,G.jsx)(`button`,{className:`demo-badge badge-manager`,onClick:()=>Rt(`manager`),children:`💼 ผู้จัดการ (Manager)`}),(0,G.jsx)(`button`,{className:`demo-badge badge-it`,onClick:()=>Rt(`it_user`),children:`💻 แผนก IT (Operator)`}),(0,G.jsx)(`button`,{className:`demo-badge badge-general`,onClick:()=>Rt(`admin_general`),children:`💼 บริหารทั่วไป (Operator)`}),(0,G.jsx)(`button`,{className:`demo-badge badge-blocked`,onClick:()=>Rt(`blocked`),style:{gridColumn:`span 2`},children:`🚫 บัญชีโดนแบน (Blocked)`})]})]})]}),(0,G.jsx)(`style`,{children:`
            .login-overlay-container {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              width: 100vw;
              background-color: var(--bg-primary);
              background-image: radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.04) 0%, transparent 40%),
                                radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.04) 0%, transparent 40%);
              padding: 1.5rem;
            }

            .login-glass-card {
              max-width: 440px;
              width: 100%;
              padding: 2.5rem 2rem;
              display: flex;
              flex-direction: column;
              box-shadow: var(--glass-shadow);
              border: 1px solid var(--border);
            }

            .login-logo-header {
              text-align: center;
              margin-bottom: 1.75rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.5rem;
            }

            .login-logo-header h2 {
              font-size: 1.5rem;
              font-weight: 800;
              background: linear-gradient(120deg, var(--primary), var(--info));
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin: 0.25rem 0 0 0;
            }

            .login-logo-header p {
              font-size: 0.8rem;
              color: var(--text-muted);
              line-height: 1.35;
            }

            .logo-lock-icon {
              animation: lock-float 3s infinite alternate ease-in-out;
            }

            @keyframes lock-float {
              0% { transform: translateY(0); }
              100% { transform: translateY(-4px); }
            }

            .monospace-input {
              font-family: monospace;
              font-weight: 600;
            }

            .w-full {
              width: 100%;
            }

            .quick-demo-accounts {
              margin-top: 1.75rem;
              border-top: 1px dashed var(--border);
              padding-top: 1.25rem;
              display: flex;
              flex-direction: column;
              gap: 0.75rem;
            }

            .demo-title {
              font-size: 0.75rem;
              font-weight: 650;
              color: var(--text-muted);
              text-align: center;
            }

            .demo-badges-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 0.5rem;
            }

            .demo-badge {
              padding: 0.5rem 0.25rem;
              font-size: 0.725rem;
              font-weight: 650;
              border-radius: var(--radius-sm);
              border: 1px solid var(--border);
              background-color: var(--bg-secondary);
              color: var(--text-secondary);
              cursor: pointer;
              transition: all var(--transition-fast);
              text-align: center;
              height: auto;
            }

            .demo-badge:hover {
              transform: scale(1.02);
            }

            .badge-admin:hover {
              border-color: #6366f1;
              color: #6366f1;
              background-color: rgba(99, 102, 241, 0.05);
            }

            .badge-manager:hover {
              border-color: #8b5cf6;
              color: #8b5cf6;
              background-color: rgba(139, 92, 246, 0.05);
            }

            .badge-it:hover {
              border-color: var(--primary);
              color: var(--primary);
              background-color: rgba(59, 130, 246, 0.05);
            }

            .badge-general:hover {
              border-color: var(--cyan);
              color: var(--cyan);
              background-color: rgba(6, 182, 212, 0.05);
            }

            .badge-blocked:hover {
              border-color: var(--danger);
              color: var(--danger);
              background-color: rgba(239, 68, 68, 0.05);
            }

            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              20%, 60% { transform: translateX(-4px); }
              40%, 80% { transform: translateX(4px); }
            }

            .animate-shake {
              animation: shake 0.3s ease-in-out;
            }
          `})]}),I&&(0,G.jsx)(`div`,{className:`modal-backdrop`,children:(0,G.jsxs)(`form`,{onSubmit:Nn,className:`modal-card glass-panel animate-fade-in`,style:{maxWidth:`650px`},children:[(0,G.jsxs)(`div`,{className:`modal-header`,children:[(0,G.jsxs)(`div`,{className:`modal-title-group`,children:[(0,G.jsx)(`span`,{className:`badge badge-primary`,children:`แก้ไขฐานข้อมูลครุภัณฑ์`}),(0,G.jsx)(`h2`,{children:I.name}),(0,G.jsxs)(`span`,{className:`modal-asset-id`,children:[`รหัสครุภัณฑ์: `,(0,G.jsx)(`code`,{children:I.id})]})]}),(0,G.jsx)(`button`,{type:`button`,className:`btn-close`,onClick:()=>L(null),children:(0,G.jsx)(te,{size:18})})]}),(0,G.jsxs)(`div`,{className:`modal-body`,style:{display:`flex`,flexDirection:`column`,gap:`0.85rem`},children:[(0,G.jsxs)(`div`,{className:`form-group`,children:[(0,G.jsx)(`label`,{className:`form-label`,children:`🖥️ ชื่อเครื่องครุภัณฑ์`}),(0,G.jsx)(`input`,{type:`text`,className:`form-input`,value:R,onChange:e=>ve(e.target.value),required:!0})]}),(0,G.jsxs)(`div`,{className:`form-row-double`,children:[(0,G.jsxs)(`div`,{className:`form-group flex-1`,children:[(0,G.jsx)(`label`,{className:`form-label`,children:`📍 สถานที่จัดเก็บ/ติดตั้งใหม่`}),(0,G.jsx)(Ue,{options:je,value:z,onChange:e=>B(e),placeholder:`พิมพ์ค้นหา หรือเลือกห้อง/ที่ตั้ง...`,allowCustom:!0,icon:(0,G.jsx)(d,{size:15,color:`var(--primary)`}),required:!0})]}),(0,G.jsxs)(`div`,{className:`form-group flex-1`,children:[(0,G.jsx)(`label`,{className:`form-label`,children:`🏢 ฝ่าย/หน่วยงานผู้ดูแลพัสดุ`}),(0,G.jsx)(Ue,{options:Me,value:V,onChange:e=>ye(e),placeholder:`พิมพ์ค้นหา หรือเลือกฝ่าย...`,allowCustom:!0,icon:(0,G.jsx)(pe,{size:15,color:`var(--primary)`}),required:!0})]})]}),(0,G.jsxs)(`div`,{className:`form-row-double`,children:[(0,G.jsxs)(`div`,{className:`form-group flex-1`,children:[(0,G.jsx)(`label`,{className:`form-label`,children:`👤 ชื่อเจ้าหน้าที่ผู้ดูแลรับผิดชอบ`}),(0,G.jsx)(`input`,{type:`text`,className:`form-input`,value:be,onChange:e=>xe(e.target.value),required:!0})]}),(0,G.jsxs)(`div`,{className:`form-group flex-1`,children:[(0,G.jsx)(`label`,{className:`form-label`,children:`🔍 ปรับปรุงแก้ไขสถานะ`}),(0,G.jsxs)(`select`,{className:`form-select`,value:Se,onChange:e=>H(e.target.value),required:!0,children:[(0,G.jsx)(`option`,{value:`ใช้งานได้`,children:`ใช้งานได้`}),(0,G.jsx)(`option`,{value:`ชำรุด`,children:`ชำรุด`}),(0,G.jsx)(`option`,{value:`ขอป้ายรหัสใหม่`,children:`ขอป้ายรหัสใหม่`}),(0,G.jsx)(`option`,{value:`รอโอน`,children:`รอโอน`}),(0,G.jsx)(`option`,{value:`รอจำหน่าย`,children:`รอจำหน่าย`}),(0,G.jsx)(`option`,{value:`อื่นๆ`,children:`อื่นๆ`})]})]})]}),(0,G.jsxs)(`div`,{className:`form-group`,children:[(0,G.jsx)(`label`,{className:`form-label`,children:`📝 โน้ตบันทึกข้อมูล / ชื่อเล่นเครื่องมือ (Note / Equipment Nickname)`}),(0,G.jsx)(`input`,{type:`text`,className:`form-input`,placeholder:`เช่น เครื่องเป่าอัด 1, ตู้นึ่ง AR-2, ปั๊มหลักตึก 5...`,value:U,onChange:e=>Ce(e.target.value)})]}),(0,G.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,G.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`0.35rem`},children:[(0,G.jsx)(`label`,{className:`form-label`,style:{marginBottom:0},children:`📷 ถ่ายภาพ/อัปเดตรูปภาพเครื่องใหม่`}),Ee&&jn(I)&&(0,G.jsxs)(`button`,{type:`button`,className:`btn btn-danger btn-xs`,onClick:e=>{e.preventDefault(),e.stopPropagation(),De(``),Te(null)},style:{padding:`0.2rem 0.5rem`,fontSize:`0.7rem`,display:`inline-flex`,alignItems:`center`,gap:`0.25rem`},title:`นำรูปภาพนี้ออก (ลบรูป)`,children:[(0,G.jsx)(re,{size:11}),` นำรูปภาพออก`]})]}),(0,G.jsxs)(`div`,{className:`survey-upload-trigger`,children:[(0,G.jsx)(`input`,{type:`file`,id:`edit-pic-picker`,accept:`image/*`,className:`file-hidden-input`,onChange:e=>{if(e.target.files&&e.target.files[0]){let t=e.target.files[0];Te(t);let n=new FileReader;n.onloadend=()=>De(n.result),n.readAsDataURL(t)}}}),(0,G.jsx)(`label`,{htmlFor:`edit-pic-picker`,className:`upload-box-dashed`,style:{padding:`1rem 0.5rem`},children:Ee?(0,G.jsxs)(`div`,{className:`preview-image-box`,style:{maxHeight:`120px`,maxWidth:`160px`},children:[(0,G.jsx)(`img`,{src:Ee,alt:`editing asset preview`}),(0,G.jsxs)(`span`,{className:`preview-indicator`,children:[(0,G.jsx)(v,{size:10}),` กดถ่าย/เปลี่ยนรูปใหม่`]})]}):(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(v,{size:18,color:`var(--text-muted)`}),(0,G.jsx)(`span`,{children:`กดถ่าย หรือเลือกไฟล์รูปภาพครุภัณฑ์`})]})})]})]})]}),(0,G.jsxs)(`div`,{className:`modal-header`,style:{borderTop:`1px solid var(--border)`,borderBottom:`none`,padding:`1rem 1.5rem`},children:[(0,G.jsx)(`div`,{}),(0,G.jsxs)(`div`,{className:`form-actions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:()=>L(null),children:`ยกเลิก`}),(0,G.jsx)(`button`,{type:`submit`,className:`btn btn-primary`,disabled:ke,children:ke?`กำลังอัปเดตระบบ...`:`💾 บันทึกการแก้ไขข้อมูล`})]})]})]})}),(ze||K)&&(0,G.jsx)(`div`,{className:`global-sync-popup-backdrop animate-fade-in`,children:(0,G.jsxs)(`div`,{className:`global-sync-popup-card ${Ge?`sync-success-state`:``}`,children:[(0,G.jsx)(`div`,{className:`sync-popup-icon-bubble`,children:Ge?(0,G.jsx)(le,{size:24,color:`#10b981`}):(0,G.jsx)(p,{size:24,className:`animate-spin text-primary`})}),(0,G.jsxs)(`div`,{className:`sync-popup-text`,children:[(0,G.jsx)(`h4`,{children:Ge?`✓ ซิงค์ข้อมูลล่าสุดสำเร็จ!`:`กำลังซิงค์ข้อมูลกับระบบคลาวด์...`}),(0,G.jsx)(`p`,{children:Ge?`ข้อมูลครุภัณฑ์และผลการสำรวจล่าสุดพร้อมใช้งานแล้ว`:`ระบบกำลังดึงข้อมูลและอัปเดตความก้าวหน้าล่าสุด โปรดรอสักครู่`}),!Ge&&(0,G.jsx)(`div`,{className:`sync-popup-progress-track`,children:(0,G.jsx)(`div`,{className:`sync-popup-progress-bar`})})]}),!Ge&&(0,G.jsx)(`button`,{type:`button`,className:`btn-sync-dismiss`,onClick:()=>{We(!1),Re(!1)},title:`ปิดการแจ้งเตือน`,children:`✕`})]})}),Qe&&(0,G.jsx)(`div`,{className:`modal-backdrop animate-fade-in`,style:{zIndex:1e5,background:`rgba(15, 23, 42, 0.75)`,backdropFilter:`blur(5px)`,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`1rem`},children:(0,G.jsxs)(`div`,{className:`modal-card animate-fade-in`,style:{maxWidth:`540px`,width:`100%`,borderRadius:`16px`,border:`1.5px solid #ef4444`,background:`var(--bg-primary)`,padding:`0`,overflow:`hidden`,boxShadow:`0 25px 50px -12px rgba(239, 68, 68, 0.35)`},children:[(0,G.jsx)(`div`,{style:{background:`linear-gradient(135deg, #ef4444, #dc2626)`,padding:`1.25rem 1.5rem`,color:`#ffffff`},children:(0,G.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.75rem`},children:[(0,G.jsx)(`div`,{style:{background:`rgba(255, 255, 255, 0.2)`,padding:`8px`,borderRadius:`50%`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,G.jsx)(C,{size:28,color:`#ffffff`})}),(0,G.jsxs)(`div`,{children:[(0,G.jsx)(`h3`,{style:{margin:0,fontSize:`1.2rem`,fontWeight:700,color:`#ffffff`},children:`ระบบใช้งานเกินโควตาประจำวันชั่วคราว`}),(0,G.jsx)(`p`,{style:{margin:`3px 0 0`,fontSize:`0.82rem`,opacity:.9},children:`(Cloud Database Daily Quota Reached)`})]})]})}),(0,G.jsxs)(`div`,{style:{padding:`1.5rem`,display:`flex`,flexDirection:`column`,gap:`1rem`,fontSize:`0.9rem`,color:`var(--text-main)`,lineHeight:1.6},children:[(0,G.jsxs)(`div`,{style:{padding:`0.75rem 1rem`,background:`#ecfdf5`,border:`1px solid #6ee7b7`,borderRadius:`10px`,color:`#065f46`},children:[(0,G.jsxs)(`div`,{style:{fontWeight:700,display:`flex`,alignItems:`center`,gap:`6px`,marginBottom:`2px`},children:[(0,G.jsx)(le,{size:16,color:`#059669`}),(0,G.jsx)(`span`,{children:`ข้อมูลของคุณยังคงปลอดภัย (ไม่สูญหาย)`})]}),(0,G.jsx)(`div`,{style:{fontSize:`0.82rem`},children:`รายการที่คุณบันทึกไปก่อนหน้านี้ ได้ถูกจัดเก็บไว้ในเครื่องนี้ (Local Cache) เรียบร้อยแล้ว`})]}),(0,G.jsxs)(`div`,{children:[(0,G.jsx)(`p`,{style:{margin:`0 0 0.5rem`,fontWeight:650,color:`var(--text-main)`},children:`🛑 สิ่งที่ผู้ใช้งานควรปฏิบัติในขณะนี้:`}),(0,G.jsxs)(`ol`,{style:{margin:0,paddingLeft:`1.25rem`,display:`flex`,flexDirection:`column`,gap:`0.45rem`,fontSize:`0.875rem`},children:[(0,G.jsxs)(`li`,{children:[(0,G.jsx)(`strong`,{children:`ขอให้หยุดการสแกนหรือบันทึกข้อมูลเพิ่มเติมชั่วคราว`}),` เพื่อป้องกันไม่ให้ข้อมูลค้างอยู่ในเครื่องเพียงเครื่องเดียว`]}),(0,G.jsxs)(`li`,{children:[(0,G.jsx)(`strong`,{children:`รอระบบเติมโควตารอบใหม่`}),`: ระบบ Cloud จะรีเซ็ตโควตาอัตโนมัติทุกวันเวลา `,(0,G.jsx)(`strong`,{children:`14:00 น.`}),` หรือ `,(0,G.jsx)(`strong`,{children:`เที่ยงคืน`})]}),(0,G.jsxs)(`li`,{children:[(0,G.jsx)(`strong`,{children:`กรณีงานเร่งด่วน`}),`: กรุณาแจ้งผู้ดูแลระบบ (Admin) เพื่อทำการขยายขนาดโควตา Cloud (Blaze Plan)`]})]})]}),(0,G.jsxs)(`div`,{style:{fontSize:`0.8rem`,color:`var(--text-muted)`,borderTop:`1px solid var(--border)`,paddingTop:`0.75rem`},children:[`💡 `,(0,G.jsx)(`em`,{children:`หมายเหตุ: เมื่อโควตากลับมาเติมแล้ว คุณสามารถกดปุ่ม "🔄 ซิงค์เครื่องนี้" เพื่อส่งข้อมูลขึ้นระบบกลางได้ตามปกติทันที`})]})]}),(0,G.jsxs)(`div`,{style:{padding:`1rem 1.5rem`,background:`var(--bg-secondary)`,borderTop:`1px solid var(--border)`,display:`flex`,justifyContent:`flex-end`,gap:`0.75rem`,flexWrap:`wrap`},children:[(0,G.jsxs)(`button`,{type:`button`,className:`btn btn-secondary btn-sm`,onClick:et,style:{display:`inline-flex`,alignItems:`center`,gap:`6px`},children:[(0,G.jsx)(p,{size:14}),(0,G.jsx)(`span`,{children:`ทดสอบเชื่อมต่อใหม่`})]}),(0,G.jsx)(`button`,{type:`button`,className:`btn btn-primary btn-sm`,onClick:()=>$e(!1),style:{background:`#dc2626`,borderColor:`#b91c1c`,color:`#fff`,fontWeight:600,padding:`0.5rem 1.25rem`},children:`รับทราบ และพักการใช้งานชั่วคราว`})]})]})}),(0,G.jsx)(`style`,{children:`
        .global-sync-popup-backdrop {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 92%;
          max-width: 440px;
          pointer-events: auto;
          animation: slide-down-popup 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slide-down-popup {
          from { opacity: 0; transform: translate(-50%, -15px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .global-sync-popup-card {
          width: 100%;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1.5px solid rgba(59, 130, 246, 0.45);
          border-radius: var(--radius-lg, 16px);
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 20px rgba(59, 130, 246, 0.25);
          color: #ffffff;
          position: relative;
          transition: all 0.3s ease;
        }

        .global-sync-popup-card.sync-success-state {
          border-color: rgba(16, 185, 129, 0.6);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .sync-popup-icon-bubble {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sync-success-state .sync-popup-icon-bubble {
          background: rgba(16, 185, 129, 0.2);
        }

        .sync-popup-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .sync-popup-text h4 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 700;
          color: #ffffff;
        }

        .sync-popup-text p {
          margin: 0;
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.35;
        }

        .sync-popup-progress-track {
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 0.35rem;
        }

        .sync-popup-progress-bar {
          width: 45%;
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #38bdf8);
          border-radius: inherit;
          animation: sync-indeterminate 1.3s infinite ease-in-out;
        }

        @keyframes sync-indeterminate {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(300%); width: 30%; }
        }

        .btn-sync-dismiss {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          line-height: 1;
        }

        .btn-sync-dismiss:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }
      `})]})}(0,De.createRoot)(document.getElementById(`root`)).render((0,G.jsx)(W.StrictMode,{children:(0,G.jsx)(vn,{})}));export{Pe as _,Rt as a,dt as c,Tt as d,ut as f,ze as g,Ue as h,yt as i,rt as l,Qe as m,ft as n,rn as o,Ze as p,lt as r,zt as s,xt as t,vt as u,Me as v};