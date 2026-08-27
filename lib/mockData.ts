import {
  Client,
  CompanySettings,
  Invoice,
  StatCardData,
  ChartDataPoint,
  StatusBreakdown,
  RecentPayment,
  AppNotification,
  Product,
  Quote,
  Subscription,
  ActivityItem,
} from '@/types';

export const defaultCompanySettings: CompanySettings = {
  name: "Mon Entreprise Pro",
  tagline: "Gestion simple et rapide pour mon commerce",
  logoUrl: "https://images.unsplash.com/photo-1542744094-3a3122c9d246?w=120&h=120&fit=crop&crop=faces&auto=format&q=80",
  address: "Avenue Cheikh Anta Diop",
  city: "Dakar",
  country: "Sénégal",
  phone: "+221 77 000 00 00",
  phone2: "",
  email: "contact@monentreprise.sn",
  website: "",
  currency: "FCFA",
  defaultVatRate: 18,
  defaultTerms: "Paiement à réception de facture.",
  signatureUrl: "",
  primaryColor: "#2563EB",
  invoicePrefix: "FACT-2026-",
  nextInvoiceNumber: 7,
  bankAccountName: "",
  bankAccountNumber: "",
  bankName: "",
  bankIban: "",
  mobileMoneyProvider: "Wave / Orange Money",
  mobileMoneyNumber: "+221 77 000 00 00",
  mobileMoneyName: "Mon Commerce",
};

export const mockClients: Client[] = [
  {
    id: "cli-101",
    name: "Moussa Diop",
    company: "Boutique Diop",
    email: "moussa@boutiquediop.sn",
    phone: "+221 77 123 45 67",
    address: "Marché Sandaga, Dakar",
    city: "Dakar",
    country: "Sénégal",
    totalInvoiced: 80000,
    invoiceCount: 1,
    notes: "Client régulier.",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-01-12",
  },
  {
    id: "cli-102",
    name: "Fatou Ndiaye",
    company: "Épicerie Ndiaye",
    email: "f.ndiaye@epicerie.sn",
    phone: "+221 76 234 56 78",
    address: "Parcelles Assainies, Dakar",
    city: "Dakar",
    country: "Sénégal",
    totalInvoiced: 45000,
    invoiceCount: 1,
    notes: "",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-02-01",
  },
  {
    id: "cli-103",
    name: "Awa Sow",
    company: "Salon Awa Beauté",
    email: "awa@beaute.sn",
    phone: "+221 70 111 22 33",
    address: "Sacré-Cœur 3, Dakar",
    city: "Dakar",
    country: "Sénégal",
    totalInvoiced: 150000,
    invoiceCount: 1,
    notes: "",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-03-15",
  },
  {
    id: "cli-104",
    name: "Amadou Ba",
    company: "Garage Ba Auto",
    email: "contact@ba-auto.sn",
    phone: "+221 70 345 67 89",
    address: "Zone Industrielle, Bel-Air",
    city: "Dakar",
    country: "Sénégal",
    totalInvoiced: 25000,
    invoiceCount: 1,
    notes: "",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-04-10",
  },
  {
    id: "cli-105",
    name: "Khady Gueye",
    company: "Boulangerie Khady",
    email: "khady@boulangerie.sn",
    phone: "+221 77 456 78 90",
    address: "Avenue Blaise Diagne",
    city: "Dakar",
    country: "Sénégal",
    totalInvoiced: 12500,
    invoiceCount: 1,
    notes: "",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-05-20",
  },
  {
    id: "cli-106",
    name: "Samba Fall",
    company: "Atelier Samba",
    email: "samba@atelier.sn",
    phone: "+221 78 666 77 88",
    address: "Médina, Dakar",
    city: "Dakar",
    country: "Sénégal",
    totalInvoiced: 5000,
    invoiceCount: 1,
    notes: "",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-06-05",
  },
  {
    id: "cli-107",
    name: "Ousmane Fall",
    company: "Quincaillerie Fall",
    email: "quincaillerie@fall.sn",
    phone: "+221 78 567 89 01",
    address: "Pikine, Dakar",
    city: "Dakar",
    country: "Sénégal",
    totalInvoiced: 80000,
    invoiceCount: 1,
    notes: "",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-06-12",
  },
  {
    id: "cli-108",
    name: "Abdoulaye Sarr",
    company: "Électronique Dakar",
    email: "sarr@electronique.sn",
    phone: "+221 77 678 90 12",
    address: "Grand-Dakar",
    city: "Dakar",
    country: "Sénégal",
    totalInvoiced: 45000,
    invoiceCount: 1,
    notes: "",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-06-18",
  }
];

const today = new Date();
const todayDateStr = today.toISOString().split("T")[0];

const today1 = new Date(today);
today1.setHours(20, 51, 0);

const today2 = new Date(today);
today2.setHours(18, 32, 0);

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(16, 15, 0);

