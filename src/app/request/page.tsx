'use client';

import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Calendar, Camera, Clock, Home, MessageSquare, Phone, User, CheckCircle, AlertCircle, ArrowRight, Package } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { addRequest, getProductById } from '@/lib/data-store';

type FormData = {
    fullName: string;
    phone: string;
    email: string;
    eventDate: string;
    daysRequired: number;
    outfitType: string;
    message: string;
};

function RequestFormInner() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId') || '';
    const productName = searchParams.get('productName') || '';

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<FormData>({
        defaultValues: { daysRequired: 1 },
    });
    const [isSuccess, setIsSuccess] = useState(false);
    const [linkedProduct, setLinkedProduct] = useState<{ id: string; name: string; price: number; discountedPrice?: number } | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (productId) {
                const product = await getProductById(productId);
                if (product) {
                    setLinkedProduct({ id: product.id, name: product.name, price: product.price, discountedPrice: product.discountedPrice });
                }
            }
        };
        fetchProduct();
    }, [productId]);

    const onSubmit = async (data: FormData) => {
        await addRequest({
            productId: linkedProduct?.id || '',
            productName: linkedProduct?.name || productName || data.outfitType,
            customerName: data.fullName,
            phone: data.phone,
            email: data.email,
            eventDate: data.eventDate,
            daysRequired: data.daysRequired,
            outfitType: data.outfitType,
            message: data.message,
        });
        setIsSuccess(true);
        reset();
        setTimeout(() => setIsSuccess(false), 5000);
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-12 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">
                    <Link href="/" className="hover:text-[#D4AF37] flex items-center gap-1 transition-colors">
                        <Home size={14} /> Home
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Request Rental</span>
                </nav>

                <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                    {/* Header */}
                    <div className="bg-gray-900 dark:bg-[#0a0a0a] px-8 py-10 text-white text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#D4AF37]/10 pattern-dots opacity-20"></div>
                        <h1 className="text-3xl font-bold mb-4 relative z-10">Find Your Perfect Look</h1>
                        <p className="text-gray-300 max-w-lg mx-auto relative z-10">
                            Fill out the details below. Our stylists will check availability and confirm your booking within 24 hours.
                        </p>
                    </div>

                    {/* Linked Product Info */}
                    {linkedProduct && (
                        <div className="mx-8 mt-6 p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl flex items-center gap-3">
                            <Package size={20} className="text-[#D4AF37] shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{linkedProduct.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {linkedProduct.id}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold text-[#D4AF37]">₹{(linkedProduct.discountedPrice || linkedProduct.price).toLocaleString()}</span>
                                {linkedProduct.discountedPrice && <span className="text-xs text-gray-400 line-through ml-2">₹{linkedProduct.price.toLocaleString()}</span>}
                            </div>
                        </div>
                    )}

                    <div className="p-8 md:p-12">
                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                                    <CheckCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Request Sent Successfully!</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">We have received your details. One of our stylists will contact you shortly to discuss your outfit.</p>
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="text-[#D4AF37] font-semibold hover:bg-[#D4AF37] hover:text-black px-6 py-2 rounded-lg transition-colors"
                                >
                                    Send another request
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300">
                                            <User size={16} className="text-gray-400 dark:text-gray-500" /> Full Name
                                        </label>
                                        <input
                                            {...register('fullName', { required: 'Name is required' })}
                                            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${errors.fullName ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10'} outline-none transition-all`}
                                            placeholder="e.g. Ananya Sharma"
                                        />
                                        {errors.fullName && <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.fullName.message}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300">
                                            <Phone size={16} className="text-gray-400 dark:text-gray-500" /> Phone Number
                                        </label>
                                        <input
                                            {...register('phone', { required: 'Phone is required', pattern: { value: /^[0-9+\-\s()]*$/, message: 'Invalid phone number' } })}
                                            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${errors.phone ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10'} outline-none transition-all`}
                                            placeholder="+91 98765 43210"
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.phone.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Event Date */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300">
                                            <Calendar size={16} className="text-gray-400 dark:text-gray-500" /> Event Date
                                        </label>
                                        <input
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            {...register('eventDate', { required: 'Date is required' })}
                                            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white ${errors.eventDate ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10'} outline-none transition-all [color-scheme:dark]`}
                                        />
                                        {errors.eventDate && <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.eventDate.message}</p>}
                                    </div>

                                    {/* Days Required */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300">
                                            <Clock size={16} className="text-gray-400 dark:text-gray-500" /> Days Required
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            {...register('daysRequired', { required: 'Days is required', min: { value: 1, message: 'Minimum 1 day' } })}
                                            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${errors.daysRequired ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10'} outline-none transition-all`}
                                            placeholder="e.g. 3"
                                        />
                                        {errors.daysRequired && <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.daysRequired.message}</p>}
                                    </div>
                                </div>

                                {/* Outfit Type — only show if no linked product */}
                                {!linkedProduct && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300">
                                            <Camera size={16} className="text-gray-400 dark:text-gray-500" /> Outfit Type
                                        </label>
                                        <select
                                            {...register('outfitType', { required: !linkedProduct ? 'Please select an outfit type' : false })}
                                            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white ${errors.outfitType ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10'} outline-none transition-all`}
                                        >
                                            <option value="" className="dark:bg-[#1a1a1a]">Select Category...</option>
                                            <option value="Bridal Lehenga" className="dark:bg-[#1a1a1a]">Bridal Lehenga</option>
                                            <option value="Heavy Gown" className="dark:bg-[#1a1a1a]">Heavy Gown</option>
                                            <option value="Sherwani" className="dark:bg-[#1a1a1a]">Wedding Sherwani</option>
                                            <option value="Indo Western" className="dark:bg-[#1a1a1a]">Indo Western</option>
                                            <option value="Pre Wedding" className="dark:bg-[#1a1a1a]">Pre-Wedding Shoot</option>
                                            <option value="Jewellery" className="dark:bg-[#1a1a1a]">Jewellery Rental</option>
                                            <option value="Other" className="dark:bg-[#1a1a1a]">Other</option>
                                        </select>
                                        {errors.outfitType && <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.outfitType.message}</p>}
                                    </div>
                                )}

                                {/* Message */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300">
                                        <MessageSquare size={16} className="text-gray-400 dark:text-gray-500" /> Specific Requirements
                                    </label>
                                    <textarea
                                        {...register('message')}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all resize-none"
                                        placeholder="Describe specific colors, styles, or sizing requirements..."
                                    ></textarea>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#D4AF37] text-black py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-[#D4AF37]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>Processing...</>
                                        ) : (
                                            <>Check Availability <ArrowRight size={20} /></>
                                        )}
                                    </button>
                                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4 transition-colors duration-300">
                                        By submitting, you agree to our privacy policy. We will contact you via phone or WhatsApp.
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 mt-8 opacity-70">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-white dark:bg-[#121212] rounded-full shadow-sm flex items-center justify-center mb-2 text-[#D4AF37] border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Verified Quality</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-white dark:bg-[#121212] rounded-full shadow-sm flex items-center justify-center mb-2 text-[#D4AF37] border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                            <User size={20} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Personal Stylist</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-white dark:bg-[#121212] rounded-full shadow-sm flex items-center justify-center mb-2 text-[#D4AF37] border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                            <Calendar size={20} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Flexible Dates</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RequestPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <RequestFormInner />
        </Suspense>
    );
}
