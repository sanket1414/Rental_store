import { Product, RentalRequest, Customer, Invoice, Category } from './types';
import { seedProducts } from './seed-data';
import { supabase, isSupabaseConfigured } from './supabase';

// ─── Helpers ───────────────────────────────────────────
function isUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function getLocalStore<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
}

function setLocalStore<T>(key: string, data: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
}

// ─── Initialization ────────────────────────────────────
export async function initializeStore(): Promise<void> {
    if (typeof window === 'undefined') return;

    if (isSupabaseConfigured && supabase) {
        try {
            const { data: existingProducts } = await supabase.from('products').select('id').limit(1);
            if (!existingProducts || existingProducts.length === 0) {
                const productsToInsert = seedProducts.map((p) => ({
                    name: p.name,
                    description: p.description,
                    image_url: p.image,
                    price: p.price,
                    discounted_price: p.discountedPrice,
                    category: p.category,
                    tag: p.tag,
                    inventory: p.inventory,
                    is_active: p.isActive,
                }));
                await supabase.from('products').insert(productsToInsert);
            }
        } catch (e) {
            console.error('Supabase init error:', e);
        }
    }

    if (!localStorage.getItem('parnika_products')) {
        const products: Product[] = seedProducts.map((p) => ({
            ...p,
            id: generateId(),
            createdAt: new Date().toISOString(),
        }));
        setLocalStore('parnika_products', products);
    }
}

// ─── Products ──────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
        try {
            const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (!error && data) {
                return data.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    image: p.image_url,
                    price: p.price,
                    discountedPrice: p.discounted_price,
                    category: p.category as Category,
                    tag: p.tag,
                    inventory: p.inventory,
                    isActive: p.is_active,
                    createdAt: p.created_at
                }));
            }
        } catch (e) {
            console.error('Supabase fetch error:', e);
        }
    }
    return getLocalStore<Product>('parnika_products');
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
    const products = await getProducts();
    return products.filter((p) => p.category === category && p.isActive);
}

export async function getProductById(id: string): Promise<Product | undefined> {
    const products = await getProducts();
    return products.find((p) => p.id === id);
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
        try {
            const { data, error } = await supabase.from('products').insert([{
                name: product.name,
                description: product.description,
                image_url: product.image,
                price: product.price,
                discounted_price: product.discountedPrice,
                category: product.category,
                tag: product.tag,
                inventory: product.inventory,
                is_active: product.isActive
            }]).select().single();

            if (!error && data) {
                return {
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    image: data.image_url,
                    price: data.price,
                    discountedPrice: data.discounted_price,
                    category: data.category as Category,
                    tag: data.tag,
                    inventory: data.inventory,
                    isActive: data.is_active,
                    createdAt: data.created_at
                };
            }
        } catch (e) {
            console.error('Supabase addProduct error:', e);
        }
    }

    const products = getLocalStore<Product>('parnika_products');
    const newProduct: Product = {
        ...product,
        id: generateId(),
        createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    setLocalStore('parnika_products', products);
    return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    if (isSupabaseConfigured && supabase && isUUID(id)) {
        try {
            const mappedUpdates: any = {};
            if (updates.name !== undefined) mappedUpdates.name = updates.name;
            if (updates.description !== undefined) mappedUpdates.description = updates.description;
            if (updates.image !== undefined) mappedUpdates.image_url = updates.image;
            if (updates.price !== undefined) mappedUpdates.price = updates.price;
            if (updates.discountedPrice !== undefined) mappedUpdates.discounted_price = updates.discountedPrice;
            if (updates.category !== undefined) mappedUpdates.category = updates.category;
            if (updates.tag !== undefined) mappedUpdates.tag = updates.tag;
            if (updates.inventory !== undefined) mappedUpdates.inventory = updates.inventory;
            if (updates.isActive !== undefined) mappedUpdates.is_active = updates.isActive;

            const { data, error } = await supabase.from('products').update(mappedUpdates).eq('id', id).select().single();
            if (!error && data) {
                return {
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    image: data.image_url,
                    price: data.price,
                    discountedPrice: data.discounted_price,
                    category: data.category as Category,
                    tag: data.tag,
                    inventory: data.inventory,
                    isActive: data.is_active,
                    createdAt: data.created_at
                };
            }
        } catch (e) {
            console.error('Supabase updateProduct error:', e);
        }
    }

    const products = getLocalStore<Product>('parnika_products');
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates };
    setLocalStore('parnika_products', products);
    return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase && isUUID(id)) {
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (!error) return true;
        } catch (e) {
            console.error('Supabase deleteProduct error:', e);
        }
    }

    const products = getLocalStore<Product>('parnika_products');
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;
    setLocalStore('parnika_products', filtered);
    return true;
}

