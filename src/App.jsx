import React, { useState, useEffect } from 'react';
import { ShoppingBag, Bike, MapPin, Phone, User, Users, CheckCircle, Info, Upload, Store, ShieldAlert, Clock, CreditCard, MessageCircle, MessageSquare, LayoutDashboard, History, BarChart3, Package, Truck, Home, ChevronRight, Download, X, LogOut, ListOrdered, Utensils } from 'lucide-react';

// --- FIREBASE CLOUD SETUP ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';

// 🔴 IF DEPLOYING TO NETLIFY: Paste your own free Firebase keys here to sync orders globally!
const myFirebaseConfig = {
  apiKey: "AIzaSyDRLd3d4xU21OY4eLl9IWp1QvWqUu5W8HY",
  authDomain: "ubike-2463e.firebaseapp.com",
  projectId: "ubike-2463e",
  storageBucket: "ubike-2463e.firebasestorage.app",
  messagingSenderId: "542327828062",
  appId: "1:542327828062:web:6977248b278e0fbcdececf"
};

let app, auth, db, appId;

if (typeof __firebase_config !== 'undefined') {
  const firebaseConfig = JSON.parse(__firebase_config);
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
} else if (myFirebaseConfig.apiKey) {
  app = initializeApp(myFirebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = 'ubite-app-live';
}

// --- 📱 INSTANT PHONE NOTIFICATIONS (TELEGRAM) ---
const TELEGRAM_BOT_TOKEN = "8584665813:AAEkRZr3uTdBLHk9vsHFAf8PL6umXTJUV1c"; 
const TELEGRAM_CHAT_ID = "962031151";

const notifyPhone = async (message) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
    });
  } catch (e) { console.error("Telegram notification failed", e); }
};

// --- DATA: SUSHI MENU ---
const CATEGORY_IMAGES = {
  'Gunkan': ['https://imgur.com/X5t99Lv.jpg'],
  'Inari': ['https://i.imgur.com/NqZ2vcn.jpg'],
  'Temaki': ['https://i.imgur.com/tCaE4H3.jpg'],
  'Maki Mono': ['https://i.imgur.com/JSwFHWT.jpg', 'https://i.imgur.com/T3YeWlc.jpg'],
  'Nigiri': ['https://i.imgur.com/KTYKBeI.jpg', 'https://i.imgur.com/dpxIa87.jpg'],
  'Shashimi': ['https://i.imgur.com/P5hU5Sj.jpg'],
  'Ala Carte': ['https://i.imgur.com/yCk74mu.jpg']
};

const SUSHI_MENU = [
  { id: 'g001', code: 'G 001', name: 'Chuka Lidako Sushi', pcs: '2 PCS', price: 4.00, category: 'Gunkan' },
  { id: 'g002', code: 'G 002', name: 'Ebiko Sushi', pcs: '2 PCS', price: 3.50, category: 'Gunkan' },
  { id: 'g003', code: 'G 003', name: 'Tobiko Sushi', pcs: '2 PCS', price: 5.50, category: 'Gunkan' },
  { id: 'g004', code: 'G 004', name: 'Shake Sushi', pcs: '2 PCS', price: 4.00, category: 'Gunkan' },
  { id: 'g005', code: 'G 005', name: 'Ikura Sushi', pcs: '2 PCS', price: 8.00, category: 'Gunkan' },
  { id: 'g006', code: 'G 006', name: 'Kani Mayo Sushi', pcs: '2 PCS', price: 2.50, category: 'Gunkan' },
  { id: 'g007', code: 'G 007', name: 'Tuna Mayo Sushi', pcs: '2 PCS', price: 2.50, category: 'Gunkan' },
  { id: 'g008', code: 'G 008', name: 'Chuka Kurage Sushi', pcs: '2 PCS', price: 4.50, category: 'Gunkan' },
  { id: 'g009', code: 'G 009', name: 'Chuka Wakame Sushi', pcs: '2 PCS', price: 3.50, category: 'Gunkan' },
  { id: 'g010', code: 'G 010', name: 'Chuka Hotate Sushi', pcs: '2 PCS', price: 4.50, category: 'Gunkan' },
  { id: 'g011', code: 'G 011', name: 'Ikura Shake Sushi', pcs: '2 PCS', price: 5.50, category: 'Gunkan' },
  { id: 'g012', code: 'G 012', name: 'Aiko Sushi', pcs: '2 PCS', price: 4.00, category: 'Gunkan' },
  { id: 'i013', code: 'I 013', name: 'Inari Tuna Mayo Sushi', pcs: '2 PCS', price: 3.50, category: 'Inari' },
  { id: 'i014', code: 'I 014', name: 'Inari Kani Mayo Sushi', pcs: '2 PCS', price: 3.50, category: 'Inari' },
  { id: 'i015', code: 'I 015', name: 'Inari Sushi', pcs: '2 PCS', price: 2.00, category: 'Inari' },
  { id: 'i016', code: 'I 016', name: 'Inari Ebiko Sushi', pcs: '2 PCS', price: 5.50, category: 'Inari' },
  { id: 'i017', code: 'I 017', name: 'Inari Kani Riyaki Sushi', pcs: '2 PCS', price: 4.00, category: 'Inari' },
  { id: 'i018', code: 'I 018', name: 'Inari Mentai Sushi', pcs: '2 PCS', price: 2.50, category: 'Inari' },
  { id: 'i019', code: 'I 019', name: 'Inari Chuka Lidako Sushi', pcs: '2 PCS', price: 5.00, category: 'Inari' },
  { id: 'i020', code: 'I 020', name: 'Inari Salada Sushi', pcs: '2 PCS', price: 5.00, category: 'Inari' },
  { id: 'i021', code: 'I 021', name: 'Inari Shake Salada Sushi', pcs: '2 PCS', price: 5.50, category: 'Inari' },
  { id: 'i022', code: 'I 022', name: 'Inari Shake Sushi', pcs: '2 PCS', price: 5.50, category: 'Inari' },
  { id: 't023', code: 'T 023', name: 'Salmon Aburi Temaki Sushi', pcs: '1 PCS', price: 5.50, category: 'Temaki' },
  { id: 't024', code: 'T 024', name: 'California Temaki Sushi', pcs: '1 PCS', price: 5.00, category: 'Temaki' },
  { id: 't025', code: 'T 025', name: 'Ebi Ten Temaki Sushi', pcs: '1 PCS', price: 5.00, category: 'Temaki' },
  { id: 't026', code: 'T 026', name: 'Salmon Temaki Sushi', pcs: '1 PCS', price: 5.50, category: 'Temaki' },
  { id: 't027', code: 'T 027', name: 'Soft Shell Crab Temaki Sushi', pcs: '1 PCS', price: 8.00, category: 'Temaki' },
  { id: 't028', code: 'T 028', name: 'Unagi Temaki Sushi', pcs: '1 PCS', price: 7.50, category: 'Temaki' },
  { id: 't029', code: 'T 029', name: 'Kani Mayo Temaki Sushi', pcs: '1 PCS', price: 4.50, category: 'Temaki' },
  { id: 't030', code: 'T 030', name: 'Tuna Mayo Temaki Sushi', pcs: '1 PCS', price: 4.50, category: 'Temaki' },
  { id: 'm031', code: 'M 031', name: 'Kani Mayo Maki Sushi', pcs: '4 PCS', price: 5.00, category: 'Maki Mono' },
  { id: 'm032', code: 'M 032', name: 'Crispy Salmon Maki Sushi', pcs: '4 PCS', price: 8.00, category: 'Maki Mono' },
  { id: 'm033', code: 'M 033', name: 'Una Chizu Maki Sushi', pcs: '8 PCS', price: 23.50, category: 'Maki Mono' },
  { id: 'm034', code: 'M 034', name: 'Salmon Mentai Maki Sushi', pcs: '8 PCS', price: 18.00, category: 'Maki Mono' },
  { id: 'm035', code: 'M 035', name: 'California Maki Sushi', pcs: '4 PCS', price: 6.50, category: 'Maki Mono' },
  { id: 'm036', code: 'M 036', name: 'Salmon Tataki Maki Sushi', pcs: '4 PCS', price: 8.50, category: 'Maki Mono' },
  { id: 'm037', code: 'M 037', name: 'Tuna Surada Maki Sushi', pcs: '8 PCS', price: 8.00, category: 'Maki Mono' },
  { id: 'm038', code: 'M 038', name: 'Unakyu Maki Sushi', pcs: '4 PCS', price: 6.50, category: 'Maki Mono' },
  { id: 'm039', code: 'M 039', name: 'Soft Shell Crab Maki Sushi', pcs: '8 PCS', price: 15.50, category: 'Maki Mono' },
  { id: 'm040', code: 'M 040', name: 'Ebi Ten Maki Sushi', pcs: '8 PCS', price: 13.50, category: 'Maki Mono' },
  { id: 'm041', code: 'M 041', name: 'Spider Mentai Maki Sushi', pcs: '8 PCS', price: 19.50, category: 'Maki Mono' },
  { id: 'm042', code: 'M 042', name: 'Kappa Maki Sushi', pcs: '4 PCS', price: 1.50, category: 'Maki Mono' },
  { id: 'm043', code: 'M 043', name: 'Salmon Maki Sushi', pcs: '4 PCS', price: 3.50, category: 'Maki Mono' },
  { id: 'm044', code: 'M 044', name: 'Tamago Maki Sushi', pcs: '4 PCS', price: 1.50, category: 'Maki Mono' },
  { id: 'm045', code: 'M 045', name: 'Koari Bako Kani Maki Sushi', pcs: '4 PCS', price: 2.50, category: 'Maki Mono' },
  { id: 'm046', code: 'M 046', name: 'Hana Ebiko Maki Sushi', pcs: '2 PCS', price: 6.50, category: 'Maki Mono' },
  { id: 'm047', code: 'M 047', name: 'Hana Tobiko Maki Sushi', pcs: '2 PCS', price: 7.50, category: 'Maki Mono' },
  { id: 'm048', code: 'M 048', name: 'Hana Sanshoku Sushi', pcs: '3 PCS', price: 10.00, category: 'Maki Mono' },
  { id: 'm049', code: 'M 049', name: 'Hana Ikura Sushi', pcs: '2 PCS', price: 10.00, category: 'Maki Mono' },
  { id: 'n050', code: 'N 050', name: 'Ebi Tempura Sushi', pcs: '2 PCS', price: 7.00, category: 'Nigiri' },
  { id: 'n051', code: 'N 051', name: 'Tamago Sushi', pcs: '2 PCS', price: 2.00, category: 'Nigiri' },
  { id: 'n052', code: 'N 052', name: 'Salmon Sushi', pcs: '2 PCS', price: 4.00, category: 'Nigiri' },
  { id: 'n053', code: 'N 053', name: 'Salmon Harasu Sushi', pcs: '2 PCS', price: 4.50, category: 'Nigiri' },
  { id: 'n054', code: 'N 054', name: 'Ika Sushi', pcs: '2 PCS', price: 3.50, category: 'Nigiri' },
  { id: 'n055', code: 'N 055', name: 'Kaori Bako Kani Sushi', pcs: '2 PCS', price: 2.50, category: 'Nigiri' },
  { id: 'n056', code: 'N 056', name: 'Unagi Sushi', pcs: '2 PCS', price: 6.50, category: 'Nigiri' },
  { id: 'n057', code: 'N 057', name: 'Kaori Bako Kani Mentai Sushi', pcs: '2 PCS', price: 3.50, category: 'Nigiri' },
  { id: 'n058', code: 'N 058', name: 'Una Chizu Sushi', pcs: '2 PCS', price: 8.00, category: 'Nigiri' },
  { id: 'n059', code: 'N 059', name: 'Tamago Mentai Sushi', pcs: '2 PCS', price: 2.50, category: 'Nigiri' },
  { id: 'n060', code: 'N 060', name: 'Ebi Sushi', pcs: '2 PCS', price: 3.50, category: 'Nigiri' },
  { id: 'n061', code: 'N 061', name: 'Ika Mentai Sushi', pcs: '2 PCS', price: 5.50, category: 'Nigiri' },
  { id: 'n062', code: 'N 062', name: 'Ebi Mentai Sushi', pcs: '2 PCS', price: 5.50, category: 'Nigiri' },
  { id: 'n063', code: 'N 063', name: 'Ebi Chizu Sushi', pcs: '2 PCS', price: 5.50, category: 'Nigiri' },
  { id: 'n064', code: 'N 064', name: 'Salmon Mentai Sushi', pcs: '2 PCS', price: 5.50, category: 'Nigiri' },
  { id: 'n065', code: 'N 065', name: 'Salmon Chizu Sushi', pcs: '2 PCS', price: 5.50, category: 'Nigiri' },
  { id: 's066', code: 'S 066', name: 'Salmon Shashimi Sushi', pcs: '5 PCS', price: 15.00, category: 'Shashimi' },
  { id: 's067', code: 'S 067', name: 'Ika Shashimi Sushi', pcs: '5 PCS', price: 11.50, category: 'Shashimi' },
  { id: 's068', code: 'S 068', name: 'Salmon Harusu Shashimi Sushi', pcs: '5 PCS', price: 16.50, category: 'Shashimi' },
  { id: 'so069', code: 'SO 069', name: 'Hana Mentai Sushi', pcs: '3 PCS', price: 10.00, category: 'Shashimi' },
  { id: 'so070', code: 'SO 070', name: 'Salmon Crispy Mentai Maki', pcs: '8 PCS', price: 17.00, category: 'Shashimi' },
  { id: 'a071', code: 'A 071', name: 'Chuka Lidako', pcs: 'Ala Carte', price: 8.50, category: 'Ala Carte' },
  { id: 'a072', code: 'A 072', name: 'Chuka Kurage', pcs: 'Ala Carte', price: 8.50, category: 'Ala Carte' },
  { id: 'a073', code: 'A 073', name: 'Chuka Wakame', pcs: 'Ala Carte', price: 5.50, category: 'Ala Carte' },
  { id: 'a074', code: 'A 074', name: 'Chuka Hotate', pcs: 'Ala Carte', price: 8.50, category: 'Ala Carte' }
];

