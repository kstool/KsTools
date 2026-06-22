// ==UserScript==
// @name         KS TOOLS - Otoanaliz Oceanic Compact
// @namespace    KS_TOOLS_Otoanaliz_Oceanic
// @version      1.18
// @description  Düzeltilmiş, modern, kompakt tema.
// @author       Saygın
// @match        *://*/*
// @grant        GM_addStyle
// @exclude      *print*
// @updateURL    https://github.com/sayginkizilkaya/Ks-Tools/raw/main/Ks_Tools_Ocean.user.js
// @downloadURL  https://github.com/sayginkizilkaya/Ks-Tools/raw/main/Ks_Tools_Ocean.user.js
// ==/UserScript==
(function () {
    'use strict';
    function removeElements() { document.querySelectorAll('.stage__left').forEach(el => el.remove()); document.querySelectorAll('.car-zone').forEach(el => el.remove()); }
    removeElements();
    const observer = new MutationObserver(() => removeElements()); observer.observe(document.body, { childList: true, subtree: true });
    const url = unsafeWindow.location.href.toLowerCase();
    const blockedGroups = ["yazdir", "login", "loginfrm", "print", "rapor", "ihbar", "dilekce", "fatura", "makbuz", "dekont", "invoice", "receipt", "barcode", "kimlik", "kart"];
    const isTargetPage = url.includes("otohasar") && (url.includes("login") || url.includes("loginfrm"));
    if (blockedGroups.some(word => url.includes(word))) { return; }
    if (url.includes("otohasar") && !url.includes("loginfrm") && !url.includes("eks_hasar_yedpar_yeni_ref") && !url.includes("eks_hasar_yedpar_yeni_liste")) {
        const urls = [
            "https://i.pinimg.com/originals/7f/ae/97/7fae97b0d62464f833f75a7cce0a9902.gif",
            "https://i.pinimg.com/originals/80/7b/5c/807b5c4b02e765bb4930b7c66662ef4b.gif",
            "https://media.tenor.com/Cdsz67OHTE0AAAAj/kitty-cat.gif",
            "https://media.tenor.com/Y-rpgX5Tr6QAAAAj/meme-betterttv.gif",
            "https://media.tenor.com/9nKcOUBEhcQAAAAj/cat-roll.gif",
            "https://media.tenor.com/YSzBJZA8P0cAAAAj/cat-black.gif",
            "https://media.tenor.com/GVbLnw73qD8AAAAj/dancing-duck-karlo.gif",
            "https://media.tenor.com/2PVH7hArX-0AAAAj/totoro-jumping.gif",
            "https://media.tenor.com/TrrbI6d6Vo0AAAAj/waal-boyss-otw.gif",
            "https://media.tenor.com/7qmbUuWQcqUAAAAj/cute-happy.gif",
            "https://media.tenor.com/JW0XaqKXJfsAAAAj/cat-pixelated.gif",
            "https://media.tenor.com/U98uFe-2pN4AAAAj/cute-happy.gif",
            "https://media.tenor.com/tQThay3xZ-oAAAAj/cat.gif",
            "https://media.tenor.com/aNf6_OFGr4wAAAAj/cattaiyakikorilakkuma.gif",
            "https://media.tenor.com/3idD6oxHpcAAAAAj/%E9%BC%A0.gif",
            "https://media.tenor.com/EA22nY9lDbcAAAAj/penguin-penguin-dancing.gif",
            "https://media.tenor.com/zTERWK4_wu0AAAAj/png-kitty.gif",
            "https://media.tenor.com/Zm0_IipQgygAAAAj/we-bare-bears-polar-bear.gif",
            "https://media.tenor.com/iYiVdYkETtIAAAAj/pixel-pixelart.gif",
            "https://media.tenor.com/hRvoohhTmWkAAAAj/pixel-frog.gif",
            "https://media.tenor.com/i9cw1VYmjfAAAAAj/kawaii.gif"
        ];
        const randomUrl = urls[Math.floor(Math.random() * urls.length)];
        const oceanicTheme = `
        :root {
            --primary: #3589c1;
            --primary-light: #e9f7f8;
            --maim: #f0f9ff;
            --accent: #2980b9;
            --bg-body: #8fb5c1;
            --reddo: #d00f0f;
            --reddo-light: #f34352;
            --reddo-dark: #b31414;
            --border-soft: #66abff;
            --text-dark: #334155;
            --texto: #1e293b;
            --disabled: #475569;
            --white: var(--maim);
            --fontsize: 12px;
            --font: 'Inter', 'Segoe UI', sans-serif;
        }
        /* 1. GENEL TEMİZLİK */
        body { background-color: var(--bg-body) ; background-image: none ; color: var(--text-dark) ; font-family: var(--font); }
        table { text-align: left !important; border-collapse: separate !important; table-layout: auto !important; max-width: 100vw !important; }
        /* Boşluk yapan ve tasarımı bozan hücreleri/resimleri gizle */
        td[width="273"], td[height="67"], td[background*="new_10.gif"], td[background*="new_05.gif"], td[background*="new_18-9.gif"], img[src*="new_10.gif"], img[src*="new_02.gif"], object, embed { display: none ; }
        /* 2. HEADER & KURUMSAL BAŞLIK */
        td[bgcolor="#000066"], td[bgcolor="#FF0000"] { background-color: var(--maim) ; border: none ; }
       .hosgeldin {
           display: inline-flex;
           align-items: flex-start; /* Sola yaslar */
           position: relative;
           cursor: default;
           color: var(--themeColor);
           font-family: var(--font);
           font-size: 15px;
           font-weight: 600;
           letter-spacing: 2px;
           text-transform: uppercase;
           padding: 25px 50px;
           transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
       }
       /* Üstte Görünen Site Adı */
       .hosgeldin::before {
           content: var(--site-adi, " - ");
           display: block;
           color: var(--primary);
           font-family: var(--font);
           font-size: 15px;
           font-weight: 600;
           letter-spacing: 2px;
           padding: 0px 5px;
           margin-bottom: 5px;
           opacity: 0.7;
           transition: all 0.4s ease;
       }
       .hosgeldin:hover::before { opacity: 1; text-shadow: 0 0 8px var(--primary); }
       .modern-nav-container {
           display: flex;
           flex-wrap: wrap;
           gap: 8px 32px;
           padding: 10px 24px;
		   margin:4px;
           justify-content: flex-start;
           align-items: center;
           background: linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2));
           backdrop-filter: blur(20px) saturate(180%);
           -webkit-backdrop-filter: blur(20px) saturate(180%);
           border-radius: 24px;
           box-shadow:
               5px 0 1px 1px rgba(240, 249, 255, 0),
               -100px 0 1px 2px rgba(0, 0, 0, 0),
               -150px 0 3px 3px rgba(0, 0, 0, 0),
               -200px 0 5px 6px rgba(0, 0, 0, 0),
               -250px 0 10px 8px rgba(0, 0, 0, 0),
               -300px 0 13px 10px rgba(0, 0, 0, 0),
               -400px 0 15px 10px rgba(0, 0, 0, 0),
               -500px 0 17px 15px rgba(0, 0, 0, 0),
               -600px 0 19px 20px rgba(0, 0, 0, 0),
               -800px 0 20px 35px rgba(0, 0, 0, 0),
               -5px 0 3px 1px rgba(0, 0, 0, 0);
           transition: box-shadow 0.3s ease-in-out, transform 0.3s ease;
       }
	   img[src="/images/pixel.gif"] { content: url("${randomUrl}") !important; object-fit: contain; border: none !important; outline: none !important; background: transparent !important; box-shadow: none !important; }
       .modern-nav-container:hover {
           box-shadow:
			   5px 0 1px 1px rgba(240, 249, 255, 1),
               -100px 0 1px 2px rgba(0, 0, 0, 0.01),
               -150px 0 3px 3px rgba(0, 0, 0, 0.015),
               -200px 0 5px 6px rgba(0, 0, 0, 0.02),
               -250px 0 10px 8px rgba(0, 0, 0, 0.025),
               -300px 0 13px 10px rgba(0, 0, 0, 0.03),
               -400px 0 15px 10px rgba(0, 0, 0, 0.035),
               -500px 0 17px 15px rgba(0, 0, 0, 0.04),
               -600px 0 19px 20px rgba(0, 0, 0, 0.045),
               -800px 0 20px 35px rgba(0, 0, 0, 0.05),
               -5px 0 3px 1px rgba(0, 0, 0, 0.1);
       }
       .modern-link {
           text-decoration: none !important;
           color: var(--texto) !important;
           font-family: var(--font);
           font-size: var(--fontsize);
           font-weight: 700;
           letter-spacing: 0.5px;
           text-transform: uppercase;
           position: relative;
           cursor: pointer;
           display: inline-block;
           transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
           z-index: 1;
       }
       .modern-link:hover { color: var(--primary) !important; text-shadow: 0 0 10px rgba(var(--primary-rgb, 255, 255, 255), 0.3); }
       .modern-link::after { content: ''; position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 0%; height: 2px; background: var(--primary); border-radius: 20px;
           box-shadow: 0 0 15px var(--primary), 0 0 5px var(--primary); transition: width 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease; opacity: 0; }
       .modern-link:hover::after { width: 100%; opacity: 1; }
       .modern-link:active { transform: translateY(-1px) scale(0.98); transition: 0.1s; }
       .modern-link[href*="logout"] { color: var(--reddo) !important; opacity: 0.9; }
       .modern-link[href*="logout"]:hover { color: #ff4d4d !important; opacity: 1; transform: translateY(-3px) scale(1.05) rotate(-3deg); filter: drop-shadow(0 0 8px rgba(255, 77, 77, 0.4)); }
       .modern-link[href*="logout"]::after { background: #ff4d4d; box-shadow: 0 0 12px #ff4d4d; height: 2px; }
       @keyframes slideInSoft { 0% { opacity: 0;  transform: translateX(-30px) scale(0.98); filter: blur(5px); } 100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); } }
	   .modern-nav-container a, .modern-nav-container a:hover, .modern-nav-container a:visited, .modern-nav-container * {
           background-color: none !important; text-decoration: none !important; border-bottom: none !important; outline: none !important; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        /* 9. ÖNEMLİ BİLGİ METNİ (.yazi) */
        .yazi { color: var(--texto) !important; background-color: rgba(255, 255, 255, 0.6) !important; border-radius: 4px !important; }
        .yazi a, .yazi b { color: var(--accent) !important; text-decoration: underline !important; }
        /* 3. NAVİGASYON İKONLARI (STABİL DÜZEN) */
        tr[background*="new_18.gif"] { background: var(--maim); background-image: none;}
        tr[background*="new_18.gif"] table[width="760"] {
            align-items: center !important;
            justify-content: center !important;
			gap: 15px;
			padding: 10px 10px 10px 10px;
            border: 1px solid rgba(0, 0, 0, 0.1); /* Daha ince ve yarı saydam kenarlık */
            border-radius: 12px; /* Köşeleri biraz daha yuvarladık */
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);/* Derinlik katmak için hafif gölge (Asıl yumuşaklığı bu verir) */
        }
		/* İkonlar */
        tr[background*="new_18.gif"] img { width: 50px ; border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 12px; height: auto ; }
        .eksper_menu {
            color: color-mix(in srgb, var(--accent), black 25%);
            transition: all 0.3s ease;
            font-size: 11px ;
            font-weight: 600 ;
            text-transform: uppercase ;
            padding: 4px 0px 4px 0px ;
            filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--accent), black 25%);) ;
        }
        /* 4. TABLO BAŞLIKLARI */
        td.tb, td[background*="baslik_img02.gif"] { background: #f8fafc ; border-left: 4px solid var(--primary) ; color: var(--accent) ; font-weight: 700 ; text-align: center ; }
        td[width="27"], td[width="43"], img[src*="baslik_img"] { display: none ; }
        /* 11. TABLO ANA BAŞLIKLARI (.koyubaslik) */
        .koyubaslik {
            background: linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%) !important;
            color: var(--maim) !important;
            font-size: 10px !important;
            font-weight: 500 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            border: none !important;
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
        }
        .koyubaslik a { color: var(--maim) !important; text-decoration: none !important; border-bottom: 1px dashed rgba(255, 255, 255, 0.5) !important; transition: all 0.2s !important; }
        .koyubaslik a:hover { color: var(--primary-light) !important; border-bottom-style: solid !important; }
        tr:has(> .koyubaslik) { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important; }
        /* 7.1 READONLY & DISABLED */
		:is(input, select, textarea):is([readonly], [readonly=""], :disabled),
		:is(input, select, textarea):is([readonly], [readonly=""], :disabled):is(:hover, :focus, :active, :focus-visible) {
		    background-color: var(--disabled) !important;
		    color: var(--white) !important;
		    border-color: var(--disabled) !important;
		    cursor: not-allowed !important;
		    opacity: 1 !important;outline: none !important;
		    box-shadow: none !important;
		    transform: none !important;
		}
		:is(input, select, textarea)::selection { background-color: var(--disabled) !important; color: var(--white) !important; }
		:is(input, select, textarea):is([readonly], [readonly=""], :disabled)::selection { background-color: var(--reddo-dark) !important; color: var(--white) !important; }
        /* 8. ICON HOVER NEON EFFECT */
        td[align="center"] a:hover img { filter: drop-shadow(0 0 8px rgba(52, 152, 219, 0.8)) drop-shadow(0 0 12px rgba(52, 152, 219, 0.4)) !important; transform: scale(1.1) !important; transition: all 0.2s ease-in-out !important; }
        td[align="center"] a { filter: brightness(1.2) !important; display: inline-block !important; text-decoration: none !important; }
        /* --- OCEANIC THEME COMPATIBILITY LAYER --- */
		.kirmizi { background-color: color-mix(in srgb, var(--maim), var(--reddo) 14%); }
        /* 2. VERİ HÜCRELERİ (SABİT GÖRÜNÜM) */
        .koyu, .koyu_yangin, .koyu01, .koyu_text, .acik_cam { background-color: color-mix(in srgb, var(--maim), var(--texto) 4%); color: var(--text-dark); border: 1px solid rgba(0,0,0,0.05) !important; }
        .acik, .acik_yangin, .acik_text, .beyaz_liste, .yazi, .yazi1 { background-color: var(--maim); color: var(--text-dark); border-bottom: 1px solid #e2e8f0 !important; }
        /* 3. BAŞLIKLAR */
        .koyubaslik, .koyubaslik_text, .koyubaslik01, .koyubaslik01_text, .koyubaslik_, .tb { background: linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%); color: var(--maim) !important; border: none !important; text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important; }
        input[size="85"], .textarea_buyuk, input[name*="YP_"] { min-width: 150px !important; transition: min-width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important; }
        input[size="85"]:focus { min-width: 200px !important; }

/*************************************************/
        input, select, textarea, .box01, .select01, .textarea { background-color: var(--primary-light) !important; border: 1px solid var(--border-soft) !important; border-radius: 4px !important; box-sizing: border-box !important;
            color: var(--texto) !important; outline: none !important; transition: border-color 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease !important; }
        input:hover, select:hover, textarea:hover, .box01:hover, .select01:hover { border-color: var(--accent) !important; background-color: var(--maim) !important; }
        input:focus, select:focus, textarea:focus, .box01:focus, .select01:focus { outline: none !important; border-color: var(--primary) !important; color: var(--texto) !important; box-shadow: 0 0 5px 2px rgba(20, 80, 120, 0.55) !important; background-color: var(--white) !important; }
        select option { background-color: var(--white) !important; color: var(--texto) !important; }
		/* 5. BUTONLAR: MODERN & ANİMASYONLU */
        .buton01, .BUTON01, .BUTON02, .BUTON03, .BUTON06,  .buton02, .buton03, #SASI_MDL,
        input[type="submit"], input[type="button"],
        input[value="KAYDET"], input[value="Ok"], input[value=" Ok "], input[name="btnALL"],
		a[href*="sbm_on_rapor=1"], a[href*="index_yangin.php"] {
            background: var(--accent) !important;
            height: 22px !important;
            font-size: 10px !important;
            font-weight: 600 !important;
            border-radius: 3px !important;
            border: none !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            cursor: pointer !important;
            position: relative !important;
            outline: none !important;
            text-transform: uppercase !important;
            color: var(--white) !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
            text-shadow: 0 1px 1px rgba(0,0,0,0.2) !important;
        }
        /* VARSAYILAN RENKLER */
        a.buton01, div > a.buton01, .BTNKIRMIZI, .BUTON02, .BUTON03, .buton03, #btnKaydet1, #btnKaydet2, #SASI_MDL, #siparisVerButton ,input[name="btnALL"], input[value="KAYDET"], input[value="Ok"], input[value=" Ok "]
		{ background: linear-gradient(180deg, var(--reddo-light) 0%, var(--reddo) 100%) !important; }
        .BUTON06, .BUTON_YESIL, input[value="İHBAR YAZDIR"] { background: #27ae60 !important; }
        /* oto dışı */
		a[href*="index_yangin.php"] img { display: none !important;}
		a[href*="index_yangin.php"]::after { content: "OTO DIŞI YANGIN" !important; display: block !important; white-space: nowrap !important; }
        /* 5.2 ÖZEL AÇIK RENKLİ BUTONLAR (YENİ KAYIT, MOBİL ONARIM, TEDARİK) */
        input[value="YENİ KAYIT"],
        input[value="MOBİL ONARIM"],
        input[value="TEDARİKCİYE GÖNDER"],
        input[value="  TEDARİKCİYE GÖNDER  "],
        input[value="  GÖNDER   "],
        input[value="  GÖNDER  "],
        input[value="GÖNDER"],
        input[value="Ara"],
        input[value=" Ara "],
        input[value="MESAJ GÖNDER"],
        input[value="TRAMER EVRAKLARI"],
        input[value="SBM BİLGİLERİ"],
        input[value="UZMAN RAPORU"],
        input[value="TOPLU EVRAK EKLE HTML5 (YENİ)"],
        input[value="TOPLU FOTOĞRAF EKLE HTML5 (YENİ)"],
        input[value=" ARAÇ DONANIM&TEKNİK BİLGİSİ "],
        input[value="TED. PARÇA LİSTESİ"]{
            background: var(--reddo-light) !important;
			color: color-mix(in srgb, var(--maim) 90%, white 10%) !important;
            border: 1px solid var(--reddo-dark) !important;
            box-shadow: 0 2px 5px var(--reddo-light)33 !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
            outline: none !important;
            justify-content: center !important;
            text-align: center !important;
        }
        a.buton01, div > a.buton01, .buton01:hover, .BUTON01:hover, .BUTON02:hover, .BUTON03:hover, .buton03:hover, .BUTON06:hover,
        .BTNKIRMIZI:hover, .BUTON_YESIL:hover, #SASI_MDL:hover, input[name="btnALL"]:hover, input[type="submit"]:hover, input[type="button"]:hover, a[href*="sbm_on_rapor=1"]{
			transform: translateY(-1px) scale(1.02) !important; filter: brightness(1.05) !important; }
		a.buton01, input[value="Favorilerileri Ayarlar"] {
            background: var(--accent, #2c3e50) !important;
            color: var(--white, #ffffff) !important;
            border: 1px solid rgba(0, 0, 0, 0.2) !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            text-decoration: none !important;
            line-height: 0.9 !important;
            white-space: normal !important;
            word-wrap: break-word !important;
            overflow: hidden !important;
            padding: 2px !important;
            height: 22px !important;
            font-size: 9px !important;
            box-sizing: border-box !important;
            width: 100% !important;
            height: 22px !important;
            font-weight: 600 !important;
            border-radius: 3px !important;
            text-transform: uppercase !important;
            transition: all 0.2s ease !important;
            cursor: pointer !important;
            box-sizing: border-box !important;
        }
        a.buton01:hover, input[value="Favorilerileri Ayarlar"] { color: var(--white, #ffffff) !important; filter: brightness(1.1) !important; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important; transform: translateY(-1px) !important; }
        a.buton01:active, input[value="Favorilerileri Ayarlar"] { color: var(--white, #ffffff) !important; transform: translateY(1px) !important; box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4) !important; filter: brightness(0.9) !important; }
/*************************************************/
        /* LİNKLER VE ÖZEL DURUMLAR */
        a, .link, .link01, .linkyp, .dosya_menu, .menu { color: var(--accent) !important; text-decoration: none !important; transition: all 0.2s ease !important; display: inline-block; }
        a:hover, .link:hover, .link01:hover, .linkyp:hover { color: var(--reddo) !important; transform: scale(1.02) !important; }
        .cizgi { background-color: var(--border-soft) !important; height: 1px !important; }
        .hosgeldin { color: var(--primary) !important; border-left: 4px solid var(--primary) !important; padding-left: 5px; }
        td.tb[background*="baslik_img02.gif"] { color: var(--accent) !important; font-weight: bold; }
        #btnStream { animation: blinkingText 1.5s infinite !important; }
        a[onclick*="document.yedparforhasar.submit"] {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            min-width: 100px;
            height: 20px;
			padding: 3px;
            background: #d32f2f !important;
			color: #ffffff !important;
            font-size: 12px !important;
            font-weight: bold !important;
            text-decoration: none !important;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            transition: transform 0.2s, background 0.2s;
            cursor: pointer;
            border: 1px solid #b71c1c;
            text-transform: uppercase;
        }
        a[onclick*="document.yedparforhasar.submit"] img, { display: none !important; }
        a[onclick*="document.yedparforhasar.submit"]::after { content: "KAYDET" !important; display: block !important; visibility: visible !important; color: white !important; }
        a[onclick*="document.yedparforhasar.submit"]:hover { transform: scale(1.02); background: linear-gradient(180deg, #ff0000 0%, #b71c1c 100%) !important; box-shadow: 0 6px 12px rgba(0,0,0,0.15); }
/*************************************************/
		/*TEDARİK BÖLÜMÜ*/
        .tm-tedarik-container {
            /*width: 100% !important;
            min-width: 600px !important;*/
            background: var(--maim) !important;
            border: 1px solid var(--border-soft) !important;
            border-radius: 10px !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
            overflow: hidden !important;
            display: block !important;
        }
        .tm-tedarik-header { background: var(--primary) !important; color: var(--maim) !important; border-bottom: 1px solid var(--border-soft) !important; }
        .tm-tedarik-list { max-height: 100px !important; overflow-y: 100vw !important; overflow-x: hidden !important; display: flex !important; flex-direction: column !important; }
        .tm-tedarik-item { border-bottom: 1px solid  var(--maim) !important; display: flex !important; justify-content: space-between !important; align-items: center !important; transition: background 0.2s !important; }
        .tm-tedarik-item:hover { background: var(--primary-light) !important; }
        .tm-firm-name { font-size: 11px !important; font-weight: 600 !important; color: #334155 !important; }
        .tm-firm-rate { font-size: 11px !important; font-weight: 800 !important; border-radius: 4px !important; }
        .tm-high { background: #fee2e2 !important; color: #991b1b !important; border: 1px solid #fecaca !important; }
        .tm-zero { background: #dcfce7 !important; color: #166534 !important; border: 1px solid #bbf7d0 !important; }
        /* Scrollbar tasarımı */
        .tm-tedarik-list::-webkit-scrollbar { width: 6px; }
        .tm-tedarik-list::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }
        .tm-tedarik-list::-webkit-scrollbar-track { background: #f1f5f9; }
		/* TOOLBAR TD - new_05 override */
        td[background*="new_05.gif"] { display: table-cell !important; background-color: var(--maim) !important; background-image: none !important; }
		/* === HASAR LİSTE TABLOSU === */
        /* Dış wrapper tabloların arka planını temizle */
        table[bgcolor="54B2FD"],
        table[bgcolor="#54B2FD"] { background-color: var(--border-soft) !important; border-radius: 10px !important; overflow: hidden !important; }
        table[bgcolor="#FFFFFF"], td[bgcolor="#FFFFFF"] { background-color: var(--maim) !important; }
        /* Sayfalama satırı */
        td[colspan="25"] { background-color: var(--maim) !important; }
        /* Sıralama başlıkları - tablesorter th'leri */
        #liste thead th.tablesorter-header {
            background: linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%) !important;
            color: var(--maim) !important;
            font-size: 10px !important;
            font-weight: 600 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            border-right: 1px solid rgba(255,255,255,0.15) !important;
            border-bottom: none !important;
            padding: 6px 8px !important;
            white-space: nowrap !important;
            cursor: pointer !important;
            user-select: none !important;
        }
        #liste thead th.tablesorter-header:hover { filter: brightness(1.15) !important; }
        /* Tablesorter ok ikonları */
        #liste .tablesorter-header-inner::after { content: ' ⇅' !important; opacity: 0.5 !important; font-size: 9px !important; }
        #liste .tablesorter-headerAsc .tablesorter-header-inner::after  { content: ' ↑' !important; opacity: 1 !important; }
        #liste .tablesorter-headerDesc .tablesorter-header-inner::after { content: ' ↓' !important; opacity: 1 !important; }
        /* Sonuç bilgisi satırı (115 Sonuç...) */
        #liste thead td.koyubaslik01 { background: var(--primary-light) !important; color: var(--accent) !important; font-size: 11px !important; padding: 5px 10px !important; border-bottom: 1px solid var(--border-soft) !important; }
        /* Veri satırları */
        #liste tbody tr.odd  td,
        #liste tbody tr:nth-child(odd)  td.acik { background-color: var(--maim) !important; }
        #liste tbody tr.even td,
        #liste tbody tr:nth-child(even) td.koyu { background-color: color-mix(in srgb, var(--maim), var(--primary) 5%) !important; }
        /* Satır hover */
        #liste tbody tr:hover td { background-color: color-mix(in srgb, var(--primary-light), var(--primary) 10%) !important; transition: background-color 0.15s ease !important; }
        /* Hücre genel */
        #liste tbody td { font-size: 11px !important; padding: 4px 8px !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important; color: var(--texto) !important; vertical-align: middle !important; }
        /* Linkler içinde */
        #liste tbody td a.list { color: var(--accent) !important; font-weight: 600 !important; text-decoration: none !important; }
        #liste tbody td a.list:hover { color: var(--reddo) !important; }
        /* Araştırma Yok kırmızı yazısı */
        #liste tbody td font[color="#E21E26"], #liste tbody td font[color="#e21e26"] { color: var(--reddo) !important; font-weight: 600 !important; font-size: 10px !important; }
        /* Sayfalama */
        td.yazi a b { color: var(--accent) !important; }
        td.yazi font[color="red"] b { color: var(--reddo) !important; }
		/* Liste tablosu */
        #liste { background-color: var(--maim) !important; }
        #liste thead th { background: linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%) !important; color: var(--maim) !important; font-size: 10px !important; font-weight: 600 !important; text-transform: uppercase !important; padding: 6px 8px !important; }
        #liste td.acik { background-color: #f0f9ff !important; }
        #liste td.koyu { background-color: #e8f4fb !important; }
        #liste tbody tr:hover td { background-color: #d0eaf8 !important; }
        #liste tbody td { font-size: 11px !important; padding: 4px 8px !important; color: var(--texto) !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important; }
    `;
        function initSiteName() {
            const hosgeldinElement = document.querySelector('.hosgeldin');
            if (hosgeldinElement) { const hostname = window.location.hostname; const siteName = hostname.replace('otohasar.', '').split('.')[0].toUpperCase(); hosgeldinElement.style.setProperty('--site-adi', `"${siteName} - "`); return true; }
            return false;
        }
        const checkExist = setInterval(function () { if (initSiteName()) { clearInterval(checkExist); } }, 100);
        setTimeout(() => clearInterval(checkExist), 5000);
        const formatTedarikciler = () => {
            const targetFont = Array.from(document.querySelectorAll('td.text font, td font, td.text')).find(el => el.innerText.includes('BU DOSYA TEDARİĞE UYGUNDUR'));
            if (!targetFont) return;
            const parentTd = targetFont.closest('td');
            if (parentTd.dataset.processed === "true") return;
            const originalContent = parentTd.innerHTML;
            let cleanText = targetFont.innerText.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');
            let content = cleanText.split('BU DOSYA TEDARİĞE UYGUNDUR:')[1] || "";
            let firms = content.split(/,(?![^\(]*\))/).map(item => {
                item = item.trim(); const rateMatch = item.match(/\((%\d+\.\d+)\)/); const rate = rateMatch ? rateMatch[1] : "%0.00";
                const name = item.replace(/\(%\d+\.\d+\)/, '').trim(); return { name, rate };
            }).filter(f => f.name.length > 2);
            const getRateClass = (rateStr) => { const numericRate = parseFloat(rateStr.replace('%', '')); if (numericRate >= 60) { return 'tm-high'; } else if (numericRate > 0) { return 'tm-active'; } else { return 'tm-zero'; } };
            const itemsHtml = firms.map(f => `
            <div class="tm-tedarik-item" style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0;">
                <span class="tm-firm-name" style="font-size: 12px;">${f.name}</span>
                <span class="tm-firm-rate ${getRateClass(f.rate)}" style="font-weight: bold; min-width: 60px; text-align: right;">${f.rate}</span>
            </div>
        `).join('');
            const modernHtml = `
            <div class="tm-tedarik-wrapper">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    <span style="font-size: 11px; color: #666; font-weight: bold;">Tedarikçi Analiz Paneli</span>
                    <button id="view-toggle-btn" class="BUTON01" style="min-width: 140px; cursor: pointer;">
                        ORİJİNAL LİSTEYİ GÖSTER
                    </button>
                </div>
                <div id="modern-view" class="tm-tedarik-container">
                    <div class="tm-tedarik-header" style="background: #f8f9fa;font-weight: bold; font-size: 13px; margin-bottom: 5px;">TEDARİK UYGUNLUK LİSTESİ (${firms.length} Firma)</div>
                    <div class="tm-tedarik-list">${itemsHtml}</div>
                </div>
                <div id="original-view" style="display: none; border: 1px dashed #ccc; background: #fffafb;">
                    ${originalContent}
                </div>
            </div>
        `;
            parentTd.innerHTML = modernHtml;
            parentTd.dataset.processed = "true";
            const toggleBtn = document.getElementById('view-toggle-btn');
            const modernDiv = document.getElementById('modern-view');
            const originalDiv = document.getElementById('original-view');
            toggleBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (modernDiv.style.display === "none") { modernDiv.style.display = "block"; originalDiv.style.display = "none"; this.innerText = "ORİJİNAL LİSTEYİ GÖSTER"; }
                else { modernDiv.style.display = "none"; originalDiv.style.display = "block"; this.innerText = "MODERN LİSTEYE DÖN"; }
            });
        };
        const map = document.querySelector('map[name="linkmap"]');
        if (map) {
            const areas = map.querySelectorAll('area');
            const nav = document.createElement('nav');
            nav.className = 'modern-nav-container';
            areas.forEach(area => {
                const link = document.createElement('a'); link.className = 'modern-link'; link.innerText = area.alt; link.href = area.href;
                if (area.onclick) { link.setAttribute('onclick', area.getAttribute('onclick')); } nav.appendChild(link);
            });
            const oldImg = document.querySelector('img[usemap="#linkmap"]');
            if (oldImg) { oldImg.parentNode.replaceChild(nav, oldImg); } else { map.parentNode.insertBefore(nav, map); }
            map.remove();
        }
        // === YENİ: new_05.gif toolbar dönüştürücüsü ===
        (function () {
            const allToolbarTds = document.querySelectorAll('td[background*="new_05.gif"]');
            allToolbarTds.forEach(td => { td.style.setProperty('display', 'table-cell', 'important'); td.style.background = 'var(--maim)'; td.style.backgroundImage = 'none'; });
            const toolbarTdWithContent = Array.from(allToolbarTds).find(td => td.querySelector('a img') || td.querySelector('input[type="button"]'));
            if (!toolbarTdWithContent) return;
            const labelMap = {
                'admin.gif': 'SİGORTA YETKİLİSİ',
                'bilgilerim.gif': 'BİLGİLERİMİ GÜNCELLE',
                'talep.gif': 'MARKA MODEL TALEPLER',
                'servis.gif': 'SERVİS EKLEME TALEBİ',
            };
            const toolNav = document.createElement('div');
            toolNav.className = 'modern-nav-container';
            toolNav.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px 32px;padding:10px 24px;align-items:center;justify-content:flex-start;margin:4px;';
            toolbarTdWithContent.querySelectorAll('a').forEach(a => {
                const img = a.querySelector('img');
                if (!img) return;
                const src = img.src.split('/').pop();
                const label = labelMap[src] || src.replace('.gif', '').toUpperCase();
                const link = document.createElement('a');
                link.className = 'modern-link';
                link.innerText = label;
                link.href = 'javascript:void(0)';
                if (a.getAttribute('href')) link.href = a.getAttribute('href');
                if (a.getAttribute('onclick')) link.setAttribute('onclick', a.getAttribute('onclick'));
                toolNav.appendChild(link);
            });
            toolbarTdWithContent.querySelectorAll('input[type="button"]').forEach(btn => {
                const link = document.createElement('a');
                link.className = 'modern-link';
                link.innerText = btn.value;
                link.href = 'javascript:void(0)';
                if (btn.getAttribute('onclick')) link.setAttribute('onclick', btn.getAttribute('onclick'));
                toolNav.appendChild(link);
            });
            toolbarTdWithContent.innerHTML = '';
            toolbarTdWithContent.appendChild(toolNav);
        })();
        // === YENİ bölüm sonu ===
        const mapfrefix = ` html, body { zoom: 0.99 !important; -moz-transform: scale(0.99); -moz-transform-origin: 0 0; overflow-x: auto !important; } `;
        if (location.href.includes("otohasar") && location.href.includes("mapfre")) { GM_addStyle(mapfrefix); }
        if (location.href.includes("otohasar")) { GM_addStyle(oceanicTheme); if (location.href.includes("eks_hasar_yp_list")) { setTimeout(formatTedarikciler, 500); } }
    }
    else if (url.includes("otohasar") && (url.includes("eks_hasar_yedpar_yeni_ref") || url.includes("eks_hasar_yedpar_yeni_liste"))) {
        document.documentElement.requestFullscreen?.();
        const cssss = `
            :root {
                --bg: #eef1f6;
                --card: #ffffff;
                --border: #dfe3ea;
                --text: #1e2430;
                --text-soft: #6b7280;
                --primary: #2980b9;
                --primary-dark: #4338ca;
                --primary-light: #eef0ff;
                --accent-red: #e11d48;
                --accent-blue: #2563eb;
                --accent-green: #16a34a;
                --dark: #1f2430;
            }
            html, body { background: var(--bg) !important; font-family: "Segoe UI", "Inter", Roboto, Arial, sans-serif !important; color: var(--text) !important; }
            * { font-family: "Segoe UI", "Inter", Roboto, Arial, sans-serif !important; }
            /* ---- Eski arkaplan renklerini modern kartlara dönüştür ---- */
            td[bgcolor="#FFFFFF"] { background-color: var(--card) !important; }
            td[bgcolor="#E1E1D7"], td[valign*="top"] {
                background: linear-gradient(180deg, #ffffff 0%, #f7f8fc 100%) !important;
                border: 1px solid var(--border) !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(16,24,40,0.10) !important;
                margin: 0 auto !important;
                text-align: center !important;
            }
            td[bgcolor="#EEEEE7"], td[bgcolor="#EDEDD5"] {
                background: var(--card) !important;
                border: 1px solid var(--border) !important;
                border-radius: 8px !important;
                box-shadow: 0 2px 8px rgba(16,24,40,0.08) !important;
                margin: 0 auto !important;
				text-align: center !important;
            }
			table { margin: 0 auto !important; float: none !important; }
            /* Süs amaçlı kenarlık gif'lerini temizle */
            img[src*="01.gif"], img[src*="02.gif"], img[src*="03.gif"],
            img[src*="04.gif"], img[src*="05.gif"], img[src*="06.gif"],
            img[src*="0101.gif"], img[src*="0102.gif"], img[src*="0103.gif"],
            img[src*="0201.gif"], img[src*="0202.gif"],
            img[src*="0401.gif"], img[src*="0402.gif"]
			{ opacity: 0 !important; background-color: var(--primary-light) !important; background-image: url("") !important; display: none !important; }
			/*img[src*="giris_uyari"] { opacity: 0 !important; background-color: var(--primary-light) !important; background-image: url("") !important; display: none !important; padding:0px !important; margin:0px !important; height:0px !important;}*/

            td[background*="back01.gif"] { background-image: none !important; background-color: var(--primary-light) !important; border-radius: 6px !important; }
            td[background*="back002.gif"] { background-image: none !important; background-color: var(--primary) !important; }
            td[background*="back02.gif"] { background-image: none !important; background-color: #f5f6fa !important; }
            td[background*="back001.gif"] { background-image: none !important; background: #f4f5f9 !important; border: 1px solid #d8dbe3 !important; border-radius: 6px !important; }
            td[background*="back001.gif"].text_kirmizi_bold { color: #e44242 !important; background: #f4f5f9 !important; }
            td[background*="back001.gif"] input,
            input#ISCILIK_TUTAR, input#BOYA_ISCILIK_TUTAR, input#TOPLAM_TUTAR { background: #ffffff !important; color: var(--text) !important; font-weight: 700 !important; border: 1px solid #d8dbe3 !important; }
            /* ---- Form elemanları ---- */
            input[type="text"], input[type="Text"], select, textarea {
                border: 1px solid var(--border) !important;
                border-radius: 5px !important;
                background-color: var(--card) !important;
                color: var(--text) !important;
                box-shadow: inset 0 1px 2px rgba(16,24,40,0.03) !important;
                transition: border-color .12s ease, box-shadow .12s ease;
            }
            input[type="text"]:hover, select:hover { border-color: #b7bcc6 !important; }
            input[type="text"]:focus, select:focus, textarea:focus { outline: none !important; border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.15) !important; }
            input.box_disabled, input[readonly] { background-color: #f3f4f7 !important; color: var(--text-soft) !important; box-shadow: none !important; }
            input[type="checkbox"], input[type="Checkbox"], input[type="radio"], input[type="Radio"] { accent-color: var(--primary) !important; cursor: pointer; }
            /* ---- Etiket renkleri ---- */
            td.text_kirmizi_bold { color: #e44242 !important; font-weight: 700 !important; }
            td.text_mavi { color: var(--accent-blue) !important; font-weight: 600 !important; }
            td.text_yesil { color: var(--accent-green) !important; font-weight: 600 !important; }
            td.text_beyaz { color: #ffffff !important; font-weight: 600 !important; letter-spacing: .2px; }
            /* ---- Linkler ---- */
            a { color: var(--primary) !important; }
            a:hover { color: var(--primary-dark) !important; }
            /* ---- Butonlar (boyut aynı, sadece görünüm) ---- */
            input.BUTON01, input[type="Button"] {
                background: linear-gradient(180deg, #6366f1, var(--primary)) !important;
                color: #fff !important;
                border: 1px solid var(--primary-dark) !important;
                border-radius: 5px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                box-shadow: 0 1px 2px rgba(79,70,229,0.25) !important;
                transition: filter .12s ease, transform .08s ease;
                padding: 0 20px !important;
                height: 24px !important;
                line-height: 0px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            input.BUTON01:hover, input[type="Button"]:hover { filter: brightness(1.08); }
            input.BUTON01:active, input[type="Button"]:active { transform: translateY(1px); }
            /* ---- Tablo başlık satırları (YP.İsk vb header) ---- */
            table[width="95%"] tr:first-child td { color: var(--text-soft) !important; font-weight: 600 !important; }
            /* ---- iframe ---- */
            iframe { border: 1px solid var(--border) !important; background: var(--card) !important; }
            /* ---- Mavi bilgi kutusu (Eksper fiyat notu) ---- */
            div[style*="color:#0000ff"] { background: var(--primary-light) !important; color: var(--primary-dark) !important; border: 1px solid #c7d2fe !important; }
            /* ---- Scrollbar (modern tarayıcılarda) ---- */
            ::-webkit-scrollbar { width: 10px; height: 10px; }
            ::-webkit-scrollbar-track { background: #f1f2f6; }
            ::-webkit-scrollbar-thumb { background: #c7cbd4; border-radius: 5px; }
            ::-webkit-scrollbar-thumb:hover { background: #a6acb8; }
            /* ---- Sol menü ikonlarını sade şekilde modernleştir (orijinal görseller kalır) ---- */
            a img { border-radius: 6px; transition: filter .12s ease, transform .1s ease; }
            a:hover img { filter: brightness(1.06) saturate(1.1); transform: translateY(-1px); }
            /* ---- Parça listesi tablosu (sağ panel) ---- */
            td.baslik { background: linear-gradient(180deg, #6366f1, #4338ca) !important; color: #fff !important; }
            td.baslik a, td.baslik b { color: #fff !important; }
            tr[bgcolor="#79C4D8"] { background: linear-gradient(180deg, #6366f1, #4338ca) !important; }
            td.text { color: var(--text) !important; }
            td.text a.text { color: var(--text) !important; }
            td.text a.text:hover { color: var(--primary) !important; }
            tr[bgcolor="f0f7f9"] { background-color: #ffffff; }
            tr[bgcolor="e8f3f6"] { background-color: #f6f8fc; }
            .tm-kaydet-btn {
                display: inline-flex !important;
                align-items: center !important;
                gap: 8px !important;
                background: #dc2626 !important;
                color: #ffffff !important;
                text-decoration: none !important;
                font-family: Arial, sans-serif !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                letter-spacing: 0.5px !important;
                padding: 6px 18px !important;
                border-radius: 12px !important;
                border: 2px solid #b91c1c !important;
                box-shadow: 0 2px 0px #991b1b, 0 4px 8px rgba(185,28,28,0.25) !important;
                transition: all 0.1s !important;
                cursor: pointer !important;
                position: relative !important;
                top: 0 !important;
            }
            .tm-kaydet-btn:hover { background: #ef4444 !important; color: #ffffff !important; box-shadow: 0 3px 0px #991b1b, 0 6px 12px rgba(185,28,28,0.30) !important; top: -1px !important; }
            .tm-kaydet-btn:active { background: #b91c1c !important; color: #ffffff !important; box-shadow: 0 0px 0px #991b1b !important; top: 2px !important; }
			a[href*="ekspertiz_1.php"] {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: linear-gradient(180deg, #6366f1, var(--primary)) !important;
                color: #fff !important;
                font-size: 10px !important;
                font-weight: 600 !important;
                text-decoration: none !important;
                border: 1px solid var(--primary-dark) !important;
                border-radius: 5px !important;
                padding: 0 20px !important;
                height: 24px !important;
                cursor: pointer !important;
                box-shadow: 0 1px 2px rgba(79,70,229,0.25) !important;
                text-transform: uppercase !important;
            }
            a[href*="ekspertiz_1.php"] img { display: none !important; }
            a[href*="ekspertiz_1.php"]::after { content: "ÖZET" !important; }
            a[href*="ekspertiz_1.php"]:hover { filter: brightness(1.08) !important; }
            a[href*="ekspertiz_1.php"]:active { transform: translateY(1px) !important; }
            table[width="40%"] tr td:has(input[type="Checkbox"]),
            table[width="40%"] tr td:has(input[type="checkbox"]) { display: none !important; }
            table[width="40%"] tr td.text_mavi {
                background: #e2e8f0 !important;
                color: #64748b !important;
                font-weight: 700 !important;
                border-radius: 5px !important;
                padding: 4px 14px !important;
                cursor: pointer !important;
                border: 2px solid #cbd5e1 !important;
                box-shadow: none !important;
                transition: all .15s ease !important;
                font-size: 11px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
                user-select: none !important;
            }
            table[width="40%"] tr td.text_mavi.tm-aktif { background: linear-gradient(180deg, #6366f1, var(--primary)) !important; color: #fff !important; border-color: var(--primary-dark) !important; box-shadow: 0 2px 0px var(--primary-dark), 0 3px 8px rgba(79,70,229,0.3) !important; }
            table[width="40%"] tr td.text_mavi.tm-disabled { opacity: 0.4 !important; cursor: not-allowed !important; pointer-events: none !important; }
        `;
        const uyari = document.querySelector('img[src*="giris_uyari.gif"]');
        if (uyari) { const tr1 = uyari.closest('tr'); if (tr1) { tr1.style.display = 'none'; } }
        document.querySelectorAll('tr[name="TR"]').forEach(tr => {
            if (tr.style.backgroundColor && tr.style.backgroundColor !== '') { return; }
            const islem = tr.querySelector('td:nth-child(5) a.text');
            if (islem && islem.textContent.trim() !== 'DEĞİŞİM') { tr.style.setProperty('background-color', '#7ae0ff', 'important'); }
        });
        const pairs = [];
        document.querySelectorAll('table[width="40%"] td.text_mavi').forEach(td => { const prev = td.previousElementSibling; const cb = prev?.querySelector('input[type="Checkbox"], input[type="checkbox"]'); if (!cb) { return; } pairs.push({ td, cb }); });
        pairs.forEach(({ td, cb }) => {
            const sync = () => { if (cb.disabled) { td.classList.add('tm-disabled'); td.classList.remove('tm-aktif'); } else { td.classList.remove('tm-disabled'); cb.checked ? td.classList.add('tm-aktif') : td.classList.remove('tm-aktif'); } };
            sync();
            cb.addEventListener('change', () => {
				pairs.forEach(p => { if (p.cb.disabled) { p.td.classList.add('tm-disabled'); p.td.classList.remove('tm-aktif'); } else { p.td.classList.remove('tm-disabled'); p.cb.checked ? p.td.classList.add('tm-aktif') : p.td.classList.remove('tm-aktif'); } }); });
            td.addEventListener('click', () => { if (cb.disabled) { return; } cb.click(); });
        });
        const imgs = document.querySelectorAll('img[src*="kaydet.gif"]');
        imgs.forEach(img => { const link = img.closest('a'); if (!link) { return; } link.classList.add('tm-kaydet-btn'); img.replaceWith(document.createTextNode('Kaydet')); });
        if (typeof GM_addStyle === 'function') { GM_addStyle(cssss); } else { const style = document.createElement('style'); style.textContent = cssss; document.head.appendChild(style); }
    }
    else {
        return;
        // 2. HTML Temizliği
        document.body.innerHTML = document.body.innerHTML.replace(/<br>/g, '');
        document.body.removeAttribute('bgcolor');
        // 3. CSS - Neon & Wave Design
        const style = document.createElement('style');
        style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        body {
            background: #020617 !important;
            background-image:
                radial-gradient(circle at 0% 0%, rgb(99 102 241 / 43%) 0%, transparent 35%), radial-gradient(circle at 100% 100%, rgb(6 182 212 / 33%) 0%, transparent 35%), linear-gradient(135deg, #020617 0%, #405178 100%) !important;
            height: 100vh !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            overflow: hidden;
        }
        form[name="giris"] {
            background: rgba(15, 23, 42, 0.8) !important;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(99, 102, 241, 0.3) !important;
            border-radius: 12px !important;
            padding: 50px !important;
            width: 300px !important;
            box-shadow: 0 0 140px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(99, 102, 201, 0.75) !important;
            position: relative;
            z-index: 1;
        }
        form[name="giris"]::before {
            content: '';
            position: absolute;
            top: -2px; left: -2px; right: -2px; bottom: -2px;
            background: linear-gradient(45deg, #6366f1, transparent, #06b6d4);
            border-radius: 24px;
            z-index: -1;
            filter: blur(10px);
            opacity: 0.3;
        }
        img[src*="logo"] { width: 150px !important; height: auto !important; margin: 0 auto 10px !important; display: block;
            filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 3px rgba(0, 0, 0, 1)) !important; }
        /* Input Grupları */
        .input-group { margin-bottom: 15px !important; text-align: left !important; }
        label {
            color: #a4caff !important;
            font-size: 10px !important;
            font-weight: 700 !important;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px !important;
            display: block !important;
        }
        input , .box {
            width: 100% !important;
			height: 32px !important;
            background: rgba(2, 6, 23, 0.8) !important;
            border: 1px solid #1e293b !important;
            border-radius: 6px !important;
            color: #fff !important;
            padding: 10px 14px !important;
            font-size: 13px !important;
            box-sizing: border-box !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        input:focus { border-color: #6366f1 !important; box-shadow: 0 0 15px rgba(99, 102, 241, 0.3) !important; transform: translateY(-1px); }
		/* --- Güvenlik Kodu Yazısı ve Çerçevesi --- */
        .labelGüvenlikKodu, .labelGüvenlikKodu b, .labelGüvenlikKodu font {
            color: #ffffff !important; /* Yazı bembeyaz */
            font-size: 11px !important;
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            display: inline-block !important;
            font-weight: 600 !important;
        }
        /* --- CAPTCHA YAN YANA HİZALAMA GÜNCELLEMESİ --- */
        #LoginCaptchaForm_CaptchaDiv {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            height: auto !important;
        }
        #LoginCaptchaForm_CaptchaImageDiv {
            display: block !important;
            flex: 1 !important;
            height: 32px !important; /* Çerçeve ve padding payı eklendi */
        }
        #LoginCaptchaForm_CaptchaIconsDiv {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 42px !important;
            height: 32px !important;
        }
        /* Captcha Görselinin Etrafındaki Alan */
        #loginimage, #LoginCaptchaForm_CaptchaImage {
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 8px !important;
            padding: 2px !important;
            background: rgba(255, 255, 255, 0.05) !important;
            max-width: 100% !important;
            height: auto !important;
            box-sizing: border-box !important;
        }
		#LoginCaptcha { margin-top: 14px !important; }
        /* Yenileme Butonu ve BotDetect Sınıfı Ayarları */
        img[onclick*="reloadImages"], .LBD_ReloadIcon {
            width: 18px !important;
            height: 18px !important;
            cursor: pointer;
            filter: invert(1) sepia(1) saturate(5) hue-rotate(180deg) !important; /* Neon Cyan rengi */
            transition: transform 0.3s !important;
        }
        img[onclick*="reloadImages"]:hover, .LBD_ReloadIcon:hover { transform: rotate(180deg); }
        /* Giriş Butonu - Neon */
        button {
            width: 100% !important;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
            color: #fff !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 12px !important;
            font-weight: 800 !important;
            font-size: 13px !important;
            cursor: pointer !important;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4) !important;
            transition: all 0.2s !important;
        }
        button:hover { box-shadow: 0 0 25px rgba(99, 102, 241, 0.6) !important; transform: scale(1.02); }
        /* Linkler */
        a[href*="sifremi"] { color: #81a8e3 !important; font-size: 11px !important; text-decoration: none !important; display: block; text-align: center; margin-top: 15px; }
        a:hover { color: #818cf8 !important; }
    `;
        document.head.appendChild(style);
        // 4. Placeholder ve İsim Bağımsız Seçiciler
        const inputs = [{ id: 'user_name', ph: 'Kullanıcı Adı' }, { id: 'user_pass', ph: 'Şifre' }, { id: 'customer_code', ph: 'Kurum Kodu' }];
        inputs.forEach(item => { const el = document.getElementById(item.id); if (el) el.setAttribute('placeholder', item.ph); });
        const captchaInput = document.querySelector('input[name*="guvenlikkodu"]');
        if (captchaInput) { captchaInput.setAttribute('placeholder', 'Güvenlik Kodu'); captchaInput.style.marginTop = "10px"; }
    }
})();
