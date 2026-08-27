export type InvoiceStatus = 'Brouillon' | 'Envoyée' | 'Payée' | 'Partiellement payée' | 'En retard' | 'Annulée';

export type PaymentMethod = 'Virement Bancaire' | 'Mobile Money' | 'Carte Bancaire' | 'Espèces' | 'Chèque' | 'Wave' | 'Orange Money';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number; // e.g. 18 for 18%
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  totalInvoiced: number;
  invoiceCount: number;
  notes?: string;
  avatar?: string;
  createdAt?: string;
  status?: 'Actif' | 'Inactif';
}

export interface Invoice {
  id: string;
  number: string;
  issueDate: string;
  createdAt?: string;
  dueDate: string;
  clientId: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  discountRate: number; // Percentage
  discountAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  notes?: string;
  terms?: string;
  signatureUrl?: string;
  paymentMethod?: PaymentMethod;
  paymentDetails?: string;
  currency: string;
  companySettings?: CompanySettings;
}

export interface CompanySettings {
  name: string;
  tagline: string;
  logoUrl: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  phone2?: string;
  email: string;
  website: string;
  currency: string;
  defaultVatRate: number;
  defaultTerms: string;
  signatureUrl: string;
  primaryColor: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  bankIban: string;
  mobileMoneyProvider: string;
  mobileMoneyNumber: string;
  mobileMoneyName: string;
}

export interface StatCardData {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: string;
  description?: string;
}

export interface ChartDataPoint {
  month: string;
  revenue: number;
  paid: number;
  pending: number;
}

export interface StatusBreakdown {
  status: InvoiceStatus;
  count: number;
  amount: number;
  color: string;
}

export interface RecentPayment {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status?: 'Validé' | 'En attente' | 'Échoué';
  reference?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type: 'payment' | 'overdue' | 'new_client' | 'system';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  vatRate: number;
  description: string;
  stock?: number | string;
  category?: string;
  type: string;
  sku: string;
  unit: string;
}

export type QuoteStatus = 'Brouillon' | 'Envoyé' | 'Accepté' | 'Refusé' | 'Converti';

export interface Quote {
  id: string;
  number: string;
  title: string;
  date: string;
  issueDate: string;
  validUntil: string;
  clientId: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  status: QuoteStatus;
  notes?: string;
  terms?: string;
  currency: string;
}

export type SubscriptionFrequency = 'Mensuel' | 'Trimestriel' | 'Annuel';

export interface Subscription {
  id: string;
  title: string;
  currency: string;
  clientName: string;
  clientId: string;
  planName: string;
  amount: number;
  frequency: SubscriptionFrequency;
  nextBillingDate: string;
  status: 'Actif' | 'En pause' | 'Annulé';
  paymentMethod: string;
}

export interface ActivityItem {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  type: 'invoice' | 'payment' | 'client' | 'quote' | 'system';
}

