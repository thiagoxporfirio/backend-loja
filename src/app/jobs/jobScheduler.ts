import cron from "node-cron";
import { AppDataSource } from "../../database/data-source";
import { Subscription } from "../entity/Subscription";

// Job para rodar no final de cada mês (dia 28 de cada mês às 23:59)
cron.schedule("59 23 28 * *", async () => {
	console.log("Running job to remove canceled subscriptions...");

	const subscriptionRepository = AppDataSource.getRepository(Subscription);
	try {
		const canceledSubscriptions = await subscriptionRepository.find({
			where: { status: "Cancelado" }
		});

		if (canceledSubscriptions.length > 0) {
			await subscriptionRepository.remove(canceledSubscriptions);
			console.log(
				`Removed ${canceledSubscriptions.length} canceled subscriptions.`
			);
		} else {
			console.log("No canceled subscriptions to remove.");
		}
	} catch (error) {
		console.error("Error running job to remove canceled subscriptions:", error);
	}
});
