import React from 'react';
import { UNSAFE_LocationContext as LocationContext } from 'react-router-dom';
import TabActivityContext from '@/components/app/TabActivityContext';

export default function NativeTabPane({ active, locationContext, children }) {
  return (
    <div hidden={!active} aria-hidden={!active} style={{ display: active ? 'block' : 'none' }}>
      <TabActivityContext.Provider value={active}>
        <LocationContext.Provider value={locationContext}>
          {children}
        </LocationContext.Provider>
      </TabActivityContext.Provider>
    </div>
  );
}