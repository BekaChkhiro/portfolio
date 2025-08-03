# 📱 Phone Mouse Control

ტელეფონის მაუსად გამოყენების სისტემა ChkhiroOS-ისთვის.

## 🚀 როგორ გამოვიყენოთ

### 1. სერვერის გაშვება
```bash
npm run remote-server
```

### 2. ტელეფონთან დაკავშირება
- გახსენით ბრაუზერი ტელეფონზე
- გადახვალეთ: `http://localhost:8080`
- ან დაასკანერეთ QR კოდი Remote Control აპლიკაციიდან

### 3. მართვა
- **🖱️ მაუსის მოძრაობა**: ნაცლად ხელის მოძრაობა ეკრანზე
- **👆 მარცხენა click**: ერთხელ შეხება
- **👆 მარჯვენა click**: ხანგრძლივი შეხება (500ms)
- **✌️ scroll**: ორი თითით მოძრაობა

## 🛠️ ტექნიკური დეტალები

### სერვერი
- **Port**: 8080
- **WebSocket** კავშირი phone ↔ computer
- **robotjs** მაუსის კონტროლისთვის
- **HTTP server** ტელეფონის interface-ისთვის

### ჭდები
- `src/components/RemoteControl/` - React კომპონენტი
- `server/server.js` - Node.js WebSocket სერვერი
- `public/phone-control.html` - ტელეფონის interface

### Requirements
- ორივე device ერთ WiFi ქსელში
- Node.js >= 16
- macOS/Linux (robotjs support)

## 🔧 Troubleshooting

### სერვერი არ იშვება
```bash
# დარწმუნდით რომ dependencies დაინსტალირდა
npm install

# სცადეთ manual გაშვება
node server/server.js
```

### ტელეფონი ვერ უკავშირდება
1. შეამოწმეთ WiFi ქსელი (ორივე device)
2. დარწმუნდით რომ სერვერი მუშაობს
3. სცადეთ IP address-ით: `http://[კომპიუტერის-IP]:8080`

### მაუსი ვერ მოძრაობს
- macOS-ზე შეიძლება საჭირო იყოს Accessibility permissions
- System Preferences → Security & Privacy → Privacy → Accessibility

## 🎯 Features

- ✅ Real-time mouse movement
- ✅ Click detection (left/right)
- ✅ Scroll support
- ✅ QR code connection
- ✅ Multi-device support
- ✅ Responsive phone interface
- ✅ Visual feedback

## 🔮 მომავალი გაუმჯობესებები

- [ ] Auto-discovery (no manual IP entry)
- [ ] Gesture shortcuts
- [ ] Keyboard input from phone
- [ ] Multiple screen support
- [ ] Haptic feedback
- [ ] Connection encryption

---

შეიქმნა Claude Code-ით 🤖