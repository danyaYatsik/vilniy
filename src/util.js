const fs = require('fs');
const request = require('request');
const Jimp = require('jimp');

module.exports = {
  debug: (string) => JSON.stringify(string, null, 4),
  download: async (url, destination) => {
    const file = fs.createWriteStream(destination);
    await new Promise((resolve, reject) => {
      request({
        uri: url,
        gzip: true,
      })
      .pipe(file)
      .on('finish', async () => {
        console.log(`The file is finished downloading.`);
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
    })
    .catch((error) => {
      console.log(`Something happened: ${error}`);
    });
  },
  combine: async (src1, src2, dest) => {
    const img1 = await Jimp.read(src1);
    const img2 = await Jimp.read(src2);
    img1.blit(img2, 0, img1.getHeight() - img2.getHeight());
    await img1.writeAsync(dest);
  }
}