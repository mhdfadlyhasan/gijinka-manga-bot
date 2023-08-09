const fs = require("node:fs");
const { REST, Routes, Client, GatewayIntentBits, Collection } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const axios = require('axios');
const { newManga } = require('./manga.js')
const TOKEN = process.env.TOKEN;
const APP_ID = process.env.APP_ID;

/**
 * Setup background tasks
 * @param {Client} client 
 */
async function setupTasks(client) {
  const { readdir } = require("node:fs/promises");
  const { CronJob } = require("cron");
  const channel = await client.channels.fetch(process.env.CHANNEL_ID);

  const taskFiles = await readdir("./tasks");
  const jobs = [];
  for (const taskFile of taskFiles.filter(file => file.endsWith(".js"))) {
    const task = require(`./tasks/${taskFile}`);
    jobs.push(new CronJob(
      task.crontab,
      () => { task.execute(channel) },
      null,
      true,
      "Asia/Jakarta"
    ));
  }
}

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  setupTasks(client);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

const rest = new REST({ version: "10" }).setToken(TOKEN);

const commandJSON = [];
client.commands.forEach((_, cmd) => {commandJSON.push(cmd.data.toJSON())});

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(`${APP_ID}`), { body: commandJSON });
    console.log("Successfully reloaded application (/) commands.");

    await client.login(TOKEN);
  } catch (error) {
    console.error(error);
  }
})();
