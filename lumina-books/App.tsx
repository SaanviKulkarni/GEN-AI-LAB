
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { 
  Search, ShoppingCart, User as UserIcon, Heart, Menu, X, 
  Star, ChevronRight, BookOpen, Truck, ShieldCheck, CreditCard,
  Plus, Minus, Trash2, LayoutDashboard, Package, Book as BookIcon,
  BarChart2, Settings, ChevronLeft, LogOut, CheckCircle
} from 'lucide-react';
import { Book, CartItem, User, Order, BlogPost } from './types';
import { SAMPLE_BOOKS, CATEGORIES, SAMPLE_BLOGS } from './constants';
import { getBookSummary, getSearchSuggestions } from './geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// --- Context & State Management ---
type ViewType = 'home' | 'shop' | 'book' | 'cart' | 'checkout' | 'account' | 'admin' | 'blog';

interface AppContextType {
  user: User | null;
  cart: CartItem[];
  wishlist: string[];
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: string) => void;
  updateCartQuantity: (bookId: string, delta: number) => void;
  toggleWishlist: (bookId: string) => void;
  orders: Order[];
  placeOrder: (shippingAddress: string) => void;
  login: () => void;
  logout: () => void;
  adminBooks: Book[];
  addAdminBook: (book: Book) => void;
  updateAdminBook: (book: Book) => void;
  view: ViewType;
  setView: (view: ViewType) => void;
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Components ---

