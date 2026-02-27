import { MapPin, CheckCircle2, XCircle, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidateAddressWidgetProps {
  formattedAddress: string
  inServiceArea: boolean
  coordinates: { lat: number; lng: number }
}

export function ValidateAddressWidget({ formattedAddress, inServiceArea, coordinates }: ValidateAddressWidgetProps) {
  return (
    <div className="mt-3 rounded-lg border border-gray-200 overflow-hidden">
      {/* Mocked Google Map */}
      <div className="relative h-44 bg-[#e8e4da] overflow-hidden select-none">
        {/* Water bodies */}
        <div className="absolute top-0 right-0 w-[45%] h-[40%] bg-[#aad3df] rounded-bl-[60px]" />
        <div className="absolute bottom-0 left-[20%] w-[35%] h-[25%] bg-[#aad3df] rounded-t-[40px]" />
        <div className="absolute top-[30%] right-0 w-[15%] h-[50%] bg-[#aad3df] rounded-l-[20px]" />

        {/* Land / park patches */}
        <div className="absolute top-[15%] left-[10%] w-[30%] h-[20%] bg-[#c8e6a0] rounded-lg opacity-60" />
        <div className="absolute bottom-[30%] left-[50%] w-[20%] h-[15%] bg-[#c8e6a0] rounded-md opacity-50" />

        {/* Major road grid */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Horizontal roads */}
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#fff" strokeWidth="2.5" opacity="0.7" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#fff" strokeWidth="3" opacity="0.8" />
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#fff" strokeWidth="2" opacity="0.6" />
          {/* Vertical roads */}
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#fff" strokeWidth="2" opacity="0.6" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#fff" strokeWidth="3" opacity="0.8" />
          <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#fff" strokeWidth="2.5" opacity="0.7" />
          {/* Diagonal avenue */}
          <line x1="10%" y1="85%" x2="65%" y2="15%" stroke="#fde68a" strokeWidth="2.5" opacity="0.6" />
          {/* Secondary streets */}
          <line x1="0" y1="15%" x2="100%" y2="15%" stroke="#fff" strokeWidth="1" opacity="0.35" />
          <line x1="0" y1="85%" x2="100%" y2="85%" stroke="#fff" strokeWidth="1" opacity="0.35" />
          <line x1="12%" y1="0" x2="12%" y2="100%" stroke="#fff" strokeWidth="1" opacity="0.35" />
          <line x1="38%" y1="0" x2="38%" y2="100%" stroke="#fff" strokeWidth="1" opacity="0.35" />
          <line x1="62%" y1="0" x2="62%" y2="100%" stroke="#fff" strokeWidth="1" opacity="0.35" />
          <line x1="88%" y1="0" x2="88%" y2="100%" stroke="#fff" strokeWidth="1" opacity="0.35" />
        </svg>

        {/* Service area radius circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-dashed border-green-500/50 bg-green-500/10" />

        {/* Pin marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center">
          <div className="relative">
            <div className="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500" />
          </div>
        </div>

        {/* Pin shadow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-0.5 w-4 h-1.5 bg-black/20 rounded-full blur-[1px]" />

        {/* Google Maps branding mock */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded px-1.5 py-0.5">
          <span className="text-[10px] font-medium text-gray-600">Google</span>
        </div>

        {/* Map controls mock */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <div className="w-7 h-7 bg-white rounded shadow flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">+</span>
          </div>
          <div className="w-7 h-7 bg-white rounded shadow flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">−</span>
          </div>
        </div>

        {/* Coordinates label */}
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-0.5">
          <span className="text-[10px] text-white font-mono">{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span>
        </div>
      </div>

      {/* Address + service area status */}
      <div className="p-4 space-y-3 bg-white">
        <div className="flex items-start gap-2.5">
          <Navigation className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-700 font-medium">{formattedAddress}</p>
        </div>

        <div className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2.5",
          inServiceArea ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
        )}>
          {inServiceArea ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 shrink-0" />
          )}
          <div>
            <p className={cn(
              "text-sm font-semibold",
              inServiceArea ? "text-green-800" : "text-red-800"
            )}>
              {inServiceArea ? "Within Service Area" : "Outside Service Area"}
            </p>
            <p className={cn(
              "text-xs",
              inServiceArea ? "text-green-600" : "text-red-600"
            )}>
              {inServiceArea
                ? "This address is covered by our service network"
                : "Unfortunately, we don't serve this area yet"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
