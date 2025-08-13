import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Users, MapPin, Star, Bookmark } from 'lucide-react';
import { Recipe, SearchFilters } from '../types';
import { getFeaturedRecipes, getRecipes, addBookmark, removeBookmark, checkBookmark } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
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

  useEffect(() => {
    loadFeaturedRecipes();
  }, []);

  useEffect(() => {
    if (searchQuery || selectedRegion) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedRegion]);

  useEffect(() => {
    if (user) {
      loadBookmarkStatus();
    }
  }, [user, featuredRecipes, searchResults]);

  const loadFeaturedRecipes = async () => {
    try {
      setLoading(true);
      const recipes = await getFeaturedRecipes();
      setFeaturedRecipes(recipes);
    } catch (error) {
      console.error('Error loading featured recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarkStatus = async () => {
    if (!user) return;
    
    const allRecipes = [...featuredRecipes, ...searchResults];
    const bookmarkStatuses = await Promise.all(
      allRecipes.map(recipe => checkBookmark(user.id, recipe.id))
    );
    
    const bookmarked = new Set<string>();
    allRecipes.forEach((recipe, index) => {
      if (bookmarkStatuses[index]) {
        bookmarked.add(recipe.id);
      }
    });
    
    setBookmarkedRecipes(bookmarked);
  };

  const handleSearch = async () => {
    if (!searchQuery && !selectedRegion) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const filters: SearchFilters = {
        query: searchQuery,
        region: selectedRegion || undefined
      };
      const recipes = await getRecipes(filters);
      setSearchResults(recipes);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setSearching(false);
    }
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

  const RecipeCard: React.FC<{ recipe: Recipe; featured?: boolean }> = ({ recipe, featured = false }) => {
    const isBookmarked = bookmarkedRecipes.has(recipe.id);
    
    return (
      <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
        featured ? 'md:col-span-2' : ''
      }`}>
        <div className="relative">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className={`w-full object-cover ${
              featured ? 'h-64' : 'h-48'
            }`}
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
          {featured && (
            <div className="absolute top-3 left-3 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 inline mr-1" />
              Unggulan
            </div>
          )}
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
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            Lihat Resep
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-700">Memuat resep unggulan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-900 to-amber-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Warisan Kuliner
              <span className="block text-amber-300">Nusantara</span>
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 mb-8 max-w-3xl mx-auto">
              Jelajahi kekayaan resep tradisional Indonesia yang telah diwariskan turun-temurun
            </p>
            
            {/* Search Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Cari resep tradisional..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                    >
                      {regions.map(region => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {(searchQuery || selectedRegion) && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Hasil Pencarian
                {searchQuery && (
                  <span className="text-amber-600"> "{searchQuery}"</span>
                )}
              </h2>
              {searching && (
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : !searching && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Tidak ada resep ditemukan
                </h3>
                <p className="text-gray-600">
                  Coba ubah kata kunci atau filter wilayah
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Recipes */}
      {!searchQuery && !selectedRegion && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Resep Unggulan
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Temukan resep-resep terpopuler dan terfavorit dari berbagai daerah di Indonesia
              </p>
            </div>
            
            {featuredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredRecipes.map((recipe, index) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    featured={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Belum ada resep unggulan
                </h3>
                <p className="text-gray-600">
                  Resep unggulan akan muncul di sini
                </p>
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link
                to="/recipes"
                className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Lihat Semua Resep
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;