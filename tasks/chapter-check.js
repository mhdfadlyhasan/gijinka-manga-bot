const axios = require("axios");
const mariadb = require("mariadb");
const { MongoClient } = require("mongodb");

class MongoDBWrapper {
	constructor(connectionUri) {
		this.client = new MongoClient(connectionUri);
	}

	async run() {
		try {
			const db = this.client.db();
			const manga = db.collection("manga");
			return manga.find();
		} catch (err) {
			throw new Error(err);
		} finally {
			await this.client.close();
		}
	}
}

class MariaDBWrapper {
	constructor(connectionUri) {
		this.pool = mariadb.createPool(connectionUri);
	}

	async run() {
		try {
			this.conn = await this.pool.getConnection();
			return conn.queryStream("SELECT * FROM `latest_chapter`");
		} catch (err) {
			throw new Error(err);
		} finally {
			await this.conn.end();
		}
	}
}

class DBWrapper {
	constructor() {
		if (process.env.DB_TYPE === "mongodb") {
			const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
			this.dbconn = new MongoDBWrapper(uri);
		} else if (process.env.DB_TYPE === "mariadb") {
			const uri = {
				host: process.env.DB_HOST,
				user: process.env.DB_USER,
				password: process.env.DB_PASS,
				database: process.env.DB_NAME,
			};
			this.dbconn = new MariaDBWrapper(uri);
		} else {
			this.dbconn = undefined;
		}
	}

	get data() {
		return this.dbconn.run();
	}
}

module.exports = {
	crontab: "0 * * * *",

	async execute() {
		// Formatnya { _id, latestChapter, mangaName }
		// _id biar MongoDB gak generate unique key sendiri
		// Kalo gak unik salahin MangaDex :p

		const dbconn = new DBWrapper();
		const rows = dbconn.data;

		try {
			for await (const row of rows) {
				console.log(row);

				// GET chapter terbaru dari mangadex API
				const res = await axios({
					method: "GET",
					url: `https://api.mangadex.org/manga/${row.mangaID}/feed`,
					params: {
						translatedLanguage: ["en", "id"],
						order: {
							chapter: "desc"
						},
						limit: 1
					}
				});

				if (res.data.data[0].attributes.chapter > row.latest) {
					const latest = res.data.data[0].attributes.chapter;
					console.log(`New chapter: ${latest}`);

					// TODO: cari cara update row yang ada di DB
				}
			}
		} catch (error) {
			rows.close();
		}
	}
}