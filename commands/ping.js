const { SlashCommandBuilder } = require("discord.js");
const { newManga } = require("../manga.js");

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),

	async execute(interaction) {
		const chapter = 11;
		const resp = await axios.get(
			"https://api.mangadex.org/manga/acdbf57f-bf54-41b4-8d92-b3f3d14c852e/"
		);
		manga = newManga(resp.data);
		await interaction.reply({
			content: `Manga ${manga.Title}, check out here ${manga.LatestChapter}`,
		});
	}
}