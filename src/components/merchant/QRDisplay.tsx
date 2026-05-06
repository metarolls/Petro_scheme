import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Fuel, MapPin, Phone } from "lucide-react";

interface QRDisplayProps {
  pumpData: any;
}

export function QRDisplay({ pumpData }: QRDisplayProps) {
  const qrValue = JSON.stringify({
    pumpId: pumpData.pumpId,
    pumpName: pumpData.pumpName,
    location: pumpData.location,
    merchantPhone: pumpData.ownerPhone
  });

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="bg-white p-8 rounded-[48px] shadow-2xl shadow-blue-100 border-8 border-slate-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
        <div className="absolute bottom-0 left-0 w-full h-2 bg-blue-600" />
        
        <QRCodeSVG 
          value={qrValue} 
          size={240}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/vite.svg", // Using vite logo as placeholder for pump icon
            x: undefined,
            y: undefined,
            height: 40,
            width: 40,
            excavate: true,
          }}
        />
      </div>

      <Card className="w-full border-none bg-slate-50 rounded-[32px]">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Fuel className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pump Name</p>
              <p className="text-sm font-black text-slate-900">{pumpData.pumpName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
              <p className="text-sm font-black text-slate-900">{pumpData.location}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-600">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
              <p className="text-sm font-black text-slate-900">{pumpData.ownerPhone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
