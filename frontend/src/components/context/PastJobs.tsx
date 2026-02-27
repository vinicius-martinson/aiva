type PastJob = {
  id: string
  title: string
  status: "Completed" | "Scheduled" | "Cancelled"
  date: string
}

const statusClass: Record<PastJob["status"], string> = {
  Completed: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Cancelled: "bg-gray-100 text-gray-500",
}

const pastJobs: PastJob[] = [
  { id: "1", title: "Kitchen Faucet Repair", status: "Completed", date: "Jan 15, 2026" },
  { id: "2", title: "Water Heater Install", status: "Completed", date: "Dec 3, 2025" },
]

export function PastJobs() {
  return (
    <div className="space-y-3">
      <h3 className="text-[13px] font-semibold">Previous Jobs</h3>
      {pastJobs.map((job) => (
        <div
          key={job.id}
          className="rounded-lg border p-3 space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium">{job.title}</span>
            <span
              className={`text-[11px] font-medium px-2.5 py-1 rounded ${statusClass[job.status]}`}
            >
              {job.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{job.date}</p>
        </div>
      ))}
    </div>
  )
}
