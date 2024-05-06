const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

function htmlclean(escapedHTML) {
  return escapedHTML
    .replace(/<br>/g, "\n")
    .replace(/(<([^>]+)>)/gi, "")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

async function getThread(board, thread) {
  try {
    const res = await axios({
      method: "GET",
      url: `https://a.4cdn.org/${board}/thread/${thread}.json`,
    });
    return res.data;
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("4creply")
    .setDescription("you lurk right")
    .addStringOption((option) =>
      option.setName("board").setDescription("which board").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("thread")
        .setDescription("which thread").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setDescription("how many")
        .setMaxValue(5)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const idMap = new Map();
    let idRep = 0;
    const threadArr = [];
    await interaction.deferReply();
    const boardParams = interaction.options.getString("board", true); // Required parameter
    const limitParams = interaction.options.getInteger("limit") || 1;
    const threadParams = interaction.options.getInteger("thread");
    const res = await axios({
      method: "GET",
      url: `https://a.4cdn.org/${boardParams}/thread/${threadParams}.json`,
    }).then((res) => {
      data = res.data.posts;
      data.forEach((post) => {
        // something funny happen, because instead of checking typeof it's checking value null
        if (post.filename) {
          fullFilename = `${post.tim}${post.ext}`;
        }
        idMap.set(post.no, 0);
        const tempThreadObj = {
          id: post.no,
          body: post.com,
          time: post.time,
          filename: post.filename,
          file: fullFilename,
        };
        if (tempThreadObj.body) {
          if ((res = htmlclean(tempThreadObj.body).match(/(?:>>)|([0-9])+/g))) {
            let tempRes = parseInt(res[1]);
            idMap.set(tempRes, idMap.get(tempRes) + 1);
            if (
              idMap.get(tempRes) > idMap.get(idRep) ||
              !idMap.get(idRep) ||
              idMap.get(idRep) == NaN
            ) {
              idRep = tempRes;
            }
          }
        }
        threadArr.push(tempThreadObj);
      });
      console.log("----- done check map val -----");
      console.log(idRep);
      const pos = threadArr.map((e) => e.id).indexOf(idRep);
      return threadArr[pos];
    });

    console.log(res);

    const embed = new EmbedBuilder().setColor(`DarkGreen`).setTitle(`>>${res.id}`).setURL(`https://boards.4chan.org/${boardParams}/thread/${threadParams}#p${res.id}`).setFooter({text:`${idMap.get(res.id)} mentions`, iconURL: 'https://s.4cdn.org/image/foundericon.gif'})
    if (!res.body) {
      if (!res.file) {
        embed.setDescription(`either deleted or jannies sucks - ${res.time}`)
      }
      else {
        embed.setImage(`https://i.4cdn.org/${boardParams}/${res.file}`) 
      }
    } else {
      if (!res.file) {
        embed.setDescription(`${htmlclean(res.body.substring(0, 1200))}`) 
      }
      else {
        embed.setDescription(`${htmlclean(res.body.substring(0, 1200))}`) 
        embed.setImage(`https://i.4cdn.org/${boardParams}/${res.file}`)
        };
      }
    await interaction.editReply({ embeds: [embed] });
  }
};