// ─── Requests ──────────────────────────────────────────
export async function getRequests(): Promise<RentalRequest[]> {
    if (isSupabaseConfigured && supabase) {
        try {
            const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
            if (!error && data) {
                return data.map(r => ({
                    id: r.id,
                    productId: r.product_id,
                    productName: r.product_name,
                    customerName: r.customer_name,
                    phone: r.phone,
                    email: r.email,
                    eventDate: r.event_date,
                    daysRequired: r.days_required,
                    outfitType: r.outfit_type || 'other',
                    message: r.message || '',
                    status: r.status,
                    quotedPrice: r.quoted_price,
                    adminNotes: r.admin_notes,
                    createdAt: r.created_at,
                    updatedAt: r.created_at
                }));
            }
        } catch (e) {
            console.error('Supabase getRequests error:', e);
        }
    }
    return getLocalStore<RentalRequest>('parnika_requests');
}

export async function addRequest(request: Omit<RentalRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'adminNotes' | 'quotedPrice'>): Promise<RentalRequest> {
    if (isSupabaseConfigured && supabase) {
        try {
            const { data, error } = await supabase.from('requests').insert([{
                product_id: (request.productId && isUUID(request.productId)) ? request.productId : null,
                product_name: request.productName,
                customer_name: request.customerName,
                phone: request.phone,
                email: request.email,
                event_date: request.eventDate,
                days_required: request.daysRequired,
                outfit_type: request.outfitType,
                message: request.message,
                status: 'pending'
            }]).select().single();

            if (!error && data) {
                await upsertCustomer(request.customerName, request.phone, request.email);
                return {
                    id: data.id,
                    productId: data.product_id,
                    productName: data.product_name,
                    customerName: data.customer_name,
                    phone: data.phone,
                    email: data.email,
                    eventDate: data.event_date,
                    daysRequired: data.days_required,
                    outfitType: data.outfit_type,
                    message: data.message,
                    status: data.status,
                    quotedPrice: data.quoted_price,
                    adminNotes: data.admin_notes,
                    createdAt: data.created_at,
                    updatedAt: data.created_at
                };
            }
        } catch (e) {
            console.error('Supabase addRequest error:', e);
        }
    }

    const requests = getLocalStore<RentalRequest>('parnika_requests');
    const now = new Date().toISOString();
    const newRequest: RentalRequest = {
        ...request,
        id: generateId(),
        status: 'pending',
        adminNotes: '',
        quotedPrice: 0,
        createdAt: now,
        updatedAt: now,
    };
    requests.push(newRequest);
    setLocalStore('parnika_requests', requests);
    await upsertCustomer(request.customerName, request.phone, request.email);
    return newRequest;
}

export async function updateRequest(id: string, updates: Partial<RentalRequest>): Promise<RentalRequest | null> {
    if (isSupabaseConfigured && supabase && isUUID(id)) {
        try {
            const mappedUpdates: any = {};
            if (updates.status !== undefined) mappedUpdates.status = updates.status;
            if (updates.quotedPrice !== undefined) mappedUpdates.quoted_price = updates.quotedPrice;
            if (updates.adminNotes !== undefined) mappedUpdates.admin_notes = updates.adminNotes;

            const { data, error } = await supabase.from('requests').update(mappedUpdates).eq('id', id).select().single();
            if (!error && data) {
                return {
                    id: data.id,
                    productId: data.product_id,
                    productName: data.product_name,
                    customerName: data.customer_name,
                    phone: data.phone,
                    email: data.email,
                    eventDate: data.event_date,
                    daysRequired: data.days_required,
                    outfitType: data.outfit_type,
                    message: data.message,
                    status: data.status,
                    quotedPrice: data.quoted_price,
                    adminNotes: data.admin_notes,
                    createdAt: data.created_at,
                    updatedAt: data.created_at
                };
            }
        } catch (e) {
            console.error('Supabase updateRequest error:', e);
        }
    }

    const requests = getLocalStore<RentalRequest>('parnika_requests');
    const index = requests.findIndex((r) => r.id === id);
    if (index === -1) return null;
    requests[index] = { ...requests[index], ...updates, updatedAt: new Date().toISOString() };
    setLocalStore('parnika_requests', requests);
    return requests[index];
}

// ─── Customers ─────────────────────────────────────────
export async function getCustomers(): Promise<Customer[]> {
    if (isSupabaseConfigured && supabase) {
        try {
            const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
            if (!error && data) {
                return data.map(c => ({
                    id: c.id,
                    name: c.name,
                    phone: c.phone,
                    email: c.email,
                    totalSpent: c.total_spent,
                    requestCount: 0,
                    createdAt: c.created_at
                }));
            }
        } catch (e) {
            console.error('Supabase getCustomers error:', e);
        }
    }
    return getLocalStore<Customer>('parnika_customers');
}

