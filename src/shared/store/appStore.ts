import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { api } from '../api/client';
import {
  INITIAL_COURSES,
  INITIAL_ROOM_ORDERS,
  INITIAL_VIP_GUESTS,
  INITIAL_FLIGHTS,
  INITIAL_CHANNELS,
  INITIAL_SYNC_LOGS,
  INITIAL_VAULT_DOCS
} from '../data/mockData';
import type {
  Course,
  RoomServiceOrder,
  StaffMember,
  AuditLog,
  VaultDocument
} from '../../types';

type OrderStatus = RoomServiceOrder['status'];

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  'Preparation':      'Quality Check',
  'Quality Check':    'Out for Delivery',
  'Out for Delivery': 'Delivered',
  'Delivered':        null,
};

interface AppState {
  courses: Course[];
  orders: RoomServiceOrder[];
  staff: StaffMember[];
  
  // Arrivals
  vipGuests: typeof INITIAL_VIP_GUESTS;
  flights: typeof INITIAL_FLIGHTS;

  // Channel sync
  channels: typeof INITIAL_CHANNELS;
  syncLogs: typeof INITIAL_SYNC_LOGS;

  // Vault
  vaultDocs: VaultDocument[];

  // Climate / Suite Controls
  lightScene: 'ambient' | 'bright' | 'relax' | 'night';
  currentTemp: number;
  targetTemp: number;
  glassOpacity: number;
  glowingRooms: Record<string, boolean>;

  // Student Profile
  studentName: string;
  studentId: string;
  dob: string;
  major: string;
  blockchainId: string;

  toggleCourseAvailability: (id: string) => void;
  updateCoursePrice: (id: string, price: number) => void;

  advanceOrderStatus: (id: string) => void;
  addOrder: (order: RoomServiceOrder) => void;
  updateOrder: (id: string, patch: Partial<RoomServiceOrder>) => void;
  removeOrder: (id: string) => void;
  cancelOrder: (id: string, reason: string) => void;

  setStaffStatus: (id: string, status: StaffMember['status']) => void;
  addAuditEntry: (entry: AuditLog) => void;

  // Climate / Suite actions
  setLightScene: (scene: 'ambient' | 'bright' | 'relax' | 'night') => void;
  setCurrentTemp: (temp: number) => void;
  setTargetTemp: (temp: number) => void;
  setGlassOpacity: (opacity: number) => void;
  toggleRoomGlow: (room: string) => void;

  // Vault actions
  decryptDoc: (id: string) => void;

  // Ledger / Course actions
  addCourse: (course: Course) => void;
  removeCourse: (code: string) => void;

  fetchAppData: () => Promise<void>;
  connectWebSocket: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        courses: [],
        orders: [],
        staff: [],

        vipGuests: INITIAL_VIP_GUESTS,
        flights: INITIAL_FLIGHTS,

        channels: INITIAL_CHANNELS,
        syncLogs: INITIAL_SYNC_LOGS,

        vaultDocs: [],

        lightScene: 'ambient',
        currentTemp: 22,
        targetTemp: 23,
        glassOpacity: 65,
        glowingRooms: {
          '201': true,
          '202': false,
          '203': true,
          'corridor': true,
          'meeting': false
        },

        studentName: 'Elena Petrova',
        studentId: 'ZCA-2024-9182',
        dob: '1998-05-14',
        major: 'Master of Premium Hospitality',
        blockchainId: '0x89C...D4AF',

        toggleCourseAvailability: (id) =>
          set((state) => ({
            courses: state.courses.map((c) =>
              c.code === id ? { ...c, available: !c.available } : c
            ) as any,
          })),

        updateCoursePrice: (id, price) =>
          set((state) => ({
            courses: state.courses.map((c) =>
              c.code === id ? { ...c, price } : c
            ) as any,
          })),

        advanceOrderStatus: async (id) => {
          try {
            await apiFetch(`/room-service/orders/${id}/advance`, { method: 'PATCH' });
            set((state) => ({
              orders: state.orders.map((o) => {
                if (o.id !== id) return o;
                const next = STATUS_FLOW[o.status];
                return next ? { ...o, status: next } : o;
              }),
            }));
          } catch (e) {
            console.error('Failed to advance order', e);
          }
        },

        addOrder: async (order) => {
          try {
            const newOrder = await apiFetch<RoomServiceOrder>('/room-service/orders', { method: 'POST', body: order });
            set((state) => ({
              orders: [newOrder, ...state.orders],
            }));
          } catch (e) {
            console.error('Failed to add order', e);
          }
        },