export const mockInvoices: Invoice[] = [
  {
    id: "inv-001",
    number: "000001",
    issueDate: today1.toISOString(),
    dueDate: todayDateStr,
    clientId: "cli-divers",
    client: {} as any,
    items: [
      { id: "item-1", description: "Riz", quantity: 2, unitPrice: 15000, vatRate: 0, amount: 30000 },
    ],
    subtotal: 30000,
    vatRate: 0,
    vatAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    total: 30000,
    amountPaid: 30000,
    amountDue: 0,
    status: "Payée",
    currency: "FCFA",
    companySettings: defaultCompanySettings,
  },
  {
    id: "inv-002",
    number: "000002",
    issueDate: today2.toISOString(),
    dueDate: todayDateStr,
    clientId: "cli-divers",
    client: {} as any,
    items: [
      { id: "item-2", description: "Huile", quantity: 3, unitPrice: 5000, vatRate: 0, amount: 15000 },
    ],
    subtotal: 15000,
    vatRate: 0,
    vatAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    total: 15000,
    amountPaid: 15000,
    amountDue: 0,
    status: "Payée",
    currency: "FCFA",
    companySettings: defaultCompanySettings,
  },
  {
    id: "inv-003",
    number: "000003",
    issueDate: yesterday.toISOString(),
    dueDate: yesterday.toISOString().split("T")[0],
    clientId: "cli-divers",
    client: {} as any,
    items: [
      { id: "item-3", description: "Sucre", quantity: 2, unitPrice: 5000, vatRate: 0, amount: 10000 },
    ],
    subtotal: 10000,
    vatRate: 0,
    vatAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    total: 10000,
    amountPaid: 10000,
    amountDue: 0,
    status: "Payée",
    currency: "FCFA",
    companySettings: defaultCompanySettings,
  }
];

export const mockStatCards: StatCardData[] = [
  {
    title: "Total Des Factures",
    value: "317 500 FCFA",
    change: "Toutes factures confondues",
    isPositive: true,
    icon: "FileText",
    description: "Total des ventes facturées",
  },
  {
    title: "Montant Payé",
    value: "110 000 FCFA",
    change: "Argent bien reçu",
    isPositive: true,
    icon: "CheckCircle",
    description: "Total encaissé",
  },
  {
    title: "Montant En Attente",
    value: "162 500 FCFA",
    change: "Factures en cours",
    isPositive: true,
    icon: "Clock",
    description: "En attente de règlement",
  },
  {
    title: "Factures En Retard",
    value: "45 000 FCFA",
    change: "À relancer",
    isPositive: false,
    icon: "AlertOctagon",
    description: "Date d'échéance dépassée",
  }
];

export const mockChartData: ChartDataPoint[] = [
  { month: 'Jan', revenue: 45000, paid: 45000, pending: 0 },
  { month: 'Fév', revenue: 80000, paid: 80000, pending: 0 },
  { month: 'Mar', revenue: 150000, paid: 125000, pending: 25000 },
  { month: 'Avr', revenue: 60000, paid: 60000, pending: 0 },
  { month: 'Mai', revenue: 120000, paid: 100000, pending: 20000 },
  { month: 'Juin', revenue: 80000, paid: 80000, pending: 0 },
  { month: 'Juil', revenue: 317500, paid: 110000, pending: 207500 },
];

export const mockStatusBreakdown: StatusBreakdown[] = [
  { status: "Payée", count: 3, amount: 110000, color: "#10B981" },
  { status: "En retard", count: 1, amount: 45000, color: "#EF4444" },
  { status: "Envoyée", count: 1, amount: 150000, color: "#3B82F6" },
  { status: "Brouillon", count: 1, amount: 12500, color: "#64748B" },
];

export const mockRecentPayments: RecentPayment[] = [
  { id: "pay-101", invoiceNumber: "FACT-2026-001", clientName: "Boutique Diop", amount: 80000, date: "2026-07-20", method: "Wave" },
  { id: "pay-102", invoiceNumber: "FACT-2026-004", clientName: "Garage Ba Auto", amount: 25000, date: "2026-07-25", method: "Espèces" },
  { id: "pay-103", invoiceNumber: "FACT-2026-006", clientName: "Atelier Samba", amount: 5000, date: "2026-07-15", method: "Espèces" },
];

export const mockNotifications: AppNotification[] = [
  { id: "notif-1", title: "Paiement reçu", description: "Boutique Diop a réglé sa facture de 80 000 FCFA via Wave.", date: "Il y a 2h", read: false, type: "payment" },
  { id: "notif-2", title: "Facture en retard", description: "La facture de Épicerie Ndiaye (45 000 FCFA) est en retard.", date: "Hier", read: false, type: "overdue" },
];

export const mockProducts: Product[] = [
  { id: "prod-1", name: "Prestation de service / Réparation", price: 25000, vatRate: 18, description: "Main d'œuvre et dépannage professionnel", stock: "Service", category: "Service", type: "Service", sku: "REF-001", unit: "forfait" },
  { id: "prod-2", name: "Fourniture de marchandises", price: 80000, vatRate: 18, description: "Lot d'articles et produits de boutique", stock: "En stock", category: "Produit", type: "Produit", sku: "REF-002", unit: "lot" },
  { id: "prod-3", name: "Entretien et nettoyage", price: 12500, vatRate: 18, description: "Entretien rapide et contrôle", stock: "Service", category: "Service", type: "Service", sku: "REF-003", unit: "prestation" },
];

