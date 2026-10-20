import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Badge, Accordion, Card, Nav, Form, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FaCheckCircle,
  FaQuoteRight, FaPlay, FaStar, 
  FaApple, FaGooglePlay, FaQuoteLeft
} from "react-icons/fa";
// Footer import hata diya hai kyunki use nahi karna
// import Footer from "../components/Footer"; 

// --- REDUX & API IMPORTS ---
import { useGetReviewsQuery, useCreateReviewMutation } from "../slices/reviewsApiSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader"; 

// --- ASSETS ---
const HERO_IMG = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop";
const FEATURE_NUTRITION = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop";
const FEATURE_WORKOUT = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop";
const FEATURE_ANALYTICS = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop";

// ==========================================
// 1. ANIMATION UTILS (Custom Hooks)
// ==========================================

// Hook: Detect when element is in viewport for scroll animation
const useReveal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Animate only once
                }
            },
            { threshold: 0.1 } 
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return [ref, isVisible];
};

// Component: Animated Wrapper
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
const FAQS = [
    { q: "Is Shape Up suitable for beginners?", a: "You can browse exercises, record your own routine and ask for general beginner coaching. Start with movements appropriate to your ability." },
    { q: "Do I need gym equipment?", a: "No. You can filter workouts by 'Bodyweight Only' or select specific equipment you own." },
    { q: "Can I track my water intake?", a: "Yes, we have a dedicated hydration logger with smart reminders." },
    { q: "Is the diet plan customized?", a: "The BMR calculator estimates energy needs. You can write your own meal plan and ask the separate AI coach for general guidance; neither replaces qualified nutrition advice." }
];

// ==========================================
// 3. SUB-COMPONENTS (With Animations Added)
// ==========================================

const FeatureTabContent = ({ title, desc, items, imgUrl, color }) => (
    <div className="feature-tab-content">
        <Row className="align-items-center">
            <Col lg={6}>
                <Reveal animation="slide-right">
                    <Badge bg={color} className="mb-3 px-3 py-2 rounded-pill shadow-sm">FEATURE HIGHLIGHT</Badge>
                    <h2 className="fw-bold mb-4">{title}</h2>
                    <p className="lead text-muted mb-4">{desc}</p>
                    <ul className="feature-list list-unstyled">
                        {items.map((item, idx) => (
                            <li key={idx} className="mb-3 d-flex align-items-center p-3 rounded-3 bg-light border-start border-4 feature-item hover-scale-small" style={{borderColor: `var(--bs-${color})`, transitionDelay: `${idx * 100}ms`}}>
                                <FaCheckCircle className={`text-${color} me-3 fs-5`} />
                                <span className="fw-semibold ms-2">{item}</span>
                            </li>
                        ))}
                    </ul>
                </Reveal>
            </Col>
            <Col lg={6}>
                <Reveal animation="zoom-in" delay={200}>
                    <div className="feature-image-container shadow-lg rounded-4 overflow-hidden mt-4 mt-lg-0 floating-element">
                        <img src={imgUrl} alt={title} className="img-fluid w-100 h-100 object-fit-cover" />
                    </div>
                </Reveal>
            </Col>
        </Row>
    </div>
);

