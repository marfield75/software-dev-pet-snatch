// 控制菜单显示和隐藏
document.getElementById("searchDropdown").addEventListener("click", function (event) {
    event.preventDefault(); // 防止默认行为
    const dropdownMenu = document.querySelector('.dropdown-menu');
    dropdownMenu.classList.toggle("show");
  });
  
