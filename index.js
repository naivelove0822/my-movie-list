const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
// 最後的分頁設定每頁十二筆資料
const MOVIES_PER_PAGE = 12

// 製作容器存放80個項目的陣列
const movies = []
// 搜尋功能的變數變成全域
let filteredMovies = []

// search功能存放DOM元件
const searchForm = document.querySelector('#search-form')

// search輸入功能
const searchInput = document.querySelector('#search-input')

// 找到資料主體的節點
const dataPanel = document.querySelector('#data-panel')
// 分頁位置的id
const paginator = document.querySelector('#paginator')
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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
      
`

  })
  dataPanel.innerHTML = rawHTML
}
// [分頁] 負責從總清單切割資料,回傳切割好的新陣列
function getMoviesByPage(page) {
  // [搜尋分頁]新增這裡 運用三元運算子 [? "A" : "B"] ture回傳A false回傳B => 已經有資料就回傳 搜尋內容 反之 全部電影清單
  const data = filteredMovies.length ? filteredMovies : movies
  // 計算起始的 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  // 回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// [分頁] 算出總頁碼後,製作同樣數量的page,並重新渲染頁面
// 用amount參數代表整數
function renderPaginator(amount) {
  // 計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  // 製作template 
  let rawHTML = ''
  // 用迴圈使總數資料在沒有全部分頁完成前會一直製作新的分頁後渲染
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>
    `
  }
  // 放回HTML
  paginator.innerHTML = rawHTML
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
// 新增對應 '+' 按鈕的函式並讓資料能對應id,主要為讓使用者點擊的電影送進local storage內儲存
// 用arrow實務上較常使用的方式簡短匿名函式
function addToFavorite(id) {
  // 取回localStorage內的資料,若回傳null則給空陣列
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // 在addToFavorit中傳入一個id,用find去電影總表中找出一樣的id回傳並暫存於movie,
  const movie = movies.find((movie) => movie.id === id)
  // 運用some查詢陣列裡有沒有 item 通過檢查條件,若id重複則回傳alert內容
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已存在收倉清單中!')
  }
  // 把movie推進收藏清單
  list.push(movie)
  // 呼叫localSorage.setItem,把更新後的清單同步到local stroage,並運用JSON.stringify把資料變成JSON字串
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}
// 設置監聽器,點擊ID相同的按鈕才會有反應,為監聽器函式命名方便除錯
dataPanel.addEventListener('click', function onPanelClicked(event) {

  // 利用dataset將指定id與對應的資料做處理
  // Number把dataset從字串改為數字
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    // 新增監聽點擊 "+" 時的監聽功能,同樣用ID綁定相同的資料ID,新增addToFavorit函式
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// [分頁]設置監聽器並一樣用dataset選取相同page目標
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 假設點的target不是 'A' [A = (<a></a>)]的話
  if (event.target.tagName !== 'A') return
  //重新渲染畫面讓正確頁數顯示出來 [主體畫面的分頁結束]
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

// 設置監聽器,監聽搜尋表單的提交(submit)事件,一樣為監聽器命名方便除錯
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //讓瀏覽器停止預設行為EX:輸入時重新整理介面
  // 新增搜尋功能的變數,運用value使輸入值回傳相同的值,運用toLowerCase使字串變小寫,用trim()去掉空白,防止搜尋空白.
  const keyword = searchInput.value.trim().toLowerCase()
  // 新增變數,用來存放搜尋結果
  // [搜尋分頁功能] 這裡本來有一個  let filteredMovies = [] 將filteredMoives這個變數變成全域

  // 方法一 用for迴圈去搜尋
  // for (const movie of movies) {
  // 設立條件式,運用toLowerCase把字串變成小寫,用includes判斷keyword內是否含有moive.title的字串
  // if (movie.title.toLowerCase().includes(keyword)) {
  // 把filteredMovies的資料推進movie內
  //     filteredMovies.push(movie)
  //   } 
  // }

  // 陣列操作三寶 map,filter,reduce

  // 方法二 運用filter,建立搜尋條件式=>moive內的資料與keyword的資料要有相關才會呈現在畫面上  
  // 匿名函式可以用箭頭替代 (function (movie) {} return => ((movie) => ....)省略return

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  // 優化使用者體驗,若輸入查不到的字會回傳下列內容
  if (filteredMovies.length === 0) {
    return alert('cannot find movie with keyword:' + keyword)
  }
  // [搜尋分頁]新增這裡
  renderPaginator(filteredMovies.length)
  // 使用rederMovieList函式,重新呼叫
  // [搜尋分頁]原本為 renderMovieList(filteredMovies),加入分頁後改為顯示從第一頁開始
  renderMovieList(getMoviesByPage(1))
})

// 用for迴圈取出陣列資料
// axios
//   .get(INDEX_URL)
//   .then((response) => {
//     for (const movie of response.data.results) {
//       movies.push(movie)
//     }
//     // 呼叫剛剛寫好的函式
//     renderMovieList(movies)
//   })



// 展開運算子作法 利用"..." 展開陣列元素
axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  // console.log(movies)
  // [分頁]呼叫renderPaginator函式傳入movies.length(電影資料長度(80))
  renderPaginator(movies.length)

  // [分頁] 將原本整個movies渲染結果變成按照頁面(1-12筆資料依序...)渲染結果
  renderMovieList(getMoviesByPage(1))
})