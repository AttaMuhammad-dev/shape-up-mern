import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, InputGroup, Button, Badge, Modal } from "react-bootstrap"; // Added Modal
import Loader from "./Loader";

const MUSCLE_GROUPS = {
  chest: ["chest"],
  back: ["lats", "middle back", "lower back", "traps", "neck"],
  legs: ["quadriceps", "hamstrings", "calves", "glutes", "adductors", "abductors"],
  arms: ["biceps", "triceps", "forearms"],
  shoulders: ["shoulders"],
  abs: ["abdominals"],
  cardio: ["cardio"]
};

const ExerciseDB = ({ onSelectExercise }) => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [allExercises, setAllExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(12);

  // --- NEW STATE FOR MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [modalExercise, setModalExercise] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/exercises.json");
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllExercises(data);
          setFilteredExercises(data);
        }
      } catch (err) {
        console.error("Error loading exercises:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExercises();
  }, []);

  // --- HELPER: HANDLE IMAGE URLs ---
  const getImageUrl = (path) => {
      if (!path) return "https://via.placeholder.com/300x250?text=No+Image";
      if (path.startsWith("http") || path.startsWith("https")) {
          return path;
      }
      return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${path}`;
  };

  const applyFilters = (group, query) => {
    let results = allExercises;
    if (group) {
      const targetMuscles = MUSCLE_GROUPS[group] || [];
      results = results.filter((ex) => {
        const primary = ex.primaryMuscles?.map((m) => m.toLowerCase()) || [];
        return primary.some((m) => targetMuscles.includes(m));
      });
    }
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.target?.toLowerCase().includes(lowerQuery) ||
          item.equipment?.toLowerCase().includes(lowerQuery)
      );
    }
    setFilteredExercises(results);
    setCurrentPage(1);
  };

  const handleGroupChange = (e) => {
    const group = e.target.value;
    setSelectedGroup(group);
    const currentSearch = document.getElementById("search-input")?.value || "";
    applyFilters(group, currentSearch);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    applyFilters(selectedGroup, query);
  };

  // --- NEW HANDLER: OPEN MODAL ---
  const handleCardClick = (exercise) => {
    setModalExercise(exercise);
    setShowModal(true);
  };

  // --- NEW HANDLER: ADD TO LOG FROM MODAL ---
  const handleAddToLog = () => {
    if (onSelectExercise && modalExercise) {
      onSelectExercise(modalExercise);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setShowModal(false); // Close modal after adding
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalExercise(null);
  };

  const indexOfLast = currentPage * exercisesPerPage;
  const indexOfFirst = indexOfLast - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="w-100">
      <div className="mb-4">
        <Row className="g-3">
          <Col md={4}>
            <Form.Select
              value={selectedGroup}
              onChange={handleGroupChange}
              className="shadow-sm border-primary"
              style={{ height: "100%", fontWeight: "500" }}
            >
              <option value="">All Body Parts</option>
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="legs">Legs</option>
              <option value="arms">Arms</option>
              <option value="shoulders">Shoulders</option>
              <option value="abs">Abs / Core</option>
              <option value="cardio">Cardio</option>
            </Form.Select>
          </Col>
          <Col md={8}>
            <InputGroup className="shadow-sm">
              <Form.Control
                id="search-input"
                placeholder="Search exercise..."
                onChange={handleSearchChange}
              />
              <Button variant="primary">Search</Button>
            </InputGroup>
          </Col>
        </Row>
        <div className="mt-2 text-muted small">
          Found {filteredExercises.length} Exercises
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Row xs={1} md={2} lg={3} className="g-4">
            {currentExercises.map((exercise, index) => (
              <Col key={exercise.id || index}>
                <Card
                  className="h-100 shadow-sm border-0 exercise-card-hover"
                  onClick={() => handleCardClick(exercise)} // Updated Click Handler
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      height: "220px",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "#fff",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={getImageUrl(exercise.images?.[0])}
                      alt={exercise.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x250?text=No+Image";
                      }}
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <Card.Body>
                    <Card.Title
                      className="text-capitalize fw-bold mb-1"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {exercise.name}
                    </Card.Title>
                    <div className="mb-2">
                      <Badge bg="secondary" className="me-1" style={{ fontSize: "0.65rem" }}>
                        {exercise.primaryMuscles?.[0]}
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5 gap-2">
              <Button
                size="sm"
                variant="outline-primary"
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
              >
                Prev
              </Button>
              <span className="px-3 d-flex align-items-center fw-bold text-muted">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline-primary"
                disabled={currentPage === totalPages}
                onClick={() => paginate(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* --- EXERCISE INSTRUCTIONS MODAL --- */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        {modalExercise && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="text-capitalize fw-bold">
                {modalExercise.name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                {/* Left Side: Image */}
                <Col md={5} className="mb-3 mb-md-0">
                  <div className="border rounded p-2 bg-light d-flex align-items-center justify-content-center" style={{ minHeight: "250px" }}>
                    <img 
                      src={getImageUrl(modalExercise.images?.[0])} 
                      alt={modalExercise.name}
                      className="img-fluid"
                      style={{ maxHeight: "300px", objectFit: "contain" }}
                    />
                  </div>
                  <div className="mt-3">
                    <h6 className="fw-bold">Details:</h6>
                    <Badge bg="primary" className="me-2 text-capitalize">{modalExercise.category}</Badge>
                    <Badge bg="info" className="me-2 text-capitalize">{modalExercise.level}</Badge>
                    <Badge bg="secondary" className="text-capitalize">{modalExercise.force}</Badge>
                  </div>
                </Col>
                
                {/* Right Side: Instructions */}
                <Col md={7}>
                  <h5 className="fw-bold mb-3">Instructions</h5>
                  {modalExercise.instructions && modalExercise.instructions.length > 0 ? (
                    <ol className="ps-3 text-muted" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                      {modalExercise.instructions.map((step, idx) => (
                        <li key={idx} className="mb-2">{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-muted">No instructions available for this exercise.</p>
                  )}
                  
                  <div className="mt-4">
                    <h6 className="fw-bold">Target Muscles:</h6>
                    <div className="d-flex flex-wrap gap-2">
                        {modalExercise.primaryMuscles?.map(m => (
                            <Badge key={m} bg="success" className="text-capitalize">{m}</Badge>
                        ))}
                        {modalExercise.secondaryMuscles?.map(m => (
                            <Badge key={m} bg="secondary" className="text-capitalize" style={{opacity: 0.8}}>{m}</Badge>
                        ))}
                    </div>
                  </div>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
              <Button variant="primary" onClick={handleAddToLog}>
                Add to Workout Log
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ExerciseDB;