import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zaphir-500 border-t-transparent animate-spin" />
      </div>
    }>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
