import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Homepage/Home";
import Login from "./AccessHub/Login";
import ResetPassword from "./AccessHub/ResetPassword";
import Dashboard from "./Dashboard/Dashboard";
import VoiceGenerator from './Dashboard/componentsD/Createvidpg2';
import VideoGenerator from './Dashboard/componentsD/Createvidpg3';
import TeamCollab from "./TeamCollab/TeamCollab";
import AdminCommandHub from "./AdminCommandHub/AdminCommandHub";
import ReelCreationStep from './Dashboard/componentsD/ReelCreationStep';
import Chatbot from "./Dashboard/componentsD/Chatbot";
import LogoGenerator from "./Dashboard/componentsD/LogoGenerator";
import PosterGenerator from "./Dashboard/componentsD/PosterGenerator";
import TemplateBrowser from './TemplateEditor/components/TemplateBrowser';
import TemplateEditor from "./TemplateEditor/components/TemplateEditor";   
import ProductShowcase from './Dashboard/componentsD/ProductShowcase';
import Designproduct from './Dashboard/componentsD/DesignProduct';
import Forgotpass from './AccessHub/Forgotpass';



function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/team-collaboration" element={<TeamCollab />} />
        <Route path="/admin" element={<AdminCommandHub />} /> 
        <Route path="/reel-creation" element={<ReelCreationStep />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/logo-generator" element={<LogoGenerator />} />
        <Route path="/poster-generator" element={<PosterGenerator />} />
        <Route path="/template-browser" element={<TemplateBrowser />} />
         <Route path="/template-editor" element={<TemplateEditor />} />
         <Route path="/create/step2" element={<VoiceGenerator />} />
         <Route path="/create/step3" element={<VideoGenerator />} />
         <Route path="/forgotpass" element={<Forgotpass/>} />
         <Route path="/design-product" element={<Designproduct />} />
         <Route path="/product-showcase" element={<ProductShowcase/>} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
