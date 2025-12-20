"use client";

import { motion } from "framer-motion";
import { Droplets, Wind, Sun, MapPin, CloudRain } from "lucide-react";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  rainProbability: number;
  forecast: Array<{
    day: string;
    temp: number;
    icon: string;
  }>;
}

interface WeatherHeroProps {
  data: WeatherData;
}

const conditionGradients: Record<string, string> = {
  "Sunny": "from-amber-400 via-orange-400 to-yellow-300",
  "Partly Cloudy": "from-blue-400 via-sky-400 to-cyan-300",
  "Cloudy": "from-slate-400 via-gray-400 to-slate-300",
  "Rainy": "from-blue-500 via-indigo-500 to-blue-400",
  "Stormy": "from-slate-600 via-purple-600 to-slate-500",
  "Clear": "from-indigo-500 via-purple-500 to-pink-400",
};

const conditionEmoji: Record<string, string> = {
  "Sunny": "☀️",
  "Partly Cloudy": "⛅",
  "Cloudy": "☁️",
  "Rainy": "🌧️",
  "Stormy": "⛈️",
  "Clear": "🌙",
};

export function WeatherHero({ data }: WeatherHeroProps) {
  const gradient = conditionGradients[data.condition] || conditionGradients["Partly Cloudy"];
  const emoji = conditionEmoji[data.condition] || "⛅";

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} dark:from-slate-800 dark:via-slate-900 dark:to-slate-800`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 text-white/90 dark:text-slate-200 mb-4"
        >
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide">{data.location}</span>
        </motion.div>

        {/* Main Temperature Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Temperature */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex items-start"
            >
              <span className="text-7xl sm:text-8xl lg:text-9xl font-light text-white dark:text-slate-50 tracking-tighter leading-none drop-shadow-sm">
                {data.temperature}
              </span>
              <span className="text-2xl sm:text-3xl font-normal text-white/80 dark:text-slate-200 mt-2">°C</span>
            </motion.div>

            {/* Condition & Emoji */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 sm:pt-6"
            >
              <span className="text-4xl sm:text-5xl">{emoji}</span>
              <p className="text-lg sm:text-xl text-white dark:text-slate-100 font-semibold mt-2">
                {data.condition}
              </p>
            </motion.div>
          </div>

          {/* 3-Day Mini Forecast */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden sm:flex gap-4"
          >
            {data.forecast.slice(0, 3).map((day, i) => (
              <div key={day.day} className="text-center">
                <p className="text-xs text-white/70 dark:text-slate-300 uppercase tracking-wider font-medium">{day.day}</p>
                <p className="text-xl my-1">{day.icon}</p>
                <p className="text-sm font-bold text-white dark:text-slate-100">{day.temp}°</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Inline Status Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-6 sm:gap-8 mt-6 pt-6 border-t border-white/20 dark:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-white/80 dark:text-slate-300" />
            <span className="text-sm text-white dark:text-slate-200">
              <span className="font-bold">{data.humidity}%</span>
              <span className="text-white/70 dark:text-slate-400 ml-1 font-medium">humidity</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-white/80 dark:text-slate-300" />
            <span className="text-sm text-white dark:text-slate-200">
              <span className="font-bold">{data.windSpeed}</span>
              <span className="text-white/70 dark:text-slate-400 ml-1 font-medium">km/h wind</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-white/80 dark:text-slate-300" />
            <span className="text-sm text-white dark:text-slate-200">
              <span className="font-bold">UV {data.uvIndex}</span>
              <span className="text-white/70 dark:text-slate-400 ml-1 font-medium">
                {data.uvIndex <= 2 ? "low" : data.uvIndex <= 5 ? "moderate" : "high"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-white/80 dark:text-slate-300" />
            <span className="text-sm text-white dark:text-slate-200">
              <span className="font-bold">{data.rainProbability}%</span>
              <span className="text-white/70 dark:text-slate-400 ml-1 font-medium">rain chance</span>
            </span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default WeatherHero;

