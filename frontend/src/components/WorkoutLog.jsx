import {useSelector} from 'react-redux';
import {localDay} from '../utils/reminders';
import React, { useState, useEffect } from "react";
import { Card, Form, Button, Table, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useCreateWorkoutMutation, useGetWorkoutByDateQuery } from "../slices/workoutsApiSlice";
import { FaCalendarAlt, FaDumbbell, FaClipboardList } from "react-icons/fa";

const WorkoutLog = ({ selectedExercise }) => {
  const {userInfo}=useSelector(s=>s.auth);
  const [date, setDate] = useState(localDay());
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const [createWorkout, { isLoading }] = useCreateWorkoutMutation();
  const { data: workoutData, refetch } = useGetWorkoutByDateQuery(date,{skip:!userInfo});

  // Auto-fill when exercise is selected
  useEffect(() => {
    if (selectedExercise) {
        setExerciseName(selectedExercise.name);
    }
  }, [selectedExercise]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!userInfo)return toast.info("Please sign in to save a workout.");
    if (!exerciseName || !sets || !reps) {
        toast.error("Please fill in all fields");
        return;
    }

    try {
        await createWorkout({
            date,
            exercises: [{
                name: exerciseName,
                sets: Number(sets),
                reps: Number(reps),
                weight: Number(weight) || 0
            }]
        }).unwrap();

        toast.success("Exercise Added!");
        setExerciseName("");
        setSets("");
        setReps("");
        setWeight("");
        refetch(); 
    } catch (err) {
        toast.error(err?.data?.message || "Failed to add workout");
    }
  };

  return (
    <>
      <style>
        {`
            /* --- WORKOUT LOG DARK MODE FIXES --- */
            .workout-log-card { transition: all 0.3s ease; }
            
            /* DARK MODE: Main Card */
            body.dark-mode .workout-log-card {
                background-color: #1e293b; /* Dark Slate */
                border: 1px solid rgba(255,255,255,0.1);
            }
            body.dark-mode .workout-log-card .card-header {
                background-color: #0f172a; /* Darker header */
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            /* DARK MODE: Table */
            body.dark-mode .table {
                color: #e2e8f0;
                border-color: rgba(255,255,255,0.1);
            }
            
            /* CRITICAL FIX: Table Header Background */
            body.dark-mode .custom-thead th {
                background-color: #0f172a !important; /* Dark Blue bg */
                color: #fff !important; /* White Text */
                border-bottom: 2px solid rgba(255,255,255,0.2);
            }
            
            /* DARK MODE: Table Rows */
            body.dark-mode .table-striped > tbody > tr:nth-of-type(odd) > * {
                background-color: rgba(255,255,255,0.05);
                color: #e2e8f0;
            }
            body.dark-mode .table-hover > tbody > tr:hover > * {
                background-color: rgba(255,255,255,0.1);
                color: #fff;
            }
            
            /* DARK MODE: Form Container */
            body.dark-mode .workout-form-container {
                background-color: rgba(255,255,255,0.05) !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
            }
            
            /* DARK MODE: Headings (The "Log for..." text) */
            body.dark-mode h6 {
                color: #fff !important;
            }
        `}
      </style>

      <Card className="shadow-sm border-0 workout-log-card h-100">
        <Card.Header className="bg-primary text-white py-3 d-flex align-items-center">
          <FaClipboardList className="me-2"/>
          <h5 className="mb-0 fw-bold text-white">Daily Workout Log</h5>
        </Card.Header>
        <Card.Body>
          {/* Date Picker */}
          <Form.Group className="mb-4">
              <Form.Label className="fw-bold small text-uppercase text-muted">Select Date</Form.Label>
              <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><FaCalendarAlt className="text-muted"/></span>
                  <Form.Control 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="border-start-0 ps-0"
                  />
              </div>
          </Form.Group>

          {/* Add Form */}
          <Form onSubmit={handleSubmit} className="p-3 bg-light rounded border mb-4 workout-form-container">
              <h6 className="mb-3 fw-bold text-primary"><FaDumbbell className="me-2"/>Log Set</h6>
              
              <Form.Group className="mb-3">
                  <Form.Control 
                      type="text" 
                      placeholder="Exercise Name" 
                      value={exerciseName} 
                      onChange={(e) => setExerciseName(e.target.value)}
                      required
                  />
              </Form.Group>

              <Row className="g-2">
                  <Col xs={4}>
                      <Form.Control type="number" placeholder="Sets" value={sets} onChange={(e) => setSets(e.target.value)} required />
                  </Col>
                  <Col xs={4}>
                      <Form.Control type="number" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} required />
                  </Col>
                  <Col xs={4}>
                      <Form.Control type="number" placeholder="kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </Col>
              </Row>

              <Button type="submit" variant="primary" className="w-100 mt-3 shadow-sm" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Add Entry"}
              </Button>
          </Form>

          {/* Today's List */}
          <h6 className="mt-4 fw-bold mb-3 border-bottom pb-2">Log for {new Date(date).toLocaleDateString()}</h6>
          <div className="table-responsive custom-scrollbar" style={{maxHeight: "350px", overflowY: "auto"}}>
              <Table size="sm" striped hover className="mb-0 align-middle">
                  {/* Removed 'table-light' and used 'custom-thead' */}
                  <thead className="custom-thead bg-light">
                      <tr>
                          <th style={{width: '40%'}}>Exercise</th>
                          <th className="text-center">Sets</th>
                          <th className="text-center">Reps</th>
                          <th className="text-center">Kg</th>
                      </tr>
                  </thead>
                  <tbody>
                      {workoutData && workoutData.exercises && workoutData.exercises.length > 0 ? (
                          workoutData.exercises.map((ex, idx) => (
                              <tr key={idx}>
                                  <td className="fw-semibold">{ex.name}</td>
                                  <td className="text-center">{ex.sets}</td>
                                  <td className="text-center">{ex.reps}</td>
                                  <td className="text-center">{ex.weight}</td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                              <td colSpan="4" className="text-center text-muted py-4">
                                  No exercises logged for this date.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </Table>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default WorkoutLog;