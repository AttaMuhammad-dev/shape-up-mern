import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Container, InputGroup } from "react-bootstrap";
import { 
  FaSignInAlt, FaUserCircle, FaEnvelope, FaLock, 
  FaGoogle, FaFacebookF, FaEye, FaEyeSlash 
} from "react-icons/fa"; 
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import Footer from "../components/Footer";

const Login = () => {
  // --- STATE ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // --- HOOKS ---
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // --- EFFECTS ---
  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  // --- HANDLERS ---
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email || !password) {
        toast.error("Please fill in all fields.");
        return;
    }
    
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      
      if (rememberMe) {
          localStorage.setItem("rememberUser", email);
      } else {
          localStorage.removeItem("rememberUser");
      }

      navigate("/");
      toast.success(`Welcome back, ${res.name}!`);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
  };


  return (
    <div className="page-wrapper d-flex flex-column min-vh-100 position-relative overflow-hidden">
      
      {/* --- STYLES (FIXED COLORS & DARK MODE) --- */}
      <style>
        {`
          /* GLOBAL WRAPPER */
          .page-wrapper {
            background-color: #f8f9fa;
            font-family: 'Inter', sans-serif;
            position: relative;
            color: #212529; /* Default light mode text */
          }
          body.dark-mode .page-wrapper {
            background-color: #0f172a;
            color: #f8fafc !important; /* Force light text in dark mode */
          }

          /* ANIMATED BACKGROUND SHAPES */
          .bg-shape {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            z-index: 0;
            opacity: 0.6;
            animation: floatShape 10s infinite alternate;
          }
          .shape-1 {
            top: -100px; left: -100px; width: 500px; height: 500px;
            background: rgba(13, 110, 253, 0.15);
          }
          .shape-2 {
            bottom: -100px; right: -100px; width: 400px; height: 400px;
            background: rgba(13, 202, 240, 0.15);
            animation-delay: 2s;
          }
          @keyframes floatShape {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(20px, 20px) scale(1.1); }
          }

          /* LOGIN CARD */
          .login-card {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 24px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.08);
            padding: 40px;
            position: relative;
            z-index: 2;
            overflow: hidden;
            transition: 0.3s;
          }
          
          body.dark-mode .login-card {
            background: #1e293b;
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 50px rgba(0,0,0,0.4);
          }

          /* HEADINGS & LABELS - COLOR FIX */
          .text-adaptive-head { color: #212529; }
          .text-adaptive-sub { color: #6c757d; }

          body.dark-mode .text-adaptive-head { color: #fff !important; }
          body.dark-mode .text-adaptive-sub,
          body.dark-mode .form-label,
          body.dark-mode .form-check-label,
          body.dark-mode .text-muted { 
              color: #cbd5e1 !important; /* Lighter gray for dark mode readability */
          }

          /* INPUT GROUPS & FIELDS */
          .custom-input-group .input-group-text {
            background: #f8f9fa;
            border: 1px solid #ced4da;
            border-right: none;
            color: #6c757d;
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
          }
          .custom-input {
            padding: 12px 15px;
            border: 1px solid #ced4da;
            border-left: none;
            background: #f8f9fa;
            border-top-right-radius: 12px;
            border-bottom-right-radius: 12px;
            transition: 0.2s;
            color: #212529;
          }
          .custom-input:focus {
            box-shadow: none;
            background: #fff;
            border-color: #0d6efd;
          }
          .custom-input:focus + .input-group-text, 
          .custom-input-group:focus-within .input-group-text {
             background: #fff;
             border-color: #0d6efd;
             color: #0d6efd;
          }
          
          /* Eye Icon Button */
          .btn-eye-toggle {
              border-top-right-radius: 12px; 
              border-bottom-right-radius: 12px; 
              border-color: #ced4da; 
              background-color: #f8f9fa;
              color: #6c757d;
          }

          /* Dark Mode Inputs - CRITICAL FIXES */
          body.dark-mode .custom-input, 
          body.dark-mode .custom-input-group .input-group-text,
          body.dark-mode .btn-eye-toggle {
            background-color: #334155 !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
            color: #fff !important; /* Force white text inside inputs */
          }
          
          body.dark-mode .custom-input::placeholder {
            color: rgba(255, 255, 255, 0.5) !important; /* Visible placeholder in dark mode */
          }

          body.dark-mode .custom-input:focus, 
          body.dark-mode .custom-input:focus + .input-group-text,
          body.dark-mode .custom-input-group:focus-within .input-group-text,
          body.dark-mode .custom-input-group:focus-within .btn-eye-toggle {
            border-color: #38bdf8 !important;
            color: #38bdf8 !important;
            background-color: #1e293b !important;
          }

          /* BUTTONS */
          .btn-login {
            padding: 14px;
            font-weight: 700;
            border-radius: 12px;
            background: linear-gradient(135deg, #0d6efd 0%, #0043a8 100%);
            border: none;
            font-size: 1.1rem;
            box-shadow: 0 10px 20px rgba(13, 110, 253, 0.3);
            transition: 0.3s;
            color: white;
          }
          .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(13, 110, 253, 0.5);
            background: linear-gradient(135deg, #0b5ed7 0%, #003585 100%);
          }

          /* SOCIAL BUTTONS */
          .btn-social {
             border: 1px solid #e9ecef;
             background: #fff;
             color: #212529;
             font-weight: 600;
             padding: 10px;
             border-radius: 10px;
             transition: 0.2s;
             display: flex; align-items: center; justify-content: center;
          }
          .btn-social:hover {
             background: #f8f9fa;
             transform: translateY(-2px);
          }
          .btn-google { color: #db4437; }
          .btn-facebook { color: #4267B2; }
          
          body.dark-mode .btn-social {
             background: rgba(255,255,255,0.05);
             border-color: rgba(255,255,255,0.1);
             color: #fff !important; /* Force white text for social buttons in dark mode */
          }
          body.dark-mode .btn-social:hover {
             background: rgba(255,255,255,0.1);
          }

          /* LINKS */
          .auth-link { text-decoration: none; font-weight: 700; color: #0d6efd; transition: 0.2s; }
          .auth-link:hover { text-decoration: underline; color: #003585; }
          body.dark-mode .auth-link { color: #38bdf8; }
          body.dark-mode .auth-link:hover { color: #7dd3fc; }

          /* HERO ICON ANIMATION */
          .hero-icon-wrapper {
            width: 100px; height: 100px;
            background: rgba(13, 110, 253, 0.1);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 20px;
            animation: pulseGlow 3s infinite;
          }
          .hero-icon { font-size: 3rem; color: #0d6efd; }
          @keyframes pulseGlow {
             0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
             70% { box-shadow: 0 0 0 20px rgba(13, 110, 253, 0); }
             100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
          }

          .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>

      {/* BACKGROUND ELEMENTS */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <Container className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-5 position-relative" style={{zIndex: 2}}>
        
        <Row className="justify-content-center w-100 fade-in">
          <Col md={8} lg={5}>
            
            {/* LOGO / BRANDING AREA */}
            <div className="text-center mb-4">
                <div className="hero-icon-wrapper">
                    <FaUserCircle className="hero-icon" />
                </div>
                <h3 className="fw-bold mb-1 text-adaptive-head" style={{letterSpacing: '-1px'}}>Welcome Back!</h3>
                <p className="text-adaptive-sub small">Sign in to continue your fitness journey</p>
            </div>

            <div className="login-card">
              
              <Form onSubmit={submitHandler}>
                
                {/* EMAIL INPUT */}
                <Form.Group className="mb-4" controlId="formEmail">
                  <Form.Label className="fw-bold small text-uppercase" style={{fontSize: '0.75rem'}}>Email Address</Form.Label>
                  <InputGroup className="custom-input-group">
                      <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                      <Form.Control 
                        className="custom-input" 
                        type="email" 
                        placeholder="name@example.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                      />
                  </InputGroup>
                </Form.Group>

                {/* PASSWORD INPUT - Forgot Password Link Removed */}
                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label className="fw-bold small text-uppercase" style={{fontSize: '0.75rem'}}>Password</Form.Label>
                  <InputGroup className="custom-input-group">
                      <InputGroup.Text><FaLock /></InputGroup.Text>
                      <Form.Control 
                        className="custom-input" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button 
                        variant="outline-secondary" 
                        className="border-start-0 btn-eye-toggle"
                        onClick={togglePasswordVisibility}
                      >
                          {showPassword ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
                      </Button>
                  </InputGroup>
                </Form.Group>

                {/* REMEMBER ME */}
                <Form.Group className="mb-4" controlId="formBasicCheckbox">
                    <Form.Check 
                        type="checkbox" 
                        label={<span className="small fw-bold text-adaptive-sub">Remember my email on this device</span>}
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                </Form.Group>

                {/* LOADER OR BUTTON */}
                {isLoading ? (
                    <div className="text-center py-3"><Loader size="sm" /></div>
                ) : (
                    <Button variant="primary" type="submit" className="w-100 btn-login mb-4">
                        Sign In <FaSignInAlt className="ms-2"/>
                    </Button>
                )}
{/* REGISTER LINK */}
                <div className="text-center pt-2">
                  <span className="text-adaptive-sub small">
                    Don't have an account yet? 
                    <Link to="/pages/register" className="auth-link ms-2">Create Account</Link>
                  </span>
                </div>

              </Form>
            </div>
            
            {/* FOOTER NOTE */}
            <div className="text-center mt-4 opacity-75">
                <small className="text-adaptive-sub" style={{fontSize: '0.7rem'}}>
                    &copy; {new Date().getFullYear()} Shape Up · Student portfolio project. Use sample details.
                </small>
            </div>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;