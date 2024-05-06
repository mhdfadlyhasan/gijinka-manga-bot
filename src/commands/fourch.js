import { InteractionResponseType } from "discord-interactions";
import { json } from "itty-router";

function htmlclean(escapedHTML) {
	return escapedHTML
		.replace(/<br>/g, " ")
		.replace(/(<([^>]+)>)/gi, "")
		.replace(/&#039;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"');
}

async function _execute(interaction) {
	const boardParams = interaction.data.options.find(opt => opt.name === "board").value;
	const limitParams = interaction.data.options.find(opt => opt.name === "limit")?.value || 1;

	const res = await fetch(`https://a.4cdn.org/${boardParams}/catalog.json`, {
		method: "GET",
	});
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

	// Build embed
	const embed = {
		title: "Thread Liveness",
		timestamp: new Date().toISOString(),
		fields: []
	};
	for (let i = 0; i < limitParams; i++) {
		if (!catalogs[i].title) {
			if (!catalogs[i].body) {
				embed.fields.push({
					name: `${catalogs[i].thread}`,
					value: `${catalogs[i].reply} interactions
					https://boards.4chan.org/${boardParams}/thread/${catalogs[i].thread}`
				});
			} else {
				embed.fields.push({
					name: `${htmlclean(catalogs[i].body.substring(0, 400))} - ${catalogs[i].thread}`,
					value: `${catalogs[i].reply} interactions
					https://boards.4chan.org/${boardParams}/thread/${catalogs[i].thread}`
				});
			}
		} else {
			if (!catalogs[i].body) {
				embed.fields.push({
					name: `${catalogs[i].title} - ${catalogs[i].thread}`,
					value: `${catalogs[i].reply} interactions
					https://boards.4chan.org/${boardParams}/thread/${catalogs[i].thread}`
				});
			} else {
				embed.fields.push({
					name: `${catalogs[i].title} - ${catalogs[i].thread}`,
					value: `${htmlclean(catalogs[i].body.substring(0, 400))} ...
					${catalogs[i].reply} interactions
					https://boards.4chan.org/${boardParams}/thread/${catalogs[i].thread}`
				});
			}
		}
	}

	// editReply
	const { application_id, token } = interaction;
	return await fetch(`https://discord.com/api/v10/webhooks/${application_id}/${token}/messages/@original`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ embeds: [embed] })
	});
}

export const fourch = {
	data: {
		name: "4cthread",
		type: 1, //Slash command
		description: "do your lurk reps",
		options: [{
			name: "board",
			type: 3, //STRING option type
			description: "which board",
			required: true
		}, {
			name: "limit",
			type: 4, //INTEGER option type
			description: "how many",
			max_value: 10,
			min_value: 1
		}]
	},

	execute({ interaction, ctx }) {
		ctx.waitUntil(_execute(interaction));

		return json({
			type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
		});
	}
}
