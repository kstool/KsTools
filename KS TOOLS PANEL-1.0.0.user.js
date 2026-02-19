// ==UserScript==
// @name         KS TOOLS PANEL
// @namespace    KS_TOOLS_PANEL
// @version      1.0.0
// @description  OtoHasar Form Panel // Parça - Manuel ve Çoklu ekleme //  Donanim Panel // SBM Tramer no ayırma // Whatsapp indirici
// @match        *://*/*
// @run-at       document-end
// @grant        none
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @connect      sahibinden.com
// @connect      www.sahibinden.com
// @updateURL    https://github.com/sayginkizilkaya/Ks-Tools/raw/refs/heads/main/KS%20TOOLS%20PANEL-1.0.0.user.js
// @downloadURL  https://github.com/sayginkizilkaya/Ks-Tools/raw/refs/heads/main/KS%20TOOLS%20PANEL-1.0.0.user.js
// ==/UserScript==
(function () {
    'use strict';
    /*
    ✅ :white_check_mark: (Yeşil onay kutusu)
    ✔️ &#10004; (Kalın onay işareti)
    ❌ &#10060; (Kırmızı çarpı kutusu)
    ✖️ &#10006; (Siyah ince çarpı)
    🔘 &#128280; (Radyo butonu simgesi)
    🟢 &#128994; (Yeşil daire - Tamam/Var)
    🔴 &#128308; (Kırmızı daire - Hata/Yok)
    🟠 &#128992; (Turuncu daire - Uyarı)
    🟡 &#128993; (Sarı daire - Beklemede/Eksik)
    🔵 &#128309; (Mavi daire - Bilgi/İşlemde)
    ⚪ &#9898; (Beyaz daire)
    ⚫ &#9899; (Siyah daire) */
    const url = window.location.href.toLowerCase();
    const hedefSiteler = /otohasar|sahibinden|sigorta|sbm/;
    if (hedefSiteler.test(url)) {;}
    if (url.includes("dosya_ihbar_yazdir")) { return; }

    // 1. PANEL AYARLARI (Boyutlar ve Durum)
    let config = {
        bottom: '22px',
        width: '270px',
        collapsedWidth: '270px',
        themeColor: '#1ccd5a',
        Color: 'white',
        isCollapsed: false
    };
    // 2. STİL ENJEKSİYONU
    const injectStyles = () => {
        const style = document.createElement('style');
        style.id = 'ks-dynamic-styles';
        style.innerHTML = `
                .ks-draggable-panel {
                    position: fixed !important;
                    bottom: ${config.bottom};
                    right: 0px;
                    width: ${config.width};
                    background: rgba(25, 25, 27, 0.75);
                    backdrop-filter: blur(15px);
                    WebkitBackdropFilter: blur(16px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                    z-index: 3169999;
                    color: white;
                    /* Düzeltilen Kısım: font-family ve tırnaklar */
                    font-family: 'Inter', 'Roboto', 'Segoe UI', sans-serif;
                    overflow: hidden;
                    /* Sünmeyi engellemek için geçişleri buraya bağla */
                    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s ease;
                    user-select: none;
                    display: flex;
                    flex-direction: column;
                    min-height: min-content; /* İçerik kadar küçülsün */
                    max-height: 90vh; /* Ekranın dışına taşmasın */
                }

                /* SÜRÜKLEME ANINDA TRANSITION'I ÖLDÜR (En Kritik Nokta) */
                .ks-dragging {
                    transition: none !important;
                }

                /* Küçülmüş Mod (Collapsed) */
                .ks-draggable-panel.collapsed {
                    width: ${config.collapsedWidth} !important;
                    height: 40px !important;
                    min-height: 40px !important; /* Yüksekliğin zorla daralmasını sağlar */
                    max-height: 40px !important;
                    overflow: hidden !important; /* İçeriğin taşmasını kesin engelle */
                }

               /* Başlık Alanı (Sürükleme ve Tıklama Alanı) */
               .ks-header {
                   padding: 8px 15px; /* Biraz daha dikey boşluk kaliteyi artırır */
                   background: rgba(255, 255, 255, 0.03); /* Çok hafif şeffaflık */
                   cursor: move;
                   display: flex;
                   justify-content: space-between;
                   align-items: center;

                   /* Header altına ince bir neon çizgi */
                   border-bottom: 1px solid ${config.themeColor}44; /* 44 kodu şeffaflık ekler */

                   /* Hafif bir iç parlama efekti */
                   box-shadow: inset 0 1px 10px rgba(0, 0, 0, 0.2);
                   transition: background 0.3s ease;
               }

               .ks-header:hover {
                   background: rgba(255, 255, 255, 0.1);

                   /* Yazının kendisini belirgin tutmak için renk ataması */
                   color: #ffffff;

                   /* Strateji: İçerideki parlamayı azalt, dışarıdaki yayılımı artır */
                   text-shadow:
                       0 0 2px #fff,                          /* Harf kenarlarını keskinleştirir */
                       0 0 10px ${config.themeColor},         /* Ana neon rengi (orta şiddet) */
                       0 0 25px ${config.themeColor}99,       /* Dışa doğru yayılan ışık */
                       0 0 45px ${config.themeColor}66;       /* Arka plana düşen soft ışık */

                   /* Yazının netliğini korumak için hafif bir kontrast */
                   filter: brightness(1.2);
               }

               .ks-header h4 {
                   margin: 0;
                   font-size: 12px;
                   color: ${config.themeColor};
                   pointer-events: none;
                   font-weight: 800; /* Biraz daha kalın yazı */
                   text-transform: uppercase; /* Modern bir görünüm için */
                   letter-spacing: 1px; /* Harf arası boşluk profesyonel gösterir */

               }
                /* İçerik Alanı */
                .ks-content {
                    padding: 5px;
                    gap: 5px;
                    display: flex;
                    flex-direction: column;
                    color: ${config.Color};
                    transition: opacity 0.2s;
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
                    padding: 6px;
                    border-radius: 10px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 12px;
                    transition: 0.2s;
                }
                .ks-btn:hover { filter: brightness(1.1);
                    transform: translateY(-2px); /* Hafif yukarı kalkma efekti */

                    /* Neon Glow Efekti */
                    /* Tema rengini kullanarak dışa doğru yayılan parlama */
                    box-shadow: 0 0 10px ${config.themeColor},
                                0 0 20px ${config.themeColor};

                    /* Yazı rengini de parlatmak istersen (isteğe bağlı) */
                    text-shadow: 0 0 5px rgba(0,0,0,0.2); }
                .ks-btn:active {
                    transform: translateY(1px); /* Tıklayınca basılma hissi */
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                /* Kırmızı Neon Buton */
                .ks-btn-danger {
                    border: none;
                    padding: 6px;
                    border-radius: 10px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 12px;
                    transition: 0.2s;
                    background: #ff4d4d !important; /* Canlı kırmızı */
                    color: white !important;
                    box-shadow: 0 0 5px #ff4d4d;
                }

                .ks-btn-danger:hover {
                    filter: brightness(1.2);
                    /* Kırmızı Neon Glow Efekti */
                    box-shadow: 0 0 10px #ff4d4d,
                                0 0 20px #ff4d4d,
                                0 0 30px #ff1a1a !important;
                    text-shadow: 0 0 5px rgba(255,255,255,0.5);
                }
                .ks-btn-danger:active {
                    transform: translateY(1px); /* Tıklayınca basılma hissi */
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                 #shb-res-box { font-size: 13px; color: white; margin: 2px 0 2px 0; text-align: center; }

                /* Sürekli yanıp sönen (Breath) efekti */
                @keyframes neonPulse {
                    0% { box-shadow: 0 0 5px ${config.themeColor}66, inset 0 0 2px ${config.themeColor}44; }
                    50% { box-shadow: 0 0 15px ${config.themeColor}AA, inset 0 0 5px ${config.themeColor}66; }
                    100% { box-shadow: 0 0 5px ${config.themeColor}66, inset 0 0 2px ${config.themeColor}44; }
                }

                .ks-tooltip-container {
                    position: relative;
                    display: inline-block; /* Yan yana gelmelerine izin verir */
                    width: 100%;
                }

                .ks-tooltip-box {
                    visibility: hidden;
                    width: 230px;
                    background: rgba(25, 25, 27, 0.85);
                    color: #e0e0e0;
                    text-align: left;
                    border-radius: 8px;
                    padding: 10px;
                    bottom: calc(100% + 20px); /* Butonun tam üzerinden 15px yukarıda başlar */

                    /*display: block !important;*/
                    position: absolute !important; /* Panelden tamamen koparır */
                    z-index: 3179999 !important; /* Panelden daha büyük bir değer */

                    /* Konumlandırma */
                    transform: translateX(50%);
                    opacity: 0;

                    /* Yavaşça belirme ve kaybolma (Transition) */
                    transition: opacity 0.5s ease, transform 0.5s ease, visibility 0.5s;

                    /* Dinamik Renklendirme */
                    border: 1.5px solid ${config.themeColor};
                    animation: neonPulse 2s infinite ease-in-out; /* Sürekli ışıma efekti */

                    font-family: 'Inter', 'Roboto', 'Segoe UI', sans-serif;
                    font-size: 11px;
                    line-height: 1.5;
                    pointer-events: none;
                }

                /* Hover durumunda yumuşak geçiş */
                .ks-tooltip-container:hover .ks-tooltip-box {
                    visibility: visible;
                    opacity: 1;
                    transform: translate(0%); /* Hafif yukarı süzülme */
                }

                /* Başlık Renklendirme */
                .ks-tooltip-box strong {
                    color: ${config.themeColor}; /* config'den gelen ana renk */
                    text-shadow: 0 0 8px ${config.themeColor}88; /* Yazıda da hafif neon */
                    font-family: 'Inter', 'Roboto', 'Segoe UI', sans-serif;
                    font-size: 12px;
                    display: block;
                    margin-bottom: 5px;
                    text-transform: uppercase;
                }

                #ks-dynamic-tooltip {
                    width: 230px;
                    background: rgba(25, 25, 27, 0.85);
                    color: #e0e0e0;
                    text-align: left;
                    border-radius: 8px;
                    padding: 10px;
                    font-family: 'Inter', 'Roboto', 'Segoe UI', sans-serif;
                    font-size: 11px;
                    line-height: 1.5;
                    width: 230px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);

                    /* Yavaşça belirme ve kaybolma (Transition) */
                    transition: opacity 0.5s ease, transform 0.5s ease, visibility 0.5s;

                    /* Dinamik Renklendirme */
                    border: 1.5px solid ${config.themeColor};
                    animation: neonPulse 1s infinite ease-in-out; /* Sürekli ışıma efekti */

                    font-size: 11px;
                    line-height: 1.5;
                    pointer-events: none;


                    /* Animasyon ve Geçişler */
                    position: fixed;
                    z-index: 3179999;
                    pointer-events: none;
                    display: none;
                    opacity: 0;
                    transform: translateY(10px);
            }

            #ks-dynamic-tooltip.visible {
                display: block;
                opacity: 1;
                transform: translateY(0);
            }

            #ks-dynamic-tooltip strong {
                color: ${config.themeColor}; /* config'den gelen ana renk */
                text-shadow: 0 0 8px ${config.themeColor}88; /* Yazıda da hafif neon */
                font-size: 12px;
                margin-bottom: 5px;
                text-transform: uppercase;
            }

            /* Sayfadaki orijinal kutuları gizle ki çakışmasın */
            .ks-tooltip-box { display: none !important; }
            `;
        document.head.appendChild(style);
    };
    // 3. PANEL OLUŞTURMA VE MANTIK
    const initPanel = () => {
        const panel = document.createElement('div');
        panel.className = 'ks-draggable-panel';
        panel.id = 'ks-master-panel';
        panel.innerHTML = `
            <div class="ks-header" id="ks-header">
                <h4>PANEL</h4>
                <span style="font-size: 10px; opacity: 0.5;">▼</span>
            </div>
            <div class="ks-content">Loading...</div>
        `;
        document.body.appendChild(panel);
        const header = document.getElementById('ks-header');
        // --- A. KÜÇÜLTME/BÜYÜTME MANTIĞI ---
        header.addEventListener('dblclick', () => {
            panel.classList.toggle('collapsed');
            config.isCollapsed = panel.classList.contains('collapsed');
        });
        // --- B. SÜRÜKLEME MANTIĞI ---
        let isDragging = false;
        let offsetX, offsetY;
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - panel.getBoundingClientRect().left;
            offsetY = e.clientY - panel.getBoundingClientRect().top;
            panel.style.transition = 'none'; // Sürüklerken animasyonu kapat
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
            panel.style.right = 'auto'; // Sağ yapışıklığı iptal et
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                panel.style.transition = 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s ease';
            }
        });
    };

    // 2. Dinamik Panel Elementi
    const tooltip = document.createElement('div');
    tooltip.id = 'ks-dynamic-tooltip';
    document.body.appendChild(tooltip);

    // 3. Mantık
    document.addEventListener('mouseover', function(e) {
        const container = e.target.closest('.ks-tooltip-container');
        if (container) {
            const boxContent = container.querySelector('.ks-tooltip-box');
            if (boxContent) {
                tooltip.innerHTML = boxContent.innerHTML;
                tooltip.classList.add('visible');
                // Tema rengini CSS'ten çekip uygulama (Eğer dinamikse)
                const borderColor = getComputedStyle(boxContent).borderColor;
                tooltip.style.borderColor = borderColor;
                if (tooltip.querySelector('strong')) {
                    tooltip.querySelector('strong').style.color = borderColor;
                }
            }
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (tooltip.classList.contains('visible')) {
            const gap = 15;
            let x = e.clientX;
            let y = e.clientY;

            const tw = tooltip.offsetWidth;
            const th = tooltip.offsetHeight;

            let left = x - (tw / 2);
            let top = y - th - gap;

            // --- Akıllı Kenar Kontrolleri ---

            // Sol/Sağ taşma kontrolü
            if (left < 10) left = 10;
            if (left + tw > window.innerWidth - 10) left = window.innerWidth - tw - 10;

            // Üst taşma kontrolü (Eğer üstte yer yoksa altına açılır)
            if (top < 10) {
                top = y + gap + 20;
                tooltip.style.transform = 'translateY(-10px)'; // Alttan gelişi ayarla
            } else {
                tooltip.style.transform = 'translateY(0)';
            }

            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
        }
    });

    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.ks-tooltip-container')) {
            tooltip.classList.remove('visible');
        }
    });

    const WARNING_COLOR = '#ff7e7e';
    const SUCCESS_COLOR = '#00ff88';
    // Aktiflik kontrolü
    const PANEL_ID = 'ks-global-status-indicator';
    // Stil Tanımı (Sayfada bir kez olması yeterli)
    if (!document.getElementById(PANEL_ID + '-style')) {
        const style = document.createElement("style");
        style.id = PANEL_ID + '-style';
        style.innerText = `
            #${PANEL_ID} {
                animation: ks-glow 2s infinite ease-in-out;
                position: fixed !important;
                bottom: 0px !important;
                right: 0px !important;
                padding: 3px 12px !important;
                background-color: rgba(20, 20, 20, 0.8) !important;
                backdrop-filter: blur(8px) !important;
                color: #00ff88 !important;
                font-size: 11px !important;
                font-weight: bold !important;
                font-family: monospace !important;
                z-index: 3169999 !important;
                border-top: 2px solid rgba(0, 255, 136, 0.6) !important;
                border-left: 2px solid rgba(0, 255, 136, 0.6) !important;
                pointer-events: auto !important;
                cursor: default !important;
                transition: background 0.3s !important;
            }
            @keyframes ks-glow { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
        `;
        document.head.appendChild(style);
    }
    let currentIP = "IP Alınıyor...";
    const scriptVersion = (typeof GM_info !== 'undefined') ? " v" + GM_info.script.version : "";
    // IP'yi bir kez çek
    fetch('https://api.ipify.org?format=json').then(res => res.json()).then(data => {
        currentIP = data.ip;
    }).catch(() => {
        currentIP = "IP Kontrolü Engellendi";
    });
    // Paneli oluşturma ve ekleme fonksiyonu
    const injectPanel = () => {
        let kstatus = document.getElementById(PANEL_ID);
        // Eğer panel yoksa veya silindiyse tekrar oluştur
        if (!kstatus) {
            kstatus = document.createElement('div');
            kstatus.id = PANEL_ID;
            document.body.appendChild(kstatus);
        }
        kstatus.innerText = "KS TOOLS AKTİF";
        kstatus.onmouseover = () => {
            kstatus.innerText = `${currentIP} | ${scriptVersion} | AKTİF`;
            kstatus.style.backgroundColor = 'rgba(0, 255, 136, 0.9)';
            kstatus.style.color = '#000';
        };
        kstatus.onmouseout = () => {
            kstatus.innerText = "KS TOOLS AKTİF";
            kstatus.style.backgroundColor = 'rgba(20, 20, 20, 0.7)';
            kstatus.style.color = '#00ff88';
        };
    };
    // İŞTE ÇÖZÜM: 3 Saniyede bir kontrol et, yoksa geri getir
    setInterval(injectPanel, 3000);
    injectPanel();
    // Hızlı ve Panel takipli Ön giriş
    if (location.href.includes("otohasar") && location.href.includes("eks_hasar.php")) {
        /* ===== 1. PANEL VE STİL ===== */
        injectStyles();
        initPanel();
        config.bottom = "22px";
        config.width = "270px";
        config.collapsedWidth = "270px";
        // Globalde veya üst kapsamda oluşturduğumuz panel elementini seçiyoruz
        const panel = document.getElementById('ks-master-panel');
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            // Başlığı güncellemek isterseniz:
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Giriş Kontrol Paneli";
            // İçerik kısmını yeni HTML ile dolduruyoruz
            panelContent.innerHTML = `
            <div id="panelContent" style ="color:#ffffff; text-align:center;">⏳ Yükleniyor...</div>
            <hr style="border:0; border-top:1px solid #444; margin:2px 0;">
            <div style ="text-align:center; margin-bottom:8px; font-size:11px;"></div>

            <div class="ks-grid-container" style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; width: 100%;">

                <div class="ks-tooltip-container" onmouseover="handleHover(this)">
                    <button id="autoSelectBtn" class="ks-btn" style="width:100%; height: 100%;">
                        ⚡ Ön Giriş - Otomatik Seçim
                    </button>
                    <div class="ks-tooltip-box">
                        <strong>⚠️ Kontrol Listesi</strong><br>
                        Kaza ihbar türü, Eksper, Alkol durumu ve Ehliyet sınıfını doğrulamayı unutmayın.
                    </div>
                </div>

                    <button id="btnKaydetYeni" class="ks-btn-danger" style="width:100%; height: 100%;" onclick="c('kaydet();')">
                        💾 KAYDET
                    </button>

                <div class="ks-tooltip-container" style="grid-column: span 2;" onmouseover="handleHover(this)">
                    <button id="unlockSelectBtn" class="ks-btn" style="width:100%;">
                        🔓 Her Şeyi Aktif Et
                    </button>
                    <div class="ks-tooltip-box">
                        <strong>⚠️ Kritik İşlem</strong><br>
                        Site üzerindeki tüm etkileşimleri (buton, liste, kutu) aktifleştirir.
                    </div>
                </div>
            </div>

            <div style="display: none; position: fixed;">
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
                if (!g || !a || !y) return null;
                return new Date(y, a - 1, g);
            };

            // --- Not Sistemi Ayarları ---
            const storageKey = "page_note_" + window.location.href;
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
                    savePageNote(); // Bizim notu kaydet
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
                const watchFields = ['EKSPERTIZ_TARIHI_YIL', 'EKSPERTIZ_TALEP_TARIHI_YIL', 'HAS_ARAC_SAHIBI', 'HAS_TRAFIK_TARIHI_YIL', 'TRAMER_IHBAR_NO', 'SERVIS_ADI', 'SURUCU_YIL', 'EHLIYET_NO', 'EHLIYET_TARIHI_YIL', 'MILLI_R_NO', 'EKSPERTIZ_SURESI', 'EHLIYET_SINIFI', 'ONARIM_SURESI'];
                const selectFields = ['HASAR_ILCESI', 'KANAAT', 'EHLIYET_YERI', 'EHLIYET_YERI_ILCE','KAZA_SEKLI','DOLU_HASARI','FAR_AYNA_HASARI'];

                // 3. Şart Kontrolü: 1000'den küçükse boya
                if (cleanHasar < 1000) {

                    // Input ve Metin Alanları
                    watchFields.forEach(id => {
                        const el = document.getElementById(id) || document.getElementsByName(id)[0];
                        const td = el?.closest('td');
                        if (td) {
                            // getValue fonksiyonunun doğru çalıştığından emin olun,
                            // alternatifi: el.value.trim() === ''
                            td.style.backgroundColor = (getValue(id) === '') ? WARNING_COLOR : '';
                        }
                    });

                    // KM Kontrolü
                    const km = parseNum('HAS_KM');
                    const kmEl = document.getElementById('HAS_KM') || document.getElementsByName('HAS_KM')[0];
                    const kmTd = kmEl?.closest('td');
                    if (kmTd) kmTd.style.backgroundColor = km < 1 ? WARNING_COLOR : '';

                    // HASAR_SEKLI Kontrolü
                    const hasarSekliEl = document.getElementById('HASAR_SEKLI') || document.getElementsByName('HASAR_SEKLI')[0];
                    const hasarSekliTd = hasarSekliEl?.closest('td');
                    // 2. HASAR_SEKLI Renklendirme (Yeni talep: -1 ise renklendir)
                    if (hasarSekliTd) {
                        // Değer "-1" ise WARNING_COLOR yap, değilse temizle
                        hasarSekliTd.style.backgroundColor = (hasarSekliEl && hasarSekliEl.value === "-1") ? WARNING_COLOR : '';
                    }

                    // Piyasa Kontrolü
                    const piyasa = parseNum('HAS_PIYASA');
                    const piyasaEl = document.getElementById('HAS_PIYASA') || document.getElementsByName('HAS_PIYASA')[0];
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
                    const allFields = [...watchFields, ...selectFields, 'HAS_KM', 'HAS_PIYASA'];
                    allFields.forEach(id => {
                        const el = document.getElementById(id) || document.getElementsByName(id)[0];
                        const td = el?.closest('td');
                        if (td) td.style.backgroundColor = '';
                    });
                }
            }

            let generatedUrl = "";
            /* ===== 4. PANEL GÜNCELLEME ===== */
            function updatePanel() {
                let html = '<table style="width:100%; border-collapse:collapse; font-size:13px; color:white;">';
                const hasar = getDate('HASAR_TARIHI');
                const bas = getDate('SB_POLICE_BAS');
                const bitis = getDate('SB_POLICE_BITIS');

                if (hasar && bas && bitis) {
                    hasar.setHours(0, 0, 0, 0);
                    bas.setHours(0, 0, 0, 0);
                    bitis.setHours(0, 0, 0, 0);

                    html += `<tr><td colspan="2" style="text-align:center; padding:10px;">`;

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
                        html += `<span style="background:red; color:white; padding:2px 5px; border-radius:3px;">`;
                        html += `Vade ${yon} ${diff} gün fark var!`;
                        html += `</span>`;
                    }

                    html += `</td></tr>`;
                }
                html += `<tr><td colspan="2"><hr style="border:0; border-top:1px solid #444; margin:2px 0;"></td></tr>`;

                const sigortaElement = document.getElementById('SIGORTA_SEKLI');
                let dynamicLabel = 'Sigortalı/Kaskolu Araç'; // Varsayılan etiket

                if (sigortaElement) {
                    const selectedText = sigortaElement.options[sigortaElement.selectedIndex]?.text || "";
                    let sigortaColor = "#ff9500";

                    if (selectedText.toUpperCase().includes("TRAFİK")) {
                        sigortaColor = "#00d4ff";
                        dynamicLabel = 'Sigortalı Araç'; // Trafik ise sadece Sigortalı
                    } else if (selectedText.toUpperCase().includes("KASKO")) {
                        sigortaColor = "#9c88ff";
                        dynamicLabel = 'Kaskolu Araç'; // Kasko ise sadece Kaskolu
                    }

                    const sigortaSpan = `<span style="color:${sigortaColor}; font-weight:bold;">${selectedText}</span>`;

                    html += `<tr>
                                <td style="color:white;">Sigorta Şekli</td>
                                <td style="text-align:right; font-size:11px;">
                                    ${sigortaSpan}
                                </td>
                             </tr>`;
                }
                // 1. Rücu Durum Kontrolleri
                const rucuVar = document.getElementById('RUCU1')?.checked;
                const rucuYok = document.getElementById('RUCU0')?.checked;

                // 2. Renk ve Metin Belirleme🔘🟢🔴🟠
                let rucuStatus = "";

                if (rucuVar) {
                    rucuStatus = `<span style="color:#e74c3c; font-weight:bold; font-size:13px;">Var 🔴</span>`; // Yeşil
                } else if (rucuYok) {
                    rucuStatus = `<span style="color:#2ecc71; font-weight:bold;">Yok 🟢</span>`; // Kırmızı
                } else {
                    // İkisi de seçili değilse
                    rucuStatus = `<span style="color:#ff9500; font-weight:bold;">Seçili Değil 🔘</span>`; // Turuncu/İtalik
                }

                // 3. Panele Ekleme
                html += `<tr>
                            <td style="color:white; padding: 4px 0;">Rücu Durumu</td>
                            <td style="text-align:right; font-size:11px;">
                                ${rucuStatus}
                            </td>
                         </tr>`;
                // 1. PERT Durum Kontrolü (ID'yi küçük harf 'pert' yaparak eşitledik)
                const pertElement = document.getElementById('pert');
                const pertVar = pertElement ? pertElement.checked : false;

                // 2. Renk ve Metin Belirleme
                let pertStatus = "";

                if (pertVar) {
                    // İşaretliyse
                    pertStatus = `<span style="color:#e74c3c; font-weight:bold; font-size:13px;">Var 🔴</span>`;
                } else {
                    // İşaretli değilse
                    pertStatus = `<span style="color:#2ecc71; font-weight:bold;">Yok 🟢</span>`;
                }

                // 3. Panele Ekleme
                html += `<tr>
                            <td style="color:white; padding: 4px 0;">Pert Durumu</td>
                            <td style="text-align:right; font-size:11px;">
                                ${pertStatus}
                            </td>
                         </tr>`;

                const ihbarElement = document.getElementById('KAZA_IHBAR_TURU');
                if (ihbarElement) {
                    const selectedText = ihbarElement.options[ihbarElement.selectedIndex]?.text || "";
                    const selectedValue = ihbarElement.value;

                    // Profesyonel ve Ayırt Edici Renk Paleti
                    let ihbarColor = "#ffffff";

                    switch (selectedValue) {
                        case "1": // ANLAŞMALI KAZA TESPİT TUTANAĞI
                            ihbarColor = "#2ecc71"; // Canlı Yeşil (Uzlaşma rengi)
                            break;
                        case "2": // BEYAN
                            ihbarColor = "#f1c40f"; // Günışığı Sarısı (Standart işlem)
                            break;
                        case "3": // KARAKOL MÜRACAAT TUTANAĞI
                            ihbarColor = "#3498db"; // Gökyüzü Mavisi (Resmiyet rengi)
                            break;
                        case "4": // TRAFİK KAZA TUTANAĞI
                            ihbarColor = "#e74c3c"; // Alizarin Kırmızı (Kritik/Resmi kaza)
                            break;
                        case "5": // SAVCILIK BİLİRKİŞİ RAPORU
                            ihbarColor = "#9b59b6"; // Amethyst Moru (Hukuki süreç)
                            break;
                        case "6": // İTFAİYE RAPORU
                            ihbarColor = "#e67e22"; // Havuç Turuncusu (Acil durum)
                            break;
                        default:
                            ihbarColor = "#bdc3c7"; // Gümüş Gri (Tümü/Belirsiz)
                    }

                    const ihbarSpan = `<span style="color:${ihbarColor}; font-weight:bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${selectedText}</span>`;

                    html += `<tr>
                                <td style="color:white; padding: 4px 0;">İhbar Türü</td>
                                <td style="text-align:right; font-size:11px; padding: 4px 0;">
                                    ${ihbarSpan}
                                </td>
                             </tr>`;
                }
                const servisAdi = getValue('SERVIS_ADI');
                if (servisAdi) {
                    // 1. Durum Kontrolleri
                    const isYetkili = document.getElementsByName('SERVIS_TUR_ID1')[0]?.checked;
                    const isAnlasmali = document.getElementById('ANLASMALI1')?.checked;
                    // 2. Renkli Etiketlerin Oluşturulması
                    // Yetkili/Anlaşmalı: Mavi (#00d4ff), Yetkisiz/Anlaşmasız: Turuncu (#ff9500)
                    const turSpan = isYetkili ? `<span style="color:#00d4ff; font-weight:bold;">Yetkili</span>` : `<span style="color:#ff9500; font-weight:bold;">Yetkisiz</span>`;
                    const anlasmaSpan = isAnlasmali ? `<span style="color:#00d4ff; font-weight:bold;">Anlaşmalı</span>` : `<span style="color:#ff9500; font-weight:bold;">Anlaşmasız</span>`;
                    // 3. Panele Ekleme (Yan yana ve ayraçlı)
                    html += `<tr>
                                <td style="color:white;">Servis Tipi</td>
                                <td style="text-align:right; font-size:11px;">
                                    ${turSpan} <span style="color:#666">|</span> ${anlasmaSpan}
                                </td>
                             </tr>`;
                }
                html += `<tr><td colspan="2"><hr style="border:0; border-top:1px solid #444; margin:2px 0;"></td></tr>`;
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
                    { label: 'Tramer', id: "TRAMER_IHBAR_NO" },
                    { label: 'Sigortalı', id: "HAS_ARAC_SAHIBI" },
                    { label: dynamicLabel, id: "HAS_MODEL_ADI" },
                    { label: 'Servis', id: "SERVIS_ADI" },
                    { label: 'Piyasa', id: "HAS_PIYASA" }
                ];

                fields.forEach(f => {
                    // Önce ID ile ara, bulamazsan NAME niteliği ile ara
                    let element = document.getElementById(f.id) || document.getElementsByName(f.id)[0];

                    let raw = "";
                    if (element) {
                        // Input ise .value, değilse textContent al
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
                        } else {
                            valStr = raw;
                        }
                    }

                    html += `<tr>
                                <td style="color:white; padding: 4px 0; white-space:nowrap;">${f.label}</td>
                                <td style="text-align:right; color:${color}; font-weight:bold;">${valStr}<span style="margin-left:5px;">${status}</span></td>
                             </tr>`;
                });

                html += `<tr><td colspan="2"><hr style="border:0; border-top:1px solid #444; margin:2px 0;"></td></tr>`;
                const oran = hasPiyasa > 0 ? (tahminiHasar / hasPiyasa) * 100 : 0;
                let durum = '⚠️ Piyasa?';
                let durumColor = 'white';
                if (hasPiyasa >= 1000) {
                    if (oran <= 30) {
                        durum = '✅ Uygun';
                        durumColor = SUCCESS_COLOR;
                    }
                    else if (oran <= 60) {
                        durum = '🟠 %30 Üstü';
                        durumColor = '#ffa500';
                    }
                    else {
                        durum = '🔴 %60 Üstü (Pert)';
                        durumColor = '#ff4d4d';
                    }
                }
                html += `<tr><td style="color:white;">Eksper Hasar:</td><td style="text-align:right; color:${durumColor}">${tahminiHasar.toLocaleString()} | ${durum}</td></tr>`;
                html += `<tr><td style="color:white;">Muallak:</td><td style="text-align:right; color:white;">${ssTahmini.toLocaleString()}</td></tr>`;
                html += `</table>`;

                function buildTargetUrl() {
                    // 1. YARDIMCI: Metin içindeki ilk 4 haneli yılı bulur
                    const extractYear = (str) => {
                        const match = String(str).match(/\b(19|20)\d{2}\b/);
                        return match ? match[0] : "";
                    };

                    const sigortaSelect = document.getElementById('SIGORTA_SEKLI');
                    const sigortaTipi = sigortaSelect ? sigortaSelect.value : "";

                    let m = "", yRaw = "", kStr = "0";

                    // --- VERİ ÇEKME: TRAFİK (Tablo) veya KASKO (ID) ---
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
                        resBox.innerHTML = "❌ Hata: Kaynak kod dış sitelere erişim izni alamadı.";
                        return;
                    }

                    const targetUrl = buildTargetUrl();
                    if (!targetUrl) {
                        resBox.innerHTML = "❌ Hata: URL oluşturulamadı!";
                        return;
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
                                        resBox.innerHTML = "🛡️ Bot engeli! Site arka planda veri çekmemize izin vermiyor.";
                                        return;
                                    }

                                    const priceElements = doc.querySelectorAll('.searchResultsPriceValue');
                                    const prices = [...priceElements].map(el => parseInt(el.innerText.replace(/\D/g, ''))).filter(n => n > 10000);

                                    if (prices.length > 0) {
                                        const avg = Math.round(prices.reduce((a, b) => a + b) / prices.length);
                                        resBox.innerHTML = `✅ <b>${prices.length} ilan bulundu.</b><br>💰 Ort: <b>${avg.toLocaleString('tr-TR')} TL</b>`;
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
                        resBox.innerHTML = "❌ Hata: Kaynak kod dış sitelere erişim izni alamadı.<br><small>${targetUrl}</small>";
                        return;
                    }
                    try {
                        const targetUrl = buildTargetUrl();
                        const resBox = document.getElementById('shb-res-box');

                        if (targetUrl) {
                            if (resBox) resBox.innerHTML = `🔗 <small>${targetUrl}</small>`;
                            window.open(targetUrl, '_blank');
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
                                    el.dispatchEvent(new Event('change',
                                        {
                                            bubbles: true
                                        }));
                                }
                            };
                            const clickCb = (id) => {
                                const el = $(id);
                                if (el) {
                                    el.checked = false;
                                    el.click();
                                }
                            };
                            ['SURUCU_BELGE_TIPI1', 'SURUCU_BELGESI0', 'RUHSAT_ASLI1', 'TESPIT_SEKLI0', 'SURUCU_BELGESI_GORULDU1', 'EHLIYET_YETERLI1', 'ALKOL_DURUMU2'].forEach(clickCb);
                            setVal('HAS_ARAC_SAHIBI', getValue('SB_SIGORTALI_ADI_C'));
                            setVal('MILLI_R_NO', getValue('IHBAR_TARIHI_YIL'));
                            setVal('ONARIM_SURESI', '10');
                            setVal('EKSPERTIZ_SURESI', '1');
                            setVal('KUSUR_ORANI', '100');
                            setVal('UZAKTAN_EKSPERTIZ', '2');
                            setVal('EHLIYET_SINIFI', 'B');
                            const setSelectText = (id, txt) => {
                                const el = $(id);
                                if (!el) return;
                                const opt = [...el.options].find(o => o.text.includes(txt));
                                if (opt) {
                                    el.value = opt.value;
                                    el.dispatchEvent(new Event('change',
                                        {
                                            bubbles: true
                                        }));
                                }
                            };
                            setSelectText('KAZA_IHBAR_TURU', 'ANLAŞMALI KAZA');
                            setSelectText('KANAAT', 'OLUMLUDUR');
                            console.log('✅ Otomatik seçimler tamamlandı.');
                        });
                         /* ===== 5. OTOMATİK SEÇİM BUTONU ===== */
           document.getElementById('unlockSelectBtn').addEventListener('click', (e) => {
                    // 1. Disabled attribute'una sahip tüm elementleri bul
                    const disabledElements = document.querySelectorAll('[disabled], .disabled');

                    disabledElements.forEach(el => {
                        el.disabled = false;
                        el.removeAttribute('disabled');
                        el.classList.remove('disabled');
                        // Bazı siteler pointer-events: none kullanır, onu da çözelim:
                        el.style.pointerEvents = 'auto';
                        el.style.opacity = '1';
                    });

                    // 2. Readonly olanları düzenlenebilir yap
                    const readOnlyElements = document.querySelectorAll('[readonly]');
                    readOnlyElements.forEach(el => {
                        el.readOnly = false;
                        el.removeAttribute('readonly');
                    });

            });
            setInterval(highlightFields, 1500);
            setInterval(updatePanel, 2000);
        }
    }
    // Hızlı Referans açma Otohasar
    if (window.location.href.includes('otohasar') && location.href.includes("eks_hasar_yp_list_yp_talep.php")) {
        injectStyles();
        initPanel();
        config.bottom = "22px";
        config.width = "250px"; // İki buton yan yana sığsın diye genişliği artırdık
        config.collapsedWidth = "250px";

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

                    // Sayfadaki mevcut input kutularını sayalım (YP_AD_1, YP_AD_2... şeklinde gidenler)
                    let availableFields = [];
                    for (let j = 1; j <= 20; j++) { // Maksimum 20 kutu kontrolü
                        const field = document.all(`YP_AD_${j}`);
                        if (field) {
                            availableFields.push(field);
                        }
                    }

                    const inputCount = availableFields.length;
                    const lineCount = lines.length;

                    // --- UYARI MEKANİZMASI ---
                    if (lineCount !== inputCount) {
                        const confirmAction = confirm(`Dikkat: Sayı Uyuşmazlığı!\n\nExcel'den gelen satır: ${lineCount}\nSayfadaki kutu sayısı: ${inputCount}\n\nYine de devam etmek istiyor musunuz?`);
                        if (!confirmAction) return; // Kullanıcı iptal ederse işlemi durdur
                    }

                    // --- DOLDURMA İŞLEMİ ---
                    lines.forEach((line, i) => {
                        if (i < inputCount) {
                            availableFields[i].value = line;
                        }
                    });

                    btnPaste.innerText = "✔️ OK";
                    btnPaste.style.backgroundColor = "#28a745"; // Başarılı renk
                    setTimeout(() => {
                        btnPaste.innerText = "📋 YAPIŞTIR";
                        btnPaste.style.backgroundColor = ""; // Eski rengine dön
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
                        return firstTd && firstTd.classList.contains('acik') && tr.querySelectorAll('td').length >= 5;
                    });

                    let excelData = rows.map(tr => {
                        const tds = Array.from(tr.querySelectorAll('td.acik'));
                        // İlk 5 hücreyi al (Sıra, Parça Adı, Kod, Eksper Notu, Tedarikçi Notu)
                        const rowData = tds.slice(0, 5).map(td => td.innerText.trim());
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

            // Butonları ekle
            contentArea.appendChild(btnPaste);
            contentArea.appendChild(btnCopy);
        }
    }
        // Hızlı Referans açma Otohasar
    if (window.location.href.includes('otohasar') && location.href.includes("eks_hasar_yp_list.php")) {
        injectStyles();
        initPanel();
        config.bottom = "22px";
        config.width = "250px"; // İki buton yan yana sığsın diye genişliği artırdık
        config.collapsedWidth = "250px";

        const panel = document.getElementById('ks-master-panel');
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            // Başlığı güncellemek isterseniz:
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Excell Panel";
        }

        const contentArea = document.querySelector('.ks-content');
        if (contentArea) {
            contentArea.innerHTML = `
                        <div class="ks-tooltip-container" onmouseover="handleHover(this)">
                <button id="unlockSelectBtn" class="ks-btn" style="width:100%;">
                    🔓 Her Şeyi Aktif Et
                </button>
                <div class="ks-tooltip-box">
                    <strong>⚠️ Dikkat ⚠️</strong>
                    Zorunda kalmadıkça bu buton özelliğini kullanmayınız.
                    Site üzerindeki tüm etkileşimleri aktifleştirir (Buton, yazı kutusu, liste kutusu vs...).
                </div>
            </div>`;

            document.getElementById('unlockSelectBtn').addEventListener('click', (e) => {
                    // 1. Disabled attribute'una sahip tüm elementleri bul
                    const disabledElements = document.querySelectorAll('[disabled], .disabled');

                    disabledElements.forEach(el => {
                        el.disabled = false;
                        el.removeAttribute('disabled');
                        el.classList.remove('disabled');
                        // Bazı siteler pointer-events: none kullanır, onu da çözelim:
                        el.style.pointerEvents = 'auto';
                        el.style.opacity = '1';
                    });

                    // 2. Readonly olanları düzenlenebilir yap
                    const readOnlyElements = document.querySelectorAll('[readonly]');
                    readOnlyElements.forEach(el => {
                        el.readOnly = false;
                        el.removeAttribute('readonly');
                    });

            });
        }
    }
    // Hızlı Manuel Parça girişi
    if (location.href.includes("otohasar") && location.href.includes("eks_hasar_yedpar_yeni_ref")) {
        function initPanel() {
            if (document.getElementById("tm-panel")) return;
            /* ===== 1. STYLES ===== */
            const style = document.createElement("style");
            style.innerHTML = `
            #tm-panel {
                position: fixed; top: 0; left: 0; width: 100%;
                background: rgba(25, 25, 25, 0.85); color: #fff;
                z-index: 3169999; padding: 5px;
                display: flex; justify-content: center; align-items: center;
                gap: 5px; font-family: Arial, sans-serif;
                box-shadow: 0 2px 5px rgba(0,0,0,.5);
                backdrop-filter: blur(4px);
            }
            #tm-panel input { padding: 6px; border-radius: 4px; border: 1px solid #ccc; width: 130px; color: #000; }
            #tm-panel button {
                padding: 6px 12px; border-radius: 4px; border: none;
                cursor: pointer; font-size: 12px; font-weight: bold;
                color: #fff; transition: opacity 0.2s;
            }
            #tm-panel button:hover:not(:disabled) { opacity: 0.8; }
            #tm-panel button:disabled { background: #666 !important; cursor: not-allowed; }

            /* Tooltip */
            #tm-panel button[data-tip]:hover::after {
                content: attr(data-tip); position: absolute; bottom: 120%;
                left: 50%; transform: translateX(-50%); background: #333;
                padding: 5px; border-radius: 4px; font-size: 11px; white-space: nowrap;
            }

            #tm-panel input[type="radio"] {
            width: auto !important; /* Genişliği zorla daralttık */
            margin: 0 2px 0 0 !important; /* Sadece sağ tarafa çok az boşluk */
            cursor: pointer;
            }

            .btn-new { background: #2196F3; }
            .btn-ok { background: #4CAF50; }
            .btn-orange { background: #FF9800; color: #000; }
            .btn-purple { background: purple; color: #000; }
            .btn-rpr { background: #FF5722; }
            /* Yeni Renkler */
            .btn-danger { background: #F44336; color: white; }     /* Kırmızı - İptal/Sil */
            .btn-info { background: #00BCD4; color: black; }       /* Turkuaz - Bilgi */
            .btn-dark { background: #37474F; color: white; }       /* Antrasit - Arşiv */
            .btn-lime { background: #CDDC39; color: black; }       /* Lime - Taslak */
            .btn-amber { background: #FFC107; color: black; }      /* Kehribar - Dikkat */
            .btn-indigo { background: #3F51B5; color: white; }     /* İndigo - Paylaş/Gönder */
            .btn-teal { background: #009688; color: white; }       /* Su Yeşili - Güncelle */
            .btn-brown { background: #795548; color: white; }      /* Kahve - Geçmiş/Log */
            .btn-gold { background: #D4AF37; color: black; }       /* Altın - Premium/Öncelikli */

            @keyframes blink { 0%, 100% { background: #2196F3; opacity: 1; } 50% { background: #ff5722; opacity: 0.5; } }
            .blink { animation: blink 1s infinite; background: #FF9800; }
        `;
            document.head.appendChild(style);
            /* ===== 2. PANEL HTML ===== */
            const panel = document.createElement("div");
            panel.id = "tm-panel";
            panel.innerHTML = `
            <button id="bYeni" class="btn-new" data-tip="Girişleri Temizle">Yeni</button>
            <input id="tm_kod" placeholder="Parça Kodu">
            <input id="tm_ad" placeholder="Parça Adı" style="width:160px;">
            <input id="tm_fiyat" type="number" placeholder="Fiyat" style="width:80px;" step="0.01">
            <input id="tm_adet" type="number" value="1" style="width:45px;" min="1">

            <div style="display:flex; gap: 4px; align-items: center; margin: 0 2px; border-left: 1px solid #555; padding-left: 4px;">
                <label><input type="radio" name="islemTipi" value="degisim" checked>Degişim</label>
                <label><input type="radio" name="islemTipi" value="onarim">Onarım</label>
            </div>

            <button id="b0" class="btn-ok">Kaporta - Ön</button>
            <button id="b1" class="btn-ok">Kaporta - Yan</button>
            <button id="b2" class="btn-purple">Mekanik</button>
            <button id="b3" class="btn-purple">Elektrik</button>
            <button id="b4" class="btn-orange">Cam</button>
            <button id="b6" class="btn-indigo">Motorsiklet</button>
            <button id="b5" class="btn-rpr">Genel Onarım</button>
        `;
            document.body.appendChild(panel);
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
                    if (el) {
                        clearInterval(interval);
                        resolve(el);
                    }
                }, 100);
            });
            const selectValue = async (id, val) => {
                try {
                    // 1. Elementin sayfada oluşmasını bekle
                    const s = await waitFor(() => $(id));
                    if (!s) throw new Error(`Element bulunamadı: ${id}`);

                    // 2. Aranan değerin listede görünmesini bekle (Daha güvenli kontrol)
                    await waitFor(() => {
                        return s.options && Array.from(s.options).some(o => o.value == val);
                    }, 2000); // Opsiyonel: 5 saniye zaman aşımı ekleyebilirsin
                    // 3. Değeri ata
                    s.value = val;
                    // 4. Change event'ini hem 'change' hem 'input' olarak tetikle (Bazı frameworkler için gereklidir)
                    const eventConfig = { bubbles: true, cancelable: true };
                    s.dispatchEvent(new Event("change", eventConfig));
                    s.dispatchEvent(new Event("input", eventConfig));

                    console.log(`✅ Seçim başarılı: ${id} -> ${val}`);
                } catch (err) {
                    console.error(`❌ seçim hatası (${id}):`, err.message);
                }
            };
            const degisonar = () => {
                // 1. Hangi radyo butonunun seçili olduğunu bul
                const selectedRadio = document.querySelector('input[name="islemTipi"]:checked');

                if (!selectedRadio) {
                    console.warn("Lütfen bir işlem tipi seçin.");
                    return;
                }

                const tip = selectedRadio.value; // "degisim" veya "onarim"

                // 2. Hedef Checkbox'ları belirle
                const checkboxDegisim = document.getElementById("DEGISIM");
                const checkboxTamir = document.getElementById("TAMIR");

                if (tip === "degisim") {
                    // Eğer Değişim seçili değilse tıkla (Fonksiyonu tetikle)
                    if (checkboxDegisim && !checkboxDegisim.checked) {
                        checkboxDegisim.click();
                    }
                    // Değişim seçildiğinde Onarım'ı kapatmak gerekirse (Opsiyonel):
                    if (checkboxTamir && checkboxTamir.checked) {
                        checkboxTamir.checked = false; // Veya .click()
                    }
                }
                else if (tip === "onarim") {
                    // Eğer Onarım (Tamir) seçili değilse tıkla
                    if (checkboxTamir && !checkboxTamir.checked) {
                        checkboxTamir.click();
                    }
                    // Onarım seçildiğinde Değişim'i kapatmak gerekirse (Opsiyonel):
                    if (checkboxDegisim && checkboxDegisim.checked) {
                        checkboxDegisim.checked = false;
                    }
                }
            };
            /* ===== 4. CORE ACTIONS ===== */
           const MainFields = () => {
                // Kontrol edilecek zorunlu alanlar (Adet ve ID hariç)
                const zorunluAlanlar = [
                    { ref: refs.kod, label: "Parça Kodu" },
                    { ref: refs.ad, label: "Adı" },
                    { ref: refs.fiyat, label: "Fiyat" }
                ];

                // Eksik alan kontrolü
                const eksikAlan = zorunluAlanlar.find(alan => !alan.ref.value || alan.ref.value.trim() === "");

                if (eksikAlan) {
                    alert(`Lütfen eksik alanları doldurun: ${eksikAlan.label}`);
                    return; // İşlemi durdurur, giriş yapmaz
                }

                // Eğer tüm alanlar doluysa atama işlemlerine geçer:
                if ($("PARCA_KODU")) $("PARCA_KODU").value = refs.kod.value;
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
                await selectValue("SISTEM_NOTU_ID", "2");
                if ($("NOTLAR")) $("NOTLAR").value = "KODSUZ PARÇA";
                selectValue("SIPARIS_VERMEME_SEBEP_ID", "2");
            }
           const submitForm = () => {
               // HTML'deki orijinal submit mantığı
               if (typeof window.sbmt_frm === "function" && window.sbmt_frm()) {
                   if (typeof window.doraSiparisSecenek === "function") {
                       if (window.doraSiparisSecenek()) {
                           if (document.yedparforhasar) {
                               document.yedparforhasar.submit();
                           }
                       }
                   } else {
                       if (document.yedparforhasar) {
                           document.yedparforhasar.submit();
                       }
                   }
               }
           };

            /* ===== 5. EVENT HANDLERS ===== */
            // Yeni Butonu & Temizleme
            refs.bYeni.onclick = () => {
                // 1. Orijinal fonksiyonu çağır
                if (typeof window.yeni_kayit === "function") window.yeni_kayit('');
                // 2. Elemanları döngüye almadan önce filtrele (null olanları ele)
                [refs.kod, refs.ad, refs.fiyat].filter(input => input !== null && input !== undefined).forEach(input => {
                    input.value = "";
                });
                // 3. Blink efektini kaldır ve focus yap
                if (refs.bYeni) refs.bYeni.classList.remove("blink");
                if (refs.kod) refs.kod.focus();
            };
            /*const sipSec0 = await waitFor(() => $("SIP_SEC_0"));
                sipSec0.checked = true;
                await selectValue("SIPARIS_VERMEME_SEBEP_ID", "9");
                if ($("NOTLAR_SIPARIS")) $("NOTLAR_SIPARIS").value = "TEDARİK YOK";
                submitForm();*/
            // Kaporta ön
            $("b0").onclick = async () => {
                degisonar();
                await MainFields();
                await SideFields("10","777");
                submitForm();
                setTimeout(() => { submitForm(); }, 400);
            };
            // Kaporta yan
            $("b1").onclick = async () => {
                degisonar();
                await MainFields();
                await SideFields("11","852");
                submitForm();
                setTimeout(() => { submitForm(); }, 400);
            };
            // Mekanik
            $("b2").onclick = async () => {
                degisonar();
                await MainFields();
                await SideFields("2","645");
                submitForm();
                setTimeout(() => { submitForm(); }, 400);
            };
            // Elektrik
            $("b3").onclick = async () => {
                degisonar();
                await MainFields();
                await SideFields("4","686");
                submitForm();
                setTimeout(() => { submitForm(); }, 400);
            };
            // Cam
            $("b4").onclick = async () => {
                degisonar();
                await MainFields();
                await SideFields("17","934");
                submitForm();
                setTimeout(() => { submitForm(); }, 400);
            };
            // MOTORSİKLET
            $("b6").onclick = async () => {
                degisonar();
                await MainFields();
                await SideFields("29","554");
                submitForm();
                setTimeout(() => { submitForm(); }, 400);
            };
            // Genel Onarım********************************************/////
            $("b5").onclick = async () => {
                const fiyat = refs.fiyat.value.replace(",", ".");
                if ($("BIRIM_FIYAT_GERCEK")) $("BIRIM_FIYAT_GERCEK").value = fiyat;
                if ($("BIRIM_FIYAT_TALEP")) $("BIRIM_FIYAT_TALEP").value = fiyat;

                await selectValue("GRUP_ID", "6");
                await selectValue("ANA_GRUP", "495");
                submitForm();
            };
            // 1. Kontrolü yapan ana fonksiyon
            const checkBlink = () => {
                const input = document.getElementById("PARCA_KODU");
                const hasValue = input.value.trim() !== "";
                const isDisabled = input.disabled || input.readOnly;
                // Eğer değer varsa VEYA kutu kilitliyse blink ekle
                if (hasValue || isDisabled) {
                    refs.bYeni.classList.add("blink");
                }
                else {
                    refs.bYeni.classList.remove("blink");
                }
            };
            // 2. Sayfa ilk açıldığında çalıştır (Mevcut value/disabled kontrolü için)
            checkBlink();
            // 3. Dinamik değişiklikleri dinle
            document.addEventListener('input', (e) => {
                if (e.target.id === "PARCA_KODU") {
                    checkBlink();
                }
            });
        }
        // Başlatıcı
        if (document.readyState === "complete") {
            initPanel();
        }
        else {
            window.addEventListener('load', initPanel);
        }
    }
    // Hızlı Çoklu Parça girişi
    if (location.href.includes("otohasar") && location.href.includes("eks_hasar_yedpar_multi") && !location.href.includes("eks_hasar_yedpar_multi_form")) {
        /* ===== 1. PANEL VE STİLLER ===== */
        const style = document.createElement('style');
        style.innerHTML = `
        #multi-action-panel {
            position: fixed; bottom: 22px; right: 0; z-index: 3169999;
            background: rgba(0,0,0,0.75); padding: 10px; border-radius: 2px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 4px;
        }
        #multi-action-panel button {
            background: #34495e; color: white; border: 1px solid #5d6d7e;
            padding: 4px 4px; font-size: 11px; font-weight: bold; cursor: pointer;
            border-radius: 2px; transition: background 0.2s; text-align: center;
        }
        #multi-action-panel button:hover { background: #1abc9c; border-color: #16a085; }
    `;
        document.head.appendChild(style);
        const panel = document.createElement('div');
        panel.id = 'multi-action-panel';
        panel.innerHTML = `
        <button id="btnAmblem">💎 GRUP → AMBLEM SEÇ</button>
        <button id="btnAnaGrup">🏷️ ANA GRUP → ETİKET (1632)</button>
        <button id="btnExcelCopy">📋 EXCEL İÇİN KOPYALA (TÜMÜ)</button>
    `;
        document.body.appendChild(panel);
        /* ===== 2. GENEL SEÇİM FONKSİYONU ===== */
        function bulkSelect(prefix, criteria) {
            // Sadece ID'si ilgili prefix ile başlayan selectleri hedefle
            const selectors = document.querySelectorAll(`select[id^="${prefix}"]`);
            selectors.forEach(sel => {
                let targetValue = null;
                if (typeof criteria === 'function') {
                    // Metin içeriğine göre ara (Amblem gibi)
                    const opt = Array.from(sel.options).find(o => criteria(o.text.toUpperCase()));
                    if (opt) targetValue = opt.value;
                }
                else {
                    // Doğrudan value eşleşmesine bak (1632 gibi)
                    targetValue = criteria;
                }
                if (targetValue && sel.value !== targetValue) {
                    sel.value = targetValue;
                    sel.dispatchEvent(new Event('change',
                        {
                            bubbles: true
                        }));
                }
            });
        }
        /* ===== 3. EVENT LISTENERS ===== */
        document.getElementById('btnAmblem').addEventListener('click', () => {
            bulkSelect('GRUP_ID', (text) => text.includes('AMBLEM'));
        });
        document.getElementById('btnAnaGrup').addEventListener('click', () => {
            bulkSelect('ANA_GRUP', '1632');
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
    if (location.href.includes("otohasar") && location.href.includes("multi_file_upload")) {
    const getSistemAyarlari = () => {
        const text = document.body.innerText.toUpperCase();
        const url = location.href.toLowerCase();

        // VARSAYILAN AYARLAR (Atlas, Hepiyi, Doğa vb.)
        const varsayilan = {
            EHLİYET: ['1'],
            RUHSAT: ['7'],
            KTT: '174',
            BEYAN: '155',
            ZABIT: '5',
            POLICE: '3',
            IMZA: '131',
            SICIL: '202',
            IRSALIYE: '26',
            NUFUS: '2',
            DIGER: '12',
            ONARIM_SONRASI: '32',
            MUTABAKAT: '28',
            IBRA:'33',
            ALKOL: '4',
            RAYIC: '49',
            TRAMER: '48',
            MASAK: '162'
        };

        // MAPFRE ÖZEL AYARLARI
        const mapfre = {
            EHLİYET: ['121', '120'],
            RUHSAT: ['143', '144'],
            KTT: '36',
            BEYAN: '6',
            ZABIT: '5',
            POLICE: '3',
            IMZA: '8',
            SICIL: '40',
            IRSALIYE: '41',
            NUFUS: '2',
            DIGER: '12',
            ONARIM_SONRASI: '18',
            MUTABAKAT: '28',
            IBRA:'33',
            ALKOL: '4',
            RAYIC: '49',
            TRAMER: '48',
            MASAK: '162'
        };

        return (text.includes("MAPFRE") || url.includes("mapfre")) ? mapfre : varsayilan;
    };

    const ayarlar = getSistemAyarlari();

    // Tooltip Stil Tanımlaması
    const style = document.createElement('style');
    style.innerHTML = `
        .ks-tooltip-container { position: relative; display: inline-block; width: 100%; }
        .ks-tooltip-box {
            display: none; position: absolute; background: #333; color: #fff;
            padding: 5px; border-radius: 4px; font-size: 10px; z-index: 10000;
            width: 140px; bottom: 125%; left: 50%; transform: translateX(-50%);
            border: 1px solid #555; pointer-events: none;
        }
        .ks-tooltip-container:hover .ks-tooltip-box { display: block; }
    `;
    document.head.appendChild(style);

    // 1. SAĞ ÜST MİNİ PANEL
    function initGeneralPanel() {
        if (document.getElementById('file-upload-mini-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'file-upload-mini-panel';
        Object.assign(panel.style, {
            position: 'fixed', bottom: '25px', right: '5px', background: 'rgba(0,0,0,0.9)',
            borderRadius: '4px', padding: '5px', zIndex: '2147483647',
            display: 'flex', flexDirection: 'column', gap: '4px', width: '95px', border: '1px solid #555'
        });
        document.body.appendChild(panel);

        const createMiniBtn = (text, color, targetSelector, val, tooltipTitle, tooltipDesc) => {
            const container = document.createElement('div');
            container.className = 'ks-tooltip-container';

            const btn = document.createElement('button');
            btn.innerText = text;
            Object.assign(btn.style, {
                background: color, border: '0', borderRadius: '2px', color: "white",
                cursor: 'pointer', fontWeight: "bold", padding: '4px 2px', fontSize: '9px', width: '100%'
            });

            const tip = document.createElement('div');
            tip.className = 'ks-tooltip-box';
            tip.innerHTML = `<strong>${tooltipTitle}</strong><br>${tooltipDesc}`;

            btn.onclick = () => {
                document.querySelectorAll(targetSelector).forEach(sel => {
                    sel.value = val;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                });
            };

            container.appendChild(btn);
            container.appendChild(tip);
            return container;
        };

        const rowFA = document.createElement('div');
        rowFA.style.display = 'flex'; rowFA.style.gap = '3px';
        rowFA.appendChild(createMiniBtn('F', '#e67e22', 'select[name^="EVRAK_TIPI_"]', '0', 'Evrak Tipi: F', 'Tümünü Fatura olarak işaretler.'));
        rowFA.appendChild(createMiniBtn('A', '#2980b9', 'select[name^="EVRAK_TIPI_"]', '1', 'Evrak Tipi: A', 'Tümünü Alınan olarak işaretler.'));

        panel.appendChild(rowFA);
        panel.appendChild(createMiniBtn('OLAY YERİ', '#8e44ad', 'select[name^="PHOTO_CTG_ID_"]', '11', 'Kategori: Olay', 'Tümünü Olay Yeri Resimleri yapar.'));
        panel.appendChild(createMiniBtn('1. EKSPERTİZ', '#27ae60', 'select[name^="PHOTO_CTG_ID_"]', '1', 'Kategori: Eksp.', 'Tümünü 1. Ekspertiz Resimleri yapar.'));
        panel.appendChild(createMiniBtn('ONARIM SNR', '#c0392b', 'select[name^="PHOTO_CTG_ID_"]', ayarlar.ONARIM_SONRASI, 'Kategori: Onarım', 'Tümünü Onarım Sonrası Resimleri yapar.'));
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
                    background: '#f1f1f1', border: '1px solid #ccc', borderRadius: '3px',
                    padding: '4px', marginBottom: '4px', marginTop: '6px'
                });

                const nameLabel = document.createElement('div');
                nameLabel.innerText = "📁 " + fileName;
                nameLabel.style.cssText = "font-weight:bold; font-size:9px; color:#333; margin-bottom:3px; border-bottom:1px solid #ddd; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:150px;";
                container.appendChild(nameLabel);

                const btnGroup = document.createElement('div');
                btnGroup.style.display = 'flex'; btnGroup.style.gap = '2px'; btnGroup.style.flexWrap = 'wrap';

                const buttons = [
                    { label: 'EHL', vals: ayarlar.EHLİYET, color: '#e74c3c', t: 'Ehliyet - Mağdur/Sigortalı Tekrar tıkla' },
                    { label: 'RUH', vals: ayarlar.RUHSAT, color: '#f39c12', t: 'Ruhsat - Mağdur/Sigortalı Tekrar tıkla' },
                    { label: 'TCK', vals: [ayarlar.NUFUS], color: '#2980b9', t: 'Kimlik/Nüfus' },
                    { label: 'POL', vals: [ayarlar.POLICE], color: '#3498db', t: 'Poliçe' },
                    { label: 'KTT', vals: [ayarlar.KTT], color: '#27ae60', t: 'Kaza Tespit Tut.' },
                    { label: 'BEY', vals: [ayarlar.BEYAN], color: '#2c3e50', t: 'Beyan' },
                    { label: 'ZAB', vals: [ayarlar.ZABIT], color: '#8e44ad', t: 'Zabıt/Rapor' },
                    { label: 'ALK', vals: [ayarlar.ALKOL], color: '#eb4d4b', t: 'Alkol Raporu' },
                    { label: 'İMZ', vals: [ayarlar.IMZA], color: '#16a085', t: 'İmza Sirküsü' },
                    { label: 'GAZ', vals: [ayarlar.SICIL], color: '#7f8c8d', t: 'Sicil Gazetesi' },
                    { label: 'MUT', vals: [ayarlar.MUTABAKAT], color: '#6ab04c', t: 'Mutabakatname' },
                    { label: 'TİB', vals: [ayarlar.IBRA], color: '#3498db', t: 'Teslim İbra' },
                    { label: 'İRS', vals: [ayarlar.IRSALIYE], color: '#d35400', t: 'İrsaliye' },
                    { label: 'RAY', vals: [ayarlar.RAYIC], color: '#f0932b', t: 'Rayiç Çalışması' },
                    { label: 'TRA', vals: [ayarlar.TRAMER], color: '#4834d4', t: 'Tramer Kontrolü' },
                    { label: 'MSK', vals: [ayarlar.MASAK], color: '#22a6b3', t: 'MASAK Evrakları' },
                    { label: 'DİĞ', vals: [ayarlar.DIGER], color: '#95a5a6', t: 'Diğer Evraklar' }
                ];

                buttons.forEach(btnData => {
                    const btnWrapper = document.createElement('div');
                    btnWrapper.className = 'ks-tooltip-container';
                    btnWrapper.style.width = 'auto';

                    const btn = document.createElement('button');
                    btn.innerText = btnData.label;
                    btn.type = "button";
                    Object.assign(btn.style, {
                        fontSize: '8px', padding: '2px 3px', cursor: 'pointer',
                        background: btnData.color, color: 'white', border: 'none',
                        borderRadius: '2px', fontWeight: 'bold'
                    });

                    const tip = document.createElement('div');
                    tip.className = 'ks-tooltip-box';
                    tip.style.bottom = '140%';
                    tip.innerHTML = `<strong>${btnData.t}</strong>`;

                    btn.onclick = (e) => {
                        e.preventDefault();
                        let nextVal = btnData.vals[0];
                        if (btnData.vals.length > 1 && selectEl.value === btnData.vals[0]) {
                            nextVal = btnData.vals[1];
                        }
                        selectEl.value = nextVal;
                        selectEl.dispatchEvent(new Event('change', { bubbles: true }));

                        const tipiSelect = parentTd.querySelector('select[name^="EVRAK_TIPI_"]');
                        if (tipiSelect) {
                            tipiSelect.value = "1";
                            tipiSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        }
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
    if (location.href.includes("otohasar") && /eks_(magdur_arac_donanim|arac_donanim)/.test(location.href)) {
        function initPanel() {
            if (document.getElementById('donanim-panel') || !document.body.innerText.toLowerCase().includes("donanim")) return;
            //injectStyles(); initPanel();
            /* ===== 1. PANEL OLUŞTURMA ===== */
            // 1. Animasyon Tanımları (Giriş ve Tıklama Efekti)
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
                z-index: 3169999;
                display: flex; gap: 1px;
                padding: 1px;
                background: #000;
                border-bottom-left-radius: 2px;
                box-shadow: -1px 1px 4px rgba(0,0,0,0.5);
                animation: slideRight 0.2s ease-out;
            `;
            // 3. Butonlar için ortak stil (Sonradan ekleyeceğin butonlar bu sınıfı kullanabilir)
            // Örnek kullanım: yeniButon.className = 'panel-btn';
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
            // Sayfadaki tüm checkboxları ve yanlarındaki metinleri analiz et
            const getPageCheckboxes = () => {
                const rows = Array.from(document.querySelectorAll('tr'));
                let results = [];
                rows.forEach(row => {
                    const labelCell = row.cells[0] ? row.cells[0].innerText.trim().toUpperCase() : "";
                    if (!labelCell) return;
                    // Satır isminden Master ID'yi bul
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
                                        masterId: masterId, // Bizim belirlediğimiz sabit ID
                                        originalId: match[1], // Sayfadaki (Mapfre/Atlas) ID
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
                    // Kural fonksiyonuna Master ID'yi gönderiyoruz (23 vs 24 kavgası burada biter)
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
        else window.addEventListener('load', initPanel);
        // Dinamik yüklemeler için ek kontrol
        setTimeout(initPanel, 1500);
    }
    // Sbm 3lü sayı bölme
    //https://online.sbm.org.tr/trm-ktt/giris/sonuc.sbm?randQ=8fa87a8f371f5aec4ee3afe2edc34fa2  GİRİŞ ADRES
    //https://online.sbm.org.tr/trm-ktt/sirket/listView.sbm?randQ=23b5dd697aa33580675278a280940a3f  SONUÇ ADRES
    if (location.href.includes("online.sbm.org.tr/trm-ktt/giris")) {
        let lastFormattedNumber = "";
        // --- BÜYÜK SAYI VE TARİH PANELİ OLUŞTURMA ---
        const createNumberPanel = () => {
            let panel = document.getElementById('sbm-big-number-panel');
            if (!panel) {
                panel = document.createElement('div');
                panel.id = 'sbm-big-number-panel';
                // Panel Stilleri
                Object.assign(panel.style,
                    {
                        position: 'fixed',
                        bottom: '22px',
                        right: '0px',
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '4px 0 0 4px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                        zIndex: '10000',
                        fontFamily: 'monospace',
                        display: 'none',
                        textAlign: 'center',
                        minWidth: '150px',
                        border: '1px solid #444'
                    });
                document.body.appendChild(panel);
            }
            return panel;
        };
        const updatePanelContent = (num) => {
            const panel = createNumberPanel();
            const today = new Date();
            const dateStr = today.toLocaleDateString('tr-TR'); // GG.AA.YYYY formatı
            // Üstte sayı (büyük), altta tarih (daha küçük)
            panel.innerHTML = `
            <div style="font-size: 22px; font-weight: bold; margin-bottom: 2px;">${num}</div>
            <div style="font-size: 18px; font-weight: bold; color: #ccc; border-top: 1px solid #555; paddingTop: 2px;">${dateStr}</div>
        `;
            panel.style.display = 'block';
        };
        /**
         * Sayıları formatlar
         */
        const formatSbmNumber = (text) => {
            let found = false;
            const formatted = text.replace(/\b\d{17,}\b/g, (match) => {
                found = true;
                lastFormattedNumber = match.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                return lastFormattedNumber;
            });
            if (found) {
                updatePanelContent(lastFormattedNumber);
            }
            return formatted;
        };
        const processNodes = (rootElement) => {
            const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while ((node = walker.nextNode())) {
                const originalValue = node.nodeValue;
                if (/\d{17,}/.test(originalValue)) {
                    const newValue = formatSbmNumber(originalValue);
                    if (originalValue !== newValue) {
                        node.nodeValue = newValue;
                    }
                }
            }
        };
        // Başlatıcılar
        window.addEventListener('load', () => {
            createNumberPanel();
            processNodes(document.body);
        });
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) processNodes(node);
                    else if (node.nodeType === 3 && /\d{17,}/.test(node.nodeValue)) {
                        node.nodeValue = formatSbmNumber(node.nodeValue);
                    }
                });
            }
        });
        observer.observe(document.body,
            {
                childList: true,
                subtree: true
            });
    }
    // SBM Resim indirme
    if (location.href.includes("online.sbm.org.tr/trm-ktt/sirket/listShowTutanakResimleriPage.sbm")) {
        // AYARLAR
        const MIN_WIDTH = 300; // Sadece bu genişlikten büyük resimleri indirir (Thumbnail'leri eler)

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
                // Sadece büyük boyutlu olanları al
                if (img.naturalWidth >= MIN_WIDTH || img.width >= MIN_WIDTH) {
                    const url = img.src;
                    if (!url || url.startsWith('data:')) continue;

                    count++;

                    // Orijinal ismi URL parametrelerinden veya sıradan oluştur
                    // SBM genellikle parametre kullandığı için temiz bir isim üretelim
                    let fileName = `tutanak_resim_${count}_${Date.now()}.jpg`;

                    // URL içinde anlamlı bir ID varsa onu çekmeye çalışalım
                    const urlParams = new URLSearchParams(url.split('?')[1]);
                    if(urlParams.has('id')) {
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
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Resim indirilemedi:", url, error);
        }
    }

    window.addEventListener('load', initSbmDownloadPanel);
    setTimeout(initSbmDownloadPanel, 2000);
    }
    // Sahibinden Ortalama KM Piyasa sorgusu
    if (location.href.includes("sahibinden.com")) {
        injectStyles();
        initPanel();
        config.bottom = "22px";
        config.width = "200px";
        config.collapsedWidth = "200px";
        const contentArea = document.querySelector('.ks-content');
        /* ================= AYARLAR & STATE ================= */
        let lastState = ""; // Veri değişmediyse DOM'u güncellememek için
        contentArea.id = 'sahibinden-modern-panel';
        Object.assign(contentArea.style,
            {
                minWidth: '200px',
                pointerEvents: 'none'
            });
        if (contentArea) {
            contentArea.innerHTML = '🔍 Veriler analiz ediliyor...';
            const getColumnIndex = (names) => {
                const headers = document.querySelectorAll('table thead td, table thead th');
                return Array.from(headers).findIndex(h => names.some(n => h.innerText.trim().toLowerCase() === n.toLowerCase()));
            };
            /* ================= HESAPLAMA MANTIĞI ================= */
            function hesapla() {
                const fIdx = getColumnIndex(['Fiyat', 'Price']);
                const kIdx = getColumnIndex(['KM', 'Mileage']);
                const yIdx = getColumnIndex(['Yıl', 'Year']);
                if (fIdx === -1) {
                    contentArea.innerHTML = '⚠️ Fiyat sütunu bulunamadı';
                    return;
                }
                const rows = document.querySelectorAll('table tbody tr:not(.nativeAd)'); // Reklam satırlarını hariç tutar
                let fTop = 0,
                    fAd = 0,
                    fMin = Infinity,
                    fMax = 0;
                let kmTop = 0,
                    kmAd = 0,
                    kmMin = Infinity,
                    kmMax = 0;
                const yilSeti = new Set();
                rows.forEach(row => {
                    const cells = row.cells;
                    if (!cells || cells.length < fIdx) return;
                    // Fiyat İşleme
                    const rawFiyat = cells[fIdx].innerText.replace(/[^\d]/g, '');
                    const vFiyat = parseFloat(rawFiyat);
                    if (!isNaN(vFiyat) && vFiyat > 0) {
                        fTop += vFiyat;
                        fAd++;
                        if (vFiyat < fMin) fMin = vFiyat;
                        if (vFiyat > fMax) fMax = vFiyat;
                    }
                    // KM İşleme
                    if (kIdx !== -1 && cells[kIdx]) {
                        const vKm = parseInt(cells[kIdx].innerText.replace(/[^\d]/g, ''), 10);
                        if (!isNaN(vKm)) {
                            kmTop += vKm;
                            kmAd++;
                            if (vKm < kmMin) kmMin = vKm;
                            if (vKm > kmMax) kmMax = vKm;
                        }
                    }
                    // Yıl İşleme
                    if (yIdx !== -1 && cells[yIdx]) {
                        const vYil = parseInt(cells[yIdx].innerText.trim(), 10);
                        if (!isNaN(vYil)) yilSeti.add(vYil);
                    }
                });
                if (fAd === 0) return;
                // Değişiklik kontrolü (Aynı veriyi tekrar render etme)
                const currentState = `${fAd}-${fTop}-${kmTop}`;
                if (lastState === currentState) return;
                lastState = currentState;
                const fOrt = Math.round(fTop / fAd).toLocaleString('tr-TR');
                const kmOrt = kmAd ? Math.round(kmTop / kmAd).toLocaleString('tr-TR') : '-';
                const yillar = [...yilSeti].sort((a, b) => a - b);
                const yilText = yillar.length > 0 ? (yillar.length > 2 ? `${yillar[0]} - ${yillar.at(-1)}` : yillar.join(' / ')) : '-';
                /* ================= PANEL RENDER ================= */
                contentArea.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <b style="color:#ffce44">📊 İstatistikler</b>
                <span style="background:#555; padding:2px 6px; borderRadius:4px; fontSize:10px;">${fAd} İlan</span>
            </div>
            <div style="display:grid; gap:4px; font-size:13px;">
                <div>💰 <b>Ort:</b> ${fOrt} TL</div>
                <div>🛣️ <b>Ort:</b> ${kmOrt} km</div>
                <div>📅 <b>Yıl:</b> ${yilText}</div>
            </div>
            <div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.1); font-size:11px; opacity:0.8;">
                <div>Min: ${fMin.toLocaleString('tr-TR')} TL / ${kmMin === Infinity ? 0 : kmMin.toLocaleString('tr-TR')} km</div>
                <div>Max: ${fMax.toLocaleString('tr-TR')} TL / ${kmMax.toLocaleString('tr-TR')} km</div>
            </div>
        `;
            }
            /* ================= BAŞLATICI ================= */
            const init = () => {
                if (document.querySelector('table')) {
                    if (!document.body.contains(contentArea)) document.body.appendChild(contentArea);
                    hesapla();
                    // Sayfa değişimlerini veya dinamik yüklemeleri yakalamak için
                    setInterval(hesapla, 2000);
                }
                else {
                    setTimeout(init, 500);
                }
            };
            init();
        }
    }
    /*
    // Sahibinden oto arama
    if (location.href.includes("otohasar")) {
        GM_addStyle(`
        #tmP{position:fixed;top:10px;right:10px;background:#fff;border:3px solid #f27a1a;padding:12px;z-index:99999;font-family:sans-serif;border-radius:8px;box-shadow:0 4px 10px rgba(0,0,0,0.2)}
        #tmP input{display:block;margin-bottom:8px;width:170px;padding:5px;border:1px solid #ccc;border-radius:4px}
        .btn-group{display:flex;gap:5px;}
        #tmP button{flex:1;padding:8px;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-size:11px}
        #b_analiz{background:#f27a1a}
        #b_git{background:#3498db}
        #res{margin-top:12px;font-size:13px;color:#333;line-height:1.4}
    `);
        const d = document,
            p = d.createElement('div');
        p.id = 'tmP';
        p.innerHTML = `
        <input id="m" placeholder="Model">
        <input id="k" placeholder="KM">
        <input id="y" placeholder="Yıl">
        <div class="btn-group">
            <button id="b_analiz">ANALİZ</button>
            <button id="b_git">SAYFAYI AÇ</button>
        </div>
        <div id="res"></div>`;
        d.body.appendChild(p);
        const getParams = () => {
            const m = d.getElementById('m').value,
                k = parseInt(d.getElementById('k').value.replace(/\D/g, '')),
                y = d.getElementById('y').value;
            const kMin = Math.floor(k * 0.9),
                kMax = Math.ceil(k * 1.1);
            return {
                m,
                kMin,
                kMax,
                y
            };
        };
        const findUrl = (callback) => {
            const
                {
                    m,
                    kMin,
                    kMax,
                    y
                } = getParams();
            if (!m || isNaN(kMin) || !y) return;
            d.getElementById('res').innerText = "Eksik bilgi!";
            d.getElementById('res').innerHTML = "🔍 Kategori aranıyor...";
            GM_xmlhttpRequest(
                {
                    method: "GET",
                    url: `https://www.google.com/search?q=site:sahibinden.com+${encodeURIComponent(m)}`,
                    onload: (r) => {
                        const doc = new DOMParser().parseFromString(r.responseText, "text/html");
                        let a = doc.querySelector('a[href*="sahibinden.com/"]')?.href;
                        if (a) {
                            if (a.includes("url?q=")) a = decodeURIComponent(a.split("url?q=")[1].split("&")[0]);
                            const finalUrl = `${a.split('?')[0]}?a4_min=${kMin}&a4_max=${kMax}&a5_min=${y}&a5_max=${y}`;
                            callback(finalUrl);
                        }
                        else {
                            d.getElementById('res').innerText = "❌ Kategori bulunamadı.";
                        }
                    }
                });
        };
        // Analiz Butonu
        d.getElementById('b_analiz').onclick = () => {
            findUrl((url) => {
                d.getElementById('res').innerHTML = "📊 Veriler çekiliyor...";
                GM_xmlhttpRequest(
                    {
                        method: "GET",
                        url: url,
                        onload: (sr) => {
                            const sDoc = new DOMParser().parseFromString(sr.responseText, "text/html");
                            const prices = [...sDoc.querySelectorAll('.searchResultsPriceValue span')].map(el => parseInt(el.innerText.replace(/\D/g, ''))).filter(n => n > 1000);
                            if (prices.length > 0) {
                                const avg = Math.round(prices.reduce((a, b) => a + b) / prices.length);
                                d.getElementById('res').innerHTML = `✅ <b>${prices.length} ilan</b><br>💰 <b>Ort:</b> ${avg.toLocaleString('tr-TR')} TL<br>📉 <b>Min:</b> ${Math.min(...prices).toLocaleString('tr-TR')} TL`;
                            }
                            else {
                                d.getElementById('res').innerHTML = "❌ Veri alınamadı.";
                            }
                        }
                    });
            });
        };
        // Sayfayı Aç Butonu
        d.getElementById('b_git').onclick = () => {
            findUrl((url) => {
                d.getElementById('res').innerHTML = "🚀 Yönlendiriliyor...";
                GM_openInTab(url,{ active: true });
            });
        };
    }*/
    // Türkiye Sigorta
    if (location.href.includes("hasaroto.turkiyesigorta.com.tr")) {
        function applyModernStyles() {
            if (document.getElementById('ts-modern-styles')) return;
            const style = document.createElement('style');
            style.id = 'ts-modern-styles';
            style.innerHTML = `
            /* Ana Konteynır - Soft Gri ve Ortalı */
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

            /* Butonlar - Modern ve Dengeli */
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

            /* Hover - Hafif Aydınlanma */
            .tab-header .tab-button:hover:not(.active),
            .osem-tab-btn:hover:not(.active) {
                background-color: #ffffff !important;
                color: #334155 !important;
                border-color: #e2e8f0 !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
            }

            /* AKTİF SEKME - Derinlikli Beyaz */
            .tab-header .tab-button.active,
            .osem-tab-btn.active {
                background: #ffffff !important;
                color: #0f172a !important; /* Koyu lacivert/siyah yazı */
                border: 1px solid #cbd5e1 !important;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                transform: translateY(-1px) !important;
            }

            /* Alt Çizgi Yerine Modern Vurgu */
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

            /* Site kalıntılarını temizle */
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
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
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
                // Özellikle victimName ve victimSurname içeren inputları seçiyoruz
                const vName = document.querySelector('input[name*="victimName"]')?.value || "";
                const vSurname = document.querySelector('input[name*="victimSurname"]')?.value || "";
                const fullVictimName = (vName + " " + vSurname).trim();

                if (fullVictimName.length > 1) {
                    forceUpdateValue(input, fullVictimName);
                    return; // Mağdur işlemi bittiyse fonksiyondan çık
                }
            }

            // 2. GENEL / SİGORTALI KONTROLÜ (Eskisi gibi çalışmaya devam eder)
            const isOwnerField = id.includes("carownername") || html.includes("carownername");

            if (isOwnerField && input.value.trim() === "") {
                // Mağdur olmayan genel Name/Surname alanlarını bulur
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


        function fixSaveButton() {

            // Eğer buton zaten doğru şekilde sabitlenmişse (ID kontrolü), tekrar işlem yapma
            if (document.getElementById("main-fixed-save-button")) return;

            // Sayfadaki tüm "Tümünü Kaydet" butonlarını bul
            const allSaveButtons = Array.from(document.querySelectorAll('.dx-button-success'));

            // Sadece "Tümünü Kaydet" yazanları filtrele
            const mainSaveButton = allSaveButtons.find(btn =>
                btn.innerText.includes("Tümünü Kaydet") ||
                btn.getAttribute('aria-label')?.includes("Tümünü Kaydet")
            );

            if (mainSaveButton) {
                // Sadece bu spesifik butonun stilini değiştir
                // 1. Animasyonu CSS olarak sayfaya ekle (Sadece bir kez)
                if (!document.getElementById('save-button-animation')) {
                    const animStyle = document.createElement('style');
                    animStyle.id = 'save-button-animation';
                    animStyle.innerHTML = `
                        @keyframes pulse-animation {
                            0% { transform: translateX(-50%) scale(1); box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.5); }
                            50% { transform: translateX(-50%) scale(1.08); box-shadow: 0 15px 30px -5px rgba(34, 197, 94, 0.7); }
                            100% { transform: translateX(-50%) scale(1); box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.5); }
                        }
                    `;
                    document.head.appendChild(animStyle);
                }

                // 2. fixSaveButton içindeki stil kısmına animasyonu ekle
                mainSaveButton.style.background = "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
                mainSaveButton.style.position = "fixed";
                mainSaveButton.style.top = "65px";
                mainSaveButton.style.left = "52%";
                mainSaveButton.style.transform = "translateX(-50%)"; // Merkezleme
                mainSaveButton.style.zIndex = "9999";
                mainSaveButton.style.borderRadius = "5px";
                mainSaveButton.style.padding = "4px 15px"; // Biraz daha dolgun durması için artırdım
                mainSaveButton.style.color = "#ffffff";
                mainSaveButton.style.fontSize = "14px";
                mainSaveButton.style.cursor = "pointer";
                mainSaveButton.style.border = "1px solid rgba(255,255,255,0.2)";

                // SÜREKLİ ANİMASYON BURADA:
                mainSaveButton.style.animation = "pulse-animation 2s infinite ease-in-out";

                // Hover (Üzerine gelince) efekti için
                mainSaveButton.onmouseenter = () => {
                    mainSaveButton.style.transform = "scale(1.1) translateY(-3px)";
                    mainSaveButton.style.boxShadow = "0 20px 30px -10px rgba(34, 197, 94, 0.6)";
                };

                mainSaveButton.onmouseleave = () => {
                    mainSaveButton.style.transform = "scale(1) translateY(0)";
                    mainSaveButton.style.boxShadow = "0 10px 25px -5px rgba(34, 197, 94, 0.5)";
                };

                // Butonun diğerlerinden ayrılması için özel bir ID verelim ki CSS'le çakışmasın
                mainSaveButton.id = "main-fixed-save-button";
            }
        }

        // Sayfa değiştikçe butonun orada olduğundan emin olalım
        setInterval(fixSaveButton, 1000);
    }
    // Sayfa bildirim öldürücü
    if (location.href.includes("otohasar") && location.href.includes("eks_hasar.php")) {
        let notificationCounts = {};
        const MAX_ALLOWED = 3;
        // --- Görsel Bildirim Kutusu Oluşturma Fonksiyonu ---
        const showTopNotification = (message, count) => {
            let notifyDiv = document.getElementById('tm-notify-bar');
            if (!notifyDiv) {
                notifyDiv = document.createElement('div');
                notifyDiv.id = 'tm-notify-bar';
                Object.assign(notifyDiv.style,
                    {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        backgroundColor: '#f44336',
                        color: 'white',
                        textAlign: 'center',
                        padding: '10px',
                        zIndex: '999999',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        transition: 'opacity 0.5s ease'
                    });
                document.body.appendChild(notifyDiv);
            }
            notifyDiv.innerText = `[${count}. Tekrar] SİSTEM UYARISI: ${message} (Otomatik Kapatıldı)`;
            notifyDiv.style.opacity = '1';
            // 3 saniye sonra bildirim barını gizle
            setTimeout(() => {
                notifyDiv.style.opacity = '0';
            }, 3000);
        };
        // --- Alert Fonksiyonunu Ezme ---
        const originalAlert = window.alert;
        window.alert = function (message) {
            notificationCounts[message] = (notificationCounts[message] || 0) + 1;
            const count = notificationCounts[message];
            if (count <= MAX_ALLOWED) {
                // İlk 3 bildirimde normal alert göster
                originalAlert(message);
            }
            else {
                // 3'ten fazlaysa alert'i engelle, sadece ekranın üstüne bar çıkart
                showTopNotification(message, count);
                // Burada hiçbir şey yapmayarak (originalAlert çağırmayarak)
                // aslında "Tamam"a basılmış gibi kodun devam etmesini sağlıyoruz.
            }
        };
        // --- Confirm (Onay) Kutularını da Otomatik "Tamam"la ---
        window.confirm = function (message) {
            notificationCounts[message] = (notificationCounts[message] || 0) + 1;
            if (notificationCounts[message] > MAX_ALLOWED) {
                showTopNotification(message, notificationCounts[message]);
                return true; // Her zaman 'Tamam' butonuna basılmış gibi true döner
            }
            return confirm(message);
        };
    }
})();
