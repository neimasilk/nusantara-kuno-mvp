import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Bookmark, TrendingUp, Clock, Users, Edit3, Save, X } from 'lucide-react';
import { Recipe, UserProfile, UserProgress } from '../types';
import { getUserBookmarks, getUserProgress, getUserProfile, updateUserProfile } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'progress'>('bookmarks');
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<Recipe[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: ''
  });

  const regions = {
    'jawa': 'Jawa',
    'sumatera': 'Sumatera',
    'kalimantan': 'Kalimantan',
    'sulawesi': 'Sulawesi',
    'bali_nusa_tenggara': 'Bali & Nusa Tenggara',
    'maluku_papua': 'Maluku & Papua'
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [bookmarks, progress, profile] = await Promise.all([
        getUserBookmarks(user.id),
        getUserProgress(user.id),
        getUserProfile(user.id)
      ]);
      
      setBookmarkedRecipes(bookmarks);
      setUserProgress(progress);
      setUserProfile(profile);
      
      if (profile) {
        setProfileForm({
          full_name: profile.full_name || '',
          bio: profile.bio || ''
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    try {
      const updatedProfile = await updateUserProfile(user.id, profileForm);
      setUserProfile(updatedProfile);
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const cancelEdit = () => {
    setEditingProfile(false);
    if (userProfile) {
      setProfileForm({
        full_name: userProfile.full_name || '',
        bio: userProfile.bio || ''
      });
    }
  };

  const getProgressStats = () => {
    const totalRecipes = userProgress.length;
    const completedRecipes = userProgress.filter(p => p.progress_percentage >= 100).length;
    const inProgressRecipes = userProgress.filter(p => p.progress_percentage > 0 && p.progress_percentage < 100).length;
    const averageProgress = totalRecipes > 0 
      ? userProgress.reduce((sum, p) => sum + p.progress_percentage, 0) / totalRecipes 
      : 0;
    
    return {
      totalRecipes,
      completedRecipes,
      inProgressRecipes,
      averageProgress
    };
  };

  const stats = getProgressStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-700">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                {editingProfile ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Nama lengkap"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Bio singkat tentang Anda"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {userProfile?.full_name || user?.email?.split('@')[0] || 'Pengguna'}
                    </h1>
                    <p className="text-gray-600">{user?.email}</p>
                    {userProfile?.bio && (
                      <p className="text-gray-700 mt-1">{userProfile.bio}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {editingProfile ? (
                <>
                  <button
                    onClick={handleProfileUpdate}
                    className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Simpan
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batal
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">{bookmarkedRecipes.length}</div>
            <div className="text-sm text-gray-600">Resep Disimpan</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.completedRecipes}</div>
            <div className="text-sm text-gray-600">Resep Selesai</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.inProgressRecipes}</div>
            <div className="text-sm text-gray-600">Sedang Dimasak</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{Math.round(stats.averageProgress)}%</div>
            <div className="text-sm text-gray-600">Rata-rata Progress</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'bookmarks'
                    ? 'bg-amber-50 text-amber-600 border-b-2 border-amber-600'
                    : 'text-gray-600 hover:text-amber-600'
                }`}
              >
                <Bookmark className="w-5 h-5 inline mr-2" />
                Resep Disimpan ({bookmarkedRecipes.length})
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'progress'
                    ? 'bg-amber-50 text-amber-600 border-b-2 border-amber-600'
                    : 'text-gray-600 hover:text-amber-600'
                }`}
              >
                <TrendingUp className="w-5 h-5 inline mr-2" />
                Progress Memasak ({userProgress.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'bookmarks' && (
              <div>
                {bookmarkedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarkedRecipes.map(recipe => (
                      <div key={recipe.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-amber-600 font-medium">
                              {regions[recipe.region as keyof typeof regions] || recipe.region}
                            </span>
                            <span className="text-sm text-gray-500 capitalize">
                              {recipe.difficulty}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{recipe.title}</h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
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
                            className="block w-full text-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                          >
                            Lihat Resep
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Belum ada resep yang disimpan
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Mulai simpan resep favorit Anda untuk akses yang mudah
                    </p>
                    <Link
                      to="/recipes"
                      className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Jelajahi Resep
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                {userProgress.length > 0 ? (
                  <div className="space-y-4">
                    {userProgress.map(progress => (
                      <div key={progress.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{progress.recipe?.title}</h3>
                            <p className="text-sm text-gray-600">
                              Terakhir diperbarui: {new Date(progress.updated_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-amber-600">
                              {Math.round(progress.progress_percentage)}%
                            </div>
                            <div className="text-sm text-gray-600">
                              {progress.progress_percentage >= 100 ? 'Selesai' : 'Dalam Progress'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                progress.progress_percentage >= 100 ? 'bg-green-600' : 'bg-amber-600'
                              }`}
                              style={{ width: `${progress.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{progress.recipe?.cooking_time} menit</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{progress.recipe?.servings} porsi</span>
                            </div>
                          </div>
                          
                          <Link
                            to={`/recipes/${progress.recipe_id}`}
                            className="inline-flex items-center px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm"
                          >
                            {progress.progress_percentage >= 100 ? 'Lihat Resep' : 'Lanjutkan'}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Belum ada progress memasak
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Mulai memasak resep untuk melacak progress Anda
                    </p>
                    <Link
                      to="/recipes"
                      className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Mulai Memasak
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;