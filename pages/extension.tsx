//extension.tsx
import Head from "next/head";
import Script from "next/script";
import { PropsWithChildren, useEffect, useState } from "react";
import axios from 'axios';
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Link,
    Paragraph,
    Spinner,
} from "theme-ui";


const ALLOWED_VIDEOS = `Allowed Video Topics:
- Artificial Intelligence (AI)
- Machine Learning (ML)
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

const BLOCKED_VIDEOS = `Blocked Video Topics:
- Politics and Current Events
- UFC and MMA
- Fighting and Violence
- Gaming and Esports
- Entertainment
- Funny Compilation Videos
- Pranks and Social Experiments
- Natural Disasters and Tragedies
- Fishing
`


const Layout = (props: PropsWithChildren<{ minHeight?: number }>) => {
    return (
        <>
            <Head>
                <title>Block YouTube using GPT-4</title>
                <meta
                    name="description"
                    content="Stay focused"
                />
                <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline'" />
                <link rel="icon" href="/icons/favicon.ico" />
            </Head>

            <Script
                src="/lemon.js"
                strategy="lazyOnload"
                onLoad={() => {
                    // @ts-ignore
                    window.createLemonSqueezy();
                }}
            />

            <Container
                sx={{
                    display: "flex",
                    alignItems: "stretch",
                    flexDirection: "column",
                    minWidth: "500px",
                    minHeight: props.minHeight,
                }}
            >
                <Flex
                    as="main"
                    sx={{
                        flex: 1,
                        justifyContent: "center",
                        alignContent: "center",
                    }}
                >
                    <Box
                        sx={{
                            textAlign: "center",
                        }}
                    >
                        {props.children}
                    </Box>
                </Flex>
            </Container>
        </>
    );
};

export default function Extension() {
    const [minHeight, setMinHeight] = useState<number | undefined>();
    const [keyInsight, setKeyInsight] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [allowedVideos, setAllowedVideos] = useState('');
    const [blockedVideos, setBlockedVideos] = useState('');
    const [redirectUrl, setRedirectUrl] = useState('');

    useEffect(() => {
        console.log('>>> extension load from chrome.storage.local');
        chrome.storage.local.get(null, function(storage) {
            console.log('extension local storage', storage);
        });
        // If chrome.storage.local has values then use them
        chrome.storage.local.get(['allowedVideos', 'blockedVideos', 'redirectUrl'], function(result) {
            let initialAllowed = result.allowedVideos ? result.allowedVideos : ALLOWED_VIDEOS;
            let initialBlocked = result.blockedVideos ? result.blockedVideos : BLOCKED_VIDEOS;
            let initialRedirectUrl = result.redirectUrl ? result.redirectUrl : 'https://www.codecademy.com/';
    
            console.log('>>> extension init vars initialAllowed', initialAllowed, 'initialBlocked', initialBlocked);

            // Store the values back to chrome.storage.local
            chrome.storage.local.set({
                allowedVideos: initialAllowed,
                blockedVideos: initialBlocked,
                redirectUrl: initialRedirectUrl
            }, function() {
                console.log('>>> extension vars were saved to chrome.storage.local');
            });
    
            setAllowedVideos(initialAllowed);
            setBlockedVideos(initialBlocked);
            setRedirectUrl(initialRedirectUrl);
        });
    }, []);


    useEffect(() => {
        console.log('>>> extension vars loaded allowed vids and blocked vids', allowedVideos, '<<', blockedVideos, '<<', redirectUrl);
    }, [allowedVideos, blockedVideos, redirectUrl]);


    const handleAllowedChange = (event: any) => {
        // Saving the new value to local storage
        chrome.storage.local.set({ 'allowedVideos': event.target.value }, () => {
            console.log('Allowed videos saved in local storage');
        });
        setAllowedVideos(event.target.value);
    };
    
    const handleBlockedChange = (event: any) => {
        // Saving the new value to local storage
        chrome.storage.local.set({ 'blockedVideos': event.target.value }, () => {
            console.log('Allowed videos saved in local storage');
        });
        setBlockedVideos(event.target.value);
    };

    const handlesetRedirectUrlChange = (event: any) => {
        chrome.storage.local.set({ 'redirectUrl': event.target.value }, () => {
            console.log('Allowed videos saved in local storage');
        });
        setRedirectUrl(event.target.value);
    };

    const handleReset = () => {
        // Set the state values back to the constants
        setAllowedVideos(ALLOWED_VIDEOS);
        setBlockedVideos(BLOCKED_VIDEOS);
        setRedirectUrl('https://www.codecademy.com/');
        // Also re-set these values in chrome.storage.local
        chrome.storage.local.set({
            allowedVideos: ALLOWED_VIDEOS,
            blockedVideos: BLOCKED_VIDEOS,
            redirectUrl: 'https://www.codecademy.com/'
        }, function() {
            console.log('>>> extension vars were RESET and saved to chrome.storage.local');
        });
    };

    async function summarizeArticle(RawUrl: string) {
        console.log('>>> extension tab url', RawUrl);

        if (RawUrl && allowedVideos && blockedVideos) {
            const url = RawUrl;
            let videoId;
            if(url.includes("shorts/")){
                videoId = url.split("shorts/")[1];
            } else {
                videoId = new URL(url).searchParams.get("v");
            }
            if (videoId) {
                setIsLoading(true);
                try {
                    console.log('>>> extension sending request: allowedVideos', allowedVideos, 'blockedVideos', blockedVideos, 'url', url);
                    const { data } = await axios.post('https://youtube-focus-gpt4.vercel.app/api/findKeyInsight',
                    { 
                        url: url,
                        allowedVideos: allowedVideos, 
                        blockedVideos: blockedVideos, 
                    });
                    if (data === true) {
                        setKeyInsight('allow');
                    } else {
                        setKeyInsight('block');
                        chrome.tabs.update({url: redirectUrl})
                    }
                    console.log(">>> output from post", data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                console.log('>>> extension no video id');
                setIsLoading(false);
            }
        }
    }

    const executeScript = (tabs:any) => {
        const tab = tabs[0];
        summarizeArticle(tab.url);
    }

    const handleTabUpdate = (tabId:any, changeInfo:any, tab:any) => {
        // We're only interested in URL changes, not other kinds of updates
        if (changeInfo.url && tab.active) {
            summarizeArticle(changeInfo.url);
        }
    }

    useEffect(() => {
        // When the extension first loads, check the active tab
        chrome.tabs.query({active: true, currentWindow: true}, executeScript);

        // Add a listener for tab updates
        chrome.tabs.onUpdated.addListener(handleTabUpdate);
        
        // Return cleanup function
        return () => {
            chrome.tabs.onUpdated.removeListener(handleTabUpdate);
            }
    }, [allowedVideos, blockedVideos, redirectUrl]);

    // useEffect(() => {
    //     summarizeArticle();
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    return (
        <Layout minHeight={minHeight}>
            <Heading>Wasting time?</Heading>
            {/* Reset Button */}
            <div style={{ marginTop: '10px' }}>
                <Button onClick={handleReset} style={{backgroundColor: 'navy', margin: "10px!"}}>Reset to Defaults</Button>
            </div>
            <form onSubmit={(event) => event.preventDefault()}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Allowed Videos:</label><br/>
                    <textarea 
                        style={{ overflow: 'auto', height: '150px', width: '350px', whiteSpace: 'pre-wrap' }}
                        value={allowedVideos} 
                        onChange={handleAllowedChange} 
                    />
                </div>
                <div>
                    <label>Blocked Videos:</label><br/>
                    <textarea 
                        style={{ overflow: 'auto', height: '150px', width: '350px', whiteSpace: 'pre-wrap' }}
                        value={blockedVideos} 
                        onChange={handleBlockedChange} 
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Redirect URL:</label><br/>
                    <input 
                        type="text"
                        style={{ width: '350px' }}
                        value={redirectUrl} 
                        onChange={handlesetRedirectUrlChange} 
                    />
                </div>
            </form>

            <Paragraph style={{padding: '20px'}}>
                Ain&apos;t nobody got time for that.👇
            </Paragraph>

            {isLoading ? (
                <Box>
                    <Spinner />
                </Box>
            ) : null}

            {keyInsight ? (
                <Paragraph sx={{ m: "auto", p: 2, fontSize: 1 }}>
                    {keyInsight}
                </Paragraph>
            ) : null}
        </Layout>
    );
}
