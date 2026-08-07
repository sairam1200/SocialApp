import { useCallback, useState } from "react";

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export function useVoiceSearch(onTranscript: (transcript: string) => void) {
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(() => {
    const voiceRecognition = (window as SpeechRecognitionWindow).SpeechRecognition ??
      (window as SpeechRecognitionWindow).webkitSpeechRecognition;

    if (!voiceRecognition) {
      setError("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new voiceRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript.trim();
      if (transcript) onTranscript(transcript);
    };
    recognition.onerror = () => {
      setError("Voice search could not start. Check microphone permission.");
    };
    recognition.onend = () => undefined;
    setError(null);
    recognition.start();
  }, [onTranscript]);

  return { start, error };
}
