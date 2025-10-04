import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [theme, setTheme] = useState('light');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTranscription, setLoadingTranscription] = useState(false);

  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Summarize note
  const handleSummarize = async () => {
    if (!note.trim()) return alert("Please enter a note to summarize.");

    setLoadingSummary(true);
    setSummary('');
    try {
      const response = await axios.post('http://localhost:5000/api/summarize', { note });
      setSummary(response.data.summary);
    } catch (error) {
      console.error(error);
      setSummary('❌ Failed to summarize. Check backend or API key.');
    }
    setLoadingSummary(false);
  };

  // Upload audio file
  const handleAudioUpload = async () => {
    if (!audioFile) return alert("Please select an audio file.");

    const formData = new FormData();
    formData.append('audio', audioFile);

    setLoadingTranscription(true);
    setTranscription('');
    try {
      const response = await axios.post('http://localhost:5000/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTranscription(response.data.transcription);
    } catch (error) {
      console.error(error);
      setTranscription('❌ Transcription failed.');
    }
    setLoadingTranscription(false);
  };

  // Record audio in-browser
  const handleRecording = async () => {
    if (!recording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioFile(new File([blob], "recorded_audio.wav", { type: "audio/wav" }));
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } else {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">🧠 AI Notes Summarizer</h1>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-sm px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:opacity-90"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Note input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Paste Note</label>
          <textarea
            ref={textareaRef}
            className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800"
            placeholder="Paste your long note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={6}
          />
          <button
            onClick={handleSummarize}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
            disabled={loadingSummary}
          >
            {loadingSummary ? '⏳ Summarizing...' : 'Summarize'}
          </button>
        </div>

        {/* Summary output */}
        <div className="space-y-2">
          <label className="text-sm font-medium">📄 Summary</label>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md min-h-[60px] whitespace-pre-wrap">
            {summary || <span className="text-gray-400">Summary will appear here...</span>}
          </div>
        </div>

        <hr className="border-gray-300 dark:border-gray-600" />

        {/* Audio transcription */}
        <h2 className="text-2xl font-semibold text-green-700 dark:text-green-400 text-center">🎙️ Transcribe Audio</h2>
        <div className="space-y-3">
          <input
            type="file"
            accept=".wav"
            onChange={(e) => setAudioFile(e.target.files[0])}
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
          />
          <button
            onClick={handleAudioUpload}
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
            disabled={loadingTranscription}
          >
            {loadingTranscription ? '⏳ Transcribing...' : 'Upload & Transcribe'}
          </button>
          <button
            onClick={handleRecording}
            className={`w-full py-2 ${recording ? 'bg-red-600' : 'bg-purple-600'} hover:opacity-90 text-white rounded-md transition`}
          >
            {recording ? '⏹ Stop Recording' : '🎙 Start Recording'}
          </button>
        </div>

        {/* Transcription output */}
        <div className="space-y-2">
          <label className="text-sm font-medium">📝 Transcription</label>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md min-h-[60px] whitespace-pre-wrap">
            {transcription || <span className="text-gray-400">Transcription will appear here...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
