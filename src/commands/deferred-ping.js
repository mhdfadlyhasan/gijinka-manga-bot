import { InteractionResponseType } from "discord-interactions";
import { json } from "itty-router";

async function editReply(app_id, token) {
	// Pura-pura GET
	await new Promise(resolve => setTimeout(resolve, 5000));

	const method = "PATCH";
	const headers = new Headers({
		"Content-Type": "application/json"
	});
	const body = JSON.stringify({ content: "sePong! ~5 seconds after.~" });
	const req = new Request(
		`https://discord.com/api/v10/webhooks/${app_id}/${token}/messages/@original`,
		{ method, headers, body }
	);

	return await fetch(req);
}

export const deferred_ping = {
	name: "deferred-ping",
	description: "Replies with Pong! 5 seconds later",
	execute({interaction, ctx}) {
		// Ini kayak editReply, ctx.waitUntil() biar worker-nya gak langsung meninggoy
		ctx.waitUntil(editReply(interaction.application_id, interaction.token));
		
		// Ini kayak deferReply
		return json({
			type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
		});
		
		// Dibalik biar pusing
	}
};
