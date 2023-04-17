const { REST, Routes, Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const axios = require('axios');
const {newManga} = require('./manga.js');
const TOKEN = process.env.TOKEN;
const APP_ID = process.env.APP_ID;

// Exit handler
// ["SIGTERM", "SIGINT"].forEach(event => {
//   process.on(event, () => {
//     console.log(`${event} received, exiting. . .`);
//     client.destroy();
//     process.exitCode = 0;
//   });
// });

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

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  setupTasks(client);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'lucu') {
    await interaction.reply('sePong!');
  }

  if (interaction.commandName === 'ping') {
    const chapter = 11;
    resp = await axios.get('https://api.mangadex.org/manga/acdbf57f-bf54-41b4-8d92-b3f3d14c852e/');
    manga = newManga(resp.data)
    await interaction.reply({ content: `Manga ${manga.Title}, check out here ${manga.LatestChapter}` });
  };
});

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'lucu',
    description: 'Ketawa',
  },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(`${APP_ID}`), { body: commands });
    console.log('Successfully reloaded application (/) commands.');

    await client.login(TOKEN);
  } catch (error) {
    console.error(error);
  }
})();