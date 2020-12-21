const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const {debug, download, combine} = require('./util');
const db = require('./firebase');
const TOKEN = '1454294772:AAHFlkJye73e6Szb7jbNJw1_zcraFAedc2A';
const {random, floor} = require('math');
const cronstrue = require('cronstrue');

const photoUrl = `https://api.telegram.org/file/bot${TOKEN}/`;

const TASKS = new Map();

const bot = new TelegramBot(TOKEN, {
  polling: true
});

bot.onText(/\/schedule (.+)/, async (msg, [source, args]) => {
  const chatId = msg.chat.id;
  if (!cron.validate(args)) {
    await bot.sendMessage(chatId, "Wrong format!! Try again, stupid fagot");
    return;
  }
  const task = cron.schedule(args, async () => {
    const userName = msg.from.nickname || msg.from.name;
    const users = await db.findAll(chatId);
    const fagot = getFagot(users);
    if (fagot.id) {
      const photo = await getFagotPhoto(fagot.id);
      await download(`${photoUrl}${photo.file_path}`, '1.jpg');
      await combine('1.jpg', '2.jpg', '3.jpg');
      await bot.sendPhoto(chatId, '3.jpg', {
        caption: `${userName} pidor!!!`,
      });
    } else {
      await bot.sendMessage(chatId,
          `I do not have the photo, but ${userName} is fagot`);
    }
  }, {});
  TASKS.set(TASKS.size, task);
  await bot.sendMessage(chatId,
      `Next fagot will be selected:\n${cronstrue.toString(match)}`);
});

const getFagot = (users) => {
  const index = floor(random() * users.length);
  return users[index];
}

const getFagotPhoto = async (fagotId) => {
  const {photos} = await bot.getUserProfilePhotos(fagotId);
  const index = floor(random() * photos.length);
  const fileId = photos[index].pop().file_id;
  return await bot.getFile(fileId);
}

bot.onText(/\/register (.+)/, async (msg, [source, args]) => {
  const chatId = msg.chat.id;
  if (args) {
    console.log(args);
    const users = parseArgs(args);
    await db.saveAll(chatId, users.map(user => {return {nickname: user}}));
    await bot.sendMessage(chatId,
        `Congrats, ${msg.from.nickname
        || msg.from.name}!\n I believe you will be the next fagot.\n Good luck!`);
  } else {
    await db.save(chatId, {
      id: msg.from.id,
      name: msg.from.first_name,
      nickname: msg.from.username
    });
    await bot.sendMessage(chatId,
        `Congrats, ${msg.from.nickname
        || msg.from.name}!\n I believe you will be the next fagot.\n Good luck!`);
  }
});

bot.onText(/\/tasks/, async msg => {
  let message = '';
  TASKS.forEach((value, key) => `${message}\n${key} - ${value}`)
});

bot.onText(/\/remove (.+)/,
    (msg, [source, args]) => parseArgs(args).forEach(arg => TASKS.delete(arg)));

const parseArgs = args => {
  if (/[,\s]/.test(args)) {
    return args.split(' ').map(arg => {
      arg.replaceAll(/[,\s]/, '').trim()
    })
  } else {
    return [args.trim()];
  }
};