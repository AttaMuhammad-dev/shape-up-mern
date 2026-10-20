import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Container, InputGroup, ProgressBar } from "react-bootstrap";
import { 
  FaUserPlus, FaUser, FaEnvelope, FaLock, FaCheckCircle, 
  FaGoogle, FaFacebookF, FaEye, FaEyeSlash 
} from "react-icons/fa"; 
import { useDispatch, useSelector } from "react-redux";
import { useRegisterMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import Footer from "../components/Footer";

const Register = () => {
  // --- STATE ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Password Strength Logic
  const [passwordStrength, setPasswordStrength] = useState(0);

  // --- HOOKS ---
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // --- EFFECTS ---
  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  useEffect(() => {
      // Calculate Password Strength
      let score = 0;
      if (password.length > 5) score += 25;
      if (password.length > 8) score += 25;
      if (/[A-Z]/.test(password)) score += 25;
      if (/[0-9]/.test(password)) score += 25;
      setPasswordStrength(score);
  }, [password]);

  // --- HANDLERS ---
  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
        toast.error("All fields are required.");
        return;
    }
    
    if(password.length<8){toast.error("Use a password of at least 8 characters.");return;}
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
        toast.error("Please confirm that you will use sample details in this portfolio demo.");
        return;
    }

    try {
      const res = await register({ name, email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate("/");
      toast.success("Account Created Successfully!");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
  };


  const getStrengthColor = () => {
      if (passwordStrength < 50) return "danger";
      if (passwordStrength < 75) return "warning";
      return "success";
  };

  return (
    <div className="page-wrapper d-flex flex-column min-vh-100 position-relative overflow-hidden">
      
      {/* --- STYLES --- */}
      <style>
        {`
          /* GLOBAL WRAPPER */
          .page-wrapper {
            background-color: #f8f9fa;
            font-family: 'Inter', sans-serif;
            position: relative;
            color: #212529;
          }
          body.dark-mode .page-wrapper {
            background-color: #0f172a;
            color: #f8fafc !important;
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
            top: -150px; left: -150px; width: 600px; height: 600px;
            background: rgba(13, 202, 240, 0.1);
          }
          .shape-2 {
            bottom: -150px; right: -150px; width: 500px; height: 500px;
            background: rgba(102, 16, 242, 0.1);
            animation-delay: 2s;
          }
          @keyframes floatShape {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(30px, -30px) scale(1.1); }
          }

          /* REGISTER CARD */
          .register-card {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 24px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.08);
            padding: 40px;
            position: relative;
            z-index: 2;
            transition: 0.3s;
          }
          
          body.dark-mode .register-card {
            background: #1e293b;
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 50px rgba(0,0,0,0.4);
          }

          /* HEADINGS & TEXT */
          .text-adaptive-head { color: #212529; }
          .text-adaptive-sub { color: #6c757d; }

          body.dark-mode .text-adaptive-head { color: #fff !important; }
          body.dark-mode .text-adaptive-sub,
          body.dark-mode .form-label,
          body.dark-mode .form-check-label,
          body.dark-mode .text-muted { 
              color: #cbd5e1 !important; 
          }

          /* INPUT GROUPS */
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

          /* Dark Mode Inputs */
          body.dark-mode .custom-input, 
          body.dark-mode .custom-input-group .input-group-text,
          body.dark-mode .btn-eye-toggle {
            background-color: #334155 !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
            color: #fff !important;
          }
          body.dark-mode .custom-input::placeholder {
            color: rgba(255, 255, 255, 0.5) !important;
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
          .btn-register {
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
          .btn-register:hover {
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
             color: #fff !important;
          }
          body.dark-mode .btn-social:hover {
             background: rgba(255,255,255,0.1);
          }

          /* LINKS & UTILS */
          .auth-link { text-decoration: none; font-weight: 700; color: #0d6efd; transition: 0.2s; }
          .auth-link:hover { text-decoration: underline; color: #003585; }
          body.dark-mode .auth-link { color: #38bdf8; }
          body.dark-mode .auth-link:hover { color: #7dd3fc; }

          .btn-eye-toggle {
              border-top-right-radius: 12px; 
              border-bottom-right-radius: 12px; 
              border-color: #ced4da; 
              background-color: #f8f9fa;
              color: #6c757d;
          }

          /* HERO ICON */
          .hero-icon-wrapper {
            width: 90px; height: 90px;
            background: rgba(13, 202, 240, 0.1);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 20px;
            animation: pulseGlow 3s infinite;
          }
          .hero-icon { font-size: 2.5rem; color: #0dcaf0; }
          @keyframes pulseGlow {
             0% { box-shadow: 0 0 0 0 rgba(13, 202, 240, 0.4); }
             70% { box-shadow: 0 0 0 20px rgba(13, 202, 240, 0); }
             100% { box-shadow: 0 0 0 0 rgba(13, 202, 240, 0); }
          }

          .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>

      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <Container className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-5 position-relative" style={{zIndex: 2}}>
        
        <Row className="justify-content-center w-100 fade-in">
          <Col md={8} lg={6} xl={5}>
            
            <div className="text-center mb-4">
                <div className="hero-icon-wrapper">
                    <FaUserPlus className="hero-icon" />
                </div>
                <h3 className="fw-bold mb-1 text-adaptive-head" style={{letterSpacing: '-1px'}}>Start Your Journey</h3>
                <p className="text-adaptive-sub small">Create an account to track your progress & goals.</p>
            </div>

            <div className="register-card">
              
              <Form onSubmit={submitHandler}>
                
                {/* NAME INPUT */}
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label className="fw-bold small text-uppercase" style={{fontSize: '0.75rem'}}>Full Name</Form.Label>
                  <InputGroup className="custom-input-group">
                      <InputGroup.Text><FaUser /></InputGroup.Text>
                      <Form.Control 
                        className="custom-input" 
                        type="text" 
                        placeholder="John Doe" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                      />
                  </InputGroup>
                </Form.Group>

                {/* EMAIL INPUT */}
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label className="fw-bold small text-uppercase" style={{fontSize: '0.75rem'}}>Email Address</Form.Label>
                  <InputGroup className="custom-input-group">
                      <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                      <Form.Control 
                        className="custom-input" 
                        type="email" 
                        placeholder="name@example.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                  </InputGroup>
                </Form.Group>

                {/* PASSWORD INPUT */}
                <Form.Group className="mb-2" controlId="formPassword">
                  <Form.Label className="fw-bold small text-uppercase" style={{fontSize: '0.75rem'}}>Password</Form.Label>
                  <InputGroup className="custom-input-group">
                      <InputGroup.Text><FaLock /></InputGroup.Text>
                      <Form.Control 
                        className="custom-input" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Create password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
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

                {/* Password Strength Meter */}
                {password && (
                    <div className="mb-3">
                        <ProgressBar 
                            now={passwordStrength} 
                            variant={getStrengthColor()} 
                            style={{height: '4px', borderRadius: '2px'}} 
                        />
                        <div className="d-flex justify-content-between mt-1">
                            <small className="text-muted" style={{fontSize: '0.65rem'}}>Strength</small>
                            <small className={`text-${getStrengthColor()} fw-bold`} style={{fontSize: '0.65rem'}}>
                                {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                            </small>
                        </div>
                    </div>
                )}

                {/* CONFIRM PASSWORD */}
                <Form.Group className="mb-4" controlId="formConfirmPassword">
                  <Form.Label className="fw-bold small text-uppercase" style={{fontSize: '0.75rem'}}>Confirm Password</Form.Label>
                  <InputGroup className="custom-input-group">
                      <InputGroup.Text><FaCheckCircle /></InputGroup.Text>
                      <Form.Control 
                        className="custom-input" 
                        type="password" 
                        placeholder="Repeat password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                      />
                  </InputGroup>
                </Form.Group>

                {/* TERMS CHECKBOX */}
                <Form.Group className="mb-4" controlId="formTerms">
                    <Form.Check 
                        type="checkbox" 
                        label={
                            <span className="small text-adaptive-sub">
                                I understand this is a portfolio demo and will use sample details. <Link to="/pages/privacy" className="text-decoration-none">Read the data notice</Link>
                            </span>
                        }
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                </Form.Group>

                {/* SUBMIT BUTTON */}
                {isLoading ? (
                    <div className="text-center py-3"><Loader size="sm" /></div>
                ) : (
                    <Button variant="primary" type="submit" className="w-100 btn-register mb-4">
                        Create Account
                    </Button>
                )}
{/* LOGIN LINK */}
                <div className="text-center pt-2">
                  <span className="text-adaptive-sub small">
                    Already have an account? 
                    <Link to="/pages/login" className="auth-link ms-2">Log In</Link>
                  </span>
                </div>

              </Form>
            </div>
            
            <div className="text-center mt-4 opacity-75">
                <small className="text-adaptive-sub" style={{fontSize: '0.7rem'}}>
                    &copy; {new Date().getFullYear()} Shape Up · Student portfolio project.
                </small>
            </div>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;