const PricingCard = ({ title, price, features, isPro, color, delay }) => (
    <Reveal animation="pop-in" delay={delay}>
        <div className={`pricing-card ${isPro ? 'pro-card' : ''} h-100 d-flex flex-column hover-lift`}>
            {isPro && <div className="popular-tag">MOST POPULAR</div>}
            <div className="p-4 flex-grow-1">
                <h5 className={`text-${color} fw-bold text-uppercase ls-1`}>{title}</h5>
                <div className="price-tag my-3">
                    <span className="currency">$</span>
                    <span className="amount">{price}</span>
                    <span className="period">/mo</span>
                </div>
                <p className="text-muted small mb-4">{isPro ? "For serious athletes." : "Perfect for getting started."}</p>
                <hr className="opacity-10 my-4"/>
                <ul className="pricing-features list-unstyled">
                    {features.map((feat, idx) => (
                        <li key={idx} className={`mb-3 d-flex align-items-center ${feat.included ? '' : 'text-muted opacity-50 text-decoration-line-through'}`}>
                            {feat.included ? <FaCheckCircle className={`text-${color} me-2`} /> : <FaCheckCircle className="text-muted me-2" />}
                            <span>{feat.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-4 mt-auto">
                <Button variant={isPro ? 'secondary' : `outline-${color}`} className={`w-100 py-3 rounded-pill fw-bold hover-scale`}>
                    {isPro ? "Coming Soon" : `Choose ${title}`}
                </Button>
            </div>
        </div>
    </Reveal>
);

// ==========================================
// 4. MAIN PAGE COMPONENT
// ==========================================
const Home = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('tracking');

  // Review System
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  
  const { data: reviews, isLoading: loadingReviews, refetch } = useGetReviewsQuery();
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!userInfo) { toast.error("You must be logged in!"); return; }
    try {
      await createReview({ rating, comment }).unwrap();
      toast.success("Review Added Successfully!");
      setComment(""); setRating(5); refetch();
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };

  return (
    <div className="page-wrapper overflow-hidden">
      
      {/* =======================
          ANIMATION STYLES
         ======================= */}
      <style>
        {`
          /* --- VARIABLES --- */
          :root {
            --primary: #0d6efd;
            --secondary: #6610f2;
            --success: #198754;
            --dark-bg: #0f172a;
            --light-bg: #ffffff;
            --card-bg: #ffffff;
          }
          body.dark-mode { --card-bg: #1e293b; }

          /* --- KEYFRAMES --- */
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideRight { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes zoomIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
          @keyframes popIn { 0% { opacity: 0; transform: scale(0.5); } 80% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
          @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }

          /* --- ANIMATION CLASSES --- */
          .anim-hidden { opacity: 0; visibility: hidden; }
          .anim-fade-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; visibility: visible; }
          .anim-slide-right { animation: slideRight 0.8s ease-out forwards; visibility: visible; }
          .anim-zoom-in { animation: zoomIn 0.8s ease-out forwards; visibility: visible; }
          .anim-pop-in { animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; visibility: visible; }

          /* --- INTERACTIVE UTILS --- */
          /* CARD HOVER LIFT - Makes card pop up when hovered */
          .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .hover-lift:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
          
          .hover-scale { transition: transform 0.3s ease; }
          .hover-scale:hover { transform: scale(1.05); }
          
          .hover-scale-small { transition: transform 0.2s ease; cursor: default; }
          .hover-scale-small:hover { transform: scale(1.02); background-color: #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }

          .floating-element { animation: float 6s ease-in-out infinite; }

          /* --- EXISTING STYLES PRESERVED --- */
          .page-wrapper { font-family: 'Inter', sans-serif; overflow-x: hidden; background-color: var(--light-bg); color: #212529; }
          body.dark-mode .page-wrapper { background-color: var(--dark-bg); color: #f8fafc; }
          
          h1, h2, h3, h4, h5, h6 { font-weight: 800; letter-spacing: -0.5px; }
          .ls-1 { letter-spacing: 1px; }
          .text-gradient { background: linear-gradient(135deg, #0d6efd, #0dcaf0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          
          .hero-section {
             padding: 120px 0 80px; position: relative;
             background: radial-gradient(circle at top center, rgba(13, 110, 253, 0.05), transparent 70%);
          }
          .hero-tagline {
             font-size: 0.9rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;
             background: rgba(13, 110, 253, 0.1); color: #0d6efd; padding: 10px 20px; border-radius: 50px;
             display: inline-block; margin-bottom: 20px; border: 1px solid rgba(13, 110, 253, 0.2);
          }
          .hero-title { font-size: 4.5rem; line-height: 1.1; margin-bottom: 25px; }
          .hero-lead { font-size: 1.35rem; color: #6c757d; margin-bottom: 40px; max-width: 700px; margin-left: auto; margin-right: auto; }
          body.dark-mode .hero-lead { color: #94a3b8; }

          .btn-glow {
             padding: 18px 45px; font-size: 1.1rem; border-radius: 50px; font-weight: 700; border: none;
             background: linear-gradient(135deg, #0d6efd, #0099ff); color: white;
             box-shadow: 0 10px 30px rgba(13, 110, 253, 0.4); transition: transform 0.3s, box-shadow 0.3s;
          }
          .btn-glow:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(13, 110, 253, 0.6); color: white; }

          .hero-visual { margin-top: 60px; position: relative; perspective: 1500px; }
          .hero-card-stack { position: relative; width: 100%; max-width: 900px; margin: 0 auto; height: 500px; }
          .main-interface {
             width: 100%; height: 100%; object-fit: cover; border-radius: 20px;
             box-shadow: 0 50px 100px rgba(0,0,0,0.15); transform: rotateX(10deg);
             border: 1px solid rgba(0,0,0,0.05); transition: transform 0.5s;
          }
          .hero-visual:hover .main-interface { transform: rotateX(0deg) scale(1.02); } /* Interact on hover */
          body.dark-mode .main-interface { box-shadow: 0 50px 100px rgba(0,0,0,0.5); border-color: rgba(255,255,255,0.1); }

          .features-section { padding: 100px 0; background: #f8f9fa; }
          body.dark-mode .features-section { background: #0b1120; }
          
          .custom-nav-pills {
             justify-content: center; margin-bottom: 60px; background: #fff; padding: 10px; 
             border-radius: 50px; display: inline-flex; border: 1px solid #eee;
             box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          body.dark-mode .custom-nav-pills { background: #1e293b; border-color: rgba(255,255,255,0.05); }
          .custom-nav-pills .nav-link {
             border-radius: 30px; padding: 12px 30px; font-weight: 700; color: #6c757d; border: none; margin: 0 5px; transition: 0.3s;
          }
          .custom-nav-pills .nav-link.active {
             background: #0d6efd; color: white; box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3); transform: scale(1.05);
          }

          .feature-image-container { height: 400px; border: 1px solid rgba(0,0,0,0.1); transition: transform 0.5s; }
          .feature-image-container:hover { transform: scale(1.02); }
          body.dark-mode .feature-image-container { border-color: rgba(255,255,255,0.1); }

          .pricing-card {
             background: #fff; border: 1px solid #eee; border-radius: 24px; transition: 0.3s; position: relative; overflow: hidden;
          }
          body.dark-mode .pricing-card { background: #1e293b; border-color: rgba(255,255,255,0.05); }
          .pro-card { border: 2px solid #0d6efd; box-shadow: 0 20px 40px rgba(13, 110, 253, 0.15); }
          .popular-tag {
             background: #0d6efd; color: white; text-align: center; font-size: 0.75rem; font-weight: 800; padding: 5px; letter-spacing: 1px;
          }
          
          .price-tag .currency { font-size: 1.5rem; vertical-align: top; font-weight: 600; }
          .price-tag .amount { font-size: 3.5rem; font-weight: 800; line-height: 1; }
          .price-tag .period { font-size: 1rem; color: #6c757d; font-weight: 600; }
          
          .pricing-features { list-style: none; padding: 0; }
          .pricing-features li { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; font-weight: 500; font-size: 0.95rem; }
          .pricing-features li.disabled { opacity: 0.5; text-decoration: line-through; }

          .accordion-button:not(.collapsed) { background-color: rgba(13, 110, 253, 0.1); color: #0d6efd; }
          .accordion-item { border: none; margin-bottom: 10px; border-radius: 10px !important; overflow: hidden; border: 1px solid rgba(0,0,0,0.05); transition: 0.3s; }
          .accordion-item:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
          body.dark-mode .accordion-item { background: #1e293b; border-color: rgba(255,255,255,0.05); color: white; }
          body.dark-mode .accordion-button { background: #1e293b; color: white; }
        `}
      </style>

      {/* ==========================================
          1. HERO SECTION
         ========================================== */}
      <section className="hero-section">
        <Container className="text-center position-relative z-2">
            
            <Reveal animation="zoom-in">
                <div className="hero-tagline">Fitness Reimagined</div>
            </Reveal>
            
            <Reveal animation="fade-up" delay={200}>
                <h1 className="hero-title">
                   Train Smarter.<br/>
                   <span className="text-gradient">Live Better.</span>
                </h1>
            </Reveal>
            
            <Reveal animation="fade-up" delay={400}>
                <p className="hero-lead">
                   The all-in-one platform for nutrition tracking, workout planning, 
                   and progress visualization.
                </p>
            </Reveal>

            <Reveal animation="fade-up" delay={600}>
                <div className="d-flex justify-content-center gap-3"><Button as={Link} to="/pages/features" variant="light">Explore in your browser</Button></div>
            </Reveal>

            {/* 3D Visual Interface */}
            <Reveal animation="zoom-in" delay={800}>
                <div className="hero-visual">
                    <div className="hero-card-stack">
                        <img 
                           src={HERO_IMG} 
                           alt="App Dashboard" 
                           className="main-interface" 
                        />
                    </div>
                </div>
            </Reveal>

        </Container>
      </section>

      {/* ==========================================
          2. INTERACTIVE FEATURES TABS
         ========================================== */}
      <section className="features-section">
         <Container>
            <Reveal animation="fade-up">
                <div className="text-center mb-5">
                   <h2 className="display-5 fw-bold">Why Shape Up?</h2>
                   <p className="text-muted">Explore the tools that give you the edge.</p>
                </div>
            </Reveal>

            {/* Tabs Navigation */}
            <Reveal animation="fade-up" delay={200}>
                <div className="text-center">
                    <Nav variant="pills" className="custom-nav-pills" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                        <Nav.Item><Nav.Link eventKey="tracking">Tracking</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="planning">Planning</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="analytics">Analytics</Nav.Link></Nav.Item>
                    </Nav>
                </div>
            </Reveal>

            {/* Tab Content Area - UPDATED WITH ACTUAL PROJECT FEATURES */}
            <div className="mt-5">
                {activeTab === 'tracking' && (
                    <FeatureTabContent 
                        title="Precision Nutrition"
                        desc="Stay on top of your diet with smart tools. Calculate your BMR, track daily water intake, and log your meals."
                        // Updated items to match project (BMR, Water, etc.)
                        items={["BMR Calculator", "Nutrition Checker", "Hydration Logger", "Daily Calorie Log"]}
                        imgUrl={FEATURE_NUTRITION}
                        color="success"
                    />
                )}
                {activeTab === 'planning' && (
                    <FeatureTabContent 
                        title="Smart Workout Builder"
                        desc="Access our comprehensive database of exercises to build the perfect routine for your fitness goals."
                        // Updated items to match project (Workout DB)
                        items={["Workout Database", "Exercise Search", "Custom Routines", "Goal Setting"]}
                        imgUrl={FEATURE_WORKOUT}
                        color="primary"
                    />
                )}
                {activeTab === 'analytics' && (
                    <FeatureTabContent 
                        title="Visual Progress"
                        desc="Visualize your journey with interactive charts. Track your weight, volume lifted, and hydration trends over time."
                        // Updated items to match project (Dashboard Charts)
                        items={["Weight Progress Chart", "Volume Lifted Stats", "Calorie Burn Trends", "Hydration History"]}
                        imgUrl={FEATURE_ANALYTICS}
                        color="warning"
                    />
                )}
            </div>
         </Container>
      </section>

      {/* ==========================================
          3. DYNAMIC TRANSFORMATION STORIES (REVIEWS)
         ========================================== */}
      <section className="py-5 my-5">
         <Container>
            <Reveal animation="fade-up">
                <div className="text-center mb-5">
                   <FaQuoteRight className="text-primary opacity-25 display-1 mb-3 floating-element" />
                   <h2 className="fw-bold">Real Stories, Real Results</h2>
                   <p className="text-muted">See what our community says.</p>
                </div>
            </Reveal>
            
            {loadingReviews ? (
               <Loader />
            ) : (
               <Row className="g-4 mb-5">
                   {reviews && reviews.length > 0 ? (
                       reviews.map((review, idx) => (
                           <Col md={4} key={review._id}>
                               <Reveal animation="pop-in" delay={idx * 150}>
                                   <Card className="h-100 border-0 shadow-sm p-4 rounded-4 hover-lift" style={{background: 'var(--card-bg)'}}>
                                       <div className="d-flex align-items-center mb-3">
                                           <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-4" style={{width: 50, height: 50}}>
                                                {review.name.charAt(0)}
                                           </div>
                                           <div className="ms-3">
                                               <h6 className="fw-bold mb-0">{review.name}</h6>
                                               <small className="text-muted">{new Date(review.createdAt).toLocaleDateString()}</small>
                                           </div>
                                       </div>
                                       <div className="mb-3">
                                           {[...Array(review.rating)].map((_, i) => <FaStar key={i} className="text-warning"/>)}
                                       </div>
                                       <p className="text-muted fst-italic">
                                          <FaQuoteLeft className="me-2 opacity-25"/>
                                          "{review.comment}"
                                       </p>
                                   </Card>
                               </Reveal>
                           </Col>
                       ))
                   ) : (
                       <Col className="text-center">
                           <Alert variant="info">No reviews yet. Be the first to share your journey!</Alert>
                       </Col>
                   )}
               </Row>
            )}

            {/* ADD REVIEW FORM (DYNAMIC) */}
            <Row className="justify-content-center mt-5">
                <Col md={8} lg={6}>
                    <Reveal animation="zoom-in">
                        <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
                            <div className="bg-primary p-1"></div>
                            <Card.Body className="p-5">
                                <div className="text-center mb-4">
                                    <h4 className="fw-bold">Share Your Success</h4>
                                    <p className="text-muted small">Inspire others with your story</p>
                                </div>
                                
                                {userInfo ? (
                                    <Form onSubmit={submitHandler}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small text-uppercase">Rating</Form.Label>
                                            <div className="d-flex gap-2 mb-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FaStar 
                                                        key={star} size={24} 
                                                        className={`cursor-pointer ${star <= rating ? 'text-warning' : 'text-muted opacity-25'} hover-scale`}
                                                        onClick={() => setRating(star)}
                                                        style={{cursor: 'pointer'}}
                                                    />
                                                ))}
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold small text-uppercase">Your Story</Form.Label>
                                            <Form.Control as="textarea" rows={3} placeholder="How has Shape Up helped you?" value={comment} onChange={(e) => setComment(e.target.value)} required className="bg-light border-0" />
                                        </Form.Group>
                                        <Button type="submit" variant="primary" className="w-100 rounded-pill fw-bold py-2 btn-glow" disabled={isCreating}>
                                            {isCreating ? "Posting..." : "Post Review"}
                                        </Button>
                                    </Form>
                                ) : (
                                    <div className="text-center py-4 bg-light rounded-3">
                                        <p className="mb-3 text-muted">Join the community to leave a review.</p>
                                        <Button as={Link} to="/pages/login" variant="outline-primary" className="rounded-pill px-4 hover-scale">Login Now</Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Reveal>
                </Col>
            </Row>
         </Container>
      </section>

      {/* ==========================================
          4. PRICING PLANS
         ========================================== */}
      <section className="py-5"><Container className="text-center"><h2 className="fw-bold">Free to explore</h2><p>All implemented features are free. No payment or subscription is required. Use sample details in this student portfolio project.</p><Button as={Link} to="/pages/features">Explore the features</Button></Container></section>

      {/* ==========================================
          5. FAQ & DOWNLOAD
         ========================================== */}
      <section className="py-5 my-5">
         <Container>
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Reveal animation="fade-up">
                        <div className="text-center mb-5">
                            <h2 className="fw-bold">Frequently Asked Questions</h2>
                        </div>
                        <Accordion defaultActiveKey="0">
                            {FAQS.map((faq, idx) => (
                                <Accordion.Item eventKey={idx.toString()} key={idx}>
                                    <Accordion.Header>{faq.q}</Accordion.Header>
                                    <Accordion.Body>{faq.a}</Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </Reveal>
                </Col>
            </Row>

            {/* Mobile App CTA */}
            <Reveal animation="pop-in" delay={400}>
                <div className="mt-5 p-5 rounded-5 text-center text-white position-relative overflow-hidden shadow-lg" 
                     style={{background: "linear-gradient(135deg, #0d6efd, #6610f2)"}}>
                    <div className="position-relative z-2">
                        <h2 className="fw-bold mb-3">Get Fit on the Go</h2>
                        <p className="mb-4 opacity-75">Open Shape Up in your mobile browser. On iPhone use Safari → Share → Add to Home Screen; on Android use your browser’s Add to Home screen option. This adds a browser shortcut.</p>
                        <div className="d-flex justify-content-center gap-3">
                            <Button variant="light" className="d-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-bold hover-scale">
                                <FaApple size={20}/> App Store
                            </Button>
                            <Button variant="outline-light" className="d-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-bold hover-scale">
                                <FaGooglePlay size={18}/> Google Play
                            </Button>
                        </div>
                    </div>
                    {/* Decorative Circles */}
                    <div className="floating-element" style={{position: 'absolute', top: -50, left: -50, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%'}}></div>
                    <div className="floating-element" style={{position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', animationDelay: '1s'}}></div>
                </div>
            </Reveal>
         </Container>
      </section>

      {/* Footer Removed */}
    </div>
  );
};

export default Home;
