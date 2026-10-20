import {localDay} from '../utils/reminders';
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Container, Card, Row, Col, Button, Modal, Form, ProgressBar, InputGroup, Badge
} from "react-bootstrap";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { useGetWorkoutsQuery } from "../slices/workoutsApiSlice";
import { useGetDailyLogsQuery, useUpdateDailyLogMutation } from "../slices/dailyLogSlice";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import { toast } from "react-toastify";


import { 
  FaFilePdf, FaEdit, FaFire, FaTint, FaDumbbell, 
  FaWeight, FaUserCircle, FaTrophy, FaWalking, FaChartLine
} from "react-icons/fa";

import StepTracker from "../components/StepTracker"; 

// ==========================================
// 1. ANIMATION UTILS
// ==========================================

const useReveal = (threshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
        }, { threshold });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);
    return [ref, isVisible];
};

const useCounter = (end, duration = 1500) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        if (end === 0) return;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }, [end, duration]);
    return count;
};

const Reveal = ({ children, className = "", delay = 0, animation = "fade-up" }) => {
    const [ref, isVisible] = useReveal();
    return (
        <div ref={ref} className={`${className} ${isVisible ? `anim-${animation}` : 'anim-hidden'}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
};

const AnimatedValue = ({ value, suffix = "" }) => {
    const count = useCounter(value || 0);
    return <span>{count}{suffix}</span>;
};

const BackgroundBlobs = () => (
  <div className="background-blobs">
    <div className="blob blob-1"></div>
    <div className="blob blob-2"></div>
    <div className="blob blob-3"></div>
  </div>
);

const AchievementBadge = ({ icon, title, desc, unlocked, index }) => (
    <Reveal animation="pop-in" delay={index * 100}>
        <div className={`achievement-card ${unlocked ? 'unlocked' : 'locked'} hover-lift`}>
            <div className={`badge-icon ${unlocked ? 'text-success' : 'text-muted'}`}>{icon}</div>
            <div className="badge-info flex-grow-1">
                <h6 className={`fw-bold mb-0 ${unlocked ? 'text-success' : ''}`}>{title}</h6>
                <small className="text-muted">{desc}</small>
            </div>
            {unlocked ? (
                <div className="status-dot bg-success shadow-sm pulse-dot"></div>
            ) : (
                <div className="status-dot bg-secondary opacity-25"></div>
            )}
        </div>
    </Reveal>
);

// ==========================================
// MAIN COMPONENT: DASHBOARD
// ==========================================
const Dashboard = () => {
  const { data: workouts, isLoading: loadingWorkouts } = useGetWorkoutsQuery();
  const { data: dailyLogs, isLoading: loadingLogs } = useGetDailyLogsQuery();
  const [updateDailyLog, { isLoading: updatingLog }] = useUpdateDailyLogMutation();
  
  const { userInfo } = useSelector((state) => state.auth);

  // --- 1. DYNAMIC GOALS ---
  const GOALS = useMemo(() => {
    let goals = { calories: 2000, water: 2500, volume: 5000, steps: 8000 }; 
    if (userInfo) {
        const weight = userInfo.weight || 70; 
        const height = userInfo.height || 170;
        const age = userInfo.age || 25;
        const gender = userInfo.gender || 'Male';
        const userGoal = userInfo.goal || 'Maintain'; 
        
        let bmr = (gender === 'Male') 
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;
        
        let tdee = bmr * 1.55; 

        if (userGoal === 'Cut') {
            goals.calories = Math.round(tdee - 500);
            goals.steps = 10000;
        } else if (userGoal === 'Bulk') {
            goals.calories = Math.round(tdee + 500);
            goals.steps = 6000;
        } else {
            goals.calories = Math.round(tdee);
        }
        
        goals.water = Math.round(weight * 35);   
        goals.volume = Math.round(weight * 60); 
    }
    return goals;
  }, [userInfo]);

  const [showModal, setShowModal] = useState(false);
  const [logDate, setLogDate] = useState(localDay());
  const [calories, setCalories] = useState("");
  const [water, setWater] = useState("");
  const [weight, setWeight] = useState("");
  const [activeTab, setActiveTab] = useState('overview');

  const todayDate = localDay();

  // --- 2. REAL-TIME STATS ---
  const todayStats = useMemo(() => {
    const log = dailyLogs?.find(l => l.date === todayDate) || {};
    const todayWorkout = workouts?.find(w => w.createdAt && w.createdAt.split("T")[0] === todayDate);
    
    const volume = todayWorkout 
        ? todayWorkout.exercises?.reduce((acc, ex) => acc + (Number(ex.weight) || 0) * (Number(ex.sets) || 0) * (Number(ex.reps) || 0), 0)
        : 0;

    return {
        calories: Number(log.calories) || 0,
        water: Number(log.water) || 0,
        weight: Number(log.weight) || userInfo?.weight || 0,
        steps: Number(log.steps) || 0, 
        volume: volume
    };
  }, [dailyLogs, workouts, todayDate, userInfo]);

  // --- 3. ACHIEVEMENTS ---
  const achievements = useMemo(() => {
      return [
          { icon: <FaFire/>, title: "Calorie Crusher", desc: `Hit ${GOALS.calories} kcal`, unlocked: todayStats.calories >= GOALS.calories },
          { icon: <FaTint/>, title: "Hydration Hero", desc: `Drank ${GOALS.water}ml`, unlocked: todayStats.water >= GOALS.water },
          { icon: <FaDumbbell/>, title: "Heavy Lifter", desc: `Vol > ${GOALS.volume}kg`, unlocked: todayStats.volume >= GOALS.volume },
          { icon: <FaWalking/>, title: "Step Master", desc: `Hit ${GOALS.steps} steps`, unlocked: todayStats.steps >= GOALS.steps },
      ];
  }, [todayStats, GOALS]);

  // --- 4. DATA PREPARATION (Updated to include Volume) ---
  const chartData = useMemo(() => {
    if (!dailyLogs) return [];
    
    // Sort logs by date
    const sortedLogs = [...dailyLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Process last 7 entries
    return sortedLogs.slice(-7).map(log => {
        const logDateStr = log.date.split('T')[0];

        // Calculate Volume for this specific date from Workouts
        let dailyVolume = 0;
        if (workouts) {
            const daysWorkouts = workouts.filter(w => w.date && w.date.startsWith(logDateStr));
            dailyVolume = daysWorkouts.reduce((total, w) => {
                const wVol = w.exercises?.reduce((acc, ex) => 
                    acc + ((Number(ex.weight) || 0) * (Number(ex.sets) || 0) * (Number(ex.reps) || 0)), 0) || 0;
                return total + wVol;
            }, 0);
        }

        return {
            date: new Date(log.date).toLocaleDateString("en-US", { weekday: 'short' }),
            calories: log.calories || 0,
            water: log.water || 0,
            weight: log.weight || null,
            steps: log.steps || 0,
            volume: dailyVolume // Added Volume Data
        };
    });
  }, [dailyLogs, workouts]);

  // --- HANDLERS ---
  const handleShow = () => {
      setCalories(todayStats.calories || "");
      setWater(todayStats.water || "");
      setWeight(todayStats.weight || "");
      setLogDate(todayDate);
      setShowModal(true);
  };
  const handleClose = () => setShowModal(false);

  const handleSaveLog = async (e) => {
    e.preventDefault();
    try {
      await updateDailyLog({ date: logDate, calories: Number(calories), water: Number(water), weight: Number(weight) }).unwrap();
      toast.success("Stats Updated Successfully!");
      handleClose();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const saveSteps = async (newSteps) => {
    try {
        await updateDailyLog({ date: todayDate, steps: newSteps }).unwrap();
        toast.success("Steps Synced!");
    } catch (err) { console.error("Step Sync Failed", err); }
  };

  const generatePDF = async () => {
    const [{jsPDF},{default:autoTable}]=await Promise.all([import("jspdf"),import("jspdf-autotable")]);
    const doc = new jsPDF();
    doc.text(`Shape Up Report - ${userInfo?.name}`, 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Calories', 'Water (ml)', 'Weight (kg)']],
      body: dailyLogs ? dailyLogs.map(l => [l.date, l.calories, l.water, l.weight]) : [],
      theme: 'grid',
    });
    doc.save("ShapeUp_Progress.pdf");
  };

  const getProgress = (val, goal) => Math.min((val / goal) * 100, 100);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label mb-1 fw-bold">{label}</p>
          {payload.map((entry, index) => (
             <p key={index} className="intro mb-0" style={{ color: entry.color }}>
                {entry.name === 'volume' ? 'Volume' : entry.name}: {entry.value} {entry.name === 'weight' ? 'kg' : ''}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-wrapper position-relative overflow-hidden">
      <style>
        {`
          .dashboard-wrapper { min-height: 100vh; background-color: #f8f9fa; color: #212529; font-family: 'Inter', sans-serif; }
          body.dark-mode .dashboard-wrapper { background-color: #0f172a; color: #f8fafc; }

          /* ANIMATIONS */
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes popIn { 0% { opacity: 0; transform: scale(0.8); } 80% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
          @keyframes blobMove { 0% { transform: scale(1) translate(0,0); } 100% { transform: scale(1.1) translate(20px, -20px); } }
          @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(25, 135, 84, 0); } 100% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); } }

          .anim-hidden { opacity: 0; visibility: hidden; }
          .anim-fade-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; visibility: visible; }
          .anim-pop-in { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; visibility: visible; }

          .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }

          .btn-glow { transition: 0.3s; }
          .btn-glow:hover { box-shadow: 0 0 20px rgba(13, 110, 253, 0.6); transform: translateY(-2px); }

          .background-blobs { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
          .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; animation: blobMove 10s infinite alternate; }
          .blob-1 { width: 600px; height: 600px; background: #6610f2; top: -200px; right: -200px; opacity: 0.2; }
          .blob-2 { width: 500px; height: 500px; background: #0d6efd; bottom: -100px; left: -100px; animation-delay: 2s; opacity: 0.2; }
          .blob-3 { width: 300px; height: 300px; background: #0dcaf0; top: 40%; left: 30%; animation-delay: 4s; opacity: 0.15; }

          .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05); transition: 0.3s; position: relative; z-index: 1; }
          body.dark-mode .glass-card { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }

          .text-adaptive { color: #1e293b; }
          .text-adaptive-muted { color: #64748b; }
          body.dark-mode .text-adaptive { color: #ffffff !important; }
          body.dark-mode .text-adaptive-muted { color: #cbd5e1 !important; }

          .stat-value { font-size: 2.5rem; font-weight: 800; color: #0f172a; }
          body.dark-mode .stat-value { color: #fff; }

          .achievement-card { display: flex; align-items: center; padding: 15px; border-radius: 16px; margin-bottom: 12px; background: #fff; border: 1px solid #e9ecef; transition: 0.3s; }
          body.dark-mode .achievement-card { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
          .achievement-card.locked { opacity: 0.7; filter: grayscale(1); }
          .achievement-card.unlocked { background: rgba(25, 135, 84, 0.1) !important; border: 1px solid #198754 !important; }
          .badge-icon { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 1.4rem; margin-right: 15px; background: rgba(0,0,0,0.05); transition: 0.3s; }
          .achievement-card:hover .badge-icon { transform: scale(1.1); }
          
          .pulse-dot { animation: pulse 2s infinite; }

          .icon-circle { width: 55px; height: 55px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; transition: 0.3s; }
          .glass-card:hover .icon-circle { transform: rotate(10deg) scale(1.1); }

          .btn-modern { border-radius: 50px; padding: 10px 25px; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px; }
          .custom-tooltip { background: rgba(30, 30, 30, 0.95); padding: 12px; border-radius: 10px; color: #fff; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
          
          body.dark-mode .form-control { background: #334155; border-color: #475569; color: white; }
          body.dark-mode .form-control::placeholder { color: #94a3b8; }
          body.dark-mode .modal-content { background: #1e293b; color: white; }

          /* TOGGLE BUTTON STYLES */
          .toggle-container { background: #f1f5f9; padding: 4px; border-radius: 12px; display: flex; gap: 4px; }
          body.dark-mode .toggle-container { background: rgba(255,255,255,0.1); }
          .toggle-btn { padding: 6px 16px; border: none; background: transparent; color: #64748b; font-size: 0.85rem; font-weight: 600; border-radius: 8px; transition: all 0.2s; }
          .toggle-btn.active { background: #0d6efd; color: white; shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .toggle-btn:hover:not(.active) { background: rgba(255,255,255,0.5); }
        `}
      </style>

      <BackgroundBlobs />

      <Container className="py-5 position-relative z-1">
        <Reveal animation="fade-up">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end mb-5">
              <div>
                <div className="d-flex align-items-center mb-2">
                    <FaUserCircle className="text-primary me-2" size={20} />
                    <span className="text-adaptive-muted fw-bold small text-uppercase ls-1">Welcome back, {userInfo?.name || 'Athlete'}</span>
                </div>
                <h1 className="fw-bold display-4 mb-0 text-adaptive">Overview</h1>
                <p className="text-adaptive-muted mt-2 mb-0" style={{ maxWidth: "500px" }}>
                   {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="d-flex gap-3 mt-4 mt-lg-0">
                  <Button variant="dark" onClick={generatePDF} className="btn-modern d-flex align-items-center shadow-sm hover-lift">
                    <FaFilePdf className="me-2 text-danger" /> Export Report
                  </Button>
                  <Button variant="primary" onClick={handleShow} className="btn-modern d-flex align-items-center shadow-lg btn-glow hover-lift">
                    <FaEdit className="me-2" /> Log Daily Stats
                  </Button>
              </div>
            </div>
        </Reveal>

        {loadingWorkouts || loadingLogs ? <Loader /> : (
          <>
             <Row className="mb-5 g-4">
                 <Col md={6} lg={3}>
                     <Reveal animation="fade-up" delay={100}>
                         <Card className="glass-card card-calories border-0 h-100 p-4 hover-lift">
                             <div className="d-flex justify-content-between mb-3">
                                 <div className="icon-circle" style={{ background: "rgba(255, 115, 0, 0.1)", color: "#ff7300" }}>
                                    <FaFire />
                                 </div>
                                 <Badge bg="warning" text="dark" className="align-self-start rounded-pill px-3">Goal: {GOALS.calories}</Badge>
                             </div>
                             <h2 className="stat-value mb-1"><AnimatedValue value={todayStats.calories} /></h2>
                             <p className="text-adaptive-muted mb-3 fw-bold small uppercase">Calories Burned</p>
                             <ProgressBar now={getProgress(todayStats.calories, GOALS.calories)} variant="warning" style={{height: "6px", borderRadius: "10px"}} animated />
                         </Card>
                     </Reveal>
                 </Col>
                 <Col md={6} lg={3}>
                     <Reveal animation="fade-up" delay={200}>
                         <Card className="glass-card card-water border-0 h-100 p-4 hover-lift">
                             <div className="d-flex justify-content-between mb-3">
                                 <div className="icon-circle" style={{ background: "rgba(13, 202, 240, 0.1)", color: "#0dcaf0" }}>
                                    <FaTint />
                                 </div>
                                 <Badge bg="info" className="align-self-start rounded-pill px-3">Goal: {GOALS.water}ml</Badge>
                             </div>
                             <h2 className="stat-value mb-1"><AnimatedValue value={todayStats.water} /><span className="fs-6 ms-1 text-muted">ml</span></h2>
                             <p className="text-adaptive-muted mb-3 fw-bold small uppercase">Hydration</p>
                             <ProgressBar now={getProgress(todayStats.water, GOALS.water)} variant="info" style={{height: "6px", borderRadius: "10px"}} animated />
                         </Card>
                     </Reveal>
                 </Col>
                 <Col md={6} lg={3}>
                     <Reveal animation="fade-up" delay={300}>
                         <Card className="glass-card card-volume border-0 h-100 p-4 hover-lift">
                             <div className="d-flex justify-content-between mb-3">
                                 <div className="icon-circle" style={{ background: "rgba(13, 110, 253, 0.1)", color: "#0d6efd" }}>
                                    <FaDumbbell />
                                 </div>
                                 <Badge bg="primary" className="align-self-start rounded-pill px-3">Goal: {GOALS.volume}kg</Badge>
                             </div>
                             <h2 className="stat-value mb-1"><AnimatedValue value={(todayStats.volume / 1000).toFixed(1)} /><span className="fs-6 ms-1 text-muted">k</span></h2>
                             <p className="text-adaptive-muted mb-3 fw-bold small uppercase">Volume Lifted</p>
                             <ProgressBar now={getProgress(todayStats.volume, GOALS.volume)} variant="primary" style={{height: "6px", borderRadius: "10px"}} animated />
                         </Card>
                     </Reveal>
                 </Col>
                 <Col md={6} lg={3}>
                     <Reveal animation="fade-up" delay={400}>
                         <Card className="glass-card card-weight border-0 h-100 p-4 hover-lift">
                             <div className="d-flex justify-content-between mb-3">
                                 <div className="icon-circle" style={{ background: "rgba(25, 135, 84, 0.1)", color: "#198754" }}>
                                    <FaWeight />
                                 </div>
                                 <Badge bg={userInfo?.goal === 'Cut' ? 'danger' : 'success'} className="align-self-start rounded-pill px-3">{userInfo?.goal || 'Maintain'}</Badge>
                             </div>
                             <h2 className="stat-value mb-1">{todayStats.weight > 0 ? todayStats.weight : "--"}<span className="fs-6 ms-1 text-muted">kg</span></h2>
                             <p className="text-adaptive-muted mb-3 fw-bold small uppercase">Current Weight</p>
                         </Card>
                     </Reveal>
                 </Col>
             </Row>

             <Row className="g-4 mb-5">
               {/* --- ANALYTICS CHART SECTION --- */}
               <Col lg={8}>
                 <Reveal animation="fade-up" delay={500}>
                  <Card className="glass-card border-0 h-100 p-4 hover-lift">
                      {/* Header with 3 Toggle Buttons */}
                      <div className="d-flex justify-content-between align-items-center mb-4">
                          <div className="d-flex align-items-center gap-2">
                             <FaChartLine className="text-warning" size={20} />
                             <h5 className="fw-bold m-0 text-adaptive">Analytics</h5>
                          </div>
                          
                          <div className="toggle-container">
                             <button 
                                className={`toggle-btn ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                             >
                                Overview
                             </button>
                             <button 
                                className={`toggle-btn ${activeTab === 'weight' ? 'active' : ''}`}
                                onClick={() => setActiveTab('weight')}
                             >
                                Weight
                             </button>
                             {/* ADDED VOLUME BUTTON */}
                             <button 
                                className={`toggle-btn ${activeTab === 'volume' ? 'active' : ''}`}
                                onClick={() => setActiveTab('volume')}
                             >
                                Volume
                             </button>
                          </div>
                      </div>
                      
                      <div style={{ width: "100%", height: 350 }}>
                         <ResponsiveContainer>
                            {/* GRADIENTS DEFINTIONS */}
                            <defs>
                              <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>

                            {activeTab === 'overview' && (
                               <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis dataKey="date" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} dy={10}/>
                                 <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                                 <Tooltip content={<CustomTooltip />} />
                                 <Area type="monotone" dataKey="calories" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorCalories)" animationDuration={1500} />
                               </AreaChart>
                            )}
                            
                            {activeTab === 'weight' && (
                               <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis dataKey="date" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                                 <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                                 <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                 <Bar dataKey="weight" radius={[4, 4, 4, 4]} barSize={12} animationDuration={1500}>
                                    {chartData.map((entry, index) => {
                                        const prevWeight = index > 0 ? chartData[index - 1].weight : entry.weight;
                                        return <Cell key={`cell-${index}`} fill={entry.weight <= prevWeight ? '#198754' : '#dc3545'} />;
                                    })}
                                 </Bar>
                               </BarChart>
                            )}

                            {/* ADDED VOLUME CHART */}
                            {activeTab === 'volume' && (
                               <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis dataKey="date" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} dy={10}/>
                                 <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                                 <Tooltip content={<CustomTooltip />} />
                                 <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" animationDuration={1500} />
                               </AreaChart>
                            )}
                         </ResponsiveContainer>
                      </div>
                  </Card>
                 </Reveal>
               </Col>

               <Col lg={4}>
                 <div className="d-flex flex-column gap-4 h-100">
                     <Reveal animation="fade-up" delay={600}>
                         <Card className="glass-card border-0 p-3 hover-lift">
                             <StepTracker currentSteps={todayStats.steps} goal={GOALS.steps} onSave={saveSteps} />
                         </Card>
                     </Reveal>
                     <Reveal animation="fade-up" delay={700}>
                         <Card className="glass-card border-0 p-4 flex-grow-1 hover-lift">
                             <h5 className="fw-bold mb-4 text-adaptive"><FaTrophy className="text-warning me-2"/>Today's Wins</h5>
                             <div className="achievements-list">
                                 {achievements.map((ach, idx) => (
                                     <AchievementBadge key={idx} {...ach} index={idx} />
                                 ))}
                             </div>
                         </Card>
                     </Reveal>
                 </div>
               </Col>
             </Row>
          </>
        )}
        
        {/* MODAL */}
        <Modal show={showModal} onHide={handleClose} centered animation={true}>
          <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Update Daily Log</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handleSaveLog}>
              <Form.Group className="mb-4">
                <Form.Label>Select Date</Form.Label>
                <Form.Control type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} required />
              </Form.Group>
              <Row>
                  <Col md={6}>
                      <Form.Group className="mb-3">
                          <Form.Label>Calories</Form.Label>
                          <InputGroup>
                             <InputGroup.Text><FaFire color="#ff7300"/></InputGroup.Text>
                             <Form.Control type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" />
                          </InputGroup>
                      </Form.Group>
                  </Col>
                  <Col md={6}>
                      <Form.Group className="mb-3">
                          <Form.Label>Water (ml)</Form.Label>
                          <InputGroup>
                             <InputGroup.Text><FaTint color="#0dcaf0"/></InputGroup.Text>
                             <Form.Control type="number" value={water} onChange={(e) => setWater(e.target.value)} placeholder="0" />
                          </InputGroup>
                      </Form.Group>
                  </Col>
              </Row>
              <Form.Group className="mb-4">
                <Form.Label>Current Weight (kg)</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaWeight color="#198754"/></InputGroup.Text>
                  <Form.Control type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.0" />
                </InputGroup>
              </Form.Group>
              <div className="d-flex gap-2">
                  <Button variant="secondary" onClick={handleClose} className="w-50 rounded-pill py-2">Cancel</Button>
                  <Button variant="primary" type="submit" className="w-50 rounded-pill py-2 fw-bold" disabled={updatingLog}>{updatingLog ? "Saving..." : "Save Updates"}</Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default Dashboard;