import { ArrowLeft, Download, RefreshCw } from "lucide-react";

export default function Createvidpg4({ videoUrl, onBack, onRegenerate }) {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Generated Video</h2>
        </div>

        {/* Video Player */}
        <div className="w-full bg-black rounded-xl overflow-hidden shadow-md">
          {videoUrl ? (
            <video 
              controls
              className="w-full h-auto"
              src={videoUrl} 
            />
          ) : (
            <div className="text-white p-6 text-center">Video loading...</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">

          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 w-full bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <a
            href={videoUrl}
            download
            className="flex items-center justify-center gap-2 w-full bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700"
          >
            <Download size={18} /> Download
          </a>

          <button
            onClick={onRegenerate}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={18} /> Regenerate
          </button>

        </div>
      </div>
    </div>
  );
}
