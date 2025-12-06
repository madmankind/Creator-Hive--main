'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Segmented from './ui/Segmented'
import SearchBar from './SearchBar'
import AuthBar from './AuthBar'

export default function Hero() {
  const [mode, setMode] = useState<'hire' | 'getHired'>('hire')

  return (
    <section className="min-h-[80vh] grid place-items-center">
      <div className="w-full flex flex-col items-center gap-6 px-4">
        {/* Headline (Fey sizing & opacity) */}
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.01em]
                       text-white/90 select-none">
          Welcome to Creator Hive
        </h1>

        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { label: 'Hire', value: 'hire' },
            { label: 'Get hired', value: 'getHired' },
          ]}
        />

        {/* Sub text (centered) */}
        <p className="text-[14px] text-white/60 mt-1">
          Book Top 1% talent seamlessly
        </p>

        <AnimatePresence mode="wait">
          {mode === 'hire' ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="w-full grid place-items-center"
            >
              <SearchBar />
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="w-full grid place-items-center"
            >
              <AuthBar />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
