import React, { useState, useEffect } from 'react';
import { ShoppingBag, Bike, MapPin, Phone, User, CheckCircle, Info, Upload, Store, ShieldAlert, Clock, CreditCard, MessageCircle, LayoutDashboard, History, BarChart3, Package, Truck, Home, ChevronRight, Download, X, LogOut, ListOrdered } from 'lucide-react';

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

const UBiteApp = () => {
  const [tailwindLoaded, setTailwindLoaded] = useState(false);

  // --- AUTO-INJECT TAILWIND ---
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
    `;
    document.head.appendChild(style);
  }, []);

  // --- APP STATE ---
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [isShopLoaded, setIsShopLoaded] = useState(false);
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

    return () => { unsubscribeOrders(); unsubscribeSettings(); };
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
        window.location.hash = ''; // Clear hash so it doesn't loop
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // --- LOGIC & CUSTOM AUTH ---
  const handleSignUp = async () => {
    if (!authUsername || !authPassword || !authPhone) return showToast("Please fill all fields");
    const cleanUsername = authUsername.trim();
    const userData = { username: cleanUsername, phone: authPhone, password: authPassword };
    
    try {
      if (db && user) {
        const userRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'ubite_users'), cleanUsername.toLowerCase());
        const existing = await getDoc(userRef);
        if (existing.exists()) return showToast("Username already taken! Try another.");
        await setDoc(userRef, userData);
      } else {
        const localUsers = JSON.parse(localStorage.getItem('ubite_users_db') || '{}');
        if (localUsers[cleanUsername.toLowerCase()]) return showToast("Username already taken! Try another.");
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
    }
  };

  const handleLogin = async () => {
    if (!authUsername || !authPassword) return showToast("Please fill all fields");
    const cleanUsername = authUsername.trim();

    try {
      if (db && user) {
        const userRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'ubite_users'), cleanUsername.toLowerCase());
        const existing = await getDoc(userRef);
        if (!existing.exists()) return showToast("User not found. Please Sign Up first.");
        if (existing.data().password !== authPassword) return showToast("Incorrect password.");
        
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
        if (!existingUser) return showToast("User not found. Please Sign Up first.");
        if (existingUser.password !== authPassword) return showToast("Incorrect password.");
        
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
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ubite_user');
    setView('auth');
  };

  const calculateMcdFee = (items) => {
    if (items <= 3) return 2.00;
    if (items <= 6) return 3.50;
    if (items <= 9) return 5.00;
    return 6.00;
  };
  const calculateSushiItemsCount = () => Object.values(sushiOrder).reduce((s, q) => s + q, 0);
  const calculateSushiFee = () => {
    const count = calculateSushiItemsCount();
    return count === 0 ? 0 : Math.ceil(count / 3) * 1.50;
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

    const deliveryFee = restaurant === 'mcd' ? calculateMcdFee(mcdItemCount) : calculateSushiFee();
    const foodTotal = restaurant === 'sushi' ? calculateSushiFoodTotal() : 0; 
    const now = new Date();
    const orderId = `${String(now.getDate()).padStart(2,'0')}${String(now.getMonth()+1).padStart(2,'0')}${String(orders.length + 1).padStart(2,'0')}`;
    const finalUserDetails = currentUser ? { nickname: currentUser.username, whatsapp: currentUser.phone } : userDetails;

    const newOrder = {
      id: orderId, date: now.toISOString(), userDetails: finalUserDetails, restaurant, mcdOrderType,
      sushiOrderDetails: restaurant === 'sushi' ? { ...sushiOrder } : null,
      mcdOrderText: restaurant === 'mcd' && mcdOrderType === 'help' ? mcdOrderText : null,
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

  const showToast = (m) => { setToastMessage(m); setTimeout(() => setToastMessage(''), 3000); };

  if (!tailwindLoaded || view === 'loading') return <div className="flex items-center justify-center h-screen bg-gray-50 font-bold">Loading UBite...</div>;

  // --- UI COMPONENTS ---
  const renderAuth = () => (
    <div className="p-8 flex flex-col items-center justify-center min-h-[80vh] animate-fadeIn">
      <div className="bg-red-600 p-4 rounded-full text-white shadow-lg mb-6"><Bike size={50} /></div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">UBite</h1>
      <p className="text-red-600 font-bold mb-8 text-sm">Sign in to track your orders</p>
      
      <div className="w-full space-y-4">
        <input type="text" placeholder="Username" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full p-4 rounded-xl border border-gray-300 outline-none focus:ring-2 ring-red-500"/>
        {authMode === 'signup' && <input type="tel" placeholder="WhatsApp Number" value={authPhone} onChange={e => setAuthPhone(e.target.value)} className="w-full p-4 rounded-xl border border-gray-300 outline-none focus:ring-2 ring-red-500"/>}
        <input type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full p-4 rounded-xl border border-gray-300 outline-none focus:ring-2 ring-red-500"/>
        <button onClick={authMode === 'login' ? handleLogin : handleSignUp} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition active:scale-95">{authMode === 'login' ? 'Login' : 'Create Account'}</button>
      </div>

      <p className="mt-6 text-sm text-gray-500 font-medium">
        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
        <span onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthUsername(''); setAuthPassword(''); setAuthPhone(''); }} className="text-red-600 font-bold cursor-pointer">{authMode === 'login' ? "Sign Up" : "Login"}</span>
      </p>

      <div className="absolute bottom-6 text-xs text-gray-400 cursor-pointer hover:text-red-500 transition" onClick={() => setShowSecretModal(true)}>Staff Login</div>
    </div>
  );

  const renderWelcome = () => (
    <div className="flex flex-col items-center text-center p-6 space-y-6 animate-fadeIn">
      {currentUser && (
        <div className="w-full flex justify-between items-center text-sm font-bold text-gray-600 mb-2">
          <span>Hi, {currentUser.username}! 👋</span>
          <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700"><LogOut size={16} className="mr-1"/> Logout</button>
        </div>
      )}
      <div className="bg-red-600 p-4 rounded-full text-white shadow-lg"><Bike size={64} /></div>
      <h1 className="text-4xl font-extrabold text-gray-900 cursor-pointer select-none" onClick={() => secretTap >= 4 ? (setShowSecretModal(true), setSecretTap(0)) : setSecretTap(s => s + 1)}>UBite</h1>
      <p className="text-xl font-bold text-red-600 italic">"U order, I bike, U Bite"</p>
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider"><b>U</b>niversity <b>B</b>ased <b>I</b>nnovative <b>T</b>asty <b>E</b>xpress</p>

      {currentUser && (
        <button onClick={() => setView('user_orders')} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center"><ListOrdered size={18} className="mr-2" /> Track My Orders</button>
      )}

      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-left w-full mt-4">
        <h3 className="font-bold text-lg mb-2 flex items-center text-gray-800"><Info className="mr-2 text-yellow-600" size={20}/> Our Story</h3>
        <p className="text-gray-700 text-sm leading-relaxed">U.B.I.T.E was born to make your life easier. We pedal to save your time so you can focus on studies and rest.</p>
      </div>

      {!isShopLoaded ? (
        <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-4 rounded-xl flex justify-center items-center"><Clock className="mr-2 animate-spin" size={20} /> Checking Status...</button>
      ) : !isShopOpen ? (
        <div className="w-full bg-red-100 text-red-700 p-4 rounded-lg font-bold flex items-center justify-center shadow-inner"><Clock className="mr-2" /> UBite is currently CLOSED.</div>
      ) : (
        <button onClick={() => setView('details')} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 text-lg">Start Order</button>
      )}

      {/* Subtle Staff Link */}
      <div className="text-xs text-gray-400 cursor-pointer hover:text-red-500 transition mt-6" onClick={() => setShowSecretModal(true)}>
        Staff Login
      </div>
    </div>
  );

  const renderUserOrders = () => {
    const myOrders = orders.filter(o => o.userDetails.nickname === currentUser?.username);
    return (
      <div className="p-6 animate-fadeIn bg-gray-50 min-h-screen pb-24">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-6 flex items-center"><ListOrdered className="mr-2"/> My Orders</h2>
        <div className="space-y-4">
          {myOrders.length === 0 ? <p className="text-center text-gray-500 py-10">No orders yet.</p> : myOrders.map(order => (
            <div key={order.id} onClick={() => { setActiveUserOrderId(order.id); setView('status'); }} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">#{order.id}</h3>
                  <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()} • {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${order.status === 'arrived' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
              </div>
              <div className="text-sm text-gray-600 flex justify-between"><span>{order.restaurant.toUpperCase()}</span><span className="font-bold text-gray-900">RM {order.total.toFixed(2)}</span></div>
            </div>
          ))}
        </div>
        <button onClick={() => setView('welcome')} className="w-full py-4 text-gray-500 font-semibold underline mt-6">Back to Home</button>
      </div>
    );
  };

  const renderRestaurantSelector = () => (
    <div className="p-6 space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">What to eat?</h2>
      <div className="grid grid-cols-1 gap-4">
        <button onClick={() => { setRestaurant('mcd'); setView('mcd'); }} className="flex items-center p-4 bg-white border-2 border-yellow-400 rounded-xl shadow-sm hover:bg-yellow-50 text-left">
          <div className="bg-yellow-400 p-3 rounded-lg text-red-600 mr-4 font-bold text-2xl">M</div>
          <div><h3 className="text-xl font-bold text-gray-800">McDonald's</h3><p className="text-xs text-gray-500 mt-1">Hot burgers and fries, delivered straight to your block.</p></div>
        </button>
        <button onClick={() => { setRestaurant('sushi'); setView('sushi'); }} className="flex items-center p-4 bg-white border-2 border-red-200 rounded-xl shadow-sm hover:bg-red-50 text-left">
          <div className="bg-red-100 p-3 rounded-lg text-red-600 mr-4"><Store size={28} /></div>
          <div><h3 className="text-xl font-bold text-gray-800">Sushi Truck</h3><p className="text-xs text-gray-500 mt-1">No.1 Sushi Truck in KL.</p></div>
        </button>
      </div>
      <button onClick={() => setView('welcome')} className="w-full py-3 text-gray-500 font-semibold underline">Back</button>
    </div>
  );

  const renderMcdFlow = () => (
    <div className="p-6 space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-yellow-600 border-b pb-2 flex items-center">McDonald's Order</h2>
      <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start"><ShieldAlert className="text-red-600 mr-3 mt-1 shrink-0" size={20} /><p className="text-sm text-red-800 font-semibold">IMPORTANT: Sundae cones are NOT available for UBite delivery.</p></div>
      <div className="space-y-3">
        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${mcdOrderType === 'self' ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200' : 'bg-white border-gray-300'}`}>
          <input type="radio" checked={mcdOrderType === 'self'} onChange={() => setMcdOrderType('self')} /><div className="ml-3"><span className="block font-bold">I will order on the McD App</span></div>
        </label>
        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${mcdOrderType === 'help' ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200' : 'bg-white border-gray-300'}`}>
          <input type="radio" checked={mcdOrderType === 'help'} onChange={() => setMcdOrderType('help')} /><div className="ml-3"><span className="block font-bold">Please order for me</span></div>
        </label>
      </div>
      <div className="bg-white p-4 rounded-xl border space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Number of Items</label>
          <div className="flex items-center border rounded-lg w-max overflow-hidden"><button onClick={() => setMcdItemCount(Math.max(1, mcdItemCount - 1))} className="px-4 py-2 bg-gray-100 font-bold">-</button><span className="px-6 py-2 font-bold">{mcdItemCount}</span><button onClick={() => setMcdItemCount(mcdItemCount + 1)} className="px-4 py-2 bg-gray-100 font-bold">+</button></div>
        </div>
        {mcdOrderType === 'self' ? (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Upload McD Order Screenshot</label>
            <input type="file" id="mcd-upload" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setMcdReceipt)} />
            <label htmlFor="mcd-upload" className="border-2 border-dashed rounded-xl p-6 text-center bg-gray-50 cursor-pointer block hover:bg-gray-100">
              {mcdReceipt ? <div className="text-green-600 font-bold"><CheckCircle className="mx-auto mb-1"/> Screenshot Attached</div> : <div className="text-gray-400"><Upload className="mx-auto mb-1"/> Tap to upload screenshot</div>}
              <p className="text-xs text-red-500 mt-2 font-semibold">*Screenshot must show the collection Number</p>
            </label>
          </div>
        ) : (
          <textarea rows="4" className="w-full p-3 border rounded-lg outline-none focus:ring-2 ring-yellow-400" placeholder="e.g. 1x McChicken Set (Large)..." value={mcdOrderText} onChange={(e) => setMcdOrderText(e.target.value)}></textarea>
        )}
      </div>
      <button onClick={() => setView('checkout')} className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl shadow-md transition">Proceed to Payment</button>
      <button onClick={() => setView('restaurant')} className="w-full py-3 text-gray-500 underline">Back</button>
    </div>
  );

  const renderSushiFlow = () => {
    const displayed = SUSHI_MENU.filter(i => i.category === activeSushiCategory);
    return (
      <div className="p-6 space-y-4 animate-fadeIn bg-gray-50 pb-32">
        <div className="sticky top-0 bg-gray-50 pt-2 pb-4 z-10 border-b">
          <h2 className="text-2xl font-bold text-red-600">NURIMAN SUSHI</h2>
          <div className="flex overflow-x-auto space-x-2 mt-4 pb-2 scrollbar-hide">
            {SUSHI_CATEGORIES.map(c => (
              <button key={c} onClick={() => setActiveSushiCategory(c)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold ${activeSushiCategory === c ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border'}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {(CATEGORY_IMAGES[activeSushiCategory] || []).map((src, idx) => <img key={idx} src={src} className="w-full rounded-xl shadow-sm border" alt="menu"/>)}
          <h3 className="font-bold text-gray-800 border-b pb-2 mt-6">Select Quantities</h3>
          {displayed.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border shadow-sm">
              <div className="flex-1"><p className="text-[10px] font-bold text-gray-400">{item.code} • {item.pcs}</p><h4 className="font-bold text-gray-800 text-sm">{item.name}</h4><span className="font-bold text-red-600 text-sm">RM {item.price.toFixed(2)}</span></div>
              <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50 shrink-0">
                <button onClick={() => handleSushiChange(item.id, -1)} className="w-8 h-8 font-bold">-</button>
                <span className="w-7 text-center font-bold text-sm bg-white">{sushiOrder[item.id] || 0}</span>
                <button onClick={() => handleSushiChange(item.id, 1)} className="w-8 h-8 font-bold text-red-600">+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-20">
           <div className="max-w-md mx-auto flex space-x-3 items-center">
              <div className="flex-1 text-xs font-bold">Total: {calculateSushiItemsCount()} items (RM {calculateSushiFoodTotal().toFixed(2)})</div>
              <button onClick={() => setView('restaurant')} className="px-4 py-3 bg-gray-100 rounded-xl font-bold">Back</button>
              <button disabled={calculateSushiItemsCount() === 0} onClick={() => setView('checkout')} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">Checkout</button>
           </div>
        </div>
      </div>
    );
  };

  const renderCheckout = () => {
    const fee = restaurant === 'mcd' ? calculateMcdFee(mcdItemCount) : calculateSushiFee();
    const food = restaurant === 'sushi' ? calculateSushiFoodTotal() : 0;
    return (
      <div className="p-6 space-y-6 animate-fadeIn pb-24">
        <h2 className="text-2xl font-bold border-b pb-2">Checkout</h2>
        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-3">
          <h3 className="font-bold border-b pb-2 flex items-center"><ShoppingBag size={18} className="mr-2 text-gray-500" /> Order Summary</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span>Restaurant</span><span className="font-semibold">{restaurant.toUpperCase()}</span></div>
            {restaurant === 'sushi' && <div className="flex justify-between pt-2 border-t"><span>Food Price</span><span>RM {food.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span>Delivery Fee</span><span>RM {fee.toFixed(2)}</span></div>
          </div>
          <div className="flex justify-between text-lg font-black text-red-600 border-t pt-3 mt-3"><span>Total to Pay:</span><span>RM {(fee + food).toFixed(2)}</span></div>
        </div>
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-sm">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center"><CreditCard size={18} className="mr-2" /> Bank Information</h3>
          <div className="bg-white p-4 rounded-lg border text-center mb-4">
            <img src="https://i.imgur.com/EMu0dwD.jpeg" alt="QR" className="w-48 mx-auto rounded-lg border mb-2"/>
            <p className="text-sm font-mono bg-gray-100 py-1 px-2 rounded mt-1 border inline-block">RHB: 1-58093-0012584-0</p>
            <p className="text-xs text-gray-500 mt-1 font-bold">CHUAH TIONG LI</p>
          </div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Upload Receipt (Required)</label>
          <input type="file" id="pay-upload" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setPaymentReceipt)} />
          <label htmlFor="pay-upload" className="block border-2 border-dashed border-blue-300 bg-white rounded-xl p-4 text-center cursor-pointer">
            {paymentReceipt ? <div className="text-green-600 font-bold"><CheckCircle size={20} className="mx-auto mb-1"/> Receipt Attached</div> : <div className="text-blue-800 font-bold"><Upload size={20} className="mx-auto mb-1"/> Click to upload</div>}
          </label>
        </div>
        <button onClick={handleCheckout} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition">Send Order</button>
        <button onClick={() => setView(restaurant)} className="w-full py-3 text-gray-500 underline">Back</button>
      </div>
    );
  };

  const renderStatus = () => {
    const current = orders.find(o => o.id === activeUserOrderId);
    if (!current) return null;
    const statuses = ['pending', 'received', 'delivering', 'arrived'];
    const idx = statuses.indexOf(current.status);
    return (
      <div className="p-6 space-y-6 animate-fadeIn text-center">
        <h2 className="text-2xl font-extrabold border-b pb-4">Live Tracker</h2>
        <p className="text-gray-500 text-sm font-bold">Order ID: #{current.id}</p>
        <div className="bg-white p-6 rounded-xl border text-left mt-6 relative">
          <div className="absolute left-10 top-10 bottom-10 w-1 bg-gray-100"></div>
          <div className="relative z-10 space-y-8">
            <div className={`flex items-center ${idx >= 0 ? 'opacity-100' : 'opacity-40'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${idx >= 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}><Clock size={20}/></div><div className="ml-4"><p className="font-bold">Order Sent</p></div></div>
            <div className={`flex items-center ${idx >= 1 ? 'opacity-100' : 'opacity-40'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${idx >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`}><Package size={20}/></div><div className="ml-4"><p className="font-bold">Received by Admin</p></div></div>
            <div className={`flex items-center ${idx >= 2 ? 'opacity-100' : 'opacity-40'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${idx >= 2 ? 'bg-purple-500' : 'bg-gray-300'}`}><Truck size={20}/></div><div className="ml-4"><p className="font-bold">Delivering</p></div></div>
            <div className={`flex items-center ${idx >= 3 ? 'opacity-100' : 'opacity-40'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${idx >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}><Home size={20}/></div><div className="ml-4"><p className="font-bold">Arrived</p></div></div>
          </div>
        </div>
        
        {current.restaurant === 'mcd' && current.mcdOrderType === 'self' && idx < 2 && (
          <div className="mt-6 bg-yellow-50 p-6 rounded-xl border-2 border-yellow-400 shadow-md">
            <h3 className="font-bold text-yellow-800 mb-2">Have you ordered on the McD App?</h3>
            <p className="text-xs text-yellow-700 mb-4">Click the button below ONLY when your McDonald's app says the food is ready for pickup.</p>
            <button 
              disabled={current.mcdNotified}
              onClick={async () => {
                 showToast("Notification sent! Rider is heading to the counter.");
                 notifyPhone(`🏃 URGENT:\nMcD User ${current.userDetails.nickname} says food is ready for pickup!`);
                 if (db && user) {
                   await updateDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'ubite_orders'), String(current.id)), { mcdNotified: true });
                 } else {
                   setOrders(orders.map(o => o.id === current.id ? { ...o, mcdNotified: true } : o));
                 }
              }}
              className={`w-full ${current.mcdNotified ? 'bg-gray-400 cursor-not-allowed text-gray-700' : 'bg-yellow-500 hover:bg-yellow-600 text-black active:scale-95'} font-extrabold py-4 px-2 rounded-xl shadow transition transform flex justify-center items-center`}
            ><Bike className="mr-2" /> {current.mcdNotified ? 'Rider Notified!' : 'Notify Rider: Food is Ready!'}</button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button onClick={() => { setView('user_orders'); setActiveUserOrderId(null); setSushiOrder({}); setPaymentReceipt(null); setMcdReceipt(null); }} className="w-full bg-gray-200 text-gray-800 font-bold py-4 rounded-xl shadow-sm">Back to My Orders</button>
          {idx === 3 && <button onClick={() => { setView('welcome'); setActiveUserOrderId(null); setSushiOrder({}); setPaymentReceipt(null); setMcdReceipt(null); }} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-md">Order Again</button>}
        </div>
      </div>
    );
  };

  const renderAdminPortal = () => {
    const live = orders.filter(o => o.status !== 'arrived');
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white pb-32 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
          <h2 className="text-xl font-bold flex items-center text-red-400"><Store className="mr-2" /> Admin Panel</h2>
          <div className="flex space-x-2">
            <button onClick={toggleShopStatus} className={`px-3 py-1 rounded text-white font-bold text-xs ${isShopOpen ? 'bg-red-600' : 'bg-green-600'}`}>{isShopOpen ? 'Close Shop' : 'Open Shop'}</button>
            <button onClick={() => (window.location.hash='', setView('welcome'))} className="text-xs bg-gray-700 px-3 py-1 rounded font-bold">Exit</button>
          </div>
        </div>
        <div className="flex bg-gray-800 p-1 rounded-xl mb-6">
          <button onClick={() => setAdminTab('live')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${adminTab === 'live' ? 'bg-red-600' : 'text-gray-400'}`}>Live</button>
          <button onClick={() => setAdminTab('history')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${adminTab === 'history' ? 'bg-red-600' : 'text-gray-400'}`}>History</button>
          <button onClick={() => setAdminTab('summary')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${adminTab === 'summary' ? 'bg-red-600' : 'text-gray-400'}`}>Summary</button>
        </div>
        {adminTab === 'live' && (
          <div className="space-y-4">
            {live.length === 0 ? <p className="text-center text-gray-500 py-10">No active orders.</p> : live.map(o => (
              <div key={o.id} className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                <div className="flex justify-between items-start mb-2 border-b border-gray-700 pb-2">
                  <div><h3 className="font-bold text-yellow-400">#{o.id}</h3><p className="text-[10px] text-gray-400">{o.userDetails.nickname} • {o.userDetails.whatsapp}</p></div>
                  <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded uppercase">{o.status}</span>
                </div>
                <div className="text-sm space-y-1 mb-4">
                  <p><b>Restaurant:</b> {o.restaurant.toUpperCase()}</p>
                  <p><b>Total:</b> RM {o.total.toFixed(2)}</p>
                  <div className="flex space-x-2 mt-2">
                    {o.paymentReceipt && <a href={o.paymentReceipt} download={`Pay_${o.id}.jpg`} className="bg-gray-700 text-[10px] p-1.5 rounded flex items-center"><Download size={12} className="mr-1"/> Download Receipt</a>}
                    {o.mcdReceipt && <a href={o.mcdReceipt} download={`McD_${o.id}.jpg`} className="bg-gray-700 text-[10px] p-1.5 rounded flex items-center"><Download size={12} className="mr-1"/> Download McD</a>}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-3 border-t border-gray-700">
                  {o.status === 'pending' && <button onClick={() => updateOrderStatus(o.id, 'received')} className="w-full bg-blue-600 py-3 rounded-lg font-bold">Receive Order</button>}
                  {o.status === 'received' && <button onClick={() => updateOrderStatus(o.id, 'delivering')} className="w-full bg-purple-600 py-3 rounded-lg font-bold">Start Delivery</button>}
                  {o.status === 'delivering' && <button onClick={() => updateOrderStatus(o.id, 'arrived')} className="w-full bg-green-600 py-3 rounded-lg font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]">Complete (Arrived)</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSellerPortal = () => {
    const live = orders.filter(o => o.restaurant === 'sushi' && o.status !== 'arrived');
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white pb-32 animate-fadeIn">
        <h2 className="text-xl font-bold border-b border-gray-700 pb-4 mb-4 flex items-center text-red-400"><Store className="mr-2"/> Nuriman Sushi</h2>
        <div className="space-y-4">
          {live.length === 0 ? <p className="text-center text-gray-500 py-10">No active orders.</p> : live.map(o => (
            <div key={o.id} className="bg-gray-800 p-5 rounded-xl border border-gray-700">
              <div className="flex justify-between border-b border-gray-700 pb-2 mb-3">
                <h3 className="font-bold">Order #{o.id}</h3>
                <span className="text-[10px] font-bold bg-yellow-50 text-black px-2 py-1 rounded uppercase tracking-tighter">{o.sellerStatus || 'Pending'}</span>
              </div>
              <ul className="text-sm space-y-1 mb-4">
                {Object.entries(o.sushiOrderDetails || {}).map(([id, q]) => (
                  <li key={id} className="flex justify-between"><span>{SUSHI_MENU.find(i=>i.id===id)?.name}</span><span className="font-bold text-red-400">x{q}</span></li>
                ))}
              </ul>
              <div className="grid grid-cols-2 gap-2"><button onClick={() => updateSellerStatus(o.id, 'preparing')} className="bg-blue-600 py-3 rounded-lg font-bold text-xs">Preparing</button><button onClick={() => updateSellerStatus(o.id, 'ready')} className="bg-green-600 py-3 rounded-lg font-bold text-xs">Ready</button></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center relative">
      <div className="w-full max-w-md bg-white sm:rounded-3xl shadow-2xl overflow-hidden relative h-[100dvh] sm:h-[850px]">
        {view !== 'auth' && view !== 'welcome' && view !== 'user_orders' && view !== 'seller' && view !== 'admin' && (
          <div className="bg-red-600 p-4 flex items-center justify-between text-white shadow-md z-10 relative">
            <div className="flex items-center font-bold cursor-pointer" onClick={() => secretTap >= 4 ? (setShowSecretModal(true), setSecretTap(0)) : setSecretTap(s => s + 1)}><Bike className="mr-2" size={20} /> UBite</div>
            <div className="text-xs font-bold bg-red-700 px-2 py-1 rounded uppercase tracking-widest">{view === 'status' ? 'Status' : 'Ordering'}</div>
          </div>
        )}
        <div className="overflow-y-auto h-full pb-20 scroll-smooth">
          {view === 'auth' && renderAuth()}
          {view === 'welcome' && renderWelcome()}
          {view === 'user_orders' && renderUserOrders()}
          {view === 'details' && (
            <div className="p-6 space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Your Information</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Nickname</label><div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden"><span className="p-3 bg-gray-50 text-gray-500"><User size={18}/></span><input type="text" className="w-full p-3 outline-none" value={userDetails.nickname} readOnly /></div></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp Number</label><div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden"><span className="p-3 bg-gray-50 text-gray-500"><Phone size={18}/></span><input type="tel" className="w-full p-3 outline-none" value={userDetails.whatsapp} readOnly /></div></div>
              </div>
              <button onClick={() => setView('restaurant')} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-md mt-6">Continue to Menu</button>
              <button onClick={() => setView('welcome')} className="w-full py-3 text-gray-500 underline">Back</button>
            </div>
          )}
          {view === 'restaurant' && renderRestaurantSelector()}
          {view === 'mcd' && renderMcdFlow()}
          {view === 'sushi' && renderSushiFlow()}
          {view === 'checkout' && renderCheckout()}
          {view === 'status' && renderStatus()}
          {view === 'admin' && renderAdminPortal()}
          {view === 'seller' && renderSellerPortal()}
        </div>
        {view !== 'auth' && view !== 'seller' && view !== 'admin' && (
          <a href="https://wa.me/601120365995?text=%5BUBite%5D%2C%20I%20have%20a%20question" target="_blank" rel="noopener" className="absolute bottom-14 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg z-[150]"><MessageCircle size={26} className="animate-pulse" /></a>
        )}
        {toastMessage && <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-[90%] bg-gray-900 text-white font-bold text-center py-3 px-4 rounded-xl shadow-2xl z-[200] text-sm animate-fadeIn">{toastMessage}</div>}
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