const SUSHI_CATEGORIES = ['Gunkan', 'Inari', 'Temaki', 'Maki Mono', 'Nigiri', 'Shashimi', 'Ala Carte'];

// Extracted renderLogo function outside the component to prevent unmounting/flickering
const renderLogo = (logoError, setLogoError) => (
  <div className="relative mb-4">
    {!logoError ? (
      <img 
        src="UBite%20Logo%20trasparent.jpg" 
        alt="UBite Logo" 
        className="w-56 h-auto mx-auto drop-shadow-xl"
        onError={() => setLogoError(true)}
      />
    ) : (
      <div className="flex flex-col items-center">
         <div className="bg-gradient-to-br from-red-600 to-orange-500 p-5 rounded-full text-white shadow-xl mb-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-30"></div>
            <div className="relative flex items-center justify-center space-x-1">
              <Bike size={44} strokeWidth={2.5}/>
              <Utensils size={20} strokeWidth={2.5} className="absolute -right-2 -bottom-2 bg-red-600 rounded-full p-1 border-2 border-white"/>
            </div>
         </div>
         <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">UBite</h1>
      </div>
    )}
  </div>
);

const UBiteApp = () => {
  const [tailwindLoaded, setTailwindLoaded] = useState(false);

  // --- AUTO-INJECT TAILWIND & THEMES ---
  useEffect(() => {
    if (document.getElementById('tailwind-cdn')) {
      setTailwindLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'tailwind-cdn';
    script.src = "https://cdn.tailwindcss.com";
    script.onload = () => {
      if (window.tailwind) {
        window.tailwind.config = {
          theme: {
            extend: {
              animation: { fadeIn: 'fadeIn 0.4s ease-out' },
              keyframes: { fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } } }
            }
          }
        };
        setTailwindLoaded(true);
      }
    };
    document.head.appendChild(script);

    const style = document.createElement('style');
    style.innerHTML = `
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      .bg-batik { 
        background-color: #fdfbfb; 
        background-image: url('https://www.transparenttextures.com/patterns/arabesque.png'); 
      }
      .bg-batik-dark { 
        background-color: #111827; 
        background-image: url('https://www.transparenttextures.com/patterns/arabesque.png'); 
      }
    `;
    document.head.appendChild(style);
  }, []);

  // --- APP STATE ---
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [isShopLoaded, setIsShopLoaded] = useState(false);
  const [hiddenUsers, setHiddenUsers] = useState([]);
  const [logoError, setLogoError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Global flag to prevent spam clicking
  
  const [view, setView] = useState('loading');
  const [adminTab, setAdminTab] = useState('live'); 
  const [sellerTab, setSellerTab] = useState('live'); 
  const [toastMessage, setToastMessage] = useState('');
  const [user, setUser] = useState(null);
  
  // Custom User Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  
  // Feedback States
  const [feedbacks, setFeedbacks] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const [orders, setOrders] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ubite_local_orders');
      if (saved) return JSON.parse(saved);
    }
    return []; 
  });

  const [userDetails, setUserDetails] = useState({ nickname: '', whatsapp: '' });
  const [restaurant, setRestaurant] = useState('');
  const [mcdOrderType, setMcdOrderType] = useState('self');
  const [mcdItemCount, setMcdItemCount] = useState(1);
  const [mcdOrderText, setMcdOrderText] = useState('');
  const [sushiOrder, setSushiOrder] = useState({});
  const [activeSushiCategory, setActiveSushiCategory] = useState('Gunkan');
  
  // Food Truck States
  const [ftItemCount, setFtItemCount] = useState(1);
  const [ftOrderText, setFtOrderText] = useState('');

  const [orderRemarks, setOrderRemarks] = useState('');

  const [activeUserOrderId, setActiveUserOrderId] = useState(null);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState(null);
  
  // Staff Modal
  const [secretTap, setSecretTap] = useState(0);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  
  // Images
  const [mcdReceipt, setMcdReceipt] = useState(null);
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  // --- FIREBASE SYNC ---
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { console.error("Firebase Auth Error:", e); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Check Session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('ubite_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setUserDetails({ nickname: parsedUser.username, whatsapp: parsedUser.phone });
        if (view === 'loading') setView('welcome');
      } else if (view === 'loading') {
        setView('auth');
      }
    }
  }, [view]);

  useEffect(() => {
    if (!user || !db) return;
    
    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'ubite_orders');
    const unsubscribeOrders = onSnapshot(ordersRef, 
      (snapshot) => {
        const fetchedOrders = [];
        snapshot.forEach(d => fetchedOrders.push(d.data()));
        fetchedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(fetchedOrders);
      },
      (error) => console.error("Firestore Orders Error:", error)
    );

    const settingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'settings');
    const unsubscribeSettings = onSnapshot(settingsRef, 
      (snapshot) => {
        let foundStatus = false;
        snapshot.forEach(d => {
          if (d.id === 'store_status') {
            setIsShopOpen(d.data().isOpen);
            setHiddenUsers(d.data().hiddenUsers || []);
            foundStatus = true;
          }
        });
        if (!foundStatus) setIsShopOpen(true);
        setIsShopLoaded(true);
      }, 
      (error) => {
        console.error("Settings Listener Error:", error);
        setIsShopLoaded(true);
      }
    );

    const feedbackRef = collection(db, 'artifacts', appId, 'public', 'data', 'ubite_feedback');
    const unsubscribeFeedback = onSnapshot(feedbackRef, 
      (snapshot) => {
        const f = [];
        snapshot.forEach(d => f.push({ id: d.id, ...d.data() }));
        f.sort((a, b) => new Date(b.date) - new Date(a.date));
        setFeedbacks(f);
      },
      (error) => console.error("Feedback Listener Error:", error)
    );

    return () => { unsubscribeOrders(); unsubscribeSettings(); unsubscribeFeedback(); };
  }, [user]);

  useEffect(() => {
    if (!db && orders.length > 0) {
      localStorage.setItem('ubite_local_orders', JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      if (h === '#CTL0516') { 
        setView('admin'); 
        setAdminTab('live'); 
      } else if (h === '#seller') { 
        setShowSecretModal(true); 
        window.location.hash = ''; 
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // --- LOGIC & CUSTOM AUTH ---
  const handleSignUp = async () => {
    if (!authUsername || !authPassword || !authPhone) return showToast("Please fill all fields");
    if (isProcessing) return;
    
    setIsProcessing(true);
    const cleanUsername = authUsername.trim();
    const userData = { username: cleanUsername, phone: authPhone, password: authPassword };
    
    try {
      if (db && user) {
        const userRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'ubite_users'), cleanUsername.toLowerCase());
        const existing = await getDoc(userRef);
        if (existing.exists()) {
          showToast("Username already taken! Try another.");
          setIsProcessing(false);
          return;
        }
        await setDoc(userRef, userData);
      } else {
        const localUsers = JSON.parse(localStorage.getItem('ubite_users_db') || '{}');
        if (localUsers[cleanUsername.toLowerCase()]) {
          showToast("Username already taken! Try another.");
          setIsProcessing(false);
          return;
        }
        localUsers[cleanUsername.toLowerCase()] = userData;
        localStorage.setItem('ubite_users_db', JSON.stringify(localUsers));
      }
      setCurrentUser(userData);
      setUserDetails({ nickname: userData.username, whatsapp: userData.phone });
      localStorage.setItem('ubite_user', JSON.stringify(userData));
      setAuthUsername(''); setAuthPassword(''); setAuthPhone('');
      setView('welcome');
      showToast("Account created successfully!");
    } catch (error) {
      console.error("Sign up error:", error);
      showToast("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async () => {
    if (!authUsername || !authPassword) return showToast("Please fill all fields");
    if (isProcessing) return;

    setIsProcessing(true);
    const cleanUsername = authUsername.trim();

    try {
      if (db && user) {
        const userRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'ubite_users'), cleanUsername.toLowerCase());
        const existing = await getDoc(userRef);
        if (!existing.exists()) { showToast("User not found. Please Sign Up first."); setIsProcessing(false); return; }
        if (existing.data().password !== authPassword) { showToast("Incorrect password."); setIsProcessing(false); return; }
        
        const userData = existing.data();
        setCurrentUser(userData);
        setUserDetails({ nickname: userData.username, whatsapp: userData.phone });
        localStorage.setItem('ubite_user', JSON.stringify(userData));
        setAuthUsername(''); setAuthPassword('');
        setView('welcome');
        showToast("Login successful!");
      } else {
        const localUsers = JSON.parse(localStorage.getItem('ubite_users_db') || '{}');
        const existingUser = localUsers[cleanUsername.toLowerCase()];
        if (!existingUser) { showToast("User not found. Please Sign Up first."); setIsProcessing(false); return; }
        if (existingUser.password !== authPassword) { showToast("Incorrect password."); setIsProcessing(false); return; }
        
        setCurrentUser(existingUser);
        setUserDetails({ nickname: existingUser.username, whatsapp: existingUser.phone });
        localStorage.setItem('ubite_user', JSON.stringify(existingUser));
        setAuthUsername(''); setAuthPassword('');
        setView('welcome');
        showToast("Login successful!");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ubite_user');
    setView('auth');
  };

  const handleFeedbackSubmit = async () => {
    if(!feedbackText.trim()) return showToast("Please type something first!");
    if (isProcessing) return;
    setIsProcessing(true);

    const newFeedback = {
      date: new Date().toISOString(),
      user: currentUser ? currentUser.username : userDetails.nickname,
      phone: currentUser ? currentUser.phone : userDetails.whatsapp,
      text: feedbackText
    };

    try {
      if (db && user) {
        await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'ubite_feedback'), Date.now().toString()), newFeedback);
      }
      setShowFeedbackModal(false);
      setFeedbackText('');
      showToast('Thank you for your feedback!');
    } catch(e) {
      console.error(e);
      showToast('Failed to submit feedback.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateMcdFee = (items) => {
    if (items <= 3) return 2.50;
    if (items <= 6) return 4.00;
    if (items <= 9) return 5.50;
    return 6.50;
  };
  const calculateSushiItemsCount = () => Object.values(sushiOrder).reduce((s, q) => s + q, 0);
  
  const calculateDeliveryFee = () => {
    if (restaurant === 'mcd') return calculateMcdFee(mcdItemCount);
    if (restaurant === 'foodtruck') return Math.ceil(ftItemCount / 3) * 1.50;
    if (restaurant === 'sushi') return Math.ceil(calculateSushiItemsCount() / 3) * 1.50;
    return 0;
  };

  const calculateSushiFoodTotal = () => Object.entries(sushiOrder).reduce((t, [id, q]) => {
    const item = SUSHI_MENU.find(i => i.id === id);
    return t + (item ? item.price * q : 0);
  }, 0);

  const handleImageUpload = (e, setBase64) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setBase64(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSushiChange = (id, delta) => {
    setSushiOrder(prev => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      const updated = { ...prev, [id]: next };
      if (next === 0) delete updated[id];
      return updated;
    });
  };

  const handleCheckout = async () => {
    if (!paymentReceipt) { showToast("Please upload payment receipt!"); return; }
    if (restaurant === 'mcd' && mcdOrderType === 'self' && !mcdReceipt) { showToast("Please upload McD screenshot!"); return; }
    if (restaurant === 'foodtruck' && !ftOrderText.trim()) { showToast("Please type your food truck order!"); return; }

    if (isProcessing) return;
    setIsProcessing(true);

    const deliveryFee = calculateDeliveryFee();
    const foodTotal = restaurant === 'sushi' ? calculateSushiFoodTotal() : 0; 
    const now = new Date();
    const orderId = `${String(now.getDate()).padStart(2,'0')}${String(now.getMonth()+1).padStart(2,'0')}${String(orders.length + 1).padStart(2,'0')}`;
    const finalUserDetails = currentUser ? { nickname: currentUser.username, whatsapp: currentUser.phone } : userDetails;

    const newOrder = {
      id: orderId, date: now.toISOString(), userDetails: finalUserDetails, restaurant, mcdOrderType,
      sushiOrderDetails: restaurant === 'sushi' ? { ...sushiOrder } : null,
      mcdOrderText: restaurant === 'mcd' && mcdOrderType === 'help' ? mcdOrderText : null,
      ftOrderText: restaurant === 'foodtruck' ? ftOrderText : null,
      remarks: orderRemarks,
      mcdReceipt, paymentReceipt, deliveryFee, foodTotal, total: deliveryFee + foodTotal,
      status: 'pending', sellerStatus: restaurant === 'sushi' ? 'pending' : null
    };

    try {
      if (db && user) {
        await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'ubite_orders'), orderId), newOrder);
      } else {
        setOrders([newOrder, ...orders]);
      }
      setActiveUserOrderId(orderId); setView('status');
      showToast("Order submitted successfully!");
      notifyPhone(`🚨 NEW ORDER: #${orderId}\nCustomer: ${finalUserDetails.nickname}\nTotal: RM${newOrder.total.toFixed(2)}`);
    } catch (error) {
      showToast("Failed to submit order. Check connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateOrderStatus = async (id, s) => {
    try {
      if (db && user) { await updateDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'ubite_orders'), String(id)), { status: s }); }
      else { setOrders(orders.map(o => o.id === id ? { ...o, status: s } : o)); }
      showToast(`Order #${id} marked as ${s.toUpperCase()}`);
    } catch (error) {
      showToast("Failed to update order.");
    }
  };

  const updateSellerStatus = async (id, s) => {
    try {
      if (db && user) { await updateDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'ubite_orders'), String(id)), { sellerStatus: s }); }
      else { setOrders(orders.map(o => o.id === id ? { ...o, sellerStatus: s } : o)); }
      showToast(`Admin notified: Order is ${s.toUpperCase()}`);
      notifyPhone(`🍣 SUSHI TRUCK UPDATE\nOrder #${id} is now ${s.toUpperCase()}!`);
    } catch (error) {
      showToast("Failed to update seller status.");
    }
  };

  const toggleShopStatus = async () => {
    const next = !isShopOpen;
    try {
      if (db && user) { await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'settings'), 'store_status'), { isOpen: next }, { merge: true }); }
      else { setIsShopOpen(next); }
      showToast(next ? "Shop OPENED" : "Shop CLOSED");
    } catch (error) {
      showToast("Failed to change shop status.");
    }
  };

  const hideUserFromAdmin = async (phone) => {
    try {
      const newHidden = [...hiddenUsers, phone];
      if (db && user) {
        await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'settings'), 'store_status'), { hiddenUsers: newHidden }, { merge: true });
      } else {
        setHiddenUsers(newHidden);
      }
      showToast("User removed from list");
    } catch (error) {
      showToast("Failed to remove user");
    }
  };

  const getWhatsAppLink = (phone) => {
    if (!phone) return '#';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '6' + cleaned;
    return `https://wa.me/${cleaned}`;
  };

  const getUserStats = () => {
    const stats = {};
    orders.forEach(o => {
      const key = o.userDetails?.whatsapp;
      if (!key || hiddenUsers.includes(key)) return;
      if (!stats[key]) stats[key] = { nickname: o.userDetails?.nickname || 'Unknown', phone: key, orders: 0, foodSpent: 0, deliverySpent: 0, lastOrder: o.date };
      stats[key].orders++;
      stats[key].foodSpent += (o.foodTotal || 0);
      stats[key].deliverySpent += (o.deliveryFee || 0);
      if (new Date(o.date) > new Date(stats[key].lastOrder)) stats[key].lastOrder = o.date;
    });
    return Object.values(stats).sort((a,b) => b.orders - a.orders);
  };

  // --- CSV DOWNLOADERS ---
  const downloadFeedback = () => {
    let csv = "Date,User,Phone,Feedback\n";
    feedbacks.forEach(f => { csv += `${new Date(f.date).toLocaleDateString()},${f.user},${f.phone},"${f.text.replace(/"/g, '""')}"\n`; });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `UBite_Feedback.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const downloadUsers = () => {
    let csv = "Nickname,Phone,Total Orders,Food Spent (RM),Delivery Spent (RM),Total Spent (RM),Last Order\n";
    getUserStats().forEach(u => { csv += `${u.nickname},${u.phone},${u.orders},${u.foodSpent.toFixed(2)},${u.deliverySpent.toFixed(2)},${(u.foodSpent+u.deliverySpent).toFixed(2)},${new Date(u.lastOrder).toLocaleDateString()}\n`; });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `UBite_Users_Analytics.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const downloadSummary = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyOrders = orders.filter(o => new Date(o.date).getMonth() === currentMonth && new Date(o.date).getFullYear() === currentYear);
    let csv = "Date,Time,Order ID,Customer,Phone,Restaurant,Food Total (RM),Delivery Fee (RM),Grand Total (RM)\n";
    monthlyOrders.forEach(o => {
      const d = new Date(o.date);
      csv += `${d.toLocaleDateString()},${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})},${o.id},${o.userDetails?.nickname || 'Unknown'},${o.userDetails?.whatsapp || 'Unknown'},${o.restaurant},${(o.foodTotal || 0).toFixed(2)},${(o.deliveryFee || 0).toFixed(2)},${(o.total || 0).toFixed(2)}\n`;
    });
    const totalDeliveryEarnings = monthlyOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const totalSales = monthlyOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    csv += `\nMonthly Totals,,,,,,_,${totalDeliveryEarnings.toFixed(2)},${totalSales.toFixed(2)}\n`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `UBite_Summary_${currentMonth + 1}_${currentYear}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast("Monthly summary downloaded successfully!");
  };

  const showToast = (m) => { setToastMessage(m); setTimeout(() => setToastMessage(''), 3000); };

  if (!tailwindLoaded || view === 'loading') return <div className="flex items-center justify-center h-screen bg-gray-50 font-bold">Loading UBite...</div>;

  // --- UI COMPONENTS ---
  const renderAuth = () => (
    <div className="p-8 flex flex-col items-center justify-center min-h-[80vh] animate-fadeIn">
      {renderLogo(logoError, setLogoError)}
      <p className="text-red-600 font-bold mb-8 text-sm uppercase tracking-wider">Sign in to track orders</p>
      
      <div className="w-full space-y-4">
        <input type="text" placeholder="Username" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full p-4 rounded-xl border border-gray-300 outline-none focus:ring-2 ring-orange-500 shadow-sm"/>
        {authMode === 'signup' && (
          <div className="w-full">
            <input type="tel" placeholder="WhatsApp Number" value={authPhone} onChange={e => setAuthPhone(e.target.value)} className="w-full p-4 rounded-xl border border-gray-300 outline-none focus:ring-2 ring-orange-500 shadow-sm"/>
            <p className="text-xs text-red-500 mt-1 ml-1 text-left font-medium">* Must be an active WhatsApp number</p>
          </div>
        )}
        <input type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full p-4 rounded-xl border border-gray-300 outline-none focus:ring-2 ring-orange-500 shadow-sm"/>
        <button 
          onClick={authMode === 'login' ? handleLogin : handleSignUp} 
          disabled={isProcessing}
          className={`w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-4 rounded-xl shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all ${isProcessing ? 'opacity-50' : ''}`}
        >
          {isProcessing ? 'Please wait...' : (authMode === 'login' ? 'Login' : 'Create Account')}
        </button>
      </div>

      <p className="mt-8 text-sm text-gray-600 font-medium">
        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
        <span onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthUsername(''); setAuthPassword(''); setAuthPhone(''); }} className="text-orange-600 hover:text-red-600 font-extrabold cursor-pointer transition-colors">{authMode === 'login' ? "Sign Up" : "Login"}</span>
      </p>

      <div className="absolute bottom-6 text-xs text-gray-400 cursor-pointer hover:text-red-500 transition font-bold uppercase" onClick={() => setShowSecretModal(true)}>Staff Login</div>
    </div>
  );

  const renderWelcome = () => (
    <div className="flex flex-col items-center text-center p-6 space-y-6 animate-fadeIn">
      {currentUser && (
        <div className="w-full flex justify-between items-center text-sm font-bold text-gray-700 mb-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <span>Hi, {currentUser.username}! 👋</span>
          <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700 transition"><LogOut size={16} className="mr-1"/> Logout</button>
        </div>
      )}
      
      <div onClick={() => secretTap >= 4 ? (setShowSecretModal(true), setSecretTap(0)) : setSecretTap(s => s + 1)}>
        {renderLogo(logoError, setLogoError)}
      </div>

      <div className="text-center space-y-1">
        <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500 italic">"U order, I bike, U Bite"</p>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest"><b>U</b>niversity <b>B</b>ased <b>I</b>nnovative<br/><b>T</b>asty <b>E</b>xpress</p>
      </div>

      {currentUser && (
        <div className="w-full flex space-x-3 mt-4">
          <button onClick={() => setView('user_orders')} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl shadow-md border-b-4 border-gray-950 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center text-sm"><ListOrdered size={16} className="mr-2" /> Track Orders</button>
          <button onClick={() => setShowFeedbackModal(true)} className="flex-1 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold py-3 rounded-xl shadow-md border-b-4 border-orange-600 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center text-sm"><MessageSquare size={16} className="mr-2" /> Feedback</button>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border-l-4 border-red-500 shadow-sm text-left w-full mt-4">
        <h3 className="font-bold text-lg mb-2 flex items-center text-gray-800"><Info className="mr-2 text-red-500" size={20}/> Our Story</h3>
        <p className="text-gray-700 text-sm leading-relaxed">U.B.I.T.E was born to make your life easier. We pedal to save your time so you can focus on studies and rest.</p>
      </div>

      {!isShopLoaded ? (
        <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-4 rounded-xl flex justify-center items-center"><Clock className="mr-2 animate-spin" size={20} /> Checking Status...</button>
      ) : !isShopOpen ? (
        <div className="w-full bg-red-100 text-red-700 p-4 rounded-lg font-bold flex items-center justify-center shadow-inner border border-red-200"><Clock className="mr-2" /> UBite is currently CLOSED.</div>
      ) : (
        <button onClick={() => setView('details')} className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-extrabold py-5 rounded-xl shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all text-lg tracking-wide flex justify-center items-center">
          Start Order <ChevronRight className="ml-2" size={20}/>
        </button>
      )}

      <div className="text-xs text-gray-400 cursor-pointer hover:text-red-500 transition mt-6 font-bold uppercase" onClick={() => setShowSecretModal(true)}>
        Staff Login
      </div>
    </div>
  );

  const renderUserOrders = () => {
    const myOrders = orders.filter(o => o.userDetails?.nickname === currentUser?.username);
    return (
      <div className="p-6 animate-fadeIn bg-transparent min-h-screen pb-24">
        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-red-200 pb-2 mb-6 flex items-center"><ListOrdered className="mr-2 text-red-600"/> My Orders</h2>
        <div className="space-y-4">
          {myOrders.length === 0 ? <p className="text-center text-gray-600 font-medium py-10 bg-white rounded-xl shadow-sm">No orders yet.</p> : myOrders.map(order => (
            <div key={order.id} onClick={() => { setActiveUserOrderId(order.id); setView('status'); }} className="bg-white p-5 rounded-xl border border-gray-100 shadow-md cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 tracking-tight">#{order.id}</h3>
                  <p className="text-xs text-gray-500 mt-0.5"><Clock size={10} className="inline mr-1"/>{new Date(order.date).toLocaleDateString()} • {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${order.status === 'arrived' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>{order.status}</span>
              </div>
              <div className="text-sm text-gray-700 flex justify-between items-center">
                <span className="font-semibold bg-gray-100 px-2 py-1 rounded">{order.restaurant === 'foodtruck' ? 'Food Truck' : (order.restaurant || '').toUpperCase()}</span>
                <span className="font-extrabold text-red-600 text-lg">RM {(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setView('welcome')} className="w-full py-4 text-gray-600 hover:text-red-600 transition font-bold mt-6 bg-white rounded-xl shadow-sm border border-gray-200">Back to Home</button>
      </div>
    );
  };

  const renderRestaurantSelector = () => (
    <div className="p-6 space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-extrabold text-gray-900 border-b-2 border-red-200 pb-2">What to eat?</h2>
      <div className="grid grid-cols-1 gap-5">
        <button onClick={() => { setRestaurant('mcd'); setView('mcd'); }} className="flex items-center p-5 bg-white border-2 border-yellow-400 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 text-left relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10"><Utensils size={100} /></div>
          <div className="bg-yellow-400 p-4 rounded-xl text-red-600 mr-5 font-bold text-3xl shadow-sm">M</div>
          <div className="relative z-10"><h3 className="text-xl font-extrabold text-gray-900">McDonald's</h3><p className="text-xs text-gray-600 mt-1 font-medium">Hot burgers and fries, delivered straight to your block.</p></div>
        </button>
        <button onClick={() => { setRestaurant('sushi'); setView('sushi'); }} className="flex items-center p-5 bg-white border-2 border-red-500 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 text-left relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 text-red-600"><Store size={100} /></div>
          <div className="bg-gradient-to-br from-red-600 to-red-700 p-4 rounded-xl text-white mr-5 shadow-sm"><Store size={32} /></div>
          <div className="relative z-10"><h3 className="text-xl font-extrabold text-gray-900">Sushi Truck</h3><p className="text-xs text-gray-600 mt-1 font-medium">No.1 Sushi Truck in KL.</p></div>
        </button>
        <button onClick={() => { setRestaurant('foodtruck'); setView('foodtruck'); }} className="flex items-center p-5 bg-white border-2 border-orange-400 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 text-left relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 text-orange-600"><Truck size={100} /></div>
          <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-4 rounded-xl text-white mr-5 shadow-sm"><Truck size={32} /></div>
          <div className="relative z-10"><h3 className="text-xl font-extrabold text-gray-900">Other Food Trucks</h3><p className="text-xs text-gray-600 mt-1 font-medium">Order from any other truck around campus.</p></div>
        </button>
      </div>
      <button onClick={() => setView('welcome')} className="w-full py-4 text-gray-600 hover:text-red-600 transition font-bold bg-white rounded-xl shadow-sm border border-gray-200 mt-4">Cancel & Back</button>
    </div>
  );

  const renderFoodTruckFlow = () => (
    <div className="p-6 space-y-6 animate-fadeIn pb-24">
      <h2 className="text-2xl font-extrabold text-orange-600 border-b-2 border-orange-200 pb-2 flex items-center"><Truck className="mr-2"/> Food Truck Order</h2>
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 p-5 rounded-2xl flex items-start shadow-sm">
        <Info className="mr-3 shrink-0 text-orange-600 mt-1" size={24} />
        <div>
          <span className="font-extrabold text-orange-900 block mb-2">How it works:</span>
          <ul className="text-sm text-orange-800 space-y-1 font-medium">
            <li>1. Type the truck name, food, and quantity.</li>
            <li>2. Delivery fee: RM 1.50 per 3 items.</li>
            <li>3. Pay delivery fee now. We will WhatsApp you later for the food price.</li>
          </ul>
        </div>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md space-y-5">
        <div>
          <label className="block text-sm font-extrabold text-gray-800 mb-1">Total Number of Items</label>
          <p className="text-xs text-gray-500 mb-3 font-medium">Used to calculate delivery fee.</p>
          <div className="flex items-center border-2 border-gray-200 rounded-xl w-max overflow-hidden bg-gray-50"><button onClick={() => setFtItemCount(Math.max(1, ftItemCount - 1))} className="px-5 py-3 hover:bg-gray-200 font-black text-gray-700 transition">-</button><span className="px-6 py-3 font-black text-lg bg-white border-x-2 border-gray-200">{ftItemCount}</span><button onClick={() => setFtItemCount(ftItemCount + 1)} className="px-5 py-3 hover:bg-gray-200 font-black text-gray-700 transition">+</button></div>
        </div>
        <div className="border-t-2 border-gray-100 pt-5">
          <label className="block text-sm font-extrabold text-gray-800 mb-2">Order Details</label>
          <textarea rows="5" className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-4 ring-orange-500/20 transition-all shadow-sm font-medium text-gray-700" placeholder="e.g. Truck: Takoyaki Abang&#10;Food: 1x Mix Takoyaki (10pcs)&#10;Food: 2x Takoyaki Sotong (5pcs)" value={ftOrderText} onChange={(e) => setFtOrderText(e.target.value)}></textarea>
        </div>
      </div>
      <button onClick={() => setView('checkout')} className="w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-extrabold py-5 rounded-xl shadow-lg border-b-4 border-orange-600 active:border-b-0 active:translate-y-1 transition-all text-lg">Proceed to Payment</button>
      <button onClick={() => setView('restaurant')} className="w-full py-4 text-gray-600 hover:text-red-600 transition font-bold bg-white rounded-xl shadow-sm border border-gray-200">Back</button>
    </div>
  );

  const renderMcdFlow = () => (
    <div className="p-6 space-y-6 animate-fadeIn pb-24">
      <h2 className="text-2xl font-extrabold text-red-600 border-b-2 border-yellow-400 pb-2 flex items-center">McDonald's Order</h2>
      <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start shadow-sm"><ShieldAlert className="text-red-600 mr-3 mt-1 shrink-0" size={24} /><p className="text-sm text-red-900 font-bold">IMPORTANT: Sundae cones are NOT available for UBite delivery.</p></div>
      <div className="space-y-3">
        <label className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all shadow-sm ${mcdOrderType === 'self' ? 'border-yellow-500 bg-yellow-50 ring-4 ring-yellow-500/20' : 'bg-white border-gray-200 hover:border-yellow-300'}`}>
          <input type="radio" checked={mcdOrderType === 'self'} onChange={() => setMcdOrderType('self')} className="w-5 h-5 text-yellow-500 accent-yellow-500" /><div className="ml-4"><span className="block font-extrabold text-gray-900 text-lg">I will order on the McD App</span></div>
        </label>
        <label className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all shadow-sm ${mcdOrderType === 'help' ? 'border-yellow-500 bg-yellow-50 ring-4 ring-yellow-500/20' : 'bg-white border-gray-200 hover:border-yellow-300'}`}>
          <input type="radio" checked={mcdOrderType === 'help'} onChange={() => setMcdOrderType('help')} className="w-5 h-5 text-yellow-500 accent-yellow-500" /><div className="ml-4"><span className="block font-extrabold text-gray-900 text-lg">Please order for me</span></div>
        </label>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md space-y-5">
        <div>
          <label className="block text-sm font-extrabold text-gray-800 mb-2">Number of Items</label>
          <div className="flex items-center border-2 border-gray-200 rounded-xl w-max overflow-hidden bg-gray-50"><button onClick={() => setMcdItemCount(Math.max(1, mcdItemCount - 1))} className="px-5 py-3 hover:bg-gray-200 font-black text-gray-700 transition">-</button><span className="px-6 py-3 font-black text-lg bg-white border-x-2 border-gray-200">{mcdItemCount}</span><button onClick={() => setMcdItemCount(mcdItemCount + 1)} className="px-5 py-3 hover:bg-gray-200 font-black text-gray-700 transition">+</button></div>
        </div>
        {mcdOrderType === 'self' ? (
          <div className="border-t-2 border-gray-100 pt-5">
            <label className="block text-sm font-extrabold text-gray-800 mb-3">Upload McD Order Screenshot</label>
            <input type="file" id="mcd-upload" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setMcdReceipt)} />
            <label htmlFor="mcd-upload" className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 cursor-pointer block hover:bg-gray-100 hover:border-yellow-500 transition-all">
              {mcdReceipt ? <div className="text-green-600 font-extrabold"><CheckCircle className="mx-auto mb-2" size={32}/> Screenshot Attached</div> : <div className="text-gray-500 font-bold"><Upload className="mx-auto mb-2" size={32}/> Tap to upload screenshot</div>}
              <p className="text-xs text-red-500 mt-3 font-bold bg-red-50 p-2 rounded-lg inline-block border border-red-100">*Screenshot must show the collection Number</p>
            </label>
          </div>
        ) : (
          <div className="border-t-2 border-gray-100 pt-5">
             <label className="block text-sm font-extrabold text-gray-800 mb-3">Your Order Details</label>
             <textarea rows="4" className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-yellow-500 focus:ring-4 ring-yellow-500/20 transition-all shadow-sm font-medium text-gray-700" placeholder="e.g. 1x McChicken Set (Large)..." value={mcdOrderText} onChange={(e) => setMcdOrderText(e.target.value)}></textarea>
          </div>
        )}
      </div>
      <button onClick={() => setView('checkout')} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-extrabold py-5 rounded-xl shadow-lg border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all text-lg">Proceed to Payment</button>
      <button onClick={() => setView('restaurant')} className="w-full py-4 text-gray-600 hover:text-red-600 transition font-bold bg-white rounded-xl shadow-sm border border-gray-200">Back</button>
    </div>
  );

  const renderSushiFlow = () => {
    const displayed = SUSHI_MENU.filter(i => i.category === activeSushiCategory);
    return (
      <div className="p-0 animate-fadeIn bg-gray-50 pb-32">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md pt-6 pb-4 px-6 z-10 border-b-2 border-red-200 shadow-sm">
          <h2 className="text-2xl font-extrabold text-red-600 flex items-center"><Store className="mr-2"/> NURIMAN SUSHI</h2>
          <div className="flex overflow-x-auto space-x-3 mt-5 pb-2 scrollbar-hide">
            {SUSHI_CATEGORIES.map(c => (
              <button key={c} onClick={() => setActiveSushiCategory(c)} className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-extrabold transition-all shadow-sm border-2 ${activeSushiCategory === c ? 'bg-red-600 text-white border-red-600 scale-105' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="p-6 space-y-3">
          {(CATEGORY_IMAGES[activeSushiCategory] || []).map((src, idx) => <img key={idx} src={src} className="w-full rounded-2xl shadow-md border-2 border-white" alt="menu"/>)}
          <h3 className="font-extrabold text-gray-900 border-b-2 border-gray-200 pb-2 mt-8 mb-4 text-lg">Select Quantities</h3>
          {displayed.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1 pr-4">
                 <p className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1 uppercase">{item.code} • {item.pcs}</p>
                 <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h4>
                 <span className="font-extrabold text-red-600 text-sm mt-1 inline-block bg-red-50 px-2 py-0.5 rounded border border-red-100">RM {item.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 shrink-0 shadow-inner">
                <button onClick={() => handleSushiChange(item.id, -1)} className="w-10 h-10 font-black text-gray-600 hover:bg-gray-200 transition text-lg">-</button>
                <span className="w-8 text-center font-black text-base bg-white h-10 flex items-center justify-center border-x-2 border-gray-200">{sushiOrder[item.id] || 0}</span>
                <button onClick={() => handleSushiChange(item.id, 1)} className="w-10 h-10 font-black text-red-600 hover:bg-red-100 transition text-lg">+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 p-5 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] z-20">
           <div className="max-w-md mx-auto flex space-x-3 items-center">
              <div className="flex-1">
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Total Items: {calculateSushiItemsCount()}</p>
                 <p className="text-lg font-extrabold text-gray-900">RM {calculateSushiFoodTotal().toFixed(2)}</p>
              </div>
              <button onClick={() => setView('restaurant')} className="px-5 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition">Back</button>
              <button disabled={calculateSushiItemsCount() === 0} onClick={() => setView('checkout')} className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-extrabold py-4 rounded-xl shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:border-b-0 disabled:transform-none">Checkout</button>
           </div>
        </div>
      </div>
    );
  };

  const renderCheckout = () => {
    const fee = calculateDeliveryFee();
    const food = restaurant === 'sushi' ? calculateSushiFoodTotal() : 0;
    return (
      <div className="p-6 space-y-6 animate-fadeIn pb-24">
        <h2 className="text-2xl font-extrabold text-gray-900 border-b-2 border-red-200 pb-2">Final Checkout</h2>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md space-y-4">
          <h3 className="font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center text-lg"><ShoppingBag size={20} className="mr-2 text-red-600" /> Order Summary</h3>
          <div className="text-sm space-y-3 font-medium text-gray-600">
            <div className="flex justify-between items-center"><span className="bg-gray-100 px-2 py-1 rounded">Restaurant</span><span className="font-bold text-gray-900">{restaurant === 'foodtruck' ? 'Food Truck' : restaurant.toUpperCase()}</span></div>
            {restaurant === 'sushi' && <div className="flex justify-between items-center pt-3 border-t border-gray-50"><span>Food Price</span><span className="font-bold text-gray-900">RM {food.toFixed(2)}</span></div>}
            <div className="flex justify-between items-center"><span>Delivery Fee</span><span className="font-bold text-gray-900">RM {fee.toFixed(2)}</span></div>
          </div>
          <div className="flex justify-between items-center text-xl font-black text-red-600 border-t-2 border-gray-100 pt-4 mt-4 bg-red-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
             <span>Total to Pay Now:</span><span>RM {(fee + food).toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md">
          <label className="block text-sm font-extrabold text-gray-800 mb-2">Remarks (Optional)</label>
          <textarea rows="2" className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-4 ring-red-500/20 transition-all font-medium text-gray-700" placeholder="Any special requests or instructions..." value={orderRemarks} onChange={(e) => setOrderRemarks(e.target.value)}></textarea>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-md">
          <h3 className="font-extrabold text-blue-900 mb-5 flex items-center text-lg"><CreditCard size={20} className="mr-2" /> Payment Information</h3>
          <div className="bg-white p-5 rounded-xl border border-blue-100 text-center mb-5 shadow-sm">
            <img src="https://i.imgur.com/EMu0dwD.jpeg" alt="QR" className="w-48 mx-auto rounded-xl border-2 border-gray-100 mb-3 shadow-sm"/>
            <p className="text-sm font-bold font-mono text-gray-700 bg-gray-100 py-1.5 px-3 rounded-lg border border-gray-200 inline-block">RHB: 1-58093-0012584-0</p>
            <p className="text-xs text-gray-500 mt-2 font-extrabold uppercase tracking-widest">CHUAH TIONG LI</p>
          </div>
          <label className="block text-sm font-extrabold text-blue-900 mb-3">Upload Receipt (Required)</label>
          <input type="file" id="pay-upload" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setPaymentReceipt)} />
          <label htmlFor="pay-upload" className="block border-2 border-dashed border-blue-400 bg-white rounded-2xl p-6 text-center cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-all shadow-sm">
            {paymentReceipt ? <div className="text-green-600 font-extrabold"><CheckCircle size={32} className="mx-auto mb-2"/> Receipt Attached</div> : <div className="text-blue-600 font-extrabold"><Upload size={32} className="mx-auto mb-2"/> Tap to attach receipt</div>}
          </label>
        </div>
        <button 
          onClick={handleCheckout} 
          disabled={isProcessing}
          className={`w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-extrabold py-5 rounded-xl shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all text-lg ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? 'Processing...' : 'Confirm & Send Order'}
        </button>
        <button onClick={() => setView(restaurant)} className="w-full py-4 text-gray-600 hover:text-red-600 transition font-bold bg-white rounded-xl shadow-sm border border-gray-200 mt-4">Back</button>
      </div>
    );
  };

  const renderStatus = () => {
    const current = orders.find(o => o.id === activeUserOrderId);
    if (!current) return null;
    const statuses = ['pending', 'received', 'delivering', 'arrived'];
    const idx = statuses.indexOf(current.status);
    return (
      <div className="p-6 space-y-6 animate-fadeIn text-center pb-24">
        <h2 className="text-2xl font-extrabold text-gray-900 border-b-2 border-red-200 pb-2">Live Tracker</h2>
        <p className="text-gray-500 text-sm font-bold bg-white inline-block px-4 py-1 rounded-full shadow-sm border border-gray-100">Order ID: #{current.id}</p>
        
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg text-left mt-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-500"></div>
          <div className="absolute left-12 top-12 bottom-12 w-1 bg-gray-100 rounded-full"></div>
          <div className="relative z-10 space-y-10">
            <div className={`flex items-center ${idx >= 0 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
               <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md z-10 ${idx >= 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-gray-300'}`}><Clock size={24}/></div>
               <div className="ml-5"><p className="font-extrabold text-lg text-gray-900">Order Sent</p><p className="text-xs font-medium text-gray-500 mt-1">Waiting for admin confirmation...</p></div>
            </div>
            <div className={`flex items-center ${idx >= 1 ? 'opacity-100' : 'opacity-40 grayscale transition-all'}`}>
               <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md z-10 ${idx >= 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gray-300'}`}><Package size={24}/></div>
               <div className="ml-5"><p className="font-extrabold text-lg text-gray-900">Order Received</p><p className="text-xs font-medium text-gray-500 mt-1">Payment verified. Preparing food.</p></div>
            </div>
            <div className={`flex items-center ${idx >= 2 ? 'opacity-100' : 'opacity-40 grayscale transition-all'}`}>
               <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md z-10 ${idx >= 2 ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-gray-300'}`}><Truck size={24}/></div>
               <div className="ml-5"><p className="font-extrabold text-lg text-gray-900">Delivering</p><p className="text-xs font-medium text-gray-500 mt-1">Rider is on the way to you!</p></div>
            </div>
            <div className={`flex items-center ${idx >= 3 ? 'opacity-100' : 'opacity-40 grayscale transition-all'}`}>
               <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md z-10 ${idx >= 3 ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gray-300'}`}><Home size={24}/></div>
               <div className="ml-5"><p className="font-extrabold text-lg text-gray-900">Arrived</p><p className="text-xs font-medium text-gray-500 mt-1">Enjoy your meal!</p></div>
            </div>
          </div>
        </div>
        
        {current.restaurant === 'mcd' && current.mcdOrderType === 'self' && idx < 2 && (
          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200 shadow-md">
            <h3 className="font-extrabold text-yellow-900 mb-2">Ordered on the McD App?</h3>
            <p className="text-xs font-medium text-yellow-800 mb-5">Tap below ONLY when your McD app says the food is ready for pickup.</p>
            <button 
              disabled={current.mcdNotified || isProcessing}
              onClick={async () => {
                 if (isProcessing) return;
                 setIsProcessing(true);
                 try {
                   showToast("Notification sent! Rider is heading to the counter.");
                   notifyPhone(`🏃 URGENT:\nMcD User ${current.userDetails?.nickname} says food is ready for pickup!`);
                   if (db && user) {
                     await updateDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'ubite_orders'), String(current.id)), { mcdNotified: true });
                   } else {
                     setOrders(orders.map(o => o.id === current.id ? { ...o, mcdNotified: true } : o));
                   }
                 } finally {
                   setIsProcessing(false);
                 }
              }}
              className={`w-full ${current.mcdNotified ? 'bg-gray-300 cursor-not-allowed text-gray-500 border-b-0 translate-y-1' : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1'} ${isProcessing ? 'opacity-50' : ''} font-extrabold py-5 rounded-xl shadow transition-all flex justify-center items-center text-lg`}
            ><Bike className="mr-2" /> {current.mcdNotified ? 'Rider Notified!' : (isProcessing ? 'Sending...' : 'Notify Rider: Ready!')}</button>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <button onClick={() => { setView('user_orders'); setActiveUserOrderId(null); setSushiOrder({}); setPaymentReceipt(null); setMcdReceipt(null); setFtItemCount(1); setFtOrderText(''); setOrderRemarks(''); }} className="w-full bg-white text-gray-700 font-extrabold py-4 rounded-xl shadow-sm border border-gray-200 hover:text-red-600 transition">Back to My Orders</button>
          {idx === 3 && (
            <div className="flex space-x-3 pt-2">
              <button onClick={() => { setView('welcome'); setActiveUserOrderId(null); setSushiOrder({}); setPaymentReceipt(null); setMcdReceipt(null); setFtItemCount(1); setFtOrderText(''); setOrderRemarks(''); }} className="flex-1 bg-gray-900 text-white font-extrabold py-4 rounded-xl shadow-md hover:bg-black transition">Order Again</button>
              <button onClick={() => setShowFeedbackModal(true)} className="flex-1 bg-blue-600 text-white font-extrabold py-4 rounded-xl shadow-md hover:bg-blue-700 transition">Leave Feedback</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdminPortal = () => {
    const live = orders.filter(o => o.status !== 'arrived');
    const pastOrders = orders.filter(o => o.status === 'arrived');

    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white pb-32 animate-fadeIn relative">
        {/* Subtle admin background pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center border-b border-gray-800 pb-5 mb-6">
            <h2 className="text-2xl font-black flex items-center text-red-500 tracking-tight"><Store className="mr-2" /> Admin Dashboard</h2>
            <div className="flex space-x-2">
              <button onClick={toggleShopStatus} className={`px-4 py-2 rounded-lg text-white font-bold text-xs shadow-md transition ${isShopOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>{isShopOpen ? 'Close Shop' : 'Open Shop'}</button>
              <button onClick={() => (window.location.hash='', setView('welcome'))} className="text-xs bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-bold transition">Exit</button>
            </div>
          </div>
          
          <div className="flex bg-gray-950 p-1.5 rounded-xl mb-8 overflow-x-auto scrollbar-hide space-x-1 shadow-inner border border-gray-800">
            <button onClick={() => setAdminTab('live')} className={`px-5 py-2.5 text-xs font-extrabold rounded-lg whitespace-nowrap transition-colors ${adminTab === 'live' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>Live</button>
            <button onClick={() => setAdminTab('history')} className={`px-5 py-2.5 text-xs font-extrabold rounded-lg whitespace-nowrap transition-colors ${adminTab === 'history' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>History</button>
            <button onClick={() => setAdminTab('summary')} className={`px-5 py-2.5 text-xs font-extrabold rounded-lg whitespace-nowrap transition-colors ${adminTab === 'summary' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>Summary</button>
            <button onClick={() => setAdminTab('feedback')} className={`px-5 py-2.5 text-xs font-extrabold rounded-lg whitespace-nowrap transition-colors ${adminTab === 'feedback' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>Feedback</button>
            <button onClick={() => setAdminTab('users')} className={`px-5 py-2.5 text-xs font-extrabold rounded-lg whitespace-nowrap transition-colors ${adminTab === 'users' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>Users</button>
          </div>

          {adminTab === 'live' && (
            <div className="space-y-5">
              {live.length === 0 ? <div className="text-center bg-gray-800/50 p-10 rounded-2xl border border-gray-800"><p className="text-gray-500 font-bold">No active orders right now.</p></div> : live.map(o => (
                <div key={o.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden">
                  {o.mcdNotified && <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">MCD READY</div>}
                  <div className="flex justify-between items-start mb-3 border-b border-gray-700 pb-3">
                    <div>
                      <h3 className="font-black text-xl text-yellow-400">#{o.id}</h3>
                      <div className="flex items-center mt-1.5">
                        <p className="text-xs font-medium text-gray-300">{o.userDetails?.nickname || 'Unknown'} • {o.userDetails?.whatsapp || 'Unknown'}</p>
                        {o.userDetails?.whatsapp && (
                          <a href={getWhatsAppLink(o.userDetails.whatsapp)} target="_blank" rel="noopener noreferrer" className="ml-3 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center transition shadow-sm">
                            <MessageCircle size={12} className="mr-1"/> Chat
                          </a>
                        )}
                      </div>
                    </div>
                    <span className="bg-gray-900 border border-gray-700 text-gray-300 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">{o.status}</span>
                  </div>
                  <div className="text-sm space-y-2 mb-5">
                    <div className="flex justify-between bg-gray-900/50 p-2 rounded"><span className="text-gray-400">Menu:</span><span className="font-bold text-white">{o.restaurant === 'foodtruck' ? 'FOOD TRUCK' : (o.restaurant || '').toUpperCase()}</span></div>
                    <div className="flex justify-between bg-gray-900/50 p-2 rounded"><span className="text-gray-400">Total:</span><span className="font-extrabold text-green-400">RM {(o.total || 0).toFixed(2)}</span></div>
                    
                    {o.restaurant === 'foodtruck' && o.ftOrderText && <div className="bg-gray-950 p-3 rounded-lg mt-2 border border-gray-800 text-xs text-gray-300 whitespace-pre-line leading-relaxed font-mono">{o.ftOrderText}</div>}
                    {o.remarks && <div className="mt-3 bg-yellow-900/20 p-3 rounded-lg border border-yellow-900/50"><p className="text-xs text-yellow-400 font-bold mb-1">Remarks:</p><p className="text-sm text-yellow-200 italic">{o.remarks}</p></div>}

                    <div className="flex space-x-3 mt-4 pt-2">
                      {o.paymentReceipt && <a href={o.paymentReceipt} download={`Pay_${o.id}.jpg`} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center transition"><Download size={14} className="mr-1.5"/> Receipt</a>}
                      {o.mcdReceipt && <a href={o.mcdReceipt} download={`McD_${o.id}.jpg`} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center transition"><Download size={14} className="mr-1.5"/> McD Image</a>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-700">
                    {o.status === 'pending' && <button onClick={() => updateOrderStatus(o.id, 'received')} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-extrabold transition shadow-md">Receive Order</button>}
                    {o.status === 'received' && <button onClick={() => updateOrderStatus(o.id, 'delivering')} className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-extrabold transition shadow-md">Start Delivery</button>}
                    {o.status === 'delivering' && <button onClick={() => updateOrderStatus(o.id, 'arrived')} className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-xl font-extrabold transition shadow-[0_0_15px_rgba(34,197,94,0.4)]">Complete (Arrived)</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {adminTab === 'history' && (
            <div className="space-y-4 relative">
              <h3 className="font-extrabold text-gray-500 text-xs uppercase tracking-widest mb-3">Completed Orders Archive</h3>
              {pastOrders.length === 0 ? <div className="text-center bg-gray-800/50 p-10 rounded-2xl border border-gray-800"><p className="text-gray-500 font-bold">No completed orders yet.</p></div> : (
                pastOrders.map(order => (
                  <div key={order.id} onClick={() => setSelectedHistoryOrder(order)} className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-750 hover:border-gray-500 transition shadow-sm">
                    <div>
                      <p className="font-black text-yellow-500 text-lg">#{order.id} <span className="text-gray-500 text-[10px] font-bold ml-2 bg-gray-900 px-2 py-0.5 rounded uppercase">{(order.restaurant || '').toUpperCase()}</span></p>
                      <p className="text-xs font-medium text-gray-400 mt-1.5">{new Date(order.date).toLocaleDateString()} • <span className="text-gray-300">{order.userDetails?.nickname || 'Unknown'}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-green-400 text-lg">RM {(order.total || 0).toFixed(2)}</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">View Details ➔</p>
                    </div>
                  </div>
                ))
              )}
              
              {selectedHistoryOrder && (
                 <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-8 rounded-3xl w-full max-w-sm border border-gray-600 relative shadow-2xl overflow-y-auto max-h-[90vh]">
                       <button onClick={() => setSelectedHistoryOrder(null)} className="absolute top-5 right-5 text-gray-400 hover:text-white bg-gray-700 p-1.5 rounded-full transition"><X size={20}/></button>
                       <h3 className="text-2xl font-black text-white mb-6 border-b border-gray-700 pb-3">Order #{selectedHistoryOrder.id}</h3>
                       
                       <div className="space-y-3 text-sm text-gray-300 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                          <p className="flex justify-between"><span className="text-gray-500">Date:</span> <span className="font-medium text-white">{new Date(selectedHistoryOrder.date).toLocaleString([], {year:'numeric', month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span></p>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                            <span className="text-gray-500">Customer:</span> 
                            <div className="text-right">
                              <span className="font-bold text-white block">{selectedHistoryOrder.userDetails?.nickname || 'Unknown'}</span>
                              <span className="text-xs text-gray-400 block">{selectedHistoryOrder.userDetails?.whatsapp || 'Unknown'}</span>
                            </div>
                          </div>
                          {selectedHistoryOrder.userDetails?.whatsapp && (
                            <a href={getWhatsAppLink(selectedHistoryOrder.userDetails.whatsapp)} target="_blank" rel="noopener noreferrer" className="mt-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center transition w-full">
                              <MessageCircle size={14} className="mr-2"/> Chat with Customer
                            </a>
                          )}
                       </div>

                       <div className="bg-gray-950 p-5 rounded-xl mt-5 mb-5 border border-gray-800 shadow-inner">
                         <p className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest border-b border-gray-800 pb-2">Order Items</p>
                         {selectedHistoryOrder.restaurant === 'mcd' ? (
                            <p className="text-sm font-medium text-gray-300 leading-relaxed">{selectedHistoryOrder.mcdOrderType === 'help' ? selectedHistoryOrder.mcdOrderText : 'User self-ordered on McD App.'}</p>
                         ) : selectedHistoryOrder.restaurant === 'foodtruck' ? (
                            <p className="text-sm font-mono text-gray-300 whitespace-pre-line">{selectedHistoryOrder.ftOrderText}</p>
                         ) : (
                            <ul className="text-sm space-y-2 text-gray-300">
                              {selectedHistoryOrder.sushiOrderDetails && Object.entries(selectedHistoryOrder.sushiOrderDetails).map(([id, qty]) => {
                                 const item = SUSHI_MENU.find(i => i.id === id);
                                 return <li key={id} className="flex justify-between items-center border-b border-gray-800 pb-1"><span>{item?.name}</span> <span className="text-red-500 font-black bg-red-500/10 px-2 py-0.5 rounded">x{qty}</span></li>
                              })}
                            </ul>
                         )}
                         {selectedHistoryOrder.remarks && <div className="mt-4 bg-yellow-900/20 p-3 rounded border border-yellow-900/50"><p className="text-[10px] text-yellow-500 font-bold uppercase mb-1">Remarks:</p><p className="text-sm text-yellow-200 italic">{selectedHistoryOrder.remarks}</p></div>}
                       </div>

                       <div className="space-y-2">
                          <div className="flex justify-between text-sm bg-gray-900 p-3 rounded-lg"><span className="text-gray-400 font-medium">Food Total</span><span className="font-bold text-white">RM {(selectedHistoryOrder.foodTotal || 0).toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm bg-gray-900 p-3 rounded-lg"><span className="text-gray-400 font-medium">Delivery Fee</span><span className="font-bold text-white">RM {(selectedHistoryOrder.deliveryFee || 0).toFixed(2)}</span></div>
                          <div className="flex justify-between text-lg mt-2 p-4 bg-gray-800 border-2 border-green-500/30 rounded-xl"><span className="text-white font-black">Grand Total</span><span className="text-2xl font-black text-green-400">RM {(selectedHistoryOrder.total || 0).toFixed(2)}</span></div>
                       </div>

                       {(selectedHistoryOrder.paymentReceipt || selectedHistoryOrder.mcdReceipt) && (
                          <div className="mt-6 flex space-x-3">
                            {selectedHistoryOrder.paymentReceipt && (
                              <a href={selectedHistoryOrder.paymentReceipt} download={`Payment_${selectedHistoryOrder.id}.jpg`} className="flex-1 flex justify-center items-center bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-3 rounded-xl transition shadow-md">
                                <Download size={14} className="mr-1.5"/> Payment
                              </a>
                            )}
                            {selectedHistoryOrder.mcdReceipt && (
                              <a href={selectedHistoryOrder.mcdReceipt} download={`McD_${selectedHistoryOrder.id}.jpg`} className="flex-1 flex justify-center items-center bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-3 rounded-xl transition shadow-md">
                                <Download size={14} className="mr-1.5"/> McD Info
                              </a>
                            )}
                          </div>
                       )}
                    </div>
                 </div>
              )}
            </div>
          )}
          {adminTab === 'summary' && (() => {
            const now = new Date();
            const todayDateStr = now.toDateString();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            let todayOrders = 0; let todayDeliveryRevenue = 0; let monthOrders = 0; let monthDeliveryRevenue = 0;

            orders.forEach(o => {
              const oDate = new Date(o.date);
              if (oDate.toDateString() === todayDateStr) { todayOrders++; todayDeliveryRevenue += o.deliveryFee || 0; }
              if (oDate.getMonth() === currentMonth && oDate.getFullYear() === currentYear) { monthOrders++; monthDeliveryRevenue += o.deliveryFee || 0; }
            });

            return (
              <div className="space-y-5">
                <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 rounded-3xl shadow-xl border border-red-500 relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10"><BarChart3 size={120}/></div>
                  <h3 className="text-red-200 font-extrabold text-xs uppercase tracking-widest mb-2 relative z-10">Today's Delivery Earnings</h3>
                  <p className="text-5xl font-black text-white relative z-10">RM {todayDeliveryRevenue.toFixed(2)}</p>
                  <div className="mt-5 flex items-center text-red-100 text-sm font-bold bg-red-900/30 w-max px-3 py-1.5 rounded-lg relative z-10"><Truck size={16} className="mr-2" /> {todayOrders} Deliveries today</div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-md"><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Monthly Delivery RM</p><p className="text-3xl font-black text-green-400">RM {monthDeliveryRevenue.toFixed(2)}</p></div>
                  <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-md"><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Monthly Orders</p><p className="text-3xl font-black text-white">{monthOrders}</p></div>
                </div>
                <button onClick={downloadSummary} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-5 rounded-2xl shadow-lg flex justify-center items-center transition"><Download className="mr-2" size={20} /> Download Monthly Summary CSV</button>
              </div>
            );
          })()}
          
          {adminTab === 'feedback' && (
            <div className="space-y-5">
              <button onClick={downloadFeedback} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl shadow-md flex justify-center items-center transition"><Download size={18} className="mr-2"/> Export Feedback Data</button>
              {feedbacks.length === 0 ? <div className="text-center bg-gray-800/50 p-10 rounded-2xl border border-gray-800"><p className="text-gray-500 font-bold">No feedback yet.</p></div> : feedbacks.map((f, i) => (
                <div key={i} className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-md relative">
                  <p className="text-[10px] font-bold text-gray-500 absolute top-5 right-5 bg-gray-900 px-2 py-1 rounded">{new Date(f.date).toLocaleDateString()}</p>
                  <p className="font-black text-blue-400 text-lg mb-0.5">{f.user}</p>
                  <p className="text-xs font-medium text-gray-400 mb-4">{f.phone}</p>
                  <div className="text-gray-200 bg-gray-900 p-4 rounded-xl italic border-l-4 border-blue-500 font-medium">"{f.text}"</div>
                </div>
              ))}
            </div>
          )}

          {adminTab === 'users' && (() => {
             const userStats = getUserStats();
             return (
               <div className="space-y-5">
                 <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-8 rounded-3xl shadow-xl relative overflow-hidden">
                   <div className="absolute right-[-20px] top-[-20px] opacity-10"><Users size={150}/></div>
                   <h3 className="text-indigo-200 font-extrabold text-xs uppercase tracking-widest mb-2 relative z-10">Total Unique Users</h3>
                   <p className="text-5xl font-black text-white relative z-10">{userStats.length}</p>
                 </div>
                 <button onClick={downloadUsers} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-4 rounded-xl shadow-md flex justify-center items-center transition"><Download size={18} className="mr-2"/> Export User Analytics CSV</button>
                 
                 <div className="space-y-4">
                   {userStats.map((u, i) => (
                     <div key={i} className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-md relative">
                       <button onClick={() => hideUserFromAdmin(u.phone)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition bg-gray-900 p-1.5 rounded-full" title="Hide User"><X size={14}/></button>
                       <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3 pr-8">
                         <span className="font-black text-white text-lg flex items-center"><User size={16} className="mr-2 text-indigo-400"/>{u.nickname}</span>
                         <span className="text-xs font-bold text-gray-400 bg-gray-900 px-2 py-1 rounded">{u.phone}</span>
                       </div>
                       <div className="grid grid-cols-2 gap-3 text-sm">
                         <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                           <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Orders</p>
                           <p className="font-black text-white text-xl">{u.orders}</p>
                         </div>
                         <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                           <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Spent</p>
                           <p className="font-black text-green-400 text-xl">RM {(u.foodSpent + u.deliverySpent).toFixed(2)}</p>
                         </div>
                       </div>
                       <div className="flex justify-between mt-3 text-xs font-medium text-gray-400 px-1">
                         <span>Food: RM {u.foodSpent.toFixed(2)}</span>
                         <span>Delivery: RM {u.deliverySpent.toFixed(2)}</span>
                       </div>
                       <div className="mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center bg-gray-900 py-1.5 rounded">Last Order: {new Date(u.lastOrder).toLocaleDateString()}</div>
                     </div>
                   ))}
                 </div>
               </div>
             );
          })()}
        </div>
      </div>
    );
  };

  const renderSellerPortal = () => {
    const live = orders.filter(o => o.restaurant === 'sushi' && o.status !== 'arrived');
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white pb-32 animate-fadeIn relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black border-b border-gray-800 pb-5 mb-6 flex items-center text-red-500 tracking-tight"><Store className="mr-3"/> Nuriman Sushi</h2>
          <div className="space-y-5">
            {live.length === 0 ? <div className="text-center bg-gray-800/50 p-10 rounded-2xl border border-gray-800"><p className="text-gray-500 font-bold">No active orders right now.</p></div> : live.map(o => (
              <div key={o.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
                  <h3 className="font-black text-xl text-white">Order #{o.id}</h3>
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider ${o.sellerStatus === 'ready' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : o.sellerStatus === 'preparing' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-gray-900 text-gray-400 border border-gray-700'}`}>{o.sellerStatus || 'Pending'}</span>
                </div>
                <ul className="text-sm space-y-2 mb-5 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  {Object.entries(o.sushiOrderDetails || {}).map(([id, q]) => (
                    <li key={id} className="flex justify-between items-center border-b border-gray-800/50 pb-2 last:border-0 last:pb-0">
                      <span className="font-medium text-gray-300">{SUSHI_MENU.find(i=>i.id===id)?.name}</span>
                      <span className="font-black text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md">x{q}</span>
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => updateSellerStatus(o.id, 'preparing')} disabled={o.sellerStatus === 'preparing' || o.sellerStatus === 'ready'} className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 py-4 rounded-xl font-extrabold text-xs transition shadow-md disabled:shadow-none">Preparing Food</button>
                  <button onClick={() => updateSellerStatus(o.id, 'ready')} disabled={o.sellerStatus === 'ready'} className="bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 py-4 rounded-xl font-extrabold text-xs transition shadow-md disabled:shadow-none">Ready for Pickup</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center relative bg-batik font-sans">
      <div className="w-full max-w-md bg-white sm:rounded-[2rem] shadow-2xl overflow-hidden relative h-[100dvh] sm:h-[850px] border border-gray-200">
        {view !== 'auth' && view !== 'welcome' && view !== 'user_orders' && view !== 'seller' && view !== 'admin' && (
          <div className="bg-gradient-to-r from-red-700 to-red-600 p-5 flex items-center justify-between text-white shadow-md z-10 relative border-b-4 border-orange-500">
            <div className="flex items-center font-black cursor-pointer tracking-tight text-lg" onClick={() => secretTap >= 4 ? (setShowSecretModal(true), setSecretTap(0)) : setSecretTap(s => s + 1)}><Bike className="mr-2" size={22} strokeWidth={2.5} /> UBite</div>
            <div className="text-[10px] font-black bg-red-900/50 border border-red-500/50 px-3 py-1.5 rounded-full uppercase tracking-widest">{view === 'status' ? 'Status' : 'Ordering'}</div>
          </div>
        )}
        <div className="overflow-y-auto h-full pb-24 scroll-smooth bg-white/95 backdrop-blur-sm">
          {view === 'auth' && renderAuth()}
          {view === 'welcome' && renderWelcome()}
          {view === 'user_orders' && renderUserOrders()}
          {view === 'details' && (
            <div className="p-6 space-y-6 animate-fadeIn pb-24">
              <h2 className="text-2xl font-extrabold text-gray-900 border-b-2 border-red-200 pb-2">Confirm Details</h2>
              <div className="space-y-5 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div><label className="block text-sm font-extrabold text-gray-800 mb-2">Nickname</label><div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"><span className="p-4 bg-gray-50 text-gray-400 border-r border-gray-100"><User size={20}/></span><input type="text" className="w-full p-4 outline-none font-bold text-gray-700" value={userDetails.nickname} readOnly /></div></div>
                <div>
                  <label className="block text-sm font-extrabold text-gray-800 mb-2">WhatsApp Number</label>
                  <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"><span className="p-4 bg-gray-50 text-gray-400 border-r border-gray-100"><Phone size={20}/></span><input type="tel" className="w-full p-4 outline-none font-bold text-gray-700" value={userDetails.whatsapp} readOnly /></div>
                  {!currentUser && <p className="text-xs text-red-500 mt-2 ml-1 font-bold">* Must be an active WhatsApp number</p>}
                </div>
              </div>
              <button onClick={() => setView('restaurant')} className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white font-extrabold py-5 rounded-xl shadow-lg border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all text-lg">Continue to Menu</button>
              <button onClick={() => setView('welcome')} className="w-full py-4 text-gray-600 hover:text-red-600 transition font-bold bg-white rounded-xl shadow-sm border border-gray-200">Back to Home</button>
            </div>
          )}
          {view === 'restaurant' && renderRestaurantSelector()}
          {view === 'mcd' && renderMcdFlow()}
          {view === 'foodtruck' && renderFoodTruckFlow()}
          {view === 'sushi' && renderSushiFlow()}
          {view === 'checkout' && renderCheckout()}
          {view === 'status' && renderStatus()}
          {view === 'admin' && renderAdminPortal()}
          {view === 'seller' && renderSellerPortal()}
        </div>
        {view !== 'auth' && view !== 'seller' && view !== 'admin' && (
          <a href="https://wa.me/601120365995?text=%5BUBite%5D%2C%20I%20have%20a%20question" target="_blank" rel="noopener noreferrer" className="absolute bottom-10 right-6 bg-gradient-to-tr from-green-500 to-green-400 text-white p-4 rounded-full shadow-[0_10px_25px_-5px_rgba(34,197,94,0.5)] hover:scale-110 active:scale-95 transition-all z-[150]"><MessageCircle size={28} className="animate-pulse" /></a>
        )}
        {toastMessage && <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-[90%] bg-gray-900/95 backdrop-blur-md text-white font-extrabold tracking-wide text-center py-4 px-5 rounded-2xl shadow-2xl z-[200] text-sm animate-fadeIn border border-gray-700">{toastMessage}</div>}
        
        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="absolute inset-0 z-[300] bg-black/80 flex items-center justify-center p-4">
             <div className="bg-white p-6 rounded-xl w-full max-w-xs shadow-2xl animate-fadeIn">
                <h3 className="font-bold text-lg mb-2 text-gray-800 tracking-tight">Your Feedback</h3>
                <p className="text-xs text-gray-500 mb-4">Let us know how we did or what we can improve!</p>
                <textarea rows="4" className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 ring-blue-500" placeholder="Type your feedback here..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)}></textarea>
                <div className="flex space-x-2">
                  <button onClick={() => { setShowFeedbackModal(false); setFeedbackText(''); }} className="flex-1 p-3 bg-gray-100 rounded-lg font-bold text-gray-700">Cancel</button>
                  <button 
                    onClick={handleFeedbackSubmit} 
                    disabled={isProcessing}
                    className={`flex-1 p-3 bg-blue-600 rounded-lg font-bold text-white ${isProcessing ? 'opacity-50' : ''}`}
                  >
                    {isProcessing ? 'Wait...' : 'Submit'}
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* Secret Login Modal */}
        {showSecretModal && (
          <div className="absolute inset-0 z-[300] bg-black/80 flex items-center justify-center p-4">
             <div className="bg-white p-6 rounded-xl w-full max-w-xs shadow-2xl animate-fadeIn">
                <h3 className="font-bold text-lg mb-4 text-gray-800 tracking-tight">Staff Login</h3>
                <input type="text" placeholder="Username" value={staffUsername} onChange={e => setStaffUsername(e.target.value)} className="w-full p-3 border rounded-lg mb-3 outline-none focus:ring-2 ring-red-500" />
                <input type="password" placeholder="Password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 ring-red-500" />
                <div className="flex space-x-2">
                  <button onClick={() => (setShowSecretModal(false), setStaffUsername(''), setStaffPassword(''))} className="flex-1 p-3 bg-gray-100 rounded-lg font-bold text-gray-700">Cancel</button>
                  <button onClick={() => {
                     if (staffUsername === 'CTL' && staffPassword === '0516') { setView('admin'); setAdminTab('live'); setShowSecretModal(false); setStaffUsername(''); setStaffPassword(''); }
                     else if (staffUsername === 'sushi' && staffPassword === 'sushi') { setView('seller'); setSellerTab('live'); setShowSecretModal(false); setStaffUsername(''); setStaffPassword(''); }
                     else { showToast("Invalid Credentials"); }
                  }} className="flex-1 p-3 bg-red-600 rounded-lg font-bold text-white">Enter</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UBiteApp;