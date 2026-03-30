import React from 'react';

export default function MobileView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Mobile View</h1>
      <p className="text-lg text-slate-300">This is optimized for mobile devices.</p>
      {/* Add your mobile-specific UI here */}
    </div>
  );
}
