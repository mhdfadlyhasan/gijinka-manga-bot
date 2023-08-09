const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("lucu").setDescription("Ketawa"),

	async execute(interaction) {
		await interaction.reply("sePong!");
	}
}