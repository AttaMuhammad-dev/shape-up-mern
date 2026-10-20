import { useState, useEffect } from "react";
import { Form, Button, Image, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useUpdateUserMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import Loader from "./Loader";

const UpdateProfile = ({ userInfo, dispatch }) => {
  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Image States
  const [image, setImage] = useState(userInfo.image || "");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [UpdateProfile, { isLoading }] = useUpdateUserMutation();

  // --- CLOUDINARY CONFIGURATION (PRE-FILLED) ---
  const CLOUD_NAME = "df1sgdor0"; 
  const UPLOAD_PRESET = "profile_pic"; // <--- Using the preset from your screenshot

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    setImagePreview(URL.createObjectURL(file));
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    setUploading(true);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      
      if (data.secure_url) {
          setImage(data.secure_url);
          toast.success("Image uploaded successfully!");
      } else {
          console.error("Cloudinary Error:", data);
          toast.error("Image upload failed. Check console.");
      }
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error("Error uploading image");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (uploading) {
        toast.warning("Please wait for image to finish uploading");
        return;
    }

    try {
      const res = await UpdateProfile({
        _id: userInfo._id,
        name,
        email,
        password,
        image, // Send the Cloudinary URL to backend
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success("Profile Updated!");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Form onSubmit={submitHandler}>
      {/* Profile Picture Preview */}
      <Form.Group className="my-3 text-center">
         <Row className="justify-content-center">
             <Col xs={6} md={4}>
                <Image 
                    src={imagePreview || image || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                    roundedCircle 
                    thumbnail
                    style={{ width: "150px", height: "150px", objectFit: "cover" }} 
                />
             </Col>
         </Row>
         <Form.Label className="mt-2">Profile Picture</Form.Label>
         <Form.Control 
            type="file" 
            onChange={uploadFileHandler}
            accept="image/*"
         />
         {uploading && <small className="text-muted">Uploading image...</small>}
      </Form.Group>

      <Form.Group className="my-2" controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="name"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></Form.Control>
      </Form.Group>

      <Form.Group className="my-2" controlId="email">
        <Form.Label>Email Address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></Form.Control>
      </Form.Group>

      <Form.Group className="my-2" controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></Form.Control>
      </Form.Group>

      <Form.Group className="my-2" controlId="confirmPassword">
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        ></Form.Control>
      </Form.Group>

      {isLoading && <Loader />}

      <Button type="submit" variant="primary" className="mt-3 mb-3">
        Update Profile
      </Button>
    </Form>
  );
};

export default UpdateProfile;