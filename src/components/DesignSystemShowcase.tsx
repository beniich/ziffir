import { useState, useEffect } from 'react';
import {
  Button, Card, CardHeader, CardTitle, CardDescription,
  Input, Select, Textarea, Modal, Badge, Spinner, Skeleton, SkeletonCard, SkeletonList,
  EmptyState, ToastContainer, toast,
} from './ui';
import { 
  Mail, Settings as SettingsIcon, Plus, Sparkles, Sliders, 
  Copy, Check, Layers, Type, Play, Eye, AlertTriangle, 
  Terminal, Zap, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

const selectOptions = [
  { value: 'opt1', label: 'Option 1 - Habilitation L4' },
  { value: 'opt2', label: 'Option 2 - Propriétaire L5' },
  { value: 'opt3', label: 'Option 3 - Service Impérial (Disabled)', disabled: true },
];

export default function DesignSystemShowcase() {
  // Navigation / Tabs inside Design Lab
  const [activeSegment, setActiveSegment] = useState<'sandbox' | 'palette' | 'typography' | 'feedback' | 'modal'>('sandbox');

  // Interactive Live Sandbox Editor state
  const [sandboxComponent, setSandboxComponent] = useState<'button' | 'card' | 'badge' | 'input' | 'select'>('button');
  const [btnVariant, setBtnVariant] = useState<'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'cyber' | 'outline'>('primary');
  const [btnSize, setBtnSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  const [btnIsLoading, setBtnIsLoading] = useState(false);
  const [btnWithIcon, setBtnWithIcon] = useState(true);
  const [btnText, setBtnText] = useState('Valider l\'Emplacement');

  // Card interactive state
  const [cardVariant, setCardVariant] = useState<'default' | 'gold' | 'cyber' | 'glass' | 'glass-strong'>('gold');
  const [cardGlow, setCardGlow] = useState(true);
  const [cardHover, setCardHover] = useState(true);
  const [cardPadding, setCardPadding] = useState<'none' | 'sm' | 'md' | 'lg'>('md');
  const [cardTitle, setCardTitle] = useState('Mise à disposition VIP');
  const [cardDesc, setCardDesc] = useState('Traitement de faveur pour le grand appartement Hachisu-Suite 504.');

  // Badge interactive state
  const [badgeVariant, setBadgeVariant] = useState<'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'cyber' | 'purple' | 'neutral'>('gold');
  const [badgePulse, setBadgePulse] = useState(true);
  const [badgeDot, setBadgeDot] = useState(false);
  const [badgeText, setBadgeText] = useState('Habilitation Royale');

  // Input interactive state
  const [inputLabel, setInputLabel] = useState('Clé Holographique');
  const [inputPlaceholder, setInputPlaceholder] = useState('Saisissez votre code...');
  const [inputError, setInputError] = useState('');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // General Lab state
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [simulateLatency, setSimulateLatency] = useState(false);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [customTypoText, setCustomTypoText] = useState('Zaphir Executive Sovereign');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Triggering latency simulation loaders
  useEffect(() => {
    if (simulateLatency) {
      const timer = setTimeout(() => {
        setSimulateLatency(false);
        toast.success(
          'Synchronisation terminée', 
          'Les composants ont récupéré leur état stable après 2500ms d\'attente simulée.'
        );
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [simulateLatency]);

  // Luxury Brand Colors List
  const colorsList = [
    { name: 'Sovereign Gold', hex: '#c19a6b', desc: 'Symbole suprême de l\'accréditation Zaphir, teinte prestige.', group: 'primary' },
    { name: 'Gold Velvet', hex: '#7c5a30', desc: 'Or sombre et texturé des contrastes et rails premium.', group: 'primary' },
    { name: 'Obsidian Basalt', hex: '#0c0d10', desc: 'Ardoise volcanique polie, cœur des dalles et modules de l\'UI.', group: 'neutral' },
    { name: 'Obsidian Mirror', hex: '#050507', desc: 'Miroir sombre de fond d\'écran, profondeur de champ infinie.', group: 'neutral' },
    { name: 'Slate Frosted', hex: '#222326', desc: 'Bordures et reliefs en verre fumé, découpes laser premium.', group: 'neutral' },
    { name: 'Cyber Blue', hex: '#06b6d4', desc: 'Lignes laser rétro-éclairées, impulsions et dômes.', group: 'cyber' },
    { name: 'Magenta Strike', hex: '#d946ef', desc: 'Alertes hautement imminentes et commutations L5.', group: 'cyber' },
    { name: 'Botanical Emerald', hex: '#10b981', desc: 'Connexion opérationnelle saine, flux encrypté fluide.', group: 'status' },
    { name: 'Amber Glow', hex: '#f59e0b', desc: 'Requête d\'attention, maintenance ou clé imminente.', group: 'status' },
    { name: 'Ivory Royal', hex: '#fcfaf2', desc: 'Mise en lumière, contrastes de textes et de titres sublimes.', group: 'primary' }
  ];

  // Function to copy colors
  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    
    // Play sound / Celebrate with particles
    confetti({
      particleCount: 20,
      angle: 60,
      spread: 45,
      origin: { x: 0.1, y: 0.8 },
      colors: [hex, '#c19a6b', '#fcfaf2']
    });

    toast.success(
      `Couleur copiée !`,
      `Le code hexadécimal ${hex} est disponible dans votre presse-papiers.`
    );

    setTimeout(() => setCopiedColor(null), 1500);
  };

  // Code Generator based on sandbox state
  const getGeneratedCode = () => {
    switch (sandboxComponent) {
      case 'button':
        return `<Button 
  variant="${btnVariant}"
  size="${btnSize}"${btnIsLoading ? '\n  isLoading' : ''}${btnWithIcon ? '\n  leftIcon={<Plus className="w-4 h-4" />}' : ''}
>
  ${btnText}
</Button>`;
      case 'card':
        return `<Card 
  variant="${cardVariant}"${cardGlow ? '\n  glow' : ''}${cardHover ? '\n  hoverable' : ''}
  padding="${cardPadding}"
>
  <CardHeader divided>
    <CardTitle>${cardTitle}</CardTitle>
    <CardDescription>
      ${cardDesc}
    </CardDescription>
  </CardHeader>
  <div className="text-sm font-sans pt-3">
    Contenu du panneau VIP
  </div>
</Card>`;
      case 'badge':
        return `<Badge 
  variant="${badgeVariant}"${badgePulse ? '\n  pulse' : ''}${badgeDot ? '\n  dot' : ''}
>
  ${badgeText}
</Badge>`;
      case 'input':
        return `<Input 
  label="${inputLabel}"
  placeholder="${inputPlaceholder}"${inputDisabled ? '\n  disabled' : ''}${inputError ? `\n  error="${inputError}"` : ''}
  value={value}
  onChange={setValue}
/>`;
      case 'select':
        return `<Select 
  label="Choix de l'Habilitation"
  options={[
    { value: 'opt1', label: 'Habilitation L4' },
    { value: 'opt2', label: 'Propriétaire L5' }
  ]}
  placeholder="Sélecteur d'autorisation..."
/>`;
      default:
        return '';
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getGeneratedCode());
    setCopyCodeSuccess(true);
    toast.success('Code copié !', 'Le code source React réutilisable a bien été enregistré.');

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#c19a6b', '#ffffff']
    });

    setTimeout(() => setCopyCodeSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen px-3 sm:px-6 py-6 bg-obsidian-950 text-slate-100 rounded-3xl relative overflow-hidden transition-all duration-300">
      <ToastContainer />

      {/* Atmospheric Background Aesthetics */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-zaphir-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-500/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* TOP LEVEL DESIGN LAB BANNER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-white/5 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-[#c19a6b]/10 border border-[#c19a6b]/25 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#c19a6b]/90 animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#c19a6b]/95 uppercase">
                ZAPHIR INTERACTIVE ENGINEERING
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
              Laboratoire de Design Systémique
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Bac à sable interactif et spécimens pour configurer, tester et inspecter la charte graphique de l'hôtel de prestige v3.2. Saisissez des paramètres et visualisez instantanément le code source.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <Button 
              variant={simulateLatency ? "cyber" : "outline"} 
              size="xs"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${simulateLatency ? 'animate-spin' : ''}`} />}
              onClick={() => setSimulateLatency(true)}
              disabled={simulateLatency}
            >
              {simulateLatency ? "Simulant Latence..." : "Simuler Latence API"}
            </Button>
            <Button
              variant="secondary"
              size="xs"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={() => {
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 }
                });
                toast.success("Festivité Royale", "Commémoration du déploiement de l'interface Zaphir.");
              }}
            >
              Étoiles Nobles
            </Button>
          </div>
        </header>

        {/* DOCK BAR SEGMENT CONTROLLER */}
        <div className="flex overflow-x-auto gap-1 border-b border-slate-800/80 pb-3 scrollbar-none">
          {[
            { id: 'sandbox', label: 'Interactif Sandbox', icon: <Sliders className="w-4 h-4" /> },
            { id: 'palette', label: 'Charte & Nuancier', icon: <Layers className="w-4 h-4" /> },
            { id: 'typography', label: 'Typographie Specimen', icon: <Type className="w-4 h-4" /> },
            { id: 'feedback', label: 'Dynamiques & Chargeurs', icon: <Zap className="w-4 h-4" /> },
            { id: 'modal', label: 'Modales & Dialogues', icon: <Eye className="w-4 h-4" /> },
          ].map((seg) => {
            const isActive = activeSegment === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => setActiveSegment(seg.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shrink-0 ${
                  isActive 
                    ? 'bg-[#c19a6b] text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                }`}
              >
                {seg.icon}
                {seg.label}
              </button>
            );
          })}
        </div>

        {/* SEGMENT 1: INTERACTIVE SANDBOX ENGINE */}
        {activeSegment === 'sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            
            {/* CONTROLS (Left 5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Component selector */}
              <Card variant="glass" padding="md" className="border-slate-800 bg-slate-900/20">
                <CardHeader>
                  <CardTitle as="h3" className="text-xs font-mono uppercase tracking-widest text-slate-400">
                    1. Sélectionner l'Élément
                  </CardTitle>
                </CardHeader>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-3 gap-2 mt-2">
                  {[
                    { id: 'button', label: 'Bouton' },
                    { id: 'card', label: 'Carte' },
                    { id: 'badge', label: 'Badge' },
                    { id: 'input', label: 'Input' },
                    { id: 'select', label: 'Select' },
                  ].map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => setSandboxComponent(comp.id as any)}
                      className={`py-2 px-3 text-xs font-mono uppercase font-semibold rounded-lg border transition-all ${
                        sandboxComponent === comp.id
                          ? 'bg-[#c19a6b]/20 border-[#c19a6b] text-slate-100 shadow-inner'
                          : 'bg-obsidian-950/40 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {comp.label}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Dynamic State Controllers based on component selection */}
              <Card variant="default" padding="lg" className="border-slate-800 bg-obsidian-900/40 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Sliders className="w-4 h-4 text-[#c19a6b]" />
                  <CardTitle as="h4" className="text-xs font-mono uppercase text-slate-300 tracking-wider">
                    2. Configurer les Propriétés (Props)
                  </CardTitle>
                </div>

                {/* BUTTON SANDBOX CONTROLS */}
                {sandboxComponent === 'button' && (
                  <div className="space-y-4 text-xs font-mono">
                    <Input 
                      label="Texte du Bouton" 
                      value={btnText} 
                      onChange={(e) => setBtnText(e.target.value)} 
                    />

                    <Select
                      label="Variante Stylistique"
                      options={[
                        { value: 'primary', label: 'Primary (Accent Or)' },
                        { value: 'secondary', label: 'Secondary (Satin Noir)' },
                        { value: 'ghost', label: 'Ghost (Léger Sans Bord)' },
                        { value: 'danger', label: 'Danger (Velours Rouge)' },
                        { value: 'success', label: 'Success (Vert Opérationel)' },
                        { value: 'cyber', label: 'Cyber (Néon Fuschia)' },
                        { value: 'outline', label: 'Outline (Contour Or)' },
                      ]}
                      value={btnVariant}
                      onChange={(e: any) => setBtnVariant(e.target.value)}
                    />

                    <Select
                      label="Dimension Échelle"
                      options={[
                        { value: 'xs', label: 'Extra-Small (XS)' },
                        { value: 'sm', label: 'Small (SM)' },
                        { value: 'md', label: 'Medium (MD)' },
                        { value: 'lg', label: 'Large (LG)' },
                        { value: 'xl', label: 'Extra-Large (XL)' },
                      ]}
                      value={btnSize}
                      onChange={(e: any) => setBtnSize(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <label className="flex items-center gap-2 bg-obsidian-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                        <input 
                          type="checkbox" 
                          checked={btnIsLoading} 
                          onChange={(e) => setBtnIsLoading(e.target.checked)}
                          className="rounded text-[#c19a6b] focus:ring-[#c19a6b] bg-slate-900 border-slate-800"
                        />
                        <span>Is Loading</span>
                      </label>

                      <label className="flex items-center gap-2 bg-obsidian-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                        <input 
                          type="checkbox" 
                          checked={btnWithIcon} 
                          onChange={(e) => setBtnWithIcon(e.target.checked)}
                          className="rounded text-[#c19a6b] focus:ring-[#c19a6b] bg-slate-900 border-slate-800"
                        />
                        <span>With Icon</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* CARD SANDBOX CONTROLS */}
                {sandboxComponent === 'card' && (
                  <div className="space-y-4 text-xs font-mono">
                    <Input 
                      label="Titre du Panneau" 
                      value={cardTitle} 
                      onChange={(e) => setCardTitle(e.target.value)} 
                    />

                    <Textarea 
                      label="Contenu descriptif" 
                      value={cardDesc} 
                      onChange={(e) => setCardDesc(e.target.value)} 
                    />

                    <Select
                      label="Theme Style"
                      options={[
                        { value: 'default', label: 'Default Charcoal Dark' },
                        { value: 'gold', label: 'Royal Gold Border Accent' },
                        { value: 'cyber', label: 'Cyberpunk Biseauté Lumineux' },
                        { value: 'glass', label: 'Frosted Glass transparent' },
                        { value: 'glass-strong', label: 'Frosted Glass Opaque fort' },
                      ]}
                      value={cardVariant}
                      onChange={(e: any) => setCardVariant(e.target.value)}
                    />

                    <Select
                      label="Espacement Interne (Padding)"
                      options={[
                        { value: 'none', label: 'None' },
                        { value: 'sm', label: 'Small (SM)' },
                        { value: 'md', label: 'Medium (MD)' },
                        { value: 'lg', label: 'Large (LG)' },
                      ]}
                      value={cardPadding}
                      onChange={(e: any) => setCardPadding(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <label className="flex items-center gap-2 bg-obsidian-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                        <input 
                          type="checkbox" 
                          checked={cardGlow} 
                          onChange={(e) => setCardGlow(e.target.checked)}
                          className="rounded text-[#c19a6b] focus:ring-[#c19a6b] bg-slate-900 border-slate-800"
                        />
                        <span>Neon Glow</span>
                      </label>

                      <label className="flex items-center gap-2 bg-obsidian-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                        <input 
                          type="checkbox" 
                          checked={cardHover} 
                          onChange={(e) => setCardHover(e.target.checked)}
                          className="rounded text-[#c19a6b] focus:ring-[#c19a6b] bg-slate-900 border-slate-800"
                        />
                        <span>Interactive Hover</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* BADGE SANDBOX CONTROLS */}
                {sandboxComponent === 'badge' && (
                  <div className="space-y-4 text-xs font-mono">
                    <Input 
                      label="Label du Badge" 
                      value={badgeText} 
                      onChange={(e) => setBadgeText(e.target.value)} 
                    />

                    <Select
                      label="Tag Color"
                      options={[
                        { value: 'default', label: 'Charcoal Default' },
                        { value: 'success', label: 'Emerald Connected' },
                        { value: 'warning', label: 'Amber Process' },
                        { value: 'danger', label: 'Velvet Emergency' },
                        { value: 'info', label: 'Cyber Cyan Info' },
                        { value: 'gold', label: 'Royal Prestige Gold' },
                        { value: 'cyber', label: 'Cyberpunk Purple Neon' },
                        { value: 'purple', label: 'Imperial Deep Purple' },
                        { value: 'neutral', label: 'Silver Gray Neutral' },
                      ]}
                      value={badgeVariant}
                      onChange={(e: any) => setBadgeVariant(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <label className="flex items-center gap-2 bg-obsidian-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                        <input 
                          type="checkbox" 
                          checked={badgePulse} 
                          onChange={(e) => setBadgePulse(e.target.checked)}
                          className="rounded text-[#c19a6b] focus:ring-[#c19a6b] bg-slate-900 border-slate-800"
                        />
                        <span>Blink Pulse</span>
                      </label>

                      <label className="flex items-center gap-2 bg-obsidian-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                        <input 
                          type="checkbox" 
                          checked={badgeDot} 
                          onChange={(e) => setBadgeDot(e.target.checked)}
                          className="rounded text-[#c19a6b] focus:ring-[#c19a6b] bg-slate-900 border-slate-800"
                        />
                        <span>Show Dot</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* INPUT SANDBOX CONTROLS */}
                {sandboxComponent === 'input' && (
                  <div className="space-y-4 text-xs font-mono">
                    <Input 
                      label="Libellé du Label" 
                      value={inputLabel} 
                      onChange={(e) => setInputLabel(e.target.value)} 
                    />

                    <Input 
                      label="Placeholder d'accompagnement" 
                      value={inputPlaceholder} 
                      onChange={(e) => setInputPlaceholder(e.target.value)} 
                    />

                    <Input 
                      label="Message d'erreur fictif" 
                      value={inputError} 
                      onChange={(e) => setInputError(e.target.value)} 
                      placeholder="e.g. Clef invalide"
                    />

                    <label className="flex items-center gap-2 bg-obsidian-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input 
                        type="checkbox" 
                        checked={inputDisabled} 
                        onChange={(e) => setInputDisabled(e.target.checked)}
                        className="rounded text-[#c19a6b] focus:ring-[#c19a6b] bg-slate-900 border-slate-800"
                      />
                      <span>Indisponible (Disabled state)</span>
                    </label>
                  </div>
                )}

                {/* SELECT SANDBOX CONTROLS */}
                {sandboxComponent === 'select' && (
                  <p className="text-slate-400 text-xs text-center py-4">
                    Le composant Select hérite des structures standard Zaphir. Modifiez l'option active sur le panneau de test ci-contre.
                  </p>
                )}

              </Card>

            </div>

            {/* PREVIEW & GENERATE CODE (Right 7 Cols) */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
              
              {/* LIVE VIEW CANVAS */}
              <Card variant="glass-strong" padding="lg" className="border-slate-800 bg-slate-900/5 flex-1 flex flex-col justify-between relative min-h-[300px]">
                <div className="absolute top-2.5 right-3 flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Réticule de Test Actif
                </div>

                <div className="text-[10px] font-mono text-[#c19a6b] font-bold uppercase tracking-widest border-b border-slate-800/80 pb-2">
                  Spécimen Visuel Rendu
                </div>

                {/* CENTERED COMPONENT UNDER TEST */}
                <div className="flex-1 flex items-center justify-center p-8 bg-obsidian-950/40 rounded-2xl border border-slate-850/50 shadow-inner my-6 max-w-full overflow-hidden">
                  
                  {simulateLatency ? (
                    <div className="w-full space-y-3">
                      <Skeleton variant="text" lines={1} className="w-24 bg-slate-800/55" />
                      <div className="w-full h-12 bg-slate-800/25 rounded-xl animate-pulse flex items-center justify-center text-slate-500 text-xs font-mono">
                        Chargement de l'état asynchrone...
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex justify-center">
                      
                      {sandboxComponent === 'button' && (
                        <Button
                          variant={btnVariant}
                          size={btnSize}
                          isLoading={btnIsLoading}
                          leftIcon={btnWithIcon ? <Plus className="w-4 h-4" /> : undefined}
                          onClick={() => {
                            confetti({ particleCount: 35, spread: 40, colors: ['#c19a6b', '#ffffff'] });
                            toast.success("Impulsion Enregistrée", "L'action du bouton de test s'est exécutée avec brio.");
                          }}
                        >
                          {btnText}
                        </Button>
                      )}

                      {sandboxComponent === 'card' && (
                        <div className="w-full max-w-md">
                          <Card 
                            variant={cardVariant} 
                            glow={cardGlow} 
                            hoverable={cardHover} 
                            padding={cardPadding}
                          >
                            <CardHeader divided>
                              <CardTitle>{cardTitle}</CardTitle>
                              <CardDescription>{cardDesc}</CardDescription>
                            </CardHeader>
                            <div className="text-xs text-slate-300 font-mono space-y-2 mt-3 p-3 bg-black/40 rounded-lg">
                              <p className="text-slate-400 font-bold">Ajusteurs :</p>
                              <p className="text-[10px]">Variant: {cardVariant} | Glow: {cardGlow ? "ON" : "OFF"}</p>
                            </div>
                          </Card>
                        </div>
                      )}

                      {sandboxComponent === 'badge' && (
                        <Badge 
                          variant={badgeVariant} 
                          pulse={badgePulse} 
                          dot={badgeDot}
                        >
                          {badgeText}
                        </Badge>
                      )}

                      {sandboxComponent === 'input' && (
                        <div className="w-full max-w-sm">
                          <Input
                            label={inputLabel}
                            placeholder={inputPlaceholder}
                            error={inputError}
                            disabled={inputDisabled}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            leftIcon={<Mail className="w-4 h-4 text-[#c19a6b]" />}
                          />
                        </div>
                      )}

                      {sandboxComponent === 'select' && (
                        <div className="w-full max-w-sm">
                          <Select
                            label="Choix de l'Habilitation"
                            options={selectOptions}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Sélecteur d'autorisation..."
                          />
                        </div>
                      )}

                    </div>
                  )}

                </div>

                <div className="text-[10px] text-slate-500 font-mono text-center">
                  Astuce : Cliquez sur un bouton ou survolez la carte pour interagir.
                </div>
              </Card>

              {/* GENERATED TSX CODE ACCORDING */}
              <Card variant="default" padding="md" className="border-slate-800 bg-obsidian-950 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3.5">
                  <div className="flex items-center gap-2 text-[#c19a6b]">
                    <Terminal className="w-4 h-4" />
                    <span>Déclaration TSX Générée</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleCopyCode}
                    className="p-1 px-3 text-[10px] hover:text-slate-100 flex items-center gap-1.5 border border-slate-900 bg-black"
                  >
                    {copyCodeSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copyCodeSuccess ? "Copié !" : "Copier le Code"}
                  </Button>
                </div>
                
                <pre className="text-emerald-400/90 overflow-x-auto text-xs p-3.5 bg-black/60 rounded-xl leading-relaxed scrollbar-none">
                  <code>{getGeneratedCode()}</code>
                </pre>
              </Card>

            </div>

          </div>
        )}

        {/* SEGMENT 2: LUXURY COLOR SWATCHES */}
        {activeSegment === 'palette' && (
          <div className="space-y-6 animate-fade-in">
            <Card variant="glass-strong" padding="lg" className="border-slate-800 bg-slate-900/10">
              <CardHeader>
                <CardTitle>Nuancier Officiel & Symbolismes</CardTitle>
                <CardDescription>
                  L'univers colorimétrique de Zaphir allie de somptueuses teintes sombres à la délicatesse des nuances d'or sablé impérial. Cliquez sur chaque palette pour doper vos variables Tailwind CSS.
                </CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                {colorsList.map((color) => {
                  const isCopied = copiedColor === color.hex;
                  return (
                    <div
                      key={color.name}
                      onClick={() => handleCopyColor(color.hex)}
                      className="group cursor-pointer bg-[#0c0c0e] border border-slate-800 hover:border-[#c19a6b]/50 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 relative"
                    >
                      {/* Colored preview box */}
                      <div 
                        className="w-full h-24 rounded-xl shadow-inner relative overflow-hidden transition-all duration-300 group-hover:scale-[1.02]" 
                        style={{ backgroundColor: color.hex }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent flex items-end justify-between p-2.5">
                          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-white shadow-sm">
                            {color.hex}
                          </span>
                          <span className="w-6 h-6 rounded-full bg-slate-950/80 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all duration-300">
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-serif-luxury font-bold text-slate-100">{color.name}</p>
                          <Badge variant={color.group === 'primary' ? 'gold' : color.group === 'cyber' ? 'cyber' : 'neutral'} size="sm">
                            {color.group}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{color.desc}</p>
                      </div>

                      {/* Copied indicator banner */}
                      {isCopied && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-center p-3 animate-fade-in">
                          <Check className="w-6 h-6 text-emerald-400" />
                          <p className="text-[10px] font-mono text-emerald-400 font-bold uppercase mt-1">Copié avec succès !</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* TW-CONFIG COPY GUIDE */}
            <Card variant="default" padding="lg" className="border-slate-800 bg-obsidian-900/60 font-mono text-xs">
              <CardTitle as="h4" className="text-xs text-[#c19a6b] font-bold uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                Intégration tailwind.config.ts
              </CardTitle>
              <pre className="text-slate-300 overflow-x-auto text-[11px] p-3.5 bg-black/60 rounded-xl leading-relaxed mt-4">
                <code>{`colors: {
  zaphir: {
    100: '#fcfaf2', // Ivory Royal
    300: '#dcba92', // Amber Sand Accent
    500: '#c19a6b', // Sovereign Gold (Primary)
    700: '#7c5a30', // Antique Velvet Gold
  },
  obsidian: {
    900: '#0c0c0e', 
    950: '#09090b', // Base Deep Dark
  }
}`}</code>
              </pre>
            </Card>
          </div>
        )}

        {/* SEGMENT 3: TYPOGRAPHY SYSTEM SPECIMEN */}
        {activeSegment === 'typography' && (
          <div className="space-y-6 animate-fade-in">
            <Card variant="glass-strong" padding="lg" className="border-slate-800 bg-slate-900/10 space-y-6">
              <CardHeader>
                <CardTitle>Échelle Typographique Préférée</CardTitle>
                <CardDescription>
                  Zaphir combine deux expressions fortes. La grâce noble de polices serif rituelles, alliée à l'analyse rigoureuse de codes mono-espacés.
                </CardDescription>
              </CardHeader>

              {/* Dynamic typing simulation box */}
              <div className="p-4 bg-[#0a0a0c] border border-slate-800 rounded-2xl max-w-xl">
                <Input
                  label="Simuler une saisie personnalisée"
                  value={customTypoText}
                  onChange={(e) => setCustomTypoText(e.target.value)}
                  placeholder="Tapez vos mots ici..."
                  leftIcon={<Type className="w-4 h-4 text-[#c19a6b]" />}
                />
              </div>

              {/* Grid showcasing Font Families */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                
                {/* luxury Serif Specimen */}
                <div className="space-y-4 p-5 bg-obsidian-950 rounded-2xl border border-slate-850">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#c19a6b] uppercase">font-serif-luxury</span>
                    <Badge variant="gold">Affichages & Titres VIP</Badge>
                  </div>
                  <h3 className="font-serif-luxury text-3xl font-bold tracking-tight text-slate-100">
                    {customTypoText || "Ferdinand von Hapsburg"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Utilisé pour les en-têtes et les suites à grande valeur. Émet une signature d'exclusivité rigoureuse et de luxe intemporel.
                  </p>
                </div>

                {/* Cyber Mono Specimen */}
                <div className="space-y-4 p-5 bg-obsidian-950 rounded-2xl border border-slate-850">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">font-mono</span>
                    <Badge variant="cyber">Données & Bornes d'Accès</Badge>
                  </div>
                  <h3 className="font-mono text-xl tracking-wider text-cyan-200">
                    {customTypoText.toUpperCase() || "JWT-9941A-SHA256"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Utilisé pour les codes, les montants, les clés d'habilitation et l'enregistrement de l'audit. Offre une lisibilité chirurgicale.
                  </p>
                </div>

              </div>
            </Card>

            {/* Typography Scales Specimen */}
            <Card variant="default" padding="lg" className="border-slate-800 bg-obsidian-900/40 space-y-4">
              <CardTitle as="h3" className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Échelle de Proportion des Caractères
              </CardTitle>
              
              <div className="divide-y divide-slate-800/60 font-mono text-xs">
                {[
                  { tag: 'text-3xl', val: '24px', sample: 'Souveraineté Intacte' },
                  { tag: 'text-2xl', val: '20px', sample: 'Enrôler un Administrateur' },
                  { tag: 'text-lg', val: '18px', sample: 'Gérer la base de données de l\'hôtel' },
                  { tag: 'text-sm', val: '14px', sample: 'La signature biologique ne correspond pas' },
                  { tag: 'text-xs', val: '12px', sample: 'Ajustement de Tarification Introuvable' },
                  { tag: 'text-[10px]', val: '10px', sample: 'L5 VIP CLEARANCE DETECTED' }
                ].map((scale) => (
                  <div key={scale.tag} className="py-3 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[#c19a6b] font-bold">{scale.tag}</span>
                      <span className="text-slate-500">({scale.val})</span>
                    </div>
                    <div className="text-right sm:text-left font-sans font-medium text-slate-200 text-sm">
                      {scale.sample}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* SEGMENT 4: LOADING & FEEDBACK UTILITIES */}
        {activeSegment === 'feedback' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            
            {/* SPINNERS */}
            <Card variant="glass-strong" padding="lg" className="border-slate-800 bg-slate-900/10 space-y-6">
              <CardHeaderDivided>
                <CardTitle>Oscillateurs & Indicateurs de Processus</CardTitle>
                <CardDescription>
                  Une sélection de 4 styles de chargeurs Zaphir hautement polis selon le genre opérationnel.
                </CardDescription>
              </CardHeaderDivided>

              <div className="grid grid-cols-2 gap-4 pt-3 text-xs font-mono">
                <div className="flex flex-col items-center justify-center p-6 bg-obsidian-950/60 rounded-2xl border border-slate-800 text-center gap-1.5">
                  <Spinner variant="spinner" size="lg" />
                  <span className="text-slate-400 mt-2">Spinner</span>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-obsidian-950/60 rounded-2xl border border-slate-800 text-center gap-1.5">
                  <Spinner variant="dots" size="lg" />
                  <span className="text-slate-400 mt-2">Dots (Météore)</span>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-obsidian-950/60 rounded-2xl border border-slate-800 text-center gap-1.5">
                  <Spinner variant="pulse" size="lg" />
                  <span className="text-slate-400 mt-2">Pulse Wave</span>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-obsidian-950/60 rounded-2xl border border-slate-800 text-center gap-1.5">
                  <Spinner variant="bars" size="lg" />
                  <span className="text-slate-400 mt-2">Bars Scale</span>
                </div>
              </div>
            </Card>

            {/* SKELETON PREVIEWS OR EMPTY STATE PLACEHOLDERS */}
            <Card variant="glass-strong" padding="lg" className="border-slate-800 bg-slate-900/10 space-y-6">
              <CardHeaderDivided>
                <CardTitle>Skeletons Préfabriqués</CardTitle>
                <CardDescription>
                  Permettent de masquer la latence d'initialisation de l'API avec d'élégants blocs de pulsation.
                </CardDescription>
              </CardHeaderDivided>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2.5">
                    Modèle Carte Squelette (SkeletonCard)
                  </h4>
                  <SkeletonCard />
                </div>

                <div>
                  <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2.5">
                    Modèle Liste Squelette (SkeletonList count=2)
                  </h4>
                  <SkeletonList count={2} />
                </div>
              </div>
            </Card>

          </div>
        )}

        {/* SEGMENT 5: MODALS & CONSOLE TRIAL */}
        {activeSegment === 'modal' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
            
            {/* INSTRUCTIONS ON DIALOG */}
            <div className="md:col-span-4 space-y-4">
              <Card variant="glass" padding="md" className="border-slate-800 bg-slate-900/20">
                <CardTitle as="h3" className="text-xs font-mono uppercase tracking-widest text-[#c19a6b]">
                  Principes du Dialogue
                </CardTitle>
                <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                  Le composant <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded text-[10px]">Modal</code> intercepte le focus, supporte la sortie via la touche <code className="text-slate-300">ESC</code>, gère le flou d'arrière-plan de la surface et propose 3 formats d'affichage pour une étanchéité de contrôle absolue.
                </p>
                <div className="pt-3">
                  <Button
                    variant="primary"
                    fullWidth
                    leftIcon={<Play className="w-4 h-4" />}
                    onClick={() => setDemoModalOpen(true)}
                  >
                    Déclencher l'Overlay
                  </Button>
                </div>
              </Card>
            </div>

            {/* LIVE MODAL SIMULATION VIEW */}
            <div className="md:col-span-8">
              <Card variant="default" padding="lg" className="border-slate-800 bg-obsidian-900/40 relative min-h-[300px] flex flex-col justify-between">
                <CardHeaderDivided>
                  <CardTitle>Composant État Vide (EmptyState)</CardTitle>
                  <CardDescription>
                    Parfaitement adapté pour informer l'administrateur qu'une catégorie ou un dossier de recherche n'est pas encore implanté dans la session.
                  </CardDescription>
                </CardHeaderDivided>

                <div className="my-4">
                  <EmptyState
                    icon="📭"
                    title="Aucun ajustement de tarification"
                    description="Créez ou enrôlez une clé de contrat de niveau 5 pour voir s'afficher la courbe d'occupations hebdomadaires."
                    action={
                      <Button 
                        variant="outline" 
                        size="xs"
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => {
                          confetti({ particleCount: 20 });
                          toast.info("Génération de Gabarit", "Génération simulée d'un nouveau projet d'occupations.");
                        }}
                      >
                        Créer une Règle
                      </Button>
                    }
                  />
                </div>
              </Card>
            </div>

            {/* REAL DIALOG MODAL INNER SPECIMEN */}
            <Modal
              isOpen={demoModalOpen}
              onClose={() => setDemoModalOpen(false)}
              title="Consolidation et Clôture Financière"
              description="Êtes-vous certain de vouloir archiver le cycle d'opérations ?"
              size="md"
              footer={
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" className="text-slate-400 text-xs" onClick={() => setDemoModalOpen(false)}>
                    Annuler et Retourner
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => {
                      setDemoModalOpen(false);
                      toast.success(
                        "Consolidation Signée", 
                        "Le grand dôme financier a validé la transmission immuable sur le réseau d'accords."
                      );
                      confetti({ particleCount: 80, spread: 60, colors: ['#eb4444', '#c19a6b'] });
                    }}
                  >
                    Consolider et Signer
                  </Button>
                </div>
              }
            >
              <div className="space-y-4 font-sans text-stone-200">
                <p className="text-xs leading-relaxed text-slate-300">
                  Cette action transmettra les archives immuables d'occurrences pour authentifier les dockets des passagers royaux de l'Académie Zaphir.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-300 leading-normal font-mono">
                    Habilitation Requise : L5 Propriétaire Command Desk. Une fois le code d'accord certifié, il ne pourra plus subir d'altération sans clé de récupération.
                  </p>
                </div>
              </div>
            </Modal>

          </div>
        )}

      </div>
    </div>
  );
}

// Inline minor sub-components helper to avoid extra imports while maintaining high-end layout structure
function CardHeaderDivided({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-800/80 pb-3">
      {children}
    </div>
  );
}
