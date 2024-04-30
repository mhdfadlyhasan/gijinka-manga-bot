/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { AutoRouter, json, error } from "itty-router";
import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";
import * as commands from "./commandFiles.js";

const commandMap = new Map();
for (const command of Object.values(commands)) {
	commandMap.set(command.name, command);
}

const router = AutoRouter();

/** @param {import("itty-router/types").IRequest} req */
async function verifyKeyMiddleware(req, env) {
	const signature = req.headers.get("x-signature-ed25519");
	const timestamp = req.headers.get("x-signature-timestamp");
	const bodyText = await req.text();
	const isValidReq = verifyKey(bodyText, signature, timestamp, env.DISCORD_PUBLIC_KEY);
	if (!isValidReq) return error(401, "bad request signature");
	req.bodyText = bodyText;
}

router.post("/", verifyKeyMiddleware, async (req, env, ctx) => {
	const interaction = JSON.parse(req.bodyText);
	if (!interaction) return error(400, "bad interaction");

	if (interaction.type === InteractionType.PING) return json({ type: InteractionResponseType.PONG });

	if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		const command = commandMap.get(interaction.data.name.toLowerCase());
		if (command) {
			return await command.execute({interaction, req, env, ctx});
		} else {
			return json({ error: "Unknown interaction" }, { status: 400 });
		}
	}
});

// https://github.com/kwhitley/itty-router/issues/240
export default { ...router };
