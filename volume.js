function Volume(Number, Chapters) {
    this.Number = Number;
    this.Chapters = Chapters;
}

function newVolumes(input) {
  let chapters = []

  input.chapter.array.forEach(element => {
    chapter.push(getChapters(element)) //todo test
  });
  let newVolume = new Volume(input.Volume, chapters)

  return newVolume
}