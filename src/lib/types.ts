// ─── Product ───────────────────────────────────────────
export type Category = 'women' | 'men' | 'jewellery' | 'photoshoots';

export interface Product {
    id: string;
    name: string;
    description: string;
    image: string;
    additionalImages?: string[];
    gifUrl?: string;
    model3dUrl?: string;
    price: number;
    discountedPrice?: number;
    category: Category;
    tag: string;
    inventory: number;
    subCategory?: string;
    isActive: boolean;
    createdAt: string;
}

// ─── Rental Request ────────────────────────────────────
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface RentalRequest {
    id: string;
    productId: string | null;
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
    advancePaid: number;
    depositAmount: number;
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
    productId: string | null;
    productName: string;
    days: number;
    pricePerDay: number;
    total: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    requestId: string | null;
    customerId: string | null;
    customerName: string;
    customerPhone: string;
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    total: number;
    advancePaid: number;
    depositAmount: number;
    status: InvoiceStatus;
    notes: string;
    createdAt: string;
}
