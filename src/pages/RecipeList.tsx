import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, Users, Bookmark, Grid, List } from 'lucide-react';
import { Recipe, SearchFilters } from '../types';
import { getRecipes, addBookmark, removeBookmark, checkBookmark } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const RecipeList: React.FC = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<Set<string>>(new Set());

  const regions = [
    { value: '', label: 'Semua Wilayah' },
    { value: 'jawa', label: 'Jawa' },
    { value: 'sumatera', label: 'Sumatera' },
    { value: 'kalimantan', label: 'Kalimantan' },
    { value: 'sulawesi', label: 'Sulawesi' },
    { value: 'bali_nusa_tenggara', label: 'Bali & Nusa Tenggara' },
    { value: 'maluku_papua', label: 'Maluku & Papua' }
  ];

  const difficulties = [
    { value: '', label: 'Semua Tingkat' },
    { value: 'mudah', label: 'Mudah' },
    { value: 'sedang', label: 'Sedang' },
    { value: 'sulit', label: 'Sulit' }
  ];

  useEffect(() => {
    loadRecipes();
  }, [searchQuery, selectedRegion, selectedDifficulty]);

  useEffect(() => {
    if (user && recipes.length > 0) {
      loadBookmarkStatus();
    }
  }, [user, recipes]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const filters: SearchFilters = {
        query: searchQuery || undefined,
        region: selectedRegion || undefined,
        difficulty: selectedDifficulty || undefined
      };
      const data = await getRecipes(filters);
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarkStatus = async () => {
    if (!user) return;
    
    const bookmarkStatuses = await Promise.all(
      recipes.map(recipe => checkBookmark(user.id, recipe.id))
    );
    
    const bookmarked = new Set<string>();
    recipes.forEach((recipe, index) => {
      if (bookmarkStatuses[index]) {
        bookmarked.add(recipe.id);
      }
    });
    
    setBookmarkedRecipes(bookmarked);
  };

  const handleBookmarkToggle = async (recipeId: string) => {
    if (!user) return;

    try {
      const isBookmarked = bookmarkedRecipes.has(recipeId);
      
      if (isBookmarked) {
        await removeBookmark(user.id, recipeId);
        setBookmarkedRecipes(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
      } else {
        await addBookmark(user.id, recipeId);
        setBookmarkedRecipes(prev => new Set([...prev, recipeId]));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedDifficulty('');
  };

  const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
    const isBookmarked = bookmarkedRecipes.has(recipe.id);
    
    if (viewMode === 'list') {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex">
            <div className="relative w-48 h-32 flex-shrink-0">
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleBookmarkToggle(recipe.id)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <Bookmark 
                  className={`w-4 h-4 ${
                    isBookmarked ? 'fill-amber-600 text-amber-600' : 'text-gray-600'
                  }`} 
                />
              </button>
            </div>
            
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-amber-600 font-medium">
                  {regions.find(r => r.value === recipe.region)?.label || recipe.region}
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  {recipe.difficulty}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{recipe.cooking_time} menit</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{recipe.servings} porsi</span>
                  </div>
                </div>
                
                <Link
                  to={`/recipes/${recipe.id}`}
                  className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  Lihat Resep
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={() => handleBookmarkToggle(recipe.id)}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <Bookmark 
              className={`w-5 h-5 ${
                isBookmarked ? 'fill-amber-600 text-amber-600' : 'text-gray-600'
              }`} 
            />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-amber-600 font-medium">
              {regions.find(r => r.value === recipe.region)?.label || recipe.region}
            </span>
            <span className="text-sm text-gray-500 capitalize">
              {recipe.difficulty}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{recipe.cooking_time} menit</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{recipe.servings} porsi</span>
              </div>
            </div>
          </div>
          
          <Link
            to={`/recipes/${recipe.id}`}
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium w-full justify-center"
          >
            Lihat Resep
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Koleksi Resep</h1>
              <p className="text-gray-600 mt-1">
                {recipes.length} resep tradisional Indonesia
              </p>
            </div>
            
            {/* Search and View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari resep..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filter
              </button>
              
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wilayah
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {regions.map(region => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Hapus Filter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-amber-700">Memuat resep...</p>
            </div>
          </div>
        ) : recipes.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
              : 'space-y-6'
          }`}>
            {recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tidak ada resep ditemukan
            </h3>
            <p className="text-gray-600 mb-4">
              Coba ubah kata kunci atau filter pencarian
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Hapus Semua Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeList;