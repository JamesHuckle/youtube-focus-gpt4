import Head from "next/head";
import Script from "next/script";
import { PropsWithChildren, useEffect, useState } from "react";
import { useMutation } from "react-query";
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
import { findKeyInsight } from "../components/KeyInsight";

const Layout = (props: PropsWithChildren<{ minHeight?: number }>) => {
    return (
        <>
            <Head>
                <title>WhatIsThePoint.xyz gives you the point</title>
                <meta
                    name="description"
                    content="Get the main insight from any article using GPT"
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

    const [keyInsight, setKeyInsight] = useState("");//
    const [isLoading, setIsLoading] = useState(false);//

    useEffect(() => {
        // When the extension first loads, check the active tab
        chrome.tabs.query({active: true, currentWindow: true}, executeScript);

        // Add a listener for tab updates
        chrome.tabs.onUpdated.addListener(handleTabUpdate);
        
        // Return cleanup function
        return () => {
            chrome.tabs.onUpdated.removeListener(handleTabUpdate);
            }
    }, []);

    const executeScript = (tabs:any) => {
        const tab = tabs[0];
        summarizeArticle();
    }

    const handleTabUpdate = (tabId:any, changeInfo:any, tab:any) => {
        // We're only interested in URL changes, not other kinds of updates
        if (changeInfo.url && tab.active) {
            summarizeArticle();
        }
    }

    async function summarizeArticle() {
        setIsLoading(true);

        // const tab = {
        //     url: "https://www.youtube.com/watch?v=7d16CpWp-ok&ab_channel=TalkIslam",
        // };

        let [tab] = await chrome.tabs.query({
            active: true,
            lastFocusedWindow: true,
        });

        if (tab.url) {
            try {
                console.log('>>> extension sending request');
                const { data } = await axios.post('https://youtube-focus-gpt4.vercel.app/api/findKeyInsight', { url: tab.url });
                if (data === true) {
                    setKeyInsight('allow');
                } else {
                    setKeyInsight('block');
                    chrome.tabs.update({url: 'https://www.codecademy.com/'})
                }
                console.log(">>> output from post", data, 'keyInsight', keyInsight);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
    }

    useEffect(() => {
        summarizeArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Layout minHeight={minHeight}>
            <Heading>What is the point?</Heading>
            <Paragraph>
                Reading? Ain&apos;t nobody got time for that. Here&apos;s the
                point 👇
            </Paragraph>

            <Heading as="h2" sx={{ mt: 3 }}>
                The point 👇
            </Heading>

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
