import {
    Page,
    Layout,
    Card,
    Button,
    FormLayout,
    TextField,
    BlockStack,
    Text,
    Banner,
    Box,
    List,
    InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { useState, useEffect } from "react";

// Loader to fetch current settings from the DISCOUNT OBJECT
export const loader = async ({ request }) => {
    const { admin } = await authenticate.admin(request);

    // Find the volume discount created by this app
    const response = await admin.graphql(
        `#graphql
    query {
      discountNodes(first: 10, query: "title:'Volume Discount - Buy 2 Get 10% Off'") {
        nodes {
          id
          metafield(namespace: "volume-discount", key: "function-configuration") {
            value
          }
          discount {
            ... on DiscountAutomaticApp {
              title
            }
          }
        }
      }
    }`
    );

    const data = await response.json();
    const discountNode = data.data.discountNodes.nodes[0];

    // Default config if not found or no metafield
    const defaultConfig = { quantity: 2, percentage: 10, productIds: [] };
    const config = discountNode?.metafield?.value
        ? JSON.parse(discountNode.metafield.value)
        : defaultConfig;

    return json({
        config,
        discountId: discountNode?.id,
        found: !!discountNode
    });
};

// Action to save settings to the DISCOUNT OBJECT
export const action = async ({ request }) => {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();

    const discountId = formData.get("discountId");
    const quantity = parseInt(formData.get("quantity"));
    const percentage = parseFloat(formData.get("percentage"));
    const productIds = JSON.parse(formData.get("productIds") || "[]");

    if (!discountId) {
        return json({ errors: [{ message: "Discount not found. Please activate it first." }] }, { status: 400 });
    }

    const configuration = {
        quantity,
        percentage,
        productIds
    };

    // Update the metafield on the Discount Node
    const response = await admin.graphql(
        `#graphql
    mutation UpdateDiscountMetafield($ownerId: ID!, $value: String!) {
      metafieldsSet(metafields: [
        {
          ownerId: $ownerId
          namespace: "volume-discount"
          key: "function-configuration"
          type: "json"
          value: $value
        }
      ]) {
        userErrors {
          field
          message
        }
      }
    }`,
        {
            variables: {
                ownerId: discountId,
                value: JSON.stringify(configuration)
            }
        }
    );

    const responseJson = await response.json();
    if (responseJson.data.metafieldsSet.userErrors.length > 0) {
        return json({ errors: responseJson.data.metafieldsSet.userErrors }, { status: 400 });
    }

    return json({ success: true, config: configuration });
};

export default function VolumeDiscountPage() {
    const { config, discountId, found } = useLoaderData();
    const actionData = useActionData();
    const submit = useSubmit();
    const navigation = useNavigation();
    const shopify = useAppBridge();

    const [quantity, setQuantity] = useState(config.quantity);
    const [percentage, setPercentage] = useState(config.percentage);
    const [selectedProducts, setSelectedProducts] = useState(config.productIds || []);

    const isSaving = navigation.state === "submitting";
    const [showSaveBanner, setShowSaveBanner] = useState(false);

    useEffect(() => {
        if (actionData?.success) {
            setShowSaveBanner(true);
            shopify.toast.show("Settings saved successfully");
        }
    }, [actionData, shopify]);

    const handleSave = () => {
        submit(
            {
                discountId,
                quantity,
                percentage,
                productIds: JSON.stringify(selectedProducts)
            },
            { method: "POST" }
        );
    };

    const selectProducts = async () => {
        const ids = await shopify.resourcePicker({
            type: "product",
            multiple: true,
            action: "select",
            selectionIds: selectedProducts.map(id => ({ id })),
        });

        if (ids) {
            setSelectedProducts(ids.map(p => p.id));
        }
    };

    const clearProducts = () => {
        setSelectedProducts([]);
    };

    if (!found) {
        return (
            <Page>
                <TitleBar title="Configure Volume Discount" />
                <Layout>
                    <Layout.Section>
                        <Banner tone="warning" title="Discount Not Found">
                            <p>Please activate the discount first using the Activate button on the dashboard.</p>
                        </Banner>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Page>
            <TitleBar title="Configure Volume Discount" />

            <Layout>
                {showSaveBanner && (
                    <Layout.Section>
                        <Banner
                            title="Settings saved"
                            tone="success"
                            onDismiss={() => setShowSaveBanner(false)}
                        />
                    </Layout.Section>
                )}

                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text variant="headingMd" as="h2">Discount Rules</Text>
                            <Text as="p" tone="subdued">
                                Define the rules for your "Buy X, Get Y% Off" discount.
                            </Text>

                            <FormLayout>
                                <FormLayout.Group>
                                    <TextField
                                        label="Minimum Quantity"
                                        type="number"
                                        value={String(quantity)}
                                        onChange={(val) => setQuantity(parseInt(val) || 0)}
                                        autoComplete="off"
                                        suffix="items"
                                        helpText="Customer must add at least this many items to cart."
                                    />
                                    <TextField
                                        label="Discount Percentage"
                                        type="number"
                                        value={String(percentage)}
                                        onChange={(val) => setPercentage(parseFloat(val) || 0)}
                                        autoComplete="off"
                                        suffix="%"
                                        helpText="The percentage discount to apply."
                                    />
                                </FormLayout.Group>
                            </FormLayout>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <InlineStack align="space-between">
                                <Text variant="headingMd" as="h2">Eligible Products</Text>
                                {selectedProducts.length > 0 && (
                                    <Button variant="plain" tone="critical" onClick={clearProducts}>Clear selection</Button>
                                )}
                            </InlineStack>

                            <Text as="p" tone="subdued">
                                {selectedProducts.length === 0
                                    ? "Currently applies to ALL products in the store."
                                    : `Currently applies to ${selectedProducts.length} selected product(s).`}
                            </Text>

                            <Box>
                                <Button onClick={selectProducts}>
                                    {selectedProducts.length === 0 ? "Select Specific Products" : "Change Selection"}
                                </Button>
                            </Box>

                            {selectedProducts.length > 0 && (
                                <Box paddingBlockStart="200">
                                    <Text variant="bodySm" tone="subdued">Selected Product IDs:</Text>
                                    <List type="bullet">
                                        {selectedProducts.slice(0, 5).map(id => (
                                            <List.Item key={id}>{id.split('/').pop()}</List.Item>
                                        ))}
                                        {selectedProducts.length > 5 && <List.Item>...and {selectedProducts.length - 5} more</List.Item>}
                                    </List>
                                </Box>
                            )}
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Box paddingBlockStart="200">
                        <InlineStack align="end">
                            <Button
                                variant="primary"
                                size="large"
                                onClick={handleSave}
                                loading={isSaving}
                            >
                                Save Configuration
                            </Button>
                        </InlineStack>
                    </Box>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
