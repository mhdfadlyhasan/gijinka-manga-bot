const { REST, Routes, Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const axios = require('axios');

const TOKEN = process.env.TOKEN
const APP_ID = process.env.APP_ID

// Exit handler
["SIGTERM", "SIGINT"].forEach(event => {
  process.on(event, () => {
    console.log(`${event} received, exiting. . .`);
    client.destroy();
    process.exitCode = 0;
  });
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'lucu') {
    await interaction.reply('sePong!');
  }

  if (interaction.commandName === 'ping') {
    const chapter = 11;
    resp = await axios.get('https://api.mangadex.org/manga/acdbf57f-bf54-41b4-8d92-b3f3d14c852e/aggregate');
    await interaction.reply({ content: `${resp.data.volumes["1"].chapters["1"].chapter}` });
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