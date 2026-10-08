const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const loadingIndicator = document.querySelector('#loading');
const errorElement = document.querySelector('#error');
const featuredBooksContainer = document.querySelector('#featured-books');
const searchResultsContainer = document.querySelector('#search-results');
const bookDetailsContainer = document.querySelector('#book-details');

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid API response.');
  }

  return data;
}

function showLoading() {
  loadingIndicator.style.display = 'block';
}

function hideLoading() {
  loadingIndicator.style.display = 'none';
}

function showError(message) {
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
}

function clearError() {
  errorElement.textContent = '';
  errorElement.classList.add('hidden');
}

function getAuthorNames(book) {
  return Array.isArray(book.author_name) && book.author_name.length > 0
    ? book.author_name.join(', ')
    : 'Unknown author';
}

function buildCoverUrl(coverId) {
  if (!coverId) {
    return '';
  }

  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

function createBookCard(book) {
  const title = book.title || 'Untitled book';
  const author = getAuthorNames(book);
  const publicationYear = book.first_publish_year ? `First published: ${book.first_publish_year}` : 'Year unavailable';
  const workKey = book.key || '';
  const coverId = book.cover_i;
  const coverUrl = buildCoverUrl(coverId);

  return `
    <article class="book-card">
      <img
        class="book-cover"
        src="${coverUrl || 'https://via.placeholder.com/220x220?text=No+cover'}"
        alt="Cover for ${title}"
        onerror="this.src='https://via.placeholder.com/220x220?text=No+cover'"
      />
      <div class="book-content">
        <h3>${title}</h3>
        <p class="book-meta">Author: ${author}</p>
        <p class="book-meta">${publicationYear}</p>
        <button type="button" data-work-key="${workKey}">View details</button>
      </div>
    </article>
  `;
}

function renderBooks(items, container, headingText) {
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = '<p class="empty-state">No books found for this search.</p>';
    return;
  }

  const cards = items.slice(0, 12).map((book) => createBookCard(book)).join('');
  container.innerHTML = `
    <h3>${headingText}</h3>
    <div class="book-grid">${cards}</div>
  `;
}

function renderFeaturedBooks(javascriptData, pythonData) {
  const javascriptBooks = Array.isArray(javascriptData.docs) ? javascriptData.docs : [];
  const pythonBooks = Array.isArray(pythonData.docs) ? pythonData.docs : [];

  featuredBooksContainer.innerHTML = `
    <section class="book-section">
      <h3>JavaScript Books</h3>
      <div class="book-grid">
        ${javascriptBooks.slice(0, 6).map((book) => createBookCard(book)).join('') || '<p class="empty-state">No JavaScript books found.</p>'}
      </div>
    </section>
    <section class="book-section">
      <h3>Python Books</h3>
      <div class="book-grid">
        ${pythonBooks.slice(0, 6).map((book) => createBookCard(book)).join('') || '<p class="empty-state">No Python books found.</p>'}
      </div>
    </section>
  `;
}

function normalizeWorkKey(workKey) {
  if (!workKey) {
    return '';
  }

  return workKey
    .replace(/^\/works\//, '')
    .replace(/\.json$/, '')
    .replace(/\/$/, '');
}

function getDescription(work) {
  if (!work || !work.description) {
    return 'No description available for this book.';
  }

  if (typeof work.description === 'string') {
    return work.description;
  }

  if (typeof work.description === 'object' && work.description.value) {
    return work.description.value;
  }

  return 'No description available for this book.';
}

function getSubjects(work) {
  if (!work || !Array.isArray(work.subjects) || work.subjects.length === 0) {
    return ['No subjects available.'];
  }

  return work.subjects.slice(0, 8);
}

function renderBookDetails(work) {
  const title = work?.title || 'Untitled book';
  const description = getDescription(work);
  const subjects = getSubjects(work);
  const coverId = Array.isArray(work?.covers) && work.covers.length > 0 ? work.covers[0] : work?.cover_edition_key;
  const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : 'https://via.placeholder.com/300x420?text=No+cover';

  const subjectList = subjects
    .map((subject) => `<li>${String(subject)}</li>`)
    .join('');

  bookDetailsContainer.innerHTML = `
    <article class="details-card">
      <img
        src="${coverUrl}"
        alt="Cover for ${title}"
        style="max-width: 220px; border-radius: 12px; margin-bottom: 1rem;"
        onerror="this.src='https://via.placeholder.com/300x420?text=No+cover'"
      />
      <h3>${title}</h3>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Subjects:</strong></p>
      <ul>${subjectList}</ul>
    </article>
  `;
}

async function searchBooks(query) {
  const safeQuery = (query || 'javascript').trim();
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(safeQuery)}`;

  clearError();
  showLoading();

  try {
    const data = await fetchJson(url);
    const books = Array.isArray(data.docs) ? data.docs : [];

    renderBooks(books, searchResultsContainer, `Results for "${safeQuery}"`);
  } catch (error) {
    console.error(error);
    showError(`Failed to load books. Please check your internet connection and try again.`);
    searchResultsContainer.innerHTML = '<p class="empty-state">No results to display.</p>';
  } finally {
    hideLoading();
  }
}

async function loadBookDetails(workKey) {
  const workId = normalizeWorkKey(workKey);

  if (!workId) {
    showError('Book details are unavailable for this item.');
    return;
  }

  clearError();
  showLoading();

  try {
    const url = `https://openlibrary.org/works/${workId}.json`;
    const work = await fetchJson(url);
    renderBookDetails(work);
  } catch (error) {
    console.error(error);
    showError('Failed to load details for this book. Please try again.');
  } finally {
    hideLoading();
  }
}

async function loadFeaturedBooks() {
  clearError();
  showLoading();

  try {
    const [javascriptData, pythonData] = await Promise.all([
      fetchJson('https://openlibrary.org/search.json?q=javascript'),
      fetchJson('https://openlibrary.org/search.json?q=python')
    ]);

    renderFeaturedBooks(javascriptData, pythonData);
  } catch (error) {
    console.error(error);
    showError('Failed to load featured books. Please check your internet connection and try again.');
    featuredBooksContainer.innerHTML = '<p class="empty-state">Featured books could not be loaded.</p>';
  } finally {
    hideLoading();
  }
}

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  await searchBooks(query || 'javascript');
});

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-work-key]');

  if (!button) {
    return;
  }

  const workKey = button.dataset.workKey;

  if (workKey) {
    await loadBookDetails(workKey);
  }
});

loadFeaturedBooks();
