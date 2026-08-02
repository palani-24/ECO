import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/UserLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../utils/api';
import { 
  FaStore, FaLeaf, FaCoins, FaSearch, FaFilter, FaBoxOpen, 
  FaShippingFast, FaCheckCircle, FaTree, FaShoppingBag, 
  FaTimes, FaMapMarkerAlt, FaSpinner, FaStar, FaHistory
} from 'react-icons/fa';

const EcoStore = () => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'points-low', 'points-high'

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: user?.addresses?.[0]?.street || '12 Green Park Avenue',
    city: user?.addresses?.[0]?.city || 'Chennai',
    state: user?.addresses?.[0]?.state || 'Tamil Nadu',
    zipCode: user?.addresses?.[0]?.zipCode || '600001',
    phone: user?.phone || '9876543210'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const categories = ['All', 'Recycled Gear', 'Eco Stationery', 'Upcycled Home', 'Tree Planting', 'Vouchers'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/store/products');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load store products:', err);
      showToast('error', 'Failed to load store products catalog');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await API.get('/store/my-orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load store orders:', err);
      showToast('error', 'Failed to load store order history');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'my-orders') {
      fetchMyOrders();
    }
  };

  const handleOpenRedeemModal = (product) => {
    if ((user?.points || 0) < product.pointsPrice) {
      showToast('warning', `You need ${product.pointsPrice - (user?.points || 0)} more Eco Points to redeem this product!`);
      return;
    }
    setSelectedProduct(product);
    setQuantity(1);
    setOrderSuccess(null);
  };

  const handleConfirmRedeem = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setIsSubmitting(true);
      const res = await API.post('/store/redeem', {
        productId: selectedProduct._id,
        quantity,
        deliveryAddress
      });

      if (res.data.success) {
        showToast('success', 'Order placed successfully!');
        // Update user's points state locally
        if (setUser && res.data.remainingPoints !== undefined) {
          setUser({ ...user, points: res.data.remainingPoints });
        }
        setOrderSuccess(res.data.data);
        fetchProducts(); // Refresh stock
      }
    } catch (err) {
      console.error('Order error:', err);
      showToast('error', err.response?.data?.message || 'Failed to place store order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'points-low') return a.pointsPrice - b.pointsPrice;
    if (sortBy === 'points-high') return b.pointsPrice - a.pointsPrice;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-lg border border-emerald-500/20 flex items-center space-x-1"><FaCheckCircle className="h-3 w-3" /><span>Delivered</span></span>;
      case 'Shipped':
        return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs rounded-lg border border-blue-500/20 flex items-center space-x-1"><FaShippingFast className="h-3 w-3" /><span>Shipped</span></span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs rounded-lg border border-amber-500/20 flex items-center space-x-1"><FaBoxOpen className="h-3 w-3" /><span>Processing</span></span>;
    }
  };

  return (
    <UserLayout>
          
          {/* Hero Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 sm:p-8 shadow-xl shadow-emerald-600/10">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-black tracking-wide uppercase text-emerald-100 border border-white/20">
                  <FaStore className="h-3.5 w-3.5" />
                  <span>Eco-Marketplace</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Trade Eco Points for Real Impact 🌿
                </h1>
                <p className="text-emerald-100 text-xs sm:text-sm font-medium leading-relaxed">
                  Redeem your recycling points for 100% recycled goods, zero-waste products, and tree planting certificates delivered to your doorstep.
                </p>
              </div>

              {/* User Points Badge Card */}
              <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center space-x-4 shadow-lg min-w-[220px]">
                <div className="h-12 w-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md">
                  <FaCoins className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-100 block">Your Available Balance</span>
                  <div className="text-2xl font-black text-white flex items-baseline space-x-1">
                    <span>{user?.points || 0}</span>
                    <span className="text-xs font-bold text-amber-300">pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex space-x-3">
              <button
                onClick={() => handleTabChange('browse')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'browse'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FaShoppingBag className="h-4 w-4" />
                <span>Browse Products</span>
              </button>

              <button
                onClick={() => handleTabChange('my-orders')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'my-orders'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FaHistory className="h-4 w-4" />
                <span>My Orders</span>
                {orders.length > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] rounded-full">
                    {orders.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* TAB 1: BROWSE PRODUCTS */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Search & Filters */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-80">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search eco products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <FaFilter className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="featured">Featured First</option>
                      <option value="points-low">Points: Low to High</option>
                      <option value="points-high">Points: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        selectedCategory === cat
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading Skeleton */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
                      <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
                  <FaBoxOpen className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No eco products found</h3>
                  <p className="text-xs text-slate-400">Try adjusting your search query or selecting a different category.</p>
                </div>
              ) : (
                /* Products Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const canAfford = (user?.points || 0) >= product.pointsPrice;
                    return (
                      <div
                        key={product._id}
                        className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          {/* Image Container */}
                          <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Category Tag */}
                            <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black rounded-lg">
                              {product.category}
                            </span>
                            {/* Impact Badge */}
                            <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-md flex items-center space-x-1">
                              <FaLeaf className="h-2.5 w-2.5" />
                              <span>{product.impactTag}</span>
                            </span>
                          </div>

                          {/* Details */}
                          <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-bold flex items-center space-x-1">
                                <FaStar className="h-3 w-3 text-amber-400" />
                                <span>{product.rating} / 5.0</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-extrabold">
                                Stock: {product.stock} left
                              </span>
                            </div>

                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {product.name}
                            </h3>

                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                        </div>

                        {/* Card Bottom CTA */}
                        <div className="p-4 pt-0 space-y-3">
                          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
                            <span className="text-xs text-slate-400 font-bold">Price</span>
                            <div className="flex items-center space-x-1">
                              <FaCoins className="h-4 w-4 text-amber-400" />
                              <span className="text-lg font-black text-slate-900 dark:text-white">
                                {product.pointsPrice}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">pts</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenRedeemModal(product)}
                            disabled={!canAfford || product.stock <= 0}
                            className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all ${
                              !canAfford
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-95'
                            }`}
                          >
                            <FaShoppingBag className="h-3.5 w-3.5" />
                            <span>
                              {product.stock <= 0
                                ? 'Out of Stock'
                                : canAfford
                                ? 'Redeem Item'
                                : `Need ${product.pointsPrice - (user?.points || 0)} More Pts`}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'my-orders' && (
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="text-center py-12">
                  <FaSpinner className="h-8 w-8 text-emerald-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 mt-2 font-bold">Fetching your store orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
                  <FaBoxOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No Eco-Store orders placed yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Browse the catalog and redeem your Eco Points for sustainable recycled products!
                  </p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Browse Catalog Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Order Tracking ID</span>
                          <h4 className="font-black text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>{order.trackingNumber}</span>
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div>{getStatusBadge(order.status)}</div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-4">
                            {item.productImage && (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="h-14 w-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                              />
                            )}
                            <div className="flex-1">
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white">{item.productName}</h5>
                              <p className="text-[11px] text-slate-400 font-medium">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-amber-500 flex items-center space-x-1">
                                <FaCoins className="h-3 w-3" />
                                <span>{order.totalPointsSpent} pts</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address */}
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-slate-500 dark:text-slate-400">
                        <FaMapMarkerAlt className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-300 block">Delivery Address:</span>
                          <span>{order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.zipCode}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

      {/* REDEEM CONFIRMATION MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <FaShoppingBag className="text-emerald-500 h-4 w-4" />
                <span>Confirm Store Order</span>
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>

            {orderSuccess ? (
              /* Success Confirmation View */
              <div className="text-center py-4 space-y-4">
                <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <FaCheckCircle className="h-8 w-8" />
                </div>
                <h4 className="font-black text-lg text-slate-900 dark:text-white">Order Confirmed! 🎉</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Your order for <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProduct.name}</span> has been dispatched.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Tracking #:</span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{orderSuccess.trackingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Points Deducted:</span>
                    <span className="font-black text-amber-500">{orderSuccess.totalPointsSpent} pts</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setOrderSuccess(null);
                    handleTabChange('my-orders');
                  }}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md"
                >
                  View in My Orders
                </button>
              </div>
            ) : (
              /* Order Form View */
              <form onSubmit={handleConfirmRedeem} className="space-y-4">
                {/* Selected Product Summary */}
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">{selectedProduct.name}</h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">{selectedProduct.impactTag}</span>
                    <span className="text-xs font-black text-amber-500 flex items-center space-x-1 mt-1">
                      <FaCoins className="h-3 w-3" />
                      <span>{selectedProduct.pointsPrice} pts per item</span>
                    </span>
                  </div>
                </div>

                {/* Delivery Address Form */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Delivery Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Street / House No."
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Pincode"
                      value={deliveryAddress.zipCode}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Balance Calculation Box */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Your Current Balance:</span>
                    <span className="font-bold">{user?.points || 0} pts</span>
                  </div>
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                    <span>Total Points Deducted:</span>
                    <span>-{selectedProduct.pointsPrice * quantity} pts</span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-white font-black border-t border-amber-500/20 pt-1">
                    <span>Balance After Purchase:</span>
                    <span>{(user?.points || 0) - (selectedProduct.pointsPrice * quantity)} pts</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <FaSpinner className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <FaCheckCircle className="h-3.5 w-3.5" />
                        <span>Confirm Redeem</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default EcoStore;
