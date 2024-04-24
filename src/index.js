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
import { PING, DEFERRED_PING } from "./commands.js";

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
		switch (interaction.data.name.toLowerCase()) {
			case PING.name.toLowerCase(): {
				return await PING.execute(interaction, ctx);
			}

			case DEFERRED_PING.name.toLowerCase(): {
				return await DEFERRED_PING.execute(interaction, ctx);
			}

			default:
				return json({ error: "Unknown interaction"}, { status: 400 });
		}
	}
});

// https://github.com/kwhitley/itty-router/issues/240
export default { ...router };
