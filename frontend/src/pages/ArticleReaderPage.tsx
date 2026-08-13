import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2, User } from 'lucide-react';
import { articleService } from '../services/articleService';
import { WellnessArticleDetail } from '../types';

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function ArticleReaderPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<WellnessArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId) return;

    const load = async () => {
      try {
        const data = await articleService.getById(articleId);
        setArticle(data);
      } catch {
        setError('Article not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-500 mb-4">{error ?? 'Article unavailable.'}</p>
        <button
          type="button"
          onClick={() => navigate('/app/resources')}
          className="text-indigo-600 font-semibold hover:underline"
        >
          Back to Wellness Library
        </button>
      </div>
    );
  }

  const authorName = article.author
    ? `Dr. ${article.author.firstName} ${article.author.lastName}`
    : 'Clinical Team';

  const typeLabel = article.type === 'guide' ? 'Guide' : 'Article';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
      <Link
        to="/app/resources"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Wellness Library
      </Link>

      <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 sm:p-8 text-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
              {typeLabel}
            </span>
            <span className="text-xs text-indigo-100">{article.readTimeMinutes} min read</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight break-words">{article.title}</h1>
          <p className="text-indigo-100 mt-3 text-sm md:text-base">{article.excerpt}</p>
        </div>

        <div className="px-4 sm:px-8 py-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{authorName}</p>
            <p className="text-xs text-gray-500">
              Published {new Date(article.createdAt).toLocaleDateString([], {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <BookOpen className="w-5 h-5 text-gray-300 ml-auto" />
        </div>

        <div className="px-4 sm:px-8 py-5 sm:py-8 space-y-5 text-gray-700 leading-relaxed">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-base">
              {renderInlineMarkdown(paragraph)}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
