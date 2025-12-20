"use client";

import Header from "@/components/Header/Header";
import { WeatherHero } from "@/components/dashboard/WeatherHero";
import { StatusChips, generateStatusChips } from "@/components/dashboard/StatusChips";
import { PriceList } from "@/components/dashboard/PriceList";
import { TimelineFeed } from "@/components/dashboard/TimelineFeed";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { motion } from "framer-motion";
import { BarChart2, Leaf, Calendar } from "lucide-react";

// Weather data
const weatherData = {
  location: "Ludhiana, Punjab",
  temperature: 28,
  condition: "Partly Cloudy",
  humidity: 65,
  windSpeed: 12,
  uvIndex: 6,
  rainProbability: 20,
  forecast: [
    { day: "Mon", temp: 29, icon: "☀️" },
    { day: "Tue", temp: 27, icon: "⛅" },
    { day: "Wed", temp: 25, icon: "🌧️" },
    { day: "Thu", temp: 26, icon: "⛅" },
    { day: "Fri", temp: 28, icon: "☀️" },
    { day: "Sat", temp: 30, icon: "☀️" },
    { day: "Sun", temp: 29, icon: "⛅" },
  ],
};

// Status chips data
const statusChipsData = generateStatusChips({
  aqi: 142,
  soilMoisture: 68,
  soilPh: 6.8,
  rainProbability: 20,
  marketSentiment: "bullish",
});

// MSP Prices data
const priceData = [
  {
    id: "wheat",
    name: "Wheat",
    icon: "🌾",
    price: 2275,
    change: 75,
    changePercent: 3.4,
    trend: [2100, 2150, 2180, 2200, 2225, 2250, 2275],
  },
  {
    id: "rice",
    name: "Paddy",
    icon: "🌾",
    price: 2183,
    change: 83,
    changePercent: 4.0,
    trend: [2000, 2050, 2080, 2100, 2140, 2160, 2183],
  },
  {
    id: "cotton",
    name: "Cotton",
    icon: "🌿",
    price: 6620,
    change: 120,
    changePercent: 1.8,
    trend: [6200, 6300, 6400, 6500, 6550, 6600, 6620],
  },
  {
    id: "soybean",
    name: "Soybean",
    icon: "🫘",
    price: 4600,
    change: -100,
    changePercent: -2.1,
    trend: [4800, 4750, 4700, 4650, 4600, 4580, 4600],
  },
  {
    id: "mustard",
    name: "Mustard",
    icon: "🌻",
    price: 5650,
    change: 150,
    changePercent: 2.7,
    trend: [5300, 5400, 5450, 5500, 5580, 5620, 5650],
  },
  {
    id: "groundnut",
    name: "Groundnut",
    icon: "🥜",
    price: 6377,
    change: 177,
    changePercent: 2.9,
    trend: [6000, 6100, 6150, 6200, 6300, 6350, 6377],
  },
];

// Timeline feed data
const timelineData = [
  {
    id: "1",
    type: "opportunity" as const,
    title: "Wheat prices are favorable",
    message: "Market prices are ₹175 above MSP. Consider selling your wheat stock for optimal returns.",
    time: "Just now",
    actionable: true,
  },
  {
    id: "2",
    type: "weather" as const,
    title: "Rain expected Wednesday",
    message: "Light showers forecasted. Perfect timing to pause irrigation and save water costs.",
    time: "2h ago",
  },
  {
    id: "3",
    type: "insight" as const,
    title: "Optimal irrigation window",
    message: "Soil moisture is at 68%. Ideal time to irrigate wheat fields before the weekend heat.",
    time: "4h ago",
    actionable: true,
  },
  {
    id: "4",
    type: "warning" as const,
    title: "Frost advisory next week",
    message: "Temperatures may drop below 5°C. Prepare protective measures for sensitive crops.",
    time: "Yesterday",
  },
  {
    id: "5",
    type: "harvest" as const,
    title: "Cotton harvest season",
    message: "Cotton harvest window begins in 15 days. Start preparing storage and transportation.",
    time: "2 days ago",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Header />
      
      {/* Weather Hero Section */}
      <WeatherHero data={weatherData} />
      
      {/* Status Chips Row */}
      <StatusChips chips={statusChipsData} />
      
      {/* Main Content */}
      <div className="p-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
          
          {/* Left Column: Prices */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800/50">
            <PriceList items={priceData} title="Today's MSP Rates" />
            
            {/* Insight Cards */}
            <div className="px-4 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InsightCard
                title="Expected Yield"
                subtitle="Based on current conditions"
                value="42"
                unit="q/ha"
                trend={{ value: 11, isPositive: true }}
                gradient="from-emerald-500 to-teal-600"
              />
              <InsightCard
                title="Crop Health"
                subtitle="Overall field status"
                value="85"
                unit="%"
                gradient="from-blue-500 to-indigo-600"
              />
            </div>
            
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-4 pb-6"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">25.5</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hectares</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">4</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Crops</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">2</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Harvests Soon</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column: Timeline Feed */}
          <div className="lg:col-span-5">
            <TimelineFeed items={timelineData} title="Updates & Insights" />
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="h-20 bg-gradient-to-t from-white dark:from-slate-950 to-transparent" />
    </div>
  );
}
