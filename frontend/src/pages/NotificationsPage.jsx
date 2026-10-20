import {localDay} from '../utils/reminders';
import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Form, Button, Badge, Modal, Tab, Nav } from "react-bootstrap";
import { toast } from "react-toastify";
import { useGetRemindersQuery, useCreateReminderMutation, useDeleteReminderMutation } from "../slices/reminderSlice";
import Loader from "../components/Loader";
import { 
  FaBell, FaTrashAlt, FaRunning, FaUtensils, FaTint, 
  FaPlusCircle, FaVolumeUp, FaCalendarAlt,
  FaCheckCircle, FaPlay, FaStop, FaMusic
} from "react-icons/fa";

// ==========================================
// 1. DATA & CONSTANTS (UPDATED WORKING URLs)
// ==========================================
const SOUND_LIBRARY = [
  // These URLs are more reliable for demo purposes
  { id: 'classic', name: 'Classic Alarm', url: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3' },
  { id: 'digital', name: 'Digital Beep', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { id: 'nature', name: 'Morning Birds', url: 'https://assets.mixkit.co/active_storage/sfx/139/139-preview.mp3' }, // Fixed URL
  { id: 'scifi', name: 'Sci-Fi Alert', url: 'https://assets.mixkit.co/active_storage/sfx/1002/1002-preview.mp3' }, // Fixed URL
  { id: 'gentle', name: 'Gentle Chime', url: 'https://assets.mixkit.co/active_storage/sfx/1020/1020-preview.mp3' }  // Fixed URL
];

const CATEGORIES = [
  { id: 'General', label: 'General', icon: <FaBell/>, color: '#0d6efd' },
  { id: 'Workout', label: 'Workout', icon: <FaRunning/>, color: '#6610f2' },
  { id: 'Meal', label: 'Meal Prep', icon: <FaUtensils/>, color: '#ffc107' },
  { id: 'Water', label: 'Hydration', icon: <FaTint/>, color: '#0dcaf0' }
];

// ==========================================
// 2. SUB-COMPONENTS (ANIMATED)
// ==========================================

const StatCard = ({ icon, value, label, color, delay }) => (
    <div className="stat-card fade-in-up hover-lift" style={{animationDelay: delay}}>
        <div className="stat-icon" style={{color: color, background: `${color}20`}}>{icon}</div>
        <div>
            <h4 className="fw-bold mb-0 text-adaptive-head">{value}</h4>
            <small className="text-adaptive-sub fw-bold">{label}</small>
        </div>
    </div>
);

const SoundCard = ({ sound, isPlaying, onPlay, onStop }) => (
    <div 
        className={`sound-card ${isPlaying ? 'playing pulse-border' : ''} hover-scale`} 
        onClick={() => isPlaying ? onStop() : onPlay(sound)}
    >
        <div className="d-flex align-items-center">
            <div className={`p-3 rounded-circle me-3 transition-bg ${isPlaying ? 'bg-danger text-white' : 'bg-light text-muted'}`}>
                {isPlaying ? <FaStop/> : <FaPlay/>}
            </div>
            <div>
                <h6 className="mb-0 fw-bold">{sound.name}</h6>
                <small className="text-muted">{isPlaying ? "Playing..." : "Tap to preview"}</small>
            </div>
        </div>
        {isPlaying && (
            <div className="equalizer">
                <span></span><span></span><span></span><span></span>
            </div>
        )}
    </div>
);

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
const NotificationsPage = () => {
  // --- STATE ---
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState(localDay()); 
  const [type, setType] = useState("General");
  const [priority, setPriority] = useState("Normal");
  
  // Audio State
  const [audioInstance, setAudioInstance] = useState(null); // Store the Audio object
  const [playingSoundId, setPlayingSoundId] = useState(null);
  const [showSoundModal, setShowSoundModal] = useState(false);

  // API Hooks
  const { data: reminders, isLoading } = useGetRemindersQuery();
  const [createReminder, { isLoading: isCreating }] = useCreateReminderMutation();
  const [deleteReminder] = useDeleteReminderMutation();

  // --- DERIVED DATA ---
  const stats = useMemo(() => {
      if (!reminders) return { total: 0, high: 0, today: 0, workout: 0 };
      const todayStr = localDay();
      return {
          total: reminders.length,
          workout: reminders.filter(r => r.type === 'Workout').length,
          today: reminders.filter(r => r.date === todayStr || !r.date).length 
      };
  }, [reminders]);

  const groupedReminders = useMemo(() => {
      if (!reminders) return {};
      const todayStr = localDay();
      
      return {
          today: reminders.filter(r => r.date === todayStr || !r.date).sort((a,b) => a.time.localeCompare(b.time)),
          upcoming: reminders.filter(r => r.date && r.date > todayStr).sort((a,b) => new Date(a.date) - new Date(b.date)),
      };
  }, [reminders]);

  // --- HANDLERS ---
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!title || !time) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      await createReminder({ title, time, date, type, priority }).unwrap();
      toast.success("Reminder Scheduled!");
      setTitle("");
      setTime("");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Dismiss this alert?")) {
        try {
            await deleteReminder(id).unwrap();
            toast.success("Dismissed");
        } catch (err) { toast.error("Failed to delete"); }
    }
  };
  
  // --- SOUND LOGIC (FIXED) ---
  const playSound = (sound) => {
      // Stop currently playing sound if any
      if (audioInstance) {
          audioInstance.pause();
          audioInstance.currentTime = 0;
      }

      const newAudio = new Audio(sound.url);
      newAudio.volume = 1.0;
      
      newAudio.play().then(() => {
          setPlayingSoundId(sound.id);
      }).catch(e => {
          console.error("Audio Play Error:", e);
          toast.error("Could not play sound. Check internet connection.");
      });

      // Cleanup when sound ends
      newAudio.onended = () => {
          setPlayingSoundId(null);
          setAudioInstance(null);
      };
      
      setAudioInstance(newAudio);
  };

  const stopSound = () => {
      if (audioInstance) {
          audioInstance.pause();
          audioInstance.currentTime = 0;
      }
      setPlayingSoundId(null);
      setAudioInstance(null);
  };

  // Cleanup audio on component unmount or modal close
  useEffect(() => {
      return () => {
          if (audioInstance) {
              audioInstance.pause();
              setAudioInstance(null);
          }
      };
  }, [audioInstance]);

  const testSystemAlarm = () => {
      stopSound(); // Stop any library sound
      const sound = SOUND_LIBRARY[0]; // Default alarm
      const audio = new Audio(sound.url);
      
      // Loop 3 times logic
      let count = 0;
      const playLoop = () => {
          if(count < 3) {
              count++;
              audio.currentTime = 0;
              audio.play().catch(e => console.error(e));
          }
      };
      audio.addEventListener('ended', playLoop);
      
      // Initial play
      audio.play().catch(e => {
          console.error(e);
          toast.error("Failed to play test sound");
      });
      
      setAudioInstance(audio);
      toast.info("🚨 Testing System Alarm (3x Loop)...");
  };

  return (
    <div className="page-wrapper position-relative overflow-hidden">
      
      {/* --- STYLES (SCOPED & ANIMATED) --- */}
      <style>
        {`
          /* GLOBAL THEME */
          .page-wrapper { min-height: 100vh; background-color: #ffffff; color: #212529; font-family: 'Inter', sans-serif; overflow-x: hidden; }
          body.dark-mode .page-wrapper { background-color: #0f172a; color: #fff; }

          /* PANELS */
          .content-panel {
            background: #ffffff; border: 1px solid #e9ecef; border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; position: relative; z-index: 2;
            transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          body.dark-mode .content-panel {
            background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px); box-shadow: 0 15px 35px rgba(0,0,0,0.3);
          }

          /* REMINDER CARDS */
          .reminder-card {
              background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 16px;
              transition: all 0.3s ease; display: flex; align-items: center; padding: 18px; margin-bottom: 12px;
          }
          .reminder-card:hover { transform: translateX(8px); background: #f1f3f5; border-color: #0d6efd; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
          body.dark-mode .reminder-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); }
          body.dark-mode .reminder-card:hover { background: rgba(255, 255, 255, 0.08); border-color: #38bdf8; }

          /* SOUND CARDS */
          .sound-card {
              cursor: pointer; padding: 15px; border-radius: 12px; border: 1px solid #eee; margin-bottom: 10px;
              transition: all 0.2s ease; position: relative; overflow: hidden;
          }
          .sound-card:hover { background: #f8f9fa; transform: scale(1.02); }
          .sound-card.playing { border-color: #dc3545; background: #fff5f5; }
          .pulse-border { animation: pulseBorder 1.5s infinite; }
          
          @keyframes pulseBorder { 0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); } 100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); } }

          /* EQUALIZER ANIMATION */
          .equalizer { display: flex; gap: 3px; position: absolute; right: 20px; top: 50%; transform: translateY(-50%); }
          .equalizer span { width: 4px; background: #dc3545; animation: eq 0.8s infinite ease-in-out; border-radius: 2px; }
          .equalizer span:nth-child(1) { height: 10px; animation-delay: 0.1s; }
          .equalizer span:nth-child(2) { height: 20px; animation-delay: 0.2s; }
          .equalizer span:nth-child(3) { height: 15px; animation-delay: 0.3s; }
          .equalizer span:nth-child(4) { height: 25px; animation-delay: 0.4s; }
          @keyframes eq { 0%, 100% { height: 8px; } 50% { height: 24px; } }

          /* STAT CARDS */
          .stat-card {
              background: #fff; padding: 20px; border-radius: 20px; border: 1px solid #eee;
              display: flex; align-items: center; gap: 15px; box-shadow: 0 10px 20px rgba(0,0,0,0.02);
          }
          body.dark-mode .stat-card { background: #1e293b; border-color: rgba(255,255,255,0.05); }
          .stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; transition: 0.3s; }
          .stat-card:hover .stat-icon { transform: rotate(10deg) scale(1.1); }

          /* TEXT COLORS */
          .text-adaptive-head { color: #212529; }
          body.dark-mode .text-adaptive-head { color: #fff !important; }
          .text-adaptive-sub { color: #6c757d; }
          body.dark-mode .text-adaptive-sub { color: #94a3b8 !important; }

          /* FORM CONTROLS */
          .form-control, .form-select { background-color: #fff; border: 1px solid #ced4da; color: #212529; border-radius: 12px; padding: 12px; transition: 0.3s; }
          .form-control:focus, .form-select:focus { box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1); border-color: #0d6efd; transform: translateY(-2px); }
          body.dark-mode .form-control, body.dark-mode .form-select { background-color: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.15); color: #fff !important; }
          body.dark-mode input[type="date"], body.dark-mode input[type="time"] { color-scheme: dark; }

          .gradient-heading { background: linear-gradient(90deg, #212529, #495057); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          body.dark-mode .gradient-heading { background: linear-gradient(135deg, #fff 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

          /* ANIMATIONS */
          .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
          .fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
          .slide-in-right { animation: slideInRight 0.6s ease-out forwards; opacity: 0; }
          
          .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
          .hover-scale { transition: transform 0.2s; }
          .hover-scale:hover { transform: scale(1.05); }
          
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        `}
      </style>

      <Container className="py-5 position-relative" style={{zIndex: 2}}>
        
        {/* --- HEADER --- */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 fade-in">
           <div>
              <h2 className="fw-bold display-5 mb-0 gradient-heading">
                  Command Center
              </h2>
              <p className="text-adaptive-sub mb-0 fw-bold small text-uppercase ls-1">Manage Your Schedule & Alerts</p>
           </div>
           
           <div className="d-flex gap-3 mt-3 mt-md-0">
              <Button variant="outline-secondary" className="rounded-pill hover-scale" onClick={() => setShowSoundModal(true)}>
                  <FaMusic className="me-2"/> Library
              </Button>
              <Button 
                variant="danger" 
                onClick={testSystemAlarm} 
                className="d-flex align-items-center fw-bold px-4 py-2 rounded-pill shadow-sm border-2 hover-scale"
              >
                 <FaVolumeUp className="me-2"/> Test System
              </Button>
           </div>
        </div>

        {/* --- STATS ROW --- */}
        <Row className="g-4 mb-5">
            <Col md={4}>
                <StatCard icon={<FaBell/>} value={stats.total} label="Active Alerts" color="#0d6efd" delay="0.1s"/>
            </Col>
            <Col md={4}>
                <StatCard icon={<FaCalendarAlt/>} value={stats.today} label="Today's Tasks" color="#198754" delay="0.2s"/>
            </Col>
            <Col md={4}>
                <StatCard icon={<FaRunning/>} value={stats.workout} label="Workouts Pending" color="#6610f2" delay="0.3s"/>
            </Col>
        </Row>

        <Row className="g-5">
           
           {/* --- LEFT: CREATE FORM --- */}
           <Col lg={5} className="fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="content-panel p-4 h-100 hover-lift">
                 <div className="d-flex align-items-center mb-4">
                    <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary me-3 hover-scale">
                       <FaPlusCircle size={20} />
                    </div>
                    <div>
                        <h5 className="fw-bold mb-0 text-adaptive-head">Create Alert</h5>
                        <small className="text-muted">Set a new reminder</small>
                    </div>
                 </div>

                 <Form onSubmit={submitHandler}>
                    <Form.Group className="mb-3">
                       <Form.Label className="text-adaptive-sub small fw-bold">TITLE</Form.Label>
                       <Form.Control 
                          type="text" 
                          placeholder="e.g. Gym Session, Meal Prep" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                       />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                               <Form.Label className="text-adaptive-sub small fw-bold">DATE</Form.Label>
                               <Form.Control 
                                  type="date" 
                                  value={date}
                                  onChange={(e) => setDate(e.target.value)}
                                  required
                               />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                               <Form.Label className="text-adaptive-sub small fw-bold">TIME</Form.Label>
                               <Form.Control 
                                  type="time" 
                                  value={time}
                                  onChange={(e) => setTime(e.target.value)}
                                  required
                               />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-4">
                       <Form.Label className="text-adaptive-sub small fw-bold">CATEGORY</Form.Label>
                       <div className="d-grid gap-2 d-md-flex">
                           {CATEGORIES.map(cat => (
                               <Button 
                                key={cat.id} 
                                variant={type === cat.id ? 'primary' : 'light'}
                                className={`flex-grow-1 border hover-scale ${type === cat.id ? '' : 'text-muted'}`}
                                onClick={() => setType(cat.id)}
                                size="sm"
                               >
                                   <span className="me-1">{cat.icon}</span> {cat.label}
                               </Button>
                           ))}
                       </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                       <Form.Label className="text-adaptive-sub small fw-bold">PRIORITY</Form.Label>
                       <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                          <option value="Normal">Normal</option>
                          <option value="High">High Priority (Persistent Alert)</option>
                       </Form.Select>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100 rounded-pill py-3 fw-bold shadow-lg hover-scale" disabled={isCreating}>
                       {isCreating ? "Scheduling..." : "Set Reminder"}
                    </Button>
                 </Form>
              </div>
           </Col>

           {/* --- RIGHT: TIMELINE --- */}
           <Col lg={7} className="fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="h-100">
                 
                 <Tab.Container defaultActiveKey="today">
                     <div className="d-flex justify-content-between align-items-center mb-4">
                         <h5 className="mb-0 text-adaptive-sub fw-bold small text-uppercase ls-1">Timeline</h5>
                         <Nav variant="pills" className="bg-light p-1 rounded-pill border">
                             <Nav.Item><Nav.Link eventKey="today" className="px-3 py-1 small fw-bold">Today</Nav.Link></Nav.Item>
                             <Nav.Item><Nav.Link eventKey="upcoming" className="px-3 py-1 small fw-bold">Upcoming</Nav.Link></Nav.Item>
                         </Nav>
                     </div>

                     <Tab.Content>
                         {/* TODAY TAB */}
                         <Tab.Pane eventKey="today">
                             {isLoading ? <Loader /> : groupedReminders.today?.length === 0 ? (
                                <EmptyState />
                             ) : (
                                <div style={{maxHeight: "600px", overflowY: "auto", paddingRight: "5px"}}>
                                    {groupedReminders.today.map((rem, idx) => (
                                        <div key={rem._id} className="slide-in-right" style={{animationDelay: `${idx * 0.1}s`}}>
                                            <ReminderItem rem={rem} onDelete={handleDelete} />
                                        </div>
                                    ))}
                                </div>
                             )}
                         </Tab.Pane>

                         {/* UPCOMING TAB */}
                         <Tab.Pane eventKey="upcoming">
                             {groupedReminders.upcoming?.length === 0 ? (
                                <EmptyState text="No upcoming reminders scheduled." />
                             ) : (
                                <div style={{maxHeight: "600px", overflowY: "auto", paddingRight: "5px"}}>
                                    {groupedReminders.upcoming.map((rem, idx) => (
                                        <div key={rem._id} className="slide-in-right" style={{animationDelay: `${idx * 0.1}s`}}>
                                            <ReminderItem rem={rem} onDelete={handleDelete} showDate={true} />
                                        </div>
                                    ))}
                                </div>
                             )}
                         </Tab.Pane>
                     </Tab.Content>
                 </Tab.Container>

              </div>
           </Col>
        </Row>

        {/* --- SOUND LIBRARY MODAL --- */}
        <Modal 
            show={showSoundModal} 
            onHide={() => { stopSound(); setShowSoundModal(false); }} 
            centered
            backdrop="static" // Prevent accidental closing
        >
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold">Alert Sounds</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted small mb-3">Click to preview sounds. These sounds are used for system alerts.</p>
                <div className="d-grid gap-2">
                    {SOUND_LIBRARY.map(sound => (
                        <SoundCard 
                            key={sound.id} 
                            sound={sound} 
                            isPlaying={playingSoundId === sound.id}
                            onPlay={playSound}
                            onStop={stopSound}
                        />
                    ))}
                </div>
            </Modal.Body>
        </Modal>

      </Container>
    </div>
  );
};