export const mockQuotes: Quote[] = [
  {
    id: "quot-001",
    number: "DEV-2026-001",
    title: "Installation équipement complet",
    date: "2026-07-22",
    issueDate: "2026-07-22",
    validUntil: "2026-08-22",
    clientId: "cli-107",
    client: mockClients[6],
    items: [
      { id: "qit-1", description: "Matériel quincaillerie et installation", quantity: 1, unitPrice: 80000, vatRate: 0, amount: 80000 },
    ],
    subtotal: 80000,
    vatRate: 0,
    vatAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    total: 80000,
    status: "Accepté",
    notes: "Devis validé par Ousmane Fall.",
    terms: "Validité 30 jours.",
    currency: "FCFA"
  }
];

export const mockSubscriptions: Subscription[] = [
  { id: "sub-1", title: "Entretien mensuel boutique", currency: "FCFA", clientName: "Boutique Diop", clientId: "cli-101", planName: "Forfait Entretien Mensuel", amount: 25000, frequency: "Mensuel", nextBillingDate: "2026-09-01", status: "Actif", paymentMethod: "Wave" },
];

export const mockActivities: ActivityItem[] = [
  { id: "act-1", time: "09:20", title: "Facture FACT-2026-003 envoyée", subtitle: "Salon Awa Beauté • 150 000 FCFA", type: "invoice" },
  { id: "act-2", time: "09:15", title: "Paiement reçu via Wave 📱", subtitle: "+80 000 FCFA de Boutique Diop", type: "payment" },
  { id: "act-3", time: "08:50", title: "Nouveau client ajouté 🎉", subtitle: "Quincaillerie Fall", type: "client" },
  { id: "act-4", time: "08:32", title: "Facture FACT-2026-005 en brouillon", subtitle: "Boulangerie Khady • 12 500 FCFA", type: "invoice" },
];

/**
 * Utilitaires de persistance des factures (en mémoire + localStorage)
 * Permet d'afficher immédiatement les factures créées au niveau de la liste des factures
 */
export function getStoredInvoices(): Invoice[] {
  if (typeof window === "undefined") return mockInvoices;
  try {
    const stored = localStorage.getItem("vando_sales_v1");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Erreur de chargement des factures depuis localStorage:", e);
  }
  return mockInvoices;
}

export function saveStoredInvoice(invoice: Invoice): void {
  const current = getStoredInvoices();
  const index = current.findIndex((i) => i.id === invoice.id || i.number === invoice.number);
  let updated: Invoice[];
  if (index >= 0) {
    updated = current.map((item, idx) => (idx === index ? invoice : item));
  } else {
    updated = [invoice, ...current];
  }

  // Mettre à jour en mémoire pour accès immédiat
  const memIndex = mockInvoices.findIndex((i) => i.id === invoice.id || i.number === invoice.number);
  if (memIndex >= 0) {
    mockInvoices[memIndex] = invoice;
  } else {
    mockInvoices.unshift(invoice);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("vando_sales_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Erreur de sauvegarde de la facture dans localStorage:", e);
    }
  }
}

export function deleteStoredInvoice(invoiceId: string): void {
  const current = getStoredInvoices();
  const updated = current.filter((i) => i.id !== invoiceId);

  const memIndex = mockInvoices.findIndex((i) => i.id === invoiceId);
  if (memIndex >= 0) {
    mockInvoices.splice(memIndex, 1);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("vando_sales_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Erreur de suppression de la facture dans localStorage:", e);
    }
  }
}

export function deleteStoredInvoices(invoiceIds: string[]): void {
  const current = getStoredInvoices();
  const updated = current.filter((i) => !invoiceIds.includes(i.id));

  invoiceIds.forEach((id) => {
    const memIndex = mockInvoices.findIndex((i) => i.id === id);
    if (memIndex >= 0) {
      mockInvoices.splice(memIndex, 1);
    }
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("vando_sales_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Erreur de suppression multiple des factures:", e);
    }
  }
}

export function updateStoredInvoicesList(invoices: Invoice[]): void {
  // Mettre à jour en mémoire
  mockInvoices.length = 0;
  invoices.forEach((inv) => mockInvoices.push(inv));
  
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("vando_sales_v1", JSON.stringify(invoices));
    } catch (e) {
      console.error("Erreur de mise à jour de la liste dans localStorage:", e);
    }
  }
}

export function getStoredSettings(): CompanySettings {
  if (typeof window === "undefined") return defaultCompanySettings;
  try {
    const stored = localStorage.getItem("vando_settings_v1");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Erreur de chargement des paramètres depuis localStorage:", e);
  }
  return defaultCompanySettings;
}

export function saveStoredSettings(settings: CompanySettings): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("vando_settings_v1", JSON.stringify(settings));
    } catch (e) {
      console.error("Erreur de sauvegarde des paramètres dans localStorage:", e);
    }
  }
}
