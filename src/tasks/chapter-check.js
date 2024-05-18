import { MessageComponentTypes } from "discord-interactions";

async function execute(event, env) {
	const keyList = await env.MANGADEX_CHAPTERS.list();

	// Get guild system channel
	const sys_ch_list = [];
	for (const guildId of env.DISCORD_GUILD_ID.split(",")) {
		const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
			method: "GET",
			headers: {
				"Authorization": `Bot ${env.DISCORD_TOKEN}`
			}
		});
		const sys_ch = (await res.json()).system_channel_id;
		sys_ch_list.push(sys_ch);
	}
	console.log(sys_ch_list);

	for (const { name } of keyList.keys) {
		const [manga_name, saved_chapter] = (await env.MANGADEX_CHAPTERS.get(name)).split(";");
		let [saved_ch, saved_sub_ch] = saved_chapter.split(".");
		saved_ch = parseInt(saved_ch, 10);
		saved_sub_ch = parseInt(saved_sub_ch, 10);

		const res = await fetch(`https://api.mangadex.org/manga/${name}/feed?limit=1&translatedLanguage[0]=en&translatedLanguage[1]=id&order[chapter]=desc`, {
			method: "GET",
			headers: {
				"User-Agent": "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)"
			}
		});
		const ch_data = await res.json();

		if (ch_data.result === "ok") {
			const latest_ch = ch_data.data[0].attributes.chapter;
			let [ch, sub_ch] = latest_ch.split(".");
			ch = parseInt(ch, 10);
			sub_ch = parseInt(sub_ch, 10);

			let embed = {};
			let button = {};
			let row = {};
			if (ch > saved_ch) {
				embed = {
					title: `Update Manga ${manga_name}`,
					description: `Chapter ${latest_ch} is now available!`,
					timestamp: new Date().toISOString(),
				};
				button = {
					type: MessageComponentTypes.BUTTON,
					style: 5,
					label: "Read",
					url: `https://mangadex.org/title/${name}`
				};
				row = {
					type: MessageComponentTypes.ACTION_ROW,
					components: [button]
				};
				await env.MANGADEX_CHAPTERS.put(name, `${manga_name};${latest_ch}`);
			} else if (ch === saved_ch) {
				if (
					(!Number.isNaN(sub_ch) && !Number.isNaN(saved_sub_ch)) &&
					(sub_ch > saved_sub_ch)
				) {
					embed = {
						title: `Update Manga ${manga_name}`,
						description: `Chapter ${latest_ch} is now available!`,
						timestamp: new Date().toISOString(),
					};
					button = {
						type: MessageComponentTypes.BUTTON,
						style: 5,
						label: "Read",
						url: `https://mangadex.org/title/${name}`
					};
					row = {
						type: MessageComponentTypes.ACTION_ROW,
						components: [button]
					};
					await env.MANGADEX_CHAPTERS.put(name, `${manga_name};${latest_ch}`);
				}
			}

			for (const sys_ch of sys_ch_list) {
				console.log(`sending to ${sys_ch}`);
				const res = await fetch(`https://discord.com/api/v10/channels/${sys_ch}/messages`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bot ${env.DISCORD_TOKEN}`
					},
					body: JSON.stringify({ embeds: [embed], components: [row] })
				});
			}
		}
	}
}

export const chapter_check = { execute };
