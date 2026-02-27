import { useState } from "react"
import {
  MessageSquareText,
  PhoneIncoming,
  ChevronUp,
  ChevronDown,
  Headset,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { faqSections, type FAQSection, type FAQItem } from "@/data/faqsMockData"

const sectionIcons: Record<string, typeof MessageSquareText> = {
  "message-square-text": MessageSquareText,
  "phone-incoming": PhoneIncoming,
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <span className="text-[15px] font-medium text-foreground leading-relaxed pr-4">
          {item.question}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  )
}

function FAQSectionCard({ section }: { section: FAQSection }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const Icon = sectionIcons[section.icon]

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b">
        {Icon && <Icon className="h-[22px] w-[22px] text-blue-600" />}
        <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
      </div>

      {/* Accordion items */}
      <div className="px-5">
        {section.items.map((item, i) => (
          <AccordionItem
            key={i}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </div>
  )
}

export function FAQsPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-16 border-b bg-card shrink-0">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-foreground">FAQs</h2> 
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-12 py-8 space-y-8">
        {/* Page header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Find answers about taking messages and responding to calls using the
            HCP Assist system.
          </p>
        </div>

        {/* FAQ Sections */}
        {faqSections.map((section) => (
          <FAQSectionCard key={section.title} section={section} />
        ))}

        {/* Need Help banner */}
        <div
          className={cn(
            "flex items-center justify-between rounded-lg px-6 py-5",
            "bg-muted"
          )}
        >
          <div className="flex items-center gap-3">
            <Headset className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Still have questions? Contact support for assistance.
            </span>
          </div>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
