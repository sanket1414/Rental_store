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
                    subCategory: p.sub_category,
                    additionalImages: p.additional_images || [],
                    gifUrl: p.gif_url,
                    model3dUrl: p.model_3d_url,
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
                sub_category: product.subCategory,
                is_active: product.isActive,
                additional_images: product.additionalImages || [],
                gif_url: product.gifUrl,
                model_3d_url: product.model3dUrl
            }]).select().single();

            if (error) {
                console.error('Supabase addProduct error:', error);
                throw new Error(error.message || 'Failed to add product to Supabase');
            }

            if (data) {
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
                    additionalImages: data.additional_images || [],
                    gifUrl: data.gif_url,
                    model3dUrl: data.model_3d_url,
                    createdAt: data.created_at
                };
            }
        } catch (e: any) {
            console.error('Supabase addProduct catch block:', e);
            if (isSupabaseConfigured) throw e;
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
            if (updates.additionalImages !== undefined) mappedUpdates.additional_images = updates.additionalImages;
            if (updates.gifUrl !== undefined) mappedUpdates.gif_url = updates.gifUrl;
            if (updates.model3dUrl !== undefined) mappedUpdates.model_3d_url = updates.model3dUrl;

            const { data, error } = await supabase.from('products').update(mappedUpdates).eq('id', id).select().single();
            if (error) {
                console.error('Supabase updateProduct error:', error);
                throw new Error(error.message || 'Failed to update product in Supabase');
            }

            if (data) {
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
                    additionalImages: data.additional_images || [],
                    gifUrl: data.gif_url,
                    model3dUrl: data.model_3d_url,
                    createdAt: data.created_at
                };
            }
        } catch (e: any) {
            console.error('Supabase updateProduct catch block:', e);
            if (isSupabaseConfigured) throw e;
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

            if (error) {
                console.error('Supabase deleteProduct error:', error);
                throw new Error(error.message || 'Failed to delete product from Supabase');
            }

            return true;
        } catch (e: any) {
            console.error('Supabase deleteProduct catch block:', e);
            if (isSupabaseConfigured) throw e;
            return false;
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
                    quotedPrice: r.quoted_price || 0,
                    advancePaid: r.advance_paid || 0,
                    depositAmount: r.deposit_amount || 0,
                    adminNotes: r.admin_notes || '',
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
            let finalProductId: string | null = null;
            if (request.productId && isUUID(request.productId)) {
                const { data: prodExists } = await supabase.from('products').select('id').eq('id', request.productId).single();
                if (prodExists) {
                    finalProductId = request.productId;
                } else {
                    console.warn(`Product ID ${request.productId} not found in Supabase. Inserting request without foreign key.`);
                }
            }

            const { data, error } = await supabase.from('requests').insert([{
                product_id: finalProductId,
                product_name: request.productName || request.outfitType,
                customer_name: request.customerName,
                phone: request.phone,
                email: request.email,
                event_date: request.eventDate,
                days_required: request.daysRequired,
                outfit_type: request.outfitType,
                message: request.message,
                status: 'pending',
                quoted_price: 0,
                advance_paid: request.advancePaid || 0,
                deposit_amount: request.depositAmount || 0,
                admin_notes: ''
            }]).select().single();

            if (error) {
                console.error('Supabase addRequest error:', error.message, error.details, error.hint);
                throw new Error(error.message || 'Failed to add request to Supabase');
            }

            if (data) {
                try {
                    await upsertCustomer(request.customerName, request.phone, request.email);
                } catch (ce) {
                    console.error('Customer upsert failed during request:', ce);
                }
                return {
                    id: data.id,
                    productId: data.product_id,
                    productName: data.product_name,
                    customerName: data.customer_name,
                    phone: data.phone,
                    email: data.email,
                    eventDate: data.event_date,
                    daysRequired: data.days_required,
                    outfitType: data.outfit_type || 'other',
                    message: data.message || '',
                    status: data.status,
                    quotedPrice: data.quoted_price || 0,
                    advancePaid: data.advance_paid || 0,
                    depositAmount: data.deposit_amount || 0,
                    adminNotes: data.admin_notes || '',
                    createdAt: data.created_at,
                    updatedAt: data.created_at
                } as any;
            }
        } catch (e: any) {
            console.error('Supabase addRequest catch block:', e);
            if (isSupabaseConfigured) throw e;
        }
    }

    console.warn('Falling back to local storage for addRequest (Supabase not configured or failed)');
    if (typeof window !== 'undefined') {
        alert('Warning: Could not save to database. Saving to local browser storage instead. Please check your Supabase connection.');
    }
    const requests = getLocalStore<RentalRequest>('parnika_requests');
    const now = new Date().toISOString();
    const newRequest: RentalRequest = {
        id: generateId(),
        ...request,
        status: 'pending',
        adminNotes: '',
        quotedPrice: 0,
        advancePaid: 0,
        depositAmount: 0,
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
            if (updates.advancePaid !== undefined) mappedUpdates.advance_paid = updates.advancePaid;
            if (updates.depositAmount !== undefined) mappedUpdates.deposit_amount = updates.depositAmount;
            if (updates.adminNotes !== undefined) mappedUpdates.admin_notes = updates.adminNotes;

            const { data, error } = await supabase.from('requests').update(mappedUpdates).eq('id', id).select().single();

            if (error) {
                console.error('Supabase updateRequest error:', error);
                throw new Error(error.message || 'Failed to update request in Supabase');
            }

            if (data) {
                return {
                    id: data.id,
                    productId: data.product_id,
                    productName: data.product_name,
                    customerName: data.customer_name,
                    phone: data.phone,
                    email: data.email,
                    eventDate: data.event_date,
                    daysRequired: data.days_required,
                    outfitType: data.outfit_type || 'other',
                    message: data.message || '',
                    status: data.status,
                    quotedPrice: data.quoted_price || 0,
                    advancePaid: data.advance_paid || 0,
                    depositAmount: data.deposit_amount || 0,
                    adminNotes: data.admin_notes || '',
                    createdAt: data.created_at,
                    updatedAt: data.created_at
                } as any;
            }
        } catch (e: any) {
            console.error('Supabase updateRequest catch block:', e);
            if (isSupabaseConfigured) throw e;
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
            const customerData = {
                name: name,
                phone: phone,
                email: email || null,
            };

            // Try to find an existing customer by phone
            let { data: existingCustomer, error: findError } = await supabase
                .from('customers')
                .select('*')
                .eq('phone', phone)
                .maybeSingle();

            if (findError && findError.code !== 'PGRST116') { // PGRST116 means no rows found
                console.error('Supabase upsertCustomer find error:', findError.message, findError.details, findError.hint);
                throw new Error(findError.message || 'Failed to find customer in Supabase');
            }

            let resultData;
            if (existingCustomer) {
                // Update existing customer
                const { data, error } = await supabase
                    .from('customers')
                    .update(customerData)
                    .eq('id', existingCustomer.id)
                    .select()
                    .single();

                if (error) {
                    console.error('Supabase upsertCustomer update error:', error.message, error.details, error.hint);
                    throw new Error(error.message || 'Failed to update customer in Supabase');
                }
                resultData = data;
            } else {
                // Insert new customer
                const { data, error } = await supabase
                    .from('customers')
                    .insert([{ ...customerData, total_spent: 0, request_count: 0 }])
                    .select()
                    .single();

                if (error) {
                    console.error('Supabase upsertCustomer insert error:', error.message, error.details, error.hint);
                    throw new Error(error.message || 'Failed to insert customer to Supabase');
                }
                resultData = data;
            }

            if (resultData) {
                return {
                    id: resultData.id,
                    name: resultData.name,
                    phone: resultData.phone,
                    email: resultData.email,
                    totalSpent: resultData.total_spent,
                    requestCount: resultData.request_count,
                    createdAt: resultData.created_at
                };
            }
        } catch (e: any) {
            console.error('Supabase upsertCustomer catch block:', e);
            if (isSupabaseConfigured) throw e;
        }
    }

    console.warn('Falling back to local storage for upsertCustomer (Supabase not configured or failed)');
    const customers = getLocalStore<Customer>('parnika_customers');
    const existingCustomer = customers.find(c => c.phone === phone);
    if (existingCustomer) {
        existingCustomer.name = name;
        if (email) existingCustomer.email = email;
        existingCustomer.createdAt = new Date().toISOString(); // Update timestamp
        setLocalStore('parnika_customers', customers);
        return existingCustomer;
    } else {
        const newCustomer: Customer = {
            id: generateId(),
            name,
            phone,
            email: email || '',
            totalSpent: 0,
            requestCount: 0,
            createdAt: new Date().toISOString(),
        };
        customers.push(newCustomer);
        setLocalStore('parnika_customers', customers);
        return newCustomer;
    }
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
                    advancePaid: i.advance_paid || 0,
                    depositAmount: i.deposit_amount || 0,
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
            if (invoice.requestId && isUUID(invoice.requestId)) {
                const { data: existing } = await supabase.from('invoices').select('id').eq('request_id', invoice.requestId).maybeSingle();
                if (existing) {
                    console.error('Duplicate invoice attempt for request:', invoice.requestId);
                    throw new Error('An invoice already exists for this request.');
                }
            }

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
                discount: invoice.discount || 0,
                total: invoice.total,
                advance_paid: invoice.advancePaid || 0,
                deposit_amount: invoice.depositAmount || 0,
                status: 'draft'
            }]).select().single();

            if (error) {
                console.error('Supabase addInvoice error:', error);
                throw new Error(error.message || 'Failed to add invoice to Supabase');
            }

            if (data) {
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
                    advancePaid: data.advance_paid || 0,
                    depositAmount: data.deposit_amount || 0,
                    status: data.status as any,
                    notes: data.notes,
                    createdAt: data.created_at
                };
            }
        } catch (e: any) {
            console.error('Supabase addInvoice catch block:', e);
            if (isSupabaseConfigured) throw e;
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

            if (error) {
                console.error('Supabase updateInvoice error:', error);
                throw new Error(error.message || 'Failed to update invoice in Supabase');
            }

            if (data) {
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
                    advancePaid: data.advance_paid || 0,
                    depositAmount: data.deposit_amount || 0,
                    status: data.status as any,
                    notes: data.notes,
                    createdAt: data.created_at
                };
            }
        } catch (e: any) {
            console.error('Supabase updateInvoice catch block:', e);
            if (isSupabaseConfigured) throw e;
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
