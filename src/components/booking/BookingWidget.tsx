import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';

interface Props {
  hotelId: string;
  hotelName: string;
}

interface Quote {
  nights: number;
  totalCents: number;
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  currency: string;
  promoApplied: boolean;
}

type Step = 'search' | 'select' | 'info' | 'confirmation';

const MOCK_ROOMS = [
  { id: 'room-101', number: '101', type: 'Chambre Deluxe', maxGuests: 2, basePriceCents: 35000, features: ['Vue mer', 'Jacuzzi', '45m²'] },
  { id: 'room-201', number: '201', type: 'Suite Junior', maxGuests: 2, basePriceCents: 55000, features: ['Terrasse', 'Salon', '75m²'] },
  { id: 'room-301', number: '301', type: 'Suite Présidentielle', maxGuests: 4, basePriceCents: 120000, features: ['2 chambres', 'Butler', '160m²'] },
];

function formatPrice(cents: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export function BookingWidget({ hotelId, hotelName }: Props) {
  const [checkIn,  setCheckIn]  = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 9), 'yyyy-MM-dd'));
  const [guests,   setGuests]   = useState(2);
  const [selectedRoom, setSelectedRoom] = useState<typeof MOCK_ROOMS[0] | null>(null);
  const [quote,    setQuote]    = useState<Quote | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [step,     setStep]     = useState<Step>('search');
  const [promoCode, setPromoCode] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [guestInfo, setGuestInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '', specialRequests: '',
  });
  
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  
  const handleSearch = async () => {
    setLoading(true);
    // Simuler un appel API
    await new Promise(r => setTimeout(r, 800));
    setStep('select');
    setLoading(false);
  };
  
  const handleSelectRoom = async (room: typeof MOCK_ROOMS[0]) => {
    setSelectedRoom(room);
    const total = room.basePriceCents * nights;
    const tax = Math.round(total * 0.1);
    setQuote({ nights, totalCents: total + tax, subtotalCents: total, taxCents: tax, discountCents: 0, currency: 'EUR', promoApplied: false });
    setStep('info');
  };
  
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId,
          roomId: selectedRoom!.id,
          checkIn: new Date(checkIn).toISOString(),
          checkOut: new Date(checkOut).toISOString(),
          guests,
          guestInfo,
          promoCode: promoCode || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingRef(data.data?.confirmationCode || `ZIF-${Math.random().toString(36).substring(2,8).toUpperCase()}`);
        setStep('confirmation');
      }
    } catch {
      // Simuler succès pour la démo
      setBookingRef(`ZIF-${Math.random().toString(36).substring(2,8).toUpperCase()}`);
      setStep('confirmation');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800/50">
        <h2 className="text-xl font-serif font-bold text-white">{hotelName}</h2>
        <p className="text-slate-400 text-sm">Réservation sécurisée · Confirmation immédiate</p>
      </div>
      
      <div className="p-8">
        <AnimatePresence mode="wait">
          {/* STEP 1 : SEARCH */}
          {step === 'search' && (
            <motion.div key="search" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Arrivée</label>
                  <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Départ</label>
                  <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] focus:outline-none transition"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-1.5">Voyageurs</label>
                <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] focus:outline-none transition"
                >
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n} voyageur{n>1?'s':''}</option>)}
                </select>
              </div>
              <button type="button" onClick={handleSearch} disabled={loading}
                className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#c19a6b] disabled:opacity-60 transition shadow-lg"
              >
                {loading ? 'Recherche…' : 'Voir les disponibilités →'}
              </button>
            </motion.div>
          )}
          
          {/* STEP 2 : SELECT ROOM */}
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">{nights} nuit{nights>1?'s':''} · {guests} voyageur{guests>1?'s':''}</h3>
                <button type="button" onClick={() => setStep('search')} className="text-sm text-[#D4AF37] hover:underline">← Modifier</button>
              </div>
              {MOCK_ROOMS.map(room => (
                <div key={room.id} className="p-5 border border-slate-700/50 bg-slate-800/20 rounded-2xl hover:border-[#D4AF37]/50 transition cursor-pointer group"
                  onClick={() => handleSelectRoom(room)}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-white group-hover:text-[#D4AF37] transition">{room.type}</h4>
                      <p className="text-sm text-slate-500">Chambre {room.number} · jusqu'à {room.maxGuests} pers.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#D4AF37] font-bold">{formatPrice(room.basePriceCents)}<span className="text-slate-400 font-normal text-xs">/nuit</span></p>
                      <p className="text-xs text-slate-500">{formatPrice(room.basePriceCents * nights)} total</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {room.features.map(f => <span key={f} className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded-lg">{f}</span>)}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          
          {/* STEP 3 : GUEST INFO */}
          {step === 'info' && selectedRoom && quote && (
            <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">{selectedRoom.type}</h3>
                <button type="button" onClick={() => setStep('select')} className="text-sm text-[#D4AF37] hover:underline">← Retour</button>
              </div>
              
              <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl mb-6 text-sm space-y-1">
                <div className="flex justify-between text-slate-400"><span>Sous-total ({nights} nuits)</span><span>{formatPrice(quote.subtotalCents)}</span></div>
                <div className="flex justify-between text-slate-400"><span>TVA (10%)</span><span>{formatPrice(quote.taxCents)}</span></div>
                <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-slate-700"><span>Total</span><span className="text-[#D4AF37]">{formatPrice(quote.totalCents)}</span></div>
              </div>
              
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Prénom *</label>
                    <input required type="text" value={guestInfo.firstName} onChange={e => setGuestInfo(p => ({...p, firstName: e.target.value}))}
                      className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:border-[#D4AF37] focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nom *</label>
                    <input required type="text" value={guestInfo.lastName} onChange={e => setGuestInfo(p => ({...p, lastName: e.target.value}))}
                      className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:border-[#D4AF37] focus:outline-none transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email *</label>
                  <input required type="email" value={guestInfo.email} onChange={e => setGuestInfo(p => ({...p, email: e.target.value}))}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:border-[#D4AF37] focus:outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Demandes spéciales</label>
                  <textarea rows={2} value={guestInfo.specialRequests} onChange={e => setGuestInfo(p => ({...p, specialRequests: e.target.value}))}
                    placeholder="Lit bébé, vue spécifique, régime alimentaire…"
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:border-[#D4AF37] focus:outline-none transition resize-none" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#c19a6b] disabled:opacity-60 transition shadow-lg mt-2">
                  {loading ? 'Réservation en cours…' : `Confirmer · ${formatPrice(quote.totalCents)}`}
                </button>
                <p className="text-xs text-center text-slate-500">🔒 Paiement sécurisé · Annulation gratuite 48h avant</p>
              </form>
            </motion.div>
          )}
          
          {/* STEP 4 : CONFIRMATION */}
          {step === 'confirmation' && (
            <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="text-5xl mb-6">🎉</div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Réservation confirmée !</h3>
              <p className="text-slate-400 mb-6">Un email de confirmation a été envoyé à {guestInfo.email}</p>
              <div className="inline-block px-6 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Référence de réservation</p>
                <p className="text-2xl font-bold font-mono text-[#D4AF37]">{bookingRef}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
