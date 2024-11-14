// 切换弹出框显示状态
function toggleSearchModal() {
    const modal = document.getElementById('search-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
  }
  
 
  window.onclick = function(event) {
    const modal = document.getElementById('search-modal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  }
  
  // 切换搜索栏的显示状态
function toggleSearchBar() {
    const searchBar = document.getElementById('search-bar');
    searchBar.classList.toggle('hidden');
  }
  