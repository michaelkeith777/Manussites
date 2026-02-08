import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import * as db from "./db";
import * as kieApi from "./services/kieApi";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Sports Trending Topics Discovery - Basketball & Football (Pro + College)
  trending: router({
    discover: protectedProcedure
      .input(z.object({
        sport: z.enum(["basketball", "football", "ncaa-basketball", "ncaa-football", "all"]).default("all"),
        category: z.enum(["current-news", "player-highlights", "legends", "rookies", "records", "march-madness", "cfp", "all"]).default("all"),
        team: z.string().optional(),
      }).optional())
      .mutation(async ({ input }) => {
        const sport = input?.sport || "all";
        const category = input?.category || "all";
        const team = input?.team;
        
        const sportFilters: Record<string, string> = {
          "all": "NBA basketball, NFL football, NCAA basketball, and NCAA football",
          "basketball": "NBA basketball only",
          "football": "NFL football only",
          "ncaa-basketball": "NCAA college basketball only (March Madness, top programs)",
          "ncaa-football": "NCAA college football only (CFP, bowl games, top programs)"
        };
        const sportFilter = sportFilters[sport] || sportFilters["all"];
        const categoryFilter = category === "all" ? "all categories" : category;
        const teamFilter = team ? `Focus specifically on the ${team} team and their players.` : "";
        
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert sports analyst AI specializing in NBA basketball, NFL football, NCAA college basketball, and NCAA college football. Your job is to identify the HOTTEST and most compelling sports topics that would make amazing trading card artwork.

You have deep knowledge of:
- Current NBA and NFL news, trades, and game highlights
- NCAA March Madness basketball and College Football Playoff
- Star players and their signature moments (pro and college)
- Rising rookies and breakout college stars
- Legendary players and iconic historical moments
- Record-breaking achievements and milestones
- Player rivalries and memorable matchups
- Championship moments and playoff drama
- Top college programs (Duke, Kentucky, Alabama, Ohio State, etc.)

For each topic, provide:
1. The player name or event
2. Why this is HOT right now or historically significant
3. Visual description for trading card artwork (action pose, celebration, iconic moment)
4. The sport (basketball, football, ncaa-basketball, ncaa-football)
5. Category (current-news, player-highlights, legends, rookies, records, march-madness, cfp)

Focus on: ${sportFilter}
Category focus: ${categoryFilter}
${teamFilter}

Return 15-20 topics as JSON:
{
  "topics": [
    {
      "topic": "Player Name - Specific Moment/Achievement",
      "playerName": "Full Player Name",
      "sport": "basketball" or "football",
      "category": "current-news|player-highlights|legends|rookies|records",
      "description": "Why this is trending/significant",
      "visualDescription": "Detailed visual description for artwork (pose, action, setting)",
      "team": "Team Name",
      "score": 85
    }
  ]
}

Score from 1-100 based on current relevance and visual appeal for trading cards. Prioritize:
- Players in the news RIGHT NOW
- Iconic moments that fans love
- Visually dynamic poses and actions
- Championship and playoff moments
- Record-breaking achievements`
            },
            {
              role: "user",
              content: `Generate the hottest ${sportFilter} topics for trading card artwork. Focus on ${categoryFilter}. ${teamFilter ? teamFilter : 'Include current superstars, trending news, and legendary moments'} that would make visually stunning cards. Think about what sports card collectors would want!`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "sports_trending_topics",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  topics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        topic: { type: "string" },
                        playerName: { type: "string" },
                        sport: { type: "string" },
                        category: { type: "string" },
                        description: { type: "string" },
                        visualDescription: { type: "string" },
                        team: { type: "string" },
                        score: { type: "integer" }
                      },
                      required: ["topic", "playerName", "sport", "category", "description", "visualDescription", "team", "score"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["topics"],
                additionalProperties: false
              }
            }
          }
        });

        try {
          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') throw new Error("No response from LLM");
          
          const parsed = JSON.parse(content);
          return {
            topics: parsed.topics.sort((a: { score: number }, b: { score: number }) => b.score - a.score),
          };
        } catch (error) {
          console.error("Failed to parse sports topics:", error);
          // Fallback with popular sports topics
          return {
            topics: [
              { topic: "LeBron James - All-Time Scoring Record", playerName: "LeBron James", sport: "basketball", category: "records", description: "NBA's all-time leading scorer", visualDescription: "LeBron in Lakers purple and gold, arms raised in celebration, confetti falling, spotlight illuminating him", team: "Los Angeles Lakers", score: 98 },
              { topic: "Patrick Mahomes - Super Bowl MVP", playerName: "Patrick Mahomes", sport: "football", category: "player-highlights", description: "Chiefs quarterback and Super Bowl champion", visualDescription: "Mahomes throwing a deep pass, arm extended, dynamic action pose with stadium lights", team: "Kansas City Chiefs", score: 96 },
              { topic: "Stephen Curry - Three-Point King", playerName: "Stephen Curry", sport: "basketball", category: "records", description: "Greatest shooter in NBA history", visualDescription: "Curry releasing his signature high-arc three-pointer, perfect shooting form, splash effect", team: "Golden State Warriors", score: 95 },
              { topic: "Travis Kelce - Tight End Dominance", playerName: "Travis Kelce", sport: "football", category: "player-highlights", description: "Record-breaking tight end", visualDescription: "Kelce making a spectacular catch, fully extended, crowd roaring in background", team: "Kansas City Chiefs", score: 93 },
              { topic: "Michael Jordan - The GOAT", playerName: "Michael Jordan", sport: "basketball", category: "legends", description: "Basketball's greatest legend", visualDescription: "Jordan in his iconic tongue-out dunk pose, soaring through the air, Bulls red jersey", team: "Chicago Bulls", score: 99 },
            ],
          };
        }
      }),

    // Player Search - Find specific players by name
    searchPlayer: protectedProcedure
      .input(z.object({
        query: z.string().min(1).max(100),
        sport: z.enum(["basketball", "football", "ncaa-basketball", "ncaa-football", "all"]).default("all"),
      }))
      .mutation(async ({ input }) => {
        const sportContext = input.sport === "all" 
          ? "NBA, NFL, NCAA basketball, and NCAA football" 
          : input.sport === "basketball" ? "NBA" 
          : input.sport === "football" ? "NFL"
          : input.sport === "ncaa-basketball" ? "NCAA basketball"
          : "NCAA football";

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a sports database expert. Search for players matching the query in ${sportContext}. Return detailed player information for trading card creation.

For each matching player, provide:
- Full name
- Current or most famous team
- Sport (basketball, football, ncaa-basketball, ncaa-football)
- Position
- Notable achievements or why they're famous
- Visual description for trading card artwork
- Relevance score (1-100)

Return up to 10 matching players as JSON:
{
  "players": [
    {
      "playerName": "Full Name",
      "team": "Team Name",
      "sport": "basketball|football|ncaa-basketball|ncaa-football",
      "position": "Position",
      "description": "Notable achievements",
      "visualDescription": "Visual description for artwork",
      "score": 95
    }
  ]
}`
            },
            {
              role: "user",
              content: `Search for players matching: "${input.query}" in ${sportContext}`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "player_search_results",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  players: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        playerName: { type: "string" },
                        team: { type: "string" },
                        sport: { type: "string" },
                        position: { type: "string" },
                        description: { type: "string" },
                        visualDescription: { type: "string" },
                        score: { type: "integer" }
                      },
                      required: ["playerName", "team", "sport", "position", "description", "visualDescription", "score"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["players"],
                additionalProperties: false
              }
            }
          }
        });

        try {
          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') throw new Error("No response from LLM");
          
          const parsed = JSON.parse(content);
          const players = Array.isArray(parsed.players) ? parsed.players : [];
          return {
            players: players.sort((a: { score: number }, b: { score: number }) => b.score - a.score),
          };
        } catch (error) {
          console.error("Failed to search players:", error);
          return { players: [] };
        }
      }),

    // Get list of teams for filtering
    getTeams: publicProcedure
      .input(z.object({
        sport: z.enum(["basketball", "football", "ncaa-basketball", "ncaa-football", "all"]).default("all"),
      }).optional())
      .query(({ input }) => {
        const sport = input?.sport || "all";
        
        const nbaTeams = [
          "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets", "Chicago Bulls",
          "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets", "Detroit Pistons", "Golden State Warriors",
          "Houston Rockets", "Indiana Pacers", "LA Clippers", "Los Angeles Lakers", "Memphis Grizzlies",
          "Miami Heat", "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks",
          "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns", "Portland Trail Blazers",
          "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors", "Utah Jazz", "Washington Wizards"
        ];
        
        const nflTeams = [
          "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills", "Carolina Panthers",
          "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns", "Dallas Cowboys", "Denver Broncos",
          "Detroit Lions", "Green Bay Packers", "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars",
          "Kansas City Chiefs", "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins",
          "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants", "New York Jets",
          "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers", "Seattle Seahawks", "Tampa Bay Buccaneers",
          "Tennessee Titans", "Washington Commanders"
        ];
        
        const ncaaBasketballTeams = [
          "Duke Blue Devils", "Kentucky Wildcats", "North Carolina Tar Heels", "Kansas Jayhawks", "UCLA Bruins",
          "Gonzaga Bulldogs", "Villanova Wildcats", "Michigan State Spartans", "Louisville Cardinals", "Indiana Hoosiers",
          "Syracuse Orange", "UConn Huskies", "Arizona Wildcats", "Purdue Boilermakers", "Houston Cougars",
          "Baylor Bears", "Tennessee Volunteers", "Auburn Tigers", "Creighton Bluejays", "Alabama Crimson Tide"
        ];
        
        const ncaaFootballTeams = [
          "Alabama Crimson Tide", "Ohio State Buckeyes", "Georgia Bulldogs", "Clemson Tigers", "Michigan Wolverines",
          "Oklahoma Sooners", "LSU Tigers", "Notre Dame Fighting Irish", "Texas Longhorns", "USC Trojans",
          "Florida State Seminoles", "Penn State Nittany Lions", "Oregon Ducks", "Florida Gators", "Auburn Tigers",
          "Tennessee Volunteers", "Texas A&M Aggies", "Miami Hurricanes", "Wisconsin Badgers", "Washington Huskies"
        ];
        
        const teams: { name: string; sport: string; league: string }[] = [];
        
        if (sport === "all" || sport === "basketball") {
          teams.push(...nbaTeams.map(name => ({ name, sport: "basketball", league: "NBA" })));
        }
        if (sport === "all" || sport === "football") {
          teams.push(...nflTeams.map(name => ({ name, sport: "football", league: "NFL" })));
        }
        if (sport === "all" || sport === "ncaa-basketball") {
          teams.push(...ncaaBasketballTeams.map(name => ({ name, sport: "ncaa-basketball", league: "NCAA Basketball" })));
        }
        if (sport === "all" || sport === "ncaa-football") {
          teams.push(...ncaaFootballTeams.map(name => ({ name, sport: "ncaa-football", league: "NCAA Football" })));
        }
        
        return { teams };
      }),
  }),

  // Prompt Generation - Sports Trading Card Artwork
  prompts: router({
    generate: protectedProcedure
      .input(z.object({
        topic: z.string().min(1).max(500),
        playerName: z.string().optional(),
        team: z.string().optional(),
        sport: z.enum(["basketball", "football"]).optional(),
        visualDescription: z.string().optional(),
        style: z.enum(["realistic", "dynamic", "vintage", "modern", "artistic", "action"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const style = input.style || "dynamic";
        const sportContext = input.sport ? `${input.sport} player` : "athlete";
        const playerInfo = input.playerName ? `Player: ${input.playerName}` : "";
        const teamInfo = input.team ? `Team: ${input.team}` : "";
        const visualHint = input.visualDescription || "";
        
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert sports trading card artwork prompt engineer. You specialize in creating stunning, dynamic prompts for NBA basketball and NFL football player artwork.

IMPORTANT: Create prompts for the ARTWORK ONLY - do NOT include any card frames, borders, text boxes, stats, player names as text, jersey numbers as text, or card template elements. The image should be pure artwork of the athlete in action.

Your prompts should capture:
1. The athlete's dynamic pose, movement, and athletic prowess
2. Accurate team colors and uniform details (without readable text/numbers)
3. Dramatic sports lighting - stadium lights, spotlights, motion blur
4. The intensity and emotion of the sport
5. High-energy action moments - dunks, catches, throws, celebrations
6. Professional sports photography aesthetic
7. Portrait or action composition that works well in a 2:3 vertical format

Style variations:
- "realistic": Photorealistic, like a professional sports photograph
- "dynamic": Exaggerated motion, energy lines, dramatic angles
- "vintage": Classic trading card aesthetic, warm tones, retro feel
- "modern": Clean, sharp, contemporary sports design
- "artistic": Painterly, stylized, artistic interpretation
- "action": Peak action moment, frozen in time, maximum intensity

DO NOT include: card borders, frames, text overlays, jersey numbers as readable text, player names as text, stats, or any card template elements.

The style requested is: ${style}
${playerInfo}
${teamInfo}
Visual context: ${visualHint}

Return your response as JSON:
{
  "prompt": "The full detailed prompt for the sports artwork (150-300 words)",
  "shortDescription": "A 1-2 sentence summary of the artwork"
}`
            },
            {
              role: "user",
              content: `Create a detailed image generation prompt for a sports trading card featuring: "${input.topic}"

This is a ${sportContext}. Create an epic, dynamic artwork prompt that would make collectors excited. Focus on the athletic moment, team colors, and dramatic sports atmosphere.`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "image_prompt",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  prompt: { type: "string" },
                  shortDescription: { type: "string" }
                },
                required: ["prompt", "shortDescription"],
                additionalProperties: false
              }
            }
          }
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== 'string') throw new Error("Failed to generate prompt");
        
        const parsed = JSON.parse(content);
        return {
          prompt: parsed.prompt,
          shortDescription: parsed.shortDescription,
          topic: input.topic,
          style: style,
        };
      }),

    enhance: protectedProcedure
      .input(z.object({
        prompt: z.string().min(1).max(5000),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert at enhancing AI image generation prompts. Take the given prompt and make it more detailed, vivid, and optimized for high-quality image generation.

Enhancements should:
1. Add more specific visual details
2. Improve lighting and atmosphere descriptions
3. Add artistic style references
4. Include quality boosters like "highly detailed", "8k resolution", "masterpiece"
5. Maintain the original concept while elevating the description

Return your response as JSON:
{
  "enhancedPrompt": "The enhanced prompt",
  "improvements": ["List of improvements made"]
}`
            },
            {
              role: "user",
              content: `Enhance this image prompt: "${input.prompt}"`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "enhanced_prompt",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  enhancedPrompt: { type: "string" },
                  improvements: { type: "array", items: { type: "string" } }
                },
                required: ["enhancedPrompt", "improvements"],
                additionalProperties: false
              }
            }
          }
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== 'string') throw new Error("Failed to enhance prompt");
        
        const parsed = JSON.parse(content);
        return {
          enhancedPrompt: parsed.enhancedPrompt,
          improvements: parsed.improvements,
          originalPrompt: input.prompt,
        };
      }),
  }),

  // Image Generation
  images: router({
    generate: protectedProcedure
      .input(z.object({
        prompt: z.string().min(1).max(10000),
        topic: z.string().optional(),
        model: z.enum(["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"]).default("nano-banana"),
        aspectRatio: z.enum(["2:3", "3:4", "1:1", "3:2", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"]).default("2:3"),
        resolution: z.enum(["1K", "2K", "4K"]).default("1K"),
        count: z.number().min(1).max(10).default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        // Get user's custom API key if available
        const userApiKey = await db.getUserApiKey(userId);
        
        const sessionId = await db.createGenerationSession({
          userId,
          topic: input.topic || "Custom",
          basePrompt: input.prompt,
          model: input.model,
          imageCount: input.count,
          status: "generating",
        });

        const tasks: { id: number; taskId: string }[] = [];
        
        for (let i = 0; i < input.count; i++) {
          const variedPrompt = input.count > 1 
            ? `${input.prompt} (variation ${i + 1})`
            : input.prompt;

          try {
            // Use user's API key if available, otherwise fall back to default
            const response = await kieApi.createImageTask({
              prompt: variedPrompt,
              model: input.model,
              aspectRatio: input.aspectRatio,
              resolution: input.resolution,
            }, userApiKey || undefined);

            if (response.code === 200 && response.data?.taskId) {
              const imageId = await db.createGeneratedImage({
                userId,
                taskId: response.data.taskId,
                prompt: input.prompt,
                originalTopic: input.topic,
                model: input.model,
                aspectRatio: input.aspectRatio,
                resolution: input.resolution,
                status: "generating",
              });
              
              tasks.push({ id: imageId, taskId: response.data.taskId });
            } else {
              console.error("Failed to create task:", response);
            }
          } catch (error) {
            console.error("Error creating image task:", error);
          }
        }

        return {
          sessionId,
          tasks,
          totalCount: input.count,
        };
      }),

    // Multi-Model Generation - generate same prompt across multiple models simultaneously
    generateMultiModel: protectedProcedure
      .input(z.object({
        prompt: z.string().min(1).max(10000),
        topic: z.string().optional(),
        models: z.array(z.enum(["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"])).min(1).max(4),
        aspectRatio: z.enum(["2:3", "3:4", "1:1", "3:2", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"]).default("2:3"),
        resolution: z.enum(["1K", "2K", "4K"]).default("1K"),
        countPerModel: z.number().min(1).max(4).default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const userApiKey = await db.getUserApiKey(userId);
        
        const allTasks: { id: number; taskId: string; model: string }[] = [];
        
        // Generate images for each selected model in parallel
        const modelPromises = input.models.map(async (modelName) => {
          const sessionId = await db.createGenerationSession({
            userId,
            topic: input.topic || "Custom",
            basePrompt: input.prompt,
            model: modelName,
            imageCount: input.countPerModel,
            status: "generating",
          });
          
          const modelTasks: { id: number; taskId: string; model: string }[] = [];
          
          for (let i = 0; i < input.countPerModel; i++) {
            const variedPrompt = input.countPerModel > 1
              ? `${input.prompt} (variation ${i + 1})`
              : input.prompt;
            
            try {
              const response = await kieApi.createImageTask({
                prompt: variedPrompt,
                model: modelName,
                aspectRatio: input.aspectRatio,
                resolution: input.resolution,
              }, userApiKey || undefined);
              
              if (response.code === 200 && response.data?.taskId) {
                const imageId = await db.createGeneratedImage({
                  userId,
                  taskId: response.data.taskId,
                  prompt: input.prompt,
                  originalTopic: input.topic,
                  model: modelName,
                  aspectRatio: input.aspectRatio,
                  resolution: input.resolution,
                  status: "generating",
                });
                modelTasks.push({ id: imageId, taskId: response.data.taskId, model: modelName });
              } else {
                console.error(`Failed to create task for model ${modelName}:`, response);
              }
            } catch (error) {
              console.error(`Error creating image task for model ${modelName}:`, error);
            }
          }
          
          return { sessionId, tasks: modelTasks };
        });
        
        const results = await Promise.all(modelPromises);
        
        for (const result of results) {
          allTasks.push(...result.tasks);
        }
        
        return {
          tasks: allTasks,
          totalCount: allTasks.length,
          models: input.models,
        };
      }),

    checkStatus: protectedProcedure
      .input(z.object({
        taskIds: z.array(z.string()),
        model: z.enum(["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const results: Array<{
          taskId: string;
          status: string;
          imageUrl?: string;
          error?: string;
        }> = [];
        
        // Get user's API key if available
        const userApiKey = await db.getUserApiKey(ctx.user.id);

        for (const taskId of input.taskIds) {
          try {
            // First check if image is already completed in database
            const existingImage = await db.getImageByTaskId(taskId);
            if (existingImage && existingImage.status === "completed" && existingImage.imageUrl) {
              console.log(`[checkStatus] Task ${taskId} already completed in DB, returning cached result`);
              results.push({
                taskId,
                status: "success",
                imageUrl: existingImage.imageUrl,
              });
              continue;
            }
            
            // Get the model from the stored image if not provided
            let modelToUse = input.model;
            if (!modelToUse && existingImage) {
              modelToUse = existingImage.model as typeof input.model;
            }
            
            console.log(`[checkStatus] Calling kieApi.getTaskStatus for task ${taskId}, model: ${modelToUse}`);
            const status = await kieApi.getTaskStatus(taskId, modelToUse, userApiKey || undefined);
            console.log(`[checkStatus] API response for ${taskId}:`, JSON.stringify(status, null, 2));
            
            if (status.code === 200 && status.data) {
              const { state, resultJson, failMsg } = status.data;
              console.log(`[checkStatus] Task ${taskId} state: ${state}, resultJson: ${resultJson ? 'present' : 'empty'}`);
              
              let imageUrl: string | undefined;
              
              if (state === "success" && resultJson) {
                console.log(`[checkStatus] Task ${taskId} resultJson:`, resultJson);
                const result = kieApi.parseTaskResult(resultJson);
                console.log(`[checkStatus] Task ${taskId} parsed resultUrls:`, result.resultUrls);
                imageUrl = result.resultUrls[0];
                console.log(`[checkStatus] Task ${taskId} imageUrl:`, imageUrl);
                
                const image = await db.getImageByTaskId(taskId);
                if (image && image.status !== "completed") {
                  if (imageUrl) {
                    try {
                      const imageResponse = await fetch(imageUrl);
                      const imageBuffer = await imageResponse.arrayBuffer();
                      const s3Key = `images/${ctx.user.id}/${nanoid()}.png`;
                      const { url: s3Url } = await storagePut(s3Key, Buffer.from(imageBuffer), "image/png");
                      
                      await db.updateGeneratedImage(image.id, {
                        status: "completed",
                        imageUrl: s3Url,
                        s3Key,
                        completedAt: new Date(),
                      });
                      
                      imageUrl = s3Url;
                    } catch (err) {
                      console.error("Failed to store image in S3:", err);
                      await db.updateGeneratedImage(image.id, {
                        status: "completed",
                        imageUrl,
                        completedAt: new Date(),
                      });
                    }
                  }
                }
              } else if (state === "fail") {
                const image = await db.getImageByTaskId(taskId);
                if (image) {
                  await db.updateGeneratedImage(image.id, {
                    status: "failed",
                    failReason: failMsg,
                  });
                }
              }

              results.push({
                taskId,
                status: state,
                imageUrl,
                error: state === "fail" ? (failMsg || undefined) : undefined,
              });
            } else {
              results.push({
                taskId,
                status: "unknown",
                error: status.message,
              });
            }
          } catch (error) {
            results.push({
              taskId,
              status: "error",
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        return { results };
      }),

    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        favoritesOnly: z.boolean().default(false),
      }))
      .query(async ({ ctx, input }) => {
        if (input.favoritesOnly) {
          return db.getFavoriteImages(ctx.user.id);
        }
        return db.getGeneratedImagesByUser(ctx.user.id, input.limit, input.offset);
      }),

    toggleFavorite: protectedProcedure
      .input(z.object({
        imageId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const newValue = await db.toggleFavorite(input.imageId, ctx.user.id);
        return { isFavorite: newValue };
      }),

    delete: protectedProcedure
      .input(z.object({
        imageId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteImage(input.imageId, ctx.user.id);
        return { success: true };
      }),

    getById: protectedProcedure
      .input(z.object({
        imageId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        return db.getImageById(input.imageId, ctx.user.id);
      }),

    count: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserImageCount(ctx.user.id);
    }),

    // Upload existing photo to gallery
    upload: protectedProcedure
      .input(z.object({
        imageDataUrl: z.string().min(1), // base64 data URL
        fileName: z.string().default("uploaded-image"),
        prompt: z.string().default("Uploaded image"),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        // Parse the base64 data URL
        const matches = input.imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) throw new Error("Invalid image data URL");
        
        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");
        
        // Determine file extension
        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
        const s3Key = `images/${userId}/upload-${nanoid()}.${ext}`;
        
        // Upload to S3
        const { url: s3Url } = await storagePut(s3Key, buffer, contentType);
        
        // Create the image record in DB
        const imageId = await db.createGeneratedImage({
          userId,
          taskId: `upload-${nanoid()}`,
          prompt: input.prompt || input.fileName,
          originalTopic: "Uploaded",
          model: "nano-banana",
          aspectRatio: "1:1",
          resolution: "1K",
          status: "completed",
          imageUrl: s3Url,
          s3Key,
        });
        
        // Mark as completed
        await db.updateGeneratedImage(imageId, {
          completedAt: new Date(),
        });
        
        return { id: imageId, imageUrl: s3Url };
      }),

    // Proxy image for canvas rendering (bypasses CORS)
    proxy: protectedProcedure
      .input(z.object({
        url: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        const response = await fetch(input.url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const contentType = response.headers.get("content-type") || "image/png";
        return { dataUrl: `data:${contentType};base64,${base64}` };
      }),
  }),

  // User Settings
  settings: router({
    getApiKeyStatus: protectedProcedure.query(async ({ ctx }) => {
      const apiKey = await db.getUserApiKey(ctx.user.id);
      if (!apiKey) {
        return { hasApiKey: false, maskedKey: null };
      }
      // Mask the API key, showing only first 4 and last 4 characters
      const maskedKey = apiKey.length > 8 
        ? `${apiKey.slice(0, 4)}${'*'.repeat(apiKey.length - 8)}${apiKey.slice(-4)}`
        : '*'.repeat(apiKey.length);
      return { hasApiKey: true, maskedKey };
    }),

    saveApiKey: protectedProcedure
      .input(z.object({
        apiKey: z.string().min(1).max(500),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.saveUserApiKey(ctx.user.id, input.apiKey);
        return { success: true };
      }),

    deleteApiKey: protectedProcedure.mutation(async ({ ctx }) => {
      await db.deleteUserApiKey(ctx.user.id);
      return { success: true };
    }),

    validateApiKey: protectedProcedure
      .input(z.object({
        apiKey: z.string().min(1).max(500),
      }))
      .mutation(async ({ input }) => {
        // Try to make a simple API call to validate the key
        try {
          const response = await fetch("https://api.kie.ai/api/v1/jobs/recordInfo?taskId=test", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${input.apiKey}`,
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          // If we get a response (even an error about invalid taskId), the key is valid
          // Invalid keys return 401 or similar auth errors
          if (response.status === 401 || response.status === 403) {
            return { valid: false, error: "Invalid API key" };
          }
          return { valid: true };
        } catch (error) {
          return { valid: false, error: "Failed to validate API key" };
        }
      }),

    // Onboarding
    getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
      const isComplete = await db.isOnboardingComplete(ctx.user.id);
      const hasApiKey = !!(await db.getUserApiKey(ctx.user.id));
      return { isComplete, hasApiKey };
    }),

    completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
      await db.completeOnboarding(ctx.user.id);
      return { success: true };
    }),
  }),

  // Prompt History
  promptHistory: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(20),
      }).optional())
      .query(async ({ ctx, input }) => {
        return db.getPromptHistory(ctx.user.id, input?.limit || 20);
      }),

    save: protectedProcedure
      .input(z.object({
        topic: z.string().min(1).max(500),
        sport: z.string().optional(),
        playerName: z.string().optional(),
        team: z.string().optional(),
        prompt: z.string().min(1).max(10000),
        enhancedPrompt: z.string().optional(),
        artStyle: z.string().optional(),
        model: z.enum(["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"]).default("nano-banana"),
        aspectRatio: z.string().default("2:3"),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.savePromptToHistory({
          userId: ctx.user.id,
          topic: input.topic,
          sport: input.sport || null,
          playerName: input.playerName || null,
          team: input.team || null,
          prompt: input.prompt,
          enhancedPrompt: input.enhancedPrompt || null,
          artStyle: input.artStyle || null,
          model: input.model,
          aspectRatio: input.aspectRatio,
        });
        return { id };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.deletePromptFromHistory(input.id, ctx.user.id);
        return { success: true };
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearPromptHistory(ctx.user.id);
      return { success: true };
    }),
  }),

  // Watermark Presets
  watermarkPresets: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const presets = await db.getWatermarkPresets(ctx.user.id);
      return presets;
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const preset = await db.getWatermarkPresetById(input.id, ctx.user.id);
        return preset;
      }),

    getDefault: protectedProcedure.query(async ({ ctx }) => {
      const preset = await db.getDefaultWatermarkPreset(ctx.user.id);
      return preset ?? null;
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(128),
        type: z.enum(["text", "image"]).default("text"),
        text: z.string().optional(),
        fontSize: z.number().min(8).max(200).default(24),
        fontFamily: z.string().default("Arial"),
        color: z.string().default("#ffffff"),
        opacity: z.number().min(0).max(100).default(50),
        position: z.string().default("bottom-right"),
        rotation: z.number().min(-180).max(180).default(0),
        imageUrl: z.string().optional(),
        imageSize: z.number().min(10).max(500).default(100),
        customX: z.number().min(0).max(100).default(50),
        customY: z.number().min(0).max(100).default(50),
        sizePreset: z.string().default("medium"),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        // If this is set as default, unset other defaults first
        if (input.isDefault) {
          const existingPresets = await db.getWatermarkPresets(ctx.user.id);
          for (const preset of existingPresets) {
            if (preset.isDefault) {
              await db.updateWatermarkPreset(preset.id, ctx.user.id, { isDefault: false });
            }
          }
        }
        
        const id = await db.createWatermarkPreset({
          userId: ctx.user.id,
          name: input.name,
          type: input.type,
          text: input.text || null,
          fontSize: input.fontSize,
          fontFamily: input.fontFamily,
          color: input.color,
          opacity: input.opacity,
          position: input.position,
          rotation: input.rotation,
          imageUrl: input.imageUrl || null,
          imageSize: input.imageSize,
          customX: input.customX,
          customY: input.customY,
          sizePreset: input.sizePreset,
          isDefault: input.isDefault,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(128).optional(),
        type: z.enum(["text", "image"]).optional(),
        text: z.string().optional(),
        fontSize: z.number().min(8).max(200).optional(),
        fontFamily: z.string().optional(),
        color: z.string().optional(),
        opacity: z.number().min(0).max(100).optional(),
        position: z.string().optional(),
        rotation: z.number().min(-180).max(180).optional(),
        imageUrl: z.string().optional(),
        imageSize: z.number().min(10).max(500).optional(),
        customX: z.number().min(0).max(100).optional(),
        customY: z.number().min(0).max(100).optional(),
        sizePreset: z.string().optional(),
        isDefault: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        
        // If setting as default, unset other defaults first
        if (updates.isDefault) {
          const existingPresets = await db.getWatermarkPresets(ctx.user.id);
          for (const preset of existingPresets) {
            if (preset.isDefault && preset.id !== id) {
              await db.updateWatermarkPreset(preset.id, ctx.user.id, { isDefault: false });
            }
          }
        }
        
        await db.updateWatermarkPreset(id, ctx.user.id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteWatermarkPreset(input.id, ctx.user.id);
        return { success: true };
      }),

    setDefault: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.setDefaultWatermarkPreset(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Card Collections
  collections: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const collections = await db.getCollections(ctx.user.id);
      return collections;
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const collection = await db.getCollectionById(input.id, ctx.user.id);
        return collection;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(128),
        description: z.string().optional(),
        theme: z.string().optional(),
        borderStyle: z.string().default("classic"),
        borderColor: z.string().default("#ffd700"),
        maxCards: z.number().default(100),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createCollection({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
          theme: input.theme || null,
          borderStyle: input.borderStyle,
          borderColor: input.borderColor,
          maxCards: input.maxCards,
          cardCount: 0,
          isPublic: false,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(128).optional(),
        description: z.string().optional(),
        theme: z.string().optional(),
        borderStyle: z.string().optional(),
        borderColor: z.string().optional(),
        maxCards: z.number().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await db.updateCollection(id, ctx.user.id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteCollection(input.id, ctx.user.id);
        return { success: true };
      }),

    addCard: protectedProcedure
      .input(z.object({
        collectionId: z.number(),
        imageId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const cardNumber = await db.addCardToCollection(input.collectionId, input.imageId, ctx.user.id);
        return { cardNumber };
      }),

    removeCard: protectedProcedure
      .input(z.object({
        collectionId: z.number(),
        imageId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.removeCardFromCollection(input.collectionId, input.imageId, ctx.user.id);
        return { success: true };
      }),
  }),

  // Card Decks
  decks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const decks = await db.getDecks(ctx.user.id);
      return decks;
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const deck = await db.getDeckById(input.id, ctx.user.id);
        return deck;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(128),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createDeck({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
          cardCount: 0,
          isPublic: false,
        });
        return { id };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteDeck(input.id, ctx.user.id);
        return { success: true };
      }),

    addCard: protectedProcedure
      .input(z.object({
        deckId: z.number(),
        imageId: z.number(),
        quantity: z.number().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addCardToDeck(input.deckId, input.imageId, input.quantity, ctx.user.id);
        return { success: true };
      }),

    removeCard: protectedProcedure
      .input(z.object({
        deckId: z.number(),
        imageId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.removeCardFromDeck(input.deckId, input.imageId, ctx.user.id);
        return { success: true };
      }),

    getCards: protectedProcedure
      .input(z.object({ deckId: z.number() }))
      .query(async ({ ctx, input }) => {
        const cards = await db.getDeckCards(input.deckId, ctx.user.id);
        return cards;
      }),
  }),

  // Card Backs
  cardBacks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const backs = await db.getCardBacks(ctx.user.id);
      return backs;
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(128),
        backgroundColor: z.string().default("#1a1a2e"),
        pattern: z.string().default("solid"),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createCardBack({
          userId: ctx.user.id,
          name: input.name,
          backgroundColor: input.backgroundColor,
          pattern: input.pattern,
          isDefault: false,
        });
        return { id };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteCardBack(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Non-Sports Trending Topics Discovery
  nonSportsTrending: router({
    discover: protectedProcedure
      .input(z.object({
        category: z.enum(["pop-culture", "fantasy", "sci-fi", "nature", "mythology", "horror", "anime", "historical", "abstract", "all"]).default("all"),
      }).optional())
      .mutation(async ({ input }) => {
        const category = input?.category || "all";
        
        const categoryDescriptions: Record<string, string> = {
          "all": "all non-sports categories including pop culture, fantasy, sci-fi, nature, mythology, horror, anime, historical figures, and abstract art",
          "pop-culture": "pop culture, movies, TV shows, music, celebrities, viral internet trends",
          "fantasy": "fantasy worlds, dragons, wizards, elves, epic battles, magical creatures",
          "sci-fi": "science fiction, space exploration, robots, cyberpunk, futuristic cities, aliens",
          "nature": "nature, wildlife, landscapes, animals, underwater scenes, weather phenomena",
          "mythology": "mythology, gods, legends, ancient civilizations, mythical creatures",
          "horror": "horror, monsters, dark fantasy, creepy scenes, supernatural entities",
          "anime": "anime-style art, manga characters, Japanese pop culture, mecha",
          "historical": "historical figures, famous events, ancient warriors, historical scenes",
          "abstract": "abstract art, surreal compositions, geometric patterns, psychedelic visuals",
        };
        const categoryDesc = categoryDescriptions[category] || categoryDescriptions["all"];
        
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a creative AI specializing in generating trending and visually stunning topics for trading card artwork. Your focus is on NON-SPORTS topics.

You have deep knowledge of:
- Pop culture: movies, TV shows, music, celebrities, viral trends
- Fantasy: dragons, wizards, epic battles, magical worlds
- Sci-fi: space, robots, cyberpunk, futuristic technology
- Nature: wildlife, landscapes, underwater scenes, weather
- Mythology: gods, legends, mythical creatures, ancient civilizations
- Horror: monsters, dark fantasy, supernatural entities
- Anime: manga-style characters, mecha, Japanese culture
- Historical: famous figures, ancient warriors, historical events
- Abstract: surreal art, geometric patterns, psychedelic visuals
- Cryptids & Legends: Bigfoot, Loch Ness Monster, Mothman, etc.

For each topic, provide:
1. The subject name or concept
2. Why this is visually compelling or currently trending
3. Detailed visual description for trading card artwork
4. The category

Focus on: ${categoryDesc}

Return 15-20 topics as JSON:
{
  "topics": [
    {
      "topic": "Subject - Specific Scene/Concept",
      "subjectName": "Main Subject Name",
      "category": "pop-culture|fantasy|sci-fi|nature|mythology|horror|anime|historical|abstract",
      "description": "Why this is compelling/trending",
      "visualDescription": "Detailed visual description for artwork (pose, action, setting, mood)",
      "tags": "comma-separated tags",
      "score": 85
    }
  ]
}

Score from 1-100 based on visual appeal and current popularity. Prioritize:
- Visually stunning and dynamic compositions
- Currently trending or timeless fan favorites
- Subjects that make amazing collectible card artwork
- Diverse range of topics within the category`
            },
            {
              role: "user",
              content: `Generate the most visually stunning and trending non-sports topics for trading card artwork. Focus on ${categoryDesc}. Include a mix of currently trending subjects and timeless fan favorites that would make amazing collectible cards!`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "nonsports_trending_topics",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  topics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        topic: { type: "string" },
                        subjectName: { type: "string" },
                        category: { type: "string" },
                        description: { type: "string" },
                        visualDescription: { type: "string" },
                        tags: { type: "string" },
                        score: { type: "integer" }
                      },
                      required: ["topic", "subjectName", "category", "description", "visualDescription", "tags", "score"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["topics"],
                additionalProperties: false
              }
            }
          }
        });

        try {
          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') throw new Error("No response from LLM");
          
          const parsed = JSON.parse(content);
          return {
            topics: parsed.topics.sort((a: { score: number }, b: { score: number }) => b.score - a.score),
          };
        } catch (error) {
          console.error("Failed to parse non-sports topics:", error);
          return {
            topics: [
              { topic: "Bigfoot - Forest Encounter", subjectName: "Bigfoot", category: "mythology", description: "The legendary cryptid spotted in the Pacific Northwest", visualDescription: "Massive Bigfoot creature running through misty old-growth forest, moonlight filtering through trees, dramatic shadows, pine needles flying", tags: "cryptid,bigfoot,forest,mystery", score: 95 },
              { topic: "Dragon - Mountain Fortress", subjectName: "Ancient Dragon", category: "fantasy", description: "A majestic dragon guarding its mountain lair", visualDescription: "Enormous dragon perched on a mountain peak, wings spread wide, breathing fire into the sunset sky, treasure glinting below", tags: "dragon,fantasy,fire,mountain", score: 97 },
              { topic: "Cyberpunk City - Neon Streets", subjectName: "Cyberpunk Cityscape", category: "sci-fi", description: "Futuristic neon-lit metropolis", visualDescription: "Rain-soaked cyberpunk street with holographic billboards, neon reflections on wet pavement, flying vehicles overhead, mysterious figure in trench coat", tags: "cyberpunk,neon,city,futuristic", score: 93 },
              { topic: "Great White Shark - Ocean Depths", subjectName: "Great White Shark", category: "nature", description: "The ocean's apex predator in its element", visualDescription: "Great white shark emerging from deep blue water, jaws slightly open, sunlight rays penetrating the ocean surface above, schools of fish scattering", tags: "shark,ocean,nature,predator", score: 91 },
              { topic: "Samurai Warrior - Cherry Blossoms", subjectName: "Samurai", category: "historical", description: "A legendary warrior in feudal Japan", visualDescription: "Samurai in full armor standing beneath cherry blossom trees, katana drawn, petals swirling in the wind, misty mountain backdrop", tags: "samurai,japan,warrior,historical", score: 94 },
            ],
          };
        }
      }),
  }),

  // Non-Sports Prompt Generation
  nonSportsPrompts: router({
    generate: protectedProcedure
      .input(z.object({
        topic: z.string().min(1).max(500),
        subjectName: z.string().optional(),
        category: z.string().optional(),
        visualDescription: z.string().optional(),
        style: z.enum(["realistic", "dynamic", "vintage", "modern", "artistic", "action"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const style = input.style || "dynamic";
        const subjectInfo = input.subjectName ? `Subject: ${input.subjectName}` : "";
        const categoryInfo = input.category ? `Category: ${input.category}` : "";
        const visualHint = input.visualDescription || "";
        
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert trading card artwork prompt engineer. You specialize in creating stunning, dynamic prompts for NON-SPORTS trading card artwork covering any subject imaginable.

IMPORTANT: Create prompts for the ARTWORK ONLY - do NOT include any card frames, borders, text boxes, stats, names as text, or card template elements. The image should be pure artwork.

Your prompts should capture:
1. The subject's most dynamic and visually striking pose or moment
2. Rich environmental details and atmosphere
3. Dramatic lighting - rim lighting, volumetric light, god rays, neon glow
4. Emotion, intensity, and storytelling
5. High-energy compositions that work well in a trading card format
6. Professional illustration or photography aesthetic
7. Composition that works well in a 2:3 vertical format

Style variations:
- "realistic": Photorealistic, like a professional photograph or hyperrealistic painting
- "dynamic": Exaggerated motion, energy lines, dramatic angles
- "vintage": Classic retro aesthetic, warm tones, nostalgic feel
- "modern": Clean, sharp, contemporary design
- "artistic": Painterly, stylized, artistic interpretation
- "action": Peak action moment, frozen in time, maximum intensity

DO NOT include: card borders, frames, text overlays, readable text, stats, or any card template elements.

The style requested is: ${style}
${subjectInfo}
${categoryInfo}
Visual context: ${visualHint}

Return your response as JSON:
{
  "prompt": "The full detailed prompt for the artwork (150-300 words)",
  "shortDescription": "A 1-2 sentence summary of the artwork"
}`
            },
            {
              role: "user",
              content: `Create a detailed image generation prompt for a trading card featuring: "${input.topic}"

Create an epic, visually stunning artwork prompt that would make collectors excited. Focus on the subject, atmosphere, and dramatic composition.`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "image_prompt",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  prompt: { type: "string" },
                  shortDescription: { type: "string" }
                },
                required: ["prompt", "shortDescription"],
                additionalProperties: false
              }
            }
          }
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== 'string') throw new Error("Failed to generate prompt");
        
        const parsed = JSON.parse(content);
        return {
          prompt: parsed.prompt,
          shortDescription: parsed.shortDescription,
          topic: input.topic,
          style: style,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
