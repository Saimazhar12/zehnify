import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { articleService } from '../services/articleService';
import { WellnessArticleSummary } from '../types';

function typeLabel(type: WellnessArticleSummary['type']) {
  return type === 'guide' ? 'Guide' : 'Article';
}

function typeBadgeClass(type: WellnessArticleSummary['type']) {
  return type === 'guide'
    ? 'bg-blue-100 text-blue-600'
    : 'bg-orange-100 text-orange-600';
}

const ResourcesSection: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<WellnessArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await articleService.getPublished();
        setArticles(data);
      } catch (error) {
        console.error('Failed to load wellness articles:', error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-5xl mx-auto w-full">
      <div className="bg-indigo-600 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20">
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Wellness Library</h2>
          <p className="text-indigo-100 text-sm sm:text-base">Curated content written by our clinical team to help you thrive.</p>
        </div>
        <Shield className="absolute -right-6 -bottom-6 w-40 h-40 text-indigo-500 opacity-50" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">Loading articles...</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 text-sm">
          No articles published yet. Check back soon.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <button
              key={article.id}
              type="button"
              onClick={() => navigate(`/app/resources/${article.id}`)}
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all text-left overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${typeBadgeClass(article.type)}`}>
                  {typeLabel(article.type)}
                </span>
                <span className="text-xs text-gray-400">{article.readTimeMinutes} min read</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{article.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{article.excerpt}</p>
              {article.author && (
                <p className="text-xs font-semibold text-indigo-600">
                  By Dr. {article.author.firstName} {article.author.lastName}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesSection;
