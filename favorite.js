const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

// 製作容器放入localStorage內的項目
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

// search功能存放DOM元件
const searchForm = document.querySelector('#search-form')

// search輸入功能
const searchInput = document.querySelector('#search-input')

// 找到資料主體的節點
const dataPanel = document.querySelector('#data-panel')
// 用renderMovieList接受外面傳進來的陣列
function renderMovieList(data) {

  let rawHTML = ''
  // 利用forEach把每筆資料提出來
  data.forEach(function (item) {
    // console.log(item)
    // 運用template literal印出每筆資料
    rawHTML += `
<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
      
`

  })
  dataPanel.innerHTML = rawHTML
}
// 找到對應的ID
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalData = document.querySelector('#movie-modal-data')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(function (response) {
    // 資料會放在response.data.results內創造變數讓後面的CDOE能整齊
    const data = response.data.results
    modalTitle.innerText = data.title
    modalData.innerText = 'Release data:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
    <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">
    `
  })
}

// 設置監聽器,點擊ID相同的按鈕才會有反應,為監聽器函式命名方便除錯
dataPanel.addEventListener('click', function onPanelClicked(event) {

  // 利用dataset將指定id與對應的資料做處理
  // Number把dataset從字串改為數字
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    // 將 + 改成 X 後新增監聽器 點選X時可以呼叫函式
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

// 放入新的函式
function removeFromFavorite (id) {
  // 設立條件式若取得movie沒有資料就return防止movies是空陣列
  if(!movies || !movies.length) return
// 設立新的變數用findIndex去尋找點選位置(透過id找到要刪除的電影)(只會回傳位置不會回傳元素)
  const movieIndex =movies.findIndex((movie) => movie.id === id)
  // 一樣新增條件式若找不到位置就會return
  if(movieIndex === -1) return

  // 刪除電影
 movies.splice(movieIndex, 1)
// 存回local Storage
localStorage.setItem('favoriteMovies', JSON.stringify(movies))
// 更新頁面
renderMovieList(movies)
}


// 重新呼叫函式套入更改後的movies
renderMovieList(movies)