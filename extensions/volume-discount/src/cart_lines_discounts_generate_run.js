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

  const operations = [];

  // Check if product discounts are enabled
  const hasProductDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Product,
  );

  if (!hasProductDiscountClass) {
    return { operations: [] };
  }

  // Iterate through each cart line
  input.cart.lines.forEach((line) => {
    // Apply 10% discount if quantity is 2 or more
    if (line.quantity >= 2) {
      operations.push({
        productDiscountsAdd: {
          candidates: [
            {
              message: 'Buy 2, get 10% off',
              targets: [
                {
                  cartLine: {
                    id: line.id,
                  },
                },
              ],
              value: {
                percentage: {
                  value: 10, // 10% discount
                },
              },
            },
          ],
          selectionStrategy: ProductDiscountSelectionStrategy.First,
        },
      });
    }
  });

  return {
    operations,
  };
}