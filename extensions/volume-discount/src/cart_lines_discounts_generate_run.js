import {
  DiscountClass,
  ProductDiscountSelectionStrategy,
} from '../generated/api';

/**
  * @typedef {import("../generated/api").CartInput} RunInput
  * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
  */

/**
  * @param {RunInput} input
  * @returns {CartLinesDiscountsGenerateRunResult}
  */
export function cartLinesDiscountsGenerateRun(input) {
  // Return empty if no cart lines
  if (!input.cart.lines.length) {
    return { operations: [] };
  }

  // Get configuration from metafield
  let config = { quantity: 2, percentage: 10, productIds: [] };
  const metafieldValue = input.discount?.metafield?.value;

  if (metafieldValue) {
    try {
      config = JSON.parse(metafieldValue);
    } catch (e) {
      console.error("Failed to parse config metafield", e);
    }
  }

  const targets = [];
  console.error("Starting Strict Per-Product Check");
  console.error(`Config: minQty=${config.quantity}, matchedIDs=${JSON.stringify(config.productIds)}`);

  // Iterate through cart lines
  input.cart.lines.forEach((line) => {
    // 1. Check Product Eligibility
    let isEligibleProduct = true;
    const productId = line.merchandise?.product?.id;

    if (config.productIds && config.productIds.length > 0) {
      if (!productId || !config.productIds.includes(productId)) {
        isEligibleProduct = false;
        console.error(`Line ${line.id} (Product: ${productId}) -> NOT ELIGIBLE (ID mismatch)`);
      }
    }

    // 2. Check Quantity Requirement individually
    if (isEligibleProduct) {
      if (line.quantity >= config.quantity) {
        console.error(`Line ${line.id} (Product: ${productId}) -> ELIGIBLE & QUALIFIES (Qty: ${line.quantity} >= ${config.quantity})`);

        // Add as a target for the discount
        targets.push({
          cartLine: {
            id: line.id
          }
        });
      } else {
        console.error(`Line ${line.id} (Product: ${productId}) -> ELIGIBLE BUT FAILS QTY (Qty: ${line.quantity} < ${config.quantity})`);
      }
    }
  });

  // If no lines qualify individually, return empty operations
  if (targets.length === 0) {
    console.error("No lines qualified for discount.");
    return { operations: [] };
  }

  // Return a single operation with all qualifying targets
  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates: [
            {
              message: `Buy ${config.quantity}, get ${config.percentage}% off`,
              targets: targets,
              value: {
                percentage: {
                  value: config.percentage,
                },
              },
            },
          ],
          selectionStrategy: ProductDiscountSelectionStrategy.First,
        },
      },
    ],
  };
}