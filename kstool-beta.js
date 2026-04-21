// ==UserScript==
// @name         KS TOOLS v2.0
// @namespace    KS_TOOLS_V2
// @version      2.0
// @license      GPL-3.0
// @description  Gelişmiş Otoanaliz & Ekspertiz Kontrol Merkezi — Yeniden tasarlanmış UI sistemi - Claude
// @author       Saygın
// @match        *://*/*
// @run-at       document-end
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_openInTab
// @grant        GM_download
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @connect      sahibinden.com
// @connect      www.sahibinden.com
// @connect      google.com
// @connect      www.google.com
// @connect      api.ipify.org
// @updateURL    https://github.com/sayginkizilkaya/Ks-Tools/raw/main/KS_TOOLS_v2.user.js
// @downloadURL  https://github.com/sayginkizilkaya/Ks-Tools/raw/main/KS_TOOLS_v2.user.js
// ==/UserScript==

(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════════════
       0. GUARD — HEDEF KONTROL
    ═══════════════════════════════════════════════════════════ */
    const url = location.href.toLowerCase();
    const hedefSiteler = /otohasar|sahibinden|turkiyesigorta|akcozum2|sbm|whatsapp/;
    const blockedGroups = ["yazdir","print","rapor","ihbar","dilekce","fatura","makbuz",
                           "dekont","invoice","receipt","barcode","kimlik","kart"];
    if (!hedefSiteler.test(url) || blockedGroups.some(w => url.includes(w))) return;

    /* ═══════════════════════════════════════════════════════════
       1. CONFIG — MERKEZ AYAR DEPOSU
    ═══════════════════════════════════════════════════════════ */
    const CFG = {
        /* Görsel */
        themeColor:   GM_getValue('KS_THEME_COLOR', '#1cb2cd'),
        panelWidth:   GM_getValue('KS_PANEL_WIDTH', 280),
        blurAmt:      GM_getValue('KS_BLUR', 18),
        borderRad:    GM_getValue('KS_RADIUS', 6),
        panelPos:     GM_getValue('KS_POS', 'bottom-right'),
        zIndex:       3169999,
        /* Modüller */
        system:       GM_getValue('KS_SYS', false),
        panel:        GM_getValue('KS_PANEL', false),
        panel_hlt:    GM_getValue('KS_PANEL_hlt', false),
        panel_pol:    GM_getValue('KS_PANEL_pol', false),
        panel_sgs:    GM_getValue('KS_PANEL_sgs', false),
        panel_rc:     GM_getValue('KS_PANEL_rc', false),
        panel_pert:   GM_getValue('KS_PANEL_pert', false),
        panel_hsr:    GM_getValue('KS_PANEL_hsr', false),
        panel_srtp:   GM_getValue('KS_PANEL_srtp', false),
        panel_srad:   GM_getValue('KS_PANEL_srad', false),
        panel_tra:    GM_getValue('KS_PANEL_tra', false),
        panel_sad:    GM_getValue('KS_PANEL_sad', false),
        panel_aad:    GM_getValue('KS_PANEL_aad', false),
        panel_mull:   GM_getValue('KS_PANEL_mull', false),
        panel_ryc:    GM_getValue('KS_PANEL_ryc', false),
        panel_rycorn: GM_getValue('KS_PANEL_rycorn', false),
        panel_pys:    GM_getValue('KS_PANEL_pys', false),
        panel_not:    GM_getValue('KS_PANEL_not', false),
        manuel:       GM_getValue('KS_MANU', false),
        referans:     GM_getValue('KS_REF', false),
        donanim:      GM_getValue('KS_DNM', false),
        resim:        GM_getValue('KS_IMG', false),
        trsigorta:    GM_getValue('KS_TRS', false),
        sahibinden:   GM_getValue('KS_SAHIB', false),
        sbm:          GM_getValue('KS_SBM', false),
        whatsapp:     GM_getValue('KS_WP', false),
        bildirim:     GM_getValue('KS_NTF', false),
    };

    /* Site tema renk eşleştirmesi — otomatik */
    const siteThemes = {
        'otohasar.hepiyi':    '#55ac05',
        'otohasar.atlas':     '#005596',
        'otohasar.mapfre':    '#e00d26',
        'otohasar.akcozum2':  '#eb5311',
        'otohasar.allianz':   '#164481',
        'otohasar.anadolu':   '#005ba4',
        'otohasar.sompo':     '#e20613',
        'otohasar.turkiye':   '#1cb2cd',
        'otohasar.groupama':  '#007a33',
        'otohasar.axa':       '#00008f',
        'otohasar.quick':     '#d1a401',
        'otohasar.ray':       '#ed1c24',
        'otohasar.bereket':   '#04b03d',
        'online.sbm.org':     '#ffffff',
    };
    const matchedSite = Object.keys(siteThemes).find(k => url.includes(k));
    if (matchedSite) CFG.themeColor = siteThemes[matchedSite];

    /* Saydam türevler */
    const TC = CFG.themeColor;
    const TC_ALPHA = (a) => TC + Math.round(a*255).toString(16).padStart(2,'0');

    /* ═══════════════════════════════════════════════════════════
       2. LOGGER — SİSTEM LOGU
    ═══════════════════════════════════════════════════════════ */
    const KSLog = (() => {
        const entries = [];
        const pad = n => String(n).padStart(2,'0');
        const ts = () => { const d=new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
        const add = (type, msg) => { entries.push({type, msg, time: ts()}); refreshLogUI(); };
        const refreshLogUI = () => {
            const el = document.getElementById('ks2-log-list');
            if (!el) return;
            const clr = {ok:'#00e87a', warn:'#ffb830', err:'#ff4d6a', info: TC};
            const lbl = {ok:'TAMAM', warn:'UYARI', err:'HATA', info:'BİLGİ'};
            const filter = document.getElementById('ks2-log-filter')?.value || 'all';
            el.innerHTML = entries.filter(e => filter==='all' || e.type===filter).slice(-40).reverse().map(e =>
                `<div class="ks2-log-row" data-type="${e.type}">
                    <span class="ks2-log-time">${e.time}</span>
                    <span class="ks2-log-tag" style="color:${clr[e.type]};border-color:${clr[e.type]}22;background:${clr[e.type]}18">${lbl[e.type]}</span>
                    <span class="ks2-log-msg">${e.msg}</span>
                </div>`
            ).join('');
        };
        return { ok:(m)=>add('ok',m), warn:(m)=>add('warn',m), err:(m)=>add('err',m), info:(m)=>add('info',m), all:()=>entries, refresh:refreshLogUI };
    })();

    /* ═══════════════════════════════════════════════════════════
       3. UI STYLES — TÜM STİL SİSTEMİ
    ═══════════════════════════════════════════════════════════ */
    GM_addStyle(`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@500;700;800&display=swap');

        :root {
            --ks-tc:     ${TC};
            --ks-bg:     rgba(10,10,14,0.92);
            --ks-bg2:    rgba(16,16,22,0.96);
            --ks-bg3:    rgba(22,22,32,1);
            --ks-border: rgba(255,255,255,0.07);
            --ks-border2:rgba(255,255,255,0.13);
            --ks-text:   #e4e4f0;
            --ks-muted:  #55556a;
            --ks-green:  #00e87a;
            --ks-red:    #ff4d6a;
            --ks-amber:  #ffb830;
            --ks-font:   'Syne', 'Segoe UI', sans-serif;
            --ks-mono:   'JetBrains Mono', 'Consolas', monospace;
            --ks-rad:    ${CFG.borderRad}px;
            --ks-w:      ${CFG.panelWidth}px;
            --ks-z:      ${CFG.zIndex};
        }

        /* ── MASTER PANEL ── */
        #ks2-master {
            position: fixed !important;
            ${CFG.panelPos === 'bottom-right' ? 'bottom:0;right:0;' :
              CFG.panelPos === 'bottom-left' ? 'bottom:0;left:0;' :
              CFG.panelPos === 'top-right' ? 'top:0;right:0;' : 'top:0;left:0;'}
            width: var(--ks-w) !important;
            min-width: var(--ks-w) !important;
            max-height: 92vh;
            background: var(--ks-bg) !important;
            backdrop-filter: blur(${CFG.blurAmt}px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(${CFG.blurAmt}px) saturate(180%) !important;
            border: 1px solid var(--ks-border2) !important;
            border-bottom: none !important;
            border-radius: var(--ks-rad) var(--ks-rad) 0 0 !important;
            box-shadow: -4px -4px 40px ${TC}22, 0 0 0 1px ${TC}11 !important;
            z-index: var(--ks-z) !important;
            font-family: var(--ks-font) !important;
            color: var(--ks-text) !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            transition: transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.3s !important;
            user-select: none !important;
        }
        #ks2-master.ks2-collapsed { transform: translateY(calc(100% - 36px)) !important; }
        #ks2-master.ks2-hidden    { transform: translateY(100%) !important; }

        /* ── HEADER ── */
        #ks2-header {
            display: flex; align-items: center; gap: 8px;
            padding: 0 10px;
            height: 36px; min-height: 36px;
            background: var(--ks-bg2);
            border-bottom: 1px solid var(--ks-border2);
            cursor: grab;
            flex-shrink: 0;
        }
        #ks2-header:active { cursor: grabbing; }

        .ks2-logo-mark {
            width: 20px; height: 20px;
            background: var(--ks-tc);
            border-radius: 4px;
            display: flex; align-items: center; justify-content: center;
            font-family: var(--ks-mono); font-size: 8px; font-weight: 600;
            color: #000; letter-spacing: -0.5px; flex-shrink:0;
        }
        .ks2-logo-text {
            font-size: 11px; font-weight: 800;
            letter-spacing: 2.5px; text-transform: uppercase;
            color: var(--ks-text);
        }
        .ks2-logo-ver {
            font-family: var(--ks-mono); font-size: 9px;
            color: var(--ks-muted); margin-left: 2px;
        }
        .ks2-hdr-spacer { flex: 1; }
        .ks2-hdr-btn {
            width: 22px; height: 22px;
            background: var(--ks-border);
            border: 1px solid var(--ks-border2);
            border-radius: 4px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; flex-shrink: 0;
            font-size: 11px; color: var(--ks-muted);
            transition: all 0.15s;
        }
        .ks2-hdr-btn:hover { background: var(--ks-border2); color: var(--ks-text); }

        /* ── TAB NAV ── */
        #ks2-tabs {
            display: flex; overflow-x: auto; flex-shrink: 0;
            background: var(--ks-bg2);
            border-bottom: 1px solid var(--ks-border);
            scrollbar-width: none;
        }
        #ks2-tabs::-webkit-scrollbar { display: none; }

        .ks2-tab {
            flex-shrink: 0;
            padding: 0 11px;
            height: 30px;
            display: flex; align-items: center; gap: 5px;
            font-size: 10px; font-weight: 700;
            letter-spacing: 0.8px; text-transform: uppercase;
            color: var(--ks-muted);
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.15s;
            white-space: nowrap;
        }
        .ks2-tab:hover { color: var(--ks-text); }
        .ks2-tab.active {
            color: var(--ks-tc);
            border-bottom-color: var(--ks-tc);
        }
        .ks2-tab-dot {
            width: 5px; height: 5px; border-radius: 50%;
            background: var(--ks-muted); flex-shrink:0;
        }
        .ks2-tab.active .ks2-tab-dot { background: var(--ks-tc); box-shadow: 0 0 5px var(--ks-tc); }
        .ks2-tab-on .ks2-tab-dot { background: var(--ks-green) !important; }

        /* ── CONTENT ── */
        #ks2-content {
            flex: 1; overflow-y: auto; overflow-x: hidden;
            padding: 10px;
            display: flex; flex-direction: column; gap: 8px;
            scrollbar-width: thin;
            scrollbar-color: var(--ks-border2) transparent;
        }
        #ks2-content::-webkit-scrollbar { width: 3px; }
        #ks2-content::-webkit-scrollbar-thumb { background: var(--ks-border2); border-radius: 2px; }

        /* ── PANELS ── */
        .ks2-panel { display: none; flex-direction: column; gap: 8px; }
        .ks2-panel.active { display: flex; }

        /* ── SECTION TITLE ── */
        .ks2-sec {
            font-size: 9px; font-weight: 700;
            letter-spacing: 2px; text-transform: uppercase;
            color: var(--ks-muted);
            display: flex; align-items: center; gap: 6px;
            margin: 2px 0;
        }
        .ks2-sec::before {
            content:''; display:inline-block;
            width:2px; height:10px; border-radius:1px;
            background: var(--ks-tc);
        }
        .ks2-sec.green::before { background: var(--ks-green); }
        .ks2-sec.amber::before { background: var(--ks-amber); }
        .ks2-sec.red::before   { background: var(--ks-red); }

        /* ── CARDS ── */
        .ks2-card {
            background: var(--ks-bg2);
            border: 1px solid var(--ks-border);
            border-radius: var(--ks-rad);
            padding: 9px 10px;
            position: relative; overflow: hidden;
            transition: border-color 0.15s;
        }
        .ks2-card::before {
            content:''; position:absolute; top:0; left:0; right:0;
            height: 2px; background: var(--ks-border2);
            transition: background 0.2s;
        }
        .ks2-card.on::before   { background: var(--ks-green); }
        .ks2-card.on           { border-color: ${TC}33; }
        .ks2-card.danger::before { background: var(--ks-red); }
        .ks2-card:hover        { border-color: var(--ks-border2); }

        .ks2-card-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .ks2-card-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }

        .ks2-card-title {
            font-size: 11px; font-weight: 700;
            color: var(--ks-text); margin-bottom: 2px;
            line-height: 1.3;
        }
        .ks2-card-desc {
            font-size: 10px; color: var(--ks-muted);
            line-height: 1.4;
        }
        .ks2-card-row {
            display: flex; align-items: center;
            justify-content: space-between;
            margin-top: 8px;
        }

        /* ── TOGGLE ── */
        .ks2-toggle { position: relative; width: 28px; height: 15px; flex-shrink:0; }
        .ks2-toggle input { opacity:0; width:0; height:0; }
        .ks2-toggle-sl {
            position: absolute; inset: 0;
            background: var(--ks-bg3);
            border: 1px solid var(--ks-border2);
            border-radius: 8px; cursor: pointer;
            transition: all 0.2s;
        }
        .ks2-toggle-sl::after {
            content:''; position:absolute;
            top:2px; left:2px;
            width:9px; height:9px; border-radius:50%;
            background: var(--ks-muted);
            transition: all 0.2s;
        }
        .ks2-toggle input:checked + .ks2-toggle-sl {
            background: ${TC}22; border-color: var(--ks-green);
        }
        .ks2-toggle input:checked + .ks2-toggle-sl::after {
            transform: translateX(13px);
            background: var(--ks-green);
            box-shadow: 0 0 5px var(--ks-green);
        }

        /* ── BADGE / TAG ── */
        .ks2-tag {
            font-family: var(--ks-mono); font-size: 8px; font-weight: 600;
            padding: 2px 5px; border-radius: 3px;
            letter-spacing: 0.5px; text-transform: uppercase;
            border: 1px solid transparent;
        }
        .ks2-tag-on  { background:${TC}18; color:var(--ks-tc); border-color:${TC}33; }
        .ks2-tag-off { background:rgba(255,255,255,0.04); color:var(--ks-muted); border-color:var(--ks-border); }
        .ks2-tag-warn{ background:rgba(255,184,48,.1); color:var(--ks-amber); border-color:rgba(255,184,48,.2); }
        .ks2-tag-ok  { background:rgba(0,232,122,.1); color:var(--ks-green); border-color:rgba(0,232,122,.2); }
        .ks2-tag-err { background:rgba(255,77,106,.1); color:var(--ks-red); border-color:rgba(255,77,106,.2); }

        /* ── STATS ── */
        .ks2-stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; }
        .ks2-stat {
            background: var(--ks-bg2);
            border: 1px solid var(--ks-border);
            border-radius: var(--ks-rad);
            padding: 8px 10px;
        }
        .ks2-stat-val {
            font-family: var(--ks-mono); font-size: 20px; font-weight: 600;
            line-height: 1; margin-bottom: 3px;
        }
        .ks2-stat-lbl {
            font-size: 8px; color: var(--ks-muted);
            text-transform: uppercase; letter-spacing: 1px;
        }
        .ks2-stat-bar {
            height: 2px; border-radius:1px;
            background: var(--ks-bg3); margin-top:5px; overflow:hidden;
        }
        .ks2-stat-fill { height:100%; border-radius:1px; }

        /* ── SITE ROWS ── */
        .ks2-site-row {
            background: var(--ks-bg2);
            border: 1px solid var(--ks-border);
            border-radius: var(--ks-rad);
            padding: 7px 10px;
            display: flex; align-items: center; gap: 8px;
            font-size: 11px;
            transition: border-color 0.15s;
        }
        .ks2-site-row:hover { border-color: var(--ks-border2); }
        .ks2-site-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .ks2-site-name { font-weight: 700; flex:1; }
        .ks2-site-url  { font-family:var(--ks-mono); font-size:9px; color:var(--ks-muted); flex:1.8; }

        /* ── LOG ── */
        #ks2-log-list { display:flex; flex-direction:column; gap:2px; }
        .ks2-log-row {
            display:flex; align-items:center; gap:6px;
            padding: 3px 0;
            border-bottom: 1px solid var(--ks-border);
            font-family: var(--ks-mono); font-size:9px;
        }
        .ks2-log-row:last-child { border:none; }
        .ks2-log-time { color: var(--ks-muted); flex-shrink:0; min-width:54px; }
        .ks2-log-tag {
            font-size: 8px; font-weight:600;
            padding:1px 4px; border-radius:2px;
            border: 1px solid transparent;
            flex-shrink:0; min-width:38px; text-align:center;
        }
        .ks2-log-msg { color: var(--ks-text); flex:1; line-height:1.4; }

        /* ── BUTTONS ── */
        .ks2-btn {
            background: var(--ks-bg3);
            border: 1px solid var(--ks-border2);
            border-radius: var(--ks-rad);
            padding: 5px 10px;
            color: var(--ks-text);
            font-family: var(--ks-font); font-size: 10px; font-weight: 700;
            cursor: pointer; letter-spacing: 0.5px;
            transition: all 0.15s; text-transform: uppercase; white-space:nowrap;
        }
        .ks2-btn:hover { background: var(--ks-border2); }
        .ks2-btn:active { transform: scale(0.96); }
        .ks2-btn-tc {
            background: var(--ks-tc); border-color: var(--ks-tc); color: #000 !important;
        }
        .ks2-btn-tc:hover { filter: brightness(1.1); }
        .ks2-btn-red {
            background: rgba(255,77,106,0.1); border-color: rgba(255,77,106,.3); color: var(--ks-red) !important;
        }
        .ks2-btn-red:hover { background: rgba(255,77,106,.2); }
        .ks2-btn-row { display:flex; gap:5px; flex-wrap:wrap; align-items:center; }

        /* ── INPUTS ── */
        .ks2-input {
            background: var(--ks-bg2);
            border: 1px solid var(--ks-border2);
            border-radius: var(--ks-rad);
            padding: 5px 8px;
            color: var(--ks-text);
            font-family: var(--ks-mono); font-size: 10px;
            outline: none; flex:1;
            transition: border-color 0.15s;
        }
        .ks2-input:focus { border-color: var(--ks-tc); }

        .ks2-select {
            background: var(--ks-bg2);
            border: 1px solid var(--ks-border2);
            border-radius: var(--ks-rad);
            padding: 5px 8px;
            color: var(--ks-text);
            font-family: var(--ks-mono); font-size: 10px;
            outline: none; cursor: pointer;
        }

        .ks2-range { width:100%; accent-color: var(--ks-tc); }

        /* ── TEXTAREA ── */
        .ks2-textarea {
            background: var(--ks-bg2);
            border: 1px solid var(--ks-border2);
            border-radius: var(--ks-rad);
            padding: 6px 8px; color: var(--ks-text);
            font-family: var(--ks-mono); font-size: 10px;
            resize: vertical; outline: none; width: 100%;
            min-height: 60px; transition: border-color 0.15s; line-height:1.5;
        }
        .ks2-textarea:focus { border-color: var(--ks-tc); }

        /* ── INFO / WARN BOXES ── */
        .ks2-infobox {
            background: ${TC}0a;
            border: 1px solid ${TC}22;
            border-radius: var(--ks-rad);
            padding: 8px 10px; font-size: 10px;
            color: var(--ks-tc); line-height: 1.5;
        }
        .ks2-warnbox {
            background: rgba(255,184,48,.06);
            border: 1px solid rgba(255,184,48,.2);
            border-radius: var(--ks-rad);
            padding: 8px 10px; font-size: 10px;
            color: var(--ks-amber); line-height: 1.5;
        }

        /* ── TEMA SWATCHes ── */
        .ks2-swatch-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:5px; }
        .ks2-swatch {
            height: 26px; border-radius: 5px;
            cursor: pointer; border: 2px solid transparent;
            transition: all 0.15s; position:relative; overflow:hidden;
        }
        .ks2-swatch:hover { transform: scale(1.1); }
        .ks2-swatch.sel  { border-color: rgba(255,255,255,0.7); }

        /* ── SHORTCUT ROWS ── */
        .ks2-shortcut {
            display:flex; align-items:center; justify-content:space-between;
            padding: 5px 0; border-bottom: 1px solid var(--ks-border);
            font-size: 10px; color: var(--ks-text);
        }
        .ks2-shortcut:last-child { border:none; }
        .ks2-kbd {
            background: var(--ks-bg3); border:1px solid var(--ks-border2);
            border-bottom: 2px solid var(--ks-border2);
            border-radius: 3px; padding: 1px 6px;
            font-family: var(--ks-mono); font-size: 9px; color: var(--ks-muted);
        }

        /* ── FOOTER ── */
        #ks2-footer {
            background: var(--ks-bg2);
            border-top: 1px solid var(--ks-border);
            padding: 6px 10px;
            display: flex; align-items: center; justify-content: space-between;
            flex-shrink: 0; gap: 6px;
        }
        #ks2-save-status {
            font-family: var(--ks-mono); font-size: 9px; color: var(--ks-muted);
        }

        /* ── DIVIDER ── */
        .ks2-hr { height:1px; background:var(--ks-border); margin:2px 0; }

        /* ── PANEL STATUS BAR (küçük alt HUD) ── */
        #ks2-hud {
            position: fixed !important;
            bottom: 0 !important; right: 0 !important;
            display: flex; align-items: center; gap: 6px;
            padding: 3px 10px;
            background: rgba(10,10,14,0.88);
            backdrop-filter: blur(12px);
            border-top: 1px solid var(--ks-border2);
            border-left: 1px solid var(--ks-border2);
            border-radius: var(--ks-rad) 0 0 0;
            z-index: ${CFG.zIndex + 1} !important;
            font-family: var(--ks-mono); font-size: 10px;
            color: var(--ks-muted);
            cursor: pointer;
            box-shadow: 0 0 20px ${TC}22;
            border-top: 2px solid var(--ks-tc);
            transition: all 0.3s;
            animation: ks2-glow 3s ease-in-out infinite;
        }
        #ks2-hud:hover { color: var(--ks-text); background: rgba(16,16,22,0.96); }
        #ks2-hud-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: var(--ks-green); flex-shrink:0;
            animation: ks2-blink 2s ease-in-out infinite;
        }
        @keyframes ks2-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes ks2-glow  { 0%,100%{box-shadow:0 0 12px ${TC}22} 50%{box-shadow:0 0 22px ${TC}44} }

        @media print {
            #ks2-master, #ks2-hud { display: none !important; }
        }
    `);

    /* ═══════════════════════════════════════════════════════════
       4. PANEL HTML — MERKEZ KONTROL PANELI
    ═══════════════════════════════════════════════════════════ */
    function buildPanelHTML() {
        /* Modül kart helper */
        const modCard = (key, icon, title, desc, on) => `
            <div class="ks2-card ${on?'on':''}" id="ks2-card-${key}">
                <div style="font-size:14px;margin-bottom:6px">${icon}</div>
                <div class="ks2-card-title">${title}</div>
                <div class="ks2-card-desc">${desc}</div>
                <div class="ks2-card-row">
                    <span class="ks2-tag ${on?'ks2-tag-ok':'ks2-tag-off'}" id="ks2-tag-${key}">${on?'AKTİF':'KAPALI'}</span>
                    <label class="ks2-toggle">
                        <input type="checkbox" data-key="${key}" ${on?'checked':''} onchange="KS2.toggleModule(this)">
                        <span class="ks2-toggle-sl"></span>
                    </label>
                </div>
            </div>`;

        /* Sub-toggle satırı helper */
        const subRow = (key, label, on) => `
            <div class="ks2-card" style="padding:7px 10px" id="ks2-card-${key}">
                <div style="display:flex;align-items:center;justify-content:space-between">
                    <span class="ks2-card-title" style="margin:0;font-size:10px">${label}</span>
                    <div style="display:flex;align-items:center;gap:6px">
                        <span class="ks2-tag ${on?'ks2-tag-ok':'ks2-tag-off'}" id="ks2-tag-${key}">${on?'ON':'OFF'}</span>
                        <label class="ks2-toggle">
                            <input type="checkbox" data-key="${key}" ${on?'checked':''} onchange="KS2.toggleModule(this)">
                            <span class="ks2-toggle-sl"></span>
                        </label>
                    </div>
                </div>
            </div>`;

        return `
        <div id="ks2-master" class="${CFG.system ? '' : 'ks2-collapsed'}">

            <!-- HEADER -->
            <div id="ks2-header">
                <div class="ks2-logo-mark">KS</div>
                <span class="ks2-logo-text">KS TOOLS</span>
                <span class="ks2-logo-ver">v2.0</span>
                <div class="ks2-hdr-spacer"></div>
                <div class="ks2-hdr-btn" id="ks2-lock-btn" title="Kilit Aç/Kapat">🔒</div>
                <div class="ks2-hdr-btn" id="ks2-collapse-btn" title="Küçült">▼</div>
            </div>

            <!-- TABS -->
            <div id="ks2-tabs">
                <div class="ks2-tab active" data-tab="dashboard">
                    <div class="ks2-tab-dot"></div>Panel
                </div>
                <div class="ks2-tab ${CFG.system?'ks2-tab-on':''}" data-tab="modules">
                    <div class="ks2-tab-dot"></div>Modüller
                </div>
                <div class="ks2-tab" data-tab="giris">
                    <div class="ks2-tab-dot"></div>Giriş
                </div>
                <div class="ks2-tab" data-tab="tema">
                    <div class="ks2-tab-dot"></div>Tema
                </div>
                <div class="ks2-tab" data-tab="kisayol">
                    <div class="ks2-tab-dot"></div>Kısayol
                </div>
                <div class="ks2-tab" data-tab="log">
                    <div class="ks2-tab-dot"></div>Log
                </div>
            </div>

            <!-- CONTENT -->
            <div id="ks2-content">

                <!-- ── DASHBOARD ── -->
                <div class="ks2-panel active" id="ks2-panel-dashboard">
                    <div class="ks2-stat-grid">
                        <div class="ks2-stat">
                            <div class="ks2-stat-val" id="ks2-st-aktif" style="color:var(--ks-green)">0</div>
                            <div class="ks2-stat-lbl">Aktif</div>
                            <div class="ks2-stat-bar"><div class="ks2-stat-fill" id="ks2-sf-aktif" style="background:var(--ks-green)"></div></div>
                        </div>
                        <div class="ks2-stat">
                            <div class="ks2-stat-val" style="color:var(--ks-tc)">14</div>
                            <div class="ks2-stat-lbl">Toplam</div>
                            <div class="ks2-stat-bar"><div class="ks2-stat-fill" style="width:100%;background:var(--ks-tc)"></div></div>
                        </div>
                        <div class="ks2-stat">
                            <div class="ks2-stat-val" style="color:var(--ks-amber)">7</div>
                            <div class="ks2-stat-lbl">Site</div>
                            <div class="ks2-stat-bar"><div class="ks2-stat-fill" style="width:100%;background:var(--ks-amber)"></div></div>
                        </div>
                        <div class="ks2-stat">
                            <div class="ks2-stat-val" style="color:var(--ks-muted);font-size:14px">2.0</div>
                            <div class="ks2-stat-lbl">Versiyon</div>
                            <div class="ks2-stat-bar"><div class="ks2-stat-fill" style="width:100%;background:var(--ks-muted)"></div></div>
                        </div>
                    </div>

                    <div class="ks2-sec">Sistem Durumu</div>

                    <div class="ks2-card" style="display:flex;align-items:center;gap:10px;padding:9px 11px">
                        <div id="ks2-sys-dot" style="width:8px;height:8px;border-radius:50%;background:${CFG.system?'var(--ks-green)':'var(--ks-red)'};flex-shrink:0;box-shadow:0 0 8px ${CFG.system?'var(--ks-green)':'var(--ks-red)'}"></div>
                        <div style="flex:1">
                            <div class="ks2-card-title" style="margin:0" id="ks2-sys-txt">${CFG.system?'Sistem Aktif':'Sistem Kapalı'}</div>
                            <div class="ks2-card-desc" id="ks2-ip-txt">IP alınıyor...</div>
                        </div>
                        <label class="ks2-toggle">
                            <input type="checkbox" id="ks2-sys-toggle" ${CFG.system?'checked':''} onchange="KS2.toggleSystem(this)">
                            <span class="ks2-toggle-sl"></span>
                        </label>
                    </div>

                    <div class="ks2-card" style="display:flex;align-items:center;gap:10px;padding:9px 11px">
                        <span style="font-size:14px">🔓</span>
                        <div style="flex:1">
                            <div class="ks2-card-title" style="margin:0">Kilit Açıcı</div>
                            <div class="ks2-card-desc">Disabled / readonly alanları açar</div>
                        </div>
                        <label class="ks2-toggle">
                            <input type="checkbox" id="ks2-unlock-toggle" onchange="KS2.toggleUnlock(this)">
                            <span class="ks2-toggle-sl"></span>
                        </label>
                    </div>

                    <div class="ks2-sec">Aktif Tema Rengi</div>

                    <div class="ks2-site-row">
                        <div class="ks2-site-dot" style="background:${TC}"></div>
                        <span class="ks2-site-name" id="ks2-site-name">Algılanıyor...</span>
                        <span class="ks2-site-url" id="ks2-site-url">${location.hostname}</span>
                        <span class="ks2-tag ks2-tag-ok">AKTİF</span>
                    </div>

                    <div class="ks2-sec green">Son Aktivite</div>

                    <div class="ks2-card" style="padding:8px 10px">
                        <div id="ks2-log-mini"></div>
                    </div>
                </div>

                <!-- ── MODÜLLER ── -->
                <div class="ks2-panel" id="ks2-panel-modules">
                    <div style="display:flex;align-items:center;justify-content:space-between">
                        <div class="ks2-sec">Otoanaliz</div>
                        <div class="ks2-btn-row">
                            <button class="ks2-btn" onclick="KS2.bulkToggle('oto',true)">Tümünü Aç</button>
                            <button class="ks2-btn" onclick="KS2.bulkToggle('oto',false)">Kapat</button>
                        </div>
                    </div>
                    <div class="ks2-card-grid-2" id="ks2-oto-grid">
                        ${modCard('KS_PANEL','📊','Giriş Kontrol','Poliçe, rücu, pert, piyasa',CFG.panel)}
                        ${modCard('KS_PANEL_hlt','🔦','Hücre Boyama','Boş alanları renklendirir',CFG.panel_hlt)}
                        ${modCard('KS_MANU','🔧','Manuel Parça','Tekli/çoklu parça girişi',CFG.manuel)}
                        ${modCard('KS_REF','📋','Referans Panel','Excel copy/paste desteği',CFG.referans)}
                        ${modCard('KS_DNM','⚙️','Donanım Girişi','Araç donanım eşleme',CFG.donanim)}
                        ${modCard('KS_IMG','🖼️','Resim Yükleme','Toplu evrak kategorisi',CFG.resim)}
                    </div>
                    <div class="ks2-hr"></div>
                    <div style="display:flex;align-items:center;justify-content:space-between">
                        <div class="ks2-sec">Entegrasyonlar</div>
                        <div class="ks2-btn-row">
                            <button class="ks2-btn" onclick="KS2.bulkToggle('ext',true)">Tümünü Aç</button>
                            <button class="ks2-btn" onclick="KS2.bulkToggle('ext',false)">Kapat</button>
                        </div>
                    </div>
                    <div class="ks2-card-grid-2" id="ks2-ext-grid">
                        ${modCard('KS_SBM','🏦','SBM Panel','Tramer bölme, KTT sorgu',CFG.sbm)}
                        ${modCard('KS_SAHIB','🏷️','Sahibinden','KM/Fiyat piyasa analizi',CFG.sahibinden)}
                        ${modCard('KS_WP','💬','WhatsApp','Medya çift tık indir',CFG.whatsapp)}
                        ${modCard('KS_TRS','🛡️','Türkiye Sig.','Yan menü + form otomasyonu',CFG.trsigorta)}
                        ${modCard('KS_NTF','🔕','Bildirim Engel','Tekrarlı popup bloğu',CFG.bildirim)}
                    </div>
                </div>

                <!-- ── GİRİŞ KONTROL ALT MODÜLLERİ ── -->
                <div class="ks2-panel" id="ks2-panel-giris">
                    <div class="ks2-infobox">
                        Giriş Kontrol Paneli açık olduğunda aşağıdaki alt modüller devreye girer.
                        <strong>KS_PANEL</strong> önce aktif edilmelidir.
                    </div>
                    ${subRow('KS_PANEL_pol','Poliçe Kontrol — Vade analizi, risk badge',CFG.panel_pol)}
                    ${subRow('KS_PANEL_sgs','Sigorta Şekli — Trafik/Kasko göstergesi',CFG.panel_sgs)}
                    ${subRow('KS_PANEL_rc','Rücu Takibi — Durum badge',CFG.panel_rc)}
                    ${subRow('KS_PANEL_pert','Pert Kontrolü — %60+ uyarı + progress',CFG.panel_pert)}
                    ${subRow('KS_PANEL_hsr','Hasar Şekli — İhbar türü badge',CFG.panel_hsr)}
                    ${subRow('KS_PANEL_srtp','Servis Tipi — Yetkili/anlaşmalı badge',CFG.panel_srtp)}
                    ${subRow('KS_PANEL_srad','Servis Adı',CFG.panel_srad)}
                    ${subRow('KS_PANEL_tra','Tramer No — 3\'lü gruplama',CFG.panel_tra)}
                    ${subRow('KS_PANEL_sad','Sigortalı/Mağdur Adı',CFG.panel_sad)}
                    ${subRow('KS_PANEL_aad','Araç Adı',CFG.panel_aad)}
                    ${subRow('KS_PANEL_mull','Muallak Göstergesi',CFG.panel_mull)}
                    ${subRow('KS_PANEL_ryc','Rayiç / Piyasa Değeri',CFG.panel_ryc)}
                    ${subRow('KS_PANEL_rycorn','Pert Oranı + Progress Bar',CFG.panel_rycorn)}
                    ${subRow('KS_PANEL_pys','Piyasa Kontrol — Sahibinden sorgulama',CFG.panel_pys)}
                    ${subRow('KS_PANEL_not','Notlar — Otomatik kayıt',CFG.panel_not)}
                </div>

                <!-- ── TEMA ── -->
                <div class="ks2-panel" id="ks2-panel-tema">
                    <div class="ks2-sec">Firma Renkleri</div>
                    <div class="ks2-swatch-grid" id="ks2-swatch-grid">
                        ${[
                            ['#1cb2cd','Türkiye Sig.'],
                            ['#e00d26','Mapfre'],
                            ['#005596','Atlas'],
                            ['#eb5311','Aksigorta'],
                            ['#164481','Allianz'],
                            ['#007a33','Groupama'],
                            ['#00008f','AXA'],
                            ['#e20613','Sompo'],
                            ['#04b03d','Bereket'],
                            ['#d1a401','Quick'],
                            ['#ed1c24','Ray'],
                            ['#55ac05','Hepiyi'],
                        ].map(([c,n])=>`<div class="ks2-swatch${TC===c?' sel':''}" style="background:${c}" title="${n}" onclick="KS2.setSwatch(this,'${c}')"></div>`).join('')}
                    </div>

                    <div class="ks2-sec" style="margin-top:4px">Özel Renk</div>
                    <div class="ks2-btn-row">
                        <input type="color" id="ks2-color-pick" value="${TC}" style="width:32px;height:28px;border:1px solid var(--ks-border2);border-radius:var(--ks-rad);cursor:pointer;padding:2px;background:var(--ks-bg2)">
                        <input class="ks2-input" id="ks2-color-hex" value="${TC}" placeholder="#hex">
                        <button class="ks2-btn ks2-btn-tc" onclick="KS2.applyCustomColor()">Uygula</button>
                    </div>

                    <div class="ks2-sec" style="margin-top:4px">Panel Ayarları</div>
                    <div class="ks2-card" style="display:flex;flex-direction:column;gap:10px">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                            <span class="ks2-card-desc" style="min-width:80px">Genişlik</span>
                            <input type="range" class="ks2-range" min="220" max="420" value="${CFG.panelWidth}" id="ks2-r-width"
                                oninput="document.getElementById('ks2-v-width').textContent=this.value+'px'">
                            <span id="ks2-v-width" style="font-family:var(--ks-mono);font-size:9px;color:var(--ks-tc);min-width:36px">${CFG.panelWidth}px</span>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                            <span class="ks2-card-desc" style="min-width:80px">Blur</span>
                            <input type="range" class="ks2-range" min="0" max="30" value="${CFG.blurAmt}" id="ks2-r-blur"
                                oninput="document.getElementById('ks2-v-blur').textContent=this.value+'px'">
                            <span id="ks2-v-blur" style="font-family:var(--ks-mono);font-size:9px;color:var(--ks-tc);min-width:36px">${CFG.blurAmt}px</span>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                            <span class="ks2-card-desc" style="min-width:80px">Köşe</span>
                            <input type="range" class="ks2-range" min="0" max="16" value="${CFG.borderRad}" id="ks2-r-rad"
                                oninput="document.getElementById('ks2-v-rad').textContent=this.value+'px'">
                            <span id="ks2-v-rad" style="font-family:var(--ks-mono);font-size:9px;color:var(--ks-tc);min-width:36px">${CFG.borderRad}px</span>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                            <span class="ks2-card-desc" style="min-width:80px">Pozisyon</span>
                            <select class="ks2-select" id="ks2-pos-sel" style="flex:1">
                                <option value="bottom-right" ${CFG.panelPos==='bottom-right'?'selected':''}>Sağ Alt</option>
                                <option value="bottom-left"  ${CFG.panelPos==='bottom-left' ?'selected':''}>Sol Alt</option>
                                <option value="top-right" ${CFG.panelPos==='top-right' ?'selected':''}>Sağ Üst</option>
                                <option value="top-left" ${CFG.panelPos==='top-left' ?'selected':''}>Sol Üst</option>
                            </select>
                        </div>
                    </div>
                    <div class="ks2-infobox">Değişiklikler "Kaydet" sonrası sayfa yenilenmesiyle geçerli olur.</div>
                </div>

                <!-- ── KISAYOLLAR ── -->
                <div class="ks2-panel" id="ks2-panel-kisayol">
                    <div class="ks2-sec">Aktif Kısayollar</div>
                    <div class="ks2-card">
                        <div class="ks2-shortcut">
                            <span>Ön Giriş Otomasyonu</span><span class="ks2-kbd">F4</span>
                        </div>
                        <div class="ks2-shortcut">
                            <span>Hızlı Kaydet</span><span class="ks2-kbd">F2</span>
                        </div>
                        <div class="ks2-shortcut">
                            <span>Yılan Oyunu Başlat</span><span class="ks2-kbd">Numpad 1</span>
                        </div>
                        <div class="ks2-shortcut">
                            <span>Yılan Oyunu Duraklat</span><span class="ks2-kbd">Numpad 0</span>
                        </div>
                        <div class="ks2-shortcut">
                            <span>Yön Tuşları (Oyun)</span><span class="ks2-kbd">← ↑ → ↓</span>
                        </div>
                    </div>
                    <div class="ks2-warnbox">
                        Kısayol değişiklikleri sadece aktif sekmelere yansır. Yeni sekmelerde sayfa yenilenmesi gerekir.
                    </div>
                </div>

                <!-- ── LOG ── -->
                <div class="ks2-panel" id="ks2-panel-log">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
                        <div class="ks2-sec">Sistem Logu</div>
                        <div class="ks2-btn-row">
                            <select class="ks2-select" id="ks2-log-filter" onchange="KS2.filterLog()">
                                <option value="all">Tümü</option>
                                <option value="ok">TAMAM</option>
                                <option value="warn">UYARI</option>
                                <option value="err">HATA</option>
                                <option value="info">BİLGİ</option>
                            </select>
                            <button class="ks2-btn ks2-btn-red" onclick="KS2.clearLog()">Temizle</button>
                        </div>
                    </div>
                    <div class="ks2-card" style="padding:8px 10px;max-height:260px;overflow-y:auto">
                        <div id="ks2-log-list"></div>
                    </div>
                    <button class="ks2-btn" style="width:100%" onclick="KS2.copyLog()">📋 Logu Kopyala</button>
                </div>

            </div><!-- /content -->

            <!-- FOOTER -->
            <div id="ks2-footer">
                <span id="ks2-save-status">● Değişiklik yok</span>
                <div class="ks2-btn-row">
                    <button class="ks2-btn ks2-btn-red" onclick="KS2.resetAll()">Sıfırla</button>
                    <button class="ks2-btn ks2-btn-tc" onclick="KS2.saveAll()">Kaydet</button>
                </div>
            </div>
        </div>

        <!-- MINI HUD -->
        <div id="ks2-hud" onclick="KS2.togglePanel()">
            <div id="ks2-hud-dot"></div>
            <span id="ks2-hud-text">KS TOOLS</span>
        </div>`;
    }

    /* ═══════════════════════════════════════════════════════════
       5. PANEL CONTROLLER — KS2 NAMESPACE
    ═══════════════════════════════════════════════════════════ */
    unsafeWindow.KS2 = {
        _unsaved: false,
        _unlocked: false,
        _panelOpen: CFG.system,

        /* --- Init --- */
        init() {
            const wrap = document.createElement('div');
            wrap.innerHTML = buildPanelHTML();
            document.body.appendChild(wrap.firstElementChild); // master
            document.body.appendChild(wrap.lastElementChild); // hud

            this._bindTabs();
            this._bindDrag();
            this._bindCollapseBtn();
            this._bindLockBtn();
            this._bindColorPicker();
            this._fetchIP();
            this._detectSite();
            this._updateStats();
            this._refreshMiniLog();

            KSLog.ok('KS TOOLS v2.0 başlatıldı');
            KSLog.info(`Tema: ${TC}`);
        },

        /* --- Tab switching --- */
        _bindTabs() {
            document.querySelectorAll('.ks2-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.ks2-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.ks2-panel').forEach(p => p.classList.remove('active'));
                    tab.classList.add('active');
                    const panel = document.getElementById('ks2-panel-' + tab.dataset.tab);
                    if (panel) panel.classList.add('active');
                    if (tab.dataset.tab === 'log') { KSLog.refresh(); }
                });
            });
        },

        /* --- Drag --- */
        _bindDrag() {
            const header = document.getElementById('ks2-header');
            const master = document.getElementById('ks2-master');
            let dragging = false, startX, startY, offX, offY, wasDragged = false;

            header.addEventListener('mousedown', e => {
                dragging = true; wasDragged = false;
                startX = e.clientX; startY = e.clientY;
                const rect = master.getBoundingClientRect();
                offX = e.clientX - rect.left;
                offY = e.clientY - rect.top;
                master.style.transition = 'none';
            });
            document.addEventListener('mousemove', e => {
                if (!dragging) return;
                if (Math.hypot(e.clientX-startX, e.clientY-startY) > 4) {
                    wasDragged = true;
                    master.style.left = (e.clientX - offX) + 'px';
                    master.style.top = (e.clientY - offY) + 'px';
                    master.style.right = 'auto';
                    master.style.bottom = 'auto';
                }
            });
            document.addEventListener('mouseup', () => {
                dragging = false;
                master.style.transition = '';
                setTimeout(() => { wasDragged = false; }, 100);
            });
            /* Double-click reset position */
            header.addEventListener('dblclick', () => {
                master.style.transition = 'all 0.4s cubic-bezier(.4,0,.2,1)';
                master.style.left = ''; master.style.top = '';
                master.style.right = '0'; master.style.bottom = '0';
                setTimeout(() => { master.style.transition = ''; }, 450);
            });
        },

        /* --- Collapse button --- */
        _bindCollapseBtn() {
            const btn = document.getElementById('ks2-collapse-btn');
            const master = document.getElementById('ks2-master');
            btn.addEventListener('click', () => {
                master.classList.toggle('ks2-collapsed');
                btn.textContent = master.classList.contains('ks2-collapsed') ? '▲' : '▼';
            });
        },

        /* --- Lock button (header) --- */
        _bindLockBtn() {
            document.getElementById('ks2-lock-btn').addEventListener('click', e => {
                e.stopPropagation();
                this._unlocked = !this._unlocked;
                document.getElementById('ks2-lock-btn').textContent = this._unlocked ? '🔓' : '🔒';
                const unlockToggle = document.getElementById('ks2-unlock-toggle');
                if (unlockToggle) unlockToggle.checked = this._unlocked;
                this.unlockAllElements(this._unlocked);
                KSLog.info('Kilit ' + (this._unlocked ? 'açıldı' : 'kapandı'));
            });
        },

        /* --- Color picker sync --- */
        _bindColorPicker() {
            const pick = document.getElementById('ks2-color-pick');
            const hex = document.getElementById('ks2-color-hex');
            if (pick) pick.addEventListener('input', () => { if (hex) hex.value = pick.value; });
        },

        /* --- IP fetch --- */
        _fetchIP() {
            GM_xmlhttpRequest({
                method: 'GET', url: 'https://api.ipify.org?format=json',
                onload: r => {
                    try {
                        const ip = JSON.parse(r.responseText).ip;
                        const el = document.getElementById('ks2-ip-txt');
                        const hud = document.getElementById('ks2-hud-text');
                        if (el) el.textContent = ip;
                        if (hud) hud.textContent = 'KS · ' + ip;
                        KSLog.ok('IP alındı — ' + ip);
                    } catch(e) { KSLog.warn('IP alınamadı'); }
                },
                onerror: () => { KSLog.warn('IP bağlantısı başarısız'); }
            });
        },

        /* --- Site detect --- */
        _detectSite() {
            const nameMap = {
                'turkiyesigorta': 'Türkiye Sigorta',
                'mapfre':  'Mapfre', 'atlas': 'Atlas',
                'akcozum2':'Aksigorta', 'allianz':'Allianz',
                'sompo':   'Sompo', 'groupama':'Groupama',
                'axa':     'AXA', 'quick':'Quick',
                'ray':     'Ray Sigorta', 'bereket':'Bereket',
                'hepiyi':  'Hepiyi', 'sbm':'SBM',
                'sahibinden':'Sahibinden', 'whatsapp':'WhatsApp',
            };
            const key = Object.keys(nameMap).find(k => url.includes(k)) || '';
            const nameEl = document.getElementById('ks2-site-name');
            if (nameEl) nameEl.textContent = nameMap[key] || location.hostname;
        },

        /* --- Stats update --- */
        _updateStats() {
            const keys = ['KS_PANEL','KS_PANEL_hlt','KS_MANU','KS_REF','KS_DNM',
                          'KS_IMG','KS_SBM','KS_SAHIB','KS_WP','KS_TRS','KS_NTF',
                          'KS_PANEL_pol','KS_PANEL_rc','KS_PANEL_pert'];
            const aktif = keys.filter(k => GM_getValue(k, false)).length;
            const el = document.getElementById('ks2-st-aktif');
            const bar = document.getElementById('ks2-sf-aktif');
            if (el) el.textContent = aktif;
            if (bar) bar.style.width = Math.round(aktif/14*100) + '%';
        },

        /* --- Mini log (dashboard) --- */
        _refreshMiniLog() {
            setInterval(() => {
                const el = document.getElementById('ks2-log-mini');
                if (!el) return;
                const all = KSLog.all().slice(-4).reverse();
                const clr = {ok:'var(--ks-green)',warn:'var(--ks-amber)',err:'var(--ks-red)',info:'var(--ks-tc)'};
                const lbl = {ok:'OK',warn:'!!',err:'ER',info:'--'};
                el.innerHTML = all.map(e =>
                    `<div style="display:flex;gap:6px;align-items:center;padding:2px 0;border-bottom:1px solid var(--ks-border);font-family:var(--ks-mono);font-size:9px">
                        <span style="color:var(--ks-muted);flex-shrink:0">${e.time}</span>
                        <span style="color:${clr[e.type]};flex-shrink:0;min-width:16px">${lbl[e.type]}</span>
                        <span style="color:var(--ks-text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.msg}</span>
                    </div>`
                ).join('');
            }, 2000);
        },

        /* --- Toggle panel visibility --- */
        togglePanel() {
            const master = document.getElementById('ks2-master');
            if (!master) return;
            if (master.classList.contains('ks2-hidden')) {
                master.classList.remove('ks2-hidden');
                master.classList.remove('ks2-collapsed');
            } else if (master.classList.contains('ks2-collapsed')) {
                master.classList.toggle('ks2-hidden');
            } else {
                master.classList.add('ks2-collapsed');
            }
        },

        /* --- Module toggle --- */
        toggleModule(input) {
            const key = input.dataset.key;
            const card = document.getElementById('ks2-card-' + key);
            const tag = document.getElementById('ks2-tag-' + key);
            const on = input.checked;
            if (card) { card.classList.toggle('on', on); }
            if (tag) { tag.textContent = on ? 'AKTİF' : 'KAPALI'; tag.className = 'ks2-tag ' + (on ? 'ks2-tag-ok' : 'ks2-tag-off'); }
            this._markUnsaved();
            KSLog.info((on?'Açıldı':'Kapatıldı') + ' — ' + key);
        },

        /* --- System master toggle --- */
        toggleSystem(input) {
            const dot = document.getElementById('ks2-sys-dot');
            const txt = document.getElementById('ks2-sys-txt');
            const on = input.checked;
            if (dot) { dot.style.background = on ? 'var(--ks-green)' : 'var(--ks-red)'; dot.style.boxShadow = on ? '0 0 8px var(--ks-green)' : '0 0 8px var(--ks-red)'; }
            if (txt) txt.textContent = on ? 'Sistem Aktif' : 'Sistem Kapalı';
            GM_setValue('KS_SYS', on);
            const modTab = document.querySelector('[data-tab="modules"]');
            if (modTab) modTab.classList.toggle('ks2-tab-on', on);
            KSLog.info('Sistem ' + (on ? 'aktifleştirildi' : 'devre dışı bırakıldı'));
        },

        /* --- Unlock toggle --- */
        toggleUnlock(input) {
            this._unlocked = input.checked;
            document.getElementById('ks2-lock-btn').textContent = this._unlocked ? '🔓' : '🔒';
            this.unlockAllElements(this._unlocked);
        },

        /* --- Bulk toggle --- */
        bulkToggle(group, state) {
            const gridId = group === 'oto' ? 'ks2-oto-grid' : 'ks2-ext-grid';
            const grid = document.getElementById(gridId);
            if (!grid) return;
            grid.querySelectorAll('input[type="checkbox"][data-key]').forEach(cb => {
                if (cb.checked !== state) { cb.checked = state; this.toggleModule(cb); }
            });
        },

        /* --- Unlock all elements --- */
        unlockAllElements(state) {
            const sel = '[disabled],.disabled,[readonly],[aria-readonly="true"],[aria-disabled="true"]';
            document.querySelectorAll(sel).forEach(el => {
                if (state) {
                    if (el.disabled) { el.dataset.wasDisabled = '1'; el.disabled = false; }
                    if (el.readOnly) { el.dataset.wasReadOnly = '1'; el.readOnly = false; el.removeAttribute('readonly'); }
                    el.style.setProperty('pointer-events','auto','important');
                    el.style.setProperty('opacity','1','important');
                    el.style.setProperty('background-color','#fff','important');
                    el.style.setProperty('cursor','text','important');
                } else {
                    if (el.dataset.wasDisabled) el.disabled = true;
                    if (el.dataset.wasReadOnly) { el.readOnly = true; el.setAttribute('readonly','true'); }
                    ['pointer-events','opacity','background-color','cursor'].forEach(p => el.style.removeProperty(p));
                }
            });
        },

        /* --- Theme swatch --- */
        setSwatch(el, color) {
            document.querySelectorAll('.ks2-swatch').forEach(s => s.classList.remove('sel'));
            el.classList.add('sel');
            const pick = document.getElementById('ks2-color-pick');
            const hex = document.getElementById('ks2-color-hex');
            if (pick) pick.value = color;
            if (hex) hex.value = color;
            this._markUnsaved();
        },

        /* --- Apply custom color --- */
        applyCustomColor() {
            const hex = document.getElementById('ks2-color-hex')?.value;
            if (hex) {
                const pick = document.getElementById('ks2-color-pick');
                if (pick) pick.value = hex;
                GM_setValue('KS_THEME_COLOR', hex);
                KSLog.info('Renk güncellendi — ' + hex);
                this._markUnsaved();
            }
        },

        /* --- Log --- */
        filterLog() { KSLog.refresh(); },
        clearLog() {
            const el = document.getElementById('ks2-log-list');
            if (el) el.innerHTML = '<div style="font-family:var(--ks-mono);font-size:9px;color:var(--ks-muted);padding:6px 0">— Log temizlendi —</div>';
        },
        copyLog() {
            const lines = KSLog.all().map(e => `[${e.time}] ${e.type.toUpperCase()} — ${e.msg}`).join('\n');
            navigator.clipboard.writeText(lines).catch(() => {});
        },

        /* --- Save / Reset --- */
        saveAll() {
            document.querySelectorAll('input[data-key]').forEach(cb => {
                GM_setValue(cb.dataset.key, cb.checked);
            });
            const w = document.getElementById('ks2-r-width')?.value;
            const b = document.getElementById('ks2-r-blur')?.value;
            const r = document.getElementById('ks2-r-rad')?.value;
            const p = document.getElementById('ks2-pos-sel')?.value;
            if (w) GM_setValue('KS_PANEL_WIDTH', parseInt(w));
            if (b) GM_setValue('KS_BLUR', parseInt(b));
            if (r) GM_setValue('KS_RADIUS', parseInt(r));
            if (p) GM_setValue('KS_POS', p);
            const st = document.getElementById('ks2-save-status');
            if (st) { st.textContent = '✓ Kaydedildi'; st.style.color = 'var(--ks-green)'; }
            setTimeout(() => {
                if (st) { st.textContent = '● Değişiklik yok'; st.style.color = ''; }
            }, 2000);
            this._unsaved = false;
            KSLog.ok('Ayarlar kaydedildi');
            if (confirm('Değişiklikler kaydedildi. Sayfa yenilensin mi?')) location.reload();
        },
        resetAll() {
            if (!confirm('Tüm ayarlar varsayılana dönsün mü?')) return;
            document.querySelectorAll('input[data-key]').forEach(cb => {
                cb.checked = false; this.toggleModule(cb);
            });
            KSLog.warn('Ayarlar sıfırlandı');
        },

        _markUnsaved() {
            this._unsaved = true;
            const st = document.getElementById('ks2-save-status');
            if (st) { st.textContent = '● Kaydedilmemiş değişiklik'; st.style.color = 'var(--ks-amber)'; }
        },
    };
    /* ═══════════════════════════════════════════════════════════
       7. MODÜL: DOSYA KONTROL PANELİ
    ═══════════════════════════════════════════════════════════ */
    if (CFG.system && CFG.panel && url.includes('otohasar') &&
        (url.includes('eks_hasar.php') || url.includes('eks_hasar_magdur.php'))) {

        KSLog.ok('Giriş Kontrol Paneli yüklendi');
        const isMagdur = url.includes('eks_hasar_magdur.php');
        const WARNING_COLOR = 'rgb(250,250,150)';
        const SUCCESS_COLOR = '#00ff88';

        /* --- Yardımcı --- */
        const $ = id => document.getElementById(id) || document.querySelector(`[name="${id}"]`);
        const gv = id => ($(id)?.value || $(id)?.textContent || '').trim();
        const pn = id => { const v = gv(id).replace(/,/g,''); return v===''?0:Number(v); };
        const gd = pfx => {
            const [g,a,y] = [gv(pfx+'_GUN'),gv(pfx+'_AY'),gv(pfx+'_YIL')];
            if (!g||!a||!y) return null;
            return new Date(y, a-1, g);
        };

        /* --- Panel içeriğini oluştur --- */
        const buildGirisPanel = () => {
            const wrap = document.getElementById('ks2-giris-panel');
            if (!wrap) return;
            const sigEl = $('SIGORTA_SEKLI');
            const isTraf = sigEl && sigEl.value === '1';
            let html = `<table style="width:100%;border-collapse:collapse;font-size:12px;color:#fff;line-height:1.3">`;

            /* Poliçe kontrolü */
            if (CFG.panel_pol && !isMagdur) {
                const hasar = gd('HASAR_TARIHI'), bas = gd('SB_POLICE_BAS'), bitis = gd('SB_POLICE_BITIS');
                if (hasar && bas && bitis) {
                    [hasar,bas,bitis].forEach(d=>d.setHours(0,0,0,0));
                    html += `<tr><td colspan="2" style="padding:6px 0;text-align:center">`;
                    if (hasar >= bas && hasar <= bitis) {
                        const dB = Math.floor((hasar-bas)/86400000);
                        const dBit = Math.floor((bitis-hasar)/86400000);
                        if (dB<=3) html += `<b style="color:#ff4444">🚨 KRİTİK — İlk ${dB} gün!</b>`;
                        else if (dB<=7) html += `<b style="color:${SUCCESS_COLOR}">✔ Poliçe İçinde</b><br><span style="color:#ffcc00">⚠ İlk hafta (${dB}. gün)</span>`;
                        else if (dBit<=7)html += `<b style="color:${SUCCESS_COLOR}">✔ Poliçe İçinde</b><br><span style="color:#ffcc00">⚠ Bitime ${dBit} gün</span>`;
                        else html += `<b style="color:${SUCCESS_COLOR};font-size:14px">✅ Poliçe Uygun</b>`;
                    } else {
                        const diff = hasar<bas ? Math.floor((bas-hasar)/86400000) : Math.floor((hasar-bitis)/86400000);
                        const yon = hasar<bas ? 'ÖNCE' : 'SONRA';
                        html += `<b style="color:#ff0000;font-size:13px">❌ POLİÇE DIŞI — Vade ${yon} ${diff} gün</b>`;
                    }
                    html += `</td></tr>`;
                }
                html += `<tr><td colspan="2"><hr style="border:0;border-top:1px solid #444;margin:3px 0"></td></tr>`;
            }

            /* Rücu */
            if (CFG.panel_rc && !isMagdur) {
                const rVar = $('RUCU1')?.checked, rYok = $('RUCU0')?.checked;
                const badge = rVar ? `<span style="background:#ff4d4d22;color:#ff4d4d;border:1px solid #ff4d4d44;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:bold">VAR 🔴</span>` :
                              rYok ? `<span style="background:#2ecc7122;color:#2ecc71;border:1px solid #2ecc7144;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:bold">YOK 🟢</span>` :
                                     `<span style="background:#ff950022;color:#ff9500;border:1px solid #ff950044;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:bold">BELİRSİZ</span>`;
                html += `<tr><td>Rücu:</td><td style="text-align:right">${badge}</td></tr>`;
            }

            /* Pert */
            if (CFG.panel_pert && !isMagdur) {
                const on = $('pert')?.checked;
                html += `<tr><td>Pert:</td><td style="text-align:right">
                    <span style="background:${on?'#ff4d4d22':'#2ecc7122'};color:${on?'#ff4d4d':'#2ecc71'};border:1px solid ${on?'#ff4d4d44':'#2ecc7144'};padding:1px 6px;border-radius:3px;font-size:10px;font-weight:bold">
                        ${on?'VAR 🔴':'YOK 🟢'}
                    </span></td></tr>`;
            }

            /* Rayiç / Oran */
            const hasPiy = pn(isMagdur?'PIYASA':'HAS_PIYASA');
            const tahHas = pn('TAHMINI_HASAR');
            const oran = hasPiy > 0 ? (tahHas/hasPiy)*100 : 0;
            const orClr = oran<=30?SUCCESS_COLOR:oran<=60?'#ffa500':'#ff4d4d';
            const orTxt = oran<=30?'✅ UYGUN':oran<=60?'🟠 %30+':'🔴 %60+';

            if (CFG.panel_ryc) {
                html += `<tr><td>Rayiç:</td><td style="text-align:right;color:#00d4ff;font-weight:bold">${hasPiy.toLocaleString('tr-TR')} ₺</td></tr>`;
            }
            if (CFG.panel_rycorn && !isMagdur) {
                html += `<tr><td>Muallak:</td><td style="text-align:right;color:${orClr};font-weight:bold">
                    ${tahHas.toLocaleString('tr-TR')} ₺
                    <span style="background:${orClr}22;color:${orClr};border:1px solid ${orClr}44;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:bold;margin-left:4px">${orTxt}</span>
                </td></tr>
                <tr><td colspan="2">
                    <div style="background:#222;height:5px;border-radius:3px;overflow:hidden;border:1px solid #444;margin:3px 0">
                        <div style="background:${orClr};width:${Math.min(oran,100)}%;height:100%"></div>
                    </div>
                    ${oran>=60&&!$('pert')?.checked?'<div style="color:#ff4d4d;font-size:9px;font-weight:bold;text-align:right">⚠️ PERT SEÇİLMELİ!</div>':''}
                </td></tr>`;
            }

            html += `</table>`;
            wrap.innerHTML = html;
        };

        /* --- Hücre boyama --- */
        const highlightFields = () => {
            const getEl = id => document.getElementById(id) || document.getElementsByName(id)[0];
            const setBg = (id, bad) => {
                const el = getEl(id); const td = el?.closest('td');
                if (td) td.style.backgroundColor = bad ? WARNING_COLOR : '';
            };
            if (isMagdur) {
                ['SURUCU_ADI','MAGDUR_AD','MAGDUR_SOYAD','PLAKA1','PLAKA2','PLAKA3',
                 'SASI_NO','MOTOR_NO','MERNIS_NO_C','SURUCU_EHLIYET_NO'].forEach(id=>setBg(id,!getEl(id)?.value?.trim()));
                ['MODEL_YILI','MARKA_ID','ARAC_TIPI','MAGDUR_KIMLIK_TIPI','SURUCU_KIMLIK_TIPI'].forEach(id=>setBg(id,getEl(id)?.value==='-1'));
                setBg('KM', pn('KM')<1); setBg('PIYASA', pn('PIYASA')<1000);
            } else {
                ['EKSPERTIZ_TARIHI_YIL','HAS_ARAC_SAHIBI','TRAMER_IHBAR_NO','SERVIS_ADI',
                 'SURUCU_YIL','EHLIYET_NO','EHLIYET_TARIHI_YIL','MILLI_R_NO','ONARIM_SURESI'].forEach(id=>setBg(id,!getEl(id)?.value?.trim()));
                ['HASAR_ILCESI','KANAAT','KAZA_SEKLI','KUSURLU','HAS_MODEL_YILI','HASAR_SEKLI',
                 'KAZA_IHBAR_TURU','UZAKTAN_EKSPERTIZ'].forEach(id=>setBg(id,getEl(id)?.value==='-1'));
                setBg('TAHMINI_HASAR', pn('TAHMINI_HASAR')<1000);
                setBg('HAS_KM', pn('HAS_KM')<1); setBg('HAS_PIYASA', pn('HAS_PIYASA')<1000);
            }
        };

        /* --- Ön Giriş otomasyonu --- */
        const autoFill = () => {
            const setVal = (id, val) => { const el=$(id); if(el){el.value=val;el.dispatchEvent(new Event('change',{bubbles:true}));} };
            const clickCb = id => { const el=$(id); if(el){el.checked=false;el.click();} };
            const setSelTxt = (id, txt) => {
                const el=$(id); if(!el)return;
                const opt=[...el.options].find(o=>o.text.includes(txt));
                if(opt){el.value=opt.value;el.dispatchEvent(new Event('change',{bubbles:true}));}
            };
            ['SURUCU_BELGE_TIPI1','SURUCU_BELGESI0','RUHSAT_ASLI1','RUCU0','SAG1','HAS_DEVIR_SATIS0',
             'HAS_EKSIK_ASKIN_SIGORTA0','TASINAN_YUK0','MUAFIYET0','TESPIT_SEKLI0','ONARIM_ONAYI2',
             'SURUCU_BELGESI_GORULDU1','EHLIYET_YETERLI1','ALKOL_DURUMU2'].forEach(clickCb);
            setVal('HAS_ARAC_SAHIBI', gv('SB_SIGORTALI_ADI_C'));
            setVal('MILLI_R_NO', gv('IHBAR_TARIHI_YIL'));
            setVal('ONARIM_SURESI', '10');
            setVal('EKSPERTIZ_SURESI','1');
            setVal('KUSURLU', '0');
            setVal('KUSUR_ORANI', '100');
            setVal('UZAKTAN_EKSPERTIZ','2');
            setVal('EHLIYET_SINIFI', 'B');
            setVal('EKSPERTIZ_TARIHLERI',`${gv('IHBAR_TARIHI_GUN')}/${gv('IHBAR_TARIHI_AY')}/${gv('IHBAR_TARIHI_YIL')}`);
            ['GUN','AY','YIL'].forEach(s => {
                setVal('EKSPERTIZ_TALEP_TARIHI_'+s, gv('IHBAR_TARIHI_'+s));
                setVal('EKSPERTIZ_TARIHI_'+s, gv('IHBAR_TARIHI_'+s));
            });
            setSelTxt('KAZA_IHBAR_TURU','ANLAŞMALI KAZA');
            setSelTxt('KANAAT','OLUMLUDUR');
            alert('Ön giriş tamamlandı ✅');
            KSLog.ok('Ön giriş otomasyonu çalıştırıldı');
        };

        /* Kaydet notu */
        const storageKey = 'ks2_note_' + location.href;
        const saveNote = () => {
            const ta = document.getElementById('ks2-note-ta');
            if (ta) localStorage.setItem(storageKey, ta.value);
        };

        /* Sahibinden piyasa */
        const buildTargetUrl = () => {
            const extractYear = s => { const m = String(s).match(/\b(19|20)\d{2}\b/); return m?m[0]:''; };
            let m='', yRaw='', kStr='0';
            if (isMagdur) {
                m = $('MODEL_ADI')?.value || '';
                yRaw = $('MODEL_YILI')?.value || '';
                kStr = $('KM')?.value || '0';
            } else {
                m = ($('HAS_MODEL_ADI') || $('MODEL_ADI'))?.value || '';
                yRaw = ($('HAS_MODEL_YILI') || $('MODEL_YILI'))?.value || '';
                kStr = $('HAS_KM')?.value || '0';
            }
            m = m.replace(/\d{2}\/\d{2}\/\d{4}.*/g,'').replace(/\(\s*\d+\s*\)/g,'').replace(/\s+/g,' ').trim();
            const y = extractYear(yRaw);
            const k = parseInt(kStr.replace(/\D/g,'')) || 0;
            return m ? { model:m, year:y, kmMin:k>=100?Math.floor(k*.85):null, kmMax:k>=100?Math.ceil(k*1.15):null } : null;
        };

        const startPiyasa = isAnalyze => {
            const resBox = document.getElementById('ks2-piyasa-box');
            const data = buildTargetUrl();
            if (!data) { if(isAnalyze && resBox) resBox.innerHTML='❌ Araç verisi bulunamadı'; return; }
            if (isAnalyze && resBox) resBox.innerHTML='<span style="opacity:.7">🔍 Filtreleniyor...</span>';
            const q = `site:sahibinden.com "${data.model}" ${data.year}`;
            GM_xmlhttpRequest({
                method:'GET',
                url:`https://www.google.com/search?q=${encodeURIComponent(q)}`,
                headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0'},
                onload(gRes) {
                    const gDoc = new DOMParser().parseFromString(gRes.responseText,'text/html');
                    const links = [...gDoc.querySelectorAll('a')];
                    const target = links.find(a=>a.href.includes('sahibinden.com/')&&!a.href.includes('/ilan listelendi/')&&!a.href.includes('/detay'));
                    if (!target) { if(isAnalyze&&resBox) resBox.innerHTML='⚠ Kategori bulunamadı'; return; }
                    let shbUrl='';
                    try {
                        const u=new URL(target.href);
                        shbUrl = u.pathname==='/url'?u.searchParams.get('q').split('&')[0]:target.href.split('&')[0];
                    } catch(e){ shbUrl=target.href; }
                    const finalUrl=new URL(shbUrl);
                    finalUrl.searchParams.set('pagingSize','50');
                    finalUrl.searchParams.set('sorting','km-nu_asc');
                    if(data.year){finalUrl.searchParams.set('a5_min',data.year);finalUrl.searchParams.set('a5_max',data.year);}
                    if(data.kmMin){finalUrl.searchParams.set('a4_min',data.kmMin);finalUrl.searchParams.set('a4_max',data.kmMax);}
                    if(isAnalyze) fetchPrices(finalUrl.toString());
                    else unsafeWindow.open(finalUrl.toString(),'_blank');
                }
            });
        };

        const fetchPrices = url => {
            const resBox = document.getElementById('ks2-piyasa-box');
            GM_xmlhttpRequest({
                method:'GET', url,
                headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0'},
                onload(res){
                    const sDoc=new DOMParser().parseFromString(res.responseText,'text/html');
                    const rows=[...sDoc.querySelectorAll('tr.searchResultsItem')];
                    const list=[];
                    rows.forEach(tr=>{
                        const titleEl=tr.querySelector('.classifiedTitle');
                        const priceEl=tr.querySelector('.searchResultsPriceValue');
                        const attrs=tr.querySelectorAll('.searchResultsAttributeValue');
                        if(titleEl&&priceEl&&attrs.length>=2){
                            const price=parseInt(priceEl.innerText.replace(/\D/g,''))||0;
                            if(price>100000) {list.push({
                                title:titleEl.title.substring(0,18),
                                link:'https://www.sahibinden.com'+titleEl.getAttribute('href'),
                                year:attrs[0].innerText.trim(), km:attrs[1].innerText.trim(), price
                            });}
                        }
                    });
                    if(!list.length){ if(resBox) resBox.innerHTML='⚠ Sonuç bulunamadı'; return; }
                    const avg=Math.round(list.reduce((a,b)=>a+b.price,0)/list.length);
                    const rndAvg=Math.round(avg/5000)*5000;
                    const sorted=[...list].sort((a,b)=>a.price-b.price);
                    const nearAvg=[...list].sort((a,b)=>Math.abs(a.price-avg)-Math.abs(b.price-avg));
                    const display=[];
                    [sorted[0],sorted[1],nearAvg[0],nearAvg[1],[...list].sort((a,b)=>b.price-a.price)[0]].forEach(item=>{
                        if(item&&!display.some(d=>d.link===item.link)&&display.length<5) display.push(item);
                    });
                    const colors=['#27fdf9','#26f885','#d3ff73','#d3ff73','#fff8b7'];
                    if(resBox) {resBox.innerHTML=`
                        <div style="background:rgba(200,200,200,.1);border:1px solid #444;border-radius:5px;padding:5px;color:#fff;font-size:10px">
                            <div style="display:flex;justify-content:space-between;margin-bottom:4px;border-bottom:1px solid #555;padding-bottom:5px">
                                <b>Ort: ${rndAvg.toLocaleString('tr-TR')} ₺</b>
                                <span style="color:var(--ks-green)">${list.length} ilan</span>
                            </div>
                            ${display.map((item,i)=>`
                                <div style="display:flex;gap:4px;border-bottom:1px solid #222;padding:2px 0">
                                    <a href="${item.link}" target="_blank" style="color:#42c6ff;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px">${item.title}</a>
                                    <span style="color:#aaa;font-size:9px">${item.year}</span>
                                    <span style="color:#aaa;font-size:9px">${item.km}</span>
                                    <span style="color:${colors[i]};font-weight:bold;font-size:9px;min-width:55px;text-align:right">${item.price.toLocaleString('tr-TR')}</span>
                                </div>`).join('')}
                        </div>`;}
                    KSLog.ok('Piyasa verisi alındı — ' + list.length + ' ilan');
                }
            });
        };

        /* --- Panel inject edilecek yan panel içeriği --- */
        const injectGirisContent = () => {
            /* Mevcut KS2 panelinin içine Giriş Kontrol sekmesi içeriğini yaz */
            const girisPanel = document.getElementById('ks2-panel-giris');
            if (!girisPanel) return;

            /* Panele özel içerik inject et — sidebar olarak ayrı div kullan */
            const sidebar = document.createElement('div');
            sidebar.id = 'ks2-giris-sidebar';
            sidebar.style.cssText = `
                position:fixed;bottom:36px;right:0;width:${CFG.panelWidth}px;
                background:rgba(10,10,14,.9);backdrop-filter:blur(16px);
                border:1px solid rgba(255,255,255,.1);border-bottom:none;border-right:none;
                border-radius:${CFG.borderRad}px 0 0 0;
                padding:8px;display:flex;flex-direction:column;gap:6px;
                z-index:${CFG.zIndex-1};color:#fff;font-family:'Syne','Segoe UI',sans-serif;
                font-size:11px;max-height:50vh;overflow-y:auto;
            `;
            sidebar.innerHTML = `
                <div id="ks2-giris-panel" style="min-height:20px"></div>
                ${CFG.panel_pys ? `
                <hr style="border:0;border-top:1px solid #333;margin:2px 0">
                <div id="ks2-piyasa-box" style="font-size:11px;color:#fff"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
                    <button onclick="ks2GirisModule.piyasaGoster()" style="background:${TC};color:#000;border:0;border-radius:4px;padding:4px;font-size:9px;font-weight:700;cursor:pointer;text-transform:uppercase">Piyasa Göster</button>
                    <button onclick="ks2GirisModule.piyasaGit()" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid #333;border-radius:4px;padding:4px;font-size:9px;font-weight:700;cursor:pointer;text-transform:uppercase">Listeye Git</button>
                </div>` : ''}
                <hr style="border:0;border-top:1px solid #333;margin:2px 0">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
                    <button id="ks2-auto-btn" onclick="ks2GirisModule.autoFill()" style="background:${TC};color:#000;border:0;border-radius:4px;padding:5px;font-size:9px;font-weight:700;cursor:pointer;text-transform:uppercase">⚡ Ön Giriş (F4)</button>
                    <button onclick="ks2GirisModule.kaydet()" style="background:linear-gradient(180deg,#f34352,#d00f0f);color:#fff;border:0;border-radius:4px;padding:5px;font-size:9px;font-weight:700;cursor:pointer;text-transform:uppercase">💾 Kaydet (F2)</button>
                </div>
                ${CFG.panel_not ? `
                <hr style="border:0;border-top:1px solid #333;margin:2px 0">
                <div style="font-size:9px;color:#666;display:flex;justify-content:space-between">
                    <span>NOT</span><span id="ks2-note-st">Otomatik kaydedilecek...</span>
                </div>
                <textarea id="ks2-note-ta" style="width:100%;height:45px;background:#252525;color:#fff;border:1px solid #333;border-radius:4px;padding:4px;font-size:10px;resize:vertical;outline:none;box-sizing:border-box" placeholder="Notunuzu buraya yazın..."></textarea>` : ''}
            `;
            document.body.appendChild(sidebar);

            /* Global erişim */
            unsafeWindow.ks2GirisModule = {
                piyasaGoster: () => startPiyasa(true),
                piyasaGit:    () => startPiyasa(false),
                autoFill,
                kaydet: () => { if(typeof unsafeWindow.kaydet==='function') unsafeWindow.kaydet(); saveNote(); KSLog.ok('Kaydet tetiklendi'); },
            };

            /* Not yükleme */
            if (CFG.panel_not) {
                const ta = document.getElementById('ks2-note-ta');
                if (ta) {
                    const saved = localStorage.getItem(storageKey);
                    if (saved) ta.value = saved;
                    let saveTimer;
                    ta.addEventListener('input', () => {
                        const st = document.getElementById('ks2-note-st');
                        if (st) st.textContent = 'Yazılıyor...';
                        clearTimeout(saveTimer);
                        saveTimer = setTimeout(() => {
                            saveNote();
                            const st2 = document.getElementById('ks2-note-st');
                            if (st2) { st2.textContent = 'Kaydedildi ✓'; setTimeout(()=>{ st2.textContent='Otomatik kaydedilecek...'; },2000); }
                        }, 1000);
                    });
                }
            }

            /* Keyboard shortcuts */
            document.addEventListener('keydown', e => {
                if (e.key==='F2') { e.preventDefault(); unsafeWindow.ks2GirisModule.kaydet(); }
                if (e.key==='F4') { e.preventDefault(); autoFill(); }
            });

            if (CFG.panel_hlt) setInterval(highlightFields, 500);
            setInterval(buildGirisPanel, 1500);
            KSLog.ok('Giriş kontrol sidebar oluşturuldu');
        };

        setTimeout(injectGirisContent, 800);
    }

    /* ═══════════════════════════════════════════════════════════
       8. MODÜL: DONANIM GİRİŞİ
    ═══════════════════════════════════════════════════════════ */
    if (CFG.system && CFG.donanim && url.includes('otohasar') && /eks_(magdur_arac_donanim|arac_donanim)/.test(url)) {
        const initDonanim = () => {
            if (document.getElementById('ks2-donanim-panel')) return;
            const donanimSozlugu = {
                'ALARM':1,'İMMOBİLİZER':2,'KLİMA':3,'RADYO-TEYP':4,'TELEFON':5,
                'RADYO-CD':23,'CD ÇALAR':6,'ABS':7,'AIRBAG':8,'SUNROOF':9,
                'DERI DOSEME':10,'VİTES':22,'YAKIT TİPİ':24,'LPG':11,'ENGELLİLER':12
            };
            const getCheckboxes = () => {
                const res=[];
                Array.from(document.querySelectorAll('tr')).forEach(row=>{
                    const lbl=row.cells[0]?.innerText.trim().toUpperCase()||'';
                    let mid=null;
                    for(const key in donanimSozlugu){ if(lbl.includes(key)){mid=donanimSozlugu[key];break;} }
                    if(mid) {row.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
                        const m=cb.getAttribute('onclick')?.match(/donanim\('(\d+)',(\d+)\)/);
                        if(m) res.push({masterId:mid,originalId:m[1],val:parseInt(m[2]),cb});
                    });}
                });
                return res;
            };
            const applyRules = ruleFn => {
                getCheckboxes().forEach(item=>{
                    const tv=ruleFn(item.masterId);
                    if(tv!==null&&item.cb.checked!==(item.val===tv)) item.cb.click();
                });
            };

            const panel=document.createElement('div');
            panel.id='ks2-donanim-panel';
            panel.style.cssText=`position:fixed;top:0;right:0;z-index:${CFG.zIndex+1};display:flex;gap:2px;padding:2px;background:#000;border-bottom-left-radius:4px;box-shadow:-1px 1px 6px rgba(0,0,0,.5)`;

            const mkBtn=(txt,color,fn)=>{
                const b=document.createElement('button');
                b.innerText=txt;
                b.style.cssText=`background:${color};border:0;border-radius:2px;color:#fff;cursor:pointer;font-weight:bold;padding:3px 8px;font-size:9px;text-transform:uppercase;letter-spacing:.5px`;
                b.onclick=fn; panel.appendChild(b);
            };

            mkBtn('2000~ Benzin','#0078d4',()=>applyRules(id=>id<=10?id===4?1:0:id===11?1:[12,22].includes(id)?0:id===23||id===24?0:null));
            mkBtn('2000~ Dizel', '#107c10',()=>applyRules(id=>id<=10?id===4?1:0:[11,12,22].includes(id)?0:id===23?0:id===24?1:null));
            mkBtn('2010+ Benzin','#8764b8',()=>applyRules(id=>[1,5,9,10,11,12,22,23,24].includes(id)?0:[2,3,4,6,7,8].includes(id)?1:null));
            mkBtn('2010+ Dizel', '#c7472c',()=>applyRules(id=>[1,5,9,10,11,12,22,23].includes(id)?0:[2,3,4,6,7,8,24].includes(id)?1:null));

            document.body.appendChild(panel);
            KSLog.ok('Donanım paneli oluşturuldu');
        };
        if (document.readyState==='complete') initDonanim();
        else unsafeWindow.addEventListener('load', initDonanim);
        setTimeout(initDonanim, 1500);
    }

    /* ═══════════════════════════════════════════════════════════
       9. MODÜL: MANUEL PARÇA GİRİŞİ
    ═══════════════════════════════════════════════════════════ */
    if (CFG.system && CFG.manuel && url.includes('otohasar') && url.includes('eks_hasar_yedpar_yeni_ref.php')) {
        GM_addStyle(`
            body { transition:margin-left .4s; margin-left:256px!important; }
            body.ks2-panel-closed { margin-left:0!important; }
            #ks2-manu {
                position:fixed;top:0;left:0;width:246px;height:100vh;
                background:rgba(10,10,14,.9);backdrop-filter:blur(16px);
                border-right:1px solid rgba(255,255,255,.08);
                color:#e4e4f0;z-index:${CFG.zIndex+1};
                display:flex;flex-direction:column;padding:8px;gap:5px;
                font-family:'Syne','Segoe UI',sans-serif;
                box-shadow:5px 0 25px rgba(0,0,0,.5);
                transition:transform .35s cubic-bezier(.4,0,.2,1);
                overflow-y:auto;
            }
            #ks2-manu.closed{transform:translateX(-256px)}
            #ks2-manu-toggle{
                position:fixed;top:20px;left:256px;width:36px;height:48px;
                background:rgba(10,10,14,.9);border:1px solid rgba(255,255,255,.08);
                border-left:none;border-radius:0 8px 8px 0;cursor:pointer;
                color:#e4e4f0;z-index:${CFG.zIndex+2};display:flex;
                align-items:center;justify-content:center;
                backdrop-filter:blur(12px);font-size:14px;
                transition:left .35s cubic-bezier(.4,0,.2,1);
            }
            #ks2-manu.closed+#ks2-manu-toggle{left:0}
            .ks2-manu-sec{font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#55556a;border-bottom:1px solid rgba(255,255,255,.07);padding-bottom:3px;margin:2px 0}
            .ks2-manu-input{width:100%!important;padding:5px 8px!important;border-radius:4px!important;border:1px solid rgba(255,255,255,.13)!important;background:#16161a!important;color:#e4e4f0!important;font-size:11px!important;box-sizing:border-box!important;outline:none!important;transition:border-color .15s!important}
            .ks2-manu-input:focus{border-color:${TC}!important}
            .ks2-radio-wrap{display:flex;background:#1a1a22;padding:3px;border-radius:6px;border:1px solid rgba(255,255,255,.07)}
            .ks2-radio-wrap label{flex:1;text-align:center;padding:3px 2px;border-radius:4px;font-size:9px;font-weight:700;color:#55556a;cursor:pointer;transition:all .2s;letter-spacing:.5px;text-transform:uppercase}
            .ks2-radio-wrap label:has(input:checked){background:${TC};color:#000}
            .ks2-radio-wrap input{display:none}
            .ks2-manu-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px}
            .ks2-manu-btn{padding:5px 4px;border-radius:4px;border:none;cursor:pointer;font-size:9px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.3px;transition:all .15s;text-align:center}
            .ks2-manu-btn:hover{filter:brightness(1.15);transform:translateY(-1px)}
            .ks2-manu-btn:active{transform:translateY(0) scale(.96)}
            @keyframes ks2-blink-new{0%,100%{box-shadow:0 0 5px ${TC}}50%{box-shadow:0 0 15px ${TC},0 0 25px ${TC}88}}
            .ks2-manu-blink{animation:ks2-blink-new 1s infinite}
        `);

        const initManu = () => {
            if (document.getElementById('ks2-manu')) return;
            const $ = id => document.getElementById(id);
            const panel = document.createElement('div');
            panel.id = 'ks2-manu';
            panel.innerHTML = `
                <button id="ks2-manu-new" class="ks2-manu-btn" style="background:${TC};color:#000;padding:7px;font-size:10px;grid-column:span 2">YENİ KAYIT</button>
                <div class="ks2-manu-sec">Parça Bilgileri</div>
                <input id="ks2-mk" class="ks2-manu-input" placeholder="Parça Kodu">
                <input id="ks2-ma" class="ks2-manu-input" placeholder="Parça Adı" style="margin-top:3px">
                <div style="display:flex;gap:4px;margin-top:3px">
                    <input id="ks2-mf" type="number" class="ks2-manu-input" placeholder="Fiyat" step="0.01">
                    <input id="ks2-madt" type="number" class="ks2-manu-input" placeholder="Adet" value="1" style="width:60px!important;flex:none">
                </div>
                <div class="ks2-manu-sec">İşlem Tipi</div>
                <div class="ks2-radio-wrap">
                    <label><input type="radio" name="ks2-islem" value="degisim" checked>DEĞİŞİM</label>
                    <label><input type="radio" name="ks2-islem" value="onarim">ONARIM</label>
                </div>
                <div class="ks2-radio-wrap" style="margin-top:3px">
                    <label><input type="radio" name="ks2-kod" value="kodsuz" checked>KODSUZ</label>
                    <label><input type="radio" name="ks2-kod" value="esdeger">EŞDEĞER</label>
                    <label><input type="radio" name="ks2-kod" value="bos">BOŞ</label>
                </div>
                <div class="ks2-radio-wrap" style="margin-top:3px;background:rgba(208,15,15,.15);border-color:rgba(208,15,15,.3)">
                    <label style="color:#f34352"><input type="radio" name="ks2-kayit" value="kayit" checked>OTO.KAYDET</label>
                    <label style="color:#666"><input type="radio" name="ks2-kayit" value="no">KAYDETME</label>
                </div>
                <div class="ks2-manu-sec">Giriş Türü</div>
                <div class="ks2-manu-grid" id="ks2-manu-btns"></div>
                <div class="ks2-manu-sec">Diğer</div>
                <div class="ks2-manu-grid">
                    <button class="ks2-manu-btn" style="background:#e67e22" id="ks2-gnlonar">GENEL ONARIM</button>
                    <button class="ks2-manu-btn" style="background:#8e44ad" id="ks2-donyan">EŞDEĞERE ÇEV.</button>
                </div>
            `;
            const toggleBtn = document.createElement('div');
            toggleBtn.id = 'ks2-manu-toggle';
            toggleBtn.innerHTML = '◀';
            document.body.appendChild(panel);
            document.body.appendChild(toggleBtn);

            toggleBtn.onclick = () => {
                panel.classList.toggle('closed');
                document.body.classList.toggle('ks2-panel-closed');
                toggleBtn.innerHTML = panel.classList.contains('closed') ? '▶' : '◀';
            };

            /* Giriş butonları */
            const btns = [
                ['KAPORTA ÖN','#0078d4','10','777'],['KAPORTA YAN','#0078d4','11','852'],
                ['KAPORTA ARKA','#0078d4','12','898'],['KAPORTA TAVAN','#0078d4','13','905'],
                ['MEKANİK','#8e44ad','2','645'],['ELEKTRİK','#8e44ad','4','686'],
                ['CAM','#6366f1','17','934'],['DÖŞEME KİLİT','#f59e0b','5','580'],
                ['LASTİK','#374151','19','520'],['CİVATA','#374151','25','537'],
                ['CONTA','#374151','36','1108'],['KLİPS','#374151','24','536'],
                ['MOTORSİKLET','#ea580c','29','554'],['DORSE','#14b8a6','31','556'],
            ];
            const grid = document.getElementById('ks2-manu-btns');
            btns.forEach(([txt,color,gid,agid])=>{
                const b=document.createElement('button');
                b.className='ks2-manu-btn'; b.style.background=color; b.textContent=txt;
                b.onclick=()=>manuAction(gid,agid);
                grid.appendChild(b);
            });

            /* Helpers */
            const waitFor=(fn,t=5000)=>new Promise((res,rej)=>{
                const s=Date.now(),iv=setInterval(()=>{const el=fn();if(el){clearInterval(iv);res(el);}else if(Date.now()-s>t){clearInterval(iv);rej();}},100);
            });
            const selVal=async(id,val)=>{
                try{
                    const s=await waitFor(()=>document.getElementById(id));
                    await waitFor(()=>s.options&&[...s.options].some(o=>o.value==val),2000);
                    s.value=val;
                    ['change','input'].forEach(ev=>s.dispatchEvent(new Event(ev,{bubbles:true})));
                }catch(e){}
            };
            const degisonar=()=>{
                const tip=document.querySelector('input[name="ks2-islem"]:checked')?.value;
                const cbD=document.getElementById('DEGISIM'), cbT=document.getElementById('TAMIR');
                if(tip==='degisim'&&cbD){if(!cbD.checked)cbD.click();if(cbT&&cbT.checked)cbT.checked=false;}
                else if(tip==='onarim'&&cbT){if(!cbT.checked)cbT.click();if(cbD&&cbD.checked)cbD.checked=false;}
            };
            const fillMain=()=>{
                degisonar();
                const kod=$('ks2-mk')?.value, ad=$('ks2-ma')?.value, fiyat=$('ks2-mf')?.value;
                if(!kod||!ad||!fiyat) return;
                const fv=fiyat.replace(',','.');
                [['PARCA_KODU',kod.toUpperCase()],['ADI',ad.toUpperCase()],['ADET',$('ks2-madt')?.value||'1'],
                 ['BIRIM_FIYAT_GERCEK',fv],['BIRIM_FIYAT_TALEP',fv]].forEach(([id,v])=>{
                    const el=document.getElementById(id); if(el) el.value=v;
                });
            };
            const submitForm=()=>{
                if(document.querySelector('input[name="ks2-kayit"]:checked')?.value!=='kayit') return;
                const w=unsafeWindow;
                let attempts=0;
                const exec=()=>{
                    if(attempts>10){alert('10 deneme sonrası kayıt başarısız. Manuel kayıt yapın.');return;}
                    if(typeof w.sbmt_frm==='function'&&w.sbmt_frm()){
                        let ok=true;
                        if(typeof w.doraSiparisSecenek==='function'&&!w.doraSiparisSecenek()) ok=false;
                        if(ok){const f=document.forms.yedparforhasar;if(f){f.submit();return;}}
                    }
                    attempts++;setTimeout(exec,500);
                };
                exec();
            };
            const safeSelect=async(id,val)=>{
                const el=document.getElementById(id);if(!el)return;
                const w=unsafeWindow;const oldAlert=w.alert;
                try{w.alert=()=>{};await selVal(id,val);}finally{setTimeout(()=>{w.alert=oldAlert;},150);}
            };
            const manuAction=async(gid,agid)=>{
                fillMain();
                await Promise.all([selVal('GRUP_ID',gid),selVal('ANA_GRUP',agid)]);
                const radio=document.querySelector('input[name="ks2-kod"]:checked')?.value;
                const notlar=document.getElementById('NOTLAR');
                const forceWrite=(el,v)=>{if(!el)return;el.value=v;['input','change','blur'].forEach(ev=>el.dispatchEvent(new Event(ev,{bubbles:true})));};
                if(radio==='kodsuz'){
                    const s=document.getElementById('SIP_SEC_2');if(s){s.checked=true;s.dispatchEvent(new Event('change',{bubbles:true}));}
                    await safeSelect('SISTEM_NOTU_ID','2');forceWrite(notlar,'KODSUZ PARÇA');await selVal('SIPARIS_VERMEME_SEBEP_ID','2');
                }else if(radio==='esdeger'){
                    await safeSelect('SISTEM_NOTU_ID','13');forceWrite(notlar,'');await selVal('SIPARIS_VERMEME_SEBEP_ID','-1');
                }else{
                    await safeSelect('SISTEM_NOTU_ID','-1');forceWrite(notlar,'');await selVal('SIPARIS_VERMEME_SEBEP_ID','-1');
                }
                const eksikAlan=['ks2-mk','ks2-ma','ks2-mf'].some(id=>!document.getElementById(id)?.value?.trim());
                if(!eksikAlan){submitForm();setTimeout(submitForm,400);}
            };

            document.getElementById('ks2-manu-new').onclick=()=>{
                if(typeof unsafeWindow.yeni_kayit==='function') unsafeWindow.yeni_kayit('');
                ['ks2-mk','ks2-ma','ks2-mf'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
                document.getElementById('ks2-manu-new').classList.remove('ks2-manu-blink');
                document.getElementById('ks2-mk')?.focus();
            };
            document.getElementById('ks2-gnlonar').onclick=async()=>{
                const fv=document.getElementById('ks2-mf')?.value?.replace(',','.');
                const g=document.getElementById('BIRIM_FIYAT_GERCEK'),t=document.getElementById('BIRIM_FIYAT_TALEP');
                if(g)g.value=fv;if(t)t.value=fv;
                await selVal('GRUP_ID','6');await selVal('ANA_GRUP','495');submitForm();
            };
            document.getElementById('ks2-donyan').onclick=async()=>{
                const fv=document.getElementById('ks2-mf')?.value?.replace(',','.');
                const g=document.getElementById('BIRIM_FIYAT_GERCEK'),t=document.getElementById('BIRIM_FIYAT_TALEP');
                if(g)g.value=fv;if(t)t.value=fv;
                if(document.getElementById('SISTEM_NOTU_ID')?.value==='-1') await selVal('SISTEM_NOTU_ID','11');
                submitForm();
            };

            setInterval(()=>{
                const realInput=document.getElementById('PARCA_KODU');
                const btn=document.getElementById('ks2-manu-new');
                if(!btn)return;
                if(realInput&&(realInput.value||realInput.disabled)) btn.classList.add('ks2-manu-blink');
                else btn.classList.remove('ks2-manu-blink');
            },1000);

            const autoFocusInput=()=>{const i=document.getElementById('ks2-mk');if(i){i.focus();i.select();return true;}return false;};
            const focusObs=new MutationObserver(()=>{if(autoFocusInput())focusObs.disconnect();});
            focusObs.observe(document.documentElement,{childList:true,subtree:true});
            setTimeout(autoFocusInput,300);

            /* Sürekli checkbox */
            setTimeout(()=>{const cb=document.getElementById('SUREKLI');if(cb&&!cb.checked)cb.click();},1000);
            KSLog.ok('Manuel parça paneli oluşturuldu');
        };

        if (document.readyState==='complete') initManu();
        else unsafeWindow.addEventListener('load', initManu);
    }

    /* ═══════════════════════════════════════════════════════════
       10. MODÜL: REFERANS PANELLERİ
    ═══════════════════════════════════════════════════════════ */
    if (CFG.system && CFG.referans && url.includes('otohasar')) {
        const initRef = () => {
            /* yp_list */
            if (url.includes('eks_hasar_yp_list_yp_talep.php')) {
                const initYpList = () => {
                    const existing = document.getElementById('ks2-ref-bar');
                    if (existing) return;
                    const bar = document.createElement('div');
                    bar.id = 'ks2-ref-bar';
                    bar.style.cssText = `position:fixed;top:0;right:0;z-index:${CFG.zIndex+1};display:flex;gap:3px;padding:3px;background:rgba(10,10,14,.9);border-bottom-left-radius:6px;border:1px solid rgba(255,255,255,.1);border-top:none;border-right:none`;
                    const mkBtn=(txt,color,fn)=>{const b=document.createElement('button');b.textContent=txt;b.style.cssText=`background:${color};border:0;border-radius:4px;color:#fff;cursor:pointer;font-weight:700;padding:4px 10px;font-size:9px;text-transform:uppercase`;b.onclick=fn;bar.appendChild(b);};

                    mkBtn('📋 Yapıştır', TC, async()=>{
                        try{
                            const text=await navigator.clipboard.readText();
                            const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
                            const fields=[];
                            for(let j=1;j<=20;j++){let f=document.all(`YP_AD_${j}`)||document.all(`YP_AD_DIGER_${j}`);if(f)fields.push(f);}
                            if(lines.length!==fields.length&&lines.length>0&&!confirm(`${lines.length} satır / ${fields.length} kutu — devam?`)) return;
                            lines.forEach((line,i)=>{if(i<fields.length){fields[i].value=line;fields[i].dispatchEvent(new Event('input',{bubbles:true}));}});
                        }catch(e){alert('Pano erişim hatası!');}
                    });
                    mkBtn('📤 Kopyala','#374151',async()=>{
                        const rows=[...document.querySelectorAll('tr')].filter(tr=>{const f=tr.querySelector('td');return f&&f.classList.contains('acik')&&tr.querySelectorAll('td').length>=6;});
                        const data=rows.map(tr=>[...tr.querySelectorAll('td.acik')].slice(0,6).map(td=>td.innerText.trim()).join('\t')).join('\n');
                        if(data){await navigator.clipboard.writeText(data);alert('Kopyalandı ✓');}else alert('Veri bulunamadı.');
                    });
                    mkBtn('🚗 Tümünü Gruplandır','#8e44ad',async()=>{
                        const sels=document.querySelectorAll('select[name^="YP_GRUP_ID_"]');
                        const promises=[...sels].map(async gs=>{
                            const idx=gs.name.split('_').pop();gs.value='2';gs.dispatchEvent(new Event('change',{bubbles:true}));
                            await new Promise(r=>setTimeout(r,500));
                            const alt=document.querySelector(`select[name="YP_ID_${idx}"]`);if(alt){alt.value='0';alt.dispatchEvent(new Event('change',{bubbles:true}));}
                        });
                        await Promise.all(promises);
                    });
                    document.body.appendChild(bar);
                };
                setTimeout(initYpList, 500);
            }

            /* talep_yp_giris */
            if (url.includes('talep_yp_giris.php')) {
                setTimeout(()=>{
                    const existing=document.getElementById('ks2-ref-bar2');if(existing)return;
                    const bar=document.createElement('div');bar.id='ks2-ref-bar2';
                    bar.style.cssText=`position:fixed;top:0;right:0;z-index:${CFG.zIndex+1};padding:3px;background:rgba(10,10,14,.9);border-bottom-left-radius:6px;border:1px solid rgba(255,255,255,.1);border-top:none;border-right:none`;
                    const btn=document.createElement('button');
                    btn.textContent='📋 Excel Yapıştır';
                    btn.style.cssText=`background:${TC};border:0;border-radius:4px;color:#000;cursor:pointer;font-weight:700;padding:5px 12px;font-size:9px;text-transform:uppercase`;
                    btn.onclick=async()=>{
                        try{
                            const text=await navigator.clipboard.readText();
                            const rows=text.split(/\r?\n/).filter(l=>l.trim());
                            const available=[];
                            for(let j=0;j<50;j++){
                                const kod=document.querySelector(`input[name="kod[${j}]"]`);
                                const ad=document.querySelector(`input[name="ad[${j}]"]`);
                                const fiyat=document.querySelector(`input[name="fiyat[${j}]"]`);
                                if(kod||ad) available.push({kod,ad,fiyat});
                            }
                            if(rows.length>available.length&&!confirm(`${rows.length} satır / ${available.length} alan — devam?`)) return;
                            rows.forEach((row,i)=>{
                                if(i>=available.length)return;
                                const cols=row.split('\t');
                                if(available[i].kod){available[i].kod.value=cols[0]?.trim()||'';available[i].kod.dispatchEvent(new Event('input',{bubbles:true}));}
                                if(available[i].ad){available[i].ad.value=cols[1]?.trim()||'';available[i].ad.dispatchEvent(new Event('input',{bubbles:true}));}
                                if(available[i].fiyat){available[i].fiyat.value=cols[2]?.trim()||'1';available[i].fiyat.dispatchEvent(new Event('input',{bubbles:true}));}
                            });
                            btn.textContent='✓ Dolduruldu';setTimeout(()=>{btn.textContent='📋 Excel Yapıştır';},2000);
                        }catch(e){alert('Pano erişim hatası!');}
                    };
                    bar.appendChild(btn);document.body.appendChild(bar);
                },500);
            }

            /* talep_yp_ayrinti */
            if (url.includes('talep_yp_ayrinti.php')) {
                setTimeout(()=>{
                    const existing=document.getElementById('ks2-ref-bar3');if(existing)return;
                    const bar=document.createElement('div');bar.id='ks2-ref-bar3';
                    bar.style.cssText=`position:fixed;top:0;right:0;z-index:${CFG.zIndex+1};padding:3px;background:rgba(10,10,14,.9);border-bottom-left-radius:6px;border:1px solid rgba(255,255,255,.1);border-top:none;border-right:none`;
                    const btn=document.createElement('button');
                    btn.textContent='📂 Listeyi Kopyala';
                    btn.style.cssText=`background:${TC};border:0;border-radius:4px;color:#000;cursor:pointer;font-weight:700;padding:5px 12px;font-size:9px;text-transform:uppercase`;
                    btn.onclick=async()=>{
                        const unique=new Set();
                        document.querySelectorAll('tr').forEach(row=>{
                            const cells=row.querySelectorAll('td.acik,td.koyu');
                            if(cells.length>=4){
                                const kod=cells[1].innerText.trim();
                                if(/^[a-zA-Z0-9-]+$/.test(kod)&&!kod.includes('E+')&&kod!=='Parça Kodu')
								{unique.add(`${kod}\t${cells[2].innerText.trim()}\t${cells[3].innerText.trim()}`);}
                            }
                        });
                        if(!unique.size){alert('Veri bulunamadı');return;}
                        await navigator.clipboard.writeText([...unique].join('\n'));
                        btn.textContent=`✓ ${unique.size} Parça Kopyalandı`;setTimeout(()=>{btn.textContent='📂 Listeyi Kopyala';},2000);
                    };
                    bar.appendChild(btn);document.body.appendChild(bar);
                },500);
            }
        };
        setTimeout(initRef, 400);
    }

    /* ═══════════════════════════════════════════════════════════
       11. MODÜL: RESİM YÜKLEME
    ═══════════════════════════════════════════════════════════ */
    if (CFG.system && CFG.resim && url.includes('otohasar') && url.includes('multi_file_upload.php')) {
        const getSistemAyarlari = () => {
            const text = document.body.innerText.toUpperCase();
            const atlas = {EHLİYET:['1','195','196'],RUHSAT:['7','92','38'],KTT:['174','11','96','22','188'],BEYAN:['179','155','6'],ZABIT:['5','118','22','169'],POLICE:['3'],IMZA:['131','8'],NUFUS:['2','213'],DIGER:['12'],ONARIM_SONRASI:['32'],MUTABAKAT:['211','28'],MUVAFAKAT:['111','56','57'],IBRA:['33','132'],ALKOL:['4'],RAYIC:['184'],TRAMER:['12'],VERGI:['9','221'],MASAK:['12']};
            const mapfre = {EHLİYET:['121','120'],RUHSAT:['143','144'],KTT:['36','11'],BEYAN:['6'],ZABIT:['5','22'],POLICE:['3'],IMZA:['8'],NUFUS:['2'],DIGER:['12'],ONARIM_SONRASI:['18'],MUTABAKAT:['28'],MUVAFAKAT:['39','79'],IBRA:['33'],ALKOL:['4'],RAYIC:['49','184'],TRAMER:['48','210'],VERGI:['9'],MASAK:['162']};
            const varsayilan = {EHLİYET:['1'],RUHSAT:['7'],KTT:['174','11'],BEYAN:['179','155'],ZABIT:['5','118'],POLICE:['3'],IMZA:['131'],NUFUS:['2'],DIGER:['12'],ONARIM_SONRASI:['32'],MUTABAKAT:['211','28'],MUVAFAKAT:['111'],IBRA:['33'],ALKOL:['4'],RAYIC:['231','184'],TRAMER:['230','229'],VERGI:['9'],MASAK:['248']};
            return text.includes('MAPFRE')||url.includes('mapfre') ? mapfre : text.includes('ATLAS')||url.includes('atlas') ? atlas : varsayilan;
        };

        const ayarlar = getSistemAyarlari();

        const start = () => {
            /* Üst mini panel */
            if (!document.getElementById('ks2-img-bar')) {
                const bar = document.createElement('div');
                bar.id = 'ks2-img-bar';
                bar.style.cssText = `position:fixed;top:0;right:${CFG.panelWidth+4}px;z-index:${CFG.zIndex+1};display:flex;gap:3px;padding:3px;background:rgba(10,10,14,.9);border-bottom-left-radius:6px;border:1px solid rgba(255,255,255,.1);border-top:none`;
                const mkBtn=(txt,color,fn)=>{const b=document.createElement('button');b.textContent=txt;b.style.cssText=`background:${color};border:0;border-radius:3px;color:#fff;cursor:pointer;font-weight:700;padding:3px 8px;font-size:9px;text-transform:uppercase`;b.onclick=fn;bar.appendChild(b);};
                const selAll=(sel,val)=>document.querySelectorAll(sel).forEach(s=>{s.value=val;s.dispatchEvent(new Event('change',{bubbles:true}));});
                mkBtn('Fotokopi','#e67e22',()=>selAll('select[name^="EVRAK_TIPI_"]','0'));
                mkBtn('Aslı','#2980b9',()=>selAll('select[name^="EVRAK_TIPI_"]','1'));
                mkBtn('Olay Yeri','#8e44ad',()=>selAll('select[name^="PHOTO_CTG_ID_"]','11'));
                mkBtn('1. Ekspertiz','#27ae60',()=>selAll('select[name^="PHOTO_CTG_ID_"]','1'));
                mkBtn('Hasar','#2c3e50',()=>selAll('select[name^="PHOTO_CTG_ID_"]','13'));
                mkBtn('▲ Tepe','#374151',()=>window.scrollTo({top:0,behavior:'smooth'}));
                document.body.appendChild(bar);
            }

            /* Satır içi butonlar */
            document.querySelectorAll('select[name^="EVRAK_ID_"]').forEach(selectEl=>{
                if (selectEl.hasAttribute('data-ks2-done')) return;
                selectEl.setAttribute('data-ks2-done','1');
                const parentTd=selectEl.closest('td');
                const noteArea=parentTd?.querySelector('textarea[name^="HEADER_"]');
                if (!noteArea) return;

                const fnMatch=selectEl.name.match(/\[(.*?)\]/);
                const fn=fnMatch?fnMatch[1]:'Dosya';

                const container=document.createElement('div');
                container.style.cssText=`background:#f1f5f9;border:1px solid #cbd5e1;border-radius:4px;padding:4px;margin-bottom:4px`;

                const nameDiv=document.createElement('div');
                nameDiv.textContent='📁 '+fn;
                nameDiv.style.cssText=`font-size:9px;font-weight:800;color:#334155;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid ${TC};padding-bottom:2px`;
                container.appendChild(nameDiv);

                const grid=document.createElement('div');
                grid.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:1px';

                const evrakBtns=[
                    ['EHLİYET',ayarlar.EHLİYET,'#ff4757'],['RUHSAT',ayarlar.RUHSAT,'#ffa502'],
                    ['KİMLİK',ayarlar.NUFUS,'#1e90ff'],['POLİÇE',ayarlar.POLICE,'#3742fa'],
                    ['TUTANAK',ayarlar.KTT,'#2ed573'],['BEYAN',ayarlar.BEYAN,'#57606f'],
                    ['ZABIT',ayarlar.ZABIT,'#a29bfe'],['ALKOL',ayarlar.ALKOL,'#ff6b81'],
                    ['İMZA',ayarlar.IMZA,'#1abc9c'],['GAZETE',ayarlar.MASAK,'#95a5a6'],
                    ['SİCİL',ayarlar.MASAK,'#7f8c8d'],['FALİYET',ayarlar.DIGER,'#ee5253'],
                    ['MUTABAK',ayarlar.MUTABAKAT,'#10ac84'],['MUVAFFA',ayarlar.MUVAFAKAT,'#22af94'],
                    ['İBRA',ayarlar.IBRA,'#2e86de'],['İRSALYE',ayarlar.BEYAN,'#f39c12'],
                    ['PİYASA',ayarlar.RAYIC,'#f1c40f'],['TRAMER',ayarlar.TRAMER,'#5f27cd'],
                    ['MASAK',ayarlar.MASAK,'#00d2d3'],['VERGİ',ayarlar.VERGI,'#546e7a'],
                    ['DİĞER',ayarlar.DIGER,'#bdc3c7'],
                ];
                evrakBtns.forEach(([txt,vals,color])=>{
                    if(!vals||!vals.length) return;
                    const b=document.createElement('button');
                    b.textContent=txt; b.type='button';
                    b.style.cssText=`width:43px;font-size:8px;padding:2px 1px;cursor:pointer;background:${color};color:#fff;border:none;border-radius:2px;font-weight:bold;text-transform:uppercase;letter-spacing:-.2px`;
                    b.onclick=e=>{
                        e.preventDefault();
                        let nextVal=vals[0];
                        if(vals.length>1&&selectEl.value===vals[0]) nextVal=vals[1];
                        selectEl.value=nextVal;
                        selectEl.dispatchEvent(new Event('change',{bubbles:true}));
                    };
                    grid.appendChild(b);
                });
                container.appendChild(grid);
                noteArea.parentNode.insertBefore(container,noteArea);
            });

            /* Büyük harf dönüşümü */
            document.querySelectorAll('input,textarea').forEach(el=>{
                if(el.dataset.ks2UpperBound) return;
                el.dataset.ks2UpperBound='1';
                el.addEventListener('input',function(){
                    const s=this.selectionStart,n=this.selectionEnd;
                    this.value=this.value.toLocaleUpperCase('tr-TR');
                    try{this.setSelectionRange(s,n);}catch(e){}
                },true);
            });
        };

        setTimeout(start,500);
        setInterval(start,2500);
        KSLog.ok('Resim yükleme modülü hazır');
    }

    /* ═══════════════════════════════════════════════════════════
       12. MODÜL: EVRAK LİSTESİ ANALİZİ
    ═══════════════════════════════════════════════════════════ */
    if (CFG.system && CFG.resim && url.includes('otohasar') && url.includes('eks_hasar_evrak_foto_list.php')) {
        const updateEvrakPanel = () => {
            const el = document.getElementById('ks2-evrak-status');
            if (!el) return;
            const scenarios = {
                KTT: {label:'KAZA ŞEKLİ: KTT', keys:['kaza tespit tutanağı','(ktt)','anlasmali kaza'],req:[{k:['ehliyet'],l:'Ehliyet'},{k:['ruhsat'],l:'Ruhsat'}]},
                Zabit: {label:'KAZA ŞEKLİ: ZABİT', keys:['zapt','zabit','zabıt','karakol','ifade','görgü'],req:[{k:['alkol'],l:'Alkol Raporu'},{k:['ehliyet'],l:'Ehliyet'},{k:['ruhsat'],l:'Ruhsat'}]},
                Beyan: {label:'KAZA ŞEKLİ: BEYAN', keys:['beyan yazısı','beyan talep','müşteri beyanı','mağdur beyanı'],req:[{k:['ehliyet'],l:'Ehliyet'},{k:['ruhsat'],l:'Ruhsat'}]},
            };
            const uploaded = [...document.querySelectorAll('table tr')].map(r=>{
                const c=r.querySelectorAll('td')[1];
                return c?c.innerText.toLocaleLowerCase('tr-TR').replace(/-/g,'').trim():'';
            }).filter(Boolean);
            let active = null;
            for (const k in scenarios) {
                if (scenarios[k].keys.some(key=>uploaded.some(u=>u.includes(key)))) { active=scenarios[k]; break; }
            }
            const createBox=(txt,ok)=>{
                const clr=ok?'#00e87a':'#ff4d6a';
                return `<div style="padding:4px 6px;border-radius:3px;font-size:10px;font-weight:600;text-align:center;border-right:3px solid ${clr};background:${clr}18;color:${ok?'#85ff9e':'#ff8585'};margin-bottom:2px">${ok?'':'⚠ '}${txt.toUpperCase()}</div>`;
            };
            let html = active ? createBox(active.label, true) : createBox('KAZA EVRAĞI BULUNAMADI', false);
            if (active) {
                active.req.forEach(req=>{
                    const found=uploaded.some(d=>req.k.some(k=>d.includes(k)));
                    html+=createBox(req.l, found);
                });
            }
            const optional=[{k:['poliçe'],l:'Poliçe'},{k:['fatura'],l:'Fatura'},{k:['ibraname','ibra'],l:'İbraname'},{k:['tramer'],l:'Tramer'},{k:['vergi levhası'],l:'Vergi Levhası'}];
            optional.forEach(or=>{
                if(uploaded.some(d=>or.k.some(k=>d.includes(k)))) html+=createBox(or.l, true);
            });
            el.innerHTML = html;
        };

        /* Küçük sidebar inject */
        setTimeout(()=>{
            if (document.getElementById('ks2-evrak-sidebar')) return;
            const sb=document.createElement('div');
            sb.id='ks2-evrak-sidebar';
            sb.style.cssText=`position:fixed;top:4px;left:4px;z-index:${CFG.zIndex};background:rgba(10,10,14,.9);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:8px;width:140px;font-family:'Syne','Segoe UI',sans-serif`;
            sb.innerHTML=`<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:#55556a;text-transform:uppercase;margin-bottom:6px;border-bottom:2px solid ${TC};padding-bottom:3px">Evrak Analizi</div><div id="ks2-evrak-status"><div style="color:#55556a;font-size:9px">Taranıyor...</div></div>`;
            document.body.appendChild(sb);
            setInterval(updateEvrakPanel, 2000);
            KSLog.ok('Evrak analiz paneli hazır');
        },600);
    }

    /* ═══════════════════════════════════════════════════════════
       13. MODÜL: BİLDİRİM ENGELLEYİCİ
    ═══════════════════════════════════════════════════════════ */
    if (CFG.system && CFG.bildirim && url.includes('otohasar') && url.includes('eks_hasar.php')) {
        const w = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
        const counts = {};
        const MAX = 3;
        const showBar = (msg, cnt) => {
            let bar = document.getElementById('ks2-notif-bar');
            if (!bar) {
                bar=document.createElement('div');bar.id='ks2-notif-bar';
                Object.assign(bar.style,{position:'fixed',top:'0',left:'0',width:'100%',backgroundColor:'#c0392b',color:'#fff',textAlign:'center',padding:'8px',zIndex:'9999999',fontSize:'12px',fontWeight:'bold',fontFamily:'sans-serif',boxShadow:'0 2px 10px rgba(0,0,0,.3)',transition:'opacity .5s',pointerEvents:'none'});
                document.body.appendChild(bar);
            }
            bar.textContent=`[${cnt}. tekrar] Otomatik geçildi: ${msg.substring(0,100)}`;
            bar.style.opacity='1';
            clearTimeout(w._ks2NotifTimeout);
            w._ks2NotifTimeout=setTimeout(()=>{if(document.getElementById('ks2-notif-bar'))document.getElementById('ks2-notif-bar').style.opacity='0';},3000);
        };
        const raw={alert:w.alert.bind(w),confirm:w.confirm.bind(w),prompt:w.prompt.bind(w)};
        w.alert = m => { counts[m]=(counts[m]||0)+1; if(counts[m]>MAX){showBar(m,counts[m]);return;} return raw.alert(m); };
        w.confirm = m => { counts[m]=(counts[m]||0)+1; if(counts[m]>MAX){showBar(m,counts[m]);return true;} return raw.confirm(m); };
        w.prompt = (m,d) => { counts[m]=(counts[m]||0)+1; if(counts[m]>MAX){showBar(m,counts[m]);return d||'';} return raw.prompt(m,d); };
        KSLog.ok('Bildirim engelleyici aktif');
    }

    /* ═══════════════════════════════════════════════════════════
       14. MODÜL: SBM
    ═══════════════════════════════════════════════════════════ */
    if (CFG.system && CFG.sbm && url.includes('online.sbm.org.tr')) {

        /* Hızlı seçim butonları */
        if (url.includes('genelSorguEksper')) {
            const sirketler=[
                {ad:'TÜRKİYE',kod:'026',renk:'#1e3a8a'},{ad:'MAPFRE',kod:'050',renk:'#e11d48'},
                {ad:'ATLAS',kod:'108',renk:'#059669'},{ad:'AKSG.',kod:'004',renk:'#ea580c'},
                {ad:'HEPİYİ',kod:'126',renk:'#7c3aed'},{ad:'ANKARA',kod:'009',renk:'#2563eb'},
                {ad:'QUICK',kod:'110',renk:'#d1a401'},{ad:'SOMPO',kod:'061',renk:'#4b5563'},
                {ad:'RAY',kod:'042',renk:'#4b5563'},{ad:'ANADOLU',kod:'007',renk:'#4b5563'},
            ];
            const check=setInterval(()=>{
                const sel=document.getElementById('sigortaSirketKod');
                if(!sel||document.getElementById('ks2-sbm-quick')) return;
                const cont=document.createElement('div');cont.id='ks2-sbm-quick';
                cont.style.cssText='display:inline-flex;flex-wrap:wrap;gap:3px;margin-left:6px;vertical-align:middle';
                sirketler.forEach(s=>{
                    const b=document.createElement('button');b.type='button';b.textContent=s.ad;
                    b.style.cssText=`background:${s.renk};border:0;color:#fff;padding:3px 7px;border-radius:3px;font-size:10px;font-weight:bold;cursor:pointer`;
                    b.onclick=()=>{
                        sel.value=s.kod;
                        ['change','input'].forEach(ev=>sel.dispatchEvent(new Event(ev,{bubbles:true})));
                        if(window.jQuery) window.jQuery(sel).trigger('change');
                    };
                    cont.appendChild(b);
                });
                sel.parentNode.insertBefore(cont,sel.nextSibling);
                clearInterval(check);
            },1000);
        }

        /* Tramer numarası 3'lü bölme + poliçe renklendirme */
        if (url.includes('trm-ktt')) {
            const parseDate=s=>{const b=s?.split(' ')[0].split('/');return b?.length===3?new Date(b[2],b[1]-1,b[0]):null;};
            const formatLong=text=>text.replace(/\b\d{17,}\b/g,m=>{
                const f=m.replace(/\B(?=(\d{3})+(?!\d))/g,' ');
                updateNumPanel(f); return f;
            });

            let numPanel;
            const updateNumPanel=(num)=>{
                if(!numPanel){
                    numPanel=document.createElement('div');
                    Object.assign(numPanel.style,{position:'fixed',top:'5px',left:'50%',transform:'translateX(-50%)',backgroundColor:'rgba(255,255,255,.85)',padding:'8px 18px',borderRadius:'7px',boxShadow:'0 2px 8px rgba(0,0,0,.2)',zIndex:'10000',fontFamily:'monospace',fontSize:'20px',display:'none',whiteSpace:'nowrap',textAlign:'center'});
                    numPanel.onclick=()=>{const raw=numPanel.querySelector('span.ks2-num')?.textContent?.replace(/\s/g,'');if(raw)navigator.clipboard.writeText(raw);};
                    document.body.appendChild(numPanel);
                }
                numPanel.innerHTML=`<span class="ks2-num" style="font-weight:bold;color:#000;cursor:pointer" title="Kopyala">${num}</span><span style="margin:0 12px;color:#999">|</span><span style="color:#666">${new Date().toLocaleDateString('tr-TR')}</span>`;
                numPanel.style.display='block';
            };

            const processNodes=root=>{
                const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false);
                let node;
                while((node=walker.nextNode())){
                    if(/\d{17,}/.test(node.nodeValue)){
                        const nv=formatLong(node.nodeValue);
                        if(nv!==node.nodeValue) node.nodeValue=nv;
                    }
                }
            };

            const analyzePolicies=()=>{
                const kazaInp=document.getElementById('ihbarPoliceSorguBilgileriForm.kazaTarihi');
                const kazaT=parseDate(kazaInp?.value);
                if(!kazaT||isNaN(kazaT)) return;
                document.querySelectorAll('tr.odd,tr.even').forEach(row=>{
                    const m=row.innerText.match(/(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/);
                    if(!m) return;
                    const dS=parseDate(m[1]),dE=parseDate(m[2]);
                    if(!dS||!dE) return;
                    let color='#f8d7da';
                    if(kazaT>=dS&&kazaT<=dE){
                        const gun=Math.floor((kazaT-dS)/864e5);
                        color=gun<=2?'#f8c291':gun<=7?'#fff3cd':'#d4edda';
                    }
                    row.style.setProperty('background-color',color,'important');
                });
            };

            const obs=new MutationObserver(muts=>{
                obs.disconnect();
                muts.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)processNodes(n);else if(n.nodeType===3&&/\d{17,}/.test(n.nodeValue))n.nodeValue=formatLong(n.nodeValue);}));
                analyzePolicies();
                obs.observe(document.body,{childList:true,subtree:true});
            });

            const initSbm=()=>{
                processNodes(document.body);
                analyzePolicies();
                obs.observe(document.body,{childList:true,subtree:true});
                KSLog.ok('SBM Tramer bölme aktif');
            };
            if(document.readyState==='complete') initSbm();
            else unsafeWindow.addEventListener('load',initSbm);
        }

        /* Tutanak resim indirme */
        if (url.includes('listShowTutanakResimleriPage')) {
            const initSbmImg=()=>{
                if(document.getElementById('ks2-sbm-dl')) return;
                const panel=document.createElement('div');panel.id='ks2-sbm-dl';
                Object.assign(panel.style,{position:'fixed',top:'5px',right:'5px',background:'rgba(0,0,0,.9)',borderRadius:'4px',padding:'5px',zIndex:'2147483647',display:'flex',flexDirection:'column',gap:'4px',width:'100px',border:'1px solid #555'});
                const btn=document.createElement('button');btn.textContent='RESİMLERİ İNDİR';
                Object.assign(btn.style,{background:'#27ae60',border:'0',borderRadius:'2px',color:'#fff',cursor:'pointer',fontWeight:'bold',padding:'5px',fontSize:'9px',width:'100%',textTransform:'uppercase'});
                btn.onclick=async()=>{
                    let count=0;
                    for(const img of document.querySelectorAll('img')){
                        if((img.naturalWidth||img.width)>=300){
                            count++;
                            const url=img.src;if(!url||url.startsWith('data:'))continue;
                            const fname=`tutanak_${count}_${Date.now()}.jpg`;
                            try{const r=await fetch(url);const blob=await r.blob();const a=document.createElement('a');a.href=unsafeWindow.URL.createObjectURL(blob);a.download=fname;document.body.appendChild(a);a.click();a.remove();unsafeWindow.URL.revokeObjectURL(a.href);}catch(e){}
                        }
                    }
                    btn.textContent=`BİTTİ (${count})`;setTimeout(()=>{btn.textContent='RESİMLERİ İNDİR';},3000);
                };
                panel.appendChild(btn);document.body.appendChild(panel);
            };
            unsafeWindow.addEventListener('load',initSbmImg);
            setTimeout(initSbmImg,2000);
        }
    }

    /* ═══════════════════════════════════════════════════════════
       15. MODÜL: SAHİBİNDEN
    ═══════════════════════════════════════════════════════════ */
    if (CFG.system && CFG.sahibinden && url.includes('sahibinden.com') && !location.pathname.includes('/ilan/') && !location.pathname.includes('/kategori/')) {
        if (!location.search.includes('pagingSize=50')) {
            const u=new URL(location.href);u.searchParams.set('pagingSize','50');location.replace(u.href);
        }
        const initShb=()=>{
            const getIdx=(names)=>{
                const hdrs=document.querySelectorAll('table thead td,table thead th');
                return [...hdrs].findIndex(h=>names.some(n=>h.innerText.trim().toLowerCase()===n.toLowerCase()));
            };
            let lastState='';
            const calc=()=>{
                const fIdx=getIdx(['Fiyat','Price']);
                const kIdx=getIdx(['KM','Mileage']);
                if(fIdx===-1) return;
                const rows=document.querySelectorAll('table tbody tr:not(.nativeAd)');
                let fTop=0,fAd=0,fMin=Infinity,fMax=0,kmTop=0,kmAd=0,kmMin=Infinity,kmMax=0;
                rows.forEach(row=>{
                    const cells=row.cells;if(!cells||cells.length<=Math.max(fIdx,kIdx)) return;
                    const vF=parseFloat(cells[fIdx].innerText.replace(/[^\d]/g,''));
                    if(vF>0){fTop+=vF;fAd++;if(vF<fMin)fMin=vF;if(vF>fMax)fMax=vF;}
                    if(kIdx!==-1){const vK=parseInt(cells[kIdx].innerText.replace(/[^\d]/g,''),10);if(!isNaN(vK)){kmTop+=vK;kmAd++;if(vK<kmMin)kmMin=vK;if(vK>kmMax)kmMax=vK;}}
                });
                if(!fAd) return;
                const state=`${fAd}-${fTop}-${kmTop}`;if(state===lastState) return;lastState=state;
                const fOrt=Math.round(fTop/fAd).toLocaleString('tr-TR');
                const kOrt=kmAd?Math.round(kmTop/kmAd).toLocaleString('tr-TR'):'-';
                let box=document.getElementById('ks2-shb-box');
                if(!box){
                    box=document.createElement('div');box.id='ks2-shb-box';
                    Object.assign(box.style,{position:'fixed',bottom:'40px',right:'4px',zIndex:CFG.zIndex,background:'rgba(10,10,14,.9)',backdropFilter:'blur(14px)',border:`1px solid ${TC}44`,borderRadius:'8px',padding:'10px 12px',color:'#fff',fontFamily:"'Syne','Segoe UI',sans-serif",minWidth:'170px',fontSize:'11px',boxShadow:`0 0 20px ${TC}22`});
                    document.body.appendChild(box);
                }
                box.innerHTML=`
                    <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:#55556a;text-transform:uppercase;margin-bottom:6px;border-bottom:2px solid ${TC};padding-bottom:3px">📊 ${fAd} İlan Analizi</div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="color:#888">Ortalama Fiyat</span><b>${fOrt} ₺</b></div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="color:#888">Ortalama KM</span><b>${kOrt}</b></div>
                    <hr style="border:0;border-top:1px solid #333;margin:4px 0">
                    <div style="font-size:9px;color:#555;display:flex;justify-content:space-between"><span>Min: ${fMin.toLocaleString('tr-TR')} ₺</span><span>Max: ${fMax.toLocaleString('tr-TR')} ₺</span></div>`;
            };
            const waitTable=()=>{ if(document.querySelector('table')){calc();setInterval(calc,2000);}else setTimeout(waitTable,500); };
            waitTable();
            KSLog.ok('Sahibinden analiz aktif');
        };
        if(document.readyState==='complete') initShb();
        else unsafeWindow.addEventListener('load',initShb);
    }

    /* ═══════════════════════════════════════════════════════════
       16. MODÜL: WHATSAPP
    ═══════════════════════════════════════════════════════════ */
    if (CFG.system && CFG.whatsapp && url.includes('web.whatsapp.com')) {
        const getFileName=()=>{
            const d=new Date();const pad=n=>String(n).padStart(2,'0');
            return `WhatsApp_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}.jpeg`;
        };
        const dl=(url,name)=>{const a=document.createElement('a');a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();};
        document.addEventListener('dblclick',e=>{
            const img=e.target.closest('img._ao3e')||(e.target.tagName==='IMG'?e.target:null);
            if(!img?.src) return;
            e.stopPropagation();e.preventDefault();
            const name=getFileName();
            if(typeof GM_download==='function'){
                GM_download({url:img.src,name,saveAs:false,onerror:err=>{if(!['not_permitted','not_supported'].includes(err.error))dl(img.src,name);}});
            } else { dl(img.src,name); }
        },true);
        KSLog.ok('WhatsApp indirme aktif');
    }

    /* ═══════════════════════════════════════════════════════════
       17. MODÜL: TÜRKİYE SİGORTA
    ═══════════════════════════════════════════════════════════ */
    if (CFG.system && CFG.trsigorta && url.includes('hasaroto.turkiyesigorta.com.tr') && !url.includes('sign-in')) {

        /* Tab stillerini güzelleştir */
        GM_addStyle(`
            .tab-header{display:flex!important;justify-content:center!important;align-items:center!important;gap:8px!important;padding:8px!important;background:#f8fafc!important;border-radius:16px!important;width:fit-content!important;margin:0 auto 20px!important;border:1px solid #e2e8f0!important}
            .tab-header .tab-button,.osem-tab-btn{border:1px solid transparent!important;background:transparent!important;color:#64748b!important;padding:10px 20px!important;font-size:12px!important;font-weight:700!important;border-radius:10px!important;cursor:pointer!important;transition:all .2s!important;text-transform:uppercase!important;letter-spacing:.5px!important}
            .tab-header .tab-button.active,.osem-tab-btn.active{background:#fff!important;color:#0f172a!important;border:1px solid #cbd5e1!important;box-shadow:0 4px 12px rgba(0,0,0,.08)!important;transform:translateY(-1px)!important}
            .dx-toast-stack{right:auto!important;left:4px!important;bottom:35px!important;width:220px!important;z-index:999999!important}
        `);

        /* Sidebar navigasyon */
        const wv = CFG.panelWidth + 4;
        GM_addStyle(`
            #ks2-ts-nav{position:fixed!important;right:0!important;top:54px!important;width:${wv}px!important;height:calc(100% - 54px)!important;padding:12px 5px!important;background:rgba(230,230,230,.9)!important;backdrop-filter:blur(20px)!important;box-shadow:-4px 0 12px ${TC}22!important;z-index:1!important;display:flex!important;flex-direction:column!important;align-items:center!important;overflow-y:auto!important;gap:4px!important;font-family:'Syne','Segoe UI',sans-serif!important}
            .ks2-ts-btn{display:flex!important;align-items:center!important;justify-content:center!important;width:92%!important;min-height:38px!important;padding:7px 12px!important;background:#fff!important;color:#334155!important;text-decoration:none!important;font-size:12px!important;font-weight:600!important;border:1px solid rgba(0,170,255,.12)!important;border-radius:10px!important;box-shadow:0 1px 3px rgba(0,170,255,.05)!important;transition:all .2s!important;cursor:pointer!important;text-align:center!important;line-height:1.3!important;word-break:break-word!important}
            .ks2-ts-btn:hover{background:#f0f9ff!important;color:${TC}!important;border-color:${TC}!important;transform:translateY(-1px)!important}
            .dx-drawer-wrapper{padding-right:${wv}px!important}
            #ks2-ts-scroll-up,#ks2-ts-scroll-dn{position:fixed!important;right:calc(${wv}px - 8px)!important;width:38px!important;height:38px!important;background:${TC}!important;color:#000!important;border-radius:50%!important;border:none!important;cursor:pointer!important;z-index:2!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:16px!important;font-weight:bold!important;box-shadow:0 0 0 3px rgba(230,230,230,.9),-3px 0 8px ${TC}44!important;transition:all .2s!important}
            #ks2-ts-scroll-up{top:64px!important}#ks2-ts-scroll-dn{bottom:5px!important}
            #ks2-ts-scroll-up:hover,#ks2-ts-scroll-dn:hover{filter:brightness(1.1);transform:scale(1.08)}
        `);

        const updateTsMenu=()=>{
            let nav=document.getElementById('ks2-ts-nav');
            if(!nav){
                nav=document.createElement('div');nav.id='ks2-ts-nav';
                const upBtn=document.createElement('button');upBtn.id='ks2-ts-scroll-up';upBtn.textContent='↑';upBtn.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
                const dnBtn=document.createElement('button');dnBtn.id='ks2-ts-scroll-dn';dnBtn.textContent='↓';dnBtn.onclick=()=>window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
                document.body.appendChild(nav);document.body.appendChild(upBtn);document.body.appendChild(dnBtn);
            }
            const sel='.accordion-header,.dx-field-item-content .dx-form-group-caption';
            const els=[...document.querySelectorAll(sel)].filter(e=>e.offsetParent!==null);
            els.sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top);
            const cur=els.map(e=>e.innerText.trim().split('\n')[0]).join('|');
            if(nav.dataset.last===cur) return; nav.dataset.last=cur; nav.innerHTML='';
            const seen=new Set();
            els.forEach((el,i)=>{
                if(el.closest('.osem-tab-buttons')||el.classList.contains('tab-button')) return;
                const txt=el.innerText.replace(/\s+/g,' ').trim().split('\n')[0];
                if(txt.length<3||seen.has(txt)) return; seen.add(txt);
                if(!el.id) el.id='ks2-ts-target-'+i;
                const b=document.createElement('button');b.className='ks2-ts-btn';b.textContent=txt;
                b.onclick=()=>{ const pos=el.getBoundingClientRect().top+window.pageYOffset-68; window.scrollTo({top:pos,behavior:'smooth'}); };
                nav.appendChild(b);
            });
        };

        /* Popup kapatma butonu */
        const popupObs=new MutationObserver(()=>{
            document.querySelectorAll('.dx-overlay-wrapper.dx-overlay-shader').forEach(overlay=>{
                if(overlay.querySelector('.ks2-ts-close')) return;
                const targetTitles=['Seddk','Ön Rapor Gönderilmeme'];
                if(!targetTitles.some(t=>overlay.innerText.includes(t))) return;
                const btn=document.createElement('button');btn.className='ks2-ts-close';btn.innerHTML='✕';
                Object.assign(btn.style,{position:'absolute',top:'10px',right:'16px',zIndex:'99999',background:'#ff4d4d',color:'#fff',border:'none',borderRadius:'4px',width:'30px',height:'30px',cursor:'pointer',fontSize:'16px',fontWeight:'bold'});
                btn.onclick=()=>overlay.remove();
                const content=overlay.querySelector('.dx-overlay-content');
                if(content){ if(getComputedStyle(content).position==='static')content.style.position='relative'; content.appendChild(btn); }
            });
        });
        popupObs.observe(document.body,{childList:true,subtree:true});

        /* Otomatik alan doldurma */
        const forceWrite=(input,value)=>{
            if(!input) return;
            const setter=Object.getOwnPropertyDescriptor(unsafeWindow.HTMLInputElement.prototype,'value').set;
            setter.call(input,value);
            ['input','change','blur'].forEach(n=>input.dispatchEvent(new Event(n,{bubbles:true})));
        };
        const handleMagicFill=input=>{
            if(!input||input.tagName!=='INPUT') return;
            const id=(input.id||'').toLowerCase(),name=(input.name||'').toLowerCase(),html=(input.outerHTML||'').toLowerCase();
            const isPhone=id.includes('gsm')||name.includes('gsm')||id.includes('phone')||name.includes('phone')||id.includes('tel')||name.includes('tel');
            if(isPhone&&(input.value.includes('_')||!input.value.trim()||input.value.length<5)){
                input.focus();forceWrite(input,'');
                setTimeout(()=>{
                    const dt=new DataTransfer();dt.setData('text','1111111111');
                    input.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));
                    setTimeout(()=>{input.dispatchEvent(new Event('change',{bubbles:true}));input.blur();},100);
                },100);
                return;
            }
            const isOwner=id.includes('carownername')||html.includes('carownername');
            if(isOwner&&!input.value.trim()){
                const fName=document.querySelector('input[id*="Name"]:not([id*="victim"])')?.value||'';
                const lName=document.querySelector('input[id*="Surname"]:not([id*="victim"])')?.value||'';
                const full=(fName+' '+lName).trim();
                if(full.length>1) forceWrite(input,full);
            }
        };
        document.addEventListener('focusin',e=>{
            if(e.target.classList.contains('dx-texteditor-input')) setTimeout(()=>handleMagicFill(e.target),250);
        },true);

        window.addEventListener('load',()=>setTimeout(updateTsMenu,1500));
        setInterval(updateTsMenu,1500);
        KSLog.ok('Türkiye Sigorta modülü aktif');
    }

    /* ═══════════════════════════════════════════════════════════
       18. PANEL BAŞLATMA
    ═══════════════════════════════════════════════════════════ */
    if (window.self === window.top) {
        const boot = () => {
            KS2.init();

            /* Mapfre zoom fix */
            if(url.includes('otohasar')&&url.includes('mapfre')){
                GM_addStyle(`html,body{zoom:.99!important;overflow-x:auto!important}`);
            }

            KSLog.ok('Panel başlatıldı — ' + location.hostname);
            KSLog.info('Aktif modüller yükleniyor...');
        };

        if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
        else setTimeout(boot, 100);
    }

})();
