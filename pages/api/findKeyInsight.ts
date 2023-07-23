import { Configuration, OpenAIApi } from "openai";
import { extract } from "@extractus/article-extractor";
import { stripHtml } from "string-strip-html";
import { NextApiHandler } from "next";
import { Redis } from "@upstash/redis";
import { URL } from "url";
import fetch from 'isomorphic-unfetch';

const ALLOWED_VIDEOS = `
Allowed Video Topics:
- Artifical Intelligence (AI) and Machine Learning (ML)
- Programming and Software Development
- Business and Entrepreneurship
- Career and Productivity
- Communication and Relationships
- Finance and Economics
- Investing and Trading
- Crypto and Blockchain
- Health and Fitness
- Psychology and Philosophy
- Science and Technology
- Music and Focus
- Motivation and Inspiration
- Health and Fitness
`

const BLOCKED_VIDEOS = `
Blocked Video Topics:
- Politics and Current Events
- UFC and MMA
- Fighting and Violence
- Gaming and Esports
- Entertainment
- Funny Compilation Videos
`

const openai = new OpenAIApi(
    new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
);

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});


// remove utm params, the most likely for us to be useless
function getCleanUrl(url: string): string {
    const parsed = new URL(url);

    for (const param of Array.from(parsed.searchParams.keys())) {
        if (param.startsWith("utm_")) {
            parsed.searchParams.delete(param);
        }
    }

    return parsed.toString();
}


async function getYouTubeVideoData(videoId: string): Promise<any> {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${process.env.YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.items[0].snippet;
}


const findKeyInsight: NextApiHandler = async (req, res) => {
    const { url } = req.body;
    const cleanUrl = getCleanUrl(url);
    console.log('>>> url', cleanUrl);

    const cached = await redis.get(cleanUrl);
    if (cached) {
        return res.status(200).send(cached);
    }

    let videoId;
    if(url.includes("shorts/")){
        videoId = url.split("shorts/")[1];
    } else {
        videoId = new URL(url).searchParams.get("v");
    }
    let videoDataStr = "";
    if (videoId) {
        const videoData = await getYouTubeVideoData(videoId);
        // videoData now contains title, description, tags of YouTube Video
        //console.log('>>> video data', videoData);
        let title = videoData.title;
        let description = videoData.description;
        let tags = ('tags' in videoData && Array.isArray(videoData.tags)) ? videoData.tags.join(", ") : '';
        let videoDataStr = "Title:\n" + title + "\nDescription:\n" + description + "\nTags:\n" + tags;
        //console.log('>>> video data str', videoDataStr);
        // GPT-3 to determine whether video fits allowed description
        const openai_request = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [{role: "user", content: `Video Description:${videoDataStr} \n\n${ALLOWED_VIDEOS} \n\n${BLOCKED_VIDEOS} \n\nBased on the Video description is this video allowed? Ouput 'YES' or 'NO', if unsure then 'NO'`}],
            temperature: 0.1,
            max_tokens: 10,
        });
        const openai_allowed_video = openai_request?.data?.choices?.[0]?.message?.content;;
        console.log('>>> open ai allowed video?', openai_allowed_video);
        if (openai_allowed_video === 'YES') {
            res.status(200).send(true)
        } else {
            res.status(200).send(false)
        }
    } else {
        return res.status(400).send("Couldn't extract video data");
    }

    // const finalResult = insight1.data.choices[0].text;

    // await redis.set(cleanUrl, finalResult);

    // res.status(200).send(finalResult);
};

export default findKeyInsight;