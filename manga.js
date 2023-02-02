class Manga {
  constructor(Title, Link, LatestChapter, Volumes) {
    this.Title = Title;
    this.Link = Link;
    this.LatestChapter = LatestChapter;
    this.Volumes = Volumes;
  }
}
const newManga = (input) => {
  let Title = input.data.attributes["title"]["en"]
  let Link = input.Link
  let LatestChapter =  ` https://mangadex.org/chapter/${input.data.attributes["latestUploadedChapter"]}`
  // const Volumes = Object.keys(input.volumes).map(item => input.volumes[item]) //todo using newVolumes
  let Volumes = input.data.attributes["lastVolume"]
  let newManga = new Manga(Title, Link, LatestChapter, Volumes)

  console.log("newManga")
  console.log(newManga)
  return newManga;
}

module.exports = { newManga }