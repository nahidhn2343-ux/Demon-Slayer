document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('card-container');
    const navbar = document.getElementById('navbar');
    const searchInput = document.getElementById('searchInput');
    const sectionTitle = document.getElementById('section-title');

    // ১. শুরুতে কিছু ডিফল্ট ম্যাঙ্গা দেখানোর জন্য ফাংশন
    async function fetchTrendingManga() {
        cardContainer.innerHTML = '<p class="text-gray-400">Loading trending manga...</p>';
        try {
            // MangaDex API থেকে লেটেস্ট ম্যাঙ্গা নেওয়া হচ্ছে
            const response = await fetch('https://api.mangadex.org/manga?limit=12&includes[]=cover_art&contentRating[]=safe');
            const data = await response.json();
            displayManga(data.data);
        } catch (error) {
            console.error("Error fetching manga:", error);
            cardContainer.innerHTML = '<p class="text-red-500">Failed to load data.</p>';
        }
    }

    // ২. ম্যাঙ্গা কার্ডগুলো রেন্ডার করার ফাংশন
    function displayManga(mangaList) {
        cardContainer.innerHTML = '';
        mangaList.forEach(manga => {
            const id = manga.id;
            const title = manga.attributes.title.en || manga.attributes.title.ja || "Unknown Title";
            
            // কভার ইমেজ খুঁজে বের করা
            const coverRelationship = manga.relationships.find(r => r.type === 'cover_art');
            const coverFileName = coverRelationship ? coverRelationship.attributes.fileName : "";
            const coverUrl = coverFileName 
                ? `https://uploads.mangadex.org/covers/${id}/${coverFileName}.256.jpg` 
                : 'https://via.placeholder.com/300x450?text=No+Cover';

            const card = document.createElement('div');
            card.className = "group cursor-pointer";
            card.innerHTML = `
                <div class="relative overflow-hidden rounded-xl h-72 shadow-lg">
                    <img src="${coverUrl}" alt="${title}" 
                         class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                    <div class="absolute top-2 left-2 bg-red-600 text-[10px] px-2 py-1 rounded font-bold uppercase">Active</div>
                    <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="openReader('${id}')" class="w-full bg-white text-black text-xs py-2 rounded font-bold">Read Now</button>
                    </div>
                </div>
                <h3 class="mt-3 font-medium text-sm group-hover:text-red-500 transition truncate">${title}</h3>
                <p class="text-[11px] text-gray-500 tracking-wider uppercase">${manga.attributes.status || 'Manga'}</p>
            `;
            cardContainer.appendChild(card);
        });
    }

    // ৩. সার্চ ফাংশনালিটি
    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query === "") return;

            sectionTitle.innerText = `Search results for: ${query}`;
            cardContainer.innerHTML = '<p class="text-gray-400">Searching...</p>';

            try {
                const response = await fetch(`https://api.mangadex.org/manga?title=${query}&limit=12&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`);
                const data = await response.json();
                displayManga(data.data);
            } catch (error) {
                console.error("Search error:", error);
            }
        }
    });

    // ৪. রিডার পেজে যাওয়ার ফাংশন (গ্লোবাল স্কোপে রাখা হয়েছে যাতে HTML থেকে কাজ করে)
    window.openReader = function(mangaId) {
        window.location.href = `reader.html?id=${mangaId}`;
    };

    // ৫. স্ক্রল ইফেক্ট
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }
    });

    // শুরুতে ট্রেন্ডিং লোড করা
    fetchTrendingManga();
});