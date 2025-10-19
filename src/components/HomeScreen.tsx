import { useState, useRef, useEffect } from 'react';
import postsData from '../json/posts.json';

type Post = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  author: string;
  date: string;
  audioPreview?: string;
};

type Props = {
  onStartJamming: () => void;
};

const HomeScreen = ({ onStartJamming }: Props) => {
  const posts: Post[] = postsData;
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});

  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  const togglePlay = (postId: number) => {
    const audio = audioRefs.current[postId];
    if (!audio) return;

    if (playingId === postId) {
      audio.pause();
      setPlayingId(null);
    } else {
      Object.values(audioRefs.current).forEach(a => {
        if (a) {
          a.pause();
          a.currentTime = 0;
        }
      });
      
      audio.play();
      setPlayingId(postId);
    }
  };

  const handleAudioEnded = (postId: number) => {
    if (playingId === postId) {
      setPlayingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-neo-bg p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-black text-black mb-4 tracking-tighter"
              style={{ 
                textShadow: '6px 6px 0px #ff006e, 12px 12px 0px #00d9ff'
              }}>
            TREACKTER
          </h1>
          <p className="text-2xl font-bold text-black mb-6">
            Discover Fresh Beats & Create Your Own! 🎵
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div 
              key={post.id}
              className="bg-white border-4 border-black p-6 shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-black text-black mb-2">
                  {post.title}
                </h2>
                <p className="text-sm font-bold text-gray-600 mb-3">
                  by {post.author} • {post.date}
                </p>
              </div>

              <p className="text-base font-medium text-black mb-4">
                {post.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="bg-neo-cyan border-2 border-black px-3 py-1 text-xs font-black uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {post.audioPreview && (
                <>
                  <audio
                    ref={el => audioRefs.current[post.id] = el}
                    src={post.audioPreview}
                    onEnded={() => handleAudioEnded(post.id)}
                  />
                  <button
                    onClick={() => togglePlay(post.id)}
                    className="w-full bg-neo-lime border-3 border-black px-4 py-2 text-lg font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mb-2"
                  >
                    {playingId === post.id ? '⏸ PAUSE' : '▶ PLAY PREVIEW'}
                  </button>
                </>
              )}

              <button
                onClick={onStartJamming}
                className="w-full bg-neo-pink border-3 border-black px-4 py-2 text-lg font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Create Similar →
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={onStartJamming}
            className="bg-neo-yellow border-6 border-black px-12 py-4 text-3xl font-black uppercase shadow-brutal-lg hover:shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 transition-all active:translate-x-2 active:translate-y-2 active:shadow-none"
          >
            START CREATING YOUR OWN! 🎹
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
