DeepPolls: Powered by Eliza 🤖

📑 Technical Report |  📖 Documentation | 🎯 Examples

Welcome to DeepPolls

The DeepPolls Framework is built on ElizaOS, enabling AI agents to interact with users through poll-based decision-making. This unique system allows AI to evolve dynamically, shaped by community choices rather than just static logic.

Key Components

Agents

AI-powered entities that engage users and make decisions.

Built on ElizaOS (with planned support for ChatGPT, DeepSeek, and more).

Adapt their behavior based on poll results.

Polls

The core mechanism for decision-making.

Created by agents and posted directly on Twitter using the Twitter API.

Community votes determine the agent’s next actions.

Decision System

Once a poll ends, the chosen outcome is permanently embedded into the agent.

AI behavior changes forever, ensuring continuous evolution.

Every decision “stacks” on top of previous ones, creating unique AI growth paths.

$POLLS Token

Used to fund development and expand the ecosystem.

Launched on @pumpdotfun with 5% reserved for devs.

Supports future integrations, including LLMs and decentralized AI governance.

Why DeepPolls?✅ Community-driven AI – Every decision is made by users, not developers.✅ Ever-evolving agents – AI doesn’t stay static; it adapts based on real interactions.✅ Decentralized decision-making – Future plans for on-chain governance using $POLLS.

DeepPolls is more than a framework—it’s the future of AI shaped by the people who use it. 🚀

Extra Documentation: polls.js

The polls.js (or polls.ts) script is a practical example of how DeepPolls manages Twitter polls and adapts an AI agent based on community voting.

Chat Completion Example (Poll Use Case)

Below is an example of how you might integrate an OpenAI Chat Completion into a DeepPolls scenario. In this example:

The poll question is: "Is racism bad?" with two options: Yes (100%) and No (0%).

We want the AI agent to parse these results, then generate new personality data in valid JSON.

import { OpenAI } from 'openai';

// Example poll object
interface Poll {
  id: string;
  options: Array<{ label: string; votes?: number }>;
}

// Hardcoded example to illustrate the flow
const pollExample: Poll = {
  id: '12345',
  options: [
    { label: 'Yes', votes: 10 },
    { label: 'No', votes: 0 },
  ],
};

// Analyze poll results, then call OpenAI
async function analyzePollWithChatGPT(poll: Poll): Promise<any> {
  // Determine the number of votes
  const yesOption = poll.options.find((opt) => opt.label.toLowerCase() === 'yes');
  const noOption = poll.options.find((opt) => opt.label.toLowerCase() === 'no');
  const yesVotes = yesOption?.votes || 0;
  const noVotes = noOption?.votes || 0;

  // Build a prompt for OpenAI
  const prompt = `
  The poll question: "Is racism bad?"
  Results:
  Yes votes: ${yesVotes}
  No votes: ${noVotes}

  Based on these results, the AI should firmly conclude that racism is universally bad.
  Please return a valid JSON object with the following keys:
  - update_bio (string): a phrase to add to the agent's biography that opposes racism.
  - update_adjectives (string[]): an array of adjectives describing the agent's stance.
  - update_style_all (string[]): style guidelines to reflect this new stance.

  The JSON must have this format:
  {
    "update_bio": "...",
    "update_adjectives": ["..."],
    "update_style_all": ["..."]
  }
  `;

  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '', // or your key directly
  });

  // Send a Chat Completion request
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant. Return valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  });

  // Parse the output as JSON
  if (!response.choices[0]?.message?.content) {
    throw new Error('No content returned from OpenAI');
  }

  const result = JSON.parse(response.choices[0].message.content);
  return result;
}

// Example usage
async function runExample() {
  try {
    const updates = await analyzePollWithChatGPT(pollExample);
    console.log('Poll updates from OpenAI:', updates);

    // Example output might look like:
    // {
    //   "update_bio": "I firmly stand against racism in all forms...",
    //   "update_adjectives": ["empathetic", "just", "anti-racist"],
    //   "update_style_all": ["Speak boldly against discrimination", "Encourage inclusion and empathy"]
    // }

    // Next, you'd merge these updates into your agent config...
  } catch (error) {
    console.error('Error during poll analysis:', error);
  }
}
