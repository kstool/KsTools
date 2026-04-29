# 🛠️ KS TOOLS - Gelişmiş Otoanaliz & Ekspertiz Kontrol Merkezi

**KS TOOLS**, otomotiv ekspertiz ve sigorta hasar süreçlerini modernize etmek için geliştirilmiş, yüksek performanslı bir **Userscript (Tampermonkey)** çözümüdür. 

Başta **Otoanaliz**, **SBM**, **Türkiye Sigorta**, **Hithasar sistemini kullanan Quick-Corpus-Anadolu vs.(osea tech)** ve **Sahibinden** olmak üzere, bilirkişi ve sigorta uzmanlarının günlük kullandığı platformlara gelişmiş otomasyon ve dinamik bir arayüz (HUD) kazandırır.

---

## ✨ Öne Çıkan Özellikler

### 📊 Akıllı HUD & Kontrol Merkezi
* **Dinamik Durum Paneli:** Ekranın sol alt köşesinde, aracın versiyonunu takip edebilir, ayarlara girebilir ve hızlıca güncelleyebilirsiniz.
* **Merkezi Ayar Menüsü (Modal):** ⚙️ İkonu ile tetiklenen, modülleri kategorik olarak (Otoanaliz, Ek Paneller, Ek Modüller) yönetmenizi sağlayan şık arayüz.
* **Görsel Denetim:** "Girilmeyen Hücre Boyama" özelliği ile veri setlerindeki eksikleri anında fark edin.

### 🧩 Fonksiyonel Otomasyonlar
* **Kilit Açıcı (Unlocker):** Formlardaki `disabled` veya `readonly` kısıtlamalarını aşarak veri girişine olanak tanır.
* **Hızlı Medya Yönetimi:** WhatsApp Web ve SBM üzerinden tutanak/hasar resimlerini tek tıkla toplu indirme.
* **Piyasa Analizi:** Sahibinden.com üzerinde ortalama KM ve fiyat endekslerini takip eden yardımcı araçlar.

---

## 🚀 Modül Kapsamı ve Çalışma Alanları

Script, yalnızca ilgili sayfaya girdiğinizde devreye giren "Smart-Trigger" (Akıllı Tetikleyici) yapısına sahiptir:

### 1. Otoanaliz (Otohasar) Modülleri
| Modül | Görev | Hedef Sayfalar |
| :--- | :--- | :--- |
| **Hızlı Ön Giriş** | Dosya takip ve durum analizi | `eks_hasar.php` |
| **Referans Panelleri** | Parça referans ve talep yönetimi | `yp_list`, `yp_talep`, `talep_yp_ayrinti` |
| **Manuel Parça Giriş** | Tekli/Çoklu parça giriş hızı | `yedpar_yeni_ref`, `yedpar_multi` |
| **Hızlı Donanım Girişi** | Araç donanım özelliklerini eşleme | `magdur_arac_donanim`, `arac_donanim` |
| **Medya Kontrol Modülü** | Çoklu resim yükleme ve yükleme yardımı kontrolleri | `evrak_foto_list`, `multi_file_upload` |
| **Bildirim Engelleyici** | Otoanaliz sayfa içi kontrol engelleyen fazla uyarıları engelleme | `eks_hasar.php` |

### 2. Sigorta & Piyasa Entegrasyonları
* **SBM Portalı:** Genel sorgu ekranlarında hızlı seçim, KTT listelerinde sayıların 3'lü bölümlenmesi ve tutanak resimlerinin indirilmesi.
* **Otoanaliz:** Otoanaliz portalları için optimize edilmiş tam uyumlu veri işleme araçları.
* **Türkiye Sigorta:** Yan kaydırma menüsü, hızlı giriş yöntemleri ile uyumlu veri işleme araçları.
* **Quick-Corpus-Anadolu Sigorta:** Hızlı giriş ve parça kategorisi randomize ederek girme yöntemleri.
* **Sahibinden:** Piyasa araştırması ve rayiç bedel tespiti için KM/Fiyat analiz desteği.
* **WhatsApp Web:** Ekspertiz dosyalarına gelen medyalara hızlı indirme yöntemi.

---

## 🛠️ Teknik Detaylar

* **Mimari:** Modern JavaScript (ES6+).
* **UI/UX:** `Fütüristik` ve `Siber` stillerine sahip panel tasarımı, `Exo 2` google font ailesi, hafif ve dikkat çeken renk paleti.
* **Performans:** `setInterval` ve değişiklik takip kontrolü optimizasyonları ile sayfa yüklerini etkilemeden çalışır.
* **Depolama:** Kullanıcı tercihleri `GM_getValue` ile tarayıcı yerelinde (local) güvenle saklanır.
* **Yazıcı Dostu:** Arayüzler Rapor çıktıları alımı sırasında (`@media print`) panel kendini otomatik olarak gizler.

---

## 📥 Kurulum

1.  Tarayıcınıza [Tampermonkey](https://www.tampermonkey.net/) eklentisini kurun.
2.  `ks_tools.user.js` dosyasına tıklayarak açın.
3.  Sağ taraftan **"RAW"** butonuna basarak yükleyici paneline geçin.
4.  Tampermonkey ekranında **"Yükle"** butonuna basarak kurulumu tamamlayın.
5.  Desteklenen sitelerden birini açtığınızda **KS TOOLS** paneli otomatik olarak ekranın sağ altında belirecektir.
6.  **Dikkat:** Eğer kod çalışmıyor durumda ise tarayıcı eklentilerinden kod-script çalıştırma iznini aktif edin.

##  Ekran Görüntüleri
<details>
<summary><b>Görselleri Görüntülemek İçin Tıklayın</b></summary>
<br>
<p align="left">
  <a href="https://github.com/user-attachments/assets/d361c712-21b0-485b-96b0-a78f26980272" target="_blank">
    <img src="https://github.com/user-attachments/assets/d361c712-21b0-485b-96b0-a78f26980272" width="180" alt="Ana Panel">
  </a>
  <a href="https://github.com/user-attachments/assets/f6813d17-dc7f-42fb-9d79-44de1e6d9bdb" target="_blank">
    <img src="https://github.com/user-attachments/assets/f6813d17-dc7f-42fb-9d79-44de1e6d9bdb" width="180" alt="Detaylı Analiz">
  </a>
  <a href="https://github.com/user-attachments/assets/a98f183b-3ed1-4c58-8613-9c41a9abee19" target="_blank">
    <img src="https://github.com/user-attachments/assets/a98f183b-3ed1-4c58-8613-9c41a9abee19" width="180" alt="Mobil 1">
  </a>
  <a href="https://github.com/user-attachments/assets/4d1976dd-98f2-4b07-a8c5-2786293be160" target="_blank">
    <img src="https://github.com/user-attachments/assets/4d1976dd-98f2-4b07-a8c5-2786293be160" width="180" alt="Mobil 2">
  </a>
  <a href="https://github.com/user-attachments/assets/ffbab9e9-cd28-4a80-83b7-324dc846fb48" target="_blank">
    <img src="https://github.com/user-attachments/assets/ffbab9e9-cd28-4a80-83b7-324dc846fb48" width="180" alt="Mobil 3">
  </a>
</p>
</details>

---

## 🛡️ Gizlilik Notu
* Verileriniz tamamen yerel tarayıcınızda işlenir; hiçbir sunucuya veri aktarımı yapılmaz.

---
*Bu araç, otomotiv bilirkişi süreçlerini dijitalleştirmek, hızlandırmak ve operasyonel hataları sıfıra indirmek için tasarlanmıştır.*
