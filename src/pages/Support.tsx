import * as React from "react"
import { Phone, MessageSquare, Video, ChevronDown, ChevronUp, HelpCircle, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { comingSoon } from "@/lib/utils"

const faqs = [
  {
    question: "How to scan coupons?",
    answer: "Go to the Contractor home screen and tap the 'Scan Coupon' button. Align the QR code within the frame, and your rewards will be credited instantly."
  },
  {
    question: "When is fuel credit added?",
    answer: "Fuel credits are typically added within 2-5 minutes of a successful coupon scan or reward processing. You can check your wallet history for updates."
  },
  {
    question: "Can I use rewards at any petrol pump?",
    answer: "Rewards can be redeemed at any authorized HP Fuel partner pump listed in the 'Petrol Pumps' section of the app."
  },
  {
    question: "How to update my mobile number?",
    answer: "You can update your mobile number from the Settings page. For security reasons, you may need to verify the new number with an OTP."
  }
]

export function Support() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null)

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hello TMT Fuel Support, I need help with my rewards.")
    window.open(`https://wa.me/919876543210?text=${message}`, "_blank")
  }

  const handleCall = () => {
    window.location.href = "tel:+919876543210"
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="space-y-8 pb-24 max-w-4xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Support</h1>
        <p className="text-sm text-slate-500 font-medium">How can we help you today? Our team is available 24/7.</p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Button 
            onClick={handleWhatsApp}
            className="w-full h-24 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-100 text-emerald-700 rounded-[2rem] flex flex-col items-center justify-center gap-1 transition-all group"
          >
            <MessageSquare className="h-6 w-6 transition-transform group-hover:scale-110" />
            <span className="font-bold">WhatsApp Support</span>
            <span className="text-[10px] opacity-70">Average response: 5 mins</span>
          </Button>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Button 
            onClick={handleCall}
            className="w-full h-24 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-100 text-indigo-700 rounded-[2rem] flex flex-col items-center justify-center gap-1 transition-all group"
          >
            <Phone className="h-6 w-6 transition-transform group-hover:scale-110" />
            <span className="font-bold">Direct Call</span>
            <span className="text-[10px] opacity-70">Available 10 AM - 6 PM</span>
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 px-2">
            <HelpCircle className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Common Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-none shadow-sm rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="text-sm font-bold text-slate-700">{faq.question}</span>
                  {openFaq === index ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="px-6 pb-4 pt-0 text-sm text-slate-500 leading-relaxed border-t border-slate-50 mt-2">
                        <div className="pt-4 italic">
                          {faq.answer}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Video Tutorial Placeholder */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Video className="h-5 w-5 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">Tutorials</h2>
          </div>
          <Card 
            className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-slate-900 aspect-video relative group cursor-pointer"
            onClick={() => comingSoon("Video Tutorial")}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform border border-white/30">
                <div className="h-0 w-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs font-bold text-white uppercase tracking-widest opacity-60">Getting Started</p>
              <p className="text-sm font-bold text-white">How to use Metaroll Rewards</p>
            </div>
          </Card>
          <Button 
            variant="outline" 
            className="w-full rounded-2xl border-slate-200 text-slate-600 font-bold h-11 gap-2"
            onClick={() => comingSoon("User Manual")}
          >
            <ExternalLink className="h-4 w-4" />
            View User Manual
          </Button>
        </motion.div>
      </div>

      {/* Footer Support Message */}
      <motion.div 
        variants={itemVariants}
        className="text-center space-y-4 pt-8 border-t border-slate-100"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full">
          <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-xs font-bold text-indigo-700">Support Desk is Online</span>
        </div>
        <p className="text-sm text-slate-400 font-medium">
          Still have questions? Reach out to us directly<br/>at <span className="text-slate-900 font-bold">support@tmtfuel.com</span>
        </p>
      </motion.div>
    </motion.div>
  )
}
