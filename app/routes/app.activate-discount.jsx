import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const action = async ({ request }) => {
    const { admin } = await authenticate.admin(request);

    try {
        // First, query to get all Shopify Functions
        const functionsResponse = await admin.graphql(
            `#graphql
        query {
          shopifyFunctions(first: 25) {
            nodes {
              id
              apiType
              title
              apiVersion
            }
          }
        }`
        );

        const functionsData = await functionsResponse.json();
        const functions = functionsData.data.shopifyFunctions.nodes;

        console.log("All available functions:", JSON.stringify(functions, null, 2));

        // Find the volume-discount function by title (apiType is just "discount")
        const volumeDiscountFunction = functions.find(
            fn => fn.title === "volume-discount" || fn.apiType === "discount"
        );

        if (!volumeDiscountFunction) {
            // Create detailed error message with available functions
            const availableFunctions = functions.map(fn => `${fn.title} (${fn.apiType})`).join(", ");
            return json({
                success: false,
                errors: [{
                    message: `Volume discount function not found. Available functions: ${availableFunctions || "none"}. Total functions: ${functions.length}. Make sure the app is deployed with 'shopify app deploy'.`
                }]
            }, { status: 404 });
        }

        console.log("Found function:", volumeDiscountFunction);

        // Now create the automatic discount with the correct function ID
        // IMPORTANT: discountClass field is now part of the main input, not metafields
        const response = await admin.graphql(
            `#graphql
        mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
          discountAutomaticAppCreate(automaticAppDiscount: $discount) {
            automaticAppDiscount {
              discountId
              title
              startsAt
              endsAt
              discountClasses
            }
            userErrors {
              field
              message
            }
          }
        }`,
            {
                variables: {
                    discount: {
                        title: "Volume Discount - Buy 2 Get 10% Off",
                        functionId: volumeDiscountFunction.id,
                        discountClasses: ["PRODUCT"],
                        startsAt: new Date().toISOString(),
                        combinesWith: {
                            orderDiscounts: true,
                            productDiscounts: true,
                            shippingDiscounts: true,
                        },
                    },
                },
            }
        );

        const responseJson = await response.json();
        const result = responseJson.data.discountAutomaticAppCreate;

        if (result.userErrors && result.userErrors.length > 0) {
            return json({
                success: false,
                errors: result.userErrors
            }, { status: 400 });
        }

        return json({
            success: true,
            discount: result.automaticAppDiscount,
            functionId: volumeDiscountFunction.id
        });
    } catch (error) {
        console.error("Error creating discount:", error);
        return json({
            success: false,
            errors: [{ message: error.message }]
        }, { status: 500 });
    }
};
