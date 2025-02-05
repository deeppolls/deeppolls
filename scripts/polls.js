import  TwitterApi  from 'twitter-api-v2';
import * as fs from 'fs/promises';
import OpenAI from 'openai';
import 'dotenv';
// ==== CONFIGURATION ====
// Replace with your Twitter API Bearer Token
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
// Replace with the Twitter username that posts the poll (without the @)
const TARGET_USERNAME = process.env.TWITTER_USERNAME;
// Replace with your OpenAI API Key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Path to your Eliza configuration file
const CONFIG_FILE = '../characters/eliza.character.json';
// ==== END CONFIGURATION ====

interface PollOption {
  label: string;
  votes?: number;
}

interface Poll {
    id: string;
    options: PollOption[];
    duration_minutes?: number; // Make this optional
    end_datetime?: string; // Make this optional
  }
  

interface Tweet {
  id: string;
  text: string;
  attachments?: {
    poll_ids?: string[];
  };
}

/**
 * Retrieves the latest tweet with a poll from the target user.
 */
async function getLatestPollTweet(
  client: TwitterApi,
  username: string
): Promise<{ tweet: Tweet; poll: Poll } | null> {
  // Get the user details by username.
  const userResp = await client.v2.userByUsername(username);
  if (!userResp.data) {
    console.error(`User ${username} not found.`);
    process.exit(1);
  }
  const userId = userResp.data.id;

  // Fetch recent tweets from the user, requesting poll-related fields.
  const timeline = await client.v2.userTimeline(userId, {
    'tweet.fields': ['attachments', 'created_at', 'text'],
    expansions: ['attachments.poll_ids'],
    'poll.fields': ['id', 'options', 'duration_minutes', 'end_datetime'],
    max_results: 5,
  });

  if (!timeline.data || timeline.meta.result_count === 0) {
    console.error("No tweets found for this user.");
    process.exit(1);
  }

  // Extract poll metadata (if any) from the included data.
  const polls: Poll[] = timeline.includes?.polls || [];

  // Look for the first tweet with poll attachments.
  for (const tweet of timeline.data.data) {
    if (tweet.attachments && tweet.attachments.poll_ids?.length) {
      const pollId = tweet.attachments.poll_ids[0];
      const poll = polls.find((p) => p.id === pollId);
      if (poll) {
        return { tweet, poll };
      }
    }
  }
  return null;
}

/**
 * Uses OpenAI's ChatGPT to analyze the poll data and decide how to update Eliza's configuration.
 * Expects the poll to have two options ("yes" and "no").
 */
async function analyzePollWithChatGPT(
  poll: Poll,
  tweet: Tweet
): Promise<{ update_bio: string; update_adjectives: string[]; update_style_all: string[] }> {
  let yes_votes = 0;
  let no_votes = 0;

  // Loop through the poll options to extract vote counts.
  for (const option of poll.options) {
    const votes = option.votes || 0;
    const label = option.label.trim().toLowerCase();
    if (label === 'yes') {
      yes_votes = votes;
    } else if (label === 'no') {
      no_votes = votes;
    }
  }
  console.log(poll);
  console.log(`Poll results: YES = ${yes_votes}, NO = ${no_votes}`);

  const pollData = `Poll question: ${tweet.text}
Yes votes: ${yes_votes}
No votes: ${no_votes}`;

  const prompt = `You are an assistant that analyzes Twitter poll results to decide how to update a character's personality.
The character is named Eliza. The configuration must include:
 - update_bio: a string to be appended to her bio
 - update_adjectives: a list of adjectives
 - update_style_all: a list of style instructions

The poll has two options: 'yes' and 'no'. If 'yes' wins (i.e., more yes votes), then the character should adopt a more rebellious, edgy tone. If 'no' wins or there is a tie, the character should shift toward a more academic, precise, and thoughtful tone.

Here are the poll details:
${pollData}

Please output a valid JSON object with the keys "update_bio", "update_adjectives", and "update_style_all".`;

  // Configure OpenAI.
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });
    const content = response.choices[0].message?.content;
    if (!content) {
      throw new Error("No content from OpenAI response");
    }
    const data = JSON.parse(content);
    if (!data.update_bio || !data.update_adjectives || !data.update_style_all) {
      throw new Error("Missing keys in the OpenAI response");
    }
    return data;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    process.exit(1);
  }
}

/**
 * Reads the current Eliza configuration file, updates it with new personality details,
 * and writes the updated configuration back to the file.
 */
async function updateElizaConfig(poll: Poll, tweet: Tweet): Promise<void> {
  const { update_bio, update_adjectives, update_style_all } = await analyzePollWithChatGPT(poll, tweet);

  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(configData);

    // Update configuration.
    if (!Array.isArray(config.bio)) {
      config.bio = [];
    }
    config.bio.push(update_bio);
    config.adjectives = update_adjectives;
    if (!config.style) {
      config.style = {};
    }
    config.style.all = update_style_all;

    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 4));
    console.log("Eliza's configuration has been updated based on the poll results.");
  } catch (error) {
    console.error("Error updating configuration:", error);
    process.exit(1);
  }
}

/**
 * Main entry point.
 */
async function main() {
  const twitterClient = new TwitterApi(BEARER_TOKEN);
  const result = await getLatestPollTweet(twitterClient, TARGET_USERNAME);
  if (!result) {
    console.error("No poll tweet found.");
    process.exit(0);
  }
  const { tweet, poll } = result;
  await updateElizaConfig(poll, tweet);
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