        updateOrder: (id, patch) =>
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id ? { ...o, ...patch } : o
            ),
          })),

        removeOrder: (id) =>
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== id),
          })),

        cancelOrder: (id, reason) =>
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id
                ? { ...o, status: 'Delivered' as const, details: `${o.details}\n[CANCELLED: ${reason}]` }
                : o
            ),
          })),

        setStaffStatus: (id, status) =>
          set((state) => ({
            staff: state.staff.map((s) =>
              s.id === id ? { ...s, status } : s
            ),
          })),

        addAuditEntry: (entry) =>
          set((state) => ({
            staff: state.staff,
          })),

        setLightScene: (lightScene) => set({ lightScene }),
        setCurrentTemp: (currentTemp) => set({ currentTemp }),
        setTargetTemp: (targetTemp) => set({ targetTemp }),
        setGlassOpacity: (glassOpacity) => set({ glassOpacity }),
        toggleRoomGlow: (room) =>
          set((state) => ({
            glowingRooms: {
              ...state.glowingRooms,
              [room]: !state.glowingRooms[room],
            },
          })),

        decryptDoc: (id) => {
          set((state) => ({
            vaultDocs: state.vaultDocs.map((doc) =>
              doc.id === id ? { ...doc, decrypting: true } : doc
            ),
          }));

          const interval = setInterval(() => {
            let done = false;
            set((state) => {
              const nextDocs = state.vaultDocs.map((doc) => {
                if (doc.id === id && doc.decrypting) {
                  const nextProgress = doc.progress + 20;
                  if (nextProgress >= 100) {
                    done = true;
                    return { ...doc, progress: 100, encrypted: false, decrypting: false };
                  }
                  return { ...doc, progress: nextProgress };
                }
                return doc;
              });
              return { vaultDocs: nextDocs };
            });
            if (done) clearInterval(interval);
          }, 400);
        },

        addCourse: async (course) => {
          try {
            const newCourse = await apiFetch<Course>('/ledger/courses', { method: 'POST', body: course });
            set((state) => ({
              courses: [...state.courses, newCourse],
            }));
          } catch (e) {
            console.error('Failed to add course', e);
          }
        },

        removeCourse: (code) =>
          set((state) => ({
            courses: state.courses.filter((c) => c.code !== code),
          })),

        fetchAppData: async () => {
          try {
            const [orders, courses, staff, vaultDocs, controls] = await Promise.all([
              apiFetch<any[]>('/room-service/orders'),
              apiFetch<any[]>('/ledger/courses'),
              apiFetch<any[]>('/staff'),
              apiFetch<any[]>('/vault/documents'),
              apiFetch<any[]>('/controls/suites')
            ]);
            
            set({
              orders: orders.map(o => ({
                id: o.orderRef,
                guest: o.guestName,
                room: o.roomNumber,
                details: o.items?.[0]?.name || o.notes || 'Order',
                status: o.status,
                imgUrl: ''
              })),
              courses: courses.map(c => ({
                code: c.code,
                name: c.name,
                category: c.category,
                credits: c.credits,
                grade: c.grade,
                completedDate: c.completedDate
              })),
              staff: staff,
              vaultDocs: vaultDocs.map(d => ({
                id: d.id,
                name: d.name,
                encrypted: true,
                decrypting: false,
                progress: 0,
                securityLevel: 'VIP Elite'
              }))
            });
            
            if (controls && controls.length > 0) {
              const glowing: Record<string, boolean> = {};
              controls.forEach(c => glowing[c.suite] = c.lights);
              set({ glowingRooms: glowing });
            }
          } catch (e) {
            console.error('Failed to fetch initial app data', e);
          }
        },
        
        connectWebSocket: () => {
          const ws = new WebSocket(WS_URL);
          ws.onmessage = (event) => {
            try {
              const payload = JSON.parse(event.data);
              const state = get();
              
              if (payload.type === 'ROOM_ORDER_CREATED') {
                const o = payload.data;
                const newOrder: RoomServiceOrder = {
                  id: o.orderRef,
                  guest: o.guestName,
                  room: o.roomNumber,
                  details: o.items?.[0]?.name || o.notes || 'Order',
                  status: o.status,
                  imgUrl: ''
                };
                set({ orders: [newOrder, ...state.orders] });
              }
              else if (payload.type === 'ROOM_ORDER_ADVANCED') {
                set({ orders: state.orders.map(o => o.id === payload.data.orderRef ? { ...o, status: payload.data.status } : o) });
              }
              else if (payload.type === 'COURSE_ADDED') {
                const c = payload.data;
                const newCourse: Course = {
                  code: c.code,
                  name: c.name,
                  category: c.category,
                  credits: c.credits,
                  grade: c.grade,
                  completedDate: c.completedDate
                };
                set({ courses: [...state.courses, newCourse] });
              }
              else if (payload.type === 'SUITE_CONTROL_CHANGED') {
                set({ glowingRooms: { ...state.glowingRooms, [payload.data.suite]: payload.data.lights } });
              }
            } catch (e) {
              console.error('WebSocket parse error', e);
            }
          };
          
          ws.onclose = () => {
            setTimeout(() => get().connectWebSocket(), 3000);
          };
        }
      }),
      {
        name: 'zaphir-app-storage',
        partialize: (state) => ({
          orders: state.orders,
          staff: state.staff,
          courses: state.courses,
          vaultDocs: state.vaultDocs,
          lightScene: state.lightScene,
          currentTemp: state.currentTemp,
          targetTemp: state.targetTemp,
          glassOpacity: state.glassOpacity,
          glowingRooms: state.glowingRooms,
        }),
      }
    ),
    { name: 'AppStore' }
  )
);

