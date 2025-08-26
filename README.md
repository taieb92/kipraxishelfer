# 🏥 kipraxishelfer

**KI-gestützter Sprachassistent für deutsche Arztpraxen**

Ein modernes Next.js Dashboard für medizinische Praxen, das KI-gestützte Sprachassistenz, Terminverwaltung und Anrufverwaltung in einer benutzerfreundlichen deutschen Oberfläche bereitstellt.

## ✨ Features

### 🎯 **Kernfunktionen**
- **Dashboard**: Übersicht über KPIs, Anrufvolumen und Kategorien
- **Anrufverwaltung**: Vollständige Verwaltung eingehender und ausgehender Anrufe
- **Kalender**: Terminplanung mit Feiertags- und Öffnungszeitenverwaltung
- **Verbrauchsanalyse**: Detaillierte Nutzungsstatistiken und Abrechnungsdaten
- **Einstellungen**: Konfiguration von Begrüßung, Kategorien, Status und mehr

### 🏗️ **Technische Features**
- **Next.js 14** mit App Router
- **TypeScript** für Typsicherheit
- **Tailwind CSS** mit Design System
- **shadcn/ui** Komponenten
- **Responsive Design** für alle Geräte
- **Deutsche Lokalisierung** (keine i18n-Abhängigkeiten)

## 🚀 **Schnellstart**

### **Voraussetzungen**
- Node.js 18+ 
- npm oder yarn

### **Installation**

```bash
# Repository klonen
git clone https://github.com/yourusername/kipraxishelfer.git
cd kipraxishelfer

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App ist dann unter `http://localhost:3000` verfügbar.

### **Build für Produktion**

```bash
# Produktionsbuild erstellen
npm run build

# Produktionsserver starten
npm start
```

## 🏗️ **Projektstruktur**

```
clinic-voice-saas/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Geschützte Dashboard-Routen
│   │   ├── dashboard/           # Hauptdashboard
│   │   ├── calls/               # Anrufverwaltung
│   │   ├── calendar/            # Terminplanung
│   │   ├── usage/               # Verbrauchsanalyse
│   │   └── settings/            # Einstellungen
│   ├── auth/                    # Authentifizierung
│   └── globals.css              # Globale Styles
├── components/                   # React-Komponenten
│   ├── ui/                      # shadcn/ui Komponenten
│   ├── dashboard/               # Dashboard-spezifische Komponenten
│   ├── calls/                   # Anruf-bezogene Komponenten
│   ├── calendar/                # Kalender-Komponenten
│   ├── usage/                   # Verbrauchs-Komponenten
│   ├── settings/                # Einstellungs-Komponenten
│   └── layout/                  # Layout-Komponenten
├── lib/                         # Utility-Funktionen
├── hooks/                       # Custom React Hooks
└── public/                      # Statische Assets
    └── brand/                   # Branding-Assets
```

## 🎨 **Design System**

**kipraxishelfer** folgt einem strikten Design System:

- **Farben**: Professionelle medizinische Farbpalette
- **Typografie**: Geist Font für optimale Lesbarkeit
- **Komponenten**: Konsistente shadcn/ui Komponenten
- **Spacing**: Einheitliche Abstände und Layouts
- **Accessibility**: WCAG-konforme Barrierefreiheit

## 🔧 **Konfiguration**

### **Umgebungsvariablen**

```bash
# .env.local
NEXT_PUBLIC_APP_NAME=kipraxishelfer
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### **Feature Flags**

```typescript
const FEATURE_FLAGS = {
  BILLING_ESTIMATE: false,    // Abrechnungsschätzungen
  BILLING_NUMBERS: false,     // Detaillierte Abrechnungszahlen
  AFTER_HOURS: true,          // Nach-Öffnungszeiten-Features
  CAL_APPOINTMENTS: true      # Termin-Erstellung
}
```

## 📱 **Unterstützte Browser**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🧪 **Entwicklung**

### **Verfügbare Scripts**

```bash
npm run dev          # Entwicklungsserver
npm run build        # Produktionsbuild
npm run start        # Produktionsserver
npm run lint         # ESLint prüfen
npm run type-check   # TypeScript prüfen
```

### **Code-Qualität**

- **ESLint** für Code-Linting
- **Prettier** für Code-Formatierung
- **TypeScript** für Typsicherheit
- **Tailwind CSS** für konsistentes Styling

## 🤝 **Beitragen**

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 **Lizenz**

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

## 🆘 **Support**

Bei Fragen oder Problemen:

- Erstelle ein Issue auf GitHub
- Kontaktiere das Entwicklungsteam
- Konsultiere die Dokumentation

## 🙏 **Danksagungen**

- **Next.js** Team für das fantastische Framework
- **shadcn/ui** für die wunderschönen Komponenten
- **Tailwind CSS** für das flexible CSS-Framework
- Alle Mitwirkenden und Tester

---

**Entwickelt mit ❤️ für deutsche Arztpraxen** 