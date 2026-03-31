// ==UserScript==
// @name         KS TOOLS - Otoanaliz Oceanic Compact
// @namespace    KS_TOOLS_Otoanaliz_Oceanic
// @version      1.6
// @description  Düzeltilmiş, modern, kompakt tema.
// @author       Saygın
// @match        *://*/*
// @grant        GM_addStyle
// @exclude      *://otohasar.mapfre.com.tr/print*
// @updateURL    https://github.com/sayginkizilkaya/Ks-Tools/raw/main/Ks_Tools_Ocean.user.js
// @downloadURL  https://github.com/sayginkizilkaya/Ks-Tools/raw/main/Ks_Tools_Ocean.user.js
// ==/UserScript==

(function() {
    'use strict';
	const url = unsafeWindow.location.href.toLowerCase();
	const blockedGroups = [ "yazdir", "print", "rapor", "ihbar", "dilekce", "fatura", "makbuz", "dekont", "invoice", "receipt", "barcode", "kimlik", "kart"];
    if (blockedGroups.some(word => url.includes(word))) { return; }
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
            --font: 'Inter', 'Segoe UI', sans-serif ;
        }

        /* 1. GENEL TEMİZLİK */
        body {
            background-color: var(--bg-body) ;
            background-image: none ;
            color: var(--text-dark) ;
            font-family: var(--font);
        }
        table {
            text-align: left !important;
            border-collapse: separate !important;
            table-layout: auto !important;
            max-width: 100vw !important; /* Ekran genişliğini asla geçemez */
        }
        /* Boşluk yapan ve tasarımı bozan hücreleri/resimleri gizle */
        td[width="273"], td[height="67"], td[background*="new_10.gif"],
        td[background*="new_05.gif"], td[background*="new_18-9.gif"],
        img[src*="new_10.gif"], img[src*="new_02.gif"], object, embed {
            display: none ;
        }

        /* 2. HEADER & KURUMSAL BAŞLIK */
        td[bgcolor="#000066"], td[bgcolor="#FF0000"] {
            background-color: var(--maim) ;
            border: none ;
        }
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
           content: var(--site-adi, " - "); /* JS'den gelen isim */
           display: block;
           color: var(--primary);
           font-family: var(--font);
           font-size: 15px;
           font-weight: 600;
           letter-spacing: 2px;
           padding: 0px 5px;
           margin-bottom: 5px; /* Alttaki Hoş Geldin ile mesafe */
           opacity: 0.7;
           transition: all 0.4s ease;
       }

       .hosgeldin:hover::before {
           opacity: 1;
           text-shadow: 0 0 8px var(--primary);
       }

       /* Panel Kapsayıcısı */
      .modern-nav-container {
          display: flex;
          flex-wrap: wrap;
          gap: 40px;
          padding: 12px 40px;
          justify-content: center;
          align-items: center;

          background: linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2));
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);

          /* Kenarlık: Daha ince ve yukarıdan ışık vuruyormuş gibi 
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-top: 1.5px solid rgba(255, 255, 255, 0.9);*/
          border-radius: 24px;
          box-shadow:
              0 4px 6px -1px rgba(0, 0, 0, 0.05),
              0 10px 20px -5px rgba(0, 0, 0, 0.1),
              inset 0 0 15px rgba(255, 255, 255, 0.3);

          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
      }
      .modern-nav-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.15);
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
       .modern-link:hover {
           color: var(--primary) !important;
           letter-spacing: 1.2px;
           transform: translateY(-3px);
           text-shadow: 0 0 10px rgba(var(--primary-rgb, 255, 255, 255), 0.3);
       }
       .modern-link::after {
           content: '';
           position: absolute;
           bottom: -4px; /* Biraz daha aşağı çektik, nefes alsın */
           left: 50%;
           transform: translateX(-50%);
           width: 0%;
           height: 2px;
           background: var(--primary);
           border-radius: 20px;
           box-shadow: 0 0 15px var(--primary), 0 0 5px var(--primary);
           transition: width 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease;
           opacity: 0;
       }

       .modern-link:hover::after {
           width: 100%;
           opacity: 1;
       }
       .modern-link:active {
           transform: translateY(-1px) scale(0.98);
           transition: 0.1s;
       }

       /* Logout - Spesifik Stil */
       .modern-link[href*="logout"] {
           color: var(--reddo) !important;
           opacity: 0.9;
       }
       .modern-link[href*="logout"]:hover {
           color: #ff4d4d !important;
           opacity: 1;
           transform: translateY(-3px) scale(1.05) rotate(-3deg);
           filter: drop-shadow(0 0 8px rgba(255, 77, 77, 0.4));
       }
       .modern-link[href*="logout"]::after {
           background: #ff4d4d;
           box-shadow: 0 0 12px #ff4d4d;
           height: 2px;
       }
       @keyframes slideInSoft {
           0% { opacity: 0;  transform: translateX(-30px) scale(0.98); filter: blur(5px); }
           100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
	   }
	   .modern-nav-container a,
       .modern-nav-container a:hover,
       .modern-nav-container a:visited,
       .modern-nav-container * {
           background-color: none !important;
           text-decoration: none !important;
           border-bottom: none !important;
           outline: none !important;
           transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
       }
        /* 9. ÖNEMLİ BİLGİ METNİ (.yazi) */
        .yazi {
            /*font-size: 14px !important;*/
            /*font-weight: 700 !important;*/
            color: var(--texto) !important;
            /*letter-spacing: 1px !important;*/
            background-color: rgba(255, 255, 255, 0.6) !important;
            border-radius: 4px !important;
        }

        /* Metin içindeki linklerin (dosya no vb.) rengini sabitle */
        .yazi a, .yazi b {
            color: var(--accent) !important;
            text-decoration: underline !important;
        }

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

        tr[background*="new_18.gif"] img { /* İkonlar */
            width: 50px ;
            border: 1px solid rgba(0, 0, 0, 0.1); /* Daha ince ve yarı saydam kenarlık */
            border-radius: 12px; /* Köşeleri biraz daha yuvarladık */
            height: auto ;
        }

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
        td.tb, td[background*="baslik_img02.gif"] {
            background: #f8fafc ;
            border-left: 4px solid var(--primary) ;
            color: var(--accent) ;
            font-weight: 700 ;
            text-align: center ;
        }
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

        /* Başlık içindeki linkler (Sipariş, İade vb. "check_all" linkleri) */
        .koyubaslik a {
            color: var(--maim) !important;
            text-decoration: none !important;
            border-bottom: 1px dashed rgba(255, 255, 255, 0.5) !important;
            transition: all 0.2s !important;
        }

        .koyubaslik a:hover {
            color: var(--primary-light) !important;
            border-bottom-style: solid !important;
        }

        /* Tablo satırına genel bir derinlik kat */
        tr:has(> .koyubaslik) {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }

        /* 5. BUTONLAR: MODERN & ANİMASYONLU */
        .buton01, .BTNKIRMIZI, .BUTON06, input[type="submit"], input[type="button"] {
            height: 20px !important;
            font-size: 10px !important;
            font-weight: 500 !important;
            border-radius: 3px !important;
            border: none !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2) !important;

            /* Animasyon Hazırlığı */
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            position: relative !important;
            overflow: hidden !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
        }

        /* HOVER: Üzerine gelince parlaması ve hafif yukarı kalkma hissi */
        .buton01:hover, .BTNKIRMIZI:hover, .BUTON06:hover,
        input[type="submit"]:hover, input[type="button"]:hover {
            filter: brightness(1.1) !important;
            box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3) !important;
            transform: translateY(-1px) !important; /* Boyutu büyütmez, sadece konumunu 1px kaydırır */
        }

        /* ACTIVE: Basılma efekti (tıklayınca içeri göçer) */
        .buton01:active, .BTNKIRMIZI:active, .BUTON06:active,
        input[type="submit"]:active, input[type="button"]:active {
            transform: translateY(1px) !important;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2) !important;
        }

        .BTNKIRMIZI {
            background: linear-gradient(180deg, var(--reddo-light) 0%, var(--reddo) 100%) !important;
        }
        .BTNKIRMIZI:hover {
            box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3) !important;
        }

        /* 5.1 ÖZEL KAYDET BUTONU (KIRMIZI & ANİMASYONLU) */
        #btnKaydet2, input[name="btnKaydet2"], input[value="KAYDET"] {
            background: linear-gradient(180deg, var(--reddo-light) 0%, var(--reddo) 100%) !important;
            color: var(--maim) !important;
            border: 1px solid var(--reddo-dark) !important;
            box-shadow: 0 2px 5px rgba(255, 71, 87, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }

        /* Kaydet Hover: Kırmızı parlama */
        #btnKaydet2:hover, input[name="btnKaydet2"]:hover, input[value="KAYDET"]:hover {
            filter: brightness(1.2) !important;
            box-shadow: 0 0 12px rgba(255, 71, 87, 0.7) !important; /* Kırmızı Neon Parlaması */
            transform: translateY(-1px) scale(1.02) !important; /* Çok hafif bir sıçrama efekti */
        }

        /* Kaydet Click: Basılma hissi */
        #btnKaydet2:active, input[name="btnKaydet2"]:active {
            transform: translateY(1px) scale(0.98) !important;
            box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.3) !important;
        }

        /* 5.2 ÖZEL AÇIK RENKLİ BUTONLAR (YENİ KAYIT, MOBİL ONARIM, TEDARİK) */
        input[value="YENİ KAYIT"],
        input[value="MOBİL ONARIM"],
        input[value="TEDARİKCİYE GÖNDER"],
        input[value="  TEDARİKCİYE GÖNDER  "],
        input[value="  GÖNDER   "],
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
        input[value="TED. PARÇA LİSTESİ"] {
            background: linear-gradient(180deg, var(--accent) 0%, #1f442a 100%) !important;
            color: var(--maim) !important;
            border: 1px solid var(--accent) !important;
            box-shadow: 0 2px 5px #293b41, inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
        }
        input[value="İHBAR YAZDIR"] {
            background: linear-gradient(180deg, #434f53 0%, #1f442a 100%) !important;
            color: var(--maim) !important;
            border: 1px solid var(--accent) !important;
            box-shadow: 0 2px 5px #293b41, inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
        }

        /* Inputlar */
        input[type="text"], select {
            background: var(--primary-light);
            border: 1px solid var(--border-soft) ;
            border-radius: 4px ;
        }
        /* 7.1 READONLY & DISABLED FOCUS DURUMU (SEÇİLDİĞİNDE DEĞİŞMESİN) */
        input:disabled,
        select:disabled,
        textarea:disabled,
        input[readonly],
        select[readonly],
        textarea[readonly],
        .box_disabled, input:disabled,
        input[readonly]:focus,
        input:disabled:focus,
        textarea[readonly]:focus,
        textarea:disabled:focus {
            background-color: var(--disabled) !important; /* Koyu gri/mavi tonu */
            color: var(--maim) !important;            /* Açık gri/beyaz yazı */
            border-color: var(--disabled) !important;    /* Kenarlık rengini de koyulaştır */
            cursor: not-allowed !important;       /* Yasak işareti imleci */
            opacity: 1 !important;                /* Bazı tarayıcılardaki solukluğu engeller */

        }

        /* Metin seçildiğinde (farenin sol tıkıyla tarama yapıldığında) oluşacak renkler */
        input[readonly]::selection,
        input:disabled::selection {
            background-color: var(--maim) !important;    /* Seçilen kısmın arka planı yazı renginiz olsun */
            color: var(--disabled) !important;           /* Seçilen kısmın yazısı koyu kalsın */
        }

        /* 8. ICON HOVER NEON EFFECT */
        td[align="center"] a:hover img {
            filter: drop-shadow(0 0 8px rgba(52, 152, 219, 0.8))
                    drop-shadow(0 0 12px rgba(52, 152, 219, 0.4)) !important;
            transform: scale(1.1) !important; /* Hafifçe büyüterek etkileşimi artırır */
            transition: all 0.2s ease-in-out !important;
        }

        /* Tıklanabilir alanı daha belirgin yapmak için opsiyonel */
        td[align="center"] a {
		    filter: brightness(1.2) !important;
            display: inline-block !important;
            text-decoration: none !important;
        }

        /* --- OCEANIC THEME COMPATIBILITY LAYER --- */
		.kirmizi {
			background-color: color-mix(in srgb, var(--maim), var(--reddo) 14%);
		}
        /* 2. VERİ HÜCRELERİ (SABİT GÖRÜNÜM) */
        .koyu, .koyu_yangin, .koyu01, .koyu_text, .acik_cam {
            background-color: color-mix(in srgb, var(--maim), var(--texto) 4%);
            color: var(--text-dark);
            border: 1px solid rgba(0,0,0,0.05) !important;
        }

        .acik, .acik_yangin, .acik_text, .beyaz_liste, .yazi, .yazi1 {
            background-color: var(--maim);
            color: var(--text-dark);
            border-bottom: 1px solid #e2e8f0 !important;
        }

        /* 3. BAŞLIKLAR */
        .koyubaslik, .koyubaslik_text, .koyubaslik01, .koyubaslik01_text, .koyubaslik_, .tb {
            background: linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%);
            color: var(--maim) !important;
            border: none !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important;
        }
        /* 4. INPUTLAR & FORM ELEMANLARI */
        input, select, textarea, .box01, .select01, .textarea {
            background-color: color-mix(in srgb, var(--maim), white 70%) !important;
            border: 1px solid var(--border-soft) !important;
            border-radius: 4px !important;
            box-sizing: border-box !important;
            animation: inputEntry 0.6s ease-out;
            transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.3s ease !important;
        }

        /* Odaklanma (Tıklama) Animasyonu: Cafcaflı değil, pürüzsüz bir vurgu */
        input:focus, select:focus, textarea:focus {
            outline: none !important;
            border-color: var(--reddo-light) !important;
            box-shadow: 0 0 0 3px rgba(51, 65, 85, 0.08) !important;
            background-color: white !important;
            animation: inputEntry 0.6s ease-out;
            transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.3s ease !important;
        }

        input[size="85"], .textarea_buyuk, input[name*="YP_"] { min-width: 150px !important; transition: min-width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important; }
        input[size="85"]:focus { min-width: 200px !important; }

        /* 5. BUTONLAR (TAM UYUMLU) */
        .BUTON01, .BUTON02, .BUTON03, .BUTON06, .BTNKIRMIZI, .BUTON_YESIL, input[type="submit"] {
            height: 24px !important;
            border-radius: 4px !important;
            text-transform: uppercase !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
            border: none !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
		input.buton01[value="Ok"],input.buton01[value=" Ok "] {
		    background: var(--reddo) !important;
		    color: white !important;
		    transition: all 0.3s ease !important;
		    box-shadow: 0 2px 5px rgba(46, 204, 113, 0.3) !important;
		}
		input.buton01[value="Ok"]:hover,input.buton01[value=" Ok "]:hover {
		    background: var(--reddo-light) !important;
		    transform: translateY(-2px) scale(1.05) !important;
		    box-shadow: 0 4px 12px rgba(46, 204, 113, 0.4) !important;
		}

        /* Mavi Butonlar */
        .BUTON01 { background: var(--primary) !important; color: var(--maim) !important; }
        .BUTON02, .BUTON03, .BTNKIRMIZI { background: #e74c3c !important; color: var(--maim) !important; }
        .BUTON06, .BUTON_YESIL { background: #27ae60 !important; color: var(--maim) !important; }
        .BUTON01:hover, .BTNKIRMIZI:hover { filter: brightness(1.2) !important; transform: translateY(-1px) !important; }

        /* 6. LİNKLER - Genel Yapı */
        a, .link, .link01, .linkyp, .dosya_menu, .menu {
            color: var(--accent) !important;
            filter: brightness(1.15);
            text-decoration: none !important;
            border-bottom: none !important;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.175) !important;
            display: inline-block;
        }
        a:hover, .link:hover, .link01:hover, .linkyp:hover, .dosya_menu:hover, .menu:hover {
            color: var(--reddo) !important;
            text-decoration: none !important;
            border-bottom: none !important;

            /* Animasyon efektleri */
            transform: scale(1.02) translateY(-1px) !important;
            filter: brightness(1.1);

            /* Alt çizgiyi yapan ghost elementler varsa temizle */
        }
        a::after, a::before {
            display: none !important;
        }

        /* 7. ÖZEL DURUMLAR */
        .cizgi { background-color: var(--border-soft) !important; height: 1px !important; }
        .hosgeldin { color: var(--primary) !important; font-size: 14px !important; border-left: 4px solid var(--primary) !important; }
        .acik_yansanayi { background-color: #ffeb3b !important; color: #856404 !important; }
        .kirmizi, .kirmizi1 { color: #e74c3c !important; }
		td.tb[background*="baslik_img02.gif"] {
		    color: var(--accent) !important; /* Tam siyah yapar */
		}

        /* Animasyonlu Buton */
        #btnStream { animation: blinkingText 1.5s infinite !important; }
        @keyframes fadeInSmooth { from { opacity: 0; } to { opacity: 1; } }
        @keyframes inputEntry { from { opacity: 0; filter: brightness(1.2); } to { opacity: 1; filter: brightness(1); } }

		/* 1. Butonun Ana Stil Ayarları (Daha sade ve profesyonel) */
        a[onclick*="document.yedparforhasar.submit"] {
            display: inline-flex !important; /* İçeriği merkeze almak için */
            align-items: center;
            justify-content: center;
            min-width: 100px; /* Yazı sığsın diye genişlik */
            height: 20px;     /* Sabit yükseklik */
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
        a[onclick*="document.yedparforhasar.submit"] img {
            display: none !important;
        }
        a[onclick*="document.yedparforhasar.submit"]::after {
            content: "KAYDET" !important;
            display: block !important;
            visibility: visible !important;
            color: white !important;
        }
        a[onclick*="document.yedparforhasar.submit"]:hover {
            transform: scale(1.02);
            background: linear-gradient(180deg, #ff0000 0%, #b71c1c 100%) !important;
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .tm-tedarik-container {
            /* Genişlik ayarları */
            /*width: 100% !important;
            min-width: 600px !important;*/
            background: var(--maim) !important;
            border: 1px solid var(--border-soft) !important;
            border-radius: 10px !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
            overflow: hidden !important;
            display: block !important;
        }
        .tm-tedarik-header {
            background: var(--primary) !important;
            color: var(--maim) !important;
            border-bottom: 1px solid var(--border-soft) !important;
        }
        .tm-tedarik-list {
            max-height: 100px !important;
            overflow-y: 100vw !important;
            overflow-x: hidden !important;
            display: flex !important;
            flex-direction: column !important;
        }
        .tm-tedarik-item {
            border-bottom: 1px solid  var(--maim) !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            transition: background 0.2s !important;
        }
        .tm-tedarik-item:hover {
            background: var(--primary-light) !important;
        }
        .tm-firm-name {
            font-size: 11px !important;
            font-weight: 600 !important;
            color: #334155 !important;
        }
        .tm-firm-rate {
            font-size: 11px !important;
            font-weight: 800 !important;
            border-radius: 4px !important;
        }
        .tm-high {
            background: #fee2e2 !important; /* Hafif kırmızı arka plan */
            color: #991b1b !important;      /* Koyu kırmızı metin */
            border: 1px solid #fecaca !important;
        }
        .tm-zero {
            background: #dcfce7 !important; /* Hafif yeşil arka plan */
            color: #166534 !important;      /* Koyu yeşil metin */
            border: 1px solid #bbf7d0 !important;
        }
        /* Scrollbar tasarımı */
        .tm-tedarik-list::-webkit-scrollbar { width: 6px; }
        .tm-tedarik-list::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }
        .tm-tedarik-list::-webkit-scrollbar-track { background: #f1f5f9; }

    `;
    function initSiteName() {
        const hosgeldinElement = document.querySelector('.hosgeldin');
        if (hosgeldinElement) {
            const hostname = window.location.hostname;
            const siteName = hostname.replace('otohasar.', '').split('.')[0].toUpperCase();
            hosgeldinElement.style.setProperty('--site-adi', `"${siteName} - "`);
            return true;
        }
        return false;
    }
    const checkExist = setInterval(function() { if (initSiteName()) { clearInterval(checkExist); } }, 100);
    setTimeout(() => clearInterval(checkExist), 5000);

    const formatTedarikciler = () => {
        const targetFont = Array.from(document.querySelectorAll('td.text font, td font, td.text'))
            .find(el => el.innerText.includes('BU DOSYA TEDARİĞE UYGUNDUR'));

        if (!targetFont) return;

        const parentTd = targetFont.closest('td');
        if (parentTd.dataset.processed === "true") return;

        // 1. Orijinal içeriği yedekle
        const originalContent = parentTd.innerHTML;

        // 2. Veriyi işle
        let cleanText = targetFont.innerText.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');
        let content = cleanText.split('BU DOSYA TEDARİĞE UYGUNDUR:')[1] || "";
        let firms = content.split(/,(?![^\(]*\))/).map(item => {
            item = item.trim();
            // Oranı yakala: (%35.00)
            const rateMatch = item.match(/\((%\d+\.\d+)\)/);
            const rate = rateMatch ? rateMatch[1] : "%0.00";

            // Firma adını temizle (yüzde kısmını kaldır)
            const name = item.replace(/\(%\d+\.\d+\)/, '').trim();

            return { name, rate };
        }).filter(f => f.name.length > 2);

        // 3. Dinamik Renk Belirleme Fonksiyonu
        const getRateClass = (rateStr) => {
            const numericRate = parseFloat(rateStr.replace('%', ''));
            if (numericRate >= 60) {
                return 'tm-high'; // %60 ve üzeri için Kırmızı
            } else if (numericRate > 0) {
                return 'tm-active'; // %0'dan büyük ama %60'tan küçükler
            } else {
                return 'tm-zero'; // %0 için
            }
        };

        // 4. Modern Liste HTML'ini oluştur
        const itemsHtml = firms.map(f => `
            <div class="tm-tedarik-item" style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0;">
                <span class="tm-firm-name" style="font-size: 12px;">${f.name}</span>
                <span class="tm-firm-rate ${getRateClass(f.rate)}" style="font-weight: bold; min-width: 60px; text-align: right;">${f.rate}</span>
            </div>
        `).join('');

        // 5. Wrapper ve Buton
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
        // Toggle Buton Fonksiyonu
        const toggleBtn = document.getElementById('view-toggle-btn');
        const modernDiv = document.getElementById('modern-view');
        const originalDiv = document.getElementById('original-view');

        toggleBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (modernDiv.style.display === "none") {
                modernDiv.style.display = "block";
                originalDiv.style.display = "none";
                this.innerText = "ORİJİNAL LİSTEYİ GÖSTER";
            } else {
                modernDiv.style.display = "none";
                originalDiv.style.display = "block";
                this.innerText = "MODERN LİSTEYE DÖN";
            }
        });
    };
    const map = document.querySelector('map[name="linkmap"]');
    if (map) {
        const areas = map.querySelectorAll('area');
        const nav = document.createElement('nav');
        nav.className = 'modern-nav-container';

        areas.forEach(area => {
            const link = document.createElement('a');
            link.className = 'modern-link';
            link.innerText = area.alt;
            link.href = area.href;

            if (area.onclick) link.setAttribute('onclick', area.getAttribute('onclick'));

            nav.appendChild(link);
        });
        // Eski resmi bul ve yeni panelle değiştir
        const oldImg = document.querySelector('img[usemap="#linkmap"]');
        if (oldImg) {
            oldImg.parentNode.replaceChild(nav, oldImg);
        } else {
            map.parentNode.insertBefore(nav, map);
        }
        map.remove();
    }
    const mapfrefix = `
    	html, body {
            zoom: 0.99 !important;
            -moz-transform: scale(0.99);
            -moz-transform-origin: 0 0;
			overflow-x: auto !important;
        }
    `;
	if (location.href.includes("otohasar")&&location.href.includes("mapfre")) { GM_addStyle(mapfrefix);}
    if (location.href.includes("otohasar")) { GM_addStyle(oceanicTheme); if (location.href.includes("eks_hasar_yp_list")) { setTimeout(formatTedarikciler, 500); } }
})();
