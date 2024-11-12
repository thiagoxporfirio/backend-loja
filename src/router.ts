import { Router } from "express";
import { body } from "express-validator";
import { loginUser } from "./app/controllers/loginUser";
import tokenMiddleware from "./app/Middleware/Authorization";
import { health } from "./app/controllers/health";
import {
	requestResetPassword,
	resetPassword,
	updatePassword,
	sendVerificationEmail,
	verifyEmail
} from "./app/controllers/resetPassword";
import { updateUserPhoto } from "./app/controllers/updatePhoto";

// import { testIntent } from "./app/controllers/interactWithAi";

import { supportUser } from "./app/controllers/Support";
// import {
// 	CreateCheckoutSession,
// 	CreatePaymentIntent,
// 	cancelSubscription,
// 	getSessionStatus,
// 	getSubscriptionStatus,
// 	updateSubscriptionPlan
// } from "./app/controllers/stripePayments";
// import { createPlans } from "./app/controllers/payments";
import {
	createProduct,
	deleteProduct,
	getAllProducts,
	updateProduct
} from "./app/controllers/products";
import { createUser, deleteUser, getUser, updateUser } from "./app/controllers/user";


export const router = Router();

// router.post("/test-intent", testIntent);

// ======================
// Health Checks
// ======================
router.get("/health", health);
router.get("/", (request, response) =>
	response.json({ message: "CausaGanha." })
);

// ======================
// Authentication and User Management
// ======================
router.post("/login", loginUser);
router.post("/register-user", createUser);
router.delete("/delete-user/:id", tokenMiddleware, deleteUser);
router.post("/req-password", requestResetPassword);
router.post("/reset-password", resetPassword);
router.post("/request-verification", tokenMiddleware, sendVerificationEmail);
router.post("/verify-email", tokenMiddleware, verifyEmail);
router.post("/update-password", tokenMiddleware, updatePassword);

// ======================
// User Details
// ======================
router.get("/user/:id", getUser);
router.put("/user/:id/photo", updateUserPhoto);
router.put("/edit/:id", tokenMiddleware, updateUser);

// ======================
// Products
// ======================
router.post("admin/products", createProduct);
router.put("admin/products/:id", updateProduct);
router.delete("admin/products/:id", deleteProduct);
router.get("/products", getAllProducts);

// ======================
// support Services
// ======================
router.post("/support", supportUser);

// ======================
// Pagseguro Payments Services
// ======================
// router.post("/pagseguro/create", createPlans);

// ======================
// Stripe Payments Services
// ======================
// router.post(
// 	"/create-checkout-session",
// 	[
// 		// Validação
// 		body("price_id").isString().withMessage("Price ID must be a string"),
// 		body("attorney_id").isInt().withMessage("Attorney ID must be an integer")
// 	],
// 	CreateCheckoutSession
// );

// router.post(
// 	"/create-payment-intent",
// 	[
// 		// Validação
// 		body("amount")
// 			.isInt({ gt: 0 })
// 			.withMessage("Amount must be a positive integer"),
// 		body("currency").isString().withMessage("Currency must be a string"),
// 		body("attorney_id").isInt().withMessage("Attorney ID must be an integer")
// 	],
// 	CreatePaymentIntent
// );

// router.post("/update-subscription", updateSubscriptionPlan);
// router.get("/session-status", getSessionStatus);
// router.get("/subscription-status/:subscriptionId", getSubscriptionStatus);
// router.post("/cancel-subscription", cancelSubscription);
