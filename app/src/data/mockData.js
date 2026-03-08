export const seedCategories = [
  {
    category: 'Cinematic',
    items: [
      {
        id: 1,
        prompt: '--chaos 20 --ar 2:3 --sref 1335406569 --profile c6so3sz --sw 500 --stylize 1000 --v 6.1',
        images: [
          { url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        id: 2,
        prompt: '--ar 16:9 --style raw --sref random --v 6.1',
        images: [
          { url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800&auto=format&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1533167649158-6d508895b680?q=80&w=800&auto=format&fit=crop' }
        ]
      }
    ]
  },
  {
    category: '3D',
    items: [
      {
        id: 3,
        prompt: 'octane render, unreal engine 5, --ar 1:1 --stylize 250 --v 6.0',
        images: [
          { url: 'https://images.unsplash.com/photo-1616499370260-485b3e5ed653?q=80&w=800&auto=format&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop' }
        ]
      }
    ]
  },
  {
    category: 'Anime',
    items: [
      {
        id: 4,
        prompt: 'studio ghibli style, --ar 16:9 --niji 6 --s 400',
        images: [
          { url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1580477651156-0275815abb23?q=80&w=800&auto=format&fit=crop' }
        ]
      }
    ]
  }
];

export const categoriesList = ['All', 'Cinematic', '3D', 'Anime', 'Photography', 'Abstract'];
