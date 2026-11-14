const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const campaign = __dirname;
const web = path.resolve(campaign, '../../public/photos');
const jobs = JSON.parse(fs.readFileSync(path.resolve(campaign, process.argv[2]), 'utf8'));
Promise.all(jobs.map(async job => {
  fs.copyFileSync(job.source, path.join(campaign, job.name + '.png'));
  await sharp(job.source).resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:87,effort:6}).toFile(path.join(web, job.name + '.webp'));
  console.log(job.name);
})).catch(error => { console.error(error); process.exit(1); });
