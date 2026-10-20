import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Button, Badge, Accordion, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux"; 
import { 
  FaDumbbell, FaAppleAlt, FaCalculator, FaUtensils, FaTint,
  FaArrowRight, FaCheckCircle, FaBolt, FaChartPie,
  FaGoogle, FaApple, FaHeartbeat, FaSpotify, FaStrava
} from "react-icons/fa"; 
// Footer removed as requested

// --- IMAGES ---
const IMG_AI_SCAN = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop";
const IMG_WORKOUT_ANALYTICS = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop";
const IMG_MEAL_PLAN = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop";

// ==========================================
// 1. ANIMATION UTILS (Custom Hooks for Full Animation)
// ==========================================

const useReveal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Trigger once
                }
            },
            { threshold: 0.15 } 
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return [ref, isVisible];
};

const Reveal = ({ children, className = "", delay = 0, animation = "fade-up" }) => {
    const [ref, isVisible] = useReveal();
    return (
        <div 
            ref={ref} 
            className={`${className} ${isVisible ? `anim-${animation}` : 'anim-hidden'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

// ==========================================
// 2. DATA CONSTANTS
// ==========================================
const FEATURES_LIST = [
  { 
    id: 1,
    title: "Workout Database", 
    icon: FaDumbbell, 
    color: "#0d6efd", 
    description: "Browse the exercise library, view movement illustrations and filter by name, body part or equipment.", 
    link: "/pages/workouts" 
  },
  { 
    id: 2,
    title: "Nutrition Checker", 
    icon: FaAppleAlt, 
    color: "#198754", 
    description: "Search the included food dataset, adjust portions and save calories and macronutrients to your daily log.", 
    link: "/pages/nutrition-checker" 
  },
  { 
    id: 3,
    title: "BMR Calculator", 
    icon: FaCalculator, 
    color: "#ffc107", 
    description: "Estimate basal metabolic rate and activity-adjusted calorie needs from your inputs.", 
    link: "/pages/bmr-calculator" 
  },
  { 
    id: 4,
    title: "Smart Meal Planner", 
    icon: FaUtensils, 
    color: "#fd7e14", 
    description: "Write and save your own daily meals and snacks alongside your diet profile.", 
    link: "/pages/profile/meal-plan" 
  },
  { 
    id: 5,
    title: "Hydration Tracking", 
    icon: FaTint, 
    color: "#0dcaf0", 
    description: "Log water intake effortlessly. Set daily goals and get smart reminders to stay hydrated.", 
    link: "/dashboard" 
  },
  { 
    id: 6,
    title: "Progress Analytics", 
    icon: FaChartPie, 
    color: "#6610f2", 
    description: "Visualize weight loss trends, strength gains, and consistency streaks with interactive charts.", 
    link: "/dashboard" 
  },
];

const FAQS = [
    { q: "Do I need a wearable device?", a: "No wearable is required. Logging is manual; compatible browsers may offer an optional motion-based step counter. Wearable syncing is not provided." },
    { q: "Is the food database global?", a: "The included sample dataset supports food searches and portion-based estimates. Coverage is limited and nutrition values are approximate." },
    { q: "Can I export my data?", a: "All accounts can export their records as JSON from Profile. Dashboard also offers a PDF progress report." },
];

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================

const BackgroundBlobs = () => (
  <div className="background-wrapper">
    <div className="grid-overlay"></div>
    <div className="blob blob-1"></div>
    <div className="blob blob-2"></div>
    <div className="blob blob-3"></div>
  </div>
);

const IntegrationBadge = ({ icon: Icon, name }) => (
    <div className="integration-badge hover-scale">
        <Icon className="me-2" size={18} /> {name}
    </div>
);

const FeatureCard = ({ title, description, link, icon: Icon, color, delay }) => (
    <div className="card-wrapper h-100">
      <Link to={link} className="text-decoration-none h-100 d-block">
        <Card className="h-100 border-0 shadow-sm feature-card rounded-4 hover-lift">
          <div className="card-decoration" style={{ background: color }}></div>
          <Card.Body className="p-4 p-lg-5 position-relative z-1 d-flex flex-column">
            <div className="icon-container mb-4 shadow-sm" style={{ background: color }}>
              <Icon size={24} color="#fff" />
            </div>
            <Card.Title className="fw-bold mb-3 h4 text-adaptive-head">{title}</Card.Title>
            <Card.Text className="text-adaptive-sub mb-4 flex-grow-1">{description}</Card.Text>
            <div className="d-flex align-items-center mt-auto learn-more">
              <span className="fw-bold me-2" style={{ color: color }}>Launch Tool</span>
              <div className="icon-circle" style={{ borderColor: color }}>
                <FaArrowRight size={10} color={color} />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Link>
    </div>
);

const DetailedFeatureSection = ({ title, text, img, isReversed, badge }) => (
    <div className="py-5 my-5">
        <Row className={`align-items-center ${isReversed ? 'flex-row-reverse' : ''}`}>
            <Col lg={6} className="mb-4 mb-lg-0">
                <Reveal animation={isReversed ? "slide-left" : "slide-right"}>
                    <div className="feature-img-box rounded-5 shadow-lg overflow-hidden position-relative hover-lift">
                        <img src={img} alt={title} className="img-fluid w-100 object-fit-cover" style={{minHeight: '350px'}} />
                        <div className="img-overlay"></div>
                    </div>
                </Reveal>
            </Col>
            <Col lg={6} className={isReversed ? 'pe-lg-5' : 'ps-lg-5'}>
                <Reveal animation="fade-up" delay={200}>
                    <Badge bg="light" text="primary" className="mb-3 border px-3 py-2 rounded-pill fw-bold ls-1">{badge}</Badge>
                    <h2 className="display-6 fw-bold mb-4 gradient-heading">{title}</h2>
                    <p className="lead text-adaptive-sub mb-4">{text}</p>
                    <ul className="feature-check-list">
                        <li className="d-flex align-items-center mb-2"><FaCheckCircle className="text-success me-2"/> Smart Recommendations</li>
                        <li className="d-flex align-items-center mb-2"><FaCheckCircle className="text-success me-2"/> Real-time Sync</li>
                        <li className="d-flex align-items-center mb-2"><FaCheckCircle className="text-success me-2"/> Exportable Reports</li>
                    </ul>
                    {/* Learn More Button Removed Here */}
                </Reveal>
            </Col>
        </Row>
    </div>
);

const ComparisonTable = () => (
    <Reveal animation="zoom-in">
        <div className="glass-panel p-4 p-md-5 rounded-5 mt-5">
            <div className="text-center mb-5">
                <h3 className="fw-bold text-adaptive-head">Free vs Pro</h3>
                <p className="text-adaptive-sub">Choose the power you need.</p>
            </div>
            <div className="table-responsive">
                <Table className="align-middle text-center custom-table" borderless>
                    <thead>
                        <tr>
                            <th className="text-start ps-4 text-adaptive-head">Features</th>
                            <th className="text-adaptive-head">Starter (Free)</th>
                            <th className="text-primary fw-bold">Pro Athlete</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-start ps-4 text-adaptive-sub">Workout Logging</td>
                            <td><FaCheckCircle className="text-success"/></td>
                            <td><FaCheckCircle className="text-success"/></td>
                        </tr>
                        <tr>
                            <td className="text-start ps-4 text-adaptive-sub">Calorie Counter</td>
                            <td><FaCheckCircle className="text-success"/></td>
                            <td><FaCheckCircle className="text-success"/></td>
                        </tr>
                        <tr>
                            <td className="text-start ps-4 text-adaptive-sub">Advanced Analytics</td>
                            <td><span className="text-muted">-</span></td>
                            <td><FaCheckCircle className="text-success"/></td>
                        </tr>
                        <tr>
                            <td className="text-start ps-4 text-adaptive-sub">AI Meal Plans</td>
                            <td><span className="text-muted">-</span></td>
                            <td><FaCheckCircle className="text-success"/></td>
                        </tr>
                        <tr>
                            <td className="text-start ps-4 text-adaptive-sub">Priority Support</td>
                            <td><span className="text-muted">-</span></td>
                            <td><FaCheckCircle className="text-success"/></td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        </div>
    </Reveal>
);

const CTASection = () => (
  <Container className="py-5 my-5">
    <Reveal animation="pop-in">
        <div className="cta-box rounded-5 p-5 text-center text-white position-relative overflow-hidden hover-lift">
          <div className="position-relative z-1">
            <h2 className="fw-bold display-5 mb-3">Ready to Transform?</h2>
            <p className="lead mb-4 opacity-75">Join thousands of others hitting their goals today.</p>
            <Button as={Link} to="/pages/register" variant="light" size="lg" className="rounded-pill px-5 fw-bold text-primary hover-scale">
              Create Free Account <FaCheckCircle className="ms-2" />
            </Button>
          </div>
          <div className="cta-circle cta-circle-1 floating-element"></div>
          <div className="cta-circle cta-circle-2 floating-element"></div>
        </div>
    </Reveal>
  </Container>
);

// ==========================================
// 4. MAIN PAGE COMPONENT
// ==========================================
const Features = () => {
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
      window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-wrapper position-relative overflow-hidden">
      
      {/* GLOBAL & COMPONENT CSS */}
      <style>
        {`
          /* --- GLOBAL THEME --- */
          .page-wrapper { min-height: 100vh; overflow-x: hidden; color: #212529; background-color: #ffffff; font-family: 'Inter', sans-serif; }
          body.dark-mode .page-wrapper { color: #f8fafc; background-color: #0f172a; }

          /* TEXT ADAPTIVE */
          .text-adaptive-head { color: #212529; }
          .text-adaptive-sub { color: #6c757d; }
          body.dark-mode .text-adaptive-head { color: #ffffff !important; }
          body.dark-mode .text-adaptive-sub { color: #94a3b8 !important; }

          .gradient-heading { background: linear-gradient(135deg, #0d6efd, #0dcaf0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

          /* --- BACKGROUND BLOBS & GRID --- */
          .background-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; pointer-events: none; }
          .grid-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
            background-size: 40px 40px; opacity: 0.5;
          }
          body.dark-mode .grid-overlay { background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); }
          .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; animation: blobMove 10s infinite alternate; }
          .blob-1 { width: 400px; height: 400px; background: #0d6efd; top: -100px; left: -100px; }
          .blob-2 { width: 300px; height: 300px; background: #6610f2; top: 40%; right: -50px; animation-delay: 2s; }
          .blob-3 { width: 350px; height: 350px; background: #0dcaf0; bottom: -50px; left: 20%; animation-delay: 4s; }
          
          /* --- HERO SECTION --- */
          .hero-section { padding-top: 80px; padding-bottom: 60px; }
          .btn-glow { background: #0d6efd; color: white; border: none; transition: 0.3s; }
          .btn-glow:hover { box-shadow: 0 10px 30px rgba(13, 110, 253, 0.4); transform: translateY(-3px); color: white; }
          
          .pill-badge { background: rgba(13, 110, 253, 0.1); color: #0d6efd; border: 1px solid rgba(13, 110, 253, 0.2); }
          body.dark-mode .pill-badge { background: rgba(255, 255, 255, 0.1); color: #fff; border-color: rgba(255,255,255,0.2); }

          /* --- INTEGRATIONS --- */
          .integration-scroll { display: flex; gap: 20px; overflow-x: auto; padding: 20px 0; -ms-overflow-style: none; scrollbar-width: none; }
          .integration-scroll::-webkit-scrollbar { display: none; }
          .integration-badge {
              display: flex; align-items: center; padding: 10px 20px; border-radius: 50px;
              background: #fff; border: 1px solid #e9ecef; color: #6c757d; font-weight: 600; white-space: nowrap;
              box-shadow: 0 4px 10px rgba(0,0,0,0.03);
          }
          body.dark-mode .integration-badge { background: #1e293b; border-color: rgba(255,255,255,0.1); color: #cbd5e1; }

          /* --- FEATURE CARDS --- */
          .feature-card { background: #ffffff; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); overflow: hidden; border: 1px solid #e9ecef !important; }
          body.dark-mode .feature-card { background-color: #1e293b !important; border-color: rgba(255,255,255,0.05) !important; }
          .feature-card:hover { border-color: #0d6efd !important; }
          body.dark-mode .feature-card:hover { border-color: #38bdf8 !important; }

          .icon-container { width: 60px; height: 60px; border-radius: 14px; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
          .feature-card:hover .icon-container { transform: scale(1.1) rotate(5deg); }
          .card-decoration { position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; border-radius: 50%; opacity: 0.05; transition: 0.5s; }
          .feature-card:hover .card-decoration { transform: scale(3); opacity: 0.1; }
          
          .icon-circle { width: 24px; height: 24px; border: 2px solid; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: auto; transition: 0.3s; }
          .feature-card:hover .icon-circle { background: var(--bs-primary); border-color: transparent !important; transform: translateX(5px); }
          .feature-card:hover .icon-circle svg { fill: white !important; }

          /* --- DEEP DIVE SECTIONS --- */
          .feature-img-box { border: 1px solid rgba(0,0,0,0.1); }
          body.dark-mode .feature-img-box { border-color: rgba(255,255,255,0.1); }
          .img-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(0,0,0,0.4), transparent); }
          .feature-check-list { list-style: none; padding: 0; font-weight: 500; color: #495057; }
          body.dark-mode .feature-check-list { color: #cbd5e1; }

          /* --- TABLE --- */
          .glass-panel { background: rgba(255,255,255,0.9); border: 1px solid #e9ecef; box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
          body.dark-mode .glass-panel { background: rgba(30,41,59,0.5); border-color: rgba(255,255,255,0.05); }
          .custom-table th, .custom-table td { padding: 15px; background: transparent !important; color: inherit !important; border-bottom: 1px solid rgba(0,0,0,0.05); }
          body.dark-mode .custom-table th, body.dark-mode .custom-table td { border-bottom: 1px solid rgba(255,255,255,0.05); }

          /* --- CTA SECTION --- */
          .cta-box { background: linear-gradient(135deg, #0d6efd 0%, #0099ff 100%); box-shadow: 0 20px 50px rgba(13, 110, 253, 0.3); }
          .cta-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.1); }
          .cta-circle-1 { width: 300px; height: 300px; top: -100px; right: -50px; }
          .cta-circle-2 { width: 200px; height: 200px; bottom: -50px; left: -50px; }

          /* --- ACCORDION --- */
          .accordion-button:not(.collapsed) { background-color: rgba(13, 110, 253, 0.1); color: #0d6efd; }
          .accordion-item { border: none; margin-bottom: 10px; border-radius: 10px !important; overflow: hidden; border: 1px solid rgba(0,0,0,0.05); }
          body.dark-mode .accordion-item { background: #1e293b; border-color: rgba(255,255,255,0.05); color: white; }
          body.dark-mode .accordion-button { background: #1e293b; color: white; }

          /* --- ANIMATIONS --- */
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes slideRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          @keyframes popIn { 0% { opacity: 0; transform: scale(0.8); } 80% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
          @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
          @keyframes blobMove { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0, 0) scale(1); } }
          
          .anim-hidden { opacity: 0; visibility: hidden; }
          .anim-fade-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; visibility: visible; }
          .anim-slide-left { animation: slideLeft 0.8s ease-out forwards; visibility: visible; }
          .anim-slide-right { animation: slideRight 0.8s ease-out forwards; visibility: visible; }
          .anim-zoom-in { animation: zoomIn 0.8s ease-out forwards; visibility: visible; }
          .anim-pop-in { animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; visibility: visible; }
          
          .floating-element { animation: float 6s ease-in-out infinite; }
          .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .hover-lift:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
          .hover-scale { transition: transform 0.3s ease; }
          .hover-scale:hover { transform: scale(1.05); }
        `}
      </style>

      <BackgroundBlobs />

      {/* 1. HERO */}
      <Reveal animation="zoom-in">
        <div className="text-center position-relative py-5 mb-5 hero-section">
          <Container>
            <Badge bg="primary" pill className="mb-3 px-3 py-2 text-uppercase shadow-sm pill-badge">
              <FaBolt className="me-2" /> Feature Suite 2.0
            </Badge>
            <h1 className="display-3 fw-bold mb-3 gradient-heading">
              Powerful Tools <br /> For Your Goals
            </h1>
            <p className="lead text-adaptive-sub mx-auto mb-5" style={{ maxWidth: "700px" }}>
              Unlock the ultimate fitness ecosystem. Everything you need to track, analyze, and improve your performance in one app.
            </p>
            
            <p className="small text-muted">A MERN web application · Works in desktop and mobile browsers · No paid plan</p>
          </Container>
        </div>
      </Reveal>

      {/* 2. MAIN BENTO GRID */}
      <Container className="pb-5">
        <Reveal animation="fade-up" delay={100}>
          <Row className="mb-5 text-center">
            <Col>
                <h2 className="fw-bold display-6 text-adaptive-head">Core Modules</h2>
                <div style={{ height: "4px", width: "50px", background: "#0d6efd", margin: "1rem auto", borderRadius: "2px" }}></div>
            </Col>
          </Row>
        </Reveal>
        
        <Row className="g-4 g-lg-5">
          {FEATURES_LIST.map((feature, index) => (
            <Col key={index} xs={12} md={6} lg={4}>
              <Reveal animation="fade-up" delay={200 + (index * 100)}>
                  <FeatureCard {...feature} />
              </Reveal>
            </Col>
          ))}
        </Row>
      </Container>

      {/* 3. DEEP DIVE SECTIONS (Full Animation) */}
      <Container className="py-5 overflow-hidden">
          <DetailedFeatureSection 
             title="Food Search & Nutrition Logs"
             text="Search foods by name and choose a portion to estimate calories, protein, carbohydrates and fat. Signed-in users can save and remove food entries in their daily log. These are estimates, not a medical or nutrition assessment."
             img={IMG_AI_SCAN}
             badge="SEARCH & LOG"
          />
          <DetailedFeatureSection 
             title="Advanced Workout Analytics"
             text="Record sets, repetitions and weight. Dashboard charts show your recorded workouts and daily progress; the PDF report exports your saved daily log."
             img={IMG_WORKOUT_ANALYTICS}
             isReversed={true}
             badge="DATA DRIVEN"
          />
          <DetailedFeatureSection 
             title="Dynamic Meal Planning"
             text="Organize breakfast, lunch, dinner and snacks in a saved daily plan. Update or clear each field whenever your plans change. AI coaching is a separate conversational tool and depends on provider availability."
             img={IMG_MEAL_PLAN}
             badge="AUTOMATION"
          />
      </Container>

      {/* 4. COMPARISON TABLE */}
      <Container className="pb-5">
          <div className="p-4 border rounded-4"><h2 className="h4">Free portfolio access</h2><p className="mb-0">All implemented features are available without payment. Use invented sample information. AI availability depends on free provider quotas.</p></div>
      </Container>

      {/* 5. FAQ SECTION */}
      <Container className="py-5 mb-5">
          <Row className="justify-content-center">
             <Col lg={8}>
                <Reveal animation="fade-up">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-adaptive-head">Common Questions</h2>
                        <p className="text-adaptive-sub">Everything you need to know about the platform.</p>
                    </div>
                    <Accordion defaultActiveKey="0">
                        {FAQS.map((faq, idx) => (
                            <Accordion.Item eventKey={idx.toString()} key={idx}>
                                <Accordion.Header>{faq.q}</Accordion.Header>
                                <Accordion.Body className="text-muted">{faq.a}</Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </Reveal>
             </Col>
          </Row>
      </Container>

      {!userInfo && <CTASection />}
      {/* Footer component removed */}
    </div>
  );
};

export default Features;