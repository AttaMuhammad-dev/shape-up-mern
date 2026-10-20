import React from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';

const ExerciseDetailModal = ({ show, handleClose, exercise }) => {
  // If no exercise is selected yet, return null
  if (!exercise) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-capitalize fw-bold">
          {exercise.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex flex-column flex-md-row gap-4 align-items-center align-items-md-start">
          
          {/* Left Side: Image/GIF */}
          <div className="flex-shrink-0 text-center">
            <img 
              src={exercise.gifUrl} 
              alt={exercise.name} 
              className="img-fluid rounded shadow-sm" 
              style={{ maxWidth: "300px", border: "1px solid #eee" }}
            />
            <div className="mt-3">
                <Badge bg="primary" className="me-1 p-2">{exercise.bodyPart}</Badge>
                <Badge bg="secondary" className="p-2">{exercise.target}</Badge>
            </div>
          </div>

          {/* Right Side: Instructions */}
          <div className="flex-grow-1">
            <h5 className="mb-3 border-bottom pb-2">📝 Instructions</h5>
            
            {exercise.instructions && exercise.instructions.length > 0 ? (
              <ol className="ps-3 text-secondary">
                {exercise.instructions.map((step, index) => (
                  <li key={index} className="mb-2" style={{ lineHeight: "1.6" }}>
                    {step}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted">No specific instructions available for this exercise.</p>
            )}

            {/* Equipment Info */}
            {exercise.equipment && (
                <div className="mt-3 p-2 bg-light rounded text-muted small">
                    <strong>💡 Equipment needed:</strong> {exercise.equipment}
                </div>
            )}
          </div>

        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-danger" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExerciseDetailModal;