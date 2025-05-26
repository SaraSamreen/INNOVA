import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Header from "./Homepage/Components/Header";
import Home from "./Homepage/Home";
import TeamsH from "./Homepage/Components/TeamsH";
import PricingH from "./Homepage/Components/PricingH";
import Signup from "./AccessHub/Signup";
import Login from "./AccessHub/Login";
import Dashboard from "./Dashboard/Dashboard";
import VideoGenerator from './Dashboard/componentsD/Createvidpg1';
import ProfileSettings from './ProfileSettings/ProfileSettings';
import TeamCollab from "./TeamCollab/TeamCollab";
import AdminCommandHub from "./AdminCommandHub/AdminCommandHub";

function ConditionalHeader() {
  const location = useLocation();

  // List of routes where you DO NOT want the homepage header
  const hideHeaderRoutes = ['/dashboard', '/create-video'];

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-video" element={<VideoGenerator />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        <Route path="/team-collaboration" element={<TeamCollab />} />
        <Route path="/admin" element={<AdminCommandHub />} /> 
      </Routes>
    </Router>
  );
}

export default AppWrapper;
