import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Header from "./Homepage/Components/Header";
import Home from "./Homepage/Home";
import TeamsH from "./Homepage/Components/TeamsH";
import PricingH from "./Homepage/Components/PricingH";
import Signup from "./AccessHub/Signup";
import Login from "./AccessHub/Login";
import ResetPassword from "./AccessHub/ResetPassword";
import Dashboard from "./Dashboard/Dashboard";
import VideoGenerator from './Dashboard/componentsD/Createvidpg1';
import Createvidpg2 from './Dashboard/componentsD/Createvidpg2';
import Createvidpg3 from './Dashboard/componentsD/Createvidpg3';
import ProfileSettings from './ProfileSettings/ProfileSettings';
import TeamCollab from "./TeamCollab/TeamCollab";
import AdminCommandHub from "./AdminCommandHub/AdminCommandHub";
import ReelCreationStep from './Dashboard/componentsD/ReelCreationStep';
import Chatbot from "./Dashboard/componentsD/Chatbot";
import LogoGenerator from "./Dashboard/componentsD/LogoGenerator";
import TemplateBrowser from './TemplateEditor/components/TemplateBrowser';
import TemplateEditor from "./TemplateEditor/components/TemplateEditor";   
import EducationalVideo from './Dashboard/componentsD/ProductShowcase';
import CreateAvatar from './Dashboard/componentsD/PhotoToVideo';
import Forgotpass from './AccessHub/Forgotpass';

function ConditionalHeader() {
  const location = useLocation();

  // List of routes where you DO NOT want the homepage header
  const hideHeaderRoutes = ['/dashboard', '/create-video' , '/create/step2' ,'/create/step3', '/photo-capture' , '/educational-video'];

  return hideHeaderRoutes.includes(location.pathname) ? null : <Header />;
}

function AppWrapper() {
  return (
    <Router>
      <ConditionalHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teamsH" element={<TeamsH />} />
        <Route path="/pricingH" element={<PricingH />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-video" element={<VideoGenerator />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        <Route path="/team-collaboration" element={<TeamCollab />} />
        <Route path="/admin" element={<AdminCommandHub />} /> 
        <Route path="/reel-creation" element={<ReelCreationStep />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/logo-generator" element={<LogoGenerator />} />
        <Route path="/template-browser" element={<TemplateBrowser />} />
         <Route path="/template-editor" element={<TemplateEditor />} />
         <Route path="/create/step2" element={<Createvidpg2 />} />
         <Route path="/create/step3" element={<Createvidpg3 />} />
         <Route path="/forgotpass" element={<Forgotpass/>} />
         <Route path="/educational-video" element={<EducationalVideo />} />
         <Route path="/photo-capture" element={<CreateAvatar onPhotoSelect={(src) => console.log("Photo selected:", src)} />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
