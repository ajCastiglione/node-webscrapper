const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

const writeStream = fs.createWriteStream("info.csv");

// Write headers
writeStream.write(`Title, Content \n`);

let url = "http://www.wondercrate.com/web-design-and-development/";

const scrape = request(url, (error, res, html) => {
  if (error) {
    return Promise.reject();
  }

  const $ = cheerio.load(html);
  const box = $(".wpb_column");

  box.each((index, el) => {
    let title = $(el)
      .find("h3")
      .text();
    let desc = $(el)
      .find("p")
      .text()
      .replace(/\s\s+/g, "")
      .replace(/[,]/gm, "")
      .replace(/[']/gm, "'");

    if (
      desc ==
        box
          .eq(index - 1)
          .find("p")
          .text()
          .replace(/\s\s+/g, "")
          .replace(/[,]/gm, "") ||
      !title ||
      !desc
    ) {
      return true;
    }

    //Write row to CSV
    writeStream.write(`${title}, ${desc} \n`);
    // console.log(`Title ${index}: ${title}. Content ${index}: ${desc}`);
  });

  console.log("Scrapping done");
});

module.exports = { scrape };
