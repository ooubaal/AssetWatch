import{r as e}from"./rolldown-runtime-BHe-jwch.js";import{C as t,D as n,F as r,I as i,J as a,Lt as o,Q as s,S as c,T as l,U as u,at as d,bt as f,ct as ee,dt as te,f as p,ft as ne,gt as re,i as ie,m as ae,n as m,p as h,q as oe,r as se,st as ce,ut as g,w as le,x as _,xt as v,yt as ue}from"./vendor-icons-sJDFxYDo.js";import{i as y,n as de}from"./vendor-react-BoYKqcnW.js";import{_ as fe,l as b,n as x,p as S,r as pe,s as C,u as me,v as w,y as he}from"./index-BvplZdnX.js";var ge=y(),T=e(o(),1),E=de(),_e=({isOpen:e,onClose:t,onCapture:n,title:r=`ถ่ายภาพสภาพครุภัณฑ์`,subtitle:i=`ถ่ายภาพด่วนผ่านหน้าเว็บโดยตรง ไม่สลับแอป ป้องกันปัญหาแอปหลุดหรือหน่วยความจำไม่พอ`,idealWidth:a=1280,idealHeight:o=960})=>{let[s,c]=(0,T.useState)(null),[u,d]=(0,T.useState)([]),[f,ee]=(0,T.useState)(``),[te,p]=(0,T.useState)(!0),[re,ae]=(0,T.useState)(null),[h,oe]=(0,T.useState)(!1),[ce,g]=(0,T.useState)(!1),[_,y]=(0,T.useState)(null),[de,fe]=(0,T.useState)(null),[b,x]=(0,T.useState)(!1),S=(0,T.useRef)(null),pe=(0,T.useRef)(null),C=(0,T.useRef)(!0),me=(0,T.useCallback)(()=>{s&&(s.getTracks().forEach(e=>{try{e.stop()}catch{}}),c(null)),S.current&&(S.current.srcObject=null)},[s]),w=(0,T.useCallback)(()=>{_&&(URL.revokeObjectURL(_),y(null)),fe(null)},[_]),ge=e=>{if(e.target.files&&e.target.files[0]){let r=e.target.files[0];n(r),t()}},_e=(0,T.useCallback)(async e=>{p(!0),ae(null),oe(!1);try{if(s&&(s.getTracks().forEach(e=>{try{e.stop()}catch{}}),c(null)),await he(),document.querySelectorAll(`video`).forEach(e=>{if(e!==S.current&&e.srcObject)try{e.srcObject.getTracks().forEach(e=>{try{e.stop()}catch{}}),e.srcObject=null}catch{}}),await new Promise(e=>setTimeout(e,280)),!C.current)return;try{navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices&&d((await navigator.mediaDevices.enumerateDevices()).filter(e=>e.kind===`videoinput`))}catch{}let t=null,n=null,r={audio:!1,video:e?{deviceId:{exact:e},width:{ideal:a},height:{ideal:o}}:{facingMode:{ideal:`environment`},width:{ideal:a},height:{ideal:o}}};try{t=await navigator.mediaDevices.getUserMedia(r)}catch(e){if(n=e,console.warn(`InAppCamera: Tier 1 constraints failed, attempting fallback...`,e),await new Promise(e=>setTimeout(e,350)),!C.current)return;try{t=await navigator.mediaDevices.getUserMedia({audio:!1,video:{facingMode:`environment`}})}catch(e){if(n=e,console.warn(`InAppCamera: Tier 2 constraints failed, attempting generic video...`,e),await new Promise(e=>setTimeout(e,300)),!C.current)return;try{t=await navigator.mediaDevices.getUserMedia({audio:!1,video:!0})}catch(e){n=e}}}if(!t)throw n||Error(`Could not start video stream`);if(!C.current){t.getTracks().forEach(e=>e.stop());return}c(t);let i=t.getVideoTracks()[0];i&&g(!!(i.getCapabilities?i.getCapabilities():{}).torch),S.current&&(S.current.srcObject=t,await S.current.play().catch(()=>{}))}catch(e){console.error(`In-app camera startup failed:`,e),C.current&&ae(`ไม่สามารถเปิดกล้องได้: `+(e.name===`NotAllowedError`?`ไม่ได้รับอนุญาตการเข้าถึงกล้อง`:e.message||`โปรดตรวจสอบการอนุญาตกล้อง`))}finally{C.current&&p(!1)}},[a,o,s]);return(0,T.useEffect)(()=>(C.current=!0,e?(w(),_e(f||void 0)):(me(),w()),()=>{C.current=!1,me(),w()}),[e]),e?(0,E.jsxs)(`div`,{className:`inapp-camera-modal-overlay`,children:[(0,E.jsxs)(`div`,{className:`inapp-camera-modal-container glass-panel`,children:[(0,E.jsxs)(`div`,{className:`inapp-camera-header`,children:[(0,E.jsxs)(`div`,{className:`inapp-camera-title-group`,children:[(0,E.jsxs)(`div`,{className:`inapp-camera-title`,children:[(0,E.jsx)(v,{size:18,color:`var(--primary)`}),(0,E.jsx)(`h3`,{children:r})]}),(0,E.jsx)(`p`,{className:`inapp-camera-subtitle`,children:i})]}),(0,E.jsx)(`button`,{type:`button`,className:`btn-close-modal`,onClick:t,title:`ปิดหน้าต่างกล้อง`,children:(0,E.jsx)(ie,{size:20})})]}),(0,E.jsx)(`div`,{className:`inapp-camera-body`,children:re?(0,E.jsxs)(`div`,{className:`inapp-camera-error`,style:{textAlign:`center`,padding:`1.5rem`,display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`0.75rem`},children:[(0,E.jsx)(ne,{size:44,color:`var(--danger)`}),(0,E.jsx)(`p`,{style:{fontSize:`0.875rem`,color:`var(--text-primary)`,maxWidth:`280px`,lineHeight:1.4,margin:0},children:re}),(0,E.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.5rem`,width:`100%`,maxWidth:`280px`,marginTop:`0.5rem`},children:[(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-primary`,onClick:()=>_e(f||void 0),style:{display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`0.4rem`,width:`100%`,padding:`0.6rem`,fontSize:`0.85rem`},children:[(0,E.jsx)(l,{size:15}),` ลองเปิดกล้องอีกครั้ง`]}),(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:()=>pe.current?.click(),style:{display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`0.4rem`,width:`100%`,padding:`0.6rem`,fontSize:`0.85rem`,borderColor:`var(--primary)`,color:`var(--primary)`,background:`rgba(59, 130, 246, 0.08)`,fontWeight:650},children:[(0,E.jsx)(v,{size:15}),` 📸 ถ่ายด้วยกล้องมาตรฐานของเครื่อง`]})]})]}):_?(0,E.jsxs)(`div`,{className:`inapp-camera-preview-box`,children:[(0,E.jsx)(`img`,{src:_,alt:`Captured snapshot preview`}),(0,E.jsxs)(`div`,{className:`preview-indicator-badge`,children:[(0,E.jsx)(ue,{size:14}),` ถ่ายภาพแล้ว กรุณาตรวจสอบความชัดเจน`]})]}):(0,E.jsxs)(`div`,{className:`inapp-camera-viewport`,children:[(0,E.jsx)(`video`,{ref:S,playsInline:!0,autoPlay:!0,muted:!0,className:`inapp-camera-video`}),(0,E.jsxs)(`div`,{className:`inapp-camera-reticle`,children:[(0,E.jsx)(`div`,{className:`inapp-reticle-corner tl`}),(0,E.jsx)(`div`,{className:`inapp-reticle-corner tr`}),(0,E.jsx)(`div`,{className:`inapp-reticle-corner bl`}),(0,E.jsx)(`div`,{className:`inapp-reticle-corner br`})]}),(0,E.jsxs)(`div`,{className:`inapp-camera-top-controls`,children:[ce&&(0,E.jsx)(`button`,{type:`button`,className:`btn-camera-util ${h?`active`:``}`,onClick:async()=>{if(!s)return;let e=s.getVideoTracks()[0];if(e)try{let t=!h;await e.applyConstraints({advanced:[{torch:t}]}),oe(t)}catch(e){console.warn(`Could not toggle torch:`,e)}},title:h?`ปิดไฟฉาย`:`เปิดไฟฉายช่วยถ่าย`,children:h?(0,E.jsx)(m,{size:16,color:`#eab308`}):(0,E.jsx)(se,{size:16,color:`#ffffff`})}),u.length>1&&(0,E.jsx)(`button`,{type:`button`,className:`btn-camera-util`,onClick:()=>{if(u.length<=1)return;let e=u[(u.findIndex(e=>e.deviceId===f)+1)%u.length];ee(e.deviceId),_e(e.deviceId)},title:`สลับกล้อง`,children:(0,E.jsx)(le,{size:16})})]}),te&&(0,E.jsxs)(`div`,{className:`inapp-camera-loading`,children:[(0,E.jsx)(`div`,{className:`spinner`}),(0,E.jsx)(`span`,{children:`กำลังเชื่อมต่อกล้องถ่ายรูป...`})]})]})}),(0,E.jsx)(`input`,{ref:pe,type:`file`,accept:`image/*`,capture:`environment`,style:{display:`none`},onChange:ge}),(0,E.jsx)(`div`,{className:`inapp-camera-footer`,children:_?(0,E.jsxs)(`div`,{className:`inapp-confirm-actions`,children:[(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-secondary inapp-btn-retake`,onClick:()=>{w()},children:[(0,E.jsx)(le,{size:16}),` ถ่ายใหม่`]}),(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-primary inapp-btn-confirm`,onClick:()=>{de&&(n(de),t())},children:[(0,E.jsx)(ue,{size:16}),` ใช้ภาพนี้`]})]}):(0,E.jsxs)(`div`,{className:`inapp-shutter-row`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,position:`relative`,width:`100%`},children:[(0,E.jsx)(`button`,{type:`button`,className:`inapp-shutter-btn`,onClick:()=>{if(!S.current||b)return;x(!0);try{typeof navigator<`u`&&navigator.vibrate&&navigator.vibrate(40)}catch{}let e=S.current,t=e.videoWidth||1280,n=e.videoHeight||960,r=t,i=n,a=1280;r>i&&r>a?(i=Math.round(i*a/r),r=a):i>a&&(r=Math.round(r*a/i),i=a);let o=document.createElement(`canvas`);o.width=r,o.height=i;let s=o.getContext(`2d`);if(!s){x(!1);return}s.drawImage(e,0,0,r,i),o.toBlob(e=>{if(o.width=0,o.height=0,e){let t=Date.now(),n=new File([e],`survey_snap_${t}.jpg`,{type:`image/jpeg`,lastModified:t});y(URL.createObjectURL(e)),fe(n)}x(!1)},`image/jpeg`,.78)},disabled:te||!!re,title:`กดถ่ายรูป`,children:(0,E.jsx)(`div`,{className:`shutter-inner-dot`})}),(0,E.jsxs)(`button`,{type:`button`,className:`btn-camera-util`,onClick:()=>pe.current?.click(),title:`สลับไปใช้กล้องมาตรฐานของมือถือ (Native Camera)`,style:{position:`absolute`,right:`1rem`,display:`flex`,alignItems:`center`,gap:`0.3rem`,fontSize:`0.72rem`,padding:`0.4rem 0.65rem`,background:`rgba(255, 255, 255, 0.15)`,border:`1px solid rgba(255, 255, 255, 0.3)`,borderRadius:`20px`,color:`#ffffff`,cursor:`pointer`},children:[(0,E.jsx)(v,{size:13}),` กล้องระบบ`]})]})})]}),(0,E.jsx)(`style`,{children:`
        .inapp-camera-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: inapp-fade 0.2s ease-out;
        }

        @keyframes inapp-fade {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .inapp-camera-modal-container {
          width: 100%;
          max-width: 520px;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-lg, 16px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }

        .inapp-camera-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 0.9rem 1.1rem;
          background: rgba(15, 23, 42, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .inapp-camera-title-group {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .inapp-camera-title {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .inapp-camera-title h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
        }

        .inapp-camera-subtitle {
          margin: 0;
          font-size: 0.73rem;
          color: rgba(255, 255, 255, 0.65);
        }

        .btn-close-modal {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: rgba(255, 255, 255, 0.8);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.15s;
        }

        .btn-close-modal:hover {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .inapp-camera-body {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #000000;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inapp-camera-viewport {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inapp-camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .inapp-camera-preview-box {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inapp-camera-preview-box img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .preview-indicator-badge {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(16, 185, 129, 0.9);
          backdrop-filter: blur(4px);
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }

        .inapp-camera-reticle {
          position: absolute;
          inset: 12%;
          border: 1px dashed rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          pointer-events: none;
        }

        .inapp-reticle-corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border-color: var(--primary, #3b82f6);
          border-style: solid;
        }

        .inapp-reticle-corner.tl { top: -2px; left: -2px; border-width: 3px 0 0 3px; border-top-left-radius: 6px; }
        .inapp-reticle-corner.tr { top: -2px; right: -2px; border-width: 3px 3px 0 0; border-top-right-radius: 6px; }
        .inapp-reticle-corner.bl { bottom: -2px; left: -2px; border-width: 0 0 3px 3px; border-bottom-left-radius: 6px; }
        .inapp-reticle-corner.br { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; border-bottom-right-radius: 6px; }

        .inapp-camera-top-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 6px;
          z-index: 10;
        }

        .btn-camera-util {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #ffffff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-camera-util:hover {
          background: rgba(30, 41, 59, 0.95);
          transform: scale(1.05);
        }

        .btn-camera-util.active {
          background: rgba(234, 179, 8, 0.3);
          border-color: #eab308;
        }

        .inapp-camera-loading,
        .inapp-camera-error {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #ffffff;
          padding: 1.5rem;
          text-align: center;
          font-size: 0.85rem;
          background: rgba(15, 23, 42, 0.9);
        }

        .inapp-camera-footer {
          padding: 1rem;
          background: rgba(15, 23, 42, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inapp-shutter-row {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .inapp-shutter-btn {
          width: 66px;
          height: 66px;
          border-radius: 50%;
          background: #ffffff;
          border: 4px solid rgba(59, 130, 246, 0.5);
          padding: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.1s, border-color 0.2s;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        .inapp-shutter-btn:active {
          transform: scale(0.92);
        }

        .shutter-inner-dot {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #0f172a;
          transition: background-color 0.15s;
        }

        .inapp-shutter-btn:hover .shutter-inner-dot {
          background: #38bdf8;
        }

        .inapp-confirm-actions {
          display: flex;
          gap: 0.75rem;
          width: 100%;
        }

        .inapp-btn-retake {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.65rem;
        }

        .inapp-btn-confirm {
          flex: 1.5;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.65rem;
        }
      `})]}):null},ve=({assets:e,surveys:o,rounds:ne,activeRound:m,onAddSurvey:se,onUpdateAssetStatus:ue,onLogAudit:y,onRedirectToAdd:de,onCreateSurveyRound:he,onCloseActiveRound:ve,onDepartmentSignoff:ye,onReopenSurveyRound:be,currentUser:D,onRefreshDevice:xe,isRefreshing:O=!1})=>{let[k,Se]=(0,T.useState)(()=>localStorage.getItem(`assetwatch_operator`)||`ผู้ตรวจการทั่วไป`);(0,T.useEffect)(()=>{D&&Se(D.name)},[D]);let[A,Ce]=(0,T.useState)(()=>localStorage.getItem(`assetwatch_selected_dept`)||`all`),[we,Te]=(0,T.useState)(`pending`),Ee=`assetwatch_survey_active_draft_v2`,De=()=>{try{let e=localStorage.getItem(Ee);if(e){let t=JSON.parse(e);if(t&&t.assetId&&Date.now()-(t.savedAt||0)<3*3600*1e3)return t}let t=sessionStorage.getItem(`assetwatch_draft_survey_id`);if(t)return{assetId:t}}catch{return null}return null},j=(0,T.useMemo)(()=>De(),[]),[M,Oe]=(0,T.useState)(()=>j?.assetId||null),[N,P]=(0,T.useState)(null);(0,T.useMemo)(()=>N?N.imageUrl&&!b(N.imageUrl)||N.hasImage?!0:o.some(e=>e.assetId===N.id&&e.imageUrl&&e.imageUrl.trim()&&!b(e.imageUrl)):!1,[N,o]);let[F,ke]=(0,T.useState)(null),[Ae,I]=(0,T.useState)(null),[je,L]=(0,T.useState)(null),[Me,Ne]=(0,T.useState)(!1),Pe=async e=>{ke(e),Ne(!0),I(null),L(null);try{let t=o.filter(t=>t.assetId===e.id&&t.imageUrl&&t.imageUrl.trim()&&!b(t.imageUrl)).sort((e,t)=>new Date(t.timestamp).getTime()-new Date(e.timestamp).getTime());if(t.length>0&&t[0].imageUrl){I(t[0].imageUrl),L(`survey`),Ne(!1);return}if(e.imageUrl&&!b(e.imageUrl)){I(e.imageUrl),L(`asset`),Ne(!1);return}let n=await C(e.id);n&&n.imageUrl?(I(n.imageUrl),L(n.source)):(I(null),L(null))}catch(e){console.warn(`Failed to load asset image on demand:`,e),I(null)}finally{Ne(!1)}},[R,Fe]=(0,T.useState)(()=>j?.selectedStatus||`ใช้งานได้`),[z,B]=(0,T.useState)(()=>j?.selectedLocation||``),[V,H]=(0,T.useState)(()=>j?.customLocation||``),[U,W]=(0,T.useState)(()=>j?.note||``),[Ie,Le]=(0,T.useState)(!1),[Re,G]=(0,T.useState)(null),[K,q]=(0,T.useState)(null),[ze,Be]=(0,T.useState)(!1),[J,Y]=(0,T.useState)(!1),[Ve,He]=(0,T.useState)(()=>!j?.assetId),[Ue,We]=(0,T.useState)(()=>!!j?.assetId),[Ge,Ke]=(0,T.useState)(!1),[qe,Je]=(0,T.useState)(``),[Ye,Xe]=(0,T.useState)(!1),[Ze,Qe]=(0,T.useState)(k),[X,$e]=(0,T.useState)(null),[et,tt]=(0,T.useState)(`active`),[Z,nt]=(0,T.useState)(`all`),[rt,it]=(0,T.useState)(!1);(0,T.useEffect)(()=>{D&&(D.role===`user`||D.role===`operator`||D.role===`head`?(Ce(D.department),nt(D.department)):Ce(localStorage.getItem(`assetwatch_selected_dept`)||`all`))},[D]);let[at,ot]=(0,T.useState)(``),[Q,st]=(0,T.useState)(`all`),[ct,lt]=(0,T.useState)(`latest`);(0,T.useEffect)(()=>{ot(``),st(`all`)},[A]);let ut=Array.from(new Set(e.map(e=>e.department).filter(Boolean))),dt=e=>{let t=e.target.value;Ce(t),localStorage.setItem(`assetwatch_selected_dept`,t)},ft=e=>{let t=e.target.value;Se(t),localStorage.setItem(`assetwatch_operator`,t)},pt=e=>m?o.some(t=>t.assetId===e&&(!t.roundId||t.roundId===m.id||m.id===`round-default`&&(!t.roundId||t.roundId===`round-default`))):!1,$=(0,T.useMemo)(()=>e.filter(e=>A===`all`?!0:e.department===A),[e,A]),mt=(0,T.useMemo)(()=>{let e=$.map(e=>e.location).filter(Boolean);return Array.from(new Set(e)).sort()},[$]),ht=(0,T.useMemo)(()=>[{value:`all`,label:`ทุกห้อง/สถานที่`},...mt.map(e=>({value:e,label:`📍 ${e}`}))],[mt]),gt=(0,T.useMemo)(()=>{let e=new Map;if(!m)return e;for(let t of o)if((t.roundId||`round-default`)===m.id||m.id===`round-default`&&(!t.roundId||t.roundId===`round-default`)){let n=new Date(t.timestamp).getTime();n>(e.get(t.assetId)||0)&&e.set(t.assetId,n)}return e},[o,m]),_t=e=>m?o.find(t=>t.assetId===e&&(!t.roundId||t.roundId===m.id||m.id===`round-default`&&(!t.roundId||t.roundId===`round-default`))):null,vt=(0,T.useMemo)(()=>{let e=[...$];if(at.trim()){let t=at.toLowerCase().trim();e=e.filter(e=>(e.name||``).toLowerCase().includes(t)||(e.id||``).toLowerCase().includes(t)||e.location&&e.location.toLowerCase().includes(t)||e.note&&e.note.toLowerCase().includes(t))}return Q!==`all`&&(e=e.filter(e=>e.location===Q)),e.sort((e,t)=>{if(ct===`latest`){let n=gt.get(e.id)||0,r=gt.get(t.id)||0;if(r!==n)return r-n;let i=new Date(e.updatedAt||0).getTime(),a=new Date(t.updatedAt||0).getTime();return a===i?e.id.localeCompare(t.id,`th`):a-i}if(ct===`location`){let n=e.location||``,r=t.location||``;return n.localeCompare(r,`th`)}return ct===`name`?e.name.localeCompare(t.name,`th`):e.id.localeCompare(t.id,`th`)}),e},[$,at,Q,ct,gt]),yt=(0,T.useMemo)(()=>vt.filter(e=>!pt(e.id)),[vt,o,m]),bt=(0,T.useMemo)(()=>vt.filter(e=>pt(e.id)),[vt,o,m]),xt=$.length,St=(0,T.useMemo)(()=>$.filter(e=>pt(e.id)).length,[$,o,m]),Ct=xt>0?Math.round(St/xt*100):0,wt=async t=>{let n=(t||``).trim();if(!n)return;if(n.includes(`apiKey`)&&n.includes(`projectId`)&&n.includes(`{`)){try{let e=JSON.parse(n);if(e&&e.apiKey&&e.projectId&&window.confirm(`⚠️ พบ QR Code เชื่อมต่อระบบคลาวด์ร่วม (Cloud Database Configuration)

ต้องการตั้งค่าและเชื่อมต่ออุปกรณ์เครื่องนี้เข้ากับฐานข้อมูลคลาวด์ส่วนกลางเดียวกับเครื่องหลักหรือไม่?`)){localStorage.setItem(`assetwatch_firebase_config`,JSON.stringify(e)),localStorage.setItem(`assetwatch_db_mode`,`firebase`),localStorage.setItem(`assetwatch_force_base64_images`,`true`),alert(`เชื่อมต่อระบบคลาวด์สำเร็จ! ระบบจะทำการรีโหลดแอปพลิเคชันเพื่อซิงค์ข้อมูลใหม่...`),window.location.reload();return}}catch(e){console.error(`Failed to parse QR config:`,e)}He(!0),Oe(null);return}let r=e.find(e=>(e.id||``).toLowerCase()===n.toLowerCase());He(!1),Oe(n);let i=r?x(r.note||``):``;Tt(n,r?r.status:`ใช้งานได้`,r&&r.location||``,``,i),r?(P(r),Fe(r.status),B(r.location||``),H(``),W(i),Y(!1)):(P(null),B(``),H(``),W(``),Y(!1))},Tt=(e,t,n,r,i)=>{try{localStorage.setItem(Ee,JSON.stringify({assetId:e,selectedStatus:t===void 0?R:t,selectedLocation:n===void 0?z:n,customLocation:r===void 0?V:r,note:i===void 0?U:i,savedAt:Date.now()})),sessionStorage.setItem(`assetwatch_draft_survey_id`,e)}catch{}},Et=()=>{try{localStorage.removeItem(Ee),sessionStorage.removeItem(`assetwatch_draft_survey_id`)}catch{}We(!1)};(0,T.useEffect)(()=>{M&&Tt(M,R,z,V,U)},[M,R,z,V,U]),(0,T.useEffect)(()=>{if(M&&!N&&e.length>0){let t=e.find(e=>(e.id||``).toLowerCase()===(M||``).toLowerCase());t&&(P(t),j?.selectedStatus||Fe(t.status),j?.selectedLocation||B(t.location||``),j?.note===void 0&&W(x(t.note||``)))}},[M,N,e,j]);let Dt=e=>{He(!1),Oe(e.id);let t=x(e.note||``);Tt(e.id,e.status,e.location||``,``,t),P(e),Fe(e.status),B(e.location||``),H(``),W(t),Y(!1)},Ot=async()=>{if(!N)return;let e=x(U.trim());Le(!0);try{await ue(N.id,R,{note:e}),P(t=>t?{...t,note:e}:null),Tt(N.id,R,z,V,e),await y({assetId:N.id,assetName:N.name,action:`edit`,operator:k||`ผู้ตรวจการทั่วไป`,details:`บันทึกข้อมูลโน้ต/ชื่อเล่นเครื่องมือ: "${e||`-`}"`}),alert(`บันทึกโน้ต/ชื่อเล่นเรียบร้อยแล้ว`)}catch(e){console.error(`Failed to quick save note:`,e),alert(`เกิดข้อผิดพลาดในการบันทึกโน้ต: `+(e?.message||`กรุณาลองใหม่อีกครั้ง`))}finally{Le(!1)}},kt=(0,T.useRef)(null),At=(0,T.useRef)(null),jt=async e=>{if(e.target.files&&e.target.files[0]){let t=e.target.files[0];try{let e=await pe(t,800,800,.65);G(e),K&&K.startsWith(`blob:`)&&URL.revokeObjectURL(K),q(URL.createObjectURL(e))}catch(e){console.warn(`Compression failed, using raw file:`,e),G(t),K&&K.startsWith(`blob:`)&&URL.revokeObjectURL(K),q(URL.createObjectURL(t))}e.target.value=``}},Mt=e=>{e&&e.stopPropagation(),K&&K.startsWith(`blob:`)&&URL.revokeObjectURL(K),G(null),q(null),kt.current&&(kt.current.value=``),At.current&&(At.current.value=``)},Nt=async e=>{if(e.preventDefault(),D?.role===`manager`){alert(`ผู้บริหาร (Manager) มีสิทธิ์เฉพาะการดูข้อมูลและรายงาน ไม่สามารถบันทึกผลการสำรวจได้`);return}if(M){Be(!0);try{let e=``;if(Re)try{e=await S(Re,`surveys`)}catch(e){console.warn(`Image upload/compression warning, continuing survey submission:`,e)}let t=z===`custom`?V.trim():z,n=x(U.trim());await se({assetId:M,status:R,imageUrl:e||void 0,operator:k||`ผู้ตรวจการทั่วไป`,timestamp:new Date().toISOString(),roundId:m?.id||`round-default`,note:n||void 0});let r=N&&N.status!==R,i=N&&N.location!==t,a=N?x(N.note||``):``,o=N&&a!==n,s=!!e;if(N&&(r||i||o||s)){await ue(M,R,{location:t,note:n,...s?{imageUrl:e}:{}});let a=`สแกนสำรวจตรวจนับ`;s&&(a+=` พร้อมอัปเดตภาพถ่ายสภาพครุภัณฑ์ล่าสุด`),o&&(a+=` และบันทึกโน้ต/ชื่อเล่น: "${n||`-`}"`),r&&i?a+=` และอัปเดตเปลี่ยนสถานะพัสดุ จาก "${N.status}" เป็น "${R}" พร้อมย้ายห้องที่ตั้ง จาก "${N.location||`-`}" เป็น "${t}"`:r?a+=` และอัปเดตเปลี่ยนสถานะพัสดุ จาก "${N.status}" เป็น "${R}"`:i&&(a+=` และย้ายห้องจัดเก็บพัสดุ จาก "${N.location||`-`}" เป็น "${t}"`),await y({assetId:M,assetName:N.name,action:`survey`,operator:k,details:a})}else N?await y({assetId:M,assetName:N.name,action:`survey`,operator:k,details:`สแกนสำรวจตรวจนับแล้ว สภาพยังคง "${R}" ตั้งอยู่ที่ "${t}" ตามปกติ`}):await y({assetId:M,assetName:`ครุภัณฑ์ไม่ได้ลงทะเบียน`,action:`survey`,operator:k,details:`สแกนพบและตรวจนับรหัสที่ยังไม่เคยมีในคลังระบบ: "${M}"`});Y(!0),K&&K.startsWith(`blob:`)&&URL.revokeObjectURL(K),G(null),q(null),Et()}catch(e){if(console.error(`Survey submit error:`,e),me(e))return;alert(`เกิดข้อผิดพลาดในการบันทึกผลการสำรวจ: `+(e?.message||`กรุณาลองใหม่อีกครั้ง`))}finally{Be(!1)}}},Pt=()=>{K&&K.startsWith(`blob:`)&&URL.revokeObjectURL(K),Oe(null),P(null),G(null),q(null),B(``),H(``),W(``),Y(!1),He(!0),Et()},Ft=t=>{if(!t)return;let n=e.filter(e=>Z===`all`||e.department===Z);if(n.length===0){alert(`ไม่พบรายการครุภัณฑ์สำหรับส่งออกรายงาน`);return}let r=[`ลำดับ`,`รหัสครุภัณฑ์`,`ชื่อรายการครุภัณฑ์`,`หน่วยงาน/ฝ่าย`,`ห้อง/สถานที่จัดเก็บตามระบบ`,`สถานะการตรวจนับในรอบนี้`,`สภาพครุภัณฑ์ที่ยืนยัน`,`วันที่-เวลาที่สแกนตรวจนับ`,`ผู้ตรวจสอบนับ`,`มีรูปภาพแนบ`,`ลิงก์รูปภาพสภาพครุภัณฑ์`,`ชื่องานรอบการสำรวจ`],i=e=>e==null?`""`:`"${String(e).replace(/"/g,`""`)}"`,a=n.map((e,n)=>{let r=o.find(n=>n.roundId===t.id&&n.assetId===e.id),a=!!r,s=a?`สำรวจแล้ว`:`ค้างสำรวจ (ยังไม่ได้ตรวจนับ)`,c=a&&r?.status||e.status,l=r?new Date(r.timestamp).toLocaleString(`th-TH`):`-`,u=r?.operator||(a?t.operator:`-`),d=r?.imageUrl?`มีรูปภาพ`:e.imageUrl?`มีรูปภาพเดิม`:`ไม่มี`,f=r?.imageUrl||e.imageUrl||`-`;return[n+1,i(e.id),i(e.name),i(e.department),i(e.location||`-`),i(s),i(c),i(l),i(u),i(d),i(f),i(t.name)].join(`,`)}),s=`﻿`+[r.map(i).join(`,`),...a].join(`\r
`),c=new Blob([s],{type:`text/csv;charset=utf-8;`}),l=URL.createObjectURL(c),u=document.createElement(`a`);u.href=l;let d=Z===`all`?`_ทุกฝ่าย`:`_${Z}`,f=t.name.replace(/[/\\?%*:|"<>]/g,`_`),ee=new Date().toISOString().slice(0,10);u.setAttribute(`download`,`รายงานผลสำรวจครุภัณฑ์_${f}${d}_${ee}.csv`),document.body.appendChild(u),u.click(),document.body.removeChild(u),URL.revokeObjectURL(l)},It={ใช้งานได้:`badge-success`,ชำรุด:`badge-danger`,รอจำหน่าย:`badge-warning`,ขอป้ายรหัสใหม่:`badge-info`,รอโอน:`badge-primary`,อื่นๆ:`badge-muted`};return(0,E.jsxs)(`div`,{className:`module-container animate-fade-in`,children:[(0,E.jsxs)(`div`,{className:`module-title-section`,children:[(0,E.jsx)(`h2`,{children:`ระบบตรวจนับตามลิสต์และสแกนพัสดุรายหน่วยงาน (Module 2)`}),(0,E.jsx)(`p`,{children:`เลือกแผนงานเป้าหมาย คัดลอกและเปิดกล้องเดินสแกนเช็คเป้าหมายพัสดุค้างตรวจนับพร้อมแถบความก้าวหน้าเรียลไทม์`})]}),(0,E.jsxs)(`div`,{className:`survey-setup-bar glass-panel`,children:[(0,E.jsxs)(`div`,{className:`form-group flex-1`,style:{marginBottom:0},children:[(0,E.jsx)(`label`,{className:`form-label`,children:`✍️ ชื่อผู้ตรวจสอบนับครุภัณฑ์`}),(0,E.jsx)(`input`,{type:`text`,className:`form-input`,placeholder:`ป้อนชื่อผู้ตรวจนับ...`,value:k,onChange:ft})]}),(0,E.jsxs)(`div`,{className:`form-group flex-1`,style:{marginBottom:0},children:[(0,E.jsx)(`label`,{className:`form-label`,children:`🏢 เลือกแผนงาน / หน่วยงานที่ต้องการลงพื้นที่สำรวจ`}),(0,E.jsxs)(`select`,{className:`form-select select-survey-target`,value:A,onChange:dt,disabled:D?.role===`user`||D?.role===`operator`||D?.role===`head`,children:[!(D?.role===`user`||D?.role===`operator`||D?.role===`head`)&&(0,E.jsx)(`option`,{value:`all`,children:`ทุกหน่วยงาน (ครุภัณฑ์ทั้งหมดในคลัง)`}),D?.role===`user`||D?.role===`operator`||D?.role===`head`?(0,E.jsx)(`option`,{value:D.department,children:D.department}):ut.map(e=>(0,E.jsx)(`option`,{value:e,children:e},e))]})]})]}),(0,E.jsxs)(`div`,{className:`checklist-progress-panel glass-panel`,children:[(0,E.jsxs)(`div`,{className:`progress-meta-info`,children:[(0,E.jsxs)(`div`,{className:`progress-label-group`,children:[(0,E.jsx)(ce,{size:20,className:`text-blue`}),(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`h3`,{children:[`เป้าหมาย: `,A===`all`?`ทุกหน่วยงานรวมกัน`:A]}),O||e.length===0&&!J?(0,E.jsxs)(`p`,{className:`progress-sub`,style:{color:`var(--primary)`,display:`inline-flex`,alignItems:`center`,gap:`5px`},children:[(0,E.jsx)(t,{size:12,className:`animate-spin`}),` กำลังซิงค์ข้อมูลความก้าวหน้าล่าสุดจากคลาวด์...`]}):(0,E.jsxs)(`p`,{className:`progress-sub`,children:[`สำรวจพัสดุเสร็จแล้ว `,(0,E.jsx)(`strong`,{children:St}),` จากทั้งหมด `,(0,E.jsx)(`strong`,{children:xt}),` รายการ`]})]})]}),(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.75rem`},children:[xe&&(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-secondary btn-xs`,onClick:()=>xe(),disabled:O,title:`รีเฟรชและซิงค์ข้อมูลเครื่องนี้กับระบบกลาง`,style:{display:`inline-flex`,alignItems:`center`,gap:`0.35rem`,fontSize:`0.75rem`,padding:`0.35rem 0.65rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`,background:`var(--bg-secondary)`,color:`var(--primary)`,cursor:O?`wait`:`pointer`},children:[(0,E.jsx)(t,{size:13,className:O?`animate-spin`:``}),(0,E.jsx)(`span`,{children:O?`กำลังซิงค์...`:`🔄 ซิงค์เครื่องนี้`})]}),(0,E.jsx)(`div`,{className:`progress-percent-large`,style:{fontSize:O||e.length===0&&!J?`0.95rem`:`1.5rem`,minWidth:`48px`,textAlign:`right`},children:O||e.length===0&&!J?(0,E.jsxs)(`span`,{style:{color:`var(--primary)`,display:`inline-flex`,alignItems:`center`,gap:`3px`},children:[(0,E.jsx)(t,{size:12,className:`animate-spin`}),` ซิงค์...`]}):`${Ct}%`})]})]}),(0,E.jsx)(`div`,{className:`progress-bar-bg`,style:{height:`12px`,marginTop:`0.75rem`},children:(0,E.jsx)(`div`,{className:`progress-bar-fill fill-primary`,style:{width:O||e.length===0&&!J?`100%`:`${Ct}%`,height:`100%`,borderRadius:`inherit`,opacity:O||e.length===0&&!J?.6:1,transition:`width 0.4s ease`}})})]}),(0,E.jsxs)(`div`,{className:`survey-layout-grid`,children:[(0,E.jsx)(`div`,{className:`scanner-column`,children:!rt||Ge?(0,E.jsxs)(`div`,{className:`scan-placeholder glass-panel`,style:{display:`flex`,flexDirection:`column`,justifyContent:`center`,alignItems:`center`,gap:`0.85rem`},children:[(0,E.jsx)(v,{size:44,color:`var(--text-muted)`,style:{opacity:.6}}),(0,E.jsx)(`h3`,{children:Ge?`กำลังเปิดกล้องถ่ายภาพสภาพครุภัณฑ์`:`กล้องสแกนเนอร์ปิดทำงานอยู่`}),(0,E.jsx)(`p`,{style:{maxWidth:`280px`,fontSize:`0.75rem`,color:`var(--text-secondary)`,marginBottom:`0.5rem`,lineHeight:1.4},children:Ge?`ระบบพักกล้องสแกนบาร์โค้ดชั่วคราว เพื่อคืนสิทธิ์ฮาร์ดแวร์กล้องให้ระบบถ่ายภาพด่วน`:`สแตนด์บายกล้องปิดไว้ชั่วคราวเพื่อประหยัดแบตเตอรี่และความเป็นส่วนตัว คุณสามารถเปิดกล้องเมื่อพร้อมเดินสายสแกนบาร์โค้ดครุภัณฑ์`}),!Ge&&(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-primary animate-pulse`,onClick:()=>it(!0),style:{display:`flex`,alignItems:`center`,gap:`0.45rem`,fontSize:`0.8rem`},children:[(0,E.jsx)(v,{size:14}),` 📸 เปิดใช้งานกล้องตรวจนับ`]}),localStorage.getItem(`assetwatch_db_mode`)!==`firebase`&&(0,E.jsxs)(`div`,{style:{marginTop:`0.5rem`,padding:`0.65rem 0.85rem`,backgroundColor:`rgba(99, 102, 241, 0.06)`,border:`1px dashed var(--primary)`,borderRadius:`var(--radius-sm)`,fontSize:`0.7rem`,color:`var(--text-primary)`,maxWidth:`300px`,lineHeight:1.4,textAlign:`left`},children:[`💡 `,(0,E.jsx)(`strong`,{children:`ซิงค์ข้อมูลกับคอมพิวเตอร์หลัก:`}),` เปิดกล้องแล้วสแกน `,(0,E.jsx)(`strong`,{children:`QR Code ในหน้า "ตั้งค่า"`}),` ของคอมพิวเตอร์ เพื่อซิงค์รอบการสำรวจและการตรวจนับขึ้นคลาวด์โดยตรง!`]})]}):(0,E.jsxs)(`div`,{className:`scan-frame glass-panel`,style:{position:`relative`},children:[(0,E.jsx)(w,{onScanSuccess:wt,onCloseCamera:()=>it(!1),isPaused:!Ve}),!Ve&&(0,E.jsxs)(`div`,{className:`scan-standby-info animate-fade-in`,style:{marginTop:`0.75rem`,padding:`0.85rem`,background:`var(--bg-secondary)`,borderRadius:`var(--radius-md)`,border:`1px solid var(--border)`,textAlign:`center`},children:[(()=>{let e=N?pt(N.id):!1,t=N?_t(N.id):null;return e?(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(g,{size:36,color:`var(--success)`,className:`success-bounce`,style:{margin:`0 auto 0.25rem`}}),(0,E.jsx)(`h4`,{style:{color:`var(--success)`,fontSize:`0.9rem`,margin:`0.2rem 0`},children:`ครุภัณฑ์ถูกสำรวจเรียบร้อยแล้ว`}),(0,E.jsx)(`div`,{className:`scanned-code-pill`,style:{borderColor:`var(--success)`,background:`rgba(34, 197, 94, 0.1)`,display:`inline-block`,margin:`0.25rem auto`},children:(0,E.jsx)(`code`,{style:{color:`var(--success)`},children:M})}),t&&(0,E.jsxs)(`div`,{style:{fontSize:`0.725rem`,color:`var(--text-muted)`},children:[`✓ สำรวจแล้วเมื่อ `,new Date(t.timestamp).toLocaleTimeString(`th-TH`,{hour:`2-digit`,minute:`2-digit`}),` น.`]})]}):(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(p,{size:36,color:`var(--warning)`,className:`warning-shake`,style:{margin:`0 auto 0.25rem`}}),(0,E.jsx)(`h4`,{style:{color:`var(--warning)`,fontSize:`0.9rem`,margin:`0.2rem 0`},children:`ตรวจพบรหัสพัสดุ`}),(0,E.jsx)(`div`,{className:`scanned-code-pill`,style:{borderColor:`var(--warning)`,background:`rgba(234, 179, 8, 0.1)`,display:`inline-block`,margin:`0.25rem auto`},children:(0,E.jsx)(`code`,{style:{color:`var(--warning)`},children:M})}),(0,E.jsx)(`div`,{style:{fontSize:`0.725rem`,color:`var(--text-secondary)`},children:`กรุณายืนยันสถานะในฟอร์มด้านขวาเพื่อบันทึก`})]})})(),N&&A!==`all`&&N.department!==A&&(0,E.jsxs)(`div`,{className:`alert alert-danger`,style:{padding:`0.5rem 0.75rem`,fontSize:`0.75rem`,margin:`0.5rem 0`},children:[(0,E.jsx)(p,{size:14}),(0,E.jsxs)(`span`,{children:[(0,E.jsx)(`strong`,{children:`คำเตือน:`}),` อยู่แผนก "`,N.department,`" ไม่ตรงกับที่เลือก!`]})]}),(0,E.jsxs)(`button`,{className:`btn btn-secondary w-full`,onClick:Pt,style:{marginTop:`0.5rem`,fontSize:`0.775rem`},children:[(0,E.jsx)(l,{size:13}),` ข้าม / สแกนชิ้นถัดไป`]})]})]})}),(0,E.jsxs)(`div`,{className:`form-column`,children:[Ve&&!M&&(0,E.jsxs)(`div`,{className:`checklist-board-card glass-panel`,children:[(0,E.jsxs)(`div`,{className:`checklist-header-tabs`,children:[(0,E.jsxs)(`button`,{type:`button`,className:`checklist-tab-btn ${we===`pending`?`tab-active`:``}`,onClick:()=>Te(`pending`),children:[`🔴 ค้างตรวจนับ (`,yt.length,`)`]}),(0,E.jsxs)(`button`,{type:`button`,className:`checklist-tab-btn ${we===`completed`?`tab-active`:``}`,onClick:()=>Te(`completed`),children:[`🟢 ตรวจแล้ว (`,bt.length,`)`]})]}),(0,E.jsxs)(`div`,{className:`checklist-controls-row`,children:[(0,E.jsxs)(`div`,{className:`checklist-search-box`,children:[(0,E.jsx)(_,{size:13,color:`var(--text-muted)`,style:{position:`absolute`,left:`0.65rem`,top:`50%`,transform:`translateY(-50%)`}}),(0,E.jsx)(`input`,{type:`text`,className:`form-input`,style:{width:`100%`,padding:`0.35rem 0.5rem 0.35rem 1.7rem`,fontSize:`0.75rem`,borderRadius:`var(--radius-sm)`,background:`var(--bg-secondary)`,height:`32px`},placeholder:`ค้นหาชื่อ / รหัสครุภัณฑ์...`,value:at,onChange:e=>ot(e.target.value)})]}),(0,E.jsxs)(`div`,{className:`checklist-filter-group`,children:[(0,E.jsx)(`div`,{className:`checklist-filter-item`,style:{minWidth:`135px`},children:(0,E.jsx)(fe,{options:ht,value:Q,onChange:e=>st(e||`all`),placeholder:`ทุกห้อง/สถานที่`,compact:!0,allowCustom:!1,clearable:Q!==`all`,containerStyle:{width:`100%`},triggerStyle:{height:`32px`,padding:`0.2rem 0.5rem`,fontSize:`0.75rem`,background:`var(--bg-secondary)`,borderColor:Q===`all`?`var(--border)`:`var(--primary)`},dropdownWidth:`260px`})}),(0,E.jsx)(`div`,{className:`checklist-filter-item`,style:{minWidth:`115px`},children:(0,E.jsxs)(`select`,{className:`form-select`,style:{width:`100%`,padding:`0.35rem 0.5rem`,fontSize:`0.75rem`,borderRadius:`var(--radius-sm)`,background:`var(--bg-secondary)`,height:`32px`,cursor:`pointer`},value:ct,onChange:e=>lt(e.target.value),children:[(0,E.jsx)(`option`,{value:`latest`,children:`เรียง: ล่าสุด ⏱️`}),(0,E.jsx)(`option`,{value:`location`,children:`เรียง: ห้อง 📍`}),(0,E.jsx)(`option`,{value:`id`,children:`เรียง: รหัส 🔢`}),(0,E.jsx)(`option`,{value:`name`,children:`เรียง: ชื่อ 🔤`})]})})]})]}),(0,E.jsx)(`div`,{className:`checklist-items-scroll`,children:O||e.length===0&&!J?(0,E.jsxs)(`div`,{className:`empty-checklist-state`,children:[(0,E.jsx)(t,{size:36,className:`animate-spin text-primary`,style:{opacity:.8}}),(0,E.jsx)(`h4`,{style:{color:`var(--primary)`,marginTop:`0.5rem`},children:`กำลังเชื่อมต่อและซิงค์ข้อมูลล่าสุด...`}),(0,E.jsx)(`p`,{children:`ระบบกำลังดึงข้อมูลบัญชีครุภัณฑ์และผลการสำรวจจากคลาวด์ โปรดรอสักครู่`})]}):we===`pending`?yt.length===0?(0,E.jsxs)(`div`,{className:`empty-checklist-state`,children:[(0,E.jsx)(g,{size:36,color:`var(--success)`}),(0,E.jsx)(`h4`,{children:`สแกนเสร็จสิ้นครบ 100% แล้ว!`}),(0,E.jsx)(`p`,{children:`ครุภัณฑ์ทั้งหมดของหน่วยงานนี้ได้รับการยืนยันประวัติเรียบร้อยแล้วในรอบนี้`})]}):yt.map(e=>(0,E.jsxs)(`div`,{className:`checklist-item-row animate-fade-in`,style:{padding:`0.5rem 0.75rem`},children:[(0,E.jsxs)(`div`,{className:`item-meta`,style:{maxWidth:`70%`},children:[(0,E.jsx)(`code`,{className:`item-code`,style:{fontSize:`0.65rem`},children:e.id}),(0,E.jsx)(`h4`,{className:`item-title`,style:{fontSize:`0.8rem`,margin:`0.1rem 0`},children:e.name}),(0,E.jsxs)(`span`,{className:`item-loc`,style:{fontSize:`0.675rem`},children:[`📍 `,e.location]}),x(e.note)&&(0,E.jsxs)(`span`,{style:{fontSize:`0.675rem`,color:`var(--primary)`,fontWeight:600,display:`inline-flex`,alignItems:`center`,gap:`0.2rem`,marginTop:`0.1rem`},children:[`📝 `,x(e.note)]})]}),(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-secondary btn-xs btn-quick-survey`,onClick:()=>Dt(e),title:`กดเพื่อตรวจนับพัสดุชิ้นนี้ทันทีโดยไม่ต้องสแกนบาร์โค้ด`,style:{fontSize:`0.65rem`,padding:`0.2rem 0.4rem`},children:[`ตรวจนับด้วยมือ `,(0,E.jsx)(re,{size:12})]})]},e.id)):bt.length===0?(0,E.jsxs)(`div`,{className:`empty-checklist-state`,children:[(0,E.jsx)(d,{size:36,color:`var(--text-muted)`}),(0,E.jsx)(`h4`,{children:`ยังไม่มีการตรวจนับครุภัณฑ์`}),(0,E.jsx)(`p`,{children:`สแกนป้ายบาร์โค้ด หรือกดสแกนด้วยมือข้างลิสต์เพื่อทำรายการตรวจรับชิ้นแรก`})]}):bt.map(e=>{let t=_t(e.id),n=t?new Date(t.timestamp).toLocaleString(`th-TH`,{day:`numeric`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`})+` น.`:``;return(0,E.jsxs)(`div`,{className:`checklist-item-row item-row-completed animate-fade-in`,style:{padding:`0.5rem 0.75rem`},children:[(0,E.jsxs)(`div`,{className:`item-meta`,style:{maxWidth:`70%`},children:[(0,E.jsx)(`code`,{className:`item-code`,style:{fontSize:`0.65rem`},children:e.id}),(0,E.jsx)(`h4`,{className:`item-title`,style:{textDecoration:`line-through`,color:`var(--text-muted)`,fontSize:`0.8rem`,margin:`0.1rem 0`},children:e.name}),(0,E.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.1rem`},children:[(0,E.jsxs)(`span`,{className:`item-loc`,style:{color:`var(--text-muted)`,fontSize:`0.675rem`},children:[`📍 `,e.location]}),x(e.note)&&(0,E.jsxs)(`span`,{style:{fontSize:`0.65rem`,color:`var(--primary)`,fontWeight:600,display:`inline-flex`,alignItems:`center`,gap:`0.2rem`},children:[`📝 `,x(e.note)]}),n&&(0,E.jsxs)(`span`,{style:{color:`var(--success)`,fontSize:`0.625rem`,fontWeight:600},children:[`⏱️ สแกนเมื่อ: `,n]})]})]}),(0,E.jsxs)(`span`,{className:`badge badge-success check-mark-completed`,style:{fontSize:`0.65rem`,padding:`0.2rem 0.4rem`},children:[`✓ เช็คแล้ว (`,e.status,`)`]})]},e.id)})})]}),M&&!N&&!J&&(0,E.jsxs)(`div`,{className:`survey-unregistered-card glass-panel`,children:[(0,E.jsx)(p,{size:48,color:`var(--warning)`,className:`warning-shake`}),(0,E.jsx)(`h3`,{children:`ไม่พบข้อมูลครุภัณฑ์รหัสนี้ในระบบ!`}),(0,E.jsxs)(`div`,{className:`scanned-code-pill pill-warning`,children:[`รหัส: `,(0,E.jsx)(`code`,{children:M})]}),(0,E.jsx)(`p`,{className:`card-desc-warn`,children:`รหัสที่คุณแสกนพบยังไม่เคยได้รับการขึ้นทะเบียนพัสดุในฐานข้อมูล AssetWatch มาก่อน`}),(0,E.jsxs)(`div`,{className:`warning-actions`,children:[(0,E.jsx)(`button`,{className:`btn btn-secondary`,onClick:Pt,children:`สแกนรหัสอื่น`}),(0,E.jsx)(`button`,{className:`btn btn-warning`,onClick:()=>de(M),children:`ขึ้นทะเบียนครุภัณฑ์รหัสนี้ใหม่ (Module 3)`})]})]}),M&&N&&!J&&(0,E.jsxs)(`form`,{onSubmit:Nt,className:`survey-form-panel glass-panel`,children:[Ue&&(0,E.jsxs)(`div`,{className:`survey-draft-restored-banner animate-fade-in`,children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.45rem`,flex:1},children:[(0,E.jsx)(`span`,{style:{fontSize:`1rem`},children:`🛡️`}),(0,E.jsxs)(`span`,{children:[(0,E.jsx)(`strong`,{children:`กู้คืนรายการตรวจนับอัตโนมัติ:`}),` ระบบบันทึกข้อมูลครุภัณฑ์นี้ไว้ให้เรียบร้อยแล้ว แม้สลับถ่ายภาพหรือเบราว์เซอร์รีเฟรช ข้อมูลก็ไม่สูญหาย`]})]}),(0,E.jsx)(`button`,{type:`button`,onClick:()=>We(!1),className:`btn-dismiss-banner`,title:`ปิดข้อความแจ้งเตือน`,children:`✕`})]}),(0,E.jsx)(`div`,{className:`survey-asset-brief`,children:(0,E.jsxs)(`div`,{className:`brief-details`,style:{width:`100%`},children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:`0.5rem`,flexWrap:`wrap`,marginBottom:`0.4rem`},children:[(0,E.jsx)(`span`,{className:`brief-id`,children:N.id}),(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-secondary btn-xs`,onClick:()=>Pe(N),style:{display:`inline-flex`,alignItems:`center`,gap:`0.35rem`,fontWeight:650,padding:`0.3rem 0.65rem`,borderRadius:`var(--radius-sm)`,color:`var(--primary)`,background:`var(--bg-secondary)`,border:`1px solid var(--border)`,cursor:`pointer`},title:`คลิกเพื่อดูรูปภาพของครุภัณฑ์นี้ (โหลด On-demand)`,children:[(0,E.jsx)(v,{size:14}),` ดูรูปภาพครุภัณฑ์`]})]}),(0,E.jsx)(`h3`,{style:{margin:`0.15rem 0 0.4rem 0`,fontSize:`1.1rem`,fontWeight:750,color:`var(--text-primary)`,lineHeight:1.35},children:N.name}),x(N.note)&&(0,E.jsxs)(`div`,{style:{fontSize:`0.78rem`,color:`var(--primary)`,fontWeight:600,display:`inline-flex`,alignItems:`center`,gap:`0.25rem`,marginBottom:`0.35rem`},children:[`📝 `,x(N.note)]}),(0,E.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.25rem`,fontSize:`0.85rem`,color:`var(--text-secondary)`},children:[(0,E.jsxs)(`span`,{children:[`🏢 แผนก: `,N.department]}),(0,E.jsxs)(`span`,{children:[`📍 ที่ตั้ง: `,N.location]})]})]})}),(0,E.jsxs)(`div`,{className:`form-group`,children:[(0,E.jsx)(`label`,{className:`form-label`,children:`🔍 ยืนยันสถานะที่พบในขณะสำรวจ`}),(0,E.jsxs)(`select`,{className:`form-select status-confirm-select`,value:R,onChange:e=>Fe(e.target.value),required:!0,children:[(0,E.jsx)(`option`,{value:`ใช้งานได้`,children:`ใช้งานได้ (ปกติ/สภาพสมบูรณ์)`}),(0,E.jsx)(`option`,{value:`ชำรุด`,children:`ชำรุด (มีปัญหาขัดข้องขณะทดลอง)`}),(0,E.jsx)(`option`,{value:`รอจำหน่าย`,children:`รอจำหน่าย (เก่าเสื่อมสภาพ)`}),(0,E.jsx)(`option`,{value:`ขอป้ายรหัสใหม่`,children:`ขอป้ายรหัสใหม่ (ป้ายเดิมหลุดลอก/จางหาย)`}),(0,E.jsx)(`option`,{value:`รอโอน`,children:`รอโอน (เตรียมย้ายไปกองอื่น)`}),(0,E.jsx)(`option`,{value:`อื่นๆ`,children:`อื่นๆ`})]})]}),(0,E.jsxs)(`div`,{className:`form-group`,children:[(0,E.jsx)(`label`,{className:`form-label`,children:`📍 ยืนยันสถานที่จัดเก็บ/ติดตั้ง (เปลี่ยนได้หากพัสดุย้ายห้อง)`}),(0,E.jsx)(fe,{options:mt,value:z,onChange:e=>{B(e),e!==`custom`&&H(``)},placeholder:`พิมพ์ค้นหา หรือเลือกห้อง/ที่ตั้ง...`,allowCustom:!0,icon:(0,E.jsx)(r,{size:15,color:`var(--primary)`}),required:!0})]}),(0,E.jsxs)(`div`,{className:`form-group`,children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,marginBottom:`0.35rem`},children:[(0,E.jsx)(`label`,{className:`form-label`,style:{margin:0,display:`flex`,alignItems:`center`,gap:`0.35rem`},children:`📝 บันทึกข้อมูลโน้ต / ชื่อเล่นเครื่องมือ (Note / Nickname)`}),N&&x(N.note||``)!==x(U.trim())&&(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-secondary btn-xs`,onClick:Ot,disabled:Ie,style:{fontSize:`0.7rem`,padding:`0.2rem 0.5rem`,borderRadius:`var(--radius-sm)`,display:`flex`,alignItems:`center`,gap:`0.25rem`,color:`var(--primary)`,borderColor:`var(--primary)`},title:`บันทึกเฉพาะโน้ต/ชื่อเล่นลงฐานข้อมูลทันที`,children:[(0,E.jsx)(c,{size:12}),` `,Ie?`กำลังบันทึก...`:`บันทึกโน้ตทันที`]})]}),(0,E.jsx)(`textarea`,{className:`form-input`,value:U,onChange:e=>W(e.target.value),placeholder:`พิมพ์บันทึกโน้ต ชื่อเล่นเครื่องมือ เช่น ตู้นึ่ง AR-2, ปั๊มหลักตึก 5 หรือข้อสังเกต...`,rows:2,style:{width:`100%`,minHeight:`68px`,fontSize:`0.85rem`,padding:`0.55rem 0.75rem`,borderRadius:`var(--radius-sm)`,background:`var(--bg-secondary)`,color:`var(--text-primary)`,border:`1px solid var(--border)`,resize:`vertical`,lineHeight:`1.4`}})]}),(0,E.jsxs)(`div`,{className:`form-group`,children:[(0,E.jsx)(`label`,{className:`form-label`,children:`📸 แนบรูปภาพ หรือ เอกสาร PDF ถ่ายตรวจสอบสภาพ (ตัวเลือกกรณีมีปัญหา)`}),(0,E.jsxs)(`div`,{className:`survey-upload-trigger`,children:[(0,E.jsx)(`input`,{ref:kt,type:`file`,id:`survey-camera-capture`,accept:`image/*`,capture:`environment`,className:`file-hidden-input`,onChange:jt}),(0,E.jsx)(`input`,{ref:At,type:`file`,id:`survey-doc-picker`,accept:`image/*,application/pdf,.pdf`,className:`file-hidden-input`,onChange:jt}),K?(0,E.jsxs)(`div`,{className:`preview-image-card`,children:[(0,E.jsx)(`div`,{className:`preview-image-box`,children:(0,E.jsx)(`img`,{src:K,alt:`damage report preview`})}),(0,E.jsxs)(`div`,{className:`preview-action-row`,children:[(0,E.jsxs)(`button`,{type:`button`,className:`btn-preview-action`,onClick:()=>Ke(!0),title:`เปิดกล้องถ่ายภาพใหม่ (In-App Camera)`,children:[(0,E.jsx)(v,{size:13,color:`#10b981`}),` ถ่ายใหม่ (กล้องด่วน)`]}),(0,E.jsxs)(`button`,{type:`button`,className:`btn-preview-action`,onClick:()=>At.current?.click(),title:`เลือกเอกสารหรือรูปภาพใหม่จากเครื่อง`,children:[(0,E.jsx)(oe,{size:13,color:`#3b82f6`}),` เปลี่ยนไฟล์ (เอกสาร/คลังภาพ)`]}),(0,E.jsxs)(`button`,{type:`button`,className:`btn-preview-action btn-preview-delete`,onClick:Mt,title:`ลบไฟล์ที่แนบ`,children:[(0,E.jsx)(ae,{size:13}),` ลบไฟล์`]})]})]}):(0,E.jsxs)(`div`,{className:`upload-choice-grid`,children:[(0,E.jsxs)(`button`,{type:`button`,className:`upload-choice-card upload-choice-inapp`,onClick:()=>Ke(!0),title:`เปิดกล้องถ่ายในหน้าเว็บโดยตรง ไม่สลับแอป หมดปัญหาแอปหลุดหรือหน่วยความจำไม่พอ 100%`,children:[(0,E.jsx)(`div`,{className:`upload-choice-icon-bubble camera-bubble inapp-bubble`,children:(0,E.jsx)(v,{size:24})}),(0,E.jsxs)(`div`,{className:`upload-choice-info`,children:[(0,E.jsx)(`span`,{className:`upload-choice-main`,children:`ถ่ายภาพด่วน (แนะนำ) ⚡`}),(0,E.jsx)(`span`,{className:`upload-choice-sub`,children:`กล้องในเว็บ ไม่สลับแอป ไม่เด้ง`})]})]}),(0,E.jsxs)(`button`,{type:`button`,className:`upload-choice-card`,onClick:()=>At.current?.click(),title:`เลือกรูปภาพจากคลังเครื่อง หรือ แนบเอกสาร PDF`,children:[(0,E.jsx)(`div`,{className:`upload-choice-icon-bubble doc-bubble`,children:(0,E.jsx)(oe,{size:24})}),(0,E.jsxs)(`div`,{className:`upload-choice-info`,children:[(0,E.jsx)(`span`,{className:`upload-choice-main`,children:`แนบเอกสาร / คลังภาพ`}),(0,E.jsx)(`span`,{className:`upload-choice-sub`,children:`PDF หรือ คลังภาพในเครื่อง`})]})]})]})]})]}),(0,E.jsxs)(`div`,{className:`form-actions`,children:[(0,E.jsx)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:Pt,children:`ยกเลิก`}),D?.role===`manager`?(0,E.jsx)(`button`,{type:`button`,className:`btn btn-muted`,disabled:!0,style:{cursor:`not-allowed`,opacity:.65},children:`🔒 ผู้จัดการ (Manager) — อ่านอย่างเดียว`}):(0,E.jsx)(`button`,{type:`submit`,className:`btn btn-primary`,disabled:ze,children:ze?`กำลังบันทึก...`:`✅ ยืนยันความถูกต้องพัสดุ`})]})]}),J&&(0,E.jsxs)(`div`,{className:`survey-success-card glass-panel`,children:[(0,E.jsx)(`div`,{className:`success-check-badge`,children:(0,E.jsx)(g,{size:42,color:`var(--success)`})}),(0,E.jsx)(`h3`,{style:{fontSize:`1.25rem`,fontWeight:800,marginTop:`0.25rem`},children:`บันทึกผลการสำรวจสำเร็จ`}),(0,E.jsxs)(`p`,{style:{color:`var(--text-secondary)`,fontSize:`0.875rem`},children:[`ข้อมูลการตรวจสอบสภาพครุภัณฑ์จาก `,(0,E.jsx)(`strong`,{children:k}),` ได้รับการบันทึกและซิงค์เรียบร้อยแล้ว`]}),(0,E.jsxs)(`div`,{className:`survey-summary-success-pill`,children:[(0,E.jsx)(`span`,{children:`รหัสครุภัณฑ์ที่ตรวจนับ:`}),(0,E.jsx)(`code`,{children:M})]}),Ct===100&&xt>0?(0,E.jsxs)(`div`,{className:`alert alert-success animate-fade-in`,style:{width:`100%`,marginBottom:`1rem`,display:`flex`,alignItems:`center`,gap:`0.5rem`},children:[(0,E.jsx)(g,{size:20,color:`var(--success)`}),(0,E.jsxs)(`span`,{children:[(0,E.jsx)(`strong`,{children:`เสร็จสมบูรณ์:`}),` สำรวจครบ 100% ตามเป้าหมายแผนงานนี้เรียบร้อยแล้ว`]})]}):null,(0,E.jsx)(`button`,{className:`btn btn-primary w-full`,onClick:Pt,children:`สแกนชิ้นถัดไป`})]})]})]}),(0,E.jsxs)(`div`,{className:`rounds-manager-card glass-panel`,style:{marginTop:`1.75rem`,padding:`1.5rem`},children:[(0,E.jsxs)(`div`,{className:`rounds-manager-header`,style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,borderBottom:`1px solid var(--border)`,paddingBottom:`0.75rem`,marginBottom:`1.25rem`,flexWrap:`wrap`,gap:`1rem`},children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.65rem`},children:[(0,E.jsx)(u,{size:22,className:`text-primary`}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`h3`,{style:{fontSize:`1.15rem`,fontWeight:800},children:`จัดการรอบการตรวจสอบพัสดุประจำปี`}),(0,E.jsx)(`p`,{style:{fontSize:`0.75rem`,color:`var(--text-secondary)`},children:`ปิดรอบการตรวจสอบ ล็อคข้อมูลสถิติประวัติเพื่อรายงาน และเริ่มการตรวจรอบถัดไป`})]})]}),(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.75rem`,flexWrap:`wrap`},children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,background:`var(--bg-secondary)`,padding:`0.25rem 0.65rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`},children:[(0,E.jsx)(`span`,{style:{fontSize:`0.725rem`,fontWeight:750,color:`var(--text-muted)`},children:`🏢 หน่วยงาน:`}),(0,E.jsxs)(`select`,{className:`form-select select-survey-target`,value:Z,onChange:e=>nt(e.target.value),disabled:D?.role===`user`||D?.role===`operator`||D?.role===`head`,style:{padding:`0.15rem 1.5rem 0.15rem 0.35rem`,fontSize:`0.75rem`,border:`none`,background:`transparent`,width:`auto`,fontWeight:`bold`,color:`var(--primary)`,height:`auto`,outline:`none`,boxShadow:`none`},children:[!(D?.role===`user`||D?.role===`operator`||D?.role===`head`)&&(0,E.jsx)(`option`,{value:`all`,children:`ทุกหน่วยงาน`}),D?.role===`user`||D?.role===`operator`||D?.role===`head`?(0,E.jsx)(`option`,{value:D.department,children:D.department}):ut.map(e=>(0,E.jsx)(`option`,{value:e,children:e},e))]})]}),(0,E.jsxs)(`div`,{className:`tab-pill-group`,style:{display:`flex`,background:`var(--bg-secondary)`,padding:`0.2rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`},children:[(0,E.jsx)(`button`,{type:`button`,className:`btn btn-xs ${et===`active`?`btn-primary`:`btn-ghost`}`,onClick:()=>tt(`active`),style:{padding:`0.35rem 0.75rem`,borderRadius:`calc(var(--radius-sm) - 2px)`},children:`🎯 รอบปัจจุบัน`}),(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-xs ${et===`history`?`btn-primary`:`btn-ghost`}`,onClick:()=>tt(`history`),style:{padding:`0.35rem 0.75rem`,borderRadius:`calc(var(--radius-sm) - 2px)`},children:[`📜 ประวัติรอบที่ปิดแล้ว (`,ne.filter(e=>e.status===`closed`).length,`)`]})]})]})]}),et===`active`?(0,E.jsx)(`div`,{children:m?(()=>{let t=e.filter(e=>Z===`all`||e.department===Z),r=o.filter(t=>(t.roundId||`round-default`)!==m.id&&!(m.id===`round-default`&&(!t.roundId||t.roundId===`round-default`))?!1:Z===`all`?!0:e.find(e=>e.id===t.assetId)?.department===Z),s=t.length,c=r.length,l=s>0?Math.round(c/s*100):0;return(0,E.jsxs)(`div`,{className:`active-round-dashboard`,children:[(0,E.jsxs)(`div`,{className:`active-round-main-col`,children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,marginBottom:`0.5rem`},children:[(0,E.jsx)(`span`,{className:`badge badge-success`,style:{animation:`pulse 1.5s infinite alternate`},children:`✓ กำลังดำเนินการ (Active)`}),(0,E.jsxs)(`span`,{style:{fontSize:`0.75rem`,color:`var(--text-muted)`},children:[`เริ่มรอบเมื่อ: `,new Date(m.dateCreated).toLocaleDateString(`th-TH`,{year:`numeric`,month:`long`,day:`numeric`,hour:`2-digit`,minute:`2-digit`}),` น.`]})]}),(0,E.jsx)(`h4`,{style:{fontSize:`1.25rem`,fontWeight:800,color:`var(--primary)`,marginBottom:`0.75rem`},children:m.name}),(0,E.jsxs)(`div`,{className:`stats-mini-grid`,style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(130px, 1fr))`,gap:`0.75rem`,marginBottom:`1.25rem`},children:[(0,E.jsxs)(`div`,{style:{background:`var(--bg-secondary)`,padding:`0.75rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`},children:[(0,E.jsxs)(`span`,{style:{fontSize:`0.7rem`,color:`var(--text-muted)`},children:[`ครุภัณฑ์ทั้งหมด `,Z===`all`?``:`(${Z})`]}),(0,E.jsxs)(`div`,{style:{fontSize:`1.35rem`,fontWeight:900},children:[s,` รายการ`]})]}),(0,E.jsxs)(`div`,{style:{background:`var(--bg-secondary)`,padding:`0.75rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`},children:[(0,E.jsx)(`span`,{style:{fontSize:`0.7rem`,color:`var(--text-muted)`},children:`สแกนตรวจนับแล้ว`}),(0,E.jsxs)(`div`,{style:{fontSize:`1.35rem`,fontWeight:900,color:`var(--success)`},children:[c,` รายการ`]})]}),(0,E.jsxs)(`div`,{style:{background:`var(--bg-secondary)`,padding:`0.75rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`},children:[(0,E.jsx)(`span`,{style:{fontSize:`0.7rem`,color:`var(--text-muted)`},children:`อัตราความก้าวหน้า`}),(0,E.jsxs)(`div`,{style:{fontSize:`1.35rem`,fontWeight:900,color:`var(--primary)`},children:[l,`%`]})]})]}),(0,E.jsxs)(`div`,{style:{display:`flex`,gap:`0.5rem`,flexWrap:`wrap`,marginTop:`0.5rem`,marginBottom:`0.5rem`},children:[(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-success`,onClick:()=>Ft(m),style:{display:`flex`,alignItems:`center`,gap:`0.45rem`,fontWeight:700},title:`ดาวน์โหลดข้อมูลรอบปัจจุบันเป็นไฟล์ CSV (เปิดใน Excel ได้ทันที ฟิลเตอร์ดูห้องที่ยังไม่ครบได้ง่าย)`,children:[(0,E.jsx)(a,{size:16}),` 📊 ส่งออกรายงานรอบปัจจุบัน (CSV / Excel)`]}),(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:()=>$e(m),style:{display:`flex`,alignItems:`center`,gap:`0.45rem`},title:`ดูตัวอย่างเอกสารทางการแบบหน้ากระดาษ A4`,children:[(0,E.jsx)(n,{size:15}),` พิมพ์รายงาน A4 (PDF)`]}),D?.role===`head`&&(()=>{let t=D.department||``,n=m.departmentSignoffs?.[t]?.status===`signed`,r=e.filter(e=>e.department===t).length,a=o.filter(n=>n.roundId===m.id?e.find(e=>e.id===n.assetId)?.department===t:!1).length,s=r>0&&a>=r;return n?(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-success`,disabled:!0,style:{display:`flex`,alignItems:`center`,gap:`0.45rem`,opacity:.9},children:[(0,E.jsx)(te,{size:15}),` ✓ ฝ่าย`,t,` ยืนยันปิดรอบแล้ว (`,a,`/`,r,`)`]}):(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-warning`,disabled:!s,title:s?``:`ต้องสแกนครุภัณฑ์ของฝ่าย ${t} ให้ครบ 100% ก่อน (${a}/${r})`,onClick:async()=>{ye&&t&&await ye(t,D.name||k)},style:{display:`flex`,alignItems:`center`,gap:`0.45rem`},children:[(0,E.jsx)(i,{size:15}),` ✍️ หัวหน้าฝ่ายยืนยันปิดรอบ (`,t,`) `,s?`✓ ครบ 100%`:`(${Math.round(a/r*100||0)}%)`]})})(),(D?.role===`admin`||D?.role===`manager`)&&!Ye&&(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-danger`,onClick:()=>{Xe(!0),Qe(k)},style:{display:`flex`,alignItems:`center`,gap:`0.45rem`},children:[(0,E.jsx)(i,{size:15}),` 🔒 ผู้บริหารกดปิดรอบสำรวจพัสดุ (องค์กร)`]})]}),D?.role===`operator`&&(0,E.jsxs)(`div`,{style:{fontSize:`0.8rem`,color:`var(--text-muted)`,fontStyle:`italic`,display:`flex`,alignItems:`center`,gap:`0.25rem`,marginTop:`0.5rem`},children:[(0,E.jsx)(i,{size:14}),` บัญชีผู้ปฏิบัติงาน (`,D.department||`Operator`,`) — สแกนครุภัณฑ์ของฝ่ายเมื่อครบ 100% แล้ว ให้ Head ฝ่ายกดยืนยันปิดรอบ`]}),Ye&&(0,E.jsxs)(`div`,{className:`close-confirm-card`,style:{background:`rgba(239, 68, 68, 0.03)`,border:`1.5px solid var(--danger)`,padding:`1rem`,borderRadius:`var(--radius-md)`,display:`flex`,flexDirection:`column`,gap:`0.75rem`,marginTop:`0.5rem`},children:[(0,E.jsxs)(`div`,{style:{display:`flex`,gap:`0.5rem`,alignItems:`center`},children:[(0,E.jsx)(p,{color:`var(--danger)`,size:18}),(0,E.jsx)(`h5`,{style:{fontWeight:800,color:`var(--danger)`},children:`ยืนยันการปิดรอบการสำรวจพัสดุประจำปี?`})]}),(0,E.jsx)(`p`,{style:{fontSize:`0.8rem`,color:`var(--text-secondary)`},children:`การปิดรอบจะทำการ **แช่แข็งสถิติ** (อัตราความก้าวหน้า และจำนวนสถานะ) เก็บเข้าสารบบประวัติของรอบนี้ และ **รีเซ็ตเช็คลิสต์ตรวจนับ** ของครุภัณฑ์ทุกชิ้นกลับเป็น "ค้างตรวจนับ" เพื่อเริ่มปีงบประมาณรอบใหม่`}),(0,E.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,E.jsx)(`label`,{className:`form-label`,style:{color:`var(--text-primary)`},children:`👤 ลงลายมือชื่อแอดมินผู้ปิดรอบ / ตรวจสอบความถูกต้อง`}),(0,E.jsx)(`input`,{type:`text`,className:`form-input`,placeholder:`พิมพ์ชื่อของคุณเพื่อยืนยัน...`,value:Ze,onChange:e=>Qe(e.target.value),required:!0,style:{border:`1.5px solid var(--danger)`}})]}),(0,E.jsxs)(`div`,{style:{display:`flex`,gap:`0.5rem`,justifyContent:`flex-end`,marginTop:`0.25rem`},children:[(0,E.jsx)(`button`,{type:`button`,className:`btn btn-secondary btn-sm`,onClick:()=>Xe(!1),children:`ยกเลิก`}),(0,E.jsx)(`button`,{type:`button`,className:`btn btn-danger btn-sm`,disabled:!Ze.trim(),onClick:async()=>{Ze.trim()&&(await ve(Ze),Xe(!1))},children:`ยืนยันการปิดรอบและรีเซ็ตระบบ`})]})]})]}),(0,E.jsxs)(`div`,{className:`active-round-status-box`,style:{background:`var(--bg-secondary)`,border:`1px solid var(--border)`,padding:`1.25rem`,borderRadius:`var(--radius-md)`},children:[(0,E.jsxs)(`h4`,{style:{fontWeight:800,display:`flex`,alignItems:`center`,gap:`0.4rem`,fontSize:`0.9rem`,marginBottom:`0.75rem`},children:[(0,E.jsx)(h,{size:16,color:`var(--primary)`}),` สถิติสถานะเรียลไทม์ (Active Breakdown)`]}),(0,E.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.65rem`},children:Object.keys(It).map(e=>{let t=r.filter(t=>t.status===e).length;return(0,E.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,fontSize:`0.85rem`},children:[(0,E.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:`0.4rem`},children:[(0,E.jsx)(`span`,{className:`badge ${It[e]}`,style:{width:`10px`,height:`10px`,padding:0,borderRadius:`50%`}}),(0,E.jsx)(`span`,{children:e})]}),(0,E.jsxs)(`strong`,{style:{fontSize:`0.95rem`},children:[t,` ชิ้น`]})]},e)})})]}),Z===`all`&&(D?.role===`admin`||D?.role===`manager`)&&(0,E.jsxs)(`div`,{className:`active-round-dept-box`,style:{background:`var(--bg-secondary)`,border:`1px solid var(--border)`,padding:`1.25rem`,borderRadius:`var(--radius-md)`,display:`flex`,flexDirection:`column`},children:[(0,E.jsxs)(`h4`,{style:{fontSize:`0.95rem`,fontWeight:800,color:`var(--text-primary)`,marginBottom:`0.75rem`,display:`flex`,alignItems:`center`,gap:`0.35rem`},children:[(0,E.jsx)(ce,{size:16,color:`var(--primary)`}),`📊 ความก้าวหน้าแยกรายฝ่าย/หน่วยงาน`]}),(0,E.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.75rem`,maxHeight:`220px`,overflowY:`auto`,paddingRight:`0.25rem`},children:ut.map(t=>{let n=e.filter(e=>e.department===t),r=o.filter(n=>n.roundId===m.id?e.find(e=>e.id===n.assetId)?.department===t:!1),i=n.length,a=r.length,s=i>0?Math.round(a/i*100):0;return(0,E.jsxs)(`div`,{style:{background:`var(--bg-primary)`,padding:`0.65rem 0.85rem`,borderRadius:`var(--radius-sm)`,border:`1px solid var(--border)`},children:[(0,E.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`0.25rem`},children:[(0,E.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:750,color:`var(--text-primary)`},children:t}),(0,E.jsxs)(`span`,{style:{fontSize:`0.8rem`,fontWeight:850,color:s===100?`var(--success)`:`var(--primary)`},children:[s,`%`]})]}),(0,E.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,fontSize:`0.675rem`,color:`var(--text-secondary)`,marginBottom:`0.4rem`},children:[(0,E.jsxs)(`span`,{children:[`เช็คแล้ว `,a,` จาก `,i,` ชิ้น`]}),(0,E.jsxs)(`span`,{children:[i-a,` ชิ้นค้างตรวจ`]})]}),(0,E.jsx)(`div`,{className:`progress-bar-bg`,style:{height:`6px`,background:`var(--bg-secondary)`},children:(0,E.jsx)(`div`,{className:`progress-bar-fill`,style:{width:`${s}%`,height:`100%`,borderRadius:`inherit`,background:s===100?`var(--success)`:`var(--primary)`}})})]},t)})})]})]})})():(0,E.jsxs)(`div`,{className:`no-active-round-box`,style:{textAlign:`center`,padding:`2.5rem 1.5rem`,background:`rgba(59, 130, 246, 0.02)`,border:`2px dashed var(--border)`,borderRadius:`var(--radius-md)`,display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`0.75rem`},children:[(0,E.jsx)(p,{size:36,color:`var(--primary)`,style:{animation:`bounce 1s infinite alternate`}}),(0,E.jsx)(`h4`,{style:{fontWeight:800},children:`ยังไม่มีรอบการตรวจนับครุภัณฑ์ที่เปิดใช้งาน`}),(0,E.jsx)(`p`,{style:{fontSize:`0.825rem`,color:`var(--text-secondary)`,maxWidth:`420px`},children:`เมื่อเริ่มเปิดรอบใหม่ ครุภัณฑ์ทั้งหมดจะอยู่ในสถานะ "ค้างสแกน" เพื่อเริ่มดำเนินการเดินสายสแกนตรวจสอบประจำปีใหม่`}),(0,E.jsx)(`div`,{className:`new-round-wizard`,style:{display:`flex`,gap:`0.5rem`,width:`100%`,maxWidth:`500px`,marginTop:`0.5rem`,flexWrap:`wrap`},children:D?.role===`admin`||D?.role===`manager`?(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(`input`,{type:`text`,className:`form-input`,placeholder:`เช่น รอบสำรวจประจำปีงบประมาณ 2570...`,value:qe,onChange:e=>Je(e.target.value),style:{flex:1,minWidth:`220px`}}),(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-primary`,disabled:!qe.trim(),onClick:async()=>{qe.trim()&&(await he(qe,k),Je(``))},style:{display:`flex`,alignItems:`center`,gap:`0.4rem`},children:[(0,E.jsx)(ee,{size:15}),` 🚀 ผู้บริหารเปิดรอบการสำรวจใหม่`]})]}):(0,E.jsxs)(`div`,{style:{fontSize:`0.85rem`,color:`var(--text-muted)`,fontStyle:`italic`,display:`flex`,alignItems:`center`,gap:`0.35rem`},children:[(0,E.jsx)(i,{size:15}),` เฉพาะระดับผู้บริหาร (Manager / Admin) เท่านั้นที่มีสิทธิ์เปิดรอบการสำรวจพัสดุใหม่`]})})]})}):(0,E.jsx)(`div`,{className:`closed-rounds-history`,children:ne.filter(e=>e.status===`closed`).length===0?(0,E.jsxs)(`div`,{style:{textAlign:`center`,padding:`2.5rem`,color:`var(--text-muted)`},children:[(0,E.jsx)(d,{size:36,style:{marginBottom:`0.5rem`,opacity:.6}}),(0,E.jsx)(`p`,{style:{fontSize:`0.85rem`},children:`ยังไม่พบประวัติรอบการสำรวจที่เคยปิดเสร็จสิ้นในอดีต`})]}):(0,E.jsx)(`div`,{className:`table-responsive`,style:{maxHeight:`350px`,overflowY:`auto`},children:(0,E.jsxs)(`table`,{className:`table`,style:{width:`100%`,borderCollapse:`collapse`,fontSize:`0.825rem`},children:[(0,E.jsx)(`thead`,{children:(0,E.jsxs)(`tr`,{style:{textAlign:`left`,borderBottom:`2px solid var(--border)`},children:[(0,E.jsx)(`th`,{style:{padding:`0.65rem 0.5rem`},children:`🎯 ชื่องานรอบสำรวจ`}),(0,E.jsx)(`th`,{style:{padding:`0.65rem 0.5rem`},children:`📅 วันที่เริ่มต้น - ปิดรอบ`}),(0,E.jsx)(`th`,{style:{padding:`0.65rem 0.5rem`,textAlign:`center`},children:`ความคืบหน้า`}),(0,E.jsx)(`th`,{style:{padding:`0.65rem 0.5rem`},children:`📊 รายละเอียดสภาพที่พบ`}),(0,E.jsx)(`th`,{style:{padding:`0.65rem 0.5rem`},children:`👤 ผู้ดำเนินการ`}),(0,E.jsx)(`th`,{style:{padding:`0.65rem 0.5rem`,textAlign:`center`},children:`รายงาน`})]})}),(0,E.jsx)(`tbody`,{children:ne.filter(e=>e.status===`closed`).map(t=>{let r=e.filter(e=>Z===`all`||e.department===Z),i=o.filter(n=>n.roundId===t.id?Z===`all`?!0:e.find(e=>e.id===n.assetId)?.department===Z:!1),s=r.length,c=i.length,l=s>0?Math.round(c/s*100):0,u=e=>i.filter(t=>t.status===e).length;return(0,E.jsxs)(`tr`,{style:{borderBottom:`1px solid var(--border)`},children:[(0,E.jsx)(`td`,{style:{padding:`0.75rem 0.5rem`,fontWeight:700},children:t.name}),(0,E.jsxs)(`td`,{style:{padding:`0.75rem 0.5rem`,color:`var(--text-secondary)`},children:[(0,E.jsxs)(`div`,{children:[`เริ่ม: `,new Date(t.dateCreated).toLocaleDateString(`th-TH`)]}),(0,E.jsxs)(`div`,{children:[`ปิด: `,t.dateClosed?new Date(t.dateClosed).toLocaleDateString(`th-TH`):`-`]})]}),(0,E.jsxs)(`td`,{style:{padding:`0.75rem 0.5rem`,textAlign:`center`},children:[(0,E.jsxs)(`span`,{className:`badge badge-success`,style:{fontWeight:900},children:[l,`%`]}),(0,E.jsxs)(`div`,{style:{fontSize:`0.7rem`,color:`var(--text-muted)`,marginTop:`0.15rem`},children:[`(`,c,`/`,s,`)`]})]}),(0,E.jsx)(`td`,{style:{padding:`0.75rem 0.5rem`},children:(0,E.jsxs)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:`0.25rem`,fontSize:`0.7rem`},children:[(0,E.jsxs)(`span`,{className:`badge badge-success`,children:[`ใช้งานได้: `,u(`ใช้งานได้`)]}),(0,E.jsxs)(`span`,{className:`badge badge-danger`,children:[`ชำรุด: `,u(`ชำรุด`)]}),(0,E.jsxs)(`span`,{className:`badge badge-warning`,children:[`รอจำหน่าย: `,u(`รอจำหน่าย`)]}),(0,E.jsxs)(`span`,{className:`badge badge-info`,children:[`ป้ายใหม่: `,u(`ขอป้ายรหัสใหม่`)]})]})}),(0,E.jsx)(`td`,{style:{padding:`0.75rem 0.5rem`},children:t.operator}),(0,E.jsx)(`td`,{style:{padding:`0.75rem 0.5rem`,textAlign:`center`},children:(0,E.jsxs)(`div`,{style:{display:`flex`,gap:`0.35rem`,justifyContent:`center`,flexWrap:`wrap`},children:[(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-success btn-xs`,onClick:()=>Ft(t),style:{display:`inline-flex`,alignItems:`center`,gap:`0.25rem`,padding:`0.25rem 0.5rem`,fontSize:`0.75rem`,fontWeight:600},title:`ดาวน์โหลดไฟล์ CSV (Excel)`,children:[(0,E.jsx)(a,{size:12}),` ส่งออก CSV`]}),(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-secondary btn-xs`,onClick:()=>$e(t),style:{display:`inline-flex`,alignItems:`center`,gap:`0.25rem`,padding:`0.25rem 0.5rem`,fontSize:`0.75rem`},children:[(0,E.jsx)(n,{size:12}),` พิมพ์รายงาน`]}),(D?.role===`admin`||D?.role===`manager`)&&(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-warning btn-xs`,onClick:async()=>{let e=prompt(`กรุณาระบุเหตุผลในการดึงรอบกลับมาแก้ไข:`,`พบข้อมูลต้องตรวจนับเพิ่มเติม`);e!==null&&be&&await be(t.id,D.name||k,e)},style:{display:`inline-flex`,alignItems:`center`,gap:`0.25rem`,padding:`0.25rem 0.5rem`,fontSize:`0.75rem`},children:[(0,E.jsx)(le,{size:12}),` 🔄 ดึงรอบกลับมาแก้ไข`]})]})})]},t.id)})})]})})})]}),X&&(0,E.jsxs)(`div`,{className:`print-preview-overlay animate-fade-in`,style:{position:`fixed`,top:0,left:0,width:`100%`,height:`100%`,background:`rgba(0,0,0,0.85)`,zIndex:9999,overflowY:`auto`,display:`flex`,flexDirection:`column`,padding:`2rem 1rem`},children:[(0,E.jsxs)(`div`,{className:`print-actions-bar glass-panel`,style:{maxWidth:`800px`,width:`100%`,margin:`0 auto 1.5rem auto`,padding:`1rem`,display:`flex`,justifyContent:`space-between`,alignItems:`center`,zIndex:1e4},children:[(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`h4`,{style:{fontWeight:800,color:`var(--primary)`},children:`🖨️ ตัวอย่างก่อนพิมพ์รายงานราชการ (A4 Preview)`}),(0,E.jsx)(`p`,{style:{fontSize:`0.75rem`,color:`var(--text-secondary)`},children:`เอกสารทางการจัดรูปแบบตามมาตรฐาน สำหรับเสนอรายงานผู้บริหารหรือพิมพ์ลงกระดาษ A4`})]}),(0,E.jsxs)(`div`,{style:{display:`flex`,gap:`0.5rem`,flexWrap:`wrap`},children:[(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-success`,onClick:()=>Ft(X),style:{display:`flex`,alignItems:`center`,gap:`0.4rem`,fontWeight:600},title:`ส่งออกรายงานรอบนี้เป็นไฟล์ CSV (Excel)`,children:[(0,E.jsx)(a,{size:16}),` ส่งออก CSV (Excel)`]}),(0,E.jsx)(`button`,{type:`button`,className:`btn btn-secondary`,onClick:()=>$e(null),children:`ย้อนกลับ`}),(0,E.jsxs)(`button`,{type:`button`,className:`btn btn-primary`,onClick:()=>window.print(),style:{display:`flex`,alignItems:`center`,gap:`0.4rem`},children:[(0,E.jsx)(n,{size:16}),` สั่งพิมพ์ / บันทึก PDF`]})]})]}),(0,E.jsxs)(`div`,{className:`print-paper-a4 printable-a4-document`,style:{background:`#ffffff`,color:`#000000`,maxWidth:`800px`,width:`100%`,margin:`0 auto`,padding:`2.5rem 3rem`,minHeight:`11.28in`,boxShadow:`0 10px 30px rgba(0,0,0,0.5)`,fontFamily:`'Sarabun', 'Noto Sans Thai', sans-serif`,fontSize:`13px`,lineHeight:`1.6`,colorScheme:`light`,borderRadius:`4px`},children:[(()=>{let t=e.filter(e=>Z===`all`||e.department===Z),n=o.filter(t=>t.roundId===X.id?Z===`all`?!0:e.find(e=>e.id===t.assetId)?.department===Z:!1),r=t.length,i=n.length,a=r>0?Math.round(i/r*100):0,s={ใช้งานได้:0,ชำรุด:0,รอจำหน่าย:0,ขอป้ายรหัสใหม่:0,รอโอน:0,อื่นๆ:0};n.forEach(e=>{let t=e.status;t in s?s[t]++:s.อื่นๆ++});let c=n.map(e=>e.assetId),l=t.filter(e=>!c.includes(e.id));return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsxs)(`div`,{style:{textAlign:`center`,position:`relative`,marginBottom:`2.5rem`},children:[(0,E.jsx)(`div`,{style:{fontSize:`28px`,color:`#000000`,marginBottom:`0.5rem`},children:`🇹🇭`}),(0,E.jsxs)(`h1`,{style:{fontSize:`1.65rem`,fontWeight:800,color:`#000000`,margin:`0.2rem 0`},children:[`รายงานสรุปผลการตรวจนับครุภัณฑ์ประจำปี`,Z===`all`?``:` (หน่วยงาน: ${Z})`]}),(0,E.jsxs)(`h2`,{style:{fontSize:`1.2rem`,fontWeight:700,color:`#333333`,margin:`0.2rem 0`},children:[`ชื่องาน: `,X.name]}),(0,E.jsx)(`div`,{style:{fontSize:`0.85rem`,color:`#666666`,marginTop:`0.5rem`},children:`หน่วยงาน: คลังข้อมูลพัสดุและครุภัณฑ์กลางระบบ AssetWatch`})]}),(0,E.jsx)(`hr`,{style:{border:`0`,borderTop:`2px double #333333`,margin:`1rem 0 1.5rem 0`}}),(0,E.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`1rem`,marginBottom:`1.5rem`,background:`#f8f9fa`,padding:`1rem`,border:`1px solid #dddddd`,borderRadius:`4px`},children:[(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`strong`,{children:`📅 วันที่ตรวจสอบเริ่มรอบ:`}),` `,new Date(X.dateCreated).toLocaleDateString(`th-TH`)]}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`strong`,{children:`📅 วันที่เสร็จสิ้นปิดรอบ:`}),` `,X.dateClosed?new Date(X.dateClosed).toLocaleDateString(`th-TH`):`-`]}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`strong`,{children:`👤 เจ้าหน้าที่แอดมินผู้ประมวลผล:`}),` `,X.operator]})]}),(0,E.jsxs)(`div`,{style:{borderLeft:`1px solid #dddddd`,paddingLeft:`1rem`},children:[(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`strong`,{children:[`📦 ครุภัณฑ์ทั้งหมด `,Z===`all`?`ในคลังระบบ`:`(${Z})`,`:`]}),` `,r,` รายการ`]}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`strong`,{children:`✅ สแกนตรวจสอบความถูกต้องแล้ว:`}),` `,i,` รายการ`]}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`strong`,{children:`📊 อัตราความก้าวหน้าการสำรวจ:`}),` `,a,`%`]})]})]}),(0,E.jsx)(`h3`,{style:{fontSize:`1.05rem`,fontWeight:800,borderBottom:`1px solid #000000`,paddingBottom:`0.25rem`,marginBottom:`0.75rem`,marginTop:`1.5rem`},children:`๑. รายงานสรุปผลจำแนกตามสภาพครุภัณฑ์ที่สแกนพบ (Condition Breakdown Summary)`}),(0,E.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,marginBottom:`2rem`},children:[(0,E.jsx)(`thead`,{children:(0,E.jsxs)(`tr`,{style:{background:`#f2f2f2`,borderBottom:`1.5px solid #000000`,borderTop:`1px solid #dddddd`},children:[(0,E.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`},children:`ลำดับที่`}),(0,E.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`left`,border:`1px solid #dddddd`},children:`สภาพ/สถานะพัสดุ`}),(0,E.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`right`,border:`1px solid #dddddd`},children:`จำนวน (ชิ้น)`}),(0,E.jsx)(`th`,{style:{padding:`0.5rem`,textAlign:`right`,border:`1px solid #dddddd`},children:`ร้อยละ (%) ของผู้ตรวจรับ`})]})}),(0,E.jsxs)(`tbody`,{children:[Object.keys(s).map((e,t)=>{let n=s[e]||0,r=i>0?Math.round(n/i*100):0;return(0,E.jsxs)(`tr`,{style:{borderBottom:`1px solid #dddddd`},children:[(0,E.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`},children:t+1}),(0,E.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`,fontWeight:`bold`},children:e}),(0,E.jsx)(`td`,{style:{padding:`0.5rem`,textAlign:`right`,border:`1px solid #dddddd`},children:n}),(0,E.jsxs)(`td`,{style:{padding:`0.5rem`,textAlign:`right`,border:`1px solid #dddddd`},children:[r,`%`]})]},e)}),(0,E.jsxs)(`tr`,{style:{background:`#f8f9fa`,borderTop:`1.5px solid #000000`,borderBottom:`2px solid #000000`,fontWeight:`bold`},children:[(0,E.jsx)(`td`,{style:{padding:`0.5rem`,border:`1px solid #dddddd`},colSpan:2,children:`รวมรายการครุภัณฑ์ที่ตรวจนับได้สำเร็จในรอบนี้`}),(0,E.jsx)(`td`,{style:{padding:`0.5rem`,textAlign:`right`,border:`1px solid #dddddd`},children:i}),(0,E.jsx)(`td`,{style:{padding:`0.5rem`,textAlign:`right`,border:`1px solid #dddddd`},children:`100%`})]})]})]}),(0,E.jsx)(`h3`,{style:{fontSize:`1.05rem`,fontWeight:800,borderBottom:`1px solid #000000`,paddingBottom:`0.25rem`,marginBottom:`0.75rem`,marginTop:`1.5rem`},children:`๒. รายละเอียดครุภัณฑ์ที่ได้รับการสแกนยืนยันตัวตนสำเร็จ (Surveyed Assets List)`}),(0,E.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,marginBottom:`2rem`,fontSize:`12px`},children:[(0,E.jsx)(`thead`,{children:(0,E.jsxs)(`tr`,{style:{background:`#f2f2f2`,borderBottom:`1.5px solid #000000`,borderTop:`1px solid #dddddd`},children:[(0,E.jsx)(`th`,{style:{padding:`0.45rem`,textAlign:`left`,border:`1px solid #dddddd`},children:`รหัสครุภัณฑ์`}),(0,E.jsx)(`th`,{style:{padding:`0.45rem`,textAlign:`left`,border:`1px solid #dddddd`},children:`ชื่อรายการครุภัณฑ์`}),(0,E.jsx)(`th`,{style:{padding:`0.45rem`,textAlign:`left`,border:`1px solid #dddddd`},children:`ฝ่าย/แผนก`}),(0,E.jsx)(`th`,{style:{padding:`0.45rem`,textAlign:`left`,border:`1px solid #dddddd`},children:`สถานที่`}),(0,E.jsx)(`th`,{style:{padding:`0.45rem`,textAlign:`center`,border:`1px solid #dddddd`},children:`สภาพที่พบ`}),(0,E.jsx)(`th`,{style:{padding:`0.45rem`,textAlign:`left`,border:`1px solid #dddddd`},children:`ผู้ตรวจ`}),(0,E.jsx)(`th`,{style:{padding:`0.45rem`,textAlign:`left`,border:`1px solid #dddddd`},children:`เวลาเช็ค`})]})}),(0,E.jsx)(`tbody`,{children:n.length===0?(0,E.jsx)(`tr`,{children:(0,E.jsx)(`td`,{colSpan:7,style:{padding:`1rem`,textAlign:`center`,border:`1px solid #dddddd`,color:`#666666`},children:`ไม่มีรายการครุภัณฑ์ที่ตรวจนับในรอบนี้`})}):n.map(t=>{let n=e.find(e=>e.id===t.assetId);return(0,E.jsxs)(`tr`,{style:{borderBottom:`1px solid #dddddd`},children:[(0,E.jsx)(`td`,{style:{padding:`0.45rem`,border:`1px solid #dddddd`,fontFamily:`monospace`,fontWeight:`bold`},children:t.assetId}),(0,E.jsx)(`td`,{style:{padding:`0.45rem`,border:`1px solid #dddddd`},children:n?.name||`ไม่มีชื่อรหัสพัสดุ`}),(0,E.jsx)(`td`,{style:{padding:`0.45rem`,border:`1px solid #dddddd`},children:n?.department||`-`}),(0,E.jsx)(`td`,{style:{padding:`0.45rem`,border:`1px solid #dddddd`},children:n?.location||`-`}),(0,E.jsx)(`td`,{style:{padding:`0.45rem`,textAlign:`center`,border:`1px solid #dddddd`,fontWeight:`bold`,color:t.status===`ชำรุด`?`#d9534f`:`#22bb33`},children:t.status}),(0,E.jsx)(`td`,{style:{padding:`0.45rem`,border:`1px solid #dddddd`},children:t.operator}),(0,E.jsx)(`td`,{style:{padding:`0.45rem`,border:`1px solid #dddddd`,whiteSpace:`nowrap`},children:new Date(t.timestamp).toLocaleDateString(`th-TH`)})]},t.id)})})]}),(0,E.jsx)(`h3`,{style:{fontSize:`1.05rem`,fontWeight:800,borderBottom:`1px solid #000000`,paddingBottom:`0.25rem`,marginBottom:`0.75rem`,marginTop:`1.5rem`},children:`๓. สรุปรายการครุภัณฑ์ที่ขาดหาย / ค้างการแสกนตรวจสอบ (Missed / Unsurveyed Assets List)`}),(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`div`,{style:{marginBottom:`0.5rem`},children:[`ตรวจพบค้างสำรวจทั้งสิ้น `,(0,E.jsx)(`strong`,{children:l.length}),` รายการ ดังนี้:`]}),(0,E.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,marginBottom:`2rem`,fontSize:`12px`},children:[(0,E.jsx)(`thead`,{children:(0,E.jsxs)(`tr`,{style:{background:`#fff0f0`,borderBottom:`1.5px solid #ffcccc`,borderTop:`1px solid #ffcccc`},children:[(0,E.jsx)(`th`,{style:{padding:`0.45rem`,textAlign:`left`,border:`1px solid #ffcccc`,color:`#c9302c`},children:`รหัสครุภัณฑ์`}),(0,E.jsx)(`th`,{style:{padding:`0.45rem`,textAlign:`left`,border:`1px solid #ffcccc`,color:`#c9302c`},children:`ชื่อรายการครุภัณฑ์`}),(0,E.jsx)(`th`,{style:{padding:`0.45rem`,textAlign:`left`,border:`1px solid #ffcccc`,color:`#c9302c`},children:`ฝ่าย/แผนก`}),(0,E.jsx)(`th`,{style:{padding:`0.45rem`,textAlign:`left`,border:`1px solid #ffcccc`,color:`#c9302c`},children:`สถานที่จัดเก็บตามระบบ`}),(0,E.jsx)(`th`,{style:{padding:`0.45rem`,textAlign:`center`,border:`1px solid #ffcccc`,color:`#c9302c`},children:`ผู้รับผิดชอบ`})]})}),(0,E.jsx)(`tbody`,{children:l.length===0?(0,E.jsx)(`tr`,{children:(0,E.jsx)(`td`,{colSpan:5,style:{padding:`1rem`,textAlign:`center`,border:`1px solid #ffcccc`,color:`#22bb33`,fontWeight:`bold`},children:`✓ ตรวจสอบครบสมบูรณ์ทุกรายการ ไม่มีครุภัณฑ์สูญหาย/ค้างตรวจสอบ`})}):l.map(e=>(0,E.jsxs)(`tr`,{style:{borderBottom:`1px solid #ffcccc`,background:`#fffafa`},children:[(0,E.jsx)(`td`,{style:{padding:`0.45rem`,border:`1px solid #ffcccc`,fontFamily:`monospace`,fontWeight:`bold`,color:`#c9302c`},children:e.id}),(0,E.jsx)(`td`,{style:{padding:`0.45rem`,border:`1px solid #ffcccc`,color:`#333333`},children:e.name}),(0,E.jsx)(`td`,{style:{padding:`0.45rem`,border:`1px solid #ffcccc`},children:e.department}),(0,E.jsx)(`td`,{style:{padding:`0.45rem`,border:`1px solid #ffcccc`},children:e.location}),(0,E.jsx)(`td`,{style:{padding:`0.45rem`,textAlign:`center`,border:`1px solid #ffcccc`},children:e.responsiblePerson})]},e.id))})]})]})]})})(),(0,E.jsx)(`div`,{style:{marginTop:`5rem`,display:`flex`,justifyContent:`flex-end`},children:(0,E.jsxs)(`div`,{style:{textAlign:`center`,width:`280px`},children:[(0,E.jsx)(`div`,{style:{marginBottom:`3rem`},children:`ลงชื่อ.................................................................. ผู้รายงานผล`}),(0,E.jsxs)(`div`,{children:[`( `,X.operator,` )`]}),(0,E.jsx)(`div`,{style:{fontSize:`0.85rem`,color:`#666666`,marginTop:`0.35rem`},children:`ตำแหน่ง: แอดมินคลังพัสดุและครุภัณฑ์`}),(0,E.jsxs)(`div`,{style:{fontSize:`0.85rem`,color:`#666666`},children:[`วันที่ `,X.dateClosed?new Date(X.dateClosed).toLocaleDateString(`th-TH`,{year:`numeric`,month:`long`,day:`numeric`}):`-`]})]})})]})]}),(0,E.jsx)(`div`,{style:{marginTop:`2rem`,padding:`1rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius-md)`,background:`var(--bg-secondary)`,width:`100%`,boxSizing:`border-box`},children:(0,E.jsxs)(`details`,{children:[(0,E.jsx)(`summary`,{style:{cursor:`pointer`,fontWeight:700,fontSize:`0.85rem`},children:`🔧 Diagnostic Logs & Debugging`}),(0,E.jsxs)(`div`,{style:{fontSize:`0.75rem`,marginTop:`1rem`,display:`flex`,flexDirection:`column`,gap:`0.5rem`},children:[(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`strong`,{children:`Active Round ID:`}),` `,(0,E.jsx)(`code`,{children:m?.id||`null`})]}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`strong`,{children:`Total Surveys:`}),` `,(0,E.jsx)(`code`,{children:o.length})]}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`strong`,{children:`Surveys in Active Round:`}),` `,(0,E.jsx)(`code`,{children:o.filter(e=>e.roundId===m?.id).length})]}),(0,E.jsxs)(`div`,{style:{maxHeight:`150px`,overflowY:`auto`,background:`var(--bg-primary)`,padding:`0.5rem`,borderRadius:`4px`},children:[(0,E.jsx)(`strong`,{children:`Recent Surveys:`}),o.slice(0,5).map(e=>(0,E.jsxs)(`div`,{children:[`- Asset ID: `,(0,E.jsx)(`code`,{children:e.assetId}),` | Round ID: `,(0,E.jsx)(`code`,{children:e.roundId}),` | Status: `,(0,E.jsx)(`code`,{children:e.status})]},e.id))]})]})]})}),(0,E.jsx)(`style`,{children:`
        .module-container {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .survey-setup-bar {
          padding: 1.25rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          width: 100%;
          box-sizing: border-box;
        }

        .select-survey-target {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--primary);
          border-color: var(--primary);
        }

        /* Progress Panel */
        .checklist-progress-panel {
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          width: 100%;
          box-sizing: border-box;
        }

        .progress-meta-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
        }

        .progress-label-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          min-width: 0;
        }

        .progress-label-group h3 {
          font-size: 1.05rem;
          font-weight: 750;
          line-height: 1.2;
          word-break: break-word;
        }

        .progress-sub {
          font-size: 0.775rem;
          color: var(--text-secondary);
          margin-top: 0.15rem;
        }

        .progress-percent-large {
          font-size: 1.85rem;
          font-weight: 900;
          color: var(--primary);
          line-height: 1;
          flex-shrink: 0;
        }

        /* Checklist board styles */
        .checklist-board-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          height: 500px; /* Expanded height for visual balance and larger viewport */
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        .checklist-controls-row {
          display: flex;
          gap: 0.4rem;
          margin-bottom: 0.75rem;
          width: 100%;
          box-sizing: border-box;
        }

        .checklist-search-box {
          position: relative;
          flex: 1.2;
          min-width: 0;
        }

        .checklist-filter-group {
          display: flex;
          gap: 0.4rem;
          flex: 1.4;
          min-width: 0;
        }

        .checklist-filter-item {
          flex: 1;
          min-width: 0;
        }

        .scan-frame {
          height: 500px; /* Matching height */
          display: flex;
          flex-direction: column;
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        .scan-frame .scanner-wrapper {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .scan-frame .video-container {
          aspect-ratio: auto !important; /* Forces scanner to fill height stretch */
          flex: 1 !important;
          height: auto !important;
        }

        .checklist-header-tabs {
          display: flex;
          border-bottom: 1.5px solid var(--border);
          margin-bottom: 0.75rem;
          gap: 0.5rem;
          padding-bottom: 0.25rem;
          width: 100%;
          box-sizing: border-box;
        }

        .checklist-tab-btn {
          flex: 1;
          padding: 0.65rem 0.5rem;
          border: none;
          background: transparent;
          font-family: var(--font-family);
          font-size: 0.85rem;
          font-weight: 650;
          color: var(--text-secondary);
          cursor: pointer;
          border-bottom: 2.5px solid transparent;
          transition: all var(--transition-fast);
          text-align: center;
          min-width: 0;
        }

        .checklist-tab-btn:hover {
          color: var(--text-primary);
        }

        .checklist-tab-btn.tab-active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .checklist-items-scroll {
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          padding-bottom: 1.5rem;
          padding-right: 0.25rem;
          width: 100%;
          box-sizing: border-box;
        }

        .checklist-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.65rem 0.85rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          width: 100%;
          box-sizing: border-box;
          gap: 0.5rem;
        }

        .checklist-item-row:hover {
          border-color: var(--primary);
          background-color: var(--bg-secondary);
        }

        .item-row-completed {
          background-color: rgba(16, 185, 129, 0.01);
          border-color: rgba(16, 185, 129, 0.15);
        }

        .item-meta {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          flex: 1;
          min-width: 0;
        }

        .item-code {
          font-size: 0.7rem;
          font-family: monospace;
          color: var(--text-muted);
          font-weight: 550;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-title {
          font-size: 0.825rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-loc {
          font-size: 0.725rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn-quick-survey {
          padding: 0.35rem 0.6rem;
          font-size: 0.75rem;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .check-mark-completed {
          font-size: 0.725rem;
          padding: 0.25rem 0.5rem;
          flex-shrink: 0;
        }

        .empty-checklist-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1.5rem;
          gap: 0.75rem;
          color: var(--text-muted);
          width: 100%;
          box-sizing: border-box;
        }

        .empty-checklist-state h4 {
          font-size: 0.9rem;
          font-weight: 750;
          color: var(--text-primary);
        }

        .empty-checklist-state p {
          font-size: 0.775rem;
          max-width: 240px;
        }

        .operator-card {
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
          width: 100%;
          box-sizing: border-box;
        }

        .operator-survey-tip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.775rem;
          color: var(--text-secondary);
          font-weight: 550;
          max-width: 320px;
        }

        .survey-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }

        .scanner-column, .form-column {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .scan-placeholder {
          height: 500px; /* Matching height */
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        .scanned-code-pill {
          padding: 0.5rem 1.25rem;
          background-color: var(--success-light);
          border-radius: var(--radius-full);
          border: 1px solid var(--success);
          color: var(--success);
          font-weight: 600;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pill-warning {
          background-color: var(--warning-light);
          border-color: var(--warning);
          color: var(--warning);
        }

        .success-bounce {
          animation: bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes bounce {
          0% { transform: scale(0.3); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .survey-wait-card {
          padding: 5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
        }

        .pulse-scanning {
          animation: scan-pulsate 1.8s infinite alternate;
        }

        @keyframes scan-pulsate {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px var(--text-muted)); }
          100% { transform: scale(1.15); filter: drop-shadow(0 0 10px var(--primary)); }
        }

        .survey-unregistered-card {
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
        }

        .warning-shake {
          animation: shake 0.5s infinite alternate;
        }

        @keyframes shake {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(5deg); }
        }

        .card-desc-warn {
          font-size: 0.85rem;
          color: var(--text-secondary);
          max-width: 380px;
          line-height: 1.5;
        }

        .warning-actions {
          display: flex;
          gap: 1rem;
          width: 100%;
          flex-wrap: wrap;
        }

        .warning-actions button {
          flex: 1;
          min-width: 120px;
        }

        .survey-form-panel {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        .survey-asset-brief {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
          width: 100%;
          box-sizing: border-box;
        }

        .brief-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
          min-width: 0;
        }

        .brief-id {
          font-size: 0.725rem;
          font-family: monospace;
          color: var(--text-muted);
          font-weight: 550;
        }

        .brief-details h3 {
          font-size: 0.95rem;
          font-weight: 750;
          color: var(--text-primary);
          word-break: break-word;
        }

        .brief-details span {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .status-confirm-select {
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary);
          border-color: var(--primary);
        }

        /* Attached image styles */
        .survey-upload-trigger {
          width: 100%;
        }

        .file-hidden-input {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          white-space: nowrap !important;
          border: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
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

        /* Success screen card */
        .survey-success-card {
          padding: 3.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
        }

        .success-check-badge {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.22));
          border: 2px solid rgba(16, 185, 129, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 18px rgba(16, 185, 129, 0.18);
          animation: badgePulse 2s infinite ease-in-out;
        }

        @keyframes badgePulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.25);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .survey-summary-success-pill {
          padding: 0.5rem 1rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          display: flex;
          gap: 0.5rem;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .survey-summary-success-pill span {
          color: var(--text-muted);
        }

        .survey-summary-success-pill code {
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Rounds Manager & Active Dashboard */
        .rounds-manager-card {
          width: 100%;
          box-sizing: border-box;
        }

        .active-round-dashboard {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          width: 100%;
          box-sizing: border-box;
        }

        .active-round-main-col {
          flex: 1 1 300px;
          min-width: 0;
          box-sizing: border-box;
        }

        .active-round-status-box {
          flex: 0.8 1 240px;
          min-width: 0;
          box-sizing: border-box;
        }

        .active-round-dept-box {
          flex: 1.2 1 280px;
          min-width: 0;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .survey-setup-bar {
            padding: 1rem;
            gap: 0.75rem;
          }
          .survey-setup-bar .form-group {
            flex: 1 1 100% !important;
            min-width: 100% !important;
            width: 100% !important;
          }
          .checklist-progress-panel {
            padding: 1rem;
          }
          .survey-layout-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .scan-frame {
            height: 380px;
          }
          .scan-placeholder {
            height: auto;
            min-height: 260px;
            padding: 1.5rem 1rem;
          }
          .checklist-board-card {
            height: 440px;
            padding: 1rem;
          }
          .checklist-controls-row {
            flex-direction: column;
            gap: 0.45rem;
          }
          .checklist-search-box {
            width: 100% !important;
            flex: 1 1 100% !important;
          }
          .checklist-filter-group {
            width: 100% !important;
            flex: 1 1 100% !important;
          }
          .operator-card {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
            padding: 1rem;
          }
          .operator-survey-tip {
            max-width: 100%;
          }
          .rounds-manager-card {
            padding: 1rem !important;
            margin-top: 1.25rem !important;
          }
          .rounds-manager-header {
            flex-direction: column;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          .rounds-manager-header > div:last-child {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
          }
          .active-round-dashboard {
            flex-direction: column;
            gap: 1rem;
          }
          .active-round-main-col,
          .active-round-status-box,
          .active-round-dept-box {
            flex: 1 1 100% !important;
            min-width: 100% !important;
            width: 100% !important;
          }
          .survey-form-panel {
            padding: 1rem;
          }
          .survey-success-card {
            padding: 2rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .progress-meta-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.4rem;
          }
          .progress-percent-large {
            align-self: flex-end;
          }
          .checklist-filter-group {
            flex-direction: column;
            gap: 0.35rem;
          }
          .checklist-filter-item {
            width: 100%;
          }
        }

        /* GOVERNMENT A4 DOCUMENT PRINT STYLES */
        @media print {
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* Hide surrounding app elements */
          .sidebar-container,
          .header-bar,
          .survey-setup-bar,
          .checklist-progress-panel,
          .survey-layout-grid,
          .rounds-manager-card,
          .print-actions-bar,
          .inapp-camera-modal-overlay {
            display: none !important;
          }
          .print-preview-overlay {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            display: block !important;
            z-index: auto !important;
          }
          .printable-a4-document {
            box-shadow: none !important;
            margin: 0 auto !important;
            padding: 1.5rem !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
        }

        /* Auto-Draft Restored Banner */
        .survey-draft-restored-banner {
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.35);
          color: var(--text-primary);
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.775rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.9rem;
        }

        .btn-dismiss-banner {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.85rem;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .btn-dismiss-banner:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.1);
        }

        .upload-choice-inapp {
          border-color: rgba(16, 185, 129, 0.45);
          background: rgba(16, 185, 129, 0.03);
        }

        .upload-choice-inapp:hover {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.08);
        }

        .inapp-bubble {
          background: rgba(16, 185, 129, 0.16) !important;
          color: #10b981 !important;
          border-color: rgba(16, 185, 129, 0.4) !important;
        }
      `}),(0,E.jsx)(_e,{isOpen:Ge,onClose:()=>Ke(!1),onCapture:e=>{K&&K.startsWith(`blob:`)&&URL.revokeObjectURL(K),G(e),q(URL.createObjectURL(e))},title:`ถ่ายภาพสภาพครุภัณฑ์ (${N?.id||M||``})`,subtitle:`ถ่ายผ่านหน้าเว็บโดยตรง ไม่สลับแอป ป้องกันปัญหาแอปหลุดหรือหน่วยความจำไม่พอ 100%`}),F&&(0,ge.createPortal)((0,E.jsx)(`div`,{className:`modal-backdrop`,onClick:()=>ke(null),style:{zIndex:9999,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,E.jsxs)(`div`,{className:`modal-card glass-panel animate-fade-in`,onClick:e=>e.stopPropagation(),style:{maxWidth:`640px`,width:`92vw`,padding:`1.5rem`,maxHeight:`90vh`,overflowY:`auto`},children:[(0,E.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`flex-start`,marginBottom:`1rem`,borderBottom:`1px solid var(--border)`,paddingBottom:`0.75rem`},children:[(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,marginBottom:`0.25rem`},children:[(0,E.jsx)(`span`,{style:{fontSize:`0.8rem`,fontFamily:`monospace`,color:`var(--text-muted)`,fontWeight:600},children:F.id}),(0,E.jsx)(`span`,{className:`badge ${It[F.status]||`badge-muted`}`,style:{fontSize:`0.7rem`},children:F.status})]}),(0,E.jsx)(`h3`,{style:{fontSize:`1.1rem`,fontWeight:700,color:`var(--text-primary)`,margin:0},children:F.name}),(0,E.jsxs)(`p`,{style:{fontSize:`0.8rem`,color:`var(--text-secondary)`,margin:`0.2rem 0 0 0`},children:[`📍 `,F.location||`-`,` \xA0•\xA0 🏢 `,F.department||`-`]})]}),(0,E.jsx)(`button`,{type:`button`,className:`btn btn-ghost btn-xs`,onClick:()=>ke(null),style:{padding:`0.35rem`,borderRadius:`50%`},title:`ปิดหน้าต่าง`,children:(0,E.jsx)(ie,{size:18})})]}),Me?(0,E.jsxs)(`div`,{style:{minHeight:`260px`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`0.75rem`,color:`var(--text-muted)`},children:[(0,E.jsx)(`div`,{style:{width:`36px`,height:`36px`,border:`3px solid var(--border)`,borderTopColor:`var(--primary)`,borderRadius:`50%`,animation:`spin 0.8s linear infinite`}}),(0,E.jsx)(`span`,{style:{fontSize:`0.875rem`,fontWeight:550},children:`กำลังโหลดรูปภาพครุภัณฑ์แบบ On-demand จากคลาวด์...`})]}):Ae?(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`div`,{style:{borderRadius:`10px`,overflow:`hidden`,border:`1px solid var(--border)`,backgroundColor:`rgba(0, 0, 0, 0.05)`,maxHeight:`60vh`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,E.jsx)(`img`,{src:Ae,alt:F.name,style:{width:`100%`,height:`auto`,maxHeight:`58vh`,objectFit:`contain`}})}),(0,E.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginTop:`0.85rem`,flexWrap:`wrap`,gap:`0.5rem`},children:[(0,E.jsx)(`span`,{style:{fontSize:`0.775rem`,color:`var(--text-secondary)`,display:`inline-flex`,alignItems:`center`,gap:`0.35rem`},children:je===`survey`?`📷 รูปถ่ายจากการตรวจนับสภาพจริงล่าสุด`:`📦 รูปภาพประจำรายการครุภัณฑ์`}),(0,E.jsxs)(`a`,{href:Ae,target:`_blank`,rel:`noopener noreferrer`,className:`btn btn-secondary btn-xs`,style:{display:`inline-flex`,alignItems:`center`,gap:`0.35rem`},children:[(0,E.jsx)(s,{size:13}),` เปิดภาพขนาดเต็ม`]})]})]}):(0,E.jsxs)(`div`,{style:{minHeight:`220px`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`0.85rem`,padding:`1.5rem`,textAlign:`center`},children:[(0,E.jsx)(`div`,{style:{width:`56px`,height:`56px`,borderRadius:`50%`,backgroundColor:`var(--bg-tertiary)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`var(--text-muted)`},children:(0,E.jsx)(f,{size:28})}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`h4`,{style:{fontSize:`0.95rem`,fontWeight:600,color:`var(--text-primary)`,margin:`0 0 0.25rem 0`},children:`ยังไม่มีการแนบรูปภาพสำหรับครุภัณฑ์นี้`}),(0,E.jsx)(`p`,{style:{fontSize:`0.8rem`,color:`var(--text-secondary)`,maxWidth:`360px`,margin:0,lineHeight:1.45},children:`ครุภัณฑ์นี้ยังไม่มีภาพถ่ายสภาพจริงในระบบ ท่านสามารถถ่ายภาพได้โดยการแนบภาพในแบบฟอร์มตรวจนับนี้`})]})]})]})}),document.body)]})};export{ve as Module2_ScanSurvey};