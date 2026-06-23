import React, { useState, useEffect, useRef } from 'react';
import { translations, Language } from './translations';
import { androidProjectFiles } from './androidCode';
import { Product, CartItem, Invoice, AndroidFile } from './types';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ShoppingCart,
  History,
  Database,
  Copy,
  Check,
  Download,
  Moon,
  Sun,
  Printer,
  ChevronLeft,
  ChevronRight,
  Package,
  FileCode,
  Sparkles,
  ArrowRight,
  Upload,
  Minimize2,
  RefreshCw,
  Home
} from 'lucide-react';

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Water 330ml', arabicName: 'مياه ٣٣٠ مل', price: 1.0, category: 'Beverages' },
  { id: 'p2', name: 'Pepsi Cola Can', arabicName: 'بيبسي علبة', price: 3.0, category: 'Beverages' },
  { id: 'p3', name: 'Local Bread Pack', arabicName: 'كيس خبز مفرود', price: 2.0, category: 'Bakery' },
  { id: 'p4', name: 'Fresh Milk 1L', arabicName: 'حليب طازج ١ لتر', price: 5.0, category: 'Dairy' },
  { id: 'p5', name: 'Yogurt Small', arabicName: 'زبادي صغير', price: 2.0, category: 'Dairy' },
  { id: 'p6', name: 'Potato Chips', arabicName: 'بطاطس شيبس', price: 1.5, category: 'Snacks' },
  { id: 'p7', name: 'Orange Juice', arabicName: 'عصير برتقال', price: 2.5, category: 'Beverages' }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-384912',
    dateTime: '2026-06-21 16:34',
    items: [
      {
        product: { id: 'p1', name: 'Water 330ml', arabicName: 'مياه ٣٣٠ مل', price: 1.0, category: 'Beverages' },
        quantity: 5,
        totalPrice: 5.0
      },
      {
        product: { id: 'p3', name: 'Local Bread Pack', arabicName: 'كيس خبز مفرود', price: 2.0, category: 'Bakery' },
        quantity: 2,
        totalPrice: 4.0
      }
    ],
    subtotal: 9.0,
    discount: 1.0,
    grandTotal: 8.0,
    cashReceived: 10.0,
    changeReturn: 2.0
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-902124',
    dateTime: '2026-06-22 08:15',
    items: [
      {
        product: { id: 'p2', name: 'Pepsi Cola Can', arabicName: 'بيبسي علبة', price: 3.0, category: 'Beverages' },
        quantity: 3,
        totalPrice: 9.0
      },
      {
        product: { id: 'p4', name: 'Fresh Milk 1L', arabicName: 'حليب طازج ١ لتر', price: 5.0, category: 'Dairy' },
        quantity: 1,
        totalPrice: 5.0
      }
    ],
    subtotal: 14.0,
    discount: 0.0,
    grandTotal: 14.0,
    cashReceived: 20.0,
    changeReturn: 6.0
  }
];

