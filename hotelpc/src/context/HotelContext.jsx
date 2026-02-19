import { createContext, useContext, useReducer, useCallback } from 'react';

const STORAGE_KEY = 'eshotel_hotel_list';

function migrateHotel(h) {
  if (h.reviewStatus === undefined) h.reviewStatus = 'approved';
  if (!['draft', 'pending', 'approved', 'rejected'].includes(h.reviewStatus)) h.reviewStatus = 'draft';
  if (h.published === undefined) h.published = false;
  if (h.rejectReason === undefined) h.rejectReason = '';
  if (h.roomTypes === undefined) {
    const names = Array.isArray(h.roomType) ? h.roomType : [];
    const price = h.price != null ? Number(h.price) : null;
    h.roomTypes = names.map((name, i) => ({
      id: `rt_${h.id}_${i}_${Date.now()}`,
      name: String(name),
      price: price != null ? price : undefined,
    }));
  }
  if (h.createdBy === undefined) h.createdBy = '';
  return h;
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return list.map(migrateHotel);
  } catch {
    return [];
  }
}

function saveToStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to persist hotel list', e);
  }
}

const HotelContext = createContext(null);

function hotelReducer(state, action) {
  switch (action.type) {
    case 'SET_LIST':
      return { list: action.payload };
    case 'SAVE_ONE': {
      const { hotel, submitForReview = false } = action.payload;
      const list = [...state.list];
      const idx = list.findIndex((h) => h.id === hotel.id);
      const base = { ...hotel, updatedAt: Date.now() };
      const published = idx >= 0 ? list[idx].published : false;
      const roomTypes = Array.isArray(hotel.roomTypes) ? hotel.roomTypes : (idx >= 0 ? list[idx].roomTypes : []) || [];
      const createdBy = hotel.createdBy != null ? hotel.createdBy : (idx >= 0 ? list[idx].createdBy : '') || '';
      let reviewStatus;
      let rejectReason;
      if (idx >= 0) {
        reviewStatus = submitForReview ? 'pending' : (list[idx].reviewStatus || 'draft');
        rejectReason = submitForReview ? '' : (list[idx].rejectReason || '');
      } else {
        reviewStatus = submitForReview ? 'pending' : 'draft';
        rejectReason = '';
      }
      if (idx >= 0) {
        list[idx] = { ...base, reviewStatus, published, roomTypes, createdBy, rejectReason };
      } else {
        list.push({
          ...base,
          id: hotel.id || `hotel_${Date.now()}`,
          createdAt: Date.now(),
          reviewStatus,
          published: false,
          rejectReason: '',
          roomTypes,
          createdBy,
        });
      }
      saveToStorage(list);
      return { list };
    }
    case 'REVIEW': {
      const { id, reviewStatus, rejectReason } = action.payload;
      const list = state.list.map((h) =>
        h.id === id ? { ...h, reviewStatus, rejectReason: rejectReason || '', updatedAt: Date.now() } : h
      );
      saveToStorage(list);
      return { list };
    }
    case 'SET_PUBLISHED': {
      const { id, published } = action.payload;
      const list = state.list.map((h) => (h.id === id ? { ...h, published, updatedAt: Date.now() } : h));
      saveToStorage(list);
      return { list };
    }
    case 'REMOVE_ONE': {
      const list = state.list.filter((h) => h.id !== action.payload.id);
      saveToStorage(list);
      return { list };
    }
    default:
      return state;
  }
}

export function HotelProvider({ children }) {
  const [state, dispatch] = useReducer(hotelReducer, { list: loadFromStorage() });

  const saveHotel = useCallback((hotel, options = {}) => {
    dispatch({ type: 'SAVE_ONE', payload: { hotel, submitForReview: options.submitForReview === true } });
  }, []);

  const removeHotel = useCallback((id) => {
    dispatch({ type: 'REMOVE_ONE', payload: { id } });
  }, []);

  const setReview = useCallback((id, reviewStatus, rejectReason = '') => {
    dispatch({ type: 'REVIEW', payload: { id, reviewStatus, rejectReason } });
  }, []);

  const setPublished = useCallback((id, published) => {
    dispatch({ type: 'SET_PUBLISHED', payload: { id, published } });
  }, []);

  const value = {
    hotelList: state.list,
    saveHotel,
    removeHotel,
    setReview,
    setPublished,
  };

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
}

export function useHotel() {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used within HotelProvider');
  return ctx;
}
