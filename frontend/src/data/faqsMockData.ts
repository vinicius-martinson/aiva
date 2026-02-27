export type FAQItem = {
  question: string
  answer: string
}

export type FAQSection = {
  title: string
  icon: string
  items: FAQItem[]
}

export const faqSections: FAQSection[] = [
  {
    title: "Taking a Message",
    icon: "message-square-text",
    items: [
      {
        question: "How do I take a message for a client?",
        answer:
          "When a call comes in, click the 'Take Message' button on the active call panel. Fill in the caller's name, phone number, and the message details. You can also select the urgency level (Normal, Urgent, or Emergency) before saving. The message will be automatically routed to the assigned HCP.",
      },
      {
        question: "What information should I capture in a message?",
        answer:
          "At minimum, capture the caller's full name, phone number, and the reason for the call. If possible, also note the preferred callback time, any relevant job or account numbers, and the urgency level. The more details you provide, the faster the technician can respond.",
      },
      {
        question: "How do I set the urgency level for a message?",
        answer:
          "When creating a message, you'll see an 'Urgency' dropdown with three options: Normal, Urgent, and Emergency. Select the appropriate level based on the caller's needs. Emergency messages trigger immediate notifications to the assigned technician.",
      },
      {
        question: "Can I edit or delete a message after saving?",
        answer:
          "You can edit a message within 15 minutes of saving it by clicking the edit icon next to the message in your recent activity list. Messages cannot be deleted, but you can mark them as 'Resolved' or 'Cancelled' to update their status.",
      },
      {
        question: "How do I know if a message was delivered?",
        answer:
          "Each message has a delivery status indicator. A green checkmark means delivered, a yellow clock means pending, and a red exclamation means delivery failed. You can also check the message detail view for a full delivery timeline.",
      },
    ],
  },
  {
    title: "Responding to Calls",
    icon: "phone-incoming",
    items: [
      {
        question: "How do I answer an incoming call?",
        answer:
          "When an incoming call is detected, a notification banner will appear at the top of your screen. Click 'Answer' to connect. You'll see the caller's information (if available) and any associated client records. Use the call toolbar to mute, hold, or transfer the call as needed.",
      },
      {
        question: "How do I transfer a call to another agent?",
        answer:
          "Click the 'Transfer' button in the call toolbar, then select the agent or department from the directory. You can perform a warm transfer (introduce the caller first) or a cold transfer (send directly). The system will show agent availability status.",
      },
      {
        question: "What should I do if a call drops unexpectedly?",
        answer:
          "If a call drops, the system will automatically log the disconnection. Check the 'Recent Calls' list to find the caller's number and attempt a callback. Document the drop in the call notes so the issue can be tracked for quality assurance.",
      },
      {
        question: "How do I place a caller on hold?",
        answer:
          "Click the 'Hold' button in the call toolbar. The caller will hear hold music while waiting. A timer will display how long the caller has been on hold. Click 'Resume' to reconnect. Try to keep hold times under 2 minutes when possible.",
      },
      {
        question: "Can I make outbound calls from the system?",
        answer:
          "Yes, click the phone icon in the top navigation bar and enter the number you'd like to call, or select a contact from the client directory. Outbound calls are logged automatically and can be associated with existing client records.",
      },
    ],
  },
]
