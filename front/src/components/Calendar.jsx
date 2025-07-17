import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';

const EVENT_ICONS = {
  walk: '🐾',
  meal: '🍽',
  health: '🩺',
  symptom: '🤒',
};

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export default function Calendar() {
  const [pet, setPet] = useState(null);
  const [pets, setPets] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  useEffect(() => {
    async function fetchPetList() {
      setLoading(true);
      try {
        const petsRes = await axios.get('/pets');
        setPets(petsRes.data);
        setPet(petsRes.data[0]);
      } catch {
        setPets([]);
        setPet(null);
      }
      setLoading(false);
    }
    fetchPetList();
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      if (!pet) return;
      setLoading(true);
      try {
        const [walksRes, mealsRes, healthRes, symptomsRes] = await Promise.all([
          axios.get(`/walks/${pet.id}`),
          axios.get(`/meals/${pet.id}`),
          axios.get(`/health-events/${pet.id}`),
          axios.get(`/symptoms/${pet.id}`),
        ]);
        const evts = {};
        walksRes.data.forEach(w => {
          const d = new Date(w.start_time).toISOString().slice(0, 10);
          if (!evts[d]) evts[d] = [];
          evts[d].push({ type: 'walk', ...w });
        });
        mealsRes.data.forEach(m => {
          const d = new Date(m.datetime).toISOString().slice(0, 10);
          if (!evts[d]) evts[d] = [];
          evts[d].push({ type: 'meal', ...m });
        });
        healthRes.data.forEach(h => {
          const d = new Date(h.date).toISOString().slice(0, 10);
          if (!evts[d]) evts[d] = [];
          evts[d].push({ type: 'health', ...h });
        });
        symptomsRes.data.forEach(s => {
          const d = new Date(s.date).toISOString().slice(0, 10);
          if (!evts[d]) evts[d] = [];
          evts[d].push({ type: 'symptom', ...s });
        });
        setEvents(evts);
      } catch {
        setEvents({});
      }
      setLoading(false);
    }
    fetchEvents();
  }, [pet, month, year]);

  const days = getMonthDays(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  return (
    <div className="pb-24 bg-gradient-to-b from-blue-50 via-white to-gray-100 min-h-screen">
      <div className="px-2 pt-3 pb-0">
        <h1 className="text-base font-bold text-blue-700 mb-1 font-ranille">Calendrier</h1>
        {pets.length > 0 && (
          <select
            className="w-full p-0.5 rounded-lg border border-blue-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-blue-700 font-semibold mb-1 text-xs"
            value={pet?.id || ''}
            onChange={e => {
              const selected = pets.find(p => p.id === Number(e.target.value));
              setPet(selected);
            }}
          >
            {pets.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => setMonth(m => m === 0 ? 11 : m - 1)} className="text-blue-600 text-base px-1">◀</button>
          <span className="font-semibold text-xs">{today.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setMonth(m => m === 11 ? 0 : m + 1)} className="text-blue-600 text-base px-1">▶</button>
        </div>
      </div>
      <div className="w-full max-w-xs sm:max-w-md mx-auto">
        <div className="grid grid-cols-7 gap-0.5">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
            <div key={d} className="text-center font-semibold text-blue-700 text-[10px] py-0.5">{d}</div>
          ))}
          {/* Décalage du premier jour */}
          {Array((firstDayOfWeek + 6) % 7).fill(0).map((_, i) => <div key={i}></div>)}
          {days.map(day => {
            const key = day.toISOString().slice(0, 10);
            const evts = events[key] || [];
            return (
              <div key={key} className={`rounded-lg aspect-square w-full flex flex-col items-center justify-center border ${day.toDateString() === today.toDateString() ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <div className="font-bold text-[10px] mb-0 leading-none">{day.getDate()}</div>
                <div className="flex flex-wrap gap-0.5 justify-center">
                  {evts.map((e, i) => (
                    <span key={i} title={e.type} className="text-xs">
                      {EVENT_ICONS[e.type] || '•'}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      )}
    </div>
  );
} 