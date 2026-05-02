'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function MobilePreview() {
  const reduce = useReducedMotion();

  return (
    <section className="container-editorial mt-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-ash text-xs tracking-widest uppercase">Same brand, native feel</p>
          <h2 className="text-ink mt-2 font-serif text-4xl md:text-5xl">
            The Expo app travellers already expect.
          </h2>
          <p className="text-ink/70 mt-4 max-w-xl text-lg text-pretty">
            Discover, post requests, and message — with Eushop tokens, serif headlines, and a tab
            bar tuned for one-handed use between shifts.
          </p>
          <p className="text-ash mt-6 text-sm">
            Preview the native UI in the simulator, or{' '}
            <code className="bg-ink/5 rounded px-1.5 py-0.5 text-xs">
              pnpm --filter @eushop/mobile web
            </code>{' '}
            for Expo Web.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[320px]">
          <div className="border-ink/20 from-parchment to-bone relative aspect-[9/19.5] rounded-[2.5rem] border-[10px] bg-gradient-to-b p-1 shadow-2xl">
            <div className="border-ink/10 bg-paper relative h-full overflow-hidden rounded-[2rem] border">
              <div className="from-saffron-100/80 absolute inset-x-0 top-0 h-28 bg-gradient-to-b to-transparent" />
              <div className="relative flex h-full flex-col px-4 pt-10 pb-6">
                <p className="text-ink text-center font-serif text-lg">Today near you</p>
                <p className="text-ash mt-1 text-center text-xs">Munich · near you</p>
                <div className="mt-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.35 }}
                      className="border-ink/8 rounded-2xl border bg-white/90 p-3 shadow-sm"
                    >
                      <div className="bg-saffron-200/50 h-16 w-full rounded-xl" />
                      <div className="bg-ink/10 mt-2 h-2 w-2/3 rounded" />
                      <div className="bg-ink/5 mt-1 h-2 w-1/2 rounded" />
                    </motion.div>
                  ))}
                </div>
                <div className="border-ink/10 text-ash mt-auto flex justify-between border-t pt-3 text-[10px]">
                  <span>Discover</span>
                  <span className="text-ink font-serif text-xs">Today</span>
                  <span>Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