const Nav = () => {
  const { setView, cart, user, login, logout } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button onClick={() => setView('home')} className="text-2xl font-bold tracking-tight text-stone-900 serif">
            Lumina<span className="text-amber-600">.</span>
          </button>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setView('shop')} className="text-stone-600 hover:text-stone-900 text-sm font-medium">Shop</button>
            <button onClick={() => setView('blog')} className="text-stone-600 hover:text-stone-900 text-sm font-medium">Blog</button>
            {user?.isAdmin && (
              <button onClick={() => setView('admin')} className="text-amber-700 hover:text-amber-900 text-sm font-semibold">Admin</button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-stone-100 rounded-full px-4 py-1.5 w-64">
            <Search className="w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search books..." 
              className="bg-transparent border-none text-sm w-full focus:ring-0 ml-2"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setView('account')} className="text-stone-600 hover:text-stone-900">
              <UserIcon className="w-5 h-5" />
            </button>
            <button onClick={() => setView('cart')} className="relative text-stone-600 hover:text-stone-900">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Fix: Defining BookCard using React.FC to allow 'key' prop in list context and fix type errors
const BookCard: React.FC<{ book: Book }> = ({ book }) => {
  const { setSelectedBook, setView, addToCart, wishlist, toggleWishlist } = useApp();
  const isWishlisted = wishlist.includes(book.id);

  return (
    <div className="group relative">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-stone-200">
        <img 
          src={book.coverImage} 
          alt={book.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button 
            onClick={() => { setSelectedBook(book); setView('book'); }}
            className="p-2 bg-white rounded-full hover:bg-stone-100 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <button 
            onClick={() => addToCart(book)}
            className="p-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(book.id); }}
          className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-colors ${
            isWishlisted ? 'bg-amber-600 text-white' : 'bg-white/70 text-stone-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        {book.discountPrice && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Sale
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs text-stone-500 font-medium uppercase tracking-widest">{book.genre}</p>
        <h3 
          className="text-sm font-semibold text-stone-900 mt-1 cursor-pointer hover:text-amber-600 transition-colors line-clamp-1"
          onClick={() => { setSelectedBook(book); setView('book'); }}
        >
          {book.title}
        </h3>
        <p className="text-sm text-stone-600 italic">by {book.author}</p>
        <div className="mt-1 flex items-center gap-2">
          {book.discountPrice ? (
            <>
              <span className="text-sm font-bold text-amber-700">${book.discountPrice}</span>
              <span className="text-xs text-stone-400 line-through">${book.price}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-stone-900">${book.price}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Pages ---

const HomePage = () => {
  const { setView, adminBooks } = useApp();
  const featured = adminBooks.filter(b => b.featured).slice(0, 4);
  const bestsellers = adminBooks.filter(b => b.bestseller).slice(0, 8);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative h-[80vh] flex items-center bg-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img src="https://picsum.photos/seed/hero/1600/900" className="w-full h-full object-cover" alt="Hero" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-white">
          <span className="inline-block px-4 py-1.5 bg-amber-600 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6">
            New Arrivals Available
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 max-w-2xl leading-[1.1]">
            Where Every <br /> <span className="italic serif text-amber-500">Story</span> Finds its Reader.
          </h1>
          <p className="text-lg text-stone-300 mb-10 max-w-lg leading-relaxed">
            Discover a curated collection of literary masterpieces, contemporary bestsellers, and niche rarities delivered to your doorstep.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setView('shop')}
              className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded transition-all transform hover:scale-105"
            >
              Shop the Collection
            </button>
            <button className="px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-bold rounded transition-all">
              Our Bestsellers
            </button>
          </div>
        </div>
      </section>

      {/* Featured Genres */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
            <p className="text-stone-500">Explore our diverse library of genres</p>
          </div>
          <button onClick={() => setView('shop')} className="text-amber-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.slice(0, 6).map(cat => (
            <div 
              key={cat} 
              onClick={() => setView('shop')}
              className="aspect-square rounded-xl bg-white border border-stone-200 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-500 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mb-4 text-amber-600">
                <BookIcon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-stone-800">{cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Current Bestsellers</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {bestsellers.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-stone-100 py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-amber-600">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Free Shipping</h3>
              <p className="text-stone-500 text-sm">On orders over $50. Worldwide delivery available.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-amber-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Secure Checkout</h3>
              <p className="text-stone-500 text-sm">100% secure payment processing with top-tier encryption.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-amber-600">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Staff Picks</h3>
              <p className="text-stone-500 text-sm">Hand-selected recommendations from our library experts.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ShopPage = () => {
  const { adminBooks } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(50);
  const [sortBy, setSortBy] = useState('Featured');

  const filteredBooks = useMemo(() => {
    let result = adminBooks.filter(b => 
      (activeCategory === 'All' || b.genre === activeCategory) && 
      (b.discountPrice || b.price) <= priceRange
    );

    if (sortBy === 'Price: Low to High') result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    if (sortBy === 'Price: High to Low') result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    if (sortBy === 'Rating') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [adminBooks, activeCategory, priceRange, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 space-y-8">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4">Categories</h3>
          <div className="space-y-2">
            {['All', ...CATEGORIES].map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`block w-full text-left text-sm py-1 transition-colors ${
                  activeCategory === cat ? 'text-amber-600 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Price Range</h3>
            <span className="text-sm font-bold text-stone-900">${priceRange}</span>
          </div>
          <input 
            type="range" 
            min="5" 
            max="100" 
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full accent-amber-600"
          />
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4">Sort By</h3>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded p-2 text-sm focus:ring-amber-500 focus:border-amber-500"
          >
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating</option>
          </select>
        </div>
      </aside>

      {/* Grid */}
      <main className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{activeCategory} Books</h1>
          <p className="text-stone-500 text-sm">{filteredBooks.length} results found</p>
        </div>
        
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredBooks.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        ) : (
          <div className="text-center py-24 bg-stone-100 rounded-xl">
            <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No books found</h3>
            <p className="text-stone-500">Try adjusting your filters to find what you're looking for.</p>
          </div>
        )}
      </main>
    </div>
  );
};

const BookDetailPage = () => {
  const { selectedBook, addToCart, wishlist, toggleWishlist, setView, adminBooks } = useApp();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (selectedBook) {
      window.scrollTo(0, 0);
      setAiSummary(null);
    }
  }, [selectedBook]);

  const generateAiSummary = async () => {
    if (!selectedBook) return;
    setLoadingAi(true);
    const summary = await getBookSummary(selectedBook.title, selectedBook.author);
    setAiSummary(summary || null);
    setLoadingAi(false);
  };

  if (!selectedBook) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => setView('shop')}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-10 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Shop
      </button>

      <div className="grid md:grid-cols-2 gap-16">
        {/* Images */}
        <div className="space-y-6">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 shadow-2xl">
            <img src={selectedBook.coverImage} alt={selectedBook.title} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="aspect-square rounded-lg overflow-hidden border-2 border-amber-600 bg-stone-100 cursor-pointer">
              <img src={selectedBook.coverImage} className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer hover:border-amber-400">
              <img src={`https://picsum.photos/seed/${selectedBook.id}back/400/400`} className="w-full h-full object-cover opacity-50" />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer hover:border-amber-400">
              <img src={`https://picsum.photos/seed/${selectedBook.id}inside/400/400`} className="w-full h-full object-cover opacity-50" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {selectedBook.genre}
              </span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold">{selectedBook.rating}</span>
                <span className="text-xs text-stone-400">({selectedBook.reviews} reviews)</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-2 leading-tight">{selectedBook.title}</h1>
            <p className="text-xl text-stone-600 italic">by <span className="text-stone-900 not-italic font-semibold">{selectedBook.author}</span></p>
          </div>

          <div className="flex items-baseline gap-4">
            {selectedBook.discountPrice ? (
              <>
                <span className="text-4xl font-bold text-amber-700">${selectedBook.discountPrice}</span>
                <span className="text-xl text-stone-400 line-through">${selectedBook.price}</span>
                <span className="text-sm text-red-600 font-bold">SAVE {Math.round((1 - selectedBook.discountPrice/selectedBook.price) * 100)}%</span>
              </>
            ) : (
              <span className="text-4xl font-bold text-stone-900">${selectedBook.price}</span>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-stone-600 leading-relaxed text-lg">
              {selectedBook.description}
            </p>
            
            <button 
              onClick={generateAiSummary}
              disabled={loadingAi}
              className="inline-flex items-center gap-2 text-amber-600 font-bold hover:text-amber-700 disabled:opacity-50"
            >
              <div className="p-1 rounded bg-amber-100"><Star className="w-4 h-4" /></div>
              {loadingAi ? 'AI is thinking...' : 'Generate AI Smart Summary'}
            </button>

            {aiSummary && (
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">✨</span> Lumina AI Insights
                </h4>
                <div className="text-amber-800 text-sm leading-relaxed prose prose-stone max-w-none">
                  {aiSummary}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <p className="text-xs text-stone-400 uppercase font-bold tracking-widest mb-1">Format</p>
              <p className="font-semibold">{selectedBook.format}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <p className="text-xs text-stone-400 uppercase font-bold tracking-widest mb-1">Pages</p>
              <p className="font-semibold">{selectedBook.pages}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <p className="text-xs text-stone-400 uppercase font-bold tracking-widest mb-1">Language</p>
              <p className="font-semibold">{selectedBook.language}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <p className="text-xs text-stone-400 uppercase font-bold tracking-widest mb-1">Publisher</p>
              <p className="font-semibold">{selectedBook.publisher}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => addToCart(selectedBook)}
              className="flex-1 bg-stone-900 text-white py-4 px-8 rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-stone-800 transition-all transform hover:scale-[1.02]"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <button 
              onClick={() => toggleWishlist(selectedBook.id)}
              className={`p-4 rounded-lg border flex items-center justify-center transition-all ${
                wishlist.includes(selectedBook.id) ? 'bg-red-50 border-red-200 text-red-600' : 'border-stone-200 text-stone-400 hover:border-stone-900'
              }`}
            >
              <Heart className={`w-6 h-6 ${wishlist.includes(selectedBook.id) ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Related Books */}
      <section className="mt-32">
        <h2 className="text-3xl font-bold mb-10">Readers also enjoyed</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {adminBooks.filter(b => b.genre === selectedBook.genre && b.id !== selectedBook.id).slice(0, 5).map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
};

const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart, setView } = useApp();
  const subtotal = cart.reduce((acc, item) => acc + (item.book.discountPrice || item.book.price) * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
          <ShoppingCart className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-stone-500 mb-8">Looks like you haven't added any books yet.</p>
        <button 
          onClick={() => setView('shop')}
          className="bg-stone-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-stone-800"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map(item => (
            <div key={item.bookId} className="flex gap-6 p-6 bg-white border border-stone-200 rounded-xl group relative">
              <div className="w-24 aspect-[2/3] bg-stone-100 rounded overflow-hidden shrink-0">
                <img src={item.book.coverImage} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg group-hover:text-amber-600 transition-colors">{item.book.title}</h3>
                    <button onClick={() => removeFromCart(item.bookId)} className="text-stone-400 hover:text-red-500 p-1">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-stone-500 text-sm">by {item.book.author} | {item.book.format}</p>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
                    <button 
                      onClick={() => updateCartQuantity(item.bookId, -1)}
                      className="p-1 hover:bg-white rounded transition-colors disabled:opacity-30"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(item.bookId, 1)}
                      className="p-1 hover:bg-white rounded transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-amber-700">
                      ${((item.book.discountPrice || item.book.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 text-sm pb-6 border-b border-stone-200">
            <div className="flex justify-between">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Shipping</span>
              <span className="font-bold">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Estimated Taxes</span>
              <span className="font-bold">$0.00</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-6">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-bold text-amber-700">${total.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => setView('checkout')}
            className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ChevronRight className="w-5 h-5" />
          </button>
          <div className="mt-6 flex items-center justify-center gap-4 text-stone-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs uppercase font-bold tracking-widest">Secure Payment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const { cart, placeOrder, setView } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [address, setAddress] = useState('');

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      placeOrder(address);
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 animate-bounce">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-stone-500 mb-10 leading-relaxed">
          Thank you for your purchase. We've sent a confirmation email with your order details. Your literary adventure starts soon!
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => setView('account')} className="bg-stone-900 text-white px-8 py-4 rounded-xl font-bold">Track Order</button>
          <button onClick={() => setView('shop')} className="text-stone-600 font-bold hover:text-stone-900">Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <form onSubmit={handleCheckout} className="space-y-8">
            <section>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm">1</span>
                Shipping Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input required type="text" className="w-full p-3 bg-white border border-stone-200 rounded-lg focus:ring-amber-500 focus:border-amber-500" placeholder="John Doe" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Street Address</label>
                  <input 
                    required 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 bg-white border border-stone-200 rounded-lg focus:ring-amber-500 focus:border-amber-500" 
                    placeholder="123 Library St" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">City</label>
                  <input required type="text" className="w-full p-3 bg-white border border-stone-200 rounded-lg focus:ring-amber-500 focus:border-amber-500" placeholder="New York" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Postal Code</label>
                  <input required type="text" className="w-full p-3 bg-white border border-stone-200 rounded-lg focus:ring-amber-500 focus:border-amber-500" placeholder="10001" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm">2</span>
                Payment Method
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 bg-white border border-amber-600 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" checked className="text-amber-600" />
                  <div className="flex-1">
                    <p className="font-bold">Credit / Debit Card</p>
                    <p className="text-xs text-stone-500">Safe & secure online transaction</p>
                  </div>
                  <CreditCard className="text-stone-400" />
                </label>
                <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="col-span-2">
                    <input type="text" placeholder="Card Number" className="w-full p-2 bg-white border border-stone-200 rounded" />
                  </div>
                  <input type="text" placeholder="MM/YY" className="w-full p-2 bg-white border border-stone-200 rounded" />
                  <input type="text" placeholder="CVC" className="w-full p-2 bg-white border border-stone-200 rounded" />
                </div>
              </div>
            </section>

            <button 
              disabled={isProcessing}
              className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-3 disabled:bg-stone-400 transition-all hover:bg-stone-800"
            >
              {isProcessing ? 'Processing Order...' : 'Pay & Confirm Order'}
            </button>
          </form>
        </div>

        <div>
          <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Review Items</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.bookId} className="flex gap-4">
                  <div className="w-16 aspect-[2/3] bg-stone-100 rounded shrink-0 overflow-hidden">
                    <img src={item.book.coverImage} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-bold line-clamp-1">{item.book.title}</p>
                    <p className="text-stone-500">Qty: {item.quantity}</p>
                    <p className="font-bold text-amber-700 mt-1">${((item.book.discountPrice || item.book.price) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-stone-200 space-y-2">
              <div className="flex justify-between text-stone-500 text-sm">
                <span>Subtotal</span>
                <span>${cart.reduce((a, b) => a + (b.book.discountPrice || b.book.price) * b.quantity, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span className="text-amber-700">${(cart.reduce((a, b) => a + (b.book.discountPrice || b.book.price) * b.quantity, 0) + (cart.reduce((a, b) => a + (b.book.discountPrice || b.book.price) * b.quantity, 0) > 50 ? 0 : 5.99)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { adminBooks, setView, orders } = useApp();
  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'orders'>('stats');

  const statsData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
              activeTab === 'stats' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <BarChart2 className="w-5 h-5" /> Analytics
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
              activeTab === 'inventory' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Package className="w-5 h-5" /> Inventory
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
              activeTab === 'orders' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ShoppingCart className="w-5 h-5" /> Orders
          </button>
          <div className="pt-8 mt-8 border-t border-stone-200">
            <button 
              onClick={() => setView('home')}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              <ChevronLeft className="w-5 h-5" /> Back to Site
            </button>
          </div>
        </aside>

        <main className="flex-1 bg-white border border-stone-200 rounded-2xl p-8 min-h-[600px]">
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">Analytics Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Sales</p>
                  <p className="text-3xl font-bold text-amber-700">$12,482.00</p>
                </div>
                <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-stone-900">{orders.length}</p>
                </div>
                <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Stock Items</p>
                  <p className="text-3xl font-bold text-stone-900">{adminBooks.length}</p>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="sales" stroke="#d97706" strokeWidth={3} dot={{ r: 6, fill: '#d97706' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Inventory Management</h2>
                <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Book
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 text-xs uppercase tracking-widest">
                      <th className="pb-4 px-2">Book</th>
                      <th className="pb-4 px-2">Stock</th>
                      <th className="pb-4 px-2">Price</th>
                      <th className="pb-4 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminBooks.map(book => (
                      <tr key={book.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 bg-stone-100 rounded overflow-hidden">
                              <img src={book.coverImage} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-sm line-clamp-1">{book.title}</p>
                              <p className="text-xs text-stone-500">{book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${book.stock < 15 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {book.stock} in stock
                          </span>
                        </td>
                        <td className="py-4 px-2 font-bold text-sm">${book.price}</td>
                        <td className="py-4 px-2 text-right">
                          <button className="text-stone-400 hover:text-amber-600 font-bold text-xs uppercase tracking-widest">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Recent Orders</h2>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-6 border border-stone-200 rounded-xl hover:border-amber-300 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-lg">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-stone-400">{order.date}</p>
                        </div>
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-4 overflow-hidden">
                          {order.items.slice(0, 3).map(item => (
                            <img key={item.bookId} className="inline-block h-12 w-8 rounded ring-2 ring-white object-cover" src={item.book.coverImage} alt="" />
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex h-12 w-8 items-center justify-center rounded bg-stone-100 ring-2 ring-white text-[10px] font-bold text-stone-400">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{order.items.length} items</p>
                          <p className="text-sm font-bold text-amber-700">${order.total.toFixed(2)}</p>
                        </div>
                        <button className="text-xs font-bold text-amber-600 uppercase tracking-widest hover:text-amber-700">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-stone-400">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No orders recorded yet.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 pb-16 border-b border-stone-800">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white serif">Lumina<span className="text-amber-500">.</span></h2>
          <p className="text-sm leading-relaxed">
            Curating the finest literature from around the globe since 2018. Your sanctuary for knowledge and imagination.
          </p>
          <div className="flex gap-4">
            {['Twitter', 'Instagram', 'Facebook', 'LinkedIn'].map(soc => (
              <span key={soc} className="w-8 h-8 rounded-full border border-stone-700 flex items-center justify-center text-xs hover:border-white hover:text-white transition-all cursor-pointer">
                {soc[0]}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-white font-bold mb-6">Explore</h3>
          <ul className="space-y-4 text-sm">
            <li className="hover:text-amber-500 cursor-pointer transition-colors">Bestsellers</li>
            <li className="hover:text-amber-500 cursor-pointer transition-colors">New Arrivals</li>
            <li className="hover:text-amber-500 cursor-pointer transition-colors">Gift Cards</li>
            <li className="hover:text-amber-500 cursor-pointer transition-colors">Curated Lists</li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-6">Support</h3>
          <ul className="space-y-4 text-sm">
            <li className="hover:text-amber-500 cursor-pointer transition-colors">Shipping Policy</li>
            <li className="hover:text-amber-500 cursor-pointer transition-colors">Return & Refunds</li>
            <li className="hover:text-amber-500 cursor-pointer transition-colors">FAQs</li>
            <li className="hover:text-amber-500 cursor-pointer transition-colors">Contact Us</li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-6">Newsletter</h3>
          <p className="text-sm mb-6">Get weekly book recommendations and exclusive offers.</p>
          <div className="flex">
            <input type="email" placeholder="Your email" className="bg-stone-800 border-none rounded-l-lg p-3 w-full text-sm focus:ring-1 focus:ring-amber-500" />
            <button className="bg-amber-600 text-white rounded-r-lg px-4 text-sm font-bold hover:bg-amber-700">Join</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs">© 2024 Lumina Books. All rights reserved.</p>
        <div className="flex gap-6 text-xs">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Cookie Policy</span>
        </div>
      </div>
    </footer>
  );
};

// --- App Root ---

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<ViewType>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [user, setUser] = useState<User | null>({ id: 'u1', name: 'Admin User', email: 'admin@lumina.com', isAdmin: true });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [adminBooks, setAdminBooks] = useState<Book[]>(SAMPLE_BOOKS);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = (book: Book) => {
    setCart(prev => {
      const existing = prev.find(item => item.bookId === book.id);
      if (existing) {
        return prev.map(item => item.bookId === book.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { bookId: book.id, quantity: 1, book }];
    });
    // For feedback
    alert(`${book.title} added to cart!`);
  };

  const removeFromCart = (bookId: string) => {
    setCart(prev => prev.filter(item => item.bookId !== bookId));
  };

  const updateCartQuantity = (bookId: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.bookId === bookId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const toggleWishlist = (bookId: string) => {
    setWishlist(prev => prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]);
  };

  const placeOrder = (shippingAddress: string) => {
    const subtotal = cart.reduce((acc, item) => acc + (item.book.discountPrice || item.book.price) * item.quantity, 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'guest',
      items: [...cart],
      total: subtotal + shipping,
      status: 'Processing',
      date: new Date().toLocaleDateString(),
      shippingAddress
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
  };

  const value = {
    user, cart, wishlist, addToCart, removeFromCart, updateCartQuantity, toggleWishlist, orders, placeOrder,
    login: () => {}, logout: () => setUser(null), adminBooks, addAdminBook: (b: Book) => setAdminBooks([b, ...adminBooks]),
    updateAdminBook: (b: Book) => setAdminBooks(adminBooks.map(x => x.id === b.id ? b : x)),
    view, setView, selectedBook, setSelectedBook
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <AppContent />
      </div>
    </AppProvider>
  );
};

const AppContent = () => {
  const { view } = useApp();

  return (
    <>
      <Nav />
      <main className="flex-1">
        {view === 'home' && <HomePage />}
        {view === 'shop' && <ShopPage />}
        {view === 'book' && <BookDetailPage />}
        {view === 'cart' && <CartPage />}
        {view === 'checkout' && <CheckoutPage />}
        {view === 'admin' && <AdminDashboard />}
        {view === 'blog' && (
          <div className="max-w-4xl mx-auto px-4 py-20 space-y-20">
            <h1 className="text-5xl font-bold text-center serif">The Reading Room</h1>
            {SAMPLE_BLOGS.map(post => (
              <article key={post.id} className="group cursor-pointer">
                <div className="aspect-video rounded-2xl overflow-hidden mb-8 shadow-xl">
                  <img src={post.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-stone-500 text-sm">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>by {post.author}</span>
                  </div>
                  <h2 className="text-3xl font-bold group-hover:text-amber-600 transition-colors">{post.title}</h2>
                  <p className="text-stone-600 leading-relaxed text-lg">{post.excerpt}</p>
                  <button className="font-bold text-amber-600 flex items-center gap-2 hover:gap-4 transition-all">
                    Read Story <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {view === 'account' && (
          <div className="max-w-4xl mx-auto px-4 py-20">
             <div className="flex justify-between items-center mb-12">
               <h1 className="text-4xl font-bold">My Account</h1>
               <button className="flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
                 <LogOut className="w-4 h-4" /> Sign Out
               </button>
             </div>
             
             <div className="grid md:grid-cols-3 gap-8">
               <div className="md:col-span-1 space-y-4">
                 <div className="p-6 bg-white border border-stone-200 rounded-2xl text-center">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserIcon className="w-10 h-10" />
                    </div>
                    <h3 className="font-bold text-lg">Admin User</h3>
                    <p className="text-stone-500 text-sm">admin@lumina.com</p>
                 </div>
                 <div className="p-6 bg-white border border-stone-200 rounded-2xl">
                    <h4 className="font-bold text-sm uppercase tracking-widest text-stone-400 mb-4">Saved Address</h4>
                    <p className="text-sm leading-relaxed">123 Bibliophile Way, Suite 400<br />Brooklyn, NY 11201</p>
                 </div>
               </div>

               <div className="md:col-span-2 space-y-8">
                 <section>
                   <h3 className="text-xl font-bold mb-6">Order History</h3>
                   <div className="space-y-4">
                     <p className="text-stone-400 text-center py-10 italic">Your recent orders will appear here.</p>
                   </div>
                 </section>
                 
                 <section>
                   <h3 className="text-xl font-bold mb-6">My Wishlist</h3>
                   <div className="grid grid-cols-2 gap-6">
                      <p className="text-stone-400 col-span-2 py-6 italic">No books in wishlist yet.</p>
                   </div>
                 </section>
               </div>
             </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default App;
