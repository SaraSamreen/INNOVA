import { useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Createvidpg3() {
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Matthew");
  const [playingAudio, setPlayingAudio] = useState(null);

  const voices = [
    "Amber", "Emma", "Aria", "Ashley", "Danielle",
    "Michelle", "Monica", "Gregory", "James", "Jason", "Justin", "Kevin",
  ];

  // Function to preview a voice using the Flask backend
  const previewVoice = async (voice) => {
    const defaultText = "Hey, I am your Innova marketing team, how can I help you";

    try {
      const response = await fetch("http://localhost:5001/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: defaultText, voice: voice })
      });

      const data = await response.json();
      if (data.url) {
        // Stop previous audio if playing
        if (playingAudio) {
          playingAudio.pause();
        }

        // Play the new audio
        const audio = new Audio(`http://localhost:5001${data.url}`);
        audio.play();
        setPlayingAudio(audio);
      }
    } catch (err) {
      console.error("Error previewing voice:", err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center p-6">
      <div className="bg-white shadow-xl border rounded-2xl w-full max-w-3xl p-8">

        {/* ------ HEADER ------ */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Idea (prompt) to video</h2>
          <button className="text-gray-500 hover:text-gray-700 text-xl">X</button>
        </div>

        {/* ------ STEPS WITH LINES ------ */}
        <div className="flex justify-between items-center mb-10">
          {["Prompt", "Script", "Customization"].map((step, index, arr) => (
            <div key={index} className="flex flex-col items-center text-center relative w-1/4">

              {/* Line before circle */}
              {index !== 0 && (
                <div className="absolute left-0 top-5 w-1/2 h-0.5 bg-gray-300"></div>
              )}

              {/* Line after circle */}
              {index !== arr.length - 1 && (
                <div className="absolute right-0 top-5 w-1/2 h-0.5 bg-gray-300"></div>
              )}

              {/* Step circle */}
              <div
                className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full border-2 bg-white
                  ${index === 3 ? "border-pink-500 text-pink-500" : "border-gray-300 text-gray-400"}
                `}
              >
                {index + 1}
              </div>

              {/* Label */}
              <span className="mt-2 text-sm text-gray-600">{step}</span>
            </div>
          ))}
        </div>

        {/* ------ VOICEOVER ------ */}
        <div className="mb-6">
          <label className="block mb-1 text-gray-700 font-medium">Voiceover</label>

          <button
            onClick={() => setShowVoiceModal(true)}
            className="w-full p-3 border rounded-lg text-left hover:bg-gray-50 transition"
          >
            {selectedVoice}
          </button>
        </div>

        {/* ------ AI AVATAR ------ */}
        <div className="mb-6">
          <label className="block mb-1 text-gray-700 font-medium">AI Avatar</label>

          <div className="w-full p-3 border rounded-lg bg-gray-100 opacity-50 cursor-not-allowed">
            Locked Feature
          </div>
        </div>

        {/* ------ SUBMIT BUTTON → NOW USING <Link> ------ */}
        <Link
          to="/step4"
          className="block w-full mt-4 bg-pink-600 text-white text-center p-3 rounded-lg hover:bg-pink-700 transition font-medium"
        >
          Submit
        </Link>
      </div>

      {/* ------ VOICE SELECTION MODAL ------ */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl p-6 relative">

            {/* Close Button */}
            <button
              onClick={() => setShowVoiceModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-black transition"
            >
              <X size={22} />
            </button>

            <h3 className="text-xl font-semibold mb-4">Voice Selection</h3>

            {/* Filter UI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <select className="border p-2 rounded-lg"><option>English</option></select>
              <select className="border p-2 rounded-lg"><option>US United States</option></select>
              <select className="border p-2 rounded-lg"><option>All Genders</option></select>
              <select className="border p-2 rounded-lg"><option>Default</option></select>
            </div>

            {/* Voice List */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto border p-4 rounded-xl">
              {voices.map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setSelectedVoice(v);
                    previewVoice(v);
                  }}
                  className={`p-3 border rounded-lg text-left hover:bg-gray-100 transition ${
                    selectedVoice === v ? "border-pink-500 bg-pink-50" : ""
                  }`}
                >
                  Speaker {v}
                </button>
              ))}
            </div>

            {/* Select Button */}
            <button
              onClick={() => setShowVoiceModal(false)}
              className="w-full mt-6 bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700 transition"
            >
              Select
            </button>
          </div>
        </div>
      )}
    </div>
  );
}