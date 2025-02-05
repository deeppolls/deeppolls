# DeepPolls: Powered by Eliza 🤖

<div align="center">
  <img src="./docs/static/img/eliza_banner.jpg" alt="Eliza Banner" width="100%" />
</div>

<div align="center">

📑 [Technical Report](https://arxiv.org/pdf/2501.06781) |  📖 [Documentation](https://elizaos.github.io/eliza/) | 🎯 [Examples](https://github.com/thejoven/awesome-eliza)

</div>

---

## Welcome to DeepPolls

The **DeepPolls Framework** is built on [ElizaOS](https://github.com/elizaos/eliza), enabling AI agents to interact with users through **poll-based decision-making**. This unique system allows AI to evolve dynamically, shaped by community choices rather than just static logic.

### **Key Components**

1. **Agents**  
   - AI-powered entities that engage users and make decisions.  
   - Built on ElizaOS (with planned support for ChatGPT, DeepSeek, and more).  
   - Adapt their behavior based on poll results.

2. **Polls**  
   - The core mechanism for decision-making.  
   - Created by agents and posted directly on Twitter using the Twitter API.  
   - Community votes determine the agent’s next actions.

3. **Decision System**  
   - Once a poll ends, the chosen outcome is permanently embedded into the agent.  
   - AI behavior changes forever, ensuring continuous evolution.  
   - Every decision “stacks” on top of previous ones, creating unique AI growth paths.

4. **$POLLS Token**  
   - Used to fund development and expand the ecosystem.  
   - Launched on @pumpdotfun with 5% reserved for devs.  
   - Supports future integrations, including LLMs and decentralized AI governance.

**Why DeepPolls?**  
✅ Community-driven AI – Every decision is made by users, not developers.  
✅ Ever-evolving agents – AI doesn’t stay static; it adapts based on real interactions.  
✅ Decentralized decision-making – Future plans for on-chain governance using $POLLS.  

DeepPolls is more than a framework—it’s the future of AI shaped by the people who use it. 🚀

---

## Extra Documentation: `polls.js`

The `polls.js` (or `polls.ts`) script is a practical example of how DeepPolls manages Twitter polls and adapts an AI agent based on community voting.

### Chat Completion Example (Poll Use Case)

Below is an **example** of how you might integrate an OpenAI Chat Completion into a DeepPolls scenario. In this example:

- The poll question is: **"Is racism bad?"** with two options: **Yes** (100%) and **No** (0%).
- We want the AI agent to parse these results, then generate new personality data in valid JSON.

```ts
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

  Based on these results, the AI should firmly conclude that racism is universally bad. Please return a valid JSON object with the following keys:
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

runExample();
In a real-world scenario, you would:

Fetch the latest poll from Twitter instead of using a hardcoded pollExample.
Pass the resulting poll object to analyzePollWithChatGPT.
Update your Eliza or other agent config with the newly generated data from OpenAI.
Restart or reload your agent to see the changes in effect.
High-Level Code Flow
Fetch the Latest Poll

Uses the Twitter API to retrieve the most recent tweet containing a poll for a given username.
Extracts poll info (ID, options, duration, etc.).
Analyze the Poll

Counts votes for each option (e.g., “Yes” vs. “No”).
Create a Prompt & Call OpenAI

Builds a custom prompt incorporating the poll question and results.
Uses the openai.chat.completions.create method to send a request to GPT-3.5 (or GPT-4).
Parse JSON Output

The AI should return a strictly valid JSON object containing instructions to update the AI agent’s persona.
Update Configuration

The script reads the local Eliza config file (e.g., eliza.character.json).
Appends or overwrites personality fields (bio, adjectives, style).
Saves the file, effectively altering the agent’s future behavior.
Restart Agent

Reload the Eliza or DeepPolls agent so the changes are reflected during the next conversation or poll cycle.
Twitter API Rate-Limiting
Important: Free or Basic Twitter API tiers can be very restrictive. If your script checks polls frequently, you may encounter HTTP 429 (Too Many Requests) errors. Using a paid Twitter API plan is strongly recommended to avoid interruptions.

🌍 README Translations
中文说明 | 日本語の説明 | 한국어 설명 | Persian | Français | Português | Türkçe | Русский | Español | Italiano | ไทย | Deutsch | Tiếng Việt | עִברִית | Tagalog | Polski | Arabic | Hungarian | Srpski | Română | Nederlands | Ελληνικά

🚩 Overview (ElizaOS)
<div align="center"> <img src="./docs/static/img/eliza_diagram.png" alt="Eliza Diagram" width="100%" /> </div>
DeepPolls builds on Eliza’s robust foundation:

Discord, X (Twitter), Telegram connectors
Support for multiple LLMs (Llama, Grok, OpenAI, Anthropic, Gemini, etc.)
Multi-agent and multi-room support
Easy ingestion of documents for retrieval
Retrievable memory
Highly extensible with custom actions and clients
🎯 Use Cases
Poll-driven AI Agents
Community-driven Chatbots
Game NPCs that evolve with polls
Business processes that require consensus-driven updates
🚀 Quick Start
Prerequisites
Python 2.7+
Node.js 23+
pnpm
Note for Windows Users: WSL 2 is required for certain features.

Recommended Start


git clone https://github.com/elizaos/eliza-starter.git
cd eliza-starter
cp .env.example .env
pnpm i && pnpm build && pnpm start
This will install all dependencies and start Eliza (which DeepPolls extends).

Manually Start Eliza (Advanced)
Clone & Checkout Latest Release

git clone https://github.com/elizaos/eliza.git
cd eliza
git checkout $(git describe --tags --abbrev=0)
Edit Environment

cp .env.example .env
Start

pnpm i
pnpm build
pnpm start
Clean (if needed)

pnpm clean
Interact via Browser
After Eliza starts, you can run:


pnpm start:client
and open the displayed URL to chat with your agent in a web UI.

Modify Character
Default Character
Open packages/core/src/defaultCharacter.ts to make changes.
Load Custom Characters

pnpm start --characters="path/to/your/character.json"
Connect with X
In your character file:
json

"clients": ["twitter"]
Additional Requirements
If you see an error about image processing (Sharp), install it:

bash

pnpm install --include=optional sharp
Automatic Start Script
bash

sh scripts/start.sh
This script handles environment setup, dependencies, and character management. For more details, see our Start Script Guide.

Deploy Eliza / DeepPolls in One Click
Use Fleek to deploy Eliza in one click. This approach simplifies setup for non-developers. You can:

Start with a template
Build a character file from scratch
Upload a pre-made character file
Click here to get started!

Community & Contact
GitHub Issues – Report bugs or feature requests.
Discord – Share applications and chat with the community.
Citation
We now have a paper you can cite for the Eliza OS:

bibtex

@article{walters2025eliza,
  title={Eliza: A Web3 friendly AI Agent Operating System},
  author={Walters, Shaw and Gao, Sam and Nerd, Shakker and Da, Feng and Williams, Warren and Meng, Ting-Chien and Han, Hunter and He, Frank and Zhang, Allen and Wu, Ming and others},
  journal={arXiv preprint arXiv:2501.06781},
  year={2025}
}
