var assert = require('assert');
var axios = require('axios');
const { newManga } = require('../manga.js');

describe('njir test', function () {
  it('should make manga', function () {
    firstChapter = testCreateManga()
    // assert.equal(firstChapter, 1)
  });
});


async function testCreateManga(){
  try {
      resp = await axios.get('https://api.mangadex.org/manga/acdbf57f-bf54-41b4-8d92-b3f3d14c852e/aggregate')
      console.log("resp.data")
      console.log(resp.data)
      manga = newManga(resp.data);

      return manga.Volumes[0].Number;
  } catch (error) {
      console.log(error)
      return -1
  };
  
}