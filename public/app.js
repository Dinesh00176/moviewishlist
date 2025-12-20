const API_URL = '/movies';
const movieGrid = document.getElementById('movie-grid');
const movieCount = document.getElementById('movie-count');
const addMovieForm = document.getElementById('add-movie-form');
const movieTitleInput = document.getElementById('movie-title');

const movieYearInput = document.getElementById('movie-year');
const movieRatingInput = document.getElementById('movie-rating');
const movieGenreInput = document.getElementById('movie-genre');
const movieImageInput = document.getElementById('movie-image');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Only fetch movies if we are on a page with the grid
    if (movieGrid) {
        fetchMovies();
    }
});

// Fetch Movies
async function fetchMovies() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch movies');
        const movies = await response.json();
        renderMovies(movies);
    } catch (error) {
        console.error('Error:', error);
        movieGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--danger);">Failed to load movies. Please try again.</p>`;
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

// Add Movie
// Add Movie Listener
if (addMovieForm) {
    addMovieForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Gather values
        const title = movieTitleInput.value.trim();
        const releaseYearStr = movieYearInput.value;
        const ratingStr = movieRatingInput.value;
        const genre = movieGenreInput.value.trim();
        const image = movieImageInput.value.trim();

        // Validation 1: Required text fields
        if (!title || !genre) {
            showToast('Please enter a title and genre.', 'error');
            return;
        }

        // Validation 2: Integer parsing
        const releaseYear = Number(releaseYearStr);
        const rating = Number(ratingStr);

        // Strict Integer Check for Year
        if (!Number.isInteger(releaseYear) || releaseYear < 1888 || releaseYear > 2100) {
            showToast('Year must be a valid integer between 1888 and 2100.', 'error');
            return;
        }

        // Strict Integer Check for Rating
        if (!Number.isInteger(rating) || rating < 0 || rating > 10) {
            showToast('Rating must be an integer between 0 and 10.', 'error');
            return;
        }

        setLoading(true);

        const movieData = {
            title,
            releaseYear,
            rating,
            genre,
            image
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movieData),
            });

            if (!response.ok) throw new Error('Failed to add movie');

            // Reset form
            addMovieForm.reset();
            // If on home page, we might not have grid, but if we do, refresh it
            if (movieGrid) fetchMovies();
            showToast(`${title} added to collection!`, 'success');
        } catch (error) {
            console.error('Error:', error);
            showToast('Failed to connect to server.', 'error');
        } finally {
            setLoading(false);
        }
    });
}

// Loading state helper
function setLoading(isLoading) {
    if (!addMovieForm) return;
    const btn = addMovieForm.querySelector('button');
    if (isLoading) {
        btn.textContent = 'Adding...';
        btn.disabled = true;
        btn.style.opacity = '0.7';
    } else {
        btn.innerHTML = '<span class="icon">+</span> Add to Collection';
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

// Event Delegation for Delete
if (movieGrid) {
    movieGrid.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const card = deleteBtn.closest('.movie-card');
            const id = card.dataset.id;
            deleteMovie(id);
        }
    });
}

// Delete Movie Logic
async function deleteMovie(id) {
    if (!confirm('Are you sure you want to remove this movie?')) return;

    // Optimistic removal
    const card = document.querySelector(`.movie-card[data-id="${id}"]`);
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete movie');
        fetchMovies();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete movie');
        if (card) {
            card.style.opacity = '1';
            card.style.transform = 'none';
        }
    }
}


// Render Movies
function renderMovies(movies) {
    if (!movieGrid) return;

    movieGrid.innerHTML = '';
    const countBadge = document.getElementById('movie-count');
    if (countBadge) {
        countBadge.textContent = `${movies.length} movie${movies.length !== 1 ? 's' : ''}`;
    }

    if (movies.length === 0) {
        movieGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
            <p>No movies in your list yet.</p>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">Add one above to get started!</p>
        </div>
    `;
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.dataset.id = movie._id;

        // Fallback image if none provided or error
        const imageUrl = movie.image || `https://via.placeholder.com/300x450/222222/cccccc?text=${encodeURIComponent(movie.title)}`;

        card.innerHTML = `
        <div class="card-poster">
            <img src="${imageUrl}" class="card-bg-image" alt="${escapeHtml(movie.title)}" 
                    onerror="this.src='https://via.placeholder.com/300x450/222222/cccccc?text=No+Poster'">
            <div class="poster-overlay">
                <button class="delete-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Remove
                </button>
            </div>
        </div>
        
        <div class="card-info-below">
            <h3 class="movie-title" title="${escapeHtml(movie.title)}">${escapeHtml(movie.title)}</h3>
            <div class="movie-meta">
                <span class="meta-rating">★ ${movie.rating !== undefined ? movie.rating : '-'}</span>
                <span class="meta-genre">${escapeHtml(movie.genre || 'General')} • ${movie.releaseYear || ''}</span>
            </div>
        </div>
    `;
        movieGrid.appendChild(card);
    });
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}


