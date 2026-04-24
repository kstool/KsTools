// ==UserScript==
// @name         KS TOOLS PANEL
// @namespace    KS_TOOLS_PANEL
// @version      1.48
// @license      GPL-3.0
// @description  OtoHasar Dinamik Form Panel / Parça - Manuel ve Çoklu ekleme / Donanim Panel / SBM Tramer no ayırma ve resim indirme / Wp resim indirme
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
// @connect      google.com
// @updateURL    https://github.com/sayginkizilkaya/Ks-Tools/raw/main/KS_TOOLS.user.js
// @downloadURL  https://github.com/sayginkizilkaya/Ks-Tools/raw/main/KS_TOOLS.user.js
// ==/UserScript==
(function () {
    'use strict';
    /* ---Eklenecekler
        Gerekli evrak gösteren panel - duruma bağlı
        Veriyi sayfalar arası taşıma - aynı adres kökünde
        Resim okuma gelişimi - isme göre
        Ek tasarım şekilleri */
    const url = location.href.toLowerCase();
    const hedefSiteler = /otohasar|sahibinden|sigorta|anadolusigorta|akcozum2|sbm|whatsapp/;
    const blockedGroups = ["yazdir", "print", "rapor", "ihbar", "dilekce", "fatura", "makbuz", "dekont", "invoice", "receipt", "barcode", "kimlik", "kart"];
    if (!hedefSiteler.test(url) || blockedGroups.some(word => url.includes(word))) { return; }
    let config = {
        bottom: '0px', right: '0px', width: '270px', collapsedWidth: '270px',
        themeColor: '#1cb2cd', Color: 'white', borderRadius: '4px', blur: '15px',
        isCollapsed: false, wasDragging: false, zIndex: 3169999
    };
    const getSetting = (key) => GM_getValue(key, true);
    const setSetting = (key, val) => GM_setValue(key, val);
    const themes = {
        'online.sbm.org': 'white', // SBM Beyaz
        'quicksigorta': '#d1a401', // Quick Sarı (Canlı Ton)
        'anadolusigorta': '#005ba4', // Anadolu Mavi
        'corpussigorta': '#8b5e34', // Corpus
        'turkiyesigorta': '#1cb2cd', // Türkiye Sigorta Deniz Mavisi
        'otohasar.hepiyi': '#55ac05', // Hepiyi Turuncu/Kırmızı
        'otohasar.atlas': '#005596', // Atlas Mavi
        'otohasar.mapfre': '#e00d26', // Mapfre Kırmızı
        'otohasar.akcozum2': '#eb5311', // Aksigorta Turuncu
        'otohasar.bereket': '#04b03d', // Bereket Yeşil
        'otohasar.turknippon': '#0054a6', // Türk Nippon Mavi
        'otohasar.allianz': '#164481', // Allianz Lacivert
        'otohasar.sompo': '#e20613', // Sompo Kırmızı
        'otohasar.hdi': '#007a33', // HDI Yeşil
        'otohasar.groupama': '#007a33', // Groupama Yeşil
        'otohasar.axa': '#00008f', // AXA Mavi
        'otohasar.ray': '#ed1c24', // Ray Sigorta Kırmızı
        'otohasar.unico': '#e30613', // Unico Kırmızı
        'otohasar.doga': '#009640', // Doğa Yeşil
        'otohasar.allianz': '#164481'
    };
    const matchedKey = Object.keys(themes).find(key => url.includes(key));
    if (matchedKey) config.themeColor = themes[matchedKey];
    const injectStyles = () => {
        const style = document.createElement('style');
        style.id = 'ks-dynamic-styles';
        style.innerHTML = `
				@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');
				.ks-draggable-panel {
                    position: fixed !important;
                    bottom: ${config.bottom};
                    right: ${config.right};
                    width: ${config.width};
					min-width: ${config.width};
                    /*background: rgba(25, 25, 27, 0.75);*/
					background-image: linear-gradient(180deg, rgba(15,15,15,0.65), rgba(15,15,15,0.65));
					backdrop-filter: blur(${config.blur});
					-webkit-backdrop-filter: blur(${config.blur}) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: ${config.borderRadius};
                    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
					z-index: ${config.zIndex};
					color: ${config.Color};
                	font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
                    overflow: hidden;
                    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s ease;
                    user-select: none;
                    display: flex;
                    flex-direction: column;
                    min-height: min-content;
                    max-height: 90vh;
                }
                .ks-dragging {
                    transition: none !important;
                }
				.ks-draggable-panel {
                    resize: both;
                    overflow: auto;
					transition: opacity 0.2s ease;
                }
                /* Küçülmüş Mod (Collapsed) */
                .ks-draggable-panel.collapsed {
					resize: none;
                    width: ${config.collapsedWidth};
				    min-width: ${config.collapsedWidth};
                    height: auto !important;
                    overflow: hidden !important;
                }
				.ks-draggable-panel:hover {
				    background: rgba(25, 25, 25, 0.75);
				    border-color: rgba(255, 255, 255, 0.2);
				    box-shadow: 0 8px 15px rgba(0,0,0,0.6);
                    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s ease;
				}
               .ks-header {
			   	   background: rgba(25, 25, 27, 0.85);
                   padding: 5px;
                   background: rgba(255, 255, 255, 0.03);
                   cursor: hand;
                   display: flex;
                   justify-content: space-between;
                   align-items: center;
                   border-bottom: 2px solid ${config.themeColor}44;
                   box-shadow: inset 0 1px 10px rgba(0, 0, 0, 0.2);
                   transition: background 0.3s ease;
               }
               .ks-header:hover {
                   background: rgba(255, 255, 255, 0.1);
                   color: ${config.themeColor};
                   text-shadow:
                       0 0 4px ${config.themeColor},
                       0 0 14px ${config.themeColor};
                   filter: brightness(1.2);
               }
               .ks-header h4 {
                   margin: 0;
                   font-size: 12px;
                   color: color-mix(in srgb, ${config.themeColor}, white 30%) !important;
                   pointer-events: none;
                   font-weight: 800;
                   text-transform: uppercase;
                   letter-spacing: 1px;
                   text-shadow: 0 1px 4px rgba(0,0,0,0.5) !important;
               }
               /* İçerik Alanı */
               .ks-content {
                   padding: 4px;
                   gap: 2px;
				   flex: 1;
                   display: flex;
                   flex-direction: column;
                   color: ${config.Color};
                   transition: opacity 0.2s;
                   width: 100% !important;
                   max-width: 100%;
                   box-sizing: border-box;
                   overflow-x: hidden;
                   word-wrap: break-word;
               }
               .ks-content * {
                   max-width: 100% !important;
                   box-sizing: border-box !important;
               }
               .ks-draggable-panel.collapsed .ks-content {
                   opacity: 0;
                   pointer-events: none;
               }
               /* Modern Butonlar */
               .ks-btn {
                   background: ${config.themeColor};
                   color: white !important;
                   border: none;
                   padding: 4px;
                   border-radius: ${config.borderRadius};
                   font-weight: bold;
                   cursor: pointer;
                   font-size: 12px;
                   transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
				   outline: none;
               }
               .ks-btn:hover {
                   filter: brightness(1.1);
                   transform: translateY(-2px);
                   text-shadow: 0 0 5px rgba(255,255,255,0.5);
                   box-shadow: 0 6px 12px ${config.themeColor}66;
				   }
               .ks-btn:active {
                   transform: translateY(1px);
                   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
               }
               /* Kırmızı Neon Buton */
               .ks-btn-danger {
                   background: #ff4d4d !important;
                   color: white !important;
                   border: none;
                   padding: 6px;
                   border-radius: ${config.borderRadius};
                   font-weight: bold;
                   cursor: pointer;
                   font-size: 12px;
                   transition: all 0.2s ease;
                   box-shadow: 0 0 5px #ff4d4d;
               }
               .ks-btn-danger:hover {
                   filter: brightness(1.2);
                   box-shadow: 0 0 10px #ff4d4d,
                               0 0 20px #ff4d4d,
                               0 0 30px #ff1a1a !important;
                   text-shadow: 0 0 5px rgba(255,255,255,0.5);
               }
               .ks-btn-danger:active {
                   filter: brightness(1.1);
                   transform: translateY(-2px);
                   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
               }
               #shb-res-box { font-size: 13px; color: white; margin: 2px 0 2px 0; text-align: center; }
               @keyframes neonPulse {
            		0%, 100% { box-shadow: 0 0 5px ${config.themeColor}66; }
            		50% { box-shadow: 0 0 15px ${config.themeColor}AA; }
               }
               .ks-tooltip-container {
                    position: relative;
                    display: inline-block;
               }
               .ks-tooltip-box {
                   display: none !important;
                   border-color: ${config.themeColor};
               }
               #ks-dynamic-tooltip {
                   position: fixed;
                   z-index: ${Number(config.zIndex) + 100000};
                   width: 230px;
                   padding: 10px 14px;
                   background: rgba(15, 15, 18, 0.75);
                   color: #f0f0f0;
               	font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
                   font-size: 11px;
                   line-height: 1.5;
                   border-radius: ${config.borderRadius};
                   border: 2px solid ${config.themeColor};
                   backdrop-filter: blur(10px);
                   -webkit-backdrop-filter: blur(10px);
                   box-shadow: 0 0 30px rgba(15, 15, 15, 0.5);
                   pointer-events: none;
                   opacity: 0;
                   visibility: hidden;
                   transition: opacity 0.2s ease, transform 0.2s ease;
               }
               #ks-dynamic-tooltip.visible {
                   opacity: 1;
                   visibility: visible;
                   animation: neonPulse 3s infinite ease-in-out;
               }
               #ks-dynamic-tooltip::before {
                   content: "";
                   position: absolute;
                   inset: -2px;
                   border-radius: inherit;
                   z-index: -1;
                   box-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
                   opacity: 0.6;
               }
               #ks-dynamic-tooltip strong {
                   align-items: center;
                   text-align: center;
                   color: inherit;
                   filter: brightness(1.7);
                   font-size: 12px;
                   display: block;
                   margin-bottom: 4px;
                   text-transform: uppercase;
                   font-weight: 800;
                   letter-spacing: 0.5px;
               }
               @keyframes neonPulse {
                   0%, 100% { filter: brightness(0.9); }
                   50% { filter: brightness(1.3); }
               }
               .ks-tooltip-box { display: none !important; }
            `;
        document.head.appendChild(style);
    };
    const initPanel = () => {
        const panel = document.createElement('div');
        panel.className = 'ks-draggable-panel';
        panel.id = 'ks-master-panel';
        const isCollapsedSaved = localStorage.getItem('ks-panel-collapsed') === 'true';
        panel.innerHTML = `<div class="ks-content" id="ks-content" style="display: ${isCollapsedSaved ? 'none' : 'block'}">Loading...</div>
	    <div class="ks-header" id="ks-header" style="border-top: 1px solid #333; border-bottom: none;"><h4>PANEL</h4> <span style="font-size: 10px; opacity: 0.5;">${isCollapsedSaved ? '▲' : '▼'}</span></div>`;
        if (isCollapsedSaved) panel.classList.add('collapsed');
        document.body.appendChild(panel);
        const content = document.getElementById('ks-content');
        const header = document.getElementById('ks-header');
        const icon = header.querySelector('span');
        const safeConfig = (typeof config !== 'undefined') ? config : { bottom: '20px', right: '20px' };
        let state = { isDragging: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0, dragThreshold: 5 };
        const setTransition = (t) => { panel.style.transition = t };
        const startDragging = (e) => {
            state.isDragging = true;
            panel.dataset.wasDragging = 'false';
            state.startX = e.clientX;
            state.startY = e.clientY;
            const rect = panel.getBoundingClientRect();
            state.offsetX = e.clientX - rect.left;
            state.offsetY = e.clientY - rect.top;
            setTransition('none');
            header.style.cursor = 'grabbing';
        };
        const onMouseMove = (e) => {
            if (!state.isDragging) return;
            const moveX = e.clientX - state.startX;
            const moveY = e.clientY - state.startY;
            if (Math.hypot(moveX, moveY) > state.dragThreshold) {
                panel.dataset.wasDragging = 'true';
                panel.style.left = `${e.clientX - state.offsetX}px`;
                panel.style.top = `${e.clientY - state.offsetY}px`;
                panel.style.right = 'auto';
                panel.style.bottom = 'auto';
            }
        };
        const onMouseUp = () => {
            if (!state.isDragging) return;
            state.isDragging = false;
            setTransition('width 0.3s ease, height 0.3s ease');
            setTimeout(() => { panel.dataset.wasDragging = 'false'; }, 200);
        };
        // --- B. KÜÇÜLTME/BÜYÜTME ---
        header.addEventListener('click', () => {
            if (panel.dataset.wasDragging === 'true') return;
            const isCollapsed = panel.classList.toggle('collapsed');
            icon.innerText = isCollapsed ? '▲' : '▼';
            content.style.display = isCollapsed ? 'none' : 'block';
            localStorage.setItem('ks-panel-collapsed', isCollapsed);
        });
        // --- C. YERİNE GERİ DÖNME ---
        panel.addEventListener('dblclick', (e) => {
            e.preventDefault();
            const rect = panel.getBoundingClientRect();
            panel.style.transition = 'none';
            panel.style.left = `${rect.left}px`;
            panel.style.top = `${rect.top}px`;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            requestAnimationFrame(() => {
                setTransition('all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)');
                panel.style.left = `${window.innerWidth - panel.offsetWidth - parseInt(safeConfig.right)}px`;
                panel.style.top = `${window.innerHeight - panel.offsetHeight - parseInt(safeConfig.bottom)}px`;
                setTimeout(() => {
                    setTransition('none');
                    panel.style.top = 'auto';
                    panel.style.left = 'auto';
                    panel.style.right = safeConfig.right;
                    panel.style.bottom = safeConfig.bottom;
                    panel.dataset.wasDragging = 'false';
                    setTimeout(() => { setTransition('width 0.3s ease, height 0.3s ease'); }, 50);
                }, 550);
            });
        });
        header.addEventListener('mousedown', startDragging);
        content.addEventListener('mousedown', startDragging);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };
    const tooltip = document.createElement('div');
    tooltip.id = 'ks-dynamic-tooltip';
    document.body.appendChild(tooltip);
    document.addEventListener('mouseover', (e) => {
        const container = e.target.closest('.ks-tooltip-container');
        if (container) {
            const box = container.querySelector('.ks-tooltip-box');
            if (box) {
                tooltip.innerHTML = box.innerHTML;
                tooltip.classList.add('visible');
                const color = getComputedStyle(box).borderColor;
                tooltip.style.borderColor = color;
                const strong = tooltip.querySelector('strong');
                if (strong) strong.style.color = color;
            }
        }
    });
    document.addEventListener('mousemove', (e) => {
        if (!tooltip.classList.contains('visible')) return;
        const gap = 15;
        const { clientX: x, clientY: y } = e;
        const { offsetWidth: tw, offsetHeight: th } = tooltip;
        const { innerWidth: winW, innerHeight: winH } = window;
        let left = Math.max(10, Math.min(x - tw / 2, winW - tw - 10));
        let top = y - th - gap;
        if (top < 10) {
            top = y + gap; tooltip.style.transform = 'translateY(5px)';
        } else { tooltip.style.transform = 'translateY(0)'; }
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.ks-tooltip-container')) {
            tooltip.classList.remove('visible');
        }
    });
    let isUnlocked = false;
    const unlockAllElements = (s) => {
        const sel = '[disabled],.disabled,[readonly],[aria-readonly="true"],[aria-disabled="true"],.ks-unlocked,.dx-texteditor-input';
        document.querySelectorAll(sel).forEach(el => {
            if (s) {
                if (el.disabled) { el.dataset.wd = "1"; el.disabled = false; }
                if (el.readOnly || el.hasAttribute('readonly') || el.getAttribute('aria-readonly') === "true") {
                    el.dataset.wr = "1"; el.readOnly = false; el.removeAttribute('readonly'); el.setAttribute('aria-readonly', 'false');
                }
                if (el.classList.contains('disabled')) { el.dataset.wc = "1"; el.classList.remove('disabled'); }
                el.classList.add('ks-unlocked');
                const st = { 'pointer-events': 'auto', 'opacity': '1', 'background-color': '#fff', 'border': '1px solid #e4e4e4', 'cursor': 'text' };
                Object.keys(st).forEach(p => el.style.setProperty(p, st[p], 'important'));
            } else {
                if (el.dataset.wd) el.disabled = true;
                if (el.dataset.wr) { el.readOnly = true; el.setAttribute('readonly', 'true'); el.setAttribute('aria-readonly', 'true'); }
                if (el.dataset.wc) el.classList.add('disabled');
                el.classList.remove('ks-unlocked');
                ['pointer-events', 'opacity', 'background-color', 'border', 'cursor'].forEach(p => el.style.removeProperty(p));
            }
        });
        window.isUnlocked = s;
    };
    const WARNING_COLOR = 'rgb(250, 250, 150)';
    const SUCCESS_COLOR = '#00ff88';
    const PANEL_ID = 'ks-global-status-indicator';
    if (window.self === window.top) {
		const injectFonts = () => {
        if (document.getElementById('ks2-fonts')) return;
        const link = document.createElement('link');
        link.id = 'ks2-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap';
        document.head.appendChild(link);
    };
        if (!document.getElementById(PANEL_ID + '-style')) {
			injectFonts();
            const style = document.createElement("style");
            style.id = PANEL_ID + '-style';
            style.innerText = `
                #${PANEL_ID} {
                    position: fixed !important;
                    bottom: ${config.bottom} !important;
                    left: ${config.right} !important;
                    height: 24px !important;
                    width: 24px !important;
                    background: rgba(10, 10, 10, 0.60) !important;
                    backdrop-filter: blur(${config.blur}) !important;
                    color: white !important;
                    font-family: 'Inter', sans-serif !important;
                    font-size: 11px !important;
                    font-weight: 800 !important;
                    z-index: ${Number(config.zIndex) + 9999} !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important; /* Tam ortalama */
                    overflow: hidden !important;
                    white-space: nowrap !important;
                    cursor: pointer !important;
                    border-radius: 0px 12px 0px 12px !important;
                    border: 1px solid ${config.themeColor} !important;
                    box-shadow: 0px 0px 8px 1px ${config.themeColor}66 !important;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
                    animation: ks-glow-pulse 3s infinite ease-in-out !important;
                    padding: 0px !important;
                }
                /* Hover Durumu */
                #${PANEL_ID}.active, #${PANEL_ID}:hover {
                    width: auto !important;
                    min-width: 24px !important;
                    max-width: 600px !important;
                    padding: 0 12px !important;
                    transform: skewX(-8deg) !important;
                    border-radius: 12px 0px 12px 0px !important;
                    background: #000 !important;
                    box-shadow: 4px 4px 15px ${config.themeColor}66 !important;
                }
                /* İçeriklerin Hoverda Dik Durması */
                #${PANEL_ID}:hover > * {
                    transform: skewX(8deg) !important;
                    display: flex !important;
                    align-items: center !important;
                }
                @keyframes ks-glow-pulse {
                    0%, 100% { border-color: ${config.themeColor}; opacity: 0.9; }
                    50% { border-color: ${SUCCESS_COLOR}; opacity: 1; box-shadow: 0 0 15px ${config.themeColor}88; }
                }
                #ks-dynamic-tooltip {
                    position: fixed; background: #000; color: #fff; padding: 5px 10px;
                    border-radius: 4px; font-size: 11px; pointer-events: none;
                    border: 1px solid ${config.themeColor}; z-index: 1000000;
                    transition: opacity 0.2s;
                }
				/* ══════════════ KS2 MODAL ══════════════ */
                #ks2-overlay {
            	    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            	    background: rgba(0,0,0,0.75); z-index: 2147483647;
            	    display: flex; align-items: center; justify-content: center;
            	    backdrop-filter: blur(6px);
            	}
            	#ks2-overlay *, #ks2-overlay *::before, #ks2-overlay *::after {
            	    box-sizing: border-box;
                	font-family: 'Rajdhani', 'Share Tech Mono', sans-serif;
            	    -webkit-font-smoothing: antialiased;
            	}
            	#ks2-root {
            	    --ks2-cy: #00d4ff; --ks2-cy2: #0099cc; --ks2-cy3: #00ff9d; --ks2-cy4: #ff3e6c;
            	    --ks2-bg0: #0a0c12; --ks2-bg1: #0e1118; --ks2-bg2: #131722; --ks2-bg3: #1a1f2e;
            	    --ks2-bd: rgba(0,212,255,0.13); --ks2-bd2: rgba(0,212,255,0.33);
            	    --ks2-txt: #c8d8f0; --ks2-txt2: #6b8aaa; --ks2-txt3: #3d5470;
            	    background: var(--ks2-bg0);
            	    border: 1px solid var(--ks2-bd2);
            	    border-radius: 1px;
            	    overflow: hidden;
            	    display: flex;
            	    width: 1000px;
            	    height: 580px;
            	    max-width: calc(100vw - 32px);
            	    max-height: calc(100vh - 48px);
            	    position: relative;
            	    color: var(--ks2-txt);
            	}
            	#ks2-root::before {
            	    content: '';
            	    position: absolute; top: 0; left: 0; right: 0; height: 1px;
            	    background: linear-gradient(90deg, transparent, var(--ks2-cy), transparent);
            	    z-index: 5; pointer-events: none;
            	}
            	/* Scanline */
            	#ks2-scanline {
            	    position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1;
            	}
            	#ks2-scanline::after {
            	    content: '';
            	    position: absolute; top: -100%; left: 0; width: 100%; height: 200%;
            	    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.012) 2px, rgba(0,212,255,0.012) 4px);
            	    animation: ks2-scan 10s linear infinite;
            	}
            	@keyframes ks2-scan { to { transform: translateY(50%); } }
            	/* ── Sidebar ── */
            	#ks2-sidebar {
            	    width: 215px; flex-shrink: 0;
            	    background: var(--ks2-bg1);
            	    border-right: 1px solid var(--ks2-bd);
            	    display: flex; flex-direction: column;
            	    position: relative; z-index: 2;
					padding: 5px 5px 5px 5px;
            	}
            	#ks2-sidebar::after {
            	    content: ''; position: absolute; top: 0; right: 0;
            	    width: 1px; height: 100%;
            	    background: linear-gradient(180deg,transparent,rgba(0,153,204,0.27),transparent);
            	    pointer-events: none;
            	}
            	.ks2-brand { padding: 18px 16px 14px; border-bottom: 1px solid var(--ks2-bd); }
            	.ks2-brand-hex { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
            	.ks2-brand-diamond {
            	    width: 30px; height: 30px; flex-shrink: 0;
            	    border: 1px solid var(--ks2-cy);
            	    display: flex; align-items: center; justify-content: center;
            	    transform: rotate(45deg);
            	}
            	.ks2-brand-diamond-inner { width: 10px; height: 10px; background: var(--ks2-cy); }
            	.ks2-brand-title {
            	    font-family: 'Share Tech Mono', monospace !important;
            	    font-size: 13px; color: var(--ks2-cy); letter-spacing: 2px; line-height: 1.2;
            	}
            	.ks2-brand-sub {
            	    font-family: 'Share Tech Mono', monospace !important;
            	    font-size: 14px; color: var(--ks2-txt2); letter-spacing: 2px;
            	}
            	.ks2-sys-row {
            	    display: flex; align-items: center; justify-content: space-between;
            	    padding-top: 15px; border-top: 1px solid var(--ks2-bd);
            	}
            	.ks2-sys-lbl {
            	    font-family: 'Share Tech Mono', monospace !important;
            	    font-size: 9px; color: var(--ks2-txt3); letter-spacing: 1px;
            	}
            	.ks2-sys-on {
            	    display: flex; align-items: center; gap: 5px;
            	    font-family: 'Share Tech Mono', monospace !important;
            	    font-size: 10px; color: var(--ks2-cy3);
            	}
            	.ks2-pulse {
            	    width: 6px; height: 6px; background: var(--ks2-cy3); border-radius: 50%;
            	    animation: ks2-pulse 1.5s infinite;
            	}
            	@keyframes ks2-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
            	.ks2-nav { padding: 15px 0; flex: 1; overflow-y: auto; font-size: 20px;}
            	.ks2-nav-sec {
            	    padding-left: 10px;
            	    font-family: 'Share Tech Mono', monospace !important;
            	    font-size: 15px; color: var(--ks2-txt2); letter-spacing: 2px;
            	}
            	.ks2-nav-item {
            	    display: flex; align-items: center; gap: 10px;
            	    padding: 9px 16px; cursor: pointer;
            	    border-left: 2px solid transparent;
            	    transition: background .15s, border-color .15s;
            	    position: relative;
            	}
            	.ks2-nav-item:hover { background: rgba(0,212,255,0.04); border-left-color: var(--ks2-cy2); }
            	.ks2-nav-item.ks2-active { background: rgba(0,212,255,0.07); border-left-color: var(--ks2-cy); }
            	.ks2-nav-icon {
            	    width: 30px; height: 30px; flex-shrink: 0;
            	    border: 0px solid var(--ks2-bd2);
            	    display: flex; align-items: center; justify-content: center;
            	    font-size: 13px; transition: border-color .15s, background .15s;
            	}
            	.ks2-nav-item.ks2-active .ks2-nav-icon { border-color: var(--ks2-cy); background: rgba(0,212,255,0.08); }
            	.ks2-nav-text {
            	    font-size: 12px; font-weight: 600; letter-spacing: .4px;
            	    color: var(--ks2-txt2); transition: color .15s; flex: 1;
            	}
            	.ks2-nav-item:hover .ks2-nav-text,
            	.ks2-nav-item.ks2-active .ks2-nav-text { color: var(--ks2-cy); }
            	.ks2-nav-count {
            	    font-family: 'Share Tech Mono', monospace !important;
            	    font-size: 10px; padding: 2px 6px;
            	    background: rgba(0,212,255,0.1); color: var(--ks2-cy2);
            	    border: 1px solid var(--ks2-bd2);
            	}
            	.ks2-sidebar-bottom { padding: 12px 16px; border-top: 1px solid var(--ks2-bd); }
            	.ks2-theme-row {
            	    display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
            	}
            	.ks2-theme-lbl {
            	    font-family: 'Share Tech Mono', monospace !important;
            	    font-size: 11px; color: var(--ks2-txt2); letter-spacing: 1.2px;
            	}
            	.ks2-ver-tag {
            	    font-family: 'Share Tech Mono', monospace !important;
					right:0;
            	    font-size: 11px; color: var(--ks2-cy);
            	    background: rgba(0,212,255,0.08); border: 1px solid var(--ks2-cy); padding: 3px 3px;
            	}
            	.ks2-color-dots { display: flex; gap: 4px; margin-top: 8px; }
            	.ks2-cdot { width: 24px; height: 24px; border: 1px solid transparent; cursor: pointer; transition: .15s; }
            	.ks2-cdot.ks2-sel { box-shadow: 0 0 0 1px var(--ks2-cy); }
            	/* ── Main ── */
            	#ks2-main {
            	    flex: 1; display: flex; flex-direction: column;
            	    overflow: hidden; background: var(--ks2-bg2); position: relative; z-index: 2;
            	}
            	.ks2-topbar {
            	    padding: 12px 18px; flex-shrink: 0;
            	    border-bottom: 1px solid var(--ks2-bd);
            	    background: var(--ks2-bg1);
            	    display: flex; align-items: center; justify-content: space-between;
            	}
            	.ks2-topbar-left { display: flex; align-items: center; gap: 8px; }
            	.ks2-bracket { font-family: 'Share Tech Mono', monospace !important; font-size: 9px;}
            	.ks2-topbar-title { font-size: 13px; font-weight: 700; letter-spacing: 1px; color: var(--ks2-txt); }
            	.ks2-ctrl-row { display: flex; align-items: center; gap: 10px; }
            	.ks2-ctrl-lbl { font-family: 'Share Tech Mono', monospace !important; font-size: 11px; letter-spacing: 1px; }
            	/* Toggle Switch */
            	.ks2-sw { position: relative; width: 42px; height: 20px; cursor: pointer; }
            	.ks2-sw input { opacity: 0; width: 0; height: 0; position: absolute; }
            	.ks2-sw-track { position: absolute; inset: 0; background: #1a1f2e; border: 1px solid #3d5470; transition: .2s; }
            	.ks2-sw-track::before { content: ''; position: absolute; width: 14px; height: 12px; top: 3px; left: 3px; background: #3d5470; transition: .2s; }
            	.ks2-sw input:checked + .ks2-sw-track { background: rgba(0,212,255,0.1); border-color: var(--ks2-cy); }
            	.ks2-sw input:checked + .ks2-sw-track::before { transform: translateX(22px); background: var(--ks2-cy); }
            	/* Content & Sections */
            	.ks2-content {
            	    flex: 1; overflow-y: auto; padding: 20px;
            	    scrollbar-width: thin; scrollbar-color: var(--ks2-cy) transparent;
            	}
            	.ks2-content::-webkit-scrollbar { width: 3px; }
            	.ks2-content::-webkit-scrollbar-thumb { background: var(--ks2-cy); }
            	.ks2-sec-view { display: none; }
            	.ks2-sec-view.ks2-active { display: block; }
            	/* Bulk Buttons */
            	.ks2-bulk-row { display: flex; gap: 8px; margin-bottom: 12px; }
            	.ks2-bulk-btn {
            	    flex: 1; position: relative; cursor: pointer;
            	    background: transparent; border: none; outline: none;
            	    font-family: 'Share Tech Mono', monospace !important;
            	    font-size: 10px; letter-spacing: 1.5px;
            	    color: var(--ks2-txt2); padding: 9px 0; transition: color .15s;
            	}
            	.ks2-bulk-btn::before {
            	    content: ''; position: absolute; inset: 0;
            	    border-top: 1px solid var(--ks2-bd2); border-bottom: 1px solid var(--ks2-bd2);
            	    transition: border-color .15s;
            	}
            	.ks2-bulk-btn:first-child::before { border-left: 1px solid var(--ks2-bd2); }
            	.ks2-bulk-btn:last-child::before { border-right: 1px solid var(--ks2-bd2); }
            	.ks2-bulk-btn:hover { color: var(--ks2-cy); }
            	.ks2-bulk-btn:hover::before { border-color: rgba(0,212,255,0.4); }
            	.ks2-bulk-btn span { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 6px; }
            	/* Card Grid */
            	.ks2-card-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 8px; }
            	.ks2-mod-card {
            	    background: var(--ks2-bg3);
            	    border: 1px solid var(--ks2-bd);
            	    transition: border-color .2s, background .2s;
            	    position: relative; overflow: hidden;
            	}
            	.ks2-mod-card::before {
            	    content: ''; position: absolute;
            	    width: 1px; height: 100%;
            	    background: var(--ks2-bd2); transition: background .2s;
            	}
            	.ks2-mod-card.ks2-on::before { background: var(--ks2-cy); }
            	.ks2-mod-card:hover { border-color: var(--ks2-cy2); background: rgba(0,212,255,0.03); }
            	.ks2-mod-card:hover::before { background: var(--ks2-cy); }
            	.ks2-corner { position: absolute; width: 8px; height: 8px; border-color: var(--ks2-cy); border-style: solid; opacity: 0; transition: opacity .2s; }
            	.ks2-corner-tl { top: 4px; right: 4px; border-width: 1px 0 0 1px; }
            	.ks2-corner-br { bottom: 4px; right: 4px; border-width: 0 1px 1px 0; }
            	.ks2-mod-card:hover .ks2-corner, .ks2-mod-card.ks2-on .ks2-corner { opacity: 1; }
            	.ks2-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
            	.ks2-card-icon {
            	    width: 32px; height: 32px; flex-shrink: 0;
            	    border: 0px solid var(--ks2-bd2);
            	    display: flex; align-items: center; justify-content: center;
            	    font-size: 14px; background: var(--ks2-bg2); transition: border-color .2s, background .2s;
            	}
            	.ks2-mod-card.ks2-on .ks2-card-icon { border-color: var(--ks2-cy); background: rgba(0,212,255,0.06); }
            	.ks2-card-title { font-size: 12px; font-weight: 700; color: var(--ks2-txt); margin-bottom: 3px; letter-spacing: .5px; padding-left: 10px;  }
            	.ks2-card-desc { font-family: 'Share Tech Mono', monospace !important; font-size: 13px; color: var(--ks2-txt2); line-height: 1.2; padding-left: 8px; }
            	.ks2-card-footer {
            	    display: flex; align-items: center; justify-content: space-between;
            	    margin-top: 8px; border-top: 1px solid var(--ks2-bd);
            	}
            	.ks2-status-pill {
            	    font-family: 'Share Tech Mono', monospace !important;
            	    font-size: 13px; padding: 2px 8px; border: 1px solid; transition: .2s; left:0;
            	}
            	.ks2-mod-card.ks2-on .ks2-status-pill { color: var(--ks2-cy3); border-color: rgba(0,255,157,0.27); background: rgba(0,255,157,0.06); }
            	.ks2-mod-card:not(.ks2-on) .ks2-status-pill { color: var(--ks2-txt3); border-color: rgba(61,84,112,0.5); }
            	.ks2-sub-tag {
            	    font-family: 'Share Tech Mono', monospace !important;
            	    font-size: 11px; color: var(--ks2-txt2); letter-spacing: .5px;
            	    padding-right: 16px; border: 1px solid var(--ks2-bd);
            	}
            	/* ── Footer ── */
            	.ks2-footer {
            	    padding: 12px 18px; flex-shrink: 0;
            	    border-top: 1px solid var(--ks2-bd);
            	    background: var(--ks2-bg1);
            	    display: flex; align-items: center; justify-content: space-between;
            	}
            	.ks2-footer-stats { display: flex; align-items: center; gap: 26px; }
            	.ks2-stat-val { font-family: 'Share Tech Mono', monospace !important; font-size: 16px; color: var(--ks2-cy); font-weight: 700; line-height: 1; }
            	.ks2-stat-lbl { font-size: 11px; color: var(--ks2-txt2); letter-spacing: .5px; margin-top: 2px; }
            	.ks2-stat-divider { width: 1px; height: 28px; background: var(--ks2-bd2); }
            	.ks2-footer-btns { display: flex; gap: 10px; align-items: center; }
            	/* --- Modernize Edilmiş Siber Butonlar --- */
            	.ks2-fbtn {
            		position: relative;
            	    cursor: pointer;
            	    border: none;
            	    outline: none;
            	    background: transparent;
            	    font-family: 'Share Tech Mono', monospace !important;
            	    font-size: 14px;
            	    text-transform: uppercase;
            	    letter-spacing: 4px;
            	    transition: all .3s cubic-bezier(0.23, 1, 0.32, 1);
            	    display: inline-flex;
            	    align-items: center;
            	    justify-content: center;
            	}
            	/* Ortak Arka Plan Efekti (Cam/Siber Kesim) */
            	.ks2-fbtn::before {
            	    content: '';
            	    position: absolute;
            	    inset: 0;
            	    clip-path: polygon(10% 0, 100% 0, 90% 100%, 0% 100%); /* Siber kesim açısı */
            	    transition: all .3s ease;
            	}
            	/* CANCEL BUTONU (Negatif/Soft) */
            	.ks2-fbtn-cancel {
            	    color: rgba(255, 255, 255, 0.5);
            	}
            	.ks2-fbtn-cancel::before {
            	    border: 1px solid rgba(255, 62, 108, 0.2);
            	    background: rgba(255, 62, 108, 0.03);
            	}
            	.ks2-fbtn-cancel:hover { color: #ff3e6c; text-shadow: 0 0 8px rgba(255, 62, 108, 0.5); }
            	.ks2-fbtn-cancel:hover::before {
            	    border-color: #ff3e6c;
            	    background: rgba(255, 62, 108, 0.1);
            	    clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%);
            	}
            	/* SAVE BUTONU (Pozitif/Neon) */
            	.ks2-fbtn-save { color: var(--ks2-cy); }
            	.ks2-fbtn-save::before {
            	    border: 1px solid rgba(0, 212, 255, 0.3);
            	    background: rgba(0, 212, 255, 0.05);
            	    box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.1);
            	}
            	.ks2-fbtn-save:hover {
            	    color: #fff;
            	    text-shadow: 0 0 10px var(--ks2-cy);
            	}
            	.ks2-fbtn-save:hover::before {
            	    background: rgba(0, 212, 255, 0.2);
            	    border-color: var(--ks2-cy);
            	    box-shadow: 0 0 20px rgba(0, 212, 255, 0.4), inset 0 0 10px rgba(0, 212, 255, 0.2);
            	    clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%);
            	}
            	/* Alt Glow Efekti (Zaten vardı, canlandıralım) */
            	.ks2-fbtn-glow {
            	    position: absolute;
            	    bottom: 2px;
            	    left: 20%;
            	    right: 20%;
            	    height: 2px;
            	    opacity: 0.4;
            	    filter: blur(2px);
            	    transition: all .3s ease;
            	}
            	.ks2-fbtn:hover .ks2-fbtn-glow { opacity: 1; left: 10%; right: 10%; filter: blur(4px); }
            	.ks2-fbtn:active { transform: scale(0.95) skewX(-2deg); }
            	.ks2-fbtn span { position: relative; z-index: 1; pointer-events: none; }

				/* --- Etiket Renkleri --- */
				.ks2-tag-core {
				    color: var(--ks2-cy) !important;
				    border-color: rgba(0, 212, 255, 0.4) !important;
				    background: rgba(0, 212, 255, 0.1);
				    text-shadow: 0 0 5px rgba(0, 212, 255, 0.3);
				}

				/* Alt Modül Etiketi (Daha Koyu/Turuncu veya Gümüş) */
				.ks2-tag-alt {
				    color: #d9ff43 !important; /* Turuncu tonu */
				    border-color: rgba(255, 159, 67, 0.3) !important;
				    background: rgba(255, 159, 67, 0.05);
				}

				/* --- Yazıların Önüne Boşluk (Zorlayıcı Çözüm) --- */
				.ks2-card-title,
				.ks2-card-desc {
				    padding-left: 12px !important; /* Bu değer yazıların önüne boşluk açar */
				    display: block !important;
				    width: calc(100% - 12px);
				}

				/* Footer'daki etiketleri de aynı hizaya çekmek için */
				.ks2-card-footer {
				    padding-left: 12px !important;
				    border-top: 1px solid rgba(255, 255, 255, 0.05);
				    margin-top: 8px;
				    padding-top: 6px;
				}
            `;
            document.head.appendChild(style);
        	}
            let currentIP = "IP Alınıyor...";
            let ipcolor = "orange";
            const scriptVersion = (typeof GM_info !== 'undefined') ? "v" + GM_info.script.version : "v1.0";
        	fetch('https://api.ipify.org?format=json').then(res => res.json()).then(data => { currentIP = data.ip; ipcolor = "#00ff00"; }).catch(() => { currentIP = "Gizli Bağlantı"; ipcolor = "red"; });
            const injectPanel = () => {
                injectStyles();
                let kstatus = document.getElementById(PANEL_ID);
                if (!kstatus) {
                    kstatus = document.createElement('div');
                    kstatus.id = PANEL_ID;
                kstatus.innerHTML = `<span>KS</span>`;
                document.body.appendChild(kstatus);
                let hideTimeout = null;
                const getPanelTip = () => {
                    let tip = document.getElementById('ks-dynamic-tooltip');
                    if (!tip) {
                        tip = document.createElement('div');
                        tip.id = 'ks-dynamic-tooltip';
                        Object.assign(tip.style, { zIndex: '99999999', opacity: '0' });
                        document.body.appendChild(tip);
                    }
                    return tip;
                };
                const bindTooltips = (container) => {
                    const panelTip = getPanelTip();
                    container.querySelectorAll('[data-tip]').forEach(el => {
                        el.addEventListener('mouseenter', () => {
                            panelTip.textContent = el.getAttribute('data-tip');
                            panelTip.style.visibility = 'visible';
                            panelTip.style.opacity = '1';
                        });
                        el.addEventListener('mousemove', (e) => {
                            panelTip.style.left = (e.clientX + 12) + 'px';
                            panelTip.style.top = (e.clientY - 34) + 'px';
                        });
                        el.addEventListener('mouseleave', () => {
                            panelTip.style.opacity = '0';
                            panelTip.style.visibility = 'hidden';
                        });
                    });
                };
                const hidePanelTip = () => {
                    const tip = document.getElementById('ks-dynamic-tooltip');
                    if (tip) { tip.style.opacity = '0'; tip.style.visibility = 'hidden'; }
                };
                const showFullContent = () => {
                    kstatus.classList.add('active');
                    kstatus.setAttribute('data-hover', 'true');
                    kstatus.style.color = '#fff';
                    kstatus.innerHTML = `
                    <span id="ks-settings-btn" data-tip="Ayarları Aç" style="cursor:pointer; font-size:14px;">⚙️</span>
			            <span style="opacity:0.3; margin:0 8px;">|</span>
			            <span id="ks-unlock-btn" data-tip="${isUnlocked ? 'Kilidi Kapat' : 'Kilidi Aç'}" style="color:${config.Color}; cursor:pointer; padding:2px 2px; border-radius:${config.borderRadius}; transition:all 0.3s ease;">${isUnlocked ? '🔓' : '🔒'}</span>
			            <span style="opacity:0.3; margin:0 2px;">|</span>
			            <span style="color:${ipcolor}; font-size:15px; margin-right:5px;">●</span>
			            <span data-tip="Geçerli IP Adresi" style="color:inherit;">${currentIP}</span>
			            <span style="opacity:0.3; margin:0 8px;">|</span>
			            <span id="ks-version-link" data-tip="Güncelleyi Aç/İndir" style="color:${config.Color}; cursor:pointer; padding:2px 2px; border-radius:${config.borderRadius}; transition:all 0.3s ease;">${scriptVersion}</span>
			            <span style="opacity:0.3; margin:0 8px;">|</span>
			            <span id="ks-theme-btn" data-tip="Tema Güncelleyi Aç/İndir" style="color:${config.Color}; cursor:pointer; padding:2px 2px; border-radius:${config.borderRadius}; transition:all 0.3s ease;">Tema</span>
			        `;
                    bindTooltips(kstatus);
                    const unlockBtn = document.getElementById('ks-unlock-btn');
                    unlockBtn.onclick = (e) => {
                        e.stopPropagation();
                        isUnlocked = !isUnlocked;
                        e.target.textContent = isUnlocked ? '🔓' : '🔒';
                        e.target.setAttribute('data-tip', isUnlocked ? 'Kilidi Kapat' : 'Kilidi Aç');
                        unlockAllElements(isUnlocked);
                    };
                    document.getElementById('ks-version-link').onclick = (e) => { e.stopPropagation(); window.open(GM_info.script.updateURL, '_blank'); };
                    document.getElementById('ks-theme-btn').onclick = (e) => { e.stopPropagation(); window.open('https://github.com/kstool/KsTools/raw/refs/heads/main/Ks_Tools_Ocean.user.js', '_blank'); };
                    document.getElementById('ks-settings-btn').onclick = (e) => { e.stopPropagation(); openSettingsModal(); };
                };
                kstatus.onmouseleave = () => {
                    hidePanelTip();
                    const tip = document.getElementById('ks-dynamic-tooltip');
                    if (tip) { tip.style.opacity = '0'; }
                    hideTimeout = setTimeout(() => {
                        kstatus.classList.remove('active');
                        kstatus.innerHTML = `<span>KS</span>`;
                        hideTimeout = null;
                    }, 1000);
                };
                kstatus.onmouseenter = () => {
                    if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
                    showFullContent();
                };
            }
			// ── Veri Tanımları ─────────────────────────────────────────────────
			const SECTIONS = [
			    {
			        id: 'dosya', title: 'OTOANALİZ DOSYA PANELİ', icon: '📁', label: 'Dosya Paneli',
			        items: [
			            { key: 'KS_PANEL', icon: '📊', title: 'Giriş Kontrol', desc: 'Poliçe rücu pert piyasa izleme', sub: false },
			            { key: 'KS_PANEL_hlt', icon: '🔦', title: 'Hücre Boyama', desc: 'Boş alan renklendirme', sub: false },
			            { key: 'KS_PANEL_pol', icon: '📋', title: 'Poliçe Kontrol', desc: 'Tarih + geçerlilik denetimi', sub: true },
			            { key: 'KS_PANEL_sgs', icon: '🛡️', title: 'Sigorta Şekli', desc: 'Trafik / Kasko durumu', sub: true },
			            { key: 'KS_PANEL_rc', icon: '↩️', title: 'Rücu Takibi', desc: 'Rücu durum göstergesi', sub: true },
			            { key: 'KS_PANEL_pert', icon: '🚗', title: 'Pert Kontrolü', desc: 'Pert durum izleme', sub: true },
			            { key: 'KS_PANEL_hsr', icon: '💥', title: 'Hasar Şekli', desc: 'Hasar tipi bilgisi', sub: true },
			            { key: 'KS_PANEL_srtp', icon: '🔧', title: 'Servis Tipi', desc: 'Servis durum gösterimi', sub: true },
			            { key: 'KS_PANEL_srad', icon: '🏭', title: 'Servis Adı', desc: 'Servis adı bilgisi', sub: true },
			            { key: 'KS_PANEL_tra', icon: '📈', title: 'Tramer', desc: 'Tramer değer göstergesi', sub: true },
			            { key: 'KS_PANEL_sad', icon: '👤', title: 'Sigortalı Adı', desc: 'Ad soyad değeri', sub: true },
			            { key: 'KS_PANEL_aad', icon: '🚙', title: 'Araç Model', desc: 'Model bilgisi', sub: true },
			            { key: 'KS_PANEL_mull', icon: '💰', title: 'Muallak', desc: 'Muallak değer izleme', sub: true },
			            { key: 'KS_PANEL_ryc', icon: '🏷️', title: 'Piyasa Rayiç', desc: 'Piyasa değer gösterimi', sub: true },
			            { key: 'KS_PANEL_rycorn', icon: '⚠️', title: 'Rayiç Pert Oran', desc: '%30 %60 eşik uyarıları', sub: true },
			            { key: 'KS_PANEL_pys', icon: '🌐', title: 'Piyasa Kontrol', desc: 'Dış kaynak veri çekimi', sub: true },
			            { key: 'KS_PANEL_not', icon: '📝', title: 'Notlar', desc: 'Panel not bölümü', sub: true },
			            { key: 'KS_MANU', icon: '🔩', title: 'Manuel Parça', desc: 'Tekli çoklu parça girişi', sub: false },
			            { key: 'KS_REF', icon: '📌', title: 'Referans Panel', desc: 'Excel copy paste desteği', sub: false },
			            { key: 'KS_DNM', icon: '⚙️', title: 'Donanım Girişi', desc: 'Araç donanım eşleme', sub: false },
			            { key: 'KS_IMG', icon: '🖼️', title: 'Resim Yükleme', desc: 'Toplu evrak kategorisi', sub: false },
			        ]
			    },
			    {
			        id: 'ek', title: 'EK MODÜLLER', icon: '⚙️', label: 'Ek Modüller',
			        items: [
			            { key: 'KS_NTF', icon: '🔕', title: 'Bildirim Engel', desc: '3+ tekrarlı popup engeli', sub: false },
			        ]
			    },
			    {
			        id: 'dis', title: 'DIŞ ENTEGRASYONLAR', icon: '📡', label: 'Entegrasyonlar',
			        items: [
			            { key: 'KS_TRS', icon: '🛡️', title: 'Türkiye Sigorta', desc: 'Yan menü form otomasyonu', sub: false },
			            { key: 'KS_SAHIB', icon: '🏷️', title: 'Sahibinden', desc: 'KM fiyat piyasa analizi', sub: false },
			            { key: 'KS_SBM', icon: '🏦', title: 'SBM Panel', desc: 'Tramer bölme KTT sorgu', sub: false },
			            { key: 'KS_WP', icon: '💬', title: 'WhatsApp', desc: 'Medya çift tık indirme', sub: false },
			        ]
			    }
			];
            // ── Modal Aç ──────────────────────────────────────────────────────
            const openSettingsModal = () => {
                if (document.getElementById('ks2-overlay')) return;
                const totalItems = SECTIONS.reduce((a, s) => a + s.items.length, 0);
                const getActiveCount = () => SECTIONS.reduce((a, s) => a + s.items.filter(i => getSetting(i.key)).length, 0);
                const getSecCount = (sec) => sec.items.filter(i => getSetting(i.key)).length;
                // Overlay
                const overlay = document.createElement('div');
                overlay.id = 'ks2-overlay';
                const closeModal = () => {
                    overlay.remove();
                    document.body.style.overflow = '';
                };
                // ESC ile kapat
                const escHandler = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); } };
                document.addEventListener('keydown', escHandler);
                overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
                // Sidebar nav HTML
                const navHTML = SECTIONS.map((sec, i) => `
                    <div class="ks2-nav-item ${i === 0 ? 'ks2-active' : ''}" data-sec="${sec.id}" data-title="${sec.title}">
                        <div class="ks2-nav-icon">${sec.icon}</div>
                        <div class="ks2-nav-text">${sec.label}</div>
                        <div class="ks2-nav-count" id="ks2-cnt-${sec.id}">${getSecCount(sec)}</div>
                    </div>`).join('');
                // Section views HTML
                const sectionsHTML = SECTIONS.map((sec, i) => `
                    <div class="ks2-sec-view ${i === 0 ? 'ks2-active' : ''}" id="ks2-sec-${sec.id}">
                        <div class="ks2-bulk-row">
                            <button class="ks2-bulk-btn" data-grid="${sec.id}" data-val="1"><span>▶ TÜMÜNÜ ETKİNLEŞTİR</span></button>
                            <button class="ks2-bulk-btn" data-grid="${sec.id}" data-val="0"><span>■ TÜMÜNÜ DEVRE DIŞI</span></button>
                        </div>
                        <div class="ks2-card-grid" id="ks2-grid-${sec.id}"></div>
                    </div>`).join('');
                overlay.innerHTML = `
                    <div id="ks2-root">
                        <div id="ks2-scanline"></div>
                        <aside id="ks2-sidebar">
                            <div class="ks2-brand">
                                <div class="ks2-brand-hex">
                                    <div class="ks2-brand-diamond"><div class="ks2-brand-diamond-inner"></div></div>
                                    <div>
                                        <div class="ks2-brand-title">KS TOOLS</div>
                                        <div class="ks2-brand-sub">KONTROL PANELİ</div>
                                    </div>
                                </div>
                            </div>
                            <nav class="ks2-nav">
                                <div class="ks2-nav-sec">// MODÜLLER</div>
                                ${navHTML}
                            </nav>
                            <div class="ks2-sidebar-bottom">
                                <div class="ks2-theme-row">
                                    <span class="ks2-theme-lbl">// TEMA</span>
                                    <span class="ks2-ver-tag">v${GM_info.script.version}</span>
                                </div>
                                <div class="ks2-color-dots" id="ks2-color-dots">
                                    <div class="ks2-cdot ks2-sel" data-c="#00d4ff" style="background:rgba(0,212,255,0.8);border:1px solid #00d4ff"></div>
                                    <div class="ks2-cdot" data-c="#00ff9d" style="background:rgba(0,255,157,0.8);border:1px solid transparent"></div>
                                    <div class="ks2-cdot" data-c="#9b59b6" style="background:rgba(155,89,182,0.8);border:1px solid transparent"></div>
                                    <div class="ks2-cdot" data-c="#ff9f43" style="background:rgba(255,159,67,0.8);border:1px solid transparent"></div>
                                    <div class="ks2-cdot" data-c="#ff3e6c" style="background:rgba(255,62,108,0.8);border:1px solid transparent"></div>
                                    <div class="ks2-cdot" data-c="#e0e6ed" style="background:rgba(224,230,237,0.8);border:1px solid transparent"></div>
                                </div>
                            </div>
                        </aside>
                        <div id="ks2-main">
                            <div class="ks2-topbar">
                                <div class="ks2-topbar-left">
                                    <span class="ks2-bracket">[</span>
                                    <span class="ks2-topbar-title" id="ks2-sec-title">OTOANALİZ DOSYA PANELİ</span>
                                    <span class="ks2-bracket">]</span>
                                </div>
                                <div class="ks2-ctrl-row">
                                    <span class="ks2-ctrl-lbl">ANA KONTROL</span>
                                    <label class="ks2-sw">
                                        <input type="checkbox" id="ks2-master" ${getSetting('KS_SYS') ? 'checked' : ''}>
                                        <span class="ks2-sw-track"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="ks2-content">${sectionsHTML}</div>
                            <div class="ks2-footer">
                                <div class="ks2-footer-stats">
                                    <div>
                                        <div class="ks2-stat-val" id="ks2-active-cnt">${getActiveCount()}</div>
                                        <div class="ks2-stat-lbl">AKTİF MODÜL</div>
                                    </div>
                                    <div class="ks2-stat-divider"></div>
                                    <div>
                                        <div class="ks2-stat-val">${totalItems}</div>
                                        <div class="ks2-stat-lbl">TOPLAM</div>
                                    </div>
                                </div>
                                <div class="ks2-footer-btns">
                                    <button class="ks2-fbtn ks2-fbtn-cancel" id="ks2-btn-cancel"><span>VAZGEÇ</span></button>
                                    <button class="ks2-fbtn ks2-fbtn-save" id="ks2-btn-save">
                                        <span>KAYDET</span>
                                        <span class="ks2-fbtn-glow"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>`;
                document.body.appendChild(overlay);
                document.body.style.overflow = 'hidden';
                // ── Kartları oluştur ────────────────────────────────────────────
                const updateStats = () => {
                    document.getElementById('ks2-active-cnt').textContent = getActiveCount();
                    SECTIONS.forEach(sec => {
                        const el = document.getElementById('ks2-cnt-' + sec.id);
                        if (el) el.textContent = getSecCount(sec);
                    });
                };
                const toggleCard = (key, on) => {
                    setSetting(key, on);
                    const card = overlay.querySelector(`.ks2-mod-card[data-key="${key}"]`);
                    const pill = overlay.querySelector(`#ks2-pill-${key}`);
                    const chk = overlay.querySelector(`input[data-key="${key}"]`);
                    if (card) card.classList.toggle('ks2-on', on);
                    if (pill) pill.textContent = on ? '● AKTİF' : '○ KAPALI';
                    if (chk && chk.checked !== on) chk.checked = on;
                    updateStats();
                };
                SECTIONS.forEach(sec => {
                    const grid = overlay.querySelector('#ks2-grid-' + sec.id);
                    sec.items.forEach(item => {
                        const on = getSetting(item.key);
                        const card = document.createElement('div');
                        card.className = 'ks2-mod-card' + (on ? ' ks2-on' : '');
                        card.dataset.key = item.key;
                        card.innerHTML = `
                            <div class="ks2-corner ks2-corner-tl"></div>
                            <div class="ks2-corner ks2-corner-br"></div>
                            <div class="ks2-card-top">
                                <div class="ks2-card-icon">${item.icon}</div>
                                <label class="ks2-sw" onclick="event.stopPropagation()">
                                    <input type="checkbox" data-key="${item.key}" ${on ? 'checked' : ''}>
                                    <span class="ks2-sw-track"></span>
                                </label>
                            </div>
                            <div class="ks2-card-title">${item.title}</div>
                            <div class="ks2-card-desc">${item.desc}</div>
                            <div class="ks2-card-footer">
                                <span class="ks2-status-pill" id="ks2-pill-${item.key}">${on ? '● AKTİF' : '○ KAPALI'}</span>
                                <span class="ks2-sub-tag ${item.sub ? 'ks2-tag-alt' : 'ks2-tag-core'}">${item.sub ? 'ALT MODÜL' : 'ANA MODÜL'}</span>
                            </div>`;

                        const chk = card.querySelector('input');
                        chk.addEventListener('change', (e) => { e.stopPropagation(); toggleCard(item.key, chk.checked); });
                        card.addEventListener('click', () => { const v = !getSetting(item.key); chk.checked = v; toggleCard(item.key, v); });
                        grid.appendChild(card);
                    });
                });
                // ── Navigasyon ─────────────────────────────────────────────────
                overlay.querySelectorAll('.ks2-nav-item').forEach(navEl => {
                    navEl.addEventListener('click', () => {
                        overlay.querySelectorAll('.ks2-nav-item').forEach(n => n.classList.remove('ks2-active'));
                        overlay.querySelectorAll('.ks2-sec-view').forEach(s => s.classList.remove('ks2-active'));
                        navEl.classList.add('ks2-active');
                        overlay.querySelector('#ks2-sec-' + navEl.dataset.sec).classList.add('ks2-active');
                        overlay.querySelector('#ks2-sec-title').textContent = navEl.dataset.title;
                    });
                });
                // ── Bulk toggle ─────────────────────────────────────────────────
                overlay.querySelectorAll('.ks2-bulk-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const secId = btn.dataset.grid;
                        const on = btn.dataset.val === '1';
                        const sec = SECTIONS.find(s => s.id === secId);
                        if (!sec) return;
                        sec.items.forEach(item => { toggleCard(item.key, on); });
                    });
                });
                // ── Master switch ───────────────────────────────────────────────
                overlay.querySelector('#ks2-master').addEventListener('change', (e) => {
                    setSetting('KS_SYS', e.target.checked);
                });
                // ── Tema rengi ─────────────────────────────────────────────────
                overlay.querySelectorAll('.ks2-cdot').forEach(dot => {
                    dot.addEventListener('click', () => {
                        overlay.querySelectorAll('.ks2-cdot').forEach(d => { d.style.borderColor = 'transparent'; d.classList.remove('ks2-sel'); });
                        dot.style.borderColor = dot.dataset.c;
                        dot.classList.add('ks2-sel');
                        overlay.querySelector('#ks2-root').style.setProperty('--ks2-cy', dot.dataset.c);
                        setSetting('KS_THEME', dot.dataset.c);
                    });
                });
                // Kayıtlı tema rengini uygula
                const savedTheme = getSetting('KS_THEME');
                if (savedTheme) {
                    overlay.querySelector('#ks2-root').style.setProperty('--ks2-cy', savedTheme);
                    overlay.querySelectorAll('.ks2-cdot').forEach(d => {
                        d.style.borderColor = 'transparent'; d.classList.remove('ks2-sel');
                        if (d.dataset.c === savedTheme) { d.style.borderColor = savedTheme; d.classList.add('ks2-sel'); }
                    });
                }
                // ── Footer butonları ────────────────────────────────────────────
                overlay.querySelector('#ks2-btn-cancel').addEventListener('click', closeModal);
                overlay.querySelector('#ks2-btn-save').addEventListener('click', () => {
                    closeModal();
                    if (confirm('Ayarlar kaydedildi. Sayfa yenilensin mi?')) window.location.reload();
                });
            	window.openSettingsModal = openSettingsModal;
            	document.addEventListener('keydown', (e) => {
            	    if (e.altKey && e.key === 's') openSettingsModal();
            	});
            };
        };
        setInterval(injectPanel, 2000); injectPanel();
    }
    const KS_SYSTEM = GM_getValue('KS_SYS', false);
    const ANALIZPANEL = GM_getValue('KS_PANEL', false);
    const ANALIZPANEL_hlt = GM_getValue('KS_PANEL_hlt', false);
    const ANALIZPANEL_pol = GM_getValue('KS_PANEL_pol', false);
    const ANALIZPANEL_sgs = GM_getValue('KS_PANEL_sgs', false);
    const ANALIZPANEL_rc = GM_getValue('KS_PANEL_rc', false);
    const ANALIZPANEL_pert = GM_getValue('KS_PANEL_pert', false);
    const ANALIZPANEL_hsr = GM_getValue('KS_PANEL_hsr', false);
    const ANALIZPANEL_srtp = GM_getValue('KS_PANEL_srtp', false);
    const ANALIZPANEL_srad = GM_getValue('KS_PANEL_srad', false);
    const ANALIZPANEL_tra = GM_getValue('KS_PANEL_tra', false);
    const ANALIZPANEL_sad = GM_getValue('KS_PANEL_sad', false);
    const ANALIZPANEL_aad = GM_getValue('KS_PANEL_aad', false);
    const ANALIZPANEL_mull = GM_getValue('KS_PANEL_mull', false);
    const ANALIZPANEL_ryc = GM_getValue('KS_PANEL_ryc', false);
    const ANALIZPANEL_rycorn = GM_getValue('KS_PANEL_rycorn', false);
    const ANALIZPANEL_pys = GM_getValue('KS_PANEL_pys', false);
    const ANALIZPANEL_not = GM_getValue('KS_PANEL_not', false);
    const MANUEL = GM_getValue('KS_MANU', false);
    const REFERANS = GM_getValue('KS_REF', false);
    const DONANIM = GM_getValue('KS_DNM', false);
    const RESIM = GM_getValue('KS_IMG', false);
    const TRSIGORTA = GM_getValue('KS_TRS', false);
    const SAHIBINDEN = GM_getValue('KS_SAHIB', false);
    const SBM = GM_getValue('KS_SBM', false);
    const WHATSAPP = GM_getValue('KS_WP', false);
    const BILDIRIM = GM_getValue('KS_NTF', false);
    // Hızlı ve Panel takipli Ön giriş
    if (KS_SYSTEM && ANALIZPANEL && location.href.includes("otohasar") && (location.href.includes("eks_hasar.php") || location.href.includes("eks_hasar_magdur.php"))) {
        const magdurpanel = location.href.includes("eks_hasar_magdur.php");
        /* ===== 1. PANEL VE STİL ===== */
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Giriş Kontrol Paneli";
            panelContent.innerHTML = `
            <div id="panelContent" style ="color:#ffffff; text-align:center;">⏳ Yükleniyor...</div>
            <hr style="border:0; border-top:1px solid #444; margin:2px 0;">
			<div id="pys-section">
				<div id="shb-res-box"></div>
				<div class="ks-grid-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; width: 100%;">
            	     <div class="ks-tooltip-container">
            	         <button id="btn-auto-analiz" class="ks-btn" style="width: 100%;">Piyasa Göster</button>
            	         <div class="ks-tooltip-box">
            	             Piyasayı otomatik olarak panel arayüzü üzerinde gösterir.
            	         </div>
            	     </div>
            	     <div class="ks-tooltip-container">
            	         <button id="btn-auto-look" class="ks-btn" style="width: 100%;">Piyasa Listesine Git</button>
            	         <div class="ks-tooltip-box">
            	             Listenin bulunduğu siteyi yeni sekmede açar.
            	         </div>
            	     </div>
            	 </div>
			</div>
    		<hr id="action-divider" style="border:0; border-top:1px solid #444; margin:2px 0;">
    		<div id="action-section" class="ks-grid-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; width: 100%;">
                <div class="ks-tooltip-container">
                    <button id="autoSelectBtn" class="ks-btn" style="width:100%; height: 100%;">⚡ Ön Giriş</button>
                    <div class="ks-tooltip-box">
                        <strong>⚡ Otomatik Giriş (F4)</strong><br>
                        Kaza ihbar türü, Eksperiz şekli, Alkol durumu, Devir-Satış, Eksik/Aşkın Sigorta, Muafiyet, Taşınan yük, Ehliyet sınıfı ve Ekspertiz tarihi gibi seçimleri doğrulamayı unutmayın.
                    </div>
                </div>
				<div class="ks-tooltip-container">
                <button id="btnKaydetYeni" class="ks-btn-danger" style="width:100%; height: 100%;" onclick="c('kaydet();')">💾 KAYDET</button>
                    <div class="ks-tooltip-box">
                        <strong>💾 Kaydet (F2)</strong><br>
						Sitedeki kaydet butonları ile aynı işlevi görür.
                    </div>
                </div>
            </div>
			<div id="not-section">
            	<div id="custom-page-notes-container" style="width: 100%; dashed #444;">
				<hr style="border:0; border-top:1px solid #444; margin:4px 0;">
            	    <div style="color: #bbb; font-size: 11px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
            	        <span>NOT</span>
            	        <span id="note-status" style="font-size: 10px; opacity: 0.6;">Otomatik Kayıt Edecek...</span>
            	    </div>
            	    <textarea id="page-note-input" style="width: 100%; height: 40px; background: #252525; color: black; border: 1px solid #333; border-radius: ${config.borderRadius}; padding: 2px; font-size: 12px; line-height: 1.2; resize: vertical; outline: none; box-sizing: border-box; display: block;" placeholder="Buraya notunu bırakabilirsin..."></textarea>
            	</div>
			</div>
            `;
            document.addEventListener('keydown', (e) => {
                if (e.key === 'F2') {
                    e.preventDefault();
                    const btn = document.getElementById('btnKaydetYeni') || document.getElementsByName('btnKaydetYeni')[0];
                    if (btn && btn.offsetParent !== null) btn.click();
                }
                if (e.key === 'F4') {
                    e.preventDefault();
                    const btn = document.getElementById('autoSelectBtn') || document.getElementsByName('autoSelectBtn')[0];
                    if (btn && btn.offsetParent !== null) btn.click();
                }
            });
            if (!ANALIZPANEL_pys) {
                const pysSection = document.getElementById('pys-section');
                if (pysSection) { pysSection.style.display = 'none'; }
            }
            if (!ANALIZPANEL_not) {
                const notSection = document.getElementById('not-section');
                if (notSection) { notSection.style.display = 'none'; }
            }
            if (typeof magdurpanel !== 'undefined' && magdurpanel) {
                const actionSection = document.getElementById('action-section');
                const actionDivider = document.getElementById('action-divider');
                if (actionSection) actionSection.style.display = 'none';
                if (actionDivider) actionDivider.style.display = 'none';
            }
            /* ===== 2. YARDIMCI FONKSİYONLAR ===== */
            const $ = (id) => document.getElementById(id) || document.querySelector(`[name="${id}"]`);
            const getValue = (id) => ($(id)?.value || $(id)?.textContent || '').trim();
            const parseNum = (id) => { const val = getValue(id).replace(/,/g, ''); return val === '' ? 0 : Number(val); };
            const getDate = (prefix) => {
                const [g, a, y] = [getValue(prefix + '_GUN'), getValue(prefix + '_AY'), getValue(prefix + '_YIL')];
                if (!g || !a || !y) return null;
                return new Date(y, a - 1, g);
            };
            // --- Not Sistemi Ayarları ---
            const storageKey = "page_note_" + unsafeWindow.location.href;
            const textarea = document.getElementById('page-note-input');
            const status = document.getElementById('note-status');
            // Notu Kaydetme Fonksiyonu
            function savePageNote() {
                if (textarea) {
                    localStorage.setItem(storageKey, textarea.value);
                    if (status) {
                        status.innerText = "Not Kaydedildi ✔";
                        setTimeout(() => { status.innerText = "Otomatik Kaydediliyor..."; }, 2000);
                    }
                }
            }
            // Sayfa açıldığında eski notu yükle
            if (textarea) {
                const savedNote = localStorage.getItem(storageKey);
                if (savedNote) { textarea.value = savedNote; }
                // Otomatik Kayıt (Yazarken)
                let saveTimeout;
                textarea.addEventListener('input', () => {
                    if (status) status.innerText = "Yazılıyor...";
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(savePageNote, 1000);
                });
            }
            // Butona ekleme yapıyoruz
            const kaydetButonu = document.getElementById('btnKaydetYeni');
            if (kaydetButonu) {
                kaydetButonu.addEventListener('click', () => { savePageNote(); });
            }
            /* ===== 3. KONTROL VE HIGHLIGHT ===== */
            function highlightFields() {
                const getEl = (id) => document.getElementById(id) || document.getElementsByName(id)[0];
                const getValue = (id) => getEl(id)?.value || '';
                const parseNum = (id) => {
                    let val = getValue(id).trim();
                    if (!val) return 0;
                    let clean = val.replace(/,/g, '');
                    return parseFloat(clean) || 0;
                };
                const setBg = (id, condition) => {
                    const el = getEl(id);
                    const td = el?.closest('td');
                    if (td) td.style.backgroundColor = condition ? WARNING_COLOR : '';
                };
                if (magdurpanel) {
                    const watchFields = ['SURUCU_ADI', 'MAGDUR_AD', 'MAGDUR_SOYAD', 'PLAKA1', 'PLAKA2', 'PLAKA3', 'SASI_NO', 'MOTOR_NO', 'MERNIS_NO_C', 'SURUCU_KIMLIK_TIPI_DEGER', 'SURUCU_EHLIYET_NO', 'SURUCU_EHLIYET_SINIFI',
                        'EHLIYET_TARIHI_GUN', 'EHLIYET_TARIHI_AY', 'EHLIYET_TARIHI_YIL'];
                    const selectFields = ['MODEL_YILI', 'MARKA_ID', 'ARAC_TIPI', 'MAGDUR_KIMLIK_TIPI', 'SURUCU_KIMLIK_TIPI', 'SB_ARAC_KULLANIM_TURU'];
                    const modelVal = getValue('MODEL_ADI').replace(/[()\s]/g, ''); setBg('MODEL_ADI', modelVal === '');
                    setBg('KM', parseNum('KM') < 1);
                    setBg('PIYASA', parseNum('PIYASA') < 1000);
                    watchFields.forEach(id => setBg(id, getValue(id).trim() === ''));
                    selectFields.forEach(id => setBg(id, getValue(id) === '-1'));
                }
                else {
                    const watchFields = ['EKSPERTIZ_TARIHI_YIL', 'EKSPERTIZ_TALEP_TARIHI_YIL', 'HAS_ARAC_SAHIBI', 'HAS_TRAFIK_TARIHI_YIL',
                        'TRAMER_IHBAR_NO', 'SERVIS_ADI', 'SURUCU_YIL', 'EHLIYET_NO', 'EHLIYET_TARIHI_YIL', 'MILLI_R_NO', 'EKSPERTIZ_SURESI', 'EHLIYET_SINIFI', 'ONARIM_SURESI'];
                    const selectFields = ['SB_ARAC_KULLANIM_TURU', 'HASAR_ILCESI', 'KANAAT', 'EHLIYET_YERI', 'EHLIYET_YERI_ILCE', 'KAZA_SEKLI', 'DOLU_HASARI', 'FAR_AYNA_HASARI',
                        'KUSURLU', 'HAS_MODEL_YILI', 'HASAR_SEKLI', 'KAZA_IHBAR_TURU', 'UZAKTAN_EKSPERTIZ'];
                    const modelVal = getValue('HAS_MODEL_ADI').replace(/[()\s]/g, ''); setBg('HAS_MODEL_ADI', modelVal === '');
                    setBg('TAHMINI_HASAR', parseNum('TAHMINI_HASAR') < 1000);
                    setBg('HAS_KM', parseNum('HAS_KM') < 1);
                    setBg('HAS_PIYASA', parseNum('HAS_PIYASA') < 1000);
                    //setBg('HASAR_SEKLI', getValue('HASAR_SEKLI') === "-1");
                    watchFields.forEach(id => setBg(id, getValue(id).trim() === ''));
                    selectFields.forEach(id => setBg(id, getValue(id) === '-1'));
                }
            }
            /* ===== 4. PANEL GÜNCELLEME ===== */
            function updatePanel() {
                const sigortaSekli = document.getElementById('SIGORTA_SEKLI');
                const isTrafik = sigortaSekli && sigortaSekli.value === "1";
                let html = '<table style="width:100%; border-collapse:collapse; font-size:13px; color:white;">';
                if (ANALIZPANEL_pol && !magdurpanel) {
                    const hasar = getDate('HASAR_TARIHI');
                    const bas = getDate('SB_POLICE_BAS');
                    const bitis = getDate('SB_POLICE_BITIS');
                    if (hasar && bas && bitis) {
                        hasar.setHours(0, 0, 0, 0);
                        bas.setHours(0, 0, 0, 0);
                        bitis.setHours(0, 0, 0, 0);
                        html += `<tr><td colspan="2" style="text-align:center; padding:10px;"><div class="ks-tooltip-container">`;
                        // 1. DURUM: POLİÇE VADESİ İÇİNDE
                        if (hasar >= bas && hasar <= bitis) {
                            const diffBas = Math.floor((hasar - bas) / 86400000);
                            const diffBit = Math.floor((bitis - hasar) / 86400000);
                            // --- RİSK ANALİZİ ---
                            if (diffBas <= 3) {
                                // KRİTİK: İlk 3 gün (Suistimal Riski)
                                html += `<b style="color:#ff4444; font-size:15px;">🚨 KRİTİK: YENİ POLİÇE HASARI</b><br>`;
                                html += `<span style="color:#ff4444;">Poliçe başladıktan sadece <b>${diffBas} gün</b> sonra kaza gerçekleşmiş!</span>`;
                            }
                            else if (diffBas <= 7) {
                                // UYARI: İlk hafta
                                html += `<b style="color:${SUCCESS_COLOR}">✔️ Poliçe İçinde</b><br>`;
                                html += `<span style="color:#ffcc00">⚠️ Dikkat: İlk hafta içinde hasar (${diffBas}. gün)</span>`;
                            }
                            else if (diffBit <= 7) {
                                // UYARI: Son hafta
                                html += `<b style="color:${SUCCESS_COLOR}">✔️ Poliçe İçinde</b><br>`;
                                html += `<span style="color:#ffcc00">⚠️ Dikkat: Poliçe bitimine yakın (${diffBit} gün kaldı)</span>`;
                            }
                            else {
                                // NORMAL: Güvenli bölge
                                html += `<b style="color:${SUCCESS_COLOR}; font-size:15px;">✅ Poliçe İçinde (Sorunsuz)</b>`;
                            }
                        }
                        // 2. DURUM: POLİÇE VADESİ DIŞINDA
                        else {
                            let diff = hasar < bas ? Math.floor((bas - hasar) / 86400000) : Math.floor((hasar - bitis) / 86400000);
                            let yon = hasar < bas ? 'ÖNCE' : 'SONRA';
                            html += `<b style="color:#ff0000; font-size:16px;">❌ POLİÇE DIŞI HASAR</b><br>`;
                            html += `<span style="background:red; color:white; padding:2px 5px; border-radius: ${config.borderRadius};">`;
                            html += `Vade ${yon} ${diff} gün fark var!`;
                            html += `</span>`;
                        }
                        html += `<div class="ks-tooltip-box">
                            Hasar ile Poliçe arasındaki gün farkını kontrol eder.
                        </div>
                    </div></td></tr>`;
                    }
                    html += `<tr><td colspan="2"><hr style="border:0; border-top:1px solid #444; margin:2px 0;"></td></tr>`;
                }
                const sigortaElement = document.getElementById('SIGORTA_SEKLI');
                let dynamicLabel = (magdurpanel || isTrafik) ? 'Mağdur Araç :' : 'Sigortalı/Kaskolu Araç :';
                let sigortaBadge = "";
                if (sigortaElement) {
                    const selectedText = sigortaElement.options[sigortaElement.selectedIndex]?.text || "Bilinmiyor";
                    const upText = selectedText.toUpperCase();
                    const isTrafikSelected = upText.includes("TRAFİK");
                    let sigortaColor = isTrafikSelected ? "#00d4ff" : (upText.includes("KASKO") ? "#a29bfe" : "#ff9500");
                    let sigortaBg = isTrafikSelected ? "rgba(0, 212, 255, 0.15)" : (upText.includes("KASKO") ? "rgba(162, 155, 254, 0.15)" : "rgba(255, 149, 0, 0.15)");
                    if (magdurpanel || isTrafikSelected) {
                        dynamicLabel = 'Mağdur Araç :';
                    } else if (upText.includes("KASKO")) {
                        dynamicLabel = 'Sigortalı Araç :';
                    }
                    sigortaBadge = `
                        <span style="
                            color: ${sigortaColor};
                            background: ${sigortaBg};
                            border: 1px solid ${sigortaColor}44;
                            padding: 1px 6px;
                            border-radius: ${config.borderRadius};
                            font-size: 10px;
                            font-weight: bold;
                            display: inline-block;
                            vertical-align: middle;
                            text-transform: uppercase;
                        ">
                            ${selectedText}
                        </span>`;
                    if (ANALIZPANEL_sgs && !magdurpanel) {
                        html += `<tr style="border-bottom: 1px solid #333;"><td style="padding:4px 0;">Sigorta Şekli:</td><td style="text-align:right; padding:4px 0;">${sigortaBadge}</td></tr>`;
                    }
                }
                if (ANALIZPANEL_rc && !magdurpanel) {
                    // --- 1. RÜCU DURUMU ---
                    const rucuVar = document.getElementById('RUCU1')?.checked;
                    const rucuYok = document.getElementById('RUCU0')?.checked;
                    let rucuStatus = "";
                    if (rucuVar) { rucuStatus = `<span style="background:#ff4d4d22; color:#ff4d4d; border:1px solid #ff4d4d44; padding:1px 6px; border-radius: ${config.borderRadius}; font-weight:bold; font-size:10px;">VAR 🔴</span>`; }
                    else if (rucuYok) { rucuStatus = `<span style="background:#2ecc7122; color:#2ecc71; border:1px solid #2ecc7144; padding:1px 6px; border-radius: ${config.borderRadius}; font-weight:bold; font-size:10px;">YOK 🟢</span>`; }
                    else { rucuStatus = `<span style="background:#ff950022; color:#ff9500; border:1px solid #ff950044; padding:1px 6px; border-radius: ${config.borderRadius}; font-weight:bold; font-size:10px;">BELİRSİZ 🔘</span>`; }

                    html += `
                        <tr style="border-bottom:1px solid #333;">
                            <td style="white-space:nowrap; width:100px;">Rücu:</td>
                            <td style="text-align:right; padding:4px 0;">${rucuStatus}</td>
                        </tr>`;
                }
                if (ANALIZPANEL_pert && !magdurpanel) {
                    // --- 2. PERT DURUMU ---
                    const pertVar = document.getElementById('pert')?.checked || false;
                    let pertStatus = "";
                    if (pertVar) { pertStatus = `<span style="background:#ff4d4d22; color:#ff4d4d; border:1px solid #ff4d4d44; padding:1px 6px; border-radius: ${config.borderRadius}; font-weight:bold; font-size:10px;">VAR 🔴</span>`; }
                    else { pertStatus = `<span style="background:#2ecc7122; color:#2ecc71; border:1px solid #2ecc7144; padding:1px 6px; border-radius: ${config.borderRadius}; font-weight:bold; font-size:10px;">YOK 🟢</span>`; }

                    html += `
                        <tr style="border-bottom:1px solid #333;">
                            <td style="white-space:nowrap; width:100px;">Pert:</td>
                            <td style="text-align:right; padding:4px 0;">${pertStatus}</td>
                        </tr>`;
                }
                // Renk ve Badge Oluşturma Fonksiyonu (Tekrarı önlemek için)
                const createBadge = (text, color) => {
                    return `
                        <span style="
                            background: ${color}22;
                            color: ${color};
                            border: 1px solid ${color}44;
                            padding: 1px 6px;
                            border-radius: ${config.borderRadius};
                            font-size: 10px;
                            font-weight: bold;
                            white-space: nowrap;
                            display: inline-block;
                            vertical-align: middle;
                        ">
                            ${text.toUpperCase()}
                        </span>`;
                };
                if (ANALIZPANEL_hsr && !magdurpanel) {
                    const ihbarElement = document.getElementById('KAZA_IHBAR_TURU');
                    const hasarElement = document.getElementById('HASAR_SEKLI');
                    // --- 1. MANTIK: İHBAR TÜRÜ ---
                    if (ihbarElement && ihbarElement.value !== "" && ihbarElement.value !== "-1") {
                        let selectedText = ihbarElement.options[ihbarElement.selectedIndex]?.text || "";
                        let selectedValue = ihbarElement.value;
                        let ihbarColor = "#bdc3c7"; // Varsayılan Gri
                        switch (selectedValue) {
                            case "1": ihbarColor = "#2ecc71"; break; // Anlaşmalı
                            case "2": ihbarColor = "#f1c40f"; break; // Beyan
                            case "3": ihbarColor = "#3498db"; break; // Karakol
                            case "4": ihbarColor = "#ff4d4d"; break; // Trafik
                            case "5": ihbarColor = "#9b59b6"; break; // Savcılık
                            case "6": ihbarColor = "#e67e22"; break; // İtfaiye
                        }
                        html += `
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding:4px 0; white-space:nowrap; width:100px;">İhbar Türü:</td>
                                <td style="text-align:right; padding:4px 0; white-space:nowrap;">
                                    ${createBadge(selectedText, ihbarColor)}
                                </td>
                            </tr>`;
                    }
                    // --- 2. MANTIK: HASAR ŞEKLİ (Bağımsız If) ---
                    if (hasarElement && hasarElement.value !== "" && hasarElement.value !== "-1") {
                        let selectedText = hasarElement.options[hasarElement.selectedIndex]?.text || "";
                        let selectedValue = hasarElement.value;
                        let hasarColor = "#00d4ff"; // Hasar şekli için genel mavi
                        if (["1", "5", "18"].includes(selectedValue)) hasarColor = "#ff4d4d"; // Hırsızlık: Kırmızı
                        if (selectedValue === "28") hasarColor = "#9c88ff"; // Değer Kaybı: Mor
                        html += `
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding:4px 0; white-space:nowrap; width:100px;">Hasar Şekli:</td>
                                <td style="text-align:right; padding:4px 0; white-space:nowrap;">
                                    ${createBadge(selectedText, hasarColor)}
                                </td>
                            </tr>`;
                    }
                }
                if (ANALIZPANEL_srtp && !magdurpanel) {
                    const servisAdi = getValue('SERVIS_ADI');
                    if (servisAdi) {
                        const isYetkili = document.getElementsByName('SERVIS_TUR_ID1')[0]?.checked;
                        const isAnlasmali = document.getElementById('ANLASMALI1')?.checked;
                        // Stil Fonksiyonu (Kod tekrarını önlemek için)
                        const getBadge = (text, isPositive) => {
                            const color = isPositive ? "#00d4ff" : "#ff9500";
                            return `<span style="background:${color}15; color:${color}; border:1px solid ${color}44; padding:1px 4px; border-radius: ${config.borderRadius}; font-weight:bold; font-size:10px; white-space:nowrap;">${text.toUpperCase()}</span>`;
                        };
                        const turBadge = getBadge(isYetkili ? "Yetkili" : "Yetkisiz", isYetkili);
                        const anlasmaBadge = getBadge(isAnlasmali ? "Anlaşmalı" : "Anlaşmasız", isAnlasmali);
                        html += `
                            <tr style="border-bottom:1px solid #333;">
                                <td style=" white-space:nowrap; width:100px;">Servis Tipi:</td>
                                <td style="text-align:right; padding:4px 0; white-space:nowrap;">
                                    ${turBadge} <span style="color:#444; margin:0 1px;">|</span> ${anlasmaBadge}
                                </td>
                            </tr>`;
                    }
                    html += `<tr><td colspan="2"><hr style="border:0; border-top:1px solid #444; margin:2px 0;"></td></tr>`;
                }
                const tahminiHasar = parseNum('TAHMINI_HASAR');
                const hasPiyasa = parseNum(typeof magdurpanel !== 'undefined' && magdurpanel ? 'PIYASA' : 'HAS_PIYASA');
                const ssTahmini = parseNum('SS_TAHMINI_HASAR');
                const formatTramer = (str) => {
                    if (!str || str.toString().trim() === "") return '-';
                    return str.toString().replace(/\s/g, '').replace(/(.{3})/g, '$1 ').trim();
                };
                const formatText = (str, limit = 25) => {
                    if (!str) return '-';
                    let cleanStr = str.replace(/^\(\s*.*?\s*\)\s*/, '');
                    return cleanStr.length > limit ? cleanStr.substring(0, limit) + '...' : cleanStr;
                };
                const fields = [
                    { label: 'Servis :', id: "SERVIS_ADI", condition: ANALIZPANEL_srad && !magdurpanel },
                    { label: 'Tramer :', id: "TRAMER_IHBAR_NO", condition: ANALIZPANEL_tra && !magdurpanel },
                    { label: (magdurpanel || isTrafik) ? 'Mağdur :' : 'Sigortalı :', id: (magdurpanel || isTrafik) ? "MAGDUR_AD_SOYAD" : "HAS_ARAC_SAHIBI", condition: ANALIZPANEL_sad },
                    { label: dynamicLabel, id: (magdurpanel || isTrafik) ? "MODEL_ADI" : "HAS_MODEL_ADI", condition: ANALIZPANEL_aad }
                ];
                fields.forEach(f => {
                    if (f.condition) {
                        let raw = "";
                        let element = document.getElementById(f.id) || document.getElementsByName(f.id)[0];
                        if (magdurpanel) {
                            if (f.id === "MAGDUR_AD_SOYAD") {
                                const ad = document.getElementById('MAGDUR_AD')?.value || "";
                                const soyad = document.getElementById('MAGDUR_SOYAD')?.value || "";
                                raw = `${ad} ${soyad}`.trim();
                            } else {
                                raw = (element?.value || element?.innerText || "").trim();
                            }
                        } else if (isTrafik) {
                            const marker = document.querySelector('input[name="MAGDUR_MARKA_ID"]');
                            const targetRow = marker?.parentElement?.closest('tr');
                            if (targetRow) {
                                const cells = targetRow.querySelectorAll('td.acik');
                                if (f.id.includes("MODEL_ADI")) raw = cells[2]?.innerText;
                                else if (f.id === "MAGDUR_AD_SOYAD") raw = cells[6]?.innerText;
                                else if (f.id === "HAS_ARAC_SAHIBI") raw = cells[2]?.innerText;
                            }
                        }
                        if (!raw && element) {
                            raw = (element.value !== undefined ? element.value : element.textContent || "").trim();
                        }
                        let status = raw !== '' ? '✅' : '❌';
                        let valStr = '-';
                        let color = "white";
                        if (raw !== '') {
                            if (f.id === 'HAS_PIYASA' || f.id === 'PIYASA') {
                                valStr = hasPiyasa.toLocaleString('tr-TR');
                                status = (hasPiyasa < 1000) ? '⚠️' : '✅';
                                color = (hasPiyasa < 1000) ? '#ff9500' : '#00d4ff';
                            } else if (f.id === 'TRAMER_IHBAR_NO') {
                                valStr = formatTramer(raw);
                            } else if (['SERVIS_ADI', 'HAS_ARAC_SAHIBI', 'MAGDUR_AD_SOYAD', 'HAS_MODEL_ADI', 'MODEL_ADI'].includes(f.id)) {
                                valStr = formatText(raw, 22);
                                status = ' ';
                            } else { valStr = raw; }
                        }
                        html += `<tr>
                                    <td style="color:white; padding: 4px 0; white-space:nowrap;">${f.label}</td>
                                    <td style="text-align:right; color:${color}; font-weight:bold;">${valStr}<span style="margin-left:5px;">${status}</span></td>
                                </tr>`;
                    }
                });
                if ((ANALIZPANEL_mull || ANALIZPANEL_ryc || ANALIZPANEL_rycorn) && !magdurpanel) { html += `<tr><td colspan="2"><hr style="border:0; border-top:1px solid #444; margin:2px 0;"></td></tr>`; }
                // 1. Hesaplama ve Durum Belirleme
                const getStatusBadge = (text, color) => {
                    return `<span style="background:${color}15; color:${color}; border:1px solid ${color}44; padding:1px 4px; border-radius:${config.borderRadius}; font-weight:bold; font-size:10px; white-space:nowrap; vertical-align:middle; margin-left:4px;">${text.toUpperCase()}</span>`;
                };
                const oran = hasPiyasa > 0 ? (tahminiHasar / hasPiyasa) * 100 : 0;
                let durumMetni = 'BELİRSİZ';
                let durumColor = "#aaa";
                if (hasPiyasa >= 1000) {
                    if (oran <= 30) { durumMetni = '✅ UYGUN'; durumColor = SUCCESS_COLOR; }
                    else if (oran <= 60) { durumMetni = '🟠 %30 ÜZERİ'; durumColor = '#ffa500'; }
                    else { durumMetni = '🔴 %60 ÜZERİ'; durumColor = '#ff4d4d'; }
                }
                const pertUyari = (oran >= 60 && !document.getElementById('pert')?.checked)
                    ? `<div style="color:#ff4d4d; font-weight:bold; font-size:10px; animation:ksBlink 1s infinite; margin-top:2px; text-align:right;">⚠️ DİKKAT: PERT SEÇİLMELİ!</div>`
                    : "";
                html += `<style>@keyframes ksBlink { 0%{opacity:1} 50%{opacity:0.3} 100%{opacity:1} }</style>`;
                html += `<table style="width:100%; border-collapse:collapse; font-size:12px; color:white; line-height:1.2;">`;
                if (ANALIZPANEL_mull && !magdurpanel) {
                    html += `
                    <tr>
                        <td style="width:100px; padding:4px 0;">Sigorta Muallak:</td>
                        <td style="text-align:right; padding:4px 0;">
                            <b>${ssTahmini.toLocaleString()} ₺</b>
                        </td>
                    </tr>`;
                }
                if (ANALIZPANEL_ryc) {
                    html += `
                    <tr style="border-top:1px solid #333;">
                        <td style="width:100px; padding:4px 0;">Piyasa / Rayiç :</td>
                        <td style="text-align:right; padding:4px 0;">
                            <b style="color:#00d4ff">${hasPiyasa.toLocaleString('tr-TR')} ₺</b>
                        </td>
                    </tr>`;
                }
                if (ANALIZPANEL_rycorn && !magdurpanel) {
                    html += `
                        <tr>
                            <td style="width:100px; padding:4px 0;">Eksper Muallak:</td>
                            <td style="text-align:right; padding:4px 0;">
                                <b style="color:${durumColor}">${tahminiHasar.toLocaleString()} ₺</b>
                                ${getStatusBadge(durumMetni, durumColor)}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding:4px 0;">
                                <div class="ks-tooltip-container" style="width:100%;">
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <div style="background:#222; flex-grow:1; height:6px; border-radius:4px; overflow:hidden; border:1px solid #444;">
                                            <div style="background:${durumColor}; width:${Math.min(oran, 100)}%; height:100%;"></div>
                                        </div>
                                        <span style="color:${config.Color}; font-size:12px; min-width:25px;">%${oran.toFixed(0)}</span>
                                    </div>
                                    ${pertUyari}
                                    <div class="ks-tooltip-box">Eksper hasar tutarının piyasa değerine oranını gösterir.</div>
                                </div>
                            </td>
                        </tr>`;
                }
                html += `</table>`;
                function buildTargetUrl() {
                    const extractYear = (str) => {
                        const match = String(str).match(/\b(19|20)\d{2}\b/);
                        return match ? match[0] : "";
                    };
                    let m = "", yRaw = "", kStr = "0";
                    if (magdurpanel) {
                        m = document.getElementById('MODEL_ADI')?.value || document.getElementById('MODEL_ADI')?.innerText || "";
                        yRaw = document.getElementById('MODEL_YILI')?.value || document.getElementById('MODEL_YILI')?.innerText || "";
                        kStr = document.getElementById('KM')?.value || document.getElementById('KM')?.innerText || "0";
                    } else if (isTrafik) {
                        const hiddenInput = document.querySelector('input[name="MAGDUR_MARKA_ID"]');
                        const dataRow = hiddenInput ? hiddenInput.nextElementSibling : document.querySelector('td.acik')?.closest('tr');
                        if (dataRow && dataRow.tagName === 'TR') {
                            const cells = dataRow.querySelectorAll('td.acik');
                            m = cells[2]?.innerText || "";
                            yRaw = cells[3]?.innerText || "";
                        } else {
                            const backupRow = document.querySelector('td.acik')?.closest('tr');
                            if (backupRow) {
                                const cells = backupRow.querySelectorAll('td.acik');
                                m = cells[2]?.innerText || "";
                                yRaw = cells[3]?.innerText || "";
                            }
                        }
                    } else {
                        const mInput = document.getElementById('HAS_MODEL_ADI') || document.getElementById('MODEL_ADI');
                        const yInput = document.getElementById('HAS_MODEL_YILI') || document.getElementById('MODEL_YILI');
                        m = mInput ? (mInput.value || mInput.innerText || "") : "";
                        yRaw = yInput ? (yInput.value || yInput.innerText || "") : "";
                    }
                    if (!magdurpanel) {
                        kStr = document.getElementById('HAS_KM')?.value || document.getElementById('HAS_KM')?.innerText || "0";
                    }
                    m = m.replace(/\d{2}\/\d{2}\/\d{4}.*/g, '').replace(/\(\s*\d+\s*\)/g, '').replace(/\s+/g, ' ').trim();
                    const y = extractYear(yRaw);
                    const k = parseInt(kStr.replace(/\D/g, '')) || 0;
                    const result = m ? {
                        model: m,
                        year: y,
                        kmMin: k >= 100 ? Math.floor(k * 0.85) : null,
                        kmMax: k >= 100 ? Math.ceil(k * 1.15) : null
                    } : null;
                    return result;
                }

                async function startAutomatedSearch(isAnalyze) {
                    const resBox = document.getElementById('shb-res-box');
                    const data = buildTargetUrl();
                    if (!data) { if (isAnalyze) resBox.innerHTML = "❌ Veri hatası!"; return; }
                    if (isAnalyze) {
                        resBox.style.marginBottom = "10px";
                        resBox.innerHTML = `<span style="color:#fff; font-size:13px; opacity:0.8;">🔍 Filtreleniyor...</span>`;
                    }
                    const googleQuery = `site:sahibinden.com "${data.model}" ${data.year}`;
                    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`;
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: googleUrl,
                        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0" },
                        onload: function (gRes) {
                            const gDoc = new DOMParser().parseFromString(gRes.responseText, "text/html");
                            const links = [...gDoc.querySelectorAll('a')];
                            const target = links.find(a => a.href.includes("sahibinden.com/") && !a.href.includes("/ilan listelendi/") && !a.href.includes("/detay"));
                            if (!target) { if (isAnalyze) resBox.innerHTML = "⚠️ Kategori bulunamadı."; return; }
                            let shbUrlString = "";
                            try {
                                const urlObj = new URL(target.href);
                                shbUrlString = urlObj.pathname === "/url" ? urlObj.searchParams.get("q").split('&')[0] : target.href.split('&')[0];
                            } catch (e) { shbUrlString = target.href; }
                            const finalUrl = new URL(shbUrlString);
                            finalUrl.searchParams.set("pagingSize", "50");
                            finalUrl.searchParams.set("sorting", "km-nu_asc");
                            if (data.year) {
                                finalUrl.searchParams.set("a5_min", data.year);
                                finalUrl.searchParams.set("a5_max", data.year);
                                finalUrl.searchParams.set("a90178_min", data.year);
                                finalUrl.searchParams.set("a90178_max", data.year);
                            }
                            if (data.kmMin > 1000) {
                                finalUrl.searchParams.set("a4_min", data.kmMin);
                                finalUrl.searchParams.set("a4_max", data.kmMax);
                                finalUrl.searchParams.set("a90180_min", data.kmMin);
                                finalUrl.searchParams.set("a90180_max", data.kmMax);
                            }
                            if (isAnalyze) fetchPricesFromShb(finalUrl.toString());
                            else unsafeWindow.open(finalUrl.toString(), '_blank');
                        }
                    });
                }

                function fetchPricesFromShb(url) {
                    const resBox = document.getElementById('shb-res-box');
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: url,
                        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0" },
                        onload: function (res) {
                            const sDoc = new DOMParser().parseFromString(res.responseText, "text/html");
                            const rows = [...sDoc.querySelectorAll('tr.searchResultsItem')];
                            const dataList = [];
                            rows.forEach(tr => {
                                const titleEl = tr.querySelector('.classifiedTitle');
                                const priceEl = tr.querySelector('.searchResultsPriceValue');
                                const attrEls = tr.querySelectorAll('.searchResultsAttributeValue');
                                if (titleEl && priceEl && attrEls.length >= 2) {
                                    const price = parseInt(priceEl.innerText.replace(/\D/g, '')) || 0;
                                    if (price > 100000) {
                                        dataList.push({
                                            id: tr.getAttribute('data-id') || Math.random(),
                                            title: titleEl.title.substring(0, 20),
                                            link: "https://www.sahibinden.com" + titleEl.getAttribute('href'),
                                            year: attrEls[0].innerText.trim(),
                                            km: attrEls[1].innerText.trim(),
                                            price: price
                                        });
                                    }
                                }
                            });
                            if (dataList.length > 0) {
                                const avg = Math.round(dataList.reduce((a, b) => a + b.price, 0) / dataList.length);
                                const sortedHigh = [...dataList].sort((a, b) => b.price - a.price);
                                const sortedLow = [...dataList].sort((a, b) => a.price - b.price);
                                const nearAvg = [...dataList].sort((a, b) => Math.abs(a.price - avg) - Math.abs(b.price - avg));
                                let displaySet = new Set(); let displayList = [];
                                const addToDisplay = (item, color) => {
                                    if (item && !displaySet.has(item.id) && displayList.length < 5) {
                                        displayList.push({ ...item, color }); displaySet.add(item.id);
                                    }
                                };
                                addToDisplay(sortedHigh[0], "#27fdf9");
                                addToDisplay(sortedHigh[1], "#26f885");
                                addToDisplay(nearAvg[0], "#d3ff73");
                                addToDisplay(nearAvg[1], "#d3ff73");
                                addToDisplay(sortedLow[0], "#fff8b7");
                                let html = `<style>
               								    .shb-link { color: #42c6ff !important; text-decoration: underline !important; transition: all 0.2s !important; }
               								    .shb-link:hover { color: #aeffe8 !important; opacity: 0.8; }
               								    .shb-link:active { color: #ffeb3b !important; }
               								</style>`;
                                html += `<div style="background: rgba(200, 200, 200, 0.11); border: 1px solid #444; border-radius: 6px; padding: 5px; color: white; width: 100%; box-sizing: border-box;">`;
                                const roundedAvg = Math.round(avg / 5000) * 5000;
                                html += `<div style="display:flex; justify-content:space-between; margin-bottom:4px; border-bottom:1px solid #555; padding-bottom:8px; font-size:11px;"><b>Ort: ${roundedAvg.toLocaleString('tr-TR')} TL</b>
								<span style="color:#00ff88; font-weight:bold;">${dataList.length} İlan</span></div>`;
                                html += `<table style="width:100%; border-collapse:collapse; font-size:10px;">`;
                                displayList.forEach(item => {
                                    html += `<tr style="border-bottom: 1px solid #222;">
                    					     <td style="padding:3px 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    					         <a href="${item.link}" target="_blank" class="shb-link" style="display: inline-block !important;">${item.title}</a>
                    					     </td>
                    					     <td style="color: white; width:30px; text-align:right;">${item.year}</td>
                    					     <td style="color: white; width:50px; text-align:right;">${item.km}</td>
                    					     <td style="color:${item.color}; width:80px; text-align:right; font-weight:bold;">${item.price.toLocaleString('tr-TR')}</td>
                    					 </tr>`;
                                });
                                html += `</table></div>`;
                                resBox.innerHTML = html;
                            } else {
                                resBox.innerHTML = `<br><a href="${url}" target="_blank" style="color:#27fdf9; font-size:13px;">Buraya Tıkla!</a><br>Sonuç bulunamadı adresi kontrol et.<center style="font-size:11px;">Bot engeline takılmış olabilir.</center>`;
                            }
                        }
                    });
                }
                document.getElementById('btn-auto-analiz').onclick = () => startAutomatedSearch(true);
                document.getElementById('btn-auto-look').onclick = () => startAutomatedSearch(false);
                document.getElementById('panelContent').innerHTML = html;
            }
            /* ===== 5. OTOMATİK SEÇİM BUTONU ===== */
            document.getElementById('autoSelectBtn').addEventListener('click', (e) => {
                const setVal = (id, val) => {
                    const el = $(id);
                    if (el) {
                        el.value = val;
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                };
                const clickCb = (id) => {
                    const el = $(id);
                    if (el) { el.checked = false; el.click(); }
                };
                const setSelectText = (id, txt) => {
                    const el = $(id);
                    if (!el) return;
                    const opt = [...el.options].find(o => o.text.includes(txt));
                    if (opt) {
                        el.value = opt.value;
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                };
                ['SURUCU_BELGE_TIPI1', 'SURUCU_BELGESI0', 'RUHSAT_ASLI1', 'RUCU0', 'SAG1', 'HAS_DEVIR_SATIS0',
                    'HAS_EKSIK_ASKIN_SIGORTA0', 'ALACAKLI_DOGUM_TARIHI_BILGISI0', 'TASINAN_YUK0', 'MUAFIYET0', 'EKSPERTIZ_YERI_SEHIR_DISI0',
                    'HASAR_YERI0', 'TESPIT_SEKLI0', 'ONARIM_ONAYI2', 'SURUCU_BELGESI_GORULDU1', 'EHLIYET_YETERLI1', 'ALKOL_DURUMU2'].forEach(clickCb);
                setVal('HAS_ARAC_SAHIBI', getValue('SB_SIGORTALI_ADI_C'));
                setVal('MILLI_R_NO', getValue('IHBAR_TARIHI_YIL'));
                setVal('ONARIM_SURESI', '10');
                setVal('EKSPERTIZ_SURESI', '1');
                setVal('KUSURLU', '0');
                setVal('KUSUR_ORANI', '100');
                setVal('UZAKTAN_EKSPERTIZ', '2');
                setVal('EHLIYET_SINIFI', 'B');
                setVal('EKSPERTIZ_TARIHLERI', `${getValue('IHBAR_TARIHI_GUN')}/${getValue('IHBAR_TARIHI_AY')}/${getValue('IHBAR_TARIHI_YIL')}`);
                setVal('EKSPERTIZ_TALEP_TARIHI_GUN', getValue('IHBAR_TARIHI_GUN')); setVal('EKSPERTIZ_TALEP_TARIHI_AY', getValue('IHBAR_TARIHI_AY')); setVal('EKSPERTIZ_TALEP_TARIHI_YIL', getValue('IHBAR_TARIHI_YIL'));
                setVal('EKSPERTIZ_TARIHI_GUN', getValue('IHBAR_TARIHI_GUN')); setVal('EKSPERTIZ_TARIHI_AY', getValue('IHBAR_TARIHI_AY')); setVal('EKSPERTIZ_TARIHI_YIL', getValue('IHBAR_TARIHI_YIL'));
                setSelectText('KAZA_IHBAR_TURU', 'ANLAŞMALI KAZA');
                setSelectText('KANAAT', 'OLUMLUDUR');
                alert('Ön giriş için otomatik seçimler tamamlandı. ✅');
            });
            if (ANALIZPANEL_hlt) setInterval(highlightFields, 500);
            setInterval(updatePanel, 1500);
        }
    }
    // Hızlı Donanım girişis
    if (KS_SYSTEM && DONANIM && location.href.includes("otohasar") && /eks_(magdur_arac_donanim|arac_donanim)/.test(location.href)) {
        function initPanel() {
            if (document.getElementById('donanim-panel') || !document.body.innerText.toLowerCase().includes("donanim")) return;
            /* ===== 1. PANEL OLUŞTURMA ===== */
            const styleSheet = document.createElement("style");
            styleSheet.innerText = `
              @keyframes slideRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
              #donanim-panel button:active {
                transform: translateY(1px) scale(0.96);
                filter: brightness(1.2);
              }
            `;
            document.head.appendChild(styleSheet);
            // 2. Ana Panel Oluşturma
            const panel = document.createElement('div');
            panel.id = 'donanim-panel';
            panel.style.cssText = `
				position: fixed; top: 0; right: 0;
                z-index: ${Number(config.zIndex) + 1};
                display: flex; gap: 1px;
                padding: 1px;
                background: #000;
                border-bottom-left-radius: 2px;
                box-shadow: -1px 1px 4px rgba(0,0,0,0.5);
                animation: slideRight 0.2s ease-out;
            `;
            // 3. Butonlar için ortak stil
            const btnStyle = document.createElement("style");
            btnStyle.innerText = `
              .panel-btn {
                background: #151515;
                color: #eee;
                border: none;
                padding: 3px 6px;
                font-size: 9px;
                font-weight: 600;
                cursor: pointer;
                border-radius: 1px;
                transition: background 0.1s;
              }
              .panel-btn:hover { background: #222; }
            `;
            document.head.appendChild(btnStyle);
            document.body.appendChild(panel);
            /* ===== 2. MASTER DONANIM LİSTESİ (İSİM BAZLI) ===== */
            const donanimSozlugu = {
                "ALARM": 1,
                "İMMOBİLİZER": 2,
                "KLİMA": 3,
                "RADYO-TEYP": 4,
                "TELEFON": 5,
                "RADYO-CD": 23,
                "CD ÇALAR": 6,
                "ABS": 7,
                "AIRBAG": 8,
                "SUNROOF": 9,
                "DERI DOSEME": 10,
                "VİTES": 22,
                "YAKIT TİPİ": 24,
                "LPG": 11,
                "ENGELLİLER": 12
            };
            /* ===== 3. DATA HAZIRLIĞI VE EŞLEŞTİRME ===== */
            const getPageCheckboxes = () => {
                const rows = Array.from(document.querySelectorAll('tr'));
                let results = [];
                rows.forEach(row => {
                    const labelCell = row.cells[0] ? row.cells[0].innerText.trim().toUpperCase() : "";
                    if (!labelCell) return;
                    let masterId = null;
                    for (let key in donanimSozlugu) {
                        if (labelCell.includes(key)) {
                            masterId = donanimSozlugu[key];
                            break;
                        }
                    }
                    if (masterId) {
                        const inputs = row.querySelectorAll('input[type="checkbox"]');
                        inputs.forEach(input => {
                            const match = input.getAttribute('onclick')?.match(/donanim\('(\d+)',(\d+)\)/);
                            if (match) {
                                results.push(
                                    {
                                        masterId: masterId,
                                        originalId: match[1],
                                        val: parseInt(match[2]),
                                        cb: input
                                    });
                            }
                        });
                    }
                });
                return results;
            };
            /* ===== 4. YARDIMCI FONKSİYONLAR ===== */
            const applyRules = (ruleFn) => {
                const currentCheckboxes = getPageCheckboxes();
                currentCheckboxes.forEach(item => {
                    const targetVal = ruleFn(item.masterId);
                    if (targetVal !== null) {
                        const shouldBeChecked = (item.val === targetVal);
                        if (item.cb.checked !== shouldBeChecked) {
                            item.cb.click();
                        }
                    }
                });
            };
            const createBtn = (text, ruleFn) => {
                const btn = document.createElement('button');
                btn.innerText = text;
                Object.assign(btn.style,
                    {
                        background: '#00aa88',
                        border: '0',
                        borderRadius: '2px',
                        color: "white",
                        cursor: 'pointer',
                        fontWeight: "bold",
                        padding: '3px 6px'
                    });
                btn.onclick = () => applyRules(ruleFn);
                panel.appendChild(btn);
            };
            /* ===== 5. BUTON TANIMLARI (KURALLAR) ===== */
            // 2000 Benzin Kuralı
            createBtn('2000~ Benzin', (id) => {
                if (id <= 10) return id === 4 ? 1 : 0; // Radyo-Teyp Var, diğerleri Yok
                if ([11, 12, 22].includes(id)) return id === 11 ? 1 : 0;
                if ([23, 24].includes(id)) return 0; // Radyo-CD ve Yakıt: 0 (Benzin)
                return null;
            });
            // 2000 Dizel Kuralı
            createBtn('2000~ Dizel', (id) => {
                if (id <= 10) return id === 4 ? 1 : 0;
                if ([11, 12, 22].includes(id)) return 0;
                if ([23, 24].includes(id)) return id === 24 ? 1 : 0; // Yakıt: 1 (Dizel), Radyo-CD: 0
                return null;
            });
            // 2010+ Benzin Kuralı
            createBtn('2010+ Benzin', (id) => {
                if ([1, 5, 9, 10, 11, 12, 22, 23, 24].includes(id)) return 0;
                if ([2, 3, 4, 6, 7, 8].includes(id)) return 1;
                return null;
            });
            // 2010+ Dizel Kuralı
            createBtn('2010+ Dizel', (id) => {
                if ([1, 5, 9, 10, 11, 12, 22, 23].includes(id)) return 0;
                if ([2, 3, 4, 6, 7, 8, 24].includes(id)) return 1; // Yakıt (24) -> 1 (Dizel)
                return null;
            });
        }
        // Başlatma
        if (document.readyState === 'complete') initPanel();
        else unsafeWindow.addEventListener('load', initPanel);
        setTimeout(initPanel, 1500);
    }
    // Hızlı Referans açma Otohasar
    if (KS_SYSTEM && REFERANS && location.href.includes("otohasar") && location.href.includes("eks_hasar_yp_list_yp_talep.php")) {
        let wdt ="200px"; config.width = wdt; config.collapsedWidth = wdt;
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Excell Panel";
        }
        const contentArea = document.querySelector('.ks-content');
        if (contentArea) {
            contentArea.innerHTML = `<div style="text-align:center; padding-bottom:5px; font-size:12px;">Excel için Referanslar kopyala butonu ile kopyalanabilir.<br>Excel'den kopyalanan satırlar yapıştır ile sıralı şekilde yapıştırılabilir.</div>`;
            contentArea.style.display = "flex";
            contentArea.style.gap = "5px";
            const btnPaste = document.createElement('button');
            btnPaste.className = 'ks-btn';
            btnPaste.innerText = "📋 YAPIŞTIR";
            btnPaste.onclick = async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
                    let availableFields = [];
                    for (let j = 1; j <= 20; j++) {
                        let field = document.all(`YP_AD_${j}`);
                        if (!field || field.offsetParent === null) {
                            const alternativeField = document.all(`YP_AD_DIGER_${j}`);
                            if (alternativeField) { field = alternativeField; }
                        }
                        if (field) { availableFields.push(field); }
                    }
                    const inputCount = availableFields.length;
                    const lineCount = lines.length;
                    if (lineCount !== inputCount && lineCount > 0) {
                        const confirmAction = confirm(`Dikkat: Sayı Uyuşmazlığı!\n\nExcel'den gelen satır: ${lineCount}\nSayfadaki kutu sayısı: ${inputCount}\n\nYine de devam etmek istiyor musunuz?`);
                        if (!confirmAction) return;
                    }
                    lines.forEach((line, i) => {
                        if (i < inputCount) {
                            availableFields[i].value = line;
                            availableFields[i].dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    });
                    btnPaste.innerText = "✔️ OK";
                    btnPaste.style.backgroundColor = "#28a745";
                    setTimeout(() => {
                        btnPaste.innerText = "📋 YAPIŞTIR";
                        btnPaste.style.backgroundColor = "";
                    }, 2000);
                } catch (err) {
                    alert("Pano erişim hatası veya kutular bulunamadı!");
                    console.error(err);
                }
            };
            const btnCopy = document.createElement('button');
            btnCopy.className = 'ks-btn';
            btnCopy.innerText = "📤 KOPYALA";
            btnCopy.onclick = async () => {
                try {
                    const rows = Array.from(document.querySelectorAll('tr')).filter(tr => {
                        const firstTd = tr.querySelector('td');
                        return firstTd && firstTd.classList.contains('acik') && tr.querySelectorAll('td').length >= 6;
                    });
                    let excelData = rows.map(tr => {
                        const tds = Array.from(tr.querySelectorAll('td.acik'));
                        const rowData = tds.slice(0, 6).map(td => td.innerText.trim());
                        return rowData.join('\t');
                    }).join('\n');
                    if (excelData) {
                        await navigator.clipboard.writeText(excelData);
                        btnCopy.innerText = "✔️ KOPYALANDI";
                        setTimeout(() => { btnCopy.innerText = "📤 KOPYALA"; }, 2000);
                    } else { alert("Kopyalanacak veri bulunamadı."); }
                } catch (err) { alert("Kopyalama hatası: " + err); }
            };
            const btnFillAll = document.createElement('button');
            btnFillAll.className = 'ks-btn';
            btnFillAll.innerText = "🚗 TÜMÜNÜ GRUPLANDIR - Hepiyi";
            btnFillAll.onclick = async () => {
                try {
                    const grupSelects = document.querySelectorAll('select[name^="YP_GRUP_ID_"]');
                    if (grupSelects.length === 0) return alert("Seçilecek kutu bulunamadı!");
                    let count = 0;
                    const promises = Array.from(grupSelects).map(async (grupSelect) => {
                        const index = grupSelect.name.split('_').pop();
                        grupSelect.value = "2";
                        grupSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        await new Promise(r => setTimeout(r, 500));
                        const altSelect = document.querySelector(`select[name="YP_ID_${index}"]`);
                        if (altSelect) {
                            altSelect.value = "0";
                            altSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            count++;
                        }
                    });
                    await Promise.all(promises);
                    if (count > 0) {
                        btnFillAll.innerText = `✔️ ${count} SATIR HAZIR`;
                        btnFillAll.style.backgroundColor = "#28a745";
                        setTimeout(() => {
                            btnFillAll.innerText = "🚗 TÜMÜNÜ SEÇ";
                            btnFillAll.style.cssText = "";
                        }, 2000);
                    }
                } catch (err) { console.error("Toplu seçim hatası:", err); }
            };
            contentArea.appendChild(btnPaste);
            contentArea.appendChild(btnCopy);
            contentArea.appendChild(btnFillAll);
        }
    }
    if (KS_SYSTEM && REFERANS && location.href.includes("otohasar") && location.href.includes("talep_yp_giris.php")) {
        let wdt ="200px"; config.width = wdt; config.collapsedWidth = wdt;
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            // Başlığı güncellemek isterseniz:
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Excell Panel";
        }
        const contentArea = document.querySelector('.ks-content');
        if (contentArea) {
            contentArea.innerHTML = `<div style="text-align:center; padding-bottom:5px; font-size:12px;">Excel'den kopyalanan satırlar yapıştır ile sıralı şekilde yapıştırılabilir. Fiyat kolonu seçilmediyse 1 olarak girilir. Değer küsüratları " . " olarak girilmeli.</div>`;
            contentArea.style.display = "flex";
            contentArea.style.gap = "5px";
            // --- 1. BUTON: EXCEL'DEN YAPIŞTIR ---
            const btnPaste = document.createElement('button');
            btnPaste.className = 'ks-btn';
            btnPaste.innerText = "📋 YAPIŞTIR";
            btnPaste.onclick = async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    const rows = text.split(/\r?\n/).filter(line => line.trim() !== "");
                    let availableRows = [];
                    for (let j = 0; j < 50; j++) {
                        const kodField = document.querySelector(`input[name="kod[${j}]"]`);
                        const adField = document.querySelector(`input[name="ad[${j}]"]`);
                        const fiyatField = document.querySelector(`input[name="fiyat[${j}]"]`);
                        if (kodField || adField) {
                            availableRows.push({ kod: kodField, ad: adField, fiyat: fiyatField });
                        }
                    }
                    const maxInputs = availableRows.length;
                    const rowCount = rows.length;
                    if (rowCount > maxInputs) {
                        const confirmAction = confirm(`Dikkat: ${rowCount} satır kopyaladınız ama sayfada sadece ${maxInputs} giriş alanı var. \n\nDevam edilsin mi?`);
                        if (!confirmAction) return;
                    }
                    rows.forEach((row, index) => {
                        if (index < maxInputs) {
                            // Excel verisi sütunları Tab (\t) ile ayrılır
                            const columns = row.split('\t');
                            const valKod = columns[0] ? columns[0].trim() : "";
                            const valAd = columns[1] ? columns[1].trim() : "";
                            // Eğer 3. sütun varsa onu al, yoksa "1" yaz
                            const valFiyat = (columns[2] && columns[2].trim() !== "") ? columns[2].trim() : "1";
                            if (availableRows[index].kod) {
                                availableRows[index].kod.value = valKod;
                                availableRows[index].kod.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            if (availableRows[index].ad) {
                                availableRows[index].ad.value = valAd;
                                availableRows[index].ad.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            if (availableRows[index].fiyat) {
                                availableRows[index].fiyat.value = valFiyat;
                                availableRows[index].fiyat.dispatchEvent(new Event('input', { bubbles: true }));
                                if (typeof number_format === "function") {
                                    availableRows[index].fiyat.dispatchEvent(new Event('keyup', { bubbles: true }));
                                }
                            }
                        }
                    });
                    btnPaste.innerText = "✔️ BAŞARIYLA DOLDURULDU";
                    btnPaste.style.backgroundColor = "#28a745";
                    btnPaste.style.color = "#fff";
                    setTimeout(() => {
                        btnPaste.innerText = "📋 EXCEL'DEN YAPIŞTIR";
                        btnPaste.style.cssText = "";
                    }, 2000);

                } catch (err) {
                    alert("Pano erişim hatası! Lütfen tarayıcı izinlerini kontrol edin.");
                    console.error(err);
                }
            };
            contentArea.appendChild(btnPaste);
        }
    }
    if (KS_SYSTEM && REFERANS && location.href.includes("otohasar") && location.href.includes("talep_yp_ayrinti.php")) {
        let wdt ="150px"; config.width = wdt; config.collapsedWidth = wdt;
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        if (panel) {
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Excell Panel";
        }
        const contentArea = document.querySelector('.ks-content');
        if (contentArea) {
            contentArea.innerHTML = `<div style="text-align:center; padding-bottom:5px; font-size:12px;">Tablodaki verileri Excel'e yapıştırmak için kopyalar.</div>`;
            Object.assign(contentArea.style, { display: "flex", flexDirection: "column", gap: "5px" });
            // --- 1. BUTON: LİSTEYİ KOPYALA ---
            const btnCopy = document.createElement('button');
            btnCopy.className = 'ks-btn';
            btnCopy.innerText = "📂 LİSTEYİ KOPYALA";
            btnCopy.style.cursor = "pointer";
            btnCopy.onclick = async () => {
                try {
                    const uniqueLines = new Set();
                    const rows = document.querySelectorAll('tr');
                    rows.forEach(row => {
                        const cells = row.querySelectorAll('td.acik, td.koyu');
                        if (cells.length >= 4) {
                            const parcaKodu = cells[1].innerText.trim();
                            const parcaAdi = cells[2].innerText.trim();
                            const parcaFiyati = cells[3].innerText.trim();
                            const isValidPartCode = /^[a-zA-Z0-9-]+$/.test(parcaKodu);
                            const isScientific = parcaKodu.includes('E+');
                            const isHeader = parcaKodu === "Parça Kodu";
                            if (isValidPartCode && !isScientific && !isHeader) {
                                uniqueLines.add(`${parcaKodu}\t${parcaAdi}\t${parcaFiyati}`);
                            }
                        }
                    });
                    const excelData = Array.from(uniqueLines);
                    if (!excelData.length) return alert("Kopyalanacak geçerli parça bulunamadı!");
                    await navigator.clipboard.writeText(excelData.join('\n'));
                    btnCopy.innerText = "✔️ LİSTE HAZIR";
                    Object.assign(btnCopy.style, { backgroundColor: "#28a745", color: "#fff" });
                    setTimeout(() => {
                        btnCopy.innerText = "📂 LİSTEYİ KOPYALA";
                        btnCopy.style.backgroundColor = "";
                        btnCopy.style.color = "";
                    }, 2000);
                } catch (err) {
                    alert("Kopyalama başarısız!");
                }
            };
            contentArea.appendChild(btnCopy);
        }
    }
    // Hızlı Manuel Parça girişi
    if (KS_SYSTEM && MANUEL && location.href.includes("otohasar") && location.href.includes("eks_hasar_yedpar_yeni_ref.php")) {
        function initPanel() {
            if (document.getElementById("tm-panel")) return;
            /* ===== 1. STYLES ===== */
            const style = document.createElement("style");
            style.innerHTML = `
            :root {
                --panel-bg: rgba(25, 25, 25, 0.85);
                --accent-blue: #0078d4;
                --accent-red: #5d0606;
                --transition-speed: 0.4s;
                --toggle-loc: 250px;
            }
			body {
			    transition: margin-right var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
			    margin-right: 260px !important;
			}
			body.panel-closed {
			    margin-right: 0 !important;
			}
			#tm-panel {
                position: fixed; top: 0; right: 0; width: 250px; height: 100vh;
                background: var(--panel-bg);
                backdrop-filter: blur(${config.blur}) saturate(160%);
                -webkit-backdrop-filter: blur(${config.blur}) saturate(160%);
                color: #fff; z-index: ${Number(config.zIndex) + 1};
                display: flex; flex-direction: column;
                padding: 10px 10px; gap: 8px;
                box-shadow: -5px 0 25px rgba(0,0,0,0.5);
                border-left: 1px solid rgba(255, 255, 255, 0.1);
                transition: transform var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
                overflow-y: auto
                z-index: 1;
            }
            #tm-panel.closed { transform: translateX(calc(var(--toggle-loc) + 15px)); }
            /* Kapatma / Açma Butonu (Toggle) */
            #tm-toggle {
                position: fixed;
                top: 20px;
                right: calc(var(--toggle-loc) + 15px);
                width: 40px;
                height: 50px;
                background: var(--panel-bg);
                border: 1px solid rgba(255,255,255,0.1);
                border-right: none;
                border-radius: 8px 0 0 8px;
                cursor: pointer;
                color: #fff;
                z-index: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: -5px 0 25px rgba(0,0,0,0.5);
                backdrop-filter: blur(${config.blur});
                transition: right var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
            }
            /* KAPANIRKEN */
            #tm-panel.closed + #tm-toggle {
                right: 0px;
            }
            .tm-section-title {
                font-size: 10px; text-transform: uppercase; color: #aaa;
                letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.1);
                padding-bottom: 4px; margin-top: 4px;
            }
            /* 1: Giriş Alanları (Modern & Yüksek Kontrast) */
            .tm-input-group { display: flex; flex-direction: column; gap: 4px; }
            #tm-panel input {
                width: 100% !important;
                padding: 6px;
                border-radius: 8px;
                border: 1px solid #ccc;
                background: #ffffff;
                color: #333;
                outline: none;
                transition: all 0.2s ease-in-out;
                box-sizing: border-box;
                font-size: 12px;
                font-weight: 400;
            }
            #tm-panel input::placeholder { color: #999; }
            #tm-panel input:focus {
                background: #fff;
                border-color: var(--accent-blue);
                box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.15);
                transform: translateY(-1px);
            }
            #tm-panel input[type="number"] { text-align: center; }
            .tm-button-grid {
                display: grid; grid-template-columns: 1fr 1fr; gap: 3px;
            }
            #tm-panel button {
                padding: 6px 8px; border-radius: 6px; border: none;
                cursor: pointer; font-size: 11px; font-weight: 600;
                color: #fff; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex; align-items: center; justify-content: center;
                text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            #tm-panel button:hover {
                transform: translateY(-2px);
                filter: brightness(1.1);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
            #tm-panel button:active { transform: translateY(0); }
            .radio-container {
                display: flex;
                background: #e2e8f0;
                padding: 4px;
                border-radius: 10px;
                border: 0px solid #e2e8f0;
            }
            .radio-container label {
                flex: 1;
                text-align: center;
                padding: 2px 2px;
                border-radius: 7px;
                font-size: 11px;
                font-weight: 600;
                color: black;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                user-select: none;
            }
            .radio-container input { display: none; }
            .radio-container label:has(input:checked) {
                background: var(--accent-blue);
                color: white;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                transform: scale(1.02);
            }
            .radio-container label:not(:has(input:checked)):hover { background: rgba(255, 255, 255, 0.5); color: #334155; }
			.red-alrt-bg { background: #e30707 !important; border: none !important; }
			.white-text { color: #ffffff !important; font-weight: bold !important; }
			.radio-container.red-alrt-bg label:has(input:checked) { background: rgba(255, 255, 255, 0.85) !important; color: black !important; }

            .btn-full { width:100%; height:35px; font-size: 13px !important; }
            .btn-new    { background: #0078d4 !important; color: #ffffff !important; }
            .btn-ok     { background: #16a34a !important; color: #ffffff !important; }
            .btn-czzt   { background: #4baaf3 !important; color: #000000 !important; }
            .btn-orange { background: #f97316 !important; color: #ffffff !important; }
            .btn-purple { background: #9333ea !important; color: #ffffff !important; }
            .btn-rpr    { background: #ea580c !important; color: #ffffff !important; }
            .btn-danger { background: #dc2626 !important; color: #ffffff !important; }
            .btn-info   { background: #0891b2 !important; color: #ffffff !important; }
            .btn-dork   { background: #4b5563 !important; color: #ffffff !important; }
            .btn-kord   { background: #be185d !important; color: #ffffff !important; }
            .btn-lime   { background: #84cc16 !important; color: #000000 !important; }
            .btn-amber  { background: #f59e0b !important; color: #000000 !important; }
            .btn-indigo { background: #4f46e5 !important; color: #ffffff !important; }
            .btn-teal   { background: #0d9488 !important; color: #ffffff !important; }
            .btn-brown  { background: #c4760f !important; color: #ffffff !important; }
            .btn-gold   { background: #eab308 !important; color: #000000 !important; }
            .btn-dark   { background: #1f2937 !important; color: #ffffff !important; }
            @keyframes blink { 0% { opacity: 1; filter: brightness(2); } 50% { opacity: 0.6; } 100% { opacity: 1; } }
            .blinlink { animation: blink 1s infinite;}
        	`;
            document.head.appendChild(style);
            /* ===== 2. PANEL HTML ===== */
            const isClosed = localStorage.getItem('tm_panel_closed') === 'true';
            if (isClosed) document.body.classList.add("panel-closed");

            const panel = document.createElement("div");
            panel.id = "tm-panel";
            if (isClosed) panel.classList.add("closed");
            panel.innerHTML = `
			<div class="ks-tooltip-container">
            	<button id="bYeni" class="btn-new btn-full">YENİ KAYIT</button>
            	<div class="ks-tooltip-box">
            	    <strong>Bilgilendirme</strong><br>
            	    Onarım bölümü geçici olarak kapalıdır.
            	</div>
            </div>
            <div class="tm-section-title">PARÇA BİLGİLERİ</div>
            <div class="tm-input-group">
                <input id="tm_kod" placeholder="Parça Kodu">
                <input id="tm_ad" placeholder="Parça Adı">
                <div style="display:flex; gap:8px;">
                    <input id="tm_fiyat" type="number" placeholder="Fiyat" step="0.01">
                    <input id="tm_adet" type="number" placeholder="Adet" value="1" style="width:70px !important;">
                </div>
            </div>
            <div class="tm-section-title">İŞLEM TİPİ</div>
			<div class="ks-tooltip-container">
            	<div class="radio-container">
            	    <label><input type="radio" name="islemTipi" value="degisim" checked> DEĞİŞİM</label>
            	    <label><input type="radio" name="islemTipi" value="onarim" disabled> ONARIM</label>
            	</div>
                <div class="ks-tooltip-box">
                    <strong>Bilgilendirme</strong><br>
                    Onarım bölümü geçici olarak kapalıdır.
                </div>
            </div>
			<div class="ks-tooltip-container">
            	<div class="radio-container">
                    <label> <input type="radio" name="kod_secim" value="kodsuz" checked> KODSUZ  </label>
                    <label> <input type="radio" name="kod_secim" value="esdeger"> EŞDEĞER </label>
                    <label> <input type="radio" name="kod_secim" value="bos"> BOŞ </label>
                </div>
                <div class="ks-tooltip-box">
                    <strong>Parça Türü</strong><br>
                    Seçim türüne göre otomatik doldurur.
                </div>
            </div>
			<div class="ks-tooltip-container">
                <div class="radio-container red-alrt-bg">
                    <label class="white-text"> <input type="radio" name="kayit_secim" value="kayit" checked> OTOM. KAYDET </label>
                    <label class="white-text"> <input type="radio" name="kayit_secim" value="nonkayit"> KAYDETME </label>
                </div>
                <div class="ks-tooltip-box">
                    <strong>Otomatik Kayıt</strong><br>
                    Parçayı kaydetmeye çalışır, <b>10</b> defa dener. Sorunsuz kayıt işlerken "<b>UYARI Bu Kodlu Parça Bu Dosyaya Zaten Eklenmiş..</b>" şeklinde uyarı alacaksınız <b>Enter</b>'tuşuna basarak devam edin.
                </div>
            </div>
            <div class="tm-section-title">GİRİŞ TÜRÜ</div>
			<div class="ks-tooltip-container">
                <div class="tm-button-grid">
                    <button id="b_kpon" class="btn-ok">KAPORTA ÖN</button>
                    <button id="b_kpar" class="btn-ok">KAPORTA ARKA</button>
                    <button id="b_kpyn" class="btn-ok">KAPORTA YAN</button>
                    <button id="b_kptv" class="btn-ok">KAPORTA TAVAN</button>
                    <button id="b_mek" class="btn-purple">MEKANİK</button>
                    <button id="b_elk" class="btn-czzt">ELEKTRİK</button>
                    <button id="b_cam" class="btn-indigo">CAM</button>
                    <button id="b_doseme" class="btn-gold">DÖŞEME KİLİT</button>
                    <button id="b_aks" class="btn-brown">AKSESUAR</button>
                    <button id="b_diger" class="btn-kord">DİĞER</button>
                </div>
				<div style="padding-top:3px; display: grid; grid-template-columns: repeat(3, 2fr); gap: 5px; width: 100%;">
                    <button id="b_lastık" class="btn-dork">LASTİK</button>
                    <button id="b_civata" class="btn-dork">CİVATA</button>
                    <button id="b_conta" class="btn-dork">CONTA</button>
                    <button id="b_klips" class="btn-dork">KLİPS</button>
                    <button id="b_amblem" class="btn-dork">AMBLEM</button>
                    <button id="b_braket" class="btn-dork">BRAKET</button>
				</div>
                <div class="tm-button-grid" style="padding-top:3px;">
                    <button id="b_mot" class="btn-orange">MOTORSİKLET</button>
                    <button id="b_dorse" class="btn-teal">DORSE</button>
				</div>
                <div class="ks-tooltip-box">
                    <strong>Otomatik Giriş</strong><br>
                    Butonlar kategori listelerinden otomatik seçip hızlı giriş yapar. Eğer parça bilgileri (kod, ad, fiyat) bölümü boş olursa sadece kategori seçer.
                </div>
            </div>
            <div class="tm-section-title">DİĞER İŞLEMLER</div>
            <div class="tm-button-grid">
                <button id="b_gnlonar" class="btn-rpr">GENEL ONARIM</button>
                <button id="b_donyan" class="btn-brown">EŞDEĞERE ÇEVİR</button>
            </div>
            `;
            const toggleBtn = document.createElement("div");
            toggleBtn.id = "tm-toggle";
            toggleBtn.innerHTML = isClosed ? "◀" : "▶";
            document.body.appendChild(panel);
            document.body.appendChild(toggleBtn);
            /* ===== 3. PANEL LOGIC (Kapatma/Açma) ===== */
            toggleBtn.onclick = () => {
                const closed = panel.classList.toggle("closed");
                document.body.classList.toggle("panel-closed", closed);
                toggleBtn.innerHTML = closed ? "◀" : "▶";
                localStorage.setItem('tm_panel_closed', closed);
            };
            //adet kontrolü
            const adetInput = document.getElementById('tm_adet');
            if (adetInput) {
                adetInput.addEventListener('blur', function () { if (this.value === "") { this.value = 0; } });
                adetInput.addEventListener('keydown', function (e) { const invalidChars = ["e", "E", "+", "-", "."]; if (invalidChars.includes(e.key)) { e.preventDefault(); } });
                adetInput.addEventListener('input', function () { if (this.value < 0) this.value = 0; });
            }
            /* ===== 3. HELPERS & SELECTORS ===== */
            const $ = (id) => document.getElementById(id);
            const refs = { kod: $("tm_kod"), ad: $("tm_ad"), fiyat: $("tm_fiyat"), adet: $("tm_adet"), bYeni: $("bYeni") };
            const waitFor = (selectorFn, timeout = 5000) => new Promise((resolve, reject) => {
                const startTime = Date.now();
                const interval = setInterval(() => {
                    const el = selectorFn();
                    if (el) {
                        clearInterval(interval); resolve(el);
                    } else if (Date.now() - startTime > timeout) { clearInterval(interval); reject(new Error("Zaman aşımı: Eleman bulunamadı.")); }
                }, 100);
            });
            const selectValue = async (id, val) => {
                try {
                    const s = await waitFor(() => $(id));
                    await waitFor(() => s.options && Array.from(s.options).some(o => o.value == val), 2000);
                    s.value = val;
                    const eventConfig = { bubbles: true, cancelable: true };
                    s.dispatchEvent(new Event("change", eventConfig));
                    s.dispatchEvent(new Event("input", eventConfig));
                } catch (err) { console.error(`❌ seçim hatası (${id}):`, err.message); }
            };
            const degisonar = () => {
                const selectedRadio = document.querySelector('input[name="islemTipi"]:checked');
                if (!selectedRadio) return;
                const tip = selectedRadio.value;
                const checkboxDegisim = document.getElementById("DEGISIM");
                const checkboxTamir = document.getElementById("TAMIR");
                if (tip === "degisim" && checkboxDegisim) {
                    if (!checkboxDegisim.checked) checkboxDegisim.click();
                    if (checkboxTamir && checkboxTamir.checked) checkboxTamir.checked = false;
                } else if (tip === "onarim" && checkboxTamir) {
                    if (!checkboxTamir.checked) checkboxTamir.click();
                    if (checkboxDegisim && checkboxDegisim.checked) checkboxDegisim.checked = false;
                }
            };
            const zorunluAlanlar = [
                { ref: refs.kod, label: "Parça Kodu" },
                { ref: refs.ad, label: "Adı" },
                { ref: refs.fiyat, label: "Fiyat" }
            ];
            /* ===== 4. CORE ACTIONS ===== */
            const MainFields = () => {
                degisonar();
                const isMissing = zorunluAlanlar.some(alan => !alan.ref.value?.trim());
                if (isMissing) return;
                const mapping = {
                    "PARCA_KODU": refs.kod.value.toUpperCase(),
                    "ADET": refs.adet.value,
                    "ADI": refs.ad.value.toUpperCase(),
                    "BIRIM_FIYAT_GERCEK": refs.fiyat.value.replace(",", "."),
                    "BIRIM_FIYAT_TALEP": refs.fiyat.value.replace(",", ".")
                };
                Object.entries(mapping).forEach(([id, val]) => { const el = $(id); if (el) el.value = val; });
            };
            const SideFields = async (dom, dem) => {
                await Promise.all([selectValue("GRUP_ID", dom), selectValue("ANA_GRUP", dem)]);
                const radio = document.querySelector('input[name="kod_secim"]:checked')?.value;
                const notlar = $("NOTLAR");
                const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
                const forceWrite = (el, val) => {
                    if (!el) return;
                    el.value = val;
                    ["input", "change", "blur"].forEach(ev => el.dispatchEvent(new Event(ev, { bubbles: true })));
                };
                const safeSelect = async (id, val) => {
                    const el = $(id);
                    if (!el) return;
                    const oldAlert = win.alert;
                    const vtb = $("VERITABANINDA");
                    const oldVtb = vtb?.value;
                    try {
                        win.alert = () => { };
                        if (vtb) vtb.value = "0";
                        await selectValue(id, val);
                    } finally {
                        setTimeout(() => {
                            win.alert = oldAlert;
                            if (vtb && oldVtb) vtb.value = oldVtb;
                        }, 150);
                    }
                };
                if (radio === "kodsuz") {
                    const sipSec = $("SIP_SEC_2");
                    if (sipSec) {
                        sipSec.checked = true;
                        sipSec.dispatchEvent(new Event("change", { bubbles: true }));
                    }
                    await safeSelect("SISTEM_NOTU_ID", "2");
                    forceWrite(notlar, "KODSUZ PARÇA");
                    await selectValue("SIPARIS_VERMEME_SEBEP_ID", "2");
                } else if (radio === "esdeger") {
                    await safeSelect("SISTEM_NOTU_ID", "13");
                    forceWrite(notlar, "");
                    await selectValue("SIPARIS_VERMEME_SEBEP_ID", "-1");
                } else if (radio === "bos") {
                    await safeSelect("SISTEM_NOTU_ID", "-1");
                    forceWrite(notlar, "");
                    await selectValue("SIPARIS_VERMEME_SEBEP_ID", "-1");
                }
                const eksikAlan = zorunluAlanlar.find(alan => !alan.ref.value || alan.ref.value.trim() === "");
                if (!eksikAlan) { submitForm(); setTimeout(() => { submitForm(); }, 400); }
            };
            const submitForm = () => {
                const selectedRadio = document.querySelector('input[name="kayit_secim"]:checked');
                if (!selectedRadio || selectedRadio.value !== "kayit") return;
                const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
                let attempts = 0;
                const execute = () => {
                    if (attempts > 10) alert("10 defa denendi, kaydet butonu ile kayıt yapınız.");
                    if (typeof win.sbmt_frm === "function") {
                        if (win.sbmt_frm()) {
                            let canSubmit = true;
                            if (typeof win.doraSiparisSecenek === "function") { if (!win.doraSiparisSecenek()) canSubmit = false; }
                            if (canSubmit) {
                                const form = document.querySelector('form[name="yedparforhasar"]') || document.forms.yedparforhasar;
                                if (form) { form.submit(); return; }
                            }
                        }
                    }
                    attempts++; setTimeout(execute, 500);
                };
                execute();
            };
            const groups = ['islemTipi', 'kayit_secim', 'kod_secim'];
            function loadSelections() {
                groups.forEach(groupName => {
                    const savedValue = GM_getValue('saved_' + groupName);
                    if (savedValue) {
                        const radioToSelect = document.querySelector(`input[name="${groupName}"][value="${savedValue}"]`);
                        if (radioToSelect) { radioToSelect.checked = true; }
                    }
                });
            }
            loadSelections();
            document.addEventListener('change', function (event) {
                if (event.target.type === 'radio' && groups.includes(event.target.name)) {
                    GM_setValue('saved_' + event.target.name, event.target.value);
                    console.log(`[Hafıza] ${event.target.name} güncellendi: ${event.target.value}`);
                }
            });
            /* ===== 5. EVENT HANDLERS ===== */
            refs.bYeni.onclick = () => {
                if (typeof unsafeWindow.yeni_kayit === "function") unsafeWindow.yeni_kayit('');
                [refs.kod, refs.ad, refs.fiyat].filter(input => input !== null && input !== undefined).forEach(input => { input.value = ""; });
                if (refs.bYeni) refs.bYeni.classList.remove("blinlink");
                if (refs.kod) refs.kod.focus();
            };
            $("b_kpon").onclick = async () => { await MainFields(); await SideFields("10", "777"); };
            $("b_kpar").onclick = async () => { await MainFields(); await SideFields("12", "898"); };
            $("b_kpyn").onclick = async () => { await MainFields(); await SideFields("11", "852"); };
            $("b_kptv").onclick = async () => { await MainFields(); await SideFields("13", "905"); };
            $("b_elk").onclick = async () => { await MainFields(); await SideFields("4", "686"); };
            $("b_mek").onclick = async () => { await MainFields(); await SideFields("2", "645"); };
            $("b_cam").onclick = async () => { await MainFields(); await SideFields("17", "934"); };
            $("b_mot").onclick = async () => { await MainFields(); await SideFields("29", "554"); };
            $("b_doseme").onclick = async () => { await MainFields(); await SideFields("5", "580"); };
            $("b_lastık").onclick = async () => { await MainFields(); await SideFields("19", "520"); };
            $("b_civata").onclick = async () => { await MainFields(); await SideFields("25", "537"); };
            $("b_conta").onclick = async () => { await MainFields(); await SideFields("36", "1108"); };
            $("b_klips").onclick = async () => { await MainFields(); await SideFields("24", "536"); };
            $("b_klips").onclick = async () => { await MainFields(); await SideFields("24", "536"); };
            $("b_aks").onclick = async () => { await MainFields(); await SideFields("28", "540"); };
            $("b_amblem").onclick = async () => { await MainFields(); await SideFields("23", "535"); };
            $("b_braket").onclick = async () => { await MainFields(); await SideFields("27", "539"); };
            $("b_diger").onclick = async () => { await MainFields(); await SideFields("6", ""); };
            //---------------------------
            $("b_gnlonar").onclick = async () => {
                const fiyat = refs.fiyat.value.replace(",", ".");
                if ($("BIRIM_FIYAT_GERCEK")) $("BIRIM_FIYAT_GERCEK").value = fiyat; if ($("BIRIM_FIYAT_TALEP")) $("BIRIM_FIYAT_TALEP").value = fiyat;
                await selectValue("GRUP_ID", "6"); await selectValue("ANA_GRUP", "495");
                submitForm();
            };
            $("b_donyan").onclick = async () => {
                const fiyat = refs.fiyat.value.replace(",", ".");
                if ($("BIRIM_FIYAT_GERCEK")) $("BIRIM_FIYAT_GERCEK").value = fiyat; if ($("BIRIM_FIYAT_TALEP")) $("BIRIM_FIYAT_TALEP").value = fiyat;
                if (document.getElementById("SISTEM_NOTU_ID")?.value == "-1") await selectValue("SISTEM_NOTU_ID", "11");
                submitForm();
            };
            setInterval(() => {
                const realInput = document.getElementById("PARCA_KODU");
                if (realInput && (realInput.value || realInput.disabled)) refs.bYeni.classList.add("blinlink");
                else refs.bYeni.classList.remove("blinlink");
            }, 1000);
        }
        const init = () => {
            if (typeof initPanel === 'function') initPanel();
            setTimeout(() => {
                const checkTarget = document.getElementById("SUREKLI");
                if (checkTarget && !checkTarget.checked) checkTarget.click();
            }, 1000);
        };
        const focusTarget = () => {
            const input = document.getElementById('tm_kod');
            if (input) { input.focus(); input.select(); return true; }
            return false;
        };
        if (document.readyState === "complete") init(); else unsafeWindow.addEventListener('load', init);
        const observer = new MutationObserver(() => { if (focusTarget()) observer.disconnect(); });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        window.addEventListener("load", () => { setTimeout(focusTarget, 200); }, { once: true });
    }
    // Hızlı Çoklu Parça girişi
    if (KS_SYSTEM && MANUEL && location.href.includes("otohasar") && location.href.includes("eks_hasar_yedpar_multi.php") && !location.href.includes("eks_hasar_yedpar_multi_form.php")) {
        let wdt ="180px"; config.width = wdt; config.collapsedWidth = wdt;
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Çoklu Giriş Paneli";
            panelContent.innerHTML = `
    	        <div class="ks-grid-container" style="display: grid; grid-template-columns: 1fr; gap: 5px; width: 100%;">
					<div class="ks-tooltip-container">
            		    <div class="tm-button-grid">
    	    		        <button id="btnHepsiniYap" class="ks-btn" style="width: 100%;">Grup & Ana Grup</button>
            		    </div>
            		    <div class="ks-tooltip-box">
            		        <strong>Otomatik seçici</strong><br>
            		        Grup seçimlerini otomatik şekilde "Kaporta Ön" olarak seçer.
            		    </div>
            		</div>
					<div class="ks-tooltip-container">
            		    <div class="tm-button-grid">
    	        	    	<button id="btnSiparisHazirla" class="ks-btn" style="width: 100%;">Tedarik Yok</button>
            		    </div>
            		    <div class="ks-tooltip-box">
            		        <strong>Otomatik seçici</strong><br>
            		        Listedekileri Tedarik Yok olarak seçer.
            		    </div>
            		</div>
					<div class="ks-tooltip-container">
            		    <div class="tm-button-grid">
    	        	    	<button id="btnExcelCopy" class="ks-btn" style="width: 100%;">📋 EXCEL İÇİN KOPYALA</button>
            		    </div>
            		    <div class="ks-tooltip-box">
            		        <strong>Toplu kopyala</strong><br>
            		        İçeriği toplu şekilde excell için kopyalar.
            		    </div>
            		</div>
    	        </div>
    	    `;
            document.getElementById('btnHepsiniYap').addEventListener('click', () => {
                const grupSelectors = document.querySelectorAll(`select[id^="GRUP_ID"]`);
                grupSelectors.forEach(grupSel => {
                    if (grupSel.value === "-1") {
                        const rowId = grupSel.id.replace('GRUP_ID', '');
                        const anaGrupSel = document.getElementById(`ANA_GRUP${rowId}`);
                        grupSel.value = "10";
                        grupSel.dispatchEvent(new Event('change', { bubbles: true }));
                        if (anaGrupSel) {
                            anaGrupSel.value = "777";
                            anaGrupSel.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }
                });
            });
            document.getElementById('btnSiparisHazirla').addEventListener('click', async () => {
                const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                const radioSiparis = document.getElementById('SIPARIS_SECENEK1');
                if (radioSiparis) {
                    radioSiparis.focus();
                    radioSiparis.checked = true;
                    radioSiparis.dispatchEvent(new Event('click', { bubbles: true }));
                    radioSiparis.dispatchEvent(new Event('change', { bubbles: true }));
                    await wait(400);
                }
                const sebepSel = document.getElementById('SIPARIS_VERMEME_SEBEP_ID1');
                if (sebepSel) {
                    sebepSel.value = "9";
                    sebepSel.dispatchEvent(new Event('change', { bubbles: true }));
                    await wait(200);
                }
                const notlarArea = document.getElementById('NOTLAR_SIPARIS1');
                if (notlarArea) {
                    notlarArea.value = "TEDARİK YOK";
                    notlarArea.dispatchEvent(new Event('input', { bubbles: true }));
                }
                alert("İşlemler sırasıyla tamamlandı!");
            });
        }
        /* ===== KOPYALAMA FONKSİYONU (NAME/ID DESTEKLİ) ===== */
        document.getElementById('btnExcelCopy').addEventListener('click', () => {
            let excelRows = [];
            const pKodlar = document.querySelectorAll('[id^="PARCA_KODU"], [name^="PARCA_KODU"]');
            pKodlar.forEach((pKodu) => {
                const idNo = (pKodu.id || pKodu.getAttribute('name')).replace('PARCA_KODU', '');
                const getEl = (key) => document.getElementById(`${key}${idNo}`) || document.querySelector(`[name="${key}${idNo}"]`);
                const pAdi = getEl('ADI');
                const pFiyat = getEl('BIRIM_FIYAT_SISTEM');
                const pGrup = getEl('GRUP_ID');
                const getVal = (el) => {
                    if (!el) return "";
                    return (el.value !== undefined ? el.value : el.innerText).trim();
                };
                const rowData = [
                    getVal(pKodu),
                    getVal(pAdi),
                    getVal(pFiyat),
                    pGrup?.options ? (pGrup.options[pGrup.selectedIndex]?.text || "") : getVal(pGrup)
                ];
                if (rowData[0] || rowData[1]) {
                    excelRows.push(rowData.join('\t'));
                }
            });
            if (excelRows.length > 0) {
                const finalString = excelRows.join('\n');
                navigator.clipboard.writeText(finalString).then(() => {
                    alert(`✅ ${excelRows.length} parça kopyalandı.`);
                }).catch(() => {
                    alert('❌ Kopyalama hatası!');
                });
            }
            else {
                alert('⚠️ Veri bulunamadı!');
            }
        });
    }
    // Hızlı Resim girişi
    if (KS_SYSTEM && RESIM && location.href.includes("otohasar") && location.href.includes("multi_file_upload/index.php")) {
        const getSistemAyarlari = () => {
            let wdt ="100px"; config.width = wdt; config.collapsedWidth = wdt;
            initPanel();
            const text = document.body.innerText.toUpperCase();
            const url = location.href.toLowerCase();
            const varsayilan = {
                EHLİYET: ['1'],
                RUHSAT: ['7'],
                KTT: ['174', '11'],
                BEYAN: ['179', '155'],
                ZABIT: ['5', '118'],
                POLICE: ['3'],
                IMZA: ['131'],
                SICIL: ['202'],
                SKAYIT: ['219'],
                GAZETE: ['202'],
                FAAL: ['190'],
                IRSALIYE: ['26'],
                NUFUS: ['2'],
                DIGER: ['12'],
                ONARIM_SONRASI: ['32'],
                MUTABAKAT: ['211', '28'],
                MUVAFAKAT: ['111'],
                IBRA: ['33'],
                ALKOL: ['4'],
                RAYIC: ['231', '184'],
                TRAMER: ['230', '229', '228'],
                VERGI: ['9', '221'],
                MASAK: ['248']
            };
            const atlas = {
                EHLİYET: ['1', '195', '196'],
                RUHSAT: ['7', '92', '38'],
                KTT: ['174', '11', '96', '22', '188'],
                BEYAN: ['179', '155', '6'],
                ZABIT: ['5', '118', '22', '169'],
                POLICE: ['3'],
                IMZA: ['131', '8'],
                SICIL: ['202'],
                SKAYIT: ['219'],
                GAZETE: ['202'],
                FAAL: ['190'],
                IRSALIYE: ['26', '220', '41'],
                NUFUS: ['2', '213'],
                DIGER: ['12'],
                ONARIM_SONRASI: ['32'],
                MUTABAKAT: ['211', '28'],
                MUVAFAKAT: ['111', '56', '57', '101', '130'],
                IBRA: ['33', '132', '212'],
                ALKOL: ['4'],
                RAYIC: ['184'],
                TRAMER: ['12'],
                VERGI: ['9', '221', '208', '62'],
                MASAK: ['12'],
                IHRACAT_REFAKAT: ['133'],
                TASIT_BELGESI: ['177']
            };
            const mapfre = {
                EHLİYET: ['121', '120'],
                RUHSAT: ['143', '144'],
                KTT: ['36', '11'],
                BEYAN: ['6'],
                ZABIT: ['5', '22'],
                POLICE: ['3'],
                IMZA: ['8'],
                SICIL: ['40'],
                SKAYIT: ['12'],
                GAZETE: ['40'],
                FAAL: ['65'],
                IRSALIYE: ['70'],
                NUFUS: ['2'],
                DIGER: ['12'],
                ONARIM_SONRASI: ['18'],
                MUTABAKAT: ['28'],
                MUVAFAKAT: ['39', '79'],
                IBRA: ['33'],
                ALKOL: ['4'],
                RAYIC: ['49', '184'],
                TRAMER: ['48', '210'],
                VERGI: ['9'],
                MASAK: ['162']
            };
            const hepiyi = {
                EHLİYET: ['1', '195', '196', '239'],
                RUHSAT: ['7', '92', '38', '238'],
                KTT: ['174', '11', '96', '237', '224'],
                BEYAN: ['179', '155', '246', '226', '6'],
                ZABIT: ['5', '118', '22', '169'],
                POLICE: ['3'],
                IMZA: ['131', '8'],
                SICIL: ['202'],
                SKAYIT: ['219'],
                GAZETE: ['202'],
                FAAL: ['190'],
                IRSALIYE: ['26', '220', '41', '134'],
                NUFUS: ['2', '213', '201'],
                DIGER: ['12', '243'],
                ONARIM_SONRASI: ['6'],
                MUTABAKAT: ['211', '247', '28'],
                MUVAFAKAT: ['111', '56', '57', '130'],
                IBRA: ['33', '132', '212'],
                ALKOL: ['4'],
                RAYIC: ['231', '184', '225', '234'],
                TRAMER: ['230', '229', '228', '233'],
                VERGI: ['9', '221', '136'],
                MASAK: ['248']
            };
            const ankara = {
                EHLİYET: ['1'], // Ehliyet
                RUHSAT: ['7', '66', '62'], // Ruhsat, Çekme Belgeli Ruhsat, Çarpan Araç Ruhsatı
                KTT: ['38', '11'], // Kaza Tesbit Tutanağı, Karakol Tutanağı
                BEYAN: ['6'], // BEYAN
                ZABIT: ['5', '73', '61'], // ZABIT POLİS, ZABIT JANDARMA, İTFAİYE RAPORU
                POLICE: ['3'], // Poliçe
                IMZA: ['8'], // İmza Sirküsü
                SICIL: ['95'], // SİCİL GAZETESİ
                SKAYIT: ['86'], // TRAMER KAYITLARI (Sistem kaydı olarak en yakın bu)
                GAZETE: ['95'], // SİCİL GAZETESİ
                FAAL: ['94'], // FAALİYET BELGESİ
                IRSALIYE: ['26'], // İrsaliye
                NUFUS: ['2'], // Nufus Cüzdanı
                DIGER: ['12'], // Diğer
                ONARIM_SONRASI: ['6'], // Genelde Beyan veya Teslim tutanağı kullanılır
                MUTABAKAT: ['28'], // Mutabakat Yazısı
                MUVAFAKAT: ['48'], // VEKALET (Muvafakat genelde vekalet/yetki ile ilişkilidir)
                IBRA: ['33', '65'], // Teslim İbra ve Temlik Belgesi, Feragatname
                ALKOL: ['4'], // Alkol Raporu
                RAYIC: ['78', '76'], // GÜNCEL RAYİÇ, PİYASA RAYİCİ
                TRAMER: ['22', '86'], // TRAMER(KTT) SONUCU, TRAMER KAYITLARI
                VERGI: ['9', '50'], // Vergi Levhası, ÇALINTI - TAŞITLAR VERGİ DAİRESİ YAZISI
                MASAK: ['81'] // MASAK EVRAKLARI / FORM
            };
            return (text.includes("MAPFRE") || url.includes("mapfre")) ? mapfre :
                (text.includes("HEPIYI") || url.includes("hepiyi")) ? hepiyi :
                    (text.includes("ATLAS") || url.includes("atlas")) ? atlas :
                        (text.includes("ANKARA") || url.includes("ankara")) ? ankara :
                            varsayilan;
        };
        const ayarlar = getSistemAyarlari();
        // Tooltip Stil Tanımlaması
        const style = document.createElement('style');
        style.innerHTML = ``;
        document.head.appendChild(style);
        // 1. SAĞ ÜST MİNİ PANEL
        function initGeneralPanel() {
            const panel = document.getElementById('ks-master-panel');
            if (!panel) return;
            panel.style.setProperty('width', config.width, 'important');
            panel.style.setProperty('min-width', config.width, 'important');
            const panelContent = panel.querySelector('.ks-content');
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Resim Seçme";
            panelContent.innerHTML = `
                    <div id="ks-action-container" style="display: flex; flex-direction: column; gap: 2px; padding: 2px;"></div>
                    <div id="ks-nav-container" style="padding: 4px;"></div>`;
            const actionContainer = panelContent.querySelector('#ks-action-container');
            const navContainer = panelContent.querySelector('#ks-nav-container');
            const createMiniBtn = (text, color, targetSelector, val, tooltipTitle, tooltipDesc, isScroll = false) => {
                const container = document.createElement('div');
                container.className = 'ks-tooltip-container';
                Object.assign(container.style, {
                    width: '100%',
                    display: 'block'
                });
                const btn = document.createElement('button');
                btn.innerText = text;
                btn.className = 'ks-btn';
                Object.assign(btn.style, {
                    background: color,
                    border: '0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    padding: '3px 4px',
                    fontSize: '11px',
                    width: '100%',
                    display: 'block',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    boxSizing: 'border-box'
                });
                btn.onmousedown = () => { btn.style.transform = 'scale(0.98)'; };
                btn.onmouseup = () => { btn.style.transform = 'scale(1)'; };
                btn.onmouseleave = () => { btn.style.transform = 'scale(1)'; };
                const tip = document.createElement('div');
                tip.className = 'ks-tooltip-box';
                tip.style.display = 'none';
                tip.style.borderColor = color;
                tip.innerHTML = `<strong>${tooltipTitle}</strong><br>${tooltipDesc}`;
                btn.onclick = (e) => {
                    e.preventDefault();
                    if (isScroll) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        document.querySelectorAll(targetSelector).forEach(sel => {
                            sel.value = val;
                            sel.dispatchEvent(new Event('change', { bubbles: true }));
                        });
                    }
                };
                container.appendChild(btn);
                container.appendChild(tip);
                return container;
            };
            actionContainer.appendChild(createMiniBtn('Fotokopi', '#e67e22', 'select[name^="EVRAK_TIPI_"]', '0', 'Evrak Tipi: Fotokopi', 'Tümünü Fotokopi olarak işaretler.'));
            actionContainer.appendChild(createMiniBtn('Aslı', '#2980b9', 'select[name^="EVRAK_TIPI_"]', '1', 'Evrak Tipi: Aslı', 'Tümünü Aslı olarak işaretler.'));
            actionContainer.appendChild(createMiniBtn('OLAY YERİ', '#8e44ad', 'select[name^="PHOTO_CTG_ID_"]', '11', 'Kategori: Olay', 'Tümünü Olay Yeri Resimleri yapar.'));
            actionContainer.appendChild(createMiniBtn('1. EKSPERTİZ', '#27ae60', 'select[name^="PHOTO_CTG_ID_"]', '1', 'Kategori: Ekspertiz', 'Tümünü 1. Ekspertiz Resimleri yapar.'));
            actionContainer.appendChild(createMiniBtn('HASAR', '#2c3e50', 'select[name^="PHOTO_CTG_ID_"]', '13', 'Kategori: Hasar', 'Tümünü Hasar Resimleri yapar.'));
            actionContainer.appendChild(createMiniBtn('ONARIM', '#c0392b', 'select[name^="PHOTO_CTG_ID_"]', ayarlar.ONARIM_SONRASI, 'Kategori: Onarım', 'Tümünü Onarım Resimleri yapar.'));
            navContainer.appendChild(createMiniBtn('▲ TEPEYE ÇIK', '#34495e', null, null, 'Navigasyon', 'Sayfayı en üste kaydırır.', true));
        }
        // 2. SATIR İÇİ PANELLER
        function injectRowPanels() {
            const evrakSelects = document.querySelectorAll('select[name^="EVRAK_ID_"]');
            evrakSelects.forEach(selectEl => {
                if (selectEl.hasAttribute('data-panel-active')) return;
                selectEl.setAttribute('data-panel-active', 'true');
                const fileNameMatch = selectEl.name.match(/\[(.*?)\]/);
                const fileName = fileNameMatch ? fileNameMatch[1] : "Dosya";
                const parentTd = selectEl.closest('td');
                const noteArea = parentTd.querySelector('textarea[name^="HEADER_"]');
                if (noteArea) {
                    const container = document.createElement('div');
                    Object.assign(container.style, {
                        background: '#f1f1f1',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        marginBottom: '8px',
                        marginTop: '6px',
                        maxWidth: '350px',
                        minWidth: '350px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    });
                    const nameLabel = document.createElement('div');
                    nameLabel.innerText = "📁 " + fileName;
                    Object.assign(nameLabel.style, {
                        fontWeight: '800',
                        fontSize: '10px',
                        color: config.color,
                        marginBottom: '6px',
                        padding: '3px 8px',
                        background: config.themecolor,
                        borderRadius: '3px',
                        borderBottom: `3px solid ${config.themeColor}`,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                    });
                    container.appendChild(nameLabel);
                    const btnGroup = document.createElement('div');
                    Object.assign(btnGroup.style, {
                        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0px', width: 'auto', boxSizing: 'border-box'
                    });
                    const buttons = [
                        { label: 'EHLİYET', vals: ayarlar.EHLİYET, color: '#ff4757', t: 'Ehliyet - Mağdur/Sigortalı Tekrar tıkla' },
                        { label: 'RUHSAT', vals: ayarlar.RUHSAT, color: '#ffa502', t: 'Ruhsat - Mağdur/Sigortalı Tekrar tıkla' },
                        { label: 'KİMLİK', vals: ayarlar.NUFUS, color: '#1e90ff', t: 'Kimlik/Nüfus' },
                        { label: 'POLİÇE', vals: ayarlar.POLICE, color: '#3742fa', t: 'Poliçe' },
                        { label: 'TUTANAK', vals: ayarlar.KTT, color: '#2ed573', t: 'Kaza Tespit/Karakol/Görgü/İtfaiye Tutanağı' },
                        { label: 'BEYAN', vals: ayarlar.BEYAN, color: '#57606f', t: 'Beyan Mağdur/Talep' },
                        { label: 'ZABIT', vals: ayarlar.ZABIT, color: '#a29bfe', t: 'Zabıt / Zabıt Tercüme' },
                        { label: 'ALKOL', vals: ayarlar.ALKOL, color: '#ff6b81', t: 'Alkol Raporu' },
                        { label: 'İMZA', vals: ayarlar.IMZA, color: '#1abc9c', t: 'İmza Sirküsü' },
                        { label: 'GAZETE', vals: ayarlar.GAZETE, color: '#95a5a6', t: 'Sicil Gazetesi' },
                        { label: 'SİCİLKT', vals: ayarlar.SICIL, color: '#7f8c8d', t: 'Sicil Kayıt' },
                        { label: 'SSKKT', vals: ayarlar.SKAYIT, color: '#8395a7', t: 'SSK Kaydı' },
                        { label: 'FALİYET', vals: ayarlar.FAAL, color: '#ee5253', t: 'Faaliyet' },
                        { label: 'MUTABAK', vals: ayarlar.MUTABAKAT, color: '#10ac84', t: 'Mutabakatname/Mutabakat Yazısı' },
                        { label: 'MUVAFFA', vals: ayarlar.MUVAFAKAT, color: '#22af94', t: 'Muvaffakatname' },
                        { label: 'TSLMİBR', vals: ayarlar.IBRA, color: '#2e86de', t: 'İbraname/Teslim İbra' },
                        { label: 'İRSALYE', vals: ayarlar.IRSALIYE, color: '#f39c12', t: 'İrsaliye' },
                        { label: 'PİYASA', vals: ayarlar.RAYIC, color: '#f1c40f', t: 'Piyasa - Rayiç Çalışması/Aktüer Raporu' },
                        { label: 'TRAMER', vals: ayarlar.TRAMER, color: '#5f27cd', t: 'Tramer Sorgulama/Ağır Hasar/Geçmiş Hasar' },
                        { label: 'MASAK', vals: ayarlar.MASAK, color: '#00d2d3', t: 'MASAK Evrakları' },
                        { label: 'VERLVHA', vals: ayarlar.VERGI, color: '#546e7a', t: 'VERGİ LEVHASI / V.L. ŞİRKETLER İÇİN Tekrar tıkla' },
                        { label: 'DİĞER', vals: ayarlar.DIGER, color: '#bdc3c7', t: 'Diğer Evraklar' }
                    ];

                    buttons.forEach(btnData => {
                        const btnWrapper = document.createElement('div');
                        btnWrapper.className = 'ks-tooltip-container';
                        btnWrapper.style.width = 'auto';
                        const btn = document.createElement('button');
                        btn.innerText = btnData.label;
                        btn.className = 'ks-btn';
                        btn.type = "button";
                        Object.assign(btn.style, {
                            width: '45px', fontSize: '9px', padding: '2px 2px', cursor: 'pointer', background: btnData.color, color: 'white', border: 'none', borderRadius: '2px', fontWeight: 'bold',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)', transition: 'transform 0.1s, box-shadow 0.1s'
                        });
                        btn.onmousedown = () => { btn.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.5)'; };
                        btn.onmouseup = () => { btn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)'; };
                        const tip = document.createElement('div');
                        tip.className = 'ks-tooltip-box';
                        tip.style.borderColor = btnData.color;
                        tip.innerHTML = `<b style:"font-weight: bold;">${btnData.t}</b>`;
                        btn.onclick = (e) => {
                            e.preventDefault();
                            let nextVal = btnData.vals[0];
                            if (btnData.vals.length > 1 && selectEl.value === btnData.vals[0]) { nextVal = btnData.vals[1]; }
                            selectEl.value = nextVal;
                            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                            /* //-- Evrak türünüde seçer
                            const tipiSelect = parentTd.querySelector('select[name^="EVRAK_TIPI_"]');
                            if (tipiSelect) {
                                tipiSelect.value = "1";
                                tipiSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            }*/
                        };
                        btnWrapper.appendChild(btn);
                        btnWrapper.appendChild(tip);
                        btnGroup.appendChild(btnWrapper);
                    });
                    container.appendChild(btnGroup);
                    noteArea.parentNode.insertBefore(container, noteArea);
                }
            });
        }
        function start() {
            initGeneralPanel();
            injectRowPanels();
        }
        setTimeout(start, 500);
        setInterval(start, 2500);
    }
    // Resim yükleme kontrolü
    if (KS_SYSTEM && RESIM && location.href.includes("otohasar") && location.href.includes("eks_hasar_evrak_foto_list.php")) {
        let wdt ="150px"; config.width = wdt; config.collapsedWidth = wdt;
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Evrak Analizi";
            panelContent.innerHTML = `
    	        <div id="panelContent" style="color:#fff; text-align:center; padding:2px; background:rgba(0,0,0,0.2); border-radius:5px; margin-bottom:8px; font-size:11px; font-weight:bold; border:1px solid rgba(255,255,255,0.1);">DURUM TARANIYOR</div>
    	        <div class="ks-grid-container" style="display: grid; grid-template-columns: 1fr; gap: 2px; width: 100%;">
    	            <div style="color:#aaa; font-size:10px; text-align:center;">Tablo verileri bekleniyor...</div>
    	        </div>
    	    `;
        }
        function updatePanel() {
            const container = document.querySelector('.ks-grid-container');
            const statusHeader = document.getElementById('panelContent');
            if (!container) return;
            const scenarios = {
                KTT: { label: "KAZA ŞEKLİ: KTT", keys: ["kaza tesbit tutanağı", "kaza tespit tutanağı", "( ktt-anlaşmalı tutanak )", "(ktt)", "anlasmali kaza"], req: [{ id: "e", k: ["ehliyet"], l: "Ehliyet" }, { id: "r", k: ["ruhsat"], l: "Ruhsat" }] },
                Zabit: { label: "KAZA ŞEKLİ: ZABIT", keys: ["zapt", "zabit", "zabıt", "karakol", "ifade", "görgü tespit", "polis", "jandarma"], req: [{ id: "a", k: ["alkol"], l: "Alkol Raporu" }, { id: "e", k: ["ehliyet"], l: "Ehliyet" }, { id: "r", k: ["ruhsat"], l: "Ruhsat" }] },
                Beyan: { label: "KAZA ŞEKLİ: BEYAN", keys: ["beyan yazısı", "beyan talep", "müşteri beyanı", "mağdur beyanı", "beyan"], req: [{ id: "e", k: ["ehliyet"], l: "Ehliyet" }, { id: "r", k: ["ruhsat"], l: "Ruhsat" }] }
            };
            const rows = Array.from(document.querySelectorAll('table tr'));
            const uploadedDocs = rows.map(r => {
                const c = r.querySelectorAll('td')[1];
                return c ? c.innerText.toLocaleLowerCase('tr-TR').replace(/-/g, '').trim() : "";
            }).filter(t => t !== "");
            let active = null;
            for (const k in scenarios) {
                if (scenarios[k].keys.some(key => uploadedDocs.some(u => u.includes(key)))) { active = scenarios[k]; break; }
            }
            container.innerHTML = '';
            const createBox = (text, ok, isMain = false, isOptional = false) => {
                const div = document.createElement('div');
                let borderColor = ok ? '#28a745' : '#dc3545';
                let bgColor = ok ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)';
                let textColor = ok ? '#85ff9e' : '#ff8585';
                if (isOptional && ok) {
                    borderColor = '#ffc107';
                    bgColor = 'rgba(255,193,7,0.15)';
                    textColor = '#ffe082';
                }
                div.style.cssText = `padding:4px 5px; border-radius:4px; font-size:11px; font-weight:600; text-align:center; transition: all 0.3s; border-right: 4px solid ${borderColor}; background:${bgColor}; color:${textColor}; margin-bottom:2px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);`;
                div.innerText = (ok ? "" : "⚠ ") + text.toUpperCase();//ok ? "✓ " : "⚠ "
                if (isMain && ok) { statusHeader.innerText = text.toUpperCase(); statusHeader.style.color = "#28a745"; }
                return div;
            };
            const optionalReqs = [
                { k: ["poliçe"], l: "Poliçe" },
                { k: ["teslim ibra", "ibraname"], l: "İbraname" },
                { k: ["faaliyet belgesi"], l: "Faaliyet Belgesi" },
                { k: ["hasar bildirim", "taahhüt"], l: "Hasar Bildirim Formu" },
                { k: ["fatura"], l: "Fatura" },
                { k: ["ibraname", "ibra", "temlik"], l: "İbraname/İbra" },
                { k: ["tramer", "kusur"], l: "Tramer/Kusur" },
                { k: ["eksper", "raporu"], l: "Eksper Raporu" },
                { k: ["vergi levhası"], l: "Vergi Levhası" },
                { k: ["imza sirküsü"], l: "İmza Sirküsü" },
                { k: ["ticaret sicil"], l: "Ticaret Sicil" },
                { k: ["ihbar föyü"], l: "Hasar İhbar Föyü" },
                { k: ["ssk", "kurumu"], l: "SSK Bildirimi" }
            ];
            if (active) {
                container.appendChild(createBox(active.label, true, true));
                active.req.forEach(req => {
                    const found = uploadedDocs.some(d => req.k.some(k => d.includes(k)));
                    let label = req.l;
                    const sig = uploadedDocs.some(u => u.includes("sigortalı"));
                    const mag = uploadedDocs.some(u => u.includes("mağdur"));
                    if (sig && mag) label += " (SİG/MAĞ)";
                    else if (sig) label += " (SİG)";
                    else if (mag) label += " (MAĞ)";
                    container.appendChild(createBox(label, found));
                });
            } else {
                statusHeader.innerText = "EVRAK EKSİK";
                statusHeader.style.color = "#dc3545";
                container.appendChild(createBox("KAZA EVRAĞI BULUNAMADI", false));
            }
            optionalReqs.forEach(or => {
                const found = uploadedDocs.some(d => or.k.some(k => d.includes(k)));
                if (found) container.appendChild(createBox(or.l, true, false, true));
            });
        }
        const runner = setInterval(() => { if (document.querySelector('table')) updatePanel(); }, 2000);
        document.addEventListener('input', e => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                const s = e.target.selectionStart, n = e.target.selectionEnd;
                e.target.value = e.target.value.toLocaleUpperCase('tr-TR');
                e.target.setSelectionRange(s, n);
            }
        }, true);
    }
    // Sayfa bildirim öldürücü
    if (KS_SYSTEM && BILDIRIM && location.href.includes("otohasar") && location.href.includes("eks_hasar.php")) {
        const w = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
        let notificationCounts = {};
        const MAX_ALLOWED = 3;
        const showTopNotification = (message, count) => {
            let notifyDiv = document.getElementById('tm-notify-bar');
            if (!notifyDiv) {
                notifyDiv = document.createElement('div');
                notifyDiv.id = 'tm-notify-bar';
                Object.assign(notifyDiv.style, {
                    position: 'fixed', top: '0', left: '0', width: '100%',
                    backgroundColor: '#f44336', color: 'white', textAlign: 'center',
                    padding: '10px', zIndex: '9999999', fontSize: '14px',
                    fontFamily: 'sans-serif', fontWeight: 'bold',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    transition: 'opacity 0.5s ease', pointerEvents: 'none'
                });
                document.body.appendChild(notifyDiv);
            }
            notifyDiv.innerText = `[${count}. Tekrar] OTOMATİK GEÇİLDİ: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`;
            notifyDiv.style.opacity = '1';
            if (w.tmNotifyTimeout) clearTimeout(w.tmNotifyTimeout);
            w.tmNotifyTimeout = setTimeout(() => {
                if (document.getElementById('tm-notify-bar')) { document.getElementById('tm-notify-bar').style.opacity = '0'; }
            }, 3000);
        };
        const rawAlert = w.alert.bind(w);
        const rawConfirm = w.confirm.bind(w);
        const rawPrompt = w.prompt.bind(w);
        // Alert Override
        w.alert = function (message) {
            notificationCounts[message] = (notificationCounts[message] || 0) + 1;
            if (notificationCounts[message] > MAX_ALLOWED) {
                console.warn("[Tampermonkey] Alert engellendi:", message);
                showTopNotification(message, notificationCounts[message]);
                return; // void
            }
            return rawAlert(message);
        };
        // Confirm Override
        w.confirm = function (message) {
            notificationCounts[message] = (notificationCounts[message] || 0) + 1;
            if (notificationCounts[message] > MAX_ALLOWED) {
                console.warn("[Tampermonkey] Confirm otomatik onaylandı:", message);
                showTopNotification(message, notificationCounts[message]);
                return true; // Otomatik OK
            }
            return rawConfirm(message);
        };
        // Prompt Override
        w.prompt = function (message, defaultValue) {
            notificationCounts[message] = (notificationCounts[message] || 0) + 1;
            if (notificationCounts[message] > MAX_ALLOWED) {
                console.warn("[Tampermonkey] Prompt otomatik geçildi:", message);
                showTopNotification(message, notificationCounts[message]);
                return defaultValue || "";
            }
            return rawPrompt(message, defaultValue);
        };
        console.log("Tampermonkey: Bildirim kontrolü ve override işlemleri tamamlandı.");
    }
    // Sbm Hızlı Seçim
    if (KS_SYSTEM && SBM && location.href.includes("online.sbm.org.tr/trm-police/genelSorguEksper")) {
        GM_addStyle(`
        #hizli-secim-paneli {
            display: inline-block !important;
            vertical-align: middle !important;
            margin-left: 8px !important;
            white-space: nowrap !important;
        }
        .hizli-btn {
            border: none !important;
            color: white !important;
            padding: 4px 8px !important;
            margin: 0 2px !important;
            cursor: pointer !important;
            border-radius: 3px !important;
            font-weight: bold !important;
            font-size: 11px !important;
            display: inline-block !important;
            transition: opacity 0.2s;
        }
    	`);
        var sirketler = [
            { ad: "TÜRKİYE (TS)", kod: "026", renk: "#1e3a8a" },
            { ad: "MAPFRE", kod: "050", renk: "#e11d48" },
            { ad: "ATLAS", kod: "108", renk: "#059669" },
            { ad: "AK SİGORTA", kod: "004", renk: "#ea580c" },
            { ad: "HEPİYİ", kod: "126", renk: "#7c3aed" },
            { ad: "ANKARA", kod: "009", renk: "#2563eb" },
            { ad: "QUİCK", kod: "110", renk: "#d1a401" },
            { ad: "CORPUS", kod: "019", renk: "#8b5e34" },
            { ad: "ORIENT", kod: "106", renk: "#db2777" },
            { ad: "ANADOLU", kod: "007", renk: "#005bb7" },
            { ad: "SOMPO", kod: "061", renk: "#c52b1e" },
            { ad: "RAY", kod: "042", renk: "#ed1c24" },
            { ad: "ALLIANZ", kod: "011", renk: "#003781" }
        ];
        var checkExist = setInterval(function () {
            var selectBox = document.getElementById('sigortaSirketKod');
            if (selectBox && !document.getElementById('hizli-secim-paneli')) {
                selectBox.style.display = 'inline-block';
                selectBox.style.verticalAlign = 'middle';
                var container = document.createElement('div');
                container.id = 'hizli-secim-paneli';
                for (var i = 0; i < sirketler.length; i++) {
                    (function (idx) {
                        var sirket = sirketler[idx];
                        var btn = document.createElement('button');
                        btn.className = 'hizli-btn';
                        btn.innerHTML = sirket.ad;
                        btn.style.backgroundColor = sirket.renk;
                        btn.setAttribute('type', 'button');
                        btn.onclick = function (e) {
                            // Olayları durdur
                            if (e.preventDefault) e.preventDefault();
                            if (e.stopPropagation) e.stopPropagation();
                            // Değer atama
                            selectBox.value = sirket.kod;
                            if ("createEvent" in document) {
                                var evt = document.createEvent("HTMLEvents");
                                evt.initEvent("change", true, true);
                                selectBox.dispatchEvent(evt);
                            } else if ("fireEvent" in selectBox) {
                                selectBox.fireEvent("onchange");
                            }
                            if (window.jQuery) { window.jQuery(selectBox).trigger('change'); }
                            btn.style.opacity = '0.5';
                            setTimeout(function () { btn.style.opacity = '1'; }, 200);
                        };
                        container.appendChild(btn);
                    })(i);
                }
                selectBox.parentNode.insertBefore(container, selectBox.nextSibling);
            }
        }, 1000);
    }
    // Sbm 3lü sayı bölme
    if (KS_SYSTEM && SBM && (location.href.includes("online.sbm.org.tr/trm-ktt/giris") || location.href.includes("online.sbm.org.tr/trm-ktt/sirket/listView"))) {
        let lastFormattedNumber = "";
        const parseDate = (s) => {
            const b = s?.split(' ')[0].split('/');
            return b?.length === 3 ? new Date(b[2], b[1] - 1, b[0]) : null;
        };
        const createNumberPanel = () => {
            let panel = document.getElementById('sbm-big-number-panel');
            if (!panel) {
                panel = document.createElement('div');
                panel.id = 'sbm-big-number-panel';
                const styleSheet = document.createElement("style");
                styleSheet.innerText = `
                    @media print {
                        #sbm-big-number-panel {
                        position: absolute !important;
                        top: 5px;
	        			font-size: 17px !important;
                        }
                    }
                #sbm-big-number-panel span.tramer-copy {
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                #sbm-big-number-panel span.tramer-copy:active {
                    opacity: 0.5;
                }
                `;
                document.head.appendChild(styleSheet);
                Object.assign(panel.style, {
                    position: 'fixed',
                    top: '5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.75)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: '10000',
                    fontFamily: 'monospace',
                    display: 'none',
                    whiteSpace: 'nowrap',
                    fontSize: '22px',
                    border: '0px solid #666',
                    textAlign: 'center'
                });
                panel.onclick = (e) => {
                    const target = e.target.closest('.tramer-copy');
                    if (target && !target.dataset.cooldown) {
                        const originalHTML = target.innerHTML;
                        const rawNum = target.innerText.replace(/\s/g, '');
                        navigator.clipboard.writeText(rawNum).then(() => {
                            target.dataset.cooldown = "true";
                            target.innerText = "Kopyalandı!";
                            target.style.color = "#28a745";
                            setTimeout(() => {
                                target.innerHTML = originalHTML;
                                target.style.color = "black";
                                delete target.dataset.cooldown;
                            }, 1500);
                        });
                    }
                };
                document.body.appendChild(panel);
            }
            return panel;
        };
        const updatePanelContent = (num) => {
            const panel = createNumberPanel();
            let displayDate = "";
            if (window.location.href.includes("sirket/listView.sbm")) {
                const labels = Array.from(document.querySelectorAll('.field-label'));
                const targetLabel = labels.find(el => el.textContent.includes('İlk İşlem Tarihi:'));
                displayDate = targetLabel?.nextElementSibling?.innerText.trim() || new Date().toLocaleDateString('tr-TR');
            } else {
                displayDate = new Date().toLocaleDateString('tr-TR');
            }
            panel.innerHTML = `
            	<span class="tramer-copy" style="font-weight: bold; color: black;" title="Kopyalamak için tıkla">${num}</span>
                <span style="margin: 0 15px; color: #666;">|</span>
                <span style="color: #666;">${displayDate}</span>
            `;
            panel.style.display = 'block';
        };
        const formatSbmNumber = (text) => {
            let found = false;
            const formatted = text.replace(/\b\d{17,}\b/g, (match) => {
                found = true;
                lastFormattedNumber = match.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                return match;
            });
            if (found) updatePanelContent(lastFormattedNumber);
            return formatted;
        };
        const processNodes = (rootElement) => {
            const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while ((node = walker.nextNode())) {
                if (/\d{17,}/.test(node.nodeValue)) formatSbmNumber(node.nodeValue);
            }
        };
        const analyzePolicies = () => {
            const kazaInp = document.getElementById('ihbarPoliceSorguBilgileriForm.kazaTarihi');
            const kazaT = parseDate(kazaInp?.value);
            if (!kazaT || isNaN(kazaT)) return;
            document.querySelectorAll('tr.odd, tr.even, tr[class*="selected"]').forEach(row => {
                const match = row.innerText.match(/(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/);
                if (!match) return;
                const dS = parseDate(match[1]), dE = parseDate(match[2]);
                if (!dS || !dE) return;
                let color = '#f8d7da';
                if (kazaT >= dS && kazaT <= dE) {
                    const gecenGun = Math.floor((kazaT - dS) / 864e5);
                    color = gecenGun <= 2 ? '#f8c291' : (gecenGun <= 7 ? '#fff3cd' : '#d4edda');
                }
                row.style.setProperty('background-color', color, 'important');
            });
        };
        const mainObserver = new MutationObserver((mutations) => {
            mainObserver.disconnect();
            for (const mutation of mutations) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) processNodes(node);
                    else if (node.nodeType === 3 && /\d{17,}/.test(node.nodeValue)) formatSbmNumber(node.nodeValue);
                });
            }
            analyzePolicies();
            mainObserver.observe(document.body, { childList: true, subtree: true });
        });
        const init = () => {
            createNumberPanel();
            processNodes(document.body);
            analyzePolicies();
            mainObserver.observe(document.body, { childList: true, subtree: true });
        };
        if (document.readyState === 'complete') init();
        else unsafeWindow.addEventListener('load', init);
    }
    // SBM Resim indirme
    if (KS_SYSTEM && SBM && location.href.includes("online.sbm.org.tr/trm-ktt/sirket/listShowTutanakResimleriPage.sbm")) {
        const MIN_WIDTH = 300;
        function initSbmDownloadPanel() {
            if (document.getElementById('sbm-download-mini-panel')) return;
            const panel = document.createElement('div');
            panel.id = 'sbm-download-mini-panel';
            Object.assign(panel.style, {
                position: 'fixed', top: '5px', right: '5px',
                background: 'rgba(0,0,0,0.9)', borderRadius: '4px',
                padding: '5px', zIndex: '2147483647',
                display: 'flex', flexDirection: 'column',
                gap: '4px', width: '110px', border: '1px solid #555'
            });
            const mainBtn = document.createElement('button');
            mainBtn.innerText = 'RESİMLERİ İNDİR';
            Object.assign(mainBtn.style, {
                background: '#27ae60', border: '0', borderRadius: '2px',
                color: "white", cursor: 'pointer', fontWeight: "bold",
                padding: '6px 2px', fontSize: '10px', width: '100%'
            });
            mainBtn.onclick = async () => {
                const images = document.querySelectorAll('img');
                let count = 0;
                for (const img of images) {
                    if (img.naturalWidth >= MIN_WIDTH || img.width >= MIN_WIDTH) {
                        const url = img.src;
                        if (!url || url.startsWith('data:')) continue;
                        count++;
                        let fileName = `tutanak_resim_${count}_${Date.now()}.jpg`;
                        const urlParams = new URLSearchParams(url.split('?')[1]);
                        if (urlParams.has('id')) {
                            fileName = `tutanak_${urlParams.get('id')}.jpg`;
                        } else if (url.includes('filename=')) {
                            fileName = url.split('filename=')[1].split('&')[0] + ".jpg";
                        }
                        await forceDownload(url, fileName);
                    }
                }
                mainBtn.innerText = `BİTTİ (${count})`;
                setTimeout(() => { mainBtn.innerText = 'RESİMLERİ İNDİR'; }, 3000);
            };
            panel.appendChild(mainBtn);
            document.body.appendChild(panel);
        }
        async function forceDownload(url, fileName) {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = unsafeWindow.URL.createObjectURL(blob);
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                unsafeWindow.URL.revokeObjectURL(link.href);
            } catch (error) {
                console.error("Resim indirilemedi:", url, error);
            }
        }
        unsafeWindow.addEventListener('load', initSbmDownloadPanel);
        setTimeout(initSbmDownloadPanel, 2000);
    }
    // Sahibinden Ortalama KM Piyasa sorgusu
    if (KS_SYSTEM && SAHIBINDEN && location.href.includes("sahibinden.com") && !location.pathname.includes("/ilan/") && !location.pathname.includes("/kategori/")) {
        if (!location.search.includes("pagingSize=50")) {
            const url = new URL(location.href);
            url.searchParams.set("pagingSize", "50");
            location.replace(url.href);
        }
        let wdt ="200px"; config.width = wdt; config.collapsedWidth = wdt;
        initPanel();
        const contentArea = document.querySelector('.ks-content');
        let lastState = "";
        if (contentArea) {
            contentArea.id = 'sahibinden-modern-panel';
            Object.assign(contentArea.style, { minWidth: '200px', pointerEvents: 'none' });
            contentArea.innerHTML = '🔍 Veriler analiz ediliyor...';
            const getColumnIndex = (names) => {
                const headers = document.querySelectorAll('table thead td, table thead th');
                return Array.from(headers).findIndex(h => names.some(n => h.innerText.trim().toLowerCase() === n.toLowerCase()));
            };
            function hesapla() {
                const fIdx = getColumnIndex(['Fiyat', 'Price']);
                const kIdx = getColumnIndex(['KM', 'Mileage']);
                const yIdx = getColumnIndex(['Yıl', 'Year']);
                if (fIdx === -1) { contentArea.innerHTML = '⚠️ Fiyat sütunu bulunamadı'; return; }
                const rows = document.querySelectorAll('table tbody tr:not(.nativeAd)');
                let fTop = 0, fAd = 0, fMin = Infinity, fMax = 0;
                let kmTop = 0, kmAd = 0, kmMin = Infinity, kmMax = 0;
                const yilSeti = new Set();
                rows.forEach(row => {
                    const cells = row.cells;
                    if (!cells || cells.length <= Math.max(fIdx, kIdx, yIdx)) return;
                    const vFiyat = parseFloat(cells[fIdx].innerText.replace(/[^\d]/g, ''));
                    if (vFiyat > 0) {
                        fTop += vFiyat; fAd++;
                        if (vFiyat < fMin) fMin = vFiyat;
                        if (vFiyat > fMax) fMax = vFiyat;
                    }
                    if (kIdx !== -1) {
                        const vKm = parseInt(cells[kIdx].innerText.replace(/[^\d]/g, ''), 10);
                        if (!isNaN(vKm)) {
                            kmTop += vKm; kmAd++;
                            if (vKm < kmMin) kmMin = vKm;
                            if (vKm > kmMax) kmMax = vKm;
                        }
                    }
                    if (yIdx !== -1) {
                        const vYil = parseInt(cells[yIdx].innerText.trim(), 10);
                        if (!isNaN(vYil)) yilSeti.add(vYil);
                    }
                });
                if (fAd === 0) return;
                const currentState = `${fAd}-${fTop}-${kmTop}`;
                if (lastState === currentState) return;
                lastState = currentState;
                const fOrt = Math.round(fTop / fAd).toLocaleString('tr-TR');
                const kmOrt = kmAd ? Math.round(kmTop / kmAd).toLocaleString('tr-TR') : '-';
                const yillar = [...yilSeti].sort((a, b) => a - b);
                const yilText = yillar.length > 0 ? (yillar.length > 2 ? `${yillar[0]} - ${yillar.at(-1)}` : yillar.join(' / ')) : '-';
                contentArea.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="color:#ffce44">📊 İstatistikler</b>
                    <span style="background:#555; padding:2px 6px; border-radius:4px; font-size:10px;">${fAd} İlan</span>
                </div>
                <div style="display:grid; gap:4px; font-size:13px;">
                    <div>💰 <b>Ort:</b> ${fOrt} TL</div>
                    <div>🛣️ <b>Ort:</b> ${kmOrt} km</div>
                    <div>📅 <b>Yıl:</b> ${yilText}</div>
                </div>
                <div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.1); font-size:11px; opacity:0.8;">
                    <div>Min: ${fMin.toLocaleString('tr-TR')} TL / ${kmMin === Infinity ? 0 : kmMin.toLocaleString('tr-TR')} km</div>
                    <div>Max: ${fMax.toLocaleString('tr-TR')} TL / ${kmMax.toLocaleString('tr-TR')} km</div>
                </div>`;
            }
            const init = () => {
                if (document.querySelector('table')) { hesapla(); setInterval(hesapla, 2000); } else { setTimeout(init, 500); }
            };
            init();
        }
    }
    // Whatsapp Resim indirme
    if (KS_SYSTEM && WHATSAPP && location.href.includes("web.whatsapp.com")) {
        const getFileName = () => {
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            return `WhatsApp Image ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} at ${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}.jpeg`;
        };
        document.addEventListener('dblclick', (e) => {
            const img = e.target.closest('img._ao3e') || (e.target.tagName === 'IMG' ? e.target : e.target.querySelector('img'));
            if (img?.src) {
                e.stopPropagation();
                e.preventDefault();
                const name = getFileName();
                if (typeof GM_download === "function") {
                    GM_download({
                        url: img.src,
                        name: name,
                        saveAs: false,
                        onerror: (err) => {
                            if (!['not_permitted', 'not_supported'].includes(err.error)) manualDownload(img.src, name);
                        }
                    });
                } else { manualDownload(img.src, name); }
            }
        }, true);
        const manualDownload = (url, name) => {
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            link.remove();
        };
        document.addEventListener('contextmenu', (e) => {
            const msg = e.target.closest('.message-out, .message-in');
            if (msg && !['IMG', 'A'].includes(e.target.tagName)) {
                const btn = msg.querySelector('._ahkm, [role="button"][aria-label*="menu"]');
                if (btn) { e.preventDefault(); btn.click(); }
            }
        }, true);
    }
    // Türkiye Sigorta
    if (KS_SYSTEM && TRSIGORTA && location.href.includes("hasaroto.turkiyesigorta.com.tr") && !location.href.includes("sign-in")) {
        const turkeyfix = ` `;
        GM_addStyle(turkeyfix);
        function applyModernStyles() {
            if (document.getElementById('ts-modern-styles')) return;
            const style = document.createElement('style');
            style.id = 'ts-modern-styles';
            style.innerHTML = `
            .tab-header {
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 8px !important;
                padding: 8px !important;
                background: #f8fafc !important;
                border-radius: 16px !important;
                width: fit-content !important;
                margin: 0 auto 20px auto !important;
                border: 1px solid #e2e8f0 !important;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
            }
            .tab-header .tab-button,
            .osem-tab-btn {
                border: 1px solid transparent !important;
                background: transparent !important;
                color: #64748b !important; /* Slate gri */
                padding: 12px 24px !important;
                font-size: 13px !important;
                font-weight: 700 !important;
                border-radius: 12px !important;
                cursor: pointer !important;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
                margin: 0 !important;
                outline: none !important;
                white-space: nowrap !important;
            }
            .tab-header .tab-button:hover:not(.active),
            .osem-tab-btn:hover:not(.active) {
                background-color: #ffffff !important;
                color: #334155 !important;
                border-color: #e2e8f0 !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
            }
            .tab-header .tab-button.active,
            .osem-tab-btn.active {
                background: #ffffff !important;
                color: #0f172a !important; /* Koyu lacivert/siyah yazı */
                border: 1px solid #cbd5e1 !important;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                transform: translateY(-1px) !important;
            }
            .tab-header .tab-button.active::after,
            .osem-tab-btn.active::after {
                content: '';
                position: absolute;
                bottom: 6px;
                left: 35%;
                right: 35%;
                height: 3px;
                background: #64748b;
                border-radius: 20px;
                opacity: 0.4;
            }
            .tab-header .tab-button::after,
            .tab-header .tab-button::before {
                display: none !important;
            }
        `;
            document.head.appendChild(style);
        }
        // GENEL DEĞER ATAMA
        function forceUpdateValue(input, value) {
            if (!input) return;
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(unsafeWindow.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(input, value);
            ['input', 'change', 'blur'].forEach(name => {
                input.dispatchEvent(new Event(name, { bubbles: true }));
            });
        }
        function handleMagicFill(input) {
            if (!input || input.tagName !== 'INPUT') return;
            const id = (input.id || "").toLowerCase();
            const name = (input.name || "").toLowerCase();
            const html = (input.outerHTML || "").toLowerCase();
            // --- HARİÇ TUTULACAKLAR ---
            const excludedTerms = ["servicetel", "servicephone"];
            const isExcluded = excludedTerms.some(term => id.includes(term) || name.includes(term));
            if (isExcluded) return;
            // --- TELEFON / GSM KONTROLÜ ---
            const isPhoneField = id.includes("gsm") || name.includes("gsm") || html.includes("gsm") ||
                id.includes("phone") || name.includes("phone") || html.includes("phone") ||
                id.includes("tel") || name.includes("tel");
            if (isPhoneField && (input.value.includes('_') || input.value.trim() === "" || input.value.length < 5)) {
                const telNo = "1111111111";
                input.focus();
                forceUpdateValue(input, "");
                setTimeout(() => {
                    const dt = new DataTransfer();
                    dt.setData('text', telNo);
                    const pasteEvt = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
                    input.dispatchEvent(pasteEvt);
                    setTimeout(() => { input.dispatchEvent(new Event('change', { bubbles: true })); input.blur(); }, 100);
                }, 100);
                return;
            }
            // MAĞDUR
            const isVictimOwnerField = id.includes("victimcarownername") || name.includes("victimcarownername");
            if (isVictimOwnerField && input.value.trim() === "") {
                const vName = document.querySelector('input[name*="victimName"]')?.value || "";
                const vSurname = document.querySelector('input[name*="victimSurname"]')?.value || "";
                const fullVictimName = (vName + " " + vSurname).trim();
                if (fullVictimName.length > 1) { forceUpdateValue(input, fullVictimName); return; }
            }
            // GENEL / SİGORTALI
            const isOwnerField = id.includes("carownername") || html.includes("carownername");
            if (isOwnerField && input.value.trim() === "") {
                const fName = document.querySelector('input[id*="Name"]:not([id*="victim"]), input[name*="Name"]:not([name*="victim"])')?.value || "";
                const lName = document.querySelector('input[id*="Surname"]:not([id*="victim"]), input[name*="Surname"]:not([name*="victim"])')?.value || "";
                const fullName = (fName + " " + lName).trim();
                if (fullName.length > 1) {
                    forceUpdateValue(input, fullName);
                }
            }
        }
        function initGlobalListener() {
            const events = ['mousedown', 'focusin'];
            events.forEach(evtType => {
                document.addEventListener(evtType, (e) => {
                    if (e.target.classList.contains('dx-texteditor-input')) {
                        setTimeout(() => handleMagicFill(e.target), 250);
                    }
                }, true);
            });
        }
        initGlobalListener();
        setInterval(() => {
            applyModernStyles();
            if (document.querySelector('.osem-tab-btn') && !document.getElementById('ts-modern-styles')) { applyModernStyles(); }
        }, 1000);
        const observer = new MutationObserver(() => {
            const overlays = document.querySelectorAll('.dx-overlay-wrapper.dx-overlay-shader');
            overlays.forEach(overlay => {
                const textContent = overlay.innerText;
                const targetTitles = ["Seddk 2025/12 Yönetmeliği", "Ön Rapor Gönderilmeme Sebebi Girilmemiş Dosyalar Mevcut!"];
                const isTargetPanel = targetTitles.some(title => textContent.includes(title));
                if (isTargetPanel && !overlay.querySelector('.custom-close-btn')) {
                    const closeBtn = document.createElement('button');
                    closeBtn.innerHTML = '✕';
                    closeBtn.className = 'custom-close-btn';
                    Object.assign(closeBtn.style, {
                        position: 'absolute',
                        top: '10px',
                        right: '20px',
                        zIndex: '999999',
                        backgroundColor: '#ff4d4d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        width: '35px',
                        height: '35px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    });
                    closeBtn.onclick = function () {
                        overlay.remove();
                    };
                    const contentArea = overlay.querySelector('.dx-overlay-content');
                    if (contentArea) {
                        if (window.getComputedStyle(contentArea).position === 'static') {
                            contentArea.style.position = 'relative';
                        }
                        contentArea.appendChild(closeBtn);
                    }
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        function setDxValue(nameAttr, targetValue) {
            const hiddenInput = document.querySelector(`input[name="${nameAttr}"]`);
            if (hiddenInput) {
                const widgetEl = hiddenInput.closest('.dx-selectbox');
                if (widgetEl) {
                    try {
                        const instance = window.jQuery ? window.jQuery(widgetEl).dxSelectBox("instance") : null;
                        if (instance) {
                            instance.option("value", targetValue);
                            console.log(`Başarılı: ${nameAttr} -> ${targetValue}`);
                        } else {
                            hiddenInput.value = targetValue;
                            hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    } catch (e) {
                        console.error("Seçim yapılamadı: ", e);
                    }
                }
            }
        }
        function devExForceSelect(nameAttr, targetId) {
            const inputEl = document.querySelector(`input[name="${nameAttr}"]`);
            if (!inputEl) return;
            const widgetEl = inputEl.closest('.dx-selectbox');
            if (!widgetEl) return;
            try {
                if (window.jQuery) {
                    const $widget = window.jQuery(widgetEl);
                    const instance = $widget.dxSelectBox("instance");
                    if (instance) {
                        instance.option("value", targetId);
                        if (instance.validate) instance.validate();
                        console.log(`${nameAttr} başarıyla set edildi (ID: ${targetId})`);
                        return;
                    }
                }
                inputEl.value = targetId;
                const events = ['change', 'input', 'blur', 'focusout'];
                events.forEach(e => inputEl.dispatchEvent(new Event(e, { bubbles: true })));
            } catch (err) {
                console.error("DevEx Hatası:", err);
            }
        }
        function formDoldur(tipID) {
            // Formdaki 4 ana kutuyu da ID'leri ile mühürle
            /*devExForceSelect("uploadDocOrImage", 2); // Evrak
            devExForceSelect("uploadFileTypeId", tipID); // Butondan gelen tip (Ehliyet, Ruhsat vb.)
            devExForceSelect("documentsAdditionlDetailId1", 1); // Sigortalı
            devExForceSelect("documentsAdditionlDetailId2", 5); // Fotokopi

            // Not alanını doldur ve odakla (Not alanı düz textbox olduğu için kolaydır)
            const note = document.querySelector('input[name="note"]');
            if (note) {
                note.value = "Otomatik Seçim Tamamlandı";
                note.dispatchEvent(new Event('change', { bubbles: true }));
            }*/
        }
        function init() {
            const captions = Array.from(document.querySelectorAll('.dx-form-group-caption'));
            const target = captions.find(c => c.textContent.includes("Evrak ve Resim Yükleme"))?.parentElement;
            if (!target || document.getElementById('helper-btns-v11')) return;
            const container = document.createElement('div');
            container.id = 'helper-btns-v11';
            container.style = "padding: 15px; display: flex; gap: 8px; border: 1px solid #1976d2; margin: 10px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);";
            const btn = (label, color, id) => {
                const b = document.createElement('button');
                b.innerText = label;
                b.type = "button";
                b.style = `padding: 10px 18px; background: ${color}; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);`;
                b.onclick = () => formDoldur(id);
                container.appendChild(b);
            };
            //eklenecek buton ve özellikleri
            btn('Geliştirme sürecinde', '#1976d2', 4);
            const content = target.querySelector('.dx-form-group-content');
            if (content) target.insertBefore(container, content);
        }
        setTimeout(() => { setInterval(init, 2000); }, 1500);
        const widthfornavbar = "200px";
        const panel_colorite = "rgba(230, 230, 230, 0.95)";
        // 1. CSS Ayarları
        const css = `
            #custom-nav-panel {
                position: fixed !important;
                right: 0 !important;
                top: 54px !important;
                width: ${widthfornavbar} !important;
                height: calc(100% - 54px) !important;
                padding: 20px 5px 15px 5px !important;
				gap:2px;
                background: ${panel_colorite} !important;
				backdrop-filter: blur(20px) saturate(160%) contrast(100%);
				-webkit-backdrop-filter: blur(20px) saturate(160%);
                box-shadow: -6px 0px 8px 2px ${config.themeColor}33 !important;
                z-index: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                overflow-y: auto !important;
            }
            .nav-item-btn {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 92% !important;
                min-height: 40px !important;
                max-height: 60px !important;
                margin: 0 auto 10px auto !important;
                padding: 8px 12px !important;
                background: #ffffff !important;
                color: #334155 !important;
                text-decoration: none !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                border: 1px solid rgba(0, 170, 255, 0.15) !important;
                border-radius: 12px !important;
                box-shadow: 0 2px 4px rgba(0, 170, 255, 0.05) !important;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                cursor: pointer !important;
                text-align: center !important;
                line-height: 1.3 !important;
                white-space: normal !important;
                word-break: break-word !important;
            }
            .nav-item-btn:hover {
                background: #f0f9ff !important;
                color: ${config.themeColor} !important;
                border-color: ${config.themeColor} !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 12px rgba(0, 170, 255, 0.12) !important;
            }
            .nav-item-btn:active {
                transform: scale(0.97) !important;
                background: #e0f2fe !important;
                box-shadow: none !important;
            }
            .btn-clicked {
                background: ${config.themeColor} !important;
                color: white !important;
                border-color: transparent !important;
                font-weight: 700 !important;
                box-shadow: 0 4px 10px ${config.themeColor}66 !important;
            }
            .dx-drawer-wrapper {
                padding-right: ${widthfornavbar} !important;
            }
            #custom-nav-panel::-webkit-scrollbar { width: 4px; }
            #custom-nav-panel::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            #custom-nav-panel::-webkit-scrollbar-thumb:hover { background: ${config.themeColor}; }
			/* Sayfa Yönlendirme Butonları */
			#scroll-to-bottom-btn, #scroll-to-top-btn {
			    position: fixed !important;
			    right: calc(${widthfornavbar} - 10px) !important;
			    width: 40px !important;
			    height: 40px !important;
			    background: ${config.themeColor} !important;
				box-shadow: 0px 0px 1px 4px ${panel_colorite}, -6px 0px 8px 2px ${config.themeColor}70 !important;
			    color: white !important;
			    border-radius: 50% !important;
			    border: none !important;
			    cursor: pointer !important;
			    z-index: 1 !important;
			    display: flex !important;
			    align-items: center !important;
			    justify-content: center !important;
			    transition: all 0.3s ease !important;
			    font-size: 20px !important;
			}
			/* Yukarı Aşağı*/
			#scroll-to-bottom-btn {
			    bottom: 5px !important;
			}
			#scroll-to-top-btn {
			    top: 64px !important;
			}
			#scroll-to-bottom-btn:hover, #scroll-to-top-btn:hover {
			    background: #f0f9ff !important;
			    color: ${config.themeColor} !important;
			    border: 1px solid ${config.themeColor} !important;
			    transform: translateY(-2px) !important;
			    box-shadow: 0 6px 12px ${config.themeColor}66 !important;
			}
			#scroll-to-bottom-btn:active, #scroll-to-top-btn:active {
			    transform: scale(0.97) !important;
			    background: #e0f2fe !important;
			    box-shadow: none !important;
			}
			/* Bildirim kutusunun (Stack) ana yerleşimi */
            .dx-toast-stack {
                right: auto !important;
                left: 4px !important;
                bottom: 35px !important;
                width: 230px !important;
                max-width: 80% !important;
                display: flex !important;
                flex-direction: column-reverse !important;
                z-index: 999999 !important;
            }
            .dx-toast-wrapper {
                max-width: 100% !important;
                margin-top: 5px !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                border-radius: 8px !important;
                transform: none !important;
                transition: opacity 0.2s ease-in-out !important;
            }
            .dx-toast-message {
                font-size: 14px !important;
                line-height: 1.4 !important;
                white-space: normal !important;
				overflow: visible !important;
            }
            .dx-toast-content {
                border: 1px solid rgba(0,0,0,0.1) !important;
                backdrop-filter: none !important;
				min-width: auto !important;
				width: 100% !important;
            }
        `;
        const style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);
        function createBottomBtn() {
            if (document.getElementById('scroll-to-bottom-btn')) return;
            const btn = document.createElement('button');
            btn.id = 'scroll-to-bottom-btn';
            btn.innerHTML = '↓';
            btn.title = 'Sayfa Altına İn';
            btn.onclick = () => {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            };
            document.body.appendChild(btn);
        }
        function createTopBtn() {
            if (document.getElementById('scroll-to-top-btn')) return;
            const btn = document.createElement('button');
            btn.id = 'scroll-to-top-btn';
            btn.innerHTML = '↑';
            btn.title = 'Sayfa Üstüne Çık';
            btn.onclick = () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            document.body.appendChild(btn);
        }
        // 2. Menü Oluşturma ve Güncelleme Mantığı
        function updateMenu() {
            let panel = document.getElementById('custom-nav-panel');
            if (!panel) {
                panel = document.createElement('div');
                panel.id = 'custom-nav-panel';
                document.body.appendChild(panel);
            }
            createBottomBtn();
            createTopBtn();
            const selectors = '.accordion-header,.dx-field-item-content .dx-form-group-caption';
            //'.dx-item .dx-form-group-caption, .dx-item .dx-box-item .accordion-header, .accordion-header,.accordion-header .accordion-item, .dx-box-item .dx-form-group-caption';
            let elements = Array.from(document.querySelectorAll(selectors));
            elements = elements.filter(el => { return el.offsetParent !== null; });
            elements.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
            const currentHeadersText = elements.map(el => el.innerText.trim().split('\n')[0]).join('|');
            if (panel.dataset.lastHeaders === currentHeadersText) return;
            panel.dataset.lastHeaders = currentHeadersText;
            panel.innerHTML = '';
            let addedTexts = new Set();
            elements.forEach((el, index) => {
                if (el.closest('.osem-tab-buttons') || el.classList.contains('tab-button')) { return; }
                const text = el.innerText.replace(/\s+/g, ' ').trim().split('\n')[0];
                if (text.length < 3 || addedTexts.has(text)) return;
                addedTexts.add(text);
                if (!el.id) el.id = 'scroll-target-' + index;
                const btn = document.createElement('button');
                btn.className = 'nav-item-btn';
                btn.innerText = text;
                btn.onclick = () => {
                    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - 64;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                };
                panel.appendChild(btn);
            });
        }
        function cleanupToasts() {
            const stack = document.querySelector('.dx-toast-stack');
            if (stack && stack.children.length > 3) { stack.removeChild(stack.firstChild); }
        }
        const obssserver = new MutationObserver(() => { cleanupToasts(); });
        window.addEventListener('load', () => { setTimeout(updateMenu, 1500); });
        setInterval(updateMenu, 1000);
        setInterval(cleanupToasts, 3000);
        const startObserver = setInterval(() => {
            const target = document.querySelector('.dx-toast-stack');
            if (target) {
                cleanupToasts();
                obssserver.observe(target, { childList: true });
                clearInterval(startObserver);
                console.log("Toast Observer aktif edildi.");
            }
        }, 2000);
    }
})();
