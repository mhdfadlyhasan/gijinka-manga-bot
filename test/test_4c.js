var axios = require("axios");

async function getThreadList(board) {
  try {
    const res = await axios({
      method: "GET",
      url: `https://a.4cdn.org/${board}/threads.json`,
    });
    return res.data;
  } catch (e) {
    console.error(e);
  }
}

async function getCatalog(board) {
  const catalogArr = [];
  try {
    const res = await axios({
      method: "GET",
      url: `https://a.4cdn.org/${board}/catalog.json`,
    });
    return res.data;
  } catch (e) {
    console.error(e);
  }
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

// const listThread = [];
// let listing = getThreadList("vt")
//   .then((resp) => {
//     resp.forEach((page) => {
//       page.threads.forEach((arr) => {
//         listThread.push(arr.no);
//       });
//     });
//     return listThread;
//   })
//   .catch((e) => {
//     console.log(e);
//     return e;
//   });

function htmlclean(escapedHTML) {
  return escapedHTML.replace(/(<([^>]+)>)/gi, "").replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '\n>').replace(/&amp;/g, '&');
}

const catalogArr = [];
const catalogList = getCatalog("vt").then((resp) => {
  resp.forEach((page) => {
    page.threads.forEach((item) => {
      const catalogObj = {
        thread: item.no,
        title: item.sub,
        body: item.com,
        reply: item.replies,
      };
      catalogArr.push(catalogObj);
    });
  });
  catalogArr.sort((a, b) => b.reply - a.reply);
  console.log(catalogArr[0])
  if (catalogArr[0].body) {
    console.log(htmlclean(catalogArr[0].body.substring(0, 500)))
  }
  console.log(typeof (catalogArr[0].body))
  return catalogArr;
});

// const vava = getCatalog("vt").then((res) => {
//   console.log();
// })
// console.log(vava);