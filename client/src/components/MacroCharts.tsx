import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import type { MacroBreakdown } from '../utils/fitnessCalculators';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface MacroChartsProps {
  dailyMacros: MacroBreakdown;
  trainingMacros: MacroBreakdown;
  restMacros: MacroBreakdown;
}

export default function MacroCharts({ dailyMacros, trainingMacros, restMacros }: MacroChartsProps) {
  // Doughnut data for Daily Macro Split
  const doughnutData = {
    labels: [
      `Protein (${dailyMacros.proteinPercent}%)`,
      `Carbs (${dailyMacros.carbsPercent}%)`,
      `Fats (${dailyMacros.fatPercent}%)`,
    ],
    datasets: [
      {
        data: [dailyMacros.proteinGrams * 4, dailyMacros.carbsGrams * 4, dailyMacros.fatGrams * 9],
        backgroundColor: ['#ff4500', '#3b82f6', '#eab308'],
        borderColor: ['#07090e', '#07090e', '#07090e'],
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9ca3af',
          font: { size: 12, weight: 'bold' as const },
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} kcal`;
          },
        },
      },
    },
    cutout: '72%',
  };

  // Bar Chart data comparing Training Day vs Rest Day
  const barData = {
    labels: ['Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
    datasets: [
      {
        label: 'Training Day',
        data: [
          trainingMacros.calories,
          trainingMacros.proteinGrams,
          trainingMacros.carbsGrams,
          trainingMacros.fatGrams,
        ],
        backgroundColor: '#ff4500',
        borderRadius: 8,
      },
      {
        label: 'Rest Day',
        data: [
          restMacros.calories,
          restMacros.proteinGrams,
          restMacros.carbsGrams,
          restMacros.fatGrams,
        ],
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          font: { size: 12 },
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Donut Chart */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col items-center">
        <h3 className="text-lg font-bold text-white mb-1">Macro Calorie Distribution</h3>
        <p className="text-xs text-gray-400 mb-4">Target calorie contribution by macronutrient</p>
        <div className="relative w-64 h-64 flex items-center justify-center">
          <Doughnut data={doughnutData} options={doughnutOptions} />
          <div className="absolute flex flex-col items-center pointer-events-none">
            <span className="text-2xl font-extrabold text-white drop-shadow-sm">{dailyMacros.calories}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">kcal / day</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-4 border-t border-white/[0.08] text-center text-xs">
          <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5">
            <span className="text-accent font-bold block text-sm">{dailyMacros.proteinGrams}g</span>
            <span className="text-gray-400 text-[11px]">Protein</span>
          </div>
          <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5">
            <span className="text-blue-400 font-bold block text-sm">{dailyMacros.carbsGrams}g</span>
            <span className="text-gray-400 text-[11px]">Carbs</span>
          </div>
          <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5">
            <span className="text-yellow-400 font-bold block text-sm">{dailyMacros.fatGrams}g</span>
            <span className="text-gray-400 text-[11px]">Fats</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col items-center">
        <h3 className="text-lg font-bold text-white mb-1">Training vs Rest Day Cycling</h3>
        <p className="text-xs text-gray-400 mb-4">Fuel workouts on lifting days & recover on rest days</p>
        <div className="w-full h-64">
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="flex justify-between w-full mt-4 pt-4 border-t border-white/[0.08] text-xs text-gray-400">
          <span>⚡ Training: Extra carbs for glycogen</span>
          <span>💤 Rest: Hormonal recovery focus</span>
        </div>
      </div>
    </div>
  );
}
