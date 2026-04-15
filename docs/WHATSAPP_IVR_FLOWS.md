# WhatsApp & IVR Conversation Flows

## WhatsApp Bot (Workers with Smartphones)

### Flow 1: Worker requests work
```
Worker sends: "काम"
↓
Bot: [Interactive Buttons]
     "काम Available है! 🎉
      📍 Location: Amritsar Industrial Area
      📅 Date: 15 April 2026
      ⏰ Shift: Full Day
      💰 ₹450/day
      
      क्या आप काम करना चाहते हैं?"
      [✅ हाँ, काम करूँगा] [❌ नहीं, आज नहीं]
```

### Flow 2: Worker marks unavailable
```
Worker sends: "आज नहीं"
↓
Bot: "ठीक है। आज आपको काम नहीं भेजेंगे। 👍
     कल के लिए हम आपसे संपर्क करेंगे।"
```

### Flow 3: Daily morning ping (sent by system at 6am)
```
System sends to ALL available workers:
     "[Worker Name], आज आप काम के लिए available हैं?
      Please confirm करें:"
      [✅ हाँ, available हूँ] [❌ आज नहीं]
```

### Flow 4: Business attendance update
```
System sends to Business owner at shift end:
     "📊 Attendance Update — 15 April
      Business: ABC Packaging
      ✅ Present: 18/20 workers
      📈 90% fulfillment
      Details: Login to dashboard"
```

---

## IVR System (Feature Phone Workers — Missed Call)

### Missed Call Flow
```
Worker: [Gives missed call to platform number]
        ↓
System: [Auto calls back within 30 seconds]
        ↓
IVR: "नमस्ते! Labour Platform पर आपका स्वागत है।
     काम चाहिए तो 1 दबाएं।
     काम नहीं चाहिए तो 2 दबाएं।"
     ↓
Worker presses 1:
     "धन्यवाद [Name]। आपका काम confirm हो गया।
      सुपरवाइजर जल्द संपर्क करेगा।"
Worker presses 2:
     "ठीक है [Name]। आज आपको काम नहीं भेजेंगे।
      धन्यवाद।"
```

---

## Integration Providers

| Feature | Provider | Cost (approx) |
|---------|----------|---------------|
| WhatsApp Bot | Meta Business API | ₹0.50-₹1 per message |
| IVR Callback | Exotel | ₹0.50 per min |
| SMS OTP | Twilio / MSG91 | ₹0.20 per SMS |

## Environment Variables Required

```env
# WhatsApp
WHATSAPP_TOKEN=       # From Meta Business Manager
WHATSAPP_PHONE_NUMBER_ID=  # Your WhatsApp Business number
WHATSAPP_VERIFY_TOKEN= # Custom token for webhook verification

# IVR
EXOTEL_API_KEY=
EXOTEL_API_TOKEN=
EXOTEL_SID=           # Your Exotel subdomain
PLATFORM_PHONE_NUMBER= # The number workers call
```
