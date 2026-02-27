import logoSrc from "@/assets/housecallpro_logo.jpeg"

export function Logo() {
  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-2">
        <img
          src={logoSrc}
          alt="Housecall Pro"
          className="h-8 w-8 rounded-lg object-cover"
        />
        <div className="flex flex-col -space-y-1">
          <h4 className="font-semibold">AiVA</h4>
          <span className="text-xs text-gray-500">by Hosuecall Pro</span>
        </div>
      </div>
    </div>
  )
}
