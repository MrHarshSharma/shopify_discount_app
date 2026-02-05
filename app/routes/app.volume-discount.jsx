import { Card, Page, Layout, Text, Banner, BlockStack, InlineStack, Badge, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function VolumeDiscountPage() {
    const fetcher = useFetcher();
    const [isActivated, setIsActivated] = useState(false);
    const isActivating = fetcher.state === "submitting";

    useEffect(() => {
        if (fetcher.data?.success) {
            setIsActivated(true);
        }
    }, [fetcher.data]);

    const activateDiscount = () => {
        fetcher.submit({}, { method: "POST", action: "/app/activate-discount" });
    };

    return (
        <Page>
            <TitleBar title="Volume Discount Configuration" />
            <Layout>
                <Layout.Section>
                    {isActivated || fetcher.data?.success ? (
                        <Banner title="Discount Activated Successfully!" tone="success">
                            <p>Your "Buy 2, get 10% off" discount is now active. Test it by adding 2+ items to cart and going to checkout.</p>
                        </Banner>
                    ) : (
                        <Banner title="Activate Your Discount" tone="warning">
                            <BlockStack gap="300">
                                <Text as="p">Click the button below to activate the volume discount function.</Text>
                                <Button
                                    onClick={activateDiscount}
                                    loading={isActivating}
                                    variant="primary"
                                >
                                    {isActivating ? "Activating..." : "Activate Discount Now"}
                                </Button>
                            </BlockStack>
                        </Banner>
                    )}

                    {fetcher.data?.errors && (
                        <Banner tone="critical">
                            <BlockStack gap="200">
                                <Text as="p">Error activating discount:</Text>
                                {fetcher.data.errors.map((error, index) => (
                                    <Text as="p" key={index}>• {error.message}</Text>
                                ))}
                            </BlockStack>
                        </Banner>
                    )}
                </Layout.Section>

                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text variant="headingMd" as="h2">
                                Current Discount Settings
                            </Text>

                            <BlockStack gap="200">
                                <InlineStack align="space-between">
                                    <Text as="span" fontWeight="semibold">Minimum Quantity:</Text>
                                    <Badge tone="info">2 items</Badge>
                                </InlineStack>

                                <InlineStack align="space-between">
                                    <Text as="span" fontWeight="semibold">Discount Percentage:</Text>
                                    <Badge tone="success">10%</Badge>
                                </InlineStack>

                                <InlineStack align="space-between">
                                    <Text as="span" fontWeight="semibold">Applies to:</Text>
                                    <Badge>All products</Badge>
                                </InlineStack>

                                <InlineStack align="space-between">
                                    <Text as="span" fontWeight="semibold">Discount Type:</Text>
                                    <Badge>Automatic</Badge>
                                </InlineStack>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text variant="headingMd" as="h2">
                                How It Works
                            </Text>

                            <BlockStack gap="200">
                                <Text as="p">
                                    ✅ When a customer adds <strong>2 or more</strong> of any product to their cart
                                </Text>
                                <Text as="p">
                                    ✅ A <strong>10% discount</strong> is automatically applied at checkout
                                </Text>
                                <Text as="p">
                                    ✅ The discount shows as "Buy 2, get 10% off"
                                </Text>
                                <Text as="p">
                                    ✅ Works on all products in your store
                                </Text>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text variant="headingMd" as="h2">
                                Testing Your Discount
                            </Text>

                            <BlockStack gap="200">
                                <Text as="p">
                                    1. Visit your store: <strong>hampers-5041.myshopify.com</strong>
                                </Text>
                                <Text as="p">
                                    2. Add 2 or more of any product to cart
                                </Text>
                                <Text as="p">
                                    3. Proceed to <strong>Checkout</strong>
                                </Text>
                                <Text as="p">
                                    4. Verify the 10% discount appears
                                </Text>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Banner tone="info">
                        <p>
                            <strong>Note:</strong> Discounts only appear at checkout, not in the cart page. This is standard Shopify behavior.
                        </p>
                    </Banner>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
