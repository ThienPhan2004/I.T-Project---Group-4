// Hàm cuộn lên đầu trang
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // Cuộn mượt mà
  });
}

// Hiện nút khi cuộn xuống
window.onscroll = function () {
  const button = document.getElementById("scrollToTop");
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    button.style.display = "block"; // Hiện nút
  } else {
    button.style.display = "none"; // Ẩn nút
  }
};