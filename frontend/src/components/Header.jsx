import React, { useEffect, useState, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";
import { toast } from "react-toastify";

import {ThemeContext} from '../context/ThemeContext';
import {dueReminders,localDay} from '../utils/reminders';
import {reminderAudio} from '../utils/reminderAudio';
// Icons
import {FaBars as MenuIcon,FaTimes as CloseIcon,FaBell as NotificationsActiveIcon,FaMoon as DarkModeIcon,FaSun as LightModeIcon} from 'react-icons/fa';
import Logo from "../assets/images/Logo.png";

// IMPORTS FOR NOTIFICATIONS
import { useGetRemindersQuery } from "../slices/reminderSlice";


const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // --- 0. DARK MODE LOGIC (ADDED THIS FIX) ---
  const {theme,toggleTheme}=useContext(ThemeContext);
  const darkMode=theme==='dark';
  const seenReminders=useRef(new Set());
  const [audioState,setAudioState]=useState(reminderAudio.snapshot());
  const [activeAlarms,setActiveAlarms]=useState([]);
  useEffect(()=>reminderAudio.subscribe(setAudioState),[]);
  useEffect(()=>{
    seenReminders.current.clear();setActiveAlarms([]);reminderAudio.stop();
    return ()=>reminderAudio.stop();
  },[userInfo?._id]);
  const dismissAlarm=()=>{reminderAudio.stop();setActiveAlarms([]);};
  const replayAlarm=()=>void reminderAudio.play({persistent:activeAlarms.some(r=>r.priority==='High')});
  useEffect(()=>{
    const changed=()=>{if(!reminderAudio.enabled()||localStorage.getItem('shape-reminders-enabled')==='false')reminderAudio.stop();};
    window.addEventListener('shape-reminder-preferences',changed);
    return ()=>window.removeEventListener('shape-reminder-preferences',changed);
  },[]);

  // --- 1. DAILY TARGET NOTIFICATION LOGIC ---
  useEffect(() => {
    if (userInfo && localStorage.getItem("shape-reminders-enabled")!=="false") {
      const today = localDay();
      const lastNotifiedDate = localStorage.getItem("lastDailyGoalNotification");

      if (lastNotifiedDate !== today) {
        if (userInfo.calorieGoal > 0) {
            if(localStorage.getItem("shape-reminder-sound")!=="false"){
              void reminderAudio.play({kind:'daily',repeats:1});
            }
    
            toast.info(`🎯 Today's Goals: ${userInfo.calorieGoal || 2000} Cal, ${userInfo.waterGoal || 3000}ml Water. You got this!`, {
                position: "top-center",
                autoClose: 8000,
                theme: darkMode ? "dark" : "light",
                icon: "💪"
            });
    
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Shape Up: Daily Targets", {
                    body: "Let's hit those goals today! 🏋️‍♂️"
                });
            }
            localStorage.setItem("lastDailyGoalNotification", today);
        }
      }
    }
  }, [userInfo, darkMode]); 

  // --- 2. EXISTING REMINDER LOGIC ---
  const { data: reminders } = useGetRemindersQuery(undefined, {
    skip: !userInfo,
    pollingInterval: 60000, 
  });

  useEffect(() => {
    const checkReminders = () => {
      if (!reminders || reminders.length === 0 || localStorage.getItem("shape-reminders-enabled")==="false") return;
      const now = new Date();
      const due=dueReminders(reminders,now,seenReminders.current);
      if(!due.length)return;
      setActiveAlarms(current=>[...current,...due].filter((item,index,all)=>all.findIndex(other=>other._id===item._id)===index));
      if(reminderAudio.enabled()&&(reminderAudio.snapshot().kind!=='reminder'||due.some(reminder=>reminder.priority==='High')))void reminderAudio.play({persistent:due.some(reminder=>reminder.priority==='High')});
      due.forEach(reminder=>{
        toast.info(`It's time: ${reminder.title}`,{position:'top-center',autoClose:8000});
        if('Notification' in window&&Notification.permission==='granted')new Notification(`Shape Up Alert: ${reminder.title}`);
      });

    };



    checkReminders();
    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [reminders]);
  
  // --- HEADER LOGIC ---
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      localStorage.removeItem("userInfo");
      localStorage.removeItem("lastDailyGoalNotification"); 
      sessionStorage.clear(); 
      navigate("/pages/login");
      toast.success("Logout Successfully!");
    } catch (err) {
      console.error(err);
      dispatch(logout());
      localStorage.removeItem("userInfo");
      sessionStorage.clear();
      navigate("/pages/login");
    }
  };

  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(()=>setMobileMenuOpen(false),[location.pathname]);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Nav.Link as={Link} to={to} className={isActive ? "active" : ""}>
        {children}
      </Nav.Link>
    );
  };

  return (
    <>
    <Navbar bg={darkMode ? "dark" : "white"} variant={darkMode ? "dark" : "light"} expand="md" expanded={isMobileMenuOpen} onToggle={setMobileMenuOpen} sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={Logo} alt="logo" style={{ width: "100px", filter: darkMode ? "brightness(1.2)" : "none" }} />
        </Navbar.Brand>
        
        <div className="d-flex align-items-center">
             {/* Mobile Toggle Button */}
            <Navbar.Toggle aria-controls="responsive-navbar-nav" aria-label="Toggle navigation" className="me-2">
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </Navbar.Toggle>
        </div>

        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <NavLink to="/">Home</NavLink>
            {userInfo && <NavLink to="/dashboard">Dashboard</NavLink>}
            <NavLink to="/pages/features">Features</NavLink>
            <NavLink to="/pages/workouts">Workout Database</NavLink>
            <NavLink to="/pages/nutrition-checker">Nutrition</NavLink>
            <NavLink to="/pages/bmr-calculator">BMR</NavLink>
            
            {userInfo && (
                <NavLink to="/notifications">
                    <NotificationsActiveIcon style={{ fontSize: "1.2rem", marginBottom: "3px", marginRight: "3px", color: "#e63946" }} />
                    Alerts
                </NavLink>
            )}
          </Nav>
          
          <Nav className="align-items-center">
            {/* DARK MODE TOGGLE BUTTON - THIS WAS MISSING */}
            <Nav.Link aria-label={darkMode?'Switch to light theme':'Switch to dark theme'} onClick={toggleTheme} style={{ cursor: "pointer", marginRight: "10px" }}>
                {darkMode ? <LightModeIcon style={{ color: "#f1c40f" }} /> : <DarkModeIcon style={{ color: "#34495e" }} />}
            </Nav.Link>

            {userInfo && !audioState.unlocked && reminderAudio.enabled() && (
              <Nav.Link onClick={()=>void reminderAudio.play({kind:'test',repeats:1})}>Enable reminder sound</Nav.Link>
            )}
            {userInfo ? (
              <NavDropdown title={userInfo.name} id="username">
                <NavDropdown.Item as={Link} to="/pages/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/pages/settings">Settings & Support</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/pages/register">Register</Nav.Link>
                <Nav.Link as={Link} to="/pages/login">Login</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    {activeAlarms.length>0&&<div role="alert" aria-label="Active reminder" className="shadow-lg border rounded-3 p-3 bg-body text-body" style={{position:'fixed',bottom:20,left:'50%',transform:'translateX(-50%)',width:'min(620px,calc(100% - 32px))',zIndex:2100}}>
      <strong>Reminder: {activeAlarms.map(item=>item.title).join(' · ')}</strong>
      <p className="small mb-2">{audioState.error||(!reminderAudio.enabled()?'Sound is off in Settings.':audioState.playingId?'Your selected sound is playing. Normal alerts repeat three times; high-priority alerts stop after two minutes.':'Sound finished. You can replay it or dismiss this alert.')}</p>
      <div className="d-flex flex-wrap gap-2">
        {reminderAudio.enabled()&&<button className="btn btn-outline-primary btn-sm" onClick={replayAlarm}>{audioState.blocked?'Play sound':'Replay selected sound'}</button>}
        <button className="btn btn-primary btn-sm" onClick={dismissAlarm}>Stop & dismiss</button>
      </div>
    </div>}
    </>
  );
};  

export default Header;
