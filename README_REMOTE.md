# 📱 Remote Control Setup

## ⚠️ Local Development Only

Remote control feature მუშაობს **მხოლოდ local development**-ში. Cloud platforms (render.com, vercel, netlify) **ვერ** აკონტროლებენ desktop-ს.

## 🚀 როგორ გამოვიყენოთ:

### 1. Local Development Server
```bash
# 1. React app-ის გაშვება
npm run dev

# 2. Remote server-ის გაშვება (ახალ terminal-ში)
npm run remote-server
```

### 2. Mobile Connection
1. **QR Code** - React app-ში RemoteControl კომპონენტში ჩანს
2. **Scan** - ტელეფონით QR კოდის სკანირება
3. **Control** - მაუსის კონტროლი

## 🔧 Technical Requirements

- **Local Environment** - მხოლოდ localhost-ზე
- **Same WiFi** - ორივე მოწყობილობა ერთ ქსელში
- **RobotJS** - Native module desktop control-ისთვის

## 🌐 Production Deployment

Production-ში (render.com) remote control **disabled** არის:
- QR კოდი არ ჩანს
- Remote control ღილაკი hidden
- Normal portfolio functionality მუშაობს

## 🛠️ Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Portfolio | ✅ | ✅ |
| Games | ✅ | ✅ |
| Remote Control | ✅ | ❌ |
| QR Code | ✅ | ❌ |