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
  return escapedHTML
    .replace(/<br>/g," ")
    .replace(/(<([^>]+)>)/gi, "")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

const threadArr = [];
const tempThreadArr = [];
const threadList = getThreadList("vt").then((resp) => {
  resp.forEach((page) => {
    page.threads.forEach((item) => {
      const threadObj = {
        thread: item.no,
        reply: item.replies,
      };
      threadArr.push(threadObj);
    });
  });
  threadArr.sort((a, b) => b.reply - a.reply);
  console.log(threadArr[0]);
  console.log(typeof threadArr[0]);
  console.log(threadArr[0].thread);

  const idMap = new Map();
  let maxRep = 0;
  const tempThread = getThread("vt", threadArr[0].thread).then((resp) => {
    resp.posts.forEach((post) => {
      if(post.filename) {
        fullFilename = `${post.filename}${post.ext}`
      }
      idMap.set(post.no, 0);
      const tempThreadObj = {
        id: post.no,
        body: post.com,
        time: post.time,
        file: fullFilename,
      };
      if (tempThreadObj.body) {
        if(res = htmlclean(tempThreadObj.body).match(/(?:>>)|([0-9])+/g)) {
          let tempRes = parseInt(res[1])
          // not increasing
          idMap.set(tempRes, (idMap.get(tempRes)) + 1);
          if ((idMap.get(tempRes) > idMap.get(maxRep)) || (!idMap.get(maxRep)) || (idMap.get(maxRep) == NaN)) {
            console.log(idMap.get(maxRep));
            maxRep = tempRes;
          }
        }
      }
      tempThreadArr.push(tempThreadObj);
    });
    console.log(maxRep);
    console.log("----- done check map val -----");
    const pos = tempThreadArr.map(e => e.id).indexOf(maxRep);
    console.log(pos);
    console.log(tempThreadArr[pos]);
    console.log(tempThreadArr[0]);
  });

  // threadArr.forEach(list => {
  //   const tempThread = getThread("vt", list.thread).then((resp) => {
  //     resp.forEach((posts) => {
  //       console.log(posts);
  //     })
  //   });
  // });
});

// const threadL = getThread("vt", threadArr[0].thread).then((resp) => {
//   resp.forEach((posts) => {
//     console.log(posts);
//   })
// })
