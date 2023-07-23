import { useState } from "react";
import { useMutation } from "react-query";
import { Box, Button, Flex, Input, Link, Paragraph, Spinner } from "theme-ui";
import { usePlausible } from "next-plausible";

export async function findKeyInsight(vars: { url: string, allowedVideos: string, blockedVideos: string}) {
    const res = await fetch("/api/findKeyInsight", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        mode: "cors",
        redirect: "follow",
        referrer: "https://whatispoint.xyz/extension",
        referrerPolicy: "origin",
        body: JSON.stringify(vars),
    });

    if (!res.ok) {
        console.log('Failed to find key insight')
        throw new Error("Failed to find key insight");
    }

    //return 'Hello world silly robots'
    return res.text();
}

export const KeyInsight = () => {
    const [url, setUrl] = useState<string>("");
    const [allowedVideos, setAllowedVideos] = useState<string>("");
    const [blockedVideos, setBlockedVideos] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);

    const plausible = usePlausible();

    const {
        data: keyInsight,
        isLoading,
        mutateAsync,
    } = useMutation(findKeyInsight);

    async function makeThread(event: React.FormEvent) {
        event.preventDefault();

        setIsError(false);

        if (url) {
            try {
                await mutateAsync({ url, allowedVideos, blockedVideos });
            } catch (e) {
                console.error(e);
                setIsError(true);
            }
        }
    }

    return (
        <Box
            sx={{
                textAlign: "center",
            }}
        >
            <h1>What is the point?</h1>
            <Paragraph>
                Reading? Ain&apos;t nobody got time for that. Paste the URL, get
                the point 👇
            </Paragraph>
            <Paragraph>
                Don&apos;t have a URL handy?{" "}
                <Link
                    href="#"
                    onClick={() => {
                        setUrl(
                            "https://swizec.com/blog/why-senior-engineers-get-nothing-done/"
                        );
                    }}
                >
                    Try an example
                </Link>
            </Paragraph>
            <Flex
                as="form"
                onSubmit={makeThread}
                sx={{
                    p: 1,
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Input
                    name="url"
                    value={url}
                    placeholder="Paste URL here"
                    onChange={(e) => {
                        setUrl(e.currentTarget.value);
                        plausible("getUrlSummaryClicked", {
                            props: {
                                url,
                            },
                        });
                    }}
                    sx={{ m: 3, width: "100%" }}
                />

                {isError ? (
                    <Paragraph sx={{ color: "red" }}>
                        Sorry, choked on that link – likely too long. <br />
                        Try something else
                    </Paragraph>
                ) : null}

                {isLoading ? (
                    <Spinner />
                ) : (
                    <Button type="submit" sx={{ cursor: "pointer" }}>
                        What is the point?
                    </Button>
                )}
            </Flex>

            {
                keyInsight ? (
                    <>
                        <h2>The point 👇</h2>
                        <Paragraph sx={{ m: "auto", p: 2 }}>
                            {keyInsight}
                        </Paragraph>
                        <Paragraph>
                            Read more:{" "}
                            <Link href={url}>{new URL(url).hostname}</Link>
                        </Paragraph>
                    </>
                ) : null
                // <HowItWorks />
            }
        </Box>
    );
};
