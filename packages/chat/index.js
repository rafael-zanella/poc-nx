const readlineSync = require('readline-sync');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const PROMPT_PREFIX = 'Responda em português brasileiro.';
const WAIT_TIME = 1000;
const PULLING_INTERVAL = 200;

let isWaitingForResponse = false;
let conversationHistory = PROMPT_PREFIX;


async function generateResponse(prompt) {
  try {
    console.log(' \n\n*Pensando...* \n ');

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${conversationHistory} \n Human: ${prompt}\n`,
      max_tokens: 1000,
      temperature: 0.9,
      stop: [" Human:", " AI:"],
    });

    return response.data.choices[0].text;
  } catch (error) {
    console.log(error);
    return;
  }
}

async function handleQuestion() {
  if(!isWaitingForResponse) {
    const question = readlineSync.question('\n\nRafael: ');
    isWaitingForResponse = true;

    const answer = await generateResponse(question);
    console.log(`\n${answer}\n`);
    conversationHistory += `${question}\n${answer}\n`;

    setTimeout(() => {
      isWaitingForResponse = false;
    }, WAIT_TIME);
  } else {
    await new Promise(resolve => setTimeout(resolve, PULLING_INTERVAL));
  }
}

async function startConversation() {
  while(true) {
    await handleQuestion();
  }
}

async function main() {
  await startConversation();
}

main();
