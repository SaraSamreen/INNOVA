import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Homepage/Home";
import Login from "./AccessHub/AuthPage";
import ResetPassword from "./AccessHub/ResetPassword";
import Dashboard from "./Dashboard/Dashboard";
import Pg1 from './Dashboard/componentsD/Createvidpg1';
import Pg2 from './Dashboard/componentsD/Createvidpg2';
import Pg3 from './Dashboard/componentsD/Createvidpg3';
import Pg4 from './Dashboard/componentsD/Createvidpg3';
import TeamCollab from "./TeamCollab/TeamCollab";
import AdminCommandHub from "./AdminCommandHub/AdminCommandHub";
import ReelCreationStep from './Dashboard/componentsD/ReelCreationStep';
import LogoGenerator from "./Dashboard/componentsD/LogoGenerator";
import PosterGenerator from "./Dashboard/componentsD/PosterGenerator";
import TemplateBrowser from './TemplateEditor/components/TemplateBrowser';
import TemplateEditor from "./TemplateEditor/components/TemplateEditor";
import Designproduct from './DesignProduct/DesignProduct';
import ProductBeautifier from './Dashboard/componentsD/ProductBeautifier';
import Bgremover from './Dashboard/componentsD/BackRemover';
import ProductStaging from './Dashboard/componentsD/ProductStaging';
import Promptbg from './Dashboard/componentsD/PromptBackgroundStaging';
import ReelTemplateCreator from './Dashboard/componentsD/ReelTemplateCreator';
import Forgotpass from './AccessHub/Forgotpass';
import Drafts from './Drafts';



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
        <Route path="/logo-generator" element={<LogoGenerator />} />
        <Route path="/poster-generator" element={<PosterGenerator />} />
        <Route path="/template-browser" element={<TemplateBrowser />} />
         <Route path="/template-editor" element={<TemplateEditor />} />
         <Route path="/step1" element={<Pg1 />} />
         <Route path="/step2" element={<Pg2 />} />
         <Route path="/step3" element={<Pg3 />} />
         <Route path="/step4" element={<Pg4 />} />
         <Route path="/forgotpass" element={<Forgotpass/>} />
         <Route path="/product-staging" element={<ProductStaging />} />
         <Route path="/product-beautifier" element={<ProductBeautifier />} />
         <Route path="/design-product" element={<Designproduct />} />
         <Route path="/background-remover" element={<Bgremover />} />
          <Route path="/prompt-background" element={<Promptbg />} />
          <Route path="/quick-reel" element={<ReelTemplateCreator />} />
          <Route path="/drafts" element={<Drafts/>} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