export default function App() {
  // Localization & Theme Preferences
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('jiku_lang');
    return (saved as Language) || 'en';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('jiku_dark') === 'true';
  });

  // Main navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'newSale' | 'products' | 'history' | 'androidExporter'>('dashboard');

  // Product Database
  const [products, setProducts] = useState<Product[]>([]);
  
  // Sales Database
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Cart operations (New Sale)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountVal, setDiscountVal] = useState<string>('');
  const [cashVal, setCashVal] = useState<string>('');

  // Auto-complete suggestions state for search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inputQuantity, setInputQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<string>('');

  // Database Management Modals and forms
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodFormNameEn, setProdFormNameEn] = useState<string>('');
  const [prodFormNameAr, setProdFormNameAr] = useState<string>('');
  const [prodFormPrice, setProdFormPrice] = useState<string>('');
  const [prodFormCategory, setProdFormCategory] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Invoice view / print modal
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [historyDateFilter, setHistoryDateFilter] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Android project exporter state
  const [selectedAndroidFile, setSelectedAndroidFile] = useState<AndroidFile>(androidProjectFiles[2]); // MainActivity is default
  const [fileSearchQuery, setFileSearchQuery] = useState<string>('');
  const [copiedFileIndex, setCopiedFileIndex] = useState<number | null>(null);

  // Inital load triggers
  useEffect(() => {
    // Products
    const savedProds = localStorage.getItem('jiku_products');
    if (savedProds) {
      try {
        setProducts(JSON.parse(savedProds));
      } catch (e) {
        setProducts(INITIAL_PRODUCTS);
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('jiku_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    // Invoices
    const savedInvoices = localStorage.getItem('jiku_invoices');
    if (savedInvoices) {
      try {
        setInvoices(JSON.parse(savedInvoices));
      } catch (e) {
        setInvoices(INITIAL_INVOICES);
      }
    } else {
      setInvoices(INITIAL_INVOICES);
      localStorage.setItem('jiku_invoices', JSON.stringify(INITIAL_INVOICES));
    }
  }, []);

  // Save changes triggers
  const saveProductsToDb = (newProds: Product[]) => {
    setProducts(newProds);
    localStorage.setItem('jiku_products', JSON.stringify(newProds));
  };

  const saveInvoicesToDb = (newInvs: Invoice[]) => {
    setInvoices(newInvs);
    localStorage.setItem('jiku_invoices', JSON.stringify(newInvs));
  };

  // Lang & Theme switchers
  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ar' : 'en';
    setLang(nextLang);
    localStorage.setItem('jiku_lang', nextLang);
  };

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('jiku_dark', String(nextDark));
  };

  // Helper translations lookup
  const t = translations[lang];

  // Auto-notification dispatcher
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // DB Backup & Restore
  const handleBackup = () => {
    const dataStr = JSON.stringify({ products, invoices }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `jiku_cash_memo_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    triggerNotification(t.backupSuccess);
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (files && files.length > 0) {
      fileReader.readAsText(files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.invoices)) {
            saveProductsToDb(parsed.products);
            saveInvoicesToDb(parsed.invoices);
            triggerNotification(t.restoreSuccess);
          } else {
            alert(t.restoreError);
          }
        } catch (err) {
          alert(t.restoreError);
        }
      };
    }
  };

  // Product Operations
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProdFormNameEn('');
    setProdFormNameAr('');
    setProdFormPrice('');
    setProdFormCategory('');
    setProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProdFormNameEn(product.name);
    setProdFormNameAr(product.arabicName);
    setProdFormPrice(product.price.toString());
    setProdFormCategory(product.category);
    setProductModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm(lang === 'en' ? 'Are you sure you want to delete this product?' : 'هل أنت متأكد من حذف هذا المنتج؟')) {
      const updated = products.filter(p => p.id !== productId);
      saveProductsToDb(updated);
      triggerNotification(t.productDeleted);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormNameEn || !prodFormPrice) {
      alert(lang === 'en' ? 'Please fill in the product English name and price.' : 'يرجى إدخال اسم المنتج بالإنجليزي وسعره.');
      return;
    }

    const priceNum = parseFloat(prodFormPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert(lang === 'en' ? 'Please specify a positive price.' : 'يرجى تحديد سعر بيع صحيح.');
      return;
    }

    if (editingProduct) {
      // Edit
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: prodFormNameEn,
            arabicName: prodFormNameAr || prodFormNameEn,
            price: priceNum,
            category: prodFormCategory || 'General'
          };
        }
        return p;
      });
      saveProductsToDb(updated);
      triggerNotification(t.productUpdated);
    } else {
      // Add
      const newProd: Product = {
        id: 'p-' + Date.now(),
        name: prodFormNameEn,
        arabicName: prodFormNameAr || prodFormNameEn,
        price: priceNum,
        category: prodFormCategory || 'General'
      };
      saveProductsToDb([...products, newProd]);
      triggerNotification(t.productAdded);
    }
    setProductModalOpen(false);
  };

  // Sale Checkout Operations
  // Selection suggestions based on live search
  const filteredSuggestions = products.filter(p => {
    if (!searchTerm) return false;
    const s = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.arabicName.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s)
    );
  });

  const selectProductFromSearch = (product: Product) => {
    setSelectedProduct(product);
    setCustomPrice(product.price.toString());
    setInputQuantity(1);
    setSearchTerm(''); // Clear text
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const priceToCharge = parseFloat(customPrice);
    if (isNaN(priceToCharge) || priceToCharge <= 0) {
      alert(lang === 'en' ? 'Invalid price' : 'سعر غير صالح');
      return;
    }

    // Check if item already exists in active cart
    const existingIndex = cart.findIndex(item => item.product.id === selectedProduct.id);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += inputQuantity;
      updatedCart[existingIndex].totalPrice = updatedCart[existingIndex].quantity * priceToCharge;
      setCart(updatedCart);
    } else {
      const newItem: CartItem = {
        product: { ...selectedProduct, price: priceToCharge },
        quantity: inputQuantity,
        totalPrice: inputQuantity * priceToCharge
      };
      setCart([...cart, newItem]);
    }

    // Clean selection
    setSelectedProduct(null);
    setCustomPrice('');
    setInputQuantity(1);
  };

  const handleQuickAdd = (product: Product) => {
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      updatedCart[existingIndex].totalPrice = updatedCart[existingIndex].quantity * product.price;
      setCart(updatedCart);
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        totalPrice: product.price
      };
      setCart([...cart, newItem]);
    }
  };

  const removeCartItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
  };

  const updateCartItemQty = (index: number, delta: number) => {
    const updated = [...cart];
    const item = updated[index];
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeCartItem(index);
    } else {
      item.quantity = newQty;
      item.totalPrice = newQty * item.product.price;
      setCart(updated);
    }
  };

  // Bill Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const parsedDiscount = parseFloat(discountVal) || 0;
  const cartGrandTotal = Math.max(0, cartSubtotal - parsedDiscount);
  const parsedReceived = parseFloat(cashVal) || 0;
  const changeReturn = Math.max(0, parsedReceived - cartGrandTotal);

  const triggerCheckout = () => {
    if (cart.length === 0) {
      alert(t.emptyCart);
      return;
    }

    const currentTimestamp = new Date();
    const formattedDate = currentTimestamp.getFullYear() + '-' +
      String(currentTimestamp.getMonth() + 1).padStart(2, '0') + '-' +
      String(currentTimestamp.getDate()).padStart(2, '0') + ' ' +
      String(currentTimestamp.getHours()).padStart(2, '0') + ':' +
      String(currentTimestamp.getMinutes()).padStart(2, '0');

    const receiptNo = 'INV-' + Math.floor(100000 + Math.random() * 900000);

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNo: receiptNo,
      dateTime: formattedDate,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: parsedDiscount,
      grandTotal: cartGrandTotal,
      cashReceived: parsedReceived || cartGrandTotal,
      changeReturn: parsedReceived ? changeReturn : 0
    };

    const updatedInvoices = [newInvoice, ...invoices];
    saveInvoicesToDb(updatedInvoices);
    
    // Select this invoice and open receipt modal
    setViewInvoice(newInvoice);

    // Reset checkout sheet states
    setCart([]);
    setDiscountVal('');
    setCashVal('');
    triggerNotification(t.successSaved);
  };

  // Print support
  const handlePrint = () => {
    window.print();
  };

  // Copy Code to Clipboard helper
  const copyToClipboard = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedFileIndex(index);
    setTimeout(() => setCopiedFileIndex(null), 2500);
  };

  // Filter Android code list based on query
  const filteredAndroidFiles = androidProjectFiles.filter(f => 
    f.name.toLowerCase().includes(fileSearchQuery.toLowerCase()) ||
    f.path.toLowerCase().includes(fileSearchQuery.toLowerCase())
  );

  // Stats Counters
  // Count sales matching selected history period
  const totalInvoicesToday = invoices.length;
  const totalSalesRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-200 ${darkMode ? 'bg-zinc-950 text-emerald-50' : 'bg-slate-50 text-slate-900'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* GLOBAL HEAD PRINT STYLING */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #print-receipt-section, #print-receipt-section * {
            visibility: visible;
          }
          #print-receipt-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 80mm;
            padding: 8px;
            font-size: 11px;
            line-height: 1.2;
            font-family: 'Courier New', Courier, monospace;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* DESKTOP SIDEBAR NAVIGATION (NO-PRINT) */}
      <aside className="hidden md:flex w-24 bg-emerald-900 flex-col items-center py-8 space-y-10 border-r border-emerald-800 flex-shrink-0 no-print">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg mb-4 hover:rotate-3 transition-transform">
          <span className="text-emerald-900 font-black text-2xl">J</span>
        </div>
        
        <nav className="flex flex-col space-y-8">
          {/* Dashboard Tab */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex flex-col items-center group cursor-pointer focus:outline-none border-none bg-transparent"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-white text-emerald-900 shadow-md' : 'bg-emerald-800 text-emerald-100 hover:text-white'}`}>
              <Home className="w-6 h-6" />
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-semibold mt-1 transition-colors ${activeTab === 'dashboard' ? 'text-white' : 'text-emerald-100/70 group-hover:text-emerald-100'}`}>
              {lang === 'en' ? 'Home' : 'الرئيسية'}
            </span>
          </button>

          {/* New Sale Tab */}
          <button
            onClick={() => setActiveTab('newSale')}
            className="flex flex-col items-center group cursor-pointer focus:outline-none border-none bg-transparent"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${activeTab === 'newSale' ? 'bg-white text-emerald-900 shadow-md' : 'bg-emerald-800 text-emerald-100 hover:text-white'}`}>
              <ShoppingCart className="w-6 h-6" />
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-semibold mt-1 transition-colors ${activeTab === 'newSale' ? 'text-white' : 'text-emerald-100/70 group-hover:text-emerald-100'}`}>
              {lang === 'en' ? 'Sale' : 'البيع'}
            </span>
          </button>

          {/* Product Directory Tab */}
          <button
            onClick={() => setActiveTab('products')}
            className="flex flex-col items-center group cursor-pointer focus:outline-none border-none bg-transparent"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${activeTab === 'products' ? 'bg-white text-emerald-900 shadow-md' : 'bg-emerald-800 text-emerald-100 hover:text-white'}`}>
              <Package className="w-6 h-6" />
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-semibold mt-1 transition-colors ${activeTab === 'products' ? 'text-white' : 'text-emerald-100/70 group-hover:text-emerald-100'}`}>
              {lang === 'en' ? 'Stock' : 'الأصناف'}
            </span>
          </button>

          {/* Sales History Tab */}
          <button
            onClick={() => setActiveTab('history')}
            className="flex flex-col items-center group cursor-pointer focus:outline-none border-none bg-transparent"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${activeTab === 'history' ? 'bg-white text-emerald-900 shadow-md' : 'bg-emerald-800 text-emerald-100 hover:text-white'}`}>
              <History className="w-6 h-6" />
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-semibold mt-1 transition-colors ${activeTab === 'history' ? 'text-white' : 'text-emerald-100/70 group-hover:text-emerald-100'}`}>
              {lang === 'en' ? 'Logs' : 'السجل'}
            </span>
          </button>

          {/* Exporter Tab */}
          <button
            onClick={() => setActiveTab('androidExporter')}
            className="flex flex-col items-center group cursor-pointer focus:outline-none border-none bg-transparent"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${activeTab === 'androidExporter' ? 'bg-white text-emerald-900 shadow-md' : 'bg-emerald-800 text-emerald-100 hover:text-white'}`}>
              <FileCode className="w-6 h-6" />
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-semibold mt-1 transition-colors ${activeTab === 'androidExporter' ? 'text-white' : 'text-emerald-100/70 group-hover:text-emerald-100'}`}>
              {lang === 'en' ? 'Code' : 'الكود'}
            </span>
          </button>
        </nav>

        {/* Dynamic Theme & Lang trigger at left-sidebar footer */}
        <div className="mt-auto flex flex-col items-center space-y-4">
          <button
            onClick={toggleLanguage}
            title="Switch Language"
            className="w-10 h-10 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-200 font-bold text-xs cursor-pointer flex items-center justify-center active:scale-95 transition"
          >
            {lang === 'en' ? 'عرب' : 'EN'}
          </button>
          <button
            onClick={toggleDarkMode}
            title="Toggle theme mode"
            className="w-10 h-10 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-200 cursor-pointer flex items-center justify-center active:scale-95 transition"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* RIGHT CHANNELS WORKSPACE WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* MOBILE TOPBAR HEADER SECTION (NO-PRINT) */}
        <header className="sticky top-0 z-30 border-b border-emerald-800/15 bg-emerald-800 text-white backdrop-blur-md no-print px-4 py-3 shadow-md md:hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 p-2 rounded-xl text-emerald-100 ring-1 ring-white/10">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight font-sans">Jiku Cash Memo</h1>
                <p className="text-[10px] text-emerald-200 font-medium opacity-90">{t.tagline}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                id="btn-lang-toggle"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-900 border border-emerald-700/50 text-xs font-semibold cursor-pointer transition"
              >
                <span className="uppercase text-emerald-100">{lang === 'en' ? 'العربية' : 'English'}</span>
              </button>

              <button
                onClick={toggleDarkMode}
                id="btn-theme-toggle"
                className="p-2 rounded-lg bg-emerald-900 border border-emerald-700/50 text-emerald-200 cursor-pointer transition"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div id="toast-notif" className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg border border-emerald-500 flex items-center gap-2 transition duration-300 transform animate-bounce">
            <Check className="w-4 h-4" />
            <span className="text-sm font-sans">{notification}</span>
          </div>
        )}

        {/* MAIN CONTAINER */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 no-print">
          
          {/* TOP STATUS ROW & BACK TO HOME ROW */}
          <div className="mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {activeTab !== 'dashboard' && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  id="btn-back-dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${darkMode ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-emerald-400' : 'bg-white hover:bg-slate-100 border-slate-200 text-emerald-800'}`}
                >
                  {lang === 'en' ? <ChevronLeft className="w-4 h-4 animate-pulse" /> : <ChevronRight className="w-4 h-4 animate-pulse" />}
                  <span>{t.backToHome}</span>
                </button>
              )}
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-emerald-400 uppercase">
                  {activeTab === 'dashboard' && (lang === 'en' ? 'JIKU CASH MEMO' : 'لوحة التحكم والمحاسبة')}
                  {activeTab === 'newSale' && t.newSale}
                  {activeTab === 'products' && t.productManagement}
                  {activeTab === 'history' && t.salesHistory}
                  {activeTab === 'androidExporter' && (lang === 'en' ? 'Android Studio Code Base' : 'ملفات كود أندرويد')}
                </h2>
                <p className="text-xs text-slate-400 dark:text-gray-500 font-medium tracking-wide mt-0.5">
                  {activeTab === 'dashboard' && 'Main Branch • Station 01'}
                  {activeTab === 'newSale' && (lang === 'en' ? 'Live checkout counter terminal' : 'شاشة المحاسبة المباشرة للبقالة')}
                  {activeTab === 'products' && (lang === 'en' ? 'All items and reference rates directory' : 'قائمة الأصناف بمخزون بقالة جيكو')}
                  {activeTab === 'history' && (lang === 'en' ? 'Review all final local billing activities' : 'تفاصيل سجلات فواتير البيع')}
                  {activeTab === 'androidExporter' && (lang === 'en' ? 'Kotlin compose file assets' : 'مجموعة ملفات مشروع الأندرويد')}
                </p>
              </div>
            </div>

            {/* Quick Stats Grid at Top */}
            <div className="grid grid-cols-2 md:flex items-center gap-3.5">
              <div className={`p-3 px-5 rounded-2xl border text-center md:text-start shadow-xs ${darkMode ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200/80'}`}>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">{t.totalSales}</div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-sans tracking-tight mt-0.5">{totalSalesRevenue.toFixed(2)} {t.sar}</div>
              </div>
              <div className={`p-3 px-5 rounded-2xl border text-center md:text-start shadow-xs ${darkMode ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200/80'}`}>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">{t.totalInvoicesCount}</div>
                <div className="text-base font-black text-teal-650 dark:text-teal-400 font-sans tracking-tight mt-0.5">{totalInvoicesToday}</div>
              </div>
            </div>
          </div>

        {/* ==================== SCREEN 1: HOME DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* BAKALA SHOP CORE BANNER */}
            <div className={`relative overflow-hidden rounded-2xl border ${darkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-150' : 'bg-emerald-500 text-white border-emerald-600'} p-6 md:p-8 shadow-sm`}>
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white mb-3 tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-250 animate-pulse"></span>
                  {lang === 'en' ? 'ONLINE-STABLE / OFFLINE-SAVED' : 'مستقر محلياً / حفظ تلقائي'}
                </div>
                <h3 className="text-3xl font-black mb-2">{lang === 'en' ? 'JIKU CASH MEMO' : 'جيكو كاش ميمو'}</h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-emerald-300' : 'text-emerald-50'} leading-relaxed`}>
                  {lang === 'en' 
                    ? 'Optimized for grocery stores, mini-marts, and Bakalas. Permanently record your product values (Water, Pepsi, Bread) and calculate instant customer receipts offline with 0% data loss.' 
                    : 'نظام مُحسّن ومُخصّص للبقالات والتموينات والمتاجر الصغيرة. احفظ أسعار المنتجات (مثل الماء والبيبسي والخبز) محلياً واقضِ على احتمالية فقدان البيانات مع دعم كامل للغة العربية.'}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setActiveTab('newSale')}
                    className="px-5 py-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm tracking-tight shadow-md flex items-center gap-2 cursor-pointer transition transform active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{t.newSale}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('androidExporter')}
                    className="px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm border border-emerald-600 flex items-center gap-2 cursor-pointer transition transform active:scale-95"
                  >
                    <FileCode className="w-4 h-4" />
                    <span>{t.androidExporter}</span>
                  </button>
                </div>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-5 pointer-events-none hidden md:block">
                <ShoppingCart className="w-72 h-72 text-white" />
              </div>
            </div>

            {/* ACTION TRIGGERS GRID (LARGE GROCERY STORE BUTTONS) */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-gray-400 mb-3">{lang === 'en' ? 'POS Quick Terminals' : 'محطات نقاط البيع السريعة'}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. New Sale CARD */}
                <button
                  onClick={() => setActiveTab('newSale')}
                  id="dash-btn-new-sale"
                  className="group relative overflow-hidden text-start p-5 rounded-2xl border border-emerald-600/10 bg-emerald-600 text-white hover:bg-emerald-700 active:scale-98 transition shadow hover:shadow-md max-w-full cursor-pointer flex flex-col justify-between min-h-[140px]"
                >
                  <div className="p-3 bg-white/10 rounded-xl w-fit text-emerald-100 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-lg flex items-center justify-between">
                      <span>{t.newSale}</span>
                      {lang === 'en' ? <ChevronRight className="w-5 h-5 opacity-70" /> : <ChevronLeft className="w-5 h-5 opacity-70" />}
                    </h5>
                    <p className="text-xs text-emerald-100 line-clamp-1 mt-1 font-sans">{lang === 'en' ? 'Start customer billing checkout' : 'بدء عملية فوترة بيع للمستهلك'}</p>
                  </div>
                </button>

                {/* 2. Product Management CARD */}
                <button
                  onClick={() => setActiveTab('products')}
                  id="dash-btn-products"
                  className={`group text-start p-5 rounded-2xl border hover:border-emerald-500/30 active:scale-98 transition shadow-sm hover:shadow flex flex-col justify-between min-h-[140px] cursor-pointer ${darkMode ? 'bg-zinc-900 border-zinc-800 text-emerald-50 hover:bg-zinc-850' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'}`}
                >
                  <div className={`p-3 rounded-xl w-fit ${darkMode ? 'bg-emerald-950 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} group-hover:scale-110 transition-transform`}>
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg flex items-center justify-between">
                      <span>{t.productManagement}</span>
                      {lang === 'en' ? <ChevronRight className="w-5 h-5 opacity-70" /> : <ChevronLeft className="w-5 h-5 opacity-70" />}
                    </h5>
                    <p className="text-xs text-gray-500 mt-1 font-sans">{lang === 'en' ? 'Edit item catalog & prices' : 'تحديث أسعار وقائمة الأصناف'}</p>
                  </div>
                </button>

                {/* 3. Sales History CARD */}
                <button
                  onClick={() => setActiveTab('history')}
                  id="dash-btn-history"
                  className={`group text-start p-5 rounded-2xl border hover:border-emerald-500/30 active:scale-98 transition shadow-sm hover:shadow flex flex-col justify-between min-h-[140px] cursor-pointer ${darkMode ? 'bg-zinc-900 border-zinc-800 text-emerald-50 hover:bg-zinc-850' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'}`}
                >
                  <div className={`p-3 rounded-xl w-fit ${darkMode ? 'bg-teal-950 text-teal-400' : 'bg-teal-50 text-teal-600'} group-hover:scale-110 transition-transform`}>
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg flex items-center justify-between">
                      <span>{t.salesHistory}</span>
                      {lang === 'en' ? <ChevronRight className="w-5 h-5 opacity-70" /> : <ChevronLeft className="w-5 h-5 opacity-70" />}
                    </h5>
                    <p className="text-xs text-gray-500 mt-1 font-sans">{lang === 'en' ? 'Verify previous sales logs' : 'عرض فواتير البيع القديمة والمحاسبة'}</p>
                  </div>
                </button>

                {/* 4. Android Code Hub CARD */}
                <button
                  onClick={() => setActiveTab('androidExporter')}
                  id="dash-btn-android-exporter"
                  className={`group text-start p-5 rounded-2xl border hover:border-emerald-500/30 active:scale-98 transition shadow-sm hover:shadow flex flex-col justify-between min-h-[140px] cursor-pointer ${darkMode ? 'bg-zinc-900 border-zinc-800 text-emerald-50 hover:bg-zinc-850' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'}`}
                >
                  <div className={`p-3 rounded-xl w-fit ${darkMode ? 'bg-purple-950 text-purple-400' : 'bg-purple-50 text-purple-650'} group-hover:scale-110 transition-transform`}>
                    <FileCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg flex items-center justify-between">
                      <span className="text-purple-600 dark:text-purple-400">{t.androidExporter}</span>
                      {lang === 'en' ? <ChevronRight className="w-5 h-5 opacity-70 text-purple-500" /> : <ChevronLeft className="w-5 h-5 opacity-70 text-purple-500" />}
                    </h5>
                    <p className="text-xs text-gray-500 mt-1 font-sans">{lang === 'en' ? 'Kotlin file copy-paste exports' : 'تصدير كود أندرويد لـ Android Studio'}</p>
                  </div>
                </button>

              </div>
            </div>

            {/* RECENT SALES & SYSTEM CONFIG PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* RECENT LOGS SUMMARY */}
              <div className={`lg:col-span-2 p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} shadow-sm`}>
                <div className="flex items-center justify-between mb-4 border-b border-gray-150 pb-3">
                  <h4 className="font-extrabold text-base text-teal-800 dark:text-teal-400 flex items-center gap-2">
                    <History className="w-5 h-5 text-teal-500" />
                    <span>{t.recentSales}</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    {lang === 'en' ? 'Manage Logs' : 'سجل التفاصيل كامل'}
                  </button>
                </div>

                {invoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm font-sans">
                    {lang === 'en' ? 'No sales generated yet. Start first bill transaction!' : 'لم يتم تسجيل مبيعات بعد. ابدأ أول فاتورة!'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-start font-sans">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-200 dark:border-zinc-800 text-[11px] uppercase text-start">
                          <th className="py-2 font-semibold text-start">{t.invoiceNo}</th>
                          <th className="py-2 font-semibold text-start">{t.dateTime}</th>
                          <th className="py-2 font-semibold text-start">{lang === 'en' ? 'Items' : 'الأصناف'}</th>
                          <th className="py-2 font-semibold text-end">{t.grandTotal}</th>
                          <th className="py-2 font-semibold text-center">{lang === 'en' ? 'Details' : 'عرض'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                        {invoices.slice(0, 5).map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-100/40 dark:hover:bg-zinc-800/30">
                            <td className="py-3 font-semibold text-emerald-700 dark:text-emerald-400">{inv.invoiceNo}</td>
                            <td className="py-3 text-xs text-gray-400">{inv.dateTime}</td>
                            <td className="py-3 text-xs truncate max-w-[150px]">
                              {inv.items.map(item => `${lang === 'en' ? item.product.name : item.product.arabicName} (x${item.quantity})`).join(', ')}
                            </td>
                            <td className="py-3 font-mono font-bold text-end text-emerald-600 dark:text-emerald-450">{inv.grandTotal.toFixed(1)} {t.sar}</td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => setViewInvoice(inv)}
                                className="px-2.5 py-1 rounded bg-slate-150 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-755 text-xs font-semibold cursor-pointer transition text-gray-500"
                              >
                                {t.quickView}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* LOCAL DATABASE CONTROLS (BACKUP & RESTORE) */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} shadow-sm flex flex-col justify-between`}>
                <div>
                  <h4 className="font-extrabold text-base text-emerald-800 dark:text-emerald-450 mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-500" />
                    <span>{t.backupRestore}</span>
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed mb-6 font-sans">
                    {t.backupDesc}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleBackup}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.backupDb}</span>
                  </button>

                  <div className="relative">
                    <label
                      htmlFor="restore-file-input"
                      className="w-full py-2.5 rounded-xl bg-slate-222 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-gray-400 border border-slate-300/40 dark:border-zinc-700 font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <Upload className="w-4 h-4 text-emerald-500" />
                      <span>{t.restoreDb}</span>
                    </label>
                    <input
                      id="restore-file-input"
                      type="file"
                      accept=".json"
                      onChange={handleRestore}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}


        {/* ==================== SCREEN 2: NEW SALE (BILLING TERMINAL) ==================== */}
        {activeTab === 'newSale' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT COLUMN: CATALOG DIRECTORY & DYNAMIC BARCODE SEARCH (8 COLS) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* INTERACTIVE SEARCH & SUGGESTION BOX */}
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} shadow-sm`}>
                <div className="relative flex items-center">
                  <Search className={`absolute ${lang === 'en' ? 'left-3' : 'right-3'} w-5 h-5 text-gray-400 pointer-events-none`} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t.searchProduct}
                    className={`w-full py-2.5 ${lang === 'en' ? 'pl-10 pr-4' : 'pr-10 pl-4'} rounded-xl bg-slate-100/50 dark:bg-zinc-950 focus:outline-none ring-1 focus:ring-2 focus:ring-emerald-500 ring-gray-200 dark:ring-zinc-800 text-sm font-sans`}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className={`absolute ${lang === 'en' ? 'right-3' : 'left-3'} text-xs font-bold text-gray-400 hover:text-gray-600`}
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* SUGGESTION FLOATING DROPDOWN */}
                {searchTerm && (
                  <div className={`mt-2 border rounded-xl overflow-hidden shadow-lg ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-100'} divide-y divide-slate-100 dark:divide-zinc-900`}>
                    {filteredSuggestions.length === 0 ? (
                      <div className="p-3 text-xs text-start text-gray-400 font-sans">
                        {t.noProducts} <span className="font-semibold text-emerald-500 underline cursor-pointer ml-1" onClick={openAddProductModal}>{t.addProduct}</span>
                      </div>
                    ) : (
                      filteredSuggestions.slice(0, 5).map(prod => (
                        <div
                          key={prod.id}
                          onClick={() => selectProductFromSearch(prod)}
                          className="p-3 text-start hover:bg-emerald-500/5 cursor-pointer flex justify-between items-center transition"
                        >
                          <div>
                            <div className="text-sm font-bold text-emerald-800 dark:text-emerald-450">{lang === 'en' ? prod.name : prod.arabicName}</div>
                            <div className="text-[11px] text-gray-400">{prod.category}</div>
                          </div>
                          <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{prod.price.toFixed(1)} {t.sar}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* DYNAMIC CART SPECIFICS (WHEN ITEM CHOSEN FROM SEARCH) */}
              {selectedProduct && (
                <div className={`p-4 rounded-xl border-2 border-emerald-500 ${darkMode ? 'bg-zinc-900' : 'bg-emerald-50/50'} flex flex-col md:flex-row items-center justify-between gap-4 transition duration-300 transform scale-100`}>
                  <div className="text-start">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Autofilled Reference Price' : 'تم جلب الأسعار المسجلة'}</span>
                    <h4 className="text-base font-black text-slate-800 dark:text-emerald-50">{lang === 'en' ? selectedProduct.name : selectedProduct.arabicName}</h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Price Input Dial */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 font-bold">{t.price}:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="w-20 text-center py-1.5 bg-white dark:bg-zinc-950 font-mono font-bold text-xs rounded-lg ring-1 ring-emerald-600/30 outline-none text-emerald-600 dark:text-emerald-400 font-sans"
                      />
                    </div>

                    {/* Quantity Selector dial */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400 font-bold mr-1">{lang === 'en' ? 'Qty:' : 'كمية:'}</span>
                      <button
                        onClick={() => setInputQuantity(q => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold font-mono text-sm">{inputQuantity}</span>
                      <button
                        onClick={() => setInputQuantity(q => q + 1)}
                        className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow cursor-pointer transition uppercase"
                    >
                      {lang === 'en' ? 'CONFIRM ITEM' : 'تأكيد الحجز'}
                    </button>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="p-2 text-xs text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              )}

              {/* QUICK CLICK BAKALA FAVORITE STOCK GRID (Water, Pepsi, Bread) */}
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} shadow-sm flex-1`}>
                <div className="flex items-center justify-between mb-3.5 border-b border-gray-100 pb-2">
                  <h4 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-450">{lang === 'en' ? 'Favorites Quick-Click Pad' : 'أزرار الاختيار السريع للبقالات'}</h4>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">{lang === 'en' ? 'Tap item to add directly' : 'اضغط على الصنف لتقييده فوراً'}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products.map(prod => (
                    <button
                      key={prod.id}
                      onClick={() => handleQuickAdd(prod)}
                      className={`text-start p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[100px] active:scale-95 transform shadow-sm ${darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-850' : 'bg-white border-slate-150 hover:border-emerald-500 hover:shadow-md'}`}
                    >
                      <div>
                        <div className="text-xs font-extrabold truncate max-w-full text-emerald-900 dark:text-emerald-400 font-sans">{lang === 'en' ? prod.name : prod.arabicName}</div>
                        <div className="text-[10px] text-gray-400 font-medium mt-0.5">{prod.category}</div>
                      </div>
                      <div className="flex items-center justify-between mt-2.5 w-full">
                        <div className="text-xs font-mono font-bold text-slate-800 dark:text-emerald-350">{prod.price.toFixed(1)} {t.sar}</div>
                        <div className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 rounded-lg font-black text-[9px] uppercase tracking-wider border border-emerald-600/10">+ ADD</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: RECEPT BILLING CALCULATOR (5 COLS) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className={`p-5 rounded-2xl border flex-1 flex flex-col justify-between ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} shadow-md`}>
                
                {/* Cart list Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-gray-150 pb-2 mb-3">
                    <h4 className="font-black text-sm text-slate-800 dark:text-emerald-400 flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-emerald-500" />
                      <span>{t.selectedProducts}</span>
                    </h4>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-full font-sans">
                      {cart.reduce((s, it) => s + it.quantity, 0)} {lang === 'en' ? 'Items' : 'قطع'}
                    </span>
                  </div>

                  {/* CART ITEMS CONTAINER WITH ADJUST BUTTONS */}
                  <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                    {cart.length === 0 ? (
                      <div className="text-center py-10 text-xs text-gray-400 font-sans leading-relaxed">
                        {t.emptyCart}
                      </div>
                    ) : (
                      cart.map((item, index) => (
                        <div key={item.product.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/75 dark:bg-zinc-950/70 border border-slate-100 dark:border-zinc-850 gap-2 transition hover:shadow-xs">
                          <div className="text-start min-w-0 flex-1">
                            <div className="text-xs font-bold truncate text-slate-800 dark:text-emerald-50">{lang === 'en' ? item.product.name : item.product.arabicName}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{item.product.price.toFixed(1)} SAR</div>
                          </div>

                          {/* Plus Minus adjustments */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateCartItemQty(index, -1)}
                              className="w-5 h-5 rounded bg-slate-200 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white transition cursor-pointer flex items-center justify-center text-[10px] font-bold"
                            >
                              -
                            </button>
                            <span className="w-5 text-center text-xs font-mono font-bold text-slate-850 dark:text-emerald-100">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItemQty(index, 1)}
                              className="w-5 h-5 rounded bg-slate-200 dark:bg-zinc-850 hover:bg-emerald-600 hover:text-white transition cursor-pointer flex items-center justify-center text-[10px] font-bold"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-end font-mono font-bold text-xs text-emerald-800 dark:text-emerald-450 w-20">
                            {item.totalPrice.toFixed(1)} {t.sar}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* BOTTOM BILL DISPATCH PANEL */}
                <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 mt-4 space-y-3.5">
                  
                  {/* subtotal line */}
                  <div className="flex justify-between text-xs font-semibold text-gray-500">
                    <span>{t.subtotal}</span>
                    <span className="font-mono">{cartSubtotal.toFixed(2)} SAR</span>
                  </div>

                  {/* discount input line */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-gray-500">{t.discount} (SAR)</span>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={discountVal}
                        onChange={(e) => setDiscountVal(e.target.value)}
                        className="w-24 text-end py-1 px-2 rounded bg-slate-100 dark:bg-zinc-950 font-mono font-bold border border-slate-200 dark:border-zinc-850 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-emerald-600 dark:text-emerald-400 font-sans"
                      />
                    </div>
                  </div>

                  {/* grand total line */}
                  <div className="flex justify-between text-base font-extrabold text-slate-800 dark:text-white border-t border-dashed border-gray-200 dark:border-zinc-800 pt-2.5">
                    <span className="text-emerald-800 dark:text-emerald-400">{t.grandTotal}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-450">{cartGrandTotal.toFixed(2)} SAR</span>
                  </div>

                  {/* cash received input */}
                  <div className="flex items-center justify-between gap-3 text-xs pt-1">
                    <span className="text-gray-500 font-bold">{t.cashReceived} (SAR)</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={cashVal}
                      onChange={(e) => setCashVal(e.target.value)}
                      className="w-36 text-end py-1.5 px-3 rounded-lg bg-emerald-500/5 dark:bg-zinc-950 border border-emerald-500/20 font-mono font-bold text-slate-800 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                    />
                  </div>

                  {/* change return output */}
                  <div className="flex justify-between text-sm font-extrabold text-orange-700 dark:text-orange-400 bg-orange-500/5 p-2 rounded-xl border border-orange-500/10">
                    <span>{t.changeReturn}</span>
                    <span className="font-mono">{(cashVal ? changeReturn : 0).toFixed(2)} SAR</span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={triggerCheckout}
                    id="btn-trigger-checkout"
                    disabled={cart.length === 0}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                  >
                    <span>{t.generateMemo}</span>
                    <span>→</span>
                  </button>

                </div>

              </div>
            </div>

          </div>
        )}


        {/* ==================== SCREEN 3: PRODUCT DIRECTORY ==================== */}
        {activeTab === 'products' && (
          <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} shadow-md`}>
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 border-b border-gray-150 pb-4">
              <div>
                <h4 className="font-extrabold text-base text-teal-800 dark:text-teal-400">{t.allProducts}</h4>
                <p className="text-xs text-gray-500 font-sans">{lang === 'en' ? 'Manage product directories and pre-populated billing rates' : 'إدارة قائمة أسعار الماء والبيبسي والمأكولات بالبقاير'}</p>
              </div>

              <button
                onClick={openAddProductModal}
                id="btn-add-product"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addProduct}</span>
              </button>
            </div>

            {/* CATALOG LIST TABLE */}
            {products.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm font-sans">
                {t.noProducts} <span className="text-emerald-500 underline font-semibold cursor-pointer" onClick={openAddProductModal}>{t.addProduct}</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-start font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] uppercase text-gray-400">
                      <th className="py-3 font-semibold text-start">{lang === 'en' ? 'Product (English)' : 'اسم المنتج (إنجليزي)'}</th>
                      <th className="py-3 font-semibold text-start">{lang === 'en' ? 'Arabic Name' : 'الاسم العربي'}</th>
                      <th className="py-3 font-semibold text-start">{t.category}</th>
                      <th className="py-3 font-semibold text-end">{t.price}</th>
                      <th className="py-3 font-semibold text-center">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                    {products.map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-100/30 dark:hover:bg-zinc-800/30">
                        <td className="py-3.5 font-bold text-emerald-800 dark:text-emerald-400">{prod.name}</td>
                        <td className="py-3.5 text-slate-800 dark:text-emerald-100">{prod.arabicName}</td>
                        <td className="py-3.5 text-xs text-gray-500 font-medium">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800">
                            {prod.category}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono font-bold text-end text-emerald-700 dark:text-emerald-350">{prod.price.toFixed(2)} {t.sar}</td>
                        <td className="py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditProductModal(prod)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer transition"
                              title={t.editProduct}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer transition"
                              title={t.deleteProduct}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}


        {/* ==================== SCREEN 4: SALES LOGS HISTORY ==================== */}
        {activeTab === 'history' && (
          <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} shadow-md`}>
            
            {/* Header / Date filer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 border-b border-gray-150 pb-4">
              <div>
                <h4 className="font-extrabold text-base text-teal-800 dark:text-teal-400">{t.salesHistory}</h4>
                <p className="text-xs text-gray-500 font-sans">{t.searchInvoiceByDate}</p>
              </div>

              {/* Date Input Box */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-gray-500">{lang === 'en' ? 'Select Date:' : 'اختر تاريخ اليوم:'}</span>
                <input
                  type="date"
                  value={historyDateFilter}
                  onChange={(e) => setHistoryDateFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-950 font-mono text-xs border border-slate-200 dark:border-zinc-850 text-slate-800 dark:text-emerald-50 outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                />
              </div>
            </div>

            {/* HISTORICAL RECORDS LIST */}
            {invoices.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm font-sans">
                {t.noInvoices}
              </div>
            ) : (
              <div className="space-y-3">
                {invoices
                  .filter(inv => !historyDateFilter || inv.dateTime.startsWith(historyDateFilter))
                  .map(inv => (
                    <div
                      key={inv.id}
                      className={`p-4 rounded-xl border hover:border-emerald-500/20 transition flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-start ${darkMode ? 'bg-zinc-950 border-zinc-850' : 'bg-slate-50 border-slate-150'}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-emerald-800 dark:text-emerald-400 font-sans">{inv.invoiceNo}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{inv.dateTime}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-lg font-sans">
                          {inv.items.map(item => `${lang === 'en' ? item.product.name : item.product.arabicName} (x${item.quantity})`).join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-none pt-2.5 md:pt-0">
                        <div className="text-start md:text-end">
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest">{t.grandTotal}</span>
                          <div className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-450">{inv.grandTotal.toFixed(1)} {t.sar}</div>
                        </div>

                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow cursor-pointer transition uppercase"
                        >
                          {t.quickView}
                        </button>
                      </div>
                    </div>
                  ))}

                {invoices.filter(inv => !historyDateFilter || inv.dateTime.startsWith(historyDateFilter)).length === 0 && (
                  <div className="text-center py-10 text-xs text-gray-400 font-sans leading-relaxed">
                    {t.noInvoices}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ==================== SCREEN 5: ANDROID STUDIO CODE DEVELOPER BASE ==================== */}
        {activeTab === 'androidExporter' && (
          <div className="space-y-6">
            
            {/* EXPORTER HERO BANNER */}
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} shadow-sm`}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hidden sm:block">
                  <FileCode className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-indigo-850 dark:text-indigo-400 mb-1">{t.developerTools}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {t.devToolsDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* EXPLORER ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* FILE DIRECTORIES SELECTOR (4 COLS) */}
              <div className={`lg:col-span-4 p-4 rounded-xl border flex flex-col justify-start gap-3 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                <div className="relative">
                  <input
                    type="text"
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    placeholder="Search source files..."
                    className="w-full py-1.5 pr-8 pl-3 rounded-lg bg-slate-100 dark:bg-zinc-950 text-xs border border-slate-200 dark:border-zinc-850 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                  />
                  <Search className="absolute right-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                </div>

                <div className="space-y-2 mt-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredAndroidFiles.map((file, idx) => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedAndroidFile(file)}
                      className={`w-full text-start p-3 rounded-lg border cursor-pointer transition flex items-center justify-between gap-2 text-xs select-none ${selectedAndroidFile.name === file.name ? 'border-indigo-500 bg-indigo-500/5 text-indigo-500' : 'border-transparent text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-850 text-gray-500'}`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold truncate text-[11px]">{file.name}</div>
                        <div className="text-[9px] text-gray-400 truncate mt-0.5 font-mono">{file.path}</div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold text-center ${file.language === 'xml' ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-600' : file.language === 'kotlin' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600'}`}>
                        {file.language}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* REAL-TIME PREVIEW WORKSPACE (8 COLS) */}
              <div className="lg:col-span-8 flex flex-col">
                <div className={`p-4 rounded-xl border flex-1 flex flex-col ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} shadow-md`}>
                  
                  {/* Filename and quick copying bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150 pb-3 mb-3">
                    <div className="text-start">
                      <h5 className="font-bold text-xs text-indigo-500 font-mono">{selectedAndroidFile.name}</h5>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedAndroidFile.path}</p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(selectedAndroidFile.code, 42)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow flex items-center justify-center gap-1.5 cursor-pointer max-w-fit"
                    >
                      {copiedFileIndex === 42 ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>COPIED CODE!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY CODE TO CLIPBOARD</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* CODE SNIPPET CONTAINER */}
                  <div className="bg-zinc-950 p-4 rounded-xl text-xs font-mono text-zinc-300 overflow-auto max-h-[480px] text-start border border-zinc-850" dir="ltr">
                    <pre className="loading-relaxed leading-normal whitespace-pre">
                      {selectedAndroidFile.code}
                    </pre>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

      </main>
      </div>

      {/* ====================================================================================== */}
      {/* ==================== MODAL 1: ADD / EDIT PRODUCT DIALOG ==================== */}
      {/* ====================================================================================== */}
      {productModalOpen && (
        <div id="product-form-modal" className="fixed inset-0 bg-transparent backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print">
          <div className="absolute inset-0 bg-zinc-900/50" onClick={() => setProductModalOpen(false)}></div>
          
          <div className={`relative w-full max-w-md p-6 rounded-2xl border shadow-xl ${darkMode ? 'bg-zinc-900 border-zinc-800 text-emerald-50' : 'bg-white border-slate-150 text-slate-800'} transition transform scale-100 z-10`}>
            
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h4 className="font-extrabold text-lg text-emerald-800 dark:text-emerald-450">
                {editingProduct ? t.editProduct : t.addProduct}
              </h4>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-start font-sans">
              
              {/* Product English Name */}
              <div>
                <label className="block text-xs font-bold text-gray-450 mb-1">{t.productNameEn} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={prodFormNameEn}
                  onChange={(e) => setProdFormNameEn(e.target.value)}
                  placeholder="e.g. Pepsi Can"
                  className="w-full py-2 px-3 rounded-lg bg-slate-100/50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-slate-200/50 dark:border-zinc-850 text-xs"
                />
              </div>

              {/* Product Arabic Name */}
              <div>
                <label className="block text-xs font-bold text-gray-450 mb-1">{t.productNameAr}</label>
                <input
                  type="text"
                  value={prodFormNameAr}
                  onChange={(e) => setProdFormNameAr(e.target.value)}
                  placeholder="مثال: بيبسي علبة"
                  className="w-full py-2 px-3 rounded-lg bg-slate-100/50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-slate-200/50 dark:border-zinc-850 text-xs"
                />
              </div>

              {/* Price SAR */}
              <div>
                <label className="block text-xs font-bold text-gray-450 mb-1">{t.price} <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={prodFormPrice}
                  onChange={(e) => setProdFormPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full py-2 px-3 rounded-lg bg-slate-100/50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-slate-200/50 dark:border-zinc-850 text-xs font-mono font-bold"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-444 mb-1">{t.category}</label>
                <select
                  value={prodFormCategory}
                  onChange={(e) => setProdFormCategory(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-105 dark:bg-zinc-950 focus:ring-1 focus:ring-emerald-500 outline-none border border-slate-200 dark:border-zinc-850 text-xs"
                >
                  <option value="">-- {lang === 'en' ? 'Select Category' : 'اختر فئة الصنف'} --</option>
                  <option value="Beverages">{lang === 'en' ? 'Beverages' : 'مشروبات غازية ومياه'}</option>
                  <option value="Bakery">{lang === 'en' ? 'Bakery' : 'مخبوزات'}</option>
                  <option value="Dairy">{lang === 'en' ? 'Dairy' : 'ألبان واجبان'}</option>
                  <option value="Snacks">{lang === 'en' ? 'Snacks & Sweets' : 'تسلية وحلويات'}</option>
                  <option value="Household">{lang === 'en' ? 'Household' : 'منظفات وأدوات منزلية'}</option>
                </select>
              </div>

              {/* Save/Cancel Dials */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-lg cursor-pointer transition uppercase"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  id="btn-confirm-save-product"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow cursor-pointer transition uppercase"
                >
                  {t.save}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* ====================================================================================== */}
      {/* ==================== MODAL 2: CASH MEMO BILL MODAL (THERMAL LOG VIEW) ================== */}
      {/* ====================================================================================== */}
      {viewInvoice && (
        <div id="invoice-receipt-modal" className="fixed inset-0 bg-transparent backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print">
          <div className="absolute inset-0 bg-zinc-900/40" onClick={() => setViewInvoice(null)}></div>
          
          <div className={`relative w-full max-w-sm rounded-2xl border shadow-xl flex flex-col h-[90vh] ${darkMode ? 'bg-zinc-900 border-zinc-800 text-emerald-50' : 'bg-white border-slate-150 text-slate-800'} transition transform scale-100 z-10 overflow-hidden`}>
            
            {/* Header / close bar */}
            <div className="p-4 border-b border-slate-100 dark:border-zinc-850 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
              <div>
                <h4 className="font-extrabold text-sm">{t.cashMemoTitle}</h4>
                <p className="text-[10px] text-emerald-100 font-mono mt-0.5">{viewInvoice.invoiceNo}</p>
              </div>
              <button
                onClick={() => setViewInvoice(null)}
                className="p-1 text-slate-100 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* RECEIPT RENDER BOX (THERMAL EMULATION) */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50 dark:bg-zinc-950 font-sans">
              <div
                id="print-receipt-section"
                className="bg-white text-black p-4 md:p-6 shadow-sm border border-slate-200/50 rounded-xl leading-relaxed text-xs text-start mx-auto w-full max-w-[290px] font-mono select-text"
                dir="ltr"
              >
                {/* Shop Name Header */}
                <div className="text-center space-y-1 mb-4">
                  <h3 className="text-sm font-black tracking-wider text-black">JIKU CASH MEMO</h3>
                  <p className="text-[9px] uppercase tracking-normal text-slate-400">Grocery &amp; Bakala POS</p>
                  <p className="text-[9px] text-slate-500">Al-Malaz District, Riyadh, KSA</p>
                  <p className="text-[9px] text-slate-500">Tel: +966 500 000 000</p>
                </div>

                <div className="h-[1px] bg-black my-2.5"></div>

                {/* Date & Invoice */}
                <div className="text-[10px] space-y-0.5 text-slate-600 font-mono">
                  <div><span className="font-bold">INVOICE:</span> {viewInvoice.invoiceNo}</div>
                  <div><span className="font-bold">DATE:</span> {viewInvoice.dateTime}</div>
                  <div><span className="font-bold">CASHIER:</span> Mainuddin Admin</div>
                </div>

                <div className="h-[1px] bg-black my-2.5"></div>

                {/* Items Columns Header */}
                <div className="grid grid-cols-12 text-[10px] font-bold text-black border-b border-dashed border-black pb-1 mb-1.5 uppercase">
                  <div className="col-span-5 text-start">NAME</div>
                  <div className="col-span-2 text-center">QTY</div>
                  <div className="col-span-2 text-end">RATE</div>
                  <div className="col-span-3 text-end">TOTAL</div>
                </div>

                {/* Items Rows */}
                <div className="space-y-1.5 text-[10px] text-black">
                  {viewInvoice.items.map((item, idx) => {
                    const dispNameEn = item.product.name.length > 15 ? item.product.name.substring(0, 13) + '..' : item.product.name;
                    return (
                      <div key={idx} className="grid grid-cols-12 items-center">
                        <div className="col-span-5 text-start font-bold">{dispNameEn}</div>
                        <div className="col-span-2 text-center">{item.quantity}</div>
                        <div className="col-span-2 text-end">{item.product.price.toFixed(1)}</div>
                        <div className="col-span-3 text-end font-bold">{item.totalPrice.toFixed(1)}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="h-[1px] bg-black border-dashed border-b my-2.5"></div>

                {/* Calculative rows */}
                <div className="space-y-1 text-[10px] text-black">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{viewInvoice.subtotal.toFixed(2)} SAR</span>
                  </div>
                  {viewInvoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount Given:</span>
                      <span>- {viewInvoice.discount.toFixed(2)} SAR</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-xs pt-1.5 border-t border-black">
                    <span>GRAND TOTAL:</span>
                    <span>{viewInvoice.grandTotal.toFixed(2)} SAR</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Cash Received:</span>
                    <span>{viewInvoice.cashReceived.toFixed(2)} SAR</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Change Return:</span>
                    <span>{viewInvoice.changeReturn.toFixed(2)} SAR</span>
                  </div>
                </div>

                <div className="h-[1px] bg-black my-2.5"></div>

                {/* Custom Print friendly barcode dummy layout */}
                <div className="text-center space-y-1 text-[9px] text-slate-500">
                  <div className="font-black tracking-normal select-none">* {viewInvoice.invoiceNo} *</div>
                  <div>** Thank You for Your Visit! **</div>
                  <div>Shukran - Ma\'as Salama</div>
                </div>

              </div>
            </div>

            {/* Print trigger Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-850 bg-slate-50 dark:bg-zinc-900 flex justify-end gap-2.5">
              <button
                onClick={() => setViewInvoice(null)}
                className="px-4 py-2 bg-slate-150 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-755 text-slate-500 font-bold text-xs rounded-xl cursor-pointer"
              >
                {lang === 'en' ? 'Close View' : 'إغلاق'}
              </button>
              <button
                onClick={handlePrint}
                id="btn-print-invoice"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer max-w-fit"
              >
                <Printer className="w-4 h-4" />
                <span>{t.printInvoice}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
