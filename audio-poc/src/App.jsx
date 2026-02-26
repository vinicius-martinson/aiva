import { useTranscription } from "./useTranscription";
import "./App.css";

const TOOL_CONFIG = {
  classify_visit_type: { label: "Visit Type", icon: "🏷️" },
  collect_customer_info: { label: "Customer Info", icon: "👤" },
  validate_address: { label: "Address Validation", icon: "📍" },
  fetch_service_pricing: { label: "Service Pricing", icon: "💲" },
  confirm_booking: { label: "Booking Confirmation", icon: "✅" },
  offer_upsell: { label: "Upsell Offer", icon: "⭐" },
};

function ToolWidget({ event }) {
  const config = TOOL_CONFIG[event.toolName] || { label: event.toolName, icon: "🔧" };
  const result = event.result || {};

  const renderContent = () => {
    switch (event.toolName) {
      case "classify_visit_type":
        return (
          <div className="tool-widget-body">
            <div className="tool-field"><strong>Type:</strong> {result.visit_type}</div>
            <div className="tool-field"><strong>Urgency:</strong> {result.urgency}</div>
            {result.reason && <div className="tool-field"><strong>Reason:</strong> {result.reason}</div>}
          </div>
        );

      case "collect_customer_info":
        return (
          <div className="tool-widget-body">
            <div className="tool-field"><strong>Name:</strong> {result.full_name}</div>
            <div className="tool-field"><strong>Address:</strong> {result.address}</div>
            {result.phone_number && <div className="tool-field"><strong>Phone:</strong> {result.phone_number}</div>}
            {result.customer_id && <div className="tool-field"><strong>ID:</strong> {result.customer_id}</div>}
          </div>
        );

      case "validate_address":
        return (
          <div className="tool-widget-body">
            <div className="tool-field"><strong>Address:</strong> {result.formatted_address}</div>
            <div className="tool-field">
              <strong>Service Area:</strong>{" "}
              <span className={result.in_service_area ? "badge-success" : "badge-error"}>
                {result.in_service_area ? "Yes" : "No"}
              </span>
            </div>
            {result.map_embed_url && (
              <a href={result.map_embed_url} target="_blank" rel="noopener noreferrer" className="tool-link">
                View on Map
              </a>
            )}
          </div>
        );

      case "fetch_service_pricing":
        return (
          <div className="tool-widget-body">
            <div className="tool-field"><strong>Service:</strong> {result.label || result.service_type}</div>
            <div className="tool-field"><strong>Price:</strong> {result.price_formatted}</div>
            {result.duration_hours && <div className="tool-field"><strong>Duration:</strong> {result.duration_hours}h</div>}
            {result.availability && result.availability.length > 0 && (
              <div className="tool-field">
                <strong>Available Slots:</strong>
                <ul className="tool-slots">
                  {result.availability.map((slot, i) => (
                    <li key={i}>{typeof slot === "string" ? slot : slot.slot || slot.label || slot.time}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case "confirm_booking":
        return (
          <div className="tool-widget-body">
            <div className="tool-field"><strong>Booking ID:</strong> {result.booking_id}</div>
            <div className="tool-field"><strong>Status:</strong> <span className="badge-success">{result.status}</span></div>
            <div className="tool-field"><strong>Service:</strong> {result.service_type}</div>
            <div className="tool-field"><strong>Customer:</strong> {result.customer_name}</div>
            <div className="tool-field"><strong>Address:</strong> {result.address}</div>
            <div className="tool-field"><strong>Time:</strong> {result.time_slot}</div>
            {result.confirmation_message && <div className="tool-field confirmation-msg">{result.confirmation_message}</div>}
          </div>
        );

      case "offer_upsell":
        return (
          <div className="tool-widget-body">
            <div className="tool-field"><strong>Offer:</strong> {result.offer_title}</div>
            <div className="tool-field"><strong>Price:</strong> {result.price_formatted}</div>
            {result.description && <div className="tool-field upsell-description">{result.description}</div>}
            <div className="tool-field"><strong>Upsell ID:</strong> {result.upsell_id}</div>
          </div>
        );

      default:
        return (
          <div className="tool-widget-body">
            <pre className="tool-json">{JSON.stringify(result, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="tool-widget">
      <div className="tool-widget-header">
        <span className="tool-icon">{config.icon}</span>
        <span className="tool-label">{config.label}</span>
      </div>
      {renderContent()}
    </div>
  );
}

function App() {
  const {
    isRecording,
    transcripts,
    interimTranscript,
    agentMessages,
    streamingText,
    toolEvents,
    error,
    startRecording,
    stopRecording,
  } = useTranscription();

  return (
    <div className="app">
      <h1>Audio Transcription POC</h1>
      <p className="subtitle">Browser Mic → Rails → Faster Whisper (local)</p>

      <button
        className={`record-btn ${isRecording ? "recording" : ""}`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {isRecording && <div className="recording-indicator">Recording...</div>}

      {error && <div className="error">Error: {error}</div>}

      <div className="transcript-box">
        <h2>Transcription</h2>
        <div className="transcript-content">
          {transcripts.length === 0 && !interimTranscript && (
            <p className="placeholder">
              Click "Start Recording" and speak into your microphone...
            </p>
          )}
          {transcripts.map((t, i) => (
            <span key={i}>{t} </span>
          ))}
          {interimTranscript && (
            <span className="interim">{interimTranscript}</span>
          )}
        </div>
      </div>

      {(agentMessages.length > 0 || streamingText) && (
        <div className="agent-panel">
          <div className="agent-header">
            <h2>Agent Script</h2>
          </div>
          <div className="agent-messages">
            {agentMessages.map((msg, i) => (
              <div key={i} className="agent-message">
                {msg.text}
              </div>
            ))}
            {streamingText && (
              <div className="agent-message streaming">
                {streamingText}
              </div>
            )}
          </div>
        </div>
      )}

      {toolEvents.length > 0 && (
        <div className="tools-panel">
          <h2>Call Details</h2>
          <div className="tool-widgets">
            {toolEvents.map((event, i) => (
              <ToolWidget key={`${event.toolName}-${event.timestamp}-${i}`} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
