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

async function checkNewChapter(mangaID) {
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
				}
			}
		});
		const embed = new EmbedBuilder()
			.setTitle(`Update Manga ${mangaName}`)
			.setDescription(`Chapter ${res.data.data[0].attributes.chapter} is now available!`);
		const btnRead = new ButtonBuilder()
			.setLabel("Read")
			.setURL(`https://mangadex.org/title/${mangaID}`)
			.setStyle(ButtonStyle.Link);
		const row = new ActionRowBuilder()
			.addComponents(btnRead);
		return {embed, row};
	} catch (error) {
		console.error(error);
	}
}

module.exports = {
	checkNewChapter
};