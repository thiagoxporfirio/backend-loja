import { Request, Response } from "express";
const stripe = require("stripe")(
	"sk_test_51Qqg1LP8BbnibUkSJ6ph6amEcLmoJ2NYq4lnqTD5dHPARFeQnXwESplxFroVe00SH0A1kh180HhwKud4P6iQUEKk00hEUgFV3C"
);
import { sendPurchaseConfirmationEmail } from "../../services/emailService";

export const createPaymentIntent = async (req: Request, res: Response) => {
  console.log("createPaymentIntent");
	try {
		const { items } = req.body;

		// Calculate the total amount
		const amount = items.reduce((total: number, item: any) => {
			return total + item.price * item.quantity;
		}, 0);

		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency: "brl",
			automatic_payment_methods: {
				enabled: true,
			},
		});

		res.send({
			clientSecret: paymentIntent.client_secret,
		});
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
};

export const handlePaymentSuccess = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;

		// Send confirmation email
		await sendPurchaseConfirmationEmail(
			email,
			"Purchase Confirmation",
			"Thank you for your purchase!"
		);

		res.status(200).send({ message: "Payment successful and email sent." });
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
};
