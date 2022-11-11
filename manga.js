class Manga {
  constructor(Title, Link, LatestChapter, Volumes) {
    this.Title = Title;
    this.Link = Link;
    this.LatestChapter = LatestChapter;
    this.Volumes = Volumes;
  }
}
const newManga = (input) => {
  let Title = input
  let Link = input.Link
  let LatestChapter = 0 // getLatestChapter(input) 
  const Volumes = Object.keys(input.volumes).map(item => input.volumes[item]) //todo using newVolumes

  let newManga = new Manga(Title, Link, LatestChapter, Volumes)

  console.log("newManga")
  console.log(newManga)
  return newManga;
}

module.exports = { newManga }