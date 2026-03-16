import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  onSnapshot
} from 'firebase/firestore';
import { 
  Users, 
  ClipboardList, 
  MapPin, 
  LogOut, 
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  X,
  ChevronRight,
  FileText
} from 'lucide-react';

// --- KONFIGURASI FIREBASE (Gunakan data dari screenshot Anda) ---
const firebaseConfig = {
  apiKey: "AIzaSyCSZypOwG8-wwT0FhgHuFqJG5AI2dshM6Q",
  authDomain: "lksnb-5a725.firebaseapp.com",
  databaseURL: "https://lksnb-5a725-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lksnb-5a725",
  storageBucket: "lksnb-5a725.firebasestorage.app",
  messagingSenderId: "86954999611",
  appId: "1:86954999611:web:8374cffc61d2799fbac11e",
  measurementId: "G-6NW8PKLTY1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'lksnb-production';

// --- DATA MASTER PETUGAS ---
const PETUGAS_MASTER = {
  "22587998": { "area": "Bandar Lampung", "nama": "Muhammad Rofiuddin", "posisi": "IFO" },
  "22587917": { "area": "Bandar Lampung", "nama": "Pipih Agustini", "posisi": "IFO" },
  "22588274": { "area": "Bandar Lampung", "nama": "Rizky Novitra", "posisi": "IFO" },
  "22588177": { "area": "Bandar Lampung", "nama": "Devi Susanti", "posisi": "IFO" },
  "22588275": { "area": "Bandar Lampung", "nama": "Joko Siyanto", "posisi": "IFM" },
  "22588373": { "area": "Bandar Lampung", "nama": "Feni Veranita Effendi", "posisi": "IFO" },
  "13032456": { "area": "Nasional", "nama": "Ali Andi Leon Arkantoro", "posisi": "IFD Head" }
};

const AREAS = [...new Set(Object.values(PETUGAS_MASTER).map(p => p.area))].sort();
const STATIC_PASSWORD = "Btpnsyariah.1";

const ROLES = {
  IFD_HEAD: 'IFD Head',
  IFM: 'IFM',
  IFO: 'IFO'
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  
  const [loginNik, setLoginNik] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState('');

  const [visits, setVisits] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth failed", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userDoc = await getDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'profile', 'data'));
        if (userDoc.exists()) setUserData(userDoc.data());
      }
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userData || !user) return;
    
    const unsubVisits = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'visits'), (s) => {
      setVisits(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Visits sync error", err));

    const unsubTasks = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), (s) => {
      setTasks(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Tasks sync error", err));

    return () => { unsubVisits(); unsubTasks(); };
  }, [userData, user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (loginPass !== STATIC_PASSWORD) return setAuthError('Password salah!');
    const master = PETUGAS_MASTER[loginNik];
    if (!master) return setAuthError('NIK tidak terdaftar!');

    const profile = { uid: user.uid, nik: loginNik, name: master.nama, role: master.posisi, area: master.area };
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), profile);
    setUserData(profile);
  };

  const handleLogout = () => {
    setUserData(null);
    setLoginNik('');
    setLoginPass('');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-indigo-50 font-black italic text-indigo-900 animate-pulse">
      MEMUAT SISTEM LKSNB...
    </div>
  );

  if (!userData) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-indigo-100">
        <div className="text-center mb-8">
          <div className="bg-indigo-900 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
            <ShieldCheck className="text-white -rotate-3" size={40} />
          </div>
          <h1 className="text-2xl font-black text-indigo-950 uppercase tracking-tight">Portal LKSNB</h1>
          <p className="text-gray-400 text-sm mt-1">Sistem Laporan Nasabah Bermasalah</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block px-1">NIK PETUGAS</label>
            <input required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 rounded-xl transition-all outline-none" placeholder="Masukkan NIK" value={loginNik} onChange={e => setLoginNik(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block px-1">PASSWORD</label>
            <input required type="password" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 rounded-xl transition-all outline-none" placeholder="••••••••" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
          </div>
          {authError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-pulse"><AlertCircle size={14}/> {authError}</div>}
          <button type="submit" className="w-full bg-indigo-900 hover:bg-indigo-800 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">MASUK SISTEM</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-indigo-950 pb-20">
      <nav className="bg-indigo-950 text-white p-4 sticky top-0 z-[60] flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-lg text-indigo-950"><ShieldCheck size={20}/></div>
          <div className="font-black italic tracking-tighter text-xl uppercase">LKSNB <span className="text-indigo-400">Digital</span></div>
        </div>
        <button onClick={handleLogout} className="p-2.5 bg-indigo-900/50 hover:bg-red-900/40 rounded-xl transition-all"><LogOut size={20}/></button>
      </nav>

      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <h2 className="text-2xl font-black">Selamat Datang, {userData.name}</h2>
           <p className="text-gray-500 font-bold uppercase text-xs mt-1">{userData.role} • {userData.area}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-indigo-600 p-6 rounded-3xl text-white">
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Total Laporan</p>
              <p className="text-4xl font-black mt-2">{visits.length}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tugas Pending</p>
              <p className="text-4xl font-black mt-2">{tasks.filter(t => t.status === 'PENDING').length}</p>
           </div>
        </div>
      </div>
    </div>
  );
}
