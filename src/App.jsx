import React, { useState, useEffect } from 'react';
import { ShoppingBag, Bike, MapPin, Phone, User, Users, CheckCircle, Info, Upload, Store, ShieldAlert, Clock, CreditCard, MessageCircle, MessageSquare, LayoutDashboard, History, BarChart3, Package, Truck, Home, ChevronRight, Download, X, LogOut, ListOrdered } from 'lucide-react';

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

  const handleFeedbackSubmit = async () => {
    if(!feedbackText.trim()) return;
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
      showToast('Failed to submit feedback.');
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

  const getUserStats = () => {
    const stats = {};
    orders.forEach(o => {
      const key = o.userDetails.whatsapp;
      if (!stats[key]) stats[key] = { nickname: o.userDetails.nickname, phone: key, orders: 0, foodSpent: 0, deliverySpent: 0, lastOrder: o.date };
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
      csv += `${d.toLocaleDateString()},${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})},${o.id},${o.userDetails.nickname},${o.userDetails.whatsapp},${o.restaurant},${(o.foodTotal || 0).toFixed(2)},${(o.deliveryFee || 0).toFixed(2)},${o.total.toFixed(2)}\n`;
    });
    const totalDeliveryEarnings = monthlyOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const totalSales = monthlyOrders.reduce((sum, o) => sum + o.total, 0);
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
        <div className="w-full flex space-x-3 mt-4">
          <button onClick={() => setView('user_orders')} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center text-sm"><ListOrdered size={16} className="mr-2" /> Track Orders</button>
          <button onClick={() => setShowFeedbackModal(true)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center text-sm"><MessageSquare size={16} className="mr-2" /> Feedback</button>
        </div>
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
              <div className="text-sm text-gray-600 flex justify-between"><span>{order.restaurant === 'foodtruck' ? 'Food Truck' : order.restaurant.toUpperCase()}</span><span className="font-bold text-gray-900">RM {order.total.toFixed(2)}</span></div>
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
        <button onClick={() => { setRestaurant('foodtruck'); setView('foodtruck'); }} className="flex items-center p-4 bg-white border-2 border-orange-200 rounded-xl shadow-sm hover:bg-orange-50 text-left">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600 mr-4"><Truck size={28} /></div>
          <div><h3 className="text-xl font-bold text-gray-800">Other Food Trucks</h3><p className="text-xs text-gray-500 mt-1">Order from any other truck around campus.</p></div>
        </button>
      </div>
      <button onClick={() => setView('welcome')} className="w-full py-3 text-gray-500 font-semibold underline">Back</button>
    </div>
  );

  const renderFoodTruckFlow = () => (
    <div className="p-6 space-y-6 animate-fadeIn pb-24">
      <h2 className="text-2xl font-bold text-orange-600 border-b pb-2 flex items-center">Food Truck Order</h2>
      <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start shadow-sm">
        <Info className="mr-3 shrink-0 text-orange-600" size={24} />
        <div>
          <span className="font-bold block mb-1">How it works:</span>
          <p className="text-sm text-orange-800">1. Tell us which food truck, what food, and the quantity.<br/>2. Delivery fee is RM 1.50 per 3 items.<br/>3. You only pay the delivery fee now. We will contact you via WhatsApp for the exact food price later.</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Total Number of Items</label>
          <p className="text-xs text-gray-500 mb-2">Used to calculate delivery fee.</p>
          <div className="flex items-center border rounded-lg w-max overflow-hidden"><button onClick={() => setFtItemCount(Math.max(1, ftItemCount - 1))} className="px-4 py-2 bg-gray-100 font-bold">-</button><span className="px-6 py-2 font-bold">{ftItemCount}</span><button onClick={() => setFtItemCount(ftItemCount + 1)} className="px-4 py-2 bg-gray-100 font-bold">+</button></div>
        </div>
        <div className="border-t pt-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">Order Details</label>
          <textarea rows="5" className="w-full p-3 border rounded-lg outline-none focus:ring-2 ring-orange-400" placeholder="e.g. Truck: Takoyaki Abang&#10;Food: 1x Mix Takoyaki (10pcs)&#10;Food: 2x Takoyaki Sotong (5pcs)" value={ftOrderText} onChange={(e) => setFtOrderText(e.target.value)}></textarea>
        </div>
      </div>
      <button onClick={() => setView('checkout')} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-md transition">Proceed to Payment</button>
      <button onClick={() => setView('restaurant')} className="w-full py-3 text-gray-500 font-semibold underline">Back</button>
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
    const fee = calculateDeliveryFee();
    const food = restaurant === 'sushi' ? calculateSushiFoodTotal() : 0;
    return (
      <div className="p-6 space-y-6 animate-fadeIn pb-24">
        <h2 className="text-2xl font-bold border-b pb-2">Checkout</h2>
        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-3">
          <h3 className="font-bold border-b pb-2 flex items-center"><ShoppingBag size={18} className="mr-2 text-gray-500" /> Order Summary</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span>Restaurant</span><span className="font-semibold">{restaurant === 'foodtruck' ? 'Food Truck' : restaurant.toUpperCase()}</span></div>
            {restaurant === 'sushi' && <div className="flex justify-between pt-2 border-t"><span>Food Price</span><span>RM {food.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span>Delivery Fee</span><span>RM {fee.toFixed(2)}</span></div>
          </div>
          <div className="flex justify-between text-lg font-black text-red-600 border-t pt-3 mt-3"><span>Total to Pay Now:</span><span>RM {(fee + food).toFixed(2)}</span></div>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">Remarks (Optional)</label>
          <textarea rows="2" className="w-full p-3 border rounded-lg outline-none focus:ring-2 ring-red-400" placeholder="Any special requests or instructions..." value={orderRemarks} onChange={(e) => setOrderRemarks(e.target.value)}></textarea>
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
          <button onClick={() => { setView('user_orders'); setActiveUserOrderId(null); setSushiOrder({}); setPaymentReceipt(null); setMcdReceipt(null); setFtItemCount(1); setFtOrderText(''); setOrderRemarks(''); }} className="w-full bg-gray-200 text-gray-800 font-bold py-4 rounded-xl shadow-sm">Back to My Orders</button>
          {idx === 3 && (
            <div className="flex space-x-2">
              <button onClick={() => { setView('welcome'); setActiveUserOrderId(null); setSushiOrder({}); setPaymentReceipt(null); setMcdReceipt(null); setFtItemCount(1); setFtOrderText(''); setOrderRemarks(''); }} className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-xl shadow-md">Order Again</button>
              <button onClick={() => setShowFeedbackModal(true)} className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md">Leave Feedback</button>
            </div>
          )}
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
        
        <div className="flex bg-gray-800 p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide space-x-1">
          <button onClick={() => setAdminTab('live')} className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap ${adminTab === 'live' ? 'bg-red-600' : 'text-gray-400'}`}>Live</button>
          <button onClick={() => setAdminTab('history')} className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap ${adminTab === 'history' ? 'bg-red-600' : 'text-gray-400'}`}>History</button>
          <button onClick={() => setAdminTab('summary')} className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap ${adminTab === 'summary' ? 'bg-red-600' : 'text-gray-400'}`}>Summary</button>
          <button onClick={() => setAdminTab('feedback')} className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap ${adminTab === 'feedback' ? 'bg-red-600' : 'text-gray-400'}`}>Feedback</button>
          <button onClick={() => setAdminTab('users')} className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap ${adminTab === 'users' ? 'bg-red-600' : 'text-gray-400'}`}>Users</button>
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
                  <p><b>Restaurant:</b> {o.restaurant === 'foodtruck' ? 'FOOD TRUCK' : o.restaurant.toUpperCase()}</p>
                  <p><b>Total:</b> RM {o.total.toFixed(2)}</p>
                  
                  {o.restaurant === 'foodtruck' && o.ftOrderText && <div className="bg-gray-900 p-2 rounded mt-2 border border-gray-600 text-xs text-gray-400 whitespace-pre-line">{o.ftOrderText}</div>}
                  {o.remarks && <div className="mt-2 text-xs text-yellow-300 italic"><b>Remarks:</b> {o.remarks}</div>}

                  <div className="flex space-x-2 mt-2">
                    {o.paymentReceipt && <a href={o.paymentReceipt} download={`Pay_${o.id}.jpg`} className="bg-gray-700 text-[10px] p-1.5 rounded flex items-center"><Download size={12} className="mr-1"/> Receipt</a>}
                    {o.mcdReceipt && <a href={o.mcdReceipt} download={`McD_${o.id}.jpg`} className="bg-gray-700 text-[10px] p-1.5 rounded flex items-center"><Download size={12} className="mr-1"/> McD Receipt</a>}
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
        {adminTab === 'history' && (
          <div className="space-y-3 relative">
            <h3 className="font-bold text-gray-400 text-sm mb-2">Completed Orders</h3>
            {pastOrders.length === 0 ? <div className="text-center text-gray-500 py-10">No completed orders yet.</div> : (
              pastOrders.map(order => (
                <div key={order.id} onClick={() => setSelectedHistoryOrder(order)} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center opacity-80 cursor-pointer hover:bg-gray-700 transition">
                  <div>
                    <p className="font-bold text-yellow-400">#{order.id} <span className="text-gray-400 text-xs font-normal ml-1">({order.restaurant.toUpperCase()})</span></p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(order.date).toLocaleDateString()} • {order.userDetails.nickname}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">RM {order.total.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-500 uppercase">View Details</p>
                  </div>
                </div>
              ))
            )}
            
            {selectedHistoryOrder && (
               <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
                  <div className="bg-gray-800 p-6 rounded-xl w-full max-w-sm border border-gray-600 relative shadow-2xl overflow-y-auto max-h-[90vh]">
                     <button onClick={() => setSelectedHistoryOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-700 p-1 rounded-full"><X size={20}/></button>
                     <h3 className="text-xl font-bold text-white mb-4">Order #{selectedHistoryOrder.id}</h3>
                     <div className="space-y-2 text-sm text-gray-300">
                        <p><b>Date:</b> {new Date(selectedHistoryOrder.date).toLocaleString([], {year:'numeric', month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'})}</p>
                        <p><b>Customer:</b> {selectedHistoryOrder.userDetails.nickname} ({selectedHistoryOrder.userDetails.whatsapp})</p>
                        <p><b>Restaurant:</b> {selectedHistoryOrder.restaurant.toUpperCase()}</p>
                     </div>
                     <div className="bg-gray-900 p-3 rounded mt-4 mb-4 border border-gray-700">
                       <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Order Summary</p>
                       {selectedHistoryOrder.restaurant === 'mcd' ? (
                          <p className="text-sm text-white">{selectedHistoryOrder.mcdOrderType === 'help' ? selectedHistoryOrder.mcdOrderText : 'User self-ordered on McD App.'}</p>
                       ) : selectedHistoryOrder.restaurant === 'foodtruck' ? (
                          <p className="text-sm text-white whitespace-pre-line">{selectedHistoryOrder.ftOrderText}</p>
                       ) : (
                          <ul className="text-sm space-y-1 text-white">
                            {selectedHistoryOrder.sushiOrderDetails && Object.entries(selectedHistoryOrder.sushiOrderDetails).map(([id, qty]) => {
                               const item = SUSHI_MENU.find(i => i.id === id);
                               return <li key={id} className="flex justify-between"><span>{item?.name}</span> <span className="text-red-400 font-bold">x{qty}</span></li>
                            })}
                          </ul>
                       )}
                       {selectedHistoryOrder.remarks && <div className="mt-3 text-xs text-yellow-300 italic border-t border-gray-700 pt-2"><b>Remarks:</b> {selectedHistoryOrder.remarks}</div>}
                     </div>
                     <div className="flex justify-between border-t border-gray-600 pt-3 flex-col space-y-1">
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Food Total</span><span className="font-bold text-white">RM {(selectedHistoryOrder.foodTotal || 0).toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Delivery Fee</span><span className="font-bold text-white">RM {(selectedHistoryOrder.deliveryFee || 0).toFixed(2)}</span></div>
                        <div className="flex justify-between text-base mt-2 pt-2 border-t border-gray-700"><span className="text-gray-200 font-bold">Grand Total</span><span className="text-lg font-bold text-green-400">RM {selectedHistoryOrder.total.toFixed(2)}</span></div>
                     </div>
                     {(selectedHistoryOrder.paymentReceipt || selectedHistoryOrder.mcdReceipt) && (
                        <div className="mt-4 pt-4 border-t border-gray-700 flex space-x-2">
                          {selectedHistoryOrder.paymentReceipt && (
                            <a href={selectedHistoryOrder.paymentReceipt} download={`Payment_${selectedHistoryOrder.id}.jpg`} className="flex-1 flex justify-center items-center bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 rounded transition">
                              <Download size={14} className="mr-1"/> Download Payment
                            </a>
                          )}
                          {selectedHistoryOrder.mcdReceipt && (
                            <a href={selectedHistoryOrder.mcdReceipt} download={`McD_${selectedHistoryOrder.id}.jpg`} className="flex-1 flex justify-center items-center bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 rounded transition">
                              <Download size={14} className="mr-1"/> Download McD
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
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-2xl shadow-lg border border-red-500">
                <h3 className="text-red-200 font-bold text-sm uppercase tracking-wide mb-1">Today's Delivery Earnings</h3>
                <p className="text-4xl font-extrabold text-white">RM {todayDeliveryRevenue.toFixed(2)}</p>
                <div className="mt-4 flex items-center text-red-100 text-sm font-semibold"><Truck size={16} className="mr-1" /> {todayOrders} Deliveries completed today</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700"><p className="text-gray-400 text-xs font-bold uppercase mb-1">Monthly Delivery RM</p><p className="text-2xl font-bold text-green-400">RM {monthDeliveryRevenue.toFixed(2)}</p></div>
                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700"><p className="text-gray-400 text-xs font-bold uppercase mb-1">Monthly Orders</p><p className="text-2xl font-bold text-white">{monthOrders}</p></div>
              </div>
              <button onClick={downloadSummary} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md flex justify-center items-center transition">
                <Download className="mr-2" size={20} /> Download Monthly Summary
              </button>
            </div>
          );
        })()}
        
        {adminTab === 'feedback' && (
          <div className="space-y-4">
            <button onClick={downloadFeedback} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md flex justify-center items-center"><Download size={18} className="mr-2"/> Download Feedback CSV</button>
            {feedbacks.length === 0 ? <p className="text-gray-500 text-center py-10">No feedback yet.</p> : feedbacks.map((f, i) => (
              <div key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700 relative">
                <p className="text-xs text-gray-400 absolute top-4 right-4">{new Date(f.date).toLocaleDateString()}</p>
                <p className="font-bold text-blue-400 mb-1">{f.user}</p>
                <p className="text-xs text-gray-500 mb-3">{f.phone}</p>
                <p className="text-gray-200 bg-gray-900 p-3 rounded italic">"{f.text}"</p>
              </div>
            ))}
          </div>
        )}

        {adminTab === 'users' && (() => {
           const userStats = getUserStats();
           return (
             <div className="space-y-4">
               <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-6 rounded-2xl shadow-lg">
                 <h3 className="text-indigo-200 font-bold text-sm uppercase">Total Unique Users</h3>
                 <p className="text-4xl font-extrabold text-white">{userStats.length}</p>
               </div>
               <button onClick={downloadUsers} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md flex justify-center items-center"><Download size={18} className="mr-2"/> Download Users CSV</button>
               <div className="space-y-3">
                 {userStats.map((u, i) => (
                   <div key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-sm">
                     <div className="flex justify-between border-b border-gray-700 pb-2 mb-2">
                       <span className="font-bold text-white"><User size={14} className="inline mr-1"/>{u.nickname}</span>
                       <span className="text-gray-400">{u.phone}</span>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-gray-300">
                       <div>Orders: <span className="font-bold text-white">{u.orders}</span></div>
                       <div>Total Spent: <span className="font-bold text-green-400">RM {(u.foodSpent + u.deliverySpent).toFixed(2)}</span></div>
                       <div className="text-xs text-gray-500">Food: RM {u.foodSpent.toFixed(2)}</div>
                       <div className="text-xs text-gray-500">Del: RM {u.deliverySpent.toFixed(2)}</div>
                     </div>
                     <div className="mt-2 text-[10px] text-gray-500">Last Order: {new Date(u.lastOrder).toLocaleString()}</div>
                   </div>
                 ))}
               </div>
             </div>
           );
        })()}
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
          {view === 'foodtruck' && renderFoodTruckFlow()}
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
        
        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="absolute inset-0 z-[300] bg-black/80 flex items-center justify-center p-4">
             <div className="bg-white p-6 rounded-xl w-full max-w-xs shadow-2xl animate-fadeIn">
                <h3 className="font-bold text-lg mb-2 text-gray-800 tracking-tight">Your Feedback</h3>
                <p className="text-xs text-gray-500 mb-4">Let us know how we did or what we can improve!</p>
                <textarea rows="4" className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 ring-blue-500" placeholder="Type your feedback here..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)}></textarea>
                <div className="flex space-x-2">
                  <button onClick={() => { setShowFeedbackModal(false); setFeedbackText(''); }} className="flex-1 p-3 bg-gray-100 rounded-lg font-bold text-gray-700">Cancel</button>
                  <button onClick={handleFeedbackSubmit} className="flex-1 p-3 bg-blue-600 rounded-lg font-bold text-white">Submit</button>
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