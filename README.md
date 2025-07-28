```md
# v14 Slashlı Ticket Bot - fortext-ticket-bot-v14

## Kurulum Rehberi

### 1. settings.js Ayarları

Proje dizininde `settings.js` dosyasını aç ve aşağıdaki yapıya göre doldur:

```js
module.exports = {
  bot: {
    token: "YOUR_BOT_TOKEN",
    clientId: "YOUR_CLIENT_ID"
  },
  emojis: {
    ticket: { id: "123456789012345678", name: "ticket" },
    uyari: { id: "123456789012345678", name: "uyari" },
    delete: { id: "123456789012345678", name: "delete" },
    kullanici: { id: "123456789012345678", name: "kullanici" },
    katagori: { id: "123456789012345678", name: "katagori" }
  },
  categories: {
    destek: {
      name: "Destek",
      channelPrefix: "destek"
    },
    satis: {
      name: "Satış",
      channelPrefix: "satis"
    },
    diger: {
      name: "Diğer",
      channelPrefix: "diger"
    }
  },
  embed: {
    color: "#2b2d31",
    footer: "fortext-ticket-bot-v14"
  }
}
```

---

### 2. Gerekli Modüllerin Kurulumu

Terminale şu komutu yaz:

```bash
npm install
```

---

### 3. Botu Başlatma

**⦿ Terminal üzerinden:**

```bash
node index.js
```

**⦿ BAT dosyası ile:**

Proje dizinine `başlat.bat` adında bir dosya oluştur ve içine şunu yaz:

```bat
@echo off
title fortext-ticket-bot-v14
echo.
echo [BOT] Başlatılıyor...
echo -----------------------
if not exist node_modules (
  echo Gerekli modüller yükleniyor...
  npm install
  echo Modüller yüklendi!
  echo.
)
node index.js
echo.
echo Bot kapandı. Kapatmak için bir tuşa bas...
pause >nul
```

---

### 4. Slash Komutlar

Komutlar aşağıdaki gibidir:

```bash
/setup     → Ticket sistemini sunucuda kurar  
/başlat    → Ticket panelini oluşturur  
/settings  → Ayarları düzenler (rol, kategori, log)
```

Komutlar sadece yetki sahip kişiler tarafından kullanılabilir.

---

### 5. Açıklama

- `settings.js` dosyası üzerinden tüm sistem kontrol edilir.
- Otomatik emoji yükleme vardır.
- Ticket oluşturulurken kullanıcı, kategori ve log kayıtları yapılır.
- Kod bütünlüğü korunur (`// fortext` tag'leri ile).
- Sistem tamamen Slash komutlarla çalışır.

**Made by fortext**
```
