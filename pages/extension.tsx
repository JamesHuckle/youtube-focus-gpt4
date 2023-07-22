import Head from "next/head";
import Script from "next/script";
import { PropsWithChildren, useEffect, useState } from "react";
import { useMutation } from "react-query";
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
        </>
    );
};

export default function Extension() {
    const [minHeight, setMinHeight] = useState<number | undefined>();
    const {
        data: keyInsight,
        isLoading,
        mutateAsync,
    } = useMutation(findKeyInsight);

    console.log(">>> extension keyInsight", keyInsight, isLoading);

    async function summarizeArticle() {
        // let [tab] = await chrome.tabs.query({
        //     active: true,
        //     lastFocusedWindow: true,
        // });

        const tab = {
            url: "https://www.youtube.com/watch?v=7d16CpWp-ok&ab_channel=TalkIslam",
        };

        if (tab.url) {
            try {
                await mutateAsync({ url: tab.url });
            } catch (e) {
                console.log('>>> extension error failed request');
                console.error(e);
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
