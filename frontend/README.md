# VeriAI - Documentation Technique Complète

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture de l'application](#architecture-de-lapplication)
3. [Contexte global](#contexte-global)
4. [Pages](#pages)
5. [Composants principaux](#composants-principaux)
6. [Composants UI](#composants-ui)
7. [Animations et effets visuels](#animations-et-effets-visuels)
8. [Flux de données](#flux-de-données)

---

## Vue d'ensemble

**VeriAI** est une plateforme premium de détection de contenu généré par IA. L'application utilise une esthétique **Spatial UI / Ethereal Minimalism** inspirée de Stripe et Vercel, avec :

- **Design System** : Glassmorphisme spatial avec backdrop-blur 40px
- **Thèmes** : Dark mode (Deep Obsidian #050505) et Light mode (Pearl White #FBFBFD)
- **Framework** : React + TypeScript + React Router
- **Animations** : Motion/React (Framer Motion)
- **Styling** : Tailwind CSS v4

---

## Architecture de l'application

### Structure de fichiers

```
src/
├── app/
│   ├── App.tsx                      # Point d'entrée principal
│   ├── routes.tsx                   # Configuration du routage
│   ├── context/
│   │   └── AppContext.tsx           # Contexte global de l'application
│   ├── pages/
│   │   ├── LoginPage.tsx            # Page de connexion/inscription
│   │   ├── GuestDashboard.tsx       # Dashboard pour visiteurs non connectés
│   │   └── LoggedInDashboard.tsx    # Dashboard pour utilisateurs connectés
│   └── components/
│       ├── Header.tsx               # Navigation principale
│       ├── InputPanel.tsx           # Panneau de saisie de texte/upload
│       ├── ResultsPanel.tsx         # Affichage des résultats d'analyse
│       ├── Sidebar.tsx              # Barre latérale (promo/historique)
│       ├── AmbientBackground.tsx    # Fond animé avec orbes
│       ├── NeuralBackground.tsx     # Réseau neuronal animé (Canvas)
│       └── ui/                      # Composants UI réutilisables
```

### Flux de routage

L'application utilise **React Router v6** avec les routes suivantes :

- `/` → **GuestDashboard** (page d'accueil pour non-connectés)
- `/login` → **LoginPage** (authentification)
- `/dashboard` → **LoggedInDashboard** (dashboard utilisateur connecté)

---

## Contexte global

### AppContext (`src/app/context/AppContext.tsx`)

Le contexte global gère l'état partagé de l'application.

#### État géré

```typescript
interface AppContextType {
  isDark: boolean;              // Mode sombre actif
  toggleTheme: () => void;      // Basculer dark/light mode
  isLoggedIn: boolean;          // Statut de connexion
  login: (email?: string) => void;   // Fonction de connexion
  logout: () => void;           // Fonction de déconnexion
  user: {                       // Données utilisateur
    name: string;
    email: string;
    initials: string;
  } | null;
}
```

#### Fonctions principales

1. **toggleTheme()** : Bascule entre dark/light mode et met à jour la classe `dark` sur `document.documentElement`
2. **login(email?)** : Active `isLoggedIn` et définit l'email utilisateur
3. **logout()** : Désactive `isLoggedIn`

#### État par défaut

- `isDark: true` (dark mode par défaut)
- `isLoggedIn: false`
- `userEmail: "john@example.com"`

---

## Pages

### 1. LoginPage (`src/app/pages/LoginPage.tsx`)

Page d'authentification avec layout splitté (gauche : marketing, droite : formulaire).

#### Fonctionnalités

- **Tabs** : Basculer entre "Sign In" et "Create Account"
- **Formulaires** :
  - Login : Email + Password
  - Signup : Name + Email + Password
- **Social Auth** : Boutons Google et GitHub (simulés)
- **Affichage/masquage du mot de passe** : Icône œil
- **Animation de chargement** : Spinner pendant 1.4s avant redirection

#### Éléments UI principaux

**Panneau gauche (hidden on mobile)** :
- Logo VeriAI avec icône Shield
- Titre marketing avec gradient
- 4 features avec icônes CheckCircle
- 3 statistiques (98.7% Accuracy, 2.4M+ Scans/month, 150+ Clients)
- 3 cartes flottantes animées (scores AI/Human, modèle détecté)
- Mesh blobs animés en arrière-plan

**Panneau droit** :
- Tabs Login/Signup avec background glassmorphism
- Champs de formulaire avec icônes (Mail, Lock)
- Bouton "Forgot password?" (login uniquement)
- Bouton principal avec gradient animé
- Divider "or continue with"
- Boutons sociaux Google/GitHub
- Footer avec liens Terms/Privacy

#### Boutons et actions

| Bouton | Action | État |
|--------|--------|------|
| Sign In / Get Started Free | `handleSubmit()` | Loading pendant 1.4s → `login()` → `navigate("/dashboard")` |
| Google | `login()` → `navigate("/dashboard")` | Loading pendant 1s |
| GitHub | `login()` → `navigate("/dashboard")` | Loading pendant 1s |
| Toggle password visibility | `setShowPassword(!showPassword)` | Instant |
| Switch tab | `setTab("login" \| "signup")` | Instant |

#### Animations

- **Cartes flottantes** : Motion `y: [0, -10, 0]` avec durées variables
- **Mesh blobs** : CSS keyframes `meshFloat1` et `meshFloat2`
- **Bouton principal** : Gradient animé via CSS `gradientShift`

---

### 2. GuestDashboard (`src/app/pages/GuestDashboard.tsx`)

Dashboard pour utilisateurs non connectés (accès limité).

#### Fonctionnalités

- **InputPanel** : Saisie de texte ou upload de fichier
- **ResultsPanel** : Affichage des résultats d'analyse (si disponibles)
- **Sidebar** : Promo pour inscription (unlock features)
- **Redirection automatique** : Si `isLoggedIn === true` → `/dashboard`

#### Flux d'analyse

1. Utilisateur saisit du texte ou upload un fichier
2. Clique sur "Analyze Content"
3. `handleAnalyze()` → `setIsAnalyzing(true)` → Animation 2.2s
4. Résultats mock affichés dans `ResultsPanel`

#### État local

```typescript
const [results, setResults] = useState<typeof mockResults | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
```

#### Boutons et actions

| Bouton | Action | Composant |
|--------|--------|-----------|
| Analyze Content | `handleAnalyze()` | InputPanel |
| Log In to Save Scans | `navigate("/login")` | Sidebar |
| Create free account | `navigate("/login")` | Sidebar |

---

### 3. LoggedInDashboard (`src/app/pages/LoggedInDashboard.tsx`)

Dashboard pour utilisateurs connectés (accès complet).

#### Fonctionnalités

- **Welcome strip** : Affiche avatar, nom utilisateur, plan actuel
- **Usage stats** : "7/10 scans used today"
- **Status indicator** : "All systems operational" (badge animé)
- **InputPanel** : Identique au GuestDashboard
- **ResultsPanel** : Identique au GuestDashboard
- **Sidebar** : Analytics + historique des scans
- **Redirection automatique** : Si `isLoggedIn === false` → `/`

#### État local

Identique à GuestDashboard

#### Boutons et actions

Identique à GuestDashboard (analyse)

---

## Composants principaux

### 1. Header (`src/app/components/Header.tsx`)

Navigation flottante en forme de pill island avec glassmorphisme.

#### Props

```typescript
interface HeaderProps {
  variant?: "guest" | "auth";
}
```

#### Fonctionnalités

**Mode Guest (`variant="guest"`)** :
- Logo VeriAI cliquable → `navigate("/")`
- Navigation : Analyze (active), Pricing, API
- Theme toggle (Sun/Moon)
- Boutons : "Log In" et "Get Started"

**Mode Auth (`variant="auth"`)** :
- Logo VeriAI cliquable → `navigate("/dashboard")`
- Navigation : Dashboard (active), History, Docs
- Theme toggle
- Dropdown utilisateur avec avatar initiales

#### Boutons et actions

| Bouton | Action | Disponible |
|--------|--------|-----------|
| Logo | `navigate(isLoggedIn ? "/dashboard" : "/")` | Toujours |
| Theme toggle | `toggleTheme()` | Toujours |
| Log In | `navigate("/login")` | Guest seulement |
| Get Started | `navigate("/login")` | Guest seulement |
| User avatar dropdown | Toggle menu | Auth seulement |
| Profile Settings | (non implémenté) | Auth dropdown |
| Billing | (non implémenté) | Auth dropdown |
| API Keys | (non implémenté) | Auth dropdown |
| Sign out | `logout()` → `navigate("/")` → close dropdown | Auth dropdown |

#### Animations

- **Theme icon** : Rotation 90° + scale lors du changement
- **Dropdown** : Fade + scale + y-offset

---

### 2. InputPanel (`src/app/components/InputPanel.tsx`)

Panneau de saisie avec tabs Text/File et glassmorphisme.

#### Props

```typescript
interface InputPanelProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}
```

#### Modes

1. **Text Input** : Textarea avec compteur mots/caractères
2. **File Upload** : Drag & drop zone + bouton browse

#### État local

```typescript
const [mode, setMode] = useState<"text" | "file">("text");
const [text, setText] = useState("");
const [file, setFile] = useState<{ name: string; size: string } | null>(null);
const [dragOver, setDragOver] = useState(false);
```

#### Boutons et actions

| Bouton | Action | Condition |
|--------|--------|-----------|
| Text Input tab | `setMode("text")` | Toujours |
| File Upload tab | `setMode("file")` | Toujours |
| Analyze Content | `onAnalyze(text)` ou `onAnalyze("Uploaded file: " + file.name)` | `canSubmit && !isAnalyzing` |
| Clear | `setText("")` + `setFile(null)` | `(text.trim() \|\| file) && !isAnalyzing` |
| Upload zone | `fileRef.current?.click()` | Mode file, pas de fichier |
| Remove file | `setFile(null)` | Mode file, fichier présent |

#### Fonctions

- **handleFileDrop(e)** : Gère le drag & drop
- **handleFileSelect(e)** : Gère la sélection de fichier via input

#### Animations

- **Tab switch** : Fade + y-offset
- **Bouton Analyze** : Gradient animé via CSS

---

### 3. ResultsPanel (`src/app/components/ResultsPanel.tsx`)

Panneau d'affichage des résultats d'analyse avec glassmorphisme.

#### Props

```typescript
interface ResultsData {
  aiScore: number;           // Score IA (0-100)
  humanScore: number;        // Score humain (0-100)
  confidence: number;        // Confiance (0-100)
  label: string;             // Label du résultat
  model: string;             // Modèle détecté
  submittedText?: string;    // Texte analysé
  wordCount?: number;        // Nombre de mots
  modelAttributions?: ModelAttribution[];  // Attribution par modèle
  segments?: Segment[];      // Segments de texte
  chunks: { text: string; score: number }[];
  stats: { analyzed: number; flagged: number; clean: number };
}
```

#### Structure

Le composant est divisé en 3 sections principales :

**1. INPUT HEADER** : Texte soumis avec status badge
- Affichage du texte (expandable si > 180 chars)
- Badge de statut (AI-Generated / Mixed Content / Human-Written)
- Chips : Word count, timestamp, confidence
- Bouton "Re-analyze"

**2. HIGH-LEVEL METRICS** (2 colonnes) :

**Colonne gauche** : Global AI Probability
- **GlassRing** : Anneau 3D animé avec score AI/Human
- Statistiques : Scanned / Flagged / Clean

**Colonne droite** : Model Attribution
- 4 barres de progression (ModelPill) avec gradient
- Tooltip info sur l'attribution
- Note de disclaimer

**3. SEMANTIC BREAKDOWN** : Analyse sentence-level
- Légende Human/AI-Generated
- Liste de segments avec highlighting
- Pills de résumé (AI sentences, Human sentences, confidence, risk)

#### Sous-composants

##### GlassRing

Anneau SVG 3D avec dégradé et glow.

**Paramètres** :
- Rayon : 78px
- Stroke : 10px
- Rotation : -90° (démarrage en haut)

**Animations** :
- Arc AI : `strokeDashoffset` de `CIRC` à `CIRC - aiDash`
- Arc Humain : opacity fade-in
- Centre : Score avec scale + opacity

##### ModelPill

Barre de progression avec glow pour attribution de modèle.

**Props** :
```typescript
{ name: string; score: number; rank: number; isDark: boolean; }
```

**Animations** :
- Fade-in + x-offset avec delay basé sur `rank`
- Barre : width de 0 à `score%`

**Styles** :
- Rank #1 : Gradient + glow fort
- Autres : Opacité décroissante

##### EtherealSentence

Segment de texte avec highlighting sémantique.

**Styles** :
- AI : Bordure gauche rouge + background rouge/6%
- Humain : Bordure gauche verte + background vert/5%

**Animations** :
- Fade-in + x-offset avec delay basé sur index

#### Boutons et actions

| Bouton | Action | État |
|--------|--------|------|
| Expand full text | `setExpanded(true)` | `needsExpand && !expanded` |
| Collapse | `setExpanded(false)` | `expanded` |
| Re-analyze | (non implémenté) | Toujours |
| Info tooltip (Model Attribution) | `setShowInfo(!showInfo)` | Toujours |

#### Animations principales

1. **Container** : Fade-in + y-offset (0.5s)
2. **Input header** : Fade-in + y-offset (0.35s)
3. **Metrics cards** : Fade-in + y-offset avec delays (0.08s, 0.14s)
4. **Semantic breakdown** : Fade-in + y-offset (0.22s)
5. **Segments** : Stagger animation (0.04s par segment)
6. **Pills** : Stagger animation (0.07s par pill)

---

### 4. Sidebar (`src/app/components/Sidebar.tsx`)

Barre latérale avec contenu différent selon variant.

#### Props

```typescript
interface SidebarProps {
  variant?: "guest" | "auth";
}
```

#### Mode Guest

**Promo card** :
- Titre : "Unlock Full Access"
- 4 features avec icônes
- Bouton "Log In to Save Scans" → `navigate("/login")`
- Lien "Create free account" → `navigate("/login")`

**Limits card** :
- Scans per day : 5
- Max file size : 5 MB
- History saved : None
- Models : Standard

#### Mode Auth

**Stats cards** (2 colonnes) :
- **Total Scans** : 1,247 avec sparkline + trend +12%
- **Accuracy** : 98.7% avec sparkline + trend +0.3%

**Recent Scans card** :
- Liste de 5 scans récents
- Badge de score (AI % avec couleur)
- Bouton "View all"

#### Sous-composants

##### Sparkline

Mini-graphique SVG pour tendances.

**Props** :
```typescript
{ data: number[]; color: string; }
```

**Calculs** :
- Normalisation des données entre min/max
- Génération de polyline SVG
- Gradient de couleur

#### Boutons et actions

| Bouton | Action | Variant |
|--------|--------|---------|
| Log In to Save Scans | `navigate("/login")` | Guest |
| Create free account | `navigate("/login")` | Guest |
| View all | (non implémenté) | Auth |
| Scan history item | (non implémenté) | Auth |

---

### 5. AmbientBackground (`src/app/components/AmbientBackground.tsx`)

Fond animé multi-couches.

#### Couches

**Layer 1** : Deep Void / Crystal Base
- Dark : Gradient radial #06070D → #030408
- Light : Gradient radial #FAFBFF → #F0F1F8

**Layer 3** : Ambient Fluid Gradient Orbs

**Dark mode** :
- Orb 1 : Electric Indigo (79,70,229) blur 150px
- Orb 2 : Deep Sapphire Blue (30,58,138) blur 180px
- Orb 3 : Soft Violet (124,58,237) blur 140px

**Light mode** :
- Orb 1 : Soft Lavender (224,231,255) blur 200px
- Orb 2 : Pale Sky Blue (219,234,254) blur 220px
- Orb 3 : Blush Pink (252,231,243) blur 180px

**Layer 4** : Micro-Texture Dot Grid
- Radial gradient dots (1px) espacés de 31px

**Bonus** : Scan Line Sweep
- Ligne horizontale animée (top: -2px → 100%)

#### Animations CSS

```css
@keyframes vOrb1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(5vw, 4vh) scale(1.06); }
  66%      { transform: translate(-3vw, 2vh) scale(0.96); }
}
```

Durées : 20s, 25s, 18s (vOrb1, vOrb2, vOrb3)

---

### 6. NeuralBackground (`src/app/components/NeuralBackground.tsx`)

Réseau neuronal animé avec Canvas.

#### Paramètres

```typescript
const NODE_COUNT = 65;        // Nombre total de nœuds
const PULSE_COUNT = 12;       // Nœuds avec pulse
const MAX_DIST = 170;         // Distance max pour connexions
```

#### NodeDot interface

```typescript
interface NodeDot {
  x: number;          // Position X
  y: number;          // Position Y
  vx: number;         // Vélocité X (-0.15 à 0.15)
  vy: number;         // Vélocité Y (-0.15 à 0.15)
  radius: number;     // Rayon du nœud
  isPulse: boolean;   // Nœud pulsant
  pulsePhase: number; // Phase de pulse (0-2π)
}
```

#### Rendu

**Connexions** (lignes) :
- Calculées entre chaque paire de nœuds < MAX_DIST
- Opacité basée sur distance : `(1 - dist/MAX_DIST) * 0.06` (dark)
- Couleur : Indigo (99,102,241) en dark, (79,70,229) en light

**Nœuds** :
- Pulse nodes : Glow animé + radius variable
- Normal nodes : Radius fixe
- Rebond sur les bords du canvas

#### Animations

- **Pulse** : `0.5 + 0.5 * sin(time * 2.5 + pulsePhase)`
- **Mouvement** : Mise à jour position avec vélocité à chaque frame
- **Rebond** : Inversion de vélocité aux bords

#### Lifecycle

- `useEffect` : Initialisation canvas + boucle d'animation
- `resize` : Ajustement aux dimensions fenêtre
- Cleanup : `cancelAnimationFrame` + remove event listener

---

## Composants UI

L'application utilise une bibliothèque complète de composants UI réutilisables basés sur shadcn/ui :

### Composants disponibles

- **accordion** : Panneaux pliables
- **alert** / **alert-dialog** : Alertes et dialogues
- **aspect-ratio** : Ratios d'aspect
- **avatar** : Avatars utilisateurs
- **badge** : Badges de statut
- **breadcrumb** : Fil d'Ariane
- **button** : Boutons
- **calendar** : Calendrier
- **card** : Cartes de contenu
- **carousel** : Carrousels
- **chart** : Graphiques
- **checkbox** : Cases à cocher
- **collapsible** : Éléments pliables
- **command** : Palette de commandes
- **context-menu** : Menus contextuels
- **dialog** : Dialogues modaux
- **drawer** : Tiroirs latéraux
- **dropdown-menu** : Menus déroulants
- **form** : Formulaires
- **hover-card** : Cartes au survol
- **input** / **input-otp** : Champs de saisie
- **label** : Labels de formulaire
- **menubar** : Barres de menu
- **navigation-menu** : Menus de navigation
- **pagination** : Pagination
- **popover** : Popovers
- **progress** : Barres de progression
- **radio-group** : Groupes radio
- **resizable** : Panneaux redimensionnables
- **scroll-area** : Zones de scroll
- **select** : Sélecteurs
- **separator** : Séparateurs
- **sheet** : Feuilles latérales
- **sidebar** : Barres latérales
- **skeleton** : Placeholders de chargement
- **slider** : Curseurs
- **sonner** : Notifications toast
- **switch** : Interrupteurs
- **table** : Tableaux
- **tabs** : Onglets
- **textarea** : Zones de texte
- **toggle** / **toggle-group** : Boutons toggle
- **tooltip** : Infobulles

### Utilitaires

- **use-mobile.ts** : Hook pour détecter mobile
- **utils.ts** : Fonctions utilitaires

---

## Animations et effets visuels

### Bibliothèque Motion/React

L'application utilise massivement **Motion/React** (Framer Motion) pour :

- Transitions de page
- Animations d'entrée/sortie (AnimatePresence)
- Stagger animations (délais séquentiels)
- Micro-interactions

### Patterns d'animation communs

#### Fade + Y-offset

```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
>
```

#### Stagger

```tsx
{items.map((item, i) => (
  <motion.div
    key={i}
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.1, duration: 0.35 }}
  >
))}
```

#### Tab switching

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={tab}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.2 }}
  >
</AnimatePresence>
```

### CSS Animations

#### Gradient shift (boutons)

```css
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

#### Orb floating

```css
@keyframes vOrb1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(5vw, 4vh) scale(1.06); }
  66%      { transform: translate(-3vw, 2vh) scale(0.96); }
}
```

---

## Flux de données

### Flux d'authentification

```
LoginPage
  ↓
  User clicks "Sign In" / Social button
  ↓
  handleSubmit() / social button onClick
  ↓
  setIsLoading(true)
  ↓
  setTimeout 1000-1400ms
  ↓
  login(email)  [AppContext]
  ↓
  setIsLoggedIn(true)
  ↓
  navigate("/dashboard")
  ↓
  LoggedInDashboard renders
```

### Flux d'analyse

```
Dashboard (Guest/Logged)
  ↓
  User enters text in InputPanel
  ↓
  User clicks "Analyze Content"
  ↓
  onAnalyze(text)  [callback]
  ↓
  handleAnalyze(text)  [Dashboard]
  ↓
  setIsAnalyzing(true)
  ↓
  setResults(null)
  ↓
  Animation loading 2.2s
  ↓
  setTimeout 2200ms
  ↓
  setIsAnalyzing(false)
  ↓
  setResults(mockResults)
  ↓
  ResultsPanel renders with data
```

### Flux de thème

```
Header
  ↓
  User clicks theme toggle button
  ↓
  toggleTheme()  [AppContext]
  ↓
  setIsDark(prev => !prev)
  ↓
  useEffect detects isDark change
  ↓
  document.documentElement.classList.toggle("dark")
  ↓
  All components re-render with new theme
```

---

## Données mock

### Mock Results

```typescript
{
  aiScore: 87,
  humanScore: 13,
  confidence: 94,
  label: "Likely AI-Generated",
  model: "GPT-4o / Claude 3.5",
  wordCount: 350,
  submittedText: "The implications of artificial intelligence...",
  modelAttributions: [
    { name: "GPT-4 Turbo", score: 62 },
    { name: "Claude 3 Opus", score: 18 },
    { name: "Gemini 1.5 Pro", score: 13 },
    { name: "Llama 3 (70B)", score: 7 },
  ],
  segments: [
    { text: "...", isAI: true },
    { text: "...", isAI: false },
    // ...
  ],
  chunks: [
    { text: "...", score: 94 },
    // ...
  ],
  stats: { analyzed: 5, flagged: 3, clean: 2 },
}
```

### History Mock (Sidebar Auth)

```typescript
[
  { title: "Research Paper - Methodology", score: 92, time: "2 min ago", status: "ai" },
  { title: "Blog Post - Introduction", score: 18, time: "15 min ago", status: "human" },
  { title: "Essay - Climate Change", score: 67, time: "1 hr ago", status: "mixed" },
  { title: "Product Description v2", score: 95, time: "3 hrs ago", status: "ai" },
  { title: "Cover Letter - Marketing", score: 12, time: "Yesterday", status: "human" },
]
```

---

## Design tokens

### Glassmorphism spatial

```typescript
const cardStyle: React.CSSProperties = {
  background: isDark ? "rgba(15,17,26,0.55)" : "rgba(255,255,255,0.65)",
  backdropFilter: isDark ? "blur(40px) saturate(1.4)" : "blur(40px) saturate(1.3)",
  border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.80)",
  boxShadow: isDark
    ? "0 8px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)"
    : "0 8px 32px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
};
```

### Couleurs sémantiques

#### Text

- **Primary** : `rgba(255,255,255,0.92)` (dark) / `#0F111A` (light)
- **Secondary** : `rgba(255,255,255,0.48)` (dark) / `#4B5563` (light)
- **Muted** : `rgba(255,255,255,0.25)` (dark) / `#9CA3AF` (light)
- **Caption** : `rgba(255,255,255,0.2)` (dark) / `#B0B7C3` (light)

#### Status

- **AI** : Rouge (220,60,60)
- **Human** : Vert (20,184,166)
- **Mixed** : Orange (245,158,11)
- **Brand** : Indigo (99,102,241)

#### Gradients

- **Primary button** : `linear-gradient(135deg, #4F46E5, #6366F1)`
- **Ring AI arc** : `linear-gradient(to right, #4338CA, #6366F1, #818CF8)`

---

## Points d'amélioration futurs

### Fonctionnalités manquantes

1. **Vraie API de détection** : Remplacer mockResults par appel API
2. **Persistance** : Base de données pour historique et utilisateurs
3. **Authentification réelle** : Intégration OAuth Google/GitHub
4. **Upload de fichiers** : Parser PDF/DOCX pour extraction de texte
5. **Export de rapports** : Génération PDF des résultats
6. **API Keys management** : Dashboard pour clés API
7. **Billing** : Intégration Stripe pour abonnements
8. **Analytics avancées** : Graphiques de tendances
9. **Webhooks** : Notifications temps réel

### Optimisations techniques

1. **Code splitting** : Lazy loading des pages
2. **Memoization** : React.memo pour composants coûteux
3. **Debounce** : Sur input de texte
4. **Virtual scrolling** : Pour listes longues (historique)
5. **Service Worker** : Cache et offline support
6. **Compression d'images** : Optimisation assets
7. **SSR** : Server-Side Rendering avec Next.js

---

## Conclusion

**VeriAI** est une application React moderne utilisant les dernières pratiques de design (Spatial UI, Glassmorphism) et d'animation (Motion/React). L'architecture est modulaire avec un contexte global, des composants réutilisables, et un système de routage clair. Le design system est cohérent avec des tokens de couleurs et des styles glassmorphism appliqués systématiquement.

L'application est prête pour une intégration backend complète et pourrait évoluer vers une solution SaaS enterprise avec persistance, authentification réelle, et API de détection IA fonctionnelle.
