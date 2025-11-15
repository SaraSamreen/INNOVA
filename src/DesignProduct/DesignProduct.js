import React, { useState } from "react";
import PromptPage from "./pages/PromptPage";
import PreviewPage from "./pages/PreviewPage";
import EditorPage from "./pages/EditorPage";
import ExportPage from "./pages/ExportPage";
import MarketFit from "./pages/MarketFit";
import DesignerAssistantPage from "./pages/DesignerAssistantPage";
import Sidebar from "./components/Sidebar";
import DesignerChat from "./components/DesignerChat";

const DesignMindDashboard = () => {
  // track which page is active; default is prompt page
  const [activePage, setActivePage] = useState("prompt");

  // function to render page based on activePage state
  const renderPage = () => {
    switch (activePage) {
      case "prompt":
        return <PromptPage />;
      case "preview":
        return <PreviewPage />;
      case "editor":
        return <EditorPage />;
      case "export":
        return <ExportPage />;
      case "market":
        return <MarketFit />;
      case "assistant":
        return <DesignerAssistantPage />;
      default:
        return <PromptPage />;
    }
  };

  return (
    <div className="designmind-dashboard flex h-screen bg-slate-50 text-slate-900">
      {/* Sidebar - pass handler to change active page */}
      <Sidebar active={activePage} onNavigate={setActivePage} />

      <div className="flex-1 flex flex-col">
      

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default DesignMindDashboard;
