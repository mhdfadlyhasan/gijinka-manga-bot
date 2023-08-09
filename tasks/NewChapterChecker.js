const { readFile, writeFile } = require("node:fs/promises");
const axios = require("axios");
const mariadb = require("mariadb");
const { MongoClient } = require("mongodb");
const mongoUri = process.env.MONGO_URI;
const mariaUri = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	connectionLimit: 5
};
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function createDB(db) {
	if (db === "mariadb") {
		return {
			type: "mariadb",
			pool: mariadb.createPool(mariaUri)
		};
	} else if (db === "mongodb") {
		return {
			type: "mongodb",
			pool: new MongoClient(mongoUri)
		};
	}
}

async function queryDB(dbInstance) {
	if (dbInstance.type === "mariadb") {
		let conn, rows;
		try {
			conn = await dbInstance.pool.getConnection();
			rows = await conn.query("SELECT * FROM `latest_chapter`");
			console.log(rows);
		} catch (error) {
			throw new Error(error);
		} finally {
			if (conn) {
				await conn.end();
				return rows;
			}
		}
	} else if (dbInstance.type === "mongodb") {
		// HOW???
	}
}

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

async function getMangaLatestChapter() {
	let conn, rows;
	try {
		conn = await pool.getConnection();
		rows = await conn.query("SELECT * FROM `latest_chapter`");
		console.log(rows);
	} catch (err) {
		throw new Error(err);
	} finally {
		if (conn) {
			await conn.end();
			return rows;
		}
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
