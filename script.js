document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('card-container');
    const navbar = document.getElementById('navbar');
    const searchInput = document.getElementById('searchInput');
    const sectionTitle = document.getElementById('section-title');

    // ১. CORS Proxy URL (অবশ্যই cors-anywhere অ্যাক্সেস থাকতে হবে)
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";

    // ২. শুরুতে ট্রেন্ডিং ম্যাঙ্গা লোড করার ফাংশন
    async function fetchTrendingManga() {
        if (!cardContainer) return;
        cardContainer.innerHTML = '<p class="text-gray-400 col-span-full text-center py-10">Loading trending manga...</p>';
        
        // সব ডাটা এবং কভার ইমেজ পেতে 'includes[]=cover_art' ব্যবহার করা হয়েছে
        const apiUrl = 'https://api.mangadex.org/manga?limit=24&includes[]=cover_art&contentRating[]=safe&order[followedCount]=desc';
        
        try {
            const response = await fetch(proxyUrl + apiUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            displayManga(data.data);
        } catch (error) {
            console.error("Trending fetch error:", error);
            cardContainer.innerHTML = `
                <p class="text-red-500 col-span-full text-center px-4">
                    API Error. Please request temporary access at 
                    <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" class="underline font-bold text-white">CORS Anywhere</a> 
                    and then refresh the page.
                </p>`;
        }
    }

    // ৩. ম্যাঙ্গা কার্ড রেন্ডার করার ফাংশন (ইমেজ লজিক আপডেট করা হয়েছে)
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

            // এখানে পরিবর্তন করা হয়েছে যাতে ফাইলনেম পাওয়া না গেলেও placeholder দেখায় এবং লোগো না আসে
            if (coverArt && coverArt.attributes && coverArt.attributes.fileName) {
                const fileName = coverArt.attributes.fileName;
                // ইমেজ লিঙ্কে প্রক্সি দরকার নেই, সরাসরি দিলে লোড হওয়ার সম্ভাবনা বেশি
                coverUrl = `https://uploads.mangadex.org/covers/${id}/${fileName}.256.jpg`;
            } else if (coverArt && !coverArt.attributes) {
                // API সরাসরি attributes না দিলে ব্যাকআপ হিসেবে placeholder
                coverUrl = 'https://via.placeholder.com/300x450?text=Fetching+Image';
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

    // ৪. সার্চ ফাংশনালিটি (লিমিট ১০০ করা হয়েছে যাতে সব রেজাল্ট পাওয়া যায়)
    if (searchInput) {
        searchInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query === "") return;

                if (sectionTitle) sectionTitle.innerText = `Search results for: ${query}`;
                cardContainer.innerHTML = '<p class="text-gray-400 col-span-full text-center py-10">Searching all related manga...</p>';

                const searchApiUrl = `https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=100&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`;

                try {
                    const response = await fetch(proxyUrl + searchApiUrl);
                    if (!response.ok) throw new Error('Search failed');
                    const data = await response.json();
                    displayManga(data.data);
                } catch (error) {
                    console.error("Search error:", error);
                    cardContainer.innerHTML = '<p class="text-red-500 col-span-full text-center">Search failed. Please check your CORS access.</p>';
                }
            }
        });
    }

    // ৫. রিডার পেজ ওপেন করা
    window.openReader = function(mangaId) {
        if (mangaId) {
            window.location.href = `reader.html?id=${mangaId}`;
        }
    };

    // ৬. ন্যাভবার স্ক্রল ইফেক্ট
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



/* for phone*/

const menuBtn = document.getElementById('menu-btn');
const navMenu = document.getElementById('nav-menu');
const menuIcon = document.getElementById('menu-icon');

menuBtn.addEventListener('click', () => {
    // মেনু শো/হাইড করা
    navMenu.classList.toggle('hidden');
    navMenu.classList.toggle('flex');

    // আইকন পরিবর্তন (হামবুর্গার থেকে ক্রস)
    if (menuIcon.classList.contains('fa-bars')) {
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-times');
    } else {
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
    }
});