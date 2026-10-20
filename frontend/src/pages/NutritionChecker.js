import React, { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Badge,
  InputGroup,
  Alert,
  Nav
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import {
  useGetDailyLogsQuery,
  useUpdateDailyLogMutation,
  useDeleteFoodItemMutation,
} from "../slices/dailyLogSlice";
import { 
    FaSearch, FaTrashAlt, FaLeaf, FaFire, FaPlus, 
    FaUtensils, FaChevronLeft, FaChevronRight, FaHistory,
    FaAppleAlt, FaCoffee, FaWineGlass, FaDumbbell 
} from "react-icons/fa";

// ==========================================
// 1. SUB-COMPONENT: MACRO RING (ANIMATED)
// ==========================================
const MacroRing = ({ value, max, color, label, icon }) => {
    const radius = 35;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - ((value / (max || 1)) * circumference);

    return (
        <div className="macro-ring-wrapper text-center fade-in-up">
            <div className="position-relative d-inline-block hover-scale">
                <svg height={radius * 2} width={radius * 2} className="rotate-90">
                    <circle
                        stroke="rgba(128, 128, 128, 0.1)"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        fill="transparent"
                    />
                    <circle
                        stroke={color}
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-in-out" }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div className="macro-icon-center" style={{color: color}}>
                    {icon}
                </div>
            </div>
            <div className="mt-2">
                <div className="fw-bold h6 mb-0 text-adaptive-head">{Math.round(value)}g</div>
                <small className="text-adaptive-sub" style={{fontSize: '0.7rem'}}>{label}</small>
            </div>
        </div>
    );
};

// ==========================================
// 2. SUB-COMPONENT: FOOD CARD (ANIMATED)
// ==========================================
const FoodCard = ({ item, onAdd, updating, type = "search", index }) => {
  const [qty, setQty] = useState(1);
  const [mealType, setMealType] = useState("Breakfast");

  return (
    <Col className="fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
      <div className="content-panel h-100 p-3 d-flex flex-column hover-lift">
        <div className="d-flex justify-content-between align-items-start mb-2">
           <div>
              {/* Badge changed to reflect "Logged Today" if in recent tab */}
              {type === 'recent' && <Badge bg="success" className="mb-2" style={{fontSize: '0.6rem'}}>LOGGED TODAY</Badge>}
              <h6 className="mb-0 fw-bold text-adaptive-head text-capitalize">{item.name}</h6>
              <small className="text-adaptive-sub" style={{fontSize: "0.75rem"}}>{item.serving}</small>
           </div>
           <Badge bg="warning" text="dark" className="shadow-sm">
              <FaFire className="me-1" />{Math.round(item.calories * qty)}
           </Badge>
        </div>

        {/* Macros */}
        <div className="macro-pills d-flex justify-content-between mb-3">
           <span className="macro-pill" style={{color: "#0d6efd"}}>P: {(item.protein * qty).toFixed(1)}</span>
           <span className="macro-pill" style={{color: "#198754"}}>C: {(item.carbs * qty).toFixed(1)}</span>
           <span className="macro-pill" style={{color: "#ffc107"}}>F: {(item.fat * qty).toFixed(1)}</span>
        </div>

        <div className="mt-auto">
           {/* Meal Selector */}
           <Form.Select 
                size="sm" 
                className="mb-2 meal-select" 
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
           >
               <option value="Breakfast">Breakfast</option>
               <option value="Lunch">Lunch</option>
               <option value="Dinner">Dinner</option>
               <option value="Snack">Snack</option>
           </Form.Select>

           {/* Quantity */}
           <InputGroup size="sm" className="mb-2">
              <Button variant="outline-secondary" onClick={() => setQty(q => Math.max(0.5, q - 0.5))}>-</Button>
              <Form.Control 
                 className="text-center fw-bold bg-transparent border-secondary text-adaptive-head"
                 value={qty} 
                 readOnly
                 style={{maxWidth: "50px"}}
              />
              <Button variant="outline-secondary" onClick={() => setQty(q => q + 0.5)}>+</Button>
           </InputGroup>

           <Button 
              variant="primary" 
              size="sm" 
              className="w-100 rounded-pill shadow-sm fw-bold btn-glow"
              onClick={() => onAdd(item, qty, mealType)}
              disabled={updating}
           >
              {updating ? "Saving..." : <><FaPlus className="me-1" /> Add Again</>}
           </Button>
        </div>
      </div>
    </Col>
  );
};

// ==========================================
// 3. MAIN COMPONENT: NUTRITION CHECKER
// ==========================================
const NutritionChecker = () => {
  // --- REDUX STATE ---
  const { userInfo } = useSelector((state) => state.auth);

  // --- COMPONENT STATE ---
  const [query, setQuery] = useState("");
  const [foodData, setFoodData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState("search");

  // --- API HOOKS ---
  const { data: dailyLogs, isLoading: loadingLogs, refetch } = useGetDailyLogsQuery();
  const [updateDailyLog, { isLoading: updatingLog }] = useUpdateDailyLogMutation();
  const [deleteFoodItem, { isLoading: deletingLog }] = useDeleteFoodItemMutation();

  // --- DERIVED DATA ---
  const currentLog = Array.isArray(dailyLogs) 
    ? dailyLogs.find((log) => log.date === selectedDate) 
    : null;

  const currentFoodItems = useMemo(() => currentLog?.foods || [], [currentLog]);
  
  const totalStats = currentFoodItems.reduce((acc, item) => ({
      calories: acc.calories + (Number(item.calories) || 0),
      protein: acc.protein + (Number(item.protein) || 0),
      carbs: acc.carbs + (Number(item.carbs) || 0),
      fat: acc.fat + (Number(item.fat) || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const userBMR = userInfo?.weight ? userInfo.weight * 24 : 1800; 
  const calorieGoal = userInfo?.goal === 'Bulk' ? userBMR + 500 : userInfo?.goal === 'Cut' ? userBMR - 500 : 2000;
  
  const remainingCalories = Math.max(0, calorieGoal - totalStats.calories);
  const progressPercent = Math.min(100, (totalStats.calories / calorieGoal) * 100);

  // --- CHANGED LOGIC: RECENT FOODS NOW DEPENDS ON SELECTED DATE ---
  const recentFoods = useMemo(() => {
      // If no foods logged for THIS selected date, return empty.
      if (!currentFoodItems || currentFoodItems.length === 0) return [];
      
      // Get unique foods ONLY from the current date's log
      const uniqueFoods = Array.from(new Map(currentFoodItems.map(item => [item.name, item])).values());
      return uniqueFoods; 
  }, [currentFoodItems]); // Depends on currentFoodItems (which changes with date)

  // --- LOCAL DATABASE ---
  const localFoodDatabase = [
    { name: "roti (chapati)", calories: 120, protein: 3, carbs: 24, fat: 1, serving: "1 medium" },
    { name: "naan", calories: 260, protein: 9, carbs: 45, fat: 5, serving: "1 piece" },
    { name: "white rice (boiled)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving: "100g" },
    { name: "chicken biryani", calories: 290, protein: 12, carbs: 35, fat: 10, serving: "100g" },
    { name: "beef biryani", calories: 320, protein: 14, carbs: 32, fat: 14, serving: "100g" },
    { name: "egg (boiled)", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, serving: "1 large" },
    { name: "chicken breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "100g" },
    { name: "daal chana", calories: 160, protein: 8, carbs: 22, fat: 5, serving: "1 bowl" },
    { name: "apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, serving: "1 medium" },
    { name: "banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, serving: "1 medium" },
    { name: "milk (whole)", calories: 62, protein: 3.2, carbs: 4.8, fat: 3.3, serving: "100ml" },
    { name: "tea (chai)", calories: 120, protein: 3, carbs: 18, fat: 4, serving: "1 cup" },
    { name: "oats (cooked)", calories: 150, protein: 5, carbs: 27, fat: 2.5, serving: "1 bowl" },
    { name: "protein shake", calories: 120, protein: 24, carbs: 3, fat: 1, serving: "1 scoop" },
    { name: "salad (mixed)", calories: 45, protein: 1, carbs: 8, fat: 0.5, serving: "1 large bowl" },
  ];

  // --- HANDLERS ---
  const handleDateChange = (days) => {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + days);
      setSelectedDate(d.toISOString().split("T")[0]);
      // Reset tab to search on date change so user starts fresh
      setActiveTab("search"); 
  };

  const searchFoodHandler = (e) => {
    e.preventDefault();
    if (!query) return;
    const results = localFoodDatabase.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFoodData(results.length > 0 ? results : null);
    if (results.length === 0) toast.error("Not found. Try 'Chicken', 'Roti', etc.");
  };

  const addToLogHandler = async (item, quantity = 1, mealType = "Breakfast") => {
    try {
        const newFoodItem = {
            name: item.name,
            calories: Math.round(item.calories * quantity),
            protein: parseFloat((item.protein * quantity).toFixed(1)),
            carbs: parseFloat((item.carbs * quantity).toFixed(1)),
            fat: parseFloat((item.fat * quantity).toFixed(1)),
            servingSize: `${quantity} x ${item.serving} (${mealType})` 
        };
        
        await updateDailyLog({ 
            date: selectedDate, 
            foodItem: newFoodItem 
        }).unwrap();
        
        refetch(); // Critical for dashboard update
        toast.success(`Added ${item.name} to ${mealType}!`);
        setQuery("");
        
    } catch (err) {
        if (err.status === 504) {
            toast.error("Server Timeout! Backend is busy.");
        } else {
            toast.error(err?.data?.message || "Failed to add food");
        }
    }
  };

  const handleDelete = async (foodId) => {
    if (window.confirm("Delete this item?")) {
      try {
        await deleteFoodItem({ date: selectedDate, foodId }).unwrap();
        refetch(); // Sync dashboard
        toast.success("Item removed");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  return (
    <div className="page-wrapper position-relative">
      
      {/* --- CSS STYLES (Fixed for Dark Mode & Animation) --- */}
      <style>
        {`
          .page-wrapper { min-height: 100vh; overflow-x: hidden; background-color: #f8f9fa; color: #212529; font-family: 'Inter', sans-serif; }
          body.dark-mode .page-wrapper { background-color: #0f172a; color: #fff; }

          /* Content Panels */
          .content-panel { background: #ffffff; border: 1px solid #e9ecef; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; position: relative; z-index: 2; transition: 0.3s; }
          body.dark-mode .content-panel { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 15px 35px rgba(0,0,0,0.3); }

          /* Log Item */
          .log-item { background: #fff; border-radius: 16px; margin-bottom: 12px; padding: 16px; border: 1px solid #e9ecef; transition: 0.2s; display: flex; align-items: center; justify-content: space-between; }
          body.dark-mode .log-item { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); }
          
          /* Typography & Visibility Fixes */
          .text-adaptive-head { color: #212529 !important; }
          body.dark-mode .text-adaptive-head { color: #ffffff !important; }
          
          .text-adaptive-sub { color: #6c757d !important; }
          body.dark-mode .text-adaptive-sub { color: #cbd5e1 !important; }

          /* Fix Form Controls in Dark Mode */
          body.dark-mode .form-control, body.dark-mode .input-group-text, body.dark-mode .form-select {
              background-color: rgba(15, 23, 42, 0.8) !important; 
              border: 1px solid rgba(255,255,255,0.15) !important; 
              color: #fff !important; 
          }
          body.dark-mode .form-control::placeholder { color: rgba(255,255,255,0.4); }
          body.dark-mode input[type="date"] { color-scheme: dark; }

          /* Meal Select Specific */
          .meal-select { cursor: pointer; }
          body.dark-mode .meal-select option { background-color: #1e293b; color: white; }

          /* Calorie Circle */
          .calorie-circle { width: 180px; height: 180px; border-radius: 50%; border: 8px solid rgba(13, 110, 253, 0.1); display: flex; flex-direction: column; justify-content: center; align-items: center; margin: 0 auto; position: relative; }
          .calorie-circle-inner { width: 100%; height: 100%; border-radius: 50%; border: 8px solid #0d6efd; position: absolute; top: -8px; left: -8px; border-bottom-color: transparent; border-left-color: transparent; transform: rotate(45deg); transition: 1s cubic-bezier(0.4, 0, 0.2, 1); }

          /* Macro Rings */
          .rotate-90 { transform: rotate(-90deg); }
          .macro-icon-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.2rem; }

          /* ANIMATIONS */
          .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
          .fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
          .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
          .hover-scale { transition: transform 0.3s ease; }
          .hover-scale:hover { transform: scale(1.05); }
          .btn-glow { transition: 0.3s; }
          .btn-glow:hover { box-shadow: 0 0 15px rgba(13, 110, 253, 0.5); }

          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>

      <Container fluid="xxl" className="py-4 px-md-5 position-relative" style={{zIndex: 2}}>
        
        {/* ======================= 
            1. HEADER & DATE NAV 
           ======================= */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 fade-in">
           <div className="d-flex align-items-center mb-3 mb-md-0">
              <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success me-3 shadow-sm hover-scale">
                 <FaLeaf size={24} />
              </div>
              <div>
                 <h2 className="fw-bold mb-0 text-adaptive-head">Nutrition Command</h2>
                 <small className="text-adaptive-sub fw-bold text-uppercase ls-1">Track & Analyze</small>
              </div>
           </div>
           
           <div className="d-flex align-items-center p-2 rounded-pill shadow-sm border hover-lift" style={{background: 'var(--bs-body-bg)', borderColor: 'var(--bs-border-color)'}}>
              <Button variant="link" className="text-muted p-0 me-2" onClick={() => handleDateChange(-1)}><FaChevronLeft/></Button>
              <Form.Control 
                 type="date" 
                 value={selectedDate} 
                 onChange={(e) => setSelectedDate(e.target.value)} 
                 className="border-0 bg-transparent fw-bold text-center p-0 m-0 shadow-none text-adaptive-head"
                 style={{width: '130px'}}
              />
              <Button variant="link" className="text-muted p-0 ms-2" onClick={() => handleDateChange(1)}><FaChevronRight/></Button>
           </div>
        </div>

        <Row className="g-4">
           {/* ======================= 
               2. LEFT COLUMN: STATS 
              ======================= */}
           <Col lg={4} xl={3} className="fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="content-panel h-100 d-flex flex-column p-4">
                 
                 {/* CALORIE CIRCLE */}
                 <div className="text-center mb-4">
                    <div className="calorie-circle hover-scale">
                        {/* Dynamic rotation based on date's data */}
                        <div className="calorie-circle-inner" style={{transform: `rotate(${45 + (progressPercent * 3.6)}deg)`}}></div>
                        <h1 className="display-4 fw-bold mb-0 text-adaptive-head">{remainingCalories}</h1>
                        <small className="text-muted text-uppercase fw-bold">Left</small>
                    </div>
                    <div className="mt-3">
                        <Badge bg="light" text="dark" className="border me-2">Goal: {Math.round(calorieGoal)}</Badge>
                        <Badge bg="success" className="bg-opacity-75">Ate: {Math.round(totalStats.calories)}</Badge>
                    </div>
                 </div>

                 <hr className="opacity-10 my-4" style={{borderColor: 'inherit'}} />

                 {/* MACRO RINGS */}
                 <Row className="text-center g-2">
                     <Col>
                        <MacroRing value={totalStats.protein} max={150} color="#0d6efd" label="Protein" icon={<FaDumbbell fontSize={10}/>} />
                     </Col>
                     <Col>
                        <MacroRing value={totalStats.carbs} max={250} color="#198754" label="Carbs" icon={<FaLeaf fontSize={10}/>} />
                     </Col>
                     <Col>
                        <MacroRing value={totalStats.fat} max={70} color="#ffc107" label="Fats" icon={<FaFire fontSize={10}/>} />
                     </Col>
                 </Row>
              </div>
           </Col>

           {/* ======================= 
               3. RIGHT COLUMN: ACTIONS 
              ======================= */}
           <Col lg={8} xl={9} className="fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="content-panel p-4 h-100">
                 
                 {/* TABS: SEARCH vs RECENT */}
                 <div className="d-flex justify-content-center mb-4">
                    <Nav variant="pills" className="bg-light p-1 rounded-pill border" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                        <Nav.Item>
                            <Nav.Link eventKey="search" className="px-4"><FaSearch className="me-2"/>Search Database</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="recent" className="px-4"><FaHistory className="me-2"/>Recent (This Date)</Nav.Link>
                        </Nav.Item>
                    </Nav>
                 </div>

                 {/* TAB CONTENT: SEARCH */}
                 {activeTab === 'search' && (
                     <div className="mb-4 fade-in">
                        <Form onSubmit={searchFoodHandler}>
                          <InputGroup className="shadow-sm hover-lift">
                             <InputGroup.Text className="bg-white border-end-0 ps-3"><FaSearch className="text-muted"/></InputGroup.Text>
                             <Form.Control 
                                placeholder="Type food name (e.g. 2 eggs, Biryani, Apple...)" 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="border-start-0 py-3"
                             />
                             <Button type="submit" variant="primary" className="px-4 fw-bold rounded-end-pill btn-glow">Find Food</Button>
                          </InputGroup>
                        </Form>
                     </div>
                 )}

                 {/* RESULTS GRID */}
                 <div className="overflow-auto mb-5" style={{maxHeight: "400px"}}>
                    {activeTab === 'search' && foodData ? (
                        <Row xs={1} md={2} lg={3} className="g-3">
                          {foodData.map((item, idx) => (
                             <FoodCard key={idx} item={item} onAdd={addToLogHandler} updating={updatingLog} type="search" index={idx} />
                          ))}
                        </Row>
                    ) : activeTab === 'recent' ? (
                        <Row xs={1} md={2} lg={3} className="g-3">
                           {recentFoods.length > 0 ? recentFoods.map((item, idx) => (
                               <FoodCard key={idx} item={item} onAdd={addToLogHandler} updating={updatingLog} type="recent" index={idx} />
                           )) : (
                               <div className="text-center w-100 py-5 text-muted fade-in">
                                   <FaUtensils size={30} className="mb-3 opacity-25"/>
                                   <p>No food logged for this date yet.</p>
                                   <Button variant="outline-primary" size="sm" onClick={() => setActiveTab("search")}>Search Food</Button>
                               </div>
                           )}
                        </Row>
                    ) : (
                        // EMPTY STATE FOR SEARCH
                        activeTab === 'search' && (
                            <div className="text-center py-5 mt-3 fade-in">
                               <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-3" style={{width: 80, height: 80}}>
                                  <FaSearch className="text-muted opacity-50" size={30} />
                               </div>
                               <h4 className="text-adaptive-head fw-bold">What's cooking?</h4>
                               <p className="text-adaptive-sub mb-0">Search for local or international foods to start logging.</p>
                            </div>
                        )
                    )}
                 </div>

                 <hr className="my-4 opacity-10" style={{borderColor: 'inherit'}}/>

                 {/* TODAY'S LOG LIST - RESETS ON DATE CHANGE */}
                 <h5 className="fw-bold text-adaptive-head mb-3 fade-in">Entries for {selectedDate}</h5>
                 
                 {loadingLogs ? <Loader /> : currentFoodItems.length === 0 ? (
                     <Alert variant="light" className="text-center border-0 shadow-sm text-muted fade-in-up">
                        No food logged for this date.
                     </Alert>
                 ) : (
                     <div className="overflow-auto" style={{maxHeight: "300px"}}>
                         {currentFoodItems.map((item, idx) => {
                             let Icon = FaUtensils;
                             if(item.servingSize?.includes("Breakfast")) Icon = FaCoffee;
                             if(item.servingSize?.includes("Dinner")) Icon = FaWineGlass;
                             if(item.servingSize?.includes("Snack")) Icon = FaAppleAlt;

                             return (
                                 <div key={idx} className="log-item shadow-sm fade-in-up" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="d-flex align-items-center">
                                         <div className="p-3 bg-light rounded-3 me-3 text-primary">
                                             <Icon />
                                         </div>
                                         <div>
                                             <h6 className="fw-bold mb-0 text-adaptive-head text-capitalize">{item.name}</h6>
                                             <small className="text-muted">{item.servingSize}</small>
                                         </div>
                                     </div>
                                     
                                     <div className="d-flex align-items-center gap-3">
                                         <div className="text-end d-none d-md-block">
                                             <div className="fw-bold text-success">{Math.round(item.calories)} kcal</div>
                                             <small className="text-muted" style={{fontSize: '0.7rem'}}>
                                                 P:{item.protein} C:{item.carbs} F:{item.fat}
                                             </small>
                                         </div>
                                         <Button 
                                             variant="light" 
                                             className="text-danger border-0 bg-transparent p-2 rounded-circle hover-bg-danger"
                                             onClick={() => handleDelete(item._id || item.id)}
                                             disabled={deletingLog}
                                         >
                                             <FaTrashAlt />
                                         </Button>
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                 )}

              </div>
           </Col>
        </Row>
      </Container>
      {/* Footer Removed */}
    </div>
  );
};

export default NutritionChecker;
