import { useState } from 'react';
import { Building, ChevronDown, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../shared/api/client';
import { toast } from './ui/Toast';
import { useQuery, useMutation } from '@tanstack/react-query';

export const HotelSwitcher = () => {
  const { user, activeHotel, setActiveHotel } = useAuthStore();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const { data: hotels = [] } = useQuery({
    queryKey: ['accessible-hotels'],
    queryFn: () => api.team.listAccessibleHotels(),
  });

  const switchMutation = useMutation({
    mutationFn: (hotelId: string) => api.team.switchHotel(hotelId),
    onSuccess: ({ data }: any) => {
      setActiveHotel(data.activeHotel);
      toast.success('Hôtel changé', data.activeHotel.name);
      setOpen(false);
      window.location.reload();
    },
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700"
      >
        <Building className="w-4 h-4 text-amber-400" />
        <div className="text-left">
          <div className="text-sm font-semibold text-slate-100">{activeHotel?.name || 'Aucun hôtel'}</div>
          {activeHotel && <div className="text-xs text-slate-400">Rôle: {activeHotel.role}</div>}
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-amber-500/30 shadow-xl z-20 animate-fade-in">
            <div className="p-2">
              <div className="px-3 py-2 text-xs text-slate-500 uppercase tracking-wide">
                Vos hôtels ({hotels.length})
              </div>
              {hotels.map((m: any) => (
                <button
                  key={m.hotelId}
                  onClick={() => switchMutation.mutate(m.hotelId)}
                  disabled={m.hotelId === activeHotel?.id}
                  className={`
                    w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm
                    ${m.hotelId === activeHotel?.id
                      ? 'bg-amber-500/20 text-amber-300 cursor-default'
                      : 'text-slate-300 hover:bg-slate-800'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {m.hotel.logoUrl ? (
                      <img src={m.hotel.logoUrl} alt={m.hotel.name} className="w-6 h-6 rounded-md object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center">
                        <Building className="w-3 h-3 text-slate-400" />
                      </div>
                    )}
                    <div className="text-left">
                      <div className="font-medium text-slate-200">{m.hotel.name}</div>
                      <div className="text-xs text-slate-500">{m.hotelRole}</div>
                    </div>
                  </div>
                  {m.hotelId === activeHotel?.id && <Check className="w-4 h-4 text-amber-500" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
