import { useState, useEffect } from "react"
import { useSearchParams } from "@/hooks/useSearchParams"
import { getClientData, getCallContext } from "@/lib/api"
import type { ClientData } from "@/types/booking"
import type { CallContext } from "@/types/client"
import { LiveBadge } from "@/components/context/LiveBadge"
import { ClientCard } from "@/components/context/ClientCard"
import { CallDetails } from "@/components/context/CallDetails"
import { UnknownCallerCard } from "@/components/context/UnknownCallerCard"
import { PastJobs } from "@/components/context/PastJobs"
import { AiTips } from "@/components/context/AiTips"

function SkeletonLoader() {
  return (
    <div className="px-4 py-6 space-y-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
    </div>
  )
}

export function ContextPanel() {
  const { customerUuid, phoneNumber } = useSearchParams()
  const [client, setClient] = useState<ClientData | null>(null)
  const [callContext, setCallContext] = useState<CallContext | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [clientData, contextData] = await Promise.all([
        getClientData(customerUuid, phoneNumber),
        getCallContext()
      ])
      setClient(clientData)
      setCallContext(contextData)
      setLoading(false)
    }

    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside className="flex flex-col h-full bg-background border-l">
      {/* Header with Live badge */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <h2 className="text-sm font-semibold">Call Context</h2>
        {!loading && <LiveBadge />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Client or Unknown Caller card */}
            <div className="px-4 py-4 border-b">
              {client ? (
                <ClientCard client={client} />
              ) : (
                <UnknownCallerCard phoneNumber={phoneNumber} />
              )}
            </div>

            {/* Call Details */}
            {callContext && (
              <div className="px-4 py-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Call Details
                </h3>
                <CallDetails callContext={callContext} />
              </div>
            )}

            {/* Previous Jobs */}
            <div className="px-4 py-4 border-t">
              <PastJobs />
            </div>

            {/* AI Tips - appears after 1 min */}
            <div className="px-4 py-4 border-t">
              <AiTips />
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
