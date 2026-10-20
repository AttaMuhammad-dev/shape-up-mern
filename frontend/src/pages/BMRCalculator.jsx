import React, { useState, useEffect } from "react";
import { 
  Container, Row, Col, Form, Button, 
  Badge, InputGroup
} from "react-bootstrap";
import { useSelector } from "react-redux"; 
import { 
  FaCalculator, FaUndo, FaAppleAlt, FaMale, FaFemale
} from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
// Footer removed

// ==========================================
// 1. DATA & CONSTANTS
// ==========================================
const ACTIVITY_LEVELS = [
  { value: 1.2, label: "Sedentary", desc: "Desk job, little to no exercise" },
  { value: 1.375, label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
  { value: 1.55, label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
  { value: 1.725, label: "Very Active", desc: "Hard exercise 6-7 days/week" },
  { value: 1.9, label: "Super Active", desc: "Physical job or training 2x/day" },
];

const GOAL_MODIFIERS = {
  cut: -500,
  maintain: 0,
  bulk: 500
};

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

// --- Result Row (Animated) ---
const ResultRow = ({ label, value, unit, highlight = false, delay }) => (
    <div 
        className={`d-flex justify-content-between align-items-center p-3 mb-2 rounded-3 hover-scale fade-in-up ${highlight ? 'bg-primary bg-opacity-10 border border-primary' : 'bg-light border'}`}
        style={{animationDelay: delay}}
    >
        <span className={highlight ? "fw-bold text-primary" : "text-muted fw-bold"}>{label}</span>
        <span className={`fw-bold ${highlight ? 'h4 mb-0 text-primary' : 'h6 mb-0'}`}>
            {value} <small className="fs-6 text-muted">{unit}</small>
        </span>
    </div>
);

// --- Macro Card (Animated) ---
const MacroCard = ({ label, grams, cals, color, percent, delay }) => (
    <div 
        className="text-center p-3 rounded-4 border bg-white h-100 shadow-sm macro-card fade-in-up hover-lift"
        style={{animationDelay: delay}}
    >
        <h6 className="fw-bold text-uppercase ls-1" style={{color}}>{label}</h6>
        <h2 className="fw-bold mb-0 text-adaptive-head">{grams}g</h2>
        <small className="text-muted fw-bold">{cals} kcal ({percent}%)</small>
        <div className="mt-2" style={{height: '6px', background: '#eee', borderRadius: '10px', overflow: 'hidden'}}>
            <div style={{width: `${percent}%`, background: color, height: '100%', transition: 'width 1s ease-in-out'}}></div>
        </div>
    </div>
);

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
const BMRCalculator = () => {
  // --- REDUX STATE (FETCH FROM DASHBOARD) ---
  const { userInfo } = useSelector((state) => state.auth);

  // --- LOCAL STATE ---
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(25);
  const [activityIndex, setActivityIndex] = useState(2); // Default: Moderately Active (Index 2)
  const [bodyFat] = useState(15);
  const [formula] = useState("mifflin");
  const [goal, setGoal] = useState("maintain");
  
  // Results State
  const [bmr, setBmr] = useState(0);
  const [tdee, setTdee] = useState(0);
  const [targetCalories, setTargetCalories] = useState(0);
  const [macros, setMacros] = useState([]);

  // --- EFFECT: PRE-FILL FROM DASHBOARD ---
  useEffect(() => {
      if (userInfo) {
          if(userInfo.gender) setGender(userInfo.gender.toLowerCase());
          if(userInfo.weight) setWeight(userInfo.weight);
          if(userInfo.height) setHeight(userInfo.height);
          if(userInfo.age) setAge(userInfo.age);
          if(userInfo.goal) setGoal(userInfo.goal.toLowerCase());
      }
  }, [userInfo]);

  // --- CALCULATOR ENGINE ---
  useEffect(() => {
    let calculatedBMR = 0;
    const activity = ACTIVITY_LEVELS[activityIndex].value;

    // 1. Calculate Base BMR
    if (formula === "mifflin") {
        if (gender === "male") {
            calculatedBMR = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            calculatedBMR = 10 * weight + 6.25 * height - 5 * age - 161;
        }
    } else {
        const leanMass = weight * (1 - bodyFat / 100);
        calculatedBMR = 370 + (21.6 * leanMass);
    }

    // 2. Calculate TDEE & Target
    const calculatedTDEE = calculatedBMR * activity;
    const calculatedTarget = calculatedTDEE + GOAL_MODIFIERS[goal];

    // 3. Calculate Macros
    const proteinGrams = Math.round(weight * 2.2); 
    const fatGrams = Math.round(weight * 0.9);
    const proteinCals = proteinGrams * 4;
    const fatCals = fatGrams * 9;
    const remainingCals = calculatedTarget - (proteinCals + fatCals);
    const carbGrams = Math.max(0, Math.round(remainingCals / 4));

    setBmr(Math.round(calculatedBMR));
    setTdee(Math.round(calculatedTDEE));
    setTargetCalories(Math.round(calculatedTarget));

    setMacros([
        { name: "Protein", value: proteinGrams, cals: proteinCals, color: "#0d6efd" },
        { name: "Carbs", value: carbGrams, cals: remainingCals, color: "#198754" },
        { name: "Fats", value: fatGrams, cals: fatCals, color: "#ffc107" },
    ]);

  }, [gender, weight, height, age, activityIndex, bodyFat, formula, goal]);

  // --- HANDLERS ---
  const handleReset = () => {
      setWeight(70); setHeight(175); setAge(25); setActivityIndex(2); setGoal("maintain");
  };

  return (
    <div className="page-wrapper position-relative overflow-hidden">
      
      {/* --- STYLES (SCOPED) --- */}
      <style>
        {`
          /* THEME SETUP */
          .page-wrapper { min-height: 100vh; background-color: #ffffff; color: #212529; font-family: 'Inter', sans-serif; }
          body.dark-mode .page-wrapper { background-color: #0f172a; color: #fff; }

          /* GLASS PANELS */
          .content-panel {
            background: #ffffff; border: 1px solid #e9ecef; border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; position: relative; z-index: 2;
            transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          body.dark-mode .content-panel {
            background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px); box-shadow: 0 15px 35px rgba(0,0,0,0.3);
          }

          /* FORM INPUTS */
          .form-control, .form-select {
              background-color: #fff; border: 1px solid #ced4da; color: #212529; padding: 12px; border-radius: 12px;
          }
          body.dark-mode .form-control, body.dark-mode .form-select {
              background-color: #1e293b; border: 1px solid rgba(255,255,255,0.15); color: #fff;
          }
          .input-group-text { background-color: #f8f9fa; border: 1px solid #ced4da; color: #6c757d; }
          body.dark-mode .input-group-text { background-color: #334155; border: 1px solid rgba(255,255,255,0.15); color: #fff; }

          /* SLIDER STYLING */
          .custom-range::-webkit-slider-thumb { background: #0d6efd; cursor: pointer; transition: 0.2s; }
          .custom-range::-webkit-slider-thumb:hover { transform: scale(1.2); }

          /* TEXT COLORS */
          .text-adaptive-head { color: #212529; }
          body.dark-mode .text-adaptive-head { color: #fff !important; }
          .text-adaptive-sub { color: #6c757d; }
          body.dark-mode .text-adaptive-sub { color: #94a3b8 !important; }

          /* MACRO CARDS */
          body.dark-mode .macro-card { background: #1e293b !important; border-color: rgba(255,255,255,0.1) !important; }
          
          /* RESULTS ROW */
          body.dark-mode .bg-light { background-color: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.1) !important; }

          /* GOAL BUTTONS */
          .btn-goal { border: 1px solid transparent; color: #6c757d; transition: 0.3s; }
          .btn-goal.active { background-color: #ffc107; color: #000; border-color: #ffc107; box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4); transform: scale(1.05); }
          body.dark-mode .btn-goal { color: #94a3b8; }
          body.dark-mode .btn-goal.active { color: #000; }

          /* ANIMATIONS */
          .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
          .fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
          
          .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
          .hover-scale { transition: transform 0.2s; }
          .hover-scale:hover { transform: scale(1.02); }
          
          .pulse-glow { animation: pulseGlow 3s infinite; }

          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(13, 110, 253, 0); } 100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); } }
        `}
      </style>

      <Container className="py-5 position-relative" style={{zIndex: 2}}>
        
        {/* --- HEADER --- */}
        <div className="text-center mb-5 fade-in">
           <div className="d-inline-flex align-items-center justify-content-center mb-2 hover-scale">
              <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2 me-2 shadow-sm">AI POWERED</Badge>
           </div>
           <h1 className="display-4 fw-bold mb-3 text-adaptive-head">
              Metabolic Profile
           </h1>
           <p className="text-adaptive-sub mx-auto" style={{maxWidth: "600px", fontSize: "1.1rem"}}>
              Your personal blueprint for fat loss and muscle gain. Pre-filled with your dashboard data.
           </p>
        </div>

        <Row className="g-5">
            
            {/* LEFT COLUMN: SIMPLIFIED INPUTS */}
            <Col lg={6} className="fade-in-up" style={{ animationDelay: "0.1s" }}>
               <div className="content-panel p-4 p-md-5 h-100 hover-lift">
                  
                  <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="fw-bold mb-0 text-adaptive-head"><FaCalculator className="me-2 text-primary"/>Parameters</h4>
                      <Button variant="outline-secondary" size="sm" onClick={handleReset} className="rounded-pill px-3 hover-scale"><FaUndo className="me-1"/>Reset</Button>
                  </div>

                  <Form>
                      {/* Gender Selector */}
                      <div className="mb-4">
                          <label className="fw-bold text-adaptive-sub small mb-2 d-block">GENDER</label>
                          <div className="d-flex gap-3">
                              <Button 
                                variant={gender === 'male' ? 'primary' : 'outline-secondary'} 
                                className="flex-grow-1 py-2 rounded-pill d-flex align-items-center justify-content-center hover-scale"
                                onClick={() => setGender('male')}
                              >
                                  <FaMale size={20} className="me-2"/> Male
                              </Button>
                              <Button 
                                variant={gender === 'female' ? 'danger' : 'outline-secondary'} 
                                className="flex-grow-1 py-2 rounded-pill d-flex align-items-center justify-content-center hover-scale"
                                onClick={() => setGender('female')}
                              >
                                  <FaFemale size={20} className="me-2"/> Female
                              </Button>
                          </div>
                      </div>

                      {/* Stats Inputs Grid */}
                      <Row className="mb-4 g-3">
                          <Col md={4}>
                              <Form.Label className="fw-bold text-adaptive-sub small">WEIGHT</Form.Label>
                              <InputGroup className="hover-scale">
                                  <Form.Control type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
                                  <InputGroup.Text>kg</InputGroup.Text>
                              </InputGroup>
                          </Col>
                          <Col md={4}>
                              <Form.Label className="fw-bold text-adaptive-sub small">HEIGHT</Form.Label>
                              <InputGroup className="hover-scale">
                                  <Form.Control type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
                                  <InputGroup.Text>cm</InputGroup.Text>
                              </InputGroup>
                          </Col>
                          <Col md={4}>
                              <Form.Label className="fw-bold text-adaptive-sub small">AGE</Form.Label>
                              <InputGroup className="hover-scale">
                                  <Form.Control type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
                                  <InputGroup.Text>yrs</InputGroup.Text>
                              </InputGroup>
                          </Col>
                      </Row>

                      {/* Simplified Activity Slider */}
                      <div className="mb-5 p-3 rounded-4 bg-light border hover-scale">
                          <Form.Label className="fw-bold text-adaptive-sub small d-flex justify-content-between">
                              <span>ACTIVITY LEVEL</span>
                              <span className="text-primary fw-bold">{ACTIVITY_LEVELS[activityIndex].label}</span>
                          </Form.Label>
                          
                          <input 
                            type="range" 
                            className="form-range custom-range mb-2" 
                            min="0" max="4" step="1" 
                            value={activityIndex} 
                            onChange={(e) => setActivityIndex(Number(e.target.value))} 
                          />
                          
                          <small className="text-muted d-block text-center">
                             {ACTIVITY_LEVELS[activityIndex].desc}
                          </small>
                      </div>

                      {/* Goal Toggle (Fixed Visibility) */}
                      <div className="mb-3">
                          <label className="fw-bold text-adaptive-sub small mb-2 d-block">PRIMARY GOAL</label>
                          <div className="d-flex bg-light p-1 rounded-pill border">
                              {['cut', 'maintain', 'bulk'].map(g => (
                                  <Button 
                                    key={g}
                                    variant="light" // Base variant
                                    className={`flex-grow-1 rounded-pill text-uppercase fw-bold py-2 btn-goal ${goal === g ? 'active' : ''}`}
                                    onClick={() => setGoal(g)}
                                  >
                                      {g}
                                  </Button>
                              ))}
                          </div>
                      </div>

                  </Form>
               </div>
            </Col>

            {/* RIGHT COLUMN: RESULTS */}
            <Col lg={6} className="fade-in-up" style={{ animationDelay: "0.3s" }}>
                <div className="content-panel h-100 p-4 p-md-5 d-flex flex-column bg-gradient-panel hover-lift">
                    
                    <div className="text-center mb-4">
                        <div className="d-inline-flex p-3 bg-success bg-opacity-10 text-success rounded-circle mb-3 shadow-sm hover-scale">
                            <FaAppleAlt size={24} />
                        </div>
                        <h3 className="fw-bold text-adaptive-head mb-1">Your Metabolic Profile</h3>
                        <p className="text-muted small">Based on your inputs</p>
                    </div>

                    {/* Main Stats */}
                    <div className="mb-4">
                        <ResultRow label="BMR (Resting)" value={bmr} unit="kcal/day" delay="0.4s" />
                        <ResultRow label="TDEE (Maintenance)" value={tdee} unit="kcal/day" delay="0.5s" />
                        <div className="my-3"></div>
                        <div className="p-3 rounded-3 bg-primary text-white shadow d-flex justify-content-between align-items-center pulse-glow hover-scale">
                            <span className="fw-bold text-uppercase ls-1 small">Target Calories</span>
                            <span className="display-6 fw-bold">{targetCalories} <span className="fs-6 opacity-75">kcal</span></span>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="mb-4 text-center fade-in-up" style={{animationDelay: '0.6s'}}>
                        <h6 className="fw-bold text-adaptive-sub mb-3">Recommended Macros</h6>
                        <div style={{ height: '220px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={macros}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationDuration={1500}
                                    >
                                        {macros.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', textAlign: 'center'}}>
                                <span className="h4 fw-bold d-block mb-0 text-adaptive-head">{targetCalories}</span>
                                <small className="text-muted small">Daily</small>
                            </div>
                        </div>
                    </div>

                    {/* Macro Breakdown Cards */}
                    <Row className="g-2">
                        {macros.map((macro, idx) => (
                            <Col key={idx}>
                                <MacroCard 
                                    label={macro.name} 
                                    grams={macro.value} 
                                    cals={macro.cals} 
                                    color={macro.color} 
                                    percent={Math.round((macro.cals / targetCalories) * 100)}
                                    delay={`${0.7 + (idx * 0.1)}s`}
                                />
                            </Col>
                        ))}
                    </Row>

                </div>
            </Col>

        </Row>
      </Container>
      {/* Footer Removed */}
    </div>
  );
};

export default BMRCalculator;
