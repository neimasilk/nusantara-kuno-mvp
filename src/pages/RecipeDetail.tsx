import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, ChefHat, Bookmark, Share2, MapPin, Star } from 'lucide-react';
import { Recipe } from '../types';
import { getRecipe, addBookmark, removeBookmark, checkBookmark, updateProgress } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showCulturalStory, setShowCulturalStory] = useState(false);

  const regions = {
    'jawa': 'Jawa',
    'sumatera': 'Sumatera',
    'kalimantan': 'Kalimantan',
    'sulawesi': 'Sulawesi',
    'bali_nusa_tenggara': 'Bali & Nusa Tenggara',
    'maluku_papua': 'Maluku & Papua'
  };

  useEffect(() => {
    if (id) {
      loadRecipe(id);
    }
  }, [id]);

  useEffect(() => {
    if (user && recipe) {
      checkBookmarkStatus();
    }
  }, [user, recipe]);

  const loadRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      const data = await getRecipe(recipeId);
      setRecipe(data);
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!user || !recipe) return;
    
    try {
      const bookmarked = await checkBookmark(user.id, recipe.id);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user || !recipe) return;

    try {
      if (isBookmarked) {
        await removeBookmark(user.id, recipe.id);
        setIsBookmarked(false);
      } else {
        await addBookmark(user.id, recipe.id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleStepComplete = async (stepIndex: number) => {
    if (!user || !recipe) return;

    const newCompletedSteps = new Set(completedSteps);
    
    if (completedSteps.has(stepIndex)) {
      newCompletedSteps.delete(stepIndex);
    } else {
      newCompletedSteps.add(stepIndex);
    }
    
    setCompletedSteps(newCompletedSteps);

    // Update progress in database
    try {
      const progress = (newCompletedSteps.size / recipe.steps.length) * 100;
      await updateProgress(user.id, recipe.id, progress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe?.title,
          text: recipe?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link resep telah disalin ke clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-700">Memuat resep...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resep tidak ditemukan</h2>
          <Link
            to="/recipes"
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Resep
          </Link>
        </div>
      </div>
    );
  }

  const progressPercentage = (completedSteps.size / recipe.steps.length) * 100;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/recipes"
              className="flex items-center text-amber-600 hover:text-amber-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali
            </Link>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-amber-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleBookmarkToggle}
                className="p-2 text-gray-600 hover:text-amber-600 transition-colors"
              >
                <Bookmark 
                  className={`w-5 h-5 ${
                    isBookmarked ? 'fill-amber-600 text-amber-600' : ''
                  }`} 
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {regions[recipe.region as keyof typeof regions] || recipe.region}
                </span>
                <span className="text-sm opacity-75">•</span>
                <span className="text-sm capitalize">{recipe.difficulty}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.title}</h1>
              <p className="text-lg opacity-90">{recipe.description}</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{recipe.cooking_time}</div>
                <div className="text-sm text-gray-600">Menit</div>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{recipe.servings}</div>
                <div className="text-sm text-gray-600">Porsi</div>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <ChefHat className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-600">Selesai</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            {completedSteps.size > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress Memasak</span>
                  <span className="text-sm text-gray-600">
                    {completedSteps.size} dari {recipe.steps.length} langkah
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bahan-bahan</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cara Memasak</h2>
              <div className="space-y-6">
                {recipe.steps.map((instruction, index) => (
                  <div key={index} className="flex items-start">
                    <button
                      onClick={() => handleStepComplete(index)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                        completedSteps.has(index)
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : 'border-gray-300 hover:border-amber-600'
                      }`}
                    >
                      {completedSteps.has(index) ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-gray-700 leading-relaxed ${
                        completedSteps.has(index) ? 'line-through opacity-60' : ''
                      }`}>
                        {instruction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Story */}
            {recipe.cultural_story && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Star className="w-6 h-6 text-amber-600 mr-2" />
                    Cerita Budaya
                  </h2>
                  <button
                    onClick={() => setShowCulturalStory(!showCulturalStory)}
                    className="text-amber-600 hover:text-amber-700 font-medium"
                  >
                    {showCulturalStory ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
                
                {showCulturalStory && (
                  <div className="prose prose-amber max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {recipe.cultural_story}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Recipes */}
        <div className="mt-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Jelajahi Resep Lainnya
            </h3>
            <Link
              to="/recipes"
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              Lihat Semua Resep
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;