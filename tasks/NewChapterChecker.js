const { readFile, writeFile } = require("node:fs/promises");
const axios = require("axios");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const crontabScheduleChapterChecker = process.env.CHAPTER_CHECKER_CRONTAB_SCHEDULE;
var crontabSchedule = crontabScheduleChapterChecker

if (typeof crontabSchedule === 'undefined' && crontabSchedule !== null) {
    crontabSchedule = "* * * * *"; // Set schedule to default
}

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
	const mangaIDList = ['e0ee7a1c-db6c-4cc8-927b-ae3a6609ee37'];

	mangaIDList.forEach(async function(mangaID) {
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
			if (parseFloat(res.data.data[0].attributes.chapter) > latestChapter) {
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
	})
}

module.exports = {
	crontab: crontabSchedule,
	execute: checkNewChapter
};