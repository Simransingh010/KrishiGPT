"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const locations = [
  "Ludhiana, Punjab",
  "Amritsar, Punjab",
  "Chandigarh",
  "Karnal, Haryana",
  "Hisar, Haryana",
  "Jaipur, Rajasthan",
  "Kota, Rajasthan",
  "Indore, MP",
  "Bhopal, MP",
  "Nagpur, Maharashtra",
];

export function LocationSelector({ value, onChange, className }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
      >
        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{value}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 overflow-hidden"
            >
              <div className="py-1 max-h-64 overflow-y-auto">
                {locations.map((location) => (
                  <button
                    key={location}
                    onClick={() => {
                      onChange(location);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors",
                      location === value 
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30" 
                        : "text-slate-700 dark:text-slate-200"
                    )}
                  >
                    <span>{location}</span>
                    {location === value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LocationSelector;