// --- HELPER COMPONENTS (Now inside same file for ease) ---

const EmptyState = ({ text = "You're all caught up for today!" }) => (
    <div className="content-panel p-5 text-center fade-in-up">
        <div className="mb-3 d-inline-block p-4 rounded-circle bg-light hover-scale">
            <FaCheckCircle size={40} className="text-success opacity-50" />
        </div>
        <h6 className="text-adaptive-head fw-bold">All Clear</h6>
        <p className="small text-adaptive-sub mb-0">{text}</p>
        <p className="small text-muted mt-2">Use the form to add a new task.</p>
    </div>
);

const ReminderItem = ({ rem, onDelete, showDate = false }) => {
    const cat = CATEGORIES.find(c => c.id === rem.type) || CATEGORIES[0];
    
    return (
        <div className="reminder-card shadow-sm">
            {/* Icon Box */}
            <div className="p-3 rounded-4 me-3 d-flex align-items-center justify-content-center hover-scale" 
                style={{ width: "60px", height: "60px", background: `${cat.color}20`, color: cat.color, fontSize: "1.5rem" }}>
                {cat.icon}
            </div>
            
            {/* Content */}
            <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5 className="fw-bold mb-0 text-adaptive-head d-flex align-items-center">
                        {rem.time}
                        {showDate && <small className="text-muted ms-2 fs-6 fw-normal"><FaCalendarAlt className="me-1"/>{new Date(rem.date).toLocaleDateString()}</small>}
                    </h5>
                    {rem.priority === 'High' && (
                        <Badge bg="danger" className="ms-2 pulse-border" style={{fontSize: '0.6rem'}}>HIGH PRIORITY</Badge>
                    )}
                </div>
                <div className="d-flex align-items-center">
                    <Badge bg="transparent" className="border border-opacity-50 me-2 p-0 text-uppercase fw-bold" style={{color: cat.color, fontSize: '0.7rem'}}>
                        {rem.type}
                    </Badge>
                    <span className="text-adaptive-sub small text-capitalize fw-bold">• {rem.title}</span>
                </div>
            </div>

            {/* Action */}
            <Button 
                variant="link" 
                className="text-danger ms-2 opacity-50 hover-opacity-100 p-2 hover-scale" 
                onClick={() => onDelete(rem._id)}
            >
                <FaTrashAlt />
            </Button>
        </div>
    );
};

export default NotificationsPage;
