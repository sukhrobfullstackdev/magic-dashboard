import { ENV, ENVType } from '@config';
import { loadStripe } from '@stripe/stripe-js';

const API_KEYS = {
  [ENVType.Local]: 'pk_test_WJopCqpKnzU6ItUVUNDJkCFD00KBxP2yTz',
  [ENVType.Dev]: 'pk_test_WJopCqpKnzU6ItUVUNDJkCFD00KBxP2yTz',
  [ENVType.Stagef]: 'pk_test_WJopCqpKnzU6ItUVUNDJkCFD00KBxP2yTz',
  [ENVType.Prod]: 'pk_live_Wj6SVA12KHOuUvR11C58LCYG00GRiAHRrL',
};

export const stripePromise = loadStripe(API_KEYS[ENV]);
