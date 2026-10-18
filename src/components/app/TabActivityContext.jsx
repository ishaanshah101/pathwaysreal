import { createContext } from 'react';

// Ordinary web routes are always active; only native cached tabs override this.
const TabActivityContext = createContext(true);
export default TabActivityContext;