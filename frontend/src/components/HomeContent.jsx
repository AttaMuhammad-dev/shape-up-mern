import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useGetReviewsQuery, useCreateReviewMutation } from "../slices/reviewsApiSlice";
import { toast } from "react-toastify";
import { FaStar, FaQuoteLeft, FaUserCircle } from "react-icons/fa";
import Loader from "./Loader";

const HomeContent = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  // State for the form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // RTK Query hooks
  const { data: reviews, isLoading, refetch } = useGetReviewsQuery();
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!userInfo) {
        toast.error("You must be logged in to post a review!");
        return;
    }
    try {
      await createReview({ rating, comment }).unwrap();
      toast.success("Review Added!");
      setComment("");
      setRating(5);
      refetch(); // Reload reviews immediately
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container className="my-5">
      {/* --- HERO SECTION --- */}
      <Row className="mb-5">
        <Col className="text-center">
          <h1 className="fw-bold display-5">The Tools for Your Goals</h1>
          <p className="lead text-muted">
            Trying to lose weight, tone up, lower your BMI, or invest in your
            overall health? We give you the right features to get there.
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <Card.Title className="fw-bold">Learn. Track. Improve.</Card.Title>
              <Card.Text>Keeping a food diary helps you understand your habits.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <Card.Title className="fw-bold">Logging Simplified.</Card.Title>
              <Card.Text>Save meals and use Quick Tools for fast tracking.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <Card.Title className="fw-bold">Stay Motivated.</Card.Title>
              <Card.Text>Join the World's Largest Fitness Community.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- REVIEWS SECTION --- */}
      <div className="bg-light p-5 rounded-3 mb-5">
        <Row className="mb-4">
          <Col className="text-center">
            <h2 className="fw-bold">Success Stories</h2>
            <p className="text-muted">See what our community has to say</p>
          </Col>
        </Row>

        {isLoading ? (
          <div className="text-center py-5">
              <Loader />
              <p className="text-muted mt-2">Loading reviews...</p>
          </div>
        ) : (
          <Row className="g-4 mb-5">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <Col md={4} key={review._id}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="mb-3 text-warning">
                        {[...Array(review.rating)].map((_, i) => (
                          <FaStar key={i} />
                        ))}
                      </div>
                      <Card.Text className="fst-italic">
                        <FaQuoteLeft className="me-2 text-muted opacity-25" />
                        "{review.comment}"
                      </Card.Text>
                      <Card.Footer className="bg-white border-0 pt-0 d-flex align-items-center">
                        <FaUserCircle className="text-secondary me-2" size={20} />
                        <div>
                            <span className="fw-bold text-primary d-block" style={{lineHeight: '1'}}>{review.name}</span>
                            <small className="text-muted" style={{fontSize: '0.7rem'}}>
                                {new Date(review.createdAt).toLocaleDateString()}
                            </small>
                        </div>
                      </Card.Footer>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col className="text-center">
                <Alert variant="info">No reviews yet. Be the first to share your story!</Alert>
              </Col>
            )}
          </Row>
        )}

        {/* --- ADD REVIEW FORM (FORCED VISIBLE) --- */}
        <Row className="justify-content-center">
            <Col md={8} lg={6}>
                <Card className="shadow-lg border-0" style={{ borderTop: "5px solid #0d6efd" }}>
                    <Card.Body className="p-4">
                        <h4 className="fw-bold mb-3 text-center">Leave a Review</h4>
                        
                        {/* DEBUGGING INFO: THIS WILL TELL US IF YOU ARE LOGGED IN */}
                        <div className="text-center mb-3">
                            {userInfo ? (
                                <span className="badge bg-success">Logged in as: {userInfo.name}</span>
                            ) : (
                                <span className="badge bg-danger">Not Logged In (Form Active for Testing)</span>
                            )}
                        </div>

                        {/* FORM IS NOW ALWAYS VISIBLE FOR TESTING */}
                        <Form onSubmit={submitHandler}>
                            <Form.Group className="mb-3" controlId="rating">
                                <Form.Label>Rating</Form.Label>
                                <Form.Select 
                                    value={rating} 
                                    onChange={(e) => setRating(e.target.value)}
                                >
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="3">3 - Good</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="1">1 - Poor</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="comment">
                                <Form.Label>Comment</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3} 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us about your experience..."
                                    required
                                />
                            </Form.Group>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="w-100"
                                disabled={isCreating}
                            >
                                {isCreating ? "Submitting..." : "Submit Review"}
                            </Button>
                        </Form>

                    </Card.Body>
                </Card>
            </Col>
        </Row>
      </div>

      <Row className="align-items-center mt-5">
        <Col md={6}>
          <h1 className="fw-bold">Start your fitness journey today!</h1>
          <p className="lead">Sign up for Shape Up and get started on your path to a healthier lifestyle.</p>
          <Button variant="success" size="lg" className="me-2" as={Link} to="/pages/register">
            Register Now
          </Button>
          <Button variant="outline-primary" size="lg" as={Link} to="/pages/login">
            Login
          </Button>
        </Col>
        <Col md={6}>
          <img
            src="https://landkit.goodthemes.co/assets/img/illustrations/illustration-2.png"
            alt="Banner"
            className="img-fluid rounded"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default HomeContent;