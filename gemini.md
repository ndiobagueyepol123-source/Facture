# Projet Vando / FacturAfric - Knowledge Base (gemini.md)

Ce document sert de base de connaissances et de point d'entrée pour toute intelligence artificielle (ou développeur) travaillant sur le projet **Vando** (également appelé FacturAfric). Il décrit l'application, ses fonctionnalités, sa structure, sa stack technique et les règles d'architecture et de design à respecter scrupuleusement.

---

## 1. Description du Projet
Vando est une application SaaS de gestion de caisse, facturation, devis et suivi d'activités (subscriptions, calendrier) pensée pour le marché africain et international. L'objectif est d'offrir une expérience utilisateur (UX/UI) ultra-premium, rapide, épurée et "mobile-first". 

L'application permet à un commerçant ou un prestataire de services de :
- Gérer son catalogue de produits.
- Éditer des ventes (factures) très rapidement (interface type "Point de Vente").
- Suivre ses encaissements et générer des devis.
- Gérer des abonnements (revenus récurrents - MRR).
- Générer des reçus thermiques (80mm) imprimables et partageables via WhatsApp.

---

## 2. Fonctionnalités Implémentées

- **Dashboard (`/dashboard`)** : Vue d'ensemble des KPIs (Revenus, Ventes, etc.) avec graphiques (Recharts) et synthèses récentes.
- **Gestion des Ventes/Factures (`/invoices`)** : 
  - Liste des ventes avec filtres de date et recherches.
  - Studio de création (`/invoices/create`) permettant d'ajouter rapidement des produits, de calculer les totaux, d'ajuster les remises.
  - Vue de détail (`/invoices/[id]`) avec aperçu du ticket de caisse et boutons d'action fluides (Imprimer, WhatsApp, Télécharger). L'interface mobile met le ticket en première priorité.
- **Reçu Thermique (Receipt)** : Un composant de ticket de caisse (`components/receipt/Receipt.tsx`) au format fixe 80mm (environ 320px). Largeur verrouillée, texte tronqué intelligemment pour éviter que le ticket ne s'élargisse selon le nombre d'articles.
- **Système Global de Devises (`CurrencyProvider`)** : Un sélecteur global situé dans le header permet de basculer l'affichage de toute l'application dans différentes devises (FCFA, XAF, NGN, USD, EUR, etc.). Les conversions se font à la volée. 
  - *Exception comptable* : Les factures déjà générées (et leur reçu) conservent la devise d'origine (sauvegardée au moment de la vente).
- **Catalogue Produits (`/products`)** : Liste et gestion des articles vendus.
- **Encaissements (`/payments`)** : Suivi des paiements.
- **Devis (`/quotes`)** : Création et gestion des propositions commerciales.
- **Abonnements (`/subscriptions`)** : Suivi des paiements récurrents et calcul du MRR.
- **Échéancier (`/calendar`)** : Suivi des échéances et factures récurrentes.
- **Paramètres (`/settings`)** : Configuration de l'entreprise (Nom, Logo, Adresse, etc.).

---

## 3. Stack Technique

- **Framework** : [Next.js v14](https://nextjs.org/) (App Router).
- **Interface & React** : React 18, TypeScript, Tailwind CSS v3.
- **Icônes** : [Lucide React](https://lucide.dev/).
- **Graphiques** : Recharts.
- **Gestion de Formulaires & Validation** : React Hook Form, Zod.
- **Gestion des Dates** : date-fns.
- **Animations Supplémentaires** : GSAP (si nécessaire), animations Tailwind natives (`animate-fade-in`, transitions).
- **Données Mocks** : Gérées via localStorage dans `lib/mockData.ts` pour simuler une base de données locale pendant le développement frontend.

---

## 4. Structure des Fichiers Clés

```text
/app                  # Routes Next.js (App Router)
/components           # Composants UI globaux et réutilisables (ui/, layout/, receipt/)
/features             # Composants spécifiques par domaine métier (invoices, products, dashboard...)
/lib                  # Utilitaires (utils.ts) et données mockées (mockData.ts)
/providers            # Contextes React (ex: CurrencyProvider.tsx)
/types                # Déclarations TypeScript globales (types/index.ts)
/.agents              # Configurations et directives IA locales (AGENTS.md)
gemini.md             # Ce fichier de documentation
```

---

## 5. Décisions de Design (UI/UX) - Règles d'Or
Le design system complet se trouve dans `.agents/AGENTS.md`. Tout développement doit le respecter strictement :

1. **Esthétique Premium & Épurée** :
   - Fond global : `bg-slate-50`. Surfaces : `bg-white`.
   - Textes : `text-slate-900` (primaire), `text-slate-500` (secondaire).
   - Couleurs sémantiques vibrantes : Bleu (`blue-600`) pour l'action principale, Émeraude (`emerald-600`) pour le succès/WhatsApp, Rose (`rose-600`) pour le danger.
2. **Formes & Ombres douces** :
   - Conteneurs et cartes : `rounded-2xl` ou `rounded-3xl` avec bordures très subtiles (`border-slate-200/80`) et ombres légères (`shadow-sm`).
   - Boutons : `rounded-xl` ou `rounded-2xl`.
3. **Micro-Interactions (OBLIGATOIRES)** :
   - Tous les boutons et cartes interactifs doivent utiliser `transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md`.
   - Utilisation massive des groupes (`group`) pour animer les éléments internes (ex: `group-hover:scale-110` sur les icônes à l'intérieur d'un bouton).
4. **Mobile First & Hiérarchie Visuelle** :
   - Sur mobile, l'empilement `flex-col` est la règle.
   - Exemple (Vue Détail de Facture) : Le ticket passe avant les boutons d'action sur mobile, car c'est l'information la plus importante.

---

## 6. Instructions pour les Modèles IA Futurs

Si vous êtes une IA chargée de maintenir, débugger ou étendre ce projet, lisez et appliquez systématiquement ceci :

1. **Ne pas casser le Design System** : N'inventez pas de nouvelles couleurs ou de nouveaux styles de bordures. Réutilisez les classes Tailwind existantes (ex: `bg-white border border-slate-200/80 shadow-sm rounded-2xl`).
2. **Gestion des Devises** : 
   - Toute valeur monétaire de l'interface DOIT être formatée avec le `CurrencyProvider` (accessible via `const { activeCurrency, convertAndFormat, formatOnly, getConvertedAmount } = useCurrency();`).
   - `formatOnly(montant, devise)` : Formate simplement le chiffre, sans changer la valeur. Utile pour les tickets de caisse figés dans le temps.
   - `convertAndFormat(montant, deviseOrigine)` : Convertit la valeur de la devise d'origine vers la devise actuellement sélectionnée globalement, et formate l'affichage. Utile pour les KPI et les listes.
3. **Tickets de Caisse (Receipt)** :
   - Le ticket doit STRICTEMENT conserver son rendu "Imprimante Thermique". Ne jamais laisser le conteneur s'étirer à 100% de la largeur sur un grand écran. Il doit mesurer `w-full max-w-sm` au maximum.
   - Les noms de produits longs dans le reçu doivent être tronqués avec `truncate` ou `line-clamp` pour ne pas casser la largeur.
4. **Hydratation & Next.js** : 
   - Gardez à l'esprit les problèmes d'hydratation liés au `localStorage`. Utilisez l'état `mounted` pour vous assurer que le client et le serveur effectuent le même rendu initial.
5. **Modification des Fichiers** :
   - Regardez d'abord le comportement existant. Ne réinventez pas les icônes (utiliser toujours Lucide). Privilégiez `multi_replace_file_content` pour des modifications ciblées.

🚀 **Projet prêt pour évoluer.** Maintenez l'application de façon claire, compacte, et toujours "WOW" visuellement.
