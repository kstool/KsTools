// ==UserScript==
// @name         KS TOOLS PANEL
// @namespace    KS_TOOLS_PANEL
// @version      1.73
// @license      GPL-3.0
// @description  OtoHasar Dinamik Form Panel / Parça - Manuel ve Çoklu ekleme / Donanim Panel / SBM Tramer no ayırma ve resim indirme / Wp resim indirme / Gelişmiş Hasar Analiz / PDF -> JPG Dönüştürme ve boyutlandırma
// @author       Saygın
// @match        *://*/*
// @run-at       document-end
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_info
// @grant        GM_openInTab
// @grant        GM_download
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @connect      *
// @connect      cdnjs.cloudflare.com
// @require      https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
// @updateURL    https://github.com/sayginkizilkaya/Ks-Tools/raw/main/KS_TOOLS.user.js
// @downloadURL  https://github.com/sayginkizilkaya/Ks-Tools/raw/main/KS_TOOLS.user.js
// ==/UserScript==
/* global jQuery,html2canvas */
(function () {
    'use strict';
    /* ---Eklenecekler
	PDF DÖNÜŞTÜRME PANELİ- ILOVEPDF GİBİ
	JPG KÜÇÜLTME PANELİ- BULKSIZE
        *** paneller düzenlenecek
        parça hasar paneli düzenlenecek - farklı araçlar için
        Ek tasarım şekilleri - yön panel şekli vs.
        sağ üste danseden doge - çok önemli ~~EKLENDİ GİF :D
        Gerekli evrak gösteren panel - duruma bağlı
        Veriyi sayfalar arası taşıma - aynı adres kökünde
        Resim okuma gelişimi - isme göre
        genel sigorta sayfası giriş gelişmiş versiyon - türkiye sigorta, quick
        Hızlı Resim girişi claude fix need~~ ÇOK ZORLAMAYA GEREK YOK ÇALIŞIYOR
        resim kontrol eğer yüklenen dosyalarda ehliyet var mağdur/sigortalı yazmıyorsa paneldek bu alanları buna uygun düzenlesin ama normalde mağdur paneli içerisinde mağdur yazıyorsa yazmalı sadece olmadığında bunu kullanacak~~ HALLOLDU
    */
    const url = location.href.toLowerCase();
    let loc = (adros) => location.href.includes(adros);
    const hedefSiteler = /otohasar|sahibinden|sigorta|anadolusigorta|akcozum2|sbm|whatsapp/;
    const blockedGroups = ["yazdir", "print", "rapor", "ihbar", "kayit", "signin", "sign-in", "sign_in", "sign", "dilekce", "fatura", "makbuz", "dekont", "invoice", "receipt", "barcode", "kimlik", "kart"];
    if (!hedefSiteler.test(url) || blockedGroups.some(word => url.includes(word))) { return; }
    let config = { bottom: '0px', right: '0px', width: '250px', borderRadius: '4px', blur: '15px', themeColor: '#1cb2cd', backColor: '#3d3e41', Color: 'white', isCollapsed: false, wasDragging: false, zIndex: 3169999, isUnlocked: false };
    const getSetting = (key) => GM_getValue(key, true);
    const setSetting = (key, val) => GM_setValue(key, val);
    const themes = {
        'online.sbm.org': 'white', 'quicksigorta': '#d1a401', 'anadolusigorta': '#005ba4', 'corpussigorta': '#8b5e34', 'turkiyesigorta': '#1cb2cd', 'otohasar.hepiyi': '#55ac05', 'otohasar.atlas': '#005596', 'otohasar.mapfre': '#e00d26',
        'otohasar.akcozum2': '#eb5311', 'otohasar.bereket': '#04b03d', 'otohasar.turknippon': '#0054a6', 'otohasar.allianz': '#164481', 'otohasar.sompo': '#e20613', 'otohasar.hdi': '#007a33', 'otohasar.groupama': '#007a33', 'otohasar.axa': '#00008f',
        'otohasar.ray': '#ed1c24', 'otohasar.unico': '#e30613', 'otohasar.doga': '#009640', 'otohasar.allianz': '#164481'
    };
    const matchedKey = Object.keys(themes).find(key => url.includes(key)); if (matchedKey) config.themeColor = themes[matchedKey];
	pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    /* ══════════════════════════════════════════════════
       HASAR ANALİZ — SEDAN ŞEMALİ VERSİYON v1.0
    ══════════════════════════════════════════════════ */
    /* ── Renk yardımcıları ── */
    function hapScoreColor(n) { if (n === 0) return '#666666'; if (n <= 2) return '#2dfc52'; if (n <= 5) return '#ffb700'; if (n <= 9) return '#ff5e00'; return '#ff0000'; }
    function hapBgColor(n) { if (n === 0) return '#1a1a1a'; if (n <= 2) return '#062612'; if (n <= 5) return '#2a1b02'; if (n <= 9) return '#2d0a02'; return '#330000'; }
    function hapBdColor(n) { if (n === 0) return '#333333'; if (n <= 2) return '#00ff88'; if (n <= 5) return '#ffcc00'; if (n <= 9) return '#ff7700'; return '#ff3333'; }
    function hapFmtTL(v) { if (!v) return ''; return v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'K' : Math.round(v) + ''; }
    /* ── Normalize ── */
    function hapNorm(t) {
        return t ? t.toUpperCase().replace(/i/g, 'I').replace(/İ/g, 'I').replace(/ı/g, 'I').replace(/Ğ/g, 'G').replace(/ğ/g, 'G')
            .replace(/Ü/g, 'U').replace(/ü/g, 'U').replace(/Ş/g, 'S').replace(/ş/g, 'S').replace(/Ö/g, 'O').replace(/ö/g, 'O').replace(/Ç/g, 'C').replace(/ç/g, 'C') : '';
    }
    function hapKwMatch(norm, kws) { return kws.some(k => norm.includes(hapNorm(k))); }
    /* ── Mekanik / Elektrik tanımları ── */
    const HAP_MEK = [
        { id: 'amortisör', label: 'Amortisör', kw: ['AMORTISOR', 'SHOCK', 'SUSPANSIYON', 'TAKOZ', 'TAKKOZ', 'KULE'] },
        { id: 'fren', label: 'Fren / Balata', kw: ['FREN', 'BRAKE', 'BALATA', 'DISK', 'KAPLIN', 'KALIPER', 'MERKEZ'] },
        { id: 'aks', label: 'Aks / Şaft', kw: ['AKS', 'AXLE', 'SAFT', 'MAFSAL', 'LALE', 'KORUK'] },
        { id: 'tabla', label: 'Tabla / Salıncak', kw: ['TABLA', 'SALINCAK', 'ARM', 'BURC', 'ROTIL', 'PODYE', 'FISEK'] },
        { id: 'motor', label: 'Motor / Silindir', kw: ['MOTOR', 'SILINDIR', 'ENGINE', 'BLOK', 'KULAK', 'CONTA', 'KRANK', 'PISTON'] },
        { id: 'turbo', label: 'Turboşarj', kw: ['TURBO', 'SALYANGOZ', 'TURBINE', 'WESTGATE'] },
        { id: 'sase', label: 'Şase', kw: ['SASE', 'KROS', 'KASIS', 'CHASSIS', 'TRAVERS', 'TRAVER', 'KULE', 'NYLON'] },
        { id: 'fan', label: 'Fan', kw: ['FAN', 'PERVANE', 'DAVULBAZ', 'TERMİK'] },
        { id: 'hortum', label: 'Hortum / Tesisat', kw: ['HORTUM', 'BORU', 'RAKOR', 'KELEPCE'] },
        { id: 'egzoz', label: 'Egzoz', kw: ['EGZOZ', 'EGSOZ', 'EXHAUST', 'KATALIZOR', 'PARTIKUL', 'SUSTURUCU', 'MANIFOLD'] },
        { id: 'sanziman', label: 'Şanzıman / Vites', kw: ['SANZIMAN', 'VITES', 'GEARBOX', 'DIFERANSIYEL', 'BASKI', 'BALATA', 'VOLANT', 'KAVRAMA'] },
        { id: 'direksiyon', label: 'Direksiyon ve Yönetim', kw: ['DIREKSIYON', 'POMPA', 'ROT', 'MIL', 'TIKIRTI', 'Z-ROT'] },
        { id: 'yakit', label: 'Yakıt Sistemi', kw: ['POMPA', 'ENJEKTOR', 'DEPO', 'TANK', 'FILTRE', 'MUSUR'] },
        { id: 'radyator', label: 'Radyatör', kw: ['RADYATOR', 'RADIATOR', 'PETEK', 'ANTIFRIZ'] },
        { id: 'intercool', label: 'İntercooler', kw: ['INTERCOOLER', 'ARA SOGUTUCU'] },
    ];
    const HAP_ELK = [
        { id: 'radar', label: 'Radar / ACC', kw: ['RADAR', 'AEBS', 'ACC', 'KOR NOKTA', 'KAMERA'] },
        { id: 'webasto', label: 'Webasto', kw: ['WEBASTO', 'ISITICI', 'KALORIFER'] },
        { id: 'aku', label: 'Akü / Elekt.', kw: ['AKU', 'BATTERY', 'ALTERNATOR', 'SARZ', 'SARJ', 'KONJEKTOR'] },
        { id: 'far', label: 'Far / Sinyal', kw: ['FAR', 'SINYAL', 'LED', 'LAMBA', 'AYDINLATMA', 'XENON'] },
        { id: 'stop', label: 'Stop Lambası', kw: ['STOP', 'REFLEKTOR', 'REFLOKTOR', 'DUY'] },
        { id: 'sis', label: 'Sis Lambası', kw: ['SIS', 'PANEK', 'FOG'] },
        { id: 'ecu', label: 'Beyin / Modül', kw: ['ECU', 'BEYIN', 'MODUL', 'BEYNI', 'KONTROL UNITESI', 'SIGORTA'] },
        { id: 'sensor', label: 'Sensörler', kw: ['SENSOR', 'PARK', 'YAGMUR', 'OKSIJEN', 'ABS', 'HIZ', 'BASINC'] },
        { id: 'mars', label: 'Marş Sistemi', kw: ['MARŞ', 'DINAMO', 'STARTER', 'OTOMATIK'] },
        { id: 'klima', label: 'Klima Sistemi', kw: ['KLIMA', 'KOMPRESOR', 'EVAPORATOR', 'POLEN'] },
        { id: 'kilit', label: 'Merkezi Kilit', kw: ['KILIT', 'KAPATMA', 'ALARM', 'KUMANDA'] },
    ];
    /* ── Bölge → path id eşleşmesi ── */
    const HAP_ZONE_PATHS = {
        'hap-z-fl': ['path-camurl-onSol', 'path-far-onSol', 'path-tampon-onSol'],
        'hap-z-fc': ['path-kaput', 'path-tampon-on'],
        'hap-z-fr': ['path-camurl-onSag', 'path-far-onSag', 'path-tampon-onSag'],
        'hap-z-ml': ['path-ayna-sol'],
        'hap-z-dl': ['path-kapi-onSol', 'path-kapi-arkaSol'],
        'hap-z-ch': ['path-kabin', 'path-tavan'],
        'hap-z-dr': ['path-kapi-onSag', 'path-kapi-arkaSag'],
        'hap-z-mr': ['path-ayna-sag'],
        'hap-z-rl': ['path-camurl-arkaSol', 'path-stop-sol'],
        'hap-z-rc': ['path-bagaj', 'path-tampon-arka'],
        'hap-z-rr': ['path-camurl-arkaSag', 'path-stop-sag'],
        'hap-z-wfl': ['tire-fl'],
        'hap-z-wfr': ['tire-fr'],
        'hap-z-wrl': ['tire-rl'],
        'hap-z-wrr': ['tire-rr'],
        'hap-z-rfl': ['rim-fl'],
        'hap-z-rfr': ['rim-fr'],
        'hap-z-rrl': ['rim-rl'],
        'hap-z-rrr': ['rim-rr'],
    };
    const HAP_BOLGELER = ['hap-z-fl', 'hap-z-fc', 'hap-z-fr', 'hap-z-ml', 'hap-z-dl', 'hap-z-ch', 'hap-z-dr', 'hap-z-mr', 'hap-z-rl', 'hap-z-rc', 'hap-z-rr', 'hap-z-wfl', 'hap-z-wfr', 'hap-z-wrl', 'hap-z-wrr', 'hap-z-rfl', 'hap-z-rfr', 'hap-z-rrl', 'hap-z-rrr'];
    /* ══════════════════════════════════════════════════
       SEDAN SVG — üstten görünüm, gerçek path eğrileri
       viewBox: 0 0 200 460  (dar panel için)
       Araba ekseni: yukarı = ÖN
    ══════════════════════════════════════════════════ */
    function hapBuildSedanSVG() {
        return `
        <svg id="hap-car-svg" viewBox="0 0 200 460" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;margin:4px 0">
        <style>
          .hap-p { stroke: #888; stroke-width: 0.8; cursor: pointer; }
          .hap-p:hover { stroke: #FFF; stroke-width: 1.2; }
          .p-body { fill: #272727; }
          .p-far  { fill: #c2d37d; }
          .p-stop { fill: #811818; }
          .p-glass { fill: #1e2a38; stroke: #5979a8; }
          .p-tire { fill: #000000; stroke: #8e8e8e; stroke-width: 1; }
          .p-rim  { fill: #717171; stroke: #000000; stroke-width: 0.8; }
          .hap-txt { text-anchor: middle; font-weight: bold; fill: #FFF; font-family: monospace; }
          .f11 { font-size: 11px; } .f10 { font-size: 10px; } .f9 { font-size: 9px; }
        </style>
        <!-- ────────────── GÖVDE ANA KONTUR ────────────── -->
        <!-- Tüm araç dış formu: ön yuvarlak burun → yan düzlük → arka kuyruk -->
        <path id="path-body-outline" d="M 35,25 C 35,15 140,15 165,25 L 175,415 C 140,445 60,445 25,415 Z" class="p-body" stroke="#444" stroke-width="2"/>
        <!-- ────────────── TEKERLEKLER ────────────── -->
        <g class="p-tire">
            <ellipse id="tire-fl" cx="26"  cy="105" rx="10" ry="16" class="p-tire" data-zone="hap-z-wfl" data-label="Sol Ön Lastik"/>
            <ellipse id="rim-fl"  cx="26"  cy="105" rx="5"  ry="8"  class="p-rim"  data-zone="hap-z-wfl" data-label="Sol Ön Jant"/>
            <ellipse id="tire-fr" cx="174" cy="105" rx="10" ry="16" class="p-tire" data-zone="hap-z-wfr" data-label="Sağ Ön Lastik"/>
            <ellipse id="rim-fr"  cx="174" cy="105" rx="5"  ry="8"  class="p-rim"  data-zone="hap-z-wfr" data-label="Sağ Ön Jant"/>
            <ellipse id="tire-rl" cx="26"  cy="348" rx="10" ry="16" class="p-tire" data-zone="hap-z-wrl" data-label="Sol Arka Lastik"/>
            <ellipse id="rim-rl"  cx="26"  cy="348" rx="5"  ry="8"  class="p-rim"  data-zone="hap-z-wrl" data-label="Sol Arka Jant"/>
            <ellipse id="tire-rr" cx="174" cy="348" rx="10" ry="16" class="p-tire" data-zone="hap-z-wrr" data-label="Sağ Arka Lastik"/>
            <ellipse id="rim-rr"  cx="174" cy="348" rx="5"  ry="8"  class="p-rim"  data-zone="hap-z-wrr" data-label="Sağ Arka Jant"/>
        </g>
        <!-- ────────────── ÖN TAMPON ────────────── -->
        <path id="path-tampon-on" d="M 45,20 C 60,10 80,8 100,8 C 120,8 140,10 155,20 C 140,20 100,14 45,20 Z" class="hap-p p-body" data-zone="hap-z-fc" data-label="Ön Tampon"/>
		<!-- ────────────── ÖN SOL TAMPON KÖŞE ────────────── -->
        <path id="path-tampon-onSol" d="M 29,75 C 28,35 28,20 50,20 C 60,25 35,35 30,70 Z" class="hap-p p-body" data-zone="hap-z-fl" data-label="Ön Sol Tampon Köşe"/>
        <!-- ────────────── ÖN SAĞ TAMPON KÖŞE ────────────── -->
        <path id="path-tampon-onSag" d="M 171,75 C 172,35 172,20 150,20 C 140,25 165,35 170,70 Z" class="hap-p p-body" data-zone="hap-z-fr" data-label="Ön Sağ Tampon Köşe"/>
        <!-- ────────────── ÖN SOL ÇAMURLUK ────────────── -->
        <path id="path-camurl-onSol" d="M 28,118 C 28,40 40,20 55,18 C 55,15 45,65 40,115  Z" class="hap-p p-body" data-zone="hap-z-fl" data-label="Ön Sol Çamurluk"/>
        <!-- ────────────── ÖN SAĞ ÇAMURLUK ────────────── -->
        <path id="path-camurl-onSag" d="M 172,118 C 172,40 160,20 145,18 C 145,15 155,65 160,115 Z" class="hap-p p-body" data-zone="hap-z-fr" data-label="Ön Sağ Çamurluk"/>
        <!-- ────────────── ÖN SOL FAR ────────────── -->
        <path id="path-far-onSol" d="M 34,45 L 36,28 C 40,13 70,12 74,10 C 74,10 50,15 34,45 Z" fill="#93a83f" stroke="#888888" stroke-width="0.8" style="cursor:pointer" data-zone="hap-z-fl" data-label="Ön Sol Far"/>
        <!-- ────────────── ÖN SAĞ FAR ────────────── -->
        <path id="path-far-onSag" d="M 166,45 L 164,28 C 160,13 130,12 126,10 C 126,10 150,15 166,45 Z" class="hap-p p-far" data-zone="hap-z-fr" data-label="Ön Sağ Far"/>
        <!-- ────────────── SOL ÖN KAPI ────────────── -->
        <path id="path-kapi-onSol" d="M 25,210 L 25,215 L 40,210 L 40,115 C 28,120 30,118 27,122 Z" class="hap-p p-body" data-zone="hap-z-dl" data-label="Sol Ön Kapı"/>
        <!-- ────────────── SAĞ ÖN KAPI ────────────── -->
        <path id="path-kapi-onSag" d="M 175,210 L 175,215 L 160,210 L 160,115 C 172,120 170,118 173,122 Z" class="hap-p p-body" data-zone="hap-z-dr" data-label="Sağ Ön Kapı"/>
        <!-- ────────────── SOL ARKA KAPI ────────────── -->
        <path id="path-kapi-arkaSol" d="M 25,230 L 25,310 L 40,320 L 40,215 C 22,215 25,225 25,218 Z" class="hap-p p-body" data-zone="hap-z-dl" data-label="Sol Arka Kapı"/>
        <!-- ────────────── SAĞ ARKA KAPI ────────────── -->
        <path id="path-kapi-arkaSag" d="M 175,230 L 175,310 L 160,320 L 160,215 C 178,215 175,225 175,218 Z" class="hap-p p-body" data-zone="hap-z-dr" data-label="Sağ Arka Kapı"/>
        <!-- ────────────── KAPUT ────────────── -->
        <path id="path-kaput" d="M 56,22 C 60,19 80,19 100,19 C 120,19 140,19 144,22 L 158,115 C 148,105 125,105 100,105 C 75,105 52,105 42,115 Z" class="hap-p p-body" data-zone="hap-z-fc" data-label="Kaput"/>
        <!-- ────────────── ARKA TAMPON ────────────── -->
        <path id="path-tampon-arka" d="M 26,410 C 26,410 32,425 60,440 C 80,450 120,450 140,440 C 168,425 174,410 174,410 C 174,410 150,438 100,440 C 50,438 26,410 26,410 Z" class="hap-p p-body" data-zone="hap-z-rc" data-label="Arka Tampon"/>
        <!-- ────────────── ARKA SOL ÇAMURLUK ────────────── -->
        <path id="path-camurl-arkaSol" d="M 25,312 L 26,330 C 26,330 45,340 26,368 L 26,410 L 45,420 L 44,410 L 40,360 L 38,322 Z" class="hap-p p-body" data-zone="hap-z-rl" data-label="Arka Sol Çamurluk"/>
        <!-- ────────────── ARKA SAĞ ÇAMURLUK ────────────── -->
        <path id="path-camurl-arkaSag" d="M 175,312 L 174,330 C 174,330 155,340 174,368 L 174,410 L 155,420 L 156,410 L 160,360 L 162,322 Z" class="hap-p p-body" data-zone="hap-z-rr" data-label="Arka Sağ Çamurluk"/>
        <!-- ────────────── KABİN / TAVAN ────────────── -->
        <path id="path-tavan" d="M 42,115 C 52,112 75,110 100,110 C 125,110 148,112 158,115 L 160,202 L 160,315 L 158,320 C 148,323 125,325 100,325 C 75,325 52,323 42,320 L 40,315 L 40,202 Z"
			class="hap-p p-body" data-zone="hap-z-ch" data-label="Kabin / Tavan"/>
        <!-- ────────────── BAGAJ ────────────── -->
        <path id="path-bagaj" d="M 40,326 L 45,415 C 65,445 135,445 155,415 L 160,326 C 140,332 60,332 40,326 Z" class="hap-p p-body" data-zone="hap-z-rc" data-label="Bagaj Kapağı"/>
        <!-- ────────────── CAMLAR ────────────── -->
        <!-- Ön cam -->
        <path id="path-oncam" d="M 43,118 C 70,110 130,110 156,118 L 147,145 C 125,140 75,140 53,145 Z" class="p-glass" data-zone="hap-z-fc" data-label="Ön Cam"/>
        <!-- Arka cam -->
        <path id="path-arkacam" d="M 55,295 C 75,295 125,295 145,295 L 155,318 C 130,323 70,323 45,318 Z" class="p-glass" data-zone="hap-z-rc" data-label="Arka Cam"/>
        <!-- Sol ön pencere -->
        <path id="path-soloncam" d="M 43,130 L 42,210 L 42,210 L 43,211 L 52,210 L 51,148 Z" class="p-glass" data-zone="hap-z-fl" data-label="Sol Ön Pencere"/>
        <!-- Sağ ön pencere -->
        <path id="path-sagoncam" d="M 157,130 L 158,210 L 158,210 L 157,211 L 148,210 L 149,148 Z" class="p-glass" data-zone="hap-z-fr" data-label="Sağ Ön Pencere"/>
        <!-- Sol arka pencere -->
        <path id="path-solarkacam" d="M 43,215 L 42,215 L 42,310 L 43,310 L 52,290 L 52,214 Z" class="p-glass" data-zone="hap-z-dl" data-label="Sol Arka Pencere"/>
        <!-- Sağ arka pencere -->
        <path id="path-sagarkacam" d="M 157,215 L 158,215 L 158,310 L 157,310 L 148,290 L 148,214 Z" class="p-glass" data-zone="hap-z-dr" data-label="Sağ Arka Pencere"/>
		<!-- ────────────── SOL DİKİZ AYNASI ────────────── -->
		<path id="path-ayna-sol" d="M 30,120 C 30,120 15,125 18,135 L 35,125 L 40,123 L 40,118 Z" class="hap-p p-body" data-zone="hap-z-ml" data-label="Sol Dikiz Aynası"/>
		<!-- ────────────── SAĞ DİKİZ AYNASI ────────────── -->
		<path id="path-ayna-sag" d="M 170,120 C 170,120 185,125 182,135 L 165,125 L 160,123 L 160,118 Z" class="hap-p p-body" data-zone="hap-z-mr" data-label="Sağ Dikiz Aynası"/>
        <!-- ────────────── SOL STOP ────────────── -->
        <path id="path-stop-sol" d="M 27,405 C 26,400 24,410 30,425 C 70,455 65,440 65,435 Z" class="hap-p p-stop" data-zone="hap-z-rl" data-label="Sol Stop"/>
        <!-- ────────────── SAĞ STOP ────────────── -->
        <path id="path-stop-sag" d="M 173,405 C 174,400 176,410 170,425 C 130,455 135,440 135,435 Z" class="hap-p p-stop" data-zone="hap-z-rr" data-label="Sağ Stop"/>
        <!-- ────────────── ETIKETLER ────────────── -->
        <text x="100" y="40"  class="hap-txt f12">ÖN</text>
        <text x="100" y="410" class="hap-txt f12">ARKA</text>
        <text x="16"  y="262" class="hap-txt f12" transform="rotate(-90,16,262)">SOL</text>
        <text x="184" y="262" class="hap-txt f12" transform="rotate(90,184,262)">SAĞ</text>
        <!-- ────────────── ZONE COUNTER BADGES (11px & 9px) ────────────── -->
        <text id="hap-cnt-fl" x="12"  y="63"  class="hap-txt f11"/> <!-- fl: ön sol -->
        <text id="hap-cnt-fc" x="100" y="80"  class="hap-txt f11"/> <!-- fc: ön orta -->
        <text id="hap-cnt-fr" x="190" y="63"  class="hap-txt f11"/> <!-- fr: ön sağ -->
        <text id="hap-cnt-dl" x="10"  y="180" class="hap-txt f11"/> <!-- dl: sol kapı -->
        <text id="hap-cnt-ch" x="100" y="220" class="hap-txt f11"/> <!-- ch: kabin -->
        <text id="hap-cnt-dr" x="190" y="180" class="hap-txt f11"/> <!-- dr: sağ kapı -->
        <text id="hap-cnt-rl" x="10"  y="390" class="hap-txt f11"/> <!-- rl: arka sol -->
        <text id="hap-cnt-rc" x="100" y="370" class="hap-txt f11"/> <!-- rc: arka orta -->
        <text id="hap-cnt-rr" x="190" y="390" class="hap-txt f11"/> <!-- rr: arka sağ -->
        <text id="hap-cnt-ml" x="10"  y="130" class="hap-txt f11"/> <!-- ml: orta sol -->
        <text id="hap-cnt-mr" x="190" y="130" class="hap-txt f11"/> <!-- mr: orta sağ -->
        <!-- ────────────── TL KÜÇÜK ETİKETLER (10px) ────────────── -->
        <text id="hap-tl-fl"  x="10"  y="83"  class="hap-txt f10"/> <!-- fl: ön sol -->
        <text id="hap-tl-fc"  x="100" y="95"  class="hap-txt f10"/> <!-- fc: ön orta -->
        <text id="hap-tl-fr"  x="190" y="83"  class="hap-txt f10"/> <!-- fr: ön sağ -->
        <text id="hap-tl-dl"  x="10"  y="200" class="hap-txt f10"/> <!-- dl: sol kapı -->
        <text id="hap-tl-ch"  x="100" y="240" class="hap-txt f10"/> <!-- ch: kabin -->
        <text id="hap-tl-dr"  x="190" y="200" class="hap-txt f10"/> <!-- dr: sağ kapı -->
        <text id="hap-tl-rl"  x="10"  y="400" class="hap-txt f10"/> <!-- rl: arka sol -->
        <text id="hap-tl-rc"  x="100" y="390" class="hap-txt f10"/> <!-- rc: arka orta -->
        <text id="hap-tl-rr"  x="190" y="400" class="hap-txt f10"/> <!-- rr: arka sağ -->
        <text id="hap-tl-ml"  x="10"  y="145" class="hap-txt f10"/> <!-- ml: orta sol -->
        <text id="hap-tl-mr"  x="190" y="145" class="hap-txt f10"/> <!-- mr: orta sağ -->
    </svg>`;
    }
    /* ── Tooltip ── */
    function hapShowTip(zoneId, label, sonuc) {
        const n = sonuc?.bSayac?.[zoneId] || 0, tl = sonuc?.bTutar?.[zoneId] || 0, tipColor = hapBdColor(n), tooltip = document.getElementById('ks-dynamic-tooltip');
        if (!tooltip) return;
        tooltip.innerHTML = `<div class="ks-tip-head"><strong style="color:${tipColor}">${label}</strong></div><div class="ks-tip-body">${n} parça${tl > 0 ? ' · ' + hapFmtTL(tl) : ''}</div>`;
        tooltip.style.borderColor = tipColor + '44'; tooltip.style.borderLeftColor = tipColor; tooltip.classList.add('visible');
        const gap = 16, tw = tooltip.offsetWidth, th = tooltip.offsetHeight, mx = window._hapMouseX || window.innerWidth / 2, my = window._hapMouseY || window.innerHeight / 2;
        tooltip.style.left = Math.max(8, Math.min(mx - tw / 2, window.innerWidth - tw - 8)) + 'px'; tooltip.style.top = (my - th - gap < 8 ? my + gap : my - th - gap) + 'px';
        clearTimeout(window._hapTipHide); window._hapTipHide = setTimeout(() => tooltip.classList.remove('visible'), 2500);
    }
    document.addEventListener('mousemove', e => { window._hapMouseX = e.clientX; window._hapMouseY = e.clientY; });
    /* ══════════════════════════════════════════════════
       TAB SWITCH
    ══════════════════════════════════════════════════ */
    window.hapSwTab = function (t) { ['kaporta', 'mekanik', 'elektrik'].forEach((id, i) => {
		document.querySelectorAll('.hap-tab')[i].classList.toggle('active', id === t); const v = document.getElementById('hap-view-' + id); if (v) v.classList.toggle('active', id === t); }); };
    /* ══════════════════════════════════════════════════
       ANALİZ
    ══════════════════════════════════════════════════ */
    function hapAnalizEt(rows) {
        const res = { bSayac: {}, bTutar: {}, bCamSayac: {}, total: 0, kritik: 0, yuksek: 0, kritikTutar: 0, yuksekTutar: 0, toplamTutar: 0, skor: 0, mekParcalar: {}, elkParcalar: {} };
        HAP_BOLGELER.forEach(id => { res.bSayac[id] = 0; res.bTutar[id] = 0; res.bCamSayac[id] = 0; });
        HAP_MEK.forEach(p => { res.mekParcalar[p.id] = { n: 0, tl: 0 }; });
        HAP_ELK.forEach(p => { res.elkParcalar[p.id] = { n: 0, tl: 0 }; });
        let adIdx = -1, fiyatIdx = -1, adetIdx = -1;
        const headerRow = rows.find(r => r.querySelector('.koyubaslik'));
        if (headerRow) {
            headerRow.querySelectorAll('.koyubaslik').forEach((h, i) => {
                const t = hapNorm(h.textContent).replace(/\s+/g, '');
                if (t.includes('PARCAADI')) adIdx = i;
                if (t.includes('SISTEMFIYATI')) fiyatIdx = i;
                else if (t.includes('BIRIMFIYAT') && fiyatIdx === -1) fiyatIdx = i;
                if (t.includes('ADET')) adetIdx = i;
            });
        }
        if (adIdx === -1) return res;
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length <= Math.max(adIdx, fiyatIdx) || row.querySelector('th') || cells[adIdx].classList.contains('koyubaslik')) return;
            const ad = cells[adIdx].textContent.trim();
            if (!ad || ad.length < 2) return;
            const fRaw = cells[fiyatIdx].textContent.replace(/[^\d]/g, '');
            if (!fRaw) return;
            const fiyat = parseFloat(fRaw) / 100, aRaw = adetIdx !== -1 ? cells[adetIdx].textContent.replace(/[^\d]/g, '') : '1', adet = parseInt(aRaw) || 1, tutar = fiyat * adet;
            if (tutar <= 0) return;
            res.total++; res.toplamTutar += tutar;
            const norm = hapNorm(ad), KRIT = ['AMORTISÖR', 'SASE', 'INTERCOOLER', 'RADYATOR', 'SILINDIR', 'MOTOR', 'PISTON', 'RADAR', 'TURBO', 'WEBASTO', 'ABS', 'FAN', 'TESISAT', 'FREN', 'BRAKE', 'BALATA', 'DISK'];
            if (KRIT.some(k => norm.includes(hapNorm(k)))) { res.kritik++; res.kritikTutar += tutar; }
            if (tutar >= 15000) { res.yuksek++; res.yuksekTutar += tutar; }
            HAP_MEK.forEach(p => { if (hapKwMatch(norm, p.kw)) { res.mekParcalar[p.id].n++; res.mekParcalar[p.id].tl += tutar; } });
            HAP_ELK.forEach(p => { if (hapKwMatch(norm, p.kw)) { res.elkParcalar[p.id].n++; res.elkParcalar[p.id].tl += tutar; } });
            const on = /\bON\b/.test(norm) || norm.includes('FRONT'), arka = /\bARKA\b/.test(norm) || norm.includes('REAR');
            const sol = /\bSOL\b/.test(norm) || norm.includes('LEFT'), sag = /\bSAG\b/.test(norm) || norm.includes('RIGHT');
            const farv = hapKwMatch(norm, ['FAR', 'SINYAL', 'AYDINLATMA', 'SIS LAMBASI', 'LAMBA', 'LED']), stopv = norm.includes('STOP');
            const tampon = hapKwMatch(norm, ['TAMPON', 'BUMPER']), camurl = hapKwMatch(norm, ['CAMURLUK', 'DAVLUMBAZ', 'MUDGUARD', 'FENDER']);
            const kapiv = hapKwMatch(norm, ['KAPI', 'DOOR']);
            const kabinv = hapKwMatch(norm, ['KABIN', 'SASE', 'TORPIDO', 'TORPEDO', 'MOTOR', 'RADYATOR', 'INTERCOOLER', 'SILINDIR', 'FAN', 'WEBASTO', 'ABS', 'RADAR', 'AEBS', 'ACC', 'TESISAT', 'PERVANE', 'HORTUM', 'AKU', 'EXHAUST', 'EGZOZ', 'EGZOS']);
            const lastik = hapKwMatch(norm, ['LASTIK', 'TIRE']), jant = hapKwMatch(norm, ['JANT', 'WHEEL', 'RIM']);
            const camv = !camurl && (/(^|\s)CAM(\s|$)/.test(norm) || norm.includes('GLASS') || norm.includes('WINDSHIELD') || norm.includes('PENCERE')), aynav = hapKwMatch(norm, ['AYNA', 'MIRROR', 'DIKIZ']);
            let bId = null;
            if (lastik || jant) {
                let yon = "", taraf = "";
                if (on) yon = "f"; else if (arka) yon = "r"; else yon = "f";
                if (sag) taraf = "r"; else taraf = "l";
                bId = lastik ? `hap-z-w${yon}${taraf}` : `hap-z-r${yon}${taraf}`;
            }
            else if (camv) {
                if (on && !sol && !sag) bId = 'hap-z-fc';
                else if (arka && !sol && !sag) bId = 'hap-z-rc';
                else if (on && sol) bId = 'hap-z-fl';
                else if (on && sag) bId = 'hap-z-fr';
                else if (arka && sol) bId = 'hap-z-dl';
                else if (arka && sag) bId = 'hap-z-dr';
                else if (sol) bId = 'hap-z-dl';
                else if (sag) bId = 'hap-z-dr';
                else bId = 'hap-z-fc';
            }
            else if (aynav) bId = sol ? 'hap-z-ml' : sag ? 'hap-z-mr' : 'hap-z-ml';
            else if (farv) bId = sag ? 'hap-z-fr' : sol ? 'hap-z-fl' : 'hap-z-fc';
            else if (stopv) bId = sag ? 'hap-z-rr' : sol ? 'hap-z-rl' : 'hap-z-rc';
            else if (tampon) bId = on ? (sag ? 'hap-z-fr' : sol ? 'hap-z-fl' : 'hap-z-fc') : arka ? (sag ? 'hap-z-rr' : sol ? 'hap-z-rl' : 'hap-z-rc') : 'hap-z-fc';
            else if (camurl) bId = on ? (sag ? 'hap-z-fr' : sol ? 'hap-z-fl' : null) : (sag ? 'hap-z-rr' : sol ? 'hap-z-rl' : null);
            else if (kapiv || sol || sag) bId = sol ? 'hap-z-dl' : 'hap-z-dr';
            else if (on) bId = sol ? 'hap-z-fl' : sag ? 'hap-z-fr' : 'hap-z-fc';
            else if (arka) bId = sol ? 'hap-z-rl' : sag ? 'hap-z-rr' : 'hap-z-rc';
            else if (sol) bId = 'hap-z-dl';
            else if (sag) bId = 'hap-z-dr';
            else if (kabinv) bId = 'hap-z-ch';
            if (bId && res.bSayac[bId] !== undefined) { res.bSayac[bId]++; res.bTutar[bId] += tutar; if (camv) res.bCamSayac[bId]++; }
        });
        res.skor = Math.min(Math.round(((res.total * 0.15) + (res.toplamTutar / 25000) + (res.kritik * 1.5)) * 10) / 10, 10);
        return res;
    }
    /* ══════════════════════════════════════════════════
       PANEL GÜNCELLE
    ══════════════════════════════════════════════════ */
    function hapPanelGuncelle(sonuc) {
        if (!sonuc) return; window._hapLastSonuc = sonuc;
        /* Skor ring */
        const circ = 125.7;
        const arc = document.getElementById('hap-arc');
        const sv = document.getElementById('hap-skor-val');
        if (arc) { arc.setAttribute('stroke-dashoffset', (circ - circ * sonuc.skor / 10).toFixed(1)); arc.setAttribute('stroke', hapBdColor(Math.ceil(sonuc.skor))); }
        if (sv) { sv.textContent = sonuc.skor.toFixed(1); sv.style.color = hapScoreColor(Math.ceil(sonuc.skor)); }
        /* Chip sayaçlar */
        const setT = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
        setT('hap-chip-crit', sonuc.kritikTutar > 0 ? sonuc.kritikTutar.toLocaleString('tr-TR') + ' ₺ - ' + sonuc.kritik + ' adet Kritik' : sonuc.kritik + ' adet Kritik');
        setT('hap-chip-high', sonuc.yuksekTutar > 0 ? sonuc.yuksekTutar.toLocaleString('tr-TR') + ' ₺ - ' + sonuc.yuksek + ' adet Yüksek' : sonuc.yuksek + ' adet Yüksek');
        setT('hap-chip-tutar', sonuc.toplamTutar > 0 ? sonuc.toplamTutar.toLocaleString('tr-TR') + ' ₺ - ' + sonuc.total + ' adet Total' : '-- ₺');
        /* Sedan SVG path boyama */
        const svg = document.getElementById('hap-car-svg');
        if (svg) {
            HAP_BOLGELER.forEach(zoneId => {
                const n = sonuc.bSayac[zoneId] || 0, tl = sonuc.bTutar[zoneId] || 0, pathIds = HAP_ZONE_PATHS[zoneId] || [];
                pathIds.forEach(pid => {
                    const el = svg.querySelector('#' + pid);
                    if (!el) return;
                    if (n > 0) {
                        el.style.fill = hapBgColor(n); el.style.stroke = hapBdColor(n); el.style.strokeWidth = '1.5';
                    } else { el.style.fill = ''; el.style.stroke = ''; el.style.strokeWidth = ''; }
                });
                /* Sayaç text */
                const shortId = zoneId.replace('hap-z-', ''), cntEl = document.getElementById('hap-cnt-' + shortId), tlEl = document.getElementById('hap-tl-' + shortId);
                if (cntEl) { cntEl.textContent = n > 0 ? n : '0'; cntEl.style.fill = n > 0 ? hapScoreColor(n) : '#333'; }
                if (tlEl) { tlEl.textContent = n > 0 ? hapFmtTL(tl) : ''; tlEl.style.fill = hapScoreColor(n); }
            });
            const HAP_CAM_PATHS = { 'path-oncam': 'hap-z-fc', 'path-soloncam': 'hap-z-fl', 'path-sagoncam': 'hap-z-fr', 'path-arkacam': 'hap-z-rc', 'path-solarkacam': 'hap-z-dl', 'path-sagarkacam': 'hap-z-dr', };
            Object.entries(HAP_CAM_PATHS).forEach(([pid, zoneId]) => {
                const el = svg.querySelector('#' + pid);
                if (!el) return;
                const n = sonuc.bCamSayac[zoneId] || 0;
                if (n > 0) { el.style.fill = hapBgColor(n); el.style.stroke = hapBdColor(n); el.style.strokeWidth = '1.5'; } else { el.style.fill = '#1e2a38'; el.style.stroke = '#4c678f'; el.style.strokeWidth = '0.6'; }
            });
            /* Path click → tooltip */
            svg.querySelectorAll('path[data-zone]').forEach(p => {
                p.onclick = () => {
                    const zId = p.getAttribute('data-zone'), lbl = p.getAttribute('data-label'), camPathIds = ['path-oncam', 'path-soloncam', 'path-sagoncam', 'path-arkacam', 'path-solarkacam', 'path-sagarkacam'];
                    if (camPathIds.includes(p.id)) { const n = window._hapLastSonuc?.bCamSayac?.[zId] || 0; const tl = window._hapLastSonuc?.bTutar?.[zId] || 0; if (n === 0) return; }
                    hapShowTip(zId, lbl, window._hapLastSonuc);
                };
            });
        }
        /* Mekanik grid */
        HAP_MEK.forEach(p => {
            const d = sonuc.mekParcalar[p.id] || { n: 0, tl: 0 }, cell = document.getElementById('hap-mek-' + p.id), nEl = document.getElementById('hap-mek-n-' + p.id), tlEl = document.getElementById('hap-mek-tl-' + p.id);
            if (cell) { cell.style.background = d.n > 0 ? hapBgColor(d.n) : '#1a1a1a'; cell.style.borderColor = d.n > 0 ? hapBdColor(d.n) : '#2a2a2a'; }
            if (nEl) { nEl.textContent = d.n; nEl.style.color = d.n > 0 ? hapScoreColor(d.n) : '#555'; }
            if (tlEl) { tlEl.textContent = d.tl > 0 ? hapFmtTL(d.tl) : ''; tlEl.style.color = hapScoreColor(d.n); }
        });
        /* Elektrik grid */
        HAP_ELK.forEach(p => {
            const d = sonuc.elkParcalar[p.id] || { n: 0, tl: 0 }, cell = document.getElementById('hap-elk-' + p.id), nEl = document.getElementById('hap-elk-n-' + p.id), tlEl = document.getElementById('hap-elk-tl-' + p.id);
            if (cell) { cell.style.background = d.n > 0 ? hapBgColor(d.n) : '#1a1a1a'; cell.style.borderColor = d.n > 0 ? hapBdColor(d.n) : '#2a2a2a'; }
            if (nEl) { nEl.textContent = d.n; nEl.style.color = d.n > 0 ? hapScoreColor(d.n) : '#555'; }
            if (tlEl) { tlEl.textContent = d.tl > 0 ? hapFmtTL(d.tl) : ''; tlEl.style.color = hapScoreColor(d.n); }
        });
        const msg = sonuc.skor >= 7 ? 'Ağır hasar' : sonuc.skor >= 4 ? 'Orta-Yüksek hasar' : sonuc.skor >= 2 ? 'Orta hasar' : 'Hafif hasar';
        setT('hap-status-info', 'Skor ' + sonuc.skor.toFixed(1) + '/10 — ' + msg);
    }
    /* ══════════════════════════════════════════════════
       VERİ ÇEKME
    ══════════════════════════════════════════════════ */
    function hapVerileriGetir(dosyaId, currentHost) {
        const urls = [
            `${location.protocol}//${currentHost}/eks/eks_hasar_yp_list_pert.php?id=${dosyaId}`,
            `${location.protocol}//${currentHost}/eks/eks_hasar_yp_list.php?id=${dosyaId}`
        ];
        let count = 0, best = null;
        urls.forEach(url => {
            GM_xmlhttpRequest({
                method: 'GET', url, timeout: 8000,
                onload: res => {
                    count++;
                    if (res.status === 200) {
                        const rows = Array.from(new DOMParser().parseFromString(res.responseText, 'text/html').querySelectorAll('table tr'));
                        if (rows.length > 3) { const s = hapAnalizEt(rows); if (!best || s.total > best.total) best = s; }
                    }
                    if (count === urls.length) {
                        if (best && best.total > 0) hapPanelGuncelle(best);
                        else { const si = document.getElementById('hap-status-info'); if (si) si.textContent = 'Veri bulunamadı.'; }
                    }
                },
                onerror: () => { count++; if (count === urls.length && !best) { const si = document.getElementById('hap-status-info'); if (si) si.textContent = 'Bağlantı hatası.'; } }
            });
        });
    }
    window.hapVerileriGetir = hapVerileriGetir; window.hapPanelGuncelle = hapPanelGuncelle;
    /* ══════════════════════════════════════════════════════
       STYLE AND PANEL
    ══════════════════════════════════════════════════════ */
    const injectStyles = () => {
        if (document.getElementById('ks-dynamic-styles')) return;
        const style = document.createElement('style');
        style.id = 'ks-dynamic-styles';
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&display=swap');
            :root { --fontier: 'Exo 2', sans-serif !important; }
            /*body { transition: margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important; }
            body.ks-panel-open { margin-right: ${config.width} !important; width: calc(100% - ${config.width}) !important; overflow-x: hidden !important; }*/
			body:not(.ks-panel-open) { margin-right: 0 !important; width: 100% !important; overflow-x: auto !important; transition: margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
            /* ── Panel ── */
            .ks-draggable-panel {
                position: fixed !important;
                top: 0 !important; right: 0 !important; bottom: 0 !important;
                width: ${config.width};
                height: 100% !important;
                background: ${config.backColor};
                border-left: 1px solid ${config.themeColor}33;
                box-shadow: 0px 0px 10px 2px ${config.themeColor}66;
                display: flex; flex-direction: column;
                overflow: hidden;
                z-index: ${config.zIndex};
                transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
                transform: translateX(0);
                resize: none !important;
                user-select: none;
            }
            .ks-draggable-panel:hover,.ks-draggable-panel:active { background: color-mix(in srgb, ${config.backColor}, white 2%) !important; }
            .ks-draggable-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: ${config.backColor}33; z-index: 5; pointer-events: none; animation: ks-pulse 2.5s ease-in-out infinite; }
            .ks-draggable-panel::after { content: ''; position: absolute; top: 3px; left: 0; width: 12px; height: 12px; border-top: 1px solid ${config.themeColor}; border-left: 1px solid ${config.themeColor}; z-index: 5; pointer-events: none; }
            .ks-draggable-panel.collapsed { transform: translateX(${config.width}); }
            @keyframes ks-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
            @keyframes ks-scan  { to{transform:translateY(50%)} }
            @keyframes ksBlink  { 0%,100%{opacity:1} 50%{opacity:0.3} }
			.custom-line {
                border: 0; height: 1px; margin: 5px auto; display: block; width: 80%;
			    background: linear-gradient(90deg, #1a1a1a 0%, ${config.backColor} 40%, #1a1a1a 50%, ${config.backColor} 60%, #1a1a1a 100%);
			    background-size: 200% 100%;
			    animation: neonFlowslide 1.5s linear infinite;
			    box-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
			}
            @keyframes neonFlowslide { 0% { background-position: 200% 0%; } 100% { background-position: 0% 0%; } }
            .ks-scanline { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
            .ks-scanline::after {
                content: '';
                position: absolute; top: -100%; left: 0; width: 100%; height: 200%;
                background: repeating-linear-gradient( 0deg, transparent, transparent 3px, ${config.themeColor}08 3px, ${config.themeColor}08 4px );
                animation: ks-scan 10s linear infinite;
            }
            .ks-corner-br { position: absolute; bottom: 8px; right: 8px; width: 10px; height: 10px; border-bottom: 1px solid ${config.themeColor}33; border-right: 1px solid ${config.themeColor}33; pointer-events: none; z-index: 2; }
            #ks-panel-toggle {
                position: fixed !important;
				right: ${config.width};
                top: 50% !important;
                transform: translateY(-50%) !important;
                width: 22px !important; height: 54px !important;
                background: ${config.backColor} !important;
                border: 1px solid ${config.themeColor} !important;
                border-right: none !important;
                border-radius: 6px 0 0 6px !important;
                box-shadow: 0px 0px 10px 2px ${config.themeColor}66 !important;
                cursor: pointer !important;
                display: flex !important; flex-direction: column !important;
                align-items: center !important; justify-content: center !important;
                gap: 4px !important;
                z-index: ${Number(config.zIndex) - 10} !important;
                transition: right 0.4s cubic-bezier(0.4,0,0.2,1), background 0.2s ease !important;
            }
            #ks-panel-toggle:hover { background: ${config.themeColor}80 !important; box-shadow: 0px 0px 5px 2px ${config.themeColor}66 !important; }
            .ks-tbar { width: 9px; height: 1.5px; background: white; display: block; transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease; }
            #ks-panel-toggle.ks-closed .ks-tbar:nth-child(1) { transform: translateY(2.5px) rotate(-45deg); }
            #ks-panel-toggle.ks-closed .ks-tbar:nth-child(2) { opacity: 0; width: 0; }
            #ks-panel-toggle.ks-closed .ks-tbar:nth-child(3) { transform: translateY(-2.5px) rotate(45deg); }
            /* ── Header ── */
            .ks-header {
                display: flex; align-items: center;
                flex-shrink: 0; padding: 8px 10px;
                border-bottom: 1px solid ${config.themeColor};
                background: #383838;
                cursor: pointer; z-index: 2; gap: 12px;
				filter: brightness(1.3); font-weight: 700;
            }
            .ks-header:hover { background: white; }
            .ks-title-diamond { width: 12px; height: 12px; background: ${config.themeColor}; transform: rotate(45deg); flex-shrink: 0; animation: ks-pulse 2.5s ease-in-out infinite; }
            .ks-title-wrap { display: flex; flex-direction: column; flex: 1; }
            .ks-title-text { font-family: var(--fontier); font-size: 12px; font-weight: 700; color: ${config.themeColor}; letter-spacing: 2px; text-transform: uppercase; pointer-events: none; }
            .ks-title-sub { font-family: var(--fontier); font-size: 10px; color: ${config.themeColor}; letter-spacing: 1.5px; text-transform: uppercase; pointer-events: none; }
            .ks-header-ver { font-family: var(--fontier); font-size: 11px; color: ${config.themeColor}; border: 1px solid ${config.themeColor}; padding: 1px 4px; letter-spacing: 1px; flex-shrink: 0; }
            /* ── İçerik ── */
            .ks-content {
                overflow-y: auto; overflow-x: hidden;
                padding: 6px; display: flex; flex-direction: column; gap: 4px;
                color: ${config.Color}; box-sizing: border-box;
                position: relative; z-index: 1;
                scrollbar-width: thin;
                scrollbar-color: color-mix(in srgb, ${config.themeColor}80, white 5%)  transparent;
            }
            .ks-content::-webkit-scrollbar { width: 2px; }
            .ks-content::-webkit-scrollbar-thumb { background: color-mix(in srgb, ${config.themeColor}44, white 5%); }
            .ks-content * { max-width: 100% !important; box-sizing: border-box !important; }
            /* ── Butonlar ── */
            .ks-btn {
                background: #0c5e9dd9; color: white !important;
                border: 1px solid ${config.themeColor};
                padding: 5px 6px; font-family: var(--fontier);
                font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
                cursor: pointer; text-transform: uppercase;
                transition: all 0.15s ease; outline: none; width: 100%;
                height: 100%;
            }
            .ks-btn:hover { background: ${config.themeColor}30; color: #fff !important; border-color: ${config.themeColor}77; }
            .ks-btn:active { transform: translateY(1px); }
            .ks-btn-danger {
                background: #d61111cf !important; color: #ffffff !important;
                border: 1px solid rgba(220,50,50,0.3) !important;
                padding: 5px 6px; font-family: var(--fontier);
                font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
                cursor: pointer; text-transform: uppercase;
                transition: all 0.15s ease; outline: none; width: 100%;
            }
            .ks-btn-danger:hover { background: rgba(220,50,50,0.22) !important; color: #fff !important; border-color: rgba(220,50,50,0.6) !important; }
            .ks-btn-danger:active { transform: translateY(1px); }
            .ks-divider { border: none; border-top: 1px solid ${config.themeColor}10; margin: 3px 0; flex-shrink: 0; }
            .ks-grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; width: 100%; }
            #panelContent table td { font-family: var(--fontier); font-size: 11px; }
            #shb-res-box { font-size: 11px; color: ${config.Color}; margin: 2px 0; text-align: center; }
            #page-note-input {
                font-family: var(--fontier);
                background: #22252b !important; color: #ccc !important;
                border: 1px solid ${config.themeColor}1a !important;
                border-left: 2px solid ${config.themeColor}55 !important;
                outline: none !important; resize: vertical !important; font-size: 11px !important;
            }
            #page-note-input:focus { border-color: ${config.themeColor}44 !important; border-left-color: ${config.themeColor} !important; }
            /* ── Tooltip ── */
            .ks-tooltip-container { position: relative; display: block; width: 100%; }
            .ks-tooltip-box { display: none !important; }
            #ks-dynamic-tooltip {
                position: fixed;
                z-index: ${Number(config.zIndex) + 100000};
                max-width: 220px; padding: 0;
                background: #17181be6;
                border: 1px solid ${config.themeColor};
                border-left: 2px solid ${config.themeColor};
                color: #fff; font-family: var(--fontier);
                font-size: 12px; line-height: 1.2;
                pointer-events: none; opacity: 0; visibility: hidden;
                transition: opacity 0.15s ease;
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            }
            #ks-dynamic-tooltip.visible { opacity: 1; visibility: visible; }
            #ks-dynamic-tooltip .ks-tip-head { padding: 6px 10px 5px; border-bottom: 1px solid ${config.themeColor}; background: ${config.themeColor}0f; }
            #ks-dynamic-tooltip .ks-tip-head strong { display: block; color: color-mix(in srgb, ${config.themeColor}, white 80%); filter: brightness(1.3); font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.3px; }
            #ks-dynamic-tooltip .ks-tip-body { padding: 7px 10px 8px; font-size: 11px; color: #a8b4c0; }

            /* ════ HASAR PANELİ STİLLERİ ════ */
            #hasar-section { padding:4px 0; }
            #hap-score-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
            #hap-ring-wrap { position:relative; width:50px; height:50px; flex-shrink:0; }
            #hap-skor-val  { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:13px; font-weight:700; color:#fff; }
            #hap-chips { display:flex; flex-direction:column; gap:2px; flex:1; }
            .hap-chip { font-size:11px; padding:2px 6px; border-radius:8px; font-weight:600; white-space:nowrap; display:inline-block; }
            .hap-chip-n { background:#222; color:#aaa; border:1px solid #333; }
            .hap-chip-r { background:#2e0808; color:#E24B4A; border:1px solid #7a1f1f; }
            .hap-chip-y { background:#2e1f08; color:#EF9F27; border:1px solid #7a4f0f; }
            .hap-chip-b { background:#0a1e2e; color:#5aa8e0; border:1px solid #1a3e5e; }
            #hap-tabs { display:flex; border-bottom:1px solid #333; margin:6px 0 4px; }
            .hap-tab { flex:1; font-size:10px; padding:4px 2px; background:none; border:none; color:#FFF; cursor:pointer; font-family:monospace; text-transform:uppercase; letter-spacing:.04em; border-bottom:2px solid transparent; transition:.15s; }
            .hap-tab.active { color:#00d4ff; border-bottom-color:#00d4ff; }
            /* Sedan SVG path hover */
            #hap-car-svg path[data-zone] { transition:fill .2s, stroke .2s; }
            #hap-car-svg path[data-zone]:hover { opacity:.85; }
            /* Mekanik/Elektrik grid */
            .hap-mek-grid	{ display:grid; grid-template-columns:1fr; gap:3px; }
            .hap-mek-cell	{ background:#1a1a1a; border:1px solid #2a2a2a; border-radius:4px; padding:4px 6px; display:flex; align-items:center; gap:4px; transition:background .25s, border-color .25s; }
            .hap-mek-label 	{ font-size:12px; color:#FFF; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            .hap-mek-val   	{ font-size:13px; font-weight:700; color:#e1e1e1; min-width:16px; text-align:right; }
            .hap-mek-tl    	{ font-size:11px; color:#b0b0b0; min-width:32px; text-align:right; }
            .hap-mek-badge 	{ font-size:10px; padding:1px 4px; border-radius:6px; flex-shrink:0; }
            #hap-leg 		{ display:flex; gap:6px; flex-wrap:wrap; margin:4px 0 2px; }
            .hap-leg-item 	{ display:flex; align-items:center; gap:2px; font-size:9px; color:#555; }
            .hap-leg-dot  { width:6px; height:6px; border-radius:50%; }
            #hap-status-info { font-size:11px; color:#ff9800; border-top:1px solid #222; padding-top:4px; margin-top:2px; text-align:center; }
			.main-tabs 		 { display: flex; border-bottom: 1px solid #333; border-radius:3px; margin-bottom: 1px; background: #151515; }
			.main-tab 		 { flex: 1; padding: 5px; border-radius:3px; background: transparent; color: #666; border: none; cursor: pointer; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid transparent; }
			.main-tab.active { color: #fff; border-bottom: 2px solid ${config.themeColor}; background: #222; }
			.tab-panel-content 		  { display: none; padding: 5px; }
			.tab-panel-content.active { display: block; }
            .hap-view 		 { display:none; }
            .hap-view.active { display:block; }
        `;
        document.head.appendChild(style);
    };
    const initPanel = () => {
        if (document.getElementById('ks-master-panel')) return;
        const bodyStyle = `
        body.ks-panel-open { margin-right: ${config.width}; overflow-x: hidden !important; transition: margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        #ks-content { max-height: calc(100vh - 60px); overflow-y: auto; scrollbar-width: thin; scrollbar-color: #333 #1a1a2e; }
		#ks-content::-webkit-scrollbar { width: 5px; }
		#ks-content::-webkit-scrollbar-track { background: #1a1a2e; }
		#ks-content::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        `;
        injectStyles(bodyStyle);
        const isCollapsedSaved = localStorage.getItem('ks-panel-collapsed') === 'true';
        const panel = document.createElement('div');
        panel.className = 'ks-draggable-panel';
        panel.id = 'ks-master-panel';
        const scriptVersion = (typeof GM_info !== 'undefined') ? 'v' + GM_info.script.version : 'v1.0';
        panel.innerHTML = `
            <div class="ks-scanline"></div>
            <div class="ks-corner-br"></div>
            <div class="ks-header" id="ks-header" style="cursor: pointer;">
                <div class="ks-title-diamond"></div>
                <div class="ks-title-wrap">
                    <span class="ks-title-text" id="ks-panel-title">KS TOOLS</span>
                    <span class="ks-title-sub" id="ks-panel-subtitle">PANEL</span>
                </div>
                <span class="ks-header-ver">${scriptVersion}</span>
            </div>
            <div class="ks-content" id="ks-content">Yükleniyor...</div>
        `;
        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'ks-panel-toggle';
        toggleBtn.title = 'Paneli Aç / Kapat';
        toggleBtn.innerHTML = `<span class="ks-tbar"></span><span class="ks-tbar"></span><span class="ks-tbar"></span>`;
        document.body.appendChild(panel);
        document.body.appendChild(toggleBtn);
        const content = document.getElementById('ks-content');
        let isScrolling = false, startY, scrollStart;
        content.addEventListener('mousedown', (e) => { isScrolling = true; startY = e.pageY - content.offsetTop; scrollStart = content.scrollTop; content.style.cursor = 'grabbing'; content.style.userSelect = 'none'; });
        document.addEventListener('mousemove', (e) => { if (!isScrolling) return; e.preventDefault(); const y = e.pageY - content.offsetTop; const walk = (y - startY) * 1.5; content.scrollTop = scrollStart - walk; });
        document.addEventListener('mouseup', () => { isScrolling = false; content.style.cursor = 'default'; content.style.userSelect = 'auto'; });
        const applyState = (collapsed) => {
            panel.classList.toggle('collapsed', collapsed);
            toggleBtn.classList.toggle('ks-closed', collapsed);
            document.body.classList.toggle('ks-panel-open', !collapsed);
            toggleBtn.style.right = collapsed ? '0px' : config.width;
            if (!collapsed) { document.body.style.marginRight = config.width; document.body.style.width = `calc(100% - ${config.width})`; }
            else { document.body.style.marginRight = '0px'; document.body.style.width = '100%'; setTimeout(() => { window.scrollTo({ left: 0, behavior: 'smooth' }); document.documentElement.scrollLeft = 0; document.body.scrollLeft = 0; }, 400); }
            localStorage.setItem('ks-panel-collapsed', String(collapsed));
        };
        applyState(isCollapsedSaved);
        toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); applyState(!panel.classList.contains('collapsed')); });
    };
    /* ══════════════════════════════════════════════════════
       TOOLTIP
    ══════════════════════════════════════════════════════ */
    const tooltip = document.createElement('div'); tooltip.id = 'ks-dynamic-tooltip';
    document.body.appendChild(tooltip);
    document.addEventListener('mouseover', (e) => {
        const container = e.target.closest('.ks-tooltip-container');
        if (!container) return;
        const box = container.querySelector('.ks-tooltip-box');
        if (!box) return;
        const rawHTML = box.innerHTML.trim();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawHTML;
        const strongEl = tempDiv.querySelector('strong');
        const headText = strongEl ? strongEl.outerHTML : '';
        if (strongEl) strongEl.remove();
        const bodyText = tempDiv.innerHTML.trim();
        tooltip.innerHTML = `<div class="ks-tip-head">${headText}</div><div class="ks-tip-body">${bodyText}</div>`;
        const tipColor = container.dataset.tipColor || config.themeColor;
        tooltip.style.borderLeftColor = tipColor;
        tooltip.style.borderColor = tipColor + '44';
        tooltip.style.borderLeftColor = tipColor;
        const head = tooltip.querySelector('.ks-tip-head strong');
        if (head) head.style.color = tipColor;
        tooltip.classList.add('visible');
    });
    document.addEventListener('mousemove', (e) => {
        if (!tooltip.classList.contains('visible')) return;
        const gap = 16;
        const tw = tooltip.offsetWidth;
        const th = tooltip.offsetHeight;
        let left = Math.max(8, Math.min(e.clientX - tw / 2, window.innerWidth - tw - 8));
        let top = e.clientY - th - gap;
        if (top < 8) top = e.clientY + gap;
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    });
    document.addEventListener('mouseout', (e) => { if (e.target.closest('.ks-tooltip-container')) tooltip.classList.remove('visible'); });
    /* ══════════════════════════════════════════════════════
       UNLOCK
    ══════════════════════════════════════════════════════ */
    const SELECTOR = '[disabled],.disabled,[readonly],[aria-readonly="true"],[aria-disabled="true"],.ks-unlocked,.dx-texteditor-input';
    const STYLE_PROPS = { 'pointer-events': 'auto', 'opacity': '1', 'background-color': '#fff', 'border': '1px solid #e4e4e4', 'cursor': 'text', };
    function unlockElement(el) {
        try {
            if (el.disabled) { el.dataset.wdDisabled = '1'; el.disabled = false; }
            if (el.readOnly || el.hasAttribute('readonly') || el.getAttribute('aria-readonly') === 'true') {
                el.dataset.wrReadonly = '1'; el.readOnly = false; el.removeAttribute('readonly'); el.setAttribute('aria-readonly', 'false');
            }
            if (el.classList.contains('disabled')) { el.dataset.wcClass = '1'; el.classList.remove('disabled'); }
            el.dataset.wOrigStyle = el.getAttribute('style') || '';
            el.classList.add('ks-unlocked');
            Object.entries(STYLE_PROPS).forEach(([p, v]) => el.style.setProperty(p, v, 'important'));
        } catch (err) { console.warn('[unlockElement] hata:', err, el); }
    }
    function lockElement(el) {
        try {
            if (el.dataset.wdDisabled) { el.disabled = true; delete el.dataset.wdDisabled; }
            if (el.dataset.wrReadonly) {
                el.readOnly = true; el.setAttribute('readonly', 'true'); el.setAttribute('aria-readonly', 'true'); delete el.dataset.wrReadonly;
            }
            if (el.dataset.wcClass) { el.classList.add('disabled'); delete el.dataset.wcClass; }
            const orig = el.dataset.wOrigStyle;
            if (orig !== undefined) { el.setAttribute('style', orig); delete el.dataset.wOrigStyle; }
            else { Object.keys(STYLE_PROPS).forEach(p => el.style.removeProperty(p)); }
            el.classList.remove('ks-unlocked');
        } catch (err) { console.warn('[lockElement] hata:', err, el); }
    }
    function collectElements(root = document) { const els = [...root.querySelectorAll(SELECTOR)]; root.querySelectorAll('*').forEach(node => { if (node.shadowRoot) els.push(...collectElements(node.shadowRoot)); }); return els; }
    let _observer = null;
    function startObserver() {
        if (_observer) return;
        _observer = new MutationObserver((mutations) => {
            mutations.forEach((m) => { m.addedNodes.forEach((node) => { if (node.nodeType !== Node.ELEMENT_NODE) return; const targets = node.matches(SELECTOR) ? [node] : [...node.querySelectorAll(SELECTOR)]; targets.forEach(unlockElement); }); });
        });
        _observer.observe(document.body, { childList: true, subtree: true });
    }
    function stopObserver() { _observer?.disconnect(); _observer = null; }
    const unlockAllElements = (s) => {
        const els = collectElements(); els.forEach(s ? unlockElement : lockElement); s ? startObserver() : stopObserver(); window._ksUnlocked = s; console.info(`[unlockAllElements] ${s ? 'Unlocked' : 'Locked'} — ${els.length} eleman`);
    };
    Object.defineProperty(window, 'isUnlocked', { get: () => window._ksUnlocked ?? false, set: (v) => unlockAllElements(!!v), configurable: true, });
    /* ══════════════════════════════════════════════════════
       STATUS BAR & SETTINGS MODAL
    ══════════════════════════════════════════════════════ */
    const WARNING_COLOR = 'rgb(250, 250, 150)', SUCCESS_COLOR = '#00ff88', PANEL_ID = 'ks-global-status-indicator';
    if (window.self === window.top) {
        const injectFonts = () => {
            if (document.getElementById('ks2-fonts')) return;
            const link = document.createElement('link');
            link.id = 'ks2-fonts'; link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap';
            document.head.appendChild(link);
        };
        if (!document.getElementById(PANEL_ID + '-style')) {
            injectFonts();
            const style = document.createElement("style");
            style.id = PANEL_ID + '-style';
            style.innerText = `
                #${PANEL_ID} {
                    position: fixed !important; bottom: ${config.bottom} !important; left: ${config.right} !important;
                    height: 24px !important; width: 24px !important;
                    background: rgba(10, 10, 10, 0.60) !important; backdrop-filter: blur(${config.blur}) !important;
                    color: white !important; font-family: var(--fontier); font-size: 12px !important; font-weight: 800 !important;
                    z-index: ${Number(config.zIndex) + 9999} !important;
                    display: flex !important; align-items: center !important; justify-content: center !important;
                    overflow: hidden !important; white-space: nowrap !important; cursor: pointer !important;
                    border-radius: 0px 12px 0px 12px !important; border: 2px solid ${config.themeColor} !important;
                    box-shadow: 0px 0px 10px 1px ${config.themeColor}66 !important;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
                    animation: ks-glow-pulse 3s infinite ease-in-out !important;
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
                	font-family: var(--fontier);
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
            	    width: 250px; flex-shrink: 0;
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
            	.ks2-brand { padding: 10px 4px; border-bottom: 1px solid var(--ks2-bd); }
            	.ks2-brand-hex { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
            	.ks2-brand-diamond {
            	    width: 30px; height: 30px; flex-shrink: 0;
            	    border: 1px solid var(--ks2-cy);
            	    display: flex; align-items: center; justify-content: center;
            	    transform: rotate(45deg);
            	}
            	.ks2-brand-diamond-inner { width: 10px; height: 10px; background: var(--ks2-cy); }
            	.ks2-brand-title {
            	    font-family: var(--fontier);
            	    font-size: 13px; color: var(--ks2-cy); letter-spacing: 2px; line-height: 1.2;
            	}
            	.ks2-brand-sub {
            	    font-family: var(--fontier);
            	    font-size: 14px; color: var(--ks2-txt2); letter-spacing: 2px;
            	}
            	.ks2-sys-row {
            	    display: flex; align-items: center; justify-content: space-between;
            	    padding-top: 15px; border-top: 1px solid var(--ks2-bd);
            	}
            	.ks2-sys-lbl {
            	    font-family: var(--fontier);
            	    font-size: 9px; color: var(--ks2-txt3); letter-spacing: 1px;
            	}
            	.ks2-sys-on {
            	    display: flex; align-items: center; gap: 5px;
            	    font-family: var(--fontier);
            	    font-size: 10px; color: var(--ks2-cy3);
            	}
            	.ks2-pulse {
            	    width: 6px; height: 6px; background: var(--ks2-cy3); border-radius: 50%;
            	    animation: ks2-pulse 1.5s infinite;
            	}
            	@keyframes ks2-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
            	.ks2-nav { padding: 8px; flex: 1; overflow-y: auto; font-size: 20px;}
            	.ks2-nav-sec {
            	    padding-bottom: 10px;
            	    font-family: var(--fontier);
            	    font-size: 15px; color: var(--ks2-txt2); letter-spacing: 2px;
            	}
            	.ks2-nav-item {
            	    display: flex; align-items: center; gap: 10px;
            	    padding-top: 2px; cursor: pointer;
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
            	    font-family: var(--fontier);
            	    font-size: 12px; padding: 2px 10px;
            	    background: rgba(0,212,255,0.1); color: var(--ks2-cy2);
            	    border: 1px solid var(--ks2-bd2);
            	}
            	.ks2-sidebar-bottom { padding: 12px 16px; border-top: 1px solid var(--ks2-bd); }
            	.ks2-theme-row {
            	    display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
            	}
            	.ks2-theme-lbl {
            	    font-family: var(--fontier);
            	    font-size: 11px; color: var(--ks2-txt2); letter-spacing: 1.2px;
            	}
            	.ks2-ver-tag {
            	    font-family: var(--fontier);
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
            	.ks2-bracket { font-family: var(--fontier); font-size: 9px;}
            	.ks2-topbar-title { font-size: 13px; font-weight: 700; letter-spacing: 1px; color: var(--ks2-txt); }
            	.ks2-ctrl-row { display: flex; align-items: center; gap: 10px; }
            	.ks2-ctrl-lbl { font-family: var(--fontier); font-size: 11px; letter-spacing: 1px; }
            	/* Toggle Switch */
            	.ks2-sw { position: relative; width: 42px; height: 20px; cursor: pointer; }
            	.ks2-sw input { opacity: 0; width: 0; height: 0; position: absolute; }
            	.ks2-sw-track { position: absolute; inset: 0; background: #1a1f2e; border: 1px solid #3d5470; transition: .2s; }
            	.ks2-sw-track::before { content: ''; position: absolute; width: 14px; height: 12px; top: 3px; left: 3px; background: #3d5470; transition: .2s; }
            	.ks2-sw input:checked + .ks2-sw-track { background: rgba(0,212,255,0.1); border-color: var(--ks2-cy); }
            	.ks2-sw input:checked + .ks2-sw-track::before { transform: translateX(22px); background: var(--ks2-cy); }
            	/* Content & Sections */
            	.ks2-content {
            	    flex: 1; overflow-y: auto; padding: 10px;
            	    scrollbar-width: thin; scrollbar-color: var(--ks2-cy) transparent;
            	}
            	.ks2-content::-webkit-scrollbar { width: 3px; }
            	.ks2-content::-webkit-scrollbar-thumb { background: var(--ks2-cy); }
            	.ks2-sec-view { display: none; }
            	.ks2-sec-view.ks2-active { display: block; }
            	/* Bulk Buttons */
            	.ks2-bulk-row { display: flex; margin-bottom: 12px; }
            	.ks2-bulk-btn {
            	    flex: 1; position: relative; cursor: pointer;
            	    background: var(--ks2-bg3); border: none; outline: none;
            	    font-family: var(--fontier);
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
            	    bottom:0; width: 100%; height: 2px;
            	    background: rgba(0,212,255,0.03); transition: background .2s;
            	}
            	.ks2-mod-card.ks2-on::before { background: var(--ks2-cy); }
            	.ks2-mod-card:hover { border-color: var(--ks2-cy2); background: rgba(0,212,255,0.03); }
            	.ks2-mod-card:hover::before { background: var(--ks2-cy); }
            	.ks2-corner { position: absolute; width: 8px; height: 8px; border-color: var(--ks2-cy); border-style: solid; opacity: 0; transition: opacity .2s; }
            	.ks2-corner-tl { top: 4px; left: 4px; border-width: 1px 0 0 1px; }
            	.ks2-corner-br { bottom: 4px; right: 4px; border-width: 0 1px 1px 0; }
            	.ks2-mod-card:hover .ks2-corner, .ks2-mod-card.ks2-on .ks2-corner { opacity: 1; }
            	.ks2-card-top { display: flex; align-items: flex-start; justify-content: space-between; }
            	.ks2-card-icon {
            	    width: 32px; height: 32px; flex-shrink: 0;
            	    border: 0px solid var(--ks2-bd2);
            	    display: flex; align-items: center; justify-content: center;
            	    font-size: 14px; background: var(--ks2-bg2); transition: border-color .2s, background .2s;
            	}
            	.ks2-mod-card.ks2-on .ks2-card-icon { border-color: var(--ks2-cy); background: rgba(0,212,255,0.06); }
            	.ks2-card-title { font-size: 12px; font-weight: 700; color: var(--ks2-txt); margin-bottom: 3px; letter-spacing: .5px; padding-left: 10px;  }
            	.ks2-card-desc { font-family: var(--fontier); font-size: 13px; color: var(--ks2-txt2); line-height: 1.2; padding-left: 8px; }
            	.ks2-card-footer {
            	    display: flex; align-items: center; justify-content: space-between;
            	    margin-top: 8px; border-top: 1px solid var(--ks2-bd);
            	}
            	.ks2-status-pill {
            	    font-family: var(--fontier);
            	    font-size: 13px; padding: 2px 8px; border: 1px solid; transition: .2s; left:0;
            	}
            	.ks2-mod-card.ks2-on .ks2-status-pill { color: var(--ks2-cy3); border-color: rgba(0,255,157,0.27); background: rgba(0,255,157,0.06); }
            	.ks2-mod-card:not(.ks2-on) .ks2-status-pill { color: var(--ks2-txt3); border-color: rgba(61,84,112,0.5); }
            	.ks2-sub-tag {
            	    font-family: var(--fontier);
            	    font-size: 11px; color: var(--ks2-txt2); letter-spacing: .5px;
            	    padding: 2px 8px; border: 1px solid var(--ks2-bd);
            	}
            	/* ── Footer ── */
            	.ks2-footer {
            	    padding: 12px 18px; flex-shrink: 0;
            	    border-top: 1px solid var(--ks2-bd);
            	    background: var(--ks2-bg1);
            	    display: flex; align-items: center; justify-content: space-between;
            	}
            	.ks2-footer-stats { display: flex; align-items: center; gap: 26px; }
            	.ks2-stat-val { text-align:center; font-family: var(--fontier); font-size: 18px; color: var(--ks2-cy); font-weight: 700; line-height: 1.2; }
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
            	    font-family: var(--fontier);
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
				/*---------------------------------------------------*/
				    /* ── Panel kapsayıcı ── */
                #pj-panel {
                    position: fixed;
                    top: 60px;
                    left: -1;                          /* right:0 → left:0 */
                    border-left: none;                /* border-right:none → border-left:none */
                    border-radius: 0 12px 12px 0;     /* köşeler ayna çevrildi */
                   /* box-shadow: 4px 0 24px rgba(0,0,0,.5);   gölge yönü değişti */
                    z-index: 2147483647;
                    width: 240px;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    font-size: 12px;
                    color: #dde;
                    background: #13131c;
                    border: 1px solid #252538;
                    border-right: none;
                    display: flex;
                    flex-direction: column;
                    max-height: calc(100vh - 100px);
                    transition: transform .25s ease;
                }
                #pj-panel.pj-collapsed { transform: translateX(-240px); }

                /* ── Toggle tab ── */
                #pj-toggle {
                    position: absolute;
                    right: -28px;      /* left:-28px → right:-28px */
                    left: auto;
                    border-radius: 0 8px 8px 0;      /* ayna çevrildi */
                    box-shadow: 3px 0 12px rgba(230,57,70,.4);
                    top: 50%;
                    transform: translateY(-50%);
                    width: 28px;
                    height: 64px;
                    background: #e63946;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-size: 14px;
                    writing-mode: vertical-rl;
                    letter-spacing: 1px;
                    font-weight: 700;
                }

                /* ── Sekme başlıkları ── */
                #pj-tabs {
                    display: flex;
                    border-bottom: 1px solid #252538;
                    flex-shrink: 0;
                }
                .pj-tab {
                    flex: 1;
                    padding: 8px 4px;
                    text-align: center;
                    cursor: pointer;
                    font-size: 10px;
                    font-weight: 600;
                    color: #666688;
                    background: none;
                    border: none;
                    border-radius: 12px 0 0 0;
                    transition: color .15s, background .15s;
                    letter-spacing: .3px;
                }
                .pj-tab:last-child { border-radius: 0; }
                .pj-tab.active {
                    color: #e63946;
                    background: #1a1a28;
                    border-bottom: 2px solid #e63946;
                }

                /* ── Sekme içerikleri ── */
                .pj-pane {
                    display: none;
                    flex-direction: column;
                    overflow-y: auto;
                    padding: 10px;
                    gap: 8px;
                    flex: 1;
                }
                .pj-pane.active { display: flex; }

                /* ── Genel elemanlar ── */
                .pj-label {
                    font-size: 10px;
                    color: #5a5a78;
                    text-transform: uppercase;
                    letter-spacing: .4px;
                    margin-bottom: 2px;
                }
                .pj-drop {
                    border: 1.5px dashed #2e2e48;
                    border-radius: 8px;
                    padding: 12px 6px;
                    text-align: center;
                    cursor: pointer;
                    transition: border-color .2s, background .2s;
                    font-size: 11px;
                    color: #6666aa;
                    line-height: 1.5;
                }
                .pj-drop:hover, .pj-drop.drag-over {
                    border-color: #e63946;
                    background: rgba(230,57,70,.06);
                }
                .pj-drop .di { font-size: 22px; display: block; margin-bottom: 4px; }
                input[type=file].pj-hidden { display: none; }

                select.pj-sel, input.pj-input {
                    width: 100%;
                    box-sizing: border-box;
                    background: #1c1c2a;
                    border: 1px solid #2e2e48;
                    border-radius: 6px;
                    color: #dde;
                    padding: 5px 8px;
                    font-size: 11px;
                    outline: none;
                }
                select.pj-sel:focus, input.pj-input:focus { border-color: #e63946; }

                .pj-row { display: flex; gap: 6px; align-items: center; }
                .pj-row > * { flex: 1; }

                input[type=range].pj-range {
                    width: 100%;
                    accent-color: #e63946;
                    cursor: pointer;
                    margin: 0;
                }
                .pj-rval {
                    font-size: 11px;
                    color: #e63946;
                    font-weight: 700;
                    min-width: 28px;
                    text-align: right;
                    flex: none;
                }

                .pj-btn {
                    width: 100%;
                    padding: 7px;
                    border-radius: 7px;
                    border: none;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: opacity .15s, transform .1s;
                    letter-spacing: .3px;
                }
                .pj-btn:active { transform: scale(.97); }
                .pj-btn-red  { background: linear-gradient(135deg,#e63946,#c1121f); color:#fff; }
                .pj-btn-gray { background: #242436; color:#8888aa; }
                .pj-btn:disabled { opacity:.4; cursor:not-allowed; }

                /* ── Temizleme Buton Stili ── */
                .pj-clear-btn {
                    background: none;
                    border: none;
                    color: #8888aa;
                    font-size: 10px;
                    cursor: pointer;
                    float: right;
                    padding: 0;
                    text-decoration: underline;
                }
                .pj-clear-btn:hover { color: #e63946; }
                .pj-clear-btn:disabled { color: #333344; cursor: not-allowed; text-decoration: none; }

                /* ── İlerleme ── */
                .pj-progress { display: none; }
                .pj-track {
                    height: 4px;
                    background: #252538;
                    border-radius: 99px;
                    overflow: hidden;
                    margin-bottom: 4px;
                }
                .pj-fill {
                    height: 100%;
                    background: linear-gradient(90deg,#e63946,#ff7070);
                    border-radius: 99px;
                    transition: width .2s;
                    width: 0;
                }
                .pj-status { font-size: 10px; color: #5a5a78; }

                /* ── Dosya listesi ── */
                .pj-filelist {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    max-height: 80px;
                    overflow-y: auto;
                }
                .pj-filetag {
                    background: #1c1c2a;
                    border-radius: 5px;
                    padding: 3px 6px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 10px;
                    color: #9090b8;
                }
                .pj-filetag span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; }
                .pj-filetag button {
                    background: none; border: none; color: #e63946;
                    cursor: pointer; font-size: 12px; padding: 0 0 0 4px; flex-shrink: 0;
                }

                /* ── Sonuç önizleme ── */
                .pj-results { display: none; flex-direction: column; gap: 6px; }
                .pj-result-item {
                    background: #1a1a28;
                    border-radius: 7px;
                    padding: 6px 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .pj-result-item img {
                    width: 36px;
                    height: 36px;
                    object-fit: cover;
                    border-radius: 4px;
                    flex-shrink: 0;
                    background: #111;
                }
                .pj-result-info { flex: 1; overflow: hidden; }
                .pj-result-name { font-size: 10px; color: #aab; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .pj-result-size { font-size: 9px; color: #5a5a78; }
                .pj-result-dl {
                    background: #e63946; color: #fff; border: none;
                    border-radius: 5px; padding: 4px 7px;
                    cursor: pointer; font-size: 10px; font-weight: 700;
                    flex-shrink: 0;
                }
                .pj-dl-all-wrap { display: none; }

                /* ── Scrollbar ── */
                #pj-panel ::-webkit-scrollbar { width: 4px; }
                #pj-panel ::-webkit-scrollbar-track { background: transparent; }
                #pj-panel ::-webkit-scrollbar-thumb { background: #2e2e48; border-radius: 4px; }

                /* ── Bölücü ── */
                .pj-sep { border: none; border-top: 1px solid #252538; margin: 0; }

            `;
            document.head.appendChild(style);
        }
		 /* ═══════════════════════════════════════════════════════
            HTML
         ═══════════════════════════════════════════════════════ */
         const panel = document.createElement('div');
         panel.id = 'pj-panel';
         panel.innerHTML = `
             <button id="pj-toggle" title="Paneli kapat" style="display: none;">❌</button>

             <!-- SEKMELER -->
             <div id="pj-tabs">
                 <button class="pj-tab active" data-tab="pdf">📄 PDF→JPG</button>
                 <button class="pj-tab"        data-tab="jpg">🖼 JPG Sıkıştır</button>
             </div>

             <!-- ══ PDF→JPG PANE ══ -->
             <div class="pj-pane active" id="pj-pane-pdf">

                 <!-- Çoklu dosya drop -->
                 <div class="pj-drop" id="pdf-drop">
                     <span class="di">📂</span>
                     <strong>PDF seç / sürükle</strong><br>
                     <span style="font-size:10px;color:#555577">Birden fazla dosya desteklenir</span>
                 </div>
                 <input type="file" class="pj-hidden" id="pdf-input" accept=".pdf" multiple>

                 <!-- Dosya listesi -->
                 <div>
                     <button class="pj-clear-btn" id="pdf-clear" disabled>Temizle</button>
                     <div class="pj-label">Seçilen Dosyalar</div>
                 </div>
                 <div class="pj-filelist" id="pdf-filelist"></div>

                 <hr class="pj-sep">

                 <!-- Format -->
                 <div>
                     <div class="pj-label">Format</div>
                     <select class="pj-sel" id="pdf-format">
                         <option value="image/jpeg" selected>JPG</option>
                         <option value="image/png">PNG</option>
                         <option value="image/webp">WebP</option>
                     </select>
                 </div>

                 <!-- Kalite -->
                 <div>
                     <div class="pj-label">Kalite <span class="pj-rval" id="pdf-qualval">92%</span></div>
                     <input type="range" class="pj-range" id="pdf-quality" min="10" max="100" value="92">
                 </div>

                 <!-- Ölçek -->
                 <div>
                     <div class="pj-label">DPI / Ölçek</div>
                     <select class="pj-sel" id="pdf-scale">
                         <option value="1">72 dpi (×1)</option>
                         <option value="1.5" selected>108 dpi (×1.5)</option>
                         <option value="2">150 dpi (×2)</option>
                         <option value="3">216 dpi (×3)</option>
                         <option value="4">300 dpi (×4)</option>
                     </select>
                 </div>

                 <!-- Sayfa aralığı -->
                 <div>
                     <div class="pj-label">Sayfa aralığı (örn: 1-3,5)</div>
                     <input class="pj-input" id="pdf-pages" placeholder="Boş = tümü">
                 </div>

                 <!-- Dönüştür -->
                 <button class="pj-btn pj-btn-red" id="pdf-convert" disabled>Dönüştür</button>

                 <!-- İlerleme -->
                 <div class="pj-progress" id="pdf-progress">
                     <div class="pj-track"><div class="pj-fill" id="pdf-bar"></div></div>
                     <div class="pj-status" id="pdf-status">Hazırlanıyor…</div>
                 </div>

                 <!-- Sonuçlar -->
                <div class="pj-dl-all-wrap" id="pdf-dlwrap" style="display: none; gap: 8px; margin-bottom: 10px;">
                     <button class="pj-btn pj-btn-red" id="pdf-dlall" style="flex: 1; padding: 8px 4px; white-space: nowrap;">⬇ Tümünü ZIP İndir</button>
                     <button class="pj-btn" id="pdf-clear-results" style="background:#555; color:#fff; flex: 1; padding: 8px 4px; white-space: nowrap;">Listeyi Temizle</button>
                </div>
				 <div class="pj-results" id="pdf-results"></div>
             </div>

             <!-- ══ JPG SIKISTIR PANE ══ -->
             <div class="pj-pane" id="pj-pane-jpg">

                 <div class="pj-drop" id="jpg-drop">
                     <span class="di">🖼️</span>
                     <strong>JPG / PNG seç</strong><br>
                     <span style="font-size:10px;color:#555577">Birden fazla dosya desteklenir</span>
                 </div>
                 <input type="file" class="pj-hidden" id="jpg-input" accept="image/jpeg,image/png,image/webp" multiple>
                 <div>
                     <button class="pj-clear-btn" id="jpg-clear" disabled>Temizle</button>
                     <div class="pj-label">Seçilen Dosyalar</div>
                 </div>
                 <div class="pj-filelist" id="jpg-filelist"></div>

                 <hr class="pj-sep">

                 <!-- Hedef format -->
                 <div>
                     <div class="pj-label">Çıktı Formatı</div>
                     <select class="pj-sel" id="jpg-format">
                         <option value="image/jpeg" selected>JPG</option>
                         <option value="image/webp">WebP</option>
                         <option value="image/png">PNG</option>
                     </select>
                 </div>

                 <!-- Kalite -->
                 <div>
                     <div class="pj-label">Kalite <span class="pj-rval" id="jpg-qualval">55%</span></div>
                     <input type="range" class="pj-range" id="jpg-quality" min="5" max="100" value="55">
                 </div>

                 <!-- Maks. boyut -->
                 <div>
                     <div class="pj-label">Maks. Uzun Kenar (px)</div>
                     <select class="pj-sel" id="jpg-maxpx">
                         <option value="0" selected>Değiştirme</option>
                         <option value="3840">3840 (4K)</option>
                         <option value="1920">1920 (FHD)</option>
                         <option value="1280">1280 (HD)</option>
                         <option value="800">800</option>
                         <option value="480">480</option>
                     </select>
                 </div>

                 <!-- Boyut hedefi -->
                 <div>
                     <div class="pj-label">Hedef Dosya Boyutu</div>
                     <select class="pj-sel" id="jpg-targetsize">
                         <option value="0">Yok (kalite sabitle)</option>
                         <option value="1000" selected>≤ 1000 KB</option>
                         <option value="500">≤ 500 KB</option>
                         <option value="200">≤ 200 KB</option>
                         <option value="100">≤ 100 KB</option>
                         <option value="50">≤ 50 KB</option>
                     </select>
                 </div>

                 <!-- Sıkıştır -->
                 <button class="pj-btn pj-btn-red" id="jpg-compress" disabled>Sıkıştır</button>

                 <!-- İlerleme -->
                 <div class="pj-progress" id="jpg-progress">
                     <div class="pj-track"><div class="pj-fill" id="jpg-bar"></div></div>
                     <div class="pj-status" id="jpg-status">Hazırlanıyor…</div>
                 </div>

                 <!-- Sonuçlar -->
				<div class="pj-dl-all-wrap" id="jpg-dlwrap" style="display: none; gap: 8px; margin-bottom: 10px;">
				     <button class="pj-btn pj-btn-gray" id="jpg-dlall" style="flex: 1; padding: 8px 4px; white-space: nowrap;">⬇ Tümünü ZIP İndir</button>
				     <button class="pj-btn" id="jpg-clear-results" style="background:#555; color:#fff; flex: 1; padding: 8px 4px; white-space: nowrap;">Listeyi Temizle</button>
				</div>
				 <div class="pj-results" id="jpg-results"></div>
             </div>
         `;
         document.body.appendChild(panel);

		/* ═══════════════════════════════════════════════════════
		   YARDIMCI FONKSIYONLAR
		═══════════════════════════════════════════════════════ */
		const $ = id => document.getElementById(id);
		function fmtBytes(b) { if (b < 1024) return b + ' B'; if (b < 1048576) return (b/1024).toFixed(1) + ' KB'; return (b/1048576).toFixed(2) + ' MB'; }
		function extOf(mime) { return mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'; }
		function download(dataUrl, name) { const a = document.createElement('a'); a.href = dataUrl; a.download = name; a.click(); }
		/* JSZip'i GM_xmlhttpRequest ile çek, Function() ile sandbox'a yükle */
		let _jszip = null;
		function loadJSZip() {
		    if (_jszip) return Promise.resolve(_jszip);
		    return new Promise((resolve, reject) => {
		        GM_xmlhttpRequest({
		            method: 'GET',
		            url: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
		            onload(r) { try { const fn = new Function(r.responseText + '\nreturn JSZip;'); _jszip = fn(); resolve(_jszip); } catch(e) { reject(e); } },
		            onerror: reject
		        });
		    });
		}
		async function buildZip(items, zipName) {
		    const ZipClass = await loadJSZip();
		    const zip = new ZipClass();
		    items.forEach(({ dataUrl, name }) => { const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1); zip.file(name, base64, { base64: true }); });
		    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
		    const url = URL.createObjectURL(blob);
		    download(url, zipName || 'dosyalar.zip');
		    setTimeout(() => URL.revokeObjectURL(url), 20000);
		}
		function parsePages(str, total) {
		    if (!str.trim()) return Array.from({ length: total }, (_, i) => i + 1);
		    const s = new Set();
		    str.split(',').forEach(p => {
		        const m = p.trim().match(/^(\d+)(?:-(\d+))?$/);
		        if (!m) return;
		        const a = +m[1], b = m[2] ? +m[2] : a;
		        for (let i = Math.max(1,a); i <= Math.min(total,b); i++) s.add(i);
		    });
		    return [...s].sort((a,b)=>a-b);
		}
		/* Dosya listesi kartı */
		function makeFileTag(name, onRemove) {
		    const d = document.createElement('div');
		    d.className = 'pj-filetag';
		    d.innerHTML = `<span title="${name}">📄 ${name}</span>`;
		    const btn = document.createElement('button');
		    btn.textContent = '✕';
		    btn.onclick = onRemove;
		    d.appendChild(btn);
		    return d;
		}
		/* Sonuç kartı */
		function makeResultCard(dataUrl, name, origSize, newSize) {
		    const d = document.createElement('div');
		    d.className = 'pj-result-item';
		    const saved = origSize ? Math.round((1 - newSize/origSize)*100) : null;
		    d.innerHTML = `
		        <img src="${dataUrl}" alt="">
		        <div class="pj-result-info">
		            <div class="pj-result-name" title="${name}">${name}</div>
		            <div class="pj-result-size">${fmtBytes(newSize)}${saved !== null ? ` <span style="color:#4caf50">↓${saved}%</span>` : ''}</div>
		        </div>`;
		    const dlBtn = document.createElement('button');
		    dlBtn.className = 'pj-result-dl';
		    dlBtn.textContent = '↓';
		    dlBtn.onclick = () => download(dataUrl, name);
		    d.appendChild(dlBtn);
		    return d;
		}
		/* Boyut küçülterek canvas'tan dataUrl üret */
		function resizeAndCompress(img, maxPx, mime, quality) {
		    let w = img.naturalWidth, h = img.naturalHeight;
		    if (maxPx > 0) { const long = Math.max(w, h); if (long > maxPx) { const r = maxPx/long; w = Math.round(w*r); h = Math.round(h*r); } }
		    const c = document.createElement('canvas');
		    c.width = w; c.height = h;
		    c.getContext('2d').drawImage(img, 0, 0, w, h);
		    return c.toDataURL(mime, quality);
		}
		/* Boyut hedefine ulaşmak için kaliteyi ikiye böl (binary search) */
		function compressToTarget(img, maxPx, mime, targetKB) {
		    if (targetKB <= 0) return null;
		    const targetBytes = targetKB * 1024;
		    let lo = 0.05, hi = 1.0, best = null;
		    for (let i = 0; i < 12; i++) {
		        const mid = (lo + hi) / 2;
		        const d = resizeAndCompress(img, maxPx, mime, mid);
		        const bytes = Math.round((d.length - d.indexOf(',') - 1) * 0.75);
		        if (bytes <= targetBytes) { best = { d, q: mid }; lo = mid; }
		        else hi = mid;
		    }
		    return best ? best.d : resizeAndCompress(img, maxPx, mime, 0.05);
		}
		/* base64 dataUrl'un yaklaşık byte boyutu */
		function dataUrlBytes(d) { return Math.round((d.length - d.indexOf(',') - 1) * 0.75); }
		/* ═══════════════════════════════════════════════════════
		   TOGGLE / SEKMELER
		═══════════════════════════════════════════════════════ */
		$('pj-toggle').onclick = () => panel.classList.toggle('pj-collapsed');
		$('pj-toggle').onclick();
		document.querySelectorAll('.pj-tab').forEach(btn => {
		    btn.onclick = () => {
		        document.querySelectorAll('.pj-tab').forEach(t => t.classList.remove('active'));
		        document.querySelectorAll('.pj-pane').forEach(p => p.classList.remove('active'));
		        btn.classList.add('active');
		        $('pj-pane-' + btn.dataset.tab).classList.add('active');
		    };
		});

		/* ═══════════════════════════════════════════════════════
		   PDF → JPG
		═══════════════════════════════════════════════════════ */
		let pdfFiles = [];
		let pdfResults = [];
		const pdfDrop = $('pdf-drop');
		const pdfInput = $('pdf-input');
		const pdfFilelist = $('pdf-filelist');
		const pdfConvert = $('pdf-convert');
		const pdfClear = $('pdf-clear');
		const pdfProgress = $('pdf-progress');
		const pdfBar = $('pdf-bar');
		const pdfStatus = $('pdf-status');
		const pdfResultsEl = $('pdf-results');
		const pdfDlwrap = $('pdf-dlwrap');
		const pdfDlall = $('pdf-dlall');
		const pdfQualSlider= $('pdf-quality');
		const pdfQualVal = $('pdf-qualval');
		pdfQualSlider.oninput = () => { pdfQualVal.textContent = pdfQualSlider.value + '%'; }
		pdfDrop.onclick = () => pdfInput.click();
		pdfDrop.ondragover = e => { e.preventDefault(); pdfDrop.classList.add('drag-over'); };
		pdfDrop.ondragleave = () => pdfDrop.classList.remove('drag-over');
		pdfDrop.ondrop = e => { e.preventDefault(); pdfDrop.classList.remove('drag-over'); addPdfFiles([...e.dataTransfer.files].filter(f => f.type === 'application/pdf')); };
		pdfInput.onchange = () => addPdfFiles([...pdfInput.files]);
		function addPdfFiles(files) {
		    files.forEach(f => {
		        if (pdfFiles.find(x => x.name === f.name)) return;
		        pdfFiles.push(f);
		        const tag = makeFileTag(f.name, () => { pdfFiles = pdfFiles.filter(x => x !== f); tag.remove(); pdfConvert.disabled = pdfFiles.length === 0; pdfClear.disabled = pdfFiles.length === 0; });
		        pdfFilelist.appendChild(tag);
		    });
		    pdfConvert.disabled = pdfFiles.length === 0; pdfClear.disabled = pdfFiles.length === 0;
		}
		pdfClear.onclick = () => {
		    pdfFiles = [];
		    pdfFilelist.innerHTML = '';
		    pdfConvert.disabled = true;
		    pdfClear.disabled = true;
		    pdfInput.value = '';
		};
		pdfConvert.onclick = async () => {
		    if (!pdfFiles.length) return;
		    pdfConvert.disabled = true;
		    pdfClear.disabled = true;
		    pdfProgress.style.display = 'block';
		    pdfResultsEl.innerHTML = ''; pdfResultsEl.style.display = 'none';
		    pdfDlwrap.style.display = 'none';
		    pdfBar.style.width = '0%';
		    pdfResults = [];
		    const scale = parseFloat($('pdf-scale').value);
		    const quality = parseInt(pdfQualSlider.value) / 100;
		    const mime = $('pdf-format').value;
		    const pagesStr= $('pdf-pages').value;
		    let totalWork = 0, done = 0;
		    // İlk geçiş: toplam sayfa sayısını bul
		    const pdfs = [];
		    for (const f of pdfFiles) {
		        const ab = await f.arrayBuffer();
		        const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
		        const pages = parsePages(pagesStr, pdf.numPages);
		        pdfs.push({ f, pdf, pages });
		        totalWork += pages.length;
		    }
		    for (const { f, pdf, pages } of pdfs) {
		        const baseName = f.name.replace(/\.pdf$/i, '');
		        for (const pageNum of pages) {
		            pdfStatus.textContent = `${f.name} — sayfa ${pageNum}`;
		            pdfBar.style.width = (done / totalWork * 100) + '%';
		            const page = await pdf.getPage(pageNum);
		            const vp = page.getViewport({ scale });
		            const canvas = document.createElement('canvas');
		            canvas.width = vp.width; canvas.height = vp.height;
		            await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
		            const dataUrl = canvas.toDataURL(mime, quality);
		            const name = `${baseName}_s${String(pageNum).padStart(3,'0')}.${extOf(mime)}`;
		            pdfResults.push({ dataUrl, name });
		            pdfResultsEl.appendChild(makeResultCard(dataUrl, name, null, dataUrlBytes(dataUrl)));
		            done++;
		        }
		    }
		    pdfBar.style.width = '100%';
		    pdfStatus.textContent = `✅ ${pdfResults.length} görsel oluşturuldu.`;
		    pdfResultsEl.style.display = 'flex';
		    if (pdfResults.length > 0) pdfDlwrap.style.display = 'flex';
		    pdfConvert.disabled = false;
		    pdfClear.disabled = false;

		};
		pdfDlall.onclick = async () => {
		    pdfDlall.disabled = true;
		    pdfDlall.textContent = '📦 ZIP…';
		    await buildZip(pdfResults);
		    pdfDlall.disabled = false;
		    pdfDlall.textContent = '⬇ Tümünü ZIP İndir';
		};
		$('pdf-clear-results').onclick = () => {
		    pdfResults = [];
		    pdfResultsEl.innerHTML = '';
		    pdfResultsEl.style.display = 'none';
		    pdfDlwrap.style.display = 'none';
		    pdfProgress.style.display = 'none'; // İlerleme çubuğunu gizler
		    pdfBar.style.width = '0%';
		};
		/* ═══════════════════════════════════════════════════════
		   JPG BOYUT KÜÇÜLTÜCÜ
		═══════════════════════════════════════════════════════ */
		let jpgFiles = [];
		let jpgResults = [];
		const jpgDrop = $('jpg-drop');
		const jpgInput = $('jpg-input');
		const jpgFilelist = $('jpg-filelist');
		const jpgCompress = $('jpg-compress');
		const jpgClear = $('jpg-clear');
		const jpgProgress = $('jpg-progress');
		const jpgBar = $('jpg-bar');
		const jpgStatus = $('jpg-status');
		const jpgResultsEl = $('jpg-results');
		const jpgDlwrap = $('jpg-dlwrap');
		const jpgDlall = $('jpg-dlall');
		const jpgQualSlider = $('jpg-quality');
		const jpgQualVal = $('jpg-qualval');
		jpgQualSlider.oninput = () => { jpgQualVal.textContent = jpgQualSlider.value + '%'; }
		jpgDrop.onclick = () => jpgInput.click();
		jpgDrop.ondragover = e => { e.preventDefault(); jpgDrop.classList.add('drag-over'); };
		jpgDrop.ondragleave = () => jpgDrop.classList.remove('drag-over');
		jpgDrop.ondrop = e => { e.preventDefault(); jpgDrop.classList.remove('drag-over'); addJpgFiles([...e.dataTransfer.files].filter(f => f.type.startsWith('image/'))); };
		jpgInput.onchange = () => addJpgFiles([...jpgInput.files]);
		function addJpgFiles(files) {
		    files.forEach(f => {
		        if (jpgFiles.find(x => x.name === f.name)) return;
		        jpgFiles.push(f);
		        const tag = makeFileTag(f.name, () => { jpgFiles = jpgFiles.filter(x => x !== f); tag.remove(); jpgCompress.disabled = jpgFiles.length === 0; jpgClear.disabled = jpgFiles.length === 0; });
		        jpgFilelist.appendChild(tag);
		    });
		    jpgCompress.disabled = jpgFiles.length === 0;
		    jpgClear.disabled = jpgFiles.length === 0;
		}
		jpgClear.onclick = () => {
		    jpgFiles = [];
		    jpgFilelist.innerHTML = '';
		    jpgCompress.disabled = true;
		    jpgClear.disabled = true;
		    jpgInput.value = '';
		};
		jpgCompress.onclick = async () => {
		    if (!jpgFiles.length) return;
		    jpgCompress.disabled = true;
		    jpgClear.disabled = true;
		    jpgProgress.style.display = 'block';
		    jpgResultsEl.innerHTML = ''; jpgResultsEl.style.display = 'none';
		    jpgDlwrap.style.display = 'none';
		    jpgBar.style.width = '0%';
		    jpgResults = [];
		    const mime = $('jpg-format').value;
		    const quality = parseInt(jpgQualSlider.value) / 100;
		    const maxPx = parseInt($('jpg-maxpx').value);
		    const targetKB = parseInt($('jpg-targetsize').value);
		    for (let i = 0; i < jpgFiles.length; i++) {
		        const f = jpgFiles[i];
		        jpgStatus.textContent = `${f.name} işleniyor…`;
		        jpgBar.style.width = (i / jpgFiles.length * 100) + '%';
		        const origSize = f.size;
		        const dataUrl = await new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsDataURL(f); });
		        await new Promise(res => {
		            const img = new Image();
		            img.onload = () => {
		                let out;
		                if (targetKB > 0) { out = compressToTarget(img, maxPx, mime, targetKB); } else { out = resizeAndCompress(img, maxPx, mime, quality); }
		                const newSize = dataUrlBytes(out);
		                const ext = extOf(mime);
		                const name = f.name.replace(/\.[^.]+$/, '') +'.'+ ext;
		                jpgResults.push({ dataUrl: out, name });
		                jpgResultsEl.appendChild(makeResultCard(out, name, origSize, newSize));
		                res();
		            };
		            img.src = dataUrl;
		        });
		    }
		    jpgBar.style.width = '100%';
		    jpgStatus.textContent = `✅ ${jpgResults.length} dosya işlendi.`;
		    jpgResultsEl.style.display = 'flex';
		    if (jpgResults.length > 0) jpgDlwrap.style.display = 'flex';
		    jpgCompress.disabled = false;
		    jpgClear.disabled = false;
		};
		jpgDlall.onclick = async () => {
		    jpgDlall.disabled = true;
		    jpgDlall.textContent = '📦 ZIP…';
		    await buildZip(jpgResults);
		    jpgDlall.disabled = false;
		    jpgDlall.textContent = '⬇ Tümünü ZIP İndir';
		};
		$('jpg-clear-results').onclick = () => {
		    jpgResults = [];
		    jpgResultsEl.innerHTML = '';
		    jpgResultsEl.style.display = 'none';
		    jpgDlwrap.style.display = 'none';
		    jpgProgress.style.display = 'none'; // İlerleme çubuğunu gizler
		    jpgBar.style.width = '0%';
		};
		/**************************************************************/
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
                    if (!tip) { tip = document.createElement('div'); tip.id = 'ks-dynamic-tooltip'; Object.assign(tip.style, { zIndex: '99999999', opacity: '0' }); document.body.appendChild(tip); }
                    return tip;
                };
                const bindTooltips = (container) => {
                    const panelTip = getPanelTip();
                    container.querySelectorAll('[data-tip]').forEach(el => {
                        el.addEventListener('mouseenter', () => { panelTip.textContent = el.getAttribute('data-tip'); panelTip.style.visibility = 'visible'; panelTip.style.opacity = '1'; });
                        el.addEventListener('mousemove', (e) => { panelTip.style.left = (e.clientX + 12) + 'px'; panelTip.style.top = (e.clientY - 34) + 'px'; });
                        el.addEventListener('mouseleave', () => { panelTip.style.opacity = '0'; panelTip.style.visibility = 'hidden'; });
                    });
                };
                const hidePanelTip = () => { const tip = document.getElementById('ks-dynamic-tooltip'); if (tip) { tip.style.opacity = '0'; tip.style.visibility = 'hidden'; } };
                const showFullContent = () => {
                    kstatus.classList.add('active');
                    kstatus.setAttribute('data-hover', 'true');
                    kstatus.style.color = '#fff';
                    kstatus.innerHTML = `
                    <span id="ks-settings-btn" data-tip="Ayarları Aç" style="cursor:pointer; font-size:14px;">⚙️</span>
			            <span style="opacity:0.3; margin:0 4px;">|</span>
			            <span id="ks-pdf-btn" data-tip="PDF / JPG Araçları" style="cursor:pointer; font-size:13px; color:${config.themeColor}; font-weight:700; letter-spacing:.5px;">PDF</span>
			            <span style="opacity:0.3; margin:0 8px;">|</span>
			            <span id="ks-unlock-btn" data-tip="${config.isUnlocked ? 'Kilidi Kapat' : 'Kilidi Aç'}" style="color:${config.Color}; cursor:pointer; padding:2px 2px; border-radius:${config.borderRadius}; transition:all 0.3s ease;">${config.isUnlocked ? '🔓' : '🔒'}</span>
			            <span style="opacity:0.3; margin:0 2px;">|</span>
			            <span style="color:${ipcolor}; font-size:15px; margin-right:5px;">●</span>
			            <span data-tip="Geçerli IP Adresi" style="color:inherit;">${currentIP}</span>
			            <span style="opacity:0.3; margin:0 8px;">|</span>
			            <span id="ks-version-link" data-tip="Güncelleyi Aç/İndir" style="color:${config.Color}; cursor:pointer; padding:2px 2px; border-radius:${config.borderRadius}; transition:all 0.3s ease;">${scriptVersion}</span>
			            <span style="opacity:0.3; margin:0 8px;">|</span>
			            <span id="ks-theme-btn" data-tip="Tema Güncelleyi Aç/İndir" style="color:${config.Color}; cursor:pointer; padding:2px 2px; border-radius:${config.borderRadius}; transition:all 0.3s ease;">Tema</span>
			        `;
                    bindTooltips(kstatus);
                    // PDF paneli toggle
                    const pdfBtn = document.getElementById('ks-pdf-btn');
                    if (pdfBtn) {
                        pdfBtn.onclick = (e) => {
                            e.stopPropagation();
                            const pjPanel = document.getElementById('pj-panel');
                            if (pjPanel) pjPanel.classList.toggle('pj-collapsed');
                        };
                    }
                    const unlockBtn = document.getElementById('ks-unlock-btn');
                    unlockBtn.onclick = (e) => {
                        e.stopPropagation(); config.isUnlocked = !config.isUnlocked; e.target.textContent = config.isUnlocked ? '🔓' : '🔒';
                        e.target.setAttribute('data-tip', config.isUnlocked ? 'Kilidi Kapat' : 'Kilidi Aç');
                        unlockAllElements(config.isUnlocked);
                    };
                    document.getElementById('ks-version-link').onclick = (e) => { e.stopPropagation(); window.open(GM_info.script.updateURL, '_blank'); };
                    document.getElementById('ks-theme-btn').onclick = (e) => { e.stopPropagation(); window.open('https://github.com/kstool/KsTools/raw/refs/heads/main/Ks_Tools_Ocean.user.js', '_blank'); };
                    document.getElementById('ks-settings-btn').onclick = (e) => { e.stopPropagation(); openSettingsModal(); };
                };
                kstatus.onmouseleave = () => {
                    hidePanelTip();
                    const tip = document.getElementById('ks-dynamic-tooltip');
                    if (tip) { tip.style.opacity = '0'; }
                    hideTimeout = setTimeout(() => { kstatus.classList.remove('active'); kstatus.innerHTML = `<span>KS</span>`; hideTimeout = null; }, 1500);
                };
                kstatus.onmouseenter = () => {
                    if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
                    showFullContent();
                };
            }
            // ── Veri Tanımları ─────────────────────────────────────────────────
            const SECTIONS = [
                {
                    id: 'dosya', title: 'OTOANALİZ DOSYA PANELİ', icon: '📁', label: 'Otoanaliz Dosya Paneli',
                    items: [
                        { key: 'KS_PANEL', icon: '📊', title: 'Yan Panel', desc: 'Genel Dosya durumunu gösteren panel', sub: false },
                        { key: 'KS_PANEL_pol', icon: '📋', title: 'Poliçe Kontrol', desc: 'Tarih + geçerlilik denetimi', sub: true },
                        { key: 'KS_PANEL_sgs', icon: '🛡️', title: 'Sigorta Şekli', desc: 'Trafik / Kasko göstergesi', sub: true },
                        { key: 'KS_PANEL_rc', icon: '↩️', title: 'Rücu Takibi', desc: 'Rücu durum göstergesi', sub: true },
                        { key: 'KS_PANEL_pert', icon: '🚗', title: 'Pert Kontrolü', desc: 'Pert durum göstergesi', sub: true },
                        { key: 'KS_PANEL_mulk', icon: '🏢', title: 'Mülkiyet Kontrolü', desc: 'Mülkiyet durum göstergesi', sub: true },
                        { key: 'KS_PANEL_hsr', icon: '💥', title: 'Hasar Şekli', desc: 'Hasar tipi bilgisi', sub: true },
                        { key: 'KS_PANEL_uzak', icon: '📷', title: 'Ekspertiz Şekli', desc: 'Ekspertiz şekli bilgisi', sub: true },
                        { key: 'KS_PANEL_srtp', icon: '🔧', title: 'Servis Tipi', desc: 'Servis yetki bilgisi', sub: true },
                        { key: 'KS_PANEL_srad', icon: '🏭', title: 'Servis Adı', desc: 'Servis adı bilgisi', sub: true },
                        { key: 'KS_PANEL_tra', icon: '📈', title: 'Tramer', desc: 'Tramer değer bilgisi', sub: true },
                        { key: 'KS_PANEL_sad', icon: '👤', title: 'Sigortalı Adı', desc: 'Ad soyad bilgisi', sub: true },
                        { key: 'KS_PANEL_aad', icon: '🚙', title: 'Araç Model', desc: 'Model bilgisi', sub: true },
                        { key: 'KS_PANEL_mull', icon: '💰', title: 'Muallak', desc: 'Muallak değer bilgisi', sub: true },
                        { key: 'KS_PANEL_ryc', icon: '🏷️', title: 'Piyasa Rayiç', desc: 'Piyasa değer bilgisi', sub: true },
                        { key: 'KS_PANEL_rycorn', icon: '⚠️', title: 'Rayiç Pert Oran', desc: '%30 ve %60 eşik oranlarını takip etmeyi sağlayan yüzdelik bar', sub: true },
                        { key: 'KS_PANEL_pys', icon: '🌐', title: 'Piyasa Kontrol', desc: 'Dış kaynak veri çekimi', sub: true },
                        { key: 'KS_PANEL_not', icon: '📝', title: 'Notlar', desc: 'Panel not bölümü', sub: true },
                        { key: 'KS_PANEL_hasar', icon: '💥', title: 'Hasar Analiz', desc: 'Gelişmiş parça/bölge hasar analiz paneli', sub: true },
                    ]
                },
                {
                    id: 'ek', title: 'OTOANALİZ EK MODÜLLER', icon: '⚙️', label: 'Otoanaliz Ek Modüller',
                    items: [
                        { key: 'KS_PANEL_hlt', icon: '🔦', title: 'Hücre Boyama', desc: 'Eksik-Boş alan renklendirme', sub: false },
                        { key: 'KS_MANU', icon: '🔩', title: 'Manuel Parça', desc: 'Tekli-Çoklu parça girişi panelleri', sub: false },
                        { key: 'KS_PSAY', icon: 'S', title: 'Parça Sayısı', desc: 'Parça sayısı bölümüne istenen sayıyı seçilmesini sağlayan panel', sub: false },
                        { key: 'KS_REF', icon: '📌', title: 'Referans Panel', desc: 'Excel ile kopyalama yapıştırma fonksiyon butonları', sub: false },
                        { key: 'KS_DNM', icon: '⚙️', title: 'Donanım Girişi', desc: 'Araç donanımı hızlı giriş butonları', sub: false },
                        { key: 'KS_IMG', icon: '🖼️', title: 'Resim Yükleme', desc: 'Toplu evrak kategorisi', sub: false },
                        { key: 'KS_NTF', icon: '🔕', title: 'Bildirim Engel', desc: '3+ tekrarlı popup engeli', sub: false },
                        { key: 'KS_ONSBM', icon: '🏦', title: 'Ön SBM Giriş Bilgileri', desc: 'Otoanaliz içerisindeki SBM Bilgileri bölümünü otomatik dolduran buton ekler.', sub: false },
                    ]
                },
                {
                    id: 'dis', title: 'DIŞ ENTEGRASYONLAR', icon: '📡', label: 'Dış Entegrasyonlar',
                    items: [
                        { key: 'KS_TRS', icon: '🛡️', title: 'Türkiye Sigorta', desc: 'Yan menü liste ve hızlı girişler', sub: false },
                        { key: 'KS_QCA', icon: '🛡️', title: 'Quick-Corpus-Anadolu Sigorta', desc: 'Hızlı girişler', sub: false },
                        { key: 'KS_SAHIB', icon: '🏷️', title: 'Sahibinden', desc: 'Fiyat ortalaması gösteren panel', sub: false },
                        { key: 'KS_SBM', icon: '🏦', title: 'SBM Panel', desc: "SBM 3'lü bölme, resim indirme, ekran görüntüsü alma ve hızlı sigorta seçim ekleyen paneller", sub: false },
                        { key: 'KS_WP', icon: '💬', title: 'WhatsApp', desc: 'Resimlere çift tıklama hızlı indirme', sub: false },
                        { key: 'KS_LGN', icon: '🏦', title: 'Login', desc: 'Otoanaliz için kurum kodunu otomatik doldurma', sub: false },
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
                /*const escHandler = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); } };
                document.addEventListener('keydown', escHandler);
                overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });*/
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
                                    <div><div class="ks2-brand-title">KS TOOLS</div><div class="ks2-brand-sub">KONTROL PANELİ</div></div>
                                    </div>
                                </div>
                            <nav class="ks2-nav"><div class="ks2-nav-sec">// MODÜLLER</div>${navHTML}</nav>
                            <div class="ks2-sidebar-bottom">
                                <div class="ks2-theme-row"><span class="ks2-theme-lbl">// TEMA</span><span class="ks2-ver-tag">v${GM_info.script.version}</span></div>
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
                                <div class="ks2-topbar-left"><span class="ks2-bracket">[</span><span class="ks2-topbar-title" id="ks2-sec-title">OTOANALİZ DOSYA PANELİ</span><span class="ks2-bracket">]</span></div>
                                <div class="ks2-ctrl-row">
                                    <span class="ks2-ctrl-lbl">ANA KONTROL</span>
                                    <label class="ks2-sw"><input type="checkbox" id="ks2-master" ${getSetting('KS_SYS') ? 'checked' : ''}><span class="ks2-sw-track"></span></label>
                                </div>
                            </div>
                            <div class="ks2-content">${sectionsHTML}</div>
                            <div class="ks2-footer">
                                <div class="ks2-footer-stats">
                                    <div><div class="ks2-stat-val" id="ks2-active-cnt">${getActiveCount()}</div><div class="ks2-stat-lbl">AKTİF MODÜL</div></div>
                                    <div class="ks2-stat-divider"></div>
                                    <div><div class="ks2-stat-val">${totalItems}</div><div class="ks2-stat-lbl">TOPLAM</div></div>
                                </div>
                                <div class="ks2-footer-btns">
                                    <button class="ks2-fbtn ks2-fbtn-cancel" id="ks2-btn-cancel"><span>Hafızayı Temizle!</span></button>
                                    <button class="ks2-fbtn ks2-fbtn-save" id="ks2-btn-save"><span>KAYDET</span><span class="ks2-fbtn-glow"></span></button>
                                </div>
                            </div>
                        </div>
                    </div>`;
                document.body.appendChild(overlay);
                document.body.style.overflow = 'hidden';
                // ── Kartları oluştur ────────────────────────────────────────────
                const updateStats = () => {
                    document.getElementById('ks2-active-cnt').textContent = getActiveCount();
                    SECTIONS.forEach(sec => { const el = document.getElementById('ks2-cnt-' + sec.id); if (el) el.textContent = getSecCount(sec); });
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
                            <div class="ks2-corner ks2-corner-tl"></div><div class="ks2-corner ks2-corner-br"></div>
                            <div class="ks2-card-top">
                                <div class="ks2-card-icon">${item.icon}</div>
                                <label class="ks2-sw" onclick="event.stopPropagation()"><input type="checkbox" data-key="${item.key}" ${on ? 'checked' : ''}><span class="ks2-sw-track"></span></label>
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
                        const secId = btn.dataset.grid, on = btn.dataset.val === '1';
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
                        dot.style.borderColor = dot.dataset.c; dot.classList.add('ks2-sel');
                        overlay.querySelector('#ks2-root').style.setProperty('--ks2-cy', dot.dataset.c);
                        setSetting('KS_THEME', dot.dataset.c);
                    });
                });
                // Kayıtlı tema rengini uygula
                const savedTheme = getSetting('KS_THEME');
                if (savedTheme) {
                    overlay.querySelector('#ks2-root').style.setProperty('--ks2-cy', savedTheme);
                    overlay.querySelectorAll('.ks2-cdot').forEach(d => { d.style.borderColor = 'transparent'; d.classList.remove('ks2-sel'); if (d.dataset.c === savedTheme) { d.style.borderColor = savedTheme; d.classList.add('ks2-sel'); } });
                }
                // ── Footer butonları ────────────────────────────────────────────
                const cancelBtn = overlay.querySelector('#ks2-btn-cancel');
                const saveBtn = overlay.querySelector('#ks2-btn-save');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', (e) => {
                        e.preventDefault(); e.stopPropagation();
                        const keysToReset = SECTIONS.flatMap(s => s.items.map(i => i.key)).concat(['KS_THEME']);
                        if (confirm('Ana kontrol hariç tüm alt özellikler kapatılacak ve hafıza sıfırlanacak. Onaylıyor musunuz?')) {
                            keysToReset.forEach(key => GM_setValue(key, false));
                            GM_setValue('KS_SYS', true); alert('Alt özellikler kapatıldı. Sayfa yenileniyor!'); window.location.reload();
                        }
                    });
                }
                if (saveBtn) {
                    saveBtn.addEventListener('click', (e) => {
                        e.preventDefault(); closeModal();
                        if (confirm('Ayarlar kaydedildi. Değişikliklerin uygulanması için sayfa yenilensin mi?')) { window.location.reload(); }
                    });
                }
                //window.openSettingsModal = openSettingsModal;
                //document.addEventListener('keydown', (e) => { if (e.altKey && e.key === 's') openSettingsModal(); });
            };
        };
        setInterval(injectPanel, 2000); injectPanel();
    }
    // 🎲 %5 ihtimalle göster
    const GIF_URL = 'https://media.tenor.com/yB6ozDoWij4AAAAj/honkai-star-rail-dance.gif', GIF_W = 100, GIF_H = 100;
    const style = document.createElement('style');
    style.textContent = `
    #tm-gif-container { position: fixed; z-index: 2147483647; pointer-events: none; opacity: 0; transition: opacity 0.25s ease; width: ${GIF_W}px; }
    #tm-gif-container.tm-visible { opacity: 1; }
    #tm-gif-container img { width: ${GIF_W}px !important; height: auto !important; display: block; } `;
    document.head.appendChild(style);
    const container = document.createElement('div');
    container.id = 'tm-gif-container';
    const img = document.createElement('img');
    img.src = GIF_URL; img.alt = ''; img.draggable = false;
    container.appendChild(img);
    document.body.appendChild(container);
    const attachToPanel = () => {
        const panel = document.getElementById(PANEL_ID);
        if (!panel) return false;
        const updatePos = () => {
            const rect = panel.getBoundingClientRect(), realH = container.offsetHeight || GIF_H;
            container.style.left = (rect.right - GIF_W) + 'px'; container.style.top = (rect.top - realH) + 'px';
        };
        panel.addEventListener('mouseenter', () => { if (window.isUnlocked === true) { container.classList.add('tm-visible'); setTimeout(updatePos, 10); } });
        panel.addEventListener('mouseleave', () => { container.classList.remove('tm-visible'); });
        panel.addEventListener('mousemove', () => { if (window.isUnlocked === true) { updatePos(); } else { container.classList.remove('tm-visible'); } });
        return true;
    };
    const interval = setInterval(() => { if (attachToPanel()) clearInterval(interval); }, 500);
    /* ══════════════════════════════════════════════════════
       SETTINGS READ
    ══════════════════════════════════════════════════════ */
    const KS_SYSTEM = GM_getValue('KS_SYS', false),
        ANALIZPANEL = GM_getValue('KS_PANEL', false), ANALIZPANEL_hlt = GM_getValue('KS_PANEL_hlt', false), ANALIZPANEL_pol = GM_getValue('KS_PANEL_pol', false), ANALIZPANEL_sgs = GM_getValue('KS_PANEL_sgs', false),
        ANALIZPANEL_rc = GM_getValue('KS_PANEL_rc', false), ANALIZPANEL_pert = GM_getValue('KS_PANEL_pert', false), ANALIZPANEL_hsr = GM_getValue('KS_PANEL_hsr', false), ANALIZPANEL_srtp = GM_getValue('KS_PANEL_srtp', false),
        ANALIZPANEL_srad = GM_getValue('KS_PANEL_srad', false), ANALIZPANEL_tra = GM_getValue('KS_PANEL_tra', false), ANALIZPANEL_sad = GM_getValue('KS_PANEL_sad', false), ANALIZPANEL_aad = GM_getValue('KS_PANEL_aad', false),
        ANALIZPANEL_mull = GM_getValue('KS_PANEL_mull', false), ANALIZPANEL_ryc = GM_getValue('KS_PANEL_ryc', false), ANALIZPANEL_rycorn = GM_getValue('KS_PANEL_rycorn', false), ANALIZPANEL_pys = GM_getValue('KS_PANEL_pys', false),
        ANALIZPANEL_not = GM_getValue('KS_PANEL_not', false), ANALIZPANEL_hasar = GM_getValue('KS_PANEL_hasar', false), ANALIZPANEL_mulk = GM_getValue('KS_PANEL_mulk', false), ANALIZPANEL_uzak = GM_getValue('KS_PANEL_uzak', false),
        MANUEL = GM_getValue('KS_MANU', false), REFERANS = GM_getValue('KS_REF', false), PSAY = GM_getValue('KS_PSAY', false), DONANIM = GM_getValue('KS_DNM', false), RESIM = GM_getValue('KS_IMG', false),
        TRSIGORTA = GM_getValue('KS_TRS', false), QCASIGORTA = GM_getValue('KS_QCA', false), SAHIBINDEN = GM_getValue('KS_SAHIB', false), SBM = GM_getValue('KS_SBM', false),
        WHATSAPP = GM_getValue('KS_WP', false), BILDIRIM = GM_getValue('KS_NTF', false), LOGIN = GM_getValue('KS_LGN', false), ONSBM = GM_getValue('KS_ONSBM', false);
    window.MAGDUR_DATA = { isLoaded: false, mgMODEL_ADI: null, mgKM: null, mgPIYASA: null, mgMAGDUR_AD: null, mgMAGDUR_SOYAD: null, mgPLAKA1: null, mgPLAKA2: null, mgPLAKA3: null };
    // Hızlı ve Panel takipli Ön girişi
    if (KS_SYSTEM && ANALIZPANEL && loc("otohasar") && (loc("eks_hasar.php") || loc("eks_hasar_magdur.php"))) {
        const magdurpanel = loc("eks_hasar_magdur.php");
        /* ===== 1. PANEL VE STİL ===== */
        initPanel();
        const urlParams = new URLSearchParams(window.location.search), dosyaId = urlParams.get('id'), currentHost = window.location.hostname, panel = document.getElementById('ks-master-panel');
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (magdurpanel && panel) {
            panel.style.display = 'none'; panel.style.setProperty('display', 'none', 'important');
            document.body.style.marginRight = '0'; document.body.classList.remove('ks-panel-open');
            setTimeout(() => { const toggle = document.getElementById('ks-panel-toggle'); if (toggle) toggle.style.setProperty('display', 'none', 'important'); }, 0);
        }
        if (!magdurpanel) {
            let magdurUrl = null;
            const links = document.querySelectorAll('a[href*="eks_hasar_magdur.php"]');
            if (links.length > 0) {
                const hrefText = links[0].getAttribute('href');
                const match = hrefText.match(/eks_hasar_magdur\.php\?[^']+/);
                if (match) { magdurUrl = location.origin + "/eks/" + match[0].replace(/&amp;/g, '&'); }
            }
            if (!magdurUrl) {
                const scripts = document.querySelectorAll('script');
                for (const script of scripts) {
                    const match = script.textContent.match(/eks_hasar_magdur\.php\?[^']+/);
                    if (match) { magdurUrl = location.origin + "/eks/" + match[0].replace(/&amp;/g, '&'); break; }
                }
            }
            if (magdurUrl) {
                console.log("[OtoHasar] Doğru mağdur linki tablodan söküldü:", magdurUrl);
                console.log("[OtoHasar] Gizli tünel (Iframe) doğru adrese oluşturuluyor...");
                const secretIframe = document.createElement('iframe');
                secretIframe.src = magdurUrl; secretIframe.style.display = 'none'; secretIframe.style.width = '0'; secretIframe.style.height = '0';
                secretIframe.onload = function () {
                    setTimeout(() => {
                        try {
                            const iframeDoc = secretIframe.contentDocument || secretIframe.contentWindow.document;
                            if (!iframeDoc) { throw new Error("Iframe dökümanına erişilemedi."); }
                            const selectors = {
                                mgMODEL_ADI: iframeDoc.querySelector('input[name="MODEL_ADI"], #MODEL_ADI'),
                                mgKM: iframeDoc.querySelector('input[name="KM"], #KM'),
                                mgPIYASA: iframeDoc.querySelector('input[name="PIYASA"], #PIYASA'),
                                mgMAGDUR_AD: iframeDoc.querySelector('input[name="MAGDUR_AD"], #MAGDUR_AD'),
                                mgMAGDUR_SOYAD: iframeDoc.querySelector('input[name="MAGDUR_SOYAD"], #MAGDUR_SOYAD'),
                                mgPLAKA1: iframeDoc.querySelector('input[name="PLAKA1"], #PLAKA1'),
                                mgPLAKA2: iframeDoc.querySelector('input[name="PLAKA2"], #PLAKA2'),
                                mgPLAKA3: iframeDoc.querySelector('input[name="PLAKA3"], #PLAKA3')
                            };
                            for (const [key, element] of Object.entries(selectors)) {
                                if (element) {
                                    const val = element.value ? element.value.trim() : (element.getAttribute('value') ? element.getAttribute('value').trim() : "");
                                    if (val && val !== "0" && val !== "( )") { window.MAGDUR_DATA[key] = val; } else { window.MAGDUR_DATA[key] = val || null; }
                                } else { window.MAGDUR_DATA[key] = null; }
                            }
                            window.MAGDUR_DATA.isLoaded = true;
                            console.log("%c[OtoHasar] Gizli tünelden mağdur verileri başarıyla çekildi! ✅", "color: #00d4ff; font-weight: bold;");
                            console.table(window.MAGDUR_DATA);
                        } catch (err) { console.error("[OtoHasar Iframe Hatası]:", err); } finally { secretIframe.remove(); }
                    }, 1500);
                };
                document.body.appendChild(secretIframe);
            } else { console.error("[OtoHasar Error] Tablo içerisinde mağdur sayfasına ait dinamik link bulunamadı!"); }
        }
        if (panel && panelContent) {
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Giriş Kontrol Paneli";
            function hapBuildPanelHTML(dosyaId) {
                const sedanSVG = typeof hapBuildSedanSVG === 'function' ? hapBuildSedanSVG() : '<div style="color:red">SVG Yüklenemedi</div>';
                const mekRows = (typeof HAP_MEK !== 'undefined' ? HAP_MEK : []).map(p => `
                    <div class="hap-mek-cell" id="hap-mek-${p.id}">
                        <span class="hap-mek-label">${p.label}</span>
                        <span class="hap-mek-val" id="hap-mek-n-${p.id}">0</span>
                        <span class="hap-mek-tl" id="hap-mek-tl-${p.id}"></span>
                        <span class="hap-mek-badge" style="background:#0a1e30;color:#5aa8e0;border:1px solid #1a3e5e">M</span>
                    </div>`).join('');
                const elkRows = (typeof HAP_ELK !== 'undefined' ? HAP_ELK : []).map(p => `
                    <div class="hap-mek-cell" id="hap-elk-${p.id}">
                        <span class="hap-mek-label">${p.label}</span>
                        <span class="hap-mek-val" id="hap-elk-n-${p.id}">0</span>
                        <span class="hap-mek-tl" id="hap-elk-tl-${p.id}"></span>
                        <span class="hap-mek-badge" style="background:#0a2010;color:#4ec97a;border:1px solid #1a5030">E</span>
                    </div>`).join('');
                return `
                    <div id="hasar-section">
                        <div style="text-align:center;font-size:11px;opacity:0.8;letter-spacing:.06em;margin-bottom:8px;font-family:monospace">
                            HASAR ANALİZ — #${dosyaId} <br> %90 Doğruluk oranına sahiptir!
                        </div>
                        <div id="hap-score-row">
                            <div id="hap-ring-wrap">
                                <svg width="50" height="50" viewBox="0 0 50 50">
                                    <circle cx="25" cy="25" r="20" fill="none" stroke="#2a2a2a" stroke-width="4"/>
                                    <circle id="hap-arc" cx="25" cy="25" r="20" fill="none" stroke="#E24B4A" stroke-width="4" stroke-linecap="round" stroke-dasharray="125.7" stroke-dashoffset="125.7" transform="rotate(-90 25 25)" style="transition:.5s"/>
                                </svg>
                                <span id="hap-skor-val">--</span>
                            </div>
                            <div id="hap-chips">
                                <div class="hap-chip hap-chip-r" id="hap-chip-crit">-- Kritik</div>
                                <div class="hap-chip hap-chip-y" id="hap-chip-high">-- Yüksek değer</div>
                                <div class="hap-chip hap-chip-b" id="hap-chip-tutar">-- TL</div>
                            </div>
                        </div>
                        <div id="hap-tabs" style="margin-top:10px; display:flex; gap:2px;">
                            <button class="hap-tab active" data-subtab="kaporta">Kaporta</button>
                            <button class="hap-tab" data-subtab="mekanik">Mekanik</button>
                            <button class="hap-tab" data-subtab="elektrik">Elektrik</button>
                        </div>
                        <div class="hap-view active" id="hap-view-kaporta">${sedanSVG}</div>
                        <div class="hap-view" id="hap-view-mekanik"><div class="hap-mek-grid">${mekRows}</div></div>
                        <div class="hap-view" id="hap-view-elektrik"><div class="hap-mek-grid">${elkRows}</div></div>
                        <div id="hap-status-info" style="font-size:10px; color:#ff9800; text-align:center; margin-top:5px;">Veriler sorgulanıyor...</div>
                    </div>`;
            }
            // CSS ve HTML Yapısı
            panelContent.innerHTML = `
                <div class="main-tabs">
                    <button class="main-tab active" data-target="panel-islem">İşlemler</button>
                    <button class="main-tab" data-target="panel-hasar">Hasar Analizi</button>
                </div>
                <div id="panel-islem" class="tab-panel-content active">
                    <div id="panelContent" style ="color:#ffffff; text-align:center;">⏳ Yükleniyor...</div>
					<hr class="custom-line">
					<div id="pys-section">
						 <div id="shb-res-box"></div>
						 <div class="ks-grid-container" style="display:grid;grid-template-columns:1fr 1fr;gap:5px;width:100%;">
						 	<div class="ks-tooltip-container">
						 		<button id="btn-auto-analiz" class="ks-btn" style="width:100%;">Piyasa Göster</button>
						 		<div class="ks-tooltip-box">Piyasayı otomatik olarak panel arayüzü üzerinde gösterir. Aynı araç için sürekli kontrol sağlamaya çalışmayın, site erişimi kilitleyecektir.</div>
						 	</div>
						 	<div class="ks-tooltip-container">
						 		<button id="btn-auto-look" class="ks-btn" style="width:100%;">Piyasa Listesine Git</button>
						 		<div class="ks-tooltip-box">Listenin bulunduğu siteyi yeni sekmede açar.</div>
						 	</div>
					 	 </div>
					</div>
					<hr class="custom-line" id="action-divider">
					<div id="action-section" class="ks-grid-container" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;width:100%;">
					    <div class="ks-tooltip-container">
					        <button id="autoSelectBtn" class="ks-btn" style="width:100%;height:100%;">⚡ Ön Giriş</button>
					        <div class="ks-tooltip-box">
					            <strong>⚡ Otomatik Giriş (F4)</strong><br>
					            Kaza ihbar türü, Eksperiz şekli, Alkol durumu, Devir-Satış, Eksik/Aşkın Sigorta, Muafiyet, Taşınan yük, Ehliyet sınıfı ve Ekspertiz tarihi gibi seçimleri doğrulamayı unutmayın.
					        </div>
					    </div>
					    <div class="ks-tooltip-container">
					        <button id="btnKaydetYeni" class="ks-btn-danger" style="width:100%;height:100%;" onclick="c('kaydet();')">💾 KAYDET</button>
					        <div class="ks-tooltip-box"><strong>💾 Kaydet (F2)</strong><br>Sitedeki kaydet butonları ile aynı işlevi görür.</div>
					    </div>
					    <div class="ks-tooltip-container">
					        <button id="btnKaydetvovo" class="ks-btn-danger" style="width:100%;height:100%;">💾 ZORLA KAYDET</button>
					        <div class="ks-tooltip-box"><strong>💾 Zorla Kaydet</strong><br>Kaydetmeyi zorlar.</div>
					    </div>
					</div>
					<hr class="custom-line">
					<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;width:100%;">
					    <button id="btnOnbellek" class="ks-btn" style="width:100%;height:100%;">📥 ÖNBELLEK KAYDET</button>
					    <button id="btnOnbellekYukle" class="ks-btn" style="width:100%;height:100%;">📤 ÖNBELLEK YÜKLE</button>
					</div>
					<div id="not-section">
							<div id="custom-page-notes-container" style="width: 100%; dashed #444;">
						<hr class="custom-line">
								<div style="color: #bbb; font-size: 11px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
									<span>NOT</span>
									<span id="note-status" style="font-size: 10px; opacity: 0.6;">Otomatik Kayıt Edecek...</span>
								</div>
								<textarea id="page-note-input" style="width: 100%; height: 40px; background: #252525; color: black; border: 1px solid #333; border-radius: ${config.borderRadius}; padding: 2px; font-size: 12px; line-height: 1.2; resize: vertical; outline: none; box-sizing: border-box; display: block;" placeholder="Buraya notunu bırakabilirsin..."></textarea>
							</div>
					</div>
                </div>
                <div id="panel-hasar" class="tab-panel-content"> ${hapBuildPanelHTML(typeof dosyaId !== 'undefined' ? dosyaId : '---')} </div>`;
            // TIKLAMA OLAYLARINI BAĞLAMA (Event Listeners)
            // 1. Ana Sekmeler (İşlemler / Hasar Analizi)
            panelContent.querySelectorAll('.main-tab').forEach(tabBtn => {
                tabBtn.addEventListener('click', function () {
                    const targetId = this.getAttribute('data-target');
                    panelContent.querySelectorAll('.main-tab').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    panelContent.querySelectorAll('.tab-panel-content').forEach(p => p.classList.remove('active'));
                    document.getElementById(targetId).classList.add('active');
                });
            });
            // 2. Hasar Alt Sekmeleri (Kaporta / Mekanik / Elektrik)
            panelContent.querySelectorAll('.hap-tab').forEach(subBtn => {
                subBtn.addEventListener('click', function () {
                    const subTarget = this.getAttribute('data-subtab');
                    panelContent.querySelectorAll('.hap-tab').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    panelContent.querySelectorAll('.hap-view').forEach(v => v.classList.remove('active'));
                    document.getElementById('hap-view-' + subTarget).classList.add('active');
                });
            });
            var vovoBtn = panelContent.querySelector('#btnKaydetvovo');
            if (vovoBtn) {
                vovoBtn.onclick = function (e) {
                    var origKaydetOk = w.kaydet_ok;
                    w.kaydet_ok = function () { alert('RESPONSE:\n' + w.ajax1.response.substring(0, 500)); origKaydetOk.apply(this, arguments); };
                    e.preventDefault(); e.stopPropagation(); var w = unsafeWindow;
                    // Orijinalleri sakla
                    var orig_check_form2 = w.check_form2, orig_check_form = w.check_form, orig_kaydet_ok = w.kaydet_ok;
                    function geriAl() { w.check_form2 = orig_check_form2; w.check_form = orig_check_form; w.kaydet_ok = orig_kaydet_ok; }
                    w.check_form2 = function () { w.$('#btnKaydet1').hide(); w.$('#btnKaydet2').hide(); return true; };
                    w.check_form = function () { return true; };
                    w.kaydet_ok = function () {
                        var response = w.ajax1.response;
                        console.log('ZORLA KAYDET RESPONSE:', response);
                        // Şasi hatası
                        if (response.indexOf('HAS_SASI_NO') !== -1) {
                            var sasiEl = w.document.getElementById('HAS_SASI_NO');
                            var origSasi = sasiEl.value;
                            sasiEl.value = origSasi + '0'.repeat(17 - origSasi.length);
                            for (var i = 0; i < w.document.hasar.elements.length; i++) { var el = w.document.hasar.elements[i]; w.ajax1.setVar(el.name, el.type == 'checkbox' ? (el.checked ? el.value : '') : el.value); }
                            w.ajax1.runAJAX();
                            setTimeout(function () { sasiEl.value = origSasi; }, 2000);
                            return;
                        }
                        // Marka hatası
                        if (response.indexOf('HAS_MARKA_ID') !== -1) { w.alert('Marka seçilmeden kayıt yapılamaz!'); w.$('#indicator_1').hide(); w.$('#indicator_2').hide(); w.$('#btnKaydet1').show(); w.$('#btnKaydet2').show(); geriAl(); return; }
                        // Model yılı uyuşmazlığı
                        if (response.indexOf('HAS_MODEL_ADI') !== -1) {
                            var yilMatch = response.match(/seçiniz:\s*\\n\\n(\d{4})/);
                            if (yilMatch) {
                                var dogruYil = yilMatch[1];
                                console.log('Doğru model yılı:', dogruYil);
                                w.$('[name="HAS_MODEL_YILI"]').val(dogruYil);
                                w.$('[name="HAS_MODEL_YILI_AB"]').val(dogruYil);
                                if (w.document.getElementById('HAS_MODEL_YILI')) w.document.getElementById('HAS_MODEL_YILI').value = dogruYil;
                                for (var ii = 0; ii < w.document.hasar.elements.length; ii++) { var ell = w.document.hasar.elements[ii]; w.ajax1.setVar(ell.name, ell.type == 'checkbox' ? (ell.checked ? ell.value : '') : ell.value); }
                                w.ajax1.runAJAX();
                                return;
                            }
                        }
                        // Başarılı veya diğer hatalar
                        var cleanResponse = response.replace(/<!--[\s\S]*?-->/g, '');
                        var orig_alert = w.alert;
                        w.alert = function (msg) { if (msg.indexOf('Kaydedilmiştir') !== -1) orig_alert(msg); else console.log('SUSTURULDU:', msg); };
                        var lines = cleanResponse.split('\n');
                        /* lines.forEach(function(line) { line = line.trim(); if (!line) return; try { eval(line); } catch(ex) { console.log('satır atlandı:', line); } }); */
                        lines.forEach(function (line) { line = line.trim(); if (!line) { return; } try { Function(line)(); } catch (ex) { console.log('satır atlandı:', line); } });
                        w.alert = orig_alert;
                        w.$('#indicator_1').hide(); w.$('#indicator_2').hide(); w.$('#btnKaydet1').show(); w.$('#btnKaydet2').show();
                        geriAl();
                    };
                    w.Uyarilari_Temizle();
                    w.kaydet();
                };
            }
            if (loc('orient')) { /* model hatası düzeltimi */
                window.addEventListener('load', function () {
                    setTimeout(function () {
                        var sasiBtn = unsafeWindow.document.getElementById('SASI_MDL');
                        if (!sasiBtn) return;
                        sasiBtn.setAttribute('onclick',
                            "popup('popup_modeller.php?uygun=1&id='+$('#HAS_MARKA_ID').val()+'&HAS_MODEL_YILI='+$('#HAS_MODEL_YILI').val()+'&sasi='+$('#HAS_SASI_NO').val()+'&motor_no='+$('#HAS_MOTOR_NO').val(),'modeller',330,600)"
                        );
                        console.log('[KS] Uygun modeller tıklamas düzeltildi - motorNo kaldırıldı');
                    }, 1500);
                });
            }
            /* ── Önbellek Sistemi ── */
            var onbellekKey = 'onbellek_' + dosyaId, btnOnbellek = panelContent.querySelector('#btnOnbellek'), btnOnbellekYukle = panelContent.querySelector('#btnOnbellekYukle');
            // Başlangıçta yükle butonunu kontrol et
            (function () {
                var raw = GM_getValue(onbellekKey, null);
                if (!raw) { btnOnbellekYukle.textContent = '📤 YÜKLE'; btnOnbellekYukle.disabled = true; btnOnbellekYukle.style.opacity = '0.4'; btnOnbellekYukle.style.cursor = 'not-allowed'; }
                else {
                    try {
                        var parsed = JSON.parse(raw), tarih = parsed.__tarih__ || '?';
                        btnOnbellekYukle.textContent = '📤 YÜKLE ' + tarih; btnOnbellekYukle.disabled = false; btnOnbellekYukle.style.opacity = ''; btnOnbellekYukle.style.cursor = '';
                    } catch (e) { btnOnbellekYukle.textContent = '📤 YÜKLE'; }
                }
            })();
            if (btnOnbellek) {
                btnOnbellek.onclick = function () {
                    var w = unsafeWindow, data = {}, now = new Date();
                    var tarih = now.getDate().toString().padStart(2, '0') + '.' + (now.getMonth() + 1).toString().padStart(2, '0') + ' ' + now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                    data.__tarih__ = tarih;
                    w.$(w.document.hasar.elements).each(function () { var el = this; if (!el.name) { return; } if (el.type === 'checkbox' || el.type === 'radio') { data[el.name] = el.checked; } else { data[el.name] = el.value; } });
                    GM_setValue(onbellekKey, JSON.stringify(data));
                    var count = Object.keys(data).length - 1;
                    btnOnbellekYukle.textContent = '📤 YÜKLE ' + tarih;
                    btnOnbellekYukle.disabled = false;
                    btnOnbellekYukle.style.opacity = '';
                    btnOnbellekYukle.style.cursor = '';
                    console.log('[KS] Önbellek kaydedildi:', count, 'alan, tarih:', tarih);
                    btnOnbellek.textContent = '✅ KAYDEDİLDİ (' + count + ')';
                    setTimeout(function () { btnOnbellek.textContent = '📥 ÖNBELLEK KAYDET'; }, 2000);
                };
            }
            if (btnOnbellekYukle) {
                btnOnbellekYukle.onclick = function () {
                    var w = unsafeWindow, raw = GM_getValue(onbellekKey, null);
                    if (!raw) return;
                    var data = JSON.parse(raw), yuklendi = 0;
                    w.$(w.document.hasar.elements).each(function () {
                        var el = this;
                        if (!el.name || !(el.name in data) || el.name === '__tarih__') return;
                        if (el.type === 'checkbox' || el.type === 'radio') { el.checked = data[el.name]; } else { el.value = data[el.name]; if (el.tagName === 'SELECT') { w.$(el).trigger('change'); } }
                        yuklendi++;
                    });
                    console.log('[KS] Önbellek yüklendi:', yuklendi, 'alan');
                    btnOnbellekYukle.textContent = '✅ YÜKLENDİ (' + yuklendi + ')';
                    setTimeout(function () { var raw2 = GM_getValue(onbellekKey, null); if (raw2) { var tarih = JSON.parse(raw2).__tarih__ || '?'; btnOnbellekYukle.textContent = '📤 YÜKLE ' + tarih; } }, 2000);
                };
            }
            /* F2 / F4 kısayolları */
            document.addEventListener('keydown', (e) => {
                if (e.key === 'F2') { e.preventDefault(); const btn = document.getElementById('btnKaydetYeni') || document.getElementsByName('btnKaydetYeni')[0]; if (btn && btn.offsetParent !== null) btn.click(); }
                if (e.key === 'F4') { e.preventDefault(); const btn = document.getElementById('autoSelectBtn') || document.getElementsByName('autoSelectBtn')[0]; if (btn && btn.offsetParent !== null) btn.click(); }
            });
            /* Görünürlük kontrolü */
            if (!ANALIZPANEL_pys) { const el = document.getElementById('pys-section'); if (el) el.style.display = 'none'; }
            if (!ANALIZPANEL_not) { const el = document.getElementById('not-section'); if (el) el.style.display = 'none'; }
            if (!ANALIZPANEL_hasar) { const el = document.getElementById('hasar-section'); if (el) el.style.display = 'none'; }
            if (magdurpanel) { const as = document.getElementById('action-section'); if (as) as.style.display = 'none'; const ad = document.getElementById('action-divider'); if (ad) ad.style.display = 'none'; }
            /* ── Hasar verisi çek ── */
            if (ANALIZPANEL_hasar) { setTimeout(function () { hapVerileriGetir(dosyaId, currentHost); }, 800); }
            /* ── YARDIMCI FONKSİYONLAR ── */
            const $ = (id) => document.getElementById(id) || document.querySelector(`[name="${id}"]`);
            const getValue = (id) => ($(id)?.value || $(id)?.textContent || '').trim();
            const parseNum = (id) => { const val = getValue(id).replace(/,/g, ''); return val === '' ? 0 : Number(val); };
            const getDate = (prefix) => { const [g, a, y] = [getValue(prefix + '_GUN'), getValue(prefix + '_AY'), getValue(prefix + '_YIL')]; if (!g || !a || !y) return null; return new Date(y, a - 1, g); };
            // --- Not Sistemi Ayarları ---
            const storageKey = "page_note_" + unsafeWindow.location.href;
            const textarea = document.getElementById('page-note-input');
            const status = document.getElementById('note-status');
            function savePageNote() { if (textarea) { localStorage.setItem(storageKey, textarea.value); if (status) { status.innerText = "Not Kaydedildi ✔"; setTimeout(() => { status.innerText = "Otomatik Kaydediliyor..."; }, 2000); } } }
            if (textarea) {
                const savedNote = localStorage.getItem(storageKey); if (savedNote) { textarea.value = savedNote; } let saveTimeout;
                textarea.addEventListener('input', () => { if (status) status.innerText = "Yazılıyor..."; clearTimeout(saveTimeout); saveTimeout = setTimeout(savePageNote, 1000); });
            }
            const kaydetButonu = document.getElementById('btnKaydetYeni');
            if (kaydetButonu) { kaydetButonu.addEventListener('click', () => { savePageNote(); }); }
            /* ===== 3. PANEL GÜNCELLEME ===== */
            function makeBadge(text, color, borderRadius, fontSize = '10px') {
                return `<span style=" background:${color}22; color:${color}; border:1px solid ${color}44; padding:1px 6px; border-radius:${borderRadius};
				font-size:${fontSize}; font-weight:bold; white-space:nowrap; display:inline-block; vertical-align:middle; text-transform:uppercase; ">${text}</span>`;
            }
            function safeVal(el) { if (!el) return ''; return (el.value !== undefined ? el.value : el.textContent || '').trim(); }
            function safeDateOf(id) { try { const d = getDate(id); return (d instanceof Date && !isNaN(d)) ? d : null; } catch (_) { return null; } }
            function safeNum(id) { try { return parseNum(id) || 0; } catch (_) { return 0; } }
            function median(arr) { if (!arr.length) { return 0; } const s = [...arr].sort((a, b) => a - b), m = Math.floor(s.length / 2); return s.length % 2 !== 0 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); }
            // ─── DOM ÖNBELLEKLEME ────────────────────────────────────────
            function gatherDOMRefs() {
                return {
                    sigortaSekli: document.getElementById('SIGORTA_SEKLI'),
                    rucu1: document.getElementById('RUCU1'),
                    rucu0: document.getElementById('RUCU0'),
                    pert: document.getElementById('pert'),
                    sahis: document.getElementById('SIGORTALI_SAHIS'),
                    sirket: document.getElementById('SIRKETMI'),
                    ihbarEl: document.getElementById('KAZA_IHBAR_TURU'),
                    hasarEl: document.getElementById('HASAR_SEKLI'),
                    servisAdEl: document.getElementById('SERVIS_ADI'),
                    yetkiliEl: document.getElementsByName('SERVIS_TUR_ID1')[0],
                    anlasmaliEl: document.getElementById('ANLASMALI1'),
                    panelContent: document.getElementById('panelContent'),
                    resBox: document.getElementById('shb-res-box'),
                    btnAnaliz: document.getElementById('btn-auto-analiz'),
                    btnLook: document.getElementById('btn-auto-look'),
                };
            }
            // ─── ANA FONKSİYON ──────────────────────────────────────────
            function updatePanel() {
                const dom = gatherDOMRefs();
                const isTrafik = dom.sigortaSekli?.value === "1";
                const br = config.borderRadius;
                let html = '<table style="width:100%;border-collapse:collapse;font-size:13px;color:white;">';
                // ── 1. POLİÇE / HASAR TARİH KONTROLÜ ───────────────────
                if (ANALIZPANEL_pol && !magdurpanel) {
                    try {
                        const hasar = safeDateOf('HASAR_TARIHI');
                        const bas = safeDateOf('SB_POLICE_BAS');
                        const bitis = safeDateOf('SB_POLICE_BITIS');
                        if (hasar && bas && bitis) {
                            [hasar, bas, bitis].forEach(d => d.setHours(0, 0, 0, 0));
                            html += `<tr><td colspan="2" style="text-align:center;padding:5px;">
                                <div class="ks-tooltip-container">`;
                            if (hasar >= bas && hasar <= bitis) {
                                const diffBas = Math.floor((hasar - bas) / 86400000);
                                const diffBit = Math.floor((bitis - hasar) / 86400000);
                                if (diffBas <= 3) {
                                    html += `<b style="color:#ff4444;font-size:14px;">🚨 KRİTİK: YENİ POLİÇE HASARI</b><br><span style="color:#ff4444;">Poliçe başladıktan sadece <b>${diffBas} gün</b> sonra kaza gerçekleşmiş!</span>`;
                                } else if (diffBas <= 7) {
                                    html += `<b style="color:${SUCCESS_COLOR}">✔️ Poliçe İçinde</b><br><span style="color:#ffcc00">⚠️ Dikkat: İlk hafta içinde hasar (${diffBas}. gün)</span>`;
                                } else if (diffBit <= 7) {
                                    html += `<b style="color:${SUCCESS_COLOR}">✔️ Poliçe İçinde</b><br><span style="color:#ffcc00">⚠️ Dikkat: Poliçe bitimine yakın (${diffBit} gün kaldı)</span>`;
                                } else {
                                    html += `<b style="color:${SUCCESS_COLOR};font-size:14px;">✅ Poliçe İçinde (Sorunsuz)</b>`;
                                }
                            } else {
                                const diff = hasar < bas ? Math.floor((bas - hasar) / 86400000) : Math.floor((hasar - bitis) / 86400000);
                                const yon = hasar < bas ? 'ÖNCE' : 'SONRA';
                                html += `<b style="color:#ff0000;font-size:16px;">❌ POLİÇE DIŞI HASAR</b><br><span style="background:red;color:white;padding:2px 5px;border-radius:${br};">Vade ${yon} ${diff} gün fark var!</span>`;
                            }
                            html += `<div class="ks-tooltip-box">Hasar ile Poliçe arasındaki gün farkını kontrol eder.</div></div></td></tr>`;
                        }
                    } catch (err) { console.warn('[updatePanel] Tarih kontrolü hatası:', err); }
                    html += `<tr><td colspan="2"><hr class="custom-line"></td></tr>`;
                }
                // ── 2. SİGORTA ŞEKLİ BADGE ──────────────────────────────
                let dynamicLabel = (magdurpanel || isTrafik) ? 'Mağdur Araç :' : 'Sigortalı/Kaskolu Araç :';
                let sigortaBadge = '';
                if (dom.sigortaSekli) {
                    try {
                        const selIdx = dom.sigortaSekli.selectedIndex;
                        const selectedText = dom.sigortaSekli.options[selIdx]?.text || 'Bilinmiyor';
                        const upText = selectedText.toUpperCase();
                        const isTrafikSel = upText.includes('TRAFİK');
                        const sigortaColor = isTrafikSel ? '#00d4ff' : upText.includes('KASKO') ? '#a29bfe' : '#ff9500';
                        if (magdurpanel || isTrafikSel) dynamicLabel = 'Mağdur Araç :';
                        else if (upText.includes('KASKO')) dynamicLabel = 'Sigortalı Araç :';
                        sigortaBadge = makeBadge(selectedText, sigortaColor, br);
                        if (ANALIZPANEL_sgs && !magdurpanel) { html += `<tr style="border-bottom:1px solid #333;"><td style="padding:4px 0;">Sigorta Şekli:</td><td style="text-align:right;padding:4px 0;">${sigortaBadge}</td></tr>`; }
                    } catch (err) { console.warn('[updatePanel] Sigorta şekli hatası:', err); }
                }
                // ── 3. RÜCU ─────────────────────────────────────────────
                if (ANALIZPANEL_rc && !magdurpanel) {
                    try {
                        const rucuVar = dom.rucu1?.checked;
                        const rucuYok = dom.rucu0?.checked;
                        const rucuStatus = rucuVar ? makeBadge('VAR 🔴', '#ff4d4d', br) : rucuYok ? makeBadge('YOK 🟢', '#2ecc71', br) : makeBadge('BELİRSİZ 🔘', '#ff9500', br);
                        html += `<tr style="border-bottom:1px solid #333;"><td style="white-space:nowrap;width:100px;">Rücu:</td><td style="text-align:right;padding:4px 0;">${rucuStatus}</td></tr>`;
                    } catch (err) { console.warn('[updatePanel] Rücu hatası:', err); }
                }

                // ── 4. PERT ──────────────────────────────────────────────
                if (ANALIZPANEL_pert && !magdurpanel) {
                    try {
                        const pertVar = dom.pert?.checked || false;
                        const pertStatus = pertVar ? makeBadge('VAR 🔴', '#ff4d4d', br) : makeBadge('YOK 🟢', '#2ecc71', br);
                        html += `<tr style="border-bottom:1px solid #333;"><td style="white-space:nowrap;width:100px;">Pert:</td><td style="text-align:right;padding:4px 0;">${pertStatus}</td></tr>`;
                    } catch (err) { console.warn('[updatePanel] Pert hatası:', err); }
                }
                // ── Şirket/Şahıs Durumu ──────────────────────────────────
                if (ANALIZPANEL_mulk && !magdurpanel) {
                    try {
                        const sahisInput = document.getElementById('SIGORTALI_SAHIS_CHECK');
                        const sirketSelect = document.querySelector('select[name="SIRKETMI"]');
                        let durumText = "BELİRSİZ", durumColor = "#95a5a6", takto = "BELİRSİZ";
                        if (sirketSelect && sirketSelect.value !== "") {
                            durumText = sirketSelect.options[sirketSelect.selectedIndex].text;
                            if (durumText === "Tüzel") { durumColor = "#f1c40f"; } else if (durumText === "Özel") { durumColor = "#3498db"; }
                        }
                        if (sahisInput && sahisInput.checked) {
                            takto = "ŞAHIS";
                            if (durumText === "BELİRSİZ") durumColor = "#3498db";
                        } else { takto = (durumText === "Tüzel") ? "ŞİRKET" : "BELİRSİZ"; }
                        const sirketStatus = makeBadge(durumText, durumColor, br);
                        const fakto = makeBadge(takto, durumColor, br);
                        html += `<tr style="border-bottom:1px solid #333;"><td style="white-space:nowrap;width:100px;">Mülkiyet:</td><td style="text-align:right;padding:4px 0;">${sirketStatus} ${fakto}</td></tr>`;
                    } catch (err) { console.warn('[updatePanel] Mülkiyet hatası:', err); }
                }
                // ── Ekspertiz Şekli ──────────────────────────────────────
                if (ANALIZPANEL_uzak && !magdurpanel) {
                    try {
                        const ekspertizSelect = document.getElementById('UZAKTAN_EKSPERTIZ');
                        let durumText = "BELİRSİZ", durumColor = "#95a5a6";
                        if (ekspertizSelect && ekspertizSelect.value !== "0") { durumText = ekspertizSelect.options[ekspertizSelect.selectedIndex].text; durumColor = (durumText === "Uzaktan") ? "#3498db" : "#e67e22"; }
                        const ekspertizBadge = makeBadge(durumText, durumColor, br);
                        html += `<tr style="border-bottom:1px solid #333;"><td style="white-space:nowrap;width:100px;">Ekspertiz Şekli:</td><td style="text-align:right;padding:4px 0;">${ekspertizBadge}</td></tr>`;
                    } catch (err) { console.warn('[updatePanel] Ekspertiz şekli hatası:', err); }
                }
                // ── 5. İHBAR TÜRÜ & HASAR ŞEKLİ ────────────────────────
                if (ANALIZPANEL_hsr && !magdurpanel) {
                    const IHBAR_COLORS = { '1': '#2ecc71', '2': '#f1c40f', '3': '#3498db', '4': '#ff4d4d', '5': '#9b59b6', '6': '#e67e22' };
                    try {
                        if (dom.ihbarEl && dom.ihbarEl.value !== '' && dom.ihbarEl.value !== '-1') {
                            const txt = dom.ihbarEl.options[dom.ihbarEl.selectedIndex]?.text || '';
                            const color = IHBAR_COLORS[dom.ihbarEl.value] || '#bdc3c7';
                            html += `<tr style="border-bottom:1px solid #333;"><td style="padding:4px 0;white-space:nowrap;width:100px;">İhbar Türü:</td>
							<td style="text-align:right;padding:4px 0;white-space:nowrap;">${makeBadge(txt, color, br)}</td></tr>`;
                        }
                    } catch (err) { console.warn('[updatePanel] İhbar türü hatası:', err); }
                    try {
                        if (dom.hasarEl && dom.hasarEl.value !== '' && dom.hasarEl.value !== '-1') {
                            const txt = dom.hasarEl.options[dom.hasarEl.selectedIndex]?.text || '', v = dom.hasarEl.value;
                            const color = ['1', '5', '18'].includes(v) ? '#ff4d4d' : v === '28' ? '#9c88ff' : '#00d4ff';
                            html += `<tr style="border-bottom:1px solid #333;"><td style="padding:4px 0;white-space:nowrap;width:100px;">Hasar Şekli:</td>
                                <td style="text-align:right;padding:4px 0;white-space:nowrap;">${makeBadge(txt, color, br)}</td></tr>`;
                        }
                    } catch (err) { console.warn('[updatePanel] Hasar şekli hatası:', err); }
                }
                // ── 6. SERVİS TİPİ ──────────────────────────────────────
                if (ANALIZPANEL_srtp && !magdurpanel) {
                    try {
                        const servisAdi = getValue('SERVIS_ADI');
                        if (servisAdi) {
                            const isYetkili = dom.yetkiliEl?.checked, isAnlasmali = dom.anlasmaliEl?.checked;
                            const turBadge = makeBadge(isYetkili ? 'Yetkili' : 'Yetkisiz', isYetkili ? '#00d4ff' : '#ff9500', br);
                            const anlasmaBadge = makeBadge(isAnlasmali ? 'Anlaşmalı' : 'Anlaşmasız', isAnlasmali ? '#00d4ff' : '#ff9500', br);
                            html += `<tr style="border-bottom:1px solid #333;"><td style="white-space:nowrap;width:100px;">Servis Tipi:</td>
							<td style="text-align:right;padding:4px 0;white-space:nowrap;">${turBadge} <span style="color:#444;margin:0 1px;">|</span> ${anlasmaBadge}</td></tr>`;
                        }
                    } catch (err) { console.warn('[updatePanel] Servis tipi hatası:', err); }
                    html += `<tr><td colspan="2"><hr class="custom-line"></td></tr>`;
                }
                // ── 7. ALAN LİSTESİ (Servis, Tramer, Sigortalı, Araç) ───
                const tahminiHasar = safeNum('TAHMINI_HASAR');
                let hasPiyasa = safeNum(magdurpanel ? 'PIYASA' : 'HAS_PIYASA');
                if (isTrafik && !magdurpanel && window.MAGDUR_DATA.isLoaded && window.MAGDUR_DATA.mgPIYASA) { hasPiyasa = parseFloat(window.MAGDUR_DATA.mgPIYASA.replace(/\./g, '').replace(',', '.')) || 0; }
                const ssTahmini = safeNum('SS_TAHMINI_HASAR');
                const formatTramer = str => { if (!str?.toString().trim()) return '-'; return str.toString().replace(/\s/g, '').replace(/(.{3})/g, '$1 ').trim(); };
                const formatText = (str, limit = 25) => { if (!str) return '-'; const clean = str.replace(/^\(\s*.*?\s*\)\s*/, ''); return clean.length > limit ? clean.substring(0, limit) + '…' : clean; };
                const fields = [
                    { label: 'Servis :', id: 'SERVIS_ADI', condition: ANALIZPANEL_srad && !magdurpanel },
                    { label: 'Tramer :', id: 'TRAMER_IHBAR_NO' && 'TRAMER_DOSYA_NO', condition: ANALIZPANEL_tra && !magdurpanel },
                    { label: (magdurpanel || isTrafik) ? 'Mağdur :' : 'Sigortalı :', id: (magdurpanel || isTrafik) ? 'MAGDUR_AD_SOYAD' : 'HAS_ARAC_SAHIBI', condition: ANALIZPANEL_sad },
                    { label: dynamicLabel, id: (magdurpanel || isTrafik) ? 'MODEL_ADI' : 'HAS_MODEL_ADI', condition: ANALIZPANEL_aad },
                ];
                fields.forEach(f => {
                    if (!f.condition) return;
                    try {
                        let raw = '';
                        const el = document.getElementById(f.id) || document.getElementsByName(f.id)[0];
                        if (magdurpanel && f.id === 'MAGDUR_AD_SOYAD') { const ad = document.getElementById('MAGDUR_AD')?.value || '', soyad = document.getElementById('MAGDUR_SOYAD')?.value || ''; raw = `${ad} ${soyad}`.trim(); }
                        else if (isTrafik && !magdurpanel && window.MAGDUR_DATA.isLoaded) {
                            if (f.id === 'MODEL_ADI' || f.id === 'HAS_MODEL_ADI') {
                                raw = window.MAGDUR_DATA.mgMODEL_ADI || '';
                            } else if (f.id === 'MAGDUR_AD_SOYAD') {
                                const ad = window.MAGDUR_DATA.mgMAGDUR_AD || '', soyad = window.MAGDUR_DATA.mgMAGDUR_SOYAD || ''; raw = `${ad} ${soyad}`.trim();
                            } else if (f.id === 'HAS_ARAC_SAHIBI') { raw = window.MAGDUR_DATA.mgMODEL_ADI || ''; }
                        }
                        else if (isTrafik) {
                            const marker = document.querySelector('input[name="MAGDUR_MARKA_ID"]'), targetRow = marker?.parentElement?.closest('tr');
                            if (targetRow) {
                                const cells = targetRow.querySelectorAll('td.acik');
                                if (f.id.includes('MODEL_ADI')) { raw = cells[2]?.innerText || ''; }
                                else if (f.id === 'MAGDUR_AD_SOYAD') { raw = cells[6]?.innerText || ''; }
                                else if (f.id === 'HAS_ARAC_SAHIBI') { raw = cells[2]?.innerText || ''; }
                            }
                        }
                        if (!raw && el) { raw = safeVal(el); }
                        let status = raw !== '' ? '✅' : '❌', valStr = '-', color = 'white';
                        if (raw !== '') {
                            if (['HAS_PIYASA', 'PIYASA'].includes(f.id)) { valStr = hasPiyasa.toLocaleString('tr-TR'); status = hasPiyasa < 1000 ? '⚠️' : '✅'; color = hasPiyasa < 1000 ? '#ff9500' : '#00d4ff'; }
                            else if (f.id === 'TRAMER_IHBAR_NO') { valStr = formatTramer(raw); }
                            else if (['SERVIS_ADI', 'HAS_ARAC_SAHIBI', 'MAGDUR_AD_SOYAD', 'HAS_MODEL_ADI', 'MODEL_ADI'].includes(f.id)) { valStr = formatText(raw, 22); status = ' '; }
                            else { valStr = raw; }
                        }
                        html += `<tr><td style="color:white;padding:4px 0;white-space:nowrap;">${f.label}</td><td style="text-align:right;color:${color};font-weight:bold;">${valStr}<span style="margin-left:5px;">${status}</span></td></tr>`;
                    } catch (err) { console.warn(`[updatePanel] Alan hatası (${f.id}):`, err); }
                });
                // ── 8. MUALLAK / PİYASA / EKSPER ORAN TABLOSU ───────────
                if ((ANALIZPANEL_mull || ANALIZPANEL_ryc || ANALIZPANEL_rycorn) && !magdurpanel) { html += `<tr><td colspan="2"><hr class="custom-line"></td></tr>`; }
                const oran = hasPiyasa > 0 ? (tahminiHasar / hasPiyasa) * 100 : 0;
                let durumMetni = 'BELİRSİZ', durumColor = '#aaa';
                if (hasPiyasa >= 1000) {
                    if (oran <= 30) { durumMetni = '✅ UYGUN'; durumColor = SUCCESS_COLOR; }
                    else if (oran <= 60) { durumMetni = '🟠 %30 ÜZERİ'; durumColor = '#ffa500'; }
                    else { durumMetni = '🔴 %60 ÜZERİ'; durumColor = '#ff4d4d'; }
                }
                const pertUyari = (oran >= 60 && !dom.pert?.checked) ? `<div style="color:#ff4d4d;font-weight:bold;font-size:10px;animation:ksBlink 1s infinite;margin-top:2px;text-align:right;">⚠️ DİKKAT: PERT SEÇİLMELİ!</div>` : '';
                html += `<style>@keyframes ksBlink{0%{opacity:1}50%{opacity:0.3}100%{opacity:1}}</style> <table style="width:100%;border-collapse:collapse;font-size:12px;color:white;line-height:1.2;">`;
                if (ANALIZPANEL_mull && !magdurpanel) {
                    html += `<tr><td style="width:100px;padding:4px 0;">Sigorta Muallak:</td><td style="text-align:right;padding:4px 0;"><b>${ssTahmini.toLocaleString()} ₺</b></td></tr>`;
                }
                if (ANALIZPANEL_ryc) {
                    html += `<tr style="border-top:1px solid #333;"><td style="width:100px;padding:4px 0;">Piyasa / Rayiç :</td><td style="text-align:right;padding:4px 0;"><b style="color:#00d4ff">${hasPiyasa.toLocaleString('tr-TR')} ₺</b></td></tr>`;
                }
                if (ANALIZPANEL_rycorn && !magdurpanel) {
                    html += `<tr>
                        <td style="width:100px;padding:4px 0;">Eksper Muallak:</td><td style="text-align:right;padding:4px 0;"><b style="color:${durumColor}">${tahminiHasar.toLocaleString()} ₺</b>${makeBadge(durumMetni, durumColor, br)}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding:4px 0;">
                            <div class="ks-tooltip-container" style="width:100%;">
                                <div style="display:flex;align-items:center;gap:6px;">
                                    <div style="background:#222;flex-grow:1;height:6px;border-radius:4px;overflow:hidden;border:1px solid #444;">
                                        <div style="background:${durumColor};width:${Math.min(oran, 100)}%;height:100%;"></div>
                                    </div>
                                    <span style="color:${config.Color};font-size:12px;min-width:25px;">%${oran.toFixed(0)}</span>
                                </div>
                                ${pertUyari}
                                <div class="ks-tooltip-box">Eksper hasar tutarının piyasa değerine oranını gösterir.</div>
                            </div>
                        </td>
                    </tr>`;
                }
                html += `</table>`;
                // ── DOM YAZ ─────────────────────────────────────────────
                if (dom.panelContent) { dom.panelContent.innerHTML = html; }
                // ── 9. BUTON OLAY DİNLEYİCİLERİ ────────────────────────
                if (dom.btnAnaliz) { dom.btnAnaliz.onclick = () => startAutomatedSearch(true, dom); }
                if (dom.btnLook) { dom.btnLook.onclick = () => startAutomatedSearch(false, dom); }
            }
            // ─── HEDEF URL OLUŞTURUCU ────────────────────────────────────
            function buildTargetUrl() {
                try {
                    const extractYear = str => (String(str).match(/\b(19|20)\d{2}\b/) || [])[0] || '', cleanModel = str => str.replace(/\d{2}\/\d{2}\/\d{4}.*/g, '').replace(/\(\s*\d+\s*\)/g, '').replace(/\s+/g, ' ').trim();
                    let m = '', yRaw = '', kStr = '0';
                    const isTrafik = document.getElementById('SIGORTA_SEKLI')?.value === '1';
                    if (magdurpanel) { m = safeVal(document.getElementById('MODEL_ADI')); yRaw = safeVal(document.getElementById('MODEL_YILI')); kStr = safeVal(document.getElementById('KM')) || '0'; }
                    else if (isTrafik) {
                        const hiddenInput = document.querySelector('input[name="MAGDUR_MARKA_ID"]');
                        const row = hiddenInput?.parentElement?.closest('tr') || document.querySelector('td.acik')?.closest('tr');
                        if (row) { const cells = row.querySelectorAll('td.acik'); m = cells[2]?.innerText || ''; yRaw = cells[3]?.innerText || ''; }
                    } else {
                        m = safeVal(document.getElementById('HAS_MODEL_ADI') || document.getElementById('MODEL_ADI'));
                        yRaw = safeVal(document.getElementById('HAS_MODEL_YILI') || document.getElementById('MODEL_YILI'));
                        kStr = safeVal(document.getElementById('HAS_KM')) || '0';
                    }
                    m = cleanModel(m);
                    const y = extractYear(yRaw), k = parseInt(kStr.replace(/\D/g, ''), 10) || 0;
                    if (!m) return null;
                    return { model: m, year: y, kmMin: k >= 100 ? Math.floor(k * 0.85) : null, kmMax: k >= 100 ? Math.ceil(k * 1.15) : null, };
                } catch (err) { console.warn('[buildTargetUrl] Hata:', err); return null; }
            }
            // ─── OTOMATİK ARAMA ─────────────────────────────────────────
            function startAutomatedSearch(isAnalyze, dom) {
                const resBox = dom?.resBox || document.getElementById('shb-res-box');
                try {
                    const data = buildTargetUrl();
                    if (!data) { if (isAnalyze && resBox) resBox.innerHTML = '❌ Araç verisi okunamadı!'; return; }
                    if (isAnalyze && resBox) { resBox.style.marginBottom = '10px'; resBox.innerHTML = `<span style="color:#fff;font-size:13px;opacity:0.8;">🔍 Filtreleniyor…</span>`; }
                    const googleQuery = `site:sahibinden.com "${data.model}" ${data.year}`;
                    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`;
                    GM_xmlhttpRequest({
                        method: 'GET', url: googleUrl, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0' },
                        onload(gRes) {
                            try {
                                const gDoc = new DOMParser().parseFromString(gRes.responseText, 'text/html');
                                const target = [...gDoc.querySelectorAll('a')].find(a => a.href.includes('sahibinden.com/') && !a.href.includes('/ilan listelendi/') && !a.href.includes('/detay'));
                                if (!target) { if (isAnalyze && resBox) resBox.innerHTML = '⚠️ Kategori bulunamadı.'; return; }
                                let shbStr = '';
                                try { const urlObj = new URL(target.href); shbStr = urlObj.pathname === '/url' ? urlObj.searchParams.get('q').split('&')[0] : target.href.split('&')[0]; } catch (_) { shbStr = target.href; }
                                const finalUrl = new URL(shbStr);
                                const cleanPath = finalUrl.pathname.replace(/\/(en)(\/|$)/gi, '/').replace(/\/(dizel|benzin|lpg|hibrit|elektrik)(\/|$)/gi, '/').replace(/\/(manual|otomatik|yari-otomatik)(\/|$)/gi, '/').replace(/\/+$/, '');
                                finalUrl.pathname = cleanPath || '/';
                                ['pagingOffset', 'pagingPage'].forEach(p => finalUrl.searchParams.delete(p));
                                //https://www.sahibinden.com/toyota-corolla-1.6-advance?pagingSize=50&a5_max=2015&a4_max=150000&a4_min=100000&a5_min=2015
                                if (data.year) { finalUrl.searchParams.set('a5_max', data.year); }
                                if (data.kmMin > 1000) { finalUrl.searchParams.set('a4_max', data.kmMax); }
                                if (data.year) { finalUrl.searchParams.set('a5_min', data.year); }
                                if (data.kmMin > 1000) { finalUrl.searchParams.set('a4_min', data.kmMin); }
                                if (isAnalyze) fetchPricesFromShb(finalUrl.toString(), resBox); else unsafeWindow.open(finalUrl.toString(), '_blank');
                            } catch (err) { console.warn('[startAutomatedSearch] Google parse hatası:', err); if (isAnalyze && resBox) resBox.innerHTML = '❌ Google yanıtı işlenemedi.'; }
                        },
                        onerror(err) { console.warn('[startAutomatedSearch] İstek hatası:', err); if (isAnalyze && resBox) resBox.innerHTML = '❌ Ağ hatası oluştu.'; }
                    });
                } catch (err) { console.warn('[startAutomatedSearch] Genel hata:', err); if (isAnalyze && resBox) resBox.innerHTML = '❌ Beklenmeyen hata.'; }
            }
            // ─── FİYAT VERİSİ ÇEKME & GELİŞMİŞ İSTATİSTİK ─────────────
            function fetchPricesFromShb(url, resBox) {
                if (!resBox) resBox = document.getElementById('shb-res-box');
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0' },
                    onload(res) {
                        try {
                            const sDoc = new DOMParser().parseFromString(res.responseText, 'text/html');
                            const rows = [...sDoc.querySelectorAll('tr.searchResultsItem')];
                            const dataList = rows.reduce((acc, tr) => {
                                const titleEl = tr.querySelector('.classifiedTitle');
                                const priceEl = tr.querySelector('.searchResultsPriceValue');
                                const attrEls = tr.querySelectorAll('.searchResultsAttributeValue');
                                if (titleEl && priceEl && attrEls.length >= 2) {
                                    const price = parseInt(priceEl.innerText.replace(/\D/g, ''), 10) || 0;
                                    if (price > 100_000) {
                                        acc.push({
                                            id: tr.getAttribute('data-id') || Math.random(),
                                            title: (titleEl.title || '').substring(0, 20),
                                            link: 'https://www.sahibinden.com' + titleEl.getAttribute('href'),
                                            year: attrEls[0].innerText.trim(),
                                            km: attrEls[1].innerText.trim(),
                                            price,
                                        });
                                    }
                                }
                                return acc;
                            }, []);
                            if (!dataList.length) {
                                resBox.innerHTML = `<br>
                                    <a href="${url}" target="_blank" style="color:#27fdf9;font-size:13px;">Buraya Tıkla!</a><br>
                                    Sonuç bulunamadı, adresi kontrol et.
                                    <center style="font-size:11px;">Bot engeline takılmış olabilir.</center>`;
                                return;
                            }
                            // ── İSTATİSTİK HESAPLAMALARI ───────────────
                            const prices = dataList.map(d => d.price), minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices), avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length), medPrice = median(prices);
                            const round5k = v => Math.round(v / 5000) * 5000;
                            // ── SEÇİLECEK İLANLAR ────────────────────
                            const byPrice = (a, b) => a.price - b.price;
                            const byAbsAvg = (a, b) => Math.abs(a.price - medPrice) - Math.abs(b.price - medPrice);
                            const sortedLow = [...dataList].sort(byPrice), sortedHigh = [...dataList].sort((a, b) => -byPrice(a, b));
                            const nearMed = [...dataList].sort(byAbsAvg);
                            const displaySet = new Set(), displayList = [];
                            const addItem = (item, color) => { if (item && !displaySet.has(item.id) && displayList.length < 5) { displayList.push({ ...item, color }); displaySet.add(item.id); } };
                            addItem(sortedHigh[0], '#27fdf9'); addItem(sortedHigh[1], '#26f885'); addItem(nearMed[0], '#d3ff73'); addItem(nearMed[1], '#d3ff73'); addItem(sortedLow[0], '#fff8b7');
                            // ── HTML OLUŞTURMA ────────────────────────
                            let html = `<style>
                                .shb-link{color:#42c6ff!important;text-decoration:underline!important;transition:all .2s!important}
                                .shb-link:hover{color:#aeffe8!important;opacity:.8}
                                .shb-link:active{color:#ffeb3b!important}
                                .shb-stat-row{display:flex;justify-content:space-between;align-items:center;padding:2px 0;}
                                .shb-stat-label{font-size:9px;color:#fff;}
                                .shb-stat-val{font-size:10px;font-weight:bold;}
                            </style>`;
                            html += `<div style="color:white;width:100%;">`;
                            // — Özet istatistik satırı —
                            html += `
                            <div style="background:#1a1a2e;padding:2px 2px;margin-bottom:6px;">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;border-bottom:1px solid #333;padding-bottom:3px;">
                                    <span>Piyasa / Rayiç</span><span style="font-size:10px;font-weight:bold;color:#00ff88;">${dataList.length} İlan</span>
                                </div>
                                <div class="shb-stat-row">
                                    <span class="shb-stat-label">🔺 Maksimum</span><span class="shb-stat-val" style="color:#27fdf9;">${maxPrice.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div class="shb-stat-row">
                                    <span class="shb-stat-label">〰 Medyan</span><span class="shb-stat-val" style="color:#d3ff73;">${round5k(medPrice).toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div class="shb-stat-row">
                                    <span class="shb-stat-label">📊 Ortalama</span><span class="shb-stat-val" style="color:#00d4ff;">${round5k(avgPrice).toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div class="shb-stat-row">
                                    <span class="shb-stat-label">🔻 Minimum</span><span class="shb-stat-val" style="color:#fff8b7;">${minPrice.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <!-- Mini fiyat bandı -->
                                <div style="margin-top:5px;position:relative;background:#222;height:4px;border-radius:3px;overflow:hidden;border:1px solid #333;">
                                    <!-- medyan çizgisi -->
                                    <div style=" position:absolute; width:4px; height:100%; background:#d3ff73; z-index:2; left:${((medPrice - minPrice) / (maxPrice - minPrice || 1) * 100).toFixed(1)}%; "></div>
                                    <!-- ortalama çizgisi -->
                                    <div style=" position:absolute; width:3px; height:100%; background:#00d4ff; z-index:2; left:${((avgPrice - minPrice) / (maxPrice - minPrice || 1) * 100).toFixed(1)}%; "></div>
                                    <!-- dolu bant -->
                                    <div style="width:100%;height:100%;background:linear-gradient(90deg,#fff8b720,#27fdf940);"></div>
                                </div>
                                <div style="display:flex;justify-content:space-between;font-size:8px;color:#666;margin-top:2px;">
                                    <span style="color:#fff;">Min</span><span style="color:#00d4ff;">Ort</span><span style="color:#d3ff73;">Med</span><span style="color:#fff;">Max</span>
                                </div>
                            </div>`;
                            // — İlan tablosu —
                            html += `<table style="width:100%;border-collapse:collapse;font-size:8px;table-layout:fixed;">
                                <colgroup><col style="width:auto;"><col style="width:32px;"><col style="width:52px;"><col style="width:72px;"></colgroup>`;
                            displayList.forEach(item => {
                                html += `<tr>
                                    <td style="padding:1px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                        <a href="${item.link}" target="_blank" class="shb-link" style="display:inline-block!important;">${item.title}</a>
                                    </td>
                                    <td style="color:white;text-align:right;">${item.year}</td>
                                    <td style="color:white;text-align:right;">${item.km}</td>
                                    <td style="color:${item.color};text-align:right;font-weight:bold;">${item.price.toLocaleString('tr-TR')}</td>
                                </tr>`;
                            });
                            html += `</table></div>`;
                            resBox.innerHTML = html;
                        } catch (err) { console.warn('[fetchPricesFromShb] Parse hatası:', err); if (resBox) { resBox.innerHTML = '❌ Fiyat verisi işlenemedi.'; } }
                    },
                    onerror(err) { console.warn('[fetchPricesFromShb] İstek hatası:', err); if (resBox) { resBox.innerHTML = '❌ Sahibinden.com\'a bağlanılamadı.'; } }
                });
            }
            document.getElementById('autoSelectBtn').addEventListener('click', (e) => {
                const getEl = (idOrName) => document.getElementById(idOrName) ?? document.querySelector(`[name="${idOrName}"]`);
                const setVal = (idOrName, val) => {
                    const el = getEl(idOrName); if (!el) { console.warn('setVal: bulunamadı ->', idOrName); return; }
                    el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
                };
                const setValSelect = (name, val) => {
                    const el = [...document.querySelectorAll(`[name="${name}"]`)].find(el => el.tagName === 'SELECT');
                    if (!el) { console.warn('setValSelect: bulunamadı ->', name); return; }
                    el.value = val; el.dispatchEvent(new Event('change', { bubbles: true }));
                };
                const clickCb = (idOrName) => {
                    const el = document.getElementById(idOrName) ?? document.querySelector(`[name="${idOrName}"]`);
                    if (!el) { console.warn('clickCb: bulunamadı ->', idOrName); return; }
                    el.checked = false; el.click(); el.dispatchEvent(new Event('change', { bubbles: true }));
                };
                const setSelectText = (idOrName, txt) => {
                    const el = getEl(idOrName);
                    if (!el) { console.warn('setSelectText: bulunamadı ->', idOrName); return; }
                    const opt = [...el.options].find(o => o.text.trim().includes(txt));
                    if (!opt) { console.warn('setSelectText: option bulunamadı ->', txt); return; }
                    el.value = opt.value; el.dispatchEvent(new Event('change', { bubbles: true }));
                };
                const sigortaSekli = document.getElementById('SIGORTA_SEKLI')?.value;
                ['SURUCU_BELGE_TIPI1', 'RUHSAT_ASLI1', 'RUCU0', 'HAS_DEVIR_SATIS0', 'HAS_EKSIK_ASKIN_SIGORTA0', 'ALACAKLI_DOGUM_TARIHI_BILGISI0', 'TASINAN_YUK0', 'MUAFIYET0',
                    'EKSPERTIZ_YERI_SEHIR_DISI0', 'HASAR_YERI0', 'ONARIM_ONAYI2', 'SURUCU_BELGESI_GORULDU1', 'EHLIYET_YETERLI1', 'ALKOL_DURUMU2', 'SIGORTALI_SAHIS_CHECK', 'SURUCU_BELGESI0'].forEach(clickCb);
                if (sigortaSekli === "2") { //kasko
                    clickCb('SAG1'); clickCb('TESPIT_SEKLI1');
                    setVal('ONARIM_SURESI', loc("hepiyi") ? '15' : '10');
                    setValSelect('KUSURLU', '-1');
                    setVal('KUSUR_ORANI', '-1');
                } else { //trafik
                    clickCb('SAG2'); clickCb('TESPIT_SEKLI0');
                    setVal('SAG_NEDEN', 'Olay yeri fotoğrafları mevcuttur.');
                    setVal('ONARIM_SURESI', '10');
                    setValSelect('KUSURLU', '0');
                    setVal('KUSUR_ORANI', '100');
                    setVal('HAS_PIYASA', '400000');
                }
                setVal('HAS_ARAC_SAHIBI', getValue('SB_SIGORTALI_ADI_C'));
                setVal('SB_ARACI_KULLANAN', ""); setVal('SURUCU_KIMLIK_TIPI_DEGER', ""); setVal('SURUCU_KIMLIK_TIPI', '-1'); //temizlik
                setVal('MILLI_R_NO', getValue('IHBAR_TARIHI_YIL'));
                setVal('EKSPERTIZ_SURESI', '1');
                setVal('UZAKTAN_EKSPERTIZ', '2');
                setVal('EHLIYET_SINIFI', 'B'); setValSelect('EHLIYET_SINIFI', 'B');
                setValSelect('HASAR_ILCESI', '-1');
                const gun = getValue('IHBAR_TARIHI_GUN'), ay = getValue('IHBAR_TARIHI_AY'), yil = getValue('IHBAR_TARIHI_YIL');
                setVal('EKSPERTIZ_TARIHLERI', `${gun}/${ay}/${yil}`);
                ['EKSPERTIZ_TALEP_TARIHI', 'EKSPERTIZ_TARIHI', 'EKSPERTIZ_KESINLESTIRME_TARIHI'].forEach(prefix => { setVal(`${prefix}_GUN`, gun); setVal(`${prefix}_AY`, ay); setVal(`${prefix}_YIL`, yil); });
                setSelectText('KANAAT', 'OLUMLUDUR');
                setVal('DOSYA_SONUCLANDIRMA_DURUMU', '3');
                if (loc("ankara")) { setVal('COKLU_EKSPER', '125'); setVal('ZABIT_TIPI_TRAMER', 'Anlaşmalı Tutanak'); setVal('TAHMINI_HASAR', '20000'); setVal('EHLIYET_SINIFI', 'B'); }
                else { setVal('TAHMINI_HASAR', ''); }
            });
            /* ===== 5. KONTROL VE HIGHLIGHT ===== */
            function highlightFields() {
                const getEl = (id) => {
                    const byId = document.getElementById(id); if (byId && byId.type === 'hidden') { const byName = document.getElementsByName(id); for (let el of byName) { if (el.type !== 'hidden') return el; } } return byId || document.getElementsByName(id)[0];
                };
                const getValue = (id) => getEl(id)?.value || '';
                const parseNum = (id) => parseFloat(getValue(id).trim().replace(/,/g, '')) || 0;
                const setBg = (id, condition) => { const td = getEl(id)?.closest('td'); if (td) td.style.backgroundColor = condition ? WARNING_COLOR : ''; };
                const setBgTd = (anchorId, condition) => { const td = getEl(anchorId)?.closest('td'); if (td) td.style.backgroundColor = condition ? WARNING_COLOR : ''; };
                const setBgGroup = (anchorId, condition) => { const td = getEl(anchorId)?.closest('td'); if (td) td.style.backgroundColor = condition ? WARNING_COLOR : ''; };
                const getElByName = (name) => { const all = document.getElementsByName(name); for (let el of all) { if (el.type !== 'hidden') return el; } return all[0]; };
                if (magdurpanel) {
                    const watchFields = ['SURUCU_ADI', 'MAGDUR_AD', 'MAGDUR_SOYAD', 'PLAKA1', 'PLAKA2', 'PLAKA3', 'SASI_NO', 'MOTOR_NO', 'MERNIS_NO_C', 'SURUCU_EHLIYET_NO', 'SURUCU_EHLIYET_SINIFI', 'EHLIYET_TARIHI_GUN', 'EHLIYET_TARIHI_AY', 'EHLIYET_TARIHI_YIL',];
                    const selectFields = ['MODEL_YILI', 'MARKA_ID', 'ARAC_TIPI', 'MAGDUR_KIMLIK_TIPI', 'SB_ARAC_KULLANIM_TURU', 'RENK'];
                    setBg('MODEL_ADI', getValue('MODEL_ADI').replace(/[()\s]/g, '') === '');
                    setBg('KM', parseNum('KM') < 1);
                    setBg('PIYASA', parseNum('PIYASA') < 1000);
                    watchFields.forEach(id => setBg(id, getValue(id).trim() === ''));
                    selectFields.forEach(id => setBg(id, getValue(id) === '-1'));
                } else {
                    const watchFields = ['EKSPERTIZ_TARIHI_YIL', 'EKSPERTIZ_TALEP_TARIHI_YIL', 'HAS_ARAC_SAHIBI', 'HAS_TRAFIK_TARIHI_YIL', 'TRAMER_IHBAR_NO', 'SERVIS_ADI', 'SURUCU_YIL', 'EHLIYET_NO', 'EHLIYET_TARIHI_YIL', 'MILLI_R_NO', 'EKSPERTIZ_SURESI', 'EHLIYET_SINIFI', 'ONARIM_SURESI', 'MERNIS_NO', 'KAZA_YERI', 'SB_ARACI_KULLANAN', 'SURUCU_KIMLIK_TIPI_DEGER', 'EKSPERTIZ_TARIHLERI', 'EKSPERTIZ_KESINLESTIRME_TARIHI_GUN', 'EKSPERTIZ_KESINLESTIRME_TARIHI_AY', 'EKSPERTIZ_KESINLESTIRME_TARIHI_YIL', 'KAZA_TARAF1', 'KAZA_TARAF2'];
                    const selectFields = ['SB_ARAC_KULLANIM_TURU', 'HASAR_ILCESI', 'KANAAT', 'EHLIYET_YERI', 'EHLIYET_YERI_ILCE', 'KAZA_SEKLI', 'DOLU_HASARI', 'FAR_AYNA_HASARI', 'HAS_MODEL_YILI', 'HASAR_SEKLI', 'KAZA_IHBAR_TURU', 'SURUCU_KIMLIK_TIPI', 'HAS_MARKA_ID', 'KUSUR_ORANI', 'KUSURLU', 'BOLGE', 'HAS_RENK'];
                    const tdGroups = [
                        { anchor: 'SB_SIGORTALI_ADI_C', fields: ['SB_SIGORTALI_ADI_C', 'SB_SIGORTALI_ADI'], selects: ['SIRKETMI'] },
                        { anchor: 'SURUCU_KIMLIK_TIPI_DEGER', fields: ['SURUCU_KIMLIK_TIPI_DEGER'], selects: ['SURUCU_KIMLIK_TIPI'] },
                    ];
                    tdGroups.forEach(({ anchor, fields, selects }) => { const fieldBosMu = fields.some(id => getValue(id).trim() === ''), selectBosMu = selects.some(id => ['', '-1'].includes(getValue(id))); setBgGroup(anchor, fieldBosMu || selectBosMu); });
                    setBg('UZAKTAN_EKSPERTIZ', getValue('UZAKTAN_EKSPERTIZ') === '0');
                    setBg('HAS_MODEL_ADI', getValue('HAS_MODEL_ADI').replace(/[()\s]/g, '') === '');
                    setBg('TAHMINI_HASAR', parseNum('TAHMINI_HASAR') < 1000);
                    setBg('HAS_KM', parseNum('HAS_KM') < 1);
                    setBg('HAS_PIYASA', parseNum('HAS_PIYASA') < 1000);
                    setBg('DOSYA_SONUCLANDIRMA_DURUMU', getValue('DOSYA_SONUCLANDIRMA_DURUMU') === '0');
                    const kazaZamaniSifirMi = getValue('KAZA_SAAT') === '0' && getValue('KAZA_DAKIKA') === '0';
                    setBg('KAZA_SAAT', kazaZamaniSifirMi);
                    watchFields.forEach(id => setBg(id, getValue(id).trim() === ''));
                    if (loc("hepiyi")) { ; }
                    selectFields.forEach(id => setBg(id, getValue(id) === '-1'));
                    const chk1 = document.getElementById('KAZA_TARAF1'), chk2 = document.getElementById('KAZA_TARAF2');
                    if (chk1 && chk2) {
                        const kazaDurumuBosMu = !chk1.checked && !chk2.checked, parentTd = chk1.closest('td');
                        if (parentTd) { if (kazaDurumuBosMu) { parentTd.style.backgroundColor = WARNING_COLOR; } else { parentTd.style.backgroundColor = ''; } }
                    }
                    const zabitSelect = document.querySelector('select[name="ZABIT_TIPI"]');
                    if (zabitSelect) {
                        const currentVal = String(zabitSelect.value).trim(), zabitBosMu = (currentVal === '0' || currentVal === ''), zabitTd = zabitSelect.closest('td');
                        if (zabitTd) { zabitTd.style.backgroundColor = zabitBosMu ? WARNING_COLOR : ''; }
                    }
                }
                // ── BUTON ONAY SERVİS ──────────────────────────────
                const inp = document.querySelector('input[name="SERVIS_ADI"]'), ara = document.querySelector('img[alt="SERVİS ARA"]');
                if (!inp || !ara) { return; }
                function getPageId() { const params = new URLSearchParams(window.location.search); return params.get('id') || 'unknown'; }
                let onayBtn = document.getElementById('tm-onay-btn');
                if (!onayBtn) {
                    onayBtn = document.createElement('button'); onayBtn.id = 'tm-onay-btn'; onayBtn.type = 'button';
                    onayBtn.style = 'margin-left:10px; padding:5px 10px; font-weight:bold; color:#fff; border:none; border-radius:3px; cursor:pointer;';
                    inp.closest('td').appendChild(onayBtn);
                    onayBtn.addEventListener('click', function () {
                        const durum = getServisDurumu();
                        if (durum === 'eksik') { if (typeof ara.onclick === 'function') ara.onclick(); else ara.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
                        const val = inp.value.trim();
                        if (!val) { return; }
                        localStorage.setItem('onayli_servis_' + getPageId(), val);
                        checkOnayDurumu();
                    });
                }
                function getServisDurumu() {
                    const servisVal = inp.value.trim();
                    if (!servisVal) return 'eksik';
                    const tur1 = document.querySelector('input[name="SERVIS_TUR_ID1"]'), tur0 = document.querySelector('input[name="SERVIS_TUR_ID0"]'), turSecildi = (tur1 && tur1.checked) || (tur0 && tur0.checked);
                    const anl1 = document.getElementById('ANLASMALI1'), anl0 = document.getElementById('ANLASMALI0'), anlSecildi = (anl1 && anl1.checked) || (anl0 && anl0.checked);
                    const vergiEl = document.querySelector('input[name="VERGI_NO"]'), vergiDolu = vergiEl && vergiEl.value.trim() !== '';
                    const adresEl = document.querySelector('input[name="EKSPERTIZ_ADRESI"]'), adresDolu = adresEl && adresEl.value.trim() !== '';
                    if (!turSecildi || !anlSecildi || !vergiDolu || !adresDolu) return 'eksik';
                    return 'tamam';
                }
                function checkOnayDurumu() {
                    const durum = getServisDurumu();
                    const val = inp.value.trim();
                    const onayliDeger = localStorage.getItem('onayli_servis_' + getPageId());
                    const onayliMi = durum === 'tamam' && val !== '' && val === onayliDeger;
                    if (durum === 'eksik') { onayBtn.disabled = false; onayBtn.innerText = 'Tekrar Seç'; onayBtn.style.background = '#e67e22'; onayBtn.style.cursor = 'pointer'; }
                    else if (onayliMi) { onayBtn.disabled = true; onayBtn.innerText = 'Onaylandı ✓'; onayBtn.style.background = '#888'; onayBtn.style.cursor = 'not-allowed'; }
                    else { onayBtn.disabled = false; onayBtn.innerText = 'Onayla'; onayBtn.style.background = '#4CAF50'; onayBtn.style.cursor = 'pointer'; }
                }
                inp.addEventListener('change', checkOnayDurumu); inp.addEventListener('input', checkOnayDurumu); checkOnayDurumu();
            }
            if (ANALIZPANEL_hlt) { setInterval(highlightFields, 500); setInterval(updatePanel, 1000); }
        }
        const $s = id => document.getElementById(id) || document.getElementsByName(id)[0],
            trg = (el, v, c = 0) => {
                if (!el) { return; }
                c ? el.checked = v : el.value = v;
                ['input', 'change'].map(e => el.dispatchEvent(new Event(e, { bubbles: 1 })));
                const a = el.getAttribute(c ? 'onclick' : 'onchange');
                if (a) try { new unsafeWindow.Function(a)() } catch (e) { ; }
                if (window.jQuery) unsafeWindow.jQuery(el).trigger('change');
            };
        const f = () => {
            const s = $s('SIRKETMI'), k = $s('KAZA_YERI');
            s?.addEventListener('change', () => { const o = s.value == 1; trg($s('SIGORTALI_SAHIS_CHECK'), o, 1); trg($s('POLICE_SAHIBI_KIMLIK_TIPI'), o ? 1 : 2); });
            k?.addEventListener('focus', () => {
                const i = $s('HASAR_ILI'), c = $s('HASAR_ILCESI'), t = `${i.options[i.selectedIndex].text} / ${c.options[c.selectedIndex].text}`.replace(/ \/ (--Tümü--|Seçiniz)/g, '');
                if (!t.includes("Seçiniz")) { k.value = t; k.dispatchEvent(new Event('change')) }
            });
        };
        document.readyState == 'complete' ? f() : window.addEventListener('load', f);
    }
    // Hızlı Donanım girişi
if (KS_SYSTEM && DONANIM && loc("otohasar") && /eks_(magdur_arac_donanim|arac_donanim)/.test(location.href)) {
        function initPanel() {
            if (document.getElementById('donanim-panel') || !document.body.innerText.toLowerCase().includes("donanim")) return;
            /* ===== 1. PANEL OLUŞTURMA ===== */
            const styleSheet = document.createElement("style");
            styleSheet.innerText = `
              @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
              #donanim-panel button:active { transform: translateY(1px) scale(0.96); filter: brightness(1.2); }
            `;
            document.head.appendChild(styleSheet);
            // 2. Ana Panel Oluşturma
const panel = document.createElement('div');
panel.id = 'donanim-panel';
panel.style.cssText = `position: fixed; top: 0; right: 0; z-index: ${Number(config.zIndex) + 1}; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; padding: 1px; border-bottom-left-radius: 4px; animation: slideRight 0.2s ease-out; width: 200px;`;
           // 3. Butonlar için ortak stil
            const btnStyle = document.createElement("style");
            btnStyle.innerText = `
				.panel-btn { background: #151515; color: #eee; border: none; padding: 3px 6px; font-size: 9px; font-weight: 600; cursor: pointer; border-radius: 1px; transition: background 0.1s; }
            	.panel-btn:hover { background: #222; } `;
            document.head.appendChild(btnStyle);
            document.body.appendChild(panel);
            /* ===== 2. MASTER DONANIM LİSTESİ (İSİM BAZLI) ===== */
            const donanimSozlugu = { "ALARM": 1, "İMMOBİLİZER": 2, "KLİMA": 3, "RADYO-TEYP": 4, "TELEFON": 5, "RADYO-CD": 23, "CD ÇALAR": 6, "ABS": 7, "AIRBAG": 8, "SUNROOF": 9, "DERI DOSEME": 10, "VİTES": 22, "YAKIT TİPİ": 24, "LPG": 11, "ENGELLİLER": 12 };
            /* ===== 3. DATA HAZIRLIĞI VE EŞLEŞTİRME ===== */
            const getPageCheckboxes = () => {
                const rows = Array.from(document.querySelectorAll('tr'));
                let results = [];
                rows.forEach(row => {
                    if (row.cells.length < 2) { return; } const labelCell = row.cells[0] ? row.cells[0].innerText.trim().toUpperCase() : "";
                    if (!labelCell) { return; } if (labelCell === "DİĞER") { return; } if (labelCell.length > 50) { return; }
                    let masterId = null;
                    for (let key in donanimSozlugu) { if (labelCell.includes(key)) { masterId = donanimSozlugu[key]; break; } }
                    if (masterId) {
                        const inputs = row.querySelectorAll('input[type="checkbox"]');
                        inputs.forEach(input => {
                            const match = input.getAttribute('onclick')?.match(/donanim\('(\d+)',(\d+)\)/);
                            if (match) { results.push({ masterId: masterId, originalId: match[1], val: parseInt(match[2]), cb: input }); }
                        });
                    }
                });
                return results;
            };
            /* ===== 4. YARDIMCI FONKSİYONLAR ===== */
            const applyRules = (ruleFn) => {
                const currentCheckboxes = getPageCheckboxes();
                currentCheckboxes.forEach(item => { const targetVal = ruleFn(item.masterId); if (targetVal !== null) { const shouldBeChecked = (item.val === targetVal); if (item.cb.checked !== shouldBeChecked) { item.cb.click(); } } });
            };

            // Yakıt Tipi satırında herhangi bir seçeneğin işaretli olup olmadığını kontrol eder
            const isYakitSecili = (ruleFn) => {
                const currentCheckboxes = getPageCheckboxes();
                // Yakıt Tipi masterId'si 24'tür.
                const yakitItems = currentCheckboxes.filter(item => item.masterId === 24);

                // 1. Durum: Sayfada hali hazırda işaretlenmiş bir yakıt seçeneği var mı?
                const sayfadaSecili = yakitItems.some(item => item.cb.checked);
                if (sayfadaSecili) return true;

                // 2. Durum: Bu buton tetiklendiğinde yakıt tipi kurallara göre seçilecek mi? (TargetVal null değilse seçilecektir)
                const kuraldaSecili = ruleFn(24);
                if (kuraldaSecili !== null) return true;

                return false;
            };

            // Input'u bulurken 'name' özelliğini de kontrol edelim (ID yoksa hata vermemesi için)
            const setAciklama = (text) => { const el = document.getElementsByName('ACIKLAMA21')[0] || document.getElementById('ACIKLAMA21'); if (el) el.value = text; };

            const createBtn = (text, aciklamaMetni, ruleFn, bgColor = '#00aa88') => {
                const btn = document.createElement('button'); btn.innerText = text;
                Object.assign(btn.style, { background: bgColor, border: '0', borderRadius: '2px', color: "white", cursor: 'pointer', fontWeight: "bold", padding: '3px 6px', margin: '2px', height: '20px', width: '100px'});
                btn.onclick = () => {
                    const nihaiAciklama = isYakitSecili(ruleFn) ? "" : aciklamaMetni;
                    setAciklama(nihaiAciklama);
                    applyRules(ruleFn);
                };
                panel.appendChild(btn);
            };
            /* ===== 5. BUTON TANIMLARI (KURALLAR) ===== */
            // 2000~ Benzin
            createBtn('2000~ Benzin', 'BENZİNLİ', (id) => {
                const izinli = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 22, 23, 24];
                if (!izinli.includes(id)) return null; if (id <= 10) return id === 4 ? 1 : 0; if ([11, 12, 22, 6].includes(id)) return id === 11 ? 1 : 0; if (id === 23) return 0; if (id === 6) return 0; if (id === 24) return 0;
                return null;
            }, '#E07B00');
            // 2000~ Dizel
            createBtn('2000~ Dizel', 'DİZEL', (id) => {
                const izinli = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 22, 23, 24];
                if (!izinli.includes(id)) return null; if (id <= 10) return id === 4 ? 1 : 0; if ([11, 12, 22, 6].includes(id)) return 0; if (id === 23) return 1; if (id === 6) return 0; if (id === 24) return 1;
                return null;
            }, '#E07B00');
            // 2010+ Benzin
            createBtn('2010+ Benzin', 'BENZİNLİ', (id) => {
                const izinli = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 22, 23, 24];
                if (!izinli.includes(id)) return null; if ([1, 5, 9, 10, 11, 12, 22, 24, 6].includes(id)) return 0; if (id === 23) return 0; if ([2, 3, 4, 7, 8].includes(id)) return 1;
                return null;
            });
            // 2010+ Dizel
            createBtn('2010+ Dizel', 'DİZEL', (id) => {
                const izinli = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 22, 23, 24];
                if (!izinli.includes(id)) return null; if ([1, 5, 9, 10, 11, 12, 22, 6].includes(id)) return 0; if (id === 23) return 1; if ([2, 3, 4, 7, 8, 24].includes(id)) return 1;
                return null;
            });
        }
        if (document.readyState === 'complete') { initPanel(); } else { unsafeWindow.addEventListener('load', initPanel); } setTimeout(initPanel, 1500);
    }
    // Hızlı Referans açma Otohasar
    if (KS_SYSTEM && REFERANS && loc("otohasar") && loc("eks_hasar_yp_list_yp_talep.php")) {
        config.width = '150px';
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        if (!panel) return;
        panel.style.setProperty('width', config.width); panel.style.setProperty('min-width', config.width);
        if (panel) { const hTitle = panel.querySelector('.ks-header h4'); if (hTitle) hTitle.innerText = "Excell Panel"; }
        const contentArea = document.querySelector('.ks-content');
        if (contentArea) {
            contentArea.innerHTML = `<div style="text-align:center;padding-bottom:5px;font-size:11px;">Excel İşlemleri</div>`;
            Object.assign(contentArea.style, { display: "flex", flexDirection: "column", gap: "4px", padding: "5px" });
            const btnStyle = "width:100%; padding:4px 2px; font-size:11px; min-height:24px;";
            const btnPaste = document.createElement('button');
            btnPaste.className = 'ks-btn';
            btnPaste.style.cssText = btnStyle;
            btnPaste.innerText = "📋 YAPIŞTIR";
            btnPaste.onclick = async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
                    let fields = [];
                    for (let j = 1; j <= 20; j++) { let f = document.all(`YP_AD_${j}`) || document.all(`YP_AD_DIGER_${j}`); if (f) fields.push(f); }
                    if (lines.length !== fields.length && lines.length > 0) { if (!confirm(`Sayı Uyuşmazlığı!\nExcel: ${lines.length}\nKutu: ${fields.length}\nDevam?`)) return; }
                    lines.forEach((line, i) => { if (i < fields.length) { fields[i].value = line; fields[i].dispatchEvent(new Event('input', { bubbles: true })); } });
                    btnPaste.innerText = "✔️ OK"; setTimeout(() => { btnPaste.innerText = "📋 YAPIŞTIR"; }, 2000);
                } catch (err) { console.error(err); }
            };
            const btnCopy = document.createElement('button');
            btnCopy.className = 'ks-btn';
            btnCopy.style.cssText = btnStyle;
            btnCopy.innerText = "📤 KOPYALA";
            btnCopy.onclick = async () => {
                try {
                    const rows = Array.from(document.querySelectorAll('tr')).filter(tr => tr.querySelector('td')?.classList.contains('acik') && tr.querySelectorAll('td').length >= 6);
                    let data = rows.map(tr => Array.from(tr.querySelectorAll('td.acik')).slice(0, 6).map(td => td.innerText.trim()).join('\t')).join('\n');
                    if (data) { await navigator.clipboard.writeText(data); btnCopy.innerText = "✔️ OK"; setTimeout(() => { btnCopy.innerText = "📤 KOPYALA"; }, 2000); }
                } catch (err) { console.error(err); }
            };
            const btnFill = document.createElement('button');
            btnFill.className = 'ks-btn';
            btnFill.style.cssText = btnStyle;
            btnFill.innerText = "🚗 GRUPLA";
            btnFill.onclick = async () => {
                try {
                    const selects = document.querySelectorAll('select[name^="YP_GRUP_ID_"]');
                    for (let s of selects) {
                        const idx = s.name.split('_').pop();
                        s.value = "2";
                        s.dispatchEvent(new Event('change', { bubbles: true }));
                        await new Promise(r => setTimeout(r, 50));
                        const alt = document.querySelector(`select[name="YP_ID_${idx}"]`);
                        if (alt) { alt.value = "0"; alt.dispatchEvent(new Event('change', { bubbles: true })); }
                        /// TEDARİKÇİ_ID_{idx} kutusunda ilk gerçek seçeneği seç (Seçiniz hariç)
                        const tedarikci = document.querySelector(`select[name="TEDARIKCI_ID_${idx}"]`);
                        if (tedarikci) { const ilkGercek = Array.from(tedarikci.options).find(o => o.value !== "-1"); if (ilkGercek) { tedarikci.value = ilkGercek.value; tedarikci.dispatchEvent(new Event('change', { bubbles: true })); } }
                    }
                    btnFill.innerText = "✔️ BİTTİ";
                    setTimeout(() => { btnFill.innerText = "🚗 GRUPLA"; }, 2000);
                } catch (err) { console.error(err); }
            };
            contentArea.append(btnPaste, btnCopy, btnFill);
        }
    }
    if (KS_SYSTEM && REFERANS && loc("otohasar") && loc("talep_yp_giris.php")) {
        config.width = '150px';
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        if (!panel) return;
        panel.style.setProperty('width', config.width, 'important'); panel.style.setProperty('min-width', config.width, 'important'); panel.style.setProperty('display', 'block', 'important');
        const hTitle = panel.querySelector('.ks-header h4');
        if (hTitle) hTitle.innerText = "Excell Panel";
        panel.querySelector('.ks-toggle')?.style.setProperty('display', 'block', 'important');
        const contentArea = panel.querySelector('.ks-content');
        if (contentArea) {
            contentArea.innerHTML = `<div style="text-align:center;padding-bottom:5px;font-size:11px;width:100%;">Veri Girişi</div>`;
            Object.assign(contentArea.style, { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "8px", width: "100%", boxSizing: "border-box" });
            const btnPaste = document.createElement('button');
            btnPaste.className = 'ks-btn';
            btnPaste.style.cssText = "width:100%; padding:4px 2px; font-size:11px; min-height:24px;";
            btnPaste.innerText = "📋 YAPIŞTIR";
            btnPaste.onclick = async () => {
                try {
                    const text = await navigator.clipboard.readText(), rows = text.split(/\r?\n/).filter(line => line.trim() !== "");
                    let av = [];
                    for (let j = 0; j < 50; j++) {
                        const k = document.querySelector(`input[name="kod[${j}]"]`), a = document.querySelector(`input[name="ad[${j}]"]`), f = document.querySelector(`input[name="fiyat[${j}]"]`);
                        if (k || a) { av.push({ k, a, f }); }
                    }
                    rows.forEach((row, i) => {
                        if (i < av.length) {
                            const cols = row.split('\t');
                            if (av[i].k) { av[i].k.value = cols[0]?.trim() || ""; av[i].k.dispatchEvent(new Event('input', { bubbles: true })); }
                            if (av[i].a) { av[i].a.value = cols[1]?.trim() || ""; av[i].a.dispatchEvent(new Event('input', { bubbles: true })); }
                            if (av[i].f) { av[i].f.value = (cols[2] && cols[2].trim() !== "") ? cols[2].trim() : "1"; av[i].f.dispatchEvent(new Event('input', { bubbles: true })); }
                        }
                    });
                    btnPaste.innerText = "✔️ OK"; setTimeout(() => { btnPaste.innerText = "📋 YAPIŞTIR"; }, 2000);
                } catch (err) { console.error(err); }
            };
            contentArea.appendChild(btnPaste);
        }
    }
    if (KS_SYSTEM && REFERANS && loc("otohasar") && loc("talep_yp_ayrinti.php")) {
        config.width = '150px';
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        if (!panel) return;
        panel.style.setProperty('width', config.width);
        panel.style.setProperty('min-width', config.width);
        if (panel) { panel.querySelector('.ks-header h4').innerText = "Excell Panel"; }
        const contentArea = document.querySelector('.ks-content');
        if (contentArea) {
            contentArea.innerHTML = `<div style="text-align:center;padding-bottom:5px;font-size:11px;">Liste Kopyala</div>`;
            Object.assign(contentArea.style, { display: "flex", flexDirection: "column", gap: "4px", padding: "5px" });
            const btnCopy = document.createElement('button');
            btnCopy.className = 'ks-btn';
            btnCopy.style.cssText = "width:100%; padding:4px 2px; font-size:11px; min-height:24px;";
            btnCopy.innerText = "📂 KOPYALA";
            btnCopy.onclick = async () => {
                const unique = new Set();
                document.querySelectorAll('tr').forEach(row => {
                    const cells = row.querySelectorAll('td.acik, td.koyu');
                    if (cells.length >= 4) {
                        const kod = cells[1].innerText.trim(), ad = cells[2].innerText.trim(), fiy = cells[3].innerText.trim();
                        if (/^[a-zA-Z0-9-]+$/.test(kod) && !kod.includes('E+') && kod !== "Parça Kodu") unique.add(`${kod}\t${ad}\t${fiy}`);
                    }
                });
                if (unique.size > 0) { await navigator.clipboard.writeText(Array.from(unique).join('\n')); btnCopy.innerText = "✔️ OK"; setTimeout(() => { btnCopy.innerText = "📂 KOPYALA"; }, 2000); }
            };
            contentArea.appendChild(btnCopy);
        }
    }
    // Hızlı Manuel Parça girişi
    if (KS_SYSTEM && MANUEL && loc("otohasar") && loc("eks_hasar_yedpar_yeni_ref.php")) {
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
			/*body {
			    transition: margin-right var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
			    margin-right: 260px !important;
			}
			body.panel-closed {
			    margin-right: 0 !important;
			}*/
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
                right: calc(var(--toggle-loc) + 15px);
                top: 20px;
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
            const panel = document.createElement("div"); panel.id = "tm-panel"; if (isClosed) panel.classList.add("closed");
            panel.innerHTML = `
			<div class="ks-tooltip-container">
            	<button id="bYeni" class="btn-new btn-full">YENİ KAYIT</button>
            	<div class="ks-tooltip-box">
            	    <strong>Kayıt</strong><br>
            	    Yeni manuel parça girişi için tıklanması zorunludur.
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
                <div class="ks-tooltip-box"><strong>Bilgilendirme</strong><br>Onarım bölümü geçici olarak kapalıdır.</div>
            </div>
			<div class="ks-tooltip-container">
            	<div class="radio-container">
                    <label> <input type="radio" name="kod_secim" value="kodsuz" checked> KODSUZ  </label>
                    <label> <input type="radio" name="kod_secim" value="esdeger"> EŞDEĞER </label>
                    <label> <input type="radio" name="kod_secim" value="bos"> BOŞ </label>
                </div>
                <div class="ks-tooltip-box"><strong>Parça Türü</strong><br>Seçim türüne göre otomatik doldurur.</div>
            </div>
			<div class="ks-tooltip-container">
                <div class="radio-container red-alrt-bg">
                    <label class="white-text"> <input type="radio" name="kayit_secim" value="kayit" checked> OTOM. KAYDET </label>
                    <label class="white-text"> <input type="radio" name="kayit_secim" value="nonkayit"> KAYDETME </label>
                </div>
                <div class="ks-tooltip-box"><strong>Otomatik Kayıt</strong><br>Parçayı kaydetmeye çalışır, <b>10</b> defa dener. Sorunsuz kayıt işlerken "<b>UYARI Bu Kodlu Parça Bu Dosyaya Zaten Eklenmiş..</b>" şeklinde uyarı alacaksınız <b>Enter</b>'tuşuna basarak devam edin.</div>
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
            const toggleBtn = document.createElement("div"); toggleBtn.id = "tm-toggle"; toggleBtn.innerHTML = isClosed ? "◀" : "▶"; document.body.appendChild(panel); document.body.appendChild(toggleBtn);
            // ── BURAYA TAŞI ──
            const PANEL_W = 260;
            const applyMargin = () => {
                const isClosed = panel.classList.contains('closed');
                const margin = isClosed ? 0 : PANEL_W;
                const targets = [document.body, document.getElementById('content'), document.getElementById('main'), document.getElementById('wrapper'),
                document.querySelector('.container'), document.querySelector('form'), document.querySelector('table:first-of-type'),].filter(Boolean);
                targets.forEach(el => {
                    const computed = window.getComputedStyle(el);
                    if (['fixed', 'absolute'].includes(computed.position)) return;
                    el.style.transition = `margin 0.4s cubic-bezier(0.4,0,0.2,1)`;
                    if (isClosed) { el.style.marginRight = 'auto'; el.style.marginLeft = 'auto'; } else { el.style.marginRight = `${margin}px`; el.style.marginLeft = `${margin / 6}px`; }
                });
            };
            document.querySelectorAll('*').forEach(el => { if (el.offsetWidth > 600 && el.offsetWidth < window.innerWidth) console.log(el.tagName, el.id, el.className, el.offsetWidth); });
            applyMargin();
            /* ===== 3. PANEL LOGIC (Kapatma/Açma) ===== */
            toggleBtn.onclick = () => {
                const closed = panel.classList.toggle("closed"); document.body.classList.toggle("panel-closed", closed); toggleBtn.innerHTML = closed ? "◀" : "▶"; localStorage.setItem('tm_panel_closed', closed); applyMargin();
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
                    const el = selectorFn(); if (el) { clearInterval(interval); resolve(el); }
                    else if (Date.now() - startTime > timeout) { clearInterval(interval); reject(new Error("Zaman aşımı: Eleman bulunamadı.")); }
                }, 100);
            });
            const selectValue = async (id, val) => {
                try {
                    const s = await waitFor(() => $(id));
                    await waitFor(() => s.options && Array.from(s.options).some(o => o.value == val), 2000); s.value = val;
                    const eventConfig = { bubbles: true, cancelable: true };
                    s.dispatchEvent(new Event("change", eventConfig)); s.dispatchEvent(new Event("input", eventConfig));
                } catch (err) { console.error(`❌ seçim hatası (${id}):`, err.message); }
            };
            const degisonar = () => {
                const selectedRadio = document.querySelector('input[name="islemTipi"]:checked'); if (!selectedRadio) { return; }
                const tip = selectedRadio.value, checkboxDegisim = document.getElementById("DEGISIM"), checkboxTamir = document.getElementById("TAMIR");
                if (tip === "degisim" && checkboxDegisim) { if (!checkboxDegisim.checked) { checkboxDegisim.click(); } if (checkboxTamir && checkboxTamir.checked) { checkboxTamir.checked = false; } }
                else if (tip === "onarim" && checkboxTamir) { if (!checkboxTamir.checked) { checkboxTamir.click(); } if (checkboxDegisim && checkboxDegisim.checked) { checkboxDegisim.checked = false; } }
            };
            const zorunluAlanlar = [{ ref: refs.kod, label: "Parça Kodu" }, { ref: refs.ad, label: "Adı" }, { ref: refs.fiyat, label: "Fiyat" }];
            /* ===== 4. CORE ACTIONS ===== */
            const MainFields = () => {
                degisonar();
                const isMissing = zorunluAlanlar.some(alan => !alan.ref.value?.trim());
                if (isMissing) { return; }
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
                const forceWrite = (el, val) => { if (!el) return; el.value = val;["input", "change", "blur"].forEach(ev => el.dispatchEvent(new Event(ev, { bubbles: true }))); };
                const safeSelect = async (id, val) => {
                    const el = $(id);
                    if (!el) return;
                    const oldAlert = win.alert;
                    const vtb = $("VERITABANINDA");
                    const oldVtb = vtb?.value;
                    try { win.alert = () => { }; if (vtb) vtb.value = "0"; await selectValue(id, val); }
                    finally { setTimeout(() => { win.alert = oldAlert; if (vtb && oldVtb) vtb.value = oldVtb; }, 150); }
                };
                if (radio === "kodsuz") {
                    const sipSec = $("SIP_SEC_2");
                    if (sipSec) { sipSec.checked = true; sipSec.dispatchEvent(new Event("change", { bubbles: true })); }
                    await safeSelect("SISTEM_NOTU_ID", "2"); forceWrite(notlar, "KODSUZ PARÇA");
                    await selectValue("SIPARIS_VERMEME_SEBEP_ID", "2");
                } else if (radio === "esdeger") {
                    await safeSelect("SISTEM_NOTU_ID", "13"); forceWrite(notlar, "");
                    await selectValue("SIPARIS_VERMEME_SEBEP_ID", "-1");
                } else if (radio === "bos") {
                    await safeSelect("SISTEM_NOTU_ID", "-1"); forceWrite(notlar, "");
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
                            if (canSubmit) { const form = document.querySelector('form[name="yedparforhasar"]') || document.forms.yedparforhasar; if (form) { form.submit(); return; } }
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
                    if (savedValue) { const radioToSelect = document.querySelector(`input[name="${groupName}"][value="${savedValue}"]`); if (radioToSelect) { radioToSelect.checked = true; } }
                });
            }
            loadSelections();
            document.addEventListener('change', function (event) {
                if (event.target.type === 'radio' && groups.includes(event.target.name)) { GM_setValue('saved_' + event.target.name, event.target.value); console.log(`[Hafıza] ${event.target.name} güncellendi: ${event.target.value}`); }
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
            $("b_dorse").onclick = async () => { await MainFields(); await SideFields("31", "556"); };
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
            setInterval(() => { const realInput = document.getElementById("PARCA_KODU"); if (realInput && (realInput.value || realInput.disabled)) refs.bYeni.classList.add("blinlink"); else refs.bYeni.classList.remove("blinlink"); }, 1000);
        }
        const init = () => { if (typeof initPanel === 'function') initPanel(); setTimeout(() => { const checkTarget = document.getElementById("SUREKLI"); if (checkTarget && !checkTarget.checked) checkTarget.click(); }, 1000); };
        const focusTarget = () => { const input = document.getElementById('tm_kod'); if (input) { input.focus(); input.select(); return true; } return false; };
        if (document.readyState === "complete") init(); else unsafeWindow.addEventListener('load', init);
        const observer = new MutationObserver(() => { if (focusTarget()) observer.disconnect(); });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        window.addEventListener("load", () => { setTimeout(focusTarget, 200); }, { once: true });
    }
    if (KS_SYSTEM && PSAY && loc("otohasar") && loc("eks_hasar_yedpar_yeni_ref.php")) {
        const patchAdet = () => {
            const sel = document.querySelector('select[name="ADET"], input[name="ADET"]');
            if (!sel || sel.dataset.ksPatch) return;
            sel.dataset.ksPatch = '1';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = '▾';
            btn.style.cssText = `
                margin-left:3px;width:18px;height:18px;border:1px solid #aaa;
                border-radius:3px;background:#2980b9;color:#fff;font-size:11px;
                font-weight:700;cursor:pointer;line-height:1;padding:0;vertical-align:middle;
            `;
            const popup = document.createElement('div');
            popup.style.cssText = `
                display:none;position:absolute;left:0;top:calc(100% + 2px);z-index:999999;
                background:#fff;border:1px solid #aaa;border-radius:6px;
                padding:4px;box-shadow:0 4px 12px rgba(0,0,0,.2);
                flex-wrap:wrap;gap:3px;width:328px;
            `;
            for (let i = 1; i <= 100; i++) {
                const nb = document.createElement('button');
                nb.type = 'button';
                nb.textContent = i;
                nb.style.cssText = `
                    width:30px;height:26px;border:1px solid #ddd;border-radius:3px;
                    background:#f8f8f8;color:#333;font-size:12px;font-weight:600;
                    cursor:pointer;padding:0;
                `;
                nb.onmouseenter = () => { nb.style.background = '#2980b9'; nb.style.color = '#fff'; nb.style.borderColor = '#2980b9'; };
                nb.onmouseleave = () => {
                    const active = parseInt(sel.value) === i;
                    nb.style.background = active ? '#27ae60' : '#f8f8f8';
                    nb.style.color = active ? '#fff' : '#333';
                    nb.style.borderColor = active ? '#27ae60' : '#ddd';
                };
                nb.onmousedown = (e) => {
                    e.preventDefault();
                    if (sel.tagName === 'SELECT') {
                        let opt = sel.querySelector(`option[value="${i}"]`);
                        if (!opt) { opt = document.createElement('option'); opt.value = i; opt.textContent = i; sel.appendChild(opt); }
                        sel.value = i;
                        sel.dispatchEvent(new Event('change', { bubbles: true }));
                        if (window.jQuery) jQuery(sel).trigger('change');
                    } else {
                        sel.value = i;
                        sel.dispatchEvent(new Event('input', { bubbles: true }));
                        sel.dispatchEvent(new Event('change', { bubbles: true }));
                        sel.blur();
                    }
                    popup.querySelectorAll('button').forEach((b, idx) => {
                        const isActive = (idx + 1) === i;
                        b.style.background = isActive ? '#27ae60' : '#f8f8f8';
                        b.style.color = isActive ? '#fff' : '#333';
                        b.style.borderColor = isActive ? '#27ae60' : '#ddd';
                    });
                    popup.style.display = 'none';
                };
                popup.appendChild(nb);
            }
            btn.onclick = (e) => {
                e.stopPropagation();
                const open = popup.style.display === 'none';
                popup.style.display = open ? 'flex' : 'none';
                if (open) {
                    // Mevcut değeri yeşil yap
                    const cur = parseInt(sel.value) || 1;
                    popup.querySelectorAll('button').forEach((b, idx) => {
                        const isActive = (idx + 1) === cur;
                        b.style.background = isActive ? '#27ae60' : '#f8f8f8';
                        b.style.color = isActive ? '#fff' : '#333';
                        b.style.borderColor = isActive ? '#27ae60' : '#ddd';
                    });
                }
            };
            // Dışarı tıklayınca kapat — mousedown ile yakala ki click'ten önce çalışsın
            document.addEventListener('mousedown', (e) => { if (!wrap.contains(e.target)) { popup.style.display = 'none'; } });
            const wrap = document.createElement('span');
            wrap.style.cssText = 'position:relative;display:inline-block;vertical-align:middle;';
            sel.parentNode.insertBefore(wrap, sel.nextSibling);
            wrap.appendChild(btn);
            wrap.appendChild(popup);
        };
        setTimeout(patchAdet, 300); setInterval(patchAdet, 1000);
    }
    // Hızlı Çoklu Parça girişi
    if (KS_SYSTEM && MANUEL && loc("otohasar") && loc("eks_hasar_yedpar_multi.php") && !loc("eks_hasar_yedpar_multi_form.php")) {
        config.width = '180px';
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
            		    <div class="ks-tooltip-box"><strong>Otomatik seçici</strong><br>Grup seçimlerini otomatik şekilde "Kaporta Ön" olarak seçer.</div>
            		</div>
					<div class="ks-tooltip-container">
            		    <div class="tm-button-grid">
    	        	    	<button id="btnSiparisHazirla" class="ks-btn" style="width: 100%;">Tedarik Yok</button>
            		    </div>
            		    <div class="ks-tooltip-box"><strong>Otomatik seçici</strong><br>Listedekileri Tedarik Yok olarak seçer.</div>
            		</div>
					<div class="ks-tooltip-container">
            		    <div class="tm-button-grid">
    	        	    	<button id="btnExcelCopy" class="ks-btn" style="width: 100%;">📋 EXCEL İÇİN KOPYALA</button>
            		    </div>
            		    <div class="ks-tooltip-box"><strong>Toplu kopyala</strong><br>İçeriği toplu şekilde excell için kopyalar.</div>
            		</div>
    	        </div>
    	    `;
            document.getElementById('btnHepsiniYap').addEventListener('click', () => {
                const grupSelectors = document.querySelectorAll(`select[id^="GRUP_ID"]`);
                grupSelectors.forEach(grupSel => {
                    if (grupSel.value === "-1") {
                        const rowId = grupSel.id.replace('GRUP_ID', ''), anaGrupSel = document.getElementById(`ANA_GRUP${rowId}`);
                        grupSel.value = "10"; grupSel.dispatchEvent(new Event('change', { bubbles: true }));
                        if (anaGrupSel) { anaGrupSel.value = "777"; anaGrupSel.dispatchEvent(new Event('change', { bubbles: true })); }
                    }
                });
            });
            document.getElementById('btnSiparisHazirla').addEventListener('click', async () => {
                const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                const radioSiparis = document.getElementById('SIPARIS_SECENEK1');
                if (radioSiparis) { radioSiparis.focus(); radioSiparis.checked = true; radioSiparis.dispatchEvent(new Event('click', { bubbles: true })); radioSiparis.dispatchEvent(new Event('change', { bubbles: true })); await wait(400); }
                const sebepSel = document.getElementById('SIPARIS_VERMEME_SEBEP_ID1');
                if (sebepSel) { sebepSel.value = "9"; sebepSel.dispatchEvent(new Event('change', { bubbles: true })); await wait(200); }
                const notlarArea = document.getElementById('NOTLAR_SIPARIS1');
                if (notlarArea) { notlarArea.value = "TEDARİK YOK"; notlarArea.dispatchEvent(new Event('input', { bubbles: true })); await wait(100); }
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
                const getVal = (el) => { if (!el) return ""; return (el.value !== undefined ? el.value : el.innerText).trim(); };
                const rowData = [getVal(pKodu), getVal(pAdi), getVal(pFiyat), pGrup?.options ? (pGrup.options[pGrup.selectedIndex]?.text || "") : getVal(pGrup)];
                if (rowData[0] || rowData[1]) { excelRows.push(rowData.join('\t')); }
            });
            if (excelRows.length > 0) { const finalString = excelRows.join('\n'); navigator.clipboard.writeText(finalString).then(() => { alert(`✅ ${excelRows.length} parça kopyalandı.`); }).catch(() => { alert('❌ Kopyalama hatası!'); }); }
            else { alert('⚠️ Veri bulunamadı!'); }
        });
    }
    // Hızlı Resim girişi
    if (KS_SYSTEM && RESIM && loc("otohasar") && loc("multi_file_upload/index.php")) {
        // ── AYARLAR ──────────────────────────────────────────────────────────────
        const RESIM_LIMIT = 40;
        const text = document.body.innerText.toUpperCase(), url = location.href.toLowerCase();
        const varsayilan = {
            EHLİYET: ['1', '1', '1'], RUHSAT: ['7', '7', '7'], KTT: ['174', '11'], BEYAN: ['179', '155'],
            ZABIT: ['5', '118'], POLICE: ['3'], IMZA: ['131'], SICIL: ['202'],
            SKAYIT: ['219'], GAZECE: ['202'], FAAL: ['190'], IRSALIYE: ['26'],
            NUFUS: ['2'], DIGER: ['12'], ONARIM_SONRASI: ['32'],
            MUTABAKAT: ['211', '28'], MUVAFAKAT: ['111'], IBRA: ['33'],
            ALKOL: ['4'], RAYIC: ['231', '184'], TRAMER: ['230', '229', '228', '230'],
            VERGI: ['9', '221'], MASAK: ['248'], MESLEK: ['']
        };
        const atlas = {
            EHLİYET: ['1', '195', '196'], RUHSAT: ['7', '92', '38'], KTT: ['174', '11', '96', '22', '188'],
            BEYAN: ['179', '155', '6'], ZABIT: ['5', '118', '22', '169'], POLICE: ['3'], IMZA: ['131', '8'],
            SICIL: ['202'], SKAYIT: ['219'], GAZETE: ['202'], FAAL: ['190'],
            IRSALIYE: ['26', '220', '41'], NUFUS: ['2', '213'], DIGER: ['12'],
            ONARIM_SONRASI: ['32'], MUTABAKAT: ['211', '28'],
            MUVAFAKAT: ['111', '56', '57', '101', '130'], IBRA: ['33', '132', '212'],
            ALKOL: ['4'], RAYIC: ['184'], TRAMER: ['12', '12', '12', '12'],
            VERGI: ['9', '221', '208', '62'], MASAK: ['12'],
            IHRACAT_REFAKAT: ['133'], TASIT_BELGESI: ['177'], MESLEK: ['']
        };
        const mapfre = {
            EHLİYET: ['120','121','120','121'], RUHSAT: ['144','143','144','143'], KTT: ['36', '11'],
            BEYAN: ['6'], ZABIT: ['5', '22'], POLICE: ['3'], IMZA: ['8'],
            SICIL: ['40'], SKAYIT: ['12'], GAZETE: ['40'], FAAL: ['65'],
            IRSALIYE: ['70'], NUFUS: ['2'], DIGER: ['12'], ONARIM_SONRASI: ['18'],
            MUTABAKAT: ['28'], MUVAFAKAT: ['39', '79'], IBRA: ['33'], ALKOL: ['4'],
            RAYIC: ['49', '184'], TRAMER: ['48', '48', '210', '48'], VERGI: ['9'], MASAK: ['162'], MESLEK: ['']
        };
        const hepiyi = {
            EHLİYET: ['1', '195', '239', '196'], RUHSAT: ['7', '92', '238'], KTT: ['174', '237', '96', '224', '11', '22', '122', '169'],
            BEYAN: ['246', '179', '226', '155', '6'], ZABIT: ['5', '118', '22', '169', '188', '194', '209'],
            POLICE: ['3', '240', '241'], IMZA: ['131', '8'], SICIL: ['202'],
            SKAYIT: ['86'], GAZETE: ['202'], FAAL: ['190'],
            IRSALIYE: ['26', '220', '41', '134'], NUFUS: ['2', '213', '201', '94'],
            DIGER: ['12', '243'], ONARIM_SONRASI: ['32'],
            MUTABAKAT: ['211', '247', '28'], MUVAFAKAT: ['111', '56', '57', '101', '130'],
            IBRA: ['33', '132', '212'], ALKOL: ['4'],
            RAYIC: ['231', '184', '225', '234'], TRAMER: ['230', '229', '228', '233'],
            VERGI: ['9', '221', '136'], MASAK: ['248'], MESLEK: ['129']
        };
        const ankara = {
            EHLİYET: ['1', '1', '1', '1'], RUHSAT: ['7', '7', '7', '7'], KTT: ['38', '11'],
            BEYAN: ['6'], ZABIT: ['5', '73', '61'], POLICE: ['3'], IMZA: ['8'],
            SICIL: ['95'], SKAYIT: ['86'], GAZETE: ['95'], FAAL: ['94'],
            IRSALIYE: ['26'], NUFUS: ['2'], DIGER: ['12'], ONARIM_SONRASI: ['6'],
            MUTABAKAT: ['28'], MUVAFAKAT: ['48'], IBRA: ['33', '65'], ALKOL: ['4'],
            RAYIC: ['78', '76'], TRAMER: ['86', '86', '86','22'], VERGI: ['9', '50'], MASAK: ['81'], MESLEK: ['']
        };
        const orient = {
            EHLİYET: ['1', '1', '1', '1'], RUHSAT: ['7', '7', '7', '7'], KTT: ['5'],
			BEYAN: ['6'], ZABIT: ['5', '23', '22', '11'], POLICE: ['3'], IMZA: ['8'],
			SICIL: ['12'], SKAYIT: ['12'], GAZETE: ['12'], FAAL: ['12'], IRSALIYE: ['26'], NUFUS: ['2'],
            DIGER: ['12'], ONARIM_SONRASI: ['37'], MUTABAKAT: ['28'], MUVAFAKAT: ['42'], IBRA: ['33'], ALKOL: ['4'],
            RAYIC: ['36', '38'], TRAMER: ['12', '12', '12', '12'], VERGI: ['9'], MASAK: ['12'], MESLEK: ['12']
        };
        //const orient = { ...varsayilan };
        const ayarlar = (text.includes("MAPFRE") || url.includes("mapfre")) ? mapfre :
            (text.includes("HEPIYI") || url.includes("hepiyi")) ? hepiyi :
                (text.includes("ATLAS") || url.includes("atlas")) ? atlas :
                    (text.includes("ANKARA") || url.includes("ankara")) ? ankara :
                        (text.includes("ORIENT") || url.includes("orient")) ? orient : varsayilan;
        // ── OTO KURALLAR (global — bir kez tanımla) ───────────────────────────────
        const OTO_KURALLAR = [
            { pattern: /\bmehl\b/i, evrakId: () => ayarlar.EHLİYET[1], note: '' },
            { pattern: /\bsehl\b/i, evrakId: () => ayarlar.EHLİYET[2], note: '' },
            { pattern: /\bmruh\b/i, evrakId: () => ayarlar.RUHSAT[1], note: '' },
            { pattern: /\bsruh\b/i, evrakId: () => ayarlar.RUHSAT[2], note: '' },
            { pattern: /ehl(iyet[i]?)?|s[uü]r[uü][cç][uü][_ ]belge(si)?/i, evrakId: () => ayarlar.EHLİYET[0], note: '' },
            { pattern: /ruh(sat[iı]?)?|ara[cç][_ ]ruhsat|tra[fF]ik[_ ]tescil?/i, evrakId: () => ayarlar.RUHSAT[0], note: '' },
            { pattern: /ktt[_ ]sbm/i, evrakId: () => ayarlar.TRAMER[0], note: '' },
            { pattern: /ktt[_ ]sorgu/i, evrakId: () => ayarlar.TRAMER[3], note: '' },
            { pattern: /\bktt\b|kaza[_ ]tesbit|kaza[_ ]tespit|anla[sş]mal[iı][_ ]kaza/i, evrakId: () => ayarlar.KTT[0], note: () => { const noKTT = [orient]; return noKTT.includes(ayarlar) ? 'KTT' : ''; } },
            { pattern: /zabt|zabit|zab[iı]t|karakol|jandarma|polis[_ ]ifade/i, evrakId: () => ayarlar.ZABIT[0], note: '' },
            { pattern: /\bbeyan\b/i, evrakId: () => ayarlar.BEYAN[0], note: '' },
            { pattern: /kasko[_ ]poli[cç]e|trafik[_ ]poli[cç]e/i, evrakId: () => ayarlar.TRAMER[0], note: '' },
            { pattern: /\bpoli[cç]e\b/i, evrakId: () => ayarlar.POLICE[0], note: '' },
            { pattern: /\balkol\b/i, evrakId: () => ayarlar.ALKOL[0], note: '' },
            { pattern: /\bibra\b|ibraname|teslim[_ ]ibra/i, evrakId: () => ayarlar.IBRA[0], note: '' },
            { pattern: /a[gğ][iı]r[_ ]hasar/i, evrakId: () => ayarlar.TRAMER[2], note: '' },
            { pattern: /kasko[_ ]hasar|trafik[_ ]hasar/i, evrakId: () => ayarlar.TRAMER[1], note: '' },
            { pattern: /\btramer\b|sbm/i, evrakId: () => ayarlar.TRAMER[0], note: '' },
            { pattern: /\brayic\b|piyasa|ray[iı][cç]/i, evrakId: () => ayarlar.RAYIC[0], note: '' },
            { pattern: /\bvergi\b/i, evrakId: () => ayarlar.VERGI[0], note: '' },
            { pattern: /\bfaaliyet\b/i, evrakId: () => ayarlar.FAAL[0], note: '' },
            { pattern: /tck|nufus|nüfus|kimlik|mernis/i, evrakId: () => ayarlar.NUFUS[0], note: '' },
            { pattern: /\bmutabakat\b/i, evrakId: () => ayarlar.MUTABAKAT[0], note: '' },
            { pattern: /irsaliye/i, evrakId: () => ayarlar.IRSALIYE[0], note: '' },
            { pattern: /\bmasak\b/i, evrakId: () => ayarlar.MASAK[0], note: '' },
            { pattern: /\pol\b/i, evrakId: () => ayarlar.POLICE[0], note: '' },//HEPİYİ MUAYENE 227
            { pattern: /\meslek\b/i, evrakId: () => ayarlar.MESLEK[0], note: '' },
            { pattern: /taahhüt\b/i, evrakId: () => ['35'], note: '' },
            { pattern: /sgk\b/i, evrakId: () => ayarlar.SKAYIT[0], note: '' },

        ];
        function otoEvrakSec(fileName, selectEl, noteArea, tipiSel, btnEl) {
            const normalized = fileName.toLocaleLowerCase('tr-TR').replace(/[_\-\.]/g, ' '), KARSI_PATTERN = /\bkar[şs][ıi]\b/i, isKarsi = KARSI_PATTERN.test(normalized) || KARSI_PATTERN.test(fileName);
            let evrakId = null, noteVal = isKarsi ? 'KARŞI ARAÇ' : '';
            for (const kural of OTO_KURALLAR) {
                if (kural.pattern === KARSI_PATTERN) continue;
                if (kural.pattern.test(normalized) || kural.pattern.test(fileName)) {
                    evrakId = kural.evrakId();
                    if (!isKarsi) { noteVal = typeof kural.note === 'function' ? kural.note() : kural.note; }
                    break;
                }
            }
            if (evrakId === null && !isKarsi) { if (btnEl) { btnEl.textContent = '⚡ Oto Seç'; btnEl.style.background = '#2980b9'; btnEl.style.opacity = '1'; btnEl.disabled = false; } return false; }
            if (evrakId !== null && evrakId !== '') {
                selectEl.value = evrakId;
                selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                if (window.jQuery) jQuery(selectEl).trigger('change');
                if (typeof window.change_select === 'function') { try { window.change_select(selectEl.name); } catch (e) { } }
            }
            if (noteArea && noteVal) { noteArea.value = noteVal;['input', 'change'].forEach(ev => noteArea.dispatchEvent(new Event(ev, { bubbles: true }))); }
            if (tipiSel) { tipiSel.value = '0'; tipiSel.dispatchEvent(new Event('change', { bubbles: true })); if (window.jQuery) jQuery(tipiSel).trigger('change'); }
            if (btnEl) { btnEl.textContent = '✓ ' + noteVal; btnEl.style.background = '#27ae60'; btnEl.style.outline = '2px solid #1e90ff'; btnEl.disabled = true; btnEl.style.cursor = 'default'; btnEl.style.opacity = '1'; }
            console.log(`[OtoEvrak] "${fileName}" → "${noteVal}" (ID: ${evrakId})`);
            return true;
        }
        // ── STİLLER ───────────────────────────────────────────────────────────────
        GM_addStyle(`
    	        /* ── Toolbar ── */
            #ks-toolbar {
                position: fixed; top: 0; left: 0; right: 0; z-index: 999999;
                background: #1a1a2e; padding: 7px 14px;
                display: flex; align-items: center; gap: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.4); flex-wrap: wrap;
            }
            #ks-toolbar button {
                color: #fff; border: none; border-radius: 6px;
                padding: 6px 13px; cursor: pointer; font-size: 12px;
                font-weight: 600; white-space: nowrap;
            }
            #ks-toolbar button:hover { filter: brightness(1.15); }
            #ks-toolbar-row2 {
                width: 100%; display: flex; align-items: center;
                gap: 6px; padding-top: 5px;
                border-top: 1px solid rgba(255,255,255,.12); flex-wrap: wrap;
            }
            #ks-toolbar-row2 button {
                background: #475569; color: #fff; border: none; border-radius: 5px;
                padding: 4px 9px; cursor: pointer; font-size: 11px; font-weight: 600;
            }
            #ks-toolbar-row2 button:hover { filter: brightness(1.15); }
            .ks-sep { width:1px; height:18px; background:rgba(255,255,255,.2); margin:0 2px; }

            /* ── Yükleme barı alanı ── */
            #ks-progress-area {
                margin-left: auto;
                display: flex; flex-direction: column; gap: 4px;
                min-width: 200px; max-width: 300px;
            }
            #ks-progress-summary {
                color: #fff; font-size: 11px; font-weight: 700;
                text-align: right; letter-spacing: .3px; white-space: nowrap;
            }
            #ks-idm-bar-wrap {
                display: flex; height: 10px; border-radius: 5px;
                overflow: hidden; background: rgba(255,255,255,.08);
                border: 1px solid rgba(255,255,255,.15); gap: 1px;
            }
            .ks-idm-segment {
                height: 100%; transition: background .4s, flex .3s;
                min-width: 2px;
            }
            #ks-idm-bar-names {
                display: flex; gap: 1px; flex-wrap: nowrap; overflow: hidden;
            }
            .ks-idm-seg-name {
                font-size: 8px; color: rgba(255,255,255,.5);
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                flex: 1; min-width: 0; text-align: center;
            }
            table.table { border-collapse: separate !important; border-spacing: 0 !important; }
            table.table thead th {
                background: #1e293b !important; color: #e2e8f0 !important;
                font-size: 11px !important; font-weight: 700 !important; padding: 8px 10px !important;
            }
            /* ── Upload satırları ── */
            tr.template-upload {
                background: #fff !important; border-bottom: 2px solid #e8ecf0 !important;
                animation: ks-slide-in 0.25s ease-out !important; width: 100% !important;
            }
            tr.template-upload td:first-child {
                width: 116px !important; min-width: 116px !important; max-width: 116px !important;
                background: #f0f4f8 !important; border-right: 2px solid #e2e8f0 !important;
                padding: 10px 8px !important; vertical-align: top !important;
            }
            /* ── Download (yüklenmiş) satırları ── */
            tr.template-download {
                background: #f0fff4 !important; border-bottom: 2px solid #c6f6d5 !important;
                animation: ks-pop-green 0.35s ease-out !important; transform-origin: top !important;
            }
            tr.template-download td:first-child {
                background: #ebfff2 !important; border-right: 2px solid #9ae6b4 !important;
            }
            /* ── Canvas önizleme ── */
            span.preview { display: block !important; position: relative !important; }
            span.preview canvas {
                width: 100px !important; height: auto !important; display: block !important;
                cursor: zoom-in !important; border: 2px solid #cbd5e0 !important;
                border-radius: 6px !important; box-shadow: 0 2px 8px rgba(0,0,0,.12) !important;
            }
            span.preview canvas:hover { border-color: #4299e1 !important; }
            .ks-zoom-hint {
                position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
                font-size: 9px; background: rgba(0,0,0,.6); color: #fff;
                padding: 2px 6px; border-radius: 10px; white-space: nowrap;
                pointer-events: none; opacity: 0; transition: opacity .2s;
            }
            span.preview:hover .ks-zoom-hint { opacity: 1; }
            /* ── Evrak paneli ── */
            .ks-evrak-wrap {
                background: linear-gradient(135deg, #f8fafc, #eef2f7);
                border: 1.5px solid #cbd5e0; border-radius: 10px;
                padding: 8px 10px; margin: 4px 0 6px;
                display: flex; flex-direction: column; align-items: center;
                position: relative; box-sizing: border-box;
            }
            .ks-evrak-wrap::before {
                content: ""; position: absolute; left: 0; top: 15%; height: 70%;
                width: 3px; background: linear-gradient(to bottom, #6366f1, #3b82f6);
                border-radius: 0 3px 3px 0;
            }
            .ks-evrak-label {
                width: 100%; text-align: center; font-size: 9px; font-weight: 800;
                color: #fff; background: #334155; padding: 3px 8px; border-radius: 5px;
                margin-bottom: 6px; text-transform: uppercase; letter-spacing: .5px;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .ks-evrak-grid { display: flex; flex-wrap: wrap; gap: 4px; width: 100%; }
            .ks-btn {
                width: 65px !important; font-size: 9px !important; padding: 3px 2px !important;
                cursor: pointer !important; color: #fff !important; border: none !important;
                border-radius: 3px !important; font-weight: 700 !important; line-height: 1.3 !important;
                box-shadow: 0 2px 4px rgba(0,0,0,.25) !important;
                transition: filter .1s, transform .1s !important;
            }
            .ks-btn:hover { filter: brightness(1.12) !important; transform: translateY(-1px) !important; }
            /* ── Tooltip ── */
            .ks-tooltip-container { position: relative; display: inline-block !important; width: auto !important; }
            .ks-tooltip-box {
                display: none; position: absolute; bottom: calc(100% + 6px); left: 50%;
                transform: translateX(-50%); z-index: 999999;
                background: #1e293b; color: #f1f5f9; padding: 6px 9px; border-radius: 6px;
                font-size: 10px; white-space: nowrap; border-left: 3px solid #6366f1;
                box-shadow: 0 4px 14px rgba(0,0,0,.35); pointer-events: none;
            }
            .ks-tooltip-box::after {
                content: ""; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
                border: 5px solid transparent; border-top-color: #1e293b;
            }
            .ks-tooltip-container:hover .ks-tooltip-box { display: block; }
            /* ── Ortakisim ── */
            .ortakisim { margin-bottom: 6px !important; }
            .ortakisim select {
                width: 174px !important; font-size: 11px !important;
                border: 1.5px solid #cbd5e0 !important; border-radius: 5px !important;
                padding: 4px 6px !important; background: #fff !important; color: #1e293b !important;
            }
            .ortakisim select:focus { border-color: #4299e1 !important; outline: none !important; }
            .ortakisim textarea {
                width: 170px !important; font-size: 11px !important;
                border: 1.5px solid #cbd5e0 !important; border-radius: 5px !important;
                padding: 4px 6px !important; resize: vertical !important; color: #1e293b !important;
            }
            tr.template-upload td:last-child { vertical-align: top !important; padding: 10px 8px !important; white-space: nowrap !important; }
            tr.template-upload .btn.start {
                background: #3182ce !important; border: none !important; color: #fff !important;
                border-radius: 6px !important; padding: 5px 10px !important; font-size: 11px !important;
            }
            tr.template-upload .btn-warning {
                background: #dd6b20 !important; border: none !important; color: #fff !important;
                border-radius: 6px !important; padding: 5px 10px !important;
                font-size: 11px !important; margin-top: 4px !important;
            }
            /* ── Upload satırı girişi ── */
            @keyframes ks-slide-in { from { opacity: 0; transform: translateY(-8px); } to   { opacity: 1; transform: translateY(0); } }
            /* ── Download (yüklenmiş) satırı girişi ── */
            @keyframes ks-pop-green { 0%   { opacity: 0; transform: scaleY(0.85); background: #bbf7d0 !important; } 60%  { background: #bbf7d0 !important; } 100% { opacity: 1; transform: scaleY(1); background: #f0fff4 !important; } }
        `);

        // ── YARDIMCI ─────────────────────────────────────────────────────────────
        const $ = s => document.querySelector(s);
        const $$ = s => document.querySelectorAll(s);
        const buyutPencere = (fileName, canvas) => {
            const fileObj = window._ksFiles?.[fileName];
            const open = src => {
                const w = window.open('', '_blank');
                if (!w) return;
                w.document.write(`<!DOCTYPE html><html><head><title>${fileName}</title>
                <style>*{margin:0;padding:0}body{background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh}
                img{max-width:98vw;max-height:98vh;object-fit:contain}</style>
                </head><body><img src="${src}"></body></html>`);
                w.document.close();
            };
            if (fileObj) { const r = new FileReader(); r.onload = e => open(e.target.result); r.readAsDataURL(fileObj); }
            else { open(canvas.toDataURL('image/png')); }
        };

        // ── PROGRESS BARS ─────────────────────────────────────────────────────────
        // Her dosya için bar state'i tut
        window._ksBars = window._ksBars || {};
        const updateProgressArea = () => {
            const summary = $('#ks-progress-summary');
            const idmBar = $('#ks-idm-bar-wrap');
            const idmNames = $('#ks-idm-bar-names');
            if (!summary || !idmBar) return;
            const uploadRows = [...$$('tr.template-upload')];
            const downloadRows = [...$$('tr.template-download')];
            const bekleyen = uploadRows.length;
            const yuklenen = downloadRows.length;
            const toplam = bekleyen + yuklenen;
            // ── Özet yazısı ──
            let summaryText = `📋 ${bekleyen} bekliyor  ✅ ${yuklenen} yüklendi`;
            let summaryColor = '#fff';
            if (toplam === 0) { summaryText = '📋 Dosya bekleniyor'; summaryColor = 'rgba(255,255,255,.4)'; }
            else if (bekleyen === 0) { summaryText = `✅ Tümü tamamlandı! (${yuklenen} dosya)`; summaryColor = '#2ecc71'; }
            else if (toplam > RESIM_LIMIT) { summaryText += `  ⚠️ Limit aşıldı +${toplam - RESIM_LIMIT}`; summaryColor = '#e74c3c'; }
            summary.textContent = summaryText;
            summary.style.color = summaryColor;
            if (toplam === 0) { idmBar.innerHTML = ''; if (idmNames) idmNames.innerHTML = ''; return; }
            idmBar.innerHTML = '';
            if (idmNames) idmNames.innerHTML = '';
            const segWidth = `${100 / toplam}%`;
            // Önce yüklenmiş (download) dosyalar — yeşil
            downloadRows.forEach(tr => {
                const name = tr.getAttribute('fileuploadsatir') || '';
                const seg = document.createElement('div');
                seg.className = 'ks-idm-segment';
                seg.style.cssText = `flex: 1; background: #27ae60; min-width: 2px;`;
                seg.title = name;
                idmBar.appendChild(seg);
                if (idmNames) {
                    const n = document.createElement('div'); n.className = 'ks-idm-seg-name'; n.style.color = '#27ae60'; n.textContent = name.replace(/\.[^.]+$/, '').substring(0, 8); n.title = name; idmNames.appendChild(n);
                }
            });
            // Sonra bekleyen (upload) dosyalar — progress'e göre renk
            uploadRows.forEach(tr => {
                const name = tr.getAttribute('fileuploadsatir') || '';
                const pct = window._ksBars?.[name] ?? 0;
                const bg = pct >= 100 ? '#27ae60' : pct > 0 ? `linear-gradient(90deg, #2980b9 ${pct}%, #2c3e50 ${pct}%)` : '#2c3e50';
                const seg = document.createElement('div');
                seg.className = 'ks-idm-segment';
                seg.style.cssText = `flex: 1; background: ${bg}; min-width: 2px;`;
                seg.title = `${name} ${pct > 0 ? pct + '%' : ''}`;
                idmBar.appendChild(seg);
                if (idmNames) {
                    const n = document.createElement('div');
                    n.className = 'ks-idm-seg-name';
                    n.style.color = pct > 0 ? '#3498db' : 'rgba(255,255,255,.35)';
                    n.textContent = name.replace(/\.[^.]+$/, '').substring(0, 8);
                    n.title = name;
                    idmNames.appendChild(n);
                }
            });
        };
        // jQuery fileupload progress olayını yakala
        const hookFileUploadProgress = () => {
            if (window._ksProgressHooked) return;
            const tbody = $('tbody.files');
            if (!tbody) return;
            window._ksProgressHooked = true;
            // jQuery fileupload progress eventi
            if (window.jQuery) {
                jQuery(document).on('fileuploadprogress', function (e, data) { const pct = Math.round(data.loaded / data.total * 100); (data.files || []).forEach(f => { window._ksBars[f.name] = pct; }); updateProgressArea(); });
                jQuery(document).on('fileuploaddone fileuploadfail', function (e, data) { (data.files || []).forEach(f => { window._ksBars[f.name] = 100; }); updateProgressArea(); });
            }
        };
        // ── TOOLBAR ───────────────────────────────────────────────────────────────
        const initToolbar = () => {
            if ($('#ks-toolbar')) return;
            const srcDiv = [...$$('.col-lg-12')].find(d => d.querySelector('.fileinput-button'));
            if (!srcDiv) return;
            const origFileBtn = srcDiv.querySelector('.fileinput-button');
            const origStart = srcDiv.querySelector('button.start');
            const origCancel = srcDiv.querySelector('button.cancel');
            const origKapat = srcDiv.querySelector('button[onclick*="Cıkıs"]');
            [origStart, origCancel, origKapat].forEach(btn => { if (!btn) { return; } btn.style.cssText = 'position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;overflow:hidden'; });
            if (origFileBtn) origFileBtn.style.display = 'none';
            srcDiv.style.display = 'none';
            const toolbar = document.createElement('div');
            toolbar.id = 'ks-toolbar';
            const mkBtn = (label, bg, onClick) => { const b = document.createElement('button'); b.textContent = label; b.style.background = bg; b.onclick = onClick; return b; };
            toolbar.appendChild(mkBtn('＋ Ekle', '#27ae60', () => origFileBtn?.querySelector('input[type=file]')?.click()));
            if (origStart) toolbar.appendChild(mkBtn('⬆ Yükle', '#2980b9', () => origStart.click()));
            if (origCancel) toolbar.appendChild(mkBtn('İptal', '#e67e22', () => origCancel.click()));
            if (origKapat) toolbar.appendChild(mkBtn('✕', '#c0392b', () => origKapat.click()));
            toolbar.appendChild(mkBtn('↻', '#7f8c8d', () => window.location.reload()));
            // ── Progress alanı (badge yerine) ──
            const progressArea = document.createElement('div');
            progressArea.id = 'ks-progress-area';
            progressArea.innerHTML = `<div id="ks-progress-summary">📋 Dosya bekleniyor</div><div id="ks-idm-bar-wrap"></div><div id="ks-idm-bar-names" style="display:flex;gap:1px;margin-top:1px;"></div>`;
            toolbar.appendChild(progressArea);
            // 2. satır
            const row2 = document.createElement('div');
            row2.id = 'ks-toolbar-row2';
            const sep = () => { const d = document.createElement('div'); d.className = 'ks-sep'; return d; };
            const bulkSet = (sel, val) => $$(sel).forEach(s => {
                s.value = val;
                s.dispatchEvent(new Event('change', { bubbles: true }));
                if (window.jQuery) { jQuery(s).trigger('change'); }
                if (typeof window.change_select === 'function') { try { window.change_select(s.name); } catch (e) { } }
            });
            const r2btn = (label, bg, fn) => { const b = document.createElement('button'); b.textContent = label; b.style.background = bg; b.onclick = fn; return b; };
            const lbl = document.createElement('span');
            lbl.textContent = 'Toplu:';
            lbl.style.cssText = 'color:rgba(255,255,255,.5);font-size:10px;font-weight:600';
            row2.appendChild(lbl);
            row2.appendChild(r2btn('Fotokopi', '#e67e22', () => { bulkSet('select[name^="EVRAK_TIPI_"]', '0'); bulkSet('select[name^="PHOTO_TYPE_"]', '0'); }));
            row2.appendChild(r2btn('Aslı', '#2980b9', () => { bulkSet('select[name^="EVRAK_TIPI_"]', '1'); bulkSet('select[name^="PHOTO_TYPE_"]', '1'); }));
            row2.appendChild(sep());
            row2.appendChild(r2btn('Olay', '#8e44ad', () => { bulkSet('select[name^="EVRAK_ID_"]', '11'); bulkSet('select[name^="PHOTO_CTG_ID_"]', '11'); }));
            row2.appendChild(r2btn('Ekspertiz', '#27ae60', () => { bulkSet('select[name^="EVRAK_ID_"]', '1'); bulkSet('select[name^="PHOTO_CTG_ID_"]', '1'); }));
            row2.appendChild(r2btn('Hasar', '#2c3e50', () => { bulkSet('select[name^="EVRAK_ID_"]', '13'); bulkSet('select[name^="PHOTO_CTG_ID_"]', '13'); }));
            row2.appendChild(r2btn('Onarım', '#c0392b', () => { bulkSet('select[name^="EVRAK_ID_"]', ayarlar.ONARIM_SONRASI[0]); bulkSet('select[name^="PHOTO_CTG_ID_"]', ayarlar.ONARIM_SONRASI[0]); }));
            row2.appendChild(sep());
            row2.appendChild(r2btn('▲', '#475569', () => window.scrollTo({ top: 0, behavior: 'smooth' })));
            row2.appendChild(r2btn('▼', '#475569', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })));
            row2.appendChild(sep());
            // ── Toplu Oto Seç butonu ──
            const otoTümBtn = r2btn('⚡ Oto Seç (Tümü)', '#1a6fa8', () => {
                let eslesen = 0;
                $$('select[name^="EVRAK_ID_"], select[name^="PHOTO_CTG_ID_"]').forEach(sel => {
                    const td = sel.closest('td');
                    if (!td) return;
                    const otoBtn = td.querySelector('.ks-oto-btn');
                    if (otoBtn && !otoBtn.disabled) { otoBtn.click(); eslesen++; }
                });
                otoTümBtn.textContent = `✓ ${eslesen} eşleşti`;
                otoTümBtn.style.background = '#27ae60';
                setTimeout(() => { otoTümBtn.textContent = '⚡ Oto. Seç (Tümü)'; otoTümBtn.style.background = '#1a6fa8'; }, 3000);
            });
            row2.appendChild(otoTümBtn);
            row2.appendChild(sep());

            // ── Oto kaydır ──
            const otoLabel = document.createElement('label');
            otoLabel.style.cssText = 'display:flex;align-items:center;gap:5px;color:rgba(255,255,255,.7);font-size:11px;cursor:pointer;font-weight:600;user-select:none';
            const otoChk = document.createElement('input');
            otoChk.type = 'checkbox';
            otoChk.style.cssText = 'cursor:pointer;margin:0;accent-color:#27ae60';
            otoChk.addEventListener('change', function () { window._ksOtoScroll = this.checked; });
            otoLabel.appendChild(otoChk);
            otoLabel.appendChild(document.createTextNode('Oto. kaydır'));
            row2.appendChild(otoLabel);

            toolbar.appendChild(row2);
            document.body.insertBefore(toolbar, document.body.firstChild);
            document.body.style.paddingTop = (toolbar.offsetHeight + 10) + 'px';
        };
        // ── PREVIEW FİX ───────────────────────────────────────────────────────────
        const fixPreviews = () => {
            $$('tr.template-upload').forEach(tr => {
                if (tr.dataset.ksReady) return;
                const td = tr.querySelector('td:first-child');
                if (td) { td.style.removeProperty('height'); td.style.height = 'auto'; }
                const canvas = tr.querySelector('span.preview canvas');
                if (!canvas) return;
                tr.dataset.ksReady = '1';
                canvas.style.cssText = 'width:100px!important;height:auto!important;display:block!important;position:static!important;margin:0!important';
                const fileName = tr.getAttribute('fileuploadsatir') || '';
                canvas.addEventListener('click', () => buyutPencere(fileName, canvas));
                const span = canvas.closest('span.preview');
                if (span && !span.querySelector('.ks-zoom-hint')) {
                    const hint = document.createElement('div');
                    hint.className = 'ks-zoom-hint';
                    hint.textContent = '🔍 Büyüt';
                    span.appendChild(hint);
                }
            });
        };
        // ── EVRAK PANELLERİ ───────────────────────────────────────────────────────
        const BUTONLAR = [
            { label: 'EHLİYET', vals: ayarlar.EHLİYET, color: '#ff4757', t: 'Ehliyet' },
            { label: 'RUHSAT', vals: ayarlar.RUHSAT, color: '#ffa502', t: 'Ruhsat' },
            { label: 'KİMLİK', vals: ayarlar.NUFUS, color: '#1e90ff', t: 'Kimlik/Nüfus' },
            { label: 'POLİÇE', vals: ayarlar.POLICE, color: '#3742fa', t: 'Poliçe' },
            { label: 'TUTANAK', vals: ayarlar.KTT, color: '#2ed573', t: 'KTT/Karakol/Görgü' },
            { label: 'BEYAN', vals: ayarlar.BEYAN, color: '#57606f', t: 'Beyan' },
            { label: 'ZABIT', vals: ayarlar.ZABIT, color: '#a29bfe', t: 'Zabıt/Tercüme' },
            { label: 'ALKOL', vals: ayarlar.ALKOL, color: '#ff6b81', t: 'Alkol Raporu' },
            { label: 'İMZA', vals: ayarlar.IMZA, color: '#1abc9c', t: 'İmza Sirküsü' },
            { label: 'GAZETE', vals: ayarlar.GAZETE, color: '#95a5a6', t: 'Sicil Gazetesi' },
            { label: 'SİCİLKAYIT', vals: ayarlar.SICIL, color: '#7f8c8d', t: 'Sicil Kayıt' },
            { label: 'SGK', vals: ayarlar.SKAYIT, color: '#8395a7', t: 'SGK Kaydı' },
            { label: 'MESLEK', vals: ayarlar.MESLEK, color: '#ee5253', t: 'Meslek Belgesi' },
            { label: 'FAALİYET', vals: ayarlar.FAAL, color: '#ee5253', t: 'Faaliyet' },
            { label: 'MUTABAKAT', vals: ayarlar.MUTABAKAT, color: '#10ac84', t: 'Mutabakatname' },
            { label: 'MUVAFFAKAT', vals: ayarlar.MUVAFAKAT, color: '#22af94', t: 'Muvaffakatname' },
            { label: 'TESLİMİBRA', vals: ayarlar.IBRA, color: '#2e86de', t: 'İbraname/Teslim İbra' },
            { label: 'İRSALİYE', vals: ayarlar.IRSALIYE, color: '#f39c12', t: 'İrsaliye' },
            { label: 'PİYASA', vals: ayarlar.RAYIC, color: '#f1c40f', t: 'Piyasa/Rayiç/Aktüer' },
            { label: 'TRAMER', vals: ayarlar.TRAMER, color: '#5f27cd', t: 'Tramer/Ağır/Geçmiş Hasar' },
            { label: 'MASAK', vals: ayarlar.MASAK, color: '#00d2d3', t: 'MASAK Evrakları' },
            { label: 'VERGİLEVHA', vals: ayarlar.VERGI, color: '#546e7a', t: 'Vergi Levhası' },
            { label: 'DİĞER', vals: ayarlar.DIGER, color: '#bdc3c7', t: 'Diğer' },
            { label: 'SBM', vals: ayarlar.DIGER, color: '#34495e', t: 'SBM/Tramer Sorgu', note: 'SBM' },
            { label: 'KARŞIARAÇ', vals: [], color: '#34495e', t: 'Karşı Araç Açıklaması', note: 'KARŞI ARAÇ' },
        ];
        const injectRowPanels = () => {
            $$('select[name^="EVRAK_ID_"], select[name^="PHOTO_CTG_ID_"]').forEach(selectEl => {
                const parentTd = selectEl.closest('td');
                if (!parentTd || parentTd.querySelector('.ks-evrak-wrap')) return;
                const fileMatch = selectEl.name.match(/\[(.*?)\]/);
                const tr = selectEl.closest('tr');
                const fileName = fileMatch?.[1] || tr?.getAttribute('fileuploadsatir') || tr?.querySelector('td:first-child')?.getAttribute('fileuploadsatir') || 'Dosya';
                const noteArea = parentTd.querySelector('textarea[name^="HEADER_"]') || parentTd.querySelector('textarea[name^="DESCRIPTION_"]');
                const tipiSel = parentTd.querySelector('select[name^="EVRAK_TIPI_"]') || parentTd.querySelector('select[name^="PHOTO_TYPE_"]');
                if (!noteArea) return;
                const wrap = document.createElement('div');
                wrap.className = 'ks-evrak-wrap';
                const lbl = document.createElement('div');
                lbl.className = 'ks-evrak-label';
                lbl.textContent = '📁 ' + fileName;
                wrap.appendChild(lbl);
                const grid = document.createElement('div');
                grid.className = 'ks-evrak-grid';
                BUTONLAR.forEach(d => {
                    const btn = document.createElement('button');
                    btn.textContent = d.label;
                    btn.type = 'button';
                    btn.className = 'ks-btn';
                    btn.style.background = d.color;
                    const tip = document.createElement('div');
                    tip.className = 'ks-tooltip-box';
                    tip.style.borderColor = d.color;
                    tip.innerHTML = `<b>${d.t}</b><br>Tekrar tıkla → sonraki seçenek`;
                    btn.onclick = e => {
                        e.preventDefault();
                        if (d.vals && d.vals.length > 0) {
                            const cur = d.vals.indexOf(selectEl.value);
                            const next = d.vals[(cur + 1) % d.vals.length];
                            selectEl.value = next;
                            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                            if (window.jQuery) jQuery(selectEl).trigger('change');
                            if (typeof window.change_select === 'function') { try { window.change_select(selectEl.name); } catch (err) { } }
                            tip.innerHTML = `<b>${d.t}</b><br><span style="color:#ffe082">${selectEl.options[selectEl.selectedIndex]?.text || next}</span>`;
                        }
                        if (d.note && noteArea) { noteArea.value = d.note;['input', 'change'].forEach(ev => noteArea.dispatchEvent(new Event(ev, { bubbles: true }))); }
                        if (tipiSel) { tipiSel.value = '0'; tipiSel.dispatchEvent(new Event('change', { bubbles: true })); if (window.jQuery) jQuery(tipiSel).trigger('change'); }
                    };
                    const cell = document.createElement('div');
                    cell.className = 'ks-tooltip-container';
                    cell.appendChild(btn);
                    cell.appendChild(tip);
                    grid.appendChild(cell);
                });
                wrap.appendChild(grid);
                // ── Oto Seç butonu (satır bazlı) ──
                /*const otoBtn = document.createElement('button');
                otoBtn.type = 'button';
                otoBtn.className = 'ks-oto-btn';
                otoBtn.textContent = '⚡ Oto Seç';
                otoBtn.style.cssText = `
                    margin-top: 6px; width: 100%; padding: 4px 0;
                    background: #2980b9; color: #fff; border: none;
                    border-radius: 4px; font-size: 10px; font-weight: 700;
                    cursor: pointer; letter-spacing: .3px;
                    transition: background .2s;
                `;
                otoBtn.onmouseenter = () => { if (!otoBtn.disabled) otoBtn.style.filter = 'brightness(1.15)'; };
                otoBtn.onmouseleave = () => { otoBtn.style.filter = ''; };
                otoBtn.onclick = () => otoEvrakSec(fileName, selectEl, noteArea, tipiSel, otoBtn);
                wrap.appendChild(otoBtn);*/
                // Sayfa açılışında otomatik dene
                setTimeout(() => otoEvrakSec(fileName, selectEl, noteArea, tipiSel), 300);
                parentTd.appendChild(wrap);
            });
        };
        // ── UPLOAD TAKİBİ ─────────────────────────────────────────────────────────
        const initUploadObserver = () => {
            if (window._ksObserverDone) return;
            const tbody = $('tbody.files');
            if (!tbody) return;
            window._ksObserverDone = true;
            new MutationObserver(() => {
                $$('tr.template-download').forEach(tr => {
                    if (tr.dataset.ksVisible) return;
                    tr.dataset.ksVisible = '1';
                    tr.style.setProperty('opacity', '1', 'important');
                    tr.style.setProperty('visibility', 'visible', 'important');
                    tr.style.setProperty('background', '#f0fff4', 'important');
                });
                updateProgressArea();
            }).observe(tbody, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        };
        // ── DOSYA CACHE ───────────────────────────────────────────────────────────
        if (!window._ksFiles) { window._ksFiles = {}; document.addEventListener('change', e => { if (e.target?.type === 'file' && e.target.files) Array.from(e.target.files).forEach(f => { window._ksFiles[f.name] = f; }); }, true); }
        // ── ANA DÖNGÜ ─────────────────────────────────────────────────────────────
        const start = () => { initToolbar(); injectRowPanels(); fixPreviews(); updateProgressArea(); initUploadObserver(); hookFileUploadProgress(); };
        setTimeout(start, 100); setInterval(start, 1000);
    }
    // Resim yükleme kontrolü
    if (KS_SYSTEM && RESIM && loc("otohasar") && loc("eks_hasar_evrak_foto_list.php")) {
        config.width = '150px';
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        if (!panel) return;
        panel.style.setProperty('width', config.width); panel.style.setProperty('min-width', config.width);
        if (document.body.classList.contains('ks-panel-open')) { document.body.style.marginRight = config.width; }
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Evrak Analizi";
            panelContent.innerHTML = `
    	        <div id="panelContent" style="color:#fff; text-align:center; padding:2px; background:rgba(0,0,0,0.2); border-radius:5px; margin-bottom:8px; font-size:11px; font-weight:bold; border:1px solid rgba(255,255,255,0.1);">DURUM TARANIYOR</div>
    	        <div class="ks-grid-container" style="display: grid; grid-template-columns: 1fr; gap: 2px; width: 100%;">
    	            <div style="color:#aaa; font-size:10px; text-align:center;">Tablo verileri bekleniyor...</div></div>
    	        <hr class="custom-line">
    	        <div class="ks-tooltip-container" style="width:100%; display:block;">
    	            <button id="btn-toplu-sil" class="ks-btn" style="background:#c0392b; border:0; border-radius:4px; cursor:pointer; padding:3px 4px; font-size:11px; width:100%; display:block; box-sizing:border-box;">🗑️ TÜMÜNÜ SİL</button>
    	            <div class="ks-tooltip-box" style="display:none; border-color:#c0392b;"><strong>Toplu Silme</strong><br>Sayfadaki tüm kayıtları tek onay ile siler.</div></div>`;
        }
        // ── SİGORTA + MAĞDUR ÇAPRAZ KONTROL ─────────────────────────────
        const urlParams = new URLSearchParams(window.location.search);
        const dosyaId = urlParams.get('id');
        async function checkSigortaMagdur() {
            if (!dosyaId) return;
            try {
                const res = await fetch(`/eks/eks_hasar.php?id=${dosyaId}`, { credentials: 'include' });
                const text = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const sigortaSekliEl = doc.getElementById('SIGORTA_SEKLI');
                if (!sigortaSekliEl) return;
                const sigortaVal = sigortaSekliEl.value; // "2" = KASKO, "1" = TRAFİK
                if (sigortaVal !== '2') return;
                const rows = Array.from(document.querySelectorAll('table tr'));
                const hasMagdur = rows.some(r => {
                    const td = r.querySelectorAll('td')[1];
                    if (!td) return false;
                    const txt = td.innerText.toLocaleLowerCase('tr-TR');
                    return txt.includes('mağdur') || txt.includes('magdur');
                });
                if (!hasMagdur) return;
                const statusHeader = document.getElementById('panelContent');
                const existing = document.getElementById('ks-magdur-uyari');
                if (existing) return;
                const uyariDiv = document.createElement('div');
                uyariDiv.id = 'ks-magdur-uyari';
                uyariDiv.style.cssText = `
                    padding: 5px 6px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 700;
                    text-align: center;
                    background: rgba(220, 53, 69, 0.2);
                    border: 1px solid #dc3545;
                    color: #ff8585;
                    margin-bottom: 6px;
                    animation: ksBlink 1s infinite;
                `;
                uyariDiv.innerHTML = '⚠ KASKO + MAĞDUR<br>EVRAĞI ÇAKIŞIYOR!';
                if (statusHeader && statusHeader.parentNode) { statusHeader.parentNode.insertBefore(uyariDiv, statusHeader.nextSibling); }
                if (statusHeader) { statusHeader.innerText = '⚠ KASKO - MAĞDUR HATASI'; statusHeader.style.color = '#dc3545'; }
                console.warn('[OtoHasar] KASKO dosyasında mağdur evrakı tespit edildi! Dosya ID:', dosyaId);
            } catch (err) {
                console.warn('[checkSigortaMagdur] Fetch hatası:', err);
            }
        }
        // Sayfa yüklenince bir kez çalıştır
        checkSigortaMagdur();
        // ─────────────────────────────────────────────────────────────────
        function updatePanel() {
            const container = document.querySelector('.ks-grid-container'), statusHeader = document.getElementById('panelContent');
            if (!container) return;
            const rows = Array.from(document.querySelectorAll('table tr'));
            // td[1] = evrak adı (link text), tire sonrasını temizle
            const docs = rows.map(r => {
                const td = r.querySelectorAll('td')[1];
                if (!td) return { raw: '', sig: false, mag: false };
                const raw = td.innerText.toLocaleLowerCase('tr-TR').replace(/-\s*$/, '').trim();
                return { raw, sig: raw.includes('sigortalı') || raw.includes('sigortali'), mag: raw.includes('mağdur') || raw.includes('magdur'), };
            }).filter(d => d.raw !== '');
            const has = (keys, onlySig = false, onlyMag = false) => docs.some(d => { if (onlySig && !d.sig) return false; if (onlyMag && !d.mag) return false; return keys.some(k => d.raw.includes(k)); });
            // Kaza evrakı türünü tespit et
            const isKTT = has(["kaza tesbit", "kaza tespit", "ktt", "anlasmali kaza", "anlaşmalı kaza"]), isZabit = has(["zabt", "zabit", "zabıt", "karakol", "ifade", "görgü", "polis", "jandarma"]), isBeyan = has(["beyan"]);
            container.innerHTML = '';
            const createBox = (text, ok, isOptional = false) => {
                const div = document.createElement('div');
                let borderColor, bgColor, textColor;
                if (isOptional && ok) { borderColor = '#ffc107'; bgColor = 'rgba(255,193,7,0.15)'; textColor = '#ffe082'; }
                else { borderColor = ok ? '#28a745' : '#dc3545'; bgColor = ok ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)'; textColor = ok ? '#85ff9e' : '#ff8585'; }
                div.style.cssText = `padding:4px 5px; border-radius:4px; font-size:11px; font-weight:600; text-align:center;
                    transition:all 0.3s; border-right:4px solid ${borderColor}; background:${bgColor};
                    color:${textColor}; margin-bottom:2px; box-shadow:0 2px 4px rgba(0,0,0,0.2);`;
                div.innerText = (ok ? '' : '⚠ ') + text.toUpperCase();
                return div;
            };
            const createSep = (label) => {
                const div = document.createElement('div');
                div.style.cssText = 'color:#fff; font-size:9px; text-align:center; padding:3px 0 1px; letter-spacing:.05em; border-top:1px solid #333; margin-top:2px;';
                div.innerText = '─── ' + label + ' ───';
                return div;
            };
            // ── KAZA TÜRÜ ────────────────────────────────────────
            let kazaTuru = '', kazaOk = false;
            if (isKTT) { kazaTuru = 'KTT'; kazaOk = true; }
            else if (isZabit) { kazaTuru = 'ZABİT'; kazaOk = true; }
            else if (isBeyan) { kazaTuru = 'BEYAN'; kazaOk = true; }
            else { kazaTuru = 'KAZA EVRAĞI YOK'; kazaOk = false; }
            container.appendChild(createBox('KAZA ŞEKLİ: ' + kazaTuru, kazaOk));
            // ── SİGORTALI EVRAK ──────────────────────────────────
            container.appendChild(createSep('SİGORTALI'));
            const sigEhliyet = has(['ehliyet', 'sürücü belgesi'], true, false), sigRuhsat = has(['ruhsat'], true, false), sigKimlik = has(['kimlik', 'nüfus', 'pasaport'], true, false);
            container.appendChild(createBox('Ehliyet', sigEhliyet));
            container.appendChild(createBox('Ruhsat', sigRuhsat));
            if (sigKimlik) container.appendChild(createBox('Kimlik', true));
            // ── MAĞDUR EVRAK ─────────────────────────────────────
            container.appendChild(createSep('MAĞDUR'));
            const magEhliyet = has(['ehliyet', 'sürücü belgesi'], false, true), magRuhsat = has(['ruhsat'], false, true), magKimlik = has(['kimlik', 'nüfus', 'pasaport'], false, true);
            container.appendChild(createBox('Ehliyet', magEhliyet));
            container.appendChild(createBox('Ruhsat', magRuhsat));
            if (magKimlik) container.appendChild(createBox('Kimlik', true));
            // Zabit ise alkol zorunlu
            if (isZabit) { const alkol = has(['alkol']); container.appendChild(createBox('Alkol Raporu', alkol)); }
            // ── OPSİYONEL ────────────────────────────────────────
            const optionals = [
                { keys: ['poliçe', 'police'], l: 'Poliçe' },
                { keys: ['ibraname', 'ibra', 'temlik'], l: 'İbraname/İbra' },
                { keys: ['teslim ibra'], l: 'Teslim İbra' },
                { keys: ['faaliyet belgesi'], l: 'Faaliyet Belgesi' },
                { keys: ['hasar bildirim', 'taahhüt'], l: 'Hasar Bildirim' },
                { keys: ['fatura'], l: 'Fatura' },
                { keys: ['tramer', 'kusur', 'sbm'], l: 'Tramer/Kusur' },
                { keys: ['eksper', 'ön rapor', 'on rapor'], l: 'Eksper Raporu' },
                { keys: ['vergi levhası'], l: 'Vergi Levhası' },
                { keys: ['imza sirküsü'], l: 'İmza Sirküsü' },
                { keys: ['ticaret sicil'], l: 'Ticaret Sicil' },
                { keys: ['ihbar föyü'], l: 'İhbar Föyü' },
                { keys: ['ssk', 'kurumu'], l: 'SSK Bildirimi' },
                { keys: ['vekaletname', 'vekalet'], l: 'Vekaletname' },
            ];
            const foundOptionals = optionals.filter(o => has(o.keys));
            if (foundOptionals.length) { container.appendChild(createSep('DİĞER')); foundOptionals.forEach(o => container.appendChild(createBox(o.l, true, true))); }
            // ── HEADER DURUM ─────────────────────────────────────
            const zorunluTamam = kazaOk && sigEhliyet && sigRuhsat && magEhliyet && magRuhsat && (!isZabit || has(['alkol']));
            statusHeader.innerText = zorunluTamam ? 'EVRAK TAMAM ✓' : 'EKSİK EVRAK VAR';
            statusHeader.style.color = zorunluTamam ? '#28a745' : '#dc3545';
        }
        const runner = setInterval(() => { if (document.querySelector('table')) updatePanel(); }, 2000);
        document.addEventListener('click', (e) => {
            if (e.target.id !== 'btn-toplu-sil') return;
            const silLinks = Array.from(document.querySelectorAll('a[href*="photo_sil.php"]'));
            if (!silLinks.length) { alert('Silinecek kayıt bulunamadı!'); return; }
            if (!confirm(`Toplam ${silLinks.length} kayıt silinecek. Emin misiniz?`)) return;
            const btn = document.getElementById('btn-toplu-sil');
            btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed';
            const statusHeader = document.getElementById('panelContent'), container = document.querySelector('.ks-grid-container');
            container.innerHTML = `
                <div id="sil-progress-text" style="color:#ff8585; font-size:11px; font-weight:bold; text-align:center; margin-bottom:4px;">0 / ${silLinks.length} silindi</div>
                <div style="background:rgba(255,255,255,0.1); border-radius:6px; overflow:hidden; height:10px; width:100%;">
                    <div id="sil-progress-bar" style="height:100%; width:0%; background:linear-gradient(90deg,#c0392b,#e74c3c);border-radius:6px; transition:width 0.3s ease;"></div></div>
                <div id="sil-log" style="margin-top:6px; max-height:120px; overflow-y:auto; font-size:9px; color:#aaa;"></div>
            `;
            statusHeader.innerText = 'SİLİNİYOR...';
            statusHeader.style.color = '#e74c3c';
            let blink = true;
            const blinkInterval = setInterval(() => { statusHeader.style.opacity = blink ? '0.4' : '1'; blink = !blink; }, 500);
            const progressText = document.getElementById('sil-progress-text'), progressBar = document.getElementById('sil-progress-bar'), logDiv = document.getElementById('sil-log');
            let tamamlanan = 0; let hatali = 0; const toplam = silLinks.length;
            const animateRow = (row, success) => {
                if (!row) return;
                row.style.transition = 'opacity 0.4s ease, background-color 0.3s ease';
                row.style.backgroundColor = success ? '#1a4a1a' : '#4a1111';
                setTimeout(() => { row.style.opacity = '0'; }, 200);
                setTimeout(() => { row.style.display = 'none'; }, 600);
            };
            const updateProgress = (dosyaAdi, success) => {
                tamamlanan++;
                const yuzde = Math.round((tamamlanan / toplam) * 100); progressBar.style.width = yuzde + '%'; progressText.innerText = `${tamamlanan} / ${toplam} silindi`;
                const logLine = document.createElement('div');
                logLine.style.cssText = `color:${success ? '#85ff9e' : '#ff8585'}; padding:1px 0; border-bottom:1px solid rgba(255,255,255,0.05);`;
                logLine.innerText = (success ? '✓ ' : '✗ ') + (dosyaAdi || 'bilinmeyen');
                logDiv.insertBefore(logLine, logDiv.firstChild);
                if (tamamlanan === toplam) {
                    clearInterval(blinkInterval);
                    statusHeader.style.opacity = '1';
                    progressBar.style.background = hatali > 0 ? 'linear-gradient(90deg, #92531b, #f39c12)' : 'linear-gradient(90deg, #1a4a1a, #2ecc71)';
                    setTimeout(() => {
                        statusHeader.innerText = hatali > 0 ? `${toplam - hatali} silindi, ${hatali} hata` : `${toplam} KAYIT SİLİNDİ ✓`;
                        statusHeader.style.color = hatali > 0 ? '#f39c12' : '#2ecc71';
                        progressText.innerText = 'Sayfa yenileniyor...';
                        setTimeout(() => location.reload(), 1500);
                    }, 400);
                }
            };
            silLinks.forEach(link => {
                const href = link.getAttribute('href'), match = href.match(/photo_sil\.php\?ID=(\d+)/);
                if (!match) { updateProgress('?', false); return; }
                const id = match[1], row = link.closest('tr'), dosyaAdi = row?.querySelectorAll('td')[1]?.innerText?.trim() || id;
                const xhttp = new XMLHttpRequest();
                xhttp.open('POST', '/pic_db/photo_sil.php', true);
                xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhttp.onload = () => { animateRow(row, true); updateProgress(dosyaAdi, true); };
                xhttp.onerror = () => { animateRow(row, false); hatali++; updateProgress(dosyaAdi, false); };
                xhttp.send(`id=${id}&btnEVET=EVET`);
            });
        });
		function getParam(name, url = window.location.href) {
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
		}
        var onayNo = '', hasarId = '';
        onayNo = getParam('ONAY_NO');
        hasarId = getParam('idhasar') || getParam('id');
        // 1. ADIM: Mevcut butonları kontrol et
        var evrakButonu = document.querySelector('input[value="TOPLU EVRAK EKLE HTML5 (YENİ)"]');
        var fotografButonu = document.querySelector('input[value="TOPLU FOTOĞRAF EKLE HTML5 (YENİ)"]');
        // Eğer butonlar varsa ONAY_NO'yu içerilerinden çekelim
        if (!onayNo) {
            if (evrakButonu && evrakButonu.getAttribute('onclick')) {
                onayNo = getParam('ONAY_NO', evrakButonu.getAttribute('onclick'));
            } else if (fotografButonu && fotografButonu.getAttribute('onclick')) {
                onayNo = getParam('ONAY_NO', fotografButonu.getAttribute('onclick'));
            }
        }
        // 2. ADIM: Alternatif olarak linkleri tara
        if (!onayNo || !hasarId) {
            var linkler = document.querySelectorAll('a');
            for (var i = 0; i < linkler.length; i++) {
                var href = linkler[i].href;
                if (href.includes('ONAY_NO=')) {
                    if (!onayNo) onayNo = getParam('ONAY_NO', href);
                    if (!hasarId) hasarId = getParam('idhasar', href) || getParam('id', href);
                    if (onayNo && hasarId) break;
                }
            }
        }
        // 3. ADIM: Eğer ONAY_NO varsa ve iki buton da sayfada YOKSA yeni butonu ekle
        if (onayNo && !evrakButonu && !fotografButonu) {
            var yeniButon = document.createElement('input');
            yeniButon.type = 'button';
            yeniButon.className = 'buton06';
            yeniButon.value = 'KS Evrak Ekle';
            var popupKod = "javascript:popup('pic_db/multi_file_upload/index.php?ONAY_NO=" + onayNo + "&IMAGE=2','masraf',800,600)";
            yeniButon.setAttribute('onclick', popupKod);
            yeniButon.style.margin = '5px';
            yeniButon.style.cursor = 'pointer';
            yeniButon.onmouseover = function () { this.style.backgroundColor = '#1d4ed8'; this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; };
            yeniButon.onmouseout = function () { this.style.backgroundColor = '#1e40af'; this.style.boxShadow = 'none'; };
            // KONUMLANDIRMA
            var HedefPanel = document.querySelector('.panel-body, .form-actions, td[align="center"], div.buttons');
            if (HedefPanel) {
                HedefPanel.appendChild(yeniButon);
            } else {
                var benzerButon = document.querySelector('.buton06');
                if (benzerButon && benzerButon.parentNode) { benzerButon.parentNode.insertBefore(yeniButon, benzerButon.nextSibling); } else { document.body.appendChild(yeniButon); }
            }
        }
    }
    if (KS_SYSTEM && RESIM && loc("otohasar") && loc("eks_hasar_evrak_foto_list.php")) {
        config.width = '150px';
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        if (!panel) return;
        panel.style.setProperty('width', config.width); panel.style.setProperty('min-width', config.width);
        if (document.body.classList.contains('ks-panel-open')) { document.body.style.marginRight = config.width; }
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            const headerTitle = panel.querySelector('.ks-header h4');
            if (headerTitle) headerTitle.innerText = "Evrak Analizi";
            panelContent.innerHTML = `
    <div id="panelContent" style="color:#fff; text-align:center; padding:2px; background:rgba(0,0,0,0.2); border-radius:5px; margin-bottom:8px; font-size:11px; font-weight:bold; border:1px solid rgba(255,255,255,0.1);">DURUM TARANIYOR</div>
    <div class="ks-grid-container" style="display: grid; grid-template-columns: 1fr; gap: 2px; width: 100%;">
        <div style="color:#aaa; font-size:10px; text-align:center;">Tablo verileri bekleniyor...</div>
    </div>
    <hr class="custom-line">
    <div class="ks-tooltip-container" style="width:100%; display:block; margin-bottom:4px;">
        <button id="btn-toplu-indir-evrak" class="ks-btn" style="background:#1a6e3c; border:0; border-radius:4px; cursor:pointer; padding:3px 4px; font-size:11px; width:100%; display:block; box-sizing:border-box; color:#fff;">⬇️ HEPSİNİ İNDİR</button>
        <div class="ks-tooltip-box" style="display:none; border-color:#1a6e3c;"><strong>Tüm Evrakları İndir</strong><br>PDF ve resim dahil tüm evrakları indirir.</div>
    </div>
    <div class="ks-tooltip-container" style="width:100%; display:block;">
        <button id="btn-toplu-sil" class="ks-btn" style="background:#c0392b; border:0; border-radius:4px; cursor:pointer; padding:3px 4px; font-size:11px; width:100%; display:block; box-sizing:border-box;">🗑️ TÜMÜNÜ SİL</button>
        <div class="ks-tooltip-box" style="display:none; border-color:#c0392b;"><strong>Toplu Silme</strong><br>Sayfadaki tüm kayıtları tek onay ile siler.</div>
    </div>
`;
        }
        // ── SİGORTA + MAĞDUR ÇAPRAZ KONTROL ─────────────────────────────
        const urlParams = new URLSearchParams(window.location.search);
        const dosyaId = urlParams.get('id');
        async function checkSigortaMagdur() {
            if (!dosyaId) return;
            try {
                const res = await fetch(`/eks/eks_hasar.php?id=${dosyaId}`, { credentials: 'include' });
                const text = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const sigortaSekliEl = doc.getElementById('SIGORTA_SEKLI');
                if (!sigortaSekliEl) return;
                const sigortaVal = sigortaSekliEl.value; // "2" = KASKO, "1" = TRAFİK
                if (sigortaVal !== '2') return;
                const rows = Array.from(document.querySelectorAll('table tr'));
                const hasMagdur = rows.some(r => {
                    const td = r.querySelectorAll('td')[1];
                    if (!td) return false;
                    const txt = td.innerText.toLocaleLowerCase('tr-TR');
                    return txt.includes('mağdur') || txt.includes('magdur');
                });
                if (!hasMagdur) return;
                const statusHeader = document.getElementById('panelContent');
                const existing = document.getElementById('ks-magdur-uyari');
                if (existing) return;
                const uyariDiv = document.createElement('div');
                uyariDiv.id = 'ks-magdur-uyari';
                uyariDiv.style.cssText = `
                    padding: 5px 6px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 700;
                    text-align: center;
                    background: rgba(220, 53, 69, 0.2);
                    border: 1px solid #dc3545;
                    color: #ff8585;
                    margin-bottom: 6px;
                    animation: ksBlink 1s infinite;
                `;
                uyariDiv.innerHTML = '⚠ KASKO + MAĞDUR<br>EVRAĞI ÇAKIŞIYOR!';
                if (statusHeader && statusHeader.parentNode) { statusHeader.parentNode.insertBefore(uyariDiv, statusHeader.nextSibling); }
                if (statusHeader) { statusHeader.innerText = '⚠ KASKO - MAĞDUR HATASI'; statusHeader.style.color = '#dc3545'; }
                console.warn('[OtoHasar] KASKO dosyasında mağdur evrakı tespit edildi! Dosya ID:', dosyaId);
            } catch (err) {
                console.warn('[checkSigortaMagdur] Fetch hatası:', err);
            }
        }
        // Sayfa yüklenince bir kez çalıştır
        checkSigortaMagdur();
        // ─────────────────────────────────────────────────────────────────
        function updatePanel() {
            const container = document.querySelector('.ks-grid-container'), statusHeader = document.getElementById('panelContent');
            if (!container) return;
            const rows = Array.from(document.querySelectorAll('table tr'));
            // td[1] = evrak adı (link text), tire sonrasını temizle
            const docs = rows.map(r => {
                const td = r.querySelectorAll('td')[1];
                if (!td) return { raw: '', sig: false, mag: false };
                const raw = td.innerText.toLocaleLowerCase('tr-TR').replace(/-\s*$/, '').trim();
                return { raw, sig: raw.includes('sigortalı') || raw.includes('sigortali'), mag: raw.includes('mağdur') || raw.includes('magdur'), };
            }).filter(d => d.raw !== '');
            const has = (keys, onlySig = false, onlyMag = false) => docs.some(d => { if (onlySig && !d.sig) return false; if (onlyMag && !d.mag) return false; return keys.some(k => d.raw.includes(k)); });
            // Kaza evrakı türünü tespit et
            const isKTT = has(["kaza tesbit", "kaza tespit", "ktt", "anlasmali kaza", "anlaşmalı kaza"]), isZabit = has(["zabt", "zabit", "zabıt", "karakol", "ifade", "görgü", "polis", "jandarma"]), isBeyan = has(["beyan"]);
            container.innerHTML = '';
            const createBox = (text, ok, isOptional = false) => {
                const div = document.createElement('div');
                let borderColor, bgColor, textColor;
                if (isOptional && ok) { borderColor = '#ffc107'; bgColor = 'rgba(255,193,7,0.15)'; textColor = '#ffe082'; }
                else { borderColor = ok ? '#28a745' : '#dc3545'; bgColor = ok ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)'; textColor = ok ? '#85ff9e' : '#ff8585'; }
                div.style.cssText = `padding:4px 5px; border-radius:4px; font-size:11px; font-weight:600; text-align:center;
                    transition:all 0.3s; border-right:4px solid ${borderColor}; background:${bgColor};
                    color:${textColor}; margin-bottom:2px; box-shadow:0 2px 4px rgba(0,0,0,0.2);`;
                div.innerText = (ok ? '' : '⚠ ') + text.toUpperCase();
                return div;
            };
            const createSep = (label) => {
                const div = document.createElement('div');
                div.style.cssText = 'color:#fff; font-size:9px; text-align:center; padding:3px 0 1px; letter-spacing:.05em; border-top:1px solid #333; margin-top:2px;';
                div.innerText = '─── ' + label + ' ───';
                return div;
            };
            // ── KAZA TÜRÜ ────────────────────────────────────────
            let kazaTuru = '', kazaOk = false;
            if (isKTT) { kazaTuru = 'KTT'; kazaOk = true; }
            else if (isZabit) { kazaTuru = 'ZABİT'; kazaOk = true; }
            else if (isBeyan) { kazaTuru = 'BEYAN'; kazaOk = true; }
            else { kazaTuru = 'KAZA EVRAĞI YOK'; kazaOk = false; }
            container.appendChild(createBox('KAZA ŞEKLİ: ' + kazaTuru, kazaOk));
            // ── SİGORTALI EVRAK ──────────────────────────────────
            container.appendChild(createSep('SİGORTALI'));
            const sigEhliyet = has(['ehliyet', 'sürücü belgesi'], true, false), sigRuhsat = has(['ruhsat'], true, false), sigKimlik = has(['kimlik', 'nüfus', 'pasaport'], true, false);
            container.appendChild(createBox('Ehliyet', sigEhliyet));
            container.appendChild(createBox('Ruhsat', sigRuhsat));
            if (sigKimlik) container.appendChild(createBox('Kimlik', true));
            // ── MAĞDUR EVRAK ─────────────────────────────────────
            container.appendChild(createSep('MAĞDUR'));
            const magEhliyet = has(['ehliyet', 'sürücü belgesi'], false, true), magRuhsat = has(['ruhsat'], false, true), magKimlik = has(['kimlik', 'nüfus', 'pasaport'], false, true);
            container.appendChild(createBox('Ehliyet', magEhliyet));
            container.appendChild(createBox('Ruhsat', magRuhsat));
            if (magKimlik) container.appendChild(createBox('Kimlik', true));
            // Zabit ise alkol zorunlu
            if (isZabit) { const alkol = has(['alkol']); container.appendChild(createBox('Alkol Raporu', alkol)); }
            // ── OPSİYONEL ────────────────────────────────────────
            const optionals = [
                { keys: ['poliçe', 'police'], l: 'Poliçe' },
                { keys: ['ibraname', 'ibra', 'temlik'], l: 'İbraname/İbra' },
                { keys: ['teslim ibra'], l: 'Teslim İbra' },
                { keys: ['faaliyet belgesi'], l: 'Faaliyet Belgesi' },
                { keys: ['hasar bildirim', 'taahhüt'], l: 'Hasar Bildirim' },
                { keys: ['fatura'], l: 'Fatura' },
                { keys: ['tramer', 'kusur', 'sbm'], l: 'Tramer/Kusur' },
                { keys: ['eksper', 'ön rapor', 'on rapor'], l: 'Eksper Raporu' },
                { keys: ['vergi levhası'], l: 'Vergi Levhası' },
                { keys: ['imza sirküsü'], l: 'İmza Sirküsü' },
                { keys: ['ticaret sicil'], l: 'Ticaret Sicil' },
                { keys: ['ihbar föyü'], l: 'İhbar Föyü' },
                { keys: ['ssk', 'kurumu'], l: 'SSK Bildirimi' },
                { keys: ['vekaletname', 'vekalet'], l: 'Vekaletname' },
            ];
            const foundOptionals = optionals.filter(o => has(o.keys));
            if (foundOptionals.length) { container.appendChild(createSep('DİĞER')); foundOptionals.forEach(o => container.appendChild(createBox(o.l, true, true))); }
            // ── HEADER DURUM ─────────────────────────────────────
            const zorunluTamam = kazaOk && sigEhliyet && sigRuhsat && magEhliyet && magRuhsat && (!isZabit || has(['alkol']));
            statusHeader.innerText = zorunluTamam ? 'EVRAK TAMAM ✓' : 'EKSİK EVRAK VAR';
            statusHeader.style.color = zorunluTamam ? '#28a745' : '#dc3545';
        }
        const runner = setInterval(() => { if (document.querySelector('table')) updatePanel(); }, 2000);
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btn-toplu-indir-evrak') {

                // onayNo — birden fazla kaynaktan dene
                const onayNo =
                    document.querySelector('input[name="ONAY_NO"]')?.value ||
                    window.location.search.match(/ONAY_NO=([^&]+)/)?.[1] ||
                    document.querySelector('a[href*="ONAY_NO"],[onclick*="ONAY_NO"]')
                        ?.getAttribute('href')?.match(/ONAY_NO=([^&'"]+)/)?.[1] ||
                    (() => {
                        for (const a of document.querySelectorAll('a')) {
                            const h = a.getAttribute('href') || a.getAttribute('onclick') || '';
                            const m = h.match(/ONAY_NO=([^&'")\s]+)/);
                            if (m) return m[1];
                        }
                        return '';
                    })();
                if (!onayNo) { alert('ONAY_NO bulunamadı!'); return; }

                // upload.php base path'i otomatik tespit
                const uploadHref =
                    document.querySelector('a[href*="upload.php"],[onclick*="upload.php"]')
                        ?.getAttribute('href') ||
                    document.querySelector('a[href*="upload.php"],[onclick*="upload.php"]')
                        ?.getAttribute('onclick') || '';
                const uploadPathMatch = uploadHref.match(/['"(]([^'"()]*upload\.php)/);
                const uploadBase = uploadPathMatch ? uploadPathMatch[1].replace(/upload\.php.*$/, '') : 'eks/pic_db/';

                // Evrak satırlarını topla:
                // Her satır: sil linki var, td[4]=dosyaadı (sil linkinden sonraki örüntü)
                // Satır yapısı: no | ad | tip | boyut | dosyaadı | tarih | _ | sil
                const fileEntries = [];
                document.querySelectorAll('a[href*="photo_sil.php"],[onclick*="photo_sil.php"]')
                    .forEach(silLink => {
                        const row = silLink.closest('tr');
                        if (!row) return;
                        const tds = row.querySelectorAll('td');
                        if (tds.length < 6) return;
                        const href = silLink.getAttribute('href') || silLink.getAttribute('onclick') || '';
                        const idMatch = href.match(/ID=(\d+)/i);
                        if (!idMatch) return;
                        const id = idMatch[1];
                        // td[0]=no, td[1]=ad, td[2]=tip, td[3]=boyut, td[4]=dosyaadı, td[5]=tarih
                        const adText = tds[1]?.innerText?.trim() || '';
                        const dosyaAdi = tds[4]?.innerText?.trim() || (id + '.jpg');
                        // kategori adını dosya adından önce ekle (ad - dosyaadi)
                        const label = adText ? adText.split('-')[0].trim() : '';
                        const rawName = label ? `${label} - ${dosyaAdi}` : dosyaAdi;
                        fileEntries.push({ id, rawName, dosyaAdi });
                    });

                if (!fileEntries.length) { alert('İndirilecek evrak bulunamadı!'); return; }
                if (!confirm(`Toplam ${fileEntries.length} evrak indirilecek. Emin misiniz?`)) return;

                const btn = document.getElementById('btn-toplu-indir-evrak');
                btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed';
                const statusHeader = document.getElementById('panelContent');
                const container = document.querySelector('.ks-grid-container');
                const toplam = fileEntries.length;

                container.innerHTML = `
        <div id="indir-pt" style="color:#85ff9e;font-size:11px;font-weight:bold;text-align:center;margin-bottom:4px;">0 / ${toplam} indirildi</div>
        <div style="background:rgba(255,255,255,0.1);border-radius:6px;overflow:hidden;height:10px;width:100%;">
            <div id="indir-pb" style="height:100%;width:0%;background:linear-gradient(90deg,#1a6e3c,#27ae60);border-radius:6px;transition:width 0.3s ease;"></div>
        </div>
        <div id="indir-log" style="margin-top:6px;max-height:120px;overflow-y:auto;font-size:9px;color:#aaa;"></div>
    `;
                statusHeader.innerText = 'İNDİRİLİYOR...';
                statusHeader.style.color = '#27ae60';

                let tamamlanan = 0, hatali = 0;

                const updateProgress = (ad, success) => {
                    tamamlanan++;
                    const pb = document.getElementById('indir-pb');
                    const pt = document.getElementById('indir-pt');
                    const log = document.getElementById('indir-log');
                    if (pb) pb.style.width = Math.round((tamamlanan / toplam) * 100) + '%';
                    if (pt) pt.innerText = `${tamamlanan} / ${toplam} indirildi`;
                    if (log) {
                        const line = document.createElement('div');
                        line.style.cssText = `color:${success ? '#85ff9e' : '#ff8585'};padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.05);`;
                        line.innerText = (success ? '✓ ' : '✗ ') + ad;
                        log.insertBefore(line, log.firstChild);
                    }
                    if (tamamlanan === toplam) {
                        if (pb) pb.style.background = hatali > 0
                            ? 'linear-gradient(90deg,#e67e22,#f39c12)'
                            : 'linear-gradient(90deg,#1a6e3c,#2ecc71)';
                        setTimeout(() => {
                            statusHeader.innerText = hatali > 0
                                ? `${toplam - hatali} indirildi, ${hatali} hata`
                                : `${toplam} EVRAK İNDİRİLDİ ✓`;
                            statusHeader.style.color = hatali > 0 ? '#f39c12' : '#2ecc71';
                            btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer';
                        }, 400);
                    }
                };

                const downloadNext = async (index) => {
                    if (index >= fileEntries.length) return;
                    const { id, rawName, dosyaAdi } = fileEntries[index];
                    try {
                        // ADIM 1: upload.php'den hash'i çek (IMAGE=2 evrak için)
                        const uploadUrl = `${uploadBase}upload.php?act=upd&id=${id}&ONAY_NO=${onayNo}&silindi=0&IMAGE=2`;
                        const pageRes = await fetch(uploadUrl, { credentials: 'include' });
                        const pageHtml = await pageRes.text();

                        const hashMatch = pageHtml.match(/dosyaHash=([a-f0-9]{32})/i);
                        if (!hashMatch) throw new Error('hash bulunamadı');
                        const hash = hashMatch[1];

                        // photo.php base path'i upload sayfasından tespit et
                        const photoPathMatch = pageHtml.match(/(\/[^'"]*photo\.php)/);
                        const photoBase = photoPathMatch
                            ? photoPathMatch[1].replace(/photo\.php.*$/, '')
                            : uploadBase;

                        // ADIM 2: dosyayı indir (IMAGE=2)
                        const fileUrl = `${photoBase}photo.php?id=${id}&ratio=&ONAY_NO=${onayNo}&IMAGE=2&dosyaHash=${hash}`;
                        const fileRes = await fetch(fileUrl, { credentials: 'include' });
                        if (!fileRes.ok) throw new Error('HTTP ' + fileRes.status);
                        const blob = await fileRes.blob();
                        if (blob.size === 0) throw new Error('boş dosya');

                        // uzantı: önce dosyaAdi'nden al, yoksa Content-Type'tan
                        let fileName = rawName;
                        if (!dosyaAdi.includes('.')) {
                            const mime = fileRes.headers.get('content-type') || '';
                            fileName += mime.includes('pdf') ? '.pdf' : '.jpg';
                        }

                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = fileName;
                        document.body.appendChild(a); a.click();
                        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
                        updateProgress(fileName, true);
                    } catch (err) {
                        hatali++;
                        updateProgress(rawName + ' (' + err.message + ')', false);
                    }
                    setTimeout(() => downloadNext(index + 1), 800);
                };

                downloadNext(0);
                return;
            }
            if (e.target.id !== 'btn-toplu-sil') return;
            const silLinks = Array.from(document.querySelectorAll('a[href*="photo_sil.php"]'));
            if (!silLinks.length) { alert('Silinecek kayıt bulunamadı!'); return; }
            if (!confirm(`Toplam ${silLinks.length} kayıt silinecek. Emin misiniz?`)) return;
            const btn = document.getElementById('btn-toplu-sil');
            btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed';
            const statusHeader = document.getElementById('panelContent'), container = document.querySelector('.ks-grid-container');
            container.innerHTML = `
                <div id="sil-progress-text" style="color:#ff8585; font-size:11px; font-weight:bold; text-align:center; margin-bottom:4px;">0 / ${silLinks.length} silindi</div>
                <div style="background:rgba(255,255,255,0.1); border-radius:6px; overflow:hidden; height:10px; width:100%;">
                    <div id="sil-progress-bar" style="height:100%; width:0%; background:linear-gradient(90deg,#c0392b,#e74c3c);border-radius:6px; transition:width 0.3s ease;"></div></div>
                <div id="sil-log" style="margin-top:6px; max-height:120px; overflow-y:auto; font-size:9px; color:#aaa;"></div>
            `;
            statusHeader.innerText = 'SİLİNİYOR...';
            statusHeader.style.color = '#e74c3c';
            let blink = true;
            const blinkInterval = setInterval(() => { statusHeader.style.opacity = blink ? '0.4' : '1'; blink = !blink; }, 500);
            const progressText = document.getElementById('sil-progress-text'), progressBar = document.getElementById('sil-progress-bar'), logDiv = document.getElementById('sil-log');
            let tamamlanan = 0; let hatali = 0; const toplam = silLinks.length;
            const animateRow = (row, success) => {
                if (!row) return;
                row.style.transition = 'opacity 0.4s ease, background-color 0.3s ease';
                row.style.backgroundColor = success ? '#1a4a1a' : '#4a1111';
                setTimeout(() => { row.style.opacity = '0'; }, 200);
                setTimeout(() => { row.style.display = 'none'; }, 600);
            };
            const updateProgress = (dosyaAdi, success) => {
                tamamlanan++;
                const yuzde = Math.round((tamamlanan / toplam) * 100); progressBar.style.width = yuzde + '%'; progressText.innerText = `${tamamlanan} / ${toplam} silindi`;
                const logLine = document.createElement('div');
                logLine.style.cssText = `color:${success ? '#85ff9e' : '#ff8585'}; padding:1px 0; border-bottom:1px solid rgba(255,255,255,0.05);`;
                logLine.innerText = (success ? '✓ ' : '✗ ') + (dosyaAdi || 'bilinmeyen');
                logDiv.insertBefore(logLine, logDiv.firstChild);
                if (tamamlanan === toplam) {
                    clearInterval(blinkInterval);
                    statusHeader.style.opacity = '1';
                    progressBar.style.background = hatali > 0 ? 'linear-gradient(90deg, #92531b, #f39c12)' : 'linear-gradient(90deg, #1a4a1a, #2ecc71)';
                    setTimeout(() => {
                        statusHeader.innerText = hatali > 0 ? `${toplam - hatali} silindi, ${hatali} hata` : `${toplam} KAYIT SİLİNDİ ✓`;
                        statusHeader.style.color = hatali > 0 ? '#f39c12' : '#2ecc71';
                        progressText.innerText = 'Sayfa yenileniyor...';
                        setTimeout(() => location.reload(), 1500);
                    }, 400);
                }
            };
            silLinks.forEach(link => {
                const href = link.getAttribute('href'), match = href.match(/photo_sil\.php\?ID=(\d+)/);
                if (!match) { updateProgress('?', false); return; }
                const id = match[1], row = link.closest('tr'), dosyaAdi = row?.querySelectorAll('td')[1]?.innerText?.trim() || id;
                const xhttp = new XMLHttpRequest();
                xhttp.open('POST', '/pic_db/photo_sil.php', true);
                xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhttp.onload = () => { animateRow(row, true); updateProgress(dosyaAdi, true); };
                xhttp.onerror = () => { animateRow(row, false); hatali++; updateProgress(dosyaAdi, false); };
                xhttp.send(`id=${id}&btnEVET=EVET`);
            });
        });
    }
    if (KS_SYSTEM && RESIM && loc("otohasar") && loc("eks_hasar_foto_list.php")) {
        config.width = '150px';
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        if (!panel) return;
        panel.style.setProperty('width', config.width); panel.style.setProperty('min-width', config.width);
        if (document.body.classList.contains('ks-panel-open')) { document.body.style.marginRight = config.width; }
        const panelContent = panel ? panel.querySelector('.ks-content') : null;
        if (panel && panelContent) {
            const headerTitle = panel.querySelector('.ks-header h4'); if (headerTitle) headerTitle.innerText = "Resim Kontrol";
            panelContent.innerHTML = `
	            <div id="panelContent" style="color:#fff; text-align:center; padding:2px; background:rgba(0,0,0,0.2); border-radius:5px; margin-bottom:8px; font-size:11px; font-weight:bold; border:1px solid rgba(255,255,255,0.1);">DURUM TARANIYOR</div>
	            <div class="ks-grid-container" style="display: grid; grid-template-columns: 1fr; gap: 2px; width: 100%;">
	                <div style="color:#aaa; font-size:10px; text-align:center;">Tablo verileri bekleniyor...</div>
	            </div>
	            <hr class="custom-line">
	            <div class="ks-tooltip-container" style="width:100%; display:block;">
	                <button id="btn-toplu-sil" class="ks-btn" style="background:#c0392b; border:0; border-radius:4px; cursor:pointer; padding:3px 4px; font-size:11px; width:100%; display:block; box-sizing:border-box;">🗑️ TÜMÜNÜ SİL</button>
	                <div class="ks-tooltip-box" style="display:none; border-color:#c0392b;"><strong>Toplu Silme</strong><br>Sayfadaki tüm kayıtları tek onay ile siler.</div>
	            </div>
	            <div class="ks-tooltip-container" style="width:100%; display:block; margin-bottom:4px;">
	                <button id="btn-toplu-indir-evrak" class="ks-btn" style="background:#1a6e3c; border:0; border-radius:4px; cursor:pointer; padding:3px 4px; font-size:11px; width:100%; display:block; box-sizing:border-box; color:#fff;">⬇️ HEPSİNİ İNDİR</button>
	                <div class="ks-tooltip-box" style="display:none; border-color:#1a6e3c;"><strong>Tüm Evrakları İndir</strong><br>PDF ve resim dahil tüm evrakları indirir.</div>
	            </div>
	        `;
        }
        function updatePhotoPanel() {
            const container = document.querySelector('.ks-grid-container'), statusHeader = document.getElementById('panelContent');
            if (!container) return;
            const rows = Array.from(document.querySelectorAll('table tr'));
            const uploadedCategories = rows.map(r => { const tds = r.querySelectorAll('td'); if (tds.length < 4) return ''; return tds[3].innerText.toLocaleUpperCase('tr-TR').trim().split('-')[0].trim(); }).filter(t => t !== '');
            const requiredPhotos = [
                { label: "OLAY YERİ", keys: ["OLAY YERİ"], zorunlu: true },
                { label: "1.EKSPERTİZ", keys: ["1.EKSPERTİZ"], zorunlu: true },
                { label: "1.ONARIM KONTROLÜ", keys: ["1.ONARIM KONTROLÜ"], zorunlu: true },
                { label: "2.EKSPERTİZ", keys: ["2.EKSPERTİZ"], zorunlu: false },
                { label: "3.EKSPERTİZ", keys: ["3.EKSPERTİZ"], zorunlu: false },
                { label: "4.EKSPERTİZ", keys: ["4.EKSPERTİZ"], zorunlu: false },
                { label: "5.EKSPERTİZ", keys: ["5.EKSPERTİZ"], zorunlu: false },
                { label: "2.ONARIM KONTROLÜ", keys: ["2.ONARIM KONTROLÜ"], zorunlu: false },
                { label: "3.ONARIM KONTROLÜ", keys: ["3.ONARIM KONTROLÜ"], zorunlu: false },
                { label: "4.ONARIM KONTROLÜ", keys: ["4.ONARIM KONTROLÜ"], zorunlu: false },
                { label: "5.ONARIM KONTROLÜ", keys: ["5.ONARIM KONTROLÜ"], zorunlu: false },
                { label: "KARŞI ARAÇ", keys: ["KARŞI ARAÇ"], zorunlu: false },
                { label: "1.HASAR", keys: ["1.HASAR"], zorunlu: false },
                { label: "2.HASAR", keys: ["2.HASAR"], zorunlu: false },
                { label: "3.HASAR", keys: ["3.HASAR"], zorunlu: false },
                { label: "ONARIM ÖNCESİ", keys: ["ONARIM ÖNCESİ"], zorunlu: false },
                { label: "ONARIM SONRASI", keys: ["ONARIM SONRASI"], zorunlu: false },
                { label: "ÇEKİCİ RESİMLERİ", keys: ["CEKICI", "ÇEKİCİ"], zorunlu: false },
            ];
            container.innerHTML = ''; let allFound = true;
            requiredPhotos.forEach(rp => {
                const isFound = uploadedCategories.some(cat => rp.keys.some(key => cat.includes(key.toLocaleUpperCase('tr-TR'))));
                if (!rp.zorunlu && !isFound) return;
                if (rp.zorunlu && !isFound) allFound = false;
                const borderColor = isFound ? '#28a745' : '#dc3545', bgColor = isFound ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)', textColor = isFound ? '#85ff9e' : '#ff8585';
                const div = document.createElement('div');
                div.style.cssText = `padding:4px 5px; border-radius:4px; font-size:11px; font-weight:600; text-align:center; border-right:4px solid ${borderColor};
									background:${bgColor}; color:${textColor}; margin-bottom:2px; box-shadow:0 2px 4px rgba(0,0,0,0.2);`;
                div.innerText = (isFound ? "✓ " : "⚠ ") + rp.label;
                container.appendChild(div);
            });
            statusHeader.innerText = allFound ? "RESİMLER TAMAM" : "EKSİK RESİM VAR";
            statusHeader.style.color = allFound ? "#28a745" : "#dc3545";
        }
        const runner = setInterval(() => { if (document.querySelector('table')) updatePhotoPanel(); }, 2000);
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btn-toplu-indir') {
                // --- onayNo: birden fazla kaynaktan dene ---
                const onayNo =
                    document.querySelector('input[name="ONAY_NO"]')?.value ||
                    window.location.search.match(/ONAY_NO=([^&]+)/)?.[1] ||
                    document.querySelector('a[href*="ONAY_NO"]')?.getAttribute('href')?.match(/ONAY_NO=([^&'"]+)/)?.[1] ||
                    document.querySelector('[href*="ONAY_NO"],[onclick*="ONAY_NO"]')?.getAttribute('onclick')?.match(/ONAY_NO=([^&'"]+)/)?.[1] ||
                    '';
                if (!onayNo) { alert('ONAY_NO bulunamadı!'); return; }
                // --- upload.php path'ini mevcut popup linklerinden otomatik tespit et ---
                const uploadRaw =
                    document.querySelector('a[href*="upload.php"]')?.getAttribute('href') ||
                    document.querySelector('a[onclick*="upload.php"]')?.getAttribute('onclick') || '';
                const uploadPathMatch = uploadRaw.match(/['"(]([^'"()]*upload\.php)/);
                let uploadBase = uploadPathMatch ? uploadPathMatch[1].replace(/upload\.php.*$/, '') : '';
                if (!uploadBase) { uploadBase = window.location.pathname.startsWith('/eks/') ? '/eks/pic_db/' : '/pic_db/'; } else if (!uploadBase.startsWith('/')) { uploadBase = '/' + uploadBase; }

                const fileEntries = [];
                document.querySelectorAll('a[href*="photo_sil.php"]').forEach(silLink => {
                    const row = silLink.closest('tr');
                    if (!row) return;
                    const tds = row.querySelectorAll('td');
                    if (tds.length < 4) return;
                    const idMatch = silLink.getAttribute('href').match(/ID=(\d+)/i);
                    if (!idMatch) return;
                    const id = idMatch[1];
                    const td3 = tds[3]?.innerText || '';
                    const dashIdx = td3.indexOf('-');
                    const rawName = dashIdx >= 0 ? td3.substring(dashIdx + 1).trim() : (id + '.jpg');
                    fileEntries.push({ id, rawName });
                });
                if (!fileEntries.length) { alert('İndirilecek dosya bulunamadı!'); return; }
                if (!confirm(`Toplam ${fileEntries.length} dosya indirilecek. Emin misiniz?`)) return;
                const btn = document.getElementById('btn-toplu-indir');
                btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed';
                const statusHeader = document.getElementById('panelContent');
                const container = document.querySelector('.ks-grid-container');
                const toplam = fileEntries.length;
                container.innerHTML = `
	            <div id="indir-pt" style="color:#85ff9e;font-size:11px;font-weight:bold;text-align:center;margin-bottom:4px;">0 / ${toplam} indirildi</div>
	            <div style="background:rgba(255,255,255,0.1);border-radius:6px;overflow:hidden;height:10px;width:100%;">
	                <div id="indir-pb" style="height:100%;width:0%;background:linear-gradient(90deg,#1a6e3c,#27ae60);border-radius:6px;transition:width 0.3s ease;"></div>
	            </div>
	            <div id="indir-log" style="margin-top:6px;max-height:120px;overflow-y:auto;font-size:9px;color:#aaa;"></div>
	        `;
                statusHeader.innerText = 'İNDİRİLİYOR...';
                statusHeader.style.color = '#27ae60';
                let tamamlanan = 0, hatali = 0;
                const updateProgress = (dosyaAdi, success) => {
                    tamamlanan++;
                    const pb = document.getElementById('indir-pb');
                    const pt = document.getElementById('indir-pt');
                    const log = document.getElementById('indir-log');
                    if (pb) pb.style.width = Math.round((tamamlanan / toplam) * 100) + '%';
                    if (pt) pt.innerText = `${tamamlanan} / ${toplam} indirildi`;
                    if (log) {
                        const line = document.createElement('div');
                        line.style.cssText = `color:${success ? '#85ff9e' : '#ff8585'};padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.05);`;
                        line.innerText = (success ? '✓ ' : '✗ ') + dosyaAdi;
                        log.insertBefore(line, log.firstChild);
                    }
                    if (tamamlanan === toplam) {
                        if (pb) pb.style.background = hatali > 0 ? 'linear-gradient(90deg,#e67e22,#f39c12)' : 'linear-gradient(90deg,#1a6e3c,#2ecc71)';
                        setTimeout(() => {
                            statusHeader.innerText = hatali > 0
                                ? `${toplam - hatali} indirildi, ${hatali} hata`
                                : `${toplam} DOSYA İNDİRİLDİ ✓`;
                            statusHeader.style.color = hatali > 0 ? '#f39c12' : '#2ecc71';
                            btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer';
                        }, 400);
                    }
                };
                const downloadNext = async (index) => {
                    if (index >= fileEntries.length) return;
                    const { id, rawName } = fileEntries[index];
                    try {
                        // ADIM 1: upload.php'den hash'i çek (path otomatik tespit edildi)
                        const uploadUrl = `${uploadBase}upload.php?act=upd&id=${id}&ONAY_NO=${onayNo}&silindi=0&IMAGE=1`;
                        const pageRes = await fetch(uploadUrl, { credentials: 'include' });
                        const pageHtml = await pageRes.text();
                        // hash'i bul
                        const hashMatch = pageHtml.match(/dosyaHash=([a-f0-9]{32})/i);
                        if (!hashMatch) throw new Error('hash bulunamadı');
                        const hash = hashMatch[1];
                        // photo.php path'ini de upload sayfasından otomatik tespit et
                        const photoPathMatch = pageHtml.match(/(\/[^'"]*photo\.php)/);
                        const photoBase = photoPathMatch ? photoPathMatch[1].replace(/photo\.php.*$/, '') : uploadBase;
                        // ADIM 2: dosyayı indir
                        const fileUrl = `${photoBase}photo.php?id=${id}&ratio=&ONAY_NO=${onayNo}&IMAGE=&dosyaHash=${hash}`;
                        const fileRes = await fetch(fileUrl, { credentials: 'include' });
                        if (!fileRes.ok) throw new Error('HTTP ' + fileRes.status);
                        const blob = await fileRes.blob();
                        if (blob.size === 0) throw new Error('boş dosya');
                        const mime = fileRes.headers.get('content-type') || '';
                        let fileName = rawName;
                        if (!rawName.includes('.')) { fileName += mime.includes('pdf') ? '.pdf' : '.jpg'; }
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = fileName;
                        document.body.appendChild(a); a.click();
                        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
                        updateProgress(fileName, true);
                    } catch (err) { hatali++; updateProgress(rawName + ' (' + err.message + ')', false); }
                    setTimeout(() => downloadNext(index + 1), 800);
                };
                downloadNext(0);
                return;
            }
            if (e.target.id == 'btn-toplu-sil') {
                const silLinks = Array.from(document.querySelectorAll('a[href*="photo_sil.php"]'));
                if (!silLinks.length) { alert('Silinecek resim bulunamadı!'); return; }
                if (!confirm(`Toplam ${silLinks.length} adet fotoğraf sistemden silinecek. Emin misiniz?`)) return;
                const btn = document.getElementById('btn-toplu-sil');
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                const statusHeader = document.getElementById('panelContent'), container = document.querySelector('.ks-grid-container');
                container.innerHTML = `
	            <div id="sil-progress-text" style="color:#ff8585; font-size:11px; font-weight:bold; text-align:center; margin-bottom:4px;"> 0 / ${silLinks.length} silindi </div>
	            <div style="background:rgba(255,255,255,0.1); border-radius:6px; overflow:hidden; height:10px; width:100%;">
	                <div id="sil-progress-bar" style="height:100%; width:0%; background:linear-gradient(90deg,#c0392b,#e74c3c); border-radius:6px; transition:width 0.3s ease;"></div>
	            </div>
	            <div id="sil-log" style="margin-top:6px; max-height:120px; overflow-y:auto; font-size:9px; color:#aaa;"></div>
	        `;
                statusHeader.innerText = 'SİLİNİYOR...';
                statusHeader.style.color = '#e74c3c';
                let blink = true;
                const blinkInterval = setInterval(() => { statusHeader.style.opacity = blink ? '0.4' : '1'; blink = !blink; }, 500);
                const progressText = document.getElementById('sil-progress-text'), progressBar = document.getElementById('sil-progress-bar'), logDiv = document.getElementById('sil-log');
                let tamamlanan = 0; let hatali = 0; const toplam = silLinks.length;
                const animateRow = (row, success) => {
                    if (!row) return;
                    row.style.transition = 'opacity 0.4s ease, background-color 0.3s ease';
                    row.style.backgroundColor = success ? '#1a4a1a' : '#4a1111';
                    setTimeout(() => { row.style.opacity = '0'; }, 200);
                    setTimeout(() => { row.style.display = 'none'; }, 600);
                };
                const updateProgress = (dosyaAdi, success) => {
                    tamamlanan++;
                    const yuzde = Math.round((tamamlanan / toplam) * 100);
                    progressBar.style.width = yuzde + '%';
                    progressText.innerText = `${tamamlanan} / ${toplam} silindi`;
                    const logLine = document.createElement('div');
                    logLine.style.cssText = `color:${success ? '#85ff9e' : '#ff8585'}; padding:1px 0; border-bottom:1px solid rgba(255,255,255,0.05);`;
                    logLine.innerText = (success ? '✓ ' : '✗ ') + (dosyaAdi || 'bilinmeyen');
                    logDiv.insertBefore(logLine, logDiv.firstChild);
                    if (tamamlanan === toplam) {
                        clearInterval(blinkInterval);
                        statusHeader.style.opacity = '1';
                        progressBar.style.background = hatali > 0 ? 'linear-gradient(90deg,#e67e22,#f39c12)' : 'linear-gradient(90deg,#27ae60,#2ecc71)';
                        setTimeout(() => {
                            statusHeader.innerText = hatali > 0 ? `${toplam - hatali} silindi, ${hatali} hata` : `${toplam} ADET SİLİNDİ ✓`;
                            statusHeader.style.color = hatali > 0 ? '#f39c12' : '#2ecc71'; progressText.innerText = 'Sayfa yenileniyor...'; setTimeout(() => location.reload(), 1500);
                        }, 400);
                    }
                };
                silLinks.forEach(link => {
                    const href = link.getAttribute('href'), match = href.match(/pic_db\/photo_sil\.php\?ID=(\d+)/);
                    if (!match) { updateProgress('?', false); return; }
                    const id = match[1], row = link.closest('tr'), dosyaAdi = row?.querySelectorAll('td')[3]?.innerText?.split('-')[1]?.trim() || id;
                    const deleteUrl = `pic_db/photo_sil.php?ID=${id}&id=${id}&btnEVET=EVET&islem=sil&onay=1`;
                    fetch(deleteUrl, { method: 'GET', referrer: window.location.href }).then(() => { animateRow(row, true); updateProgress(dosyaAdi, true); }).catch(() => { animateRow(row, false); hatali++; updateProgress(dosyaAdi, false); });
                });
            }
            else return;
        });
    }
    // Sayfa bildirim öldürücü
    if (KS_SYSTEM && BILDIRIM && loc("otohasar") && loc("eks_hasar.php")) {
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
            w.tmNotifyTimeout = setTimeout(() => { if (document.getElementById('tm-notify-bar')) { document.getElementById('tm-notify-bar').style.opacity = '0'; } }, 3000);
        };
        const rawAlert = w.alert.bind(w), rawConfirm = w.confirm.bind(w), rawPrompt = w.prompt.bind(w);
        // Alert Override
        w.alert = function (message) {
            notificationCounts[message] = (notificationCounts[message] || 0) + 1;
            if (notificationCounts[message] > MAX_ALLOWED) { console.warn("[Tampermonkey] Alert engellendi:", message); showTopNotification(message, notificationCounts[message]); return; }
            return rawAlert(message);
        };
        // Confirm Override
        w.confirm = function (message) {
            notificationCounts[message] = (notificationCounts[message] || 0) + 1;
            if (notificationCounts[message] > MAX_ALLOWED) { console.warn("[Tampermonkey] Confirm otomatik onaylandı:", message); showTopNotification(message, notificationCounts[message]); return true; }
            return rawConfirm(message);
        };
        // Prompt Override
        w.prompt = function (message, defaultValue) {
            notificationCounts[message] = (notificationCounts[message] || 0) + 1;
            if (notificationCounts[message] > MAX_ALLOWED) { console.warn("[Tampermonkey] Prompt otomatik geçildi:", message); showTopNotification(message, notificationCounts[message]); return defaultValue || ""; }
            return rawPrompt(message, defaultValue);
        };
        console.log("Tampermonkey: Bildirim kontrolü ve override işlemleri tamamlandı.");
    }
    // Giriş Sayfa oto doldurucu
    if (KS_SYSTEM && LOGIN && loc("otohasar") && loc("loginfrm.php")) {
        const fillAction = () => {
            const el = document.querySelector('input#customer_code');
            if (el && el.value !== '2851') { el.value = '2851';['click', 'focus', 'input', 'change', 'blur'].forEach(type => { el.dispatchEvent(new Event(type, { bubbles: true })); }); }
        };
        const runner = setInterval(fillAction, 250); window.addEventListener('load', () => { setTimeout(() => clearInterval(runner), 4000); });
        document.addEventListener('readystatechange', () => { if (document.readyState === 'complete') fillAction(); });
    }
    // Sbm Hızlı Seçim
    if (KS_SYSTEM && SBM && loc("online.sbm.org.tr/trm-police/genelSorguEksper")) {
        GM_addStyle(`
	        #hizli-secim-paneli {
	            display:flex!important; flex-wrap:wrap!important; align-items:center!important;
	            gap:10px!important; width:100%!important; margin-bottom:25px!important;
	            padding:16px!important; box-sizing:border-box!important; position:relative!important;
	            background:linear-gradient(135deg,#fff 0%,#f8fafc 100%)!important;
	            border:1px solid #e2e8f0!important; border-radius:16px!important;
	            box-shadow:0 10px 25px -5px rgba(0,0,0,.05),0 8px 10px -6px rgba(0,0,0,.05)!important;
	        }
	        #hizli-secim-paneli::before {
	            content:""!important; position:absolute!important; left:0!important;
	            top:15%!important; height:70%!important; width:4px!important;
	            background:linear-gradient(to bottom,#6366f1,#3b82f6)!important; border-radius:0 4px 4px 0!important;
	        }
	        .hizli-btn {
	            border:1px solid rgba(255,255,255,.15)!important; color:#fff!important;
	            padding:9px 16px!important; margin:0!important; cursor:pointer!important;
	            border-radius:10px!important; font-weight:600!important; font-size:12.5px!important;
	            letter-spacing:.5px!important; text-transform:uppercase!important;
	            font-family:'Inter',system-ui,-apple-system,sans-serif!important;
	            display:inline-flex!important; align-items:center!important; justify-content:center!important;
	            box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06)!important;
	            transition:all .25s cubic-bezier(.4,0,.2,1)!important;
	            background-image:linear-gradient(rgba(255,255,255,.12),rgba(0,0,0,.05))!important;
	        }
	        .hizli-btn:hover {
	            transform:translateY(-3px) scale(1.02)!important; filter:brightness(1.1)!important;
	            box-shadow:0 20px 25px -5px rgba(0,0,0,.15),0 10px 10px -5px rgba(0,0,0,.04)!important;
	            border-color:rgba(255,255,255,.4)!important;
	        }
	        .hizli-btn:active { transform:translateY(1px) scale(.98)!important; box-shadow:0 2px 4px rgba(0,0,0,.1)!important; }
	    `);
        const SIRKETLER = [
            { ad: "AK SİGORTA", kod: "004", renk: "#ea580c" },
            { ad: "ANADOLU", kod: "007", renk: "#005bb7" },
            { ad: "ANKARA", kod: "009", renk: "#2563eb", prefix: "0000017" },
            { ad: "ALLIANZ", kod: "011", renk: "#003781" },
            { ad: "CORPUS", kod: "019", renk: "#8b5e34" },
            { ad: "TÜRKİYE (TS)", kod: "026", renk: "#1e3a8a" },
            { ad: "MAGDEBURGER", kod: "036", renk: "#1d4ed8" },
            { ad: "RAY", kod: "042", renk: "#ed1c24" },
            { ad: "MAPFRE", kod: "050", renk: "#e11d48" },
            { ad: "NİPPON", kod: "051", renk: "#be123c" },
            { ad: "HDI SİGORTA", kod: "054", renk: "#15803d" },
            { ad: "BEREKET", kod: "057", renk: "#0369a1" },
            { ad: "SOMPO", kod: "061", renk: "#c52b1e" },
            { ad: "ORIENT", kod: "106", renk: "#db2777", prefix: "14", urun: "120" },
            { ad: "ATLAS", kod: "108", renk: "#059669" },
            { ad: "QUİCK", kod: "110", renk: "#d1a401", prefix: "20261" },
            { ad: "HEPİYİ", kod: "126", renk: "#7c3aed", prefix: "20263" },
        ].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
        const dispatch = (el, ...events) => events.forEach(ev => { el.dispatchEvent(new Event(ev, { bubbles: true })); if (window.jQuery) jQuery(el).trigger(ev); });
        const init = setInterval(() => {
            const selectBox = document.getElementById('sigortaSirketKod');
            const urunKoduBox = document.getElementById('urunKodu');
            const hasarInput = document.getElementById('hasarDosyaNo');
            const fieldsetBody = document.querySelector('#sorgu-fieldset .fieldset-body');
            // Enter → Arama
            if (hasarInput && !hasarInput.dataset.listenerAdded) {
                hasarInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); document.querySelector('.js-btn--search')?.click(); } });
                hasarInput.dataset.listenerAdded = '1';
            }
            // Panel
            if (!selectBox || !fieldsetBody || document.getElementById('hizli-secim-paneli')) return;
            const container = Object.assign(document.createElement('div'), { id: 'hizli-secim-paneli' });
            SIRKETLER.forEach(s => {
                const btn = Object.assign(document.createElement('button'), { className: 'hizli-btn', type: 'button', textContent: s.ad });
                btn.style.backgroundColor = s.renk;
                btn.onclick = e => {
                    e.preventDefault(); e.stopPropagation();
                    selectBox.value = s.kod;
                    if (s.urun && urunKoduBox) { urunKoduBox.value = s.urun; dispatch(urunKoduBox, 'change'); }
                    if (s.prefix && hasarInput && !hasarInput.value.trim().startsWith(s.prefix)) { hasarInput.value = s.prefix; dispatch(hasarInput, 'input', 'change'); }
                    const r = document.getElementById('eksperAtamaTipi1');
                    if (r) { r.checked = true; dispatch(r, 'change'); }
                    dispatch(selectBox, 'change');
                };
                container.appendChild(btn);
            });
            fieldsetBody.insertBefore(container, fieldsetBody.firstChild);
            clearInterval(init);
        }, 1000);
    }
    // Sbm 3lü sayı bölme
    if (KS_SYSTEM && SBM && (loc("online.sbm.org.tr/trm-ktt/giris") || loc("online.sbm.org.tr/trm-ktt/sirket/listView"))) {
        let lastNum = "";
        const parseDate = s => { const b = s?.split(' ')[0].split('/'); return b?.length === 3 ? new Date(b[2], b[1] - 1, b[0]) : null; };
        const getPanel = () => {
            let p = document.getElementById('sbm-num-panel');
            if (p) return p;
            const style = document.createElement('style');
            style.textContent = `
    	        @media print { #sbm-num-panel { position:absolute!important; top:5px; font-size:17px!important; } }
    	        #sbm-num-panel .copy { cursor:pointer; transition:opacity .2s; }
    	        #sbm-num-panel .copy:active { opacity:.5; }`;
            document.head.appendChild(style);
            p = Object.assign(document.createElement('div'), { id: 'sbm-num-panel' });
            Object.assign(p.style, {
                position: 'fixed', top: '5px', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,.75)', padding: '10px 20px', borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,.2)', textShadow: '0 2px 8px rgba(0,0,0,.2)',
                zIndex: '10000', fontFamily: 'monospace', display: 'none',
                whiteSpace: 'nowrap', fontSize: '22px', textAlign: 'center'
            });
            p.onclick = ({ target: t }) => {
                t = t.closest('.copy');
                if (!t || t.dataset.cd) return;
                const orig = t.innerHTML, raw = t.innerText.replace(/\s/g, '');
                navigator.clipboard.writeText(raw).then(() => {
                    t.dataset.cd = 1; t.textContent = 'Kopyalandı!'; t.style.color = '#28a745';
                    setTimeout(() => { t.innerHTML = orig; t.style.color = 'black'; delete t.dataset.cd; }, 1500);
                });
            };
            return document.body.appendChild(p);
        };
        const updatePanel = num => {
            const p = getPanel();
            let date = '';
            for (const el of document.querySelectorAll('.field-label, label, td')) {
                if (el.innerText?.includes('Son İşlem Tarihi')) {
                    const m = el.closest('.field, .field--output, tr, div')?.innerText.match(/\d{2}\/\d{2}\/\d{4}(\s+\d{2}:\d{2})?/);
                    if (m) { date = m[0]; break; }
                }
            }
            if (!date) date = new Date().toLocaleDateString('tr-TR');
            p.innerHTML = `<span class="copy" style="font-weight:bold;color:black" title="Kopyalamak için tıkla">${num}</span>
    	        <span style="margin:0 15px;color:#666">|</span>
    	        <span style="color:#d9534f;font-weight:bold;font-family:sans-serif">${date}</span>`;
            p.style.display = 'block';
        };
        const checkNum = text => {
            const m = text.match(/\b(\d{17,})\b/);
            if (m) updatePanel(lastNum = m[1].replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
        };
        const processNodes = root => {
            const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            let n;
            while ((n = w.nextNode())) if (/\d{17,}/.test(n.nodeValue)) checkNum(n.nodeValue);
        };
        const analyzePolicies = () => {
            const kazaT = parseDate(document.getElementById('ihbarPoliceSorguBilgileriForm.kazaTarihi')?.value);
            if (!kazaT || isNaN(kazaT)) return;
            document.querySelectorAll('tr.odd, tr.even, tr[class*="selected"]').forEach(row => {
                const m = row.innerText.match(/(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/);
                if (!m) return;
                const [dS, dE] = [parseDate(m[1]), parseDate(m[2])];
                if (!dS || !dE) return;
                const gun = Math.floor((kazaT - dS) / 864e5);
                const color = (kazaT >= dS && kazaT <= dE) ? (gun <= 2 ? '#f8c291' : gun <= 7 ? '#fff3cd' : '#d4edda') : '#f8d7da';
                row.style.setProperty('background-color', color, 'important');
            });
        };
        const obs = new MutationObserver(mutations => {
            obs.disconnect();
            mutations.forEach(({ addedNodes }) => addedNodes.forEach(n => {
                if (n.nodeType === 1) processNodes(n);
                else if (n.nodeType === 3 && /\d{17,}/.test(n.nodeValue)) checkNum(n.nodeValue);
            }));
            analyzePolicies();
            obs.observe(document.body, { childList: true, subtree: true });
        });
        const init = () => { getPanel(); processNodes(document.body); analyzePolicies(); obs.observe(document.body, { childList: true, subtree: true }); };
        document.readyState === 'complete' ? init() : unsafeWindow.addEventListener('load', init);
    }
    // SBM Resim indirme
    if (KS_SYSTEM && SBM && loc("online.sbm.org.tr/trm-ktt/sirket/listShowTutanakResimleriPage.sbm")) {
        const MIN_WIDTH = 300;
        function initSbmDownloadPanel() {
            if (document.getElementById('sbm-download-mini-panel')) return;
            const panel = document.createElement('div');
            panel.id = 'sbm-download-mini-panel';
            Object.assign(panel.style, {
                position: 'fixed', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.9)', borderRadius: '4px', padding: '5px', zIndex: '2147483647', display: 'flex', flexDirection: 'column', gap: '4px', width: '110px', border: '1px solid #555'
            });
            const mainBtn = document.createElement('button');
            mainBtn.innerText = 'RESİMLERİ İNDİR';
            Object.assign(mainBtn.style, { background: '#27ae60', border: '0', borderRadius: '2px', color: "white", cursor: 'pointer', fontWeight: "bold", padding: '6px 2px', fontSize: '10px', width: '100%' });
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
                        if (urlParams.has('id')) { fileName = `tutanak_${urlParams.get('id')}.jpg`; } else if (url.includes('filename=')) { fileName = url.split('filename=')[1].split('&')[0] + ".jpg"; }
                        await forceDownload(url, fileName);
                    }
                }
                mainBtn.innerText = `BİTTİ (${count})`; setTimeout(() => { mainBtn.innerText = 'RESİMLERİ İNDİR'; }, 3000);
            };
            panel.appendChild(mainBtn); document.body.appendChild(panel);
        }
        async function forceDownload(url, fileName) {
            try {
                const response = await fetch(url); const blob = await response.blob();
                const link = document.createElement('a'); link.href = unsafeWindow.URL.createObjectURL(blob); link.download = fileName;
                document.body.appendChild(link); link.click(); document.body.removeChild(link);
                unsafeWindow.URL.revokeObjectURL(link.href);
            } catch (error) { console.error("Resim indirilemedi:", url, error); }
        }
        unsafeWindow.addEventListener('load', initSbmDownloadPanel);
        setTimeout(initSbmDownloadPanel, 2000);
    }
    // SBM Ekran görüntüsü indirme
    if (KS_SYSTEM && SBM && loc("online.sbm.org.tr")) {
        const isSonuc = loc("genelSorguEksper/sonuc.sbm");
        const isDetay = loc("hasarEksper/detay.sbm");
        const isListView = loc("listView.sbm");
        // listView sadece KTT sayfasında çalışsın
        const isKTTList = isListView && (() => { const mainTitle = document.querySelector('.main-title'); return mainTitle && mainTitle.innerText.includes("Kaza Tespit Tutanağı"); })();
        if (isSonuc || isDetay || isKTTList) {
            if (!document.getElementById('sbm-ss-style')) {
                const style = document.createElement('style');
                style.id = 'sbm-ss-style';
                style.innerHTML = '@media print { #sbm-ss-btn { display: none !important; } }';
                document.head.appendChild(style);
            }
            const takeScreenshot = async () => {
                const btn = document.getElementById('sbm-ss-btn');
                const myP = document.getElementById('tramer-panel');
                if (!btn) return;
                if (typeof html2canvas === 'undefined') {
                    await new Promise(r => {
                        const s = document.createElement('script');
                        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                        s.onload = r;
                        document.head.appendChild(s);
                    });
                }
                window.scrollTo({ top: 0, behavior: 'instant' });
                await new Promise(r => setTimeout(r, 100));
                btn.style.display = 'none';
                if (myP) myP.style.display = 'none';
                const ksGlobal = document.getElementById('ks-global-status-indicator');
                if (ksGlobal) ksGlobal.style.display = 'none';
                try {
                    const scrollHeight = Math.max(
                        document.documentElement.scrollHeight,
                        document.body.scrollHeight,
                        document.documentElement.offsetHeight
                    );
                    // Her sayfa için y offset ve kaldırılacak elemanlar
                    const yOffset = isDetay ? 70 : isKTTList ? 0 : 190;
                    const canvas = await html2canvas(document.body, {
                        y: yOffset, x: 0, height: scrollHeight - yOffset, useCORS: false, allowTaint: true, backgroundColor: "#ffffff", scale: 1, logging: false, windowHeight: scrollHeight,
						onclone: (clonedDoc) => {
                            clonedDoc.body.style.cssText = "background:#fff;height:auto;overflow:visible;";
                            const removeSelectors = [
                                '.polite__alert', '#ks-global-status-indicator', '.cc-window',
                                '#sbm-ss-btn', '#tramer-panel', '.ui-draggable-handle',
                                // KTT listesi için ek temizlik
                                ...(isKTTList ? ['.dropdown--user', '#menuArama'] : [])
                            ].join(',');
                            clonedDoc.querySelectorAll(removeSelectors).forEach(e => e.remove());
                        }
                    });
                    let name = "SBM_Rapor";
                    if (isDetay) {
                        // hasarEksper/detay.sbm → KTT No veya Hasar Dosya No
                        const allLabels = [...document.querySelectorAll('td, th, label, span, div')];
                        const getFieldValue = (labelText) => {
                            for (const el of allLabels) {
                                if (el.innerText && el.innerText.trim() === labelText) {
                                    const next = el.nextElementSibling;
                                    if (next && next.innerText) return next.innerText.trim();
                                    const parent = el.parentElement;
                                    if (parent) {
                                        const siblings = [...parent.children];
                                        const idx = siblings.indexOf(el);
                                        if (siblings[idx + 1]) return siblings[idx + 1].innerText.trim();
                                    }
                                }
                            }
                            const bodyText = document.body.innerText;
                            const regex = new RegExp(labelText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[:\\s]+([^\\n]+)');
                            const match = bodyText.match(regex);
                            return match ? match[1].trim() : '';
                        };
                        const hasarNo = getFieldValue('Hasar Dosya No:') || getFieldValue('Hasar Dosya No');
                        const kttNo = getFieldValue('Ktt No:') || getFieldValue('Ktt No');
                        if (kttNo && kttNo.length > 1) { name = `${kttNo}_Hasar_Detay`; } else if (hasarNo) { name = `${hasarNo}_Hasar_Detay`; } else { name = "Hasar_Detay"; }
                    } else if (isKTTList) {
                        // listView.sbm KTT → ihbar no veya plaka/dosya no
                        const ihbarNo = [...document.querySelectorAll('.field--output')] .find(el => el.querySelector('.field-label')?.innerText.includes('İhbar No')) ?.querySelector('.field-controls')?.innerText.trim();
                        const plakaRaw = document.querySelector( 'td[aria-describedby$="_plakaNo"], .ui-jqgrid-btable td:nth-child(3)' )?.innerText.trim();
                        const dosyaNo = document.querySelector('td[aria-describedby$="_dosyaNo"]') ?.innerText.trim() || "KTT_SORGU";
                        name = ihbarNo ? `${ihbarNo}_KTT_SORGU` : (plakaRaw ? `${plakaRaw}_${dosyaNo}` : dosyaNo);

                    } else {
                        // genelSorguEksper/sonuc.sbm → şasi + sekme adı
                        const shasiRaw = [...document.querySelectorAll('.fieldset-body b')] .find(el => el.innerText.includes('*'))?.innerText.trim();
                        const shasi = shasiRaw ? shasiRaw.replace(/\*/g, '') : '';
                        let rawName = document.querySelector('li.ui-tabs-active a, li[aria-selected="true"] a') ?.innerText.trim().replace(/\s+/g, '_') || "SBM_Rapor";
                        const nameMap = { 'KTT': 'KTT_SBM' };
                        name = shasi ? `${shasi}_${nameMap[rawName] || rawName}` : (nameMap[rawName] || rawName);
                    }
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/jpeg', 0.65);
                    link.download = `${name.replace(/\s+/g, '_')}.jpg`;
                    link.click();
                } catch (err) { console.error("SS Hatası:", err);
                } finally { btn.style.display = 'block'; if (myP) { myP.style.display = 'block'; } if (ksGlobal) { ksGlobal.style.display = 'block'; } }
            };
            const init = () => {
                if (document.getElementById('sbm-ss-btn')) return;
                const btn = document.createElement('button');
                btn.id = 'sbm-ss-btn';
                btn.innerText = '📸 Ekran Görüntüsü Al';
                Object.assign(btn.style, {
                    position: 'fixed', bottom: '10px', right: '10px', zIndex: '1000000',
                    padding: '8px 12px', background: 'black', color: 'white',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                });
                btn.onclick = takeScreenshot;
                document.body.appendChild(btn);
            };
            setTimeout(init, 100);
            setInterval(init, 1000);
        }
    }
    // Sahibinden Ortalama KM Piyasa sorgusu
    if (KS_SYSTEM && SAHIBINDEN && loc("sahibinden.com") && !location.pathname.includes("/ilan/") && !location.pathname.includes("/kategori/")) {
        if (!location.search.includes("pagingSize=50")) { const url = new URL(location.href); url.searchParams.set("pagingSize", "50"); location.replace(url.href); }
        config.width = '150px';
        initPanel();
        const panel = document.getElementById('ks-master-panel');
        if (!panel) return;
        panel.style.setProperty('width', config.width);
        const contentArea = document.querySelector('.ks-content');
        let lastState = "";
        const getPanelTip = () => {
            let tip = document.getElementById('ks-dynamic-tooltip');
            if (!tip) {
                tip = document.createElement('div');
                tip.id = 'ks-dynamic-tooltip';
                Object.assign(tip.style, { zIndex: '99999999', opacity: '0', position: 'fixed', pointerEvents: 'none' });
                tip.innerHTML = '<div class="ks-tip-head"><strong>BİLGİ ANALİZİ</strong></div><div class="ks-tip-body"></div>';
                document.body.appendChild(tip);
            } return tip;
        };
        const bindTooltips = (container) => {
            const panelTip = getPanelTip();
            container.querySelectorAll('[data-tip-head]').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    panelTip.querySelector('strong').innerText = el.getAttribute('data-tip-head');
                    panelTip.querySelector('.ks-tip-body').innerText = el.getAttribute('data-tip-body');
                    panelTip.classList.add('visible');
                    panelTip.style.opacity = '1';
                    panelTip.style.visibility = 'visible';
                });
                el.addEventListener('mousemove', (e) => { panelTip.style.left = (e.clientX + 12) + 'px'; panelTip.style.top = (e.clientY - 34) + 'px'; });
                el.addEventListener('mouseleave', () => { panelTip.classList.remove('visible'); panelTip.style.opacity = '0'; panelTip.style.visibility = 'hidden'; });
            });
        };
        function hesapla() {
        	const getIdx = (n) => { const h = document.querySelectorAll('table thead td, table thead th'); return Array.from(h).findIndex(x => n.some(s => x.innerText.trim().toLowerCase() === s.toLowerCase()) ); };
        	const fIdx = getIdx(['Fiyat', 'Price']), kIdx = getIdx(['KM', 'Mileage']), yIdx = getIdx(['Yıl', 'Year']);
        	const rows = Array.from( document.querySelectorAll('table tbody tr:not(.nativeAd), tr:not(.searchResultsPromoToplist)') )
        	    .map(r => ({ f: parseFloat(r.cells[fIdx]?.innerText.replace(/[^\d]/g, '') || 0), k: parseInt(r.cells[kIdx]?.innerText.replace(/[^\d]/g, '') || 0, 10), y: parseInt(r.cells[yIdx]?.innerText.trim() || 0, 10) }))
        	    .filter(x => x.f > 1000)
        	    .sort((a, b) => a.f - b.f);
        	if (!rows.length) return;
        	const cState = `${rows.length}-${rows[0].f}`;
        	if (lastState === cState) return;
        	lastState = cState;
        	const fmt = v => Number(v || 0).toLocaleString('tr-TR');
        	const avg = (arr, key) => Math.round(arr.reduce((a, b) => a + (b[key] || 0), 0) / arr.length);
        	const median = (arr, key) => {
        	    const vals = arr.map(x => x[key]).sort((a, b) => a - b);
        	    const mid = Math.floor(vals.length / 2);
        	    return vals.length % 2 ? vals[mid] : Math.round((vals[mid - 1] + vals[mid]) / 2);
        	};
        	const avgPrice = avg(rows, 'f'), avgKm = avg(rows, 'k');
        	const medianPrice = median(rows, 'f'), medianKm = median(rows, 'k'), medianYear = median(rows, 'y');
        	const q1 = rows[Math.floor(rows.length * 0.25)]?.f || 0, q3 = rows[Math.floor(rows.length * 0.75)]?.f || 0;
        	const low3 = rows.slice(0, 3), high3 = rows.slice(-3).reverse();
        	const midIdx = Math.max(0, Math.floor(rows.length / 2) - 1);
        	const mid3 = rows.slice(midIdx, midIdx + 3);
        	const deviation = price => (((price - medianPrice) / medianPrice) * 100).toFixed(1);
        	const opportunities = rows.map(x => ({...x,score:((medianPrice - x.f) / medianPrice) * 50 +((medianKm - x.k) / medianKm) * 25 +((x.y - medianYear) / medianYear) * 25})).sort((a, b) => b.score - a.score).slice(0, 3);
        	const avgPricePerKm = Math.round( rows.filter(x => x.k > 0).reduce((a, b) => a + (b.f / b.k), 0) / rows.filter(x => x.k > 0).length );
        	const rowTpl = (x, head) => {
				const dev = deviation(x.f);
				let color = '#4ade80';
				if (dev > 10) color = '#f87171';
        	    else if (dev > 0) color = '#fbbf24';
        	    return `<div
				data-tip-head="${head}" data-tip-body="${x.y} Model | ${fmt(x.k)} KM | ${dev}%" style=" display:flex; justify-content:space-between; font-size:10px; margin-bottom:2px; cursor:help; border-left:2px solid ${color}; padding-left:4px; ">
        	        <span style="color:${color}">${fmt(x.f)}</span>
        	        <span style="color:#aaa">${x.y}</span>
        	    </div>`;
        	};
        	contentArea.innerHTML = `
 			<div style=" text-align:center; background:#444; font-weight:800; font-size:10px; padding:3px; ">SAHİBİNDEN ANALİZ (#${rows.length})<hr>
        	<div style=" margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #333; font-size:10px; ">
        	    <div style="margin-top:2px;">📊 Medyan: <b><br>${fmt(medianPrice)}</b></div>
        	    <div style="margin-top:2px;">💰 Ortalama: <b><br>${fmt(avgPrice)}</b></div>
        	    <div style="margin-top:2px;">🎯 Piyasa:<b><br>${fmt(q1)} - ${fmt(q3)}</b></div>
        	    <div style="margin-top:2px;">🛣️ Ortalama KM: <b><br>${fmt(avgKm)}</b></div>
        	    <div style="margin-top:2px;">⚙️ TL/KM: <b><br>${fmt(avgPricePerKm)}</b></div>
        	    <div style="margin-top:2px;">📈 Aralık:<b><br>${Math.round(((rows[rows.length - 1].f / rows[0].f) - 1) * 100)}%</b></div>
        	</div>
        	<div style=" font-size:9px; font-weight:bold; margin-top:6px; ">▲ EN YÜKSEK </div>${high3.map(x => rowTpl(x, 'EN PAHALI İLANLAR') ).join('')}
        	<div style=" font-size:9px; font-weight:bold; margin-top:6px; ">⚖️ PİYASA </div>${mid3.map(x => rowTpl(x, 'ORTALAMA PİYASA') ).join('')}
        	<div style=" font-size:9px; font-weight:bold; margin-top:6px; ">▼ EN DÜŞÜK </div>${low3.map(x => rowTpl(x, 'EN UCUZ İLANLAR') ).join('')}
        	<!--<div style=" font-size:9px; font-weight:bold; margin-top:4px; ">🔥FIRSAT İLANLAR </div>${opportunities.map(x => rowTpl(x, 'FIRSAT İLANI') ).join('')}-->
			</div>
        	`;
        	bindTooltips(contentArea);
        	}
        const init = () => { if (document.querySelector('table')) { hesapla(); setInterval(hesapla, 3000); } else { setTimeout(init, 500); } }; init();
    }
    // Whatsapp Resim indirme
    if (KS_SYSTEM && WHATSAPP && loc("web.whatsapp.com")) {
        // ── DOSYA ADI ─────────────────────────────────────────────────────────────
        const getFileName = (ext = 'jpeg') => {
            const now = new Date();
            const pad = n => String(n).padStart(2, '0');
            return `WhatsApp Image ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} at ${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}.${ext}`;
        };
        // ── İNDİRME FONKSİYONU — tüm tarayıcılarda çalışır ─────────────────────
        const indir = (url, name) => {
            if (typeof GM_download === 'function') { GM_download({ url, name, saveAs: false, onerror: err => { if (!['not_permitted', 'not_supported'].includes(err.error)) { fetchIndir(url, name); } } }); return; } fetchIndir(url, name);
        };
        // Blob üzerinden indirme — Chrome/Edge/Firefox hepsinde çalışır
        const fetchIndir = async (url, name) => {
            try {
                if (url.startsWith('blob:') || url.startsWith('data:')) { linkIndir(url, name); return; }
                const res = await fetch(url, { mode: 'cors', credentials: 'include' });
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                linkIndir(blobUrl, name);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
            } catch (e) { linkIndir(url, name); }
        };
        const linkIndir = (url, name) => { const a = document.createElement('a'); a.href = url; a.download = name; a.style.display = 'none'; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 1000); };
        // ── STİLLER ───────────────────────────────────────────────────────────────
        const style = document.createElement('style');
        style.textContent = `
            .ks-dl-wrap { position: relative; display: inline-block; }
            .ks-dl-btn {
                position: absolute;
                top: 6px; right: 6px; width: 25px; height: 25px;
                background: rgba(0,0,0,0.55); border: none;
                cursor: pointer;
                display: flex; align-items: center; justify-content: center; opacity: 0;
                transition: opacity 0.18s, background 0.18s, transform 0.15s;
                z-index: 999;
                padding: 0;
                backdrop-filter: blur(2px);
            }
            .ks-dl-wrap:hover .ks-dl-btn,
            .ks-dl-btn:focus { opacity: 1; }
            .ks-dl-btn:hover { background: rgba(0,0,0,0.8); transform: scale(1.1); }
            .ks-dl-btn:active { transform: scale(0.95); }
            .ks-dl-btn svg {
                width: 50px; height: 50px; fill: none; pointer-events: none;
                stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
            }
            .ks-dl-btn.ks-ok { background: rgba(39,174,96,0.85) !important; opacity: 1 !important; }
            .ks-dl-btn.ks-ok svg { stroke: #fff; }
        `;
        document.head.appendChild(style);
        // ── SVG İKONLAR ──────────────────────────────────────────────────────────
        const ikonIndir = `<svg viewBox="0 0 24 24"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="3" x2="12" y2="21"/><polyline points="3 9 3 20 21 20 21 9"/></svg>`;
        const ikonOk = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;
        // ── BUTON OLUŞTUR ─────────────────────────────────────────────────────────
        const butonEkle = (img) => {
            if (img.dataset.ksDl) return;
            img.dataset.ksDl = '1';
            let wrap = img.parentElement;
            if (!wrap.classList.contains('ks-dl-wrap')) {
                wrap = document.createElement('div');
                wrap.className = 'ks-dl-wrap';
                img.parentNode.insertBefore(wrap, img);
                wrap.appendChild(img);
            }
            const btn = document.createElement('button');
            btn.className = 'ks-dl-btn';
            btn.title = 'Resmi İndir';
            btn.innerHTML = ikonIndir;
            btn.addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();
                const src = img.src || img.dataset.src;
                if (!src) return;
                const ext = src.includes('.png') ? 'png' : src.includes('.gif') ? 'gif' : src.includes('.webp') ? 'webp' : 'jpeg';
                indir(src, getFileName(ext));
                btn.innerHTML = ikonOk;
                btn.classList.add('ks-ok');
                setTimeout(() => { btn.innerHTML = ikonIndir; btn.classList.remove('ks-ok'); }, 2000);
            });
            wrap.appendChild(btn);
        };
        // ── ÇIFT TIKLAMA İLE İNDİR ───────────────────────────────────────────────
        document.addEventListener('dblclick', e => {
            const img = e.target.closest('img._ao3e') || (e.target.tagName === 'IMG' ? e.target : e.target.querySelector('img'));
            if (img?.src) { e.stopPropagation(); e.preventDefault(); const ext = img.src.includes('.png') ? 'png' : 'jpeg'; indir(img.src, getFileName(ext)); }
        }, true);
        // ── SAĞ TIK MENÜ ─────────────────────────────────────────────────────────
        document.addEventListener('contextmenu', e => {
            const msg = e.target.closest('.message-out, .message-in');
            if (msg && !['IMG', 'A'].includes(e.target.tagName)) { const btn = msg.querySelector('._ahkm, [role="button"][aria-label*="menu"]'); if (btn) { e.preventDefault(); btn.click(); } }
        }, true);
        // ── RESİMLERE BUTON EKLE — MutationObserver ile canlı takip ──────────────
        const IMG_SELECTOR = 'img._ao3e, img[src*="whatsapp"], img[class*="media"]';
        const taraVeEkle = () => { document.querySelectorAll(IMG_SELECTOR).forEach(img => { if (img.width > 60 && img.height > 60) butonEkle(img); }); };
        new MutationObserver(muts => {
            let eklendi = false;
            muts.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;
                    if (node.matches?.(IMG_SELECTOR)) { eklendi = true; }
                    else if (node.querySelector?.(IMG_SELECTOR)) { eklendi = true; }
                });
            });
            if (eklendi) setTimeout(taraVeEkle, 100);
        }).observe(document.body, { childList: true, subtree: true });
        // İlk tarama
        setTimeout(taraVeEkle, 1000);
        // Sayfa gezilemede tekrar tara
        setInterval(taraVeEkle, 3000);
    }
    // Türkiye Sigorta
    if (KS_SYSTEM && TRSIGORTA && loc("hasaroto.turkiyesigorta.com.tr")) {
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
            .tab-header .tab-button::after, .tab-header .tab-button::before { display: none !important; }
        `;
            document.head.appendChild(style);
        }
        // GENEL DEĞER ATAMA
        function forceUpdateValue(input, value) {
            if (!input) return;
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(unsafeWindow.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(input, value);
            ['input', 'change', 'blur'].forEach(name => { input.dispatchEvent(new Event(name, { bubbles: true })); });
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
                if (fullName.length > 1) { forceUpdateValue(input, fullName); }
            }
        }
        function initGlobalListener() {
            const events = ['mousedown', 'focusin'];
            events.forEach(evtType => { document.addEventListener(evtType, (e) => { if (e.target.classList.contains('dx-texteditor-input')) { setTimeout(() => handleMagicFill(e.target), 250); } }, true); });
        }
        initGlobalListener();
        setInterval(() => { applyModernStyles(); if (document.querySelector('.osem-tab-btn') && !document.getElementById('ts-modern-styles')) { applyModernStyles(); } }, 1000);
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
                        position: 'absolute', top: '10px',
                        right: '20px', zIndex: '999999',
                        backgroundColor: '#ff4d4d', color: 'white',
                        border: 'none', borderRadius: '5px',
                        width: '35px', height: '35px',
                        cursor: 'pointer', fontSize: '18px',
                        fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center'
                    });
                    closeBtn.onclick = function () { overlay.remove(); };
                    const contentArea = overlay.querySelector('.dx-overlay-content');
                    if (contentArea) { if (window.getComputedStyle(contentArea).position === 'static') { contentArea.style.position = 'relative'; } contentArea.appendChild(closeBtn); }
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
                        if (instance) { instance.option("value", targetValue); console.log(`Başarılı: ${nameAttr} -> ${targetValue}`); }
                        else { hiddenInput.value = targetValue; hiddenInput.dispatchEvent(new Event('change', { bubbles: true })); }
                    } catch (e) { console.error("Seçim yapılamadı: ", e); }
                }
            }
        }
        function devExForceSelect(nameAttr, targetId) {
            const inputEl = document.querySelector(`input[name="${nameAttr}"]`); if (!inputEl) return;
            const widgetEl = inputEl.closest('.dx-selectbox'); if (!widgetEl) return;
            try {
                if (window.jQuery) {
                    const $widget = window.jQuery(widgetEl);
                    const instance = $widget.dxSelectBox("instance");
                    if (instance) {
                        instance.option("value", targetId); if (instance.validate) instance.validate();
                        console.log(`${nameAttr} başarıyla set edildi (ID: ${targetId})`); return;
                    }
                }
                inputEl.value = targetId;
                const events = ['change', 'input', 'blur', 'focusout'];
                events.forEach(e => inputEl.dispatchEvent(new Event(e, { bubbles: true })));
            } catch (err) { console.error("DevEx Hatası:", err); }
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
                const b = document.createElement('button'); b.innerText = label; b.type = "button";
                b.style = `padding: 10px 18px; background: ${color}; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);`;
                b.onclick = () => formDoldur(id); container.appendChild(b);
            };
            //eklenecek buton ve özellikleri
            btn('Geliştirme sürecinde', '#1976d2', 4);
            const content = target.querySelector('.dx-form-group-content');
            if (content) target.insertBefore(container, content);
        }
        setTimeout(() => { setInterval(init, 2000); }, 1500);
        const widthfornavbar = "200px", panel_colorite = "rgba(230, 230, 230, 0.95)";
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
            .dx-drawer-wrapper { padding-right: ${widthfornavbar} !important; }
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
			#scroll-to-bottom-btn { bottom: 5px !important; }
			#scroll-to-top-btn { top: 64px !important; }
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
            btn.onclick = () => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); };
            document.body.appendChild(btn);
        }
        function createTopBtn() {
            if (document.getElementById('scroll-to-top-btn')) return;
            const btn = document.createElement('button');
            btn.id = 'scroll-to-top-btn';
            btn.innerHTML = '↑';
            btn.title = 'Sayfa Üstüne Çık';
            btn.onclick = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
            document.body.appendChild(btn);
        }
        // 2. Menü Oluşturma ve Güncelleme Mantığı
        function updateMenu() {
            let panel = document.getElementById('custom-nav-panel');
            if (!panel) { panel = document.createElement('div'); panel.id = 'custom-nav-panel'; document.body.appendChild(panel); }
            createBottomBtn(); createTopBtn();
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
            if (target) { cleanupToasts(); obssserver.observe(target, { childList: true }); clearInterval(startObserver); console.log("Toast Observer aktif edildi."); }
        }, 2000);
    }
    // Quick - Corpus - Anadolu Sigorta
    if (KS_SYSTEM && QCASIGORTA && /quicksigorta\.com|anadolusigorta\.com|corpussigorta\.com/.test(location.href)) {
        const format = v => { v = v.replace(/\D/g, '').substring(0, 8); return v.length > 4 ? v.slice(0, 2) + '.' + v.slice(2, 4) + '.' + v.slice(4) : (v.length > 2 ? v.slice(0, 2) + '.' + v.slice(2) : v); };
        const lockValue = (input, val) => {
            let _v = val;
            const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
            Object.defineProperty(input, 'value', { get: () => _v, set: (nv) => { if (/^\d{2}\.\d{2}\.\d{4}$/.test(nv)) _v = nv; }, configurable: true });
            desc.set.call(input, val);
        };
        const destroyPicker = (input) => {
            const jq = window.jQuery;
            if (input._flatpickr) try { input._flatpickr.destroy(); } catch (e) { }
            if (jq) try { jq(input).datepicker('destroy'); } catch (e) { }
            document.querySelectorAll('.datepicker, .datepicker-dropdown, .flatpickr-calendar').forEach(el => el.remove());
        };
        const applyDateLogic = (input) => {
            if (input.dataset.ksHandled) return;
            input.dataset.ksHandled = 'true';
            const jq = window.jQuery;
            setTimeout(() => (input._flatpickr || (jq && jq(input).data('datepicker'))) && destroyPicker(input), 800);
            input.addEventListener('input', (e) => {
                const pos = input.selectionStart, oldLen = input.value.length;
                input.value = format(input.value);
                const move = input.value.length - oldLen;
                input.setSelectionRange(pos + move, pos + move);
            }, true);
        };
        const fillCategoriesRandomly = (scope = document) => {
            const selects = scope.querySelectorAll('select.part-category-select, select[name^="partCategory"]');
            if (!selects.length) return;
            const jq = window.jQuery;
            selects.forEach((select) => {
                let options = Array.from(select.options).filter(opt => opt.value && opt.value !== "0" && !opt.text.toLowerCase().includes("seçiniz"));
                if (options.length > 0) {
                    const randomOpt = options[Math.floor(Math.random() * options.length)];
                    select.value = randomOpt.value;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    if (jq && jq(select).data('select2')) jq(select).trigger('change');
                }
            });
        };
        const processClipboard = async () => {
            try {
                const text = await navigator.clipboard.readText(), rows = text.split('\n').filter(l => l.trim()).map(line => line.split('\t'));
                const dataMap = new Map();
                rows.forEach(row => {
                    const cleanRow = row.map(item => item.trim());
                    const offset = (cleanRow[0].length <= 3 && !isNaN(cleanRow[0])) ? 1 : 0;
                    const oem = cleanRow[offset];
                    if (oem) { dataMap.set(oem, { ad: cleanRow[offset + 1], miktar: cleanRow[offset + 2], fiyat: cleanRow[offset + 3] }); }
                });
                document.querySelectorAll('tr').forEach(tr => {
                    const oemInp = tr.querySelector('input[name^="oemCode"]');
                    const oemVal = oemInp ? oemInp.value : tr.innerText.match(/\d{5,}/)?.[0];
                    if (oemVal && dataMap.has(oemVal)) {
                        const data = dataMap.get(oemVal);
                        const idx = oemInp ? oemInp.name.match(/\d+/)[0] : "0";
                        const setVal = (name, val) => {
                            const el = tr.querySelector(`input[name="${name}[${idx}]"]`);
                            if (el && val) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
                        };
                        setVal('partName', data.ad); setVal('partQty', data.miktar); setVal('partPrice', data.fiyat); fillCategoriesRandomly(tr);
                    }
                });
            } catch (err) { console.error("Pano hatası:", err); }
        };
        const injectButtons = () => {
            const searchBtn = document.getElementById('searchOemCodes');
            if (searchBtn && !document.getElementById('ks-extra-btns')) {
                const container = document.createElement('span');
                container.id = 'ks-extra-btns';
                container.className = 'ms-2';
                const btn = (txt, clr, fn) => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.className = 'btn btn-sm ms-1';
                    b.style = `background:${clr}; color:#fff; font-weight:bold; border:none; border-radius:4px; padding:5px 10px;`;
                    b.textContent = txt;
                    b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); fn(); };
                    return b;
                };
                container.append(btn('RASGELE DOLDUR', '#dc3545', fillCategoriesRandomly), btn('PANODAN DOLDUR', '#007bff', processClipboard));
                searchBtn.parentNode.appendChild(container);
            }
        };
        const run = () => {
            document.querySelectorAll('input.inputDate, input[name*="date" i]').forEach(applyDateLogic);
            injectButtons();
            const saveBtn = document.getElementById('btnSaveExpertise');
            if (saveBtn && !document.getElementById('btnQuickEntry')) {
                const qb = document.createElement('button');
                qb.id = 'btnQuickEntry';
                qb.className = 'btn btn-sm btn-warning me-1';
                qb.innerHTML = '<i class="fa fa-bolt"></i> Hızlı Giriş';
                saveBtn.parentNode.insertBefore(qb, saveBtn);
            }
        };
        const observer = new MutationObserver(run); observer.observe(document.body, { childList: true, subtree: true }); run();
    }
    if (KS_SYSTEM && ONSBM && loc("sdata_edit.php")) {
        const BASE = window.location.origin;
        // ─── YARDIMCI FONKSİYONLAR ─────────────────────────────────────────────
        function pageId() { return new URLSearchParams(window.location.search).get('id'); }
        function fetchPage(url) { return new Promise((resolve, reject) => { GM_xmlhttpRequest({ method: 'GET', url, onload: r => resolve(r.responseText), onerror: () => reject(new Error(`Yüklenemedi: ${url}`)), }); }); }
        function parseHtml(html) { return new DOMParser().parseFromString(html, 'text/html'); }
        function setField(selector, value, root = document) { const el = root.querySelector(selector); if (!el || !value) { return false; } el.value = value; el.dispatchEvent(new Event('blur')); return true; }
        function setSelect(selector, value) { const el = document.querySelector(selector); if (!el) { return false; } el.value = value; el.dispatchEvent(new Event('change')); return true; }
        function setSelectByText(selector, araText) {
            const el = document.querySelector(selector);
            if (!el || !araText) { return false; }
            const opt = Array.from(el.options).find(o => o.text.trim() === araText.trim());
            if (!opt) { console.warn(`[VeriDoldur] setSelectByText: "${araText}" bulunamadı →`, selector); return false; }
            el.value = opt.value;
            el.dispatchEvent(new Event('change'));
            return true;
        }
        function setReadonly(selector, value) { const el = document.querySelector(selector); if (!el || !value) { return false; } el.value = value; return true; }
        function butonDurum(btn, durum) {
            const DURUMLAR = {
                bekliyor: { metin: 'Verileri Doldur', renk: '#007bff', disabled: false },
                yukleniyor: { metin: 'Veriler Çekiliyor…', renk: '#007bff', disabled: true },
                tamam: { metin: '✓ Tamamlandı', renk: '#28a745', disabled: true },
                trafik_degil: { metin: 'Bitti (Trafik Değil)', renk: '#ffc107', disabled: true },
                hata: { metin: '✗ Hata', renk: '#dc3545', disabled: false },
            };
            const d = DURUMLAR[durum] ?? DURUMLAR.bekliyor;
            btn.innerText = d.metin;
            btn.style.backgroundColor = d.renk;
            btn.disabled = d.disabled;
        }
        // ─── BUTON ──────────────────────────────────────────────────────────────
        const btn = document.createElement('button');
        btn.innerText = '⚡ Verileri Doldur';
        Object.assign(btn.style, {
            position: 'fixed', top: '2px', right: '2px',
            zIndex: '99999', padding: '10px 18px',
            background: 'linear-gradient(135deg, #1a1f2e, #0d1117)', color: '#00d4ff',
            border: '1px solid rgba(0,212,255,0.4)', borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '700', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'monospace',
            boxShadow: '0 0 12px rgba(0,212,255,0.2), inset 0 0 8px rgba(0,212,255,0.05)',
            transition: 'all 0.2s ease',
        });
        btn.onmouseover = () => {
            if (!btn.disabled) {
                btn.style.background = 'linear-gradient(135deg, #0d1117, #1a1f2e)';
                btn.style.borderColor = 'rgba(0,212,255,0.8)';
                btn.style.boxShadow = '0 0 20px rgba(0,212,255,0.4), inset 0 0 12px rgba(0,212,255,0.1)';
                btn.style.color = '#fff';
            }
        };
        btn.onmouseout = () => {
            if (!btn.disabled) {
                btn.style.background = 'linear-gradient(135deg, #1a1f2e, #0d1117)';
                btn.style.borderColor = 'rgba(0,212,255,0.4)';
                btn.style.boxShadow = '0 0 12px rgba(0,212,255,0.2), inset 0 0 8px rgba(0,212,255,0.05)';
                btn.style.color = '#00d4ff';
            }
        };
        document.body.appendChild(btn);
        // ─── ANA FONKSİYON ──────────────────────────────────────────────────────
        btn.addEventListener('click', async function () {
            const id = pageId();
            if (!id) { alert('Sayfa ID bulunamadı.'); return; }
            butonDurum(btn, 'yukleniyor');
            try {
                // ── Kaynak 1: eks_hasar ───────────────────────────────────────────
                const eksHtml = await fetchPage(`${BASE}/eks/eks_hasar.php?act=upd&id=${id}`);
                const docEks = parseHtml(eksHtml);
                const servisAdi = docEks.querySelector('input[name="SERVIS_ADI"]')?.value ?? '';
                setField('input[name="EKSPERTIZ_YERI_AD_UNVAN"]', servisAdi);
                const sigortaSekliSel = docEks.querySelector('#SIGORTA_SEKLI'), sigortaSekliVal = sigortaSekliSel?.value ?? '', isTrafik = sigortaSekliVal === '1';
                // ── Kaynak 2: Mernis + Şasi/Motor ────────────────────────────────
                let mernisNo = '', sasiNo = '', motorNo = '', modelYili = '';
                if (isTrafik) {
                    const magdurLink = docEks.querySelector('a[href*="eks_hasar_magdur.php"]');
                    const popupMatch = magdurLink?.getAttribute('href')?.match(/eks_hasar_magdur\.php[^'"]*/);
                    const magdurPath = popupMatch ? popupMatch[0] : `eks_hasar_magdur.php?idhasar=${id}`;
                    const magdurHtml = await fetchPage(`${BASE}/eks/${magdurPath}`);
                    const docMagdur = parseHtml(magdurHtml);
                    mernisNo = docMagdur.querySelector('#MERNIS_NO_C')?.value ?? '';
                    sasiNo = docMagdur.querySelector('input[name="SASI_NO"]')?.value ?? '';
                    motorNo = docMagdur.querySelector('input[name="MOTOR_NO"]')?.value ?? '';
                    modelYili = docMagdur.querySelector('#MODEL_YILI')?.value ?? '';
                } else {
                    mernisNo = docEks.querySelector('#MERNIS_NO_C')?.value ?? '';
                    sasiNo = docEks.querySelector('input[name="HAS_SASI_NO"]')?.value || docEks.querySelector('input[name="SASI_NO"]')?.value || '';
                    motorNo = docEks.querySelector('input[name="HAS_MOTOR_NO"]')?.value || docEks.querySelector('input[name="MOTOR_NO"]')?.value || '';
                    modelYili = docEks.querySelector('#HAS_MODEL_YILI')?.value || docEks.querySelector('#MODEL_YILI')?.value || '';
                }
                if (modelYili && modelYili !== '-1' && modelYili !== '0') { setField('input[name="MODEL_YILI"]', modelYili); }
                setField('input[name="MAGDUR_KIMLIK_NO"]', mernisNo);
                const magdurKimlikTuru = mernisNo.length === 11 ? '1' : '2';
                setSelect('select[name="MAGDUR_KIMLIK_TURU"]', magdurKimlikTuru);
                document.querySelector('input[name="MAGDUR_KIMLIK_NO"]')?.dispatchEvent(new Event('blur'));
                setField('input[name="SASI_NO"]', sasiNo);
                setField('input[name="MOTOR_NO"]', motorNo);
                // ── Kaynak 3: Vergi / TC kimlik alanları ─────────────────────────
                const vergiNo = docEks.querySelector('input[name="VERGI_NO"]')?.value ?? '';
                if (vergiNo) {
                    const isTc = vergiNo.length === 11, kimlikTuru = isTc ? '1' : '2', sicilTipi = isTc ? '1' : '2', mersis = isTc ? vergiNo : vergiNo.padEnd(16, '0');
                    setField('input[name="TAMIRHANE_VERGI_NO"]', vergiNo);
                    setField('input[name="EKSPERTIZ_YERI_KIMLIK_NO"]', vergiNo);
                    setField('input[name="TAMIRHANE_MERSIS_NO"]', mersis);
                    setSelect('select[name="TAMIRHANE_KIMLIK_TURU"]', kimlikTuru);
                    setSelect('select[name="EKSPERTIZ_YERI_KIMLIK_TIPI"]', kimlikTuru);
                    setSelect('select[name="TAMIRHANE_SICIL_TIPI"]', sicilTipi);
                    document.querySelector('input[name="TAMIRHANE_VERGI_NO"]')?.dispatchEvent(new Event('blur'));
                    document.querySelector('input[name="EKSPERTIZ_YERI_KIMLIK_NO"]')?.dispatchEvent(new Event('blur'));
                }
                // ── Kaynak 4: İl ─────────────────────────────────────────────────
                const hasarIlSel = docEks.querySelector('#HASAR_ILI'), hasarIlVal = hasarIlSel?.value ?? '', hasarIlAdi = hasarIlSel ? hasarIlSel.options[hasarIlSel.selectedIndex].text.trim() : '';
                if (hasarIlAdi) { setSelectByText('select[name="EKSPERTIZ_YERI_IL_KOD"]', hasarIlAdi); setSelectByText('select[name="TAMIRHANE_IL_KODU"]', hasarIlAdi); }
                // ── Kaynak 4: İlçe ───────────────────────────────────────────────
                // TODO: ilçe kaynağı bulununca buraya eklenecek
                // ── Sabit değerler ───────────────────────────────────────────────
                const aracKiralikHayir = document.querySelector('input[name="ARAC_KIRALIKMI"][value="0"]'); if (aracKiralikHayir) { aracKiralikHayir.checked = true; }
                const emKemeriHayir = document.querySelector('input[name="EMNIYET_KEMERI_KITLENMISMI"][value="0"]'); if (emKemeriHayir) { emKemeriHayir.checked = true; }
                const havaYastigiHayir = document.querySelector('input[name="HAVA_YASTIGI_ACIK_MI"][value="0"]'); if (havaYastigiHayir) { havaYastigiHayir.checked = true; }
                const kismiHasar = document.querySelector('input[name="PERT_CEKME_HURDA"][value="4"]'); if (kismiHasar) { kismiHasar.checked = true; }
                setSelect('select[name="HASARLI_BOLGE_SEBEP_NO"]', '0');
                setSelect('select[name="KAZA_OLUS_SEKLI"]', '4');
                setSelect('select[name="HASAR_NEDENI"]', '20');
                // ── Yeni kaynak eklemek için ──────────────────────────────────────
                /*const extraHtml = await fetchPage(`${BASE}/eks/sayfa.php?id=${id}`), docExtra  = parseHtml(extraHtml);
                setField('input[name="HEDEF_ALAN"]', docExtra.querySelector('#KAYNAK_ID')?.value); */
                butonDurum(btn, 'tamam'); setTimeout(() => butonDurum(btn, 'bekliyor'), 2500); setTimeout(() => highlightSdata(), 500);
            } catch (err) {
                console.error('[VeriDoldur]', err); alert(err.message); butonDurum(btn, 'hata'); setTimeout(() => butonDurum(btn, 'bekliyor'), 3000);
            }
        });
        function highlightSdata() {
            const WARNING = '#fff3cd', OK = '';
            function setBg(selector, bosmu) { const el = document.querySelector(selector); if (!el) { return; } const td = el.closest('td'); if (td) { td.style.backgroundColor = bosmu ? WARNING : OK; } }
            function isEmpty(selector) { const el = document.querySelector(selector); if (!el) { return true; } return !el.value || el.value === '-1' || el.value.trim() === ''; }
            function isUnchecked(selector) { const el = document.querySelector(selector); return !el || !el.checked; }
            // ── Text / input alanlar ──────────────────────────────────────────
            setBg('input[name="MAGDUR_KIMLIK_NO"]', isEmpty('input[name="MAGDUR_KIMLIK_NO"]'));
            setBg('input[name="SASI_NO"]', isEmpty('input[name="SASI_NO"]'));
            setBg('input[name="MOTOR_NO"]', isEmpty('input[name="MOTOR_NO"]'));
            setBg('input[name="EKSPERTIZ_YERI_AD_UNVAN"]', isEmpty('input[name="EKSPERTIZ_YERI_AD_UNVAN"]'));
            setBg('input[name="TAMIRHANE_VERGI_NO"]', isEmpty('input[name="TAMIRHANE_VERGI_NO"]'));
            setBg('input[name="EKSPERTIZ_YERI_KIMLIK_NO"]', isEmpty('input[name="EKSPERTIZ_YERI_KIMLIK_NO"]'));
            setBg('input[name="TAMIRHANE_MERSIS_NO"]', isEmpty('input[name="TAMIRHANE_MERSIS_NO"]'));
            setBg('input[name="TAMIRHANE_ILCE_STR"]', isEmpty('input[name="TAMIRHANE_ILCE_STR"]'));
            setBg('input[name="EKSPERTIZ_YERI_ILCE_STR"]', isEmpty('input[name="EKSPERTIZ_YERI_ILCE_STR"]'));
            setBg('input[name="HASAR_KOORDINAT_ENLEM"]', isEmpty('input[name="HASAR_KOORDINAT_ENLEM"]'));
            setBg('input[name="HASAR_KOORDINAT_BOYLAM"]', isEmpty('input[name="HASAR_KOORDINAT_BOYLAM"]'));
            // ── Select alanlar ────────────────────────────────────────────────
            setBg('select[name="MAGDUR_KIMLIK_TURU"]', isEmpty('select[name="MAGDUR_KIMLIK_TURU"]'));
            setBg('select[name="TAMIRHANE_KIMLIK_TURU"]', isEmpty('select[name="TAMIRHANE_KIMLIK_TURU"]'));
            setBg('select[name="EKSPERTIZ_YERI_KIMLIK_TIPI"]', isEmpty('select[name="EKSPERTIZ_YERI_KIMLIK_TIPI"]'));
            setBg('select[name="TAMIRHANE_SICIL_TIPI"]', isEmpty('select[name="TAMIRHANE_SICIL_TIPI"]'));
            setBg('select[name="EKSPERTIZ_YERI_IL_KOD"]', isEmpty('select[name="EKSPERTIZ_YERI_IL_KOD"]'));
            setBg('select[name="TAMIRHANE_IL_KODU"]', isEmpty('select[name="TAMIRHANE_IL_KODU"]'));
            setBg('select[name="HASARLI_BOLGE_SEBEP_NO"]', isEmpty('select[name="HASARLI_BOLGE_SEBEP_NO"]'));
            setBg('select[name="HASARLI_BOLGE_NO"]', isEmpty('select[name="HASARLI_BOLGE_NO"]'));
            setBg('select[name="KAZA_OLUS_SEKLI"]', isEmpty('select[name="KAZA_OLUS_SEKLI"]'));
            setBg('select[name="HASAR_NEDENI"]', isEmpty('select[name="HASAR_NEDENI"]'));
            setBg('select[name="ARAC_TARIFE_GRUP_KODU"]', isEmpty('select[name="ARAC_TARIFE_GRUP_KODU"]'));
            // ── Radio alanlar ─────────────────────────────────────────────────
            const pertChecked = document.querySelector('input[name="PERT_CEKME_HURDA"]:checked'), pertTd = document.querySelector('input[name="PERT_CEKME_HURDA"]')?.closest('td');
            if (pertTd) { pertTd.style.backgroundColor = pertChecked ? OK : WARNING; }
            const aracKiralik = document.querySelector('input[name="ARAC_KIRALIKMI"]:checked'), aracKiralikTd = document.querySelector('input[name="ARAC_KIRALIKMI"]')?.closest('td');
            if (aracKiralikTd) { aracKiralikTd.style.backgroundColor = aracKiralik ? OK : WARNING; }
            const emKemeri = document.querySelector('input[name="EMNIYET_KEMERI_KITLENMISMI"]:checked'), emKemeriTd = document.querySelector('input[name="EMNIYET_KEMERI_KITLENMISMI"]')?.closest('td');
            if (emKemeriTd) { emKemeriTd.style.backgroundColor = emKemeri ? OK : WARNING; }
            const havaYastigi = document.querySelector('input[name="HAVA_YASTIGI_ACIK_MI"]:checked'), havaYastigiTd = document.querySelector('input[name="HAVA_YASTIGI_ACIK_MI"]')?.closest('td');
            if (havaYastigiTd) { havaYastigiTd.style.backgroundColor = havaYastigi ? OK : WARNING; }
        }
        setTimeout(() => highlightSdata(), 500);
    }
})();
