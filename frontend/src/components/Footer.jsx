import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer-section mt-auto">
      
      {/* --- FOOTER STYLES --- */}
      <style>
        {`
          .footer-section {
            background-color: #ffffff;
            border-top: 1px solid #e9ecef;
            padding: 30px 0;
            transition: 0.3s ease;
          }
          
          .brand-text { color: #212529; font-weight: 700; letter-spacing: 1px; }
          .copyright-text { color: #6c757d; font-size: 0.85rem; }
          
          /* Social Icons */
          .social-icon {
            color: #6c757d;
            font-size: 1.2rem;
            margin-left: 15px;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .social-icon:hover {
            color: #0d6efd; /* Blue on hover */
            transform: translateY(-3px);
          }

          /* --- DARK MODE OVERRIDES --- */
          body.dark-mode .footer-section {
            background-color: #0f172a; /* Match Page Background */
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }
          body.dark-mode .brand-text { color: #f8fafc; }
          body.dark-mode .copyright-text { color: #94a3b8; }
          body.dark-mode .social-icon { color: #94a3b8; }
          body.dark-mode .social-icon:hover { color: #ffffff; }
        `}
      </style>

      <Container>
        <Row className="align-items-center">
          
          {/* Left: Brand & Copyright */}
          <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
            <h5 className="brand-text mb-1">SHAPE UP</h5>
            <small className="copyright-text">
              &copy; {new Date().getFullYear()} Shape Up · A student project by Atta Muhammad.
            </small>
          </Col>

          {/* Right: Social Icons */}
          <Col md={6} className="text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end">
              <a href="https://www.linkedin.com/in/atta-muhammad-729b0b315/" target="_blank" rel="noopener noreferrer" className="me-3">LinkedIn</a><a href="https://github.com/AttaMuhammad-dev/shape-up-mern" target="_blank" rel="noopener noreferrer">Source code</a>
            </div>
          </Col>

        </Row>
      </Container>
    </footer>
  );
};

export default Footer;