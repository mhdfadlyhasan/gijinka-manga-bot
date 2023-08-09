const axios = require("axios");
const { getMangaLatestChapter } = require("../tasks/NewChapterChecker.js");

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

(async () => {
	const rows = await getMangaLatestChapter();
	for (const row of rows) {
		try {
			const mangaName = await getMangaByID(row.mangaID);
			console.log(mangaName);
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
			} else {
				return;
			}
		} catch (error) {
			console.error(error);
		}
	}
})();