export async function upsertCustomer(name: string, phone: string, email?: string): Promise<Customer> {
    if (isSupabaseConfigured && supabase) {
        try {
            const { data: existing } = await supabase.from('customers').select('*').eq('phone', phone).single();
            if (existing) {
                const { data: updated } = await supabase.from('customers').update({ name, email: email || existing.email }).eq('id', existing.id).select().single();
                return {
                    id: updated.id,
                    name: updated.name,
                    phone: updated.phone,
                    email: updated.email,
                    totalSpent: updated.total_spent,
                    requestCount: 0,
                    createdAt: updated.created_at
                };
            } else {
                const { data: created } = await supabase.from('customers').insert([{ name, phone, email }]).select().single();
                return {
                    id: created.id,
                    name: created.name,
                    phone: created.phone,
                    email: created.email,
                    totalSpent: created.total_spent,
                    requestCount: 0,
                    createdAt: created.created_at
                };
            }
        } catch (e) {
            console.error('Supabase upsertCustomer error:', e);
        }
    }

    const customers = getLocalStore<Customer>('parnika_customers');
    const existing = customers.find((c) => c.phone === phone);
    if (existing) {
        existing.requestCount += 1;
        existing.name = name;
        if (email) existing.email = email;
        setLocalStore('parnika_customers', customers);
        return existing;
    }
    const newCustomer: Customer = {
        id: generateId(),
        name,
        phone,
        email,
        totalSpent: 0,
        requestCount: 1,
        createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    setLocalStore('parnika_customers', customers);
    return newCustomer;
}

// ─── Invoices ──────────────────────────────────────────
export async function getInvoices(): Promise<Invoice[]> {
    if (isSupabaseConfigured && supabase) {
        try {
            const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
            if (!error && data) {
                return data.map(i => ({
                    id: i.id,
                    invoiceNumber: i.invoice_number,
                    requestId: i.request_id,
                    customerId: i.customer_id,
                    customerName: i.customer_name,
                    customerPhone: i.customer_phone,
                    items: i.items,
                    subtotal: i.subtotal,
                    discount: i.discount,
                    total: i.total,
                    status: i.status as any,
                    notes: i.notes,
                    createdAt: i.created_at
                }));
            }
        } catch (e) {
            console.error('Supabase getInvoices error:', e);
        }
    }
    return getLocalStore<Invoice>('parnika_invoices');
}

export async function addInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>): Promise<Invoice> {
    if (isSupabaseConfigured && supabase) {
        try {
            const { data: allInvoices } = await supabase.from('invoices').select('id');
            const nextNum = (allInvoices?.length || 0) + 1;
            const invoiceNumber = `INV-${String(nextNum).padStart(4, '0')}`;

            const { data, error } = await supabase.from('invoices').insert([{
                invoice_number: invoiceNumber,
                request_id: (invoice.requestId && isUUID(invoice.requestId)) ? invoice.requestId : null,
                customer_id: (invoice.customerId && isUUID(invoice.customerId)) ? invoice.customerId : null,
                customer_name: invoice.customerName,
                customer_phone: invoice.customerPhone,
                items: invoice.items,
                subtotal: invoice.subtotal || invoice.total,
                total: invoice.total,
                status: 'draft'
            }]).select().single();

            if (!error && data) {
                return {
                    id: data.id,
                    invoiceNumber: data.invoice_number,
                    requestId: data.request_id,
                    customerId: data.customer_id,
                    customerName: data.customer_name,
                    customerPhone: data.customer_phone,
                    items: data.items,
                    subtotal: data.subtotal,
                    discount: data.discount,
                    total: data.total,
                    status: data.status as any,
                    notes: data.notes,
                    createdAt: data.created_at
                };
            }
        } catch (e) {
            console.error('Supabase addInvoice error:', e);
        }
    }

    const invoices = getLocalStore<Invoice>('parnika_invoices');
    const invoiceNumber = `INV-${String(invoices.length + 1).padStart(4, '0')}`;
    const newInvoice: Invoice = {
        ...invoice,
        id: generateId(),
        invoiceNumber,
        createdAt: new Date().toISOString(),
    };
    invoices.push(newInvoice);
    setLocalStore('parnika_invoices', invoices);
    return newInvoice;
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    if (isSupabaseConfigured && supabase && isUUID(id)) {
        try {
            const mappedUpdates: any = {};
            if (updates.status !== undefined) mappedUpdates.status = updates.status;

            const { data, error } = await supabase.from('invoices').update(mappedUpdates).eq('id', id).select().single();
            if (!error && data) {
                return {
                    id: data.id,
                    invoiceNumber: data.invoice_number,
                    requestId: data.request_id,
                    customerId: data.customer_id,
                    customerName: data.customer_name,
                    customerPhone: data.customer_phone,
                    items: data.items,
                    subtotal: data.subtotal,
                    discount: data.discount,
                    total: data.total,
                    status: data.status as any,
                    notes: data.notes,
                    createdAt: data.created_at
                };
            }
        } catch (e) {
            console.error('Supabase updateInvoice error:', e);
        }
    }

    const invoices = getLocalStore<Invoice>('parnika_invoices');
    const index = invoices.findIndex((i) => i.id === id);
    if (index === -1) return null;
    invoices[index] = { ...invoices[index], ...updates };
    setLocalStore('parnika_invoices', invoices);
    return invoices[index];
}

// ─── Admin Auth ────────────────────────────────────────
const DEFAULT_PASSWORD = 'parnika2026';

export function adminLogin(password: string): boolean {
    const correctPassword = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
    if (password === correctPassword) {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('parnika_admin', 'true');
        }
        return true;
    }
    return false;
}

export function isAdminLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('parnika_admin') === 'true';
}

export function adminLogout(): void {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('parnika_admin');
    }
}
