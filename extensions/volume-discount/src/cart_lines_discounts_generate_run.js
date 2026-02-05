import {
  DiscountClass,
  OrderDiscountSelectionStrategy,
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

  // Check if product discounts are enabled
  const hasProductDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Product,
  );

  if (!hasProductDiscountClass) {
    return { operations: [] };
  }

  // Collect all targets that meet the criteria
  const targets = [];

  input.cart.lines.forEach((line) => {
    // Apply 10% discount if quantity is 2 or more
    if (line.quantity >= 2) {
      targets.push({
        cartLine: {
          id: line.id,
        },
      });
    }
  });

  // If no lines qualify, return empty operations
  if (targets.length === 0) {
    return { operations: [] };
  }

  // Return a single operation with all targets
  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates: [
            {
              message: 'Buy 2, get 10% off',
              targets: targets,
              value: {
                percentage: {
                  value: 10, // 10% discount
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