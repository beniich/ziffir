import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardFooter,
  Input, Select, Textarea, Modal, Badge, Spinner, Skeleton, SkeletonCard, SkeletonList,
  EmptyState, Tooltip, ToastContainer, toast,
} from '../components/ui';
import { Search, Mail, Trash2, Settings as SettingsIcon, Download, Plus } from 'lucide-react';
import { useState } from 'react';

const selectOptions = [
  { value: 'opt1', label: 'Option 1' },
  { value: 'opt2', label: 'Option 2' },
  { value: 'opt3', label: 'Option 3', disabled: true },
];

export default function DesignSystemShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  return (
    <div className="min-h-screen p-8 bg-obsidian-950">
      <ToastContainer />

      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gold-gradient bg-clip-text text-transparent">
            ZAPHIR Design System
          </h1>
          <p className="text-slate-400">Bibliothèque de composants v3.2</p>
        </header>

        {/* Buttons */}
        <Card variant="glass-strong" padding="lg">
          <CardHeader divided>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>7 variants × 5 tailles + états</CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="cyber">Cyber</Button>
              <Button variant="outline">Outline</Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Button size="xs">XS</Button>
              <Button size="sm">SM</Button>
              <Button size="md">MD</Button>
              <Button size="lg">LG</Button>
              <Button size="xl">XL</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button leftIcon={<Plus className="w-4 h-4" />}>Ajouter</Button>
              <Button rightIcon={<Download className="w-4 h-4" />} variant="secondary">Télécharger</Button>
              <Button isLoading>Loading</Button>
              <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>Supprimer</Button>
              <Tooltip content="Paramètres avancés">
                <Button variant="ghost" size="sm"><SettingsIcon className="w-4 h-4" /></Button>
              </Tooltip>
            </div>
          </div>
        </Card>

        {/* Cards */}
        <Card variant="glass-strong" padding="lg">
          <CardHeader divided>
            <CardTitle>Cards</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="default" hoverable>
              <CardTitle>Default + Hoverable</CardTitle>
              <CardDescription>Survolez-moi</CardDescription>
            </Card>
            <Card variant="gold" glow>
              <CardTitle>Gold + Glow</CardTitle>
              <CardDescription>Effet lumineux</CardDescription>
            </Card>
            <Card variant="cyber">
              <CardTitle>Cyber</CardTitle>
              <CardDescription>Scan lines animées</CardDescription>
            </Card>
          </div>
        </Card>

        {/* Forms */}
        <Card variant="glass-strong" padding="lg">
          <CardHeader divided>
            <CardTitle>Forms</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              placeholder="user@zaphir.com"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              hint="Votre adresse professionnelle"
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              leftIcon={<Search className="w-4 h-4" />}
              showPasswordToggle
            />
            <Select
              label="Choix"
              options={selectOptions}
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              placeholder="Sélectionner..."
            />
            <Input label="Avec erreur" defaultValue="abc" error="Format invalide" />
            <Textarea
              label="Description"
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              maxLength={200}
              showCount
              placeholder="Décrivez..."
            />
            <Input label="Désactivé" disabled defaultValue="Non modifiable" />
          </div>
        </Card>

        {/* Badges */}
        <Card variant="glass-strong" padding="lg">
          <CardHeader divided>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="success" pulse>Live</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="gold">Premium</Badge>
            <Badge variant="cyber">Cyber</Badge>
            <Badge variant="purple">VIP</Badge>
            <Badge variant="neutral" dot>3 nouveaux</Badge>
          </div>
        </Card>

        {/* Feedback */}
        <Card variant="glass-strong" padding="lg">
          <CardHeader divided>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spinners */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Spinners</h4>
              <div className="flex gap-6 items-center">
                <Spinner variant="spinner" size="md" label="Chargement" />
                <Spinner variant="dots" size="md" />
                <Spinner variant="pulse" size="md" />
                <Spinner variant="bars" size="md" />
              </div>
            </div>

            {/* Skeletons */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Skeletons</h4>
              <Skeleton variant="text" lines={3} />
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">EmptyState</h4>
            <EmptyState
              icon="📭"
              title="Aucun résultat"
              description="Aucun élément ne correspond à votre recherche"
              action={<Button variant="primary" size="sm">Réinitialiser</Button>}
            />
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={() => toast.success('Succès !', 'Opération réussie')}>
              Toast Success
            </Button>
            <Button variant="danger" onClick={() => toast.error('Erreur', 'Une erreur est survenue')}>
              Toast Error
            </Button>
            <Button variant="secondary" onClick={() => toast.info('Info', 'Note informative')}>
              Toast Info
            </Button>
          </div>
        </Card>

        {/* Modal trigger */}
        <Card variant="glass-strong" padding="lg">
          <CardHeader divided>
            <CardTitle>Modal</CardTitle>
          </CardHeader>
          <Button onClick={() => setModalOpen(true)}>Ouvrir la modal</Button>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirmation requise"
            description="Cette action est irréversible"
            size="md"
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
                <Button variant="danger" onClick={() => setModalOpen(false)}>Confirmer</Button>
              </>
            }
          >
            <p className="text-slate-300">
              Êtes-vous sûr de vouloir continuer ? Cette action ne peut pas être annulée.
            </p>
          </Modal>
        </Card>

        {/* SkeletonCard & SkeletonList */}
        <Card variant="glass-strong" padding="lg">
          <CardHeader divided>
            <CardTitle>Skeleton (chargements)</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">SkeletonCard</h4>
              <SkeletonCard />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">SkeletonList</h4>
              <SkeletonList count={4} />
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
