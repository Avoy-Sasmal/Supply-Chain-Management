import fs from "fs";

// fetch the data from json
const rawData = fs.readFileSync("./data/dummy.json");
const data = JSON.parse(rawData);

// Helper function to get random data
const getRandomDataValue = () => {
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
};

// Route handler for /random-data
const getRandomData = (req, res) => {
  try {
    const setdata = getRandomDataValue();
    res.json(setdata);
  } catch (error) {
    res.json({
      message: "error in fetching data",
    });
  }
};

const streamData = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendData = () => {
    const randomData = getRandomDataValue();
    res.write(`data: ${JSON.stringify(randomData)}\n\n`);
  };

  sendData();

  const interval = setInterval(sendData, 5000);

  req.on("close", () => clearInterval(interval));
};

export { getRandomData, streamData };
