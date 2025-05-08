import React from 'react';
import { Link } from 'react-router-dom';
import { BookmarkPlus, Share2, Zap } from 'lucide-react';
import Button from '../components/ui/Button';

const Home: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Save and summarize your
            <span className="text-blue-600"> favorite links</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Never lose an important article again. Save your bookmarks with automatic summaries powered by AI.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Link to="/register">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <BookmarkPlus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Easy Saving</h3>
              <p className="mt-2 text-gray-500">
                Just paste any URL and we'll automatically fetch the title and favicon.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">AI Summaries</h3>
              <p className="mt-2 text-gray-500">
                Get instant AI-generated summaries of your saved articles.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Quick Access</h3>
              <p className="mt-2 text-gray-500">
                Access your bookmarks from anywhere with our cloud sync.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;