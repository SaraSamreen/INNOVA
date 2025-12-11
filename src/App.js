import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Homepage/Home";
import Login from "./AccessHub/AuthPage";
import ResetPassword from "./AccessHub/ResetPassword";
import Dashboard from "./Dashboard/Dashboard";
import AdminCommandHub from "./AdminCommandHub/AdminCommandHub";
import ReelCreationStep from './Dashboard/componentsD/ReelCreationStep';
import LogoGenerator from "./Dashboard/componentsD/LogoGenerator";
import PosterGenerator from "./Dashboard/componentsD/PosterGenerator";
import TemplateBrowser from './TemplateEditor/components/TemplateBrowser';
import TemplateEditor from "./TemplateEditor/components/TemplateEditor";
import Designproduct from './DesignProduct/MarketSearchAnalyzer';
import ProductBeautifier from './Dashboard/componentsD/ProductBeautifier';
import ProductStaging from './Dashboard/componentsD/ProductStaging';
import Promptbg from './Dashboard/componentsD/ProductModelShowcase';
import ReelTemplateCreator from './Dashboard/componentsD/ReelTemplateCreator';
import Forgotpass from './AccessHub/Forgotpass';
import Settings from './Dashboard/componentsD/Settings';
import Drafts from './Drafts';
import SimpleChat from './Chat/Chat';
import VideoEditor from './video-editor/video';
import AvatarVideoGenerator from './Dashboard/componentsD/AvatarVideoGenerator';
import InstagramUploader from './Dashboard/componentsD/InstagramUploader';




function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminCommandHub />} /> 
        <Route path="/reel-creation" element={<ReelCreationStep />} />
        <Route path="/logo-generator" element={<LogoGenerator />} />
        <Route path="/poster-generator" element={<PosterGenerator />} />
        <Route path="/template-browser" element={<TemplateBrowser />} />
         <Route path="/template-editor" element={<TemplateEditor />} />
         <Route path="/forgotpass" element={<Forgotpass/>} />
         <Route path="/product-staging" element={<ProductStaging />} />
         <Route path="/product-beautifier" element={<ProductBeautifier />} />
         <Route path="/design-product" element={<Designproduct />} />
          <Route path="/prompt-background" element={<Promptbg />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/quick-reel" element={<ReelTemplateCreator />} />
          <Route path="/drafts" element={<Drafts/>} />
          <Route path="/simple-chat" element={<SimpleChat/>} />
          <Route path="/video-editor" element={<VideoEditor />} />
          <Route path="/avatar-generator" element={<AvatarVideoGenerator />} />
          <Route path="/instagram-uploader" element={<InstagramUploader />} />

        
      </Routes>
    </Router>
  );
}

export default AppWrapper;
