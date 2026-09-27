document.addEventListener("DOMContentLoaded", function() {
    // news.json फ़ाइल से खबरें लोड करने के लिए
    fetch('news.json')
        .then(response => response.json())
        .then(data => {
            const localNewsGrid = document.querySelector('.local-news-block .news-grid-2');
            if (localNewsGrid && data.length > 0) {
                // पुराने डमी कार्ड्स को साफ करें
                localNewsGrid.innerHTML = '';
                
                // जेसन फ़ाइल से एक-एक करके खबरें जोड़ें
                data.forEach(news => {
                    const newsCard = `
                        <div class="small-news-card">
                            <img src="${news.image}" alt="${news.title}">
                            <div class="small-news-content">
                                <span class="category-tag dark">${news.category}</span>
                                <h3>${news.title}</h3>
                                <p>${news.description}</p>
                            </div>
                        </div>
                    `;
                    localNewsGrid.innerHTML += newsCard;
                });
            }
        })
        .catch(error => console.error('खबरें लोड करने में एरर:', error));
});
