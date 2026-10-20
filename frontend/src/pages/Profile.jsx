import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Form, Button, Alert, Nav, Badge, Modal, Image, InputGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { useUpdateUserProfileMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { 
  FaUser, FaLock, FaDumbbell, FaRulerVertical, FaWeight, 
  FaVenusMars, FaBirthdayCake, FaCamera, FaSave, FaCheckCircle,
  FaChartLine, FaDownload, FaExclamationTriangle
} from "react-icons/fa";

// ==========================================
// 1. UTILITY: ULTRA-AGGRESSIVE COMPRESSION
// ==========================================
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target.result;
            img.onload = () => {
                const maxWidth = 120; // Small avatar size
                const maxHeight = 120;
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Simple scaling to fit box
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Low quality JPEG (0.5) to keep string short
                const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
                resolve(dataUrl);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

// ==========================================
// 2. HELPER COMPONENTS
// ==========================================
const StatCard = ({ icon, label, value, unit, color }) => (
    <div className="stat-card d-flex align-items-center p-3 rounded-3 border h-100">
        <div className={`icon-box p-3 rounded-circle me-3 text-${color} bg-${color} bg-opacity-10`}>
            {icon}
        </div>
        <div>
            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>{label}</small>
            <h5 className="mb-0 fw-bold">{value} <span className="fs-6 text-muted fw-normal">{unit}</span></h5>
        </div>
    </div>
);

const BMICard = ({ bmi, status, color }) => (
    <div className={`bmi-card p-4 rounded-3 text-white bg-${color} text-center`}>
        <h6 className="mb-1 opacity-75">YOUR BMI SCORE</h6>
        <h1 className="display-4 fw-bold mb-0">{bmi}</h1>
        <Badge bg="light" text={color} className="mt-2 px-3 py-2 text-uppercase fw-bold shadow-sm">
            {status}
        </Badge>
    </div>
);

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [updateProfile, { isLoading }] = useUpdateUserProfileMutation();
  // Assuming useDeleteUserMutation exists, or using a placeholder
  // const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation(); 

  const [activeTab, setActiveTab] = useState("general");
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(""); 
  
  const [currentPassword, setCurrentPassword] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("Male");
  const [goal, setGoal] = useState("Maintain");
  const [activityLevel] = useState("Moderate");

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- POPULATE DATA ---
  useEffect(() => {
    if (userInfo) {
        setName(userInfo.name || "");
        setEmail(userInfo.email || "");
        setAge(userInfo.age || "");
        setHeight(userInfo.height || "");
        setWeight(userInfo.weight || "");
        setGender(userInfo.gender || "Male");
        setGoal(userInfo.goal || "Maintain");
        // Fallback if avatar is missing
        setAvatar(userInfo.image && userInfo.image.length > 20 ? userInfo.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name || 'Demo')}&background=0D8ABC&color=fff`);
    }
  }, [userInfo]);

  const bmiStats = useMemo(() => {
      if (!weight || !height) return { value: 0, status: "Unknown", color: "secondary" };
      const hM = height / 100;
      const val = (weight / (hM * hM)).toFixed(1);
      if (val < 18.5) return { value: val, status: "Underweight", color: "warning" };
      if (val >= 25 && val < 30) return { value: val, status: "Overweight", color: "warning" };
      if (val >= 30) return { value: val, status: "Obese", color: "danger" };
      return { value: val, status: "Normal", color: "success" };
  }, [weight, height]);

  // --- AVATAR HANDLER ---
  const handleAvatarChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
          try {
              const compressedBase64 = await compressImage(file);
              setAvatar(compressedBase64); 
              toast.info("Image prepared! Click 'Save Changes' to upload.");
          } catch (error) {
              toast.error("Could not process image.");
          }
      }
  };

  // --- SUBMIT HANDLER (GENERAL & BODY STATS) ---
  const submitHandler = async (e) => {
    e.preventDefault();

    // Prevent password update here if on security tab (handled separately now for clarity)
    if (activeTab === 'security') return;

    try {
        const payload = {
          _id: userInfo._id,
          name,
          email,
          ...(email!==userInfo.email?{currentPassword}:{}),
          image: avatar,
          ...(age?{age:Number(age)}:{}),
          ...(height?{height:Number(height)}:{}),
          ...(weight?{weight:Number(weight)}:{}),
          gender,
          goal,
        };

        const res = await updateProfile(payload).unwrap();
        
        dispatch(setCredentials({ ...res }));
        toast.success("Profile Info Updated!");
        
    } catch (err) {
        toast.error(err?.data?.message || err.error);
    }
  };

  // --- PASSWORD UPDATE HANDLER (NEW) ---
  const handlePasswordUpdate = async () => {
      // 1. Validation Logic
      if (!currentPassword || !password || !confirmPassword) {
          toast.error("Please fill all password fields.");
          return;
      }
      if (password !== confirmPassword) {
          toast.error("New passwords do not match.");
          return;
      }
      if (password.length < 6) {
          toast.error("Password needs to be at least 6 characters.");
          return;
      }

      try {
          const payload = {
              _id: userInfo._id,
              name, // Backend might require name/email to identify user
              email,
              password,
              currentPassword
          };

          const res = await updateProfile(payload).unwrap();
          dispatch(setCredentials({ ...res }));
          toast.success("Password Updated Successfully!");
          
          // Clear fields
          setCurrentPassword("");
          setPassword("");
          setConfirmPassword("");

      } catch (err) {
          toast.error(err?.data?.message || "Password update failed. Check current password.");
      }
  };

  // --- DELETE ACCOUNT HANDLER ---
  const handleDeleteAccount = () => window.location.assign('/pages/settings?tab=security');

  const handleExportData = async () => {
    try {
      const response=await fetch('/api/users/export');
      if(!response.ok)throw new Error('Export failed');
      const completeData=await response.json();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(completeData,null,2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "shape_up_data.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success("Data exported!");
    }catch{toast.error("Could not export your data. Please try again.");}
  };

  return (
    <div className="page-wrapper position-relative">
      
      {/* --- STYLES --- */}
      <style>
        {`
          .page-wrapper { min-height: 100vh; background-color: #f8f9fa; color: #212529; font-family: 'Inter', sans-serif; padding-bottom: 80px; }
          body.dark-mode .page-wrapper { background-color: #0f172a; color: #fff; }

          .profile-panel { background: #ffffff; border: 1px solid #e9ecef; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); overflow: hidden; height: 100%; }
          body.dark-mode .profile-panel { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); box-shadow: 0 15px 35px rgba(0,0,0,0.3); }

          .avatar-wrapper { position: relative; width: 120px; height: 120px; margin: 0 auto; }
          .avatar-img { width: 100%; height: 100%; object-fit: cover; border: 4px solid #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
          .avatar-upload-btn { position: absolute; bottom: 0; right: 0; background: #0d6efd; color: white; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; border: 2px solid #fff; }
          .avatar-upload-btn:hover { background: #0b5ed7; transform: scale(1.1); }

          .profile-tabs .nav-link { color: #6c757d; font-weight: 600; padding: 15px 20px; border-radius: 12px; border: 1px solid transparent; margin-bottom: 5px; transition: 0.2s; display: flex; align-items: center; }
          .profile-tabs .nav-link:hover { background: #e9ecef; color: #212529; }
          .profile-tabs .nav-link.active { background: #e7f1ff; color: #0d6efd; border-color: #cff4fc; }
          body.dark-mode .profile-tabs .nav-link { color: #94a3b8; }
          body.dark-mode .profile-tabs .nav-link:hover { background: rgba(255,255,255,0.05); color: #fff; }
          body.dark-mode .profile-tabs .nav-link.active { background: rgba(13, 110, 253, 0.2); color: #fff; border-color: rgba(13,110,253,0.3); }

          .form-control, .form-select { background-color: #fff; border: 1px solid #ced4da; color: #212529; padding: 12px; border-radius: 10px; }
          .form-control:focus { box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1); }
          body.dark-mode .form-control, body.dark-mode .form-select { background-color: #1e293b; border: 1px solid rgba(255,255,255,0.15); color: #fff !important; }
          body.dark-mode .form-control::placeholder { color: rgba(255,255,255,0.4); }
          body.dark-mode .form-control:disabled { background-color: #0f172a; color: #64748b; }
          body.dark-mode .input-group-text { background-color: #334155; border: 1px solid rgba(255,255,255,0.15); color: #fff; }

          .text-adaptive-head { color: #212529; }
          body.dark-mode .text-adaptive-head { color: #fff !important; }
          .text-adaptive-sub { color: #6c757d; }
          body.dark-mode .text-adaptive-sub { color: #94a3b8 !important; }

          .stat-card { transition: 0.3s; background: #fff; }
          .stat-card:hover { transform: translateY(-5px); border-color: #0d6efd !important; }
          body.dark-mode .stat-card { background: #1e293b; border-color: rgba(255,255,255,0.1) !important; }

          .fade-in { animation: fadeIn 0.6s ease-out forwards; opacity: 0; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>

      <Container className="py-5" style={{maxWidth: '1200px'}}>
        
        {/* HEADER */}
        <div className="mb-5 fade-in">
           <Row className="align-items-center">
               <Col md={8}>
                   <h1 className="fw-bold display-5 mb-1 text-adaptive-head">Profile Settings</h1>
                   <p className="text-adaptive-sub mb-0">Manage your personal information, security, and fitness metrics.</p>
               </Col>
               <Col md={4} className="text-md-end mt-3 mt-md-0">
                   <Button variant="outline-primary" onClick={handleExportData} className="rounded-pill px-4 fw-bold">
                       <FaDownload className="me-2"/> Export Data
                   </Button>
               </Col>
           </Row>
        </div>

        <Row className="g-4">
            
            {/* LEFT: NAVIGATION & SUMMARY */}
            <Col lg={3} className="fade-in" style={{animationDelay: '0.1s'}}>
               <div className="profile-panel p-4">
                   
                   {/* Avatar */}
                   <div className="text-center mb-4">
                       <div className="avatar-wrapper mb-3">
                           <Image 
                              src={avatar} 
                              roundedCircle 
                              className="avatar-img"
                              alt="Profile"
                           />
                           <label htmlFor="avatar-upload" className="avatar-upload-btn shadow-sm">
                               <FaCamera size={14}/>
                           </label>
                           <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleAvatarChange} />
                       </div>
                       <h5 className="fw-bold mb-0 text-adaptive-head">{name}</h5>
                       <small className="text-muted">{email}</small>
                       <div className="mt-2">
                           <Badge bg={userInfo?.goal === 'Cut' ? 'danger' : 'success'} className="px-3 rounded-pill text-uppercase">
                               {goal}
                           </Badge>
                       </div>
                   </div>

                   <hr className="opacity-10 my-4"/>

                   {/* Navigation */}
                   <Nav className="flex-column profile-tabs nav-pills">
                       <Nav.Link active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
                           <FaUser className="me-3"/> General Info
                       </Nav.Link>
                       <Nav.Link active={activeTab === 'body'} onClick={() => setActiveTab('body')}>
                           <FaDumbbell className="me-3"/> Body Stats
                       </Nav.Link>
                       <Nav.Link active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
                           <FaLock className="me-3"/> Security
                       </Nav.Link>
                       <Nav.Link active={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')} className="text-danger">
                           <FaExclamationTriangle className="me-3"/> Danger Zone
                       </Nav.Link>
                   </Nav>

               </div>
            </Col>

            {/* RIGHT: CONTENT FORM */}
            <Col lg={9} className="fade-in" style={{animationDelay: '0.2s'}}>
                <Form onSubmit={submitHandler}>
                    
                    {/* GENERAL TAB */}
                    {activeTab === 'general' && (
                        <div className="profile-panel p-4 p-md-5">
                            <h4 className="fw-bold mb-4 text-adaptive-head">General Information</h4>
                            
                            <Row className="g-4">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-adaptive-sub small">FULL NAME</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)} 
                                            placeholder="Enter your name"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-adaptive-sub small">EMAIL ADDRESS</Form.Label>
                                        <Form.Control 
                                            type="email" 
                                            value={email} 
                                            disabled 
                                            title="Email cannot be changed"
                                        />
                                        <Form.Text className="text-muted small">Contact support to change email.</Form.Text>
                                    </Form.Group>
                                </Col>
                                
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-adaptive-sub small">AGE</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text><FaBirthdayCake/></InputGroup.Text>
                                            <Form.Control 
                                                type="number" 
                                                value={age} 
                                                onChange={(e) => setAge(e.target.value)}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-adaptive-sub small">GENDER</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text><FaVenusMars/></InputGroup.Text>
                                            <Form.Select value={gender} onChange={(e) => setGender(e.target.value)}>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </Form.Select>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="mt-5 d-flex justify-content-end">
                                <Button type="submit" variant="primary" disabled={isLoading} className="px-5 rounded-pill fw-bold shadow">
                                    {isLoading ? <Loader size="sm" color="white"/> : <><FaSave className="me-2"/> Save Changes</>}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* BODY STATS TAB */}
                    {activeTab === 'body' && (
                        <div className="profile-panel p-4 p-md-5">
                            <h4 className="fw-bold mb-4 text-adaptive-head">Body Metrics & Goals</h4>
                            
                            <Row className="g-4 mb-5">
                                <Col md={4}>
                                    <BMICard bmi={bmiStats.value} status={bmiStats.status} color={bmiStats.color} />
                                </Col>
                                <Col md={8}>
                                    <Row className="g-3 h-100">
                                        <Col xs={6}>
                                            <StatCard icon={<FaWeight/>} label="Current Weight" value={weight || "--"} unit="kg" color="primary"/>
                                        </Col>
                                        <Col xs={6}>
                                            <StatCard icon={<FaRulerVertical/>} label="Height" value={height || "--"} unit="cm" color="info"/>
                                        </Col>
                                        <Col xs={12}>
                                            <div className="p-3 border rounded-3 bg-light h-100 d-flex align-items-center justify-content-between">
                                                <div>
                                                    <small className="fw-bold text-muted text-uppercase">Activity Level</small>
                                                    <h5 className="mb-0 text-dark fw-bold">{activityLevel}</h5>
                                                </div>
                                                <FaChartLine size={24} className="text-muted opacity-50"/>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <hr className="opacity-10 mb-5"/>

                            <Row className="g-4">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-adaptive-sub small">UPDATE WEIGHT (KG)</Form.Label>
                                        <Form.Control 
                                            type="number" step="0.1" 
                                            value={weight} onChange={(e) => setWeight(e.target.value)} 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-adaptive-sub small">UPDATE HEIGHT (CM)</Form.Label>
                                        <Form.Control 
                                            type="number" 
                                            value={height} onChange={(e) => setHeight(e.target.value)} 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-adaptive-sub small">PRIMARY GOAL</Form.Label>
                                        <div className="d-flex gap-2">
                                            {['Cut', 'Maintain', 'Bulk'].map(g => (
                                                <Button 
                                                    key={g}
                                                    variant={goal === g ? 'primary' : 'outline-secondary'}
                                                    className={`flex-grow-1 py-2 fw-bold ${goal === g ? 'shadow-sm' : ''}`}
                                                    onClick={() => setGoal(g)}
                                                >
                                                    {g}
                                                </Button>
                                            ))}
                                        </div>
                                        <Form.Control type="hidden" value={goal} /> 
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="mt-5 d-flex justify-content-end">
                                <Button type="submit" variant="primary" disabled={isLoading} className="px-5 rounded-pill fw-bold shadow">
                                    {isLoading ? <Loader size="sm" color="white"/> : <><FaSave className="me-2"/> Update Stats</>}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB (FIXED VALIDATION) */}
                    {activeTab === 'security' && (
                        <div className="profile-panel p-4 p-md-5">
                            <h4 className="fw-bold mb-4 text-adaptive-head">Security Settings</h4>
                            
                            <Alert variant="info" className="mb-4 border-0 shadow-sm d-flex align-items-center">
                                <FaCheckCircle className="me-3 fs-4"/>
                                <div>
                                    <strong>Secure Verification Required</strong>
                                    <div className="small">You must enter your current password to make changes to your credentials.</div>
                                </div>
                            </Alert>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold text-adaptive-sub small">CURRENT PASSWORD <span className="text-danger">*</span></Form.Label>
                                <Form.Control 
                                    type="password" 
                                    placeholder="Enter current password to authorize"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="bg-light"
                                />
                            </Form.Group>

                            <hr className="opacity-10 my-4"/>

                            <Row className="g-4">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-adaptive-sub small">NEW PASSWORD</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-adaptive-sub small">CONFIRM NEW PASSWORD</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="mt-5 d-flex justify-content-end">
                                <Button 
                                    type="button" 
                                    variant="primary" 
                                    disabled={!currentPassword || !password || !confirmPassword || isLoading} 
                                    className="px-5 rounded-pill fw-bold shadow"
                                    onClick={handlePasswordUpdate}
                                >
                                    {isLoading ? <Loader size="sm" color="white"/> : <><FaLock className="me-2"/> Update Password</>}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* DANGER ZONE (WITH MODAL TRIGGER) */}
                    {activeTab === 'advanced' && (
                        <div className="profile-panel p-4 p-md-5 border-danger">
                            <h4 className="fw-bold mb-4 text-danger">Danger Zone</h4>
                            
                            <div className="p-4 rounded-3 border border-danger bg-danger bg-opacity-10 mb-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="fw-bold text-danger mb-1">Delete Account</h6>
                                        <p className="small text-muted mb-0">Permanently remove your account and related records through the password-protected confirmation in Settings.</p>
                                    </div>
                                    <Button variant="danger" className="fw-bold" onClick={handleDeleteAccount}>
                                        Delete account securely
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 rounded-3 border bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="fw-bold text-dark mb-1">Export Data</h6>
                                        <p className="small text-muted mb-0">Download your profile, logs, meal plans and reminders as JSON.</p>
                                    </div>
                                    <Button variant="outline-dark" className="fw-bold" onClick={handleExportData}>
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                </Form>
            </Col>
        </Row>

        {/* DELETE CONFIRMATION MODAL */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
            <Modal.Header closeButton className="bg-danger text-white">
                <Modal.Title className="fw-bold h5">Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 text-center">
                <FaExclamationTriangle size={50} className="text-warning mb-3"/>
                <h5>Are you absolutely sure?</h5>
                <p className="text-muted">This action will permanently delete your account <strong>{email}</strong> and remove your data from our servers.</p>
            </Modal.Body>
            <Modal.Footer className="justify-content-center border-0 pb-4">
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button variant="danger" className="fw-bold" onClick={handleDeleteAccount}>Continue to secure deletion</Button>
            </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
};

export default Profile;
