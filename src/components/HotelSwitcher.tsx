import React, { useState } from 'react';
import { Building, ChevronDown, Check, RefreshCw } from 'lucide-react';
import { api } from '../api';

interface Hotel {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

interface HotelMembership {
  hotelId: string;
  hotelRole: string;
  hotel: Hotel;
}

interface ActiveHotel {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface HotelSwitcherProps {
  activeHotel: ActiveHotel | null;
  onHotelSwitch: (hotel: ActiveHotel) => void;
}

export const HotelSwitcher: React.FC<HotelSwitcherProps> = ({ activeHotel, onHotelSwitch }) => {
  const [open, setOpen] = useState(false);
  const [hotels, setHotels] = useState<HotelMembership[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const loadHotels = async () => {
    if (hotels.length > 0) return; // Already loaded
    setLoading(true);
    try {
      const data = await api.team.listAccessibleHotels();
      setHotels(data);
    } catch {
      // Backend not running — fail silently
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open) loadHotels();
  };

  const handleSwitch = async (hotelId: string) => {
    if (hotelId === activeHotel?.id) { setOpen(false); return; }
    setSwitching(hotelId);
    try {
      const result = await api.team.switchHotel(hotelId);
      onHotelSwitch(result.activeHotel);
      setOpen(false);
    } catch (err) {
      console.warn('Hotel switch failed:', err);
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition"
      >
        <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <div className="text-left max-w-[120px]">
          <div className="text-xs font-semibold text-white truncate leading-none">
            {activeHotel?.name || 'Hôtel'}
          </div>
          {activeHotel && (
            <div className="text-[9px] text-slate-400 leading-none mt-0.5">{activeHotel.role}</div>
          )}
        </div>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-slate-900 border border-amber-500/20 shadow-2xl z-50 overflow-hidden animate-fade-in">
            <div className="px-3 py-2 border-b border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                Vos Hôtels ({hotels.length})
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-6">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              </div>
            ) : hotels.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 text-center">
                Aucun hôtel accessible
              </div>
            ) : (
              <div className="p-1.5 space-y-0.5">
                {hotels.map(m => (
                  <button
                    key={m.hotelId}
                    onClick={() => handleSwitch(m.hotelId)}
                    disabled={switching === m.hotelId}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition ${
                      m.hotelId === activeHotel?.id
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {m.hotel.logoUrl ? (
                        <img src={m.hotel.logoUrl} alt={m.hotel.name} className="w-6 h-6 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                          <Building className="w-3 h-3 text-slate-400" />
                        </div>
                      )}
                      <div className="text-left min-w-0">
                        <div className="text-sm font-medium truncate">{m.hotel.name}</div>
                        <div className="text-[10px] text-slate-500">{m.hotelRole}</div>
                      </div>
                    </div>
                    {switching === m.hotelId ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                    ) : m.hotelId === activeHotel?.id ? (
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
