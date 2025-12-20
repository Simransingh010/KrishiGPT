"use client";

import { motion } from "framer-motion";
import { Droplets, Wind, Sun, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  forecast: Array<{
    day: string;
    temp: number;
    icon: string;
  }>;
}

interface WeatherCardProps {
  data: WeatherData;
  delay?: number;
  className?: string;
}

const weatherIcons: Record<string, string> = {
  "Sunny": "☀️",
  "Partly Cloudy": "⛅",
  "Cloudy": "☁️",
  "Rainy": "🌧️",
  "Stormy": "⛈️",
  "Clear": "🌙",
};

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {value}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

export function WeatherCard({ data, delay = 0, className }: WeatherCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 rounded-2xl p-5 text-white shadow-lg h-full transition-colors duration-300",
        className
      )}
    >
      {/* Location */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 opacity-80" />
        <span className="text-sm font-medium opacity-90">{data.location}</span>
      </div>

      {/* Main Temperature */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-start">
            <span className="text-6xl font-bold tracking-tight">
              <AnimatedNumber value={data.temperature} />
            </span>
            <span className="text-2xl font-light mt-1">°C</span>
          </div>
          <p className="text-sm opacity-90 mt-1">{data.condition}</p>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className="text-5xl"
        >
          {weatherIcons[data.condition] || "⛅"}
        </motion.div>
      </div>

      {/* Weather Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-white/20">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 opacity-70" />
          <div>
            <p className="text-xs opacity-70">Humidity</p>
            <p className="text-sm font-semibold">{data.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 opacity-70" />
          <div>
            <p className="text-xs opacity-70">Wind</p>
            <p className="text-sm font-semibold">{data.windSpeed} km/h</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 opacity-70" />
          <div>
            <p className="text-xs opacity-70">UV Index</p>
            <p className="text-sm font-semibold">{data.uvIndex}</p>
          </div>
        </div>
      </div>

      {/* 7-day Forecast */}
      <div className="border-t border-white/20 pt-3">
        <p className="text-xs font-medium opacity-70 mb-2">7-Day Forecast</p>
        <div className="flex justify-between overflow-x-auto">
          {data.forecast.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.3 + index * 0.05 }}
              className="flex flex-col items-center min-w-[40px]"
            >
              <span className="text-xs opacity-70">{day.day}</span>
              <span className="text-lg my-1">{day.icon}</span>
              <span className="text-xs font-semibold">{day.temp}°</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default WeatherCard;
