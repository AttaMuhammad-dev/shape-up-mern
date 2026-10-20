import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { 
  FaDumbbell, FaClipboardList, FaLayerGroup, 
  FaSearch
} from "react-icons/fa";

import ExerciseDB from "../components/ExerciseDB";
import WorkoutLog from "../components/WorkoutLog"; 
// Footer removed as requested
// import Footer from "../components/Footer";

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
const Workouts = () => {
  const [pickedExercise, setPickedExercise] = useState(null);

  useEffect(() => {
      window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-wrapper position-relative">
      
      {/* --- ULTRA PREMIUM STYLES (SCOPED) --- */}
      <style>
        {`
          /* --- VARIABLES & BASE --- */
          :root { --primary: #0d6efd; --secondary: #6c757d; --success: #198754; --warning: #ffc107; --info: #0dcaf0; }
          .page-wrapper { min-height: 100vh; overflow-x: hidden; color: #212529; background-color: #f8f9fa; font-family: 'Inter', sans-serif; }
          body.dark-mode .page-wrapper { color: #fff; background-color: #0f172a; }

          /* --- TEXT ADAPTIVE COLORS (FIXED VISIBILITY) --- */
          .text-adaptive-head { color: #000000 !important; } 
          .text-adaptive-sub { color: #495057 !important; }
          
          body.dark-mode .text-adaptive-head { color: #ffffff !important; }
          body.dark-mode .text-adaptive-sub { color: #e2e8f0 !important; }
          
          /* Extra Force for Dark Mode Headings */
          body.dark-mode h1, body.dark-mode h2, body.dark-mode h3, body.dark-mode h4, body.dark-mode h5, body.dark-mode h6 { color: #ffffff !important; }

          .gradient-heading { background: linear-gradient(90deg, #1e293b, #475569); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          body.dark-mode .gradient-heading { background: linear-gradient(90deg, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

          /* --- BACKGROUND ANIMATION --- */
          .background-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; pointer-events: none; }
          .grid-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px); background-size: 40px 40px; opacity: 0.5; }
          body.dark-mode .grid-overlay { background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); }
          .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.4; animation: blobMove 12s infinite alternate; }
          .blob-1 { width: 600px; height: 600px; background: #6610f2; top: -150px; left: -150px; }
          .blob-2 { width: 500px; height: 500px; background: #0d6efd; bottom: -100px; right: -100px; animation-delay: 2s; }
          .blob-3 { width: 400px; height: 400px; background: #0dcaf0; top: 40%; left: 30%; animation-delay: 4s; opacity: 0.2; }
          @keyframes blobMove { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(30px, -30px) scale(1.1); } }

          /* --- GLASS PANELS --- */
          .glass-panel { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 30px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; overflow: hidden; height: 100%; }
          
          /* DARK MODE PANEL */
          body.dark-mode .glass-panel { background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); }

          /* --- PANEL HEADERS --- */
          .panel-header { padding: 25px 30px; border-bottom: 1px solid rgba(0,0,0,0.06); background: rgba(255,255,255,0.5); }
          body.dark-mode .panel-header { border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.4); }
          
          /* --- ICONS --- */
          .glow-icon-box { width: 45px; height: 45px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: 0 0 15px currentColor; opacity: 0.9; }

          /* --- LAYOUT UTILITIES --- */
          .sticky-sidebar { position: sticky; top: 20px; z-index: 10; height: calc(100vh - 40px); }
          .scroll-area { overflow-y: auto; height: 100%; }
          .scroll-area::-webkit-scrollbar { width: 6px; }
          .scroll-area::-webkit-scrollbar-track { background: transparent; }
          .scroll-area::-webkit-scrollbar-thumb { background: rgba(136, 136, 136, 0.3); border-radius: 10px; }
          .scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(136, 136, 136, 0.5); }

          /* --- ANIMATIONS --- */
          .fade-in { animation: fadeIn 1s ease forwards; opacity: 0; }
          .fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}
      </style>

      {/* --- BACKGROUND BLOBS --- */ }
      <div className="background-wrapper">
        <div className="grid-overlay"></div>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <Container fluid="xxl" className="py-4 px-md-5">
        
        {/* 1. HEADER SECTION */}
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-5 fade-in">
          <div>
             <div className="d-flex align-items-center mb-2">
                <FaLayerGroup className="text-primary me-2" />
                <span className="text-adaptive-sub fw-bold small text-uppercase ls-2">Workout Planner</span>
             </div>
             <h1 className="display-4 fw-bold mb-0 gradient-heading">
               Find Your Flow
             </h1>
          </div>
          
          <div className="mt-4 mt-lg-0">
             <div className="d-inline-flex align-items-center bg-dark bg-opacity-75 px-4 py-2 rounded-pill border border-secondary border-opacity-25 shadow-sm">
                <div className="spinner-grow spinner-grow-sm text-success me-3" role="status"></div>
                <small className="text-light mb-0">Database Live. Real-time Updates.</small>
             </div>
          </div>
        </div>

        {/* 2. MAIN WORKOUT AREA */}
        <Row className="g-4 align-items-start">
            
            {/* LEFT: WORKOUT LOG (Sticky Sidebar) - WIDENED AS REQUESTED */}
            <Col lg={5} xl={4} className="fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="sticky-sidebar">
                    <div className="glass-panel d-flex flex-column h-100">
                        {/* Header (Dark Mode Fixed) */}
                        <div className="panel-header d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="glow-icon-box me-3" style={{ color: "rgba(13, 110, 253, 0.8)", boxShadow: "0 0 20px rgba(13, 110, 253, 0.3)", background: "rgba(13, 110, 253, 0.1)" }}>
                                   <FaClipboardList />
                                </div>
                                <div>
                                   <h5 className="fw-bold mb-0 text-adaptive-head">Today's Log</h5>
                                   <small className="text-adaptive-sub fw-bold" style={{fontSize: "0.7rem"}}>ACTIVE SESSION</small>
                                </div>
                            </div>
                        </div>
                        
                        {/* Scrollable Content */}
                        <div className="p-3 scroll-area flex-grow-1">
                            <WorkoutLog selectedExercise={pickedExercise} />
                        </div>
                    </div>
                </div>
            </Col>

            {/* RIGHT: EXERCISE DB - ADJUSTED WIDTH */}
            <Col lg={7} xl={8} className="fade-in-up" style={{ animationDelay: "0.3s" }}>
                <div className="glass-panel h-100 d-flex flex-column">
                    {/* Header */}
                    <div className="panel-header d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                        <div className="d-flex align-items-center mb-3 mb-md-0">
                            <div className="glow-icon-box me-3" style={{ color: "rgba(25, 135, 84, 0.8)", boxShadow: "0 0 20px rgba(25, 135, 84, 0.3)", background: "rgba(25, 135, 84, 0.1)" }}>
                               <FaDumbbell />
                            </div>
                            <div>
                               <h5 className="fw-bold mb-0 text-adaptive-head">Exercise Database</h5>
                               <small className="text-adaptive-sub fw-bold" style={{fontSize: "0.7rem"}}>LIBRARY V2.0</small>
                            </div>
                        </div>
                        
                        {/* Search Hint Visual */}
                        <div className="d-none d-md-flex align-items-center text-muted small px-3 py-1 rounded-pill border border-secondary border-opacity-10 bg-light bg-opacity-10">
                           <FaSearch className="me-2" /> 
                           <span>Search available in list below</span>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-4">
                        {/* Pass selected exercise handler to DB component */}
                        <ExerciseDB onSelectExercise={setPickedExercise} />
                    </div>
                </div>
            </Col>
        </Row>
      </Container>

      {/* Footer Removed */}
    </div>
  );
};

export default Workouts;
