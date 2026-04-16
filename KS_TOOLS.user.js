// ==UserScript==
// @name         KS TOOLS PANEL
// @namespace    KS_TOOLS_PANEL
// @version      1.38
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
// @connect      www.sahibinden.com
// @connect      google.com
// @connect      www.google.com
// @updateURL    https://github.com/sayginkizilkaya/Ks-Tools/raw/main/KS_TOOLS.user.js
// @downloadURL  https://github.com/sayginkizilkaya/Ks-Tools/raw/main/KS_TOOLS.user.js
// ==/UserScript==
(function () {
    'use strict';
    const url = unsafeWindow.location.href.toLowerCase();
    const hedefSiteler = /otohasar|sahibinden|sigorta|sbm|whatsapp/;
    const blockedGroups = ["yazdir", "print", "rapor", "ihbar", "dilekce", "fatura", "makbuz", "dekont", "invoice", "receipt", "barcode", "kimlik", "kart"];
    if (!hedefSiteler.test(url) || blockedGroups.some(word => url.includes(word))) { return; }
    let config = {
        bottom: '22px', right: '0px', width: '270px', collapsedWidth: '270px',
        themeColor: '#1cb2cd', Color: 'white', borderRadius: '4px', blur: '15px',
        isCollapsed: false,
        wasDragging: false,
        zIndex: 3169999
    };
    const themes = {
        'online.sbm.org': 'white', // SBM Beyaz
        'otohasar.hepiyi': '#55ac05', // Hepiyi Turuncu/Kırmızı
        'otohasar.atlas': '#005596', // Atlas Mavi
        'otohasar.mapfre': '#e00d26', // Mapfre Kırmızı
        'otohasar.akcozum2': '#eb5311', // Aksigorta Turuncu
        'otohasar.allianz': '#164481', // Allianz Lacivert
        'otohasar.anadolu': '#005ba4', // Anadolu Mavi
        'otohasar.sompo': '#e20613', // Sompo Kırmızı
        'otohasar.turkiye': '#1cb2cd', // Türkiye Sigorta Deniz Mavisi
        'otohasar.groupama': '#007a33', // Groupama Yeşil
        'otohasar.axa': '#00008f', // AXA Mavi
        'otohasar.quick': '#d1a401', // Quick Sarı (Canlı Ton)
        'otohasar.ray': '#ed1c24', // Ray Sigorta Kırmızı
        'otohasar.bereket': '#04b03d', // Bereket Yeşil
        'otohasar.hdı': '#007a33', // HDI Yeşil
        'otohasar.turknippon': '#0054a6', // Türk Nippon Mavi
        'otohasar.unico': '#e30613', // Unico Kırmızı
        'otohasar.doga': '#009640' // Doğa Yeşil
    };

    const matchedKey = Object.keys(themes).find(key => url.includes(key));
    if (matchedKey) config.themeColor = themes[matchedKey];
    // 2. STİL ENJEKSİYONU
    const injectStyles = () => {
        const style = document.createElement('style');
        style.id = 'ks-dynamic-styles';
        style.innerHTML = `
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
                    font-family: 'Inter', 'Roboto', 'Segoe UI', sans-serif;
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
                    height: 35px !important;
                    min-height: 35px !important;
                    max-height: 35px !important;
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
                    z-index: ${Number(config.zIndex) + 1000};
                    width: 230px;
                    padding: 10px 14px;
                    background: rgba(15, 15, 18, 0.75);
                    color: #f0f0f0;
                    font-family: 'Inter', system-ui, sans-serif;
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
    // 3. PANEL OLUŞTURMA VE MANTIK
    const initPanel = () => {
        const panel = document.createElement('div');
        panel.className = 'ks-draggable-panel';
        panel.id = 'ks-master-panel';
        panel.innerHTML = `<div class="ks-content" id="ks-content">Loading...</div>
		<div class="ks-header" id="ks-header" style="border-top: 1px solid #333; border-bottom: none;"><h4>PANEL</h4> <span style="font-size: 10px; opacity: 0.5;">▲</span></div>`;
        document.body.appendChild(panel);
        const content = document.getElementById('ks-content');
        const header = document.getElementById('ks-header');
        const icon = header.querySelector('span');
        const safeConfig = (typeof config !== 'undefined') ? config : { bottom: '20px', right: '20px' };
        let state = {
            isDragging: false,
            startX: 0, startY: 0,
            offsetX: 0, offsetY: 0,
            dragThreshold: 5
        };

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
    // Tooltip Mantığı
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
    const WARNING_COLOR = 'rgb(250, 250, 150)';//ff7e7e
    const SUCCESS_COLOR = '#00ff88';
    const PANEL_ID = 'ks-global-status-indicator';
    if (window.self === window.top) {
        // 1. Stil Tanımı
        if (!document.getElementById(PANEL_ID + '-style')) {
            const style = document.createElement("style");
            style.id = PANEL_ID + '-style';
            style.innerText = `
            #${PANEL_ID} {
                position: fixed !important;
                bottom: 0px !important;
                right: ${config.right} !important;
                padding: 2px 12px !important;
                background: rgba(10, 10, 10, 0.70) !important;
                backdrop-filter: blur(${config.blur}) !important;
                font-size: 11px !important;
                font-weight: 800 !important;
                font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
				z-index: ${Number(config.zIndex) + 9999} !important;
                transform-origin: bottom right !important;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                overflow: visible !important;
                border-radius: 8px !important;
                border: 2px solid ${config.themeColor} !important;
                box-shadow: 0px 0px 12px 4px ${config.themeColor}74 !important;
                animation: ks-glow-pulse 3s infinite ease-in-out !important;
            }
            #${PANEL_ID}:hover {
                transform: scale(1.1) !important;
                border-radius: 10px !important;
				color: rgba(100, 250, 100, 0.80) !important;
				box-shadow: -1px -1px 10px ${config.themeColor} !important;
            }
			@media print {
                #${PANEL_ID} {
                    position: fixed !important;
                    bottom: 0px;
				    right: 0px;
				    /*display: none !important;*/ //komple gizler
                }
            }
            @keyframes ks-glow-pulse {
                0%,100% { color: ${config.themeColor}; text-shadow: 0 0 2px ${config.themeColor}74; }
                50% { color: ${config.Color}; text-shadow: 0 0 2px ${config.themeColor}, 0 0 20px ${config.themeColor}; }
            }
        `;
            document.head.appendChild(style);
        }
        let currentIP = "IP Alınıyor...";
        let ipcolor = "orange";
        const scriptVersion = (typeof GM_info !== 'undefined') ? "v" + GM_info.script.version : "v1.0";
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => { currentIP = data.ip; ipcolor = "#00ff00"; })
            .catch(() => { currentIP = "Gizli Bağlantı"; ipcolor = "red"; });
        const injectPanel = () => {
            let kstatus = document.getElementById(PANEL_ID);
            const getSetting = (key) => GM_getValue(key, false);
            const setSetting = (key, val) => GM_setValue(key, val);
            if (!kstatus) {
                kstatus = document.createElement('div');
                kstatus.id = PANEL_ID;
                document.body.appendChild(kstatus);
                kstatus.onmouseenter = () => {
                    kstatus.setAttribute('data-hover', 'true');
                    kstatus.style.color = '#fff';
                    kstatus.innerHTML = `
                        <span style="color:${ipcolor}; font-size:15px; margin-right:5px;">●</span>
                        <span style="color:inherit;">${currentIP}</span>
                        <span style="opacity:0.3; margin:0 8px;">|</span>
                        <span id="ks-version-link" style="
                            cursor: pointer;
                            padding: 2px 6px;
                            border-radius: ${config.borderRadius};
                            transition: all 0.3s ease;
                            background: rgba(255, 255, 255, 0);
                            color: inherit;
                            font-family: inherit;
                        " onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'"
                          onmouseout="this.style.background='rgba(255, 255, 255, 0)'">
                            ${scriptVersion}
                        </span>
                        <span style="opacity:0.3; margin:0 8px;">|</span>
                        <span id="ks-settings-btn" style="cursor:pointer; font-size:14px; filter: grayscale(1);">⚙️</span>
                    `;
                    document.getElementById('ks-version-link').onclick = (e) => {
                        e.stopPropagation();
                        window.open(GM_info.script.updateURL, '_blank');
                    };
                    document.getElementById('ks-settings-btn').onclick = (e) => {
                        e.stopPropagation();
                        openSettingsModal();
                    };
                };
                kstatus.onmouseleave = () => {
                    kstatus.removeAttribute('data-hover');
                    kstatus.innerHTML = `KS TOOLS`;
                };
            }
            const openSettingsModal = () => {
                if (document.getElementById('ks-modal-overlay')) return;
                const overlay = document.createElement('div');
                overlay.id = 'ks-modal-overlay';
                Object.assign(overlay.style, {
                    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.15)', zIndex: '10000000', backdropFilter: 'blur(15px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                });
                const modal = document.createElement('div');
                Object.assign(modal.style, {
                    backgroundColor: '#2c2c2c', padding: '10px', borderRadius: config.borderRadius,
                    width: '900px', border: `1px solid ${config.themeColor}44`, color: '#fff',
                    boxShadow: '0 50px 100px rgba(0,0,0,1)', fontFamily: "'Inter', sans-serif",
                    position: 'relative'
                });
                const sections = [
                    {
                        title: 'OTOANALİZ DOSYA PANELİ', items: [
                            { id: 'ks-opt-hlt', key: 'KS_PANEL_hlt', label: 'Girilmeyen Hücre Boyama' },
                            { id: 'ks-opt-pnl', key: 'KS_PANEL', label: 'Dosya Kontrol Paneli' },
                            { id: 'ks-opt-pol', key: 'KS_PANEL_pol', label: 'Poliçe Kontrol', sub: true },
                            { id: 'ks-opt-sgs', key: 'KS_PANEL_sgs', label: 'Sigorta Şekli', sub: true },
                            { id: 'ks-opt-rc', key: 'KS_PANEL_rc', label: 'Rücu Takibi', sub: true },
                            { id: 'ks-opt-pert', key: 'KS_PANEL_pert', label: 'Pert Kontrolü', sub: true },
                            { id: 'ks-opt-hsr', key: 'KS_PANEL_hsr', label: 'Hasar Şekli', sub: true },
                            { id: 'ks-opt-srtp', key: 'KS_PANEL_srtp', label: 'Servis Tipi', sub: true },
                            { id: 'ks-opt-srad', key: 'KS_PANEL_srad', label: 'Servis Adı', sub: true },
                            { id: 'ks-opt-tra', key: 'KS_PANEL_tra', label: 'Tramer', sub: true },
                            { id: 'ks-opt-sad', key: 'KS_PANEL_sad', label: 'Sigortalı adı', sub: true },
                            { id: 'ks-opt-aad', key: 'KS_PANEL_aad', label: 'Araç adı', sub: true },
                            { id: 'ks-opt-mull', key: 'KS_PANEL_mull', label: 'Muallak', sub: true },
                            { id: 'ks-opt-ryc', key: 'KS_PANEL_ryc', label: 'Rahiç', sub: true },
                            { id: 'ks-opt-rycorn', key: 'KS_PANEL_rycorn', label: 'Rahiç - Pert oran', sub: true },
                            { id: 'ks-opt-pys', key: 'KS_PANEL_pys', label: 'Piyasa Kontrol', sub: true },
                            { id: 'ks-opt-not', key: 'KS_PANEL_not', label: 'Notlar', sub: true }
                        ]
                    },
                    {
                        title: 'OTOANALİZ EK PANELLER', items: [
                            { id: 'ks-opt-manu', key: 'KS_MANU', label: 'Manuel Giriş Paneli' },
                            { id: 'ks-opt-reff', key: 'KS_REF', label: 'Referans Panelleri' },
                            { id: 'ks-opt-donn', key: 'KS_DNM', label: 'Donanım Girme Paneli' },
                            { id: 'ks-opt-rsm', key: 'KS_IMG', label: 'Resim Yükleme Paneli' }
                        ]
                    },
                    {
                        title: 'EK MODÜLLER', items: [
                            { id: 'ks-opt-trs', key: 'KS_TRS', label: 'Türkiye Sigorta Modülü' },
                            { id: 'ks-opt-shb', key: 'KS_SAHIB', label: 'Sahibinden Panel' },
                            { id: 'ks-opt-sbm', key: 'KS_SBM', label: 'SBM Panel' },
                            { id: 'ks-opt-wspp', key: 'KS_WP', label: 'WhatsApp Hızlı İndirme' },
                            { id: 'ks-opt-bild', key: 'KS_NTF', label: 'Otohasar Bildirim Engelleme (3 ve sonrası)' }
                        ]
                    }
                ];
                modal.innerHTML = `
                    <style>
                        .ks-wrap { background: #2c2c2c; display: flex; flex-direction: column; gap: 10px; }
                        .ks-head { background: #404040; padding: 8px; border-radius: ${config.borderRadius}; font-size: 16px; font-weight: 900; color: ${config.themeColor}; text-align: center; letter-spacing: 4px; display: flex; justify-content: space-between; align-items: center; }
                        .ks-root-opt { background: #363636; padding: 6px 15px; border-radius: 8px; border: 1px solid ${config.themeColor}44; display: flex; align-items: center; gap: 10px; cursor: pointer; }
                        .ks-body { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
                        .ks-section { background: #464646; border: 1px solid #1a1a1a; border-radius: 12px; padding: 10px; height: 500px; overflow-y: auto; display: flex; flex-direction: column; }
                        .ks-sec-title { font-size: 9px; font-weight: 800; color: #fff; margin-bottom: 4px; text-transform: uppercase; border-bottom: 1px solid ${config.themeColor}; border-radius: 4px; padding-left: 8px; }
                        .ks-items-container { flex-grow: 1; overflow-y: auto; }
                        .ks-row { background: ${config.themeColor}15; display: flex; align-items: center; justify-content: space-between; padding: 5px 10px; margin-bottom: 3px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
                        .ks-row:hover { filter: brightness(1.3); background: ${config.themeColor}40; }
                        .ks-row.sub-row { margin-left: 15px; background: rgba(0,0,0,0.1); border-left: 1px dashed ${config.themeColor}88; }
                        .ks-row.sub-row:hover { filter: brightness(1.3); background: ${config.themeColor}40; }
                        .ks-txt { font-size: 10px; font-weight: 500; color: #dfdfdf; white-space: nowrap; }
                        .ks-tgl { position: relative; width: 26px; height: 13px; flex-shrink: 0; }
                        .ks-tgl input { opacity: 0; width: 0; height: 0; }
                        .ks-sld { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #b2b2b2; transition: .3s; border-radius: 10px; }
                        .ks-sld:before { position: absolute; content: ""; height: 9px; width: 9px; left: 2px; bottom: 2px; background: #fff; transition: .3s; border-radius: 50%; }
                        .ks-tgl input:checked + .ks-sld { background: ${config.themeColor}; }
                        .ks-tgl input:checked + .ks-sld:before { transform: translateX(13px); }
                        .ks-bulk-ctrl { display: flex; gap: 5px; margin-top: 8px; padding-top: 5px; border-top: 1px solid #555; }
                        .ks-bulk-btn { flex: 1; background: #333; color: #bbb; border: 1px solid #555; font-size: 8px; padding: 4px; cursor: pointer; border-radius: 4px; font-weight: 700; }
                        .ks-bulk-btn:hover { background: #444; color: #fff; }
                        .ks-bottom { display: flex !important; align-items: center !important; justify-content: flex-start !important; width: 100% !important; white-space: nowrap !important;  gap: 5px !important; }
						.ks-theme-select { background-color: #000 !important; color: #fff !important; border: 1px solid #333 !important; padding: 0 4px !important; border-radius: 4px !important; font-size: 11px !important; outline: none !important; cursor: pointer !important; height: 22px !important; transition: 0.3s !important; appearance: auto !important; margin-right: auto !important; }
                        .ks-theme-select:hover { border-color: #555 !important; background-color: #050505 !important; }
						.ks-theme-select option { background: #000 !important; color: #fff !important; }
						.ks-save { background:  ${config.themeColor} !important; color: #fff !important; border: none !important; padding: 0 15px !important; border-radius: 4px !important; font-size: 11px !important; font-weight: 800 !important; cursor: pointer !important; height: 22px !important; transition: all 0.2s ease !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; }
                        .ks-save:hover { filter: brightness(1.1) !important; transform: translateY(-1px) !important; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important; }
                        .ks-save:active { transform: translateY(1px) !important; filter: brightness(0.8) !important; }
                        .ks-section::-webkit-scrollbar { width: 4px; }
                        .ks-section::-webkit-scrollbar-thumb { background: #b5b5b5; border-radius: 10px; }
                    </style>
                    <div class="ks-wrap">
                        <div class="ks-head">
                            <span>KS TOOLS CONTROL CENTER</span>
                            <div class="ks-root-opt" onclick="document.getElementById('ks-opt-1').click()">
                                <span class="ks-txt" style="font-weight:800; color:#fff">SİSTEM DURUMU</span>
                                <label class="ks-tgl" onclick="event.stopPropagation()">
                                    <input type="checkbox" id="ks-opt-1" ${getSetting('KS_SYS') ? 'checked' : ''}>
                                    <span class="ks-sld"></span>
                                </label>
                            </div>
                        </div>
                        <div class="ks-body">
                            ${sections.map((sec, idx) => `
                                <div class="ks-section">
                                    <div class="ks-sec-title">${sec.title}</div>
                                    <div class="ks-items-container">
                                        ${sec.items.map(opt => `
                                            <div class="ks-row ${opt.sub ? 'sub-row' : ''}" onclick="document.getElementById('${opt.id}').click()">
                                                <span class="ks-txt">${opt.label}</span>
                                                <label class="ks-tgl" onclick="event.stopPropagation()">
                                                    <input type="checkbox" id="${opt.id}" class="ks-sec-check-${idx}" data-key="${opt.key}" ${getSetting(opt.key) ? 'checked' : ''}>
                                                    <span class="ks-sld"></span>
                                                </label>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div class="ks-bulk-ctrl">
                                        <button class="ks-bulk-btn" onclick="document.querySelectorAll('.ks-sec-check-${idx}').forEach(i => { if(!i.checked) i.click() })">HEPSİNİ AÇ</button>
                                        <button class="ks-bulk-btn" onclick="document.querySelectorAll('.ks-sec-check-${idx}').forEach(i => { if(i.checked) i.click() })">HEPSİNİ KAPAT</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="ks-bottom">
							<span>Tema Seçimi (Aktif Değil) -</span>
                            <select id="ks-theme-picker" class="ks-theme-select">
                                <option value="#3498db" ${config.themeColor === '#005596' ? 'selected' : ''}>Mavi</option>
                                <option value="#e74c3c" ${config.themeColor === '#e00d26' ? 'selected' : ''}>Kırmızı</option>
                                <option value="#2ecc71" ${config.themeColor === '#55ac05' ? 'selected' : ''}>Yeşil</option>
                                <option value="#f1c40f" ${config.themeColor === '#d1a401' ? 'selected' : ''}>Sarı</option>
                                <option value="#9b59b6" ${config.themeColor === '#9b59b6' ? 'selected' : ''}>Mor</option>
                            </select>
                            <button id="ks-save-final" class="ks-save">AYARLARI KAYDET</button>
                        </div>
                    </div>`;
                overlay.appendChild(modal);
                document.body.appendChild(overlay);
                document.getElementById('ks-opt-1').onchange = (e) => setSetting('KS_SYS', e.target.checked);
                sections.forEach(s => s.items.forEach(opt => {
                    document.getElementById(opt.id).onchange = (e) => setSetting(opt.key, e.target.checked);
                }));
                document.getElementById('ks-theme-picker').onchange = (e) => setSetting('KS_THEME', e.target.value);
                document.getElementById('ks-save-final').onclick = () => {
                    overlay.remove();
                    if (confirm("Değişikliklerin etkili olması için sayfa yenilensin mi?")) window.location.reload();
                };
            };
            if (!kstatus.hasAttribute('data-hover')) kstatus.innerHTML = `KS TOOLS`;
        };
        setInterval(injectPanel, 2000);
        injectPanel();
    }
    const KS_SYSTEM = GM_getValue('KS_SYS', true);
    const ANALIZPANEL = GM_getValue('KS_PANEL', true);
    const ANALIZPANEL_hlt = GM_getValue('KS_PANEL_hlt', true);
    const ANALIZPANEL_pol = GM_getValue('KS_PANEL_pol', true);
    const ANALIZPANEL_sgs = GM_getValue('KS_PANEL_sgs', true);
    const ANALIZPANEL_rc = GM_getValue('KS_PANEL_rc', true);
    const ANALIZPANEL_pert = GM_getValue('KS_PANEL_pert', true);
    const ANALIZPANEL_hsr = GM_getValue('KS_PANEL_hsr', true);
    const ANALIZPANEL_srtp = GM_getValue('KS_PANEL_srtp', true);
    const ANALIZPANEL_srad = GM_getValue('KS_PANEL_srad', true);
    const ANALIZPANEL_tra = GM_getValue('KS_PANEL_tra', true);
    const ANALIZPANEL_sad = GM_getValue('KS_PANEL_sad', true);
    const ANALIZPANEL_aad = GM_getValue('KS_PANEL_aad', true);
    const ANALIZPANEL_mull = GM_getValue('KS_PANEL_mull', true);
    const ANALIZPANEL_ryc = GM_getValue('KS_PANEL_ryc', true);
    const ANALIZPANEL_rycorn = GM_getValue('KS_PANEL_rycorn', true);
    const ANALIZPANEL_pys = GM_getValue('KS_PANEL_pys', true);
    const ANALIZPANEL_not = GM_getValue('KS_PANEL_not', true);
    const MANUEL = GM_getValue('KS_MANU', true);
    const REFERANS = GM_getValue('KS_REF', true);
    const DONANIM = GM_getValue('KS_DNM', true);
    const RESIM = GM_getValue('KS_IMG', true);
    const TRSIGORTA = GM_getValue('KS_TRS', true);
    const SAHIBINDEN = GM_getValue('KS_SAHIB', true);
    const SBM = GM_getValue('KS_SBM', true);
    const WHATSAPP = GM_getValue('KS_WP', true);
    const BILDIRIM = GM_getValue('KS_NTF', true);
    const unlockAllElements = () => {
        const selectors = '[disabled], .disabled, [readonly], [aria-disabled="true"]';
        document.querySelectorAll(selectors).forEach(el => {
            el.disabled = false;
            el.readOnly = false;
            el.removeAttribute('disabled');
            el.removeAttribute('readonly');
            el.removeAttribute('aria-disabled');
            el.classList.remove('disabled');
            el.style.setProperty('pointer-events', 'auto', 'important');
            el.style.setProperty('opacity', '1', 'important');
        });
    };
    // Hızlı ve Panel takipli Ön giriş
    if (KS_SYSTEM && ANALIZPANEL && location.href.includes("otohasar") && location.href.includes("eks_hasar.php")) {
        /* ===== 1. PANEL VE STİL ===== */
        injectStyles(); initPanel();
        const panel = document.getElementById('ks-master-panel');
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Giriş Kontrol Paneli";
            panelContent.innerHTML = `
            <div id="panelContent" style ="color:#ffffff; text-align:center;">⏳ Yükleniyor...</div>
            <hr style="border:0; border-top:1px solid #444; margin:2px 0;">
            <div class="ks-grid-container" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; width: 100%;">
                <div class="ks-tooltip-container" onmouseover="handleHover(this)">
                    <button id="autoSelectBtn" class="ks-btn" style="width:100%; height: 100%;">⚡ Ön Giriş</button>
                    <div class="ks-tooltip-box">
                        <strong>⚡ Otomatik Giriş (F4)</strong><br>
                        Kaza ihbar türü, Eksper, Alkol durumu, Devir-Satış, Eksik/Aşkın Sigorta, Muafiyet, Taşınan Yük, Ehliyet sınıfı ve Ekspertiz tarihi gibi seçimleri doğrulamayı unutmayın.
                    </div>
                </div>
				<div class="ks-tooltip-container" onmouseover="handleHover(this)">
                <button id="btnKaydetYeni" class="ks-btn-danger" style="width:100%; height: 100%;" onclick="c('kaydet();')">💾 KAYDET</button>
                    <div class="ks-tooltip-box">
                        <strong>💾 Kaydet (F2)</strong><br>
                    </div>
                </div>
                <div class="ks-tooltip-container" onmouseover="handleHover(this)">
                    <button id="unlockSelectBtn" class="ks-btn" style="width:100%; height: 100%;">🔓 Kilit Aç</button>
                    <div class="ks-tooltip-box">
                        <strong>⚠️ Kritik İşlem</strong><br>
                        Site üzerindeki tüm etkileşimleri (buton, liste, kutu) aktifleştirir. Tehlikeli bir işlemdir, tavsiye edilmez.
                    </div>
                </div>
            </div>
			<div id="pys-section">
				<div>
				<hr style="border:0; border-top:1px solid #444; margin:2px 0;">
					<div id="shb-res-box">Piyasa kontrolü için alttaki butonlara basın</div>
            	    <div style="display: flex; flex-direction: row; width: 100%; gap: 4%; justify-content: space-between;">
            	        <div class="ks-tooltip-container" onmouseover="handleHover(this)" style="width: 48%;">
            	            <button id="btn-auto-analiz" class="ks-btn" style="width: 100%;">Piyasa hesapla</button>
            	            <div class="ks-tooltip-box">
            	                Piyasayı otomatik olarak panel arayüzü üzerinde gösterir.
            	            </div>
            	        </div>
            	        <div class="ks-tooltip-container" onmouseover="handleHover(this)" style="width: 48%;">
            	            <button id="btn-auto-look" class="ks-btn" style="width: 100%;">Siteye yönel</button>
            	            <div class="ks-tooltip-box" style="transform: translateX(-50%); transition: opacity 0.5s ease, transform 0.5s ease, visibility 0.5s;">
            	                Site üzerindeki piyasa verilerine hızlıca odaklanır.
            	            </div>
            	        </div>
            	    </div>
            	</div>
			</div>
			<div id="not-section">
            	<div id="custom-page-notes-container" style="width: 100%; dashed #444; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
				<hr style="border:0; border-top:1px solid #444; margin:4px 0;">
            	    <div style="color: #bbb; font-size: 11px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
            	        <span>NOT</span>
            	        <span id="note-status" style="font-size: 10px; opacity: 0.6;">Otomatik Kaydediliyor...</span>
            	    </div>
            	    <textarea id="page-note-input" style="width: 100%; height: 40px; background: #252525; color: black; border: 1px solid #333; border-radius: ${config.borderRadius}; padding: 2px; font-size: 12px; line-height: 1.2; resize: vertical; outline: none; box-sizing: border-box; display: block;" placeholder="Buraya notunu bırakabilirsin..."></textarea>
            	</div>
			</div>
            `;
            document.addEventListener('keydown', (e) => {
                if (e.key === 'F2') {
                    e.preventDefault();
                    const btn = document.getElementById('btnKaydetYeni') || document.getElementsByName('btnKaydetYeni')[0];
                    if (btn) { btn.click(); }
                }
                if (e.key === 'F4') {
                    e.preventDefault();
                    const btn = document.getElementById('autoSelectBtn') || document.getElementsByName('autoSelectBtn')[0];
                    if (btn) { btn.click(); }
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
                const watchFields = ['EKSPERTIZ_TARIHI_YIL', 'EKSPERTIZ_TALEP_TARIHI_YIL', 'HAS_ARAC_SAHIBI', 'HAS_TRAFIK_TARIHI_YIL',
                    'TRAMER_IHBAR_NO', 'SERVIS_ADI', 'SURUCU_YIL', 'EHLIYET_NO', 'EHLIYET_TARIHI_YIL', 'MILLI_R_NO', 'EKSPERTIZ_SURESI', 'EHLIYET_SINIFI', 'ONARIM_SURESI'];
                const selectFields = ['SB_ARAC_KULLANIM_TURU', 'HASAR_ILCESI', 'KANAAT', 'EHLIYET_YERI', 'EHLIYET_YERI_ILCE', 'KAZA_SEKLI', 'DOLU_HASARI', 'FAR_AYNA_HASARI', 'KUSURLU', 'HAS_MODEL_YILI', 'HASAR_SEKLI', 'KAZA_IHBAR_TURU', 'UZAKTAN_EKSPERTIZ'];
                const modelVal = getValue('HAS_MODEL_ADI').replace(/[()\s]/g, ''); setBg('HAS_MODEL_ADI', modelVal === '');
                setBg('TAHMINI_HASAR', parseNum('TAHMINI_HASAR') < 1000);
                setBg('HAS_KM', parseNum('HAS_KM') < 1);
                setBg('HAS_PIYASA', parseNum('HAS_PIYASA') < 1000);
                //setBg('HASAR_SEKLI', getValue('HASAR_SEKLI') === "-1");
                watchFields.forEach(id => setBg(id, getValue(id).trim() === ''));
                selectFields.forEach(id => setBg(id, getValue(id) === '-1'));
            }
            /* ===== 4. PANEL GÜNCELLEME ===== */
            function updatePanel() {
                let html = '<table style="width:100%; border-collapse:collapse; font-size:13px; color:white;">';
                if (ANALIZPANEL_pol) {
                    const hasar = getDate('HASAR_TARIHI');
                    const bas = getDate('SB_POLICE_BAS');
                    const bitis = getDate('SB_POLICE_BITIS');
                    if (hasar && bas && bitis) {
                        hasar.setHours(0, 0, 0, 0);
                        bas.setHours(0, 0, 0, 0);
                        bitis.setHours(0, 0, 0, 0);
                        html += `<tr><td colspan="2" style="text-align:center; padding:10px;"><div class="ks-tooltip-container" onmouseover="handleHover(this)">`;
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
                let dynamicLabel = 'Sigortalı/Kaskolu Araç';
                if (sigortaElement) {
                    const selectedText = sigortaElement.options[sigortaElement.selectedIndex]?.text || "Bilinmiyor";
                    const upText = selectedText.toUpperCase();
                    // Varsayılan (Diğer)
                    let sigortaColor = "#ff9500";
                    let sigortaBg = "rgba(255, 149, 0, 0.15)";
                    if (upText.includes("TRAFİK")) {
                        sigortaColor = "#00d4ff"; // Canlı Mavi
                        sigortaBg = "rgba(0, 212, 255, 0.15)";
                        dynamicLabel = 'Sigortalı Araç :';
                    } else if (upText.includes("KASKO")) {
                        sigortaColor = "#a29bfe"; // Yumuşak Mor
                        sigortaBg = "rgba(162, 155, 254, 0.15)";
                        dynamicLabel = 'Kaskolu Araç :';
                    }

                    // Badge (Etiket) Tasarımı
                    const sigortaBadge = `
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

                    if (ANALIZPANEL_sgs) {
                        html += `
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding:4px 0;">Sigorta Şekli:</td>
                                <td style="text-align:right; padding:4px 0;">
                                    ${sigortaBadge}
                                </td>
                            </tr>`;
                    }
                }
                if (ANALIZPANEL_rc) {
                    // --- 1. RÜCU DURUMU ---
                    const rucuVar = document.getElementById('RUCU1')?.checked;
                    const rucuYok = document.getElementById('RUCU0')?.checked;
                    let rucuStatus = "";
                    if (rucuVar) { rucuStatus = `<span style="background:#e74c3c22; color:#e74c3c; border:1px solid #e74c3c44; padding:1px 6px; border-radius: ${config.borderRadius}; font-weight:bold; font-size:10px;">VAR 🔴</span>`; }
                    else if (rucuYok) { rucuStatus = `<span style="background:#2ecc7122; color:#2ecc71; border:1px solid #2ecc7144; padding:1px 6px; border-radius: ${config.borderRadius}; font-weight:bold; font-size:10px;">YOK 🟢</span>`; }
                    else { rucuStatus = `<span style="background:#ff950022; color:#ff9500; border:1px solid #ff950044; padding:1px 6px; border-radius: ${config.borderRadius}; font-weight:bold; font-size:10px;">BELİRSİZ 🔘</span>`; }

                    html += `
                        <tr style="border-bottom:1px solid #333;">
                            <td style="white-space:nowrap; width:100px;">Rücu:</td>
                            <td style="text-align:right; padding:4px 0;">${rucuStatus}</td>
                        </tr>`;
                }
                if (ANALIZPANEL_pert) {
                    // --- 2. PERT DURUMU ---
                    const pertVar = document.getElementById('pert')?.checked || false;
                    let pertStatus = "";
                    if (pertVar) { pertStatus = `<span style="background:#e74c3c22; color:#e74c3c; border:1px solid #e74c3c44; padding:1px 6px; border-radius: ${config.borderRadius}; font-weight:bold; font-size:10px;">VAR 🔴</span>`; }
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
                if (ANALIZPANEL_hsr) {
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
                            case "4": ihbarColor = "#e74c3c"; break; // Trafik
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
                        if (["1", "5", "18"].includes(selectedValue)) hasarColor = "#e74c3c"; // Hırsızlık: Kırmızı
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
                if (ANALIZPANEL_srtp) {
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
                // 1. Fonksiyonlar ve Değişken Tanımlamaları
                const formatTramer = (str) => {
                    if (!str || str.toString().trim() === "") return '-';
                    return str.toString().replace(/\s/g, '').replace(/(.{3})/g, '$1 ').trim();
                };
                const formatText = (str, limit = 25) => {
                    if (!str) return '-';
                    let cleanStr = str.replace(/^\(\s*.*?\s*\)\s*/, '');
                    return cleanStr.length > limit ? cleanStr.substring(0, limit) + '...' : cleanStr;
                };
                const tahminiHasar = parseNum('TAHMINI_HASAR');
                const hasPiyasa = parseNum('HAS_PIYASA');
                const ssTahmini = parseNum('SS_TAHMINI_HASAR');
                const fields = [
                    { label: 'Servis :', id: "SERVIS_ADI", condition: ANALIZPANEL_srad },
                    { label: 'Tramer :', id: "TRAMER_IHBAR_NO", condition: ANALIZPANEL_tra },
                    { label: 'Sigortalı :', id: "HAS_ARAC_SAHIBI", condition: ANALIZPANEL_sad },
                    { label: dynamicLabel, id: "HAS_MODEL_ADI", condition: ANALIZPANEL_aad }
                ];

                fields.forEach(f => {
                    // Eğer ilgili ayar (condition) true ise satırı oluştur
                    if (f.condition) {
                        let element = document.getElementById(f.id) || document.getElementsByName(f.id)[0];
                        let raw = "";
                        if (element) {
                            raw = (element.value !== undefined ? element.value : element.textContent || "").trim();
                        }
                        let status = raw !== '' ? '✅' : '❌';
                        let valStr = '-';
                        let color = "white";
                        if (raw !== '') {
                            if (f.id === 'HAS_PIYASA') {
                                valStr = hasPiyasa.toLocaleString('tr-TR');
                                status = (hasPiyasa < 1000) ? '⚠️' : '✅';
                                color = (hasPiyasa < 1000) ? '#ff9500' : '#00d4ff';
                            } else if (f.id === 'TRAMER_IHBAR_NO') {
                                valStr = formatTramer(raw);
                            } else if (['HAS_MODEL_ADI', 'SERVIS_ADI', 'HAS_ARAC_SAHIBI'].includes(f.id)) {
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
                html += `<tr><td colspan="2"><hr style="border:0; border-top:1px solid #444; margin:2px 0;"></td></tr>`;
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
                // --- 2. HTML OLUŞTURMA ---
                html += `<style>@keyframes ksBlink { 0%{opacity:1} 50%{opacity:0.3} 100%{opacity:1} }</style>`;
                html += `<table style="width:100%; border-collapse:collapse; font-size:12px; color:white; line-height:1.2;">`;
                if (ANALIZPANEL_mull) {
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
                        <td style="width:100px; padding:4px 0;">Piyasa/Rayiç:</td>
                        <td style="text-align:right; padding:4px 0;">
                            <b style="color:#00d4ff">${hasPiyasa.toLocaleString('tr-TR')} ₺</b>
                        </td>
                    </tr>`;
                }
                if (ANALIZPANEL_rycorn) {
                    html += `
                        <tr>
                            <td style="width:100px; padding:4px 0;">Eksper Muallak:</td>
                            <td style="text-align:right; padding:4px 0;">
                                <b style="color:${durumColor}">${tahminiHasar.toLocaleString()} ₺</b>
                                ${getStatusBadge(durumMetni, durumColor)}
                            </td>
                        </tr>`;
                    html += `
                        <tr>
                            <td colspan="2" style="padding:4px 0;">
                                <div class="ks-tooltip-container" onmouseover="handleHover(this)" style="width:100%;">
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
                    // Model ve Yıl Alımı
                    const mInput = document.getElementById('HAS_MODEL_ADI') || document.getElementById('MODEL_ADI');
                    const yInput = document.getElementById('HAS_MODEL_YILI') || document.getElementById('MODEL_YILI');
                    let m = mInput ? (mInput.value || mInput.innerText || "").trim() : "";
                    let yRaw = yInput ? (yInput.value || yInput.innerText || "").trim() : "";
                    m = m.replace(/\d{2}\/\d{2}\/\d{4}.*/g, '').replace(/\(\s*\d+\s*\)/g, '').replace(/\s+/g, ' ').trim();
                    const y = extractYear(yRaw);
                    // KM Alımı
                    const kInput = document.getElementById('HAS_KM');
                    let kStr = kInput ? (kInput.value || kInput.innerText || "0") : "0";
                    const k = parseInt(kStr.replace(/\D/g, '')) || 0;
                    if (!m) return null;
                    return {
                        model: m,
                        year: y,
                        kmMin: k >= 100 ? Math.floor(k * 0.85) : null,
                        kmMax: k >= 100 ? Math.ceil(k * 1.15) : null
                    };
                }

                async function startAutomatedSearch(isAnalyze) {
                    const resBox = document.getElementById('shb-res-box');
                    const data = buildTargetUrl();
                    if (!data) { resBox.innerHTML = "❌ Veri hatası!"; return; }
                    resBox.innerHTML = `<span style="color:#fff; font-size:11px; opacity:0.7;">🔍 Filtreleniyor...</span>`;
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
                            if (!target) { resBox.innerHTML = "⚠️ Kategori bulunamadı."; return; }
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
                            if (data.kmMin) {
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
                    .shb-link { color: #cfd8dc !important; text-decoration: underline !important; transition: all 0.2s !important; }
                    .shb-link:hover { color: #ffffff !important; opacity: 0.8; }
                    .shb-link:active { color: #ffeb3b !important; }
                </style>`;
                                html += `<div style="background: rgba(10,10,10,0.05); border: 1px solid #444; border-radius: 6px; padding: 5px; color: white; width: 100%; box-sizing: border-box;">`;
                                html += `<div style="display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid #555; padding-bottom:3px; font-size:11px;"><b>Ort: ${avg.toLocaleString('tr-TR')} TL</b> <span style="color:#00ff88;">${dataList.length} İlan</span></div>`;
                                html += `<table style="width:100%; border-collapse:collapse; font-size:10px;">`;
                                displayList.forEach(item => {
                                    html += `<tr style="border-bottom: 1px solid #222;">
                        <td style="padding:3px 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                            <a href="${item.link}" target="_blank" class="shb-link" style="display: inline-block !important;">${item.title}</a>
                        </td>
                        <td style="color: white; width:30px; text-align:center;">${item.year}</td>
                        <td style="color: white; width:50px; text-align:center;">${item.km}</td>
                        <td style="color:${item.color}; width:80px; text-align:right; font-weight:bold;">${item.price.toLocaleString('tr-TR')}</td>
                    </tr>`;
                                });
                                html += `</table></div>`;
                                resBox.innerHTML = html;
                            } else {
                                resBox.innerHTML = `<a href="${url}" target="_blank" style="color:#ffcc00; font-size:10px;">Sonuç Bulunamadı (Kriterleri Genişlet)</a>`;
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
                console.log('✅ Otomatik seçimler tamamlandı.');
            });
            /* ===== 5. OTOMATİK SEÇİM BUTONU ===== */
            document.getElementById('unlockSelectBtn').addEventListener('click', unlockAllElements);
            if (ANALIZPANEL_hlt) setInterval(highlightFields, 1500);
            setInterval(updatePanel, 1500);
        }
    }
    if (KS_SYSTEM && ANALIZPANEL && location.href.includes("otohasar") && location.href.includes("eks_hasar_magdur.php")) {
        /* ===== 1. PANEL VE STİL ===== */
        config.bottom = "22px";
        config.width = "270px";
        config.collapsedWidth = "270px";
        //injectStyles();
        //initPanel();
        // Globalde veya üst kapsamda oluşturduğumuz panel elementini seçiyoruz
        const panel = document.getElementById('ks-master-panel');
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            // Başlığı güncellemek isterseniz:
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Giriş Kontrol Paneli";
            // İçerik kısmını yeni HTML ile dolduruyoruz
            panelContent.innerHTML = `
            <div id="panelContent" style ="color:#ffffff; text-align:center;"></div>
            <div style ="text-align:center; margin-bottom:8px; font-size:11px;"></div>
            <div class="ks-grid-container" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; width: 100%;">
                <div class="ks-tooltip-container" onmouseover="handleHover(this)">
                    <button id="autoSelectBtn" class="ks-btn" style="width:100%; height: 100%;">⚡ Ön Giriş</button>
                    <div class="ks-tooltip-box">
                        <strong>⚠️ Başlık</strong><br>
                        Açıklama düzenlenecek
                    </div>
                </div>
                <button id="btnKaydetYeni" class="ks-btn-danger" style="width:100%; height: 100%;" onclick="javascript:sb_ederken();">💾 KAYDET</button>
                <div class="ks-tooltip-container" onmouseover="handleHover(this)">
                    <button id="unlockSelectBtn" class="ks-btn" style="width:100%; height: 100%;">🔓 Kilit Aç</button>
                    <div class="ks-tooltip-box">
                        <strong>⚠️ Kritik İşlem</strong><br>
                        Site üzerindeki tüm etkileşimleri (buton, liste, kutu) aktifleştirir. Tehlikeli bir işlemdir, tavsiye edilmez.
                    </div>
                </div>
            </div>
            <div>
                <hr style="border:0; border-top:1px solid #444; margin:2px 0;">
                <div id="shb-res-box">Piyasa kontrolü bekleniyor...</div>
                <div style="display: flex; flex-direction: row; width: 100%; gap: 4%; justify-content: space-between;">
                    <div class="ks-tooltip-container" onmouseover="handleHover(this)" style="width: 48%;">
                        <button id="btn-auto-analiz" class="ks-btn" style="width: 100%;">Piyasa hesapla</button>
                        <div class="ks-tooltip-box">
                            Piyasayı otomatik olarak panel arayüzü üzerinde gösterir.
                        </div>
                    </div>
                    <div class="ks-tooltip-container" onmouseover="handleHover(this)" style="width: 48%;">
                        <button id="btn-auto-look" class="ks-btn" style="width: 100%;">Siteye yönel</button>
                        <div class="ks-tooltip-box" style="transform: translateX(-50%); transition: opacity 0.5s ease, transform 0.5s ease, visibility 0.5s;">
                            Site üzerindeki piyasa verilerine hızlıca odaklanır.
                        </div>
                    </div>
                </div>
            </div>
            <div id="custom-page-notes-container" style="width: 100%; dashed #444; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <div style="color: #bbb; font-size: 11px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
                    <span>NOT</span>
                    <span id="note-status" style="font-size: 10px; opacity: 0.6;">Otomatik Kaydediliyor...</span>
                </div>
                <textarea id="page-note-input" style="width: 100%; height: 40px; background: #252525; color: #efefef; border: 1px solid #333; border-radius: 4px; padding: 8px; font-size: 13px; line-height: 1.4; resize: vertical; outline: none; box-sizing: border-box; display: block;"
                    placeholder="Buraya notunu bırakabilirsin..."></textarea>
            </div>
            `;

            /* ===== 2. YARDIMCI FONKSİYONLAR ===== */
            const $ = (id) => document.getElementById(id) || document.querySelector(`[name="${id}"]`);
            const getValue = (id) => ($(id)?.value || $(id)?.textContent || '').trim();
            const parseNum = (id) => {
                const val = getValue(id).replace(/,/g, '');
                return val === '' ? 0 : Number(val);
            };
            const getDate = (prefix) => {
                const [g, a, y] = [getValue(prefix + '_GUN'), getValue(prefix + '_AY'), getValue(prefix + '_YIL')];
                if (!g || !a || !y) return null; return new Date(y, a - 1, g);
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
                if (savedNote) {
                    textarea.value = savedNote;
                }

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
                kaydetButonu.addEventListener('click', () => {
                    savePageNote();
                });
            }
            /* ===== 3. KONTROL VE HIGHLIGHT ===== */
            function highlightFields() {
                // 1. Tahmini Hasar değerini güvenli bir şekilde alalım
                const tahminiHasarEl = document.getElementById('TAHMINI_HASAR') || document.getElementsByName('TAHMINI_HASAR')[0];

                // Değeri sayıya çevirme: Nokta ve virgülleri temizleyip float'a çeviriyoruz
                let rawHasar = tahminiHasarEl ? tahminiHasarEl.value : "0";
                let cleanHasar = parseFloat(rawHasar.replace(/\./g, '').replace(',', '.')) || 0;

                // 2. Kontrol edilecek alan listeleri
                const watchFields = ['SURUCU_EHLIYET_NO', 'EHLIYET_NO', 'EHLIYET_TARIHI_YIL'];
                const selectFields = ['HAS_MODEL_YILI', 'ARAC_KULLANIM_TURU', 'MARKA_ID'];

                // 3. Şart Kontrolü: 1000'den küçükse boya
                if (cleanHasar < 1000) {

                    // Input ve Metin Alanları
                    watchFields.forEach(id => {
                        const el = document.getElementById(id) || document.getElementsByName(id)[0];
                        const td = el?.closest('td');
                        if (td) { td.style.backgroundColor = (getValue(id) === '') ? WARNING_COLOR : ''; }
                    });

                    // KM Kontrolü
                    const km = parseNum('KM');
                    const kmEl = document.getElementById('KM') || document.getElementsByName('KM')[0];
                    const kmTd = kmEl?.closest('td');
                    if (kmTd) kmTd.style.backgroundColor = km < 1 ? WARNING_COLOR : '';

                    // Piyasa Kontrolü
                    const piyasa = parseNum('PIYASA');
                    const piyasaEl = document.getElementById('PIYASA') || document.getElementsByName('PIYASA')[0];
                    const piyasaTd = piyasaEl?.closest('td');
                    if (piyasaTd) piyasaTd.style.backgroundColor = piyasa < 1000 ? WARNING_COLOR : '';

                    // Select Alanları
                    selectFields.forEach(id => {
                        const el = document.getElementById(id) || document.getElementsByName(id)[0];
                        const td = el?.closest('td');
                        if (td) td.style.backgroundColor = getValue(id) === '-1' ? WARNING_COLOR : '';
                    });

                } else {
                    // Hasar 1000 veya üzerindeyse tüm renkleri temizle
                    const allFields = [...watchFields, ...selectFields, 'KM', 'PIYASA'];
                    allFields.forEach(id => {
                        const el = document.getElementById(id) || document.getElementsByName(id)[0];
                        const td = el?.closest('td');
                        if (td) td.style.backgroundColor = '';
                    });
                }
            }
            /* ===== 4. PANEL GÜNCELLEME ===== */
            function updatePanel() {
                //let html = '';
                let html = '<table style="width:100%; border-collapse:collapse; font-size:13px; color:white;">';
                html += `<tr><td colspan="2"><hr style="border:0; border-top:1px solid #444; margin:2px 0;"></td></tr>`;
                html += `</table>`;

                function buildTargetUrl() {
                    // 1. YARDIMCI: Metin içindeki ilk 4 haneli yılı bulur
                    const extractYear = (str) => {
                        const match = String(str).match(/\b(19|20)\d{2}\b/); return match ? match[0] : "";
                    };

                    const sigortaSelect = document.getElementById('SIGORTA_SEKLI');
                    const sigortaTipi = sigortaSelect ? sigortaSelect.value : "";
                    let m = "", yRaw = "", kStr = "0";
                    if (sigortaTipi === "1") {
                        // TRAFİK: Mağdur Araç Tablosu
                        const allTds = document.getElementsByTagName('td');
                        for (let i = 0; i < allTds.length; i++) {
                            if (allTds[i].innerText.includes("MAĞDUR ARAÇ")) {
                                const parentTr = allTds[i].closest('tr');
                                const dataTr = parentTr.nextElementSibling.querySelector('tr + tr');
                                if (dataTr) {
                                    const cells = dataTr.cells;
                                    m = (cells[1].innerText + " " + cells[2].innerText);
                                    yRaw = cells[3].innerText;
                                }
                                break;
                            }
                        }
                    }

                    // Eğer m hala boşsa Kasko moduna/ID'lere geç
                    if (!m) {
                        const mInput = document.getElementById('HAS_MODEL_ADI');
                        const yInput = document.getElementById('HAS_MODEL_YILI');
                        m = mInput ? (mInput.value || mInput.innerText || "") : "";
                        yRaw = yInput ? (yInput.value || yInput.innerText || "") : "";
                    }

                    // --- TEMİZLİK ---
                    // Model adındaki parantezleri ve tarihli kısımları temizle
                    m = m.replace(/\d{2}\/\d{2}\/\d{4}.*/g, '').replace(/\(\s*\d+\s*\)/g, '').replace(/\s+/g, ' ').trim();

                    const y = extractYear(yRaw);

                    const kInput = document.getElementById('HAS_KM');
                    kStr = kInput ? (kInput.value || kInput.innerText || "0") : "0";
                    const k = parseInt(kStr.replace(/\D/g, '')) || 0;

                    if (!m) return null;

                    // --- URL OLUŞTURMA ---
                    let baseUrl = `https://www.sahibinden.com/otomobil?query_text=${encodeURIComponent(m)}`;
                    let params = [];

                    if (y) params.push(`a5_min=${y}`, `a5_max=${y}`);

                    // KM 100'den küçükse hiç ekleme
                    if (k >= 100) {
                        params.push(`a4_min=${Math.floor(k * 0.9)}`, `a4_max=${Math.ceil(k * 1.1)}`);
                    }

                    return params.length > 0 ? `${baseUrl}&${params.join('&')}` : baseUrl;
                }

                document.getElementById('btn-auto-analiz').onclick = function () {
                    const resBox = document.getElementById('shb-res-box');

                    // Fonksiyonun varlığını kontrol et
                    if (typeof GM_xmlhttpRequest === "undefined") {
                        resBox.innerHTML = "❌ Hata: Kaynak kod dış sitelere erişim izni alamadı."; return;
                    }

                    const targetUrl = buildTargetUrl();
                    if (!targetUrl) {
                        resBox.innerHTML = "❌ Hata: URL oluşturulamadı!"; return;
                    }

                    resBox.innerHTML = "🚀 İstek gönderiliyor...";

                    try {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: targetUrl,
                            headers: {
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
                                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
                            },
                            timeout: 10000, // 10 saniye sonra vazgeç
                            onreadystatechange: function (res) {
                                // İstek aşamalarını yazdırır (1: Açıldı, 2: Gönderildi, 3: Yükleniyor)
                                if (res.readyState === 1) resBox.innerHTML = "⏳ Bağlantı açıldı...";
                                if (res.readyState === 3) resBox.innerHTML = "📥 Veri indiriliyor...";
                            },
                            onload: function (res) {
                                resBox.innerHTML = `📡 Cevap geldi (Kod: ${res.status})`;

                                if (res.status === 200) {
                                    // Sayfayı analiz et
                                    const doc = new DOMParser().parseFromString(res.responseText, "text/html");

                                    // Bot kontrolü var mı? (Sahibinden genelde 'security' veya 'captcha' içeren sayfa gönderir)
                                    if (res.responseText.includes("captcha") || res.responseText.includes("security-check")) {
                                        resBox.innerHTML = "🛡️ Bot engeli! Site arka planda veri çekmemize izin vermiyor."; return;
                                    }

                                    const priceElements = doc.querySelectorAll('.searchResultsPriceValue');
                                    const prices = [...priceElements].map(el => parseInt(el.innerText.replace(/\D/g, ''))).filter(n => n > 10000);

                                    if (prices.length > 0) {
                                        const avg = Math.round(prices.reduce((a, b) => a + b) / prices.length);
                                        resBox.innerHTML = `✅ <b>${prices.length} ilan listelendi.</b><br>💰 Ort: <b>${avg.toLocaleString('tr-TR')} TL</b>`;
                                    } else {
                                        resBox.innerHTML = "❓ Sayfa yüklendi ama fiyat bulunamadı. Yapı değişmiş olabilir.";
                                    }
                                } else if (res.status === 403) {
                                    resBox.innerHTML = "🚫 Erişim Yasaklandı (403)! IP adresiniz geçici olarak engellenmiş olabilir.";
                                } else {
                                    resBox.innerHTML = `⚠️ Sunucu hatası! Kod: ${res.status}`;
                                }
                            },
                            onerror: function (res) {
                                resBox.innerHTML = "⚠️ Bağlantı hatası! İnternet veya SSL sorunu olabilir.";
                                console.error("Detaylı Hata:", res);
                            },
                            ontimeout: function () {
                                resBox.innerHTML = "⏱️ İstek zaman aşımına uğradı (10sn). Site çok yavaş!";
                            }
                        });
                    } catch (e) {
                        resBox.innerHTML = "⚠️ Kritik Hata: " + e.message;
                    }
                };

                document.getElementById('btn-auto-look').onclick = function () {
                    const resBox = document.getElementById('shb-res-box');
                    // Fonksiyonun varlığını kontrol et
                    if (typeof GM_xmlhttpRequest === "undefined") {
                        resBox.innerHTML = "❌ Hata: Kaynak kod dış sitelere erişim izni alamadı.<br><small>${targetUrl}</small>"; return;
                    }
                    try {
                        const targetUrl = buildTargetUrl();
                        const resBox = document.getElementById('shb-res-box');

                        if (targetUrl) {
                            if (resBox) resBox.innerHTML = `🔗 <small>${targetUrl}</small>`;
                            unsafeWindow.open(targetUrl, '_blank');
                        } else {
                            if (resBox) resBox.innerHTML = "❌ Model adı çekilemedi!";
                        }
                    } catch (e) {
                        console.error("Buton hatası:", e);
                    }
                };

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
                ['KUSURLU1', 'SURUCU_BELGESI0', 'RUHSAT_ASLI0', 'TESPIT_SEKLI0', 'SURUCU_BELGESI_GORULDU1', 'EHLIYET_YETERLI1', 'ALKOL_DURUMU2'].forEach(clickCb);
                //setVal('MILLI_R_NO', getValue('IHBAR_TARIHI_YIL'));
                setVal('SURUCU_EHLIYET_SINIFI', 'B');
                const setSelectText = (id, txt) => {
                    const el = $(id);
                    if (!el) return;
                    const opt = [...el.options].find(o => o.text.includes(txt));
                    if (opt) {
                        el.value = opt.value;
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                };
                setSelectText('KAZA_IHBAR_TURU', 'ANLAŞMALI KAZA');
                setSelectText('KANAAT', 'OLUMLUDUR');
                console.log('✅ Otomatik seçimler tamamlandı.');
            });
            /* ===== 5. OTOMATİK SEÇİM BUTONU ===== */
            document.getElementById('unlockSelectBtn').addEventListener('click', unlockAllElements);
            setInterval(highlightFields, 1500);
            setInterval(updatePanel, 2000);
        }
    }
    // Resim yükleme kontrolü
    if (KS_SYSTEM && ANALIZPANEL && location.href.includes("otohasar") && location.href.includes("eks_hasar_evrak_foto_list.php")) {
        if (typeof injectStyles === 'function') injectStyles();
        if (typeof initPanel === 'function') initPanel();
        const panel = document.getElementById('ks-master-panel');
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Evrak Analizi";
            panelContent.innerHTML = `
            <div id="panelContent" style="color:#fff; text-align:center; padding:5px; background:rgba(0,0,0,0.2); border-radius:5px; margin-bottom:8px; font-size:12px; font-weight:bold; border:1px solid rgba(255,255,255,0.1);">DURUM TARANIYOR</div>
            <div class="ks-grid-container" style="display: grid; grid-template-columns: 1fr; gap: 4px; width: 100%;">
                <div style="color:#aaa; font-size:10px; text-align:center;">Tablo verileri bekleniyor...</div>
            </div>
        `;
        }
        function updatePanel() {
            const container = document.querySelector('.ks-grid-container');
            const statusHeader = document.getElementById('panelContent');
            if (!container) return;
            const scenarios = {
                KTT: { label: "KAZA ŞEKLİ: KTT", keys: ["kaza tespit tutanağı", "(ktt)", "anlasmali kaza"], req: [{ id: "e", k: ["ehliyet"], l: "Ehliyet" }, { id: "r", k: ["ruhsat"], l: "Ruhsat" }] },
                Zabit: { label: "KAZA ŞEKLİ: ZABIT", keys: ["zapt", "zabit", "zabıt", "karakol", "ifade", "görgü tespit", "polis"], req: [{ id: "a", k: ["alkol"], l: "Alkol Raporu" }, { id: "e", k: ["ehliyet"], l: "Ehliyet" }, { id: "r", k: ["ruhsat"], l: "Ruhsat" }] },
                Beyan: { label: "KAZA ŞEKLİ: BEYAN", keys: ["beyan yazısı", "beyan talep", "müşteri beyanı", "mağdur beyanı"], req: [{ id: "e", k: ["ehliyet"], l: "Ehliyet" }, { id: "r", k: ["ruhsat"], l: "Ruhsat" }] }
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
            const createBox = (text, ok, isMain = false) => {
                const div = document.createElement('div');
                div.style.cssText = `padding:8px 5px; border-radius:4px; font-size:11px; font-weight:800; text-align:center; transition: all 0.3s; border-left: 4px solid ${ok ? '#28a745' : '#dc3545'}; background:${ok ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)'}; color:${ok ? '#85ff9e' : '#ff8585'}; margin-bottom:3px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);`;
                div.innerText = (ok ? "✓ " : "⚠ ") + text.toUpperCase();
                if (isMain && ok) { statusHeader.innerText = text.toUpperCase(); statusHeader.style.color = "#28a745"; }
                return div;
            };
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
    // Hızlı Referans açma Otohasar
    if (KS_SYSTEM && REFERANS && location.href.includes("otohasar") && location.href.includes("eks_hasar_yp_list_yp_talep.php")) {
        config.bottom = "24px";
        config.width = "200px";
        config.collapsedWidth = "200px";
        injectStyles();
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
            contentArea.innerHTML = `<div style="text-align:center; padding-bottom:5px; font-size:12px;">Excel için Referanslar kopyala butonu ile kopyalanabilir.<br>Excel'den kopyalanan satırlar yapıştır ile sıralı şekilde yapıştırılabilir.</div>`;
            contentArea.style.display = "flex";
            contentArea.style.gap = "5px";
            // --- 1. BUTON: EXCEL'DEN YAPIŞTIR ---
            const btnPaste = document.createElement('button');
            btnPaste.className = 'ks-btn';
            btnPaste.innerText = "📋 YAPIŞTIR";
            btnPaste.onclick = async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
                    // Sayfadaki mevcut input kutularını bulalım
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
                    // --- UYARI MEKANİZMASI ---
                    if (lineCount !== inputCount && lineCount > 0) {
                        const confirmAction = confirm(`Dikkat: Sayı Uyuşmazlığı!\n\nExcel'den gelen satır: ${lineCount}\nSayfadaki kutu sayısı: ${inputCount}\n\nYine de devam etmek istiyor musunuz?`);
                        if (!confirmAction) return;
                    }
                    // --- DOLDURMA İŞLEMİ ---
                    lines.forEach((line, i) => {
                        if (i < inputCount) {
                            availableFields[i].value = line;
                            // Değişikliği tetiklemek gerekirse (bazı sistemler için)
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

            // --- 2. BUTON: EXCEL İÇİN KOPYALA ---
            const btnCopy = document.createElement('button');
            btnCopy.className = 'ks-btn';
            btnCopy.innerText = "📤 KOPYALA";
            btnCopy.onclick = async () => {
                try {
                    // Sadece veri içeren satırları seç (colspan="10" olan boş satırları atla)
                    const rows = Array.from(document.querySelectorAll('tr')).filter(tr => {
                        const firstTd = tr.querySelector('td');
                        return firstTd && firstTd.classList.contains('acik') && tr.querySelectorAll('td').length >= 6;
                    });

                    let excelData = rows.map(tr => {
                        const tds = Array.from(tr.querySelectorAll('td.acik'));
                        // İlk 5 hücreyi al (Sıra, Parça Adı, Kod, Eksper Notu, Tedarikçi Notu)
                        const rowData = tds.slice(0, 6).map(td => td.innerText.trim());
                        return rowData.join('\t'); // Excel için TAB ile ayır
                    }).join('\n');
                    if (excelData) {
                        await navigator.clipboard.writeText(excelData);
                        btnCopy.innerText = "✔️ KOPYALANDI";
                        setTimeout(() => { btnCopy.innerText = "📤 KOPYALA"; }, 2000);
                    } else {
                        alert("Kopyalanacak veri bulunamadı.");
                    }
                } catch (err) {
                    alert("Kopyalama hatası: " + err);
                }
            };
            // --- 3. BUTON: OTOMATİK GRUP SEÇ (KAPORTA & DİĞER) ---
            const btnFillAll = document.createElement('button');
            btnFillAll.className = 'ks-btn';
            btnFillAll.innerText = "🚗 TÜMÜNÜ GRUPLANDIR - Hepiyi";
            btnFillAll.onclick = async () => {
                try {
                    let count = 0;
                    // 1'den 20'ye kadar tüm olası satırları kontrol et
                    for (let j = 1; j <= 20; j++) {
                        const grupSelect = document.querySelector(`select[name="YP_GRUP_ID_${j}"]`);
                        if (grupSelect) {
                            // 1. Ana Grubu Seç (KAPORTA)
                            grupSelect.value = "2";
                            grupSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            // 2. Alt Grubu Seç (DİĞER)
                            await new Promise(resolve => setTimeout(resolve, 150));
                            const altSelect = document.querySelector(`select[name="YP_ID_${j}"]`);
                            if (altSelect) {
                                altSelect.value = "0"; // Diğer seçeneği
                                altSelect.dispatchEvent(new Event('change', { bubbles: true }));
                                count++;
                            }
                        }
                    }
                    if (count > 0) {
                        btnFillAll.innerText = `✔️ ${count} SATIR HAZIR`;
                        btnFillAll.style.backgroundColor = "#28a745";
                        setTimeout(() => { btnFillAll.innerText = "🚗 TÜMÜNÜ SEÇ"; btnFillAll.style.cssText = ""; }, 2000);
                    } else {
                        alert("Seçilecek kutu bulunamadı!");
                    }
                } catch (err) {
                    console.error("Toplu seçim hatası:", err);
                    alert("İşlem sırasında bir hata oluştu.");
                }
            };
            contentArea.appendChild(btnFillAll);
            contentArea.appendChild(btnPaste);
            contentArea.appendChild(btnCopy);
        }
    }
    // Hızlı Referans açma Otohasar
    if (KS_SYSTEM && REFERANS && location.href.includes("otohasar") && location.href.includes("talep_yp_giris.php")) {
        config.bottom = "24px";
        config.width = "200px";
        config.collapsedWidth = "200px";
        injectStyles();
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
            contentArea.innerHTML = `<div style="text-align:center; padding-bottom:5px; font-size:12px;">Excel'den kopyalanan satırlar yapıştır ile sıralı şekilde yapıştırılabilir. Fiyat kolonu seçilmediyse 1 olarak girilir.</div>`;
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
        config.bottom = "24px";
        config.width = "150px";
        config.collapsedWidth = "150px";
        injectStyles();
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
                    const excelData = Array.from(document.querySelectorAll('tr'))
                        .map(row => {
                            const cells = row.querySelectorAll('td');
                            if (cells.length >= 4) {
                                const rawKod = cells[1].innerText.trim();
                                if (/^\d+$/.test(rawKod) && rawKod !== "") {
                                    return `${rawKod}\t${cells[2].innerText.trim()}\t${cells[3].innerText.trim()}`;
                                }
                            }
                            return null;
                        })
                        .filter(Boolean);
                    if (!excelData.length) return alert("Kopyalanacak temiz parça kodu bulunamadı!");
                    await navigator.clipboard.writeText(excelData.join('\n'));
                    btnCopy.innerText = "✔️ LİSTE HAZIR";
                    Object.assign(btnCopy.style, { backgroundColor: "#28a745", color: "#fff" });
                    setTimeout(() => {
                        btnCopy.innerText = "📂 LİSTEYİ KOPYALA";
                        btnCopy.style.cssText = "";
                    }, 2000);
                } catch (err) {
                    alert("Kopyalama başarısız!");
                }
            };
            contentArea.appendChild(btnCopy);
        }
    }
    // Hızlı Referans açma Otohasar
    if (KS_SYSTEM && REFERANS && location.href.includes("otohasar") && location.href.includes("eks_hasar_yp_list.php")) {
        Object.assign(config, { bottom: "22px", width: "150px", collapsedWidth: "150px" });
        injectStyles();
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        if (panel) {
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Aktifleştirici Panel";
        }
        const contentArea = document.querySelector('.ks-content');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="ks-tooltip-container" onmouseover="handleHover(this)">
                    <button id="unlockSelectBtn" class="ks-btn" style="width:100%; height: 100%;">🔓 Kilit Aç</button>
                    <div class="ks-tooltip-box">
                        <strong>⚠️ Kritik İşlem</strong><br>
                        Site üzerindeki tüm etkileşimleri (buton, liste, kutu) aktifleştirir. Tehlikeli bir işlemdir, tavsiye edilmez.
                    </div>
                </div>`;
            document.getElementById('unlockSelectBtn').addEventListener('click', unlockAllElements);
        }
    }
    // Hızlı Manuel Parça girişi
    if (KS_SYSTEM && MANUEL && location.href.includes("otohasar") && location.href.includes("eks_hasar_yedpar_yeni_ref")) {
        function initPanel() {
            if (document.getElementById("tm-panel")) return;
            if (typeof injectStyles === 'function') injectStyles();
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
            /* Sayfa İçeriğini Kaydırma (Panel açıkken) */
            body { transition: margin-left var(--transition-speed); margin-left: 260px !important; }
            body.panel-closed { margin-left: 0 !important; }
			#tm-panel {
                position: fixed; top: 0; left: 0; width: 250px; height: 100vh;
                background: var(--panel-bg);
                backdrop-filter: blur(${config.blur}) saturate(160%);
                -webkit-backdrop-filter: blur(${config.blur}) saturate(160%);
                color: #fff; z-index: ${Number(config.zIndex) + 1};
                display: flex; flex-direction: column;
                padding: 10px 10px; gap: 8px;
                font-family: 'Segoe UI', system-ui, sans-serif;
                box-shadow: 5px 0 25px rgba(0,0,0,0.5);
                border-right: 1px solid rgba(255, 255, 255, 0.1);
                transition: transform var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
                overflow-y: auto
                z-index: 1;
            }
            #tm-panel.closed { transform: translateX(-260px); }
            /* Kapatma / Açma Butonu (Toggle) */
            #tm-toggle {
                position: fixed;
                top: 20px;
                left: calc(var(--toggle-loc) + 15px);
                width: 40px;
                height: 50px;
                background: var(--panel-bg);
                border: 1px solid rgba(255,255,255,0.1);
                border-left: none;
                border-radius: 0 8px 8px 0;
                cursor: pointer;
                color: #fff;
                z-index: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 5px 0 25px rgba(0,0,0,0.5);
                backdrop-filter: blur(${config.blur});
                transition: left var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
            }
            /* KAPANIRKEN */
            #tm-panel.closed + #tm-toggle {
                left: 0px;
                transition: left calc(var(--transition-speed) / 2) cubic-bezier(0.4, 0, 0.2, 1);
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
            .radio-container input { display: none;
            }
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

            .btn-full { grid-column: span 1; padding: 10px !important; font-size: 13px !important; }
            .btn-new    { background: #0078D4 !important; color: white !important; } /* Modern Mavi */
            .btn-ok     { background: #28a745 !important; color: white !important; } /* Güvenli Yeşil */
            .btn-orange { background: #ff8c00 !important; color: white !important; } /* Canlı Turuncu */
            .btn-purple { background: #8e44ad !important; color: white !important; } /* Derin Mor */
            .btn-rpr    { background: #e67e22 !important; color: white !important; } /* Onarım Turuncusu */
            .btn-danger { background: #dc3545 !important; color: white !important; } /* Parlak Kırmızı */
            .btn-info   { background: #00afc4 !important; color: white !important; } /* Turkuaz/Siyan */
            .btn-dark   { background: #2c3e50 !important; color: white !important; } /* Lacivert/Siyah */
            .btn-lime   { background: #84cc16 !important; color: black !important; } /* Neon Limon */
            .btn-amber  { background: #f59e0b !important; color: black !important; } /* Kehribar */
            .btn-indigo { background: #6366f1 !important; color: white !important; } /* İndigo */
            .btn-teal   { background: #14b8a6 !important; color: white !important; } /* Su Yeşili */
            .btn-brown  { background: #a855f7 !important; color: white !important; } /* Alternatif: Parlak Menekşe */
            .btn-gold   { background: #fbbf24 !important; color: black !important; } /* Altın Sarısı */

            @keyframes blink { 0%, 100% { background: #D4AF37; opacity: 1; } 50% { background: #3F51B5; opacity: 0.5; } }
            .blink { animation: blink 1s infinite; background: #FF9800; }
        `;
            document.head.appendChild(style);
            /* ===== 2. PANEL HTML ===== */
            const panel = document.createElement("div");
            panel.id = "tm-panel";
            panel.innerHTML = `
            <button id="bYeni" class="btn-new btn-full">YENİ KAYIT</button>
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
            <div class="radio-container">
                <label><input type="radio" name="islemTipi" value="degisim" checked> DEĞİŞİM</label>
                <label><input type="radio" name="islemTipi" value="onarim"> ONARIM</label>
            </div>
			<div class="ks-tooltip-container" onmouseover="handleHover(this)">
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
			<div class="ks-tooltip-container" onmouseover="handleHover(this)">
                <div class="radio-container red-alrt-bg">
                    <label class="white-text"> <input type="radio" name="kayit_secim" value="kayit" checked> OTOM. KAYDET </label>
                    <label class="white-text"> <input type="radio" name="kayit_secim" value="nonkayit"> KAYDETME </label>
                </div>
                <div class="ks-tooltip-box">
                    <strong>Otomatik Kayıt</strong><br>
                    Açık olduğu sürece kaydetmeye çalışır.
                </div>
            </div>
            <div class="tm-section-title">GİRİŞ TÜRÜ</div>
			<div class="ks-tooltip-container" onmouseover="handleHover(this)">
                <div class="tm-button-grid">
                    <button id="b_kpon" class="btn-ok">KAPORTA ÖN</button>
                    <button id="b_kpyn" class="btn-ok">KAPORTA YAN</button>
                    <button id="b_kpar" class="btn-ok">KAPORTA ARKA</button>
                    <button id="b_kptv" class="btn-ok">KAPORTA TAVAN</button>
                    <button id="b_mek" class="btn-purple">MEKANİK</button>
                    <button id="b_elk" class="btn-purple">ELEKTRİK</button>
                    <button id="b_cam" class="btn-indigo">CAM</button>
                    <button id="b_doseme" class="btn-gold">DÖŞEME KİLİT</button>
                    <button id="b_lastık" class="btn-dark">LASTİK</button>
                    <button id="b_civata" class="btn-dark">CİVATA</button>
                    <button id="b_conta" class="btn-dark">CONTA</button>
                    <button id="b_klips" class="btn-dark">KLİPS</button>
                    <button id="b_mot" class="btn-orange">MOTORSİKLET</button>
                    <button id="b_dorse" class="btn-teal">DORSE</button>
                </div>
                <div class="ks-tooltip-box">
                    <strong>Otomatik seçici</strong><br>
                    Butonlar kategori listelerinden otomatik seçip hızlı giriş yapar. Eğer parça bilgileri bölümü boş olursa sadece kategori seçer.
                </div>
            </div>
            <div class="tm-section-title">DİĞER İŞLEMLER</div>
            <div class="tm-button-grid">
                <button id="b_gnlonar" class="btn-rpr">GENEL ONARIM</button>
                <button id="b_donyan" class="btn-brown">EŞDEĞERE ÇEVİR</button>
            </div>
			<div class="ks-tooltip-container" width:100%; onmouseover="handleHover(this)">
                    <button id="unlockSelectBtn" class="ks-btn" style="width:100%; height: 100%;">🔓 Kilit Aç</button>
                    <div class="ks-tooltip-box">
                        <strong>⚠️ Kritik İşlem</strong><br>
                        Site üzerindeki tüm etkileşimleri (buton, liste, kutu) aktifleştirir. Tehlikeli bir işlemdir, tavsiye edilmez.
                    </div>
                </div>
            `; /* btn-full tam doldurur */
            const toggleBtn = document.createElement("div");
            toggleBtn.id = "tm-toggle";
            toggleBtn.innerHTML = "◀";
            document.body.appendChild(panel);
            document.body.appendChild(toggleBtn);
            /* ===== 3. PANEL LOGIC (Kapatma/Açma) ===== */
            toggleBtn.onclick = () => {
                panel.classList.toggle("closed");
                document.body.classList.toggle("panel-closed");
                toggleBtn.innerHTML = panel.classList.contains("closed") ? "▶" : "◀";
            };
            document.getElementById('unlockSelectBtn').addEventListener('click', unlockAllElements);
            //adet kontrolü
            const adetInput = document.getElementById('tm_adet');
            if (adetInput) {
                adetInput.addEventListener('blur', function () {
                    if (this.value === "") {
                        this.value = 0;
                    }
                });
                adetInput.addEventListener('keydown', function (e) {
                    const invalidChars = ["e", "E", "+", "-", "."];
                    if (invalidChars.includes(e.key)) {
                        e.preventDefault();
                    }
                });
                adetInput.addEventListener('input', function () {
                    if (this.value < 0) this.value = 0;
                });
            }
            /* ===== 3. HELPERS & SELECTORS ===== */
            const $ = (id) => document.getElementById(id);
            const refs = {
                kod: $("tm_kod"),
                ad: $("tm_ad"),
                fiyat: $("tm_fiyat"),
                adet: $("tm_adet"),
                bYeni: $("bYeni")
            };
            const waitFor = (selectorFn) => new Promise(resolve => {
                const interval = setInterval(() => {
                    const el = selectorFn();
                    if (el) { clearInterval(interval); resolve(el); }
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
                if (!selectedRadio) { console.warn("Lütfen bir işlem tipi seçin."); return; }
                const tip = selectedRadio.value;
                const checkboxDegisim = document.getElementById("DEGISIM");
                const checkboxTamir = document.getElementById("TAMIR");
                if (tip === "degisim") {
                    if (checkboxDegisim && !checkboxDegisim.checked) { checkboxDegisim.click(); }
                    if (checkboxTamir && checkboxTamir.checked) { checkboxTamir.checked = false; }
                }
                else if (tip === "onarim") {
                    if (checkboxTamir && !checkboxTamir.checked) { checkboxTamir.click(); }
                    if (checkboxDegisim && checkboxDegisim.checked) { checkboxDegisim.checked = false; }
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
                const eksikAlan = zorunluAlanlar.find(alan => !alan.ref.value || alan.ref.value.trim() === "");
                if (eksikAlan) { /*alert(`Lütfen eksik alanları doldurun: ${eksikAlan.label}`);*/ return; }
                if ($("PARCA_KODU")) $("PARCA_KODU").value = refs.kod.value.toUpperCase();
                if ($("ADET")) $("ADET").value = refs.adet.value;
                if ($("ADI")) $("ADI").value = refs.ad.value.toUpperCase();
                const fiyat = refs.fiyat.value.replace(",", ".");
                if ($("BIRIM_FIYAT_GERCEK")) $("BIRIM_FIYAT_GERCEK").value = fiyat;
                if ($("BIRIM_FIYAT_TALEP")) $("BIRIM_FIYAT_TALEP").value = fiyat;
                console.log("Giriş başarılı!");
            };
            const SideFields = async (dom, dem) => {
                await selectValue("GRUP_ID", dom);
                await selectValue("ANA_GRUP", dem);
                const radio = document.querySelector('input[name="kod_secim"]:checked')?.value;
                const notlar = $("NOTLAR");
                if (radio === "kodsuz") {
                    await selectValue("SISTEM_NOTU_ID", "2");
                    if (notlar) notlar.value = "KODSUZ PARÇA";
                    selectValue("SIPARIS_VERMEME_SEBEP_ID", "2");
                } else if (radio === "esdeger") {
                    await selectValue("SISTEM_NOTU_ID", "13");
                    if (notlar) notlar.value = "";
                    selectValue("SIPARIS_VERMEME_SEBEP_ID", "-1");
                } else if (radio === "bos") {
                    await selectValue("SISTEM_NOTU_ID", "-1");
                    if (notlar) notlar.value = "";
                    selectValue("SIPARIS_VERMEME_SEBEP_ID", "-1");
                }
                const eksikAlan = zorunluAlanlar.find(alan => !alan.ref.value || alan.ref.value.trim() === "");
                if (!eksikAlan) { submitForm(); setTimeout(() => { submitForm(); }, 400); }
            }
            const submitForm = () => {
                const selectedRadio = document.querySelector('input[name="kayit_secim"]:checked');
                const tip = selectedRadio.value;
                if (tip === "kayit") {
                    const retrySubmit = setInterval(() => {
                        const currentSelection = document.querySelector('input[name="kayit_secim"]:checked');
                        if (!currentSelection || currentSelection.value !== "kayit") { clearInterval(retrySubmit); return; }
                        if (typeof unsafeWindow.sbmt_frm === "function" && unsafeWindow.sbmt_frm()) {
                            let canSubmit = true;
                            if (typeof unsafeWindow.doraSiparisSecenek === "function") { if (!unsafeWindow.doraSiparisSecenek()) { canSubmit = false; } }
                            if (canSubmit && document.yedparforhasar) { document.yedparforhasar.submit(); clearInterval(retrySubmit); }
                        }
                    }, 500);
                } else if (tip === "nonkayit") {
                    console.log("Otomatik kayıt devre dışı."); return;
                }
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
                if (refs.bYeni) refs.bYeni.classList.remove("blink");
                if (refs.kod) refs.kod.focus();
            };
            $("b_kpon").onclick = async () => { await MainFields(); await SideFields("10", "777"); };
            $("b_kpyn").onclick = async () => { await MainFields(); await SideFields("11", "852"); };
            $("b_kpar").onclick = async () => { await MainFields(); await SideFields("12", "898"); };
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
            $("b_dorse").onclick = async () => { await MainFields(); await SideFields("31", "556"); const sipSec2 = await waitFor(() => $("SIP_SEC_2")); sipSec2.checked = true; };
            $("b_gnlonar").onclick = async () => {
                const fiyat = refs.fiyat.value.replace(",", ".");
                if ($("BIRIM_FIYAT_GERCEK")) $("BIRIM_FIYAT_GERCEK").value = fiyat; if ($("BIRIM_FIYAT_TALEP")) $("BIRIM_FIYAT_TALEP").value = fiyat;
                await selectValue("GRUP_ID", "6"); await selectValue("ANA_GRUP", "495");
            };
            $("b_donyan").onclick = async () => {
                const fiyat = refs.fiyat.value.replace(",", ".");
                if ($("BIRIM_FIYAT_GERCEK")) $("BIRIM_FIYAT_GERCEK").value = fiyat; if ($("BIRIM_FIYAT_TALEP")) $("BIRIM_FIYAT_TALEP").value = fiyat;
                if (document.getElementById("SISTEM_NOTU_ID")?.value == "-1") await selectValue("SISTEM_NOTU_ID", "11");
                submitForm();
            };
            setInterval(() => {
                const realInput = document.getElementById("PARCA_KODU");
                if (realInput && (realInput.value || realInput.disabled)) refs.bYeni.classList.add("blink");
                else refs.bYeni.classList.remove("blink");
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
    if (KS_SYSTEM && MANUEL && location.href.includes("otohasar") && location.href.includes("eks_hasar_yedpar_multi") && !location.href.includes("eks_hasar_yedpar_multi_form")) {
        /* ===== 1. PANEL VE STİLLER ===== */
        const style = document.createElement('style');
        style.innerHTML = `
        #multi-action-panel {
            position: fixed; bottom: ${config.bottom}; right: ${config.right}; z-index: ${Number(config.zIndex) + 1};
            background: rgba(0,0,0,0.75); padding: 10px; border-radius: ${config.borderRadius};
            box-shadow: 0 4px 8px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 4px;
        }
        #multi-action-panel button {
            background: #34495e; color: white; border: 1px solid #5d6d7e;
            padding: 4px 4px; font-size: 11px; font-weight: bold; cursor: pointer;
            border-radius: ${config.borderRadius}; transition: background 0.2s; text-align: center;
        }
        #multi-action-panel button:hover { background: #1abc9c; border-color: #16a085; } `;
        document.head.appendChild(style);
        const panel = document.createElement('div');
        panel.id = 'multi-action-panel';
        /* ===== 1. PANEL VE TEK BUTON ===== */
        panel.innerHTML = `
            <button id="btnHepsiniYap"> Grup & Ana Grup - GÜNCELLE </button>
            <button id="btnSiparisHazirla">Tedarik Yok</button>
            <button id="btnExcelCopy">📋 EXCEL İÇİN KOPYALA</button>
        `;
        document.body.appendChild(panel);
        /* ===== 2. GELİŞTİRİLMİŞ SEÇİM FONKSİYONU ===== */
        document.getElementById('btnHepsiniYap').addEventListener('click', () => {
            // 1. Tüm Grup selectlerini bul
            const grupSelectors = document.querySelectorAll(`select[id^="GRUP_ID"]`);
            grupSelectors.forEach(grupSel => {
                // SADECE GRUP -1 İSE İŞLEM YAP
                if (grupSel.value === "-1") {
                    // Satır ID'sini al (Örn: GRUP_ID265467 -> 265467)
                    const rowId = grupSel.id.replace('GRUP_ID', '');
                    const anaGrupSel = document.getElementById(`ANA_GRUP${rowId}`);
                    // GRUP'U DEĞİŞTİR
                    grupSel.value = "10";
                    grupSel.dispatchEvent(new Event('change', { bubbles: true }));
                    // GRUP DEĞİŞTİĞİ İÇİN AYNI SATIRDAKİ ANA GRUP'U DA DEĞİŞTİR
                    if (anaGrupSel) {
                        anaGrupSel.value = "777";
                        anaGrupSel.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        });
        document.getElementById('btnSiparisHazirla').addEventListener('click', async () => {
            // Fonksiyonu beklemeli çalıştırmak için küçük bir yardımcı
            const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            const radioSiparis = document.getElementById('SIPARIS_SECENEK1');
            // 1. Radiobox (SIPARIS_SECENEK1) Seç ve Onclick Tetikle
            if (radioSiparis) {
                radioSiparis.focus(); // Bazı sistemler focus bekler
                radioSiparis.checked = true; // Mantıksal seçim
                // Hem click hem change olaylarını zorla tetikle
                radioSiparis.dispatchEvent(new Event('click', { bubbles: true }));
                radioSiparis.dispatchEvent(new Event('change', { bubbles: true }));
                console.log("1. Radiobox işaretlendi ve tetiklendi.");
                await wait(400); // Sistemin alt alanları açması için biraz daha uzun bekleme
            }

            // 2. Sipariş Vermeme Sebebi (SIPARIS_VERMEME_SEBEP_ID1) -> "Diğer" (9)
            const sebepSel = document.getElementById('SIPARIS_VERMEME_SEBEP_ID1');
            if (sebepSel) {
                sebepSel.value = "9";
                sebepSel.dispatchEvent(new Event('change', { bubbles: true }));
                console.log("2. Sipariş vermeme sebebi 'Diğer' olarak seçildi.");
                await wait(200);
            }

            // 3. Notlar Alanı (NOTLAR_SIPARIS1) -> "TEDARİK YOK"
            const notlarArea = document.getElementById('NOTLAR_SIPARIS1');
            if (notlarArea) {
                notlarArea.value = "TEDARİK YOK";
                notlarArea.dispatchEvent(new Event('input', { bubbles: true }));
                console.log("3. Not eklendi.");
            }
            alert("İşlemler sırasıyla tamamlandı!");
        });
        /* ===== KOPYALAMA FONKSİYONU (NAME/ID DESTEKLİ) ===== */
        document.getElementById('btnExcelCopy').addEventListener('click', () => {
            let excelRows = [];
            // Sayfadaki parça kodu alanlarını bul (id veya name üzerinden)
            const pKodlar = document.querySelectorAll('[id^="PARCA_KODU"], [name^="PARCA_KODU"]');
            pKodlar.forEach((pKodu) => {
                // Numarayı al (Örn: name="PARCA_KODU1" -> 1)
                const idNo = (pKodu.id || pKodu.getAttribute('name')).replace('PARCA_KODU', '');
                // Diğer elementleri bulurken hem ID hem NAME üzerinden sorgula
                const getEl = (key) => document.getElementById(`${key}${idNo}`) || document.querySelector(`[name="${key}${idNo}"]`);
                const pAdi = getEl('ADI');
                const pFiyat = getEl('BIRIM_FIYAT_SISTEM');
                const pGrup = getEl('GRUP_ID');
                // Değer çekme fonksiyonu
                const getVal = (el) => {
                    if (!el) return "";
                    // Önce value (inputlar için), yoksa innerText (statik metinler için)
                    return (el.value !== undefined ? el.value : el.innerText).trim();
                };
                const rowData = [
                    getVal(pKodu),
                    getVal(pAdi), // Paylaştığın "RADAR SENSORU" buradan gelecek
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
    if (KS_SYSTEM && RESIM && location.href.includes("otohasar") && location.href.includes("multi_file_upload")) {
        const getSistemAyarlari = () => {
            config.bottom = "24px";
            config.width = "100px";
            config.collapsedWidth = "150px";
            injectStyles();
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
            return (text.includes("MAPFRE") || url.includes("mapfre")) ? mapfre : (text.includes("HEPIYI") || url.includes("hepiyi")) ? hepiyi : (text.includes("ATLAS") || url.includes("atlas")) ? atlas : varsayilan;
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
                    Object.assign(container.style, { background: '#f1f1f1', border: '1px solid #ccc', borderRadius: '3px', padding: '4px', marginBottom: '4px', marginTop: '6px' });
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
                        textTransform: 'uppercase', // Daha profesyonel görünüm
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
    // Hızlı Donanım girişi
    if (KS_SYSTEM && DONANIM && location.href.includes("otohasar") && /eks_(magdur_arac_donanim|arac_donanim)/.test(location.href)) {
        function initPanel() {
            if (document.getElementById('donanim-panel') || !document.body.innerText.toLowerCase().includes("donanim")) return;
            //injectStyles(); initPanel();
            /* ===== 1. PANEL OLUŞTURMA ===== */
            // 1. Animasyon Tanımları
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
                font-family: ui-monospace, monospace;
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
            { ad: "CORPUS", kod: "019", renk: "#4b5563" },
            { ad: "ORIENT", kod: "106", renk: "#db2777" }
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
        // --- 1. YARDIMCI FONKSİYONLAR ---
        const parseDate = (s) => {
            const b = s?.split(' ')[0].split('/');
            return b?.length === 3 ? new Date(b[2], b[1] - 1, b[0]) : null;
        };
        const createNumberPanel = () => {
            let panel = document.getElementById('sbm-big-number-panel');
            if (!panel) {
                panel = document.createElement('div');
                panel.id = 'sbm-big-number-panel';
                // --- YAZDIRMA SORUNUNU ÇÖZEN EKLEME ---
                const styleSheet = document.createElement("style");
                styleSheet.innerText = `
                    @media print {
                        #sbm-big-number-panel {
                        position: absolute !important; /* Fixed yerine Absolute yaparak sayfa akışına hapseder */
                        top: 5px;
	        			font-size: 17px !important;
                        }
                    }
                `;
                document.head.appendChild(styleSheet);
                Object.assign(panel.style, {
                    position: 'fixed',
                    top: '5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.75)',
                    // ... (diğer mevcut stilleriniz)
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
                if (targetLabel) {
                    const dateValue = targetLabel.nextElementSibling ? targetLabel.nextElementSibling.innerText.trim() : "";
                    displayDate = dateValue || new Date().toLocaleDateString('tr-TR');
                } else { displayDate = new Date().toLocaleDateString('tr-TR'); }
            } else {
                displayDate = new Date().toLocaleDateString('tr-TR');
            }
            panel.innerHTML = `
                <span style="font-weight: bold; color: black;">${num}</span>
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
                return lastFormattedNumber;
            });
            if (found) updatePanelContent(lastFormattedNumber);
            return formatted;
        };
        // --- 2. ANA İŞLEMCİLER ---
        const processNodes = (rootElement) => {
            const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while ((node = walker.nextNode())) {
                const originalValue = node.nodeValue;
                if (/\d{17,}/.test(originalValue)) {
                    const newValue = formatSbmNumber(originalValue);
                    if (originalValue !== newValue) node.nodeValue = newValue;
                }
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
                let color = '#f8d7da'; // Varsayılan: Kırmızı (Kapsam dışı)
                // Eğer kaza tarihi poliçe aralığındaysa
                if (kazaT >= dS && kazaT <= dE) {
                    const gecenGun = Math.floor((kazaT - dS) / 864e5); // Başlangıçtan kaza anına kadar geçen gün
                    if (gecenGun <= 2) { color = '#f8c291'; } // Kaza, poliçenin ilk 2 gününde (Çok Riskli - Turuncu)
                    else if (gecenGun <= 7) { color = '#fff3cd'; } // Kaza, poliçenin ilk 7 gününde (Riskli - Sarı)
                    else { color = '#d4edda'; }// Güvenli (Yeşil)
                }
                row.style.setProperty('background-color', color, 'important');
            });
        };
        // --- 3. GÖZLEMCİ VE BAŞLATICI ---
        const mainObserver = new MutationObserver((mutations) => {
            mainObserver.disconnect();
            for (const mutation of mutations) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) processNodes(node);
                    else if (node.nodeType === 3 && /\d{17,}/.test(node.nodeValue)) {
                        node.nodeValue = formatSbmNumber(node.nodeValue);
                    }
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
        // Blob yöntemiyle indirme (Daha güvenli ve etkili)
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
    if (KS_SYSTEM && SAHIBINDEN && location.href.includes("sahibinden.com")) {
        if (!location.search.includes("pagingSize=50")) {
            const url = new URL(location.href);
            url.searchParams.set("pagingSize", "50");
            location.replace(url.href);
        }
        config.bottom = "22px";
        config.width = "200px";
        config.collapsedWidth = "200px";
        injectStyles();
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
                if (document.querySelector('table')) {
                    hesapla();
                    setInterval(hesapla, 2000);
                } else {
                    setTimeout(init, 500);
                }
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
                } else {
                    manualDownload(img.src, name);
                }
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
                if (btn) {
                    e.preventDefault();
                    btn.click();
                }
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
        // 1. ZORLAYICI DEĞER ATAMA FONKSİYONU
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
                    const pasteEvt = new ClipboardEvent('paste', {
                        clipboardData: dt,
                        bubbles: true,
                        cancelable: true
                    });
                    input.dispatchEvent(pasteEvt);
                    setTimeout(() => {
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        input.blur();
                    }, 100);
                }, 100);
                return;
            }
            // --- ARAÇ SAHİBİ (İsim + Soyisim) ---
            // 1. MAĞDUR (VICTIM) KONTROLÜ
            const isVictimOwnerField = id.includes("victimcarownername") || name.includes("victimcarownername");
            if (isVictimOwnerField && input.value.trim() === "") {
                const vName = document.querySelector('input[name*="victimName"]')?.value || "";
                const vSurname = document.querySelector('input[name*="victimSurname"]')?.value || "";
                const fullVictimName = (vName + " " + vSurname).trim();

                if (fullVictimName.length > 1) {
                    forceUpdateValue(input, fullVictimName);
                    return;
                }
            }
            // 2. GENEL / SİGORTALI KONTROLÜ (Eskisi gibi çalışmaya devam eder)
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
        // GLOBAL DİNLEYİCİ
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
            if (document.querySelector('.osem-tab-btn') && !document.getElementById('ts-modern-styles')) {
                applyModernStyles();
            }
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
                        // Doğrulama hatasını temizle
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
                font-family: 'Inter', 'Segoe UI', Roboto, sans-serif !important;
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
    // Sayfa bildirim öldürücü
    if (KS_SYSTEM && BILDIRIM && location.href.includes("otohasar") && location.href.includes("eks_hasar.php")) {
        // unsafeWindow kullanımı Tampermonkey'de sayfa JS'ine erişim için kritiktir
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
})();
