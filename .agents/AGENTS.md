# Design System & Directives UI de l'Application (FacturAfric)

Cette règle définit le **Design System** strict et obligatoire que l'agent Antigravity doit respecter lors de la création, la modification ou l'enrichissement de toutes les pages, vues et composants de cette application (Factures, Clients, Paramètres, Abonnements, etc.).

---

## 1. Philosophie & Esthétique de Base
- **Simplicité & Zéro Surcharge** : Privilégier une lisibilité parfaite, épurée et moderne. Ne jamais insérer de graphiques lourds (`recharts`, courbes, camemberts inutiles) ou d'encarts superflus sauf demande explicite.
- **SaaS Premium "State-of-the-Art"** : L'interface doit donner une impression immédiate de haute qualité professionnelle : contrastes soignés, polices hiérarchisées, cartes structurées et micro-interactions fluides.

---

## 2. Palette Couleurs & Jetons Tailwind CSS
- **Arrière-plan Global** : Toujours reposer sur le fond de l'application `bg-[#F8FAFC]` (Slate 50) avec texte principal en `text-slate-900`.
- **Surfaces de Cartes** : Fonds blancs primaires `bg-white`, enrichis d'en-têtes ou zones de filtres en `bg-slate-50/80` ou `bg-slate-50/70`.
- **Code Couleur Sémantique (Vibrant & Clair)** :
  - **Action / Sélection / Primaire** : Bleu (`bg-blue-600`, texte `text-blue-600`, ombre `shadow-blue-500/20` ou `shadow-blue-600/20`). Au survol : `hover:bg-blue-500` avec lévitation.
  - **Succès / Encaissé / Positif** : Émeraude (`text-emerald-600`, fonds légers `bg-emerald-50` ou dégradés `from-emerald-500/5`).
  - **En Attente / Horloge / Neutre chaud** : Ambre / Jaune (`text-amber-600`, `hover:border-amber-500/40`).
  - **En Retard / Urgence / Erreur** : Rose / Rouge (`text-rose-600`, fonds d'alerte `bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200/80`).
  - **Neutre / Secondaire** : Ardoise (`text-slate-500` à `text-slate-700`), Indigo (`text-indigo-600`) et Violet (`text-purple-600`).

---

## 3. Arrondis, Bordures & Ombres
- **Rayons (Border Radius)** :
  - **Cartes principales, conteneurs de tableaux, bannières** : `rounded-2xl` avec `border border-slate-200/80 shadow-xs` ou `shadow-md`.
  - **Boutons, champs de recherche, pilules de filtres, boutons d'action** : `rounded-xl`, hauteur standardisée `h-9` pour les boutons d'en-tête.
  - **Badges de statut & compteurs** : `rounded-lg` ou `rounded-full`.
- **Bordures Subtiles & Interactives** : Repos en `border-slate-200/80` ou `border-slate-100/80`. Les cartes interactives s'illuminent au survol : `hover:border-blue-500/40`, `hover:border-emerald-500/40`, etc.
- **Ombres Dynamiques** : Passage fluide de `shadow-2xs` / `shadow-xs` à `shadow-md`, `shadow-lg`, ou `shadow-xl` au passage du curseur.

---

## 4. Micro-Animations & Interactions au Curseur (Mandatoire)
Toutes les zones interactives (cartes KPI, lignes de tableaux, boutons) doivent intégrer des micro-interactions vivantes en utilisant la classe `group` sur le conteneur principal et `group-hover:` sur les éléments enfants.

### A. Cartes KPI & Indicateurs
- **Lévitation** : `transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl cursor-pointer bg-white relative overflow-hidden group`.
- **Dégradé d'Arrière-plan (Glow au survol)** : Toujours intégrer un calque d'illumination à l'intérieur de la carte interactive :
  ```tsx
  <div className="absolute inset-0 bg-gradient-to-br transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none from-blue-500/5 via-blue-500/0" />
  ```
- **Icône Dynamique** : Le conteneur d'icône s'anime avec un zoom et une légère rotation : `group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`.
- **Texte / Chiffre** : Le montant ou titre principal grandit subtilement : `group-hover:scale-[1.02] origin-left transition-transform duration-200`.

### B. Lignes de Tableaux Interactives
- **Ligne (`<tr>`)** : `hover:bg-blue-50/40 hover:shadow-sm transition-all duration-200 group cursor-pointer`.
- **Éléments Internes au survol de la ligne** :
  - Référence / Identifiant : `group-hover:text-blue-600 transition-colors`. Point d'indicateur : `w-2 h-2 rounded-full bg-blue-600 group-hover:scale-125 transition-transform`.
  - Avatars / Photos : `w-8 h-8 rounded-full object-cover border border-slate-100 shadow-2xs group-hover:ring-2 group-hover:ring-blue-500/30 transition-all`.
  - Badges de statut : `group-hover:scale-105 origin-left transition-transform duration-200`.
  - Boutons de navigation / Chevron en fin de ligne : `p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-600/20 transition-all duration-200` avec flèche interne `group-hover:translate-x-0.5 transition-transform`.

### C. Boutons & Actions
- **Effet Magnétique / Lévitation** : Utiliser systématiquement `transition-all duration-200 (ou 300) transform hover:-translate-y-0.5` avec réhaussement d'ombre (`hover:shadow-md hover:shadow-blue-500/30`).

---

## 5. Architecture Spatiale & Composition des Pages

### A. Conteneur Général de Page
```tsx
<div className="space-y-8 pb-14 animate-fade-in w-full min-w-0">
```

### B. En-tête de Page Standard (Header)
```tsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
  <div>
    <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
      <span>Titre de la Page</span>
    </h1>
    <p className="text-xs font-medium text-slate-500 mt-1">
      Sous-titre descriptif et accueillant pour l'utilisateur.
    </p>
  </div>
  <div className="flex items-center gap-3 flex-shrink-0">
    {/* Boutons d'action (secondaire blanc en rounded-xl, primaire bleu en rounded-xl) */}
  </div>
</div>
```

### C. Sections de Liste & Barre d'Outils (Recherche & Filtres)
- **Barre d'en-tête de catalogue** : Conteneur `bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/60 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4`.
- **Champ de Recherche** : Input `w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 bg-white rounded-xl border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all` avec icône Search de Lucide positionnée en absolu (`absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none`).
- **Pilules de Filtrage (Filter Tabs)** : 
  - Conteneur défilable sur mobile : `flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar`.
  - Pilule Active : `px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center space-x-2 bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02] transform hover:-translate-y-0.5`. Compteur interne en `bg-white/20 text-white px-1.5 py-0.5 rounded-lg text-[10px]`.
  - Pilule Inactive : `px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-2xs transform hover:-translate-y-0.5`. Compteur interne en `bg-slate-100 text-slate-600`.

### D. Tableaux (Tables & Catalogues)
- **Structure du Tableau** :
  ```tsx
  <Card className="p-0 overflow-hidden border border-slate-200/80 shadow-md bg-white rounded-2xl">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[650px]">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70">
            <th className="py-3.5 px-5">Colonnes...</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/80 text-xs">
          {/* Lignes animées avec group */}
        </tbody>
      </table>
    </div>
    {/* Pied de tableau / Synthèse */}
    <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
      {/* Compteur d'affichage et Cumul total */}
    </div>
  </Card>
  ```

---

## 6. Responsivité & Alignements
- **Mobile-First strict** : Empilement vertical en mobile (`flex-col`, `grid-cols-1`) avec transition douce vers les mises en page larges (`sm:flex-row`, `md:items-center`, `sm:grid-cols-2`, `lg:grid-cols-4`).
- **Protection contre le débordement (Overflow Safety)** : Toujours envelopper les tableaux de `overflow-x-auto` avec `min-w-[450px]` ou `min-w-[650px]`. Pour les cellules contenant du texte de longueur imprévisible (entreprise, email, note), combiner un conteneur `min-w-0` avec la classe `truncate` sur le texte.
- **Grilles de KPI / Prix** : Utiliser l'espacement standardisé `gap-4 sm:gap-5`.
