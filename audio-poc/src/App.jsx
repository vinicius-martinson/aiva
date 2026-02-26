import { useTranscription } from "./useTranscription";
import "./App.css";

function App() {
  const {
    isRecording,
    transcripts,
    interimTranscript,
    error,
    startRecording,
    stopRecording,
  } = useTranscription();

  return (
    <div className="app">
      <h1>Audio Transcription POC</h1>
      <p className="subtitle">Browser Mic → Rails → Whisper (local)</p>

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
    </div>
  );
}

export default App;
