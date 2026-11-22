import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Calculator,
  Utensils,
  MessageCircle,
  TrendingUp,
  Target,
  Zap,
  ChevronRight,
  ShieldCheck,
  Flame,
  Award,
} from 'lucide-react';

const features = [
  {
    icon: <Dumbbell className="w-8 h-8 text-accent" />,
    title: 'Workout Plans',
    desc: 'Pre-built plans for Bulk, Cut & Maintain — beginner to advanced with multiple splits.',
    link: '/plans',
  },
  {
    icon: <Calculator className="w-8 h-8 text-accent" />,
    title: 'Personalized Plan Generator',
    desc: 'Enter your stats, get a custom calorie, macro & workout plan with charts and timelines.',
    link: '/generator',
  },
  {
    icon: <Utensils className="w-8 h-8 text-accent" />,
    title: 'Meal Nutrition Calculator',
    desc: 'Search 150+ foods (including Indian), build meals, and track your daily macros.',
    link: '/nutrition',
  },
  {
    icon: <MessageCircle className="w-8 h-8 text-accent" />,
    title: 'AI Gym Coach',
    desc: 'Chat with an AI coach for exercise guidance, form tips, and personalized suggestions.',
    link: '/chat',
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-accent" />,
    title: 'Progress Tracker',
    desc: 'Log weight, measurements & workouts. See your trend with interactive charts.',
    link: '/progress',
  },
];

export default function HomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* ──────────── Hero Section ──────────── */}
      <section className="relative w-full overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-8 py-24 sm:py-32 lg:py-36 flex flex-col items-center justify-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 liquid-pill rounded-full px-5 py-2 mb-8 shadow-[0_0_20px_rgba(255,69,0,0.18)] liquid-glare">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm font-semibold tracking-wide">Next-Gen AI Fitness Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 text-center drop-shadow-md">
            Build Your Best Body
            <br />
            with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-orange-400 to-amber-300 drop-shadow-[0_0_25px_rgba(255,69,0,0.3)]">
              FitForge
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl text-center mx-auto">
            Personalized workout plans, smart nutrition tracking, and an AI coach —
            everything you need to achieve your dream physique.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-md mx-auto">
            <Link
              to="/generator"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 glass-button-accent text-white font-bold px-8 py-4 rounded-2xl text-base sm:text-lg transition-all"
            >
              <Target className="w-5 h-5" />
              <span>Get My Plan</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl text-white font-bold px-8 py-4 rounded-2xl text-base sm:text-lg border border-white/10 hover:border-white/20 transition-all shadow-lg"
            >
              <MessageCircle className="w-5 h-5 text-accent" />
              <span>Ask the AI Coach</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 pt-8">
            {[
              { value: '150+', label: 'Exercises Library' },
              { value: '9', label: 'Workout Splits' },
              { value: '150+', label: 'Foods Database' },
              { value: '24/7', label: 'AI Fitness Coach' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card flex flex-col items-center justify-center text-center p-4 rounded-2xl"
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1 drop-shadow-sm">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── Features Section ──────────── */}
      <section className="w-full py-24 sm:py-32 flex flex-col items-center">
        <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 flex flex-col items-center text-center">
          <div className="flex flex-col items-center text-center mb-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-accent text-xs font-bold tracking-wider uppercase mb-3 bg-accent/10 border border-accent/20 px-3.5 py-1 rounded-full">
              <Flame className="w-4 h-4" />
              <span>Core Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Everything You Need to{' '}
              <span className="text-accent drop-shadow-[0_0_15px_rgba(255,69,0,0.3)]">Transform</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
              From science-based workout planning to meal tracking and coaching guidance.
            </p>
          </div>

          {/* Centered Glass Cards */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 w-full">
            {features.map((f) => (
              <Link
                key={f.title}
                to={f.link}
                className="glass-card liquid-glare group w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm rounded-3xl p-8 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6 group-hover:bg-accent/15 group-hover:border-accent/30 group-hover:scale-110 shadow-inner transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── Bottom CTA ──────────── */}
      <section className="w-full py-24 sm:py-32 flex flex-col items-center text-center">
        <div className="glass-panel liquid-glare max-w-3xl mx-6 px-8 py-14 rounded-3xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-accent/20 blur-[80px] pointer-events-none" />
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 text-accent mb-6 shadow-[0_0_20px_rgba(255,69,0,0.25)]">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Ready to Start Your Transformation?
          </h2>
          <p className="text-gray-300 text-base sm:text-lg mb-8 max-w-xl">
            Calculate your exact calories, macros, and workout routine in under a minute. 100% free.
          </p>
          <Link
            to="/generator"
            className="glass-button-accent text-white font-bold px-10 py-4 rounded-2xl text-lg flex items-center gap-2.5 transition-all"
          >
            <Target className="w-5 h-5" />
            <span>Generate Free Plan</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
