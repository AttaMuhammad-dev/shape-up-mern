import express from "express";
const router = express.Router();
import {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  exportUserData,
} from "../controllers/userController.js";
import {
  logWaterIntake,
  updateWaterIntake,
  getUserWaterIntake,
} from "../controllers/userWaterIntakeController.js";
import { protect } from "../middleware/authMiddleware.js";

router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserAccount);

router.get('/export',protect,exportUserData);

router
  .route("/water-intake")
  .post(protect, logWaterIntake)
  .put(protect, updateWaterIntake);

router.route("/water-intake/:date").get(protect, getUserWaterIntake);

export default router;
