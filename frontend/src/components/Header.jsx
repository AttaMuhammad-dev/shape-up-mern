import React, { useEffect, useState, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";
import { toast } from "react-toastify";

import {ThemeContext} from '../context/ThemeContext';
import {dueReminders,localDay} from '../utils/reminders';
// Icons
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Logo from "../assets/images/Logo.png";

// IMPORTS FOR NOTIFICATIONS
import { useGetRemindersQuery } from "../slices/reminderSlice";
const NOTIFICATION_SOUND = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // --- 0. DARK MODE LOGIC (ADDED THIS FIX) ---
  const {theme,toggleTheme}=useContext(ThemeContext);
  const darkMode=theme==='dark';
  const seenReminders=useRef(new Set());
  // --- 1. DAILY TARGET NOTIFICATION LOGIC ---
  useEffect(() => {
    if (userInfo) {
      const today = localDay();
      const lastNotifiedDate = localStorage.getItem("lastDailyGoalNotification");

      if (lastNotifiedDate !== today) {
        if (userInfo.calorieGoal > 0) {
            const audio = new Audio(NOTIFICATION_SOUND);
            audio.play().catch(() => {});
    
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
      dueReminders(reminders,now,seenReminders.current).forEach((reminder) => {
        {
          if(localStorage.getItem("shape-reminder-sound")!=="false"){const audio = new Audio(NOTIFICATION_SOUND);audio.play().catch(() => {});}
          
          toast.info(`🔔 It's time: ${reminder.title}`, {
            position: "top-center",
            autoClose: 10000,
            theme: "colored"
          });

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`Shape Up Alert: ${reminder.title}`);
          }
        }
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
    <Navbar bg={darkMode ? "dark" : "white"} variant={darkMode ? "dark" : "light"} expand="md" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={Logo} alt="logo" style={{ width: "100px", filter: darkMode ? "brightness(1.2)" : "none" }} />
        </Navbar.Brand>
        
        <div className="d-flex align-items-center">
             {/* Mobile Toggle Button */}
            <Navbar.Toggle onClick={handleMobileMenuToggle} className="me-2">
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
                    <NotificationsActiveIcon sx={{ fontSize: "1.2rem", marginBottom: "3px", marginRight: "3px", color: "#e63946" }} />
                    Alerts
                </NavLink>
            )}
          </Nav>
          
          <Nav className="align-items-center">
            {/* DARK MODE TOGGLE BUTTON - THIS WAS MISSING */}
            <Nav.Link onClick={toggleTheme} style={{ cursor: "pointer", marginRight: "10px" }}>
                {darkMode ? <LightModeIcon sx={{ color: "#f1c40f" }} /> : <DarkModeIcon sx={{ color: "#34495e" }} />}
            </Nav.Link>

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
  );
};  

export default Header;
