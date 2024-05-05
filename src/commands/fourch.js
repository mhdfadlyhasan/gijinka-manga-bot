import { InteractionResponseType } from "discord-interactions";
import { json } from "itty-router";

async function _execute(app_id, token) {
	// InteractionOptions di sini
	const boardParams = "a";

	let method = "GET";
	let req = new Request(`https://a.4cdn.org/${boardParams}/catalog.json`, { method });
	let res = await fetch(req);
	const data = await res.json();

	const catalogs = [];
	for (const page of data) {
		for (const item of page.threads) {
			const catalogObj = {
				thread: item.no,
				title: item.sub,
				body: item.com,
				reply: item.replies,
			};
			catalogs.push(catalogObj);
		}
	}
	catalogs.sort((a, b) => a.reply - b.reply);

	// editReply
	return await fetch(`https://discord.com/api/v10/webhooks/${app_id}/${token}/messages/@original`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ content: catalogs[0].body })
	});
}

export const fourch = {
	name: "4cthread",
	description: "do your lurk reps",
	options: [{
		type: 3,
		name: "board",
		description: "which board",
		required: true
	}, {
		type: 4,
		name: "limit",
		description: "how many",
		max_value: 10,
		min_value: 1
	}],
	execute({ interaction, ctx }) {
		ctx.waitUntil(_execute(interaction.application_id, interaction.token));

		return json({
			type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
		});
	}
}