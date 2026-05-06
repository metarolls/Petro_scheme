import * as React from "react"
import confetti from "canvas-confetti"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface SuccessAnimationProps {
  amount: string;
  message: string;
  submessage?: string;
}

export function SuccessAnimation({ amount, message, submessage }: SuccessAnimationProps) {
  React.useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center py-10">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
        className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center"
      >
        <CheckCircle2 className="h-16 w-16 text-emerald-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
          {amount}
        </h2>
        <p className="text-xl font-bold text-slate-600">
          {message}
        </p>
        {submessage && (
          <p className="text-sm text-slate-400 font-medium pt-2">
            {submessage}
          </p>
        )}
      </motion.div>
    </div>
  );
}
