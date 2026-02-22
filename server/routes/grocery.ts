import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Grocery integration route.
 *
 * In production, this would integrate with actual grocery retailer APIs:
 * - Kroger/King Soopers API (https://developer.kroger.com/)
 * - Instacart Connect API
 * - Walmart Affiliate API
 *
 * For now, this generates a formatted grocery list that can be:
 * 1. Exported as a shareable text/PDF
 * 2. Deep-linked into the retailer's app/website
 * 3. Sent via the retailer's API when production keys are available
 */

interface GenerateListRequest {
  recipeIds: string[];
  storeId: string;
  servingsMultiplier?: number;
}

router.post('/generate-list', (req: Request, res: Response) => {
  const { recipeIds, storeId, servingsMultiplier = 1 } = req.body as GenerateListRequest;

  if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
    res.status(400).json({ error: 'Recipe IDs are required.' });
    return;
  }

  if (!storeId) {
    res.status(400).json({ error: 'Store ID is required.' });
    return;
  }

  // In production: call the store's API to check product availability,
  // match ingredients to products, and add to cart.
  // For now, return a structured list the app can display and export.
  res.json({
    storeId,
    recipeIds,
    servingsMultiplier,
    generatedAt: new Date().toISOString(),
    message:
      'Grocery list generated. In production, this would integrate with the retailer API to add items to your cart.',
    // The actual ingredient aggregation happens on the client side
    // using the recipe data. The server would handle API-specific
    // product matching and cart management.
  });
});

// Deep link generation for opening the store's app/website
router.get('/store-link/:storeId', (req: Request, res: Response) => {
  const storeLinks: Record<string, string> = {
    'whole-foods': 'https://www.wholefoodsmarket.com/',
    'costco': 'https://www.costco.com/',
    'king-soopers': 'https://www.kingsoopers.com/search?query=',
    'kroger': 'https://www.kroger.com/search?query=',
    'walmart': 'https://www.walmart.com/search?q=',
    'target': 'https://www.target.com/s?searchTerm=',
    'amazon-fresh': 'https://www.amazon.com/fresh',
    'instacart': 'https://www.instacart.com/store/',
    'trader-joes': 'https://www.traderjoes.com/',
    'sprouts': 'https://www.sprouts.com/',
  };

  const link = storeLinks[req.params.storeId];
  if (!link) {
    res.status(404).json({ error: 'Store not found.' });
    return;
  }

  res.json({ storeId: req.params.storeId, url: link });
});

export { router as groceryRouter };
