const { readFile, writeFile } = require("node:fs/promises");
const axios = require("axios");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

async function getMangaByID(mangaID) {
	try {
		const res = await axios({
			method: "GET",
			url: `https://api.mangadex.org/manga/${mangaID}`,
		});
		return res.data.data.attributes.title.en;
	} catch (e) {
		console.error(e);
	}
}

async function checkNewChapter(channel) {
	const mangaID = "acdbf57f-bf54-41b4-8d92-b3f3d14c852e";
	let latestChapter = 0;
	try {
		latestChapter = await readFile("./latest.txt", { encoding: "utf-8" });
		console.log(latestChapter);
	} catch (error) {
		console.warn("Never checked chapter before");
	}

	try {
		const mangaName = await getMangaByID(mangaID);
		console.log(mangaName);
		const res = await axios({
			method: "GET",
			url: `https://api.mangadex.org/manga/${mangaID}/feed`,
			params: {
				translatedLanguage: ["en", "id"],
				order: {
					chapter: "desc"
				},
				limit: 1
			}
		});

		if (res.data.data[0].attributes.chapter > latestChapter) {
			latestChapter = res.data.data[0].attributes.chapter;
			writeFile("./latest.txt", latestChapter);
		} else {
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle(`Update Manga ${mangaName}`)
			.setDescription(`Chapter ${latestChapter} is now available!`)
			.setTimestamp();

		const btnRead = new ButtonBuilder()
			.setLabel("Read")
			.setURL(`https://mangadex.org/title/${mangaID}`)
			.setStyle(ButtonStyle.Link);

		const row = new ActionRowBuilder()
			.addComponents(btnRead);
		
		channel.send({embeds: [embed], components: [row]});
	} catch (error) {
		console.error(error);
	}
}

module.exports = {
	crontab: "* * * * *",
	execute: checkNewChapter
};