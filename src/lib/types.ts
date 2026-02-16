// ─── Product ───────────────────────────────────────────
export type Category = 'women' | 'men' | 'jewellery' | 'photoshoots';

export interface Product {
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
    discountedPrice?: number;
    category: Category;
    tag: string;
    inventory: number;
    isActive: boolean;
    createdAt: string;
}

// ─── Rental Request ────────────────────────────────────
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface RentalRequest {
    id: string;
    productId: string;
    productName: string;
    customerName: string;
    phone: string;
    email: string;
    eventDate: string;
    daysRequired: number;
    outfitType: string;
    message: string;
    status: RequestStatus;
    adminNotes: string;
    quotedPrice: number;
    createdAt: string;
    updatedAt: string;
}

// ─── Customer ──────────────────────────────────────────
export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    totalSpent: number;
    requestCount: number;
    createdAt: string;
}

// ─── Invoice ───────────────────────────────────────────
export type InvoiceStatus = 'draft' | 'sent' | 'paid';

export interface InvoiceItem {
    productId: string;
    productName: string;
    days: number;
    pricePerDay: number;
    total: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    requestId: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    total: number;
    status: InvoiceStatus;
    notes: string;
    createdAt: string;
}
