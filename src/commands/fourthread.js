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

async function getThread(board, thread) {
	try {
		const res = await axios({
			method: "GET",
			url: `https://a.4cdn.org/${board}/thread/${thread}.json`,
		});
		return res.data;
	} catch (e) {
		console.error(e);
	}
}

async function _execute(interaction) {
	const boardParams = interaction.data.options.find(opt => opt.name === "board").value;
	const threadParams = interaction.data.options.find(opt => opt.name === "thread").value;
	const limitParams = interaction.data.options.find(opt => opt.name === "limit")?.value || 1;

	const res = await fetch(`https://a.4cdn.org/${boardParams}/thread/${threadParams}.json`, {
		method: "GET"
	});

	const data = await res.json();

	const replyCount = new Map();
	let idRep = 0;
	const threads = [];
	for (const post of data.posts) {
		let fullFilename = "";
		if (post.filename) {
			fullFilename = `${post.tim}${post.ext}`;
		}
		replyCount.set(post.no, 0);

		const threadObj = {
			id: post.no,
			body: post.com,
			time: post.time,
			filename: post.filename,
			file: fullFilename
		};

		if (threadObj.body) {
			const match = htmlclean(post.com).match(/(?:>>)|([0-9])+/g);
			if (match !== null) {
				const repliedId = parseInt(match[1], 10);

				replyCount.set(repliedId, replyCount.get(repliedId) + 1);
				if (
					replyCount.get(repliedId) > replyCount.get(idRep) 
					|| !replyCount.get(idRep) 
					|| Number.isNaN(replyCount.get(idRep))
				) {
					idRep = repliedId;
				}
			}
		}
		threads.push(threadObj);
	}

	const pos = threads.map(e => e.id).indexOf(idRep);
	const thread = threads[pos];

	const embed = {
		title: `>>${thread.id}`,
		color: 0x1f8b4c,
		url: `https://boards.4chan.org/${boardParams}/thread/${threadParams}#p${thread.id}`,
		footer: {
			text: `${replyCount.get(thread.id)} mentions`,
			icon_url: "https://s.4cdn.org/image/foundericon.gif",
		}
	};

	if (!thread.body) {
		if (!thread.file) {
			embed.description = `either deleted or jannies sucks - ${thread.time}`;
		} else {
			embed.image = {
				url: `https://i.4cdn.org/${boardParams}/${thread.file}`
			};
		}
	} else {
		if (!thread.file) {
			embed.description = htmlclean(res.body.substring(0, 1200));
		} else {
			embed.description = htmlclean(res.body.substring(0, 1200));
			embed.image = {
				url: `https://i.4cdn.org/${boardParams}/${thread.file}`
			};
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

export const fourthread = {
	data: {
		name: "4creply",
		type: 1, //Slash command
		description: "you lurk right",
		options: [{
			name: "board",
			type: 3, //STRING option type
			description: "which board",
			required: true
		}, {
			name: "thread",
			type: 4, //INTEGER option type
			description: "which thread",
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