import React, { useState, useEffect, useRef } from "react";
import { Card, Button, ProgressBar, Spinner, Form } from "react-bootstrap";
import {FaRunning as DirectionsRunIcon} from 'react-icons/fa';
import {FaCloudUploadAlt as CloudUploadIcon,FaUndo as RestartAltIcon} from 'react-icons/fa';
import { toast } from "react-toastify";

// 👇 Now accepting 'goal' prop
const StepTracker = ({ currentSteps = 0, goal = 8000, onSave }) => {
  const [steps, setSteps] = useState(currentSteps);
  const [isTracking, setIsTracking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    setSteps(currentSteps);
  }, [currentSteps]);

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
      if(typeof DeviceMotionEvent==='undefined'){toast.info('Motion sensing is unavailable here. Enter your steps manually.');return;}
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const response = await DeviceMotionEvent.requestPermission();
          if (response !== 'granted') return alert("Permission denied.");
        } catch {toast.error('Motion access was not granted. You can enter steps manually.');return;}
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
        <Form.Label htmlFor="manual-steps">Steps today</Form.Label>
        <Form.Control id="manual-steps" type="number" min="0" max="200000" step="1" value={steps} disabled={isTracking} onChange={e=>{const value=Number(e.target.value);if(Number.isInteger(value)&&value>=0&&value<=200000)setSteps(value);}} className="mb-2"/>
        <p className="small text-muted">Motion counting is an estimate on supported phones. You can also enter your steps manually.</p>
        
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
                title="Save steps to your account" aria-label="Save steps to your account"
            >
                {isSaving ? <Spinner size="sm"/> : <CloudUploadIcon />}
            </Button>

            <Button variant="outline-secondary" onClick={resetSteps} aria-label="Reset unsaved steps" className="rounded-circle" size="sm">
                <RestartAltIcon />
            </Button>
        </div>
        
        {isTracking && <small className="text-success mt-2 animate-pulse">● Sensor Active</small>}
      </Card.Body>
    </Card>
  );
};

export default StepTracker;
