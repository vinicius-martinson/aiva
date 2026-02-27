import logoSrc from "@/assets/housecallpro_logo.jpeg"

export function PoweredByFooter() {
  return (
    <footer className="flex items-center justify-center gap-1.5 py-1 border-t bg-blue-950">
      <img
        src={logoSrc}
        alt="Housecall Pro"
        className="h-4 w-4 rounded object-cover"
      />
      <span className="text-[11px] text-white">Powered by Housecall Pro</span>
    </footer>
  )
}
