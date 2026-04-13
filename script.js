document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('card-container');
    const navbar = document.getElementById('navbar');
    const searchInput = document.getElementById('searchInput');
    const sectionTitle = document.getElementById('section-title');

    // ১. শুরুতে কিছু ডিফল্ট ম্যাঙ্গা দেখানোর জন্য ফাংশন
    async function fetchTrendingManga() {
        if (!cardContainer) return;
        cardContainer.innerHTML = '<p class="text-gray-400 col-span-full text-center py-10">Loading trending manga...</p>';
        
        try {
            // MangaDex API থেকে লেটেস্ট ম্যাঙ্গা নেওয়া হচ্ছে (HTTPS নিশ্চিত করা হয়েছে)
            const response = await fetch('https://api.mangadex.org/manga?limit=12&includes[]=cover_art&contentRating[]=safe&order[followedCount]=desc');
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                displayManga(data.data);
            } else {
                cardContainer.innerHTML = '<p class="text-gray-400 col-span-full text-center">No trending manga found.</p>';
            }
        } catch (error) {
            console.error("Error fetching manga:", error);
            cardContainer.innerHTML = '<p class="text-red-500 col-span-full text-center">Failed to load data. Please check your connection.</p>';
        }
    }

    // ২. ম্যাঙ্গা কার্ডগুলো রেন্ডার করার ফাংশন
    function displayManga(mangaList) {
        if (!cardContainer) return;
        cardContainer.innerHTML = '';
        
        mangaList.forEach(manga => {
            const id = manga.id;
            // টাইটেল হ্যান্ডেল করা (English টাইটেল না থাকলে জাপানিজ বা অল্টারনেটিভ দেখাচ্ছে)
            const attributes = manga.attributes;
            const title = attributes.title.en || Object.values(attributes.title)[0] || "Unknown Title";
            
            // কভার ইমেজ খুঁজে বের করা
            const coverRelationship = manga.relationships.find(r => r.type === 'cover_art');
            const coverFileName = coverRelationship ? coverRelationship.attributes.fileName : "";
            const coverUrl = coverFileName 
                ? `https://uploads.mangadex.org/covers/${id}/${coverFileName}.256.jpg` 
                : 'https://via.placeholder.com/300x450?text=No+Cover';

            const card = document.createElement('div');
            card.className = "group cursor-pointer";
            card.innerHTML = `
                <div class="relative overflow-hidden rounded-xl h-72 shadow-lg bg-zinc-900">
                    <img src="${coverUrl}" alt="${title}" 
                         class="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                         loading="lazy">
                    <div class="absolute top-2 left-2 bg-red-600 text-[10px] px-2 py-1 rounded font-bold uppercase">Active</div>
                    <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="openReader('${id}')" class="w-full bg-white text-black text-xs py-2 rounded font-bold hover:bg-red-600 hover:text-white transition">Read Now</button>
                    </div>
                </div>
                <h3 class="mt-3 font-medium text-sm group-hover:text-red-500 transition truncate px-1">${title}</h3>
                <p class="text-[11px] text-gray-500 tracking-wider uppercase px-1">${attributes.status || 'Manga'}</p>
            `;
            cardContainer.appendChild(card);
        });
    }

    // ৩. সার্চ ফাংশনালিটি
    if (searchInput) {
        searchInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query === "") return;

                if (sectionTitle) sectionTitle.innerText = `Search results for: ${query}`;
                cardContainer.innerHTML = '<p class="text-gray-400 col-span-full text-center py-10">Searching...</p>';

                try {
                    // encodeURIComponent ব্যবহার করা হয়েছে যাতে স্পেস বা স্পেশাল ক্যারেক্টার এরর না দেয়
                    const response = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=12&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`);
                    const data = await response.json();
                    
                    if (data.data && data.data.length > 0) {
                        displayManga(data.data);
                    } else {
                        cardContainer.innerHTML = `<p class="text-gray-400 col-span-full text-center">No results found for "${query}"</p>`;
                    }
                } catch (error) {
                    console.error("Search error:", error);
                    cardContainer.innerHTML = '<p class="text-red-500 col-span-full text-center">Error during search. Try again.</p>';
                }
            }
        });
    }

    // ৪. রিডার পেজে যাওয়ার ফাংশন
    window.openReader = function(mangaId) {
        if (!mangaId) return;
        window.location.href = `reader.html?id=${mangaId}`;
    };

    // ৫. স্ক্রল ইফেক্ট (Navbar)
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('bg-black/90', 'backdrop-blur-md', 'py-4');
                navbar.classList.remove('p-6');
            } else {
                navbar.classList.remove('bg-black/90', 'backdrop-blur-md', 'py-4');
                navbar.classList.add('p-6');
            }
        }
    });

    // শুরুতে ট্রেন্ডিং লোড করা
    fetchTrendingManga();
});