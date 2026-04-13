document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('card-container');
    const navbar = document.getElementById('navbar');
    const searchInput = document.getElementById('searchInput');
    const sectionTitle = document.getElementById('section-title');

    // CORS Proxy URL
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";

    // ১. শুরুতে ট্রেন্ডিং ম্যাঙ্গা লোড করার ফাংশন
    async function fetchTrendingManga() {
        if (!cardContainer) return;
        cardContainer.innerHTML = '<p class="text-gray-400 col-span-full text-center py-10">Loading trending manga...</p>';
        
        try {
            // Trendings-এও সব ডাটা পেতে includes[]=cover_art মাস্ট
            const apiUrl = 'https://api.mangadex.org/manga?limit=24&includes[]=cover_art&contentRating[]=safe&order[followedCount]=desc';
            const response = await fetch(apiUrl);
            const data = await response.json();
            displayManga(data.data);
        } catch (error) {
            try {
                const response = await fetch(proxyUrl + 'https://api.mangadex.org/manga?limit=24&includes[]=cover_art&contentRating[]=safe');
                const data = await response.json();
                displayManga(data.data);
            } catch (e) {
                cardContainer.innerHTML = '<p class="text-red-500 col-span-full text-center">API Error. Please check CORS access.</p>';
            }
        }
    }

    // ২. ম্যাঙ্গা কার্ড রেন্ডার করার আপডেট করা ফাংশন (ইমেজ ফিক্সড)
    function displayManga(mangaList) {
        if (!cardContainer) return;
        cardContainer.innerHTML = '';
        
        if (!mangaList || mangaList.length === 0) {
            cardContainer.innerHTML = '<p class="text-gray-400 col-span-full text-center py-10">No manga found.</p>';
            return;
        }

        mangaList.forEach(manga => {
            const id = manga.id;
            const attributes = manga.attributes;
            const title = attributes.title.en || Object.values(attributes.title)[0] || "Unknown Title";
            
            // নিখুঁত ইমেজ লজিক: relationships এর ভেতর থেকে cover_art খুঁজে বের করা
            const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
            let coverUrl = 'https://via.placeholder.com/300x450?text=No+Cover';

            if (coverArt && coverArt.attributes && coverArt.attributes.fileName) {
                // সরাসরি attributes এর ভেতরে fileName থাকলে
                const fileName = coverArt.attributes.fileName;
                coverUrl = `https://uploads.mangadex.org/covers/${id}/${fileName}.256.jpg`;
            } else if (coverArt && !coverArt.attributes) {
                /* কিছু ক্ষেত্রে API সরাসরি attributes দেয় না, তখন 'includes[]' কাজ না করলে 
                   এই অংশটি ব্যাকআপ হিসেবে কাজ করবে। তবে আমাদের API কলে 'includes[]' আছে।
                */
                coverUrl = 'https://www.mangadex.org/assets/images/manga-placeholder.png';
            }

            const card = document.createElement('div');
            card.className = "group cursor-pointer";
            card.innerHTML = `
                <div class="relative overflow-hidden rounded-xl h-72 shadow-lg bg-zinc-900">
                    <img src="${coverUrl}" alt="${title}" 
                         class="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/300x450?text=Image+Not+Found'">
                    <div class="absolute top-2 left-2 bg-red-600 text-[10px] px-2 py-1 rounded font-bold uppercase">Active</div>
                    <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="openReader('${id}')" class="w-full bg-white text-black text-xs py-2 rounded font-bold">Read Now</button>
                    </div>
                </div>
                <h3 class="mt-3 font-medium text-sm group-hover:text-red-500 transition truncate">${title}</h3>
                <p class="text-[11px] text-gray-500 tracking-wider uppercase">${attributes.status || 'Manga'}</p>
            `;
            cardContainer.appendChild(card);
        });
    }

    // ৩. সার্চ ফাংশনালিটি (সব রেজাল্ট পাওয়ার জন্য লিমিট ১০০)
    if (searchInput) {
        searchInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query === "") return;

                if (sectionTitle) sectionTitle.innerText = `Search results for: ${query}`;
                cardContainer.innerHTML = '<p class="text-gray-400 col-span-full text-center py-10">Searching all related manga...</p>';

                // contentRating সবগুলো যোগ করা হয়েছে যাতে বেশি রেজাল্ট আসে
                const searchApiUrl = `https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=100&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`;

                try {
                    const response = await fetch(searchApiUrl);
                    const data = await response.json();
                    displayManga(data.data);
                } catch (error) {
                    try {
                        const response = await fetch(proxyUrl + searchApiUrl);
                        const data = await response.json();
                        displayManga(data.data);
                    } catch (e) {
                        cardContainer.innerHTML = '<p class="text-red-500 col-span-full text-center">Search failed. Check your CORS access.</p>';
                    }
                }
            }
        });
    }

    // ৪. রিডার পেজ ওপেন করা
    window.openReader = function(mangaId) {
        if (mangaId) {
            window.location.href = `reader.html?id=${mangaId}`;
        }
    };

    // ৫. ন্যাভবার স্ক্রল ইফেক্ট (আপনার আগের লজিক)
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('nav-scrolled');
            } else {
                navbar.classList.remove('nav-scrolled');
            }
        }
    });

    fetchTrendingManga();
});