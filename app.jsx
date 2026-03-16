import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
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
  onSnapshot,
  query
} from 'firebase/firestore';
import { 
  Users, 
  ClipboardList, 
  MapPin, 
  Download, 
  LogOut, 
  CheckCircle, 
  Clock, 
  ShieldCheck,
  Lock,
  ChevronRight,
  Filter,
  FileText,
  AlertCircle,
  PlusCircle,
  X
} from 'lucide-react';

// --- Konfigurasi Firebase ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'lksnb-app-v2';

// --- Data Master Petugas ---
const PETUGAS_MASTER = {
  "22587998": { "area": "Bandar Lampung", "nama": "Muhammad Rofiuddin", "posisi": "IFO" },
  "22587917": { "area": "Bandar Lampung", "nama": "Pipih Agustini", "posisi": "IFO" },
  "22588274": { "area": "Bandar Lampung", "nama": "Rizky Novitra", "posisi": "IFO" },
  "22588177": { "area": "Bandar Lampung", "nama": "Devi Susanti", "posisi": "IFO" },
  "22588275": { "area": "Bandar Lampung", "nama": "Joko Siyanto", "posisi": "IFM" },
  "22588373": { "area": "Bandar Lampung", "nama": "Feni Veranita Effendi", "posisi": "IFO" },
  "22580733": { "area": "DI Yogyakarta", "nama": "Atiqoh Wahyuningsih", "posisi": "IFO" },
  "22578954": { "area": "DI Yogyakarta", "nama": "Arif Adrianto", "posisi": "IFO" },
  "22587582": { "area": "DI Yogyakarta", "nama": "Umi Mujahadah", "posisi": "IFO" },
  "22588880": { "area": "Kab. Banyumas", "nama": "Farhan Muhammad 'Afif", "posisi": "IFO" },
  "22580766": { "area": "Kab. Banyumas", "nama": "Aprilia Rahmawati", "posisi": "IFO" },
  "22585859": { "area": "Kab. Banyumas", "nama": "Nur Rachmawati", "posisi": "IFO" },
  "22580167": { "area": "Kab. Banyumas", "nama": "Hindarwan", "posisi": "IFM" },
  "22580171": { "area": "Kab. Banyumas", "nama": "Danang Dwi Anggoro", "posisi": "IFO" },
  "22589839": { "area": "Kab. Langkat", "nama": "Hilda Puspita", "posisi": "IFO" },
  "22589842": { "area": "Kab. Langkat", "nama": "Rina Suriana", "posisi": "IFO" },
  "22589840": { "area": "Kab. Langkat", "nama": "Krisna Wahyudha", "posisi": "IFO" },
  "22589841": { "area": "Kab. Langkat", "nama": "Maruba Christian Sinaga", "posisi": "IFO" },
  "22589843": { "area": "Kab. Langkat", "nama": "Roni Syafzli", "posisi": "IFO" },
  "22691381": { "area": "Kab. Langkat", "nama": "Panut Maulana", "posisi": "IFM" },
  "22691513": { "area": "Kab. Sleman", "nama": "Khoiri Rubiyanto", "posisi": "IFM" },
  "22588747": { "area": "Kota Cirebon", "nama": "Untung Wijaya", "posisi": "IFO" },
  "22589575": { "area": "Kota Cirebon", "nama": "Wawan Hermawan", "posisi": "IFO" },
  "22588745": { "area": "Kota Cirebon", "nama": "Aldi Ramadan", "posisi": "IFO" },
  "22580170": { "area": "Kota Cirebon", "nama": "Raharjo Hadinoto, S.E", "posisi": "IFM" },
  "22588746": { "area": "Kota Cirebon", "nama": "Mukhamad Taqyudin", "posisi": "IFO" },
  "22586356": { "area": "Kota Makassar", "nama": "Wiwi Sumarwi", "posisi": "IFO" },
  "22586357": { "area": "Kota Makassar", "nama": "Jernih Amalia Rahman", "posisi": "IFO" },
  "22579681": { "area": "Kota Makassar", "nama": "Rizqah", "posisi": "IFM" },
  "22580091": { "area": "Kota Makassar", "nama": "Nuraeni N", "posisi": "IFO" },
  "22579679": { "area": "Kota Makassar", "nama": "Irawati", "posisi": "IFO" },
  "22580092": { "area": "Kota Makassar", "nama": "M. Wahyu Anugrah", "posisi": "IFO" },
  "22589138": { "area": "Kota Malang", "nama": "Bangkit Dwi Cahyono", "posisi": "IFO" },
  "22589034": { "area": "Kota Malang", "nama": "Asri Dwi Indriana", "posisi": "IFO" },
  "22691282": { "area": "Kota Malang", "nama": "Henri Yudho Wulansakti", "posisi": "IFO" },
  "22589036": { "area": "Kota Malang", "nama": "Rizky Rahayu Utomo", "posisi": "IFO" },
  "22589035": { "area": "Kota Malang", "nama": "Nur Cholis Majid", "posisi": "IFO" },
  "22588986": { "area": "Kota Malang", "nama": "Citra Larasati", "posisi": "IFM" },
  "22588960": { "area": "Kota Medan", "nama": "Sri Asnani", "posisi": "IFM" },
  "22588912": { "area": "Kota Medan", "nama": "Imelda Tersia Pasaribu", "posisi": "IFO" },
  "22588909": { "area": "Kota Medan", "nama": "Muhammad Fajri", "posisi": "IFO" },
  "22588910": { "area": "Kota Medan", "nama": "Natalia Sihotang", "posisi": "IFO" },
  "22588911": { "area": "Kota Medan", "nama": "Dinda Habibi Lubis", "posisi": "IFO" },
  "22587670": { "area": "Kota Palembang", "nama": "Dian Ari Saputra", "posisi": "IFO" },
  "22583666": { "area": "Kota Palembang", "nama": "Ricky Rachmatri", "posisi": "IFO" },
  "22580093": { "area": "Kota Palembang", "nama": "M. Syafran", "posisi": "IFM" },
  "22589170": { "area": "Kota Palembang", "nama": "Ferdiansyah", "posisi": "IFO" },
  "22581930": { "area": "Kota Palembang", "nama": "M Abdulhafiizh Ramadhan", "posisi": "IFO" },
  "22588699": { "area": "Tulang Bawang", "nama": "Zikrie", "posisi": "IFO" },
  "22588420": { "area": "Tulang Bawang", "nama": "M Fahrul Zaqi", "posisi": "IFO" },
  "22588554": { "area": "Tulang Bawang", "nama": "NOVRIANSYAH", "posisi": "IFO" },
  "22588374": { "area": "Tulang Bawang", "nama": "Rean Rizkian", "posisi": "IFM" },
  "22588176": { "area": "Tulang Bawang", "nama": "Ramadhani Saputra", "posisi": "IFO" },
  "22692062": { "area": "Kab. Sleman", "nama": "Bambang Priyonggo", "posisi": "IFO" },
  "22692497": { "area": "Kab. Banyumas", "nama": "ANDREW ADITYA KUMAMBOW", "posisi": "IFO" },
  "22692817": { "area": "Tulang Bawang", "nama": "Handika Dwi Saputra", "posisi": "IFO" },
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
      await signInAnonymously(auth);
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
    if (!userData) return;
    const unsubVisits = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'visits'), (s) => {
      setVisits(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubTasks = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), (s) => {
      setTasks(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubVisits(); unsubTasks(); };
  }, [userData]);

  const handleLogin = async (e) => {
    e.preventDefault();
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-indigo-50 font-black italic text-indigo-900 animate-pulse">MEMUAT SISTEM LKSNB...</div>;

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

  const IFM_Panel = () => {
    const [nasabahNama, setNasabahNama] = useState('');
    const [nasabahId, setNasabahId] = useState('');
    const [selectedArea, setSelectedArea] = useState(userData.role === ROLES.IFD_HEAD ? '' : userData.area);
    const [selectedIfoNik, setSelectedIfoNik] = useState('');

    const filteredIfos = useMemo(() => {
      if (!selectedArea) return [];
      return Object.entries(PETUGAS_MASTER)
        .filter(([nik, p]) => p.area === selectedArea && p.posisi === 'IFO')
        .map(([nik, p]) => ({ nik, ...p }));
    }, [selectedArea]);

    const assignTask = async () => {
      if (!nasabahNama || !selectedIfoNik) return alert("Lengkapi data nasabah dan petugas!");
      const ifo = PETUGAS_MASTER[selectedIfoNik];
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), {
        nasabahNama,
        nasabahId: nasabahId || 'APP-' + Math.floor(Math.random() * 100000),
        assignedToNik: selectedIfoNik,
        assignedToName: ifo.nama,
        area: selectedArea,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        createdBy: userData.name,
        type: 'ASSIGNED'
      });
      setNasabahNama('');
      setNasabahId('');
      setSelectedIfoNik('');
      alert('Tugas LKSNB berhasil dibuat!');
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="font-bold mb-4 text-indigo-950 flex items-center gap-2"><ClipboardList size={20}/> Penugasan Baru</h2>
              <div className="space-y-4">
                <input className="w-full border-2 border-gray-50 bg-gray-50 p-3 rounded-xl text-sm focus:bg-white focus:border-indigo-200 outline-none transition-all" placeholder="Nama Nasabah" value={nasabahNama} onChange={e => setNasabahNama(e.target.value)} />
                <input className="w-full border-2 border-gray-50 bg-gray-50 p-3 rounded-xl text-sm focus:bg-white focus:border-indigo-200 outline-none transition-all" placeholder="No. APPID" value={nasabahId} onChange={e => setNasabahId(e.target.value)} />
                <div className="pt-2 border-t">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Area Kerja</label>
                  <select 
                    className="w-full border-2 border-indigo-50 p-3 rounded-xl text-sm mt-1 bg-indigo-50 font-semibold outline-none"
                    value={selectedArea}
                    onChange={e => { setSelectedArea(e.target.value); setSelectedIfoNik(''); }}
                  >
                    <option value="">-- Pilih Area --</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Petugas IFO</label>
                  <select 
                    disabled={!selectedArea}
                    className="w-full border-2 p-3 rounded-xl text-sm mt-1 bg-white outline-none"
                    value={selectedIfoNik}
                    onChange={e => setSelectedIfoNik(e.target.value)}
                  >
                    <option value="">-- Pilih Petugas --</option>
                    {filteredIfos.map(i => <option key={i.nik} value={i.nik}>{i.nama}</option>)}
                  </select>
                </div>
                <button onClick={assignTask} className="w-full bg-indigo-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-800 transition-all">Kirim Tugas</button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <span className="font-bold text-gray-700">Daftar Penugasan Aktif</span>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black">{tasks.filter(t => t.status === 'PENDING').length} PENDING</span>
              </div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {tasks.filter(t => t.status === 'PENDING').map(t => (
                  <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-bold text-indigo-950">{t.nasabahNama} {t.type === 'SELF' && <span className="bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 rounded-full ml-2">MANDIRI</span>}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-medium">{t.area} • ID: {t.nasabahId} • IFO: {t.assignedToName}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 italic">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const IFO_Panel = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [location, setLocation] = useState(null);
    
    // Modal Form State (IFO Add Self)
    const [newNasabah, setNewNasabah] = useState('');
    const [newAppId, setNewAppId] = useState('');

    // Visit Form State
    const [formData, setFormData] = useState({ 
      keberadaanUsaha: 'Ada', penjelasanKeberadaan: '', kategoriNasabah: 'A', 
      bertemuDengan: '', jumlahTabungan: '', jumlahAngsuran: '', tanggalJanjiBayar: '', catatan: '' 
    });

    const addSelfTask = async () => {
      if (!newNasabah) return alert("Masukkan nama nasabah!");
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), {
        nasabahNama: newNasabah,
        nasabahId: newAppId || 'SELF-' + Math.floor(Math.random() * 100000),
        assignedToNik: userData.nik,
        assignedToName: userData.name,
        area: userData.area,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        createdBy: userData.name,
        type: 'SELF'
      });
      setNewNasabah(''); setNewAppId(''); setShowAddModal(false);
      alert("Tugas mandiri berhasil ditambahkan!");
    };

    const getGeo = () => {
      navigator.geolocation.getCurrentPosition(
        p => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        e => alert("Aktifkan GPS perangkat Anda.")
      );
    };

    const submitVisit = async () => {
      if (!location) return alert("Wajib Geotagging!");
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'visits'), {
        ...formData, ifoName: userData.name, nik: userData.nik,
        nasabahNama: selectedTask.nasabahNama, nasabahId: selectedTask.nasabahId,
        area: userData.area, location, tanggal: new Date().toLocaleDateString(), submittedAt: new Date().toISOString()
      });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', selectedTask.id), { status: 'DONE' });
      setSelectedTask(null);
      alert("Laporan LKSNB Terkirim!");
    };

    const myTasks = tasks.filter(t => t.assignedToNik === userData.nik && t.status === 'PENDING');

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl text-indigo-950 uppercase tracking-tight">Kunjungan Saya</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:scale-105 transition-all"
          >
            <PlusCircle size={16}/> TAMBAH TUGAS
          </button>
        </div>

        {/* Modal Tambah Tugas Mandiri */}
        {showAddModal && (
          <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-indigo-950 uppercase">Tugas Mandiri</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400"><X size={20}/></button>
              </div>
              <div className="space-y-4">
                <input className="w-full border-2 border-gray-50 bg-gray-50 p-3 rounded-xl text-sm outline-none focus:border-indigo-200" placeholder="Nama Nasabah" value={newNasabah} onChange={e => setNewNasabah(e.target.value)} />
                <input className="w-full border-2 border-gray-50 bg-gray-50 p-3 rounded-xl text-sm outline-none focus:border-indigo-200" placeholder="No. APPID (Opsional)" value={newAppId} onChange={e => setNewAppId(e.target.value)} />
                <button onClick={addSelfTask} className="w-full bg-indigo-900 text-white py-4 rounded-2xl font-black text-sm">TAMBAHKAN TUGAS</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {myTasks.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-medium">Belum ada tugas kunjungan.</div>
          ) : (
            myTasks.map(t => (
              <div key={t.id} onClick={() => setSelectedTask(t)} className={`bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center shadow-sm ${selectedTask?.id === t.id ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-transparent'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-indigo-950 block">{t.nasabahNama}</span>
                    {t.type === 'SELF' && <span className="bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase">Mandiri</span>}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">ID: {t.nasabahId}</span>
                </div>
                <ChevronRight size={20} className="text-indigo-400" />
              </div>
            ))
          )}
        </div>

        {selectedTask && (
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-indigo-50 space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-indigo-950 text-lg uppercase leading-none">Form LKSNB</h3>
                <p className="text-[10px] text-gray-500 font-bold mt-1">NASABAH: {selectedTask.nasabahNama}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-300 hover:text-red-500"><X size={20}/></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <label className="text-[10px] font-black text-gray-400 uppercase">3) Keberadaan Usaha</label>
                <select className="w-full border-2 border-gray-50 bg-gray-50 p-3 rounded-xl text-sm" value={formData.keberadaanUsaha} onChange={e => setFormData({...formData, keberadaanUsaha: e.target.value})}>
                  <option>Ada</option><option>Tidak Ada</option>
                </select>
                <textarea className="w-full border-2 border-gray-50 bg-gray-50 p-3 rounded-xl text-sm min-h-[60px]" placeholder="Penjelasan Keberadaan..." value={formData.penjelasanKeberadaan} onChange={e => setFormData({...formData, penjelasanKeberadaan: e.target.value})}/>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Kategori Nasabah</label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {['A', 'B', 'C'].map(v => (
                    <div key={v} onClick={() => setFormData({...formData, kategoriNasabah: v})} className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-3 ${formData.kategoriNasabah === v ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-transparent'}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${formData.kategoriNasabah === v ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-white'}`}>{v}</span>
                      <span className="text-[10px] font-bold leading-tight uppercase">Kategori {v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input className="border-2 border-gray-50 bg-gray-50 p-3 rounded-xl text-sm" placeholder="Bertemu Dengan" value={formData.bertemuDengan} onChange={e => setFormData({...formData, bertemuDengan: e.target.value})}/>
                <input type="date" className="border-2 border-gray-50 bg-gray-50 p-3 rounded-xl text-sm" value={formData.tanggalJanjiBayar} onChange={e => setFormData({...formData, tanggalJanjiBayar: e.target.value})}/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="border-2 border-gray-50 bg-gray-50 p-3 rounded-xl text-sm" placeholder="Tabungan (Rp)" value={formData.jumlahTabungan} onChange={e => setFormData({...formData, jumlahTabungan: e.target.value})}/>
                <input type="number" className="border-2 border-gray-50 bg-gray-50 p-3 rounded-xl text-sm" placeholder="Angsuran (Rp)" value={formData.jumlahAngsuran} onChange={e => setFormData({...formData, jumlahAngsuran: e.target.value})}/>
              </div>

              <textarea className="w-full border-2 border-gray-50 bg-gray-50 p-3 rounded-xl text-sm min-h-[80px]" placeholder="Catatan Tambahan..." value={formData.catatan} onChange={e => setFormData({...formData, catatan: e.target.value})}/>

              <div className="space-y-2">
                <button onClick={getGeo} className={`w-full py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${location ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}>
                  <MapPin size={16}/> {location ? 'KOORDINAT TERKUNCI' : 'AMBIL GEOTAGGING'}
                </button>
                <button onClick={submitVisit} className="w-full bg-indigo-950 text-white py-5 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all">SUBMIT LAPORAN SEKARANG</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-indigo-950 pb-20">
      <nav className="bg-indigo-950 text-white p-4 sticky top-0 z-[60] flex justify-between items-center shadow-2xl border-b border-indigo-900">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-lg text-indigo-950"><ShieldCheck size={20}/></div>
          <div className="font-black italic tracking-tighter text-xl uppercase">LKSNB <span className="text-indigo-400">Mobile</span></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-indigo-300 uppercase leading-none mb-1">{userData.role}</p>
            <p className="text-sm font-bold leading-none">{userData.name}</p>
          </div>
          <button onClick={handleLogout} className="p-2.5 bg-indigo-900/50 hover:bg-red-900/40 rounded-xl transition-all"><LogOut size={20}/></button>
        </div>
      </nav>

      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setView('dashboard')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-400'}`}>Beranda</button>
          {(userData.role !== ROLES.IFO) && <button onClick={() => setView('ifm')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${view === 'ifm' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-400'}`}>Monitoring Area</button>}
          {userData.role === ROLES.IFO && <button onClick={() => setView('ifo')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${view === 'ifo' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-400'}`}>Tugas Kunjungan</button>}
        </div>

        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-indigo-600">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Laporan Masuk</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-3xl font-black">{visits.length}</p>
                  <p className="text-[10px] font-bold text-green-500 mb-1">DATA</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-amber-500">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kunjungan Pending</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-3xl font-black">{tasks.filter(t => t.status === 'PENDING').length}</p>
                  <p className="text-[10px] font-bold text-amber-500 mb-1">NASABAH</p>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-950 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <h3 className="text-xl font-black italic relative z-10">Ringkasan Kategori</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 relative z-10">
                {['A', 'B', 'C'].map(cat => (
                  <div key={cat} className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <span className="text-amber-400 font-black text-xl">{cat}</span>
                    <p className="text-[10px] mt-1 font-bold text-indigo-100 uppercase leading-tight">
                      {cat === 'A' ? 'Itikad Baik Tinggi' : cat === 'B' ? 'Sakit / Gangguan' : 'Bekerja Luar Kota'}
                    </p>
                  </div>
                ))}
              </div>
              <FileText size={160} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
            </div>
          </div>
        )}

        {view === 'ifm' && <IFM_Panel />}
        {view === 'ifo' && <IFO_Panel />}
      </div>
    </div>
  );
}
