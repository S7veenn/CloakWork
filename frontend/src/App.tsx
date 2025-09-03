import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import TaskBrowser from "@/pages/TaskBrowser";
import ContributorDashboard from "@/pages/ContributorDashboard";
import ProjectOwnerDashboard from "@/pages/ProjectOwnerDashboard";
import MatchCenter from "@/pages/MatchCenter";
import Layout from "@/components/Layout";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/tasks" element={<Layout><TaskBrowser /></Layout>} />
        <Route path="/contributor/dashboard" element={<Layout><ContributorDashboard /></Layout>} />
        <Route path="/owner/dashboard" element={<Layout><ProjectOwnerDashboard /></Layout>} />
        <Route path="/matches" element={<Layout><MatchCenter /></Layout>} />
      </Routes>
    </Router>
  );
}
