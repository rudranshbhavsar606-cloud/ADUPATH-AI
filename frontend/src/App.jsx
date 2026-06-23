import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import StudentProfile from './pages/StudentProfile';
import CollegePredictor from './pages/CollegePredictor';
import CareerRecommendation from './pages/CareerRecommendation';
import PlacementDashboard from './pages/PlacementDashboard';
import StudyRoadmap from './pages/StudyRoadmap';
import PDFTutor from './pages/PDFTutor';
import SavedColleges from './pages/SavedColleges';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [profile, setProfile] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [stats, setStats] = useState({
    predictionsCount: 0,
    savedCollegesCount: 0
  });

  // Load profile from database
  const loadProfile = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.log("No profile configured or backend offline.");
    }
  };

  // Load saved colleges bookmarks
  const loadSavedColleges = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/saved-colleges');
      if (res.ok) {
        const data = await res.json();
        setSavedIds(data.map(c => c.id));
        setStats(prev => ({
          ...prev,
          savedCollegesCount: data.length
        }));
      }
    } catch (err) {
      console.log("Error loading bookmarks list.");
    }
  };

  // Load prediction counts for dashboard KPI
  const loadPredictionsCount = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/predict');
      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({
          ...prev,
          predictionsCount: data.predictions?.length || 0
        }));
      }
    } catch (err) {
      console.log("Error loading prediction count metrics.");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      loadSavedColleges();
      loadPredictionsCount();
    }
  }, [profile]);

  // Handle toggling saved colleges
  const toggleSaveCollege = async (collegeId) => {
    const isSaved = savedIds.includes(collegeId);
    const method = isSaved ? 'DELETE' : 'POST';
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/saved-colleges/${collegeId}`, {
        method: method
      });
      if (res.ok) {
        const updated = isSaved 
          ? savedIds.filter(id => id !== collegeId)
          : [...savedIds, collegeId];
        
        setSavedIds(updated);
        setStats(prev => ({
          ...prev,
          savedCollegesCount: updated.length
        }));
      }
    } catch (err) {
      console.error("Error toggling bookmark status:", err);
    }
  };

  const handleProfileSave = () => {
    loadProfile();
    setActivePage('home'); // Redirect back to dashboard hub
  };

  // Render active page component
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home profile={profile} stats={stats} setActivePage={setActivePage} />;
      case 'profile':
        return <StudentProfile profile={profile} setProfile={setProfile} onSaveSuccess={handleProfileSave} />;
      case 'predictor':
        return (
          <CollegePredictor 
            profile={profile} 
            savedIds={savedIds} 
            toggleSaveCollege={toggleSaveCollege} 
            setActivePage={setActivePage} 
          />
        );
      case 'career':
        return <CareerRecommendation profile={profile} setActivePage={setActivePage} />;
      case 'placements':
        return <PlacementDashboard />;
      case 'roadmap':
        return <StudyRoadmap profile={profile} setActivePage={setActivePage} />;
      case 'pdftutor':
        return <PDFTutor />;
      case 'bookmarks':
        return (
          <SavedColleges 
            profile={profile} 
            savedIds={savedIds} 
            toggleSaveCollege={toggleSaveCollege} 
            setActivePage={setActivePage} 
          />
        );
      default:
        return <Home profile={profile} stats={stats} setActivePage={setActivePage} />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} profile={profile}>
      {renderPage()}
    </Layout>
  );
}
