import llm from "../config/groq.confing.js";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DynamicTool } from "@langchain/core/tools";
import { MongoClient, ObjectId } from "mongodb";
import z from "zod";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("myShow");

const userBookingsQueryTool = new DynamicTool({
  name: "query_user_bookings",
  description: `
    Use this tool to query the user's movie bookings from a MongoDB database.
    You must return the aggregation pipeline as a valid JSON array, using double quotes for all keys and strings.
    Available fields are: 'user' (string), 'show' (string), 'amount' (number), 'bookedSeats' (array), 'isPaid' (boolean), and 'paymentLink' (string).

    example: how much total amount did i spent?
    pipeline: [
    {
        "$match": {
            "isPaid": true
        }
    },
    {
        "$group": {
            "_id": null,
            "totalSpent": { "$sum": "$amount" },
            "totalTickets": { "$sum": { "$size": "$bookedSeats" } }
        }
    }
    ]

    `,
  schema: z
    .string()
    .describe("A valid MongoDB aggregate pipeline as a JSON string."),
  func: async (pipelineString) => {
    console.log("Received pipeline string from LLM:", pipelineString);
    if (typeof pipelineString !== "string" || pipelineString.trim() === "") {
      return "Error: Received an empty or invalid pipeline string.";
    }
    try {
      const correctedJsonString = pipelineString.replace(/\}\s*\{/g, "}, {");
      let pipeline = JSON.parse(correctedJsonString);

      pipeline = [
        { $match: { user: "user_2yjf73buwicA6NGnzTAyNMAz1Lr" } },
        ...pipeline,
      ];

      console.log("Parsed pipeline:", JSON.stringify(pipeline, null, 2));

      const result = await db
        .collection("Booking")
        .aggregate(pipeline)
        .toArray();

      return JSON.stringify(result);
    } catch (error) {
      console.error("Error processing pipeline:", error);
      return `Error: ${error.message}`;
    }
  },
});

const tools = [userBookingsQueryTool];

const Agent = async (req, res) => {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an expert at creating MongoDB aggregation pipelines based on user questions about a user's movie booking related question.You must use the provided tool. Return only the final answer in a clear, complete sentence.",
    ],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  const agent = await createToolCallingAgent({ llm, tools, prompt });

  const executor = new AgentExecutor({ agent, tools });

  const result = await executor.invoke({
    input: "how much total amount did i spent?",
  });

  res.status(200).json({
    question: "how much total amount did i spent?",
    answer: result.output,
  });
};

export default Agent;
