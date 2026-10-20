import React, { useState, useEffect, useRef } from "react";
import { Card, Button, ProgressBar, Spinner } from "react-bootstrap";
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { toast } from "react-toastify";

// 👇 Now accepting 'goal' prop
const StepTracker = ({ currentSteps = 0, goal = 8000, onSave }) => {
  const [steps, setSteps] = useState(currentSteps);
  const [isTracking, setIsTracking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!isTracking) {
        setSteps(currentSteps);
    }
  }, [currentSteps, isTracking]);

  const lastAcc = useRef({ x: 0, y: 0, z: 0 });
  const lastTime = useRef(0);
  const SHAKE_THRESHOLD = 15; 

  useEffect(() => {
    const handleMotion = (event) => {
      if (!isTracking) return;
      const current = event.accelerationIncludingGravity;
      if (!current) return;
      const currentTime = Date.now();
      
      if ((currentTime - lastTime.current) > 100) {
        const deltaX = Math.abs(lastAcc.current.x - current.x);
        const deltaY = Math.abs(lastAcc.current.y - current.y);
        const deltaZ = Math.abs(lastAcc.current.z - current.z);

        if ((deltaX + deltaY + deltaZ) > SHAKE_THRESHOLD) {
          setSteps((prev) => prev + 1);
          lastTime.current = currentTime;
        }
        lastAcc.current = current;
      }
    };

    if (isTracking) window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isTracking]);

  const toggleTracking = async () => {
    if (!isTracking) {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const response = await DeviceMotionEvent.requestPermission();
          if (response !== 'granted') return alert("Permission denied.");
        } catch (error) { console.error(error); }
      }
      setIsTracking(true);
    } else {
      setIsTracking(false);
    }
  };

  const handleSync = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
        await onSave(steps);
        toast.success("Steps Synced to Cloud! ☁️");
    } catch (error) {
        toast.error("Sync Failed");
    }
    setIsSaving(false);
  };

  const resetSteps = () => {
      setSteps(0);
      setIsTracking(false);
  };

  return (
    <Card className="shadow-sm border-0 h-100 text-center">
      <Card.Header className={`text-white ${isTracking ? "bg-success" : "bg-dark"}`}>
        <DirectionsRunIcon className="me-2" /> 
        {isTracking ? "Tracking Active..." : "Step Tracker"}
      </Card.Header>
      
      <Card.Body className="d-flex flex-column justify-content-center">
        <h1 className="display-4 font-weight-bold text-dark mb-0">{steps}</h1>
        {/* 👇 Updated to show Goal */}
        <p className="text-muted small">Target: {goal.toLocaleString()} Steps</p>
        
        {/* 👇 Dynamic Progress Bar */}
        <ProgressBar 
            now={(steps / goal) * 100} 
            variant="info" 
            className="mb-3" 
            style={{height: "8px"}}
        />

        <div className="d-flex gap-2 justify-content-center">
            <Button 
                variant={isTracking ? "danger" : "success"} 
                onClick={toggleTracking}
                className="rounded-pill px-4"
                size="sm"
            >
              {isTracking ? "Stop" : "Start"}
            </Button>
            
            <Button 
                variant="outline-primary" 
                onClick={handleSync} 
                className="rounded-circle"
                disabled={isSaving}
                title="Save to Laptop"
            >
                {isSaving ? <Spinner size="sm"/> : <CloudUploadIcon />}
            </Button>

            <Button variant="outline-secondary" onClick={resetSteps} className="rounded-circle" size="sm">
                <RestartAltIcon />
            </Button>
        </div>
        
        {isTracking && <small className="text-success mt-2 animate-pulse">● Sensor Active</small>}
      </Card.Body>
    </Card>
  );
};

export default StepTracker;