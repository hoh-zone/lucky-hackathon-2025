export function Foot() {
  return (
    <>
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Lucky.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
