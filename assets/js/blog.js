// FILE: assets/js/blog.js

let blogAllPosts = [];
let blogFilteredPosts = [];
let blogCurrentPost = null;

document.addEventListener('DOMContentLoaded', () => {
    initBlogPage();
    initReadingProgress();
});

async function initBlogPage() {
    try {
        blogAllPosts = await loadBlogPosts();
        blogFilteredPosts = blogAllPosts.slice();
        renderBlogList();
        initBlogEvents();
        
        const urlId = getPostIdFromURL();
        if (urlId) {
            const post = blogAllPosts.find(p => p.id === urlId);
            if (post) {
                setActivePost(post);
                return;
            }
        }
        
        if (blogAllPosts.length > 0) {
            setActivePost(blogAllPosts[0]);
        }
    } catch (err) {
        console.error('Gagal memuat blog:', err);
    }
}

async function loadBlogPosts() {
    const res = await fetch('data/posts.json');
    if (!res.ok) throw new Error('Gagal memuat posts.json');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

function getPostIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function renderBlogList() {
    const listEl = document.getElementById('blog-list');
    const emptyEl = document.getElementById('blog-list-empty');
    if (!listEl || !emptyEl) return;

    listEl.innerHTML = '';
    
    if (!blogFilteredPosts.length) {
        emptyEl.hidden = false;
        return;
    }
    
    emptyEl.hidden = true;
    
    blogFilteredPosts.forEach(post => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'article-item-traditional';
        item.setAttribute('data-id', post.id);
        
        const dateLabel = formatBlogDate(post.date);
        const reading = post.reading_time ? `${post.reading_time} min` : '5 min';
        
        item.innerHTML = `
            <div class="item-category-traditional">${post.category || 'Artikel'}</div>
            <h3 class="item-title-traditional">${post.title}</h3>
            <div class="item-meta-traditional">
                <span>${dateLabel}</span>
                <span class="meta-sep-traditional">•</span>
                <span>${reading}</span>
            </div>
        `;
        
        item.addEventListener('click', () => {
            const fullPost = blogAllPosts.find(p => p.id === post.id);
            if (fullPost) setActivePost(fullPost);
        });
        
        listEl.appendChild(item);
    });
}

function setActivePost(post) {
    blogCurrentPost = post;
    renderBlogViewer(post);

    document.querySelectorAll('.article-item-traditional').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-id') === post.id);
    });

    const params = new URLSearchParams(window.location.search);
    params.set('id', post.id);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    
    const viewer = document.getElementById('blog-viewer-content');
    if (viewer) viewer.scrollTop = 0;
}

function renderBlogViewer(post) {
    const viewerEl = document.getElementById('blog-viewer-content');
    if (!viewerEl) return;

    const contentArray = Array.isArray(post.content) ? post.content : [post.content];
    const contentHTML = contentArray.map(para => `<p>${para}</p>`).join('');

    viewerEl.innerHTML = `
        <header class="article-header-traditional">
            <div class="header-category-traditional">${post.category || 'Artikel'}</div>
            <h1 class="article-title-traditional">${post.title}</h1>
            <div class="article-meta-traditional">
                <span>${formatBlogDate(post.date)}</span>
                <span class="meta-sep-traditional">•</span>
                <span>${post.reading_time || 5} menit baca</span>
            </div>
            ${post.excerpt ? `
                <div class="article-excerpt-traditional">
                    ${post.excerpt}
                </div>
            ` : ''}
            <div class="header-divider-traditional"></div>
        </header>
        <div class="article-body-traditional">
            ${contentHTML}
        </div>
    `;
}

function initReadingProgress() {
    const progressBar = document.getElementById('reading-progress');
    const viewer = document.getElementById('blog-viewer-content');
    
    if (!progressBar || !viewer) return;

    viewer.addEventListener('scroll', () => {
        const scrollTop = viewer.scrollTop;
        const scrollHeight = viewer.scrollHeight - viewer.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    });
}

function initBlogEvents() {
    const searchEl = document.getElementById('blog-search');
    if (!searchEl) return;

    searchEl.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            blogFilteredPosts = blogAllPosts.slice();
        } else {
            blogFilteredPosts = blogAllPosts.filter(post => {
                return post.title.toLowerCase().includes(query) ||
                       (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
                       (post.category && post.category.toLowerCase().includes(query)) ||
                       (post.tags && post.tags.some(t => t.toLowerCase().includes(query)));
            });
        }
        
        renderBlogList();
    });
}

function formatBlogDate(dateStr) {
    const d = new Date(dateStr);
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
