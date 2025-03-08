const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateRequest,
} = require("../validation/userValidator");

router.get("/", userController.getAllUsers);
router.get("/:id", validateUserId, validateRequest, userController.getUserById);
router.post(
  "/signup",
  validateCreateUser,
  validateRequest,
  userController.signup
);
router.post("/signin", validateRequest, userController.signin);
router.post("/refresh-token", userController.refreshToken);
router.patch(
  "/:id",
  validateUserId,
  validateUpdateUser,
  validateRequest,
  userController.updateUser
);
router.delete(
  "/:id",
  validateUserId,
  validateRequest,
  userController.deleteUser
);

module.exports = router;
