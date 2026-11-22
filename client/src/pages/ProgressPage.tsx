import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Scale,
  Ruler,
  Plus,
  Trash2,
  Target,
  Sparkles,
  CheckCircle2,
  Award,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface WeightLog {
  id: number;
  date: string;
  weight_kg: number;
  chest_cm?: number;
  waist_cm?: number;
  arms_cm?: number;
  notes?: string;
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [targetWeight, setTargetWeight] = useState<number>(75);
  const [startWeight, setStartWeight] = useState<number>(82);

  const [showLogModal, setShowLogModal] = useState(false);
  const [weightInput, setWeightInput] = useState<number>(80);
  const [chestInput, setChestInput] = useState<string>('');
  const [waistInput, setWaistInput] = useState<string>('');
  const [armsInput, setArmsInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('fitforge_user_stats');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        if (stats.targetWeightKg) setTargetWeight(stats.targetWeightKg);
        if (stats.weightKg) {
          setStartWeight(stats.weightKg);
          setWeightInput(stats.weightKg);
        }
      }
    } catch (e) {}
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('fitforge_token');
      const res = await fetch('/api/progress/logs', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        if (data.logs.length === 0) {
          const sampleLogs: WeightLog[] = [
            { id: 1, date: '2026-10-01', weight_kg: startWeight, waist_cm: 86, chest_cm: 102 },
            { id: 2, date: '2026-10-08', weight_kg: startWeight - 0.7, waist_cm: 85.5, chest_cm: 102 },
            { id: 3, date: '2026-10-15', weight_kg: startWeight - 1.4, waist_cm: 84.8, chest_cm: 102.5 },
            { id: 4, date: '2026-10-22', weight_kg: startWeight - 2.1, waist_cm: 84.0, chest_cm: 103 },
          ];
          setLogs(sampleLogs);
        } else {
          setLogs(data.logs);
        }
      }
    } catch (e) {
      console.error('Fetch progress error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('fitforge_token');

    try {
      const res = await fetch('/api/progress/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          date: dateInput,
          weightKg: weightInput,
          chestCm: chestInput ? parseFloat(chestInput) : null,
          waistCm: waistInput ? parseFloat(waistInput) : null,
          armsCm: armsInput ? parseFloat(armsInput) : null,
          notes: notesInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowLogModal(false);
        fetchLogs();
      }
    } catch (err) {
      console.error('Failed to log weight:', err);
    }
  };

  const handleDeleteLog = async (id: number) => {
    const token = localStorage.getItem('fitforge_token');
    try {
      await fetch(`/api/progress/log/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {}
  };

  const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight_kg : startWeight;
  const weightChange = parseFloat((latestWeight - startWeight).toFixed(1));

  const chartLabels = logs.map((l) => l.date);
  const weightDataPoints = logs.map((l) => l.weight_kg);
  const targetLineData = logs.map(() => targetWeight);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Weight (kg)',
        data: weightDataPoints,
        borderColor: '#ff4500',
        backgroundColor: 'rgba(255, 69, 0, 0.18)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#ff4500',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: `Target Goal (${targetWeight} kg)`,
        data: targetLineData,
        borderColor: '#10b981',
        borderDash: [6, 6],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          font: { size: 12, weight: 'bold' as const },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw} kg`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
    },
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 mb-4 shadow-[0_0_15px_rgba(255,69,0,0.15)]">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="text-accent text-xs sm:text-sm font-semibold">Long-Term Body Composition</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
          Progress & <span className="text-accent drop-shadow-[0_0_15px_rgba(255,69,0,0.3)]">Measurement Tracker</span>
        </h1>
        <p className="text-gray-300 text-sm sm:text-base">
          Track weekly weight trends against your target, log body circumference measurements, and celebrate body transformations.
        </p>
      </div>

      {/* Metrics Highlights Bar (Glass Cards) */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 rounded-2xl text-center">
          <span className="text-xs text-gray-400 font-medium block mb-1">Current Weight</span>
          <span className="text-3xl font-extrabold text-white drop-shadow-sm">{latestWeight} kg</span>
          <span className="text-[11px] block mt-1 text-gray-400">Latest recorded check-in</span>
        </div>

        <div className="glass-card p-5 rounded-2xl text-center">
          <span className="text-xs text-gray-400 font-medium block mb-1">Target Weight</span>
          <span className="text-3xl font-extrabold text-green-400 drop-shadow-sm">{targetWeight} kg</span>
          <span className="text-[11px] block mt-1 text-gray-400">Defined fitness milestone</span>
        </div>

        <div className="glass-card p-5 rounded-2xl text-center">
          <span className="text-xs text-gray-400 font-medium block mb-1">Total Net Change</span>
          <span className={`text-3xl font-extrabold drop-shadow-sm ${weightChange <= 0 ? 'text-accent' : 'text-blue-400'}`}>
            {weightChange > 0 ? `+${weightChange}` : weightChange} kg
          </span>
          <span className="text-[11px] block mt-1 text-gray-400">Since starting journey</span>
        </div>

        <div className="glass-card p-5 rounded-2xl text-center flex flex-col items-center justify-center">
          <button
            onClick={() => setShowLogModal(true)}
            className="w-full glass-button-accent text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Log Check-In</span>
          </button>
        </div>
      </div>

      {/* ────────────────── LINE CHART SECTION (GLASS PANEL) ────────────────── */}
      <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/[0.08]">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-1">Visual Weight Trend</span>
            <h2 className="text-2xl font-extrabold text-white">Weight Trend vs Goal Target</h2>
          </div>
          <div className="text-xs text-gray-300 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
            🟢 Green Dashed: Target Goal | 🔴 Orange: Check-in Trend
          </div>
        </div>

        <div className="w-full h-80 sm:h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* ────────────────── LOGS TABLE & MEASUREMENTS ────────────────── */}
      <div className="w-full glass-panel rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08]">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            <span>Check-in History & Body Circumference</span>
          </h3>
          <button
            onClick={() => setShowLogModal(true)}
            className="text-xs text-accent hover:text-orange-400 font-bold flex items-center gap-1"
          >
            <span>+ Add Entry</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-white/[0.03] uppercase text-[10px] text-gray-400 border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Date</th>
                <th className="py-3 px-4">Weight (kg)</th>
                <th className="py-3 px-4">Waist (cm)</th>
                <th className="py-3 px-4">Chest (cm)</th>
                <th className="py-3 px-4">Arms (cm)</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>{log.date}</span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-accent">{log.weight_kg} kg</td>
                  <td className="py-3.5 px-4 text-gray-300">{log.waist_cm ? `${log.waist_cm} cm` : '—'}</td>
                  <td className="py-3.5 px-4 text-gray-300">{log.chest_cm ? `${log.chest_cm} cm` : '—'}</td>
                  <td className="py-3.5 px-4 text-gray-300">{log.arms_cm ? `${log.arms_cm} cm` : '—'}</td>
                  <td className="py-3.5 px-4 text-gray-400 italic max-w-xs truncate">{log.notes || '—'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="text-gray-400 hover:text-red-400 p-1.5 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────────────── LOG MODAL (GLASS) ────────────────── */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-accent" />
                <span>Record New Weigh-In</span>
              </h3>
              <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    required
                    value={weightInput}
                    onChange={(e) => setWeightInput(parseFloat(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 82"
                    value={waistInput}
                    onChange={(e) => setWaistInput(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 102"
                    value={chestInput}
                    onChange={(e) => setChestInput(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 38"
                    value={armsInput}
                    onChange={(e) => setArmsInput(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Notes / Energy Levels</label>
                <input
                  type="text"
                  placeholder="e.g., Fasted morning weigh-in"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-button-accent text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
