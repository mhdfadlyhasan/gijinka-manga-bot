import * as commands from "../commandFiles.js";

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

const data = Object.values(commands).map(command => command.data);
try {
	for (const guildId of process.env.DISCORD_GUILD_ID.split(",")) {
		const res = await fetch(`https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bot ${token}`
			},
			body: JSON.stringify(data)
		});
		console.log(`Successfully registered ${data.length} commands to GUILD_ID ${guildId}`);
	}
} catch (error) {
	console.error(error);
}
